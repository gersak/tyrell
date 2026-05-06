<blockquote style="color: #414863">
<p><em>"After playing around with Replicant, I realized I could build Web Components without React — actually, even without Replicant.</em></p>

<p><em>I'm wondering if it's called 'Replicant' because of <strong>Blade Runner</strong> (I love Blade Runner).</em></p>

<p><em>Maybe I could name my own library something similar... Tyrell? No, that feels pretentious.</em></p>

<p><em>Anyway, I don't really want to type something long like <code>tyrell-button</code>. It should be shorter — maybe <code>ty-button</code>.</em></p>

<p><strong><em>Yes! Let's call it ty."</em></strong></p>
</blockquote>

<blockquote style="color: #414863">
<p><em>Nine months later…</em></p>

<p><em>"Nine months in, <strong>ty</strong> still reads as <strong>'thank you'</strong> — Just had to cut that and call it properly."</em></p>

<p><em>"The library is <strong>Tyrell</strong>. CLJS namespaces are <code>tyrell.*</code> now (<code>tyrell.router</code>, <code>tyrell.components</code>, <code>tyrell.lucide</code>). Component tags stay <code>ty-*</code> — web custom elements need the dash anyway, and two letters earn their keep. CSS classes stay <code>ty-*</code> for the same reason. The prefix earned the shortcut; the brand didn't."</em></p>

<p><strong><em>"No thanks involved. Just replicants."</em></strong></p>
</blockquote>

# Tyrell

[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/tyrell-components/badge)](https://www.jsdelivr.com/package/npm/tyrell-components)
[![NPM Version](https://img.shields.io/npm/v/tyrell-components.svg)](https://www.npmjs.com/package/tyrell-components)
[![Clojars Project](https://img.shields.io/clojars/v/dev.gersak/tyrell.svg)](https://clojars.org/dev.gersak/tyrell)

**More framework than framework.** Tyrell ships Web Components that work everywhere — React, Vue, HTMX, vanilla JS, ClojureScript.

**[Live Demo & Docs →](https://gersak.github.io/tyrell)**

## Why Tyrell?

Tyrell is a **framework-agnostic evolution of [Toddler](https://github.com/gersak/toddler)**, a ClojureScript UI library built on Helix (React).

Toddler provided great components (calendar, dropdown, routing, icons) but was locked to React/Helix. Tyrell takes that component library and rebuilds it with **Web Components**, making the same functionality available everywhere — React, Vue, HTMX, vanilla JS, and all ClojureScript frameworks (Replicant, UIx, Reagent).

Same components. Zero framework lock-in.

---

## Load from CDN

Always loads the latest version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css">
<script src="https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js"></script>
```

Pin to a specific version (recommended for production):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-RC6/css/tyrell.css">
<script src="https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-RC6/dist/tyrell.js"></script>
```

Browse all available versions on [NPM](https://www.npmjs.com/package/tyrell-components?activeTab=versions) or [jsdelivr](https://www.jsdelivr.com/package/npm/tyrell-components).

Then use components anywhere:

```html
<ty-button flavor="primary">Click me</ty-button>
<ty-dropdown label="Country" placeholder="Select...">
  <ty-option value="us">United States</ty-option>
  <ty-option value="de">Germany</ty-option>
</ty-dropdown>
```

---

## Guides

Pick the entry point for your stack:

### JavaScript / TypeScript
- **[Vanilla JS Guide](guides/js/JAVASCRIPT_GUIDE.md)** — bundlers, subpath imports, icon tree-shaking, code splitting, SSR
- **[React Guide](guides/js/REACT_TY_GUIDE.md)** — `tyrell-react` wrappers
- **[Vue Guide](guides/js/VUE_TY_GUIDE.md)** — Vue 3 / Nuxt native usage (no wrapper package)
- **[Svelte Guide](guides/js/SVELTE_TY_GUIDE.md)** — Svelte 5 / SvelteKit native usage (no wrapper package)
- **[TyComponent Guide](guides/js/TYCOMPONENT_GUIDE.md)** — base class for building custom components

### ClojureScript
- **[Quickstart](guides/clj/QUICKSTART.md)** — five-minute setup for any CLJS view layer
- **[CLJS Substrate Reference](guides/clj/CLOJURESCRIPT_GUIDE.md)** — distribution, shadow-cljs, raw interop, icon tree-shaking
- **[UIx Guide](guides/clj/UIX_TY_GUIDE.md)** — `defui` + `$`, hooks-only, auto-camelCase props
- **[Reagent Guide](guides/clj/REAGENT_TY_GUIDE.md)** — hiccup + `r/atom`, `:>` interop with camelCase props
- **[Helix Guide](guides/clj/HELIX_TY_GUIDE.md)** — `defnc` + `$`, `helix.dom/hooks`, JSX-feeling
- **[Replicant Guide](guides/clj/REPLICANT_TY_GUIDE.md)** — non-React, raw `<ty-*>` elements
- **[Component Guide](guides/clj/COMPONENT_GUIDE.md)** — `tyrell.shim` for building Web Components in CLJS
- **[Code Splitting](guides/clj/CODE_SPLITTING.md)** — shadow-cljs lazy loading
- **[Routing](guides/clj/ROUTING_GUIDE.md)** — `tyrell.router`
- **[i18n](guides/clj/I18N_GUIDE.md)** — `tyrell.i18n`
- **[Layout](guides/clj/LAYOUT_GUIDE.md)** — `tyrell.layout` container-aware breakpoints

### Server-driven UIs
- **[HTMX Guide](guides/js/HTMX_TY_GUIDE.md)** — `hx-*` attributes + form-associated `<ty-*>`
- **[Datastar Guide](guides/DATASTAR_TY_GUIDE.md)** — Datastar + SSE patterns

---

## ClojureScript

Add to `deps.edn`:

```clojure
{:deps {dev.gersak/tyrell {:mvn/version "1.0.0-RC6"}}}   ; icons come transitively
```

That single dep brings:
- Routing, i18n, layout, icon registry, shim — `tyrell.router`, `tyrell.i18n`, `tyrell.layout`, `tyrell.icons`, `tyrell.shim`
- The `tyrell.components` shim that side-effect-imports the npm package
- 12,000+ tree-shakeable icons (`tyrell.lucide`, `tyrell.heroicons.*`, `tyrell.material.*`, `tyrell.fontawesome.*`)

The npm `tyrell-components` package is declared in this artifact's `deps.cljs`, so shadow-cljs auto-installs it on first build.

### Pick your view layer

| You're using                              | Guide |
|-------------------------------------------|-------|
| Reagent, re-frame, UIx, Helix             | [QUICKSTART → Track A](guides/clj/QUICKSTART.md) — `tyrell.react` wrappers |
| Replicant, vanilla CLJS, server-rendered  | [REPLICANT_TY_GUIDE](guides/clj/REPLICANT_TY_GUIDE.md) — raw `<ty-*>` elements |

### Icon registration

`<ty-icon name="check">` is a runtime registry lookup. Register the icons you reference at app startup:

```clojure
(ns my-app.core
  (:require [tyrell.components]            ; side-effect: registers all <ty-*> elements
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.heroicons.outline :as ho]))

(defn register-icons! []
  (icons/register!
    {:check  lucide/check
     :search lucide/search
     :user   ho/user-circle}))
```

Shadow-cljs `:advanced` removes unused icons automatically — you only pay for what you reference. See [CLOJURESCRIPT_GUIDE → Icon registration](guides/clj/CLOJURESCRIPT_GUIDE.md#icon-registration-in-cljs).

### Build Your Own Components

Use `tyrell.shim` to turn any ClojureScript render function into a Web Component:

```clojure
(ns app.components
  (:require [replicant.dom :as d]
            [tyrell.shim :as shim]))

(defn greeting [name]
  [:div.ty-elevated.p-4.rounded-lg
   [:h2.ty-text+ "Hello, " name "!"]
   [:ty-button {:flavor "primary"} "Wave"]])

(defn render! [^js el]
  (d/render (shim/ensure-shadow el)
    (greeting (or (shim/attr el "name") "World"))))

(shim/define! "my-greeting"
  {:observed [:name]
   :connected render!
   :attr (fn [el _] (render! el))})
```

```html
<my-greeting name="Clojure"></my-greeting>
```

**[Component Building Guide →](guides/clj/COMPONENT_GUIDE.md)** | **[Code Splitting →](guides/clj/CODE_SPLITTING.md)**

---

## Components

| Component | Description |
|-----------|-------------|
| `ty-button` | Semantic buttons with flavors, sizes, and icon slots |
| `ty-input` | Text input with labels, validation, numeric formatting, debounce |
| `ty-textarea` | Multi-line text with auto-resize and character count |
| `ty-checkbox` | Styled checkbox with indeterminate state |
| `ty-switch` | Toggle switch primitive |
| `ty-radio-group` / `ty-radio` | Exclusive single-choice selection |
| `ty-dropdown` | Searchable select with keyboard nav and mobile modal |
| `ty-multiselect` | Multi-select with tags and search |
| `ty-calendar` | Full calendar with date selection and form integration |
| `ty-date-picker` | Calendar dropdown for date input |
| `ty-tabs` / `ty-tab` | Carousel tabs with smooth animations |
| `ty-wizard` / `ty-step` | Step-by-step wizard with progress tracking |
| `ty-modal` | Native dialog with backdrop and focus management |
| `ty-popup` | Anchored popover with smart positioning |
| `ty-tooltip` | Hover tooltips with placement options |
| `ty-icon` | SVG icons from Lucide, Heroicons, Material, FontAwesome |
| `ty-tag` | Removable tags for selections |
| `ty-copy` | Click-to-copy with visual feedback |
| `ty-scroll-container` | Scrollable area with fade indicators |
| `ty-resize-observer` | Self-observing element with debounce |

**[See all components in action →](https://gersak.github.io/tyrell)**

---

## Links

- [Documentation & Examples](https://gersak.github.io/tyrell)
- [GitHub](https://github.com/gersak/tyrell)
- [NPM tyrell-components](https://www.npmjs.com/package/tyrell-components)
- [NPM tyrell-react](https://www.npmjs.com/package/tyrell-react)
- [Clojars dev.gersak/tyrell](https://clojars.org/dev.gersak/tyrell)
- [Clojars dev.gersak/tyrell-icons](https://clojars.org/dev.gersak/tyrell-icons)

---

MIT License
