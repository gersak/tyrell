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
  [{:keys [size clear required disabled]}]
  (cond-> {}
    (not= size "sm") (assoc :size size)
    (not clear) (assoc :no-clear true)
    required (assoc :required true)
    disabled (assoc :disabled true)))

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

(defn- render-lineup [{:keys [size clear required disabled]}]
  (let [base (cond-> {:size size}
               (not clear) (assoc :no-clear "")
               required (assoc :required "")
               disabled (assoc :disabled ""))]
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
     :defaults {:size "md" :clear true :required false :disabled false}
     :controls [{:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :clear :switch? true}
                {:key :required :switch? true}
                {:key :disabled :switch? true}]
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
       :code "sel.addEventListener('search', async (e) => {
  sel.loading = true;
  const rows = await api(e.detail.query);
  sel.replaceChildren(...rows.map(toOption));
  sel.loading = false;
});"}
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
       :description [:span "Options take any markup: icon, title, a line of detail. Long text wraps inside the popup."]
       :code "<ty-option value=\"pro\">
  <div class=\"flex items-center gap-3\">
    <ty-icon name=\"zap\"></ty-icon>
    <div class=\"flex flex-col\">
      <span class=\"font-semibold\">Pro</span>
      <span class=\"text-xs ty-text-\">Unlimited projects, …</span>
    </div>
  </div>
</ty-option>"}
      [:ty-select {:label "Plan" :multiple "" :value "team" :style {:width "340px" :max-width "100%"}}
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
            [:span.text-xs.ty-text- detail]]]])])

     (example
      {:title "In a form"
       :span 6
       :description [:span "Single submits one " [:code "name=value"] "; " [:code "multiple"]
                     " submits one entry per value, like native. " [:code "required"] " blocks an empty submit."]
       :code "<form>
  <ty-select name=\"country\" label=\"Country\" required>…</ty-select>
  <ty-select name=\"langs\" label=\"Languages\" multiple>…</ty-select>
</form>
<!-- FormData: country=hr&langs=clj&langs=rs -->"}
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
       :lang "javascript"
       :code "const sel = document.querySelector('ty-select');

sel.value = 'de';                 // multiple: ['clj', 'rs'] or 'clj,rs'
sel.clear();

sel.addEventListener('change', (e) => {
  const { value, values, items, action } = e.detail;
  // action: set | add | remove | clear | create
});
sel.addEventListener('open', () => track('select-open'));"}
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
    {:properties validation-properties
     :attributes ["Value"
                  ["value" "string" "\"\"" "Selected value. With multiple: comma-separated, or an array from frameworks."]
                  ["name" "string" "Form field name. Multiple submits one entry per value."]
                  ["multiple" "boolean" "false" "Toggle options, popup stays open."]
                  "Field"
                  ["label" "string" "Label above the field."]
                  ["placeholder" "string" "\"Select...\"" "Shown while nothing is selected."]
                  ["required" "boolean" "false" "Blocks form submission while empty."]
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
                  ["disabled" "boolean" "false" "Shown, not selectable."]
                  ["flavor" "string" "Tag color for this option in ty-selected-options."]
                  "ty-selected-options"
                  ["for" "string" "id of the select to mirror. Chips are dismissible ty-tags; a <template> child customizes them."]]
     :events [["change" "{value, values, items, action, item}" "Selection changed. action: set, add, remove, clear or create."]
              ["search" "{query}" "Typing in the search row (external-search). Debounced."]
              ["create" "{value, label}" "allow-create minted an option. Cancelable."]
              ["open / close" "{mode, element}" "Popup lifecycle."]]
     :slots [["trigger" "Your own trigger element; replaces the field chrome."]
             ["start / end" "Icons or badges inside the field."]
             ["(default)" "ty-option children."]]
     :keyboard [["Enter / Space / ↓" "Open."]
                ["↑ ↓" "Move through options."]
                ["Enter" "Pick the highlighted option (toggle when multiple)."]
                ["Type" "Filter, when the search row is shown."]
                ["Esc" "Close."]]
     :css-vars [["--ty-input-bg / -border / -border-focus" "Trigger field, shared with ty-input."]
                ["--ty-input-shadow-focus" "Focus ring."]
                ["--ty-select-popup-width" "Popup width, independent of the trigger."]]})))
