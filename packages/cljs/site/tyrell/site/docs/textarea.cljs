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

(defn view []
  (component-page
   {:title "Textarea"
    :group "Text input"
    :tag "ty-textarea"
    :description "Multi-line text that grows as you type, between the heights you set. Header and footer slots for toolbars and counters. Same label, error and sizes as Input."
    :chips [["Form-associated" "send"] ["Auto-resize" "move-vertical"] ["TyTextarea (React)" "atom"]]
    :source "packages/core/src/components/textarea.ts"
    :mark "¶"
    :demo [:div {:style {:width "340px"}}
           [:ty-textarea {:label "Comment" :size "md" :value "Nice work on the calendar. The month view is much faster to use."}
            (footer-bar :left [:span.text-xs.ty-text-- "62 / 280"]
                        :button [:ty-button {:size "sm" :flavor "primary"}
                                 [:ty-icon {:slot "start" :name "send"}] "Post"])]]}

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
       :code "note.addEventListener('input', (e) => {
  const n = e.detail.value.length;
  counter.textContent = `${n} / 140`;
  note.error = n > 140 ? 'Too long' : '';
});"}
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
       :description [:span "Set " [:code "name"] " and the text is in FormData. " [:code "required"]
                     " blocks submission while empty."]
       :code "<form>
  <ty-textarea name=\"feedback\" label=\"Feedback\" required></ty-textarea>
  <ty-button size=\"md\" flavor=\"primary\">Send</ty-button>
</form>
<!-- FormData: feedback=… -->"}
      (let [sent (doc-state :sent)]
        [:form.flex.flex-col.gap-4.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (set-doc! :sent (.get (js/FormData. (.-target e)) "feedback")))}}
         [:div.flex.items-end.gap-3
          [:ty-textarea {:name "feedback" :label "Feedback" :required "" :rows "2"
                         :value "The new calendar is great." :style {:flex "1"}}]
          [:ty-button {:size "md" :flavor "primary"} "Send"]]
         [:code.ty-text-.text-xs (if sent (str "FormData: feedback=" (pr-str sent)) "Press Send. Clear the text first to see required at work.")]]))

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const ta = document.querySelector('ty-textarea');

ta.value = 'Hello';
ta.error = '';                     // set a message to show it

// input on every edit; change on blur, if the value changed
ta.addEventListener('input', (e) => preview(e.detail.value));
ta.addEventListener('change', (e) => save(e.detail.value));"}
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
                  ["required" "boolean" "false" "Marks the label and blocks form submission while empty."]
                  ["error" "string" "Message under the field. Empty string clears it."]
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
