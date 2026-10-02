import { useEffect, useState } from "react";
import { calcTotals, deleteEstimate, fetchEstimates, formatDate, money, type Estimate } from "../../lib/estimates";
import { Link } from "../../lib/router";
import { StatusBadge } from "./Requests";
import { cardCls } from "./ui";

export function EstimatesList() {
  const [estimates, setEstimates] = useState<Estimate[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEstimates()
      .then(setEstimates)
      .catch(() => setError("Could not load estimates. Make sure supabase/estimates.sql has been run in Supabase."));
  }, []);

  const remove = async (e: Estimate) => {
    if (!window.confirm(`Delete estimate #${e.number} for ${e.client_name}? This cannot be undone.`)) return;
    try {
      await deleteEstimate(e.id);
      setEstimates((prev) => prev!.filter((x) => x.id !== e.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    }
  };

  const link = "text-sm font-bold text-orange hover:underline";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Estimates</h1>
          <p className="mt-1 text-slate-500">Create, edit, and print project estimates.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/estimates/new">New Estimate</Link>
      </div>

      {error && <p className="mt-6 font-semibold text-red-700" role="alert">{error}</p>}
      {!estimates && !error && <p className="mt-8 text-slate-500">Loading…</p>}
      {estimates && estimates.length === 0 && (
        <p className="mt-8 text-slate-500">No estimates yet. Create one here or from an estimate request.</p>
      )}

      {estimates && estimates.length > 0 && (
        <div className={`${cardCls} mt-8 overflow-x-auto`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#e4e2dc] bg-warm text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Client / Project</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2dc]">
              {estimates.map((e) => (
                <tr key={e.id} className="hover:bg-warm/60">
                  <td className="px-4 py-3 font-extrabold text-dark">#{e.number}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-dark">{e.client_name}</p>
                    <p className="text-slate-500">{e.project_title}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(e.issue_date)}</td>
                  <td className="px-4 py-3 text-right font-bold text-dark">{money(calcTotals(e.items, e.tax_rate, e.discount).total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link className={link} to={`/admin/estimates/${e.id}`}>Edit</Link>
                      <Link className={link} to={`/admin/estimates/${e.id}/print`}>Print</Link>
                      <button type="button" className="text-sm font-bold text-red-700 hover:underline" onClick={() => remove(e)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
