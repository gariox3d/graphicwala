import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Razorpay action: ${action}`, params);

    if (action === 'create-order') {
      // Create Razorpay order
      const { amount, currency = 'INR', receipt, notes } = params;
      
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          currency,
          receipt,
          notes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Razorpay order creation failed:', errorText);
        throw new Error(`Razorpay order creation failed: ${errorText}`);
      }

      const order = await response.json();
      console.log('Razorpay order created:', order.id);

      return new Response(JSON.stringify({ 
        success: true, 
        order,
        key_id: RAZORPAY_KEY_ID,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify-payment') {
      // Verify Razorpay payment signature
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = params;
      
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error('Missing payment verification parameters');
      }

      // Create signature for verification
      const encoder = new TextEncoder();
      const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
      const key = encoder.encode(RAZORPAY_KEY_SECRET!);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const isValid = expectedSignature === razorpay_signature;
      console.log('Payment verification result:', isValid);

      if (isValid && order_id) {
        // Update order in database using service role
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        
        // First, verify that the order exists and the razorpay_order_id matches
        // This prevents an attacker from applying a valid payment to a different order
        const { data: existingOrder, error: fetchError } = await supabase
          .from('orders')
          .select('id, razorpay_order_id')
          .eq('id', order_id)
          .single();

        if (fetchError || !existingOrder) {
          console.error('Order not found:', order_id);
          throw new Error('Order not found');
        }

        if (existingOrder.razorpay_order_id !== razorpay_order_id) {
          console.error('Order ID mismatch - payment razorpay_order_id does not match order:', {
            provided: razorpay_order_id,
            expected: existingOrder.razorpay_order_id,
          });
          throw new Error('Payment does not belong to this order');
        }
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            razorpay_payment_id,
            razorpay_signature,
            status: 'confirmed',
          })
          .eq('id', order_id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw new Error('Failed to update order');
        }

        console.log('Order updated successfully:', order_id);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        verified: isValid,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in razorpay function:', errorMessage);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
