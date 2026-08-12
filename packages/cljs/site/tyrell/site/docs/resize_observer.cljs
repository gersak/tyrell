(ns tyrell.site.docs.resize-observer
  "Documentation for ty-resize-observer component"
  (:require [tyrell.site.docs.common :refer [code-block attribute-table
                                             doc-section docs-page component-header section-label]]))

(defn view []
  (docs-page
   (component-header "ty-resize-observer"
                     "Self-observing element that tracks its own dimensions in a global registry with debounce support. Used internally for responsive layouts — subscribe via the JS module API, not DOM events.")

   [:div.ty-elevated.rounded-lg.p-6
    [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
     [:h2.scroll-mt-6
      {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
      [:span.ty-text-- "API Reference"]]]

    [:div.mb-6
     (section-label "Attributes")
     (attribute-table
      [{:name "id"
        :type "string"
        :required true
        :default "-"
        :description "Unique identifier — required to query or subscribe to this element's size in the registry"}
       {:name "debounce"
        :type "number"
        :default "0"
        :description "Milliseconds to debounce resize callbacks — reduces update frequency for expensive operations"}])]

    [:div
     (section-label "JavaScript API")
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.5rem 0"}}
      [:div.flex.items-start.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600" :white-space "nowrap"}} "getSize(id)"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Returns " [:code "{width, height}"] " for the element with the given id — synchronous snapshot"]]]
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.5rem 0"}}
      [:div.flex.items-start.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600" :white-space "nowrap"}} "onResize(id, fn)"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Subscribe to size changes — calls " [:code "fn({width, height})"] " on each resize. Returns an unsubscribe function"]]]
     [:div {:style {:padding "0.5rem 0"}}
      [:div.flex.items-start.gap-3
       [:code.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600" :white-space "nowrap"}} "getAllSizes()"]
       [:span.ty-text- {:style {:font-size "0.8125rem"}} "Returns all registered sizes as an object — useful for debugging"]]]]]

   (doc-section "Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "One-Time Size Query")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use " [:code "getSize(id)"] " for a synchronous snapshot — useful after mount when you just need current dimensions once."]
       (code-block "import { getSize } from 'tyrell-components';

const size = getSize('my-container');
console.log(size); // { width: 480, height: 320 }" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Reactive Subscription")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use " [:code "onResize(id, fn)"] " to subscribe to changes. The callback fires whenever the element resizes. Always call the returned unsubscribe function on cleanup."]
       (code-block "<ty-resize-observer id=\"sidebar\">
  <aside>...</aside>
</ty-resize-observer>

<script type=\"module\">
import { onResize } from 'tyrell-components';

// Subscribe — fires on every resize
const unsubscribe = onResize('sidebar', ({ width, height }) => {
  sidebar.classList.toggle('compact', width < 200);
});

// Clean up when done
// unsubscribe();
</script>" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Debounced for Expensive Operations")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Set " [:code "debounce"] " to limit how often callbacks fire during active resizing — ideal for API calls, chart re-renders, or layout recalculations."]
       (code-block "<ty-resize-observer id=\"chart-area\" debounce=\"300\">
  <canvas id=\"chart\"></canvas>
</ty-resize-observer>

<script type=\"module\">
import { onResize } from 'tyrell-components';

// Fires at most once per 300ms pause in resizing
onResize('chart-area', ({ width, height }) => {
  rerenderChart(width, height); // expensive operation
});
</script>" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "Window API (CDN / Script Tag)")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "When using the CDN bundle, the registry is available at " [:code "window.tyResizeObserver"] "."]
       (code-block "<!-- No import needed with the CDN bundle -->
<ty-resize-observer id=\"panel\">
  <div>...</div>
</ty-resize-observer>

<script>
// One-time query
const size = window.tyResizeObserver.getSize('panel');

// Subscribe
const unsub = window.tyResizeObserver.onResize('panel', (size) => {
  console.log(size.width, size.height);
});

// Debug all registered sizes
console.log(window.tyResizeObserver.getAllSizes());
</script>")]])

   (doc-section "Advanced Examples"
     [:div.space-y-6

      [:div.ty-content.rounded-lg.p-5
       (section-label "Container-Based Responsive Layout")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Unlike CSS media queries (window width), ty-resize-observer tracks the " [:em "element's"] " own width — independent of the viewport. Useful for components that live in resizable sidebars or panels."]
       (code-block "<ty-resize-observer id=\"data-grid\">
  <div id=\"grid\">...</div>
</ty-resize-observer>

<script type=\"module\">
import { onResize } from 'tyrell-components';

onResize('data-grid', ({ width }) => {
  const grid = document.getElementById('grid');
  // Adjust columns based on the component's own width
  const cols = width >= 800 ? 4 : width >= 500 ? 2 : 1;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
});
</script>" "javascript")]

      [:div.ty-content.rounded-lg.p-5
       (section-label "ClojureScript / Replicant")
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height "1.6"}}
        "Use " [:code "replicant/on-mount"] " and " [:code "replicant/on-unmount"] " lifecycle hooks to wire subscriptions. Store the unsubscribe function on the element for cleanup."]
       (code-block ";; Component that subscribes on mount, cleans up on unmount
[:ty-resize-observer {:id \"my-panel\"
                      :replicant/on-mount
                      (fn [{^js el :replicant/node}]
                        (when js/window.tyResizeObserver
                          (let [unsub (js/window.tyResizeObserver.onResize
                                        \"my-panel\"
                                        (fn [size]
                                          (reset! panel-width (.-width size))))]
                            (set! (.-_unsub el) unsub))))
                      :replicant/on-unmount
                      (fn [{^js el :replicant/node}]
                        (when-let [unsub (.-_unsub el)]
                          (unsub)
                          (set! (.-_unsub el) nil)))}
 [:div ...panel content...]]")]])
))
