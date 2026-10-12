(ns tyrell.site.docs.resize-observer
  "Documentation for ty-resize-observer component"
  (:require [tyrell.site.docs.common :refer [component-page page-section playground
                                             bento example api-section]]
            [tyrell.site.state :as state]))

(defn- doc-state [k] (get-in @state/state [:resize-doc k]))
(defn- set-doc! [k v] (swap! state/state assoc-in [:resize-doc k] v))

(defn- watch!
  "Subscribe to the registry for id, keep the latest size in state under k.
   Returns the unsubscribe fn so on-unmount can call it."
  [id k]
  (when-let [^js api (.-tyResizeObserver js/window)]
    (.onResize api id (fn [^js s] (set-doc! k {:w (js/Math.round (.-width s)) :h (js/Math.round (.-height s))})))))

(defn- subscribed
  "Replicant lifecycle: subscribe on mount, unsubscribe on unmount."
  [id k]
  {:replicant/on-mount (fn [{:replicant/keys [node]}]
                         (set! (.-__tyUnsub ^js node) (watch! id k)))
   :replicant/on-unmount (fn [{:replicant/keys [node]}]
                           (when-let [f (.-__tyUnsub ^js node)] (f)))})

(defn- breakpoint [w]
  (cond (nil? w) "—" (< w 320) "compact" (< w 520) "medium" :else "wide"))

(defn- snippets [{:keys [debounce]}]
  (let [d (when (not= debounce "0") (str " debounce=\"" debounce "\""))]
    [["html" "HTML" "html"
      (str "<ty-resize-observer id=\"panel\"" d ">\n  …\n</ty-resize-observer>\n\n"
           "<script>\n  tyResizeObserver.onResize('panel', ({ width, height }) => {\n"
           "    chart.resize(width, height);\n  });\n</script>")]
     ["react" "React" "javascript"
      (str "import { TyResizeObserver } from 'tyrell-react'\nimport { onResize } from 'tyrell-components'\n\n"
           "useEffect(() =>\n  onResize('panel', ({ width }) => setWidth(width)), []);\n\n"
           "<TyResizeObserver id=\"panel\"" d ">…</TyResizeObserver>")]
     ["reagent" "Reagent" "clojure"
      (str "(:require [tyrell.react :as ty])\n\n"
           "[:> ty/ResizeObserver {:id \"panel\"" (when d (str " :debounce " debounce)) "}\n chart]")]
     ["replicant" "Replicant" "clojure"
      (str "[:ty-resize-observer {:id \"panel\"" (when d (str " :debounce \"" debounce "\"")) "}\n chart]\n\n"
           ";; tyrell.layout reads the same registry:\n(layout/with-container \"panel\"\n  (layout/container-breakpoint))")]
     ;; no events: subscribe to the registry once and keep the size in a signal
     ["datastar" "Datastar" "html"
      (str "<ty-resize-observer id=\"panel\"" d "\n  data-signals=\"{panelWidth: 0, panelHeight: 0}\""
           "\n  data-init=\"tyResizeObserver.onResize('panel', (size) => {\n"
           "    $panelWidth = size.width\n    $panelHeight = size.height\n  })\">\n  …\n</ty-resize-observer>\n\n"
           "<span data-text=\"$panelWidth + ' × ' + $panelHeight\"></span>")]]))

(defn- render-playground [{:keys [debounce]}]
  (let [{:keys [w h]} (doc-state :play)]
    [:div.flex.flex-col.items-center.gap-3.w-full
     [:div.rounded-xl.border.ty-border.overflow-auto
      {:style {:resize "both" :width "340px" :height "160px" :min-width "140px" :min-height "80px" :max-width "100%"}}
      [:ty-resize-observer (merge {:id "doc-resize-play" :debounce debounce :style {:display "block" :height "100%"}}
                                  (subscribed "doc-resize-play" :play))
       [:div.flex.h-full.flex-col.items-center.justify-center.gap-1.p-4
        [:span.font-mono.text-2xl.font-semibold.ty-text++ (if w (str w " × " h) "drag ↘")]
        [:span.text-xs.ty-text- (str "breakpoint: " (breakpoint w))]]]]
     [:span.text-xs.ty-text-- "Drag the bottom-right corner."]]))

(defn view []
  (component-page
   {:title "Resize Observer"
    :group "Layout primitives"
    :tag "ty-resize-observer"
    :description "Measures itself and publishes the size under its id. Read it once, subscribe to changes, or let tyrell.layout pick a breakpoint from it. Container queries without CSS."
    :chips [["Registry by id" "layers"] ["Debounce" "zap"] ["TyResizeObserver (React)" "atom"]]
    :source "packages/core/src/components/resize-observer.ts"
    :mark "⤡"
    :demo [:div.flex.flex-col.gap-2 {:style {:width "300px"}}
           [:div.ty-floating.rounded-xl.p-4.flex.items-center.justify-between
            [:span.font-mono.text-lg.font-semibold.ty-text++ "640 × 360"]
            [:ty-tag {:flavor "primary-" :size "sm"} "wide"]]
           [:code.text-xs.ty-text- "getSize('panel') → {width: 640, height: 360}"]]}

   (playground
    {:id :resize
     :defaults {:debounce "0"}
     :controls [{:key :debounce :options ["0" "150" "400"]}]
     :sub "Resize the box; the numbers come from the registry. Try a debounce."
     :render render-playground
     :snippets snippets})

   (page-section
    {:title "Examples" :sub "Copy, paste, ship."}
    (bento
     (example
      {:title "Layout by container width"
       :span 4
       :description "Switch layout by the container's width, not the window's. The same card can live in a sidebar or a main column."
       :code "onResize('card', ({ width }) => {
  card.dataset.layout = width < 360 ? 'stack' : 'row';
});"}
      (let [{:keys [w]} (doc-state :card)
            stack? (and w (< w 360))]
        [:div.rounded-xl.border.ty-border-.overflow-auto.w-full
         {:style {:resize "horizontal" :min-width "200px" :max-width "100%"}}
         [:ty-resize-observer (merge {:id "doc-resize-card" :style {:display "block"}}
                                     (subscribed "doc-resize-card" :card))
          [:div.p-4.gap-4 {:class (if stack? ["flex" "flex-col"] ["flex" "items-center"])}
           [:span.flex.items-center.justify-center.rounded-xl.ty-bg-primary-.ty-text-primary.font-semibold
            {:style {:width "56px" :height "56px"}} "AL"]
           [:div.flex.flex-col.gap-1.text-sm
            [:span.font-semibold.ty-text++ "Ada Lovelace"]
            [:span.ty-text- "First programmer. Drag this card's right edge."]]
           [:span.text-xs.font-mono.ty-text-- {:class (when-not stack? ["ml-auto"])} (str (or w "…") "px · " (if stack? "stack" "row"))]]]]))

     (example
      {:title "Debounce"
       :span 2
       :description [:span [:code "debounce"] " (ms) waits for resizing to settle. Use it when the reaction is expensive, like redrawing a chart."]
       :code "<ty-resize-observer id=\"chart\"
  debounce=\"200\">"}
      [:p.text-sm.ty-text- "Set it in the playground above: at 400 the numbers update only after you stop dragging."])

     (example
      {:title "ClojureScript layout"
       :span 3
       :lang "clojure"
       :description [:span [:code "tyrell.layout"] " reads the same registry: breakpoints, orientation and density of a container."]
       :code "(require '[tyrell.layout :as layout])

(layout/with-container \"panel\"
  (case (layout/container-breakpoint)
    :xs (compact-view)
    (full-view)))"}
      [:p.text-sm.ty-text- "Wrap a subtree in with-container and read container-width, container-breakpoint or portrait? inside it."])

     (example
      {:title "Without a framework"
       :span 3
       :lang "javascript"
       :description [:span "The CDN bundle exposes the registry as " [:code "window.tyResizeObserver"] "."]
       :code "const size = tyResizeObserver.getSize('panel');
const stop = tyResizeObserver.onResize('panel', draw);
tyResizeObserver.getAllSizes();   // debugging
stop();"}
      [:p.text-sm.ty-text- "ES module users import the same functions: getSize, onResize, getAllSizes from tyrell-components."])))

   (api-section
    {:attributes [["id" "string" "Required. The key its size is published under. Renaming moves the entry."]
                  ["debounce" "number" "0" "Wait this many ms after the last resize before publishing."]]
     :properties [["getSize(id)" "(string) => {width, height} | undefined" "Current size, synchronously."]
                  ["onResize(id, fn)" "(string, fn) => unsubscribe" "Call fn on every published change."]
                  ["getAllSizes()" "() => Record<string, {width, height}>" "Every registered size."]]
     :slots [["(default)" "Content to measure. The element itself is what's observed."]]})))
