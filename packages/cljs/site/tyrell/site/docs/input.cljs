(ns tyrell.site.docs.input
  "Documentation for ty-input component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private flavors ["neutral" "primary" "success" "danger" "warning"])

(def ^:private lineup
  "Playground stage: the shapes a field takes, sharing the live props."
  [{:label "Full name" :placeholder "Ada Lovelace"}
   {:label "Email" :type "email" :placeholder "ada@example.com" :start "mail"}
   {:label "Weight" :type "number" :value "72.5" :end "kg"}
   {:label "Password" :type "password" :value "hunter2" :start "lock"}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size flavor required disabled error]}]
  (cond-> {}
    (not= size "sm") (assoc :size size)
    (not= flavor "neutral") (assoc :flavor flavor)
    required (assoc :required true)
    disabled (assoc :disabled true)
    error (assoc :error "Check this field")))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (for [{:keys [label type value placeholder start end]} lineup]
       [:ty-input (merge {:label label :type type :value value :placeholder placeholder} attrs
                         {(snippets/ds "data-bind") (snippets/signal label)})
        (when start [:ty-icon {:slot "start" :name start}])
        (when end [:span {:slot "end"} end])]))))

(defn- render-lineup [{:keys [size flavor required disabled error]}]
  (let [base (cond-> {:size size :flavor flavor}
               required (assoc :required "")
               disabled (assoc :disabled "")
               error (assoc :error "Check this field"))]
    [:div.flex.flex-col.gap-4 {:style {:width "100%" :max-width "340px"}}
     (for [{:keys [label type value placeholder start end]} lineup]
       [:ty-input (cond-> (assoc base :replicant/key label :label label)
                    type (assoc :type type)
                    value (assoc :value value)
                    placeholder (assoc :placeholder placeholder))
        (when start [:ty-icon {:slot "start" :name start}])
        (when end [:span {:slot "end"} end])])]))

;; Interactive examples -------------------------------------------------------

(defn- doc-state [k] (get-in @state/state [:input-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:input-doc k] v))

(def ^:private rules-snippets
  "Forms and validation example, one tab per stack. No validation code anywhere:
   the form refuses to submit and each field shows its own message."
  [["html" "HTML" "html"
    "<form action=\"/invite\" method=\"post\">
  <ty-input name=\"email\" label=\"Email\" type=\"email\" required></ty-input>
  <ty-input name=\"code\" label=\"Invite code\" required pattern=\"[A-Z]{3}-[0-9]{4}\"></ty-input>
  <ty-input name=\"handle\" label=\"Handle\" required minlength=\"3\" maxlength=\"15\"></ty-input>
  <ty-input name=\"seats\" label=\"Seats\" type=\"number\" required min=\"1\" max=\"50\"></ty-input>
  <ty-button flavor=\"primary\">Send</ty-button>
</form>"]
   ["react" "React" "javascript"
    "import { TyInput, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <TyInput name=\"email\" label=\"Email\" type=\"email\" required />
  <TyInput name=\"code\" label=\"Invite code\" required pattern=\"[A-Z]{3}-[0-9]{4}\" />
  <TyInput name=\"handle\" label=\"Handle\" required minLength={3} maxLength={15} />
  <TyInput name=\"seats\" label=\"Seats\" type=\"number\" required min={1} max={50} />
  <TyButton flavor=\"primary\">Send</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:> ty/Input {:name \"email\" :label \"Email\" :type \"email\" :required true}]
 [:> ty/Input {:name \"code\" :label \"Invite code\" :required true :pattern \"[A-Z]{3}-[0-9]{4}\"}]
 [:> ty/Input {:name \"handle\" :label \"Handle\" :required true :min-length 3 :max-length 15}]
 [:> ty/Input {:name \"seats\" :label \"Seats\" :type \"number\" :required true :min 1 :max 50}]
 [:> ty/Button {:flavor \"primary\"} \"Send\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:ty-input {:name \"email\" :label \"Email\" :type \"email\" :required \"\"}]
 [:ty-input {:name \"code\" :label \"Invite code\" :required \"\" :pattern \"[A-Z]{3}-[0-9]{4}\"}]
 [:ty-input {:name \"handle\" :label \"Handle\" :required \"\" :minlength \"3\" :maxlength \"15\"}]
 [:ty-input {:name \"seats\" :label \"Seats\" :type \"number\" :required \"\" :min \"1\" :max \"50\"}]
 [:ty-button {:flavor \"primary\"} \"Send\"]]"]
   ["datastar" "Datastar" "html"
    "<form data-on:submit__prevent=\"@post('/invite', {contentType: 'form'})\">
  <ty-input name=\"email\" label=\"Email\" type=\"email\" required></ty-input>
  <ty-input name=\"code\" label=\"Invite code\" required pattern=\"[A-Z]{3}-[0-9]{4}\"></ty-input>
  <ty-input name=\"handle\" label=\"Handle\" required minlength=\"3\" maxlength=\"15\"></ty-input>
  <ty-input name=\"seats\" label=\"Seats\" type=\"number\" required min=\"1\" max=\"50\"></ty-input>
  <ty-button flavor=\"primary\">Send</ty-button>
</form>"]])

(def ^:private api-snippets
  "Values and events card, one tab per stack."
  [["html" "HTML" "javascript"
    "const input = document.getElementById('amount');

input.value = '42';

input.addEventListener('input', (e) => {
  const { value, formattedValue, rawValue } = e.detail;
  // value: 1234.5 · formattedValue: '$1,234.50' · rawValue: what was typed
});
input.addEventListener('change', (e) => save(e.detail.value));"]
   ["react" "React" "javascript"
    "import { TyInput } from 'tyrell-react'

<TyInput type=\"currency\" value={amount}
  onChange={(e) => {
    const { value, formattedValue, rawValue } = e.detail
    // value: 1234.5 · formattedValue: '$1,234.50' · rawValue: what was typed
  }}
  onChangeCommit={(e) => save(e.detail.value)} />"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Input {:type \"currency\" :value @amount
              :on-change #(reset! amount (.. % -detail -value))
              :on-change-commit #(save! (.. % -detail -value))}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-input {:type \"currency\" :value amount
            :on {:input #(set-amount! (.. % -detail -value))
                 :change #(save! (.. % -detail -value))}}]"]
   ["datastar" "Datastar" "html"
    "<ty-input type=\"currency\" data-signals:amount=\"0\"
  data-on:input=\"$amount = evt.detail.value\"
  data-on:change=\"@post('/save')\">
</ty-input>"]])

(defn view []
  (component-page
   {:title "Input"
    :group "Text input"
    :tag "ty-input"
    :description "Text, email, password and numbers that format themselves: currency, percent, compact. Label, error, icon slots, debounced events, real form value."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyInput (React)" "atom"]]
    :source "packages/core/src/components/input.ts"
    :mark "Aa"
    :demo [:div.flex.flex-col.gap-3 {:style {:width "300px"}}
           [:ty-input {:label "Email" :type "email" :value "ada@example.com" :size "md"}
            [:ty-icon {:slot "start" :name "mail"}]]
           [:ty-input {:label "Budget" :type "currency" :currency "EUR" :locale "de-DE" :value "2500" :size "md"}]
           (let [handle (or (doc-state :handle) "ada lovelace")]
             [:ty-input {:label "Handle" :value handle :size "md"
                         :error (when (re-find #"\s" handle) "No spaces, please")
                         :on {:input #(set-doc! :handle (.. % -detail -value))}}])]}

   (playground
    {:id :input
     :defaults {:size "md" :flavor "neutral" :required false :disabled false :error false}
     :controls [{:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :flavor :options flavors :swatch? true :tones? true}
                {:key :required :switch? true}
                {:key :disabled :switch? true}
                {:key :error :switch? true}]
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Numbers that format"
       :span 4
       :description [:span "Formatted at rest, the plain number while you type. " [:code "value"]
                     " and the form value are always the number; percent is in percent units (" [:code "7.5"] " → 7.5%)."]
       :code "<ty-input type=\"currency\" value=\"2500\"
  currency=\"EUR\" locale=\"de-DE\">
<ty-input type=\"percent\" value=\"7.5\" precision=\"1\">
<ty-input type=\"compact\" value=\"1250000\">"}
      (let [last-v (doc-state :number)]
        [:div.flex.flex-col.gap-3.w-full
         [:div.md:grid-cols-3.gap-3 {:style {:display "grid"}}
          (for [[label attrs] [["Price" {:type "currency" :currency "EUR" :locale "de-DE" :value "2500"}]
                               ["Rate" {:type "percent" :value "7.5" :precision "1"}]
                               ["Reach" {:type "compact" :value "1250000"}]]]
            [:ty-input (merge attrs {:replicant/key label :label label
                                     :on {:change #(set-doc! :number (str label ": " (.. % -detail -value)))}})])]
         [:code.ty-text-.text-xs (or last-v "Edit a field, then leave it.")]]))

     (example
      {:title "Slots"
       :span 2
       :description [:span "Icons, units or a whole button in " [:code "start"] " and " [:code "end"] "."]
       :code "<ty-input>
  <ty-icon slot=\"start\"
    name=\"search\"></ty-icon>
  <span slot=\"end\">.dev</span>
</ty-input>"}
      [:div.flex.flex-col.gap-3.w-full
       [:ty-input {:placeholder "Search docs"}
        [:ty-icon {:slot "start" :name "search"}]
        [:ty-button {:slot "end" :action "" :size "xs" :appearance "ghost" :aria-label "Go"}
         [:ty-icon {:name "arrow-right"}]]]
       [:ty-input {:placeholder "example" :value "tyrell"}
        [:span {:slot "start"} "https://"]
        [:span {:slot "end"} ".dev"]]])

     (example
      {:title "Forms and validation"
       :span 6
       :description [:span "Give each field a " [:code "name"] " and its value goes into the form. Rules do the checking: "
                     [:code "required"] ", " [:code "type=\"email\""] ", " [:code "pattern"] ", "
                     [:code "minlength"] " / " [:code "maxlength"] ", " [:code "min"] " / " [:code "max"]
                     ". A field you edit and leave shows its message; on submit every failing field does and the first one in form order takes focus. Nothing is sent until all pass, a message clears as soon as the value is fixed, and "
                     [:code "form.reset()"] " clears them all. "
                     "No validation code. Messages are the browser's own, in the user's language; length messages are Ty's, worded with "
                     [:code "too-short-message"] " / " [:code "too-long-message"] ". "
                     [:code "setCustomValidity()"] " replaces any of them, and for a check only your server can make, set "
                     [:code "error"] " on the field: validation never overwrites or removes it."]
       :tabs rules-snippets}
      (let [sent (doc-state :rules-sent)]
        [:form.flex.flex-col.gap-4.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (set-doc! :rules-sent
                                   (->> (js/FormData. (.-target e)) (.entries) (js/Array.from)
                                        (map (fn [[k v]] (str k "=" v)))
                                        (str/join "&"))))}}
         [:div.gap-3 {:style {:display "grid" :grid-template-columns "repeat(auto-fit, minmax(150px, 1fr))"}}
          [:ty-input {:name "email" :label "Email" :type "email" :required "" :value "ada@"}]
          [:ty-input {:name "code" :label "Invite code" :required "" :pattern "[A-Z]{3}-[0-9]{4}" :value "abc-12"
                      :placeholder "ABC-1234"}]
          [:ty-input {:name "handle" :label "Handle" :required "" :minlength "3" :maxlength "15" :value "ad"}]
          [:ty-input {:name "seats" :label "Seats" :type "number" :required "" :min "1" :max "50" :value "80"}]]
         [:div.flex.items-center.gap-3
          [:ty-button {:size "md" :flavor "primary"} "Send"]
          [:code.ty-text-.text-xs (if sent (str "FormData: " sent) "Press Send, then fix the fields.")]]]))

     (example
      {:title "Sizes with buttons"
       :span 6
       :description [:span "Fields and buttons share one height ladder. Pair a field with the button "
                     [:em "one size up"] " for balanced weight: an " [:code "sm"] " field with an " [:code "md"] " button."]
       :code "<ty-input size=\"sm\"></ty-input>
<ty-button size=\"md\">Subscribe</ty-button>"}
      [:div.flex.flex-col.gap-3.w-full
       (for [[fs bs] [["xs" "sm"] ["sm" "md"] ["md" "lg"] ["lg" "xl"]]]
         [:div.flex.items-center.gap-3 {:replicant/key fs}
          [:span.font-mono.text-xs.ty-text--.shrink-0 {:style {:width "4.5rem"}} (str fs " + " bs)]
          [:ty-input {:size fs :placeholder "you@example.com" :style {:flex "1" :min-width "0"}}]
          [:ty-button {:size bs :flavor "primary"} "Subscribe"]])])

     (example
      {:title "Debounce"
       :span 2
       :description [:span [:code "debounce"] " (ms) delays " [:code "input"] " and " [:code "change"]
                     " until typing pauses. Blur fires anything pending."]
       :code "<ty-input debounce=\"400\">
</ty-input>"}
      (let [{:keys [n q]} (doc-state :debounce)]
        [:div.flex.flex-col.gap-3.w-full
         [:ty-input {:debounce "400" :placeholder "Type fast…"
                     :on {:input #(set-doc! :debounce {:n (inc (or n 0)) :q (.. % -detail -value)})}}
          [:ty-icon {:slot "start" :name "search"}]]
         [:code.ty-text-.text-xs (str (or n 0) " event" (when (not= 1 n) "s") (when q (str " · \"" q "\"")))]]))

     (example
      {:title "Values and events"
       :span 4
       :tabs api-snippets}
      nil)))

   (page-section
    {:title "Theming" :sub "CSS variables. No build step." :dark? true}
    (example
     {:title "Field tokens"
      :side? true
      :lang "css"
      :description [:span "Surface, border and focus ring. Scope them to one field, a form, or " [:code ":root"] "."]
      :code ".signup ty-input {
  --ty-input-bg: #0c1f1d;
  --ty-input-border: #115e59;
  --ty-input-border-hover: #0f766e;
  --ty-input-border-focus: #2dd4bf;
  --ty-input-shadow-focus: #2dd4bf40;
}"}
     [:div.flex.flex-col.gap-3 {:style {:width "100%" :max-width "320px"}}
      (for [[label ph] [["Email" "ada@example.com"] ["Company" "Analytical Engines Ltd."]]]
        [:ty-input {:replicant/key label
                    :label label :placeholder ph
                    :style {"--ty-input-bg" "#0c1f1d"
                            "--ty-input-border" "#115e59"
                            "--ty-input-border-hover" "#0f766e"
                            "--ty-input-border-focus" "#2dd4bf"
                            "--ty-input-shadow-focus" "#2dd4bf40"}}])])

    (example
     {:title "Flavored fields"
      :side? true
      :lang "html"
      :description "A flavor tints the border at rest and the focus ring. Use it for state, not decoration."
      :code "<ty-input flavor=\"success\">
<ty-input flavor=\"warning\">
<ty-input flavor=\"danger\"
  error=\"Taken\">"}
     [:div.flex.flex-col.gap-3 {:style {:width "100%" :max-width "320px"}}
      [:ty-input {:label "Username" :flavor "success" :value "ada"}
       [:ty-icon {:slot "end" :name "check"}]]
      [:ty-input {:label "Display name" :flavor "warning" :value "ada.lovelace"}]
      [:ty-input {:label "Handle" :flavor "danger" :value "admin" :error "Taken"}]]))

   (api-section
    {:properties validation-properties
     :attributes ["Value"
                  ["type" "string" "\"text\"" "text, email, password, tel, url, or a formatted number: number, currency, percent, compact."]
                  ["value" "string" "\"\"" "Current value. Numeric types hold the plain number."]
                  ["name" "string" "Form field name."]
                  ["placeholder" "string" "Hint shown while empty."]
                  "Label & state"
                  ["label" "string" "Label above the field."]
                  ["required" "boolean" "false" "Marks the label and blocks form submission while empty."]
                  ["pattern" "string" "Regex the whole value must match. Text types."]
                  ["minlength / maxlength" "number" "Character limits. Typing stops at maxlength. Text types."]
                  ["min / max" "number" "Smallest / largest numeric value. number, currency, percent, compact."]
                  ["too-short-message / too-long-message" "string" "Wording for the length messages. {minlength} {maxlength} {length} are filled in."]
                  ["error" "string" "Message under the field. Empty string clears it. While it's set, the field looks like flavor=\"danger\", whatever its flavor. When it clears, your flavor's look comes back; the flavor attribute itself never changes. Validation never overwrites or removes one you set, not even on form.reset(); clear it to let validation messages show again."]
                  ["disabled" "boolean" "false" "Not editable, left out of the form."]
                  "Appearance"
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl. Shared ladder with buttons and other fields."]
                  ["flavor" "string" "\"neutral\"" "Tints border and focus ring: primary, success, danger, warning or a custom flavor."]
                  "Numbers"
                  ["currency" "string" "\"USD\"" "ISO currency code for type=\"currency\"."]
                  ["locale" "string" "\"en-US\"" "Number formatting locale."]
                  ["precision" "number" "Fraction digits, 0–10."]
                  "Events"
                  ["debounce" "number" "0" "Delay input and change until typing pauses, in ms (max 5000)."]]
     :events [["input" "{value, formattedValue, rawValue, originalEvent}" "Every keystroke, or after the debounce."]
              ["change" "{value, formattedValue, rawValue, originalEvent}" "Committed value, on blur or Enter."]
              ["focus / blur" "{originalEvent}" "Focus moved in or out. Blur flushes pending debounced events."]]
     :slots [["start" "Before the text: icon, prefix."]
             ["end" "After the text: unit, suffix, a button."]]
     :keyboard [["Password eye" "Toggles visibility; focus stays in the field."]
                ["Numeric types" "Mobile keyboards open the decimal pad."]]
     :css-vars [["--ty-input-bg" "Field background."]
                ["--ty-input-color" "Text color."]
                ["--ty-input-placeholder" "Placeholder color."]
                ["--ty-input-border / -hover / -focus" "Border by state."]
                ["--ty-input-shadow-focus" "Focus ring."]
                ["--ty-input-disabled-bg / -border / -color" "Disabled look."]]})))
