/* Cart page */
document.addEventListener("DOMContentLoaded", function () {
  var body = document.getElementById("cart-body");
  var empty = document.getElementById("cart-empty");
  var layout = document.getElementById("cart-layout");
  var subtotalEl = document.getElementById("cart-subtotal");
  var shippingEl = document.getElementById("cart-shipping");
  var totalEl = document.getElementById("cart-total");

  function shippingFor(subtotal) {
    if (subtotal <= 0) return 0;
    return subtotal >= 500 ? 0 : 35;
  }

  function render() {
    var items = ISHTAR.cart.get();
    if (!items.length) {
      layout.hidden = true;
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    layout.hidden = false;

    body.innerHTML = items
      .map(function (item) {
        return (
          "<tr>" +
          '<td data-label="Product"><div class="cart-item">' +
          '<img src="' +
          item.image +
          '" alt="" width="72" height="72">' +
          "<div><h3>" +
          item.name +
          '</h3><button type="button" class="remove-btn" data-remove="' +
          item.id +
          '">Remove</button></div></div></td>' +
          '<td data-label="Price">' +
          ISHTAR.formatMoney(item.price) +
          "</td>" +
          '<td data-label="Qty"><div class="qty-control">' +
          '<button type="button" data-qty-delta="-1" data-id="' +
          item.id +
          '">−</button>' +
          '<input type="number" min="1" value="' +
          item.qty +
          '" data-qty="' +
          item.id +
          '" aria-label="Quantity for ' +
          item.name +
          '">' +
          '<button type="button" data-qty-delta="1" data-id="' +
          item.id +
          '">+</button></div></td>' +
          '<td data-label="Total">' +
          ISHTAR.formatMoney(item.price * item.qty) +
          "</td></tr>"
        );
      })
      .join("");

    var sub = ISHTAR.cart.subtotal();
    var ship = shippingFor(sub);
    subtotalEl.textContent = ISHTAR.formatMoney(sub);
    shippingEl.textContent =
      ship === 0 ? "Free" : ISHTAR.formatMoney(ship);
    totalEl.textContent = ISHTAR.formatMoney(sub + ship);
  }

  body.addEventListener("click", function (e) {
    var remove = e.target.closest("[data-remove]");
    if (remove) {
      ISHTAR.cart.remove(remove.getAttribute("data-remove"));
      render();
      return;
    }
    var deltaBtn = e.target.closest("[data-qty-delta]");
    if (deltaBtn) {
      var id = deltaBtn.getAttribute("data-id");
      var delta = parseInt(deltaBtn.getAttribute("data-qty-delta"), 10);
      var item = ISHTAR.cart.get().find(function (i) {
        return i.id === id;
      });
      if (item) {
        ISHTAR.cart.setQty(id, item.qty + delta);
        render();
      }
    }
  });

  body.addEventListener("change", function (e) {
    var input = e.target.closest("[data-qty]");
    if (!input) return;
    ISHTAR.cart.setQty(input.getAttribute("data-qty"), input.value);
    render();
  });

  render();
});
