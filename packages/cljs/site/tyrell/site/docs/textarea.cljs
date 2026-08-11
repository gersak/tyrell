(ns tyrell.site.docs.textarea
  "Documentation for ty-textarea component"
  (:require
   [tyrell.site.docs.common
    :refer [code-block attribute-table event-table
            doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-textarea"
                     "Auto-resizing textarea that grows with content. No scrollbars, no manual resizing — just a clean, form-associated input that fits your text.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "name"
        :type "string"
        :default "-"
        :description "Form field name for submission"}
       {:name "value"
        :type "string"
        :default "\"\""
        :description "Current textarea value"}
       {:name "placeholder"
        :type "string"
        :default "-"
        :description "Placeholder text when empty"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Label displayed above the textarea"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disables the textarea"}
       {:name "required"
        :type "boolean"
        :default "false"
        :description "Marks field as required — shows asterisk on label"}
       {:name "error"
        :type "string"
        :default "-"
        :description "Error message displayed below; applies danger styling"}
       {:name "size"
        :type "string"
        :default "\"md\""
        :description "Size variant: xs, sm, md, lg, xl"}
       {:name "rows"
        :type "string"
        :default "\"3\""
        :description "Initial visible row count"}
       {:name "min-height"
        :type "string"
        :default "-"
        :description "Minimum height constraint (e.g. \"100px\")"}
       {:name "max-height"
        :type "string"
        :default "-"
        :description "Maximum height before scrolling kicks in (e.g. \"300px\")"}
       {:name "resize"
        :type "string"
        :default "\"none\""
        :description "Manual resize handle: none, both, vertical, horizontal"}])]

    [:div.mb-6
     (section-label "Events")
     (event-table
      [{:name "input"
        :payload "{value: string, originalEvent: Event}"
        :when-fired "Fires on every keystroke"}
       {:name "change"
        :payload "{value: string, originalEvent: Event}"
        :when-fired "Fires when focus leaves after value changed"}])]

    [:div
     (section-label "Properties")
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.625rem 0"}}
      [:div.flex.flex-wrap.items-center.gap-2 {:style {:margin-bottom "0.25rem"}}
       [:code.font-mono.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "value"]
       [:span.text-xs.font-mono.ty-text-- "string"]]
      [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}} "Get/set the current value programmatically"]]]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Auto Resize")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The textarea expands as you type — no scrollbars, no manual resize needed."]
       (demo-area
        [:ty-textarea
         {:placeholder "Start typing and watch me grow...\n\nAdd new lines...\n\nI expand automatically!"
          :label "Auto-resizing textarea"}])
       (code-block "<ty-textarea
  label=\"Auto-resizing textarea\"
  placeholder=\"Start typing and watch me grow...\">
</ty-textarea>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Height Constraints")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Combine auto-resize with min/max height for predictable layouts."]
       (demo-area
        [:div.grid.gap-4
         {:style {:grid-template-columns "repeat(auto-fill, minmax(200px, 1fr))"}}
         [:div
          [:p.ty-text-- {:style {:font-size "0.75rem" :margin-bottom "0.375rem"}} "min-height: 100px"]
          [:ty-textarea {:placeholder "Starts tall..." :min-height "100px"}]]
         [:div
          [:p.ty-text-- {:style {:font-size "0.75rem" :margin-bottom "0.375rem"}} "max-height: 120px"]
          [:ty-textarea {:placeholder "Stops growing..."
                         :max-height "120px"
                         :value "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nScroll appears here"}]]
         [:div
          [:p.ty-text-- {:style {:font-size "0.75rem" :margin-bottom "0.375rem"}} "Both constraints"]
          [:ty-textarea {:placeholder "100px → 200px range"
                         :min-height "100px"
                         :max-height "200px"}]]])
       (code-block "<ty-textarea min-height=\"100px\"></ty-textarea>
<ty-textarea max-height=\"120px\"></ty-textarea>
<ty-textarea min-height=\"100px\" max-height=\"200px\"></ty-textarea>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Sizes")
       (demo-area
        [:div.space-y-3
         (for [size ["xs" "sm" "md" "lg" "xl"]]
           [:ty-textarea {:placeholder (str "Size: " size) :size size}])])
       (code-block "<ty-textarea size=\"xs\"></ty-textarea>
<ty-textarea size=\"sm\"></ty-textarea>
<ty-textarea size=\"md\"></ty-textarea>
<ty-textarea size=\"lg\"></ty-textarea>
<ty-textarea size=\"xl\"></ty-textarea>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "States")
       (demo-area
        [:div.grid.gap-4
         {:style {:grid-template-columns "repeat(auto-fill, minmax(220px, 1fr))"}}
         [:ty-textarea {:label "Required" :placeholder "This field is required" :required true}]
         [:ty-textarea {:label "With Error"
                        :placeholder "Something went wrong..."
                        :error "Please enter at least 10 characters"
                        :value "Too short"}]
         [:ty-textarea {:label "Disabled" :disabled true :value "This field is disabled"}]])
       (code-block "<ty-textarea label=\"Required\" required></ty-textarea>
<ty-textarea label=\"With Error\" error=\"Please enter at least 10 characters\"></ty-textarea>
<ty-textarea label=\"Disabled\" disabled></ty-textarea>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Custom Scrollbar")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "When content exceeds max-height a styled scrollbar appears — fades in, supports drag, disappears when idle."]
       (demo-area
        [:ty-textarea
         {:max-height "150px"
          :label "Custom scrollbar"
          :value "Line 1: The custom scrollbar appears when content overflows.\nLine 2: It auto-hides after you stop scrolling.\nLine 3: Drag the thumb to scroll.\nLine 4: Click the track to jump.\nLine 5: Works on all browsers consistently.\nLine 6: Hidden on touch devices — native scroll is better there.\nLine 7: Respects prefers-reduced-motion.\nLine 8: Try it by resizing this window."}])
       (code-block "<ty-textarea max-height=\"150px\" label=\"Scrollable\"></ty-textarea>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Header / Footer slots")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Put actions in the "
        [:code "header"] " / " [:code "footer"]
        " slots — both sit INSIDE the field border (composer layout). The focus "
        "ring shows only while the textarea itself is focused, not when you tab to "
        "a footer button. The footer is space-between (tools left, submit right); a "
        [:code "wide"] " button becomes a full-width bottom submit."]
       (demo-area
        [:div.grid.gap-4
         [:ty-textarea {:label "Comment" :placeholder "Write a comment…" :min-height "90px"}
          [:span.ty-text- {:slot "footer" :style {:font-size "0.75rem"}} "Markdown supported"]
          [:ty-button {:slot "footer" :flavor "primary" :size "sm"}
           [:ty-icon {:name "send" :size "sm"}] "Comment"]]
         [:ty-textarea {:label "Feedback" :placeholder "Tell us what you think…" :min-height "80px"}
          [:ty-button {:slot "footer" :flavor "success" :wide "true"}
           [:ty-icon {:name "check" :size "sm"}] "Submit feedback"]]])
       (code-block "<ty-textarea label=\"Comment\" placeholder=\"Write a comment…\">
  <span slot=\"footer\">Markdown supported</span>
  <ty-button slot=\"footer\" flavor=\"primary\" size=\"sm\">
    <ty-icon name=\"send\" size=\"sm\"></ty-icon> Comment
  </ty-button>
</ty-textarea>

<ty-textarea label=\"Feedback\">
  <ty-button slot=\"footer\" flavor=\"success\" wide=\"true\">Submit feedback</ty-button>
</ty-textarea>")]])

   (doc-section "Advanced Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Character Counter")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Pair with a counter element — use the change event to update it live."]
       (demo-area
        [:div
         [:ty-textarea
          {:id "tweet-textarea"
           :label "Compose"
           :placeholder "What's happening?"
           :max-height "150px"}]
         [:div.flex.justify-between.items-center {:style {:margin-top "0.5rem"}}
          [:span.ty-text-- {:id "tweet-count" :style {:font-size "0.75rem"}} "0 / 280"]
          [:ty-button {:id "tweet-btn" :flavor "primary" :size "sm" :disabled true} "Post"]]
         [:script
          "(function() {
  const ta = document.getElementById('tweet-textarea');
  const counter = document.getElementById('tweet-count');
  const btn = document.getElementById('tweet-btn');
  if (!ta) return;
  ta.addEventListener('change', (e) => {
    const n = e.detail.value.length;
    counter.textContent = n + ' / 280';
    counter.className = n > 280 ? 'ty-text-danger' : 'ty-text--';
    btn.disabled = n === 0 || n > 280;
  });
})();"]])
       (code-block "textarea.addEventListener('change', (e) => {
  const n = e.detail.value.length;
  counter.textContent = `${n} / 280`;
  btn.disabled = n === 0 || n > 280;
});" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Auto-save Draft")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Debounce the input event to save to localStorage with visual feedback."]
       (demo-area
        [:div
         [:ty-textarea
          {:id "draft-textarea"
           :label "Article Draft"
           :placeholder "Start writing your article..."
           :min-height "120px"}]
         [:div.flex.items-center.gap-2 {:style {:margin-top "0.5rem"}}
          [:span.ty-text-- {:id "save-status" :style {:font-size "0.75rem"}} "Ready"]]
         [:script
          "(function() {
  const ta = document.getElementById('draft-textarea');
  const status = document.getElementById('save-status');
  if (!ta) return;
  const saved = localStorage.getItem('ty-docs-draft');
  if (saved) { ta.value = saved; status.textContent = 'Draft loaded'; }
  let t;
  ta.addEventListener('input', () => {
    clearTimeout(t);
    status.textContent = 'Typing...';
    t = setTimeout(() => {
      localStorage.setItem('ty-docs-draft', ta.value);
      status.textContent = 'Saved ✓';
    }, 1000);
  });
})();"]])
       (code-block "let saveTimeout;
textarea.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  showStatus('Typing...');
  saveTimeout = setTimeout(() => {
    localStorage.setItem('draft', textarea.value);
    showStatus('Saved ✓');
  }, 1000);
});" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Dynamic Validation")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set or remove the error attribute based on your validation logic."]
       (demo-area
        [:ty-textarea
         {:label "Bio (10–200 characters)"
          :placeholder "Tell us about yourself..."
          :on {:change (fn [e]
                         (let [el (.-target e)
                               n  (count (.. e -detail -value))]
                           (cond
                             (< n 10)
                             (.setAttribute el "error" (str (- 10 n) " more characters needed"))
                             (> n 200)
                             (.setAttribute el "error" (str "Too long by " (- n 200) " characters"))
                             :else
                             (.removeAttribute el "error"))))}}])
       (code-block "textarea.addEventListener('change', (e) => {
  const n = e.detail.value.length;
  if (n < 10) textarea.setAttribute('error', `${10 - n} more needed`);
  else if (n > 200) textarea.setAttribute('error', `Too long by ${n - 200}`);
  else textarea.removeAttribute('error');
});" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Form Integration")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Fully form-associated — works with FormData, submit, reset, and validation like native elements."]
       (demo-area
        [:form.space-y-3
         {:on {:submit (fn [e]
                         (.preventDefault e)
                         (let [data (js/Object.fromEntries (js/FormData. (.-target e)))]
                           (js/alert (str "Submitted:\n" (js/JSON.stringify data nil 2)))))}}
         [:ty-textarea {:label "Message" :name "message" :placeholder "Write your message..." :required true}]
         [:ty-textarea {:label "Notes (optional)" :name "notes" :placeholder "Additional info..." :rows "2"}]
         [:ty-button {:type "submit" :flavor "primary"} "Submit"]])
       (code-block "<form>
  <ty-textarea name=\"message\" label=\"Message\" required></ty-textarea>
  <ty-textarea name=\"notes\" label=\"Notes\"></ty-textarea>
  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>
</form>")]])

   (doc-section "Best Practices"
     [:div.ty-elevated.rounded-lg.p-5
      [:div.grid.gap-6
       {:style {:grid-template-columns "repeat(auto-fill, minmax(260px, 1fr))"}}

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-success {:name "check-circle" :size "16"}]
         [:span.ty-text-success+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Do"]]
        [:div.space-y-2
         (for [text ["Set min-height for UX and max-height to cap growth"
                     "Always provide a label for accessibility"
                     "Use required and error for form validation feedback"
                     "Debounce auto-save logic to avoid excessive writes"
                     "Match size to surrounding form controls"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Use without a label — screen readers need context"
                     "Set a fixed height via CSS — defeats auto-resize"
                     "Skip max-height for very long documents"
                     "Validate on every keystroke — use change not input for validation"
                     "Use for short single-line text — ty-input handles that"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))
