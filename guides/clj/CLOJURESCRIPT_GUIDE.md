# ClojureScript + Tyrell Substrate Reference

> **Looking for the quickstart?** → [QUICKSTART.md](QUICKSTART.md) — two-track entry point (Reagent / re-frame / UIx / Helix via `tyrell.react`, or Replicant / vanilla via raw `<ty-*>`).

Use Tyrell from any ClojureScript app — Replicant, Reagent, UIx, Rum, or vanilla CLJS with no UI framework. This guide is the **substrate reference**: distribution, shadow-cljs setup, raw interop with web components, and icon tree-shaking.

For framework-specific patterns, see [REPLICANT_TY_GUIDE.md](REPLICANT_TY_GUIDE.md). The infrastructure guides ([ROUTING_GUIDE.md](ROUTING_GUIDE.md), [I18N_GUIDE.md](I18N_GUIDE.md), [LAYOUT_GUIDE.md](LAYOUT_GUIDE.md)) are already framework-agnostic.

## What you get

CLJS users add **one Clojars dep** — `dev.gersak/tyrell` — and that brings everything they need:

| What you get | Where it comes from |
|---|---|
| Routing, i18n, layout, icon registry, shim | CLJS namespaces in the JAR (`tyrell.router`, `tyrell.i18n`, `tyrell.layout`, `tyrell.icons`, `tyrell.shim`) |
| Web Components — `<ty-button>`, `<ty-input>`, etc. (21 primitives) | npm `tyrell-components`, declared in this artifact's `deps.cljs` and **auto-installed** into your `package.json` by shadow-cljs |
| `tyrell.components` shim | A side-effect-import wrapper around npm `tyrell-components`, so CLJS users only ever require `tyrell.*` namespaces |
| 12,000+ tree-shakeable icon defs | Transitive Clojars dep `dev.gersak/tyrell-icons`. Excludable if unwanted |
| React wrappers — `tyrell.react/Button`, `tyrell.react/Input`, ... | CLJS namespace re-exporting npm `tyrell-react`. Track A (React-based CLJS) only — npm package is **not** auto-pulled (opt-in) |

`dev.gersak/tyrell-icons` is a separate Clojars artifact containing icon namespaces (`tyrell.lucide`, `tyrell.heroicons.*`, `tyrell.material.*`, `tyrell.fontawesome.*`). Each icon is an individual CLJS `def` — shadow-cljs `:advanced` removes unused ones automatically.

> **How npm auto-install works.** The `dev.gersak/tyrell` JAR ships with a `deps.cljs` at the classpath root that declares `{:npm-deps {"tyrell-components" "<pinned-version>"}}`. shadow-cljs reads it on each build and runs `npm install --save --save-exact tyrell-components@<version>`, so you never write that line manually. The entry will appear in your `package.json` after the first build — that's the standard shadow-cljs contract for library-declared npm deps.

## Setup

[![Clojars Project](https://img.shields.io/clojars/v/dev.gersak/tyrell.svg)](https://clojars.org/dev.gersak/tyrell)

### 1. Add one Clojars dep

`deps.edn`:

```clojure
{:deps {dev.gersak/tyrell {:mvn/version "..."}}}   ; latest from Clojars badge above
```

That single dep brings:
- The CLJS infrastructure (`tyrell.router`, `tyrell.i18n`, `tyrell.layout`, `tyrell.icons`, `tyrell.shim`)
- The `tyrell.components` shim namespace that side-effect-imports the npm package
- Transitive `dev.gersak/tyrell-icons` — 12,000+ tree-shakeable icon defs

The npm `tyrell-components` package is declared in this artifact's `deps.cljs`, so shadow-cljs auto-installs it into your `package.json` on first build. No manual `npm install tyrell-components` needed.

If you don't want the icons artifact:
```clojure
{:deps {dev.gersak/tyrell {:mvn/version "..."
                           :exclusions [dev.gersak/tyrell-icons]}}}
```

### 2. Load `tyrell.css`

Component classes only work once the stylesheet is loaded. shadow-cljs doesn't process CSS imports from CLJS, so you load it separately. Pick one of the paths in [`### CSS handling`](#css-handling) below — recap:

```html
<!-- A. CDN <link> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
```

```bash
# B. Fetch into your public/ once
cp node_modules/tyrell-components/css/tyrell.css public/css/tyrell.css
# Then <link rel="stylesheet" href="/css/tyrell.css"> in your HTML
```

```css
/* C. Tailwind / PostCSS pipeline — add to your CSS entrypoint */
@import "../node_modules/tyrell-components/css/tyrell.css";
@import "tailwindcss";
```

### 3. Load components in your app

Two paths — pick one:

#### Path A — `tyrell.components` shim (recommended)

```clojure
(ns my-app.core
  (:require [tyrell.components]))   ; side-effect: registers all <ty-*> elements
```

That single CLJS require pulls in the npm package transitively (already declared via `deps.cljs`). Components are marked side-effectful in the npm package's `package.json`; icons are not — they only enter your bundle when you reference them.

For fine-grained tree-shaking, you can bypass the shim and import npm subpaths directly:

```clojure
(ns my-app.core
  (:require ["tyrell-components/button"]
            ["tyrell-components/input"]
            ["tyrell-components/dropdown"]
            ["tyrell-components/modal"]))
```

Subpaths match component names: `button`, `input`, `textarea`, `checkbox`, `dropdown`, `option`, `multiselect`, `tag`, `modal`, `popup`, `tooltip`, `tabs`, `tab`, `wizard`, `step`, `calendar`, `calendar-month`, `date-picker`, `icon`, `copy`, `resize-observer`, `scroll-container`.

#### Path B — CDN script tag

For server-rendered apps or when you don't want NPM in the loop:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>
```

The CDN bundle registers all components. From CLJS, you don't need to require anything — just use `<ty-*>` tags in your hiccup or DOM.

### 4. Verify

```clojure
(.appendChild js/document.body
  (doto (js/document.createElement "ty-button")
    (set! -textContent "Hello")))
```

If a styled button renders, you're set.

## Using Web Components from CLJS

The same three rules apply across every CLJS framework:

1. **Event payload lives on `event.detail`.** In CLJS: `(.. e -detail -value)` or `(j/get-in e [:detail :value])`.
2. **Properties vs attributes.** Booleans, arrays, objects must be set as JS properties, not attributes. Strings work as either.
3. **Don't conflate CLJS data and the DOM.** A `ty-multiselect` `value` is a JS array, not a CLJS vector — convert with `(clj->js)` going in and `(js->clj)` coming out (or use `js/Array.from`).

### Vanilla CLJS (no UI framework)

```clojure
(ns my-app.core
  (:require [tyrell.components]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

(defn render []
  (let [root (js/document.getElementById "app")
        input (doto (js/document.createElement "ty-input")
                (.setAttribute "label" "Email")
                (.setAttribute "type" "email"))
        button (doto (js/document.createElement "ty-button")
                 (.setAttribute "flavor" "primary")
                 (set! -textContent "Submit"))]
    (.addEventListener input "change"
      (fn [e]
        (js/console.log "email:" (.. e -detail -value))))
    (.addEventListener button "click"
      (fn [_]
        (js/console.log "value:" (.-value input))))
    (.appendChild root input)
    (.appendChild root button)))

(defn ^:export init []
  (icons/register! {:check lucide/check})
  (render))
```

### Hiccup (Replicant, Reagent, UIx, Rum)

Hiccup-based frameworks render `<ty-*>` tags directly. Each framework's idioms differ slightly — see [REPLICANT_TY_GUIDE.md](REPLICANT_TY_GUIDE.md) for one full example. The key concerns are framework-specific:

| Framework | Set property (not attribute) | Listen to event |
|---|---|---|
| Replicant | `:replicant/key` for stable identity; properties via DOM ops or `:dom/on-mount` | `[:on/change handler]` |
| Reagent | `:value-for-typeahead` etc. work as attrs; complex → use `:ref` | `:on-change` (lowercased) |
| UIx (Helix) | `$d` for DOM elements; props are camelCased | `:on-change` |
| Rum | Refs for property setting | `:on-change` |

Across all of them, `event.detail.value` access in CLJS:

```clojure
(fn [e] (.. e -detail -value))
```

### React-based CLJS — use `tyrell.react`

For Reagent, re-frame, UIx, and Helix, prefer the wrappers from `tyrell.react` over raw `<ty-*>` tags. React's synthetic event system doesn't bridge custom events — `[:> :ty-input {:on-change ...}]` would never fire with `event.detail.value`. The wrappers attach `addEventListener` on the underlying element so `:on-change` works the way React libs expect.

```clojure
(ns my-app.core
  (:require [tyrell.components]      ; side-effect: registers <ty-*> elements
            [tyrell.react :as ty]    ; React component vars
            [reagent.core :as r]))

[:> ty/Input
 {:label "Email"
  :value @email
  :on-change #(reset! email (.. % -detail -value))}]

[:> ty/Button {:flavor "primary"} "Save"]
```

`tyrell.react` is a CLJS shim inside `dev.gersak/tyrell` that re-exports the wrappers from npm `tyrell-react`. The npm package itself is **not** auto-installed — install it explicitly the same way you install `react` and `react-dom`:

```bash
npm install tyrell-react
```

Track B users (Replicant, vanilla) skip this step. Each wrapper exports under both `TyButton`/`TyInput` and short `Button`/`Input` names — pick one style.

## Icon registration in CLJS

`<ty-icon name="check">` is a runtime registry lookup. The compiler can't connect the string `"check"` to an icon export — you must register explicitly.

Each icon is a CLJS `def` returning an SVG string:

```clojure
(ns my-app.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.heroicons.outline :as ho]
            [tyrell.fontawesome.brands :as fa-brands]))

(defn register! []
  (icons/register!
    {:check        lucide/check
     :x            lucide/x
     :plus         lucide/plus
     :search       lucide/search
     :user         ho/user-circle
     :github       fa-brands/github
     :slack        fa-brands/slack}))
```

Call `register!` at app startup, before rendering. Use the icons anywhere:

```clojure
[:ty-icon {:name "check" :size "md"}]
[:ty-button {:flavor "primary"}
 [:ty-icon {:name "plus" :slot "start"}]
 "Add Item"]
```

### Tree-shaking

Shadow-cljs `:advanced` compilation removes unused icons automatically — you only pay for what you reference. Two rules to keep this working:

1. **Use the qualified namespace** (`lucide/check`, not aliasing). Aliases preserve tree-shaking; namespace requires that pull `:as :all` do not.
2. **Don't dynamically construct icon names.** `(symbol "lucide" name)` defeats DCE — the compiler can't see what's referenced. If you need dynamic icons, register every candidate up front.

Available icon namespaces in `dev.gersak/tyrell-icons`:

```
tyrell.lucide                   1,636 icons
tyrell.heroicons.outline          324 icons
tyrell.heroicons.solid            324 icons
tyrell.heroicons.mini             230 icons
tyrell.heroicons.micro            230 icons
tyrell.material.filled          2,400+ icons
tyrell.material.outlined        2,400+ icons
tyrell.material.round           2,400+ icons
tyrell.material.sharp           2,400+ icons
tyrell.material.two-tone        2,400+ icons
tyrell.fontawesome.solid        1,400+ icons
tyrell.fontawesome.regular        163 icons
tyrell.fontawesome.brands         500+ icons
```

### Custom SVGs

```clojure
(icons/register!
  {:company-logo "<svg viewBox=\"0 0 24 24\">...</svg>"})
```

## Shadow-cljs configuration tips

### `:js-options` for npm interop

Default config works. If you see issues with `tyrell-components` ESM imports:

```clojure
{:builds
 {:app
  {:target :browser
   :js-options {:resolve {"tyrell-components" {:target :npm
                                         :require "tyrell-components"}}}}}}
```

Usually unnecessary — shadow-cljs autodetects.

### CSS handling

Shadow-cljs doesn't process CSS imports from CLJS — `tyrell.css` lives outside the JS module graph and must be loaded separately. The simplest path is a `<link>` to the CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
```

For offline-friendly local dev, fetch the file once into your static directory:

```bash
# Pin a version, no npm install required (use the version from the badge or your package.json)
curl -o public/css/tyrell.css https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css

# Or copy from the version shadow-cljs already installed (after first build)
cp node_modules/tyrell-components/css/tyrell.css public/css/tyrell.css
```

Wire the second form as a `postinstall` script in `package.json` to keep the file in sync with whatever shadow-cljs installs:

```json
"scripts": {
  "postinstall": "mkdir -p public/css && cp node_modules/tyrell-components/css/tyrell.css public/css/tyrell.css"
}
```

Then reference it with `<link rel="stylesheet" href="/css/tyrell.css">`. The `cp` form auto-tracks whatever version is installed by your deps.

Projects with a CSS pipeline (Tailwind, PostCSS) can import the file directly into their entrypoint instead:

```css
@import "../node_modules/tyrell-components/css/tyrell.css";
@import "tailwindcss";
```

Tyrell's CSS gets bundled into your output stylesheet alongside everything else.

### Code splitting (lazy loading)

See [CODE_SPLITTING.md](CODE_SPLITTING.md) for shadow-cljs `:modules` setup. Pattern: defer heavy components (calendar/date-picker/dropdown) until the route that needs them loads.

## What's CLJS-specific

A few things differ from JS:

- **One Clojars dep covers everything** — `dev.gersak/tyrell` declares the npm `tyrell-components` package via `deps.cljs`, so you `:require [tyrell.components]` once and shadow-cljs handles npm install + module resolution. JS users do `npm install tyrell-components` directly; CLJS users don't need to.
- **No `'use client'` boundary** — shadow-cljs targets the browser by default. SSR with `:target :node` requires extra care; see existing CLJS SSR docs (out of scope here).
- **Icons can use keyword names** — `(icons/register! {:check lucide/check})` is idiomatic. Strings also work.
- **Property setting** — CLJS hiccup renderers (Reagent, Replicant, UIx) all have framework-specific quirks for setting JS properties vs HTML attributes. The component itself doesn't care; the framework's bridge does.
- **React wrappers via CLJS namespace** — `tyrell.react` re-exports `tyrell-react`'s components, so React-based CLJS frameworks alias `[tyrell.react :as ty]` instead of `["tyrell-react" :as ty]`. The npm package still needs to be installed manually (Track A only).

## See also

- [TY_GUIDE.md](../TY_GUIDE.md) — universal component API reference
- [CSS_GUIDE.md](../CSS_GUIDE.md) — design system
- [REPLICANT_TY_GUIDE.md](REPLICANT_TY_GUIDE.md) — Replicant-specific integration patterns
- [ROUTING_GUIDE.md](ROUTING_GUIDE.md) — `tyrell.router` (framework-agnostic)
- [I18N_GUIDE.md](I18N_GUIDE.md) — `tyrell.i18n` (framework-agnostic)
- [LAYOUT_GUIDE.md](LAYOUT_GUIDE.md) — `tyrell.layout` (framework-agnostic)
- [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) — `tyrell.shim` for building Web Components in CLJS
- [CODE_SPLITTING.md](CODE_SPLITTING.md) — shadow-cljs lazy loading
- [../js/JAVASCRIPT_GUIDE.md](../js/JAVASCRIPT_GUIDE.md) — JS-side substrate (bundlers, side-effects, SSR)
