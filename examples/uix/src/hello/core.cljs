(ns hello.core
  (:require
   ;; Tyrell web components — side-effect import registers all <ty-*> custom elements
    ["tyrell-components"]
   ;; Clean React wrappers
    ["tyrell-react" :as ty]
    [hello.icons]
    ;; Views
    [hello.views.forms :as forms]
    [hello.views.layout :as layout-views]
    [hello.views.modals :as modals-views]
    ;; All component configurations
   ;; TY Router
    [tyrell.router :as router]
   ;; UIx for React-like development
    [uix.core :as uix :refer [defui $]]
    [uix.dom]))

;; Define routes
(router/link ::router/root
             [{:id ::home
               :segment ""
               :name "Getting Started"
               :landing 10}
              {:id ::buttons
               :segment "buttons"
               :name "Buttons & Icons"}
              {:id ::forms
               :segment "forms"
               :name "Forms & Inputs"}
              {:id ::layout
               :segment "layout"
               :name "Layout & Containers"}
              {:id ::modals
               :segment "modals"
               :name "Modals & Overlays"}])

(def route-titles
  {::home    "Getting Started"
   ::buttons "Buttons & Icons"
   ::forms   "Forms & Inputs"
   ::layout  "Layout & Containers"
   ::modals  "Modals & Overlays"})

(defui nav-link [{:keys [route-id icon label]}]
  (let [is-active (router/rendered? route-id true)]
    ($ :button.flex.items-center.gap-3.px-4.py-3.rounded-lg.text-left.transition-all.duration-150.mx-4.grow
       {:class (if is-active
                 "ty-bg-primary- ty-text-primary++ font-medium"
                 "ty-text hover:ty-bg-neutral- hover:ty-text+")
        :on-click #(router/navigate! route-id)}
       ($ ty/Icon {:name icon
                   :class "w-5 h-5 flex-shrink-0"})
       ($ :span label))))

(defui feature-card [{:keys [icon title description]}]
  ($ :div.ty-elevated.rounded-lg.p-6.hover:shadow-lg.transition-shadow
     ($ :div.ty-bg-primary-.rounded-lg.p-3.w-12.h-12.flex.items-center.justify-center.mb-4
        ($ ty/Icon {:name icon
                    :class "w-6 h-6 ty-text-primary++"}))
     ($ :h3.ty-text++.font-semibold.mb-2 title)
     ($ :p.ty-text-.text-sm description)))

(defui stat-item [{:keys [label value]}]
  ($ :div.text-center
     ($ :div.ty-text++.text-2xl.font-bold value)
     ($ :div.ty-text-.text-sm label)))

(defui home-view []
  (when (router/rendered? ::home true)
    ($ :div.space-y-8
     ;; Hero section
     ($ :div.text-center
        ($ :h1.ty-text++.text-4xl.font-bold.mb-4
           "UIx + ty-react Hybrid")
        ($ :p.ty-text.text-lg.max-w-2xl.mx-auto.mb-8
           "A modern ClojureScript application showcasing the perfect integration of UIx hooks, ty-react components, and Tailwind CSS following the TY design system.")
        ($ :div.flex.flex-wrap.justify-center.gap-4
           ($ ty/Button {:variant "primary"
                         :class "flex items-center gap-2"}
              ($ ty/Icon {:name "play"})
              "Explore Components")
           ($ ty/Button {:flavor "outline"
                         :class "flex items-center gap-2"}
              ($ ty/Icon {:name "code"})
              "View Source")))

     ;; Feature grid
     ($ :div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-6
        ($ feature-card {:icon "zap"
                         :title "UIx Hooks"
                         :description "Modern React-like development with use-state, use-effect, and functional components."})
        ($ feature-card {:icon "layers"
                         :title "ty-react Components"
                         :description "Clean component wrappers with proper TypeScript integration and event handling."})
        ($ feature-card {:icon "palette"
                         :title "Semantic Design"
                         :description "TY color system with automatic dark/light theme support and semantic classes."}))

     ;; Quick stats
     ($ :div.ty-elevated.rounded-lg.p-6
        ($ :h2.ty-text++.text-xl.font-bold.mb-4
           "Project Stats")
        ($ :div.grid.grid-cols-2.md:grid-cols-4.gap-4
           ($ stat-item {:label "Components"
                         :value "12+"})
           ($ stat-item {:label "Icons"
                         :value "25+"})
           ($ stat-item {:label "Views"
                         :value "5"})
           ($ stat-item {:label "Themes"
                         :value "2"}))))))

(defui buttons-view []
  (when (router/rendered? ::buttons true)
    ($ :div.space-y-8
     ($ :div
        ($ :h1.ty-text++.text-3xl.font-bold.mb-2
           "Buttons & Icons")
        ($ :p.ty-text-.max-w-2xl.mb-8
           "Interactive examples of button variants, sizes, and icon integration patterns."))

     ;; Button variants
     ($ :div.ty-elevated.rounded-lg.p-6.mb-8
        ($ :h2.ty-text++.text-xl.font-semibold.mb-4
           "Button Variants")
        ($ :div.flex.flex-wrap.gap-4
           ($ ty/Button {:flavor "primary"} "Primary")
           ($ ty/Button {:flavor "secondary"} "Secondary")
           ($ ty/Button {:flavor "success"
                         :outlined true} "Outline")
           ($ ty/Button {:flavor "ghost"} "Ghost")))

     ;; Icon gallery
     ($ :div.ty-elevated.rounded-lg.p-6
        ($ :h2.ty-text++.text-xl.font-semibold.mb-4
           "Available Icons")
        ($ :div.grid.grid-cols-4.md:grid-cols-8.gap-4
           (for [icon ["home" "user" "mail" "phone" "message-circle" "send" "check" "x"
                       "alert-circle" "forms" "settings" "edit" "play" "code" "zap" "layers"]]
             ($ :div.flex.flex-col.items-center.gap-2.p-3.rounded-lg.hover:ty-bg-neutral-.transition-colors
                {:key icon}
                ($ ty/Icon {:name icon
                            :class "w-6 h-6"})
                ($ :span.text-xs.ty-text- icon))))))))

(defui forms-view []
  (when (router/rendered? ::forms true)
    ($ forms/view)))

(defui layout-view []
  (when (router/rendered? ::layout true)
    ($ layout-views/view)))

(defui modals-view []
  (when (router/rendered? ::modals true)
    ($ modals-views/view)))

;; Router integration hook
(defn use-router []
  "Hook to subscribe to router state changes and trigger re-renders"
  (let [[router-state set-router-state] (uix/use-state @router/*router*)]

    ;; Subscribe to router changes
    (uix/use-effect
      (fn []
        (let [watch-key (gensym "uix-router-watch")]
         ;; Add watch to router atom
          (add-watch router/*router* watch-key
                     (fn [_key _ref _old-state new-state]
                       (set-router-state new-state)))

         ;; Cleanup function
          (fn []
            (remove-watch router/*router* watch-key))))
      []) ; Empty dependency array - only run once

    router-state))

(defui app []
  (let [;; Remove state-based routing - use ty router instead
        [sidebar-open set-sidebar-open] (uix/use-state false)
        [theme set-theme] (uix/use-state "light")

        ;; Subscribe to router state changes for re-rendering
        router-state (use-router)]

    ;; Apply theme to html element
    (uix/use-effect
      (fn []
        (let [html-el (.-documentElement js/document)]
          (if (= theme "dark")
            (.add (.-classList html-el) "dark")
            (.remove (.-classList html-el) "dark"))))
      [theme])

    ;; Fixed layout structure - using flexbox instead of CSS Grid
    ($ :div.min-h-screen.flex.flex-col.ty-canvas

       ;; Header - fixed at top
       ($ :header.flex.items-center.justify-between.px-6.h-16.ty-elevated.border-b.ty-border.z-50.flex-shrink-0
          ($ :div.flex.items-center.gap-4
             ;; Mobile menu button
             ($ ty/Button
                {:variant "ghost"
                 :size "sm"
                 :on-click #(set-sidebar-open true)
                 :class "lg:hidden"}
                ($ ty/Icon {:name "menu"}))

             ;; Logo/Title derived from current route
             ($ :h1.ty-text++.text-xl.font-bold
                (get route-titles (:current router-state) "UIx + ty-react")))

          ;; Header actions
          ($ :div.flex.items-center.gap-3
             ;; Theme toggle
             ($ ty/Button
                {:variant "ghost"
                 :size "sm"
                 :on-click #(set-theme (if (= theme "light") "dark" "light"))
                 :class "flex items-center gap-2"}
                ($ ty/Icon {:name (if (= theme "light") "sun" "moon")})
                (when (>= (.-innerWidth js/window) 768)
                  (if (= theme "light") "Light" "Dark")))

             ;; Status indicator
             ($ :div.ty-bg-success-.ty-text-success++.px-2.py-1.rounded.text-xs.font-medium.flex.items-center.gap-1
                ($ ty/Icon {:name "check"
                            :class "w-3 h-3"})
                "Ready")))

       ;; Content area with sidebar and main
       ($ :div.flex.flex-1.min-h-0
          ;; Mobile overlay
          (when sidebar-open
            ($ :div.lg:hidden.fixed.inset-0.bg-black.bg-opacity-50.z-40
               {:on-click #(set-sidebar-open false)}))

          ;; Sidebar
          ($ :aside.ty-content.border-r.ty-border.z-30.flex-shrink-0.lg:relative.lg:translate-x-0.fixed.bottom-0.left-0.transition-transform.duration-300.overflow-y-auto
             {:class (str "w-80 lg:w-64 "
                          (if sidebar-open "translate-x-0" "-translate-x-full lg:translate-x-0"))}
             ($ :nav.py-6
                ;; Navigation sections
                ($ :div.mb-6
                   ($ :div.px-4.py-2.text-xs.font-semibold.uppercase.tracking-wider.ty-text-.mb-3
                      "Overview")
                   ($ :div.space-y-1.flex.flex-col
                      ($ nav-link {:route-id ::home
                                   :icon "home"
                                   :label "Getting Started"})
                      ($ nav-link {:route-id ::buttons
                                   :icon "square"
                                   :label "Buttons & Icons"})
                      ($ nav-link {:route-id ::forms
                                   :icon "edit"
                                   :label "Forms & Inputs"})))

                ($ :div.mb-6
                   ($ :div.px-4.py-2.text-xs.font-semibold.uppercase.tracking-wider.ty-text-.mb-3
                      "Components")
                   ($ :div.space-y-1
                      ($ nav-link {:route-id ::layout
                                   :icon "grid"
                                   :label "Layout & Containers"})
                      ($ nav-link {:route-id ::modals
                                   :icon "layers"
                                   :label "Modals & Overlays"})))))

          ;; Main content area - each view manages its own visibility
          ($ :main.flex-1.overflow-auto.p-6.min-w-0
             ($ :div.max-w-4xl.mx-auto
                ($ home-view)
                ($ buttons-view)
                ($ forms-view)
                ($ layout-view)
                ($ modals-view))))

       ;; Close sidebar on navigation (mobile)
       (uix/use-effect
         (fn []
           (when sidebar-open
             (set-sidebar-open false)))
         [sidebar-open (:current router-state)]))))

(defonce root-ref (atom nil))

(defn render-app []
  "Render the app using the stored root"
  (when-let [root @root-ref]
    (.render root ($ app))))

(defn ^:after-load init []
  "Initialize the application"

  ;; Register icons AFTER tyrell-components has set up window.tyIcons.
  (hello.icons/register!)

  ;; Initialize ty router with base path and landing URL
  (router/init! "")

  ;; Create root only once (React 18 API)
  (when-not @root-ref
    (reset! root-ref (uix.dom/create-root (.getElementById js/document "app"))))

  ;; Watch for router changes to trigger re-renders  
  ;; This ensures the app re-renders when the route changes via browser back/forward
  (add-watch router/*router* ::uix-render
             (fn [_ _ _ _]
               (render-app)))

  (add-watch tyrell.layout/window-size ::window-resize
             (fn [_ _ _ _]
               (render-app)))

  ;; Initial render
  (render-app))
