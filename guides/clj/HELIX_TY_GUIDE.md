# Helix + Tyrell Guide

[Helix](https://github.com/lilactown/helix) is a thin macro layer over React with a JSX-feeling API: `defnc` for components, `$` for component instantiation, `(d/div …)` for DOM elements, and `helix.hooks` for the React hooks. Props stay camelCase to match the underlying React contract — Helix doesn't auto-translate prop names. This is the framework Toddler was built on, so if you came from Toddler the muscle memory carries over.

Tyrell ships React wrappers via `tyrell.react`, so `($ ty/Input {:onChange h})` works the same way it does in any React-land — and `e.detail.value` is the access path because the wrapper forwards the native `CustomEvent`.

For shadow-cljs, CSS, and icon basics, see [CLOJURESCRIPT_GUIDE.md](CLOJURESCRIPT_GUIDE.md). Working example: [`examples/helix/`](../../examples/helix/).

## Setup

`deps.edn`:

```clojure
{:deps {lilactown/helix    {:mvn/version "0.2.0"}
        dev.gersak/tyrell  {:mvn/version "1.0.0-RC6"}}}
```

`tyrell.react` is part of `dev.gersak/tyrell`; install React + the wrapper package via npm:

```bash
npm install react@18 react-dom@18 tyrell-react
```

Helix doesn't ship a React DOM render helper of its own — use `react-dom/client` directly:

```clojure
(:require ["react-dom/client" :as rdom])
```

Load the CSS:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css">
```

## Mount

```clojure
(ns my-app.core
  (:require [tyrell.components]              ; side-effect: registers all <ty-*> elements
            [tyrell.react :as ty]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [helix.core :refer [defnc $ <>]]
            [helix.dom :as d]
            [helix.hooks :as hooks]
            ["react-dom/client" :as rdom]))

(defnc app []
  (d/div {:class "ty-canvas min-h-screen p-8"}
    ($ ty/Button {:flavor "primary"} "Hello")))

(defonce root
  (rdom/createRoot (.getElementById js/document "app")))

(defn render! []
  (.render root ($ app)))

(defn ^:export init []
  (icons/register! {:check lucide/check})
  (render!))

(defn ^:after-load reload []
  (render!))
```

`defonce` on the root is mandatory for hot reload — recreating the React root on every save throws.

## Components — `defnc`, `$`, `d/`

Helix splits the syntax cleanly:

- `(defnc my-comp [props] …)` defines a function component. `props` is a CLJS map you destructure with `{:keys [...]}`.
- `($ Component {…} children)` creates an element from a component (Helix's own `defnc` components, or React components like `tyrell.react/Button`).
- `(d/div {…} children)` creates a DOM element. Each HTML tag has a corresponding `d/` function — `d/section`, `d/form`, `d/label`, etc.

```clojure
(defnc labeled-input [{:keys [label value onChange]}]
  (d/div {:class "flex flex-col gap-1"}
    (d/label {:class "ty-text+"} label)
    ($ ty/Input {:value value :onChange onChange})))

(defnc form []
  (let [[email setEmail] (hooks/use-state "")]
    ($ labeled-input
       {:label    "Email"
        :value    email
        :onChange #(setEmail (.. % -detail -value))})))
```

**Props are camelCase.** Helix does *not* convert `:on-change` → `onChange` for you. Write the React-native form:

```clojure
($ ty/Input {:onChange   handler           ; not :on-change
             :className  "w-full"          ; not :class on $-components for React
             :value      v})
```

For DOM elements via `d/`, you can use `:class` (Helix's `d/` macros do convert it to `className` under the hood) and either case form for events — Helix accepts `:on-click` on `d/button`. The asymmetry is jarring at first; the rule is: **`d/*` forgives, `$ Component` doesn't.**

## State — `helix.hooks`

`helix.hooks` mirrors React's hook API. The setter naming convention in the example uses `setX` (camelCase, JS-style) rather than `set-x`, matching the JSX feel:

```clojure
(defnc counter []
  (let [[n setN] (hooks/use-state 0)]
    (d/div {:class "flex items-center gap-2"}
      ($ ty/Button {:flavor "primary" :onClick #(setN inc)} "Inc")
      (d/span {:class "ty-text++ text-xl"} n))))
```

Side effects — `helix.hooks/use-effect` takes a deps vector first, body second (opposite of UIx, which takes the function first):

```clojure
(hooks/use-effect [n]
  (set! (.-title js/document) (str "Count: " n))
  ;; Return cleanup, if any
  (fn [] (js/console.log "unmount")))
```

Helix has a useful shortcut — `:auto-deps` — that lets the macro infer the dependency vector from referenced symbols:

```clojure
(hooks/use-callback :auto-deps
  (fn [k v]
    (setProfile #(assoc % k v))))
```

`use-ref`, `use-memo`, `use-callback`, `use-context` all live in `helix.hooks`. Because `helix.hooks` is a namespace and not magic, you'll also see `(:require [helix.hooks :as hooks])` in real code.

## Event handling — `event.detail.value`

The wrapper hands you the native `CustomEvent`:

```clojure
($ ty/Input
   {:label    "Email"
    :type     "email"
    :value    (:email profile)
    :error    (:email errors)
    :onChange #(setProfile (fn [p] (assoc p :email (.. % -detail -value))))}
   ($ ty/Icon {:slot "start" :name "mail"}))
```

| Component | Access |
|---|---|
| `ty/Input`, `ty/Textarea`, `ty/Switch`, `ty/DatePicker` | `(.. e -detail -value)` |
| `ty/Checkbox` | `(.. e -detail -checked)` |
| `ty/Dropdown` | `(.. e -detail -option -value)` (or `-value`) |
| `ty/Multiselect` | `(.. e -detail -values)` → JS array |
| `ty/RadioGroup` | `(.. e -detail -value)` |
| `ty/Tabs` | `(.. e -detail -tab)` |

For `Multiselect`, convert the JS array:

```clojure
:onChange (fn [^js e]
            (let [vs (.. e -detail -values)]
              (setSkills (vec vs))))
```

## Composition — `$ ty/X` with slotted children

Children come after the props map. `:slot` tells the host component where to render them:

```clojure
($ ty/Input
   {:label    "Search"
    :value    q
    :onChange #(setQ (.. % -detail -value))}
   ($ ty/Icon {:slot "start" :name "search"}))

($ ty/Dropdown
   {:label    "Country"
    :value    country
    :onChange #(setCountry (.. % -detail -option -value))}
   ($ ty/Option {:value "us"} "United States")
   ($ ty/Option {:value "de"} "Germany"))

($ ty/Multiselect
   {:label    "Skills"
    :value    (str/join "," skills)
    :onChange #(setSkills (vec (.. % -detail -values)))}
   ($ ty/Tag {:value "clojure" :flavor "primary"} "Clojure")
   ($ ty/Tag {:value "react"   :flavor "primary"} "React"))
```

`<>` from `helix.core` gives you a fragment when you need to return siblings without a wrapper:

```clojure
(defnc badges [{:keys [items]}]
  (<>
    (for [i items]
      ($ ty/Tag {:key (:id i) :value (:value i)} (:label i)))))
```

## Refs — modal control

`use-ref` returns an object with a `.current` property — same as React. The wrapper forwards refs to the underlying custom element, so `.show()` / `.hide()` are available:

```clojure
(defnc modal-demo []
  (let [modal-ref   (hooks/use-ref nil)
        open-modal  (hooks/use-callback :auto-deps
                      (fn [_]
                        (when-let [^js m (.-current modal-ref)]
                          (.show m))))
        close-modal (hooks/use-callback :auto-deps
                      (fn [_]
                        (when-let [^js m (.-current modal-ref)]
                          (.hide m))))]
    (d/div nil
      ($ ty/Button {:flavor "primary" :onClick open-modal} "Open")
      ($ ty/Modal {:ref modal-ref}
         (d/div {:class "ty-elevated p-6 rounded-2xl"}
           (d/h3 {:class "ty-text++"} "Hello")
           ($ ty/Button {:onClick close-modal} "Close"))))))
```

The `^js` type hint on the destructured ref helps the compiler skip externs for `.show` / `.hide`.

## Forms — controlled, with form-association

Tyrell's form-associated components participate in `<form>` submission via `setFormValue()`. Wrap them in `d/form` and listen for `:onSubmit`:

```clojure
(def empty-profile
  {:name "" :email "" :role "" :news? false})

(defn validate [p]
  (cond-> {}
    (str/blank? (:email p))
    (assoc :email "Email is required")

    (and (not (str/blank? (:email p)))
         (not (re-matches #".+@.+\..+" (:email p))))
    (assoc :email "Doesn't look like an email")))

(defnc signup-form []
  (let [[profile setProfile] (hooks/use-state empty-profile)
        [errors  setErrors]  (hooks/use-state {})
        update-field (hooks/use-callback :auto-deps
                       (fn [k v]
                         (setProfile #(assoc % k v))
                         (setErrors  #(dissoc % k))))
        on-submit (hooks/use-callback [profile]
                    (fn [^js e]
                      (.preventDefault e)
                      (let [errs (validate profile)]
                        (setErrors errs)
                        (when (empty? errs)
                          (js/console.log "submit:" (clj->js profile))))))]
    (d/form {:onSubmit on-submit
             :class "ty-elevated p-6 rounded-lg flex flex-col gap-4"}
      ($ ty/Input
         {:label    "Email"
          :name     "email"
          :type     "email"
          :required true
          :value    (:email profile)
          :error    (:email errors)
          :onChange #(update-field :email (.. % -detail -value))})

      ($ ty/Dropdown
         {:label    "Role"
          :name     "role"
          :value    (:role profile)
          :onChange #(update-field :role (.. % -detail -option -value))}
         ($ ty/Option {:value "developer"} "Developer")
         ($ ty/Option {:value "designer"}  "Designer"))

      (d/label {:class "flex items-center gap-2 cursor-pointer"}
        ($ ty/Checkbox
           {:name     "news"
            :checked  (:news? profile)
            :onChange #(update-field :news? (.. % -detail -checked))})
        "Subscribe to newsletter")

      ($ ty/Button {:type "submit" :flavor "primary"} "Submit"))))
```

This is essentially the structure of [`examples/helix/src/hello/core.cljs`](../../examples/helix/src/hello/core.cljs) — clone the example to see the same pattern at full scale, including a Multiselect for skills, a DatePicker, a Tooltip, and the imperative-ref modal.

## Subscribing to non-React state

Helix's hooks-first model means non-React atoms (e.g. `tyrell.router/*router*`) need explicit subscription. Same shape as the UIx hook:

```clojure
(defn use-watch [a]
  (let [[v setV] (hooks/use-state @a)]
    (hooks/use-effect [a]
      (let [k (gensym "helix-watch")]
        (add-watch a k (fn [_ _ _ new] (setV new)))
        (fn [] (remove-watch a k))))
    v))

(defnc current-route []
  (let [router (use-watch tyrell.router/*router*)]
    (d/div {:class "ty-text-"} (str "Current: " (:current router)))))
```

## Icons

```clojure
(ns my-app.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

(defn register! []
  (icons/register!
    {:check    lucide/check
     :send     lucide/send
     :user     lucide/user
     :rocket   lucide/rocket
     :sparkles lucide/sparkles}))
```

Helix-side: `($ ty/Icon {:name "check" :size "sm"})` or `(d/i {:class "..."})` if you want a plain `<i>` tag for an inline emoji-substitute. The Tyrell icon registry is global, so a single `(register!)` call on app init suffices.

## Calendar and wizard

### ty-calendar

```clojure
(defnc calendar-demo []
  (let [now (js/Date.)
        [[year month day] set-date]
        (hooks/use-state [(.getFullYear now)
                          (inc (.getMonth now))
                          nil])]
    (d/div {:class "flex flex-col gap-4"}
      ($ ty/Calendar
         {:year  year
          :month month
          :day   day
          :onChange (fn [^js e]
                      (set-date [(.. e -detail -year)
                                 (.. e -detail -month)
                                 (.. e -detail -day)]))})
      (when day
        (d/p {:class "ty-text-"}
          (str "Selected: " year "-" month "-" day))))))
```

Event detail: `{ year, month, day, action, source }`. Form value is ISO `YYYY-MM-DD` when wrapped in `d/form` with a `name` attribute.

### ty-wizard

```clojure
(defnc wizard-demo []
  (let [[step      setStep]      (hooks/use-state "info")
        [completed setCompleted] (hooks/use-state [])
        advance (hooks/use-callback :auto-deps
                  (fn [next-id]
                    (setCompleted #(conj % step))
                    (setStep next-id)))]
    ($ ty/Wizard
       {:height    "400px"
        :active    step
        :completed (str/join "," completed)}
       ($ ty/Step {:id "info" :label "Info"}
          (d/div {:class "p-6 flex flex-col gap-4"}
            ($ ty/Input {:label "Name" :required true})
            ($ ty/Button {:flavor "primary"
                          :onClick #(advance "review")} "Next")))
       ($ ty/Step {:id "review" :label "Review"}
          (d/div {:class "p-6 flex gap-2"}
            ($ ty/Button {:onClick #(setStep "info")} "Back")
            ($ ty/Button {:flavor "success"
                          :onClick #(advance "done")} "Finish")))
       ($ ty/Step {:id "done" :label "Done"}
          (d/div {:class "p-6"} "All done!")))))
```

Event detail: `{ activeId, activeIndex, previousId, previousIndex, direction }`.

---

## Common pitfalls

- **camelCase props on `$ Component`** — `:on-click` on a Tyrell wrapper component **does nothing**. It must be `:onClick`. Helix passes props through verbatim. The compiler won't warn.
- **`:class` on `$ Component`** — same rule: `:className` is the React prop name. `d/*` macros translate `:class`, but `$` does not.
- **`use-effect` deps are first, body is rest** — opposite of UIx. `(hooks/use-effect [n] body…)`. Easy to flip.
- **`:auto-deps` is a literal keyword** — not a value the macro infers. Pass `:auto-deps` as the *first* argument to `use-effect` / `use-callback` / `use-memo` to let Helix derive the dep vector by static analysis. Use it when the deps are obvious; provide an explicit vector when they aren't.
- **Don't pass CLJS data structures as wrapper props** unless you know the wrapper accepts them. `Multiselect`'s `:value` expects a comma string or JS array, not a CLJS vector.
- **Children of `Dropdown` / `Multiselect`** must be `ty/Option` / `ty/Tag` (or raw `<ty-option>` / `<ty-tag>`) — not native HTML `<option>`s; they live in shadow DOM and never see plain options.
- **Setter naming is just convention** — `setProfile` vs `set-profile`. The example uses camelCase to match the JS-React feel; both compile.

## See also

- [QUICKSTART.md](QUICKSTART.md) — Track A entry point
- [CLOJURESCRIPT_GUIDE.md](CLOJURESCRIPT_GUIDE.md) — substrate (deps, CSS, shadow-cljs)
- [UIX_TY_GUIDE.md](UIX_TY_GUIDE.md) — same wrappers, kebab-case props, auto camelCase translation
- [REAGENT_TY_GUIDE.md](REAGENT_TY_GUIDE.md) — same wrappers, hiccup-and-`r/atom` model
- [`examples/helix/`](../../examples/helix/) — single-file demo: form, modal, tooltip, multiselect, live-state pane
