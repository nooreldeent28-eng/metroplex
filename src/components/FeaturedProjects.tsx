import { useEffect, useState } from "react";
import { fetchProjects, type GalleryProject } from "../lib/gallery";
import { supabase } from "../lib/supabase";
import { Link } from "../lib/router";
import { GalleryGrid } from "./GalleryGrid";

const img = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

const FALLBACK = [
  { src: img("1541888946425-d81bb19240f5", 1200), alt: "Construction team reviewing a commercial job site", tag: "Commercial", title: "Commercial Construction", lg: true },
  { src: img("1581858726788-75bc0f6a952d"), alt: "Renovated interior with new flooring and finishes", tag: "Residential", title: "Interior Remodel" },
  { src: img("1589939705384-5185137a7f0f"), alt: "Carpenter cutting framing lumber on site", tag: "Construction", title: "Framing & Build-Out" },
  { src: img("1574359411659-15573a27fd0c"), alt: "Painters working on a home exterior", tag: "Painting", title: "Exterior Painting" },
  { src: img("1621905251189-08b45d6a269e"), alt: "Technician working on building systems", tag: "Mechanical", title: "Building Systems" },
];

export function FeaturedProjects() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);

  useEffect(() => {
    if (!supabase) return;
    fetchProjects({ featuredOnly: true, limit: 6 })
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-head section-head-row">
          <div>
            <p className="eyebrow">Projects</p>
            <h2 className="section-title">Work We Deliver</h2>
          </div>
          <Link className="btn btn-outline-dark" to="/gallery">View All Projects</Link>
        </div>
        {projects.length > 0 ? (
          <GalleryGrid projects={projects} />
        ) : (
          <div className="project-grid">
            {FALLBACK.map((f) => (
              <figure key={f.title} className={`project${f.lg ? " project-lg" : ""}`}>
                <img src={f.src} alt={f.alt} loading="lazy" />
                <figcaption><span>{f.tag}</span>{f.title}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
