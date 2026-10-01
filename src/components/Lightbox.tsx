import { useEffect } from "react";
import type { GalleryProject } from "../lib/gallery";

type Props = {
  projects: GalleryProject[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export function Lightbox({ projects, index, onIndex, onClose }: Props) {
  const p = projects[index];
  const count = projects.length;
  const prev = () => onIndex((index - 1 + count) % count);
  const next = () => onIndex((index + 1) % count);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  const navBtn =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded bg-white/10 text-2xl text-white transition-colors hover:bg-orange";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={p.title}
      onClick={onClose}
    >
      <div className="relative flex max-h-full w-full max-w-5xl flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between text-white">
          <span className="text-sm text-white/60">{index + 1} / {count}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded bg-white/10 text-2xl hover:bg-orange"
          >
            &times;
          </button>
        </div>
        <div className="relative flex min-h-0 items-center justify-center">
          <img src={p.image_url} alt={p.title} className="max-h-[70vh] w-auto max-w-full rounded object-contain" />
          {count > 1 && (
            <>
              <button type="button" onClick={prev} aria-label="Previous project" className={`${navBtn} left-2`}>&#8249;</button>
              <button type="button" onClick={next} aria-label="Next project" className={`${navBtn} right-2`}>&#8250;</button>
            </>
          )}
        </div>
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
