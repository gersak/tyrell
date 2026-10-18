(ns hello.state
  (:require [reagent.core :as r]
            [tyrell.router :as router]))

(defn get-initial-theme []
  (or (.getItem js/localStorage "ty-theme")
      (when (.-matches (.matchMedia js/window "(prefers-color-scheme: dark)"))
        "dark")
      "light"))

(def empty-form
  {:name ""
   :email ""
   :phone ""
   :role ""
   :skills []
   :bio ""
   :birthdate ""
   :newsletter false})

(defonce app-state
  (r/atom {:theme (get-initial-theme)
           :mobile-menu-open false
           :form empty-form
           ;; Errors only the "server" can know; field rules live on the inputs
           :server-errors {}
           :form-submitting false
           :form-sent nil
           ;; Bumped by Reset: the form remounts, so shown messages go with it
           :form-key 0}))

;; Route definitions - ID vars for use in other namespaces
(def home-id       ::home)
(def forms-id      ::forms)
(def buttons-id    ::buttons)
(def components-id ::components)

(def route-defs
  [{:id home-id       :segment "home"       :name "Home"       :icon "home"  :landing 10}
   {:id forms-id      :segment "forms"      :name "Forms"      :icon "edit"}
   {:id buttons-id    :segment "buttons"    :name "Buttons"    :icon "click"}
   {:id components-id :segment "components" :name "Components" :icon "grid"}])

(router/link ::router/root route-defs)

(defn toggle-theme! []
  (let [new-theme (if (= (:theme @app-state) "light") "dark" "light")]
    (swap! app-state assoc :theme new-theme)
    (.setItem js/localStorage "ty-theme" new-theme)
    (let [html (.-documentElement js/document)]
      (set! (.-className html) (if (= new-theme "dark") "dark" "")))))

(defn toggle-mobile-menu! []
  (swap! app-state update :mobile-menu-open not))
