import { supabase } from "./supabase";

export const REQUEST_STATUSES = ["new", "reviewing", "estimated", "closed"] as const;
export const ESTIMATE_STATUSES = ["draft", "sent", "accepted", "declined"] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

export type EstimateRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  project_type: string | null;
  service: string | null;
  location: string | null;
  message: string;
  status: RequestStatus;
  admin_notes: string | null;
  created_at: string;
};

export type LineItem = { description: string; quantity: number; unit: string; unit_price: number };

export type Estimate = {
  id: string;
  number: number;
  request_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  project_title: string;
  project_location: string | null;
  items: LineItem[];
  tax_rate: number;
  discount: number;
  notes: string | null;
  terms: string | null;
  status: EstimateStatus;
  issue_date: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
};

export type EstimateInput = Omit<Estimate, "id" | "number" | "created_at" | "updated_at">;

export const DEFAULT_TERMS =
  "This estimate is valid until the date shown above. Pricing is based on the scope of work described; changes to the scope or unforeseen site conditions may require a revised estimate. A deposit may be required before work is scheduled. Final payment is due upon completion.";

export const STATUS_STYLES: Record<string, string> = {
  new: "bg-orange text-white",
  reviewing: "bg-amber text-dark",
  estimated: "bg-dark text-white",
  closed: "bg-slate-200 text-slate-600",
  draft: "bg-slate-200 text-slate-700",
  sent: "bg-amber text-dark",
  accepted: "bg-green-700 text-white",
  declined: "bg-red-700 text-white",
};

function client() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

// Requests -------------------------------------------------------------------

export async function submitEstimateRequest(input: Omit<EstimateRequest, "id" | "status" | "admin_notes" | "created_at">) {
  const { error } = await client().from("estimate_requests").insert(input);
  if (error) throw error;
}

export async function fetchRequests() {
  const { data, error } = await client().from("estimate_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EstimateRequest[];
}

export async function fetchRequest(id: string) {
  const { data, error } = await client().from("estimate_requests").select("*").eq("id", id).single();
  if (error) throw error;
  return data as EstimateRequest;
}

export async function updateRequest(id: string, input: Partial<Pick<EstimateRequest, "status" | "admin_notes">>) {
  const { error } = await client().from("estimate_requests").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteRequest(id: string) {
  const { error } = await client().from("estimate_requests").delete().eq("id", id);
  if (error) throw error;
}

export async function countNewRequests() {
  const { count, error } = await client()
    .from("estimate_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  if (error) throw error;
  return count ?? 0;
}

// Estimates ------------------------------------------------------------------

const normalize = (e: Estimate): Estimate => ({ ...e, tax_rate: Number(e.tax_rate), discount: Number(e.discount), items: e.items ?? [] });

export async function fetchEstimates() {
  const { data, error } = await client().from("estimates").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Estimate[]).map(normalize);
}

export async function fetchEstimate(id: string) {
  const { data, error } = await client().from("estimates").select("*").eq("id", id).single();
  if (error) throw error;
  return normalize(data as Estimate);
}

export async function createEstimate(input: EstimateInput) {
  const { data, error } = await client().from("estimates").insert(input).select("id").single();
  if (error) throw error;
  if (input.request_id) await updateRequest(input.request_id, { status: "estimated" }).catch(() => {});
  return data.id as string;
}

export async function updateEstimate(id: string, input: Partial<EstimateInput>) {
  const { error } = await client()
    .from("estimates")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEstimate(id: string) {
  const { error } = await client().from("estimates").delete().eq("id", id);
  if (error) throw error;
}

// Helpers --------------------------------------------------------------------

export function calcTotals(items: LineItem[], taxRate: number, discount: number) {
  const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
  const afterDiscount = Math.max(0, subtotal - (Number(discount) || 0));
  const tax = afterDiscount * ((Number(taxRate) || 0) / 100);
  return { subtotal, discount: Number(discount) || 0, tax, total: afterDiscount + tax };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const money = (n: number) => usd.format(n || 0);

export const formatDate = (d: string | null) =>
  d ? new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export const todayISO = () => new Date().toLocaleDateString("en-CA");

export const addDaysISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
};
