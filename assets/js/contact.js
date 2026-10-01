/* Contact form + settings (localStorage demo) */
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');
      var ok = true;
      [name, email, message].forEach(function (field) {
        var group = field.closest(".form-group");
        var valid = field.value.trim().length > 0;
        if (field === email) {
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        if (group) group.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        ISHTAR.toast("Please fill in all fields");
        return;
      }
      var messages = JSON.parse(localStorage.getItem("ishtar_messages_v1") || "[]");
      messages.unshift({
        name: name.value.trim(),
        email: email.value.trim(),
        message: message.value.trim(),
        at: new Date().toISOString(),
      });
      localStorage.setItem("ishtar_messages_v1", JSON.stringify(messages));
      form.reset();
      ISHTAR.toast("Message saved locally — demo only, no email sent");
    });
  }

  var currency = document.getElementById("setting-currency");
  if (currency) {
    currency.value = ISHTAR.settings.get().currency || "USD";
    currency.addEventListener("change", function () {
      ISHTAR.settings.set({ currency: currency.value });
      ISHTAR.toast("Currency preference saved");
    });
  }
});
