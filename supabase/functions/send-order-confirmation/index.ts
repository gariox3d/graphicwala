import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Resend API client using fetch
async function sendEmail(options: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<{ data?: any; error?: any }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Resend] API error:", errorText);
      return { error: errorText };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    console.error("[Resend] Request failed:", error);
    return { error: error.message };
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Brand colors
const BRAND_RED = "#E11D48";
const BRAND_WHITE = "#FFFFFF";
const BRAND_GRAY = "#F9FAFB";
const BRAND_TEXT_DARK = "#111827";
const BRAND_TEXT_MUTED = "#6B7280";
const BRAND_BORDER = "#E5E7EB";

interface OrderEmailData {
  orderId: string;
  customerName: string;
  email: string;
  totalAmount: number;
  deliveryMethod: string;
  estimatedDeliveryDate: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  deliveryCharge: number;
  couponCode: string | null;
  couponDiscount: number;
  items: {
    productName: string;
    productPrice: number;
    quantity: number;
    imageUrl: string | null;
  }[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "5-7 working days";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return "5-7 working days";
  }
}

function generateEmailHtml(data: OrderEmailData): string {
  const shortOrderId = data.orderId.slice(0, 8).toUpperCase();
  const itemsSubtotal = data.items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
  
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid ${BRAND_BORDER};">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="80" style="vertical-align: top;">
              <div style="width: 70px; height: 70px; border-radius: 8px; overflow: hidden; background: ${BRAND_GRAY};">
                ${item.imageUrl 
                  ? `<img src="${item.imageUrl}" alt="${item.productName}" style="width: 70px; height: 70px; object-fit: cover; display: block;" />`
                  : `<div style="width: 70px; height: 70px; background: linear-gradient(135deg, ${BRAND_RED}20 0%, ${BRAND_GRAY} 100%); display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 24px;">📦</span>
                    </div>`
                }
              </div>
            </td>
            <td style="vertical-align: top; padding-left: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${item.productName}</p>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Qty: ${item.quantity}</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${formatCurrency(item.productPrice * item.quantity)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Order Confirmed - Graphic Wala</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_GRAY}; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Your order #${shortOrderId} has been confirmed! Thank you for shopping with Graphic Wala.
  </div>
  
  <!-- Email wrapper -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${BRAND_GRAY};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main container -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: ${BRAND_WHITE}; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header with logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_RED} 0%, #BE123C 100%); padding: 32px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <div style="background: ${BRAND_WHITE}; border-radius: 12px; padding: 12px 24px; display: inline-block;">
                      <span style="font-size: 24px; font-weight: 700; color: ${BRAND_RED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif; letter-spacing: -0.5px;">
                        Graphic Wala
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Success icon and heading -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center;">
              <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: inline-block; line-height: 72px;">
                <span style="font-size: 36px; color: white;">✓</span>
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Order Confirmed!</h1>
              <p style="margin: 0; font-size: 16px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                Hi ${data.customerName || 'there'}, thank you for your order!
              </p>
            </td>
          </tr>
          
          <!-- Order ID Card -->
          <tr>
            <td style="padding: 0 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${BRAND_GRAY}; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Order ID</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${BRAND_RED}; font-family: 'Courier New', monospace; letter-spacing: 2px;">#${shortOrderId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Order Items -->
          <tr>
            <td style="padding: 32px 40px 16px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Order Summary</h2>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid ${BRAND_BORDER}; border-radius: 12px; overflow: hidden;">
                ${itemsHtml}
              </table>
            </td>
          </tr>
          
          <!-- Price breakdown -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${BRAND_GRAY}; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="font-size: 14px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Subtotal</span>
                        </td>
                        <td style="padding-bottom: 8px; text-align: right;">
                          <span style="font-size: 14px; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${formatCurrency(itemsSubtotal)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="font-size: 14px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                            ${data.deliveryMethod === 'store_pickup' ? 'Store Pickup' : 'Delivery Charges'}
                          </span>
                        </td>
                        <td style="padding-bottom: 8px; text-align: right;">
                          <span style="font-size: 14px; color: ${data.deliveryCharge === 0 ? '#10B981' : BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                            ${data.deliveryCharge === 0 ? 'FREE' : formatCurrency(data.deliveryCharge)}
                          </span>
                        </td>
                      </tr>
                      ${data.couponCode && data.couponDiscount > 0 ? `
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <span style="font-size: 14px; color: #10B981; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                            🎟️ Coupon (${data.couponCode})
                          </span>
                        </td>
                        <td style="padding-bottom: 12px; text-align: right;">
                          <span style="font-size: 14px; font-weight: 600; color: #10B981; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                            -${formatCurrency(data.couponDiscount)}
                          </span>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td colspan="2" style="border-top: 1px dashed ${BRAND_BORDER}; padding-top: 12px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td>
                                <span style="font-size: 16px; font-weight: 700; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Total Paid</span>
                              </td>
                              <td style="text-align: right;">
                                <span style="font-size: 20px; font-weight: 700; color: ${BRAND_RED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${formatCurrency(data.totalAmount)}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Delivery Info -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid ${BRAND_BORDER}; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 12px;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                            ${data.deliveryMethod === 'store_pickup' ? 'Pickup Location' : 'Delivery Address'}
                          </p>
                          <p style="margin: 0; font-size: 14px; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5;">
                            ${data.deliveryMethod === 'store_pickup' 
                              ? 'Graphic Wala Store<br>Visit store for pickup'
                              : `${data.shippingAddress}<br>${data.shippingCity}, ${data.shippingState}<br>${data.shippingPincode}`
                            }
                          </p>
                        </td>
                        <td width="50%" style="vertical-align: top; padding-left: 12px;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                            ${data.deliveryMethod === 'store_pickup' ? 'Ready By' : 'Estimated Delivery'}
                          </p>
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                            ${formatDate(data.estimatedDeliveryDate)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Delivery Estimate Notice -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #065F46; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      🚚 Estimated Delivery: 5–7 working days
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #047857; font-family: 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5;">
                      📅 Expected by: <strong>${formatDate(data.estimatedDeliveryDate)}</strong>
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #047857; font-family: 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5;">
                      Orders are dispatched after quality checks. You will be notified once your order is shipped.
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #059669; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      ⚠️ Delivery may take slightly longer in rare cases due to logistics or regional delays.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Return Policy Notice -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #92400E; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      🔁 Damaged or Wrong Product?
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #B45309; font-family: 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5;">
                      If your product arrives damaged or defective, please contact us on WhatsApp within 48 hours with video proof showing the damaged product, outer packaging, and Order ID.
                    </p>
                    <a href="https://wa.me/916207142994?text=${encodeURIComponent(`Hello Graphic Wala, I received a damaged product.\n\nOrder ID: ${shortOrderId}\n\nI am sharing the video as requested.`)}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      Report Issue on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 8px 40px 32px; text-align: center;">
              <a href="https://store.graphicwala.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_RED} 0%, #BE123C 100%); color: ${BRAND_WHITE}; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; font-family: 'Segoe UI', Roboto, Arial, sans-serif; box-shadow: 0 4px 14px -3px rgba(225, 29, 72, 0.5);">
                View Order Details
              </a>
            </td>
          </tr>
          
          <!-- Trust badges -->
          <tr>
            <td style="padding: 24px 40px; background: ${BRAND_GRAY}; border-top: 1px solid ${BRAND_BORDER};">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 0 16px; text-align: center;">
                          <div style="font-size: 24px; margin-bottom: 4px;">🔒</div>
                          <p style="margin: 0; font-size: 11px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Secure<br>Payment</p>
                        </td>
                        <td style="padding: 0 16px; text-align: center;">
                          <div style="font-size: 24px; margin-bottom: 4px;">✨</div>
                          <p style="margin: 0; font-size: 11px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Premium<br>Quality</p>
                        </td>
                        <td style="padding: 0 16px; text-align: center;">
                          <div style="font-size: 24px; margin-bottom: 4px;">📞</div>
                          <p style="margin: 0; font-size: 11px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">24/7<br>Support</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; background: ${BRAND_GRAY};">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      Need help? Contact us anytime
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 14px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      <a href="mailto:support@graphicwala.com" style="color: ${BRAND_RED}; text-decoration: none; font-weight: 600;">support@graphicwala.com</a>
                      <span style="color: ${BRAND_TEXT_MUTED}; padding: 0 8px;">|</span>
                      <a href="https://wa.me/917903060611" style="color: ${BRAND_RED}; text-decoration: none; font-weight: 600;">WhatsApp Support</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      © ${new Date().getFullYear()} Graphic Wala. All rights reserved.<br>
                      You're receiving this email because you made a purchase at Graphic Wala.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        <!-- End main container -->
        
      </td>
    </tr>
  </table>
  <!-- End email wrapper -->
  
</body>
</html>
  `;
}

async function sendOrderConfirmationEmail(orderData: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!orderData.email) {
      console.log('[Email] No email address provided, skipping email send');
      return { success: false, error: 'No email address provided' };
    }

    if (!RESEND_API_KEY) {
      console.error('[Email] RESEND_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const shortOrderId = orderData.orderId.slice(0, 8).toUpperCase();
    
    console.log('[Email] Sending order confirmation to:', orderData.email);

    const { data, error } = await sendEmail({
      from: "Graphic Wala <orders@graphicwala.com>",
      to: [orderData.email],
      subject: `Order Confirmed! 🎉 Your order #${shortOrderId} is being processed`,
      html: generateEmailHtml(orderData),
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error: typeof error === 'string' ? error : 'Failed to send email' };
    }

    console.log('[Email] Sent successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error: error.message };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: "Order ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('[Email] Fetching order details for:', orderId);

    // Fetch order details
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Email] Order not found:', orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // CRITICAL: Only send email for PAID orders
    if (order.payment_status !== 'paid') {
      console.log('[Email] Skipping - order not paid. Status:', order.payment_status);
      return new Response(
        JSON.stringify({ success: false, error: "Order not paid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        product_name,
        product_price,
        quantity,
        product_id
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('[Email] Error fetching order items:', itemsError);
    }

    // Fetch product images
    const productIds = orderItems?.map(item => item.product_id) || [];
    const { data: products } = await supabase
      .from('products')
      .select('id, image_url')
      .in('id', productIds);

    const productImageMap = new Map(products?.map(p => [p.id, p.image_url]) || []);

    const itemsWithImages = (orderItems || []).map(item => ({
      productName: item.product_name,
      productPrice: item.product_price,
      quantity: item.quantity,
      imageUrl: productImageMap.get(item.product_id) || null,
    }));

    const emailData: OrderEmailData = {
      orderId: order.id,
      customerName: order.customer_name || '',
      email: order.email || '',
      totalAmount: order.total_amount,
      deliveryMethod: order.delivery_method || 'home_delivery',
      estimatedDeliveryDate: order.estimated_delivery_date,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingState: order.shipping_state,
      shippingPincode: order.shipping_pincode,
      deliveryCharge: order.delivery_charge || 0,
      couponCode: order.coupon_code || null,
      couponDiscount: order.coupon_discount || 0,
      items: itemsWithImages,
    };

    const result = await sendOrderConfirmationEmail(emailData);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('[Email] Error in handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
