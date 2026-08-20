(ns tyrell.site.core
  (:require
   [clojure.string :as str]
   tyrell.site.icons
   [replicant.dom :as rdom]
   [tyrell.layout :as layout]
   [tyrell.router :as router]
   [tyrell.site.docs :as docs]
   [tyrell.site.docs.theming :as theming-docs]
   [tyrell.site.state :refer [state]]
   [tyrell.site.styles :as styles]
   [tyrell.site.views.components-index :as components-index]
   [tyrell.site.views.landing :as landing]
   [tyrell.site.views.sandbox-sizing :as sandbox-sizing]
   [tyrell.site.views.sandbox-tabs :as sandbox-tabs]
   [tyrell.site.views.sandbox-polish :as sandbox-polish]
   [tyrell.site.views.sandbox-toggles :as sandbox-toggles]))

;; Configuration for GitHub Pages deployment
;; These are replaced at build time via closure-defines
(goog-define ROUTER_BASE "")
(goog-define PRODUCTION false)

(def site-routes
  [;; Main landing page
   {:id ::landing
    :segment "welcome"
    :hash "top"
    :name "Welcome"
    :icon "home"
    :landing 20
    :view landing/view}

   ;; Landing page fragments for examples
   {:id ::landing-user-profile
    :segment "welcome"
    :hash "user-profile"
    :name "User Profile"
    :icon "user"
    :view landing/view}
   {:id ::landing-event-booking
    :segment "welcome"
    :hash "event-booking"
    :name "Event Booking"
    :icon "calendar"
    :view landing/view}
   {:id ::landing-contact-form
    :segment "welcome"
    :hash "contact-form"
    :name "Contact Form"
    :icon "mail"
    :view landing/view}

   ;; Components browse page (contact sheet of all components)
   {:id ::components
    :segment "components"
    :name "Components"
    :icon "grid"
    :view components-index/view}

   ;; HIDDEN — deliberately absent from nav-items below and from every route
   ;; list used to render nav/search. Reachable only by typing the URL.
   ;; Throwaway integration-testing page; delete once its question is settled.
   {:id ::sandbox-sizing
    :segment "internal/sizing"
    :name "Sizing Sandbox (hidden)"
    :view sandbox-sizing/view}

   {:id ::sandbox-tabs
    :segment "internal/tabs"
    :name "Tabs Resize/Overflow Verify (hidden)"
    :view sandbox-tabs/view}

   {:id ::sandbox-toggles
    :segment "internal/toggles"
    :name "Switch/Checkbox Double-fire Verify (hidden)"
    :view sandbox-toggles/view}

   {:id ::sandbox-polish
    :segment "internal/polish"
    :name "Open Polish Issues (hidden)"
    :view sandbox-polish/view}])

(def component-routes docs/docs-components)

(def guide-routes docs/guide-components)

(router/link ::router/root
             (concat
              site-routes
              (map (fn [route]
                     (-> route
                         (update :segment (fn [segment] (str "components/" segment)))))
                   component-routes)
              (map (fn [route]
                     (-> route
                         (select-keys [:id :segment :name])
                         (update :segment (fn [segment] (str "guides/" segment))))) guide-routes)))

(defn toggle-theme! []
  (let [root (.-documentElement js/document)]
    ;; Silences every component's own hover/focus transition for the
    ;; duration of the swap so only the coordinated dial crossfade (in
    ;; tyrell-theme.css) is visible — see .ty-theme-switching there.
    (.add (.-classList root) "ty-theme-switching")
    (swap! state update :theme #(if (= % "light") "dark" "light"))
    (let [theme (:theme @state)]
      (if (= theme "dark")
        (.add (.-classList root) "dark")
        (.remove (.-classList root) "dark"))
      (.setItem js/localStorage "theme" theme))
    (let [raw (js/parseFloat (.getPropertyValue (js/getComputedStyle root) "--ty-theme-transition"))
          ms (if (js/isNaN raw) 450 (* 1000 raw))]
      (js/setTimeout #(.remove (.-classList root) "ty-theme-switching") ms))))

(defn get-open-section-from-storage
  "Read the open navigation section from localStorage"
  []
  (when-let [stored (.getItem js/localStorage "ty-nav-open-section")]
    (keyword stored)))

(defn set-open-section-in-storage!
  "Write the open navigation section to localStorage"
  [section]
  (if section
    (.setItem js/localStorage "ty-nav-open-section" (name section))
    (.removeItem js/localStorage "ty-nav-open-section")))

(defn get-last-visited-route
  "Get the last visited route for a section from localStorage"
  [section-key]
  (when-let [stored (.getItem js/localStorage (str "ty-nav-last-" (name section-key)))]
    (keyword stored)))

(defn set-last-visited-route!
  "Save the last visited route for a section to localStorage"
  [section-key route-id]
  (when (and section-key route-id)
    (.setItem js/localStorage (str "ty-nav-last-" (name section-key)) (name route-id))))

(defn scroll-main-to-top!
  "Smoothly scrolls the main content area to the top"
  []
  (when-let [scroll-container (.getElementById js/document "main-scroll-container")]
    (.scrollTo scroll-container #js {:top 0
                                     :behavior "smooth"})))

(defn scroll-to-anchor! [anchor]
  (when-let [el (.getElementById js/document anchor)]
    (.scrollIntoView el #js {:behavior "smooth" :block "start"})))

(defn toc-item [{:keys [anchor label route-id category?]}]
  (if category?
    [:button.block.w-full.text-left.pl-4.pr-2.pt-3.pb-0.5.text-xs.font-semibold.uppercase.tracking-wide.ty-text-primary+.transition-colors.cursor-pointer.hover:ty-text-primary++
     {:on {:click #(scroll-to-anchor! anchor)}}
     label]
    (let [active? (when route-id (router/rendered? route-id true))]
      [:button.block.w-full.text-left.text-xs.py-1.pl-8.pr-2.transition-colors.cursor-pointer
       {:class (if active?
                 ["ty-text++" "font-medium"]
                 ["ty-text-" "hover:ty-text++"])
        :on {:click (fn []
                      (if route-id
                        (router/navigate! route-id)
                        (scroll-to-anchor! anchor)))}}
       label])))

(defn right-sidebar [{:keys [title items]}]
  [:div.border-l.ty-border-soft.pt-8.pb-8
   (when title
     [:p.text-xs.uppercase.tracking-widest.ty-text-.pl-4.mb-3
      title])
   [:div
    (for [item items]
      ^{:key (or (:anchor item) (:label item))}
      (toc-item item))]])

(defn toggle-nav-section!
  "Toggle a navigation section open/closed and navigate to first/last item"
  [section-key items]
  (let [current (get @state :navigation.section/open)
        is-opening? (not= current section-key)]
    (swap! state assoc :navigation.section/open (if is-opening? section-key nil))
    (set-open-section-in-storage! (if is-opening? section-key nil))

    (when (and is-opening? (seq items))
      (let [last-visited (get-last-visited-route section-key)
            target-route (if last-visited
                           (some #(when (= (:route-id %) last-visited) (:route-id %)) items)
                           (:route-id (first items)))]
        (when target-route
          (router/navigate! target-route))))))

(defn route-in-list?
  "Check if a route-id exists in a flat list of routes"
  [route-id routes]
  (some #(= (:id %) route-id) routes))

(defn route-in-tree?
  "Check if a route-id exists in a tree of routes (including children)"
  [route-id routes]
  (some (fn [route]
          (or (= (:id route) route-id)
              (when-let [children (:children route)]
                (route-in-list? route-id children))))
        routes))

(defn route->section
  "Determine which section owns a route"
  [route-id]
  (cond
    (route-in-list? route-id guide-routes) :quickstart

    (route-in-tree? route-id component-routes) :components

    ;; Otherwise nil (Welcome, Landing, Live Examples = collapse all)
    :else nil))

(defn flatten-routes
  "Recursively flatten routes including children"
  [routes]
  (mapcat (fn [route]
            (if-let [children (:children route)]
              (cons (dissoc route :children) (flatten-routes children))
              [route]))
          routes))

(defn- component-toc-items []
  (let [comp-map (components-index/by-id-map)]
    (mapcat (fn [{:keys [title ids]}]
              (cons {:anchor (-> title str/lower-case (str/replace #"\s+" "-"))
                     :label title
                     :category? true}
                    (for [id ids
                          :let [comp (get comp-map id)]
                          :when comp]
                      {:label (:name comp)
                       :route-id id})))
            components-index/category-groups)))

(defn current-toc
  "Returns {:title optional-string :items [...]} for the current route, or nil."
  []
  (cond
    (or (router/rendered? ::landing true)
        (router/rendered? ::landing-user-profile true)
        (router/rendered? ::landing-event-booking true)
        (router/rendered? ::landing-contact-form true))
    {:title "Check out examples"
     :items [{:anchor "top" :label "Overview" :route-id ::landing}
             {:anchor "user-profile" :label "User Profile" :route-id ::landing-user-profile}
             {:anchor "event-booking" :label "Event Booking" :route-id ::landing-event-booking}
             {:anchor "contact-form" :label "Contact Form" :route-id ::landing-contact-form}]}

    (or (router/rendered? ::components true)
        (route-in-tree? (some #(when (router/rendered? (:id %) true) (:id %))
                              (flatten-routes component-routes))
                        component-routes))
    {:title nil :items (component-toc-items)}

    :else nil))

(defn auto-expand-section!
  "Automatically expand section based on current route"
  []
  (let [all-routes (flatten-routes (concat site-routes component-routes guide-routes))
        current-route (some #(when (router/rendered? (:id %) true) %) all-routes)
        section (when current-route (route->section (:id current-route)))]
    (when section (swap! state assoc :navigation.section/open section))
    (set-open-section-in-storage! section)))

(defn toggle-mobile-menu!
  ([] (swap! state update :mobile-menu-open not)))

(defn close-mobile-menu!
  ([] (swap! state assoc :mobile-menu-open false)))

(defn should-scroll-for-route?
  "Determine if navigation to target route should trigger scroll to top.
   Returns false for routes with hash fragments (like landing page examples)."
  [target-route-id]
  (let [all-routes (concat site-routes component-routes guide-routes)
        route (some #(when (= (:id %) target-route-id) %) all-routes)]
    (nil? (:hash route))))

(defn nav-item
  [{:keys [route-id label icon indented? section-key featured? also-active-for]}]
  (let [active? (or (router/rendered? route-id true)
                    (some #(router/rendered? % true) also-active-for))
        display-label (str/lower-case (str label))]
    [:button.w-full.text-left.rounded-md.transition-colors.duration-150.cursor-pointer.flex.items-center.gap-3.px-3.py-2
     {:class (concat
              (cond
                (and featured? active?) ["ty-text-primary+" "font-semibold"]
                featured?               ["ty-text" "hover:ty-text-primary"]
                active?                 ["ty-text+" "font-medium"]
                :else                   ["ty-text-" "font-light" "hover:ty-text+"])
              (when indented? ["pl-7" "text-sm"]))
      :style (cond-> {:letter-spacing (if featured? "normal" "0.02em")}
               active? (assoc :background "linear-gradient(to right, var(--ty-bg-primary) 2px, transparent 40px)"
                              :box-shadow "inset 2px 0 0 var(--ty-color-primary)"))
      :on {:click (fn []
                    (when section-key
                      (set-last-visited-route! section-key route-id))
                    (router/navigate! route-id)
                    (swap! state assoc :mobile-menu-open false))}}
     [:ty-icon {:name icon
                :size "sm"
                :class (when active? "ty-text-primary")}]
     [:span {:class (cond
                      (and featured? active?) ["text-xs" "font-semibold"]
                      featured?               ["text-xs" "font-medium"]
                      :else                   ["text-xs" "font-light"])}
      display-label]]))

(defn calculate-collapsible-height
  "Calculate available height for collapsible nav sections.
   Uses window height and state values from resize observers for reactivity.
   When a section expands, it takes ALL available sidebar space."
  []
  (let [;; Window height
        window-h (:height @layout/window-size)

        ;; Get heights from state (stored by resize observer events)
        sizes (:sidebar-sizes @state)
        header-h (or (:header sizes) 60)
        fixed-nav-h (or (:fixed-content-height sizes) 180)
        quickstart-h (or (:quickstart sizes) 40)
        components-h (or (:components sizes) 40)

        open-section (get @state :navigation.section/open)

        ;; The OTHER section's height (which is collapsed, so just header)
        other-section-h (case open-section
                          :quickstart components-h
                          :components quickstart-h
                          ;; Both closed - show both headers
                          (+ quickstart-h components-h))

        available (- window-h
                     header-h
                     fixed-nav-h
                     other-section-h
                     100)]
    (max available 150)))

(defn scroll-shadow-hooks
  "Create on-mount/on-unmount hooks for scroll shadow tracking"
  [section-key]
  (let [update-shadows (fn [^js event]
                         (when-let [el (.-target event)]
                           (let [scroll-top (.-scrollTop el)
                                 scroll-height (.-scrollHeight el)
                                 client-height (.-clientHeight el)
                                 can-scroll-up (> scroll-top 0)
                                 can-scroll-down (< (+ scroll-top client-height)
                                                    (- scroll-height 1))
                                 final {:up can-scroll-up
                                        :down can-scroll-down}]
                             (when-not (= final (:scroll-shadows @state))
                               (swap! state assoc-in [:scroll-shadows section-key] final)))))]
    {:replicant/on-mount
     (fn [{^js el :replicant/node}]
       (update-shadows el)
       (.addEventListener el "scroll" update-shadows)
       (set! (.-_scrollHandler el) update-shadows))

     :replicant/on-unmount
     (fn [{^js el :replicant/node}]
       (when-let [handler (.-_scrollHandler el)]
         (.removeEventListener el "scroll" handler)
         (set! (.-_scrollHandler el) nil))
       (swap! state update :scroll-shadows dissoc section-key))}))

(defn nav-section
  "Render a navigation section with optional children and collapsible behavior"
  [{:keys [title items collapsible? section-key]}]
  (let [is-open? (= (get @state :navigation.section/open) section-key)
        icon (if is-open? "chevron-down" "chevron-right")
        observer-id (when section-key (str "tyrell.sidebar." (name section-key)))]
    [:div.mb-2
     (when title
       (if collapsible?
         [:button.w-full.px-3.py-2.cursor-pointer.rounded-md.transition-all.duration-150.hover:ty-bg-primary-
          {:on {:click #(toggle-nav-section! section-key items)}}
          [:div.flex.items-center.gap-2
           [:ty-icon {:name icon
                      :size "xs"
                      :class ["transition-transform" "duration-150"
                              (if is-open? "ty-text-primary" "ty-text-")]}]
           [:h3.text-xs.font-medium.tracking-wide
            {:class (if is-open? "ty-text" "ty-text-")}
            (str/lower-case title)]]]
         [:div.px-3.py-2
          [:h3.text-xs.font-medium.ty-text-.tracking-wide (str/lower-case title)]]))

     (if collapsible?
       ;; Collapsible children with CSS Grid for smooth height animation
       (let [available-height (calculate-collapsible-height)]
         ;; Grid wrapper - animates grid-template-rows from 0fr to 1fr
         [:div.transition-all.duration-300
          {:style {:display "grid"
                   :grid-template-rows (if is-open? "1fr" "0fr")}}
          ;; Inner wrapper with min-height:0 allows collapse, overflow:hidden clips content
          [:div.overflow-hidden.transition-opacity.duration-300
           {:class (if is-open? "opacity-100" "opacity-0")
            :style {:min-height 0}}
           [:ty-scroll-container.mt-2 {:max-height (str (- available-height 8) "px")
                                       :hide-scrollbar true}
            [:div.space-y-1.5
             (for [item items]
               (let [has-children? (seq (:children item))]
                 ^{:key (:label item)}
                 [:div
                  (nav-item (assoc item :indented? false :section-key section-key))
                  (when has-children?
                    [:div.space-y-1.5
                     (for [child (:children item)]
                       ^{:key (:label child)}
                       (nav-item (assoc child :indented? true :section-key section-key)))])]))]]]])
       [:div.space-y-1.5
        (for [item items]
          (let [has-children? (seq (:children item))]
            ^{:key (:label item)}
            [:div
             (nav-item (assoc item :indented? false))
             (when has-children?
               [:div.space-y-1.5
                (for [child (:children item)]
                  ^{:key (:label child)}
                  (nav-item (assoc child :indented? true)))])]))])]))

(defn resize-observer-hooks
  "Create on-mount/on-unmount hooks for a resize observer that updates state"
  [observer-id state-path]
  {:replicant/on-mount
   (fn [{^js el :replicant/node}]
     (when (and js/window.tyResizeObserver el)
       (let [unsubscribe (js/window.tyResizeObserver.onResize
                          observer-id
                          (fn [^js size]
                            (swap! state assoc-in state-path (.-height size))))]
         (set! (.-_resizeUnsub el) unsubscribe))))

   :replicant/on-unmount
   (fn [{^js el :replicant/node}]
     (when-let [unsubscribe (.-_resizeUnsub el)]
       (unsubscribe)
       (set! (.-_resizeUnsub el) nil)))})

(def ^:private theming-route-id :tyrell.site.docs/theming)

(defn nav-items []
  [:div.space-y-6
   ;; Fixed content (always visible) - track height
   [:ty-resize-observer
    (merge {:id "tyrell.sidebar.nav-items"
            :debounce 150}
           (resize-observer-hooks "tyrell.sidebar.nav-items" [:sidebar-sizes :fixed-content-height]))
    [:div.space-y-6
     ;; Main Navigation — Welcome (quiet) + the two featured destinations.
     (nav-section
      {:items [{:route-id ::landing
                :label "Welcome"
                :icon "home"
                :also-active-for [::landing-user-profile
                                  ::landing-event-booking
                                  ::landing-contact-form]}
               {:route-id ::components
                :label "Components"
                :icon "grid"
                :featured? true
                ;; Keep "Components" highlighted whenever the user is on any
                ;; specific component's documentation page, not just the index.
                :also-active-for (mapv :id (flatten-routes component-routes))}
               {:route-id theming-route-id
                :label "Theming"
                :icon "droplet"
                :featured? true}]})]]

   ;; Quickstart (route navigation) - Always visible.
   ;; Theming lives in the featured top section, so we filter it out of
   ;; the Quickstart list.
   (nav-section
    {:title "Quickstart"
     :items (for [route guide-routes
                  :when (not= theming-route-id (:id route))]
              {:route-id (:id route)
               :label (:name route)
               :icon (:icon route)})})])

(defn render
  "Render the appropriate view based on current route (like docs/render)"
  []
  (let [all-routes (flatten-routes (concat site-routes component-routes guide-routes))
        current-route (some #(when (router/rendered? (:id %) true) %) all-routes)
        view (:view current-route)]
    (when (ifn? view) (view))))

(defn sidebar-content []
  [:nav.px-3.pt-8.pb-8
   (nav-items)])

(defn slugify
  "Convert text to URL-friendly slug"
  [text]
  (-> text
      str/lower-case
      (str/replace #"[^\w\s-]" "")
      (str/replace #"\s+" "-")
      (str/replace #"-+" "-")
      (str/trim)))

(defn fuzzy-match?
  "Check if query fuzzy-matches text (case-insensitive, matches if all chars appear in order)"
  [query text]
  (let [q (str/lower-case query)
        t (str/lower-case text)]
    (loop [qi 0
           ti 0]
      (cond
        (>= qi (count q)) true              ; All query chars matched
        (>= ti (count t)) false             ; Ran out of text
        (= (nth q qi) (nth t ti))           ; Match found
        (recur (inc qi) (inc ti))
        :else                               ; Keep searching
        (recur qi (inc ti))))))

(defn build-search-index
  "Build search index from docs and guide components"
  []
  (concat
   (for [route guide-routes]
     {:id (:id route)
      :name (:name route)
      :type :guide
      :icon (:icon route)
      :segment (:segment route)
      :description (:description route)
      :tags (or (:tags route) [])})
   (mapcat
    (fn [route]
      (let [parent {:id (:id route)
                    :name (:name route)
                    :type :component
                    :icon (:icon route)
                    :segment (:segment route)
                    :description (:description route)
                    :tags (or (:tags route) [])}
            children (when-let [ch (:children route)]
                       (for [child ch]
                         {:id (:id child)
                          :name (:name child)
                          :type :component
                          :icon (:icon child)
                          :segment (:segment child)
                          :description (:description child)
                          :tags (or (:tags child) [])
                          :parent-name (:name route)}))]
        (if children
          (cons parent children)
          [parent])))
    component-routes)))

(defn search-score
  "Calculate search relevance score for an item. Higher = better match."
  [query item]
  (if (str/blank? query)
    50 ; Default score for empty query
    (let [q (str/lower-case (str/trim query))
          name-lower (str/lower-case (:name item))
          desc-lower (str/lower-case (or (:description item) ""))
          tags (:tags item [])]
      (cond
        (= q name-lower) 100
        (str/starts-with? name-lower q) 85
        (str/includes? name-lower q) 70
        (some #(= q (str/lower-case %)) tags) 60
        (some #(str/starts-with? (str/lower-case %) q) tags) 50
        (str/includes? desc-lower q) 40
        (fuzzy-match? q name-lower) 25
        :else 0))))

(defn highlight-matches
  "Return hiccup fragments with matched characters highlighted"
  [query text]
  (if (or (str/blank? query) (str/blank? text))
    [[:span text]]
    (let [q (str/lower-case query)
          t-lower (str/lower-case text)
          positions (cond
                      (str/includes? t-lower q)
                      (let [start (str/index-of t-lower q)]
                        (set (range start (+ start (count q)))))
                      (fuzzy-match? q text)
                      (loop [qi 0 ti 0 pos #{}]
                        (cond
                          (>= qi (count q)) pos
                          (>= ti (count text)) pos
                          (= (nth q qi) (nth t-lower ti))
                          (recur (inc qi) (inc ti) (conj pos ti))
                          :else (recur qi (inc ti) pos)))
                      :else #{})]
      (if (empty? positions)
        [[:span text]]
        (loop [i 0 result [] in-match? false current ""]
          (if (>= i (count text))
            (if (seq current)
              (conj result (if in-match?
                             [:span.ty-text-primary.font-semibold current]
                             [:span current]))
              result)
            (let [char (nth text i)
                  is-match? (contains? positions i)]
              (if (= is-match? in-match?)
                (recur (inc i) result in-match? (str current char))
                (recur (inc i)
                       (if (seq current)
                         (conj result (if in-match?
                                        [:span.ty-text-primary.font-semibold current]
                                        [:span current]))
                         result)
                       is-match?
                       (str char))))))))))

(defn search-items
  "Filter and score search index by query, returning grouped results"
  [query]
  (let [index (build-search-index)
        scored (->> index
                    (map #(assoc % :score (search-score query %)))
                    (filter #(pos? (:score %)))
                    (sort-by :score >)
                    (take 12))]
    {:guides (filter #(= :guide (:type %)) scored)
     :components (filter #(= :component (:type %)) scored)}))

(defn open-search! []
  (swap! state assoc-in [:search :open] true)
  (swap! state assoc-in [:search :query] "")
  (swap! state assoc-in [:search :selected-index] 0)
  ;; Focus the input after render
  (js/setTimeout
   #(when-let [input (.getElementById js/document "search-input")]
      (.focus input))
   50))

(defn close-search! []
  (swap! state assoc-in [:search :open] false))

(defn select-search-result!
  "Navigate to selected search result"
  [result]
  (router/navigate! (:id result))
  (close-search!))

(defn search-result-item
  "Render a single search result item"
  [result idx selected-index query]
  [:li
   [:button.w-full.text-left.px-4.py-3.flex.items-center.gap-3.transition-colors
    {:class (when-not (= idx selected-index) ["hover:ty-bg-primary-"])
     :style (when (= idx selected-index)
              {:background "linear-gradient(to right, var(--ty-bg-primary), transparent)"
               :box-shadow "inset 2px 0 0 var(--ty-color-primary)"})
     :on {:click #(select-search-result! result)
          :mouseenter #(swap! state assoc-in [:search :selected-index] idx)}}
    [:div.w-8.h-8.rounded-md.flex.items-center.justify-center.flex-shrink-0
     {:class (case (:type result)
               :guide ["ty-bg-success-" "ty-text-success"]
               :component ["ty-bg-primary-" "ty-text-primary"]
               ["ty-bg-neutral-"])}
     [:ty-icon {:name (:icon result)
                :size "sm"}]]
    [:div.flex-1.min-w-0
     [:div.font-medium.ty-text.truncate
      (into [:span] (highlight-matches query (:name result)))]
     (when-let [desc (:description result)]
       [:div.text-xs.ty-text-.truncate desc])]
    (when (= idx selected-index)
      [:kbd.text-xs.ty-text-.ty-bg-neutral.px-2.py-1.rounded.flex-shrink-0 "↵"])]])

(defn search-modal
  "Command palette search modal"
  []
  (let [{:keys [open query selected-index]} (:search @state)
        {:keys [guides components]} (search-items query)
        ;; Flatten for keyboard navigation (guides first, then components)
        all-results (concat guides components)
        result-count (count all-results)]
    ;; Always render modal (must be in DOM), control visibility via :open attribute
    [:ty-modal {:open open
                :on {:close close-search!}}
     [:div.ty-floating.rounded-xl.shadow-lg.overflow-hidden.site-chrome
      {:data-ty-theme true
       :style {:width "min(520px, 90vw)"
               :max-height "80vh"}}
      [:div.p-4.border-b.ty-border-
       [:div.flex.items-center.gap-3
        [:ty-icon {:name "search"
                   :size "sm"
                   :class "ty-text-"}]
        [:input#search-input.flex-1.bg-transparent.outline-none.text-lg.ty-text
         {:type "text"
          :placeholder "Search components and guides..."
          :value query
          :on {:input (fn [e]
                        (swap! state assoc-in [:search :query] (.. e -target -value))
                        (swap! state assoc-in [:search :selected-index] 0))
               :keydown (fn [e]
                          (let [key (.-key e)]
                            (cond
                              (= key "ArrowDown")
                              (do (.preventDefault e)
                                  (swap! state update-in [:search :selected-index]
                                         #(min (inc %) (dec result-count))))

                              (= key "ArrowUp")
                              (do (.preventDefault e)
                                  (swap! state update-in [:search :selected-index]
                                         #(max (dec %) 0)))

                              (= key "Enter")
                              (when-let [result (nth all-results selected-index nil)]
                                (select-search-result! result))

                              (= key "Escape")
                              (close-search!))))}}]
        [:kbd.text-xs.ty-text-.ty-bg-neutral-.px-2.py-1.rounded "esc"]]]

        ;; Results list (fixed height to prevent twitching)
      [:div.overflow-y-auto {:style {:height "400px"}}
       (if (seq all-results)
         [:div.py-2
          (when (seq guides)
            [:div
             [:div.px-4.py-2.text-xs.font-medium.ty-text-.uppercase.tracking-wide
              "Guides"]
             [:ul
              (for [[idx result] (map-indexed vector guides)]
                ^{:key (:id result)}
                (search-result-item result idx selected-index query))]])
          (when (seq components)
            [:div {:class (when (seq guides) "mt-2")}
             [:div.px-4.py-2.text-xs.font-medium.ty-text-.uppercase.tracking-wide
              "Components"]
             [:ul
              (let [offset (count guides)]
                (for [[idx result] (map-indexed vector components)]
                  ^{:key (:id result)}
                  (search-result-item result (+ offset idx) selected-index query)))]])]
         [:div.flex.flex-col.items-center.justify-center.gap-3.h-full.ty-text-
          [:ty-icon {:name "search"
                     :size "xl"
                     :class "opacity-20"}]
          [:div.text-center
           [:p.font-medium "No results found"]
           [:p.text-sm.ty-text--.mt-1
            "Try different keywords or browse the sidebar"]]])]

      [:div.px-4.py-3.border-t.ty-border-.flex.items-center.gap-4.text-xs.ty-text--
       [:span.flex.items-center.gap-1
        [:kbd.ty-bg-neutral-.px-2.py-1.rounded "↑"]
        [:kbd.ty-bg-neutral-.px-2.py-1.rounded "↓"]
        " Navigate"]
       [:span.flex.items-center.gap-1
        [:kbd.ty-bg-neutral-.px-2.py-1.rounded "↵"]
        " Select"]
       [:span.flex.items-center.gap-1
        [:kbd.ty-bg-neutral-.px-2.py-1.rounded "esc"]
        " Close"]]]]))

;; Active component lookup (used by header to display the component name)

(defn current-component-breadcrumb
  "Returns {:parent parent :current entry} for the active route if on a component page.
   :parent is nil for top-level components."
  []
  (some (fn [parent]
          (cond
            (router/rendered? (:id parent) true)
            {:parent nil :current parent}
            :else
            (when-let [child (some #(when (router/rendered? (:id %) true) %) (:children parent))]
              {:parent parent :current child})))
        docs/docs-components))

(defonce keyboard-shortcuts-initialized (atom false))

(defn setup-keyboard-shortcuts!
  "Setup global keyboard shortcuts (only once)"
  []
  (when-not @keyboard-shortcuts-initialized
    (reset! keyboard-shortcuts-initialized true)
    (.addEventListener js/document "keydown"
                       (fn [e]
                         (let [key (.-key e)
                               cmd-or-ctrl? (or (.-metaKey e) (.-ctrlKey e))
                               ;; Don't trigger shortcuts when typing in inputs
                               in-input? (when-let [active (.-activeElement js/document)]
                                           (or (= (.-tagName active) "INPUT")
                                               (= (.-tagName active) "TEXTAREA")
                                               (.-isContentEditable active)))]
                           (when (and cmd-or-ctrl? (= key "k"))
                             (.preventDefault e)
                             (if (get-in @state [:search :open])
                               (close-search!)
                               (open-search!))))))))

(defn mobile-menu []
  [:div.lg:hidden.site-chrome {:data-ty-theme true}
   [:ty-modal {:open (:mobile-menu-open @state)
               :on {:close close-mobile-menu!}}
    [:div.p-5.mx-auto.rounded-xl.ty-floating.box-border.flex.flex-col
     {:style {:width "300px"
              :max-height "85vh"}}
     [:div.flex.items-center.gap-3.pb-4.border-b.ty-border-.flex-shrink-0
      [:ty-icon {:name "ty-logo"
                 :style {:width 40
                         :height 20
                         :margin-top 3}
                 :class "ty-text-primary"}]
      [:span.text-xs.ty-text-- "web components"]]

     [:div.flex-1.overflow-y-auto.pt-4.min-h-0
      [:div.space-y-2
       (nav-items)]]]]])

(defn page-title-text
  "Plain page title used when not viewing a component. Returns nil for generic pages."
  []
  (cond
    (router/rendered? ::user-profile true) "User Profile"
    (router/rendered? ::event-booking true) "Event Booking"
    (router/rendered? ::contact-form true) "Contact Form"
    (router/rendered? ::components true) "Components"
    (router/rendered? ::getting-started true) "Getting Started"
    :else nil))

(defn header-title []
  (if-let [{:keys [parent current]} (current-component-breadcrumb)]
    [:div.flex.items-center.gap-1.text-sm
     [:button.ty-text-.hover:ty-text-primary.transition-colors.cursor-pointer
      {:on {:click #(router/navigate! ::components)}}
      "Components"]
     [:span.ty-text-- "›"]
     (when parent
       [:button.ty-text-.hover:ty-text-primary.transition-colors.cursor-pointer
        {:on {:click #(router/navigate! (:id parent))}}
        (:name parent)])
     (when parent
       [:span.ty-text-- "›"])
     [:span.ty-text.font-medium (:name current)]]
    (when-let [title (page-title-text)]
      [:h2.text-sm.font-medium.ty-text-.truncate title])))

(defn header-actions []
  [:div.flex.items-center.gap-2.flex-shrink-0
   [:button.transition-all.duration-150.group
    {:on {:click open-search!}
     :style {:display "inline-flex"
             :align-items "center"
             :gap "8px"
             :padding "5px 10px"
             :border-radius "6px"
             :background "var(--ty-surface-elevated)"
             :border "1px solid var(--ty-border)"}}
    [:ty-icon {:name "search"
               :size "sm"
               :class ["ty-text--" "group-hover:ty-text-primary" "transition-colors"]}]
    [:span.ty-text-.font-medium {:style {:font-size "10px" :line-height "1" :margin-top "2px"}} "Search"]
    [:span.ty-text--.rounded
     {:style {:font-size "8px"
              :line-height "1"
              :padding "3px 5px"
              :font-family "inherit"
              :background "var(--ty-surface-floating)"
              :border "1px solid var(--ty-border)"}}
     (if (.-userAgent js/navigator)
       (if (str/includes? (.-userAgent js/navigator) "Mac") "⌘K" "Ctrl+K")
       "⌘K")]]
   [:a.p-2.rounded-md.ty-text-.hover:ty-text-primary.transition-colors
    {:href "https://github.com/gersak/tyrell"
     :target "_blank"
     :rel "noopener noreferrer"
     :title "View on GitHub"}
    [:ty-icon {:name "github"
               :size "sm"}]]
   [:button.p-2.rounded-md.ty-text-.hover:ty-text-primary.transition-colors
    {:on {:click toggle-theme!}}
    [:ty-icon {:name (if (= (:theme @state) "light") "moon" "sun")
               :size "sm"}]]])

(defn header []
  (let [show-sidebar? (layout/breakpoint>= :lg)
        has-toc? (and (layout/breakpoint>= :xl) (seq (:items (current-toc))))]
    [:ty-resize-observer
     (merge {:id "tyrell.header"}
            (resize-observer-hooks "tyrell.header" [:sidebar-sizes :header]))
     [:header.border-b.ty-border-soft.site-chrome
      {:data-ty-theme true
       :style {:background-color "var(--ty-surface-canvas)"}}
      (if show-sidebar?
        ;; Desktop: Grid layout matching content columns
        [:div.mx-auto.px-5.lg:px-8
         {:style {:max-width "1200px"
                  :display "grid"
                  :grid-template-columns (if has-toc?
                                           "220px minmax(0, 1fr) 180px"
                                           "220px minmax(0, 1fr)")
                  :gap "40px"
                  :align-items "center"}}
         ;; Logo area (aligns with sidebar)
         [:a.flex.items-center.gap-3.cursor-pointer
          {:on {:click (fn [e]
                         (.preventDefault e)
                         (router/navigate! ::landing))}}
          [:div.flex.justify-center.align-center.h-8.pl-4
           [:ty-icon {:name "ty-logo"
                      :class "ty-text-primary"
                      :style {:height 40
                              :width 120}}]]]
         ;; Content header area — title only when right sidebar present
         (if has-toc?
           [:div.flex.items-center.py-2
            [:div.flex-1.min-w-0 (header-title)]]
           [:div.flex.items-center.justify-between.gap-3.py-2
            [:div.flex-1.min-w-0 (header-title)]
            (header-actions)])
         ;; When right sidebar is visible, actions move here to align with it
         (when has-toc?
           [:div.flex.items-center.justify-end.py-2
            (header-actions)])]

        ;; Mobile: Single row flex layout
        [:div.mx-auto.px-4.py-3.flex.items-center.gap-3
         {:style {:max-width "1200px"}}
         ;; Logo doubles as the mobile menu trigger (was a separate hamburger
         ;; button + logo-navigates-home; one tap target now opens the nav).
         [:a.flex.items-center.flex-shrink-0.cursor-pointer
          {:on {:click (fn [e]
                         (.preventDefault e)
                         (toggle-mobile-menu!))}
           :style {:margin-top "0.18rem"}}
          [:ty-icon {:name "ty-logo"
                     :class "ty-text-primary"
                     :style {:height 28
                             :width 48}}]]
         [:div.flex-1.min-w-0
          (header-title)]
         [:button.p-2.rounded-md.hover:ty-bg-primary-.transition-colors.flex-shrink-0
          {:on {:click open-search!}}
          [:ty-icon {:name "search"
                     :size "sm"
                     :class "ty-text-"}]]
         [:a.p-2.rounded-md.hover:ty-bg-primary-.transition-colors.flex-shrink-0
          {:href "https://github.com/gersak/tyrell"
           :target "_blank"
           :rel "noopener noreferrer"
           :title "View on GitHub"}
          [:ty-icon {:name "github"
                     :size "sm"
                     :class "ty-text-"}]]
         [:button.p-2.rounded-md.ty-text-.hover:ty-text-primary.transition-colors.flex-shrink-0
          {:on {:click toggle-theme!}}
          [:ty-icon {:name (if (= (:theme @state) "light") "moon" "sun")
                     :size "sm"}]]])]]))

(defn app []
  (layout/with-window
    (let [show-sidebar? (layout/breakpoint>= :lg)
          toc (current-toc)
          has-toc? (and (layout/breakpoint>= :xl) (seq (:items toc)))
          header-height (if (layout/breakpoint>= :lg) 60 52)
          content-padding (if (layout/breakpoint>= :lg) 48 24)
          sidebar-max-h (str "calc(100vh - " header-height "px)")]
      [:div.flex.flex-col.ty-canvas.ty-text
       {:style {:height "100%"}}
       (mobile-menu)
       (search-modal)
       ;; Floating brand-seeds widget — pinned to the corner on every page.
       ;; Drag the sliders, watch the entire site retint.
       (theming-docs/floating-seeds)
       (header)
       [:div.flex-1.overflow-y-auto.overflow-x-hidden.ty-canvas
        {:id "main-scroll-container"
         :style {:-webkit-overflow-scrolling "touch"}}
        [:div.mx-auto
         {:style {:display "grid"
                  :grid-template-columns (cond
                                           (and show-sidebar? has-toc?) "220px minmax(0, 1fr) 180px"
                                           show-sidebar? "220px minmax(0, 1fr)"
                                           :else "1fr")
                  :max-width "1200px"
                  :min-height "100%"
                  :gap (if show-sidebar? "40px" "0px")
                  ;; No vertical padding — sidebars start at top-0 and stick immediately
                  :padding (if show-sidebar? "0 32px" "8px 4px")}}
         (when show-sidebar?
           [:div.sticky.top-0.self-start.site-chrome
            {:data-ty-theme true
             :style {:max-height sidebar-max-h
                     :overflow-y "auto"
                     :scrollbar-width "none"}}
            (sidebar-content)])
         [:main.min-w-0
          {:style {:padding "32px 0"}}
          (layout/with-container
            {:width (cond
                      (and show-sidebar? has-toc?) (- (layout/container-width) 220 180 content-padding)
                      show-sidebar? (- (layout/container-width) 220 content-padding)
                      :else (- (layout/container-width) content-padding))
             :height (- (layout/container-height) header-height content-padding)}
            (render))]
         (when has-toc?
           [:div.sticky.top-0.self-start.site-chrome
            {:data-ty-theme true
             :style {:max-height sidebar-max-h
                     :overflow-y "auto"
                     :scrollbar-width "none"}}
            (right-sidebar toc)])]]])))

(defn render-app! []
  (binding [router/*roles* (:user/roles @state)]
    (rdom/render (.getElementById js/document "app") (app))))

(defn ^:dev/after-load init []
  ;; Inject site-chrome styles (inline-code pills, etc.) into <head>.
  ;; Idempotent + hot-reloadable via tyrell.css/ensure-document-styles!
  (styles/install!)

  (let [stored-theme (.getItem js/localStorage "theme")
        system-theme (if (and (.-matchMedia js/window)
                              (.-matches (.matchMedia js/window "(prefers-color-scheme: dark)")))
                       "dark" "light")
        theme (or stored-theme system-theme "dark")]
    (swap! state assoc :theme theme)
    (if (= theme "dark")
      (.add (.-classList js/document.documentElement) "dark")
      (.remove (.-classList js/document.documentElement) "dark")))

  (router/init! (when-not (str/blank? ROUTER_BASE) ROUTER_BASE))

  (auto-expand-section!)

  (setup-keyboard-shortcuts!)

  ;; Watch router changes for auto-expand, scroll-to-top, and re-render
  (add-watch router/*router* ::render
             (fn [_ _ old-state new-state]
               (when (not= (:current old-state) (:current new-state))
                 (let [all-routes (flatten-routes (concat site-routes component-routes guide-routes))
                       current-route (some #(when (router/rendered? (:id %) true) %) all-routes)]
                   (when (should-scroll-for-route? (:id current-route))
                     (js/setTimeout scroll-main-to-top! 100))))
               (auto-expand-section!)
               (render-app!)))

  (add-watch state ::render
             (fn [_ _ _ _] (render-app!)))

;; Watch window size changes for responsive layout (fixes sidebar toggle)
  (add-watch layout/window-size ::window-resize
             (fn [_ _ _ _] (render-app!)))

  (render-app!))
