(ns tyrell.router
  "Simple router for ty web components using zipper-based tree structure"
  (:require
   [cljs.pprint]
   [cljs.reader :refer [read-string]]
   [clojure.set :as set]
   [clojure.string :as str]
   [clojure.zip :as zip]))

(defonce ^:dynamic *roles* nil)
(defonce ^:dynamic *user* (atom nil))
(defonce ^:dynamic *permissions* nil)

;; Core router state
(defonce ^:dynamic *router*
  (atom {:tree {:id ::root
                :segment ""
                :children []}
         :current ""
         :base ""
         :known #{} ; Track registered components
         :unknown []})) ; Queue for components with missing parents

;; Zipper functions
(defn component-tree-zipper
  "Returns routing tree zipper"
  [root]
  (zip/zipper
   :children
   :children
   (fn [node children] (assoc node :children (vec children)))
   root))

(defn component->location
  "Find component by id in tree, return zipper location"
  [tree id]
  (let [z (component-tree-zipper tree)]
    (loop [p z]
      (if (zip/end? p)
        nil
        (let [{id' :id} (zip/node p)]
          (if (= id id')
            p
            (recur (zip/next p))))))))

(defn component-path
  "Build URL path from root to component, including hash fragment if present"
  [tree id]
  (when-let [location (component->location tree id)]
    (let [parents (zip/path location)
          {:keys [segment hash]} (zip/node location)
          segments (cond-> (mapv :segment parents)
                     (not-empty segment) (conj segment))
          path (str "/" (str/join "/" (remove empty? segments)))]
      ;; Append hash fragment if present
      (if (not-empty hash)
        (str path "#" hash)
        path))))

(defn set-component
  "Function used to add component to component tree.
  For given component tree add component by specifying
  component id and component parent."
  [tree {:keys [id parent]
         :as component}]
  (if (component->location tree id)
    (do
      (js/console.warn (str "Component " id " already set in component tree"))
      tree)
    (if-let [location (component->location tree parent)]
      (-> location
          (zip/append-child (-> component
                                (dissoc :parent)
                                (assoc :children [])))
          zip/root)
      (throw
       (ex-info "Couldn't find parent"
                {:component component
                 :parent parent
                 :tree tree})))))

;; Base path functions
(defn maybe-add-base
  "For given base and url will add base prefix
  if it exists to url. If base is nil than URL
  is returned"
  [base url]
  (if (empty? base)
    url
    (if (str/ends-with? base "/")
      (apply str base (rest url))
      (str "/" base url))))

(defn maybe-remove-base
  "For given base and url will return URL without
  base. If base is nil function will return URL
  immediately"
  [base url]
  (if (empty? base)
    url
    (as-> url url
      (if (str/ends-with? base "/")
        (subs url (count base))
        (subs url (inc (count base))))
      (if-not (str/starts-with? base "/")
        url
        (str "/" url)))))

;; Query params functions
(defn clj->query
  "Convert clojure map to URLSearchParams string"
  [data]
  (let [qp (js/URLSearchParams.)]
    (str
     (reduce-kv
      (fn [qp k v]
        (.append qp (name k) (pr-str v))
        qp)
      qp
      data))))

(defn query->clj
  "Convert URLSearchParams to clojure map"
  [qp]
  (zipmap
   (map keyword (.keys qp))
   (map read-string (.values qp))))

(defn query-params
  "Get current query parameters as a map"
  []
  (let [search (.-search js/location)
        qp (js/URLSearchParams. search)]
    (query->clj qp)))

(defn set-query!
  "Set query parameters. Action can be :replace (default) or :push"
  ([params] (set-query! params :replace))
  ([params action]
   (let [{:keys [current base]} @*router*
         updated (if (nil? params)
                   (maybe-add-base base current)
                   (str (maybe-add-base base current) "?" (clj->query params)))]
     (case action
       :push (.pushState js/history nil "" updated)
       :replace (.replaceState js/history nil "" updated))
     (swap! *router* assoc :query params))))

;; Path checking functions
(defn on-path?
  "For given path and component id function will get
  component path and check if given path starts with
  component path.
  
  If it does, than component is on path (true)"
  [tree path id]
  (when (some? path)
    (when-some [cp (component-path tree id)]
      (str/starts-with? path (first (str/split cp #"\#"))))))

(defn parse-url
  "Parse URL into path and hash components"
  [url]
  (when url
    (let [hash-idx (.indexOf url "#")]
      (if (= hash-idx -1)
        {:path url
         :hash nil}
        {:path (.substring url 0 hash-idx)
         :hash (.substring url (inc hash-idx))}))))

(defn exact-match?
  "Compare current URL with component path, including hash fragments"
  [tree current-url component-id]
  (when (some? current-url)
    (when-some [component-url (component-path tree component-id)]
      (let [current-parts (parse-url current-url)
            component-parts (parse-url component-url)]
        (and (= (:path current-parts) (:path component-parts))
             (= (:hash current-parts) (:hash component-parts)))))))

(defn url->components
  "Returns all components that are rendered for given URL"
  ([] (url->components
       (:tree @*router*) (:current @*router*)))
  ([url] (url->components (:tree @*router*) url))
  ([tree url]
   (loop [position (component-tree-zipper tree)
          result []]
     (if (zip/end? position)
       result
       (let [node (zip/node position)]
         (cond
           (nil? node) (recur (zip/next position) result)
           (on-path? tree url (:id node)) (recur (zip/next position) (conj result (dissoc node :children)))
           :else (recur (zip/next position) result)))))))

;; Internal add-components implementation
(defn- add-components
  "Add components to router state with proper tracking"
  [{:keys [known tree unknown]
    :as state} parent components]
  (let [children (if (map? components) [components] components)]
    (if-let [to-register (not-empty (remove (comp known :id) children))]
      (-> state
          (as-> _state
                (reduce
                 (fn [{:keys [tree]
                       :as state} {:keys [id children]
                                   :as component}]
                   (let [component (assoc component :parent parent)]
                     (try
                       (let [tree' (set-component tree component)]
                         (cond-> state
                           true (assoc :tree tree')
                           true (update :known (fnil conj #{}) id)
                           (seq children) (add-components id children)))
                       (catch js/Error _
                         (update state :unknown
                                 (fn [components]
                                   (vec
                                    (distinct
                                     ((fnil conj []) components component)))))))))
                 _state
                 to-register))
          ;; Try to link unknowns
          (as-> _state
                (loop [state _state
                       last-unknown-count (count (:unknown _state))]
                  (let [new-state (reduce
                                   (fn [{:keys [tree]
                                         :as state} {:keys [id children]
                                                     :as component}]
                                     (try
                                       (let [tree' (set-component tree component)]
                                         (-> state
                                             (assoc :tree tree')
                                             (update :unknown #(vec (remove #{component} %)))
                                             (update :known (fnil conj #{}) id)
                                             (as-> s
                                                   (if (seq children)
                                                     (add-components s id children)
                                                     s))))
                                       (catch js/Error _
                                         state)))
                                   state
                                   (:unknown state))
                        new-unknown-count (count (:unknown new-state))]
                    (if (or (zero? new-unknown-count)
                            (= new-unknown-count last-unknown-count))
                      new-state
                      (recur new-state new-unknown-count))))))
      state)))

;; Public API
(defn link
  "Add component(s) to router tree under parent.
  Parent should be a component id.
  Children can be a single component map or a vector of component maps."
  [parent children]
  (swap! *router* add-components parent children))

(defn rendered?
  "Check if component is on current path"
  ([component-id] (rendered? component-id false))
  ([component-id exact?]
   (let [{:keys [tree current]} @*router*]
     ((if exact? exact-match? on-path?) tree current component-id))))

(defn authorized?
  "Check if user can access component"
  [component-id]
  (let [{:keys [tree]} @*router*]
    (if-let [loc (component->location tree component-id)]
      (let [{:keys [roles permissions]} (zip/node loc)]
        (or (and (empty? roles) (empty? permissions))
            (not-empty (set/intersection roles *roles*))
            (not-empty (set/intersection permissions *permissions*))))
      true))) ; If component not found, allow access

(defn navigate!
  "Navigate to a route by id with optional query params"
  ([route-id] (navigate! route-id nil))
  ([route-id params]
   (let [{:keys [tree base]} @*router*
         component-url (component-path tree route-id)
         url (maybe-add-base base component-url)
         query (when params (str "?" (clj->query params)))
         full-url (str url query)]
     (when component-url
       (.pushState js/history nil "" full-url)
       ;; Store the component URL (with hash) in router state
       (swap! *router* assoc :current component-url)

       ;; Handle scrolling to fragment if present
       (when-let [url-parts (parse-url component-url)]
         (when-let [hash (:hash url-parts)]
           (when (not-empty hash)
             ;; Use setTimeout to ensure DOM is ready after route change
             (js/setTimeout
              (fn []
                (when-let [element (.getElementById js/document hash)]
                  (.scrollIntoView element #js {:behavior "smooth"})))
              100))))))))

;; Landing functionality
(defn- find-landing-candidates
  "Find all components with :landing property that user can access,
  sorted by priority (highest first)"
  []
  (let [{:keys [tree]} @*router*
        candidates (volatile! [])]
    ;; Collect all components with :landing
    (loop [position (component-tree-zipper tree)]
      (if (zip/end? position)
        ;; Filter by authorization and sort by priority
        (->> @candidates
             (filter #(authorized? (:id %)))
             (sort-by :landing >)
             vec)
        (let [{:keys [landing]
               :as node} (zip/node position)]
          (when landing
            (vswap! candidates conj (dissoc node :children)))
          (recur (zip/next position)))))))

(defn handle-landing!
  "Check if current location should trigger landing redirect.
  Always runs - redirects to best available route for 404s or auth failures."
  []
  (let [{:keys [tree current base]} @*router*
        [best :as candidates] (find-landing-candidates)
        current-components (remove (comp (partial = ::root) :id) (url->components tree current))
        every-authorized? (every? (comp authorized? :id) current-components)]
    (cond
      (empty? current-components) (navigate! (:id best))
      (not every-authorized?) (navigate! (:id best))
      :else nil)))

(defn get-current-url
  "Get current full URL including hash"
  []
  (str (.-pathname js/location) (.-hash js/location)))

(defn update-router-from-browser!
  "Update router state from current browser URL"
  [base]
  (let [pathname (.-pathname js/location)
        hash (.-hash js/location)
        clean-path (maybe-remove-base base pathname)
        full-url (str clean-path hash)]
    (swap! *router* assoc :current full-url)
    ;; Always check for landing redirect after navigation
    (handle-landing!)))

(defn init!
  "Initialize router with browser events and smart landing redirects"
  ([] (init! ""))
  ([base]
   ;; Set base path
   (swap! *router* assoc :base base)

   ;; Set initial URL (including hash) and check for landing redirect
   (update-router-from-browser! base)

   ;; Handle initial fragment scroll if URL has hash
   (when-let [hash (.-hash js/location)]
     (when (not-empty hash)
       (let [hash-id (.substring hash 1)] ;; Remove leading #
         ;; Delay to ensure DOM is fully rendered after initial load
         (js/setTimeout
          (fn []
            (when-let [element (.getElementById js/document hash-id)]
              (.scrollIntoView element #js {:behavior "smooth"})))
          200))))

   ;; Listen to browser navigation (back/forward)
   (.addEventListener js/window "popstate"
                      (fn [_]
                        (update-router-from-browser! base)))

   ;; Listen to hash changes
   (.addEventListener js/window "hashchange"
                      (fn [_]
                        (update-router-from-browser! base)))))

(defn landing-candidates
  "Get current landing candidates for debugging"
  []
  (find-landing-candidates))
