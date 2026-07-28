import { supabase, STORAGE_BUCKETS } from "../supabase";

export async function uploadFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File
): Promise<string> {
  const bucketName = STORAGE_BUCKETS[bucket];
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .remove([path]);
  if (error) throw error;
}
