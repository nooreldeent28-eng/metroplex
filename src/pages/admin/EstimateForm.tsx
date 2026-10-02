import { useEffect, useState } from "react";
import {
  addDaysISO,
  calcTotals,
  createEstimate,
  DEFAULT_TERMS,
  ESTIMATE_STATUSES,
  fetchEstimate,
  fetchRequest,
  money,
  todayISO,
  updateEstimate,
  type EstimateInput,
  type LineItem,
} from "../../lib/estimates";
import { Link, navigate } from "../../lib/router";
import { cardCls, inputCls, labelCls } from "./ui";

const UNITS = ["ea", "hr", "day", "sq ft", "ln ft", "lot", "job"];
const emptyItem = (): LineItem => ({ description: "", quantity: 1, unit: "ea", unit_price: 0 });

const blank = (): EstimateInput => ({
  request_id: null,
  client_name: "",
  client_email: null,
  client_phone: null,
  client_address: null,
  project_title: "",
  project_location: null,
  items: [emptyItem()],
  tax_rate: 0,
  discount: 0,
  notes: null,
  terms: DEFAULT_TERMS,
  status: "draft",
  issue_date: todayISO(),
  valid_until: addDaysISO(30),
});

export function EstimateForm({ id }: { id?: string }) {
  const [data, setData] = useState<EstimateInput | null>(id ? null : blank());
  const [number, setNumber] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (id) {
      fetchEstimate(id)
        .then(({ id: _id, number: n, created_at: _c, updated_at: _u, ...rest }) => {
          setNumber(n);
          setData({ ...rest, items: rest.items.length ? rest.items : [emptyItem()] });
        })
        .catch(() => setError("Estimate not found."));
      return;
    }
    const requestId = new URLSearchParams(window.location.search).get("request");
    if (!requestId) return;
    fetchRequest(requestId)
      .then((r) =>
        setData((d) => ({
          ...d!,
          request_id: r.id,
          client_name: r.name,
          client_email: r.email,
          client_phone: r.phone,
          project_title: [r.service, r.project_type].filter(Boolean).join(" – "),
          project_location: r.location,
          notes: r.message,
        })),
      )
      .catch(() => {});
  }, [id]);

  if (!data) return <p className={error ? "font-semibold text-red-700" : "text-slate-500"}>{error || "Loading…"}</p>;

  const set = <K extends keyof EstimateInput>(key: K, value: EstimateInput[K]) => {
    setSavedMsg("");
    setData((d) => ({ ...d!, [key]: value }));
  };
  const text = (key: keyof EstimateInput) => (e: { target: { value: string } }) => set(key, (e.target.value || null) as never);

  const setItem = (i: number, changes: Partial<LineItem>) =>
    set("items", data.items.map((it, idx) => (idx === i ? { ...it, ...changes } : it)));
  const moveItem = (i: number, dir: -1 | 1) => {
    const items = [...data.items];
    [items[i], items[i + dir]] = [items[i + dir], items[i]];
    set("items", items);
  };

  const totals = calcTotals(data.items, data.tax_rate, data.discount);

  const onSubmit = async (e: { preventDefault(): void }, thenPrint = false) => {
    e.preventDefault();
    const items = data.items.filter((i) => i.description.trim());
    if (!data.client_name.trim() || !data.project_title.trim()) return setError("Client name and project title are required.");
    if (!items.length) return setError("Add at least one line item with a description.");
    setSaving(true);
    setError("");
    try {
      const payload = { ...data, items };
      const savedId = id ?? (await createEstimate(payload));
      if (id) await updateEstimate(id, payload);
      if (thenPrint) navigate(`/admin/estimates/${savedId}/print`);
      else if (!id) navigate(`/admin/estimates/${savedId}`, { replace: true });
      else setSavedMsg("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the estimate.");
    } finally {
      setSaving(false);
    }
  };

  const num = "w-full rounded border border-[#d4d2cb] bg-white px-2 py-2 text-right font-medium text-dark focus:border-orange focus:outline-none";

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="text-sm font-bold text-slate-500 hover:text-orange" to="/admin/estimates">&larr; Back to estimates</Link>
          <h1 className="mt-2 text-3xl font-extrabold">{number ? `Estimate #${number}` : "New Estimate"}</h1>
        </div>
        <label className={`${labelCls} w-44`}>Status
          <select className={inputCls} value={data.status} onChange={(e) => set("status", e.target.value as EstimateInput["status"])}>
            {ESTIMATE_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${cardCls} grid content-start gap-4 p-6`}>
          <h2 className="text-lg font-extrabold">Client</h2>
          <label className={labelCls}>Client Name *<input className={inputCls} value={data.client_name} onChange={(e) => set("client_name", e.target.value)} required /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>Phone<input className={inputCls} value={data.client_phone ?? ""} onChange={text("client_phone")} /></label>
            <label className={labelCls}>Email<input className={inputCls} type="email" value={data.client_email ?? ""} onChange={text("client_email")} /></label>
          </div>
          <label className={labelCls}>Billing Address<textarea className={inputCls} rows={2} value={data.client_address ?? ""} onChange={text("client_address")} /></label>
        </section>

        <section className={`${cardCls} grid content-start gap-4 p-6`}>
          <h2 className="text-lg font-extrabold">Project</h2>
          <label className={labelCls}>Project Title *<input className={inputCls} value={data.project_title} onChange={(e) => set("project_title", e.target.value)} required /></label>
          <label className={labelCls}>Project Location<input className={inputCls} value={data.project_location ?? ""} onChange={text("project_location")} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>Issue Date<input className={inputCls} type="date" value={data.issue_date} onChange={(e) => set("issue_date", e.target.value)} required /></label>
            <label className={labelCls}>Valid Until<input className={inputCls} type="date" value={data.valid_until ?? ""} onChange={text("valid_until")} /></label>
          </div>
        </section>
      </div>

      <section className={`${cardCls} mt-6 p-6`}>
        <h2 className="text-lg font-extrabold">Line Items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-2 pr-2">Description</th>
                <th className="w-20 pb-2 pr-2 text-right">Qty</th>
                <th className="w-24 pb-2 pr-2">Unit</th>
                <th className="w-32 pb-2 pr-2 text-right">Unit Price</th>
                <th className="w-32 pb-2 pr-2 text-right">Amount</th>
                <th className="w-24 pb-2" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, i) => (
                <tr key={i} className="align-top">
                  <td className="py-1 pr-2">
                    <textarea className={`${inputCls} min-h-[42px] py-2`} rows={1} value={it.description} placeholder="Describe the work or material" onChange={(e) => setItem(i, { description: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2"><input className={num} type="number" min={0} step="any" value={it.quantity} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} /></td>
                  <td className="py-1 pr-2">
                    <select className={`${inputCls} px-2 py-2`} value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })}>
                      {(UNITS.includes(it.unit) ? UNITS : [it.unit, ...UNITS]).map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-1 pr-2"><input className={num} type="number" min={0} step="0.01" value={it.unit_price} onChange={(e) => setItem(i, { unit_price: Number(e.target.value) })} /></td>
                  <td className="py-3 pr-2 text-right font-bold text-dark">{money(it.quantity * it.unit_price)}</td>
                  <td className="py-1">
                    <div className="flex justify-end gap-1 pt-1">
                      <button type="button" className="rounded border border-[#d4d2cb] px-2 py-1 text-xs font-bold disabled:opacity-30" disabled={i === 0} onClick={() => moveItem(i, -1)} aria-label="Move up">&uarr;</button>
                      <button type="button" className="rounded border border-[#d4d2cb] px-2 py-1 text-xs font-bold disabled:opacity-30" disabled={i === data.items.length - 1} onClick={() => moveItem(i, 1)} aria-label="Move down">&darr;</button>
                      <button type="button" className="rounded border border-[#d4d2cb] px-2 py-1 text-xs font-bold text-red-700 disabled:opacity-30" disabled={data.items.length === 1} onClick={() => set("items", data.items.filter((_, idx) => idx !== i))} aria-label="Remove line">&times;</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn btn-outline-dark btn-sm mt-3" onClick={() => set("items", [...data.items, emptyItem()])}>+ Add Line Item</button>

        <div className="mt-6 ml-auto grid max-w-sm gap-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold">{money(totals.subtotal)}</span></div>
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Discount ($)</span>
            <input className={`${num} w-32`} type="number" min={0} step="0.01" value={data.discount} onChange={(e) => set("discount", Number(e.target.value))} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Tax Rate (%)</span>
            <input className={`${num} w-32`} type="number" min={0} max={100} step="0.01" value={data.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} />
          </label>
          <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-bold">{money(totals.tax)}</span></div>
          <div className="mt-1 flex justify-between border-t-2 border-dark pt-2 text-lg"><span className="font-extrabold">Total</span><span className="font-extrabold text-orange">{money(totals.total)}</span></div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <label className={`${cardCls} ${labelCls} p-6`}>Notes / Scope of Work
          <textarea className={inputCls} rows={6} value={data.notes ?? ""} onChange={text("notes")} placeholder="Shown on the printed estimate" />
        </label>
        <label className={`${cardCls} ${labelCls} p-6`}>Terms &amp; Conditions
          <textarea className={inputCls} rows={6} value={data.terms ?? ""} onChange={text("terms")} />
        </label>
      </div>

      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#e4e2dc] bg-warm/95 py-4">
        {error && <p className="mr-auto font-semibold text-red-700" role="alert">{error}</p>}
        {savedMsg && <p className="mr-auto font-semibold text-green-700" role="status">{savedMsg}</p>}
        <button type="submit" className="btn btn-outline-dark" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={(e) => onSubmit(e, true)}>Save &amp; Print</button>
      </div>
    </form>
  );
}
