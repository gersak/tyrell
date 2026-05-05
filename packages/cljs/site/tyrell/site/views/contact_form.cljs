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

(defn- section-divider [label]
  [:div.flex.items-center.gap-3.mb-3
   {:style {:margin-top "1.25rem"}}
   [:span.text-xs.font-semibold.tracking-widest.uppercase.ty-text-- label]
   [:div.flex-1
    {:style {:height "1px"
             :background "var(--ty-border)"}}]])

(defn success-modal-content [submitted-data close-success-modal reset-form]
  [:ty-modal {:open true :on {:close close-success-modal}}
   [:div.p-5.ty-elevated.rounded-lg
    {:style {:max-width "480px"}}
    [:div.flex.items-center.gap-3.mb-4
     [:div.w-9.h-9.ty-bg-success.rounded-full.flex.items-center.justify-center
      [:ty-icon {:name "check" :size "sm" :class "ty-text++"}]]
     [:div
      [:h3.text-base.font-semibold.ty-text "Message Sent"]
      [:p.text-xs.ty-text- "We'll respond within 24 hours."]]]
    (when submitted-data
      [:div.ty-content.p-3.rounded-lg.grid.grid-cols-2.gap-2.mb-4
       [:div [:p.text-xs.ty-text--.mb-0.5 "Name"] [:p.text-sm.ty-text (:full-name submitted-data)]]
       [:div [:p.text-xs.ty-text--.mb-0.5 "Email"] [:p.text-sm.ty-text (:email submitted-data)]]
       [:div [:p.text-xs.ty-text--.mb-0.5 "Company"] [:p.text-sm.ty-text (:company submitted-data)]]
       [:div [:p.text-xs.ty-text--.mb-0.5 "Priority"]
        [:span.text-xs.px-1.5.py-0.5.rounded
         {:class (case (:priority submitted-data)
                   "low"      ["ty-bg-neutral-" "ty-text-neutral"]
                   "medium"   ["ty-bg-info-"    "ty-text"]
                   "high"     ["ty-bg-warning-" "ty-text-warning"]
                   "critical" ["ty-bg-danger-"  "ty-text-danger"]
                              ["ty-bg-neutral-" "ty-text-neutral"])}
         (or (:priority submitted-data) "—")]]])
    [:div.flex.gap-2.justify-end
     [:ty-button {:flavor "neutral" :size "sm" :on {:click close-success-modal}} "Close"]
     [:ty-button {:flavor "primary" :size "sm"
                  :on {:click (fn [] (close-success-modal) (reset-form))}}
      "Send Another"]]]])

(defn view []
  (let [{:keys [form-data validation-errors touched-fields is-submitting submission-status submission-message
                success-modal-open submitted-data]}
        (:contact-form @state/state)]
    [:div
     (when submission-status
       [:div.flex.items-center.gap-3.p-3.rounded-lg.mb-4
        {:class (if (= submission-status :success) ["ty-bg-success-"] ["ty-bg-danger-"])}
        [:ty-icon {:name (if (= submission-status :success) "check-circle" "alert-circle")
                   :size "sm"
                   :class (if (= submission-status :success) "ty-text-success" "ty-text-danger")}]
        [:p.text-sm.flex-1
         {:class (if (= submission-status :success) "ty-text-success" "ty-text-danger")}
         submission-message]
        (when (= submission-status :error)
          [:button.text-xs.underline.ty-text-danger
           {:on {:click #(swap! state/state assoc-in [:contact-form :submission-status] nil)}}
           "Dismiss"])])

     [:form {:on {:submit handle-form-submit}}
      (section-divider "Contact")
      [:div.grid.grid-cols-2.gap-3
       [:ty-input {:type "text" :label "Full Name" :value (:full-name form-data)
                   :placeholder "Your full name" :required true :icon "user"
                   :error (when (contains? touched-fields :full-name) (:full-name validation-errors))
                   :on {:input (handle-field-change :full-name)}}]
       [:ty-input {:type "email" :label "Email" :value (:email form-data)
                   :placeholder "your@email.com" :required true :icon "mail"
                   :error (when (contains? touched-fields :email) (:email validation-errors))
                   :on {:input (handle-field-change :email)}}]
       [:ty-input {:type "text" :label "Company" :value (:company form-data)
                   :placeholder "Company name" :required true :icon "building"
                   :error (when (contains? touched-fields :company) (:company validation-errors))
                   :on {:input (handle-field-change :company)}}]
       [:ty-input {:type "text" :label "Subject" :value (:subject form-data)
                   :placeholder "Brief description" :required true
                   :error (when (contains? touched-fields :subject) (:subject validation-errors))
                   :on {:input (handle-field-change :subject)}}]]

      (section-divider "Request")
      [:div.grid.grid-cols-2.gap-3
       [:ty-dropdown {:label "Priority" :value (:priority form-data)
                      :on {:change handle-priority-change}}
        [:ty-option {:value "low"}
         [:div.flex.items-center.gap-2 [:div.w-2.h-2.bg-green-500.rounded-full] [:span "Low"]]]
        [:ty-option {:value "medium"}
         [:div.flex.items-center.gap-2 [:div.w-2.h-2.bg-blue-500.rounded-full] [:span "Medium"]]]
        [:ty-option {:value "high"}
         [:div.flex.items-center.gap-2 [:div.w-2.h-2.bg-yellow-500.rounded-full] [:span "High"]]]
        [:ty-option {:value "critical"}
         [:div.flex.items-center.gap-2 [:div.w-2.h-2.bg-red-500.rounded-full] [:span "Critical"]]]]
       [:ty-multiselect {:placeholder "Department(s)..."
                         :value (str/join "," (:department form-data))
                         :on {:change (fn [event]
                                        (let [values (-> event .-detail .-values)]
                                          (handle-department-change (set values))))}}
        [:ty-tag {:value "sales"       :flavor "primary"}   "Sales"]
        [:ty-tag {:value "support"     :flavor "success"}   "Support"]
        [:ty-tag {:value "technical"   :flavor "secondary"} "Engineering"]
        [:ty-tag {:value "billing"     :flavor "warning"}   "Billing"]
        [:ty-tag {:value "partnership" :flavor "neutral"}   "Partnerships"]]]

      (section-divider "Message")
      [:ty-textarea {:label "Message" :value (:message form-data)
                     :placeholder "Describe your inquiry in detail..."
                     :min-height "140px" :max-height "240px" :required true
                     :error (when (contains? touched-fields :message) (:message validation-errors))
                     :on {:change (handle-field-change :message)}}]
      [:div.flex.justify-end.mt-1
       [:span.text-xs
        {:class (if (> (count (:message form-data "")) 1800) "ty-text-warning" "ty-text--")}
        (str (count (:message form-data "")) "/2000")]]

      [:div.flex.items-center.justify-between.pt-4.border-t.ty-border
       {:style {:margin-top "1.25rem"}}
       [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text-
        [:ty-checkbox {:checked (:newsletter-consent form-data)
                       :on {:change (handle-checkbox-change :newsletter-consent)}}]
        "Newsletter updates"]
       [:div.flex.gap-2
        [:ty-button {:type "button" :flavor "neutral" :size "sm" :on {:click reset-form}}
         "Reset"]
        [:ty-button {:type "submit" :flavor "primary" :size "sm" :disabled is-submitting}
         (if is-submitting
           [:div.flex.items-center.gap-1
            [:ty-icon {:name "loader-2" :spin true :size "xs"}]
            "Sending…"]
           [:div.flex.items-center.gap-1
            [:ty-icon {:name "send" :size "xs"}]
            "Send"])]]]]

     (when success-modal-open
       (success-modal-content submitted-data close-success-modal reset-form))]))

