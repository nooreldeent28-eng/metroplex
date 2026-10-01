import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ACCEPTED_TYPES,
  createProject,
  fetchProject,
  fetchProjects,
  GALLERY_CATEGORIES,
  removeImage,
  updateProject,
  uploadImage,
  validateImage,
  type GalleryProject,
} from "../../lib/gallery";
import { Link, navigate } from "../../lib/router";
import { cardCls, inputCls, labelCls } from "./ui";

type Stage = "idle" | "uploading" | "saving";

export function ProjectForm({ id }: { id?: string }) {
  const [existing, setExisting] = useState<GalleryProject | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [nextOrder, setNextOrder] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProject(id)
        .then((p) => {
          setExisting(p);
          setPreview(p.image_url);
        })
        .catch(() => setError("Project not found."))
        .finally(() => setLoading(false));
    } else {
      fetchProjects()
        .then((list) => setNextOrder(list.reduce((max, p) => Math.max(max, p.display_order + 1), 0)))
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setError("");
    if (!f) return;
    const problem = validateImage(f);
    if (problem) {
      setError(problem);
      e.target.value = "";
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (!file && !existing) return setError("Please choose an image.");
    setError("");

    let uploaded: { path: string; url: string } | null = null;
    try {
      if (file) {
        setStage("uploading");
        uploaded = await uploadImage(file);
      }
      setStage("saving");
      const fields = {
        title: String(d.get("title")).trim(),
        description: String(d.get("description")).trim() || null,
        category: String(d.get("category")),
        location: String(d.get("location")).trim() || null,
        featured: d.get("featured") === "on",
        display_order: Number(d.get("display_order")) || 0,
      };
      if (existing) {
        await updateProject(existing.id, uploaded ? { ...fields, image_url: uploaded.url, image_path: uploaded.path } : fields);
        if (uploaded && existing.image_path) await removeImage(existing.image_path);
      } else {
        await createProject({ ...fields, image_url: uploaded!.url, image_path: uploaded!.path });
      }
      navigate("/admin/gallery");
    } catch (err) {
      if (uploaded) await removeImage(uploaded.path).catch(() => {});
      setError(err instanceof Error ? err.message : "Could not save the project.");
      setStage("idle");
    }
  };

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (id && !existing) return <p className="font-semibold text-red-700">{error || "Project not found."}</p>;

  const busy = stage !== "idle";

  return (
    <>
      <div className="mb-8">
        <Link className="text-sm font-bold text-slate-500 hover:text-orange" to="/admin/gallery">&larr; Back to gallery</Link>
        <h1 className="mt-2 text-3xl font-extrabold">{existing ? "Edit Project" : "Add Project"}</h1>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className={`${cardCls} grid gap-5 p-6`}>
          <label className={labelCls}>Project Title *
            <input className={inputCls} name="title" required maxLength={120} defaultValue={existing?.title} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelCls}>Category *
              <select className={inputCls} name="category" required defaultValue={existing?.category ?? GALLERY_CATEGORIES[0]}>
                {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className={labelCls}>Location
              <input className={inputCls} name="location" maxLength={120} placeholder="e.g. Dallas, TX" defaultValue={existing?.location ?? ""} />
            </label>
          </div>
          <label className={labelCls}>Description
            <textarea className={inputCls} name="description" rows={5} maxLength={1000} defaultValue={existing?.description ?? ""} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelCls}>Display Order
              <input className={inputCls} name="display_order" type="number" step={1} defaultValue={existing?.display_order ?? nextOrder} key={nextOrder} />
              <span className="text-xs font-medium text-slate-500">Lower numbers appear first.</span>
            </label>
            <label className="flex items-center gap-3 self-start pt-7 text-sm font-bold text-dark">
              <input name="featured" type="checkbox" defaultChecked={existing?.featured ?? false} className="h-5 w-5 accent-orange" />
              Feature on homepage
            </label>
          </div>
        </div>

        <div className={`${cardCls} flex flex-col gap-4 p-6`}>
          <p className="text-sm font-bold text-dark">Project Image {existing ? "" : "*"}</p>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded border border-dashed border-[#d4d2cb] bg-warm">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <span className="px-4 text-center text-sm text-slate-500">No image selected</span>
            )}
          </div>
          <label className="btn btn-outline-dark cursor-pointer">
            {preview ? "Replace Image" : "Choose Image"}
            <input type="file" accept={ACCEPTED_TYPES.join(",")} onChange={onFile} className="sr-only" disabled={busy} />
          </label>
          <p className="text-xs text-slate-500">JPEG, PNG, or WebP up to 5 MB. Images are resized to 1920px and compressed before upload.</p>

          {error && <p className="text-sm font-semibold text-red-700" role="alert">{error}</p>}

          <button className="btn btn-primary btn-lg btn-block mt-auto" type="submit" disabled={busy}>
            {stage === "uploading" ? "Compressing & uploading…" : stage === "saving" ? "Saving…" : existing ? "Save Changes" : "Add Project"}
          </button>
        </div>
      </form>
    </>
  );
}
