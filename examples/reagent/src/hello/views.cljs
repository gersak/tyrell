(ns hello.views
  (:require [tyrell.react :as ty]
            [hello.state :as state]
            [reagent.core :as r]
            [tyrell.router :as router]))

(defn- icon-list-item [icon-name text]
  [:li.flex.items-center.gap-2
   [:> ty/TyIcon {:name icon-name :size "sm" :className "ty-text-primary"}]
   text])

(defn- icon-tile [icon-name]
  [:div.flex.flex-col.items-center.gap-2.p-3.rounded-lg.ty-content
   {:style {:border "1px solid var(--ty-border-)"}}
   [:> ty/TyIcon {:name icon-name :size "lg" :className "ty-text-primary"}]
   [:span.text-xs.ty-text--.font-mono icon-name]])

(defn home-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/home-id)
      [:div.max-w-4xl.mx-auto
     [:header.ty-elevated.p-6.rounded-lg.mb-8
      [:div.flex.items-center.gap-3.mb-2
       [:> ty/TyIcon {:name "code" :size "lg" :className "ty-text-primary"}]
       [:h1.text-3xl.font-bold.ty-text++
        "Welcome to Reagent + Ty Demo"]]
      [:p.ty-text.text-lg
       "This demo showcases Reagent with Ty React wrappers for proper event handling."]]

     [:div.grid.md:grid-cols-2.gap-6.mb-8
      [:section.ty-elevated.p-6.rounded-lg
       [:h2.text-xl.font-semibold.mb-4.ty-text++.flex.items-center.gap-2
        [:> ty/TyIcon {:name "menu" :size "sm" :className "ty-text-primary"}]
        "Navigation Features"]
       [:ul.space-y-2.ty-text
        (icon-list-item "grid" "Responsive sidebar navigation")
        (icon-list-item "menu" "Mobile overlay menu")
        (icon-list-item "moon" "Theme toggle (light/dark)")
        (icon-list-item "click" "tyrell.router with browser history")]]

      [:section.ty-elevated.p-6.rounded-lg
       [:h2.text-xl.font-semibold.mb-4.ty-text++.flex.items-center.gap-2
        [:> ty/TyIcon {:name "code" :size "sm" :className "ty-text-primary"}]
        "React Wrappers"]
       [:ul.space-y-2.ty-text
        (icon-list-item "send" "Full event handling support")
        (icon-list-item "code" "TypeScript type definitions")
        (icon-list-item "check" "Reagent-friendly API")
        (icon-list-item "users" "All 18 components available")]]]

     ;; Icon showcase — proves icons are registered and rendering
     [:section.ty-elevated.p-6.rounded-lg
      [:h2.text-xl.font-semibold.mb-2.ty-text++.flex.items-center.gap-2
       [:> ty/TyIcon {:name "palette" :size "sm" :className "ty-text-primary"}]
       "Registered Icons"]
      [:p.ty-text-.text-sm.mb-4
       "Mixed Lucide + Material Filled, registered in "
       [:code.font-mono.text-xs.ty-bg-neutral-.px-1.rounded "hello.core/register-icons!"]
       " — referenced by name in Hiccup."]
      [:div.grid.grid-cols-4.md:grid-cols-6.gap-3
       (for [n ["home" "edit" "menu" "user" "settings"
                "save" "trash" "download" "send" "check"
                "code" "palette" "users" "bar-chart" "briefcase"
                "sun" "moon" "click" "refresh-cw" "loader"
                "alert-circle" "x" "grid"]]
         ^{:key n} (icon-tile n))]]])))

;; Form validation functions
(defn validate-field [field value]
  (case field
    :name (cond
            (empty? (str value)) "Name is required"
            (< (count (str value)) 2) "Name must be at least 2 characters"
            :else nil)
    :email (cond
             (empty? (str value)) "Email is required"
             (not (re-matches #"^[^\s@]+@[^\s@]+\.[^\s@]+$" (str value))) "Please enter a valid email address"
             :else nil)
    :phone (cond
             (and (not (empty? (str value)))
                  (not (re-matches #"^[\d\s\-\+\(\)]{10,}$" (str value)))) "Please enter a valid phone number"
             :else nil)
    :bio (cond
           (> (count (str value)) 500) "Bio must be less than 500 characters"
           :else nil)
    :birthdate (cond
                 (empty? (str value)) "Birth date is required"
                 :else nil)
    nil))

(defn forms-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/forms-id)
      (let [form-data (:form @state/app-state)
          errors (:form-errors @state/app-state)
          is-submitting (:form-submitting @state/app-state)]

      [:div.max-w-4xl.mx-auto.space-y-8
       ;; Header
       [:div.ty-elevated.p-6.rounded-lg
        [:div.flex.items-center.justify-between.mb-4
         [:div
          [:h1.text-2xl.font-bold.ty-text++ "User Profile Form"]
          [:p.ty-text-.text-sm.mt-1 "Complete form with validation using React wrappers"]]
         [:div.flex.items-center.gap-2
          [:> ty/TyIcon {:name "user"
                         :size "lg"
                         :className "ty-text-primary"}]]]

        ;; Progress indicator
        (let [completed-fields (->> form-data
                                    (filter (fn [[k v]] (and v (not (empty? (str v))))))
                                    count)
              total-fields (count form-data)
              progress (* (/ completed-fields total-fields) 100)]
          [:div
           [:div.flex.justify-between.text-sm.mb-2
            [:span.ty-text+ "Form Progress"]
            [:span.ty-text+ (str completed-fields "/" total-fields " fields")]]
           [:div.w-full.ty-bg-neutral-.rounded-full.h-2
            [:div.ty-bg-primary.h-2.rounded-full.transition-all.duration-300
             {:style {:width (str progress "%")}}]]])]

       ;; Form sections
       [:div.grid.lg:grid-cols-2.gap-8
        ;; Personal Information
        [:section.ty-elevated.p-6.rounded-lg
         [:h2.text-lg.font-semibold.mb-6.ty-text++.flex.items-center.gap-2
          [:> ty/TyIcon {:name "user" :size "sm"}]
          "Personal Information"]

         [:div.space-y-5
          ;; Name field
          [:div
           [:label.block.text-sm.font-medium.ty-text+.mb-2 "Full Name *"]
           [:> ty/TyInput {:type "text"
                           :placeholder "Enter your full name"
                           :className (str "w-full " (when (:name errors) "error"))
                           :value (:name form-data)
                           :onChange #(do
                                       (swap! state/app-state assoc-in [:form :name] (.. % -detail -value))
                                       (swap! state/app-state assoc-in [:form-errors :name]
                                              (validate-field :name (.. % -detail -value))))}]
           (when (:name errors)
             [:p.text-xs.ty-text-danger.mt-1.flex.items-center.gap-1
              [:> ty/TyIcon {:name "alert-circle" :size "xs"}]
              (:name errors)])]

          ;; Email field
          [:div
           [:label.block.text-sm.font-medium.ty-text+.mb-2 "Email Address *"]
           [:> ty/TyInput {:type "email"
                           :placeholder "you@company.com"
                           :className (str "w-full " (when (:email errors) "error"))
                           :value (:email form-data)
                           :onChange #(do
                                       (swap! state/app-state assoc-in [:form :email] (.. % -detail -value))
                                       (swap! state/app-state assoc-in [:form-errors :email]
                                              (validate-field :email (.. % -detail -value))))}]
           (when (:email errors)
             [:p.text-xs.ty-text-danger.mt-1.flex.items-center.gap-1
              [:> ty/TyIcon {:name "alert-circle" :size "xs"}]
              (:email errors)])]

          ;; Phone field
          [:div
           [:label.block.text-sm.font-medium.ty-text+.mb-2 "Phone Number"]
           [:> ty/TyInput {:type "tel"
                           :placeholder "+1 (555) 123-4567"
                           :className (str "w-full " (when (:phone errors) "error"))
                           :value (:phone form-data)
                           :onChange #(do
                                       (swap! state/app-state assoc-in [:form :phone] (.. % -detail -value))
                                       (swap! state/app-state assoc-in [:form-errors :phone]
                                              (validate-field :phone (.. % -detail -value))))}]
           (when (:phone errors)
             [:p.text-xs.ty-text-danger.mt-1.flex.items-center.gap-1
              [:> ty/TyIcon {:name "alert-circle" :size "xs"}]
              (:phone errors)])]

          ;; Birth Date
          [:div
           [:label.block.text-sm.font-medium.ty-text+.mb-2 "Birth Date *"]
           [:> ty/TyDatePicker {:className (str "w-full " (when (:birthdate errors) "error"))
                                :placeholder "Select your birth date"
                                :value (:birthdate form-data)
                                :onChange #(let [value (.. % -detail -value)
                                                 error (validate-field :birthdate value)]
                                             (swap! state/app-state
                                                    (fn [s]
                                                      (-> s
                                                          (assoc-in [:form-errors :birthdate] error)
                                                          (assoc-in [:form :birthdate] value)))))}]
           (when (:birthdate errors)
             [:p.text-xs.ty-text-danger.mt-1.flex.items-center.gap-1
              [:> ty/TyIcon {:name "alert-circle" :size "xs"}]
              (:birthdate errors)])]]]

        ;; Preferences & Bio
        [:section.ty-elevated.p-6.rounded-lg
         [:h2.text-lg.font-semibold.mb-6.ty-text++.flex.items-center.gap-2
          [:> ty/TyIcon {:name "settings" :size "sm"}]
          "Preferences & Bio"]

         [:div.space-y-5
          ;; Role dropdown
          [:div
           [:label.block.text-sm.font-medium.ty-text+.mb-2 "Professional Role"]
           [:> ty/TyDropdown {:className "w-full"
                              :placeholder "Select your role"
                              :value (:role form-data)
                              :onChange #(swap! state/app-state assoc-in [:form :role]
                                                (.. ^js % -detail -option -value))}
            [:> ty/TyOption {:value "developer"}
             [:div.flex.items-center.gap-2
              [:> ty/TyIcon {:name "code" :size "xs"}]
              "Software Developer"]]
            [:> ty/TyOption {:value "designer"}
             [:div.flex.items-center.gap-2
              [:> ty/TyIcon {:name "palette" :size "xs"}]
              "UI/UX Designer"]]
            [:> ty/TyOption {:value "manager"}
             [:div.flex.items-center.gap-2
              [:> ty/TyIcon {:name "users" :size "xs"}]
              "Project Manager"]]
            [:> ty/TyOption {:value "analyst"}
             [:div.flex.items-center.gap-2
              [:> ty/TyIcon {:name "bar-chart" :size "xs"}]
              "Data Analyst"]]
            [:> ty/TyOption {:value "other"}
             [:div.flex.items-center.gap-2
              [:> ty/TyIcon {:name "briefcase" :size "xs"}]
              "Other"]]]]

          ;; Skills multiselect
          [:div
           [:label.block.text-sm.font-medium.ty-text+.mb-2 "Technical Skills"]
           [:> ty/TyMultiselect {:className "w-full"
                                 :placeholder "Select your skills"
                                 :value (when (seq (:skills form-data))
                                          (clojure.string/join "," (:skills form-data)))
                                 :onChange #(let [values (.. ^js % -detail -values)
                                                  values-vec (if (array? values) (vec values) [])]
                                              (swap! state/app-state assoc-in [:form :skills] values-vec))}
            [:> ty/TyTag {:value "javascript" :flavor "primary"} "JavaScript"]
            [:> ty/TyTag {:value "typescript" :flavor "primary"} "TypeScript"]
            [:> ty/TyTag {:value "react"      :flavor "neutral"} "React"]
            [:> ty/TyTag {:value "vue"        :flavor "neutral"} "Vue.js"]
            [:> ty/TyTag {:value "clojure"    :flavor "success"} "Clojure"]
            [:> ty/TyTag {:value "python"     :flavor "warning"} "Python"]
            [:> ty/TyTag {:value "tailwind"   :flavor "secondary"} "Tailwind CSS"]
            [:> ty/TyTag {:value "docker"     :flavor "neutral"} "Docker"]]
           (when (seq (:skills form-data))
             [:p.text-xs.ty-text+.mt-2.flex.items-center.gap-1
              [:> ty/TyIcon {:name "check" :size "xs"}]
              (str (count (:skills form-data)) " skill"
                   (when (> (count (:skills form-data)) 1) "s") " selected")])]

          ;; Bio textarea
          [:div
           [:label.block.text-sm.font-medium.ty-text+.mb-2 "Biography"]
           [:> ty/TyTextarea {:rows 4
                              :placeholder "Tell us about yourself..."
                              :className (str "w-full resize-none " (when (:bio errors) "error"))
                              :value (:bio form-data)
                              :onChange #(do
                                          (swap! state/app-state assoc-in [:form :bio] (.. % -detail -value))
                                          (swap! state/app-state assoc-in [:form-errors :bio]
                                                 (validate-field :bio (.. % -detail -value))))}]
           [:div.flex.justify-between.mt-1
            (when (:bio errors)
              [:p.text-xs.ty-text-danger.flex.items-center.gap-1
               [:> ty/TyIcon {:name "alert-circle" :size "xs"}]
               (:bio errors)])
            [:p.text-xs.ty-text-.ml-auto
             (str (count (str (:bio form-data))) "/500 characters")]]]

          ;; Newsletter checkbox
          [:div.flex.items-center.gap-3
           [:> ty/TyCheckbox {:checked (:newsletter form-data)
                              :onChange #(swap! state/app-state assoc-in [:form :newsletter]
                                                (.. % -detail -checked))}
            "Subscribe to newsletter and product updates"]]]]]

       ;; Form Actions
       [:div.ty-elevated.p-6.rounded-lg
        [:div.flex.flex-col.sm:flex-row.gap-4.justify-between.items-start.sm:items-center
         [:div
          [:p.text-sm.ty-text+ "Review your information before submitting"]
          [:p.text-xs.ty-text-.mt-1 "All fields marked with * are required"]]

         [:div.flex.gap-3.w-full.sm:w-auto
          [:> ty/TyButton {:flavor "secondary"
                           :className "flex-1 sm:flex-none"
                           :onClick (fn [e]
                                      (js/console.log "[RESET] onClick fired" e)
                                      (swap! state/app-state assoc :form {:name ""
                                                                          :email ""
                                                                          :phone ""
                                                                          :role ""
                                                                          :skills []
                                                                          :bio ""
                                                                          :birthdate ""
                                                                          :newsletter false})
                                      (swap! state/app-state assoc :form-errors {})
                                      (js/console.log "[RESET] state after swap:"
                                                      (clj->js @state/app-state)))}
           [:> ty/TyIcon {:name "refresh-cw" :size "xs"}]
           "Reset Form"]

          [:> ty/TyButton {:flavor "primary"
                           :className "flex-1 sm:flex-none"
                           :type "submit"
                           :disabled is-submitting
                           :onClick #(do
                                       (swap! state/app-state assoc :form-submitting true)
                                       (js/setTimeout
                                         (fn []
                                           (swap! state/app-state assoc :form-submitting false)
                                           (js/alert (str "Form submitted! Data: " (pr-str form-data))))
                                         2000))}
           (if is-submitting
             [:<>
              [:> ty/TyIcon {:name "loader" :size "xs" :className "animate-spin"}]
              "Submitting..."]
             [:<>
              [:> ty/TyIcon {:name "send" :size "xs"}]
              "Submit Form"])]]]]]))))

(defn buttons-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/buttons-id)
      [:div.max-w-4xl.mx-auto
     [:section.ty-elevated.p-6.rounded-lg.mb-6
      [:h2.text-xl.font-semibold.mb-4.ty-text++ "Button Examples"]

      [:div.space-y-6
       [:div
        [:h3.font-medium.mb-3.ty-text+ "Basic Buttons"]
        [:div.flex.gap-4.flex-wrap
         [:> ty/TyButton {:onClick #(js/alert "Default clicked!")} "Default"]
         [:> ty/TyButton {:flavor "primary" :onClick #(js/alert "Primary clicked!")} "Primary"]
         [:> ty/TyButton {:flavor "secondary" :onClick #(js/alert "Secondary clicked!")} "Secondary"]]]

       [:div
        [:h3.font-medium.mb-3.ty-text+ "Semantic Buttons"]
        [:div.flex.gap-4.flex-wrap
         [:> ty/TyButton {:flavor "success" :onClick #(js/alert "Success clicked!")} "Success"]
         [:> ty/TyButton {:flavor "warning" :onClick #(js/alert "Warning clicked!")} "Warning"]
         [:> ty/TyButton {:flavor "danger"  :onClick #(js/alert "Danger clicked!")}  "Danger"]]]

       [:div
        [:h3.font-medium.mb-3.ty-text+ "Buttons with Icons"]
        [:div.flex.gap-4.flex-wrap
         [:> ty/TyButton {:flavor "primary"}
          [:> ty/TyIcon {:name "save" :size "sm"}] "Save"]
         [:> ty/TyButton {:flavor "danger"}
          [:> ty/TyIcon {:name "trash" :size "sm"}] "Delete"]
         [:> ty/TyButton {:flavor "secondary"}
          [:> ty/TyIcon {:name "download" :size "sm"}] "Download"]]]]]])))

(defn components-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/components-id)
      [:div.max-w-4xl.mx-auto
     [:section.ty-elevated.p-6.rounded-lg.mb-6
      [:h2.text-xl.font-semibold.mb-4.ty-text++ "Available React Wrapper Components"]

      [:div.grid.md:grid-cols-2.lg:grid-cols-3.gap-4
       (for [component ["TyButton" "TyInput" "TyTextarea" "TyCheckbox"
                        "TyDropdown" "TyOption" "TyMultiselect" "TyTag"
                        "TyModal" "TyIcon" "TyTooltip" "TyPopup"
                        "TyCalendar" "TyCalendarMonth" "TyCalendarNavigation"
                        "TyDatePicker" "TyTabs" "TyTab"]]
         ^{:key component}
         [:div.ty-elevated.p-4.rounded.text-center
          [:code.text-sm.ty-text component]])]]

     [:section.ty-elevated.p-6.rounded-lg
      [:h2.text-xl.font-semibold.mb-4.ty-text++ "Implementation Notes"]
      [:div.space-y-4.ty-text
       [:p "All components use React wrappers from " [:code "tyrell-react"] " for proper event handling."]
       [:pre.ty-bg-neutral-.p-4.rounded.text-sm.overflow-auto
        "[:> ty/TyButton {:onClick #(js/alert \"Clicked!\")} \"Click Me\"]"]
       [:p "Web components are automatically registered via " [:code "ty.js"] " loaded in index.html."]]]])))
