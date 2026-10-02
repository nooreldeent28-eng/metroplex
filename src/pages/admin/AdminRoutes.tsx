import { AdminLayout } from "./AdminLayout";
import { AdminLogin } from "./AdminLogin";
import { Dashboard } from "./Dashboard";
import { EstimateForm } from "./EstimateForm";
import { EstimatePrint } from "./EstimatePrint";
import { EstimatesList } from "./EstimatesList";
import { GalleryList } from "./GalleryList";
import { ProjectForm } from "./ProjectForm";
import { Requests } from "./Requests";
import { SitePhotos } from "./SitePhotos";

function adminPage(path: string) {
  if (path === "/admin") return <Dashboard />;
  if (path === "/admin/gallery") return <GalleryList />;
  if (path === "/admin/new") return <ProjectForm key="new" />;
  if (path === "/admin/site-photos") return <SitePhotos />;
  if (path === "/admin/requests") return <Requests />;
  if (path === "/admin/estimates") return <EstimatesList />;
  if (path === "/admin/estimates/new") return <EstimateForm key="new" />;
  const est = path.match(/^\/admin\/estimates\/([\w-]+)$/);
  if (est) return <EstimateForm key={est[1]} id={est[1]} />;
  const edit = path.match(/^\/admin\/edit\/([\w-]+)$/);
  if (edit) return <ProjectForm key={edit[1]} id={edit[1]} />;
  return null;
}

export default function AdminRoutes({ path }: { path: string }) {
  if (path === "/admin/login") return <AdminLogin />;
  const print = path.match(/^\/admin\/estimates\/([\w-]+)\/print$/);
  if (print) return <AdminLayout bare><EstimatePrint id={print[1]} /></AdminLayout>;
  return <AdminLayout>{adminPage(path) ?? <Dashboard />}</AdminLayout>;
}
