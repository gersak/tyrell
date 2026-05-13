(ns app.components.replicant-counter
  (:require [replicant.dom :as d]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
   .count { font-size: 3.5rem; font-weight: 700; line-height: 1;
            color: var(--ty-text-strong, #fff); min-width: 4rem; text-align: center; }
   .buttons { display: flex; gap: 0.5rem; }
   .buttons ty-button { cursor: pointer; }")

(defn counter-view [count dispatch!]
  [:div.wrapper
   [:div.count count]
   [:div.buttons
    [:ty-button {:flavor "secondary" :on {:click #(dispatch! dec)}} "−"]
    [:ty-button {:flavor "primary"   :on {:click #(dispatch! inc)}} "+"]]])

(defn render! [^js el]
  (let [shadow (shim/ensure-shadow el)]
    (ensure-styles! shadow styles "replicant-counter")
    (when-not (.-_mount el)
      (let [mount (.createElement js/document "div")]
        (set! (.-_mount el) mount)
        (.appendChild shadow mount)))
    (let [dispatch! (fn [f]
                      (set! (.-_count el) (f (or (.-_count el) 0)))
                      (render! el))]
      (d/render (.-_mount el)
                (counter-view (or (.-_count el) 0) dispatch!)))))

(def configuration
  {:observed  [:initial]
   :connected (fn [^js el]
                (set! (.-_count el) (or (shim/parse-int-attr el "initial") 0))
                (render! el))
   :attr      (fn [^js el {:strs [initial]}]
                (when initial
                  (set! (.-_count el) (js/parseInt initial))
                  (render! el)))})
