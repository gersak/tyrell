(ns tyrell.site.docs.multiselect
  "Documentation for ty-multiselect component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-multiselect"
                     "Multi-value select using ty-tag children as both options and selected chips. Tags become dismissible when selected. Search filters by default; set external-search for API-driven filtering.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "ty-multiselect Attributes")
     (attribute-table
      [{:name "value"
        :type "string"
        :default "-"
        :description "Comma-separated selected values (e.g. \"red,blue\")"}
       {:name "placeholder"
        :type "string"
        :default "-"
        :description "Placeholder text when nothing is selected"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Label displayed above the component"}
       {:name "name"
        :type "string"
        :default "-"
        :description "Form field name — creates multiple FormData entries with this name"}
       {:name "external-search"
        :type "boolean"
        :default "false"
        :description "Delegate filtering to the parent. Each keystroke fires a search event instead of filtering internally"}
       {:name "clearable"
        :type "boolean"
        :default "false"
        :description "Show a clear-all button when any items are selected"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disable the component entirely"}
       {:name "loading"
        :type "boolean"
        :default "false"
        :description "Replace the available-options area with a centered spinner. Search input stays usable. Pair with external-search while fetching results — see Loading State below. Customize the spinner globally via setLoaderSvg() / window.tyLoader.set()."}
       {:name "readonly"
        :type "boolean"
        :default "false"
        :description "Show selections but prevent changes"}
       {:name "required"
        :type "boolean"
        :default "false"
        :description "Mark field as required — participates in form validation"}
       {:name "debounce"
        :type "number"
        :default "0"
        :description "Milliseconds to debounce search events — only meaningful with external-search"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Size variant: sm, md, lg"}
       {:name "flavor"
        :type "string"
        :default "\"neutral\""
        :description "Semantic color applied to the trigger and selected chips: primary, secondary, success, danger, warning, neutral"}])]

    [:div.mb-6
     (section-label "ty-tag Attributes (as children)")
     (attribute-table
      [{:name "value"
        :type "string"
        :required true
        :default "-"
        :description "Identifies this option — required, used as the comma-separated value in the parent"}
       {:name "pill"
        :type "boolean"
        :default "false"
        :description "Rounded pill shape — recommended for multiselect chips"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Tag size: xs, sm, md, lg, xl. Use sm for multiselect chips"}
       {:name "flavor"
        :type "string"
        :default "\"neutral\""
        :description "Semantic color of this tag — match the multiselect flavor for consistency"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "change"
        :payload "{values: string[], action: 'add'|'remove'|'clear'|'set', item: string|null}"
        :when-fired "Fires when the selection changes"}
       {:name "search"
        :payload "{query: string, element}"
        :when-fired "Fires on each keystroke in external-search mode. Also fires automatically with query=\"\" when the popup opens or closes (clean reset hook for the consumer)."}
       {:name "open"
        :payload "{mode: 'desktop' | 'mobile', element}"
        :when-fired "Fires when the popup opens. With external-search, a search event with empty query follows immediately."}
       {:name "close"
        :payload "{mode: 'desktop' | 'mobile', element}"
        :when-fired "Fires when the popup closes (selection, outside click, Escape, etc.)"}
       {:name "focus"
        :payload "FocusEvent"
        :when-fired "Fires when the component gains focus"}
       {:name "blur"
        :payload "FocusEvent"
        :when-fired "Fires when the component loses focus"}])]]

   ;; Examples
   (doc-section "Examples"
                [:div.space-y-6

      ;; Basic
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Basic")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Place " [:code "ty-tag"] " children with " [:code "value"] " attributes. Use " [:code "pill"] " and " [:code "size=\"sm\""] " for compact chips. Tags become dismissible automatically when selected."]
                  (demo-area
                   [:ty-multiselect {:label "Programming Languages" :value "clojure,typescript"
                                     :placeholder "Select languages..."}
                    [:ty-tag {:value "javascript" :pill "" :size "sm"} "JavaScript"]
                    [:ty-tag {:value "typescript" :pill "" :size "sm"} "TypeScript"]
                    [:ty-tag {:value "clojure" :pill "" :size "sm"} "Clojure"]
                    [:ty-tag {:value "python" :pill "" :size "sm"} "Python"]
                    [:ty-tag {:value "rust" :pill "" :size "sm"} "Rust"]
                    [:ty-tag {:value "go" :pill "" :size "sm"} "Go"]])
                  (code-block "<ty-multiselect label=\"Programming Languages\" value=\"clojure,typescript\">
  <ty-tag value=\"javascript\" pill size=\"sm\">JavaScript</ty-tag>
  <ty-tag value=\"typescript\" pill size=\"sm\">TypeScript</ty-tag>
  <ty-tag value=\"clojure\" pill size=\"sm\">Clojure</ty-tag>
  <ty-tag value=\"python\" pill size=\"sm\">Python</ty-tag>
</ty-multiselect>")]

      ;; Semantic Flavors
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Semantic Flavors")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Flavor applies to both the trigger border and selected chips. Match the " [:code "ty-tag"] " flavor to the multiselect for visual consistency."]
                  (demo-area
                   [:div.grid.gap-4
                    {:style {:grid-template-columns "repeat(auto-fill, minmax(280px, 1fr))"}}
                    [:ty-multiselect {:flavor "success" :value "approved,verified"
                                      :placeholder "Select approved items..."}
                     [:ty-tag {:value "approved" :pill "" :size "sm" :flavor "success"} "Approved"]
                     [:ty-tag {:value "verified" :pill "" :size "sm" :flavor "success"} "Verified"]
                     [:ty-tag {:value "confirmed" :pill "" :size "sm" :flavor "success"} "Confirmed"]]
                    [:ty-multiselect {:flavor "danger" :value "error,timeout"
                                      :placeholder "Select issues..."}
                     [:ty-tag {:value "error" :pill "" :size "sm" :flavor "danger"} "Critical Error"]
                     [:ty-tag {:value "timeout" :pill "" :size "sm" :flavor "danger"} "Timeout"]
                     [:ty-tag {:value "failed" :pill "" :size "sm" :flavor "danger"} "Failed"]]])
                  (code-block "<ty-multiselect flavor=\"success\" value=\"approved,verified\">
  <ty-tag value=\"approved\" pill size=\"sm\" flavor=\"success\">Approved</ty-tag>
  <ty-tag value=\"verified\" pill size=\"sm\" flavor=\"success\">Verified</ty-tag>
</ty-multiselect>

<ty-multiselect flavor=\"danger\" value=\"error,timeout\">
  <ty-tag value=\"error\" pill size=\"sm\" flavor=\"danger\">Critical Error</ty-tag>
  <ty-tag value=\"timeout\" pill size=\"sm\" flavor=\"danger\">Timeout</ty-tag>
</ty-multiselect>")]

      ;; States
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "States")
                  (demo-area
                   [:div.grid.gap-4
                    {:style {:grid-template-columns "repeat(auto-fill, minmax(260px, 1fr))"}}
                    [:ty-multiselect {:label "Required" :required "" :placeholder "Select at least one..."}
                     [:ty-tag {:value "a" :pill "" :size "sm"} "Option A"]
                     [:ty-tag {:value "b" :pill "" :size "sm"} "Option B"]
                     [:ty-tag {:value "c" :pill "" :size "sm"} "Option C"]]
                    [:ty-multiselect {:label "Disabled" :disabled "" :value "option1,option2"}
                     [:ty-tag {:value "option1" :pill "" :size "sm"} "Option 1"]
                     [:ty-tag {:value "option2" :pill "" :size "sm"} "Option 2"]
                     [:ty-tag {:value "option3" :pill "" :size "sm"} "Option 3"]]
                    [:ty-multiselect {:label "With clear-all" :clearable "" :value "x,y,z"
                                      :placeholder "Select options..."}
                     [:ty-tag {:value "x" :pill "" :size "sm"} "Item X"]
                     [:ty-tag {:value "y" :pill "" :size "sm"} "Item Y"]
                     [:ty-tag {:value "z" :pill "" :size "sm"} "Item Z"]]])
                  (code-block "<ty-multiselect label=\"Required\" required>...</ty-multiselect>
<ty-multiselect label=\"Disabled\" disabled value=\"option1,option2\">...</ty-multiselect>
<ty-multiselect label=\"With clear-all\" clearable value=\"x,y,z\">...</ty-multiselect>")]

      ;; Rich tag content
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Rich Tag Content")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   [:code "ty-tag"] " children accept arbitrary HTML — icons, emoji, badges. The full content renders both in the dropdown and in selected chips."]
                  (demo-area
                   [:ty-multiselect {:value "javascript,clojure" :placeholder "Choose languages..."}
                    [:ty-tag {:value "javascript" :pill "" :size "sm" :flavor "warning"}
                     [:ty-icon.mr-1 {:slot "start" :name "code" :size "12"}] "JavaScript"]
                    [:ty-tag {:value "typescript" :pill "" :size "sm" :flavor "primary"}
                     [:ty-icon.mr-1 {:slot "start" :name "code" :size "12"}] "TypeScript"]
                    [:ty-tag {:value "clojure" :pill "" :size "sm" :flavor "success"}
                     [:ty-icon.mr-1 {:slot "start" :name "code" :size "12"}] "Clojure"]
                    [:ty-tag {:value "rust" :pill "" :size "sm" :flavor "danger"}
                     [:ty-icon.mr-1 {:slot "start" :name "code" :size "12"}] "Rust"]])
                  (code-block "<ty-multiselect value=\"javascript,clojure\">
  <ty-tag value=\"javascript\" pill size=\"sm\" flavor=\"warning\">
    <ty-icon slot=\"start\" name=\"code\" size=\"12\"></ty-icon>
    JavaScript
  </ty-tag>
  <ty-tag value=\"clojure\" pill size=\"sm\" flavor=\"success\">
    <ty-icon slot=\"start\" name=\"code\" size=\"12\"></ty-icon>
    Clojure
  </ty-tag>
</ty-multiselect>")]])

   ;; Advanced Examples
   (doc-section "Advanced Examples"
                [:div.space-y-6

      ;; External search
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "External Search")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Set " [:code "external-search"] " to own the filtering. The component fires " [:code "search"] " events instead of filtering internally. Use " [:code "debounce"] " to throttle API calls."]
                  (code-block "<ty-multiselect id=\"ms\" external-search debounce=\"300\" placeholder=\"Search...\">
  <!-- your code updates children based on the search event -->
</ty-multiselect>

<script>
document.getElementById('ms').addEventListener('search', async (e) => {
  const results = await fetch(`/api/tags?q=${e.detail.query}`).then(r => r.json());
  updateTagChildren(results);
});

document.getElementById('ms').addEventListener('change', (e) => {
  console.log(e.detail.values);  // current selected values array
  console.log(e.detail.action);  // 'add' | 'remove' | 'clear' | 'set'
  console.log(e.detail.item);    // the specific item that changed
});
</script>" "javascript")]

      ;; Loading State
                 [:div.ty-content.rounded-lg.p-5
                  (section-label "Loading State")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Add the " [:code "loading"] " attribute while you're fetching tags from the server — the available-options area is replaced with a centered spinner. Search input stays usable. Selected chips remain visible. Pair with " [:code "external-search"] " for the typical remote-search flow."]

                  [:div.space-y-5

        ;; Static demo
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem" :font-weight "500"}} "Static (loading attribute set, click to open)"]
                    (demo-area
                     [:ty-multiselect {:label "Search tags" :placeholder "Type to search…" :external-search "" :loading ""
                                       :style {:max-width "320px"}}])
                    (code-block "<ty-multiselect label=\"Search tags\" external-search loading
                placeholder=\"Type to search…\">
</ty-multiselect>")]

        ;; Interactive demo
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem" :font-weight "500"}} "Interactive — type to simulate a debounced fetch"]
                    (demo-area
                     [:ty-multiselect {:label "Pick fruits" :placeholder "Type to search…"
                                       :external-search "" :debounce 300
                                       :style {:max-width "320px"}
                                       :on {:search (fn [^js e]
                                                      (when-let [ms (.closest (.-target e) "ty-multiselect")]
                                                        (let [q (.. e -detail -query)
                                                              fruits ["Apple" "Banana" "Cherry" "Mango" "Orange" "Pear" "Pineapple" "Strawberry"]
                                                              render! (fn []
                                                                        (set! (.-innerHTML ms)
                                                                              (->> fruits
                                                                                   (filter (fn [n] (.includes (.toLowerCase n) (.toLowerCase q))))
                                                                                   (map (fn [n] (str "<ty-tag value=\"" n "\">" n "</ty-tag>")))
                                                                                   (apply str))))]
                                                          (if (= q "")
                                                            ;; Empty query — popup opened or search cleared. Instant reset.
                                                            (render!)
                                                            ;; Real search — show loading
                                                            (do (set! (.-loading ms) true)
                                                                (js/setTimeout
                                                                 #(do (render!) (set! (.-loading ms) false))
                                                                 600))))))}}
                      [:ty-tag {:value "apple"} "Apple"]
                      [:ty-tag {:value "banana"} "Banana"]
                      [:ty-tag {:value "cherry"} "Cherry"]])
                    (code-block "// Short-circuit the empty-query case — popup-open auto-fires search with q=''
const ms = document.querySelector('ty-multiselect');
ms.addEventListener('search', async (e) => {
  const q = e.detail.query;

  if (q === '') {
    // Popup just opened or search cleared — load default list, no spinner
    ms.innerHTML = renderTags(await fetchDefaultList());
    return;
  }

  ms.loading = true;
  const results = await fetch(`/api/tags?q=${q}`).then(r => r.json());
  ms.innerHTML = results.map(r =>
    `<ty-tag value=\"${r.id}\">${r.name}</ty-tag>`
  ).join('');
  ms.loading = false;
});" "javascript")]

        ;; Custom loading content (slot)
                   [:div
                    [:p.ty-text--.mb-2 {:style {:font-size "0.6875rem" :font-weight "500"}} "Custom loading content — slot=\"loading\""]
                    [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                     "Override the built-in spinner + “Searching…” by passing your own content into the "
                     [:code "loading"] " slot. Useful for translations, custom icons, or full design-system integration. The default is shown when no slot content is provided."]
                    (demo-area
                     [:div.flex.flex-col.gap-4 {:style {:max-width "320px"}}
                      [:ty-multiselect {:label "Croatian"
                                        :placeholder "Klikni za otvaranje…"
                                        :external-search ""
                                        :loading ""}
                       [:span {:slot "loading" :style {:color "var(--ty-color-primary)"}} "Pretražujem oznake…"]]
                      [:ty-multiselect {:label "Custom icon + text"
                                        :placeholder "Click to open…"
                                        :external-search ""
                                        :loading ""}
                       [:div {:slot "loading"
                              :style {:display "flex" :align-items "center" :gap "0.5rem"}}
                        [:ty-icon {:name "refresh-cw" :size "sm" :spin "" :class "ty-text-success"}]
                        [:span.ty-text-success+ {:style {:font-weight "500"}} "Fetching tags…"]]]])
                    (code-block "<!-- Just translate the text -->
<ty-multiselect loading external-search>
  <span slot=\"loading\">Pretražujem oznake…</span>
</ty-multiselect>

<!-- Custom icon + styling -->
<ty-multiselect loading external-search>
  <div slot=\"loading\" style=\"display:flex;gap:0.5rem;align-items:center;\">
    <ty-icon name=\"refresh-cw\" size=\"sm\" spin></ty-icon>
    <span>Fetching tags…</span>
  </div>
</ty-multiselect>")]

        ;; Notes
                   [:div.ty-elevated.rounded.p-3 {:style {:font-size "0.8125rem"}}
                    [:p.ty-text+.mb-1 {:style {:font-weight "600"}} "Notes"]
                    [:ul.list-disc.list-inside.ty-text-.space-y-1
                     [:li "On mobile the spinner appears inside the available-options section of the bottom sheet — selected chips above stay visible."]
                     [:li "Search input stays editable so users can keep refining the query."]
                     [:li "Same global registry as " [:code "ty-button"] " — set the spinner SVG once with " [:code "setLoaderSvg(...)"] " or " [:code "window.tyLoader.set(...)"] " to theme every loader in the app."]
                     [:li "For full control over the loading UI per instance, use the " [:code "loading"] " slot — your slotted content replaces the built-in spinner + text. Wrapper still provides background/border so the popup stays opaque."]]]]]])

   ;; Form Integration
   (doc-section "Form Integration"
                [:div.space-y-5

                 [:div.ty-content.rounded-lg.p-5
                  (section-label "With HTML Form")
                  [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
                   "Fully form-associated — selected values appear in FormData as multiple entries under the " [:code "name"] " attribute (standard multi-value pattern)."]
                  (demo-area
                   [:form.space-y-4
                    {:on {:submit (fn [e]
                                    (.preventDefault e)
                                    (let [data (js/Array.from (.entries (js/FormData. (.-target e))))
                                          grouped (reduce (fn [acc [k v]]
                                                            (update acc k (fnil conj []) v))
                                                          {} data)]
                                      (js/alert (str "Submitted:\n" (js/JSON.stringify (clj->js grouped) nil 2)))))}}
                    [:ty-multiselect {:name "categories" :label "Categories"
                                      :value "tech,design" :placeholder "Select categories..."}
                     [:ty-tag {:value "tech" :pill "" :size "sm"} "Technology"]
                     [:ty-tag {:value "design" :pill "" :size "sm"} "Design"]
                     [:ty-tag {:value "business" :pill "" :size "sm"} "Business"]
                     [:ty-tag {:value "marketing" :pill "" :size "sm"} "Marketing"]]
                    [:button.ty-bg-primary.ty-text++.rounded
                     {:type "submit" :style {:padding "0.375rem 1rem"}} "Submit"]])
                  (code-block "<form>
  <ty-multiselect name=\"categories\" label=\"Categories\">
    <ty-tag value=\"tech\" pill size=\"sm\">Technology</ty-tag>
    <ty-tag value=\"design\" pill size=\"sm\">Design</ty-tag>
  </ty-multiselect>
  <button type=\"submit\">Submit</button>
</form>
<!-- FormData: categories=tech, categories=design (multiple entries) -->")]

                 [:div.ty-content.rounded-lg.p-5
                  (section-label "JavaScript API")
                  (code-block "const ms = document.querySelector('ty-multiselect');

// Read current selections
console.log(ms.value);  // 'tech,design' (comma-separated string)

// Listen for changes
ms.addEventListener('change', (e) => {
  const { values, action, item } = e.detail;
  console.log(values);   // ['tech', 'design'] (array)
  console.log(action);   // 'add' | 'remove' | 'clear' | 'set'
  console.log(item);     // 'design' (what specifically changed)
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
                    (for [text ["Use pill + size=\"sm\" tags — they fit more chips in the trigger area"
                                "Match ty-tag flavor to the multiselect flavor for visual consistency"
                                "Use external-search + debounce for large datasets (API-driven)"
                                "Set the name attribute when you need FormData submission"
                                "Use clearable when users may want to reset all selections at once"]]
                      [:div.flex.items-start.gap-2
                       [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
                       [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

                  [:div
                   [:div.flex.items-center.gap-2.mb-3
                    [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
                    [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
                   [:div.space-y-2
                    (for [text ["Mix tag sizes within the same multiselect — pick one size"
                                "Forget the value attribute on ty-tag children — nothing will select"
                                "Use conflicting tag and multiselect flavors — it looks broken"
                                "Use for single selection — ty-dropdown is cleaner for that"
                                "Manually toggle tag selected state — the component manages that"]]
                      [:div.flex.items-start.gap-2
                       [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
                       [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))

