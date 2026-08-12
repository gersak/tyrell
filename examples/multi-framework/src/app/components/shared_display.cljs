(ns app.components.shared-display
  (:require [uix.core :refer [defui $]]))

(defui counter-display [{:keys [count on-dec on-inc]}]
  ($ :div {:class "wrapper"}
    ($ :div {:class "count"} count)
    ($ :div {:class "buttons"}
      ($ :ty-button {:flavor "neutral" :on-click on-dec} "−")
      ($ :ty-button {:flavor "primary"   :on-click on-inc} "+"))))
