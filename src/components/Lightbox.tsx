import { useEffect, useRef, useState } from "react";
import { fetchPhotos, type GalleryProject, type PhotoPhase, type ProjectPhoto } from "../lib/gallery";

type Props = {
  projects: GalleryProject[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

type Tab = "all" | PhotoPhase;
type Slide = { id: string; url: string; label: string | null };

const TAB_LABELS: Record<Tab, string> = { all: "All", before: "Before", after: "After" };

export function Lightbox({ projects, index, onIndex, onClose }: Props) {
  const p = projects[index];
  const count = projects.length;
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [slide, setSlide] = useState(0);
  const thumbs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPhotos([]);
    setTab("all");
    setSlide(0);
    if (p.photo_count === 0) return;
    let active = true;
    fetchPhotos(p.id)
      .then((data) => active && setPhotos(data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [p.id, p.photo_count]);

  const before = photos.filter((x) => x.phase === "before");
  const after = photos.filter((x) => x.phase === "after");

  const toSlide = (x: ProjectPhoto): Slide => ({ id: x.id, url: x.image_url, label: TAB_LABELS[x.phase] });
  const slides: Slide[] =
    tab === "before"
      ? before.map(toSlide)
      : tab === "after"
        ? after.map(toSlide)
        : [{ id: "main", url: p.image_url, label: null }, ...before.map(toSlide), ...after.map(toSlide)];

  const current = slides[Math.min(slide, slides.length - 1)] ?? slides[0];
  const prevSlide = () => setSlide((s) => (s - 1 + slides.length) % slides.length);
  const nextSlide = () => setSlide((s) => (s + 1) % slides.length);
  const prevProject = () => onIndex((index - 1 + count) % count);
  const nextProject = () => onIndex((index + 1) % count);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && slides.length > 1) prevSlide();
      else if (e.key === "ArrowRight" && slides.length > 1) nextSlide();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  useEffect(() => {
    thumbs.current?.querySelector<HTMLElement>(`[data-slide="${slide}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [slide, tab]);

  const selectTab = (t: Tab) => {
    setTab(t);
    setSlide(0);
  };

  const arrow =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded bg-black/50 text-3xl text-white transition-colors hover:bg-orange";
  const topBtn = "rounded bg-white/10 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-orange";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={p.title}
      onClick={onClose}
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-2">
          {count > 1 ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={prevProject} className={topBtn} aria-label="Previous project">&#8249; Prev</button>
              <span className="text-sm text-white/60">Project {index + 1} / {count}</span>
              <button type="button" onClick={nextProject} className={topBtn} aria-label="Next project">Next &#8250;</button>
            </div>
          ) : <span />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded bg-white/10 text-2xl text-white hover:bg-orange"
          >
            &times;
          </button>
        </div>

        <div className="relative flex items-center justify-center rounded bg-black">
          {current && (
            <img key={current.url} src={current.url} alt={`${p.title}${current.label ? ` – ${current.label}` : ""}`} className="max-h-[62vh] w-auto max-w-full object-contain" />
          )}
          {current?.label && (
            <span className={`absolute left-3 top-3 rounded px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${current.label === "Before" ? "bg-white text-dark" : "bg-orange text-white"}`}>
              {current.label}
            </span>
          )}
          {slides.length > 1 && (
            <>
              <button type="button" onClick={prevSlide} aria-label="Previous photo" className={`${arrow} left-2`}>&#8249;</button>
              <button type="button" onClick={nextSlide} aria-label="Next photo" className={`${arrow} right-2`}>&#8250;</button>
              <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                {slide + 1} / {slides.length}
              </span>
            </>
          )}
        </div>

        {photos.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Photo set">
              {(["all", "before", "after"] as Tab[]).map((t) => {
                const n = t === "all" ? photos.length + 1 : t === "before" ? before.length : after.length;
                if (t !== "all" && n === 0) return null;
                return (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => selectTab(t)}
                    className={`rounded border px-3 py-1.5 text-sm font-bold transition-colors ${
                      tab === t ? "border-orange bg-orange text-white" : "border-white/25 text-white/80 hover:border-white hover:text-white"
                    }`}
                  >
                    {TAB_LABELS[t]} ({n})
                  </button>
                );
              })}
            </div>
            <div ref={thumbs} className="flex gap-2 overflow-x-auto pb-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  data-slide={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded border-2 transition-opacity ${
                    i === slide ? "border-orange" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={s.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {s.label && (
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[10px] font-bold uppercase tracking-wider text-white">{s.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-white">
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber">{p.category}</span>
          <h3 className="mt-1 text-2xl font-extrabold text-white">{p.title}</h3>
          {p.location && <p className="mt-1 text-sm font-semibold text-white/70">{p.location}</p>}
          {p.description && <p className="mt-2 max-w-3xl text-white/80">{p.description}</p>}
        </div>
      </div>
    </div>
  );
}
