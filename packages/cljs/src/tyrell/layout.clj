(ns tyrell.layout)

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

(defmacro with-window
  "Bind window dimensions as container context.
  Automatically tracks resize events and updates the window-size atom.
  Usage:
    (with-window
      (my-component))"
  [& body]
  `(do
     ;; Ensure we're tracking window resize
     (tyrell.layout/ensure-resize-listener!)
     ;; Use current window dimensions
     (let [{width# :width
            height# :height} @window-size]
       (tyrell.layout/with-container {:width width#
                                  :height height#}
         ~@body))))

(defmacro with-resize-observer
  "Bind container context from TypeScript resize observer registry.
   Gets dimensions from ty-resize-observer component with given id via window.tyResizeObserver API.
   
   Usage:
     (with-resize-observer \"my-panel\"
       (my-component))
   
   Note: Requires TypeScript ty-resize-observer web component to be registered.
   If no size is available (e.g., element not yet mounted), executes body without container binding."
  [id & body]
  `(if-let [size# (when (and js/window (.-tyResizeObserver js/window))
                    (.getSize (.-tyResizeObserver js/window) ~id))]
     (let [width# (.-width size#)
           height# (.-height size#)]
       (tyrell.layout/with-container {:width width# :height height#}
         ~@body))
     ;; If no size available, execute body without container binding
     (do ~@body)))
