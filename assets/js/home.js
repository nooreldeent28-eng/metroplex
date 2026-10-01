/* Home page */
document.addEventListener("DOMContentLoaded", function () {
  var featured = document.getElementById("featured-grid");
  if (featured) {
    var list = ISHTAR.products.filter(function (p) {
      return p.featured;
    });
    featured.innerHTML = list
      .map(function (p, i) {
        return ISHTAR.productCardHTML(p, i * 60);
      })
      .join("");
  }

  var cats = document.getElementById("category-grid");
  if (cats) {
    cats.innerHTML = ISHTAR.categories
      .map(function (c) {
        return (
          '<a class="category-link reveal" href="shop.html?category=' +
          encodeURIComponent(c.id) +
          '">' +
          '<img src="' +
          c.image +
          '" alt="" width="200" height="200">' +
          "<div><h3>" +
          c.name +
          "</h3><p>" +
          c.blurb +
          "</p></div></a>"
        );
      })
      .join("");
    ISHTAR.initReveal();
  }
});
