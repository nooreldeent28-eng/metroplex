/* Checkout — demo only, stores order in localStorage */
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("checkout-form");
  var orderLines = document.getElementById("order-lines");
  var subtotalEl = document.getElementById("co-subtotal");
  var shippingEl = document.getElementById("co-shipping");
  var totalEl = document.getElementById("co-total");
  var success = document.getElementById("checkout-success");
  var checkoutMain = document.getElementById("checkout-main");
  var orderIdEl = document.getElementById("order-id");

  var items = ISHTAR.cart.get();
  if (!items.length && success && success.hidden) {
    location.href = "cart.html";
    return;
  }

  function shippingFor(subtotal) {
    if (subtotal <= 0) return 0;
    return subtotal >= 500 ? 0 : 35;
  }

  function refreshSummary() {
    items = ISHTAR.cart.get();
    if (!orderLines) return;
    orderLines.innerHTML = items
      .map(function (item) {
        return (
          '<div class="order-line"><span>' +
          item.name +
          " × " +
          item.qty +
          "</span><strong>" +
          ISHTAR.formatMoney(item.price * item.qty) +
          "</strong></div>"
        );
      })
      .join("");
    var sub = ISHTAR.cart.subtotal();
    var ship = shippingFor(sub);
    subtotalEl.textContent = ISHTAR.formatMoney(sub);
    shippingEl.textContent = ship === 0 ? "Free" : ISHTAR.formatMoney(ship);
    totalEl.textContent = ISHTAR.formatMoney(sub + ship);
  }

  refreshSummary();

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    var required = form.querySelectorAll("[required]");
    required.forEach(function (field) {
      var group = field.closest(".form-group");
      var ok = field.value.trim().length > 0;
      if (field.type === "email") {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }
      if (group) group.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      ISHTAR.toast("Please complete the required fields");
      return;
    }

    var data = new FormData(form);
    var sub = ISHTAR.cart.subtotal();
    var ship = shippingFor(sub);
    var order = {
      id: "IG-" + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      customer: {
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        address: data.get("address"),
        city: data.get("city"),
        postal: data.get("postal"),
        country: data.get("country"),
        notes: data.get("notes"),
      },
      items: ISHTAR.cart.get(),
      subtotal: sub,
      shipping: ship,
      total: sub + ship,
      currency: ISHTAR.settings.get().currency,
      payment: "Demo — no charge processed",
    };

    ISHTAR.orders.save(order);
    ISHTAR.cart.clear();

    checkoutMain.hidden = true;
    success.hidden = false;
    orderIdEl.textContent = order.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
