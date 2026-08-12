(ns app.components.shared-uix
  (:require [app.state :as state]
            [uix.core :as uix :refer [defui $]]
            [uix.dom]
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

(defn use-ratom
  "Subscribe a UIx component to a Reagent atom."
  [!atom]
  (let [[val set-val!] (uix/use-state @!atom)]
    (uix/use-effect
      (fn []
        (let [k (gensym "uix-watch")]
          (add-watch !atom k (fn [_ _ _ v] (set-val! v)))
          #(remove-watch !atom k)))
      [!atom])
    val))

(defui counter []
  (let [count (use-ratom state/shared-count)]
    ($ :div {:class "wrapper"}
      ($ :div {:class "label"} "uix watching r/atom")
      ($ :div {:class "count"} count)
      ($ :div {:class "buttons"}
        ($ :ty-button {:flavor "neutral"
                       :on-click #(swap! state/shared-count dec)} "−")
        ($ :ty-button {:flavor "primary"
                       :on-click #(swap! state/shared-count inc)} "+")))))

(defn render! [^js el]
  (let [shadow (shim/ensure-shadow el)]
    (ensure-styles! shadow styles "shared-uix")
    (when-not (.-_mount el)
      (let [mount (.createElement js/document "div")
            root  (uix.dom/create-root mount)]
        (set! (.-_mount el) mount)
        (set! (.-_root el) root)
        (.appendChild shadow mount)))
    (uix.dom/render-root ($ counter) (.-_root el))))

(def configuration
  {:connected    render!
   :disconnected (fn [^js el]
                   (when-let [r (.-_root el)]
                     (uix.dom/unmount-root r)))})
