(ns tyrell.site.views.sandbox-modal-tabs
  "Hidden verification page — /internal/modal-tabs. NOT linked from nav or search.

   Reproduces the reported bug: ty-tabs mounted inside an ALREADY-OPEN modal
   defaults its marker onto tab 0 (getActiveTabId falls back to the first tab
   when `active` isn't set yet), and if the app corrects `active` a moment
   later — once it actually knows which tab should be selected — the marker
   used to glide from tab 0's position (0,0) to the real one, because by then
   it already had a real, visible, non-zero-size position and the old
   snap-guard (which only catches 'never positioned' or 'positioned while
   hidden') saw nothing to snap.

   The fix (packages/core/src/components/tabs.ts, `pendingInitialSnap`) marks
   the tab-0 position set on a fresh mount as provisional, so the very next
   `active` correction also snaps instead of animating.

   Proof, not just eyeballing: a `transitionrun` listener sits on the live
   `.marker-wrapper` inside the tabs' shadow root. If the marker's left/top/
   width/height ever actually transitions during the correction, the CSS
   transition fired — the bug is back. Silence is the fix working.

   Delete once this class of fix has been out for a while and nobody's hit it."
  (:require
   [tyrell.site.state :as state]))

(def ^:private tab-defs
  [["a" "General"] ["b" "Security"] ["c" "Notifications"] ["d" "Billing"]])

(defn- sub []
  (get @state/state :sandbox-modal-tabs
       {:mount-id 0 :open? false :tabs-mounted? false :delay-ms 0
        :active-tab "a" :log [] :opened-at nil :verdict nil}))

(defn- log! [msg]
  (let [t0 (:opened-at (sub))
        now (.now js/performance)
        elapsed (if t0 (js/Math.round (- now t0)) 0)]
    (swap! state/state update-in [:sandbox-modal-tabs :log]
           (fn [l] (vec (take-last 40 (conj (or l []) (str "+" elapsed "ms  " msg))))))))

(defn- mark-bug! [property]
  (log! (str "⚠️ transitionrun on \"" property "\" — the marker is ANIMATING"))
  (swap! state/state assoc-in [:sandbox-modal-tabs :verdict] :bug))

(defn- mark-ok-if-silent! []
  (when (nil? (:verdict (sub)))
    (log! "no transitionrun observed on the marker → it snapped instantly")
    (swap! state/state assoc-in [:sandbox-modal-tabs :verdict] :ok)))

(defn- attach-transition-watch!
  "Wire the proof: listen for the marker's own CSS transition actually
   running. `.marker-wrapper` exists synchronously once the element connects
   (its innerHTML is set inside connectedCallback), so no need to wait a frame."
  [^js tabs-el]
  (when-let [sr (.-shadowRoot tabs-el)]
    (when-let [marker (.querySelector sr ".marker-wrapper")]
      (.addEventListener marker "transitionrun"
                          (fn [^js e]
                            (when (#{"left" "top" "width" "height"} (.-propertyName e))
                              (mark-bug! (.-propertyName e))))))))

(defn- start-scenario!
  "Open the modal first (so it's already visible), THEN mount a fresh ty-tabs
   into it a frame later — that ordering is what makes this the case the old
   guard missed. `delay-ms` is how long the app waits before it corrects
   `active` from the tab-0 default to the real tab."
  [delay-ms]
  (let [mount-id (inc (:mount-id (sub)))]
    (swap! state/state assoc :sandbox-modal-tabs
           {:mount-id mount-id :open? true :tabs-mounted? false
            :delay-ms delay-ms :active-tab "a" :log []
            :opened-at (.now js/performance) :verdict nil})
    (log! "modal opened (empty — tabs not mounted yet)")
    (js/requestAnimationFrame
     (fn []
       (swap! state/state assoc-in [:sandbox-modal-tabs :tabs-mounted?] true)
       (log! "ty-tabs mounted into the open modal, active=\"a\" (tab-0 default)")
       (js/setTimeout
        (fn []
          (log! (str "app now knows the real tab — correcting active → \"d\""))
          (swap! state/state assoc-in [:sandbox-modal-tabs :active-tab] "d")
          (js/setTimeout mark-ok-if-silent! 400))
        delay-ms)))))

(defn- close! []
  (swap! state/state assoc-in [:sandbox-modal-tabs :open?] false)
  (log! "modal closed"))

(defn- verdict-banner [verdict]
  (case verdict
    :ok [:div.ty-bg-success-.ty-text-success.rounded-lg.px-4.py-3.font-mono
         {:style {:font-size "0.8rem"}}
         "✅ fixed — no transition ran, the marker snapped straight to the corrected tab"]
    :bug [:div.ty-bg-danger-.ty-text-danger.rounded-lg.px-4.py-3.font-mono
          {:style {:font-size "0.8rem"}}
          "❌ regression — the marker animated in from tab 0"]
    [:div.ty-content.rounded-lg.px-4.py-3.font-mono.ty-text-
     {:style {:font-size "0.8rem"}}
     "… running"]))

(defn view []
  (let [{:keys [open? tabs-mounted? active-tab log verdict mount-id]} (sub)]
    [:div.p-6.max-w-3xl.mx-auto.space-y-6
     [:h1.text-2xl.font-bold.ty-text "ty-tabs marker snap inside a modal (hidden — /internal/modal-tabs)"]
     [:p.ty-text-.max-w-2xl {:style {:font-size "0.875rem" :line-height "1.7"}}
      "Each button below opens the modal first, then mounts a "
      [:code "ty-tabs"] " into it one frame later — already visible, defaulting to "
      [:strong "tab 0"] " because " [:code "active"] " isn't set yet. After the given "
      "delay, the app corrects " [:code "active"] " to the real tab (\"Billing\"). "
      "A listener on the live marker's own " [:code "transitionrun"] " event proves whether "
      "that correction glided (bug) or snapped (fixed) — it doesn't rely on eyeballing it."]

     [:div.flex.flex-wrap.gap-3
      [:ty-button {:on {:click (fn [_] (start-scenario! 0))}} "Open → correct immediately (0ms)"]
      [:ty-button {:flavor "primary" :appearance "outlined"
                   :on {:click (fn [_] (start-scenario! 50))}} "Open → correct after 50ms"]
      [:ty-button {:flavor "primary" :appearance "outlined"
                   :on {:click (fn [_] (start-scenario! 500))}} "Open → correct after 500ms"]]

     [:ty-modal#smt-modal {:open open? :on {:close close!}}
      [:div.ty-elevated.rounded-lg.p-6 {:style {:width "26rem" :max-width "90vw"}}
       [:h3.ty-text {:style {:font-size "1rem" :font-weight "600" :margin-bottom "0.75rem"}}
        "Account settings"]
       (if tabs-mounted?
         ^{:key mount-id}
         [:ty-tabs {:active active-tab :width "100%" :height "150px"
                    :replicant/on-mount (fn [{^js el :replicant/node}] (attach-transition-watch! el))}
          (for [[id label] tab-defs]
            ^{:key id}
            [:ty-tab {:id id :label label}
             [:div.p-4.ty-text- {:style {:font-size "0.875rem"}} (str label " panel")]])]
         [:div.ty-text-.p-4 {:style {:font-size "0.8125rem"}} "(tabs not mounted yet…)"])
       [:div.flex.justify-end {:style {:margin-top "1rem"}}
        [:ty-button {:flavor "neutral" :on {:click close!}} "Close"]]]]

     [:div.ty-content.rounded-lg.p-4.space-y-2
      [:div.flex.items-center.justify-between
       [:p.ty-text.font-semibold {:style {:font-size "0.8125rem"}} "Event log"]
       [:span.ty-text-- {:style {:font-size "0.7rem"}} (str "mount #" mount-id)]]
      [:pre.ty-text- {:style {:font-size "0.75rem" :line-height "1.6" :white-space "pre-wrap"
                              :min-height "3rem" :margin 0}}
       (if (seq log) (clojure.string/join "\n" log) "(nothing yet — open the modal above)")]]

     (verdict-banner verdict)]))
