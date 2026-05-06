# UIx + Tyrell Guide

[UIx](https://github.com/pitch-io/uix) is a thin macro layer over React. It speaks hiccup-shaped syntax via `$`, defines components with `defui`, and uses React hooks directly — no `r/atom`, no reactions. Tyrell ships React wrappers via `tyrell.react` so you write `($ ty/Input {:value v :on-change h})` and the wrapper bridges `event.detail.value` for you.

This guide covers what's specific to UIx + Tyrell. For framework-agnostic CLJS substrate concerns (icons, CSS, shadow-cljs), see [CLOJURESCRIPT_GUIDE.md](CLOJURESCRIPT_GUIDE.md). Working example: [`examples/uix/`](../../examples/uix/).

## Setup

`deps.edn`:

```clojure
{:deps {com.pitch/uix.core   {:mvn/version "1.4.4"}
        com.pitch/uix.dom    {:mvn/version "1.4.4"}
        dev.gersak/tyrell    {:mvn/version "1.0.0-RC6"}}}
```

`tyrell.react` is part of `dev.gersak/tyrell`, but the npm wrapper package isn't auto-pulled. Install it explicitly the same way you install React itself:

```bash
npm install react react-dom tyrell-react
```

`shadow-cljs.edn`:

```clojure
{:dependencies []
 :builds {:app {:target :browser
                :modules {:main {:init-fn my-app.core/init}}}}}
```

`tyrell-components` (the web components themselves) is declared in tyrell's `deps.cljs` and shadow-cljs auto-installs it on first build — no manual `npm install tyrell-components`.

Load the CSS once, in your HTML or via your CSS pipeline:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css">
```

## Mount

UIx targets React 18. Create the root once, store it, re-render on `^:after-load`:

```clojure
(ns my-app.core
  (:require [tyrell.components]            ; side-effect: registers all <ty-*> elements
            [tyrell.react :as ty]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [uix.core :as uix :refer [defui $]]
            [uix.dom]))

(defui app []
  ($ :div.ty-canvas.min-h-screen.p-8
     ($ ty/Button {:flavor "primary"} "Hello")))

(defonce root
  (uix.dom/create-root (js/document.getElementById "app")))

(defn ^:export init []
  (icons/register! {:check lucide/check})
  (.render root ($ app)))

(defn ^:after-load reload []
  (.render root ($ app)))
```

`defonce` is what keeps the root from being recreated on hot reload. Without it, every save would orphan a React tree.

## Components — `defui` and `$`

`defui` defines a component, `$` instantiates one (or any DOM element). UIx auto-camelCases prop names you pass to React components, so kebab-case on CLJS side maps to camelCase the wrapper expects:

```clojure
(defui labeled-input [{:keys [label value on-change]}]
  ($ :div.flex.flex-col.gap-1
     ($ :label.ty-text+ label)
     ($ ty/Input {:value value
                  :on-change on-change})))     ; UIx → onChange for React

(defui form []
  (let [[email set-email] (uix/use-state "")]
    ($ labeled-input
       {:label "Email"
        :value email
        :on-change #(set-email (.. % -detail -value))})))
```

CLJS class shortcuts on DOM elements work — `($ :div.foo.bar)` is the idiomatic way to set classes; pass `:class` for dynamic ones:

```clojure
($ :div.ty-elevated.p-6.rounded-lg
   {:class (when active? "ty-bg-accent-")}
   "Content")
```

`$` accepts children as varargs after the props map. For lists, attach `:key` on the props of the iterated element (not as metadata — that's a Reagent idiom):

```clojure
($ :ul
   (for [item items]
     ($ :li {:key (:id item)} (:name item))))
```

## State — pure hooks, no atoms

UIx is hooks-first. `r/atom` is not part of the model. `use-state` returns `[value setter]`:

```clojure
(defui counter []
  (let [[n set-n] (uix/use-state 0)]
    ($ :div.flex.items-center.gap-2
       ($ ty/Button {:flavor "primary"
                     :on-click #(set-n inc)}
          "Inc")
       ($ :span.ty-text++.text-xl n))))
```

For derived state, use `use-memo`. For side effects, `use-effect` with an explicit dependency vector — UIx will warn at compile time if you reference state in the body that isn't declared:

```clojure
(uix/use-effect
  (fn []
    (js/document.title (str "Count: " n))
    ;; Cleanup is the function returned
    (fn [] (js/console.log "unmount")))
  [n])
```

## Event handling — `event.detail.value`

Ty's React wrappers attach `addEventListener` on the underlying custom element and forward the native `CustomEvent`. So `e.detail.value` is the same access path you'd use in plain JS:

```clojure
(defui email-field []
  (let [[email set-email] (uix/use-state "")
        [error set-error] (uix/use-state nil)]
    ($ ty/Input
       {:label "Email"
        :type "email"
        :value email
        :error error
        :on-change (fn [e]
                     (let [v (.. e -detail -value)]
                       (set-email v)
                       (set-error (when-not (re-find #"@" v)
                                    "Looks invalid"))))}
       ($ ty/Icon {:slot "start" :name "mail"}))))
```

**Component-specific event payloads** (matches what the wrapper exposes):

| Component | Access |
|---|---|
| `ty/Input`, `ty/Textarea`, `ty/Switch`, `ty/DatePicker` | `(.. e -detail -value)` |
| `ty/Checkbox` | `(.. e -detail -checked)` |
| `ty/Dropdown` | `(.. e -detail -option -value)` (or `-value`) |
| `ty/Multiselect` | `(.. e -detail -values)` → JS array |
| `ty/RadioGroup` | `(.. e -detail -value)` |
| `ty/Tabs` | `(.. e -detail -tab)` |
| `ty/Wizard` step nav | `(.. e -detail -step)` |

For `Multiselect`, convert the JS array to a CLJS vector if you need it:

```clojure
:on-change (fn [e]
             (let [vs (.. e -detail -values)]
               (set-skills (vec vs))))
```

## Composition — children with slots

Ty components accept slotted children — pass them as `$` children with a `:slot` attribute:

```clojure
($ ty/Input
   {:label "Search" :placeholder "Type to search…"
    :value q :on-change #(set-q (.. % -detail -value))}
   ($ ty/Icon {:slot "start" :name "search"}))
```

`Dropdown` and `Multiselect` take `Option`/`Tag` children directly:

```clojure
($ ty/Dropdown
   {:label "Country" :value country
    :on-change #(set-country (.. % -detail -option -value))}
   ($ ty/Option {:value "us"} "United States")
   ($ ty/Option {:value "de"} "Germany"))

($ ty/Multiselect
   {:label "Skills" :value (str/join "," skills)
    :on-change (fn [e]
                 (set-skills (vec (.. e -detail -values))))}
   ($ ty/Tag {:value "clojure" :flavor "primary"} "Clojure")
   ($ ty/Tag {:value "react"   :flavor "primary"} "React"))
```

## Refs and imperative APIs — modals, popups

`ty-modal` exposes `.show()` / `.hide()` methods. `use-ref` + the wrapper's ref forwarding gives you that handle:

```clojure
(defui modal-demo []
  (let [modal-ref (uix/use-ref nil)
        open  (fn [_] (some-> modal-ref .-current (.show)))
        close (fn [_] (some-> modal-ref .-current (.hide)))]
    ($ :div
       ($ ty/Button {:flavor "primary" :on-click open} "Open")
       ($ ty/Modal {:ref modal-ref}
          ($ :div.ty-elevated.p-6.rounded-2xl
             ($ :h3.ty-text++ "Hello")
             ($ ty/Button {:on-click close} "Close"))))))
```

The same pattern works for `ty-popup` (`.show()` / `.hide()` / `.toggle()`).

## Forms — controlled state

Tyrell components are form-associated, so a wrapping `<form>` element with a submit handler works without any extra wiring. UIx-side, treat the form like any controlled React form:

```clojure
(defui signup-form []
  (let [[profile set-profile] (uix/use-state {:email "" :role "" :news? false})
        update-field (uix/use-callback
                       (fn [k v] (set-profile #(assoc % k v)))
                       [])
        on-submit (fn [^js e]
                    (.preventDefault e)
                    (js/console.log "submit:" (clj->js profile)))]
    ($ :form {:on-submit on-submit
              :class "ty-elevated p-6 rounded-lg flex flex-col gap-4"}
       ($ ty/Input
          {:label "Email" :type "email" :required true
           :value (:email profile)
           :on-change #(update-field :email (.. % -detail -value))})
       ($ ty/Dropdown
          {:label "Role" :value (:role profile)
           :on-change #(update-field :role (.. % -detail -option -value))}
          ($ ty/Option {:value "developer"} "Developer")
          ($ ty/Option {:value "designer"} "Designer"))
       ($ :label.flex.items-center.gap-2.cursor-pointer
          ($ ty/Checkbox
             {:checked (:news? profile)
              :on-change #(update-field :news? (.. % -detail -checked))})
          "Subscribe to newsletter")
       ($ ty/Button {:type "submit" :flavor "primary"} "Submit"))))
```

## Subscribing to non-React state

UIx hooks-only model means non-React atoms (e.g. `tyrell.router/*router*`, app state in a `defonce` atom) need explicit subscription. The pattern: a custom hook that adds a watch in `use-effect`:

```clojure
(defn use-watch
  "Re-render when `a` (an IDeref + IWatchable) changes."
  [a]
  (let [[v set-v] (uix/use-state @a)]
    (uix/use-effect
      (fn []
        (let [k (gensym "uix-watch")]
          (add-watch a k (fn [_ _ _ new] (set-v new)))
          (fn [] (remove-watch a k))))
      [a])
    v))

(defui current-route []
  (let [router (use-watch tyrell.router/*router*)]
    ($ :div.ty-text- (str "Current: " (:current router)))))
```

This is the same approach the [`examples/uix/`](../../examples/uix/) app uses to subscribe to the Tyrell router.

## Icons — register at startup

```clojure
(ns my-app.core
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.heroicons.outline :as ho]))

(defn register-icons! []
  (icons/register!
    {:check  lucide/check
     :send   lucide/send
     :user   ho/user-circle}))

(defn ^:export init []
  (register-icons!)
  ;; ...
  )
```

Use `($ ty/Icon {:name "check"})`, or `[:ty-icon {:name "check"}]` for raw DOM. Keep references qualified (`lucide/check`) so shadow-cljs `:advanced` removes unused defs — see [CLOJURESCRIPT_GUIDE → Icon registration](CLOJURESCRIPT_GUIDE.md#icon-registration-in-cljs).

## Lazy loading — UIx native

UIx ships `uix.core/lazy` for component-level code splitting, paired with shadow-cljs `:modules`:

```clojure
(def calendar-page
  (uix/lazy #(js/Promise.resolve (resolve 'my-app.calendar/page))))

($ uix/Suspense {:fallback ($ :div "Loading…")}
   ($ calendar-page))
```

For shadow-cljs module setup, see [CODE_SPLITTING.md](CODE_SPLITTING.md).

## Common pitfalls

- **Don't pass CLJS data structures as props** to wrapper components without conversion. `:value [:a :b]` will arrive as a CLJS persistent vector, which the underlying web component doesn't understand. Convert: `:value (clj->js skills)` or join into a string format the component expects (`Multiselect` accepts comma-separated `value="a,b"`).
- **`:variant` is not a valid prop** — Tyrell uses `:flavor` (mapped to the `flavor` attribute). The older example code may show `:variant`; that's outdated.
- **Don't render `<ty-*>` directly without the wrapper** if you need React-style event handling. `($ :ty-input {:on-change h})` will not fire — React's synthetic event system doesn't bridge custom element events. Either use `ty/Input` (recommended), or attach `addEventListener` manually in `use-effect` on a ref.
- **Boolean attributes**: pass them as `true`/`false`, not as strings. `($ ty/Modal {:open true})` works; `:open "true"` does not.
- **Don't forget `defonce` on the root**. Re-creating it on every reload leaks state.
- **Children of `Dropdown` / `Multiselect`** must be `ty/Option` / `ty/Tag` — not a plain `($ :option ...)` (browsers strip those before the dropdown sees them, since it lives in shadow DOM).

## See also

- [QUICKSTART.md](QUICKSTART.md) — Track A entry point
- [CLOJURESCRIPT_GUIDE.md](CLOJURESCRIPT_GUIDE.md) — substrate (deps, CSS, shadow-cljs)
- [REPLICANT_TY_GUIDE.md](REPLICANT_TY_GUIDE.md) — non-React alternative
- [CODE_SPLITTING.md](CODE_SPLITTING.md) — shadow-cljs module setup
- [`examples/uix/`](../../examples/uix/) — full working app: routing, forms, modals, layouts
