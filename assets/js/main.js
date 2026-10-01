(() => {
  document.querySelectorAll("[data-company]").forEach((el) => {
    const key = el.dataset.company;
    if (key === "phone" || key === "email") {
      el.href = company[`${key}Href`];
      if (!el.textContent.trim()) el.textContent = company[key];
    } else {
      el.textContent = company[key];
    }
  });
  document.querySelectorAll("[data-phone-label]").forEach((el) => {
    el.textContent = `${el.dataset.phoneLabel} ${company.phone}`;
    el.href = company.phoneHref;
  });

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".mobile-menu a").forEach((a) => a.addEventListener("click", closeMenu));

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.getElementById("year").textContent = new Date().getFullYear();

  const form = document.getElementById("estimate-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form));
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
    document.getElementById("form-note").textContent =
      "Your email app should open with your request filled in. If it doesn't, call or email us directly.";
  });
})();
