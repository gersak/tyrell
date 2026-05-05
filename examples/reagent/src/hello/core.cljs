(ns hello.core
  (:require [tyrell.components]    ; side-effect: registers all <ty-*> custom elements
            [tyrell.react :as ty]  ; React wrappers (re-exported from npm tyrell-react)
            [hello.navigation :as nav]
            [hello.state :as state]
            [hello.views :as views]
            [reagent.core :as r]
            [reagent.dom.client :as rdom]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.material.filled :as mat-filled]
            [tyrell.router :as router]))

(defn register-icons! []
  (icons/register!
    {:home         mat-filled/home
     :edit         lucide/edit
     :menu         mat-filled/menu
     :x            lucide/x
     :grid         lucide/grid-3x3
     :sun          lucide/sun
     :moon         lucide/moon
     :save         lucide/save
     :trash        lucide/trash-2
     :download     lucide/download
     :click        lucide/mouse-pointer-click
     :user         lucide/user
     :settings     lucide/settings
     :code         lucide/code-2
     :palette      lucide/palette
     :users        lucide/users
     :bar-chart    lucide/bar-chart-3
     :briefcase    lucide/briefcase
     :alert-circle lucide/alert-circle
     :refresh-cw   lucide/refresh-cw
     :send         lucide/send
     :loader       lucide/loader-2
     :check        lucide/check}))

(defn main-layout []
  (let [show-sidebar? (>= js/window.innerWidth 1024)]
    [:div.h-screen.flex.ty-canvas
     [nav/mobile-menu]
     (when show-sidebar? [nav/sidebar])
     [:div.flex-1.flex.flex-col.min-w-0
      [nav/header]
      [:main.flex-1.overflow-auto.p-6.ty-content
       ;; All views listed - each controls its own visibility
       [views/home-view]
       [views/forms-view]
       [views/buttons-view]
       [views/components-view]]]]))

(defonce root-ref (atom nil))

(defn render! []
  (when-let [root @root-ref]
    (rdom/render root [main-layout])))

(defn init []
  (register-icons!)

  ;; Apply initial theme
  (let [theme (:theme @state/app-state)
        html  (.-documentElement js/document)]
    (set! (.-className html) (if (= theme "dark") "dark" "")))

  ;; Watch for theme changes
  (add-watch state/app-state ::theme
             (fn [_ _ _ new-state]
               (let [html (.-documentElement js/document)]
                 (set! (.-className html) (if (= (:theme new-state) "dark") "dark" "")))))

  ;; Initialize router
  (router/init! "")

  ;; Create root only once (React 18 API)
  (when-not @root-ref
    (reset! root-ref (rdom/create-root (.getElementById js/document "app"))))

  ;; Watch router for re-renders
  (add-watch router/*router* ::render
             (fn [_ _ _ _] (render!)))

  ;; Initial render
  (render!))

(defn ^:after-load after-load []
  (render!))
