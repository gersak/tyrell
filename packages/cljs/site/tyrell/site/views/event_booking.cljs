(ns tyrell.site.views.event-booking
  (:require
   [cljs-bean.core :refer [->clj]]
   [clojure.string :as str]
   [tyrell.i18n :as i18n]
   [tyrell.i18n.time]
   [tyrell.site.state :refer [state]]
   [tyrell.site.views.kit :as kit])
  (:require-macros [tyrell.css :refer [defstyles]]))

(defstyles event-booking-styles "tyrell/site/views/event_booking.css")

;; --- Data --------------------------------------------------------------------

(def ^:private event-types
  [{:id "meeting"    :label "Business Meeting" :rate 50  :icon "user"  :bg "ty-bg-primary"}
   {:id "workshop"   :label "Workshop"         :rate 75  :icon "star"  :bg "ty-bg-success"}
   {:id "conference" :label "Conference Room"  :rate 100 :icon "globe" :bg "ty-bg-warning"}
   {:id "event"      :label "Special Event"    :rate 200 :icon "star"  :bg "ty-bg-neutral"}])

(def ^:private add-ons
  "cost: (fn [hours attendees]) in dollars."
  [{:id "av-equipment" :label "A/V Equipment" :flavor "primary" :icon "video"          :price "+$25"     :cost (constantly 25)}
   {:id "catering"     :label "Catering"      :flavor "success" :icon "utensils"       :price "+$15/pp"  :cost #(* 15 %2)}
   {:id "wifi-upgrade" :label "Premium Wi-Fi" :flavor "warning" :icon "satellite-dish" :price "+$10"     :cost (constantly 10)}
   {:id "parking"      :label "Parking"       :flavor "warning" :icon "car"            :price "+$5/spot" :cost #(* 5 %2)}
   {:id "security"     :label "Security"      :flavor "danger"  :icon "shield"         :price "+$50/hr"  :cost #(* 50 %1)}
   {:id "recording"    :label "Recording"     :flavor "neutral" :icon "video"          :price "+$75"     :cost (constantly 75)}
   {:id "translation"  :label "Translation"   :flavor "danger"  :icon "globe"          :price "+$100"    :cost (constantly 100)}])

(def ^:private durations [["30" "30 min"] ["60" "1 hour"] ["120" "2 hours"] ["240" "4 hours"] ["480" "8 hours"]])

(def ^:private time-slots
  [["9:00 AM" "available"] ["10:00 AM" "available"] ["11:00 AM" "limited" "2 spots left"] ["12:00 PM" "booked"]
   ["1:00 PM" "available"] ["2:00 PM" "available"] ["3:00 PM" "limited" "1 spot left"] ["4:00 PM" "available"]])

(def ^:private legend
  [["available" "Available" "success"] ["limited" "Few spots" "warning"] ["booked" "Fully booked" "danger"]])

(defn- date->context [^js d] {:year (.getFullYear d) :month (inc (.getMonth d)) :day (.getDate d)})
(defn- days-from-now [n] (date->context (doto (js/Date.) (.setDate (+ (.getDate (js/Date.)) n)))))

(kit/init! :event-booking
           {:date (days-from-now 5) :time "10:00 AM" :add-ons #{"av-equipment" "catering"} :attendees 15
            :event-type "workshop" :duration "240"
            :contact-name "Alex Martinez" :contact-email "alex.martinez@techconference.org"
            :requests "We'll need extra power outlets for laptops and a presentation setup with dual screens, plus a coffee station for the afternoon break.\n\nReliable high-speed internet is crucial. If possible, arrange the room in a U-shape for group discussions."})

;; --- Helpers -----------------------------------------------------------------

(defn- by-id [xs id] (some #(when (= id (:id %)) %) xs))
(defn- money [n] (str "$" (.toFixed n 2)))
(defn- duration-label [minutes] (if (< minutes 60) (str minutes " min") (str (/ minutes 60) "h")))
(defn- put! [k v] (swap! state assoc-in [:event-booking k] v))

(defn- date-label [{:keys [year month day]}]
  (when year (i18n/translate (js/Date. year (dec month) day) "full")))

(defn- availability
  "Demo availability, stable per date: weekends fill up, a few days are gone."
  [year month day]
  (let [h (mod (+ (* year 7) (* month 31) (* day 13)) 10)]
    (cond (< h 2) "booked"
          (or (#{0 6} (.getDay (js/Date. year (dec month) day))) (< h 4)) "limited"
          :else "available")))

(defn- slots-for
  "The day's time slots, following its calendar availability."
  [{:keys [year month day]}]
  (let [status (if year (availability year month day) "available")]
    (map-indexed (fn [i [t slot-status note]]
                   (case status
                     "booked" [t "booked"]
                     "limited" (if (odd? (+ i day)) [t "booked"] [t "limited" "Last spot"])
                     [t slot-status note]))
                 time-slots)))

(defn- day-content
  "ty-calendar dayContentFn: day number plus an availability dot for this month's days."
  [day-context]
  (let [{:keys [otherMonth today dayInMonth year month]} (->clj day-context)
        el (fn [class text] (doto (.createElement js/document "div") (-> .-className (set! class)) (-> .-textContent (set! text))))
        cell (el (str "availability-day" (when otherMonth " other-month") (when today " today")) nil)]
    (.appendChild cell (el "day-num" (str dayInMonth)))
    (when-not otherMonth
      (.appendChild cell (el (str "availability-indicator " (availability year month dayInMonth)) nil)))
    cell))

(defn- quote-for
  "Price breakdown for the current booking."
  [{:keys [event-type duration attendees] selected :add-ons}]
  (let [minutes (js/parseInt (or duration "60"))
        hours (/ minutes 60)
        base (* (:rate (by-id event-types event-type) 50) hours)
        extras (for [id selected :let [{:keys [label cost]} (by-id add-ons id)]] [label (cost hours attendees)])
        subtotal (+ base (reduce + (map second extras)))
        tax (* subtotal 0.0875)]
    {:minutes minutes :base base :extras extras :tax tax :total (+ subtotal tax)}))

(defn- heading [label & [aside]]
  [:div.flex.items-baseline.justify-between.gap-3.mb-3.mt-6
   [:h4.text-sm.font-semibold.ty-text++ label] aside])

;; --- View --------------------------------------------------------------------

(defn view []
  (let [{:keys [date event-type modal] :as b} (:event-booking @state)
        slots (slots-for date)
        ;; a slot picked on another day may be booked on this one
        slot-time (some (fn [[t status]] (when (and (= t (:time b)) (not= status "booked")) t)) slots)
        {:keys [minutes base extras tax total]} (quote-for b)
        bind (fn [k attrs & [event]]
               (merge attrs {:value (get b k) :on {(or event :change) #(put! k (kit/value %))}}))
        type-label (:label (by-id event-types event-type) "Meeting")]
    [:div
     [:div.gap-6 {:class ["grid" "grid-cols-1" "lg:grid-cols-2"]}
      ;; Left: date and time
      [:div
       (heading "Date")
       [:div.border.ty-border.rounded-xl.overflow-hidden
        [:div.flex.justify-center.px-4.py-5
         {:style {:background "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in oklch, var(--ty-color-primary) 7%, transparent), transparent 70%)"}}
         [:ty-calendar
          (merge date
                 {:width "340px"
                  :min (let [{:keys [year month day]} (days-from-now 0)]
                         (str/join "-" [year (.padStart (str month) 2 "0") (.padStart (str day) 2 "0")]))
                  :on {:change (fn [^js e] (let [d (.-detail e)] (put! :date {:year (.-year d) :month (.-month d) :day (.-day d)})))}
                  :replicant/on-mount (fn [{^js el :replicant/node}]
                                        (set! (.-dayContentFn el) day-content)
                                        (set! (.-customCSS el) event-booking-styles))})]]
        [:div.flex.flex-wrap.items-center.justify-between.gap-3.px-4.py-3.border-t.ty-border
         {:style {:background "color-mix(in oklch, var(--ty-text-strong) 3%, transparent)"}}
         [:div.flex.flex-wrap.items-center.gap-x-4.gap-y-1
          (for [[k label flavor] legend]
            [:span.inline-flex.items-center.text-xs.ty-text- {:class ["gap-1.5"] :replicant/key k}
             [:span.inline-block.rounded-full {:class ["w-1.5" "h-1.5"] :style {:background (str "var(--ty-color-" flavor ")")}}]
             label])]
         [:div.flex.items-center.gap-1
          (for [[label n] [["Today" 0] ["Tomorrow" 1] ["Next week" 7]]]
            [:button.text-xs.font-medium.py-1.rounded-full.border.ty-border.ty-text.cursor-pointer.hover:ty-border-primary.hover:ty-text-primary.transition-colors {:class ["px-2.5"] :replicant/key label :type "button" :on {:click #(put! :date (days-from-now n))}}
             label])]]]

       (heading "Time Slot"
                [:span.inline-flex.items-center.text-xs.font-medium.ty-text-primary {:class ["gap-1.5"]}
                 [:ty-icon {:name "calendar" :size "xs"}] (date-label date)])
       (kit/cols
        (for [[slot status note] slots
              :let [booked? (= status "booked") selected? (= slot slot-time)]]
          [:button.p-2.rounded-lg.text-center.text-xs.border.transition-colors
           {:replicant/key slot :type "button" :disabled booked?
            :class (cond booked? ["ty-content" "ty-border" "opacity-50" "cursor-not-allowed"]
                         selected? ["ty-border-primary" "cursor-pointer"]
                         :else ["ty-content" "ty-border" "cursor-pointer" "hover:ty-border-primary"])
            ;; same solid tokens as the calendar's selected day
            :style (when selected? {:background "var(--ty-solid-primary, var(--ty-color-primary))"
                                    :color "var(--ty-solid-primary-fg, white)"
                                    :box-shadow "0 8px 18px -8px color-mix(in oklch, var(--ty-color-primary) 80%, transparent)"})
            :on {:click #(put! :time slot)}}
           [:div.font-medium {:class (when-not selected? "ty-text")} slot]
           [:div {:class (cond selected? "opacity-80" booked? "ty-text-danger"
                               (= status "limited") "ty-text-warning" :else "ty-text-success")}
            (cond selected? "Selected" booked? "Booked" note note :else "Available")]]))]

      ;; Right: details, add-ons and summary
      [:div
       (heading "Details")
       [:div.flex.flex-col.gap-3
        [:ty-select (bind :event-type {:label "Event Type" :placeholder "Select event type"})
         (for [{:keys [id label rate icon bg]} event-types]
           [:ty-option {:replicant/key id :value id}
            [:div.flex.items-center.gap-2
             [:div.w-6.h-6.rounded.flex.items-center.justify-center {:class bg} [:ty-icon {:name icon :size "xs"}]]
             [:div [:div.font-medium label] [:div.text-xs.ty-text- (str "$" rate "/hr")]]]])]
        (kit/cols
         [:ty-select (bind :duration {:label "Duration"})
          (for [[v label] durations] [:ty-option {:replicant/key v :value v} label])]
         [:ty-input (bind :attendees {:type "number" :label "Attendees" :min "1" :max "50"})])
        (kit/cols
         [:ty-input (bind :contact-name {:label "Contact Name" :required true})]
         [:ty-input (bind :contact-email {:type "email" :label "Contact Email" :required true})])
        [:ty-textarea (bind :requests {:label "Special Requests" :min-height "80px" :max-height "160px"} :input)]]

       (heading "Add-ons")
       ;; Multiple + templated chips: option data-* attributes feed the chip template
       [:ty-select {:id "booking-addons" :multiple true :placeholder "Add services..."
                    :value (str/join "," (:add-ons b))
                    :on {:change (fn [^js e] (put! :add-ons (set (.. e -detail -values))))}}
        (for [{:keys [id label flavor icon price]} add-ons]
          [:ty-option {:replicant/key id :value id :flavor flavor :data-icon icon :data-price price} label])]
       [:div.flex.flex-wrap.gap-2.mt-3
        [:ty-selected-options {:for "booking-addons"}
         [:template
          [:ty-tag {:flavor "{flavor}" :dismissible true :pill true}
           [:ty-icon {:slot "start" :name "{data-icon}" :size "xs"}]
           "{label}"
           [:span.ty-text-- {:slot "end" :style {:font-size "0.6875rem"}} "{data-price}"]]]]]

       (heading "Summary")
       [:div.flex.flex-col.gap-2
        [:div.flex.justify-between.text-sm
         [:span.ty-text (str type-label " (" (duration-label minutes) ")")]
         [:span.font-medium.ty-text (money base)]]
        (for [[label cost] extras]
          [:div.flex.justify-between.text-xs.ty-text- {:replicant/key label} [:span label] [:span (money cost)]])
        [:div.flex.justify-between.text-xs.ty-text-.border-t.ty-border.pt-2.mt-1
         [:span "Tax (8.75%)"] [:span (money tax)]]
        [:div.flex.justify-between.items-center.font-semibold
         [:span.ty-text "Total"] [:span.ty-text-primary (money total)]]
        [:ty-button.w-full.mt-3 {:flavor "neutral+" :wide true :disabled (nil? slot-time) :on {:click #(put! :modal true)}}
         [:ty-icon {:slot "start" :name (if slot-time "check" "clock")}] (if slot-time "Confirm Booking" "Pick a time")]
        [:p.text-xs.ty-text--.text-center "Free cancellation up to 24 hours before event"]]]]

     (kit/result-modal
      {:open (boolean modal) :on-close #(put! :modal false) :icon "check" :flavor "success"
       :title "Booking Confirmed" :subtitle "Details sent to your email."
       :actions [[:ty-button {:flavor "neutral" :size "sm" :on {:click #(put! :modal false)}} "Close"]
                 [:ty-button {:flavor "neutral" :size "sm"} [:ty-icon {:slot "start" :name "download" :size "xs"}] "Receipt"]
                 [:ty-button {:flavor "primary" :size "sm"} [:ty-icon {:slot "start" :name "calendar" :size "xs"}] "Add to Cal"]]}
      (kit/summary [["Event Type" type-label]
                    ["Date & Time" (str (date-label date) ", " slot-time)]
                    ["Duration" (duration-label minutes)]
                    ["Contact" (:contact-name b)]
                    ["Ref" (str "BK-" (:year date) "-001234")]])
      [:div.flex.flex-wrap.gap-1.mt-3
       (for [[label] extras] [:span.px-2.ty-bg-primary-.ty-text-primary.rounded.text-xs {:class ["py-0.5"] :replicant/key label} label])])]))
