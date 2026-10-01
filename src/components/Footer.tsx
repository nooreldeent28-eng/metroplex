import { company } from "../lib/company";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>Commercial &amp; residential general contractor. One contractor, multiple trades, complete property solutions.</p>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="/#general-contracting">General Contracting</a>
          <a href="/gallery">Project Gallery</a>
          <a href="/#about">About</a>
          <a href="/#contact">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <a href="/#services">Construction &amp; Remodeling</a>
          <a href="/#services">Painting &amp; Drywall</a>
          <a href="/#services">Welding &amp; Fencing</a>
          <a href="/#services">HVAC &amp; Plumbing</a>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <a href={company.phoneHref}>{company.phone}</a>
          <a href={company.emailHref}>{company.email}</a>
          <span>{company.serviceArea}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</span>
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top</a>
      </div>
    </footer>
  );
}
