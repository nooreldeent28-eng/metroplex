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
  photo_count?: number;
};

export type GalleryProjectInput = Omit<GalleryProject, "id" | "created_at" | "photo_count">;

export type PhotoPhase = "before" | "after";

export type ProjectPhoto = {
  id: string;
  project_id: string;
  image_url: string;
  image_path: string | null;
  phase: PhotoPhase;
  display_order: number;
  created_at: string;
};

export const MAX_PROJECT_PHOTOS = 30;

const TABLE = "gallery_projects";
const PHOTOS_TABLE = "gallery_project_photos";

function client() {
  if (!supabase) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  return supabase;
}

export async function fetchProjects({ featuredOnly = false, limit }: { featuredOnly?: boolean; limit?: number } = {}) {
  const run = (select: string) => {
    let query = client()
      .from(TABLE)
      .select(select)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (featuredOnly) query = query.eq("featured", true);
    if (limit) query = query.limit(limit);
    return query;
  };
  let { data, error } = await run(`*, photos:${PHOTOS_TABLE}(count)`);
  // Falls back when project-photos.sql has not been run yet.
  if (error) ({ data, error } = await run("*"));
  if (error) throw error;
  return ((data ?? []) as unknown as (GalleryProject & { photos?: { count: number }[] })[]).map(({ photos, ...p }) => ({
    ...p,
    photo_count: photos?.[0]?.count ?? 0,
  }));
}

export async function fetchProject(id: string) {
  const { data, error } = await client().from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data as GalleryProject;
}

export async function createProject(input: GalleryProjectInput) {
  const { data, error } = await client().from(TABLE).insert(input).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function updateProject(id: string, input: Partial<GalleryProjectInput>) {
  const { error } = await client().from(TABLE).update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(project: GalleryProject) {
  const photos = await fetchPhotos(project.id).catch(() => [] as ProjectPhoto[]);
  const { error } = await client().from(TABLE).delete().eq("id", project.id);
  if (error) throw error;
  const paths = [project.image_path, ...photos.map((p) => p.image_path)].filter((p): p is string => Boolean(p));
  if (paths.length) await removeImages(paths);
}

export async function removeImage(path: string) {
  await removeImages([path]);
}

async function removeImages(paths: string[]) {
  await client().storage.from(GALLERY_BUCKET).remove(paths);
}

// Before & after photos ------------------------------------------------------

export async function fetchPhotos(projectId: string) {
  const { data, error } = await client()
    .from(PHOTOS_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectPhoto[];
}

export async function addPhoto(projectId: string, file: File, phase: PhotoPhase, displayOrder: number) {
  const { path, url } = await uploadImage(file, `projects/${projectId}`);
  const { data, error } = await client()
    .from(PHOTOS_TABLE)
    .insert({ project_id: projectId, image_url: url, image_path: path, phase, display_order: displayOrder })
    .select("*")
    .single();
  if (error) {
    await removeImage(path).catch(() => {});
    throw error;
  }
  return data as ProjectPhoto;
}

export async function updatePhoto(id: string, input: Partial<Pick<ProjectPhoto, "phase" | "display_order">>) {
  const { error } = await client().from(PHOTOS_TABLE).update(input).eq("id", id);
  if (error) throw error;
}

export async function deletePhoto(photo: ProjectPhoto) {
  const { error } = await client().from(PHOTOS_TABLE).delete().eq("id", photo.id);
  if (error) throw error;
  if (photo.image_path) await removeImage(photo.image_path);
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

export async function uploadImage(file: File, folder = "projects") {
  const { blob, ext } = await compressImage(file);
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "image";
  const path = `${folder}/${crypto.randomUUID()}-${base}.${ext}`;
  const storage = client().storage.from(GALLERY_BUCKET);
  const { error } = await storage.upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw error;
  return { path, url: storage.getPublicUrl(path).data.publicUrl };
}
