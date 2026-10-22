(ns tyrell.site.docs.icon
  "Documentation for ty-icon component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section link-card]]))

(def ^:private gallery
  ["home" "search" "mail" "calendar" "user" "settings" "heart" "star" "bell" "lock"
   "download" "share-2" "trash" "edit" "check" "x" "plus" "zap" "globe" "database"])

(def ^:private colors
  {"text" "ty-text+" "primary" "ty-text-primary" "success" "ty-text-success"
   "danger" "ty-text-danger" "warning" "ty-text-warning"})

(defn- snippets [{:keys [size motion tempo color]}]
  (let [attrs (str (when (not= size "md") (str " size=\"" size "\""))
                   (when (not= motion "none") (str " " motion))
                   (when (and (not= motion "none") (not= tempo "normal")) (str " tempo=\"" tempo "\"")))
        cls (when (not= color "text") (str " class=\"" (colors color) "\""))]
    [["html" "HTML" "html"
      (str "<ty-icon name=\"heart\"" attrs cls "></ty-icon>\n\n"
           "<script>\n  // register once; tree-shake the rest\n"
           "  tyIcons.register({ heart: '<svg …>' });\n</script>")]
     ["react" "React" "javascript"
      (str "import { TyIcon } from 'tyrell-react'\n\n<TyIcon name=\"heart\"" attrs
           (when cls (str " className=\"" (colors color) "\"")) " />")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n[:> ty/Icon {:name \"heart\""
           (when (not= size "md") (str " :size \"" size "\""))
           (when (not= motion "none") (str " :" motion " true"))
           (when (and (not= motion "none") (not= tempo "normal")) (str " :tempo \"" tempo "\""))
           (when cls (str " :class \"" (colors color) "\"")) "}]")]
     ["replicant" "Replicant" "clojure"
      (str "(:require [tyrell.icons :as icons]\n          [tyrell.lucide :as lucide])\n\n"
           "(icons/register! {:heart lucide/heart})\n\n"
           "[:ty-icon" (when (not= color "text") (str "." (colors color))) " {:name \"heart\""
           (when (not= size "md") (str " :size \"" size "\""))
           (when (not= motion "none") (str " :" motion " \"\""))
           (when (and (not= motion "none") (not= tempo "normal")) (str " :tempo \"" tempo "\"")) "}]")]
     ["datastar" "Datastar" "html"
      (str "<ty-button action aria-label=\"Like\"\n  data-signals:liked=\"false\"\n  data-attr:aria-pressed=\"$liked ? 'true' : 'false'\"\n  data-on:click=\"$liked = !$liked\">\n"
           "  <ty-icon name=\"heart\"" attrs cls "\n    data-class:ty-text-danger=\"$liked\"></ty-icon>\n</ty-button>\n\n"
           "<script>\n  // register once; tree-shake the rest\n"
           "  tyIcons.register({ heart: '<svg …>' });\n</script>")]]))

(defn- render-playground [{:keys [size motion tempo color]}]
  [:div.flex.flex-wrap.items-center.justify-center.gap-5 {:style {:max-width "520px"}}
   (for [n gallery]
     [:ty-icon (cond-> {:replicant/key n :name n :size size :class (colors color) :title n}
                 (not= motion "none") (assoc (keyword motion) "")
                 (and (not= motion "none") (not= tempo "normal")) (assoc :tempo tempo))])])

(defn view []
  (component-page
   {:title "Icon"
    :group "Visual"
    :tag "ty-icon"
    :description "Renders a registered SVG by name, or one you slot in. Takes its color from the text."
    :chips [["Tree-shakeable" "zap"] ["currentColor" "layers"] ["TyIcon (React)" "atom"]]
    :source "packages/core/src/components/icon.ts"
    :mark "✦"
    :demo [:div.gap-4 {:style {:display "grid" :grid-template-columns "repeat(5, 40px)"}}
           (for [[n c] [["heart" "ty-text-danger"] ["star" "ty-text-warning"] ["check" "ty-text-success"]
                        ["zap" "ty-text-primary"] ["globe" "ty-text+"] ["mail" "ty-text+"] ["lock" "ty-text-"]
                        ["bell" "ty-text-primary"] ["database" "ty-text-"] ["settings" "ty-text+"]]]
             [:ty-icon {:replicant/key n :name n :size "lg" :class c}])]}

   (playground
    {:id :icon
     :defaults {:size "md" :motion "none" :tempo "normal" :color "text"}
     :controls [{:key :size :options ["xs" "sm" "md" "lg" "xl" "2xl"]}
                {:key :color :options ["text" "primary" "success" "danger" "warning"]}
                {:key :motion :options ["none" "spin" "pulse"]}
                {:key :tempo :options ["slow" "normal" "fast"]}]
     :sub "Icons take the text color. Hover one for its name."
     :render render-playground
     :snippets snippets})

   (link-card {:icon "book-open"
               :title "Setting up icons"
               :sub "Icon sets, registration per stack, bundle size."
               :to :tyrell.site.docs/icons})

   (page-section
    {:title "Examples"}
    (bento
     (example
      {:title "Inline SVG"
       :span 2
       :description "A slotted <svg> skips the registry. Size, color and motion still apply."
       :code "<ty-icon size=\"lg\" spin>
  <svg viewBox=\"0 0 24 24\">…</svg>
</ty-icon>"}
      [:div.flex.items-center.gap-4
       [:ty-icon.ty-text-primary {:size "xl"}
        [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "none" :stroke "currentColor"
               :stroke-width "2" :stroke-linecap "round" :stroke-linejoin "round"}
         [:path {:d "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"}]]]
       [:ty-icon.ty-text-warning {:size "xl" :spin "" :tempo "slow"}
        [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "none" :stroke "currentColor"
               :stroke-width "2" :stroke-linecap "round"}
         [:circle {:cx "12" :cy "12" :r "10"}] [:path {:d "M12 6v6l4 2"}]]]])

     (example
      {:title "Sizes"
       :span 4
       :description [:span "Named sizes follow the text (" [:code "em"] "-based); numbers are exact pixels."]
       :code "size=\"xs | sm | md | lg | xl | 2xl\"
size=\"12 | 16 | 20 | 24 | 32 | 48 | 64\""}
      [:div.flex.flex-wrap.items-end.gap-4.ty-text+
       (for [s ["xs" "sm" "md" "lg" "xl" "2xl" "32" "48"]]
         [:div.flex.flex-col.items-center.gap-1 {:replicant/key s}
          [:ty-icon {:name "star" :size s}]
          [:span.text-xs.ty-text-- s]])])

     (example
      {:title "Motion"
       :span 6
       :description [:span [:code "spin"] " for work in progress, " [:code "pulse"] " for live status; " [:code "tempo"] " sets the speed."]
       :code "<ty-icon name=\"loader\" spin></ty-icon>
<ty-icon name=\"circle\" pulse tempo=\"slow\"></ty-icon>"}
      [:div.flex.flex-wrap.items-center.gap-6
       [:span.flex.items-center.gap-2.text-sm.ty-text [:ty-icon.ty-text-primary {:name "loader" :spin ""}] "Syncing"]
       [:span.flex.items-center.gap-2.text-sm.ty-text [:ty-icon.ty-text-success {:name "circle" :pulse "" :size "sm"}] "Live"]
       [:span.flex.items-center.gap-2.text-sm.ty-text [:ty-icon.ty-text-danger {:name "circle" :pulse "" :tempo "fast" :size "sm"}] "Recording"]])))

   (api-section
    {:attributes [["name" "string" "Registered icon name. Ignored when an <svg> is slotted."]
                  ["size" "string" "xs, sm, md, lg, xl, 2xl (em-based) or 12–96 (px). Default: 1em."]
                  ["spin" "boolean" "false" "Rotate continuously."]
                  ["pulse" "boolean" "false" "Fade in and out."]
                  ["tempo" "string" "slow or fast for spin and pulse."]]
     :properties [["registerIcons(map)" "Record<string, string> => void" "Add SVG strings to the registry. CDN: window.tyIcons.register."]
                  ["hasIcon(name) / getIconNames()" "" "Look up the registry. CDN: window.tyIcons.has / list."]
                  ["icons/register! (ClojureScript)" "{keyword svg}" "Same registry from tyrell.icons."]]
     :slots [["(default)" "An inline <svg>, used instead of the registry."]]
     :css-vars [["--ty-icon-size" "Default size when no size is set (1em)."]
                ["color" "Icons draw with currentColor: set the text color, e.g. ty-text-primary."]]})))
