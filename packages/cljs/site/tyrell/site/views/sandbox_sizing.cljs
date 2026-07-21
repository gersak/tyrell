(ns tyrell.site.views.sandbox-sizing
  "Hidden integration-testing page — NOT linked from any nav, NOT part of
   docs/guide route lists (see core.cljs nav-items). Reachable only by direct
   URL at /internal/sizing. Throwaway: no docs polish intended.

   Model: fields (input/select/date-picker) come in exactly THREE sizes
   sharing --ty-size-sm/md/lg (32/36/40px). Buttons run a 4px ladder
   (xs 24 / sm 28 / md 32 / lg 36 / xl 40). The two ladders share a scale:
   field sm = button md (32), field md = button lg (36), field lg = button
   xl (40) — a button and a field of the paired size are the SAME height,
   flush in a row, not nested."
  (:require
   [tyrell.site.state :as state]))

(def ^:private field-sizes ["sm" "md" "lg"])
(def ^:private button-sizes ["xs" "sm" "md" "lg" "xl"])
(def ^:private flavors ["primary" "secondary" "success" "danger" "warning" "neutral"])

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

(defn view []
  (let [f (flavor)]
    [:div.p-6.max-w-5xl.mx-auto.space-y-8
     [:h1.text-2xl.font-bold.ty-text "Sizing sandbox (hidden — /internal/sizing)"]

     [:div.flex.flex-wrap.gap-2 (map flavor-chip flavors)]

     ;; Field reference grid — three sizes, three fields, all equal height.
     [:div.space-y-2
      [:h2.text-lg.font-semibold.ty-text "Fields — three sizes, one ladder"]
      [:p.ty-text-.text-sm
       "ty-input / ty-select / ty-date-picker share " [:code "--ty-size-sm/md/lg"]
       " (32/36/40px) and always line up. Legacy " [:code "xs"] "/" [:code "xl"]
       " coerce to sm/lg."]
      [:div.ty-elevated.p-6.rounded-lg.space-y-3
       (for [size field-sizes]
         [:div.flex.flex-wrap.items-center.gap-3 {:key size}
          [:code.ty-text-.w-8.text-xs size]
          [:ty-input {:flavor f :size size :placeholder "Input" :style {:width "12rem"}}]
          [:ty-select {:flavor f :size size :placeholder "Select" :style {:width "12rem"}}
           [:ty-option {:value "a"} "Option A"]
           [:ty-option {:value "b"} "Option B"]]
          [:ty-date-picker {:flavor f :size size :value "2026-07-17"}]])]]

     ;; Button ladder — compact, deliberately below the field ladder.
     [:div.space-y-2
      [:h2.text-lg.font-semibold.ty-text "Buttons — compact 4px ladder"]
      [:p.ty-text-.text-sm
       "24/28/32/36/40px — smaller than fields on purpose."]
      [:div.ty-elevated.p-6.rounded-lg
       [:div.flex.flex-wrap.items-end.gap-3
        (for [size button-sizes]
          [:div.flex.flex-col.items-center.gap-1 {:key size}
           [:ty-button {:flavor f :size size} "Button"]
           [:code.ty-text--.text-xs size]])]]]

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
       (for [size field-sizes]
         [:div.flex.flex-wrap.items-center.gap-3 {:key size}
          [:code.ty-text-.w-8.text-xs size]
          [:ty-input {:flavor f :size size :placeholder "Search…" :style {:width "16rem"}}
           [:ty-button {:slot "end" :flavor f :size size :appearance "ghost"} "Go"]]])]]]))
