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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Missing configuration env variables" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const requestUrl = new URL(req.url);

  // --- GET Flow (Standard Redirect Handler for PKCE Auth Code Exchange) ---
  if (req.method === "GET") {
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/";

    // Determine target redirect URL
    let nextUrl = "http://localhost:5173";
    const referer = req.headers.get("referer");
    if (next.startsWith("http://") || next.startsWith("https://")) {
      nextUrl = next;
    } else if (referer) {
      try {
        nextUrl = new URL(next, referer).toString();
      } catch (_) {
        nextUrl = new URL(next, "http://localhost:5173").toString();
      }
    } else {
      nextUrl = new URL(next, "http://localhost:5173").toString();
    }

    if (!code) {
      // If code is missing, redirect back with error or display error
      const errorRedirect = new URL(nextUrl);
      errorRedirect.searchParams.set("error", "missing_code");
      errorRedirect.searchParams.set("message", "Código de autenticação ausente.");
      return Response.redirect(errorRedirect.toString(), 302);
    }

    try {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !data.session || !data.user) {
        console.error("Exchange code failed:", exchangeError);
        const errorRedirect = new URL(nextUrl);
        errorRedirect.searchParams.set("error", "exchange_failed");
        errorRedirect.searchParams.set("message", "Falha na troca do código de login.");
        return Response.redirect(errorRedirect.toString(), 302);
      }

      const user = data.user;
      const email = user.email;

      if (!email) {
        console.error("No email associated with Google OAuth user");
        await supabase.auth.admin.deleteUser(user.id);
        const errorRedirect = new URL(nextUrl);
        errorRedirect.searchParams.set("error", "email_missing");
        errorRedirect.searchParams.set("message", "Não foi possível obter o e-mail do Google.");
        return Response.redirect(errorRedirect.toString(), 302);
      }

      // 1. Check if profiles table is empty (first user scenario)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (profilesError) {
        console.error("Error checking profiles:", profilesError);
        const errorRedirect = new URL(nextUrl);
        errorRedirect.searchParams.set("error", "profiles_check_failed");
        return Response.redirect(errorRedirect.toString(), 302);
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
          const errorRedirect = new URL(nextUrl);
          errorRedirect.searchParams.set("error", "auth_check_failed");
          return Response.redirect(errorRedirect.toString(), 302);
        }

        if (authorizedEmail) {
          isAuthorized = true;
          targetRole = authorizedEmail.role;
        }
      }

      if (!isAuthorized) {
        console.log(`OAuth user ${email} is not authorized. Deleting auth user...`);
        // Signs out and deletes user
        await supabase.auth.admin.deleteUser(user.id);

        const errorRedirect = new URL(nextUrl);
        errorRedirect.searchParams.set("error", "unauthorized");
        errorRedirect.searchParams.set(
          "message",
          "Seu e-mail ainda não foi autorizado pelo administrador.",
        );
        return Response.redirect(errorRedirect.toString(), 302);
      }

      // Check if profile already exists for this user ID
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error("Profile check error:", profileCheckError);
      }

      if (!existingProfile) {
        // Create user profile
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            email: email.trim().toLowerCase(),
            role: targetRole,
          },
        ]);

        if (insertError) {
          console.error("Failed to insert profile:", insertError);
        }
      }

      // Construct final redirect with tokens in hash fragment so client SDK can consume them
      const successRedirect = new URL(nextUrl);
      successRedirect.hash = `access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_in=${data.session.expires_in}&token_type=bearer`;
      return Response.redirect(successRedirect.toString(), 302);
    } catch (err) {
      console.error("Unexpected error in GET callback:", err);
      const errorRedirect = new URL(nextUrl);
      errorRedirect.searchParams.set("error", "unexpected_error");
      return Response.redirect(errorRedirect.toString(), 302);
    }
  }

  // --- POST Flow (Manual API check from client after OAuth) ---
  if (req.method === "POST") {
    try {
      const body = await req.json().catch(() => ({}));
      let userId = body.userId;
      let email = body.email;

      // Try to read user from authorization header if not provided in body
      const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
      if (authHeader && (!userId || !email)) {
        const token = authHeader.replace("Bearer ", "");
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(token);
        if (!userError && user) {
          userId = user.id;
          email = user.email;
        }
      }

      if (!userId || !email) {
        return new Response(JSON.stringify({ error: "userId and email are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
        console.log(`POST OAuth user ${email} is not authorized. Deleting auth user...`);
        // Signs out/deletes user
        await supabase.auth.admin.deleteUser(userId);

        return new Response(
          JSON.stringify({ error: "Seu e-mail ainda não foi autorizado pelo administrador." }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Check and insert profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      let profile = existingProfile;

      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
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
          console.error("Failed to insert profile:", insertError);
        } else {
          profile = newProfile;
        }
      }

      return new Response(
        JSON.stringify({
          authorized: true,
          message: "User authorized and profile ensured.",
          profile,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (err) {
      console.error("Unexpected error in POST callback:", err);
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
