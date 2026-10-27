(ns tyrell.site.docs.tokens
  "Token reference for the Theming page: every public --ty-* custom property,
   grouped by what you'd change. Values are read from the page after each
   render, so they follow light/dark and the playground."
  (:require
   [clojure.string :as str]
   [tyrell.site.docs.common :as common]
   [tyrell.site.state :refer [state]]))

(def ^:private flavors ["primary" "success" "warning" "danger" "neutral"])

(defn- v [s] (str "--ty-" s))

;; --- Data --------------------------------------------------------------------
;; A group holds blocks:
;;   [:rows [[token kind desc] ...]]   kind :color or :value
;;   [:grid desc row-labels col-labels (fn [row col] token)]
;;   [:scale desc [token ...]]         name + value, no per-token description

(def ^:private groups
  [{:id "seeds" :title "Seeds" :sub "Set these. Everything else is derived from them."
    :blocks
    [[:rows (into [[(v "primary-seed") :value "Optional. Any CSS color. Overrides primary hue and chroma. Same for every flavor: --ty-danger-seed, …"]]
                  (for [f flavors
                        [suffix desc] [["hue" "Hue, 0–360."]
                                       ["chroma" "Chroma. 0 is grey; ~0.2 is vivid."]
                                       ["l-factor" "Lightness multiplier for all five shades."]]]
                    [(v (str f "-" suffix)) :value (str (str/capitalize f) ": " (str/lower-case desc))]))]
     [:rows [[(v "surface-chroma") :value "Tints surfaces toward primary. 0 keeps them neutral."]]]]}

   {:id "surfaces" :title "Surfaces" :sub "Backgrounds by elevation. The ty-canvas … ty-floating classes use them."
    :blocks
    [[:rows [[(v "surface-canvas") :color "App background."]
             [(v "surface-content") :color "Main content areas."]
             [(v "surface-elevated") :color "Cards, panels, sidebars."]
             [(v "surface-floating") :color "Modals, dropdowns, popovers."]
             [(v "surface-input") :color "Form controls."]]]
     [:scale "Optional border per surface: color, width, style."
      (for [s ["canvas" "content" "elevated" "floating"]
            p ["border" "border-width" "border-style"]]
        (v (str s "-" p)))]]}

   {:id "text" :title "Text" :sub "Five emphasis tiers: ty-text++ … ty-text--."
    :blocks
    [[:rows [[(v "text-strong") :color "ty-text++. Headings."]
             [(v "text-bold") :color "ty-text+. High emphasis."]
             [(v "text") :color "ty-text. Body."]
             [(v "text-soft") :color "ty-text-. Secondary."]
             [(v "text-faint") :color "ty-text--. Hints, placeholders."]
             [(v "label-color") :color "Field labels."]]]]}

   {:id "borders" :title "Borders & focus" :sub "Neutral ladder, flavor borders, dividers and the focus ring."
    :blocks
    [[:rows [[(v "border-strong") :color "Strongest neutral border."]
             [(v "border-bold") :color "Emphasized border."]
             [(v "border") :color "Default border."]
             [(v "border-soft") :color "Subtle border. Resting inputs."]
             [(v "border-faint") :color "Barely there."]]]
     [:rows (for [f flavors] [(v (str "border-" f)) :color (str (str/capitalize f) " border (ty-border-" f ").")])]
     [:rows [[(v "border-width") :value "Default border width."]
             [(v "divide-color") :color "Divider lines (ty-divide-*). Follows the surface it's on."]
             [(v "divide-width") :value "Divider width."]
             [(v "focus-ring-alpha") :value "Focus ring strength, mixed from the flavor color."]
             [(v "focus-ring-gap") :color "Gap between a control and its focus ring."]]]]}

   {:id "flavor-colors" :title "Flavor colors" :sub "Five shades per flavor, from the seeds and the lightness curve."
    :blocks
    [[:grid "--ty-color-{flavor}-{shade}. Base has no suffix." flavors ["strong" "bold" "base" "soft" "faint"]
      (fn [f s] (v (str "color-" f (when (not= s "base") (str "-" s)))))]]}

   {:id "backgrounds" :title "Backgrounds" :sub "Tints for ty-bg-* classes."
    :blocks
    [[:grid "--ty-bg-{flavor}: the flavor color at a set opacity." flavors ["soft" "base" "bold"]
      (fn [f s] (v (str "bg-" f (when (not= s "base") (str "-" s)))))]
     [:rows [[(v "a-bg-soft") :value "Opacity of the -soft tints."]
             [(v "a-bg-base") :value "Opacity of the base tints."]
             [(v "a-bg-bold") :value "Opacity of the -bold tints."]]]
     [:scale "Neutral background ladder." (map v ["bg-faint" "bg-soft" "bg" "bg-bold" "bg-strong" "bg-neutral-faint" "bg-neutral-strong"])]]}

   {:id "solid" :title "Solid fills" :sub "Filled buttons, tags and badges. Derived: adjust with the dials below, don't set the fills."
    :blocks
    [[:grid "--ty-solid-{flavor}{-strong|-soft} (tone + / −). Each has a matching -fg text color." flavors ["strong" "base" "soft"]
      (fn [f s] (v (str "solid-" f (when (not= s "base") (str "-" s)))))]
     [:rows (into [[(v "solid-l") :value "Lightness offset for every fill. Negative dims."]
                   [(v "solid-c") :value "Chroma multiplier. Below 1 desaturates."]
                   [(v "solid-h") :value "Hue offset in degrees."]
                   [(v "solid-hover-l") :value "Lightness shift on :hover."]
                   [(v "solid-active-l") :value "Lightness shift on :active."]
                   [(v "solid-strong-l") :value "Lightness shift for tone +."]
                   [(v "solid-soft-l") :value "Lightness shift for tone −."]
                   [(v "solid-fg-threshold") :value "Fills lighter than this get black text; darker get white."]]
                  (for [f (butlast flavors)]
                    [(v (str f "-solid-l")) :value (str "Extra lightness offset for " f " fills only.")]))]]}

   {:id "inputs" :title "Inputs" :sub "Shared by every form field."
    :blocks
    [[:rows [[(v "input-bg") :color "Field background."]
             [(v "input-color") :color "Typed text."]
             [(v "input-placeholder") :color "Placeholder text."]
             [(v "input-border") :color "Resting border."]
             [(v "input-border-hover") :color "Border on hover."]
             [(v "input-border-focus") :color "Border on focus."]
             [(v "input-shadow-focus") :value "Focus glow."]
             [(v "input-border-width") :value "Border width."]
             [(v "input-border-style") :value "Border style."]
             [(v "input-disabled-bg") :color "Disabled background."]
             [(v "input-disabled-border") :color "Disabled border."]
             [(v "input-disabled-color") :color "Disabled text."]
             [(v "weight-label") :value "Label font weight."]]]]}

   {:id "type" :title "Type" :sub "Families, sizes, weights and rhythm."
    :blocks
    [[:rows [[(v "font-sans") :value "UI font stack."]
             [(v "font-mono") :value "Code font stack."]
             [(v "weight-action") :value "Button and action weight."]]]
     [:scale "Sizes." (map #(v (str "font-" %)) ["xxs" "xs" "sm" "base" "lg" "xl" "2xl" "3xl" "4xl" "5xl"])]
     [:scale "Weights." (map #(v (str "font-" %)) ["thin" "light" "normal" "medium" "semibold" "bold" "extrabold"])]
     [:scale "Line heights paired with each size." (map #(v (str "leading-" %)) ["xxs" "xs" "sm" "base" "lg" "xl" "2xl" "3xl" "4xl" "5xl"])]
     [:scale "Unitless line heights." (map #(v (str "line-height-" %)) ["none" "tight" "snug" "normal" "relaxed" "loose"])]
     [:scale "Letter spacing." (map #(v (str "tracking-" %)) ["xxs" "xs" "sm" "base" "lg" "tight" "title"])]]}

   {:id "space" :title "Space, size & shape" :sub "Spacing scale, control heights, corners and elevation."
    :blocks
    [[:scale "Spacing." (map #(v (str "spacing-" %)) ["px" "mini" "0" "1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "12" "16" "20" "24"])]
     [:scale "Control heights (size=\"xs\" … \"xl\")." (map #(v (str "size-" %)) ["xs" "sm" "md" "lg" "xl"])]
     [:scale "Radius." (map #(v (str "radius-" %)) ["none" "sm" "base" "md" "lg" "xl" "2xl" "3xl" "full"])]
     [:scale "Shadows." (map #(v (str "shadow-" %)) ["none" "sm" "base" "md" "lg" "xl" "2xl"])]]}

   {:id "layers" :title "Layers & motion" :sub "Stacking order, transitions and scroll affordances."
    :blocks
    [[:scale "Z-index." (map #(v (str "z-" %)) ["auto" "0" "10" "20" "30" "40" "50" "sticky" "fixed" "modal-backdrop" "modal" "popover" "tooltip" "dropdown"])]
     [:scale "Transitions." (map #(v (str "transition-" %)) ["none" "all" "colors" "shadow" "transform"])]
     [:rows [[(v "theme-transition") :value "Optional. Light/dark crossfade duration, 0.45s when unset; 0s turns it off."]]]
     [:scale "Scroll shadows (ty-scroll-container)." (map v ["scroll-shadow-top" "scroll-shadow-bottom" "scroll-shadow-transition"])]
     [:scale "Scrollbars." (map #(v (str "scrollbar-" %)) ["track" "track-hover" "thumb" "thumb-hover" "thumb-active"])]]}

   {:id "components" :title "Component tokens" :sub "Global defaults for two components. Every component page lists its own under Theming."
    :blocks
    [[:scale "Modal." (map #(v (str "modal-" %)) ["bg" "color" "border" "border-radius" "shadow" "backdrop" "backdrop-blur" "duration" "sm-width" "md-width" "lg-width" "xl-width" "full-width" "full-height"])]
     [:scale "Tooltip." (map #(v (str "tooltip-" %)) ["bg" "color" "border"])]]}

   {:id "engine" :title "Engine curves" :sub "Advanced. The lightness and chroma curves every shade and ladder is computed from."
    :advanced? true
    :blocks
    [[:scale "Shade lightness (strong … faint)." (map #(v (str "l-" %)) ["strong" "bold" "base" "soft" "faint"])]
     [:scale "Shade chroma multipliers." (map #(v (str "c-" %)) ["strong-mult" "bold-mult" "base-mult" "soft-mult" "faint-mult" "bg-neutral-faint-mult"])]
     [:scale "Text ladder lightness." (map #(v (str "l-text-" %)) ["strong" "bold" "base" "soft" "faint"])]
     [:scale "Surface lightness." (map #(v (str "l-surface-" %)) ["canvas" "content" "elevated" "floating" "input"])]
     [:scale "Border lightness." (map #(v (str "l-border" %)) ["-strong" "-bold" "" "-soft" "-faint" "-content" "-elevated" "-floating"])]
     [:scale "Neutral fills and backgrounds." (map v ["l-solid-neutral" "l-solid-neutral-strong" "l-bg-neutral-faint" "l-bg-neutral-strong"])]]}])

(defn listed-tokens
  "Every token this reference lists (for coverage checks)."
  []
  (set (for [{:keys [blocks]} groups
             [kind & args] blocks
             t (case kind
                 :rows (map first (first args))
                 :scale (second args)
                 :grid (let [[_ rows cols f] args] (for [r rows c cols] (f r c))))
             :when t]
         t)))

;; --- Live values ---------------------------------------------------------------

(defn- resolve-values!
  "Fill every [data-token] value cell under node from the page's computed
   styles. Colors go through a probe's `color` so relative-color formulas come
   back resolved; anything else is the custom property's computed text."
  [^js node]
  (when node
    (let [probe (.querySelector node "[data-token-probe]")
          cs (js/getComputedStyle node)]
      (doseq [^js el (array-seq (.querySelectorAll node "[data-token]"))]
        (let [token (.. el -dataset -token)
              raw (str/trim (.getPropertyValue cs token))
              text (if (and probe (= "color" (.. el -dataset -kind)))
                     (do (set! (.. probe -style -color) (str "var(" token ")"))
                         (.-color (js/getComputedStyle probe)))
                     raw)
              text (str/replace (if (str/blank? text) "—" text) #"\s+" " ")]
          (set! (.-textContent el) (if (> (count text) 48) (str (subs text 0 47) "…") text))
          (set! (.-title el) text))))))

;; --- View ----------------------------------------------------------------------

(defn- value-cell [token kind]
  [:span.block.max-w-full.font-mono.ty-text--.truncate {:data-token token :data-kind (name kind)
                                       :style {:font-size "0.6875rem"}}])

(defn- swatch [token]
  [:span.inline-block.shrink-0.rounded-md.border.ty-border-
   {:style {:width "1.25rem" :height "1.25rem" :background (str "var(" token ")")}}])

(defn- rows-block [rows]
  [:div.flex.flex-col
   (for [[token kind desc] rows]
     [:div.flex.flex-col.sm:flex-row.sm:items-center.gap-1.sm:gap-4.border-b.ty-border- {:class ["py-2.5"] :replicant/key token}
      [:div.flex.items-center.shrink-0.min-w-0 {:class ["gap-2.5"] :style {:width "19rem"}}
       (if (= kind :color) (swatch token) [:span.shrink-0 {:style {:width "1.25rem"}}])
       [:span.font-mono.text-sm.font-semibold.ty-text+.break-all token]]
      [:div.flex.flex-col.min-w-0.flex-1 {:class ["gap-0.5"]}
       [:span.text-sm.ty-text- desc]
       (value-cell token kind)]])])

(defn- scale-block [desc tokens]
  [:div.flex.flex-col.gap-2.py-3.border-b.ty-border-
   [:span.text-sm.ty-text- desc]
   [:div.gap-x-6.gap-y-1 {:style {:display "grid" :grid-template-columns "repeat(auto-fill, minmax(15rem, 1fr))"}}
    (for [t tokens]
      [:div.flex.items-baseline.justify-between.gap-3.min-w-0 {:replicant/key t}
       [:span.font-mono.text-xs.font-semibold.ty-text+.shrink-0 t]
       (value-cell t :value)])]])

(defn- grid-block [desc rows cols f]
  [:div.flex.flex-col.gap-3.py-3.border-b.ty-border-
   [:span.text-sm.ty-text- desc]
   [:div.overflow-x-auto
    [:div.gap-2 {:style {:display "grid" :grid-template-columns (str "6rem repeat(" (count cols) ", minmax(5.5rem, 1fr))")}}
     [:span]
     (for [c cols] [:span.font-mono.ty-text--.text-center {:replicant/key (str "h" c) :style {:font-size "0.6875rem"}} (if (= c "") "" c)])
     (for [r rows
           cell (cons [:label r] (for [c cols] [:cell (f r c)]))]
       (let [[k x] cell]
         (if (= k :label)
           [:span.font-mono.text-xs.ty-text-.self-center {:replicant/key (str "l" r)} r]
           [:div.flex.flex-col.items-center.gap-1 {:replicant/key (str r x)}
            (if x
              [:span.w-full.rounded-lg.border.ty-border- {:title x :style {:height "2.25rem" :background (str "var(" x ")")}}]
              [:span.w-full.rounded-lg.border.border-dashed.ty-border- {:style {:height "2.25rem"}}])
            (when x (value-cell x :color))])))]]])

(defn- block-tokens [[kind & args]]
  (case kind
    :rows (map first (first args))
    :scale (second args)
    :grid (let [[_ rows cols f] args] (remove nil? (for [r rows c cols] (f r c))))))

(defn- filter-block [q [kind & args :as block]]
  (if (str/blank? q)
    block
    (let [hit? #(str/includes? (str/lower-case (str/join " " (remove nil? %&))) q)]
      (case kind
        :rows (let [rows (filter (fn [[t _ d]] (hit? t d)) (first args))] (when (seq rows) [:rows rows]))
        :scale (let [[d ts] args] (if (hit? d) block (let [ts (filter #(hit? %) ts)] (when (seq ts) [:scale d ts]))))
        :grid (when (or (hit? (first args)) (some #(hit? %) (block-tokens block))) block)))))

(defn- render-block [[kind & args]]
  (case kind
    :rows (rows-block (first args))
    :scale (apply scale-block args)
    :grid (apply grid-block args)))

(defn- group-view [{:keys [id title sub advanced?]} blocks n q]
  (let [body [:div.flex.flex-col
              [:div.flex.items-baseline.gap-3.pb-1
               [:h3.text-base.font-semibold.ty-text++ title]
               [:span.font-mono.text-xs.ty-text-- n]]
              [:p.text-sm.ty-text-.pb-1 sub]
              (map render-block blocks)]]
    (if (and advanced? (str/blank? q))
      [:details.rounded-xl.border.ty-border-.px-5.py-3 {:replicant/key id}
       [:summary.cursor-pointer.text-sm.font-semibold.ty-text+ (str title " · " n " tokens · advanced")]
       [:div.pt-3 body]]
      [:div {:replicant/key id} body])))

(defn section
  "Tokens section for the Theming page."
  []
  (let [q (str/lower-case (str/trim (or (:tokens/filter @state) "")))
        shown (for [g groups
                    :let [blocks (keep #(filter-block q %) (:blocks g))]
                    :when (seq blocks)]
                [g blocks (count (mapcat block-tokens blocks))])
        total (count (listed-tokens))]
    (common/page-section
     {:title "Tokens" :sub (str total " custom properties. Values are live: switch the theme or drag a seed.")}
     [:div.flex.flex-col.gap-8
      ;; Re-render (and re-read values) when the theme or the playground changes.
      {:data-rev (hash [(:theme @state) (:brand-playground @state) q])
       :replicant/on-render (fn [{node :replicant/node}] (resolve-values! node))}
      [:span {:data-token-probe "" :style {:display "none"}}]
      [:div {:style {:max-width "22rem"}}
       [:ty-input {:placeholder "Filter: surface, danger, radius…" :size "sm" :value (or (:tokens/filter @state) "")
                   :on {:input #(swap! state assoc :tokens/filter (.. ^js % -detail -value))}}]]
      (if (seq shown)
        (for [[g blocks n] shown] (group-view g blocks n q))
        [:p.text-sm.ty-text- (str "No token matches \"" q "\".")])])))
