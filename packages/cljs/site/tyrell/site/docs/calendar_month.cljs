(ns tyrell.site.docs.calendar-month
  "Documentation for ty-calendar-month component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(defn- attrs->html
  "Render playground props as an attribute string, skipping defaults."
  [{:keys [size flavor locale]}]
  (str/join "" [(when (not= size "md") (str " size=\"" size "\""))
                (when (not= flavor "primary") (str " flavor=\"" flavor "\""))
                (when (not= locale "en-US") (str " locale=\"" locale "\""))]))

(defn- html-code
  "The HTML tab, plus `extra` attributes for the Datastar tab."
  [props extra]
  (str "<ty-calendar-month display-year=\"2026\" display-month=\"9\""
       (attrs->html props) extra ">\n</ty-calendar-month>"))

(defn- snippets [{:keys [size flavor locale] :as props}]
  (let [kv (fn [k v] (str "\n  " k " \"" v "\""))
        opts (str (when (not= size "md") (kv ":size" size))
                  (when (not= flavor "primary") (kv ":flavor" flavor))
                  (when (not= locale "en-US") (kv ":locale" locale)))]
    [["html" "HTML" "html" (html-code props "")]
     ["react" "React" "javascript"
      (str "import { TyCalendarMonth } from 'tyrell-react'\n\n"
           "<TyCalendarMonth\n  displayYear={2026}\n  displayMonth={9}"
           (when (not= size "md") (str "\n  size=\"" size "\""))
           (when (not= flavor "primary") (str "\n  flavor=\"" flavor "\""))
           (when (not= locale "en-US") (str "\n  locale=\"" locale "\""))
           "\n  onDayClick={(e) => select(e.detail.dayContext)}\n/>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/CalendarMonth\n {:display-year 2026\n  :display-month 9" opts
           "\n  :on-day-click #(select! (.. % -detail -dayContext))}]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-calendar-month\n {:display-year \"2026\"\n  :display-month \"9\"" opts
           "\n  :on {:day-click #(select! (.. % -detail -dayContext))}}]")]
     ["datastar" "Datastar" "html"
      (html-code props "\n  data-signals:day=\"0\"\n  data-on:day-click=\"$day = evt.detail.day\"")]]))

(defn- today []
  (let [d (js/Date.)]
    {:year (.getFullYear d) :month (inc (.getMonth d))}))

(defn- local-midnight
  "Timestamp the grid's value property expects (DayContext.localValue)."
  [year month day]
  (.getTime (js/Date. year (dec month) day)))

(defn- near-today-value []
  (let [d (js/Date.)
        day (.getDate d)]
    (local-midnight (.getFullYear d) (inc (.getMonth d)) (if (> day 3) (- day 2) (+ day 2)))))

(defn- shift-month [{:keys [year month]} delta]
  (let [i (+ (* 12 year) (dec month) delta)]
    {:year (quot i 12) :month (inc (mod i 12))}))

(defn- month-title [{:keys [year month]}]
  (.format (js/Intl.DateTimeFormat. "en-US" #js {:month "long" :year "numeric"})
           (js/Date. year (dec month) 1)))

;; Availability example -------------------------------------------------------

(defn- availability
  "Deterministic demo status for a day."
  [^js ctx]
  (let [d (.-dayInMonth ctx)]
    (cond (#{0 4 7} (mod (* 5 d) 13)) "booked"
          (#{1 3} (mod (* 3 d) 8)) "limited"
          :else "open")))

(defn- availability-day [^js ctx]
  (let [el (js/document.createElement "div")]
    (set! (.-className el) (str "slot " (availability ctx)))
    (set! (.-innerHTML el) (str "<span>" (.-dayInMonth ctx) "</span><i></i>"))
    el))

(def ^:private availability-css
  ".slot { display: flex; flex-direction: column; align-items: center; gap: 3px; line-height: 1; }
.slot i { width: 5px; height: 5px; border-radius: 50%; }
.slot.open i { background: var(--ty-color-success); }
.slot.limited i { background: var(--ty-color-warning); }
.slot.booked { color: var(--ty-text-faint); text-decoration: line-through; }
.other-month .slot i { visibility: hidden; }")

(defonce ^:private availability-sheet
  (doto (js/CSSStyleSheet.) (.replaceSync availability-css)))

(defn- legend [[label color]]
  [:span.flex.items-center.gap-2.text-sm.ty-text
   {:replicant/key label}
   [:i {:style {:width "6px" :height "6px" :border-radius "50%" :background color}}]
   label])

;; Theming example ------------------------------------------------------------

(def ^:private weekend-css
  ".weekend:not(.other-month) {
  background: color-mix(in oklab,
    var(--ty-color-warning) 14%,
    transparent);
}")

(defonce ^:private weekend-sheet
  (doto (js/CSSStyleSheet.) (.replaceSync weekend-css)))

(def ^:private availability-snippets
  "Availability example, one tab per stack."
  [["html" "HTML" "html"
    "<ty-calendar-month id=\"grid\" size=\"lg\"></ty-calendar-month>

<script>
  const slotDay = (ctx) => {
    const el = document.createElement('div');
    el.className = `slot ${statusFor(ctx)}`;   // open | limited | booked
    el.innerHTML = `<span>${ctx.dayInMonth}</span><i></i>`;
    return el;
  };

  const slotSheet = new CSSStyleSheet();
  slotSheet.replaceSync(`
    .slot.open i    { background: var(--ty-color-success); }
    .slot.limited i { background: var(--ty-color-warning); }
    .slot.booked    { color: var(--ty-text-faint); text-decoration: line-through; }
  `);

  const grid = document.getElementById('grid');
  grid.dayContentFn = slotDay;
  grid.customCSS = slotSheet;
</script>"]
   ["react" "React" "javascript"
    "import { TyCalendarMonth } from 'tyrell-react'

// slotDay and slotSheet as in the HTML tab
<TyCalendarMonth size=\"lg\" dayContentFn={slotDay} customCSS={slotSheet} />"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

;; slot-day: (fn [ctx] element), slot-sheet: a CSSStyleSheet (see HTML tab)
[:> ty/CalendarMonth {:size \"lg\" :day-content-fn slot-day :customCSS slot-sheet}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-calendar-month {:size \"lg\"
                     :replicant/on-mount (fn [{:replicant/keys [node]}]
                                           (set! (.-dayContentFn node) slot-day)
                                           (set! (.-customCSS node) slot-sheet))}]"]
   ["datastar" "Datastar" "html"
    "<!-- slotDay and slotSheet: globals, as in the HTML tab -->
<ty-calendar-month size=\"lg\"
  data-init=\"el.dayContentFn = slotDay; el.customCSS = slotSheet\">
</ty-calendar-month>"]])

(def ^:private selection-snippets
  "Selection example, one tab per stack."
  [["html" "HTML" "html"
    "<ty-calendar-month id=\"grid\"></ty-calendar-month>

<script>
  const grid = document.getElementById('grid');
  grid.addEventListener('day-click',
    (e) => grid.value = e.detail.dayContext.localValue);
</script>"]
   ["react" "React" "javascript"
    "import { useState } from 'react'
import { TyCalendarMonth } from 'tyrell-react'

const [day, setDay] = useState(null)

<TyCalendarMonth value={day}
  onDayClick={(e) => setDay(e.detail.dayContext.localValue)} />"]
   ["reagent" "Reagent" "clojure"
    "[:> ty/CalendarMonth
 {:value @day
  :on-day-click #(reset! day (.. % -detail -dayContext -localValue))}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-calendar-month
 {:on {:day-click (fn [e]
                    (set! (.. e -currentTarget -value)
                          (.. e -detail -dayContext -localValue)))}}]"]
   ["datastar" "Datastar" "html"
    "<ty-calendar-month
  data-on:day-click=\"el.value = evt.detail.dayContext.localValue\">
</ty-calendar-month>"]])

(def ^:private api-snippets
  "JavaScript API example, one tab per stack."
  [["html" "HTML" "html"
    "<ty-calendar-month id=\"grid\"></ty-calendar-month>

<script>
  const grid = document.getElementById('grid');

  grid.displayYear = 2026;
  grid.displayMonth = 12;                  // 1–12
  grid.value = new Date(2026, 11, 24).getTime();  // local midnight
  grid.min = '2026-12-01';                 // ISO; outside days are disabled

  grid.addEventListener('day-click', (e) => {
    const { year, month, day, dayContext } = e.detail;
  });
</script>"]
   ["react" "React" "javascript"
    "import { TyCalendarMonth } from 'tyrell-react'

<TyCalendarMonth value={new Date(2026, 11, 24).getTime()}
  displayYear={2026} displayMonth={12}   // 1–12
  min=\"2026-12-01\"                       // ISO; outside days are disabled
  onDayClick={(e) => {
    const { year, month, day, dayContext } = e.detail
  }} />"]
   ["reagent" "Reagent" "clojure"
    "[:> ty/CalendarMonth
 {:display-year 2026 :display-month 12   ; 1–12
  :min \"2026-12-01\"                      ; ISO; outside days are disabled
  :value (.getTime (js/Date. 2026 11 24))
  :on-day-click #(let [{:keys [year month day]} (js->clj (.-detail %) :keywordize-keys true)]
                   …)}]"]
   ["replicant" "Replicant" "clojure"
    "[:ty-calendar-month
 {:display-year \"2026\" :display-month \"12\"   ; 1–12
  :min \"2026-12-01\"                          ; ISO; outside days are disabled
  :replicant/on-mount (fn [{:replicant/keys [node]}]
                        (set! (.-value node) (.getTime (js/Date. 2026 11 24))))
  :on {:day-click (fn [e]
                    (let [{:keys [year month day]} (js->clj (.-detail e) :keywordize-keys true)]
                      …))}}]"]
   ["datastar" "Datastar" "html"
    "<ty-calendar-month display-year=\"2026\" display-month=\"12\"
  min=\"2026-12-01\"
  data-signals:day=\"0\"
  data-init=\"el.value = new Date(2026, 11, 24).getTime()\"
  data-on:day-click=\"$day = evt.detail.day\">
</ty-calendar-month>"]])

(defn view []
  (let [{:keys [year month] :as now} (today)]
    (component-page
     {:title "Calendar Month"
      :group "Date & time"
      :tag "ty-calendar-month"
      :description "The bare month grid inside ty-calendar. No navigation, no own selection. You pick the month, the selected day and what every cell shows."
      :chips [["42 cells, Monday first" "grid"] ["Keyboard" "zap"] ["TyCalendarMonth (React)" "atom"]]
      :source "packages/core/src/components/calendar-month.ts"
      :mark "42"
      :demo [:ty-calendar-month {:display-year (str year)
                                 :display-month (str month)
                                 :replicant/on-mount (fn [{:replicant/keys [node]}]
                                                       (set! (.-value ^js node) (near-today-value)))}]}

     (playground
      {:id :calendar-month
       :defaults {:size "md" :flavor "primary" :locale "en-US"}
       :controls [{:key :size :options ["sm" "md" "lg"]}
                  {:key :flavor :options ["primary" "success" "danger" "warning"] :swatch? true :tones? true}
                  {:key :locale :options ["en-US" "de-DE" "ja-JP"]}]
       :render (fn [{:keys [size flavor locale]}]
                 [:ty-calendar-month {:display-year (str year)
                                      :display-month (str month)
                                      :size size
                                      :flavor flavor
                                      :locale locale
                                      :replicant/on-mount (fn [{:replicant/keys [node]}]
                                                            (set! (.-value ^js node) (near-today-value)))}])
       :snippets snippets})

     (page-section
      {:title "Examples" :sub "Copy, paste, ship."}
      (bento
       (example
        {:title "Availability"
         :span 6
         :description [:span [:code "dayContentFn"] " renders each cell; " [:code "customCSS"]
                       " styles it inside the shadow root. Theme variables pass straight through."]
         :tabs availability-snippets}
        [:div.min-w-0.flex.flex-wrap.items-center.gap-x-12.gap-y-4
         ;; lg is 360px wide, more than a phone's card: scroll there.
         [:div.max-w-full.overflow-x-auto
          [:ty-calendar-month {:display-year (str year)
                               :display-month (str month)
                               :size "lg"
                               :replicant/on-mount (fn [{:replicant/keys [node]}]
                                                     (set! (.-customCSS ^js node) availability-sheet)
                                                     (set! (.-dayContentFn ^js node) availability-day))}]]
         [:div.flex.flex-col.gap-3
          (map legend [["Open" "var(--ty-color-success)"]
                       ["Few left" "var(--ty-color-warning)"]
                       ["Booked" "var(--ty-text-faint)"]])]])

       (example
        {:title "Your own navigation"
         :span 3
         :description "Two grids, one month apart, driven by your state. Useful for range pickers and booking forms."
         :code "<ty-button id=\"prev\">‹</ty-button>
<ty-button id=\"next\">›</ty-button>

<ty-calendar-month display-year=\"2026\" display-month=\"9\">
<ty-calendar-month display-year=\"2026\" display-month=\"10\">"}
        (let [shown (or (get-in @state/state [:calendar-month-doc :shown]) now)
              step! #(swap! state/state assoc-in [:calendar-month-doc :shown] (shift-month shown %))]
          [:div.flex.flex-col.gap-3.w-full
           [:div.flex.items-center.justify-between
            [:ty-button {:size "sm" :action "" :on {:click #(step! -1)}}
             [:ty-icon {:name "chevron-left" :size "16"}]]
            [:ty-button {:size "sm" :action "" :on {:click #(step! 1)}}
             [:ty-icon {:name "chevron-right" :size "16"}]]]
           [:div.flex.flex-wrap.gap-6
            (for [m [shown (shift-month shown 1)]]
              [:div.flex.flex-col.gap-2 {:replicant/key (month-title m)}
               [:span.text-sm.font-semibold.ty-text++.pl-2 (month-title m)]
               [:ty-calendar-month {:display-year (str (:year m))
                                    :display-month (str (:month m))
                                    :size "sm"}]])]]))

       (example
        {:title "Selection"
         :span 3
         :description [:span "The grid doesn't select. Write " [:code "dayContext.localValue"] " back to " [:code "value"] "."]
         :tabs selection-snippets}
        (let [value (get-in @state/state [:calendar-month-doc :value])]
          [:div.flex.flex-col.items-start.gap-3
           [:ty-calendar-month {:display-year (str year)
                                :display-month (str month)
                                :size "sm"
                                ;; value is a property only (no attribute)
                                :replicant/on-render (fn [{:replicant/keys [node]}]
                                                       (set! (.-value ^js node) value))
                                :on {:day-click (fn [^js e]
                                                  (swap! state/state assoc-in [:calendar-month-doc :value]
                                                         (.. e -detail -dayContext -localValue)))}}]
           [:code.ty-text-.text-xs
            (if value
              (str "value = " value)
              "click a day")]]))

       (example
        {:title "JavaScript API"
         :tabs api-snippets}
        nil)))

     (page-section
      {:title "Theming" :sub "Tokens from outside, customCSS from inside." :dark? true}
      (example
       {:title "Accent"
        :side? true
        :lang "css"
        :description [:span "The same " [:code "--ty-calendar-*"] " tokens as " [:code "<ty-calendar>"] "."]
        :code "ty-calendar-month {
  --ty-calendar-accent: #f97316;
  --ty-calendar-today-accent: #facc15;
  --ty-calendar-day-radius: 999px;
}"}
       [:ty-calendar-month {:display-year (str year)
                            :display-month (str month)
                            :style {"--ty-calendar-accent" "#f97316"
                                    "--ty-calendar-today-accent" "#facc15"
                                    "--ty-calendar-day-radius" "999px"}
                            :replicant/on-mount (fn [{:replicant/keys [node]}]
                                                  (set! (.-value ^js node) (near-today-value)))}])

      (example
       {:title "Inside the shadow root"
        :side? true
        :lang "css"
        :description [:span "When a token isn't enough, " [:code "customCSS"] " targets the cells directly: "
                      [:code ".calendar-day-cell"] " with " [:code ".today"] ", " [:code ".weekend"] ", "
                      [:code ".other-month"] ", " [:code ".selected"] ", " [:code ".disabled"] "."]
        :code (str "/* grid.customCSS = sheet */\n" weekend-css)}
       [:ty-calendar-month {:display-year (str year)
                            :display-month (str month)
                            :replicant/on-mount (fn [{:replicant/keys [node]}]
                                                  (set! (.-customCSS ^js node) weekend-sheet))}]))

     (api-section
      {:attributes ["Month"
                    ["display-year" "number" "current" "Year shown."]
                    ["display-month" "number" "current" "Month shown, 1–12."]
                    ["min" "string" "Earliest enabled day (ISO YYYY-MM-DD)."]
                    ["max" "string" "Latest enabled day (ISO YYYY-MM-DD)."]
                    "Appearance"
                    ["size" "string" "\"md\"" "sm, md or lg."]
                    ["flavor" "string" "\"primary\"" "Selected-day fill: any flavor, with + and - tones."]
                    ["locale" "string" "Weekday names. Unset: the nearest lang attribute, then the browser's language."]]
       :properties [["value" "number" "Selected day as a local-midnight timestamp (dayContext.localValue)."]
                    ["dayContentFn" "(ctx) => HTMLElement | string" "Renders each cell. Receives DayContext: year, month, dayInMonth, weekend, otherMonth, today, isSelected, value, localValue."]
                    ["customCSS" "CSSStyleSheet" "Adopted into the shadow root, after the built-in styles."]
                    ["width" "string" "Explicit grid width, e.g. 320px. minWidth and maxWidth work the same way."]]
       :events [["day-click" "{year, month, day, value, dayContext, isToday, isWeekend, isOtherMonth}" "A day was clicked or chosen with Enter / Space. Bubbles, cancelable; not composed. day-select is an alias."]]
       :keyboard [["Arrows" "Move a day or a week. Stops at the grid edge; the grid never changes month on its own."]
                  ["Enter / Space" "Fire day-click for the focused day."]
                  ["Tab" "Enters and leaves the grid in one stop (roving tabindex)."]]
       :css-vars [["--ty-calendar-accent" "Selected day. Overrides the flavor."]
                  ["--ty-calendar-today-accent" "Today dot and number."]
                  ["--ty-calendar-day-radius" "Cell corner radius."]
                  ["--ty-calendar-day-color / -hover-bg" "Day text and hover."]
                  ["--ty-calendar-weekend-color" "Saturday and Sunday text."]
                  ["--ty-calendar-other-month-color" "Adjacent-month days."]
                  ["--ty-calendar-disabled-color / -opacity" "Days outside min / max."]
                  ["--ty-calendar-header-color" "Weekday header row."]]}))))
