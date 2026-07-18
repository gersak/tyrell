(ns tyrell.site.views.ty-styles
  "Site view showcasing ty CSS classes and design system"
  (:require
   [clojure.string]
   [tyrell.router :as router]
   [tyrell.site.state :as state]
   [tyrell.site.docs.common :as common :refer [docs-page]]))

(defn theme-toggle
  "Simple theme toggle section"
  []
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

(defn text-variants-demo
  "Shows the 5-variant text system, including the suffix → token mapping."
  []
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

(defn background-variants-demo
  "Shows the 3-variant background system"
  []
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

(defn surface-classes-demo
  "Shows surface classes nested to demonstrate layering hierarchy"
  []
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

;; ----------------------------------------------------------------------------
;; Brand flavor — THE showcase. One attribute (flavor="brand"), one design
;; token (the color picker), and every component follows: hover, focus,
;; tones, light/dark. Built-in chips prove the same axis drives stock
;; flavors. This replaces the former separate "flavor axis" and "custom
;; flavors" sections.
;; ----------------------------------------------------------------------------

(def ^:private built-in-flavors
  ["primary" "secondary" "success" "danger" "warning" "neutral"])

(defn- fp-flavor [] (get-in @state/state [:flavor-picker :flavor] "brand"))
(defn- fp-tone []   (get-in @state/state [:flavor-picker :tone] ""))
(defn- fp-hex []    (get-in @state/state [:flavor-picker :hex] "#7c3aed"))
(defn- fp-value []  (str (fp-flavor) (fp-tone)))

(defn- fp-set-flavor! [f] (swap! state/state assoc-in [:flavor-picker :flavor] f))
(defn- fp-set-tone!   [t] (swap! state/state assoc-in [:flavor-picker :tone] t))
(defn- fp-set-hex!    [^js e]
  (swap! state/state assoc-in [:flavor-picker :hex] (.. e -target -value)))

;; One custom flavor, "brand", entirely derived from a single base color via
;; color-mix() — the CSS text never changes; only --fp-brand-base does. This
;; is the "one color in, full ramp out" pattern for custom flavors: built-ins
;; get their ramp from the OKLCH brand layer, a custom flavor can get the
;; same shape from color-mix() in three lines per token.
;;
;; The -soft/-faint/-bg tokens mix toward white for light-mode tints; in dark
;; mode that reads as a near-white patch against dark surfaces (worst on
;; ty-tag, which fills a real background with --ty-bg-brand), so html.dark
;; flips those same tokens to mix toward black instead. -strong/solid tokens
;; already mix toward black and read fine in both themes.
(def ^:private flavor-picker-scope-css
  ".flavor-picker-scope {
  --ty-color-brand: var(--fp-brand-base);
  --ty-color-brand-strong: color-mix(in oklab, var(--fp-brand-base) 80%, black);
  --ty-color-brand-soft: color-mix(in oklab, var(--fp-brand-base) 55%, white);
  --ty-color-brand-faint: color-mix(in oklab, var(--fp-brand-base) 30%, white);
  --ty-bg-brand: color-mix(in oklab, var(--fp-brand-base) 12%, white);
  --ty-bg-brand-bold: color-mix(in oklab, var(--fp-brand-base) 24%, white);
  --ty-bg-brand-soft: color-mix(in oklab, var(--fp-brand-base) 6%, white);
  --ty-solid-brand: var(--fp-brand-base);
  --ty-solid-brand-hover: color-mix(in oklab, var(--fp-brand-base) 85%, black);
  --ty-solid-brand-active: color-mix(in oklab, var(--fp-brand-base) 70%, black);
  --ty-solid-brand-strong: color-mix(in oklab, var(--fp-brand-base) 80%, black);
  --ty-solid-brand-soft: color-mix(in oklab, var(--fp-brand-base) 55%, white);
  --ty-solid-brand-fg: white;
}
html.dark .flavor-picker-scope {
  --ty-color-brand-soft: color-mix(in oklab, var(--fp-brand-base) 55%, black);
  --ty-color-brand-faint: color-mix(in oklab, var(--fp-brand-base) 25%, black);
  --ty-bg-brand: color-mix(in oklab, var(--fp-brand-base) 18%, black);
  --ty-bg-brand-bold: color-mix(in oklab, var(--fp-brand-base) 30%, black);
  --ty-bg-brand-soft: color-mix(in oklab, var(--fp-brand-base) 10%, black);
}")

(defn- flavor-chip [flavor label]
  [:ty-tag (cond-> {:flavor flavor :clickable "true"
                    :on {:click (fn [_] (fp-set-flavor! flavor))}}
             (= flavor (fp-flavor)) (assoc :selected ""))
   label])

(defn- tone-toggle []
  [:div.flex.items-center.gap-1
   (for [[label tone] [["−" "-"] ["base" ""] ["+" "+"]]]
     [:ty-button {:size "xs"
                  :flavor (fp-flavor)
                  :appearance (if (= tone (fp-tone)) "solid" "ghost")
                  :on {:click (fn [_] (fp-set-tone! tone))}}
      label])])

(defn- brand-live-grid []
  (let [v (fp-value)]
    [:div.space-y-5
     [:div.flex.flex-wrap.items-center.gap-2
      [:ty-button {:flavor v} "Solid"]
      [:ty-button {:flavor v :appearance "outlined"} "Outlined"]
      [:ty-button {:flavor v :appearance "ghost"} "Ghost"]
      [:ty-tag {:flavor v} v]]
     [:div.flex.flex-wrap.items-center.gap-x-5.gap-y-2
      [:label.flex.items-center.gap-2.cursor-pointer [:ty-switch {:flavor v :checked ""}] [:span.ty-text-.text-sm "Switch"]]
      [:label.flex.items-center.gap-2.cursor-pointer [:ty-checkbox {:flavor v :checked ""}] [:span.ty-text-.text-sm "Checkbox"]]
      [:ty-radio-group.flex.items-center {:flavor v :name "flavor-picker-radio" :value "b"}
       [:label.flex.items-center.gap-1.mr-3.cursor-pointer [:ty-radio {:value "a"}] [:span.ty-text-.text-sm "A"]]
       [:label.flex.items-center.gap-1.cursor-pointer [:ty-radio {:value "b"}] [:span.ty-text-.text-sm "B"]]]]
     [:div.grid.gap-3.sm:grid-cols-2
      [:ty-input {:flavor v :placeholder "Themed input"}]
      [:ty-select {:flavor v :placeholder "Themed select"}
       [:ty-option {:value "a"} "Option A"]
       [:ty-option {:value "b"} "Option B"]]]
     [:ty-date-picker {:flavor v :value "2026-07-17"}]
     [:ty-copy {:flavor v :value (fp-hex)}]
     [:div.flex.flex-wrap.items-center.gap-2
      [:ty-button {:flavor v} "Hover me" [:ty-tooltip {:flavor v} "Themed tooltip"]]
      [:ty-button {:flavor "mystery" :appearance "outlined"} "flavor=\"mystery\""]
      [:span.ty-text--.text-xs "← undefined flavors degrade to neutral"]]]))

;; Shown, not run — the live demo derives the same ramp from the color
;; picker via flavor-picker-scope-css. Keep the two in sync.
(def ^:private brand-integration-css
  ":root {
  /* the one color you pick */
  --brand: #7c3aed;

  --ty-color-brand: var(--brand);
  --ty-solid-brand: var(--brand);
  --ty-solid-brand-fg: white;
  --ty-solid-brand-hover:
    color-mix(in oklab,
      var(--brand) 85%, black);
  --ty-bg-brand:
    color-mix(in oklab,
      var(--brand) 12%, white);

  /* …remaining tokens: same pattern */
}")

(defn brand-flavor-demo
  "THE flavor showcase: brand propagation + customization in one section."
  []
  [:div.ty-elevated.p-6.rounded-lg.flavor-picker-scope
   {:style {"--fp-brand-base" (fp-hex)}}
   [:style flavor-picker-scope-css]
   [:h3.text-lg.font-semibold.ty-text.mb-2 "Your Brand. One Attribute."]
   [:p.ty-text-.mb-4
    "Flavors are open-ended: " [:code "flavor=\"brand\""] " isn't in the library — its only "
    "design token is the color picker below. Define a handful of CSS variables and every "
    "component follows: hover, focus, " [:code "+"] "/" [:code "−"] " tones, light and dark. "
    "No JS theme object, no build step, works server-rendered."]

   [:div.flex.flex-wrap.items-center.gap-x-4.gap-y-3.mb-8
    [:div.flex.items-center.gap-1
     (flavor-chip "brand" "brand")
     [:input {:type "color" :value (fp-hex)
              :style {:width "1.75rem" :height "1.75rem" :padding "0" :border "none"
                      :border-radius "0.375rem" :cursor "pointer" :background "none"}
              :on {:input fp-set-hex!}}]]
    [:div.flex.flex-wrap.gap-2
     (for [f built-in-flavors] (flavor-chip f f))]
    [:div.ml-auto (tone-toggle)]]

   [:div.grid.gap-6.lg:grid-cols-2
    (brand-live-grid)
    [:div.space-y-3
     (common/section-label "The entire integration")
     (common/code-block brand-integration-css "css")
     (common/code-block "<ty-button flavor=\"brand\">
  Checkout
</ty-button>" "html")]]

   [:div.mt-6.pt-4.border-t.ty-border-soft
    (common/section-label "The same job elsewhere")
    [:div.grid.gap-x-6.gap-y-1.sm:grid-cols-2.mt-2.text-sm
     [:div [:span.ty-text.font-medium "Material UI"] [:span.ty-text- " — createTheme() + ThemeProvider, JS, React-only"]]
     [:div [:span.ty-text.font-medium "Shoelace / Web Awesome"] [:span.ty-text- " — variant names are a fixed enum; new ones need per-component overrides"]]
     [:div [:span.ty-text.font-medium "Tailwind"] [:span.ty-text- " — edit config, re-run the build"]]
     [:div [:span.ty-text.font-medium "ty"] [:span.ty-text- " — a dozen CSS custom properties, scoped anywhere the cascade reaches"]]]]

   [:p.ty-text--.mt-4 {:style {:font-size "0.8125rem"}}
    "Note: " [:code "neutral"] " renders as unstyled default chrome for input/date-picker — "
    "correct, not a bug. The " [:code "color-mix()"] " ramp here is the quick path; the "
    "production per-flavor OKLCH ramp lives on the "
    [:a.ty-text-primary {:href "#"
                         :on {:click (fn [^js e]
                                       (.preventDefault e)
                                       (router/navigate! :tyrell.site.docs/theming))}}
     "Theming"] " page."]])

(defn css-architecture-explanation
  "Critical warning: components render unstyled without tyrell.css"
  []
  [:div.ty-bg-primary-.border.ty-border-primary.p-6.rounded-xl
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
       [:li.flex.items-center.gap-1 [:ty-icon.ty-text-danger.flex-shrink-0 {:name "x-circle" :size "xs"}] [:span "Utility classes (" [:code.font-mono "ty-bg-primary"] ") don't work"]]]]]]])

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
   (surface-classes-demo)
   (brand-flavor-demo)
   (css-architecture-explanation)

   ;; Footer summary
   [:div.ty-elevated.p-6.rounded-lg.text-center
    [:h4.text-lg.font-semibold.ty-text.mb-2.flex.items-center.gap-2 "Ready to Use" [:ty-icon {:name "sparkles" :size "sm"}]]
    [:p.ty-text-
     "The ty design system provides a complete set of semantic CSS classes for building consistent, "
     "accessible, and beautiful user interfaces. All classes automatically adapt between light and dark themes "
     "while maintaining proper contrast ratios."]]))
