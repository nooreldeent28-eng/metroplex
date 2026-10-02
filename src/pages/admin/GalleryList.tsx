import { useEffect, useMemo, useState } from "react";
import { deleteProject, fetchProjects, GALLERY_CATEGORIES, updateProject, type GalleryProject } from "../../lib/gallery";
import { Link } from "../../lib/router";
import { cardCls, inputCls } from "./ui";

export function GalleryList() {
  const [projects, setProjects] = useState<GalleryProject[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const load = () => fetchProjects().then(setProjects).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () => (projects ?? []).filter((p) => filter === "All" || p.category === filter),
    [projects, filter],
  );

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError("");
    try {
      await action();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = (p: GalleryProject) => run(p.id, () => updateProject(p.id, { featured: !p.featured }));

  const move = (index: number, dir: -1 | 1) => {
    const list = projects ?? [];
    const a = list[index];
    const b = list[index + dir];
    if (!a || !b) return;
    run(a.id, async () => {
      await Promise.all(
        list.map((p, i) => {
          const order = p.id === a.id ? index + dir : p.id === b.id ? index : i;
          return p.display_order === order ? null : updateProject(p.id, { display_order: order });
        }),
      );
    });
  };

  const remove = (p: GalleryProject) => {
    if (!window.confirm(`Delete "${p.title}"? This also removes its image and cannot be undone.`)) return;
    run(p.id, () => deleteProject(p));
  };

  const btn = "rounded border border-[#d4d2cb] px-2.5 py-1.5 text-xs font-bold text-charcoal hover:border-dark disabled:opacity-40";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Gallery</h1>
          <p className="mt-1 text-slate-500">Edit, feature, reorder, or delete projects.</p>
        </div>
        <div className="flex gap-3">
          <select className={`${inputCls} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category">
            <option>All</option>
            {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Link className="btn btn-primary" to="/admin/new">Add Project</Link>
        </div>
      </div>

      {error && <p className="mt-6 font-semibold text-red-700" role="alert">{error}</p>}
      {!projects && !error && <p className="mt-8 text-slate-500">Loading…</p>}
      {projects && visible.length === 0 && <p className="mt-8 text-slate-500">No projects found.</p>}

      <ul className="mt-8 grid gap-3">
        {visible.map((p) => {
          const index = (projects ?? []).indexOf(p);
          const busy = busyId !== null;
          return (
            <li key={p.id} className={`${cardCls} flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${busyId === p.id ? "opacity-60" : ""}`}>
              <img src={p.image_url} alt="" className="aspect-[4/3] w-full shrink-0 rounded object-cover sm:w-28" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange">{p.category}</p>
                <p className="truncate text-lg font-extrabold text-dark">{p.title}</p>
                <p className="truncate text-sm text-slate-500">{p.location || "No location"} · {p.photo_count ?? 0} before/after photos · Order {p.display_order}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {filter === "All" && (
                  <>
                    <button type="button" className={btn} onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label="Move up">&uarr;</button>
                    <button type="button" className={btn} onClick={() => move(index, 1)} disabled={busy || index === projects!.length - 1} aria-label="Move down">&darr;</button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => toggleFeatured(p)}
                  disabled={busy}
                  className={`${btn} ${p.featured ? "border-orange bg-orange text-white hover:border-orange-dark" : ""}`}
                >
                  {p.featured ? "★ Featured" : "☆ Feature"}
                </button>
                <Link className={btn} to={`/admin/edit/${p.id}`}>Edit</Link>
                <button type="button" className={`${btn} text-red-700 hover:border-red-700`} onClick={() => remove(p)} disabled={busy}>Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
