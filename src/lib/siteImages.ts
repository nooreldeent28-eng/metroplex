import { useEffect, useState } from "react";
import { removeImage, uploadImage } from "./gallery";
import { supabase } from "./supabase";

const unsplash = (id: string, w: number) => `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`;

export const SITE_IMAGE_SLOTS = [
  { key: "hero", label: "Hero Background", where: "Top of the homepage, behind the main headline.", tip: "Wide landscape photo, at least 1920px wide.", maxSize: 2400, default: unsplash("1541888946425-d81bb19240f5", 2000) },
  { key: "gc_commercial", label: "Commercial Contracting Card", where: "General Contracting section, left card.", tip: "Landscape photo of a commercial space.", maxSize: 1600, default: unsplash("1497366216548-37526070297c", 900) },
  { key: "gc_residential", label: "Residential Contracting Card", where: "General Contracting section, right card.", tip: "Landscape photo of a home.", maxSize: 1600, default: unsplash("1600585154340-be6161a56a0c", 900) },
  { key: "split_commercial", label: "Commercial Panel", where: "Large Commercial panel below the services.", tip: "Tall or square photo; text sits over the bottom.", maxSize: 1920, default: unsplash("1504307651254-35680f356dfd", 1200) },
  { key: "split_residential", label: "Residential Panel", where: "Large Residential panel below the services.", tip: "Tall or square photo; text sits over the bottom.", maxSize: 1920, default: unsplash("1600607687939-ce8a6c25118c", 1200) },
  { key: "about", label: "About Section Photo", where: "About Metroplex section.", tip: "Landscape photo of your team or work.", maxSize: 1600, default: unsplash("1503387762-592deb58ef4e", 1000) },
] as const;

export type SiteImageKey = (typeof SITE_IMAGE_SLOTS)[number]["key"];
export type SiteImageRow = { key: string; image_url: string; image_path: string | null };
type SiteImageMap = Record<SiteImageKey, string>;

const TABLE = "site_images";
const CACHE_KEY = "metroplex:site-images";

const defaults = Object.fromEntries(SITE_IMAGE_SLOTS.map((s) => [s.key, s.default])) as SiteImageMap;

function cached(): SiteImageMap {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

let request: Promise<SiteImageRow[]> | null = null;

export function fetchSiteImages(force = false) {
  if (!supabase) return Promise.resolve([] as SiteImageRow[]);
  if (!request || force) {
    request = Promise.resolve(
      supabase.from(TABLE).select("key, image_url, image_path").then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as SiteImageRow[];
      }),
    );
  }
  return request;
}

// Returns stored overrides merged over defaults; cached locally to avoid a flash of the stock photo.
export function useSiteImages(): SiteImageMap {
  const [images, setImages] = useState<SiteImageMap>(cached);

  useEffect(() => {
    fetchSiteImages()
      .then((rows) => {
        const overrides = Object.fromEntries(rows.map((r) => [r.key, r.image_url]));
        localStorage.setItem(CACHE_KEY, JSON.stringify(overrides));
        setImages({ ...defaults, ...overrides });
      })
      .catch(() => {});
  }, []);

  return images;
}

export async function setSiteImage(key: SiteImageKey, file: File, maxSize: number, previous?: SiteImageRow) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { path, url } = await uploadImage(file, "site", maxSize);
  const { error } = await supabase
    .from(TABLE)
    .upsert({ key, image_url: url, image_path: path, updated_at: new Date().toISOString() });
  if (error) {
    await removeImage(path).catch(() => {});
    throw error;
  }
  if (previous?.image_path) await removeImage(previous.image_path).catch(() => {});
  localStorage.removeItem(CACHE_KEY);
  return { key, image_url: url, image_path: path } as SiteImageRow;
}

export async function resetSiteImage(row: SiteImageRow) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from(TABLE).delete().eq("key", row.key);
  if (error) throw error;
  if (row.image_path) await removeImage(row.image_path).catch(() => {});
  localStorage.removeItem(CACHE_KEY);
}
