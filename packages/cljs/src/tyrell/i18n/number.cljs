(ns tyrell.i18n.number
  "Number and currency formatting using native Intl.NumberFormat.
  Extends the Translator protocol for numbers."
  (:require
    [cljs-bean.core :refer [->js]]
    [tyrell.i18n :as i18n]))

(defn locale->string
  "Convert locale keyword to string format for Intl API.
  :en_US -> 'en-US'"
  [locale]
  (-> (name locale)
      (.replace "_" "-")))

(defn format-number
  "Format a number using Intl.NumberFormat.
  Options can include:
  - :style - 'decimal' (default), 'currency', 'percent', 'unit'
  - :currency - currency code when style is 'currency'
  - :minimumFractionDigits - minimum decimal places
  - :maximumFractionDigits - maximum decimal places
  - :useGrouping - whether to use grouping separators"
  ([number] (format-number number i18n/*locale*))
  ([number locale] (format-number number locale {}))
  ([number locale options]
   (let [formatter (js/Intl.NumberFormat.
                     (locale->string locale)
                     (->js options))]
     (.format formatter number))))

(defn format-currency
  "Format a number as currency.
  Currency should be a 3-letter ISO code like 'USD', 'EUR', 'HRK'"
  ([number currency] (format-currency number currency i18n/*locale*))
  ([number currency locale]
   (format-number number locale {:style "currency"
                                 :currency currency})))

(defn format-percent
  "Format a number as percentage"
  ([number] (format-percent number i18n/*locale*))
  ([number locale]
   (format-number number locale {:style "percent"})))

(defn format-compact
  "Format a number in compact notation (1.2K, 3.4M, etc)"
  ([number] (format-compact number i18n/*locale*))
  ([number locale]
   (format-number number locale {:notation "compact"
                                 :compactDisplay "short"})))

;; Extend the Translator protocol for numbers
(extend-protocol i18n/Translator
  number
  (translate
    ([this]
     ;; Default number formatting for current locale
     (format-number this i18n/*locale*))
    ([this locale-or-currency]
     ;; If string, assume it's currency code
     ;; If keyword, assume it's locale
     (cond
       (string? locale-or-currency)
       (format-currency this locale-or-currency i18n/*locale*)

       (keyword? locale-or-currency)
       (format-number this locale-or-currency)

       :else
       (str this)))
    ([this locale options]
     ;; Full control with locale and options
     (format-number this locale options))))
