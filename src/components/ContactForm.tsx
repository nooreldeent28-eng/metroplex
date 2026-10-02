import { useState, type FormEvent } from "react";
import { company } from "../lib/company";
import { submitEstimateRequest } from "../lib/estimates";
import { supabase } from "../lib/supabase";

const SERVICES = ["General Contracting", "Construction", "Remodeling", "Painting", "Drywall", "Welding", "Fencing", "HVAC", "Plumbing"];

type State = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

function openMailto(d: Record<string, string>) {
  const body = [
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Email: ${d.email}`,
    `Project type: ${d.type}`,
    `Service: ${d.service}`,
    `Location: ${d.location || "-"}`,
    "",
    d.message,
  ].join("\n");
  const subject = `Estimate request: ${d.service} (${d.type})`;
  window.location.href = `${company.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [state, setState] = useState<State>({ kind: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (d.website) return setState({ kind: "sent" });

    if (!supabase) {
      openMailto(d);
      return setState({ kind: "sent", message: "Your email app should open with your request filled in." });
    }

    setState({ kind: "sending" });
    try {
      await submitEstimateRequest({
        name: d.name.trim(),
        phone: d.phone.trim(),
        email: d.email.trim(),
        project_type: d.type,
        service: d.service,
        location: d.location?.trim() || null,
        message: d.message.trim(),
      });
      form.reset();
      setState({ kind: "sent" });
    } catch {
      setState({
        kind: "error",
        message: `We couldn't send your request. Please call ${company.phone} or email ${company.email}.`,
      });
    }
  };

  if (state.kind === "sent") {
    return (
      <div className="contact-form" role="status">
        <h3 style={{ fontSize: "1.5rem" }}>Thank you, your request was received.</h3>
        <p>{state.message ?? "We'll review your project details and contact you shortly to discuss your estimate."}</p>
        <p>
          Need to talk sooner? Call <a href={company.phoneHref} style={{ color: "var(--orange)", fontWeight: 700 }}>{company.phone}</a>.
        </p>
        <button type="button" className="btn btn-outline-dark" onClick={() => setState({ kind: "idle" })}>Send another request</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="field-row">
        <label>Full Name<input name="name" type="text" autoComplete="name" maxLength={120} required /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
      </div>
      <label>Email<input name="email" type="email" autoComplete="email" maxLength={200} required /></label>
      <div className="field-row">
        <label>Project Type
          <select name="type" required>
            <option>Commercial</option>
            <option>Residential</option>
          </select>
        </label>
        <label>Service
          <select name="service" required>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <label>Project Location<input name="location" type="text" maxLength={200} placeholder="City or address" /></label>
      <label>Project Details<textarea name="message" rows={5} maxLength={4000} required placeholder="Describe the work you need done" /></label>
      <label aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}>
        Website<input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send Estimate Request"}
      </button>
      <p className="form-note" role="status">{state.kind === "error" ? state.message : ""}</p>
    </form>
  );
}
