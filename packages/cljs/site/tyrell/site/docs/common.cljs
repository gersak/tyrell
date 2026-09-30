(ns tyrell.site.docs.common
  "Common utilities for component documentation"
  (:require
   [clojure.string :as str]
   [tyrell.layout :as layout]
   [tyrell.site.state :refer [state]]))

(defn keyed
  "Give rendered hiccup a replicant key. Replicant reads :replicant/key from
   the attribute map; ^{:key ...} metadata is silently ignored."
  [k [tag & more :as hiccup]]
  (if (map? (first more))
    (assoc-in hiccup [1 :replicant/key] k)
    (into [tag {:replicant/key k}] more)))

(defn slugify [text]
  (-> text
      str
      str/lower-case
      (str/replace #"[^\w\s-]" "")
      (str/replace #"\s+" "-")
      (str/replace #"-+" "-")
      str/trim))

(defonce page-sections (atom []))

(defn- collect-sections!
  "Index the page's h2/h3 headings for the \"On this page\" rail."
  [{^js node :replicant/node}]
  (when node
    (let [sections (->> (array-seq (.querySelectorAll node "h2, h3"))
                        (keep (fn [^js h]
                                (let [text (str/trim (.-textContent h))
                                      id   (or (not-empty (.-id h)) (slugify text))]
                                  (set! (.-id h) id)
                                  (when (not-empty text)
                                    {:anchor id
                                     :label text
                                     :level (if (= "H3" (.-tagName h)) 3 2)}))))
                        vec)]
      (when (not= sections @page-sections)
        (reset! page-sections sections)))))

(declare page-hook)

(def code-theme-css
  "Layout for code-view: keep lines unwrapped (so the gutter lines up) and drop
   the site's inline-code pill. Token colors come from the site's global hljs
   rules (index.html), which are tied to the theme's primary/success tokens."
  ".ty-code pre, .ty-code pre code { white-space: pre; word-break: normal; overflow: visible; }
.ty-code pre code { background: none; border: 0; padding: 0; border-radius: 0; font-size: inherit; color: inherit; }
.ty-code .lang-css .hljs-number, .ty-code .lang-css .hljs-built_in { color: inherit !important; }")

(def ^:private template-css
  "Section numbering (01, 02, ...) via a CSS counter, so page-section needs no
   index and the rail numbers (from page-sections order) match."
  (str code-theme-css "
.ty-doc { counter-reset: ty-doc-section; }
.ty-doc-section { counter-increment: ty-doc-section; }
.ty-doc-section > header h2::before {
  content: counter(ty-doc-section, decimal-leading-zero);
  font-family: ui-monospace, 'JetBrains Mono', SFMono-Regular, monospace;
  font-size: 0.8125rem; font-weight: 400; letter-spacing: 0;
  color: var(--ty-color-primary); margin-right: 0.875rem;
}"))

(def brand-inherit
  "For scoped [data-ty-theme].dark sections: keep the page's brand color
   instead of the dark block's own primary hue/chroma."
  {:--ty-primary-hue "inherit"
   :--ty-primary-chroma "inherit"})

(def brand-scope
  "Docs chrome (code, API, section numbers) in the Tyrell identity color.
   Live demos stay outside it so they follow the theme playground."
  {:data-ty-theme "" :class "site-chrome"})

(defn- surface
  "Surface token as a plain background. The ty-* surface classes set a full
   border !important, which draws a second ring inside bordered boxes."
  [token]
  {:background (str "var(--ty-surface-" token ")")})

(defn- line-count [code] (count (.split code "\n")))

(defn copy-button
  "Icon button that copies text and flashes a check."
  [text]
  [:button.inline-flex.items-center.justify-center.w-7.h-7.rounded-md.cursor-pointer.ty-text--.hover:ty-text++.transition-colors
   {:title "Copy"
    :on {:click (fn [^js e]
                  (let [^js btn (.-currentTarget e)
                        ^js icon (.querySelector btn "ty-icon")]
                    (-> (js/navigator.clipboard.writeText text)
                        (.then (fn []
                                 (.setAttribute icon "name" "check")
                                 (js/setTimeout #(.setAttribute icon "name" "copy") 1500))))))}}
   [:ty-icon {:name "copy" :size "xs"}]])

(defn- highlight
  "hljs HTML for code. CSS gets the same palette as HTML: the selector reads
   like a tag name, properties like attributes, values stay plain (hljs leaves
   custom-element selectors unmarked and paints hex values as numbers)."
  [code lang]
  (let [html (.-value (.highlight js/window.hljs code #js {:language lang}))]
    (if (= lang "css")
      (.replace html (js/RegExp. "^([^\\s<{][^{<]*?)(\\s*\\{)" "gm") "<span class=\"hljs-name\">$1</span>$2")
      html)))

(defn code-view
  "Highlighted code. Multi-line code gets a line-number gutter; compact code
   (narrow cards) drops it and shrinks."
  ([code lang] (code-view code lang nil))
  ([code lang {:keys [compact?]}]
   (let [lines (line-count code)]
     [:div.ty-code.flex.gap-5.py-4.font-mono.overflow-x-auto
      {:class (if compact? ["px-4" "leading-5"] ["px-5" "text-sm" "leading-6"])
       :style (when compact? {:font-size "0.72rem"})}
      (when (and (> lines 1) (not compact?))
        [:div.select-none.text-right.ty-text--
         (for [n (range 1 (inc lines))]
           [:div {:replicant/key n} n])])
      ;; Replicant owns the markup via :innerHTML. Rewriting innerHTML in a
      ;; hook destroyed the text node replicant tracked, desyncing its vdom and
      ;; freezing all later renders once the page changed under it.
      [:pre.flex-1.min-w-0.ty-text
       [:code {:class (str "lang-" lang)
               :innerHTML (if js/window.hljs
                            (highlight code lang)
                            (-> code (str/replace "&" "&amp;") (str/replace "<" "&lt;") (str/replace ">" "&gt;")))}]]])))

(defn code-tabs
  "Tabbed code window on a soft surface. snippets: [[id label lang code] ...].
   ty-tabs needs a fixed height, so it's sized from the longest snippet.
   :compact? matches compact code-view (no gutter, smaller type)."
  ([snippets] (code-tabs snippets nil))
  ([snippets {:keys [compact?] :as opts}]
   (let [lines (apply max (map #(line-count (nth % 3)) snippets))]
     [:div.ty-text.site-chrome.border-t.ty-border- {:data-ty-theme "" :style (surface "content")}
      [:ty-tabs {:width "100%" :height (str (if compact? (+ 76 (* 20 lines)) (+ 80 (* 24 lines))) "px")}
       (for [[id label lang code] snippets]
         [:ty-tab {:replicant/key id :id id :label label}
          (code-view code lang opts)])]])))

;; --- Sections, rail and scroll-spy -----------------------------------------

(defonce active-section
  ;; Anchor of the heading currently at the top of the scroll area.
  (atom nil))

(defn- scroll-parent
  "Nearest scrolling ancestor, or js/window."
  [^js el]
  (loop [^js n (.-parentElement el)]
    (cond
      (nil? n) js/window
      (#{"auto" "scroll"} (.-overflowY (js/getComputedStyle n))) n
      :else (recur (.-parentElement n)))))

(defn- spy!
  "Mark the last heading above the top edge (plus offset) as active. At the
   bottom of the page the last heading wins, even if it can't reach the top."
  [^js container]
  (let [window? (identical? container js/window)
        ^js scroller (if window? (.-documentElement js/document) container)
        top (+ 120 (if window? 0 (.-top (.getBoundingClientRect container))))
        at-bottom? (>= (+ (.-scrollTop scroller) (.-clientHeight scroller))
                       (- (.-scrollHeight scroller) 4))
        anchors (map :anchor @page-sections)
        current (if at-bottom?
                  (last anchors)
                  (reduce (fn [acc id]
                            (if-let [el (.getElementById js/document id)]
                              (if (<= (.-top (.getBoundingClientRect el)) top) id (reduced acc))
                              acc))
                          (first anchors)
                          anchors))]
    (when (not= current @active-section)
      (reset! active-section current))))

(defn- page-hook
  "on-render for docs pages: index headings, and run scroll-spy while the page
   is mounted. Listens for scroll in the capture phase on document, so it
   doesn't matter which ancestor scrolls or whether it exists yet at mount."
  [{^js node :replicant/node life :replicant/life-cycle :as data}]
  (collect-sections! data)
  (case life
    :replicant.life-cycle/mount
    (let [on-scroll #(js/requestAnimationFrame (fn [] (spy! (scroll-parent node))))]
      (.addEventListener js/document "scroll" on-scroll #js {:capture true :passive true})
      (set! (.-_tyUnspy node) #(.removeEventListener js/document "scroll" on-scroll #js {:capture true}))
      (on-scroll))

    :replicant.life-cycle/unmount
    (do (when-let [off (.-_tyUnspy node)] (off))
        (reset! active-section nil))

    ;; Same root reused for another page: re-evaluate against new headings.
    (spy! (scroll-parent node))))

(defn scroll-to!
  "Smooth-scroll to a heading and mark it active right away."
  [anchor]
  (when-let [el (.getElementById js/document anchor)]
    (reset! active-section anchor)
    (.scrollIntoView el #js {:behavior "smooth" :block "start"})))

(defn- section-tree
  "Group h3 entries under their h2: [{:anchor .. :label .. :children [..]}]."
  [sections]
  (reduce (fn [acc {:keys [level] :as s}]
            (if (or (= 2 level) (empty? acc))
              (conj acc (assoc s :children []))
              (update-in acc [(dec (count acc)) :children] conj s)))
          []
          sections))

(defn on-this-page
  "Numbered rail for the current page's sections. The active section (from
   scroll-spy) gets the primary bar; only its h3 children are listed."
  []
  (let [active @active-section
        tree (section-tree @page-sections)]
    [:nav.pt-8.pb-8.flex.flex-col.gap-3
     [:p.text-xs.font-semibold.uppercase.tracking-widest.ty-text--.pl-4 "On this page"]
     [:div.flex.flex-col.border-l.ty-border-
      (for [[i {:keys [anchor label children]}] (map-indexed vector tree)
            :let [own? (or (= anchor active) (some #(= active (:anchor %)) children))]]
        [:div.flex.flex-col {:replicant/key anchor}
         [:button.flex.items-baseline.text-left.text-sm.pl-4.pr-2.cursor-pointer.transition-colors {:class (into ["gap-2.5" "py-1.5"] (if own? ["ty-text++" "font-semibold"] ["ty-text-" "hover:ty-text++"]))
           :style {:margin-left "-1px"
                   :border-left (str "2px solid " (if own? "var(--ty-color-primary)" "transparent"))}
           :on {:click #(scroll-to! anchor)}}
          [:span.font-mono.text-xs {:class (if own? "ty-text-primary" "ty-text--")}
           (.padStart (str (inc i)) 2 "0")]
          label]
         (when own?
           (for [{a :anchor l :label} children]
             [:button.text-left.text-xs.py-1.pr-2.cursor-pointer.transition-colors
              {:replicant/key a
               :style {:padding-left "2.75rem"}
               :class (if (= a active) ["ty-text++" "font-medium"] ["ty-text-" "hover:ty-text++"])
               :on {:click #(scroll-to! a)}}
              l]))])]]))

(defn pager
  "Previous / next page cards. prev, next: {:label :title :on-click}."
  [{:keys [prev next]}]
  (let [card (fn [{:keys [label title on-click]} next?]
               [:button.flex-1.flex.flex-col.gap-2.rounded-2xl.border.ty-border-.px-6.py-5.cursor-pointer.transition-opacity.hover:opacity-90
                {:data-ty-theme ""
                 :class (if next? ["dark" "site-chrome" "items-end" "text-right"] ["site-chrome" "items-start" "text-left"])
                 :style (surface (if next? "canvas" "content"))
                 :on {:click on-click}}
                [:span.flex.items-center.gap-2.font-mono.text-xs.uppercase.tracking-widest.ty-text--
                 (when-not next? [:ty-icon {:name "arrow-left" :size "xs"}])
                 label
                 (when next? [:ty-icon.ty-text-primary {:name "arrow-right" :size "xs"}])]
                [:span.text-2xl.font-bold.ty-text++ {:style {:letter-spacing "-0.02em"}} title]])]
    [:div.flex.flex-col.sm:flex-row.gap-4
     (if prev (card prev false) [:div.flex-1])
     (when next (card next true))]))

(defn page-section
  "Numbered top-level section. head: title string, or
   {:title .. :sub .. :dark? ..}. dark? puts the section on an ink band."
  [head & children]
  (let [{:keys [title sub dark?]} (if (map? head) head {:title head})]
    [:section.ty-doc-section.flex.flex-col.gap-8
     (when dark?
       {:class ["dark" "rounded-3xl" "p-6" "md:p-10"]
        :data-ty-theme ""
        :style (merge brand-inherit
                      {:background (str "radial-gradient(ellipse at 15% 0%, color-mix(in oklch, var(--ty-color-primary) 16%, transparent), transparent 55%), "
                                        "var(--ty-surface-canvas)")})})
     [:header.flex.flex-wrap.items-end.justify-between.gap-x-6.gap-y-2.pb-4
      (assoc brand-scope :style {:border-bottom "1px solid var(--ty-border)"})
      [:h2.ty-text++.font-bold.scroll-mt-6.flex.items-baseline
       {:style {:font-size "2.125rem" :line-height "1" :letter-spacing "-0.035em"}}
       title]
      (when sub [:p.text-sm.ty-text- sub])]
     (into [:div.flex.flex-col.gap-6] children)]))

(defn hero-shell
  "Dark hero card with the brand glow — shared by component and guide pages."
  [& children]
  (into
   [:header.dark.site-chrome.relative.overflow-hidden.rounded-3xl
    {:data-ty-theme ""
     :style {:background (str "radial-gradient(ellipse 70% 90% at 88% 10%, color-mix(in oklch, var(--ty-color-primary) 24%, transparent), transparent 70%), "
                              "var(--ty-surface-canvas)")}}]
   children))

(defn- hero
  [{:keys [title group tag description chips source mark demo]}]
  (hero-shell
   (when mark
     [:div.absolute.select-none.pointer-events-none.font-extrabold.ty-text++
      {:style {:left "-0.06em" :bottom "-0.3em" :font-size "26rem" :line-height "1"
               :letter-spacing "-0.08em" :opacity "0.04"}}
      mark])
   [:div.relative.flex.flex-col.lg:flex-row.lg:items-center.gap-10.p-8.md:p-12
    [:div.flex.flex-col.gap-5.flex-1 {:style {:max-width "26rem"}}
     [:span.text-xs.font-semibold.uppercase.ty-text-primary {:style {:letter-spacing "0.16em"}} group]
     [:h1.ty-text++.font-bold
      {:style {:font-size "clamp(2.75rem, 6vw, 4.25rem)" :line-height "1" :letter-spacing "-0.045em"}}
      title]
     [:p.ty-text-.leading-relaxed description]
     [:div.flex
      [:span.inline-flex.items-center.gap-2.rounded-lg.border.ty-border-.pl-3.pr-1.py-1
       {:style {:background "color-mix(in oklch, var(--ty-text-strong) 6%, transparent)"}}
       [:span.font-mono.text-sm.ty-text-primary (str "<" tag ">")]
       (copy-button (str "<" tag "></" tag ">"))]]
     [:div.flex.flex-wrap.items-center.gap-x-5.gap-y-2.pt-1.text-xs.ty-text-
      (for [[label icon] chips]
        [:span.inline-flex.items-center {:class ["gap-1.5"] :replicant/key label}
         (when icon [:ty-icon {:name icon :size "xs"}])
         label])
      (when source
        [:a.inline-flex.items-center.font-semibold.ty-text-primary.hover:underline {:class ["gap-1.5"] :href (str "https://github.com/gersak/tyrell/blob/master/" source)
          :target "_blank" :rel "noopener noreferrer"}
         [:ty-icon {:name "github" :size "xs"}] "Source"])]]
    (when demo
      [:div.flex-1.flex.justify-center.lg:justify-end
       ;; site-demo: a component demo, so library defaults, not the identity.
       [:div.site-demo.dark.rounded-2xl.border.ty-border-.p-4.shadow-2xl
        {:data-ty-theme "" :style (surface "floating")}
        demo]])]))

(defn doc-page
  "Page container for the v2 docs: numbered sections, heading index and
   scroll-spy for the rail. Children: a hero (hero-shell) then page-sections."
  [& children]
  (let [is-desktop? (layout/breakpoint>= :lg)]
    (into
     [:div.ty-doc.mx-auto.flex.flex-col.gap-20
      {:style {:max-width "1080px"
               :padding (if is-desktop? "8px 0 48px" "8px 12px 32px")}
       :replicant/on-render page-hook}
      [:style template-css]]
     children)))

(defn component-page
  "Hero plus numbered sections.
   chips: [[label icon] ...]; source: GitHub path; demo: hero showpiece;
   mark: oversized faint glyph behind the hero copy."
  [page & children]
  (apply doc-page (hero page) children))

;; --- Playground --------------------------------------------------------------

(defn- segmented [value options on-pick]
  [:div.flex.flex-wrap.rounded-lg.ty-bg-neutral- {:class ["p-0.5" "gap-0.5"]}
   (for [o options
         :let [active? (= o value)]]
     [:button.flex-1.py-1.rounded-md.text-xs.font-mono.cursor-pointer.transition-colors {:replicant/key o
       :class (into ["px-2.5"] (if active? ["ty-elevated" "ty-text++" "font-semibold" "shadow-sm"] ["ty-text-"]))
       :on {:click #(on-pick o)}}
      o])])

(defn- swatches
  "Flavor picker: one dot per option, tinted with that flavor (and tone:
   \"+\" strong, \"-\" soft)."
  [value options on-pick & [tone]]
  ;; px-1: the active ring sits 4px outside the dot; inset so it lines up
  ;; with the labels instead of poking past them.
  [:div.flex.items-center.px-1 {:class ["gap-2.5"]}
   (for [o options
         :let [active? (= o value)]]
     [:button.w-6.h-6.rounded-full.cursor-pointer
      {:replicant/key o
       :title o
       :style {:background (str "var(--ty-color-" (if (= o "default") "neutral" o)
                                (case tone "+" "-strong" "-" "-soft" "") ")")
               :outline (if active? "2px solid var(--ty-text-strong)" "2px solid transparent")
               :outline-offset "2px"}
       :on {:click #(on-pick o)}}])])

(defn playground
  "Inspector-style playground: props panel, live stage, code tabs.
   controls: [{:key :size :options [..]}              ; segmented
              {:key :flavor :options [..] :swatch? true :tones? true}
              {:key :clearable :switch? true}]
   tones? adds a - / base / + picker; the tone is appended to the value
   (\"primary+\") before render and snippets see it, so they need no changes.
   defaults: initial props. render / snippets: (fn [props]) -> hiccup / snippets."
  [{:keys [id defaults controls render snippets sub] :or {sub "Every prop is live. The code follows."}}]
  (let [raw (merge defaults (get-in @state [:docs/playground id]))
        tone-key #(keyword (str (name %) "-tone"))
        props (reduce (fn [p {k :key :keys [tones?]}]
                        (let [t (get raw (tone-key k))]
                          ;; "default" means no flavor attribute, so no tone either.
                          (cond-> p (and tones? (#{"+" "-"} t) (not= "default" (get p k)))
                            (update k str t))))
                      raw controls)
        set-prop! #(swap! state assoc-in [:docs/playground id %1] %2)
        label (fn [k & [value]]
                [:span.flex.items-center.justify-between.text-xs.font-mono.ty-text-
                 (name k) (when value [:span.ty-text-- value])])]
    (page-section
     {:title "Playground" :sub sub}
     [:div.flex.flex-col.md:flex-row.rounded-2xl.border.ty-border-.overflow-hidden {:style (surface "content")}
      [:aside.flex.flex-col.gap-5.p-5.shrink-0.border-b.md:border-b-0.md:border-r.ty-border-.md:w-60
       [:span.text-xs.font-semibold.uppercase.tracking-widest.ty-text-- "Props"]
       (for [{k :key :keys [options switch? swatch? tones?]} controls]
         (if switch?
           [:label.flex.items-center.justify-between {:replicant/key (name k)}
            (label k)
            [:ty-switch {:checked (boolean (get props k))
                         :size "sm"
                         :on {:change #(set-prop! k (.. ^js % -detail -checked))}}]]
           [:div.flex.flex-col.gap-2 {:replicant/key (name k)}
            (label k (when swatch? (get props k)))
            (if swatch?
              ;; py-1: headroom for the active swatch's ring (2px + 2px offset).
              [:div.flex.flex-col.gap-3.py-1
               (swatches (get raw k) options #(set-prop! k %) (get raw (tone-key k)))
               (when tones?
                 [:div.mt-4
                  (segmented (get raw (tone-key k) "base") ["-" "base" "+"]
                             #(set-prop! (tone-key k) %))])]
              (segmented (get raw k) options #(set-prop! k %)))]))]
      [:div.flex-1.min-w-0.flex.flex-col
       [:div.flex.justify-center.items-center.px-6.py-12 {:style {:min-height "300px"}}
        (render props)]
       (code-tabs (snippets props))]])))

;; --- Examples ----------------------------------------------------------------

(defn bento
  "Grid for example cards; each card picks its width with :span (of 6).
   Inline display: index.html has a global .grid rule that overrides grid-cols-*."
  [& examples]
  (into [:div.md:grid-cols-6.gap-4 {:style {:display "grid"}}] examples))

(defn example
  "Card: heading, one line of explanation, the demo, and its code pinned at
   the foot. Code up to 10 lines shows inline; longer code folds.
   span: columns out of 6 inside bento (default: full width).
   side?: demo left, code right (full-width recipes, e.g. theming)."
  [{:keys [title description code lang span side?] :or {lang "html" span 6}} demo]
  (let [lines (when code (line-count code))
        compact? (<= span 2)
        foot {:data-ty-theme ""}
        ;; Compact cards float the copy button over the (short) first line.
        body (fn []
               [:div.relative.flex.items-start
                [:div.flex-1.min-w-0 (code-view code lang {:compact? compact?})]
                [:div.p-2.shrink-0 {:class (when compact? ["absolute" "top-0" "right-0"])}
                 (copy-button code)]])]
    (if side?
      [:article.min-w-0.flex.flex-col.md:flex-row.rounded-2xl.border.ty-border-.overflow-hidden
       {:class (str "md:col-span-" span)
        :style (surface "content")}
       [:div.flex.flex-col.gap-5.p-6.min-w-0 {:class ["md:shrink-0" "md:basis-[22rem]"]}
        [:div.flex.flex-col {:class ["gap-1.5"]}
         [:h3.text-base.font-semibold.ty-text++.scroll-mt-6 title]
         (when description [:p.text-sm.ty-text-.leading-relaxed description])]
        demo]
       [:div.md:flex-1.min-w-0.flex.flex-col.justify-center.border-t.md:border-t-0.md:border-l.ty-border-.site-chrome foot
        (body)]]
    [:article.min-w-0.flex.flex-col.rounded-2xl.border.ty-border-.overflow-hidden
     {:class (str "md:col-span-" span)
      :style (surface "content")}
     [:div.flex.flex-col.px-6.pt-5 {:class ["gap-1.5"]}
      [:h3.text-base.font-semibold.ty-text++.scroll-mt-6 title]
      (when description
        [:p.text-sm.ty-text-.leading-relaxed {:style {:max-width "40rem"}} description])]
     (if demo
       [:div.flex-1.flex.items-center.px-6.py-8 demo]
       [:div.h-4])
     (when code
       (if (or (not demo) (<= lines 10))
         [:div.border-t.ty-border-.site-chrome foot (body)]
         [:details.border-t.ty-border-.site-chrome foot
          [:summary.cursor-pointer.px-5.py-3.text-xs.font-medium.ty-text-
           (str "Show code · " lines " lines")]
          [:div.border-t.ty-border- (body)]]))])))

;; --- API ---------------------------------------------------------------------

(defn- api-groups
  "Rows with optional string group labels -> [[label rows] ...]."
  [rows]
  (reduce (fn [acc row]
            (if (string? row)
              (conj acc [row []])
              (if (empty? acc)
                [[nil [row]]]
                (update-in acc [(dec (count acc)) 1] conj row))))
          []
          rows))

(defn- api-entry
  "[name & meta desc]: name in brand mono, meta (type, default...) under it."
  [[nm & more] stacked?]
  (let [desc (last more)
        meta (remove nil? (butlast more))]
    [:div.flex.flex-col.gap-1.border-b.ty-border- {:replicant/key nm
      :class (into ["py-3.5"] (when-not stacked? ["sm:flex-row" "sm:gap-6"]))}
     [:div.flex.flex-col.shrink-0 {:class ["gap-0.5"] :style (when-not stacked? {:width "13rem"})}
      [:span.font-mono.text-sm.font-semibold.ty-text-primary.break-all nm]
      (when (seq meta)
        [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} (str/join " · " meta)])]
     [:p.text-sm.ty-text.leading-relaxed desc]]))

(defn api-list
  "Reference list. rows: [name & meta desc], optionally interleaved with
   group labels (strings)."
  [{:keys [title rows stacked?]}]
  [:div.flex.flex-col
   [:h3.text-base.font-semibold.ty-text++.scroll-mt-6.pb-1 title]
   (for [[label entries] (api-groups rows)]
     [:div.flex.flex-col {:replicant/key (or label "all")}
      (when label
        [:div.flex.items-center.gap-2.pt-6.pb-1
         [:span.font-mono.text-xs.font-semibold.uppercase.tracking-widest.ty-text++ label]
         [:span.font-mono.text-xs.ty-text-- (count entries)]])
      (for [row entries] (api-entry row stacked?))])])

(def validation-properties
  "Constraint-validation members shared by every form field (api-section :properties)."
  [["checkValidity()" "() => boolean" "Valid? Fires invalid when not; shows nothing."]
   ["reportValidity()" "() => boolean" "Also shows the message: in error when the field has one (cleared once valid), otherwise the browser's bubble."]
   ["setCustomValidity(msg)" "(string) => void" "Your own error, e.g. from the server. Blocks submit until set to \"\"."]
   ["validity · validationMessage · willValidate" "ValidityState · string · boolean" "Same as native form controls."]])

(defn api-section
  "API section: attributes full width, then events / slots / keyboard / CSS
   variables side by side. :properties is for JS-only members (functions,
   objects) that have no attribute. Row format as in api-list."
  [{:keys [attributes properties events slots keyboard css-vars]}]
  (let [n #(count (remove string? %))
        sub (->> [[attributes "attribute" "attributes"] [properties "property" "properties"]
                  [events "event" "events"] [slots "slot" "slots"] [css-vars "variable" "variables"]]
                 (keep (fn [[rows one many]]
                         (when (seq rows)
                           (let [c (n rows)] (str c " " (if (= 1 c) one many))))))
                 (str/join " · "))]
    (page-section
     {:title "API" :sub sub}
     [:div.flex.flex-col.gap-12 brand-scope
      (when (seq attributes) (api-list {:title "Attributes" :rows attributes}))
      (when (seq properties) (api-list {:title "Properties" :rows properties}))
      [:div.md:grid-cols-2.gap-x-10.gap-y-12 {:style {:display "grid"}}
       (when (seq events) (api-list {:title "Events" :rows events :stacked? true}))
       (when (seq slots) (api-list {:title "Slots" :rows slots :stacked? true}))
       (when (seq keyboard) (api-list {:title "Keyboard" :rows keyboard :stacked? true}))
       (when (seq css-vars) (api-list {:title "CSS variables" :rows css-vars :stacked? true}))]])))
