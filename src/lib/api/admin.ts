import { supabase } from "../supabase";
import type { Profile, AuthorizedEmail, LogEntry, Role } from "../types";

// ─── Profiles ──────────────────────────────────────────────────────────────────

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(
  id: string,
  payload: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

// ─── Authorized Emails ─────────────────────────────────────────────────────────

export async function fetchAuthorizedEmails(): Promise<AuthorizedEmail[]> {
  const { data, error } = await supabase
    .from("authorized_emails")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AuthorizedEmail[];
}

export async function createAuthorizedEmail(
  email: string,
  role: Role
): Promise<AuthorizedEmail> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("authorized_emails")
    .insert({ email, role, authorized_by: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as AuthorizedEmail;
}

export async function updateAuthorizedEmail(
  id: string,
  payload: Partial<AuthorizedEmail>
): Promise<AuthorizedEmail> {
  const { data, error } = await supabase
    .from("authorized_emails")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AuthorizedEmail;
}

export async function deleteAuthorizedEmail(id: string): Promise<void> {
  const { error } = await supabase
    .from("authorized_emails")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── Logs ──────────────────────────────────────────────────────────────────────

export async function fetchLogs(): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data as LogEntry[];
}

export async function createLog(entry: {
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  await supabase.from("logs").insert({
    user_id: user.id,
    user_email: profile?.email ?? user.email,
    acao: entry.action,
    entidade: entry.entity ?? null,
    entidade_id: entry.entityId ?? null,
    detalhes: entry.details ?? null,
  });
}
