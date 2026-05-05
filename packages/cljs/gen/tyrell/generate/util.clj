(ns tyrell.generate.util
  (:require
    [clojure.java.io :as io]
    [clojure.string :as str])
  (:import
    [java.io File]))



(defn list-files [dir-path]
  (->> (File. dir-path)
       (.listFiles)
       (map #(.getName %))))


(defn ext [path]
  (last (str/split (str path) #"\.")))


(defn file-name [path]
  (second (re-find #"([^/]+)\.[^.]+$" path)))


(comment
  (def path ".icons/fav6/svgs/solidbath.svg"))
