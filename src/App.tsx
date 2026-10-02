import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { company } from "./lib/company";
import { usePath } from "./lib/router";
import { Gallery } from "./pages/Gallery";
import { Home } from "./pages/Home";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { Dashboard } from "./pages/admin/Dashboard";
import { GalleryList } from "./pages/admin/GalleryList";
import { ProjectForm } from "./pages/admin/ProjectForm";
import { SitePhotos } from "./pages/admin/SitePhotos";

const HOME_TITLE = `${company.name} | Commercial & Residential General Contractor`;

function adminPage(path: string) {
  if (path === "/admin") return <Dashboard />;
  if (path === "/admin/gallery") return <GalleryList />;
  if (path === "/admin/new") return <ProjectForm key="new" />;
  if (path === "/admin/site-photos") return <SitePhotos />;
  const edit = path.match(/^\/admin\/edit\/([\w-]+)$/);
  if (edit) return <ProjectForm key={edit[1]} id={edit[1]} />;
  return null;
}

export function App() {
  const path = usePath();
  const isAdmin = path === "/admin" || path.startsWith("/admin/");

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    robots?.setAttribute("content", isAdmin ? "noindex, nofollow" : "index, follow");
    if (path === "/") document.title = HOME_TITLE;
  }, [path, isAdmin]);

  if (path === "/admin/login") return <AdminLogin />;
  if (isAdmin) return <AdminLayout>{adminPage(path) ?? <Dashboard />}</AdminLayout>;

  return (
    <>
      <Header />
      {path === "/gallery" ? <Gallery /> : <Home />}
      <Footer />
    </>
  );
}
