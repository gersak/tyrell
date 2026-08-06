(ns tyrell.site.views.user-profile
  (:require [clojure.string :as str]
            [tyrell.site.state :as state]))

;; ============================================================================
;; Validation Functions
;; ============================================================================

(defn validate-email [email]
  (let [email-regex #"^[^\s@]+@[^\s@]+\.[^\s@]+$"]
    (and (not-empty email) (re-matches email-regex email))))

(defn validate-phone [phone]
  (let [phone-regex #"^\+?[\d\s\(\)\-]{10,}$"]
    (and (not-empty phone) (re-matches phone-regex phone))))

(defn validate-field [field-key value]
  (case field-key
    :first-name (if (or (empty? value) (< (count (str/trim value)) 2))
                  "First name must be at least 2 characters"
                  nil)
    :last-name (if (or (empty? value) (< (count (str/trim value)) 2))
                 "Last name must be at least 2 characters"
                 nil)
    :email (cond
             (empty? value) "Email address is required"
             (not (validate-email value)) "Please enter a valid email address"
             :else nil)
    :phone (cond
             (empty? value) "Phone number is required"
             (not (validate-phone value)) "Please enter a valid phone number"
             :else nil)
    :job-title (if (empty? value)
                 "Job title is required"
                 nil)
    :company (if (empty? value)
               "Company name is required"
               nil)
    :bio (cond
           (empty? value) "Professional bio is required"
           (< (count (str/trim value)) 20) "Bio must be at least 20 characters"
           (> (count value) 500) "Bio must not exceed 500 characters"
           :else nil)
    nil))

(defn validate-form [form-data]
  (->> form-data
       (map (fn [[k v]] [k (validate-field k v)]))
       (filter (fn [[_ v]] v))
       (into {})))

;; ============================================================================
;; Event Handlers
;; ============================================================================

(defn handle-field-change [field-key]
  (fn [event]
    (let [value (-> event .-detail .-value)]
      (swap! state/state update-in [:user-profile :form-data] assoc field-key value)
      (swap! state/state update-in [:user-profile :touched-fields] conj field-key)
      (let [error (validate-field field-key value)]
        (if error
          (swap! state/state assoc-in [:user-profile :validation-errors field-key] error)
          (swap! state/state update-in [:user-profile :validation-errors] dissoc field-key))))))

(defn handle-form-submit [event]
  (.preventDefault event)
  (let [form-data (get-in @state/state [:user-profile :form-data])
        errors (validate-form form-data)]
    (swap! state/state assoc-in [:user-profile :touched-fields]
           #{:first-name :last-name :email :phone :job-title :company :bio})
    (if (empty? errors)
      (do
        (swap! state/state assoc-in [:user-profile :is-submitting] true)
        (js/setTimeout
         (fn []
           (swap! state/state assoc-in [:user-profile :is-submitting] false)
           (swap! state/state assoc-in [:user-profile :success-modal-open] true)
           (swap! state/state assoc-in [:user-profile :saved-data] form-data))
         1000))
      (swap! state/state assoc-in [:user-profile :validation-errors] errors))))

(defn handle-export-click []
  (let [form-data (get-in @state/state [:user-profile :form-data])]
    (swap! state/state assoc-in [:user-profile :export-modal-open] true)
    (swap! state/state assoc-in [:user-profile :exported-data] form-data)))

(defn handle-cancel []
  (swap! state/state assoc-in [:user-profile :form-data]
         {:first-name "John"
          :last-name "Doe"
          :email "john.doe@example.com"
          :phone "+1 (555) 123-4567"
          :job-title "Senior Software Developer"
          :company "TechCorp Inc."
          :bio "Passionate software developer with 8+ years of experience building web applications. Specializes in ClojureScript, React, and modern web technologies."})
  (swap! state/state assoc-in [:user-profile :touched-fields] #{})
  (swap! state/state assoc-in [:user-profile :validation-errors] {}))

;; ============================================================================
;; UI Helpers
;; ============================================================================

(defn- section-divider [label]
  [:div.flex.items-center.gap-3.mb-3
   {:style {:margin-top "1.25rem"}}
   [:span.text-xs.font-semibold.tracking-widest.uppercase.ty-text-- label]
   [:div.flex-1
    {:style {:height "1px"
             :background "var(--ty-border)"}}]])

;; ============================================================================
;; Personal Information
;; ============================================================================

(defn personal-info-section [{:keys [form-data errors touched on-change]}]
  [:div
   (section-divider "Personal")
   [:div.grid.grid-cols-2.gap-3
    [:ty-input {:type "text"
                :label "First Name"
                :value (:first-name form-data)
                :placeholder "First"
                :required true
                :error (when (contains? touched :first-name) (:first-name errors))
                :on {:input (on-change :first-name)}}]
    [:ty-input {:type "text"
                :label "Last Name"
                :value (:last-name form-data)
                :placeholder "Last"
                :required true
                :error (when (contains? touched :last-name) (:last-name errors))
                :on {:input (on-change :last-name)}}]
    [:ty-input {:type "email"
                :label "Email"
                :value (:email form-data)
                :placeholder "you@example.com"
                :required true
                :error (when (contains? touched :email) (:email errors))
                :on {:input (on-change :email)}}]
    [:ty-input {:type "tel"
                :label "Phone"
                :value (:phone form-data)
                :placeholder "+1 (555) 123-4567"
                :required true
                :error (when (contains? touched :phone) (:phone errors))
                :on {:input (on-change :phone)}}]]])

;; ============================================================================
;; Professional Information
;; ============================================================================

(defn professional-info-section [{:keys [form-data errors touched on-change]}]
  [:div
   (section-divider "Professional")
   [:div.grid.grid-cols-2.gap-3.mb-3
    [:ty-input {:type "text"
                :label "Job Title"
                :value (:job-title form-data)
                :placeholder "Your title"
                :error (when (contains? touched :job-title) (:job-title errors))
                :on {:input (on-change :job-title)}}]
    [:ty-input {:type "text"
                :label "Company"
                :value (:company form-data)
                :placeholder "Company name"
                :error (when (contains? touched :company) (:company errors))
                :on {:input (on-change :company)}}]]

   [:ty-textarea {:label "Bio"
                  :max-height "110px"
                  :value (:bio form-data)
                  :placeholder "Professional background..."
                  :error (when (contains? touched :bio) (:bio errors))
                  :on {:change (on-change :bio)}}]
   [:div.flex.justify-end.mt-1
    [:span.text-xs
     {:class (if (> (count (:bio form-data "")) 450) "ty-text-warning" "ty-text--")}
     (str (count (:bio form-data "")) "/500")]]

   [:div.mt-3
    ;; label attr = clean display text (field summary + chips); rich content
    ;; stays for the option list; data-glyph feeds the chip template
    [:ty-select {:id "profile-skills"
                 :multiple true
                 :placeholder "Skills & technologies..."
                 :value "clojurescript,react"}
     (for [[value flavor glyph label] [["clojurescript" "primary" "λ" "ClojureScript"]
                                       ["react" "neutral" "⚛" "React"]
                                       ["typescript" "neutral" "TS" "TypeScript"]
                                       ["nodejs" "success" "JS" "Node.js"]
                                       ["postgresql" "neutral" "🐘" "PostgreSQL"]
                                       ["python" nil "🐍" "Python"]
                                       ["rust" nil "🦀" "Rust"]
                                       ["docker" nil "🐳" "Docker"]
                                       ["graphql" nil "QL" "GraphQL"]
                                       ["aws" nil "☁" "AWS"]]]
       [:ty-option (cond-> {:value value :label label :data-glyph glyph}
                     flavor (assoc :flavor flavor))
        [:div.flex.items-center.gap-1.5
         [:span.font-bold.text-xs glyph] [:span label]]])]
    [:div.flex.flex-wrap.gap-2.mt-2
     [:ty-selected-tags {:for "profile-skills"}
      [:template
       [:ty-tag {:flavor "{flavor}" :dismissible true :pill true}
        [:span.font-bold.text-xs {:slot "start"} "{data-glyph}"]
        "{label}"]]]]]])

;; ============================================================================
;; Location & Preferences
;; ============================================================================

(defn location-preferences-section []
  [:div
   (section-divider "Location & Language")
   [:div.grid.grid-cols-2.gap-3
    [:div
     [:ty-select {:value "us" :placeholder "Country"}
      [:ty-option {:value "us"}
       [:div.flex.items-center.gap-2 [:span "🇺🇸"] [:span "United States"]]]
      [:ty-option {:value "ca"}
       [:div.flex.items-center.gap-2 [:span "🇨🇦"] [:span "Canada"]]]
      [:ty-option {:value "uk"}
       [:div.flex.items-center.gap-2 [:span "🇬🇧"] [:span "United Kingdom"]]]
      [:ty-option {:value "de"}
       [:div.flex.items-center.gap-2 [:span "🇩🇪"] [:span "Germany"]]]
      [:ty-option {:value "fr"}
       [:div.flex.items-center.gap-2 [:span "🇫🇷"] [:span "France"]]]
      [:ty-option {:value "jp"}
       [:div.flex.items-center.gap-2 [:span "🇯🇵"] [:span "Japan"]]]]]
    [:div
     [:ty-select {:value "est" :placeholder "Timezone"}
      [:ty-option {:value "pst"}
       [:div.flex.items-center.justify-between.w-full
        [:span "Pacific"] [:span.font-mono.text-xs.ty-text-- "UTC−8"]]]
      [:ty-option {:value "mst"}
       [:div.flex.items-center.justify-between.w-full
        [:span "Mountain"] [:span.font-mono.text-xs.ty-text-- "UTC−7"]]]
      [:ty-option {:value "cst"}
       [:div.flex.items-center.justify-between.w-full
        [:span "Central"] [:span.font-mono.text-xs.ty-text-- "UTC−6"]]]
      [:ty-option {:value "est"}
       [:div.flex.items-center.justify-between.w-full
        [:span "Eastern"] [:span.font-mono.text-xs.ty-text-- "UTC−5"]]]
      [:ty-option {:value "utc"}
       [:div.flex.items-center.justify-between.w-full
        [:span "UTC"] [:span.font-mono.text-xs.ty-text-- "UTC+0"]]]]]
    [:div
     [:ty-select {:value "en" :placeholder "Language"}
      [:ty-option {:value "en"}
       [:div.flex.items-center.gap-2
        [:span.font-mono.text-xs.ty-text-- "EN"] [:span "English"]]]
      [:ty-option {:value "es"}
       [:div.flex.items-center.gap-2
        [:span.font-mono.text-xs.ty-text-- "ES"] [:span "Español"]]]
      [:ty-option {:value "fr"}
       [:div.flex.items-center.gap-2
        [:span.font-mono.text-xs.ty-text-- "FR"] [:span "Français"]]]
      [:ty-option {:value "de"}
       [:div.flex.items-center.gap-2
        [:span.font-mono.text-xs.ty-text-- "DE"] [:span "Deutsch"]]]]]
    [:div
     [:ty-select {:value "auto" :placeholder "Theme"}
      [:ty-option {:value "light"}
       [:div.flex.items-center.gap-2
        [:ty-icon {:name "sun" :size "xs"}] [:span "Light"]]]
      [:ty-option {:value "dark"}
       [:div.flex.items-center.gap-2
        [:ty-icon {:name "moon" :size "xs"}] [:span "Dark"]]]
      [:ty-option {:value "auto"}
       [:div.flex.items-center.gap-2
        [:ty-icon {:name "settings" :size "xs"}] [:span "System"]]]]]]])

;; ============================================================================
;; Security & Preferences
;; ============================================================================

(defn security-section []
  [:div
   (section-divider "Security & Preferences")
   [:div.grid.grid-cols-2.gap-3.mb-4
    [:ty-input {:type "password"
                :label "Current Password"
                :placeholder "••••••••"
                :autocomplete "current-password"}
     [:ty-icon {:slot "start" :name "lock" :size "sm"}]]
    [:ty-input {:type "password"
                :label "New Password"
                :placeholder "••••••••"
                :autocomplete "new-password"}
     [:ty-icon {:slot "start" :name "lock" :size "sm"}]]]

   [:div.grid.grid-cols-2.gap-x-6.gap-y-2
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text
     [:ty-checkbox {:name "notif-updates" :checked ""}]
     [:span "Product updates"]]
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text
     [:ty-checkbox {:name "privacy-2fa"}]
     [:span "Two-factor auth"]]
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text
     [:ty-checkbox {:name "notif-newsletter" :checked ""}]
     [:span "Newsletter"]]
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text
     [:ty-checkbox {:name "privacy-public" :checked ""}]
     [:span "Public profile"]]
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text
     [:ty-checkbox {:name "notif-marketing"}]
     [:span "Promotions"]]
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text
     [:ty-checkbox {:name "account-autosave" :checked ""}]
     [:span "Auto-save drafts"]]]])

;; ============================================================================
;; Form Actions
;; ============================================================================

(defn form-actions [{:keys [is-submitting has-errors on-export on-cancel]}]
  [:div.flex.items-center.justify-between.pt-4.border-t.ty-border
   {:style {:margin-top "1.25rem"}}
   [:div.flex.items-center.gap-1.5
    [:ty-icon {:name (if has-errors "alert-circle" "check-circle")
               :size "xs"
               :class (if has-errors "ty-text-danger" "ty-text-success")}]
    [:span.text-xs
     {:class (if has-errors "ty-text-danger" "ty-text-success")}
     (if has-errors "Fix errors before saving" "Ready to save")]]
   [:div.flex.gap-2
    [:ty-button {:type "button" :flavor "neutral" :size "sm"
                 :on {:click on-cancel}}
     "Cancel"]
    [:ty-button {:type "button" :flavor "neutral" :size "sm"
                 :on {:click on-export}}
     [:ty-icon {:name "download" :size "xs" :class "mr-1"}]
     "Export"]
    [:ty-button {:type "submit" :flavor "primary" :size "sm"
                 :disabled (or is-submitting has-errors)}
     (if is-submitting
       [:div.flex.items-center.gap-1
        [:ty-icon {:name "loader-2" :spin true :size "xs"}]
        "Saving…"]
       [:div.flex.items-center.gap-1
        [:ty-icon {:name "save" :size "xs"}]
        "Save"])]]])

;; ============================================================================
;; Avatar Upload Modal
;; ============================================================================

(defn avatar-upload-modal [{:keys [open on-close]}]
  [:ty-modal {:open open :on {:close on-close}}
   [:div.p-6.max-w-md.ty-elevated.rounded-lg
    [:h3.text-lg.font-semibold.ty-text.mb-4 "Upload Profile Photo"]
    [:div.border-2.border-dashed.ty-border.rounded-lg.p-8.text-center.hover:ty-border-primary.transition-colors.cursor-pointer.mb-4
     [:ty-icon.ty-text-.mb-3 {:name "upload" :size "2xl"}]
     [:p.ty-text.text-sm.font-medium.mb-1 "Drag and drop or click to browse"]
     [:div.flex.justify-center.gap-2.mt-3
      [:span.px-2.py-0.5.ty-bg-success-.ty-text-success.rounded.text-xs "JPG"]
      [:span.px-2.py-0.5.ty-bg-success-.ty-text-success.rounded.text-xs "PNG"]
      [:span.px-2.py-0.5.ty-bg-success-.ty-text-success.rounded.text-xs "WebP"]
      [:span.px-2.py-0.5.ty-bg-info-.ty-text.rounded.text-xs "Max 5MB"]]
     [:input.hidden {:type "file" :accept "image/*"}]]
    [:div.flex.gap-2.justify-end
     [:ty-button {:flavor "neutral" :size "sm" :on {:click on-close}} "Cancel"]
     [:ty-button {:flavor "primary" :size "sm"}
      [:ty-icon {:name "save" :size "xs" :class "mr-1"}]
      "Save Photo"]]]])

;; ============================================================================
;; Success Modal
;; ============================================================================

(defn success-modal [{:keys [open on-close saved-data]}]
  [:ty-modal {:open open :on {:close on-close}}
   [:div.p-6.max-w-lg.ty-elevated.rounded-lg
    [:div.flex.items-center.gap-3.mb-5
     [:div.w-10.h-10.ty-bg-success.rounded-full.flex.items-center.justify-center
      [:ty-icon {:name "check" :size "lg" :class "ty-text++"}]]
     [:div
      [:h3.text-lg.font-semibold.ty-text "Profile saved"]
      [:p.text-sm.ty-text- "All changes have been applied"]]]
    [:div.ty-content.p-4.rounded-lg.grid.grid-cols-2.gap-3.text-sm.mb-5
     [:div [:p.ty-text--.text-xs.mb-0.5 "Name"]
      [:p.ty-text.font-medium (str (:first-name saved-data) " " (:last-name saved-data))]]
     [:div [:p.ty-text--.text-xs.mb-0.5 "Email"]
      [:p.ty-text (:email saved-data)]]
     [:div [:p.ty-text--.text-xs.mb-0.5 "Phone"]
      [:p.ty-text (:phone saved-data)]]
     [:div [:p.ty-text--.text-xs.mb-0.5 "Company"]
      [:p.ty-text (:company saved-data)]]]
    [:div.flex.justify-end
     [:ty-button {:flavor "primary" :size "sm" :on {:click on-close}} "Done"]]]])

;; ============================================================================
;; Export Modal
;; ============================================================================

(defn export-modal [{:keys [open on-close exported-data]}]
  [:ty-modal {:open open :on {:close on-close}}
   [:div.p-6.max-w-sm.ty-elevated.rounded-lg
    [:div.flex.items-center.gap-3.mb-5
     [:div.w-10.h-10.ty-bg-info.rounded-full.flex.items-center.justify-center
      [:ty-icon {:name "download" :size "lg" :class "ty-text++"}]]
     [:div
      [:h3.text-lg.font-semibold.ty-text "Export Profile"]
      [:p.text-sm.ty-text- "Choose a format"]]]
    [:div.space-y-2.mb-5
     (for [[format icon label hint color]
           [["json" "file-json" "JSON" "Machine-readable" "ty-text-primary"]
            ["csv"  "table"     "CSV"  "Spreadsheet"       "ty-text-success"]
            ["pdf"  "file-text" "PDF"  "Printable"         "ty-text-danger"]]]
       ^{:key format}
       [:div.flex.items-center.justify-between.w-full.p-3.border.ty-border.rounded-lg.cursor-pointer.hover:ty-border-primary.transition-colors
        [:div
         [:p.font-medium.ty-text.text-sm label]
         [:p.text-xs.ty-text- hint]]
        [:ty-icon {:name icon :class color}]])]
    [:div.flex.gap-2.justify-end
     [:ty-button {:flavor "neutral" :size "sm" :on {:click on-close}} "Cancel"]
     [:ty-button {:flavor "primary" :size "sm"}
      [:ty-icon {:name "download" :size "xs" :class "mr-1"}]
      "Download"]]]])

;; ============================================================================
;; Main View
;; ============================================================================

(defn view []
  (let [{:keys [avatar-modal-open success-modal-open export-modal-open
                form-data validation-errors touched-fields is-submitting saved-data exported-data]}
        (get @state/state :user-profile
             {:avatar-modal-open false
              :success-modal-open false
              :export-modal-open false
              :form-data {:first-name "John"
                          :last-name "Doe"
                          :email "john.doe@example.com"
                          :phone "+1 (555) 123-4567"
                          :job-title "Senior Software Developer"
                          :company "TechCorp Inc."
                          :bio "Passionate software developer with 8+ years of experience building web applications. Specializes in ClojureScript, React, and modern web technologies."}
              :validation-errors {}
              :touched-fields #{}
              :is-submitting false
              :saved-data nil
              :exported-data nil})
        has-errors (not (empty? validation-errors))]
    [:div
     ;; Compact profile header
     [:div.flex.items-center.gap-3.pb-4.border-b.ty-border
      [:div.relative.cursor-pointer
       {:on {:click #(swap! state/state assoc-in [:user-profile :avatar-modal-open] true)}}
       [:div.w-10.h-10.ty-surface-content.rounded-full.flex.items-center.justify-center.border-2.border-dashed.ty-border.hover:ty-border-primary.transition-colors
        [:ty-icon.ty-text- {:name "user" :size "lg"}]]
       [:div.absolute.-bottom-1.-right-1.w-4.h-4.ty-bg-primary.rounded-full.flex.items-center.justify-center
        [:ty-icon {:name "plus" :size "xs" :class "ty-text++"}]]]
      [:div.min-w-0
       [:p.text-sm.font-semibold.ty-text.truncate
        (str (:first-name form-data "John") " " (:last-name form-data "Doe"))]
       [:p.text-xs.ty-text--.truncate
        (str (:job-title form-data "") " · " (:company form-data ""))]]]

     [:form
      {:on {:submit handle-form-submit}}

      (personal-info-section {:form-data form-data
                              :errors validation-errors
                              :touched touched-fields
                              :on-change handle-field-change})

      (professional-info-section {:form-data form-data
                                  :errors validation-errors
                                  :touched touched-fields
                                  :on-change handle-field-change})

      (location-preferences-section)
      (security-section)

      (form-actions {:is-submitting is-submitting
                     :has-errors has-errors
                     :on-export handle-export-click
                     :on-cancel handle-cancel})]

     (avatar-upload-modal {:open avatar-modal-open
                           :on-close #(swap! state/state assoc-in [:user-profile :avatar-modal-open] false)})

     (success-modal {:open success-modal-open
                     :on-close #(swap! state/state assoc-in [:user-profile :success-modal-open] false)
                     :saved-data saved-data})

     (export-modal {:open export-modal-open
                    :on-close #(swap! state/state assoc-in [:user-profile :export-modal-open] false)
                    :exported-data exported-data})]))
