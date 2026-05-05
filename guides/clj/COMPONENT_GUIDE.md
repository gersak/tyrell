# Building Web Components with tyrell.shim

Turn any ClojureScript render function into a standards-compliant Web Component.

## Basic Pattern

```clojure
(ns app.components
  (:require [tyrell.shim :as shim]))

(defn render! [^js el]
  (let [root (shim/ensure-shadow el)]
    (set! (.-innerHTML root) "<p>Hello!</p>")))

(shim/define! "my-component"
  {:observed [:name :count]           ;; Attributes to watch
   :connected render!                  ;; Called when added to DOM
   :disconnected cleanup!              ;; Called when removed
   :attr (fn [el delta] (render! el))  ;; Batched attribute changes
   :prop (fn [el delta] (render! el))  ;; Batched property changes
   :form-associated true})             ;; Enable form participation
```

---

## Configuration Options

| Key | Type | Description |
|-----|------|-------------|
| `:observed` | `[keyword]` | Attribute names to watch for changes |
| `:props` | `{keyword any}` | Property accessors (keys define available props) |
| `:connected` | `(fn [el])` | Lifecycle: element added to DOM |
| `:disconnected` | `(fn [el])` | Lifecycle: element removed from DOM |
| `:adopted` | `(fn [el old-doc new-doc])` | Lifecycle: element moved to new document |
| `:attr` | `(fn [el delta])` | Batched attribute changes (delta is a map) |
| `:prop` | `(fn [el delta])` | Batched property changes (delta is a map) |
| `:form-associated` | `boolean` | Enable form participation |

---

## Attribute Helpers

```clojure
;; Read attributes
(shim/attr el "name")                    ;; Raw string
(shim/parse-int-attr el "count")         ;; Parse as integer
(shim/parse-float-attr el "ratio")       ;; Parse as float
(shim/parse-bool-attr el "disabled")     ;; Presence = true, "false" = false
(shim/parse-json-attr el "config")       ;; Parse JSON to map
(shim/parse-edn-attr el "data")          ;; Parse EDN

;; Write attributes
(shim/set-attr! el "name" "value")
(shim/rm-attr! el "disabled")
```

---

## With Replicant

```clojure
(ns app.components
  (:require [replicant.dom :as d]
            [tyrell.shim :as shim]))

(defn counter-view [count on-click]
  [:div.ty-elevated.p-6.rounded-lg.space-y-4
   [:div.ty-text++.text-4xl.text-center count]
   [:div.flex.gap-2.justify-center
    [:ty-button {:flavor "secondary" :on {:click #(on-click dec)}} "-"]
    [:ty-button {:flavor "primary" :on {:click #(on-click inc)}} "+"]]])

(defn render! [^js el]
  (let [root (shim/ensure-shadow el)
        get-count #(or (.-_count el) 0)
        set-count! (fn [f]
                     (set! (.-_count el) (f (get-count)))
                     (render! el))]
    (d/render root (counter-view (get-count) set-count!))))

(shim/define! "replicant-counter"
  {:observed [:initial]
   :connected (fn [el]
                (set! (.-_count el) (or (shim/parse-int-attr el "initial") 0))
                (render! el))
   :attr (fn [el {:strs [initial]}]
           (when initial
             (set! (.-_count el) (js/parseInt initial))
             (render! el)))})
```

```html
<replicant-counter initial="10"></replicant-counter>
```

---

## With UIx

```clojure
(ns app.components
  (:require [uix.core :as uix :refer [defui $]]
            [uix.dom]
            [tyrell.shim :as shim]))

(defui counter [{:keys [initial]}]
  (let [[count set-count] (uix/use-state (or initial 0))]
    ($ :div.ty-elevated.p-6.rounded-lg.space-y-4
      ($ :div.ty-text++.text-4xl.text-center count)
      ($ :div.flex.gap-2.justify-center
        ($ :ty-button {:flavor "secondary" :on-click #(set-count dec)} "-")
        ($ :ty-button {:flavor "primary" :on-click #(set-count inc)} "+")))))

(defn render! [^js el]
  (let [root (shim/ensure-shadow el)
        initial (shim/parse-int-attr el "initial")]
    ;; UIx needs a root - create once, reuse
    (when-not (.-_uixRoot el)
      (set! (.-_uixRoot el) (uix.dom/create-root root)))
    (uix.dom/render-root (.-_uixRoot el)
      ($ counter {:initial initial}))))

(shim/define! "uix-counter"
  {:observed [:initial]
   :connected render!
   :disconnected (fn [el]
                   (when-let [root (.-_uixRoot el)]
                     (uix.dom/unmount-root root)))})
```

---

## With Reagent

```clojure
(ns app.components
  (:require [reagent.core :as r]
            [reagent.dom :as rdom]
            [tyrell.shim :as shim]))

(defn counter [initial-count]
  (let [count (r/atom (or initial-count 0))]
    (fn []
      [:div.ty-elevated.p-6.rounded-lg.space-y-4
       [:div.ty-text++.text-4xl.text-center @count]
       [:div.flex.gap-2.justify-center
        [:ty-button {:flavor "secondary" :on-click #(swap! count dec)} "-"]
        [:ty-button {:flavor "primary" :on-click #(swap! count inc)} "+"]]])))

(defn render! [^js el]
  (let [root (shim/ensure-shadow el)
        initial (shim/parse-int-attr el "initial")]
    (rdom/render [counter initial] root)))

(shim/define! "reagent-counter"
  {:observed [:initial]
   :connected render!
   :disconnected (fn [el]
                   (rdom/unmount-component-at-node (.-shadowRoot el)))})
```

---

## Shadow DOM & Styling

### Inline Styles

```clojure
(ns app.components
  (:require [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def my-styles
  ".container { padding: 1rem; }
   .title { font-size: 1.5rem; }")

(defn render! [^js el]
  (let [root (shim/ensure-shadow el)]
    ;; Inject styles into shadow DOM (deduped by ID)
    (ensure-styles! root my-styles "my-component")

    ;; Ty design system classes work inside shadow DOM
    (set! (.-innerHTML root)
      "<div class='ty-elevated p-4 rounded-lg'>
         <h2 class='ty-text+ mb-2'>Title</h2>
         <p class='ty-text-'>Content here</p>
       </div>")))
```

### defstyles Macro (Compile-time CSS)

Load CSS files at compile time for better organization:

```clojure
(ns app.components.card
  (:require [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]])
  (:require-macros [tyrell.css :refer [defstyles]]))

;; Loads app/components/card.css at compile time
;; Creates a CSSStyleSheet for efficient shadow DOM adoption
(defstyles card-styles)

;; Or specify a custom path
(defstyles card-styles "custom/path/card.css")

(defn render! [^js el]
  (let [root (shim/ensure-shadow el)]
    (ensure-styles! root card-styles "app-card")
    ;; render...
    ))
```

Create the CSS file alongside your ClojureScript:

```css
/* app/components/card.css */
:host {
  display: block;
}

.card {
  padding: var(--ty-spacing-4);
  border-radius: var(--ty-radius-lg);
  background: var(--ty-surface-elevated);
}

.card-title {
  font-size: var(--ty-text-lg);
  color: var(--ty-text-strong);
}
```

Benefits:
- CSS is bundled at compile time (no runtime fetch)
- Uses `CSSStyleSheet` for efficient style sharing
- CSS variables from Ty design system are available
- Better editor support with separate `.css` files

---

## Form Participation

```clojure
(shim/define! "my-input"
  {:observed [:value :name]
   :form-associated true
   :connected (fn [el]
                ;; Access ElementInternals
                (let [internals (.-_internals el)]
                  ;; Set form value
                  (.setFormValue internals "initial-value")
                  ;; Access associated form
                  (.-form internals)))})
```

---

## Properties vs Attributes

**Attributes** are strings in HTML. **Properties** are JS values on the element.

```clojure
;; Define properties
(shim/define! "my-component"
  {:props {:config nil      ;; Will create .config property
           :on-change nil}  ;; Will create .onChange property
   :prop (fn [el delta]
           ;; delta = {"config" new-value, "onChange" new-fn}
           (render! el))})

;; Set properties programmatically
(shim/set-props! el {:config {:foo "bar"}
                     :on-change #(js/console.log %)})

;; Read properties
(shim/get-props el)  ;; => {:config {:foo "bar"} ...}
```

---

## Hot Reload

The shim supports shadow-cljs hot reload automatically:

```clojure
(ns app.components
  (:require [tyrell.shim :as shim]))

;; Re-defining a component in dev mode refreshes all instances
(shim/define! "my-component" {...})

;; Optional: Add hooks for cleanup/setup
(defn ^:dev/before-load stop []
  (js/console.log "Preparing for reload..."))

(defn ^:dev/after-load start []
  (js/console.log "Reloaded!"))
```

---

## Initial Attributes (React-compatible)

For one-time initialization attributes that shouldn't override user state:

```clojure
(defn render! [^js el]
  ;; Only read these on first render
  (let [initial (shim/get-initial-attrs el
                  {:view-year js/parseInt
                   :view-month js/parseInt
                   :min-date parse-date})]
    (when (seq initial)
      (apply-initial-state! el initial))

    (render-view! el)))
```

---

## Complete Example: Date Input

```clojure
(ns app.date-input
  (:require [replicant.dom :as d]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ".wrapper { position: relative; }
   .popup { position: absolute; top: 100%; left: 0; }")

(defn date-input-view [{:keys [value label on-change on-toggle open?]}]
  [:div.wrapper
   [:ty-input
    {:label label
     :value value
     :readonly true
     :on {:click on-toggle}}]
   (when open?
     [:div.popup.ty-floating.p-2.rounded-lg.shadow-lg
      [:ty-calendar
       {:value value
        :on {:change #(on-change (.. % -detail -value))}}]])])

(defn render! [^js el]
  (let [root (shim/ensure-shadow el)]
    (ensure-styles! root styles "date-input")
    (d/render root
      (date-input-view
        {:value (.-_value el)
         :label (or (shim/attr el "label") "Date")
         :open? (.-_open el)
         :on-toggle #(do (set! (.-_open el) (not (.-_open el)))
                         (render! el))
         :on-change #(do (set! (.-_value el) %)
                         (set! (.-_open el) false)
                         (.dispatchEvent el (js/CustomEvent. "change"
                                              #js {:detail #js {:value %}}))
                         (render! el))}))))

(shim/define! "app-date-input"
  {:observed [:value :label]
   :props {:value nil}
   :connected (fn [el]
                (set! (.-_value el) (shim/attr el "value"))
                (set! (.-_open el) false)
                (render! el))
   :attr (fn [el delta]
           (when-let [v (get delta "value")]
             (set! (.-_value el) v))
           (render! el))
   :prop (fn [el delta]
           (when-let [v (get delta "value")]
             (set! (.-_value el) v))
           (render! el))})
```

```html
<app-date-input label="Start Date" value="2025-01-15"></app-date-input>
```

---

## See Also

- [Code Splitting Guide](CODE_SPLITTING.md) - Lazy loading and bundle optimization (in guides/)
- [Ty Components Source](components/ty/components/) - Reference implementations
- [tyrell.shim Source](src/ty/shim.cljs) - Full API
- [tyrell.css](src/ty/css.cljs) - Style injection utilities
