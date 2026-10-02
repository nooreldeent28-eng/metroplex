import { lazy, Suspense, useEffect } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { company } from "./lib/company";
import { usePath } from "./lib/router";
import { Gallery } from "./pages/Gallery";
import { Home } from "./pages/Home";

const AdminRoutes = lazy(() => import("./pages/admin/AdminRoutes"));

const HOME_TITLE = `${company.name} | Commercial & Residential General Contractor`;

export function App() {
  const path = usePath();
  const isAdmin = path === "/admin" || path.startsWith("/admin/");

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    robots?.setAttribute("content", isAdmin ? "noindex, nofollow" : "index, follow");
    if (path === "/") document.title = HOME_TITLE;
  }, [path, isAdmin]);

  if (isAdmin) {
    return (
      <Suspense fallback={<p className="flex min-h-screen items-center justify-center bg-warm font-semibold text-slate-500">Loading…</p>}>
        <AdminRoutes path={path} />
      </Suspense>
    );
  }

  return (
    <>
      <Header />
      {path === "/gallery" ? <Gallery /> : <Home />}
      <Footer />
    </>
  );
}
