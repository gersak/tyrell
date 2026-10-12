(ns tyrell.site.views.landing
  (:require
   [clojure.string :as str]
   [tyrell.router :as router]
   [tyrell.site.docs.common :as common]
   [tyrell.site.docs.quickstart :as quickstart]
   [tyrell.site.versions :as versions]
   [tyrell.site.views.contact-form :as contact-form]
   [tyrell.site.views.event-booking :as event-booking]
   [tyrell.site.views.user-profile :as user-profile]))

(defn- go!
  "Navigate to a docs route and scroll the main pane back to the top."
  [route-id]
  (router/navigate! route-id)
  (when-let [main-element (.querySelector js/document "main.overflow-auto")]
    (.scrollTo main-element #js {:top 0 :behavior "smooth"})))

(defn- kicker [text]
  [:p.text-xs.font-semibold.ty-text-primary {:style {:letter-spacing "0.12em"}} text])

(defn- section-heading [text]
  [:h2.ty-text++.font-bold
   {:style {:font-size "clamp(1.75rem, 3vw, 2.5rem)"
            :line-height "1.1"
            :letter-spacing "-0.03em"}}
   text])

(defn- band
  "Full-bleed section: the background runs edge to edge, the content keeps
   the page column."
  [attrs & children]
  [:div attrs
   (into [:div.mx-auto.px-4.sm:px-6.lg:px-8 {:style {:max-width "1280px"}}]
         children)])

;; The CTA's three ways in. The CDN line copies all three tags: the script
;; alone renders unstyled components.
(def ^:private install-routes
  [["globe" "Any page · CDN" quickstart/cdn-tags]
   ["package" "React, Vue, Svelte · npm" "npm i tyrell-components"]
   ["braces" "ClojureScript · Clojars" (str "dev.gersak/tyrell {:mvn/version \"" versions/TYRELL_VERSION "\"}")]])

(defn- install-command []
  [:ty-copy {:value "npm i tyrell-components" :format "code"}])

;; ---------------------------------------------------------------------------
;; Hero
;; ---------------------------------------------------------------------------

(def ^:private ink-button
  "Near-black primary action built from theme tokens, so it inverts in dark mode."
  {:--ty-button-bg "var(--ty-text-strong)"
   :--ty-button-bg-hover "var(--ty-text-bold)"
   :--ty-button-color "var(--ty-surface-canvas)"})

(defn- keycap [k]
  [:kbd.inline-flex.items-center.justify-center.rounded.border.ty-border.font-mono.ty-text
   {:replicant/key k
    :style {:min-width "1.25rem" :padding "0 5px" :font-size "11px" :line-height "17px"
            :border-bottom-width "2px" :background "var(--ty-surface-elevated)"}}
   k])

(defn- booking-panel
  "Hero demo: one form built from five primitives on a real grid, with the
   keyboard map in its footer instead of a claim floating beside it."
  []
  [:div.ty-elevated.w-full.rounded-2xl.border.ty-border.overflow-hidden
   {:class ["@container"]
    :style {:box-shadow "0 24px 48px -16px rgb(0 0 0 / 0.18), 0 2px 6px rgb(0 0 0 / 0.04)"}}
   [:div.flex.items-center.justify-between.gap-3.px-5.py-3.border-b.ty-border
    [:div.flex.items-baseline.gap-3.min-w-0
     [:span.text-sm.font-semibold.ty-text++ "New booking"]
     [:span.font-mono.ty-text--.truncate {:class ["hidden" "@md:inline"] :style {:font-size "11px"}} "5 primitives · 0 wrappers"]]
    [:span.inline-flex.items-center.rounded-full.text-xs.font-medium.ty-bg-success-.ty-text-success.shrink-0 {:class ["gap-1.5" "px-2.5" "py-0.5"]}
     [:span.inline-block.rounded-full {:class ["w-1.5" "h-1.5"] :style {:background "currentColor"}}]
     "Draft saved"]]
   [:div.flex.flex-col {:class ["@md:flex-row"]}
    [:div.p-4.flex.justify-center.border-b.ty-border {:class ["@md:border-b-0" "@md:border-r"]}
     [:ty-calendar {:size "sm" :value "2026-09-24"}]]
    [:div.flex-1.min-w-0.flex.flex-col.gap-4.p-4
     [:ty-select {:label "Timezone" :value "Europe/Zagreb"}
      [:ty-option {:value "Europe/London"} "Europe/London"]
      [:ty-option {:value "Europe/Zagreb"} "Europe/Zagreb"]
      [:ty-option {:value "America/New_York"} "America/New_York"]
      [:ty-option {:value "Asia/Tokyo"} "Asia/Tokyo"]]
     [:div.flex.flex-col.gap-2
      [:ty-select {:id "hero-stack" :label "Stack" :multiple true :compact true
                   :placeholder "Add framework" :value "cljs,react,htmx"}
       [:ty-option {:value "cljs" :flavor "primary"} "ClojureScript"]
       [:ty-option {:value "react" :flavor "success"} "React"]
       [:ty-option {:value "htmx" :flavor "warning"} "HTMX"]
       [:ty-option {:value "vue"} "Vue"]
       [:ty-option {:value "svelte"} "Svelte"]]
      [:div.flex.flex-wrap.gap-2
       [:ty-selected-options {:for "hero-stack"}
        [:template
         [:ty-tag {:flavor "{flavor}" :size "sm" :dismissible true} "{label}"]]]]]
     [:div.flex-1]
     [:div.flex.flex-col.gap-3.pt-4.border-t.ty-border
      [:label.flex.items-center.justify-between.gap-3.cursor-pointer.text-sm.ty-text
       "Auto-save drafts" [:ty-switch {:flavor "success" :checked ""}]]
      [:label.flex.items-center.justify-between.gap-3.cursor-pointer.text-sm.ty-text
       "Two-factor auth" [:ty-switch]]]]]
   [:div.flex.items-center.justify-end.gap-4.pl-5.pr-3.border-t.ty-border {:class ["py-2.5"] :style {:background "color-mix(in oklch, var(--ty-text-strong) 4%, transparent)"}}
    ;; Keyboard hints only where there's room (and a keyboard, usually)
    [:ty-icon.ty-text-- {:class ["hidden" "@md:inline-flex"] :name "keyboard" :size "sm"}]
    [:div.flex-1.flex-wrap.items-center.gap-x-4.gap-y-1.text-xs.ty-text- {:class ["hidden" "@md:flex"]}
     (for [[ks label] [[["←" "→"] "move"] [["↵"] "select"] [["Esc"] "close"] [["Tab"] "next field"]]]
       (into [:span.inline-flex.items-center.gap-1 {:replicant/key label}]
             (concat (map keycap ks) [[:span {:class ["ml-0.5"]} label]])))]
    [:ty-button {:size "sm" :style ink-button}
     "Book" [:ty-icon {:slot "end" :name "arrow-right"}]]]])

(declare primitive-count)

(defn- hero []
  [:section {:id "top" :class ["@container" "pt-12" "pb-24"]}
   [:div.flex.flex-col.gap-12 {:class ["@5xl:flex-row" "@5xl:items-center"]}
    [:div.flex.flex-col.gap-7.flex-1.min-w-0
     [:button.self-start.inline-flex.items-center.gap-2.rounded-full.ty-elevated.border.ty-border.pl-1.pr-3.py-1.cursor-pointer
      {:on {:click #(go! :tyrell.site.docs/getting-started)}}
      [:span.ty-bg-success.ty-text-success++.rounded-full.px-2.text-xs.font-semibold.font-mono {:class ["py-0.5"]}
       versions/TYRELL_COMPONENTS_VERSION]
      [:span.text-xs.font-medium.ty-text "tyrell-components on npm"]
      [:ty-icon.ty-text- {:name "arrow-right" :size "xs"}]]
     [:div.flex.flex-col.gap-5
      [:h1.ty-text++.font-bold
       {:style {:font-size "clamp(2.5rem, 5vw, 3.75rem)"
                :line-height "1.05"
                :letter-spacing "-0.035em"}}
       "Interaction primitives for every stack."]
      [:p.text-lg.ty-text-.leading-relaxed.max-w-xl
       "Calendars, selects, date pickers and modals as Web Components. They inherit your design system and run in React, Vue, HTMX, ClojureScript or plain HTML."]]
     [:div.flex.flex-wrap.items-center.gap-3
      [:ty-button {:size "lg"
                   :style ink-button
                   :on {:click #(go! :tyrell.site.docs/getting-started)}}
       "Get started"
       [:ty-icon {:slot "end" :name "arrow-right"}]]
      [:div {:style {:min-width "16rem"}} (install-command)]]
     [:div.flex.flex-wrap.gap-x-8.gap-y-4.pt-6.border-t.ty-border
      (for [[value label] [["0" "dependencies"]
                           ["70 kB" (str "compressed, all " (primitive-count))]
                           ["3000+" "icons, tree-shaken"]]]
        [:div {:replicant/key label}
         [:p.text-2xl.font-bold.ty-text++ {:style {:letter-spacing "-0.02em"}} value]
         [:p.text-sm.ty-text- label]])]]
    ;; Fixed-width column in the row layout; centered under the copy when stacked.
    [:div.w-full.shrink-0 {:class ["mx-auto" "@5xl:mx-0"] :style {:max-width "36rem"}}
     (booking-panel)]]])

;; ---------------------------------------------------------------------------
;; Frameworks
;; ---------------------------------------------------------------------------

(def ^:private framework-snippets
  [["react" "React" "javascript"
    "import { TyDatePicker } from 'tyrell-react'

<TyDatePicker
  label=\"Check-in\"
  onChange={(e) => setDate(e.detail.value)}
/>"]
   ["vue" "Vue" "html"
    "<ty-date-picker
  label=\"Check-in\"
  @change=\"date = $event.detail.value\"
/>"]
   ["htmx" "HTMX" "html"
    "<form hx-post=\"/bookings\" hx-trigger=\"change\">
  <ty-date-picker name=\"check-in\" label=\"Check-in\">
  </ty-date-picker>
</form>"]
   ["datastar" "Datastar" "html"
    "<div data-signals=\"{checkIn: ''}\">
  <ty-date-picker label=\"Check-in\"
    data-on:change=\"$checkIn = evt.detail.localValue\">
  </ty-date-picker>
  <p data-text=\"$checkIn\"></p>
</div>"]
   ["replicant" "Replicant" "clojure"
    "[:ty-date-picker
 {:label \"Check-in\"
  :on {:change #(set-date! (.. % -detail -value))}}]"]
   ["html" "HTML" "html"
    "<ty-date-picker label=\"Check-in\"></ty-date-picker>

<script>
  document.querySelector('ty-date-picker')
    .addEventListener('change', (e) => console.log(e.detail.value))
</script>"]])

(defn- frameworks []
  [:section {:class ["@container" "py-24"]}
   [:style common/code-theme-css]
   [:div {:class ["flex" "flex-col" "gap-10" "@4xl:flex-row" "@4xl:items-center"]}
    [:div.flex.flex-col.gap-5 {:class ["@4xl:w-2/5" "shrink-0"]}
     (kicker "FRAMEWORK-OPTIONAL")
     (section-heading "Frameworks change. Primitives don't.")
     [:p.ty-text-.leading-relaxed
      "Every Tyrell primitive is a standard Custom Element. Your framework renders it, the browser runs it. React 19, Vue 4 or whatever comes next, the markup stays the same."]
     [:ul.flex.flex-col.gap-3.pt-2
      (for [text ["Typed React wrappers in tyrell-react"
                  "ClojureScript router, i18n and layout in dev.gersak/tyrell"
                  "Plain change events, read from event.detail.value"]]
        [:li.flex.items-center.gap-3.text-sm.ty-text {:replicant/key text}
         [:ty-icon.ty-text-success {:name "check" :size "sm"}]
         text])]]
    [:div.ty-elevated.rounded-xl.border.ty-border.overflow-hidden.flex-1.min-w-0.w-full
     [:ty-tabs {:width "100%" :height "272px"}
      (for [[id label lang code] framework-snippets]
        [:ty-tab {:replicant/key id :id id :label label}
         (common/code-view code lang)])]
     [:div.flex.items-center.gap-2.px-5.py-3.border-t.ty-border.text-xs.ty-text-
      [:ty-icon {:name "code" :size "xs"}]
      "Every tab renders the same <ty-date-picker> element."]]]])

;; ---------------------------------------------------------------------------
;; Catalog
;; ---------------------------------------------------------------------------

(def ^:private catalog
  [["Inputs" "form-input"
    [["Button" "ty-button" :tyrell.site.docs/button]
     ["Input" "ty-input" :tyrell.site.docs/input-field]
     ["Textarea" "ty-textarea" :tyrell.site.docs/textarea]
     ["Checkbox" "ty-checkbox" :tyrell.site.docs/checkbox]
     ["Switch" "ty-switch" :tyrell.site.docs/switch]
     ["Radio Group" "ty-radio-group" :tyrell.site.docs/radio]
     ["File Upload" "ty-file-upload" :tyrell.site.docs/file-upload]]]
   ["Selection" "list"
    [["Select" "ty-select" :tyrell.site.docs/select]
     ["Tag" "ty-tag" :tyrell.site.docs/tag]]]
   ["Date & time" "calendar"
    [["Date Picker" "ty-date-picker" :tyrell.site.docs/date-picker]
     ["Calendar" "ty-calendar" :tyrell.site.docs/calendar]
     ["Calendar Month" "ty-calendar-month" :tyrell.site.docs/calendar-month]]]
   ["Overlays" "layers"
    [["Modal" "ty-modal" :tyrell.site.docs/modal]
     ["Popup" "ty-popup" :tyrell.site.docs/popup]
     ["Tooltip" "ty-tooltip" :tyrell.site.docs/tooltip]]]
   ["Structure" "layout"
    [["Tabs" "ty-tabs" :tyrell.site.docs/tabs]
     ["Wizard" "ty-wizard" :tyrell.site.docs/wizard]
     ["Scroll Container" "ty-scroll-container" :tyrell.site.docs/scroll-container]
     ["Resize Observer" "ty-resize-observer" :tyrell.site.docs/resize-observer]
     ["Copy" "ty-copy" :tyrell.site.docs/copy-field]
     ["Icon" "ty-icon" :tyrell.site.docs/icon]]]])

(defn- primitive-count
  "Distinct elements in the catalog, so every count on the page agrees."
  []
  (count (distinct (map second (mapcat last catalog)))))

(defn- primitives-catalog []
  [:section.py-24 {:class ["@container"]}
   [:div.gap-6.items-end.mb-12 {:class ["@3xl:grid-cols-2"] :style {:display "grid"}}
    [:div.flex.flex-col.gap-4
     (kicker "THE CATALOG")
     (section-heading (str (primitive-count) " primitives. Fixed scope."))]
    [:p.ty-text-.leading-relaxed
     "Tyrell has no grid system and no button variants you'd override anyway. It covers the interactive parts that take weeks to build well."]]
   [:div.grid.gap-x-6.gap-y-10
    {:style {:grid-template-columns "repeat(auto-fit, minmax(150px, 1fr))"}}
    (for [[group icon items] catalog]
      [:div.border-t-2.ty-border++.pt-4 {:replicant/key group}
       [:div.flex.items-center.gap-2.mb-3
        [:ty-icon.ty-text-primary {:name icon :size "sm"}]
        [:h3.font-semibold.ty-text++.flex-1 group]
        [:span.text-xs.font-mono.ty-text-- (str (when (< (count items) 10) "0") (count items))]]
       [:ul
        (for [[label tag route-id] items]
          [:li {:replicant/key label}
           [:button.w-full.text-left.py-2.cursor-pointer.group
            {:on {:click #(go! route-id)}}
            [:span.block.text-sm.font-medium.ty-text++.group-hover:underline label]
            [:span.block.text-xs.font-mono.ty-text-- (str "<" tag ">")]]])]])]])

;; ---------------------------------------------------------------------------
;; Theming
;; ---------------------------------------------------------------------------

(def ^:private hand-font "'Patrick Hand', 'Comic Sans MS', cursive")

(def ^:private brands
  [{:name "Default"
    :dark? false
    :card-radius "12px"
    :vars {}}
   {:name "Warm studio"
    :dark? false
    :card-radius "28px"
    :code-style {:font-family hand-font :font-size "0.875rem" :border-radius "999px" :padding "2px 12px"}
    :vars {:--ty-primary-hue "40"
           :--ty-primary-chroma "0.14"
           :--ty-radius-sm "999px"
           :--ty-radius-base "999px"
           :--ty-radius-md "999px"
           ;; lg rounds floating surfaces (the date picker's calendar popup);
           ;; pill-shaped, a popup turns into a circle.
           :--ty-radius-lg "22px"
           :--ty-radius-full "999px"
           :--ty-font-sans hand-font
           :font-family hand-font}}
   {:name "Night ops"
    :dark? true
    :card-radius "0px"
    :code-style {:border-radius "0px"}
    :vars {:--ty-primary-hue "165"
           :--ty-primary-chroma "0.12"
           :--ty-radius-sm "0px"
           :--ty-radius-base "0px"
           :--ty-radius-md "0px"
           :--ty-radius-lg "0px"
           :--ty-radius-full "0px"
           :--ty-font-sans "var(--ty-font-mono)"
           :font-family "var(--ty-font-mono)"}}])

(defn- brand-card [{:keys [name dark? vars card-radius code-style]}]
  [:div.ty-content.border.ty-border.p-5.flex.flex-col.gap-4
   {:replicant/key name
    :data-ty-theme ""
    :class (when dark? "dark")
    :style (assoc vars :border-radius card-radius)}
   [:div.flex.items-center.justify-between
    [:span.text-sm.font-semibold.ty-text++ name]
    [:span.inline-block.w-3.h-3.rounded-full {:style {:background "var(--ty-color-primary)"}}]]
   [:ty-date-picker {:label "Check-in" :value "2026-09-22" :flavor "primary"}]
   [:div.flex.items-center.gap-3
    [:ty-tag {:flavor "primary"} "5 nights"]
    [:ty-switch {:flavor "primary" :checked ""}]
    [:div.flex-1]
    [:ty-button {:flavor "primary" :size "sm"} "Reserve"]]
   [:code.text-xs.ty-text-.pt-3.border-t.ty-border {:style code-style}
    (if (seq vars)
      (str "--ty-primary-hue: " (get vars :--ty-primary-hue) ";")
      "/* defaults */")]])

(defn- theming []
  [:section.py-24 {:class ["@container"]}
   [:div.flex.flex-col.gap-4.max-w-2xl.mb-10
    (kicker "BRING YOUR OWN DESIGN SYSTEM")
    (section-heading "Your look. Tyrell's interaction logic.")
    [:p.ty-text-.leading-relaxed
     "Tyrell handles focus, keyboard navigation, positioning and ARIA. Color, type and spacing come from CSS variables you already own. These three cards run the same components with different variables."]
    [:ty-button.self-start.mt-2 {:size "lg" :appearance "outlined"
                                 :on {:click #(go! :tyrell.site.docs/theming)}}
     "Make it yours"
     [:ty-icon {:slot "end" :name "arrow-right"}]]]
   [:div
    [:div {:class ["gap-5" "@3xl:grid-cols-3"] :style {:display "grid"}}
     (map brand-card brands)]
    [:div {:class ["gap-8" "mt-12" "@3xl:grid-cols-3"] :style {:display "grid"}}
     (for [[icon title text] [["accessibility" "Accessible by default"
                               "ARIA roles, focus management and full keyboard support in every primitive."]
                              ["smartphone" "Mobile-ready"
                               "Popups, calendars and selects adapt to touch and small screens."]
                              ["palette" "3000+ icons, tree-shaken"
                               "Lucide, Heroicons, Material Design and FontAwesome. Only the icons you use are bundled."]]]
       [:div.flex.gap-4 {:replicant/key title}
        [:div.ty-bg-primary-.rounded-lg.w-10.h-10.flex-shrink-0.flex.items-center.justify-center
         [:ty-icon.ty-text-primary {:name icon :size "md"}]]
        [:div
         [:h3.font-semibold.ty-text++.mb-1 title]
         [:p.text-sm.ty-text-.leading-relaxed text]]])]]])

;; ---------------------------------------------------------------------------
;; Live examples
;; ---------------------------------------------------------------------------

(def ^:private form-theme
  "Trial of the redesign's form look, scoped to the live examples preview.
   Field-size tokens are declared on each component's :host, so those two
   must target the elements themselves; the rest inherits normally."
  ".landing-form {
  --ty-label-color: var(--ty-text);
  --ty-input-bg: var(--ty-surface-floating);
  --ty-input-border: var(--ty-border);
  --ty-input-border-hover: var(--ty-border-strong);
  --ty-radius-base: 8px;
  --ty-radius-md: 8px;
}
.landing-form :is(ty-input, ty-select, ty-textarea, ty-date-picker) {
  --ty-field-outer-pad-x: 0px;
  --ty-field-height: 2.25rem;
}")

(def ^:private examples
  [{:id "user-profile"
    :route-id :tyrell.site.core/landing-user-profile
    :title "User Profile"
    :icon "user"
    :source "user_profile.cljs"
    :tags ["ty-input" "ty-select" "ty-textarea" "ty-switch" "ty-checkbox" "ty-tag" "ty-button" "ty-modal"]
    :view user-profile/view}
   {:id "event-booking"
    :route-id :tyrell.site.core/landing-event-booking
    :title "Event Booking"
    :icon "calendar"
    :source "event_booking.cljs"
    :tags ["ty-calendar" "ty-select" "ty-input" "ty-textarea" "ty-tag" "ty-button" "ty-modal"]
    :view event-booking/view}
   {:id "contact-form"
    :route-id :tyrell.site.core/landing-contact-form
    :title "Contact Form"
    :icon "mail"
    :source "contact_form.cljs"
    :tags ["ty-input" "ty-select" "ty-textarea" "ty-checkbox" "ty-tag" "ty-button" "ty-modal"]
    :view contact-form/view}])

(def ^:private inspect-tags
  ["ty-input" "ty-select" "ty-textarea" "ty-switch" "ty-checkbox" "ty-date-picker"
   "ty-calendar" "ty-button" "ty-tag" "ty-radio-group" "ty-file-upload" "ty-copy"])

(def ^:private inspect-css
  "Inspect mode: outline every primitive in the preview and label it with its
   tag. Pseudo-elements render on the custom element hosts, so it's pure CSS."
  (let [sel (str "[data-inspect] .landing-form :is(" (str/join ", " inspect-tags) ")")]
    (str sel " { position: relative; outline: 1px solid var(--tyrell-brand); outline-offset: 3px; }\n"
         sel "::after { position: absolute; top: -10px; right: 6px; z-index: 5; pointer-events: none;"
         " padding: 0 5px; border-radius: 3px; font: 500 10px/1.5 var(--ty-font-mono);"
         " white-space: nowrap; background: var(--tyrell-brand); color: oklch(0.2 0.02 42); }\n"
         (str/join "\n" (for [t inspect-tags]
                          (str "[data-inspect] .landing-form " t "::after { content: \"<" t ">\"; }"))))))

(defn- toggle-inspect! [e]
  (when-let [stage (.closest (.-target e) "[data-stage]")]
    (if (.. e -detail -checked)
      (.setAttribute stage "data-inspect" "")
      (.removeAttribute stage "data-inspect"))))

(defn- example-switcher
  "Segmented control: which live example the stage shows."
  [active]
  [:div.flex.items-center.gap-1.p-1.rounded-2xl.border.ty-border
   {:role "tablist" :class ["w-full" "@2xl:w-auto"] :style {:background "var(--ty-surface-elevated)"}}
   (for [{:keys [id route-id title icon] :as example} examples
         :let [active? (= example active)]]
     [:button.flex-1.inline-flex.items-center.justify-center.gap-2.rounded-xl.px-3.py-2.text-sm.font-semibold.whitespace-nowrap.cursor-pointer.transition-colors
      {:replicant/key id
       :role "tab"
       :aria-selected (str active?)
       :class (into ["@2xl:flex-none" "@2xl:px-4"] (when-not active? ["ty-text-" "hover:ty-text++"]))
       :style (when active?
                {:background "var(--ty-text-strong)"
                 :color "var(--ty-surface-canvas)"
                 :box-shadow "0 6px 16px -6px rgb(0 0 0 / 0.35)"})
       :on {:click #(router/navigate! route-id)}}
      [:ty-icon {:class ["hidden" "@md:inline-flex"] :name icon :size "sm"}]
      title])])

(defn- live-examples
  "One example at a time. The active one follows the route, so the existing
   #user-profile / #event-booking / #contact-form links keep working."
  []
  (let [active (or (some #(when (router/rendered? (:route-id %) true) %) examples)
                   (first examples))]
    [:section.py-24.scroll-mt-6.flex.flex-col.gap-10 {:id "live-examples"
                                                      :class ["@container"]}
     ;; Hash anchors for the example routes, all landing on this section.
     ;; Zero-height, and the negative margin cancels its flex gap.
     [:div.h-0 {:style {:margin-bottom "-2.5rem"}}
      (for [{:keys [id]} examples]
        [:span.block.scroll-mt-6 {:replicant/key id :id id}])]
     [:div.flex.flex-col.gap-6 {:class ["@4xl:flex-row" "@4xl:items-end" "@4xl:justify-between"]}
      [:div.flex.flex-col.gap-4
       (kicker "LIVE EXAMPLES")
       (section-heading "Real forms, built only from Tyrell.")]
      [:p.ty-text-.leading-relaxed {:style {:max-width "26rem"}}
       "Every example below is running, not a screenshot. Flip on Inspect to see which primitive is which, or open the source."]]
     [:div.rounded-3xl.border.ty-border.p-3.md:p-6.flex.flex-col.gap-4
      {:data-stage ""
       ;; Satin: grey bands sweeping across the wrapper, fading out toward the
       ;; bottom, no hue. --ty-text-strong
       ;; mixed into transparency is a soft shadow in light mode and a soft
       ;; sheen in dark, from the same CSS.
       :style {:background (let [ink #(str "color-mix(in oklab, var(--ty-text-strong) calc(" % "% * var(--satin, 1)), transparent)")]
                             ;; first layer paints on top: the fade covers the
                             ;; bands' lower edge so they dissolve, not stop
                             ;; percentages, so the sweep reaches down the side
                             ;; gutters on every example, however tall
                             (str "linear-gradient(to bottom, transparent 12%, var(--ty-surface-content) 82%), "
                                  "linear-gradient(100deg, " (ink 10) " 0%, transparent 24%, " (ink 6) " 50%, transparent 74%, " (ink 9) " 100%), "
                                  "var(--ty-surface-content)"))}}
      [:style inspect-css]
      ;; dark mode: the satin bands mix in near-white text, so tone them down
      [:style ".dark [data-stage] { --satin: 0.55; }"]
      [:div.flex.flex-wrap.items-center.justify-between.gap-3
       (example-switcher active)
       [:div.flex.items-center.gap-4
        [:label.inline-flex.items-center.gap-2.text-sm.font-medium.ty-text.cursor-pointer
         [:ty-icon {:name "scan-eye" :size "sm"}]
         "Inspect"
         ;; Inspect is a Tyrell tool, not part of the demo: brand colored
         [:ty-switch {:style {:--ty-color-primary "var(--tyrell-brand)"} :on {:change toggle-inspect!}}]]
        [:a.inline-flex.items-center.rounded-full.border.ty-border.px-3.text-xs.font-mono.ty-text.hover:ty-text-primary {:class ["gap-1.5" "py-1.5"] :href (str "https://github.com/gersak/tyrell/blob/master/packages/cljs/site/tyrell/site/views/"
                     (:source active))
          :target "_blank"
          :rel "noopener noreferrer"}
         [:ty-icon {:name "code" :size "xs"}]
         (:source active)]]]
      [:div.px-1
       [:div.flex.flex-wrap.items-center.gap-2
        [:span.inline-flex.items-center.gap-2.text-xs.font-semibold.uppercase.ty-text-
         {:style {:letter-spacing "0.08em"}}
         [:span.inline-block.w-2.h-2.rounded-full {:style {:background "var(--ty-color-success)"}}]
         "Live · built with"]
        (for [t (:tags active)]
          [:span.font-mono.ty-text.rounded-md.border.ty-border {:class ["px-1.5"] :replicant/key t
            :style {:font-size "11px" :line-height "18px"
                    :background "color-mix(in oklch, var(--ty-surface-elevated) 70%, transparent)"}}
           (str "<" t ">")])]]
      [:div.ty-elevated.rounded-2xl.border.ty-border.overflow-hidden.min-w-0
       {:style {:box-shadow "0 24px 56px -20px rgb(0 0 0 / 0.25)"}}
       [:style form-theme]
       [:div.landing-form.p-2.sm:p-8 {:replicant/key (:id active)}
        ((:view active))]]]]))

;; ---------------------------------------------------------------------------
;; Closing
;; ---------------------------------------------------------------------------

(defn- closing []
  [:section.pb-20 {:class ["@container"]}
   [:div.dark.ty-canvas.ty-text.rounded-2xl.px-6.py-12.border.ty-border
    {:data-ty-theme ""
     :style common/brand-inherit
     :class ["@3xl:px-12" "flex" "flex-col" "gap-8" "@3xl:flex-row" "@3xl:items-center" "@3xl:justify-between"]}
    [:div.flex.flex-col.gap-3.max-w-xl
     (section-heading "One package. Every stack.")
     [:p.ty-text-.leading-relaxed
      "Script tags for any server-rendered page, npm for JavaScript frameworks, Clojars for ClojureScript. MIT licensed."]
     [:div.flex.flex-wrap.gap-3.pt-3
      [:ty-button {:style ink-button :on {:click #(go! :tyrell.site.docs/getting-started)}}
       "Get started" [:ty-icon {:slot "end" :name "arrow-right"}]]
      [:a {:href "https://github.com/gersak/tyrell"}
       [:ty-button {:appearance "outlined"
                    :style {:--ty-button-color "var(--ty-text-strong)"
                            :--ty-button-border "var(--ty-border-strong)"}}
        [:ty-icon {:slot "start" :name "github"}]
        "Star on GitHub"]]]]
    [:div.flex.flex-col.gap-3.w-full {:style {:max-width "30rem"}}
     (for [[icon label value] install-routes]
       [:div.flex.flex-col {:replicant/key label :class ["gap-1.5"]}
        [:span.flex.items-center.gap-2.text-xs.font-medium.ty-text--
         [:ty-icon {:name icon :size "xs"}] label]
        [:ty-copy {:value value :format "code"}]])]]
   [:div {:class ["grid" "gap-8" "mt-12" "@3xl:grid-cols-3"]}
    (for [[icon title text href] [["bug" "Report issues"
                                   "Found a bug? Every report helps improve the components."
                                   "https://github.com/gersak/tyrell/issues"]
                                  ["message-square" "Discussions"
                                   "Share ideas, ask questions, show what you've built."
                                   "https://github.com/gersak/tyrell/discussions"]
                                  ["git-branch" "Contribute"
                                   "Docs, components and examples. PRs welcome."
                                   "https://github.com/gersak/tyrell"]]]
      [:a.group.block {:replicant/key title :href href}
       [:div.flex.items-center.gap-2.mb-2
        [:ty-icon.ty-text++ {:name icon :size "sm"}]
        [:h3.font-semibold.ty-text++.group-hover:underline title]
        [:ty-icon.ty-text-- {:name "external-link" :size "xs"}]]
       [:p.text-sm.ty-text-.leading-relaxed text]])]])

(defn- footer []
  [:footer.flex.flex-wrap.items-center.justify-between.gap-4.py-7
   [:div.flex.items-center.gap-3
    [:ty-icon.ty-text-primary {:name "ty-logo" :style {:height 20 :width 60}}]
    [:span.text-sm.ty-text- "MIT licensed · by Robert Geršak"]]
   [:nav.flex.items-center.gap-7
    (for [[label href] [["npm" "https://www.npmjs.com/package/tyrell-components"]
                        ["Clojars" "https://clojars.org/dev.gersak/tyrell"]
                        ["GitHub" "https://github.com/gersak/tyrell"]]]
      [:a.text-sm.font-medium.ty-text-.hover:ty-text-primary
       {:replicant/key label :href href :target "_blank" :rel "noopener noreferrer"}
       label])]])

(defn view []
  [:div
   (band {} (hero))
   (band {:class ["dark" "ty-canvas" "ty-text"] :data-ty-theme "" :style common/brand-inherit} (frameworks))
   (band {} (live-examples))
   (band {:class ["ty-content" "border-y" "ty-border"]} (theming))
   (band {} (primitives-catalog))
   (band {} (closing))
   (band {:class ["border-t" "ty-border"]} (footer))])

