(ns app.state
  (:require [reagent.core :as r]))

(defonce shared-count (r/atom 0))
