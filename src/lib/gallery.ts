import { GALLERY_BUCKET, supabase } from "./supabase";

export const GALLERY_CATEGORIES = [
  "General Contracting",
  "Commercial",
  "Residential",
  "Remodeling",
  "Painting",
  "Drywall",
  "Welding",
  "Fencing",
  "HVAC",
  "Plumbing",
] as const;

export type GalleryProject = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  image_path: string | null;
  location: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
};

export type GalleryProjectInput = Omit<GalleryProject, "id" | "created_at">;

const TABLE = "gallery_projects";

function client() {
  if (!supabase) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  return supabase;
}

export async function fetchProjects({ featuredOnly = false, limit }: { featuredOnly?: boolean; limit?: number } = {}) {
  let query = client()
    .from(TABLE)
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (featuredOnly) query = query.eq("featured", true);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GalleryProject[];
}

export async function fetchProject(id: string) {
  const { data, error } = await client().from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data as GalleryProject;
}

export async function createProject(input: GalleryProjectInput) {
  const { error } = await client().from(TABLE).insert(input);
  if (error) throw error;
}

export async function updateProject(id: string, input: Partial<GalleryProjectInput>) {
  const { error } = await client().from(TABLE).update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(project: GalleryProject) {
  const { error } = await client().from(TABLE).delete().eq("id", project.id);
  if (error) throw error;
  if (project.image_path) await removeImage(project.image_path);
}

export async function removeImage(path: string) {
  await client().storage.from(GALLERY_BUCKET).remove([path]);
}

// Image handling -------------------------------------------------------------

export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1920;

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Unsupported file type. Use JPEG, PNG, or WebP.";
  if (file.size > MAX_UPLOAD_BYTES) return "Image is larger than 5 MB. Choose a smaller file.";
  return null;
}

export async function compressImage(file: File): Promise<{ blob: Blob; ext: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  const webp = await toBlob("image/webp", 0.82);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpeg = await toBlob("image/jpeg", 0.85);
  if (jpeg) return { blob: jpeg, ext: "jpg" };
  return { blob: file, ext: file.name.split(".").pop() || "jpg" };
}

export async function uploadImage(file: File) {
  const { blob, ext } = await compressImage(file);
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "image";
  const path = `projects/${crypto.randomUUID()}-${base}.${ext}`;
  const storage = client().storage.from(GALLERY_BUCKET);
  const { error } = await storage.upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw error;
  return { path, url: storage.getPublicUrl(path).data.publicUrl };
}
