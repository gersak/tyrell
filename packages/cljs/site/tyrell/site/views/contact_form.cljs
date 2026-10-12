(ns tyrell.site.views.contact-form
  (:require
   [clojure.string :as str]
   [tyrell.site.state :as state]
   [tyrell.site.views.kit :as kit]))

(def ^:private rules
  {:full-name [(kit/min-len 2 "Full name")]
   :email     [(kit/required "Email") kit/email]
   :company   [(kit/required "Company")]
   :subject   [(kit/min-len 5 "Subject")]
   :message   [(kit/min-len 20 "Message") (kit/max-len 2000 "Message")]})

(def ^:private initial
  {:form-data {:full-name "Sarah Chen"
               :email "sarah.chen@designstudio.com"
               :company "Creative Design Studio"
               :subject "Partnership: Tyrell for our client dashboards"
               :message "Hi! We're rebuilding our client dashboards and Tyrell looks like the right fit: real web components, theming through CSS variables, and a ClojureScript story on top.\n\nCould we get a quick call about a partnership? We'd love to talk about React wrappers and a shared design system for our team.\n\nThanks,\nSarah"
               :priority "high"
               :department #{"partnership" "sales"}
               :newsletter true}})

(kit/init! :contact-form initial)

(def ^:private priorities
  [["low" "Low" "success"] ["medium" "Medium" "primary"] ["high" "High" "warning"] ["critical" "Critical" "danger"]])

(def ^:private departments
  [["sales" "primary" "Sales"] ["support" "success" "Support"] ["technical" "neutral" "Engineering"]
   ["billing" "warning" "Billing"] ["partnership" "neutral" "Partnerships"]])

(defn- put! [k v] (swap! state/state assoc-in [:contact-form k] v))
(defn- put-data! [k v] (swap! state/state assoc-in [:contact-form :form-data k] v))
(defn- field [tag k attrs & children] (apply kit/field tag :contact-form rules k attrs children))
(defn- clear! [] (swap! state/state assoc :contact-form {:form-data {}}))

(defn- submit! [e]
  (.preventDefault e)
  (when (empty? (kit/validate! :contact-form rules))
    (put! :sending? true)
    ;; Fake API call: succeeds nine times out of ten
    (js/setTimeout
     #(if (< (js/Math.random) 0.9)
        (swap! state/state update :contact-form assoc
               :sending? false :status nil :sent (get-in @state/state [:contact-form :form-data]))
        (swap! state/state update :contact-form assoc
               :sending? false
               :status "Sorry, there was an error sending your message. Please try again."))
     2000)))

(defn- step [n label & children]
  [:div
   [:div.flex.items-center.mb-3 {:class ["gap-2.5"]}
    [:span.w-6.h-6.rounded-full.flex.items-center.justify-center.text-xs.font-semibold.ty-text-primary
     {:style {:background "color-mix(in oklch, var(--ty-color-primary) 14%, transparent)"}}
     n]
    [:h4.text-sm.font-semibold.ty-text++ label]]
   (into [:div.flex.flex-col.gap-3] children)])

(defn- aside
  "Dark side panel: who you're writing to and how else to reach them."
  []
  [:aside.dark.ty-canvas.ty-text.h-full.rounded-2xl.p-6.flex.flex-col.gap-7
   {:data-ty-theme ""
    :style {:--ty-primary-hue "inherit"
            :--ty-primary-chroma "inherit"
            :background (str "radial-gradient(ellipse 90% 60% at 0% 0%, color-mix(in oklch, var(--ty-color-primary) 22%, transparent), transparent 70%), "
                             "var(--ty-surface-canvas)")}}
   [:div.flex.flex-col.gap-3
    [:span.text-xs.font-semibold.uppercase.ty-text-primary {:style {:letter-spacing "0.14em"}} "Contact"]
    [:h3.text-2xl.font-bold.ty-text++ {:style {:letter-spacing "-0.02em" :line-height "1.15"}} "Start a conversation."]
    [:p.text-sm.ty-text-.leading-relaxed "Describe what you're working on. A human reads every message."]]
   [:ul.flex.flex-col.gap-4
    (for [[icon title detail] [["mail" "hello@example.com" "Email"]
                               ["github" "gersak/tyrell" "GitHub discussions"]
                               ["map-pin" "Zagreb, Croatia" "Studio, CET"]]]
      [:li.flex.items-center.gap-3 {:replicant/key title}
       [:span.w-9.h-9.rounded-xl.flex.items-center.justify-center.shrink-0.ty-text
        {:style {:background "color-mix(in oklch, var(--ty-text-strong) 8%, transparent)"}}
        [:ty-icon {:name icon :size "sm"}]]
       [:span.flex.flex-col.min-w-0
        [:span.text-sm.font-medium.ty-text++.truncate title]
        [:span.text-xs.ty-text- detail]]])]
   [:div.flex-1]
   [:div.flex.items-center.gap-3.pt-5.border-t.ty-border
    [:div.flex {:style {:padding-left "6px"}}
     (for [[initials flavor] [["RG" "warning"] ["AK" "primary"] ["MS" "success"]]]
       [:span.w-8.h-8.rounded-full.flex.items-center.justify-center.text-xs.font-semibold
        {:replicant/key initials
         :class [(str "ty-bg-" flavor) (str "ty-text-" flavor "++")]
         :style {:margin-left "-6px" :border "2px solid var(--ty-surface-canvas)"}}
        initials])]
    [:span.text-xs.ty-text-.leading-snug "Usually replies" [:br] "within a day"]]])

(defn view []
  (let [{:keys [form-data sending? status sent]} (:contact-form @state/state)
        {:keys [message priority department newsletter]} form-data]
    [:div {:class ["@container"]}
     (when status
       [:div.flex.items-center.gap-3.p-3.rounded-lg.mb-4.ty-bg-danger-
        [:ty-icon.ty-text-danger {:name "alert-circle" :size "sm"}]
        [:p.text-sm.flex-1.ty-text-danger status]
        [:button.text-xs.underline.ty-text-danger {:on {:click #(put! :status nil)}} "Dismiss"]])
     [:div.flex.flex-col.gap-8 {:class ["@3xl:flex-row"]}
      [:div.shrink-0 {:class ["@3xl:w-72"]} (aside)]
      [:form.flex-1.min-w-0.flex.flex-col.gap-7 {:on {:submit submit!}}
       (step "1" "About you"
             (kit/cols
              (field :ty-input :full-name {:label "Full Name" :placeholder "Your full name" :required true} (kit/icon "user"))
              (field :ty-input :email {:type "email" :label "Email" :placeholder "your@email.com" :required true} (kit/icon "mail"))
              (field :ty-input :company {:label "Company" :placeholder "Company name" :required true} (kit/icon "building"))
              [:ty-select {:label "Priority" :value priority :on {:change #(put-data! :priority (kit/value %))}}
               (for [[v label flavor] priorities]
                 [:ty-option {:replicant/key v :value v}
                  [:div.flex.items-center.gap-2
                   [:span.inline-block.w-2.h-2.rounded-full {:style {:background (str "var(--ty-color-" flavor ")")}}]
                   [:span label]]])]))
       (step "2" "Your request"
             (field :ty-input :subject {:label "Subject" :placeholder "Brief description" :required true} (kit/icon "message-square"))
             [:ty-select {:id "contact-departments" :multiple true :label "Route it to"
                          :placeholder "Pick one or more teams..." :value (str/join "," department)
                          :on {:change (fn [^js e] (put-data! :department (set (.. e -detail -values))))}}
              (for [[v flavor label] departments] [:ty-option {:replicant/key v :value v :flavor flavor} label])]
             ;; Dismissible chips for the selection — default template, flavors carry
             [:div.flex.flex-wrap.gap-2 [:ty-selected-options {:for "contact-departments"}]])
       (step "3" "Message"
             [:div
              (field :ty-textarea :message {:placeholder "Describe your inquiry in detail..." :required true
                                            :min-height "140px" :max-height "240px"})
              [:p.text-xs.text-right.mt-1 {:class (if (> (count message) 1800) "ty-text-warning" "ty-text--")}
               (str (count message) "/2000")]])
       [:div.flex.flex-wrap.items-center.justify-between.gap-3.pt-5.border-t.ty-border
        [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.ty-text-
         [:ty-checkbox {:checked newsletter :on {:change #(put-data! :newsletter (kit/value %))}}]
         "Send me the monthly newsletter"]
        [:div.flex.gap-2
         [:ty-button {:type "button" :flavor "neutral" :appearance "outlined" :size "sm" :on {:click clear!}} "Reset"]
         [:ty-button {:type "submit" :flavor "neutral+" :size "sm" :disabled (boolean sending?)}
          [:ty-icon {:name (if sending? "loader-2" "send") :spin sending? :size "xs" :slot "start"}]
          (if sending? "Sending…" "Send message")]]]]]
     (kit/result-modal
      {:open (some? sent) :on-close #(put! :sent nil) :icon "check" :flavor "success"
       :title "Message Sent" :subtitle "Expect a reply within 24 hours."
       :actions [[:ty-button {:flavor "neutral" :size "sm" :on {:click #(put! :sent nil)}} "Close"]
                 [:ty-button {:flavor "primary" :size "sm" :on {:click clear!}} "Send Another"]]}
      (kit/summary [["Name" (:full-name sent)] ["Email" (:email sent)] ["Company" (:company sent)]
                    ["Priority" (or (:priority sent) "—")]]))]))
