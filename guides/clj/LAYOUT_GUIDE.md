# Ty Layout — Responsive Layout System

The `tyrell.layout` namespace provides container-aware responsive layout for ClojureScript. It uses dynamic vars to propagate container dimensions down the render tree, with Tailwind-matching breakpoints.

## Core Concept

Instead of CSS media queries (which respond to the **window**), `tyrell.layout` responds to the **container** — the actual available space for your content. This enables nested responsive layouts where a sidebar panel can respond to its own width, not the window width.

The `*container*` dynamic var holds the current dimensions. Macros like `with-window`, `with-container`, and `with-resize-observer` bind it for their body.

---

## Setup

```clojure
(ns my-app.core
  (:require [tyrell.layout :as layout]))
```

---

## `with-window`

Binds `*container*` to window dimensions. Automatically tracks resize events. Use this at the root of your app:

```clojure
(defn app []
  (layout/with-window
    (let [mobile? (layout/breakpoint<= :sm)]
      [:div.ty-canvas
       (when-not mobile? (sidebar))
       (main-content)])))
```

`with-window` registers a resize listener on `js/window` and reads from the `window-size` atom.

## `with-container`

Binds `*container*` to explicit dimensions. Use this when you know the available space (e.g., after subtracting a header or sidebar):

```clojure
(layout/with-container {:width 800 :height 600}
  (my-component))
```

Automatically calculates `:breakpoint`, `:orientation`, and `:density` from the given dimensions.

You can nest `with-container` — inner bindings merge with outer ones:

```clojure
(layout/with-window
  ;; *container* = window dimensions
  (let [sidebar-width 220
        header-height 60]
    (layout/with-container
      {:width (- (layout/container-width) sidebar-width)
       :height (- (layout/container-height) header-height)}
      ;; *container* = content area dimensions
      (content-area))))
```

## `with-resize-observer`

Binds `*container*` from a `ty-resize-observer` web component's tracked dimensions. The observer is registered on the TypeScript side — this macro reads from it:

```clojure
;; HTML: <ty-resize-observer id="sidebar"></ty-resize-observer>

(layout/with-resize-observer "sidebar"
  ;; *container* = sidebar's actual dimensions
  (sidebar-content))
```

If the element hasn't mounted yet (no size available), the body executes without binding — so it's safe to use during initial render.

---

## Querying Container State

### Dimensions

```clojure
(layout/container-width)       ; => 1024
(layout/container-height)      ; => 768
(layout/current-container)     ; => {:width 1024 :height 768 :breakpoint :lg ...}
```

### Breakpoints

Matches Tailwind defaults:

| Breakpoint | Min Width |
|------------|-----------|
| `:xs` | 0px |
| `:sm` | 640px |
| `:md` | 768px |
| `:lg` | 1024px |
| `:xl` | 1280px |
| `:2xl` | 1536px |

```clojure
(layout/container-breakpoint)          ; => :lg

(layout/breakpoint>= :md)             ; true if container is md or larger
(layout/breakpoint<= :sm)             ; true if container is sm or smaller
(layout/breakpoint= :lg)              ; true if exactly lg
(layout/breakpoint-between :sm :lg)   ; true if sm, md, or lg
```

### Orientation

```clojure
(layout/container-orientation)   ; => :landscape, :portrait, or :square
(layout/portrait?)               ; => true/false
(layout/landscape?)
(layout/square?)
```

Calculated from width/height ratio: < 0.95 = portrait, > 1.05 = landscape, between = square.

### Density

```clojure
(layout/container-density)   ; => :compact, :normal, or :comfortable
(layout/compact?)            ; true if width < 768 (mobile)
(layout/comfortable?)        ; true if width >= 1280 (large desktop)
```

---

## Responsive Values

Pick a value based on the current breakpoint. Falls back to the next smaller breakpoint if the current one isn't specified:

```clojure
(layout/responsive-value
  {:xs 1
   :sm 2
   :md 3
   :lg 4
   :xl 6})
; => 4 (when breakpoint is :lg)
; => 3 (when breakpoint is :md)
; => 2 (when breakpoint is :sm or :xs, since :xs falls to :xs=1, :sm=2)

;; Use for classes
(layout/responsive-class
  {:xs "flex-col"
   :md "flex-row"})
; => "flex-row" (when breakpoint >= :md)
```

---

## Grid Helpers

```clojure
;; Get columns for current breakpoint (with defaults)
(layout/grid-columns)
; => 1 (xs), 2 (sm), 3 (md), 4 (lg), 6 (xl), 8 (2xl)

;; Custom column map
(layout/grid-columns {:xs 1 :md 2 :xl 3})

;; Get gap for current breakpoint (with defaults)
(layout/grid-gap)
; => 8 (xs), 12 (sm), 16 (md), 20 (lg), 24 (xl)

(layout/grid-gap {:xs 4 :md 8 :lg 16})
```

---

## Percentage and Aspect Ratio

```clojure
;; Percentage of container dimensions
(layout/width% 50)     ; => 512 (if container width is 1024)
(layout/height% 25)    ; => 192 (if container height is 768)

;; Current aspect ratio
(layout/aspect-ratio)  ; => 1.333 (1024/768)

;; Fit within container while maintaining target ratio
(layout/maintain-aspect-ratio (/ 16 9))
; => {:width 1024 :height 576}
```

---

## Resize Observer Integration

Read dimensions from the TypeScript `ty-resize-observer` registry directly:

```clojure
;; Get size of a specific observed element
(layout/get-observer-size "my-container")
; => {:width 400 :height 300}

;; Get all observed sizes
(layout/get-all-observer-sizes)
; => {"container-1" {:width 400 :height 300}
;     "container-2" {:width 800 :height 600}}

;; Observe an element directly (returns cleanup fn)
(let [cleanup (layout/observe-element! my-dom-element
                (fn [{:keys [width height]}]
                  (println "Resized to" width "x" height)))]
  ;; Later:
  (cleanup))
```

---

## Window Tracking

```clojure
;; Window size is tracked automatically when with-window is used.
;; Read it directly if needed:
@layout/window-size   ; => {:width 1920 :height 1080}

;; Stop tracking (cleanup)
(layout/stop-window-tracking!)
```

---

## Complete Example

```clojure
(ns my-app.core
  (:require [tyrell.layout :as layout]
            [tyrell.router :as router]))

(defn sidebar []
  (when (layout/breakpoint>= :lg)
    [:nav.ty-elevated.p-4.rounded-lg
     {:style {:width "220px"}}
     [:h3.ty-text+.font-bold.mb-4 "Navigation"]
     ;; nav items...
     ]))

(defn card-grid [items]
  (let [cols (layout/grid-columns {:xs 1 :sm 2 :lg 3})
        gap (layout/grid-gap {:xs 8 :md 16})]
    [:div {:style {:display "grid"
                   :grid-template-columns (str "repeat(" cols ", 1fr)")
                   :gap (str gap "px")}}
     (for [item items]
       ^{:key (:id item)}
       [:div.ty-elevated.p-4.rounded-lg
        [:h3.ty-text++ (:title item)]
        [:p.ty-text- (:desc item)]])]))

(defn content []
  [:main.min-w-0
   [:h1.ty-text++.text-2xl.mb-6 "Dashboard"]
   (card-grid items)])

(defn app []
  (layout/with-window
    (let [show-sidebar? (layout/breakpoint>= :lg)
          header-height 60]
      [:div.ty-canvas.flex.flex-col {:style {:height "100vh"}}
       (header)
       [:div.flex.flex-1.overflow-hidden
        (sidebar)
        (layout/with-container
          {:width (cond-> (layout/container-width)
                    show-sidebar? (- 220 48))
           :height (- (layout/container-height) header-height)}
          (content))]])))
```
