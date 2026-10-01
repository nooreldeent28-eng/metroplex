/* Cart + settings via localStorage */
window.ISHTAR = window.ISHTAR || {};

(function () {
  var CART_KEY = "ishtar_cart_v1";
  var SETTINGS_KEY = "ishtar_settings_v1";
  var ORDERS_KEY = "ishtar_orders_v1";

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  ISHTAR.settings = {
    defaults: {
      currency: "USD",
      reduceMotion: false,
    },
    get: function () {
      return Object.assign({}, this.defaults, read(SETTINGS_KEY, {}));
    },
    set: function (partial) {
      var next = Object.assign({}, this.get(), partial);
      write(SETTINGS_KEY, next);
      document.dispatchEvent(new CustomEvent("ishtar:settings", { detail: next }));
      return next;
    },
  };

  ISHTAR.cart = {
    get: function () {
      return read(CART_KEY, []);
    },
    save: function (items) {
      write(CART_KEY, items);
      document.dispatchEvent(new CustomEvent("ishtar:cart", { detail: items }));
      return items;
    },
    count: function () {
      return this.get().reduce(function (sum, item) {
        return sum + item.qty;
      }, 0);
    },
    findIndex: function (productId) {
      return this.get().findIndex(function (item) {
        return item.id === productId;
      });
    },
    add: function (productId, qty) {
      qty = Math.max(1, parseInt(qty, 10) || 1);
      var product = ISHTAR.getProduct(productId);
      if (!product) return null;
      var items = this.get();
      var idx = items.findIndex(function (i) {
        return i.id === productId;
      });
      if (idx >= 0) {
        items[idx].qty = Math.min(product.stock, items[idx].qty + qty);
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: Math.min(product.stock, qty),
        });
      }
      this.save(items);
      return items;
    },
    setQty: function (productId, qty) {
      qty = parseInt(qty, 10);
      var product = ISHTAR.getProduct(productId);
      var items = this.get();
      var idx = items.findIndex(function (i) {
        return i.id === productId;
      });
      if (idx < 0) return items;
      if (!qty || qty < 1) {
        items.splice(idx, 1);
      } else {
        items[idx].qty = Math.min(product ? product.stock : qty, qty);
      }
      return this.save(items);
    },
    remove: function (productId) {
      var items = this.get().filter(function (i) {
        return i.id !== productId;
      });
      return this.save(items);
    },
    clear: function () {
      return this.save([]);
    },
    subtotal: function () {
      return this.get().reduce(function (sum, item) {
        return sum + item.price * item.qty;
      }, 0);
    },
  };

  ISHTAR.orders = {
    list: function () {
      return read(ORDERS_KEY, []);
    },
    save: function (order) {
      var all = this.list();
      all.unshift(order);
      write(ORDERS_KEY, all);
      return order;
    },
  };
})();
