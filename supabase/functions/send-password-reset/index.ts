import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
      body: JSON.stringify({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API error:", errorData);
      return { error: errorData };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { error };
  }
}

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: PasswordResetRequest = await req.json();

    console.log("Sending password reset email to:", email);

    const emailResponse = await sendEmail({
      from: "Graphic Wala <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - Graphic Wala",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #E11D48 0%, #be123c 100%); padding: 32px 24px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                        Graphic Wala
                      </h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        Premium Custom Printing
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <!-- Icon -->
                      <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; line-height: 64px; font-size: 28px;">
                          🔐
                        </div>
                      </div>
                      
                      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 22px; font-weight: 600; text-align: center;">
                        Reset Your Password
                      </h2>
                      
                      <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.6; text-align: center;">
                        We received a request to reset your password. Click the button below to create a new password.
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #E11D48 0%, #be123c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(225,29,72,0.35);">
                          Reset Password
                        </a>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                          ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
                        </p>
                      </div>
                      
                      <!-- Alternative Link -->
                      <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${resetLink}" style="color: #E11D48; word-break: break-all;">${resetLink}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-align: center;">
                        Need help? Contact us on WhatsApp
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Graphic Wala. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Failed to send password reset email:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Password reset email sent successfully:", emailResponse.data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
