(ns tyrell.site.docs.checkbox
  "Documentation for ty-checkbox component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-checkbox"
                     "Just the tick. Boolean primitive rendered as a single checkmark — full flavor color when checked, faint when unchecked, grayscale when disabled. Wrap in a <label> for click-on-text behavior.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "checked"
        :type "boolean"
        :default "false"
        :description "Current checked state"}
       {:name "value"
        :type "string"
        :default "\"on\""
        :description "Value submitted with the form when checked"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name"}
       {:name "indeterminate"
        :type "boolean"
        :default "false"
        :description "Mixed state (dash) — visual/ARIA only, clicking resolves to checked"}
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
        :default "\"neutral\""
        :description "Semantic color: primary, success, danger, warning, neutral"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "change"
        :payload "{value: boolean, checked: boolean, formValue: string | null}"
        :when-fired "Fires when checked state changes"}
       {:name "input"
        :payload "{value: boolean, checked: boolean, formValue: string | null}"
        :when-fired "Fires on every interaction (same as change for checkboxes)"}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Wrap in a " [:code "<label>"] " — the browser delegates label clicks to the form-associated child."]
       (demo-area
        [:div.flex.flex-col.items-start.gap-3
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-checkbox] [:span.whitespace-nowrap "Subscribe to newsletter"]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-checkbox {:checked ""}] [:span.whitespace-nowrap "Pre-checked option"]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-checkbox {:indeterminate ""}] [:span.whitespace-nowrap "Indeterminate state"]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium.opacity-60
          [:ty-checkbox {:disabled ""}] [:span.whitespace-nowrap "Disabled"]]])
       (code-block "<label>
  <ty-checkbox></ty-checkbox>
  Subscribe to newsletter
</label>

<label>
  <ty-checkbox checked></ty-checkbox>
  Pre-checked option
</label>

<label>
  <ty-checkbox indeterminate></ty-checkbox>
  Indeterminate state
</label>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Rich Labels")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Interactive descendants inside the label (links, buttons) do not toggle the checkbox — they handle their own clicks normally."]
       (demo-area
        [:div.flex.flex-col.items-start.gap-3
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-checkbox {:required "" :flavor "primary"}]
          [:span.whitespace-nowrap
           "I agree to the "
           [:a.ty-text-primary.underline {:href "#" :on {:click #(.preventDefault %)}} "Terms of Service"]
           " and "
           [:a.ty-text-primary.underline {:href "#" :on {:click #(.preventDefault %)}} "Privacy Policy"]
           "."]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-checkbox {:flavor "success"}]
          [:span.whitespace-nowrap.inline-flex.items-center.gap-1
           [:ty-icon.ty-text-success {:name "shield-check" :size "14"}]
           "Enable two-factor authentication"]]])
       (code-block "<label>
  <ty-checkbox required></ty-checkbox>
  I agree to the <a href=\"/terms\">Terms</a> and <a href=\"/privacy\">Privacy</a>.
</label>

<label>
  <ty-checkbox flavor=\"success\"></ty-checkbox>
  <ty-icon name=\"shield-check\"></ty-icon> Enable two-factor authentication
</label>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Semantic Flavors")
       (demo-area
        [:div.flex.flex-wrap.gap-4
         (for [[flavor label] [["primary" "Primary"] ["success" "Success"]
                               ["danger" "Danger"] ["warning" "Warning"] ["neutral" "Neutral"]]]
           [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
            [:ty-checkbox {:flavor flavor :checked ""}]
            [:span.whitespace-nowrap label]])])
       (code-block "<ty-checkbox flavor=\"primary\" checked></ty-checkbox>
<ty-checkbox flavor=\"success\" checked></ty-checkbox>
<ty-checkbox flavor=\"danger\" checked></ty-checkbox>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       (demo-area
        [:div.flex.flex-col.items-start.gap-3
         (for [[size label] [["xs" "Extra small"] ["sm" "Small"] ["md" "Medium (default)"]
                             ["lg" "Large"] ["xl" "Extra large"]]]
           [:label.inline-flex.items-center.gap-2.cursor-pointer.font-medium
            {:style {:font-size (case size "xs" "0.7rem" "sm" "0.8rem" "lg" "1.1rem" "xl" "1.25rem" "0.9rem")}}
            [:ty-checkbox {:size size :checked ""}]
            [:span.whitespace-nowrap label]])])
       (code-block "<ty-checkbox size=\"xs\"></ty-checkbox>
<ty-checkbox size=\"sm\"></ty-checkbox>
<ty-checkbox size=\"md\"></ty-checkbox>
<ty-checkbox size=\"lg\"></ty-checkbox>
<ty-checkbox size=\"xl\"></ty-checkbox>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Validation States")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Validation UI is the consumer's responsibility — render the asterisk, error, and required indicator yourself."]
       (demo-area
        [:div.flex.flex-col.items-start.gap-4
         [:div
          [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
           [:ty-checkbox {:required "" :flavor "primary"}]
           [:span.whitespace-nowrap "Accept terms "
            [:span.ty-text-danger "*"]]]
          [:p.ty-text-danger {:style {:font-size "0.75rem" :margin-top "0.25rem"}} "You must accept the terms to continue."]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium.opacity-50
          [:ty-checkbox {:disabled "" :checked ""}]
          [:span.whitespace-nowrap "Locked setting (admin only)"]]])
       (code-block "<label>
  <ty-checkbox required flavor=\"danger\"></ty-checkbox>
  Accept terms <span class=\"required\">*</span>
</label>
<p class=\"ty-text-danger\">You must accept the terms to continue.</p>")]])

   (doc-section "Form Integration"
     [:div.space-y-5

      [:div.ty-content.rounded-lg.p-5
       (section-label "With HTML Form")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Fully form-associated — participates in FormData, submit, reset, and constraint validation like a native checkbox."]
       (demo-area
        [:form.flex.flex-wrap.items-center.gap-4
         {:on {:submit (fn [e]
                         (.preventDefault e)
                         (let [data (js/Object.fromEntries (js/FormData. (.-target e)))]
                           (js/alert (str "Submitted:\n" (js/JSON.stringify data nil 2)))))}}
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-checkbox {:name "newsletter" :value "yes"}]
          [:span "Subscribe to newsletter"]]
         [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
          [:ty-checkbox {:name "terms" :required ""}]
          [:span "I accept the terms "
           [:span.ty-text-danger "*"]]]
         [:ty-button {:type "submit" :flavor "primary"} "Submit"]])
       (code-block "<form>
  <label>
    <ty-checkbox name=\"newsletter\" value=\"yes\"></ty-checkbox>
    Subscribe to newsletter
  </label>
  <label>
    <ty-checkbox name=\"terms\" required></ty-checkbox>
    I accept the terms
  </label>
  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>
</form>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const checkbox = document.querySelector('ty-checkbox');

// Read state
console.log(checkbox.checked);   // true | false
console.log(checkbox.value);     // form value when checked

// Set state
checkbox.checked = true;

// Listen for changes
checkbox.addEventListener('change', (e) => {
  console.log(e.detail.value);     // true | false
  console.log(e.detail.checked);   // true | false
  console.log(e.detail.formValue); // 'on' | null
});" "javascript")]])
))
