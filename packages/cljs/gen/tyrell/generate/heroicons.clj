(ns tyrell.generate.heroicons
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
    "git" "clone" "https://github.com/tailwindlabs/heroicons.git"
    (str root "/" "heroicons")))


(defn clean-repo
  []
  (sh/sh "rm" "-r" (str root "/heroicons")))


(defn list-images
  "List SVG files for a given style.
   Heroicons structure:
   - optimized/24/outline/*.svg (24x24 outline icons)
   - optimized/24/solid/*.svg (24x24 solid icons)
   - optimized/20/solid/*.svg (20x20 mini icons)
   - optimized/16/solid/*.svg (16x16 micro icons)"
  [style]
  (let [[size variant] (case style
                         "outline" ["24" "outline"]
                         "solid" ["24" "solid"]
                         "mini" ["20" "solid"]
                         "micro" ["16" "solid"])
        base-path (str root "heroicons/optimized/" size "/" variant)
        files (when (.exists (io/file base-path))
                (list-files base-path))]
    (for [file files
          :when (str/ends-with? file ".svg")]
      (str base-path "/" file))))


(comment
  (ensure-root)
  (list-images "outline")
  (take 5 (list-images "solid")))


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
                        ; (str/replace "-" "_") ; Heroicons uses hyphens, convert to underscores
                        (as-> name (if (re-find #"^\d" name)
                                     (str "_" name)
                                     name)))]
    `(def ~(symbol icon-symbol) ~(with-out-str (xml/emit modified-xml)))))


(defn reserved-symbols
  "Get Clojure reserved symbols that need to be excluded from namespace"
  [style]
  ;; Common Clojure core symbols that might conflict
  ['map 'filter 'remove 'list 'first 'last 'take 'drop 'sort
   'repeat 'reverse 'shuffle 'update 'merge 'select 'print
   'read 'eval 'load 'import 'refer 'require 'use 'compile
   'send 'agent 'atom 'ref 'var 'set 'get 'find 'key 'val
   'keys 'vals 'count 'empty 'seq 'cons 'conj 'assoc 'dissoc
   'divide 'replace 'cat
   'reduce 'apply 'partial 'comp 'identity 'constantly])


(defn generate-heroicons
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
          [`(~'ns ~(symbol (str "tyrell.heroicons." style))
                  ~(when (seq conflicts)
                     `(:refer-clojure :exclude ~(vec conflicts))))]
          processed-icons)))))


(defn generate
  []
  (let [styles ["outline" "solid" "mini" "micro"]]
    (doseq [style styles
            :let [target (str "gen/ty/heroicons/" style ".cljc")]]
      (println "Generating" style "icons to" target)
      (io/make-parents target)
      (let [icons (list-images style)]
        (println "Found" (count icons) style "icons")
        (when (seq icons)
          (spit target (generate-heroicons style)))))))


(comment
  ;; Test individual functions
  (ensure-root)
  (clone-repo)

  ;; Check available icons
  (count (list-images "outline"))
  (count (list-images "solid"))
  (count (list-images "mini"))
  (count (list-images "micro"))

  ;; Test processing a single icon
  (when-let [test-path (first (list-images "outline"))]
    (println "Testing with:" test-path)
    (pprint (process-svg test-path)))

  ;; Generate all icon sets
  (generate)

  ;; Clean up
  (clean-repo))
