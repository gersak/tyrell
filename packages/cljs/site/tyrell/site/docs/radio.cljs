(ns tyrell.site.docs.radio
  "Documentation for ty-radio and ty-radio-group"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private flavors ["primary" "success" "danger" "warning" "neutral"])

(def ^:private plans [["starter" "Starter" "Free, up to 3 projects."]
                      ["pro" "Pro" "$12 a month, unlimited projects."]
                      ["team" "Team" "$40 a month, shared workspaces."]])

(defn- prop-attrs
  "Non-default group props, as they appear in the snippets."
  [{:keys [size flavor orientation required disabled]}]
  (cond-> {}
    (not= orientation "vertical") (assoc :orientation orientation)
    (not= size "sm") (assoc :size size)
    (not= flavor "primary") (assoc :flavor flavor)
    required (assoc :required true)
    disabled (assoc :disabled true)))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     [(into [:ty-radio-group (merge {:label "Plan" :name "plan" :value "pro"} attrs)]
            (for [[v label] plans] [:label {:snippet/inline true} [:ty-radio {:value v}] label]))]
     :datastar (str "<ty-radio-group name=\"plan\"" (snippets/attr-str attrs)
                    "\n  data-on:change=\"$plan = evt.detail.value\">\n  …\n</ty-radio-group>"))))

(defn- option
  "A labeled radio with an optional hint line."
  [value text & [hint]]
  [:label.flex.items-start.gap-3.cursor-pointer.text-sm {:replicant/key value}
   [:ty-radio {:value value}]
   [:span.flex.flex-col {:class ["gap-0.5"]}
    [:span.ty-text+ text]
    (when hint [:span.text-xs.ty-text- hint])]])

(defn- render-lineup [{:keys [size flavor orientation required disabled]}]
  [:ty-radio-group (cond-> {:label "Plan" :name "plan" :value "pro"
                            :size size :flavor flavor :orientation orientation}
                     required (assoc :required "")
                     disabled (assoc :disabled ""))
   (for [[v label hint] plans]
     (option v label (when (= orientation "vertical") hint)))])

(defn- doc-state [k] (get-in @state/state [:radio-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:radio-doc k] v))

(defn view []
  (component-page
   {:title "Radio"
    :group "Toggles"
    :tag "ty-radio-group"
    :description "Pick exactly one. A group owns the value, the name and the keyboard; each radio is a circle you wrap in a label."
    :chips [["Form-associated" "send"] ["Arrow keys" "zap"] ["TyRadioGroup (React)" "atom"]]
    :source "packages/core/src/components/radio.ts"
    :mark "◉"
    :demo [:div {:style {:width "300px"}}
           [:ty-radio-group {:label "Delivery" :value "express" :size "md"}
            (option "standard" "Standard" "3–5 days, free")
            (option "express" "Express" "Tomorrow, $9")
            (option "pickup" "Pick up" "Ready in 2 hours")]]}

   (playground
    {:id :radio
     :defaults {:size "md" :flavor "primary" :orientation "vertical" :required false :disabled false}
     :controls [{:key :orientation :options ["vertical" "horizontal"]}
                {:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :flavor :options flavors :swatch? true :tones? true}
                {:key :required :switch? true}
                {:key :disabled :switch? true}]
     :sub "Click, or Tab in and use the arrow keys."
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Choice cards"
       :span 4
       :description [:span "The label can be anything, including a whole card. Style the selected one from your state; the group keeps the value."]
       :code "<ty-radio-group name=\"plan\" orientation=\"horizontal\">
  <label class=\"card\">
    <ty-radio value=\"pro\"></ty-radio>
    <b>Pro</b> $12 / month
  </label>
  …
</ty-radio-group>"}
      (let [plan (or (doc-state :plan) "pro")]
        [:ty-radio-group {:value plan :orientation "horizontal"
                          :on {:change #(set-doc! :plan (.. % -detail -value))}}
         (for [[v label hint] plans]
           [:label.flex.flex-col.gap-2.rounded-xl.p-4.cursor-pointer.border.text-sm
            {:replicant/key v
             :class (if (= v plan) ["ty-border-primary" "ty-bg-primary-"] ["ty-border-"])
             :style {:min-width "150px"}}
            [:span.flex.items-center.gap-2 [:ty-radio {:value v}] [:span.font-semibold.ty-text++ label]]
            [:span.text-xs.ty-text- hint]])]))

     (example
      {:title "Horizontal"
       :span 2
       :description [:span [:code "orientation=\"horizontal\""] " for short options. Arrow keys still work both ways."]
       :code "<ty-radio-group
  orientation=\"horizontal\">"}
      [:ty-radio-group {:value "m" :orientation "horizontal"}
       (for [s ["S" "M" "L" "XL"]]
         [:label.flex.items-start.gap-2.cursor-pointer.text-sm {:replicant/key s}
          [:ty-radio {:value (str/lower-case s)}] [:span.ty-text+ s]])])

     (example
      {:title "Keyboard"
       :span 3
       :description "Tab lands once on the group, on the selected radio. Arrows move focus and selection together; Space selects the focused one."
       :code "<!-- no code: the group handles it -->
<ty-radio-group value=\"week\">"}
      [:ty-radio-group {:label "Report every" :value "week"}
       (option "day" "Day")
       (option "week" "Week")
       (option "month" "Month")])

     (example
      {:title "Required in a form"
       :span 3
       :description [:span "The group submits " [:code "name=value"] ". " [:code "required"]
                     " blocks submission until one is picked."]
       :code "<ty-radio-group name=\"seat\" required>
  …
</ty-radio-group>"}
      (let [status (doc-state :status)]
        [:form.flex.flex-col.gap-3.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (set-doc! :status (str "Sent: seat=" (.get (js/FormData. (.-target e)) "seat"))))}}
         [:ty-radio-group {:label "Seat" :name "seat" :required "" :orientation "horizontal"
                           :on {:invalid #(set-doc! :status "Blocked: pick a seat")}}
          (for [s ["Window" "Aisle"]]
            [:label.flex.items-start.gap-2.cursor-pointer.text-sm {:replicant/key s}
             [:ty-radio {:value (str/lower-case s)}] [:span.ty-text+ s]])]
         [:div.flex.items-center.gap-3
          [:ty-button {:size "md" :flavor "primary"} "Book"]
          [:code.ty-text-.text-xs (or status "Press Book with nothing picked.")]]]))

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const group = document.querySelector('ty-radio-group');

group.value = 'team';          // checks the matching ty-radio
group.error = 'Pick a plan';   // message under the group

group.addEventListener('change', (e) => {
  const { value } = e.detail;   // click, arrow keys or Space
});"}
      nil)))

   (page-section
    {:title "Theming" :sub "Two variables." :dark? true}
    (example
     {:title "Dot and ring"
      :side? true
      :lang "css"
      :description [:span "Flavors set " [:code "--radio-color"] " for the selected ring and dot. The unchecked ring is neutral; override it with " [:code "--radio-ring-off"] "."]
      :code "ty-radio-group.brand {
  --radio-color: #2dd4bf;
  --radio-ring-off: #3f807a;
}"}
     [:div {:style {"--radio-color" "#2dd4bf" "--radio-ring-off" "#3f807a"}}
      [:ty-radio-group {:value "b"}
       (option "a" "Weekly digest")
       (option "b" "Daily digest")
       (option "c" "Off")]]))

   (api-section
    {:properties validation-properties
     :attributes ["ty-radio-group"
                  ["value" "string" "\"\"" "Value of the selected radio."]
                  ["name" "string" "Form field name."]
                  ["label" "string" "Group label."]
                  ["required" "boolean" "false" "Blocks form submission until one is picked."]
                  ["error" "string" "Message under the group."]
                  ["disabled" "boolean" "false" "Disables every radio in the group."]
                  ["orientation" "string" "\"vertical\"" "vertical or horizontal."]
                  ["size" "string" "\"sm\"" "xs to xl, applied to every radio."]
                  ["flavor" "string" "\"primary\"" "Selected color, applied to every radio."]
                  "ty-radio"
                  ["value" "string" "What the group takes when this radio is picked."]
                  ["disabled" "boolean" "false" "Skip this one; arrow keys jump over it."]]
     :events [["change" "{value, formValue, originalEvent}" "On the group: selection changed by click, arrows or Space."]]
     :keyboard [["Tab" "One stop per group, on the selected radio (or the first)."]
                ["Arrow keys" "Move focus and selection to the next / previous radio, wrapping."]
                ["Space / Enter" "Select the focused radio."]]
     :css-vars [["--radio-color" "Selected ring and dot."]
                ["--radio-ring-off" "Unchecked ring. Default: 45% of body text."]
                ["--radio-ring-off-hover" "Unchecked ring on hover."]
                ["--ty-input-shadow-focus" "Focus ring."]]})))
