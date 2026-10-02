import { useEffect, useState, type ChangeEvent } from "react";
import {
  ACCEPTED_TYPES,
  addPhoto,
  deletePhoto,
  fetchPhotos,
  MAX_PROJECT_PHOTOS,
  updatePhoto,
  validateImage,
  type PhotoPhase,
  type ProjectPhoto,
} from "../../lib/gallery";
import { cardCls } from "./ui";

const PHASES: { id: PhotoPhase; label: string }[] = [
  { id: "before", label: "Before" },
  { id: "after", label: "After" },
];

export function PhotoManager({ projectId }: { projectId: string }) {
  const [photos, setPhotos] = useState<ProjectPhoto[] | null>(null);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos(projectId)
      .then(setPhotos)
      .catch(() => {
        setPhotos([]);
        setErrors(["Could not load photos. Make sure supabase/project-photos.sql has been run in Supabase."]);
      });
  }, [projectId]);

  const list = photos ?? [];
  const remaining = MAX_PROJECT_PHOTOS - list.length;
  const uploading = progress !== "";

  const onFiles = async (phase: PhotoPhase, e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const problems: string[] = [];
    const valid = files.filter((f) => {
      const problem = validateImage(f);
      if (problem) problems.push(`${f.name}: ${problem}`);
      return !problem;
    });
    if (valid.length > remaining) {
      problems.push(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} allowed (limit ${MAX_PROJECT_PHOTOS}). Extra files were skipped.`);
      valid.splice(remaining);
    }
    setErrors(problems);

    let order = list.reduce((max, p) => Math.max(max, p.display_order + 1), 0);
    for (let i = 0; i < valid.length; i++) {
      setProgress(`Uploading ${i + 1} of ${valid.length}…`);
      try {
        const photo = await addPhoto(projectId, valid[i], phase, order++);
        setPhotos((prev) => [...(prev ?? []), photo]);
      } catch (err) {
        problems.push(`${valid[i].name}: ${err instanceof Error ? err.message : "Upload failed."}`);
        setErrors([...problems]);
      }
    }
    setProgress("");
  };

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Something went wrong."]);
    } finally {
      setBusyId(null);
    }
  };

  const togglePhase = (p: ProjectPhoto) =>
    run(p.id, async () => {
      const phase: PhotoPhase = p.phase === "before" ? "after" : "before";
      await updatePhoto(p.id, { phase });
      setPhotos((prev) => prev!.map((x) => (x.id === p.id ? { ...x, phase } : x)));
    });

  const move = (phasePhotos: ProjectPhoto[], index: number, dir: -1 | 1) => {
    const a = phasePhotos[index];
    const b = phasePhotos[index + dir];
    if (!a || !b) return;
    run(a.id, async () => {
      const [ao, bo] = a.display_order === b.display_order ? [b.display_order + dir, a.display_order] : [b.display_order, a.display_order];
      await Promise.all([updatePhoto(a.id, { display_order: ao }), updatePhoto(b.id, { display_order: bo })]);
      setPhotos((prev) => prev!.map((x) => (x.id === a.id ? { ...x, display_order: ao } : x.id === b.id ? { ...x, display_order: bo } : x)));
    });
  };

  const remove = (p: ProjectPhoto) => {
    if (!window.confirm("Delete this photo?")) return;
    run(p.id, async () => {
      await deletePhoto(p);
      setPhotos((prev) => prev!.filter((x) => x.id !== p.id));
    });
  };

  const btn = "rounded bg-white/90 px-2 py-1 text-xs font-bold text-dark shadow hover:bg-white disabled:opacity-40";

  return (
    <section className={`${cardCls} mt-6 p-6`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Before &amp; After Photos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Up to {MAX_PROJECT_PHOTOS} photos per project. Images are resized and compressed automatically.
          </p>
        </div>
        <p className={`text-sm font-bold ${remaining === 0 ? "text-red-700" : "text-dark"}`}>
          {list.length} / {MAX_PROJECT_PHOTOS} photos
        </p>
      </div>

      {(uploading || errors.length > 0) && (
        <div className="mt-4 grid gap-1 text-sm font-semibold" role="status">
          {uploading && <p className="text-orange">{progress}</p>}
          {errors.map((e) => <p key={e} className="text-red-700">{e}</p>)}
        </div>
      )}

      {photos === null ? (
        <p className="mt-6 text-slate-500">Loading photos…</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {PHASES.map(({ id, label }) => {
            const phasePhotos = list.filter((p) => p.phase === id).sort((a, b) => a.display_order - b.display_order);
            return (
              <div key={id} className="rounded border border-[#e4e2dc] bg-warm p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold">
                    {label} <span className="font-semibold text-slate-500">({phasePhotos.length})</span>
                  </h3>
                  <label className={`btn btn-sm ${id === "before" ? "btn-outline-dark" : "btn-primary"} ${uploading || remaining === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
                    + Add {label} Photos
                    <input
                      type="file"
                      multiple
                      accept={ACCEPTED_TYPES.join(",")}
                      className="sr-only"
                      disabled={uploading || remaining === 0}
                      onChange={(e) => onFiles(id, e)}
                    />
                  </label>
                </div>
                {phasePhotos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">No {label.toLowerCase()} photos yet.</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {phasePhotos.map((p, i) => (
                      <li key={p.id} className={`group relative overflow-hidden rounded bg-charcoal ${busyId === p.id ? "opacity-50" : ""}`}>
                        <img src={p.image_url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6">
                          <button type="button" className={btn} onClick={() => move(phasePhotos, i, -1)} disabled={busyId !== null || i === 0} aria-label="Move earlier">&larr;</button>
                          <button type="button" className={btn} onClick={() => move(phasePhotos, i, 1)} disabled={busyId !== null || i === phasePhotos.length - 1} aria-label="Move later">&rarr;</button>
                          <button type="button" className={btn} onClick={() => togglePhase(p)} disabled={busyId !== null} title={`Move to ${id === "before" ? "After" : "Before"}`}>
                            {id === "before" ? "→ After" : "→ Before"}
                          </button>
                          <button type="button" className={`${btn} text-red-700`} onClick={() => remove(p)} disabled={busyId !== null} aria-label="Delete photo">&times;</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
