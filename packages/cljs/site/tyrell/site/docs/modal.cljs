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
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
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
        :description "Pressing ESC closes the modal"}])]

    [:div.mb-6
     (section-label "Methods")
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.5rem 0"}}
      [:div.flex.items-center.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "show()"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Open the modal programmatically"]]
     ]
     [:div {:style {:padding "0.5rem 0"}}
      [:div.flex.items-center.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "hide(opts?)"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}}
        "Close the modal. Pass " [:code "{force: true}"] " to skip the cancellable "
        [:code "beforeclose"] " event — useful after your own confirm UI has captured consent."]]]]

    [:div
     (section-label "Events")
     (event-table
      [{:name "open"
        :payload "{}"
        :when-fired "Fires when the modal opens"}
       {:name "beforeclose"
        :payload "{reason: 'programmatic'|'backdrop'|'escape'|'close-button'|'native'}"
        :when-fired "Cancellable — fires before the modal closes. Call event.preventDefault() to abort and render your own confirm UI for unsaved-state flows."}
       {:name "close"
        :payload "{reason: 'programmatic'|'native', returnValue?: string}"
        :when-fired "Fires when the modal has closed"}])]]

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

      ;; Guarding close — beforeclose
      [:div.ty-content.rounded-lg.p-5
       (section-label "Guarding close — beforeclose")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Listen for the cancellable " [:code "beforeclose"] " event when you need a \"discard changes?\" prompt or any other dismissal guard. Calling " [:code "event.preventDefault()"] " aborts the close — you're then in control. Once the user confirms, call " [:code ".hide({force: true})"] " to bypass the event and actually close. Reasons in the detail are " [:code "'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'"] " so you can branch on intent (e.g. allow ESC but not backdrop)."]
       (code-block "<ty-modal id=\"my-modal\">
  <div class=\"ty-elevated rounded-lg p-6\">
    <form>...</form>
    <ty-button onclick=\"this.closest('ty-modal').hide()\">Discard</ty-button>
    <ty-button flavor=\"primary\">Save</ty-button>
  </div>
</ty-modal>

<script>
  const modal = document.getElementById('my-modal');
  modal.addEventListener('beforeclose', (e) => {
    if (formHasUnsavedChanges()) {
      e.preventDefault();
      // Render your own confirm UI — could be another ty-modal, a toast, anything.
      showDiscardPrompt().then((confirmed) => {
        if (confirmed) modal.hide({ force: true });
      });
    }
  });
</script>")
       (code-block "// React
<TyModal
  open={open}
  onBeforeClose={(e) => {
    if (dirty) {
      e.preventDefault();
      setShowDiscardPrompt(true);
    }
  }}
  onClose={() => setOpen(false)}
>
  …
</TyModal>

// Later, in your discard handler:
modalRef.current?.hide({ force: true });" "tsx")]

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

      ;; Complex form dialog (interactive)
      [:div.ty-content.rounded-lg.p-5
       (section-label "Complex Form Dialog")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Real-world pattern — a project-creation form with input, dropdown, multiselect, and an auto-resizing textarea inside the modal. The content uses a two-column grid that collapses on narrow screens. Wire up " [:code "beforeclose"] " to guard against accidental dismissal — see the section above."]
       (demo-area
        [:div
         [:ty-button {:flavor "primary"
                      :on {:click #(.show (.getElementById js/document "demo-modal-complex"))}}
          [:ty-icon {:slot "start" :name "plus" :size "14"}]
          "New project"]
         [:ty-modal {:id "demo-modal-complex"}
          [:div.ty-elevated.rounded-lg
           {:style {:width "min(38rem, 92vw)" :max-height "85vh"
                    :display "flex" :flex-direction "column" :overflow "hidden"}}

           ;; Header
           [:div {:style {:padding "1.25rem 1.5rem" :border-bottom "1px solid var(--ty-border-soft)"}}
            [:h3.ty-text++ {:style {:font-size "1.0625rem" :font-weight "600" :margin "0"}}
             "Create project"]
            [:p.ty-text- {:style {:font-size "0.8125rem" :margin "0.25rem 0 0"}}
             "Fill in the details below. Press ESC to cancel."]]

           ;; Scrollable body
           [:div {:style {:padding "1.5rem" :overflow-y "auto" :flex "1 1 auto"}}
            [:div.grid.gap-4
             {:style {:grid-template-columns "repeat(auto-fit, minmax(220px, 1fr))"}}
             [:ty-input {:name "title" :label "Project name"
                         :placeholder "Eg. Q3 launch site" :required ""}]
             [:ty-dropdown {:name "priority" :label "Priority" :value "medium"}
              [:ty-option {:value "low"} "Low"]
              [:ty-option {:value "medium"} "Medium"]
              [:ty-option {:value "high"} "High"]
              [:ty-option {:value "urgent"} "Urgent"]]]

            [:div {:style {:margin-top "1rem"}}
             [:ty-multiselect {:name "assignees" :label "Assignees"
                               :placeholder "Add team members..."
                               :value "ada,linus"
                               :clearable ""}
              [:ty-tag {:value "ada"     :pill "" :size "sm" :flavor "primary"} "Ada Lovelace"]
              [:ty-tag {:value "linus"   :pill "" :size "sm" :flavor "primary"} "Linus Torvalds"]
              [:ty-tag {:value "grace"   :pill "" :size "sm" :flavor "primary"} "Grace Hopper"]
              [:ty-tag {:value "rich"    :pill "" :size "sm" :flavor "primary"} "Rich Hickey"]
              [:ty-tag {:value "alan"    :pill "" :size "sm" :flavor "primary"} "Alan Kay"]
              [:ty-tag {:value "barbara" :pill "" :size "sm" :flavor "primary"} "Barbara Liskov"]]]

            [:div {:style {:margin-top "1rem"}}
             [:ty-multiselect {:name "tags" :label "Tags"
                               :placeholder "Pick one or more..."
                               :value "frontend"}
              [:ty-tag {:value "frontend"      :pill "" :size "sm" :flavor "success"} "frontend"]
              [:ty-tag {:value "backend"       :pill "" :size "sm" :flavor "warning"} "backend"]
              [:ty-tag {:value "design"        :pill "" :size "sm" :flavor "secondary"}  "design"]
              [:ty-tag {:value "infra"         :pill "" :size "sm" :flavor "neutral"} "infra"]
              [:ty-tag {:value "research"      :pill "" :size "sm" :flavor "info"}    "research"]]]

            [:div {:style {:margin-top "1rem"}}
             [:ty-textarea {:name "description" :label "Description"
                            :placeholder "What is this project about?"
                            :min-height "100px" :max-height "220px"}]]]

           ;; Footer
           [:div.flex.justify-end.gap-2
            {:style {:padding "1rem 1.5rem" :border-top "1px solid var(--ty-border-soft)"
                     :background "var(--ty-surface-content)"}}
            [:ty-button {:flavor "neutral"
                         :on {:click #(.hide (.getElementById js/document "demo-modal-complex"))}}
             "Cancel"]
            [:ty-button {:flavor "primary"
                         :on {:click #(.hide (.getElementById js/document "demo-modal-complex"))}}
             [:ty-icon {:slot "start" :name "check" :size "14"}]
             "Create project"]]]]])
       (code-block "<ty-button onclick=\"document.getElementById('create-modal').show()\">
  New project
</ty-button>

<ty-modal id=\"create-modal\">
  <div class=\"ty-elevated rounded-lg\"
       style=\"width: min(38rem, 92vw); max-height: 85vh;
              display: flex; flex-direction: column; overflow: hidden\">

    <!-- Header -->
    <div style=\"padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--ty-border-soft)\">
      <h3 class=\"ty-text++\">Create project</h3>
      <p class=\"ty-text-\">Fill in the details below. Press ESC to cancel.</p>
    </div>

    <!-- Scrollable body -->
    <div style=\"padding: 1.5rem; overflow-y: auto; flex: 1 1 auto\">
      <div class=\"grid gap-4\"
           style=\"grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))\">
        <ty-input name=\"title\" label=\"Project name\" required></ty-input>
        <ty-dropdown name=\"priority\" label=\"Priority\" value=\"medium\">
          <ty-option value=\"low\">Low</ty-option>
          <ty-option value=\"medium\">Medium</ty-option>
          <ty-option value=\"high\">High</ty-option>
          <ty-option value=\"urgent\">Urgent</ty-option>
        </ty-dropdown>
      </div>

      <ty-multiselect name=\"assignees\" label=\"Assignees\"
                      value=\"ada,linus\" clearable>
        <ty-tag value=\"ada\"   pill size=\"sm\" flavor=\"primary\">Ada Lovelace</ty-tag>
        <ty-tag value=\"linus\" pill size=\"sm\" flavor=\"primary\">Linus Torvalds</ty-tag>
        <ty-tag value=\"grace\" pill size=\"sm\" flavor=\"primary\">Grace Hopper</ty-tag>
        <ty-tag value=\"rich\"  pill size=\"sm\" flavor=\"primary\">Rich Hickey</ty-tag>
      </ty-multiselect>

      <ty-multiselect name=\"tags\" label=\"Tags\" value=\"frontend\">
        <ty-tag value=\"frontend\" pill size=\"sm\" flavor=\"success\">frontend</ty-tag>
        <ty-tag value=\"backend\"  pill size=\"sm\" flavor=\"warning\">backend</ty-tag>
        <ty-tag value=\"design\"   pill size=\"sm\" flavor=\"accent\">design</ty-tag>
      </ty-multiselect>

      <ty-textarea name=\"description\" label=\"Description\"
                   min-height=\"100px\" max-height=\"220px\"></ty-textarea>
    </div>

    <!-- Footer -->
    <div class=\"flex justify-end gap-2\"
         style=\"padding: 1rem 1.5rem; border-top: 1px solid var(--ty-border-soft)\">
      <ty-button flavor=\"neutral\"
                 onclick=\"this.closest('ty-modal').hide()\">Cancel</ty-button>
      <ty-button flavor=\"primary\">Create project</ty-button>
    </div>
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
                     "Listen for beforeclose to guard forms with unsaved input — render your own confirm UI"
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

