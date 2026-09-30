(ns tyrell.site.docs.calendar
  "Documentation for ty-calendar component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-calendar"
                     "Complete date picker combining navigation and a month grid with date selection, form integration, and ISO date API. Can be stateless for full external control.")

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
        :description "Selected date as ISO string (YYYY-MM-DD). Preferred over year/month/day"}
       {:name "year"
        :type "number"
        :default "current year"
        :description "Initially displayed year — use value for the selected date"}
       {:name "month"
        :type "number"
        :default "current month"
        :description "Initially displayed month (1–12)"}
       {:name "day"
        :type "number"
        :default "-"
        :description "Initially selected day (1–31)"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name — submits selected date as ISO string in FormData"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Predefined size: sm, md, lg"}
       {:name "locale"
        :type "string"
        :default "\"en-US\""
        :description "Locale for day/month names (e.g. \"de-DE\", \"fr-FR\")"}
       {:name "min"
        :type "string"
        :default "-"
        :description "Earliest selectable date (ISO YYYY-MM-DD) — earlier days disabled, navigation clamped"}
       {:name "max"
        :type "string"
        :default "-"
        :description "Latest selectable date (ISO YYYY-MM-DD) — later days disabled, navigation clamped"}
       {:name "hide-navigation"
        :type "boolean"
        :default "false"
        :description "Drop the month/year navigation bar — bare presence attribute, like disabled. Shown by default; use this when you drive the displayed month externally."}
       {:name "stateless"
        :type "boolean"
        :default "false"
        :description "Disable internal state — parent controls all state via attributes and events"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "change"
        :payload "{year, month, day, action: 'select', source: 'day-click', dayContext}"
        :when-fired "Fires when a day is selected by clicking"}
       {:name "navigate"
        :payload "{month, year, action: 'navigate', source: 'navigation'}"
        :when-fired "Fires when navigating between months or years"}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Displays the current month by default. Selected date is exposed as an ISO string via the " [:code "value"] " property and emitted in the " [:code "change"] " event."]
       (demo-area
        [:div.flex.justify-center
         [:ty-calendar]])
       (code-block "<ty-calendar></ty-calendar>

<!-- Pre-select a date -->
<ty-calendar value=\"2025-06-15\"></ty-calendar>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Three predefined sizes — " [:code "sm"] " for compact spaces, " [:code "lg"] " for prominent date pickers."]
       (demo-area
        [:div.flex.flex-wrap.items-start.gap-6
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar {:size "sm"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "sm"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar {:size "md"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "md"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar {:size "lg"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "lg"]]])
       (code-block "<ty-calendar size=\"sm\"></ty-calendar>
<ty-calendar size=\"md\"></ty-calendar>
<ty-calendar size=\"lg\"></ty-calendar>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Locale")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "locale"] " to localize day and month names. Weeks always start on Monday."]
       (demo-area
        [:div.flex.flex-wrap.items-start.gap-6
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar {:locale "de-DE"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "de-DE"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar {:locale "ja-JP"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "ja-JP"]]])
       (code-block "<ty-calendar locale=\"de-DE\"></ty-calendar>
<ty-calendar locale=\"ja-JP\"></ty-calendar>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Bounds — min / max")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "ISO dates in " [:code "min"] " / " [:code "max"] " disable everything outside the range: "
        "out-of-bounds days render dimmed, don't respond to clicks or Enter, and arrow-key "
        "navigation refuses to cross the boundary. Navigation clamps too — paging or jumping a "
        "year lands on the bound's month rather than sailing past it. Set the two cross-wise on a "
        "pair of calendars to build a period picker."]
       (demo-area
        [:div.flex.flex-wrap.items-start.justify-center.gap-6
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar {:value "2026-09-17" :min "2026-09-10" :max "2026-10-20"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "2026-09-10 → 2026-10-20"]]])
       (code-block "<ty-calendar value=\"2026-09-17\" min=\"2026-09-10\" max=\"2026-10-20\"></ty-calendar>

<!-- period picker: each end bounds the other -->
<ty-calendar id=\"from\" max=\"2026-10-20\"></ty-calendar>
<ty-calendar id=\"to\"   min=\"2026-09-10\"></ty-calendar>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Form participation")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "With a " [:code "name"] ", the calendar submits its ISO date like any native field, and "
        [:code "form.reset()"] " puts it back to the value the markup declared — pick a different "
        "day, then hit Reset."]
       (demo-area
        [:form.flex.flex-col.items-center.gap-3
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (let [data (js/FormData. (.-target e))]
                           (set! (.-textContent (.getElementById js/document "cal-form-out"))
                                 (str "submitted: " (.get data "when")))))}}
         [:ty-calendar {:name "when" :value "2026-09-10"}]
         [:div.flex.gap-2
          [:ty-button {:type "submit" :size "sm" :flavor "primary"} "Submit"]
          [:ty-button {:type "reset" :size "sm" :flavor "neutral"} "Reset"]]
         [:pre#cal-form-out.ty-text- {:style {:font-size "0.75rem" :margin 0}}]])
       (code-block "<form>
  <ty-calendar name=\"when\" value=\"2026-09-10\"></ty-calendar>
  <ty-button type=\"submit\">Submit</ty-button>
  <ty-button type=\"reset\">Reset</ty-button>
</form>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Without navigation")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Add " [:code "hide-navigation"] " — a bare presence attribute, like " [:code "disabled"]
        " — to drop the navigation bar, for when you drive the displayed month externally."]
       (demo-area
        [:div.flex.justify-center
         [:ty-calendar {:hide-navigation true}]])
       (code-block "<ty-calendar hide-navigation></ty-calendar>")]])

   (doc-section "Advanced Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Stateless / Controlled Mode")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "stateless"] " to take full control. The calendar emits " [:code "change"] " and " [:code "navigate"] " events but never updates its own attributes — your code does that."]
       (code-block "const cal = document.querySelector('ty-calendar');

cal.addEventListener('change', (e) => {
  const { year, month, day } = e.detail;
  selectedDate = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  // reflect state back onto the element
  cal.setAttribute('value', selectedDate);
});

cal.addEventListener('navigate', (e) => {
  const { year, month } = e.detail;
  cal.setAttribute('year', year);
  cal.setAttribute('month', month);
});" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Form Integration")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "name"] " to participate in form submission. The value is an ISO date string (YYYY-MM-DD)."]
       (demo-area
        [:form.space-y-4
         {:on {:submit (fn [e]
                         (.preventDefault e)
                         (let [data (js/FormData. (.-target e))
                               date (.get data "event-date")]
                           (js/alert (str "Selected: " date))))}}
         [:ty-calendar {:name "event-date" :value "2025-06-15"}]
         [:ty-button {:type "submit" :flavor "primary"} "Submit"]])
       (code-block "<form>
  <ty-calendar name=\"event-date\"></ty-calendar>
  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>
</form>
<!-- FormData: event-date=2025-06-15 -->")]])
))
