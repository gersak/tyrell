(ns tyrell.site.views.event-booking
  (:require
    [cljs-bean.core :refer [->clj]]
    [clojure.set :as set]
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

(defn view []
  (let [{:keys [selected-services booking-data]
         {:keys [year month day]} :selected-date
         :as booking-state} (get @state :event-booking)]
    [:div.space-y-6
     ;; Main Booking Interface
     [:div.grid.grid-cols-1.lg:grid-cols-2.gap-8
      ;; Left Column - Calendar and Date Selection
      [:div.space-y-6
       [:div.ty-elevated.p-6.rounded-xl
        [:h2.text-xl.font-semibold.ty-text.mb-4.flex.items-center.gap-2 [:ty-icon {:name "calendar" :size "sm"}] "Select Your Date"]
        [:p.ty-text-.text-sm.mb-6 "Choose from available dates. Dates in green have full availability, yellow have limited slots, and unavailable dates are disabled."]
        ;; Calendar Component
        [:div.border.ty-border.rounded-lg
         [:ty-calendar
          {:on {:change #(let [date-context (.. ^js % -detail)]
                           (swap! state assoc-in [:event-booking :selected-date] (->clj date-context)))}
           :month month
           :year year
           :day day
           :replicant/on-mount (fn [{^js el :replicant/node}]
                                 ;; Set up dayContentFn with proper CSS classes
                                 (set! (.-dayContentFn el)
                                       (fn [day-context]

                                         (let [{other-month :otherMont
                                                today? :today
                                                day-in-month :dayInMonth} (->clj day-context)
                                               availability (cond
                                                              (< day-in-month 5) "booked" ; First few days booked
                                                              (< day-in-month 15) "available" ; Middle days available
                                                              (< day-in-month 25) "limited" ; Later days limited
                                                              :else "available") ; Rest available

                                               ;; Create main day container
                                               container (.createElement js/document "div")

                                               ;; Create day number element
                                               day-number (.createElement js/document "div")

                                               ;; Create availability indicator (only for current month)
                                               indicator (when-not other-month (.createElement js/document "div"))]

                                           ;; Set container class based on state
                                           (set! (.-className container)
                                                 (str "availability-day"
                                                      (when other-month " other-month")
                                                      (when today? " today")))

                                           ;; Set day number
                                           (set! (.-className day-number) "day-num")
                                           (set! (.-textContent day-number) (str day-in-month))
                                           (.appendChild container day-number)

                                           ;; Add availability indicator for current month only
                                           (when-not other-month
                                             (set! (.-className indicator) (str "availability-indicator " availability))
                                             (.appendChild container indicator))

                                           container)))

                                 ;; Inject custom CSS styles
                                 (set! (.-customCSS el) event-booking-styles))}]]

        ;; Quick date buttons
        [:div.flex.flex-wrap.gap-2.mt-4
         [:ty-button
          {:flavor "primary"
           :outlined true
           :filled true
           :on {:click #(let [today (js/Date.)
                              value (date->context today)]
                          (swap! state assoc-in [:event-booking :selected-date] value))}}
          "Today"]
         [:ty-button
          {:flavor "success"
           :outlined true
           :filled true
           :on {:click #(let [today (js/Date.)
                              tomorrow (add-days today 1)
                              value (date->context tomorrow)]
                          (swap! state assoc-in [:event-booking :selected-date] value))}}
          "Tomorrow"]
         [:ty-button
          {:on {:click #(let [today (js/Date.)
                              next-week (add-days today 7)
                              value (date->context next-week)]
                          (swap! state assoc-in [:event-booking :selected-date] value))}}
          "Next Week"]]

        ;; Selected date display
        (when-let [{:keys [year month day]} (:selected-date booking-state)]
          (let [js-date (context->date year month day)]
            [:div.mt-4.p-3.ty-bg-primary-.rounded-lg
             [:div.flex.items-center.gap-2
              [:ty-icon.ty-text-primary
               {:name "calendar"
                :size "sm"}]
              [:div.text-sm.ty-text-primary
               [:span.font-medium "Selected Date: "]
               [:span (i18n/translate js-date "full")]]]]))]

       ;; Time Slot Selection
       [:div.ty-elevated.p-6.rounded-xl
        [:h2.text-xl.font-semibold.ty-text.mb-4.flex.items-center.gap-2 [:ty-icon {:name "clock" :size "sm"}] "Available Time Slots"]
        [:p.ty-text-.text-sm.mb-6 "Select your preferred time slot. All times are shown in Pacific Time (PST)."]

        (let [selected-time (:selected-time booking-state)
              time-slots [{:time "9:00 AM"
                           :status "available"}
                          {:time "10:00 AM"
                           :status "available"}
                          {:time "11:00 AM"
                           :status "limited"
                           :note "2 spots left"}
                          {:time "12:00 PM"
                           :status "booked"}
                          {:time "1:00 PM"
                           :status "available"}
                          {:time "2:00 PM"
                           :status "available"}
                          {:time "3:00 PM"
                           :status "limited"
                           :note "1 spot left"}
                          {:time "4:00 PM"
                           :status "available"}]]
          [:div.grid.grid-cols-2.gap-3
           (for [{:keys [time status note]} time-slots]
             ^{:key time}
             (if (= status "booked")
               ;; Disabled slot
               [:div.ty-content.p-3.rounded-lg.text-center.opacity-50.cursor-not-allowed
                [:div.text-sm.font-medium.ty-text- time]
                [:div.text-xs.ty-text-danger "Booked"]]

               ;; Selectable slot
               [:div.ty-content.p-3.rounded-lg.text-center.cursor-pointer.transition-colors.border.ty-border.hover:ty-elevated.hover:ty-border-primary
                {:class (when (= selected-time time) ["ty-bg-primary-" "ty-border-primary"])
                 :on {:click #(swap! state assoc-in [:event-booking :selected-time] time)}}
                [:div.text-sm.font-medium
                 {:class (if (= selected-time time) "ty-text-primary" "ty-text")}
                 time]
                [:div.text-xs
                 {:class (cond
                           (= selected-time time) "ty-text-primary"
                           (= status "available") "ty-text-success"
                           (= status "limited") "ty-text-warning")}
                 (cond
                   (= selected-time time) "Selected"
                   (= status "available") "Available"
                   (= status "limited") note)]]))])]]

      ;; Right Column - Booking Details & Summary
      [:div.space-y-6
       ;; Booking Details Form
       [:div.ty-elevated.p-6.rounded-xl
        [:h2.text-xl.font-semibold.ty-text.mb-4.flex.items-center.gap-2 [:ty-icon {:name "file-text" :size "sm"}] "Booking Details"]

        [:div.space-y-4
         ;; Duration
         [:div
          [:label.block.text-sm.font-medium.ty-text.mb-2 "Duration"]
          [:ty-dropdown {:value (:duration booking-data)
                         :placeholder "Select duration"
                         :on {:change (fn [e]
                                        (let [value (.. ^js e -detail -option -value)]
                                          (swap! state assoc-in [:event-booking :booking-data :duration] value)))}}
           [:ty-option {:value "30"}
            [:div.flex.items-center.justify-between.w-full
             [:span "30 minutes"]
             [:span.text-xs.ty-text- "Quick meeting"]]]
           [:ty-option {:value "60"}
            [:div.flex.items-center.justify-between.w-full
             [:span "1 hour"]
             [:span.text-xs.ty-text- "Standard"]]]
           [:ty-option {:value "120"}
            [:div.flex.items-center.justify-between.w-full
             [:span "2 hours"]
             [:span.text-xs.ty-text- "Extended session"]]]
           [:ty-option {:value "240"}
            [:div.flex.items-center.justify-between.w-full
             [:span "4 hours"]
             [:span.text-xs.ty-text- "Half day"]]]
           [:ty-option {:value "480"}
            [:div.flex.items-center.justify-between.w-full
             [:span "8 hours"]
             [:span.text-xs.ty-text- "Full day"]]]]]

         ;; Attendee count
         [:div
          [:ty-input {:type "number"
                      :label "Number of Attendees"
                      :value (:attendee-count booking-state)
                      :min "1"
                      :max "50"
                      :placeholder "Enter attendee count"
                      :on {:change #(swap! state assoc-in [:event-booking :attendee-count]
                                           (js/parseInt (.. ^js % -detail -value)))}}]]

         ;; Contact details
         [:div
          [:ty-input {:type "text"
                      :label "Contact Name"
                      :value (:contact-name booking-data)
                      :placeholder "Primary contact name"
                      :required true
                      :on {:change #(swap! state assoc-in [:event-booking :booking-data :contact-name]
                                           (.. ^js % -detail -value))}}]]

         [:div
          [:ty-input {:type "email"
                      :label "Contact Email"
                      :value (:contact-email booking-data)
                      :placeholder "your@email.com"
                      :required true
                      :on {:change #(swap! state assoc-in [:event-booking :booking-data :contact-email]
                                           (.. ^js % -detail -value))}}]]

         ;; Special requests
         [:div
          [:ty-textarea {:type "textarea"
                         :min-height "300px"
                         :label "Special Requests"
                         :value (:special-requests booking-data)
                         :placeholder "Any special requirements or requests for your booking..."
                         :rows "3"
                         :on {:change #(swap! state assoc-in [:event-booking :booking-data :special-requests]
                                              (.. ^js % -detail -value))}}]]]]

       ;; Booking Summary
       [:div.ty-elevated.p-6.rounded-xl
        [:h2.text-xl.font-semibold.ty-text.mb-4.flex.items-center.gap-2 [:ty-icon {:name "coins" :size "sm"}] "Booking Summary"]

        (let [event-type (:event-type booking-data)
              duration-minutes (js/parseInt (:duration booking-data "60"))
              duration-hours (/ duration-minutes 60)
              attendee-count (:attendee-count booking-state)

              ;; Base pricing
              base-rates {"meeting" 50
                          "workshop" 75
                          "conference" 100
                          "event" 200}
              base-rate (get base-rates event-type 50)
              base-cost (* base-rate duration-hours)

              ;; Service pricing
              service-prices {"av-equipment" 25
                              "catering" (* 15 attendee-count)
                              "wifi-upgrade" 10
                              "parking" (* 5 attendee-count)
                              "security" (* 50 duration-hours)
                              "recording" 75
                              "translation" 100}

              selected-service-costs (for [service selected-services]
                                       [service (get service-prices service 0)])

              subtotal (+ base-cost (reduce + (map second selected-service-costs)))
              tax (* subtotal 0.0875)
              total (+ subtotal tax)]

          [:div.space-y-3
           ;; Selected items
           [:div.flex.justify-between.items-center
            [:span.text-sm.ty-text
             (str (case event-type
                    "meeting" "Business Meeting"
                    "workshop" "Workshop/Training"
                    "conference" "Conference Room"
                    "event" "Special Event"
                    "Business Meeting")
                  " ("
                  (if (< duration-minutes 60)
                    (str duration-minutes " min")
                    (str (int duration-hours) " hour" (when (> duration-hours 1) "s")))
                  ")")]
            [:span.text-sm.font-medium.ty-text (str "$" (.toFixed base-cost 2))]]

           ;; Selected services
           (for [[service cost] selected-service-costs]
             ^{:key service}
             [:div.flex.justify-between.items-center
              [:span.text-sm.ty-text
               (case service
                 "av-equipment" "A/V Equipment"
                 "catering" (str "Light Catering (" attendee-count " people)")
                 "wifi-upgrade" "Premium Wi-Fi"
                 "parking" (str "Reserved Parking (" attendee-count " spots)")
                 "security" (str "Security Service (" (int duration-hours) " hour" (when (> duration-hours 1) "s") ")")
                 "recording" "Video Recording"
                 "translation" "Live Translation"
                 service)]
              [:span.text-sm.font-medium.ty-text (str "$" (.toFixed cost 2))]])

           ;; Divider
           [:div.border-t.ty-border.my-3]

           ;; Totals
           [:div.flex.justify-between.items-center
            [:span.text-sm.ty-text- "Subtotal"]
            [:span.text-sm.ty-text- (str "$" (.toFixed subtotal 2))]]

           [:div.flex.justify-between.items-center
            [:span.text-sm.ty-text- "Tax (8.75%)"]
            [:span.text-sm.ty-text- (str "$" (.toFixed tax 2))]]

           [:div.flex.justify-between.items-center.pt-2.border-t.ty-border
            [:span.font-semibold.ty-text "Total"]
            [:span.font-semibold.text-lg.ty-text-primary (str "$" (.toFixed total 2))]]])

        ;; Booking button
        [:ty-button.w-full.mt-6
         {:flavor "primary"
          :wide true
          :on {:click #(swap! state assoc-in [:event-booking :confirmation-modal-open] true)}}
         [:ty-icon.mr-2
          {:name "check"}]
         "Confirm Booking"]

        ;; Additional info
        [:div.mt-4.p-3.ty-bg-info-.rounded-lg
         [:div.flex.items-start.gap-2
          [:ty-icon.ty-text-neutral.mt-1
           {:name "info"
            :size "sm"}]
          [:div.text-xs.ty-text
           [:p.font-medium.mb-1 "Booking Policy"]
           [:p "Free cancellation up to 24 hours before your event. Full refund available for cancellations made 48 hours in advance."]]]]]
       ;; Service Selection
       [:div.ty-elevated.p-6.rounded-xl
        [:h2.text-xl.font-semibold.ty-text.mb-4.flex.items-center.gap-2 [:ty-icon {:name "target" :size "sm"}] "Services & Add-ons"]
        [:p.ty-text-.text-sm.mb-6 "Customize your booking with additional services and amenities."]

        [:div.space-y-4
         ;; Base service selection
         [:div
          [:label.block.text-sm.font-medium.ty-text.mb-2 "Event Type"]
          [:ty-dropdown {:value (:event-type booking-data)
                         :placeholder "Select event type"
                         :on {:change #(swap! state assoc-in [:event-booking :booking-data :event-type]
                                              (.. ^js % -detail -option -value))}}
           [:ty-option {:value "meeting"}
            [:div.flex.items-center.gap-3
             [:div.w-8.h-8.ty-bg-primary.rounded-full.flex.items-center.justify-center
              [:ty-icon {:name "user"
                         :size "sm"}]]
             [:div.flex-1
              [:div.font-medium "Business Meeting"]
              [:div.text-xs.ty-text- "Professional meeting space • $50/hour"]]]]

           [:ty-option {:value "workshop"}
            [:div.flex.items-center.gap-3
             [:div.w-8.h-8.ty-bg-success.rounded-full.flex.items-center.justify-center
              [:ty-icon {:name "star"
                         :size "sm"}]]
             [:div.flex-1
              [:div.font-medium "Workshop/Training"]
              [:div.text-xs.ty-text- "Large space with presentation setup • $75/hour"]]]]

           [:ty-option {:value "conference"}
            [:div.flex.items-center.gap-3
             [:div.w-8.h-8.ty-bg-warning.rounded-full.flex.items-center.justify-center
              [:ty-icon {:name "globe"
                         :size "sm"}]]
             [:div.flex-1
              [:div.font-medium "Conference Room"]
              [:div.text-xs.ty-text- "Executive boardroom • $100/hour"]]]]

           [:ty-option {:value "event"}
            [:div.flex.items-center.gap-3
             [:div.w-8.h-8.ty-bg-secondary.rounded-full.flex.items-center.justify-center
              [:ty-icon {:name "star"
                         :size "sm"}]]
             [:div.flex-1
              [:div.font-medium "Special Event"]
              [:div.text-xs.ty-text- "Full event space with catering • $200/hour"]]]]]]

         ;; Add-on services multiselect
         [:div
          [:label.block.text-sm.font-medium.ty-text.mb-2 "Additional Services"]
          [:ty-multiselect
           {:placeholder "Select additional services and amenities..."
            :value (str/join "," selected-services)
            :on {:change #(let [values (set (array-seq (.. % -detail -values)))]
                            (swap! state assoc-in [:event-booking :selected-services] values))}}
           ;; Pre-selected services (only show if selected)
           (when (contains? selected-services "av-equipment")
             [:ty-tag {:value "av-equipment"
                       :flavor "primary"}
              [:div.flex.items-center.gap-2
               [:div
                [:ty-icon.w-6.h-6.ty-bg-primary+.rounded {:name "video" :size "xs"}]]
               [:span "A/V Equipment"]
               [:span.text-xs.ty-text- "+$25"]]])

           (when (contains? selected-services "catering")
             [:ty-tag {:value "catering"
                       :flavor "success"}
              [:div.flex.items-center.gap-2
               [:div
                [:ty-icon.w-6.h-6.ty-bg-success+.rounded {:name "utensils" :size "xs"}]]
               [:span "Light Catering"]
               [:span.text-xs.ty-text- "+$15/person"]]])

           ;; Available options
           [:ty-tag {:value "wifi-upgrade"
                     :flavor "warning"}
            [:div.flex.items-center.gap-2.py-1
             [:ty-icon {:name "satellite-dish" :size "xs"}]
             [:div
              [:div.font-medium.text-sm "Premium Wi-Fi"]
              [:div.text-xs.opacity-70 "+$10"]]]]

           [:ty-tag {:value "parking"
                     :flavor "warning"}
            [:div.flex.items-center.gap-2.py-1
             [:ty-icon {:name "car" :size "xs"}]
             [:div
              [:div.font-medium.text-sm "Reserved Parking"]
              [:div.text-xs.opacity-70 "+$5/spot"]]]]

           [:ty-tag {:value "security"
                     :flavor "danger"}
            [:div.flex.items-center.gap-2.py-1
             [:ty-icon {:name "shield" :size "xs"}]
             [:div
              [:div.font-medium.text-sm "Security Service"]
              [:div.text-xs.opacity-70 "+$50/hour"]]]]

           [:ty-tag {:value "recording"
                     :flavor "secondary"}
            [:div.flex.items-center.gap-2.py-1
             [:ty-icon {:name "video" :size "xs"}]
             [:div
              [:div.font-medium.text-sm "Video Recording"]
              [:div.text-xs.opacity-70 "+$75"]]]]

           [:ty-tag {:value "translation"
                     :flavor "danger"}
            [:div.flex.items-center.gap-2.py-1
             [:ty-icon {:name "globe" :size "xs"}]
             [:div
              [:div.font-medium.text-sm "Live Translation"]
              [:div.text-xs.opacity-70 "+$100/language"]]]]]]]]]]

     ;; Feature Showcase
     [:div.grid.grid-cols-2.gap-4.mt-4
      ;; Calendar Integration
      [:div.ty-elevated.p-6.rounded-lg
       [:div.w-12.h-12.ty-bg-success.rounded-lg.flex.items-center.justify-center.mb-4
        [:ty-icon {:name "calendar"
                   :size "lg"}]]
       [:h3.font-semibold.ty-text.mb-2 "Calendar-Driven Interface"]
       [:p.text-sm.ty-text- "Interactive calendar component with availability indicators and date restrictions for seamless selection."]]

      ;; Time Slot Management
      [:div.ty-elevated.p-6.rounded-lg
       [:div.w-12.h-12.ty-bg-primary.rounded-lg.flex.items-center.justify-center.mb-4
        [:ty-icon {:name "clock"
                   :size "lg"}]]
       [:h3.font-semibold.ty-text.mb-2 "Smart Time Slots"]
       [:p.text-sm.ty-text- "Visual time slot selection with real-time availability and clear status indicators for optimal UX."]]

      ;; Service Customization
      [:div.ty-elevated.p-6.rounded-lg
       [:div.w-12.h-12.ty-bg-warning.rounded-lg.flex.items-center.justify-center.mb-4
        [:ty-icon {:name "settings"
                   :size "lg"}]]
       [:h3.font-semibold.ty-text.mb-2 "Service Configuration"]
       [:p.text-sm.ty-text- "Rich dropdown and multiselect components for customizing services with pricing and visual indicators."]]

      ;; Booking Flow
      [:div.ty-elevated.p-6.rounded-lg
       [:div.w-12.h-12.ty-bg-info.rounded-lg.flex.items-center.justify-center.mb-4
        [:ty-icon {:name "check-circle"
                   :size "lg"}]]
       [:h3.font-semibold.ty-text.mb-2 "Confirmation Flow"]
       [:p.text-sm.ty-text- "Professional booking summary with dynamic pricing and modal confirmation for completed transactions."]]]

     ;; Booking Confirmation Modal
     [:ty-modal {:open (get-in @state [:event-booking :confirmation-modal-open] false)
                 :on {:close #(swap! state assoc-in [:event-booking :confirmation-modal-open] false)}}
      [:div.p-4.sm:p-8.max-w-2xl.ty-elevated.rounded-lg.shadow-xl
       ;; Success header
       [:div.text-center.mb-8
        [:div.w-16.h-16.ty-bg-success.rounded-full.flex.items-center.justify-center.mx-auto.mb-4
         [:ty-icon {:name "check"
                    :size "xl"}]]
        [:h3.text-2xl.font-bold.ty-text.mb-2 "Booking Confirmed!"]
        [:p.ty-text- "Your event has been successfully scheduled. Confirmation details have been sent to your email."]]

       ;; Booking details
       [:div.ty-content.p-6.rounded-lg.mb-6
        [:h4.font-semibold.ty-text.mb-4 "Booking Details"]

        [:div.grid.grid-cols-1.md:grid-cols-2.gap-4.text-sm
         [:div
          [:div.ty-text-.mb-1 "Event Type"]
          [:div.font-medium.ty-text
           (case (:event-type booking-data)
             "meeting" "Business Meeting"
             "workshop" "Workshop/Training"
             "conference" "Conference Room"
             "event" "Special Event"
             "Business Meeting")]]
         [:div
          [:div.ty-text-.mb-1 "Date & Time"]
          [:div.font-medium.ty-text
           (str (or (:selected-date booking-state) "Today")
                (when-let [time (:selected-time booking-state)]
                  (str ", " time)))]]
         [:div
          [:div.ty-text-.mb-1 "Duration"]
          [:div.font-medium.ty-text
           (let [duration-minutes (js/parseInt (:duration booking-data "60"))]
             (if (< duration-minutes 60)
               (str duration-minutes " minutes")
               (str (int (/ duration-minutes 60)) " hour" (when (> duration-minutes 60) "s"))))]]
         [:div
          [:div.ty-text-.mb-1 "Attendees"]
          [:div.font-medium.ty-text (str (:attendee-count booking-state) " people")]]
         [:div
          [:div.ty-text-.mb-1 "Contact"]
          [:div.font-medium.ty-text (or (:contact-name booking-data) "N/A")]]
         [:div
          [:div.ty-text-.mb-1 "Total Cost"]
          [:div.font-medium.ty-text-primary.text-lg
           (let [event-type (:event-type booking-data)
                 duration-minutes (js/parseInt (:duration booking-data "60"))
                 duration-hours (/ duration-minutes 60)
                 attendee-count (:attendee-count booking-state)
                 base-rates {"meeting" 50
                             "workshop" 75
                             "conference" 100
                             "event" 200}
                 base-rate (get base-rates event-type 50)
                 base-cost (* base-rate duration-hours)

                 ;; Service pricing
                 service-prices {"av-equipment" 25
                                 "catering" (* 15 attendee-count)
                                 "wifi-upgrade" 10
                                 "parking" (* 5 attendee-count)
                                 "security" (* 50 duration-hours)
                                 "recording" 75
                                 "translation" 100}
                 service-total (reduce + (for [service selected-services]
                                           (get service-prices service 0)))
                 subtotal (+ base-cost service-total)
                 tax (* subtotal 0.0875)
                 total (+ subtotal tax)]
             (str "$" (.toFixed total 2)))]]]

        ;; Services
        (when (seq selected-services)
          [:div.mt-4
           [:div.ty-text-.mb-2 "Selected Services"]
           [:div.flex.flex-wrap.gap-2
            (for [service selected-services]
              ^{:key service}
              [:span.px-2.py-1.ty-bg-primary-.ty-text-primary.rounded.text-xs.font-medium
               (case service
                 "av-equipment" "A/V Equipment"
                 "catering" "Light Catering"
                 "wifi-upgrade" "Premium Wi-Fi"
                 "parking" "Reserved Parking"
                 "security" "Security Service"
                 "recording" "Video Recording"
                 "translation" "Live Translation"
                 service)])]])]

       ;; Booking reference
       [:div.p-4.ty-bg-info-.border.ty-border-info.rounded-lg.mb-6
        [:div.flex.items-center.gap-3.ty-text-neutral
         [:ty-icon {:name "info"}]
         [:div.flex-1
          [:div.font-medium.ty-text "Booking Reference"]
          [:div.text-sm.ty-text.font-mono "BK-2024-001234"]]]]

       ;; Action buttons
       [:div.flex.gap-3.justify-end
        [:ty-button {:flavor "neutral"
                     :on {:click #(swap! state assoc-in [:event-booking :confirmation-modal-open] false)}}
         "Close"]
        [:ty-button {:flavor "secondary"}
         [:ty-icon.mr-2 {:name "download"}]
         "Download Receipt"]
        [:ty-button {:flavor "primary"}
         [:ty-icon.mr-2 {:name "calendar"}]
         "Add to Calendar"]]]]]))
