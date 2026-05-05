(ns tyrell.i18n.time
  "Date and time formatting using native Intl.DateTimeFormat.
  Extends the Translator protocol for JS Date objects."
  (:require
    [cljs-bean.core :refer [->js]]
    [tyrell.i18n :as i18n]
    [tyrell.i18n.number :refer [locale->string]]))

(defn format-date
  "Format a date using Intl.DateTimeFormat.
  Options can include:
  - :dateStyle - 'full', 'long', 'medium', 'short'
  - :timeStyle - 'full', 'long', 'medium', 'short'
  - :year, :month, :day - 'numeric', '2-digit', etc
  - :hour, :minute, :second - 'numeric', '2-digit'
  - :weekday - 'long', 'short', 'narrow'
  - :timeZone - timezone string"
  ([date] (format-date date i18n/*locale*))
  ([date locale] (format-date date locale {}))
  ([date locale options]
   (let [formatter (js/Intl.DateTimeFormat.
                     (locale->string locale)
                     (->js options))]
     (.format formatter date))))

;; Preset formatters for common use cases
(defn format-date-short
  "Format date in short format (e.g., 12/31/2023)"
  ([date] (format-date-short date i18n/*locale*))
  ([date locale]
   (format-date date locale {:dateStyle "short"})))

(defn format-date-medium
  "Format date in medium format (e.g., Dec 31, 2023)"
  ([date] (format-date-medium date i18n/*locale*))
  ([date locale]
   (format-date date locale {:dateStyle "medium"})))

(defn format-date-long
  "Format date in long format (e.g., December 31, 2023)"
  ([date] (format-date-long date i18n/*locale*))
  ([date locale]
   (format-date date locale {:dateStyle "long"})))

(defn format-date-full
  "Format date in full format (e.g., Sunday, December 31, 2023)"
  ([date] (format-date-full date i18n/*locale*))
  ([date locale]
   (format-date date locale {:dateStyle "full"})))

(defn format-time
  "Format time only"
  ([date] (format-time date i18n/*locale*))
  ([date locale]
   (format-date date locale {:timeStyle "medium"})))

(defn format-datetime
  "Format both date and time"
  ([date] (format-datetime date i18n/*locale*))
  ([date locale]
   (format-date date locale {:dateStyle "medium"
                             :timeStyle "short"})))

;; Relative time formatting
(defn format-relative
  "Format relative time using Intl.RelativeTimeFormat.
  Unit can be: 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second'"
  ([value unit] (format-relative value unit i18n/*locale*))
  ([value unit locale]
   (let [formatter (js/Intl.RelativeTimeFormat.
                     (locale->string locale)
                     #js {:numeric "auto"})]
     (.format formatter value unit))))

;; Get locale-specific date/time information
(defn get-weekday-names
  "Get localized weekday names"
  ([locale] (get-weekday-names locale "long"))
  ([locale style]
   (let [formatter (js/Intl.DateTimeFormat.
                     (locale->string locale)
                     #js {:weekday style})
         ;; Create dates for each day of week (Sunday = 0)
         base-date (js/Date. 2024 0 7)] ; A Sunday
     (mapv (fn [day-offset]
             (let [date (js/Date. (.getTime base-date))]
               (.setDate date (+ (.getDate date) day-offset))
               (.format formatter date)))
           (range 7)))))

(defn get-month-names
  "Get localized month names"
  ([locale] (get-month-names locale "long"))
  ([locale style]
   (let [formatter (js/Intl.DateTimeFormat.
                     (locale->string locale)
                     #js {:month style})]
     (mapv (fn [month]
             (.format formatter (js/Date. 2024 month 1)))
           (range 12)))))

;; Extend the Translator protocol for Date objects
(extend-protocol i18n/Translator
  js/Date
  (translate
    ([this]
     ;; Default to medium date format
     (format-date-medium this i18n/*locale*))
    ([this locale-or-style]
     ;; If keyword, assume it's locale
     ;; If string, interpret as style preset
     (cond
       (keyword? locale-or-style)
       (format-date-medium this locale-or-style)

       (string? locale-or-style)
       (case locale-or-style
         "short" (format-date-short this)
         "medium" (format-date-medium this)
         "long" (format-date-long this)
         "full" (format-date-full this)
         "time" (format-time this)
         "datetime" (format-datetime this)
         ;; Default
         (format-date-medium this))

       :else
       (.toString this)))
    ([this locale options]
     ;; Full control with locale and options
     (if (map? options)
       (format-date this locale options)
       ;; If options is a string, use as style
       (binding [i18n/*locale* locale]
         (i18n/translate this options))))))

;; Extend Locale protocol to provide date/time symbols
(extend-protocol i18n/Locale
  cljs.core/Keyword
  (locale [this key]
    (case key
      :months (get-month-names this)
      :months/short (get-month-names this "short")
      :months/narrow (get-month-names this "narrow")
      :weekdays (get-weekday-names this)
      :weekdays/short (get-weekday-names this "short")
      :weekdays/narrow (get-weekday-names this "narrow")
      nil)))
