(ns tyrell.site.views.contact-form
  (:require
   [clojure.string :as str]
   [tyrell.site.state :as state]))

;; Validation functions
(defn validate-email [email]
  (let [email-regex #"^[^\s@]+@[^\s@]+\.[^\s@]+$"]
    (and (not-empty email) (re-matches email-regex email))))

(defn validate-field [field-key value]
  (case field-key
    :full-name (if (or (empty? value) (< (count (clojure.string/trim value)) 2))
                 "Full name must be at least 2 characters long"
                 nil)
    :email (cond
             (empty? value) "Email address is required"
             (not (validate-email value)) "Please enter a valid email address"
             :else nil)
    :company (if (empty? value)
               "Company name is required"
               nil)
    :subject (if (or (empty? value) (< (count (clojure.string/trim value)) 5))
               "Subject must be at least 5 characters long"
               nil)
    :message (cond
               (empty? value) "Message is required"
               (< (count (clojure.string/trim value)) 20) "Message must be at least 20 characters long"
               (> (count value) 2000) "Message must not exceed 2000 characters"
               :else nil)
    nil))

(defn validate-form [form-data]
  (->> form-data
       (map (fn [[k v]] [k (validate-field k v)]))
       (filter (fn [[_ v]] v))
       (into {})))

;; Event handlers
(defn handle-field-change [field-key]
  (fn [event]
    (let [value (-> event .-detail .-value)]
      (swap! state/state update-in [:contact-form :form-data] assoc field-key value)
      (swap! state/state update-in [:contact-form :touched-fields] conj field-key)
      ;; Real-time validation
      (let [error (validate-field field-key value)]
        (if error
          (swap! state/state assoc-in [:contact-form :validation-errors field-key] error)
          (swap! state/state update-in [:contact-form :validation-errors] dissoc field-key))))))

(defn handle-checkbox-change [field-key]
  (fn [event]
    (let [checked (-> event .-detail .-value)]
      (swap! state/state assoc-in [:contact-form :form-data field-key] checked))))

(defn handle-priority-change [^js event]
  (let [value (-> event .-detail .-option .-value)]
    (swap! state/state assoc-in [:contact-form :form-data :priority] value)))

(defn handle-department-change [departments]
  (swap! state/state assoc-in [:contact-form :form-data :department] departments))

;; Form submission
(defn simulate-form-submission [_]
  (js/Promise.
   (fn [resolve reject]
     (js/setTimeout
      (fn []
        ;; Simulate 90% success rate
        (if (> (js/Math.random) 0.1)
          (resolve {:success true
                    :message "Thank you! Your message has been sent successfully. We'll get back to you within 24 hours."})
          (reject {:success false
                   :message "Sorry, there was an error sending your message. Please try again or contact us directly at support@example.com."})))
      2000))))

(defn handle-form-submit [event]
  (.preventDefault event)
  (let [form-data (get-in @state/state [:contact-form :form-data])
        errors (validate-form form-data)]

    ;; Mark all fields as touched
    (swap! state/state assoc-in [:contact-form :touched-fields]
           #{:full-name :email :company :subject :message})

    (if (empty? errors)
      (do
        ;; Start submission
        (swap! state/state assoc-in [:contact-form :is-submitting] true)
        (swap! state/state assoc-in [:contact-form :submission-status] nil)

        ;; Simulate API call
        (-> (simulate-form-submission form-data)
            (.then (fn [result]
                     (swap! state/state assoc-in [:contact-form :is-submitting] false)
                     (swap! state/state assoc-in [:contact-form :submission-status] :success)
                     (swap! state/state assoc-in [:contact-form :submission-message] (:message result))
                     ;; Store submitted data and show modal
                     (swap! state/state assoc-in [:contact-form :submitted-data] form-data)
                     (swap! state/state assoc-in [:contact-form :success-modal-open] true)
                     ;; Clear form on success
                     (swap! state/state assoc-in [:contact-form :form-data]
                            {:full-name ""
                             :email ""
                             :company ""
                             :subject ""
                             :message ""
                             :priority ""
                             :department #{}
                             :newsletter-consent false})
                     (swap! state/state assoc-in [:contact-form :touched-fields] #{})
                     (swap! state/state assoc-in [:contact-form :validation-errors] {})))
            (.catch (fn [error]
                      (swap! state/state assoc-in [:contact-form :is-submitting] false)
                      (swap! state/state assoc-in [:contact-form :submission-status] :error)
                      (swap! state/state assoc-in [:contact-form :submission-message] (:message error))))))
      ;; Set validation errors
      (swap! state/state assoc-in [:contact-form :validation-errors] errors))))

(defn close-success-modal []
  (swap! state/state assoc-in [:contact-form :success-modal-open] false)
  (swap! state/state assoc-in [:contact-form :submitted-data] nil)
  (swap! state/state assoc-in [:contact-form :submission-status] nil))

(defn reset-form []
  (swap! state/state assoc :contact-form
         {:form-data {:full-name ""
                      :email ""
                      :company ""
                      :subject ""
                      :message ""
                      :priority ""
                      :department #{}
                      :newsletter-consent false}
          :validation-errors {}
          :touched-fields #{}
          :is-submitting false
          :submission-status nil
          :submission-message ""
          :success-modal-open false
          :submitted-data nil}))

(defn success-modal-content [submitted-data close-success-modal reset-form]
  [:ty-modal {:open true
              :on {:close close-success-modal}}
   [:div.p-2.sm:p-6.ty-content.rounded-none.sm:rounded-lg
    [:div.flex.items-center.gap-4.mb-6
     [:ty-icon {:name "check-circle"
                :size "xl"}]
     [:div
      [:h2.text-2xl.font-semibold.ty-text "Message Sent Successfully!"]
      [:p.ty-text- "Your message has been delivered and we'll respond within 24 hours."]]]

    [:div.ty-bg-neutral-.p-2.sm:p-6.rounded-none.sm:rounded-lg.mb-6.ty-floating
     [:h3.text-lg.font-medium.ty-text.mb-4 "Submission Report"]

     (when submitted-data
       [:div.space-y-4
        [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
         [:div
          [:label.text-sm.font-medium.ty-text- "Contact Information"]
          [:div.mt-1.space-y-2
           [:p.text-sm [:span.font-medium "Name: "] (:full-name submitted-data)]
           [:p.text-sm [:span.font-medium "Email: "] (:email submitted-data)]
           [:p.text-sm [:span.font-medium "Company: "] (:company submitted-data)]]]
         [:div
          [:label.text-sm.font-medium.ty-text- "Request Details"]
          [:div.mt-1.space-y-2
           [:p.text-sm [:span.font-medium "Priority: "]
            [:span.capitalize.px-2.py-1.rounded.text-xs
             {:class (case (:priority submitted-data)
                       "low" ["ty-bg-neutral-" "ty-text-neutral"]
                       "medium" ["ty-bg-info-" "ty-text"]
                       "high" ["ty-bg-warning-" "ty-text-warning"]
                       "critical" ["ty-bg-danger-" "ty-text-danger"]
                       ["ty-bg-neutral-" "ty-text-neutral"])}
             (:priority submitted-data)]]
           [:p.text-sm [:span.font-medium "Departments: "]
            (if (empty? (:department submitted-data))
              "None selected"
              (str/join ", " (map str/capitalize (:department submitted-data))))]
           [:p.text-sm [:span.font-medium "Newsletter: "]
            (if (:newsletter-consent submitted-data) "Yes" "No")]]]]

        [:div
         [:label.text-sm.font-medium.ty-text- "Subject"]
         [:p.text-sm.ty-text.mt-1 (:subject submitted-data)]]

        [:div
         [:label.text-sm.font-medium.ty-text- "Message"]
         [:div.mt-1.max-h-32.overflow-y-auto.p-3.ty-bg-neutral-.ty-border.border.rounded-md.text-xs
          [:pre.whitespace-pre-wrap.font-mono (:message submitted-data)]]]

        [:div.flex.justify-between.text-xs.ty-text-
         [:span "Submitted: " (js/Date.)]
         [:span "Message length: " (count (:message submitted-data)) " characters"]]])]

    [:div.flex.gap-3.justify-end
     [:ty-button
      {:type "button"
       :flavor "secondary"
       :on {:click close-success-modal}}
      "Close"]
     [:ty-button
      {:type "button"
       :flavor "primary"
       :on {:click (fn [] (close-success-modal) (reset-form))}}
      [:ty-icon {:name "plus"
                 :size "sm"}]
      "Send Another Message"]]]])

(defn view []
  (let [{:keys [form-data validation-errors touched-fields is-submitting submission-status submission-message
                success-modal-open submitted-data]}
        (:contact-form @state/state)]
    [:div
     [:div.space-y-6
      ;; Submission Status Messages
      (when submission-status
        [:div.ty-floating.p-6.rounded-lg
         (if (= submission-status :success)
           [:div.flex.items-center.gap-4.ty-bg-success-.p-4.rounded-lg
            [:ty-icon {:name "check-circle"
                       :size "lg"}]
            [:div
             [:h3.font-semibold.ty-text-success "Message Sent Successfully!"]
             [:p.text-sm.ty-text-success submission-message]]]
           [:div.flex.items-center.gap-4.ty-bg-danger-.p-4.rounded-lg
            [:ty-icon {:name "alert-circle"
                       :size "lg"}]
            [:div
             [:h3.font-semibold.ty-text-danger "Submission Failed"]
             [:p.text-sm.ty-text-danger submission-message]
             [:button.mt-2.text-sm.underline.ty-text-danger.hover:no-underline
              {:on {:click (fn [] (swap! state/state assoc-in [:contact-form :submission-status] nil))}}
              "Try Again"]]])])

      ;; Main Form
      [:form.space-y-6
       {:on {:submit handle-form-submit}}

        ;; Enhanced Four-Column Layout: Contact Info | Request Details | Tips/Newsletter | Message
        [:div.grid.grid-cols-1.lg:grid-cols-2.gap-8
         ;; Left Column - Contact Information (1/4)
         [:div.ty-floating.p-6.rounded-lg
          [:div.flex.items-center.gap-3.mb-6
           [:ty-icon {:name "user"
                      :size "lg"
                      :class "ty-text-primary"}]
           [:h3.text-lg.font-semibold.ty-text "Contact Information"]]

          [:div.space-y-4
           ;; Full Name
           [:div
            [:ty-input {:type "text"
                        :label "Full Name"
                        :value (:full-name form-data)
                        :placeholder "Enter your full name"
                        :required true
                        :icon "user"
                        :on {:input (handle-field-change :full-name)}}]
            (when (and (contains? touched-fields :full-name)
                       (contains? validation-errors :full-name))
              [:p.text-sm.ty-text-danger.mt-1.flex.items-center.gap-2
               [:ty-icon {:name "alert-circle"
                          :size "xs"}]
               (get validation-errors :full-name)])]

           ;; Email
           [:div
            [:ty-input {:type "email"
                        :label "Email Address"
                        :value (:email form-data)
                        :placeholder "your@email.com"
                        :required true
                        :icon "mail"
                        :on {:input (handle-field-change :email)}}]
            (when (and (contains? touched-fields :email)
                       (contains? validation-errors :email))
              [:p.text-sm.ty-text-danger.mt-1.flex.items-center.gap-2
               [:ty-icon {:name "alert-circle"
                          :size "xs"}]
               (get validation-errors :email)])]

           ;; Company
           [:div
            [:ty-input {:type "text"
                        :label "Company"
                        :value (:company form-data)
                        :placeholder "Your company name"
                        :required true
                        :icon "building"
                        :on {:input (handle-field-change :company)}}]
            (when (and (contains? touched-fields :company)
                       (contains? validation-errors :company))
              [:p.text-sm.ty-text-danger.mt-1.flex.items-center.gap-2
               [:ty-icon {:name "alert-circle"
                          :size "xs"}]
               (get validation-errors :company)])]]]

         ;; Middle Column - Request Details (1/4)
         [:div.ty-floating.p-6.rounded-lg
          [:div.flex.items-center.gap-3.mb-6
           [:ty-icon {:name "settings"
                      :size "lg"
                      :class "ty-text-secondary"}]
           [:h3.text-lg.font-semibold.ty-text "Request Details"]]

          [:div.space-y-4
           ;; Subject
           [:div
            [:ty-input {:type "text"
                        :label "Subject"
                        :value (:subject form-data)
                        :placeholder "Brief description of your inquiry"
                        :required true
                        :icon "file-text"
                        :on {:input (handle-field-change :subject)}}]
            (when (and (contains? touched-fields :subject)
                       (contains? validation-errors :subject))
              [:p.text-sm.ty-text-danger.mt-1.flex.items-center.gap-2
               [:ty-icon {:name "alert-circle"
                          :size "xs"}]
               (get validation-errors :subject)])]

           ;; Priority Selection with enhanced styling
           [:div
            [:ty-dropdown
             {:label "Priority Level"
              :value (:priority form-data)
              :on {:change handle-priority-change}}
             [:ty-option {:value "low"}
              [:div.flex.items-center.gap-3.p-2
               [:div.w-3.h-3.bg-green-500.rounded-full.shadow-sm]
               [:div
                [:div.font-medium.ty-text "Low Priority"]
                [:div.text-xs.ty-text- "General inquiry, no rush"]]]]
             [:ty-option {:value "medium"}
              [:div.flex.items-center.gap-3.p-2
               [:div.w-3.h-3.bg-blue-500.rounded-full.shadow-sm]
               [:div
                [:div.font-medium.ty-text "Medium Priority"]
                [:div.text-xs.ty-text- "Standard business request"]]]]
             [:ty-option {:value "high"}
              [:div.flex.items-center.gap-3.p-2
               [:div.w-3.h-3.bg-yellow-500.rounded-full.shadow-sm]
               [:div
                [:div.font-medium.ty-text "High Priority"]
                [:div.text-xs.ty-text- "Urgent issue, needs attention"]]]]
             [:ty-option {:value "critical"}
              [:div.flex.items-center.gap-3.p-2
               [:div.w-3.h-3.bg-red-500.rounded-full.shadow-sm.animate-pulse]
               [:div
                [:div.font-medium.ty-text "Critical"]
                [:div.text-xs.ty-text- "Immediate attention required"]]]]]]

           ;; Department Routing with better tags
           [:div
            [:label.block.text-sm.font-medium.ty-text.mb-2 "Department(s)"]
            [:ty-multiselect
             {:placeholder "Select relevant departments..."
              :value (str/join "," (:department form-data))
              :on {:change (fn [event]
                             (let [values (-> event .-detail .-values)]
                               (handle-department-change (set values))))}}
             [:ty-tag {:value "sales"
                       :flavor "primary"}
              [:div.flex.items-center.gap-2.p-1
               [:ty-icon {:name "briefcase"
                          :size "xs"}]
               [:span "Sales & Business Development"]]]
             [:ty-tag {:value "support"
                       :flavor "success"}
              [:div.flex.items-center.gap-2.p-1
               [:ty-icon {:name "life-buoy"
                          :size "xs"}]
               [:span "Customer Support"]]]
             [:ty-tag {:value "technical"
                       :flavor "secondary"}
              [:div.flex.items-center.gap-2.p-1
               [:ty-icon {:name "settings"
                          :size "xs"}]
               [:span "Technical & Engineering"]]]
             [:ty-tag {:value "billing"
                       :flavor "warning"}
              [:div.flex.items-center.gap-2.p-1
               [:ty-icon {:name "credit-card"
                          :size "xs"}]
               [:span "Billing & Finance"]]]
             [:ty-tag {:value "partnership"
                       :flavor "neutral"}
              [:div.flex.items-center.gap-2.p-1
               [:ty-icon {:name "handshake"
                          :size "xs"}]
               [:span "Partnerships & Alliances"]]]]]]]

         ;; Third Column - Tips & Newsletter (1/4)
         [:div.space-y-6
          ;; Message tips
          [:div.ty-floating.p-4.rounded-lg
           [:div.flex.items-start.gap-3
            [:ty-icon {:name "lightbulb"
                       :size "lg"
                       :class "ty-text-warning"}]
            [:div
             [:h4.font-semibold.ty-text.mb-3 "Tips for a great message"]
             [:div.text-sm.ty-text-.space-y-2
              [:div.flex.items-start.gap-2
               [:span.ty-text-success.font-bold "•"]
               [:span "Be specific about your needs or issue"]]
              [:div.flex.items-start.gap-2
               [:span.ty-text-success.font-bold "•"]
               [:span "Include relevant details like timeline or urgency"]]
              [:div.flex.items-start.gap-2
               [:span.ty-text-success.font-bold "•"]
               [:span "Mention any previous communication or reference numbers"]]
              [:div.flex.items-start.gap-2
               [:span.ty-text-success.font-bold "•"]
               [:span "Tell us your preferred response method"]]]]]]

          ;; Newsletter consent
          [:div.ty-floating.p-4.rounded-lg
           [:div.flex.items-start.gap-3
            [:ty-icon {:name "mail"
                       :size "lg"
                       :class "ty-text"}]
            [:div.flex-1
             [:label.inline-flex.items-start.gap-2.cursor-pointer
              [:ty-checkbox {:checked (:newsletter-consent form-data)
                             :on {:change (handle-checkbox-change :newsletter-consent)}}]
              [:span "I would like to receive updates and marketing communications about your products and services."]]
             [:p.text-xs.ty-text-.mt-2 "You can unsubscribe at any time. See our privacy policy for details."]]]]]

         ;; Right Column - Message (1/4)
         [:div.ty-floating.p-6.rounded-lg
          [:div.flex.items-center.gap-3.mb-6
           [:ty-icon {:name "message-square"
                      :size "lg"
                      :class "ty-text-success"}]
           [:h3.text-lg.font-semibold.ty-text "Your Message"]]

          [:div
           [:ty-textarea {:label "Message"
                          :value (:message form-data)
                          :placeholder "Please provide detailed information about your inquiry. Include any relevant context that will help us assist you better..."
                          :min-height "280px"
                          :max-height "400px"
                          :required true
                          :on {:change (handle-field-change :message)}}]
           [:div.flex.justify-between.items-center.mt-2
            (when (and (contains? touched-fields :message)
                       (contains? validation-errors :message))
              [:p.text-sm.ty-text-danger.flex.items-center.gap-2
               [:ty-icon {:name "alert-circle"
                          :size "xs"}]
               (get validation-errors :message)])
            [:div.flex.items-center.gap-2
             [:span.text-xs.ty-text-
              {:class (cond
                        (> (count (:message form-data)) 1800) "ty-text-warning"
                        (> (count (:message form-data)) 1000) "ty-text-success"
                        :else "ty-text-")}
              (str (count (:message form-data)) "/2000")]
             [:ty-icon {:name (cond
                                (< (count (:message form-data)) 20) "alert-circle"
                                (> (count (:message form-data)) 1800) "alert-triangle"
                                :else "check-circle")
                        :size "xs"
                        :class (cond
                                 (< (count (:message form-data)) 20) "ty-text-danger"
                                 (> (count (:message form-data)) 1800) "ty-text-warning"
                                 :else "ty-text-success")}]]]]]]
        ;; Submit Section
        [:div.border-t.ty-border.pt-6.flex.flex-col.sm:flex-row.gap-4.justify-between.items-center
         [:div.text-sm.ty-text-.text-center.sm:text-left
          [:p "By submitting this form, you agree to our"]
          [:a.ty-text-primary.underline.hover:no-underline.ml-1
           {:href "#"
            :on {:click (fn [e] (.preventDefault e))}} "Terms of Service"]
          [:span " and "]
          [:a.ty-text-primary.underline.hover:no-underline
           {:href "#"
            :on {:click (fn [e] (.preventDefault e))}} "Privacy Policy"]]

         [:div.flex.gap-3
          [:ty-button
           {:type "button"
            :flavor "secondary"
            :on {:click reset-form}}
           [:ty-icon {:name "refresh-ccw"
                      :size "sm"}]
           "Reset"]
          [:ty-button
           {:type "submit"
            :flavor "primary"
            :disabled is-submitting
            :class (when is-submitting ["opacity-75" "cursor-not-allowed"])}
           (if is-submitting
             [:div.flex.items-center.gap-2
              {:slot "start"}
              [:ty-icon
               {:name "loader-2"
                :spin true
                :size "sm"}]
              "Sending..."]
             [:div.flex.items-center.gap-2
              [:ty-icon {:name "send"
                         :size "sm"}]
              "Send Message"])]]]]

      ;; Additional Information
      [:div.ty-floating.p-6.rounded-lg
       [:h3.text-lg.font-semibold.ty-text.mb-4 "Other Ways to Reach Us"]
       [:div.grid.grid-cols-1.md:grid-cols-3.gap-6
        [:div.flex.items-center.gap-3
         [:ty-icon {:name "mail"
                    :size "sm"}]
         [:div
          [:p.font-medium.ty-text "Email"]
          [:p.text-sm.ty-text- "support@example.com"]]]
        [:div.flex.items-center.gap-3
         [:ty-icon {:name "phone"
                    :size "sm"}]
         [:div
          [:p.font-medium.ty-text "Phone"]
          [:p.text-sm.ty-text- "+1 (555) 123-4567"]]]
        [:div.flex.items-center.gap-3
         [:ty-icon {:name "map-pin"
                    :size "sm"}]
         [:div
          [:p.font-medium.ty-text "Address"]
          [:p.text-sm.ty-text- "123 Business Ave, Suite 100"]]]]

       [:div.mt-6.p-4.ty-bg-info-.rounded-lg
        [:div.flex.items-start.gap-3
         [:ty-icon {:name "info"
                    :size "sm"}]
         [:div.text-sm
          [:p.ty-text.font-medium "Response Time"]
          [:p.ty-text "We typically respond to all inquiries within 24 hours during business days. For urgent technical issues, please call us directly."]]]]]]

     ;; Success Modal  
     (when success-modal-open
       (success-modal-content submitted-data close-success-modal reset-form))]))
;; Success Modal Helper Functions

