import { supabase } from "./supabase";
import type { Profile, Role } from "./types";

// ─── Auth Context ─────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/admin`,
    },
  });
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  // 1. Check authorization before creating the user
  const { data: authCheck } = await supabase
    .from("authorized_emails")
    .select("email, status, role")
    .eq("email", email)
    .single();

  // Check if profiles table is empty (first user = admin)
  const { count: profileCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const isFirstUser = profileCount === 0;

  if (!isFirstUser) {
    if (!authCheck) {
      return {
        success: false,
        message: "Seu e-mail ainda não foi autorizado pelo administrador.",
      };
    }
    if (authCheck.status !== "active") {
      return {
        success: false,
        message: "Seu e-mail está inativo. Contate o administrador.",
      };
    }
  }

  // 2. Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) {
    return { success: false, message: "Falha ao criar usuário." };
  }

  // 3. The trigger on auth.users will create the profile automatically
  return {
    success: true,
    message: isFirstUser
      ? "Conta de administrador criada com sucesso! Verifique seu e-mail para confirmar."
      : "Conta criada! Verifique seu e-mail para confirmar.",
  };
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// ─── Permission Helpers ──────────────────────────────────────────────────────

export function hasRole(profile: Profile | null, ...roles: Role[]): boolean {
  if (!profile) return false;
  return roles.includes(profile.role);
}

export function isAdmin(profile: Profile | null): boolean {
  return hasRole(profile, "admin");
}

export function isManagerOrAbove(profile: Profile | null): boolean {
  return hasRole(profile, "admin", "manager");
}

export function isStaff(profile: Profile | null): boolean {
  return hasRole(profile, "admin", "manager", "employee");
}
