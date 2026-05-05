(ns tyrell.generate.fav6
  (:require
    ; [babashka.fs :as fs]
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
    "git" "clone" "https://github.com/FortAwesome/Font-Awesome.git"
    (str root "/" "fav6")))


(defn clean-repo
  []
  (sh/sh "rm" "-r" (str root "/fav6")))


(defn list-images
  [style]
  (let [target (str root "fav6/svgs/" style)]
    (map #(str target "/" %) (list-files target))))


(comment
  (def style "solid")
  (list-images "solid"))


(defn process-svg
  [path]
  (let [xml (->
              (xml/parse (str path))
              (update :attrs merge
                      {:stroke-width "0"
                       :stroke "currentColor"
                       :fill "currentColor"}))
        icon (file-name path)
        icon (if (re-find #"^\d" (name icon))
               (str "_" (name icon))
               (name icon))]
    `(def ~(symbol icon) ~(with-out-str (xml/emit xml)))))


(comment
  (def path ".icons/fav6/svgs/solid/angle-up.svg")
  (def xml (xml/parse path))
  (with-out-str (xml/emit xml)))


(defn generate-fa
  [style]
  (str/join
    "\n\n"
    (map
      ; str
      #(with-out-str (pprint %))
      (reduce
        (fn [r path]
          (conj r (process-svg path)))
        [`(~'ns ~(symbol (str "tyrell.fav6." style))
                ~(case style
                   "brands" `(:refer-clojure
                               :exclude [~'meta])
                   "regular" `(:refer-clojure
                                :exclude [~'map ~'comment ~'clone])
                   "solid" `(:refer-clojure
                              :exclude [~'map ~'clone ~'comment ~'list
                                        ~'repeat ~'divide ~'key ~'mask
                                        ~'filter ~'shuffle ~'atom ~'cat
                                        ~'remove
                                        ~'print ~'sort])))]
        (list-images style)))))


(defn generate
  []
  (let [styles ["regular" "brands" "solid"]]
    (doseq [style styles
            :let [target (str "gen/ty/fav6/" style ".cljc")]]
      (io/make-parents target)
      (spit target (generate-fa style)))))


(comment
  (generate))
