(ns hello.views
  (:require [clojure.string :as str]
            [hello.state :as state]
            [reagent.core :as r]
            [tyrell.react :as ty]
            [tyrell.router :as router]))

(defn- icon-list-item [icon-name text]
  [:li.flex.items-center.gap-2
   [:> ty/Icon {:name icon-name :size "sm" :className "ty-text-primary"}]
   text])

(defn- icon-tile [icon-name]
  [:div.flex.flex-col.items-center.gap-2.p-3.rounded-lg.ty-content
   {:style {:border "1px solid var(--ty-border-)"}}
   [:> ty/Icon {:name icon-name :size "lg" :className "ty-text-primary"}]
   [:span.text-xs.ty-text--.font-mono icon-name]])

(defn home-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/home-id)
      [:div.max-w-4xl.mx-auto
       [:header.ty-elevated.p-6.rounded-lg.mb-8
        [:div.flex.items-center.gap-3.mb-2
         [:> ty/Icon {:name "code" :size "lg" :className "ty-text-primary"}]
         [:h1.text-3xl.font-bold.ty-text++
          "Welcome to Reagent + Tyrell"]]
        [:p.ty-text.text-lg
         "Reagent with the tyrell-react wrappers: real props, real events, native forms."]]

       [:div.grid.md:grid-cols-2.gap-6.mb-8
        [:section.ty-elevated.p-6.rounded-lg
         [:h2.text-xl.font-semibold.mb-4.ty-text++.flex.items-center.gap-2
          [:> ty/Icon {:name "menu" :size "sm" :className "ty-text-primary"}]
          "Navigation Features"]
         [:ul.space-y-2.ty-text
          (icon-list-item "grid" "Responsive sidebar navigation")
          (icon-list-item "menu" "Mobile overlay menu")
          (icon-list-item "moon" "Theme toggle (light/dark)")
          (icon-list-item "click" "tyrell.router with browser history")]]

        [:section.ty-elevated.p-6.rounded-lg
         [:h2.text-xl.font-semibold.mb-4.ty-text++.flex.items-center.gap-2
          [:> ty/Icon {:name "code" :size "sm" :className "ty-text-primary"}]
          "React Wrappers"]
         [:ul.space-y-2.ty-text
          (icon-list-item "send" "Event props: :on-change, :on-close, …")
          (icon-list-item "check" "Native form validation, no validation code")
          (icon-list-item "code" "Short names: ty/Input, ty/Select, ty/Modal")
          (icon-list-item "users" "Every Tyrell component wrapped")]]]

       ;; Icon showcase — proves icons are registered and rendering
       [:section.ty-elevated.p-6.rounded-lg
        [:h2.text-xl.font-semibold.mb-2.ty-text++.flex.items-center.gap-2
         [:> ty/Icon {:name "palette" :size "sm" :className "ty-text-primary"}]
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

;; =============================================================================
;; Forms
;;
;; The fields carry their own rules (required, type="email", pattern,
;; min-length, max). The browser checks them before `submit` fires, so
;; `submit!` only ever sees a valid form. Each failing field shows its message
;; in its own error line and the first one takes focus. The only error we set
;; by hand is the one only a server could know.
;; =============================================================================

(def ^:private roles
  [["developer" "code"      "Software Developer"]
   ["designer"  "palette"   "UI/UX Designer"]
   ["manager"   "users"     "Project Manager"]
   ["analyst"   "bar-chart" "Data Analyst"]
   ["other"     "briefcase" "Other"]])

(def ^:private skills
  [["javascript" "JavaScript"   "warning"]
   ["typescript" "TypeScript"   "primary"]
   ["react"      "React"        "primary"]
   ["clojure"    "Clojure"      "success"]
   ["python"     "Python"       "warning"]
   ["tailwind"   "Tailwind CSS" "neutral"]
   ["docker"     "Docker"       "neutral"]
   ["postgres"   "PostgreSQL"   "neutral"]])

(defn- today []
  (subs (.toISOString (js/Date.)) 0 10))

(defn- set-field! [k v]
  (swap! state/app-state
         (fn [s] (-> s
                     (assoc-in [:form k] v)
                     (update :server-errors dissoc k)
                     (assoc :form-sent nil)))))

(defn- submit! [^js e]
  ;; Only runs when every field passed its rules
  (.preventDefault e)
  (let [form (:form @state/app-state)]
    (swap! state/app-state assoc :form-submitting true)
    (js/setTimeout
     (fn []
       (swap! state/app-state assoc :form-submitting false)
       ;; Pretend the server knows this address already
       (if (str/ends-with? (:email form) "@taken.com")
         (swap! state/app-state assoc-in [:server-errors :email]
                "That email is already registered")
         (swap! state/app-state assoc :form-sent form)))
     800)))

(defn- reset-form! []
  (swap! state/app-state #(-> %
                              (assoc :form state/empty-form :server-errors {} :form-sent nil)
                              (update :form-key inc))))

(defn forms-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/forms-id)
      (let [{:keys [form server-errors form-submitting form-sent form-key]} @state/app-state
            filled (count (filter (fn [[_ v]] (if (boolean? v) v (seq v))) form))
            total (count form)]
        [:div.max-w-4xl.mx-auto.space-y-8
         ;; Header
         [:div.ty-elevated.p-6.rounded-lg
          [:div.flex.items-center.justify-between.mb-4
           [:div
            [:h1.text-2xl.font-bold.ty-text++ "User Profile Form"]
            [:p.ty-text-.text-sm.mt-1
             "Rules live on the fields. Press Submit with gaps, or type and leave a field, to see the messages."]]
           [:> ty/Icon {:name "user" :size "lg" :className "ty-text-primary"}]]
          [:div
           [:div.flex.justify-between.text-sm.mb-2
            [:span.ty-text+ "Form Progress"]
            [:span.ty-text+ (str filled "/" total " fields")]]
           [:div.w-full.ty-bg-neutral-.rounded-full.h-2
            [:div.ty-bg-primary.h-2.rounded-full.transition-all.duration-300
             {:style {:width (str (* (/ filled total) 100) "%")}}]]]]

         ^{:key form-key}
         [:form.space-y-8 {:on-submit submit!}
          [:div.grid.lg:grid-cols-2.gap-8
           ;; Personal Information
           [:section.ty-elevated.p-6.rounded-lg
            [:h2.text-lg.font-semibold.mb-6.ty-text++.flex.items-center.gap-2
             [:> ty/Icon {:name "user" :size "sm"}]
             "Personal Information"]
            [:div.space-y-5
             [:> ty/Input {:name "name"
                           :label "Full name"
                           :placeholder "Ada Lovelace"
                           :required true
                           :min-length 2
                           :value (:name form)
                           :on-change #(set-field! :name (.. % -detail -value))}]
             [:> ty/Input {:name "email"
                           :type "email"
                           :label "Email address"
                           :placeholder "you@company.com"
                           :required true
                           :value (:email form)
                           :error (:email server-errors)
                           :on-change #(set-field! :email (.. % -detail -value))}]
             [:> ty/Input {:name "phone"
                           :type "tel"
                           :label "Phone number"
                           :placeholder "+1 555 123 4567"
                           :pattern "[0-9+ ]{7,}"
                           :value (:phone form)
                           :on-change #(set-field! :phone (.. % -detail -value))}]
             [:> ty/DatePicker {:name "birthdate"
                                :label "Birth date"
                                :placeholder "Select your birth date"
                                :required true
                                :max (today)
                                :value (:birthdate form)
                                :on-change #(set-field! :birthdate (or (.. % -detail -value) ""))}]]]

           ;; Preferences & Bio
           [:section.ty-elevated.p-6.rounded-lg
            [:h2.text-lg.font-semibold.mb-6.ty-text++.flex.items-center.gap-2
             [:> ty/Icon {:name "settings" :size "sm"}]
             "Preferences & Bio"]
            [:div.space-y-5
             [:> ty/Select {:name "role"
                            :label "Professional role"
                            :placeholder "Select your role"
                            :value (:role form)
                            :on-change #(set-field! :role (or (.. ^js % -detail -value) ""))}
              (for [[v icon label] roles]
                ^{:key v}
                [:> ty/Option {:value v :label label}
                 [:div.flex.items-center.gap-2
                  [:> ty/Icon {:name icon :size "xs"}]
                  label]])]

             [:div.space-y-2
              [:> ty/Select {:id "skills"
                             :name "skills"
                             :label "Technical skills"
                             :placeholder "Select your skills"
                             :multiple true
                             :value (:skills form)
                             :on-change #(set-field! :skills (vec (.. ^js % -detail -values)))}
               (for [[v label flavor] skills]
                 ^{:key v} [:> ty/Option {:value v :flavor flavor} label])]
              ;; The picks as dismissible chips, anywhere in the layout
              [:div.flex.flex-wrap.gap-2
               [:> ty/SelectedOptions {:html-for "skills"}]]]

             [:div
              [:> ty/Textarea {:name "bio"
                               :label "Biography"
                               :rows 4
                               :placeholder "Tell us about yourself..."
                               :value (:bio form)
                               :error (when (> (count (:bio form)) 500) "Keep it under 500 characters")
                               :on-change #(set-field! :bio (.. % -detail -value))}]
              [:p.text-xs.ty-text-.mt-1.text-right
               (str (count (:bio form)) "/500 characters")]]

             ;; ty-checkbox is the tick only; a wrapping <label> names it
             [:label.flex.items-center.gap-2.text-sm.ty-text.cursor-pointer
              [:> ty/Checkbox {:name "newsletter"
                               :checked (:newsletter form)
                               :on-change #(set-field! :newsletter (.. % -detail -checked))}]
              "Subscribe to newsletter and product updates"]]]]

          ;; Form Actions
          [:div.ty-elevated.p-6.rounded-lg
           [:div.flex.flex-col.sm:flex-row.gap-4.justify-between.items-start.sm:items-center
            [:div
             [:p.text-sm.ty-text+ "Fields marked * are required"]
             [:p.text-xs.ty-text-.mt-1
              "Try an address ending in " [:code.font-mono "@taken.com"]
              " to see a server-side error on the field."]]
            [:div.flex.gap-3
             [:> ty/Button {:type "button"
                            :flavor "neutral"
                            :appearance "outlined"
                            :on-click reset-form!}
              [:> ty/Icon {:slot "start" :name "refresh-cw" :size "xs"}]
              "Reset"]
             [:> ty/Button {:type "submit"
                            :flavor "primary"
                            :loading form-submitting}
              [:> ty/Icon {:slot "start" :name "send" :size "xs"}]
              (if form-submitting "Submitting..." "Submit")]]]

           (when form-sent
             [:div.mt-4.rounded-lg.p-4.ty-bg-success-.ty-text-success++
              [:div.flex.items-center.gap-2.font-medium.mb-2
               [:> ty/Icon {:name "check" :size "sm"}]
               "Submitted"]
              [:pre.text-xs.font-mono.whitespace-pre-wrap.break-all (pr-str form-sent)]])]]]))))

(defn buttons-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/buttons-id)
      (let [clicked (:last-click @state/app-state)
            click! (fn [label] #(swap! state/app-state assoc :last-click label))]
        [:div.max-w-4xl.mx-auto
         [:section.ty-elevated.p-6.rounded-lg.mb-6
          [:h2.text-xl.font-semibold.mb-1.ty-text++ "Button Examples"]
          [:p.text-sm.ty-text-.mb-4 (if clicked (str "Last clicked: " clicked) "Click a button.")]

          [:div.space-y-6
           [:div
            [:h3.font-medium.mb-3.ty-text+ "Appearances"]
            [:div.flex.gap-4.flex-wrap
             [:> ty/Button {:flavor "primary" :on-click (click! "Solid")} "Solid"]
             [:> ty/Button {:flavor "primary" :appearance "outlined" :on-click (click! "Outlined")} "Outlined"]
             [:> ty/Button {:flavor "primary" :appearance "ghost" :on-click (click! "Ghost")} "Ghost"]]]

           [:div
            [:h3.font-medium.mb-3.ty-text+ "Semantic flavors"]
            [:div.flex.gap-4.flex-wrap
             (for [f ["neutral" "success" "warning" "danger"]]
               ^{:key f} [:> ty/Button {:flavor f :on-click (click! f)} (str/capitalize f)])]]

           [:div
            [:h3.font-medium.mb-3.ty-text+ "With icons"]
            [:div.flex.gap-4.flex-wrap
             [:> ty/Button {:flavor "primary"}
              [:> ty/Icon {:slot "start" :name "save"}] "Save"]
             [:> ty/Button {:flavor "danger" :appearance "outlined"}
              [:> ty/Icon {:slot "start" :name "trash"}] "Delete"]
             [:> ty/Button {:flavor "neutral" :pill true}
              [:> ty/Icon {:slot "start" :name "download"}] "Download"]
             [:> ty/Button {:flavor "neutral" :action true :aria-label "Settings"}
              [:> ty/Icon {:name "settings"}]]]]]]]))))

;; =============================================================================
;; Components
;; =============================================================================

(def ^:private components
  ["Button" "Input" "Textarea" "Checkbox" "Switch" "Radio" "RadioGroup"
   "Select" "Option" "SelectedOptions" "Tag" "DatePicker" "Calendar"
   "CalendarMonth" "CalendarNavigation" "Modal" "Popup" "Tooltip" "Icon"
   "Tabs" "Tab" "Wizard" "Step" "Copy" "FileUpload" "ScrollContainer"
   "ResizeObserver"])

(defn- modal-demo []
  (let [open? (r/atom false)
        deleted (r/atom 0)]
    (fn []
      [:section.ty-elevated.p-6.rounded-lg.mb-6
       [:h2.text-xl.font-semibold.mb-1.ty-text++ "Modal"]
       [:p.text-sm.ty-text-.mb-4
        "Controlled with " [:code.font-mono ":open"] ". Escape, a backdrop click or a button closes it; "
        [:code.font-mono ":on-close"] " keeps the atom in sync."]
       [:div.flex.items-center.gap-4
        [:> ty/Button {:flavor "danger" :on-click #(reset! open? true)}
         [:> ty/Icon {:slot "start" :name "trash"}] "Delete project…"]
        (when (pos? @deleted)
          [:span.text-sm.ty-text- (str "Deleted " @deleted " time" (when (> @deleted 1) "s"))])]
       [:> ty/Modal {:open @open?
                     :label "Delete project"
                     :on-close #(reset! open? false)}
        [:div.ty-floating.rounded-2xl.p-6.flex.flex-col.gap-4 {:style {:width "min(360px, 90vw)"}}
         [:div.flex.items-start.gap-3
          [:> ty/Icon {:name "alert-circle" :size "lg" :className "ty-text-danger"}]
          [:div
           [:h3.text-lg.font-semibold.ty-text++ "Delete project?"]
           [:p.text-sm.ty-text- "Everything in it goes with it. This can't be undone."]]]
         [:div.flex.justify-end.gap-2
          [:> ty/Button {:appearance "ghost" :on-click #(reset! open? false)} "Cancel"]
          [:> ty/Button {:flavor "danger"
                         :on-click #(do (swap! deleted inc) (reset! open? false))}
           "Delete"]]]]])))

(defn components-view []
  (let [_ @router/*router*]  ; Deref to trigger Reagent reactivity
    (when (router/rendered? state/components-id)
      [:div.max-w-4xl.mx-auto
       [modal-demo]

       [:section.ty-elevated.p-6.rounded-lg.mb-6
        [:h2.text-xl.font-semibold.mb-4.ty-text++ "Available React Wrapper Components"]
        [:div.grid.grid-cols-2.md:grid-cols-3.lg:grid-cols-4.gap-3
         (for [component components]
           ^{:key component}
           [:div.ty-content.p-3.rounded.text-center
            [:code.text-sm.ty-text (str "ty/" component)]])]]

       [:section.ty-elevated.p-6.rounded-lg
        [:h2.text-xl.font-semibold.mb-4.ty-text++ "Implementation Notes"]
        [:div.space-y-4.ty-text
         [:p "Components come from " [:code "tyrell.react"] " (re-exports of the "
          [:code "tyrell-react"] " npm package), each under a short and a " [:code "Ty"] "-prefixed name."]
         [:pre.ty-bg-neutral-.p-4.rounded.text-sm.overflow-auto
          "[:> ty/Button {:flavor \"primary\" :on-click #(js/alert \"Clicked!\")} \"Click Me\"]"]
         [:p "The custom elements are registered by requiring " [:code "tyrell.components"]
          " once, in " [:code "hello.core"] "."]]]])))
