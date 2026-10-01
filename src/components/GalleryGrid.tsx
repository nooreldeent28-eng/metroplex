import { useState } from "react";
import type { GalleryProject } from "../lib/gallery";
import { Lightbox } from "./Lightbox";

export function GalleryGrid({ projects }: { projects: GalleryProject[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group flex h-full w-full flex-col overflow-hidden rounded border border-[#e4e2dc] bg-white text-left shadow-sm transition-shadow hover:shadow-lg"
            >
              <span className="block aspect-[4/3] w-full overflow-hidden bg-charcoal">
                <img
                  src={p.image_url}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <span className="flex flex-1 flex-col border-t-4 border-orange p-5">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange">{p.category}</span>
                <span className="mt-1.5 text-lg font-extrabold leading-snug text-dark">{p.title}</span>
                {p.location && <span className="mt-1 text-sm font-semibold text-slate-500">{p.location}</span>}
                {p.description && <span className="mt-2 line-clamp-2 text-[0.95rem] text-slate-500">{p.description}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {active !== null && (
        <Lightbox projects={projects} index={active} onIndex={setActive} onClose={() => setActive(null)} />
      )}
    </>
  );
}
