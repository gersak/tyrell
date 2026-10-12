(ns tyrell.site.docs.file-upload
  "Documentation for ty-file-upload component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private lineup
  "Playground stage: a single-image picker and a multi-file drop zone."
  [{:label "Avatar" :accept "image/*" :placeholder "Drop an image or click to browse"}
   {:label "Attachments" :multiple? true}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [required disabled error]}]
  (cond-> {}
    required (assoc :required true)
    disabled (assoc :disabled true)
    error (assoc :error "File is too large")))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (for [{:keys [label accept placeholder multiple?]} lineup]
       [:ty-file-upload (merge {:label label :multiple multiple? :accept accept :placeholder placeholder} attrs
                               {:jsx/onChange "{(e) => setFiles(e.detail.files)}"})])
     ;; @post with contentType 'form' sends the enclosing form as multipart,
     ;; files included, so the Datastar tab needs the <form> around them.
     :datastar [(into [:form {:data-on:submit "@post('/upload', {contentType: 'form'})"}]
                      (concat
                       (for [{:keys [label accept placeholder multiple?]} lineup]
                         [:ty-file-upload (merge {:name (snippets/slug label) :label label :multiple multiple?
                                                  :accept accept :placeholder placeholder} attrs)])
                       [[:ty-button {:type "submit" :flavor "primary"} "Upload"]]))])))

(defn- render-lineup [{:keys [required disabled error]}]
  (let [base (cond-> {}
               required (assoc :required "")
               disabled (assoc :disabled "")
               error (assoc :error "File is too large"))]
    [:div.flex.flex-col.gap-5 {:style {:width "100%" :max-width "420px"}}
     (for [{:keys [label accept placeholder multiple?]} lineup]
       [:ty-file-upload (cond-> (assoc base :replicant/key label :label label)
                          multiple? (assoc :multiple "")
                          accept (assoc :accept accept)
                          placeholder (assoc :placeholder placeholder))])]))

;; Interactive examples -------------------------------------------------------

(defn- doc-state [k] (get-in @state/state [:upload-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:upload-doc k] v))

(defn- human-size [bytes]
  (cond (< bytes 1024) (str bytes " B")
        (< bytes 1048576) (str (.toFixed (/ bytes 1024) 1) " KB")
        :else (str (.toFixed (/ bytes 1048576) 1) " MB")))

(def ^:private max-bytes (* 2 1024 1024))

(defn view []
  (component-page
   {:title "File Upload"
    :group "Text input"
    :tag "ty-file-upload"
    :description "A drop zone that is also a picker. Click, press Enter or drop files. Filters by accept, lists what you chose, and submits real files with its form."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyFileUpload (React)" "atom"]]
    :source "packages/core/src/components/file-upload.ts"
    :mark "↑"
    :demo [:div {:style {:width "340px"}}
           [:ty-file-upload {:label "Attachments" :multiple "" :accept ".pdf,image/*"}]]}

   (playground
    {:id :file-upload
     :defaults {:required false :disabled false :error false}
     :controls [{:key :required :switch? true}
                {:key :disabled :switch? true}
                {:key :error :switch? true}]
     :sub "Try it with real files. Nothing leaves your browser."
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Read what was picked"
       :span 4
       :description [:span [:code "change"] " carries the " [:code "File"] " objects. Picking again replaces the list; the × on a row removes one."]
       :code "upload.addEventListener('change', (e) => {
  const { files, names } = e.detail;
  const total = files.reduce((n, f) => n + f.size, 0);
});"}
      (let [picked (doc-state :picked)]
        [:div.flex.flex-col.gap-3.w-full
         [:ty-file-upload {:multiple ""
                           :on {:change (fn [^js e]
                                          (set-doc! :picked (vec (for [^js f (.. e -detail -files)]
                                                                   [(.-name f) (.-size f)]))))}}]
         [:code.ty-text-.text-xs
          (if (seq picked)
            (str (count picked) " file" (when (not= 1 (count picked)) "s") " · "
                 (human-size (reduce + (map second picked))))
            "Pick a few files.")]]))

     (example
      {:title "Accept"
       :span 2
       :description "Same syntax as the native input. Dropped files are filtered too, not only the picker."
       :code "<ty-file-upload
  accept=\".pdf,image/*\">
</ty-file-upload>"}
      [:ty-file-upload {:accept ".pdf,image/*" :placeholder "PDF or image"}])

     (example
      {:title "Size limit"
       :span 3
       :description [:span "No built-in limit: check in " [:code "change"] " and set " [:code "error"] "."]
       :code "const MAX = 2 * 1024 * 1024;

upload.addEventListener('change', (e) => {
  const big = e.detail.files
    .find((f) => f.size > MAX);
  upload.error = big
    ? `${big.name} is over 2 MB`
    : '';
});"}
      (let [err (doc-state :size-error)]
        [:ty-file-upload {:label "Receipt (max 2 MB)"
                          :error (or err "")
                          :on {:change (fn [^js e]
                                         (let [big (some #(when (> (.-size ^js %) max-bytes) %) (.. e -detail -files))]
                                           (set-doc! :size-error (when big (str (.-name ^js big) " is over 2 MB")))))}}]))

     (example
      {:title "Required in a form"
       :span 3
       :description [:span "With " [:code "name"] " the files are in FormData. " [:code "required"]
                     " blocks submission while nothing is picked."]
       :code "<form>
  <ty-file-upload name=\"cv\" required>
  </ty-file-upload>
  <ty-button size=\"md\">Apply</ty-button>
</form>"}
      (let [status (doc-state :status)]
        [:form.flex.flex-col.gap-3.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (let [files (.getAll (js/FormData. (.-target e)) "cv")]
                           (set-doc! :status (str "Sent: cv=" (str/join ", " (map #(.-name ^js %) files))))))}}
         [:ty-file-upload {:name "cv" :label "CV" :required "" :accept ".pdf"
                           :on {:invalid #(set-doc! :status "Blocked: no file picked")}}]
         [:div.flex.items-center.gap-3
          [:ty-button {:size "md" :flavor "primary"} "Apply"]
          [:code.ty-text-.text-xs (or status "Press Apply first with nothing picked.")]]]))

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const upload = document.querySelector('ty-file-upload');

upload.files;                 // File[] currently listed (read-only)
upload.multiple = true;
upload.error = 'Upload failed, try again';

// clear the list the way a form does
upload.form?.reset();

upload.addEventListener('change', async (e) => {
  const body = new FormData();
  e.detail.files.forEach((f) => body.append('files', f));
  await fetch('/upload', { method: 'POST', body });
});"}
      nil)))

   (page-section
    {:title "Theming" :sub "Rides the field tokens." :dark? true}
    (example
     {:title "Field and accent tokens"
      :side? true
      :lang "css"
      :description [:span "Hover and focus follow " [:code "--ty-input-*"] ". The drag-over state uses the primary color."]
      :code ".dropbox ty-file-upload {
  --ty-input-border-hover: #0f766e;
  --ty-input-border-focus: #2dd4bf;
  --ty-input-shadow-focus: #2dd4bf40;
  --ty-color-primary: #2dd4bf;
  --ty-bg-primary-: #0c1f1d;
}"}
     [:div {:style {:width "100%" :max-width "340px"}}
      [:ty-file-upload {:label "Dataset" :accept ".csv"
                        :style {"--ty-input-border-hover" "#0f766e"
                                "--ty-input-border-focus" "#2dd4bf"
                                "--ty-input-shadow-focus" "#2dd4bf40"
                                "--ty-color-primary" "#2dd4bf"
                                "--ty-bg-primary-" "#0c1f1d"}}]]))

   (api-section
    {:attributes ["Files"
                  ["multiple" "boolean" "false" "Allow more than one file."]
                  ["accept" "string" "File types, like the native attribute: .pdf, image/*, text/csv. Also filters drops."]
                  ["name" "string" "Form field name. Each file is appended under it."]
                  "Label & state"
                  ["label" "string" "Label above the drop zone."]
                  ["placeholder" "string" "\"Drop files here or click to browse\"" "Text inside the drop zone."]
                  ["required" "boolean" "false" "Marks the label and blocks form submission until a file is picked."]
                  ["error" "string" "Message under the zone. Empty string clears it."]
                  ["disabled" "boolean" "false" "No picking, no dropping."]]
     :properties (into [["files" "File[]" "The listed files. Read-only; a form reset clears it."]
                        ["form" "HTMLFormElement | null" "The owning form."]]
                       validation-properties)
     :events [["change" "{files, names, value}" "The list changed: picked, dropped or a file removed. value is the same File[]."]]
     :keyboard [["Enter / Space" "Open the file picker."]
                ["Tab" "Focus the drop zone, then each remove button."]]
     :css-vars [["--ty-input-border-hover / -focus" "Drop zone border on hover and focus."]
                ["--ty-input-shadow-focus" "Focus ring."]
                ["--ty-color-primary / --ty-bg-primary-" "Drag-over border and fill."]]})))
