(ns tyrell.site.docs.html
  "HTML / Server-side guide — substrate for HTMX, Datastar, Flask, Django, Rails, Phoenix, PHP."
  (:require [tyrell.router :as router]
            [tyrell.site.docs.common :as common]))

;; =============================================================================
;; Local layout helpers — parallel to docs/js_react.cljs and docs/clojurescript.cljs.
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
  "Inline framework name — heavier weight + brighter text color than tagline.
   Use for framework or concept NAMES (Flask, HTMX, Datastar, form-associated).
   For code/syntax (`{% include %}`, `name=`, `<ty-icon>`) use `c` instead."
  [name]
  [:span.font-semibold.ty-text name])

(defn- c
  "Inline code — emits a plain <code> element. The global `code:not(.hljs)` rule
   in public/index.html handles the styling: monospace, soft surface, subtle border,
   pill padding. Use for syntax/code in prose (template literals, attributes,
   element names). For framework/concept NAMES use `fw` instead."
  [text]
  [:code text])


(defn- compact-stack-card
  "Compact card with eyebrow, title, multi-line tagline, code-chip, bottom CTA.
   `:eyebrow-flavor` defaults to \"accent\" — use \"success\" for Recommended badges."
  [{:keys [icon title tagline snippet snippet-lang
           eyebrow eyebrow-flavor cta on-click]
    :or {eyebrow-flavor "accent"
         on-click identity}}]
  [:div.ty-elevated.rounded-xl.p-5.flex.flex-col
   {:class (when on-click ["cursor-pointer" "hover:shadow-lg"])
    :style (lift-card-style)
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

   (when cta
     [:div.flex.items-center.gap-1.5.text-sm.font-semibold.ty-text-primary
      [:span cta]
      [:ty-icon {:name "arrow-right"
                 :size "xs"}]])])

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
      {:name "server"
       :size "lg"}]]
    [:h1.text-4xl.font-bold.ty-text++.tracking-tight "HTML / Server-side"]]

   [:p.text-xl.ty-text.mb-3.font-normal
    "Render HTML on the server. Hydrate as web components. No bundler, no JS framework, no JSON-over-the-wire."]

   [:p.text-xs.ty-text--.tracking-widest.uppercase.font-semibold.mb-6
    "22 components · CDN · form-associated · framework-agnostic"]

   [:div.flex.flex-wrap.items-center.justify-center.gap-4.max-w-xl.mx-auto
    (brand-glyph {:icon "server"   :title "HTMX · vanilla HTML"})
    (brand-glyph {:icon "zap"      :title "Datastar · SSE-driven UIs"})
    (brand-glyph {:icon "python"   :title "Flask · Django · FastAPI"})
    (brand-glyph {:icon "php"      :title "PHP · Symfony · WordPress"})
    (brand-glyph {:icon "laravel"  :title "Laravel"})
    (brand-glyph {:icon "html5"    :title "Plain HTML"})
    (brand-glyph {:icon "terminal" :title "Any backend that emits HTML"})
    (brand-glyph {:icon "github"   :title "Open source"})]])

;; =============================================================================
;; Section 2 — Setup card (the install card equivalent — "two CDN tags")
;; =============================================================================

(defn- setup-card []
  [:div.ty-elevated.rounded-2xl.relative.overflow-hidden
   {:style {:border "1px solid var(--ty-border-)"}}

   [:div.absolute.top-0.left-0.right-0.h-2.ty-bg-accent+]

   [:div.p-6.lg:p-8

    [:div.grid.grid-cols-1.md:grid-cols-2.gap-8.mb-6

     ;; LEFT — pitch
     [:div.flex.flex-col

      [:div.flex.items-center.gap-2.mb-5
       [:span.text-xs.font-bold.ty-text-accent.tracking-widest.uppercase "Setup"]
       [:span.h-1.w-1.rounded-full.ty-bg-neutral]
       [:span.text-xs.font-medium.ty-text--.tracking-widest.uppercase "Two tags. No build."]]

      [:div.flex.items-start.gap-4.mb-5
       [:div.flex.items-center.justify-center.rounded-xl.ty-bg-accent-.flex-shrink-0
        {:style {:width "56px"
                 :height "56px"}}
        [:ty-icon.ty-text-accent++ {:name "code"
                                    :size "lg"}]]
       [:div.flex-1.min-w-0
        [:h3.text-3xl.font-bold.ty-text++.tracking-tight.leading-tight.mb-2
         "It's just HTML"]
        [:p.text-base.ty-text.font-normal.leading-relaxed
         "Tyrell's components are " (fw "form-associated custom elements") " — they post like native inputs, "
         "respond to HTMX swaps, survive Datastar morphs, and render the same in Jinja, ERB, EEx, "
         "or Twig. Paste two tags into your "
         (c "<head>")
         "."]]]

      [:div.flex.flex-wrap.gap-2.mb-6
       (feature-pill {:icon "code"      :label "Just HTML"})
       (feature-pill {:icon "form-input" :label "Form-associated"})
       (feature-pill {:icon "shuffle"   :label "HTMX / Datastar safe"})
       (feature-pill {:icon "package"   :label "No build chain"})]

      [:div.flex-1]

      [:div.flex.items-center.gap-2.text-sm.font-medium.ty-text-
       [:ty-icon.ty-text-accent {:name "info"
                                 :size "xs"}]
       [:span "Self-hostable too — drop the files into "
        (c "/static") " and serve them yourself."]]]

     ;; RIGHT — live preview + matching code
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
        [:ty-input {:name "email"
                    :label "Email"
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
        "<head>
  <link rel=\"stylesheet\"
        href=\"https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css\">
  <script type=\"module\"
          src=\"https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js\"></script>
</head>

<form method=\"POST\" action=\"/signup\">
  <ty-input name=\"email\" label=\"Email\"
            placeholder=\"you@example.com\">
    <ty-icon slot=\"start\" name=\"mail\" size=\"sm\"></ty-icon>
  </ty-input>
  <ty-button flavor=\"primary\" pill type=\"submit\">
    <ty-icon slot=\"start\" name=\"send\" size=\"sm\"></ty-icon>
    Sign up
  </ty-button>
</form>"
        "html")]]]]])

;; =============================================================================
;; Section 3 — Icons: two paths
;; =============================================================================

(defn- two-rule-callout []
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
     [:h3.text-base.font-bold.ty-text++.tracking-tight.mb-2
      "Two-rule guideline"]
     [:div.flex.flex-col.gap-2.mb-3
      [:div.flex.items-start.gap-2
       [:span.text-xs.font-bold.ty-text-accent.tracking-widest.uppercase.mt-0.5 "1"]
       [:p.text-sm.ty-text-.leading-relaxed
        [:strong.ty-text+ "Inside a tyrell slot"]
        " (button " (c "start") "/" (c "end")
        ", input start, dropdown start, etc.) — wrap your SVG in "
        (c "<ty-icon>") ". The wrapper inherits the parent component's size scale."]]
      [:div.flex.items-start.gap-2
       [:span.text-xs.font-bold.ty-text-accent.tracking-widest.uppercase.mt-0.5 "2"]
       [:p.text-sm.ty-text-.leading-relaxed
        [:strong.ty-text+ "Outside tyrell slots"]
        " — page chrome, body copy, custom layouts — raw "
        (c "<svg>") " is fine. No wrapper needed."]]]
     (common/code-block
      "<!-- Inside a slot — wrap for size contract -->
<ty-button size=\"lg\" flavor=\"primary\">
  <ty-icon slot=\"start\">
    {% include \"icons/save.svg\" %}
  </ty-icon>
  Save
</ty-button>

<!-- Outside any slot — raw SVG is fine -->
<a href=\"/help\">
  {% include \"icons/help.svg\" %} Help
</a>"
      "html")]]])

(defn- icon-paths []
  [:div
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "sparkles"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Icons: pick your path"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "Server-side stacks already ship icons as static files — Jinja "
    (c "{% include %}") ", Rails partials, ERB " (c "<%= inline_svg_tag %>") ", "
    "Phoenix function components. tyrell composes with that, it doesn't replace it."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4.mb-4
    (compact-stack-card
     {:eyebrow "Recommended"
      :eyebrow-flavor "success"
      :icon "code"
      :title "Slot mode — paste your SVG"
      :tagline ["Server-rendered SVG goes "
                [:strong.ty-text+ "between the tags"] ". No registration step, "
                "no client-side fetch, no CORS, no build. Your existing icon system stays."]
      :snippet "<ty-icon size=\"lg\">
  {% include \"icons/heart.svg\" %}
</ty-icon>"
      :snippet-lang "html"})
    (compact-stack-card
     {:eyebrow "If you outgrow inline"
      :icon "package"
      :title "Registry mode — name once, reference many"
      :tagline ["When the same icon appears in dozens of templates, register it once via "
                (c "window.tyIcons.register({...})")
                " and reference by name everywhere. Production: bundle the registration JS."]
      :snippet "<script>
  window.tyIcons.register({
    heart: '<svg viewBox=\"0 0 24 24\">…</svg>'
  })
</script>

<ty-icon name=\"heart\" size=\"lg\"></ty-icon>"
      :snippet-lang "html"})]

   (two-rule-callout)])

;; =============================================================================
;; Section 4 — Your stack (compact stack cards)
;; =============================================================================

(defn- frameworks []
  [:div
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "layers"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Your stack"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "tyrell components are HTML elements — every server-side stack can render them. "
    "These four cover ~95% of the audience; the patterns generalize to every other backend that emits HTML."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
    (compact-stack-card
     {:eyebrow "Hypermedia"
      :icon "server"
      :title "HTMX"
      :tagline ["The original. " (c "hx-*") " attributes drop into "
                (c "<ty-*>") " elements without ceremony. "
                "Server returns HTML fragments; tyrell components hydrate inside the swap."]
      :snippet "<ty-button hx-post=\"/api/save\"
           hx-target=\"#result\"
           flavor=\"primary\">
  <ty-icon slot=\"start\">
    {% include \"icons/save.svg\" %}
  </ty-icon>
  Save
</ty-button>
<div id=\"result\"></div>"
      :snippet-lang "html"
      :cta "Open HTMX guide"
      :on-click #(js/window.open "https://github.com/gersak/ty/blob/master/guides/js/HTMX_TY_GUIDE.md" "_blank")})

    (compact-stack-card
     {:eyebrow "Reactive SSE"
      :icon "zap"
      :title "Datastar"
      :tagline [(c "data-on:click") " hits a route, server "
                "streams HTML over SSE, Datastar morphs the DOM. tyrell components survive morphs cleanly."]
      :snippet "<ty-button data-on:click=\"@post('/save')\"
           flavor=\"primary\">
  <ty-icon slot=\"start\">
    {{ icon('save') | safe }}
  </ty-icon>
  Save
</ty-button>"
      :snippet-lang "html"
      :cta "Open Datastar guide"
      :on-click #(js/window.open "https://github.com/gersak/ty/blob/master/guides/DATASTAR_TY_GUIDE.md" "_blank")})

    (compact-stack-card
     {:eyebrow "Python"
      :icon "python"
      :title "Flask · Django · FastAPI"
      :tagline ["Jinja2 " (c "{% include %}")
                " inlines an SVG file at template-render time. Django works the same way. "
                "Forms post natively — " (c "name=") " on " (c "<ty-input>")
                " arrives in " (c "request.form") "."]
      :snippet "<form method=\"POST\" action=\"/transfer\">
  <ty-input name=\"recipient\" label=\"To\">
    <ty-icon slot=\"start\">
      {% include 'icons/user.svg' %}
    </ty-icon>
  </ty-input>
  <ty-button type=\"submit\" flavor=\"primary\">Send</ty-button>
</form>"
      :snippet-lang "html"
      :cta "Open Flask example"
      :on-click #(js/window.open "https://github.com/gersak/ty/tree/master/examples/htmx-flask" "_blank")})

    (compact-stack-card
     {:eyebrow "Ruby · Elixir · PHP"
      :icon "code"
      :title "Rails · ERB · Phoenix · PHP"
      :tagline ["The pattern is the same shape across every server-side template engine: "
                "render the SVG inline, wrap in " (c "<ty-icon>") " for slots, raw outside."]
      :snippet "<%# Rails / ERB %>
<ty-button flavor=\"primary\">
  <ty-icon slot=\"start\">
    <%= inline_svg_tag 'icons/save.svg' %>
  </ty-icon>
  Save
</ty-button>"
      :snippet-lang "html"
      :cta "Open agent instructions"
      :on-click #(js/window.open "https://github.com/gersak/ty/blob/master/guides/AGENT_INSTRUCTIONS.md" "_blank")})]])

;; =============================================================================
;; Section 5 — Slot-mode deep-dive (full-width hero card with live preview)
;; =============================================================================

(defn- slot-mode-deep-dive []
  [:div {:id "slot-mode-deep-dive"}
   [:div.flex.items-center.gap-2.mb-2
    [:ty-icon.ty-text-accent {:name "sparkles"
                              :size "sm"}]
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Slot mode: server-rendered SVG, zero ceremony"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "The server you already have produces HTML, including SVG markup. Slot mode lets you "
    "drop that SVG straight into "
    (c "<ty-icon>")
    " — the wrapper provides size, animation, and slot-aware sizing inside other components. "
    "No registry, no fetch, no CORS, no XSS surface (server-controlled HTML)."]

   [:div.ty-elevated.rounded-2xl.relative.overflow-hidden
    {:style {:border "1px solid var(--ty-border-)"}}

    [:div.absolute.top-0.left-0.right-0.h-2.ty-bg-accent+]

    [:div.p-6.lg:p-8

     [:div.grid.grid-cols-1.md:grid-cols-2.gap-8

      ;; LEFT — feature copy
      [:div.flex.flex-col

       [:div.flex.items-center.gap-2.mb-5
        [:span.text-xs.font-bold.ty-text-accent.tracking-widest.uppercase "TC8+"]
        [:span.h-1.w-1.rounded-full.ty-bg-neutral]
        [:span.text-xs.font-medium.ty-text--.tracking-widest.uppercase "HTMX · Datastar · Jinja · ERB · EEx"]]

       [:div.flex.items-start.gap-4.mb-5
        [:div.flex.items-center.justify-center.rounded-xl.ty-bg-accent-.flex-shrink-0
         {:style {:width "56px"
                  :height "56px"}}
         [:ty-icon.ty-text-accent++ {:name "feather"
                                     :size "lg"}]]
        [:div.flex-1.min-w-0
         [:h3.text-3xl.font-bold.ty-text++.tracking-tight.leading-tight.mb-2
          "Paste it. Done."]
         [:p.text-base.ty-text.font-normal.leading-relaxed
          "Light-DOM children of " (c "<ty-icon>") " win over the registry fallback automatically. "
          "Size, " (c "spin") "/" (c "pulse") " animations, and " (c "currentColor")
          " all keep working — they apply to the host element, not the slotted SVG."]]]

       [:div.flex.flex-wrap.gap-2.mb-6
        (feature-pill {:icon "zap"        :label "No build"})
        (feature-pill {:icon "shuffle"    :label "Morph-safe"})
        (feature-pill {:icon "shield"     :label "Server-controlled"})
        (feature-pill {:icon "feather"    :label "Zero JS overhead"})]

       [:div.flex-1]

       [:div.flex.items-center.gap-2.text-sm.font-medium.ty-text-
        [:ty-icon.ty-text-accent {:name "info"
                                  :size "xs"}]
        [:span "Caches as part of your HTML response — gzip dedupes repeated SVG strings."]]]

      ;; RIGHT — live preview + matching template code
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
         ;; Slot-mode demo using a tiny inline heart SVG
         [:div.flex.items-center.gap-3
          [:ty-icon {:size "lg"
                     :class "ty-text-danger"}
           [:svg {:viewBox "0 0 24 24"
                  :fill "currentColor"}
            [:path {:d "M12 21s-7-4.5-7-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-7 11-7 11h-4z"}]]]
          [:span.ty-text "Slot-mode SVG, "
           (c "currentColor")
           " inheriting from "
           (c "ty-text-danger")]]
         [:ty-button {:flavor "primary"}
          [:ty-icon {:slot "start"}
           [:svg {:viewBox "0 0 24 24"
                  :fill "none"
                  :stroke "currentColor"
                  :stroke-width "2"
                  :stroke-linecap "round"
                  :stroke-linejoin "round"}
            [:path {:d "m22 2-7 20-4-9-9-4Z"}]
            [:path {:d "M22 2 11 13"}]]]
          "Send (slotted)"]]]

       [:div
        (common/code-block
         "<!-- Jinja / Flask -->
<ty-icon size=\"lg\" class=\"ty-text-danger\">
  {% include 'icons/heart.svg' %}
</ty-icon>

<ty-button flavor=\"primary\">
  <ty-icon slot=\"start\">
    {% include 'icons/send.svg' %}
  </ty-icon>
  Send
</ty-button>

<!-- Datastar morph -->
<ty-button data-on:click=\"@post('/save')\"
           flavor=\"primary\">
  <ty-icon slot=\"start\">
    {{ icon('save') | safe }}
  </ty-icon>
  Save
</ty-button>"
         "html")]]]]]])

;; =============================================================================
;; Section 6 — Gotchas
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
    [:h2.text-2xl.font-bold.ty-text++.tracking-tight "Two things to know"]]
   [:p.ty-text-.mb-6.font-normal.leading-relaxed
    "Each one bites exactly once."]

   [:div.grid.grid-cols-1.md:grid-cols-2.gap-4
    (gotcha-card
     {:eyebrow "Form association"
      :icon "form-input"
      :title "Posts like a native input"
      :body ["Add " (c "name=") " to any form-associated component — "
             (c "<ty-input>") ", " (c "<ty-textarea>") ", "
             (c "<ty-checkbox>") ", " (c "<ty-switch>") ", "
             (c "<ty-radio-group>") ", " (c "<ty-dropdown>") ", "
             (c "<ty-multiselect>") ", " (c "<ty-date-picker>") ", "
             (c "<ty-file-upload>") " — and it participates in form submission "
             "exactly like " (c "<input>") ". No JS required."]
      :code "<form method=\"POST\" action=\"/transfer\">
  <ty-input name=\"to\" label=\"Recipient\"></ty-input>
  <ty-input name=\"amount\" label=\"Amount\"></ty-input>
  <ty-button type=\"submit\" flavor=\"primary\">Send</ty-button>
</form>

# Flask handler — receives form data unchanged
@app.route('/transfer', methods=['POST'])
def transfer():
    return render_template('result.html',
                           to=request.form['to'],
                           amount=request.form['amount'])"
      :code-lang "html"})

    (gotcha-card
     {:eyebrow "Inline SVG"
      :icon "code"
      :title "Strip XML declarations"
      :body ["Some icon libraries ship SVG strings with a leading "
             (c "<?xml version='1.0'?>")
             " — valid in standalone " (c ".svg") " files, but "
             (fw "invalid inside HTML") ". Wrap your icon-loading helper to strip the prolog "
             "before slotting — once, in one place."]
      :code "# Python helper
def inline_svg(path):
    txt = open(f'static/icons/{path}').read()
    if txt.lstrip().startswith('<?xml'):
        txt = txt.split('?>', 1)[1]
    return txt

# Jinja filter usage
{{ inline_svg('save.svg') | safe }}"
      :code-lang "python"})]])

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
      "What you ship"]
     [:p.text-sm.ty-text-.leading-relaxed.mb-3
      "All 22 components: " [:strong.ty-text "~70 KB compressed"] " from CDN — cached across "
      "every page load and shared with anyone else using the same CDN URL. "
      "Icons aren't bundled in — you bring your own via slot mode (each SVG ~200–800 bytes inline) "
      "or via the runtime registry. Either way, you only pay for icons you actually render."]
     [:div.flex.items-center.gap-1.5.text-sm.font-semibold.ty-text-accent
      [:button.ty-text-accent.cursor-pointer.hover:underline.bg-transparent.p-0
       {:style {:border "none"}
        :on {:click #(router/navigate! :tyrell.site.docs/getting-started)}}
       "See Getting Started for the full picture"]
      [:ty-icon {:name "arrow-right"
                 :size "xs"}]]]]])

;; =============================================================================
;; Main view
;; =============================================================================

(defn view
  "HTML / Server-side guide — substrate for HTMX, Datastar, Flask, Django, Rails, Phoenix, PHP."
  []
  (common/docs-page
   (hero)
   (setup-card)
   (icon-paths)
   (frameworks)
   (slot-mode-deep-dive)
   (gotchas)
   (bundle-size-callout)))
