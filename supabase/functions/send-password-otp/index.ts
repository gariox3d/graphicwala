import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function otpEmailHtml(otp: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8f9fa;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#E11D48 0%,#be123c 100%);padding:32px 24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Graphic Wala</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">Premium Custom Printing</p>
      </td></tr>
      <tr><td style="padding:40px 32px;text-align:center;">
        <div style="display:inline-block;width:64px;height:64px;background:#fef2f2;border-radius:50%;line-height:64px;font-size:28px;margin-bottom:20px;">🔐</div>
        <h2 style="margin:0 0 12px;color:#1f2937;font-size:22px;font-weight:600;">Your Password Reset OTP</h2>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">Use the code below to reset your password. This code will expire in 10 minutes.</p>
        <div style="display:inline-block;background:#fef2f2;border:2px dashed #E11D48;border-radius:12px;padding:20px 32px;margin:8px 0 24px;">
          <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#E11D48;font-family:'Courier New',monospace;">${otp}</div>
        </div>
        <div style="background:#fef3c7;border-radius:8px;padding:14px;margin-top:16px;text-align:left;">
          <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">⚠️ <strong>Security:</strong> Never share this code with anyone. If you didn't request this, ignore this email.</p>
        </div>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Graphic Wala. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Check if user actually exists (silently — always return success to caller)
    const { data: userLookup } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const userExists = userLookup?.users?.some((u) => (u.email || "").toLowerCase() === normalizedEmail);

    if (userExists) {
      // Generate 6-digit OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = await sha256(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Invalidate old OTPs for this email
      await admin.from("password_reset_otps").update({ used: true }).eq("email", normalizedEmail).eq("used", false);

      const { error: insertErr } = await admin.from("password_reset_otps").insert({
        email: normalizedEmail,
        otp_hash: otpHash,
        expires_at: expiresAt,
      });
      if (insertErr) console.error("OTP insert error:", insertErr);

      // Send email via Resend
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Graphic Wala <orders@graphicwala.com>",
          to: [normalizedEmail],
          subject: `${otp} is your Graphic Wala password reset code`,
          html: otpEmailHtml(otp),
        }),
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        console.error("Resend error:", resp.status, errBody);
      }
    }

    // Always same response to prevent enumeration
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("send-password-otp error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});