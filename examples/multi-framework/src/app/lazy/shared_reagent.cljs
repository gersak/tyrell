(ns app.lazy.shared-reagent
  (:require [shadow.lazy :as lazy]
            [tyrell.shim :as shim]))

(def config (lazy/loadable app.components.shared-reagent/configuration))

(defn- notify! [^js el ms]
  (.dispatchEvent el (js/CustomEvent. "module-loaded"
                       #js {:bubbles true
                            :detail  #js {:module "app-mixed" :ms ms}})))

(shim/define! "shared-reagent"
  {:connected (fn [^js el]
                (let [shadow (shim/ensure-shadow el)
                      t0     (js/Date.now)]
                  (set! (.-innerHTML shadow)
                    "<div style='padding:1rem;color:var(--ty-text-weak,#aaa);font-size:0.8rem;'>loading…</div>")
                  (-> (lazy/load config)
                      (.then (fn [cfg]
                               (set! (.-innerHTML shadow) "")
                               (notify! el (- (js/Date.now) t0))
                               ((:connected cfg) el))))))
   :disconnected (fn [^js el]
                   (-> (lazy/load config)
                       (.then #(when-let [f (:disconnected %)] (f el)))))})
