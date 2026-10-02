import { useEffect, useState } from "react";
import { countNewRequests } from "../../lib/estimates";
import { fetchProjects, type GalleryProject } from "../../lib/gallery";
import { Link } from "../../lib/router";
import { cardCls } from "./ui";

export function Dashboard() {
  const [projects, setProjects] = useState<GalleryProject[] | null>(null);
  const [error, setError] = useState("");
  const [newRequests, setNewRequests] = useState<number | string>("–");

  useEffect(() => {
    fetchProjects().then(setProjects).catch((e) => setError(e.message));
    countNewRequests().then(setNewRequests).catch(() => {});
  }, []);

  const stats = projects && [
    ["Total Projects", projects.length],
    ["Featured on Homepage", projects.filter((p) => p.featured).length],
    ["Categories Used", new Set(projects.map((p) => p.category)).size],
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-slate-500">Overview of your project gallery.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/new">Add Project</Link>
      </div>

      {error && <p className="mt-6 font-semibold text-red-700">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/admin/requests" className={`${cardCls} border-t-4 border-t-dark p-5 hover:shadow-md`}>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">New Estimate Requests</p>
          <p className="mt-2 text-4xl font-extrabold text-orange">{newRequests}</p>
        </Link>
        {(stats || [["Total Projects", "–"], ["Featured on Homepage", "–"], ["Categories Used", "–"]]).map(([label, value]) => (
          <div key={label} className={`${cardCls} border-t-4 border-t-orange p-5`}>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-2 text-4xl font-extrabold text-dark">{value}</p>
          </div>
        ))}
      </div>

      <div className={`${cardCls} mt-8`}>
        <div className="flex items-center justify-between border-b border-[#e4e2dc] px-5 py-4">
          <h2 className="text-lg font-extrabold">Recent Projects</h2>
          <Link className="text-sm font-bold text-orange hover:underline" to="/admin/gallery">Manage gallery</Link>
        </div>
        {projects && projects.length === 0 && <p className="p-5 text-slate-500">No projects yet. Add your first project to get started.</p>}
        <ul className="divide-y divide-[#e4e2dc]">
          {[...(projects ?? [])]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 5)
            .map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                <img src={p.image_url} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-dark">{p.title}</p>
                  <p className="text-sm text-slate-500">{p.category}{p.featured ? " · Featured" : ""}</p>
                </div>
                <Link className="text-sm font-bold text-orange hover:underline" to={`/admin/edit/${p.id}`}>Edit</Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}
