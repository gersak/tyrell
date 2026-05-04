(ns tyrell.site.docs.clojurescript
  "ClojureScript guide — substrate for every CLJS framework, deep-dive on React libs."
  (:require [tyrell.router :as router]
            [tyrell.site.docs.common :as common]))

;; =============================================================================
;; Local layout helpers — parallel to docs/js_react.cljs.
;; =============================================================================

(defn- feature-pill
  [{:keys [icon label]}]
  [:div.inline-flex.items-center.gap-1.5.px-2.5.py-1.rounded-full.ty-content
   {:style {:border "1px solid var(--ty-border-)"}}
   [:ty-icon.ty-text-accent {:name icon
                             :size "xs"}]
   [:span.text-xs.font-medium.ty-text label]])

(defn- brand-glyph
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
  [name]
  [:span.font-semibold.ty-text name])

(defn- next-step
  [icon text]
  [:div.flex.items-center.gap-3
   [:div.flex.items-center.justify-center.rounded-md.ty-bg-accent-.flex-shrink-0
    {:style {:width "28px"
             :height "28px"}}
    [:ty-icon.ty-text-accent+ {:name icon
                               :size "xs"}]]
   [:span.ty-text.font-medium text]])

(defn- copy-to-clipboard!
  [text]
  (let [^js clipboard (some-> js/navigator (.-clipboard))]
    (if clipboard
      (-> (.writeText clipboard text)
          (.then (fn [_] true))
          (.catch (fn [_]
                    (js/console.warn "Clipboard.writeText failed — falling back")
                    false)))
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
  [{:keys [icon title tagline snippet snippet-lang
           eyebrow eyebrow-flavor cta on-click]
    :or {eyebrow-flavor "accent"}}]
  [:div.ty-elevated.rounded-xl.p-5.cursor-pointer.hover:shadow-lg.flex.flex-col
   {:style (lift-card-style)
    :on (merge {:click on-click}
               (lift-card-handlers))}

   [:div.flex.items-start.justify-between.mb-4
    [:div.flex.items-center.justify-center.rounded-lg.flex-shrink-0.ty-bg-neutral-
     {:style {:width "40px"
              :height "40px"}}
     [:ty-icon.ty-text-neutral++ {:name icon
                                  :size "md"}]]
    [:span.text-xs.font-bold.uppercase.tracking-widest
     {:class (str "ty-text-" eyebrow-flavor)}
     eyebrow]]

   [:h3.text-lg.font-bold.ty-text++.leading-tight.mb-2.tracking-tight title]

   (into [:p.text-sm.ty-text-.leading-relaxed.mb-3.min-h-16]
         (if (string? tagline) [tagline] tagline))

   (common/code-block snippet snippet-lang)

   [:div.flex-1]

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
      {:name "clojure"
       :size "lg"}]]
    [:h1.text-4xl.font-bold.ty-text++.tracking-tight "ClojureScript"]]

   [:p.text-xl.ty-text.mb-3.font-normal
    "Web components for every CLJS framework. tyrell-react when you want React-idiomatic events."]

   [:p.text-xs.ty-text--.tracking-widest.uppercase.font-semibold.mb-6
    "21 components · Closure-shakeable icons · framework-agnostic"]

   [:div.flex.flex-wrap.items-center.justify-center.gap-4.max-w-xl.mx-auto
    (brand-glyph {:icon "clojure" :title "ClojureScript"})
    (brand-glyph {:icon "atom"    :title "Reagent / re-frame"})
    (brand-glyph {:icon "react"   :title "UIx / Helix"})
    (brand-glyph {:icon "lambda"  :title "Replicant / Vanilla"})
    (brand-glyph {:icon "package" :title "shadow-cljs"})]])

;; =============================================================================
;; Section 2 — What you install
;; =============================================================================

(defn- pkg-row
  [{:keys [pkg ecosystem ecosystem-flavor subtitle install-cmd link]}]
  [:div.ty-content.rounded-lg.p-3
   {:style {:border "1px solid var(--ty-border-)"}}
   [:div.flex.items-center.justify-between.mb-1
    [:a.flex.items-center.gap-2.min-w-0.no-underline.ty-text++.hover:ty-text-accent.transition-colors.duration-150
     {:href link
      :target "_blank"
      :rel "noopener noreferrer"
      :title (str "Open " pkg)}
     [:ty-icon.ty-text-accent {:name "package"
                               :size "xs"}]
     [:code.text-sm.font-mono.font-semibold.truncate pkg]
     [:ty-icon.ty-text-- {:name "external-link"
                          :size "xs"}]]
    [:div.flex.items-center.gap-2.flex-shrink-0
     (click-to-copy {:text install-cmd
                     :title (str "Copy `" install-cmd "`")})]]
   [:div.flex.items-center.gap-2
    [:span.text-xs.font-bold.tracking-widest.uppercase
     {:class (str "ty-text-" ecosystem-flavor)}
     ecosystem]
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
       [:span.text-xs.font-medium.ty-text--.tracking-widest.uppercase "Two ecosystems, one role each"]]

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
         "NPM gives you the components and (optional) React wrappers. "
         "Clojars gives you the CLJS-native infrastructure: " (fw "router") ", "
         (fw "i18n") ", " (fw "layout") ", and tree-shakeable " (fw "icons") "."]]]

      [:div.flex.flex-wrap.gap-2.mb-6
       (feature-pill {:icon "layers"  :label "Closure tree-shaking"})
       (feature-pill {:icon "code"    :label "shadow-cljs npm interop"})
       (feature-pill {:icon "box"     :label "Web Components"})
       (feature-pill {:icon "globe"   :label "i18n + router"})]

      [:div.flex-1]

      [:div.flex.items-center.gap-2.text-sm.font-medium.ty-text-
       [:ty-icon.ty-text-accent {:name "info"
                                 :size "xs"}]
       [:span "Skip the bundler entirely with the CDN script tag — see the next section."]]]

     ;; RIGHT — package preview + install commands
     [:div.flex.flex-col.gap-4

      [:div.ty-floating.rounded-xl.p-5
       {:style {:border "1px solid var(--ty-border-)"}}
       [:div.flex.items-center.justify-between.mb-4
        [:span.text-xs.font-bold.ty-text--.tracking-widest.uppercase "Packages"]
        [:span.text-xs.ty-text--.font-medium.tracking-widest.uppercase "npm + Clojars"]]
       [:div.flex.flex-col.gap-2
        (pkg-row {:pkg "tyrell-components"
                  :ecosystem "NPM · Always"
                  :ecosystem-flavor "success"
                  :subtitle "Web components, CSS, icons"
                  :install-cmd "npm install tyrell-components"
                  :link "https://www.npmjs.com/package/tyrell-components"})
        (pkg-row {:pkg "tyrell-react"
                  :ecosystem "NPM · React libs only"
                  :ecosystem-flavor "neutral"
                  :subtitle "Reagent · re-frame · UIx · Helix"
                  :install-cmd "npm install tyrell-react"
                  :link "https://www.npmjs.com/package/tyrell-react"})
        (pkg-row {:pkg "dev.gersak/tyrell"
                  :ecosystem "Clojars · Recommended"
                  :ecosystem-flavor "accent"
                  :subtitle "Router · i18n · layout · shim"
                  :install-cmd "dev.gersak/tyrell {:mvn/version \"1.0.0-RC5\"}"
                  :link "https://clojars.org/dev.gersak/tyrell"})
        (pkg-row {:pkg "dev.gersak/tyrell-icons"
                  :ecosystem "Clojars · If you use icons"
                  :ecosystem-flavor "accent"
                  :subtitle "Tree-shakeable icon defs"
                  :install-cmd "dev.gersak/tyrell-icons {:mvn/version \"1.0.0-RC5\"}"
                  :link "https://clojars.org/dev.gersak/tyrell-icons"})]]

      [:div
       (common/code-block
        ";; deps.edn or shadow-cljs.edn
{:deps {dev.gersak/tyrell       {:mvn/version \"1.0.0-RC5\"}
        dev.gersak/tyrell-icons {:mvn/version \"1.0.0-RC5\"}}}

# package.json
npm install tyrell-components
# Plus, only if you use a React lib:
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
      "Skip the all-in-one " [:code.font-mono.text-xs "[\"tyrell-components\"]"]
      " require; pull in just the elements your app renders."]
     (common/code-block
      "(ns my-app.core
  (:require [\"tyrell-components/css/tyrell.css\"]
            [\"tyrell-components/button\"]
            [\"tyrell-components/input\"]
            [\"tyrell-components/dropdown\"]
            [\"tyrell-components/option\"]      ; dropdown children
            [\"tyrell-components/modal\"]))"
      "clojure")
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
    "Pick one — they're mutually exclusive. shadow-cljs npm interop gives Closure tree-shaking and synchronous icon registration. CDN gives zero build for prototypes or static-host deployments."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4.mb-4
    (compact-stack-card
     {:eyebrow "Recommended"
      :eyebrow-flavor "success"
      :icon "package"
      :title "shadow-cljs npm interop"
      :tagline [(fw "shadow-cljs") " resolves the npm package and bundles components into your "
                [:code.font-mono.text-xs "main.js"] ". One side-effecting require registers all "
                (fw "<ty-*>") " elements."]
      :snippet "(ns my-app.core
  (:require [\"tyrell-components\"]))"
      :snippet-lang "clojure"
      :cta "Skim subpath imports"
      :on-click (fn [^js _]
                  (when-let [el (js/document.getElementById "subpath")]
                    (.scrollIntoView el #js {:behavior "smooth"
                                             :block "start"})))})
    (compact-stack-card
     {:eyebrow "Zero build"
      :icon "zap"
      :title "CDN script tag"
      :tagline ["Paste two tags into " [:code.font-mono.text-xs "<head>"]
                " — works for prototypes, static hosting, or any non-shadow build."]
      :snippet "<link rel=\"stylesheet\"
      href=\"…/tyrell.css\">
<script type=\"module\"
        src=\"…/tyrell.js\"></script>"
      :snippet-lang "html"
      :cta "Self-hostable too"
      :on-click #(router/navigate! :tyrell.site.docs/htmx)})]

   [:div {:id "subpath"}
    (subpath-callout)]])

;; =============================================================================
;; Section 4 — Your framework
;; =============================================================================

(defn- framework-card
  [opts]
  (compact-stack-card opts))

(defn- scroll-to-deep-dive! [^js _]
  (.scrollTo js/window
             #js {:top (-> (js/document.getElementById "react-libs-deep-dive")
                           (.getBoundingClientRect)
                           (.-top)
                           (+ js/window.scrollY -24))
                  :behavior "smooth"}))

(defn- frameworks []
  [:div
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "layers"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Your framework"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "React-based libraries get typed wrappers via " (fw "tyrell-react") ". "
    "Replicant and vanilla CLJS use the " (fw "<ty-*>") " elements directly — events flow naturally without a wrapper."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
    (framework-card
     {:eyebrow "Typed wrappers"
      :icon "atom"
      :title "Reagent · re-frame"
      :tagline ["Most-used CLJS-React combo. " (fw "[:> ty/Button ...]") " interop with hiccup; re-frame's "
                (fw "subscribe") " / " (fw "dispatch") " plug in unchanged."]
      :snippet "(:require [\"tyrell-react\" :as ty])

[:> ty/Input
 {:value @email
  :on-change #(reset! email
                (.. % -detail -value))}]
[:> ty/Button {:flavor \"primary\"} \"Save\"]"
      :snippet-lang "clojure"
      :cta "Read patterns"
      :on-click scroll-to-deep-dive!})

    (framework-card
     {:eyebrow "Typed wrappers"
      :icon "react"
      :title "UIx"
      :tagline ["Modern hooks-style with " (fw "($ ty/Component …)") " macro form. Same wrapper, different surface syntax."]
      :snippet "(:require [\"tyrell-react\" :as ty]
          [uix.core :refer [defui $]])

(defui form []
  ($ ty/Input {:value @email
               :on-change on-email})
  ($ ty/Button {:flavor \"primary\"} \"Save\"))"
      :snippet-lang "clojure"
      :cta "Read patterns"
      :on-click scroll-to-deep-dive!})

    (framework-card
     {:eyebrow "Typed wrappers"
      :icon "react"
      :title "Helix"
      :tagline ["JSX-style macros over the same React wrappers. Idiomatic " (fw "($ ty/Button …)") " inside "
                (fw "defnc") " components."]
      :snippet "(:require [\"tyrell-react\" :as ty]
          [helix.core :refer [defnc $]])

(defnc form []
  ($ ty/Input {:value @email
               :on-change on-email})
  ($ ty/Button {:flavor \"primary\"} \"Save\"))"
      :snippet-lang "clojure"
      :cta "Read patterns"
      :on-click scroll-to-deep-dive!})

    (framework-card
     {:eyebrow "Native"
      :icon "lambda"
      :title "Replicant · Vanilla CLJS"
      :tagline ["Raw " (fw "<ty-*>") " elements, no wrapper. Replicant's "
                (fw ":on {:change …}") " receives " [:code.font-mono.text-xs "event.detail"] " directly."]
      :snippet "[:ty-input
 {:label \"Email\"
  :on {:change
       (fn [^js e]
         (swap! state assoc :email
           (.. e -detail -value)))}}]
[:ty-button {:flavor \"primary\"} \"Save\"]"
      :snippet-lang "clojure"
      :cta "Read Replicant guide"
      :on-click #(js/window.open "https://github.com/gersak/tyrell/blob/master/guides/clj/REPLICANT_TY_GUIDE.md" "_blank")})]])

;; =============================================================================
;; Section 5 — React-libs deep-dive (full-width hero card with live preview)
;; =============================================================================

(defn- react-libs-deep-dive []
  [:div {:id "react-libs-deep-dive"}
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "react"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "tyrell-react: bridges the event gap"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "The headline reason to install " (fw "tyrell-react") ": React's synthetic event system doesn't pick up Custom Events from web components. "
    "The wrapper attaches listeners on the underlying " (fw "<ty-*>") " element so "
    [:code.font-mono.text-xs.ty-text ":on-change"]
    " fires with " [:code.font-mono.text-xs.ty-text "event.detail.value"]
    " — the way you'd expect in any React-based CLJS lib."]

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
        [:span.text-xs.font-medium.ty-text--.tracking-widest.uppercase "Reagent · re-frame · UIx · Helix"]]

       [:div.flex.items-start.gap-4.mb-5
        [:div.flex.items-center.justify-center.rounded-xl.ty-bg-accent-.flex-shrink-0
         {:style {:width "56px"
                  :height "56px"}}
         [:ty-icon.ty-text-accent++ {:name "react"
                                     :size "lg"}]]
        [:div.flex-1.min-w-0
         [:h3.text-3xl.font-bold.ty-text++.tracking-tight.leading-tight.mb-2
          "Idiomatic React in CLJS"]
         [:p.text-base.ty-text.font-normal.leading-relaxed
          "Same components, React-shaped events. " (fw ":as ty") " keeps the namespace explicit; each wrapper also exports under "
          (fw "TyButton") " if you prefer the long form."]]]

       [:div.flex.flex-wrap.gap-2.mb-6
        (feature-pill {:icon "shield"      :label "event.detail bridging"})
        (feature-pill {:icon "arrow-right" :label "Reagent + UIx + Helix"})
        (feature-pill {:icon "link"        :label "Ref forwarding"})
        (feature-pill {:icon "feather"     :label "Zero overhead"})]

       [:div.flex-1]

       [:div.flex.items-center.gap-2.text-sm.font-medium.ty-text-
        [:ty-icon.ty-text-accent {:name "book-open"
                                  :size "xs"}]
        [:span "Imperative refs cover " (fw "ty-modal") ", " (fw "ty-popup") ", and " (fw "ty-scroll-container") "."]]]

      ;; RIGHT — live preview + matching Reagent code
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
         "(ns my-app.core
  (:require [\"tyrell-components\"]
            [\"tyrell-react\" :as ty]
            [reagent.core :as r]))

(defn signup-form []
  (let [email (r/atom \"\")]
    (fn []
      [:form
       [:> ty/Input
        {:label \"Email\"
         :placeholder \"you@example.com\"
         :value @email
         :on-change #(reset! email
                       (.. % -detail -value))}
        [:> ty/Icon {:slot \"start\" :name \"mail\"}]]
       [:> ty/Button {:flavor \"primary\" :pill true}
        [:> ty/Icon {:slot \"start\" :name \"send\"}]
        \"Sign up\"]])))"
         "clojure")]]]]]])

;; =============================================================================
;; Section 6 — Two gotchas
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
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Four CLJS-specific things to know"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "Each one bites exactly once."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
    (gotcha-card
     {:eyebrow "Event payloads"
      :icon "arrow-right"
      :title "Read event.detail from JS interop"
      :body ["Custom events fire with their payload on " (fw "event.detail") ", not the event itself. "
             "From CLJS, use " (fw "(.. e -detail -value)") " or " (fw "j/get-in") " — same shape across Reagent, UIx, Helix, Replicant."]
      :code "(fn [^js e]
  (let [v (.. e -detail -value)]
    (reset! state v)))

;; tyrell-react does the same bridging for React's
;; synthetic-event system — so :on-change just works."
      :code-lang "clojure"})

    (gotcha-card
     {:eyebrow "React wrappers"
      :icon "code"
      :title "Use :on-change, not :on-input"
      :body ["The wrapper exposes the raw " (fw "CustomEvent") " through "
             (fw ":on-change") "; React's "
             (fw ":on-input") " produces a SyntheticEvent that strips "
             [:code.font-mono.text-xs "event.detail"]
             ". Same applies to TyTextarea. (TC11+ logs a warning and forwards automatically.)"]
      :code ";; ✅ wrapper attaches addEventListener('input', …)
;;    and hands you the CustomEvent unchanged
[:> ty/Input
 {:value @email
  :on-change #(reset! email (.. % -detail -value))}]

;; ❌ React's onInput → SyntheticEvent → no .detail
;;    you'll get `Cannot read property 'value' of undefined`"
      :code-lang "clojure"})

    (gotcha-card
     {:eyebrow "Tree-shaking"
      :icon "scissors"
      :title "Icon must be both imported AND registered"
      :body ["Two independent steps. Skip either and " (fw "<ty-icon name=\"x\">") " renders blank — no console error. "
             "(a) Import the def so Closure " (fw ":advanced") " keeps it. "
             "(b) Pass it into " (fw "icons/register!") " so the runtime registry knows about it."]
      :code "(:require [tyrell.icons :as icons]
          [tyrell.lucide :as lucide])

;; ✅ imported AND registered → renders
(icons/register! {:check lucide/check})

;; ❌ imported but not registered → blank
;; ❌ registered but the def wasn't imported → DCE removed it, blank
;; ❌ dynamic name `(symbol \"lucide\" n)` → DCE can't follow, blank
;;
;; If an icon doesn't show up: it's almost always one of these three."
      :code-lang "clojure"})

    (gotcha-card
     {:eyebrow "Imperative refs"
      :icon "rocket"
      :title "Modals & popups: ref + .show() / .hide()"
      :body ["Web component dialogs expose imperative methods. The wrapper "
             "forwards refs via " (fw "useImperativeHandle")
             ", so CLJS-React libs use "
             (fw "use-ref") " plus interop on the " [:code.font-mono.text-xs ".current"]
             " value — same React idiom as JSX-land."]
      :code ";; Helix / UIx
(let [modal-ref (hooks/use-ref nil)]
  ($ ty/Button
     {:on-click #(when-let [^js m (.-current modal-ref)]
                   (.show m))}
     \"Open\")
  ($ ty/Modal {:ref modal-ref} …))

;; Reagent
(let [modal-ref (atom nil)]
  [:> ty/Modal {:ref #(reset! modal-ref %)} …])"
      :code-lang "clojure"})]])

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
      "All 21 components ship at " [:strong.ty-text "~200 KB minified"] ". "
      "The icon registry starts empty — you only pay for icons you reference. "
      "For CLJS, " (fw "dev.gersak/tyrell-icons") " is the cleanest path because Closure "
      (fw ":advanced") " removes unused defs natively. "
      "The npm leaf-module path (" (fw "tyrell-components/icons/lucide") ") works too, "
      "tree-shaken via shadow-cljs's " [:code.font-mono.text-xs "sideEffects"] " awareness."]
     [:div.flex.items-center.gap-1.5.text-sm.font-semibold.ty-text-accent
      [:button.ty-text-accent.cursor-pointer.hover:underline.bg-transparent.p-0
       {:style {:border "none"}
        :on {:click #(router/navigate! :tyrell.site.docs/getting-started)}}
       "See the three icon-registration patterns on Getting Started"]
      [:ty-icon {:name "arrow-right"
                 :size "xs"}]]]]])

;; =============================================================================
;; Section 8 — Next steps
;; =============================================================================

(defn- next-steps []
  [:div.ty-bg-accent-.rounded-xl.p-6
   {:style {:border "1px solid var(--ty-border-neutral-mild)"}}
   [:div.flex.items-center.gap-3.mb-5
    [:ty-icon.ty-text-accent+.flex-shrink-0 {:name "check-circle"
                                             :size "lg"}]
    [:h2.text-xl.font-bold.ty-text++.tracking-tight "Then what?"]]
   [:div.space-y-3
    (next-step "grid"      "Browse the components index for APIs and live demos")
    (next-step "palette"   "Read the CSS system — semantic colors, surfaces, text hierarchy")
    (next-step "rocket"    "Skim the live examples — User Profile, Event Booking, Contact Form")
    (next-step "book-open" "Router, i18n, and layout deep-dives live in the GitHub guides folder")]])

;; =============================================================================
;; Main view
;; =============================================================================

(defn view
  "ClojureScript guide — substrate for every CLJS framework, deep-dive on React libs."
  []
  (common/docs-page
   (hero)
   (install-card)
   (load-options)
   (frameworks)
   (react-libs-deep-dive)
   (gotchas)
   (bundle-size-callout)
   (next-steps)))
