(ns app.components.reagent-hosts-replicant
  (:require [app.state :as state]
            [reagent.dom.client :as rdom]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; --count-color: var(--reagent, #f97316); }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
   .label { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase;
            color: var(--ty-text-weak,#888); }
   .total { font-size: 0.8rem; color: var(--ty-text-weak,#888); }")

(defn host-ui []
  [:div.wrapper
   [:div.label "reagent tree"]
   ;; Replicant web component rendered as a child of Reagent's React tree
   [:shared-replicant]
   [:div.total (str "react sees count: " @state/shared-count)]])

(defn render! [^js el]
  (let [shadow (shim/ensure-shadow el)]
    (ensure-styles! shadow styles "reagent-hosts-replicant")
    (when-not (.-_mount el)
      (let [mount (.createElement js/document "div")
            root  (rdom/create-root mount)]
        (set! (.-_mount el) mount)
        (set! (.-_root el) root)
        (.appendChild shadow mount)))
    (rdom/render (.-_root el) [host-ui])))

(def configuration
  {:connected    render!
   :disconnected (fn [^js el]
                   (when-let [root (.-_root el)]
                     (.unmount root)))})
