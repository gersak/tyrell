(ns tyrell.site.docs.checkbox
  "Documentation for ty-checkbox component"
  (:require [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private flavors ["neutral" "primary" "success" "danger" "warning"])

(def ^:private lineup
  "Playground stage: the three states, each with its label."
  [{:label "Email me release notes" :checked? true}
   {:label "Weekly digest"}
   {:label "All notifications" :indeterminate? true}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size flavor required disabled]}]
  (cond-> {}
    (not= size "sm") (assoc :size size)
    (not= flavor "neutral") (assoc :flavor flavor)
    required (assoc :required true)
    disabled (assoc :disabled true)))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (for [{:keys [label checked? indeterminate?]} lineup]
       [:label [:ty-checkbox (merge {:checked checked? :indeterminate indeterminate?} attrs {:jsx/onChange "{toggle}"})] label])
     :datastar (str "<label>\n  <ty-checkbox" (snippets/attr-str attrs)
                    "\n    data-on:change=\"$releaseNotes = evt.detail.checked\">\n  </ty-checkbox>\n  Email me release notes\n</label>"))))

(defn- row
  "A labeled checkbox: the <label> delegates clicks to the box."
  [attrs text & [hint]]
  [:label.flex.items-start.gap-3.cursor-pointer.text-sm {:replicant/key text}
   [:ty-checkbox attrs]
   [:span.flex.flex-col {:class ["gap-0.5"]}
    [:span.text-sm.ty-text+ text]
    (when hint [:span.text-xs.ty-text- hint])]])

(defn- render-lineup [{:keys [size flavor required disabled]}]
  (let [base (cond-> {:size size :flavor flavor}
               required (assoc :required "")
               disabled (assoc :disabled ""))]
    [:div.flex.flex-col.gap-4
     (for [{:keys [label checked? indeterminate?]} lineup]
       (row (cond-> base
              checked? (assoc :checked "")
              indeterminate? (assoc :indeterminate ""))
            label))]))

;; Interactive examples -------------------------------------------------------

(def ^:private perms ["Read" "Write" "Delete"])

(defn- doc-state [k] (get-in @state/state [:checkbox-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:checkbox-doc k] v))

(defn view []
  (component-page
   {:title "Checkbox"
    :group "Toggles"
    :tag "ty-checkbox"
    :description "Just the tick, no box. Checked takes the flavor color, unchecked stays a quiet neutral tick. Wrap it in a label; it submits its value and respects required."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyCheckbox (React)" "atom"]]
    :source "packages/core/src/components/checkbox.ts"
    :mark "✓"
    :demo [:div.flex.flex-col.gap-4
           (row {:checked "" :size "md" :flavor "primary"} "Email me release notes" "Once a month, no spam.")
           (row {:size "md" :flavor "primary"} "Weekly digest" "Top discussions from your teams.")
           (row {:indeterminate "" :size "md" :flavor "primary"} "Product updates" "2 of 4 selected.")]}

   (playground
    {:id :checkbox
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
      {:title "Select all"
       :span 4
       :description [:span "The parent is " [:code "indeterminate"] " while some children are on. Clicking a mixed box checks it, like the native one."]
       :code "const all = document.querySelector('#all');
const items = [...document.querySelectorAll('.perm')];

function sync() {
  const on = items.filter((c) => c.checked).length;
  all.checked = on === items.length;
  all.indeterminate = on > 0 && on < items.length;
}
all.addEventListener('change', (e) =>
  items.forEach((c) => (c.checked = e.detail.checked)));"}
      (let [on (or (doc-state :perms) #{"Read"})
            n (count on)
            set-all! #(set-doc! :perms (if % (set perms) #{}))]
        [:div.flex.flex-col.gap-3
         (row (cond-> {:flavor "primary"
                       :on {:change #(set-all! (.. % -detail -checked))}}
                (= n (count perms)) (assoc :checked "")
                (< 0 n (count perms)) (assoc :indeterminate ""))
              "Repository access" (str n " of " (count perms) " permissions"))
         [:div.flex.flex-col.gap-2.pl-8
          (for [p perms]
            (row (cond-> {:flavor "primary"
                          :on {:change #(set-doc! :perms ((if (.. % -detail -checked) conj disj) on p))}}
                   (on p) (assoc :checked ""))
                 p))]]))

     (example
      {:title "Labels"
       :span 2
       :description [:span "The box has no text of its own. A wrapping " [:code "<label>"] " makes the whole line clickable and names it for screen readers."]
       :code "<label>
  <ty-checkbox></ty-checkbox>
  Remember me
</label>"}
      [:div.flex.flex-col.gap-3
       (row {} "Remember me")
       (row {:checked ""} "Keep me signed in" "For 30 days on this device.")])

     (example
      {:title "Required in a form"
       :span 3
       :description [:span "Submits " [:code "name=value"] " when checked (value defaults to " [:code "on"] "). "
                     [:code "required"] " blocks submission while unchecked."]
       :code "<label>
  <ty-checkbox name=\"terms\"
    value=\"yes\" required>
  </ty-checkbox>
  I accept the terms
</label>"}
      (let [status (doc-state :status)]
        [:form.flex.flex-col.gap-3
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (set-doc! :status (str "Sent: terms=" (.get (js/FormData. (.-target e)) "terms"))))}}
         (row {:name "terms" :value "yes" :required "" :flavor "primary"
               :on {:invalid #(set-doc! :status "Blocked: terms not accepted")}}
              "I accept the terms")
         [:div.flex.items-center.gap-3
          [:ty-button {:size "md" :flavor "primary"} "Continue"]
          [:code.ty-text-.text-xs (or status "Press Continue unchecked first.")]]]))

     (example
      {:title "Flavors & sizes"
       :span 3
       :description "Flavor colors the checked tick; unchecked is the same neutral tick for every flavor. The box is one text line tall, so it lines up with its label."
       :code "<ty-checkbox checked
  flavor=\"success\" size=\"lg\">"}
      [:div.flex.flex-col.gap-3
       [:div.flex.flex-wrap.items-center.gap-4
        (for [f flavors]
          [:ty-checkbox {:replicant/key f :checked "" :flavor f :aria-label f}])]
       [:div.flex.flex-wrap.items-center.gap-4
        (for [s ["xs" "sm" "md" "lg" "xl"]]
          [:ty-checkbox {:replicant/key s :checked "" :size s :flavor "primary" :aria-label s}])]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const box = document.querySelector('ty-checkbox');

box.checked = true;
box.indeterminate = true;   // shows the dash; aria-checked=\"mixed\"

box.addEventListener('change', (e) => {
  const { checked, formValue } = e.detail;  // formValue: value or null
});"}
      nil)))

   (page-section
    {:title "Theming" :sub "Three variables." :dark? true}
    (example
     {:title "Tick colors"
      :side? true
      :lang "css"
      :description [:span "Flavors set the checked color and ring. Unchecked and hover are neutral by default; override them for a branded set."]
      :code "ty-checkbox {
  --checkbox-color: #2dd4bf;
  --checkbox-color-off: #3f807a;
  --checkbox-ring: #2dd4bf40;
}"}
     [:div.flex.flex-col.gap-3 {:style {"--checkbox-color" "#2dd4bf"
                                        "--checkbox-color-off" "#3f807a"
                                        "--checkbox-ring" "#2dd4bf40"}}
      (row {:checked ""} "Dark mode")
      (row {} "Reduce motion")
      (row {:indeterminate ""} "Sync settings")]))

   (api-section
    {:properties validation-properties
     :attributes ["State"
                  ["checked" "boolean" "false" "On or off."]
                  ["indeterminate" "boolean" "false" "Mixed: shows a dash. Cleared by the next click, which checks it."]
                  ["disabled" "boolean" "false" "Not clickable, left out of the form."]
                  "Form"
                  ["name" "string" "Form field name."]
                  ["value" "string" "\"on\"" "Submitted while checked."]
                  ["required" "boolean" "false" "Blocks form submission while unchecked."]
                  "Appearance"
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl."]
                  ["flavor" "string" "\"neutral\"" "Tick color: primary, success, danger, warning or custom, with + and - tones."]]
     :events [["change" "{checked, value, formValue, originalEvent}" "Toggled by click, Space or Enter. input fires alongside with the same detail."]]
     :keyboard [["Space / Enter" "Toggle."]
                ["Tab" "Focus the box."]]
     :css-vars [["--checkbox-color" "Tick when checked or mixed. Flavors set it to their strong tone."]
                ["--checkbox-color-off" "Tick when unchecked. Default: 45% of body text."]
                ["--checkbox-color-off-hover" "Unchecked tick on hover."]
                ["--checkbox-hover-bg" "Pill behind the tick on hover."]
                ["--checkbox-ring" "Focus ring."]]})))
