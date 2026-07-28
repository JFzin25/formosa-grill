import { supabase } from "../supabase";
import type { Reservation, Contact, Settings, Review } from "../types";

// ─── Reservations ────────────────────────────────────────────────────────────

export async function fetchReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Reservation[];
}

export async function createReservation(
  payload: Partial<Reservation>
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Reservation;
}

export async function updateReservation(
  id: string,
  payload: Partial<Reservation>
): Promise<Reservation> {
  const { data, error } = await supabase
    .from("reservations")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Reservation;
}

export async function deleteReservation(id: string): Promise<void> {
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) throw error;
}

// ─── Contacts ──────────────────────────────────────────────────────────────────

export async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Contact[];
}

export async function createContact(
  payload: Partial<Contact>
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}

export async function updateContact(
  id: string,
  payload: Partial<Contact>
): Promise<Contact> {
  const { data, error } = await supabase
    .from("contacts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();
  if (error && error.code !== "PGRN1160") throw error;
  return data as Settings | null;
}

export async function updateSettings(
  id: string,
  payload: Partial<Settings>
): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Settings;
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Review[];
}

export async function fetchApprovedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Review[];
}

export async function createReview(
  payload: Partial<Review>
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

export async function updateReview(
  id: string,
  payload: Partial<Review>
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
