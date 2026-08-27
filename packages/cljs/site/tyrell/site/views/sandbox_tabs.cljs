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
   ["d" "Billing"] ["e" "Advanced"] ["f" "Integrations"]
   ["g" "Webhooks"] ["h" "Audit log"]])

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
            strip (.querySelector sr ".tab-strip")
            buttons (.querySelectorAll sr ".tab-button")
            trigger (.querySelector sr ".tab-overflow-trigger")
            active (.querySelector sr ".tab-button[aria-selected='true']")
            inline (.getPropertyValue (.-style el) "--tabs-width")
            page (.getPropertyValue (.-style el) "--tabs-page-width")
            scroll-left (if strip (js/Math.round (.-scrollLeft strip)) 0)
            strip-width (if strip (.-clientWidth strip) 0)
            scroll-width (if strip (.-scrollWidth strip) 0)]
        (swap! state/state assoc-in [:sandbox-tabs :readout]
               {:host-width (.-offsetWidth el)
                :row-width (if row (.-clientWidth row) 0)
                :total (.-length buttons)
                :scroll-left scroll-left
                :scroll-width scroll-width
                :strip-width strip-width
                :hidden (max 0 (- scroll-width strip-width))
                :row-slack (if (and row strip) (- (.-clientWidth row) strip-width) 0)
                :btn-center (if active
                              (js/Math.round (+ (.-offsetLeft active) (/ (.-offsetWidth active) 2)))
                              0)
                :view-center (js/Math.round (+ scroll-left (/ strip-width 2)))
                :fade-left (.getPropertyValue (.-style strip) "--fade-left")
                :fade-right (.getPropertyValue (.-style strip) "--fade-right")
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

(defn- set-box-width! [px]
  (when-let [box (.getElementById js/document "sandbox-tabs-resizer")]
    (set! (.. box -style -width) (str px "px"))))

(defn- reset-width! []
  (set-box-width! 900)
  (clear-inline-width!))

(def ^:private box-chrome
  "The dashed box is border-box with padding 0 40px and a 2px border, so the
   ty-tabs inside it is this much narrower than the box."
  84)

(defn- sliver-width!
  "Size the box so the tabs overflow by exactly `px` — the case that used to
   summon a ~52px “…” trigger to reveal a few pixels."
  [px]
  (when-let [el (.querySelector js/document "#sandbox-tabs")]
    (when-let [sr (.-shadowRoot el)]
      (when-let [strip (.querySelector sr ".tab-strip")]
        ;; scrollWidth is the content extent whether or not the strip is clipped.
        (set-box-width! (+ (.-scrollWidth strip) box-chrome (- px)))))))

(defn- kv [label value danger?]
  [:div.flex.items-baseline.gap-3
   [:span.ty-text--.font-mono {:style {:font-size "0.7rem" :width "11rem" :flex-shrink 0}} label]
   [:span.font-mono {:class (when danger? "ty-text-danger")
                     :style {:font-size "0.75rem" :font-weight (if danger? "700" "400")}}
    (str value)]])

(defn view []
  (let [{:keys [host-width row-width total scroll-left scroll-width strip-width
                hidden row-slack btn-center view-center fade-left fade-right
                trigger? tabs-width page-width]
         :or {host-width 0 row-width 0 total 0 scroll-left 0 scroll-width 0
              strip-width 0 hidden 0 row-slack 0 btn-center 0 view-center 0
              fade-left "" fade-right "" tabs-width "(unset)" page-width "(unset)"}}
        (readout)
        looping? (boolean (re-find #"px" (str tabs-width)))
        max-scroll (max 0 (- scroll-width strip-width))
        anchor (cond
                 (zero? max-scroll) "nothing to scroll"
                 (<= scroll-left 0) "clamped at start"
                 (>= scroll-left (dec max-scroll)) "clamped at end"
                 :else "centred")
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
      [:ty-button {:size "sm" :on {:click (fn [_] (reset-width!))}} "Reset to 900px"]
      [:ty-button {:size "sm" :flavor "primary" :appearance "outlined"
                   :on {:click (fn [_] (sliver-width! 5))}}
       "Overflow by 5px"]
      [:ty-button {:size "sm" :flavor "primary" :appearance "outlined"
                   :on {:click (fn [_] (sliver-width! 120))}}
       "Overflow by 120px"]]

     [:p.ty-text-.max-w-3xl {:style {:font-size "0.8125rem" :line-height "1.7"}}
      "Tabs never collapse now — the strip scrolls (scrollbar hidden) and clicking a tab at "
      "the edge glides it into view. The “…” jump menu lists ALL tabs and appears only while "
      "the strip genuinely overflows. Shrink the box and click edge tabs to see the slide; "
      "the marker must follow the active tab exactly, including after picking from “…”."]

     [:div.ty-content.rounded-lg.p-4.max-w-3xl.space-y-2
      [:p.ty-text.font-semibold {:style {:font-size "0.8125rem"}} "What to check"]
      [:ol.ty-text-.list-decimal.pl-5.space-y-1 {:style {:font-size "0.8125rem" :line-height "1.6"}}
       [:li [:strong "Overflow by 5px"] " — no “…”. It costs more of the row than it reveals, "
        "so it is backed out. The edge fade shrinks to 5px too, instead of veiling 28px."]
       [:li [:strong "Overflow by 120px"] " — “…” appears. Here it pays for itself."]
       [:li [:strong "Centring."] " With plenty of overflow, activate a middle tab: "
        [:code "active centre"] " and " [:code "view centre"] " must match. Activate the first "
        "or last tab and it clamps to that end — the strip stays full of tabs, never half empty."]
       [:li [:strong "Last tab."] " Activate it at any width: it must end up fully visible, "
        "flush at the right edge."]]]

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
      (kv "tabs total" total false)
      (kv "strip scroll / content" (str scroll-left " / " scroll-width "px (view " strip-width "px)") false)
      (kv "hidden past the edge" (str hidden "px") false)
      (kv "jump “…” shown"
          (str (if trigger? "yes" "no")
               "   ← costs " row-slack "px of the row; only worth it above that")
          false)
      (kv "edge fade L / R"
          (str (if (empty? fade-left) "0px" fade-left) " / "
               (if (empty? fade-right) "0px" fade-right)
               "   ← never more than what is hidden")
          false)
      (kv "active centre / view centre" (str btn-center " / " view-center "px   ← " anchor) false)
      [:div {:style {:height "8px"}}]
      (kv "--tabs-width" (str tabs-width (if looping? "   ← px: feedback loop" "   ← fluid, no loop")) looping?)
      (kv "--tabs-page-width" (str page-width "   ← carousel page size (safe)") false)]]))
