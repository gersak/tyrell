(ns tyrell.shim
  "Thin CLJS wrapper over wc-shim.js so you don't touch classes or js*.
   Provides helpers for attributes, props, shadow DOM, and hot reload support."
  (:require ["./shim.js" :as shim]
            [cljs-bean.core :refer [->js ->clj]]
            [cljs.reader :as edn]
            [clojure.string :as str]))

;; -----------------------------
;; Hot Reload Support
;; -----------------------------

(defonce ^:private component-registry (atom {}))
(defonce ^:private component-renderers (atom {}))

(defn- get-all-instances
  "Get all instances of a custom element in the document"
  [tag-name]
  (js/document.querySelectorAll tag-name))

(defn- refresh-instances!
  "Refresh all instances of a component by calling their render function"
  [tag-name]
  (when-let [render-fn (get @component-renderers tag-name)]
    (let [instances (get-all-instances tag-name)]
      (.forEach instances render-fn))))

;; -----------------------------
;; Attribute parsing helpers
;; -----------------------------

(defn attr
  "Get raw attribute from element."
  [^js el k]
  (.getAttribute el (name k)))

(defn set-attr!
  "Set attribute (string)."
  [^js el k v]
  (.setAttribute el (name k) (str v))
  el)

(defn rm-attr!
  [^js el k]
  (.removeAttribute el (name k))
  el)

(defn parse-int-attr [el k]
  (some-> (attr el k) js/parseInt))

(defn parse-float-attr [el k]
  (some-> (attr el k) js/parseFloat))

(defn parse-bool-attr
  "Boolean attribute semantics: presence -> true, explicit 'false' -> false."
  [el k]
  (let [v (attr el k)]
    (cond
      (nil? v) nil
      (= "false" (str/lower-case v)) false
      (false? v) false
      :else true)))

(defn parse-json-attr [el k]
  (when-let [v (attr el k)]
    (-> v js/JSON.parse (->clj :keywordize-keys true))))

(defn parse-edn-attr [el k]
  (when-let [v (attr el k)]
    (edn/read-string v)))

;; -----------------------------
;; Shadow DOM helpers
;; -----------------------------

(defn ensure-shadow
  ([^js el] (ensure-shadow el "open"))
  ([^js el mode] (shim/ensureShadow el mode)))

(defn set-shadow-html!
  [^js el html]
  (shim/setShadowHTML el (or html "")))

;; -----------------------------
;; Props helpers (property-based API)
;; -----------------------------

(defn set-props!
  "Batch set props (EDN map). Triggers per-key prop hook."
  [^js el m]
  (let [js-props (reduce-kv
                   (fn [r k v]
                     (aset r (name k) v)
                     r)
                   #js {}
                   m)]
    (shim/setProps el js-props))
  el)

(defn get-props
  "Return current props as CLJS map."
  [^js el]
  (let [p (.-_props el)]
    (reduce
      (fn [r k]
        (assoc r (keyword k) (aget p k)))
      {}
      (js/Object.keys p))))

;; -----------------------------
;; Hooks adapter
;; -----------------------------

(defn ^:private ->hooks
  "Build hooks object for wc-shim.js from a CLJS map:
   {:observed [..attr names..]        ;; optional
    :props    {:count nil ...}        ;; optional prop accessors (keys only matter)
    :form-associated true             ;; optional form participation
    :construct (fn [el] ...)
    :connected (fn [el] ...)
    :disconnected (fn [el] ...)
    :adopted (fn [el old-doc new-doc] ...)
    :attr (fn [el name old new] ...)
    :prop (fn [el k old new] ...)}"
  [{:keys [observed props form-associated construct connected disconnected adopted attr prop]}]

  (let [^js result #js {:observed (when observed
                                  ;; Force conversion to real JS array to prevent
                                  ;; Closure Compiler from optimizing away lazy sequence
                                    (into-array (map name observed)))
                        :props (when props (->js (zipmap (map name (keys props)) (repeat true))))
                        :formAssociated form-associated
                        :construct (when construct (fn [el] (construct el)))
                        :connected (when connected (fn [el] (connected el)))
                        :disconnected (when disconnected (fn [el] (disconnected el)))
                        :adopted (when adopted (fn [el od nd] (adopted el od nd)))
                        :attr (when attr (fn [el n o v] (attr el (keyword n) o v)))
                        :prop (when prop (fn [el k o v] (prop el (keyword k) o v)))}]
    result))

;; -----------------------------
;; Development helpers
;; -----------------------------

(defn get-initial-attrs
  "Extract initial-only attributes on first render - React compatible.
   
   Reads attributes from the element once (on first call) and parses them
   using the provided attribute map. Subsequent calls return nil.
   
   This pattern is ideal for 'initial view' parameters that should only
   be applied once on component initialization, preventing conflicts 
   with user interactions or React re-renders.
   
   Usage:
   (let [initial (get-initial-attrs el {:view-year js/parseInt
                                        :view-month js/parseInt
                                        :min-date date/parse-value})]
     (when (seq initial)
       (apply-initial-state! el initial)))
   
   Arguments:
   - el: The web component element
   - attr-map: Map of attribute keywords to parser functions
   
   Returns:
   - Map of parsed attribute values (first call only)
   - nil on subsequent calls"
  [^js el attr-map]
  (when-not (.-tyInitialAttrsRead el)
    (set! (.-tyInitialAttrsRead el) true)
    (reduce-kv
      (fn [acc attr-key parse-fn]
        (when-let [attr-val (attr el (name attr-key))]
          (try
            (assoc acc attr-key (parse-fn attr-val))
            (catch js/Error e
              (js/console.warn (str "Failed to parse initial attribute "
                                    (name attr-key) "=" attr-val ": " (.-message e)))
              acc))))
      {}
      attr-map)))

(defn ^:dev/after-load reload-all-components!
  "Force refresh all registered components after hot reload"
  []
  (when goog.DEBUG
    (doseq [[tag-name _] @component-registry]
      (js/console.log (str "[Ty] Refreshing: " tag-name))
      (refresh-instances! tag-name))))

 ;; Add to shim.cljs - new batching functions

(defn- get-batch-queue [^js el]
  (or (.-tyAttrBatch el)
      (set! (.-tyAttrBatch el) #js {:changes #js {}
                                    :scheduled false})))

(defn- get-unified-batch-queue [^js el]
  "Get or create unified batch queue for both attributes and properties"
  (or (.-tyUnifiedBatch el)
      (set! (.-tyUnifiedBatch el) {:attr-changes {}
                                   :prop-changes {}
                                   :scheduled false})))

(defn- flush-unified-batch! [^js el batch-attr-fn batch-prop-fn]
  "Flush both attribute and property batches"
  (let [batch (.-tyUnifiedBatch el)]
    (when batch
      ;; Flush attributes if any and callback provided
      (when (and batch-attr-fn (seq (:attr-changes batch)))
        (batch-attr-fn el (:attr-changes batch)))

      ;; Flush properties if any and callback provided  
      (when (and batch-prop-fn (seq (:prop-changes batch)))
        (batch-prop-fn el (:prop-changes batch)))

      ;; Clear the batch
      (set! (.-tyUnifiedBatch el) {:attr-changes {}
                                   :prop-changes {}
                                   :scheduled false}))))

(defn- schedule-unified-batch-flush! [^js el batch-attr-fn batch-prop-fn]
  "Schedule unified batch flush if not already scheduled"
  (let [batch (get-unified-batch-queue el)]
    (when-not (.-scheduled batch)
      (set! (.-scheduled batch) true)
      (js/requestAnimationFrame
        #(flush-unified-batch! el batch-attr-fn batch-prop-fn)))))

(defn- flush-attribute-batch! [^js el batch-callback]
  (let [batch (.-tyAttrBatch el)]
    (when (and batch (> (.-length (js/Object.keys (.-changes batch))) 0))
      ;; Call the batch callback with all changes
      (batch-callback el (->clj (.-changes batch)))
      ;; Clear the batch
      (set! (.-changes batch) #js {})
      (set! (.-scheduled batch) false))))

(defn- schedule-batch-flush! [^js el batch-callback]
  (let [batch (get-batch-queue el)]
    (when-not (.-scheduled batch)
      (set! (.-scheduled batch) true)
      (js/requestAnimationFrame
        #(flush-attribute-batch! el batch-callback)))))

;; -----------------------------
;; Public API with Hot Reload Support
;; -----------------------------

(defn define!
  "Define a Custom Element with batched attribute/property updates by default.
   
   New batched API:
   :attr (fn [el delta] ...)  ; delta = {'attr-name' 'new-value' ...}
   :prop (fn [el delta] ...)  ; delta = {'prop-name' new-value ...}
   
   Batching happens automatically using requestAnimationFrame.
   Multiple rapid changes are collected and delivered as a single delta.
   
   tag  - string tag name, e.g. \"x-counter\"
   opts - hooks/options map with batched callbacks
   
   Returns the constructor (for completeness), but you rarely need it."
  [tag opts]

  (let [already-defined? (.get js/window.customElements tag)
        ;; Extract batched callbacks
        batch-attr-fn (:attr opts)
        batch-prop-fn (:prop opts)]

;; Create modified opts with individual hooks that batch
    (let [batched-opts (-> opts
                           (dissoc :attr :prop)
                           (cond->
                             batch-attr-fn
                             (assoc :attr
                               (fn [^js el attr-name old-value new-value]
                                 ;; Add to attribute batch
                                 (let [batch (get-unified-batch-queue el)]
                                   (set! (.-tyUnifiedBatch el)
                                         (update batch :attr-changes assoc (name attr-name) new-value)))
                                 ;; Schedule unified batch flush
                                 (schedule-unified-batch-flush! el batch-attr-fn batch-prop-fn)))

                             batch-prop-fn
                             (assoc :prop
                               (fn [^js el prop-name old-value new-value]
                                 ;; Add to property batch
                                 (let [batch (get-unified-batch-queue el)]
                                   (set! (.-tyUnifiedBatch el)
                                         (update batch :prop-changes assoc (name prop-name) new-value)))
                                 ;; Schedule unified batch flush
                                 (schedule-unified-batch-flush! el batch-attr-fn batch-prop-fn)))))]

      (cond
        ;; In production or first definition - define with batching
        (or (not goog.DEBUG) (not already-defined?))
        (do
          (let [constructor (shim/define tag (->hooks batched-opts))]
            ;; Store in registry for hot reload
            (swap! component-registry assoc tag opts)
            ;; Store render function if connected hook exists
            (when-let [connected (:connected opts)]
              (swap! component-renderers assoc tag connected))
            constructor))
        ;; In development and already defined - update and refresh
        :else
        (do
          ;; Update registry with new implementation
          (swap! component-registry assoc tag opts)
          ;; Update render function
          (when-let [connected (:connected opts)]
            (swap! component-renderers assoc tag connected))
          ;; Refresh all existing instances
          (js/console.log (str "[Ty] Hot reloading component: " tag))
          (refresh-instances! tag)
          ;; Return the existing constructor
          (.get js/window.customElements tag))))))
