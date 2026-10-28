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

(defn- snippets [{:keys [backdrop outside escape zoom sheet]}]
  (let [attrs (str (when-not backdrop " no-backdrop")
                   (when-not outside " prevent-outside-click")
                   (when-not escape " prevent-escape")
                   (when-not zoom " no-zoom")
                   (when sheet " sheet"))]
    [["html" "HTML" "html"
      (str "<ty-button onclick=\"invite.show()\">Invite</ty-button>\n\n"
           "<ty-modal id=\"invite\" label=\"Invite people\"" attrs ">\n"
           "  <div class=\"panel\">\n    …\n"
           "    <ty-button onclick=\"invite.hide()\">Cancel</ty-button>\n  </div>\n</ty-modal>")]
     ["react" "React" "javascript"
      (str "import { TyModal } from 'tyrell-react'\n\n"
           "<TyModal open={open} label=\"Invite people\""
           (when-not backdrop " noBackdrop") (when-not outside " preventOutsideClick")
           (when-not escape " preventEscape") (when-not zoom " noZoom") (when sheet " sheet")
           "\n  onClose={() => setOpen(false)}>\n  <div className=\"panel\">…</div>\n</TyModal>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/Modal {:open @open? :label \"Invite people\""
           (when-not backdrop " :no-backdrop true") (when-not outside " :prevent-outside-click true")
           (when-not escape " :prevent-escape true") (when-not zoom " :no-zoom true") (when sheet " :sheet true")
           "\n              :on-close #(reset! open? false)}\n [:div.panel …]]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-modal {:open (when open? \"\") :label \"Invite people\""
           (when-not backdrop " :no-backdrop \"\"") (when-not outside " :prevent-outside-click \"\"")
           (when-not escape " :prevent-escape \"\"") (when-not zoom " :no-zoom \"\"") (when sheet " :sheet \"\"")
           "\n            :on {:close #(set-open! false)}}\n [:div.panel …]]")]
     ["datastar" "Datastar" "html"
      (str "<ty-button data-signals:invite-open=\"false\"\n  data-on:click=\"$inviteOpen = true\">Invite</ty-button>\n\n"
           "<ty-modal label=\"Invite people\"" attrs
           "\n  data-attr:open=\"$inviteOpen\"\n  data-on:close=\"$inviteOpen = false\">\n"
           "  <div class=\"panel\">\n    …\n"
           "    <ty-button data-on:click=\"$inviteOpen = false\">Cancel</ty-button>\n  </div>\n</ty-modal>")]]))

(defn- render-playground [{:keys [backdrop outside escape zoom sheet]}]
  [:div.flex.flex-col.items-center.gap-3
   [:ty-button {:flavor "primary" :size "md" :on {:click #(open! :play)}}
    [:ty-icon {:slot "start" :name "user-plus"}] "Invite people"]
   [:code.ty-text-.text-xs (str "last close reason: " (or (doc-state :reason) "—"))]
   (modal :play (cond-> {:label "Invite people"}
                  (not backdrop) (assoc :no-backdrop "")
                  (not outside) (assoc :prevent-outside-click "")
                  (not escape) (assoc :prevent-escape "")
                  (not zoom) (assoc :no-zoom "")
                  sheet (assoc :sheet ""))
          (panel (title "Invite people" "They'll get an email with a link to this workspace.")
                 [:ty-input {:label "Email" :type "email" :placeholder "name@company.com"}]
                 (actions [:ty-button {:appearance "ghost" :size "md" :on {:click #(hide! :play)}} "Cancel"]
                          [:ty-button {:flavor "primary" :size "md" :on {:click #(hide! :play)}} "Send invite"])))])

(def ^:private guard-snippets
  "Guard unsaved changes: cancel beforeclose, ask, then hide({force: true})."
  [["html" "HTML" "html"
    "<ty-modal id=\"note\" label=\"Edit note\">…</ty-modal>

<script>
  const modal = document.getElementById('note');
  modal.addEventListener('beforeclose', (e) => {
    if (!dirty) return;
    e.preventDefault();          // stay open
    askToDiscard().then((yes) => {
      if (yes) modal.hide({ force: true });
    });
  });
</script>"]
   ["react" "React" "javascript"
    "import { useRef } from 'react'
import { TyModal } from 'tyrell-react'

const modal = useRef(null)

<TyModal ref={modal} label=\"Edit note\"
  onBeforeClose={(e) => {
    if (!dirty) return
    e.preventDefault()           // stay open
    askToDiscard().then((yes) => yes && modal.current.hide({ force: true }))
  }}>…</TyModal>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Modal
 {:ref #(reset! modal %) :label \"Edit note\"
  :on-before-close (fn [e]
                     (when @dirty?
                       (.preventDefault e)   ; stay open
                       (-> (ask-to-discard)
                           (.then #(when % (.hide @modal #js {:force true}))))))}
 …]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-modal
 {:label \"Edit note\"
  :on {:beforeclose (fn [e]
                      (when dirty?
                        (.preventDefault e)   ; stay open
                        (let [modal (.-currentTarget e)]
                          (-> (ask-to-discard)
                              (.then #(when % (.hide modal #js {:force true})))))))}}
 …]"]
   ["datastar" "Datastar" "html"
    "<ty-modal label=\"Edit note\" data-signals:asking=\"false\"
  data-on:beforeclose=\"$dirty && (evt.preventDefault(), $asking = true)\">
  …
  <div data-show=\"$asking\">
    Discard your changes?
    <ty-button data-on:click=\"$asking = false; el.closest('ty-modal').hide({force: true})\">
      Discard
    </ty-button>
  </div>
</ty-modal>"]])

(def ^:private reason-snippets
  "Close reasons: e.detail.reason on close."
  [["html" "HTML" "html"
    "<ty-modal id=\"why\">…</ty-modal>

<script>
  document.getElementById('why')
    .addEventListener('close', (e) => log(e.detail.reason));
</script>"]
   ["react" "React" "javascript"
    "import { TyModal } from 'tyrell-react'

<TyModal onClose={(e) => log(e.detail.reason)}>…</TyModal>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Modal {:on-close #(log (.. % -detail -reason))} …]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-modal {:on {:close #(log (.. % -detail -reason))}} …]"]
   ["datastar" "Datastar" "html"
    "<ty-modal data-on:close=\"$reason = evt.detail.reason\">…</ty-modal>"]])

(def ^:private api-snippets
  "Methods, the open property and the open/close events."
  [["html" "HTML" "html"
    "<ty-modal id=\"invite\">…</ty-modal>

<script>
  const modal = document.getElementById('invite');

  modal.show();
  modal.hide();                    // fires beforeclose first
  modal.hide({ force: true });     // skips beforeclose
  modal.open = true;               // same as the open attribute

  modal.addEventListener('open', () => focusFirstField());
  modal.addEventListener('close', (e) => console.log(e.detail.reason));
</script>"]
   ["react" "React" "javascript"
    "import { useRef } from 'react'
import { TyModal } from 'tyrell-react'

const modal = useRef(null)

<TyModal ref={modal} open={open}
  onOpen={() => focusFirstField()}
  onClose={(e) => { setOpen(false); console.log(e.detail.reason) }}>…</TyModal>

modal.current.show()
modal.current.hide()                   // fires beforeclose first
modal.current.hide({ force: true })    // skips beforeclose"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Modal {:ref #(reset! modal %) :open @open?
              :on-open #(focus-first-field!)
              :on-close #(do (reset! open? false)
                             (js/console.log (.. % -detail -reason)))}
 …]

(.show @modal)
(.hide @modal #js {:force true})       ; skips beforeclose"]
   ["replicant" "Replicant" "clojure"
    "[:ty-modal {:open (when open? \"\")
            :on {:open #(focus-first-field!)
                 :close #(do (set-open! false)
                             (js/console.log (.. % -detail -reason)))}}
 …]
;; open and close by rendering :open"]
   ["datastar" "Datastar" "html"
    "<ty-button data-on:click=\"$open = true\">Invite</ty-button>

<ty-modal data-signals:open=\"false\" data-attr:open=\"$open\"
  data-on:open=\"@get('/invite/form')\"
  data-on:close=\"$open = false; console.log(evt.detail.reason)\">
  …
</ty-modal>"]])

(defn view []
  (component-page
   {:title "Modal"
    :group "Overlays"
    :tag "ty-modal"
    :description "A native <dialog> in the top layer: focus trap, scroll lock, Escape and backdrop close. It's an invisible frame; the panel inside is yours."
    :chips [["Top layer" "layers"] ["Keyboard" "zap"] ["TyModal (React)" "atom"]]
    :source "packages/core/src/components/modal.ts"
    :mark "▣"
    :demo (let [deleted? (= :deleted (doc-state :hero))]
            [:div.flex.items-center.justify-between.gap-4.p-2 {:style {:width "340px"}}
             [:div.flex.items-center.gap-3.min-w-0
              [:ty-icon.ty-text- {:name (if deleted? "trash-2" "book-open") :size "lg"}]
              [:div.flex.flex-col.min-w-0
               [:span.font-semibold.ty-text++.truncate "Tyrell docs"]
               [:span.text-xs.ty-text-.whitespace-nowrap (if deleted? "Project deleted" "12 pages")]]]
             (if deleted?
               [:ty-button {:replicant/key "restore" :appearance "ghost" :size "md"
                            :on {:click #(set-doc! :hero nil)}} "Restore"]
               [:ty-button {:replicant/key "delete" :flavor "danger" :appearance "outlined" :size "md"
                            :on {:click #(open! :hero)}} "Delete project…"])
             (modal :hero {:label "Delete project?"}
                    (panel (title "Delete project?" "Everything in \"Tyrell docs\" goes with it.")
                           (actions [:ty-button {:appearance "ghost" :size "md" :on {:click #(hide! :hero)}} "Cancel"]
                                    [:ty-button {:flavor "danger" :size "md"
                                                 :on {:click #(do (set-doc! :hero :deleted) (hide! :hero))}} "Delete"])))])}

   (playground
    {:id :modal
     :defaults {:backdrop true :outside true :escape true :zoom true :sheet false}
     :controls [{:key :backdrop :switch? true}
                {:key :outside :switch? true}
                {:key :escape :switch? true}
                {:key :zoom :switch? true}
                {:key :sheet :switch? true}]
     :sub "Open it, then close it every way you can. outside = backdrop click closes; zoom = the page behind scales down; sheet = full screen on a phone."
     :render render-playground
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Guard unsaved changes"
       :span 4
       :description [:span [:code "beforeclose"] " is cancelable. Stop the close, ask, then close for real with "
                     [:code "hide({force: true})"] "."]
       :tabs guard-snippets}
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
       :tabs reason-snippets}
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
                     " don't bubble, like the native dialog events, so closing the inner one leaves the outer open. Cancel returns to settings; Delete closes both."]
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
                            (panel (title "Really delete?" "Cancel returns to settings.")
                                   (actions [:ty-button {:appearance "ghost" :size "md" :on {:click #(hide! :inner)}} "Cancel"]
                                            [:ty-button {:flavor "danger" :size "md" :on {:click #(do (hide! :inner) (hide! :outer))}} "Delete"])))))])

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
       :tabs api-snippets}
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
                  ["open" "boolean" "false" "Shown. The modal removes it when it closes itself. Closing closes anything still open inside: a select list, a date picker calendar, a popup, a nested modal."]
                  ["label" "string" "Accessible name of the dialog."]
                  "Closing"
                  ["prevent-outside-click" "boolean" "false" "Backdrop clicks don't close."]
                  ["prevent-escape" "boolean" "false" "Escape doesn't close."]
                  "Backdrop"
                  ["no-backdrop" "boolean" "false" "No dim and no zoom. Still a modal: the page behind isn't usable, a click outside closes it."]
                  ["no-zoom" "boolean" "false" "The page behind stays still instead of scaling down slightly."]
                  "Phones"
                  ["sheet" "boolean" "false" "Below 768px: full screen, sliding up from the bottom. The panel fills it, whatever width it sets itself."]]
     :properties [["show()" "() => void" "Open."]
                  ["hide(opts?)" "({force?}) => void" "Close. Fires beforeclose unless force is true."]]
     :events [["open" "{}" "Opened. Doesn't bubble: listen on the element."]
              ["beforeclose" "{reason}" "About to close. preventDefault() keeps it open."]
              ["close" "{reason, returnValue?}" "Closed. reason: backdrop, escape, close-button, programmatic or native. Doesn't bubble."]]
     :keyboard [["Esc" "Close, unless prevent-escape. A popup open inside (a select list, a date picker, a ty-popup, a nested modal) closes first."]
                ["Tab" "Cycles inside the dialog; the page behind is inert."]]
     :css-vars [["--ty-modal-backdrop" "Backdrop color."]
                ["--ty-modal-backdrop-blur" "Backdrop blur."]
                ["--ty-modal-duration" "Enter animation length."]]
     :parts [["dialog" "The <dialog> itself: size, position, padding. ty-modal::part(dialog) { … }"]]})))
