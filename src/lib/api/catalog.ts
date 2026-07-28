import { supabase } from "../supabase";
import type { Category, Product } from "../types";

// ─── Categories ──────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function fetchActiveCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("ativa", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function createCategory(
  payload: Partial<Category>
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(
  id: string,
  payload: Partial<Category>
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Product[];
}

export async function fetchAvailableProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("disponivel", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as Product[];
}

export async function createProduct(
  payload: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  payload: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
