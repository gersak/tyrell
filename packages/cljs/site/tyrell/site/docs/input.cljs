(ns tyrell.site.docs.input
  "Documentation for ty-input component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table slot-table
                                             doc-section docs-page component-header section-label demo-area]]))

;; ---------------------------------------------------------------------------
;; API Reference (stands alone as a card, not in doc-section)
;; ---------------------------------------------------------------------------

(defn- api-reference []
  [:div.ty-elevated.rounded-lg.p-6
   [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
    [:h2.scroll-mt-6
     {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
     [:span.ty-text-- "API Reference"]]]

   [:div.mb-6
    (section-label "Attributes")
    (attribute-table
     [{:name "type"
       :type "string"
       :default "'text'"
       :description "Input type: text, number, currency, percent, compact, password, email, tel, url"}
      {:name "value"
       :type "string"
       :default "null"
       :description "Initial value of the input"}
      {:name "placeholder"
       :type "string"
       :default "null"
       :description "Placeholder text"}
      {:name "label"
       :type "string"
       :default "null"
       :description "Label displayed above the input"}
      {:name "name"
       :type "string"
       :default "null"
       :description "Name for form submission"}
      {:name "disabled"
       :type "boolean"
       :default "false"
       :description "Whether the input is disabled"}
      {:name "required"
       :type "boolean"
       :default "false"
       :description "Marks the field as required (shows asterisk)"}
      {:name "error"
       :type "string"
       :default "null"
       :description "Error message to display — automatically applies danger flavor"}
      {:name "size"
       :type "string"
       :default "'md'"
       :description "Size variant: xs, sm, md, lg, xl"}
      {:name "flavor"
       :type "string"
       :default "'neutral'"
       :description "Semantic flavor: primary, success, danger, warning, neutral"}
      {:name "currency"
       :type "string"
       :default "'USD'"
       :description "Currency code for type='currency' (e.g. USD, EUR, GBP)"}
      {:name "locale"
       :type "string"
       :default "browser locale"
       :description "Locale for number formatting (e.g. en-US, de-DE)"}
      {:name "precision"
       :type "number"
       :default "null"
       :description "Decimal places for numeric types. precision=\"0\" gives integer-only input."}
      {:name "debounce"
       :type "number"
       :default "0"
       :description "Debounce delay in milliseconds (0–5000) for input/change events. Events fire immediately on blur."}])]

   [:div.mb-6
    (section-label "Events")
    (event-table
     [{:name "input"
       :payload "{value, formattedValue?, rawValue, originalEvent}"
       :when-fired "On each keystroke (respects debounce)"}
      {:name "change"
       :payload "{value, formattedValue?, rawValue, originalEvent}"
       :when-fired "When input loses focus after a change (respects debounce)"}
      {:name "focus"
       :payload "FocusEvent"
       :when-fired "When input gains focus"}
      {:name "blur"
       :payload "FocusEvent"
       :when-fired "When input loses focus — fires any pending debounced events immediately"}])]

   [:div
    (section-label "Slots")
    (slot-table
     [{:name "start"
       :description "Content before the input field — typically an icon"}
      {:name "end"
       :description "Content after the input field — typically an icon"}])]])

;; ---------------------------------------------------------------------------
;; Section content helpers
;; ---------------------------------------------------------------------------

(defn- basic-usage-content []
  [:div.space-y-5

   [:div.ty-content.rounded-lg.p-5
    (section-label "Simple text input")
    (demo-area
     [:ty-input {:placeholder "Enter your name" :label "Name"}])
    (code-block "<ty-input placeholder=\"Enter your name\" label=\"Name\"></ty-input>")]

   [:div.ty-content.rounded-lg.p-5
    (section-label "Required with initial value")
    (demo-area
     [:ty-input {:value "john@example.com" :label "Email" :required "true" :type "email"}])
    (code-block "<ty-input value=\"john@example.com\" label=\"Email\" required=\"true\" type=\"email\"></ty-input>")]

   [:div.ty-content.rounded-lg.p-5
    (section-label "Error state")
    (demo-area
     [:ty-input {:label "Username" :error "Username is already taken" :value "admin"}])
    (code-block "<ty-input label=\"Username\" error=\"Username is already taken\" value=\"admin\"></ty-input>")]])

(defn- icon-slots-content []
  [:div.ty-content.rounded-lg.p-5
   [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Use start and end slots to add icons or other content before/after the input."]
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:label "Search" :placeholder "Search..." :type "text"}
      [:ty-icon {:slot "start" :name "search" :size "sm"}]]
     [:ty-input {:label "Email" :placeholder "email@example.com" :type "email"}
      [:ty-icon {:slot "start" :name "mail" :size "sm"}]]
     [:ty-input {:label "Password" :placeholder "Enter password" :type "password"}
      [:ty-icon {:slot "start" :name "lock" :size "sm"}]]
     [:ty-input {:label "Website" :placeholder "https://" :type "text"}
      [:ty-icon {:slot "start" :name "globe" :size "sm"}]
      [:ty-icon {:slot "end" :name "external-link" :size "sm"}]]])
   (code-block "<ty-input label=\"Search\" placeholder=\"Search...\">
  <ty-icon slot=\"start\" name=\"search\" size=\"sm\"></ty-icon>
</ty-input>

<ty-input label=\"Password\" placeholder=\"Enter password\" type=\"password\">
  <ty-icon slot=\"start\" name=\"lock\" size=\"sm\"></ty-icon>
</ty-input>

<ty-input label=\"Website\" placeholder=\"https://\">
  <ty-icon slot=\"start\" name=\"globe\" size=\"sm\"></ty-icon>
  <ty-icon slot=\"end\" name=\"external-link\" size=\"sm\"></ty-icon>
</ty-input>")])

(defn- button-slot-content []
  [:div.ty-content.rounded-lg.p-5
   [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Drop a "
    [:code "ty-button"]
    " into the end slot for an inline action — submit, send, apply. The button "
    "keeps its own flavor and sizing independent of the field."]
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:label "Your rating" :type "number" :placeholder "Rate 1–5"}
      [:ty-icon {:slot "start" :name "star" :size "sm"}]
      [:ty-button {:slot "end" :flavor "primary" :size "sm"}
       [:ty-icon {:name "check" :size "sm"}]
       "Submit"]]
     [:ty-input {:label "Search" :placeholder "Search..." :type "text"}
      [:ty-icon {:slot "start" :name "search" :size "sm"}]
      [:ty-button {:slot "end" :flavor "neutral" :size "sm"}
       [:ty-icon {:name "send" :size "sm"}]
       "Go"]]
     [:ty-input {:label "Promo code" :flavor "success" :placeholder "Enter code"}
      [:ty-button {:slot "end" :flavor "success" :size "sm"} "Apply"]]])
   (code-block "<ty-input label=\"Your rating\" type=\"number\" placeholder=\"Rate 1–5\">
  <ty-icon slot=\"start\" name=\"star\" size=\"sm\"></ty-icon>
  <ty-button slot=\"end\" flavor=\"primary\" size=\"sm\">
    <ty-icon name=\"check\" size=\"sm\"></ty-icon>
    Submit
  </ty-button>
</ty-input>")])

(defn- debounce-content []
  [:div.ty-content.rounded-lg.p-5
   [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "The debounce attribute (0–5000ms) delays input and change events. Events fire immediately on blur."]
   (demo-area
    [:div.grid.gap-4
     [:div
      [:ty-input {:id "search-instant" :label "Instant (no debounce)" :placeholder "Type to search..." :debounce "0"}
       [:ty-icon {:slot "start" :name "search" :size "sm"}]]
      [:div.ty-text-.mt-1 {:style {:font-size "0.75rem"}} "Events fired: " [:span#instant-count "0"]]]
     [:div
      [:ty-input {:id "search-300" :label "300ms debounce" :placeholder "Type to search..." :debounce "300"}
       [:ty-icon {:slot "start" :name "search" :size "sm"}]]
      [:div.ty-text-.mt-1 {:style {:font-size "0.75rem"}} "Events fired: " [:span#debounce-300-count "0"]]]
     [:div
      [:ty-input {:id "search-1000" :label "1000ms debounce" :placeholder "Type to search..." :debounce "1000"}
       [:ty-icon {:slot "start" :name "search" :size "sm"}]]
      [:div.ty-text-.mt-1 {:style {:font-size "0.75rem"}} "Events fired: " [:span#debounce-1000-count "0"]]]])
   [:script "(function(){
  let a=0,b=0,c=0;
  document.getElementById('search-instant')?.addEventListener('input',()=>{document.getElementById('instant-count').textContent=++a});
  document.getElementById('search-300')?.addEventListener('input',()=>{document.getElementById('debounce-300-count').textContent=++b});
  document.getElementById('search-1000')?.addEventListener('input',()=>{document.getElementById('debounce-1000-count').textContent=++c});
})();"]
   (code-block "<ty-input label=\"300ms debounce\" debounce=\"300\" placeholder=\"Search...\">
  <ty-icon slot=\"start\" name=\"search\" size=\"sm\"></ty-icon>
</ty-input>

<script>
document.querySelector('ty-input').addEventListener('input', (e) => {
  console.log('Debounced:', e.detail.value);
});
</script>")
   [:div.ty-elevated.rounded.p-4.mt-3
    (section-label "Delay guide")
    [:div.space-y-1.ty-text- {:style {:font-size "0.8125rem"}}
     [:p "0–100ms — real-time feedback, validation"]
     [:p "300–500ms — search inputs, typeahead"]
     [:p "500–1000ms — API calls, expensive operations"]]]])

(defn- text-types-content []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Text types")
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:type "text" :label "Text" :placeholder "Enter text..."}]
     [:ty-input {:type "password" :label "Password" :placeholder "Enter password..." :value "secret123"}]
     [:ty-input {:type "email" :label "Email" :placeholder "email@example.com"}]])
   (code-block "<ty-input type=\"text\" label=\"Text\" placeholder=\"Enter text...\"></ty-input>
<ty-input type=\"password\" label=\"Password\" placeholder=\"Enter password...\"></ty-input>
<ty-input type=\"email\" label=\"Email\" placeholder=\"email@example.com\"></ty-input>")])

(defn- numeric-types-content []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Numeric formatting")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Numeric inputs format values when blurred and maintain a shadow value for calculations."]
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:type "number" :label "Number" :value "1234567.89" :precision "2"}]
     [:ty-input {:type "currency" :label "Price (USD)" :value "1234.56" :currency "USD"}]
     [:ty-input {:type "currency" :label "Price (EUR)" :value "999.99" :currency "EUR" :locale "de-DE"}]
     [:ty-input {:type "percent" :label "Percentage" :value "85.5" :precision "1"}]
     [:ty-input {:type "compact" :label "Compact Number" :value "1234567"}]
     [:ty-input {:type "number" :label "Integer (precision=0)" :value "42" :precision "0" :placeholder "Whole numbers only"}]])
   [:div.rounded.p-3.mt-3 {:style {:background-color "var(--ty-bg-primary-)" :border "1px solid var(--ty-border-primary)"}}
    [:p.ty-text-primary {:style {:font-size "0.8125rem"}}
     "Both " [:code.font-mono "."] " and " [:code.font-mono ","] " work as decimal separators — useful for mobile keyboards that use commas."]]
   (code-block "<ty-input type=\"number\" label=\"Number\" value=\"1234567.89\" precision=\"2\"></ty-input>
<ty-input type=\"currency\" label=\"Price (USD)\" value=\"1234.56\" currency=\"USD\"></ty-input>
<ty-input type=\"currency\" label=\"Price (EUR)\" value=\"999.99\" currency=\"EUR\" locale=\"de-DE\"></ty-input>
<ty-input type=\"percent\" label=\"Percentage\" value=\"85.5\" precision=\"1\"></ty-input>
<ty-input type=\"compact\" label=\"Compact Number\" value=\"1234567\"></ty-input>
<ty-input type=\"number\" label=\"Quantity\" precision=\"0\"></ty-input>")])

(defn- sizes-content []
  [:div.ty-content.rounded-lg.p-5
   [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Five size variants for different contexts and layouts."]
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:size "xs" :placeholder "Extra small" :label "Size XS"}]
     [:ty-input {:size "sm" :placeholder "Small" :label "Size SM"}]
     [:ty-input {:size "md" :placeholder "Medium (default)" :label "Size MD"}]
     [:ty-input {:size "lg" :placeholder "Large" :label "Size LG"}]
     [:ty-input {:size "xl" :placeholder "Extra large" :label "Size XL"}]])
   (code-block "<ty-input size=\"xs\" placeholder=\"Extra small\" label=\"Size XS\"></ty-input>
<ty-input size=\"sm\" placeholder=\"Small\" label=\"Size SM\"></ty-input>
<ty-input size=\"md\" placeholder=\"Medium (default)\" label=\"Size MD\"></ty-input>
<ty-input size=\"lg\" placeholder=\"Large\" label=\"Size LG\"></ty-input>
<ty-input size=\"xl\" placeholder=\"Extra large\" label=\"Size XL\"></ty-input>")])

(defn- flavors-content []
  [:div.ty-content.rounded-lg.p-5
   [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Semantic colors for different states and purposes. The error attribute automatically applies danger flavor."]
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:flavor "neutral" :placeholder "Default neutral" :label "Neutral"}]
     [:ty-input {:flavor "primary" :placeholder "Primary action" :label "Primary"}]
     [:ty-input {:flavor "success" :value "Valid input" :label "Success"}]
     [:ty-input {:flavor "warning" :value "Check this" :label "Warning"}]
     [:ty-input {:flavor "danger" :value "Invalid data" :label "Danger"}]])
   (code-block "<ty-input flavor=\"neutral\" placeholder=\"Default neutral\" label=\"Neutral\"></ty-input>
<ty-input flavor=\"primary\" placeholder=\"Primary action\" label=\"Primary\"></ty-input>
<ty-input flavor=\"success\" value=\"Valid input\" label=\"Success\"></ty-input>
<ty-input flavor=\"warning\" value=\"Check this\" label=\"Warning\"></ty-input>
<ty-input flavor=\"danger\" value=\"Invalid data\" label=\"Danger\"></ty-input>")])

(defn- form-integration-content []
  [:div.ty-content.rounded-lg.p-5
   [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "ty-input is fully form-associated — works with FormData, form submission, and reset like native inputs."]
   (demo-area
    [:form.space-y-4 {:on {:submit (fn [^js e]
                                     (.preventDefault e)
                                     (let [fd (js/FormData. (.-target e))]
                                       (js/alert (str "Submitted: " (js/JSON.stringify (js/Object.fromEntries fd) nil 2)))))}}
     [:ty-input {:name "fullname" :label "Full Name" :required "true"}]
     [:ty-input {:name "email" :type "email" :label "Email" :required "true"}]
     [:ty-input {:name "age" :type "number" :label "Age" :min "18" :max "120"}]
     [:ty-input {:name "salary" :type "currency" :label "Expected Salary" :currency "USD"}]
     [:div.flex.gap-2.pt-1
      [:ty-button {:type "submit" :flavor "primary"} "Submit"]
      [:ty-button {:type "reset" :flavor "neutral"} "Reset"]]])
   (code-block "<form>
  <ty-input name=\"fullname\" label=\"Full Name\" required=\"true\"></ty-input>
  <ty-input name=\"email\" type=\"email\" label=\"Email\" required=\"true\"></ty-input>
  <ty-input name=\"salary\" type=\"currency\" label=\"Salary\" currency=\"USD\"></ty-input>

  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>
  <ty-button type=\"reset\" flavor=\"neutral\">Reset</ty-button>
</form>

<script>
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  console.log(data);
});
</script>")])

(defn- mobile-keyboard-content []
  [:div.ty-content.rounded-lg.p-5
   [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "ty-input automatically sets the correct inputmode for each type — controls which keyboard appears on mobile."]
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:type "text" :label "Text — default keyboard" :placeholder "Full keyboard..."}]
     [:ty-input {:type "number" :label "Number — decimal keypad" :placeholder "0.00"}]
     [:ty-input {:type "currency" :label "Currency — decimal keypad" :currency "USD" :placeholder "0.00"}]
     [:ty-input {:type "email" :label "Email — @ keyboard" :placeholder "email@example.com"}]
     [:ty-input {:type "tel" :label "Telephone — phone dialer" :placeholder "+1 555 000 0000"}]
     [:ty-input {:type "url" :label "URL — url keyboard" :placeholder "https://example.com"}]])
   (code-block "<ty-input type=\"text\"></ty-input>    <!-- default keyboard -->
<ty-input type=\"number\"></ty-input>  <!-- decimal keypad -->
<ty-input type=\"currency\"></ty-input> <!-- decimal keypad -->
<ty-input type=\"email\"></ty-input>   <!-- @ keyboard -->
<ty-input type=\"tel\"></ty-input>     <!-- phone dialer -->
<ty-input type=\"url\"></ty-input>     <!-- url keyboard -->")])

(defn- validation-content []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Live validation")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "ty-input displays errors via the error attribute. You control validation logic."]
   (demo-area
    [:div
     [:ty-input {:id "username-input" :label "Username (3–20 chars)" :placeholder "Enter username..."}]
     [:p.ty-text--.mt-1 {:style {:font-size "0.75rem"}} "Type to see validation"]])
   [:script "
document.getElementById('username-input')?.addEventListener('input', (e) => {
  const v = e.detail.value;
  const el = e.target;
  if (v && v.length < 3) el.setAttribute('error', 'At least 3 characters');
  else if (v && v.length > 20) el.setAttribute('error', 'Max 20 characters');
  else el.removeAttribute('error');
});"]
   (code-block "<ty-input id=\"username\" label=\"Username (3–20 chars)\"></ty-input>

<script>
document.getElementById('username').addEventListener('input', (e) => {
  const v = e.detail.value;
  if (v && v.length < 3) e.target.setAttribute('error', 'At least 3 characters');
  else if (v && v.length > 20) e.target.setAttribute('error', 'Max 20 characters');
  else e.target.removeAttribute('error');
});
</script>" "javascript")])

(defn- currency-converter-content []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Currency converter")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Numeric inputs maintain a shadow value — the unformatted number — accessible via event.detail.value."]
   (demo-area
    [:div.grid.gap-4
     [:ty-input {:id "usd-amount" :type "currency" :label "USD Amount" :currency "USD" :value "100"
                 ;; Inline <script> injected via Replicant hiccup never executes, so
                 ;; wire the live conversion through an on-mount lifecycle hook instead.
                 :replicant/on-mount
                 (fn [{^js node :replicant/node}]
                   (.addEventListener
                     node "input"
                     (fn [^js e]
                       (let [v (js/parseFloat (.. e -detail -value))
                             eur (js/document.getElementById "eur-amount")]
                         (when (and eur (not (js/isNaN v)))
                           (set! (.-value eur) (.toFixed (* v 0.93) 2)))))))}]
     [:ty-input {:id "eur-amount" :type "currency" :label "EUR (at 0.93 rate)" :currency "EUR" :locale "de-DE" :disabled "true" :value "93.00"}]])
   (code-block "<ty-input id=\"usd\" type=\"currency\" label=\"USD\" currency=\"USD\"></ty-input>
<ty-input id=\"eur\" type=\"currency\" label=\"EUR\" currency=\"EUR\" locale=\"de-DE\" disabled=\"true\"></ty-input>

<script>
document.getElementById('usd').addEventListener('input', (e) => {
  // e.detail.value is the raw number, not the formatted string
  document.getElementById('eur').value = (e.detail.value * 0.93).toFixed(2);
});
</script>" "javascript")])

(defn- best-practices-content []
  [:div.ty-elevated.rounded-lg.p-5
   [:div.grid.gap-6
    {:style {:grid-template-columns "repeat(auto-fill, minmax(260px, 1fr))"}}

    [:div
     [:div.flex.items-center.gap-2.mb-3
      [:ty-icon.ty-text-success {:name "check-circle" :size "16"}]
      [:span.ty-text-success+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Do"]]
     [:div.space-y-2
      (for [t ["Always provide labels for accessibility"
               "Use semantic input types (email, password, tel, url)"
               "Show validation feedback via the error attribute"
               "Use event.detail.value for numeric shadow values"
               "Set currency and locale for international apps"
               "Use name attribute for form submission"]]
        [:div.flex.items-start.gap-2
         [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
         [:p.ty-text- {:style {:font-size "0.8125rem"}} t]])]]

    [:div
     [:div.flex.items-center.gap-2.mb-3
      [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
      [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
     [:div.space-y-2
      (for [t ["Use formatted display values for calculations"
               "Expect ty-input to validate data for you"
               "Use placeholder as a label replacement"
               "Ignore event.detail.value for numeric types"
               "Mix error attribute with non-danger flavors"]]
        [:div.flex.items-start.gap-2
         [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
         [:p.ty-text- {:style {:font-size "0.8125rem"}} t]])]]]])

(defn- tips-content []
  [:div.ty-content.rounded-lg.p-5
   [:div.space-y-4
    (for [[title body] [["Shadow values for numbers"
                         "Numeric inputs maintain a shadow value — the actual number. Access it via event.detail.value for calculations, not the formatted display string."]
                        ["Formatting behavior"
                         "Numeric inputs show formatted values when blurred (e.g. $1,234.56) and raw values when focused (1234.56) for easier entry."]
                        ["Form association"
                         "ty-input is fully form-associated. Works with FormData, form submission, and form reset exactly like native inputs."]
                        ["Error display"
                         "The error attribute displays a message and applies danger styling. It's stateless — set it or remove it based on your own validation logic."]]]
      [:div
       [:p.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600" :margin-bottom "0.25rem"}} title]
       [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}} body]])]])

;; ---------------------------------------------------------------------------
;; View
;; ---------------------------------------------------------------------------

(defn view []
  (docs-page
   (component-header "ty-input"
                     "Form-associated input with automatic numeric formatting, semantic styling, and debounce. Supports text, number, currency, percent, password, email, tel, and url types.")

   (api-reference)

   (doc-section "Basic Usage" (basic-usage-content))
   (doc-section "Icon Slots" (icon-slots-content))
   (doc-section "Action Button in Slot" (button-slot-content))
   (doc-section "Debounce" (debounce-content))

   (doc-section "Input Types"
     [:div.space-y-5
      (text-types-content)
      (numeric-types-content)])

   (doc-section "Sizes" (sizes-content))
   (doc-section "Semantic Flavors" (flavors-content))
   (doc-section "Form Integration" (form-integration-content))
   (doc-section "Mobile Keyboard Modes" (mobile-keyboard-content))

   (doc-section "Advanced Examples"
     [:div.space-y-5
      (validation-content)
      (currency-converter-content)])

   (doc-section "Best Practices" (best-practices-content))
   (doc-section "Tips & Tricks" (tips-content))

   [:div.p-4.ty-border.border.rounded-lg
    (section-label "Related Components")
    [:div.flex.flex-wrap.gap-4
     {:style {:font-size "0.875rem"}}
     [:a.ty-text-primary.hover:underline {:href "/docs/checkbox"} "ty-checkbox →"]
     [:a.ty-text-primary.hover:underline {:href "/docs/copy"} "ty-copy →"]
     [:a.ty-text-primary.hover:underline {:href "/docs/textarea"} "ty-textarea →"]
     [:a.ty-text-primary.hover:underline {:href "/docs/dropdown"} "ty-dropdown →"]
     [:a.ty-text-primary.hover:underline {:href "/components/select"} "ty-select →"]]]))
