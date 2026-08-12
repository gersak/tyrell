(ns tyrell.site.docs.file-upload
  "Documentation for ty-file-upload component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-file-upload"
                     "Drop zone + file picker primitive. Replaces <input type=\"file\"> with a styleable, drag-and-drop-capable equivalent that works in any framework.")

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
        :description "Form field name — used as the key in FormData on submit"}
       {:name "multiple"
        :type "boolean"
        :default "false"
        :description "Allow selecting more than one file at a time"}
       {:name "accept"
        :type "string"
        :default "-"
        :description "File type filter passed to the underlying file input, e.g. \"image/*\" or \".pdf,.docx\""}
       {:name "label"
        :type "string"
        :default "-"
        :description "Label rendered above the drop zone"}
       {:name "placeholder"
        :type "string"
        :default "\"Drop files here or click to browse\""
        :description "Hint text shown inside the drop zone when no files are selected"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Disable interaction — drop zone is greyed out and non-interactive"}
       {:name "required"
        :type "boolean"
        :default "false"
        :description "Marks the field as required; shows an asterisk next to the label"}
       {:name "error"
        :type "string"
        :default "-"
        :description "Error message rendered below the drop zone; also applies danger border styling"}])]

    [:div
     (section-label "Events")
     (event-table
      [{:name "change"
        :payload "{value: File[], files: File[], names: string[]}"
        :when-fired "Fires when the selection changes — after browsing, drag-drop, or removing a file"}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Click the drop zone to open a file dialog, or drag files directly onto it."]
       (demo-area
        [:ty-file-upload {:label "Upload file"
                          :name "file"
                          :style {:max-width "480px"}}])
       (code-block "<ty-file-upload name=\"file\" label=\"Upload file\"></ty-file-upload>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Multiple Files")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Add " [:code "multiple"] " to let the user select or drop several files at once."
        " Each file shows its name, size, and a remove button."]
       (demo-area
        [:ty-file-upload {:label "Attachments"
                          :name "attachments"
                          :multiple ""
                          :style {:max-width "480px"}}])
       (code-block "<ty-file-upload name=\"attachments\" label=\"Attachments\" multiple></ty-file-upload>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Accept Filter")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "The " [:code "accept"] " attribute restricts the file dialog and shows a hint in the drop zone."]
       (demo-area
        [:div.flex.flex-col.gap-4 {:style {:max-width "480px"}}
         [:ty-file-upload {:label "Profile photo"
                           :name "avatar"
                           :accept "image/*"}]
         [:ty-file-upload {:label "Resume"
                           :name "resume"
                           :accept ".pdf,.doc,.docx"}]])
       (code-block "<ty-file-upload name=\"avatar\" label=\"Profile photo\" accept=\"image/*\"></ty-file-upload>
<ty-file-upload name=\"resume\" label=\"Resume\" accept=\".pdf,.doc,.docx\"></ty-file-upload>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Validation State")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "error"] " to show a validation message and apply danger styling to the border."]
       (demo-area
        [:ty-file-upload {:label "Contract"
                          :name "contract"
                          :required ""
                          :error "Please upload your signed contract to proceed."
                          :style {:max-width "480px"}}])
       (code-block "<ty-file-upload
  name=\"contract\"
  label=\"Contract\"
  required
  error=\"Please upload your signed contract to proceed.\">
</ty-file-upload>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Disabled")
       (demo-area
        [:ty-file-upload {:label "ID document"
                          :name "id"
                          :disabled ""
                          :style {:max-width "480px"}}])
       (code-block "<ty-file-upload name=\"id\" label=\"ID document\" disabled></ty-file-upload>")]])

   (doc-section "Form Integration"
     [:div.space-y-5

      [:div.ty-content.rounded-lg.p-5
       (section-label "With HTML Form")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Fully form-associated — files appear in "
        [:code "FormData"]
        " on submit. "
        [:code "form.reset()"]
        " clears the selection."]
       (demo-area
        [:form.space-y-4 {:style {:max-width "480px"}
                          :on {:submit (fn [e]
                                        (.preventDefault e)
                                        (let [upload (.querySelector (.-target e) "ty-file-upload")
                                              names  (map #(.-name %) (.-files upload))
                                              msg    (str "Files: " (.join (into-array names) ", "))]
                                          (js/alert msg)))}}
         [:ty-file-upload {:label "Attachment"
                           :name "attachment"
                           :multiple ""}]
         [:div.flex.gap-2
          [:ty-button {:type "submit" :flavor "primary"} "Submit"]
          [:ty-button {:type "reset" :flavor "neutral"} "Reset"]]])
       (code-block "<form>
  <ty-file-upload name=\"attachment\" label=\"Attachment\" multiple></ty-file-upload>
  <ty-button type=\"submit\" flavor=\"primary\">Submit</ty-button>
  <ty-button type=\"reset\" flavor=\"neutral\">Reset</ty-button>
</form>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const upload = document.querySelector('ty-file-upload');

// Read selected files
console.log(upload.files);  // File[]

// Listen for selection changes
upload.addEventListener('change', (e) => {
  console.log(e.detail.files);   // File[]
  console.log(e.detail.names);   // ['photo.jpg', 'doc.pdf']
});

// Form reset clears selection
document.querySelector('form').reset();" "javascript")]])
))
