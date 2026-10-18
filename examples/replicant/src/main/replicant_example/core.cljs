(ns replicant-example.core
  "Replicant + Tyrell Components Example with Routing"
  (:require [clojure.string :as str]
            [replicant.dom :as dom]
            [tyrell.components]
            [tyrell.router :as router]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

;; =============================================================================
;; State
;; =============================================================================

(defonce state
  (atom {:counter 0
         :confirm-reset? false
         :email-error nil
         :sent nil}))

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
  [:ty-button {:flavor "primary"
               :appearance (if (router/rendered? route-id) "solid" "ghost")
               :on {:click #(router/navigate! route-id)}}
   [:ty-icon {:slot "start" :name icon-name}]
   label])

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

(defn reset-modal []
  [:ty-modal {:open (when (:confirm-reset? @state) "")
              :label "Reset counter?"
              :on {:close #(swap! state assoc :confirm-reset? false)}}
   [:div.ty-floating.rounded-xl.p-6.flex.flex-col.gap-4 {:style {:width "320px"}}
    [:h3.ty-text++.text-lg.font-semibold "Reset counter?"]
    [:p.ty-text-.text-sm "The page behind zooms out slightly while a modal is open; "
     [:code "no-zoom"] " turns that off."]
    [:div.flex.justify-end.gap-2
     [:ty-button {:appearance "ghost"
                  :on {:click #(swap! state assoc :confirm-reset? false)}}
      "Cancel"]
     [:ty-button {:flavor "danger"
                  :on {:click #(swap! state assoc :counter 0 :confirm-reset? false)}}
      "Reset"]]]])

(defn home-view []
  (when (router/rendered? ::home)
    [:div.ty-elevated.p-6.rounded-lg
     [:h2.ty-text++.text-2xl.font-bold.mb-4 "Welcome Home"]
     [:p.ty-text.mb-4
      "This is a Replicant + Tyrell example with routing. Each view checks "
      [:code.ty-bg-neutral-.px-1.rounded "router/rendered?"]
      " to decide if it should render."]

     [:div.ty-bg-primary-.p-4.rounded.mb-4
      [:p.ty-text-primary "Counter: " [:strong (:counter @state)]]
      [:div.flex.gap-2.mt-2
       [:ty-button {:flavor "primary"
                    :on {:click #(swap! state update :counter inc)}}
        [:ty-icon {:slot "start" :name "plus"}]
        "Increment"]
       [:ty-button {:flavor "neutral"
                    :on {:click #(swap! state update :counter dec)}}
        [:ty-icon {:slot "start" :name "minus"}]
        "Decrement"]
       [:ty-button {:flavor "danger" :appearance "outlined"
                    :on {:click #(swap! state assoc :confirm-reset? true)}}
        "Reset…"]]]

     [:p.ty-text-.text-sm
      "Navigate using the buttons above to see different views."]
     (reset-modal)]))

;; -----------------------------------------------------------------------------
;; Icons View
;; -----------------------------------------------------------------------------

(defn icons-view []
  (when (router/rendered? ::icons)
    [:div.ty-elevated.p-6.rounded-lg
     [:h2.ty-text++.text-2xl.font-bold.mb-4 "Icons"]
     [:p.ty-text-.mb-4 "Lucide icons registered with " [:code "tyrell.icons/register!"] ":"]

     [:div.grid.grid-cols-4.gap-4
      (for [icon-name ["heart" "star" "check" "x" "home" "user" "settings" "info"]]
        [:div.ty-bg-neutral-.p-4.rounded.flex.flex-col.items-center.gap-2
         {:replicant/key icon-name}
         [:ty-icon {:name icon-name :size "lg" :class "ty-text-primary"}]
         [:span.ty-text-.text-xs icon-name]])]]))

;; -----------------------------------------------------------------------------
;; Forms View
;; -----------------------------------------------------------------------------

(def interests
  [["design" "pencil" "Design"]
   ["engineering" "code" "Engineering"]
   ["product" "layers" "Product"]
   ["support" "users" "Support"]])

(defn- form-data
  "FormData -> [[name value] ...] (multiple selects give one entry per value)."
  [^js form]
  (->> (js/FormData. form) (.entries) (js/Array.from) (map vec)))

(defn- submit!
  "Runs only when every field passes its rules: the browser validates before
   the submit event fires. A taken email stands in for a server-side error."
  [^js e]
  (.preventDefault e)
  (let [entries (form-data (.-target e))
        email (some (fn [[k v]] (when (= k "email") v)) entries)]
    (if (= email "taken@example.com")
      (swap! state assoc :email-error "That email is already registered" :sent nil)
      (swap! state assoc :email-error nil :sent entries))))

(defn forms-view []
  (when (router/rendered? ::forms)
    (let [{:keys [email-error sent]} @state]
      [:div.ty-elevated.p-6.rounded-lg
       [:h2.ty-text++.text-2xl.font-bold.mb-2 "Forms"]
       [:p.ty-text-.mb-4
        "Rules on the fields do the checking: send it empty, leave a field after typing, "
        "or press Enter. Try " [:code "taken@example.com"] " for a server-side error."]

       [:form.flex.flex-col.gap-4 {:on {:submit submit!}}
        [:div.grid.gap-4 {:style {:grid-template-columns "repeat(auto-fit, minmax(14rem, 1fr))"}}
         [:ty-input {:name "name" :label "Name" :required "" :minlength "2" :maxlength "40"
                     :placeholder "Ada Lovelace"}]
         [:ty-input {:name "email" :label "Email" :type "email" :required ""
                     :placeholder "ada@example.com"
                     :error (or email-error "")
                     :on {:input #(when email-error (swap! state assoc :email-error nil))}}
          [:ty-icon {:slot "start" :name "mail"}]]
         [:ty-input {:name "handle" :label "Handle" :pattern "[a-z0-9_]{3,15}"
                     :placeholder "ada_l"}]
         [:ty-input {:name "seats" :label "Seats" :type "number" :required "" :min "1" :max "50"
                     :value "5"}]]

        [:div.flex.flex-col.gap-3
         [:ty-select {:id "interests" :name "interests" :label "Interests" :multiple ""
                      :placeholder "Pick a few"}
          (for [[v icon label] interests]
            [:ty-option {:replicant/key v :value v}
             [:span.flex.items-center.gap-2 [:ty-icon {:name icon}] label]])]
         [:div.flex.flex-wrap.gap-2
          [:ty-selected-options {:for "interests"}]]]

        [:div.flex.items-center.gap-3
         [:ty-button {:flavor "primary" :size "md"}
          [:ty-icon {:slot "start" :name "send"}]
          "Send"]
         [:ty-button {:type "reset" :appearance "ghost" :size "md"
                      :on {:click #(swap! state assoc :sent nil :email-error nil)}}
          "Clear"]]]

       (when sent
         [:div.ty-bg-success-.p-4.rounded.mt-4
          [:p.ty-text-success.text-sm.font-medium.mb-1 "Sent:"]
          [:code.ty-text.text-sm.break-all
           (str/join "&" (map (fn [[k v]] (str k "=" v)) sent))]])])))

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
      (for [line ["Replicant DOM rendering"
                  "tyrell.router for navigation"
                  "tyrell.icons + tyrell.lucide for icons"
                  "Native form validation on ty-input, rich ty-select options, ty-selected-options"
                  "ty-modal with the default page zoom"
                  "Tyrell CSS system (ty-elevated, ty-text++, etc.)"]]
        [:li.flex.items-center.gap-2 {:replicant/key line}
         [:ty-icon {:name "check" :size "sm" :class "ty-text-success"}]
         line])]

     [:div.ty-bg-info-.p-4.rounded.mt-4
      [:p.ty-text-info.text-sm
       "Each view uses "
       [:code.ty-bg-info.px-1.rounded "(when (router/rendered? ::route-id) ...)"]
       " to control its own visibility."]]]))

;; =============================================================================
;; App - composes all views, no cond needed
;; =============================================================================

(defn app []
  [:div.ty-canvas.min-h-screen.p-6
   [:div.max-w-2xl.mx-auto
    [:h1.ty-text++.text-3xl.font-bold.mb-6 "Replicant + Tyrell"]
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
  (println "🚀 Initializing Replicant + Tyrell Example")

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
     :users    lucide/users
     :settings lucide/settings
     :plus     lucide/plus
     :minus    lucide/minus
     :mail     lucide/mail
     :send     lucide/send
     :pencil   lucide/pencil
     :code     lucide/code
     :layers   lucide/layers})

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
