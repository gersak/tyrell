(ns tyrell.positioning
  "Core positioning engine for floating elements.
   Adapted from toddler.popup positioning logic.")

;; -----------------------------
;; Placement definitions
;; -----------------------------

(def placements
  {:top-start {:vertical :top
               :horizontal :start}
   :top {:vertical :top
         :horizontal :center}
   :top-end {:vertical :top
             :horizontal :end}
   :right-start {:vertical :center
                 :horizontal :end
                 :orientation :vertical}
   :right {:vertical :center
           :horizontal :end
           :orientation :vertical}
   :right-end {:vertical :end
               :horizontal :end
               :orientation :vertical}
   :bottom-start {:vertical :bottom
                  :horizontal :start}
   :bottom {:vertical :bottom
            :horizontal :center}
   :bottom-end {:vertical :bottom
                :horizontal :end}
   :left-start {:vertical :center
                :horizontal :start
                :orientation :vertical}
   :left {:vertical :center
          :horizontal :start
          :orientation :vertical}
   :left-end {:vertical :end
              :horizontal :start
              :orientation :vertical}})

(def placement-preferences
  {:default [:bottom-start :bottom-end :top-start :top-end
             :bottom :top :left :right]
   :tooltip [:top :bottom :left :right
             :top-start :top-end :bottom-start :bottom-end]
   :dropdown [:bottom-start :bottom-end :top-start :top-end
              :bottom :top :right :left]})

;; -----------------------------
;; DOM measurement helpers
;; -----------------------------

(defn get-element-rect
  "Get element dimensions relative to viewport"
  [^js el]
  (let [rect (.getBoundingClientRect el)]
    {:top (.-top rect)
     :left (.-left rect)
     :right (.-right rect)
     :bottom (.-bottom rect)
     :width (.-width rect)
     :height (.-height rect)
     :center-x (+ (.-left rect) (/ (.-width rect) 2))
     :center-y (+ (.-top rect) (/ (.-height rect) 2))}))

(defn get-viewport-rect []
  {:width (.-innerWidth js/window)
   :height (.-innerHeight js/window)
   :scroll-x (.-scrollX js/window)
   :scroll-y (.-scrollY js/window)})

;; -----------------------------
;; Position calculation
;; -----------------------------

(defn calculate-placement
  "Calculate position for a specific placement"
  [{:keys [target-rect floating-rect placement offset padding scrollbar-width
           container-padding]}]
  (let [{:keys [vertical horizontal orientation]} (get placements placement)
        viewport (get-viewport-rect)

        ;; Calculate X position
        x (if (= orientation :vertical)
            ;; Left/right placements
            (if (= horizontal :start)
              (+ (- (:left target-rect) (:width floating-rect) offset) container-padding)
              (- (+ (:right target-rect) offset) container-padding))
            ;; Top/bottom placements
            (case horizontal
              :start (:left target-rect)
              :center (- (:center-x target-rect) (/ (:width floating-rect) 2))
              :end (- (:right target-rect) (:width floating-rect))))
        ;; Calculate Y position
        y (if (= orientation :vertical)
            ;; Left/right placements
            (case vertical
              :center (- (:center-y target-rect) (/ (:height floating-rect) 2))
              :end (- (:bottom target-rect) (:height floating-rect) container-padding)
              (:top target-rect))
            ;; Top/bottom placements
            (if (= vertical :top)
              (+ (- (:top target-rect) (:height floating-rect) offset) container-padding)
              (- (+ (:bottom target-rect) offset) container-padding)))

        ;; Calculate overflow
        overflow {:top (min 0 (- y padding))
                  :left (min 0 (- x padding))
                  :bottom (min 0 (- (:height viewport)
                                    (+ y (:height floating-rect) padding)))
                  :right (min 0 (- (:width viewport)
                                   (+ x (:width floating-rect) padding scrollbar-width)))}

        overflow-amount (reduce + (map #(Math/abs %) (vals overflow)))]

    {:x (js/Math.round x)
     :y (js/Math.round y)
     :placement placement
     :overflow overflow
     :overflow-amount overflow-amount
     :fits? (zero? overflow-amount)}))

(defn find-best-position
  "Find the best position for the floating element"
  [{:keys [target-el floating-el preferences offset padding
           container-padding]
    :or {offset 8
         padding 8
         container-padding 0
         preferences (:default placement-preferences)}}]
  (let [target-rect (get-element-rect target-el)
        floating-rect (get-element-rect floating-el)
        scrollbar-width 15

        ;; Calculate all candidate positions
        candidates (map #(calculate-placement
                           {:target-rect target-rect
                            :floating-rect floating-rect
                            :placement %
                            :offset offset
                            :padding padding
                            :container-padding container-padding
                            :scrollbar-width scrollbar-width})
                        preferences)

        ;; Find first that fits, or one with least overflow
        best-position (or (first (filter :fits? candidates))
                          (apply min-key :overflow-amount candidates))]

    ;; Adjust for scrollbar if needed
    (if (neg? (get-in best-position [:overflow :right]))
      (update best-position :x + (get-in best-position [:overflow :right]))
      best-position)))

;; -----------------------------
;; Auto-update functionality
;; -----------------------------

(defn auto-update
  "Create auto-update system for position tracking.
   Takes a config map with same options as find-best-position.
   Returns cleanup function."
  [target-el floating-el update-fn config]
  (let [active? (volatile! true)
        frame-id (volatile! nil)
        resize-observer (volatile! nil)
        mutation-observer (volatile! nil)

        update! (fn []
                  (when @active?
                    (let [position (find-best-position
                                     (merge {:target-el target-el
                                             :floating-el floating-el}
                                            config))]
                      (update-fn position))))

        loop! (fn loop-fn []
                (update!)
                (when @active?
                  (vreset! frame-id (js/requestAnimationFrame loop-fn))))]

    ;; Start the loop
    (loop!)

    ;; Observe size changes
    (vreset! resize-observer (js/ResizeObserver. update!))
    (.observe @resize-observer target-el)
    (.observe @resize-observer floating-el)
    (.observe @resize-observer js/document.body)

    ;; Observe DOM changes
    (vreset! mutation-observer (js/MutationObserver. update!))
    (.observe @mutation-observer target-el
              #js {:attributes true
                   :attributeFilter #js ["class" "style"]})

    ;; Return cleanup function
    (fn cleanup []
      (vreset! active? false)
      (when-let [fid @frame-id]
        (js/cancelAnimationFrame fid))
      (when-let [ro @resize-observer]
        (.disconnect ro))
      (when-let [mo @mutation-observer]
        (.disconnect mo)))))
