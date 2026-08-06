(ns tyrell.site.views.event-booking
  (:require
    [cljs-bean.core :refer [->clj]]
    [clojure.string :as str]
    [tyrell.i18n :as i18n]
    [tyrell.i18n.time]
    [tyrell.site.state :refer [state]])
  (:require-macros [tyrell.css :refer [defstyles]]))

;; Load custom CSS styles for calendar
(def ^:private service-config
  {:stripe {:public-key (or (get js/window "STRIPE_PUBLIC_KEY")
                            (get (.-dataset (.-documentElement js/document)) "stripePublicKey")
                            "pk_test_51234567890abcdef")}
   :api {:booking-endpoint "/api/bookings/create"
         :timeout 30000}})

;; Date helper functions
(defn date->context
  "Extract year/month/day from a JavaScript Date object.
  Returns a map with :year, :month (1-indexed), and :day."
  [^js date]
  {:year (.getFullYear date)
   :month (inc (.getMonth date)) ; JavaScript months are 0-indexed
   :day (.getDate date)})

(defn context->date
  "Create a JavaScript Date from year/month/day context.
  Month should be 1-indexed (1 = January)."
  [year month day]
  (js/Date. year (dec month) day))

(defn add-days
  "Add specified number of days to a date and return new Date object."
  [^js date days]
  (let [ms-per-day (* 24 60 60 1000)
        new-ms (+ (.getTime date) (* days ms-per-day))]
    (js/Date. new-ms)))

(defn get-stripe-key []
  (get-in service-config [:stripe :public-key]))

(defn get-api-config []
  (get service-config :api))

(defstyles event-booking-styles "tyrell/site/views/event_booking.css")

(defn- section-divider [label]
  [:div.flex.items-center.gap-3.mb-3
   {:style {:margin-top "1.25rem"}}
   [:span.text-xs.font-semibold.tracking-widest.uppercase.ty-text-- label]
   [:div.flex-1
    {:style {:height "1px"
             :background "var(--ty-border)"}}]])

(defn view []
  (let [{:keys [selected-services booking-data]
         {:keys [year month day]} :selected-date
         :as booking-state} (get @state :event-booking)]
    [:div
     [:div.grid.grid-cols-1.lg:grid-cols-2.gap-6
      ;; Left Column - Calendar & Time
      [:div
       (section-divider "Date")
       [:div.border.ty-border.rounded-lg
        [:ty-calendar
         {:on {:change #(let [^js d (.. ^js % -detail)]
                          (swap! state assoc-in [:event-booking :selected-date]
                                 {:year (.-year d)
                                  :month (.-month d)
                                  :day (.-day d)}))}
          :month month :year year :day day
          :replicant/on-mount (fn [{^js el :replicant/node}]
                                (set! (.-dayContentFn el)
                                      (fn [day-context]
                                        (let [{other-month :otherMont
                                               today? :today
                                               day-in-month :dayInMonth} (->clj day-context)
                                              availability (cond
                                                             (< day-in-month 5)  "booked"
                                                             (< day-in-month 15) "available"
                                                             (< day-in-month 25) "limited"
                                                             :else "available")
                                              container  (.createElement js/document "div")
                                              day-number (.createElement js/document "div")
                                              indicator  (when-not other-month (.createElement js/document "div"))]
                                          (set! (.-className container)
                                                (str "availability-day"
                                                     (when other-month " other-month")
                                                     (when today? " today")))
                                          (set! (.-className day-number) "day-num")
                                          (set! (.-textContent day-number) (str day-in-month))
                                          (.appendChild container day-number)
                                          (when-not other-month
                                            (set! (.-className indicator) (str "availability-indicator " availability))
                                            (.appendChild container indicator))
                                          container)))
                                (set! (.-customCSS el) event-booking-styles))}]]

       [:div.flex.flex-wrap.gap-2.mt-3
        [:ty-button {:flavor "primary" :outlined true :filled true :size "sm"
                     :on {:click #(swap! state assoc-in [:event-booking :selected-date]
                                         (date->context (js/Date.)))}}
         "Today"]
        [:ty-button {:flavor "success" :outlined true :filled true :size "sm"
                     :on {:click #(swap! state assoc-in [:event-booking :selected-date]
                                         (date->context (add-days (js/Date.) 1)))}}
         "Tomorrow"]
        [:ty-button {:size "sm"
                     :on {:click #(swap! state assoc-in [:event-booking :selected-date]
                                         (date->context (add-days (js/Date.) 7)))}}
         "Next Week"]]

       (when-let [{:keys [year month day]} (:selected-date booking-state)]
         [:div.mt-3.p-2.ty-bg-primary-.rounded-lg.flex.items-center.gap-2
          [:ty-icon.ty-text-primary {:name "calendar" :size "xs"}]
          [:span.text-xs.ty-text-primary.font-medium
           (i18n/translate (context->date year month day) "full")]])

       (section-divider "Time Slot")
       (let [selected-time (:selected-time booking-state)
             time-slots [{:time "9:00 AM"  :status "available"}
                         {:time "10:00 AM" :status "available"}
                         {:time "11:00 AM" :status "limited" :note "2 spots left"}
                         {:time "12:00 PM" :status "booked"}
                         {:time "1:00 PM"  :status "available"}
                         {:time "2:00 PM"  :status "available"}
                         {:time "3:00 PM"  :status "limited" :note "1 spot left"}
                         {:time "4:00 PM"  :status "available"}]]
         [:div.grid.grid-cols-2.gap-2
          (for [{:keys [time status note]} time-slots]
            ^{:key time}
            (if (= status "booked")
              [:div.ty-content.p-2.rounded-lg.text-center.opacity-50.cursor-not-allowed
               [:div.text-xs.font-medium.ty-text- time]
               [:div.text-xs.ty-text-danger "Booked"]]
              [:div.ty-content.p-2.rounded-lg.text-center.cursor-pointer.transition-colors.border.ty-border.hover:ty-elevated.hover:ty-border-primary
               {:class (when (= selected-time time) ["ty-bg-primary-" "ty-border-primary"])
                :on {:click #(swap! state assoc-in [:event-booking :selected-time] time)}}
               [:div.text-xs.font-medium
                {:class (if (= selected-time time) "ty-text-primary" "ty-text")}
                time]
               [:div.text-xs
                {:class (cond
                          (= selected-time time) "ty-text-primary"
                          (= status "available") "ty-text-success"
                          (= status "limited")   "ty-text-warning")}
                (cond
                  (= selected-time time) "Selected"
                  (= status "available") "Available"
                  (= status "limited")   note)]]))])]

      ;; Right Column - Details, Add-ons & Summary
      [:div
       (section-divider "Details")
       [:div.space-y-3
        [:ty-select {:label "Event Type" :value (:event-type booking-data)
                     :placeholder "Select event type"
                     :on {:change #(swap! state assoc-in [:event-booking :booking-data :event-type]
                                          (.. ^js % -detail -value))}}
         [:ty-option {:value "meeting"}
          [:div.flex.items-center.gap-2
           [:div.w-6.h-6.ty-bg-primary.rounded.flex.items-center.justify-center
            [:ty-icon {:name "user" :size "xs"}]]
           [:div [:div.font-medium "Business Meeting"] [:div.text-xs.ty-text- "$50/hr"]]]]
         [:ty-option {:value "workshop"}
          [:div.flex.items-center.gap-2
           [:div.w-6.h-6.ty-bg-success.rounded.flex.items-center.justify-center
            [:ty-icon {:name "star" :size "xs"}]]
           [:div [:div.font-medium "Workshop"] [:div.text-xs.ty-text- "$75/hr"]]]]
         [:ty-option {:value "conference"}
          [:div.flex.items-center.gap-2
           [:div.w-6.h-6.ty-bg-warning.rounded.flex.items-center.justify-center
            [:ty-icon {:name "globe" :size "xs"}]]
           [:div [:div.font-medium "Conference Room"] [:div.text-xs.ty-text- "$100/hr"]]]]
         [:ty-option {:value "event"}
          [:div.flex.items-center.gap-2
           [:div.w-6.h-6.ty-bg-neutral.rounded.flex.items-center.justify-center
            [:ty-icon {:name "star" :size "xs"}]]
           [:div [:div.font-medium "Special Event"] [:div.text-xs.ty-text- "$200/hr"]]]]]

        [:div.grid.grid-cols-2.gap-3
         [:ty-select {:label "Duration" :value (:duration booking-data)
                      :placeholder "Duration"
                      :on {:change (fn [e]
                                     (let [value (.. ^js e -detail -value)]
                                       (swap! state assoc-in [:event-booking :booking-data :duration] value)))}}
          [:ty-option {:value "30"}  "30 min"]
          [:ty-option {:value "60"}  "1 hour"]
          [:ty-option {:value "120"} "2 hours"]
          [:ty-option {:value "240"} "4 hours"]
          [:ty-option {:value "480"} "8 hours"]]
         [:ty-input {:type "number" :label "Attendees" :value (:attendee-count booking-state)
                     :min "1" :max "50" :placeholder "Count"
                     :on {:change #(swap! state assoc-in [:event-booking :attendee-count]
                                          (js/parseInt (.. ^js % -detail -value)))}}]]

        [:div.grid.grid-cols-2.gap-3
         [:ty-input {:type "text" :label "Contact Name" :value (:contact-name booking-data)
                     :placeholder "Full name" :required true
                     :on {:change #(swap! state assoc-in [:event-booking :booking-data :contact-name]
                                          (.. ^js % -detail -value))}}]
         [:ty-input {:type "email" :label "Contact Email" :value (:contact-email booking-data)
                     :placeholder "email@company.com" :required true
                     :on {:change #(swap! state assoc-in [:event-booking :booking-data :contact-email]
                                          (.. ^js % -detail -value))}}]]

        [:ty-textarea {:label "Special Requests" :value (:special-requests booking-data)
                       :placeholder "Any special requirements..."
                       :min-height "80px" :max-height "160px"
                       :on {:change #(swap! state assoc-in [:event-booking :booking-data :special-requests]
                                            (.. ^js % -detail -value))}}]]

       (section-divider "Add-ons")
       ;; ty-select (multiple + compact) with templated out-of-band chips —
       ;; option data-* attributes feed the chip template below.
       [:ty-select {:id "booking-addons"
                    :multiple true
                    :placeholder "Add services..."
                    :value (str/join "," selected-services)
                    :on {:change #(let [values (set (array-seq (.. ^js % -detail -values)))]
                                    (swap! state assoc-in [:event-booking :selected-services] values))}}
        [:ty-option {:value "av-equipment" :flavor "primary" :data-icon "video" :data-price "+$25"} "A/V Equipment"]
        [:ty-option {:value "catering" :flavor "success" :data-icon "utensils" :data-price "+$15/pp"} "Catering"]
        [:ty-option {:value "wifi-upgrade" :flavor "warning" :data-icon "satellite-dish" :data-price "+$10"} "Premium Wi-Fi"]
        [:ty-option {:value "parking" :flavor "warning" :data-icon "car" :data-price "+$5/spot"} "Parking"]
        [:ty-option {:value "security" :flavor "danger" :data-icon "shield" :data-price "+$50/hr"} "Security"]
        [:ty-option {:value "recording" :flavor "neutral" :data-icon "video" :data-price "+$75"} "Recording"]
        [:ty-option {:value "translation" :flavor "danger" :data-icon "globe" :data-price "+$100"} "Translation"]]
       [:div.flex.flex-wrap.gap-2.mt-3
        [:ty-selected-options {:for "booking-addons"}
         [:template
          [:ty-tag {:flavor "{flavor}" :dismissible true :pill true}
           [:ty-icon {:slot "start" :name "{data-icon}" :size "xs"}]
           "{label}"
           [:span.ty-text-- {:slot "end" :style {:font-size "0.6875rem"}} "{data-price}"]]]]]

       (section-divider "Summary")
       (let [event-type      (:event-type booking-data)
             duration-minutes (js/parseInt (:duration booking-data "60"))
             duration-hours  (/ duration-minutes 60)
             attendee-count  (:attendee-count booking-state)
             base-rates      {"meeting" 50 "workshop" 75 "conference" 100 "event" 200}
             base-rate       (get base-rates event-type 50)
             base-cost       (* base-rate duration-hours)
             service-prices  {"av-equipment" 25
                              "catering"     (* 15 attendee-count)
                              "wifi-upgrade" 10
                              "parking"      (* 5 attendee-count)
                              "security"     (* 50 duration-hours)
                              "recording"    75
                              "translation"  100}
             service-costs   (for [s selected-services] [s (get service-prices s 0)])
             subtotal        (+ base-cost (reduce + (map second service-costs)))
             tax             (* subtotal 0.0875)
             total           (+ subtotal tax)]
         [:div.space-y-2
          [:div.flex.justify-between.text-sm
           [:span.ty-text
            (str (case event-type
                   "meeting"    "Business Meeting"
                   "workshop"   "Workshop"
                   "conference" "Conference"
                   "event"      "Special Event"
                   "Meeting")
                 " ("
                 (if (< duration-minutes 60)
                   (str duration-minutes " min")
                   (str (int duration-hours) "h"))
                 ")")]
           [:span.font-medium.ty-text (str "$" (.toFixed base-cost 2))]]
          (for [[service cost] service-costs]
            ^{:key service}
            [:div.flex.justify-between.text-xs
             [:span.ty-text-
              (case service
                "av-equipment" "A/V Equipment"
                "catering"     "Catering"
                "wifi-upgrade" "Premium Wi-Fi"
                "parking"      "Parking"
                "security"     "Security"
                "recording"    "Recording"
                "translation"  "Translation"
                service)]
             [:span.ty-text- (str "$" (.toFixed cost 2))]])
          [:div.border-t.ty-border.pt-2.mt-2]
          [:div.flex.justify-between.text-xs.ty-text-
           [:span "Tax (8.75%)"] [:span (str "$" (.toFixed tax 2))]]
          [:div.flex.justify-between.items-center.font-semibold
           [:span.ty-text "Total"]
           [:span.ty-text-primary (str "$" (.toFixed total 2))]]
          [:ty-button.w-full.mt-3
           {:flavor "primary" :wide true
            :on {:click #(swap! state assoc-in [:event-booking :confirmation-modal-open] true)}}
           [:ty-icon.mr-2 {:name "check"}]
           "Confirm Booking"]
          [:p.text-xs.ty-text--.text-center.mt-1 "Free cancellation up to 24 hours before event"]])]]

     ;; Feature Showcase
     [:div.grid.grid-cols-2.gap-3
      {:style {:margin-top "1.5rem"}}
      (for [[icon color label desc]
            [["calendar"     "ty-bg-success"  "Calendar Interface" "Date selection with availability indicators."]
             ["clock"        "ty-bg-primary"  "Smart Time Slots"   "Visual availability and real-time status."]
             ["settings"     "ty-bg-warning"  "Service Config"     "Select with templated chips and pricing."]
             ["check-circle" "ty-bg-info"     "Booking Flow"       "Dynamic summary with modal confirmation."]]]
        ^{:key label}
        [:div.ty-elevated.p-4.rounded-lg
         [:div.w-8.h-8.rounded-lg.flex.items-center.justify-center.mb-3
          {:class color}
          [:ty-icon {:name icon :size "sm"}]]
         [:p.text-sm.font-semibold.ty-text.mb-1 label]
         [:p.text-xs.ty-text- desc]])]

     ;; Confirmation Modal
     [:ty-modal {:open (get-in @state [:event-booking :confirmation-modal-open] false)
                 :on {:close #(swap! state assoc-in [:event-booking :confirmation-modal-open] false)}}
      [:div.p-5.ty-elevated.rounded-lg
       {:style {:max-width "480px"}}
       [:div.flex.items-center.gap-3.mb-4
        [:div.w-9.h-9.ty-bg-success.rounded-full.flex.items-center.justify-center
         [:ty-icon {:name "check" :size "sm"}]]
        [:div
         [:h3.text-base.font-semibold.ty-text "Booking Confirmed"]
         [:p.text-xs.ty-text- "Details sent to your email."]]]
       [:div.ty-content.p-3.rounded-lg.grid.grid-cols-2.gap-2.text-sm.mb-4
        [:div [:p.text-xs.ty-text--.mb-0.5 "Event Type"]
         [:p.font-medium.ty-text
          (case (:event-type booking-data)
            "meeting"    "Business Meeting"
            "workshop"   "Workshop"
            "conference" "Conference"
            "event"      "Special Event"
            "Business Meeting")]]
        [:div [:p.text-xs.ty-text--.mb-0.5 "Date & Time"]
         [:p.font-medium.ty-text
          (let [{:keys [year month day]} (:selected-date booking-state)
                date-str (if (and year month day)
                           (.toLocaleDateString (context->date year month day)
                                                "en-US"
                                                #js {:year "numeric"
                                                     :month "long"
                                                     :day "numeric"})
                           "Today")]
            (str date-str
                 (when-let [t (:selected-time booking-state)] (str ", " t))))]]
        [:div [:p.text-xs.ty-text--.mb-0.5 "Duration"]
         [:p.font-medium.ty-text
          (let [dm (js/parseInt (:duration booking-data "60"))]
            (if (< dm 60) (str dm " min") (str (int (/ dm 60)) "h")))]]
        [:div [:p.text-xs.ty-text--.mb-0.5 "Contact"]
         [:p.font-medium.ty-text (or (:contact-name booking-data) "N/A")]]
        [:div.col-span-2 [:p.text-xs.ty-text--.mb-0.5 "Ref"]
         [:p.font-medium.font-mono.ty-text "BK-2024-001234"]]]
       (when (seq selected-services)
         [:div.flex.flex-wrap.gap-1.mb-4
          (for [s selected-services]
            ^{:key s}
            [:span.px-2.py-0.5.ty-bg-primary-.ty-text-primary.rounded.text-xs
             (case s
               "av-equipment" "A/V" "catering" "Catering"
               "wifi-upgrade" "Wi-Fi" "parking" "Parking"
               "security" "Security" "recording" "Recording"
               "translation" "Translation" s)])])
       [:div.flex.gap-2.justify-end
        [:ty-button {:flavor "neutral" :size "sm"
                     :on {:click #(swap! state assoc-in [:event-booking :confirmation-modal-open] false)}}
         "Close"]
        [:ty-button {:flavor "neutral" :size "sm"}
         [:ty-icon.mr-1 {:name "download" :size "xs"}] "Receipt"]
        [:ty-button {:flavor "primary" :size "sm"}
         [:ty-icon.mr-1 {:name "calendar" :size "xs"}] "Add to Cal"]]]]]))
