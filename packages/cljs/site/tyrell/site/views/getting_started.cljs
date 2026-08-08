(ns tyrell.site.views.getting-started
  (:require [tyrell.router :as router]
            [tyrell.site.docs.common :as common]))

;; =============================================================================
;; Hero
;; =============================================================================

(defn hero []
  [:div.text-center.mb-12
   [:div.inline-flex.items-center.gap-3.mb-4
    [:div.flex.items-center.justify-center.rounded-xl.ty-bg-primary-
     {:style {:width "44px"
              :height "44px"}}
     [:ty-icon.ty-text-primary+
      {:name "rocket"
       :size "lg"}]]
    [:h1.text-4xl.font-bold.ty-text++.tracking-tight "Getting started"]]
   [:p.text-xl.ty-text.mb-3.font-normal "Pick the stack you're working with."]
   [:p.text-xs.ty-text--.tracking-widest.uppercase.font-semibold
    "22 components · 3000+ icons · framework-agnostic"]])

;; =============================================================================
;; Hero stack card — JavaScript / TypeScript
;; =============================================================================

(defn feature-pill
  "Small chip with mini icon + label, sits on ty-content surface."
  [{:keys [icon label]}]
  [:div.inline-flex.items-center.gap-1.5.px-2.5.py-1.rounded-full.ty-content
   {:style {:border "1px solid var(--ty-border-)"}}
   [:ty-icon.ty-text-primary {:name icon
                             :size "xs"}]
   [:span.text-xs.font-medium.ty-text label]])

(defn brand-glyph
  "Brand silhouette — softer baseline (ty-text-), scales + lights up to primary on hover."
  [{:keys [icon title]}]
  [:div.flex.items-center.justify-center.transition-all.duration-200.rounded-lg.cursor-default.ty-text--.hover:ty-text-primary.hover:scale-110
   {:style {:width "40px"
            :height "40px"}
    :title title}
   [:ty-icon {:name icon
              :size "lg"}]])

(defn lift-card-style
  "Inline style that keeps a card on its own GPU compositing layer at rest,
   so the hover transform doesn't re-rasterize text or borders inside.
   Pair with the lift-card-handlers below."
  []
  {:border "1px solid var(--ty-border-)"
   :transform "translateZ(0)"
   :will-change "transform"
   :backface-visibility "hidden"
   :transition "transform 200ms ease, box-shadow 200ms ease"})

(defn lift-card-handlers
  "Mouseenter/mouseleave handlers that toggle translate3d on hover.
   Merge with the card's existing :on map."
  []
  {:mouseenter (fn [^js e]
                 (set! (.. e -currentTarget -style -transform)
                       "translate3d(0, -2px, 0)"))
   :mouseleave (fn [^js e]
                 (set! (.. e -currentTarget -style -transform)
                       "translateZ(0)"))})

(defn js-hero-card []
  ;; No lift on the hero card — it contains interactive components on the right.
  ;; Lifting would drag the live <ty-input>/<ty-button> with it, which reads as the
  ;; button itself lifting. Shadow change alone is the right hover signal here.
  [:div.ty-elevated.rounded-2xl.cursor-pointer.hover:shadow-xl.relative.overflow-hidden.transition-shadow.duration-200
   {:style {:border "1px solid var(--ty-border-)"}
    :on {:click #(router/navigate! :tyrell.site.docs/javascript)}}

   ;; Accent strip — visual signal that this is the headline option
   [:div.absolute.top-0.left-0.right-0.h-2.ty-bg-primary+]

   [:div.p-6.lg:p-8

    ;; Two-column body: message on the left, live preview + code on the right
    [:div.grid.grid-cols-1.md:grid-cols-2.gap-8.mb-6

     ;; LEFT — message
     [:div.flex.flex-col

      ;; Eyebrow
      [:div.flex.items-center.gap-2.mb-5
       [:span.text-xs.font-bold.ty-text-primary.tracking-widest.uppercase "Recommended"]
       [:span.h-1.w-1.rounded-full.ty-bg-neutral]
       [:span.text-xs.font-medium.ty-text--.tracking-widest.uppercase "Most popular"]]

      ;; Title + icon
      [:div.flex.items-start.gap-4.mb-5
       [:div.flex.items-center.justify-center.rounded-xl.ty-bg-primary-.flex-shrink-0
        {:style {:width "56px"
                 :height "56px"}}
        [:ty-icon.ty-text-primary++ {:name "code"
                                    :size "lg"}]]
       [:div.flex-1.min-w-0
        [:h3.text-3xl.font-bold.ty-text++.tracking-tight.leading-tight.mb-2
         "JavaScript / TypeScript"]
        [:p.text-base.ty-text.font-normal.leading-relaxed
         "Web components for every framework. Typed React wrappers when you want them."]]]

      ;; Feature pills
      [:div.flex.flex-wrap.gap-2.mb-6
       (feature-pill {:icon "code"
                      :label "TypeScript types"})
       (feature-pill {:icon "layers"
                      :label "Tree-shakeable"})
       (feature-pill {:icon "box"
                      :label "Web Components"})
       (feature-pill {:icon "shuffle"
                      :label "Any framework"})]

      ;; Spacer pushes CTA to the bottom on md+
      [:div.flex-1]

      ;; CTA
      [:div.flex.items-center.gap-2.text-base.font-semibold.ty-text-primary
       [:span "Read the JS / TypeScript guide"]
       [:ty-icon {:name "arrow-right"
                  :size "sm"}]]]

     ;; RIGHT — live preview + code
     ;; stopPropagation so interacting with the demo doesn't trigger the card-level navigate
     [:div.flex.flex-col.gap-4
      {:on {:click (fn [e] (.stopPropagation e))}}

      ;; Live component preview on ty-floating (highest surface)
      [:div.ty-floating.rounded-xl.p-5
       {:style {:border "1px solid var(--ty-border-)"}}
       ;; "PREVIEW · live" header
       [:div.flex.items-center.justify-between.mb-4
        [:span.text-xs.font-bold.ty-text--.tracking-widest.uppercase "Preview"]
        [:div.flex.items-center.gap-1.5
         [:div.rounded-full.ty-bg-success.animate-pulse
          {:style {:width "6px"
                   :height "6px"}}]
         [:span.text-xs.ty-text--.font-medium.tracking-wide.uppercase "live"]]]
       ;; Actual live components
       [:div.flex.flex-col.gap-3
        [:ty-input {:label "Email"
                    :placeholder "you@example.com"}
         [:ty-icon {:slot "start"
                    :name "mail"
                    :size "sm"}]]
        [:ty-button {:flavor "primary"
                     :pill ""}
         [:ty-icon {:slot "start"
                    :name "send"
                    :size "sm"}]
         "Sign up"]]]

      ;; Matching code snippet — what's rendered above
      [:div
       (common/code-block
        "import { TyButton, TyInput, TyIcon } from 'tyrell-react'

<TyInput label=\"Email\">
  <TyIcon slot=\"start\" name=\"mail\" />
</TyInput>
<TyButton flavor=\"primary\" pill>
  <TyIcon slot=\"start\" name=\"send\" />
  Sign up
</TyButton>"
        "tsx")]]]

    ;; Brand strip — full width across both columns, wraps on small screens.
    [:div.flex.flex-wrap.items-center.justify-center.gap-4.pt-6
     {:style {:border-top "1px solid var(--ty-border-)"}}
     (brand-glyph {:icon "react"
                   :title "React"})
     (brand-glyph {:icon "vuejs"
                   :title "Vue"})
     (brand-glyph {:icon "svelte"
                   :title "Svelte"})
     (brand-glyph {:icon "astro"
                   :title "Astro"})
     (brand-glyph {:icon "typescript"
                   :title "TypeScript"})
     (brand-glyph {:icon "js"
                   :title "JavaScript"})
     (brand-glyph {:icon "node-js"
                   :title "Node.js"})
     (brand-glyph {:icon "html5"
                   :title "HTML"})
     (brand-glyph {:icon "css3"
                   :title "CSS"})]]])

;; =============================================================================
;; Compact stack cards — HTMX, Replicant, CLJS + React
;; =============================================================================

(defn fw
  "Inline framework name — heavier weight + brighter text color than surrounding tagline.
   Use inside a compact-stack-card :tagline vector to make framework names pop."
  [name]
  [:span.font-semibold.ty-text name])

(defn compact-stack-card
  [{:keys [route-id icon flavor eyebrow title tagline snippet snippet-lang]}]
  [:div.ty-elevated.rounded-xl.p-5.cursor-pointer.hover:shadow-lg.flex.flex-col
   {:style (lift-card-style)
    :on (merge {:click #(router/navigate! route-id)}
               (lift-card-handlers))}

   ;; Eyebrow + icon row
   [:div.flex.items-start.justify-between.mb-4
    [:div.flex.items-center.justify-center.rounded-lg.flex-shrink-0
     {:class (str "ty-bg-" flavor "-")
      :style {:width "40px"
              :height "40px"}}
     [:ty-icon {:name icon
                :size "md"
                :class (str "ty-text-" flavor "++")}]]
    [:span.text-xs.font-bold.uppercase.tracking-widest
     {:class (str "ty-text-" flavor)}
     eyebrow]]

   ;; Title
   [:h3.text-lg.font-bold.ty-text++.leading-tight.mb-2.tracking-tight title]

   ;; Tagline — min-height reserves 3 lines so the code chip starts at the
   ;; same y-position across all cards, which aligns the CTAs at the bottom.
   ;; Accepts a plain string or a vector of inline children (for emphasised spans).
   (into [:p.text-sm.ty-text-.leading-relaxed.mb-3.min-h-16]
         (if (string? tagline) [tagline] tagline))

   ;; Code-chip signature — multi-line so it fits the narrow card width without scrolling.
   (common/code-block snippet snippet-lang)

   ;; Spacer pushes the CTA to the bottom of the card
   [:div.flex-1]

   ;; CTA — uniform primary across all compact cards, decoupled from card flavor.
   [:div.flex.items-center.gap-1.5.text-sm.font-semibold.ty-text-primary
    [:span "Open guide"]
    [:ty-icon {:name "arrow-right"
               :size "xs"}]]])

(defn choose-your-stack []
  [:div
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-primary {:name "layers"
                              :size "sm"}]
    [:h2.text-xl.font-bold.ty-text++.tracking-tight "Choose your stack"]]
   [:p.ty-text-.mb-6.font-normal.text-sm
    "Each guide covers install, setup, and the patterns specific to that stack."]

   ;; Hero card — JS/TS, full width
   [:div.mb-4
    (js-hero-card)]

   ;; Compact cards row
   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
    (compact-stack-card
     {:route-id :tyrell.site.docs/clojurescript
      :icon "clojure"
      :flavor "neutral"
      :eyebrow "CLJS"
      :title "ClojureScript"
      :tagline [(fw "Reagent") " · " (fw "re-frame") " · " (fw "UIx") " · " (fw "Helix") " · " (fw "Replicant")
                " — one Clojars dep, typed wrappers for React libs, raw " (fw "<ty-*>") " for the rest."]
      :snippet "(:require
  [tyrell.components]
  [tyrell.react :as ty])

[:> ty/Button
 {:flavor \"primary\"}
 \"Save\"]"
      :snippet-lang "clojure"})
    (compact-stack-card
     {:route-id :tyrell.site.docs/html
      :icon "server"
      :flavor "neutral"
      :eyebrow "Server"
      :title "HTML / Server-side"
      :tagline [(fw "HTMX") " · " (fw "Datastar") " · " (fw "Flask") " · " (fw "Django") " · "
                (fw "Rails") " · " (fw "PHP") " — form-associated, paste-your-SVG, no build."]
      :snippet "\n\n<ty-button hx-post=\"/save\"
           flavor=\"primary\">
  <ty-icon slot=\"start\">
    {% include 'icons/save.svg' %}
  </ty-icon>
  Save
</ty-button>"
      :snippet-lang "html"})]])

;; =============================================================================
;; CDN — compact callout (the icon section's Pattern 2 covers production setup)
;; =============================================================================

(defn cdn-callout []
  [:div.ty-elevated.rounded-xl.p-5
   {:style {:border "1px solid var(--ty-border-)"
            :border-left "3px solid var(--ty-color-primary)"}}
   [:div.flex.items-start.gap-4
    [:div.flex.items-center.justify-center.rounded-lg.ty-bg-primary-.flex-shrink-0
     {:style {:width "40px"
              :height "40px"}}
     [:ty-icon.ty-text-primary+
      {:name "zap"
       :size "md"}]]
    [:div.flex-1.min-w-0
     [:h3.text-base.font-bold.ty-text++.tracking-tight.mb-1 "Or skip the build entirely"]
     [:p.text-sm.ty-text-.mb-3.leading-relaxed
      "Paste these three tags into "
      [:code "<head>"]
      " — works in any HTML page, server template, or HTMX project."]
     (common/code-block
      "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css\">
<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell-theme.css\">
<script src=\"https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js\"></script>"
      "html")
     [:div.flex.items-center.gap-1.5.mt-2.text-sm.font-semibold.ty-text-primary
      [:button.ty-text-primary.cursor-pointer.hover:underline.bg-transparent.p-0
       {:style {:border "none"}
        :on {:click #(router/navigate! :tyrell.site.docs/html)}}
       "Full HTML setup"]
      [:ty-icon {:name "arrow-right"
                 :size "xs"}]]]]])

;; =============================================================================
;; Icons — three concrete patterns, one per audience
;; =============================================================================

(defn icon-pattern-header
  "Shared header for an icon-registration pattern card."
  [{:keys [icon flavor eyebrow title tagline]}]
  [:div.flex.items-start.gap-4.mb-5
   [:div.flex.items-center.justify-center.rounded-lg.flex-shrink-0
    {:class (str "ty-bg-" flavor "-")
     :style {:width "44px"
             :height "44px"}}
    [:ty-icon {:name icon
               :size "md"
               :class (str "ty-text-" flavor "++")}]]
   [:div.flex-1.min-w-0
    [:div.text-xs.font-bold.uppercase.tracking-widest.mb-1.leading-snug
     {:class (str "ty-text-" flavor)}
     eyebrow]
    [:h3.text-lg.font-bold.ty-text++.tracking-tight.leading-tight title]
    [:p.text-sm.ty-text-.font-normal.mt-1.leading-relaxed tagline]]])

(defn step-label
  "Tiny uppercase numbered label between code blocks in pattern 2."
  [n text]
  [:div.flex.items-center.gap-2.mt-3
   [:span.text-xs.font-bold.ty-text-primary.tracking-widest "0" n]
   [:span.text-xs.font-semibold.ty-text--.tracking-widest.uppercase text]])

(defn icon-system []
  [:div
   ;; Section heading
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-primary {:name "sparkles"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Icons, registered up front"]]
   [:p.ty-text-.mb-6.font-normal
    "Tyrell ships 3000+ icons (Lucide, Heroicons, Material Design, FontAwesome). They live in a runtime registry — you decide which ones get bundled. Same pattern, three audiences:"]

   ;; Three pattern cards
   [:div.space-y-4

    ;; Pattern 1 — Bundler
    [:div.ty-elevated.rounded-xl.p-5.lg:p-6
     {:style {:border "1px solid var(--ty-border-)"}}
     (icon-pattern-header
      {:icon "package"
       :flavor "success"
       :eyebrow "Vite · Webpack · Next · Astro · Rollup"
       :title "Bundler import"
       :tagline "If you have a build, this is the simplest path. Tree-shaken to the icons you actually reference."})
     (common/code-block
      "import { check, heart, save } from 'tyrell-components/icons/lucide'
import { registerIcons } from 'tyrell-components/icons/registry'

registerIcons({ check, heart, save })"
      "javascript")]

;; Pattern 2 — ClojureScript
    [:div.ty-elevated.rounded-xl.p-5.lg:p-6
     {:style {:border "1px solid var(--ty-border-)"}}
     (icon-pattern-header
      {:icon "lambda"
       :flavor "warning"
       :eyebrow "Replicant · Reagent · UIx · Helix"
       :title "ClojureScript helper"
       :tagline "Same registry, idiomatic keyword keys, ergonomic CLJS API."})
     (common/code-block
      "(require '[tyrell.icons :as icons]
         '[tyrell.lucide :as lucide])

(icons/register! {:check lucide/check
                  :heart lucide/heart
                  :save  lucide/save})"
      "clojure")]

    ;; Pattern 3 — No bundler (HTMX / Datastar / Flask / Django / Rails / PHP)
    [:div.ty-elevated.rounded-xl.p-5.lg:p-6
     {:style {:border "1px solid var(--ty-border-)"}}
     (icon-pattern-header
      {:icon "server"
       :flavor "primary"
       :eyebrow "HTMX · Datastar · Flask · Django · Rails · PHP"
       :title "Slot mode — paste your SVG between the tags"
       :tagline "Your server already produces HTML, including SVG. Drop it inside <ty-icon> — no registration, no fetch, no build chain."})

     (step-label 1 "Inside a tyrell slot — wrap for size contract")
     (common/code-block
      "<ty-button flavor=\"primary\" size=\"lg\">
  <ty-icon slot=\"start\">
    {% include 'icons/save.svg' %}
  </ty-icon>
  Save
</ty-button>"
      "html")

     (step-label 2 "Outside any slot — raw SVG is fine")
     (common/code-block
      "<a href=\"/help\" class=\"flex items-center gap-2\">
  {% include 'icons/help.svg' %}
  Help
</a>"
      "html")

     ;; Outcome callout
     [:div.mt-4.flex.items-center.gap-3.p-4.rounded-lg.ty-bg-success-
      {:style {:border "1px solid var(--ty-border-success)"}}
      [:ty-icon.ty-text-success.flex-shrink-0 {:name "zap"
                                               :size "sm"}]
      [:p.text-sm.ty-text-success.font-medium.leading-snug
       [:strong.font-bold "Zero ceremony."]
       " No npm, no build, no JS registry. Same pattern across Jinja, ERB, EEx, Twig, "
       [:code.font-mono.text-xs.ty-bg-success.px-1.rounded "echo include"] " — anything that emits HTML."]]

     ;; Sub-callout — graduate to bundling
     [:div.mt-4.flex.items-start.gap-3.p-4.rounded-lg.ty-bg-info-
      {:style {:border "1px solid var(--ty-border-info)"}}
      [:ty-icon.ty-text-info.flex-shrink-0.mt-0.5 {:name "package"
                                                   :size "sm"}]
      [:div.flex-1
       [:p.text-sm.ty-text-info++.font-bold.mb-1 "Many uses across many templates? Graduate to the registry."]
       [:p.text-sm.ty-text-info.font-normal.leading-relaxed.mb-3
        "When the same icon shows up in dozens of templates, register once via "
        [:code.font-mono.text-xs.ty-bg-info.px-1.rounded "window.tyIcons.register({...})"]
        " and reference by " [:code.font-mono.text-xs.ty-bg-info.px-1.rounded "name="]
        " everywhere. Production-bundled via esbuild as a CLI:"]
       (common/code-block
        "# 1. Pick your icons (icons.js)
import { check, save, x, menu } from 'tyrell-components/icons/lucide'
window.tyIcons.register({ check, save, x, menu })

# 2. Bundle once with esbuild
esbuild icons.js --bundle --minify --format=iife --outfile=static/icons.js

# 3. Load with defer in your template
<script defer src=\"/static/icons.js\"></script>"
        "bash")
       [:p.text-xs.ty-text-info.font-normal.mt-2.leading-relaxed
        "~6 KB icons.js · vs ~820 KB minified / ~125 KB gzipped if you ship every Lucide icon. Slot mode covers the rest."]]]]]

;; Footnote — sandbox / CodePen path
   [:div.mt-4.ty-bg-info-.rounded-xl.p-4.flex.items-start.gap-3
    {:style {:border "1px solid var(--ty-border-info)"}}
    [:ty-icon.ty-text-info.flex-shrink-0.mt-0.5 {:name "info"
                                                 :size "sm"}]
    [:div.flex-1
     [:p.text-sm.ty-text-info++.font-bold.mb-1 "Just exploring? (CodePen, sandbox, dev console)"]
     [:p.text-sm.ty-text-info.font-normal.leading-relaxed
      "Slot mode works in any sandbox — paste SVG between the "
      [:code.font-mono.text-xs.ty-bg-info.px-1.rounded "<ty-icon>"]
      " tags, no setup. Or populate the registry inline if you want named references:"]
     [:div.mt-3
      (common/code-block
       "<script src=\"https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js\"></script>
<script>
  window.tyIcons.register({
    heart: '<svg viewBox=\"0 0 24 24\">...</svg>',
    save:  '<svg viewBox=\"0 0 24 24\">...</svg>'
  })
</script>"
       "html")]]]])

;; =============================================================================
;; Main view
;; =============================================================================

(defn view []
  (common/docs-page
   (hero)
   (choose-your-stack)
   (cdn-callout)
   (icon-system)))
