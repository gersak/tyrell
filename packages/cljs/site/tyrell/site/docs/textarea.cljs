(ns tyrell.site.docs.textarea
  "Documentation for ty-textarea component"
  (:require [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private lineup
  "Playground stage: a plain field and one with footer actions."
  [{:label "Message" :placeholder "Write something…"}
   {:label "Reply" :value "Looks good to me. Shipping it after lunch." :footer? true}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size resize required disabled error]}]
  (cond-> {}
    (not= size "sm") (assoc :size size)
    (not= resize "none") (assoc :resize resize)
    required (assoc :required true)
    disabled (assoc :disabled true)
    error (assoc :error "Add a bit more detail")))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (for [{:keys [label value placeholder footer?]} lineup]
       [:ty-textarea (merge {:label label :value value :placeholder placeholder} attrs
                            {(snippets/ds "data-bind") (snippets/signal label)})
        (when footer? [:div {:slot "footer"} [:ty-button {:size "sm" :flavor "primary"} "Send"]])]))))

(defn- footer-bar [& {:keys [left button]}]
  [:div.flex.items-center.justify-between.gap-2 {:slot "footer" :style {:width "100%"}}
   [:div.flex.items-center.gap-1 left]
   button])

(defn- render-lineup [{:keys [size resize required disabled error]}]
  (let [base (cond-> {:size size :resize resize}
               required (assoc :required "")
               disabled (assoc :disabled "")
               error (assoc :error "Add a bit more detail"))]
    [:div.flex.flex-col.gap-5 {:style {:width "100%" :max-width "420px"}}
     (for [{:keys [label value placeholder footer?]} lineup]
       [:ty-textarea (cond-> (assoc base :replicant/key label :label label)
                       value (assoc :value value)
                       placeholder (assoc :placeholder placeholder))
        (when footer?
          (footer-bar :left [:span.text-xs.ty-text-- "Markdown supported"]
                      :button [:ty-button {:size "sm" :flavor "primary"} "Send"]))])]))

;; Interactive examples -------------------------------------------------------

(def ^:private limit 140)

(defn- doc-state [k] (get-in @state/state [:textarea-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:textarea-doc k] v))

(def ^:private long-text
  "Tyrell grows the field as you write. Paste a paragraph, add a few lines, and the box follows until it reaches max-height; from there it scrolls.

Delete the text and it shrinks back to min-height.")

(def ^:private counter-snippets
  "Character counter, one tab per stack."
  [["html" "HTML" "html"
    "<ty-textarea id=\"note\" label=\"Status update\">
  <span slot=\"footer\" id=\"counter\">0 / 140</span>
</ty-textarea>

<script>
  note.addEventListener('input', (e) => {
    const n = e.detail.value.length;
    counter.textContent = `${n} / 140`;
    note.error = n > 140 ? `${n - 140} characters over` : '';
  });
</script>"]
   ["react" "React" "javascript"
    "import { TyTextarea } from 'tyrell-react'

const over = note.length - 140

<TyTextarea label=\"Status update\" value={note}
  error={over > 0 ? `${over} characters over` : ''}
  onChange={(e) => setNote(e.detail.value)}>
  <span slot=\"footer\">{note.length} / 140</span>
</TyTextarea>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

(let [over (- (count @note) 140)]
  [:> ty/Textarea {:label \"Status update\" :value @note
                   :error (if (pos? over) (str over \" characters over\") \"\")
                   :on-change #(reset! note (.. % -detail -value))}
   [:span {:slot \"footer\"} (count @note) \" / 140\"]])"]
   ["replicant" "Replicant" "clojure"
    "(let [over (- (count note) 140)]
  [:ty-textarea {:label \"Status update\" :value note
                 :error (if (pos? over) (str over \" characters over\") \"\")
                 :on {:input #(set-note! (.. % -detail -value))}}
   [:span {:slot \"footer\"} (count note) \" / 140\"]])"]
   ["datastar" "Datastar" "html"
    "<ty-textarea label=\"Status update\"
  data-signals:note=\"''\" data-bind=\"note\"
  data-attr:error=\"$note.length > 140 ? `${$note.length - 140} characters over` : ''\">
  <span slot=\"footer\" data-text=\"`${$note.length} / 140`\"></span>
</ty-textarea>"]])

(def ^:private form-snippets
  "HTML form example, one tab per stack."
  [["html" "HTML" "html"
    "<form action=\"/feedback\" method=\"post\">
  <ty-textarea name=\"feedback\" label=\"Feedback\" required
    minlength=\"20\" maxlength=\"500\"
    too-short-message=\"At least {minlength} characters ({length} so far)\">
  </ty-textarea>
  <ty-button flavor=\"primary\">Send</ty-button>
</form>"]
   ["react" "React" "javascript"
    "import { TyTextarea, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <TyTextarea name=\"feedback\" label=\"Feedback\" required
    minLength={20} maxLength={500}
    tooShortMessage=\"At least {minlength} characters ({length} so far)\" />
  <TyButton flavor=\"primary\">Send</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:> ty/Textarea {:name \"feedback\" :label \"Feedback\" :required true
                  :min-length 20 :max-length 500
                  :too-short-message \"At least {minlength} characters ({length} so far)\"}]
 [:> ty/Button {:flavor \"primary\"} \"Send\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:ty-textarea {:name \"feedback\" :label \"Feedback\" :required \"\"
                :minlength \"20\" :maxlength \"500\"
                :too-short-message \"At least {minlength} characters ({length} so far)\"}]
 [:ty-button {:flavor \"primary\"} \"Send\"]]"]
   ["datastar" "Datastar" "html"
    "<form data-on:submit__prevent=\"@post('/feedback', {contentType: 'form'})\">
  <ty-textarea name=\"feedback\" label=\"Feedback\" required
    minlength=\"20\" maxlength=\"500\"
    too-short-message=\"At least {minlength} characters ({length} so far)\">
  </ty-textarea>
  <ty-button flavor=\"primary\">Send</ty-button>
</form>"]])

(def ^:private api-snippets
  "JavaScript API card, one tab per stack."
  [["html" "HTML" "javascript"
    "const ta = document.querySelector('ty-textarea');

ta.value = 'Hello';
ta.error = '';                     // set a message to show it

// input on every edit; change on blur, if the value changed
ta.addEventListener('input', (e) => preview(e.detail.value));
ta.addEventListener('change', (e) => save(e.detail.value));"]
   ["react" "React" "javascript"
    "import { TyTextarea } from 'tyrell-react'

<TyTextarea value={text} error={error}
  onChange={(e) => setText(e.detail.value)}         // input: every edit
  onChangeCommit={(e) => save(e.detail.value)} />  // change: on blur"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/Textarea {:value @text :error @error
                 :on-change #(reset! text (.. % -detail -value))
                 :on-change-commit #(save! (.. % -detail -value))}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-textarea {:value text :error error
               :on {:input #(set-text! (.. % -detail -value))
                    :change #(save! (.. % -detail -value))}}]"]
   ["datastar" "Datastar" "html"
    "<ty-textarea data-signals=\"{text: '', error: ''}\" data-bind=\"text\"
  data-attr:error=\"$error\"
  data-on:change=\"@post('/save')\">
</ty-textarea>"]])

(defn view []
  (component-page
   {:title "Textarea"
    :group "Text input"
    :tag "ty-textarea"
    :description "Multi-line text that grows as you type, between the heights you set. Header and footer slots for toolbars and counters. Same label, error and sizes as Input."
    :chips [["Form-associated" "send"] ["Auto-resize" "move-vertical"] ["TyTextarea (React)" "atom"]]
    :source "packages/core/src/components/textarea.ts"
    :mark "¶"
    :demo (let [v (or (doc-state :comment) "Nice work on the calendar. The month view is much faster to use.")
                n (count v)]
            [:div {:style {:width "340px"}}
             [:ty-textarea {:label "Comment" :size "md" :value v :min-height "160px" :max-height "160px"
                            :on {:input #(set-doc! :comment (.. % -detail -value))}}
              (footer-bar :left [:span.text-xs {:class (if (> n 280) "ty-text-danger" "ty-text--")} (str n " / 280")]
                          :button [:ty-button {:size "sm" :flavor "primary" :disabled (when (> n 280) "")}
                                   [:ty-icon {:slot "start" :name "send"}] "Post"])]])}

   (playground
    {:id :textarea
     :defaults {:size "md" :resize "none" :required false :disabled false :error false}
     :controls [{:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :resize :options ["none" "vertical" "both"]}
                {:key :required :switch? true}
                {:key :disabled :switch? true}
                {:key :error :switch? true}]
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Character counter"
       :span 4
       :description [:span "Count in the " [:code "footer"] " slot, and set " [:code "error"] " when it runs over."]
       :tabs counter-snippets}
      (let [v (or (doc-state :note) "Shipped the new calendar today. Month view, keyboard years, and a cleaner selected day.")
            n (count v)
            over? (> n limit)]
        [:ty-textarea {:label "Status update"
                       :value v
                       :error (if over? (str (- n limit) " characters over") "")
                       :on {:input #(set-doc! :note (.. % -detail -value))}}
         (footer-bar :left [:span.text-xs {:class (if over? "ty-text-danger" "ty-text--")} (str n " / " limit)]
                     :button [:ty-button {:size "sm" :flavor "primary" :disabled (when over? "")} "Post"])]))

     (example
      {:title "Sizes"
       :span 2
       :description "The field ladder, from xs to xl."
       :code "size=\"xs | sm | md | lg | xl\""}
      [:div.flex.flex-col.gap-3.w-full
       (for [s ["xs" "md" "xl"]]
         [:ty-textarea {:replicant/key s :size s :rows "1" :placeholder (str "size=\"" s "\"")}])])

     (example
      {:title "Grows with the text"
       :span 3
       :description [:span "No scrollbar until " [:code "max-height"] ". Below " [:code "min-height"] " it never shrinks."]
       :code "<ty-textarea min-height=\"80px\"
  max-height=\"200px\">
</ty-textarea>"}
      [:ty-textarea {:label "Notes" :min-height "80px" :max-height "200px" :value long-text}])

     (example
      {:title "Header & footer"
       :span 3
       :description [:span "Slots sit inside the border, split by a divider. Empty slots take no space."]
       :code "<ty-textarea>
  <div slot=\"header\">To: design</div>
  <div slot=\"footer\">…</div>
</ty-textarea>"}
      [:ty-textarea {:placeholder "Write a reply…" :rows "2"}
       [:div.flex.items-center.gap-2.text-xs.ty-text- {:slot "header"}
        "To:" [:ty-tag {:size "xs"} "design"] [:ty-tag {:size "xs"} "eng"]]
       (footer-bar :left (for [i ["paperclip" "smile" "at-sign"]]
                           [:ty-button {:replicant/key i :action "" :size "xs" :appearance "ghost" :aria-label i}
                            [:ty-icon {:name i}]])
                   :button [:ty-button {:size "sm" :flavor "primary"} "Reply"])])

     (example
      {:title "With an HTML form"
       :span 6
       :description [:span "Set " [:code "name"] " and the text is in FormData. " [:code "required"] ", "
                     [:code "minlength"] " and " [:code "maxlength"] " block submission and show their message under the field; typing stops at "
                     [:code "maxlength"] ". " [:code "too-short-message"] " / " [:code "too-long-message"] " set the wording."]
       :tabs form-snippets}
      (let [sent (doc-state :sent)]
        [:form.flex.flex-col.gap-4.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (set-doc! :sent (.get (js/FormData. (.-target e)) "feedback")))}}
         [:div.flex.items-end.gap-3
          [:ty-textarea {:name "feedback" :label "Feedback" :required "" :rows "2"
                         :minlength "20" :maxlength "500"
                         :too-short-message "At least {minlength} characters ({length} so far)"
                         :value "The new calendar is great." :style {:flex "1"}}]
          [:ty-button {:size "md" :flavor "primary"} "Send"]]
         [:code.ty-text-.text-xs (if sent (str "FormData: feedback=" (pr-str sent)) "Press Send. Cut the text below 20 characters first to see minlength at work.")]]))

     (example
      {:title "JavaScript API"
       :tabs api-snippets}
      nil)))

   (page-section
    {:title "Theming" :sub "Shares the field tokens with ty-input." :dark? true}
    (example
     {:title "Field tokens"
      :side? true
      :lang "css"
      :description [:span "The " [:code "--ty-input-*"] " tokens style every field. Set them once and inputs and textareas match."]
      :code ".composer {
  --ty-input-bg: #1c1410;
  --ty-input-border: #7c2d12;
  --ty-input-border-focus: #fb923c;
  --ty-input-shadow-focus: #fb923c40;
  --ty-textarea-divider: #7c2d12;
}"}
     [:div.flex.flex-col.gap-3 {:style {:width "100%" :max-width "340px"
                                         "--ty-input-bg" "#1c1410"
                                         "--ty-input-border" "#7c2d12"
                                         "--ty-input-border-hover" "#9a3412"
                                         "--ty-input-border-focus" "#fb923c"
                                         "--ty-input-shadow-focus" "#fb923c40"
                                         "--ty-textarea-divider" "#7c2d12"}}
      [:ty-input {:label "Subject" :value "Release notes"}]
      [:ty-textarea {:label "Body" :value "Month view, keyboard years, a cleaner selected day." :rows "2"}
       (footer-bar :left [:span.text-xs.ty-text-- "Draft saved"]
                   :button [:ty-button {:size "sm" :flavor "primary"} "Publish"])]]))

   (api-section
    {:properties validation-properties
     :attributes ["Value"
                  ["value" "string" "\"\"" "Current text."]
                  ["name" "string" "Form field name."]
                  ["placeholder" "string" "Hint shown while empty."]
                  "Label & state"
                  ["label" "string" "Label above the field."]
                  ["required" "boolean" "false" "Marks the label and blocks form submission while empty. The message shows on submit, or on blur once edited."]
                  ["minlength / maxlength" "number" "Character limits. Typing stops at maxlength; an empty value only fails required. Properties minLength / maxLength are -1 when unset, and a negative value removes the rule."]
                  ["too-short-message / too-long-message" "string" "Wording for the length messages. {minlength} {maxlength} {length} are filled in. Defaults: \"Use at least {minlength} characters (now {length})\" and \"Use at most {maxlength} characters (now {length})\". After the user types, too-short is the browser's own unless you set it."]
                  ["error" "string" "Message under the field. Empty string clears it. Validation never overwrites one you set."]
                  ["disabled" "boolean" "false" "Not editable, left out of the form."]
                  "Size & growth"
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl."]
                  ["rows" "number" "3" "Starting height in lines."]
                  ["cols" "number" "Width in characters, like the native attribute."]
                  ["min-height" "string" "Never shorter than this, e.g. 80px."]
                  ["max-height" "string" "Grows up to this, then scrolls."]
                  ["resize" "string" "\"none\"" "Manual resize handle: none, vertical, horizontal or both."]]
     :events [["input" "{value, originalEvent}" "Every edit."]
              ["change" "{value, originalEvent}" "On blur, if the value changed since focus (like native)."]]
     :slots [["header" "Inside the border, above the text: recipients, a title."]
             ["footer" "Inside the border, below the text: counter, actions."]]
     :css-vars [["--ty-input-bg / -color / -placeholder" "Shared with ty-input."]
                ["--ty-input-border / -focus" "Border and focus border."]
                ["--ty-input-shadow-focus" "Focus ring."]
                ["--ty-textarea-divider" "Line between header, text and footer."]]})))
