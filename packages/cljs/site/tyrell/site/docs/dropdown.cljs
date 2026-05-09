(ns tyrell.site.docs.dropdown
  "Documentation for ty-dropdown component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-dropdown"
                     "Single-select dropdown with built-in search, keyboard navigation, and smart popup positioning. Use ty-option children — they support full HTML content, unlike native <option>.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "value"
        :type "string"
        :default "-"
        :description "Currently selected option value"}
       {:name "placeholder"
        :type "string"
        :default "-"
        :description "Placeholder text when nothing is selected"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Label displayed above the dropdown"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name — required for FormData submission"}
       {:name "external-search"
        :type "boolean"
        :default "false"
        :description "Switch to external (remote) search mode. Dropdown stops filtering locally and fires search events on each keystroke — parent owns filtering"}
       {:name "not-clearable"
        :type "boolean"
        :default "false"
        :description "Hides the clear (×) button — use when the selection must not be reset"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disable the dropdown entirely"}
       {:name "loading"
        :type "boolean"
        :default "false"
        :description "Replace the open popup options list with a centered spinner. Search input stays usable. Pair with external-search while fetching results — see Loading State below. Customize the spinner globally via setLoaderSvg() / window.tyLoader.set()."}
       {:name "readonly"
        :type "boolean"
        :default "false"
        :description "Hides the chevron and uses default cursor — selection still works"}
       {:name "required"
        :type "boolean"
        :default "false"
        :description "Marks field required — shows asterisk and participates in form validation"}
       {:name "debounce"
        :type "number"
        :default "0"
        :description "Milliseconds to debounce search events — useful with external-search + API calls"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Size variant: xs, sm, md, lg, xl"}
       {:name "flavor"
        :type "string"
        :default "\"neutral\""
        :description "Semantic color: primary, secondary, success, danger, warning, neutral"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "change"
        :payload "{value: string, text: string, option: Element}"
        :when-fired "Fires when the selected option changes"}
       {:name "search"
        :payload "{query: string}"
        :when-fired "Fires when user types in external-search mode. Also fires automatically with query=\"\" when the popup opens (so consumers can refresh the option list to a clean state)."}
       {:name "open"
        :payload "{mode: 'desktop' | 'mobile'}"
        :when-fired "Fires when the popup opens. With external-search, a search event with empty query follows immediately."}
       {:name "close"
        :payload "{mode: 'desktop' | 'mobile'}"
        :when-fired "Fires when the popup closes (selection, outside click, Escape, etc.)"}
       {:name "focus"
        :payload "FocusEvent"
        :when-fired "Fires when the dropdown gains focus"}
       {:name "blur"
        :payload "FocusEvent"
        :when-fired "Fires when the dropdown loses focus"}])]]

   ;; Examples
   (doc-section "Examples"
                [:div.space-y-6

      ;; Basic
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Basic")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Pass " [:code "ty-option"] " children. Search is enabled by default — it filters options by their text content."]
                  (demo-area
                   [:div.flex.flex-wrap.gap-4.items-end
                    [:ty-dropdown {:placeholder "Select a color..."}
                     [:ty-option {:value "red"} "Red"]
                     [:ty-option {:value "blue"} "Blue"]
                     [:ty-option {:value "green"} "Green"]
                     [:ty-option {:value "yellow"} "Yellow"]]
                    [:ty-dropdown {:label "Size" :value "medium"}
                     [:ty-option {:value "small"} "Small"]
                     [:ty-option {:value "medium"} "Medium"]
                     [:ty-option {:value "large"} "Large"]
                     [:ty-option {:value "xl"} "Extra Large"]]])
                  (code-block "<ty-dropdown placeholder=\"Select a color...\">
  <ty-option value=\"red\">Red</ty-option>
  <ty-option value=\"blue\">Blue</ty-option>
  <ty-option value=\"green\">Green</ty-option>
</ty-dropdown>

<ty-dropdown label=\"Size\" value=\"medium\">
  <ty-option value=\"small\">Small</ty-option>
  <ty-option value=\"medium\">Medium</ty-option>
  <ty-option value=\"large\">Large</ty-option>
</ty-dropdown>")]

      ;; Sizes
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Sizes")
                  (demo-area
                   [:div.flex.flex-col.items-start.gap-3
                    (for [[size label] [["xs" "Extra small"] ["sm" "Small"] ["md" "Medium (default)"]
                                        ["lg" "Large"] ["xl" "Extra large"]]]
                      [:ty-dropdown {:size size :placeholder label}
                       [:ty-option {:value "a"} "Option A"]
                       [:ty-option {:value "b"} "Option B"]
                       [:ty-option {:value "c"} "Option C"]])])
                  (code-block "<ty-dropdown size=\"xs\">...</ty-dropdown>
<ty-dropdown size=\"sm\">...</ty-dropdown>
<ty-dropdown size=\"md\">...</ty-dropdown>
<ty-dropdown size=\"lg\">...</ty-dropdown>
<ty-dropdown size=\"xl\">...</ty-dropdown>")]

      ;; Flavors
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Semantic Flavors")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Flavor signals context — use danger for destructive choices, success for confirmed selections."]
                  (demo-area
                   [:div.flex.flex-wrap.gap-4.items-end
                    (for [flavor ["primary" "secondary" "success" "danger" "warning" "neutral"]]
                      [:ty-dropdown {:flavor flavor :value "selected"}
                       [:ty-option {:value "selected"} (clojure.string/capitalize flavor)]])])
                  (code-block "<ty-dropdown flavor=\"primary\" value=\"selected\">...</ty-dropdown>
<ty-dropdown flavor=\"success\" value=\"selected\">...</ty-dropdown>
<ty-dropdown flavor=\"danger\" value=\"selected\">...</ty-dropdown>
<ty-dropdown flavor=\"warning\" value=\"selected\">...</ty-dropdown>")]

      ;; States
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "States")
                  (demo-area
                   [:div.flex.flex-wrap.gap-4.items-end
                    [:ty-dropdown {:label "Required" :required "" :placeholder "Required field"}
                     [:ty-option {:value "a"} "Option A"]
                     [:ty-option {:value "b"} "Option B"]]
                    [:ty-dropdown {:label "Disabled" :disabled "" :value "locked"}
                     [:ty-option {:value "locked"} "Locked value"]
                     [:ty-option {:value "other"} "Other"]]
                    [:ty-dropdown {:label "Read-only" :readonly "" :value "readonly-val"}
                     [:ty-option {:value "readonly-val"} "Read-only value"]
                     [:ty-option {:value "other"} "Other"]]])
                  (code-block "<ty-dropdown label=\"Required\" required placeholder=\"Required field\">...</ty-dropdown>
<ty-dropdown label=\"Disabled\" disabled value=\"locked\">...</ty-dropdown>
<ty-dropdown label=\"Read-only\" readonly value=\"readonly-val\">...</ty-dropdown>")]

      ;; Clearable
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Clear Button")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "The clear (×) button appears whenever a value is selected. Use " [:code "not-clearable"] " to lock the selection — never use " [:code "clearable=\"false\""] " (boolean attribute pitfall)."]
                  (demo-area
                   [:div.flex.flex-wrap.gap-4.items-end
                    [:ty-dropdown {:label "Clearable (default)" :value "admin"}
                     [:ty-option {:value "admin"} "Administrator"]
                     [:ty-option {:value "editor"} "Editor"]
                     [:ty-option {:value "viewer"} "Viewer"]]
                    [:ty-dropdown {:label "Not clearable" :not-clearable "" :value "admin"}
                     [:ty-option {:value "admin"} "Administrator"]
                     [:ty-option {:value "editor"} "Editor"]
                     [:ty-option {:value "viewer"} "Viewer"]]])
                  (code-block "<!-- Clear button shown by default when a value is selected -->
<ty-dropdown value=\"admin\">...</ty-dropdown>

<!-- Lock the selection — no clear button -->
<ty-dropdown value=\"admin\" not-clearable>...</ty-dropdown>")]])

   ;; Advanced Examples
   (doc-section "Advanced Examples"
                [:div.space-y-6

      ;; Rich Content
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Rich Content Options")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   [:code "ty-option"] " accepts arbitrary HTML — icons, avatars, two-line descriptions. Search still filters by the option's text content."]
                  (demo-area
                   [:div.flex.flex-wrap.gap-4.items-end
                    [:ty-dropdown {:value "clojure" :placeholder "Choose language..."}
                     [:ty-option {:value "javascript"}
                      [:div.flex.items-center.gap-3
                       [:div {:style {:width "1.5rem" :height "1.5rem" :border-radius "0.25rem"
                                      :background "#f7df1e" :display "flex" :align-items "center"
                                      :justify-content "center" :font-size "0.625rem" :font-weight "700" :color "#000"}} "JS"]
                       [:div
                        [:div {:style {:font-weight "500"}} "JavaScript"]
                        [:div.ty-text-- {:style {:font-size "0.75rem"}} "Dynamic scripting"]]]]
                     [:ty-option {:value "typescript"}
                      [:div.flex.items-center.gap-3
                       [:div {:style {:width "1.5rem" :height "1.5rem" :border-radius "0.25rem"
                                      :background "#3178c6" :display "flex" :align-items "center"
                                      :justify-content "center" :font-size "0.625rem" :font-weight "700" :color "#fff"}} "TS"]
                       [:div
                        [:div {:style {:font-weight "500"}} "TypeScript"]
                        [:div.ty-text-- {:style {:font-size "0.75rem"}} "JS with static typing"]]]]
                     [:ty-option {:value "clojure"}
                      [:div.flex.items-center.gap-3
                       [:div {:style {:width "1.5rem" :height "1.5rem" :border-radius "0.25rem"
                                      :background "#5881d8" :display "flex" :align-items "center"
                                      :justify-content "center" :font-size "0.625rem" :font-weight "700" :color "#fff"}} "λ"]
                       [:div
                        [:div {:style {:font-weight "500"}} "Clojure"]
                        [:div.ty-text-- {:style {:font-size "0.75rem"}} "Functional Lisp for the JVM"]]]]]
                    [:ty-dropdown {:value "alice" :placeholder "Assign to..."}
                     [:ty-option {:value "alice"}
                      [:div.flex.items-center.gap-3
                       [:div {:style {:width "2rem" :height "2rem" :border-radius "9999px"
                                      :background "#3b82f6" :display "flex" :align-items "center"
                                      :justify-content "center" :color "#fff" :font-weight "500"}} "A"]
                       [:div
                        [:div {:style {:font-weight "500"}} "Alice Johnson"]
                        [:div.ty-text-- {:style {:font-size "0.75rem"}} "Senior Developer"]]]]
                     [:ty-option {:value "bob"}
                      [:div.flex.items-center.gap-3
                       [:div {:style {:width "2rem" :height "2rem" :border-radius "9999px"
                                      :background "#a855f7" :display "flex" :align-items "center"
                                      :justify-content "center" :color "#fff" :font-weight "500"}} "B"]
                       [:div
                        [:div {:style {:font-weight "500"}} "Bob Smith"]
                        [:div.ty-text-- {:style {:font-size "0.75rem"}} "Product Manager"]]]]]])
                  (code-block "<ty-dropdown value=\"clojure\">
  <ty-option value=\"clojure\">
    <div class=\"flex items-center gap-3\">
      <div class=\"lang-badge\">λ</div>
      <div>
        <div>Clojure</div>
        <div class=\"ty-text--\">Functional Lisp for the JVM</div>
      </div>
    </div>
  </ty-option>
</ty-dropdown>")]

      ;; External Search
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "External Search")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Set " [:code "external-search"] " to own the filtering. The dropdown fires " [:code "search"] " events instead of filtering internally. Use " [:code "debounce"] " to throttle API calls."]
                  (code-block "<ty-dropdown id=\"dd\" external-search debounce=\"300\" placeholder=\"Search...\">
  <!-- your code updates children based on the search event -->
</ty-dropdown>

<script>
document.getElementById('dd').addEventListener('search', async (e) => {
  const results = await fetch(`/api/search?q=${e.detail.query}`).then(r => r.json());
  updateDropdownOptions(results);
});
</script>" "javascript")]

      ;; Loading State
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Loading State")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Add the " [:code "loading"] " attribute while you're fetching results — the popup replaces its options list with a centered spinner. The search input stays usable, so the user can keep refining the query. Pair with " [:code "external-search"] " for the typical remote-search flow."]

                  [:div.space-y-5

        ;; Static demo
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem" :font-weight "500"}} "Static (loading attribute set, click to open)"]
                    (demo-area
                     [:ty-dropdown {:label "Search users" :placeholder "Type to search…" :external-search "" :loading ""
                                    :style {:max-width "320px"}}])
                    (code-block "<ty-dropdown label=\"Search users\" external-search loading
             placeholder=\"Type to search…\">
</ty-dropdown>")]

        ;; Interactive demo
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem" :font-weight "500"}} "Interactive — type to simulate a debounced fetch"]
                    (demo-area
                     [:ty-dropdown {:label "Pick a fruit"
                                    :placeholder "Type to search…"
                                    :external-search ""
                                    :debounce 300
                                    :style {:max-width "320px"}
                                    :on {:search (fn [^js e]
                                                   (when-let [dd (.closest (.-target e) "ty-dropdown")]
                                                     (let [q (.. e -detail -query)
                                                           current (.-value dd)
                                                           fruits ["Apple" "Banana" "Cherry" "Mango" "Orange" "Pear" "Pineapple" "Strawberry"]
                                                           matches (filter (fn [n] (.includes (.toLowerCase n) (.toLowerCase q))) fruits)
                                                           ;; Always keep the currently-selected option in the rendered list,
                                                           ;; otherwise the stub display falls back to placeholder.
                                                           to-render (distinct
                                                                       (concat
                                                                         (when (and current (not= current ""))
                                                                           (filter (fn [n] (= (.toLowerCase n) current)) fruits))
                                                                         matches))
                                                           render! (fn []
                                                                     (set! (.-innerHTML dd)
                                                                           (->> to-render
                                                                                (map (fn [n] (str "<ty-option value=\"" (.toLowerCase n) "\">" n "</ty-option>")))
                                                                                (apply str))))]
                                                       (if (= q "")
                                                         ;; Empty query (popup just opened, or search cleared) — instant reset
                                                         (render!)
                                                         ;; Real search — show loading while we fake a fetch
                                                         (do (set! (.-loading dd) true)
                                                             (js/setTimeout
                                                              #(do (render!) (set! (.-loading dd) false))
                                                              600))))))}}
                      [:ty-option {:value "apple"} "Apple"]
                      [:ty-option {:value "banana"} "Banana"]
                      [:ty-option {:value "cherry"} "Cherry"]])
                    (code-block "// Short-circuit the empty-query case — popup-open auto-fires search with q=''.
// IMPORTANT: always include the currently-selected option in your rendered list,
// otherwise the stub display falls back to the placeholder (the option element
// holds the rich display content — Tyrell tracks value, not display text).
const dd = document.querySelector('ty-dropdown');

dd.addEventListener('search', async (e) => {
  const q = e.detail.query;
  const current = dd.value;

  if (q === '') {
    // Popup just opened or search cleared — load default list, no spinner
    dd.innerHTML = renderOptions(preserveSelected(await fetchDefaultList(), current));
    return;
  }

  dd.loading = true;
  const results = await fetch(`/api/search?q=${q}`).then(r => r.json());
  dd.innerHTML = renderOptions(preserveSelected(results, current));
  dd.loading = false;
});" "javascript")]

        ;; Custom loading content (slot)
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem" :font-weight "500"}} "Custom loading content — slot=\"loading\""]
                    [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                     "Override the built-in spinner + “Searching…” by passing your own content into the "
                     [:code "loading"] " slot. Useful for translations, custom icons, or full design-system integration. The default is shown when no slot content is provided."]
                    (demo-area
                     [:div.flex.flex-col.gap-4 {:style {:max-width "320px"}}
                      [:ty-dropdown {:label "Croatian"
                                     :placeholder "Klikni za otvaranje…"
                                     :external-search ""
                                     :loading ""}
                       [:span {:slot "loading" :style {:color "var(--ty-color-primary)"}} "Pretražujem…"]]
                      [:ty-dropdown {:label "Custom icon + text"
                                     :placeholder "Click to open…"
                                     :external-search ""
                                     :loading ""}
                       [:div {:slot "loading"
                              :style {:display "flex" :align-items "center" :gap "0.5rem"}}
                        [:ty-icon {:name "refresh-cw" :size "sm" :spin "" :class "ty-text-success"}]
                        [:span.ty-text-success+ {:style {:font-weight "500"}} "Fetching latest…"]]]])
                    (code-block "<!-- Just translate the text -->
<ty-dropdown loading external-search>
  <span slot=\"loading\">Pretražujem…</span>
</ty-dropdown>

<!-- Custom icon + styling -->
<ty-dropdown loading external-search>
  <div slot=\"loading\" style=\"display:flex;gap:0.5rem;align-items:center;\">
    <ty-icon name=\"refresh-cw\" size=\"sm\" spin></ty-icon>
    <span>Fetching latest…</span>
  </div>
</ty-dropdown>")]

        ;; Notes
                   [:div.ty-elevated.rounded.p-3 {:style {:font-size "0.8125rem"}}
                    [:p.ty-text+.mb-1 {:style {:font-weight "600"}} "Notes"]
                    [:ul.list-disc.list-inside.ty-text-.space-y-1
                     [:li [:strong "Always preserve the currently-selected option in your rendered list."] " The "
                      [:code "ty-option"] " element carries the rich display content — Tyrell tracks "
                      [:code "value"] " as the source of truth, but the visible text/HTML for the stub comes from the matching option. If you remove the selected option, the stub falls back to the placeholder."]
                     [:li "Each popup-open automatically fires a " [:code "search"] " event with empty query (when "
                      [:code "external-search"] " is set), so consumers have a clean hook to refresh the list. Listen for "
                      [:code "open"] " / " [:code "close"] " events for full lifecycle control."]
                     [:li "Search input stays editable while loading — users can keep typing."]
                     [:li "The spinner overlay sits inside the popup; the dropdown stub itself is unaffected."]
                     [:li "Same global registry as " [:code "ty-button"] " — set the spinner SVG once with " [:code "setLoaderSvg(...)"] " or " [:code "window.tyLoader.set(...)"] " to theme every loader in the app."]
                     [:li "For full control over the loading UI per instance, use the " [:code "loading"] " slot — your slotted content replaces the built-in spinner + text. Wrapper still provides background/border so the popup stays opaque."]]]]]])

   ;; Form Integration
   (doc-section "Form Integration"
                [:div.space-y-5

                 [:div.ty-content.rounded-lg.p-5
                  (section-label "With HTML Form")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Fully form-associated — the selected value appears in FormData under the " [:code "name"] " attribute."]
                  (demo-area
                   [:form.space-y-4
                    {:on {:submit (fn [e]
                                    (.preventDefault e)
                                    (let [data (js/Object.fromEntries (js/FormData. (.-target e)))]
                                      (js/alert (str "Submitted:\n" (js/JSON.stringify data nil 2)))))}}
                    [:ty-dropdown {:name "priority" :label "Priority" :required "" :placeholder "Select priority"}
                     [:ty-option {:value "low"} "Low"]
                     [:ty-option {:value "medium"} "Medium"]
                     [:ty-option {:value "high"} "High"]]
                    [:ty-dropdown {:name "category" :label "Category" :placeholder "Select category"}
                     [:ty-option {:value "bug"} "Bug"]
                     [:ty-option {:value "feature"} "Feature"]
                     [:ty-option {:value "docs"} "Documentation"]]
                    [:button.ty-bg-primary.ty-text++.rounded
                     {:type "submit" :style {:padding "0.375rem 1rem"}} "Submit"]])
                  (code-block "<form>
  <ty-dropdown name=\"priority\" label=\"Priority\" required>
    <ty-option value=\"low\">Low</ty-option>
    <ty-option value=\"medium\">Medium</ty-option>
    <ty-option value=\"high\">High</ty-option>
  </ty-dropdown>
  <ty-dropdown name=\"category\" label=\"Category\">
    <ty-option value=\"bug\">Bug</ty-option>
    <ty-option value=\"feature\">Feature</ty-option>
  </ty-dropdown>
  <button type=\"submit\">Submit</button>
</form>")]

                 [:div.ty-content.rounded-lg.p-5
                  (section-label "JavaScript API")
                  (code-block "const dropdown = document.querySelector('ty-dropdown');

// Read / set value
console.log(dropdown.value);
dropdown.value = 'high';

// Listen for changes
dropdown.addEventListener('change', (e) => {
  console.log(e.detail.value);   // selected value string
  console.log(e.detail.text);    // option text content
  console.log(e.detail.option);  // the ty-option element
});

// External search (requires external-search attribute)
dropdown.addEventListener('search', (e) => {
  fetchOptions(e.detail.query).then(updateOptions);
});" "javascript")]])

   ;; Best Practices
   (doc-section "Best Practices"
                [:div.ty-elevated.rounded-lg.p-5
                 [:div.grid.gap-6
                  {:style {:grid-template-columns "repeat(auto-fill, minmax(260px, 1fr))"}}

                  [:div
                   [:div.flex.items-center.gap-2.mb-3
                    [:ty-icon.ty-text-success {:name "check-circle" :size "16"}]
                    [:span.ty-text-success+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Do"]]
                   [:div.space-y-2
                    (for [text ["Use ty-option children — they support rich HTML unlike native <option>"
                                "Always set a label — placeholder alone is not accessible enough"
                                "Use not-clearable only when the value truly must not be reset"
                                "Set debounce=\"300\" with external-search to throttle API calls"
                                "Use flavor to signal context — danger for destructive, success for confirmed"]]
                      [:div.flex.items-start.gap-2
                       [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
                       [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

                  [:div
                   [:div.flex.items-center.gap-2.mb-3
                    [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
                    [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
                   [:div.space-y-2
                    (for [text ["Use clearable=\"false\" — use not-clearable attribute instead"
                                "Skip the name attribute when you need FormData submission"
                                "Disable search for long lists — built-in search scales well"
                                "Use for multi-value selection — ty-multiselect handles that"
                                "Use placeholder as a substitute for the label"]]
                      [:div.flex.items-start.gap-2
                       [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
                       [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
