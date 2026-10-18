(ns tyrell.site.docs.switch
  "Documentation for ty-switch component"
  (:require [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private flavors ["primary" "success" "danger" "warning" "neutral"])

(def ^:private lineup
  "Playground stage: a settings list, on and off."
  [{:label "Wi-Fi" :checked? true}
   {:label "Bluetooth"}
   {:label "Airplane mode"}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size flavor required disabled]}]
  (cond-> {}
    (not= size "sm") (assoc :size size)
    (not= flavor "primary") (assoc :flavor flavor)
    required (assoc :required true)
    disabled (assoc :disabled true)))

(defn- datastar-toggle
  "data-bind binds a custom element's value, not checked, so a toggle is a
   signal mirrored with data-attr:checked and written back on change."
  [label on?]
  (let [sig (snippets/signal label)]
    {(snippets/ds (str "data-signals:" (snippets/slug label))) (str (boolean on?))
     (snippets/ds "data-attr:checked") (str "$" sig)
     (snippets/ds "data-on:change") (str "$" sig " = evt.detail.checked")}))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (for [{:keys [label checked?]} lineup]
       [:label [:ty-switch (merge (when checked? {:checked true}) attrs {:jsx/onChange "{toggle}"}
                                  (datastar-toggle label checked?))] label]))))

(defn- setting
  "Settings row: text left, switch right. The <label> makes the whole row a target."
  [attrs text & [hint]]
  [:label.flex.items-start.justify-between.gap-6.cursor-pointer.text-sm {:replicant/key text}
   [:span.flex.flex-col {:class ["gap-0.5"]}
    [:span.ty-text+ text]
    (when hint [:span.text-xs.ty-text- hint])]
   [:ty-switch attrs]])

(defn- inline
  "Switch before its label, like a checkbox."
  [attrs text]
  [:label.flex.items-start.gap-3.cursor-pointer.text-sm {:replicant/key text}
   [:ty-switch attrs]
   [:span.ty-text+ text]])

(defn- render-lineup [{:keys [size flavor required disabled]}]
  (let [base (cond-> {:size size :flavor flavor}
               required (assoc :required "")
               disabled (assoc :disabled ""))]
    [:div.flex.flex-col.gap-4 {:style {:width "100%" :max-width "320px"}}
     (for [{:keys [label checked?]} lineup]
       (setting (cond-> base checked? (assoc :checked "")) label))]))

(defn- doc-state [k] (get-in @state/state [:switch-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:switch-doc k] v))

(def ^:private compact-snippets
  "Settings that apply now, one tab per stack."
  [["html" "HTML" "javascript"
    "const compact = document.getElementById('compact');

compact.addEventListener('change', (e) => {
  document.documentElement
    .classList.toggle('compact', e.detail.checked);
});"]
   ["react" "React" "javascript"
    "import { TySwitch } from 'tyrell-react'

<TySwitch checked={compact}
  onChange={(e) => setCompact(e.detail.checked)} />
<main className={compact ? 'compact' : ''}>…</main>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Switch {:checked @compact?
               :on-change #(reset! compact? (.. % -detail -checked))}]
[:main {:class (when @compact? \"compact\")} …]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-switch {:checked (when compact? \"\")
             :on {:change #(set-compact! (.. % -detail -checked))}}]
[:main {:class (when compact? \"compact\")} …]"]
   ["datastar" "Datastar" "html"
    "<ty-switch data-signals:compact=\"false\"
  data-on:change=\"$compact = evt.detail.checked\"></ty-switch>
<main data-class:compact=\"$compact\">…</main>"]])

(def ^:private api-snippets
  "JavaScript API card, one tab per stack."
  [["html" "HTML" "javascript"
    "const sw = document.getElementById('notify');

sw.checked = true;

sw.addEventListener('change', (e) => {
  const { checked, formValue } = e.detail;  // formValue: value or null
});"]
   ["react" "React" "javascript"
    "import { TySwitch } from 'tyrell-react'

<TySwitch checked={on}
  onChange={(e) => {
    const { checked, formValue } = e.detail  // formValue: value or null
    setOn(checked)
  }} />"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Switch {:checked @on?
               :on-change #(reset! on? (.. % -detail -checked))}]   ; -formValue: value or nil"]
   ["replicant" "Replicant" "clojure"
    "[:ty-switch {:checked (when on? \"\")
             :on {:change #(set-on! (.. % -detail -checked))}}]   ; -formValue: value or nil"]
   ["datastar" "Datastar" "html"
    "<ty-switch data-signals:on=\"true\" data-attr:checked=\"$on\"
  data-on:change=\"$on = evt.detail.checked\"></ty-switch>"]])

(def ^:private form-snippets
  "Required in a form, one tab per stack."
  [["html" "HTML" "html"
    "<form action=\"/onboarding\" method=\"post\">
  <label>
    <ty-switch name=\"consent\" required></ty-switch>
    Share usage data
  </label>
  <ty-button flavor=\"primary\">Continue</ty-button>
</form>"]
   ["react" "React" "javascript"
    "import { TySwitch, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <label>
    <TySwitch name=\"consent\" required />
    Share usage data
  </label>
  <TyButton flavor=\"primary\">Continue</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:label
  [:> ty/Switch {:name \"consent\" :required true}]
  \"Share usage data\"]
 [:> ty/Button {:flavor \"primary\"} \"Continue\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:label
  [:ty-switch {:name \"consent\" :required \"\"}]
  \"Share usage data\"]
 [:ty-button {:flavor \"primary\"} \"Continue\"]]"]
   ["datastar" "Datastar" "html"
    "<form data-on:submit__prevent=\"@post('/onboarding', {contentType: 'form'})\">
  <label>
    <ty-switch name=\"consent\" required></ty-switch>
    Share usage data
  </label>
  <ty-button flavor=\"primary\">Continue</ty-button>
</form>"]])

(defn view []
  (component-page
   {:title "Switch"
    :group "Toggles"
    :tag "ty-switch"
    :description "An on/off control for settings that apply right away. Track and thumb, five flavors, keyboard, and a real form value."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TySwitch (React)" "atom"]]
    :source "packages/core/src/components/switch.ts"
    :mark "◐"
    :demo [:div.flex.flex-col.gap-4 {:style {:width "300px"}}
           (setting {:checked "" :size "md"} "Notifications" "Push and email.")
           (setting {:size "md"} "Location" "Only while using the app.")
           (setting {:checked "" :size "md" :flavor "success"} "Auto-update" "Installs overnight.")]}

   (playground
    {:id :switch
     :defaults {:size "md" :flavor "primary" :required false :disabled false}
     :controls [{:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :flavor :options flavors :swatch? true :tones? true}
                {:key :required :switch? true}
                {:key :disabled :switch? true}]
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Settings that apply now"
       :span 4
       :description [:span "A switch means the change takes effect immediately. React to "
                     [:code "change"] "; there's no Save button."]
       :tabs compact-snippets}
      (let [compact? (doc-state :compact)]
        [:div.flex.flex-col.gap-4.w-full
         (setting (cond-> {:on {:change #(set-doc! :compact (.. % -detail -checked))}}
                    compact? (assoc :checked ""))
                  "Compact rows" "Tighter spacing in lists.")
         [:div.flex.flex-col.rounded-lg.ty-border-.border
          {:class (if compact? ["gap-0"] ["gap-1"])}
          (for [n ["Inbox" "Drafts" "Archive"]]
            [:div.flex.items-center.gap-3.px-3.ty-text.text-sm
             {:replicant/key n :class (if compact? ["py-1"] ["py-2.5"])}
             [:ty-icon {:name "mail" :size "sm"}] n])]]))

     (example
      {:title "Placement"
       :span 2
       :description "Right-aligned in settings lists, before the label in forms. Either way, wrap it in a label."
       :code "<label>
  <ty-switch></ty-switch>
  Dark mode
</label>"}
      [:div.flex.flex-col.gap-4.w-full
       (setting {:checked ""} "Sync")
       (inline {} "Dark mode")])

     (example
      {:title "Flavors & sizes"
       :span 3
       :description [:span "Flavor colors the track when on; default is " [:code "primary"] ". Sizes follow the field ladder."]
       :code "<ty-switch checked flavor=\"success\">
<ty-switch checked size=\"lg\">"}
      [:div.flex.flex-col.gap-3
       [:div.flex.flex-wrap.items-center.gap-3
        (for [f flavors] [:ty-switch {:replicant/key f :checked "" :flavor f :aria-label f}])]
       [:div.flex.flex-wrap.items-center.gap-3
        (for [s ["xs" "sm" "md" "lg" "xl"]] [:ty-switch {:replicant/key s :checked "" :size s :aria-label s}])]])

     (example
      {:title "Required in a form"
       :span 3
       :description [:span "Submits " [:code "name=value"] " while on. " [:code "required"]
                     " blocks submission while off."]
       :tabs form-snippets}
      (let [status (doc-state :status)]
        [:form.flex.flex-col.gap-3.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (set-doc! :status (str "Sent: consent=" (.get (js/FormData. (.-target e)) "consent"))))}}
         (inline {:name "consent" :required ""
                  :on {:invalid #(set-doc! :status "Blocked: consent is off")}}
                 "Share usage data")
         [:div.flex.items-center.gap-3
          [:ty-button {:size "md" :flavor "primary"} "Continue"]
          [:code.ty-text-.text-xs (or status "Press Continue while off.")]]]))

     (example
      {:title "JavaScript API"
       :tabs api-snippets}
      nil)))

   (page-section
    {:title "Theming" :sub "One variable." :dark? true}
    (example
     {:title "Track color"
      :side? true
      :lang "css"
      :description [:span "Flavors set " [:code "--switch-track"] " and nothing else. Set it yourself for a one-off color."]
      :code "ty-switch.ai {
  --switch-track: #f97316;
}"}
     [:div.flex.flex-col.gap-4 {:style {:width "100%" :max-width "300px"}}
      (setting {:checked "" :style {"--switch-track" "#f97316"}} "AI suggestions" "Beta.")
      (setting {:style {"--switch-track" "#f97316"}} "Smart replies")]))

   (api-section
    {:properties validation-properties
     :attributes ["State"
                  ["checked" "boolean" "false" "On or off."]
                  ["disabled" "boolean" "false" "Not clickable, left out of the form."]
                  "Form"
                  ["name" "string" "Form field name."]
                  ["value" "string" "\"on\"" "Submitted while on."]
                  ["required" "boolean" "false" "Blocks form submission while off."]
                  "Appearance"
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl."]
                  ["flavor" "string" "\"primary\"" "Track color when on: primary, success, danger, warning, neutral or custom, with + and - tones."]]
     :events [["change" "{checked, value, formValue, originalEvent}" "Toggled by click, Space or Enter. input fires alongside with the same detail."]]
     :keyboard [["Space / Enter" "Toggle."]
                ["Tab" "Focus the switch."]]
     :css-vars [["--switch-track" "Track color when on."]
                ["--ty-input-shadow-focus" "Focus ring, shared with the fields."]]})))
