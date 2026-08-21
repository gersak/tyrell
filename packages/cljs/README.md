# dev.gersak/tyrell

[![Clojars Project](https://img.shields.io/clojars/v/dev.gersak/tyrell.svg)](https://clojars.org/dev.gersak/tyrell)

**ClojureScript application infrastructure + framework-agnostic UI components — one Clojars dep.**

This is not a component wrapper. The components (`<ty-button>`, `<ty-select>`, `<ty-modal>`, … 22 primitives) are web components that work identically in Replicant, Reagent, UIx, Helix, or vanilla CLJS — no adapter layer, no React requirement. What this package *adds on top* is the ClojureScript substrate most apps end up hand-rolling:

| You get | Namespace |
|---|---|
| Tree-based client-side routing — nesting, landing priorities, roles/permissions, query params | `tyrell.router` |
| i18n — translations, 123 locales, `Intl`-backed number/date/currency formatting | `tyrell.i18n` |
| Container-aware responsive layout — breakpoints that respond to the *container*, not the window | `tyrell.layout` |
| 12,000+ tree-shakeable icons (Lucide, Heroicons, Material, FontAwesome) | `tyrell.lucide`, `tyrell.material.*`, … |
| Build your own web components from CLJS | `tyrell.shim` |
| The 22 UI primitives, registered by one require | `tyrell.components` |

## Install

```clojure
;; deps.edn
{:deps {dev.gersak/tyrell {:mvn/version "..."}}}  ; version badge above
```

That's the whole dependency story. The JAR ships a `deps.cljs` declaring the pinned npm `tyrell-components` — **shadow-cljs auto-installs it into your `package.json` on first build**. You never write `npm install tyrell-components`, and the CLJS and JS sides can't drift apart.

Icons come transitively via `dev.gersak/tyrell-icons`; exclude if unwanted:

```clojure
{:deps {dev.gersak/tyrell {:mvn/version "..."
                           :exclusions [dev.gersak/tyrell-icons]}}}
```

### CSS

shadow-cljs doesn't process CSS, so load the two stylesheets yourself — CDN link, a copy from `node_modules/tyrell-components/css/`, or `@import` in your PostCSS/Tailwind entry:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell-theme.css">
```

### Register components

```clojure
(ns my-app.core
  (:require [tyrell.components]))   ; side-effect: registers every <ty-*> element
```

Bundle-size sensitive? Skip the shim and require npm subpaths for just what you use:

```clojure
(:require ["tyrell-components/button"]
          ["tyrell-components/select"]
          ["tyrell-components/modal"])
```

## Components from ClojureScript

Web components are plain hiccup — attributes are strings, events carry data in `.-detail`:

```clojure
;; Replicant / any hiccup renderer
[:ty-select {:value "clj"
             :on {:change (fn [e] (js/console.log (.. e -detail -value)))}}
 [:ty-option {:value "clj"} "Clojure"]
 [:ty-option {:value "cljs"} "ClojureScript"]]

[:ty-modal {:id "confirm" :prevent-outside-click true}
 [:div.ty-elevated.rounded-lg.p-6
  [:h3 "Delete project?"]
  [:ty-button {:flavor "danger"
               :on {:click #(delete-and-close!)}} "Delete"]]]

;; Reagent
[:ty-button {:flavor "primary"
             :on-click #(save!)} "Save"]

;; UIx
($ :ty-input {:label "Email" :type "email"
              :onChange (fn [e] (reset! email (.. e -detail -value)))})
```

Full component API (all 22 primitives, every attribute/event): [guides/TY_GUIDE.md](../../guides/TY_GUIDE.md). Framework specifics: [Replicant](../../guides/clj/REPLICANT_TY_GUIDE.md) · [Reagent/re-frame](../../guides/clj/REAGENT_TY_GUIDE.md) · [UIx](../../guides/clj/UIX_TY_GUIDE.md) · [Helix](../../guides/clj/HELIX_TY_GUIDE.md) · [vanilla CLJS](../../guides/clj/CLOJURESCRIPT_GUIDE.md).

## Routing — `tyrell.router`

Routes form a tree. Link children to parents, navigate by id, never concatenate URL strings:

```clojure
(ns my-app.routes
  (:require [tyrell.router :as router]))

(router/link ::router/root
  [{:id ::home     :segment "home" :landing 10}   ; highest :landing = default route
   {:id ::about    :segment "about"}
   {:id ::settings :segment "settings" :roles #{:admin}}])

(router/link ::settings                            ; nesting = linking to a parent
  [{:id ::settings-general :segment "general"}
   {:id ::settings-account :segment "account"}])

(router/navigate! ::settings-general)              ; → /settings/general
(router/rendered? ::settings)                      ; true for /settings AND children
(router/rendered? ::settings true)                 ; exact match only
```

Views stay self-contained — each checks `rendered?` for itself, so route structure and UI composition are the same tree. Roles/permissions on a route gate access and drive automatic redirect. Details: [ROUTING_GUIDE.md](../../guides/clj/ROUTING_GUIDE.md).

## i18n — `tyrell.i18n`

Locale-aware translation and formatting on `Intl`, no bundled locale data:

```clojure
(require '[tyrell.i18n :as i18n]
         '[tyrell.i18n.keyword :as kw]
         '[tyrell.i18n.number :as num]
         '[tyrell.i18n.time :as time])

(kw/add-translations
  #:greeting {:default "Hello" :de "Hallo" :hr "Bok"})

i18n/*locale*                       ; :en_US — detected from the browser
(set! i18n/*locale* :de)
(i18n/t :greeting)                  ; "Hallo"
(i18n/with-locale :hr (i18n/t :greeting)) ; "Bok" — without touching the global

(num/format-number 1234567.89)      ; "1,234,567.89"
(num/format-number 1234567.89 :de)  ; "1.234.567,89"
(time/format-date-medium (js/Date.)) ; "Aug 20, 2026"
```

123 locales, currency formatting included — the same engine `ty-input type="currency"` uses. Details: [I18N_GUIDE.md](../../guides/clj/I18N_GUIDE.md).

## Layout — `tyrell.layout`

Media queries respond to the **window**; `tyrell.layout` responds to the **container** — the space your component actually has. A panel inside a sidebar can be `:sm` while the window is `:xl`:

```clojure
(require '[tyrell.layout :as layout])

(defn app []
  (layout/with-window                       ; bind *container* to window, track resize
    (if (layout/breakpoint<= :sm)
      [mobile-nav]
      [desktop-nav])))

(layout/with-container {:width 800 :height 600}  ; or bind explicitly
  ...)
```

Tailwind-matching breakpoints, `:orientation` and `:density` derived automatically, `with-resize-observer` for element-tracked containers. Details: [LAYOUT_GUIDE.md](../../guides/clj/LAYOUT_GUIDE.md).

## Icons — tree-shaken, not downloaded

`<ty-icon name="check">` looks icons up in a runtime registry. Register only what you use — with `:advanced` compilation, the other 12,000 defs are eliminated by Closure:

```clojure
(ns my-app.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

(icons/register! {:check lucide/check
                  :x     lucide/x
                  :plus  lucide/plus})
```

```clojure
[:ty-icon {:name "check" :size "md"}]
```

Sets: `tyrell.lucide` (1,636), `tyrell.heroicons.*`, `tyrell.material.*`, `tyrell.fontawesome.*`.

## Build your own components — `tyrell.shim`

The same base the ty-* components could lean on, exposed for your app: define a web component in CLJS, get attribute observation, property capture and form association without touching `HTMLElement` boilerplate. Details: [COMPONENT_GUIDE.md](../../guides/clj/COMPONENT_GUIDE.md).

## Code splitting

Calendar, dropdown and multiselect ship as shadow-cljs modules — load them lazily so your entry bundle stays lean. Recipes: [CODE_SPLITTING.md](../../guides/clj/CODE_SPLITTING.md).

## Development

```bash
npm run dev        # watch lib build (shadow-cljs, nREPL :7888)
npm run dev:site   # documentation site with hot reload
npm run build      # release lib build
```

Docs site source lives in `site/` — it is itself a Replicant app built on everything above (router, i18n, layout, icons), so it doubles as a reference implementation.

## License

MIT
