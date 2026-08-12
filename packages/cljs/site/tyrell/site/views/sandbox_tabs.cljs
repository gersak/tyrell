(ns tyrell.site.views.sandbox-tabs
  "Hidden verification page — NOT linked from any nav, NOT in the docs/guide
   route lists, so it never reaches nav or search (build-search-index only
   reads guide-routes + component-routes). Reachable only by direct URL at
   /internal/tabs.

   Verifies the ty-tabs resize/overflow fix. The bug: the ResizeObserver wrote
   its measured CONTENT-box width into --tabs-width, which is what sizes :host.
   With box-sizing: border-box the new border box equals the old content box, so
   the element shrank by its own padding + border on every callback — which
   retriggered the observer and shrank it again, converging toward zero. The
   button row collapsed with it and updateOverflow decided even the first tab
   didn't fit, banishing everything into the ... menu. A page load looked fine
   because render() sets --tabs-width: 100% and no resize had happened yet.

   The fix splits the two roles: --tabs-width still sizes :host, while the
   measured pixel page width goes to --tabs-page-width, consumed only by
   ::slotted(ty-tab). Plus updateOverflow now bails when clientWidth <= 0
   instead of reading 'nothing fits' into an unmeasurable element.

   The 'simulate old behaviour' toggle re-attaches the pre-fix line verbatim so
   the failure is watchable, not just described."
  (:require
   [tyrell.site.state :as state]))

(def ^:private tab-defs
  [["a" "Profile"] ["b" "Sign-in methods"] ["c" "Notifications"]
   ["d" "Billing"] ["e" "Advanced"]])

(defn- simulate-bug? []
  (get-in @state/state [:sandbox-tabs :simulate-bug?] false))

(defn- readout []
  (get-in @state/state [:sandbox-tabs :readout] {}))

(defn- measure!
  "Read the live state out of the component's shadow DOM into app state."
  []
  (when-let [el (.querySelector js/document "#sandbox-tabs")]
    (when-let [sr (.-shadowRoot el)]
      (let [row (.querySelector sr ".tab-buttons")
            buttons (.querySelectorAll sr ".tab-button")
            hidden (.querySelectorAll sr ".tab-button.overflow-hidden")
            trigger (.querySelector sr ".tab-overflow-trigger")
            inline (.getPropertyValue (.-style el) "--tabs-width")
            page (.getPropertyValue (.-style el) "--tabs-page-width")]
        (swap! state/state assoc-in [:sandbox-tabs :readout]
               {:host-width (.-offsetWidth el)
                :row-width (if row (.-clientWidth row) 0)
                :total (.-length buttons)
                :hidden (.-length hidden)
                :trigger? (boolean trigger)
                :tabs-width (if (empty? inline) "(unset)" inline)
                :page-width (if (empty? page) "(unset)" page)})))))

(defn- attach-bug-observer!
  "Reproduces the pre-fix line verbatim, gated on the toggle. One observer for
   the life of the page; it no-ops while the toggle is off."
  [^js el]
  (when (and el (not (.-_sandboxBugObserver el)))
    (let [obs (js/ResizeObserver.
               (fn [entries]
                 (when (simulate-bug?)
                   (.setProperty (.-style el) "--tabs-width"
                                 (str (.. ^js (aget entries 0) -contentRect -width) "px")))))]
      (.observe obs el)
      (set! (.-_sandboxBugObserver el) obs))))

(defn- clear-inline-width! []
  (when-let [^js el (.querySelector js/document "#sandbox-tabs")]
    (.removeProperty (.-style el) "--tabs-width")))

(defn- toggle-bug! []
  (swap! state/state update-in [:sandbox-tabs :simulate-bug?] not)
  (when-not (simulate-bug?) (clear-inline-width!)))

(defn- reset-width! []
  (when-let [box (.getElementById js/document "sandbox-tabs-resizer")]
    (set! (.. box -style -width) "900px"))
  (clear-inline-width!))

(defn- kv [label value danger?]
  [:div.flex.items-baseline.gap-3
   [:span.ty-text--.font-mono {:style {:font-size "0.7rem" :width "11rem" :flex-shrink 0}} label]
   [:span.font-mono {:class (when danger? "ty-text-danger")
                     :style {:font-size "0.75rem" :font-weight (if danger? "700" "400")}}
    (str value)]])

(defn view []
  (let [{:keys [host-width row-width total hidden trigger? tabs-width page-width]
         :or {host-width 0 row-width 0 total 0 hidden 0 tabs-width "(unset)" page-width "(unset)"}}
        (readout)
        looping? (boolean (re-find #"px" (str tabs-width)))
        bug? (simulate-bug?)]
    [:div.p-6.max-w-5xl.mx-auto.space-y-6
     {:replicant/on-render
      (fn [_]
        ;; Poll rather than hook the component's internals — this is a scratch
        ;; page and the values change on every animation frame during a drag.
        (when-not (get-in @state/state [:sandbox-tabs :polling?])
          (swap! state/state assoc-in [:sandbox-tabs :polling?] true)
          (letfn [(tick []
                    (measure!)
                    (js/requestAnimationFrame tick))]
            (js/setTimeout
             (fn []
               (attach-bug-observer! (.querySelector js/document "#sandbox-tabs"))
               (tick))
             150))))}

     [:h1.text-2xl.font-bold.ty-text "ty-tabs resize / overflow (hidden — /internal/tabs)"]
     [:p.ty-text-.max-w-3xl {:style {:font-size "0.875rem" :line-height "1.7"}}
      "Drag the handle at the bottom-right of the dashed box. The box has horizontal padding "
      "and a border on purpose — that is exactly what the old code subtracted from the element "
      "on every resize callback."]

     [:div.flex.flex-wrap.items-center.gap-4
      [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm
       [:ty-checkbox {:flavor "danger"
                      :checked (when bug? "")
                      :on {:change (fn [_] (toggle-bug!))}}]
       [:span.ty-text "Simulate the "
        [:strong "old"] " behaviour (write measured px into "
        [:code "--tabs-width"] ")"]]
      [:ty-button {:size "sm" :on {:click (fn [_] (reset-width!))}} "Reset to 900px"]]

     [:p.ty-text-.max-w-3xl {:style {:font-size "0.8125rem" :line-height "1.7"}}
      "Off: tabs collapse into “…” only when they genuinely do not fit, and come back when "
      "there is room. On: each callback shrinks the element by its own padding + border, "
      "retriggering the observer, until it reaches a single tab plus “…” and never recovers."]

     [:div#sandbox-tabs-resizer
      {:style {:width "900px"
               :min-width "160px"
               :max-width "100%"
               :padding "0 40px"
               :border "2px dashed var(--ty-border)"
               :border-radius "8px"
               :resize "horizontal"
               :overflow "auto"
               :background "var(--ty-surface-elevated)"}}
      [:div {:style {:padding "16px 0"}}
       [:ty-tabs#sandbox-tabs {:active "a" :width "100%" :height "200px"}
        (for [[id label] tab-defs]
          ^{:key id}
          [:ty-tab {:id id :label label}
           [:div.p-4.ty-text- {:style {:font-size "0.875rem"}} (str label " panel")]])]]]

     [:div.ty-elevated.rounded-lg.p-4.space-y-1
      (kv "host offsetWidth" (str host-width "px") false)
      (kv ".tab-buttons width" (str row-width "px") (<= row-width 0))
      (kv "tabs total / hidden" (str total " / " hidden) (pos? hidden))
      (kv "overflow “…” shown" (if trigger? "yes" "no") trigger?)
      [:div {:style {:height "8px"}}]
      (kv "--tabs-width" (str tabs-width (if looping? "   ← px: feedback loop" "   ← fluid, no loop")) looping?)
      (kv "--tabs-page-width" (str page-width "   ← carousel page size (safe)") false)]]))
