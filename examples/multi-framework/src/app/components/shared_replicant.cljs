(ns app.components.shared-replicant
  (:require [app.state :as state]
            [replicant.dom :as d]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; }
   .wrapper { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
   .count { font-size: 3.5rem; font-weight: 700; line-height: 1;
            color: var(--count-color, var(--ty-text-strong, #fff)); min-width: 4rem; text-align: center; }
   .buttons { display: flex; gap: 0.5rem; }
   .buttons ty-button { cursor: pointer; }
   .label { font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase;
            color: var(--ty-text-weak, #888); }")

(defn counter-view [count]
  [:div.wrapper
   [:div.label "replicant watching r/atom"]
   [:div.count count]
   [:div.buttons
    [:ty-button {:flavor "neutral"
                 :on {:click #(swap! state/shared-count dec)}} "−"]
    [:ty-button {:flavor "primary"
                 :on {:click #(swap! state/shared-count inc)}} "+"]]])

(defn render! [^js el]
  (d/render (.-_mount el) (counter-view @state/shared-count)))

(def configuration
  {:connected
   (fn [^js el]
     (let [shadow (shim/ensure-shadow el)]
       (ensure-styles! shadow styles "shared-replicant")
       (when-not (.-_mount el)
         (let [mount (.createElement js/document "div")]
           (set! (.-_mount el) mount)
           (.appendChild shadow mount)))
       ;; Subscribe to the shared atom — r/atom is just IWatchable
       (let [watch-key (keyword (str "replicant-" (gensym)))]
         (set! (.-_watchKey el) watch-key)
         (add-watch state/shared-count watch-key
                    (fn [_ _ _ _] (render! el))))
       (render! el)))

   :disconnected
   (fn [^js el]
     (when-let [k (.-_watchKey el)]
       (remove-watch state/shared-count k)))})
