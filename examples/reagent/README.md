# Reagent + Tyrell

A small Reagent app on the Tyrell React wrappers: routing, a sidebar, theme switching, a native form and a modal.

**Versions:** `tyrell-components` / `tyrell-react` 1.0.0-RC20 (npm), `dev.gersak/tyrell` 1.0.0-RC20 (Clojars), Reagent 2.0.0-alpha2, React 18.

## Run

```bash
npm install          # also copies tyrell.css + tyrell-theme.css into public/css
npm run dev          # shadow-cljs watch app
```

Open http://localhost:3001. Production build: `npm run build`.

## Pages

- **Home**: what's in the app, plus every registered icon.
- **Forms**: a profile form with no validation code.
  - The fields carry their rules: `:required`, `:type "email"`, `:pattern`, `:min-length`, `:max` on the date picker.
  - The browser checks them before `:on-submit` runs, so the handler only ever sees a valid form. Each failing field shows its message under it and the first one takes focus. A field you edit and leave shows its message too.
  - Server-side errors go in `:error`: an email ending in `@taken.com` comes back as "already registered".
  - Role is a single `ty/Select` with icon options. Skills is a `ty/Select` with `:multiple`, and `ty/SelectedOptions` shows the picks as chips.
  - Reset remounts the form, so shown messages go with it.
- **Buttons**: appearances (solid, outlined, ghost), flavors, icons, pill and icon-only buttons.
- **Components**: a controlled `ty/Modal` (`:open` + `:on-close`), and the list of wrappers.

## How it's wired

```clojure
(ns hello.core
  (:require [tyrell.components]        ; registers the <ty-*> custom elements
            [tyrell.react :as ty]      ; React wrappers: ty/Input, ty/Select, ty/Modal, …
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.material.filled :as mat-filled]
            [tyrell.router :as router]))

[:> ty/Input {:name "email" :type "email" :label "Email" :required true
              :value email
              :on-change #(set-field! :email (.. % -detail -value))}]
```

- Every wrapper exists under a short name (`ty/Input`) and a `Ty` name (`ty/TyInput`).
- Event data is on `(.-detail e)`.
- `ty/Checkbox` is the tick only; wrap it in a `[:label …]` to name it.
- Icons are registered once by name with `tyrell.icons/register!` (see `hello.core`). Lucide comes from `dev.gersak/tyrell-icons-lucide`, Material from `dev.gersak/tyrell-icons-material`.

## Layout

```
src/hello/
├── core.cljs        # icons, router init, root render
├── state.cljs       # app state, routes, theme
├── navigation.cljs  # sidebar, mobile menu, header
└── views.cljs       # Home, Forms, Buttons, Components
```

Styling follows the Tyrell rule: Tyrell classes for color (`ty-elevated`, `ty-text+`), Tailwind (Play CDN, no build step) for everything else.
