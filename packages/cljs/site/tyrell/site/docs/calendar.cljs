(ns tyrell.site.docs.calendar
  "Documentation for ty-calendar component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section
                                             validation-properties]]
            [tyrell.site.state :as state]))

(defn- attrs->html
  "Render playground props as an attribute string, skipping defaults."
  [{:keys [size flavor locale navigation]}]
  (str/join "" [(when (not= size "md") (str " size=\"" size "\""))
                (when (not= flavor "primary") (str " flavor=\"" flavor "\""))
                (when (not= locale "en-US") (str " locale=\"" locale "\""))
                (when-not navigation " hide-navigation")]))

(defn- html-code
  "The HTML tab, plus `extra` attributes for the Datastar tab."
  [props extra]
  (str "<ty-calendar" (attrs->html props) extra ">\n</ty-calendar>"))

(defn- snippets [{:keys [size flavor locale navigation] :as props}]
  (let [kv (fn [k v] (str "\n  " k " \"" v "\""))]
    [["html" "HTML" "html" (html-code props "")]
     ["react" "React" "javascript"
      (str "import { TyCalendar } from 'tyrell-react'\n\n"
           "<TyCalendar"
           (when (not= size "md") (str "\n  size=\"" size "\""))
           (when (not= flavor "primary") (str "\n  flavor=\"" flavor "\""))
           (when (not= locale "en-US") (str "\n  locale=\"" locale "\""))
           (when-not navigation "\n  hideNavigation")
           "\n  onChange={(e) => setDate(e.detail)}\n/>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/Calendar\n {"
           (str/triml
            (str (when (not= size "md") (kv ":size" size))
                 (when (not= flavor "primary") (kv ":flavor" flavor))
                 (when (not= locale "en-US") (kv ":locale" locale))
                 (when-not navigation "\n  :hide-navigation true")
                 "\n  :on-change #(reset! date (.-detail %))"))
           "}]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-calendar\n {"
           (str/triml
            (str (when (not= size "md") (kv ":size" size))
                 (when (not= flavor "primary") (kv ":flavor" flavor))
                 (when (not= locale "en-US") (kv ":locale" locale))
                 (when-not navigation "\n  :hide-navigation true")
                 "\n  :on {:change #(set-date! (.-detail %))}"))
           "}]")]
     ;; value is the selected ISO date, so data-bind keeps $day in sync both ways
     ["datastar" "Datastar" "html" (html-code props "\n  data-bind=\"day\"")]]))

(defn- iso
  "Local YYYY-MM-DD (toISOString is UTC and can land on the wrong day)."
  [^js d]
  (let [pad #(.padStart (str %) 2 "0")]
    (str (.getFullYear d) "-" (pad (inc (.getMonth d))) "-" (pad (.getDate d)))))

(defn- near-today
  "A day in the current month other than today, so both markers show."
  []
  (let [d (js/Date.)
        day (.getDate d)]
    (.setDate d (if (> day 3) (- day 2) (+ day 2)))
    (iso d)))

(defn- today+ [days]
  (let [d (js/Date.)]
    (.setDate d (+ (.getDate d) days))
    (iso d)))

(defn- nightly-rate
  "Deterministic demo price: weekends cost more, a few mid-week dips."
  [^js ctx]
  (+ (if (.-weekend ctx) 149 109)
     (* 10 (mod (* 7 (.-dayInMonth ctx)) 4))))

(defn- price-day
  "dayContentFn for the pricing example: day number over its nightly rate."
  [^js ctx]
  (let [el (js/document.createElement "div")
        rate (nightly-rate ctx)]
    (set! (.. el -style -cssText)
          "display:flex;flex-direction:column;align-items:center;line-height:1.1;gap:2px")
    (set! (.-innerHTML el)
          (str "<span>" (.-dayInMonth ctx) "</span>"
               "<span style=\"font-size:0.62em;opacity:" (if (.-otherMonth ctx) 0 0.7) "\">€" rate "</span>"))
    el))

(defn view []
  (component-page
   {:title "Calendar"
    :group "Date & time"
    :tag "ty-calendar"
    :description "An inline month grid with a month and year view. Localized, keyboard-driven, form-associated. Controlled or self-managed."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyCalendar (React)" "atom"]]
    :source "packages/core/src/components/calendar.ts"
    :mark "31"
    :demo [:ty-calendar {:value (near-today)}]}

   (playground
    {:id :calendar
     :defaults {:size "md" :flavor "primary" :locale "en-US" :navigation true}
     :controls [{:key :size :options ["sm" "md" "lg"]}
                {:key :flavor :options ["primary" "success" "danger" "warning"] :swatch? true :tones? true}
                {:key :locale :options ["en-US" "de-DE" "ja-JP"]}
                {:key :navigation :switch? true}]
     :render (fn [{:keys [size flavor locale navigation]}]
               [:ty-calendar {:value (near-today)
                              :size size
                              :flavor flavor
                              :locale locale
                              :hide-navigation (when-not navigation true)}])
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Month & year view"
       :span 4
       :description [:span "Click the title to jump by month. The arrows step whole years there; "
                     [:kbd "Esc"] " goes back to days."]
       :code "<ty-calendar value=\"2026-09-24\"></ty-calendar>"}
      [:ty-calendar {:value (near-today)}])

     (example
      {:title "Min & max"
       :span 2
       :description "Days outside the range are disabled; navigation stops at the edges."
       :code (str "<ty-calendar min=\"" (today+ -3) "\"\n  max=\"" (today+ 21) "\">")}
      [:ty-calendar {:size "sm" :min (today+ -3) :max (today+ 21)}])

     (example
      {:title "Custom day content"
       :span 6
       :lang "javascript"
       :description [:span "Set " [:code "dayContentFn"] " (a property, not an attribute) to render anything in a day cell. It receives a "
                     [:code "DayContext"] ": " [:code "year"] ", " [:code "month"] ", " [:code "dayInMonth"] ", "
                     [:code "weekend"] ", " [:code "otherMonth"] ", " [:code "today"] ", " [:code "value"] "."]
       :code "const cal = document.querySelector('ty-calendar');

cal.dayContentFn = (ctx) => {
  const el = document.createElement('div');
  el.innerHTML = `<span>${ctx.dayInMonth}</span>
    <small>€${rateFor(ctx)}</small>`;
  return el;
};"}
      [:ty-calendar {:size "lg"
                     :replicant/on-mount (fn [{:replicant/keys [node]}]
                                           (set! (.-dayContentFn ^js node) price-day))}])

     (example
      {:title "Controlled"
       :span 3
       :description [:span "With " [:code "stateless"] " the calendar only reports. Clicks fire "
                     [:code "day-click"] "; you write " [:code "value"] " back."]
       :code "<ty-calendar stateless value=\"2026-09-24\"></ty-calendar>

cal.addEventListener('day-click', (e) => {
  const { year, month, day } = e.detail;
  cal.value = toISO(year, month, day);
});"}
      (let [value (or (get-in @state/state [:calendar-doc :controlled]) (near-today))]
        [:div.flex.flex-col.items-start.gap-3
         [:ty-calendar {:stateless ""
                        :size "sm"
                        :value value
                        :on {:day-click (fn [^js e]
                                          (let [d (.-detail e)
                                                pad #(.padStart (str %) 2 "0")]
                                            (swap! state/state assoc-in [:calendar-doc :controlled]
                                                   (str (.-year d) "-" (pad (.-month d)) "-" (pad (.-day d))))))}}]
         [:code.ty-text-.text-xs (str "value = \"" value "\"")]]))

     (example
      {:title "With an HTML form"
       :span 3
       :description [:span "Set " [:code "name"] " and the ISO date is in FormData on submit."]
       :code "<form>
  <ty-calendar name=\"event-date\"></ty-calendar>
  <ty-button type=\"submit\" size=\"md\">Submit</ty-button>
</form>
<!-- FormData: event-date=2026-09-24 -->"}
      [:form.flex.flex-col.items-start.gap-3
       {:on {:submit (fn [e]
                       (.preventDefault e)
                       (let [data (js/FormData. (.-target e))]
                         (js/alert (str "Date: " (.get data "event-date")))))}}
       [:ty-calendar {:name "event-date" :size "sm" :value (near-today)}]
       [:ty-button {:type "submit" :flavor "primary" :size "md"} "Submit"]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const cal = document.querySelector('ty-calendar');

cal.value = '2026-12-24';           // select and show that month
cal.min = '2026-01-01';             // clamp selection and navigation

cal.addEventListener('change', (e) => {
  const { year, month, day, dayContext } = e.detail;
});

cal.addEventListener('navigate', (e) => {
  const { year, month } = e.detail; // fires for arrows, month view, Page Up/Down
});"}
      nil)))

   (page-section
    {:title "Theming" :sub "CSS variables. No build step." :dark? true}
    (example
     {:title "Accent"
      :side? true
      :lang "css"
      :description "Selected day and today marker, independent of the flavor."
      :code "ty-calendar {
  --ty-calendar-accent: hotpink;
  --ty-calendar-today-accent: gold;
}"}
     [:ty-calendar {:style {"--ty-calendar-accent" "hotpink"
                            "--ty-calendar-today-accent" "gold"}
                    :value (near-today)}])

    (example
     {:title "Day cells"
      :side? true
      :lang "css"
      :description "Shape and colors of the grid itself. Weekends can carry their own tone."
      :code "ty-calendar {
  --ty-calendar-day-radius: 999px;
  --ty-calendar-day-hover-bg: #7c2d12;
  --ty-calendar-weekend-color: #fb923c;
}"}
     [:ty-calendar {:style {"--ty-calendar-day-radius" "999px"
                            "--ty-calendar-day-hover-bg" "#7c2d12"
                            "--ty-calendar-day-hover-color" "#ffedd5"
                            "--ty-calendar-weekend-color" "#fb923c"}
                    :value (near-today)}])

    (example
     {:title "Navigation"
      :side? true
      :lang "css"
      :description "Title, year and arrow buttons. The focus outline follows the accent unless set."
      :code "ty-calendar {
  --ty-calendar-nav-title-color: #5eead4;
  --ty-calendar-nav-year-color: #2dd4bf;
  --ty-calendar-nav-border: #115e59;
  --ty-calendar-nav-hover-bg: #134e4a;
}"}
     [:ty-calendar {:style {"--ty-calendar-nav-title-color" "#5eead4"
                            "--ty-calendar-nav-year-color" "#2dd4bf"
                            "--ty-calendar-nav-border" "#115e59"
                            "--ty-calendar-nav-hover-bg" "#134e4a"
                            "--ty-calendar-nav-hover-color" "#ccfbf1"
                            "--ty-calendar-accent" "#14b8a6"}
                    :value (near-today)}]))

   (api-section
    {:properties validation-properties
     :attributes ["Value"
                  ["value" "string" "\"\"" "Selected date as ISO YYYY-MM-DD. Also sets the displayed month."]
                  ["name" "string" "Form field name. Submits the ISO value with its form."]
                  ["min" "string" "Earliest selectable date (ISO). Earlier days are disabled and navigation is clamped."]
                  ["max" "string" "Latest selectable date (ISO). Later days are disabled and navigation is clamped."]
                  ["year / month / day" "number" "current" "Displayed month and selected day as separate numbers. Prefer value."]
                  "Appearance"
                  ["size" "string" "\"md\"" "sm, md or lg. Clears width."]
                  ["width" "string" "Explicit width, e.g. 320px. Clears size."]
                  ["flavor" "string" "\"primary\"" "Selected-day fill: any flavor, with + and - tones (success+, danger-)."]
                  ["locale" "string" "\"en-US\"" "Day and month names, e.g. de-DE. Falls back to the nearest lang attribute."]
                  ["hide-navigation" "boolean" "false" "Drop the title and arrow bar. Bare attribute, like disabled."]
                  "Behavior"
                  ["stateless" "boolean" "false" "Never updates itself. Clicks fire day-click; the parent sets value."]]
     :events [["change" "{year, month, day, action, source, dayContext}" "A day was selected (not fired in stateless mode)."]
              ["navigate" "{year, month, action, source}" "The displayed month changed: arrows, month view or Page Up/Down."]
              ["day-click" "{year, month, day, value, dayContext}" "Stateless mode only: a day was clicked. Cancelable."]]
     :keyboard [["Arrows" "Move between days; in the month view, between months."]
                ["Enter / Space" "Select the focused day or month."]
                ["Page Up / Page Down" "Previous / next month."]
                ["Shift + Page Up / Down" "Previous / next year."]
                ["Title button" "Opens the month/year view. Arrows there step years; Escape goes back to days."]]
     :css-vars [["--ty-calendar-accent" "Selected day. Overrides the flavor."]
                ["--ty-calendar-today-accent" "Today dot and outline."]
                ["--ty-calendar-selected-bg / -color" "Selected fill and text, when accent isn't enough."]
                ["--ty-calendar-day-radius" "Day cell corner radius."]
                ["--ty-calendar-day-color / -hover-bg / -hover-color" "Day text and hover."]
                ["--ty-calendar-weekend-color" "Saturday and Sunday text."]
                ["--ty-calendar-other-month-color" "Leading and trailing days of adjacent months."]
                ["--ty-calendar-header-color" "Weekday header row."]
                ["--ty-calendar-nav-title-color / -year-color" "Title month and year."]
                ["--ty-calendar-nav-border / -hover-bg / -color" "Arrow buttons."]]})))
