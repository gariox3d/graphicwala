import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifySignature(
  order_id: string,
  payment_id: string,
  signature: string
): Promise<boolean> {
  if (!RAZORPAY_KEY_SECRET) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${order_id}|${payment_id}`));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

function validatePhone(p: string): boolean {
  return /^[6-9]\d{9}$/.test(p.replace(/\s/g, ""));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, ...params } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (action === "create-order") {
      const { amount, video_id } = params;
      if (!amount || amount <= 0) throw new Error("Invalid amount");
      if (!video_id) throw new Error("Missing video");

      // Verify price server-side
      const { data: video } = await supabase
        .from("invite_videos")
        .select("price, is_active")
        .eq("id", video_id)
        .maybeSingle();
      if (!video || !video.is_active) throw new Error("Video not available");
      if (Number(video.price) !== Number(amount)) throw new Error("Price mismatch");

      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: "INR",
          receipt: `inv_${Date.now()}`,
          notes: { video_id },
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Razorpay error: ${txt}`);
      }
      const order = await res.json();
      return new Response(
        JSON.stringify({ success: true, order, key_id: RAZORPAY_KEY_ID }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify-and-place") {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        video_id,
        user_id,
        customer_name,
        whatsapp_number,
        email,
        form_data,
      } = params;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error("Missing payment fields");
      }
      if (!video_id || !customer_name || !whatsapp_number) {
        throw new Error("Missing required order fields");
      }
      if (!validatePhone(whatsapp_number)) {
        throw new Error("Invalid WhatsApp number. Must be 10-digit Indian mobile.");
      }
      if (customer_name.length > 100) throw new Error("Name too long");
      if (email && email.length > 255) throw new Error("Email too long");

      const valid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!valid) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid payment signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: video } = await supabase
        .from("invite_videos")
        .select("id, price, title, category_id")
        .eq("id", video_id)
        .maybeSingle();
      if (!video) throw new Error("Video not found");

      const { data: inserted, error: insertErr } = await supabase
        .from("invite_orders")
        .insert({
          user_id: user_id || null,
          video_id: video.id,
          category_id: video.category_id,
          video_title: video.title,
          customer_name,
          whatsapp_number,
          email: email || null,
          form_data: form_data || {},
          amount: video.price,
          payment_status: "paid",
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Insert error:", insertErr);
        throw new Error("Failed to save order");
      }

      // Fire-and-forget admin alert email
      try {
        const adminEmail = Deno.env.get("ADMIN_EMAIL");
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (adminEmail && resendKey) {
          fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Graphic Wala <orders@graphicwala.com>",
              to: [adminEmail],
              subject: `🎬 New Video Invite Order: ${video.title}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:2px solid #E11D48;border-radius:12px">
                <h2 style="color:#E11D48">New Video Invitation Order</h2>
                <p><b>Video:</b> ${video.title}</p>
                <p><b>Customer:</b> ${customer_name}</p>
                <p><b>WhatsApp:</b> +91${whatsapp_number.replace(/\D/g, "").slice(-10)}</p>
                <p><b>Email:</b> ${email || "—"}</p>
                <p><b>Amount Paid:</b> ₹${video.price}</p>
                <p><b>Order ID:</b> ${inserted.id}</p>
                <p>Login to admin panel → Video Invites → Orders to view full form and deliver within 24 hours.</p>
              </div>`,
            }),
          }).catch((e) => console.error("Admin email failed:", e));
        }
      } catch (e) {
        console.error("Email block error:", e);
      }

      return new Response(
        JSON.stringify({ success: true, order_id: inserted.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Unknown action");
  } catch (err: any) {
    console.error("invite-razorpay error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});