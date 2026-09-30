(ns tyrell.site.views.sandbox-select-mobile
  "Hidden verification page — /internal/select-mobile. NOT linked from nav or search.

   Exercises ty-select's MOBILE skin: the pinned 'Selected' strip above the
   'Available' list, and the accordion between them (only one section owns the
   dialog's spare height at a time; tapping a header trades it).

   Mobile mode is gated on isMobileTouch(), which is
   `(pointer: coarse) and (max-width: 768px)` — narrowing a desktop window is
   NOT enough, the pointer has to be coarse. Rather than make you reach for
   DevTools device emulation, the toggle below patches window.matchMedia for
   that ONE query and delegates everything else to the real implementation, so
   the site's own layout/breakpoint queries keep working while the select
   renders its mobile dialog.

   Needs a genuinely long list on both sides: the strip caps at 40% (70% while
   expanded) and scrolls internally, which you can't judge with three chips."
  (:require
   [tyrell.site.state :as state]))

(def ^:private option-count 40)

(def ^:private fruits
  ["Apple" "Apricot" "Avocado" "Banana" "Blackberry" "Blueberry" "Cherry"
   "Clementine" "Coconut" "Cranberry" "Currant" "Date" "Dragonfruit" "Durian"
   "Elderberry" "Fig" "Gooseberry" "Grape" "Grapefruit" "Guava" "Jackfruit"
   "Kiwi" "Kumquat" "Lemon" "Lime" "Lychee" "Mandarin" "Mango" "Melon"
   "Mulberry" "Nectarine" "Orange" "Papaya" "Passionfruit" "Peach" "Pear"
   "Persimmon" "Pineapple" "Plum" "Pomegranate"])

(def ^:private defaults
  {:forced? false :mount-id 0 :mounted? true :readout {}})

(defn- sub []
  ;; merge, NOT a `get` default: the polling hook writes :polling? into this
  ;; key on first render, after which the map exists but has none of the
  ;; other keys — a get-default would stop applying and :mounted? would read
  ;; nil, silently un-rendering the select.
  (merge defaults (get @state/state :sandbox-select-mobile)))

(defn- select-el []
  (.querySelector js/document "#sandbox-mobile-select"))

(defn- force-mobile!
  "Patch only `(pointer: coarse) …` so isMobileTouch() reports true; every
   other query still hits the real matchMedia, which the site's own layout
   system depends on."
  []
  (when-not (.-_tyOriginalMatchMedia js/window)
    (set! (.-_tyOriginalMatchMedia js/window) (.-matchMedia js/window)))
  (let [orig (.-_tyOriginalMatchMedia js/window)]
    (set! (.-matchMedia js/window)
          (fn [q]
            (if (re-find #"pointer:\s*coarse" q)
              #js {:matches true :media q :onchange nil
                   :addListener (fn [_]) :removeListener (fn [_])
                   :addEventListener (fn [& _]) :removeEventListener (fn [& _])
                   :dispatchEvent (fn [_] false)}
              (.call orig js/window q))))))

(defn- restore-match-media! []
  (when-let [orig (.-_tyOriginalMatchMedia js/window)]
    (set! (.-matchMedia js/window) orig)))

(defn- toggle-forced! []
  (let [next (not (:forced? (sub)))]
    (if next (force-mobile!) (restore-match-media!))
    ;; ty-select picks its skin ONCE, on first render (_state.mode), and
    ;; neither render path rebuilds an existing shadow DOM — so a key change
    ;; isn't enough, the element has to actually leave the document and come
    ;; back. Unmount this frame, remount the next.
    (swap! state/state update :sandbox-select-mobile
           (fn [s] (-> (or s {})
                       (assoc :forced? next :mounted? false))))
    (js/requestAnimationFrame
     (fn []
       (swap! state/state update :sandbox-select-mobile
              (fn [s] (-> s
                          (assoc :mounted? true)
                          (update :mount-id (fnil inc 0)))))))))

(defn- set-value! [values]
  (when-let [^js el (select-el)]
    (set! (.-value el) (clojure.string/join "," values))))

(defn- values-for [n]
  (map #(str "f" %) (range n)))

(defn- measure!
  "Read the live mobile-dialog state out of the shadow DOM."
  []
  (when-let [^js el (select-el)]
    (when-let [sr (.-shadowRoot el)]
      (let [body (.querySelector sr ".mobile-body")
            selected-section (.querySelector sr ".mobile-selected-section")
            chips (.querySelectorAll sr ".mobile-selected-chip")
            strip (.querySelector sr ".mobile-selected-chips")
            dialog (.querySelector sr ".mobile-dialog")
            available (.querySelector sr ".mobile-available-section .section-content")]
        (swap! state/state assoc-in [:sandbox-select-mobile :readout]
               {:mode (if (.querySelector sr ".mobile-dialog") "mobile" "desktop")
                :open? (boolean (and dialog (.-open dialog)))
                :expanded (when body (.. body -dataset -expanded))
                :empty (when selected-section (.getAttribute selected-section "data-empty"))
                :chips (.-length chips)
                :strip-h (if strip (.-clientHeight strip) 0)
                :strip-scroll (if strip (.-scrollHeight strip) 0)
                :avail-h (if available (.-clientHeight available) 0)
                :avail-scroll (if available (.-scrollHeight available) 0)
                :value (.-value el)})))))

(defn- kv [label value]
  [:div.flex.items-baseline.gap-3
   [:span.ty-text--.font-mono {:style {:font-size "0.7rem" :width "9rem" :flex-shrink 0}} label]
   [:span.font-mono.ty-text {:style {:font-size "0.75rem"}} (str value)]])

(defn view []
  (let [{:keys [forced? mount-id mounted? readout]} (sub)
        {:keys [mode open? expanded empty chips strip-h strip-scroll
                avail-h avail-scroll value]
         :or {mode "-" expanded "-" empty "-" chips 0 strip-h 0 strip-scroll 0
              avail-h 0 avail-scroll 0 value ""}} readout]
    [:div.p-6.max-w-4xl.mx-auto.space-y-6
     {:replicant/on-render
      (fn [_]
        (when-not (get-in @state/state [:sandbox-select-mobile :polling?])
          (swap! state/state assoc-in [:sandbox-select-mobile :polling?] true)
          (letfn [(tick [] (measure!) (js/requestAnimationFrame tick))]
            (js/setTimeout tick 200))))}

     [:h1.text-xl.font-bold.ty-text "ty-select — mobile strip + accordion"]

     [:div.ty-elevated.rounded-lg.p-5.space-y-3
      [:div.flex.items-center.justify-between.gap-3
       [:span.ty-text-.font-mono {:style {:font-size "0.75rem"}}
        "skin: " [:strong {:class (if (= mode "mobile") "ty-text-success" "ty-text-danger")} mode]]
       [:span.ty-text--.font-mono {:style {:font-size "0.7rem"}} (str "mount #" mount-id)]]

      (when mounted?
        ^{:key mount-id}
        [:ty-select#sandbox-mobile-select
         {:multiple true
          :label "Fruit"
          :placeholder "Pick a few..."
          :selected-label "Selected"
          :available-label "Available"
          :style {:max-width "320px"}}
         (for [[i fruit] (map-indexed vector (take option-count fruits))]
           ^{:key i}
           [:ty-option {:value (str "f" i)} fruit])])

      [:div.flex.flex-wrap.items-center.gap-2
       [:ty-button {:size "sm" :on {:click (fn [_] (set-value! (values-for 12)))}} "Select 12"]
       [:ty-button {:size "sm" :on {:click (fn [_] (set-value! (values-for 25)))}} "Select 25"]
       [:ty-button {:size "sm" :flavor "primary" :appearance "outlined"
                    :on {:click (fn [_] (set-value! (values-for option-count)))}} "Select all 40"]
       [:ty-button {:size "sm" :flavor "neutral"
                    :on {:click (fn [_] (set-value! []))}} "Clear"]]]

     [:div.ty-elevated.rounded-lg.p-4.space-y-1
      (kv "skin" mode)
      (kv "dialog open" (if open? "yes" "no"))
      (kv "expanded" expanded)
      (kv "strip empty" empty)
      (kv "chips" chips)
      (kv "strip H / scrollH" (str strip-h " / " strip-scroll "px"
                                   (when (> strip-scroll strip-h) "   \u2190 strip scrolls")))
      (kv "avail H / scrollH" (str avail-h " / " avail-scroll "px"
                                   (when (> avail-scroll avail-h) "   \u2190 list scrolls")))
      (kv "value" (if (seq value) (str (count (clojure.string/split value #",")) " selected") "(none)"))]

     [:div.ty-content.rounded-lg.p-4.space-y-2
      [:p.ty-text.font-semibold {:style {:font-size "0.8125rem"}} "What to check"]
      [:ol.ty-text-.list-decimal.pl-5.space-y-1 {:style {:font-size "0.8125rem" :line-height "1.6"}}
       [:li "Nothing selected: the strip is a 36px header, its chevron is hidden, and tapping it "
        "does nothing \u2014 there's no point expanding into an empty panel."]
       [:li [:strong "Select 25"] " then open: the strip caps at 40% and scrolls internally "
        "(watch " [:code "strip scrollH"] " exceed " [:code "strip H"] ") while the list keeps the rest."]
       [:li "Tap " [:strong "Selected (N)"] ": it grows to 70%, the list shrinks, both chevrons flip. "
        "Tap " [:strong "Available"] " to trade back."]
       [:li "With the strip expanded, dismiss chips until the last one goes \u2014 the space must "
        "return to the list on its own."]
       [:li "Both sections scroll independently; neither should ever scroll the dialog itself."]]]

     [:div.ty-content.rounded-lg.p-4.space-y-3
      [:p.ty-text-.mb-0 {:style {:font-size "0.8125rem" :line-height "1.7"}}
       "On a phone, or Chrome device emulation, the skin above already says "
       [:strong "mobile"] " \u2014 nothing to switch on. The toggle is only for a plain desktop "
       "window, where " [:code "isMobileTouch()"] " refuses because it wants "
       [:code "(pointer: coarse)"] " as well as \u2264768px. It fakes that one media query and "
       "passes everything else to the real " [:code "matchMedia"] ", then remounts the select \u2014 "
       "the skin is chosen once, at first render, so an existing element never switches."]
      [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm
       [:ty-checkbox {:flavor "primary"
                      :checked (when forced? "")
                      :on {:change (fn [_] (toggle-forced!))}}]
       [:span.ty-text "Force mobile mode (desktop only)"]]]]))
