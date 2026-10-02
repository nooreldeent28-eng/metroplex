import { useEffect, useState } from "react";
import { company } from "../../lib/company";
import { calcTotals, fetchEstimate, formatDate, money, type Estimate } from "../../lib/estimates";
import { Link } from "../../lib/router";

function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#181818" />
      <path d="M6 25V8l10 9 10-9v17" fill="none" stroke="#E85D04" strokeWidth="3.5" />
    </svg>
  );
}

export function EstimatePrint({ id }: { id: string }) {
  const [est, setEst] = useState<Estimate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEstimate(id)
      .then((e) => {
        setEst(e);
        document.title = `Estimate ${e.number} - ${e.client_name}`;
      })
      .catch(() => setError("Estimate not found."));
  }, [id]);

  if (!est) return <p className="p-10 font-semibold text-slate-500">{error || "Loading…"}</p>;

  const t = calcTotals(est.items, est.tax_rate, est.discount);
  const label = "text-[9pt] font-extrabold uppercase tracking-[0.14em] text-orange";

  return (
    <div className="min-h-screen bg-[#e9e7e1] py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-6 flex w-[210mm] max-w-full flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <Link className="font-bold text-slate-600 hover:text-orange" to={`/admin/estimates/${est.id}`}>&larr; Back to edit</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Tip: choose "Save as PDF" in the print dialog to email it.</span>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </div>

      <article className="estimate-sheet relative mx-auto w-[210mm] max-w-full overflow-hidden bg-white text-[10pt] leading-snug text-charcoal shadow-xl print:shadow-none">
        <div className="estimate-watermark pointer-events-none select-none" aria-hidden="true">
          <div className="flex -rotate-[30deg] flex-col items-center gap-[6mm]">
            <Logo size={180} />
            <span className="text-[72pt] font-extrabold tracking-[0.08em] text-dark">METROPLEX</span>
          </div>
        </div>

        <div className="relative">
          <header className="flex items-start justify-between gap-6 border-b-4 border-orange pb-[6mm]">
            <div className="flex items-center gap-3">
              <Logo />
              <div className="leading-none">
                <p className="text-[18pt] font-extrabold tracking-[0.06em] text-dark">METROPLEX</p>
                <p className="mt-1 text-[7.5pt] font-bold tracking-[0.2em] text-orange">CONSTRUCTION SERVICES</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[24pt] font-extrabold leading-none tracking-wide text-dark">ESTIMATE</p>
              <p className="mt-2 font-bold text-dark">No. {est.number}</p>
              <p className="text-slate-600">Date: {formatDate(est.issue_date)}</p>
              {est.valid_until && <p className="text-slate-600">Valid until: {formatDate(est.valid_until)}</p>}
            </div>
          </header>

          <section className="mt-[6mm] grid grid-cols-3 gap-[6mm]">
            <div>
              <p className={label}>From</p>
              <p className="mt-1 font-bold text-dark">{company.name}</p>
              <p>{company.phone}</p>
              <p>{company.email}</p>
              <p>{company.serviceArea}</p>
            </div>
            <div>
              <p className={label}>Prepared For</p>
              <p className="mt-1 font-bold text-dark">{est.client_name}</p>
              {est.client_address && <p className="whitespace-pre-line">{est.client_address}</p>}
              {est.client_phone && <p>{est.client_phone}</p>}
              {est.client_email && <p>{est.client_email}</p>}
            </div>
            <div>
              <p className={label}>Project</p>
              <p className="mt-1 font-bold text-dark">{est.project_title}</p>
              {est.project_location && <p>{est.project_location}</p>}
            </div>
          </section>

          <table className="mt-[7mm] w-full border-collapse">
            <thead>
              <tr className="bg-dark text-left text-[8.5pt] uppercase tracking-wider text-white">
                <th className="w-[8mm] px-2 py-2">#</th>
                <th className="px-2 py-2">Description</th>
                <th className="w-[16mm] px-2 py-2 text-right">Qty</th>
                <th className="w-[16mm] px-2 py-2">Unit</th>
                <th className="w-[26mm] px-2 py-2 text-right">Unit Price</th>
                <th className="w-[28mm] px-2 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {est.items.map((it, i) => (
                <tr key={i} className="break-inside-avoid border-b border-[#e4e2dc] align-top">
                  <td className="px-2 py-2 text-slate-500">{i + 1}</td>
                  <td className="whitespace-pre-line px-2 py-2 text-dark">{it.description}</td>
                  <td className="px-2 py-2 text-right">{it.quantity}</td>
                  <td className="px-2 py-2">{it.unit}</td>
                  <td className="px-2 py-2 text-right">{money(it.unit_price)}</td>
                  <td className="px-2 py-2 text-right font-bold text-dark">{money(it.quantity * it.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-[4mm] flex justify-end break-inside-avoid">
            <dl className="w-[75mm]">
              <div className="flex justify-between py-1"><dt>Subtotal</dt><dd className="font-bold">{money(t.subtotal)}</dd></div>
              {t.discount > 0 && <div className="flex justify-between py-1"><dt>Discount</dt><dd className="font-bold">−{money(t.discount)}</dd></div>}
              {est.tax_rate > 0 && <div className="flex justify-between py-1"><dt>Tax ({est.tax_rate}%)</dt><dd className="font-bold">{money(t.tax)}</dd></div>}
              <div className="mt-1 flex justify-between bg-orange px-3 py-2 text-[12pt] font-extrabold text-white">
                <dt>TOTAL</dt><dd>{money(t.total)}</dd>
              </div>
            </dl>
          </div>

          {est.notes && (
            <section className="mt-[7mm] break-inside-avoid">
              <p className={label}>Scope of Work / Notes</p>
              <p className="mt-1 whitespace-pre-line">{est.notes}</p>
            </section>
          )}

          {est.terms && (
            <section className="mt-[5mm] break-inside-avoid">
              <p className={label}>Terms &amp; Conditions</p>
              <p className="mt-1 whitespace-pre-line text-[8.5pt] text-slate-600">{est.terms}</p>
            </section>
          )}

          <section className="mt-[10mm] grid grid-cols-2 gap-[12mm] break-inside-avoid">
            {["Client Acceptance", `${company.name}`].map((who) => (
              <div key={who}>
                <div className="h-[14mm] border-b border-dark" />
                <div className="mt-1 flex justify-between text-[8.5pt] text-slate-600">
                  <span>{who} – Signature</span>
                  <span>Date</span>
                </div>
              </div>
            ))}
          </section>

          <footer className="mt-[10mm] border-t border-[#e4e2dc] pt-[3mm] text-center text-[8pt] text-slate-500">
            {company.name} · {company.phone} · {company.email} · Thank you for the opportunity to earn your business.
          </footer>
        </div>
      </article>
    </div>
  );
}
