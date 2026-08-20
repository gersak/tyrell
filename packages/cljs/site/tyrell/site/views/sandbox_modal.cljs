(ns tyrell.site.views.sandbox-modal
  "Hidden verification page — /internal/modal. NOT linked from nav or search.

   Verifies the prevent-escape / prevent-outside-click presence-boolean API
   (and that the older close-on-*=\"false\" form still works). Each card says
   what ESC and a backdrop click should do; the status line under the buttons
   prints every close event with its reason, so a modal that closes when it
   shouldn't is immediately visible.

   Delete once the API is settled and covered on the modal docs page.")

(defn- log-close!
  "Wire a close listener once per modal id; prints reason into #modal-log."
  [id]
  (when-let [m (.getElementById js/document id)]
    (when-not (.-tyLogged ^js m)
      (set! (.-tyLogged ^js m) true)
      (.addEventListener m "close"
                         (fn [^js e]
                           (when-let [out (.getElementById js/document "modal-log")]
                             (set! (.-textContent out)
                                   (str (.-textContent out)
                                        id " → close: " (.. e -detail -reason) "\n"))))))))

(defn- open! [id]
  (log-close! id)
  (.show ^js (.getElementById js/document id)))

(defn- panel [title & lines]
  [:div.ty-elevated.rounded-lg.p-6 {:style {:max-width "26rem"}}
   [:h3.ty-text {:style {:font-size "1rem" :font-weight "600" :margin-bottom "0.5rem"}} title]
   (into [:div.ty-text-.space-y-1 {:style {:font-size "0.8125rem" :line-height "1.6"}}]
         (map (fn [l] [:p l]) lines))
   [:div.flex.justify-end {:style {:margin-top "1rem"}}
    [:ty-button {:flavor "neutral"
                 :on {:click (fn [^js e] (.hide ^js (.closest (.-target e) "ty-modal")))}}
     "Close"]]])

(defn- demo-card [{:keys [title attrs markup esc outside]}]
  (let [id (str "sbm-" (hash title))]
    [:div.ty-content.rounded-lg.p-5.space-y-3
     [:h2.ty-text.font-semibold {:style {:font-size "0.9rem"}} title]
     [:code.ty-text-- {:style {:font-size "0.72rem"}} markup]
     [:p {:style {:font-size "0.8125rem" :line-height "1.6"}}
      [:span.ty-text-primary [:strong "ESC: "] esc] " · "
      [:span.ty-text-primary [:strong "outside click: "] outside]]
     [:ty-button {:on {:click #(open! id)}} "Open"]
     [:ty-modal (assoc attrs :id id)
      (panel title
             (str "ESC should " esc ".")
             (str "Backdrop click should " outside ".")
             "Either way, the Close button always works.")]]))

(defn view []
  [:div.p-6.max-w-3xl.mx-auto.space-y-6
   [:h1.text-2xl.font-bold.ty-text "prevent-* modal API (hidden — /internal/modal)"]
   [:p.ty-text-.max-w-2xl {:style {:font-size "0.875rem" :line-height "1.7"}}
    "Presence booleans name the deviation from the default, like native "
    [:code "disabled"] ": bare " [:code "prevent-escape"] " / "
    [:code "prevent-outside-click"] " turn a close path off. The old "
    [:code "close-on-*=\"false\""] " form must keep working. Every close event "
    "prints below with its reason — if a guarded modal closes, you'll see it."]
   [:p.ty-text-.max-w-2xl {:style {:font-size "0.8125rem" :line-height "1.7"}}
    [:strong "Double-ESC check: "] "browsers only allow ONE close request to be "
    "canceled — a second consecutive ESC used to force-close with reason "
    [:code "native"] " (CloseWatcher anti-trap). Guarded modals now consume the "
    "keydown so no close request is generated: hammer ESC on cards 3–5, they must "
    "never close. The Android back gesture stays force-closable on purpose."]

   [:div.space-y-4
    (demo-card {:title "Default — both close paths live"
                :attrs {}
                :markup "<ty-modal>"
                :esc "close (reason: escape)"
                :outside "close (reason: backdrop)"})

    (demo-card {:title "prevent-outside-click"
                :attrs {:prevent-outside-click true}
                :markup "<ty-modal prevent-outside-click>"
                :esc "close"
                :outside "do NOTHING"})

    (demo-card {:title "prevent-escape"
                :attrs {:prevent-escape true}
                :markup "<ty-modal prevent-escape>"
                :esc "do NOTHING"
                :outside "close"})

    (demo-card {:title "Both — fully guarded"
                :attrs {:prevent-escape true :prevent-outside-click true}
                :markup "<ty-modal prevent-escape prevent-outside-click>"
                :esc "do NOTHING"
                :outside "do NOTHING"})

    (demo-card {:title "Legacy form still works"
                :attrs {:close-on-escape "false"}
                :markup "<ty-modal close-on-escape=\"false\">"
                :esc "do NOTHING"
                :outside "close"})]

   [:div.ty-content.rounded-lg.p-5.space-y-2
    [:div.flex.items-center.justify-between
     [:h2.ty-text.font-semibold {:style {:font-size "0.9rem"}} "Close events"]
     [:ty-button {:size "sm" :flavor "neutral"
                  :on {:click #(set! (.-textContent (.getElementById js/document "modal-log")) "")}}
      "Clear"]]
    [:pre#modal-log.ty-text- {:style {:font-size "0.75rem" :min-height "4rem"
                                      :white-space "pre-wrap" :margin 0}}]]])
