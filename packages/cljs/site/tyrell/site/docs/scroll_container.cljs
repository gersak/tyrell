(ns tyrell.site.docs.scroll-container
  "Documentation for ty-scroll-container component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-scroll-container"
                     "Scroll wrapper with edge shadow indicators, optional custom scrollbar overlay, and horizontal overflow control. Drop any content inside — the container manages scroll behavior.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "max-height"
        :type "string"
        :default "-"
        :description "Maximum height of the scrollable area — required to enable vertical scrolling (e.g. \"300px\", \"50vh\")"}
       {:name "shadow"
        :type "string"
        :default "\"true\""
        :description "Show edge shadow indicators when content overflows — set to \"false\" to disable"}
       {:name "custom-scrollbar"
        :type "boolean"
        :default "false"
        :description "Replace the native scrollbar with a custom styled overlay scrollbar"}
       {:name "hide-scrollbar"
        :type "boolean"
        :default "false"
        :description "Hide the native scrollbar without replacing it — content still scrolls"}
       {:name "overflow-x"
        :type "boolean"
        :default "false"
        :description "Enable horizontal scrolling — also adds a horizontal custom scrollbar when custom-scrollbar is set"}])]

    [:div
     (section-label "CSS Custom Properties")
     (attribute-table
      [{:name "--ty-scrollbar-width"
        :type "length"
        :default "8px"
        :description "Custom scrollbar track width"}
       {:name "--ty-scrollbar-radius"
        :type "length"
        :default "4px"
        :description "Thumb and track border radius"}
       {:name "--ty-scrollbar-thumb"
        :type "color"
        :default "var(--ty-border)"
        :description "Thumb color at rest"}
       {:name "--ty-scrollbar-thumb-hover"
        :type "color"
        :default "var(--ty-border-strong)"
        :description "Thumb color on hover"}
       {:name "--ty-scrollbar-track"
        :type "color"
        :default "transparent"
        :description "Track background"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "max-height"] " to constrain the area and enable scrolling. Edge shadows appear automatically when content overflows."]
       (demo-area
        [:ty-scroll-container {:max-height "200px"}
         [:div.space-y-2.p-2
          (for [i (range 1 13)]
            [:div.ty-elevated.rounded.p-3 {:key i}
             [:p.ty-text {:style {:font-size "0.875rem"}} (str "List item " i)]])]])
       (code-block "<ty-scroll-container max-height=\"200px\">
  <!-- your content -->
</ty-scroll-container>")]

      ;; Custom scrollbar
      [:div.ty-content.rounded-lg.p-5
       (section-label "Custom Scrollbar")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "custom-scrollbar"] " to replace the native scrollbar with a styled overlay scrollbar that matches the design system."]
       (demo-area
        [:ty-scroll-container {:max-height "200px" :custom-scrollbar ""}
         [:div.space-y-2.p-2
          (for [i (range 1 13)]
            [:div.ty-elevated.rounded.p-3 {:key i}
             [:p.ty-text {:style {:font-size "0.875rem"}} (str "Item " i " — custom scrollbar")]])]])
       (code-block "<ty-scroll-container max-height=\"200px\" custom-scrollbar>
  <!-- your content -->
</ty-scroll-container>")]

      ;; No shadows
      [:div.ty-content.rounded-lg.p-5
       (section-label "Without Shadows")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "shadow=\"false\""] " to disable the edge shadow indicators when they interfere with your layout."]
       (demo-area
        [:ty-scroll-container {:max-height "200px" :shadow "false" :custom-scrollbar ""}
         [:div.space-y-2.p-2
          (for [i (range 1 13)]
            [:div.ty-elevated.rounded.p-3 {:key i}
             [:p.ty-text {:style {:font-size "0.875rem"}} (str "No shadow — item " i)]])]])
       (code-block "<ty-scroll-container max-height=\"200px\" shadow=\"false\">
  <!-- your content -->
</ty-scroll-container>")]

      ;; Horizontal scroll
      [:div.ty-content.rounded-lg.p-5
       (section-label "Horizontal Scroll")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "overflow-x"] " to allow horizontal scrolling — useful for wide tables or code blocks."]
       (demo-area
        [:ty-scroll-container {:overflow-x "" :custom-scrollbar ""}
         [:div.flex.gap-3 {:style {:width "max-content"}}
          (for [i (range 1 9)]
            [:div.ty-elevated.rounded.p-4 {:key i :style {:min-width "120px"}}
             [:p.ty-text {:style {:font-size "0.875rem"}} (str "Card " i)]])]])
       (code-block "<ty-scroll-container overflow-x custom-scrollbar>
  <div style=\"width: max-content\">
    <!-- wide content -->
  </div>
</ty-scroll-container>")]])

   ;; Advanced Examples
   (doc-section "Advanced Examples"
     [:div.space-y-6

      ;; Custom scrollbar styling
      [:div.ty-content.rounded-lg.p-5
       (section-label "Custom Scrollbar Styling")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Override the CSS custom properties to match your brand or surface context."]
       (code-block "<ty-scroll-container max-height=\"300px\" custom-scrollbar
    style=\"--ty-scrollbar-width: 4px;
           --ty-scrollbar-thumb: var(--ty-color-primary);
           --ty-scrollbar-radius: 2px\">
  <!-- your content -->
</ty-scroll-container>")]

      ;; Code block wrapper
      [:div.ty-content.rounded-lg.p-5
       (section-label "Code Block Wrapper")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Wrap pre/code blocks to control overflow without clipping shadows or breaking layout."]
       (code-block "<ty-scroll-container overflow-x hide-scrollbar>
  <pre><code>...long code line...</code></pre>
</ty-scroll-container>")]])

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
         (for [text ["Set max-height to trigger scrolling — without it the container grows freely"
                     "Use custom-scrollbar for design-system-consistent scroll thumb styling"
                     "Use hide-scrollbar for touch-first surfaces where scroll bars clutter"
                     "Combine overflow-x with a width: max-content inner wrapper for horizontal lists"
                     "Keep shadow=\"true\" (default) — it gives strong overflow affordance"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Nest scroll containers — inner containers suppress the outer shadow"
                     "Use hide-scrollbar on desktop without an alternative scroll indicator"
                     "Apply max-height and overflow: hidden on the inner content — let the container handle it"
                     "Forget width: max-content on inner content when using overflow-x"
                     "Use for infinite scroll without virtualization — render only what's visible"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
