import { supabase } from "./supabase";

const BUCKET_NAME = "gallery";

export async function listGalleryPhotos() {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, title, event, event_date, storage_path")
    .eq("published", true)
    .order("event_date", { ascending: false });

  if (error) throw error;

  return data.map((photo) => {
    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(photo.storage_path);

    return {
      id: photo.id,
      title: photo.title || "Foto do Boteco do Hudson",
      event: photo.event || "Eventos do Boteco",
      date: photo.event_date
        ? new Date(`${photo.event_date}T12:00:00`).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "",
      src: publicUrl.publicUrl,
    };
  });
}
