(ns tyrell.template
  (:require
    [clojure.java.io :as io]
    [clojure.string :as str]))

(defn random-string
  "Generate a random string of specified length for cache-busting"
  ([] (random-string 5))
  ([length]
   (let [chars "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"]
     (apply str (repeatedly length #(rand-nth chars))))))

(defn process
  "Process a template file by replacing {{variable}} placeholders with provided values.
   Reads from resources or file system and writes to target path."
  ([source-file target-file] (process source-file target-file nil))
  ([source-file target-file variables]
   (let [;; Try to read from resources first, then from file system
         content (or (some-> (io/resource source-file) slurp)
                     (when (.exists (io/file source-file))
                       (slurp source-file)))]
     (assert (some? content) (str source-file " file doesn't exist!"))
     (let [;; Find all {{variable}} patterns in the template
           template-vars (distinct (re-seq #"(?<=\{\{)\w+[\w\d\-\_]*(?=\}\})" content))
           ;; Replace each variable with its value
           new-content (reduce
                         (fn [result variable]
                           (let [value (get variables (keyword variable) "")]
                             (str/replace result
                                          (re-pattern (str "\\{\\{" variable "\\}\\}"))
                                          (str value))))
                         content
                         template-vars)]
       (println (format "Processing template: %s -> %s" source-file target-file))
       (io/make-parents target-file)
       ;; Delete existing file if it exists
       (when (.exists (io/file target-file))
         (io/delete-file target-file))
       (spit target-file new-content)
       (println (format "  ✓ Generated %s with salt: %s"
                        target-file
                        (or (:salt variables) "none")))))))
