(ns tyrell.site.docs.switch
  "Documentation for ty-switch component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-switch"
                     "Just the toggle. Track + thumb visual with role=\"switch\" ARIA. Wrap in a <label> for click-on-text behavior. Use for immediate-effect settings, not for form submissions.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "checked"
        :type "boolean"
        :default "false"
        :description "Current on/off state"}
       {:name "value"
        :type "string"
        :default "\"on\""
        :description "Value submitted with the form when checked"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disable interaction"}
       {:name "required"
        :type "boolean"
        :default "false"
        :description "Sets aria-required and participates in form validation"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Size variant: xs, sm, md, lg, xl"}
       {:name "flavor"
        :type "string"
        :default "\"primary\""
        :description "Semantic color when checked: primary, secondary, success, danger, warning, neutral"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "change"
        :payload "{value: boolean, checked: boolean, formValue: string | null}"
        :when-fired "Fires when toggle state changes"}
       {:name "input"
        :payload "{value: boolean, checked: boolean, formValue: string | null}"
        :when-fired "Fires on every interaction (same as change for switches)"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Wrap in a " [:code "<label>"] " for click-on-text toggle. The thumb slides, not snaps — users perceive it as a physical control."]
       (demo-area
        [:div.flex.flex-col.items-start.gap-3
         [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium
          [:ty-switch {:checked ""}] [:span.whitespace-nowrap "Email notifications"]]
         [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium
          [:ty-switch {:flavor "success"}] [:span.whitespace-nowrap "Auto-save drafts"]]
         [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium
          [:ty-switch {:flavor "danger" :checked ""}] [:span.whitespace-nowrap "Delete on archive"]]
         [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium.opacity-60
          [:ty-switch {:disabled ""}] [:span.whitespace-nowrap "Cannot change (admin only)"]]])
       (code-block "<label>
  <ty-switch checked></ty-switch>
  Email notifications
</label>

<label>
  <ty-switch flavor=\"success\"></ty-switch>
  Auto-save drafts
</label>

<label>
  <ty-switch disabled></ty-switch>
  Cannot change (admin only)
</label>")]

      ;; Flavors
      [:div.ty-content.rounded-lg.p-5
       (section-label "Semantic Flavors")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Flavor applies when checked — use it to reinforce the meaning of the setting."]
       (demo-area
        [:div.flex.flex-wrap.gap-x-6.gap-y-3
         (for [[flavor label] [["primary" "Primary"] ["secondary" "Secondary"] ["success" "Success"]
                               ["danger" "Danger"] ["warning" "Warning"] ["neutral" "Neutral"]]]
           [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium
            [:ty-switch {:flavor flavor :checked ""}]
            [:span.whitespace-nowrap label]])])
       (code-block "<ty-switch flavor=\"primary\" checked></ty-switch>
<ty-switch flavor=\"success\" checked></ty-switch>
<ty-switch flavor=\"danger\" checked></ty-switch>
<ty-switch flavor=\"warning\" checked></ty-switch>")]

      ;; Sizes
      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       (demo-area
        [:div.flex.flex-col.items-start.gap-3
         (for [[size label] [["xs" "Extra small"] ["sm" "Small"] ["md" "Medium (default)"]
                             ["lg" "Large"] ["xl" "Extra large"]]]
           [:label.inline-flex.items-center.gap-3.cursor-pointer.font-medium
            {:style {:font-size (case size "xs" "0.7rem" "sm" "0.8rem" "lg" "1.1rem" "xl" "1.25rem" "0.9rem")}}
            [:ty-switch {:size size :checked ""}]
            [:span.whitespace-nowrap label]])])
       (code-block "<ty-switch size=\"xs\"></ty-switch>
<ty-switch size=\"sm\"></ty-switch>
<ty-switch size=\"md\"></ty-switch>
<ty-switch size=\"lg\"></ty-switch>
<ty-switch size=\"xl\"></ty-switch>")]

      ;; Settings Panel
      [:div.ty-content.rounded-lg.p-5
       (section-label "Settings Panel")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Switches shine in settings UIs — changes apply immediately, no submit button needed."]
       (demo-area
        [:div.ty-elevated.rounded-lg {:style {:padding "0.25rem 0"}}
         (for [[label desc flavor checked?]
               [["Email notifications" "Receive updates about your account" "primary" true]
                ["Push notifications" "Get alerts on your mobile device" "primary" false]
                ["Marketing emails" "Offers and product news" "secondary" false]
                ["Two-factor auth" "Require a code when signing in" "success" true]
                ["Auto-delete inactive" "Remove data after 90 days of inactivity" "danger" false]]]
           [:div.flex.items-center.justify-between
            {:style {:padding "0.75rem 1rem" :border-bottom "1px solid var(--ty-border-soft)"}}
            [:div
             [:p.ty-text+ {:style {:font-size "0.875rem" :font-weight "500"}} label]
             [:p.ty-text-- {:style {:font-size "0.75rem" :margin-top "0.125rem"}} desc]]
            [:label.cursor-pointer
             [:ty-switch (merge {:flavor flavor} (when checked? {:checked ""}))]]])

        [:div.flex.items-center.justify-between
         {:style {:padding "0.75rem 1rem"}}
         [:div
          [:p.ty-text+ {:style {:font-size "0.875rem" :font-weight "500"}} "Dark mode"]
          [:p.ty-text-- {:style {:font-size "0.75rem" :margin-top "0.125rem"}} "Switch to dark theme"]]
         [:label.cursor-pointer [:ty-switch {:flavor "primary" :checked ""}]]]])
       (code-block "<div class=\"settings-row\">
  <div>
    <p>Email notifications</p>
    <p class=\"ty-text--\">Receive updates about your account</p>
  </div>
  <label>
    <ty-switch flavor=\"primary\" checked></ty-switch>
  </label>
</div>")]])

   ;; vs Checkbox
   (doc-section "Switch vs Checkbox"
     [:div.ty-content.rounded-lg.p-5
      [:div.grid.gap-6
       {:style {:grid-template-columns "repeat(auto-fill, minmax(240px, 1fr))"}}
       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-primary {:name "toggle-right" :size "16"}]
         [:span.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "Use ty-switch when"]]
        [:div.space-y-2
         (for [text ["The setting takes effect immediately (no submit)"
                     "Toggling a system state: dark mode, notifications"
                     "The two states are on/off, not agree/disagree"
                     "Context is a settings panel or preferences screen"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-primary.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]
       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-accent+ {:name "square-check" :size "16"}]
         [:span.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "Use ty-checkbox when"]]
        [:div.space-y-2
         (for [text ["Part of a form that gets submitted"
                     "Asking for consent: \"I agree to the terms\""
                     "Multiple independent options in a list"
                     "An indeterminate state is needed (e.g. select-all)"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-accent+.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])

   ;; Best Practices
   (doc-section "Best Practices"
     [:div.ty-elevated.rounded-lg.p-5
      [:div.grid.gap-6
       {:style {:grid-template-columns "repeat(auto-fill, minmax(260px, 1fr))"}}

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-success {:name "check-circle" :size "16"}]
         [:span.ty-text-success+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Do"]]
        [:div.space-y-2
         (for [text ["Apply changes immediately — switches imply instant effect"
                     "Wrap in <label> for a larger click target"
                     "Use flavor to reinforce the implication: danger for destructive settings"
                     "Describe the current state in the label (not the action to take)"
                     "Group related switches visually in a settings panel"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Use for form agreement (\"I accept terms\") — that's a checkbox"
                     "Use for mutually exclusive options — that's a radio group"
                     "Change the label text based on state — it creates confusion"
                     "Use without a label — switches without labels are inaccessible"
                     "Batch switch changes with a submit button — defeats the pattern"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
