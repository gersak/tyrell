(ns tyrell.site.docs.icon
  "Documentation for ty-icon component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-icon"
                     "SVG icon renderer with registry-based loading. Icons inherit the current text color automatically — color them with ty-text-* classes. Supports spin, pulse, and tempo animations.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div
     (section-label "Attributes")
     (attribute-table
      [{:name "name"
        :type "string"
        :required true
        :default "-"
        :description "Icon name from the registry (e.g. \"check\", \"plus\", \"trash\")"}
       {:name "size"
        :type "string"
        :default "-"
        :description "Icon size: xs (12px), sm (16px), md (20px), lg (24px), xl (32px)"}
       {:name "spin"
        :type "boolean"
        :default "false"
        :description "Continuous rotation animation — useful for loaders"}
       {:name "pulse"
        :type "boolean"
        :default "false"
        :description "Fade pulse animation — useful for status indicators"}
       {:name "tempo"
        :type "string"
        :default "\"normal\""
        :description "Animation speed: slow, normal, fast"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Icons inherit the surrounding text color by default. Apply " [:code "ty-text-*"] " classes directly on the element to color them."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-6
         (for [icon-name ["check" "plus" "trash" "settings" "search" "bell"]]
           [:div.flex.items-center.gap-2
            [:ty-icon {:name icon-name :size "md"}]
            [:span.ty-text-- {:style {:font-size "0.8125rem"}} icon-name]])])
       (code-block "<ty-icon name=\"check\"></ty-icon>
<ty-icon name=\"plus\" size=\"md\"></ty-icon>
<ty-icon name=\"trash\" size=\"lg\"></ty-icon>")]

      ;; Sizes
      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       (demo-area
        [:div.flex.flex-wrap.items-end.gap-6
         (for [[size px] [["xs" "12px"] ["sm" "16px"] ["md" "20px"] ["lg" "24px"] ["xl" "32px"]]]
           [:div.flex.flex-col.items-center.gap-2
            [:ty-icon {:name "star" :size size}]
            [:span.ty-text-- {:style {:font-size "0.6875rem"}} (str size " · " px)]])])
       (code-block "<ty-icon name=\"star\" size=\"xs\"></ty-icon>
<ty-icon name=\"star\" size=\"sm\"></ty-icon>
<ty-icon name=\"star\" size=\"md\"></ty-icon>
<ty-icon name=\"star\" size=\"lg\"></ty-icon>
<ty-icon name=\"star\" size=\"xl\"></ty-icon>")]

      ;; Semantic Colors
      [:div.ty-content.rounded-lg.p-5
       (section-label "Semantic Colors")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Apply any " [:code "ty-text-*"] " class to color an icon. Icons also work inline with text and automatically match the surrounding color context."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-5
         [:ty-icon.ty-text-primary {:name "check-circle" :size "lg"}]
         [:ty-icon.ty-text-success {:name "check-circle" :size "lg"}]
         [:ty-icon.ty-text-danger {:name "x-circle" :size "lg"}]
         [:ty-icon.ty-text-warning {:name "alert-triangle" :size "lg"}]
         [:ty-icon.ty-text-secondary {:name "info" :size "lg"}]
         [:ty-icon.ty-text-- {:name "circle" :size "lg"}]])
       (code-block "<ty-icon class=\"ty-text-primary\" name=\"check-circle\" size=\"lg\"></ty-icon>
<ty-icon class=\"ty-text-success\" name=\"check-circle\" size=\"lg\"></ty-icon>
<ty-icon class=\"ty-text-danger\" name=\"x-circle\" size=\"lg\"></ty-icon>
<ty-icon class=\"ty-text-warning\" name=\"alert-triangle\" size=\"lg\"></ty-icon>")]

      ;; Inline with text
      [:div.ty-content.rounded-lg.p-5
       (section-label "Inline with Text")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Icons sit on the text baseline. Use " [:code "gap"] " on the container for spacing — not margins on the icon."]
       (demo-area
        [:div.flex.flex-col.gap-3
         [:div.flex.items-center.gap-2.ty-text-success
          [:ty-icon {:name "check-circle" :size "16"}]
          [:span {:style {:font-size "0.875rem" :font-weight "500"}} "Payment confirmed"]]
         [:div.flex.items-center.gap-2.ty-text-danger
          [:ty-icon {:name "x-circle" :size "16"}]
          [:span {:style {:font-size "0.875rem" :font-weight "500"}} "Authentication failed"]]
         [:div.flex.items-center.gap-2.ty-text-warning
          [:ty-icon {:name "alert-triangle" :size "16"}]
          [:span {:style {:font-size "0.875rem" :font-weight "500"}} "Storage almost full"]]])
       (code-block "<div class=\"flex items-center gap-2 ty-text-success\">
  <ty-icon name=\"check-circle\" size=\"16\"></ty-icon>
  <span>Payment confirmed</span>
</div>")]

      ;; Animations
      [:div.ty-content.rounded-lg.p-5
       (section-label "Animations")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use " [:code "spin"] " for loaders and " [:code "pulse"] " for status indicators. Control speed with " [:code "tempo"] "."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-8
         [:div.flex.flex-col.items-center.gap-2
          [:ty-icon.ty-text-primary {:name "loader" :size "lg" :spin ""}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "spin"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-icon.ty-text-primary {:name "loader" :size "lg" :spin "" :tempo "slow"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "spin slow"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-icon.ty-text-primary {:name "loader" :size "lg" :spin "" :tempo "fast"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "spin fast"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-icon.ty-text-success {:name "circle" :size "lg" :pulse ""}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "pulse"]]
         [:div.flex.flex-col.items-center.gap-2
          [:ty-icon.ty-text-danger {:name "circle" :size "lg" :pulse "" :tempo "slow"}]
          [:span.ty-text-- {:style {:font-size "0.75rem"}} "pulse slow"]]])
       (code-block "<ty-icon name=\"loader\" spin></ty-icon>
<ty-icon name=\"loader\" spin tempo=\"slow\"></ty-icon>
<ty-icon name=\"loader\" spin tempo=\"fast\"></ty-icon>

<ty-icon name=\"circle\" pulse></ty-icon>
<ty-icon name=\"circle\" pulse tempo=\"slow\"></ty-icon>")]])

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
         (for [text ["Color with ty-text-* classes, not fill or stroke CSS properties"
                     "Use gap on the parent container for spacing, not margins on the icon"
                     "Pair icons with visible labels — icons alone are often ambiguous"
                     "Use spin for loading states and pulse for live status indicators"
                     "Match icon size to adjacent text (size ≈ font-size)"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Add margin to the icon itself — use gap on the container instead"
                     "Override fill or stroke directly — ty-text-* handles color correctly"
                     "Use icons without accessible text in interactive elements (buttons, links)"
                     "Combine spin and pulse on the same icon — pick one"
                     "Use pixel values for size when named variants (xs–xl) exist"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
