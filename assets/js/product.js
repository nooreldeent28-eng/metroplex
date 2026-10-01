/* Product detail page */
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("product-root");
  if (!root) return;

  var id = new URLSearchParams(location.search).get("id");
  var product = id ? ISHTAR.getProduct(id) : null;

  if (!product) {
    root.innerHTML =
      '<div class="empty-state"><h1>Product not found</h1><p>That item is not in our catalog.</p><a class="btn btn-primary" href="shop.html">Back to shop</a></div>';
    return;
  }

  document.title = product.name + " — ISHTAR GATE PRO EQUIPMENT";

  var specs = Object.keys(product.specs || {})
    .map(function (key) {
      return (
        "<li><strong>" +
        key +
        "</strong><span>" +
        product.specs[key] +
        "</span></li>"
      );
    })
    .join("");

  var stockClass = product.stock < 10 ? "stock-low" : "stock-ok";
  var stockText =
    product.stock < 10
      ? "Only " + product.stock + " left"
      : "In stock (" + product.stock + ")";

  root.innerHTML =
    '<div class="product-detail">' +
    '<div class="product-gallery">' +
    '<img src="' +
    product.image +
    '" alt="' +
    product.name +
    '" width="400" height="400">' +
    "</div>" +
    '<div class="product-info">' +
    '<div class="product-cat">' +
    product.category +
    "</div>" +
    "<h1>" +
    product.name +
    "</h1>" +
    '<div class="product-price">' +
    ISHTAR.formatMoney(product.price) +
    (product.compareAt
      ? ' <span style="font-size:1rem;color:var(--muted);text-decoration:line-through;margin-left:0.5rem">' +
        ISHTAR.formatMoney(product.compareAt) +
        "</span>"
      : "") +
    "</div>" +
    '<p class="product-desc">' +
    product.description +
    "</p>" +
    '<ul class="product-meta">' +
    specs +
    "</ul>" +
    '<p class="' +
    stockClass +
    '">' +
    stockText +
    "</p>" +
    '<div class="qty-row">' +
    '<div class="qty-control" aria-label="Quantity">' +
    '<button type="button" id="qty-minus" aria-label="Decrease">−</button>' +
    '<input type="number" id="qty" value="1" min="1" max="' +
    product.stock +
    '" aria-label="Quantity">' +
    '<button type="button" id="qty-plus" aria-label="Increase">+</button>' +
    "</div>" +
    '<button type="button" class="btn btn-primary" id="add-to-cart">Add to cart</button>' +
    "</div>" +
    '<a class="btn btn-outline" href="shop.html">Continue shopping</a>' +
    "</div></div>";

  var qtyInput = document.getElementById("qty");
  document.getElementById("qty-minus").addEventListener("click", function () {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
  });
  document.getElementById("qty-plus").addEventListener("click", function () {
    qtyInput.value = Math.min(
      product.stock,
      (parseInt(qtyInput.value, 10) || 1) + 1
    );
  });
  document.getElementById("add-to-cart").addEventListener("click", function () {
    ISHTAR.cart.add(product.id, qtyInput.value);
    ISHTAR.toast("Added " + product.name + " to cart");
  });
});
