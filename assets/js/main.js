/* Shared UI helpers */
window.ISHTAR = window.ISHTAR || {};

ISHTAR.toast = function (message) {
  var wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    wrap.setAttribute("aria-live", "polite");
    document.body.appendChild(wrap);
  }
  var el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(function () {
    el.remove();
  }, 2800);
};

ISHTAR.updateCartBadge = function () {
  var count = ISHTAR.cart.count();
  document.querySelectorAll(".cart-count").forEach(function (badge) {
    badge.textContent = count > 0 ? String(count) : "";
    badge.setAttribute("data-count", String(count));
  });
};

ISHTAR.productCardHTML = function (product, delay) {
  var price = ISHTAR.formatMoney(product.price);
  var badge = product.badge
    ? '<span class="product-badge">' + product.badge + "</span>"
    : "";
  var style = delay ? ' style="animation-delay:' + delay + 'ms"' : "";
  return (
    '<article class="product-card"' +
    style +
    ">" +
    '<a class="product-card-media" href="product.html?id=' +
    encodeURIComponent(product.id) +
    '">' +
    badge +
    '<img src="' +
    product.image +
    '" alt="' +
    product.name +
    '" loading="lazy" width="400" height="400">' +
    "</a>" +
    '<div class="product-card-body">' +
    '<div class="product-card-cat">' +
    product.category +
    "</div>" +
    '<h3 class="product-card-title"><a href="product.html?id=' +
    encodeURIComponent(product.id) +
    '">' +
    product.name +
    "</a></h3>" +
    '<div class="product-card-price">' +
    price +
    "</div>" +
    '<div class="product-card-actions">' +
    '<button type="button" class="btn btn-primary btn-sm" data-add="' +
    product.id +
    '">Add to cart</button>' +
    '<a class="btn btn-outline btn-sm" href="product.html?id=' +
    encodeURIComponent(product.id) +
    '">View</a>' +
    "</div></div></article>"
  );
};

ISHTAR.bindAddButtons = function (root) {
  (root || document).addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    var id = btn.getAttribute("data-add");
    ISHTAR.cart.add(id, 1);
    ISHTAR.toast("Added to cart");
  });
};

ISHTAR.initHeader = function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a").forEach(function (link) {
    var href = (link.getAttribute("href") || "").toLowerCase();
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  ISHTAR.updateCartBadge();
};

ISHTAR.initReveal = function () {
  var nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;
  if (!("IntersectionObserver" in window)) {
    nodes.forEach(function (n) {
      n.classList.add("visible");
    });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  nodes.forEach(function (n) {
    io.observe(n);
  });
};

document.addEventListener("DOMContentLoaded", function () {
  ISHTAR.initHeader();
  ISHTAR.bindAddButtons(document);
  ISHTAR.initReveal();
});

document.addEventListener("ishtar:cart", function () {
  ISHTAR.updateCartBadge();
});
