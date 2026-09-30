(ns tyrell.site.views.user-profile
  (:require [tyrell.site.state :as state]
            [tyrell.site.views.kit :as kit]))

(def ^:private rules
  {:first-name [(kit/min-len 2 "First name")]
   :last-name  [(kit/min-len 2 "Last name")]
   :email      [(kit/required "Email") kit/email]
   :phone      [(kit/required "Phone") (kit/matches #"^\+?[\d\s\(\)\-]{10,}$" "Please enter a valid phone number")]
   :job-title  [(kit/required "Job title")]
   :company    [(kit/required "Company")]
   :bio        [(kit/min-len 20 "Bio") (kit/max-len 500 "Bio")]})

(def ^:private initial
  {:form-data {:first-name "John" :last-name "Doe"
               :email "john.doe@example.com" :phone "+1 (555) 123-4567"
               :job-title "Senior Software Developer" :company "TechCorp Inc."
               :bio "Passionate software developer with 8+ years of experience building web applications. Specializes in ClojureScript, React, and modern web technologies."}})

(kit/init! :user-profile initial)

(defn- put! [k v] (swap! state/state assoc-in [:user-profile k] v))
(defn- field [tag k attrs & children] (apply kit/field tag :user-profile rules k attrs children))

(defn- strength
  "Share of profile fields that are filled in and valid, 0-100."
  [data]
  (js/Math.round (* 100 (/ (count (filter #(and (seq (get data %)) (not (kit/error-for rules % (get data %))))
                                          (keys rules)))
                           (count rules)))))

(defn- submit! [e]
  (.preventDefault e)
  (when (empty? (kit/validate! :user-profile rules))
    (put! :submitting? true)
    (js/setTimeout #(swap! state/state update :user-profile assoc
                           :submitting? false :modal :saved
                           :saved (get-in @state/state [:user-profile :form-data]))
                   1000)))

;; --- Layout pieces -----------------------------------------------------------

(defn- section
  "Settings row: icon, title and description left, fields right. Stacks when narrow."
  [icon title description & fields]
  [:section.flex.flex-col.gap-4.py-6.border-t.ty-border {:class ["@2xl:flex-row" "@2xl:gap-10"]}
   [:div.flex.flex-col.gap-1.shrink-0 {:class ["@2xl:w-48"]}
    [:span.w-9.h-9.mb-2.rounded-xl.ty-text-primary.flex.items-center.justify-center
     {:style {:background "color-mix(in oklch, var(--ty-color-primary) 14%, transparent)"}}
     [:ty-icon {:name icon :size "md"}]]
    [:h4.text-sm.font-semibold.ty-text++ title]
    [:p.text-sm.ty-text-.leading-relaxed description]]
   (into [:div.flex-1.min-w-0.flex.flex-col.gap-4] fields)])

(defn- switch-row [[name title description checked]]
  [:label.flex.items-center.justify-between.gap-4.cursor-pointer {:replicant/key name}
   [:span.flex.flex-col {:class ["gap-0.5"]}
    [:span.text-sm.font-medium.ty-text title]
    [:span.text-xs.ty-text- description]]
   [:ty-switch (cond-> {:name name} checked (assoc :checked ""))]])

(defn- option [value & content]
  [:ty-option {:replicant/key value :value value} (into [:div.flex.items-center.gap-2.w-full] content)])

(defn- mono [s] [:span.font-mono.text-xs.ty-text-- s])

;; --- Data --------------------------------------------------------------------

(def ^:private skills
  [["clojurescript" "primary" "λ" "ClojureScript"] ["react" "neutral" "⚛" "React"]
   ["typescript" "neutral" "TS" "TypeScript"] ["nodejs" "success" "JS" "Node.js"]
   ["postgresql" "neutral" "🐘" "PostgreSQL"] ["python" nil "🐍" "Python"]
   ["rust" nil "🦀" "Rust"] ["docker" nil "🐳" "Docker"]
   ["graphql" nil "QL" "GraphQL"] ["aws" nil "☁" "AWS"]])

(def ^:private locale
  "[selected-value options] for the four locale selects."
  [["us" (for [[v flag label] [["us" "🇺🇸" "United States"] ["ca" "🇨🇦" "Canada"] ["uk" "🇬🇧" "United Kingdom"]
                               ["de" "🇩🇪" "Germany"] ["fr" "🇫🇷" "France"] ["jp" "🇯🇵" "Japan"]]]
           (option v [:span flag] [:span label]))]
   ["est" (for [[v label utc] [["pst" "Pacific" "UTC−8"] ["mst" "Mountain" "UTC−7"] ["cst" "Central" "UTC−6"]
                               ["est" "Eastern" "UTC−5"] ["utc" "UTC" "UTC+0"]]]
            (option v [:span.flex-1 label] (mono utc)))]
   ["en" (for [[v label] [["en" "English"] ["es" "Español"] ["fr" "Français"] ["de" "Deutsch"]]]
           (option v (mono (.toUpperCase v)) [:span label]))]
   ["auto" (for [[v icon label] [["light" "sun" "Light"] ["dark" "moon" "Dark"] ["auto" "settings" "System"]]]
             (option v [:ty-icon {:name icon :size "xs"}] [:span label]))]])

;; --- Modals ------------------------------------------------------------------

(defn- modals [{:keys [modal saved]}]
  (let [close #(put! :modal nil)]
    (list
     [:ty-modal {:open (= modal :avatar) :on {:close close}}
      [:div.p-6.max-w-md.ty-elevated.rounded-lg.flex.flex-col.gap-4
       [:h3.text-lg.font-semibold.ty-text "Upload Profile Photo"]
       [:label.border-2.border-dashed.ty-border.rounded-lg.p-8.text-center.hover:ty-border-primary.transition-colors.cursor-pointer
        [:ty-icon.ty-text-.mb-3 {:name "upload" :size "2xl"}]
        [:p.ty-text.text-sm.font-medium "Drag and drop or click to browse"]
        [:div.flex.justify-center.gap-2.mt-3
         (for [t ["JPG" "PNG" "WebP" "Max 5MB"]]
           [:span.px-2.ty-bg-success-.ty-text-success.rounded.text-xs {:class ["py-0.5"] :replicant/key t} t])]
        [:input.hidden {:type "file" :accept "image/*"}]]
       [:div.flex.gap-2.justify-end
        [:ty-button {:flavor "neutral" :size "sm" :on {:click close}} "Cancel"]
        [:ty-button {:flavor "primary" :size "sm"} [:ty-icon {:name "save" :size "xs" :slot "start"}] "Save Photo"]]]]
     (kit/result-modal
      {:open (= modal :saved) :on-close close :icon "check" :flavor "success"
       :title "Profile saved" :subtitle "All changes have been applied"
       :actions [[:ty-button {:flavor "primary" :size "sm" :on {:click close}} "Done"]]}
      (kit/summary [["Name" (str (:first-name saved) " " (:last-name saved))] ["Email" (:email saved)]
                    ["Phone" (:phone saved)] ["Company" (:company saved)]]))
     (kit/result-modal
      {:open (= modal :export) :on-close close :icon "download" :flavor "info"
       :title "Export Profile" :subtitle "Choose a format"
       :actions [[:ty-button {:flavor "neutral" :size "sm" :on {:click close}} "Cancel"]
                 [:ty-button {:flavor "primary" :size "sm"} [:ty-icon {:name "download" :size "xs" :slot "start"}] "Download"]]}
      [:div.flex.flex-col.gap-2
       (for [[fmt icon hint color] [["JSON" "file-json" "Machine-readable" "ty-text-primary"]
                                    ["CSV" "table" "Spreadsheet" "ty-text-success"]
                                    ["PDF" "file-text" "Printable" "ty-text-danger"]]]
         [:div.flex.items-center.justify-between.p-3.border.ty-border.rounded-lg.cursor-pointer.hover:ty-border-primary.transition-colors
          {:replicant/key fmt}
          [:div [:p.font-medium.ty-text.text-sm fmt] [:p.text-xs.ty-text- hint]]
          [:ty-icon {:name icon :class color}]])]))))

;; --- View --------------------------------------------------------------------

(defn view []
  (let [{:keys [form-data errors submitting?] :as profile} (:user-profile @state/state)
        {:keys [first-name last-name job-title company bio]} form-data
        pct (strength form-data)
        input (fn [k label icon & [type]]
                (field :ty-input k (cond-> {:label label :type (or type "text")}
                                     (#{:first-name :last-name :email :phone} k) (assoc :required true))
                       (when icon (kit/icon icon))))]
    [:div {:class ["@container"]}
     [:div.h-24.rounded-xl
      {:style {:background (str "linear-gradient(100deg, "
                                ;; theme colors mixed into the surface: pastel in light, deep in dark (oklab: no hue drift).
                                ;; Emerald = the success token turned to hue 162 with more chroma.
                                "color-mix(in oklab, oklch(from var(--ty-color-success) l calc(c * 1.8) 162) 45%, var(--ty-surface-elevated)), "
                                "color-mix(in oklab, var(--ty-color-danger) 30%, var(--ty-surface-elevated)) 55%, "
                                "color-mix(in oklab, var(--ty-color-primary) 40%, var(--ty-surface-elevated)))")}}]
     [:div.flex.items-start.gap-4.px-4.pb-2 {:style {:margin-top "-2.5rem"}}
      [:button.relative.shrink-0.cursor-pointer {:type "button" :title "Change photo" :on {:click #(put! :modal :avatar)}}
       [:span.w-20.h-20.rounded-full.flex.items-center.justify-center.text-2xl.font-semibold
        {:style {:background "var(--ty-text-strong)" :color "var(--ty-surface-elevated)"
                 :border "4px solid var(--ty-surface-elevated)"}}
        (str (first first-name) (first last-name))]
       [:span.absolute.bottom-1.right-0.w-6.h-6.ty-bg-primary.rounded-full.flex.items-center.justify-center
        {:style {:border "2px solid var(--ty-surface-elevated)"}}
        [:ty-icon.ty-text++ {:name "plus" :size "xs"}]]]
      [:div.min-w-0.flex-1 {:style {:margin-top "2.875rem"}}
       [:p.text-lg.font-semibold.ty-text++.truncate (str first-name " " last-name)]
       [:p.text-sm.ty-text-.truncate (str job-title " · " company)]
       [:div.flex.flex-wrap.items-center.gap-3.mt-2
        [:ty-tag {:flavor "success" :size "sm"} "Available for work"]
        [:span.inline-flex.items-center.gap-1.text-xs.ty-text- [:ty-icon {:name "map-pin" :size "xs"}] "Remote · US"]]]
      [:div.flex-col.shrink-0 {:class ["gap-1.5" "hidden" "@xl:flex"] :style {:margin-top "3.25rem" :width "11rem"}}
       [:div.flex.items-center.justify-between.text-xs
        [:span.ty-text- "Profile strength"] [:span.font-semibold.ty-text++ (str pct "%")]]
       [:div.rounded-full.overflow-hidden {:class ["h-1.5"] :style {:background "var(--ty-border)"}}
        [:div.h-full.rounded-full.transition-all
         {:style {:width (str pct "%")
                  :background (if (= pct 100) "var(--ty-color-success)" "var(--ty-color-warning)")}}]]]]

     [:form {:on {:submit submit!}}
      (section "user" "Personal" "Shown on your profile and in mentions."
               (kit/cols (input :first-name "First Name" nil) (input :last-name "Last Name" nil)
                         (input :email "Email" "mail" "email") (input :phone "Phone" "phone" "tel")))

      (section "briefcase" "Professional" "Your role and the stack you work with."
               (kit/cols (input :job-title "Job Title" "briefcase") (input :company "Company" "building"))
               [:div.flex.flex-col.gap-2
                ;; label = chip text; rich option content stays in the list; data-glyph feeds the chip
                [:ty-select {:id "profile-skills" :label "Skills" :multiple true
                             :placeholder "Skills & technologies..." :value "clojurescript,react"}
                 (for [[v flavor glyph label] skills]
                   [:ty-option (cond-> {:replicant/key v :value v :label label :data-glyph glyph} flavor (assoc :flavor flavor))
                    [:div.flex.items-center {:class ["gap-1.5"]} [:span.font-bold.text-xs glyph] [:span label]]])]
                [:div.flex.flex-wrap.gap-2
                 [:ty-selected-options {:for "profile-skills"}
                  [:template
                   [:ty-tag {:flavor "{flavor}" :dismissible true :pill true}
                    [:span.font-bold.text-xs {:slot "start"} "{data-glyph}"] "{label}"]]]]]
               [:div
                (field :ty-textarea :bio {:label "Bio" :max-height "110px"})
                [:p.text-xs.text-right.mt-1 {:class (if (> (count bio) 450) "ty-text-warning" "ty-text--")}
                 (str (count bio) "/500")]])

      (section "globe" "Location & language" "Used for dates, times and translations."
               (apply kit/cols (for [[v options] locale] [:ty-select {:replicant/key v :value v} options])))

      (section "shield" "Security" "Password and who can see your profile."
               (kit/cols
                (for [[label ac] [["Current Password" "current-password"] ["New Password" "new-password"]]]
                  [:ty-input {:replicant/key ac :type "password" :label label :placeholder "••••••••" :autocomplete ac}
                   (kit/icon "lock")]))
               (map switch-row [["privacy-2fa" "Two-factor auth" "Ask for a code on new devices"]
                                ["privacy-public" "Public profile" "Anyone with the link can see it" true]]))

      (section "bell" "Notifications" "Pick what reaches your inbox."
               [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text
                [:ty-checkbox {:name "account-autosave" :checked ""}] "Auto-save drafts while editing"]
               (map switch-row [["notif-updates" "Product updates" "New primitives and releases" true]
                                ["notif-newsletter" "Newsletter" "A monthly summary, nothing else" true]
                                ["notif-marketing" "Promotions" "Occasional offers from partners"]]))

      [:div.flex.items-center.justify-between.pt-5.border-t.ty-border
       (let [ok? (empty? errors)]
         [:span.inline-flex.items-center.text-xs {:class ["gap-1.5" (if ok? "ty-text-success" "ty-text-danger")]}
          [:ty-icon {:name (if ok? "check-circle" "alert-circle") :size "xs"}]
          (if ok? "Ready to save" "Fix errors before saving")])
       [:div.flex.gap-2
        [:ty-button {:type "button" :flavor "neutral" :appearance "outlined" :size "sm"
                     :on {:click #(swap! state/state assoc :user-profile initial)}} "Cancel"]
        [:ty-button {:type "button" :flavor "neutral" :appearance "outlined" :size "sm"
                     :on {:click #(put! :modal :export)}}
         [:ty-icon {:name "download" :size "xs" :slot "start"}] "Export"]
        [:ty-button {:type "submit" :flavor "neutral+" :size "sm" :disabled (boolean (or submitting? (seq errors)))}
         [:ty-icon {:name (if submitting? "loader-2" "save") :spin submitting? :size "xs" :slot "start"}]
         (if submitting? "Saving…" "Save")]]]]
     (modals profile)]))
