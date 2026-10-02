import { useEffect, useState, type ChangeEvent } from "react";
import { ACCEPTED_TYPES, validateImage } from "../../lib/gallery";
import {
  fetchSiteImages,
  resetSiteImage,
  setSiteImage,
  SITE_IMAGE_SLOTS,
  type SiteImageKey,
  type SiteImageRow,
} from "../../lib/siteImages";
import { cardCls } from "./ui";

export function SitePhotos() {
  const [rows, setRows] = useState<Record<string, SiteImageRow> | null>(null);
  const [busy, setBusy] = useState<SiteImageKey | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSiteImages(true)
      .then((data) => setRows(Object.fromEntries(data.map((r) => [r.key, r]))))
      .catch(() => {
        setRows({});
        setError("Could not load site photos. Make sure supabase/site-images.sql has been run in Supabase.");
      });
  }, []);

  const onFile = async (slot: (typeof SITE_IMAGE_SLOTS)[number], e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImage(file);
    if (problem) return setError(problem);
    setError("");
    setBusy(slot.key);
    try {
      const row = await setSiteImage(slot.key, file, slot.maxSize, rows?.[slot.key]);
      setRows((prev) => ({ ...prev, [slot.key]: row }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  };

  const onReset = async (key: SiteImageKey) => {
    const row = rows?.[key];
    if (!row || !window.confirm("Restore the original photo for this spot?")) return;
    setBusy(key);
    setError("");
    try {
      await resetSiteImage(row);
      setRows((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the photo.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-extrabold">Site Photos</h1>
        <p className="mt-1 text-slate-500">
          Replace the main photos on the homepage. Changes appear on the live site right away.
        </p>
      </div>

      {error && <p className="mt-6 font-semibold text-red-700" role="alert">{error}</p>}
      {!rows && <p className="mt-8 text-slate-500">Loading…</p>}

      {rows && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {SITE_IMAGE_SLOTS.map((slot) => {
            const row = rows[slot.key];
            const isBusy = busy === slot.key;
            return (
              <article key={slot.key} className={`${cardCls} flex flex-col overflow-hidden`}>
                <div className="relative aspect-video bg-charcoal">
                  <img src={row?.image_url ?? slot.default} alt="" className={`h-full w-full object-cover ${isBusy ? "opacity-40" : ""}`} />
                  <span className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-bold ${row ? "bg-orange text-white" : "bg-white/90 text-dark"}`}>
                    {row ? "Custom photo" : "Original photo"}
                  </span>
                  {isBusy && <span className="absolute inset-0 flex items-center justify-center font-bold text-white">Uploading…</span>}
                </div>
                <div className="flex flex-1 flex-col border-t-4 border-orange p-5">
                  <h2 className="text-lg font-extrabold">{slot.label}</h2>
                  <p className="mt-1 text-sm text-slate-500">{slot.where}</p>
                  <p className="mt-1 text-xs text-slate-500">{slot.tip}</p>
                  <div className="mt-4 flex flex-wrap gap-2 pt-1">
                    <label className={`btn btn-primary btn-sm ${busy ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
                      Replace Photo
                      <input type="file" accept={ACCEPTED_TYPES.join(",")} className="sr-only" disabled={busy !== null} onChange={(e) => onFile(slot, e)} />
                    </label>
                    {row && (
                      <button type="button" className="btn btn-outline-dark btn-sm" disabled={busy !== null} onClick={() => onReset(slot.key)}>
                        Restore Original
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
