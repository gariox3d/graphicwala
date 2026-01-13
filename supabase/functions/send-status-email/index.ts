import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

// Status configurations
const STATUS_CONFIG: Record<string, {
  subject: string;
  heading: string;
  message: string;
  icon: string;
  iconBg: string;
  ctaText: string;
  ctaUrl: string;
}> = {
  designing: {
    subject: "Your Order is Being Designed",
    heading: "Design in Progress! 🎨",
    message: "Our creative team has started working on your order. We're crafting something special just for you!",
    icon: "🎨",
    iconBg: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
    ctaText: "View Order",
    ctaUrl: "https://store.graphicwala.com/dashboard",
  },
  approved: {
    subject: "Your Design is Approved",
    heading: "Design Approved! ✅",
    message: "Great news! Your design has been approved and is now ready for production.",
    icon: "✅",
    iconBg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    ctaText: "View Order",
    ctaUrl: "https://store.graphicwala.com/dashboard",
  },
  printing: {
    subject: "Your Order is in Production",
    heading: "Printing in Progress! 🖨️",
    message: "Your order has entered the production phase. Our skilled team is bringing your design to life with premium quality materials.",
    icon: "🖨️",
    iconBg: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    ctaText: "View Order",
    ctaUrl: "https://store.graphicwala.com/dashboard",
  },
  shipped: {
    subject: "Your Order Has Been Shipped",
    heading: "Order Shipped! 🚚",
    message: "Exciting news! Your order is on its way to you. It will reach you soon!",
    icon: "🚚",
    iconBg: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
    ctaText: "Track Order",
    ctaUrl: "https://store.graphicwala.com/dashboard",
  },
  completed: {
    subject: "Your Order Has Been Delivered",
    heading: "Order Delivered! 🎉",
    message: "Your order has been successfully delivered. We hope you love it! Thank you for choosing Graphic Wala.",
    icon: "🎉",
    iconBg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    ctaText: "Shop Again",
    ctaUrl: "https://store.graphicwala.com/products",
  },
};

interface StatusEmailRequest {
  orderId: string;
  newStatus: string;
}

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateStatusEmailHtml(
  orderData: {
    orderId: string;
    customerName: string;
    totalAmount: number;
    productName: string;
    productImage: string | null;
    quantity: number;
  },
  statusConfig: typeof STATUS_CONFIG[string]
): string {
  const shortOrderId = orderData.orderId.slice(0, 8).toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${statusConfig.subject} - Graphic Wala</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_GRAY}; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${statusConfig.message}
  </div>
  
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${BRAND_GRAY};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: ${BRAND_WHITE}; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_RED} 0%, #BE123C 100%); padding: 32px 40px; text-align: center;">
              <div style="background: ${BRAND_WHITE}; border-radius: 12px; padding: 12px 24px; display: inline-block;">
                <span style="font-size: 24px; font-weight: 700; color: ${BRAND_RED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif; letter-spacing: -0.5px;">
                  Graphic Wala
                </span>
              </div>
            </td>
          </tr>
          
          <!-- Status Icon and Heading -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center;">
              <div style="width: 72px; height: 72px; background: ${statusConfig.iconBg}; border-radius: 50%; margin: 0 auto 20px; display: inline-block; line-height: 72px;">
                <span style="font-size: 36px;">${statusConfig.icon}</span>
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${statusConfig.heading}</h1>
              <p style="margin: 0; font-size: 16px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6;">
                ${statusConfig.message}
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
          
          <!-- Product Preview -->
          <tr>
            <td style="padding: 24px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid ${BRAND_BORDER}; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="70" style="vertical-align: top;">
                          <div style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: ${BRAND_GRAY};">
                            ${orderData.productImage 
                              ? `<img src="${orderData.productImage}" alt="${orderData.productName}" style="width: 60px; height: 60px; object-fit: cover; display: block;" />`
                              : `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, ${BRAND_RED}20 0%, ${BRAND_GRAY} 100%); display: flex; align-items: center; justify-content: center;">
                                  <span style="font-size: 20px;">📦</span>
                                </div>`
                            }
                          </div>
                        </td>
                        <td style="vertical-align: top; padding-left: 12px;">
                          <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: ${BRAND_TEXT_DARK}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${orderData.productName}</p>
                          <p style="margin: 0 0 4px 0; font-size: 13px; color: ${BRAND_TEXT_MUTED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Qty: ${orderData.quantity}</p>
                          <p style="margin: 0; font-size: 15px; font-weight: 600; color: ${BRAND_RED}; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Total: ${formatCurrency(orderData.totalAmount)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 8px 40px 32px; text-align: center;">
              <a href="${statusConfig.ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_RED} 0%, #BE123C 100%); color: ${BRAND_WHITE}; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; font-family: 'Segoe UI', Roboto, Arial, sans-serif; box-shadow: 0 4px 14px -3px rgba(225, 29, 72, 0.5);">
                ${statusConfig.ctaText}
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; background: ${BRAND_GRAY}; border-top: 1px solid ${BRAND_BORDER};">
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
                      © ${new Date().getFullYear()} Graphic Wala. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, newStatus }: StatusEmailRequest = await req.json();

    console.log(`[StatusEmail] Processing status email for order ${orderId}, status: ${newStatus}`);

    // Check if this status has an email template
    const statusConfig = STATUS_CONFIG[newStatus];
    if (!statusConfig) {
      console.log(`[StatusEmail] No email template for status: ${newStatus}`);
      return new Response(
        JSON.stringify({ success: true, message: "No email for this status" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("[StatusEmail] Order not found:", orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if email was already sent for this status
    const sentEmails: string[] = order.status_emails_sent || [];
    if (sentEmails.includes(newStatus)) {
      console.log(`[StatusEmail] Email already sent for status ${newStatus}, skipping`);
      return new Response(
        JSON.stringify({ success: true, message: "Email already sent for this status" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if customer has email
    if (!order.email) {
      console.log("[StatusEmail] No email address for customer, skipping");
      return new Response(
        JSON.stringify({ success: true, message: "No customer email" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch first order item for preview
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_name, quantity, product_price, product_id")
      .eq("order_id", orderId)
      .limit(1);

    const firstItem = orderItems?.[0];
    let productImage: string | null = null;

    if (firstItem) {
      // Get product image
      const { data: product } = await supabase
        .from("products")
        .select("image_url")
        .eq("id", firstItem.product_id)
        .single();
      
      productImage = product?.image_url || null;
    }

    // Generate email HTML
    const emailHtml = generateStatusEmailHtml(
      {
        orderId: order.id,
        customerName: order.customer_name || "Valued Customer",
        totalAmount: order.total_amount,
        productName: firstItem?.product_name || "Your Order",
        productImage,
        quantity: firstItem?.quantity || 1,
      },
      statusConfig
    );

    // Send email
    const { data: emailResult, error: emailError } = await sendEmail({
      from: "Graphic Wala <onboarding@resend.dev>",
      to: [order.email],
      subject: `${statusConfig.subject} - Order #${order.id.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("[StatusEmail] Failed to send email:", emailError);
      return new Response(
        JSON.stringify({ success: false, error: emailError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[StatusEmail] Email sent successfully for status ${newStatus}`);

    // Update order to mark this status email as sent
    const updatedSentEmails = [...sentEmails, newStatus];
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status_emails_sent: updatedSentEmails })
      .eq("id", orderId);

    if (updateError) {
      console.error("[StatusEmail] Failed to update sent emails tracking:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult?.id }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[StatusEmail] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
