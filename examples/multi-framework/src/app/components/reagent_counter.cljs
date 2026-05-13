(ns app.components.reagent-counter
  (:require [reagent.core :as r]
            [reagent.dom.client :as rdom]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
   .count { font-size: 3.5rem; font-weight: 700; line-height: 1;
            color: var(--ty-text-strong, #fff); min-width: 4rem; text-align: center; }
   .buttons { display: flex; gap: 0.5rem; }
   .buttons ty-button { cursor: pointer; }")

(defn counter-ui [!count]
  (fn []
    [:div.wrapper
     [:div.count @!count]
     [:div.buttons
      [:ty-button {:flavor "secondary" :on-click #(swap! !count dec)} "−"]
      [:ty-button {:flavor "primary"   :on-click #(swap! !count inc)} "+"]]]))

(defn render! [^js el]
  (let [shadow (shim/ensure-shadow el)]
    (ensure-styles! shadow styles "reagent-counter")
    (when-not (.-_mount el)
      (set! (.-_count el) (r/atom (or (shim/parse-int-attr el "initial") 0)))
      (let [mount (.createElement js/document "div")
            root  (rdom/create-root mount)]
        (set! (.-_mount el) mount)
        (set! (.-_root el) root)
        (.appendChild shadow mount)))
    (rdom/render (.-_root el) [(counter-ui (.-_count el))])))

(def configuration
  {:observed     [:initial]
   :connected    render!
   :disconnected (fn [^js el]
                   (when-let [root (.-_root el)]
                     (.unmount root)))})
