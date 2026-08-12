(ns tyrell.site.docs.tooltip
  "Documentation for ty-tooltip component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-tooltip"
                     "Hover/focus-triggered tooltip using the Popover API with smart positioning, configurable delay, and flavor variants. Content is any HTML nested inside the ty-tooltip element.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div
     (section-label "Attributes")
     (attribute-table
      [{:name "placement"
        :type "string"
        :default "\"top\""
        :description "Side plus optional cross-axis alignment: top, right, bottom, left — each also as -start / -end (e.g. top-start, right-end). Bare side = centered on the anchor; -start aligns leading edges, -end aligns trailing edges. Auto-flips if it would overflow, keeping the alignment."}
       {:name "flavor"
        :type "string"
        :default "\"dark\""
        :description "Visual style: dark, light, primary, success, danger, warning, info, neutral"}
       {:name "delay"
        :type "number"
        :default "600"
        :description "Milliseconds before the tooltip appears on hover"}
       {:name "offset"
        :type "number"
        :default "8"
        :description "Distance in pixels between the tooltip and its anchor element"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Prevent the tooltip from showing"}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Nest " [:code "ty-tooltip"] " inside any element. It shows on hover or keyboard focus and hides when focus leaves."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-4
         [:ty-button "Hover me"
          [:ty-tooltip "This is a helpful tooltip"]]
         [:ty-button {:flavor "primary"} "Save document"
          [:ty-tooltip "Click to save your changes (Ctrl+S)"]]
         [:ty-button {:flavor "danger"} "Delete"
          [:ty-tooltip {:flavor "danger"} "This action cannot be undone"]]])
       (code-block "<ty-button>
  Hover me
  <ty-tooltip>This is a helpful tooltip</ty-tooltip>
</ty-button>

<ty-button flavor=\"primary\">
  Save document
  <ty-tooltip>Click to save your changes (Ctrl+S)</ty-tooltip>
</ty-button>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Placement")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Four positions available. The tooltip auto-flips if it would overflow the viewport."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-4
         [:ty-button "Top"
          [:ty-tooltip {:placement "top"} "Tooltip on top"]]
         [:ty-button "Bottom"
          [:ty-tooltip {:placement "bottom"} "Tooltip on bottom"]]
         [:ty-button "Left"
          [:ty-tooltip {:placement "left"} "Tooltip on left"]]
         [:ty-button "Right"
          [:ty-tooltip {:placement "right"} "Tooltip on right"]]])
       (code-block "<ty-tooltip placement=\"top\">Tooltip on top</ty-tooltip>
<ty-tooltip placement=\"bottom\">Tooltip on bottom</ty-tooltip>
<ty-tooltip placement=\"left\">Tooltip on left</ty-tooltip>
<ty-tooltip placement=\"right\">Tooltip on right</ty-tooltip>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Flavors")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Match the tooltip flavor to its host element's intent. " [:code "dark"] " and " [:code "light"] " are neutral carriers; semantic flavors reinforce meaning."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-3
         [:ty-button "Dark"
          [:ty-tooltip {:flavor "dark"} "Default dark tooltip"]]
         [:ty-button "Light"
          [:ty-tooltip {:flavor "light"} "Light tooltip"]]
         [:ty-button {:flavor "primary"} "Primary"
          [:ty-tooltip {:flavor "primary"} "Primary action"]]
         [:ty-button {:flavor "success"} "Success"
          [:ty-tooltip {:flavor "success"} "Operation successful"]]
         [:ty-button {:flavor "danger"} "Danger"
          [:ty-tooltip {:flavor "danger"} "Destructive — cannot be undone"]]
         [:ty-button {:flavor "warning"} "Warning"
          [:ty-tooltip {:flavor "warning"} "Proceed with caution"]]
         [:ty-button {:flavor "neutral"} "Info"
          [:ty-tooltip {:flavor "info"} "Additional information"]]])
       (code-block "<ty-button flavor=\"success\">
  Confirm
  <ty-tooltip flavor=\"success\">Operation will be saved</ty-tooltip>
</ty-button>

<ty-button flavor=\"danger\">
  Delete
  <ty-tooltip flavor=\"danger\">Destructive — cannot be undone</ty-tooltip>
</ty-button>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Icon Buttons")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Essential for icon-only buttons — the tooltip provides the visible label that screen readers and sighted users both rely on."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-3
         [:ty-button {:flavor "primary" :action ""}
          [:ty-icon {:name "save" :size "16"}]
          [:ty-tooltip "Save document"]]
         [:ty-button {:flavor "danger" :action ""}
          [:ty-icon {:name "trash" :size "16"}]
          [:ty-tooltip {:flavor "danger"} "Delete item"]]
         [:ty-button {:action ""}
          [:ty-icon {:name "settings" :size "16"}]
          [:ty-tooltip "Open settings"]]
         [:ty-button {:action ""}
          [:ty-icon {:name "share-2" :size "16"}]
          [:ty-tooltip "Share this page"]]])
       (code-block "<ty-button flavor=\"primary\" action>
  <ty-icon name=\"save\" size=\"16\"></ty-icon>
  <ty-tooltip>Save document</ty-tooltip>
</ty-button>

<ty-button flavor=\"danger\" action>
  <ty-icon name=\"trash\" size=\"16\"></ty-icon>
  <ty-tooltip flavor=\"danger\">Delete item</ty-tooltip>
</ty-button>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Delay")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Default is 600 ms — long enough to avoid flickering during normal mouse movement. Set to " [:code "0"] " for immediate feedback on deliberate targets."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-4
         [:ty-button "Instant"
          [:ty-tooltip {:delay "0"} "Shows immediately"]]
         [:ty-button "Default (600ms)"
          [:ty-tooltip "Default delay"]]
         [:ty-button "Slow (1200ms)"
          [:ty-tooltip {:delay "1200"} "1.2s delay"]]])
       (code-block "<ty-tooltip delay=\"0\">Shows immediately</ty-tooltip>
<ty-tooltip>Default 600ms delay</ty-tooltip>
<ty-tooltip delay=\"1200\">1.2s delay</ty-tooltip>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Rich Content")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Tooltip content can be any HTML — use sparingly. Complex tooltips increase cognitive load."]
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-4
         [:ty-button {:flavor "primary"} "Save"
          [:ty-tooltip
           [:div {:style {:min-width "120px"}}
            [:div {:style {:font-weight "600" :margin-bottom "2px"}} "Save Document"]
            [:div.ty-text-- {:style {:font-size "0.75rem"}} "Ctrl+S / Cmd+S"]]]]
         [:ty-button {:flavor "danger"} "Delete"
          [:ty-tooltip {:flavor "danger"}
           [:div {:style {:min-width "140px"}}
            [:div {:style {:font-weight "600" :margin-bottom "2px"}} "Permanent Deletion"]
            [:div {:style {:font-size "0.75rem"}} "This cannot be undone"]]]]])
       (code-block "<ty-button flavor=\"primary\">
  Save
  <ty-tooltip>
    <div style=\"min-width: 120px\">
      <div style=\"font-weight: 600; margin-bottom: 2px\">Save Document</div>
      <div class=\"ty-text--\" style=\"font-size: 0.75rem\">Ctrl+S / Cmd+S</div>
    </div>
  </ty-tooltip>
</ty-button>")]])
))
