export function Brand({ href = "/#home" }: { href?: string }) {
  return (
    <a className="brand" href={href} aria-label="Metroplex Construction Services home">
      <span className="brand-mark" aria-hidden="true" />
      <span className="brand-text">
        <span className="brand-name">METROPLEX</span>
        <span className="brand-tag">CONSTRUCTION SERVICES</span>
      </span>
    </a>
  );
}
