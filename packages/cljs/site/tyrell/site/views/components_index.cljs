(ns tyrell.site.views.components-index
  "Components index — a reference of Ty's interaction primitives.
   Ty is not a visual UI kit; it provides consistent inputs and interaction
   that drop into any host design system. Presentation here is intentionally
   light — components sit in flow, not framed in cards."
  (:require
   [clojure.string :as str]
   [tyrell.router :as router]
   [tyrell.site.docs :as docs]))

;; Grouped by interaction job, not by visual category.
(def category-groups
  [{:title "Action"
    :ids [:tyrell.site.docs/button
          :tyrell.site.docs/tag]}
   {:title "Text input"
    :ids [:tyrell.site.docs/input-field
          :tyrell.site.docs/textarea
          :tyrell.site.docs/file-upload
          :tyrell.site.docs/copy-field]}
   {:title "Toggles"
    :ids [:tyrell.site.docs/checkbox
          :tyrell.site.docs/switch
          :tyrell.site.docs/radio]}
   {:title "Selection"
    :ids [:tyrell.site.docs/dropdown
          :tyrell.site.docs/multiselect]}
   {:title "Date & time"
    :ids [:tyrell.site.docs/date-picker
          :tyrell.site.docs/calendar
          :tyrell.site.docs/calendar-month]}
   {:title "Overlays"
    :ids [:tyrell.site.docs/modal
          :tyrell.site.docs/popup
          :tyrell.site.docs/tooltip]}
   {:title "Layout primitives"
    :ids [:tyrell.site.docs/tabs
          :tyrell.site.docs/wizard
          :tyrell.site.docs/scroll-container
          :tyrell.site.docs/resize-observer]}
   {:title "Visual"
    :ids [:tyrell.site.docs/icon]}])

(defn flat-components []
  (mapcat (fn [c]
            (if (= (:id c) :tyrell.site.docs/inputs)
              (:children c)
              [c]))
          docs/docs-components))

(defn by-id-map []
  (reduce (fn [acc c] (assoc acc (:id c) c)) {} (flat-components)))

(defn component-row
  "A row inside a section panel: name + description on the left, live primitive
   on the right. Components flow inside the panel without their own chrome."
  [{:keys [id name description preview icon]}]
  [:button.group.w-full.text-left.flex.flex-col.md:flex-row.items-start.md:items-center.gap-4.md:gap-8.py-6.px-5.md:px-7.cursor-pointer.transition-colors.duration-150.hover:ty-bg-primary-
   {:on {:click #(router/navigate! id)}}
   ;; Left: name + description + cta
   [:div.flex-shrink-0.w-full.md:w-64
    [:h3.text-base.md:text-lg.font-medium.ty-text.transition-colors
     {:class "group-hover:ty-text-primary"}
     name]
    (when description
      [:p.mt-1.text-sm.ty-text-.leading-relaxed.transition-colors
       {:class "group-hover:ty-text"}
       description])
    [:div.mt-2.flex.items-center.gap-1.text-xs.ty-text--.transition-colors
     {:class "group-hover:ty-text-primary"}
     [:span "Docs"]
     [:ty-icon {:name "arrow-right"
                :size "xs"}]]]
   ;; Right: the actual primitive — left on mobile (in flow under the text),
   ;; pushed to the panel's right edge on desktop (space-between feel)
   [:div.flex-1.w-full.flex.items-center.justify-start.md:justify-end.overflow-hidden.pb-2
    {:style {:pointer-events "none"
             :min-height "100px"}}
    (or preview
        [:ty-icon {:name (or icon "square")
                   :size "xl"
                   :class "ty-text-"}])]])

(defn category-slug [title]
  (-> title str/lower-case (str/replace #"\s+" "-")))

(defn category-section
  "A group of related primitives on its own elevated panel — gives clear
   separation between interaction categories."
  [{:keys [title ids]} comp-map]
  [:section.ty-elevated.rounded-2xl.overflow-hidden
   {:id (category-slug title)}
   ;; Section header — sits on the panel
   [:div.px-5.md:px-7.pt-5.pb-3
    [:h2.text-xs.font-semibold.uppercase.tracking-widest.ty-text-- title]]
   ;; Rows divided by thin lines inside the panel
   [:div.ty-divide-y
    (for [id ids
          :let [item (get comp-map id)]
          :when item]
      ^{:key id}
      (component-row item))]])

(defn view []
  (let [comp-map (by-id-map)]
    [:div.max-w-5xl.mx-auto.px-4.md:px-6.py-8.md:py-10
     ;; Page header — frames Ty as primitives, not a UI kit
     [:div.mb-10.md:mb-12
      [:h1.text-3xl.md:text-4xl.font-bold.ty-text++ "Components"]
      [:p.mt-3.text-base.ty-text-.max-w-2xl.leading-relaxed
       "22 interaction primitives — buttons, inputs, toggles, dates, selection, overlays. "
       "Ty handles the interaction so you don't have to. Drop them into any framework, "
       "style them with any design system. Bring your own cards, layouts, and tables."]]
     ;; Sections by interaction job — each on its own elevated panel,
     ;; generous space-y between them for clear group separation
     [:div.flex.flex-col.gap-10.md:gap-12
      (for [group category-groups]
        ^{:key (:title group)}
        (category-section group comp-map))]]))
