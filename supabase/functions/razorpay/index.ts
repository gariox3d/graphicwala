import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
// NOTE: Lovable preview runs on *.lovableproject.com
const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'https://haeggvlmnfapopmyuaya.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
  // Vercel production domains
  'https://graphicwala.vercel.app',
  'https://www.graphicwala.in',
  'https://graphicwala.in',
  // Custom domains - CRITICAL: Must include store.graphicwala.com
  'https://store.graphicwala.com',
  'https://www.store.graphicwala.com',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Log incoming origin for debugging
  console.log('[CORS] Incoming origin:', origin);
  
  // For webhooks from Razorpay (no origin), allow
  // For browser requests, validate origin
  const isAllowed =
    !origin ||
    ALLOWED_ORIGINS.some((allowed) => origin === allowed) ||
    origin.endsWith('.lovable.app') ||
    origin.endsWith('.lovable.dev') ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.graphicwala.com'); // Allow all graphicwala.com subdomains
  
  const allowedOrigin = isAllowed && origin ? origin : ALLOWED_ORIGINS[0];
  
  console.log('[CORS] Origin allowed:', isAllowed, '| Using:', allowedOrigin);
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Validation functions for order data
function validateOrderData(orderData: any): { valid: boolean; error?: string } {
  // Phone validation - Indian mobile numbers start with 6-9
  if (!orderData.shipping_phone || !/^[6-9]\d{9}$/.test(orderData.shipping_phone.replace(/\s/g, ''))) {
    return { valid: false, error: 'Invalid phone number format. Must be a valid 10-digit Indian mobile number.' };
  }
  
  // Pincode validation (for home delivery)
  if (orderData.delivery_method !== 'store_pickup') {
    if (!orderData.shipping_pincode || !/^\d{6}$/.test(orderData.shipping_pincode)) {
      return { valid: false, error: 'Invalid pincode format. Must be a 6-digit number.' };
    }
  }
  
  // Length limits to prevent database bloat
  if (orderData.customer_name && orderData.customer_name.length > 100) {
    return { valid: false, error: 'Customer name too long. Maximum 100 characters.' };
  }
  if (orderData.shipping_address && orderData.shipping_address.length > 500) {
    return { valid: false, error: 'Shipping address too long. Maximum 500 characters.' };
  }
  if (orderData.shipping_city && orderData.shipping_city.length > 100) {
    return { valid: false, error: 'City name too long. Maximum 100 characters.' };
  }
  if (orderData.shipping_state && orderData.shipping_state.length > 100) {
    return { valid: false, error: 'State name too long. Maximum 100 characters.' };
  }
  if (orderData.landmark && orderData.landmark.length > 200) {
    return { valid: false, error: 'Landmark too long. Maximum 200 characters.' };
  }
  if (orderData.order_notes && orderData.order_notes.length > 500) {
    return { valid: false, error: 'Order notes too long. Maximum 500 characters.' };
  }
  if (orderData.email && orderData.email.length > 255) {
    return { valid: false, error: 'Email too long. Maximum 255 characters.' };
  }
  
  // Email format validation (if provided)
  if (orderData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.email)) {
    return { valid: false, error: 'Invalid email format.' };
  }
  
  // Amount validation
  if (!orderData.total_amount || orderData.total_amount <= 0) {
    return { valid: false, error: 'Invalid order amount.' };
  }
  
  return { valid: true };
}

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Validate required secrets on startup
function validateSecrets(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
  if (!RAZORPAY_KEY_SECRET) missing.push('RAZORPAY_KEY_SECRET');
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return { valid: missing.length === 0, missing };
}

// Verify Razorpay signature
async function verifySignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<boolean> {
  if (!RAZORPAY_KEY_SECRET) {
    console.error('RAZORPAY_KEY_SECRET not configured');
    return false;
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
  const key = encoder.encode(RAZORPAY_KEY_SECRET);
  
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
  // CRITICAL: Use dedicated webhook secret, require it for production
  const webhookSecret = RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;
  if (!webhookSecret) {
    console.error('No webhook secret configured - RAZORPAY_WEBHOOK_SECRET is required');
    return false;
  }
  
  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.warn('RAZORPAY_WEBHOOK_SECRET not set, using RAZORPAY_KEY_SECRET as fallback');
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

// Send WhatsApp order confirmation (non-blocking, fail-safe)
async function sendWhatsAppConfirmation(
  phone: string,
  orderId: string,
  customerName: string | null
): Promise<void> {
  // Format phone for WhatsApp (ensure +91 prefix)
  const cleanPhone = phone.replace(/\s/g, '').replace(/^0+/, '');
  const whatsappPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  // Create the confirmation message
  const name = customerName || 'Customer';
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  const message = `Hi ${name} 👋

Your order #${shortOrderId} has been successfully confirmed.
We will start processing your print shortly.

Thank you for choosing Graphic Wala ❤️`;

  console.log('[WhatsApp] Preparing to send confirmation:', {
    phone: whatsappPhone,
    orderId: shortOrderId,
    customerName: name,
  });

  // Log the message for now - can be connected to WhatsApp Business API later
  // Popular options: Twilio, Gupshup, Meta WhatsApp Business API
  console.log('[WhatsApp] Message content:', message);
  
  // TODO: When ready, integrate with WhatsApp Business API:
  // const WHATSAPP_API_KEY = Deno.env.get('WHATSAPP_API_KEY');
  // if (WHATSAPP_API_KEY) {
  //   await fetch('https://api.whatsapp-provider.com/send', {
  //     method: 'POST',
  //     headers: { 'Authorization': `Bearer ${WHATSAPP_API_KEY}` },
  //     body: JSON.stringify({ to: whatsappPhone, message }),
  //   });
  // }
  
  console.log('[WhatsApp] Order confirmation logged successfully for:', shortOrderId);
}

// Send order confirmation email (non-blocking, fail-safe)
async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  try {
    const SUPABASE_URL_ENV = Deno.env.get('SUPABASE_URL');
    
    console.log('[Email] Triggering order confirmation email for:', orderId);
    
    const response = await fetch(`${SUPABASE_URL_ENV}/functions/v1/send-order-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Email] Failed to trigger email:', errorText);
    } else {
      const result = await response.json();
      console.log('[Email] Trigger response:', result);
    }
  } catch (error) {
    console.error('[Email] Error triggering email (non-blocking):', error);
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');
  const corsHeaders = getCorsHeaders(origin);
  
  // Enhanced logging for debugging domain issues
  console.log('[REQUEST] Method:', req.method);
  console.log('[REQUEST] Origin:', origin);
  console.log('[REQUEST] Referer:', referer);
  console.log('[REQUEST] Host:', host);
  console.log('[REQUEST] URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Preflight request - returning CORS headers');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate secrets are configured
    const secretsCheck = validateSecrets();
    if (!secretsCheck.valid) {
      console.error('[ERROR] Missing required secrets:', secretsCheck.missing);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Payment service configuration error. Please contact support.',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('[CONFIG] All required secrets present');
    
    const contentType = req.headers.get('content-type') || '';
    
    // Handle webhook from Razorpay
    if (req.method === 'POST' && req.headers.get('x-razorpay-signature')) {
      const rawBody = await req.text();
      const webhookSignature = req.headers.get('x-razorpay-signature') || '';
      
      console.log('Webhook received at:', new Date().toISOString());
      
      // CRITICAL: Verify webhook signature - mandatory for security
      const isValidWebhook = await verifyWebhookSignature(rawBody, webhookSignature);
      if (!isValidWebhook) {
        console.error('Invalid webhook signature - rejecting request');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const webhookData = JSON.parse(rawBody);
      const event = webhookData.event;
      
      console.log(`Verified webhook event: ${event}`);

      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      if (event === 'payment.captured') {
        const payment = webhookData.payload.payment.entity;
        const razorpay_order_id = payment.order_id;
        const razorpay_payment_id = payment.id;

        console.log(`Payment captured - order_id: ${razorpay_order_id}, payment_id: ${razorpay_payment_id}`);

        // Update order if it exists (safety net for idempotency)
        const { data: existingOrder, error: fetchError } = await supabase
          .from('orders')
          .select('id, payment_status, shipping_phone, customer_name')
          .eq('razorpay_order_id', razorpay_order_id)
          .maybeSingle();

        if (existingOrder) {
          // Idempotency check - only update if not already paid
          if (existingOrder.payment_status !== 'paid') {
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                status: 'confirmed',
                razorpay_payment_id,
              })
              .eq('id', existingOrder.id);

            if (updateError) {
              console.error('Webhook update error:', updateError);
            } else {
              console.log('Order confirmed via webhook:', existingOrder.id);
              
              // Send WhatsApp confirmation (non-blocking)
              try {
                await sendWhatsAppConfirmation(
                  existingOrder.shipping_phone,
                  existingOrder.id,
                  existingOrder.customer_name
                );
              } catch (whatsappError) {
                // Log error but don't fail the webhook - order is already confirmed
                console.error('WhatsApp notification failed (non-blocking):', whatsappError);
              }
              
              // Send order confirmation email (non-blocking)
              try {
                await sendOrderConfirmationEmail(existingOrder.id);
              } catch (emailError) {
                console.error('Email notification failed (non-blocking):', emailError);
              }
            }
          } else {
            console.log('Order already paid, skipping duplicate webhook:', existingOrder.id);
          }
        } else {
          console.log('No order found for razorpay_order_id:', razorpay_order_id);
        }
      }

      // Handle payment failure events
      if (event === 'payment.failed') {
        const payment = webhookData.payload.payment.entity;
        const razorpay_order_id = payment.order_id;
        const error_code = payment.error_code;
        const error_description = payment.error_description;

        console.log(`Payment failed - order_id: ${razorpay_order_id}, error: ${error_code} - ${error_description}`);

        // If an order exists with pending status, mark it as failed
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id, payment_status')
          .eq('razorpay_order_id', razorpay_order_id)
          .maybeSingle();

        if (existingOrder && existingOrder.payment_status === 'pending') {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
            })
            .eq('id', existingOrder.id);

          if (updateError) {
            console.error('Failed to mark order as failed:', updateError);
          } else {
            console.log('Order marked as failed via webhook:', existingOrder.id);
          }
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

      // SERVER-SIDE VALIDATION: Validate order data before processing
      const validation = validateOrderData(order_data);
      if (!validation.valid) {
        console.error('Order data validation failed:', validation.error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: validation.error,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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

      // Send order confirmation email (non-blocking, in background)
      // Don't await - let response return immediately
      sendOrderConfirmationEmail(dbOrder.id).catch(err => {
        console.error('Email trigger failed (non-blocking):', err);
      });

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
