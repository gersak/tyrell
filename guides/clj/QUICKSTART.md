# Tyrell + ClojureScript Quickstart

Get Tyrell running in your CLJS app in under five minutes. Pick the track that matches your view layer.

| You're using                              | Track | Component access |
|-------------------------------------------|-------|------------------|
| Reagent, re-frame, UIx, Helix             | **A** | `tyrell.react` — React wrappers that bridge `event.detail.value` |
| Replicant, vanilla CLJS, server-rendered  | **B** | Raw `<ty-*>` web components — no wrapper needed |

The infrastructure — routing, i18n, layout, icons — comes from `dev.gersak/tyrell` (Clojars) and works **on both tracks**.

---

## Common setup (both tracks)

[![Clojars Project](https://img.shields.io/clojars/v/dev.gersak/tyrell.svg)](https://clojars.org/dev.gersak/tyrell)

### 1. Add one Clojars dep

`deps.edn`:

```clojure
{:deps {dev.gersak/tyrell {:mvn/version "..."}}}   ; latest from Clojars badge above
```

That single dep brings the CLJS side:
- `tyrell.router`, `tyrell.i18n`, `tyrell.layout`, `tyrell.icons`, `tyrell.components`, `tyrell.react` — infrastructure + shims
- `tyrell.lucide`, `tyrell.heroicons.*`, `tyrell.material.*`, `tyrell.fontawesome.*` — 12,000+ tree-shakeable icon defs (transitive via `dev.gersak/tyrell-icons`)
- npm `tyrell-components` — declared in `deps.cljs`, shadow-cljs auto-installs it into your `package.json` on first build. No manual `npm install` for components.

Don't want the icons artifact? Exclude it:
```clojure
{:deps {dev.gersak/tyrell {:mvn/version "..."
                           :exclusions [dev.gersak/tyrell-icons]}}}
```

**Track A only** — React-based CLJS (Reagent, re-frame, UIx, Helix) needs `tyrell-react` installed explicitly, same way you install React itself:

```bash
npm install tyrell-react
```

### 2. Load the CSS

`tyrell.css` lives outside the JS module graph and must be loaded separately. Pick one:

```html
<!-- A. CDN <link> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
<!-- tyrell-theme.css: auto-contrast, seed-based rebranding, themes. See TY_GUIDE.md#quick-start -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell-theme.css">
```

```bash
# B. Fetch into your public/ once (offline-friendly)
curl -o public/css/tyrell.css \
  https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css
curl -o public/css/tyrell-theme.css \
  https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell-theme.css

# Or copy from the version shadow-cljs already installed
cp node_modules/tyrell-components/css/tyrell.css public/css/tyrell.css
cp node_modules/tyrell-components/css/tyrell-theme.css public/css/tyrell-theme.css
```

```css
/* C. Tailwind / PostCSS — add to your input.css */
@import "../node_modules/tyrell-components/css/tyrell.css";
@import "../node_modules/tyrell-components/css/tyrell-theme.css";
@import "tailwindcss";
```

Wire (B) as a `postinstall` script in `package.json` to keep it in sync with installed versions automatically.

### 3. Register web components

```clojure
(ns my-app.core
  (:require [tyrell.components]))   ; side-effect: registers all <ty-*> elements
```

That single require is enough. Components are marked side-effectful in npm's `package.json`; icons are not — they only enter your bundle when you reference them.

> **How does the npm package get there?** `dev.gersak/tyrell` ships with a `deps.cljs` declaring `{:npm-deps {"tyrell-components" "<pinned>"}}`. shadow-cljs reads it on first build and runs `npm install --save --save-exact`, so the entry lands in your `package.json` automatically. You'll see it there after the first build — that's expected, it's the standard shadow-cljs contract for library-declared npm deps.

---

## Track A — React-based CLJS

### Reagent / re-frame

```clojure
(ns my-app.core
  (:require [tyrell.components]
            [tyrell.react :refer [Button Input]]
            [reagent.core :as r]))

(defn login-form []
  (let [email (r/atom "")]
    (fn []
      [:form.flex.flex-col.gap-3
       [:> Input {:label "Email"
                  :type "email"
                  :value @email
                  :on-change #(reset! email (.. % -detail -value))}]
       [:> Button {:flavor "primary" :type "submit"} "Sign in"]])))
```

re-frame is identical — swap `r/atom` and `reset!` for `subscribe`/`dispatch`:

```clojure
[:> Input {:value @(rf/subscribe [:email])
           :on-change #(rf/dispatch [:set-email (.. % -detail -value)])}]
```

### UIx

```clojure
(ns my-app.core
  (:require [tyrell.components]
            [tyrell.react :refer [Button Input]]
            [uix.core :refer [defui $ use-state]]))

(defui login-form []
  (let [[email set-email] (use-state "")]
    ($ :form {:class "flex flex-col gap-3"}
      ($ Input {:label "Email"
                :type "email"
                :value email
                :on-change #(set-email (.. % -detail -value))})
      ($ Button {:flavor "primary" :type "submit"} "Sign in"))))
```

### Helix

```clojure
(ns my-app.core
  (:require [tyrell.components]
            [tyrell.react :refer [Button Input]]
            [helix.core :refer [defnc $]]
            [helix.dom :as d]
            [helix.hooks :refer [use-state]]))

(defnc login-form []
  (let [[email set-email] (use-state "")]
    (d/form {:class "flex flex-col gap-3"}
      ($ Input {:label "Email"
                :type "email"
                :value email
                :on-change #(set-email (.. % -detail -value))})
      ($ Button {:flavor "primary" :type "submit"} "Sign in"))))
```

### Why `tyrell.react` here

Web components dispatch custom events with `event.detail`. React's synthetic event system doesn't bridge those — `[:> :ty-input {:on-change ...}]` would only catch native bubbling events, not `<ty-input>`'s `change` with `event.detail.value`. The wrappers add the listener on the underlying element so `:on-change` works the way you'd expect.

`tyrell.react` is a thin CLJS namespace inside `dev.gersak/tyrell` that re-exports the wrappers from the npm `tyrell-react` package — so you `:require [tyrell.react :as ty]` instead of `["tyrell-react" :as ty]`. The npm package is **not** auto-installed (Track B users wouldn't need it), so make sure you ran `npm install tyrell-react` from step 1 — it's a peer of `react` and `react-dom`.

Each wrapper exports under two names: `TyButton` (explicit) and `Button` (short). Use whichever fits your style — the short names tend to read better in CLJS.

---

## Track B — Non-React (Replicant, vanilla CLJS)

No wrapper package. Web components emit normal DOM events; non-React renderers handle them directly.

### Replicant

```clojure
(ns my-app.core
  (:require [tyrell.components]
            [replicant.dom :as r.dom]))

(defonce !state (atom {:email ""}))

(defn login-form [{:keys [email]}]
  [:form.flex.flex-col.gap-3
   [:ty-input {:label "Email"
               :type "email"
               :value email
               :on {:change (fn [^js e]
                              (swap! !state assoc :email (.. e -detail -value)))}}]
   [:ty-button {:flavor "primary" :type "submit"} "Sign in"]])

(defn render! []
  (r.dom/render (.getElementById js/document "app") (login-form @!state)))

(add-watch !state ::render (fn [_ _ _ _] (render!)))
```

For action-dispatch idioms (`:on {:change [:set-email]}` + `replicant.dom/set-dispatch!`), see [REPLICANT_TY_GUIDE.md](REPLICANT_TY_GUIDE.md).

### Vanilla CLJS

```clojure
(ns my-app.core
  (:require [tyrell.components]))

(defn render! []
  (let [root  (js/document.getElementById "app")
        input (doto (js/document.createElement "ty-input")
                (.setAttribute "label" "Email")
                (.setAttribute "type" "email"))
        btn   (doto (js/document.createElement "ty-button")
                (.setAttribute "flavor" "primary")
                (set! -textContent "Sign in"))]
    (.addEventListener input "change"
      #(js/console.log "email:" (.. % -detail -value)))
    (.appendChild root input)
    (.appendChild root btn)))

(defn ^:export init [] (render!))
```

---

## Icons (both tracks)

Two CLJS-friendly icon paths — both tree-shake. Pick one:

### Option 1 — Clojars (recommended for CLJS)

`dev.gersak/tyrell-icons` is pure CLJS. Closure `:advanced` removes unused icons natively.

```clojure
(ns my-app.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.heroicons.outline :as ho]))

(defn register! []
  (icons/register!
    {:check  lucide/check
     :search lucide/search
     :user   ho/user-circle}))
```

Call `(register!)` once at app startup, then use `[:ty-icon {:name "check"}]` (or `[:> Icon {:name "check"}]` on Track A) anywhere.

### Option 2 — npm leaf modules

```clojure
(ns my-app.icons
  (:require ["tyrell-components/icons/lucide" :refer [check search]]))

(defn register! []
  (.register js/window.tyIcons #js {:check check :search search}))
```

Tree-shakes via shadow-cljs because `./lib/icons/**` has no side-effects in `package.json` and you're using named imports.

**Don't** dynamically construct icon names (e.g. `(symbol "lucide" name)`) — that defeats DCE. Register every icon you might use upfront.

---

## What `dev.gersak/tyrell` brings (both tracks)

CLJS-first infrastructure that complements components, framework-agnostic:

| Namespace          | Purpose                                                                |
|--------------------|------------------------------------------------------------------------|
| `tyrell.router`    | Zipper-based client-side routing                                       |
| `tyrell.i18n`      | Translations + Intl number/date formatting (`.keyword`, `.number`, …)  |
| `tyrell.layout`    | Container-aware responsive breakpoints (`with-window`, `with-container`) |
| `tyrell.icons`     | Icon registry — `register!` and use `<ty-icon>`                        |
| `tyrell.shim`      | Build your own web components in CLJS                                  |
| `tyrell.positioning` | Smart popup/tooltip positioning helpers                              |
| `tyrell.value`     | Form-value coercion utilities                                          |

These work the same whether you're on Track A or Track B — they're independent of the view layer. See the deep-dive guides:

- [ROUTING_GUIDE.md](ROUTING_GUIDE.md)
- [I18N_GUIDE.md](I18N_GUIDE.md)
- [LAYOUT_GUIDE.md](LAYOUT_GUIDE.md)
- [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) — `tyrell.shim`

---

## Next steps

- [CLOJURESCRIPT_GUIDE.md](CLOJURESCRIPT_GUIDE.md) — substrate reference (shadow-cljs config, SSR, property-vs-attribute rules, code splitting hooks)
- [REPLICANT_TY_GUIDE.md](REPLICANT_TY_GUIDE.md) — Replicant-specific patterns
- [CODE_SPLITTING.md](CODE_SPLITTING.md) — lazy-loading components by route
- [../TY_GUIDE.md](../TY_GUIDE.md) — universal component API reference
- [../CSS_GUIDE.md](../CSS_GUIDE.md) — design system (colors, surfaces, text)

If something doesn't render or events don't fire: 9 times out of 10 it's a property-vs-attribute issue (boolean/array values must be set as JS properties, not HTML attributes). See `CLOJURESCRIPT_GUIDE.md` § "Using Web Components from CLJS".
