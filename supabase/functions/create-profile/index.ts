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
    const { userId, email } = await req.json();

    if (!userId || !email || typeof userId !== "string" || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "userId and email are required" }), {
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

    // 1. Check if profiles table is empty
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

    let targetRole = "admin";
    let isAuthorized = false;

    if (isFirstUser) {
      isAuthorized = true;
      targetRole = "admin";
    } else {
      // Check authorized_emails table
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
        isAuthorized = true;
        targetRole = authorizedEmail.role;
      }
    }

    if (!isAuthorized) {
      console.log(`User ${email} (${userId}) is not authorized. Deleting auth user...`);
      // Delete the auth user using Admin API
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error("Failed to delete unauthorized user from Auth:", deleteError);
      }

      return new Response(
        JSON.stringify({ error: "Seu e-mail ainda não foi autorizado pelo administrador." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create the user profile
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          email: email.trim().toLowerCase(),
          role: targetRole,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create profile:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create profile record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile created successfully",
        profile,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error in create-profile:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
