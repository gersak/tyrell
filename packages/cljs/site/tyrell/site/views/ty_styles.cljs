(ns tyrell.site.views.ty-styles
  "Site view showcasing ty CSS classes and design system"
  (:require
   [clojure.string :as str]
   [tyrell.router :as router]
   [tyrell.site.state :as state]
   [tyrell.site.docs.theming :as theming]
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
;; Borders — own family, own L ladder (2026-08 restructure). Used to alias
;; --ty-color-neutral-*, which meant tuning the text emphasis curve or
;; --ty-neutral-l-factor silently dragged every card/divider border with it.
;; --ty-l-border-* are independent dials now; same public class names.
;; ----------------------------------------------------------------------------

(def ^:private layer-flavors
  ["primary" "success" "danger" "warning" "neutral"])

;; NOTE: surface utility classes (.ty-content/.ty-elevated/...) set their own
;; `border: ... !important` shorthand, which beats .ty-border-{flavor}/-soft/
;; -faint (plain border-color, no !important — a real inconsistency with
;; .ty-border/-+/-++, which DO carry !important). Using inline background
;; here instead of the .ty-content CLASS sidesteps that collision entirely.
(defn- border-swatch [suffix token]
  [:div.flex.flex-col.items-center.gap-2 {:key (str "border" suffix)}
   [:div.w-16.h-16.rounded-lg {:class (str "ty-border" suffix)
                               :style {:background "var(--ty-surface-content)"
                                       :border-width "var(--ty-border-width, 1px)"
                                       :border-style "solid"}}]
   [:code.ty-text-.text-xs.font-mono (str "ty-border" suffix)]
   [:code.ty-text--.text-xs.font-mono (str "--ty-l-border" (when (seq token) (str "-" token)))]])

(defn borders-demo
  "Generic border ladder — independent lightness dials, not a text-ramp alias."
  []
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Borders"]
   [:p.ty-text-.mb-2
    "Borders are their own family, not a shade of text. " [:code "ty-border"] " through "
    [:code "ty-border--"] " share the same 5-step suffix as the text ladder, but resolve from "
    "independent " [:code "--ty-l-border-*"] " dials — reshaping text emphasis, or "
    "tuning " [:code "--ty-neutral-l-factor"] ", no longer moves app chrome along with it."]
   [:div.flex.flex-wrap.gap-6.my-6
    (for [[suffix token] [["++" "strong"] ["+" "bold"] ["" ""] ["-" "soft"] ["--" "faint"]]]
      (border-swatch suffix token))]
   [:p.ty-text-.mb-2.mt-6 "Per-flavor accent borders still track that flavor's own ink:"]
   [:div.flex.flex-wrap.gap-4
    (for [f layer-flavors]
      [:div.flex.flex-col.items-center.gap-2 {:key f}
       [:div.w-16.h-16.rounded-lg {:class (str "ty-border-" f)
                                   :style {:background "var(--ty-surface-content)"
                                           :border-width "var(--ty-border-width, 1px)"
                                           :border-style "solid"}}]
       [:code.ty-text-.text-xs.font-mono (str "ty-border-" f)]])]])

;; ----------------------------------------------------------------------------
;; Solid fills + muted — this session's headline changes. Solid is its own
;; color system (not the text ramp); its foreground is now COMPUTED per fill
;; via --ty-solid-fg-threshold, not fixed white. `muted` is a fourth axis,
;; orthogonal to flavor/appearance: suppress to neutral until hovered/pressed.
;; ----------------------------------------------------------------------------

(defn solid-muted-demo
  "Solid fills (auto-contrast foreground) + the muted attribute."
  []
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Solid Fills & Muted"]
   [:p.ty-text-.mb-2
    "Solid text is computed, not fixed white: each fill picks black or white from its OWN "
    "lightness (" [:code "--ty-solid-fg-threshold"] ", default " [:code "0.6"] "), so a pale "
    [:code "flavor=\"…-\""] " tone can't end up with unreadable text by accident. Watch the "
    "soft (−) column below flip to dark text on the lighter fills."]
   [:div.grid.gap-3.mb-2 {:style {:grid-template-columns "6rem repeat(3, max-content)"}}
    [:div] [:div.text-xs.ty-text-.font-medium "Soft (−)"] [:div.text-xs.ty-text-.font-medium "Base"]
    [:div.text-xs.ty-text-.font-medium "Strong (+)"]
    (for [f layer-flavors]
      (list
       [:div.text-sm.font-mono.ty-text {:key (str f "-label")} f]
       [:ty-button {:key (str f "-soft") :flavor (str f "-")} f]
       [:ty-button {:key (str f "-base") :flavor f} f]
       [:ty-button {:key (str f "-strong") :flavor (str f "+")} f]))]
   [:p.ty-text-.mt-6.mb-2
    [:code "muted"] " suppresses the flavor to neutral at rest, revealing it on hover "
    "(pointer devices only — " [:code "@media (hover: hover)"] ") or on press, so touch "
    "still gets the real color on tap:"]
   [:div.flex.flex-wrap.gap-3
    (for [f layer-flavors]
      [:ty-button {:key f :flavor f :muted true} f])]])

;; ----------------------------------------------------------------------------
;; Input — a composite of the families above, not a fifth color system.
;; ----------------------------------------------------------------------------

(defn input-demo
  "ty-input/ty-select assemble surface + border + ink — they define nothing new."
  []
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Input"]
   [:p.ty-text-.mb-4
    [:code "ty-input"] " / " [:code "ty-select"] " read " [:code "--ty-surface-input"] " for "
    "background, the border ladder above for their edge, and a flavor's ink ramp for focus — "
    "they don't define their own colors, they assemble the families above."]
   [:div.grid.gap-3.sm:grid-cols-2.lg:grid-cols-3
    [:ty-input {:placeholder "Default"}]
    [:ty-input {:flavor "primary" :placeholder "Primary"}]
    [:ty-input {:flavor "danger" :placeholder "Danger" :error "Required"}]]])

;; ----------------------------------------------------------------------------
;; Scrollbars — deliberately outside the OKLCH engine: alpha overlays, no
;; hue/chroma to retint, just an opacity to tune.
;; ----------------------------------------------------------------------------

(defn scrollbar-demo
  "The one layer left unwired to the color engine on purpose."
  []
  [:div.ty-elevated.p-6.rounded-lg
   [:h3.text-lg.font-semibold.ty-text.mb-4 "Scrollbars"]
   [:p.ty-text-.mb-4
    [:code "--ty-scrollbar-thumb"] " / " [:code "-track"] " are plain alpha overlays, not "
    "hue/chroma tokens — there's no color to retint here, just an opacity to tune."]
   [:ty-scroll-container {:max-height "140px" :custom-scrollbar ""}
    [:div.space-y-2.pr-2
     (for [i (range 1 9)]
       [:p.ty-text-.text-sm {:key i} (str "Scrollable line " i)])]]])

;; ----------------------------------------------------------------------------
;; Brand flavor — THE showcase. One attribute (flavor="brand"), one design
;; token (the color picker), and every component follows: hover, focus,
;; tones, light/dark. Built-in chips prove the same axis drives stock
;; flavors. This replaces the former separate "flavor axis" and "custom
;; flavors" sections.
;; ----------------------------------------------------------------------------

(def ^:private built-in-flavors
  ["primary" "success" "danger" "warning" "neutral"])

(defn- fp-flavor [] (get-in @state/state [:flavor-picker :flavor] "brand"))
(defn- fp-tone []   (get-in @state/state [:flavor-picker :tone] ""))
(defn- fp-hex []    (get-in @state/state [:flavor-picker :hex] "#6b3d71"))
(defn- fp-value []  (str (fp-flavor) (fp-tone)))

(defn- fp-set-flavor! [f] (swap! state/state assoc-in [:flavor-picker :flavor] f))
(defn- fp-set-tone!   [t] (swap! state/state assoc-in [:flavor-picker :tone] t))
(defn- fp-set-hex!    [^js e]
  (swap! state/state assoc-in [:flavor-picker :hex] (.. e -target -value)))

;; One custom flavor, "brand", seeded by a single COLOR and run through the
;; ENGINE — the same seed-ingestion path every user takes (see the Theming
;; page's Flavor pack builder; the ramp lines are shared code). The seed
;; contributes hue + chroma only; every shade's lightness comes from the
;; mode-flipped L-curve. That's why any picked color — light or dark —
;; gets correct dark mode, correct +/− tones, correct input state ladder
;; and auto-contrast text, with NO dark block here at all.
(def ^:private flavor-picker-scope-css
  (str ".flavor-picker-scope {\n"
       "  --ty-brand-seed: var(--fp-brand-base);\n"
       (str/join "\n" (theming/flavor-pack-ramp-lines "brand"))
       "\n}"))

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

;; Shown, not run — the live demo runs the identical ramp via
;; flavor-picker-scope-css (shared generator, so they can't drift).
(def ^:private brand-integration-css
  ":root {
  /* the one color you pick — its hue+chroma
     seed the flavor; every shade's LIGHTNESS
     comes from the engine's mode-flipped
     curve, so dark mode, +/− tones and
     auto-contrast text are correct for any
     seed. No dark block needed. */
  --ty-brand-seed: #6b3d71;
}

html:root, [data-ty-theme] {
  --ty-color-brand:
    oklch(from var(--ty-brand-seed)
      calc(var(--ty-l-base)
           * var(--ty-brand-l-factor, 1))
      calc(c * var(--ty-c-base-mult)) h);

  /* …remaining tokens: same pattern —
     copy the full pack from the Theming
     page's Flavor pack builder */
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
    "correct, not a bug. This demo runs the real seed-ingestion engine — build your own "
    "pack on the "
    [:a.ty-text-primary {:href "#"
                         :on {:click (fn [^js e]
                                       (.preventDefault e)
                                       (router/navigate! :tyrell.site.docs/theming))}}
     "Theming"] " page."]])

;; ----------------------------------------------------------------------------
;; Typography & shape — live font-family / border-radius override demo. Same
;; "minimal variable surface" point as brand-flavor-demo, but for the two
;; tokens that aren't color. No derivation machinery needed here (unlike the
;; OKLCH brand ramp) — --ty-font-sans and --ty-radius-{base,md} are the
;; literal tokens components already read; this just sets them directly on a
;; scoped container.
;; ----------------------------------------------------------------------------

(def ^:private font-presets
  [["sans" "Sans (default)" nil]
   ["serif" "Serif" "Georgia, Cambria, \"Times New Roman\", Times, serif"]
   ["mono" "Monospace" "\"JetBrains Mono\", \"Fira Code\", ui-monospace, SFMono-Regular, monospace"]])

(def ^:private radius-presets
  [["0" "Sharp"]
   ["4" "Subtle"]
   ["8" "Default"]
   ["16" "Soft"]
   ["9999" "Pill"]])

(defn- tp-font []   (get-in @state/state [:typography-picker :font] "sans"))
(defn- tp-radius [] (get-in @state/state [:typography-picker :radius] "8"))
(defn- tp-set-font!   [f] (swap! state/state assoc-in [:typography-picker :font] f))
(defn- tp-set-radius! [r] (swap! state/state assoc-in [:typography-picker :radius] r))

(defn- tp-font-value []
  (some (fn [[k _ v]] (when (= k (tp-font)) v)) font-presets))

(defn- typography-picker-style []
  (cond-> {"--ty-radius-base" (str (tp-radius) "px")
           "--ty-radius-md"   (str (tp-radius) "px")}
    (tp-font-value) (assoc "--ty-font-sans" (tp-font-value))))

(defn- picker-chip [selected? label on-click]
  [:ty-button {:size "xs" :flavor "neutral"
               :appearance (if selected? "solid" "outlined")
               :on {:click on-click}}
   label])

(defn- typography-live-grid []
  [:div.space-y-4
   [:div.flex.flex-wrap.items-center.gap-2
    [:ty-button {:flavor "primary"} "Primary"]
    [:ty-button {:flavor "neutral" :appearance "outlined"} "Neutral"]
    [:ty-tag {:flavor "primary"} "Tag"]]
   [:div.grid.gap-3.sm:grid-cols-2
    [:ty-input {:label "Name" :placeholder "Type here…"}]
    [:ty-select {:label "Country" :placeholder "Choose…"}
     [:ty-option {:value "a"} "Option A"]
     [:ty-option {:value "b"} "Option B"]]]
   [:ty-date-picker {:label "Date" :value "2026-07-17"}]])

(defn- typography-integration-css []
  (str ":root {\n"
       (when-let [v (tp-font-value)] (str "  --ty-font-sans: " v ";\n"))
       "  --ty-radius-base: " (tp-radius) "px;\n"
       "  --ty-radius-md: " (tp-radius) "px;\n"
       "}"))

(defn typography-shape-demo
  "Live font-family + border-radius override — same point as brand-flavor-demo
   (a handful of CSS variables control everything), minus the OKLCH shape."
  []
  [:div.ty-elevated.p-6.rounded-lg
   {:style (typography-picker-style)}
   [:h3.text-lg.font-semibold.ty-text.mb-2 "Type & Shape. Two Variables."]
   [:p.ty-text-.mb-4
    "No color-mix ramp needed here — " [:code "--ty-font-sans"] " and "
    [:code "--ty-radius-{base,md}"] " are the literal tokens every component "
    "already reads. Change them once, everything below follows — including "
    "the field " [:code "label"] ", not just the input text."]

   [:div.flex.flex-wrap.items-center.gap-x-6.gap-y-3.mb-8
    [:div.flex.items-center.gap-2
     [:span.ty-text--.text-xs "Font"]
     (for [[k label _] font-presets]
       (picker-chip (= k (tp-font)) label (fn [_] (tp-set-font! k))))]
    [:div.flex.items-center.gap-2
     [:span.ty-text--.text-xs "Radius"]
     (for [[v label] radius-presets]
       (picker-chip (= v (tp-radius)) label (fn [_] (tp-set-radius! v))))]]

   [:div.grid.gap-6.lg:grid-cols-2
    (typography-live-grid)
    [:div.space-y-3
     (common/section-label "The entire integration")
     (common/code-block (typography-integration-css) "css")]]])

(defn css-architecture-explanation
  "Critical warning: components render unstyled without tyrell.css + tyrell-theme.css"
  []
  [:div.ty-bg-primary-.border.ty-border-primary.p-6.rounded-xl
   [:div.flex.items-start.gap-4
    [:ty-icon.ty-text-primary++.flex-shrink-0.mt-1 {:name "alert-triangle"
                                                    :size "lg"}]
    [:div
     [:h3.text-xl.font-bold.ty-text-primary++.mb-3 "tyrell.css + tyrell-theme.css are REQUIRED"]
     [:p.ty-text-primary.mb-3
      "Every setup below requires both " [:code.ty-bg-primary.px-2.py-1.rounded.font-mono "tyrell.css"]
      " (structure) and " [:code.ty-bg-primary.px-2.py-1.rounded.font-mono "tyrell-theme.css"]
      " (every color token — tyrell.css itself has none). Without both, components "
      [:strong "render but have no styling"] "."]
     [:div.p-4.rounded-lg
      [:p.text-sm.ty-text-primary++.font-medium.mb-2 "What breaks without them:"]
      [:ul.space-y-1.text-sm.ty-text-primary
       [:li.flex.items-center.gap-1 [:ty-icon.ty-text-danger.flex-shrink-0 {:name "x-circle" :size "xs"}] "No colors (CSS variables undefined without tyrell-theme.css)"]
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
   (borders-demo)
   (solid-muted-demo)
   (input-demo)
   (scrollbar-demo)
   (brand-flavor-demo)
   (typography-shape-demo)
   (css-architecture-explanation)

   ;; Footer summary
   [:div.ty-elevated.p-6.rounded-lg.text-center
    [:h4.text-lg.font-semibold.ty-text.mb-2.flex.items-center.gap-2 "Ready to Use" [:ty-icon {:name "sparkles" :size "sm"}]]
    [:p.ty-text-
     "The ty design system provides a complete set of semantic CSS classes for building consistent, "
     "accessible, and beautiful user interfaces. All classes automatically adapt between light and dark themes "
     "while maintaining proper contrast ratios."]]))
