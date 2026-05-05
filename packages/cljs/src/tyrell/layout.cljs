(ns tyrell.layout
  "Dynamic layout context system using Clojure's dynamic vars.
  Provides thread-local container dimensions and responsive utilities."
  (:require-macros [tyrell.layout :refer [with-container with-window with-resize-observer]]))

;; Core dynamic var for container dimensions
(def ^:dynamic *container*
  {:width nil
   :height nil
   :breakpoint nil ; :xs :sm :md :lg :xl :2xl
   :orientation nil ; :portrait :landscape :square
   :density nil ; :compact :normal :comfortable
   :scrollbar-width 0}) ; Width of scrollbar (if any)

;; Breakpoint definitions (matching Tailwind defaults)
(def breakpoints
  {:xs 0
   :sm 640
   :md 768
   :lg 1024
   :xl 1280
   :2xl 1536})

(def breakpoint-order [:xs :sm :md :lg :xl :2xl])

;; Window dimensions atom
(defonce window-size
  (atom {:width (.-innerWidth js/window)
         :height (.-innerHeight js/window)}))

;; Track if we're already listening to resize events
(defonce ^:private resize-listener-registered? (volatile! false))

;; Accessor functions
(defn current-container
  "Get current container context"
  []
  *container*)

(defn container-width
  "Get current container width"
  []
  (:width *container*))

(defn container-height
  "Get current container height"
  []
  (:height *container*))

(defn container-breakpoint
  "Get current breakpoint"
  []
  (:breakpoint *container*))

(defn container-orientation
  "Get current orientation"
  []
  (:orientation *container*))

(defn container-density
  "Get current density"
  []
  (:density *container*))

;; Breakpoint utilities
(defn width->breakpoint
  "Determine breakpoint from width"
  [width]
  (cond
    (< width 640) :xs
    (< width 768) :sm
    (< width 1024) :md
    (< width 1280) :lg
    (< width 1536) :xl
    :else :2xl))

(defn breakpoint>=
  "Check if current breakpoint is >= target breakpoint"
  [target]
  (let [current (container-breakpoint)
        current-idx (.indexOf breakpoint-order current)
        target-idx (.indexOf breakpoint-order target)]
    (and (>= current-idx 0)
         (>= target-idx 0)
         (>= current-idx target-idx))))

(defn breakpoint<=
  "Check if current breakpoint is <= target breakpoint"
  [target]
  (let [current (container-breakpoint)
        current-idx (.indexOf breakpoint-order current)
        target-idx (.indexOf breakpoint-order target)]
    (and (>= current-idx 0)
         (>= target-idx 0)
         (<= current-idx target-idx))))

(defn breakpoint=
  "Check if current breakpoint equals target"
  [target]
  (= (container-breakpoint) target))

(defn breakpoint-between
  "Check if current breakpoint is between min and max (inclusive)"
  [min-bp max-bp]
  (and (breakpoint>= min-bp)
       (breakpoint<= max-bp)))

;; Orientation utilities
(defn portrait? []
  (= :portrait (:orientation *container*)))

(defn landscape? []
  (= :landscape (:orientation *container*)))

(defn square? []
  (= :square (:orientation *container*)))

;; Density utilities
(defn compact? []
  (= :compact (:density *container*)))

(defn comfortable? []
  (= :comfortable (:density *container*)))

;; Calculation utilities
(defn calculate-orientation
  "Calculate orientation from width and height"
  [width height]
  (let [ratio (/ width height)]
    (cond
      (< ratio 0.95) :portrait
      (> ratio 1.05) :landscape
      :else :square)))

(defn calculate-density
  "Calculate density based on viewport size"
  [width]
  (cond
    (< width 768) :compact ; Mobile
    (< width 1280) :normal ; Tablet/small desktop
    :else :comfortable)) ; Large desktop

;; Main macro for binding container context
(defmacro with-container
  "Bind new container dimensions with calculated metadata.
  Merges with existing container context."
  [{:keys [width height scrollbar-width density]
    :as dimensions} & body]
  `(let [w# ~width
         h# ~height
         sw# (or ~scrollbar-width 0)]
     (binding [*container* (merge *container*
                                  {:width w#
                                   :height h#
                                   :scrollbar-width sw#
                                   :breakpoint (when w# (width->breakpoint w#))
                                   :orientation (when (and w# h#)
                                                  (calculate-orientation w# h#))
                                   :density (or ~density
                                                (when w# (calculate-density w#))
                                                (:density *container*))})]
       ~@body)))

;; Window tracking
(defn- update-window-size! []
  (reset! window-size {:width (.-innerWidth js/window)
                       :height (.-innerHeight js/window)}))

(defn- ensure-resize-listener! []
  (when-not @resize-listener-registered?
    (.addEventListener js/window "resize" update-window-size!)
    (vreset! resize-listener-registered? true)))

(defn stop-window-tracking! []
  "Stop tracking window dimensions"
  (when @resize-listener-registered?
    (.removeEventListener js/window "resize" update-window-size!)
    (vreset! resize-listener-registered? false)))

;; Responsive value helpers
(defn responsive-value
  "Get value based on current breakpoint.
  Values should be a map of breakpoint to value.
  Falls back to smaller breakpoints if current not found."
  [values]
  (let [current (container-breakpoint)]
    (loop [bps (reverse breakpoint-order)]
      (when (seq bps)
        (let [bp (first bps)]
          (if (and (breakpoint>= bp)
                   (contains? values bp))
            (get values bp)
            (recur (rest bps))))))))

(defn responsive-class
  "Generate responsive class based on breakpoint.
  Classes should be a map of breakpoint to class string/vector."
  [classes]
  (responsive-value classes))

;; Container percentage helpers
(defn container%
  "Calculate percentage of container dimension"
  [percentage dimension]
  (when-let [value (get *container* dimension)]
    (* value (/ percentage 100))))

(defn width%
  "Calculate percentage of container width"
  [percentage]
  (container% percentage :width))

(defn height%
  "Calculate percentage of container height"
  [percentage]
  (container% percentage :height))

;; Aspect ratio helpers
(defn aspect-ratio
  "Get current aspect ratio"
  []
  (when-let [w (container-width)]
    (when-let [h (container-height)]
      (/ w h))))

(defn maintain-aspect-ratio
  "Calculate dimensions to maintain aspect ratio within container"
  [target-ratio]
  (let [w (container-width)
        h (container-height)
        container-ratio (/ w h)]
    (if (> container-ratio target-ratio)
      ;; Container is wider, constrain by height
      {:width (* h target-ratio)
       :height h}
      ;; Container is taller, constrain by width
      {:width w
       :height (/ w target-ratio)})))

;; Grid helpers
(defn grid-columns
  "Get number of grid columns based on breakpoint"
  ([]
   (grid-columns {:xs 1
                  :sm 2
                  :md 3
                  :lg 4
                  :xl 6
                  :2xl 8}))
  ([column-map]
   (responsive-value column-map)))

(defn grid-gap
  "Get grid gap based on breakpoint"
  ([]
   (grid-gap {:xs 8
              :sm 12
              :md 16
              :lg 20
              :xl 24}))
  ([gap-map]
   (responsive-value gap-map)))

;; Element size observation
(defn observe-element!
  "Observe element size changes. Returns cleanup function."
  [element on-resize]
  (when element
    (let [observer (js/ResizeObserver.
                     (fn [entries]
                       (let [entry (first entries)
                             rect (.-contentRect entry)]
                         (on-resize {:width (.-width rect)
                                     :height (.-height rect)}))))]
      (.observe observer element)
      #(.disconnect observer))))

;; Scrollbar width detection
(defn get-scrollbar-width
  "Detect browser scrollbar width"
  []
  (let [outer (js/document.createElement "div")
        inner (js/document.createElement "div")]
    ;; Setup outer
    (set! (.-visibility (.-style outer)) "hidden")
    (set! (.-overflow (.-style outer)) "scroll")
    (.appendChild js/document.body outer)

    ;; Setup inner
    (.appendChild outer inner)

    ;; Calculate
    (let [scrollbar-width (- (.-offsetWidth outer) (.-offsetWidth inner))]
      (.removeChild js/document.body outer)
      scrollbar-width)))

;; Debug helpers
(defn debug-container
  "Print current container context"
  []
  (println "Container context:" *container*))

(defn container-info
  "Get formatted container information"
  []
  (let [{:keys [width height breakpoint orientation density]} *container*]
    (str width "x" height " " (name breakpoint) " " (name orientation))))

;; ===== RESIZE OBSERVER INTEGRATION (TypeScript API) =====

(defn get-observer-size
  "Get dimensions from TypeScript resize observer by id.
   Returns {:width number :height number} or nil if not found.
   
   Example:
     (get-observer-size \"my-container\")
     ;; => {:width 400 :height 300}"
  [id]
  (when-let [size (and js/window
                       (.-tyResizeObserver js/window)
                       (.getSize (.-tyResizeObserver js/window) id))]
    {:width (.-width size)
     :height (.-height size)}))

(defn observe-size-changes!
  "Subscribe to resize events from TypeScript resize observer.
   Callback receives {:width number :height number}.
   Returns unsubscribe function.
   
   Example:
     (def unsub (observe-size-changes! 
                  \"my-container\"
                  (fn [size]
                    (println \"Resized to\" size))))
     ;; Later: (unsub)"
  [id callback]
  (if (and js/window (.-tyResizeObserver js/window))
    (throw (js/Error. "tyResizeObserver not available! Check if tyrell.js is loaded properly"))
    (let [js-callback (fn [size]
                        (callback {:width (.-width size)
                                   :height (.-height size)}))]
      (.onResize (.-tyResizeObserver js/window) id js-callback))))

(defn get-all-observer-sizes
  "Get all registered resize observer sizes.
   Returns map of id -> {:width number :height number}.
   
   Example:
     (get-all-observer-sizes)
     ;; => {\"container-1\" {:width 400 :height 300}
     ;;     \"container-2\" {:width 800 :height 600}}"
  []
  (when-let [sizes (and js/window
                        (.-tyResizeObserver js/window)
                        (.-sizes (.-tyResizeObserver js/window)))]
    (into {} (map (fn [[k v]]
                    [k {:width (.-width v)
                        :height (.-height v)}])
                  (js/Object.entries sizes)))))
