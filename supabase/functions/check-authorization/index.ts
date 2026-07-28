import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if profiles table is empty (first user scenario)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (profilesError) {
      console.error("Error checking profiles:", profilesError);
      return new Response(JSON.stringify({ error: "Failed to check profiles" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isFirstUser = !profiles || profiles.length === 0;

    if (isFirstUser) {
      return new Response(
        JSON.stringify({
          authorized: true,
          isFirstUser: true,
          role: "admin",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Check authorized_emails table for active email (case-insensitive check)
    const { data: authorizedEmail, error: authEmailError } = await supabase
      .from("authorized_emails")
      .select("role")
      .ilike("email", email.trim())
      .eq("status", "active")
      .maybeSingle();

    if (authEmailError) {
      console.error("Error checking authorized emails:", authEmailError);
      return new Response(JSON.stringify({ error: "Failed to check authorization" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (authorizedEmail) {
      return new Response(
        JSON.stringify({
          authorized: true,
          isFirstUser: false,
          role: authorizedEmail.role,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // If not found in authorized_emails
    return new Response(
      JSON.stringify({
        authorized: false,
        message: "Seu e-mail ainda não foi autorizado pelo administrador.",
      }),
      {
        status: 200, // Returning 200 with authorized: false as specified
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error in check-authorization:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
