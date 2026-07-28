import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, otp, newPassword } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const otpStr = String(otp || "").trim();

    if (!normalizedEmail || !/^\d{6}$/.test(otpStr)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!newPassword || String(newPassword).length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Fetch latest active OTP for email
    const { data: rows, error: selErr } = await admin
      .from("password_reset_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selErr) {
      console.error("select error:", selErr);
      return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const record = rows?.[0];
    if (!record) {
      return new Response(JSON.stringify({ error: "OTP not found or expired. Please request a new one." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (new Date(record.expires_at) < new Date()) {
      await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);
      return new Response(JSON.stringify({ error: "OTP has expired. Please request a new one." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (record.attempts >= 5) {
      await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);
      return new Response(JSON.stringify({ error: "Too many wrong attempts. Please request a new OTP." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const hash = await sha256(otpStr);
    if (hash !== record.otp_hash) {
      await admin.from("password_reset_otps").update({ attempts: record.attempts + 1 }).eq("id", record.id);
      const remaining = Math.max(0, 4 - record.attempts);
      return new Response(JSON.stringify({ error: `Wrong OTP. ${remaining} attempt(s) left.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // OTP correct → find user and update password
    const { data: userLookup } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const user = userLookup?.users?.find((u) => (u.email || "").toLowerCase() === normalizedEmail);

    if (!user) {
      await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);
      return new Response(JSON.stringify({ error: "Account not found." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { error: updErr } = await admin.auth.admin.updateUserById(user.id, { password: String(newPassword) });
    if (updErr) {
      console.error("password update error:", updErr);
      return new Response(JSON.stringify({ error: "Failed to update password. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("verify-password-otp error:", e);
    return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});