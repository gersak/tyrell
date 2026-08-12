(ns replicant-example.core
  "Replicant + Tyrell Components Example with Routing"
  (:require [replicant.dom :as dom]
            [tyrell.components]
            [tyrell.router :as router]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

;; =============================================================================
;; State
;; =============================================================================

(defonce state
  (atom {:counter 0
         :form {:name ""
                :email ""}}))

;; =============================================================================
;; Routes - define route tree
;; =============================================================================

(router/link ::router/root
  [{:id ::home
    :segment "home"
    :landing 10}
   {:id ::icons
    :segment "icons"}
   {:id ::forms
    :segment "forms"}
   {:id ::about
    :segment "about"}])

;; =============================================================================
;; Components - each checks its own rendered? state
;; =============================================================================

(defn nav-button [route-id label icon-name]
  (let [active? (router/rendered? route-id)]
    [:button.px-4.py-2.rounded.flex.items-center.gap-2.transition-colors
     {:class (if active?
               ["ty-bg-primary" "ty-text++"]
               ["ty-bg-neutral-" "ty-text" "hover:ty-bg-neutral"])
      :on {:click #(router/navigate! route-id)}}
     [:ty-icon {:name icon-name :size "sm"}]
     label]))

(defn nav []
  [:nav.ty-elevated.p-4.rounded-lg.mb-6
   [:div.flex.gap-2.flex-wrap
    (nav-button ::home "Home" "home")
    (nav-button ::icons "Icons" "star")
    (nav-button ::forms "Forms" "edit")
    (nav-button ::about "About" "info")]])

;; -----------------------------------------------------------------------------
;; Home View
;; -----------------------------------------------------------------------------

(defn home-view []
  (when (router/rendered? ::home)
    [:div.ty-elevated.p-6.rounded-lg
     [:h2.ty-text++.text-2xl.font-bold.mb-4 "Welcome Home"]
     [:p.ty-text.mb-4
      "This is a Replicant + Ty example with routing. Each view component checks "
      [:code.ty-bg-neutral-.px-1.rounded "router/rendered?"]
      " to decide if it should render."]

     [:div.ty-bg-primary-.p-4.rounded.mb-4
      [:p.ty-text-primary "Counter: " [:strong (:counter @state)]]
      [:div.flex.gap-2.mt-2
       [:ty-button {:flavor "primary"
                    :on {:click #(swap! state update :counter inc)}}
        [:ty-icon {:name "plus" :size "sm"}]
        "Increment"]
       [:ty-button {:flavor "neutral"
                    :on {:click #(swap! state update :counter dec)}}
        [:ty-icon {:name "minus" :size "sm"}]
        "Decrement"]]]

     [:p.ty-text-.text-sm
      "Navigate using the buttons above to see different views."]]))

;; -----------------------------------------------------------------------------
;; Icons View
;; -----------------------------------------------------------------------------

(defn icons-view []
  (when (router/rendered? ::icons)
    [:div.ty-elevated.p-6.rounded-lg
     [:h2.ty-text++.text-2xl.font-bold.mb-4 "Icons"]
     [:p.ty-text-.mb-4 "Ty icons registered via ty.icons namespace:"]

     [:div.grid.grid-cols-4.gap-4
      (for [icon-name ["heart" "star" "check" "x" "home" "user" "settings" "info"]]
        [:div.ty-bg-neutral-.p-4.rounded.flex.flex-col.items-center.gap-2
         {:key icon-name}
         [:ty-icon {:name icon-name :size "lg" :class "ty-text-primary"}]
         [:span.ty-text-.text-xs icon-name]])]]))

;; -----------------------------------------------------------------------------
;; Forms View
;; -----------------------------------------------------------------------------

(defn forms-view []
  (when (router/rendered? ::forms)
    (let [{:keys [name email]} (:form @state)]
      [:div.ty-elevated.p-6.rounded-lg
       [:h2.ty-text++.text-2xl.font-bold.mb-4 "Forms"]
       [:p.ty-text-.mb-4 "Ty form components with Replicant event handling:"]

       [:div.space-y-4
        [:div
         [:label.ty-text+.block.text-sm.font-medium.mb-1 "Name"]
         [:ty-input
          {:placeholder "Enter your name"
           :value name
           :on {:input #(swap! state assoc-in [:form :name]
                               (-> % .-detail .-value))}}]]

        [:div
         [:label.ty-text+.block.text-sm.font-medium.mb-1 "Email"]
         [:ty-input
          {:type "email"
           :placeholder "Enter your email"
           :value email
           :on {:input #(swap! state assoc-in [:form :email]
                               (-> % .-detail .-value))}}]]

        [:div.ty-bg-neutral-.p-4.rounded
         [:p.ty-text-.text-sm "Current values:"]
         [:p.ty-text "Name: " [:strong (if (seq name) name "(empty)")]]
         [:p.ty-text "Email: " [:strong (if (seq email) email "(empty)")]]]

        [:ty-button {:flavor "primary"
                     :on {:click #(js/alert (str "Submitted: " name " / " email))}}
         [:ty-icon {:name "check" :size "sm"}]
         "Submit"]]])))

;; -----------------------------------------------------------------------------
;; About View
;; -----------------------------------------------------------------------------

(defn about-view []
  (when (router/rendered? ::about)
    [:div.ty-elevated.p-6.rounded-lg
     [:h2.ty-text++.text-2xl.font-bold.mb-4 "About"]
     [:p.ty-text.mb-4
      "This example demonstrates:"]

     [:ul.space-y-2.ty-text
      [:li.flex.items-center.gap-2
       [:ty-icon {:name "check" :size "sm" :class "ty-text-success"}]
       "Replicant DOM rendering"]
      [:li.flex.items-center.gap-2
       [:ty-icon {:name "check" :size "sm" :class "ty-text-success"}]
       "ty.router for navigation"]
      [:li.flex.items-center.gap-2
       [:ty-icon {:name "check" :size "sm" :class "ty-text-success"}]
       "ty.icons for icon registration"]
      [:li.flex.items-center.gap-2
       [:ty-icon {:name "check" :size "sm" :class "ty-text-success"}]
       "Ty web components (button, input, icon)"]
      [:li.flex.items-center.gap-2
       [:ty-icon {:name "check" :size "sm" :class "ty-text-success"}]
       "Ty CSS system (ty-elevated, ty-text++, etc.)"]]

     [:div.ty-bg-info-.p-4.rounded.mt-4
      [:p.ty-text-info.text-sm
       "Each view component uses "
       [:code.ty-bg-info.px-1.rounded "(when (router/rendered? ::route-id) ...)"]
       " to control its own visibility."]]]))

;; =============================================================================
;; App - composes all views, no cond needed
;; =============================================================================

(defn app []
  [:div.ty-canvas.min-h-screen.p-6
   [:div.max-w-2xl.mx-auto
    [:h1.ty-text++.text-3xl.font-bold.mb-6 "Replicant + Ty"]
    (nav)
    ;; All views listed - each controls its own visibility
    (home-view)
    (icons-view)
    (forms-view)
    (about-view)]])

;; =============================================================================
;; Render & Init
;; =============================================================================

(defn render! []
  (dom/render (.getElementById js/document "app") (app)))

(defn ^:dev/after-load init []
  (println "🚀 Initializing Replicant + Ty Example")

  ;; Register icons
  (icons/register!
    {:home     lucide/home
     :star     lucide/star
     :edit     lucide/edit
     :info     lucide/info
     :heart    lucide/heart
     :check    lucide/check
     :x        lucide/x
     :user     lucide/user
     :settings lucide/settings
     :plus     lucide/plus
     :minus    lucide/minus})

  ;; Initialize router
  (router/init! "")

  ;; Watch router for re-renders
  (add-watch router/*router* ::render
    (fn [_ _ _ _] (render!)))

  ;; Watch state for re-renders
  (add-watch state ::render
    (fn [_ _ _ _] (render!)))

  ;; Initial render
  (render!))
