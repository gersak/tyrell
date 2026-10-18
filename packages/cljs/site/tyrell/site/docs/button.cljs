(ns tyrell.site.docs.button
  "Documentation for ty-button component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.docs.snippets :as snippets]
            [tyrell.site.state :as state]))

(def ^:private flavors ["primary" "success" "danger" "warning" "neutral"])

(def ^:private lineup
  "Playground stage: every shape the button takes, sharing the live props."
  [{:label "Save changes"
    :datastar {(snippets/ds "data-on:click") "@post('/save')"
               (snippets/ds "data-indicator:saving") true
               (snippets/ds "data-attr:loading") "$saving"}}
   {:label "Save" :start "save"}
   {:label "Continue" :end "arrow-right"}
   {:label "Export" :start "download" :end "chevron-down"}
   {:label "Syncing" :start "refresh-cw" :spin? true}
   {:icon "plus" :aria "Add"}
   {:icon "heart" :aria "Like"}
   {:icon "settings" :aria "Settings" :spin? true}])

(defn- prop-attrs
  "Non-default live props, as they appear in the snippets."
  [{:keys [size flavor appearance pill muted loading disabled]}]
  (cond-> {}
    (not= flavor "neutral") (assoc :flavor flavor)
    (not= appearance "solid") (assoc :appearance appearance)
    (not= size "sm") (assoc :size size)
    pill (assoc :pill true)
    muted (assoc :muted true)
    loading (assoc :loading true)
    disabled (assoc :disabled true)))

(defn- button-node [attrs {:keys [label start end icon aria spin? datastar]}]
  (let [ico (fn [slot n] [:ty-icon {:slot slot :name n :spin spin?}])]
    [:ty-button (merge (when icon {:action true :aria-label aria}) attrs datastar)
     (when icon (ico nil icon))
     (when start (ico "start" start))
     label
     (when end (ico "end" end))]))

(defn- snippets [props]
  (let [attrs (prop-attrs props)]
    (snippets/tabs
     (map (partial button-node attrs) lineup))))

(defn- render-lineup
  "Live stage: text buttons on one row, icon-only buttons on the next."
  [{:keys [size flavor appearance pill muted loading disabled]}]
  (let [base (cond-> {:flavor flavor :appearance appearance :size size}
               pill (assoc :pill "")
               muted (assoc :muted "")
               loading (assoc :loading "")
               disabled (assoc :disabled ""))
        ico (fn [slot n spin?] [:ty-icon (cond-> {:name n} slot (assoc :slot slot) spin? (assoc :spin ""))])
        btn (fn [{:keys [label start end icon aria spin?]}]
              [:ty-button (cond-> (assoc base :replicant/key (or label icon))
                            icon (assoc :action "" :aria-label aria))
               (when icon (ico nil icon spin?))
               (when start (ico "start" start spin?))
               label
               (when end (ico "end" end spin?))])
        [texts icons] ((juxt remove filter) :icon lineup)]
    [:div.flex.flex-col.items-center.gap-5
     [:div.flex.flex-wrap.items-center.justify-center.gap-3 (map btn texts)]
     [:div.flex.flex-wrap.items-center.justify-center.gap-3 (map btn icons)]]))

(defn- fake-save!
  "Loading example: spin for a moment, then settle."
  []
  (swap! state/state assoc-in [:button-doc :saving] true)
  (js/setTimeout #(swap! state/state assoc-in [:button-doc :saving] false) 1600))

(def ^:private custom-flavor-css
  "ty-button[flavor=\"teal\"] {
  --ty-solid-teal: #0d9488;
  --ty-solid-teal-hover: #0f766e;
  --ty-solid-teal-fg: white;
  --ty-color-teal: #2dd4bf;
  --ty-bg-teal-soft: #134e4a;
}")

(def ^:private form-snippets
  "Form actions, one tab per stack. FormData: title=…&intent=publish"
  [["html" "HTML" "html"
    "<form action=\"/posts\" method=\"post\">
  <ty-input name=\"title\" label=\"Title\" required></ty-input>
  <ty-button type=\"reset\" appearance=\"ghost\">Reset</ty-button>
  <ty-button name=\"intent\" value=\"draft\" appearance=\"outlined\">Save draft</ty-button>
  <ty-button name=\"intent\" value=\"publish\" flavor=\"primary\">Publish</ty-button>
</form>
<!-- title=…&intent=publish -->"]
   ["react" "React" "javascript"
    "import { TyInput, TyButton } from 'tyrell-react'

<form onSubmit={(e) => { e.preventDefault(); send(new FormData(e.currentTarget)) }}>
  <TyInput name=\"title\" label=\"Title\" required />
  <TyButton type=\"reset\" appearance=\"ghost\">Reset</TyButton>
  <TyButton name=\"intent\" value=\"draft\" appearance=\"outlined\">Save draft</TyButton>
  <TyButton name=\"intent\" value=\"publish\" flavor=\"primary\">Publish</TyButton>
</form>"]
   ["reagent" "Reagent" "clojure"
    "(:require [tyrell.react :as ty])

[:form {:on-submit #(do (.preventDefault %) (send! (js/FormData. (.-currentTarget %))))}
 [:> ty/Input {:name \"title\" :label \"Title\" :required true}]
 [:> ty/Button {:type \"reset\" :appearance \"ghost\"} \"Reset\"]
 [:> ty/Button {:name \"intent\" :value \"draft\" :appearance \"outlined\"} \"Save draft\"]
 [:> ty/Button {:name \"intent\" :value \"publish\" :flavor \"primary\"} \"Publish\"]]"]
   ["replicant" "Replicant" "clojure"
    "[:form {:on {:submit #(do (.preventDefault %) (send! (js/FormData. (.-target %))))}}
 [:ty-input {:name \"title\" :label \"Title\" :required \"\"}]
 [:ty-button {:type \"reset\" :appearance \"ghost\"} \"Reset\"]
 [:ty-button {:name \"intent\" :value \"draft\" :appearance \"outlined\"} \"Save draft\"]
 [:ty-button {:name \"intent\" :value \"publish\" :flavor \"primary\"} \"Publish\"]]"]
   ["datastar" "Datastar" "html"
    "<form data-on:submit__prevent=\"@post('/posts', {contentType: 'form'})\">
  <ty-input name=\"title\" label=\"Title\" required></ty-input>
  <ty-button type=\"reset\" appearance=\"ghost\">Reset</ty-button>
  <ty-button name=\"intent\" value=\"draft\" appearance=\"outlined\">Save draft</ty-button>
  <ty-button name=\"intent\" value=\"publish\" flavor=\"primary\">Publish</ty-button>
</form>"]])

(defn view []
  (component-page
   {:title "Button"
    :group "Action"
    :tag "ty-button"
    :description "Three appearances, five flavors, three tones each. Icon slots, loading without layout shift, and real form submission."
    :chips [["Form-associated" "send"] ["Keyboard" "zap"] ["TyButton (React)" "atom"]]
    :source "packages/core/src/components/button.ts"
    :mark "OK"
    :demo [:div.flex.flex-col.items-start.gap-3
           [:div.flex.flex-wrap.gap-2
            [:ty-button {:flavor "primary" :size "md"}
             [:ty-icon {:slot "start" :name "check" :size "sm"}] "Publish"]
            [:ty-button {:appearance "outlined" :size "md"} "Preview"]
            [:ty-button {:appearance "ghost" :size "md"} "Cancel"]]
           [:div.flex.flex-wrap.gap-2
            [:ty-button {:flavor "success" :size "md"} "Approve"]
            [:ty-button {:flavor "danger" :appearance "outlined" :size "md"} "Delete"]
            [:ty-button {:flavor "neutral" :size "md" :action ""}
             [:ty-icon {:name "more-vertical" :size "sm"}]]]]}

   (playground
    {:id :button
     :defaults {:size "md" :flavor "primary" :appearance "solid"
                :pill false :muted false :loading false :disabled false}
     :controls [{:key :appearance :options ["solid" "outlined" "ghost"]}
                {:key :flavor :options flavors :swatch? true :tones? true}
                {:key :size :options ["xs" "sm" "md" "lg" "xl"]}
                {:key :pill :switch? true}
                {:key :muted :switch? true}
                {:key :loading :switch? true}
                {:key :disabled :switch? true}]
     :render render-lineup
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Appearance × flavor"
       :span 4
       :description [:span "Solid for the main action, outlined for the alternative, ghost for everything else. The default flavor is "
                     [:code "neutral"] "."]
       :code "<ty-button flavor=\"primary\">Save</ty-button>
<ty-button appearance=\"outlined\">Preview</ty-button>
<ty-button appearance=\"ghost\">Cancel</ty-button>"}
      [:div.flex.flex-col.gap-3
       (for [appearance ["solid" "outlined" "ghost"]]
         [:div.flex.flex-wrap.gap-2 {:replicant/key appearance}
          (for [f flavors]
            [:ty-button {:replicant/key f :flavor f :appearance appearance}
             (str/capitalize f)])])])

     (example
      {:title "Tones"
       :span 2
       :description [:span "Append " [:code "+"] " for a stronger fill, " [:code "-"] " for a softer one."]
       :code "<ty-button flavor=\"primary+\">
<ty-button flavor=\"primary\">
<ty-button flavor=\"primary-\">"}
      [:div.flex.flex-col.items-start.gap-2
       (for [t ["primary+" "primary" "primary-"]]
         [:ty-button {:replicant/key t :flavor t} t])])

     (example
      {:title "Icon-only"
       :span 2
       :description [:span [:code "action"] " makes it square and centers the icon; " [:code "action pill"]
                     " makes it round. Give it an " [:code "aria-label"] "."]
       :code "<ty-button action aria-label=\"Edit\">
  <ty-icon name=\"edit\"></ty-icon>
</ty-button>
<ty-button action pill aria-label=\"Add\">…</ty-button>"}
      [:div.flex.flex-wrap.items-center.gap-2
       (for [[icon flavor appearance] [["plus" "primary" "solid"] ["edit" "neutral" "outlined"]
                                       ["trash" "danger" "ghost"] ["check" "success" "solid"]]]
         [:ty-button {:replicant/key icon :action "" :flavor flavor :appearance appearance :aria-label icon}
          [:ty-icon {:name icon :size "sm"}]])
       [:ty-button {:action "" :pill "" :flavor "primary" :size "lg" :aria-label "Add"}
        [:ty-icon {:name "plus" :size "md"}]]])

     (example
      {:title "Icons"
       :span 4
       :description [:span "Slot icons into " [:code "start"] " or " [:code "end"] ". Gap and size follow the button."]
       :code "<ty-button flavor=\"primary\">
  <ty-icon slot=\"start\" name=\"download\"></ty-icon>
  Download
</ty-button>
<ty-button>
  Next
  <ty-icon slot=\"end\" name=\"arrow-right\"></ty-icon>
</ty-button>"}
      [:div.flex.flex-wrap.gap-2
       [:ty-button {:flavor "primary"} [:ty-icon {:slot "start" :name "download" :size "sm"}] "Download"]
       [:ty-button {:appearance "outlined"} [:ty-icon {:slot "start" :name "share-2" :size "sm"}] "Share"]
       [:ty-button "Next" [:ty-icon {:slot "end" :name "arrow-right" :size "sm"}]]])

     (example
      {:title "Loading"
       :span 2
       :description "Spinner on top, width kept, clicks blocked, aria-busy set. Set it in the click handler: that press still submits, later ones wait until you clear it."
       :code "<ty-button loading>Saving</ty-button>

// swap the spinner everywhere
setLoaderSvg('<svg>…</svg>');"}
      (let [saving? (get-in @state/state [:button-doc :saving])]
        [:ty-button (cond-> {:flavor "primary" :size "md" :on {:click fake-save!}}
                      saving? (assoc :loading ""))
         "Save changes"]))

     (example
      {:title "Muted"
       :span 2
       :description "Grey at rest, color on hover, press or focus. For actions that shouldn't compete."
       :code "<ty-button flavor=\"danger\" muted>
  Delete
</ty-button>"}
      [:div.flex.flex-wrap.gap-2
       [:ty-button {:flavor "danger" :muted ""} "Delete"]
       [:ty-button {:flavor "primary" :appearance "outlined" :muted ""} "Edit"]])

     (example
      {:title "Sizes"
       :span 2
       :description "One ladder with the fields: 24 to 40px."
       :code "size=\"xs | sm | md | lg | xl\""}
      [:div.flex.flex-wrap.items-center.gap-2
       (for [s ["xs" "sm" "md" "lg" "xl"]]
         [:ty-button {:replicant/key s :size s :flavor "primary" :appearance "outlined"} s])])

     (example
      {:title "Form actions"
       :span 6
       :description [:span "A " [:code "ty-button"] " submits by default (" [:code "type=\"submit\""] "). With "
                     [:code "name"] " and " [:code "value"] ", the pressed button is in FormData, so one form can have several intents. "
                     [:code "preventDefault()"] " in a click listener cancels the submit, like a native button."]
       :tabs form-snippets}
      (let [sent (get-in @state/state [:button-doc :sent])]
        [:form.flex.flex-col.gap-4.w-full
         {:on {:submit (fn [^js e]
                         (.preventDefault e)
                         (swap! state/state assoc-in [:button-doc :sent]
                                (->> (js/FormData. (.-target e))
                                     (.entries)
                                     (js/Array.from)
                                     (map (fn [[k v]] (str k "=" v)))
                                     (str/join "&"))))}}
         [:div.flex.flex-wrap.items-end.gap-3
          [:ty-input {:name "title" :label "Title" :value "Release notes" :size "sm" :style {:min-width "240px"}}]
          [:ty-button {:type "reset" :appearance "ghost" :size "md"} "Reset"]
          [:ty-button {:name "intent" :value "draft" :appearance "outlined" :size "md"} "Save draft"]
          [:ty-button {:name "intent" :value "publish" :flavor "primary" :size "md"} "Publish"]]
         [:code.ty-text-.text-xs (if sent (str "FormData: " sent) "Press a button to submit.")]]))

     (example
      {:title "Wide"
       :span 6
       :description [:span [:code "wide"] " grows to fill a flex row. Share the space evenly, or let one action take the rest."]
       :code "<div style=\"display: flex; gap: 8px\">
  <ty-button appearance=\"outlined\">Back</ty-button>
  <ty-button wide flavor=\"primary\">Continue</ty-button>
</div>"}
      [:div.flex.flex-col.gap-3.w-full
       [:div.flex.gap-2
        [:ty-button {:appearance "outlined" :size "md"} "Back"]
        [:ty-button {:wide "" :flavor "primary" :size "md"} "Continue"]]
       [:div.flex.gap-2
        (for [[label icon] [["GitHub" "github"] ["Google" "globe"] ["Email" "mail"]]]
          [:ty-button {:replicant/key label :wide "" :appearance "outlined" :size "md"}
           [:ty-icon {:slot "start" :name icon :size "sm"}] label])]])))

   (page-section
    {:title "Theming" :sub "CSS variables. No build step." :dark? true}
    (example
     {:title "Custom flavor"
      :side? true
      :lang "css"
      :description [:span "Any string is a flavor. Give it tokens and all three appearances follow. With "
                    [:code "tyrell-theme.css"] ", " [:code "--ty-teal-seed: #0d9488"] " derives the whole set, dark mode included."]
      :code custom-flavor-css}
     [:div.flex.flex-wrap.gap-2
      [:style custom-flavor-css]
      [:ty-button {:flavor "teal"} "Teal"]
      [:ty-button {:flavor "teal" :appearance "outlined"} "Outlined"]
      [:ty-button {:flavor "teal" :appearance "ghost"} "Ghost"]])

    (example
     {:title "One-off colors"
      :side? true
      :lang "css"
      :description [:span "Per-instance overrides for a single button. They apply to every appearance, so don't use them to define a flavor."]
      :code ".cta {
  --ty-button-bg: #f97316;
  --ty-button-bg-hover: #ea580c;
  --ty-button-color: #1c1917;
}"}
     [:div.flex.flex-wrap.gap-2
      [:ty-button {:size "md" :style {"--ty-button-bg" "#f97316"
                                      "--ty-button-bg-hover" "#ea580c"
                                      "--ty-button-color" "#1c1917"}}
       "Start free trial"]])

    (example
     {:title "Depth & radius"
      :side? true
      :lang "css"
      :description [:span [:code "--ty-button-depth"] " scales the solid border and shadow (0 is flat, default 0.35). Radius is set per size."]
      :code ":root {
  --ty-button-depth: 0;
  --ty-button-radius-md: 999px;
}"}
     [:div.flex.flex-wrap.gap-2
      (for [[label depth radius] [["Flat" "0" "999px"] ["Default" "0.35" nil] ["Deep" "1" "4px"]]]
        [:ty-button {:replicant/key label
                     :flavor "primary"
                     :size "md"
                     :style (cond-> {"--ty-button-depth" depth}
                              radius (assoc "--ty-button-radius-md" radius))}
         label])]))

   (api-section
    {:attributes ["Appearance"
                  ["flavor" "string" "\"neutral\"" "primary, success, danger, warning, neutral, or any custom flavor. Append + or - for a stronger or softer tone."]
                  ["appearance" "string" "\"solid\"" "solid, outlined or ghost."]
                  ["size" "string" "\"sm\"" "xs, sm, md, lg or xl. Same height ladder as the fields."]
                  ["pill" "boolean" "false" "Fully rounded ends. A round icon button is action pill; a plain pill with only an icon isn't made round."]
                  ["action" "boolean" "false" "Square, icon-only button."]
                  ["wide" "boolean" "false" "Grow to fill the parent flex row. Keeps its own height, also in a flex column."]
                  ["muted" "boolean" "false" "Desaturated at rest; color returns on hover, press and focus."]
                  "State"
                  ["disabled" "boolean" "false" "Not focusable, no click. Also when inside <fieldset disabled>."]
                  ["loading" "boolean" "false" "Spinner overlay, clicks blocked, aria-busy and aria-disabled. Width is kept, and it stays focusable."]
                  "Form"
                  ["type" "string" "\"submit\"" "submit, reset or button. Set button for actions inside a form that shouldn't submit."]
                  ["name" "string" "Field name sent with the pressing button's value."]
                  ["value" "string" "Value sent when this button submits the form."]
                  ["form" "string" "id of the form to submit or reset when the button sits outside it."]]
     :events [["click" "{originalEvent}" "Cancelable. Fires once per press, before the default action: preventDefault() cancels the submit or reset, like a native button. Bubbles and crosses shadow roots. Not fired while disabled, loading or inside a disabled fieldset. button.click() and a wrapping <label> act like a real press. Capture listeners above the button also see the browser's own click on the way in, so put button logic in bubbling listeners."]]
     :slots [["start" "Before the label, usually an icon."]
             ["(default)" "The label."]
             ["end" "After the label."]]
     :keyboard [["Enter / Space" "Activate, like a native button."]
                ["Tab" "Focus ring appears on keyboard focus only."]]
     :css-vars [["--ty-button-bg / -bg-hover" "Fill, per instance."]
                ["--ty-button-color" "Label and icon color."]
                ["--ty-button-border" "Border color (outlined)."]
                ["--ty-button-depth" "Solid border and shadow strength, 0–1. Default 0.35."]
                ["--ty-button-radius-{xs…xl}" "Corner radius per size."]
                ["--ty-solid-{flavor} / -hover / -fg" "Flavor tokens for solid."]
                ["--ty-color-{flavor} / --ty-bg-{flavor}-soft" "Flavor tokens for outlined and ghost."]]})))
