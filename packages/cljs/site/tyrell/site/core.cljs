(ns tyrell.site.core
  (:require
   [clojure.string :as str]
   tyrell.site.icons
   [replicant.dom :as rdom]
   [tyrell.layout :as layout]
   [tyrell.router :as router]
   [tyrell.site.docs :as docs]
   [tyrell.site.docs.common :as docs-common]
   [tyrell.site.docs.quickstart :as quickstart]
   [tyrell.site.docs.theming :as theming-docs]
   [tyrell.site.state :refer [state]]
   [tyrell.site.styles :as styles]
   [tyrell.site.views.components-index :as components-index]
   [tyrell.site.views.landing :as landing]
   [tyrell.site.views.sandbox-sizing :as sandbox-sizing]
   [tyrell.site.views.sandbox-tabs :as sandbox-tabs]
   [tyrell.site.views.sandbox-tabs-morph :as sandbox-tabs-morph]
   [tyrell.site.views.sandbox-polish :as sandbox-polish]
   [tyrell.site.views.sandbox-toggles :as sandbox-toggles]
   [tyrell.site.views.sandbox-modal :as sandbox-modal]
   [tyrell.site.views.sandbox-modal-tabs :as sandbox-modal-tabs]
   [tyrell.site.views.sandbox-select-mobile :as sandbox-select-mobile]))

;; Configuration for GitHub Pages deployment
;; These are replaced at build time via closure-defines
(goog-define ROUTER_BASE "")
(goog-define PRODUCTION false)

(def ^:private sandbox-routes
  "Throwaway integration-testing pages, reachable only by typing the URL and
   never in nav or search. Dev builds only: PRODUCTION folds this away, and
   the sandbox views with it."
  [{:id ::sandbox-sizing
    :segment "internal/sizing"
    :name "Sizing Sandbox (hidden)"
    :view sandbox-sizing/view}

   {:id ::sandbox-tabs
    :segment "internal/tabs"
    :name "Tabs Resize/Overflow Verify (hidden)"
    :view sandbox-tabs/view}

   {:id ::sandbox-tabs-morph
    :segment "internal/tabs-morph"
    :name "Tabs Server-Morph Verify (hidden)"
    :view sandbox-tabs-morph/view}

   {:id ::sandbox-toggles
    :segment "internal/toggles"
    :name "Switch/Checkbox Double-fire Verify (hidden)"
    :view sandbox-toggles/view}

   {:id ::sandbox-polish
    :segment "internal/polish"
    :name "Open Polish Issues (hidden)"
    :view sandbox-polish/view}

   {:id ::sandbox-modal
    :segment "internal/modal"
    :name "Modal prevent-* Verify (hidden)"
    :view sandbox-modal/view}

   {:id ::sandbox-modal-tabs
    :segment "internal/modal-tabs"
    :name "Tabs Marker-in-Modal Snap Verify (hidden)"
    :view sandbox-modal-tabs/view}

   {:id ::sandbox-select-mobile
    :segment "internal/select-mobile"
    :name "Select Mobile Strip/Accordion Verify (hidden)"
    :view sandbox-select-mobile/view}])

(def site-routes
  (cond-> [;; Main landing page
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
    :view components-index/view}]
    (not PRODUCTION) (into sandbox-routes)))

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
                         (update :segment (fn [segment] (str "guides/" segment)))))
                   (concat guide-routes docs/legacy-guides))))

(defn- redirect-legacy-guide!
  "Old per-stack guide URLs land on Getting started with that stack."
  []
  (when-let [{:keys [stack]} (some #(when (router/rendered? (:id %) true) %) docs/legacy-guides)]
    (quickstart/open! stack true)))

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

(defn scroll-main-to-top!
  "Smoothly scrolls the main content area to the top"
  []
  (when-let [scroll-container (.getElementById js/document "main-scroll-container")]
    (.scrollTo scroll-container #js {:top 0
                                     :behavior "smooth"})))

(defn scroll-to-anchor! [anchor]
  (when-let [el (.getElementById js/document anchor)]
    (.scrollIntoView el #js {:behavior "smooth" :block "start"})))

(defn toc-item [{:keys [anchor label route-id category? level]}]
  (if category?
    [:button.block.w-full.text-left.pl-4.pr-2.pt-3.text-xs.font-semibold.uppercase.tracking-wide.ty-text-primary+.transition-colors.cursor-pointer.hover:ty-text-primary++ {:class ["pb-0.5"] :on {:click #(scroll-to-anchor! anchor)}}
     label]
    (let [active? (when route-id (router/rendered? route-id true))]
      [:button.block.w-full.text-left.text-xs.py-1.pr-2.transition-colors.cursor-pointer
       {:class (concat
                (if (= level 2) ["pl-4"] ["pl-8"])
                (cond
                  active? ["ty-text++" "font-medium"]
                  (= level 2) ["ty-text" "font-medium" "hover:ty-text++"]
                  :else ["ty-text-" "hover:ty-text++"]))
        :on {:click (fn []
                      (if route-id
                        (router/navigate! route-id)
                        (scroll-to-anchor! anchor)))}}
       label])))

(defn right-sidebar [{:keys [title items]}]
  [:div.pt-8.pb-8
   (when title
     [:p.text-xs.uppercase.tracking-widest.ty-text-.pl-4.mb-3
      title])
   [:div
    (for [item items]
      (docs-common/keyed (or (:anchor item) (:label item)) (toc-item item)))]])

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

(defn flatten-routes
  "Recursively flatten routes including children"
  [routes]
  (mapcat (fn [route]
            (if-let [children (:children route)]
              (cons (dissoc route :children) (flatten-routes children))
              [route]))
          routes))

(defn landing-page?
  "The welcome page renders full-width, without the docs sidebars."
  []
  (or (router/rendered? ::landing true)
      (router/rendered? ::landing-user-profile true)
      (router/rendered? ::landing-event-booking true)
      (router/rendered? ::landing-contact-form true)))

(def ^:private theming-route-id :tyrell.site.docs/theming)

(defn current-toc
  "Returns {:title optional-string :items [...]} for the current route, or nil."
  []
  (cond
    (landing-page?)
    {:title "Check out examples"
     :items [{:anchor "top" :label "Overview" :route-id ::landing}
             {:anchor "user-profile" :label "User Profile" :route-id ::landing-user-profile}
             {:anchor "event-booking" :label "Event Booking" :route-id ::landing-event-booking}
             {:anchor "contact-form" :label "Contact Form" :route-id ::landing-contact-form}]}

    ;; Component pages (and guides on the v2 template): sections of the
    ;; current page. The component list itself lives in the left sidebar
    ;; (component-nav).
    (or (route-in-tree? (some #(when (router/rendered? (:id %) true) (:id %))
                              (flatten-routes component-routes))
                        component-routes)
        (router/rendered? theming-route-id true)
        (router/rendered? :tyrell.site.docs/getting-started true))
    {:title "On this page" :items (seq @docs-common/page-sections) :spy? true}

    :else nil))

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

(defn- component-pager
  "Prev/next cards on component pages, in the sidebar's component order."
  []
  (let [comp-map (components-index/by-id-map)
        ids (vec (filter comp-map (mapcat :ids components-index/category-groups)))
        i (first (keep-indexed #(when (router/rendered? %2 true) %1) ids))
        card (fn [j label]
               (when-let [id (and i (get ids j))]
                 {:label (str label " · " (.padStart (str (inc j)) 2 "0"))
                  :title (:name (get comp-map id))
                  :on-click #(router/navigate! id)}))]
    (when i
      [:div.mx-auto {:style {:max-width "1080px"
                             :padding (if (layout/breakpoint>= :lg) "0 0 96px" "0 12px 64px")}}
       (docs-common/pager {:prev (card (dec i) "Previous")
                           :next (card (inc i) "Next")})])))

;; --- Sidebar -------------------------------------------------------------------
;; One tree that keeps its shape on every page: start links, then every
;; component under its category. The current page is marked by a brand dot in
;; the icon column.

(defn- nav-dot
  "Rendered on every row so the state change transitions: the old dot shrinks
   out while the new one grows in (site-nav-dot in styles.cljs)."
  [active? style]
  [:span.absolute.rounded-full.site-nav-dot
   {:class (when active? "is-on")
    :style (assoc style :background "var(--ty-color-primary)")}])

(defn- reveal-current!
  "Scrolls the current page's row into the sidebar's view, once per page and
   only when it's off-screen. A list the reader scrolled stays put."
  [{^js row :replicant/node}]
  (when-let [^js box (some-> (.closest row "ty-scroll-container") .-scrollElement)]
    (when (not= js/location.pathname (.-_revealedPath box))
      (js/clearTimeout (.-_revealTimer box))
      (set! (.-_revealTimer box)
            (js/setTimeout
             (fn []
               (let [r (.getBoundingClientRect row)
                     b (.getBoundingClientRect box)]
                 ;; A closed mobile menu has no height; try again once it opens.
                 (when (and (.-isConnected row) (pos? (.-height b)))
                   (set! (.-_revealedPath box) js/location.pathname)
                   (when (or (< (.-top r) (.-top b)) (> (.-bottom r) (.-bottom b)))
                     (.scrollBy box #js {:top (- (+ (.-top r) (/ (.-height r) 2))
                                                 (+ (.-top b) (/ (.-height b) 2)))
                                         :behavior (if (.-matches (js/matchMedia "(prefers-reduced-motion: reduce)"))
                                                     "auto" "smooth")})))))
             320)))))

(defn- nav-row
  "A sidebar entry: icon, label, optional trail."
  [{:keys [label icon active? trail on-click]}]
  [:button.site-focus.relative.w-full.flex.items-center.gap-3.rounded-md.px-3.py-2.text-left.text-sm.cursor-pointer.transition-colors
   {:replicant/key label
    :replicant/on-render (when active? reveal-current!)
    :aria-current (when active? "page")
    :class (if active? ["ty-text++" "font-semibold"] ["ty-text" "hover:ty-text++"])
    :on {:click (fn [] (on-click) (close-mobile-menu!))}}
   [:span.relative.flex.shrink-0.items-center.justify-center.w-4.h-4
    [:ty-icon.site-nav-icon.ty-text- {:name icon :size "sm" :class (when active? "is-off")}]
    (nav-dot active? {:inset 0 :margin "auto" :width "6px" :height "6px"})]
   [:span.flex-1.truncate label]
   trail])

(def ^:private start-links
  [{:id ::landing :label "Welcome" :icon "home"}
   {:id :tyrell.site.docs/getting-started :label "Getting started" :icon "rocket" :stack? true}
   {:id theming-route-id :label "Theming" :icon "droplet"}
   {:id :tyrell.site.docs/icons :label "Icons" :icon "feather"}])

(defn- start-section []
  [:div.flex.flex-col
   (for [{:keys [id label icon stack?]} start-links]
     (nav-row {:label label :icon icon
               ;; The chosen stack, quietly; switching happens on the page.
               :trail (when stack?
                        [:span.font-mono.font-normal.ty-text- {:class ["text-[10px]"]}
                         (str/lower-case (:label (quickstart/current)))])
               :active? (router/rendered? id true)
               :on-click #(router/navigate! id)}))])

(defn- components-section
  "Every component at once, under its category."
  []
  (let [comp-map (components-index/by-id-map)
        groups (for [group components-index/category-groups]
                 (assoc group :items (keep comp-map (:ids group))))
        on-index? (router/rendered? ::components true)]
    [:div.flex.flex-col.gap-4.flex-1.min-h-0
     [:button.site-focus.flex.items-center.justify-between.rounded-md.px-3.cursor-pointer.uppercase.font-semibold.transition-colors
      {:class (into ["text-[11px]" "tracking-[0.06em]"] (if on-index? ["ty-text++"] ["ty-text--" "hover:ty-text"]))
       :on {:click (fn [] (router/navigate! ::components) (close-mobile-menu!))}}
      "Components"
      [:span.font-mono.font-normal (reduce + (map (comp count :items) groups))]]
     ;; Only the list scrolls; start links and this header stay put.
     [:ty-scroll-container.site-nav-scroll.flex-1.min-h-0 {:hide-scrollbar ""}
      [:div.flex.flex-col.gap-4.pb-8
       (for [{:keys [title items]} groups]
         [:div.flex.flex-col {:replicant/key title}
          [:p.px-3.pb-1.text-xs.ty-text-- title]
          (for [{:keys [id name icon]} items]
            (nav-row {:label name :icon icon
                      :active? (router/rendered? id true)
                      :on-click #(router/navigate! id)}))])]]]))

(defn nav-items
  "Fills a container of definite height; the component list takes the rest."
  []
  [:div.flex.flex-col.gap-7.h-full.min-h-0
   (start-section)
   (components-section)])

(defn render
  "Render the appropriate view based on current route (like docs/render)"
  []
  (let [all-routes (flatten-routes (concat site-routes component-routes guide-routes))
        current-route (some #(when (router/rendered? (:id %) true) %) all-routes)
        view (:view current-route)]
    ;; Keyed by view: switching pages replaces the page instead of diffing two
    ;; unrelated trees (that diff desynced replicant between playgrounds and
    ;; froze every later render). Routes sharing a view, like the landing
    ;; examples, still diff in place.
    (when (ifn? view) (docs-common/keyed view (view)))))

(defn sidebar-content []
  [:nav.px-3.pt-8.h-full
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
   (for [{:keys [id label icon how tags]} quickstart/stacks]
     {:id (keyword "quickstart" id)
      :stack id
      :name label
      :type :guide
      :icon icon
      :description (str "Getting started with " label " (" how ")")
      :tags tags})
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
  (swap! state update :search assoc :open true :query "" :selected-index 0)
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
  (if-let [stack (:stack result)]
    (do (quickstart/open! stack) (scroll-main-to-top!))
    (router/navigate! (:id result)))
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
        [:ty-icon.ty-text- {:name "search"
                   :size "sm"}]
        [:input#search-input.flex-1.bg-transparent.outline-none.text-lg.ty-text
         {:type "text"
          :placeholder "Search components and guides..."
          :value query
          :on {:input (fn [e]
                        (swap! state update :search assoc
                               :query (.. e -target -value)
                               :selected-index 0))
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
                (docs-common/keyed (:id result) (search-result-item result idx selected-index query)))]])
          (when (seq components)
            [:div {:class (when (seq guides) "mt-2")}
             [:div.px-4.py-2.text-xs.font-medium.ty-text-.uppercase.tracking-wide
              "Components"]
             [:ul
              (let [offset (count guides)]
                (for [[idx result] (map-indexed vector components)]
                  (docs-common/keyed (:id result) (search-result-item result (+ offset idx) selected-index query))))]])]
         [:div.flex.flex-col.items-center.justify-center.gap-3.h-full.ty-text-
          [:ty-icon.opacity-20 {:name "search"
                     :size "xl"}]
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
                               (open-search!)))
                           ;; ⌘B / Ctrl+B toggles the theme; left alone in fields (bold)
                           (when (and cmd-or-ctrl? (= key "b") (not in-input?))
                             (.preventDefault e)
                             (toggle-theme!)))))))

(defn mobile-menu []
  [:div.lg:hidden.site-chrome {:data-ty-theme true}
   [:ty-modal {:open (:mobile-menu-open @state)
               :on {:close close-mobile-menu!}}
    [:div.p-5.mx-auto.rounded-xl.ty-floating.box-border.flex.flex-col
     {:style {:width "300px"
              :height "85vh"}}
     [:div.flex.items-center.gap-3.pb-4.border-b.ty-border-.flex-shrink-0
      [:ty-icon.ty-text-primary {:name "ty-logo"
                 :style {:width 40
                         :height 20
                         :margin-top 3}}]
      [:span.text-xs.ty-text-- "web components"]]

     [:div.flex-1.pt-4.min-h-0
      (nav-items)]]]])

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

(defn header-title
  "Breadcrumb when we're inside a component page — it shows depth the sidebar
   doesn't. A bare page title only repeats the highlighted nav item, so it's
   worth the space just when the nav is hidden (mobile); desktop passes false."
  ([] (header-title true))
  ([show-page-title?]
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
     (when show-page-title?
       (when-let [title (page-title-text)]
         [:h2.text-sm.font-medium.ty-text-.truncate title])))))

(defn- shortcut
  "Keyboard shortcut label for the platform: ⌘K on Mac, Ctrl+K elsewhere."
  [k]
  (str (if (str/includes? (str (.-userAgent js/navigator)) "Mac") "⌘" "Ctrl+") k))

(defn header-actions []
  [:div.flex.items-center.gap-2.flex-shrink-0
   ;; ty colors have hover: variants but no group-hover:, so the button carries
   ;; the hover color and the icon + label inherit it.
   [:button.inline-flex.items-center.gap-2.rounded-md.border.ty-border.ty-elevated.ty-text-.cursor-pointer.transition-colors.hover:ty-border-primary.hover:ty-text-primary
    {:on {:click open-search!}
     :title (str "Search (" (shortcut "K") ")")
     :style {:padding "5px 10px"}}
    [:ty-icon {:name "search" :size "sm"}]
    [:span.font-medium {:style {:font-size "10px" :line-height "1" :margin-top "2px"}} "Search"]
    [:span.ty-text--.rounded
     {:style {:font-size "8px"
              :line-height "1"
              :padding "3px 5px"
              :font-family "inherit"
              :background "var(--ty-surface-floating)"
              :border "1px solid var(--ty-border)"}}
     (shortcut "K")]]
   [:a.p-2.rounded-md.ty-text-.hover:ty-text-primary.transition-colors
    {:href "https://github.com/gersak/tyrell"
     :target "_blank"
     :rel "noopener noreferrer"
     :title "View on GitHub"}
    [:ty-icon {:name "github"
               :size "sm"}]]
   [:button.p-2.rounded-md.ty-text-.hover:ty-text-primary.transition-colors.cursor-pointer
    {:on {:click toggle-theme!}
     :title (str "Toggle theme (" (shortcut "B") ")")}
    [:ty-icon {:name (if (= (:theme @state) "light") "moon" "sun")
               :size "sm"}]]])

(defn- landing-header []
  [:div.mx-auto.px-8.py-2.flex.items-center.gap-10
   {:style {:max-width "1280px"}}
   [:a.flex.items-center.cursor-pointer
    {:on {:click (fn [e]
                   (.preventDefault e)
                   (router/navigate! ::landing))}}
    [:ty-icon.ty-text-primary {:name "ty-logo"
               
               :style {:height 40
                       :width 120}}]]
   [:nav.flex-1.flex.items-center.justify-center.gap-8
    (for [[label route-id] [["Components" ::components]
                            ["Getting started" :tyrell.site.docs/getting-started]
                            ["Theming" :tyrell.site.docs/theming]
                            ["Examples" ::landing-user-profile]]]
      [:button.text-sm.font-medium.ty-text.hover:ty-text-primary.transition-colors.cursor-pointer
       {:replicant/key label
        :on {:click #(router/navigate! route-id)}}
       label])]
   (header-actions)])

(defn header []
  (let [show-sidebar? (layout/breakpoint>= :lg)
        has-toc? (and (layout/breakpoint>= :xl) (seq (:items (current-toc))))]
    [:ty-resize-observer
     (merge {:id "tyrell.header"}
            (resize-observer-hooks "tyrell.header" [:sidebar-sizes :header]))
     [:header.border-b.ty-border-soft.site-chrome
      {:data-ty-theme true
       :style {:background-color "var(--ty-surface-canvas)"}}
      (cond
        (and show-sidebar? (landing-page?))
        (landing-header)

        show-sidebar?
        ;; Desktop: Grid layout matching content columns
        [:div.mx-auto.px-5.lg:px-8
         {:style {:max-width "1600px"
                  :display "grid"
                  :grid-template-columns (if has-toc?
                                           "272px minmax(0, 1fr) 180px"
                                           "272px minmax(0, 1fr)")
                  :gap "32px"
                  :align-items "center"}}
         ;; Logo area (aligns with sidebar)
         [:a.flex.items-center.gap-3.cursor-pointer
          {:on {:click (fn [e]
                         (.preventDefault e)
                         (router/navigate! ::landing))}}
          [:div.flex.justify-center.align-center.h-8.pl-4
           [:ty-icon.ty-text-primary {:name "ty-logo"
                      
                      :style {:height 40
                              :width 120}}]]]
         ;; Content header area — title only when right sidebar present
         (if has-toc?
           [:div.flex.items-center.py-2
            [:div.flex-1.min-w-0 (header-title false)]]
           [:div.flex.items-center.justify-between.gap-3.py-2
            [:div.flex-1.min-w-0 (header-title false)]
            (header-actions)])
         ;; When right sidebar is visible, actions move here to align with it
         (when has-toc?
           [:div.flex.items-center.justify-end.py-2
            (header-actions)])]

        :else
        ;; Mobile: Single row flex layout
        [:div.mx-auto.px-4.py-3.flex.items-center.gap-3
         {:style {:max-width "1400px"}}
         ;; Logo doubles as the mobile menu trigger (was a separate hamburger
         ;; button + logo-navigates-home; one tap target now opens the nav).
         [:a.flex.items-center.flex-shrink-0.cursor-pointer
          {:on {:click (fn [e]
                         (.preventDefault e)
                         (toggle-mobile-menu!))}
           :style {:margin-top "0.18rem"}}
          [:ty-icon.ty-text-primary {:name "ty-logo"
                     
                     :style {:height 28
                             :width 48}}]]
         [:div.flex-1.min-w-0
          (header-title)]
         [:button.p-2.rounded-md.hover:ty-bg-primary-.transition-colors.flex-shrink-0
          {:on {:click open-search!}}
          [:ty-icon.ty-text- {:name "search"
                     :size "sm"}]]
         [:a.p-2.rounded-md.hover:ty-bg-primary-.transition-colors.flex-shrink-0
          {:href "https://github.com/gersak/tyrell"
           :target "_blank"
           :rel "noopener noreferrer"
           :title "View on GitHub"}
          [:ty-icon.ty-text- {:name "github"
                     :size "sm"}]]
         [:button.p-2.rounded-md.ty-text-.hover:ty-text-primary.transition-colors.flex-shrink-0.cursor-pointer
          {:on {:click toggle-theme!}
           :title (str "Toggle theme (" (shortcut "B") ")")}
          [:ty-icon {:name (if (= (:theme @state) "light") "moon" "sun")
                     :size "sm"}]]])]]))

(defn app []
  (layout/with-window
    (let [landing? (landing-page?)
          show-sidebar? (and (not landing?) (layout/breakpoint>= :lg))
          toc (current-toc)
          has-toc? (and (not landing?) (layout/breakpoint>= :xl) (seq (:items toc)))
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
                                           (and show-sidebar? has-toc?) "272px minmax(0, 1fr) 180px"
                                           show-sidebar? "272px minmax(0, 1fr)"
                                           :else "1fr")
                  ;; The landing page is full-bleed: its bands run edge to
                  ;; edge and hold their own content column.
                  :max-width (if landing? "none" "1600px")
                  :min-height "100%"
                  :gap (if show-sidebar? "32px" "0px")
                  ;; No vertical padding — sidebars start at top-0 and stick immediately
                  :padding (cond
                             landing? "0"
                             show-sidebar? "0 32px"
                             :else "8px 4px")}}
         (when show-sidebar?
           [:div.sticky.top-0.self-start.site-chrome
            {:data-ty-theme true
             :style {:height sidebar-max-h}}
            (sidebar-content)])
         [:main.min-w-0
          {:style {:padding (if landing? "0" "32px 0")}}
          (layout/with-container
            {:width (cond
                      (and show-sidebar? has-toc?) (- (layout/container-width) 272 180 content-padding)
                      show-sidebar? (- (layout/container-width) 272 content-padding)
                      :else (- (layout/container-width) content-padding))
             :height (- (layout/container-height) header-height content-padding)}
            [:div (render) (component-pager)])]
         (when has-toc?
           [:div.sticky.top-0.self-start.site-chrome
            {:data-ty-theme true
             :style {:max-height sidebar-max-h
                     :overflow-y "auto"
                     :scrollbar-width "none"}}
            (if (:spy? toc)
              (docs-common/on-this-page)
              (right-sidebar toc))])]]])))

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
  (redirect-legacy-guide!)

  (setup-keyboard-shortcuts!)

  ;; Watch router changes for scroll-to-top and re-render
  (add-watch router/*router* ::render
             (fn [_ _ old-state new-state]
               (when (not= (:current old-state) (:current new-state))
                 (let [all-routes (flatten-routes (concat site-routes component-routes guide-routes))
                       current-route (some #(when (router/rendered? (:id %) true) %) all-routes)]
                   (when (should-scroll-for-route? (:id current-route))
                     (js/setTimeout scroll-main-to-top! 100))))
               (redirect-legacy-guide!)
               (render-app!)))

  (add-watch state ::render
             (fn [_ _ _ _] (render-app!)))

  ;; "On this page" rail: sections are collected after the page renders.
  (add-watch docs-common/page-sections ::render
             (fn [_ _ _ _] (render-app!)))
  (add-watch docs-common/active-section ::render
             (fn [_ _ _ _] (render-app!)))

;; Watch window size changes for responsive layout (fixes sidebar toggle)
  (add-watch layout/window-size ::window-resize
             (fn [_ _ _ _] (render-app!)))

  (render-app!))
