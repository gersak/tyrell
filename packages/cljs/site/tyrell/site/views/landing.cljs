(ns tyrell.site.views.landing
  (:require
   [tyrell.router :as router]
   [tyrell.site.views.contact-form :as contact-form]
   [tyrell.site.views.event-booking :as event-booking]
   [tyrell.site.views.user-profile :as user-profile]))

(defn view []
  [:div.max-w-7xl.mx-auto {:id "top"}
   [:div.text-center.mb-16.pt-12.pb-8

    [:h1.text-4xl.lg:text-6xl.font-bold.ty-text.mb-6.max-w-4xl.mx-auto.leading-tight.tracking-tight
     "Interaction primitives."]

    [:p.text-lg.lg:text-xl.ty-text-.max-w-2xl.mx-auto.mb-6.leading-relaxed
     "Calendars, dropdowns, modals, multiselect — Web Components that fit any design system, framework, or vanilla HTML."]

    [:div.flex.flex-wrap.justify-center.gap-6.mb-8
     [:div.text-center
      [:p.text-2xl.font-bold.ty-text "0"]
      [:p.text-xs.ty-text-- "dependencies"]]
     [:div.text-center
      [:p.text-2xl.font-bold.ty-text "70kB"]
      [:p.text-xs.ty-text-- "compressed"]]
     [:div.text-center
      [:p.text-2xl.font-bold.ty-text "22"]
      [:p.text-xs.ty-text-- "primitives"]]]

    [:div.max-w-3xl.mx-auto.mb-8
     [:p.text-sm.ty-text-.mb-3 "22 primitives, fixed scope:"]
     [:div.flex.flex-wrap.gap-2.justify-center
      [:ty-tag {:flavor "primary" :size "sm"} "Button"]
      [:ty-tag {:flavor "primary" :size "sm"} "Input"]
      [:ty-tag {:flavor "primary" :size "sm"} "Textarea"]
      [:ty-tag {:flavor "primary" :size "sm"} "Checkbox"]
      [:ty-tag {:flavor "primary" :size "sm"} "Switch"]
      [:ty-tag {:flavor "primary" :size "sm"} "Radio Group"]
      [:ty-tag {:flavor "primary" :size "sm"} "Dropdown"]
      [:ty-tag {:flavor "primary" :size "sm"} "Multiselect"]
      [:ty-tag {:flavor "primary" :size "sm"} "Tag"]
      [:ty-tag {:flavor "primary" :size "sm"} "Date Picker"]
      [:ty-tag {:flavor "primary" :size "sm"} "Calendar"]
      [:ty-tag {:flavor "primary" :size "sm"} "Calendar Month"]
      [:ty-tag {:flavor "primary" :size "sm"} "Tabs"]
      [:ty-tag {:flavor "primary" :size "sm"} "Wizard"]
      [:ty-tag {:flavor "primary" :size "sm"} "Modal"]
      [:ty-tag {:flavor "primary" :size "sm"} "Popup"]
      [:ty-tag {:flavor "primary" :size "sm"} "Tooltip"]
      [:ty-tag {:flavor "primary" :size "sm"} "Icon"]
      [:ty-tag {:flavor "primary" :size "sm"} "Copy"]
      [:ty-tag {:flavor "primary" :size "sm"} "Resize Observer"]
      [:ty-tag {:flavor "primary" :size "sm"} "Scroll Container"]]]

    [:div.ty-elevated.p-4.sm:p-8.rounded-xl.max-w-4xl.mx-auto.mb-12
     [:h3.text-lg.font-semibold.ty-text.mb-4
      "Primitives, not a UI kit."]
     [:div.grid.md:grid-cols-2.gap-6
      [:div.space-y-3
       [:div.flex.items-center.gap-3
        [:div.ty-bg-success.ty-border-success.border.p-1.rounded-full.flex-shrink-0
         [:ty-icon.ty-text++ {:name "check"
                              :size "xs"}]]
        [:div
         [:p.text-left.ty-text.text-sm.font-medium "Drops into your design system"]
         [:p.ty-text-.text-xs "Color, typography, spacing stay yours — Tyrell handles interaction"]]]
       [:div.flex.items-center.gap-3
        [:div.ty-bg-success.ty-border-success.border.p-1.rounded-full.flex-shrink-0
         [:ty-icon.ty-text++ {:name "check"
                              :size "xs"}]]
        [:div
         [:p.text-left.ty-text.text-sm.font-medium "Framework-agnostic"]
         [:p.ty-text-.text-xs "React, Vue, Svelte, HTMX, Replicant, vanilla — same primitives, native events"]]]
       [:div.flex.items-center.gap-3
        [:div.ty-bg-success.ty-border-success.border.p-1.rounded-full.flex-shrink-0
         [:ty-icon.ty-text++ {:name "check"
                              :size "xs"}]]
        [:div
         [:p.text-left.ty-text.text-sm.font-medium "Typed React wrappers"]
         [:p.ty-text-.text-xs "tyrell-react bridges synthetic events for Reagent, UIx, Helix"]]]]
      [:div.space-y-3
       [:div.flex.items-center.gap-3
        [:div.ty-bg-success.ty-border-success.border.p-1.rounded-full.flex-shrink-0
         [:ty-icon.ty-text++ {:name "check"
                              :size "xs"}]]
        [:div
         [:p.text-left.ty-text.text-sm.font-medium "One dep, every stack"]
         [:p.ty-text-.text-xs "npm tyrell-components or Clojars dev.gersak/tyrell — both pull what you need"]]]
       [:div.flex.items-center.gap-3
        [:div.ty-bg-success.ty-border-success.border.p-1.rounded-full.flex-shrink-0
         [:ty-icon.ty-text++ {:name "check"
                              :size "xs"}]]
        [:div
         [:p.text-left.ty-text.text-sm.font-medium "3000+ icons, tree-shakeable"]
         [:p.ty-text-.text-xs "Lucide, Heroicons, Material Design, FontAwesome — pick what you ship"]]]
       [:div.flex.items-center.gap-3
        [:div.ty-bg-success.ty-border-success.border.p-1.rounded-full.flex-shrink-0
         [:ty-icon.ty-text++ {:name "check"
                              :size "xs"}]]
        [:div
         [:p.text-left.ty-text.text-sm.font-medium "Mobile-ready, accessible"]
         [:p.ty-text-.text-xs "Touch-optimized interactions, ARIA built into every primitive"]]]]]]

    [:div.text-center.mb-12.max-w-3xl.mx-auto
     [:h3.text-2xl.font-bold.ty-text.mb-4
      "Frameworks change. Primitives don't."]
     [:p.ty-text-.mb-2
      "React 19, Vue 4, the next big thing — your Tyrell primitives keep working."]
     [:p.ty-text--
      "Framework-optional, not anti-framework. Typed React wrappers included."]]

    [:div.flex.flex-col.gap-4.items-center
     [:div.flex.flex-col.sm:flex-row.gap-3
      [:button.ty-bg-primary.ty-text++.px-6.py-3.rounded-lg.font-semibold.border.ty-border-primary.cursor-pointer
       {:on {:click #(.scrollIntoView
                      (.getElementById js/document "user-profile")
                      #js {:behavior "smooth"})}}
       "See Examples ↓"]
      [:button.ty-bg-success.ty-text++.px-6.py-3.rounded-lg.font-semibold.border.ty-border-success.cursor-pointer.flex.items-center
       {:on {:click #(do
                       (router/navigate! :tyrell.site.docs/getting-started)
                       (when-let [main-element (.querySelector js/document "main.overflow-auto")]
                         (.scrollTo main-element #js {:top 0
                                                      :behavior "smooth"})))}}
       [:ty-icon.mr-2 {:name "rocket"
                       :size "sm"}]
       "Getting Started"]
      [:a.ty-bg-neutral.ty-text++.px-6.py-3.rounded-lg.font-semibold.flex.items-center.gap-1.hover:ty-bg-neutral+.cursor-pointer.border.ty-border++
       {:href "https://github.com/gersak/tyrell"}
       [:ty-icon.mr-2 {:name "github"
                       :size "sm"}]
       "Star on GitHub"]]
     [:p.text-xs.ty-text-
      "CDN available • MIT licensed"]]]

   [:div.mb-20
    [:div.text-center.mb-12
     [:h2.text-2xl.lg:text-3xl.font-bold.ty-text.mb-3
      "Live Examples"]
     [:p.ty-text-.max-w-2xl.mx-auto
      "Real primitives solving real problems. Everything you see here is built with Tyrell. "
      "View source to see how simple it is."]]

    [:section.mb-16 {:id "user-profile"}
     [:div.ty-elevated.rounded-xl.overflow-hidden
      [:div.px-6.py-4.border-b.ty-border
       [:div.flex.items-center.justify-between
        [:h3.text-lg.font-semibold.ty-text "User Profile Form"]
        [:div.flex.items-center.gap-2
         [:ty-tag {:flavor "primary"
                   :size "xs"} "Live"]
         [:a.text-sm.ty-text-primary.underline.hover:no-underline.flex.items-center.gap-1
          {:href "https://github.com/gersak/tyrell/blob/master/packages/cljs/site/tyrell/site/views/user_profile.cljs"
           :target "_blank"
           :rel "noopener noreferrer"}
          [:ty-icon {:name "external-link"
                     :size "xs"}]
          "View Source"]]]]
      [:div.p-2.sm:p-8
       (user-profile/view)]]]

    [:section.mb-16 {:id "event-booking"}
     [:div.ty-elevated.rounded-xl.overflow-hidden
      [:div.px-6.py-4.border-b.ty-border
       [:div.flex.items-center.justify-between
        [:h3.text-lg.font-semibold.ty-text "Event Booking System"]
        [:div.flex.items-center.gap-2
         [:ty-tag {:flavor "primary"
                   :size "xs"} "Live"]
         [:a.text-sm.ty-text-primary.underline.hover:no-underline.flex.items-center.gap-1
          {:href "https://github.com/gersak/tyrell/blob/master/packages/cljs/site/tyrell/site/views/event_booking.cljs"
           :target "_blank"
           :rel "noopener noreferrer"}
          [:ty-icon {:name "external-link"
                     :size "xs"}]
          "View Source"]]]]
      [:div.p-2.sm:p-8
       (event-booking/view)]]]

    [:section.mb-16 {:id "contact-form"}
     [:div.ty-elevated.rounded-xl.overflow-hidden
      [:div.px-6.py-4.border-b.ty-border
       [:div.flex.items-center.justify-between
        [:h3.text-lg.font-semibold.ty-text "Contact Form"]
        [:div.flex.items-center.gap-2
         [:ty-tag {:flavor "primary"
                   :size "xs"} "Live"]
         [:a.text-sm.ty-text-primary.underline.hover:no-underline.flex.items-center.gap-1
          {:href "https://github.com/gersak/tyrell/blob/master/packages/cljs/site/tyrell/site/views/contact_form.cljs"
           :target "_blank"
           :rel "noopener noreferrer"}
          [:ty-icon {:name "external-link"
                     :size "xs"}]
          "View Source"]]]]
      [:div.p-2.sm:p-8
       (contact-form/view)]]]]

   [:section.mb-20
    [:div.rounded-2xl.p-4.sm:p-8.lg:p-12
     [:div.text-center.mb-8
      [:h2.text-2xl.font-bold.ty-text.mb-3
       "Join the Community"]
      [:p.ty-text-.max-w-2xl.mx-auto
       "Tyrell grows with community input. Every issue, PR, and discussion helps."]]

     [:div.grid.md:grid-cols-3.gap-6.max-w-4xl.mx-auto
      [:a.ty-elevated.p-6.rounded-xl.hover:shadow-lg.transition-all.block
       {:href "https://github.com/gersak/tyrell/issues"}
       [:div.flex.items-center.gap-3.mb-3
        [:ty-icon.ty-text-primary {:name "bug"
                                   :size "md"}]
        [:h3.font-semibold.ty-text "Report Issues"]]
       [:p.text-sm.ty-text- "Found a bug? Let us know. Every report helps improve the components."]]

      [:a.ty-elevated.p-6.rounded-xl.hover:shadow-lg.transition-all.block
       {:href "https://github.com/gersak/tyrell/discussions"}
       [:div.flex.items-center.gap-3.mb-3
        [:ty-icon.ty-text-primary {:name "message-square"
                                   :size "md"}]
        [:h3.font-semibold.ty-text "Discussions"]]
       [:p.text-sm.ty-text- "Share ideas, ask questions, show what you've built."]]

      [:a.ty-elevated.p-6.rounded-xl.hover:shadow-lg.transition-all.block
       {:href "https://github.com/gersak/tyrell"}
       [:div.flex.items-center.gap-3.mb-3
        [:ty-icon.ty-text-primary {:name "git-branch"
                                   :size "md"}]
        [:h3.font-semibold.ty-text "Contribute"]]
       [:p.text-sm.ty-text- "PRs welcome. Documentation, components, examples - all contributions matter."]]]]]

   [:div.text-center.py-12
    [:p.text-sm.ty-text-
     "Built for developers who believe in web standards."]
    [:p.text-xs.ty-text-.mt-2
     "MIT licensed. Production ready."]]])
