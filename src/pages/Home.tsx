import { useEffect, type CSSProperties } from "react";
import { company } from "../lib/company";
import { ContactForm } from "../components/ContactForm";
import { FeaturedProjects } from "../components/FeaturedProjects";
import { useSiteImages, type SiteImageKey } from "../lib/siteImages";

const GC_CARDS = [
  {
    kicker: "Commercial",
    title: "Commercial General Contracting",
    image: "gc_commercial" as SiteImageKey,
    alt: "Finished commercial office interior",
    items: ["Commercial Improvements", "Interior Construction", "Renovations", "Property Repairs", "Multi-Trade Coordination", "Facility Improvements"],
  },
  {
    kicker: "Residential",
    title: "Residential General Contracting",
    image: "gc_residential" as SiteImageKey,
    alt: "Modern residential home exterior",
    items: ["Home Renovations", "Remodeling", "Repairs", "Interior Improvements", "Property Upgrades", "Multi-Trade Projects"],
  },
];

const SERVICES = [
  ["Construction", "New construction, build-outs, additions, and structural improvements for commercial and residential properties."],
  ["Remodeling", "Kitchens, bathrooms, offices, and full interior remodels planned and completed from start to finish."],
  ["Painting", "Interior and exterior painting with careful surface preparation and clean, durable finishes."],
  ["Drywall", "Drywall installation, repair, taping, and finishing for new spaces and renovations."],
  ["Welding", "Structural and ornamental welding, metal fabrication, gates, railings, and on-site repairs."],
  ["Fencing", "Wood, metal, and security fencing installed and repaired for homes and commercial sites."],
  ["HVAC", "Heating and cooling installation, replacement, and service to keep properties comfortable."],
  ["Plumbing", "Plumbing installation, repairs, fixture upgrades, and rough-in work for remodels and new builds."],
];

const SPLIT = [
  {
    eyebrow: "For Businesses & Property Owners",
    title: "Commercial",
    text: "Office, retail, and facility improvements managed with clear schedules, coordinated trades, and minimal disruption to your operations.",
    cta: "Start a Commercial Project",
    image: "split_commercial" as SiteImageKey,
  },
  {
    eyebrow: "For Homeowners",
    title: "Residential",
    text: "Renovations, remodels, repairs, and upgrades handled with respect for your home, your schedule, and your budget.",
    cta: "Start a Residential Project",
    image: "split_residential" as SiteImageKey,
  },
];

const WHY = [
  ["Single Point of Contact", "One team manages your project and coordinates every trade, so you're never chasing multiple contractors."],
  ["Multi-Trade Capability", "Construction, finishes, mechanical, and exterior work under one roof keeps projects moving."],
  ["Commercial & Residential", "We work on businesses and homes alike, and bring the same standards to both."],
  ["Clear Communication", "Straightforward estimates, regular updates, and direct answers from start to finish."],
  ["Quality Workmanship", "Careful preparation, proper materials, and attention to detail on every job."],
  ["Local Service", `Serving the ${company.serviceArea}.`],
];

const PROCESS = [
  ["Consultation", "We discuss your goals, timeline, and budget, and visit the site when needed."],
  ["Estimate & Plan", "You receive a clear scope and estimate, with the trades and schedule laid out."],
  ["Construction", "We manage the work and coordinate every trade, keeping you updated along the way."],
  ["Walkthrough", "We complete a final walkthrough with you to make sure everything is done right."],
];

const ABOUT_LIST = ["General Contracting", "Construction & Remodeling", "Finishes & Painting", "HVAC & Plumbing", "Welding & Fencing", "Property Improvements"];

export function Home() {
  const images = useSiteImages();

  useEffect(() => {
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();
  }, []);

  return (
    <main>
      <section className="hero" id="home" style={{ "--hero-bg": `url('${images.hero}')` } as CSSProperties}>
        <div className="container hero-content">
          <p className="eyebrow eyebrow-light">Commercial &amp; Residential General Contracting</p>
          <h1>Built Right.<br /><span>Managed Right.</span></h1>
          <p className="hero-copy">
            {company.name} provides commercial and residential general contracting, construction, remodeling, painting, drywall, welding, fencing, HVAC, and plumbing services.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-lg" href="#contact">Request a Project Estimate</a>
            <a className="btn btn-outline-light btn-lg" href="#services">Explore Our Services</a>
          </div>
          <a className="hero-phone" href={company.phoneHref}>Call {company.phone}</a>
          <p className="hero-tagline">One Contractor. Multiple Trades. Complete Property Solutions.</p>
        </div>
        <div className="trust-bar">
          <ul className="container trust-list">
            <li>Commercial Projects</li>
            <li>Residential Projects</li>
            <li>Multi-Trade Services</li>
            <li>Property Improvements</li>
          </ul>
        </div>
      </section>

      <section className="section" id="general-contracting">
        <div className="container">
          <div className="gc-intro">
            <div>
              <p className="eyebrow">General Contracting</p>
              <h2 className="section-title">One Contractor.<br />One Point of Contact.</h2>
            </div>
            <p className="lead">
              {company.name} coordinates commercial and residential construction, renovations, repairs, property improvements, and specialized trades through one dependable point of contact.
            </p>
          </div>
          <div className="gc-grid">
            {GC_CARDS.map((c) => (
              <article className="gc-card" key={c.title}>
                <img src={images[c.image]} alt={c.alt} loading="lazy" width={900} height={600} />
                <div className="gc-card-body">
                  <p className="card-kicker">{c.kicker}</p>
                  <h3>{c.title}</h3>
                  <ul className="check-list">
                    {c.items.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <div className="center-cta">
            <a className="btn btn-primary btn-lg" href="#contact">Discuss Your Project</a>
          </div>
        </div>
      </section>

      <section className="section section-white" id="services">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Services</p>
            <h2 className="section-title">Complete Construction &amp; Property Services</h2>
            <p className="section-sub">Every trade your project needs, coordinated under one contractor.</p>
          </div>
          <div className="service-grid">
            {SERVICES.map(([title, text], i) => (
              <article className="service-card" key={title}>
                <span className="service-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="split" aria-label="Commercial and residential">
        {SPLIT.map((s) => (
          <article className="split-panel" key={s.title} style={{ "--bg": `url('${images[s.image]}')` } as CSSProperties}>
            <div className="split-inner">
              <p className="eyebrow eyebrow-light">{s.eyebrow}</p>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              <a className="btn btn-primary" href="#contact">{s.cta}</a>
            </div>
          </article>
        ))}
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Why Metroplex</p>
            <h2 className="section-title">A Contractor You Can Rely On</h2>
          </div>
          <div className="why-grid">
            {WHY.map(([title, text]) => (
              <div className="why-item" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProjects />

      <section className="section section-white">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Process</p>
            <h2 className="section-title">From First Call to Final Walkthrough</h2>
          </div>
          <ol className="process">
            {PROCESS.map(([title, text], i) => (
              <li key={title}>
                <span className="step">Step {String(i + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container about">
          <div className="about-media">
            <img src={images.about} alt="Contractor reviewing construction plans" loading="lazy" />
          </div>
          <div className="about-copy">
            <p className="eyebrow">About Metroplex</p>
            <h2 className="section-title">Dependable General Contracting for Every Property</h2>
            <p className="lead">{company.name} is a commercial and residential general contractor serving the {company.serviceArea}.</p>
            <p>
              We bring construction, remodeling, and specialized trades together under one team. Whether you're improving a commercial facility or renovating your home, we plan the work, coordinate the trades, and see the job through to a clean finish.
            </p>
            <ul className="check-list check-list-2">
              {ABOUT_LIST.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Ready to Start Your Project?</h2>
            <p>Tell us what you need. We'll provide a clear, no-obligation estimate.</p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-dark btn-lg" href="#contact">Request a Project Estimate</a>
            <a className="btn btn-outline-dark btn-lg" href={company.phoneHref}>Call {company.phone}</a>
          </div>
        </div>
      </section>

      <section className="section section-white" id="contact">
        <div className="container contact">
          <div className="contact-info">
            <p className="eyebrow">Contact</p>
            <h2 className="section-title">Request an Estimate</h2>
            <p className="lead">Share a few details about your project and we'll follow up promptly.</p>
            <dl className="contact-list">
              <div><dt>Phone</dt><dd><a href={company.phoneHref}>{company.phone}</a></dd></div>
              <div><dt>Email</dt><dd><a href={company.emailHref}>{company.email}</a></dd></div>
              <div><dt>Service Area</dt><dd>{company.serviceArea}</dd></div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
