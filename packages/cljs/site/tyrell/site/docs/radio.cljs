(ns tyrell.site.docs.radio
  "Documentation for ty-radio-group and ty-radio components"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-radio-group"
                     "Exclusive single-choice selection. The group owns the form field abstraction — label, error, value, form participation. ty-radio is just the circle; wrap each in a <label>.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "ty-radio-group Attributes")
     (attribute-table
      [{:name "value"
        :type "string"
        :default "-"
        :description "Currently selected radio's value"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name — shared across all child radios"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Group label rendered above the options"}
       {:name "error"
        :type "string"
        :default "-"
        :description "Error message rendered below the options"}
       {:name "orientation"
        :type "string"
        :default "\"vertical\""
        :description "Layout: vertical (default) or horizontal"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Size applied to all child ty-radio elements: xs, sm, md, lg, xl"}
       {:name "flavor"
        :type "string"
        :default "\"primary\""
        :description "Semantic color applied to all child ty-radio elements"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disable all options in the group"}
       {:name "required"
        :type "boolean"
        :default "false"
        :description "Marks the group as required for form validation"}])]

    [:div.mb-6
     (section-label "ty-radio Attributes")
     (attribute-table
      [{:name "value"
        :type "string"
        :required true
        :default "-"
        :description "Identifies this option — required, used as the group's value when selected"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disable only this option while others remain selectable"}])]

    [:div
     (section-label "Events (ty-radio-group)")
     (event-table
      [{:name "change"
        :payload "{value: string, formValue: string}"
        :when-fired "Fires when the selected option changes"}
       {:name "input"
        :payload "{value: string, formValue: string}"
        :when-fired "Fires on every selection interaction"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Place " [:code "ty-radio"] " children inside " [:code "ty-radio-group"] ". Arrow keys navigate AND change selection — no extra wiring needed."]
       (demo-area
        [:ty-radio-group {:label "Plan" :name "plan" :value "pro"}
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-radio {:value "free"}] [:span.whitespace-nowrap "Free"]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-radio {:value "pro"}] [:span.whitespace-nowrap "Pro"]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-radio {:value "team"}] [:span.whitespace-nowrap "Team"]]])
       (code-block "<ty-radio-group label=\"Plan\" name=\"plan\" value=\"pro\">
  <label><ty-radio value=\"free\"></ty-radio> Free</label>
  <label><ty-radio value=\"pro\"></ty-radio> Pro</label>
  <label><ty-radio value=\"team\"></ty-radio> Team</label>
</ty-radio-group>")]

      ;; Horizontal
      [:div.ty-content.rounded-lg.p-5
       (section-label "Horizontal Orientation")
       (demo-area
        [:div.space-y-4
         [:ty-radio-group {:label "Theme" :orientation "horizontal" :value "auto"}
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "light"}] [:span.whitespace-nowrap "Light"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "dark"}] [:span.whitespace-nowrap "Dark"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "auto"}] [:span.whitespace-nowrap "System"]]]])
       (code-block "<ty-radio-group label=\"Theme\" orientation=\"horizontal\" value=\"auto\">
  <label><ty-radio value=\"light\"></ty-radio> Light</label>
  <label><ty-radio value=\"dark\"></ty-radio> Dark</label>
  <label><ty-radio value=\"auto\"></ty-radio> System</label>
</ty-radio-group>")]

      ;; Flavors
      [:div.ty-content.rounded-lg.p-5
       (section-label "Semantic Flavors")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Flavor is applied to all child radios — use it to reinforce the meaning of the choice."]
       (demo-area
        [:div.grid.gap-5
         {:style {:grid-template-columns "repeat(auto-fill, minmax(200px, 1fr))"}}
         [:ty-radio-group {:label "Priority" :flavor "danger" :value "high"}
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "low"}] [:span.whitespace-nowrap "Low"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "med"}] [:span.whitespace-nowrap "Medium"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "high"}] [:span.whitespace-nowrap "High"]]]
         [:ty-radio-group {:label "Environment" :flavor "success" :value "prod"}
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "dev"}] [:span.whitespace-nowrap "Development"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "staging"}] [:span.whitespace-nowrap "Staging"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "prod"}] [:span.whitespace-nowrap "Production"]]]
         [:ty-radio-group {:label "Role" :flavor "primary" :orientation "vertical"}
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "viewer"}] [:span.whitespace-nowrap "Viewer"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "editor"}] [:span.whitespace-nowrap "Editor"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "admin"}] [:span.whitespace-nowrap "Admin"]]]])
       (code-block "<ty-radio-group label=\"Priority\" flavor=\"danger\" value=\"high\">
  <label><ty-radio value=\"low\"></ty-radio> Low</label>
  <label><ty-radio value=\"med\"></ty-radio> Medium</label>
  <label><ty-radio value=\"high\"></ty-radio> High</label>
</ty-radio-group>")]

      ;; Error state + disabled options
      [:div.ty-content.rounded-lg.p-5
       (section-label "Error & Disabled Options")
       (demo-area
        [:div.grid.gap-5
         {:style {:grid-template-columns "repeat(auto-fill, minmax(200px, 1fr))"}}
         [:ty-radio-group {:label "Billing cycle" :value "" :error "Please select a billing cycle"}
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "monthly"}] [:span.whitespace-nowrap "Monthly"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "yearly"}] [:span.whitespace-nowrap "Yearly"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "lifetime"}] [:span.whitespace-nowrap "Lifetime"]]]
         [:ty-radio-group {:label "Account type" :value "personal"}
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "personal"}] [:span.whitespace-nowrap "Personal"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium.opacity-50
           [:ty-radio {:value "team" :disabled ""}] [:span.whitespace-nowrap "Team (coming soon)"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium.opacity-50
           [:ty-radio {:value "enterprise" :disabled ""}] [:span.whitespace-nowrap "Enterprise (contact us)"]]]])
       (code-block "<ty-radio-group label=\"Billing cycle\" error=\"Please select a billing cycle\">
  <label><ty-radio value=\"monthly\"></ty-radio> Monthly</label>
  <label><ty-radio value=\"yearly\"></ty-radio> Yearly</label>
</ty-radio-group>

<!-- Per-option disabled -->
<ty-radio-group label=\"Account type\" value=\"personal\">
  <label><ty-radio value=\"personal\"></ty-radio> Personal</label>
  <label><ty-radio value=\"team\" disabled></ty-radio> Team (coming soon)</label>
</ty-radio-group>")]])

   ;; Form Integration
   (doc-section "Form Integration"
     [:div.space-y-5

      [:div.ty-content.rounded-lg.p-5
       (section-label "With HTML Form")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The group is fully form-associated — its selected value appears in FormData under the " [:code "name"] " attribute."]
       (demo-area
        [:form.space-y-4
         {:on {:submit (fn [e]
                         (.preventDefault e)
                         (let [data (js/Object.fromEntries (js/FormData. (.-target e)))]
                           (js/alert (str "Submitted:\n" (js/JSON.stringify data nil 2)))))}}
         [:ty-radio-group {:label "Preferred contact" :name "contact" :required true :value "email"}
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "email"}] [:span "Email"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "phone"}] [:span "Phone"]]
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-radio {:value "sms"}] [:span "SMS"]]]
         [:ty-button {:type "submit" :flavor "primary"} "Submit"]])
       (code-block "<form>
  <ty-radio-group name=\"contact\" label=\"Preferred contact\" required value=\"email\">
    <label><ty-radio value=\"email\"></ty-radio> Email</label>
    <label><ty-radio value=\"phone\"></ty-radio> Phone</label>
    <label><ty-radio value=\"sms\"></ty-radio> SMS</label>
  </ty-radio-group>
  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>
</form>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const group = document.querySelector('ty-radio-group');

// Read current value
console.log(group.value);

// Set value programmatically
group.value = 'pro';

// Listen for changes
group.addEventListener('change', (e) => {
  console.log(e.detail.value);     // selected radio's value
  console.log(e.detail.formValue); // same — what gets submitted
});" "javascript")]])

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
         (for [text ["Provide a clear group label — it's the fieldset legend for screen readers"
                     "Pre-select a sensible default so the form is valid out of the box"
                     "Use horizontal layout for 2-4 short options that fit in one row"
                     "Use flavor to signal meaning — danger for destructive choices"
                     "Disable individual options (not the whole group) when some are unavailable"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Use for more than 5-6 options — a dropdown is better at that scale"
                     "Skip the name attribute — the group won't submit to FormData"
                     "Use for independent choices — that's what checkboxes are for"
                     "Mix flavors per-radio inside a group — it contradicts the grouping"
                     "Use horizontal layout for 5+ options or long option labels"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
