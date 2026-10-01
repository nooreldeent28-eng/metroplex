# ISHTAR GATE PRO EQUIPMENT

Responsive demo e-commerce storefront for professional gym equipment.

## Stack

- HTML5 / CSS3 / Vanilla JavaScript
- No React, backend, database, or paid APIs
- Cart, settings, demo orders, and contact messages in `localStorage`
- Local fonts and SVG images (no external image URLs)

## Run locally

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| Shop | `shop.html` |
| Product | `product.html?id=…` |
| Cart | `cart.html` |
| Checkout | `checkout.html` |
| About | `about.html` |
| Contact | `contact.html` |

## Assets

- CSS: `assets/css/style.css`
- JS: `assets/js/`
- Images: `assets/images/`
- Fonts: `assets/fonts/` (Syne + Manrope, OFL)

## localStorage keys

- `ishtar_cart_v1` — cart items
- `ishtar_settings_v1` — currency preference
- `ishtar_orders_v1` — demo checkout orders
- `ishtar_messages_v1` — contact form submissions
