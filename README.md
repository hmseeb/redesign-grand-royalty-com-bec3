# GRANDROYALTYLLC — Junk Removal & Hauling (Neosho, MO)

A production-ready, single-page marketing website built with vanilla HTML, CSS and JavaScript.
No build step, no dependencies, no environment variables — open `index.html` or serve the
directory statically.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Entire single-page site (hero, services, process, why-us, testimonials, FAQ, contact) |
| `styles.css` | All styling: design tokens, layout, components, responsive breakpoints, print styles |
| `script.js` | Mobile nav, sticky header, scroll reveals, form validation and submission |
| `favicon.svg` | Site icon |
| `robots.txt` / `sitemap.xml` | Basic SEO files |

## Sections

- **Hero** — business name, tagline and primary "Get a Free Quote" call to action
- **Stats** — service promises at a glance
- **Services** — eight junk-removal service categories with details
- **How It Works** — four-step process
- **Why Us** — differentiators
- **Testimonials** — local customer reviews plus a "Leave us a review" link to `/review`
- **FAQ** — eight common pre-booking questions, native `<details>` accordions
- **Contact** — email, address, service area, hours, and the quote request form
- **Footer** — service/company links, contact details and a "Leave us a review" link to `/review`

## Form

The single contact form POSTs to LeadrVision:

```
POST https://vision.leadrai.com/api/forms/d6f8fe64d2c4ef9b7cee19921cd5ef80
```

- Works without JavaScript via a plain HTML `POST`; the visitor returns with `?submitted=1`
  and the confirmation message is shown.
- With JavaScript, the same payload is sent via `fetch()` as JSON to the same URL and the
  confirmation is shown inline without a page reload.
- Hidden fields: `_form` (form name), `_page` (set to `window.location.href`), and a
  `_gotcha` honeypot.
- No file upload fields, no `mailto:` actions, no third-party form services.

## Review link

`/review` is provided by the hosting platform and is intentionally **not** implemented in
this repository. It is linked from the testimonials section, the contact section and the
footer.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Accessibility & performance notes

- Semantic landmarks (`header`, `main`, `section`, `footer`, `nav`), skip link, labelled form
  fields, visible focus rings, and `aria-expanded` on the nav toggle.
- Inline SVG icons only — no image requests, no icon-font payload.
- Honours `prefers-reduced-motion`.
