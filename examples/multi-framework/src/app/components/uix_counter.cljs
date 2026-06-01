(ns app.components.uix-counter
  (:require [uix.core :as uix :refer [defui $]]
            [uix.dom]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
   .count { font-size: 3.5rem; font-weight: 700; line-height: 1;
            color: var(--ty-text-strong, #fff); min-width: 4rem; text-align: center; }
   .buttons { display: flex; gap: 0.5rem; }
   .buttons ty-button { cursor: pointer; }")

(defui counter [{:keys [initial on-change]}]
  (let [[count set-count] (uix/use-state (or initial 0))]
    (uix/use-effect
      (fn [] (when on-change (on-change count)) nil)
      [count on-change])
    ($ :div {:class "wrapper"}
       ($ :div {:class "count"} count)
       ($ :div {:class "buttons"}
          ($ :ty-button {:flavor "secondary" :on-click #(set-count dec)} "−")
          ($ :ty-button {:flavor "primary"   :on-click #(set-count inc)} "+")))))

(defn render! [^js el]
  (let [shadow (shim/ensure-shadow el)]
    (ensure-styles! shadow styles "uix-counter")
    (when-not (.-_mount el)
      (let [mount (.createElement js/document "div")
            root  (uix.dom/create-root mount)
            emit  #(.dispatchEvent el (js/CustomEvent. "counter-value"
                                        #js {:bubbles true
                                             :detail  #js {:framework "uix" :value %}}))]
        (set! (.-_mount el) mount)
        (set! (.-_root el) root)
        (set! (.-_emit el) emit)
        (.appendChild shadow mount)))
    (uix.dom/render-root
     ($ counter {:initial   (shim/parse-int-attr el "initial")
                 :on-change (.-_emit el)})
     (.-_root el))))

(def configuration
  {:observed     [:initial]
   :connected    render!
   :disconnected (fn [^js el]
                   (when-let [r (.-_root el)]
                     (uix.dom/unmount-root r)))})
