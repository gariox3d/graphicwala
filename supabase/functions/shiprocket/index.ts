import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache token for 24 hours
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid (with 1 hour buffer)
  if (cachedToken && tokenExpiry > now + 3600000) {
    console.log("Using cached Shiprocket token");
    return cachedToken;
  }

  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");

  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured");
  }

  console.log("Fetching new Shiprocket token...");
  
  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Shiprocket auth failed:", errorText);
    throw new Error(`Shiprocket authentication failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.token;
  // Token is valid for 10 days, but we'll refresh every 24 hours
  tokenExpiry = now + 24 * 60 * 60 * 1000;
  
  console.log("Shiprocket token obtained successfully");
  return cachedToken!;
}

async function checkServiceability(
  token: string,
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  cod: boolean = false
) {
  console.log(`Checking serviceability: ${pickupPincode} -> ${deliveryPincode}, weight: ${weight}kg`);
  
  const url = new URL("https://apiv2.shiprocket.in/v1/external/courier/serviceability/");
  url.searchParams.append("pickup_postcode", pickupPincode);
  url.searchParams.append("delivery_postcode", deliveryPincode);
  url.searchParams.append("weight", weight.toString());
  url.searchParams.append("cod", cod ? "1" : "0");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Serviceability check failed:", errorText);
    throw new Error(`Serviceability check failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("Serviceability response:", JSON.stringify(data, null, 2));
  return data;
}

function processServiceabilityResponse(data: any): {
  available: boolean;
  cheapestRate: number;
  fastestDeliveryDays: number;
  courierName: string;
  estimatedDeliveryDate: string;
  allOptions: any[];
} {
  const couriers = data?.data?.available_courier_companies || [];
  
  if (couriers.length === 0) {
    return {
      available: false,
      cheapestRate: 0,
      fastestDeliveryDays: 0,
      courierName: "",
      estimatedDeliveryDate: "",
      allOptions: [],
    };
  }

  // Sort by rate to get cheapest
  const sortedByRate = [...couriers].sort((a, b) => a.rate - b.rate);
  // Sort by EDD to get fastest
  const sortedBySpeed = [...couriers].sort((a, b) => a.estimated_delivery_days - b.estimated_delivery_days);
  
  const cheapest = sortedByRate[0];
  const fastest = sortedBySpeed[0];
  
  // Calculate estimated delivery date
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + fastest.estimated_delivery_days);
  
  return {
    available: true,
    cheapestRate: Math.ceil(cheapest.rate),
    fastestDeliveryDays: fastest.estimated_delivery_days,
    courierName: cheapest.courier_name,
    estimatedDeliveryDate: deliveryDate.toISOString().split('T')[0],
    allOptions: couriers.map((c: any) => ({
      name: c.courier_name,
      rate: Math.ceil(c.rate),
      estimatedDays: c.estimated_delivery_days,
      etd: c.etd,
    })),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, pickupPincode, deliveryPincode, weight, products } = await req.json();

    console.log(`Shiprocket action: ${action}`);

    switch (action) {
      case "check_serviceability": {
        if (!pickupPincode || !deliveryPincode) {
          return new Response(
            JSON.stringify({ 
              error: "Missing required parameters",
              available: false 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        const token = await getShiprocketToken();
        
        // Calculate total weight from products or use provided weight
        let totalWeight = weight || 0.5;
        if (products && Array.isArray(products)) {
          totalWeight = products.reduce((sum: number, p: any) => {
            return sum + (p.weight_kg || 0.5) * (p.quantity || 1);
          }, 0);
          // Minimum weight 0.5kg
          totalWeight = Math.max(totalWeight, 0.5);
        }

        const serviceData = await checkServiceability(
          token,
          pickupPincode,
          deliveryPincode,
          totalWeight,
          false // COD disabled - prepaid only
        );

        const processed = processServiceabilityResponse(serviceData);
        
        return new Response(
          JSON.stringify({
            success: true,
            ...processed,
            totalWeight,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_rates": {
        if (!pickupPincode || !deliveryPincode) {
          return new Response(
            JSON.stringify({ 
              error: "Missing required parameters",
              available: false 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        const token = await getShiprocketToken();
        
        let totalWeight = weight || 0.5;
        if (products && Array.isArray(products)) {
          totalWeight = products.reduce((sum: number, p: any) => {
            return sum + (p.weight_kg || 0.5) * (p.quantity || 1);
          }, 0);
          totalWeight = Math.max(totalWeight, 0.5);
        }

        const serviceData = await checkServiceability(
          token,
          pickupPincode,
          deliveryPincode,
          totalWeight,
          false
        );

        const processed = processServiceabilityResponse(serviceData);
        
        return new Response(
          JSON.stringify({
            success: true,
            shippingCharge: processed.cheapestRate,
            estimatedDays: processed.fastestDeliveryDays,
            estimatedDeliveryDate: processed.estimatedDeliveryDate,
            courierName: processed.courierName,
            available: processed.available,
            totalWeight,
            allOptions: processed.allOptions,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error("Shiprocket function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        available: false,
        success: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
