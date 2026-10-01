import { useEffect, useState } from "react";
import { company } from "../lib/company";
import { Brand } from "./Brand";

const NAV = [
  { href: "/#home", label: "Home" },
  { href: "/#general-contracting", label: "General Contracting" },
  { href: "/#services", label: "Services" },
  { href: "/gallery", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${open ? " is-open" : ""}${scrolled ? " is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Brand />
        <nav className="nav" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={company.phoneHref}>{company.phone}</a>
          <a className="btn btn-primary btn-sm" href="/#contact">Request Estimate</a>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
      <div className="mobile-menu" id="mobile-menu">
        <nav className="container" aria-label="Mobile">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={close}>{n.label}</a>
          ))}
          <a className="btn btn-outline-dark" href={company.phoneHref}>Call {company.phone}</a>
          <a className="btn btn-primary" href="/#contact" onClick={close}>Request Estimate</a>
        </nav>
      </div>
    </header>
  );
}
