(ns tyrell.site.docs.calendar
  "Documentation for ty-calendar component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-calendar"
                     "Complete date picker combining navigation and a month grid with date selection, form integration, and ISO date API. Can be stateless for full external control.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
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
       {:name "show-navigation"
        :type "boolean"
        :default "true"
        :description "Show or hide the month/year navigation bar"}
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

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
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

      ;; Sizes
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

      ;; Locale
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

      ;; Without navigation
      [:div.ty-content.rounded-lg.p-5
       (section-label "Without Navigation")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "show-navigation=\"false\""] " to hide the navigation bar — useful when you control the displayed month externally."]
       (demo-area
        [:div.flex.justify-center
         [:ty-calendar {:show-navigation "false"}]])
       (code-block "<ty-calendar show-navigation=\"false\"></ty-calendar>")]])

   ;; Advanced Examples
   (doc-section "Advanced Examples"
     [:div.space-y-6

      ;; Stateless / controlled
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

      ;; Form integration
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
         [:button.ty-bg-primary.ty-text++.rounded
          {:type "submit" :style {:padding "0.375rem 1rem"}} "Submit"]])
       (code-block "<form>
  <ty-calendar name=\"event-date\"></ty-calendar>
  <button type=\"submit\">Submit</button>
</form>
<!-- FormData: event-date=2025-06-15 -->")]])

   ;; Best Practices
   (doc-section "Best Practices"
     [:div.ty-elevated.rounded-lg.p-5
      [:div.grid.gap-6
       {:style {:grid-template-columns "repeat(auto-fill, minmax(260px, 1fr))"}}

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-success {:name "check-circle" :size "16"}]
         [:span.ty-text-success+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Do"]]
        [:div.space-y-2
         (for [text ["Use value with ISO format (YYYY-MM-DD) — it's the canonical API"
                     "Set locale to match your users' region for natural date labels"
                     "Use stateless mode when managing date state in a framework"
                     "Set name when submitting inside a form — the value lands in FormData"
                     "Use ty-date-picker for inline input + calendar popup in forms"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Mix value and year/month/day — use one model or the other"
                     "Reach for ty-calendar when ty-date-picker would serve — it includes an input"
                     "Forget to reflect navigation events back onto the element in stateless mode"
                     "Use width and size together — they're mutually exclusive"
                     "Skip the name attribute when inside a form — the date won't submit"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
