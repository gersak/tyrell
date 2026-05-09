(ns tyrell.site.docs.js-react
  "JavaScript / TypeScript guide — substrate for every framework, deep-dive on React."
  (:require [tyrell.router :as router]
            [tyrell.site.docs.common :as common]))

;; =============================================================================
;; Local layout helpers (duplicated from views/getting_started.cljs).
;; Two callsites is below the threshold for extraction; revisit when the CLJS
;; and HTMX docs pages get the same treatment.
;; =============================================================================

(defn- feature-pill
  "Small chip with mini icon + label, sits on ty-content surface."
  [{:keys [icon label]}]
  [:div.inline-flex.items-center.gap-1.5.px-2.5.py-1.rounded-full.ty-content
   {:style {:border "1px solid var(--ty-border-)"}}
   [:ty-icon.ty-text-accent {:name icon
                             :size "xs"}]
   [:span.text-xs.font-medium.ty-text label]])

(defn- brand-glyph
  "Brand silhouette — softer baseline (ty-text-), scales + lights up to accent on hover."
  [{:keys [icon title]}]
  [:div.flex.items-center.justify-center.transition-all.duration-200.rounded-lg.cursor-default.ty-text--.hover:ty-text-accent.hover:scale-110
   {:style {:width "40px"
            :height "40px"}
    :title title}
   [:ty-icon {:name icon
              :size "lg"}]])

(defn- lift-card-style []
  {:border "1px solid var(--ty-border-)"
   :transform "translateZ(0)"
   :will-change "transform"
   :backface-visibility "hidden"
   :transition "transform 200ms ease, box-shadow 200ms ease"})

(defn- lift-card-handlers []
  {:mouseenter (fn [^js e]
                 (set! (.. e -currentTarget -style -transform)
                       "translate3d(0, -2px, 0)"))
   :mouseleave (fn [^js e]
                 (set! (.. e -currentTarget -style -transform)
                       "translateZ(0)"))})

(defn- fw
  "Inline framework name — heavier weight + brighter text color than tagline."
  [name]
  [:span.font-semibold.ty-text name])


(defn- copy-to-clipboard!
  "Copy `text` to the system clipboard. Prefers the async Clipboard API; falls
   back to a hidden textarea + execCommand when the API is unavailable (insecure
   contexts, sandboxed iframes, older browsers). Returns a Promise that resolves
   to true on success."
  [text]
  (let [^js clipboard (some-> js/navigator (.-clipboard))]
    (if clipboard
      (-> (.writeText clipboard text)
          (.then (fn [_] true))
          (.catch (fn [_]
                    (js/console.warn "Clipboard.writeText failed — falling back")
                    false)))
      ;; Synchronous textarea fallback — works without HTTPS but needs a
      ;; user-gesture, which we have here (click handler).
      (let [ta (.createElement js/document "textarea")]
        (set! (.-value ta) text)
        (set! (.. ta -style -position) "fixed")
        (set! (.. ta -style -opacity) "0")
        (.appendChild js/document.body ta)
        (.select ta)
        (let [ok? (try (js/document.execCommand "copy") (catch :default _ false))]
          (.removeChild js/document.body ta)
          (js/Promise.resolve (boolean ok?)))))))

(defn- click-to-copy
  "Inline copy-to-clipboard button — pairs with non-code-block surfaces (e.g. the
   PACKAGES preview card). Swaps to a check icon for ~1.5s on success."
  [{:keys [text title]}]
  [:button.flex.items-center.justify-center.rounded.cursor-pointer.bg-transparent.ty-text--.hover:ty-text-accent.transition-colors.duration-150
   {:style {:width "24px"
            :height "24px"
            :border "1px solid var(--ty-border-)"
            :padding "0"}
    :title (or title "Copy to clipboard")
    :on {:click (fn [^js e]
                  (.preventDefault e)
                  (.stopPropagation e)
                  (let [^js btn (.-currentTarget e)
                        feedback! (fn [icon-html]
                                    (set! (.-innerHTML btn) icon-html)
                                    (js/setTimeout
                                     #(set! (.-innerHTML btn)
                                            "<ty-icon name=\"copy\" size=\"xs\"></ty-icon>")
                                     1500))]
                    (-> (copy-to-clipboard! text)
                        (.then (fn [ok?]
                                 (if ok?
                                   (feedback! "<ty-icon name=\"check\" size=\"xs\" class=\"ty-text-success\"></ty-icon>")
                                   (feedback! "<ty-icon name=\"x\" size=\"xs\" class=\"ty-text-danger\"></ty-icon>")))))))}}
   [:ty-icon {:name "copy"
              :size "xs"}]])

(defn- compact-stack-card
  "Compact card with eyebrow, title, multi-line tagline, code-chip, bottom CTA.
   `:on-click` is required (router navigate or window.open).
   `:eyebrow-flavor` defaults to \"accent\" — set to \"success\" for a Recommended-style badge."
  [{:keys [icon title tagline snippet snippet-lang
           eyebrow eyebrow-flavor cta on-click]
    :or {eyebrow-flavor "accent"}}]
  [:div.ty-elevated.rounded-xl.p-5.cursor-pointer.hover:shadow-lg.flex.flex-col
   {:style (lift-card-style)
    :on (merge {:click on-click}
               (lift-card-handlers))}

   ;; Eyebrow + icon row
   [:div.flex.items-start.justify-between.mb-4
    [:div.flex.items-center.justify-center.rounded-lg.flex-shrink-0.ty-bg-neutral-
     {:style {:width "40px"
              :height "40px"}}
     [:ty-icon.ty-text-neutral++ {:name icon
                                  :size "md"}]]
    [:span.text-xs.font-bold.uppercase.tracking-widest
     {:class (str "ty-text-" eyebrow-flavor)}
     eyebrow]]

   ;; Title
   [:h3.text-lg.font-bold.ty-text++.leading-tight.mb-2.tracking-tight title]

   ;; Tagline — min-h-16 reserves space so code chips align across cards.
   (into [:p.text-sm.ty-text-.leading-relaxed.mb-3.min-h-16]
         (if (string? tagline) [tagline] tagline))

   ;; Code-chip signature
   (common/code-block snippet snippet-lang)

   ;; Spacer pushes CTA to the bottom
   [:div.flex-1]

   ;; CTA
   [:div.flex.items-center.gap-1.5.text-sm.font-semibold.ty-text-primary
    [:span cta]
    [:ty-icon {:name "arrow-right"
               :size "xs"}]]])

;; =============================================================================
;; Section 1 — Hero
;; =============================================================================

(defn- hero []
  [:div.text-center.mb-12
   [:div.inline-flex.items-center.gap-3.mb-4
    [:div.flex.items-center.justify-center.rounded-xl.ty-bg-accent-
     {:style {:width "44px"
              :height "44px"}}
     [:ty-icon.ty-text-accent+
      {:name "code"
       :size "lg"}]]
    [:h1.text-4xl.font-bold.ty-text++.tracking-tight "JavaScript / TypeScript"]]

   [:p.text-xl.ty-text.mb-3.font-normal
    "Web components for every framework. Typed React wrappers when you want them."]

   [:p.text-xs.ty-text--.tracking-widest.uppercase.font-semibold.mb-6
    "22 components · ESM · CDN · framework-agnostic"]

   ;; Brand strip
   [:div.flex.flex-wrap.items-center.justify-center.gap-4.max-w-xl.mx-auto
    (brand-glyph {:icon "react"      :title "React"})
    (brand-glyph {:icon "vuejs"      :title "Vue"})
    (brand-glyph {:icon "svelte"     :title "Svelte"})
    (brand-glyph {:icon "astro"      :title "Astro"})
    (brand-glyph {:icon "typescript" :title "TypeScript"})
    (brand-glyph {:icon "js"         :title "JavaScript"})
    (brand-glyph {:icon "node-js"    :title "Node.js"})]])

;; =============================================================================
;; Section 2 — What you install
;; =============================================================================

(defn- pkg-row
  "Single row inside the install preview — package name + role tag.
   Right side: copy button (copies `npm install <pkg>`) and an external link to
   the npm page (so users can check the published version themselves)."
  [{:keys [pkg always? subtitle]}]
  [:div.ty-content.rounded-lg.p-3
   {:style {:border "1px solid var(--ty-border-)"}}
   [:div.flex.items-center.justify-between.mb-1
    [:a.flex.items-center.gap-2.min-w-0.no-underline.ty-text++.hover:ty-text-accent.transition-colors.duration-150
     {:href (str "https://www.npmjs.com/package/" pkg)
      :target "_blank"
      :rel "noopener noreferrer"
      :title (str "Open " pkg " on npm")}
     [:ty-icon.ty-text-accent {:name "package"
                               :size "xs"}]
     [:code.text-sm.font-mono.font-semibold.truncate pkg]
     [:ty-icon.ty-text-- {:name "external-link"
                          :size "xs"}]]
    [:div.flex.items-center.gap-2.flex-shrink-0
     (click-to-copy {:text (str "npm install " pkg)
                     :title (str "Copy `npm install " pkg "`")})]]
   [:div.flex.items-center.gap-2
    [:span.text-xs.font-bold.tracking-widest.uppercase
     {:class (if always? "ty-text-success" "ty-text--")}
     (if always? "Always" "React only")]
    [:span.h-1.w-1.rounded-full.ty-bg-neutral]
    [:span.text-xs.ty-text- subtitle]]])

(defn- install-card []
  [:div.ty-elevated.rounded-2xl.relative.overflow-hidden
   {:style {:border "1px solid var(--ty-border-)"}}

   [:div.absolute.top-0.left-0.right-0.h-2.ty-bg-accent+]

   [:div.p-6.lg:p-8

    [:div.grid.grid-cols-1.md:grid-cols-2.gap-8.mb-6

     ;; LEFT — package model
     [:div.flex.flex-col

      [:div.flex.items-center.gap-2.mb-5
       [:span.text-xs.font-bold.ty-text-accent.tracking-widest.uppercase "Install"]
       [:span.h-1.w-1.rounded-full.ty-bg-neutral]
       [:span.text-xs.font-medium.ty-text--.tracking-widest.uppercase "Two packages, one role each"]]

      [:div.flex.items-start.gap-4.mb-5
       [:div.flex.items-center.justify-center.rounded-xl.ty-bg-accent-.flex-shrink-0
        {:style {:width "56px"
                 :height "56px"}}
        [:ty-icon.ty-text-accent++ {:name "package"
                                    :size "lg"}]]
       [:div.flex-1.min-w-0
        [:h3.text-3xl.font-bold.ty-text++.tracking-tight.leading-tight.mb-2
         "What you install"]
        [:p.text-base.ty-text.font-normal.leading-relaxed
         "The substrate is one package. React is the only framework with a typed-wrapper add-on — "
         (fw "Vue") ", " (fw "Svelte") ", and " (fw "Astro") " use the web components directly."]]]

      ;; Feature pills
      [:div.flex.flex-wrap.gap-2.mb-6
       (feature-pill {:icon "layers"     :label "Tree-shakeable icons"})
       (feature-pill {:icon "code"       :label "TypeScript types"})
       (feature-pill {:icon "box"        :label "Web Components"})
       (feature-pill {:icon "shuffle"    :label "Any framework"})]

      [:div.flex-1]

      [:div.flex.items-center.gap-2.text-sm.font-medium.ty-text-
       [:ty-icon.ty-text-accent {:name "info"
                                 :size "xs"}]
       [:span "Both packages publish to NPM — pick a CDN below if you'd rather skip the bundler."]]]

     ;; RIGHT — package preview + install command
     [:div.flex.flex-col.gap-4

      ;; Stacked package rows on ty-floating
      [:div.ty-floating.rounded-xl.p-5
       {:style {:border "1px solid var(--ty-border-)"}}
       [:div.flex.items-center.justify-between.mb-4
        [:span.text-xs.font-bold.ty-text--.tracking-widest.uppercase "Packages"]
        [:span.text-xs.ty-text--.font-medium.tracking-widest.uppercase "from npm"]]
       [:div.flex.flex-col.gap-2
        (pkg-row {:pkg "tyrell-components"
                  :always? true
                  :subtitle "Web components, CSS, icons"})
        (pkg-row {:pkg "tyrell-react"
                  :always? false
                  :subtitle "Typed React wrappers"})]]

      ;; Install command
      [:div
       (common/code-block
        "npm install tyrell-components
# Plus, only if you use React:
npm install tyrell-react"
        "bash")]]]]])

;; =============================================================================
;; Section 3 — Two ways to load
;; =============================================================================

(defn- subpath-callout []
  [:div.ty-elevated.rounded-xl.p-5
   {:style {:border "1px solid var(--ty-border-)"
            :border-left "3px solid var(--ty-color-accent)"}}
   [:div.flex.items-start.gap-4
    [:div.flex.items-center.justify-center.rounded-lg.ty-bg-accent-.flex-shrink-0
     {:style {:width "40px"
              :height "40px"}}
     [:ty-icon.ty-text-accent+ {:name "layers"
                                :size "md"}]]
    [:div.flex-1.min-w-0
     [:h3.text-base.font-bold.ty-text++.tracking-tight.mb-1 "Subpath imports — register only what you use"]
     [:p.text-sm.ty-text-.mb-3.leading-relaxed
      "Skip the all-in-one import; pull in just the components your app renders."]
     (common/code-block
      "import 'tyrell-components/css/tyrell.css'
import 'tyrell-components/button'
import 'tyrell-components/input'
import 'tyrell-components/dropdown'
import 'tyrell-components/option'      // dropdown children
import 'tyrell-components/modal'"
      "typescript")
     [:p.text-xs.ty-text--.font-mono.mt-3.leading-relaxed
      "button · input · textarea · checkbox · dropdown · option · multiselect · tag · "
      "modal · popup · tooltip · calendar · calendar-month · calendar-navigation · "
      "date-picker · tabs · tab · icon · copy"]]]])

(defn- load-options []
  [:div
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "download"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Two ways to load"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "Pick one — they're mutually exclusive. Bundler imports give tree-shaking and synchronous icon registration. CDN gives zero build for HTMX, prototypes, or shared-cache deployments."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4.mb-4
    (compact-stack-card
     {:eyebrow "Recommended"
      :eyebrow-flavor "success"
      :icon "package"
      :title "Bundler imports"
      :tagline [(fw "Vite") " · " (fw "Webpack") " · " (fw "Next") " · " (fw "Astro") " · "
                (fw "Rollup") " · " (fw "Bun") " — standard ESM, honours " [:code.font-mono.text-xs "sideEffects"] "."]
      :snippet "import 'tyrell-components/css/tyrell.css'
import 'tyrell-components'"
      :snippet-lang "typescript"
      :cta "Skim subpath imports"
      :on-click (fn [^js _]
                  (when-let [el (js/document.getElementById "subpath")]
                    (.scrollIntoView el #js {:behavior "smooth"
                                             :block "start"})))})
    (compact-stack-card
     {:eyebrow "Zero build"
      :icon "zap"
      :title "CDN script tag"
      :tagline [(fw "HTMX") " · " (fw "Flask") " · " (fw "Rails") " · " (fw "PHP") " — paste two tags into "
                [:code.font-mono.text-xs "<head>"] " and you're done."]
      :snippet "<link rel=\"stylesheet\" href=\"…/tyrell.css\">
<script type=\"module\"
        src=\"…/tyrell.js\"></script>"
      :snippet-lang "html"
      :cta "Self-hostable too"
      :on-click #(router/navigate! :tyrell.site.docs/html)})]

   [:div {:id "subpath"}
    (subpath-callout)]])

;; =============================================================================
;; Section 4 — Your framework
;; =============================================================================

(defn- framework-card
  [opts]
  (compact-stack-card opts))

(defn- frameworks []
  [:div
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "layers"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Your framework"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "Web components are HTML — every framework can render them. React gets typed wrappers as a convenience; everything else uses the elements directly."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
    (framework-card
     {:eyebrow "Typed wrappers"
      :icon "react"
      :title "React"
      :tagline ["Use " (fw "tyrell-react") " for React-idiomatic props and event handlers."]
      :snippet "import { TyButton, TyInput } from 'tyrell-react'

<TyInput label=\"Email\" onChange={onEmail} />
<TyButton flavor=\"primary\" onClick={save}>
  Save
</TyButton>"
      :snippet-lang "tsx"
      :cta "Read patterns"
      :on-click #(.scrollTo js/window
                            #js {:top (-> (js/document.getElementById "react-deep-dive")
                                          (.getBoundingClientRect)
                                          (.-top)
                                          (+ js/window.scrollY -24))
                                 :behavior "smooth"})})

    (framework-card
     {:eyebrow "Native"
      :icon "vuejs"
      :title "Vue 3 / Nuxt"
      :tagline ["Native custom-element binding. " (fw "No wrapper") " package needed."]
      :snippet "<ty-input label=\"Email\"
          @change=\"email = $event.detail.value\" />
<ty-button flavor=\"primary\" @click=\"save\">
  Save
</ty-button>"
      :snippet-lang "html"
      :cta "Open Vue guide"
      :on-click #(js/window.open "https://github.com/gersak/ty/blob/master/guides/js/VUE_TY_GUIDE.md" "_blank")})

    (framework-card
     {:eyebrow "Native"
      :icon "svelte"
      :title "Svelte 5 / SvelteKit"
      :tagline ["Use " (fw "<ty-*>") " elements directly. "
                (fw "onchange={…}") " reads " [:code.font-mono.text-xs "event.detail"] "."]
      :snippet "<ty-input label=\"Email\"
          onchange={(e) => email = e.detail.value} />
<ty-button flavor=\"primary\" onclick={save}>
  Save
</ty-button>"
      :snippet-lang "html"
      :cta "Open Svelte guide"
      :on-click #(js/window.open "https://github.com/gersak/ty/blob/master/guides/js/SVELTE_TY_GUIDE.md" "_blank")})

    (framework-card
     {:eyebrow "Zero abstraction"
      :icon "js"
      :title "Vanilla / Astro"
      :tagline [(fw "<ty-*>") " tags drop into HTML. "
                (fw "addEventListener('change', …)") " just works."]
      :snippet "<ty-input id=\"email\" label=\"Email\"></ty-input>
<ty-button flavor=\"primary\" id=\"save\">Save</ty-button>

<script>
  email.addEventListener('change', (e) => log(e.detail.value))
</script>"
      :snippet-lang "html"
      :cta "Open JS guide"
      :on-click #(js/window.open "https://github.com/gersak/ty/blob/master/guides/js/JAVASCRIPT_GUIDE.md" "_blank")})]])

;; =============================================================================
;; Section 5 — React deep-dive (full-width hero card with live preview)
;; =============================================================================

(defn- react-deep-dive []
  [:div {:id "react-deep-dive"}
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "react"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Typed wrappers, controlled inputs, refs"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "The headline reason to install " (fw "tyrell-react") ": JSX with type-safe props, "
    [:code.font-mono.text-xs.ty-text "e.detail"]
    " typed in event handlers, and ref forwarding for imperative APIs (modals, popups, scroll containers)."]

   [:div.ty-elevated.rounded-2xl.relative.overflow-hidden
    {:style {:border "1px solid var(--ty-border-)"}}

    [:div.absolute.top-0.left-0.right-0.h-2.ty-bg-accent+]

    [:div.p-6.lg:p-8

     [:div.grid.grid-cols-1.md:grid-cols-2.gap-8

      ;; LEFT — feature copy
      [:div.flex.flex-col

       [:div.flex.items-center.gap-2.mb-5
        [:span.text-xs.font-bold.ty-text-accent.tracking-widest.uppercase "Most popular"]
        [:span.h-1.w-1.rounded-full.ty-bg-neutral]
        [:span.text-xs.font-medium.ty-text--.tracking-widest.uppercase "React · Next · Vite · Remix"]]

       [:div.flex.items-start.gap-4.mb-5
        [:div.flex.items-center.justify-center.rounded-xl.ty-bg-accent-.flex-shrink-0
         {:style {:width "56px"
                  :height "56px"}}
         [:ty-icon.ty-text-accent++ {:name "react"
                                     :size "lg"}]]
        [:div.flex-1.min-w-0
         [:h3.text-3xl.font-bold.ty-text++.tracking-tight.leading-tight.mb-2
          "React, the way it should feel"]
         [:p.text-base.ty-text.font-normal.leading-relaxed
          "Same components, React-shaped APIs. JSX renders the underlying "
          (fw "<ty-*>") " element; the wrapper hands you typed events and lets refs reach the imperative API underneath."]]]

       [:div.flex.flex-wrap.gap-2.mb-6
        (feature-pill {:icon "shield"       :label "Type-safe props"})
        (feature-pill {:icon "arrow-right"  :label "event.detail typed"})
        (feature-pill {:icon "link"         :label "Ref forwarding"})
        (feature-pill {:icon "feather"      :label "Zero overhead"})]

       [:div.flex-1]

       [:div.flex.items-center.gap-2.text-sm.font-medium.ty-text-
        [:ty-icon.ty-text-accent {:name "book-open"
                                  :size "xs"}]
        [:span "Imperative refs cover " (fw "ty-modal") ", " (fw "ty-popup") ", and " (fw "ty-scroll-container") "."]]]

      ;; RIGHT — live preview + matching React code
      [:div.flex.flex-col.gap-4

       [:div.ty-floating.rounded-xl.p-5
        {:style {:border "1px solid var(--ty-border-)"}}
        [:div.flex.items-center.justify-between.mb-4
         [:span.text-xs.font-bold.ty-text--.tracking-widest.uppercase "Preview"]
         [:div.flex.items-center.gap-1.5
          [:div.rounded-full.ty-bg-success.animate-pulse
           {:style {:width "6px"
                    :height "6px"}}]
          [:span.text-xs.ty-text--.font-medium.tracking-wide.uppercase "live"]]]
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

       [:div
        (common/code-block
         "import { TyButton, TyInput, TyIcon } from 'tyrell-react'

<TyInput
  label=\"Email\"
  placeholder=\"you@example.com\"
  onChange={(e) => setEmail(e.detail.value)}
>
  <TyIcon slot=\"start\" name=\"mail\" />
</TyInput>

<TyButton flavor=\"primary\" pill onClick={submit}>
  <TyIcon slot=\"start\" name=\"send\" />
  Sign up
</TyButton>"
         "tsx")]]]]]])

;; =============================================================================
;; Section 6 — Two things every framework user needs to know
;; =============================================================================

(defn- gotcha-card
  [{:keys [eyebrow icon title body code code-lang]}]
  [:div.ty-elevated.rounded-xl.p-5.flex.flex-col
   {:style {:border "1px solid var(--ty-border-)"}}
   [:div.flex.items-center.justify-between.mb-4
    [:div.flex.items-center.justify-center.rounded-lg.flex-shrink-0.ty-bg-neutral-
     {:style {:width "40px"
              :height "40px"}}
     [:ty-icon.ty-text-neutral++ {:name icon
                                  :size "md"}]]
    [:span.text-xs.font-bold.uppercase.tracking-widest.ty-text-accent
     eyebrow]]
   [:h3.text-lg.font-bold.ty-text++.leading-tight.mb-2.tracking-tight title]
   (into [:p.text-sm.ty-text-.leading-relaxed.mb-3]
         (if (string? body) [body] body))
   (common/code-block code code-lang)])

(defn- gotchas []
  [:div
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "alert-triangle"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Two things every framework user needs to know"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "The two questions almost everyone hits first."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
    (gotcha-card
     {:eyebrow "Event payloads"
      :icon "arrow-right"
      :title "Read event.detail.value"
      :body ["Custom events fire with their payload on " (fw "event.detail") ", not on the event itself. "
             "The React wrapper preserves this — it does " (fw "not") " re-emit synthetic React events."]
      :code "// ✅ payload lives on event.detail
el.addEventListener('change', (e) => {
  console.log(e.detail.value)
})

// React (tyrell-react)
<TyInput onChange={(e) => setEmail(e.detail.value)} />"
      :code-lang "typescript"})

    (gotcha-card
     {:eyebrow "SSR / hydration"
      :icon "server"
      :title "Register on the client only"
      :body [(fw "customElements.define") " requires a browser. Import "
             (fw "tyrell-components") " inside a client boundary so the registration call doesn't run on the server."]
      :code "// Next.js (App Router)  → 'use client' + import
'use client'
import 'tyrell-components'

// Nuxt 3        → if (import.meta.client) await import(...)
// SvelteKit     → import inside onMount
// Astro         → use client:load on islands"
      :code-lang "typescript"})]])

;; =============================================================================
;; Section 7 — Bundle size mental model
;; =============================================================================

(defn- bundle-size-callout []
  [:div.ty-elevated.rounded-xl.p-5
   {:style {:border "1px solid var(--ty-border-)"
            :border-left "3px solid var(--ty-color-accent)"}}
   [:div.flex.items-start.gap-4
    [:div.flex.items-center.justify-center.rounded-lg.ty-bg-accent-.flex-shrink-0
     {:style {:width "40px"
              :height "40px"}}
     [:ty-icon.ty-text-accent+ {:name "target"
                                :size "md"}]]
    [:div.flex-1.min-w-0
     [:h3.text-base.font-bold.ty-text++.tracking-tight.mb-1
      "Components are bounded. Icons are not."]
     [:p.text-sm.ty-text-.leading-relaxed.mb-3
      "All 22 components ship at " [:strong.ty-text "~377 KB minified · ~70 KB compressed"] ". "
      "Importing the entire Lucide family pulls in " [:strong.ty-text "~820 KB minified · ~125 KB gzipped"] " — most apps need under fifty icons (~10-30 KB gzipped). "
      "Use " (fw "named imports") " for icons, never " (fw "import * as") "; subpath imports for components if your app only renders a handful."]
     [:div.flex.items-center.gap-1.5.text-sm.font-semibold.ty-text-accent
      [:button.ty-text-accent.cursor-pointer.hover:underline.bg-transparent.p-0
       {:style {:border "none"}
        :on {:click #(router/navigate! :tyrell.site.docs/getting-started)}}
       "See the three icon-registration patterns on Getting Started"]
      [:ty-icon {:name "arrow-right"
                 :size "xs"}]]]]])

;; =============================================================================
;; Main view
;; =============================================================================

(defn view
  "JavaScript / TypeScript guide — substrate for every framework, deep-dive on React."
  []
  (common/docs-page
   (hero)
   (install-card)
   (load-options)
   (frameworks)
   (react-deep-dive)
   (gotchas)
   (bundle-size-callout)))
