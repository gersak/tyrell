(ns tyrell.site.docs.tooltip
  "Documentation for ty-tooltip component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(def ^:private flavors ["neutral" "primary" "success" "danger" "warning"])

(defn- snippets [{:keys [placement flavor delay]}]
  (let [attrs (str (when (not= placement "top") (str " placement=\"" placement "\""))
                   (when (not= flavor "neutral") (str " flavor=\"" flavor "\""))
                   (when (not= delay "600") (str " delay=\"" delay "\"")))
        kv (str/triml (str (when (not= placement "top") (str ":placement \"" placement "\" "))
                           (when (not= flavor "neutral") (str ":flavor \"" flavor "\" "))
                           (when (not= delay "600") (str ":delay \"" delay "\""))))]
    [["html" "HTML" "html"
      (str "<ty-button action aria-label=\"Save\">\n  <ty-icon name=\"save\"></ty-icon>\n"
           "  <ty-tooltip" attrs ">Save  ⌘S</ty-tooltip>\n</ty-button>")]
     ["react" "React" "javascript"
      (str "import { TyButton, TyIcon, TyTooltip } from 'tyrell-react'\n\n"
           "<TyButton action aria-label=\"Save\">\n  <TyIcon name=\"save\" />\n"
           "  <TyTooltip" attrs ">Save  ⌘S</TyTooltip>\n</TyButton>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/Button {:action true :aria-label \"Save\"}\n [:> ty/Icon {:name \"save\"}]\n"
           " [:> ty/Tooltip " (if (seq kv) (str "{" kv "} ") "") "\"Save  ⌘S\"]]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-button {:action \"\" :aria-label \"Save\"}\n [:ty-icon {:name \"save\"}]\n"
           " [:ty-tooltip " (if (seq kv) (str "{" kv "} ") "") "\"Save  ⌘S\"]]")]
     ["datastar" "Datastar" "html"
      (str "<ty-button action aria-label=\"Save\"\n  data-signals:save-hint=\"'Save  ⌘S'\">\n  <ty-icon name=\"save\"></ty-icon>\n"
           "  <ty-tooltip" attrs " data-text=\"$saveHint\"></ty-tooltip>\n</ty-button>")]]))

(defn- tool [icon tip attrs]
  [:ty-button {:replicant/key icon :action "" :appearance "ghost" :size "md" :aria-label tip}
   [:ty-icon {:name icon}]
   [:ty-tooltip attrs tip]])

(defn- render-playground [{:keys [placement flavor delay]}]
  (let [attrs {:placement placement :flavor flavor :delay delay}]
    [:div.flex.flex-col.items-center.gap-3
     [:div.flex.items-center.gap-1.rounded-xl.ty-floating.p-1
      (for [[i t] [["bold" "Bold  ⌘B"] ["italic" "Italic  ⌘I"] ["link" "Link  ⌘K"] ["image" "Image"]]]
        (tool i t attrs))]
     [:span.text-xs.ty-text-- "Hover or Tab onto a button. Esc hides it."]]))

(def ^:private api-snippets
  "JavaScript API card, one tab per stack."
  [["html" "HTML" "javascript"
    "const tip = document.getElementById('saved-tip');

tip.textContent = 'Saved 2 minutes ago';   // content is light DOM
tip.setAttribute('placement', 'bottom');
tip.toggleAttribute('disabled', true);    // stop showing it"]
   ["react" "React" "javascript"
    "import { TyTooltip } from 'tyrell-react'

<TyTooltip placement=\"bottom\" disabled={saving}>   {/* disabled: stop showing it */}
  Saved {ago}
</TyTooltip>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Tooltip {:placement \"bottom\" :disabled @saving?}   ; disabled: stop showing it
 (str \"Saved \" @ago)]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-tooltip {:placement \"bottom\" :disabled (when saving? \"\")}   ; disabled: stop showing it
 (str \"Saved \" ago)]"]
   ["datastar" "Datastar" "html"
    "<ty-tooltip placement=\"bottom\"
  data-attr:disabled=\"$saving\"
  data-text=\"'Saved ' + $ago\"></ty-tooltip>"]])

(defn view []
  (component-page
   {:title "Tooltip"
    :group "Overlays"
    :tag "ty-tooltip"
    :description "A short hint on hover and focus, anchored to its parent. Smart placement, a delay so it doesn't flicker, and wired to the anchor for screen readers."
    :chips [["Top layer" "layers"] ["aria-describedby" "zap"] ["TyTooltip (React)" "atom"]]
    :source "packages/core/src/components/tooltip.ts"
    :mark "?"
    ;; Copying swaps only the icon; the tooltip text stays, so it never re-positions.
    :demo (let [copied? (get-in @state/state [:tooltip-doc :copied])
                copy! (fn []
                        (-> (js/navigator.clipboard.writeText (.-href js/location))
                            (.then (fn []
                                     (swap! state/state assoc-in [:tooltip-doc :copied] true)
                                     (js/setTimeout #(swap! state/state assoc-in [:tooltip-doc :copied] false) 1500)))))]
            [:div.flex.items-center.gap-1.rounded-xl.ty-floating.p-1
             (tool "bold" "Bold  ⌘B" {})
             (tool "italic" "Italic  ⌘I" {})
             (tool "link" "Insert link  ⌘K" {})
             [:ty-button {:replicant/key "copy" :action "" :appearance "ghost" :size "md" :aria-label "Copy page link"
                          :on {:click copy!}}
              [:ty-icon {:name (if copied? "check" "copy")}]
              [:ty-tooltip "Copy page link  ⌘C"]]
             [:div.w-px.h-6.mx-1.ty-bg-neutral-]
             (tool "trash" "Delete" {:flavor "danger"})])}

   (playground
    {:id :tooltip
     :defaults {:placement "top" :flavor "neutral" :delay "600"}
     :controls [{:key :placement :options (for [side ["top" "bottom" "left" "right"] align ["-start" "" "-end"]] (str side align)) :select? true}
                {:key :flavor :options flavors :swatch? true :tones? true}
                {:key :delay :options ["0" "300" "600" "1000"]}]
     :render render-playground
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Icon-only buttons"
       :span 4
       :description [:span "The main job. The tooltip labels the icon for sighted users; keep "
                     [:code "aria-label"] " on the button, the tooltip adds itself as its description."]
       :code "<ty-button action aria-label=\"Delete\">
  <ty-icon name=\"trash\"></ty-icon>
  <ty-tooltip flavor=\"danger\">Delete forever</ty-tooltip>
</ty-button>"}
      [:div.flex.items-center.gap-2
       (tool "copy" "Duplicate" {})
       (tool "archive" "Archive" {})
       (tool "share-2" "Share" {})
       (tool "trash" "Delete forever" {:flavor "danger"})])

     (example
      {:title "Flavors"
       :span 2
       :description [:span "The same flavors as everything else. " [:code "neutral"] " is the default dark chip; the rest are solid fills."]
       :code "<ty-tooltip flavor=\"success\">"}
      [:div.flex.flex-wrap.gap-2
       (for [f ["neutral" "primary" "success" "danger"]]
         [:ty-button {:replicant/key f :size "sm" :appearance "outlined"} f
          [:ty-tooltip {:flavor f :delay "0"} (str "flavor=\"" f "\"")]])])

     (example
      {:title "On anything"
       :span 3
       :description "The anchor is the parent element, so text, tags and avatars work too. Rich content is fine; keep it short."
       :code "<span>
  3 reviewers
  <ty-tooltip>Ana, Ben and Chen</ty-tooltip>
</span>"}
      [:div.flex.flex-wrap.items-center.gap-3.text-sm
       [:span.ty-text+.underline.decoration-dotted {:tabindex "0"} "3 reviewers"
        [:ty-tooltip "Ana, Ben and Chen"]]
       [:ty-tag {:flavor "warning" :size "sm"} "Beta"
        [:ty-tooltip {:placement "bottom"} "May change before 1.0"]]])

     (example
      {:title "Delay"
       :span 3
       :description [:span [:code "delay"] " (ms) before showing. The default 600 keeps tooltips from flashing as the pointer crosses a toolbar."]
       :code "<ty-tooltip delay=\"0\">"}
      [:div.flex.items-center.gap-2
       (for [d ["0" "600" "1200"]]
         [:ty-button {:replicant/key d :size "sm" :appearance "outlined"} (str d " ms")
          [:ty-tooltip {:delay d} (str "Waited " d " ms")]])])

     (example
      {:title "JavaScript API"
       :tabs api-snippets}
      nil)))

   (page-section
    {:title "Theming" :sub "Flavors ride the theme tokens." :dark? true}
    (example
     {:title "Custom flavor"
      :side? true
      :lang "css"
      :description [:span "Any flavor name works: the tooltip reads that flavor's solid tokens, like a solid button. The popover lives in "
                    [:code "<body>"] ", so define them at " [:code ":root"] ", not on a wrapper."]
      :code ":root {
  --ty-solid-teal: #0f766e;
  --ty-solid-teal-fg: #f0fdfa;
  --ty-tooltip-bg: #1c1917;   /* the default chip */
}

<ty-tooltip flavor=\"teal\">"}
     [:div
      [:style ":root { --ty-solid-teal: #0f766e; --ty-solid-teal-fg: #f0fdfa; }"]
      [:ty-button {:size "md" :appearance "outlined"} "Hover me"
       [:ty-tooltip {:flavor "teal" :delay "0"} "Teal, from two tokens"]]]))

   (api-section
    {:attributes [["placement" "string" "\"top\"" "top, bottom, left, right, each with optional -start / -end. Flips when there's no room."]
                  ["offset" "number" "8" "Gap to the anchor, in px."]
                  ["delay" "number" "600" "Milliseconds before showing."]
                  ["flavor" "string" "\"neutral\"" "neutral, primary, success, danger, warning or custom, with + and - tones."]
                  ["disabled" "boolean" "false" "Don't show."]]
     :slots [["(default)" "Tooltip content. The anchor is the tooltip's parent element."]]
     :keyboard [["Tab onto the anchor" "Show (focus counts like hover)."]
                ["Esc" "Hide, without moving focus."]]
     :css-vars [["--ty-tooltip-bg / -color / -border" "The default neutral chip."]
                ["--ty-solid-{flavor} / -fg" "Fill and text of a flavored tooltip (tones: -strong, -soft)."]]})))
