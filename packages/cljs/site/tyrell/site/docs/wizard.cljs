(ns tyrell.site.docs.wizard
  "Documentation for ty-wizard and ty-step components"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-wizard"
                     "Multi-step wizard with progress line, step indicators, completion tracking, and horizontal/vertical orientation. Uses ty-step children — each step is a panel with id, label, and optional description.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "ty-wizard Attributes")
     (attribute-table
      [{:name "active"
        :type "string"
        :default "first step id"
        :description "ID of the currently active step — you control this attribute to advance or retreat"}
       {:name "completed"
        :type "string"
        :default "\"\""
        :description "Comma-separated IDs of completed steps — drives the progress line and indicator state"}
       {:name "width"
        :type "string"
        :default "\"100%\""
        :description "Container width (px or %)"}
       {:name "height"
        :type "string"
        :default "\"700px\""
        :description "Container height"}
       {:name "orientation"
        :type "string"
        :default "\"horizontal\""
        :description "Step indicator layout: horizontal or vertical"}])]

    [:div.mb-6
     (section-label "ty-step Attributes")
     (attribute-table
      [{:name "id"
        :type "string"
        :required true
        :default "-"
        :description "Unique identifier — referenced by ty-wizard active and completed attributes"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Text shown below the step indicator circle"}
       {:name "description"
        :type "string"
        :default "-"
        :description "Secondary text shown beneath the label in the step indicator"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Prevent this step from being activated"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "ty-wizard-step-change"
        :payload "{activeId, activeIndex, previousId, previousIndex, direction}"
        :when-fired "Fires when the active step changes"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The wizard is fully controlled — you manage " [:code "active"] " and " [:code "completed"] " from outside. Buttons inside each step set these attributes to navigate."]
       (demo-area
        [:ty-wizard {:id "demo-wizard" :width "100%" :height "280px"
                     :active "step-1" :completed ""}
         [:ty-step {:id "step-1" :label "Account"}
          [:div.p-5
           [:p.ty-text+ {:style {:font-weight "600" :margin-bottom "0.75rem"}} "Create your account"]
           [:ty-input {:label "Email" :placeholder "you@example.com" :type "email"}]
           [:div.flex.justify-end {:style {:margin-top "1rem"}}
            [:ty-button {:flavor "primary"
                         :on {:click (fn []
                                       (let [w (.getElementById js/document "demo-wizard")]
                                         (set! (.-active w) "step-2")
                                         (set! (.-completed w) "step-1")))}}
             "Next"]]]]
         [:ty-step {:id "step-2" :label "Profile"}
          [:div.p-5
           [:p.ty-text+ {:style {:font-weight "600" :margin-bottom "0.75rem"}} "Your profile"]
           [:ty-input {:label "Full Name" :placeholder "Jane Doe"}]
           [:div.flex.justify-between {:style {:margin-top "1rem"}}
            [:ty-button {:flavor "neutral"
                         :on {:click (fn []
                                       (let [w (.getElementById js/document "demo-wizard")]
                                         (set! (.-active w) "step-1")
                                         (set! (.-completed w) "")))}}
             "Back"]
            [:ty-button {:flavor "primary"
                         :on {:click (fn []
                                       (let [w (.getElementById js/document "demo-wizard")]
                                         (set! (.-active w) "step-3")
                                         (set! (.-completed w) "step-1,step-2")))}}
             "Next"]]]]
         [:ty-step {:id "step-3" :label "Done"}
          [:div.p-5
           [:p.ty-text+ {:style {:font-weight "600" :margin-bottom "0.5rem"}} "All set!"]
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Your account is ready."]
           [:div.flex.justify-between {:style {:margin-top "1rem"}}
            [:ty-button {:flavor "neutral"
                         :on {:click (fn []
                                       (let [w (.getElementById js/document "demo-wizard")]
                                         (set! (.-active w) "step-2")
                                         (set! (.-completed w) "step-1")))}}
             "Back"]
            [:ty-button {:flavor "success"} "Finish"]]]]])
       (code-block "<ty-wizard id=\"wizard\" width=\"100%\" height=\"400px\"
          active=\"step-1\" completed=\"\">
  <ty-step id=\"step-1\" label=\"Account\">
    ...
    <ty-button onclick=\"wizard.setAttribute('active','step-2');
                         wizard.setAttribute('completed','step-1')\">Next</ty-button>
  </ty-step>
  <ty-step id=\"step-2\" label=\"Profile\">
    ...
  </ty-step>
  <ty-step id=\"step-3\" label=\"Done\">
    ...
  </ty-step>
</ty-wizard>")]

      ;; With descriptions
      [:div.ty-content.rounded-lg.p-5
       (section-label "Step Descriptions")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Add " [:code "description"] " to each " [:code "ty-step"] " to show secondary text below the label in the progress indicator."]
       (code-block "<ty-wizard width=\"100%\" height=\"400px\" active=\"account\">
  <ty-step id=\"account\" label=\"Account\" description=\"Email & password\">
    ...
  </ty-step>
  <ty-step id=\"profile\" label=\"Profile\" description=\"Personal info\">
    ...
  </ty-step>
  <ty-step id=\"review\" label=\"Review\" description=\"Confirm & submit\">
    ...
  </ty-step>
</ty-wizard>")]])

   ;; Advanced Examples
   (doc-section "Advanced Examples"
     [:div.space-y-6

      ;; JavaScript API
      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const wizard = document.querySelector('ty-wizard');

// Navigate programmatically
wizard.setAttribute('active', 'step-2');
wizard.setAttribute('completed', 'step-1');

// Listen for step changes
wizard.addEventListener('ty-wizard-step-change', (e) => {
  const { activeId, activeIndex, previousId, direction } = e.detail;
  console.log('moved', direction, 'to', activeId);
});" "javascript")]

      ;; Framework integration
      [:div.ty-content.rounded-lg.p-5
       (section-label "Framework Integration")
       (code-block ";; ClojureScript — maintain active/completed in a local atom
(let [active (atom \"step-1\")
      completed (atom #{})]

  [:ty-wizard {:width \"100%\" :height \"400px\"
               :active @active
               :completed (clojure.string/join \",\" @completed)
               :on {:ty-wizard-step-change
                    #(reset! active (-> % .-detail .-activeId))}}
   [:ty-step {:id \"step-1\" :label \"Account\"} ...]
   [:ty-step {:id \"step-2\" :label \"Profile\"} ...]])")]])

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
         (for [text ["Keep steps to 3–6 — longer wizards lose users before the end"
                     "Show clear Back/Next buttons in every step panel"
                     "Update completed as steps are validated, not just navigated"
                     "Validate each step before allowing Next to advance"
                     "Use description to hint what each step collects or requires"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Allow advancing past a step with invalid data"
                     "Use a wizard for simple one-screen forms — keep it a single form"
                     "Mark a step completed before it's actually validated"
                     "Omit width and height — the layout breaks without them"
                     "Disable the Back button — users should always be able to go back"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
