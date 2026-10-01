/* Shop page filtering / sorting */
document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("shop-grid");
  var countEl = document.getElementById("shop-count");
  var searchInput = document.getElementById("filter-search");
  var sortSelect = document.getElementById("filter-sort");
  var catChecks = document.querySelectorAll('input[name="category"]');
  var params = new URLSearchParams(location.search);
  var initialCat = params.get("category");

  if (initialCat) {
    catChecks.forEach(function (cb) {
      cb.checked = cb.value === initialCat;
    });
  }

  function selectedCategories() {
    return Array.prototype.filter
      .call(catChecks, function (cb) {
        return cb.checked;
      })
      .map(function (cb) {
        return cb.value;
      });
  }

  function render() {
    var q = (searchInput.value || "").trim().toLowerCase();
    var cats = selectedCategories();
    var sort = sortSelect.value;
    var items = ISHTAR.products.slice();

    if (cats.length) {
      items = items.filter(function (p) {
        return cats.indexOf(p.category) !== -1;
      });
    }
    if (q) {
      items = items.filter(function (p) {
        return (
          p.name.toLowerCase().indexOf(q) !== -1 ||
          p.short.toLowerCase().indexOf(q) !== -1 ||
          p.category.toLowerCase().indexOf(q) !== -1
        );
      });
    }

    if (sort === "price-asc") {
      items.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (sort === "price-desc") {
      items.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (sort === "name") {
      items.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }

    countEl.textContent =
      items.length + " product" + (items.length === 1 ? "" : "s");

    if (!items.length) {
      grid.innerHTML =
        '<div class="empty-state"><p>No products match your filters.</p><button type="button" class="btn btn-outline" id="clear-filters">Clear filters</button></div>';
      var clearBtn = document.getElementById("clear-filters");
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          searchInput.value = "";
          catChecks.forEach(function (cb) {
            cb.checked = false;
          });
          sortSelect.value = "featured";
          render();
        });
      }
      return;
    }

    grid.innerHTML = items
      .map(function (p, i) {
        return ISHTAR.productCardHTML(p, i * 40);
      })
      .join("");
  }

  searchInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);
  catChecks.forEach(function (cb) {
    cb.addEventListener("change", render);
  });

  render();
});
