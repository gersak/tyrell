(ns tyrell.site.docs.wizard
  "Documentation for ty-wizard and ty-step components"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

;; The wizard is fully controlled — we set the `active` and `completed`
;; attributes directly from event handlers. Replicant doesn't re-render the
;; web component on attribute changes, but ty-wizard observes its own
;; attributes and updates in place.

(defn- $ [id] (.getElementById js/document id))

(defn- go-to-step
  "Returns an event handler that sets the wizard's active step and completed list.
   ty-wizard observes attributes (not JS properties), so we must use setAttribute."
  [wizard-id step completed]
  (fn []
    (when-let [w ($ wizard-id)]
      (.setAttribute w "active" step)
      (.setAttribute w "completed" completed))))

(defn- read-input-value [id fallback]
  (let [el ($ id)
        v (when el (.-value el))]
    (if (and v (not= "" v)) v fallback)))

(defn- read-radio-group-value [id fallback]
  (or (some-> ($ id) .-value) fallback))

(defn- read-switch-on?
  "ty-switch exposes its checked state via its `checked` boolean property."
  [id]
  (boolean (some-> ($ id) .-checked)))

(defn- update-done-summary!
  "Read the values entered in earlier steps and write them into the
   summary spans/tags inside the Done step. Called when transitioning to step-4."
  []
  (let [name (read-input-value "demo-wiz-name" "—")
        email (read-input-value "demo-wiz-email" "—")
        role-el ($ "demo-wiz-role")
        role (or (when role-el (.-value role-el)) "Engineering")
        theme (read-radio-group-value "demo-wiz-theme" "system")
        notify? (read-switch-on? "demo-wiz-notify")]
    (when-let [el ($ "demo-wiz-sum-name")] (set! (.-textContent el) name))
    (when-let [el ($ "demo-wiz-sum-email")] (set! (.-textContent el) email))
    (when-let [el ($ "demo-wiz-sum-role")] (set! (.-textContent el) role))
    (when-let [el ($ "demo-wiz-sum-theme")] (set! (.-textContent el) theme))
    (when-let [el ($ "demo-wiz-sum-notify")]
      (set! (.-textContent el) (if notify? "enabled" "off"))
      (.setAttribute el "flavor" (if notify? "success" "neutral")))))

(defn view []
  (docs-page
   (component-header "ty-wizard"
                     "Multi-step wizard with progress line, step indicators, completion tracking, and horizontal/vertical orientation. Uses ty-step children — each step is a panel with id, label, and optional description.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
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

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The wizard is fully controlled — you manage " [:code "active"] " and " [:code "completed"] " from outside. Buttons inside each step set these attributes to navigate. Add " [:code "description"] " to each step for a secondary line beneath the indicator label."]
       (demo-area
        [:ty-wizard {:id "demo-wizard" :width "100%" :height "560px"
                     :active "step-1" :completed ""}

         [:ty-step {:id "step-1" :label "Welcome" :description "Quick intro"}
          [:div.flex.flex-col.items-center.gap-5.text-center
           {:style {:padding "2rem 1.5rem" :max-width "32rem" :margin "0 auto"}}

           [:div.flex.items-center.justify-center.rounded-full.ty-bg-primary-
            {:style {:width "72px" :height "72px"}}
            [:ty-icon.ty-text-primary+ {:name "compass" :size "lg"}]]

           [:div
            [:h3.ty-text++ {:style {:font-size "1.5rem" :font-weight "700"}} "Welcome to the team"]
            [:p.ty-text- {:style {:font-size "0.9375rem" :margin-top "0.5rem" :max-width "26rem"}}
             "We'll set up your account in three quick steps. Takes about a minute — you can change everything later."]]

           [:div.grid.grid-cols-3.gap-3.w-full
            {:style {:margin-top "0.5rem" :max-width "28rem"}}
            [:div.ty-elevated.rounded-lg.flex.flex-col.items-center.gap-1.5
             {:style {:padding "0.75rem"}}
             [:ty-icon.ty-text-primary {:name "user" :size "md"}]
             [:p.ty-text {:style {:font-size "0.75rem" :font-weight "600"}} "Profile"]
             [:p.ty-text-- {:style {:font-size "0.6875rem"}} "Name & email"]]
            [:div.ty-elevated.rounded-lg.flex.flex-col.items-center.gap-1.5
             {:style {:padding "0.75rem"}}
             [:ty-icon.ty-text-primary {:name "settings" :size "md"}]
             [:p.ty-text {:style {:font-size "0.75rem" :font-weight "600"}} "Preferences"]
             [:p.ty-text-- {:style {:font-size "0.6875rem"}} "Theme & alerts"]]
            [:div.ty-elevated.rounded-lg.flex.flex-col.items-center.gap-1.5
             {:style {:padding "0.75rem"}}
             [:ty-icon.ty-text-success {:name "check" :size "md"}]
             [:p.ty-text {:style {:font-size "0.75rem" :font-weight "600"}} "Done"]
             [:p.ty-text-- {:style {:font-size "0.6875rem"}} "Ready to go"]]]

           [:ty-button {:flavor "primary" :size "lg"
                        :style {:margin-top "0.5rem"}
                        :on {:click (go-to-step "demo-wizard" "step-2" "step-1")}}
            "Get started"]]]

         [:ty-step {:id "step-2" :label "Profile" :description "About you"}
          [:div.flex.flex-col.gap-4
           {:style {:padding "1.5rem" :max-width "26rem" :margin "0 auto"}}

           [:div
            [:h3.ty-text++ {:style {:font-size "1.25rem" :font-weight "700"}} "About you"]
            [:p.ty-text-- {:style {:font-size "0.8125rem" :margin-top "0.25rem"}}
             "We use this to personalize your workspace."]]

           [:ty-input {:id "demo-wiz-name"
                       :label "Full name" :placeholder "Jane Doe"
                       :required ""}
            [:ty-icon {:slot "start" :name "user"}]]

           [:ty-input {:id "demo-wiz-email"
                       :label "Work email" :type "email"
                       :placeholder "you@company.com"
                       :required ""}
            [:ty-icon {:slot "start" :name "mail"}]]

           [:ty-select {:id "demo-wiz-role"
                          :label "Role" :value "Engineering"}
            [:ty-option {:value "Engineering"} "Engineering"]
            [:ty-option {:value "Design"} "Design"]
            [:ty-option {:value "Product"} "Product"]
            [:ty-option {:value "Support"} "Support"]
            [:ty-option {:value "Other"} "Other"]]

           [:div.flex.justify-between.gap-3
            {:style {:margin-top "0.75rem"}}
            [:ty-button {:flavor "neutral" :outlined ""
                         :on {:click (go-to-step "demo-wizard" "step-1" "")}}
             "Back"]
            [:ty-button {:flavor "primary"
                         :on {:click (go-to-step "demo-wizard" "step-3" "step-1,step-2")}}
             "Continue"]]]]

         [:ty-step {:id "step-3" :label "Preferences" :description "Theme & alerts"}
          [:div.flex.flex-col.gap-5
           {:style {:padding "1.5rem" :max-width "26rem" :margin "0 auto"}}

           [:div
            [:h3.ty-text++ {:style {:font-size "1.25rem" :font-weight "700"}} "Preferences"]
            [:p.ty-text-- {:style {:font-size "0.8125rem" :margin-top "0.25rem"}}
             "You can change these later from settings."]]

           [:div.flex.flex-col.gap-2
            [:p.ty-text {:style {:font-size "0.875rem" :font-weight "500"}} "Theme"]
            [:ty-radio-group {:id "demo-wiz-theme" :value "system" :orientation "horizontal"}
             [:label.flex.items-center.gap-2 {:style {:cursor "pointer"}}
              [:ty-radio {:value "light"}] "Light"]
             [:label.flex.items-center.gap-2 {:style {:cursor "pointer"}}
              [:ty-radio {:value "dark"}] "Dark"]
             [:label.flex.items-center.gap-2 {:style {:cursor "pointer"}}
              [:ty-radio {:value "system"}] "System"]]]

           [:label.flex.items-center.justify-between.gap-3
            {:style {:cursor "pointer" :padding-top "0.75rem" :border-top "1px solid var(--ty-border-)"}}
            [:div
             [:p.ty-text {:style {:font-size "0.875rem" :font-weight "500"}} "Weekly digest"]
             [:p.ty-text-- {:style {:font-size "0.75rem"}} "A Monday summary of activity"]]
            [:ty-switch {:id "demo-wiz-notify" :checked ""}]]

           [:div.flex.justify-between.gap-3
            {:style {:margin-top "0.5rem"}}
            [:ty-button {:flavor "neutral" :outlined ""
                         :on {:click (go-to-step "demo-wizard" "step-2" "step-1")}}
             "Back"]
            [:ty-button {:flavor "primary"
                         :on {:click (fn []
                                       (update-done-summary!)
                                       ((go-to-step "demo-wizard" "step-4" "step-1,step-2,step-3")))}}
             "Continue"]]]]

         [:ty-step {:id "step-4" :label "Done" :description "All set"}
          [:div.flex.flex-col.gap-5
           {:style {:padding "1.5rem" :max-width "26rem" :margin "0 auto"}}

           [:div.flex.flex-col.items-center.gap-3.text-center
            [:div.flex.items-center.justify-center.rounded-full.ty-bg-success-
             {:style {:width "64px" :height "64px"}}
             [:ty-icon.ty-text-success+ {:name "check" :size "lg"}]]
            [:div
             [:h3.ty-text++ {:style {:font-size "1.5rem" :font-weight "700"}} "You're all set!"]
             [:p.ty-text- {:style {:font-size "0.875rem" :margin-top "0.25rem"}}
              "Your account is ready. Here's a summary of your details."]]]

           [:div.ty-elevated.rounded-xl.flex.flex-col.gap-2
            {:style {:padding "1rem"}}
            [:div.flex.items-center.gap-1.5 {:style {:margin-bottom "0.25rem"}}
             [:ty-icon.ty-text-warning {:name "sparkles" :size "xs"}]
             [:p.ty-text-- {:style {:font-size "0.6875rem" :font-weight "600"
                                    :text-transform "uppercase" :letter-spacing "0.05em"}}
              "Your details"]]
            [:div.flex.items-center.justify-between
             [:span.ty-text- {:style {:font-size "0.8125rem"}} "Name"]
             [:span#demo-wiz-sum-name.ty-text {:style {:font-size "0.8125rem" :font-weight "500"}} "—"]]
            [:div.flex.items-center.justify-between
             [:span.ty-text- {:style {:font-size "0.8125rem"}} "Email"]
             [:span#demo-wiz-sum-email.ty-text {:style {:font-size "0.75rem" :font-weight "500"
                                                        :font-family "ui-monospace, monospace"}} "—"]]
            [:div.flex.items-center.justify-between
             [:span.ty-text- {:style {:font-size "0.8125rem"}} "Role"]
             [:ty-tag {:size "xs" :flavor "primary" :pill ""}
              [:span#demo-wiz-sum-role "Engineering"]]]
            [:div.flex.items-center.justify-between
             {:style {:padding-top "0.5rem" :border-top "1px solid var(--ty-border-)"}}
             [:span.ty-text- {:style {:font-size "0.8125rem"}} "Theme"]
             [:ty-tag {:size "xs" :flavor "neutral" :pill ""}
              [:span#demo-wiz-sum-theme "system"]]]
            [:div.flex.items-center.justify-between
             [:span.ty-text- {:style {:font-size "0.8125rem"}} "Weekly digest"]
             [:ty-tag#demo-wiz-sum-notify {:size "xs" :flavor "success" :pill ""} "enabled"]]]

           [:div.flex.justify-center.gap-3
            [:ty-button {:flavor "neutral" :outlined ""
                         :on {:click (go-to-step "demo-wizard" "step-1" "")}}
             "Start over"]
            [:ty-button {:flavor "primary"} "Go to dashboard"]]]]])
       (code-block "<ty-wizard id=\"wizard\" width=\"100%\" height=\"560px\"
            active=\"step-1\" completed=\"\">

  <ty-step id=\"step-1\" label=\"Welcome\" description=\"Quick intro\">
    <!-- Hero icon, value-prop cards, big Get Started button -->
    ...
    <ty-button onclick=\"wizard.setAttribute('active','step-2');
                         wizard.setAttribute('completed','step-1')\">
      Get started
    </ty-button>
  </ty-step>

  <ty-step id=\"step-2\" label=\"Profile\" description=\"About you\">
    <ty-input id=\"name\" label=\"Full name\" required>
      <ty-icon slot=\"start\" name=\"user\"></ty-icon>
    </ty-input>
    <ty-input id=\"email\" label=\"Work email\" type=\"email\" required>
      <ty-icon slot=\"start\" name=\"mail\"></ty-icon>
    </ty-input>
    <ty-select id=\"role\" label=\"Role\" value=\"Engineering\">
      <ty-option value=\"Engineering\">Engineering</ty-option>
      ...
    </ty-select>
    <!-- Back / Continue buttons -->
  </ty-step>

  <ty-step id=\"step-3\" label=\"Preferences\" description=\"Theme & alerts\">
    <ty-radio-group id=\"theme\" value=\"system\" orientation=\"horizontal\">
      <label><ty-radio value=\"light\"></ty-radio> Light</label>
      <label><ty-radio value=\"dark\"></ty-radio> Dark</label>
      <label><ty-radio value=\"system\"></ty-radio> System</label>
    </ty-radio-group>
    <label><ty-switch id=\"notify\" checked></ty-switch> Weekly digest</label>
  </ty-step>

  <ty-step id=\"step-4\" label=\"Done\" description=\"All set\">
    <!-- Success hero + summary card reading values from earlier steps -->
  </ty-step>

</ty-wizard>")]])

   (doc-section "Advanced Examples"
     [:div.space-y-6

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
))
