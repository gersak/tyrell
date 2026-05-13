(ns app.components.shared-reagent
  (:require [app.state :as state]
            [reagent.dom.client :as rdom]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
   .count { font-size: 3.5rem; font-weight: 700; line-height: 1;
            color: var(--ty-text-strong, #fff); min-width: 4rem; text-align: center; }
   .buttons { display: flex; gap: 0.5rem; }
   .buttons ty-button { cursor: pointer; }
   .label { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase;
            color: var(--ty-text-weak, #888); }")

(defn counter-ui []
  [:div.wrapper
   [:div.label "reagent r/atom"]
   [:div.count @state/shared-count]
   [:div.buttons
    [:ty-button {:flavor "secondary" :on-click #(swap! state/shared-count dec)} "−"]
    [:ty-button {:flavor "primary"   :on-click #(swap! state/shared-count inc)} "+"]]])

(defn render! [^js el]
  (let [shadow (shim/ensure-shadow el)]
    (ensure-styles! shadow styles "shared-reagent")
    (when-not (.-_mount el)
      (let [mount (.createElement js/document "div")
            root  (rdom/create-root mount)]
        (set! (.-_mount el) mount)
        (set! (.-_root el) root)
        (.appendChild shadow mount)))
    (rdom/render (.-_root el) [counter-ui])))

(def configuration
  {:connected    render!
   :disconnected (fn [^js el]
                   (when-let [root (.-_root el)]
                     (.unmount root)))})
