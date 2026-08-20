(ns tyrell.site.docs.date-picker
  "Documentation for ty-date-picker component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-date-picker"
                     "Date input with integrated calendar popup, ISO date string value, form participation, and optional time selection. The input shows a formatted display; the value is always ISO (YYYY-MM-DD or YYYY-MM-DDTHH:mm).")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "value"
        :type "string"
        :default "\"\""
        :description "Selected date as ISO string: YYYY-MM-DD (or YYYY-MM-DDTHH:mm with with-time)"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Label displayed above the input"}
       {:name "placeholder"
        :type "string"
        :default "\"Select date...\""
        :description "Placeholder text when no date is selected"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name — submits selected date in FormData as ISO string"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Size variant: xs, sm, md, lg, xl"}
       {:name "placement"
        :type "string"
        :default "-"
        :description "Calendar popup side plus optional cross-axis alignment, same vocabulary as ty-popup: bottom, bottom-start, bottom-end, top, top-start, top-end. The calendar only opens above or below the field, so left-*/right-* keep their alignment but let the side stay automatic. Still flips rather than clipping when the chosen side has no room."}
       {:name "flavor"
        :type "string"
        :default "-"
        :description "Semantic color: primary, success, danger, warning"}
       {:name "locale"
        :type "string"
        :default "\"en-US\""
        :description "Locale for the formatted display label (e.g. \"de-DE\", \"fr-FR\")"}
       {:name "format"
        :type "string"
        :default "\"long\""
        :description "Display format style: short, medium, long, full"}
       {:name "clearable"
        :type "boolean"
        :default "true"
        :description "Show a clear button when a date is selected"}
       {:name "with-time"
        :type "boolean"
        :default "false"
        :description "Enable time selection alongside the date"}
       {:name "required"
        :type "boolean"
        :default "false"
        :description "Mark as required — participates in form validation"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disable the picker entirely"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "change"
        :payload "{value: string, milliseconds: number, source: string, formatted: string}"
        :when-fired "Fires when the date changes — source is 'selection', 'time-change', 'clear', or 'external'"}
       {:name "open / close"
        :payload "{}"
        :when-fired "Calendar popup lifecycle. Does not bubble (native <dialog> semantics) — listen on the element itself, so a popup closing inside a ty-modal never trips the modal's own close listener."}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Clicking the input opens a calendar popup. The selected date is stored as ISO and displayed in the formatted locale label."]
       (demo-area
        [:div.flex.flex-wrap.gap-4
         [:ty-date-picker {:label "Appointment date"}]
         [:ty-date-picker {:label "Pre-selected" :value "2025-06-15"}]])
       (code-block "<ty-date-picker label=\"Appointment date\"></ty-date-picker>
<ty-date-picker label=\"Pre-selected\" value=\"2025-06-15\"></ty-date-picker>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "With Time")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "with-time"] " to add a time selector below the calendar. Value becomes " [:code "YYYY-MM-DDTHH:mm"] "."]
       (demo-area
        [:ty-date-picker {:label "Meeting time" :with-time ""}])
       (code-block "<ty-date-picker label=\"Meeting time\" with-time></ty-date-picker>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       (demo-area
        [:div.flex.flex-col.gap-3
         [:ty-date-picker {:label "Extra small" :size "xs"}]
         [:ty-date-picker {:label "Small" :size "sm"}]
         [:ty-date-picker {:label "Medium (default)" :size "md"}]
         [:ty-date-picker {:label "Large" :size "lg"}]])
       (code-block "<ty-date-picker size=\"xs\"></ty-date-picker>
<ty-date-picker size=\"sm\"></ty-date-picker>
<ty-date-picker size=\"md\"></ty-date-picker>
<ty-date-picker size=\"lg\"></ty-date-picker>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Locale and Format")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The " [:code "locale"] " and " [:code "format"] " attributes control the display label only — the " [:code "value"] " is always ISO."]
       (demo-area
        [:div.flex.flex-col.gap-3
         [:ty-date-picker {:label "German (long)" :locale "de-DE" :value "2025-06-15"}]
         [:ty-date-picker {:label "French (short)" :locale "fr-FR" :format "short" :value "2025-06-15"}]
         [:ty-date-picker {:label "Japanese (medium)" :locale "ja-JP" :format "medium" :value "2025-06-15"}]])
       (code-block "<ty-date-picker locale=\"de-DE\" value=\"2025-06-15\"></ty-date-picker>
<ty-date-picker locale=\"fr-FR\" format=\"short\"></ty-date-picker>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "States")
       (demo-area
        [:div.flex.flex-col.gap-3
         [:ty-date-picker {:label "Required" :required ""}]
         [:ty-date-picker {:label "Disabled" :disabled "" :value "2025-06-15"}]
         [:ty-date-picker {:label "No clear button" :clearable "false" :value "2025-06-15"}]])
       (code-block "<ty-date-picker label=\"Required\" required></ty-date-picker>
<ty-date-picker label=\"Disabled\" disabled value=\"2025-06-15\"></ty-date-picker>
<ty-date-picker label=\"No clear button\" clearable=\"false\"></ty-date-picker>")]])

   (doc-section "Form Integration"
     [:div.space-y-5

      [:div.ty-content.rounded-lg.p-5
       (section-label "With HTML Form")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Fully form-associated — set " [:code "name"] " and the ISO date string appears in FormData on submit."]
       (demo-area
        [:form.space-y-4
         {:on {:submit (fn [e]
                         (.preventDefault e)
                         (let [data (js/FormData. (.-target e))]
                           (js/alert (str "Date: " (.get data "start-date")))))}}
         [:ty-date-picker {:name "start-date" :label "Start date" :required ""}]
         [:ty-button {:type "submit" :flavor "primary"} "Submit"]])
       (code-block "<form>
  <ty-date-picker name=\"start-date\" label=\"Start date\" required>
  </ty-date-picker>
  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>
</form>
<!-- FormData: start-date=2025-06-15 -->")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const picker = document.querySelector('ty-date-picker');

// Read / write value
console.log(picker.value);        // '2025-06-15'
picker.value = '2025-12-25';       // Set programmatically

// Listen for changes
picker.addEventListener('change', (e) => {
  const { value, milliseconds, formatted, source } = e.detail;
  console.log(value);      // '2025-06-15'
  console.log(formatted);  // 'June 15, 2025'
  console.log(source);     // 'selection' | 'clear' | 'external'
});" "javascript")]])

   (doc-section "Theming"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Accent retheming")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Override " [:code "--ty-calendar-accent"] " and " [:code "--ty-calendar-today-accent"] " for a quick recolor of selected day and today indicator. Defaults chain back to the global palette, so unset tokens keep matching the rest of the app."]
       (demo-area
        [:div.flex.flex-wrap.gap-6.justify-center
         [:ty-date-picker {:style {"--ty-calendar-accent" "hotpink"
                                   "--ty-calendar-today-accent" "gold"}
                           :value "2025-06-15"}]])
       (code-block "<ty-date-picker
  style=\"--ty-calendar-accent: hotpink;
         --ty-calendar-today-accent: gold;\"
  value=\"2025-06-15\">
</ty-date-picker>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Distinct trigger styling")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The trigger uses " [:code "--ty-date-picker-*"] " — a thin shim over " [:code "--ty-input-*"] ". Override these to make the date-picker look distinct from other form fields without affecting " [:code "<ty-input>"] " or " [:code "<ty-select>"] "."]
       (demo-area
        [:div.flex.justify-center
         [:ty-date-picker {:style {"--ty-date-picker-bg" "#f0fdf4"
                                   "--ty-date-picker-border" "#16a34a"
                                   "--ty-date-picker-border-hover" "#15803d"
                                   "--ty-date-picker-border-focus" "#15803d"
                                   "--ty-date-picker-shadow-focus" "rgba(22, 163, 74, 0.15)"}
                           :placeholder "Pick a date"}]])
       (code-block "<ty-date-picker
  style=\"--ty-date-picker-bg: #f0fdf4;
         --ty-date-picker-border: #16a34a;
         --ty-date-picker-border-hover: #15803d;
         --ty-date-picker-border-focus: #15803d;
         --ty-date-picker-shadow-focus: rgba(22, 163, 74, 0.15);\"
  placeholder=\"Pick a date\">
</ty-date-picker>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Custom popup surface")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The popup body uses " [:code "--ty-calendar-surface-*"] " (shared with " [:code "<ty-calendar>"] "). Combine with selected-day tokens to fully retheme the dialog."]
       (code-block "<ty-date-picker
  style=\"--ty-calendar-surface-bg: #1a1a2e;
         --ty-calendar-surface-border: #2d2d44;
         --ty-calendar-day-color: #c4b5fd;
         --ty-calendar-day-hover-bg: #2d2d44;
         --ty-calendar-selected-bg: #f72585;
         --ty-calendar-selected-color: white;
         --ty-calendar-today-color: #fde68a;
         --ty-calendar-today-bg: #2d2d44;\">
</ty-date-picker>")]

      [:div.ty-elevated.rounded-lg.p-5
       [:p.ty-text-.mb-2 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Full token reference is in the " [:strong "CSS Design System"] " guide under " [:em "Per-Component Color Overrides → ty-calendar, ty-calendar-month, ty-date-picker"] "."]
       [:p.ty-text--.mb-0 {:style {:font-size "0.75rem" :line-height "1.5"}}
        "Tokens for the day grid (" [:code "--ty-calendar-*"] ") are shared across " [:code "<ty-calendar>"] ", " [:code "<ty-calendar-month>"] ", and the popup inside " [:code "<ty-date-picker>"] " — set them on a parent element to theme all three at once."]]])
))
