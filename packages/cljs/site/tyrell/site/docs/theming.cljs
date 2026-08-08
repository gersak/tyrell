(ns tyrell.site.docs.theming
  "Interactive playground for the OKLCH brand layer (tyrell-theme.css)."
  (:require
   [clojure.string :as str]
   [tyrell.router :as router]
   [tyrell.site.state :as state]
   [tyrell.site.docs.common :refer [code-block doc-section docs-page
                                    component-header section-label]]))

;; ----------------------------------------------------------------------------
;; State
;; ----------------------------------------------------------------------------
;; Seeds the user can drag. We persist them in the global state atom so the
;; slider remembers its position across re-renders.

(def ^:private default-seeds
  {;; SEEDS — site defaults (also mirrored as :root overrides in
   ;; packages/cljs/public/index.html so first paint matches before CLJS boots).
   :brand-hue 52
   :brand-chroma 0.170
   ;; PER-FLAVOR HUES — semantic anchors. Defaults match the brand layer's
   ;; CSS fallbacks. Chroma stays bound to the per-flavor multipliers in
   ;; tyrell-theme.css (success ×1.08, warning ×1.15, danger ×1.31) so
   ;; the emphasis hierarchy survives any hue change. Neutral isn't tweakable
   ;; here — it's achromatic by default in the brand layer (hue 0, chroma 0),
   ;; independent of brand-hue.
   :success-hue 145
   :warning-hue 75
   :danger-hue  25
   ;; L-CURVE (light-mode defaults; dark-mode defaults live in
   ;; dark-curve-defaults below — curve edits are stored per theme).
   :l-strong 0.38
   :l-bold   0.46
   :l-base   0.54
   :l-soft   0.72
   :l-faint  0.88
   ;; SATURATION CURVE
   :c-strong-mult 0.77
   :c-bold-mult   1.00
   :c-base-mult   0.92
   :c-soft-mult   0.77
   :c-faint-mult  0.46
   ;; UI state
   :floating-open? false
   :show-ladder?   false
   :show-curve?    false
   :show-anchors?  true})

;; The brand layer redefines the L-curve and saturation curve in html.dark
;; (hues are theme-invariant), so curve edits must be theme-scoped too:
;; stored under [:brand-playground :curves <theme>] and applied via an
;; injected <style> with :root / html.dark blocks — an inline style on <html>
;; would clobber BOTH themes at once.
(def ^:private curve-keys
  #{:l-strong :l-bold :l-base :l-soft :l-faint
    :c-strong-mult :c-bold-mult :c-base-mult :c-soft-mult :c-faint-mult})

;; Mirror of the html.dark block in tyrell-theme.css.
(def ^:private dark-curve-defaults
  {:l-strong 0.72 :l-bold 0.66 :l-base 0.62 :l-soft 0.46 :l-faint 0.30
   :c-strong-mult 0.77 :c-bold-mult 1.00 :c-base-mult 0.92 :c-soft-mult 0.77
   :c-faint-mult 0.50})

(defn- active-theme []
  (if (= "dark" (:theme @state/state)) :dark :light))

(defn- get-seeds
  "Merged seed view for the ACTIVE theme: brand defaults, dark curve
   defaults when dark, then the user's per-theme curve overrides."
  []
  (let [st (get-in @state/state [:brand-playground] {})
        theme (active-theme)]
    (merge default-seeds
           (when (= theme :dark) dark-curve-defaults)
           (apply dissoc st :curves curve-keys)
           (get-in st [:curves theme]))))

(defn- key->var
  "Map a state key to the CSS variable it drives. Returns nil for keys
   that are UI-only (panels expanded, etc.)."
  [k]
  (case k
    :brand-hue        "--ty-brand-hue"
    :brand-chroma     "--ty-brand-chroma"
    :success-hue      "--ty-success-hue"
    :warning-hue      "--ty-warning-hue"
    :danger-hue       "--ty-danger-hue"
    :l-strong        "--ty-l-strong"
    :l-bold          "--ty-l-bold"
    :l-base          "--ty-l-base"
    :l-soft          "--ty-l-soft"
    :l-faint         "--ty-l-faint"
    :c-strong-mult   "--ty-c-strong-mult"
    :c-bold-mult     "--ty-c-bold-mult"
    :c-base-mult     "--ty-c-base-mult"
    :c-soft-mult     "--ty-c-soft-mult"
    :c-faint-mult    "--ty-c-faint-mult"
    nil))

(defn- apply-seed!
  "Write a single CSS variable to documentElement.style. Always live."
  [k value]
  (when-let [css-name (key->var k)]
    (.setProperty (.-style (.-documentElement js/document)) css-name (str value))))

(defn- clear-seed!
  "Remove the inline override so the brand-layer default takes back over."
  [k]
  (when-let [css-name (key->var k)]
    (.removeProperty (.-style (.-documentElement js/document)) css-name)))

(defn- curve-css
  "Render the per-theme curve overrides as :root / html.dark blocks."
  [st]
  (let [block (fn [sel m]
                (when (seq m)
                  (str sel " {\n"
                       (str/join "\n" (for [[k v] m] (str "  " (key->var k) ": " v ";")))
                       "\n}")))]
    (str/join "\n" (remove nil? [(block ":root" (get-in st [:curves :light]))
                                 (block "html.dark" (get-in st [:curves :dark]))]))))

(defn- sync-curve-style!
  "Write curve overrides into <style id=ty-playground-curves> appended to
   <head> — later in document order than tyrell-theme.css, so equal-specificity
   :root / html.dark rules win, each theme independently."
  []
  (let [el (or (.getElementById js/document "ty-playground-curves")
               (let [e (.createElement js/document "style")]
                 (set! (.-id e) "ty-playground-curves")
                 (.appendChild (.-head js/document) e)
                 e))]
    (set! (.-textContent el) (curve-css (get-in @state/state [:brand-playground] {})))))

(defn- set-by-key!
  "Generic onChange — write the parsed number into both state and CSS.
   Curve keys go to the active theme's override map + style tag; everything
   else (hues, chroma) is theme-invariant and stays on the inline path."
  [k]
  (fn [^js e]
    (let [v (js/parseFloat (.. e -target -value))]
      (if (contains? curve-keys k)
        (do (swap! state/state assoc-in [:brand-playground :curves (active-theme) k] v)
            (sync-curve-style!))
        (do (swap! state/state assoc-in [:brand-playground k] v)
            (apply-seed! k v))))))

(defn- set-brand-hue! [^js e]
  (let [v (js/parseFloat (.. e -target -value))]
    (swap! state/state assoc-in [:brand-playground :brand-hue] v)
    (apply-seed! :brand-hue v)))

(defn- set-brand-chroma! [^js e]
  (let [v (js/parseFloat (.. e -target -value))]
    (swap! state/state assoc-in [:brand-playground :brand-chroma] v)
    (apply-seed! :brand-chroma v)))

(defn- preset! [hue chroma]
  (swap! state/state update :brand-playground assoc
         :brand-hue hue
         :brand-chroma chroma)
  (apply-seed! :brand-hue hue)
  (apply-seed! :brand-chroma chroma))

(defn- reset-all! [_]
  (swap! state/state assoc :brand-playground default-seeds)
  ;; Curve keys included for hygiene: older builds wrote them inline on <html>.
  (doseq [k [:brand-hue :brand-chroma
             ;; secondary-* kept for hygiene: pre-TC37 builds wrote them inline
             :secondary-offset :secondary-hue :secondary-chroma
             :success-hue :warning-hue :danger-hue
             :l-strong :l-bold :l-base :l-soft :l-faint
             :c-strong-mult :c-bold-mult :c-base-mult :c-soft-mult :c-faint-mult]]
    (clear-seed! k))
  ;; State no longer has :curves — this empties the style tag.
  (sync-curve-style!))

;; `update-in ... not` is wrong here: on first load the state has no entry, so
;; `(not nil) → true` matches the seeded default and the user must click twice
;; to flip it. Read the *merged* value so the toggle always sees the rendered
;; state.
(defn- toggle-key! [k]
  (swap! state/state assoc-in [:brand-playground k] (not (get (get-seeds) k))))

(defn- toggle-floating! [_] (toggle-key! :floating-open?))
(defn- toggle-ladder!   [_] (toggle-key! :show-ladder?))
(defn- toggle-curve!    [_] (toggle-key! :show-curve?))
(defn- toggle-anchors!  [_] (toggle-key! :show-anchors?))

;; The inline seeds-panel on THIS page duplicates the floating widget — close
;; the float on mount so the page lands clean. Users can still pop it back open.
(defn- close-floating-on-mount! [_]
  (swap! state/state assoc-in [:brand-playground :floating-open?] false))

;; ----------------------------------------------------------------------------
;; UI fragments
;; ----------------------------------------------------------------------------

(defn- swatch
  "A tiny color swatch derived from the same OKLCH formula the brand layer
   uses. Drawn inline so the page is its own ground-truth preview."
  [label l c h]
  [:div.flex.flex-col.items-center.gap-1
   [:div.rounded-md
    {:style {:width "44px" :height "44px"
             :background (str "oklch(" l " " c " " h ")")
             :border "1px solid var(--ty-border-soft)"}}]
   [:span.ty-text-- {:style {:font-size "0.6875rem"}} label]])

(defn- theme-dial-lines
  "Seed + curve dials that differ from brand-layer defaults, as CSS lines.
   Returns {:light [...] :dark [...]}."
  [seeds]
  (let [{:keys [brand-hue brand-chroma
                success-hue warning-hue danger-hue]} seeds
        lines (cond-> []
                :always
                (conj (str "  --ty-brand-hue: " (int brand-hue) ";")
                      (str "  --ty-brand-chroma: " (.toFixed brand-chroma 3) ";"))

                (not= (int success-hue) 145)
                (conj (str "  --ty-success-hue: " (int success-hue) ";"))

                (not= (int warning-hue) 75)
                (conj (str "  --ty-warning-hue: " (int warning-hue) ";"))

                (not= (int danger-hue) 25)
                (conj (str "  --ty-danger-hue: " (int danger-hue) ";")))
        curve-lines (fn [theme]
                      (let [defaults (cond-> default-seeds
                                       (= theme :dark) (merge dark-curve-defaults))]
                        (for [[k v] (get-in @state/state [:brand-playground :curves theme])
                              :when (not= v (get defaults k))]
                          (str "  " (key->var k) ": " (.toFixed v 2) ";"))))]
    {:light (concat lines (curve-lines :light))
     :dark (curve-lines :dark)}))

(defn- build-theme-css
  "Render the current seed state as a paste-ready :root block. Only emits
   values that differ from the brand-layer defaults — users get the minimal
   override snippet, not noise."
  [seeds]
  (let [{:keys [light dark]} (theme-dial-lines seeds)]
    (str ":root {\n" (str/join "\n" light) "\n}"
         (when (seq dark)
           (str "\nhtml.dark {\n" (str/join "\n" dark) "\n}")))))

(defn- build-named-theme-css
  "Same dials, exported as a NAMED theme pack. A theme is just a class that
   sets Section 1 dials; [data-ty-theme] makes the engine recompute on that
   element, so the pack works on <html> AND on any subtree. Because the
   dials are @property-registered numbers, applying/removing the class
   crossfades instead of snapping."
  [seeds theme-name]
  (let [{:keys [light dark]} (theme-dial-lines seeds)
        cls (str "." theme-name)]
    (str "/* apply on <html class=\"" theme-name "\">, or scope to a subtree:\n"
         "   <section data-ty-theme class=\"" theme-name "\"> */\n"
         cls " {\n" (str/join "\n" light) "\n}"
         (when (seq dark)
           (str "\n" cls ".dark,\n.dark " cls " {\n" (str/join "\n" dark) "\n}")))))

(defn seeds-panel
  "Interactive brand-seeds widget. Exported so the CSS Guide page can embed it
   as a sticky side rail — drag the sliders, scroll through the design system,
   watch every swatch/ramp retint in place."
  []
  (let [{:keys [brand-hue brand-chroma
                success-hue warning-hue danger-hue
                show-anchors? show-ladder? show-curve?]} (get-seeds)]
    [:div.ty-elevated.rounded-xl.p-5
     [:div.mb-3
      [:h2.ty-text++ {:style {:font-size "1rem" :font-weight 600 :margin 0}}
       "Seeds"]
      [:p.ty-text- {:style {:font-size "0.75rem" :margin-top "0.25rem" :line-height 1.5}}
       "Drag the sliders — every component retints in light AND dark mode."]]

     ;; Brand hue
     [:div {:style {:margin-bottom "0.75rem"}}
      [:div.flex.justify-between.items-center.mb-1
       [:label.ty-text {:style {:font-size "0.75rem" :font-weight 500}}
        [:code "--ty-brand-hue"]]
       [:code.ty-text+
        {:style {:font-size "0.75rem" :background "var(--ty-bg-neutral)"
                 :padding "0.125rem 0.5rem" :border-radius "4px"}}
        (str (int brand-hue) "°")]]
      [:input
       {:type "range" :min 0 :max 360 :step 1
        :value brand-hue
        :on {:input set-brand-hue!}
        :style {:width "100%"
                :background (str "linear-gradient(to right,"
                                 " oklch(0.6 0.18 0),"
                                 " oklch(0.6 0.18 60),"
                                 " oklch(0.6 0.18 120),"
                                 " oklch(0.6 0.18 180),"
                                 " oklch(0.6 0.18 240),"
                                 " oklch(0.6 0.18 300),"
                                 " oklch(0.6 0.18 360))")
                :border-radius "4px" :height "8px"
                :appearance "none" :outline "none"}}]]

     ;; Brand chroma
     [:div {:style {:margin-bottom "0.75rem"}}
      [:div.flex.justify-between.items-center.mb-1
       [:label.ty-text {:style {:font-size "0.75rem" :font-weight 500}}
        [:code "--ty-brand-chroma"]]
       [:code.ty-text+
        {:style {:font-size "0.75rem" :background "var(--ty-bg-neutral)"
                 :padding "0.125rem 0.5rem" :border-radius "4px"}}
        (.toFixed brand-chroma 3)]]
      [:input
       {:type "range" :min 0 :max 0.3 :step 0.005
        :value brand-chroma
        :on {:input set-brand-chroma!}
        :style {:width "100%"
                :background (str "linear-gradient(to right,"
                                 " oklch(0.6 0 " brand-hue "),"
                                 " oklch(0.6 0.3 " brand-hue "))")
                :border-radius "4px" :height "8px"
                :appearance "none" :outline "none"}}]]

     ;; Presets — inline chip row, no separate header
     [:div.flex.flex-wrap.gap-1 {:style {:margin-bottom "0.75rem"}}
      (for [[label hue chroma]
            [["Tyrell" 230 0.13] ["Teal" 200 0.13] ["Indigo" 260 0.14]
             ["Emerald" 145 0.13] ["Orange" 30 0.16] ["Rose" 350 0.16]
             ["Violet" 290 0.14]]]
        [:button
         {:key (str "preset-" label)
          :style {:background (str "oklch(0.52 " chroma " " hue ")")
                  :color "white"
                  :border "1px solid var(--ty-border-soft)"
                  :border-radius "999px"
                  :font-size "0.6875rem"
                  :font-weight 500
                  :padding "0.25rem 0.625rem"
                  :cursor "pointer"}
          :on {:click #(preset! hue chroma)}}
         label])]

     ;; Per-flavor hue anchors — collapsible. Power-user surface for
     ;; retinting semantic colors (success/warning/danger). Chroma stays
     ;; bound to brand-chroma multipliers in tyrell-theme.css so the
     ;; emphasis hierarchy survives any hue change. Neutral has no slider
     ;; here — it's achromatic by default, not a hue to retint.
     [:div {:style {:padding "0.5rem 0.75rem"
                    :background "var(--ty-bg-neutral-soft)"
                    :border-radius "8px"
                    :margin-top "0.75rem"
                    :margin-bottom "0.75rem"}}
      [:button.w-full.flex.items-center.justify-between
       {:style {:background "transparent" :border "none" :cursor "pointer" :padding 0}
        :on {:click toggle-anchors!}}
       [:span.ty-text+ {:style {:font-size "0.6875rem" :font-weight 600
                                :letter-spacing "0.08em" :text-transform "uppercase"}}
        "Per-flavor hue anchors"]
       [:span.ty-text- {:style {:font-size "0.75rem"}}
        (if show-anchors? "−" "+")]]
      (when show-anchors?
        [:div {:style {:margin-top "0.625rem"}}
         (for [[k label hue] [[:success-hue "success" success-hue]
                              [:warning-hue "warning" warning-hue]
                              [:danger-hue  "danger"  danger-hue]]]
           [:div {:key (name k) :style {:margin-bottom "0.5rem"}}
            [:div.flex.justify-between.items-center.mb-1
             [:label.ty-text- {:style {:font-size "0.6875rem" :text-transform "capitalize"}}
              label]
             [:code.ty-text {:style {:font-size "0.6875rem"}}
              (str (int hue) "°")]]
            [:input
             {:type "range" :min 0 :max 360 :step 1 :value hue
              :on {:input (set-by-key! k)}
              :style {:width "100%" :height "6px"
                      :background (str "linear-gradient(to right,"
                                       " oklch(0.6 0.15 0),"
                                       " oklch(0.6 0.15 60),"
                                       " oklch(0.6 0.15 120),"
                                       " oklch(0.6 0.15 180),"
                                       " oklch(0.6 0.15 240),"
                                       " oklch(0.6 0.15 300),"
                                       " oklch(0.6 0.15 360))")
                      :border-radius "4px"
                      :appearance "none" :outline "none"}}]])
         [:p.ty-text-- {:style {:font-size "0.625rem" :line-height 1.5
                                :margin "0.5rem 0 0"}}
          "Chroma stays bound to the brand-chroma multipliers (success ×1.08, "
          "warning ×1.15, danger ×1.31). Only the hue changes. Neutral is "
          "achromatic by default — it does not track the brand hue."]])]

     ;; L-curve — 5 lightness stops. Collapsed by default; matches the
     ;; floating-widget pattern.
     [:div {:style {:padding "0.5rem 0.75rem"
                    :background "var(--ty-bg-neutral-soft)"
                    :border-radius "8px"
                    :margin-bottom "0.75rem"}}
      [:button.w-full.flex.items-start.justify-between.gap-2
       {:style {:background "transparent" :border "none" :cursor "pointer" :padding 0
                :text-align "left"}
        :on {:click toggle-ladder!}}
       [:div.flex-1
        [:span.ty-text+ {:style {:font-size "0.6875rem" :font-weight 600
                                 :letter-spacing "0.08em" :text-transform "uppercase"
                                 :display "block"}}
         "L-curve"]
        [:span.ty-text- {:style {:font-size "0.625rem" :line-height 1.4
                                 :display "block" :margin-top "0.25rem"
                                 :text-transform "none" :letter-spacing 0
                                 :font-weight 400}}
         "Dark↔light contrast for each emphasis step. Lower = punchier headings, higher = airier."]]
       [:span.ty-text- {:style {:font-size "0.75rem" :flex-shrink 0}}
        (if show-ladder? "−" "+")]]
      (when show-ladder?
        [:div {:style {:margin-top "0.625rem"}}
         (for [[k label] [[:l-strong "strong (++)"]
                          [:l-bold   "bold (+)"]
                          [:l-base   "base"]
                          [:l-soft   "soft (-)"]
                          [:l-faint  "faint (--)"]]
               :let [v (get (get-seeds) k)]]
           [:div {:key (name k) :style {:margin-bottom "0.5rem"}}
            [:div.flex.justify-between.items-center.mb-1
             [:label.ty-text- {:style {:font-size "0.6875rem"}} label]
             [:code.ty-text {:style {:font-size "0.6875rem"}} (.toFixed v 2)]]
            [:input
             {:type "range" :min 0 :max 1 :step 0.01 :value v
              :on {:input (set-by-key! k)}
              :style {:width "100%" :height "6px"}}]])
         [:p.ty-text-- {:style {:font-size "0.625rem" :line-height 1.5
                                :margin "0.375rem 0 0"}}
          "Lightness per shade for the ACTIVE theme — toggle dark/light to "
          "tune each side independently. Light: lower L = more emphasis."]])]

     ;; Saturation curve — per-shade chroma multipliers.
     [:div {:style {:padding "0.5rem 0.75rem"
                    :background "var(--ty-bg-neutral-soft)"
                    :border-radius "8px"
                    :margin-bottom "0.75rem"}}
      [:button.w-full.flex.items-start.justify-between.gap-2
       {:style {:background "transparent" :border "none" :cursor "pointer" :padding 0
                :text-align "left"}
        :on {:click toggle-curve!}}
       [:div.flex-1
        [:span.ty-text+ {:style {:font-size "0.6875rem" :font-weight 600
                                 :letter-spacing "0.08em" :text-transform "uppercase"
                                 :display "block"}}
         "Saturation curve"]
        [:span.ty-text- {:style {:font-size "0.625rem" :line-height 1.4
                                 :display "block" :margin-top "0.25rem"
                                 :text-transform "none" :letter-spacing 0
                                 :font-weight 400}}
         "Per-shade chroma multiplier. Higher = more vivid headings, lower = greyer."]]
       [:span.ty-text- {:style {:font-size "0.75rem" :flex-shrink 0}}
        (if show-curve? "−" "+")]]
      (when show-curve?
        [:div {:style {:margin-top "0.625rem"}}
         (for [[k label] [[:c-strong-mult "× strong (++)"]
                          [:c-bold-mult   "× bold (+)"]
                          [:c-base-mult   "× base"]
                          [:c-soft-mult   "× soft (-)"]
                          [:c-faint-mult  "× faint (--)"]]
               :let [v (get (get-seeds) k)]]
           [:div {:key (name k) :style {:margin-bottom "0.5rem"}}
            [:div.flex.justify-between.items-center.mb-1
             [:label.ty-text- {:style {:font-size "0.6875rem"}} label]
             [:code.ty-text {:style {:font-size "0.6875rem"}} (.toFixed v 2)]]
            [:input
             {:type "range" :min 0 :max 1.5 :step 0.01 :value v
              :on {:input (set-by-key! k)}
              :style {:width "100%" :height "6px"}}]])
         [:p.ty-text-- {:style {:font-size "0.625rem" :line-height 1.5
                                :margin "0.375rem 0 0"}}
          "Each shade's chroma = flavor-chroma × this multiplier. Drops near "
          "the extremes so near-white and near-black can hold their tint."]])]

     [:button.px-3.py-2.rounded-md.text-sm.ty-text-.border.ty-border-soft
      {:style {:cursor "pointer" :width "100%"}
       :on {:click reset-all!}}
      "Reset to defaults"]

     ;; Theme export — paste-ready snippet, either as global :root overrides
     ;; or as a NAMED theme pack (usable on <html> or any [data-ty-theme]
     ;; subtree; switches crossfade thanks to the @property-typed dials).
     (let [named? (get-in @state/state [:brand-playground :export-named?] false)
           theme-name (get-in @state/state [:brand-playground :export-name] "my-theme")]
       [:div {:style {:margin-top "0.75rem"}}
        [:div.flex.items-center.gap-2.mb-2
         [:ty-button {:size "xs" :flavor "neutral"
                      :appearance (if named? "outlined" "solid")
                      :on {:click (fn [_] (swap! state/state assoc-in
                                                 [:brand-playground :export-named?] false))}}
          ":root"]
         [:ty-button {:size "xs" :flavor "neutral"
                      :appearance (if named? "solid" "outlined")
                      :on {:click (fn [_] (swap! state/state assoc-in
                                                 [:brand-playground :export-named?] true))}}
          "named theme"]
         (when named?
           [:input {:type "text" :value theme-name
                    :placeholder "theme name"
                    :style {:flex 1 :min-width "0" :font-size "0.75rem"
                            :padding "0.25rem 0.5rem"
                            :border "1px solid var(--ty-border-soft)"
                            :border-radius "6px"
                            :background "var(--ty-surface-input)"
                            :color "var(--ty-text)"}
                    :on {:input (fn [^js e]
                                  (swap! state/state assoc-in
                                         [:brand-playground :export-name]
                                         (.. e -target -value)))}}])]
        [:ty-copy {:label (if named?
                            "Theme pack — a class usable on <html> or any subtree"
                            "Theme snippet — paste into your :root")
                   :value (if named?
                            (build-named-theme-css (get-seeds) theme-name)
                            (build-theme-css (get-seeds)))
                   :format "code"
                   :multiline true}]])]))

;; ----------------------------------------------------------------------------
;; Flavor pack builder — the CSS_GUIDE "flavor pack" template, generated live.
;; A custom flavor declared this way gets FULL engine parity: shared L-curve,
;; saturation curve, dark mode via the same dial flips (no dark block of its
;; own), solid interaction states, auto-contrast foregrounds, theme scoping.
;; ----------------------------------------------------------------------------

(defn- fpb-name []  (get-in @state/state [:flavor-pack :name] "love"))
(defn- fpb-color [] (get-in @state/state [:flavor-pack :color] "#76467c"))

(defn- fpb-set! [k]
  (fn [^js e]
    (let [raw (.. e -target -value)
          v (if (= k :name) (str/replace raw #"[^a-zA-Z0-9_-]" "") raw)]
      (swap! state/state assoc-in [:flavor-pack k] v))))

(defn flavor-pack-ramp-lines
  "The ramp declarations for a seed-driven flavor NAME — every formula reads
   the seed's c+h channels; L comes from the shared, mode-flipped curve.
   That is the ingestion rule: a color's identity is hue+chroma, its
   lightness is the CURVE's job — which is why any seed (light or dark)
   gets correct dark mode, tones and auto-contrast."
  [nm]
  (let [seed (str "var(--ty-" nm "-seed)")
        ink (fn [tok l-stop c-mult]
              (str "  --ty-color-" nm tok ": oklch(from " seed
                   " calc(var(--ty-l-" l-stop ") * var(--ty-" nm "-l-factor, 1))"
                   " calc(c * var(--ty-c-" c-mult "-mult)) h);"))
        bg (fn [tok l-stop c-mult]
             (str "  --ty-bg-" nm tok ": oklch(from " seed
                  " calc(var(--ty-l-bg-" l-stop ") * var(--ty-" nm "-l-factor, 1))"
                  " calc(c * var(--ty-c-bg-" c-mult "-mult)) h);"))
        solid-state (fn [state dial]
                      (str "  --ty-solid-" nm "-" state ": oklch(from var(--ty-solid-" nm
                           ") calc(l + var(--ty-solid-" dial ")) c h);"))
        fg (fn [suffix fill]
             (str "  --ty-solid-" nm suffix
                  "-fg: oklch(from var(--ty-solid-" nm fill
                  ") clamp(0, (var(--ty-solid-fg-threshold) - l) * 1000, 1) 0 0);"))]
    [(ink "-strong" "strong" "strong") (ink "-bold" "bold" "bold")
     (ink "" "base" "base") (ink "-soft" "soft" "soft")
     (ink "-faint" "faint" "faint")
     (bg "" "base" "base") (bg "-bold" "bold" "bold") (bg "-soft" "soft" "soft")
     (str "  --ty-border-" nm ": var(--ty-color-" nm "-soft);")
     (str "  --ty-solid-" nm ": oklch(from var(--ty-color-" nm
          ") calc(l + var(--ty-solid-l)) calc(c * var(--ty-solid-c)) calc(h + var(--ty-solid-h)));")
     (solid-state "hover" "hover-l") (solid-state "active" "active-l")
     (solid-state "strong" "strong-l") (solid-state "soft" "soft-l")
     (fg "" "") (fg "-soft" "-soft") (fg "-strong" "-strong")]))

(defn flavor-pack-css
  "The full pack for flavor NAME seeded by one COLOR — the same template
   CSS_GUIDE documents. The exported seed line is the entire per-project
   surface; the ramp is engine boilerplate."
  [nm color]
  (str ":root {\n"
       "  --ty-" nm "-seed: " color "; /* the one color you pick */\n"
       "}\n\n"
       "html:root,\n[data-ty-theme] {\n"
       (str/join "\n" (flavor-pack-ramp-lines nm))
       "\n}"))

(defn flavor-pack-builder []
  (let [nm (fpb-name) color (fpb-color)
        css (flavor-pack-css nm color)]
    [:div.ty-content.rounded-lg.p-5
     ;; LIVE: the generated pack applies to the real page via this style tag,
     ;; so the preview row below is the actual engine at work — dark toggle,
     ;; theme scopes and animated transitions all reach it.
     [:style css]
     [:p.ty-text-.mb-4 {:style {:font-size "0.8125rem" :line-height 1.6}}
      "The built-in flavors are pre-installed instances of one template. A name and "
      [:strong "one color"] " in, a full flavor out. The seed contributes hue + chroma; "
      "every shade's lightness comes from the shared, mode-flipped curve — which is why "
      "any seed, light or dark, gets correct dark mode, correct " [:code "+"] "/" [:code "−"]
      " tones and auto-contrast text, with " [:strong "no dark block of its own"]
      ". Everything below is LIVE — the generated CSS is applied to this page."]
     [:div.grid.gap-6 {:style {:grid-template-columns "minmax(260px, 340px) 1fr"
                               :align-items "start"}}
      [:div
       [:div {:style {:margin-bottom "0.75rem"}}
        [:label.ty-text-.block.mb-1 {:style {:font-size "0.6875rem"}} "flavor name"]
        [:input {:type "text" :value nm
                 :style {:width "100%" :font-size "0.8125rem" :padding "0.375rem 0.5rem"
                         :border "1px solid var(--ty-border-soft)" :border-radius "6px"
                         :background "var(--ty-surface-input)" :color "var(--ty-text)"}
                 :on {:input (fpb-set! :name)}}]]
       [:div {:style {:margin-bottom "0.75rem"}}
        [:div.flex.justify-between.items-center.mb-1
         [:label.ty-text- {:style {:font-size "0.6875rem"}}
          [:code (str "--ty-" nm "-seed")]]
         [:code.ty-text {:style {:font-size "0.6875rem"}} color]]
        [:input {:type "color" :value color
                 :style {:width "100%" :height "2rem" :padding 0 :border "none"
                         :border-radius "6px" :cursor "pointer" :background "none"}
                 :on {:input (fpb-set! :color)}}]]
       ;; live preview — real components using the generated flavor
       (when (seq nm)
         [:div.space-y-3.mt-4
          ;; − base + — ascending emphasis, matching the matrix column order
          [:div.flex.flex-wrap.gap-2
           [:ty-button {:flavor (str nm "-")} (str nm "-")]
           [:ty-button {:flavor nm} nm]
           [:ty-button {:flavor (str nm "+")} (str nm "+")]]
          [:div.flex.flex-wrap.gap-2
           [:ty-button {:flavor nm :appearance "outlined"} "outlined"]
           [:ty-button {:flavor nm :appearance "ghost"} "ghost"]
           [:ty-tag {:flavor nm} nm]]
          [:ty-input {:flavor nm :placeholder (str "themed " nm " input")}]])]
      [:div
       (when (seq nm)
         [:ty-copy {:label "The pack — paste anywhere tyrell-theme.css loads"
                    :value css
                    :format "code"
                    :multiline true}])]]]))

(defn floating-seeds
  "Compact always-on widget pinned to the bottom-right corner. Collapses to a
   small chip on click. Use this on docs pages where you want the visitor to
   tweak the brand while scrolling the page contents (e.g. the CSS Guide)."
  []
  (let [{:keys [brand-hue brand-chroma floating-open?]} (get-seeds)]
    [:div
     {:style {:position "fixed"
              :bottom "1.25rem"
              :right "1.25rem"
              :z-index 60
              :transition "all 0.2s ease"}}
     (if-not floating-open?
       ;; Collapsed chip — click to reopen
       [:button.flex.items-center.gap-2.px-3.py-2.rounded-full
        {:style {:background "var(--ty-surface-floating)"
                 :border "1px solid var(--ty-border-soft)"
                 :box-shadow "0 8px 24px -8px rgb(0 0 0 / 0.18)"
                 :cursor "pointer"}
         :on {:click toggle-floating!}}
        [:div {:style {:width "16px" :height "16px" :border-radius "999px"
                       :background "var(--ty-color-primary)"
                       :border "1px solid var(--ty-border-soft)"}}]
        [:span.ty-text {:style {:font-size "0.75rem" :font-weight 600}}
         "Brand"]]

       ;; Expanded widget
       [:div.ty-elevated.rounded-xl
        {:style {:width "320px"
                 :max-height "calc(100vh - 3rem)"
                 :overflow-y "auto"
                 :padding "1rem"
                 :box-shadow "0 18px 48px -16px rgb(0 0 0 / 0.28)"
                 :border "1px solid var(--ty-border-soft)"}}
        [:div.flex.items-center.justify-between.mb-3
         [:div.flex.items-center.gap-2
          [:div {:style {:width "14px" :height "14px" :border-radius "999px"
                         :background "var(--ty-color-primary)"
                         :border "1px solid var(--ty-border-soft)"}}]
          [:span.ty-text+ {:style {:font-size "0.6875rem" :font-weight 600
                                   :letter-spacing "0.08em" :text-transform "uppercase"}}
           "Brand seeds"]]
         [:button.ty-text-.hover:ty-text
          {:style {:cursor "pointer" :background "transparent" :border "none"
                   :padding "0.125rem 0.375rem" :line-height 1}
           :on {:click toggle-floating!}
           :title "Collapse"}
          [:ty-icon {:name "x" :size "14"}]]]

        ;; Hue
        [:div {:style {:margin-bottom "0.75rem"}}
         [:div.flex.justify-between.items-center.mb-1
          [:label.ty-text- {:style {:font-size "0.6875rem"}}
           [:code "--ty-brand-hue"]]
          [:code.ty-text {:style {:font-size "0.6875rem"}}
           (str (int brand-hue) "°")]]
         [:input
          {:type "range" :min 0 :max 360 :step 1 :value brand-hue
           :on {:input set-brand-hue!}
           :style {:width "100%"
                   :background (str "linear-gradient(to right,"
                                    " oklch(0.6 0.18 0),"
                                    " oklch(0.6 0.18 60),"
                                    " oklch(0.6 0.18 120),"
                                    " oklch(0.6 0.18 180),"
                                    " oklch(0.6 0.18 240),"
                                    " oklch(0.6 0.18 300),"
                                    " oklch(0.6 0.18 360))")
                   :border-radius "4px" :height "6px"
                   :appearance "none" :outline "none"}}]]

        ;; Chroma
        [:div {:style {:margin-bottom "0.75rem"}}
         [:div.flex.justify-between.items-center.mb-1
          [:label.ty-text- {:style {:font-size "0.6875rem"}}
           [:code "--ty-brand-chroma"]]
          [:code.ty-text {:style {:font-size "0.6875rem"}}
           (.toFixed brand-chroma 3)]]
         [:input
          {:type "range" :min 0 :max 0.3 :step 0.005 :value brand-chroma
           :on {:input set-brand-chroma!}
           :style {:width "100%"
                   :background (str "linear-gradient(to right,"
                                    " oklch(0.6 0 " brand-hue "),"
                                    " oklch(0.6 0.3 " brand-hue "))")
                   :border-radius "4px" :height "6px"
                   :appearance "none" :outline "none"}}]]

        ;; Preset row (compact)
        [:div.flex.flex-wrap.gap-1 {:style {:margin-bottom "0.75rem"}}
         (for [[label hue chroma]
               [["Tyrell" 230 0.13] ["Teal" 200 0.13] ["Indigo" 260 0.14]
                ["Emerald" 145 0.13] ["Orange" 30 0.16] ["Rose" 350 0.16]
                ["Violet" 290 0.14]]]
           [:button
            {:key (str label)
             :style {:background (str "oklch(0.52 " chroma " " hue ")")
                     :color "white"
                     :border "1px solid transparent"
                     :border-radius "999px"
                     :font-size "0.6875rem"
                     :padding "0.125rem 0.5rem"
                     :cursor "pointer"}
             :on {:click #(preset! hue chroma)}}
            label])]

        ;; L-CURVE section — collapsible.
        (let [{:keys [show-ladder? l-strong l-bold l-base l-soft l-faint]} (get-seeds)]
          [:div {:style {:margin-bottom "0.5rem" :padding "0.5rem 0.625rem"
                         :background "var(--ty-bg-neutral-soft)" :border-radius "8px"}}
           [:button.w-full.flex.items-center.justify-between
            {:style {:background "transparent" :border "none" :cursor "pointer" :padding 0}
             :on {:click toggle-ladder!}}
            [:span.ty-text+ {:style {:font-size "0.6875rem" :font-weight 600
                                     :letter-spacing "0.08em" :text-transform "uppercase"}}
             "L-curve"]
            [:span.ty-text- {:style {:font-size "0.6875rem"}}
             (if show-ladder? "−" "+")]]
           (when show-ladder?
             [:div {:style {:margin-top "0.5rem"}}
              (for [[k label] [[:l-strong "strong (++)"]
                               [:l-bold   "bold (+)"]
                               [:l-base   "base"]
                               [:l-soft   "soft (-)"]
                               [:l-faint  "faint (--)"]]
                    :let [v (get (get-seeds) k)]]
                [:div {:key (name k) :style {:margin-bottom "0.375rem"}}
                 [:div.flex.justify-between.items-center
                  [:label.ty-text- {:style {:font-size "0.6875rem"}} label]
                  [:code.ty-text {:style {:font-size "0.6875rem"}} (.toFixed v 2)]]
                 [:input
                  {:type "range" :min 0 :max 1 :step 0.01 :value v
                   :on {:input (set-by-key! k)}
                   :style {:width "100%" :height "4px"}}]])
              [:p.ty-text-- {:style {:font-size "0.625rem" :line-height 1.4
                                     :margin "0.375rem 0 0"}}
               "Lower L = more emphasis in light mode; higher L = more emphasis in dark."]])])

        ;; SATURATION CURVE section — collapsible.
        (let [{:keys [show-curve?]} (get-seeds)]
          [:div {:style {:margin-bottom "0.75rem" :padding "0.5rem 0.625rem"
                         :background "var(--ty-bg-neutral-soft)" :border-radius "8px"}}
           [:button.w-full.flex.items-center.justify-between
            {:style {:background "transparent" :border "none" :cursor "pointer" :padding 0}
             :on {:click toggle-curve!}}
            [:span.ty-text+ {:style {:font-size "0.6875rem" :font-weight 600
                                     :letter-spacing "0.08em" :text-transform "uppercase"}}
             "Saturation curve"]
            [:span.ty-text- {:style {:font-size "0.6875rem"}}
             (if show-curve? "−" "+")]]
           (when show-curve?
             [:div {:style {:margin-top "0.5rem"}}
              (for [[k label] [[:c-strong-mult "× strong (++)"]
                               [:c-bold-mult   "× bold (+)"]
                               [:c-base-mult   "× base"]
                               [:c-soft-mult   "× soft (-)"]
                               [:c-faint-mult  "× faint (--)"]]
                    :let [v (get (get-seeds) k)]]
                [:div {:key (name k) :style {:margin-bottom "0.375rem"}}
                 [:div.flex.justify-between.items-center
                  [:label.ty-text- {:style {:font-size "0.6875rem"}} label]
                  [:code.ty-text {:style {:font-size "0.6875rem"}} (.toFixed v 2)]]
                 [:input
                  {:type "range" :min 0 :max 1.5 :step 0.01 :value v
                   :on {:input (set-by-key! k)}
                   :style {:width "100%" :height "4px"}}]])
              [:p.ty-text-- {:style {:font-size "0.625rem" :line-height 1.4
                                     :margin "0.375rem 0 0"}}
               "Per-shade chroma multipliers. Each shade's chroma = flavor-chroma × multiplier."]])])

        [:div.flex.justify-between.items-center
         [:a.ty-text-primary {:href "#"
                              :style {:font-size "0.6875rem" :text-decoration "underline"}
                              :on {:click (fn [^js e]
                                            (.preventDefault e)
                                            (router/navigate! :tyrell.site.docs/theming))}}
          "Full reference →"]
         [:button.ty-text-.hover:ty-text
          {:style {:cursor "pointer" :background "transparent" :border "none"
                   :font-size "0.6875rem" :padding "0"}
           :on {:click reset-all!}}
          "Reset"]]])]))

;; ----------------------------------------------------------------------------
;; Live preview — these elements all use the same --ty-* tokens that the
;; brand layer drives. They retint as the seeds change.
;; ----------------------------------------------------------------------------

(defn- preview-buttons []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Buttons — solid / outlined / flavors")
   [:div.flex.flex-wrap.gap-2
    [:ty-button {:flavor "primary"}   "Primary"]
    [:ty-button {:flavor "success"}   "Success"]
    [:ty-button {:flavor "danger"}    "Danger"]
    [:ty-button {:flavor "warning"}   "Warning"]
    [:ty-button {:flavor "neutral"}   "Neutral"]]
   [:div.flex.flex-wrap.gap-2 {:style {:margin-top "0.75rem"}}
    [:ty-button {:flavor "primary"   :outlined ""} "Primary"]
    [:ty-button {:flavor "success"   :outlined ""} "Success"]
    [:ty-button {:flavor "danger"    :outlined ""} "Danger"]
    [:ty-button {:flavor "warning"   :outlined ""} "Warning"]
    [:ty-button {:flavor "neutral"   :outlined ""} "Neutral"]]])

(defn- preview-tags []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Tags / chips")
   [:div.flex.flex-wrap.gap-2
    [:ty-tag {:flavor "primary"   :pill ""} "primary"]
    [:ty-tag {:flavor "success"   :pill ""} "success"]
    [:ty-tag {:flavor "danger"    :pill ""} "danger"]
    [:ty-tag {:flavor "warning"   :pill ""} "warning"]
    [:ty-tag {:flavor "neutral"   :pill ""} "neutral"]]])

(defn- preview-text-ramps []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Text emphasis ramps (--ty-text-{flavor}-*)")
   [:div.grid.gap-4 {:style {:grid-template-columns "repeat(auto-fit, minmax(160px, 1fr))"}}
    (for [flavor ["primary" "success" "danger" "warning" "neutral"]]
      [:div {:key flavor}
       [:p {:class (str "ty-text-" flavor "++") :style {:font-weight 600}} flavor "++"]
       [:p {:class (str "ty-text-" flavor "+")}  flavor "+"]
       [:p {:class (str "ty-text-" flavor)}      flavor]
       [:p {:class (str "ty-text-" flavor "-")}  flavor "-"]
       [:p {:class (str "ty-text-" flavor "--") :style {:font-size "0.8125rem"}} flavor "--"]])]])

(defn- preview-inputs []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Form controls")
   [:div.grid.gap-3 {:style {:grid-template-columns "repeat(auto-fit, minmax(220px, 1fr))"}}
    [:ty-input {:label "Project name" :placeholder "Eg. Q3 launch site"}]
    [:ty-select {:label "Priority" :value "medium"}
     [:ty-option {:value "low"}    "Low"]
     [:ty-option {:value "medium"} "Medium"]
     [:ty-option {:value "high"}   "High"]]
    [:ty-input {:label "Email" :placeholder "you@example.com" :type "email"}]]])

(defn- preview-surfaces []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Surface levels")
   [:div.grid.gap-3 {:style {:grid-template-columns "repeat(auto-fit, minmax(150px, 1fr))"}}
    (for [[surface label] [["canvas"   "ty-canvas"]
                           ["content"  "ty-content"]
                           ["elevated" "ty-elevated"]
                           ["floating" "ty-floating"]]]
      [:div {:key surface
             :class (str "ty-" surface)
             :style {:padding "1rem" :border-radius "8px"
                     :border "1px solid var(--ty-border-soft)"
                     :font-size "0.8125rem"}}
       [:strong.ty-text+ label]
       [:div.ty-text- {:style {:font-size "0.75rem" :margin-top "0.25rem"}} "Surface"]])]])

;; ----------------------------------------------------------------------------
;; Page
;; ----------------------------------------------------------------------------

(defn view []
  (docs-page
   (component-header "Theming"
                     "Two CSS variables re-brand every component — light and dark, no build step, no JS. Everything on this page is live: drag the seeds, watch the library follow.")

    ;; Quick-start
   [:div.ty-elevated.rounded-xl.p-6
    [:div.mb-3
     (section-label "30-second start")]
    (code-block "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css\">
<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell-theme.css\">

<style>
  :root {
    --ty-brand-hue: 200;        /* teal */
    --ty-brand-chroma: 0.13;
  }
</style>")
    [:p.ty-text-.mt-3 {:style {:font-size "0.8125rem"}}
     "That's the whole rebrand. Via npm: "
     [:code "import 'tyrell-components/css/tyrell-theme.css'"] " after tyrell.css."]]

    ;; Playground
   (doc-section "Playground"
                [:div.grid.gap-6 {:replicant/on-mount close-floating-on-mount!
                                  :style {:grid-template-columns "minmax(280px, 360px) 1fr"
                                          :align-items "start"}}
       ;; LEFT: seeds — sticky, natural height. If the panel exceeds the
       ;; viewport the bottom controls fall below the fold (sticky pins the
       ;; top edge). Keep the panel content tight enough to fit.
                 [:div {:style {:position "sticky" :top "1rem"}}
                  (seeds-panel)]

       ;; RIGHT: live preview — short cards share rows, wide previews go full-width.
                 [:div.space-y-4
        ;; Row 1: short utility cards
                  [:div.grid.gap-4 {:style {:grid-template-columns "repeat(auto-fit, minmax(280px, 1fr))"}}
                   (preview-buttons)
                   (preview-tags)]
        ;; Row 2: form/surface cards
                  [:div.grid.gap-4 {:style {:grid-template-columns "repeat(auto-fit, minmax(280px, 1fr))"}}
                   (preview-inputs)
                   (preview-surfaces)]
        ;; Row 3: full-width — needs horizontal room
                  (preview-text-ramps)]])

    ;; Flavor pack builder — name + two seeds in, a full engine-parity
    ;; flavor out, applied LIVE via an injected <style>.
   (doc-section "Flavor pack builder"
                (flavor-pack-builder))

    ;; The formula — how every color is computed
   (doc-section "The formula"
                [:div.ty-content.rounded-lg.p-5
                 [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
                  "Every color in the library is one computation: a flavor (primary … neutral) "
                  "brings hue + chroma, a shade (++ … --) brings the emphasis step."]
                 (code-block "oklch(
  L = L-curve[shade] × flavor-l-factor
  C = flavor-chroma  × saturation-curve[shade]
  H = flavor-hue
)"
                             "css")
                 [:p.ty-text-.mt-4.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
                  "So " [:code "--ty-color-warning-bold"] " = oklch(0.46 0.26 75) — and one seed "
                  "moves a whole flavor: " [:code "--ty-warning-l-factor: 0.85"] " darkens every "
                  "warning shade in step, nothing else moves."]
                 [:div.flex.flex-wrap.gap-3
                  (swatch "L 0.46 (default)" 0.46 0.26 75)
                  (swatch "L 0.39 (×0.85)" 0.39 0.26 75)]
                 [:p.ty-text-.mt-4 {:style {:font-size "0.8125rem" :line-height 1.6}}
                  "Dark mode is the same formula — " [:code "html.dark"] " swaps in a flipped "
                  "L-curve, your seeds carry through untouched."]])

    ;; Override recipes — one block, copy what you need
   (doc-section "Recipes"
                [:div.ty-content.rounded-lg.p-5
                 (code-block ":root {
  /* rotate the brand — usually all you need */
  --ty-brand-hue: 200;
  --ty-brand-chroma: 0.13;

  /* semantic anchors are independent seeds */
  --ty-danger-chroma: 0.2;

  /* pull a semantic flavor toward the brand */
  --ty-success-hue: var(--ty-brand-hue);

  /* pin one derived token — cascade still wins */
  --ty-color-primary-strong: #003344;
}" "css")
                 [:p.ty-text-.mt-4.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
                  "Have a color instead of a hue/chroma pair? Skip the split — seed any flavor "
                  "directly, in any format. The dials above are still read; a seed just bypasses "
                  "them for that one flavor."]
                 (code-block ":root {
  /* one hex, done — hue + chroma read from it,
     lightness still comes from the L-curve */
  --ty-primary-seed: #76467c;

  /* any CSS color works */
  --ty-danger-seed: crimson;
}" "css")])))
