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
     [(into [:ty-radio-group (merge {:label "Plan" :name "plan" :value "pro"} attrs {(snippets/ds "data-bind") "plan"})]
            (for [[v label] plans] [:label {:snippet/inline true} [:ty-radio {:value v}] label]))])))

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

(def ^:private form-snippets
  "Required in a form, one tab per stack."
  [["html" "HTML" "html"
    "<form action=\"/book\" method=\"post\">
  <ty-radio-group name=\"seat\" label=\"Seat\" required orientation=\"horizontal\">
    <label><ty-radio value=\"window\"></ty-radio> Window</label>
    <label><ty-radio value=\"aisle\"></ty-radio> Aisle</label>
  </ty-radio-group>
  <ty-button flavor=\"primary\">Book</ty-button>
</form>"]
   ["react" "React" "javascript"
    "import { TyRadioGroup, TyRadio, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <TyRadioGroup name=\"seat\" label=\"Seat\" required orientation=\"horizontal\">
    <label><TyRadio value=\"window\" /> Window</label>
    <label><TyRadio value=\"aisle\" /> Aisle</label>
  </TyRadioGroup>
  <TyButton flavor=\"primary\">Book</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:> ty/RadioGroup {:name \"seat\" :label \"Seat\" :required true :orientation \"horizontal\"}
  [:label [:> ty/Radio {:value \"window\"}] \"Window\"]
  [:label [:> ty/Radio {:value \"aisle\"}] \"Aisle\"]]
 [:> ty/Button {:flavor \"primary\"} \"Book\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:ty-radio-group {:name \"seat\" :label \"Seat\" :required \"\" :orientation \"horizontal\"}
  [:label [:ty-radio {:value \"window\"}] \"Window\"]
  [:label [:ty-radio {:value \"aisle\"}] \"Aisle\"]]
 [:ty-button {:flavor \"primary\"} \"Book\"]]"]
   ["datastar" "Datastar" "html"
    "<form data-on:submit__prevent=\"@post('/book', {contentType: 'form'})\">
  <ty-radio-group name=\"seat\" label=\"Seat\" required orientation=\"horizontal\">
    <label><ty-radio value=\"window\"></ty-radio> Window</label>
    <label><ty-radio value=\"aisle\"></ty-radio> Aisle</label>
  </ty-radio-group>
  <ty-button flavor=\"primary\">Book</ty-button>
</form>"]])

(def ^:private api-snippets
  "JavaScript API card, one tab per stack."
  [["html" "HTML" "javascript"
    "const group = document.querySelector('ty-radio-group');

group.value = 'team';          // checks the matching ty-radio
group.error = 'Pick a plan';   // message under the group

group.addEventListener('change', (e) => {
  const { value } = e.detail;   // click, arrow keys or Space
});"]
   ["react" "React" "javascript"
    "import { TyRadioGroup, TyRadio } from 'tyrell-react'

// onChangeCommit is change: click, arrow keys or Space
<TyRadioGroup value={plan} error={error}
  onChangeCommit={(e) => setPlan(e.detail.value)}>
  <label><TyRadio value=\"pro\" /> Pro</label>
  <label><TyRadio value=\"team\" /> Team</label>
</TyRadioGroup>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/RadioGroup {:value @plan :error @error
                   :on-change-commit #(reset! plan (.. % -detail -value))}
 [:label [:> ty/Radio {:value \"pro\"}] \"Pro\"]
 [:label [:> ty/Radio {:value \"team\"}] \"Team\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-radio-group {:value plan :error error
                  :on {:change #(set-plan! (.. % -detail -value))}}
 [:label [:ty-radio {:value \"pro\"}] \"Pro\"]
 [:label [:ty-radio {:value \"team\"}] \"Team\"]]"]
   ["datastar" "Datastar" "html"
    "<ty-radio-group data-signals:plan=\"'pro'\" data-bind=\"plan\">
  <label><ty-radio value=\"pro\"></ty-radio> Pro</label>
  <label><ty-radio value=\"team\"></ty-radio> Team</label>
</ty-radio-group>"]])

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
       :tabs form-snippets}
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
       :tabs api-snippets}
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
