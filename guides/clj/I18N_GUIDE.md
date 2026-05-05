# Ty i18n — Internationalization Guide

The `tyrell.i18n` namespaces provide internationalization for any ClojureScript framework. Protocol-based, leveraging the browser's native `Intl` API for number/date formatting.

## Namespaces

| Namespace | Purpose |
|-----------|---------|
| `tyrell.i18n` | Core protocols, `t` function, `*locale*` dynamic var |
| `tyrell.i18n.keyword` | Keyword-based translations (primary) |
| `tyrell.i18n.string` | String-as-key translations (for UI strings) |
| `tyrell.i18n.number` | Number/currency/percent formatting via `Intl.NumberFormat` |
| `tyrell.i18n.time` | Date/time formatting via `Intl.DateTimeFormat` |

---

## Locale

The current locale is held in the dynamic var `tyrell.i18n/*locale*`. It auto-detects from the browser on load:

```clojure
(require '[tyrell.i18n :as i18n])

i18n/*locale*        ; => :en_US (detected from navigator.languages)
```

### Setting Locale

```clojure
;; Set globally (e.g., on language change)
(set! i18n/*locale* :hr)

;; Temporarily bind for a block of code
(i18n/with-locale :de
  (i18n/t :greeting))   ; translates using :de
```

`with-locale` is useful when you need to render something in a different locale without changing the global setting — e.g., previewing content in another language, or formatting a value for export.

### Supported Locales

123 locales supported, including regional variants:

`:en`, `:en_US`, `:en_GB`, `:de`, `:de_AT`, `:de_CH`, `:fr`, `:fr_CA`, `:es`, `:es_MX`, `:hr`, `:ja`, `:zh`, `:zh_CN`, `:zh_TW`, `:ko`, `:ar`, `:hi`, `:ru`, `:pt`, `:pt_BR`, and many more.

Full list in `tyrell.i18n/locales`.

---

## Translation with `t`

The `t` function is the primary API. It dispatches via the `Translator` protocol — the behavior depends on the type of the first argument:

```clojure
(require '[tyrell.i18n :refer [t]])

(t :save)              ; keyword → keyword translation
(t "Select date...")   ; string → string translation
(t 1234.56)            ; number → formatted number
(t (js/Date.))         ; date → formatted date
```

All forms use `*locale*` by default. Pass an explicit locale as second arg:

```clojure
(t :save :de)
(t 1234.56 :de)
(t (js/Date.) :hr)
```

---

## Keyword Translations

The primary translation approach. Uses qualified keywords for storage: `:key/locale`.

### Registering Translations

```clojure
(require '[tyrell.i18n.keyword :as kw])
```

**With `add-translations`** — namespaced map syntax:

```clojure
(kw/add-translations
  #:save {:default "Save"
          :hr "Spremi"
          :de "Speichern"})

(kw/add-translations
  #:cancel {:default "Cancel"
            :hr "Odustani"
            :de "Abbrechen"})
```

The `#:save {...}` reader syntax expands to `{:save/default "Save" :save/hr "Spremi" ...}`.

**With `add-locale`** — grouped by locale:

```clojure
(kw/add-locale
  {:default {:save "Save"
             :cancel "Cancel"
             :delete "Delete"}
   :hr {:save "Spremi"
        :cancel "Odustani"
        :delete "Obriši"}
   :de {:save "Speichern"
        :cancel "Abbrechen"
        :delete "Löschen"}})
```

Both approaches store to the same atom and can be mixed.

### Using Translations

```clojure
(require '[tyrell.i18n :refer [t]])
(require '[tyrell.i18n.keyword])  ; extends Keyword with Translator protocol

;; Uses *locale*
(t :save)           ; => "Spremi" (when *locale* is :hr)

;; Explicit locale
(t :save :de)       ; => "Speichern"

;; Direct qualified keyword lookup
(t :save/hr)        ; => "Spremi" (ignores *locale*)
```

### Fallback Chain

1. `:key/*locale*` — exact locale match
2. `:key/default` — default translation
3. `(name key)` — keyword name as string (last resort)

### Removing Translations

```clojure
(kw/remove-translations :save [:hr :de])  ; remove specific locales
(kw/clear-translations!)                   ; clear everything
```

### Loading from URL

Fetch translations asynchronously from a server or static file. Returns a promise.

**EDN format:**

```clojure
;; File at /translations/hr.edn:
;; {:save "Spremi" :cancel "Odustani" :delete "Obriši"}

(kw/load-translations!
  {:format :edn
   :path "/translations/hr.edn"
   :locale :hr})
```

The `:locale` option transforms `{:save "Spremi"}` into `{:save/hr "Spremi"}`.

**JSON format:**

```clojure
;; File at /api/translations/de.json:
;; {"save": "Speichern", "cancel": "Abbrechen"}

(kw/load-translations!
  {:format :json
   :path "/api/translations/de.json"
   :locale :de})
```

**Pre-qualified format** (no `:locale` option needed):

```clojure
;; File contains already-qualified keys:
;; {:save/hr "Spremi" :save/de "Speichern" :cancel/hr "Odustani"}

(kw/load-translations!
  {:format :edn
   :path "/translations/all.edn"})
```

---

## String Translations

Uses English text as the key. Useful for translating UI strings that appear in component labels, tooltips, etc.

```clojure
(require '[tyrell.i18n.string :as str-i18n])
```

### Registering

```clojure
(str-i18n/add-string-translations
  {"Select date..." {:hr "Odaberite datum..."
                     :de "Datum auswählen..."
                     :fr "Sélectionner une date..."}
   "Save changes"   {:hr "Spremi promjene"
                     :de "Änderungen speichern"}})

;; Single string
(str-i18n/add-string-translation "Today" :hr "Danas")
```

### Using

```clojure
(t "Select date...")   ; => "Odaberite datum..." (when *locale* is :hr)
(t "Select date..." :de) ; => "Datum auswählen..."
(t "Unknown string")   ; => "Unknown string" (returns original if no translation)
```

### Built-in Datepicker Translations

Pre-built translations for calendar/datepicker UI strings in 10 languages (hr, de, fr, es, it, pt, ru, ja, zh, ko):

```clojure
(str-i18n/load-datepicker-translations!)
```

Covers: "Select date...", "Time:", "Today", "Clear", "Open calendar", "Close calendar", "Previous year", "Previous month", "Next month", "Next year".

### Loading from URL

```clojure
;; File: {"Select date..." {"hr": "Odaberite datum...", "de": "Datum auswählen..."}}
(str-i18n/load-string-translations!
  {:format :json
   :path "/translations/strings.json"})

(str-i18n/load-string-translations!
  {:format :edn
   :path "/translations/strings.edn"})
```

### Removing

```clojure
(str-i18n/remove-string-translation "Today" :hr)  ; remove one locale
(str-i18n/remove-string-translations "Today")      ; remove all locales for string
(str-i18n/clear-string-translations!)               ; clear everything
```

---

## Number Formatting

Locale-aware number formatting via `Intl.NumberFormat`. Requiring the namespace extends `number` with the `Translator` protocol.

```clojure
(require '[tyrell.i18n.number :as num])
```

### Basic Formatting

```clojure
(num/format-number 1234567.89)         ; => "1,234,567.89" (en_US)
(num/format-number 1234567.89 :de)     ; => "1.234.567,89"
(num/format-number 1234567.89 :hr)     ; => "1.234.567,89"
```

### Currency

```clojure
(num/format-currency 1234.56 "EUR")          ; => "€1,234.56" (en_US)
(num/format-currency 1234.56 "EUR" :de)      ; => "1.234,56 €"
(num/format-currency 1234.56 "HRK" :hr)      ; => "1.234,56 HRK"
```

### Percent

```clojure
(num/format-percent 0.156)         ; => "16%" (en_US)
(num/format-percent 0.156 :de)     ; => "16 %"
```

### Compact

```clojure
(num/format-compact 1234567)       ; => "1.2M" (en_US)
(num/format-compact 1234567 :de)   ; => "1,2 Mio."
(num/format-compact 1500)          ; => "1.5K"
```

### Custom Options

Pass any `Intl.NumberFormat` option:

```clojure
(num/format-number 1234.5 :en_US
  {:minimumFractionDigits 2
   :maximumFractionDigits 2
   :useGrouping true})
; => "1,234.50"
```

### Via `t`

Numbers are extended with `Translator`:

```clojure
(t 1234.56)            ; => "1,234.56" (formatted with *locale*)
(t 1234.56 :de)        ; => "1.234,56" (explicit locale)
(t 1234.56 "EUR")      ; => "€1,234.56" (string arg = currency code)
```

---

## Date/Time Formatting

Locale-aware date/time formatting via `Intl.DateTimeFormat`. Requiring the namespace extends `js/Date` with the `Translator` protocol.

```clojure
(require '[tyrell.i18n.time :as time])
```

### Preset Formats

```clojure
(def d (js/Date. 2026 2 25))  ; March 25, 2026

(time/format-date-short d)      ; => "3/25/26"
(time/format-date-medium d)     ; => "Mar 25, 2026"
(time/format-date-long d)       ; => "March 25, 2026"
(time/format-date-full d)       ; => "Wednesday, March 25, 2026"

(time/format-date-short d :de)  ; => "25.03.26"
(time/format-date-long d :hr)   ; => "25. ožujka 2026."
```

### Time

```clojure
(time/format-time (js/Date.))       ; => "2:30:45 PM"
(time/format-time (js/Date.) :de)   ; => "14:30:45"
```

### Date + Time

```clojure
(time/format-datetime (js/Date.))       ; => "Mar 25, 2026, 2:30 PM"
(time/format-datetime (js/Date.) :de)   ; => "25.03.2026, 14:30"
```

### Relative Time

```clojure
(time/format-relative -3 "day")       ; => "3 days ago"
(time/format-relative -3 "day" :de)   ; => "vor 3 Tagen"
(time/format-relative 1 "hour")       ; => "in 1 hour"
(time/format-relative -1 "month" :hr) ; => "prošli mjesec"
```

Units: `"year"`, `"quarter"`, `"month"`, `"week"`, `"day"`, `"hour"`, `"minute"`, `"second"`.

### Custom Options

Pass any `Intl.DateTimeFormat` option:

```clojure
(time/format-date (js/Date.) :en_US
  {:weekday "long"
   :year "numeric"
   :month "short"
   :day "numeric"
   :hour "2-digit"
   :minute "2-digit"})
; => "Wednesday, Mar 25, 2026, 02:30 PM"
```

### Via `t`

Dates are extended with `Translator`:

```clojure
(t (js/Date.))              ; => "Mar 25, 2026" (medium format with *locale*)
(t (js/Date.) :de)          ; => "25.03.2026" (explicit locale)
(t (js/Date.) "short")      ; => "3/25/26" (string arg = style preset)
(t (js/Date.) "full")       ; => "Wednesday, March 25, 2026"
(t (js/Date.) "time")       ; => "2:30:45 PM"
(t (js/Date.) "datetime")   ; => "Mar 25, 2026, 2:30 PM"
```

---

## Locale Info

The `Locale` protocol provides locale-specific calendar symbols:

```clojure
(require '[tyrell.i18n :as i18n])
(require '[tyrell.i18n.time])  ; extends Keyword with Locale protocol

(i18n/locale :en :months)           ; => ["January" "February" ... "December"]
(i18n/locale :de :months)           ; => ["Januar" "Februar" ... "Dezember"]
(i18n/locale :hr :months/short)     ; => ["sij" "velj" ... "pro"]
(i18n/locale :ja :months/narrow)    ; => ["1月" "2月" ... "12月"]

(i18n/locale :en :weekdays)         ; => ["Sunday" "Monday" ... "Saturday"]
(i18n/locale :hr :weekdays/short)   ; => ["ned" "pon" ... "sub"]
(i18n/locale :zh :weekdays/narrow)  ; => ["日" "一" ... "六"]
```

Available keys: `:months`, `:months/short`, `:months/narrow`, `:weekdays`, `:weekdays/short`, `:weekdays/narrow`.

---

## App Initialization Example

```clojure
(ns my-app.core
  (:require [tyrell.i18n :as i18n]
            [tyrell.i18n.keyword :as kw]
            [tyrell.i18n.string :as str-i18n]
            [tyrell.i18n.number]   ; extends number with Translator
            [tyrell.i18n.time]))   ; extends Date with Translator

;; 1. Register embedded translations
(kw/add-locale
  {:default {:greeting "Hello"
             :save "Save"
             :cancel "Cancel"
             :delete "Delete"
             :confirm "Are you sure?"}
   :hr {:greeting "Bok"
        :save "Spremi"
        :cancel "Odustani"
        :delete "Obriši"
        :confirm "Jeste li sigurni?"}
   :de {:greeting "Hallo"
        :save "Speichern"
        :cancel "Abbrechen"
        :delete "Löschen"
        :confirm "Sind Sie sicher?"}})

;; 2. Load datepicker UI translations (built-in)
(str-i18n/load-datepicker-translations!)

;; 3. Optionally load more translations from server
(kw/load-translations!
  {:format :json
   :path "/api/translations/hr.json"
   :locale :hr})

;; 4. Set locale (or leave auto-detected from browser)
(set! i18n/*locale* :hr)
```

### Switching Language at Runtime

```clojure
(defn set-language! [locale]
  (set! i18n/*locale* locale)
  (render!))  ; re-render your app
```

---

## Extending with Custom Types

The `Translator` protocol can be extended to any type:

```clojure
(extend-protocol i18n/Translator
  cljs.core/PersistentVector
  (translate
    ([this] (mapv i18n/t this))
    ([this locale] (mapv #(i18n/t % locale) this))
    ([this locale opts] (mapv #(i18n/t % locale opts) this))))

(t [:save :cancel :delete])
; => ["Spremi" "Odustani" "Obriši"]
```
