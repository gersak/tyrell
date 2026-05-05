(ns tyrell.i18n.keyword
  "Keyword-based translations with in-memory caching.
  Uses qualified keywords for storage like toddler."
  (:require
    [cljs-bean.core :refer [->clj]]
    [cljs.reader :as reader]
    [tyrell.i18n :as i18n]
    [tyrell.util :refer [deep-merge]]))

(defonce ^{:doc "Atom containing all loaded translations. 
                 Stores qualified keywords only:
                 {:keyword/locale \"translation\"}"}
  translations (atom {}))

(defn add-translations
  "Add translations to the in-memory cache.
  Uses Clojure's namespaced map syntax:
  ```clojure
  #:save {:default \"Save\"
          :hr \"Spremi\"
          :de \"Speichern\"}
  ```
  This expands to:
  ```clojure
  {:save/default \"Save\"
   :save/hr \"Spremi\"
   :save/de \"Speichern\"}
  ```"
  [mapping]
  (swap! translations deep-merge mapping))

(defn add-locale
  "Add translations for a specific locale.
  Transforms the input to qualified keywords.
  ```clojure
  {:default {:save \"Save\"
             :cancel \"Cancel\"}
   :hr {:save \"Spremi\"
        :cancel \"Odustani\"}}
  ```"
  [locale-mapping]
  (swap! translations deep-merge
         (reduce-kv
           (fn [result locale trans-map]
             (reduce-kv
               (fn [r k v]
                 (assoc r (keyword (name k) (name locale)) v))
               result
               trans-map))
           {}
           locale-mapping)))

(defn remove-translations
  "Remove translations for specific key and locales"
  [key locales]
  (swap! translations
         (fn [trans]
           (reduce (fn [t locale]
                     (dissoc t (keyword (name key) (name locale))))
                   trans
                   locales))))

(defn clear-translations!
  "Clear all translations from memory"
  []
  (reset! translations {}))

;; Extend the Translator protocol for keywords
(extend-protocol i18n/Translator
  cljs.core/Keyword
  (translate
    ([this]
     (if (qualified-keyword? this)
       ;; Qualified keyword like :save/hr - direct lookup
       (get @translations this)
       ;; Unqualified keyword - build qualified key with current locale
       (or (get @translations (keyword (name this) (name i18n/*locale*)))
           (get @translations (keyword (name this) "default"))
           ;; Fallback to keyword name
           (name this))))
    ([this locale]
     (if (qualified-keyword? this)
       ;; Qualified keyword - ignore locale parameter
       (i18n/translate this)
       ;; Unqualified - use provided locale
       (or (get @translations (keyword (name this) (name locale)))
           (get @translations (keyword (name this) "default"))
           (name this))))
    ([this locale options]
     ;; For now, ignore options - no interpolation
     (i18n/translate this locale))))

;; Async loading support
(defn load-translations!
  "Asynchronously load translations from a URL.
  Returns a promise.
  
  Options:
  - :format - :edn or :json (required)
  - :path - URL to load from (required)
  - :locale - If provided, transforms keys to qualified format"
  [{:keys [format path locale]}]
  (-> (js/fetch path)
      (.then #(.text %))
      (.then (fn [text]
               (let [data (case format
                            :json (->clj (js/JSON.parse text) :keywordize-keys true)
                            :edn (reader/read-string text)
                            (throw (ex-info "Unknown format" {:format format})))]
                 (if locale
                   ;; Transform {:key "value"} to {:key/locale "value"}
                   (add-translations
                     (reduce-kv
                       (fn [m k v]
                         (assoc m (keyword (name k) (name locale)) v))
                       {}
                       data))
                   ;; Assume data is already in qualified format
                   (add-translations data))
                 data)))))
