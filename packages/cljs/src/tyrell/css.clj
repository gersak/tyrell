(ns tyrell.css
  (:require [clojure.string :as str]))

;; =============================================================================
;; Macros for compile-time CSS loading
;; =============================================================================

(defn- resolve-css-path
  "Resolve CSS file path relative to namespace or as absolute resource path."
  [current-ns path]
  (let [ns-path (-> current-ns
                    (str/replace #"\." "/")
                    (str/replace #"-" "_"))]
    (if (str/includes? path "/")
      path
      (str ns-path "/" path))))

(defn- load-css-file
  "Load CSS file content at compile time from resources."
  [current-ns path]
  (let [full-path (resolve-css-path current-ns path)]
    (try
      (slurp (clojure.java.io/resource full-path))
      (catch Exception _
        (throw (ex-info (str "Cannot find CSS file: " full-path)
                        {:path full-path
                         :namespace current-ns}))))))

(defn- infer-css-filename
  "Infer CSS filename from namespace: my.app.button -> my/app/button.css"
  [current-ns]
  (str (-> current-ns
           (str/replace #"\." "/")
           (str/replace #"-" "_"))
       ".css"))

;; =============================================================================
;; defcss - Document-level styles (auto-inject or conditional)
;; =============================================================================

(defn- sanitize-css-id
  "Convert namespace/name to valid CSS identifier.
   Replaces . with _ and / with -- since these are invalid in CSS selectors."
  [id]
  (-> id
      (str/replace "." "_")
      (str/replace "/" "--")))

(defmacro defcss
  "Loads CSS file at compile time and injects into document head.

   Use this for document-level styles in Replicant, Reagent, or vanilla CLJS apps.

   Usage:
     (defcss app-styles \"app.css\")              ; auto-injects on load
     (defcss app-styles \"app.css\" :path \"custom/\")  ; custom resource path
     (defcss app-styles \"app.css\" :conditional true) ; returns fn, call to inject

   Options:
     :path        - Custom resource path prefix
     :conditional - If true, returns a function that injects when called

   Examples:
     ;; Auto-inject (default) - styles injected when namespace loads
     (ns my-app.core
       (:require-macros [tyrell.css :refer [defcss]]))

     (defcss app-styles \"app.css\")
     ;; Done! Styles are in document.head

     ;; Conditional - control when styles are injected
     (defcss theme-styles \"dark.css\" :conditional true)

     (defn apply-dark-mode! []
       (theme-styles))  ; injects when called"
  {:clj-kondo/lint-as 'clojure.core/def
   :clj-kondo/ignore [:uninitialized-var]}
  ([name path & {:keys [conditional] :as opts}]
   (let [;; Handle :path option
         custom-path (:path opts)
         resolved-path (if custom-path
                         (str custom-path path)
                         path)
         css-content (load-css-file (str *ns*) resolved-path)
         style-id (sanitize-css-id (str *ns* "/" name))]
     (if conditional
       ;; Conditional: define a function that injects when called
       `(def ~name
          (fn []
            (tyrell.css/ensure-document-styles! ~css-content ~style-id)))
       ;; Default: auto-inject on load
       `(do
          (def ~name ~css-content)
          (when (cljs.core/exists? js/document)
            (tyrell.css/ensure-document-styles! ~name ~style-id))))))
  ([name]
   `(defcss ~name ~(infer-css-filename (str *ns*)))))

;; =============================================================================
;; defstyles - CSSStyleSheet (for shadow DOM)
;; =============================================================================

(defmacro defstyles
  "Loads CSS file at compile time and returns a CSSStyleSheet object.

   Use this for shadow DOM styles in web components.
   Pair with ensure-styles! to apply to shadow root.

   Usage:
     (defstyles button-styles)                    ; looks for <namespace>.css
     (defstyles button-styles \"custom.css\")       ; custom filename in same dir
     (defstyles button-styles \"shared/base.css\")  ; path from resources root

   Example:
     (ns my-app.components.button
       (:require [tyrell.css :refer [ensure-styles!]]
                 [tyrell.shim :as shim])
       (:require-macros [tyrell.css :refer [defstyles]]))

     (defstyles button-styles \"button.css\")

     (defn render! [el]
       (let [shadow (shim/ensure-shadow el)]
         (ensure-styles! shadow button-styles \"my-button\")
         ...))"
  {:clj-kondo/lint-as 'clojure.core/def
   :clj-kondo/ignore [:uninitialized-var]}
  ([name]
   `(defstyles ~name ~(infer-css-filename (str *ns*))))
  ([name path]
   (let [css-content (load-css-file (str *ns*) path)]
     `(defonce ~name
        (let [sheet# (js/CSSStyleSheet.)]
          (.replaceSync sheet# ~css-content)
          sheet#)))))
