import { supabase } from "../supabase";
import type { GalleryItem, Banner } from "../types";

// ─── Gallery ──────────────────────────────────────────────────────────────────

export async function fetchGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as GalleryItem[];
}

export async function fetchActiveGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as GalleryItem[];
}

export async function createGalleryItem(
  payload: Partial<GalleryItem>
): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from("gallery")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as GalleryItem;
}

export async function updateGalleryItem(
  id: string,
  payload: Partial<GalleryItem>
): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from("gallery")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as GalleryItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Banner[];
}

export async function fetchActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Banner[];
}

export async function createBanner(
  payload: Partial<Banner>
): Promise<Banner> {
  const { data, error } = await supabase
    .from("banners")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Banner;
}

export async function updateBanner(
  id: string,
  payload: Partial<Banner>
): Promise<Banner> {
  const { data, error } = await supabase
    .from("banners")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw error;
}
