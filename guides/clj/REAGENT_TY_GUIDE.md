# Reagent + Tyrell Guide

Reagent's model is hiccup vectors and reactive atoms. Components are plain `defn`, instantiated with `[my-comp props]`, and React interop happens through the `:>` reader. State lives in `r/atom`s — derefing one inside a component subscribes that component to changes.

This guide focuses on what's specific to Reagent + Tyrell. For shadow-cljs, CSS, and icon basics, see [CLOJURESCRIPT_GUIDE.md](CLOJURESCRIPT_GUIDE.md). Working example: [`examples/reagent/`](../../examples/reagent/).

## Setup

`deps.edn`:

```clojure
{:deps {reagent/reagent     {:mvn/version "1.2.0"}
        dev.gersak/tyrell   {:mvn/version "1.0.0-RC6"}}}
```

`tyrell.react` ships inside `dev.gersak/tyrell` and re-exports the npm wrappers. The npm package isn't auto-pulled — install it explicitly:

```bash
npm install react@18 react-dom@18 tyrell-react
```

Reagent 1.2 supports React 18 via `reagent.dom.client`. If you're on Reagent <1.2, upgrade — the older `reagent.dom/render` API is deprecated.

Load the CSS:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css">
```

## Mount — React 18 + Reagent

```clojure
(ns my-app.core
  (:require [tyrell.components]              ; side-effect: registers all <ty-*> elements
            [tyrell.react :as ty]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [reagent.core :as r]
            [reagent.dom.client :as rdom]))

(defn app []
  [:div.ty-canvas.min-h-screen.p-8
   [:> ty/Button {:flavor "primary"} "Hello"]])

(defonce root
  (rdom/create-root (.getElementById js/document "app")))

(defn render! []
  (rdom/render root [app]))

(defn ^:export init []
  (icons/register! {:check lucide/check})
  (render!))

(defn ^:after-load reload []
  (render!))
```

`defonce` keeps the root stable across reloads. The vector form `[app]` is what Reagent expects — not `(app)` and not React elements; Reagent converts hiccup to React internally.

## Components — plain functions, hiccup vectors

A Reagent component is a function returning hiccup. Call it with a vector:

```clojure
(defn labeled-input [{:keys [label value on-change]}]
  [:div.flex.flex-col.gap-1
   [:label.ty-text+ label]
   [:> ty/Input {:value value :onChange on-change}]])

(defn form []
  (let [email (r/atom "")]
    (fn []                                    ; Form-2: returns the render fn
      [:div
       [labeled-input
        {:label "Email"
         :value @email
         :on-change #(reset! email (.. % -detail -value))}]])))
```

Reagent has three component shapes:

- **Form-1** — `(defn x [] [:div])` — pure render. Re-runs on every prop change.
- **Form-2** — `(defn x [] (let [a (r/atom 0)] (fn [] [:div @a])))` — outer `let` runs once for setup; inner fn is the render. Use this when you need component-local state.
- **Form-3** — `r/create-class` with explicit lifecycle methods. Rarely needed; mostly use form-2 or form-1 with `r/with-let`.

For most Tyrell-driven UIs, form-2 with a local `r/atom` is the workhorse for unsaved-edit state, modal toggles, etc.

## Props — kebab-case for hiccup, camelCase for `:>` interop

Reagent normalizes `:on-change` → `onChange` for **HTML elements** in hiccup (`[:input {:on-change …}]`). But when you cross into React-component territory via `:>`, **you write camelCase yourself** — Reagent doesn't transform props that pass through `:>`:

```clojure
;; HTML element — kebab-case is fine, Reagent converts it
[:button {:on-click handler} "Click"]

;; React component via :> — write camelCase explicitly
[:> ty/Input {:onChange handler                  ; ← camelCase!
              :className "w-full"                ; ← className, not :class
              :value @v}]
```

This is the most common Reagent + Tyrell mistake. Look at any working file and you'll see `:onChange`, `:onClick`, `:className` everywhere wrappers are involved. The `examples/reagent/` source uses this convention throughout.

## State — `r/atom`s and reactivity

Deref a reagent atom inside a component, and the component re-renders when it changes:

```clojure
(defonce form-state
  (r/atom {:email "" :role "" :errors {}}))

(defn email-field []
  (let [{:keys [email errors]} @form-state]    ; deref → subscribe
    [:> ty/Input
     {:label "Email"
      :type "email"
      :value email
      :error (:email errors)
      :onChange (fn [e]
                  (let [v (.. e -detail -value)]
                    (swap! form-state assoc :email v)
                    (swap! form-state update :errors
                           (fn [errs]
                             (if (re-find #"@" v)
                               (dissoc errs :email)
                               (assoc errs :email "Looks invalid"))))))}]))
```

`r/track` and reactions (`r/reaction`) give you derived values that re-compute lazily. For most Tyrell forms, plain `swap!` + a single atom is enough.

## Event handling — `event.detail.value`

`tyrell.react` wrappers attach `addEventListener` on the underlying custom element and pass the native `CustomEvent` through to your handler. Access the payload off `.-detail`:

```clojure
[:> ty/Input
 {:label "Email"
  :value @email
  :onChange #(reset! email (.. % -detail -value))}]

[:> ty/Checkbox
 {:checked @subscribed?
  :onChange #(reset! subscribed? (.. % -detail -checked))}]

[:> ty/Multiselect
 {:value (str/join "," @skills)
  :onChange (fn [^js e]
              (reset! skills (vec (.. e -detail -values))))}
 [:> ty/Tag {:value "clojure" :flavor "primary"} "Clojure"]
 [:> ty/Tag {:value "react"   :flavor "primary"} "React"]]
```

| Component | Access |
|---|---|
| `ty/Input`, `ty/Textarea`, `ty/Switch`, `ty/DatePicker` | `(.. e -detail -value)` |
| `ty/Checkbox` | `(.. e -detail -checked)` |
| `ty/Dropdown` | `(.. e -detail -option -value)` (or `-value`) |
| `ty/Multiselect` | `(.. e -detail -values)` → JS array |
| `ty/RadioGroup` | `(.. e -detail -value)` |
| `ty/Tabs` | `(.. e -detail -tab)` |

## Composition — children with slots

Pass children after the props map in the same hiccup vector. Use `:slot` on Tyrell icon children:

```clojure
[:> ty/Input
 {:label "Search" :value @q
  :onChange #(reset! q (.. % -detail -value))}
 [:> ty/Icon {:slot "start" :name "search"}]]

[:> ty/Dropdown
 {:label "Country" :value @country
  :onChange #(reset! country (.. % -detail -option -value))}
 [:> ty/Option {:value "us"} "United States"]
 [:> ty/Option {:value "de"} "Germany"]]
```

## Refs — modal control

`use-state`-style hooks aren't idiomatic Reagent. For imperative refs on `ty-modal` / `ty-popup`, the `:ref` prop accepts a callback:

```clojure
(defn modal-demo []
  (let [modal-el (r/atom nil)]
    (fn []
      [:div
       [:> ty/Button
        {:flavor "primary"
         :onClick #(some-> @modal-el (.show))}
        "Open"]
       [:> ty/Modal
        {:ref #(reset! modal-el %)}
        [:div.ty-elevated.p-6.rounded-2xl
         [:h3.ty-text++ "Hello"]
         [:> ty/Button
          {:onClick #(some-> @modal-el (.hide))}
          "Close"]]]])))
```

Storing the DOM node in an atom isn't reactive in the usual sense (you don't deref it inside render), but it gives you a stable handle for imperative calls.

## Forms — `<form>` + Tyrell's form-association

Every form-associated Tyrell component (`ty/Input`, `ty/Textarea`, `ty/Checkbox`, `ty/Switch`, `ty/RadioGroup`, `ty/Dropdown`, `ty/Multiselect`, `ty/DatePicker`) calls `setFormValue()` internally. A wrapping `<form>` with an `onSubmit` handler picks them up:

```clojure
(defn signup-form []
  (let [profile (r/atom {:email "" :role "" :news? false :errors {}})]
    (fn []
      (let [{:keys [email role news? errors]} @profile
            update-field (fn [k v]
                           (swap! profile assoc k v)
                           (swap! profile update :errors dissoc k))
            on-submit   (fn [^js e]
                          (.preventDefault e)
                          (js/console.log "submit:" (clj->js @profile)))]
        [:form {:on-submit on-submit
                :class "ty-elevated p-6 rounded-lg flex flex-col gap-4"}
         [:> ty/Input
          {:label "Email" :name "email" :type "email" :required true
           :value email :error (:email errors)
           :onChange #(update-field :email (.. % -detail -value))}]
         [:> ty/Dropdown
          {:label "Role" :name "role" :value role
           :onChange #(update-field :role (.. % -detail -option -value))}
          [:> ty/Option {:value "developer"} "Developer"]
          [:> ty/Option {:value "designer"}  "Designer"]]
         [:label.flex.items-center.gap-2.cursor-pointer
          [:> ty/Checkbox
           {:name "news" :checked news?
            :onChange #(update-field :news? (.. % -detail -checked))}]
          "Subscribe to newsletter"]
         [:> ty/Button {:type "submit" :flavor "primary"} "Submit"]]))))
```

The `[:form …]` element here is HTML, so `:on-submit` (kebab) is correct; the Tyrell components inside use `:onChange` (camel) because they're routed through `:>`.

## Subscribing to non-Reagent atoms

Tyrell's router state lives in a non-Reagent atom (`tyrell.router/*router*`). Reagent doesn't auto-subscribe to it — but a one-line trick makes it reactive: deref it inside the component, *and* derefing a regular atom inside a Reagent component triggers re-render only if Reagent considers it reactive (it doesn't, by default). Two patterns work:

**A. Wrap the foreign atom in a Reagent ratom mirror** — keep them in sync via `add-watch`:

```clojure
(defonce router-state (r/atom @tyrell.router/*router*))

(defonce _watch
  (add-watch tyrell.router/*router* ::mirror
             (fn [_ _ _ new] (reset! router-state new))))
```

Then `[:span @router-state]` re-renders normally.

**B. Re-render the whole tree on watch** — what `examples/reagent/` does:

```clojure
(defn render! []
  (rdom/render root [main-layout]))

(defn init []
  ;; …
  (add-watch tyrell.router/*router* ::render
             (fn [_ _ _ _] (render!))))
```

This is heavier but simpler — fine for small apps. For larger apps, pattern A is cleaner.

## Icons

```clojure
(ns my-app.core
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.material.filled :as mat]))

(defn register-icons! []
  (icons/register!
    {:check  lucide/check
     :menu   mat/menu
     :user   lucide/user}))
```

Then `[:> ty/Icon {:name "check"}]`, or `[:ty-icon {:name "check"}]` for raw DOM (no React wrapping needed for a render-only icon).

## Calendar and wizard

### ty-calendar

```clojure
(defn calendar-demo []
  (let [now  (js/Date.)
        sel  (r/atom {:year  (.getFullYear now)
                      :month (inc (.getMonth now))
                      :day   nil})]
    (fn []
      (let [{:keys [year month day]} @sel]
        [:div.flex.flex-col.gap-4
         [:> ty/Calendar
          {:year    year
           :month   month
           :day     day
           :onChange (fn [^js e]
                       (reset! sel {:year  (.. e -detail -year)
                                    :month (.. e -detail -month)
                                    :day   (.. e -detail -day)}))}]
         (when day
           [:p.ty-text- (str "Selected: " year "-" (when (< month 10) "0") month "-" (when (< day 10) "0") day)])]))))
```

Event detail: `{ year, month, day, action, source }`. Form value is ISO `YYYY-MM-DD` when wrapped in `<form>` with a `name` attribute.

### ty-wizard

```clojure
(defn wizard-demo []
  (let [step      (r/atom "info")
        completed (r/atom [])]
    (fn []
      (let [advance #(do (swap! completed conj @step)
                         (reset! step %))]
        [:> ty/Wizard
         {:height    "400px"
          :active    @step
          :completed (str/join "," @completed)}
         [:> ty/Step {:id "info" :label "Info"}
          [:div.p-6.flex.flex-col.gap-4
           [:> ty/Input {:label "Name" :required true}]
           [:> ty/Button {:flavor "primary"
                          :onClick #(advance "review")} "Next"]]]
         [:> ty/Step {:id "review" :label "Review"}
          [:div.p-6.flex.gap-2
           [:> ty/Button {:onClick #(reset! step "info")} "Back"]
           [:> ty/Button {:flavor "success"
                          :onClick #(advance "done")} "Finish"]]]
         [:> ty/Step {:id "done" :label "Done"}
          [:div.p-6 "All done!"]]]))))
```

Event detail: `{ activeId, activeIndex, previousId, previousIndex, direction }` via `onChange` — or listen on the element directly for `ty-wizard-step-change`.

---

## Common pitfalls

- **`:on-change` vs `:onChange`** — easy to mix up. Through `:>`, you must write camelCase. In a plain `[:input ...]` (HTML), kebab-case works. Reagent does *not* transform props for `:>` components.
- **`:className`, not `:class`, when going through `:>`** — same reason. (Reagent's hiccup converts `:class` for HTML elements only.)
- **Don't destructure props in the outer Form-2 fn** — only the inner returned fn gets the latest props. Destructure inside the render fn:
  ```clojure
  ;; Wrong
  (defn x [{:keys [v]}]
    (let [a (r/atom 0)]
      (fn [] [:div v])))                       ; v is stale on update

  ;; Right
  (defn x []
    (let [a (r/atom 0)]
      (fn [{:keys [v]}] [:div v])))
  ```
- **Don't pass CLJS persistent vectors as props** to `Multiselect`. Convert to a comma-string or JS array on the way in:
  ```clojure
  :value (str/join "," @skills)
  ```
- **`reagent.dom/render` is deprecated** in React 18 mode — use `reagent.dom.client`.
- **`r/as-element`** is rarely needed. Only reach for it if a third-party React component asks for a React element directly (e.g. `Suspense`'s `:fallback`).
- **Children of `Dropdown` / `Multiselect`** must be `ty/Option` / `ty/Tag` (or raw `[:ty-option …]` / `[:ty-tag …]`) — not native `<option>`s; the dropdown lives in shadow DOM and can't see them.

## See also

- [QUICKSTART.md](QUICKSTART.md) — Track A entry point
- [CLOJURESCRIPT_GUIDE.md](CLOJURESCRIPT_GUIDE.md) — substrate (deps, CSS, shadow-cljs)
- [UIX_TY_GUIDE.md](UIX_TY_GUIDE.md) — same React wrapper, hooks-only model
- [`examples/reagent/`](../../examples/reagent/) — full working app: routing, forms, validation
