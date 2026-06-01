(ns app.components.uix-hosts-replicant
  (:require [app.state :as state]
            [uix.core :as uix :refer [defui $]]
            [uix.dom]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; --count-color: var(--uix, #a78bfa); }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
   .label { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase;
            color: var(--ty-text-weak,#888); }
   .total { font-size: 0.8rem; color: var(--ty-text-weak,#888); }")

(defn use-ratom [!atom]
  (let [[val set-val!] (uix/use-state @!atom)]
    (uix/use-effect
      (fn []
        (let [k (gensym "uix-watch")]
          (add-watch !atom k (fn [_ _ _ v] (set-val! v)))
          #(remove-watch !atom k)))
      [!atom])
    val))

(defui host []
  (let [count (use-ratom state/shared-count)]
    ($ :div {:class "wrapper"}
      ($ :div {:class "label"} "uix tree")
      ;; Replicant web component rendered as a child of UIx's React tree
      ($ :shared-replicant)
      ($ :div {:class "total"} (str "react sees count: " count)))))

(defn render! [^js el]
  (let [shadow (shim/ensure-shadow el)]
    (ensure-styles! shadow styles "uix-hosts-replicant")
    (when-not (.-_mount el)
      (let [mount (.createElement js/document "div")
            root  (uix.dom/create-root mount)]
        (set! (.-_mount el) mount)
        (set! (.-_root el) root)
        (.appendChild shadow mount)))
    (uix.dom/render-root ($ host) (.-_root el))))

(def configuration
  {:connected    render!
   :disconnected (fn [^js el]
                   (when-let [r (.-_root el)]
                     (uix.dom/unmount-root r)))})
