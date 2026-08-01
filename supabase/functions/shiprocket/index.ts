import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SHIPROCKET_EMAIL = Deno.env.get("SHIPROCKET_EMAIL")!;
const SHIPROCKET_PASSWORD = Deno.env.get("SHIPROCKET_PASSWORD")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const API = "https://apiv2.shiprocket.in/v1/external";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ---- Auth token cache (in-memory per isolate) ----
let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token;
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok || !data?.token) {
    throw new Error(data?.message || "Shiprocket authentication failed");
  }
  // Shiprocket tokens last 10 days; cache for 6 hours
  cachedToken = { token: data.token, expires: Date.now() + 6 * 60 * 60 * 1000 };
  return data.token;
}

async function sr(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getSettings() {
  const { data } = await admin
    .from("store_settings")
    .select("pickup_pincode, pickup_address, shiprocket_enabled, shiprocket_fallback_message, whatsapp_support_number")
    .eq("id", "default")
    .maybeSingle();
  return data;
}

// Air couriers band; Delhivery Surface preferred
const isAir = (name: string) => /air|express air|\bair\b/i.test(name);
const isDelhivery = (name: string) => /delhivery/i.test(name);

function pickCourier(list: any[]) {
  const surface = list.filter((c) => {
    const name = String(c.courier_name || "");
    if (isAir(name)) return false;
    // is_surface===0 means air mode in Shiprocket payloads
    if (c.is_surface === 0 || c.is_surface === false) return false;
    return true;
  });
  const pool = surface.length ? surface : list.filter((c) => !isAir(String(c.courier_name || "")));
  if (!pool.length) return null;

  const sorted = [...pool].sort((a, b) => Number(a.rate) - Number(b.rate));
  const cheapest = sorted[0];
  // Prefer Delhivery Surface, but never charge the customer a lot more for it
  const delhivery = sorted.find((c) => isDelhivery(String(c.courier_name || "")));
  if (delhivery && Number(delhivery.rate) <= Number(cheapest.rate) * 1.1) return delhivery;
  return cheapest;
}

// Billable weight = max(actual, volumetric). Shiprocket surface divisor = 5000
function billableWeight(weight: number, l?: number, b?: number, h?: number) {
  const vol = l && b && h ? (l * b * h) / 5000 : 0;
  return Math.max(0.5, Number(Math.max(weight || 0, vol).toFixed(2)));
}

async function resolvePickupLocation(pincode?: string | null): Promise<string> {
  const res = await sr("/settings/company/pickup");
  const list = res.data?.data?.shipping_address || [];
  if (!list.length) return "Primary";
  const match = list.find((l: any) => String(l.pin_code) === String(pincode));
  return (match || list[0]).pickup_location || "Primary";
}

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user) return null;
  const { data: role } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return role ? user : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    // ---------- PUBLIC: real-time rate + delivery days ----------
    if (action === "serviceability") {
      const settings = await getSettings();
      const pickup = String(body.pickup_pincode || settings?.pickup_pincode || "854105");
      const delivery = String(body.delivery_pincode || "").trim();
      const weight = billableWeight(
        Number(body.weight || 0.5),
        Number(body.length || 0),
        Number(body.breadth || 0),
        Number(body.height || 0)
      );

      if (!/^\d{6}$/.test(delivery)) {
        return json({ success: false, error: "Valid 6-digit pincode required" }, 400);
      }

      const dims =
        body.length && body.breadth && body.height
          ? `&length=${Number(body.length)}&breadth=${Number(body.breadth)}&height=${Number(body.height)}`
          : "";

      const { ok, data } = await sr(
        `/courier/serviceability/?pickup_postcode=${pickup}&delivery_postcode=${delivery}&weight=${weight}&cod=0${dims}`
      );

      const list = data?.data?.available_courier_companies || [];
      if (!ok || !list.length) {
        return json({
          success: false,
          serviceable: false,
          error: data?.message || "Delivery not available for this pincode",
        });
      }

      const courier = pickCourier(list);
      if (!courier) {
        return json({ success: false, serviceable: false, error: "No surface courier available" });
      }

      const days = Number(courier.estimated_delivery_days) || 5;
      return json({
        success: true,
        serviceable: true,
        courier_name: courier.courier_name,
        rate: Math.ceil(Number(courier.rate || 0)),
        estimated_days: Number(days),
        etd: courier.etd || null,
        courier_company_id: courier.courier_company_id,
        pickup_pincode: pickup,
        billable_weight: weight,
      });
    }

    // ---------- ADMIN ONLY BELOW ----------
    const user = await requireAdmin(req);
    if (!user) return json({ success: false, error: "Admin access required" }, 403);

    if (action === "check_auth") {
      await getToken();
      const settings = await getSettings();
      return json({ success: true, connected: true, pickup_pincode: settings?.pickup_pincode });
    }

    if (action === "create_shipment") {
      const orderId = body.order_id as string;
      const { data: order } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (!order) return json({ success: false, error: "Order not found" }, 404);
      if (order.shiprocket_order_id) {
        return json({ success: false, error: "Shipment already created for this order" }, 400);
      }

      const { data: items } = await admin
        .from("order_items")
        .select("id, quantity, price, product_id, products(name, weight_kg, length_cm, breadth_cm, height_cm)")
        .eq("order_id", orderId);

      const settings = await getSettings();
      const orderItems = (items || []).map((it: any, idx: number) => ({
        name: it.products?.name || `Item ${idx + 1}`,
        sku: String(it.product_id || `SKU-${idx + 1}`).slice(0, 24),
        units: it.quantity || 1,
        selling_price: Number(it.price || 0),
      }));

      const totalWeight = (items || []).reduce(
        (sum: number, it: any) => sum + (Number(it.products?.weight_kg) || 0.5) * (it.quantity || 1),
        0
      );
      const maxDim = (key: string, fallback: number) =>
        Math.max(fallback, ...(items || []).map((it: any) => Number(it.products?.[key]) || 0));

      const nameParts = String(order.customer_name || "Customer").trim().split(" ");
      const payload = {
        order_id: String(order.id).slice(0, 8) + "-" + Date.now().toString().slice(-5),
        order_date: new Date(order.created_at).toISOString().slice(0, 19).replace("T", " "),
        pickup_location: body.pickup_location || (await resolvePickupLocation(settings?.pickup_pincode)),
        billing_customer_name: nameParts[0],
        billing_last_name: nameParts.slice(1).join(" ") || ".",
        billing_address: order.shipping_address,
        billing_address_2: order.landmark || "",
        billing_city: order.shipping_city,
        billing_pincode: order.shipping_pincode,
        billing_state: order.shipping_state,
        billing_country: "India",
        billing_email: order.email || "orders@graphicwala.com",
        billing_phone: String(order.shipping_phone || "").replace(/\D/g, "").slice(-10),
        shipping_is_billing: true,
        order_items: orderItems.length ? orderItems : [{ name: "Custom Print", sku: "GW-1", units: 1, selling_price: Number(order.total_amount) }],
        payment_method: "Prepaid",
        shipping_charges: Number(order.delivery_charge || 0),
        sub_total: Number(order.total_amount),
        length: maxDim("length_cm", 15),
        breadth: maxDim("breadth_cm", 12),
        height: maxDim("height_cm", 3),
        weight: Math.max(0.5, Number(totalWeight.toFixed(2))),
      };

      const created = await sr("/orders/create/adhoc", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!created.ok || !created.data?.order_id) {
        return json(
          { success: false, error: created.data?.message || "Failed to create Shiprocket order", details: created.data },
          400
        );
      }

      const srOrderId = created.data.order_id;
      const shipmentId = created.data.shipment_id;

      // Assign AWB with Delhivery Surface preference
      let awb: string | null = null;
      let courierName: string | null = null;

      const serv = await sr(
        `/courier/serviceability/?pickup_postcode=${settings?.pickup_pincode || "854105"}&delivery_postcode=${order.shipping_pincode}&weight=${payload.weight}&cod=0`
      );
      const courier = pickCourier(serv.data?.data?.available_courier_companies || []);

      const awbRes = await sr("/courier/assign/awb", {
        method: "POST",
        body: JSON.stringify({
          shipment_id: shipmentId,
          ...(courier?.courier_company_id ? { courier_id: courier.courier_company_id } : {}),
        }),
      });

      const awbData = awbRes.data?.response?.data || awbRes.data?.data || {};
      awb = awbData.awb_code || null;
      courierName = awbData.courier_name || courier?.courier_name || null;

      await admin
        .from("orders")
        .update({
          shiprocket_order_id: String(srOrderId),
          shiprocket_shipment_id: String(shipmentId),
          shiprocket_awb: awb,
          shiprocket_courier_name: courierName,
        })
        .eq("id", orderId);

      return json({
        success: true,
        shiprocket_order_id: srOrderId,
        shipment_id: shipmentId,
        awb,
        courier_name: courierName,
        awb_error: awb ? null : awbRes.data?.message || "AWB not assigned yet",
      });
    }

    if (action === "track") {
      const awb = String(body.awb || "");
      if (!awb) return json({ success: false, error: "AWB required" }, 400);
      const res = await sr(`/courier/track/awb/${awb}`);
      return json({ success: res.ok, data: res.data });
    }

    if (action === "pickup_locations") {
      const res = await sr("/settings/company/pickup");
      const list = (res.data?.data?.shipping_address || []).map((l: any) => ({
        pickup_location: l.pickup_location,
        address: l.address,
        city: l.city,
        state: l.state,
        pin_code: l.pin_code,
        phone: l.phone,
      }));
      return json({ success: res.ok, locations: list });
    }

    if (action === "cancel") {
      const res = await sr("/orders/cancel", {
        method: "POST",
        body: JSON.stringify({ ids: [Number(body.shiprocket_order_id)] }),
      });
      return json({ success: res.ok, data: res.data });
    }

    return json({ success: false, error: "Unknown action" }, 400);
  } catch (e: any) {
    console.error("shiprocket error:", e?.message);
    return json({ success: false, error: e?.message || "Unexpected error" }, 500);
  }
});
