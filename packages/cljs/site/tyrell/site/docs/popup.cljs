(ns tyrell.site.docs.popup
  "Documentation for ty-popup component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table event-table
                                             doc-section docs-page component-header section-label demo-area]]))

(defn view []
  (docs-page
   (component-header "ty-popup"
                     "Click-triggered popup with smart edge-aware positioning, scroll locking, ESC/backdrop close, and manual control mode. Nest ty-popup inside any trigger element — clicking the trigger opens the popup.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "placement"
        :type "string"
        :default "\"bottom\""
        :description "Side plus optional cross-axis alignment: top, right, bottom, left — each also as -start / -end (e.g. bottom-start, left-end). Bare side = centered on the trigger; -start aligns leading edges, -end aligns trailing edges. Auto-flips if it would overflow, keeping the alignment: left-start tries right-start before falling back to the other axis."}
       {:name "offset"
        :type "number"
        :default "8"
        :description "Distance in pixels between the popup and its trigger element"}
       {:name "manual"
        :type "boolean"
        :default "false"
        :description "Disable the click trigger — popup opens only via openPopup() / togglePopup()"}
       {:name "disable-close"
        :type "boolean"
        :default "false"
        :description "Disable ESC and backdrop-click close — popup closes only via closePopup()"}])]

    [:div.mb-6
     (section-label "Methods")
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.5rem 0"}}
      [:div.flex.items-center.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "openPopup()"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Open the popup programmatically"]]]
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.5rem 0"}}
      [:div.flex.items-center.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "closePopup()"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Close the popup programmatically"]]]
     [:div {:style {:padding "0.5rem 0"}}
      [:div.flex.items-center.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} "togglePopup()"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Toggle open/closed"]]]]

    [:div
     (section-label "Events")
     (event-table
      [{:name "open"
        :payload "{}"
        :when-fired "Fires when the popup opens"}
       {:name "close"
        :payload "{}"
        :when-fired "Fires when the popup closes. Does not bubble (native <dialog> semantics) — listen on the element itself, so a popup closing inside a ty-modal never trips the modal's own close listener."}])]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Basic")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Nest " [:code "ty-popup"] " inside any trigger element. Click to open; ESC or click outside to close. Content inside ty-popup renders in the popup panel."]
       (demo-area
        [:ty-button
         "Open popup"
         [:ty-popup {:placement "bottom"}
          [:div.ty-elevated.rounded-lg.p-4 {:style {:min-width "200px"}}
           [:p.ty-text- {:style {:font-size "0.875rem"}} "Popup content goes here."]]]])
       (code-block "<ty-button>
  Open popup
  <ty-popup placement=\"bottom\">
    <div class=\"ty-elevated rounded-lg p-4\" style=\"min-width: 200px\">
      Popup content goes here.
    </div>
  </ty-popup>
</ty-button>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Placement")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "A placement is a "
        [:strong "side"] " plus an optional "
        [:strong "cross-axis alignment"] ". The bare side centers the popup on the trigger; "
        [:code "-start"] " lines up the leading edges and " [:code "-end"] " the trailing edges — "
        "so " [:code "bottom-start"] " hangs below with left edges flush, and "
        [:code "left-end"] " sits to the left with bottom edges flush. Twelve combinations in total."]
       (demo-area
        [:div.flex.flex-col.gap-3
         (for [[side variants] [["bottom" ["bottom-start" "bottom" "bottom-end"]]
                                ["top" ["top-start" "top" "top-end"]]
                                ["left" ["left-start" "left" "left-end"]]
                                ["right" ["right-start" "right" "right-end"]]]]
           ^{:key side}
           [:div.flex.flex-wrap.items-center.gap-2
            [:span.ty-text--.font-mono {:style {:font-size "0.6875rem" :width "3.5rem"}} side]
            (for [p variants]
              ^{:key p}
              [:ty-button {:size "sm"} p
               [:ty-popup {:placement p}
                [:div.ty-elevated.rounded-lg.p-3 {:style {:min-width "130px"}}
                 [:p.ty-text.font-mono {:style {:font-size "0.75rem"}} p]]]])])])
       [:p.ty-text--.mb-3 {:style {:font-size "0.75rem" :line-height "1.6"}}
        "Alignment survives the auto-flip: a " [:code "left-start"] " popup with no room on the left "
        "becomes " [:code "right-start"] " — still top-aligned — before it gives up on the axis entirely."]
       (code-block "<!-- side only — centered on the trigger -->
<ty-popup placement=\"bottom\">...</ty-popup>

<!-- side + alignment -->
<ty-popup placement=\"bottom-start\">...</ty-popup>   <!-- below, left edges flush  -->
<ty-popup placement=\"bottom-end\">...</ty-popup>     <!-- below, right edges flush -->
<ty-popup placement=\"top-start\">...</ty-popup>      <!-- above, left edges flush  -->
<ty-popup placement=\"left-start\">...</ty-popup>     <!-- left,  top edges flush   -->
<ty-popup placement=\"left-end\">...</ty-popup>       <!-- left,  bottom edges flush -->
<ty-popup placement=\"right-end\">...</ty-popup>      <!-- right, bottom edges flush -->")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Action Menu")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Common pattern — actions inside the popup close it via " [:code ".closePopup()"] " on the nearest " [:code "ty-popup"] " ancestor."]
       (demo-area
        [:ty-button {:action ""}
         [:ty-icon {:name "more-horizontal" :size "sm"}]
         [:ty-popup {:placement "bottom"}
          [:div.ty-elevated.rounded-lg.py-1 {:style {:min-width "160px"}}
           [:button.w-full.ty-text {:style {:display "flex" :align-items "center" :gap "0.5rem" :padding "0.5rem 0.75rem" :font-size "0.8125rem" :background "none" :border "none" :cursor "pointer" :text-align "left"}
                                    :on {:click #(.closePopup ^js (.closest (.-target %) "ty-popup"))}}
            [:ty-icon {:name "edit" :size "xs"}] "Edit"]
           [:button.w-full.ty-text {:style {:display "flex" :align-items "center" :gap "0.5rem" :padding "0.5rem 0.75rem" :font-size "0.8125rem" :background "none" :border "none" :cursor "pointer" :text-align "left"}
                                    :on {:click #(.closePopup ^js (.closest (.-target %) "ty-popup"))}}
            [:ty-icon {:name "copy" :size "xs"}] "Duplicate"]
           [:div {:style {:height "1px" :background "var(--ty-border-soft)" :margin "0.25rem 0"}}]
           [:button.w-full.ty-text-danger {:style {:display "flex" :align-items "center" :gap "0.5rem" :padding "0.5rem 0.75rem" :font-size "0.8125rem" :background "none" :border "none" :cursor "pointer" :text-align "left"}
                                           :on {:click #(.closePopup ^js (.closest (.-target %) "ty-popup"))}}
            [:ty-icon {:name "trash-2" :size "xs"}] "Delete"]]]])
       (code-block "<ty-button action>
  <ty-icon name=\"more-horizontal\" size=\"sm\"></ty-icon>
  <ty-popup placement=\"bottom\">
    <div class=\"ty-elevated rounded-lg py-1\" style=\"min-width: 160px\">
      <button onclick=\"this.closest('ty-popup').closePopup()\">Edit</button>
      <button onclick=\"this.closest('ty-popup').closePopup()\">Duplicate</button>
      <button onclick=\"this.closest('ty-popup').closePopup()\">Delete</button>
    </div>
  </ty-popup>
</ty-button>")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Confirm Dialog")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use " [:code "disable-close"] " to prevent accidental dismissal — the user must make an explicit choice."]
       (demo-area
        [:ty-button {:flavor "danger"}
         "Delete item"
         [:ty-popup {:placement "bottom" :disable-close ""}
          [:div.ty-elevated.rounded-lg.p-5 {:style {:max-width "280px"}}
           [:p.ty-text+ {:style {:font-weight "600" :margin-bottom "0.5rem"}} "Delete this item?"]
           [:p.ty-text- {:style {:font-size "0.8125rem" :margin-bottom "1rem"}} "This action cannot be undone."]
           [:div.flex.justify-end.gap-2
            [:ty-button {:flavor "neutral" :size "sm"
                         :on {:click #(.closePopup ^js (.closest (.-target %) "ty-popup"))}}
             "Cancel"]
            [:ty-button {:flavor "danger" :size "sm"
                         :on {:click #(.closePopup ^js (.closest (.-target %) "ty-popup"))}}
             "Delete"]]]]])
       (code-block "<ty-button flavor=\"danger\">
  Delete item
  <ty-popup placement=\"bottom\" disable-close>
    <div class=\"ty-elevated rounded-lg p-5\" style=\"max-width: 280px\">
      <p>Delete this item?</p>
      <p>This action cannot be undone.</p>
      <div class=\"flex justify-end gap-2\">
        <ty-button flavor=\"neutral\" size=\"sm\"
                   onclick=\"this.closest('ty-popup').closePopup()\">Cancel</ty-button>
        <ty-button flavor=\"danger\" size=\"sm\"
                   onclick=\"this.closest('ty-popup').closePopup()\">Delete</ty-button>
      </div>
    </div>
  </ty-popup>
</ty-button>")]])

   (doc-section "Advanced Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Manual Control")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "manual"] " to take full control of open/close via the JS API. Useful when the trigger lives outside the popup's DOM subtree."]
       (code-block "const popup = document.querySelector('ty-popup');

// Open / close / toggle
popup.openPopup();
popup.closePopup();
popup.togglePopup();

// Listen for lifecycle events
popup.addEventListener('open', () => console.log('opened'));
popup.addEventListener('close', () => console.log('closed'));" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Framework Binding")
       (code-block ";; ClojureScript / Replicant
[:ty-button {:on {:click #(.openPopup (.getElementById js/document \"my-popup\"))}}
 \"Open\"]
[:ty-popup {:id \"my-popup\" :manual \"\" :disable-close \"\"}
 [:div.ty-elevated.rounded-lg.p-5 ...]]

<!-- React -->
<button onClick={() => popupRef.current.openPopup()}>Open</button>
<TyPopup ref={popupRef} manual disable-close>
  <div class=\"ty-elevated rounded-lg p-5\">...</div>
</TyPopup>")]])
))
