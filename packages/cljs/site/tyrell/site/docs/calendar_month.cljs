(ns tyrell.site.docs.calendar-month
  "Documentation for ty-calendar-month component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-calendar-month"
                     "Stateless month grid — 42 cells, 6 weeks, Monday-first ordering, localized day headers. Used internally by ty-calendar; reach for it directly when you need a bare month grid with custom day rendering.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "displayMonth"
        :type "number"
        :default "current month"
        :description "Month to display (1–12)"}
       {:name "displayYear"
        :type "number"
        :default "current year"
        :description "Year to display"}
       {:name "value"
        :type "number"
        :default "-"
        :description "Selected date as a UTC timestamp (milliseconds) — highlights the matching day cell"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Grid size variant: sm, md, lg"}
       {:name "locale"
        :type "string"
        :default "\"en-US\""
        :description "Locale for day header labels (e.g. \"de-DE\")"}
       {:name "dayContentFn"
        :type "function"
        :default "-"
        :description "Custom day renderer — receives a DayContext and returns an HTMLElement or string. Set as a JS property, not attribute."}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "day-click"
        :payload "{year, month, dayInMonth, value, localValue, today, selected, inMonth}"
        :when-fired "Fires when a day cell is clicked"}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Renders a month grid for the given month/year. All state is external — the parent decides what month to show and which day is selected."]
       (demo-area
        [:div.flex.justify-center
         [:ty-calendar-month {:display-month "6" :display-year "2025"}]])
       (code-block "<ty-calendar-month display-month=\"6\" display-year=\"2025\">
</ty-calendar-month>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       (demo-area
        [:div.flex.flex-wrap.items-start.gap-6
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar-month {:display-month "6" :display-year "2025" :size "sm"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "sm"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar-month {:display-month "6" :display-year "2025" :size "md"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "md"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-calendar-month {:display-month "6" :display-year "2025" :size "lg"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "lg"]]])
       (code-block "<ty-calendar-month size=\"sm\" display-month=\"6\" display-year=\"2025\">
</ty-calendar-month>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Handling Day Clicks")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Listen for " [:code "day-click"] " events to respond to user selection. The event detail contains a " [:code "DayContext"] " with year, month, day, and timestamps."]
       (code-block "const grid = document.querySelector('ty-calendar-month');

grid.addEventListener('day-click', (e) => {
  const { year, month, dayInMonth, value, today, inMonth } = e.detail;
  console.log(`Clicked: ${year}-${month}-${dayInMonth}`);

  // Reflect selection back
  grid.value = value;
});" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Custom Day Content")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "dayContentFn"] " as a JS property (not attribute) to render custom content inside each day cell — badges, dots, or event previews."]
       (code-block "const grid = document.querySelector('ty-calendar-month');

// dayContentFn receives DayContext, must return HTMLElement or string
grid.dayContentFn = (ctx) => {
  const el = document.createElement('div');
  el.textContent = ctx.dayInMonth;

  if (eventDates.has(ctx.value)) {
    const dot = document.createElement('div');
    dot.className = 'ty-bg-primary';
    dot.style.cssText = 'width:4px;height:4px;border-radius:50%;margin:0 auto';
    el.appendChild(dot);
  }

  return el;
};" "javascript")]])
))
