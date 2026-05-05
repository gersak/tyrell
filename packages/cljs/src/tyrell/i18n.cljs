(ns tyrell.i18n
  "Main i18n namespace providing translation protocols and core functionality.
  Based on toddler.i18n but adapted for standalone use.")

(def ^{:doc "Vector of all supported locales"}
  locales
  [:af
   :am
   :ar
   :ar_DZ
   :ar_EG
   :ar_EG_u_nu_la
   :az
   :be
   :bg
   :bn
   :bn_u_nu_latn
   :br
   :bs
   :ca
   :chr
   :cs
   :cy
   :da
   :de
   :de_AT
   :de_CH
   :el
   :en
   :en_AU
   :en_CA
   :en_GB
   :en_IE
   :en_IN
   :en_SG
   :en_US
   :en_ZA
   :es
   :es_419
   :es_ES
   :es_MX
   :es_US
   :et
   :eu
   :fa
   :fa_u_nu_latn
   :fi
   :fil
   :fr
   :fr_CA
   :ga
   :gl
   :gsw
   :gu
   :haw
   :he
   :hi
   :hr
   :hu
   :hy
   :id
   :in
   :is
   :it
   :iw
   :ja
   :ka
   :kk
   :km
   :kn
   :ko
   :ky
   :ln
   :lo
   :lt
   :lv
   :mk
   :ml
   :mn
   :mo
   :mr
   :mr_u_nu_latn
   :ms
   :mt
   :my
   :my_u_nu_latn
   :nb
   :ne
   :ne_u_nu_latn
   :nl
   :no
   :no_NO
   :or
   :pa
   :pl
   :pt
   :pt_BR
   :pt_PT
   :ro
   :ru
   :sh
   :si
   :sk
   :sl
   :sq
   :sr
   :sr_Latn
   :sv
   :sw
   :ta
   :te
   :th
   :tl
   :tr
   :uk
   :ur
   :uz
   :vi
   :zh
   :zh_CN
   :zh_HK
   :zh_TW
   :zu])

(def ^:dynamic *locale*
  "Dynamic var holding the current locale. 
  Defaults to browser locale if available, otherwise :en."
  (let [browser-locales (.-languages js/navigator)
        {[general] false
         [specific] true} (group-by #(.includes % "-") browser-locales)]
    (if-some [locale (or specific general)]
      (keyword (.replace locale "-" "_"))
      :en)))

(defprotocol Translator
  "Protocol for translating various types of data"
  (translate
    [this]
    [this locale]
    [this locale options]
    "Translates input data using locale and optional parameters"))

(defprotocol Locale
  "Protocol for locale-specific information"
  (locale [this key] "Returns locale definition for given key"))

;; Extend string to just return itself (no translation)
(extend-type string
  Translator
  (translate
    ([this] this)
    ([this _] this)
    ([this _ _] this)))

;; Extend nil to return nil
(extend-type nil
  Translator
  (translate
    ([_] nil)
    ([_ _] nil)
    ([_ _ _] nil)))

;; Public API functions that will be used throughout the system
(defn t
  "Translate helper function. Shorthand for translate."
  ([item]
   (translate item))
  ([item locale]
   (translate item locale))
  ([item locale options]
   (translate item locale options)))

(defmacro with-locale
  "Execute body with given locale bound"
  [locale & body]
  `(binding [*locale* ~locale]
     ~@body))
