(ns tyrell.site.views.sandbox-sizing
  "Hidden integration-testing page — NOT linked from any nav, NOT part of
   docs/guide route lists (see core.cljs nav-items). Reachable only by direct
   URL at /internal/sizing. Throwaway: no docs polish intended.

   Model: every field (input/select/date-picker/copy) takes its geometry from
   ONE ladder — styles/field-size.ts emits --ty-field-* per :host([size]), so
   the same size name is the same height, font and label scale on all of them:
   xs 28 / sm 32 / md 36 / lg 40 / xl 44. `sm` is DEFAULT_SIZE (types/common.ts).

   Buttons run a 4px ladder one rung below (xs 24 / sm 28 / md 32 / lg 36 /
   xl 40) so a same-name button NESTS inside a field's end slot, and the
   ladders still intersect for flush alongside pairing: field sm = button md
   (32), field md = button lg (36), field lg = button xl (40).

   Tag, checkbox, switch and radio scale on their own ladders — shown here to
   eyeball them against the field rungs, not held to them."
  (:require
   [tyrell.site.state :as state]))

(def ^:private sizes ["xs" "sm" "md" "lg" "xl"])
(def ^:private field-heights {"xs" 28 "sm" 32 "md" 36 "lg" 40 "xl" 44})
(def ^:private button-sizes ["xs" "sm" "md" "lg" "xl"])
(def ^:private flavors ["primary" "success" "danger" "warning" "neutral"])

;; The three exact flush pairs, sharing a height: [field-size button-size px]
(def ^:private alongside-pairs
  [["sm" "md" 32] ["md" "lg" 36] ["lg" "xl" 40]])

(defn- flavor []
  (get-in @state/state [:sandbox-sizing :flavor] "primary"))

(defn- set-flavor! [f]
  (swap! state/state assoc-in [:sandbox-sizing :flavor] f))

(defn- flavor-chip [f]
  [:ty-tag {:flavor f :clickable "true"
            :on {:click (fn [_] (set-flavor! f))}
            :key f}
   f])

(defn- rung-label [size]
  [:code.ty-text-.text-xs {:style {:width "6.5rem" :flex-shrink "0" :white-space "nowrap"}}
   (str (when (= size "sm") "★ ") size " · " (field-heights size) "px")])

;; Dashed box of exactly the rung's field height: anything taller than the
;; ladder visibly breaks out of it, so misalignment is seen, not measured.
(defn- guide-row [size & children]
  (into [:div.flex.items-center.gap-3
         {:style {:height (str (field-heights size) "px")
                  :border-top "1px dashed var(--ty-color-primary)"
                  :border-bottom "1px dashed var(--ty-color-primary)"
                  :overflow-x "auto"}}]
        children))

(defn view []
  (let [f (flavor)]
    [:div.p-6.max-w-5xl.mx-auto.space-y-8
     [:h1.text-2xl.font-bold.ty-text "Sizing sandbox (hidden — /internal/sizing)"]

     [:div.flex.flex-wrap.gap-2 (map flavor-chip flavors)]

     ;; The whole point: one rung per row, every size-aware component in it,
     ;; bracketed by the expected field height.
     [:div.space-y-2
      [:h2.text-lg.font-semibold.ty-text "Every component, one rung per row"]
      [:p.ty-text-.text-sm
       "Dashed rules mark the rung's field height. Input, select, date-picker"
       " and copy must sit exactly inside them (★ = default size). Button, tag,"
       " checkbox, switch and radio run their own ladders — they sit inside the"
       " rules by design, they are not expected to touch them."]
      [:div.ty-elevated.p-6.rounded-lg.space-y-6
       (for [size sizes]
         [:div.space-y-1 {:key size}
          (rung-label size)
          (guide-row size
                     [:ty-input {:flavor f :size size :value "Sample text" :style {:width "8rem"}}]
                     [:ty-select {:flavor f :size size :value "a" :style {:width "10rem"}}
                      [:ty-option {:value "a"} "Option A"]
                      [:ty-option {:value "b"} "Option B"]]
                     [:ty-date-picker {:flavor f :size size :value "2026-07-17"}]
                     [:ty-copy {:flavor f :size size :value "copy-me-123" :style {:width "9rem"}}])
          (guide-row size
                     [:ty-button {:flavor f :size size} "Button"]
                     [:ty-tag {:flavor f :size size} "Tag"]
                     [:ty-checkbox {:flavor f :size size :checked "true"}]
                     [:ty-switch {:flavor f :size size :checked "true"}]
                     [:ty-radio {:flavor f :size size :checked "true"}]
                     [:span.ty-text--.text-xs "button / tag / checkbox / switch / radio — own ladders"])])]]

     ;; Labels ride the same ladder — font, gap and left inset track the
     ;; field's padding, so a row of labelled fields aligns on both edges.
     [:div.space-y-2
      [:h2.text-lg.font-semibold.ty-text "Labels follow the ladder"]
      [:p.ty-text-.text-sm
       "Label font (12/12/14/14/16), gap and left inset come from the same"
       " --ty-field-* vars, so labels and values line up across fields at"
       " every size."]
      [:div.ty-elevated.p-6.rounded-lg.space-y-4
       (for [size sizes]
         [:div.space-y-1 {:key size}
          (rung-label size)
          [:div.flex.flex-wrap.items-start.gap-3
          [:ty-input {:flavor f :size size :label "Input" :value "Sample text" :style {:width "11rem"}}]
          [:ty-select {:flavor f :size size :label "Select" :value "a" :style {:width "10rem"}}
           [:ty-option {:value "a"} "Option A"]
           [:ty-option {:value "b"} "Option B"]]
          [:ty-date-picker {:flavor f :size size :label "Date" :value "2026-07-17"}]
          [:ty-copy {:flavor f :size size :label "Copy" :value "copy-me-123" :style {:width "10rem"}}]
          [:ty-textarea {:flavor f :size size :label "Textarea" :rows "2"
                         :value "Sample text" :style {:width "12rem"}}]]])]]

     ;; Button ladder — compact, deliberately below the field ladder.
     [:div.space-y-2
      [:h2.text-lg.font-semibold.ty-text "Buttons — compact 4px ladder"]
      [:p.ty-text-.text-sm
       "24/28/32/36/40px — one rung below fields on purpose."]
      [:div.ty-elevated.p-6.rounded-lg
       [:div.flex.flex-wrap.items-end.gap-3
        (for [size button-sizes]
          [:div.flex.flex-col.items-center.gap-1 {:key size}
           [:ty-button {:flavor f :size size} "Button"]
           [:code.ty-text--.text-xs (str size (when (= size "sm") " ★"))]])]]]

     ;; Paired alongside — the three exact intersections. Field and button
     ;; sit in the SAME flex row, vertically centered but not stretched, so
     ;; any height mismatch shows up as visible misalignment, not just text.
     [:div.space-y-2
      [:h2.text-lg.font-semibold.ty-text "Paired alongside — same height, flush"]
      [:p.ty-text-.text-sm
       "field " [:code "sm"] " = button " [:code "md"] " (32px); field "
       [:code "md"] " = button " [:code "lg"] " (36px); field " [:code "lg"]
       " = button " [:code "xl"] " (40px). Input, select and button all sit"
       " in one row, top- and bottom-aligned — no gap between borders means"
       " the heights genuinely match."]
      [:div.ty-elevated.p-6.rounded-lg.space-y-3
       (for [[field-size btn-size px] alongside-pairs]
         [:div.flex.flex-wrap.items-center.gap-3 {:key field-size}
          [:code.ty-text-.text-xs {:style {:width "12rem"}}
           (str "field=" field-size " + button=" btn-size " (" px "px)")]
          [:div.flex.items-center.gap-2
           {:style {:border "1px dashed var(--ty-border)" :padding "0"}}
           [:ty-input {:flavor f :size field-size :placeholder "Input" :style {:width "10rem"}}]
           [:ty-select {:flavor f :size field-size :placeholder "Select" :style {:width "10rem"}}
            [:ty-option {:value "a"} "Option A"]
            [:ty-option {:value "b"} "Option B"]]
           [:ty-button {:flavor f :size btn-size} "Button"]]])]]

     ;; Button in the input's end slot — same size name, ~4px margin.
     [:div.space-y-2
      [:h2.text-lg.font-semibold.ty-text "Button in an input's end slot — same size name"]
      [:p.ty-text-.text-sm
       "Same name nests with a consistent ~4px margin (button sm 28 in field sm 32, …)."]
      [:div.ty-elevated.p-6.rounded-lg.space-y-3
       (for [size sizes]
         [:div.flex.flex-wrap.items-center.gap-3 {:key size}
          (rung-label size)
          [:ty-input {:flavor f :size size :placeholder "Search…" :style {:width "16rem"}}
           [:ty-button {:slot "end" :flavor f :size size :appearance "ghost"} "Go"]]])]]]))
