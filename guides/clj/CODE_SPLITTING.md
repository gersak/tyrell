# Code Splitting & Lazy Loading

> **Note:** This guide describes patterns and strategies, not exact code to copy. File names, module names, and folder structures are illustrative examples — adapt them to your project's conventions.

## Overview

Ty uses shadow-cljs module system to split components into separate chunks:

```
ty-lazy.js        (core + lightweight components)
ty-dropdown.js    (loaded when <ty-dropdown> is used)
ty-calendar.js    (loaded when <ty-calendar> is used)
ty-multiselect.js (loaded when <ty-multiselect> is used)
```

---

## shadow-cljs Configuration

```clojure
;; shadow-cljs.edn
{:builds
 {:lib
  {:target :browser
   :output-dir "dist/"
   :module-loader true  ;; Enable dynamic loading

   :modules
   {;; Core module - always loaded
    :ty-core
    {:entries [tyrell.core]
     :init-fn tyrell.core/init}

    ;; Lazy modules - loaded on demand
    :ty-dropdown
    {:entries [tyrell.components.dropdown]
     :depends-on #{:ty-core}}

    :ty-calendar
    {:entries [tyrell.components.calendar
               tyrell.components.calendar-navigation
               tyrell.components.calendar-month]
     :depends-on #{:ty-core}}

    :ty-date-picker
    {:entries [tyrell.components.date-picker]
     :depends-on #{:ty-calendar}}

    :ty-multiselect
    {:entries [tyrell.components.multiselect]
     :depends-on #{:ty-dropdown}}}}}}
```

---

## Creating a Lazy Component Wrapper

### 1. The Real Component

```clojure
;; src/app/components/heavy_chart.cljs
(ns app.components.heavy-chart
  (:require [tyrell.shim :as shim]
            ["chart.js" :as Chart]))  ;; Heavy dependency

(defn render! [^js el]
  ;; Complex chart rendering...
  )

(def configuration
  {:observed [:data :type]
   :connected render!
   :attr (fn [el _] (render! el))})
```

### 2. The Lazy Wrapper

```clojure
;; src/app/components/lazy/heavy_chart.cljs
(ns app.components.lazy.heavy-chart
  (:require [shadow.lazy :as lazy]
            [tyrell.shim :as shim]))

;; Mark the config as loadable
(def config (lazy/loadable app.components.heavy-chart/configuration))

;; Define component with lazy lifecycle
(defn lazy-connected [^js el]
  (-> (lazy/load config)
      (.then (fn [cfg]
               ((:connected cfg) el)))))

(defn lazy-attr [^js el delta]
  (-> (lazy/load config)
      (.then (fn [cfg]
               ((:attr cfg) el delta)))))

(shim/define! "app-heavy-chart"
  {:observed [:data :type]
   :connected lazy-connected
   :attr lazy-attr})
```

### 3. Configure Module

```clojure
;; shadow-cljs.edn
:modules
{:app-core
 {:entries [app.core
            app.components.lazy.heavy-chart]  ;; Wrapper in core
  :init-fn app.core/init}

 :app-heavy-chart
 {:entries [app.components.heavy-chart]  ;; Real component separate
  :depends-on #{:app-core}}}
```

---

## Utility Helper

Simplify with a reusable helper:

```clojure
;; src/app/lazy_util.cljs
(ns app.lazy-util
  (:require [shadow.lazy :as lazy]))

(defn create-lazy-lifecycle
  "Create lazy-loading lifecycle hooks from a loadable config"
  [loadable-config]
  {:connected
   (fn [^js el]
     (-> (lazy/load loadable-config)
         (.then #((:connected %) el))))

   :disconnected
   (fn [^js el]
     (-> (lazy/load loadable-config)
         (.then #(when-let [f (:disconnected %)] (f el)))))

   :attr
   (fn [^js el delta]
     (-> (lazy/load loadable-config)
         (.then #((:attr %) el delta))))

   :prop
   (fn [^js el delta]
     (-> (lazy/load loadable-config)
         (.then #((:prop %) el delta))))})
```

Then your lazy wrapper becomes:

```clojure
(ns app.components.lazy.heavy-chart
  (:require [shadow.lazy :as lazy]
            [app.lazy-util :as lazy-util]
            [tyrell.shim :as shim]))

(def config (lazy/loadable app.components.heavy-chart/configuration))

(shim/define! "app-heavy-chart"
  (merge
    {:observed [:data :type]}
    (lazy-util/create-lazy-lifecycle config)))
```

---

## Loading States

Show a placeholder while the component loads:

```clojure
(defn lazy-connected [^js el]
  (let [root (shim/ensure-shadow el)]
    ;; Show loading state immediately
    (set! (.-innerHTML root)
      "<div class='ty-text- animate-pulse'>Loading...</div>")

    ;; Load and render real component
    (-> (lazy/load config)
        (.then (fn [cfg]
                 ((:connected cfg) el))))))
```

---

## Preloading

Preload modules you expect to need soon:

```clojure
(ns app.core
  (:require [shadow.lazy :as lazy]))

;; Preload on hover
(defn preload-on-hover! [trigger-el loadable]
  (.addEventListener trigger-el "mouseenter"
    (fn [] (lazy/load loadable)) #js {:once true}))

;; Preload after idle
(defn preload-when-idle! [loadable]
  (if js/requestIdleCallback
    (js/requestIdleCallback #(lazy/load loadable))
    (js/setTimeout #(lazy/load loadable) 200)))
```

---

## Bundle Analysis

Check your bundle sizes:

```bash
# Build with report
npx shadow-cljs release lib --config-merge '{:build-report true}'

# View report
open target/shadow-cljs/build-report.html
```

---

## Best Practices

1. **Core module should be small** - Only essential components and initialization
2. **Group related components** - Calendar + navigation + month in one module
3. **Consider dependencies** - If A always needs B, put them together
4. **Lazy load heavy dependencies** - Chart libs, date libs, etc.
5. **Preload predictable paths** - User will likely click "Settings"? Preload it

---

## Example: Full App Structure

```
src/
├── app/
│   ├── core.cljs              ;; Init, router, lightweight components
│   ├── components/
│   │   ├── button.cljs        ;; In core (used everywhere)
│   │   ├── input.cljs         ;; In core
│   │   ├── heavy_table.cljs   ;; Separate module
│   │   ├── chart.cljs         ;; Separate module
│   │   └── lazy/
│   │       ├── heavy_table.cljs
│   │       └── chart.cljs
│   └── lazy_util.cljs
```

```clojure
;; shadow-cljs.edn
:modules
{:app-core
 {:entries [app.core
            app.components.button
            app.components.input
            app.components.lazy.heavy-table
            app.components.lazy.chart]
  :init-fn app.core/init}

 :app-table
 {:entries [app.components.heavy-table]
  :depends-on #{:app-core}}

 :app-chart
 {:entries [app.components.chart]
  :depends-on #{:app-core}}}
```

---

## See Also

- [shadow-cljs Code Splitting](https://shadow-cljs.github.io/docs/UsersGuide.html#CodeSplitting)
- [Component Building Guide](COMPONENT_GUIDE.md) - tyrell.shim API for defining web components
