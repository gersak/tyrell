(ns tyrell.site.docs.modal
  "Documentation for ty-modal component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn- capture-form-data!
  "Submit handler for the live form-in-a-modal demo. Reads FormData off the
   slotted <form> — no per-control wiring — and prints what came out into a
   panel OUTSIDE the modal, so the values are still on screen after it closes."
  [^js e]
  (.preventDefault e)
  (let [pairs (js/Array.from (.entries (js/FormData. (.-target e))))
        lines (map (fn [pair] (str (aget pair 0) ": " (aget pair 1))) pairs)]
    (when-let [out (.getElementById js/document "demo-form-out")]
      (set! (.-textContent out)
            (if (seq lines) (str/join "\n" lines) "(no named fields)")))
    (when-let [m (.closest (.-target e) "ty-modal")]
      (.hide ^js m))))

(defn view []
  (docs-page
   (component-header "ty-modal"
                     "Native <dialog> wrapper with backdrop, scroll locking, focus trapping, and ESC/click-outside close. A pure wrapper — all visual styling lives in your content, not the modal element. Also registered as <ty-dialog> if you prefer the platform name.")

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
        :description "Show a backdrop behind the modal content. Also picks the underlying mode: true opens with showModal() — top layer, focus trap, ESC handling; false opens with show(), a non-modal dialog that leaves the page interactive."}
       {:name "close-on-outside-click"
        :type "boolean"
        :default "true"
        :description "Clicking the backdrop closes the modal"}
       {:name "close-on-escape"
        :type "boolean"
        :default "true"
        :description "Pressing ESC closes the modal"}
       {:name "label"
        :type "string"
        :default "—"
        :description "Accessible name for the dialog (aria-label). <dialog> gets role=\"dialog\" for free but no name — screen readers announce an unnamed dialog without it."}])]

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
        :payload "{reason: 'programmatic'|'backdrop'|'escape'|'close-button'|'native', returnValue?: string}"
        :when-fired "Fires when the modal has closed, carrying the same reason beforeclose saw. Does not bubble — a modal opened from inside another modal never trips the outer modal's listener."}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use " [:code ".show()"] " and " [:code ".hide()"] " to control the modal. All visual styling goes inside — the modal element itself is invisible."]
       (demo-area
        [:div
         [:ty-button {:on {:click #(.show (.getElementById js/document "demo-modal-basic"))}}
          "Open modal"]
         [:ty-modal {:id "demo-modal-basic" :backdrop-zoom "true"}
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

      [:div.ty-content.rounded-lg.p-5
       (section-label "A real dialog — popups inside, one plain form around it")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Project-creation dialog: input, date picker, selects, an overflow menu, a tooltip and an "
        "auto-resizing textarea. Two things are worth watching, and they're the reason to reach for "
        "a modal at all."]
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        [:strong "Popups compose."] " Every popup in here — " [:code "ty-select"] ", "
        [:code "ty-date-picker"] ", " [:code "ty-popup"] ", " [:code "ty-tooltip"]
        " — opens in the top layer above the modal and closes independently of it. Their "
        [:code "open"] " / " [:code "close"] " events don't bubble (same as the native " [:code "<dialog>"]
        "), so a " [:code "close"] " listener on the modal only ever hears about the modal."]
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        [:strong "It's just a form."] " The body is one " [:code "<form>"]
        " — nothing wires the fields to it. Submit and the panel underneath prints the raw "
        [:code "FormData"] " the handler received; leave the project name empty and native "
        [:code "required"] " blocks the submit from inside the modal. Wire up "
        [:code "beforeclose"] " to guard against accidental dismissal — see the section above."]
       (demo-area
        [:div.space-y-3
         [:ty-button {:flavor "primary"
                      :on {:click #(.show (.getElementById js/document "demo-modal-complex"))}}
          [:ty-icon {:slot "start" :name "plus" :size "14"}]
          "New project"]
         [:ty-modal {:id "demo-modal-complex" :label "Create project" :backdrop-zoom "true"}
          [:div.ty-elevated.rounded-lg
           {:style {:width "min(38rem, 92vw)" :max-height "85vh"
                    :display "flex" :flex-direction "column" :overflow "hidden"}}
          [:form {:style {:display "flex" :flex-direction "column" :min-height "0"}
                  :on {:submit capture-form-data!}}

           [:div.flex.items-start.justify-between.gap-3
            {:style {:padding "1.25rem 1.5rem" :border-bottom "1px solid var(--ty-border-soft)"}}
            [:div
             [:div.flex.items-center.gap-2
              [:h3.ty-text++ {:style {:font-size "1.0625rem" :font-weight "600" :margin "0"}}
               "Create project"]
              [:span.ty-text--.inline-flex.items-center {:style {:cursor "help"}}
               [:ty-icon {:name "info" :size "14"}]
               [:ty-tooltip {:placement "right"} "Projects are visible to everyone in the workspace."]]]
             [:p.ty-text- {:style {:font-size "0.8125rem" :margin "0.25rem 0 0"}}
              "Fill in the details below. Press ESC to cancel."]]
            [:ty-button {:action "" :size "sm"}
             [:ty-icon {:name "more-horizontal" :size "sm"}]
             [:ty-popup {:placement "bottom-end"}
              [:div.ty-floating.rounded-lg
               {:style {:min-width "12rem" :padding "0.375rem"}}
               (for [[icon label] [["copy" "Start from template"] ["upload" "Import from CSV"]]]
                 ^{:key label}
                 [:button.w-full.ty-text.rounded-md
                  {:style {:display "flex" :align-items "center" :gap "0.5rem"
                           :padding "0.4375rem 0.5rem" :font-size "0.8125rem"
                           :background "none" :border "none" :cursor "pointer" :text-align "left"}
                   :on {:click #(.closePopup ^js (.closest (.-target %) "ty-popup"))}}
                  [:ty-icon {:name icon :size "xs"}] label])]]]]

           [:div {:style {:padding "1.5rem" :overflow-y "auto" :flex "1 1 auto"}}
            [:div.grid.gap-4
             {:style {:grid-template-columns "repeat(auto-fit, minmax(220px, 1fr))"}}
             [:ty-input {:name "title" :label "Project name" :required ""
                         :placeholder "Try submitting this empty"}]
             [:ty-select {:name "priority" :label "Priority" :value "medium"}
              [:ty-option {:value "low"} "Low"]
              [:ty-option {:value "medium"} "Medium"]
              [:ty-option {:value "high"} "High"]
              [:ty-option {:value "urgent"} "Urgent"]]
             [:ty-date-picker {:name "due" :label "Due date"}]]

            [:div {:style {:margin-top "1rem"}}
             [:ty-select {:name "assignees" :multiple true :label "Assignees"
                               :placeholder "Add team members..."
                               :value "ada,linus"
                               :clearable ""}
              [:ty-option {:value "ada" :flavor "primary"} "Ada Lovelace"]
              [:ty-option {:value "linus" :flavor "primary"} "Linus Torvalds"]
              [:ty-option {:value "grace" :flavor "primary"} "Grace Hopper"]
              [:ty-option {:value "rich" :flavor "primary"} "Rich Hickey"]
              [:ty-option {:value "alan" :flavor "primary"} "Alan Kay"]
              [:ty-option {:value "barbara" :flavor "primary"} "Barbara Liskov"]]]

            [:div {:style {:margin-top "1rem"}}
             [:ty-select {:name "tags" :multiple true :label "Tags"
                               :placeholder "Pick one or more..."
                               :value "frontend"}
              [:ty-option {:value "frontend" :flavor "success"} "frontend"]
              [:ty-option {:value "backend" :flavor "warning"} "backend"]
              [:ty-option {:value "design" :flavor "neutral"} "design"]
              [:ty-option {:value "infra" :flavor "neutral"} "infra"]
              [:ty-option {:value "research" :flavor "info"} "research"]]]

            [:div {:style {:margin-top "1rem"}}
             [:ty-textarea {:name "description" :label "Description"
                            :placeholder "What is this project about?"
                            :min-height "100px" :max-height "220px"}]]]

           [:div.flex.justify-end.gap-2
            {:style {:padding "1rem 1.5rem" :border-top "1px solid var(--ty-border-soft)"
                     :background "var(--ty-surface-content)"}}
            [:ty-button {:flavor "neutral" :type "button"
                         :on {:click #(.hide (.getElementById js/document "demo-modal-complex"))}}
             "Cancel"]
            [:ty-button {:flavor "primary" :type "submit"}
             [:ty-icon {:slot "start" :name "check" :size "14"}]
             "Create project"]]]]]

         [:div.ty-content.rounded-lg
          {:style {:border "1px solid var(--ty-border-soft)" :overflow "hidden"}}
          [:div {:style {:padding "0.5rem 0.75rem"
                         :border-bottom "1px solid var(--ty-border-soft)"}}
           [:span.ty-text-- {:style {:font-size "0.625rem" :font-weight "600"
                                     :letter-spacing "0.08em" :text-transform "uppercase"}}
            "FormData the submit handler received"]]
          [:pre.ty-text.font-mono {:id "demo-form-out"
                                   :style {:font-size "0.75rem" :line-height "1.7"
                                           :padding "0.75rem" :margin "0"
                                           :white-space "pre-wrap"}}
           "submit the form…"]]])
       [:p.ty-text--.mt-3.mb-2 {:style {:font-size "0.75rem" :line-height "1.6"}}
        "The whole thing is just slotted content. The only structural part worth copying is the shell — "
        "a flex column with a scrolling middle, so the header and footer stay put while the body scrolls:"]
       (code-block "<ty-modal id=\"create-modal\">
  <div class=\"ty-elevated rounded-lg\"
       style=\"width: min(38rem, 92vw); max-height: 85vh;
              display: flex; flex-direction: column; overflow: hidden\">

    <div>            <!-- header — fixed -->
    <div style=\"overflow-y: auto; flex: 1 1 auto\">   <!-- body — scrolls -->
    <div>            <!-- footer — fixed -->

  </div>
</ty-modal>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "…and the form code behind it")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Content is slotted, not moved, so a " [:code "<form>"] " inside a modal is an ordinary form. "
        "Every Tyrell form control is form-associated: " [:code "FormData"] " picks up "
        [:code "ty-input"] ", " [:code "ty-select"] ", " [:code "ty-date-picker"] ", " [:code "ty-checkbox"]
        " and friends by " [:code "name"] " with no wiring, and " [:code "ty-button type=\"submit\""]
        " submits it. That is the entire implementation behind the dialog above — no value "
        "collecting, no refs, no per-field handlers."]
       (code-block "<ty-modal id=\"m\" open>
  <form id=\"project\">
    <ty-input name=\"title\" label=\"Project name\" required></ty-input>
    <ty-select name=\"priority\" value=\"high\">…</ty-select>
    <ty-date-picker name=\"due\"></ty-date-picker>

    <ty-button type=\"submit\" flavor=\"primary\">Create</ty-button>
  </form>
</ty-modal>

<script>
  project.addEventListener('submit', (e) => {
    e.preventDefault();
    // title / priority / due are all in here, by name
    const data = Object.fromEntries(new FormData(e.target));
    fetch('/projects', { method: 'POST', body: new FormData(e.target) });
  });
</script>")
       [:p.ty-text--.mt-2 {:style {:font-size "0.75rem" :line-height "1.6"}}
        "Native validation carries too — " [:code "required"] " on a slotted control blocks submit the "
        "same way it would anywhere else."]]])

   (doc-section "Control"
     [:div.space-y-6

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
 [:div.ty-elevated.rounded-lg.p-6 ...]]")]

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
  // 'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'
});" "javascript")]])

   (doc-section "Advanced"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Guarding close — beforeclose")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Listen for the cancellable " [:code "beforeclose"] " event when you need a \"discard changes?\" "
        "prompt or any other dismissal guard. " [:code "event.preventDefault()"] " aborts the close — "
        "you're then in control. Once the user confirms, call " [:code ".hide({force: true})"]
        " to bypass the event and actually close. The detail's " [:code "reason"]
        " is " [:code "'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'"]
        ", so you can branch on intent (allow ESC, but not a stray backdrop click)."]
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The confirm UI is usually just another " [:code "ty-modal"]
        ". It stacks on the top layer above the one it's guarding, and its " [:code "close"]
        " doesn't reach the outer modal's listeners — so the whole flow is two plain modals, "
        "no state machine, no portal:"]
       (code-block "outer.addEventListener('beforeclose', (e) => {
  if (!dirty) return;
  e.preventDefault();     // hold the outer modal open
  confirmModal.show();    // stacks above it
});

discardBtn.onclick = () => {
  confirmModal.hide();
  outer.hide({ force: true });   // skip the guard we just satisfied
};" "javascript")
       [:p.ty-text--.mt-3.mb-2 {:style {:font-size "0.75rem" :line-height "1.6"}}
        "Same thing with a promise-based prompt, and the React shape:"]
       (code-block "modal.addEventListener('beforeclose', (e) => {
  if (!formHasUnsavedChanges()) return;
  e.preventDefault();
  showDiscardPrompt().then((confirmed) => {
    if (confirmed) modal.hide({ force: true });
  });
});" "javascript")
       (code-block "<TyModal
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
modalRef.current?.hide({ force: true });" "tsx")]])
))

