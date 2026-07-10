(ns tyrell.site.docs.select
  "Documentation for ty-select + ty-selected-tags components"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

;; ============================================================================
;; API Reference
;; ============================================================================

(defn api-reference []
  [:div.ty-elevated.rounded-lg.p-6
   [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
    [:h2.scroll-mt-6
     {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
     [:span.ty-text-- "API Reference"]]]

   [:div.mb-6
    (section-label "ty-select Attributes")
    (attribute-table
     [{:name "multiple"
       :type "boolean"
       :default "false"
       :description "Multi select (native <select multiple> semantics). Absent = single select: picking an option replaces the selection and closes the popup."}
      {:name "compact"
       :type "boolean"
       :default "false"
       :description "Compact content-hugging trigger (toolbars, filter bars) instead of the default full-width form-field look. Single shows the selected label; multiple shows placeholder + count badge (pair with ty-selected-tags)."}
      {:name "value"
       :type "string"
       :default "\"\""
       :description "Selected value; comma-separated when multiple. Also accepts arrays from frameworks."}
      {:name "name"
       :type "string"
       :default "-"
       :description "Form field name. Single submits one entry; multiple submits one entry per value (repeated name= pairs)."}
      {:name "label"
       :type "string"
       :default "-"
       :description "Label displayed above the field"}
      {:name "placeholder"
       :type "string"
       :default "\"Select...\""
       :description "Shown while nothing is selected. With a selection, the trigger shows the selected label(s) instead — except multiple+compact, which keeps the placeholder and adds a count badge."}
      {:name "searchable"
       :type "string"
       :default "\"auto\""
       :description "Search row visibility. auto (default): only for lists with 8+ options — short lists open as pure options. searchable / searchable=\"true\": always. searchable=\"false\": never. external-search always shows it."}
      {:name "external-search"
       :type "boolean"
       :default "false"
       :description "Delegate filtering to consumer via search event instead of filtering locally"}
      {:name "debounce"
       :type "number"
       :default "0"
       :description "Debounce for the search event in ms (0-5000)"}
      {:name "loading"
       :type "boolean"
       :default "false"
       :description "Show spinner in options area (external search in flight)"}
      {:name "size"
       :type "string"
       :default "\"md\""
       :description "Size variant: sm, md, lg"}])]

   [:div.mb-6
    (section-label "ty-selected-tags Attributes")
    (attribute-table
     [{:name "for"
       :type "string"
       :default "-"
       :description "id of the picker to display. Falls back to the previous element sibling. Renders selected values as dismissible ty-tags; label and flavor are read from the matching ty-option."}
      {:name "<template> child"
       :type "element"
       :default "-"
       :description "Optional chip blueprint. Placeholders {value}, {label}, {flavor} and {data-*} (from the matching option) are interpolated into attributes and text. Without it, a plain dismissible ty-tag is rendered."}])]

   [:div.mb-6
    (section-label "Slots (ty-select)")
    [:p.ty-text-.mb-0 {:style {:font-size "0.8125rem" :line-height "1.6"}}
     [:code.ty-text "start"] " / " [:code.ty-text "end"]
     " — adornments inside the trigger (icons, badges); end sits before the chevron. "
     [:code.ty-text "trigger"] " — replaces the field/compact chrome entirely (behavior, form and ARIA stay). "
     [:code.ty-text "loading"] " — custom popup loading indicator. Default slot = the "
     [:code.ty-text "ty-option"] " children."]
    [:p.ty-text-.mb-0.mt-2 {:style {:font-size "0.8125rem" :line-height "1.6"}}
     [:code.ty-text "ty-option"] " extras: rich HTML content is allowed — single select clones the "
     "selected option into the field, so it displays intact. A "
     [:code.ty-text "label"] " attribute (native <option label> semantics) provides clean display "
     "text for multi-select summaries and chips; " [:code.ty-text "data-*"]
     " attributes feed ty-selected-tags templates."]]

   [:div
    (section-label "Events (ty-select)")
    (event-table
     [{:name "change"
       :payload "{value, values: string[], items: [{value, label, flavor}], action, item}"
       :when-fired "Selection changed. value is a scalar for single select, an array when multiple. items carries enough info to render rich chips out-of-band."}
      {:name "search"
       :payload "{query: string, element}"
       :when-fired "External search mode: user typed in the search input (debounced)"}
      {:name "open / close"
       :payload "{mode: 'desktop'|'mobile', element}"
       :when-fired "Popup lifecycle"}])]])

;; ============================================================================
;; Examples
;; ============================================================================

(defn example-single []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Single select (default) — a form field like any other")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "By default ty-select is a single select styled as a form field — it sits next to "
    [:code.ty-text "ty-input"] " and matches. Picking an option replaces the selection "
    "and closes the popup; the field shows the selected label."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "single-select"
                  :label "Robot"
                  :name "robot"
                  :style {:max-width "280px"}}
      [:ty-option {:value "bobo" :flavor "primary"} "Bobo Robot Name"]
      [:ty-option {:value "email" :flavor "info"} "Email klijent za KnowledBase"]
      [:ty-option {:value "eywa" :flavor "success"} "EYWA Dataset Example with Reacher"]
      [:ty-option {:value "pdf"} "Generate PDF microservice"]]])
   (code-block "<ty-select label=\"Robot\" name=\"robot\">
  <ty-option value=\"bobo\">Bobo Robot Name</ty-option>
  <ty-option value=\"email\">Email klijent za KnowledBase</ty-option>
  <ty-option value=\"eywa\">EYWA Dataset Example</ty-option>
</ty-select>

<!-- submits: robot=eywa -->")])

(defn example-slots []
  [:div.ty-content.rounded-lg.p-5
   (section-label "start / end slots — adornments in the field")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Same convention as " [:code.ty-text "ty-input"] ": slot icons or badges into "
    [:code.ty-text "start"] " / " [:code.ty-text "end"] ". Spacing comes from the "
    "field's gap — no margins needed. " [:code.ty-text "end"] " sits before the chevron. "
    "Works in the " [:code.ty-text "compact"] " skin too."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "slots-select"
                  :label "Database"
                  :value "pg"
                  :style {:max-width "280px"}}
      [:ty-icon {:slot "start" :name "database" :size "sm"}]
      [:span {:slot "end"
              :class "ty-bg-success- ty-text-success"
              :style {:font-size "0.6875rem" :padding "1px 8px" :border-radius "9999px"}}
       "online"]
      [:ty-option {:value "pg"} "PostgreSQL"]
      [:ty-option {:value "mysql"} "MySQL"]
      [:ty-option {:value "sqlite"} "SQLite"]]])
   (code-block "<ty-select label=\"Database\" value=\"pg\">
  <ty-icon slot=\"start\" name=\"database\" size=\"sm\"></ty-icon>
  <span slot=\"end\" class=\"ty-bg-success- ty-text-success\">online</span>

  <ty-option value=\"pg\">PostgreSQL</ty-option>
  <ty-option value=\"mysql\">MySQL</ty-option>
  <ty-option value=\"sqlite\">SQLite</ty-option>
</ty-select>")])

(defn example-basic []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Multiple — picker + out-of-band chips")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Add " [:code.ty-text "multiple"] " for native <select multiple> semantics: options "
    "toggle on click and the popup stays open. Add " [:code.ty-text "compact"]
    " for the compact trigger skin with a count badge, and pair with "
    [:code.ty-text "ty-selected-tags"] " to render the selection as dismissible chips — "
    "anywhere in the layout, decoupled from the picker."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "basic-select"
                  :multiple true
                  :compact true
                  :label "Robots"
                  :name "robots"
                  :placeholder "Select robots"}
      [:ty-option {:value "bobo" :flavor "primary"} "Bobo Robot Name"]
      [:ty-option {:value "email" :flavor "info"} "Email klijent za KnowledBase"]
      [:ty-option {:value "eywa" :flavor "success"} "EYWA Dataset Example with Reacher"]
      [:ty-option {:value "pdf"} "Generate PDF microservice"]
      [:ty-option {:value "ppz"} "Generate PPZ"]]
     [:div.flex.flex-wrap.gap-2
      [:ty-selected-tags {:for "basic-select"}]]])
   (code-block "<ty-select multiple compact id=\"robots\" label=\"Robots\" name=\"robots\" placeholder=\"Select robots\">
  <ty-option value=\"bobo\" flavor=\"primary\">Bobo Robot Name</ty-option>
  <ty-option value=\"email\" flavor=\"info\">Email klijent za KnowledBase</ty-option>
  <ty-option value=\"eywa\" flavor=\"success\">EYWA Dataset Example</ty-option>
</ty-select>

<!-- anywhere else in the layout -->
<ty-selected-tags for=\"robots\"></ty-selected-tags>")])

(defn example-custom-trigger []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Custom Trigger — style it freely")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Slot any element with " [:code.ty-text "slot=\"trigger\""]
    " and the default field chrome disappears — the trigger is 100% yours. "
    "Popup width is independent of the trigger (override with "
    [:code.ty-text "--ty-select-popup-width"] ")."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "trigger-select"
                  :multiple true
                  :name "robots"}
      [:ty-button {:slot "trigger" :flavor "primary" :outlined true :pill true}
       [:ty-icon {:slot "start" :name "filter" :size "sm"}]
       "Robots"]
      [:ty-option {:value "bobo"} "Bobo Robot Name"]
      [:ty-option {:value "email"} "Email klijent za KnowledBase"]
      [:ty-option {:value "eywa"} "EYWA Dataset Example with Reacher"]
      [:ty-option {:value "pdf"} "Generate PDF microservice"]]
     [:div.flex.flex-wrap.gap-2
      [:ty-selected-tags {:for "trigger-select"}]]])
   (code-block "<ty-select multiple name=\"robots\" id=\"robots\">
  <!-- your trigger, your styling -->
  <ty-button slot=\"trigger\" flavor=\"primary\" outlined pill>
    <ty-icon slot=\"start\" name=\"filter\" size=\"sm\"></ty-icon>
    Robots
  </ty-button>

  <ty-option value=\"bobo\">Bobo Robot Name</ty-option>
  <ty-option value=\"email\">Email klijent za KnowledBase</ty-option>
</ty-select>
<ty-selected-tags for=\"robots\"></ty-selected-tags>")])

(defn example-template []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Custom Chip Template")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Drop a " [:code.ty-text "<template>"] " inside ty-selected-tags to control the chip markup. "
    "Placeholders " [:code.ty-text "{value}"] ", " [:code.ty-text "{label}"] ", "
    [:code.ty-text "{flavor}"] " and any " [:code.ty-text "{data-*}"]
    " attribute from the matching option are interpolated — plain HTML, no JS, "
    "so it works server-rendered (HTMX/Datastar) out of the box."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "template-select"
                  :multiple true
                  :compact true
                  :name "services"
                  :placeholder "Pick services"}
      [:ty-option {:value "db" :flavor "info" :data-icon "database"} "Database"]
      [:ty-option {:value "mail" :flavor "success" :data-icon "mail"} "Mail Service"]
      [:ty-option {:value "auth" :flavor "danger" :data-icon "lock"} "Auth Provider"]
      [:ty-option {:value "cron" :data-icon "clock"} "Scheduler"]]
     [:div.flex.flex-wrap.gap-2
      [:ty-selected-tags {:for "template-select"}
       [:template
        [:ty-tag {:flavor "{flavor}" :dismissible true :pill true}
         [:ty-icon {:slot "start" :name "{data-icon}" :size "xs"}]
         "{label}"]]]]])
   (code-block "<ty-select multiple compact id=\"services\" name=\"services\">
  <ty-option value=\"db\" flavor=\"info\" data-icon=\"database\">Database</ty-option>
  <ty-option value=\"mail\" flavor=\"success\" data-icon=\"mail\">Mail Service</ty-option>
</ty-select>

<ty-selected-tags for=\"services\">
  <template>
    <ty-tag flavor=\"{flavor}\" dismissible pill>
      <ty-icon slot=\"start\" name=\"{data-icon}\" size=\"xs\"></ty-icon>
      {label}
    </ty-tag>
  </template>
</ty-selected-tags>")])

(defn example-preselected []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Pre-selected values")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "Set " [:code.ty-text "value"] " with comma-separated values, or mark options with "
    [:code.ty-text "selected"] "."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "preselected-select"
                  :multiple true
                  :label "Tech Stack"
                  :value "react,clojure"
                  :placeholder "Pick your stack"
                  :style {:max-width "280px"}}
      [:ty-option {:value "react" :flavor "info"} "React"]
      [:ty-option {:value "clojure" :flavor "primary"} "Clojure"]
      [:ty-option {:value "node" :flavor "success"} "Node.js"]
      [:ty-option {:value "python" :flavor "warning"} "Python"]]
     [:div.flex.flex-wrap.gap-2
      [:ty-selected-tags {:for "preselected-select"}]]])
   (code-block "<ty-select multiple value=\"react,clojure\" label=\"Tech Stack\">
  <ty-option value=\"react\" flavor=\"info\">React</ty-option>
  <ty-option value=\"clojure\" flavor=\"primary\">Clojure</ty-option>
  ...
</ty-select>")])

(defn example-form []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Form Integration — the form-ready test")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "ty-select is form-associated. Single select submits one entry; with "
    [:code.ty-text "multiple"] " it submits one repeated "
    [:code.ty-text "name="] " entry per selected value — exactly what HTMX and "
    "server frameworks expect for multi-value fields. Pick some skills and submit."]
   (demo-area
    [:div.space-y-3
     [:form#select-form-demo.space-y-3
      [:ty-select {:id "form-select"
                   :multiple true
                   :label "Skills"
                   :name "skills"
                   :placeholder "Pick skills"
                   :style {:max-width "280px"}}
       [:ty-option {:value "js"} "JavaScript"]
       [:ty-option {:value "ts"} "TypeScript"]
       [:ty-option {:value "clj"} "Clojure"]
       [:ty-option {:value "py"} "Python"]]
      [:div.flex.flex-wrap.gap-2
       [:ty-selected-tags {:for "form-select"}]]
      [:ty-button {:type "submit" :flavor "primary"} "Submit form"]]
     [:div.ty-elevated.rounded.px-3.py-2 {:style {:font-size "0.8125rem"}}
      [:span.ty-text-- "FormData: "]
      [:code#form-select-output.ty-text "submit to inspect..."]]
     [:script
      "(function() {
  const form = document.getElementById('select-form-demo');
  const output = document.getElementById('form-select-output');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const entries = [...fd.entries()].map(([k, v]) => k + '=' + v);
    output.textContent = entries.length ? entries.join('&') : '(empty)';
  });
})();"]])
   (code-block "<form method=\"post\" action=\"/filter\">
  <ty-select multiple name=\"skills\" label=\"Skills\">
    <ty-option value=\"js\">JavaScript</ty-option>
    <ty-option value=\"ts\">TypeScript</ty-option>
  </ty-select>
  <ty-selected-tags></ty-selected-tags> <!-- previous-sibling fallback -->
  <button type=\"submit\">Filter</button>
</form>

<!-- submits: skills=js&skills=ts -->")])

(defn example-events []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Change Event — rich items payload")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "The change event carries " [:code.ty-text "values"] " plus "
    [:code.ty-text "items"] " with label and flavor per value — everything needed "
    "to render rich chips or drive queries without re-lookup."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "event-select"
                  :multiple true
                  :label "Watch the event"
                  :placeholder "Toggle options"
                  :style {:max-width "280px"}}
      [:ty-option {:value "a" :flavor "danger"} "Alpha"]
      [:ty-option {:value "b" :flavor "warning"} "Beta"]
      [:ty-option {:value "c"} "Gamma"]]
     [:pre.ty-elevated.rounded.px-3.py-2
      {:style {:font-size "0.75rem" :overflow-x "auto"}}
      [:code#event-select-output "change events appear here..."]]
     [:script
      "(function() {
  const el = document.getElementById('event-select');
  const output = document.getElementById('event-select-output');
  if (!el) return;
  el.addEventListener('change', (e) => {
    output.textContent = JSON.stringify(e.detail, null, 2);
  });
})();"]])
   (code-block "select.addEventListener('change', (e) => {
  e.detail.value   // 'a' (single) or ['a', 'b'] (multiple)
  e.detail.values  // ['a', 'b'] — always the array form
  e.detail.items   // [{value:'a', label:'Alpha', flavor:'danger'}, ...]
  e.detail.action  // 'add' | 'remove' | 'set'
  e.detail.item    // the value that changed
});" "javascript")])

(defn example-large []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Large lists — search appears automatically")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "With " [:code.ty-text "searchable=\"auto\""] " (the default), lists past 7 options "
    "get the search row for free — this one has 100. The list caps at ~10 visible rows "
    "and scrolls; typing filters locally."]
   (demo-area
    [:ty-select {:id "large-select"
                 :label "City"
                 :style {:max-width "280px"}}
     (let [prefixes ["New" "Old" "East" "West" "North" "South" "Upper" "Lower" "Port" "San"]
           bases ["Zagreb" "Split" "Rijeka" "Berlin" "Madrid" "Turin" "Porto" "Lyon" "Vienna" "Prague"]]
       (for [[i [p b]] (map-indexed vector (for [p prefixes, b bases] [p b]))]
         [:ty-option {:value (str "c" i)} (str p " " b)]))])
   (code-block "<ty-select label=\"City\">
  <!-- 100 options — search row shows up automatically -->
  <ty-option value=\"c0\">New Zagreb</ty-option>
  <ty-option value=\"c1\">New Split</ty-option>
  ...
</ty-select>")])

(defn example-external-search []
  [:div.ty-content.rounded-lg.p-5
   (section-label "External search — options from your API")
   [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
    "With " [:code.ty-text "external-search"] " the component stops filtering and "
    "delegates: typing emits a debounced " [:code.ty-text "search"] " event, you set "
    [:code.ty-text "loading"] ", fetch, replace the " [:code.ty-text "ty-option"]
    " children, and clear loading. This demo fakes a 450ms API — try typing "
    [:code.ty-text "rob"] "."]
   (demo-area
    [:div.space-y-3
     [:ty-select {:id "external-select"
                  :external-search true
                  :debounce "250"
                  :label "Robot"
                  :placeholder "Type to search..."
                  :style {:max-width "280px"}}]
     [:script
      "(function() {
  const el = document.getElementById('external-select');
  if (!el) return;
  const ROBOTS = ['Bobo Robot', 'Rob Roy', 'Robusta Grinder', 'EYWA Reacher',
                  'PDF Generator', 'Robot Wrangler', 'Probe Unit 7',
                  'Robin Indexer', 'Aerobot', 'Microbot Swarm'];
  el.addEventListener('search', (e) => {
    const q = (e.detail.query || '').toLowerCase();
    el.loading = true;
    setTimeout(() => {                       // <- your fetch() goes here
      el.querySelectorAll('ty-option').forEach(o => o.remove());
      ROBOTS.filter(r => r.toLowerCase().includes(q)).forEach((r, i) => {
        const o = document.createElement('ty-option');
        o.setAttribute('value', 'r' + i);
        o.textContent = r;
        el.appendChild(o);
      });
      el.loading = false;
    }, 450);
  });
})();"]])
   (code-block "<ty-select external-search debounce=\"250\" label=\"Robot\" id=\"robots\"></ty-select>

<script>
  const el = document.getElementById('robots');
  el.addEventListener('search', async (e) => {
    el.loading = true;
    const results = await fetch('/api/robots?q=' + e.detail.query).then(r => r.json());
    el.querySelectorAll('ty-option').forEach(o => o.remove());
    for (const item of results) {
      const o = document.createElement('ty-option');
      o.setAttribute('value', item.id);
      o.textContent = item.name;
      el.appendChild(o);
    }
    el.loading = false;
  });
</script>" "javascript")])

(defn examples []
  (doc-section "Examples"
    [:div.space-y-6
     (example-single)
     (example-slots)
     (example-basic)
     (example-custom-trigger)
     (example-template)
     (example-preselected)
     (example-large)
     (example-external-search)
     (example-form)
     (example-events)]))

;; ============================================================================
;; Migration
;; ============================================================================

(defn migration []
  (doc-section "Migrating from ty-dropdown / ty-multiselect"
    [:div.ty-content.rounded-lg.p-5
     [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
      "ty-select replaces both: it IS a single select by default (like ty-dropdown), "
      "and " [:code.ty-text "multiple"] " gives multi-select. Unlike ty-multiselect it "
      "renders no chips inside the field — options are ty-option children, and chips "
      "render out-of-band via ty-selected-tags (or your own code)."]
     (code-block "<!-- Before: ty-dropdown (single) -->
<ty-dropdown name=\"skill\">
  <ty-option value=\"js\">JavaScript</ty-option>
</ty-dropdown>

<!-- After -->
<ty-select name=\"skill\">
  <ty-option value=\"js\">JavaScript</ty-option>
</ty-select>

<!-- Before: ty-multiselect (chips inside the field) -->
<ty-multiselect name=\"skills\">
  <ty-tag value=\"js\">JavaScript</ty-tag>
</ty-multiselect>

<!-- After: multiple + chips wherever you want -->
<ty-select multiple name=\"skills\">
  <ty-option value=\"js\">JavaScript</ty-option>
</ty-select>
<ty-selected-tags for=\"...\"></ty-selected-tags>")]))

;; ============================================================================
;; Page
;; ============================================================================

(defn view []
  (docs-page
   (component-header "ty-select"
                     "The select control — replaces ty-dropdown and ty-multiselect. Single select by default (form-field look, native <select> semantics); add multiple for multi-select, compact for a content-hugging trigger skin, or slot a custom trigger. Searchable popup, form-associated.")
   (api-reference)
   (examples)
   (migration)))
