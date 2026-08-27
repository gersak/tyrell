(ns tyrell.site.docs.tabs
  "Documentation for ty-tabs and ty-tab components"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-tabs"
                     "Carousel-based tab container with smooth slide animations and an animated active marker. Uses ty-tab children for panels — tab buttons are generated automatically from each tab's label.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "ty-tabs Attributes")
     (attribute-table
      [{:name "width"
        :type "string"
        :required true
        :default "-"
        :description "Content area width — required for carousel layout (e.g. \"100%\", \"480px\")"}
       {:name "height"
        :type "string"
        :required true
        :default "-"
        :description "Total container height including tab buttons — required (e.g. \"300px\")"}
       {:name "active"
        :type "string"
        :default "first tab id"
        :description "ID of the currently active tab — defaults to the first ty-tab child"}
       {:name "placement"
        :type "string"
        :default "\"top\""
        :description "Tab button bar position: top or bottom"}
       {:name "fixed"
        :type "boolean"
        :default "false"
        :description "Divide the bar equally between the tabs instead of scrolling them. No min-width floor, no overflow, no \"…\" menu. For a small, known set of short labels."}])]

    [:div.mb-6
     (section-label "ty-tab Attributes")
     (attribute-table
      [{:name "id"
        :type "string"
        :required true
        :default "-"
        :description "Unique identifier — used to reference this tab from the active attribute"}
       {:name "label"
        :type "string"
        :default "-"
        :description "Text shown in the tab button"}
       {:name "disabled"
        :type "boolean"
        :default "false"
        :description "Prevent this tab from being activated"}])]

    [:div.mb-6
     (section-label "Events")
     (event-table
      [{:name "ty-tab-change"
        :payload "{activeId, activeIndex, previousId, previousIndex}"
        :when-fired "Fires when the active tab changes (at animation start)"}])]

    [:div
     (section-label "CSS Variables")
     (attribute-table
      [{:name "--ty-tabs-separator"
        :type "color"
        :default "var(--ty-border)"
        :description "Line between the tab bar and the panel. Set to transparent to drop it — usually what you want alongside a custom marker."}
       {:name "--ty-tabs-transition-duration"
        :type "time"
        :default "300ms"
        :description "Marker glide and carousel slide duration. Also drives the panel fade in ty-tab."}
       {:name "--ty-tabs-transition-easing"
        :type "easing"
        :default "ease-in-out"
        :description "Easing for the same two motions."}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Both " [:code "width"] " and " [:code "height"] " are required — they define the carousel viewport. Tab buttons are generated from each " [:code "ty-tab"] " label."]
       (demo-area
        [:ty-tabs {:width "100%" :height "200px"}
         [:ty-tab {:id "overview" :label "Overview"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Overview tab content goes here."]]]
         [:ty-tab {:id "details" :label "Details"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Details tab content goes here."]]]
         [:ty-tab {:id "history" :label "History"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "History tab content goes here."]]]])
       (code-block "<ty-tabs width=\"100%\" height=\"200px\">
  <ty-tab id=\"overview\" label=\"Overview\">
    Overview content
  </ty-tab>
  <ty-tab id=\"details\" label=\"Details\">
    Details content
  </ty-tab>
  <ty-tab id=\"history\" label=\"History\">
    History content
  </ty-tab>
</ty-tabs>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Bottom Placement")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "placement=\"bottom\""] " to move the tab bar below the content — common in mobile layouts."]
       (demo-area
        [:ty-tabs {:width "100%" :height "200px" :placement "bottom"}
         [:ty-tab {:id "tab-a" :label "Photos"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Photos panel content."]]]
         [:ty-tab {:id "tab-b" :label "Videos"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Videos panel content."]]]
         [:ty-tab {:id "tab-c" :label "Files"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Files panel content."]]]])
       (code-block "<ty-tabs width=\"100%\" height=\"200px\" placement=\"bottom\">
  <ty-tab id=\"photos\" label=\"Photos\">...</ty-tab>
  <ty-tab id=\"videos\" label=\"Videos\">...</ty-tab>
</ty-tabs>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Fixed Tabs")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "By default tabs are " [:strong "scrollable"] ": every button has a " [:code "min-width: 72px"]
        " floor (" [:code "--ty-tab-min-width"] "), so a bar narrower than the tabs need scrolls "
        "behind a " [:code "\u2026"] " jump menu. Add " [:code "fixed"] " and the bar is divided "
        [:strong "equally"] " between the tabs instead — no floor, no overflow, no jump menu."]
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "This is the shape it is for: a small either/or that fills its container. Two halves read as "
        "a segmented control, and the marker tells you which side you are on at a glance."]
       (demo-area
        [:div.ty-elevated.rounded-lg {:style {:width "360px" :max-width "100%" :overflow "hidden"}}
         [:ty-tabs {:fixed "" :width "100%" :height "290px"}
          [:ty-tab {:id "auth-signin" :label "Sign in"}
           [:div.p-4.space-y-3
            [:ty-input {:type "email" :label "Email" :placeholder "you@example.com"}]
            [:ty-input {:type "password" :label "Password" :placeholder "••••••••"}]
            [:label.flex.items-center.gap-2.cursor-pointer
             [:ty-checkbox {:name "remember" :size "sm"}]
             [:span.ty-text- {:style {:font-size "0.75rem"}} "Keep me signed in"]]
            [:ty-button {:flavor "primary" :wide "" :size "sm"} "Sign in"]]]
          [:ty-tab {:id "auth-signup" :label "Create account"}
           [:div.p-4.space-y-3
            [:ty-input {:label "Full name" :placeholder "Ada Lovelace"}]
            [:ty-input {:type "email" :label "Email" :placeholder "you@example.com"}]
            [:label.flex.items-center.gap-2.cursor-pointer
             [:ty-checkbox {:name "terms" :size "sm" :flavor "primary"}]
             [:span.ty-text- {:style {:font-size "0.75rem"}} "I agree to the terms"]]
            [:ty-button {:flavor "primary" :wide "" :size "sm"} "Create account"]]]]])
       (code-block "<ty-tabs fixed width=\"100%\" height=\"290px\">
  <ty-tab id=\"signin\" label=\"Sign in\">
    <ty-input type=\"email\" label=\"Email\"></ty-input>
    <ty-input type=\"password\" label=\"Password\"></ty-input>
    <ty-button flavor=\"primary\" wide>Sign in</ty-button>
  </ty-tab>
  <ty-tab id=\"signup\" label=\"Create account\">
    ...
  </ty-tab>
</ty-tabs>")

       [:p.ty-text-.mt-5.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Other natural fits: " [:strong "Monthly / Yearly"] " on a pricing card, "
        [:strong "All / Unread"] " on an inbox, " [:strong "Grid / List / Map"] " on a result set, "
        [:strong "Day / Week / Month"] " on a calendar. Anything where the choices are few, fixed, "
        "and worth showing side by side at equal weight."]

       [:div.mb-4 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.75rem"}}
        [:p.ty-text.mb-1 {:style {:font-size "0.8125rem" :font-weight "600"}}
         "Use it for 2–5 tabs. Above that, don't."]
        [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}}
         "Equal shares only read as tabs while each share is wide enough for its label. Rough check: "
         "if " [:strong "widest label × tab count"] " exceeds the narrowest width you support, use the "
         "scrollable default and let the " [:code "\u2026"] " menu carry the rest. Keep it off when the "
         "tab set is open-ended or user-generated — you cannot know how many there will be."]]

       [:p.ty-text--.mb-2 {:style {:font-size "0.75rem"}}
        "Same five tabs, same 300px bar, both modes — and nine tabs past the ceiling. The scrollable bar keeps every label at full width and scrolls; only fixed squeezes:"]
       (demo-area
        [:div.flex.flex-wrap.gap-6
         [:div {:style {:width "300px" :max-width "100%"}}
          [:p.ty-text--.mb-2.font-mono {:style {:font-size "0.6875rem"}} "default (scrollable)"]
          [:ty-tabs {:width "100%" :height "120px"}
           (for [[id label] [["overview" "Overview"] ["runs" "Runs"] ["recovery" "Recovery"]
                             ["commits" "Commits"] ["settings" "Settings"]]]
             ^{:key id}
             [:ty-tab {:id (str "scr-" id) :label label}
              [:div.p-4
               [:p.ty-text- {:style {:font-size "0.8125rem"}} (str label " panel.")]]])]]
         [:div {:style {:width "300px" :max-width "100%"}}
          [:p.ty-text--.mb-2.font-mono {:style {:font-size "0.6875rem"}} "fixed — at the ceiling"]
          [:ty-tabs {:fixed "" :width "100%" :height "120px"}
           (for [[id label] [["overview" "Overview"] ["runs" "Runs"] ["recovery" "Recovery"]
                             ["commits" "Commits"] ["settings" "Settings"]]]
             ^{:key id}
             [:ty-tab {:id (str "fix-" id) :label label}
              [:div.p-4
               [:p.ty-text- {:style {:font-size "0.8125rem"}} (str label " panel.")]]])]]
         [:div {:style {:width "300px" :max-width "100%"}}
          [:p.ty-text--.mb-2.font-mono.ty-text-danger {:style {:font-size "0.6875rem"}} "fixed — too many"]
          [:ty-tabs {:fixed "" :width "100%" :height "120px"}
           (for [[id label] [["a" "Overview"] ["b" "Runs"] ["c" "Recovery"] ["d" "Commits"]
                             ["e" "Settings"] ["f" "Webhooks"] ["g" "Audit log"]
                             ["h" "Billing"] ["i" "Advanced"]]]
             ^{:key id}
             [:ty-tab {:id (str "toomany-" id) :label label}
              [:div.p-4
               [:p.ty-text- {:style {:font-size "0.8125rem"}} "33px a share — unreadable."]]])]]])]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Disabled Tab")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "disabled"] " on a " [:code "ty-tab"] " to prevent it from being activated. The tab button renders visually muted and is not keyboard-reachable."]
       (demo-area
        [:ty-tabs {:width "100%" :height "180px"}
         [:ty-tab {:id "active-tab" :label "Active"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "This tab is active."]]]
         [:ty-tab {:id "locked-tab" :label "Locked" :disabled ""}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "This content is locked."]]]
         [:ty-tab {:id "another-tab" :label "Another"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Another tab content."]]]])
       (code-block "<ty-tab id=\"locked\" label=\"Locked\" disabled>
  ...
</ty-tab>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Controlled Active Tab")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "active"] " to control which tab is open from outside — useful in reactive frameworks managing routing or state."]
       (code-block "<ty-tabs width=\"100%\" height=\"300px\" active=\"details\">
  <ty-tab id=\"overview\" label=\"Overview\">...</ty-tab>
  <ty-tab id=\"details\" label=\"Details\">...</ty-tab>
</ty-tabs>

;; ClojureScript / Replicant
[:ty-tabs {:width \"100%\" :height \"300px\" :active @active-tab}
 [:ty-tab {:id \"overview\" :label \"Overview\"} ...]
 [:ty-tab {:id \"details\" :label \"Details\"} ...]]")]])

   (doc-section "Advanced Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "JavaScript API")
       (code-block "const tabs = document.querySelector('ty-tabs');

// Listen for tab changes
tabs.addEventListener('ty-tab-change', (e) => {
  const { activeId, activeIndex, previousId, previousIndex } = e.detail;
  console.log('switched to:', activeId, 'at index', activeIndex);
});

// Read active tab
console.log(tabs.active);  // current active tab id

// Switch programmatically — set the active attribute
tabs.setAttribute('active', 'details');" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Rich Tab Labels")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use the " [:code "label-{id}"] " slot inside " [:code "ty-tabs"] " to provide rich tab button content — icons, badges, custom formatting."]
       (demo-area
        [:ty-tabs {:width "100%" :height "220px"}
         [:div.flex.items-center.gap-2 {:slot "label-rich-overview"}
          [:ty-icon {:name "layout" :size "14"}]
          "Overview"]
         [:div.flex.items-center.gap-2 {:slot "label-rich-team"}
          [:ty-icon {:name "users" :size "14"}]
          "Team"
          [:span.ty-bg-primary.ty-text++.rounded-full
           {:style {:padding "0 6px" :font-size "0.6875rem"}} "3"]]
         [:div.flex.items-center.gap-2 {:slot "label-rich-settings"}
          [:ty-icon {:name "settings" :size "14"}]
          "Settings"]

         [:ty-tab {:id "rich-overview" :label "Overview"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "The label slot replaces the button content entirely — the "
            [:code "label"] " attribute stays as the accessible name."]]]
         [:ty-tab {:id "rich-team" :label "Team"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Badges, avatars, status dots — any markup works."]]]
         [:ty-tab {:id "rich-settings" :label "Settings"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Slots live on "
            [:code "ty-tabs"] ", not on the tab they label."]]]])
       (code-block "<ty-tabs width=\"100%\" height=\"220px\">
  <!-- Rich labels: slot=\"label-{tab-id}\", direct children of ty-tabs -->
  <div slot=\"label-overview\" class=\"flex items-center gap-2\">
    <ty-icon name=\"layout\" size=\"14\"></ty-icon>
    Overview
  </div>
  <div slot=\"label-team\" class=\"flex items-center gap-2\">
    <ty-icon name=\"users\" size=\"14\"></ty-icon>
    Team
    <span class=\"ty-bg-primary ty-text++ rounded-full\"
          style=\"padding: 0 6px; font-size: 0.6875rem\">3</span>
  </div>
  <div slot=\"label-settings\" class=\"flex items-center gap-2\">
    <ty-icon name=\"settings\" size=\"14\"></ty-icon>
    Settings
  </div>

  <ty-tab id=\"overview\" label=\"Overview\">...</ty-tab>
  <ty-tab id=\"team\" label=\"Team\">...</ty-tab>
  <ty-tab id=\"settings\" label=\"Settings\">...</ty-tab>
</ty-tabs>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Custom Marker")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Put any element in the " [:code "marker"] " slot and it replaces the default underline. The marker wrapper is sized to the "
        [:strong "exact box of the active tab button"] " and animates its position and size, so a slotted element that fills it "
        "(" [:code "width: 100%; height: 100%"] ", applied for you) glides and stretches between tabs for free. It sits "
        "behind the button text and ignores pointer events. Set "
        [:code "--ty-tabs-separator: transparent"] " to drop the bar's separator line when the marker already carries the active state."]
       (demo-area
        [:style "ty-tabs.pill-tabs {\n  --ty-tabs-separator: transparent;\n}\n\n.pill-marker {\n  border-radius: 9999px;\n  background: var(--ty-bg-primary-bold);\n  box-shadow: inset 0 0 0 1px var(--ty-border-primary),\n              0 4px 14px -6px var(--ty-color-primary);\n}"]
        [:ty-tabs.pill-tabs {:width "100%" :height "200px"}
         [:div.pill-marker {:slot "marker"}]
         [:ty-tab {:id "marker-inbox" :label "Inbox"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "The pill slides and resizes to match each tab — no per-tab CSS."]]]
         [:ty-tab {:id "marker-drafts" :label "Drafts"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Width animates too, so labels of different lengths stay wrapped."]]]
         [:ty-tab {:id "marker-archive" :label "Archive & Trash"}
          [:div.p-5
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Tune the glide with "
            [:code "--ty-tabs-transition-duration"] " and " [:code "--ty-tabs-transition-easing"] "."]]]])
       (code-block "<style>
ty-tabs.pill-tabs {
  /* drop the separator line — the pill carries the active state */
  --ty-tabs-separator: transparent;
}

.pill-marker {
  border-radius: 9999px;
  background: var(--ty-bg-primary-bold);
  box-shadow: inset 0 0 0 1px var(--ty-border-primary),
              0 4px 14px -6px var(--ty-color-primary);
}
</style>

<ty-tabs class=\"pill-tabs\" width=\"100%\" height=\"200px\">
  <div slot=\"marker\" class=\"pill-marker\"></div>

  <ty-tab id=\"inbox\" label=\"Inbox\">...</ty-tab>
  <ty-tab id=\"drafts\" label=\"Drafts\">...</ty-tab>
  <ty-tab id=\"archive\" label=\"Archive &amp; Trash\">...</ty-tab>
</ty-tabs>")]])
))
