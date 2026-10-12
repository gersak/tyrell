(ns tyrell.site.docs.scroll-container
  "Documentation for ty-scroll-container component"
  (:require [clojure.string :as str]
            [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(defn- doc-state [k] (get-in @state/state [:scroll-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:scroll-doc k] v))

(def ^:private people
  ["Ada Lovelace" "Alan Turing" "Grace Hopper" "Edsger Dijkstra" "Barbara Liskov" "Donald Knuth"
   "Margaret Hamilton" "Ken Thompson" "Frances Allen" "John McCarthy" "Radia Perlman" "Rich Hickey"])

(defn- row [i text & [sub]]
  [:div.flex.items-center.gap-3.px-4.border-b.ty-border-.text-sm {:class ["py-2.5"] :replicant/key (str i text)}
   [:span.flex.items-center.justify-center.rounded-full.text-xs.font-semibold.ty-bg-primary-.ty-text-primary
    {:style {:width "28px" :height "28px"}} (subs text 0 1)]
   [:span.flex.flex-col
    [:span.ty-text+ text]
    (when sub [:span.text-xs.ty-text- sub])]])

(defn- snippets [{:keys [shadow custom height]}]
  (let [attrs (str " max-height=\"" height "\""
                   (when-not shadow " no-shadow")
                   (when custom " custom-scrollbar"))]
    [["html" "HTML" "html" (str "<ty-scroll-container" attrs ">\n  …long content…\n</ty-scroll-container>")]
     ["react" "React" "javascript"
      (str "import { TyScrollContainer } from 'tyrell-react'\n\n<TyScrollContainer maxHeight=\"" height "\""
           (when-not shadow " noShadow") (when custom " customScrollbar") ">\n  {rows}\n</TyScrollContainer>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n[:> ty/ScrollContainer {:max-height \"" height "\""
           (when-not shadow " :no-shadow true") (when custom " :custom-scrollbar true") "}\n rows]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-scroll-container {:max-height \"" height "\""
           (when-not shadow " :no-shadow \"\"") (when custom " :custom-scrollbar \"\"") "}\n rows]")]
     ;; nearend fires once on entering the bottom zone; the server appends rows
     ;; to #people and bumps $cursor
     ["datastar" "Datastar" "html"
      (str "<ty-scroll-container" attrs "\n  data-signals:cursor=\"0\""
           "\n  data-on:nearend=\"@get('/people?after=' + $cursor)\">\n"
           "  <div id=\"people\">…long content…</div>\n</ty-scroll-container>")]]))

(defn- render-playground [{:keys [shadow custom height]}]
  [:div.rounded-xl.border.ty-border-.overflow-hidden {:style {:width "100%" :max-width "360px"}}
   [:ty-scroll-container (cond-> {:max-height height}
                           (not shadow) (assoc :no-shadow "")
                           custom (assoc :custom-scrollbar ""))
    (map-indexed (fn [i p] (row i p "Computer scientist")) people)]])

(defn- load-more! []
  (when-not (doc-state :loading)
    (set-doc! :loading true)
    (js/setTimeout #(do (set-doc! :count (+ 10 (or (doc-state :count) 10)))
                        (set-doc! :loading false))
                   500)))

(defn view []
  (component-page
   {:title "Scroll Container"
    :group "Layout primitives"
    :tag "ty-scroll-container"
    :description "A scrolling region that shows where there's more: edge shadows, an optional custom scrollbar, near-edge events for infinite lists, and anchoring for content added above."
    :chips [["Infinite scroll" "move-vertical"] ["Scroll anchoring" "layers"] ["TyScrollContainer (React)" "atom"]]
    :source "packages/core/src/components/scroll-container.ts"
    :mark "↕"
    :demo [:div.rounded-xl.border.ty-border-.overflow-hidden.ty-floating {:style {:width "300px"}}
           [:ty-scroll-container {:max-height "220px"}
            (map-indexed (fn [i p] (row i p)) people)]]}

   (playground
    {:id :scroll
     :defaults {:shadow true :custom false :height "240px"}
     :controls [{:key :height :options ["160px" "240px" "320px"]}
                {:key :shadow :switch? true}
                {:key :custom :switch? true}]
     :sub "Scroll the list. The fade shows there's more above or below. custom = custom-scrollbar."
     :render render-playground
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Infinite list"
       :span 3
       :description [:span [:code "nearend"] " fires once when you get within " [:code "near-edge-threshold"]
                     " px of the bottom, and re-arms after the list grows."]
       :code "list.addEventListener('nearend', async () => {
  list.append(...await nextPage());
});"}
      (let [n (or (doc-state :count) 10)]
        [:div.rounded-xl.border.ty-border-.overflow-hidden.w-full
         [:ty-scroll-container {:max-height "220px" :on {:nearend load-more!}}
          (for [i (range n)] (row i (str "Item " (inc i)) (str "Loaded in page " (inc (quot i 10)))))
          (when (doc-state :loading)
            [:div.flex.justify-center.py-3.text-xs.ty-text- "Loading…"])]]))

     (example
      {:title "Load older, keep your place"
       :span 3
       :description [:span "With " [:code "scroll-anchoring"] ", items added above the viewport push the scroll position down by their height, so what you're reading doesn't move."]
       :code "<ty-scroll-container scroll-anchoring>
  …messages…
</ty-scroll-container>

chat.prepend(...olderMessages);"}
      (let [older (or (doc-state :older) 0)
            msgs (concat (for [i (range older 0 -1)] (str "Older message " i))
                         ["Hi! Is the calendar redesign merged?" "Yes, this morning."
                          "Month view looks great." "Thanks! Years are one click now." "Ship it."])]
        [:div.flex.flex-col.gap-2.w-full
         [:div.rounded-xl.border.ty-border-.overflow-hidden
          [:ty-scroll-container {:max-height "180px" :scroll-anchoring ""}
           (map-indexed (fn [i m] [:div.px-4.py-2.text-sm.ty-text {:replicant/key m} m]) msgs)]]
         [:ty-button {:size "sm" :appearance "outlined" :on {:click #(set-doc! :older (+ older 3))}}
          [:ty-icon {:slot "start" :name "arrow-up"}] "Load 3 older"]]))

     (example
      {:title "Horizontal"
       :span 4
       :description [:span [:code "overflow-x"] " for rows of cards; the shadows move to the left and right edges."]
       :code "<ty-scroll-container overflow-x>
  <div style=\"display:flex; gap:12px\">…</div>
</ty-scroll-container>"}
      [:div.w-full
       [:ty-scroll-container {:overflow-x ""}
        [:div.flex.gap-3.py-1
         (for [p people]
           [:div.ty-floating.rounded-xl.p-4.flex.flex-col.gap-1.shrink-0 {:replicant/key p :style {:width "150px"}}
            [:span.text-sm.font-semibold.ty-text++ p]
            [:span.text-xs.ty-text- "Pioneer"]])]]])

     (example
      {:title "Scroll from code"
       :span 2
       :description "Methods scroll the inner element, smoothly by default."
       :code "list.scrollToBottom();
list.scrollToTop(false);  // jump
list.scrollToElement('#row-7');"}
      [:div.flex.flex-col.gap-2.w-full
       [:div.rounded-xl.border.ty-border-.overflow-hidden
        [:ty-scroll-container {:id "doc-scroll-methods" :max-height "120px"}
         (map-indexed (fn [i p] (row i p)) people)]]
       [:div.flex.gap-2
        [:ty-button {:size "sm" :appearance "outlined" :on {:click #(.scrollToTop (js/document.getElementById "doc-scroll-methods"))}} "Top"]
        [:ty-button {:size "sm" :appearance "outlined" :on {:click #(.scrollToBottom (js/document.getElementById "doc-scroll-methods"))}} "Bottom"]]])

     (example
      {:title "JavaScript API"
       :lang "javascript"
       :code "const box = document.querySelector('ty-scroll-container');

box.maxHeight = '400px';
box.nearEdgeThreshold = 200;          // px
box.scrollElement.scrollTop;          // the element that actually scrolls
box.updateShadows();                  // after changing content size yourself

box.addEventListener('nearstart', (e) => loadNewer(e.detail.distance));"}
      nil)))

   (page-section
    {:title "Theming" :sub "Shadows and scrollbar." :dark? true}
    (example
     {:title "Edge shadows"
      :side? true
      :lang "css"
      :description "Each edge's gradient and the fade timing, plus the custom scrollbar width."
      :code "ty-scroll-container {
  --ty-scroll-shadow-top: linear-gradient(#2dd4bf33, transparent);
  --ty-scroll-shadow-bottom: linear-gradient(transparent, #2dd4bf33);
  --ty-scrollbar-width: 10px;
}"}
     [:div.rounded-xl.border.ty-border-.overflow-hidden {:style {:width "100%" :max-width "320px"}}
      [:ty-scroll-container {:max-height "180px" :custom-scrollbar ""
                             :style {"--ty-scroll-shadow-top" "linear-gradient(#2dd4bf33, transparent)"
                                     "--ty-scroll-shadow-bottom" "linear-gradient(transparent, #2dd4bf33)"
                                     "--ty-scrollbar-width" "10px"}}
       (map-indexed (fn [i p] (row i p)) people)]]))

   (api-section
    {:attributes ["Size"
                  ["max-height" "string" "Height at which it starts scrolling, e.g. 320px."]
                  ["overflow-x" "boolean" "false" "Scroll horizontally instead."]
                  "Look"
                  ["no-shadow" "boolean" "false" "No edge shadows (they show where there's more content)."]
                  ["custom-scrollbar" "boolean" "false" "Themed overlay scrollbar instead of the native one."]
                  ["hide-scrollbar" "boolean" "false" "No visible scrollbar; still scrolls."]
                  "Behavior"
                  ["near-edge-threshold" "number" "100" "Distance in px that triggers nearstart / nearend."]
                  ["scroll-anchoring" "boolean" "false" "Keep the visible content in place when items are added above it."]]
     :properties [["scrollToTop / Bottom / Left / Right(smooth?)" "(boolean) => void" "Scroll to an edge. Smooth unless false."]
                  ["scrollToElement(target, smooth?)" "(Element | string) => void" "Scroll a child (or selector) into view."]
                  ["scrollElement" "HTMLElement" "The inner element that scrolls."]
                  ["updateShadows()" "() => void" "Recompute shadows after an external size change."]]
     :events [["nearend" "{distance, scrollTop, scrollHeight, clientHeight}" "Entered the bottom zone. Once per entry."]
              ["nearstart" "{distance, scrollTop, scrollHeight, clientHeight}" "Entered the top zone. Once per entry."]]
     :css-vars [["--ty-scroll-shadow-top / -bottom / -left / -right" "Edge shadow backgrounds."]
                ["--ty-scroll-shadow-transition" "Shadow fade."]
                ["--ty-scrollbar-width" "Custom scrollbar width."]]})))
