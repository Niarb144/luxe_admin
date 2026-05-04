import { supabase } from "./supabase";

export async function uploadImage(file: File, folder = "tours") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from("tour-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("tour-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}