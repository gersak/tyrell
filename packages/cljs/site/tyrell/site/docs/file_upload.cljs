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
     ;; @post with contentType 'form' sends the enclosing form; only with
     ;; enctype multipart are the files themselves sent (else "[object File]").
     :datastar [(into [:form {:enctype "multipart/form-data"
                              :data-on:submit "@post('/upload', {contentType: 'form'})"}]
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

(def ^:private read-snippets
  "Read what was picked: change carries the File objects."
  [["html" "HTML" "html"
    "<ty-file-upload id=\"upload\" multiple></ty-file-upload>

<script>
  document.getElementById('upload').addEventListener('change', (e) => {
    const { files, names } = e.detail;
    const total = files.reduce((n, f) => n + f.size, 0);
  });
</script>"]
   ["react" "React" "javascript"
    "import { TyFileUpload } from 'tyrell-react'

<TyFileUpload multiple onChange={(e) => {
  const { files, names } = e.detail
  setTotal(files.reduce((n, f) => n + f.size, 0))
}} />"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/FileUpload {:multiple true
                  :on-change #(->> (.. % -detail -files)
                                   (map (fn [f] (.-size f)))
                                   (reduce +)
                                   (reset! total))}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-file-upload {:multiple \"\"
                  :on {:change #(->> (.. % -detail -files)
                                     (map (fn [f] (.-size f)))
                                     (reduce +)
                                     (set-total!))}}]"]
   ["datastar" "Datastar" "html"
    "<ty-file-upload multiple data-signals:total=\"0\"
  data-on:change=\"$total = evt.detail.files.reduce((n, f) => n + f.size, 0)\">
</ty-file-upload>"]])

(def ^:private size-limit-snippets
  "Size limit: check in change, set error."
  [["html" "HTML" "html"
    "<ty-file-upload id=\"receipt\" label=\"Receipt (max 2 MB)\"></ty-file-upload>

<script>
  const MAX = 2 * 1024 * 1024;
  const receipt = document.getElementById('receipt');
  receipt.addEventListener('change', (e) => {
    const big = e.detail.files.find((f) => f.size > MAX);
    receipt.error = big ? `${big.name} is over 2 MB` : '';
  });
</script>"]
   ["react" "React" "javascript"
    "import { TyFileUpload } from 'tyrell-react'

const MAX = 2 * 1024 * 1024

<TyFileUpload label=\"Receipt (max 2 MB)\" error={error}
  onChange={(e) => {
    const big = e.detail.files.find((f) => f.size > MAX)
    setError(big ? `${big.name} is over 2 MB` : '')
  }} />"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

(def max-bytes (* 2 1024 1024))

[:> ty/FileUpload
 {:label \"Receipt (max 2 MB)\" :error @error
  :on-change #(let [big (some (fn [f] (when (> (.-size f) max-bytes) f))
                              (.. % -detail -files))]
                (reset! error (if big (str (.-name big) \" is over 2 MB\") \"\")))}]"]
   ["replicant" "Replicant" "clojure"
    "(def max-bytes (* 2 1024 1024))

[:ty-file-upload
 {:label \"Receipt (max 2 MB)\" :error error
  :on {:change #(let [big (some (fn [f] (when (> (.-size f) max-bytes) f))
                                (.. % -detail -files))]
                  (set-error! (if big (str (.-name big) \" is over 2 MB\") \"\")))}}]"]
   ["datastar" "Datastar" "html"
    "<ty-file-upload label=\"Receipt (max 2 MB)\"
  data-on:change=\"el.error = evt.detail.files.some((f) => f.size > 2 * 1024 * 1024)
    ? 'A file is over 2 MB' : ''\">
</ty-file-upload>"]])

(def ^:private api-snippets
  "Properties, form reset and the change event."
  [["html" "HTML" "html"
    "<ty-file-upload id=\"upload\" multiple></ty-file-upload>

<script>
  const upload = document.getElementById('upload');

  upload.files;                 // File[] currently listed (read-only)
  upload.error = 'Upload failed, try again';
  upload.form?.reset();         // clear the list the way a form does

  upload.addEventListener('change', async (e) => {
    const body = new FormData();
    e.detail.files.forEach((f) => body.append('files', f));
    await fetch('/upload', { method: 'POST', body });
  });
</script>"]
   ["react" "React" "javascript"
    "import { useRef } from 'react'
import { TyFileUpload } from 'tyrell-react'

const upload = useRef(null)     // upload.current.files: File[] listed

<TyFileUpload ref={upload} multiple error={error}
  onChange={async (e) => {
    const body = new FormData()
    e.detail.files.forEach((f) => body.append('files', f))
    await fetch('/upload', { method: 'POST', body })
  }} />"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:> ty/FileUpload
 {:multiple true :error @error
  :ref #(reset! upload %)        ; (.-files @upload): File[] listed
  :on-change (fn [e]
               (let [body (js/FormData.)]
                 (doseq [f (.. e -detail -files)] (.append body \"files\" f))
                 (js/fetch \"/upload\" #js {:method \"POST\" :body body})))}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-file-upload
 {:multiple \"\" :error error
  :replicant/on-mount (fn [{:replicant/keys [node]}] (reset! upload node))
  :on {:change (fn [e]
                 (let [body (js/FormData.)]
                   (doseq [f (.. e -detail -files)] (.append body \"files\" f))
                   (js/fetch \"/upload\" #js {:method \"POST\" :body body})))}}]"]
   ["datastar" "Datastar" "html"
    "<form enctype=\"multipart/form-data\"
  data-on:change=\"@post('/upload', {contentType: 'form'})\">
  <ty-file-upload name=\"files\" multiple data-ref:_upload></ty-file-upload>
</form>
<!-- $_upload.files: File[] listed; $_upload.error = '…' shows an error.
     The _ keeps the element out of the signals sent to the server. -->"]])

(def ^:private form-snippets
  "Required in a form, one tab per stack."
  [["html" "HTML" "html"
    "<form action=\"/apply\" method=\"post\" enctype=\"multipart/form-data\">
  <ty-file-upload name=\"cv\" label=\"CV\" accept=\".pdf\" required></ty-file-upload>
  <ty-button flavor=\"primary\">Apply</ty-button>
</form>"]
   ["react" "React" "javascript"
    "import { TyFileUpload, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <TyFileUpload name=\"cv\" label=\"CV\" accept=\".pdf\" required />
  <TyButton flavor=\"primary\">Apply</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:> ty/FileUpload {:name \"cv\" :label \"CV\" :accept \".pdf\" :required true}]
 [:> ty/Button {:flavor \"primary\"} \"Apply\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:ty-file-upload {:name \"cv\" :label \"CV\" :accept \".pdf\" :required \"\"}]
 [:ty-button {:flavor \"primary\"} \"Apply\"]]"]
   ["datastar" "Datastar" "html"
    "<form enctype=\"multipart/form-data\"
  data-on:submit__prevent=\"@post('/apply', {contentType: 'form'})\">
  <ty-file-upload name=\"cv\" label=\"CV\" accept=\".pdf\" required></ty-file-upload>
  <ty-button flavor=\"primary\">Apply</ty-button>
</form>"]])

(defn view []
  (component-page
   {:title "File Upload"
    :group "Text input"
    :tag "ty-file-upload"
    :description "A drop zone that is also a picker. Click, press Enter or drop files. Filters by accept, lists what you chose, and submits real files with its form."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyFileUpload (React)" "atom"]]
    :source "packages/core/src/components/file-upload.ts"
    :mark "↑"
    ;; The file list grows with each pick: past the empty field's height it scrolls.
    :demo [:div {:style {:width "340px"}}
           [:ty-scroll-container {:max-height "243px" :style {:height "243px"}}
            [:ty-file-upload {:label "Attachments" :multiple "" :accept ".pdf,image/*"}]]]}

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
       :tabs read-snippets}
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
       :tabs size-limit-snippets}
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
       :tabs form-snippets}
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
       :tabs api-snippets}
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
