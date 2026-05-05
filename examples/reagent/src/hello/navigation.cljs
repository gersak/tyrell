(ns hello.navigation
  (:require [hello.state :as state]
            [tyrell.router :as router]))

(defn nav-item [{:keys [route-id label icon]}]
  (let [_router @router/*router*  ; Deref to trigger Reagent reactivity
        active? (router/rendered? route-id)]
    [:button.menu-item.flex.items-center.gap-3.w-full.px-3.py-2.rounded-lg.transition-colors.hover:ty-content.ty-text
     {:class (when active? "ty-bg-primary- ty-text-primary++")
      :on-click #(do
                   (router/navigate! route-id)
                   (state/toggle-mobile-menu!))}
     [:ty-icon {:name icon :size "sm"}]
     [:span.truncate label]]))

(defn nav-items []
  [:div.space-y-1
   (for [{:keys [id name icon]} state/route-defs]
     ^{:key id}
     [nav-item {:route-id id :label name :icon icon}])])

(defn sidebar []
  [:aside.w-64.ty-elevated.border-r.ty-border.h-full
   [:div.p-6
    [:h1.text-2xl.font-bold.ty-text++.mb-1 "Reagent + Ty"]
    [:p.text-sm.ty-text- "Demo Application"]]
   [:nav.px-4.pb-6
    [nav-items]]])

(defn mobile-menu []
  (when (:mobile-menu-open @state/app-state)
    [:div.fixed.inset-0.z-50.lg:hidden
     [:div.fixed.inset-0.bg-black.bg-opacity-50
      {:on-click state/toggle-mobile-menu!}]
     [:div.fixed.inset-y-0.left-0.w-72.max-w-xs.ty-elevated.shadow-xl.overflow-y-auto
      [:div.p-4
       [:div.flex.items-center.justify-between.mb-4
        [:h1.text-lg.font-bold.ty-text++ "Reagent + Ty"]
        [:button.p-2.rounded-md.hover:ty-content
         {:on-click state/toggle-mobile-menu!}
         [:ty-icon {:name "x" :size "sm"}]]]
       [:p.text-sm.ty-text-.mb-6 "Demo Application"]]
      [:nav.px-4.pb-6
       [nav-items]]]]))

(defn header []
  (let [router-state @router/*router*  ; Deref for reactivity
        current-id (:current router-state)
        route-name (some #(when (= (:id %) current-id) (:name %)) state/route-defs)]
    [:header.ty-elevated.border-b.ty-border.px-6.py-4
     [:div.flex.justify-between.items-center
      [:div.flex.items-center.gap-4.min-w-0.flex-1
       [:button.lg:hidden.p-1.5.rounded-md.hover:ty-content.flex-shrink-0
        {:on-click state/toggle-mobile-menu!}
        [:ty-icon {:name "menu" :size "sm"}]]
       [:h2.text-xl.font-semibold.ty-text++.truncate
        (or route-name "Demo")]]
      [:div.flex.items-center.gap-4.flex-shrink-0
       [:button.flex.items-center.justify-center.w-8.h-8.rounded-md.ty-content.hover:ty-elevated.transition-colors.ty-text
        {:on-click state/toggle-theme!}
        [:ty-icon {:name (if (= (:theme @state/app-state) "light") "moon" "sun")
                   :size "sm"}]]]]]))
