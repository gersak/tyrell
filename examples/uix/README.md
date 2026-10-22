# UIx + Tyrell

A UIx app on the `tyrell-react` wrappers: a sidebar app with routing, buttons, native forms, the layout system, tooltips, a popup and modals.

**Versions:** `tyrell-components` / `tyrell-react` 1.0.0-RC17 (npm), `dev.gersak/tyrell` 1.0.0-RC17 (Clojars), UIx 1.0.1, React 18, shadow-cljs 3.4.6, Tailwind 4.

## Run

```bash
npm install          # also copies tyrell.css + tyrell-theme.css into public/css
npm run css:build    # Tailwind → public/css/app.css (or css:watch in a second terminal)
npm run dev          # shadow-cljs watch dev
```

Open http://localhost:3002. The shadow-cljs nREPL is on port 7889.

## Pages

- **Getting Started**: overview and links into the demos.
- **Buttons & Icons**: appearances (solid, outlined, ghost), flavors, pill, loading, icon-only and disabled buttons; the registered icons.
- **Forms & Inputs**: two forms with no validation code.
  - **Contact:**
    - Rules: `:required`, `:type "email"`, `:pattern`, `:min-length`, `:max-length`.
    - A priority `ty/Select`, a `ty/Textarea` and a `ty/Checkbox`.
    - An email ending in `@taken.com` comes back with a server-side `:error`.
  - **Account:**
    - Every rule at once: `:pattern`, `:min-length` with custom wording (`:too-short-message`), `:min` / `:max` on a number, `:type "url"`.
    - A password confirmation done with `setCustomValidity` on a ref, so the form won't submit and the message shows like any other rule's.
  - The browser checks the rules before `:on-submit` runs, so each handler only sees valid data. Failing fields show their message and the first one takes focus. A field you edit and leave shows its message too.
- **Layout & Containers**: `tyrell.layout` container context, breakpoints, responsive values and `ty-resize-observer`.
- **Modals & Overlays**:
  - Tooltip placements, flavors, rich content and delays.
  - A `ty/Popup` holding a form; it's anchored to its parent and closed through a ref after a valid submit.
  - Modals controlled with `:open` + `:on-close`: a basic one, one with a validated form (multiple select + `ty/SelectedOptions` chips), a confirmation with `:prevent-outside-click`, and a progress dialog.

## How it's wired

```clojure
(ns hello.core
  (:require ["tyrell-components"]         ; registers the <ty-*> custom elements
            ["tyrell-react" :as ty]       ; React wrappers
            [tyrell.router :as router]
            [uix.core :refer [defui $]]))

($ ty/Input {:name "email" :type "email" :label "Email" :required true
             :value email
             :on-change #(set-email (.. % -detail -value))})
```

- Event data is on `(.-detail e)`.
- `ty/Checkbox` is the tick only; wrap it in `($ :label …)` to name it.
- Icons are registered once by name in `hello.icons` with `tyrell.icons/register!` (Lucide, from `dev.gersak/tyrell`).

## Styling

Tyrell classes do color (`ty-elevated`, `ty-text+`, `ty-bg-primary-`), Tailwind does layout, spacing and type. `src/input.css` is the Tailwind source; the generated `public/css/app.css` is committed so the page works without a CSS build.

## Layout

```
src/
├── input.css                 # Tailwind source
└── hello/
    ├── core.cljs             # app shell, routes, home + buttons pages
    ├── icons.cljs            # icon registration
    └── views/
        ├── forms.cljs
        ├── layout.cljs
        └── modals.cljs
```
