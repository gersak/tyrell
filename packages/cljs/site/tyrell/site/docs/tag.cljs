(ns tyrell.site.docs.tag
  "Documentation for the ty-tag component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table slot-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-tag"
                     "Versatile tag component for labels, badges, and removable chips. Supports semantic flavors, multiple sizes, and interactive click/dismiss events.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "flavor"
        :type "string"
        :default "\"neutral\""
        :description "Semantic color theme: primary, secondary, success, danger, warning, neutral"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Tag size: xs, sm, md, lg, xl"}
       {:name "pill"
        :type "boolean"
        :default "true"
        :description "Use pill shape (fully rounded) instead of rectangular with rounded corners"}
       {:name "clickable"
        :type "boolean"
        :default "false"
        :description "Makes the tag clickable with hover/active states"}
       {:name "dismissible"
        :type "boolean"
        :default "false"
        :description "Shows a dismiss button (×) that triggers the dismiss event"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disables all interactions"}
       {:name "value"
        :type "string"
        :default "null"
        :description "Value for the tag — used in multiselect contexts"}
       {:name "selected"
        :type "boolean"
        :default "false"
        :description "Selected state, primarily for multiselect integration"}])]

    [:div.mb-6
     (section-label "Events")
     (event-table
      [{:name "pointerdown"
        :payload "{target: HTMLElement}"
        :when-fired "When a clickable tag is pressed"}
       {:name "click"
        :payload "{target: HTMLElement}"
        :when-fired "When a clickable tag is clicked"}
       {:name "dismiss"
        :payload "{target: HTMLElement}"
        :when-fired "When the dismiss (×) button is clicked"}])]

    [:div
     (section-label "Slots")
     (slot-table
      [{:name "default"
        :description "Main tag content"}
       {:name "start"
        :description "Content before the main text — icons, emojis"}
       {:name "end"
        :description "Content after the main text — badges, counts"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Semantic Flavors
      [:div.ty-content.rounded-lg.p-5
       (section-label "Semantic Flavors")
       (demo-area
        [:div.flex.flex-wrap.gap-3
         [:ty-tag {:flavor "primary"} "Primary"]
         [:ty-tag {:flavor "secondary"} "Secondary"]
         [:ty-tag {:flavor "success"} "Success"]
         [:ty-tag {:flavor "danger"} "Danger"]
         [:ty-tag {:flavor "warning"} "Warning"]
         [:ty-tag {:flavor "neutral"} "Neutral"]])
       (code-block "<ty-tag flavor=\"primary\">Primary</ty-tag>
<ty-tag flavor=\"secondary\">Secondary</ty-tag>
<ty-tag flavor=\"success\">Success</ty-tag>
<ty-tag flavor=\"danger\">Danger</ty-tag>
<ty-tag flavor=\"warning\">Warning</ty-tag>
<ty-tag flavor=\"neutral\">Neutral</ty-tag>")]

      ;; Complete Matrix
      [:div.ty-content.rounded-lg.p-5
       (section-label "Complete Matrix")
       [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem"
                                  :line-height "1.6"}}
        "Every flavor × tone combination. Six flavors — "
        [:code.font-mono "primary"] ", " [:code.font-mono "secondary"] ", "
        [:code.font-mono "success"] ", " [:code.font-mono "danger"] ", "
        [:code.font-mono "warning"] ", " [:code.font-mono "neutral"]
        " — each with three tones via the flavor suffix: "
        [:code.font-mono "-"] " (soft), base, "
        [:code.font-mono "+"] " (strong). Useful for inspecting contrast in light vs dark mode."]
       [:div.grid.gap-3.items-center
        {:style {:grid-template-columns "6rem repeat(3, max-content)"}}
        [:div]
        [:div.text-xs.ty-text-.font-medium "Soft (–)"]
        [:div.text-xs.ty-text-.font-medium "Base"]
        [:div.text-xs.ty-text-.font-medium "Strong (+)"]
        (for [flavor ["primary" "secondary" "success" "danger" "warning" "neutral"]]
          (list
           [:div.text-sm.font-mono.ty-text {:key (str "tag-" flavor "-label")} flavor]
           [:ty-tag {:key (str "tag-" flavor "-soft") :flavor (str flavor "-")} flavor]
           [:ty-tag {:key (str "tag-" flavor "-base") :flavor flavor} flavor]
           [:ty-tag {:key (str "tag-" flavor "-strong") :flavor (str flavor "+")} flavor]))]
       (code-block "<!-- Base flavor -->
<ty-tag flavor=\"primary\">Primary</ty-tag>

<!-- Tone modifiers -->
<ty-tag flavor=\"primary-\">Softer</ty-tag>
<ty-tag flavor=\"primary+\">Stronger</ty-tag>")]

      ;; Sizes
      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       (demo-area
        [:div.flex.flex-wrap.items-center.gap-3
         [:ty-tag {:size "xs" :flavor "primary"} "Extra Small"]
         [:ty-tag {:size "sm" :flavor "primary"} "Small"]
         [:ty-tag {:size "md" :flavor "primary"} "Medium"]
         [:ty-tag {:size "lg" :flavor "primary"} "Large"]
         [:ty-tag {:size "xl" :flavor "primary"} "Extra Large"]])
       (code-block "<ty-tag size=\"xs\" flavor=\"primary\">Extra Small</ty-tag>
<ty-tag size=\"sm\" flavor=\"primary\">Small</ty-tag>
<ty-tag size=\"md\" flavor=\"primary\">Medium</ty-tag>
<ty-tag size=\"lg\" flavor=\"primary\">Large</ty-tag>
<ty-tag size=\"xl\" flavor=\"primary\">Extra Large</ty-tag>")]

      ;; Shape Variants
      [:div.ty-content.rounded-lg.p-5
       (section-label "Shape Variants")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Tags default to pill shape but can be rectangular."]
       (demo-area
        [:div.flex.flex-wrap.gap-3
         [:ty-tag {:flavor "primary"} "Pill (default)"]
         [:ty-tag {:flavor "primary" :pill "false"} "Rectangular"]
         [:ty-tag {:flavor "success" :not-pill "true"} "Also Rectangular"]])
       (code-block "<!-- Pill shape (default) -->
<ty-tag flavor=\"primary\">Pill (default)</ty-tag>

<!-- Rectangular shape -->
<ty-tag flavor=\"primary\" pill=\"false\">Rectangular</ty-tag>
<ty-tag flavor=\"success\" not-pill=\"true\">Also Rectangular</ty-tag>")]

      ;; Interactive Tags
      [:div.ty-content.rounded-lg.p-5
       (section-label "Interactive Tags")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Tags can be clickable, dismissible, or both."]
       (demo-area
        [:div.flex.flex-wrap.gap-3
         [:ty-tag {:flavor "primary"
                   :clickable "true"
                   :on {:pointerdown #(js/alert "Tag clicked")}}
          "Click me"]
         [:ty-tag {:flavor "danger"
                   :dismissible "true"
                   :on {:dismiss (fn [^js e] (.remove (.-target e)))}}
          "Dismiss me"]
         [:ty-tag {:flavor "success" :clickable "true" :dismissible "true"} "Both"]
         [:ty-tag {:flavor "warning" :clickable "true" :disabled "true"} "Disabled"]])
       (code-block "<!-- Clickable -->
<ty-tag flavor=\"primary\" clickable onclick=\"alert('clicked!')\">
  Click me
</ty-tag>

<!-- Dismissible -->
<ty-tag id=\"t\" flavor=\"danger\" dismissible>Dismiss me</ty-tag>
<script>
  document.getElementById('t').addEventListener('dismiss', e => e.target.remove());
</script>

<!-- Both -->
<ty-tag flavor=\"success\" clickable dismissible>Both</ty-tag>

<!-- Disabled -->
<ty-tag flavor=\"warning\" clickable disabled>Disabled</ty-tag>")]

      ;; With Icons and Slots
      [:div.ty-content.rounded-lg.p-5
       (section-label "Icons and Slots")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use start/end slots for icons, emojis, or count badges."]
       (demo-area
        [:div.flex.flex-wrap.gap-3
         [:ty-tag {:flavor "primary" :size "sm"}
          [:span {:slot "start"} "🚀"] "Launch"]
         [:ty-tag {:flavor "success"}
          [:ty-icon {:slot "start" :name "check" :size "16"}]
          "Verified"]
         [:ty-tag {:flavor "warning"}
          "In Progress"
          [:span.ty-text--.ml-1 {:slot "end"} "(3)"]]
         [:ty-tag {:flavor "danger" :dismissible "true"}
          [:ty-icon {:slot "start" :name "alert-circle" :size "16"}]
          "Error"]])
       (code-block "<ty-tag flavor=\"primary\" size=\"sm\">
  <span slot=\"start\">🚀</span>
  Launch
</ty-tag>

<ty-tag flavor=\"success\">
  <ty-icon slot=\"start\" name=\"check\" size=\"16\"></ty-icon>
  Verified
</ty-tag>

<ty-tag flavor=\"warning\">
  In Progress
  <span slot=\"end\" class=\"ty-text-- ml-1\">(3)</span>
</ty-tag>

<ty-tag flavor=\"danger\" dismissible>
  <ty-icon slot=\"start\" name=\"alert-circle\" size=\"16\"></ty-icon>
  Error
</ty-tag>")]

      ;; Multiselect Integration
      [:div.ty-content.rounded-lg.p-5
       (section-label "Multiselect Integration")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Tags are the option primitive for ty-multiselect — same element serves as both option and selected chip."]
       (demo-area
        [:ty-multiselect {:placeholder "Select skills..."
                          :value "javascript,react"
                          :style {:min-width "300px"}}
         [:ty-tag {:value "javascript" :flavor "warning" :size "sm"}
          [:span {:slot "start"} "📜"] "JavaScript"]
         [:ty-tag {:value "typescript" :flavor "primary" :size "sm"}
          [:span {:slot "start"} "🔷"] "TypeScript"]
         [:ty-tag {:value "react" :flavor "success" :size "sm"}
          [:span {:slot "start"} "⚛️"] "React"]
         [:ty-tag {:value "vue" :flavor "success" :size "sm"}
          [:span {:slot "start"} "🟢"] "Vue.js"]
         [:ty-tag {:value "python" :flavor "neutral" :size "sm"}
          [:span {:slot "start"} "🐍"] "Python"]])
       (code-block "<ty-multiselect placeholder=\"Select skills...\" value=\"javascript,react\">
  <ty-tag value=\"javascript\" flavor=\"warning\" size=\"sm\">
    <span slot=\"start\">📜</span> JavaScript
  </ty-tag>
  <ty-tag value=\"react\" flavor=\"success\" size=\"sm\">
    <span slot=\"start\">⚛️</span> React
  </ty-tag>
</ty-multiselect>")]])

   ;; Common Use Cases
   (doc-section "Common Use Cases"
     [:div.grid.gap-5
      {:style {:grid-template-columns "repeat(auto-fill, minmax(280px, 1fr))"}}

      [:div.ty-content.rounded-lg.p-5
       (section-label "Status Indicators")
       [:div.space-y-3
        [:div.flex.items-center.gap-2
         [:span.ty-text- {:style {:font-size "0.875rem"}} "User Status:"]
         [:ty-tag {:flavor "success" :size "sm"} "Active"]]
        [:div.flex.items-center.gap-2
         [:span.ty-text- {:style {:font-size "0.875rem"}} "Deployment:"]
         [:ty-tag {:flavor "warning" :size "sm"} "Pending"]]
        [:div.flex.items-center.gap-2
         [:span.ty-text- {:style {:font-size "0.875rem"}} "Service:"]
         [:ty-tag {:flavor "danger" :size "sm"} "Offline"]]]]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Category Labels")
       [:div.flex.flex-wrap.gap-2
        [:ty-tag {:flavor "primary" :size "sm" :pill "false"} "Technology"]
        [:ty-tag {:flavor "secondary" :size "sm" :pill "false"} "Design"]
        [:ty-tag {:flavor "success" :size "sm" :pill "false"} "Marketing"]
        [:ty-tag {:flavor "warning" :size "sm" :pill "false"} "Sales"]]]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Skill Badges")
       [:div.flex.flex-wrap.gap-2
        [:ty-tag {:flavor "neutral" :size "sm"} "HTML/CSS"]
        [:ty-tag {:flavor "neutral" :size "sm"} "JavaScript"]
        [:ty-tag {:flavor "neutral" :size "sm"} "React"]
        [:ty-tag {:flavor "neutral" :size "sm"} "Node.js"]]]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Active Filters")
       [:div.flex.flex-wrap.gap-2
        [:ty-tag {:flavor "primary" :dismissible "true" :size "sm"} "Price < $100"]
        [:ty-tag {:flavor "primary" :dismissible "true" :size "sm"} "In Stock"]
        [:ty-tag {:flavor "primary" :dismissible "true" :size "sm"} "Free Shipping"]]]])

   ;; JavaScript API
   (doc-section "JavaScript API"
     [:div.ty-elevated.rounded-lg.p-5
      [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
       "Programmatic interaction with ty-tag:"]
      (code-block
       "// Properties
const tag = document.querySelector('ty-tag');
tag.value = 'my-value';
tag.selected = true;

// Events
tag.addEventListener('click', (e) => console.log('clicked:', e.detail.target));
tag.addEventListener('dismiss', (e) => e.target.remove());

// Dynamic creation
const tag = document.createElement('ty-tag');
tag.flavor = 'success';
tag.dismissible = true;
tag.textContent = 'New Tag';
tag.addEventListener('dismiss', (e) => e.target.remove());
document.body.appendChild(tag);

// Keyboard (built-in)
// Enter/Space → click  |  Delete/Backspace → dismiss"
       "javascript")])

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
         (for [text ["Use semantic flavors to convey meaning (success for positive, danger for errors)"
                     "Keep tag text concise and scannable"
                     "Use dismissible tags for removable filters or selections"
                     "Provide visual feedback with icons or emojis in slots"
                     "Use consistent sizing within tag groups"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Use tags for long text — they're meant for short labels"
                     "Mix pill and rectangular shapes in the same context"
                     "Make all tags dismissible if they represent fixed categories"
                     "Use clickable without providing clear visual feedback"
                     "Overuse different flavors — maintain visual hierarchy"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])

   ;; Accessibility
   (doc-section "Accessibility"
     [:div.ty-content.rounded-lg.p-5
      [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
       "ty-tag includes built-in accessibility features:"]
      [:div.space-y-2
       (for [item ["Keyboard navigation — Enter/Space for click, Delete/Backspace for dismiss"
                   "ARIA attributes reflect disabled state"
                   "Proper focus management for interactive tags"
                   "Screen-reader-friendly dismiss button labels"
                   "High contrast support via semantic color variables"]]
         [:div.flex.items-start.gap-2
          [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
          [:p.ty-text- {:style {:font-size "0.8125rem"}} item]])]])))
