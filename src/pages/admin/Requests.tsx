import { useEffect, useMemo, useState } from "react";
import {
  deleteRequest,
  fetchRequests,
  formatDate,
  REQUEST_STATUSES,
  STATUS_STYLES,
  updateRequest,
  type EstimateRequest,
  type RequestStatus,
} from "../../lib/estimates";
import { Link } from "../../lib/router";
import { cardCls, inputCls, labelCls } from "./ui";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider ${STATUS_STYLES[status] ?? ""}`}>
      {status}
    </span>
  );
}

export function Requests() {
  const [requests, setRequests] = useState<EstimateRequest[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests()
      .then(setRequests)
      .catch(() => setError("Could not load requests. Make sure supabase/estimates.sql has been run in Supabase."));
  }, []);

  const visible = useMemo(
    () => (requests ?? []).filter((r) => filter === "all" || r.status === filter),
    [requests, filter],
  );

  const patch = (id: string, changes: Partial<EstimateRequest>) =>
    setRequests((prev) => prev!.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  const counts = (s: RequestStatus) => (requests ?? []).filter((r) => r.status === s).length;

  return (
    <>
      <div>
        <h1 className="text-3xl font-extrabold">Estimate Requests</h1>
        <p className="mt-1 text-slate-500">Requests submitted from the website's estimate form.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", ...REQUEST_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded border px-3 py-1.5 text-sm font-bold capitalize ${
              filter === s ? "border-orange bg-orange text-white" : "border-[#d4d2cb] bg-white text-charcoal hover:border-dark"
            }`}
          >
            {s} {s !== "all" && requests ? `(${counts(s)})` : ""}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 font-semibold text-red-700" role="alert">{error}</p>}
      {!requests && !error && <p className="mt-8 text-slate-500">Loading…</p>}
      {requests && visible.length === 0 && <p className="mt-8 text-slate-500">No requests here.</p>}

      <ul className="mt-6 grid gap-3">
        {visible.map((r) => (
          <RequestRow
            key={r.id}
            request={r}
            open={openId === r.id}
            onToggle={() => {
              setOpenId(openId === r.id ? null : r.id);
              if (r.status === "new" && openId !== r.id) {
                updateRequest(r.id, { status: "reviewing" }).then(() => patch(r.id, { status: "reviewing" })).catch(() => {});
              }
            }}
            onChange={(changes) => patch(r.id, changes)}
            onDelete={() => setRequests((prev) => prev!.filter((x) => x.id !== r.id))}
          />
        ))}
      </ul>
    </>
  );
}

type RowProps = {
  request: EstimateRequest;
  open: boolean;
  onToggle: () => void;
  onChange: (c: Partial<EstimateRequest>) => void;
  onDelete: () => void;
};

function RequestRow({ request: r, open, onToggle, onChange, onDelete }: RowProps) {
  const [notes, setNotes] = useState(r.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async (changes: Partial<EstimateRequest>) => {
    setSaving(true);
    setMsg("");
    try {
      await updateRequest(r.id, changes);
      onChange(changes);
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete the request from ${r.name}? This cannot be undone.`)) return;
    try {
      await deleteRequest(r.id);
      onDelete();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not delete.");
    }
  };

  return (
    <li className={`${cardCls} overflow-hidden ${r.status === "new" ? "border-l-4 border-l-orange" : ""}`}>
      <button type="button" onClick={onToggle} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-left hover:bg-warm" aria-expanded={open}>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-extrabold text-dark">{r.name}</span>
          <span className="block truncate text-sm text-slate-500">
            {r.service} · {r.project_type}{r.location ? ` · ${r.location}` : ""}
          </span>
        </span>
        <span className="text-sm text-slate-500">{formatDate(r.created_at)}</span>
        <StatusBadge status={r.status} />
        <span className="text-slate-400" aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="grid gap-6 border-t border-[#e4e2dc] p-5 lg:grid-cols-[1fr_320px]">
          <div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-slate-500">Phone</dt><dd><a className="font-semibold text-dark hover:text-orange" href={`tel:${r.phone}`}>{r.phone}</a></dd></div>
              <div><dt className="font-bold text-slate-500">Email</dt><dd><a className="break-all font-semibold text-dark hover:text-orange" href={`mailto:${r.email}`}>{r.email}</a></dd></div>
              <div><dt className="font-bold text-slate-500">Project Type</dt><dd className="font-semibold">{r.project_type || "—"}</dd></div>
              <div><dt className="font-bold text-slate-500">Service</dt><dd className="font-semibold">{r.service || "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Location</dt><dd className="font-semibold">{r.location || "—"}</dd></div>
            </dl>
            <h3 className="mt-5 text-sm font-bold text-slate-500">Project Details</h3>
            <p className="mt-1 whitespace-pre-wrap rounded bg-warm p-4 text-[0.95rem] text-dark">{r.message}</p>
          </div>

          <div className="grid content-start gap-4">
            <label className={labelCls}>Status
              <select className={inputCls} value={r.status} disabled={saving} onChange={(e) => save({ status: e.target.value as RequestStatus })}>
                {REQUEST_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </label>
            <label className={labelCls}>Internal Notes
              <textarea className={inputCls} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Site visit, measurements, follow-up…" />
            </label>
            <button type="button" className="btn btn-outline-dark btn-sm" disabled={saving} onClick={() => save({ admin_notes: notes.trim() || null })}>
              Save Notes
            </button>
            <Link className="btn btn-primary" to={`/admin/estimates/new?request=${r.id}`}>Create Estimate</Link>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500" role="status">{msg}</span>
              <button type="button" className="text-sm font-bold text-red-700 hover:underline" onClick={remove}>Delete request</button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
