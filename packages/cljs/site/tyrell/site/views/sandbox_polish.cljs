(ns tyrell.site.views.sandbox-polish
  "Hidden verification page — NOT linked from any nav, NOT in the docs/guide
   route lists, so it never reaches nav or search. Reachable only by direct URL
   at /internal/polish.

   Showcases known open inconsistencies that were surveyed but deliberately
   NOT fixed, so the behavior is reproducible on demand instead of living in a
   scrollback somewhere. Each section states what you should see if the issue
   is still present, and what 'fixed' would look like.

   Delete a section when its issue is settled; delete the page when all are.")

(defn- issue-card
  "One surveyed issue. `status` is the short verdict line, `repro` the thing
   to actually do, `body` the live components."
  [{:keys [title where status repro body]}]
  [:div.ty-content.rounded-lg.p-5.space-y-3
   [:div.space-y-1
    [:h2.ty-text.font-semibold {:style {:font-size "0.9rem"}} title]
    [:code.ty-text-- {:style {:font-size "0.7rem"}} where]]
   [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}} status]
   [:p.ty-text-warning {:style {:font-size "0.8125rem" :line-height "1.6"}}
    [:strong "Repro: "] repro]
   body])

;; --- 1. Focus-ring flavor asymmetry --------------------------------------
;; checkbox + button derive the focus ring from their own flavor; switch +
;; radio hardcode --ty-input-shadow-focus and ignore flavor entirely.

(defn- focus-ring-section []
  (issue-card
   {:title "Focus ring ignores flavor on ty-switch / ty-radio"
    :where "styles/switch.ts:56-58, styles/radio.ts:111-113 vs styles/checkbox.ts:62-64"
    :status (str "ty-checkbox and ty-button compute the focus ring from the component's own "
                 "flavor — a danger checkbox rings red. ty-switch and ty-radio hardcode "
                 "--ty-input-shadow-focus, so a danger switch rings the generic input color.")
    :repro (str "Tab through the row below. Every control is flavor=\"danger\". "
                "The checkbox and button ring RED; the switch and radio ring the generic "
                "blue-ish input color. Fixed = all four ring red.")
    :body
    [:div.space-y-4
     [:div.flex.flex-wrap.items-center.gap-6
      [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm
       [:ty-checkbox {:flavor "danger" :checked true}]
       [:span.ty-text- "checkbox (flavored ring)"]]
      [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm
       [:ty-switch {:flavor "danger" :checked true}]
       [:span.ty-text- "switch (generic ring)"]]
      [:ty-button {:flavor "danger"} "button (flavored ring)"]]
     [:ty-radio-group {:label "radio-group, flavor=danger (generic ring)"
                       :flavor "danger"
                       :orientation "horizontal"
                       :value "b"}
      [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm
       [:ty-radio {:value "a"}] [:span.whitespace-nowrap "One"]]
      [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm
       [:ty-radio {:value "b"}] [:span.whitespace-nowrap "Two"]]]]}))

;; --- 2. ty-tag ellipsis never renders ------------------------------------
;; .tag-content is display:flex AND carries text-overflow:ellipsis on itself.
;; A flex box lays its children out via flex, not as an inline formatting
;; context, so the ellipsis is never painted — text hard-clips instead.
;; option.ts hit this exact trap and works around it by flipping the
;; truncating box to display:block.

(defn- tag-ellipsis-section []
  (issue-card
   {:title "ty-tag hard-clips instead of showing an ellipsis"
    :where "styles/tag.ts:109-121 (display:flex) + tag.ts:275-278 (text-overflow:ellipsis)"
    :status (str "text-overflow:ellipsis only paints when the truncating box's children form "
                 "an inline formatting context. .tag-content is display:flex, so the ellipsis "
                 "is dropped and the label is hard-cut mid-glyph. Only visible when something "
                 "constrains a tag's width — which no docs demo does, hence the miss.")
    :repro (str "Compare the two rows. The ty-select clone (already fixed, option.ts flips to "
                "display:block) ends in a clean '…'. The ty-tags below it are cut off flat with "
                "no ellipsis. Fixed = both end in '…'.")
    :body
    [:div.space-y-4
     [:div.space-y-1
      [:span.ty-text-- {:style {:font-size "0.7rem"}} "ty-select clone — FIXED, truncates with …"]
      [:div {:style {:max-width "260px"}}
       [:ty-select {:label "Robot" :value "eywa"}
        [:ty-option {:value "eywa"} "EYWA Dataset Example with Reacher"]
        [:ty-option {:value "pdf"} "Generate PDF microservice"]]]]
     [:div.space-y-1
      [:span.ty-text-- {:style {:font-size "0.7rem"}} "ty-tag in a narrow box — hard clip, no …"]
      [:div.flex.flex-col.gap-2 {:style {:max-width "260px"}}
       [:ty-tag {:flavor "primary" :style {:max-width "180px"}}
        "EYWA Dataset Example with Reacher"]
       [:ty-tag {:flavor "neutral" :dismissible true :style {:max-width "180px"}}
        "Another rather long tag label that must truncate"]]]]}))

;; --- 3. ty-copy's button has no design-system focus ring -----------------
;; It IS a real focusable <button type="button"> (components/copy.ts:331), so
;; keyboard users reach it — it just falls back to the bare UA outline while
;; every other interactive primitive draws the library's own ring.

(defn- copy-focus-section []
  (issue-card
   {:title "ty-copy's copy button falls back to the UA focus outline"
    :where "styles/copy.ts:98-116 — :hover only, no :focus-visible"
    :status (str "The copy button is a real focusable <button type=\"button\"> "
                 "(components/copy.ts:331), so it is tab-reachable and Enter-activatable. "
                 "Every other interactive primitive defines an explicit focus ring; this one "
                 "doesn't, so it shows whatever bare outline the browser draws. Cosmetic "
                 "inconsistency, not an a11y blocker.")
    :repro (str "Tab from the ty-button into the copy field's button. The ty-button gets the "
                "library ring; the copy button gets a plain browser outline. Fixed = both draw "
                "the same ring.")
    :body
    [:div.flex.flex-wrap.items-end.gap-4
     [:ty-button {:flavor "primary"} "tab starts here"]
     [:div {:style {:min-width "280px"}}
      [:ty-copy {:label "API Key" :value "sk_live_1234567890abcdef"}]]]}))

;; --- 4. Settled: things checked and deliberately left alone --------------

(defn- settled-note []
  [:div.ty-elevated.rounded-lg.p-4.space-y-2
   [:span.ty-text.font-semibold {:style {:font-size "0.8rem"}} "Surveyed, deliberately not changed"]
   [:ul.ty-text-.space-y-1 {:style {:font-size "0.78rem" :line-height "1.6"
                                    :list-style "disc" :padding-left "1.1rem"}}
    [:li "tag.ts:143,267 — dismiss-hover and count badge use hardcoded rgba(0,0,0,0.1) "
     "rather than a theme token; reads as an unlit smudge in dark mode. Current look accepted."]
    [:li "ty-select default width already matches ty-input (width:100% on :host in both) — "
     "the narrow docs demo was a per-example max-width, since removed."]]])

(defn view []
  [:div.p-6.max-w-3xl.mx-auto.space-y-6
   [:h1.text-2xl.font-bold.ty-text "Open polish issues (hidden — /internal/polish)"]
   [:p.ty-text-.max-w-2xl {:style {:font-size "0.875rem" :line-height "1.7"}}
    "Known inconsistencies found in a survey pass and left unfixed on purpose. "
    "Each card says what to do and what you should see while the issue is live. "
    "Focus-ring cases need the "
    [:strong "keyboard"] " — click-focus may not draw a :focus-visible ring."]
   [:div.space-y-4
    (focus-ring-section)
    (tag-ellipsis-section)
    (copy-focus-section)]
   (settled-note)])
