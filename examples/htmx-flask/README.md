# Flask + HTMX + Tyrell

A server-rendered Flask app using [Tyrell](https://github.com/gersak/tyrell) web components with HTMX. Every page is plain HTML from Jinja templates; HTMX swaps in server-rendered fragments; Tyrell supplies the form fields, selects, modals, calendar and icons.

Tyrell `1.0.0-RC20` loads from jsDelivr (`templates/base.html`). The version is set in one place, `TYRELL_VERSION` in `app.py`.

## Run it

Needs Python 3.9+ and Node 18+.

```bash
cd examples/htmx-flask
./setup.sh                 # npm install, build CSS + icons, Python venv
npm start                  # → http://localhost:9000
```

While editing templates or styles, `npm run dev` also rebuilds Tailwind and the icon bundle on change.

## Pages

| Page | What it shows |
|---|---|
| `/` | Live user search (`hx-trigger="input changed delay:300ms"`), task filters on `ty-select` change, calendar + quick event form, modals filled by `hx-get` |
| `/forms` | A form validated by the browser before `hx-post` fires, with server-side errors returned as `error="…"` on the field; a dynamic form builder; `ty-file-upload` |
| `/calendar` | `ty-calendar` with per-day event badges (`dayContentFn`) loaded from the server |
| `/modals` | Static, dynamic and nested modals, a validated contact form, and a three-step wizard where each step is a form |
| `/components` | Every component with its variants: buttons, inputs, selects (single, multiple, rich options, `ty-selected-options` chips), tags, modal close behavior |

## How the pieces fit

**Components from the CDN.** `base.html` loads `tyrell.css`, `tyrell-theme.css` and `tyrell.js` from jsDelivr, pinned to `TYRELL_VERSION`.

**Icons.** `src/icons-source.js` imports only the Lucide icons the templates use and registers them with `window.tyIcons.register(…)`. `npm run build:icons` bundles it into `static/js/icons.js`, which `base.html` loads right after `tyrell.js`. Add an icon by importing it there and rebuilding.

**Forms and validation.** Tyrell fields are form-associated: they submit with the form and take the browser's rules (`required`, `type="email"`, `pattern`, `minlength`/`maxlength`, `min`/`max`). The browser checks them before `submit` fires, so `hx-post` on a `<form>` only sends once every field passes; failing fields show their message under the field and the first one takes focus. No validation JavaScript.

The server repeats the checks and adds the ones only it can make (`/api/form/validate` rejects an email that already has an account), then re-renders the form with `error="…"` on the failing field:

```html
<form hx-post="/api/form/validate" hx-target="this" hx-swap="outerHTML">
  <ty-input name="email" label="Email" type="email" required
            value="{{ values.email }}"
            {% if errors.email %}error="{{ errors.email }}"{% endif %}></ty-input>
  <ty-button type="submit" flavor="primary">Create account</ty-button>
</form>
```

`ty-select multiple` submits one entry per value (`request.form.getlist("skills")`), like a native multiple select.

**Buttons.** `ty-button` defaults to `type="submit"`, like `<button>`. Buttons inside a form that shouldn't submit need `type="button"`. A submit button gets `loading` while its form's request is in flight (`static/js/app.js`).

**Modals.** `ty-modal` is an invisible frame; the panel inside is yours (`ty-floating rounded-xl …`). Open and close with `.show()` / `.hide()`. Escape and a backdrop click close it unless you add `prevent-escape` / `prevent-outside-click`; `no-backdrop` drops the dimmed page and `no-zoom` keeps the page behind from scaling.

## Files

```
app.py                     Flask routes, sample data, server-side validation
templates/base.html        Layout; loads Tyrell, icons, HTMX, app.js
templates/*.html           Pages
templates/partials/        Fragments returned to HTMX (signup form, wizard, lists, modals)
src/input.css              Tailwind entry + app styles  → static/css/app.css
src/icons-source.js        Icon registration           → static/js/icons.js
static/js/app.js           Submit loading state, error toasts
```

`static/css/app.css` is committed; `static/js/icons.js` is built by `npm run build` (the `static/` folder is git-ignored apart from the files already tracked).
