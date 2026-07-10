(ns tyrell.site.views.ty-styles
  "Site view showcasing ty CSS classes and design system"
  (:require
    [tyrell.site.docs.common :as common :refer [docs-page]]))

(defn theme-toggle []
  "Simple theme toggle section"
  [:div.flex.justify-center.gap-4.mb-8
   [:button.px-6.py-3.ty-elevated.border.ty-border-soft.rounded-lg.hover:ty-content.ty-text.transition-colors.cursor-pointer.flex.items-center.gap-2
    {:on {:click #(.. js/document -documentElement -classList (remove "dark"))}}
    [:ty-icon {:name "sun" :size "sm"}] "Light Theme"]
   [:button.px-6.py-3.ty-bg-neutral.ty-text++.rounded-lg.hover:ty-bg-neutral+.transition-colors.cursor-pointer.flex.items-center.gap-2
    {:on {:click #(.. js/document -documentElement -classList (add "dark"))}}
    [:ty-icon {:name "moon" :size "sm"}] "Dark Theme"]])

;; ----------------------------------------------------------------------------
;; The 5-variant emphasis ladder: public-class suffix → internal token name.
;; Order is fixed: strong > bold > base > soft > faint.
;; ----------------------------------------------------------------------------

(def ^:private emphasis-ladder
  [["++" "strong"]
   ["+"  "bold"]
   [""   "base"]
   ["-"  "soft"]
   ["--" "faint"]])

(defn- text-ramp [flavor]
  [:div.space-y-3
   [:h4.text-sm.font-medium.ty-text (str (clojure.string/capitalize flavor) " Text Variants")]
   [:div {:class (str "ty-bg-" flavor "- p-4 rounded-lg space-y-2")}
    (for [[suffix token] emphasis-ladder]
      [:div.flex.items-baseline.justify-between.gap-3
       {:key (str flavor suffix)}
       [:span {:class (str "ty-text-" flavor suffix)}
        (str "ty-text-" flavor suffix)]
       [:code.ty-text-- {:style {:font-size "0.6875rem" :font-family "monospace"}}
        token]])]])

(defn text-variants-demo []
  "Shows the 5-variant text system, including the suffix → token mapping."
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "5-Variant Text System"]
   [:p.ty-text-.mb-2 "Each semantic color provides 5 levels of emphasis for precise text hierarchy."]
   [:p.ty-text--.mb-6 {:style {:font-size "0.8125rem"}}
    "Public class suffix on the left, internal token name on the right. The ladder is "
    [:code "strong → bold → base → soft → faint"]
    " — each step less emphatic than the previous. Surface backgrounds use "
    [:code "ty-bg-{flavor}-bold"] " (formerly " [:code "-mild"] ") and " [:code "ty-bg-{flavor}-soft"] "."]

   [:div.grid.gap-6.md:grid-cols-2.lg:grid-cols-3
    (text-ramp "primary")
    (text-ramp "secondary")
    (text-ramp "success")
    (text-ramp "danger")
    (text-ramp "warning")
    (text-ramp "neutral")]])

(defn background-variants-demo []
  "Shows the 3-variant background system"
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Background Variants"]
   [:p.ty-text-.mb-6 "Each semantic color provides 3 background intensities: +, base, and -."]

   [:div.grid.gap-6.md:grid-cols-2.lg:grid-cols-3
    ;; Primary backgrounds
    [:div.space-y-3
     [:h4.text-sm.font-medium.ty-text "Primary Backgrounds"]
     [:div.ty-bg-primary+.p-4.rounded-lg.text-center
      [:div.ty-text-primary++.font-medium "ty-bg-primary+"]
      [:div.ty-text-primary.text-sm "Stronger background"]]
     [:div.ty-bg-primary.p-4.rounded-lg.text-center
      [:div.ty-text-primary++.font-medium "ty-bg-primary"]
      [:div.ty-text-primary.text-sm "Base background"]]
     [:div.ty-bg-primary-.p-4.rounded-lg.text-center
      [:div.ty-text-primary++.font-medium "ty-bg-primary-"]
      [:div.ty-text-primary.text-sm "Softer background"]]]

    ;; Secondary backgrounds
    [:div.space-y-3
     [:h4.text-sm.font-medium.ty-text "Secondary Backgrounds"]
     [:div.ty-bg-secondary+.p-4.rounded-lg.text-center
      [:div.ty-text-secondary++.font-medium "ty-bg-secondary+"]
      [:div.ty-text-secondary.text-sm "Stronger background"]]
     [:div.ty-bg-secondary.p-4.rounded-lg.text-center
      [:div.ty-text-secondary++.font-medium "ty-bg-secondary"]
      [:div.ty-text-secondary.text-sm "Base background"]]
     [:div.ty-bg-secondary-.p-4.rounded-lg.text-center
      [:div.ty-text-secondary++.font-medium "ty-bg-secondary-"]
      [:div.ty-text-secondary.text-sm "Softer background"]]]

    ;; Success backgrounds
    [:div.space-y-3
     [:h4.text-sm.font-medium.ty-text "Success Backgrounds"]
     [:div.ty-bg-success+.p-4.rounded-lg.text-center
      [:div.ty-text-success++.font-medium "ty-bg-success+"]
      [:div.ty-text-success.text-sm "Stronger background"]]
     [:div.ty-bg-success.p-4.rounded-lg.text-center
      [:div.ty-text-success++.font-medium "ty-bg-success"]
      [:div.ty-text-success.text-sm "Base background"]]
     [:div.ty-bg-success-.p-4.rounded-lg.text-center
      [:div.ty-text-success++.font-medium "ty-bg-success-"]
      [:div.ty-text-success.text-sm "Softer background"]]]

    ;; Danger backgrounds
    [:div.space-y-3
     [:h4.text-sm.font-medium.ty-text "Danger Backgrounds"]
     [:div.ty-bg-danger+.p-4.rounded-lg.text-center
      [:div.ty-text-danger++.font-medium "ty-bg-danger+"]
      [:div.ty-text-danger.text-sm "Stronger background"]]
     [:div.ty-bg-danger.p-4.rounded-lg.text-center
      [:div.ty-text-danger++.font-medium "ty-bg-danger"]
      [:div.ty-text-danger.text-sm "Base background"]]
     [:div.ty-bg-danger-.p-4.rounded-lg.text-center
      [:div.ty-text-danger++.font-medium "ty-bg-danger-"]
      [:div.ty-text-danger.text-sm "Softer background"]]]

    ;; Warning backgrounds
    [:div.space-y-3
     [:h4.text-sm.font-medium.ty-text "Warning Backgrounds"]
     [:div.ty-bg-warning+.p-4.rounded-lg.text-center
      [:div.ty-text-warning++.font-medium "ty-bg-warning+"]
      [:div.ty-text-warning.text-sm "Stronger background"]]
     [:div.ty-bg-warning.p-4.rounded-lg.text-center
      [:div.ty-text-warning++.font-medium "ty-bg-warning"]
      [:div.ty-text-warning.text-sm "Base background"]]
     [:div.ty-bg-warning-.p-4.rounded-lg.text-center
      [:div.ty-text-warning++.font-medium "ty-bg-warning-"]
      [:div.ty-text-warning.text-sm "Softer background"]]]

    ;; Neutral backgrounds
    [:div.space-y-3
     [:h4.text-sm.font-medium.ty-text "Neutral Backgrounds"]
     [:div.ty-bg-neutral+.p-4.rounded-lg.text-center
      [:div.ty-text-neutral++.font-medium "ty-bg-neutral+"]
      [:div.ty-text-neutral.text-sm "Stronger background"]]
     [:div.ty-bg-neutral.p-4.rounded-lg.text-center
      [:div.ty-text-neutral++.font-medium "ty-bg-neutral"]
      [:div.ty-text-neutral.text-sm "Base background"]]
     [:div.ty-bg-neutral-.p-4.rounded-lg.text-center
      [:div.ty-text-neutral++.font-medium "ty-bg-neutral-"]
      [:div.ty-text-neutral.text-sm "Softer background"]]]]])

;; ----------------------------------------------------------------------------
;; Custom flavors — define the tokens, get a themed component. The <style>
;; below is the whole integration: no per-component CSS, no JS.
;; ----------------------------------------------------------------------------

(def ^:private brand-tokens-css
  ".demo-brand-scope {
  /* text / border ramp */
  --ty-color-brand-strong: #115e59;
  --ty-color-brand: #0d9488;
  --ty-color-brand-soft: #2dd4bf;
  --ty-color-brand-faint: #99f6e4;
  --ty-border-brand: #0d9488;

  /* backgrounds */
  --ty-bg-brand-bold: #99f6e4;
  --ty-bg-brand: #ccfbf1;
  --ty-bg-brand-soft: #f0fdfa;

  /* solid button fills */
  --ty-solid-brand: #0d9488;
  --ty-solid-brand-strong: #0f766e;
  --ty-solid-brand-soft: #5eead4;
  --ty-solid-brand-hover: #0f766e;
  --ty-solid-brand-active: #134e4a;
  --ty-solid-brand-fg: white;
}")

(defn custom-flavors-demo []
  "Live proof: a flavor that ships with the app, not the library."
  [:div.ty-elevated.p-6.rounded-lg
   [:style brand-tokens-css]
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Custom Flavors"]
   [:p.ty-text-.mb-2
    "Flavors are open-ended. Any " [:code "flavor"] " string that isn't a built-in becomes a "
    [:strong "custom flavor"] ": define its design tokens ("
    [:code "--ty-color-X"] ", " [:code "--ty-bg-X"] ", " [:code "--ty-solid-X"]
    ") and components theme themselves — same shade ramp, hover, focus and "
    [:code "+"] "/" [:code "-"] " tones as the built-ins."]
   [:p.ty-text--.mb-6 {:style {:font-size "0.8125rem"}}
    "Everything below uses " [:code "flavor=\"brand\""]
    " — a flavor this page invented. The library ships no brand CSS; the tokens in the code block are the entire integration."]

   [:div.demo-brand-scope.space-y-4
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-2 "Buttons — solid / outlined / ghost"]
     [:div.flex.flex-wrap.items-center.gap-2
      [:ty-button {:flavor "brand"} "Brand"]
      [:ty-button {:flavor "brand" :appearance "outlined"} "Brand"]
      [:ty-button {:flavor "brand" :appearance "ghost"} "Brand"]]]
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-2 "Tone suffixes work too"]
     [:div.flex.flex-wrap.items-center.gap-2
      [:ty-button {:flavor "brand+"} "brand+"]
      [:ty-button {:flavor "brand"}  "brand"]
      [:ty-button {:flavor "brand-"} "brand-"]]]
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-2 "Tags"]
     [:div.flex.flex-wrap.items-center.gap-2
      [:ty-tag {:flavor "brand+"} "brand+"]
      [:ty-tag {:flavor "brand"}  "brand"]
      [:ty-tag {:flavor "brand-"} "brand-"]]]
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-2 "Graceful fallback — undefined flavors degrade to neutral"]
     [:div.flex.flex-wrap.items-center.gap-2
      [:ty-button {:flavor "mystery"} "flavor=\"mystery\""]
      [:ty-tag {:flavor "mystery"} "mystery"]]]]

   [:div.mt-6
    [:h4.text-sm.font-medium.ty-text.mb-2 "The entire integration"]
    (common/code-block brand-tokens-css "css")
    [:div.mt-3]
    (common/code-block "<ty-button flavor=\"brand\">Brand</ty-button>
<ty-button flavor=\"brand\" appearance=\"outlined\">Brand</ty-button>
<ty-tag flavor=\"brand+\">brand+</ty-tag>"
                       "html")]])

(defn surface-classes-demo []
  "Shows surface classes nested to demonstrate layering hierarchy"
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Surface Hierarchy"]
   [:p.ty-text-.mb-6 "Semantic surface classes nested to show layering and elevation hierarchy."]

   [:div.space-y-6
    ;; Nested surfaces demonstration - like Russian dolls.
    ;; Canvas is the page surface (no border); inner layers use the soft
    ;; border (--ty-color-neutral-faint) so the hierarchy reads from
    ;; surface elevation, not heavy outlines.
    [:div.ty-canvas.p-6.rounded-lg.relative
     [:div.absolute.top-2.left-3.text-xs.ty-text-.font-mono.opacity-75 "ty-canvas"]
     [:div.ty-content.p-6.rounded-lg.border.ty-border-soft.relative.mt-6
      [:div.absolute.top-2.left-3.text-xs.ty-text-.font-mono.opacity-75 "ty-content"]
      [:div.ty-elevated.p-6.rounded-lg.relative.mt-6
       [:div.absolute.top-2.left-3.text-xs.ty-text-.font-mono.opacity-75 "ty-elevated"]
       [:div.ty-floating.p-6.rounded-lg.relative.mt-6.text-center
        [:div.absolute.top-2.left-3.text-xs.ty-text-.font-mono.opacity-75 "ty-floating"]
        [:div.mt-4
         [:h4.ty-text++.font-medium.mb-2.flex.items-center.gap-2 [:ty-icon {:name "layers" :size "sm"}] "Surface Layers"]
         [:p.ty-text-.text-sm "Each surface sits inside the previous one, creating depth and visual hierarchy like Russian nesting dolls."]]]]]]

    ;; Individual surface descriptions
    [:div.grid.gap-4.md:grid-cols-2.lg:grid-cols-3
     [:div.ty-canvas.p-4.rounded-lg.text-center
      [:div.ty-text++.font-medium.mb-2 "ty-canvas"]
      [:div.ty-text-.text-sm "App background"]
      [:div.ty-text--.text-xs.mt-1 "Base layer"]]

     [:div.ty-content.p-4.rounded-lg.border.ty-border-soft.text-center
      [:div.ty-text++.font-medium.mb-2 "ty-content"]
      [:div.ty-text-.text-sm "Main areas"]
      [:div.ty-text--.text-xs.mt-1 "Content layer"]]

     [:div.ty-elevated.p-4.rounded-lg.text-center
      [:div.ty-text++.font-medium.mb-2 "ty-elevated"]
      [:div.ty-text-.text-sm "Cards, panels"]
      [:div.ty-text--.text-xs.mt-1 "Elevated layer"]]

     [:div.ty-floating.p-4.rounded-lg.text-center
      [:div.ty-text++.font-medium.mb-2 "ty-floating"]
      [:div.ty-text-.text-sm "Modals, tooltips"]
      [:div.ty-text--.text-xs.mt-1 "Floating layer"]]]

    ;; Visual hierarchy explanation
    [:div.ty-elevated.p-4.rounded-lg
     [:h4.text-sm.font-medium.ty-text.mb-3 "Layer Hierarchy Explanation"]
     [:div.space-y-2.text-sm.ty-text-
      [:div "• " [:strong.ty-text++ "ty-canvas"] " - Base application background, lowest elevation"]
      [:div "• " [:strong.ty-text++ "ty-content"] " - Main content areas, sits on canvas"]
      [:div "• " [:strong.ty-text++ "ty-elevated"] " - Cards, panels, forms - elevated with shadow"]
      [:div "• " [:strong.ty-text++ "ty-floating"] " - Modals, dropdowns, tooltips - highest elevation"]]]]])

(defn practical-examples []
  "Shows real-world component patterns using ty classes"
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Practical Component Examples"]
   [:p.ty-text-.mb-6 "Real-world patterns demonstrating proper ty class usage."]

   [:div.space-y-6
    ;; Alert examples
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-3 "Alert Components"]
     [:div.grid.gap-4.md:grid-cols-2.lg:grid-cols-3
      [:div.ty-bg-success-.ty-border-success.border.rounded-lg.p-4
       [:div.flex.items-center.gap-3
        [:ty-icon {:name "check-circle"
                   :size "sm"}]
        [:div
         [:div.ty-text-success++.font-medium "Success"]
         [:div.ty-text-success.text-sm "Operation completed successfully"]]]]

      [:div.ty-bg-danger-.ty-border-danger.border.rounded-lg.p-4
       [:div.flex.items-center.gap-3
        [:ty-icon {:name "alert-circle"
                   :size "sm"}]
        [:div
         [:div.ty-text-danger++.font-medium "Error"]
         [:div.ty-text-danger.text-sm "Something went wrong, please try again"]]]]

      [:div.ty-bg-warning-.ty-border-warning.border.rounded-lg.p-4
       [:div.flex.items-center.gap-3
        [:ty-icon {:name "alert-triangle"
                   :size "sm"}]
        [:div
         [:div.ty-text-warning++.font-medium "Warning"]
         [:div.ty-text-warning.text-sm "Please review before proceeding"]]]]

      [:div.ty-bg-neutral-.ty-border-neutral.border.rounded-lg.p-4
       [:div.flex.items-center.gap-3
        [:ty-icon {:name "info"
                   :size "sm"}]
        [:div
         [:div.ty-text-neutral++.font-medium "Information"]
         [:div.ty-text-neutral.text-sm "This is a helpful informational note"]]]]]]

    ;; Card example
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-3 "Card Component"]
     [:div.ty-elevated.p-6.rounded-lg
      [:h5.ty-text-primary++.text-lg.font-semibold.mb-2 "Card Title"]
      [:p.ty-text.mb-4 "This is a card component using ty-elevated for the surface and ty-text-primary++ for the title to create proper hierarchy."]
      [:div.flex.gap-3
       [:button.px-4.py-2.ty-bg-primary.ty-text-primary++.rounded.hover:ty-bg-primary+.transition-colors "Primary Action"]
       [:button.px-4.py-2.ty-bg-secondary.ty-text-secondary++.rounded.hover:ty-bg-secondary+.transition-colors "Secondary"]]]]

    ;; Status badges
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-3 "Status Badges"]
     [:div.flex.flex-wrap.gap-3
      [:span.px-3.py-1.ty-bg-success.ty-text-success++.rounded-full.text-sm.font-medium "Active"]
      [:span.px-3.py-1.ty-bg-warning.ty-text-warning++.rounded-full.text-sm.font-medium "Pending"]
      [:span.px-3.py-1.ty-bg-danger.ty-text-danger++.rounded-full.text-sm.font-medium "Failed"]
      [:span.px-3.py-1.ty-bg-neutral.ty-text-neutral++.rounded-full.text-sm.font-medium "Draft"]
      [:span.px-3.py-1.ty-bg-secondary.ty-text-secondary++.rounded-full.text-sm.font-medium "Archived"]
      [:span.px-3.py-1.ty-bg-primary.ty-text-primary++.rounded-full.text-sm.font-medium "Featured"]]]]])

(defn code-examples []
  "Shows code patterns for using ty classes"
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Code Examples"]
   [:p.ty-text-.mb-6 "Copy these patterns to use ty classes effectively in your components."]

   [:div.space-y-6
    ;; Alert pattern
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-2 "Alert Component Pattern"]
     (common/code-block "[:div.ty-bg-success-.ty-border-success.border.rounded-lg.p-4
  [:div.flex.items-center.gap-3
    [:ty-icon {:name \"check-circle\" :size \"sm\"}]
    [:div
      [:div.ty-text-success++.font-medium \"Success\"]
      [:div.ty-text-success.text-sm \"Message text\"]]]]"
                        "clojure")]

    ;; Card pattern
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-2 "Card Component Pattern"]
     (common/code-block "[:div.ty-elevated.p-6.rounded-lg
  [:h3.ty-text-primary++.text-lg.font-semibold \"Title\"]
  [:p.ty-text \"Body content with good contrast\"]
  [:div.ty-text-neutral-.text-sm \"Helper text\"]]"
                        "clojure")]

    ;; Form validation pattern
    [:div
     [:h4.text-sm.font-medium.ty-text.mb-2 "Form Validation Pattern"]
     (common/code-block "[:div.space-y-2
  [:input.ty-input.border.ty-border-danger]
  [:div.ty-text-danger.text-sm \"Error message\"]
  [:div.ty-text-danger-.text-xs \"Validation hint\"]]"
                        "clojure")]]])

(defn usage-guidelines []
  "Shows best practices for using ty classes"
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Usage Guidelines"]
   [:p.ty-text-.mb-6 "Best practices for effective use of the ty design system."]

   [:div.grid.gap-6.md:grid-cols-2
    [:div
     [:h4.text-sm.font-medium.ty-text-success.mb-3.flex.items-center.gap-2
      [:ty-icon {:name "check"
                 :size "sm"
                 :class "ty-text-success"}]
      "Do"]
     [:div.space-y-2.text-sm
      [:div.ty-text- "• Match semantic color to meaning (success for confirmations, danger for errors)"]
      [:div.ty-text- "• Pair strong text on soft backgrounds for good contrast"]
      [:div.ty-text- "• Test in both light and dark themes"]
      [:div.ty-text- "• Use ty-elevated for cards and panels"]
      [:div.ty-text- "• Follow the emphasis ladder: ++ strong > + bold > base > - soft > -- faint"]]]

    [:div
     [:h4.text-sm.font-medium.ty-text-danger.mb-3.flex.items-center.gap-2
      [:ty-icon {:name "x"
                 :size "sm"
                 :class "ty-text-danger"}]
      "Don't"]
     [:div.space-y-2.text-sm
      [:div.ty-text- "• Mix competing semantic colors"]
      [:div.ty-text- "• Use faint text on saturated backgrounds"]
      [:div.ty-text- "• Rely on color alone for meaning"]
      [:div.ty-text- "• Ignore accessibility contrast requirements"]
      [:div.ty-text- "• Use too many emphasis levels in one component"]]]]])

(defn css-architecture-explanation []
  "Critical section explaining why tyrell.css is required"
  [:div.space-y-6
   ;; Critical Warning Box
   [:div.ty-bg-primary-.border.ty-border-primary.p-6.rounded-xl.mb-8
    [:div.flex.items-start.gap-4
     [:ty-icon.ty-text-primary++.flex-shrink-0.mt-1 {:name "alert-triangle"
                                                     :size "lg"}]
     [:div
      [:h3.text-xl.font-bold.ty-text-primary++.mb-3 "tyrell.css is REQUIRED"]
      [:p.ty-text-primary.mb-3
       "Every setup below requires " [:code.ty-bg-primary.px-2.py-1.rounded.font-mono "tyrell.css"]
       ". Components depend on CSS variables defined in this stylesheet. Without it, components "
       [:strong "render but have no styling"] "."]
      [:div.p-4.rounded-lg
       [:p.text-sm.ty-text-primary++.font-medium.mb-2 "What breaks without tyrell.css:"]
       [:ul.space-y-1.text-sm.ty-text-primary
        [:li.flex.items-center.gap-1 [:ty-icon.ty-text-danger.flex-shrink-0 {:name "x-circle" :size "xs"}] "No colors (CSS variables undefined)"]
        [:li.flex.items-center.gap-1 [:ty-icon.ty-text-danger.flex-shrink-0 {:name "x-circle" :size "xs"}] "No layout (surface hierarchy missing)"]
        [:li.flex.items-center.gap-1 [:ty-icon.ty-text-danger.flex-shrink-0 {:name "x-circle" :size "xs"}] "No theme switching"]
        [:li.flex.items-center.gap-1 [:ty-icon.ty-text-danger.flex-shrink-0 {:name "x-circle" :size "xs"}] [:span "Utility classes (" [:code.font-mono "ty-bg-primary"] ") don't work"]]]]]]]

   ;; Architecture Explanation
   [:div.ty-elevated.p-6.rounded-xl
    [:h3.text-xl.font-semibold.ty-text.mb-4 "CSS Variable Architecture"]
    [:p.ty-text-.mb-4
     "ty uses CSS variables as design tokens. Components reference these variables for all styling."]
    [:div.grid.gap-4.md:grid-cols-2
     [:div.ty-content.p-4.rounded-lg
      [:h4.font-semibold.ty-text.mb-2.flex.items-center.gap-2
       [:span.ty-bg-primary.ty-text-primary++.w-8.h-8.rounded-full.flex.items-center.justify-center.text-sm "1"]
       "CSS Variables"]
      [:p.text-sm.ty-text-.mb-2 "Defined in tyrell.css:"]
      [:ul.space-y-1.text-xs.ty-text-
       [:li "• 180+ variables"]
       [:li "• 6 flavors × 5 emphasis levels (strong / bold / base / soft / faint)"]
       [:li "• Surface hierarchy (canvas / content / elevated / floating)"]
       [:li "• Light/dark mode (single seed drives both via tyrell-brand.css)"]]]
     [:div.ty-content.p-4.rounded-lg
      [:h4.font-semibold.ty-text.mb-2.flex.items-center.gap-2
       [:span.ty-bg-success.ty-text-success++.w-8.h-8.rounded-full.flex.items-center.justify-center.text-sm "2"]
       "Components Use Them"]
      [:p.text-sm.ty-text-.mb-2 "Reference variables:"]
      [:ul.space-y-1.text-xs.ty-text-
       [:li "• Web components"]
       [:li "• Utility classes"]
       [:li "• Your custom styles"]]]]
    [:div.mt-4
     (common/code-block
       "/* Components reference CSS variables from tyrell.css */
button {
  background: var(--ty-color-primary);          /* undefined without tyrell.css! */
  color: var(--ty-color-neutral-strong);        /* undefined without tyrell.css! */
}"
       "css")]]

   ;; Installation Reminder
   [:div.ty-bg-primary-.border.ty-border-primary.p-4.rounded-xl
    [:h4.font-semibold.ty-text-primary.mb-3 "Always Include tyrell.css First"]
    (common/code-block
      "<!-- CSS first (required) -->
<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css\">

<!-- Then JavaScript -->
<script src=\"https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js\"></script>"
      "html")]])

(defn view []
  (docs-page
   ;; Header
   [:div.text-center.mb-8
    [:h1.text-3xl.font-bold.ty-text.mb-4 "ty Design System"]
    [:p.text-lg.ty-text-.max-w-3xl.mx-auto.leading-relaxed
     "Explore the complete ty CSS class system with semantic colors, backgrounds, and surfaces. "
     "Built for consistency, accessibility, and automatic theme adaptation."]

    [:div.flex.flex-wrap.gap-3.justify-center.mt-6
     [:span.px-3.py-1.ty-bg-primary-.ty-text-primary.rounded-full.text-sm.font-medium "5-Variant System"]
     [:span.px-3.py-1.ty-bg-success-.ty-text-success.rounded-full.text-sm.font-medium "Semantic Colors"]
     [:span.px-3.py-1.ty-bg-warning-.ty-text-warning.rounded-full.text-sm.font-medium "Theme Adaptive"]
     [:span.px-3.py-1.ty-bg-neutral-.ty-text-neutral.rounded-full.text-sm.font-medium "Accessible"]]]

   ;; Theme toggle
   (theme-toggle)

   ;; Main content sections — single-column flow
   (text-variants-demo)
   (background-variants-demo)
   (custom-flavors-demo)
   (surface-classes-demo)
   (practical-examples)
   (code-examples)
   (css-architecture-explanation)
   (usage-guidelines)

   ;; Footer summary
   [:div.ty-elevated.p-6.rounded-lg.text-center
    [:h4.text-lg.font-semibold.ty-text.mb-2.flex.items-center.gap-2 "Ready to Use" [:ty-icon {:name "sparkles" :size "sm"}]]
    [:p.ty-text-
     "The ty design system provides a complete set of semantic CSS classes for building consistent, "
     "accessible, and beautiful user interfaces. All classes automatically adapt between light and dark themes "
     "while maintaining proper contrast ratios."]]))
