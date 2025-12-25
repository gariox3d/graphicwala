import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Verify Razorpay signature
async function verifySignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<boolean> {
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

  return expectedSignature === razorpay_signature;
}

// Verify webhook signature using dedicated RAZORPAY_WEBHOOK_SECRET
async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  // Use dedicated webhook secret, fallback to key secret for backwards compatibility
  const webhookSecret = RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;
  if (!webhookSecret) {
    console.error('No webhook secret configured');
    return false;
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const key = encoder.encode(webhookSecret);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === signature;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Handle webhook from Razorpay
    if (req.method === 'POST' && req.headers.get('x-razorpay-signature')) {
      const rawBody = await req.text();
      const webhookSignature = req.headers.get('x-razorpay-signature') || '';
      
      console.log('Webhook received');
      
      // Verify webhook signature
      const isValidWebhook = await verifyWebhookSignature(rawBody, webhookSignature);
      if (!isValidWebhook) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const webhookData = JSON.parse(rawBody);
      const event = webhookData.event;
      
      console.log(`Webhook event: ${event}`);

      if (event === 'payment.captured') {
        const payment = webhookData.payload.payment.entity;
        const razorpay_order_id = payment.order_id;
        const razorpay_payment_id = payment.id;

        console.log(`Payment captured - order_id: ${razorpay_order_id}, payment_id: ${razorpay_payment_id}`);

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Update order if it exists (safety net)
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            razorpay_payment_id,
          })
          .eq('razorpay_order_id', razorpay_order_id)
          .eq('payment_status', 'pending'); // Only update if still pending

        if (updateError) {
          console.error('Webhook update error:', updateError);
        } else {
          console.log('Order updated via webhook');
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle regular API calls
    const { action, ...params } = await req.json();
    console.log(`Razorpay action: ${action}`, JSON.stringify(params, null, 2));

    if (action === 'create-order') {
      // Create Razorpay order ONLY - no database order
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

    if (action === 'verify-and-create-order') {
      // CRITICAL: This is the ONLY place where orders are created
      // Order is created ONLY after payment verification succeeds
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        order_data,
        order_items 
      } = params;
      
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error('Missing payment verification parameters');
      }

      if (!order_data || !order_items) {
        throw new Error('Missing order data');
      }

      // STEP 1: Verify payment signature
      const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      console.log('Payment verification result:', isValid);

      if (!isValid) {
        console.error('Payment signature verification failed');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Payment verification failed - invalid signature',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // STEP 2: Verify payment is actually captured with Razorpay API
      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error('Failed to fetch payment details from Razorpay');
        throw new Error('Failed to verify payment with Razorpay');
      }

      const paymentDetails = await paymentResponse.json();
      console.log('Payment details from Razorpay:', JSON.stringify(paymentDetails, null, 2));

      // Check if payment is captured or authorized
      if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
        console.error(`Payment not captured. Status: ${paymentDetails.status}`);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Payment not completed. Status: ${paymentDetails.status}`,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify the order_id matches
      if (paymentDetails.order_id !== razorpay_order_id) {
        console.error('Order ID mismatch');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Payment order ID mismatch',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // STEP 3: Payment verified - NOW create the order
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      // Check if order already exists (idempotency)
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('razorpay_order_id', razorpay_order_id)
        .single();

      if (existingOrder) {
        console.log('Order already exists:', existingOrder.id);
        return new Response(JSON.stringify({ 
          success: true, 
          order_id: existingOrder.id,
          message: 'Order already processed',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create order with PAID status (payment is already verified)
      const { data: dbOrder, error: dbError } = await supabase
        .from('orders')
        .insert({
          ...order_data,
          status: 'confirmed',
          payment_status: 'paid',
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        })
        .select()
        .single();

      if (dbError) {
        console.error('DB Error creating order:', dbError);
        throw new Error('Failed to create order');
      }

      console.log('Order created:', dbOrder.id);

      // Create order items
      const orderItemsData = order_items.map((item: any) => ({
        order_id: dbOrder.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        front_design_url: item.front_design_url,
        back_design_url: item.back_design_url,
        design_approval_status: item.design_approval_status,
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)
        .select();

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Don't fail the whole transaction, order is already created
      }

      // Create order item uploads
      if (insertedItems) {
        for (let i = 0; i < insertedItems.length; i++) {
          const orderItem = insertedItems[i];
          const originalItem = order_items[i];
          
          if (originalItem.uploads && originalItem.uploads.length > 0) {
            const uploadRecords = originalItem.uploads.map((upload: any) => ({
              order_item_id: orderItem.id,
              field_id: upload.field_id,
              label: upload.label,
              required: upload.required,
              file_url: upload.file_url,
            }));
            
            await supabase.from('order_item_uploads').insert(uploadRecords);
          }
        }
      }

      console.log('Order creation complete:', dbOrder.id);

      return new Response(JSON.stringify({ 
        success: true, 
        verified: true,
        order_id: dbOrder.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Legacy verify-payment action (kept for backwards compatibility but deprecated)
    if (action === 'verify-payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = params;
      
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new Error('Missing payment verification parameters');
      }

      const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      console.log('Legacy payment verification result:', isValid);

      if (isValid && order_id) {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        
        // Verify that the order exists and the razorpay_order_id matches
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
          console.error('Order ID mismatch');
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
