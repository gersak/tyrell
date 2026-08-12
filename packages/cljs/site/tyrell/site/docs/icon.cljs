(ns tyrell.site.docs.icon
  "Documentation for ty-icon component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-icon"
                     "SVG icon renderer with registry-based loading. Icons inherit the current text color automatically — color them with ty-text-* classes. Supports spin, pulse, and tempo animations.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
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

   (doc-section "Examples"
     [:div.space-y-6

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
         [:ty-icon.ty-text-primary {:name "info" :size "lg"}]
         [:ty-icon.ty-text-- {:name "circle" :size "lg"}]])
       (code-block "<ty-icon class=\"ty-text-primary\" name=\"check-circle\" size=\"lg\"></ty-icon>
<ty-icon class=\"ty-text-success\" name=\"check-circle\" size=\"lg\"></ty-icon>
<ty-icon class=\"ty-text-danger\" name=\"x-circle\" size=\"lg\"></ty-icon>
<ty-icon class=\"ty-text-warning\" name=\"alert-triangle\" size=\"lg\"></ty-icon>")]

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
<ty-icon name=\"circle\" pulse tempo=\"slow\"></ty-icon>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Inline SVG — no registry needed")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Slot a raw " [:code "<svg>"] " as a child and " [:code "ty-icon"] " renders it directly — the registry/name lookup is skipped. This is the pattern for server-driven UIs (HTMX, Datastar, JSF, Phoenix LiveView, Rails Turbo, etc.) — paste the SVG from your backend and you still get every size, color, and animation feature, with no " [:code "window.tyIcons.register()"] " call required."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-6
         [:ty-icon.ty-text-primary {:size "lg"}
          [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "none"
                 :stroke "currentColor" :stroke-width "2"
                 :stroke-linecap "round" :stroke-linejoin "round"}
           [:path {:d "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"}]]]
         [:ty-icon.ty-text-success {:size "lg"}
          [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "none"
                 :stroke "currentColor" :stroke-width "2"
                 :stroke-linecap "round" :stroke-linejoin "round"}
           [:polyline {:points "20 6 9 17 4 12"}]]]
         [:ty-icon.ty-text-warning {:size "lg" :spin "" :tempo "slow"}
          [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "none"
                 :stroke "currentColor" :stroke-width "2"
                 :stroke-linecap "round" :stroke-linejoin "round"}
           [:circle {:cx "12" :cy "12" :r "10"}]
           [:path {:d "M12 6v6l4 2"}]]]
         [:ty-icon.ty-text-danger {:size "lg" :pulse ""}
          [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "currentColor"}
           [:path {:d "M12 2 1 21h22L12 2zm0 6 7.5 13h-15L12 8zm-1 4v3h2v-3h-2zm0 4v2h2v-2h-2z"}]]]])
       (code-block "<!-- Anywhere on the server-rendered page — no JS, no registry -->
<ty-icon size=\"lg\" class=\"ty-text-primary\">
  <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"
       fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"
       stroke-linecap=\"round\" stroke-linejoin=\"round\">
    <path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
             a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
             1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/>
  </svg>
</ty-icon>

<!-- spin/pulse/tempo still work because they style the host element -->
<ty-icon size=\"lg\" spin tempo=\"slow\" class=\"ty-text-warning\">
  <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">
    <circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>
  </svg>
</ty-icon>")
       [:p.ty-text--.mt-3 {:style {:font-size "0.75rem" :line-height "1.6"}}
        [:strong "How it works:"] " the component's shadow root contains a single " [:code "<slot>"]
        " whose fallback content is driven by the registry. When light-DOM children are present, the browser shows them instead — same CSS classes (" [:code "icon-lg"] ", " [:code "icon-spin"]
        ", color via " [:code "currentColor"] ") apply to whichever wins. Set " [:code "fill"] " or " [:code "stroke"] " to " [:code "currentColor"] " on your SVG so " [:code "ty-text-*"] " classes still tint it."]]])
))
