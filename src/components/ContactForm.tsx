import { useState, type FormEvent } from "react";
import { company } from "../lib/company";

const SERVICES = ["General Contracting", "Construction", "Remodeling", "Painting", "Drywall", "Welding", "Fencing", "HVAC", "Plumbing"];

export function ContactForm() {
  const [note, setNote] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
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
    setNote("Your email app should open with your request filled in. If it doesn't, call or email us directly.");
  };

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="field-row">
        <label>Full Name<input name="name" type="text" autoComplete="name" required /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" required /></label>
      </div>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
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
      <label>Project Location<input name="location" type="text" placeholder="City or address" /></label>
      <label>Project Details<textarea name="message" rows={5} required placeholder="Describe the work you need done" /></label>
      <button className="btn btn-primary btn-lg btn-block" type="submit">Send Estimate Request</button>
      <p className="form-note" role="status">{note}</p>
    </form>
  );
}
