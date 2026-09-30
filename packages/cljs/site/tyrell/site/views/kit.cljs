(ns tyrell.site.views.kit
  "Shared pieces of the landing page examples: validation rules, field
   wiring, a two-column grid and the result modal."
  (:require [clojure.string :as str]
            [tyrell.site.state :as state]))

(defn value [^js e] (.. e -detail -value))

(defn init!
  "Seed an example's state once; hot reloads keep what the user typed."
  [form initial]
  (when-not (contains? @state/state form)
    (swap! state/state assoc form initial)))

;; --- Validation --------------------------------------------------------------
;; A rule is [valid? message]; the first failing rule wins.

(defn required [label] [#(not (str/blank? %)) (str label " is required")])
(defn min-len [n label] [#(>= (count (str/trim (str %))) n) (str label " must be at least " n " characters")])
(defn max-len [n label] [#(<= (count (str %)) n) (str label " must not exceed " n " characters")])
(defn matches [re message] [#(re-matches re (str %)) message])
(def email (matches #"^[^\s@]+@[^\s@]+\.[^\s@]+$" "Please enter a valid email address"))

(defn error-for [rules k v]
  (some (fn [[valid? message]] (when-not (valid? v) message)) (get rules k)))

(defn validate!
  "Validate the whole form, show every error, return the error map."
  [form rules]
  (let [data (get-in @state/state [form :form-data])
        errors (into {} (keep #(some->> (error-for rules % (get data %)) (vector %))) (keys rules))]
    (swap! state/state update form assoc :touched (set (keys rules)) :errors errors)
    errors))

(defn field
  "A form element bound to [form :form-data k]: value, error once touched,
   and re-validation on input."
  [tag form rules k attrs & children]
  (let [{:keys [form-data errors touched]} (get @state/state form)]
    (into [tag (merge attrs
                      {:value (get form-data k)
                       :error (when (contains? touched k) (get errors k))
                       :on {:input #(let [v (value %) e (error-for rules k v)]
                                      (swap! state/state update form
                                             (fn [f] (-> f
                                                         (assoc-in [:form-data k] v)
                                                         (update :touched (fnil conj #{}) k)
                                                         (update :errors (fn [es] (if e (assoc es k e) (dissoc es k))))))))}})]
          children)))

;; --- Layout ------------------------------------------------------------------

(defn cols
  "Two equal columns when there's room, one on phones: a column is at least half
   the row (never three) and at least 12rem (so it collapses when narrow).
   Inline grid: index.html has a global .grid rule that overrides grid-cols-*."
  [& children]
  (into [:div.gap-3 {:style {:display "grid"
                             :grid-template-columns "repeat(auto-fit, minmax(max(12rem, calc(50% - 0.375rem)), 1fr))"}}]
        children))

(defn icon [name] [:ty-icon {:slot "start" :name name :size "sm"}])

(defn summary [rows]
  (apply cols (for [[label v] rows]
                [:div {:replicant/key label}
                 [:p.text-xs.ty-text-- {:class ["mb-0.5"]} label]
                 [:p.text-sm.font-medium.ty-text v]])))

(defn result-modal
  "Modal with a status badge, title, body and a right-aligned action row."
  [{:keys [open on-close icon flavor title subtitle actions]} & body]
  [:ty-modal {:open open :on {:close on-close}}
   [:div.p-5.ty-elevated.rounded-lg.flex.flex-col.gap-4 {:style {:max-width "480px"}}
    [:div.flex.items-center.gap-3
     [:div.w-9.h-9.rounded-full.flex.items-center.justify-center {:class (str "ty-bg-" flavor)}
      [:ty-icon.ty-text++ {:name icon :size "sm"}]]
     [:div [:h3.text-base.font-semibold.ty-text title] [:p.text-xs.ty-text- subtitle]]]
    (into [:div] body)
    (into [:div.flex.gap-2.justify-end] actions)]])
