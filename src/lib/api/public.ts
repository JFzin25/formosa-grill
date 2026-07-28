import { supabase } from "../supabase";
import type { Category, Product, GalleryItem, Reservation, Settings, Review } from "../types";

// ─── Categorias (público: apenas ativas) ─────────────────────────────────────
export async function fetchActiveCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("ativa", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Category[];
}

// ─── Produtos (público: apenas disponíveis) ──────────────────────────────────
export async function fetchAvailableProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("disponivel", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Product[];
}

// ─── Galeria (público: apenas ativos) ─────────────────────────────────────────
export async function fetchActiveGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as GalleryItem[];
}

// ─── Reservas (criar nova reserva pública) ────────────────────────────────────
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

// ─── Configurações (público: leitura) ─────────────────────────────────────────
export async function fetchSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();
  if (error && error.code !== "PGRN1160") throw error;
  return data as Settings | null;
}

// ─── Avaliações (público: apenas aprovadas) ───────────────────────────────────
export async function fetchApprovedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Review[];
}
