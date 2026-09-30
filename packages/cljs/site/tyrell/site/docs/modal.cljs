(ns tyrell.site.docs.modal
  "Documentation for ty-modal component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(defn- doc-state [k] (get-in @state/state [:modal-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:modal-doc k] v))

(defn- modal
  "A ty-modal whose open state lives in the docs atom under k.
   close doesn't bubble, so it's listened for on the element itself."
  [k attrs & content]
  (into [:ty-modal (cond-> (merge {:id (str "doc-modal-" (name k))
                                   :on {:close (fn [^js e]
                                                 (set-doc! [:open k] false)
                                                 (set-doc! :reason (.. e -detail -reason)))}}
                                  attrs)
                     (get-in @state/state [:modal-doc [:open k]]) (assoc :open ""))]
        content))

(defn- open! [k] (set-doc! [:open k] true))
(defn- hide! [k & [force?]]
  (some-> (js/document.getElementById (str "doc-modal-" (name k)))
          (.hide (when force? #js {:force true}))))

(defn- panel
  "The dialog surface. ty-modal is an invisible frame; this is yours."
  [& children]
  (into [:div.ty-floating.rounded-2xl.p-6.flex.flex-col.gap-4 {:style {:width "min(26rem, 88vw)"}}] children))

(defn- title [t sub]
  [:div.flex.flex-col.gap-1
   [:h3.text-lg.font-semibold.ty-text++ t]
   (when sub [:p.text-sm.ty-text- sub])])

(defn- actions [& buttons]
  (into [:div.flex.justify-end.gap-2.pt-2] buttons))

(defn- snippets [{:keys [backdrop outside escape zoom]}]
  (let [attrs (str (when-not backdrop " backdrop=\"false\"")
                   (when-not outside " prevent-outside-click")
                   (when-not escape " prevent-escape")
                   (when zoom " backdrop-zoom"))]
    [["html" "HTML" "html"
      (str "<ty-button onclick=\"invite.show()\">Invite</ty-button>\n\n"
           "<ty-modal id=\"invite\" label=\"Invite people\"" attrs ">\n"
           "  <div class=\"panel\">\n    …\n"
           "    <ty-button onclick=\"invite.hide()\">Cancel</ty-button>\n  </div>\n</ty-modal>")]
     ["react" "React" "javascript"
      (str "import { TyModal } from 'tyrell-react'\n\n"
           "<TyModal open={open} label=\"Invite people\"" attrs
           "\n  onClose={() => setOpen(false)}>\n  <div className=\"panel\">…</div>\n</TyModal>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/Modal {:open @open? :label \"Invite people\""
           (when-not backdrop " :backdrop false") (when-not outside " :prevent-outside-click true")
           (when-not escape " :prevent-escape true") (when zoom " :backdrop-zoom true")
           "\n              :on-close #(reset! open? false)}\n [:div.panel …]]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-modal {:open (when open? \"\") :label \"Invite people\""
           (when-not backdrop " :backdrop \"false\"") (when-not outside " :prevent-outside-click \"\"")
           (when-not escape " :prevent-escape \"\"") (when zoom " :backdrop-zoom \"\"")
           "\n            :on {:close #(set-open! false)}}\n [:div.panel …]]")]
     ["datastar" "Datastar" "html"
      (str "<ty-modal data-attr:open=\"$inviteOpen\"" attrs
           "\n  data-on:close=\"$inviteOpen = false\">\n  …\n</ty-modal>")]]))

(defn- render-playground [{:keys [backdrop outside escape zoom]}]
  [:div.flex.flex-col.items-center.gap-3
   [:ty-button {:flavor "primary" :size "md" :on {:click #(open! :play)}}
    [:ty-icon {:slot "start" :name "user-plus"}] "Invite people"]
   [:code.ty-text-.text-xs (str "last close reason: " (or (doc-state :reason) "—"))]
   (modal :play (cond-> {:label "Invite people"}
                  (not backdrop) (assoc :backdrop "false")
                  (not outside) (assoc :prevent-outside-click "")
                  (not escape) (assoc :prevent-escape "")
                  zoom (assoc :backdrop-zoom ""))
          (panel (title "Invite people" "They'll get an email with a link to this workspace.")
                 [:ty-input {:label "Email" :type "email" :placeholder "name@company.com"}]
                 (actions [:ty-button {:appearance "ghost" :size "md" :on {:click #(hide! :play)}} "Cancel"]
                          [:ty-button {:flavor "primary" :size "md" :on {:click #(hide! :play)}} "Send invite"])))])

(defn view []
  (component-page
   {:title "Modal"
    :group "Overlays"
    :tag "ty-modal"
    :description "A native <dialog> in the top layer: focus trap, scroll lock, Escape and backdrop close. It's an invisible frame; the panel inside is yours."
    :chips [["Top layer" "layers"] ["Keyboard" "zap"] ["TyModal (React)" "atom"]]
    :source "packages/core/src/components/modal.ts"
    :mark "▣"
    :demo [:div.ty-floating.rounded-2xl.p-6.flex.flex-col.gap-4 {:style {:width "320px"}}
           (title "Delete project?" "Everything in \"Tyrell docs\" goes with it. This can't be undone.")
           (actions [:ty-button {:appearance "ghost" :size "md"} "Cancel"]
                    [:ty-button {:flavor "danger" :size "md"} "Delete"])]}

   (playground
    {:id :modal
     :defaults {:backdrop true :outside true :escape true :zoom false}
     :controls [{:key :backdrop :switch? true}
                {:key :outside :switch? true}
                {:key :escape :switch? true}
                {:key :zoom :switch? true}]
     :sub "Open it, then close it every way you can. outside = backdrop click closes; zoom = backdrop-zoom."
     :render render-playground
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Guard unsaved changes"
       :span 4
       :lang "javascript"
       :description [:span [:code "beforeclose"] " is cancelable. Stop the close, ask, then close for real with "
                     [:code "hide({force: true})"] "."]
       :code "modal.addEventListener('beforeclose', (e) => {
  if (!dirty) return;
  e.preventDefault();          // stay open
  askToDiscard().then((yes) => {
    if (yes) modal.hide({ force: true });
  });
});"}
      (let [confirm? (doc-state :confirm)]
        [:div
         [:ty-button {:size "md" :on {:click #(do (set-doc! :confirm false) (open! :guard))}}
          [:ty-icon {:slot "start" :name "edit"}] "Edit note"]
         (modal :guard {:label "Edit note"
                        :on {:close #(set-doc! [:open :guard] false)
                             :beforeclose (fn [^js e]
                                            (when-not (doc-state :confirm)
                                              (.preventDefault e)
                                              (set-doc! :confirm true)))}}
                (panel (title "Edit note" "Try Escape or the backdrop.")
                       [:ty-textarea {:value "Unsaved thoughts about the calendar…" :rows "3"}]
                       (if confirm?
                         [:div.flex.items-center.justify-between.gap-3.rounded-lg.p-3.ty-bg-warning-
                          [:span.text-sm.ty-text+ "Discard your changes?"]
                          [:div.flex.gap-2
                           [:ty-button {:size "sm" :appearance "ghost" :on {:click #(set-doc! :confirm false)}} "Keep editing"]
                           [:ty-button {:size "sm" :flavor "danger" :on {:click #(hide! :guard true)}} "Discard"]]]
                         (actions [:ty-button {:flavor "primary" :size "md" :on {:click #(hide! :guard true)}} "Save"]))))]))

     (example
      {:title "Close reasons"
       :span 2
       :description [:span [:code "close"] " says how: backdrop, escape, close-button or programmatic."]
       :code "modal.addEventListener('close',
  (e) => log(e.detail.reason));"}
      [:div.flex.flex-col.items-start.gap-3
       [:ty-button {:size "md" :on {:click #(open! :why)}} "Open"]
       [:code.ty-text-.text-xs (str "reason: " (or (doc-state :reason) "—"))]
       (modal :why {:label "Close me"}
              (panel (title "Close me" "Backdrop, Escape, or the button.")
                     (actions [:ty-button {:size "md" :on {:click #(hide! :why)}} "Close"])))])

     (example
      {:title "Nested"
       :span 3
       :description [:span "A modal can open another. " [:code "open"] " and " [:code "close"]
                     " don't bubble, like the native dialog events, so closing the inner one leaves the outer open."]
       :code "<ty-modal id=\"outer\">
  …
  <ty-modal id=\"inner\">…</ty-modal>
</ty-modal>"}
      [:div
       [:ty-button {:size "md" :on {:click #(open! :outer)}} "Open settings"]
       (modal :outer {:label "Settings"}
              (panel (title "Settings" nil)
                     [:ty-input {:label "Workspace name" :value "Tyrell"}]
                     (actions [:ty-button {:flavor "danger" :appearance "outlined" :size "md" :on {:click #(open! :inner)}} "Delete workspace…"]
                              [:ty-button {:size "md" :on {:click #(hide! :outer)}} "Done"])
                     (modal :inner {:label "Confirm delete"}
                            (panel (title "Really delete?" "The settings modal stays open behind this one.")
                                   (actions [:ty-button {:appearance "ghost" :size "md" :on {:click #(hide! :inner)}} "Cancel"]
                                            [:ty-button {:flavor "danger" :size "md" :on {:click #(hide! :inner)}} "Delete"])))))])

     (example
      {:title "Locked"
       :span 3
       :description [:span [:code "prevent-outside-click"] " and " [:code "prevent-escape"]
                     " for flows the user must finish or cancel explicitly."]
       :code "<ty-modal prevent-outside-click
  prevent-escape>"}
      [:div
       [:ty-button {:size "md" :on {:click #(open! :locked)}} "Start checkout"]
       (modal :locked {:label "Payment" :prevent-outside-click "" :prevent-escape ""}
              (panel (title "Payment" "Backdrop and Escape do nothing here.")
                     [:ty-input {:label "Card number" :placeholder "4242 4242 4242 4242"}]
                     (actions [:ty-button {:appearance "ghost" :size "md" :on {:click #(hide! :locked)}} "Cancel"]
                              [:ty-button {:flavor "primary" :size "md" :on {:click #(hide! :locked)}} "Pay"])))])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const modal = document.querySelector('ty-modal');

modal.show();
modal.hide();                    // fires beforeclose first
modal.hide({ force: true });     // skips beforeclose
modal.open = true;               // same as the open attribute

modal.addEventListener('open', () => focusFirstField());
modal.addEventListener('close', (e) => console.log(e.detail.reason));"}
      nil)))

   (page-section
    {:title "Theming" :sub "Backdrop and motion." :dark? true}
    (example
     {:title "Backdrop"
      :side? true
      :lang "css"
      :description "Color, blur and the enter animation length. Scope them to one modal or set them globally."
      :code "ty-modal {
  --ty-modal-backdrop: rgb(12 31 29 / 0.7);
  --ty-modal-backdrop-blur: 6px;
  --ty-modal-duration: 320ms;
}"}
     [:div
      [:ty-button {:size "md" :on {:click #(open! :themed)}} "Open themed modal"]
      (modal :themed {:label "Themed" :style {"--ty-modal-backdrop" "rgb(12 31 29 / 0.7)"
                                              "--ty-modal-backdrop-blur" "6px"
                                              "--ty-modal-duration" "320ms"}}
             (panel (title "Teal backdrop" "Blurred, slower entrance.")
                    (actions [:ty-button {:size "md" :on {:click #(hide! :themed)}} "Close"])))]))

   (api-section
    {:attributes ["State"
                  ["open" "boolean" "false" "Shown. The modal removes it when it closes itself."]
                  ["label" "string" "Accessible name of the dialog."]
                  "Closing"
                  ["prevent-outside-click" "boolean" "false" "Backdrop clicks don't close."]
                  ["prevent-escape" "boolean" "false" "Escape doesn't close."]
                  "Backdrop"
                  ["backdrop" "boolean" "true" "Dim the page. backdrop=\"false\" for none."]
                  ["backdrop-zoom" "boolean" "false" "Scale the page behind slightly while open."]]
     :properties [["show()" "() => void" "Open."]
                  ["hide(opts?)" "({force?}) => void" "Close. Fires beforeclose unless force is true."]]
     :events [["open" "{}" "Opened. Doesn't bubble: listen on the element."]
              ["beforeclose" "{reason}" "About to close. preventDefault() keeps it open."]
              ["close" "{reason, returnValue?}" "Closed. reason: backdrop, escape, close-button, programmatic or native. Doesn't bubble."]]
     :keyboard [["Esc" "Close, unless prevent-escape."]
                ["Tab" "Cycles inside the dialog; the page behind is inert."]]
     :css-vars [["--ty-modal-backdrop" "Backdrop color."]
                ["--ty-modal-backdrop-blur" "Backdrop blur."]
                ["--ty-modal-duration" "Enter animation length."]]})))
