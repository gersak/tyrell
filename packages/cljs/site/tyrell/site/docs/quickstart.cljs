(ns tyrell.site.docs.quickstart
  "Getting started: pick a stack, every step shows only that stack.
   Each stack is data (steps + links to the Markdown guides); the view
   renders whichever one is chosen. The choice lives in the URL
   (?stack=…) and localStorage."
  (:require
   [tyrell.router :as router]
   [tyrell.site.docs.common :as common]
   [tyrell.site.state :refer [state]]
   [tyrell.site.versions :as v]))

(def ^:private guides-url "https://github.com/gersak/ty/blob/master/guides/")

(def ^:private cdn (str "https://cdn.jsdelivr.net/npm/tyrell-components@" v/TYRELL_COMPONENTS_VERSION))

(def cdn-tags
  "Everything a plain page needs: tokens, theme, components. Also the landing CTA's CDN line."
  ;; Script first so a one-line preview reads as "load Tyrell"; module scripts
  ;; are deferred, so the stylesheets still apply before any component renders.
  (str "<script type=\"module\" src=\"" cdn "/dist/tyrell.js\"></script>\n"
       "<link rel=\"stylesheet\" href=\"" cdn "/css/tyrell.css\">\n"
       "<link rel=\"stylesheet\" href=\"" cdn "/css/tyrell-theme.css\">"))

;; --- Stacks ------------------------------------------------------------------

(def ^:private register-icons-js
  "import { registerIcons } from 'tyrell-components/icons/registry'
import { mail, send, chevronDown } from 'tyrell-components/icons/lucide'

// the key is the name <ty-icon> uses: pick any
registerIcons({ mail, send, 'action-down': chevronDown })")

(def ^:private js-icons-step
  {:title "Icons" :sub "Import it, then register it."
   :desc "Named imports, so the bundler keeps only the icons you use. Register them once at startup, then use them by name."
   :files [{:file "src/main.js" :lang "javascript" :code register-icons-js}]
   :guide ["Icons guide" :tyrell.site.docs/icons]
   :note "Skip either step and you get a faint placeholder circle, with no error." :warn? true})

(def ^:private js-deeper
  [["JavaScript reference" "Subpath imports, icon tree-shaking, code splitting, SSR." "js/JAVASCRIPT_GUIDE.md"]
   ["Icons" "Every set, tree-shaking, custom SVGs." "ICONS_GUIDE.md"]
   ["Component reference" "Every component, attribute and event." "TY_GUIDE.md"]
   ["CSS system" "Surfaces, text tiers, semantic colors." "CSS_GUIDE.md"]])

(def stacks
  [{:id "clojure" :label "Clojure" :icon "clojure" :how "deps.edn"
    :tags ["clojurescript" "reagent" "re-frame" "uix" "helix" "replicant" "hiccup" "shadow-cljs"]
    :path [["package" "One dep in deps.edn"]
           ["download" "shadow-cljs pulls the npm package"]
           ["server" "Same tags on the JVM"]]
    :steps
    [{:title "Install" :sub "One dependency."
      :desc "Add dev.gersak/tyrell. Router, i18n, layout and icons come with it. On the first build, shadow-cljs installs the tyrell-components npm package the jar declares."
      :files [{:file "deps.edn" :lang "clojure"
               :code (str "{:deps {dev.gersak/tyrell {:mvn/version \"" v/TYRELL_VERSION "\"}}}")}]
      :note "Not on shadow-cljs? Run npm install tyrell-components yourself. Reagent or UIx: also npm install tyrell-react."}
     {:title "Load" :sub "One require, two stylesheets."
      :desc "Requiring tyrell.components registers every <ty-*> element. shadow-cljs doesn't bundle CSS, so the stylesheets are linked separately."
      :files [{:file "src/app/core.cljs" :lang "clojure"
               :code "(ns app.core\n  (:require [tyrell.components]))"}
              {:file "resources/public/index.html" :lang "html"
               :code "<link rel=\"stylesheet\" href=\"css/tyrell.css\">\n<link rel=\"stylesheet\" href=\"css/tyrell-theme.css\">"}]
      :note "Copy both files from node_modules/tyrell-components/css, or link them from the CDN."}
     {:title "First component" :sub "Hiccup in, web component out."
      :desc "Replicant renders the tags as they are. Reagent and UIx go through the tyrell.react wrappers."
      :preview? true
      :tabs [["replicant" "Replicant" "clojure"
              "(defn signup [{:keys [email]}]\n  [:form\n   [:ty-input {:label \"Email\" :value email\n               :on {:change on-email}}]\n   [:ty-button {:flavor \"primary\" :size \"md\"} \"Sign up\"]])"]
             ["reagent" "Reagent" "clojure"
              "(defn signup []\n  [:form\n   [:> ty/Input {:label \"Email\" :value @email\n                 :on-change on-email}]\n   [:> ty/Button {:flavor \"primary\" :size \"md\"} \"Sign up\"]])"]
             ["uix" "UIx" "clojure"
              "(defui signup [{:keys [email on-email]}]\n  ($ :form\n     ($ ty/Input {:label \"Email\" :value email\n                  :on-change on-email})\n     ($ ty/Button {:flavor \"primary\" :size \"md\"} \"Sign up\")))"]]}
     {:title "Events" :sub "The value is on event.detail."
      :desc "Custom events carry their payload on detail, not on the event. Same shape in every Clojure UI library."
      :files [{:file "src/app/core.cljs" :lang "clojure"
               :code "(defn on-email [^js e]\n  (swap! state assoc :email (.. e -detail -value)))"}]}
     {:title "Icons" :sub "Require it, then register it."
      :guide ["Icons guide" :tyrell.site.docs/icons]
      :desc "Lucide comes with dev.gersak/tyrell as plain defs; add dev.gersak/tyrell-icons for Heroicons, Material and Font Awesome. Closure keeps only the ones you require: a release build carries just those."
      :files [{:file "src/app/icons.cljs" :lang "clojure"
               :code "(ns app.icons\n  (:require [tyrell.icons :as icons]\n            [tyrell.lucide :as lucide]))\n\n;; the key is the name <ty-icon> uses: pick any\n(icons/register! {:mail        lucide/mail\n                  :action-down lucide/chevron-down})\n\n[:ty-icon {:name \"action-down\"}]"}]
      :note "Skip either step and you get a faint placeholder circle, with no error." :warn? true}
     {:title "On the server" :sub "Same tags from the JVM."
      :desc "Render the tags with hiccup. Fields submit with the form like native inputs, so the handler reads params as usual. Icon defs are .cljc, so the server can inline them too."
      :files [{:file "src/app/pages.clj" :lang "clojure"
               :code "(ns app.pages\n  (:require [hiccup2.core :as h]\n            [tyrell.lucide :as lucide]))\n\n(defn signup-form []\n  [:form {:method \"post\" :action \"/signup\"}\n   [:ty-input {:name \"email\" :label \"Email\" :required true}\n    [:ty-icon {:slot \"start\"} (h/raw lucide/mail)]]\n   [:ty-button {:type \"submit\" :flavor \"primary\" :size \"md\"} \"Sign up\"]])"}]
      :note "The page still loads the two stylesheets and tyrell.js, from the CDN or your static files."}]
    :deeper [["ClojureScript reference" "Distribution, shadow-cljs, interop, icon tree-shaking." "clj/CLOJURESCRIPT_GUIDE.md"]
             ["Replicant" "Raw <ty-*> hiccup, events, forms." "clj/REPLICANT_TY_GUIDE.md"]
             ["Reagent" "tyrell.react wrappers with :>." "clj/REAGENT_TY_GUIDE.md"]
             ["UIx" "Wrappers with $ and hooks." "clj/UIX_TY_GUIDE.md"]
             ["Helix" "Wrappers with defnc." "clj/HELIX_TY_GUIDE.md"]
             ["Icons" "Every set, tree-shaking, server-side." "ICONS_GUIDE.md"]
             ["Routing" "tyrell.router: tree routes, history." "clj/ROUTING_GUIDE.md"]
             ["i18n" "Translations, Intl numbers and dates." "clj/I18N_GUIDE.md"]
             ["Layout" "Container-aware breakpoints." "clj/LAYOUT_GUIDE.md"]
             ["Code splitting" "Lazy-load modules and routes." "clj/CODE_SPLITTING.md"]
             ["Your own components" "Render functions as web components." "clj/COMPONENT_GUIDE.md"]]}

   {:id "html" :label "HTML" :icon "html5" :how "script tags"
    :tags ["htmx" "datastar" "server" "ssr" "cdn" "flask" "django" "rails" "phoenix" "php" "laravel"]
    :path [["code" "Three tags in <head>"]
           ["circle-slash" "No install, no build"]
           ["send" "Forms post natively"]]
    :steps
    [{:title "Load" :sub "Three tags, no build."
      :desc "Paste them into <head>. The script registers every <ty-*> element; the stylesheets bring the tokens and the theme."
      :files [{:file "index.html" :lang "html"
               :code cdn-tags}]
      :note "Or self-host the three files. Any backend works: it only has to send HTML."}
     {:title "First component" :sub "Tags in, components out."
      :desc "Write the tags in any template: Jinja, ERB, Blade, Hiccup, plain HTML."
      :preview? true
      :files [{:file "signup.html" :lang "html"
               :code "<ty-input name=\"email\" label=\"Email\" required></ty-input>\n<ty-button type=\"submit\" flavor=\"primary\" size=\"md\">Sign up</ty-button>"}]}
     {:title "Forms" :sub "Posts like a native input."
      :desc "Give a field a name and it joins the form data. required and the validity API work as on <input>, so the browser blocks an empty submit."
      :files [{:file "signup.html" :lang "html"
               :code "<form method=\"post\" action=\"/signup\">\n  <ty-input name=\"email\" label=\"Email\" required></ty-input>\n  <ty-button type=\"submit\" size=\"md\">Sign up</ty-button>\n</form>\n\n<!-- the server reads it as usual: form[\"email\"] -->"}]}
     {:title "Events" :sub "Only if you need JavaScript."
      :desc "Custom events carry the value on detail, not on the event."
      :files [{:file "signup.html" :lang "html"
               :code "<script>\n  document.querySelector('ty-input')\n    .addEventListener('change', (e) => console.log(e.detail.value))\n</script>"}]}
     {:title "Icons" :sub "One cached icons.js."
      :guide ["Icons guide" :tyrell.site.docs/icons]
      :desc "Build the icons you use into a small icons.js, load it right after tyrell.js, and write names in your templates. The browser caches it for every page and fragment. No build step at all? Put the SVG inside the tag instead."
      :files [{:file "icons.js" :lang "javascript"
               :code "// build: npx esbuild icons.js --bundle --minify \\\n//          --format=esm --outfile=static/icons.js\nimport { mail } from 'tyrell-components/icons/lucide'\n\nawait customElements.whenDefined('ty-icon')\nwindow.tyIcons.register({ mail })"}
              {:file "layout.html" :lang "html"
               :code "<script type=\"module\" src=\"/static/icons.js\"></script>\n\n<ty-icon name=\"mail\"></ty-icon>"}]}
     {:title "HTMX & Datastar" :sub "Attributes go on the tag."
      :desc "The components survive swaps and morphs. Put hx-* or data-* straight on them."
      :files [{:file "htmx" :lang "html"
               :code "<ty-button hx-post=\"/save\" hx-target=\"#result\">Save</ty-button>"}
              {:file "datastar" :lang "html"
               :code "<ty-button data-on:click=\"@post('/save')\">Save</ty-button>"}]}]
    :deeper [["HTMX" "FormData, bubbling change, swaps." "js/HTMX_TY_GUIDE.md"]
             ["Datastar" "SSE-driven UIs, morph-safe." "DATASTAR_TY_GUIDE.md"]
             ["Icons" "Slot mode, window.tyIcons, custom SVGs." "ICONS_GUIDE.md"]
             ["Component reference" "Every component, attribute and event." "TY_GUIDE.md"]
             ["CSS system" "Surfaces, text tiers, semantic colors." "CSS_GUIDE.md"]]}

   {:id "react" :label "React" :icon "react" :how "npm + wrappers"
    :tags ["javascript" "typescript" "jsx" "next" "npm"]
    :path [["package" "Components + typed wrappers"]
           ["braces" "e.detail typed in handlers"]
           ["server" "'use client' under SSR"]]
    :steps
    [{:title "Install" :sub "Two packages."
      :desc "tyrell-components holds the components, CSS and icons. tyrell-react adds typed wrappers with React-style props and events."
      :files [{:file "terminal" :lang "bash" :code "npm install tyrell-components tyrell-react"}]}
     {:title "Load" :sub "Three imports at the entry."
      :desc "The CSS first, then one import that registers every <ty-*> element."
      :files [{:file "src/main.tsx" :lang "javascript"
               :code "import 'tyrell-components/css/tyrell.css'\nimport 'tyrell-components/css/tyrell-theme.css'\nimport 'tyrell-components'"}]
      :note "Next.js and other SSR: customElements needs a browser, so import these in a 'use client' component."}
     {:title "First component" :sub "JSX in, web component out."
      :desc "The wrappers render the <ty-*> element underneath and pass your handlers the native event."
      :preview? true
      :files [{:file "src/Signup.tsx" :lang "javascript"
               :code "import { useState } from 'react'\nimport { TyButton, TyInput } from 'tyrell-react'\n\nexport function Signup() {\n  const [email, setEmail] = useState('')\n  return (\n    <form>\n      <TyInput label=\"Email\" value={email}\n        onChange={(e) => setEmail(e.detail.value)} />\n      <TyButton flavor=\"primary\" size=\"md\">Sign up</TyButton>\n    </form>\n  )\n}"}]}
     {:title "Events" :sub "The value is on e.detail."
      :desc "onChange fires as you type and hands you the component's CustomEvent. onChangeCommit fires once, on blur. Skip onInput: React strips detail."
      :files [{:file "src/Signup.tsx" :lang "javascript"
               :code "<TyInput\n  onChange={(e) => setEmail(e.detail.value)}\n  onChangeCommit={(e) => save(e.detail.value)} />"}]}
     (assoc-in js-icons-step [:files 0 :file] "src/main.tsx")]
    :deeper (into [["React guide" "Wrappers, controlled inputs, refs, SSR." "js/REACT_TY_GUIDE.md"]] js-deeper)}

   {:id "vue" :label "Vue" :icon "vuejs" :how "npm"
    :tags ["javascript" "typescript" "nuxt" "npm"]
    :path [["package" "One npm package"]
           ["settings" "One compiler option"]
           ["box" "Native elements, no wrapper"]]
    :steps
    [{:title "Install" :sub "One package."
      :desc "Vue renders custom elements natively, so there's no wrapper package."
      :files [{:file "terminal" :lang "bash" :code "npm install tyrell-components"}]}
     {:title "Tell Vue" :sub "ty-* are custom elements."
      :desc "Without this, Vue tries to resolve <ty-button> as a Vue component and warns."
      :files [{:file "vite.config.js" :lang "javascript"
               :code "export default defineConfig({\n  plugins: [\n    vue({\n      template: {\n        compilerOptions: {\n          isCustomElement: (tag) => tag.startsWith('ty-'),\n        },\n      },\n    }),\n  ],\n})"}]}
     {:title "Load" :sub "Three imports at the entry."
      :desc "The CSS first, then one import that registers every <ty-*> element."
      :files [{:file "src/main.js" :lang "javascript"
               :code "import 'tyrell-components/css/tyrell.css'\nimport 'tyrell-components/css/tyrell-theme.css'\nimport 'tyrell-components'"}]}
     {:title "First component" :sub "Tags in the template."
      :desc "Bind with :value, listen with @change. The value is on $event.detail."
      :preview? true
      :files [{:file "src/Signup.vue" :lang "html"
               :code "<script setup>\nimport { ref } from 'vue'\nconst email = ref('')\n</script>\n\n<template>\n  <form>\n    <ty-input label=\"Email\" :value=\"email\"\n      @change=\"email = $event.detail.value\" />\n    <ty-button flavor=\"primary\" size=\"md\">Sign up</ty-button>\n  </form>\n</template>"}]}
     js-icons-step]
    :deeper (into [["Vue guide" "v-model, refs, Nuxt." "js/VUE_TY_GUIDE.md"]] js-deeper)}

   {:id "svelte" :label "Svelte" :icon "svelte" :how "npm"
    :tags ["javascript" "typescript" "sveltekit" "npm"]
    :path [["package" "One npm package"]
           ["check" "No compiler config"]
           ["box" "Native elements, no wrapper"]]
    :steps
    [{:title "Install" :sub "One package."
      :desc "Svelte treats any hyphenated tag as a custom element. No wrapper, no config."
      :files [{:file "terminal" :lang "bash" :code "npm install tyrell-components"}]}
     {:title "Load" :sub "Three imports at the entry."
      :desc "The CSS first, then one import that registers every <ty-*> element."
      :files [{:file "src/main.js" :lang "javascript"
               :code "import 'tyrell-components/css/tyrell.css'\nimport 'tyrell-components/css/tyrell-theme.css'\nimport 'tyrell-components'"}]
      :note "SvelteKit: customElements needs a browser, so do these imports in onMount of the root layout."}
     {:title "First component" :sub "Tags in the markup."
      :desc "Svelte 5 event attributes work on custom events. The value is on e.detail."
      :preview? true
      :files [{:file "src/Signup.svelte" :lang "html"
               :code "<script>\n  let email = $state('')\n</script>\n\n<form>\n  <ty-input label=\"Email\" value={email}\n    onchange={(e) => email = e.detail.value} />\n  <ty-button flavor=\"primary\" size=\"md\">Sign up</ty-button>\n</form>"}]
      :note "Svelte 4: on:change={…} instead of onchange."}
     js-icons-step]
    :deeper (into [["Svelte guide" "Binding, refs, SvelteKit SSR." "js/SVELTE_TY_GUIDE.md"]] js-deeper)}

   {:id "vanilla" :label "Vanilla" :icon "js" :how "npm"
    :tags ["javascript" "typescript" "astro" "vite" "npm"]
    :path [["package" "One npm package"]
           ["zap" "Any bundler"]
           ["box" "Plain DOM, no framework"]]
    :steps
    [{:title "Install" :sub "One package."
      :desc "Standard ES modules. Vite, webpack, Rollup, esbuild and Bun all work."
      :files [{:file "terminal" :lang "bash" :code "npm install tyrell-components"}]}
     {:title "Load" :sub "Three imports at the entry."
      :desc "The CSS first, then one import that registers every <ty-*> element. Or import only what you render."
      :files [{:file "src/main.js" :lang "javascript"
               :code "import 'tyrell-components/css/tyrell.css'\nimport 'tyrell-components/css/tyrell-theme.css'\nimport 'tyrell-components'\n\n// or only what you render\nimport 'tyrell-components/button'\nimport 'tyrell-components/input'"}]}
     {:title "First component" :sub "Tags in, components out."
      :desc "Write the tags in HTML, or create them like any element."
      :preview? true
      :files [{:file "index.html" :lang "html"
               :code "<ty-input id=\"email\" label=\"Email\"></ty-input>\n<ty-button flavor=\"primary\" size=\"md\">Sign up</ty-button>"}]}
     {:title "Events" :sub "The value is on e.detail."
      :desc "Custom events carry their payload on detail, not on the event."
      :files [{:file "src/main.js" :lang "javascript"
               :code "document.getElementById('email')\n  .addEventListener('change', (e) => console.log(e.detail.value))"}]}
     js-icons-step]
    :deeper js-deeper}])

(def ^:private by-id (into {} (map (juxt :id identity)) stacks))

;; --- Choice ------------------------------------------------------------------

(defn- url-stack []
  (.get (js/URLSearchParams. (.-search js/location)) "stack"))

(defn- stored-stack []
  (try (.getItem js/localStorage "tyrell.quickstart.stack") (catch :default _ nil)))

(defn current
  "The chosen stack: ?stack= first, then this session, then localStorage."
  []
  (by-id (or (some #(when (by-id %) %) [(url-stack) (:quickstart/stack @state) (stored-stack)])
             "clojure")))

(defn- remember! [id]
  (try (.setItem js/localStorage "tyrell.quickstart.stack" id) (catch :default _ nil))
  (swap! state assoc :quickstart/stack id))

(defn- choose! [id]
  (let [url (js/URL. (.-href js/location))]
    (.set (.-searchParams url) "stack" id)
    (.replaceState js/history nil "" (str (.-pathname url) (.-search url))))
  (remember! id))

(defn open!
  "Go to Getting started with stack `id`. With `replace?` the current
   history entry is swapped (redirects) instead of pushed.
   router/navigate! would pr-str the query (?stack=%22id%22), so the URL
   is built here."
  ([id] (open! id false))
  ([id replace?]
   (let [{:keys [tree base]} @router/*router*
         path (router/component-path tree :tyrell.site.docs/getting-started)
         url (str (router/maybe-add-base base path) "?stack=" id)]
     (if replace?
       (.replaceState js/history nil "" url)
       (.pushState js/history nil "" url))
     (remember! id)
     (swap! router/*router* assoc :current path))))

;; --- Hero --------------------------------------------------------------------

(defn- stack-card [{:keys [id label icon how]} active?]
  [:button.site-focus.flex.flex-col.items-start.gap-3.rounded-2xl.border.p-4.text-left.cursor-pointer.transition-colors
   {:replicant/key id
    :aria-pressed (str active?)
    :class (if active? "ty-border-primary" ["ty-border-" "hover:ty-border"])
    :style {:background (if active?
                          "color-mix(in oklch, var(--ty-color-primary) 14%, transparent)"
                          "color-mix(in oklch, var(--ty-text-strong) 4%, transparent)")}
    :on {:click #(choose! id)}}
   [:ty-icon {:name icon :size "lg" :class (if active? "ty-text-primary" "ty-text")}]
   [:span.flex.flex-col {:class ["gap-0.5"]}
    [:span.text-sm.font-semibold.ty-text++ label]
    [:span.font-mono.ty-text-- {:class (when active? "ty-text-primary") :style {:font-size "0.6875rem"}} how]]])

(defn- hero [{:keys [id label path]}]
  (common/hero-shell
   [:div.relative.flex.flex-col.gap-8.p-8.md:p-12
    [:div.flex.flex-col.lg:flex-row.lg:items-end.justify-between.gap-8
     [:div.flex.flex-col.gap-4 {:style {:max-width "30rem"}}
      [:span.text-xs.font-semibold.uppercase.ty-text-primary {:style {:letter-spacing "0.16em"}}
       "Getting started"]
      [:h1.ty-text++.font-bold
       {:style {:font-size "clamp(2.5rem, 5.5vw, 4rem)" :line-height "1.02" :letter-spacing "-0.045em"}}
       "Pick your stack."]
      [:p.ty-text-.leading-relaxed
       "Every step below follows your choice: install, load, first component, events, icons."]]
     [:div.flex.flex-col.gap-3.rounded-xl.border.ty-border-.px-5.py-4.shrink-0
      {:style {:background "color-mix(in oklch, var(--ty-text-strong) 5%, transparent)" :min-width "17rem"}}
      [:span.font-mono.text-xs.uppercase.ty-text-- {:style {:letter-spacing "0.1em"}} (str label " path")]
      (for [[icon text] path]
        [:span.flex.items-center.text-sm.ty-text {:class ["gap-2.5"] :replicant/key text}
         [:ty-icon.ty-text-primary {:name icon :size "sm"}] text])]]
    [:div.grid.gap-3 {:style {:display "grid" :grid-template-columns "repeat(auto-fit, minmax(7.5rem, 1fr))"}}
     (for [s stacks] (stack-card s (= id (:id s))))]
    [:span.inline-flex.items-center.text-xs.ty-text- {:class ["gap-1.5"]}
     [:ty-icon {:name "bookmark" :size "xs"}]
     [:span "Remembered on this device and in the link "
      [:span.whitespace-nowrap (str "(?stack=" id ").")]]]]))

;; --- Steps -------------------------------------------------------------------

(defn- code-file [{:keys [file lang code]}]
  [:div.flex.flex-col.min-w-0 {:class ["gap-1.5"] :replicant/key (str file code)}
   [:div.flex.items-center.justify-between
    [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} file]
    (common/copy-button code)]
   [:div.rounded-xl.border.ty-border-.site-chrome.overflow-hidden
    {:data-ty-theme "" :style {:background "var(--ty-surface-content)"}}
    (common/code-view code lang {:compact? true})]])

(defn- preview []
  (let [value (:quickstart/preview @state)]
    [:div.flex.flex-col.gap-3.rounded-xl.border.ty-border-.p-5
     {:style {:background "var(--ty-surface-content)"}}
     [:div.flex.flex-wrap.items-end.gap-3
      [:ty-input.flex-1 {:label "Email" :placeholder "ada@example.com" :style {:min-width "12rem"}
                         :on {:input #(swap! state assoc :quickstart/preview (.. ^js % -detail -value))}}]
      [:ty-button {:flavor "primary" :size "md"} "Sign up"]]
     [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}}
      "e.detail.value → " [:span.ty-text (pr-str (or value ""))]]]))

(defn- tabs-file [tabs]
  [:div.rounded-xl.border.ty-border-.overflow-hidden
   (common/code-tabs tabs {:compact? true})])

(defn- guide-link
  "path: a Markdown guide on GitHub, or a site route keyword."
  [[label path]]
  (let [route? (keyword? path)]
    [:a.site-focus.inline-flex.items-center.self-start.text-sm.font-medium.ty-text-primary.no-underline.hover:underline
     (merge common/brand-scope
            {:class ["gap-1.5" (:class common/brand-scope)]}
            (if route?
              {:href "#"
               :on {:click (fn [^js e] (.preventDefault e) (router/navigate! path))}}
              {:href (str guides-url path) :target "_blank" :rel "noopener noreferrer"}))
     [:ty-icon {:name "book-open" :size "sm"}]
     label
     [:ty-icon {:name (if route? "arrow-right" "arrow-up-right") :size "xs"}]]))

(defn- step [{:keys [title sub desc note warn? files tabs preview? guide]}]
  (common/page-section
   {:title title :sub sub}
   [:div.flex.flex-wrap.gap-8
    [:div.flex.flex-col.gap-4 {:style {:flex "1 1 16rem"}}
     [:p.ty-text.leading-relaxed desc]
     (when guide (guide-link guide))
     (when note
       [:div.flex.rounded-xl.border.py-3.text-sm.leading-relaxed {:class (into ["gap-2.5" "px-3.5"] (if warn? ["ty-border-warning" "ty-bg-warning-"] ["ty-border-"]))}
        ;; One line box tall, so the icon centers on the first line of text.
        [:span.flex.items-center.shrink-0 {:style {:height "1.625em"}}
         [:ty-icon {:name (if warn? "alert-triangle" "info") :size "sm"
                    :class (if warn? "ty-text-warning" "ty-text--")}]]
        [:span.ty-text- note]])]
    [:div.flex.flex-col.gap-4.min-w-0 {:style {:flex "2 1 28rem"}}
     (when preview? (preview))
     (when tabs (tabs-file tabs))
     (for [f files] (code-file f))]]))

(defn- deeper [links]
  (common/page-section
   {:title "Go deeper" :sub "Markdown guides on GitHub."}
   [:div.gap-x-8 (merge common/brand-scope
                        {:style {:display "grid" :grid-template-columns "repeat(auto-fit, minmax(20rem, 1fr))"}})
    (for [[title desc path] links]
      [:a.flex.items-center.gap-3.py-3.border-b.ty-border-.no-underline.group
       {:replicant/key path
        :href (str guides-url path) :target "_blank" :rel "noopener noreferrer"}
       [:span.flex.flex-col.flex-1.min-w-0 {:class ["gap-0.5"]}
        [:span.text-sm.font-semibold.ty-text++.group-hover:ty-text-primary title]
        [:span.text-sm.ty-text- desc]]
       [:span.font-mono.ty-text--.hidden.sm:inline {:style {:font-size "0.6875rem"}}
        (last (.split path "/"))]
       [:ty-icon.ty-text-- {:name "arrow-up-right" :size "xs"}]])]))

(defn view []
  (let [{:keys [steps] links :deeper :as s} (current)]
    (apply common/doc-page
           (hero s)
           (concat
            (map step steps)
            [(deeper links)
             (common/pager
              {:prev {:label "Previous" :title "Welcome" :on-click #(router/navigate! :tyrell.site.core/landing)}
               :next {:label "Next" :title "Components" :on-click #(router/navigate! :tyrell.site.core/components)}})]))))
