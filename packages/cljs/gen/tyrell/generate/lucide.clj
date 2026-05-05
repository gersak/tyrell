(ns tyrell.generate.lucide
  (:require
    [clojure.data.json :as json]
    [clojure.java.io :as io]
    [clojure.java.shell :as sh]
    [clojure.pprint :refer [pprint]]
    [clojure.string :as str]
    [clojure.xml :as xml]
    [tyrell.generate.util :refer [list-files file-name ext]]))


(def root ".icons/")


(defn ensure-root
  []
  (io/make-parents ".icons/README.md"))


(defn clone-repo
  []
  (sh/sh
    "git" "clone" "https://github.com/lucide-icons/lucide.git"
    (str root "/" "lucide")))


(defn clean-repo
  []
  (sh/sh "rm" "-r" (str root "/lucide")))


(defn list-images
  "List SVG files for Lucide icons.
   Lucide structure: icons/*.svg"
  []
  (let [base-path (str root "lucide/icons")
        files (when (.exists (io/file base-path))
                (list-files base-path))]
    (for [file files
          :when (str/ends-with? file ".svg")]
      (str base-path "/" file))))


(defn read-icon-metadata
  "Read the JSON metadata for an icon"
  [svg-path]
  (let [json-path (str/replace svg-path #"\.svg$" ".json")]
    (when (.exists (io/file json-path))
      (try
        (json/read-str (slurp json-path) :key-fn keyword)
        (catch Exception e
          (println "Error reading" json-path ":" (.getMessage e))
          nil)))))


(defn process-svg
  "Process SVG file and convert to a def with the icon name.
   Adds stroke-width, stroke, and fill attributes to the SVG element."
  [path]
  (let [xml-data (xml/parse (str path))
        ;; Update SVG attributes
        modified-xml xml-data #_(update xml-data :attrs merge
                                        {:stroke-width "0"
                                         :stroke "currentColor"
                                         :fill "currentColor"})
        ;; Extract icon name from filename
        icon-name (-> path
                      file-name
                      name
                      (str/replace #"\.svg$" ""))
        ;; Convert to valid Clojure symbol
        icon-symbol (-> icon-name
                        (as-> name (if (re-find #"^\d" name)
                                     (str "_" name)
                                     name)))
        ;; Get metadata including aliases
        metadata (read-icon-metadata path)
        svg-content (with-out-str (xml/emit modified-xml))
        ;; Create main def
        main-def `(def ~(symbol icon-symbol) ~svg-content)
        ;; Create alias defs if they exist
        alias-defs (when-let [aliases (:aliases metadata)]
                     (for [{:keys [name]} aliases] ; Only include non-deprecated aliases
                       `(def ~(symbol name) ~(symbol icon-symbol))))]
    ;; Return main def and any alias defs
    (doall (cons main-def alias-defs))))


(defn process-svg-with-comments
  "Process SVG and add comments with metadata"
  [path]
  (let [metadata (read-icon-metadata path)
        defs (process-svg path)
        main-def (first defs)
        alias-defs (rest defs)
        icon-name (-> path file-name name (str/replace #"\.svg$" ""))

        ;; Create comment with tags if they exist
        comment-str (when metadata
                      (str ";; " icon-name
                           (when-let [tags (:tags metadata)]
                             (str " - tags: " (str/join ", " tags)))
                           (when-let [categories (:categories metadata)]
                             (str " - categories: " (str/join ", " categories)))))]
    (if comment-str
      (cons comment-str defs)
      defs)))


(defn reserved-symbols
  "Get Clojure reserved symbols that need to be excluded from namespace"
  []
  ;; Common Clojure core symbols that might conflict
  ['map 'filter 'remove 'list 'first 'last 'take 'drop 'sort
   'repeat 'reverse 'shuffle 'update 'merge 'select 'print
   'read 'eval 'load 'import 'refer 'require 'use 'compile
   'send 'agent 'atom 'ref 'var 'set 'get 'find 'key 'val
   'keys 'vals 'count 'empty 'seq 'cons 'conj 'assoc 'dissoc
   'reduce 'apply 'partial 'comp 'identity 'constantly
   'divide 'replace 'cat
   'type 'hash 'name 'import 'tag])


(defn generate-lucide
  []
  (let [icons (list-images)
        processed-icons (mapcat process-svg icons)
        ;; Extract symbol names to check for conflicts
        icon-symbols (mapcat (fn [form]
                               (when (and (seq? form) (= 'def (first form)))
                                 [(second form)]))
                             processed-icons)
        conflicts (set (filter (set (reserved-symbols)) icon-symbols))]
    (str/join
      "\n\n"
      (map
        #(if (string? %)
           % ; Keep comments as-is
           (with-out-str (pprint %)))
        (concat
          [`(~'ns ~'tyrell.lucide
                  ~(when (seq conflicts)
                     `(:refer-clojure :exclude ~(vec conflicts))))]
          processed-icons)))))


(defn generate-with-metadata
  "Generate icons with metadata comments"
  []
  (let [icons (list-images)
        processed-icons (mapcat process-svg-with-comments icons)
        ;; Extract symbol names (skip comments)
        icon-symbols (mapcat (fn [form]
                               (when (and (seq? form) (= 'def (first form)))
                                 [(second form)]))
                             (filter seq? processed-icons))
        conflicts (set (filter (set (reserved-symbols)) icon-symbols))]
    (str/join
      "\n\n"
      (concat
        [(with-out-str
           (pprint `(~'ns ~'tyrell.lucide
                          ~(when (seq conflicts)
                             `(:refer-clojure :exclude ~(vec conflicts))))))]
        (map #(if (string? %)
                %
                (with-out-str (pprint %)))
             processed-icons)))))


(defn generate
  []
  (let [target "gen/ty/lucide.cljc"]
    (println "Generating Lucide icons to" target)
    (io/make-parents target)
    (let [icons (list-images)]
      (println "Found" (count icons) "icons")
      (when (seq icons)
        (spit target (generate-lucide))))))


(comment
  ;; Test individual functions
  (ensure-root)
  (clone-repo)

  ;; Check available icons
  (count (list-images))

  ;; Test metadata reading
  (read-icon-metadata (str root "lucide/icons/ellipsis-vertical.svg"))
  (read-icon-metadata (str root "lucide/icons/x.svg"))

  ;; Test processing with metadata
  (process-svg-with-comments (str root "lucide/icons/ellipsis-vertical.svg"))

  ;; Generate all icons
  (generate)

  (spit "gen/ty/lucide.cljs" (generate-with-metadata))

  ;; Generate with metadata comments
  (spit "gen/ty/lucide-with-metadata.cljs" (generate-with-metadata))

  ;; Clean up
  (clean-repo))
