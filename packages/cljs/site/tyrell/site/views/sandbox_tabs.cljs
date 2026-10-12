(ns tyrell.site.views.sandbox-tabs
  "Hidden verification page — NOT linked from any nav, NOT in the docs/guide
   route lists, so it never reaches nav or search (build-search-index only
   reads guide-routes + component-routes). Reachable only by direct URL at
   /internal/tabs.

   Verifies ty-tabs resize/overflow. The old bug: the ResizeObserver wrote its
   measured CONTENT-box width into --tabs-width, which sized :host. With
   box-sizing: border-box the element shrank by its own padding + border on
   every callback, retriggering the observer until the button row collapsed and
   every tab landed in the “…” menu.

   That loop can't happen any more: nothing is written to the host. The width
   and height attributes size :host through a per-instance sheet adopted in the
   shadow root, and the carousel is a percentage translateX inside the shadow.
   The readout checks exactly that: the host tracks its container and carries
   no style attribute. updateOverflow still bails when clientWidth <= 0."
  (:require
   [tyrell.site.state :as state]))

(def ^:private tab-defs
  [["a" "Profile"] ["b" "Sign-in methods"] ["c" "Notifications"]
   ["d" "Billing"] ["e" "Advanced"] ["f" "Integrations"]
   ["g" "Webhooks"] ["h" "Audit log"]])

(def ^:private width-options
  "Values for the ty-tabs width attribute; nil removes it, leaving the base
   :host width: 100%."
  ["100%" "480px" nil])

(defn- width-attr []
  (get-in @state/state [:sandbox-tabs :width] "100%"))

(defn- set-width-attr! [w]
  (swap! state/state assoc-in [:sandbox-tabs :width] w))

(defn- readout []
  (get-in @state/state [:sandbox-tabs :readout] {}))

(defn- measure!
  "Read the live state out of the component's shadow DOM into app state."
  []
  (when-let [^js el (.querySelector js/document "#sandbox-tabs")]
    (when-let [sr (.-shadowRoot el)]
      (let [row (.querySelector sr ".tab-buttons")
            strip (.querySelector sr ".tab-strip")
            buttons (.querySelectorAll sr ".tab-button")
            trigger (.querySelector sr ".tab-overflow-trigger")
            active (.querySelector sr ".tab-button[aria-selected='true']")
            scroll-left (if strip (js/Math.round (.-scrollLeft strip)) 0)
            strip-width (if strip (.-clientWidth strip) 0)
            scroll-width (if strip (.-scrollWidth strip) 0)]
        (swap! state/state assoc-in [:sandbox-tabs :readout]
               {:host-width (js/Math.round (.-width (.getBoundingClientRect el)))
                :container-width (.. el -parentElement -clientWidth)
                :host-style (.getAttribute el "style")
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
                :fade-left (if strip (.getPropertyValue (.-style strip) "--fade-left") "")
                :fade-right (if strip (.getPropertyValue (.-style strip) "--fade-right") "")
                :trigger? (boolean trigger)})))))

(defn- set-box-width! [px]
  (when-let [box (.getElementById js/document "sandbox-tabs-resizer")]
    (set! (.. box -style -width) (str px "px"))))

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
  (let [{:keys [host-width container-width host-style row-width total
                scroll-left scroll-width strip-width hidden row-slack
                btn-center view-center fade-left fade-right trigger?]
         :or {host-width 0 container-width 0 row-width 0 total 0 scroll-left 0
              scroll-width 0 strip-width 0 hidden 0 row-slack 0 btn-center 0
              view-center 0 fade-left "" fade-right ""}}
        (readout)
        width (width-attr)
        fluid? (not (re-find #"px$" (str width)))
        shrunk? (and fluid? (> (js/Math.abs (- host-width container-width)) 1))
        max-scroll (max 0 (- scroll-width strip-width))
        anchor (cond
                 (zero? max-scroll) "nothing to scroll"
                 (<= scroll-left 0) "clamped at start"
                 (>= scroll-left (dec max-scroll)) "clamped at end"
                 :else "centred")]
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
            (js/setTimeout tick 150))))}

     [:h1.text-2xl.font-bold.ty-text "ty-tabs resize / overflow (hidden — /internal/tabs)"]
     [:p.ty-text-.max-w-3xl {:style {:font-size "0.875rem" :line-height "1.7"}}
      "Drag the handle at the bottom-right of the dashed box. Its padding and border are what "
      "the old " [:code "--tabs-width"] " loop shaved off on every resize. Nothing is written "
      "to the host now: its width must track the container and it keeps no style attribute."]

     [:div.flex.flex-wrap.items-center.gap-4
      [:div.inline-flex.items-center.gap-2
       [:span.ty-text-.text-sm "width attr"]
       (for [w width-options]
         [:ty-button {:replicant/key (or w "none")
                      :size "sm" :flavor "primary"
                      :appearance (if (= w width) "solid" "outlined")
                      :on {:click (fn [_] (set-width-attr! w))}}
          (or w "none")])]
      [:ty-button {:size "sm" :on {:click (fn [_] (set-box-width! 900))}} "Reset to 900px"]
      [:ty-button {:size "sm" :flavor "primary" :appearance "outlined"
                   :on {:click (fn [_] (sliver-width! 5))}}
       "Overflow by 5px"]
      [:ty-button {:size "sm" :flavor "primary" :appearance "outlined"
                   :on {:click (fn [_] (sliver-width! 120))}}
       "Overflow by 120px"]]

     [:p.ty-text-.max-w-3xl {:style {:font-size "0.8125rem" :line-height "1.7"}}
      "Tabs never collapse — the strip scrolls (scrollbar hidden) and clicking a tab at "
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
        "flush at the right edge."]
       [:li [:strong "Width attribute."] " " [:code "100%"] " and " [:code "none"]
        " track the box; " [:code "480px"] " holds while you drag. "
        [:code "host style attr"] " stays " [:code "(none)"] " throughout."]]]

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
       [:ty-tabs#sandbox-tabs {:active "a" :width width :height "200px"}
        (for [[id label] tab-defs]
          [:ty-tab {:replicant/key id :id id :label label}
           [:div.p-4.ty-text- {:style {:font-size "0.875rem"}} (str label " panel")]])]]]

     [:div.ty-elevated.rounded-lg.p-4.space-y-1
      (kv "host rect / container" (str host-width " / " container-width "px"
                                       (cond shrunk? "   ← host doesn't track its container"
                                             fluid? "   ← tracks the box"
                                             :else "   ← fixed by the width attr"))
          shrunk?)
      (kv "host style attr" (str (or host-style "(none)")
                                 (if host-style "   ← something wrote to the host" "   ← nothing written"))
          (some? host-style))
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
      (kv "active centre / view centre" (str btn-center " / " view-center "px   ← " anchor) false)]]))
