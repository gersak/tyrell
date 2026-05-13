(ns app.lazy.reagent-counter
  (:require [shadow.lazy :as lazy]
            [tyrell.shim :as shim]))

(def config (lazy/loadable app.components.reagent-counter/configuration))

(defn- loading-html [label]
  (str "<div style='display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1rem 0;'>"
       "<div style='font-size:2.5rem;font-weight:700;color:var(--ty-text-weak,#aaa);'>···</div>"
       "<div style='font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;"
       "color:var(--ty-text-weak,#aaa);'>loading " label "</div>"
       "</div>"))

(defn- notify-loaded! [^js el module-name ms]
  (.dispatchEvent el (js/CustomEvent. "module-loaded"
                       #js {:bubbles true
                            :detail  #js {:module module-name :ms ms}})))

(shim/define! "reagent-counter"
  {:observed  [:initial]
   :connected (fn [^js el]
                (let [shadow (shim/ensure-shadow el)
                      t0     (js/Date.now)]
                  (set! (.-innerHTML shadow) (loading-html "reagent"))
                  (-> (lazy/load config)
                      (.then (fn [cfg]
                               (set! (.-innerHTML shadow) "")
                               (notify-loaded! el "app-reagent" (- (js/Date.now) t0))
                               ((:connected cfg) el))))))
   :attr      (fn [^js el delta]
                (-> (lazy/load config)
                    (.then #(when-let [f (:attr %)] (f el delta)))))
   :disconnected (fn [^js el]
                   (-> (lazy/load config)
                       (.then #(when-let [f (:disconnected %)] (f el)))))})
