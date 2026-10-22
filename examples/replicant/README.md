# Replicant + Tyrell

A small Replicant app on Tyrell: routing with `tyrell.router`, Lucide icons via `tyrell.icons`, and the `ty-*` web components.

- **Home**: counter, and a reset confirmation in a `ty-modal` (the page behind zooms out by default; `no-zoom` turns it off).
- **Icons**: icons registered with `tyrell.icons/register!`.
- **Forms**: a plain `<form>` validated by the rules on its fields (`required`, `type="email"`, `pattern`, `minlength`/`maxlength`, `min`/`max`). Send it empty, leave a field after typing, or press Enter. `taken@example.com` shows a server-side error through `:error`. Interests is a multiple `ty-select` with icon options, shown as chips by `ty-selected-options`.
- **About**: what's in here.

## Run

```bash
npm install          # also copies tyrell.css / tyrell-theme.css into public/css
npm run dev          # shadow-cljs watch
```

Open http://localhost:8030. Routes are real paths (`/forms`, `/about`); the shadow-cljs dev server falls back to `index.html`, so reloading works.

Release build: `npm run build` (output in `public/js`).

## Versions

| Package | Version |
|---|---|
| `dev.gersak/tyrell` (Clojars) | `1.0.0-RC17-SNAPSHOT` |
| `tyrell-components` (npm) | `1.0.0-TC59` |
| `no.cjohansen/replicant` | `2025.06.21` |

`dev.gersak/tyrell` pulls in `tyrell-components` on its own; Lucide comes from `dev.gersak/tyrell-icons-lucide`. The npm dependency here is pinned so `npm install` can copy the matching CSS.

Ports: the app on 8030, the shadow-cljs server on 9641 (`:http` in `shadow-cljs.edn`), away from the defaults (8080, 9630) in case something else already holds them.
