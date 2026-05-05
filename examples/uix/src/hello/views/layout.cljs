(ns hello.views.layout
  "UIx layout system demos - showing how Ty layout works with UIx"
  (:require
    [tyrell.layout :as layout]
    [uix.core :as uix :refer [defui $ use-state use-effect]]))

;; =============================================================================
;; Layout Info Display Component
;; =============================================================================

(defui container-info-display []
  "Shows current container context information"
  ($ :div.ty-content.rounded-lg.p-4.space-y-3
     ($ :h3.ty-text++.text-lg.font-semibold
        "Current Container Context")

     ($ :div.grid.grid-cols-2.gap-4.text-sm
        ($ :div
           ($ :span.font-medium.ty-text+ "Width: ")
           ($ :span.font-mono.ty-text (or (layout/container-width) "nil") "px"))

        ($ :div
           ($ :span.font-medium.ty-text+ "Height: ")
           ($ :span.font-mono.ty-text (or (layout/container-height) "nil") "px"))

        ($ :div
           ($ :span.font-medium.ty-text+ "Breakpoint: ")
           ($ :span.font-mono.ty-text (name (or (layout/container-breakpoint) :unknown))))

        ($ :div
           ($ :span.font-medium.ty-text+ "Orientation: ")
           ($ :span.font-mono.ty-text (name (or (layout/container-orientation) :unknown)))))))

;; =============================================================================
;; Breakpoint Helpers Demo
;; =============================================================================

(defui breakpoint-helpers-demo []
  "Demonstrates responsive breakpoint helpers"
  ($ :div.space-y-4
     ($ :h3.ty-text++.text-lg.font-semibold
        "Breakpoint Helpers")

     ($ :div.grid.grid-cols-1.md:grid-cols-2.gap-4.text-sm
        ;; Breakpoint checks
        ($ :div.ty-elevated.p-3.rounded
           ($ :h4.font-medium.mb-2.ty-text+ "Breakpoint Checks")
           ($ :div.space-y-1
              (for [bp [:xs :sm :md :lg :xl :2xl]]
                ($ :div {:key bp
                         :class "flex justify-between"}
                   ($ :span (str "breakpoint>= " (name bp) ":"))
                   ($ :span {:class (if (layout/breakpoint>= bp)
                                      "ty-text-success font-medium"
                                      "ty-text-")}
                      (str (layout/breakpoint>= bp)))))))

        ;; Orientation checks  
        ($ :div.ty-elevated.p-3.rounded
           ($ :h4.font-medium.mb-2.ty-text+ "Orientation")
           ($ :div.space-y-1
              ($ :div.flex.justify-between
                 ($ :span "portrait?:")
                 ($ :span {:class (if (layout/portrait?) "ty-text-success font-medium" "ty-text-")}
                    (str (layout/portrait?))))

              ($ :div.flex.justify-between
                 ($ :span "landscape?:")
                 ($ :span {:class (if (layout/landscape?) "ty-text-success font-medium" "ty-text-")}
                    (str (layout/landscape?))))

              ($ :div.flex.justify-between
                 ($ :span "square?:")
                 ($ :span {:class (if (layout/square?) "ty-text-success font-medium" "ty-text-")}
                    (str (layout/square?)))))))))

;; =============================================================================
;; Responsive Value Demo
;; =============================================================================

(defui responsive-value-demo []
  "Shows responsive-value function in action"
  (let [columns (layout/responsive-value {:xs 1
                                          :sm 2
                                          :md 3
                                          :lg 4
                                          :xl 5})
        padding (layout/responsive-value {:xs "0.5rem"
                                          :sm "1rem"
                                          :md "1.5rem"
                                          :lg "2rem"})
        font-size (layout/responsive-value {:xs "14px"
                                            :sm "16px"
                                            :md "18px"
                                            :lg "20px"})]

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Responsive Values")

       ($ :div.ty-content.p-4.rounded-lg
          ($ :div.space-y-3
             ($ :div.text-sm
                ($ :span.font-medium.ty-text+ "Current columns: ")
                ($ :span.font-mono.ty-text columns))

             ($ :div.text-sm
                ($ :span.font-medium.ty-text+ "Current padding: ")
                ($ :span.font-mono.ty-text padding))

             ($ :div.text-sm
                ($ :span.font-medium.ty-text+ "Current font-size: ")
                ($ :span.font-mono.ty-text font-size))))

       ;; Demo grid using responsive columns
       ($ :div.grid.gap-2 {:style {:grid-template-columns (str "repeat(" columns ", minmax(0, 1fr))")}}
          (for [i (range 8)]
            ($ :div.ty-elevated.p-2.text-center.text-sm.rounded {:key i}
               (str "Item " (inc i))))))))

;; =============================================================================
;; Nested Container Demo
;; =============================================================================

(defui nested-container-demo []
  "Demonstrates nested layout contexts"
  ($ :div.space-y-4
     ($ :h3.ty-text++.text-lg.font-semibold
        "Nested Containers")

     ($ :div.border-2.border-dashed.ty-border-primary.p-4.rounded
        ($ :div.mb-4
           ($ :span.font-medium.ty-text+ "Outer Container: ")
           ($ :span.text-sm.font-mono.ty-text
              (str (layout/container-width) "×" (layout/container-height))))

        ;; Nested container with 80% dimensions
        (layout/with-container {:width (layout/width% 80)
                                :height (layout/height% 80)}
          ($ :div.border-2.border-dashed.ty-border-success.p-4.rounded
             ($ :div.mb-4
                ($ :span.font-medium.ty-text+ "Inner Container (80%): ")
                ($ :span.text-sm.font-mono.ty-text
                   (str (layout/container-width) "×" (layout/container-height))))

             ;; Double nested with 50% dimensions
             (layout/with-container {:width (layout/width% 50)
                                     :height (layout/height% 50)}
               ($ :div.border-2.border-dashed.ty-border-secondary.p-4.rounded
                  ($ :div
                     ($ :span.font-medium.ty-text+ "Nested Container (50%): ")
                     ($ :span.text-sm.font-mono.ty-text
                        (str (layout/container-width) "×" (layout/container-height)))))))))))

;; =============================================================================
;; Resize Observer Basic Demo
;; =============================================================================

(defui resize-observer-basic-demo []
  "Basic resize observer with UIx local state"
  (let [[size set-size] (use-state nil)]

    ;; Subscribe to resize changes on mount, cleanup on unmount
    (use-effect
      (fn []
        (when js/window.tyResizeObserver
          (let [unsubscribe (js/window.tyResizeObserver.onResize
                              "uix-basic-demo"
                              (fn [js-size]
                                (set-size {:width (.-width js-size)
                                           :height (.-height js-size)})))]
            ;; Return cleanup function
            unsubscribe)))
      []) ;; Empty deps = run once on mount

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Basic Resize Observer")

       ($ :ty-resize-observer {:id "uix-basic-demo"
                               :class "ty-bg-primary- border-2 ty-border-primary rounded-lg p-4 resize overflow-auto"
                               :style {:min-width "200px"
                                       :min-height "150px"
                                       :width "300px"
                                       :height "200px"}}
          ($ :div.space-y-3
             ($ :div.text-center
                ($ :h4.font-semibold.ty-text+
                   "Resizable Panel")
                ($ :p.text-sm.ty-text-
                   "This content is aware of its container size"))

             ($ :p.text-xs.ty-text--.text-center.italic
                "💡 Drag the bottom-right corner to resize this panel")

             ($ :div.ty-elevated.rounded.p-3
                (if size
                  ($ :div.text-sm.space-y-1
                     ($ :div
                        ($ :span.font-medium.ty-text+ "Width: ")
                        ($ :span.font-mono.ty-text (int (:width size)) "px"))

                     ($ :div
                        ($ :span.font-medium.ty-text+ "Height: ")
                        ($ :span.font-mono.ty-text (int (:height size)) "px"))

                     ($ :div
                        ($ :span.font-medium.ty-text+ "Breakpoint: ")
                        ($ :span.font-mono.ty-text
                           (cond
                             (>= (:width size) 1536) "2xl"
                             (>= (:width size) 1280) "xl"
                             (>= (:width size) 1024) "lg"
                             (>= (:width size) 768) "md"
                             (>= (:width size) 640) "sm"
                             :else "xs")))

                     ($ :div
                        ($ :span.font-medium.ty-text+ "Orientation: ")
                        ($ :span.font-mono.ty-text
                           (let [ratio (/ (:width size) (:height size))]
                             (cond
                               (> ratio 1.1) "landscape"
                               (< ratio 0.9) "portrait"
                               :else "square")))))
                  ($ :div.ty-text- "Initializing...")))

             ($ :div.text-center
                (if (and size (>= (:width size) 768))
                  ($ :div.ty-text-success "✓ Wide enough for desktop layout")
                  ($ :div.text-orange-600 "⚠ Using compact mobile layout"))))))))

;; =============================================================================
;; Container-Aware Grid Demo
;; =============================================================================

(defui container-aware-grid-demo []
  "Grid that adapts based on container size, not window size"
  (let [[size set-size] (use-state nil)]

    ;; Subscribe to resize changes
    (use-effect
      (fn []
        (when js/window.tyResizeObserver
          (let [unsubscribe (js/window.tyResizeObserver.onResize
                              "uix-grid-demo"
                              (fn [js-size]
                                (set-size {:width (.-width js-size)
                                           :height (.-height js-size)})))]
            unsubscribe)))
      [])

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Container-Aware Responsive Grid")

       ($ :p.text-sm.ty-text-
          "This grid adapts based on the container size, not window size.")

       ($ :ty-resize-observer {:id "uix-grid-demo"
                               :class "ty-content border-2 ty-border rounded-lg p-4 resize overflow-auto"
                               :style {:min-width "200px"
                                       :min-height "200px"
                                       :width "400px"
                                       :height "250px"}}
          (if size
            (let [width (:width size)
                  breakpoint (cond
                               (>= width 1024) :lg
                               (>= width 768) :md
                               (>= width 640) :sm
                               :else :xs)
                  columns (cond
                            (>= width 1024) 4
                            (>= width 768) 3
                            (>= width 640) 2
                            :else 1)]
              ($ :div.space-y-3
                 ($ :div.text-center
                    ($ :div.text-sm
                       ($ :span.font-medium.ty-text+ "Grid columns: ")
                       ($ :span.font-mono.ty-text columns))
                    ($ :div.text-xs.ty-text--
                       "Based on container breakpoint: " (name breakpoint)))

                 ($ :div.grid.gap-2 {:style {:grid-template-columns (str "repeat(" columns ", minmax(0, 1fr))")}}
                    (for [i (range 8)]
                      ($ :div.ty-elevated.rounded.p-2.text-center.text-sm {:key i}
                         (str "Item " (inc i)))))))
            ($ :div.ty-text-.text-center "Initializing...")))))

;; =============================================================================
;; Flexbox Demo with Dual Resize Observers
;; =============================================================================

  (defui flexbox-dual-observer-demo []
    "Flexbox layout with two resize observers"
    (let [[sidebar-size set-sidebar-size] (use-state nil)
          [main-size set-main-size] (use-state nil)]

    ;; Subscribe to sidebar resize
      (use-effect
        (fn []
          (when js/window.tyResizeObserver
            (let [unsubscribe (js/window.tyResizeObserver.onResize
                                "uix-flex-sidebar"
                                (fn [js-size]
                                  (set-sidebar-size {:width (.-width js-size)
                                                     :height (.-height js-size)})))]
              unsubscribe)))
        [])

    ;; Subscribe to main content resize
      (use-effect
        (fn []
          (when js/window.tyResizeObserver
            (let [unsubscribe (js/window.tyResizeObserver.onResize
                                "uix-flex-main"
                                (fn [js-size]
                                  (set-main-size {:width (.-width js-size)
                                                  :height (.-height js-size)})))]
              unsubscribe)))
        [])

      ($ :div.space-y-4
         ($ :h3.ty-text++.text-lg.font-semibold
            "Flexbox Layout with Resize Observers")

         ($ :p.text-sm.ty-text-
            "Both panels use resize observers for layout context.")

         ($ :div.flex.gap-4.h-80
          ;; Sidebar with resize observer
            ($ :ty-resize-observer {:id "uix-flex-sidebar"
                                    :class "ty-bg-secondary- border-2 ty-border-secondary rounded-lg p-4 resize overflow-auto"
                                    :style {:min-width "150px"
                                            :width "200px"}}
               (if sidebar-size
                 (let [width (:width sidebar-size)]
                   ($ :div.space-y-3
                      ($ :h4.font-semibold.text-center.ty-text+
                         "Sidebar")

                      ($ :div.ty-elevated.rounded.p-2.text-xs.space-y-1
                         ($ :div
                            "Width: " ($ :span.font-mono.ty-text (int width) "px"))
                         ($ :div
                            "Height: " ($ :span.font-mono.ty-text (int (:height sidebar-size)) "px")))

                      ($ :div.text-center.text-sm
                         (if (> width 180)
                           ($ :div.ty-text-success "🎯 Full content")
                           ($ :div.ty-text-warning "📱 Compact")))))
                 ($ :div.ty-text-.text-center "Loading...")))

          ;; Main content with resize observer
            ($ :ty-resize-observer {:id "uix-flex-main"
                                    :class "ty-bg-success- border-2 ty-border-success rounded-lg p-4 flex-1"}
               (if main-size
                 (let [width (:width main-size)
                       breakpoint (cond
                                    (>= width 1024) :lg
                                    (>= width 768) :md
                                    :else :xs)]
                   ($ :div.space-y-3
                      ($ :h4.font-semibold.text-center.ty-text+
                         "Main Content")

                      ($ :div.ty-elevated.rounded.p-3.space-y-1.text-sm
                         ($ :div
                            "Width: " ($ :span.font-mono.ty-text (int width) "px"))
                         ($ :div
                            "Height: " ($ :span.font-mono.ty-text (int (:height main-size)) "px"))
                         ($ :div
                            "Breakpoint: " ($ :span.font-mono.ty-text (name breakpoint))))

                      ($ :div.text-center
                         (cond
                           (>= width 1024) ($ :div.ty-text-success "🖥️ Desktop Layout")
                           (>= width 768) ($ :div.ty-text-primary "💻 Tablet Layout")
                           :else ($ :div.ty-text-secondary "📱 Mobile Layout")))))
                 ($ :div.ty-text-.text-center "Loading..."))))))))

;; =============================================================================
;; UIx State Integration Demo
;; =============================================================================

(defui uix-state-integration-demo []
  "Shows how to integrate layout context with UIx state"
  (let [[container-info set-container-info] (use-state nil)
        [update-count set-update-count] (use-state 0)]

    ;; Update container info when layout context changes
    (use-effect
      (fn []
        (set-container-info {:width (layout/container-width)
                             :height (layout/container-height)
                             :breakpoint (layout/container-breakpoint)
                             :orientation (layout/container-orientation)})
        (set-update-count inc))
      [(layout/container-width) (layout/container-height)])

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "UIx State Integration")

       ($ :p.text-sm.ty-text-
          "Demonstrates integrating layout context with UIx state management.")

       ($ :div.ty-content.p-4.rounded-lg.space-y-3
          ($ :div.text-sm
             ($ :span.font-medium.ty-text+ "Update count: ")
             ($ :span.font-mono.ty-text update-count))

          (if container-info
            ($ :div.space-y-2.text-sm
               ($ :div
                  ($ :span.font-medium.ty-text+ "Captured width: ")
                  ($ :span.font-mono.ty-text (or (:width container-info) "nil") "px"))

               ($ :div
                  ($ :span.font-medium.ty-text+ "Captured height: ")
                  ($ :span.font-mono.ty-text (or (:height container-info) "nil") "px"))

               ($ :div
                  ($ :span.font-medium.ty-text+ "Captured breakpoint: ")
                  ($ :span.font-mono.ty-text (name (or (:breakpoint container-info) :unknown))))

               ($ :div
                  ($ :span.font-medium.ty-text+ "Captured orientation: ")
                  ($ :span.font-mono.ty-text (name (or (:orientation container-info) :unknown)))))

            ($ :div.ty-text-.text-sm "No container info captured yet..."))))))

;; =============================================================================
;; Main Layout Demo View  
;; =============================================================================

(defui view []
  "Main layout demos view for UIx"
  ;; Use with-window to provide layout context for the entire demo
  (layout/with-window
    ($ :div.p-8.max-w-6xl.mx-auto.space-y-8.ty-text

       ;; Header
       ($ :div
          ($ :h1.text-3xl.font-bold.mb-4.ty-text++
             "UIx Layout System Demo")
          ($ :p.ty-text-.max-w-2xl
             "Demonstrates how the Ty layout system works seamlessly with UIx components.")
          ($ :p.text-sm.ty-text--.mt-2
             "Using the " ($ :code.ty-bg-neutral-.px-1.rounded "with-window")
             " macro for automatic window dimension tracking."))

       ;; Current container info
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (container-info-display))

       ;; Breakpoint helpers
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (breakpoint-helpers-demo))

       ;; Responsive values
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (responsive-value-demo))

       ;; Nested containers
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (nested-container-demo))

       ;; UIx state integration
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (uix-state-integration-demo))

       ;; Resize Observer section
       ($ :div
          ($ :h2.text-2xl.font-bold.mb-4.ty-text-primary
             "Resize Observer Components")
          ($ :p.ty-text-.mb-6
             "Self-observing components that integrate seamlessly with the layout context system."))

       ;; Basic resize observer
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (resize-observer-basic-demo))

       ;; Container-aware grid
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (container-aware-grid-demo))

       ;; Flexbox with dual observers
       ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
          (flexbox-dual-observer-demo)))))
