(ns tyrell.site.docs.select
  "Documentation for ty-select, ty-option and ty-selected-options"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private countries [["hr" "Croatia"] ["de" "Germany"] ["fr" "France"] ["it" "Italy"]
                          ["jp" "Japan"] ["nl" "Netherlands"] ["pt" "Portugal"] ["se" "Sweden"]])

(def ^:private dbs [["pg" "PostgreSQL"] ["mysql" "MySQL"] ["sqlite" "SQLite"]])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size clear required disabled error]}]
  (cond-> {}
    (not= size "sm") (assoc :size size)
    (not clear) (assoc :no-clear true)
    required (assoc :required true)
    disabled (assoc :disabled true)
    error (assoc :error "Pick one we ship to")))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     [(into [:ty-select (apply array-map
                               (concat [:label "Country" :html/name "country" :html/value "hr" :jsx/value "{country}"
                                        :reagent/value "@country" :replicant/value "country"]
                                       (apply concat attrs)
                                       [:jsx/onChange "{(e) => setCountry(e.detail.value)}"
                                        :reagent/on-change "#(reset! country (.. % -detail -value))"
                                        :replicant/on "{:change #(set-country! (.. % -detail -value))}"
                                        (snippets/ds "data-bind") "country"]))]
            (for [[v l] (take 3 countries)] [:ty-option {:value v} l]))])))

(defn- render-lineup [{:keys [size clear required disabled error]}]
  (let [base (cond-> {:size size}
               (not clear) (assoc :no-clear "")
               required (assoc :required "")
               disabled (assoc :disabled "")
               error (assoc :error "Pick one we ship to"))]
    [:div.flex.flex-col.gap-4 {:style {:width "100%" :max-width "340px"}}
     [:ty-select (assoc base :label "Country" :value "hr" :replicant/key "c")
      (for [[v l] countries] [:ty-option {:replicant/key v :value v} l])]
     [:ty-select (assoc base :label "Database" :value "pg" :replicant/key "d")
      [:ty-icon {:slot "start" :name "database"}]
      (for [[v l] dbs] [:ty-option {:replicant/key v :value v} l])]
     [:ty-select (assoc base :label "Languages" :multiple "" :value "clj,ts" :replicant/key "l")
      (for [[v l] [["clj" "Clojure"] ["ts" "TypeScript"] ["rs" "Rust"] ["go" "Go"]]]
        [:ty-option {:replicant/key v :value v} l])]]))

;; External search demo -------------------------------------------------------

(def ^:private robots ["Bobo Robot" "Rob Roy" "Robusta Grinder" "EYWA Reacher" "PDF Generator"
                       "Robot Wrangler" "Probe Unit 7" "Robin Indexer" "Aerobot" "Microbot Swarm"])

(defn- doc-state [k] (get-in @state/state [:select-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:select-doc k] v))

(defn- fake-search!
  "Stand-in for fetch(): 450ms later, the matching robots become options."
  [query]
  (set-doc! :loading true)
  (js/setTimeout
   (fn []
     (set-doc! :results (vec (filter #(str/includes? (str/lower-case %) (str/lower-case (or query ""))) robots)))
     (set-doc! :loading false))
   450))

(def ^:private rich-chip-css
  "Rich chips: capped width, left-aligned, detail wraps. Plain CSS on the
   light-DOM chips; the same lines are in the example's code."
  "ty-selected-options ty-tag { max-width: 18rem; }
   ty-selected-options ty-tag::part(container) { border-radius: 0.75rem; padding-block: 0.25rem; }
   ty-selected-options ty-tag > * { white-space: normal; text-align: start; }")

(def ^:private search-snippets
  "Options from your API, one tab per stack."
  [["html" "HTML" "javascript"
    "const sel = document.getElementById('robot');

sel.addEventListener('search', async (e) => {
  sel.loading = true;
  const rows = await api(e.detail.query);
  sel.replaceChildren(...rows.map(toOption));
  sel.loading = false;
});"]
   ["react" "React" "javascript"
    "import { TySelect, TyOption } from 'tyrell-react'

<TySelect externalSearch loading={loading}
  onSearch={async (e) => {
    setLoading(true)
    setRows(await api(e.detail.query))
    setLoading(false)
  }}>
  {rows.map((r) => <TyOption key={r.id} value={r.id}>{r.name}</TyOption>)}
</TySelect>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Select {:external-search true :loading @loading?
               :on-search #(search! (.. % -detail -query))}
 (for [{:keys [id name]} @rows]
   ^{:key id} [:> ty/Option {:value id} name])]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-select {:external-search \"\" :loading (when loading? \"\")
             :on {:search #(search! (.. % -detail -query))}}
 (for [{:keys [id name]} rows]
   [:ty-option {:replicant/key id :value id} name])]"]
   ["datastar" "Datastar" "html"
    "<!-- the server patches the <ty-option>s back in -->
<ty-select id=\"robot\" external-search data-indicator:searching
  data-attr:loading=\"$searching\"
  data-on:search=\"@get('/robots?q=' + evt.detail.query)\">
</ty-select>"]])

(def ^:private api-snippets
  "JavaScript API card, one tab per stack."
  [["html" "HTML" "javascript"
    "const sel = document.getElementById('lang');

sel.value = 'de';                 // multiple: ['clj', 'rs'] or 'clj,rs'
sel.clear();

sel.addEventListener('change', (e) => {
  const { value, values, items, action } = e.detail;
  // action: set | add | remove | clear | create
});
sel.addEventListener('open', () => track('select-open'));"]
   ["react" "React" "javascript"
    "import { TySelect } from 'tyrell-react'

<TySelect value={lang}             // multiple: ['clj', 'rs']
  onChange={(e) => {
    const { value, values, items, action } = e.detail
    // action: set | add | remove | clear | create
  }}
  onOpen={() => track('select-open')}>
  …
</TySelect>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Select {:value @lang      ; multiple: [\"clj\" \"rs\"]
               :on-change #(reset! lang (.. % -detail -value))
               :on-open #(track! \"select-open\")}
 …]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-select {:value lang      ; multiple: \"clj,rs\"
             :on {:change #(set-lang! (.. % -detail -value))
                  :open #(track! \"select-open\")}}
 …]"]
   ["datastar" "Datastar" "html"
    "<ty-select data-signals:lang=\"'de'\" data-attr:value=\"$lang\"
  data-on:change=\"$lang = evt.detail.value\"
  data-on:open=\"@post('/track/select-open')\">
  …
</ty-select>"]])

(def ^:private form-snippets
  "In a form, one tab per stack. FormData: country=hr&langs=clj&langs=rs"
  [["html" "HTML" "html"
    "<form action=\"/profile\" method=\"post\">
  <ty-select name=\"country\" label=\"Country\" required>
    <ty-option value=\"hr\">Croatia</ty-option>
    <ty-option value=\"de\">Germany</ty-option>
  </ty-select>
  <ty-select name=\"langs\" label=\"Languages\" multiple value=\"clj,rs\">
    <ty-option value=\"clj\">Clojure</ty-option>
    <ty-option value=\"rs\">Rust</ty-option>
  </ty-select>
  <ty-button flavor=\"primary\">Send</ty-button>
</form>
<!-- country=hr&langs=clj&langs=rs -->"]
   ["react" "React" "javascript"
    "import { TySelect, TyOption, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <TySelect name=\"country\" label=\"Country\" required>
    <TyOption value=\"hr\">Croatia</TyOption>
    <TyOption value=\"de\">Germany</TyOption>
  </TySelect>
  <TySelect name=\"langs\" label=\"Languages\" multiple value={['clj', 'rs']}>
    <TyOption value=\"clj\">Clojure</TyOption>
    <TyOption value=\"rs\">Rust</TyOption>
  </TySelect>
  <TyButton flavor=\"primary\">Send</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:> ty/Select {:name \"country\" :label \"Country\" :required true}
  [:> ty/Option {:value \"hr\"} \"Croatia\"]
  [:> ty/Option {:value \"de\"} \"Germany\"]]
 [:> ty/Select {:name \"langs\" :label \"Languages\" :multiple true :value [\"clj\" \"rs\"]}
  [:> ty/Option {:value \"clj\"} \"Clojure\"]
  [:> ty/Option {:value \"rs\"} \"Rust\"]]
 [:> ty/Button {:flavor \"primary\"} \"Send\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:ty-select {:name \"country\" :label \"Country\" :required \"\"}
  [:ty-option {:value \"hr\"} \"Croatia\"]
  [:ty-option {:value \"de\"} \"Germany\"]]
 [:ty-select {:name \"langs\" :label \"Languages\" :multiple \"\" :value \"clj,rs\"}
  [:ty-option {:value \"clj\"} \"Clojure\"]
  [:ty-option {:value \"rs\"} \"Rust\"]]
 [:ty-button {:flavor \"primary\"} \"Send\"]]"]
   ["datastar" "Datastar" "html"
    "<form data-on:submit__prevent=\"@post('/profile', {contentType: 'form'})\">
  <ty-select name=\"country\" label=\"Country\" required>
    <ty-option value=\"hr\">Croatia</ty-option>
    <ty-option value=\"de\">Germany</ty-option>
  </ty-select>
  <ty-select name=\"langs\" label=\"Languages\" multiple value=\"clj,rs\">
    <ty-option value=\"clj\">Clojure</ty-option>
    <ty-option value=\"rs\">Rust</ty-option>
  </ty-select>
  <ty-button flavor=\"primary\">Send</ty-button>
</form>"]])

(defn view []
  (component-page
   {:title "Select"
    :group "Selection"
    :tag "ty-select"
    :description "One control for single and multiple choice. Search appears for long lists, options can come from your API, chips render anywhere, and it submits like a native select."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TySelect (React)" "atom"]]
    :source "packages/core/src/components/select.ts"
    :mark "▾"
    :demo [:div.flex.flex-col.gap-3 {:style {:width "300px"}}
           [:ty-select {:label "Country" :value "hr" :size "md"}
            (for [[v l] countries] [:ty-option {:replicant/key v :value v} l])]
           [:ty-select {:label "Database" :value "pg" :size "md"}
            [:ty-icon {:slot "start" :name "database"}]
            (for [[v l] dbs] [:ty-option {:replicant/key v :value v} l])]]}

   (playground
    {:id :select
     :defaults {:size "md" :clear true :required false :disabled false :error false}
     :controls [{:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :clear :switch? true}
                {:key :required :switch? true}
                {:key :disabled :switch? true}
                {:key :error :switch? true}]
     :sub "Open them. Country has 8 options, so it gets a search row."
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Multiple with chips"
       :span 4
       :description [:span [:code "multiple"] " keeps the popup open and toggles options. "
                     [:code "ty-selected-options"] " shows the picks as dismissible tags, wherever you put it."]
       :code "<ty-select id=\"stack\" multiple compact>
  <ty-option value=\"clj\" flavor=\"primary\">
    Clojure
  </ty-option>
  …
</ty-select>

<ty-selected-options for=\"stack\"></ty-selected-options>"}
      [:div.flex.flex-wrap.items-center.gap-2
       [:ty-select {:id "doc-stack" :multiple "" :compact "" :placeholder "Add language" :value "clj,rs"}
        (for [[v l f] [["clj" "Clojure" "primary"] ["ts" "TypeScript" "warning"]
                       ["rs" "Rust" "danger"] ["go" "Go" "success"] ["zig" "Zig" "neutral"]]]
          [:ty-option {:replicant/key v :value v :flavor f} l])]
       [:ty-selected-options {:for "doc-stack"}]])

     (example
      {:title "Custom trigger"
       :span 2
       :description [:span "Slot anything as " [:code "slot=\"trigger\""] "; the field chrome goes away. Show the picks yourself, here as a count."]
       :code "<ty-select multiple>
  <ty-button slot=\"trigger\">
    Filter
    <ty-tag slot=\"end\">2</ty-tag>
  </ty-button>
  …
</ty-select>"}
      (let [picked (or (doc-state :filter) ["open" "review"])]
        [:ty-select {:multiple "" :placement "bottom-start" :value (str/join "," picked)
                     :on {:change #(set-doc! :filter (vec (.. % -detail -values)))}}
         [:ty-button {:slot "trigger" :appearance "outlined" :size "md"}
          [:ty-icon {:slot "start" :name "filter"}] "Filter"
          (when (seq picked)
            [:ty-tag {:slot "end" :size "xs" :flavor "primary"} (count picked)])]
         (for [[v l] [["open" "Open"] ["review" "In review"] ["done" "Done"]]]
           [:ty-option {:replicant/key v :value v} l])]))

     (example
      {:title "Options from your API"
       :span 3
       :description [:span [:code "external-search"] " stops local filtering and fires a debounced "
                     [:code "search"] ". Set " [:code "loading"] ", fetch, swap the options. Try "
                     [:code "rob"] "."]
       :tabs search-snippets}
      (let [results (doc-state :results)]
        [:ty-select (cond-> {:label "Robot" :external-search "" :debounce "250" :placeholder "Type to search…"
                             :on {:search #(fake-search! (.. % -detail -query))}}
                      (doc-state :loading) (assoc :loading ""))
         (for [r (or results (take 4 robots))]
           [:ty-option {:replicant/key r :value r} r])]))

     (example
      {:title "Create on the fly"
       :span 3
       :description [:span [:code "allow-create"] ": Enter on text that matches nothing adds it as an option and fires "
                     [:code "create"] ". " [:code "create-transform=\"slug\""] " normalizes the value."]
       :code "<ty-select multiple allow-create
  create-transform=\"slug\">"}
      [:ty-select {:label "Tags" :multiple "" :allow-create "" :create-transform "slug" :value "design"}
       (for [[v l] [["design" "Design"] ["eng" "Engineering"] ["ops" "Ops"]]]
         [:ty-option {:replicant/key v :value v} l])])

     (example
      {:title "Search row"
       :span 3
       :description [:span "Lists of 8+ options get a search row on their own. "
                     [:code "not-searchable"] " turns it off: a bare attribute, like " [:code "disabled"]
                     ". It can't override " [:code "external-search"] " or " [:code "allow-create"] "."]
       :code "<!-- 12 options: search row appears -->
<ty-select label=\"Month\">…</ty-select>

<!-- opt out -->
<ty-select label=\"Month\" not-searchable>…</ty-select>"}
      (let [months ["January" "February" "March" "April" "May" "June" "July"
                    "August" "September" "October" "November" "December"]
            opts (for [m months] [:ty-option {:replicant/key m :value m} m])]
        [:div.flex.flex-wrap.gap-3.w-full
         [:ty-select {:label "Month" :style {:flex "1" :min-width "150px"}} opts]
         [:ty-select {:label "Month, no search" :not-searchable "" :style {:flex "1" :min-width "150px"}} opts]]))

     (example
      {:title "On a phone"
       :span 3
       :description [:span "On touch screens up to 768px the popup opens as a full dialog. With "
                     [:code "multiple"] ", picks are pinned in a strip above the list and one section is open at a time. "
                     [:code "selected-label"] " and " [:code "available-label"] " rename the two headings; the count is added for you."]
       :code "<ty-select multiple
  selected-label=\"In basket\"
  available-label=\"Fruit\">
  …
</ty-select>"}
      [:ty-select {:label "Basket" :multiple "" :value "apple,fig"
                   :selected-label "In basket" :available-label "Fruit"}
       (for [f ["Apple" "Banana" "Cherry" "Fig" "Grape" "Kiwi" "Lemon" "Mango" "Pear" "Plum"]]
         [:ty-option {:replicant/key f :value (str/lower-case f)} f])])

     (example
      {:title "Rich options"
       :span 6
       :description [:span "Options take any markup: icon, title, a line of detail. That doesn't fit in a field, so use a "
                     [:code "slot=\"trigger\""] " and show the picks with " [:code "ty-selected-options"]
                     ": each chip is the option itself."]
       :code "<ty-select id=\"plan\" multiple value=\"team\">
  <ty-button slot=\"trigger\">Choose plans</ty-button>
  <ty-option value=\"pro\">
    <div class=\"flex items-center gap-3\">
      <ty-icon name=\"zap\"></ty-icon>
      <div class=\"flex flex-col\">
        <span class=\"font-semibold\">Pro</span>
        <span class=\"text-xs ty-text-\">Unlimited projects, …</span>
      </div>
    </div>
  </ty-option>
  …
</ty-select>

<ty-selected-options for=\"plan\"></ty-selected-options>

<style>
  ty-selected-options ty-tag { max-width: 18rem; }
  ty-selected-options ty-tag::part(container) { border-radius: 0.75rem; padding-block: 0.25rem; }
  ty-selected-options ty-tag > * { white-space: normal; text-align: start; }
</style>"}
      [:div.flex.flex-col.items-start.gap-3
       [:ty-select {:id "doc-plan" :multiple "" :value "team" :placement "bottom-start"}
        [:ty-button {:slot "trigger" :appearance "outlined" :size "md"}
         [:ty-icon {:slot "start" :name "layers"}] "Choose plans"]
        (for [[v icon title detail]
              [["free" "feather" "Free" "One project, community support, and a monthly limit on builds and storage."]
               ["pro" "zap" "Pro" "Unlimited projects, priority builds, and email support during business hours."]
               ["team" "users" "Team" "Everything in Pro, plus shared workspaces, roles, and an audit log for every change."]
               ["enterprise" "building" "Enterprise" "Single sign-on, custom contracts, a dedicated contact, and an uptime guarantee."]]]
          [:ty-option {:replicant/key v :value v}
           [:div.flex.items-center.gap-3
            [:ty-icon.ty-text-primary.shrink-0 {:name icon}]
            [:div.flex.flex-col
             [:span.font-semibold.ty-text++ title]
             [:span.text-xs.ty-text- detail]]]])]
       [:style rich-chip-css]
       [:div.flex.flex-wrap.gap-3
        [:ty-selected-options {:for "doc-plan"}]]])

     (example
      {:title "In a form"
       :span 6
       :description [:span "Single submits one " [:code "name=value"] "; " [:code "multiple"]
                     " submits one entry per value, like native. " [:code "required"]
                     " blocks an empty submit: the browser's message shows under the field and the select takes focus. No JS needed."]
       :tabs form-snippets}
      (let [sent (doc-state :sent)]
        [:form.flex.flex-col.gap-4.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (set-doc! :sent (->> (js/FormData. (.-target e)) (.entries) (js/Array.from)
                                              (map (fn [[k v]] (str k "=" v))) (str/join "&"))))}}
         [:div.flex.flex-wrap.items-end.gap-3
          [:ty-select {:name "country" :label "Country" :required "" :style {:flex "1" :min-width "180px"}}
           (for [[v l] countries] [:ty-option {:replicant/key v :value v} l])]
          [:ty-select {:name "langs" :label "Languages" :multiple "" :value "clj,rs" :style {:flex "1" :min-width "180px"}}
           (for [[v l] [["clj" "Clojure"] ["ts" "TypeScript"] ["rs" "Rust"]]] [:ty-option {:replicant/key v :value v} l])]
          [:ty-button {:size "md" :flavor "primary"} "Send"]]
         [:code.ty-text-.text-xs (if sent (str "FormData: " sent) "Pick a country, then Send. Send first to see required.")]]))

     (example
      {:title "JavaScript API"
       :tabs api-snippets}
      nil)))

   (page-section
    {:title "Theming" :sub "Field tokens, shared with ty-input." :dark? true}
    (example
     {:title "Field tokens"
      :side? true
      :lang "css"
      :description [:span "The trigger is a field, so " [:code "--ty-input-*"] " restyles it together with inputs in the same form."]
      :code ".filters {
  --ty-input-bg: #0c1f1d;
  --ty-input-border: #115e59;
  --ty-input-border-focus: #2dd4bf;
  --ty-input-shadow-focus: #2dd4bf40;
}"}
     [:div.flex.flex-col.gap-3 {:style {:width "100%" :max-width "320px"
                                         "--ty-input-bg" "#0c1f1d"
                                         "--ty-input-border" "#115e59"
                                         "--ty-input-border-hover" "#0f766e"
                                         "--ty-input-border-focus" "#2dd4bf"
                                         "--ty-input-shadow-focus" "#2dd4bf40"}}
      [:ty-select {:label "Region" :value "eu"}
       (for [[v l] [["eu" "Europe"] ["na" "North America"] ["ap" "Asia Pacific"]]]
         [:ty-option {:replicant/key v :value v} l])]
      [:ty-input {:label "Search" :placeholder "Service name"}]]))

   (api-section
    {:properties (into [["clear()" "() => void" "Clears the selection and fires change (action clear). Shows no validation message, so it's safe for resetting a form in code; the built-in × does show it."]]
                       validation-properties)
     :attributes ["Value"
                  ["value" "string" "\"\"" "Selected value. With multiple: comma-separated, or an array from frameworks."]
                  ["name" "string" "Form field name. Multiple submits one entry per value."]
                  ["multiple" "boolean" "false" "Toggle options, popup stays open."]
                  "Field"
                  ["label" "string" "Label above the field."]
                  ["placeholder" "string" "\"Select...\"" "Shown while nothing is selected."]
                  ["required" "boolean" "false" "Blocks form submission while empty. The message shows under the field on submit, and as soon as a user change leaves it empty."]
                  ["error" "string" "\"\"" "Message under the field; \"\" clears it. While it's set, the select looks like flavor=\"danger\", whatever its flavor, and your flavor's look comes back when it clears. Validation writes it too and clears it once the select is valid."]
                  ["disabled" "boolean" "false" "Not interactive, left out of the form."]
                  ["readonly" "boolean" "false" "Shows the value; doesn't open."]
                  ["no-clear" "boolean" "false" "No × button (it shows once something is selected)."]
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl."]
                  ["flavor" "string" "Colors the field border and focus ring: a built-in, its +/- tone, or a custom flavor."]
                  ["compact" "boolean" "false" "Content-width trigger for toolbars; multiple shows a count badge."]
                  "Search"
                  ["not-searchable" "boolean" "false" "Drop the search row. It shows by default once there are 8+ options; external-search and allow-create keep it on."]
                  ["external-search" "boolean" "false" "Don't filter locally; fire search and let you replace the options."]
                  ["debounce" "number" "Delay for the search event, in ms."]
                  ["loading" "boolean" "false" "Spinner in the option list while you fetch."]
                  ["allow-create" "boolean" "false" "Enter on unmatched text adds an option and fires create."]
                  ["create-transform" "string" "\"none\"" "none, or slug to normalize created values."]
                  "Popup"
                  ["placement" "string" "bottom, bottom-start, bottom-end, top, top-start, top-end. Flips when there's no room."]
                  ["align" "string" "\"start\"" "start, center or end. placement wins when both are set."]
                  ["selected-label" "string" "\"Selected\"" "Mobile dialog: heading of the pinned selection strip. Count is appended."]
                  ["available-label" "string" "\"Available\"" "Mobile dialog: heading of the option list. Count is appended."]
                  ["no-options-message" "string" "\"No options available\"" "Shown when nothing matches the search."]
                  "ty-option"
                  ["value" "string" "What the select takes when this option is picked."]
                  ["label" "string" "Plain text for chips and the multiple field instead of the option's content."]
                  ["disabled" "boolean" "false" "Shown, not selectable."]
                  ["hidden" "boolean" "false" "Not offered: left out of the list, the arrow keys and the search. Can still be the value, like <option hidden>."]
                  ["flavor" "string" "Tag color for this option in ty-selected-options."]
                  "ty-selected-options"
                  ["for" "string" "id of the select to mirror. Each chip is a dismissible ty-tag holding the option's own content (plain text with label); a <template> child replaces it."]]
     :events [["change" "{value, values, items, action, item}" "Selection changed. action: set, add, remove, clear or create."]
              ["search" "{query}" "Typing in the search row (external-search). Debounced."]
              ["create" "{value, label}" "allow-create minted an option. Cancelable."]
              ["open / close" "{mode, element}" "Popup lifecycle."]]
     :slots [["trigger" "Your own trigger element; replaces the field chrome. An error line shows under it, and the trigger gets aria-invalid and aria-description."]
             ["start / end" "Icons or badges inside the field."]
             ["(default)" "ty-option children."]]
     :keyboard [["Enter / Space / ↓" "Open."]
                ["↑ ↓" "Move through options."]
                ["Enter" "Pick the highlighted option (toggle when multiple)."]
                ["Type" "Filter, when the search row is shown."]
                ["Esc" "Close the list; focus returns to the select. Inside a ty-popup or ty-modal only the list closes."]]
     :css-vars [["--ty-input-bg / -border / -border-focus" "Trigger field, shared with ty-input."]
                ["--ty-input-shadow-focus" "Focus ring."]
                ["--ty-select-popup-width" "Popup width, independent of the trigger."]]})))
