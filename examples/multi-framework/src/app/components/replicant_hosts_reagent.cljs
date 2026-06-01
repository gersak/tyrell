(ns app.components.replicant-hosts-reagent
  (:require [app.state :as state]
            [replicant.dom :as d]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; --count-color: var(--replicant, #34d399); }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
   .label { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase;
            color: var(--ty-text-weak,#888); }
   .total { font-size: 0.8rem; color: var(--ty-text-weak,#888); }")

(defn host-view [count]
  [:div.wrapper
   [:div.label "replicant tree"]
   ;; Reagent web component rendered as a child of Replicant's tree
   [:shared-reagent]
   [:div.total (str "replicant sees count: " count)]])

(defn render! [^js el]
  (d/render (.-_mount el) (host-view @state/shared-count)))

(def configuration
  {:connected
   (fn [^js el]
     (let [shadow (shim/ensure-shadow el)]
       (ensure-styles! shadow styles "replicant-hosts-reagent")
       (when-not (.-_mount el)
         (let [mount (.createElement js/document "div")]
           (set! (.-_mount el) mount)
           (.appendChild shadow mount)))
       (let [k (keyword (str "replicant-host-" (gensym)))]
         (set! (.-_watchKey el) k)
         (add-watch state/shared-count k (fn [_ _ _ _] (render! el))))
       (render! el)))

   :disconnected
   (fn [^js el]
     (when-let [k (.-_watchKey el)]
       (remove-watch state/shared-count k)))})
