(ns tyrell.generate.material
  (:require
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
    "git" "clone" "https://github.com/google/material-design-icons.git"
    (str root "/" "material")))

(defn clean-repo
  []
  (sh/sh "rm" "-r" (str root "/material")))

(defn list-images
  "List SVG files for a given style. 
   Material icons are organized differently than Font Awesome:
   - Path: material-design-icons/src/[category]/[icon_name]/materialicons[style]/24px.svg
   - Styles: '' (filled), 'outlined', 'round', 'sharp', 'twotone'"
  [style]
  (let [style-suffix (case style
                       "filled" ""
                       "outlined" "outlined"
                       "round" "round"
                       "sharp" "sharp"
                       "two-tone" "twotone"
                       "")
        base-path (str root "material/src")
        categories (list-files base-path)]
    (for [category categories
          :when (not= category ".DS_Store")
          :let [category-path (str base-path "/" category)
                icons (list-files category-path)]
          icon icons
          :when (not= icon ".DS_Store")
          :let [icon-path (str category-path "/" icon "/materialicons" style-suffix "/24px.svg")
                file (io/file icon-path)]
          :when (.exists file)]
      icon-path)))

(comment
  (ensure-root)
  (list-images "filled")
  (take 5 (list-images "outlined")))

(defn process-svg
  "Process SVG file and convert to a def with the icon name.
   Adds stroke-width, stroke, and fill attributes to the SVG element."
  [path]
  (let [xml-data (xml/parse (str path))
        ;; Update SVG attributes
        modified-xml (update xml-data :attrs merge
                             {:stroke-width "0"
                              :stroke "currentColor"
                              :fill "currentColor"})
        ;; Extract icon name from path: .../[icon_name]/materialicons.../24px.svg
        path-parts (str/split path #"/")
        icon-name (nth path-parts (- (count path-parts) 3))
        ;; Convert icon name to valid Clojure symbol (e.g., "3d_rotation" -> "_3d-rotation")
        icon-symbol (-> icon-name
                        (str/replace "_" "-")
                        (as-> name (if (re-find #"^\d" name)
                                     (str "_" name)
                                     name)))]
    `(def ~(symbol icon-symbol) ~(with-out-str (xml/emit modified-xml)))))

(defn reserved-symbols
  "Get Clojure reserved symbols that need to be excluded from namespace"
  [style]
  ;; Add common Clojure core symbols that might conflict with icon names
  ;; This list can be expanded as needed
  ['map 'filter 'remove 'list 'first 'last 'take 'drop 'sort
   'repeat 'reverse 'shuffle 'update 'merge 'select 'print
   'read 'eval 'load 'import 'refer 'require 'use 'compile
   'send 'agent 'atom 'ref 'var 'set 'get 'find 'key 'val
   'keys 'vals 'count 'empty 'seq 'cons 'conj 'assoc 'dissoc
   'reduce 'apply 'partial 'comp 'identity 'constantly 'loop
   'compare 'comment])

(defn generate-material
  [style]
  (let [icons (list-images style)
        processed-icons (map process-svg icons)
        ;; Extract symbol names to check for conflicts
        icon-symbols (map (fn [form]
                            (when (and (seq? form) (= 'def (first form)))
                              (second form)))
                          processed-icons)
        conflicts (set (filter (set (reserved-symbols style)) icon-symbols))]
    (str/join
      "\n\n"
      (map
        #(with-out-str (pprint %))
        (concat
          [`(~'ns ~(symbol (str "tyrell.material." style))
                  ~(when (seq conflicts)
                     `(:refer-clojure :exclude ~(vec conflicts))))]
          processed-icons)))))

(defn generate
  []
  (let [styles ["filled" "outlined" "round" "sharp" "two-tone"]]
    (doseq [style styles
            :let [target (str "gen/ty/material/" style ".cljc")]]
      (println "Generating" style "icons to" target)
      (io/make-parents target)
      (let [icons (list-images style)]
        (println "Found" (count icons) style "icons")
        (when (seq icons)
          (spit target (generate-material style)))))))

(comment
  ;; Test individual functions
  (ensure-root)
  (clone-repo)

  ;; Check if repo exists and list some icons
  (take 5 (list-images "filled"))
  (take 5 (list-images "outlined"))

  ;; Generate all icon sets
  (generate)

  ;; Clean up
  (clean-repo))
