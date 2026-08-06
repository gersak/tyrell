# HTMX + Tyrell Guide

Tyrell ships standard Web Components, so they integrate with HTMX without a wrapper. Form-associated ty components participate in `FormData` automatically; `change` events bubble like native ones; swapped HTML upgrades into components on every swap.

This guide covers what's specific to that combination — the rest is just HTMX.

## Setup

Single CDN script tag, single stylesheet:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css">
  <!-- tyrell-theme.css: auto-contrast, seed-based rebranding, themes. See TY_GUIDE.md#quick-start -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell-theme.css">
  <script src="https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js"></script>
  <script src="https://unpkg.com/htmx.org@2"></script>
</head>
<body>
  <main hx-boost="true">
    <ty-button flavor="primary" hx-get="/api/hello" hx-target="#out">
      Click me
    </ty-button>
    <div id="out"></div>
  </main>
</body>
</html>
```

That's it. `<ty-*>` elements work as HTMX targets, triggers, and form fields with no glue code.

## Form submission — `FormData` works automatically

Every form-associated ty component (`ty-input`, `ty-textarea`, `ty-checkbox`, `ty-switch`, `ty-radio-group`, `ty-select`, `ty-date-picker`, `ty-file-upload`) calls `internals.setFormValue()` on every change. HTMX's `hx-post` / `hx-put` on a `<form>` includes them in the serialized payload under their `name` attribute — same as `<input>`.

```html
<form hx-post="/api/contact" hx-target="#result">
  <ty-input name="email" type="email" label="Email" required></ty-input>

  <ty-select name="topic" label="Topic">
    <ty-option value="sales">Sales</ty-option>
    <ty-option value="support">Support</ty-option>
  </ty-select>

  <ty-textarea name="message" label="Message" rows="4"></ty-textarea>

  <ty-button type="submit" flavor="primary">Send</ty-button>
</form>

<div id="result"></div>
```

The server receives `email`, `topic`, `message` in the request body. No `hx-vals`, no `hx-include` needed.

**Multi-value fields** (`ty-select multiple`) post repeated `name=` entries — your framework's body parser must support multi-value form fields (most do).

**File uploads** (`ty-file-upload`) need `hx-encoding="multipart/form-data"` on the form, just like a native file input. Each selected file is appended to the body under the component's `name` attribute (multiple entries when `multiple` is set):

```html
<form hx-post="/api/upload"
      hx-target="#result"
      hx-encoding="multipart/form-data">
  <ty-file-upload name="docs" label="Attachments" multiple
                  accept=".pdf,.docx"></ty-file-upload>
  <ty-button type="submit" flavor="primary">Upload</ty-button>
</form>
```

Server-side: read repeated `docs` parts (Flask `request.files.getlist('docs')`, Rails `params[:docs]`, Express `req.files`, etc.).

## Triggering on user changes — `hx-trigger="change"`

Tyrell components emit a bubbling `change` event when the user commits a new value. HTMX picks that up the same way it does for native inputs:

```html
<ty-select name="country"
           hx-get="/api/cities"
           hx-trigger="change"
           hx-target="#city-picker"
           hx-vals='js:{country: event.detail.value}'>
  <ty-option value="us">United States</ty-option>
  <ty-option value="de">Germany</ty-option>
</ty-select>

<div id="city-picker"></div>
```

The `hx-vals='js:{...}'` form lets you pull the actual value off `event.detail.value` rather than relying on serialization. For a single select inside a `<form>`, you can skip `hx-vals` and let normal form serialization handle it.

**Debouncing.** Use HTMX's built-in modifier — `hx-trigger="change delay:300ms"`. `ty-input` *also* has a built-in `delay` attribute that debounces its own `change` event before HTMX ever sees it; pick one, don't double up.

## Swapped content auto-upgrades

`customElements.define()` is global, so any `<ty-*>` tag arriving via an HTMX swap becomes a fully functional component immediately — no `htmx:afterSwap` hook needed.

```html
<button hx-get="/fragments/wizard" hx-target="#region" hx-swap="innerHTML">
  Load wizard
</button>
<div id="region"></div>
```

Server returns:
```html
<ty-wizard>
  <ty-step id="info" label="Info">…</ty-step>
  <ty-step id="confirm" label="Confirm">…</ty-step>
</ty-wizard>
```

The wizard renders, navigates, and animates as if it had been on the page from the start.

**Out-of-band swaps** (`hx-swap-oob`) work the same way. Modal-driven flows often pair `hx-target` with an OOB swap that injects `<ty-modal open>` into a slot at the bottom of `<body>`.

## Icons

You have two independent paths. Pick per icon; they coexist freely on the same page.

### Option A — inline SVG (no registry, BFF-friendly)

The simplest path for HTMX: render the SVG server-side and slot it as a child of `<ty-icon>`. No `name=`, no `window.tyIcons.register`, no boot `<script>` block:

```html
<!-- Whatever your template engine emits, just put the <svg> inside <ty-icon> -->
<ty-icon size="md" class="ty-text-primary">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
</ty-icon>
```

`size`, `spin`, `pulse`, `tempo`, and `ty-text-*` classes still apply to the host element. Use `currentColor` on `fill`/`stroke` so text-color classes tint the SVG. This works in every swap automatically — htmx swaps, OOB swaps, hx-boost transitions. A small template helper on the server side (Go template func, Jinja macro, Clojure helper emitting `[:ty-icon {...} svg-markup]`) keeps templates terse.

### Option B — registry (`name="…"`)

`<ty-icon name="check">` is a runtime registry lookup — the CDN bundle ships with **no icons preloaded**. Use this when you want short `name=` attributes across many fragments. Register before any HTML referencing an icon hits the page:

```html
<script type="module">
  import { check, search, x } from 'https://cdn.jsdelivr.net/npm/tyrell-components/icons/lucide';
  window.tyIcons.register({ check, search, x });
</script>
```

Place this `<script type="module">` *before* the first request that returns HTML containing `<ty-icon name="…">`. Icons referenced in swapped content render from the same registry — no need to re-register on each swap.

For server-rendered apps with many icons, pre-build a bundled icon manifest:

```html
<script type="module" src="/static/icons.js"></script>
```

```js
// /static/icons.js
import * as lucide from 'https://cdn.jsdelivr.net/npm/tyrell-components/icons/lucide';
window.tyIcons.register({
  check: lucide.check,
  search: lucide.search,
  user: lucide.user,
  // …everything your views might reference
});
```

## Modals and HTMX

`<ty-modal>` is a `<dialog>` wrapper. Two ergonomic patterns:

**Server controls open state** — toggle the `open` attribute via OOB swap:

```html
<!-- Trigger -->
<ty-button hx-get="/fragments/edit-modal" hx-target="#modal-slot" hx-swap="innerHTML">
  Edit
</ty-button>

<div id="modal-slot"></div>
```

Server returns the populated modal with `open` already set:
```html
<ty-modal open>
  <form hx-post="/api/save"
        hx-target="#modal-slot"
        hx-swap="innerHTML">
    …
    <ty-button type="submit" flavor="primary">Save</ty-button>
  </form>
</ty-modal>
```

After save, server returns an empty fragment, `#modal-slot` becomes empty, modal disappears.

**Client closes on success** — listen for the `htmx:afterRequest` event on the modal:

```html
<ty-modal id="m" open>
  <form hx-post="/api/save"
        hx-on::after-request="if (event.detail.successful) document.getElementById('m').removeAttribute('open')">
    …
  </form>
</ty-modal>
```

## Validation feedback

`hx-target-error` (or HTMX's response-target extension) lets the server return validation errors to a specific region. Pair with `ty-input`'s `error` attribute:

```html
<form hx-post="/api/signup" hx-target="#result">
  <ty-input id="email" name="email" type="email" label="Email"></ty-input>
  <div id="result"></div>
</form>
```

Server returns on 422:
```html
<ty-input id="email" name="email" type="email" label="Email"
          value="not-an-email"
          error="Enter a valid email"
          hx-swap-oob="true"></ty-input>
```

The OOB swap replaces the input with one carrying the error message. Tyrell renders the error text and the danger-flavored border automatically.

## Common pitfalls

- **Don't put HTMX attributes on the `<ty-option>` / `<ty-tab>` / `<ty-step>` children** — they're internal slots, not interactive. Put them on `<ty-select>` / `<ty-tabs>` / `<ty-wizard>` and use `hx-trigger="change"`.
- **Boolean values from `ty-checkbox`** post as `"on"` (or absent) — same as native `<input type="checkbox">`. `ty-switch` follows the same rule. If you need explicit `true`/`false`, wire it via `hx-vals='js:{enabled: this.checked}'`.
- **`ty-select multiple` posts repeated `name=` entries** (one per selected value). Confirm your backend reads multi-value fields (Express `body-parser` does, Ring's wrap-params does, Rails' `permit(:tags => [])` does).
- **Date format**: `ty-date-picker` posts ISO `YYYY-MM-DD` strings. Parse on the server accordingly.
- **Don't manually re-register components after a swap** — `customElements.define` is global, registration persists across swaps. Re-running the CDN bundle script will throw `NotSupportedError: already defined`.

## Why no wrapper package?

HTMX speaks HTML. Web Components speak HTML. There is no impedance mismatch to bridge — you're already at the same layer. Anything a wrapper would do (`hx-on`, `hx-vals`, `hx-trigger`) HTMX already gives you, and ty's form-associated internals + bubbling events do the rest.

## See also

- [TY_GUIDE.md](../TY_GUIDE.md) — universal component API
- [JAVASCRIPT_GUIDE.md](JAVASCRIPT_GUIDE.md) — bundlers, subpath imports, icon tree-shaking (when you outgrow the CDN script tag)
- [DATASTAR_TY_GUIDE.md](../DATASTAR_TY_GUIDE.md) — sibling server-driven approach using SSE + signals
- [CSS_GUIDE.md](../CSS_GUIDE.md) — color and surface classes
