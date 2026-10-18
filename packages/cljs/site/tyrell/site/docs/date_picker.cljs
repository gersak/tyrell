(ns tyrell.site.docs.date-picker
  "Documentation for ty-date-picker component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.state :as state]))

(defn- attrs->html
  "Render playground props as an attribute string, skipping defaults."
  [{:keys [size flavor with-time clear]}]
  (str/join "" [(when (not= size "sm") (str " size=\"" size "\""))
                (when (not= flavor "default") (str " flavor=\"" flavor "\""))
                (when with-time " with-time")
                (when-not clear " no-clear")]))

(defn- html-code
  "The HTML tab, plus `extra` attributes for the Datastar tab."
  [props extra]
  (str "<ty-date-picker label=\"Check-in\"" (attrs->html props) extra ">\n</ty-date-picker>"))

(defn- snippets [{:keys [size flavor with-time clear] :as props}]
  [["html" "HTML" "html" (html-code props "")]
   ["react" "React" "javascript"
    (str "import { TyDatePicker } from 'tyrell-react'\n\n"
         "<TyDatePicker\n  label=\"Check-in\""
         (when (not= size "sm") (str "\n  size=\"" size "\""))
         (when (not= flavor "default") (str "\n  flavor=\"" flavor "\""))
         (when with-time "\n  withTime")
         (when-not clear "\n  noClear")
         "\n  onChange={(e) => setDate(e.detail.value)}\n/>")]
   ["reagent" "Reagent" "clojure"
    (str "(:require [tyrell.react :as ty])\n\n"
         "[:> ty/DatePicker\n {:label \"Check-in\""
         (when (not= size "sm") (str "\n  :size \"" size "\""))
         (when (not= flavor "default") (str "\n  :flavor \"" flavor "\""))
         (when with-time "\n  :with-time true")
         (when-not clear "\n  :no-clear true")
         "\n  :on-change #(reset! date (.. % -detail -value))}]")]
   ["replicant" "Replicant" "clojure"
    (str "[:ty-date-picker\n {:label \"Check-in\""
         (when (not= size "sm") (str "\n  :size \"" size "\""))
         (when (not= flavor "default") (str "\n  :flavor \"" flavor "\""))
         (when with-time "\n  :with-time true")
         (when-not clear "\n  :no-clear \"\"")
         "\n  :on {:change #(set-date! (.. % -detail -value))}}]")]
   ;; detail.value is a UTC timestamp (the plain date with native); localValue is
   ;; the date (and time) as picked
   ["datastar" "Datastar" "html"
    (html-code props "\n  data-signals:check-in=\"''\"\n  data-on:change=\"$checkIn = evt.detail.localValue\"")]])

(defn- near-today
  "A day in the current month other than today, so both markers show."
  []
  (let [d (js/Date.)
        day (.getDate d)]
    (.setDate d (if (> day 3) (- day 2) (+ day 2)))
    (.slice (.toISOString d) 0 10)))

;; What each mode submits ---------------------------------------------------

(def ^:private value-modes
  "[label attrs value]: the same day in each mode."
  [["default" {} "2026-10-16"]
   ["with-time" {:with-time ""} "2026-10-16T14:30"]
   ["native" {:native ""} "2026-10-16"]
   ["native with-time" {:native "" :with-time ""} "2026-10-16T14:30"]])

(defn- instant
  "What the picker submits without native: the local moment as a UTC instant."
  [v]
  (let [[y m d h mi] (map js/Number (re-seq #"\d+" v))]
    (.toISOString (js/Date. y (dec m) d (or h 0) (or mi 0)))))

(defn- submitted [label attrs v]
  (get-in @state/state [:date-picker-doc label]
          (if (:native attrs) v (instant v))))

(def ^:private form-snippets
  "HTML form card, one tab per stack."
  [["html" "HTML" "html"
    "<form action=\"/bookings\" method=\"post\">
  <ty-date-picker name=\"start-date\" label=\"Start date\" native required>
  </ty-date-picker>
  <ty-button type=\"submit\" flavor=\"primary\" size=\"md\">Submit</ty-button>
</form>
<!-- FormData: start-date=2025-06-15 -->"]
   ["react" "React" "javascript"
    "import { TyDatePicker, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <TyDatePicker name=\"start-date\" label=\"Start date\" native required />
  <TyButton type=\"submit\" flavor=\"primary\" size=\"md\">Submit</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:> ty/DatePicker {:name \"start-date\" :label \"Start date\" :native true :required true}]
 [:> ty/Button {:type \"submit\" :flavor \"primary\" :size \"md\"} \"Submit\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:ty-date-picker {:name \"start-date\" :label \"Start date\" :native \"\" :required \"\"}]
 [:ty-button {:type \"submit\" :flavor \"primary\" :size \"md\"} \"Submit\"]]"]
   ["datastar" "Datastar" "html"
    "<form data-on:submit__prevent=\"@post('/bookings', {contentType: 'form'})\">
  <ty-date-picker name=\"start-date\" label=\"Start date\" native required>
  </ty-date-picker>
  <ty-button type=\"submit\" flavor=\"primary\" size=\"md\">Submit</ty-button>
</form>"]])

(def ^:private api-snippets
  "JavaScript API card, one tab per stack."
  [["html" "HTML" "javascript"
    "const picker = document.querySelector('ty-date-picker');

picker.value = '2025-12-25';

picker.addEventListener('change', (e) => {
  const { value, localValue, formatted, source } = e.detail;
  // value: '2025-12-24T23:00:00.000Z' in Zagreb ('2025-12-25' with native)
  // localValue: '2025-12-25' · formatted: 'December 25, 2025'
  // source: 'selection' | 'time-change' | 'clear' | 'external'
});
picker.addEventListener('open', () => track('picker-open'));
picker.addEventListener('close', () => track('picker-close'));"]
   ["react" "React" "javascript"
    "import { TyDatePicker } from 'tyrell-react'

<TyDatePicker value={day}
  onChange={(e) => {
    const { value, localValue, formatted, source } = e.detail
    setDay(localValue)
  }}
  onOpen={() => track('picker-open')}
  onClose={() => track('picker-close')} />"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/DatePicker {:value @day
                   :on-change #(reset! day (.. % -detail -localValue))   ; -value -formatted -source
                   :on-open #(track! \"picker-open\")
                   :on-close #(track! \"picker-close\")}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-date-picker {:value day
                  :on {:change #(set-day! (.. % -detail -localValue))   ; -value -formatted -source
                       :open #(track! \"picker-open\")
                       :close #(track! \"picker-close\")}}]"]
   ["datastar" "Datastar" "html"
    "<ty-date-picker data-signals:day=\"''\"
  data-on:change=\"$day = evt.detail.localValue\"
  data-on:close=\"@post('/day')\">
</ty-date-picker>"]])

(defn view []
  (component-page
   {:title "Date Picker"
    :group "Date & time"
    :tag "ty-date-picker"
    :description "A date field with a calendar popup. Localized label, ISO value, form-associated. Add a time selector with one attribute."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyDatePicker (React)" "atom"]]
    :source "packages/core/src/components/date-picker.ts"
    :mark "24"
    ;; The field and the calendar share one value: the calendar reads the
    ;; picker's instant as its day, the picker reads the calendar's YYYY-MM-DD.
    :demo (let [value (get-in @state/state [:date-picker-doc :hero] "2026-09-24")
                pick! #(swap! state/state assoc-in [:date-picker-doc :hero] (.. % -target -value))]
            [:div.flex.flex-col.gap-3 {:style {:width "300px"}}
             [:ty-date-picker {:label "Check-in" :value value :size "md" :on {:change pick!}}]
             [:ty-calendar {:value value :on {:change pick!}}]])}

   (playground
    {:id :date-picker
     :defaults {:size "md" :flavor "primary" :with-time false :clear true}
     :controls [{:key :size :options ["sm" "md" "lg"]}
                {:key :flavor :options ["default" "primary" "success" "danger"] :swatch? true :tones? true}
                {:key :with-time :switch? true}
                {:key :clear :switch? true}]
     :render (fn [{:keys [size flavor with-time clear]}]
               [:div {:style {:width "300px"}}
                [:ty-date-picker (cond-> {:label "Check-in"
                                          :value "2026-09-24"
                                          :size size}
                                   (not clear) (assoc :no-clear "")
                                   (not= flavor "default") (assoc :flavor flavor)
                                   with-time (assoc :with-time ""))]])
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "With time"
       :span 3
       :description [:span "Hours and minutes under the calendar. The value becomes the picked moment as a UTC instant, or "
                     [:code "YYYY-MM-DDTHH:mm"] " with " [:code "native"] "."]
       :code "<ty-date-picker label=\"Meeting\" with-time></ty-date-picker>"}
      [:div {:style {:width "100%" :max-width "320px"}}
       [:ty-date-picker {:label "Meeting" :with-time "" :value "2026-10-02T14:30"}]])

     (example
      {:title "Sizes"
       :span 3
       :description "One height ladder shared by every field."
       :code "size=\"xs | sm | md | lg | xl\""}
      [:div.flex.flex-col.items-start.gap-2.w-full
       (for [size ["xs" "sm" "md" "lg" "xl"]]
         [:ty-date-picker {:replicant/key size :size size :value "2026-03-14" :style {:width "100%"}}])])

     (example
      {:title "Locale & format"
       :span 3
       :description [:span "Only the label changes. The " [:code "value"] " stays ISO."]
       :code "<ty-date-picker locale=\"de-DE\" format=\"long\">
<ty-date-picker locale=\"ja-JP\" format=\"medium\">"}
      [:div.flex.flex-col.gap-3.w-full
       [:ty-date-picker {:label "German (long)" :locale "de-DE" :value "2025-06-15"}]
       [:ty-date-picker {:label "Japanese (medium)" :locale "ja-JP" :format "medium" :value "2025-06-15"}]])

     (example
      {:title "States"
       :span 3
       :description [:span "Required, disabled, and a message under the field with " [:code "error"] "."]
       :code "required · disabled · error=\"…\""}
      [:div.flex.flex-col.gap-3.w-full
       [:ty-date-picker {:label "Required" :required ""}]
       [:ty-date-picker {:label "Disabled" :disabled "" :value "2025-06-15"}]
       [:ty-date-picker {:label "Return" :value "2025-06-14" :error "Pick a day after check-in"}]])

     (example
      {:title "With an HTML form"
       :span 6
       :description [:span "Fully form-associated. Set " [:code "name"] " and the value is in FormData on submit; with "
                     [:code "native"] " it's the plain date. " [:code "required"] " shows its message under the field. An empty picker submits "
                     [:code "name="] ", like " [:code "<input type=date>"] "."]
       :tabs form-snippets}
      [:form.flex.flex-wrap.items-end.gap-4
       {:on {:submit (fn [e]
                       (.preventDefault e)
                       (let [data (js/FormData. (.-target e))]
                         (js/alert (str "Date: " (.get data "start-date")))))}}
       [:ty-date-picker {:name "start-date" :label "Start date" :native "" :required ""}]
       [:ty-button {:type "submit" :flavor "primary" :size "md"} "Submit"]])

     (example
      {:title "What it submits"
       :span 6
       :description [:span "By default a UTC instant: the picked moment, or for a date the moment the day starts in the browser's timezone, so it reads a day early east of UTC. "
                     [:code "native"] " submits the day and time as picked, like " [:code "<input type=date>"]
                     ". Pick a day to see what your browser sends."]
       :code "<ty-date-picker name=\"day\" value=\"2026-10-16\">
<!-- day=2026-10-15T22:00:00.000Z in Zagreb -->

<ty-date-picker name=\"at\" with-time value=\"2026-10-16T14:30\">
<!-- at=2026-10-16T12:30:00.000Z -->

<ty-date-picker name=\"day\" native value=\"2026-10-16\">
<!-- day=2026-10-16 -->

<ty-date-picker name=\"at\" native with-time value=\"2026-10-16T14:30\">
<!-- at=2026-10-16T14:30 -->"}
      [:div.gap-4.w-full {:style {:display "grid" :grid-template-columns "repeat(auto-fit, minmax(220px, 1fr))"}}
       (for [[label attrs v] value-modes]
         [:div.flex.flex-col.gap-2 {:replicant/key label}
          [:ty-date-picker (merge attrs {:label label :value v
                                         :on {:change #(swap! state/state assoc-in [:date-picker-doc label]
                                                              (.. % -detail -value))}})]
          [:code.ty-text-.text-xs (or (submitted label attrs v) "name= (empty)")]])])

     (example
      {:title "JavaScript API"
       :tabs api-snippets}
      nil)))

   (page-section
    {:title "Theming" :sub "CSS variables. No build step." :dark? true}
    (example
     {:title "Accent"
      :side? true
      :lang "css"
      :description [:span "Selected day and today marker. The day-grid tokens are shared with " [:code "<ty-calendar>"] ", shown inline here."]
      :code "ty-date-picker {
  --ty-calendar-accent: hotpink;
  --ty-calendar-today-accent: gold;
}"}
     [:ty-calendar {:style {"--ty-calendar-accent" "hotpink"
                            "--ty-calendar-today-accent" "gold"}
                    :value (near-today)}])

    (example
     {:title "Field styling"
      :side? true
      :lang "css"
      :description [:span "Own tokens layered over " [:code "--ty-input-*"] ", so date pickers can stand apart from other fields."]
      :code "ty-date-picker {
  --ty-date-picker-bg: #f0fdf4;
  --ty-date-picker-border: #16a34a;
  --ty-date-picker-border-focus: #15803d;
}"}
     [:div {:style {:max-width "300px"}}
      [:ty-date-picker {:style {"--ty-date-picker-bg" "#f0fdf4"
                                "--ty-date-picker-border" "#16a34a"
                                "--ty-date-picker-border-hover" "#15803d"
                                "--ty-date-picker-border-focus" "#15803d"
                                "--ty-date-picker-shadow-focus" "rgba(22, 163, 74, 0.15)"}
                        :label "Delivery"
                        :placeholder "Pick a date"}]])

    (example
     {:title "Popup surface"
      :side? true
      :lang "css"
      :description "The popup's own surface, plus the day colors inside it."
      :code "ty-date-picker {
  --ty-calendar-surface-bg: #1a1a2e;
  --ty-calendar-surface-border: #2d2d44;
  --ty-calendar-day-color: #c4b5fd;
  --ty-calendar-selected-bg: #f72585;
}"}
     (let [tokens {"--ty-calendar-surface-bg" "#1a1a2e"
                   "--ty-calendar-surface-border" "#2d2d44"
                   "--ty-calendar-day-color" "#c4b5fd"
                   "--ty-calendar-day-hover-bg" "#2d2d44"
                   "--ty-calendar-selected-bg" "#f72585"
                   "--ty-calendar-selected-color" "white"}]
       ;; The popup only exists while open, so show its surface around an
       ;; inline calendar, driven by the same variables.
       [:div.self-start.max-w-full.overflow-x-auto.rounded-xl.p-3
        {:style (merge tokens {:background "var(--ty-calendar-surface-bg)"
                               :border "1px solid var(--ty-calendar-surface-border)"})}
        [:ty-calendar {:value (near-today)}]])))

   (api-section
    {:properties validation-properties
     :attributes ["Value"
                  ["value" "string" "\"\"" "The selected date. Reads YYYY-MM-DD, YYYY-MM-DDTHH:mm (local) or an ISO instant. Holds what the form submits: a UTC instant (date-only: when the day starts in the browser's timezone), or with native YYYY-MM-DD / YYYY-MM-DDTHH:mm. null when empty."]
                  ["label" "string" "Label shown above the field."]
                  ["placeholder" "string" "\"Select date...\"" "Text shown when no date is selected."]
                  ["name" "string" "Form field name. An empty picker submits name= (like <input type=date>)."]
                  ["native" "boolean" "false" "Submit wall-clock values like the browser's own inputs: YYYY-MM-DD, or YYYY-MM-DDTHH:mm with with-time."]
                  ["error" "string" "\"\"" "Message under the field. While it's set, the picker and its calendar look like flavor=\"danger\", whatever the flavor, and your flavor's look comes back when it clears. Validation messages show here."]
                  "Appearance"
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl."]
                  ["placement" "string" "Popup side plus optional alignment, same vocabulary as ty-popup: bottom, bottom-start, bottom-end, top, top-start, top-end. Flips instead of clipping when there's no room."]
                  ["flavor" "string" "primary, success, danger or warning."]
                  ["locale" "string" "\"en-US\"" "Language of the displayed date, e.g. de-DE or fr-FR."]
                  ["format" "string" "\"long\"" "short, medium, long or full."]
                  "Behavior"
                  ["no-clear" "boolean" "false" "No clear button (it shows once a date is set)."]
                  ["with-time" "boolean" "false" "Add hour and minute selection. Toggling keeps the picked day and time."]
                  ["min" "string" "Earliest selectable date (ISO). Earlier days are disabled in the popup, even while it's open."]
                  ["max" "string" "Latest selectable date (ISO). Later days are disabled in the popup, even while it's open."]
                  ["required" "boolean" "false" "Take part in form validation."]
                  ["disabled" "boolean" "false" "Disable the picker."]]
     :events [["change" "{value, localValue, milliseconds, formatted, source}" "Fires when the date changes. value is what the form submits; localValue is local YYYY-MM-DD (or YYYY-MM-DDTHH:mm); milliseconds is epoch ms (date-only: when the day starts locally). source is selection, time-change, clear or external."]
              ["open / close" "Popup lifecycle. Doesn't bubble (native <dialog> semantics): listen on the element itself, so a popup closing inside a ty-modal never trips the modal's close listener."]]
     :keyboard [["Arrows" "Move between days; in the month view, between months."]
                ["Page Up / Page Down" "Previous / next month."]
                ["Shift + Page Up / Down" "Previous / next year."]
                ["Title button" "Opens the month/year view. Arrows there step years; Escape goes back to days."]
                ["Hours / minutes" "Type two digits per field; the hour hands over to minutes. Arrow Up/Down step the value."]
                ["Escape" "Close the calendar; focus goes back to the field, also inside ty-modal."]
                ["Enter / Space on ×" "Clear the value; focus stays on the field."]]
     :css-vars [["--ty-date-picker-bg" "Field background."]
                ["--ty-date-picker-border" "Field border."]
                ["--ty-date-picker-border-hover" "Border on hover."]
                ["--ty-date-picker-border-focus" "Border while focused or open."]
                ["--ty-date-picker-shadow-focus" "Focus ring."]
                ["--ty-calendar-accent" "Selected day in the popup."]
                ["--ty-calendar-today-accent" "Today marker in the popup."]]})))
