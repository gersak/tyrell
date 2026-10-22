(ns tyrell.site.docs.icons-guide
  "Getting started with icons: where each set ships, how to register them per
   stack, and how to keep unused icons out of a release."
  (:require [tyrell.site.docs.common :refer [doc-page hero-shell page-section code-view code-tabs
                                            example link-card]]
            [tyrell.site.versions :as v]))


(def ^:private surface {:background "var(--ty-surface-content)"})

(defn- code-card
  "Titled code panel. compact code: no gutter, small type."
  [title hint code lang]
  [:div.min-w-0.flex.flex-col.rounded-xl.border.ty-border-.overflow-hidden {:style surface}
   [:div.flex.items-center.justify-between.gap-3.px-4.py-2.border-b.ty-border-
    [:span.text-xs.font-semibold.ty-text++ title]
    (when hint [:span.text-xs.font-mono.ty-text-- hint])]
   [:div.flex-1.site-chrome {:data-ty-theme ""} (code-view code lang {:compact? true})]])

(def ^:private sets
  ;; [set variants npm clojure count]
  [["Lucide" nil "tyrell-components/icons/lucide" "tyrell.lucide" "~1,850"]
   ["Heroicons" "outline · solid · mini · micro" "tyrell-components/icons/heroicons/*" "tyrell.heroicons.*" "324 each"]
   ["Material" "filled · outlined · round · sharp · two-tone" "tyrell-components/icons/material/*" "tyrell.material.*" "~2,150 each"]
   ["Font Awesome 6" "solid · regular · brands" "tyrell-components/icons/fontawesome/*" "tyrell.fav6.*" "1,984 · 273 · 549"]])

(def ^:private steps
  [["JavaScript" "js" "npm + bundler"
    ["import { chevronDown }\n  from 'tyrell-components/icons/lucide'" "javascript"]
    ["import { registerIcons }\n  from 'tyrell-components/icons/registry'\n\nregisterIcons({\n  'action-down': chevronDown\n})" "javascript"]
    ["<ty-icon name=\"action-down\">\n</ty-icon>" "html"]]
   ["ClojureScript" "clojure" "shadow-cljs"
    ["(:require\n  [tyrell.lucide :as lucide])" "clojure"]
    ["(:require\n  [tyrell.icons :as icons])\n\n(icons/register!\n  {:action-down\n   lucide/chevron-down})" "clojure"]
    ["[:ty-icon {:name \"action-down\"}]" "clojure"]]])

(defn view []
  (doc-page
   (hero-shell
    [:div.relative.flex.flex-col.gap-5.p-8.md:p-12 {:style {:max-width "46rem"}}
     [:span.text-xs.font-semibold.uppercase.ty-text-primary {:style {:letter-spacing "0.16em"}} "Getting started"]
     [:h1.ty-text++.font-bold
      {:style {:font-size "clamp(2.75rem, 6vw, 4.25rem)" :line-height "1" :letter-spacing "-0.045em"}}
      "Icons"]
     [:p.ty-text-.leading-relaxed
      "Register SVGs under names you pick, then write " [:code "<ty-icon name=\"…\">"]
      ". Tyrell bundles no icon sets, so you ship only what you register."]])

   (page-section
    {:title "Icon sets"
     :sub [:span "JavaScript imports from " [:code "tyrell-components"] ", Clojure requires from the "
           [:code "dev.gersak/tyrell-icons-*"] " jars. One export or def per icon."]}
    [:div.rounded-2xl.border.ty-border-.overflow-x-auto {:style surface}
     [:table.w-full.text-sm {:style {:min-width "640px"}}
      [:thead
       [:tr.text-left.text-xs.uppercase.tracking-wider.ty-text--.border-b.ty-border-
        (for [h ["Set" "npm" "Clojure" "Icons"]]
          [:th.px-5.py-3.font-semibold {:replicant/key h} h])]]
      [:tbody
       (for [[s variants npm clj n] sets]
         [:tr.align-top.border-b.ty-border-.last:border-b-0 {:replicant/key s}
          [:td.px-5.py-3
           [:div.font-semibold.ty-text++ s]
           (when variants [:div.text-xs.ty-text-- variants])]
          [:td.px-5.py-3.font-mono.text-xs.ty-text npm]
          [:td.px-5.py-3.font-mono.text-xs.ty-text clj]
          [:td.px-5.py-3.text-xs.ty-text- n]])]]])

   (page-section
    {:title "Import, register, use"
     :sub "For apps with a bundler. Register once at startup. The key you register is the name in the tag, so name by role (action-down) and you can swap the artwork later."}
    [:div.flex.flex-col.gap-3
     (for [[label icon sub & cells] steps]
       [:div.flex.flex-col.md:flex-row.gap-3 {:replicant/key label}
        [:div.md:w-32.shrink-0.flex.flex-col.gap-1.md:pt-3
         [:span.flex.items-center.gap-2.text-sm.font-semibold.ty-text++ [:ty-icon.ty-text- {:name icon :size "sm"}] label]
         [:span.text-xs.ty-text-- sub]]
        (for [[i [code lang]] (map-indexed vector cells)]
          [:div.flex-1.min-w-0.rounded-xl.border.ty-border-.overflow-hidden.site-chrome
           {:replicant/key i :data-ty-theme "" :style surface}
           (code-view code lang {:compact? true})])])])

   (page-section
    {:title "Use it"
     :sub "An icon takes the text color. Size and motion are attributes."}
    (example
     {:title "Size, color, motion"
      :code "<ty-icon name=\"star\" size=\"xl\"></ty-icon>
<ty-icon name=\"heart\" class=\"ty-text-danger\"></ty-icon>
<ty-icon name=\"loader\" spin></ty-icon>
<ty-icon name=\"settings\" spin tempo=\"slow\"></ty-icon>
<ty-icon name=\"bell\" pulse tempo=\"fast\"></ty-icon>"}
     ;; text-2xl: named sizes are em-based, so the row sets the base size
     [:div.flex.flex-wrap.items-center.justify-center.gap-6.text-2xl.ty-text+
      [:ty-icon {:name "star" :size "xl"}]
      [:ty-icon.ty-text-danger {:name "heart"}]
      [:ty-icon {:name "loader" :spin ""}]
      [:ty-icon {:name "settings" :spin "" :tempo "slow"}]
      [:ty-icon {:name "bell" :pulse "" :tempo "fast"}]])
    (link-card {:icon "star"
                :title "Want to know more?"
                :sub "Every ty-icon attribute, a playground and the full API."
                :to :tyrell.site.docs/icon}))

   (page-section
    {:title "HTML pages"
     :sub "Flask, Django, Go, Rails, HTMX, Datastar. Build the icons you use into one icons.js and load it right after tyrell.js. Every page and swapped fragment reuses the cached file."}
    ;; grid-cols-1 on phones: an implicit track grows to the longest code line.
    [:div.gap-4 {:class ["grid-cols-1" "md:grid-cols-3"] :style {:display "grid"}}
     [:div.flex.flex-col.gap-3
      [:span.text-sm.font-semibold.ty-text++ "1 · List the icons"]
      (code-card "icons.js" nil
                 "import { mail, chevronDown }\n  from 'tyrell-components/icons/lucide'\n\nawait customElements\n  .whenDefined('ty-icon')\nwindow.tyIcons.register({\n  mail,\n  'action-down': chevronDown\n})"
                 "javascript")]
     [:div.flex.flex-col.gap-3
      [:span.text-sm.font-semibold.ty-text++ "2 · Build it"]
      (code-card "Node" "esbuild"
                 "npx esbuild icons.js --bundle \\\n  --minify --format=esm \\\n  --outfile=static/icons.js" "bash")
      (code-card "Clojure" "no Node"
                 ":registry app.icons/registry\n:js-out   \"resources/public/icons.js\"\n\nclj -X:icons" "clojure")]
     [:div.flex.flex-col.gap-3
      [:span.text-sm.font-semibold.ty-text++ "3 · Load it in <head>"]
      (code-card "layout template" nil
                 (str "<script type=\"module\"\n  src=\"https://cdn.jsdelivr.net/npm/tyrell-components@"
                      v/TYRELL_COMPONENTS_VERSION "/dist/tyrell.js\"></script>\n"
                      "<script type=\"module\"\n  src=\"/static/icons.js\"></script>\n\n<ty-icon name=\"action-down\"></ty-icon>")
                 "html")]]
    [:p.flex.items-start.gap-2.text-sm.ty-text-
     [:ty-icon.shrink-0.mt-1.ty-text-warning {:name "alert-triangle" :size "sm"}]
     [:span "Register through " [:code "window.tyIcons"] ", as above. "
      [:code "registerIcons"] " from the npm registry fills a second copy that the CDN " [:code "<ty-icon>"] " never reads."]])

   (page-section
    {:title "Inline SVG"
     :sub "Put the SVG inside <ty-icon> and skip the registry. It sizes and colors the slotted SVG. No script needed, but the SVG repeats on every page."}
    [:div.rounded-xl.border.ty-border-.overflow-hidden
     (code-tabs
      [["jinja" "Jinja · Django" "html"
        "<ty-icon size=\"sm\">{% include \"icons/mail.svg\" %}</ty-icon>"]
       ["go" "Go" "go"
        "\"icon\": func(n string) template.HTML {\n  b, _ := icons.ReadFile(\"icons/\" + n + \".svg\")\n  return template.HTML(b)\n}\n\n<ty-icon size=\"sm\">{{ icon \"mail\" }}</ty-icon>"]
       ["hiccup" "Clojure hiccup" "clojure"
        "[:ty-icon {:size \"sm\"} (h/raw lucide/mail)]"]]
      {:compact? true})])

   (page-section
    {:title "Bundle size"
     :sub "Release builds keep only the icons your code names. Anything the compiler can't see by name ships the whole set."}
    [:div.gap-4 {:class ["md:grid-cols-2"] :style {:display "grid"}}
     (for [[flavor icon title stat stat-sub pct js clj]
           [["success" "check" "Ships what you name" "3 icons" "≈ 1 KB" "1%"
             "// named imports\nimport { mail, chevronDown, github }\n  from 'tyrell-components/icons/lucide'"
             ";; refer to the def\n(icons/register! {:mail lucide/mail})"]
            ["danger" "x" "Ships the whole set" "1,861 icons" "646 KB · 80 KB gzipped" "100%"
             "// namespace import\nimport * as lucide from 'tyrell-components/icons/lucide'\nregisterIcons(lucide)"
             ";; names the compiler can't see\n(ns-publics 'tyrell.lucide)\n(symbol \"lucide\" icon-name)"]]]
       [:div.min-w-0.flex.flex-col.rounded-2xl.border.ty-border-.overflow-hidden {:replicant/key title :style surface}
        [:div.flex.flex-col.gap-3.px-6.py-5
         [:span.flex.items-center.gap-2.text-sm.font-semibold.ty-text++
          [:span.inline-flex.items-center.justify-center.w-5.h-5.rounded-full {:class (str "ty-bg-" flavor "-")}
           [:ty-icon {:name icon :size "xs" :class (str "ty-text-" flavor)}]] title]
         [:div.flex.items-baseline.gap-3
          [:span.text-3xl.font-bold.ty-text++ {:style {:letter-spacing "-0.03em"}} stat]
          [:span.text-sm.ty-text-- stat-sub]]
         [:div.h-1.5.rounded-full.ty-bg-neutral-.overflow-hidden
          [:div.h-full.rounded-full {:style {:width pct :min-width "4px"
                                             :background (str "var(--ty-color-" flavor ")")}}]]]
        [:div.flex-1.border-t.ty-border-.site-chrome {:data-ty-theme ""}
         (code-view js "javascript" {:compact? true})
         [:div.border-t.ty-border- (code-view clj "clojure" {:compact? true})]]])]
    [:p.text-sm.ty-text-.leading-relaxed
     "Names from data or a CMS: register every candidate up front. The JVM has no tree-shaker, so a Clojure backend runs "
     [:code.whitespace-nowrap "clj -X:icons"] " to write only the used defs."])

   (page-section
    {:title "Troubleshooting"}
    [:p.text-sm.ty-text-.leading-relaxed
     "A faint circle means the name isn't registered. Check " [:code "tyIcons.has('mail')"] " and "
     [:code "tyIcons.list()"] ". Names match exactly: " [:code "chevronDown"] " is not " [:code "chevron-down"] "."])))
