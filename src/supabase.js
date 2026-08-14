import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env. " +
    "File uploads will not work. Restart the dev server after adding the keys."
  );
}

// Use placeholder strings as fallback so the app doesn't crash on load
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

const BUCKET = "client-documents";

export const storageService = {
  /**
   * Upload a client document file to Supabase Storage.
   * Path: clients/{clientId}/doc-{slotIdx}-{timestamp}.{ext}
   * Returns { path, publicUrl }
   */
  uploadClientDoc: async (clientId, slotIdx, file) => {
    const ext = file.name.split(".").pop();
    const path = "clients/" + clientId + "/doc-" + slotIdx + "-" + Date.now() + "." + ext;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { path, publicUrl: urlData.publicUrl };
  },

  /**
   * Delete a file from Supabase Storage by its stored path.
   */
  deleteFile: async (path) => {
    if (!path) return;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) console.warn("Supabase delete warning:", error.message);
  },

  /**
   * Upload a generated agreement PDF blob to Supabase Storage.
   * Path: agreements/{clientId}/agreement-{timestamp}.pdf
   * Returns { path, publicUrl }
   */
  uploadAgreementPDF: async (clientId, blob) => {
    const path = "agreements/" + clientId + "/agreement-" + Date.now() + ".pdf";
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: "application/pdf", upsert: true });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { path, publicUrl: urlData.publicUrl };
  }
};