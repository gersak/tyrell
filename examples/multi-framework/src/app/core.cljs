(ns app.core
  (:require [app.lazy.reagent-counter]
            [app.lazy.uix-counter]
            [app.lazy.replicant-counter]
            [app.lazy.shared-reagent]
            [app.lazy.shared-uix]
            [app.lazy.shared-replicant]
            [app.lazy.reagent-hosts-replicant]
            [app.lazy.uix-hosts-replicant]
            [app.lazy.replicant-hosts-reagent]
            [shadow.loader :as loader]))

(defn init []
  (let [buf             (atom [])
        buffer!         (fn [^js e] (swap! buf conj e))
        on-first-counter (fn on-first-counter [^js e]
                           (.removeEventListener js/window "counter-value" on-first-counter)
                           (swap! buf conj e)
                           (.addEventListener js/window "counter-value" buffer!)
                           (let [t0 (js/Date.now)]
                             (-> (loader/load "app-chart")
                                 (.then (fn []
                                          (.removeEventListener js/window "counter-value" buffer!)
                                          (.dispatchEvent js/document
                                            (js/CustomEvent. "module-loaded"
                                              #js {:bubbles true
                                                   :detail  #js {:module "app-chart"
                                                                  :ms    (- (js/Date.now) t0)}}))
                                          (doseq [^js ev @buf]
                                            (.dispatchEvent
                                              (.-target ev)
                                              (js/CustomEvent. "counter-value"
                                                #js {:bubbles true
                                                     :detail  (.-detail ev)}))))))))]
    (.addEventListener js/window "counter-value" on-first-counter)))
