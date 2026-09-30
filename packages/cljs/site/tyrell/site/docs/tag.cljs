(ns tyrell.site.docs.tag
  "Documentation for ty-tag component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private flavors ["primary" "success" "danger" "warning" "neutral"])

(def ^:private lineup
  "Playground stage: the shapes a tag takes, sharing the live props."
  [{:label "Design"}
   {:label "Approved" :start "check"}
   {:label "Ada Lovelace" :start "user"}
   {:label "Inbox" :end "12"}
   {:label "v2.4.0" :start "tag"}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size flavor pill clickable dismissible disabled]}]
  (cond-> {}
    (not= flavor "neutral") (assoc :flavor flavor)
    (not= size "sm") (assoc :size size)
    (not pill) (assoc :not-pill true)
    clickable (assoc :clickable true)
    dismissible (assoc :dismissible true)
    disabled (assoc :disabled true)))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (for [{:keys [label start end]} lineup]
       [:ty-tag attrs
        (when start [:ty-icon {:slot "start" :name start}])
        label
        (when end [:b {:slot "end"} end])])
     :datastar (str "<ty-tag" (snippets/attr-str attrs) " dismissible\n"
                    "  data-on:dismiss=\"@delete('/filters/design')\">Design</ty-tag>"))))

(defn- render-lineup [{:keys [size flavor pill clickable dismissible disabled]}]
  (let [base (cond-> {:flavor flavor :size size}
               (not pill) (assoc :not-pill "")
               clickable (assoc :clickable "")
               dismissible (assoc :dismissible "")
               disabled (assoc :disabled ""))]
    [:div.flex.flex-wrap.items-center.justify-center.gap-3
     (for [{:keys [label start end]} lineup]
       [:ty-tag (assoc base :replicant/key label)
        (when start [:ty-icon {:slot "start" :name start}])
        label
        (when end [:b {:slot "end"} end])])]))

;; Interactive examples -------------------------------------------------------

(def ^:private all-filters ["Design" "Engineering" "Remote" "Full-time" "Europe"])

(defn- filters [] (get-in @state/state [:tag-doc :filters] all-filters))

(defn- toggle! [topic]
  (swap! state/state update-in [:tag-doc :topics]
         #(if (contains? (or % #{"React"}) topic)
            (disj (or % #{"React"}) topic)
            (conj (or % #{"React"}) topic))))

(def ^:private custom-flavor-css
  "ty-tag[flavor=\"teal\"] {
  --ty-bg-teal: #134e4a;
  --ty-bg-teal-bold: #115e59;
  --ty-color-teal: #5eead4;
  --ty-border-teal: #0f766e;
}")

(defn view []
  (component-page
   {:title "Tag"
    :group "Action"
    :tag "ty-tag"
    :description "Labels, statuses, filters and counts. Five flavors with tones, icon and count slots, clickable and dismissible with the keyboard."
    :chips [["Keyboard" "zap"] ["TyTag (React)" "atom"]]
    :source "packages/core/src/components/tag.ts"
    :mark "#"
    :demo [:div.flex.flex-col.items-start.gap-3
           [:div.flex.flex-wrap.gap-2
            [:ty-tag {:flavor "success" :size "md"} [:ty-icon {:slot "start" :name "check"}] "Paid"]
            [:ty-tag {:flavor "warning" :size "md"} [:ty-icon {:slot "start" :name "clock"}] "Pending"]
            [:ty-tag {:flavor "primary" :size "md"} "Shipped"]]
           [:div.flex.flex-wrap.gap-2
            [:ty-tag {:size "md" :dismissible ""} "Design"]
            [:ty-tag {:size "md" :dismissible ""} "Remote"]
            [:ty-tag {:size "md" :flavor "primary-"} "Inbox" [:b {:slot "end"} "12"]]]]}

   (playground
    {:id :tag
     :defaults {:size "md" :flavor "primary" :pill true
                :clickable false :dismissible false :disabled false}
     :controls [{:key :flavor :options flavors :swatch? true :tones? true}
                {:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :pill :switch? true}
                {:key :clickable :switch? true}
                {:key :dismissible :switch? true}
                {:key :disabled :switch? true}]
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Filter chips"
       :span 4
       :description [:span [:code "dismissible"] " adds the ×. The tag fires " [:code "dismiss"]
                     " and your code removes it. Backspace and Delete work when it's focused."]
       :code "<ty-tag dismissible>Design</ty-tag>

container.addEventListener('dismiss', (e) => {
  e.target.remove();
});"}
      (let [fs (filters)]
        [:div.flex.flex-col.items-start.gap-3
         [:div.flex.flex-wrap.gap-2 {:style {:min-height "28px"}}
          (for [f fs]
            [:ty-tag {:replicant/key f
                      :dismissible ""
                      :on {:dismiss #(swap! state/state assoc-in [:tag-doc :filters] (vec (remove #{f} fs)))}}
             f])]
         (when (< (count fs) (count all-filters))
           [:ty-button {:size "sm" :appearance "ghost"
                        :on {:click #(swap! state/state assoc-in [:tag-doc :filters] all-filters)}}
            [:ty-icon {:slot "start" :name "rotate-cw"}] "Reset"])]))

     (example
      {:title "Tones"
       :span 2
       :description [:span [:code "+"] " is bolder, " [:code "-"] " quieter."]
       :code "<ty-tag flavor=\"success+\">
<ty-tag flavor=\"success\">
<ty-tag flavor=\"success-\">"}
      [:div.flex.flex-col.items-start.gap-2
       (for [t ["success+" "success" "success-"]]
         [:ty-tag {:replicant/key t :flavor t} t])])

     (example
      {:title "Flavors"
       :span 3
       :description [:span "The default is " [:code "neutral"] ". Any other string is a custom flavor, see Theming."]
       :code "<ty-tag flavor=\"primary\">
<ty-tag flavor=\"danger\">
<ty-tag flavor=\"my-brand\">"}
      [:div.flex.flex-wrap.gap-2
       (for [f flavors]
         [:ty-tag {:replicant/key f :flavor f} (str/capitalize f)])])

     (example
      {:title "Toggle chips"
       :span 3
       :description [:span [:code "clickable"] " makes it focusable and fires " [:code "click"]
                     " on click, Enter or Space. Show the state with the flavor."]
       :code "<ty-tag clickable flavor=\"primary+\">
  React
</ty-tag>
<ty-tag clickable>Vue</ty-tag>"}
      (let [on (get-in @state/state [:tag-doc :topics] #{"React"})]
        [:div.flex.flex-wrap.gap-2
         (for [t ["React" "Vue" "Svelte" "HTMX" "ClojureScript"]]
           [:ty-tag {:replicant/key t
                     :clickable ""
                     :flavor (if (on t) "primary+" "neutral")
                     :on {:click #(toggle! t)}}
            (when (on t) [:ty-icon {:slot "start" :name "check"}])
            t])]))

     (example
      {:title "Status"
       :span 4
       :description [:span "An icon in " [:code "start"] " carries the meaning for people who don't see color."]
       :code "<ty-tag flavor=\"success\">
  <ty-icon slot=\"start\" name=\"check\"></ty-icon>
  Paid
</ty-tag>"}
      [:div.flex.flex-wrap.gap-2
       (for [[label flavor icon] [["Paid" "success" "check"] ["Pending" "warning" "clock"]
                                  ["Failed" "danger" "x"] ["Shipped" "primary" "truck"]
                                  ["Draft" "neutral" "edit"]]]
         [:ty-tag {:replicant/key label :flavor flavor}
          [:ty-icon {:slot "start" :name icon}] label])])

     (example
      {:title "Sizes & shape"
       :span 2
       :description [:span "Pill by default. " [:code "not-pill"] " for square corners."]
       :code "size=\"xs | sm | md | lg | xl\"
<ty-tag not-pill>v2.4</ty-tag>"}
      [:div.flex.flex-col.items-start.gap-2
       [:div.flex.flex-wrap.items-center {:class ["gap-1.5"]}
        (for [s ["xs" "sm" "md" "lg" "xl"]]
          [:ty-tag {:replicant/key s :size s :flavor "primary-"} s])]
       [:ty-tag {:not-pill "" :flavor "neutral"} [:ty-icon {:slot "start" :name "tag"}] "v2.4.0"]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const tag = document.querySelector('ty-tag');

tag.flavor = 'success';
tag.dismissible = true;

// both bubble out of shadow roots, and both are cancelable
tag.addEventListener('dismiss', (e) => e.detail.target.remove());
tag.addEventListener('click', (e) => toggle(e.detail.target.value));"}
      nil)))

   (page-section
    {:title "Theming" :sub "CSS variables. No build step." :dark? true}
    (example
     {:title "Custom flavor"
      :side? true
      :lang "css"
      :description [:span "Name a flavor and give it " [:code "--ty-bg-*"] ", " [:code "--ty-color-*"] " and "
                    [:code "--ty-border-*"] " tokens. Tones and hover follow."]
      :code custom-flavor-css}
     [:div.flex.flex-wrap.gap-2
      [:style custom-flavor-css]
      [:ty-tag {:flavor "teal"} "Teal"]
      [:ty-tag {:flavor "teal" :dismissible ""} "Dismissible"]
      [:ty-tag {:flavor "teal" :clickable ""} "Clickable"]])

    (example
     {:title "One-off colors"
      :side? true
      :lang "css"
      :description "Three variables recolor a single tag, whatever its flavor."
      :code ".beta {
  --tag-bg: #431407;
  --tag-color: #fdba74;
  --tag-border-color: #9a3412;
}"}
     [:div.flex.flex-wrap.gap-2
      [:ty-tag {:style {"--tag-bg" "#431407"
                        "--tag-color" "#fdba74"
                        "--tag-border-color" "#9a3412"}}
       [:ty-icon {:slot "start" :name "zap"}] "Beta"]]))

   (api-section
    {:attributes ["Appearance"
                  ["flavor" "string" "\"neutral\"" "primary, success, danger, warning, neutral, or any custom flavor. Append + or - for a stronger or softer tone."]
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl."]
                  ["pill" "boolean" "true" "Fully rounded. Use not-pill (or pill=\"false\") for square corners."]
                  "Behavior"
                  ["clickable" "boolean" "false" "Focusable; fires click on click, Enter or Space."]
                  ["dismissible" "boolean" "false" "Shows × and fires dismiss on it, or on Backspace / Delete."]
                  ["disabled" "boolean" "false" "No click or dismiss."]
                  "Data"
                  ["value" "string" "Identifies the tag, e.g. inside ty-multiselect."]
                  ["selected" "boolean" "false" "Selection state used by ty-multiselect. No visual change on its own."]]
     :events [["click" "{target}" "Clickable tags only. Bubbles, composed, cancelable."]
              ["dismiss" "{target}" "The × was pressed, or Backspace / Delete. The tag stays until you remove it."]]
     :slots [["start" "Before the label: icon, avatar, dot."]
             ["(default)" "The label."]
             ["end" "After the label: a count or badge."]]
     :keyboard [["Enter / Space" "Fire click (clickable)."]
                ["Backspace / Delete" "Fire dismiss (dismissible)."]]
     :css-vars [["--tag-bg" "Background, per instance."]
                ["--tag-color" "Text and icon color."]
                ["--tag-border-color" "Border."]
                ["--ty-bg-{flavor} / -bold / -soft" "Flavor fills for a custom flavor and its tones."]
                ["--ty-color-{flavor} / --ty-border-{flavor}" "Flavor text and border."]]})))
