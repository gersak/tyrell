(ns hello.views.modals
  "UIx modals & overlays demos: tooltips, a popup with a form, modals"
  (:require
    ["tyrell-react" :as ty]
    [uix.core :as uix :refer [defui $ use-state use-effect use-ref]]))

(defui demo-card [{:keys [title description children]}]
  ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.space-y-4
     ($ :div
        ($ :h3.ty-text++.text-lg.font-semibold title)
        (when description ($ :p.text-sm.ty-text- description)))
     children))

;; =============================================================================
;; Tooltips — a ty-tooltip shows for its parent element
;; =============================================================================

(defui tooltip-placement-demo []
  ($ demo-card {:title "Tooltip placements"}
     ($ :div.flex.flex-wrap.gap-4
        (for [placement ["top" "bottom" "left" "right"]]
          ($ ty/Button {:key placement :flavor "neutral" :appearance "outlined"}
             placement
             ($ ty/Tooltip {:placement placement} (str placement " tooltip")))))))

(defui tooltip-flavors-demo []
  ($ demo-card {:title "Tooltip flavors"
                :description "Neutral is the default dark chip; the semantic flavors are solid fills."}
     ($ :div.flex.flex-wrap.gap-3
        (for [[flavor text] [["neutral" "Additional information"]
                             ["primary" "Primary information"]
                             ["success" "Operation successful"]
                             ["warning" "Double-check this"]
                             ["danger" "Please be careful"]]]
          ($ ty/Button {:key flavor :flavor flavor}
             flavor
             ($ ty/Tooltip {:flavor flavor} text))))))

(defui rich-tooltip-demo []
  ($ demo-card {:title "Rich content"}
     ($ :div.flex.flex-wrap.gap-4
        ($ ty/Button {:flavor "neutral" :appearance "outlined"}
           "HTML content"
           ($ ty/Tooltip
              ($ :div ($ :strong "Bold text") ($ :br) ($ :em "Italic text"))))
        ($ ty/Button {:flavor "neutral" :appearance "outlined"}
           "Long text"
           ($ ty/Tooltip
              "A longer tooltip wraps on its own once it reaches its maximum width, so long help text stays readable."))
        ($ ty/Button {:flavor "neutral" :appearance "outlined"}
           ($ ty/Icon {:slot "start" :name "save"})
           "Save"
           ($ ty/Tooltip
              ($ :div
                 ($ :div.font-semibold "Save your work")
                 ($ :div.text-xs "Keyboard: ⌘+S"))))
        ($ ty/Button {:flavor "danger" :appearance "outlined"}
           ($ ty/Icon {:slot "start" :name "trash-2"})
           "Delete"
           ($ ty/Tooltip {:flavor "danger"}
              ($ :div ($ :strong "Warning!") ($ :br) "This can't be undone"))))))

(defui advanced-tooltip-demo []
  ($ demo-card {:title "Delays, disabled, any element"}
     ($ :div.flex.flex-wrap.gap-4.items-center
        ($ ty/Button {:flavor "primary" :appearance "outlined"}
           "Quick (100ms)"
           ($ ty/Tooltip {:delay 100} "Quick tooltip"))
        ($ ty/Button {:flavor "primary" :appearance "outlined"}
           "Slow (1000ms)"
           ($ ty/Tooltip {:delay 1000} "Slow tooltip"))
        ($ ty/Button {:flavor "neutral" :appearance "outlined"}
           "Disabled tooltip"
           ($ ty/Tooltip {:disabled true} "You won't see this"))
        ($ ty/Tag {:flavor "primary"}
           "Tag"
           ($ ty/Tooltip "Works on any element"))
        ($ :a.ty-text-primary.underline {:href "#" :on-click #(.preventDefault %)}
           "A link"
           ($ ty/Tooltip "Links can have tooltips too"))
        ($ :span.inline-flex.items-center.justify-center.w-10.h-10.rounded-lg.ty-bg-primary-.ty-text-primary++
           ($ ty/Icon {:name "star"})
           ($ ty/Tooltip "Even plain elements")))))

;; =============================================================================
;; Popup with a form — ty-popup anchors to its parent element and toggles on
;; a click there; a ref closes it after a successful submit
;; =============================================================================

(defui popup-form-demo []
  (let [[sent set-sent] (use-state nil)
        popup-ref (use-ref nil)]
    ($ demo-card {:title "Popup with a form"
                  :description "The popup is a child of its anchor. The form inside validates like any other."}
       ($ :div.flex.items-center.gap-4
          ($ :div.inline-block
             ($ ty/Button {:type "button" :flavor "primary"}
                ($ ty/Icon {:slot "start" :name "plus"})
                "Invite a teammate")
             ($ ty/Popup {:ref popup-ref :placement "bottom-start"}
                ($ :form.ty-floating.rounded-xl.p-5.w-80.space-y-4
                   {:on-submit (fn [^js e]
                                 (.preventDefault e)
                                 (set-sent (.get (js/FormData. (.-currentTarget e)) "email"))
                                 (when-let [^js el @popup-ref] (.closePopup el)))}
                   ($ :h4.ty-text++.font-semibold "Invite a teammate")
                   ($ ty/Input {:name "email" :type "email" :label "Email" :required true
                                :placeholder "name@company.com"})
                   ($ ty/Select {:name "role" :label "Role" :value "member"}
                      ($ ty/Option {:value "member"} "Member")
                      ($ ty/Option {:value "admin"} "Admin")
                      ($ ty/Option {:value "viewer"} "Viewer"))
                   ($ :label.flex.items-center.gap-2.text-sm.ty-text
                      ($ ty/Checkbox {:name "notify" :checked true})
                      "Email them an invitation")
                   ($ :div.flex.justify-end
                      ($ ty/Button {:type "submit" :flavor "primary"} "Send invite")))))
          (when sent
            ($ :span.text-sm.ty-text-success (str "Invited " sent)))))))

;; =============================================================================
;; Modals — controlled with :open, kept in sync with :on-close
;; =============================================================================

(defui modal-panel [{:keys [children class]}]
  ($ :div.ty-floating.rounded-2xl.p-6.space-y-4 {:class class :style {:width "min(32rem, 92vw)"}}
     children))

(defui basic-modal-demo []
  (let [[open? set-open] (use-state false)]
    ($ demo-card {:title "Basic modal"
                  :description "Escape, a backdrop click, the ✕ or your own button closes it."}
       ($ ty/Button {:flavor "primary" :on-click #(set-open true)} "Open modal")
       ($ ty/Modal {:open open? :label "Welcome" :on-close #(set-open false)}
          ($ modal-panel
             ($ :h2.ty-text++.text-xl.font-bold "Welcome!")
             ($ :p.ty-text "This is a plain modal: a native dialog in the top layer. The panel inside is yours.")
             ($ :div.flex.justify-end
                ($ ty/Button {:flavor "primary" :on-click #(set-open false)} "Got it")))))))

(def ^:private task-tags
  [["bug" "Bug" "danger"] ["feature" "Feature" "primary"] ["docs" "Docs" "neutral"]
   ["enhancement" "Enhancement" "success"] ["urgent" "Urgent" "warning"]])

(defui modal-with-form-demo []
  (let [[open? set-open] (use-state false)
        [created set-created] (use-state nil)]
    ($ demo-card {:title "Modal with a form"
                  :description "Required fields, an email field and a multiple select with chips. Create only closes once the form is valid."}
       ($ :div.flex.items-center.gap-4
          ($ ty/Button {:flavor "success" :on-click #(set-open true)}
             ($ ty/Icon {:slot "start" :name "plus"})
             "Create task")
          (when created ($ :span.text-sm.ty-text-success (str "Created \"" created "\""))))
       ($ ty/Modal {:open open? :label "Create task" :prevent-outside-click true
                    :on-close #(set-open false)}
          ($ modal-panel
             ($ :form.space-y-4
                {:on-submit (fn [^js e]
                              (.preventDefault e)
                              (set-created (.get (js/FormData. (.-currentTarget e)) "title"))
                              (set-open false))}
                ($ :h2.ty-text++.text-xl.font-bold "Create task")
                ($ ty/Input {:name "title" :label "Title" :required true :placeholder "What needs doing?"})
                ($ ty/Textarea {:name "description" :label "Description" :required true :rows 3
                                :placeholder "Describe the task..."})
                ($ :div.grid.grid-cols-2.gap-4
                   ($ ty/Select {:name "priority" :label "Priority" :value "medium"}
                      ($ ty/Option {:value "low"} "Low")
                      ($ ty/Option {:value "medium"} "Medium")
                      ($ ty/Option {:value "high"} "High")
                      ($ ty/Option {:value "critical"} "Critical"))
                   ($ ty/Input {:name "assignee" :type "email" :label "Assignee" :required true
                                :placeholder "name@company.com"}))
                ($ ty/DatePicker {:name "due" :label "Due date"})
                ($ :div.space-y-2
                   ($ ty/Select {:id "task-tags" :name "tags" :label "Tags" :multiple true
                                 :placeholder "Add tags"}
                      (for [[v label flavor] task-tags]
                        ($ ty/Option {:key v :value v :flavor flavor} label)))
                   ($ :div.flex.flex-wrap.gap-2
                      ($ ty/SelectedOptions {:html-for "task-tags"})))
                ($ :div.flex.justify-end.gap-2.pt-2
                   ($ ty/Button {:type "button" :appearance "ghost" :on-click #(set-open false)} "Cancel")
                   ($ ty/Button {:type "submit" :flavor "success"} "Create task"))))))))

(defui warning-dialog-demo []
  (let [[open? set-open] (use-state false)
        [confirmed set-confirmed] (use-state false)]
    ($ demo-card {:title "Confirmation dialog"
                  :description "No backdrop-click close: only an explicit answer ends it."}
       (if confirmed
         ($ :div.ty-bg-success-.ty-border-success.border.rounded.p-4.flex.items-center.justify-between
            ($ :p.ty-text-success++.font-medium "✓ Deleted.")
            ($ ty/Button {:appearance "ghost" :on-click #(set-confirmed false)} "Undo"))
         ($ ty/Button {:flavor "danger" :on-click #(set-open true)}
            ($ ty/Icon {:slot "start" :name "trash-2"})
            "Delete all data"))
       ($ ty/Modal {:open open? :label "Delete all data" :prevent-outside-click true
                    :on-close #(set-open false)}
          ($ modal-panel {:class "text-center"}
             ($ :div.mx-auto.w-14.h-14.ty-bg-danger-.rounded-full.flex.items-center.justify-center
                ($ ty/Icon {:name "warning" :size "lg" :class "ty-text-danger++"}))
             ($ :h3.ty-text++.text-lg.font-bold "Delete all data?")
             ($ :p.ty-text- "This can't be undone. Everything is permanently deleted.")
             ($ :div.flex.gap-3.justify-center
                ($ ty/Button {:appearance "outlined" :flavor "neutral" :on-click #(set-open false)} "Cancel")
                ($ ty/Button {:flavor "danger"
                              :on-click (fn [] (set-open false) (set-confirmed true))}
                   "Yes, delete")))))))

(defui success-dialog-demo []
  (let [[open? set-open] (use-state false)
        [step set-step] (use-state 1)]
    ;; Walk through the steps only while the dialog is open
    (use-effect
      (fn []
        (when (and open? (< step 4))
          (let [timer (js/setTimeout #(set-step inc) 900)]
            #(js/clearTimeout timer))))
      [open? step])
    ($ demo-card {:title "Progress dialog"}
       ($ ty/Button {:flavor "primary" :on-click (fn [] (set-step 1) (set-open true))} "Complete setup")
       ($ ty/Modal {:open open? :label "Account setup" :on-close #(set-open false)}
          ($ modal-panel {:class "text-center"}
             (if (< step 4)
               ($ :<>
                  ($ :h3.ty-text++.text-lg.font-bold "Setting up your account…")
                  ($ :p.ty-text- (case step 1 "Creating your profile…" 2 "Configuring preferences…" "Finalizing setup…"))
                  ($ :div.w-full.ty-bg-neutral-.rounded-full.h-2
                     ($ :div.ty-bg-primary.h-2.rounded-full.transition-all.duration-500
                        {:style {:width (str (* step 33.33) "%")}})))
               ($ :<>
                  ($ :div.mx-auto.w-14.h-14.ty-bg-success-.rounded-full.flex.items-center.justify-center
                     ($ ty/Icon {:name "check" :size "lg" :class "ty-text-success++"}))
                  ($ :h3.ty-text++.text-lg.font-bold "Setup complete")
                  ($ :p.ty-text- "You're ready to start using the platform.")
                  ($ ty/Button {:flavor "success" :wide true :on-click #(set-open false)} "Get started"))))))))

(defui view []
  ($ :div.space-y-8.ty-text
     ($ :div
        ($ :h1.text-3xl.font-bold.mb-2.ty-text++ "Modals & Overlays")
        ($ :p.ty-text-.max-w-2xl
           "Tooltips, a popup with a form, and modals, all through the tyrell-react wrappers."))

     ($ :h2.text-2xl.font-bold.ty-text-primary "Tooltips")
     ($ tooltip-placement-demo)
     ($ tooltip-flavors-demo)
     ($ rich-tooltip-demo)
     ($ advanced-tooltip-demo)

     ($ :h2.text-2xl.font-bold.ty-text-primary "Popup")
     ($ popup-form-demo)

     ($ :h2.text-2xl.font-bold.ty-text-primary "Modals")
     ($ basic-modal-demo)
     ($ modal-with-form-demo)
     ($ warning-dialog-demo)
     ($ success-dialog-demo)))
