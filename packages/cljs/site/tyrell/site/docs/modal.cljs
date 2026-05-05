(ns tyrell.site.docs.modal
  "Documentation for ty-modal component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-modal"
                     "Native <dialog> wrapper with backdrop, scroll locking, focus trapping, and ESC/click-outside close. A pure wrapper — all visual styling lives in your content, not the modal element.")

   ;; API Reference
   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-accent)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "open"
        :type "boolean"
        :default "false"
        :description "Controls modal visibility declaratively — set to show, remove to hide"}
       {:name "backdrop"
        :type "boolean"
        :default "true"
        :description "Show a backdrop behind the modal content"}
       {:name "close-on-outside-click"
        :type "boolean"
        :default "true"
        :description "Clicking the backdrop closes the modal"}
       {:name "close-on-escape"
        :type "boolean"
        :default "true"
        :description "Pressing ESC closes the modal"}
       {:name "protected"
        :type "boolean"
        :default "false"
        :description "Require browser confirmation before closing — use for forms with unsaved changes"}])]

    [:div.mb-6
     (section-label "Methods")
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.5rem 0"}}
      [:div.flex.items-center.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "show()"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Open the modal programmatically"]]
     ]
     [:div {:style {:padding "0.5rem 0"}}
      [:div.flex.items-center.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "hide()"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Close the modal programmatically"]]]]

    [:div
     (section-label "Events")
     (event-table
      [{:name "open"
        :payload "{}"
        :when-fired "Fires when the modal opens"}
       {:name "close"
        :payload "{reason: 'programmatic'|'native'}"
        :when-fired "Fires when the modal closes"}])]]

   ;; Examples
   (doc-section "Examples"
     [:div.space-y-6

      ;; Basic
      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use " [:code ".show()"] " and " [:code ".hide()"] " to control the modal. All visual styling goes inside — the modal element itself is invisible."]
       (demo-area
        [:div
         [:ty-button {:on {:click #(.show (.getElementById js/document "demo-modal-basic"))}}
          "Open modal"]
         [:ty-modal {:id "demo-modal-basic"}
          [:div.ty-elevated.rounded-lg.p-6 {:style {:max-width "28rem"}}
           [:h3 {:style {:font-size "1.125rem" :font-weight "600" :margin-bottom "0.75rem"}} "Modal Title"]
           [:p.ty-text- {:style {:font-size "0.875rem" :line-height "1.6" :margin-bottom "1rem"}}
            "This is your modal content. Style it however you need — the modal element itself is invisible."]
           [:div.flex.justify-end.gap-2
            [:ty-button {:flavor "neutral"
                         :on {:click #(.hide (.getElementById js/document "demo-modal-basic"))}}
             "Cancel"]
            [:ty-button {:flavor "primary"
                         :on {:click #(.hide (.getElementById js/document "demo-modal-basic"))}}
             "Confirm"]]]]])
       (code-block "<ty-button onclick=\"document.getElementById('my-modal').show()\">
  Open modal
</ty-button>

<ty-modal id=\"my-modal\">
  <div class=\"ty-elevated rounded-lg p-6\" style=\"max-width: 28rem\">
    <h3>Modal Title</h3>
    <p class=\"ty-text-\">Your content here.</p>
    <ty-button onclick=\"this.closest('ty-modal').hide()\">Close</ty-button>
  </div>
</ty-modal>")]

      ;; Protected mode
      [:div.ty-content.rounded-lg.p-5
       (section-label "Protected Mode")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "protected"] " to require browser confirmation before closing — ideal for forms with unsaved changes. ESC, backdrop click, and " [:code ".hide()"] " all trigger the confirmation."]
       (demo-area
        [:div
         [:ty-button {:on {:click #(.show (.getElementById js/document "demo-modal-protected"))}}
          "Open protected modal"]
         [:ty-modal {:id "demo-modal-protected" :protected ""}
          [:div.ty-elevated.rounded-lg.p-6 {:style {:max-width "28rem"}}
           [:h3 {:style {:font-size "1.125rem" :font-weight "600" :margin-bottom "0.75rem"}} "Unsaved Changes"]
           [:ty-input {:label "Title" :placeholder "Type something..."}]
           [:p.ty-text-- {:style {:font-size "0.8125rem" :margin-top "0.75rem"}}
            "Try pressing ESC or clicking outside — you'll be asked to confirm."]
           [:div.flex.justify-end.gap-2 {:style {:margin-top "1rem"}}
            [:ty-button {:flavor "neutral"
                         :on {:click #(.hide (.getElementById js/document "demo-modal-protected"))}}
             "Discard"]
            [:ty-button {:flavor "primary"}
             "Save"]]]]])
       (code-block "<ty-modal id=\"my-modal\" protected>
  <div class=\"ty-elevated rounded-lg p-6\">
    <form>...</form>
    <ty-button onclick=\"this.closest('ty-modal').hide()\">
      Discard changes
    </ty-button>
  </div>
</ty-modal>")]

      ;; Declarative control
      [:div.ty-content.rounded-lg.p-5
       (section-label "Declarative Control")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Control visibility with the " [:code "open"] " attribute — useful in reactive frameworks where you manage state externally."]
       (code-block "<!-- React / framework binding -->
<TyModal open={isOpen} onClose={() => setIsOpen(false)}>
  <div class=\"ty-elevated rounded-lg p-6\">...</div>
</TyModal>

<!-- ClojureScript / Replicant -->
[:ty-modal {:open (when @modal-open? \"\")
            :on {:close #(reset! modal-open? false)}}
 [:div.ty-elevated.rounded-lg.p-6 ...]]")]])

   ;; Advanced Examples
   (doc-section "Advanced Examples"
     [:div.space-y-6

      ;; Form dialog
      [:div.ty-content.rounded-lg.p-5
       (section-label "Form Dialog")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Common pattern — full form inside a modal with cancel/submit actions. Use " [:code "protected"] " if the form has meaningful input."]
       (code-block "<ty-modal id=\"create-modal\">
  <div class=\"ty-elevated rounded-lg p-6\" style=\"max-width: 32rem; width: 100%\">
    <h3 class=\"font-semibold mb-4\">Create Item</h3>
    <form onsubmit=\"handleSubmit(event)\">
      <div class=\"space-y-4\">
        <ty-input name=\"title\" label=\"Title\" required></ty-input>
        <ty-dropdown name=\"category\" label=\"Category\">
          <ty-option value=\"work\">Work</ty-option>
          <ty-option value=\"personal\">Personal</ty-option>
        </ty-dropdown>
        <ty-textarea name=\"notes\" label=\"Notes\"></ty-textarea>
      </div>
      <div class=\"flex justify-end gap-2 mt-6\">
        <ty-button type=\"button\" flavor=\"neutral\"
                   onclick=\"this.closest('ty-modal').hide()\">Cancel</ty-button>
        <ty-button type=\"submit\" flavor=\"primary\">Create</ty-button>
      </div>
    </form>
  </div>
</ty-modal>")]

      ;; JavaScript API
      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const modal = document.getElementById('my-modal');

// Open / close
modal.show();
modal.hide();

// Listen for lifecycle events
modal.addEventListener('open', () => {
  console.log('opened');
});

modal.addEventListener('close', (e) => {
  console.log('closed, reason:', e.detail.reason);
  // reason: 'programmatic' | 'native'
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
         (for [text ["Style your content div, not the ty-modal element itself"
                     "Use ty-elevated or ty-floating as the content wrapper surface"
                     "Always include a clear close action (button or cancel link)"
                     "Use protected for forms with fields the user has filled in"
                     "Set max-width on the content div to keep the modal readable"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-success.mt-px {:name "check" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]

       [:div
        [:div.flex.items-center.gap-2.mb-3
         [:ty-icon.ty-text-danger {:name "x-circle" :size "16"}]
         [:span.ty-text-danger+ {:style {:font-size "0.75rem" :font-weight "600" :letter-spacing "0.05em" :text-transform "uppercase"}} "Don't"]]
        [:div.space-y-2
         (for [text ["Apply visual styles to the ty-modal tag — it's transparent by design"
                     "Nest modals unless absolutely necessary"
                     "Auto-open a modal on page load without a clear user trigger"
                     "Use modals for trivial confirmations — inline UI is often better"
                     "Forget to handle the close event for state cleanup"]]
           [:div.flex.items-start.gap-2
            [:ty-icon.ty-text-danger.mt-px {:name "x" :size "14"}]
            [:p.ty-text- {:style {:font-size "0.8125rem"}} text]])]]]])))

