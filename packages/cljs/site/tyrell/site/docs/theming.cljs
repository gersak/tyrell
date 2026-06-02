(ns tyrell.site.docs.theming
  "Interactive playground for the OKLCH brand layer (tyrell-brand.css)."
  (:require
    [clojure.string :as str]
    [tyrell.site.state :as state]
    [tyrell.site.docs.common :refer [code-block doc-section docs-page
                                     component-header section-label demo-area]]))

;; ----------------------------------------------------------------------------
;; State
;; ----------------------------------------------------------------------------
;; Seeds the user can drag. We persist them in the global state atom so the
;; slider remembers its position across re-renders.

(def ^:private default-seeds
  {;; SEEDS — site defaults (also mirrored as :root overrides in
   ;; packages/cljs/public/index.html so first paint matches before CLJS boots).
   :brand-hue 47
   :brand-chroma 0.135
   :secondary-offset -25       ;; degrees; secondary-hue = brand-hue + offset
   :secondary-detached? false
   :secondary-hue 22
   :secondary-chroma 0.135
   ;; PER-FLAVOR HUES — semantic anchors. Defaults match the brand layer's
   ;; CSS fallbacks. Chroma stays bound to the per-flavor multipliers in
   ;; tyrell-brand.css (success ×1.08, warning ×1.15, danger ×1.31) so
   ;; the emphasis hierarchy survives any hue change. Neutral isn't tweakable
   ;; here — it's defined as var(--ty-brand-hue) in the brand layer, so it
   ;; tracks brand automatically.
   :success-hue 145
   :warning-hue 75
   :danger-hue  25
   ;; L-CURVE (light defaults — sliders write inline so they affect
   ;; whatever theme is active when they're touched).
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
   :floating-open? true
   :show-ladder?   false
   :show-curve?    false
   :show-anchors?  true})

(defn- get-seeds []
  (merge default-seeds (get-in @state/state [:brand-playground] {})))

(defn- key->var
  "Map a state key to the CSS variable it drives. Returns nil for keys
   that are UI-only (panels expanded, etc.)."
  [k]
  (case k
    :brand-hue        "--ty-brand-hue"
    :brand-chroma     "--ty-brand-chroma"
    :secondary-offset "--ty-secondary-offset"
    :secondary-hue    "--ty-secondary-hue"
    :secondary-chroma "--ty-secondary-chroma"
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

(defn- set-by-key!
  "Generic onChange — write the parsed number into both state and CSS."
  [k]
  (fn [^js e]
    (let [v (js/parseFloat (.. e -target -value))]
      (swap! state/state assoc-in [:brand-playground k] v)
      (apply-seed! k v))))

(defn- set-brand-hue! [^js e]
  (let [v (js/parseFloat (.. e -target -value))]
    (swap! state/state assoc-in [:brand-playground :brand-hue] v)
    (apply-seed! :brand-hue v)))

(defn- set-brand-chroma! [^js e]
  (let [v (js/parseFloat (.. e -target -value))]
    (swap! state/state assoc-in [:brand-playground :brand-chroma] v)
    (apply-seed! :brand-chroma v)))

(defn- toggle-secondary-detached! [_]
  (let [{:keys [secondary-detached? secondary-hue secondary-chroma]} (get-seeds)
        next-detached? (not secondary-detached?)]
    (swap! state/state assoc-in [:brand-playground :secondary-detached?] next-detached?)
    (if next-detached?
      (do (apply-seed! :secondary-hue secondary-hue)
          (apply-seed! :secondary-chroma secondary-chroma))
      (do (clear-seed! :secondary-hue)
          (clear-seed! :secondary-chroma)))))

(defn- set-secondary-hue! [^js e]
  (let [v (js/parseFloat (.. e -target -value))]
    (swap! state/state assoc-in [:brand-playground :secondary-hue] v)
    (apply-seed! :secondary-hue v)))

(defn- preset! [hue chroma]
  (swap! state/state update :brand-playground assoc
         :brand-hue hue
         :brand-chroma chroma)
  (apply-seed! :brand-hue hue)
  (apply-seed! :brand-chroma chroma))

(defn- reset-all! [_]
  (swap! state/state assoc :brand-playground default-seeds)
  (doseq [k [:brand-hue :brand-chroma :secondary-offset
             :secondary-hue :secondary-chroma
             :success-hue :warning-hue :danger-hue
             :l-strong :l-bold :l-base :l-soft :l-faint
             :c-strong-mult :c-bold-mult :c-base-mult :c-soft-mult :c-faint-mult]]
    (clear-seed! k)))

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

(defn- build-theme-css
  "Render the current seed state as a paste-ready :root block. Only emits
   values that differ from the brand-layer defaults — users get the minimal
   override snippet, not noise."
  [seeds]
  (let [{:keys [brand-hue brand-chroma
                secondary-detached? secondary-hue secondary-offset
                success-hue warning-hue danger-hue]} seeds
        lines (cond-> []
                :always
                (conj (str "  --ty-brand-hue: " (int brand-hue) ";")
                      (str "  --ty-brand-chroma: " (.toFixed brand-chroma 3) ";"))

                secondary-detached?
                (conj (str "  --ty-secondary-hue: " (int secondary-hue) ";"))

                (and (not secondary-detached?) (not= (int secondary-offset) 60))
                (conj (str "  --ty-secondary-offset: " (int secondary-offset) ";"))

                (not= (int success-hue) 145)
                (conj (str "  --ty-success-hue: " (int success-hue) ";"))

                (not= (int warning-hue) 75)
                (conj (str "  --ty-warning-hue: " (int warning-hue) ";"))

                (not= (int danger-hue) 25)
                (conj (str "  --ty-danger-hue: " (int danger-hue) ";")))]
    (str ":root {\n" (str/join "\n" lines) "\n}")))

(defn seeds-panel
  "Interactive brand-seeds widget. Exported so the CSS Guide page can embed it
   as a sticky side rail — drag the sliders, scroll through the design system,
   watch every swatch/ramp retint in place."
  []
  (let [{:keys [brand-hue brand-chroma
                secondary-detached? secondary-hue
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

     ;; Compact detach-secondary toggle
     [:label.flex.items-center.gap-2.cursor-pointer
      {:style {:margin-bottom "0.5rem"}}
      [:input {:type "checkbox" :checked secondary-detached?
               :on {:change toggle-secondary-detached!}}]
      [:span.ty-text- {:style {:font-size "0.75rem"}}
       "Detach secondary (otherwise rotates with brand)"]]
     (when secondary-detached?
       [:div {:style {:margin-bottom "0.75rem"}}
        [:div.flex.justify-between.items-center.mb-1
         [:label.ty-text- {:style {:font-size "0.6875rem"}}
          [:code "--ty-secondary-hue"]]
         [:code.ty-text {:style {:font-size "0.6875rem"}}
          (str (int secondary-hue) "°")]]
        [:input
         {:type "range" :min 0 :max 360 :step 1
          :value secondary-hue
          :on {:input set-secondary-hue!}
          :style {:width "100%" :height "6px"}}]])

     ;; Per-flavor hue anchors — collapsible. Power-user surface for
     ;; retinting semantic colors (success/warning/danger/neutral). Chroma
     ;; stays bound to brand-chroma multipliers in tyrell-brand.css so the
     ;; emphasis hierarchy survives any hue change.
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
          "warning ×1.15, danger ×1.31). Only the hue changes. Neutral tracks "
          "brand automatically."]])]

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
          "Lightness per shade. Light mode: lower L = more emphasis. Dark "
          "mode inverts these values automatically."]])]

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

     ;; Theme export — paste-ready :root override snippet.
     [:div {:style {:margin-top "0.75rem"}}
      [:ty-copy {:label "Theme snippet — paste into your :root"
                 :value (build-theme-css (get-seeds))
                 :format "code"
                 :multiline true}]]]))

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
                       :background (str "oklch(0.55 " brand-chroma " " brand-hue ")")
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
                         :background (str "oklch(0.55 " brand-chroma " " brand-hue ")")
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

        ;; Secondary offset — how far secondary rotates from brand hue.
        (let [{:keys [secondary-offset]} (get-seeds)]
          [:div {:style {:margin-bottom "0.75rem"}}
           [:div.flex.justify-between.items-center.mb-1
            [:label.ty-text- {:style {:font-size "0.6875rem"}}
             [:code "--ty-secondary-offset"]]
            [:code.ty-text {:style {:font-size "0.6875rem"}}
             (str (if (pos? secondary-offset) "+" "") (int secondary-offset) "°")]]
           [:input
            {:type "range" :min -180 :max 180 :step 5 :value secondary-offset
             :on {:input (set-by-key! :secondary-offset)}
             :style {:width "100%"
                     :background (str "linear-gradient(to right,"
                                      " oklch(0.6 0.18 " (mod (- brand-hue 180) 360) "),"
                                      " oklch(0.6 0.18 " brand-hue "),"
                                      " oklch(0.6 0.18 " (mod (+ brand-hue 180) 360) "))")
                     :border-radius "4px" :height "6px"
                     :appearance "none" :outline "none"}}]])

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
         [:a.ty-text-primary {:href "/guides/theming"
                              :style {:font-size "0.6875rem" :text-decoration "underline"}}
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
    [:ty-button {:flavor "secondary"} "Secondary"]
    [:ty-button {:flavor "success"}   "Success"]
    [:ty-button {:flavor "danger"}    "Danger"]
    [:ty-button {:flavor "warning"}   "Warning"]
    [:ty-button {:flavor "neutral"}   "Neutral"]]
   [:div.flex.flex-wrap.gap-2 {:style {:margin-top "0.75rem"}}
    [:ty-button {:flavor "primary"   :outlined ""} "Primary"]
    [:ty-button {:flavor "secondary" :outlined ""} "Secondary"]
    [:ty-button {:flavor "success"   :outlined ""} "Success"]
    [:ty-button {:flavor "danger"    :outlined ""} "Danger"]
    [:ty-button {:flavor "warning"   :outlined ""} "Warning"]
    [:ty-button {:flavor "neutral"   :outlined ""} "Neutral"]]])

(defn- preview-tags []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Tags / chips")
   [:div.flex.flex-wrap.gap-2
    [:ty-tag {:flavor "primary"   :pill ""} "primary"]
    [:ty-tag {:flavor "secondary" :pill ""} "secondary"]
    [:ty-tag {:flavor "success"   :pill ""} "success"]
    [:ty-tag {:flavor "danger"    :pill ""} "danger"]
    [:ty-tag {:flavor "warning"   :pill ""} "warning"]
    [:ty-tag {:flavor "neutral"   :pill ""} "neutral"]]])

(defn- preview-text-ramps []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Text emphasis ramps (--ty-text-{flavor}-*)")
   [:div.grid.gap-4 {:style {:grid-template-columns "repeat(auto-fit, minmax(160px, 1fr))"}}
    (for [flavor ["primary" "secondary" "success" "danger" "warning" "neutral"]]
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
    [:ty-dropdown {:label "Priority" :value "medium"}
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

(defn- preview-bg-tints []
  [:div.ty-content.rounded-lg.p-5
   (section-label "Background tints (--ty-bg-{flavor}-*)")
   [:div.grid.gap-3 {:style {:grid-template-columns "repeat(auto-fit, minmax(220px, 1fr))"}}
    (for [flavor ["primary" "secondary" "success" "danger" "warning"]]
      [:div {:key flavor :style {:display "flex" :gap "0.375rem"}}
       (for [shade ["soft" "" "bold"]
             :let [cls (str "ty-bg-" flavor (when (seq shade) (str "-" shade)))
                   l   (if (= shade "bold") "+" (when (= shade "soft") "-"))]]
         [:div {:key (str flavor shade)
                :class [cls]
                :style {:flex 1 :padding "0.75rem" :border-radius "6px"
                        :font-size "0.75rem" :text-align "center"}}
          [:span {:class (str "ty-text-" flavor)} flavor l]])])]])

;; ----------------------------------------------------------------------------
;; Page
;; ----------------------------------------------------------------------------

(defn view []
  (docs-page
    (component-header "Theming — OKLCH brand layer"
                      "Opt-in CSS file. Load it after tyrell.css, set 2 seed variables, get a coherent brand across every component in light + dark mode. The 186 hexes in tyrell.css stay untouched — this layer overrides them via the cascade.")

    ;; Quick-start
    [:div.ty-elevated.rounded-xl.p-6
     [:div.mb-3
      (section-label "30-second start")]
     (code-block "<!-- 1. Load after tyrell.css -->
<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css\">
<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell-brand.css\">

<!-- 2. Rebrand the entire UI in 2 lines -->
<style>
  :root {
    --ty-brand-hue: 200;        /* teal */
    --ty-brand-chroma: 0.13;
  }
</style>")
     [:p.ty-text-.mt-3 {:style {:font-size "0.8125rem"}}
      "Or via npm: " [:code "import 'tyrell-components/css/tyrell-brand.css'"]
      " after the main tyrell.css import."]]

    ;; Playground
    (doc-section "Playground"
      [:div.grid.gap-6 {:replicant/on-mount close-floating-on-mount!
                        :style {:grid-template-columns "minmax(280px, 360px) 1fr"
                                :align-items "start"}}
       ;; LEFT: seeds
       (seeds-panel)

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
        ;; Row 3 & 4: full-width — these need horizontal room
        (preview-text-ramps)
        (preview-bg-tints)]])

    ;; Architecture
    (doc-section "How the layer is built"
      [:div.space-y-4
       [:div.ty-content.rounded-lg.p-5
        (section-label "Shared lightness stops")
        [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
         "All flavors derive their 5-shade text ramp from the same lightness stops: "
         [:code "0.40 / 0.52 / 0.66 / 0.82 / 0.95"]
         ". Chroma drops near the extremes (near-white and near-black can't hold saturation). Only hue and base chroma vary per flavor — that's what keeps "
         [:code "success-bold"] " and " [:code "danger-bold"]
         " at the same perceptual weight."]
        [:div.flex.flex-wrap.gap-3
         (swatch "L 0.40" 0.40 0.13 230)
         (swatch "L 0.52" 0.52 0.13 230)
         (swatch "L 0.66" 0.66 0.12 230)
         (swatch "L 0.82" 0.82 0.08 230)
         (swatch "L 0.95" 0.95 0.03 230)]]

       [:div.ty-content.rounded-lg.p-5
        (section-label "Semantic anchors")
        [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
         "Success / danger / warning ship with fixed anchor hues ("
         [:code "145°"] " / " [:code "25°"] " / " [:code "75°"]
         ") so they keep their meaning when you change " [:code "--ty-brand-hue"]
         ". Override " [:code "--ty-success-hue"]
         " etc. if you want them to follow the brand instead."]]

       [:div.ty-content.rounded-lg.p-5
        (section-label "Secondary rotates with brand")
        [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
         "By default " [:code "--ty-secondary-hue: calc(var(--ty-brand-hue) + 60)"]
         " — secondary tracks brand as a sibling accent. Set it to a fixed number
          to detach (useful when your brand book specifies a secondary)."]]

       [:div.ty-content.rounded-lg.p-5
        (section-label "Dark mode reads the same seeds")
        [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
         "The " [:code "html.dark"] " block uses inverted L-stops (text 0.80–0.28,
          bg around 0.22) on the SAME hue/chroma seeds. Toggle the theme button
          at the top — every component re-renders coherently in both modes from
          the single brand pick."]]])

    ;; Override recipes
    (doc-section "Override recipes"
      [:div.space-y-6
       [:div.ty-content.rounded-lg.p-5
        (section-label "Just rotate the brand (most common)")
        (code-block ":root {
  --ty-brand-hue: 200;       /* teal */
  --ty-brand-chroma: 0.13;
}" "css")]

       [:div.ty-content.rounded-lg.p-5
        (section-label "Detach secondary from brand")
        (code-block ":root {
  --ty-brand-hue: 200;
  --ty-secondary-hue: 30;    /* warm orange instead of brand+60 */
  --ty-secondary-chroma: 0.16;
}" "css")]

       [:div.ty-content.rounded-lg.p-5
        (section-label "Pin a single derived token")
        [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
         "The brand layer derives everything from seeds, but the cascade still
          resolves consumer overrides of individual derived tokens. Useful for a
          one-off adjustment without abandoning the formula."]
        (code-block ":root {
  --ty-brand-hue: 200;
  --ty-color-primary-strong: #003344;  /* override just this one shade */
}" "css")]

       [:div.ty-content.rounded-lg.p-5
        (section-label "Make success follow the brand")
        (code-block ":root {
  --ty-brand-hue: 200;
  --ty-success-hue: var(--ty-brand-hue);  /* success goes teal too */
}" "css")]])

    ;; All seeds reference
    (doc-section "All seeds"
      [:div.ty-content.rounded-lg.p-5
       [:p.ty-text-.mb-3 {:style {:font-size "0.8125rem" :line-height 1.6}}
        "Each flavor exposes two seeds: a hue (0–360) and a chroma (0–0.3).
         The brand layer wires sensible defaults so a single "
        [:code "--ty-brand-hue"] " change cascades through related flavors."]
       (code-block "/* Primary — THE brand. */
--ty-brand-hue:    230;
--ty-brand-chroma: 0.13;

/* Secondary — rotates with brand by default. */
--ty-secondary-hue:    calc(var(--ty-brand-hue) + 60);
--ty-secondary-chroma: var(--ty-brand-chroma);

/* Semantic anchors — fixed by default. */
--ty-success-hue: 145;  --ty-success-chroma: 0.14;
--ty-danger-hue:   25;  --ty-danger-chroma:  0.17;
--ty-warning-hue:  75;  --ty-warning-chroma: 0.15;

/* Neutral — tracks brand at very low chroma. */
--ty-neutral-hue:    var(--ty-brand-hue);
--ty-neutral-chroma: 0.005;" "css")])))
