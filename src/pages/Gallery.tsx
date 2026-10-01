import { useEffect, useMemo, useState } from "react";
import { GalleryGrid } from "../components/GalleryGrid";
import { company } from "../lib/company";
import { fetchProjects, GALLERY_CATEGORIES, type GalleryProject } from "../lib/gallery";
import { supabase } from "../lib/supabase";

const FILTERS = ["All", ...GALLERY_CATEGORIES];

export function Gallery() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(supabase ? "loading" : "error");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    document.title = `Our Work | ${company.name}`;
    if (!supabase) return;
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter],
  );

  return (
    <main>
      <section className="bg-dark py-16 text-white sm:py-20">
        <div className="container">
          <p className="eyebrow eyebrow-light">Project Gallery</p>
          <h1 className="text-4xl font-extrabold text-white sm:text-6xl">Our Work</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Explore construction, remodeling, painting, drywall, welding, fencing, HVAC, plumbing, and property improvement projects.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded border px-4 py-2 text-sm font-bold transition-colors ${
                  filter === f
                    ? "border-orange bg-orange text-white"
                    : "border-[#d4d2cb] bg-white text-charcoal hover:border-dark hover:text-dark"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {status === "loading" && <p className="py-16 text-center font-semibold text-slate-500">Loading projects…</p>}
          {status === "error" && (
            <p className="py-16 text-center font-semibold text-slate-500">
              The gallery is unavailable right now. Please check back soon or call <a className="text-orange" href={company.phoneHref}>{company.phone}</a>.
            </p>
          )}
          {status === "ready" && visible.length === 0 && (
            <p className="py-16 text-center font-semibold text-slate-500">
              {projects.length === 0 ? "New projects are coming soon." : `No ${filter} projects yet.`}
            </p>
          )}
          {status === "ready" && visible.length > 0 && <GalleryGrid key={filter} projects={visible} />}

          <div className="center-cta">
            <a className="btn btn-primary btn-lg" href="/#contact">Request a Project Estimate</a>
          </div>
        </div>
      </section>
    </main>
  );
}
