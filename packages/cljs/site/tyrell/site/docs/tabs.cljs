(ns tyrell.site.docs.tabs
  "Documentation for ty-tabs and ty-tab components"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-tabs"
                     "Carousel-based tab container with smooth slide animations and an animated active marker. Uses ty-tab children for panels — tab buttons are generated automatically from each tab's label.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "ty-tabs Attributes")
     (attribute-table
      [{:name "width"
        :type "string"
        :required true
        :default "-"
        :description "Content area width — required for carousel layout (e.g. \"100%\", \"480px\")"}
       {:name "height"
        :type "string"
        :required true
        :default "-"
        :description "Total container height including tab buttons — required (e.g. \"300px\")"}
       {:name "active"
        :type "string"
        :default "first tab id"
        :description "ID of the currently active tab — defaults to the first ty-tab child"}
       {:name "placement"
        :type "string"
        :default "\"top\""
        :description "Tab button bar position: top or bottom"}])]

    [:div.mb-6
     (section-label "ty-tab Attributes")
     (attribute-table
      [{:name "id"
        :type "string"
        :required true
        :default "-"
        :description "Unique identifier — used to reference this tab from the active attribute"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Text shown in the tab button"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Prevent this tab from being activated"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "ty-tab-change"
        :payload "{activeId, activeIndex, previousId, previousIndex}"
        :when-fired "Fires when the active tab changes (at animation start)"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Both " [:code "width"] " and " [:code "height"] " are required — they define the carousel viewport. Tab buttons are generated from each " [:code "ty-tab"] " label."]
       (demo-area
        [:ty-tabs {:width "100%" :height "200px"}
         [:ty-tab {:id "overview" :label "Overview"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Overview tab content goes here."]]]
         [:ty-tab {:id "details" :label "Details"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Details tab content goes here."]]]
         [:ty-tab {:id "history" :label "History"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "History tab content goes here."]]]])
       (code-block "<ty-tabs width=\"100%\" height=\"200px\">
  <ty-tab id=\"overview\" label=\"Overview\">
    Overview content
  </ty-tab>
  <ty-tab id=\"details\" label=\"Details\">
    Details content
  </ty-tab>
  <ty-tab id=\"history\" label=\"History\">
    History content
  </ty-tab>
</ty-tabs>")]

      ;; Bottom placement
      [:div.ty-content.rounded-lg.p-5
       (section-label "Bottom Placement")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "placement=\"bottom\""] " to move the tab bar below the content — common in mobile layouts."]
       (demo-area
        [:ty-tabs {:width "100%" :height "200px" :placement "bottom"}
         [:ty-tab {:id "tab-a" :label "Photos"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Photos panel content."]]]
         [:ty-tab {:id "tab-b" :label "Videos"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Videos panel content."]]]
         [:ty-tab {:id "tab-c" :label "Files"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Files panel content."]]]])
       (code-block "<ty-tabs width=\"100%\" height=\"200px\" placement=\"bottom\">
  <ty-tab id=\"photos\" label=\"Photos\">...</ty-tab>
  <ty-tab id=\"videos\" label=\"Videos\">...</ty-tab>
</ty-tabs>")]

      ;; Disabled tab
      [:div.ty-content.rounded-lg.p-5
       (section-label "Disabled Tab")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "disabled"] " on a " [:code "ty-tab"] " to prevent it from being activated. The tab button renders visually muted and is not keyboard-reachable."]
       (demo-area
        [:ty-tabs {:width "100%" :height "180px"}
         [:ty-tab {:id "active-tab" :label "Active"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "This tab is active."]]]
         [:ty-tab {:id "locked-tab" :label "Locked" :disabled ""}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "This content is locked."]]]
         [:ty-tab {:id "another-tab" :label "Another"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Another tab content."]]]])
       (code-block "<ty-tab id=\"locked\" label=\"Locked\" disabled>
  ...
</ty-tab>")]

      ;; Controlled active tab
      [:div.ty-content.rounded-lg.p-5
       (section-label "Controlled Active Tab")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "active"] " to control which tab is open from outside — useful in reactive frameworks managing routing or state."]
       (code-block "<ty-tabs width=\"100%\" height=\"300px\" active=\"details\">
  <ty-tab id=\"overview\" label=\"Overview\">...</ty-tab>
  <ty-tab id=\"details\" label=\"Details\">...</ty-tab>
</ty-tabs>

;; ClojureScript / Replicant
[:ty-tabs {:width \"100%\" :height \"300px\" :active @active-tab}
 [:ty-tab {:id \"overview\" :label \"Overview\"} ...]
 [:ty-tab {:id \"details\" :label \"Details\"} ...]]")]])

   ;; Advanced Examples
   (doc-section "Advanced Examples"
     [:div.space-y-6

      ;; JavaScript API
      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const tabs = document.querySelector('ty-tabs');

// Listen for tab changes
tabs.addEventListener('ty-tab-change', (e) => {
  const { activeId, activeIndex, previousId, previousIndex } = e.detail;
  console.log('switched to:', activeId, 'at index', activeIndex);
});

// Read active tab
console.log(tabs.active);  // current active tab id

// Switch programmatically — set the active attribute
tabs.setAttribute('active', 'details');" "javascript")]

      ;; Rich tab labels
      [:div.ty-content.rounded-lg.p-5
       (section-label "Rich Tab Labels")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use the " [:code "label-{id}"] " slot inside " [:code "ty-tabs"] " to provide rich tab button content — icons, badges, custom formatting."]
       (code-block "<ty-tabs width=\"100%\" height=\"300px\">
  <!-- Rich label via named slot -->
  <div slot=\"label-overview\">
    <ty-icon name=\"layout\" size=\"14\"></ty-icon>
    Overview
  </div>
  <div slot=\"label-settings\">
    <ty-icon name=\"settings\" size=\"14\"></ty-icon>
    Settings
    <span class=\"ty-bg-primary ty-text++ rounded-full\"
          style=\"padding: 0 6px; font-size: 0.6875rem\">3</span>
  </div>

  <ty-tab id=\"overview\" label=\"Overview\">...</ty-tab>
  <ty-tab id=\"settings\" label=\"Settings\">...</ty-tab>
</ty-tabs>")]])

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
         (for [text ["Keep to 3–6 tabs — more than 7 causes overflow and poor usability"
                     "Give every ty-tab a unique, stable id — it drives the active attribute"
                     "Set width and height explicitly — the carousel layout requires them"
                     "Use bottom placement for mobile-style navigation patterns"
                     "Use ty-tab-change events for URL sync or reactive state updates"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Omit width or height — the carousel won't render correctly without them"
                     "Use tabs for sequential steps — ty-wizard is the right primitive"
                     "Put deeply nested navigation inside a tab — use a sidebar instead"
                     "Disable a tab without explaining why — add a tooltip or inline message"
                     "Use tabs when there are only two options — a toggle or switch is cleaner"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
