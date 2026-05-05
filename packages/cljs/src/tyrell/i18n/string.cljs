(ns tyrell.i18n.string
  "String-based translations using the original text as the key.
  Extends the Translator protocol for String objects."
  (:require [tyrell.i18n :as i18n]
            [tyrell.util :refer [deep-merge]]))

(defonce ^{:doc "Atom containing all string translations.
                 Format: {\"English text\" {:hr \"Croatian text\"
                                           :de \"German text\"
                                           :es \"Spanish text\"}}"}
  string-translations (atom {}))

(defn add-string-translations
  "Add string translations to the cache.
  
  Example usage:
  ```clojure
  (add-string-translations
    {\"Select date...\" {:hr \"Odaberite datum...\"
                        :de \"Datum auswählen...\"
                        :fr \"Sélectionner une date...\"
                        :es \"Seleccionar fecha...\"}
     \"Time:\" {:hr \"Vrijeme:\"
               :de \"Zeit:\"
               :fr \"Heure:\"
               :es \"Hora:\"}})
  ```"
  [translations-map]
  (swap! string-translations deep-merge translations-map))

(defn add-string-translation
  "Add a single string translation.
  
  Example:
  ```clojure
  (add-string-translation \"Select date...\" :hr \"Odaberite datum...\")
  ```"
  [english-text locale translated-text]
  (swap! string-translations
         assoc-in [english-text locale] translated-text))

(defn remove-string-translation
  "Remove translation for a specific string and locale"
  [english-text locale]
  (swap! string-translations
         update english-text dissoc locale))

(defn remove-string-translations
  "Remove all translations for a specific string"
  [english-text]
  (swap! string-translations dissoc english-text))

(defn clear-string-translations!
  "Clear all string translations from memory"
  []
  (reset! string-translations {}))

(defn get-string-translation
  "Get translation for a string in given locale.
  Returns original string if no translation found."
  [text locale]
  (let [translations (get @string-translations text)]
    (or (get translations locale)
        (get translations :default) ; Try default locale
        text))) ; Fallback to original text

;; Extend the Translator protocol for strings
(extend-protocol i18n/Translator
  string
  (translate
    ([this]
     (get-string-translation this i18n/*locale*))
    ([this locale]
     (get-string-translation this locale))
    ([this locale _options]
     ;; For now, ignore options - no interpolation
     (get-string-translation this locale))))

;; Helper functions for common datepicker strings
(defn load-datepicker-translations!
  "Load common datepicker translations into the system"
  []
  (add-string-translations
   {"Select date..." {:hr "Odaberite datum..."
                      :de "Datum auswählen..."
                      :fr "Sélectionner une date..."
                      :es "Seleccionar fecha..."
                      :it "Seleziona data..."
                      :pt "Selecionar data..."
                      :ru "Выберите дату..."
                      :ja "日付を選択..."
                      :zh "选择日期..."
                      :ko "날짜 선택..."}

    "Time:" {:hr "Vrijeme:"
             :de "Zeit:"
             :fr "Heure:"
             :es "Hora:"
             :it "Orario:"
             :pt "Hora:"
             :ru "Время:"
             :ja "時間:"
             :zh "时间:"
             :ko "시간:"}

    "Today" {:hr "Danas"
             :de "Heute"
             :fr "Aujourd'hui"
             :es "Hoy"
             :it "Oggi"
             :pt "Hoje"
             :ru "Сегодня"
             :ja "今日"
             :zh "今天"
             :ko "오늘"}

    "Clear" {:hr "Očisti"
             :de "Löschen"
             :fr "Effacer"
             :es "Limpiar"
             :it "Cancella"
             :pt "Limpar"
             :ru "Очистить"
             :ja "クリア"
             :zh "清除"
             :ko "지우기"}

    "Open calendar" {:hr "Otvori kalendar"
                     :de "Kalender öffnen"
                     :fr "Ouvrir le calendrier"
                     :es "Abrir calendario"
                     :it "Apri calendario"
                     :pt "Abrir calendário"
                     :ru "Открыть календарь"
                     :ja "カレンダーを開く"
                     :zh "打开日历"
                     :ko "달력 열기"}

    "Close calendar" {:hr "Zatvori kalendar"
                      :de "Kalender schließen"
                      :fr "Fermer le calendrier"
                      :es "Cerrar calendario"
                      :it "Chiudi calendario"
                      :pt "Fechar calendário"
                      :ru "Закрыть календарь"
                      :ja "カレンダーを閉じる"
                      :zh "关闭日历"
                      :ko "달력 닫기"}

    ;; Calendar navigation tooltips
    "Previous year" {:hr "Prethodna godina"
                     :de "Vorheriges Jahr"
                     :fr "Année précédente"
                     :es "Año anterior"
                     :it "Anno precedente"
                     :pt "Ano anterior"
                     :ru "Предыдущий год"
                     :ja "前年"
                     :zh "上一年"
                     :ko "이전 년도"}

    "Previous month" {:hr "Prethodnji mjesec"
                      :de "Vorheriger Monat"
                      :fr "Mois précédent"
                      :es "Mes anterior"
                      :it "Mese precedente"
                      :pt "Mês anterior"
                      :ru "Предыдущий месяц"
                      :ja "前月"
                      :zh "上个月"
                      :ko "이전 달"}

    "Next month" {:hr "Sljedeći mjesec"
                  :de "Nächster Monat"
                  :fr "Mois suivant"
                  :es "Mes siguiente"
                  :it "Mese successivo"
                  :pt "Próximo mês"
                  :ru "Следующий месяц"
                  :ja "翌月"
                  :zh "下个月"
                  :ko "다음 달"}

    "Next year" {:hr "Sljedeća godina"
                 :de "Nächstes Jahr"
                 :fr "Année suivante"
                 :es "Año siguiente"
                 :it "Anno successivo"
                 :pt "Próximo ano"
                 :ru "Следующий год"
                 :ja "翌年"
                 :zh "下一年"
                 :ko "다음 년도"}}))

;; Async loading support for string translations
(defn load-string-translations!
  "Load string translations from a URL.
  Expected format: {\"English text\" {:locale \"translation\"}}
  
  Options:
  - :format - :edn or :json (required)
  - :path - URL to load from (required)"
  [{:keys [format path]}]
  (-> (js/fetch path)
      (.then #(.text %))
      (.then (fn [text]
               (let [data (case format
                            :json (js->clj (js/JSON.parse text) :keywordize-keys true)
                            :edn (cljs.reader/read-string text)
                            (throw (ex-info "Unknown format" {:format format})))]
                 (add-string-translations data)
                 data)))))
