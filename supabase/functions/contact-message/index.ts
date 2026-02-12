import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message, company }: ContactPayload = await req.json();

    if (company) {
      return new Response(
        JSON.stringify({ error: "Invalid submission." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (message.length < 5 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message length is invalid." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Server not configured." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ipAddress = forwardedFor.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;
    let userId: string | null = null;

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: authData } = await authedClient.auth.getUser();
        userId = authData?.user?.id ?? null;
      }
    }

    const rateLimitSeconds = Number(Deno.env.get("CONTACT_RATE_LIMIT_SECONDS") || "60");
    if (ipAddress) {
      const { data: recent } = await admin
        .from("contact_messages")
        .select("id, created_at")
        .eq("ip_address", ipAddress)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recent?.created_at) {
        const last = new Date(recent.created_at).getTime();
        const now = Date.now();
        if (now - last < rateLimitSeconds * 1000) {
          return new Response(
            JSON.stringify({ error: "Please wait a moment before sending another message." }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
      }
    }

    const { error: insertError, data } = await admin
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to save message." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const CONTACT_RECEIVER_EMAIL = Deno.env.get("CONTACT_RECEIVER_EMAIL");
    const CONTACT_SENDER_EMAIL =
      Deno.env.get("CONTACT_SENDER_EMAIL") ?? "onboarding@resend.dev";

    let emailStatus: "skipped" | "sent" | "failed" = "skipped";
    let emailError: string | undefined;

    if (RESEND_API_KEY && CONTACT_RECEIVER_EMAIL) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: CONTACT_SENDER_EMAIL,
          to: [CONTACT_RECEIVER_EMAIL],
          subject: `New Contact Message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}\n\nMessage ID: ${data?.id}`,
        }),
      });

      if (resendRes.ok) {
        emailStatus = "sent";
      } else {
        emailStatus = "failed";
        emailError = await resendRes.text();
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        id: data?.id,
        emailStatus,
        emailError,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as any)?.message || "Unexpected error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
