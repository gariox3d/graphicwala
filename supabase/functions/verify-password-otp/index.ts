import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
    if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("Backend configuration is unavailable");

    const { action = "verify", email, otp, resetId, resetToken, newPassword } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const otpStr = String(otp || "").trim();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    if (action === "reset") {
      if (!resetId || !resetToken || !newPassword || String(newPassword).length < 8) {
        return new Response(JSON.stringify({ success: false, error: "Password must be at least 8 characters." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: record, error: recordError } = await admin
        .from("password_reset_otps")
        .select("id, email, otp_hash, expires_at, used")
        .eq("id", resetId)
        .eq("used", false)
        .maybeSingle();

      if (recordError || !record || new Date(record.expires_at) < new Date()) {
        return new Response(JSON.stringify({ success: false, error: "Verification expired. Please request a new OTP." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (await sha256(String(resetToken)) !== record.otp_hash) {
        return new Response(JSON.stringify({ success: false, error: "Invalid verification. Please request a new OTP." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let matchedUser: { id: string } | undefined;
      for (let page = 1; page <= 20 && !matchedUser; page += 1) {
        const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (usersError) throw usersError;
        matchedUser = usersPage.users.find((user) => (user.email || "").toLowerCase() === record.email);
        if (usersPage.users.length < 1000) break;
      }

      if (!matchedUser) {
        await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);
        return new Response(JSON.stringify({ success: false, error: "Account not found." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(matchedUser.id, { password: String(newPassword) });
      if (updateError) {
        console.error("password update error:", updateError);
        const message = updateError.code === "weak_password"
          ? "This password is unsafe or commonly used. Please choose a stronger, unique password."
          : "Password could not be updated. Please try a different password.";
        return new Response(JSON.stringify({ success: false, error: message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!normalizedEmail || !/^\d{6}$/.test(otpStr)) {
      return new Response(JSON.stringify({ success: false, error: "Enter the valid 6-digit OTP." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
      return new Response(JSON.stringify({ success: false, error: "OTP not found or expired. Please request a new one." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (new Date(record.expires_at) < new Date()) {
      await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);
      return new Response(JSON.stringify({ success: false, error: "OTP has expired. Please request a new one." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (record.attempts >= 5) {
      await admin.from("password_reset_otps").update({ used: true }).eq("id", record.id);
      return new Response(JSON.stringify({ success: false, error: "Too many wrong attempts. Please request a new OTP." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const hash = await sha256(otpStr);
    if (hash !== record.otp_hash) {
      await admin.from("password_reset_otps").update({ attempts: record.attempts + 1 }).eq("id", record.id);
      const remaining = Math.max(0, 4 - record.attempts);
      return new Response(JSON.stringify({ success: false, error: `Wrong OTP. ${remaining} attempt(s) left.` }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Exchange the correct OTP for a short-lived, single-use reset token.
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(tokenBytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const tokenHash = await sha256(token);
    const resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: tokenError } = await admin
      .from("password_reset_otps")
      .update({ otp_hash: tokenHash, expires_at: resetExpiresAt, attempts: 0 })
      .eq("id", record.id);
    if (tokenError) throw tokenError;

    return new Response(JSON.stringify({ success: true, resetId: record.id, resetToken: token }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: unknown) {
    console.error("verify-password-otp error:", e);
    const message = e instanceof Error ? e.message : "Server error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});