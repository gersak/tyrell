(ns tyrell.site.docs.common
  "Common utilities for component documentation"
  (:require
   [clojure.string :as str]
   [goog.object]
   [tyrell.layout :as layout]))

(defn add-code-enhancements!
  "Add copy button and language label to a highlighted code element"
  [^js code-el lang]
  (when-let [container (.-parentElement code-el)]
    (set! (.. container -style -position) "relative")

    (when (and lang (not= lang "hljs") (not= lang "code"))
      (let [label (.createElement js/document "div")]
        (set! (.-textContent label) lang)
        (set! (.-cssText (.-style label))
              "position: absolute; top: 0.5rem; right: 3rem; font-size: 0.75rem;
               color: var(--ty-text--); background: var(--ty-surface-content);
               padding: 0.25rem 0.5rem; border-radius: 4px;
               border: 1px solid var(--ty-border-soft); pointer-events: none; z-index: 10;")
        (.appendChild container label)))

    (let [copy-btn (.createElement js/document "button")]
      (set! (.-innerHTML copy-btn) "<ty-icon name=\"copy\" size=\"sm\"></ty-icon>")
      (set! (.-title copy-btn) "Copy to clipboard")
      (set! (.-cssText (.-style copy-btn))
            "position: absolute; top: 0.5rem; right: 0.5rem; width: 2rem; height: 2rem;
             background: var(--ty-surface-elevated); border: 1px solid var(--ty-border);
             border-radius: 4px; cursor: pointer; opacity: 0.7;
             transition: opacity 0.2s, background-color 0.2s;
             display: flex; align-items: center; justify-content: center; padding: 0; z-index: 10;")

      (.addEventListener copy-btn "click"
                         (fn [e]
                           (.preventDefault e)
                           (.stopPropagation e)
                           (let [code-text (.-textContent code-el)]
                             (-> (js/navigator.clipboard.writeText code-text)
                                 (.then (fn []
                                          (set! (.-innerHTML copy-btn) "<ty-icon name=\"check\" size=\"sm\" class=\"ty-text-success\"></ty-icon>")
                                          (set! (.. copy-btn -style -backgroundColor) "var(--ty-bg-success-)")
                                          (js/setTimeout #(do (set! (.-innerHTML copy-btn) "<ty-icon name=\"copy\" size=\"sm\"></ty-icon>")
                                                              (set! (.. copy-btn -style -backgroundColor) "var(--ty-surface-elevated)"))
                                                         2000)))
                                 (.catch (fn [err]
                                           (js/console.error "Failed to copy code:" err)
                                           (set! (.-innerHTML copy-btn) "<ty-icon name=\"x\" size=\"sm\" class=\"ty-text-danger\"></ty-icon>")
                                           (set! (.. copy-btn -style -backgroundColor) "var(--ty-bg-danger-)")
                                           (js/setTimeout #(do (set! (.-innerHTML copy-btn) "<ty-icon name=\"copy\" size=\"sm\"></ty-icon>")
                                                               (set! (.. copy-btn -style -backgroundColor) "var(--ty-surface-elevated)"))
                                                          2000)))))))

      (.addEventListener copy-btn "mouseenter"
                         #(do (set! (.. copy-btn -style -opacity) "1")
                              (set! (.. copy-btn -style -backgroundColor) "var(--ty-surface-floating)")))
      (.addEventListener copy-btn "mouseleave"
                         #(do (set! (.. copy-btn -style -opacity) "0.7")
                              (set! (.. copy-btn -style -backgroundColor) "var(--ty-surface-elevated)")))
      (.appendChild container copy-btn))))

(defn code-block
  ([code] (code-block code "html"))
  ([code lang]
   [:div.rounded-md.overflow-x-auto.my-4
    [:pre
     [:code.text-xs
      {:replicant/on-render (fn [{^js el :replicant/node}]
                              (when (and el js/window.hljs (.-highlight js/window.hljs)
                                         (not= (.. el -dataset -code) code))
                                (set! (.. el -dataset -code) code)
                                (try
                                  (let [result (.highlight js/window.hljs code #js {:language lang})]
                                    (set! (.-innerHTML el) (.-value result))
                                    (set! (.-className el) "text-xs hljs")
                                    (.add (.-classList el) (str "language-" lang)))
                                  (add-code-enhancements! el lang)
                                  (catch js/Error e
                                    (js/console.warn "Failed to highlight code block:" e)))))}]]]))

(defn- type-badge [t]
  (let [[bg fg] (case t
                  "boolean"  ["ty-bg-primary-"    "ty-text-primary+"]
                  "number"   ["ty-bg-primary-"   "ty-text-primary+"]
                  "function" ["ty-bg-primary-" "ty-text-primary+"]
                  nil)]
    (if bg
      [:span {:class [bg fg "text-xs" "font-mono" "rounded" "px-1" "py-px"]} t]
      [:span.text-xs.font-mono.ty-text-- t])))

(defn attribute-table [attributes]
  [:div
   (for [{:keys [name type default description required]} attributes]
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.625rem 0"}}
      [:div.flex.flex-wrap.items-center.gap-2 {:style {:margin-bottom "0.25rem"}}
       [:code.font-mono.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} name]
       (type-badge type)
       (when (and default (not= default "-"))
         [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} (str "= " default)])
       (when required
         [:span.ty-bg-danger.ty-text-danger++.rounded {:style {:font-size "0.6875rem" :padding "1px 5px"}} "req"])]
      [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}} description]])])

(defn event-table [events]
  [:div
   (for [{:keys [name payload when-fired]} events]
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.625rem 0"}}
      [:div.flex.flex-wrap.items-center.gap-2 {:style {:margin-bottom "0.25rem"}}
       [:code.font-mono.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600"}} name]
       (when payload
         [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} payload])]
      [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}} when-fired]])])

(defn slot-table [slots]
  [:div
   (for [{:keys [name description]} slots]
     [:div {:style {:border-bottom "1px solid var(--ty-border-soft)" :padding "0.625rem 0"}}
      [:code.font-mono.ty-text+ {:style {:font-size "0.8125rem" :font-weight "600" :display "block" :margin-bottom "0.25rem"}} name]
      [:p.ty-text- {:style {:font-size "0.8125rem" :line-height "1.6"}} description]])])

(defn section-label [text]
  [:div {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em"
                 :text-transform "uppercase" :margin-bottom "0.625rem"}}
   [:span.ty-text-- text]])

(defn demo-area [& children]
  (into [:div.rounded-lg
         {:style {:background-image "radial-gradient(circle, var(--ty-border-soft) 1px, transparent 1px)"
                  :background-size "20px 20px"
                  :background-color "var(--ty-surface-elevated)"
                  :padding "1rem"
                  :margin-bottom "0.75rem"}}]
        children))

(defn example-section
  ([title demo code] (example-section title demo code "html"))
  ([title demo code language]
   [:div
    (section-label title)
    (demo-area demo)
    (code-block code language)]))

(defn slugify [text]
  (-> text
      str
      str/lower-case
      (str/replace #"[^\w\s-]" "")
      (str/replace #"\s+" "-")
      (str/replace #"-+" "-")
      str/trim))

(defn doc-section
  ([title content] (doc-section title nil content))
  ([title id content]
   (let [section-id (or id (slugify title))]
     [:section.mb-10 {:id section-id}
      [:div.mb-5 {:style {:border-left "2px solid var(--ty-border-primary)" :padding-left "0.625rem"}}
       [:h2.scroll-mt-6
        {:style {:font-size "0.6875rem" :font-weight "600" :letter-spacing "0.1em" :text-transform "uppercase"}}
        [:span.ty-text-- title]]]
      content])))

(defonce page-sections (atom []))

(defn docs-page [& children]
  (let [is-desktop? (layout/breakpoint>= :lg)]
    (into [:div.max-w-4xl.mx-auto.space-y-8
           {:style {:padding (if is-desktop? "24px" "8px 12px")}
            :replicant/on-render
            (fn [{^js node :replicant/node}]
              (when node
                (let [sections (->> (array-seq (.querySelectorAll node "h2"))
                                    (keep (fn [^js h]
                                            (let [text (str/trim (.-textContent h))
                                                  id   (or (not-empty (.-id h)) (slugify text))]
                                              (set! (.-id h) id)
                                              (when (not-empty text)
                                                {:anchor id :label text}))))
                                    vec)]
                  (reset! page-sections sections))))}]
          children)))

(defn component-header [tag-name description]
  [:div
   [:div.font-mono
    {:style {:font-size "1.125rem" :font-weight "600" :letter-spacing "-0.02em" :margin-bottom "0.375rem"}}
    [:span.ty-text-- "<"]
    [:span.ty-text+ tag-name]
    [:span.ty-text-- " />"]]
   [:p.ty-text- {:style {:font-size "0.875rem" :line-height "1.6" :max-width "36rem"}} description]])

(defn placeholder-view [component-name]
  (docs-page
   (component-header (str "ty-" component-name) "Documentation for this component is being expanded.")
   [:div.ty-elevated.rounded-lg.p-6
    [:p.ty-text- "In the meantime, try the component in the live examples or check the source on GitHub."]
    [:div.mt-4.flex.gap-3
     [:button.ty-bg-primary.ty-text++.px-4.py-2.rounded.hover:opacity-90
      {:on {:click #(js/window.open "https://github.com/gersak/tyrell" "_blank")}}
      "View Source"]]]))

(defn guide-placeholder-view [guide-name guide-description]
  (docs-page
   (component-header guide-name guide-description)
   [:div.ty-elevated.rounded-lg.p-6
    [:p.ty-text-.mb-4 "This guide is being expanded. In the meantime:"]
    [:ul.text-left.space-y-2.ml-4
     [:li.ty-text- "• Explore the component documentation for available features"]
     [:li.ty-text- "• Check out the CSS System guide for styling best practices"]
     [:li.ty-text- "• Review examples in the repository"]]
    [:div.flex.gap-4.justify-center.mt-6
     [:button.ty-bg-primary.ty-text++.px-4.py-2.rounded.hover:opacity-90
      {:on {:click #(js/window.open "https://github.com/gersak/tyrell" "_blank")}}
      "View Repository"]
     [:button.ty-bg-neutral.ty-text++.px-4.py-2.rounded.hover:opacity-90
      {:on {:click #(-> js/window .-location .-href (set! "/docs/css"))}}
      "CSS System Guide"]]]))
