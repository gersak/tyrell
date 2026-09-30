(ns tyrell.site.docs.tabs
  "Documentation for ty-tabs and ty-tab"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(defn- doc-state [k] (get-in @state/state [:tabs-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:tabs-doc k] v))

(defn- pane
  "Panel content: a title and a line of text."
  [title text]
  [:div.flex.flex-col.gap-2.p-5
   [:h4.text-base.font-semibold.ty-text++ title]
   [:p.text-sm.ty-text- text]])

(def ^:private project-tabs
  [["overview" "Overview" "Everything about Tyrell at a glance: owners, status and recent activity."]
   ["activity" "Activity" "42 commits this week. The calendar redesign landed on Tuesday."]
   ["settings" "Settings" "Rename the project, move it, or archive it."]])

(defn- snippets [{:keys [placement fixed]}]
  (let [attrs (str (when (not= placement "top") (str " placement=\"" placement "\""))
                   (when fixed " fixed"))]
    [["html" "HTML" "html"
      (str "<ty-tabs active=\"overview\" height=\"180px\"" attrs ">\n"
           (str/join "\n" (for [[id l] project-tabs] (str "  <ty-tab id=\"" id "\" label=\"" l "\">…</ty-tab>")))
           "\n</ty-tabs>")]
     ["react" "React" "javascript"
      (str "import { TyTabs, TyTab } from 'tyrell-react'\n\n"
           "<TyTabs active={tab} height=\"180px\"" attrs "\n  onChange={(e) => setTab(e.detail.activeId)}>\n"
           (str/join "\n" (for [[id l] project-tabs] (str "  <TyTab id=\"" id "\" label=\"" l "\">…</TyTab>")))
           "\n</TyTabs>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/Tabs {:active @tab :height \"180px\""
           (when (not= placement "top") (str " :placement \"" placement "\"")) (when fixed " :fixed true")
           "\n             :on-change #(reset! tab (.. % -detail -activeId))}"
           (str/join (for [[id l] project-tabs] (str "\n [:> ty/Tab {:id \"" id "\" :label \"" l "\"} …]"))) "]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-tabs {:active tab :height \"180px\""
           (when (not= placement "top") (str " :placement \"" placement "\"")) (when fixed " :fixed \"\"")
           "\n           :on {:ty-tab-change #(set-tab! (.. % -detail -activeId))}}"
           (str/join (for [[id l] project-tabs] (str "\n [:ty-tab {:id \"" id "\" :label \"" l "\"} …]"))) "]")]
     ["datastar" "Datastar" "html"
      (str "<ty-tabs data-attr:active=\"$tab\"" attrs "\n  data-on:ty-tab-change=\"$tab = evt.detail.activeId\">\n  …\n</ty-tabs>")]]))

(defn- render-playground [{:keys [placement fixed]}]
  [:div {:style {:width "100%" :max-width "520px"}}
   [:ty-tabs (cond-> {:active "overview" :height "180px" :placement placement}
               fixed (assoc :fixed ""))
    (for [[id l t] project-tabs]
      [:ty-tab {:replicant/key id :id id :label l} (pane l t)])]])

(defn view []
  (component-page
   {:title "Tabs"
    :group "Layout primitives"
    :tag "ty-tabs"
    :description "Panels that slide, a marker that follows, and a fixed size so the page doesn't jump. Rich labels, overflow menu, arrow keys."
    :chips [["Keyboard" "zap"] ["ARIA tabs" "layers"] ["TyTabs (React)" "atom"]]
    :source "packages/core/src/components/tabs.ts"
    :mark "⇥"
    :demo [:div {:style {:width "340px"}}
           [:ty-tabs {:active "code" :height "150px"}
            [:ty-tab {:id "preview" :label "Preview"} (pane "Preview" "The rendered component.")]
            [:ty-tab {:id "code" :label "Code"} (pane "Code" "<ty-tabs active=\"code\">")]
            [:ty-tab {:id "props" :label "Props"} (pane "Props" "width, height, active, placement, fixed.")]]]}

   (playground
    {:id :tabs
     :defaults {:placement "top" :fixed false}
     :controls [{:key :placement :options ["top" "bottom"]}
                {:key :fixed :switch? true}]
     :sub "Click a tab, or focus one and use ← → Home End."
     :render render-playground
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Rich labels"
       :span 4
       :description [:span "Put a " [:code "slot=\"label-{id}\""] " child in " [:code "ty-tabs"]
                     " for icons and counts. The plain " [:code "label"] " stays as the fallback and for the overflow menu."]
       :code "<ty-tabs>
  <span slot=\"label-inbox\">
    <ty-icon name=\"mail\"></ty-icon> Inbox <b>12</b>
  </span>
  <ty-tab id=\"inbox\" label=\"Inbox\">…</ty-tab>
</ty-tabs>"}
      [:ty-tabs {:active "inbox" :height "150px"}
       (for [[id icon label n] [["inbox" "mail" "Inbox" "12"] ["archive" "archive" "Archive" nil] ["trash" "trash" "Trash" "3"]]]
         [:span.flex.items-center.gap-2 {:replicant/key (str "l-" id) :slot (str "label-" id)}
          [:ty-icon {:name icon :size "sm"}] label (when n [:ty-tag {:size "xs" :flavor "primary-"} n])])
       (for [[id label] [["inbox" "Inbox"] ["archive" "Archive"] ["trash" "Trash"]]]
         [:ty-tab {:replicant/key id :id id :label label} (pane label (str "Messages in " (str/lower-case label) "."))])])

     (example
      {:title "Controlled"
       :span 2
       :description [:span "Listen for " [:code "ty-tab-change"] " and write " [:code "active"] " back, or switch from outside."]
       :code "tabs.addEventListener('ty-tab-change',
  (e) => save(e.detail.activeId));
tabs.setAttribute('active', 'b');"}
      (let [active (or (doc-state :active) "a")]
        [:div.flex.flex-col.gap-3.w-full
         [:ty-tabs {:active active :height "90px"
                    :on {:ty-tab-change (fn [^js e] (set-doc! :active (.. e -detail -activeId)))}}
          (for [id ["a" "b" "c"]]
            [:ty-tab {:replicant/key id :id id :label (str/upper-case id)} (pane (str "Step " (str/upper-case id)) "")])]
         [:div.flex.items-center.gap-2
          [:ty-button {:size "sm" :appearance "outlined" :on {:click #(set-doc! :active "c")}} "Jump to C"]
          [:code.ty-text-.text-xs (str "active = \"" active "\"")]]]))

     (example
      {:title "Many tabs"
       :span 3
       :description "When they don't fit, the bar scrolls and a menu lists every tab."
       :code "<ty-tabs>
  <ty-tab id=\"jan\" label=\"January\">…</ty-tab>
  … twelve of them
</ty-tabs>"}
      [:ty-tabs {:active "mar" :height "100px"}
       (for [m ["Jan" "Feb" "Mar" "Apr" "May" "Jun" "Jul" "Aug" "Sep" "Oct" "Nov" "Dec"]]
         [:ty-tab {:replicant/key m :id (str/lower-case m) :label m} (pane m "Monthly report.")])])

     (example
      {:title "Fixed & disabled"
       :span 3
       :description [:span [:code "fixed"] " splits the bar into equal parts. A " [:code "disabled"] " tab is skipped by clicks and arrow keys."]
       :code "<ty-tabs fixed>
  <ty-tab id=\"b\" label=\"Billing\" disabled>
</ty-tabs>"}
      [:ty-tabs {:active "profile" :height "100px" :fixed ""}
       [:ty-tab {:id "profile" :label "Profile"} (pane "Profile" "")]
       [:ty-tab {:id "billing" :label "Billing" :disabled ""} (pane "Billing" "")]
       [:ty-tab {:id "team" :label "Team"} (pane "Team" "")]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const tabs = document.querySelector('ty-tabs');

tabs.setAttribute('active', 'settings');

tabs.addEventListener('ty-tab-change', (e) => {
  const { activeId, activeIndex, previousId } = e.detail;
});"}
      nil)))

   (page-section
    {:title "Theming" :sub "Motion and separators." :dark? true}
    (example
     {:title "Slide & separator"
      :side? true
      :lang "css"
      :description "Transition length and easing of the panel slide, the line under the bar, and a minimum tab width."
      :code "ty-tabs {
  --ty-tabs-transition-duration: 450ms;
  --ty-tabs-transition-easing: cubic-bezier(.2, .9, .3, 1.2);
  --ty-tabs-separator: #0f766e;
  --ty-tab-min-width: 110px;
}"}
     [:div {:style {:width "100%" :max-width "360px"}}
      [:ty-tabs {:active "one" :height "110px"
                 :style {"--ty-tabs-transition-duration" "450ms"
                         "--ty-tabs-transition-easing" "cubic-bezier(.2, .9, .3, 1.2)"
                         "--ty-tabs-separator" "#0f766e"
                         "--ty-tab-min-width" "110px"}}
       (for [[id l] [["one" "Springy"] ["two" "Slide"] ["three" "Tabs"]]]
         [:ty-tab {:replicant/key id :id id :label l} (pane l "Click another tab.")])]]))

   (api-section
    {:attributes ["ty-tabs"
                  ["active" "string" "first tab" "id of the active tab."]
                  ["width" "string" "\"100%\"" "Container width."]
                  ["height" "string" "\"400px\"" "Panel height. Fixed, so switching tabs never moves the page."]
                  ["placement" "string" "\"top\"" "top or bottom tab bar."]
                  ["fixed" "boolean" "false" "Equal-width tabs instead of a scrolling bar."]
                  "ty-tab"
                  ["id" "string" "Required. What active points at."]
                  ["label" "string" "Button text. Also used by the overflow menu."]
                  ["disabled" "boolean" "false" "Shown, not selectable."]]
     :events [["ty-tab-change" "{activeId, activeIndex, previousId, previousIndex}" "Active tab changed. Bubbles."]]
     :slots [["label-{id}" "On ty-tabs: rich button content for the tab with that id."]
             ["(default)" "ty-tab children; each tab's children are its panel."]]
     :keyboard [["Tab" "One stop: the active tab button."]
                ["← →" "Previous / next tab, wrapping. Activates it."]
                ["Home / End" "First / last tab."]]
     :css-vars [["--ty-tabs-transition-duration / -easing" "Panel slide."]
                ["--ty-tabs-separator" "Line under the tab bar."]
                ["--ty-tab-min-width" "Minimum width per tab."]]})))
