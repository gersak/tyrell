(ns tyrell.site.docs.button
  "Documentation for ty-button component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table slot-table
                                             docs-page doc-section component-header section-label demo-area]]))

(defn view []
  (docs-page
   ;; Page header
   (component-header "ty-button" "A flexible button component with multiple styles, sizes, and form integration.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5
     [:h2.scroll-mt-6.text-xs.font-bold.ty-text--.tracking-widest.uppercase "API Reference"]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "flavor"
        :type "string"
        :default "\"neutral\""
        :description "Semantic color. Built-in: primary, secondary, success, danger, warning, neutral. Append '+' for a stronger shade or '-' for a softer one (e.g. \"primary+\", \"danger-\"). Any other string is also accepted — theme custom flavors via --ty-button-* CSS variables."}
       {:name "appearance"
        :type "string"
        :default "\"solid\""
        :description "Visual variant: \"solid\" (saturated brand fill, default), \"outlined\" (transparent bg with matching text + border), or \"ghost\" (text only with hover background)."}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Size of the button (xs, sm, md, lg, xl)"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Whether the button is disabled"}
       {:name "loading"
        :type "boolean"
        :default "false"
        :description "Show a centered spinner overlay, block clicks, and set aria-busy. Width is preserved (content kept in flow but hidden), so there is no layout shift. Customize the spinner globally via setLoaderSvg() / window.tyLoader.set()."}
       {:name "action"
        :type "boolean"
        :default "false"
        :description "Makes button circular/icon-only, typically for floating action buttons"}
       {:name "wide"
        :type "boolean"
        :default "false"
        :description "Makes button take more horizontal space"}
       {:name "muted"
        :type "boolean"
        :default "false"
        :description "Desaturates the flavor color at rest; reveals it on hover (pointer devices only) and on press/focus. Use for low-priority actions that shouldn't compete for attention until the user reaches for them."}
       {:name "type"
        :type "string"
        :default "\"button\""
        :description "HTML button type (button, submit, reset)"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name when used in forms"}
       {:name "value"
        :type "string"
        :default "-"
        :description "Form field value when used in forms"}])]

    [:div.mb-6
     (section-label "Events")
     (event-table
      [{:name "click"
        :payload "MouseEvent"
        :when-fired "When button is clicked"}
       {:name "focus"
        :payload "FocusEvent"
        :when-fired "When button receives focus"}
       {:name "blur"
        :payload "FocusEvent"
        :when-fired "When button loses focus"}])]

    [:div
     (section-label "Slots")
     (slot-table
      [{:name "start"
        :description "Content placed before the button text (typically an icon)"}
       {:name "(default)"
        :description "Main button content"}
       {:name "end"
        :description "Content placed after the button text (typically an icon)"}])]]

   ;; Basic Usage
   (doc-section "Basic Usage"
                [:div.ty-content.rounded-lg.p-4
                 (code-block "<ty-button>Click me</ty-button>")
                 (demo-area
                  [:ty-button {:on {:click #(js/alert "It works!")}} "Try it out"])])

   ;; Examples
   (doc-section "Examples"
                [:div.space-y-6

      ;; Button Flavors
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Button Flavors")
                  (demo-area
                   [:div.flex.flex-wrap.gap-3
                    [:ty-button "Default"]
                    [:ty-button {:flavor "primary"} "Primary"]
                    [:ty-button {:flavor "secondary"} "Secondary"]
                    [:ty-button {:flavor "danger"} "Danger"]
                    [:ty-button {:flavor "success"} "Success"]
                    [:ty-button {:flavor "warning"} "Warning"]
                    [:ty-button {:flavor "neutral"} "Neutral"]])
                  (code-block "<ty-button>Default</ty-button>
<ty-button flavor=\"primary\">Primary</ty-button>
<ty-button flavor=\"secondary\">Secondary</ty-button>
<ty-button flavor=\"danger\">Danger</ty-button>
<ty-button flavor=\"success\">Success</ty-button>
<ty-button flavor=\"warning\">Warning</ty-button>
<ty-button flavor=\"neutral\">Neutral</ty-button>")]

      ;; Complete Matrix
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Complete Matrix")
                  [:p.ty-text-.mb-4
                   {:style {:font-size "0.8125rem"
                            :line-height "1.6"}}
                   "Every appearance × flavor × tone combination. Three appearance variants — "
                   [:code.font-mono "solid"] ", " [:code.font-mono "outlined"] ", " [:code.font-mono "ghost"]
                   " — each with three tones via the flavor suffix: "
                   [:code.font-mono "-"] " (soft), base, "
                   [:code.font-mono "+"] " (strong). Useful for inspecting contrast in light vs dark mode."]
                  [:div.space-y-6
        ;; Solid
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"
                                                :letter-spacing "0.05em"}} "Solid"]
                    [:div.grid.gap-3.items-center
                     {:style {:grid-template-columns "6rem repeat(3, max-content)"}}
                     [:div]
                     [:div.text-xs.ty-text-.font-medium "Soft (–)"]
                     [:div.text-xs.ty-text-.font-medium "Base"]
                     [:div.text-xs.ty-text-.font-medium "Strong (+)"]
                     (for [flavor ["primary" "secondary" "success" "danger" "warning" "neutral"]]
                       (list
                        [:div.text-sm.font-mono.ty-text {:key (str "solid-" flavor "-label")} flavor]
                        [:ty-button {:key (str "solid-" flavor "-soft") :flavor (str flavor "-")} flavor]
                        [:ty-button {:key (str "solid-" flavor "-base") :flavor flavor} flavor]
                        [:ty-button {:key (str "solid-" flavor "-strong") :flavor (str flavor "+")} flavor]))]]

        ;; Outlined
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"
                                                :letter-spacing "0.05em"}} "Outlined"]
                    [:div.grid.gap-3.items-center
                     {:style {:grid-template-columns "6rem repeat(3, max-content)"}}
                     [:div]
                     [:div.text-xs.ty-text-.font-medium "Soft (–)"]
                     [:div.text-xs.ty-text-.font-medium "Base"]
                     [:div.text-xs.ty-text-.font-medium "Strong (+)"]
                     (for [flavor ["primary" "secondary" "success" "danger" "warning" "neutral"]]
                       (list
                        [:div.text-sm.font-mono.ty-text {:key (str "outlined-" flavor "-label")} flavor]
                        [:ty-button {:key (str "outlined-" flavor "-soft") :flavor (str flavor "-") :appearance "outlined"} flavor]
                        [:ty-button {:key (str "outlined-" flavor "-base") :flavor flavor :appearance "outlined"} flavor]
                        [:ty-button {:key (str "outlined-" flavor "-strong") :flavor (str flavor "+") :appearance "outlined"} flavor]))]]

        ;; Ghost
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"
                                                :letter-spacing "0.05em"}} "Ghost"]
                    [:div.grid.gap-3.items-center
                     {:style {:grid-template-columns "6rem repeat(3, max-content)"}}
                     [:div]
                     [:div.text-xs.ty-text-.font-medium "Soft (–)"]
                     [:div.text-xs.ty-text-.font-medium "Base"]
                     [:div.text-xs.ty-text-.font-medium "Strong (+)"]
                     (for [flavor ["primary" "secondary" "success" "danger" "warning" "neutral"]]
                       (list
                        [:div.text-sm.font-mono.ty-text {:key (str "ghost-" flavor "-label")} flavor]
                        [:ty-button {:key (str "ghost-" flavor "-soft") :flavor (str flavor "-") :appearance "ghost"} flavor]
                        [:ty-button {:key (str "ghost-" flavor "-base") :flavor flavor :appearance "ghost"} flavor]
                        [:ty-button {:key (str "ghost-" flavor "-strong") :flavor (str flavor "+") :appearance "ghost"} flavor]))]]]

                  (code-block "<!-- Solid is the default appearance -->
<ty-button flavor=\"primary\">Primary</ty-button>
<ty-button flavor=\"primary+\">Stronger</ty-button>
<ty-button flavor=\"primary-\">Softer</ty-button>

<!-- Outlined and ghost via the appearance attribute -->
<ty-button appearance=\"outlined\" flavor=\"success+\">Success outlined</ty-button>
<ty-button appearance=\"ghost\" flavor=\"danger\">Danger ghost</ty-button>")]

      ;; Muted
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Muted (suppress until interaction)")
                  [:p.ty-text-.mb-4
                   {:style {:font-size "0.8125rem"
                            :line-height "1.6"}}
                   "Add " [:code.font-mono "muted"] " to desaturate a button's flavor color at rest. Hover it back to color (mouse/trackpad only — touch has no hover) or press it — "
                   [:code.font-mono ":active"] " and " [:code.font-mono ":focus-visible"] " always reveal the real color, so touch users still see it on tap. Try hovering the buttons below."]
                  (demo-area
                   [:div.flex.flex-wrap.gap-3
                    [:ty-button {:flavor "primary" :muted true} "Primary muted"]
                    [:ty-button {:flavor "danger" :appearance "outlined" :muted true} "Danger outlined muted"]
                    [:ty-button {:flavor "success" :appearance "ghost" :muted true} "Success ghost muted"]
                    [:ty-button {:action true :flavor "secondary" :muted true}
                     [:ty-icon {:name "more-vertical" :size "sm"}]]])
                  (code-block "<ty-button flavor=\"primary\" muted>Primary muted</ty-button>
<ty-button flavor=\"danger\" appearance=\"outlined\" muted>Danger outlined muted</ty-button>
<ty-button flavor=\"success\" appearance=\"ghost\" muted>Success ghost muted</ty-button>")]

      ;; Custom Colors via CSS Variables
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Custom Colors via CSS Variables")
                  [:p.ty-text-.mb-4
                   {:style {:font-size "0.8125rem"
                            :line-height "1.6"}}
                   "Override colors per button by setting any of these CSS variables on the host. Useful for one-off brand colors, A/B tests, or theming a button outside the semantic palette."]
                  [:ul.list-disc.list-inside.ty-text-.mb-4.space-y-1
                   {:style {:font-size "0.8125rem"}}
                   [:li [:code.font-mono "--ty-button-bg"] " — background color (solid)"]
                   [:li [:code.font-mono "--ty-button-bg-hover"] " — hover background"]
                   [:li [:code.font-mono "--ty-button-color"] " — text color"]
                   [:li [:code.font-mono "--ty-button-border"] " — border color (outlined)"]]
                  (demo-area
                   [:div.flex.flex-wrap.gap-3
                    [:ty-button {:style {:--ty-button-bg "#ff6600"
                                         :--ty-button-color "white"
                                         :--ty-button-bg-hover "#e65c00"}}
                     "Brand orange"]
                    [:ty-button {:flavor "primary" :appearance "outlined"
                                 :style {:--ty-button-color "#6366f1"
                                         :--ty-button-border "#6366f1"}}
                     "Indigo outlined"]
                    [:ty-button {:style {:--ty-button-bg "#ec4899"
                                         :--ty-button-color "white"
                                         :--ty-button-bg-hover "#db2777"}}
                     "Pink solid"]
                    [:ty-button {:style {:--ty-button-bg "linear-gradient(135deg, #667eea, #764ba2)"}}
                     "Gradient"]])
                  (code-block "<!-- One-off brand color -->
<ty-button style=\"--ty-button-bg: #ff6600;
                  --ty-button-color: white;
                  --ty-button-bg-hover: #e65c00;\">
  Brand orange
</ty-button>

<!-- Even gradients work -->
<ty-button style=\"--ty-button-bg: linear-gradient(135deg, #667eea, #764ba2);\">
  Gradient
</ty-button>")]

      ;; Custom Flavors
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Custom Flavors")
                  [:p.ty-text-.mb-4
                   {:style {:font-size "0.8125rem"
                            :line-height "1.6"}}
                   "Pass any string as " [:code.font-mono "flavor"] " — even if it's not built-in. The button picks up the class so you can theme all buttons of a flavor in a single CSS rule. Combine with the CSS variables above for global brand flavors."]
                  (demo-area
                   [:div.flex.flex-wrap.gap-3
                    [:style "ty-button[flavor=\"brand\"] {
   --ty-button-bg: #7c3aed;
   --ty-button-color: white;
   --ty-button-bg-hover: #6d28d9;
   --ty-button-border: #5b21b6;
 }
 ty-button[flavor=\"teal\"] {
   --ty-button-bg: #0d9488;
   --ty-button-color: white;
   --ty-button-bg-hover: #0f766e;
   --ty-button-border: #115e59;
 }
 ty-button[flavor=\"sunset\"] {
   --ty-button-bg: #f97316;
   --ty-button-color: white;
   --ty-button-bg-hover: #ea580c;
   --ty-button-border: #c2410c;
 }"]
                    [:ty-button {:flavor "brand"} "Brand"]
                    [:ty-button {:flavor "teal"} "Teal"]
                    [:ty-button {:flavor "sunset"} "Sunset"]
                    [:ty-button {:flavor "brand" :appearance "outlined"} "Brand outlined"]
                    [:ty-button {:flavor "teal" :pill true} "Teal pill"]])
                  (code-block "<style>
  ty-button[flavor=\"brand\"] {
    --ty-button-bg: #7c3aed;
    --ty-button-color: white;
    --ty-button-bg-hover: #6d28d9;
    --ty-button-border: #5b21b6;
  }
</style>

<ty-button flavor=\"brand\">Brand</ty-button>
<ty-button flavor=\"brand\" appearance=\"outlined\">Brand outlined</ty-button>")]

      ;; Button Sizes
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Button Sizes")
                  (demo-area
                   [:div.flex.flex-wrap.items-center.gap-3
                    [:ty-button {:size "xs"} "Extra Small"]
                    [:ty-button {:size "sm"} "Small"]
                    [:ty-button "Default"]
                    [:ty-button {:size "lg"} "Large"]
                    [:ty-button {:size "xl"} "Extra Large"]])
                  (code-block "<ty-button size=\"xs\">Extra Small</ty-button>
<ty-button size=\"sm\">Small</ty-button>
<ty-button>Default</ty-button>
<ty-button size=\"lg\">Large</ty-button>
<ty-button size=\"xl\">Extra Large</ty-button>")]

      ;; Action Buttons
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Action Buttons (Icon-only)")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem"
                                             :line-height "1.6"}}
                   "Action buttons are circular icon-only buttons, perfect for floating action buttons or toolbar actions."]
                  (demo-area
                   [:div.flex.flex-wrap.items-center.gap-3
                    [:ty-button {:action true :flavor "primary" :size "lg"}
                     [:ty-icon {:name "plus" :size "md"}]]
                    [:ty-button {:action true :flavor "secondary"}
                     [:ty-icon {:name "edit" :size "sm"}]]
                    [:ty-button {:action true :flavor "danger"}
                     [:ty-icon {:name "trash" :size "sm"}]]
                    [:ty-button {:action true :flavor "success"}
                     [:ty-icon {:name "check" :size "sm"}]]
                    [:ty-button {:action true :size "xs"}
                     [:ty-icon {:name "x" :size "xs"}]]])
                  (code-block "<!-- Large Primary FAB -->
<ty-button action=\"true\" flavor=\"primary\" size=\"lg\">
  <ty-icon name=\"plus\" size=\"md\"></ty-icon>
</ty-button>

<!-- Regular Action Buttons -->
<ty-button action=\"true\" flavor=\"secondary\">
  <ty-icon name=\"edit\" size=\"sm\"></ty-icon>
</ty-button>

<ty-button action=\"true\" flavor=\"danger\">
  <ty-icon name=\"trash\" size=\"sm\"></ty-icon>
</ty-button>

<!-- Small Close Button -->
<ty-button action=\"true\" size=\"xs\">
  <ty-icon name=\"x\" size=\"xs\"></ty-icon>
</ty-button>")]

      ;; Buttons with Icons
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Buttons with Icons")
                  (demo-area
                   [:div.flex.flex-wrap.gap-3
                    [:ty-button {:flavor "primary"}
                     [:ty-icon {:slot "start" :name "save" :size "sm"}]
                     "Save"]
                    [:ty-button {:flavor "secondary"}
                     [:ty-icon {:slot "start" :name "download" :size "sm"}]
                     "Download"]
                    [:ty-button {:flavor "danger"}
                     [:ty-icon {:slot "start" :name "trash" :size "sm"}]
                     "Delete"]
                    [:ty-button
                     "Next"
                     [:ty-icon {:slot "end" :name "arrow-right" :size "sm"}]]])
                  (code-block "<ty-button flavor=\"primary\">
  <ty-icon slot=\"start\" name=\"save\" size=\"sm\"></ty-icon>
  Save
</ty-button>

<ty-button>
  Next
  <ty-icon slot=\"end\" name=\"arrow-right\" size=\"sm\"></ty-icon>
</ty-button>")]

      ;; Button States
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Button States")
                  (demo-area
                   [:div.flex.flex-wrap.gap-3
                    [:ty-button {:disabled true} "Disabled"]
                    [:ty-button {:flavor "primary" :loading ""} "Saving"]
                    [:ty-button {:flavor "secondary" :loading ""} "Processing"]
                    [:ty-button {:flavor "success" :disabled true} "Success Disabled"]])
                  (code-block "<ty-button disabled>Disabled</ty-button>

<!-- Built-in loading state — see the dedicated section below for details -->
<ty-button flavor=\"primary\" loading>Saving</ty-button>
<ty-button flavor=\"secondary\" loading>Processing</ty-button>

<ty-button flavor=\"success\" disabled>Success Disabled</ty-button>")]

      ;; Wide Buttons
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Wide Buttons")
                  [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem"
                                             :line-height "1.6"}}
                   "Wide buttons expand to take full available width. Perfect for mobile layouts, forms, and call-to-action sections."]

                  [:div.space-y-4

        ;; Single wide
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Single wide"]
                    (demo-area
                     [:ty-button {:wide true :flavor "primary"}
                      [:ty-icon {:slot "start" :name "log-in" :size "sm"}]
                      "Sign In"])
                    (code-block "<ty-button wide=\"true\" flavor=\"primary\">
  <ty-icon slot=\"start\" name=\"log-in\" size=\"sm\"></ty-icon>
  Sign In
</ty-button>")]

        ;; Two-column grid
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Two-column grid"]
                    (demo-area
                     [:div.grid.grid-cols-2.gap-3
                      [:ty-button {:wide true :flavor "primary"}
                       [:ty-icon {:slot "start" :name "check" :size "sm"}]
                       "Confirm"]
                      [:ty-button {:wide true :flavor "secondary"}
                       [:ty-icon {:slot "start" :name "x" :size "sm"}]
                       "Cancel"]])
                    (code-block "<div class=\"grid grid-cols-2 gap-3\">
  <ty-button wide=\"true\" flavor=\"primary\">
    <ty-icon slot=\"start\" name=\"check\" size=\"sm\"></ty-icon>
    Confirm
  </ty-button>
  <ty-button wide=\"true\" flavor=\"secondary\">
    <ty-icon slot=\"start\" name=\"x\" size=\"sm\"></ty-icon>
    Cancel
  </ty-button>
</div>")]

        ;; Action panel
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Action panel (three buttons)"]
                    (demo-area
                     [:div.grid.grid-cols-3.gap-2
                      [:ty-button {:wide true :flavor "success"}
                       [:ty-icon {:slot "start" :name "download" :size "sm"}]
                       "Download"]
                      [:ty-button {:wide true :flavor "secondary"}
                       [:ty-icon {:slot "start" :name "share-2" :size "sm"}]
                       "Share"]
                      [:ty-button {:wide true :flavor "danger"}
                       [:ty-icon {:slot "start" :name "trash" :size "sm"}]
                       "Delete"]])
                    (code-block "<div class=\"grid grid-cols-3 gap-2\">
  <ty-button wide=\"true\" flavor=\"success\">Download</ty-button>
  <ty-button wide=\"true\" flavor=\"secondary\">Share</ty-button>
  <ty-button wide=\"true\" flavor=\"danger\">Delete</ty-button>
</div>")]

        ;; Mobile form
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Mobile form layout"]
                    (demo-area
                     [:div.max-w-sm.space-y-2
                      [:ty-button {:wide true :flavor "primary" :size "lg"}
                       [:ty-icon {:slot "start" :name "log-in" :size "sm"}]
                       "Sign In with Email"]
                      [:ty-button {:wide true :flavor "secondary" :size "lg"}
                       [:ty-icon {:slot "start" :name "github" :size "sm"}]
                       "Sign In with GitHub"]
                      [:ty-button {:wide true :flavor "secondary" :size "lg"}
                       [:ty-icon {:slot "start" :name "mail" :size "sm"}]
                       "Sign In with Google"]])
                    (code-block "<div class=\"space-y-2\">
  <ty-button wide=\"true\" flavor=\"primary\" size=\"lg\">
    <ty-icon slot=\"start\" name=\"log-in\" size=\"sm\"></ty-icon>
    Sign In with Email
  </ty-button>
  <ty-button wide=\"true\" flavor=\"secondary\" size=\"lg\">
    <ty-icon slot=\"start\" name=\"github\" size=\"sm\"></ty-icon>
    Sign In with GitHub
  </ty-button>
  <ty-button wide=\"true\" flavor=\"secondary\" size=\"lg\">
    <ty-icon slot=\"start\" name=\"mail\" size=\"sm\"></ty-icon>
    Sign In with Google
  </ty-button>
</div>")]]]

      ;; Form Integration
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Form Integration")
                  [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem"
                                             :line-height "1.6"}}
                   "ty-button fully supports HTML form integration with type, name, and value attributes. Default type is 'submit' like native HTML buttons."]

                  [:div.space-y-5

        ;; Basic form
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Basic form with submit"]
                    (demo-area
                     [:form.ty-elevated.rounded-lg.p-4
                      {:on {:submit (fn [e]
                                      (.preventDefault e)
                                      (let [form-data (js/FormData. (.-target e))
                                            data (js/Object.fromEntries form-data)]
                                        (js/alert (str "Form submitted!\n" (js/JSON.stringify data nil 2)))))}}
                      [:div.space-y-3
                       [:div
                        [:label.block.ty-text+.text-sm.mb-1 {:for "username"} "Username"]
                        [:input#username.ty-input.ty-border.border.rounded.px-3.py-2.w-full
                         {:name "username" :required true :placeholder "Enter username"}]]
                       [:div
                        [:label.block.ty-text+.text-sm.mb-1 {:for "email"} "Email"]
                        [:input#email.ty-input.ty-border.border.rounded.px-3.py-2.w-full
                         {:name "email" :type "email" :required true :placeholder "Enter email"}]]
                       [:div.flex.gap-2
                        [:ty-button {:type "submit" :flavor "primary"}
                         [:ty-icon {:slot "start" :name "check" :size "sm"}]
                         "Submit"]
                        [:ty-button {:type "reset" :flavor "secondary"}
                         [:ty-icon {:slot "start" :name "x" :size "sm"}]
                         "Reset"]
                        [:ty-button {:type "button" :flavor "secondary"}
                         "Cancel"]]]])
                    (code-block "<form>
  <input name=\"username\" required>
  <input name=\"email\" type=\"email\" required>

  <!-- type=\"submit\" (default) - submits the form -->
  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>

  <!-- type=\"reset\" - clears the form -->
  <ty-button type=\"reset\" flavor=\"secondary\">Reset</ty-button>

  <!-- type=\"button\" - does nothing, for custom JS -->
  <ty-button type=\"button\" flavor=\"secondary\">Cancel</ty-button>
</form>")]

        ;; Named submit buttons
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Multiple submit buttons with name/value"]
                    (demo-area
                     [:form.ty-elevated.rounded-lg.p-4
                      {:on {:submit (fn [e]
                                      (.preventDefault e)
                                      (let [form-data (js/FormData. (.-target e))
                                            data (js/Object.fromEntries form-data)]
                                        (js/alert (str "Action: " (or (.-action data) "none") "\n\n" (js/JSON.stringify data nil 2)))))}}
                      [:div.space-y-3
                       [:div
                        [:label.block.ty-text+.text-sm.mb-1 {:for "comment"} "Your Comment"]
                        [:textarea#comment.ty-input.ty-border.border.rounded.px-3.py-2.w-full
                         {:name "comment" :rows 3 :required true :placeholder "Enter your comment"}]]
                       [:div.flex.flex-wrap.gap-2
                        [:ty-button {:type "submit" :name "action" :value "save_draft" :flavor "secondary"}
                         [:ty-icon {:slot "start" :name "save" :size "sm"}]
                         "Save Draft"]
                        [:ty-button {:type "submit" :name "action" :value "publish" :flavor "primary"}
                         [:ty-icon {:slot "start" :name "send" :size "sm"}]
                         "Publish"]
                        [:ty-button {:type "submit" :name "action" :value "schedule" :flavor "secondary"}
                         [:ty-icon {:slot "start" :name "clock" :size "sm"}]
                         "Schedule"]]]])
                    (code-block "<form>
  <textarea name=\"comment\" required></textarea>

  <!-- Each button can have different name/value -->
  <!-- Only the clicked button's value is submitted -->
  <ty-button type=\"submit\" name=\"action\" value=\"save_draft\">
    Save Draft
  </ty-button>

  <ty-button type=\"submit\" name=\"action\" value=\"publish\">
    Publish
  </ty-button>

  <ty-button type=\"submit\" name=\"action\" value=\"schedule\">
    Schedule
  </ty-button>
</form>")]

        ;; Button types comparison
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Button types comparison"]
                    [:div.ty-elevated.rounded.p-4.mb-3
                     [:table.w-full
                      {:style {:font-size "0.8125rem"}}
                      [:thead
                       [:tr {:style {:border-bottom "1px solid var(--ty-border-soft)"}}
                        [:th.text-left.px-2.py-2.ty-text+ "Type"]
                        [:th.text-left.px-2.py-2.ty-text+ "Behavior"]
                        [:th.text-left.px-2.py-2.ty-text+ "Use Case"]]]
                      [:tbody
                       [:tr {:style {:border-bottom "1px solid var(--ty-border-soft)"}}
                        [:td.px-2.py-2.ty-text.font-mono "submit"]
                        [:td.px-2.py-2.ty-text- "Submits the form"]
                        [:td.px-2.py-2.ty-text- "Primary action, save data"]]
                       [:tr {:style {:border-bottom "1px solid var(--ty-border-soft)"}}
                        [:td.px-2.py-2.ty-text.font-mono "reset"]
                        [:td.px-2.py-2.ty-text- "Clears all fields"]
                        [:td.px-2.py-2.ty-text- "Reset form to initial state"]]
                       [:tr
                        [:td.px-2.py-2.ty-text.font-mono "button"]
                        [:td.px-2.py-2.ty-text- "Does nothing"]
                        [:td.px-2.py-2.ty-text- "Custom JavaScript actions"]]]]]
                    (code-block "<ty-button>Submit Form</ty-button>

<!-- Explicitly set type -->
<ty-button type=\"submit\">Submit</ty-button>
<ty-button type=\"reset\">Clear</ty-button>
<ty-button type=\"button\">Custom Action</ty-button>")]]]

      ;; Loading State
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Loading State")
                  [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem"
                                             :line-height "1.6"}}
                   "Add the " [:code.font-mono "loading"] " attribute to overlay a centered spinner, block clicks, and set "
                   [:code.font-mono "aria-busy"] ". The button keeps its width — your label stays in the layout, just hidden, so there is no layout shift."]

                  [:div.space-y-5

        ;; Static example
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Static (loading attribute set)"]
                    (demo-area
                     [:div.flex.flex-wrap.gap-3
                      [:ty-button {:flavor "primary" :loading ""} "Save"]
                      [:ty-button {:flavor "secondary" :loading ""} "Syncing"]
                      [:ty-button {:flavor "danger" :appearance "outlined" :loading ""} "Delete"]
                      [:ty-button {:action true :flavor "primary" :loading ""}
                       [:ty-icon {:name "save" :size "md"}]]])
                    (code-block "<ty-button flavor=\"primary\" loading>Save</ty-button>
<ty-button flavor=\"secondary\" loading>Syncing</ty-button>
<ty-button flavor=\"danger\" appearance=\"outlined\" loading>Delete</ty-button>

<!-- Action (icon-only) buttons too -->
<ty-button action loading flavor=\"primary\">
  <ty-icon name=\"save\" size=\"md\"></ty-icon>
</ty-button>")]

        ;; Interactive toggle demo
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Interactive — click to simulate a 2s save"]
                    (demo-area
                     [:div.flex.flex-wrap.gap-3
                      [:ty-button {:flavor "primary"
                                   :on {:click (fn [^js e]
                                                 (when-let [btn ^js (.closest (.-target e) "ty-button")]
                                                   (set! (.-loading btn) true)
                                                   (js/setTimeout #(set! (.-loading btn) false) 2000)))}}
                       [:ty-icon {:slot "start" :name "save" :size "sm"}]
                       "Save"]
                      [:ty-button {:flavor "success"
                                   :on {:click (fn [^js e]
                                                 (when-let [btn (.closest (.-target e) "ty-button")]
                                                   (set! (.-loading btn) true)
                                                   (js/setTimeout #(set! (.-loading btn) false) 2000)))}}
                       [:ty-icon {:slot "start" :name "send" :size "sm"}]
                       "Publish"]])
                    (code-block "// Vanilla JS — toggle the property, NOT the attribute
const btn = document.querySelector('ty-button');
btn.addEventListener('click', async () => {
  btn.loading = true;
  await save();
  btn.loading = false;
});")]

        ;; Global spinner customization
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem"
                                                :font-weight "500"}} "Customize the spinner globally"]
                    [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem"
                                               :line-height "1.6"}}
                     "All loading-aware components — " [:code.font-mono "ty-button"] ", "
                     [:code.font-mono "ty-dropdown"] ", " [:code.font-mono "ty-multiselect"]
                     " — pull from a global SVG registry. Set it once at app boot to use your own spinner everywhere. The component still spins the wrapper, so register a "
                     [:strong "static"] " SVG that uses " [:code.font-mono "currentColor"] " for the stroke or fill."]
                    (code-block "// ESM (NPM)
import { setLoaderSvg } from 'tyrell-components';

setLoaderSvg(`
  <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">
    <circle cx=\"4\"  cy=\"12\" r=\"2\"/>
    <circle cx=\"12\" cy=\"12\" r=\"2\"/>
    <circle cx=\"20\" cy=\"12\" r=\"2\"/>
  </svg>`);

setLoaderSvg(null); // back to default" "javascript")
                    (code-block "<!-- CDN / vanilla / HTMX / Datastar -->
<script src=\"https://unpkg.com/tyrell-components/dist/tyrell.js\"></script>
<script>
  window.tyLoader.set('<svg viewBox=\"0 0 24 24\">...</svg>');
  window.tyLoader.reset();
</script>" "html")
                    (code-block ";; ClojureScript
(ns my.app
  (:require [\"tyrell-components\" :as ty]))

(ty/setLoaderSvg \"<svg viewBox=\\\"0 0 24 24\\\">...</svg>\")")]

        ;; Notes
                   [:div.ty-elevated.rounded.p-3
                    {:style {:font-size "0.8125rem"}}
                    [:p.ty-text+.mb-1 {:style {:font-weight "600"}} "Notes"]
                    [:ul.list-disc.list-inside.ty-text-.space-y-1
                     [:li [:code.font-mono "loading"] " does not imply " [:code.font-mono "disabled"] " — they style differently. Loading is " [:code.font-mono "cursor: wait"] " and blocks the click handler; disabled greys the button out."]
                     [:li "If your registered SVG already has its own animation, override the wrapper rotation with the CSS variable " [:code.font-mono "--ty-loader-animation: none"] "."]
                     [:li "When set, the spinner inherits text color via " [:code.font-mono "currentColor"] " — so it adapts to your button flavor automatically."]]]]]])

   ;; Common Use Cases
   (doc-section "Common Use Cases"
                [:div.space-y-6

      ;; FAB
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Floating Action Button (FAB)")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem"
                                             :line-height "1.6"}}
                   "Use action buttons with primary flavor and large size for main floating actions."]
                  (demo-area
                   [:div.relative.h-28.ty-elevated.rounded-lg
                    [:ty-button {:action true :flavor "primary" :size "lg"
                                 :style {:position "absolute"
                                         :bottom "1rem"
                                         :right "1rem"}}
                     [:ty-icon {:name "plus" :size "md"}]]])
                  (code-block "<!-- Positioned FAB -->
<div class=\"relative\">
  <!-- Your content -->
  <ty-button action=\"true\" flavor=\"primary\" size=\"lg\"
             class=\"absolute bottom-4 right-4\">
    <ty-icon name=\"plus\" size=\"md\"></ty-icon>
  </ty-button>
</div>")]

      ;; Toolbar
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Toolbar Actions")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem"
                                             :line-height "1.6"}}
                   "Combine text buttons with action buttons in toolbars."]
                  (demo-area
                   [:div.ty-elevated.rounded.p-3.flex.items-center.justify-between
                    [:div.flex.gap-2
                     [:ty-button {:size "sm"} "Edit"]
                     [:ty-button {:size "sm"} "Share"]]
                    [:div.flex.gap-1
                     [:ty-button {:action true :size "sm"}
                      [:ty-icon {:name "search" :size "xs"}]]
                     [:ty-button {:action true :size "sm"}
                      [:ty-icon {:name "filter" :size "xs"}]]
                     [:ty-button {:action true :size "sm"}
                      [:ty-icon {:name "more-vertical" :size "xs"}]]]])
                  (code-block "<div class=\"flex items-center justify-between\">
  <div class=\"flex gap-2\">
    <ty-button size=\"sm\">Edit</ty-button>
    <ty-button size=\"sm\">Share</ty-button>
  </div>
  <div class=\"flex gap-1\">
    <ty-button action=\"true\" size=\"sm\">
      <ty-icon name=\"search\" size=\"xs\"></ty-icon>
    </ty-button>
    <ty-button action=\"true\" size=\"sm\">
      <ty-icon name=\"more-vertical\" size=\"xs\"></ty-icon>
    </ty-button>
  </div>
</div>")]])

   ;; Best Practices
   (doc-section "Best Practices"
                [:div.ty-elevated.rounded-lg.p-5
                 [:div.space-y-2
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-success.mt-1 {:name "check" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Use semantic flavors (primary, danger) to convey meaning"]]
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-success.mt-1 {:name "check" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Show loading states with spinning icons for async operations"]]
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-success.mt-1 {:name "check" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Use action buttons for icon-only actions to save space"]]
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-success.mt-1 {:name "check" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Disable buttons during loading to prevent multiple submissions"]]
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-success.mt-1 {:name "check" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Use slots for icons to maintain proper spacing"]]
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-danger.mt-1 {:name "x" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Don't use multiple buttons with the same primary action"]]
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-danger.mt-1 {:name "x" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Avoid using more than one primary button per section"]]
                  [:div.flex.items-start.gap-2
                   [:ty-icon.ty-text-danger.mt-1 {:name "x" :size "sm"}]
                   [:p.ty-text- {:style {:font-size "0.875rem"}} "Don't use action buttons for text-heavy actions"]]]])))
