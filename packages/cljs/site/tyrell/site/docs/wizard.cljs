(ns tyrell.site.docs.wizard
  "Documentation for ty-wizard and ty-step"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(defn- doc-state [k] (get-in @state/state [:wizard-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:wizard-doc k] v))

(def ^:private steps
  [["account" "Account" "Who you are"]
   ["plan" "Plan" "Pick a tier"]
   ["payment" "Payment" "Card details"]
   ["done" "Done" "All set"]])

(def ^:private step-ids (mapv first steps))

(defn- flow
  "Checkout flow driven from state: active step, completed set, validation."
  [prefix {:keys [orientation]}]
  (let [k (keyword prefix)
        {:keys [active completed error]} (or (doc-state k) {:active "account" :completed #{}})
        i (.indexOf step-ids active)
        go! (fn [to done] (set-doc! k {:active to :completed done :error nil}))
        email (or (doc-state [k :email]) "")]
    [:div.flex.flex-col.gap-4.w-full
     [:ty-wizard (cond-> {:active active :completed (str/join "," completed)
                          :orientation (or orientation "horizontal")
                          :on {:ty-wizard-step-change
                               (fn [^js e]
                                 ;; Indicator clicks only report; allow going back to finished steps.
                                 (let [to (.. e -detail -activeId)]
                                   (when (or (contains? completed to) (< (.indexOf step-ids to) i))
                                     (go! to completed))))}})
      (for [[id label desc] steps]
        [:ty-step (cond-> {:replicant/key id :id id :label label :description desc}
                    (and error (= id "account")) (assoc :status "error"))
         [:div.flex.flex-col.gap-3.p-6.text-sm
          (case id
            "account" [:ty-input {:label "Work email" :type "email" :value email :size "sm"
                                  :error (or error "")
                                  :on {:input #(set-doc! [k :email] (.. % -detail -value))}}]
            "plan" [:ty-radio-group {:value "pro" :orientation "horizontal"}
                    (for [p ["Starter" "Pro" "Team"]]
                      [:label.flex.items-start.gap-2.cursor-pointer {:replicant/key p}
                       [:ty-radio {:value (str/lower-case p)}] [:span.ty-text+ p]])]
            "payment" [:ty-input {:label "Card number" :placeholder "4242 4242 4242 4242" :size "sm"}]
            "done" [:span.ty-text+ "You're in. Check your inbox."])]])]
     [:div.flex.items-center.justify-between
      [:ty-button {:appearance "ghost" :size "md" :disabled (when (zero? i) "")
                   :on {:click #(go! (nth step-ids (max 0 (dec i))) completed)}} "Back"]
      (if (= active "done")
        [:ty-button {:size "md" :on {:click #(go! "account" #{})}} "Start over"]
        [:ty-button {:flavor "primary" :size "md"
                     :on {:click (fn []
                                   (if (and (= active "account") (not (re-find #"@" email)))
                                     (set-doc! k {:active active :completed completed :error "Enter an email to continue"})
                                     (go! (nth step-ids (inc i)) (conj completed active))))}}
         "Next"])]]))

(defn- snippets [{:keys [orientation]}]
  (let [o (when (= orientation "vertical") " orientation=\"vertical\"")]
    [["html" "HTML" "html"
      (str "<ty-wizard active=\"plan\" completed=\"account\"" o ">\n"
           (str/join "\n" (for [[id l d] steps] (str "  <ty-step id=\"" id "\" label=\"" l "\" description=\"" d "\">…</ty-step>")))
           "\n</ty-wizard>")]
     ["react" "React" "javascript"
      (str "import { TyWizard, TyStep } from 'tyrell-react'\n\n"
           "<TyWizard active={step} completed={done.join(',')}" o ">\n"
           (str/join "\n" (for [[id l] steps] (str "  <TyStep id=\"" id "\" label=\"" l "\">…</TyStep>")))
           "\n</TyWizard>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/Wizard {:active @step :completed (str/join \",\" @done)"
           (when o " :orientation \"vertical\"") "}"
           (str/join (for [[id l] steps] (str "\n [:> ty/Step {:id \"" id "\" :label \"" l "\"} …]"))) "]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-wizard {:active step :completed (str/join \",\" done)"
           (when o " :orientation \"vertical\"") "}"
           (str/join (for [[id l] steps] (str "\n [:ty-step {:id \"" id "\" :label \"" l "\"} …]"))) "]")]
     ["datastar" "Datastar" "html"
      (str "<ty-wizard data-attr:active=\"$step\" data-attr:completed=\"$done\"" o ">\n  …\n</ty-wizard>")]]))

(defn view []
  (component-page
   {:title "Wizard"
    :group "Layout primitives"
    :tag "ty-wizard"
    :description "A stepper for multi-step flows: an inline rail of steps that collapses to Step N of M when space runs out, and panels sized to the tallest step, so nothing jumps. It renders and reports; your code decides when a step is done."
    :chips [["Controlled" "sliders-horizontal"] ["Error states" "zap"] ["TyWizard (React)" "atom"]]
    :source "packages/core/src/components/wizard.ts"
    :mark "→"
    :demo [:div {:style {:width "380px"}}
           [:ty-wizard {:active "plan" :completed "account"}
            (for [[id l] (take 3 steps)]
              [:ty-step {:replicant/key id :id id :label l}
               [:div.p-4.text-sm.ty-text- (str l " step")]])]]}

   (playground
    {:id :wizard
     :defaults {:orientation "horizontal"}
     :controls [{:key :orientation :options ["horizontal" "vertical"]}]
     :sub "Next validates the email first. Click a finished step to go back."
     :render (fn [props]
               [:div {:style {:width "100%" :max-width "620px"}}
                (flow "play" props)])
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "You drive it"
       :span 3
       :lang "javascript"
       :description [:span "Clicking an indicator only fires " [:code "ty-wizard-step-change"]
                     ". Decide whether to move, then set " [:code "active"] " and " [:code "completed"] "."]
       :code "wizard.addEventListener('ty-wizard-step-change', (e) => {
  const { activeId } = e.detail;
  if (done.has(activeId)) wizard.setAttribute('active', activeId);
});

next.onclick = () => {
  if (!valid(current)) return step.setAttribute('status', 'error');
  done.add(current);
  wizard.setAttribute('completed', [...done].join(','));
  wizard.setAttribute('active', nextId);
};"}
      [:div.flex.flex-col.gap-2
       [:p.text-sm.ty-text- "The playground above is exactly this. The wizard never navigates on its own, so validation stays in your code."]])

     (example
      {:title "Step status"
       :span 3
       :description [:span [:code "status"] " on a step overrides the derived state: completed, active, pending or error."]
       :code "<ty-step id=\"pay\" status=\"error\">"}
      [:ty-wizard {:active "b" :completed "a"}
       [:ty-step {:id "a" :label "Done"} [:div.p-4.text-sm.ty-text- "Finished."]]
       [:ty-step {:id "b" :label "Now"} [:div.p-4.text-sm.ty-text- "You are here."]]
       [:ty-step {:id "c" :label "Failed" :status "error"} [:div.p-4.text-sm.ty-text- "Needs attention."]]])

     (example
      {:title "Custom indicators"
       :span 6
       :description [:span "Replace a step's number with anything via " [:code "slot=\"indicator-{id}\""]
                     " on the wizard. It gets " [:code "data-active"] " so you can style it."]
       :code "<ty-wizard>
  <ty-icon slot=\"indicator-ship\" name=\"truck\"></ty-icon>
  <ty-step id=\"ship\" label=\"Shipping\">…</ty-step>
</ty-wizard>"}
      [:ty-wizard {:active "ship" :completed "cart"}
       (for [[id icon] [["cart" "archive"] ["ship" "truck"] ["pay" "lock"] ["ok" "check"]]]
         [:ty-icon {:replicant/key (str "i-" id) :slot (str "indicator-" id) :name icon :size "sm"}])
       (for [[id l] [["cart" "Cart"] ["ship" "Shipping"] ["pay" "Payment"] ["ok" "Confirm"]]]
         [:ty-step {:replicant/key id :id id :label l} [:div.p-3.text-sm.ty-text- l]])])

     (example
      {:title "Vertical"
       :span 3
       :description [:span [:code "orientation=\"vertical\""] " puts the rail on the left. Every label stays visible; good for long flows."]
       :code "<ty-wizard orientation=\"vertical\">"}
      [:ty-wizard {:active "plan" :completed "account" :orientation "vertical"}
       (for [[id l d] steps]
         [:ty-step {:replicant/key id :id id :label l :description d}
          [:div.p-5.text-sm.ty-text- d]])])

     (example
      {:title "Narrow containers"
       :span 3
       :description "When the labels don't fit, the rail becomes Step N of M over a segment bar. No attribute; it measures itself."
       :code "<!-- same markup, smaller box -->
<div style=\"width: 300px\">
  <ty-wizard active=\"plan\" completed=\"account\">…</ty-wizard>
</div>"}
      [:div {:style {:width "100%" :max-width "300px"}}
       [:ty-wizard {:active "plan" :completed "account"}
        (for [[id l d] steps]
          [:ty-step {:replicant/key id :id id :label l :description d}
           [:div.p-4.text-sm.ty-text- d]])]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const wizard = document.querySelector('ty-wizard');

wizard.setAttribute('active', 'payment');
wizard.setAttribute('completed', 'account,plan');

wizard.addEventListener('ty-wizard-step-change', (e) => {
  const { activeId, activeIndex, previousId, direction } = e.detail;
});"}
      nil)))

   (page-section
    {:title "Theming" :sub "Accents per state, plus geometry." :dark? true}
    (example
     {:title "State accents"
      :lang "css"
      :description "Each state has its own accent. Connectors and segments follow the completed accent unless you set the progress fill."
      :code "ty-wizard {
  --ty-wizard-active-accent: #2dd4bf;
  --ty-wizard-completed-accent: #14b8a6;
  --ty-wizard-circle-size: 28px;
}"}
     [:div {:style {:width "100%" :max-width "440px"}}
      [:ty-wizard {:active "b" :completed "a"
                   :style {"--ty-wizard-active-accent" "#2dd4bf"
                           "--ty-wizard-completed-accent" "#14b8a6"
                           "--ty-wizard-circle-size" "28px"}}
       (for [[id l] [["a" "Cart"] ["b" "Ship"] ["c" "Pay"]]]
         [:ty-step {:replicant/key id :id id :label l} [:div.p-4.text-sm.ty-text- (str l " step")]])]]))

   (api-section
    {:attributes ["ty-wizard"
                  ["active" "string" "first step" "id of the current step."]
                  ["completed" "string" "Comma-separated ids of finished steps."]
                  ["orientation" "string" "\"horizontal\"" "Rail on top (horizontal) or on the left (vertical)."]
                  ["width" "string" "\"100%\"" "Wizard width."]
                  ["height" "string" "Panel height, header excluded. Unset: panels size to the tallest step."]
                  "ty-step"
                  ["id" "string" "Required. What active and completed refer to."]
                  ["label" "string" "Indicator label."]
                  ["description" "string" "Second line, shown for the active step (and on error)."]
                  ["status" "string" "Override: completed, active, pending or error."]
                  ["disabled" "boolean" "false" "Shown, not reachable."]]
     :events [["ty-wizard-step-change" "{activeId, activeIndex, previousId, previousIndex, direction}" "An indicator was clicked (it doesn't navigate), or active changed. direction: forward, backward or none."]]
     :slots [["indicator-{id}" "On ty-wizard: replaces that step's number."]
             ["(default)" "ty-step children; each step's children are its panel."]]
     :css-vars [["--ty-wizard-active-accent / -completed-accent / -pending-accent / -error-accent" "Indicator colors per state. Completed defaults to the strong text color."]
                ["--ty-wizard-progress-track / -fill / -height" "Connectors between steps and the compact segment bar."]
                ["--ty-wizard-circle-size / -border-width" "Indicator geometry (24px, 1.5px)."]
                ["--ty-wizard-transition-duration / -easing" "Panel slide, same as ty-tabs (300ms)."]
                ["--ty-wizard-bg / -border / -radius / -shadow" "Container surface. No shadow by default."]
                ["--ty-wizard-header-bg / -border / -padding" "Rail area."]]})))
