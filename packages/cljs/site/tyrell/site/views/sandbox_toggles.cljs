(ns tyrell.site.views.sandbox-toggles
  "Hidden verification page — NOT linked from any nav, NOT in the docs/guide
   route lists, so it never reaches nav or search. Reachable only by direct URL
   at /internal/toggles.

   Verifies the label double-fire fix on ty-switch / ty-checkbox. Reported
   symptom: clicking the LABEL TEXT fired `change` once (correct), but clicking
   the control itself inside the label fired it TWICE — some browsers forward a
   label's synthetic click to the associated form control even when the original
   click already targeted that control directly.

   Guarded by TyComponent/isDuplicateActivationClick: both events arrive in the
   same task, so a flag cleared on the next microtask catches only the spurious
   duplicate — two genuinely separate clicks are always in different tasks.

   Expected here: every counter reads 1 per click. A 2 is the bug back."
  (:require
   [clojure.string :as str]
   [tyrell.site.state :as state]))

(defn- counts []
  (get-in @state/state [:sandbox-toggles :counts] {}))

(defn- log-lines []
  (get-in @state/state [:sandbox-toggles :log] []))

(defn- bump! [k detail]
  (swap! state/state update-in [:sandbox-toggles :counts k] (fnil inc 0))
  (swap! state/state update-in [:sandbox-toggles :log]
         (fn [l] (vec (take-last 40 (conj (or l []) (str (name k) " → change  " detail)))))))

(defn- reset-count! [k]
  (swap! state/state assoc-in [:sandbox-toggles :counts k] 0))

(defn- clear-log! []
  (swap! state/state assoc-in [:sandbox-toggles :log] []))

(defn- on-change [k]
  (fn [^js e]
    (bump! k (str "value=" (some-> e .-detail .-value)))))

(defn- counter [k]
  (let [n (get (counts) k 0)]
    [:div.flex.items-center.gap-3
     [:span.ty-text--  {:style {:font-size "0.75rem"}} "change count:"]
     [:span.font-mono {:class (cond (zero? n) "ty-text--"
                                    (= 1 n) "ty-text-success"
                                    :else "ty-text-danger")
                       :style {:font-size "1.05rem" :font-weight "700"}}
      n]
     (when (> n 1)
       [:span.ty-text-danger {:style {:font-size "0.75rem"}} "← double-fire"])
     [:ty-button {:size "xs" :on {:click (fn [_] (reset-count! k))}} "reset"]]))

(defn- case-card [title hint body k]
  [:div.ty-content.rounded-lg.p-5.space-y-3
   [:h2.ty-text.font-semibold {:style {:font-size "0.9rem"}} title]
   (when hint [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}} hint])
   body
   (counter k)])

(defn view []
  [:div.p-6.max-w-3xl.mx-auto.space-y-6
   [:h1.text-2xl.font-bold.ty-text "ty-switch / ty-checkbox label double-fire (hidden — /internal/toggles)"]
   [:p.ty-text-.max-w-2xl {:style {:font-size "0.875rem" :line-height "1.7"}}
    "Click the label text, then the control itself. Both must count "
    [:strong "exactly 1"] " per click. A 2 means the label's synthetic click is reaching the "
    "control on top of the original — the case isDuplicateActivationClick guards."]

   [:div.space-y-4
    (case-card
     "ty-switch inside a <label>"
     "Click the text, then the toggle itself — the reported double-fire case."
     [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
      [:ty-switch {:name "notifications" :on {:change (on-change :switch)}}]
      [:span "Email notifications (click this text)"]]
     :switch)

    (case-card
     "ty-checkbox inside a <label>"
     "Same test with the checkbox primitive."
     [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
      [:ty-checkbox {:name "agree" :on {:change (on-change :checkbox)}}]
      [:span "I agree (click this text)"]]
     :checkbox)

    (case-card
     "Bare ty-switch, no label — control case"
     "No label to forward a synthetic click, so this must always have been 1."
     [:ty-switch {:name "bare" :on {:change (on-change :bare)}}]
     :bare)

    (case-card
     "Label with an interactive descendant"
     "Clicking the link must NOT toggle the control — interactive descendants handle their own clicks."
     [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
      [:ty-checkbox {:name "terms" :flavor "primary" :on {:change (on-change :rich)}}]
      [:span "I accept the "
       [:a.ty-text-primary.underline {:href "#" :on {:click #(.preventDefault %)}} "terms of service"]]]
     :rich)]

   [:div.ty-elevated.rounded-lg.p-4.space-y-2
    [:div.flex.items-center.justify-between
     [:span.ty-text.font-semibold {:style {:font-size "0.8rem"}} "Event log"]
     [:ty-button {:size "xs" :on {:click (fn [_] (clear-log!))}} "clear"]]
    [:pre.font-mono {:style {:font-size "0.7rem" :line-height "1.6" :max-height "220px"
                             :overflow "auto" :margin 0
                             :color "var(--ty-text-)"}}
     (if (seq (log-lines))
       (str/join "\n" (log-lines))
       "(no events yet)")]]])
