(ns tyrell.site.docs.date-picker
  "Documentation for ty-date-picker component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]))

(defn- attrs->html
  "Render playground props as an attribute string, skipping defaults."
  [{:keys [size flavor with-time clearable]}]
  (str/join "" [(when (not= size "sm") (str " size=\"" size "\""))
                (when (not= flavor "default") (str " flavor=\"" flavor "\""))
                (when with-time " with-time")
                (when-not clearable " clearable=\"false\"")]))

(defn- snippets [{:keys [size flavor with-time clearable] :as props}]
  [["html" "HTML" "html"
    (str "<ty-date-picker label=\"Check-in\"" (attrs->html props) ">\n</ty-date-picker>")]
   ["react" "React" "javascript"
    (str "import { TyDatePicker } from 'tyrell-react'\n\n"
         "<TyDatePicker\n  label=\"Check-in\""
         (when (not= size "sm") (str "\n  size=\"" size "\""))
         (when (not= flavor "default") (str "\n  flavor=\"" flavor "\""))
         (when with-time "\n  withTime")
         (when-not clearable "\n  clearable={false}")
         "\n  onChange={(e) => setDate(e.detail.value)}\n/>")]
   ["reagent" "Reagent" "clojure"
    (str "(:require [tyrell.react :as ty])\n\n"
         "[:> ty/DatePicker\n {:label \"Check-in\""
         (when (not= size "sm") (str "\n  :size \"" size "\""))
         (when (not= flavor "default") (str "\n  :flavor \"" flavor "\""))
         (when with-time "\n  :with-time true")
         (when-not clearable "\n  :clearable false")
         "\n  :on-change #(reset! date (.. % -detail -value))}]")]
   ["replicant" "Replicant" "clojure"
    (str "[:ty-date-picker\n {:label \"Check-in\""
         (when (not= size "sm") (str "\n  :size \"" size "\""))
         (when (not= flavor "default") (str "\n  :flavor \"" flavor "\""))
         (when with-time "\n  :with-time true")
         (when-not clearable "\n  :clearable \"false\"")
         "\n  :on {:change #(set-date! (.. % -detail -value))}}]")]
   ["datastar" "Datastar" "html"
    (str "<ty-date-picker label=\"Check-in\"" (attrs->html props)
         "\n  data-on:change=\"$checkIn = evt.detail.value\">\n</ty-date-picker>")]])

(defn- near-today
  "A day in the current month other than today, so both markers show."
  []
  (let [d (js/Date.)
        day (.getDate d)]
    (.setDate d (if (> day 3) (- day 2) (+ day 2)))
    (.slice (.toISOString d) 0 10)))

(defn view []
  (component-page
   {:title "Date Picker"
    :group "Date & time"
    :tag "ty-date-picker"
    :description "A date field with a calendar popup. Localized label, ISO value, form-associated. Add a time selector with one attribute."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyDatePicker (React)" "atom"]]
    :source "packages/core/src/components/date-picker.ts"
    :mark "24"
    :demo [:div.flex.flex-col.gap-3 {:style {:width "300px"}}
           [:ty-date-picker {:label "Check-in" :value "2026-09-24" :size "md"}]
           [:ty-calendar {:value "2026-09-24"}]]}

   (playground
    {:id :date-picker
     :defaults {:size "md" :flavor "primary" :with-time false :clearable true}
     :controls [{:key :size :options ["sm" "md" "lg"]}
                {:key :flavor :options ["default" "primary" "success" "danger"] :swatch? true :tones? true}
                {:key :with-time :switch? true}
                {:key :clearable :switch? true}]
     :render (fn [{:keys [size flavor with-time clearable]}]
               [:div {:style {:width "300px"}}
                [:ty-date-picker (cond-> {:label "Check-in"
                                          :value "2026-09-24"
                                          :size size
                                          :clearable (if clearable "true" "false")}
                                   (not= flavor "default") (assoc :flavor flavor)
                                   with-time (assoc :with-time ""))]])
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "With time"
       :span 4
       :description [:span "Hours and minutes under the calendar. The value becomes " [:code "YYYY-MM-DDTHH:mm"] "."]
       :code "<ty-date-picker label=\"Meeting\" with-time></ty-date-picker>"}
      [:div {:style {:width "100%" :max-width "320px"}}
       [:ty-date-picker {:label "Meeting" :with-time "" :value "2026-10-02T14:30"}]])

     (example
      {:title "Sizes"
       :span 2
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
       :description "Required, disabled, and without the clear button."
       :code "required · disabled · clearable=\"false\""}
      [:div.flex.flex-col.gap-3.w-full
       [:ty-date-picker {:label "Required" :required ""}]
       [:ty-date-picker {:label "Disabled" :disabled "" :value "2025-06-15"}]])

     (example
      {:title "With an HTML form"
       :span 6
       :description [:span "Fully form-associated. Set " [:code "name"] " and the ISO date is in FormData on submit."]
       :code "<form>
  <ty-date-picker name=\"start-date\" label=\"Start date\" required>
  </ty-date-picker>
  <ty-button type=\"submit\" flavor=\"primary\" size=\"md\">Submit</ty-button>
</form>
<!-- FormData: start-date=2025-06-15 -->"}
      [:form.flex.flex-wrap.items-end.gap-4
       {:on {:submit (fn [e]
                       (.preventDefault e)
                       (let [data (js/FormData. (.-target e))]
                         (js/alert (str "Date: " (.get data "start-date")))))}}
       [:ty-date-picker {:name "start-date" :label "Start date" :required ""}]
       [:ty-button {:type "submit" :flavor "primary" :size "md"} "Submit"]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const picker = document.querySelector('ty-date-picker');

picker.value = '2025-12-25';

picker.addEventListener('change', (e) => {
  const { value, formatted, source } = e.detail;
  // '2025-06-15', 'June 15, 2025', 'selection' | 'clear' | 'external'
});"}
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
       [:div.self-start.rounded-xl.p-3
        {:style (merge tokens {:background "var(--ty-calendar-surface-bg)"
                               :border "1px solid var(--ty-calendar-surface-border)"})}
        [:ty-calendar {:value (near-today)}]])))

   (api-section
    {:properties validation-properties
     :attributes ["Value"
                  ["value" "string" "\"\"" "Selected date as ISO: YYYY-MM-DD, or YYYY-MM-DDTHH:mm with with-time."]
                  ["label" "string" "Label shown above the field."]
                  ["placeholder" "string" "\"Select date...\"" "Text shown when no date is selected."]
                  ["name" "string" "Form field name. Submits the ISO value with its form."]
                  "Appearance"
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl."]
                  ["placement" "string" "Popup side plus optional alignment, same vocabulary as ty-popup: bottom, bottom-start, bottom-end, top, top-start, top-end. Flips instead of clipping when there's no room."]
                  ["flavor" "string" "primary, success, danger or warning."]
                  ["locale" "string" "\"en-US\"" "Language of the displayed date, e.g. de-DE or fr-FR."]
                  ["format" "string" "\"long\"" "short, medium, long or full."]
                  "Behavior"
                  ["clearable" "boolean" "true" "Show a clear button when a date is selected."]
                  ["with-time" "boolean" "false" "Add hour and minute selection."]
                  ["required" "boolean" "false" "Take part in form validation."]
                  ["disabled" "boolean" "false" "Disable the picker."]]
     :events [["change" "{value, milliseconds, source, formatted}" "Fires when the date changes. source is selection, time-change, clear or external."]
              ["open / close" "Popup lifecycle. Doesn't bubble (native <dialog> semantics): listen on the element itself, so a popup closing inside a ty-modal never trips the modal's close listener."]]
     :keyboard [["Arrows" "Move between days; in the month view, between months."]
                ["Page Up / Page Down" "Previous / next month."]
                ["Shift + Page Up / Down" "Previous / next year."]
                ["Title button" "Opens the month/year view. Arrows there step years; Escape goes back to days."]
                ["Hours / minutes" "Type two digits per field; the hour hands over to minutes. Arrow Up/Down step the value."]]
     :css-vars [["--ty-date-picker-bg" "Field background."]
                ["--ty-date-picker-border" "Field border."]
                ["--ty-date-picker-border-hover" "Border on hover."]
                ["--ty-date-picker-border-focus" "Border while focused or open."]
                ["--ty-date-picker-shadow-focus" "Focus ring."]
                ["--ty-calendar-accent" "Selected day in the popup."]
                ["--ty-calendar-today-accent" "Today marker in the popup."]]})))
