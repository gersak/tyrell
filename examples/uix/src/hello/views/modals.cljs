(ns hello.views.modals
  "UIx modals & overlays demos - tooltips, popups, modals with forms"
  (:require
    ["tyrell-react" :as ty]
    [uix.core :as uix :refer [defui $ use-state use-effect use-ref]]))

;; =============================================================================
;; Tooltip Demos
;; =============================================================================

(defui tooltip-placement-demo []
  "Shows all tooltip placement options"
  ($ :div.space-y-4
     ($ :h3.ty-text++.text-lg.font-semibold
        "Tooltip Placements")

     ($ :div.grid.grid-cols-2.md:grid-cols-4.gap-6.p-8
        ;; Top placement
        ($ :div.text-center
           ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
              "Top"
              ($ ty/Tooltip
                 {:placement "top"}
                 "Top tooltip")))

        ;; Bottom placement
        ($ :div.text-center
           ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
              "Bottom"
              ($ ty/Tooltip {:placement "bottom"}
                 "Bottom tooltip")))

        ;; Left placement
        ($ :div.text-center
           ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
              "Left"
              ($ ty/Tooltip
                 {:placement "left"}
                 "Left tooltip")))

        ;; Right placement
        ($ :div.text-center
           ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
              "Right"
              ($ ty/Tooltip {:placement "right"}
                 "Right tooltip"))))))

(defui tooltip-flavors-demo []
  "Shows all semantic tooltip flavors"
  ($ :div.space-y-4
     ($ :h3.ty-text++.text-lg.font-semibold
        "Tooltip Semantic Flavors")

     ($ :div.flex.gap-3.wrap
        ;; Primary
        ($ ty/Button
           {:flavor "primary"}
           "Primary"
           ($ ty/Tooltip {:flavor "primary"}
              "Primary information"))

        ;; Success
        ($ ty/Button
           {:flavor "success"}
           "Success"
           ($ ty/Tooltip
              {:flavor "success"}
              "Operation successful"))

        ;; Danger
        ($ ty/Button
           {:flavor "danger"}
           "Danger"
           ($ ty/Tooltip
              {:flavor "danger"}
              "Please be careful"))

        ;; Info/Neutral
        ($ ty/Button
           {:flavor "neutral"}
           "Info"
           ($ ty/Tooltip
              "Additional information available"))

        ;; Secondary
        ($ ty/Button
           {:flavor "secondary"}
           "Secondary"
           ($ ty/Tooltip
              {:flavor "secondary"}
              "Secondary action")))))

(defui rich-tooltip-demo []
  "Shows tooltips with rich content"
  ($ :div.space-y-4
     ($ :h3.ty-text++.text-lg.font-semibold
        "Rich Content Tooltips")

     ($ :div.flex.flex-wrap.gap-4
        ;; HTML content tooltip
        ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
           "HTML Content"
           ($ ty/Tooltip
              ($ :div
                 ($ :strong "Bold text")
                 ($ :br)
                 "Line break"
                 ($ :br)
                 ($ :em "Italic text"))))

        ;; Long text tooltip
        ($ :button.ty-bg-success.ty-text++.px-4.py-2.rounded
           "Long Text"
           ($ ty/Tooltip
              "This is a very long tooltip that demonstrates how tooltips handle longer text content and word wrapping automatically."))

        ;; Special characters
        ($ :button.ty-bg-warning.ty-text++.px-4.py-2.rounded
           "Special Chars"
           ($ ty/Tooltip
              "Special chars: ★ ♥ ✓ ➤ €"))

        ;; Multi-line structured content
        ($ :button.ty-bg-info.ty-text++.px-4.py-2.rounded
           "Multi-line"
           ($ ty/Tooltip
              ($ :div
                 ($ :div "Line 1: Important info")
                 ($ :div "Line 2: More details")
                 ($ :div.text-xs.opacity-75 "Line 3: Additional note"))))

        ;; With icon
        ($ :button.ty-bg-secondary.ty-text++.px-4.py-2.rounded
           "With Icon"
           ($ ty/Tooltip
              ($ :div.flex.items-center.gap-2
                 ($ ty/Icon {:name "info-circle"
                             :size "sm"})
                 ($ :span "Information tooltip with icon")))))))

(defui advanced-tooltip-demo []
  "Shows advanced tooltip features like delays and disabled states"
  ($ :div.space-y-4
     ($ :h3.ty-text++.text-lg.font-semibold
        "Advanced Tooltip Features")

     ($ :div.flex.flex-wrap.gap-4
        ;; Quick tooltip (custom delay)
        ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
           "Quick (100ms)"
           ($ ty/Tooltip {:delay "100"}
              "Quick tooltip"))

        ;; Default delay tooltip
        ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
           "Default (600ms)"
           ($ ty/Tooltip
              "Default tooltip"))

        ;; Slow tooltip
        ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
           "Slow (1000ms)"
           ($ ty/Tooltip {:delay "1000"}
              "Slow tooltip"))

        ;; Disabled tooltip
        ($ :button.ty-bg-neutral.ty-text++.px-4.py-2.rounded
           "Disabled Tooltip"
           ($ ty/Tooltip {:disabled true}
              "You won't see this"))

        ;; Complex content with keyboard shortcuts
        ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded.flex.items-center.gap-2
           ($ ty/Icon {:name "save"})
           "Save"
           ($ ty/Tooltip
              ($ :div
                 ($ :div.font-semibold.mb-1 "Save your work")
                 ($ :div.text-xs.opacity-75 "Keyboard: ⌘+S"))))

        ;; Warning tooltip
        ($ :button.ty-bg-danger.ty-text++.px-4.py-2.rounded.flex.items-center.gap-2
           ($ ty/Icon {:name "trash-2"})
           "Delete"
           ($ ty/Tooltip {:flavor "danger"}
              ($ :div
                 ($ :strong "Warning!")
                 ($ :br)
                 "This action cannot be undone"))))

     ;; Different element types with tooltips
     ($ :div
        ($ :h4.ty-text+.text-md.font-semibold.mb-2.mt-6
           "Tooltips on Different Elements")
        ($ :div.flex.flex-wrap.gap-4.items-center
           ;; Badge with tooltip
           ($ :span.inline-flex.items-center.px-3.py-1.rounded-full.text-sm.ty-bg-info.ty-text-info++
              "Badge"
              ($ ty/Tooltip "Works on any element"))

           ;; Link with tooltip  
           ($ :a.ty-text-primary.underline {:href "#"}
              "Link with tooltip"
              ($ ty/Tooltip "Links can have tooltips too"))

           ;; Custom element with tooltip
           ($ :div.w-12.h-12.bg-gradient-to-br.from-purple-500.to-pink-500.rounded-lg.flex.items-center.justify-center.text-white.cursor-pointer
              ($ ty/Icon {:name "star"})
              ($ ty/Tooltip "Even custom elements!"))))))

;; =============================================================================
;; Complex Popup with Form
;; =============================================================================

(defui complex-popup-demo []
  "Complex popup with registration form"
  (let [[show-popup set-show-popup] (use-state false)
        [loading set-loading] (use-state false)
        [form-data set-form-data] (use-state {:name ""
                                              :email ""
                                              :department "engineering"
                                              :role "developer"
                                              :notifications true
                                              :message ""})

        handle-submit (fn [e]
                        (.preventDefault e)
                        (set-loading true)
                        ;; Simulate API call
                        (js/setTimeout
                          (fn []
                            (set-loading false)
                            (set-show-popup false)
                            (set-form-data {:name ""
                                            :email ""
                                            :department "engineering"
                                            :role "developer"
                                            :notifications true
                                            :message ""})
                            (js/alert "Form submitted successfully!"))
                          1500))

        update-field (fn [field value]
                       (set-form-data #(assoc % field value)))]

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Complex Popup with Form")

       ($ :p.text-sm.ty-text-
          "Advanced popup containing a registration form with multiple input types.")

       ;; Trigger button
       ($ :button.ty-bg-primary.ty-text++.px-6.py-3.rounded-lg.font-medium.flex.items-center.gap-2
          {:on-click #(set-show-popup true)}
          ($ ty/Icon {:name "plus"})
          "Open Registration Form")

       ;; Popup
       ($ ty/Popup {:open (if show-popup "true" nil)
                    :placement "bottom"
                    :on-close #(set-show-popup false)}
          ;; Popup content with proper styling
          ($ :div.ty-elevated.rounded-lg.shadow-lg.p-6.w-96
             ($ :h3.ty-text++.text-lg.font-bold.mb-4
                "Registration Form")

             ($ :form.space-y-4 {:on-submit handle-submit}
                ;; Name
                ($ :div
                   ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                      "Full Name")
                   ($ ty/Input {:type "text"
                                :value (:name form-data)
                                :on-input #(update-field :name (.. % -target -value))
                                :placeholder "Enter your full name"
                                :class "w-full"}))

                ;; Email
                ($ :div
                   ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                      "Email Address")
                   ($ ty/Input {:type "email"
                                :value (:email form-data)
                                :on-input #(update-field :email (.. % -target -value))
                                :placeholder "your@email.com"
                                :class "w-full"}))

                ;; Department and Role
                ($ :div.grid.grid-cols-2.gap-3
                   ($ :div
                      ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                         "Department")
                      ($ ty/Dropdown {:value (:department form-data)
                                      :on-change #(update-field :department (.. ^js % -detail -option -value))
                                      :class "w-full"}
                         ($ ty/Option {:value "engineering"} "Engineering")
                         ($ ty/Option {:value "design"} "Design")
                         ($ ty/Option {:value "marketing"} "Marketing")
                         ($ ty/Option {:value "sales"} "Sales")))

                   ($ :div
                      ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                         "Role")
                      ($ ty/Dropdown {:value (:role form-data)
                                      :on-change #(update-field :role (.. ^js % -detail -option -value))
                                      :class "w-full"}
                         ($ ty/Option {:value "developer"} "Developer")
                         ($ ty/Option {:value "designer"} "Designer")
                         ($ ty/Option {:value "manager"} "Manager")
                         ($ ty/Option {:value "analyst"} "Analyst"))))

                ;; Notifications
                ($ :div.flex.items-center.gap-3
                   ($ :input.ty-input.rounded {:type "checkbox"
                                               :checked (:notifications form-data)
                                               :on-change #(update-field :notifications (.. % -target -checked))
                                               :id "notifications"})
                   ($ :label.text-sm.ty-text {:for "notifications"}
                      "Send me email notifications"))

                ;; Message
                ($ :div
                   ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                      "Message (Optional)")
                   ($ :textarea.w-full.ty-input.ty-border.border.rounded.resize-none.p-3
                      {:value (:message form-data)
                       :on-input #(update-field :message (.. % -target -value))
                       :placeholder "Tell us about yourself..."
                       :rows 3}))

                ;; Submit buttons
                ($ :div.flex.gap-3.pt-2
                   ($ :button.flex-1.ty-bg-neutral-.ty-text.px-4.py-2.rounded.font-medium
                      {:type "button"
                       :on-click #(set-show-popup false)}
                      "Cancel")

                   ($ :button.flex-1.ty-bg-primary.ty-text++.px-4.py-2.rounded.font-medium.flex.items-center.justify-center.gap-2
                      {:type "submit"
                       :disabled loading}
                      (when loading
                        ($ :div.w-4.h-4.border-2.border-current.border-t-transparent.rounded-full.animate-spin))
                      (if loading "Submitting..." "Submit")))))))))

;; =============================================================================
;; Modal Windows
;; =============================================================================

(defui basic-modal-demo []
  "Basic modal functionality"
  (let [[show-modal set-show-modal] (use-state false)]

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Basic Modal")

       ($ :p.text-sm.ty-text-
          "Simple modal with open/close functionality.")

       ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
          {:on-click #(set-show-modal true)}
          "Open Basic Modal")

       ($ ty/Modal
          {:open (if show-modal "true" nil)
           :on-close #(set-show-modal false)}
          ;; Modal content with proper styling
          ($ :div.ty-elevated.rounded-lg.shadow-xl.max-w-md.mx-auto.my-20.p-6.space-y-4
             ($ :h2.ty-text++.text-xl.font-bold
                "Welcome!")
             ($ :p.ty-text
                "This is a basic modal dialog. You can close it by clicking the X button, pressing Escape, or clicking outside the modal.")
             ($ :div.flex.gap-3.pt-4
                ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
                   {:on-click #(set-show-modal false)}
                   "Got it!")))))))

(defui modal-with-form-demo []
  "Modal containing a complex form"
  (let [[show-modal set-show-modal] (use-state false)
        [form-data set-form-data] (use-state {:title ""
                                              :description ""
                                              :priority "medium"
                                              :assignee ""
                                              :due-date ""
                                              :tags []})
        [errors set-errors] (use-state {})

        available-tags ["bug" "feature" "enhancement" "documentation" "urgent"]

        validate-form (fn [data]
                        (cond-> {}
                          (empty? (:title data))
                          (assoc :title "Title is required")

                          (empty? (:description data))
                          (assoc :description "Description is required")

                          (empty? (:assignee data))
                          (assoc :assignee "Assignee is required")))

        handle-submit (fn [e]
                        (.preventDefault e)
                        (let [validation-errors (validate-form form-data)]
                          (set-errors validation-errors)
                          (when (empty? validation-errors)
                            (js/alert (str "Task created: " (:title form-data)))
                            (set-show-modal false)
                            (set-form-data {:title ""
                                            :description ""
                                            :priority "medium"
                                            :assignee ""
                                            :due-date ""
                                            :tags []}))))

        update-field (fn [field value]
                       (set-form-data #(assoc % field value))
                       (when (get errors field)
                         (set-errors #(dissoc % field))))

        toggle-tag (fn [tag]
                     (set-form-data
                       #(update % :tags
                                (fn [current-tags]
                                  (if (some #{tag} current-tags)
                                    (remove #{tag} current-tags)
                                    (conj current-tags tag))))))]

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Modal with Complex Form")

       ($ :p.text-sm.ty-text-
          "Modal containing a task creation form with validation.")

       ($ :button.ty-bg-success.ty-text++.px-4.py-2.rounded
          {:on-click #(set-show-modal true)}
          "Create New Task")

       ($ ty/Modal {:open (if show-modal "true" nil)
                    :on-close #(set-show-modal false)}
          ;; Modal content with proper styling - larger for form
          ($ :div.ty-elevated.rounded-lg.shadow-xl.max-w-2xl.mx-auto.my-8.p-6
             ($ :h2.ty-text++.text-xl.font-bold.mb-6
                "Create New Task")

             ($ :form.space-y-4 {:on-submit handle-submit}
                ;; Title
                ($ :div
                   ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                      "Task Title *")
                   ($ ty/Input {:type "text"
                                :value (:title form-data)
                                :on-input #(update-field :title (.. % -target -value))
                                :placeholder "Enter task title"
                                :class (str "w-full " (when (:title errors) "ty-border-danger"))})
                   (when (:title errors)
                     ($ :p.text-sm.ty-text-danger.mt-1 (:title errors))))

                ;; Description
                ($ :div
                   ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                      "Description *")
                   ($ :textarea.w-full.ty-input.ty-border.border.rounded.resize-none.p-3
                      {:value (:description form-data)
                       :on-input #(update-field :description (.. % -target -value))
                       :placeholder "Describe the task..."
                       :rows 4
                       :class (when (:description errors) "ty-border-danger")})
                   (when (:description errors)
                     ($ :p.text-sm.ty-text-danger.mt-1 (:description errors))))

                ;; Priority and Assignee
                ($ :div.grid.grid-cols-2.gap-4
                   ($ :div
                      ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                         "Priority")
                      ($ ty/Dropdown {:value (:priority form-data)
                                      :on-change #(update-field :priority (.. ^js % -detail -option -value))
                                      :class "w-full"}
                         ($ ty/Option {:value "low"} "Low")
                         ($ ty/Option {:value "medium"} "Medium")
                         ($ ty/Option {:value "high"} "High")
                         ($ ty/Option {:value "critical"} "Critical")))

                   ($ :div
                      ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                         "Assignee *")
                      ($ ty/Input {:type "text"
                                   :value (:assignee form-data)
                                   :on-input #(update-field :assignee (.. ^js % -target -value))
                                   :placeholder "Enter assignee email"
                                   :class (str "w-full " (when (:assignee errors) "ty-border-danger"))})
                      (when (:assignee errors)
                        ($ :p.text-sm.ty-text-danger.mt-1 (:assignee errors)))))

                ;; Due date
                ($ :div
                   ($ :label.block.text-sm.font-medium.ty-text+.mb-1
                      "Due Date")
                   ($ ty/DatePicker
                      {:value (:due-date form-data)
                       :on-input #(update-field :due-date (.. ^js % -detail -value))}))

                ;; Tags
                ($ :div
                   ($ :label.block.text-sm.font-medium.ty-text+.mb-2
                      "Tags")
                   ($ :div.flex.flex-wrap.gap-2
                      (for [tag available-tags]
                        ($ :button.px-3.py-1.rounded.text-sm.border.transition-colors
                           {:key tag
                            :type "button"
                            :class (if (some #{tag} (:tags form-data))
                                     "ty-bg-primary ty-text++ ty-border-primary"
                                     "ty-border ty-text hover:ty-bg-neutral-")
                            :on-click #(toggle-tag tag)}
                           tag))))

                ;; Actions
                ($ :div.flex.gap-3.pt-6
                   ($ :button.flex-1.ty-bg-neutral-.ty-text.px-4.py-2.rounded.font-medium
                      {:type "button"
                       :on-click #(set-show-modal false)}
                      "Cancel")

                   ($ :button.flex-1.ty-bg-success.ty-text++.px-4.py-2.rounded.font-medium
                      {:type "submit"}
                      "Create Task"))))))))

;; =============================================================================
;; Dialog Windows (Warning & Success)
;; =============================================================================

(defui warning-dialog-demo []
  "Warning dialog with confirmation"
  (let [[show-dialog set-show-dialog] (use-state false)
        [confirmed set-confirmed] (use-state false)]

    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Warning Dialog")

       ($ :p.text-sm.ty-text-
          "Confirmation dialog for destructive actions.")

       (if confirmed
         ($ :div.ty-bg-success-.ty-border-success.border.rounded.p-4
            ($ :p.ty-text-success++.font-medium
               "✓ Action confirmed! The data has been deleted."))

         ($ :button.ty-bg-danger.ty-text++.px-4.py-2.rounded
            {:on-click #(set-show-dialog true)}
            "Delete All Data"))

       ($ ty/Modal {:open show-dialog
                    :on-close #(set-show-dialog false)
                    :backdrop "true"}
          ;; Modal content with proper styling - centered warning dialog
          ($ :div.ty-elevated.rounded-lg.shadow-xl.max-w-md.mx-auto.my-20.p-6.text-center
             ;; Warning icon
             ($ :div.mx-auto.w-16.h-16.ty-bg-danger-.rounded-full.flex.items-center.justify-center.mb-4
                ($ :svg.w-8.h-8.ty-text-danger++
                   {:viewBox "0 0 24 24"
                    :fill "none"
                    :stroke "currentColor"
                    :stroke-width "2"}
                   ($ :path {:d "M12 9v3.75m0 3.75h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"})))

             ($ :h3.ty-text++.text-lg.font-bold.mb-2
                "Delete All Data?")

             ($ :p.ty-text-.mb-6
                "This action cannot be undone. All your data will be permanently deleted from our servers.")

             ($ :div.flex.gap-3
                ($ :button.flex-1.ty-bg-neutral-.ty-text.px-4.py-2.rounded.font-medium
                   {:on-click #(set-show-dialog false)}
                   "Cancel")

                ($ :button.flex-1.ty-bg-danger.ty-text++.px-4.py-2.rounded.font-medium
                   {:on-click (fn []
                                (set-show-dialog false)
                                (set-confirmed true))}
                   "Yes, Delete All")))))))

(defui success-dialog-demo []
  "Success dialog with celebration"
  (let [[show-dialog set-show-dialog] (use-state false)
        [step set-step] (use-state 1)]
    (use-effect
      (fn []
        (let [timer (js/setTimeout #(set-step inc) 1000)]
          (fn [] (js/clearTimeout timer))))
      [step])
    ($ :div.space-y-4
       ($ :h3.ty-text++.text-lg.font-semibold
          "Success Dialog")

       ($ :p.text-sm.ty-text-
          "Celebratory dialog for completed actions.")

       ($ :button.ty-bg-primary.ty-text++.px-4.py-2.rounded
          {:on-click (fn []
                       (set-step 1)
                       (set-show-dialog true))}
          "Complete Setup")

       ($ ty/Modal {:open show-dialog
                    :on-close #(set-show-dialog false)
                    :backdrop "true"}
          ;; Modal content with proper styling - centered success dialog
          ($ :div.ty-elevated.rounded-lg.shadow-xl.max-w-md.mx-auto.my-20.p-6.text-center
             (if (< step 4)
               ;; Progress steps
               ($ :div
                  ($ :div.mx-auto.w-16.h-16.ty-bg-primary-.rounded-full.flex.items-center.justify-center.mb-4
                     ($ :div.w-8.h-8.border-4.border-current.border-t-transparent.rounded-full.animate-spin))

                  ($ :h3.ty-text++.text-lg.font-bold.mb-2
                     "Setting up your account...")

                  ($ :p.ty-text-.mb-4
                     (case step
                       1 "Creating your profile..."
                       2 "Configuring preferences..."
                       3 "Finalizing setup..."))

                  ($ :div.w-full.ty-bg-neutral-.rounded-full.h-2.mb-4
                     ($ :div.ty-bg-primary.h-2.rounded-full.transition-all.duration-500
                        {:style {:width (str (* step 33.33) "%")}})))

               ;; Success state
               ($ :div
                  ;; Success icon with animation
                  ($ :div.mx-auto.w-16.h-16.ty-bg-success-.rounded-full.flex.items-center.justify-center.mb-4.animate-bounce
                     ($ :svg.w-8.h-8.ty-text-success++
                        {:viewBox "0 0 24 24"
                         :fill "none"
                         :stroke "currentColor"
                         :stroke-width "3"}
                        ($ :path {:d "M9 12l2 2 4-4"})))

                  ($ :h3.ty-text++.text-lg.font-bold.mb-2
                     "🎉 Setup Complete!")

                  ($ :p.ty-text-.mb-6
                     "Your account has been successfully configured. You're ready to start using the platform!")

                  ($ :button.w-full.ty-bg-success.ty-text++.px-4.py-2.rounded.font-medium
                     {:on-click #(set-show-dialog false)}
                     "Get Started"))))))))

;; =============================================================================
;; Main Modals Demo View
;; =============================================================================

(defui view []
  "Main modals & overlays demo view for UIx"
  ($ :div.p-8.max-w-6xl.mx-auto.space-y-8.ty-text

     ;; Header
     ($ :div
        ($ :h1.text-3xl.font-bold.mb-4.ty-text++
           "Modals & Overlays Demo")
        ($ :p.ty-text-.max-w-2xl
           "Comprehensive demonstrations of tooltips, popups, modals, and dialogs with UIx integration.")
        ($ :p.text-sm.ty-text--.mt-2
           "All components use direct web component integration with UIx state management."))

     ;; Tooltips Section
     ($ :div
        ($ :h2.text-2xl.font-bold.mb-4.ty-text-primary
           "Tooltip Components")
        ($ :p.ty-text-.mb-6
           "Interactive tooltips with various placements, semantic flavors, and rich content support."))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (tooltip-placement-demo))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (tooltip-flavors-demo))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (rich-tooltip-demo))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (advanced-tooltip-demo))

     ;; Popups Section
     ($ :div
        ($ :h2.text-2xl.font-bold.mb-4.ty-text-success
           "Popup Components")
        ($ :p.ty-text-.mb-6
           "Advanced popups with complex content including forms and interactive elements."))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (complex-popup-demo))

     ;; Modals Section
     ($ :div
        ($ :h2.text-2xl.font-bold.mb-4.ty-text-warning
           "Modal Windows")
        ($ :p.ty-text-.mb-6
           "Modal dialogs with forms, validation, and complex interactions."))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (basic-modal-demo))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (modal-with-form-demo))

     ;; Dialogs Section
     ($ :div
        ($ :h2.text-2xl.font-bold.mb-4.ty-text-danger
           "Dialog Windows")
        ($ :p.ty-text-.mb-6
           "Specialized dialogs for confirmations, warnings, and success states."))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6.mb-6
        (warning-dialog-demo))

     ($ :div.ty-elevated.rounded-lg.shadow-md.p-6
        (success-dialog-demo))))
