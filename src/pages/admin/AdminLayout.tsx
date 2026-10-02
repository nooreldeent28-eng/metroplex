import { useEffect, type ReactNode } from "react";
import { Brand } from "../../components/Brand";
import { useAdminSession } from "../../lib/auth";
import { Link, navigate, usePath } from "../../lib/router";
import { supabase } from "../../lib/supabase";

const NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/new", label: "Add Project" },
  { to: "/admin/site-photos", label: "Site Photos" },
  { to: "/admin/requests", label: "Estimate Requests" },
  { to: "/admin/estimates", label: "Estimates" },
];

export function AdminLayout({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const auth = useAdminSession();
  const path = usePath();

  useEffect(() => {
    document.title = "Admin | Metroplex";
    if (auth.status === "signed-out") navigate("/admin/login", { replace: true });
  }, [auth.status]);

  if (auth.status !== "admin") {
    return <p className="flex min-h-screen items-center justify-center bg-warm font-semibold text-slate-500">Checking access…</p>;
  }

  if (bare) return <>{children}</>;

  const logout = async () => {
    await supabase?.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-warm md:flex">
      <aside className="flex flex-col bg-dark text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="bg-white px-5 py-4"><Brand href="/" /></div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:p-4" aria-label="Admin">
          {NAV.map((n) => {
            const active = n.to === "/admin" ? path === "/admin" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`whitespace-nowrap rounded px-4 py-2.5 text-sm font-bold transition-colors ${
                  active ? "bg-orange text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            className="whitespace-nowrap rounded px-4 py-2.5 text-left text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white md:mt-auto"
          >
            Logout
          </button>
        </nav>
        <p className="hidden truncate border-t border-white/10 px-5 py-4 text-xs text-white/50 md:block">{auth.session.user.email}</p>
      </aside>
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
