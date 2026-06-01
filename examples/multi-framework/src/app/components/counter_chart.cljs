(ns app.components.counter-chart
  (:require ["chart.js/auto" :as Chart]
            [tyrell.shim :as shim]
            [tyrell.css :refer [ensure-styles!]]))

(def styles
  ":host { display: block; width: 100%; }
   canvas { display: block; border-radius: 8px; }")

(def ^:private fw-colors
  #js {"reagent"   "rgba(249,115,22,0.85)"
       "uix"       "rgba(167,139,250,0.85)"
       "replicant" "rgba(52,211,153,0.85)"})

(def ^:private fw-borders
  #js {"reagent"   "rgba(249,115,22,1)"
       "uix"       "rgba(167,139,250,1)"
       "replicant" "rgba(52,211,153,1)"})

(defn- tally [^js inst-map]
  (let [t #js {:reagent 0 :uix 0 :replicant 0}]
    (.forEach inst-map
      (fn [^js d _]
        (let [k (.-framework d)
              v (.-value d)]
          (aset t k (+ (aget t k) v)))))
    t))

(defn- make-chart! [^js canvas]
  (new Chart canvas
    #js {:type "bar"
         :data #js {:labels   #js ["Reagent" "UIx" "Replicant"]
                    :datasets #js [#js {:data            #js [0 0 0]
                                        :backgroundColor #js [(aget fw-colors "reagent")
                                                               (aget fw-colors "uix")
                                                               (aget fw-colors "replicant")]
                                        :borderColor     #js [(aget fw-borders "reagent")
                                                               (aget fw-borders "uix")
                                                               (aget fw-borders "replicant")]
                                        :borderWidth     1
                                        :borderRadius    4}]}
         :options #js {:responsive false
                       :animation  #js {:duration 150}
                       :plugins    #js {:legend  #js {:display false}
                                        :tooltip #js {:callbacks #js {:label (fn [^js ctx] (str (.-raw ctx)))}}}
                       :scales     #js {:y #js {:beginAtZero true
                                                :ticks       #js {:color "rgba(255,255,255,0.6)" :precision 0}
                                                :grid        #js {:color "rgba(255,255,255,0.08)"}}
                                        :x #js {:ticks #js {:color "rgba(255,255,255,0.6)"}
                                                :grid  #js {:display false}}}}}))

(defn- update-chart! [^js chart ^js totals]
  (aset (aget (.. chart -data -datasets) 0) "data"
        #js [(aget totals "reagent")
             (aget totals "uix")
             (aget totals "replicant")])
  (.update chart))

(def ^:export configuration
  {:connected    (fn [^js el]
                   (let [shadow   (shim/ensure-shadow el)
                         inst-map (js/Map.)
                         canvas   (.createElement js/document "canvas")
                         handler  (fn [^js e]
                                    (let [d   (.-detail e)
                                          fw  (and d (.-framework d))
                                          v   (and d (.-value d))
                                          src (.-target e)]
                                      (when (and fw (js/isFinite v) src)
                                        (.set inst-map src d)
                                        (when-let [chart (.-_chart el)]
                                          (update-chart! chart (tally inst-map))))))]
                     (ensure-styles! shadow styles "counter-chart")
                     (.appendChild shadow canvas)
                     (set! (.-_handler el) handler)
                     (.addEventListener js/window "counter-value" handler)
                     (js/requestAnimationFrame
                       (fn []
                         (let [w (max 200 (.-offsetWidth el))
                               h 160]
                           (set! (.-width canvas) w)
                           (set! (.-height canvas) h)
                           (let [chart (make-chart! canvas)]
                             (set! (.-_chart el) chart)
                             (update-chart! chart (tally inst-map))))))))
   :disconnected (fn [^js el]
                   (when-let [h (.-_handler el)]
                     (.removeEventListener js/window "counter-value" h))
                   (when-let [c (.-_chart el)]
                     (.destroy c)))})

(defn ^:export init! []
  (shim/define! "counter-chart" configuration))
