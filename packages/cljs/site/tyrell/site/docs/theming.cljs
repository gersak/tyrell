(ns tyrell.site.docs.theming
  "Interactive playground for the OKLCH theme engine (tyrell-theme.css)."
  (:require
   [clojure.string :as str]
   [tyrell.router :as router]
   [tyrell.site.state :as state]
   [tyrell.site.docs.common :as common]
   [tyrell.site.docs.tokens :as tokens]))

;; Seeds the user can drag. We persist them in the global state atom so the
;; slider remembers its position across re-renders.

(def default-seeds
  {;; SEEDS — mirror tyrell-theme.css's OWN :root defaults exactly (not a
   ;; separate site pick) so the CONTENT area starts from the library's
   ;; shipped default and the playground is purely "tweak away from here."
   ;; Also mirrored as :root overrides in packages/cljs/public/index.html
   ;; so first paint matches before CLJS boots. Chrome is the one exception
   ;; — it's pinned to the Tyrell identity orange, see styles.cljs. Demos
   ;; inside the chrome (.site-demo) are pinned to this map.
   :primary-hue 243
   :primary-chroma 0.105
   ;; PER-FLAVOR HUES + CHROMA — every flavor is a standalone hue+chroma
   ;; seed, primary included; none derives from another. Defaults mirror
   ;; tyrell-theme.css's own :root literals. Neutral isn't tweakable here —
   ;; it's achromatic by default (hue 0, chroma 0), independent of primary.
   :success-hue 145
   :warning-hue 76
   :danger-hue  31
   :success-chroma 0.086
   :warning-chroma 0.178
   :danger-chroma  0.134
   ;; PER-FLAVOR L-FACTOR — Tier 4. One multiplier shifts all 5 shades of
   ;; a flavor up/down without touching the shared curve.
   :primary-l-factor 0.9
   :success-l-factor 1
   :warning-l-factor 1.3
   :danger-l-factor  0.93
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
   :floating-open? false
   :show-ladder?   false
   :show-curve?    false
   :show-anchors?  true})

;; The theme engine redefines EVERY tier per theme now — per-flavor
;; hue/chroma (primary included), l-factor, the L-curve and the saturation
;; curve all differ between :root and html.dark in tyrell-theme.css — so
;; every dial is theme-scoped: stored under [:brand-playground :curves
;; <theme>] and applied via an injected <style> with :root / html.dark
;; blocks. An inline style on <html> would clobber BOTH themes at once,
;; which is why nothing here writes to documentElement.style anymore
;; except the legacy-hygiene path in reset-all!.
(def curve-keys
  #{:primary-hue :primary-chroma
    :success-hue :warning-hue :danger-hue
    :success-chroma :warning-chroma :danger-chroma
    :primary-l-factor :success-l-factor :warning-l-factor :danger-l-factor
    :l-strong :l-bold :l-base :l-soft :l-faint
    :c-strong-mult :c-bold-mult :c-base-mult :c-soft-mult :c-faint-mult})

;; Mirror of the html.dark block in tyrell-theme.css.
(def dark-curve-defaults
  {:primary-hue 226 :primary-chroma 0.065
   :success-hue 129 :warning-hue 82 :danger-hue 13
   :success-chroma 0.092 :warning-chroma 0.195 :danger-chroma 0.101
   :success-l-factor 1.09 :warning-l-factor 1.5 :danger-l-factor 1.06
   :l-strong 0.72 :l-bold 0.66 :l-base 0.62 :l-soft 0.46 :l-faint 0.30
   :c-strong-mult 0.77 :c-bold-mult 1.00 :c-base-mult 0.92 :c-soft-mult 0.77
   :c-faint-mult 0.50})

(defn- active-theme []
  (if (= "dark" (:theme @state/state)) :dark :light))

(defn- get-seeds
  "Merged seed view for the ACTIVE theme: flavor defaults, dark curve
   defaults when dark, then the user's per-theme curve overrides."
  []
  (let [st (:brand-playground @state/state)
        theme (active-theme)]
    (merge default-seeds
           (when (= theme :dark) dark-curve-defaults)
           (apply dissoc st :curves curve-keys)
           (get-in st [:curves theme]))))

(defn- key->var
  "Map a dial key to the CSS variable it drives. Nil for UI-only keys."
  [k]
  (when (curve-keys k) (str "--ty-" (name k))))

(def ^:private hue-keys #{:primary-hue :success-hue :warning-hue :danger-hue})
(def ^:private chroma-keys #{:primary-chroma :success-chroma :warning-chroma :danger-chroma})

;; One formatter shared by the live <style> writer (curve-css) and the
;; export text (theme-dial-lines) — hues are integers, chromas get 3
;; decimals (their slider step is 0.001–0.005), everything else 2.
(defn- fmt-dial-value [k v]
  (cond (hue-keys k) (str (int v))
        (chroma-keys k) (.toFixed v 3)
        :else (.toFixed v 2)))

(defn- dial-value-line [k v]
  (str "  " (key->var k) ": " (fmt-dial-value k v) ";"))

(defn- clear-seed!
  "Remove the inline override so the theme engine's default takes back over."
  [k]
  (when-let [css-name (key->var k)]
    (.removeProperty (.-style (.-documentElement js/document)) css-name)))

(defn- curve-css
  "Render the per-theme curve overrides as :root / html.dark blocks. The dark
   block also targets scoped [data-ty-theme].dark sections, which declare their
   own dark dials and would otherwise ignore the playground."
  [st]
  (let [block (fn [sel lines]
                (when (seq lines)
                  (str sel " {\n" (str/join "\n" lines) "\n}")))
        lines (fn [m] (for [[k v] m] (dial-value-line k v)))
        ;; A hex seed is theme-invariant: the curve still sets lightness.
        seed (when-let [c (:primary-seed st)] [(str "  --ty-primary-seed: " c ";")])]
    (str/join "\n" (remove nil? [(block ":root" (concat (lines (get-in st [:curves :light])) seed))
                                 (block "html.dark, [data-ty-theme].dark" (lines (get-in st [:curves :dark])))]))))

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
    (set! (.-textContent el) (curve-css (:brand-playground @state/state)))))

(defn- set-dial!
  "Write one dial for the ACTIVE theme: state + the live style tag."
  [k v]
  (swap! state/state assoc-in [:brand-playground :curves (active-theme) k] v)
  (sync-curve-style!))

(defn- set-by-key!
  "Range-input onInput handler for dial K."
  [k]
  (fn [^js e] (set-dial! k (js/parseFloat (.. e -target -value)))))

(defn- preset! [hue chroma]
  (swap! state/state (fn [st]
                       (-> st
                           (update :brand-playground dissoc :primary-seed)
                           (update-in [:brand-playground :curves (active-theme)] assoc
                                      :primary-hue hue :primary-chroma chroma))))
  (sync-curve-style!))

(defn- set-primary-seed!
  "Hex seed for primary (nil = back to hue/chroma)."
  [color]
  (swap! state/state update :brand-playground
         #(if color (assoc % :primary-seed color) (dissoc % :primary-seed)))
  (sync-curve-style!))

(defn- reset-all! [_]
  (swap! state/state assoc :brand-playground default-seeds)
  ;; The legacy theming page still writes dials inline on <html>.
  (run! clear-seed! curve-keys)
  ;; Pre-TC49 builds could have written these directly-named custom
  ;; properties inline; key->var no longer maps to them (renamed to
  ;; --ty-primary-*, chroma multipliers flattened to literals), so
  ;; clear-seed! above is a no-op for them — remove by literal name instead.
  (doseq [css-name ["--ty-brand-hue" "--ty-brand-chroma" "--ty-brand-l-factor"]]
    (.removeProperty (.-style (.-documentElement js/document)) css-name))
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

;; The inline seeds-panel on THIS page duplicates the floating widget — close
;; the float on mount so the page lands clean. Users can still pop it back open.
(defn- close-floating-on-mount! [_]
  (swap! state/state assoc-in [:brand-playground :floating-open?] false))

(defn- theme-dial-lines
  "Seed + curve dials that differ from the theme engine's defaults, as CSS
   lines. Returns {:light [...] :dark [...]}. primary-hue/primary-chroma
   are ALWAYS shown for :light — the two-line rebrand headline —
   everything else, in both themes, is diff-only against tyrell-theme.css's
   own defaults."
  [seeds]
  (let [always-light (if-let [c (:primary-seed seeds)]
                       [(str "  --ty-primary-seed: " c ";")]
                       [(dial-value-line :primary-hue (:primary-hue seeds))
                        (dial-value-line :primary-chroma (:primary-chroma seeds))])
        diff-lines (fn [theme]
                     (let [defaults (cond-> default-seeds
                                      (= theme :dark) (merge dark-curve-defaults))
                           ;; light's primary-hue/chroma are already covered by
                           ;; always-light above — skip so they don't double up.
                           touched (cond-> (get-in @state/state [:brand-playground :curves theme])
                                     (= theme :light) (dissoc :primary-hue :primary-chroma))]
                       (for [[k v] touched
                             :when (not= v (get defaults k))]
                         (dial-value-line k v))))]
    {:light (concat always-light (diff-lines :light))
     :dark (diff-lines :dark)}))

(defn- build-theme-css
  "Render the current seed state as a paste-ready :root block. Only emits
   values that differ from the theme engine's defaults — users get the
   minimal override snippet, not noise."
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

;; Flavor pack builder — the CSS_GUIDE "flavor pack" template, generated live.
;; A custom flavor declared this way gets FULL engine parity: shared L-curve,
;; saturation curve, dark mode via the same dial flips (no dark block of its
;; own), solid interaction states, auto-contrast foregrounds, theme scoping.

(def ^:private flavor-pack-defaults
  ;; :mode "oklch" is an OKLCH-native seed — an alternative to the hex picker
  ;; for people who think in hue/chroma. The active mode is what gets exported.
  {:name "mr-hanky" :color "#784011" :mode "hex" :hue 55 :chroma 0.097 :l-factor 0.86})

(defn- flavor-pack []
  (merge flavor-pack-defaults (:flavor-pack @state/state)))

(defn- fpb-seed
  "The seed CSS value, per the active mode."
  [{:keys [mode hue chroma color]}]
  (if (= mode "oklch")
    (str "oklch(0.5 " (.toFixed chroma 3) " " (int hue) ")")
    color))

(defn- fpb-set! [k]
  (fn [^js e]
    (let [raw (.. e -target -value)
          v (if (= k :name) (str/replace raw #"[^a-zA-Z0-9_-]" "") raw)]
      (swap! state/state assoc-in [:flavor-pack k] v))))

(defn- fpb-set-num! [k]
  (fn [^js e]
    (swap! state/state assoc-in [:flavor-pack k] (js/parseFloat (.. e -target -value)))))

(defn- fpb-set-mode! [m] (fn [_] (swap! state/state assoc-in [:flavor-pack :mode] m)))

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
        ;; bg is the tint track: the flavor's BASE ink at low alpha,
        ;; composited over whatever surface it sits on (see the BG TRACK
        ;; note in tyrell-theme.css). Direction per mode is automatic;
        ;; the --ty-a-bg-* dials set the wash amount.
        bg (fn [tok alpha]
             (str "  --ty-bg-" nm tok ": oklch(from var(--ty-color-" nm
                  ") l c h / var(--ty-a-bg-" alpha "));"))
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
     (bg "" "base") (bg "-bold" "bold") (bg "-soft" "soft")
     (str "  --ty-border-" nm ": var(--ty-color-" nm "-soft);")
     (str "  --ty-solid-" nm ": oklch(from var(--ty-color-" nm
          ") calc(l + var(--ty-solid-l)) calc(c * var(--ty-solid-c)) calc(h + var(--ty-solid-h)));")
     (solid-state "hover" "hover-l") (solid-state "active" "active-l")
     (solid-state "strong" "strong-l") (solid-state "soft" "soft-l")
     (fg "" "") (fg "-soft" "-soft") (fg "-strong" "-strong")]))

(defn flavor-pack-css
  "The full pack for flavor NAME seeded by one SEED (hex or oklch()) plus
   an optional L-FACTOR — the same template CSS_GUIDE documents. The
   exported seed (+ l-factor, when touched) is the entire per-project
   surface; the ramp is engine boilerplate."
  [nm seed l-factor hex?]
  (str ":root {\n"
       "  --ty-" nm "-seed: " seed ";" (when hex? " /* the one color you pick */") "\n"
       (when (not= l-factor 1)
         (str "  --ty-" nm "-l-factor: " l-factor "; /* shifts all 5 shades at once */\n"))
       "}\n\n"
       "html:root,\n[data-ty-theme] {\n"
       (str/join "\n" (flavor-pack-ramp-lines nm))
       "\n}"))

(defn- hue-gradient [l c]
  (str "linear-gradient(to right,"
       (str/join "," (for [h (range 0 361 30)] (str " oklch(" l " " c " " h ")")))
       ")"))

(defn floating-seeds
  "Compact always-on widget pinned to the bottom-right corner. Collapses to a
   small chip on click. Use this on docs pages where you want the visitor to
   tweak the theme while scrolling the page contents (e.g. the CSS Guide)."
  []
  (let [{:keys [primary-hue primary-chroma floating-open? show-ladder? show-curve?] :as seeds} (get-seeds)]
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
         "Theme"]]

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
           "Theme seeds"]]
         [:button.ty-text-.hover:ty-text
          {:style {:cursor "pointer" :background "transparent" :border "none"
                   :padding "0.125rem 0.375rem" :line-height 1}
           :on {:click toggle-floating!}
           :title "Collapse"}
          [:ty-icon {:name "x" :size "14"}]]]

        [:div {:style {:margin-bottom "0.75rem"}}
         [:div.flex.justify-between.items-center.mb-1
          [:label.ty-text- {:style {:font-size "0.6875rem"}}
           [:code "--ty-primary-hue"]]
          [:code.ty-text {:style {:font-size "0.6875rem"}}
           (str (int primary-hue) "°")]]
         [:input
          {:type "range" :min 0 :max 360 :step 1 :value primary-hue
           :on {:input (set-by-key! :primary-hue)}
           :style {:width "100%"
                   :background (hue-gradient 0.6 0.18)
                   :border-radius "4px" :height "6px"
                   :appearance "none" :outline "none"}}]]

        [:div {:style {:margin-bottom "0.75rem"}}
         [:div.flex.justify-between.items-center.mb-1
          [:label.ty-text- {:style {:font-size "0.6875rem"}}
           [:code "--ty-primary-chroma"]]
          [:code.ty-text {:style {:font-size "0.6875rem"}}
           (.toFixed primary-chroma 3)]]
         [:input
          {:type "range" :min 0 :max 0.3 :step 0.005 :value primary-chroma
           :on {:input (set-by-key! :primary-chroma)}
           :style {:width "100%"
                   :background (str "linear-gradient(to right,"
                                    " oklch(0.6 0 " primary-hue "),"
                                    " oklch(0.6 0.3 " primary-hue "))")
                   :border-radius "4px" :height "6px"
                   :appearance "none" :outline "none"}}]]

        [:div.flex.flex-wrap.gap-1 {:style {:margin-bottom "0.75rem"}}
         (for [[label hue chroma]
               [["Tyrell" 230 0.13] ["Teal" 200 0.13] ["Indigo" 260 0.14]
                ["Emerald" 145 0.13] ["Orange" 30 0.16] ["Rose" 350 0.16]
                ["Violet" 290 0.14]]]
           [:button
            {:replicant/key label
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
                  :let [v (get seeds k)]]
              [:div {:replicant/key (name k) :style {:margin-bottom "0.375rem"}}
               [:div.flex.justify-between.items-center
                [:label.ty-text- {:style {:font-size "0.6875rem"}} label]
                [:code.ty-text {:style {:font-size "0.6875rem"}} (.toFixed v 2)]]
               [:input
                {:type "range" :min 0 :max 1 :step 0.01 :value v
                 :on {:input (set-by-key! k)}
                 :style {:width "100%" :height "4px"}}]])
            [:p.ty-text-- {:style {:font-size "0.625rem" :line-height 1.4
                                   :margin "0.375rem 0 0"}}
             "Lower L = more emphasis in light mode; higher L = more emphasis in dark."]])]

        ;; SATURATION CURVE section — collapsible.
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
                  :let [v (get seeds k)]]
              [:div {:replicant/key (name k) :style {:margin-bottom "0.375rem"}}
               [:div.flex.justify-between.items-center
                [:label.ty-text- {:style {:font-size "0.6875rem"}} label]
                [:code.ty-text {:style {:font-size "0.6875rem"}} (.toFixed v 2)]]
               [:input
                {:type "range" :min 0 :max 1.5 :step 0.01 :value v
                 :on {:input (set-by-key! k)}
                 :style {:width "100%" :height "4px"}}]])
            [:p.ty-text-- {:style {:font-size "0.625rem" :line-height 1.4
                                   :margin "0.375rem 0 0"}}
             "Per-shade chroma multipliers. Each shade's chroma = flavor-chroma × multiplier."]])]

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

;; Live preview — these elements all use the same --ty-* tokens that the
;; theme engine drives. They retint as the seeds change.

;; Type & shape — two non-color tokens, no OKLCH derivation needed. Same
;; "minimal variable surface" point as the seeds above, just for
;; --ty-font-sans and --ty-radius-{base,md}, the literal tokens every
;; component already reads.

(def ^:private font-presets
  [["sans" "Sans (default)" nil]
   ["serif" "Serif" "Georgia, Cambria, \"Times New Roman\", Times, serif"]
   ["mono" "Monospace" "\"JetBrains Mono\", \"Fira Code\", ui-monospace, SFMono-Regular, monospace"]])

(def ^:private radius-presets
  [["0" "Sharp"] ["4" "Subtle"] ["8" "Default"] ["16" "Soft"] ["9999" "Pill"]])

(defn- tp-set! [k v] (swap! state/state assoc-in [:typography-picker k] v))

(defn- font-stack [font]
  (some (fn [[k _ v]] (when (= k font) v)) font-presets))

(defn- tp-chip [selected? label on-click]
  [:ty-button {:size "xs" :flavor "neutral"
               :appearance (if selected? "solid" "outlined")
               :on {:click on-click}}
   label])

;; ---------------------------------------------------------------------------
;; v2 page — hero, quick start, playground studio, live formula, flavor
;; tweaks, custom flavors, type & shape. Section shell/rail come from docs.common.
;; ---------------------------------------------------------------------------

(def ^:private flavors ["primary" "success" "danger" "warning" "neutral"])

(def ^:private shades
  "[label token-suffix l-key c-key] — strongest to faintest."
  [["++" "-strong" :l-strong :c-strong-mult]
   ["+" "-bold" :l-bold :c-bold-mult]
   ["base" "" :l-base :c-base-mult]
   ["-" "-soft" :l-soft :c-soft-mult]
   ["--" "-faint" :l-faint :c-faint-mult]])

(def ^:private presets
  [["Tyrell" 42 0.15] ["Teal" 200 0.13] ["Indigo" 265 0.14] ["Emerald" 155 0.13]
   ["Rose" 5 0.15] ["Amber" 80 0.15] ["Graphite" 252 0.02]])

(def ^:private page-css
  "Range inputs styled once for the whole page."
  ".th-range { appearance: none; -webkit-appearance: none; width: 100%; height: 8px; border-radius: 999px; background: var(--ty-bg-neutral); outline: none; margin: 0; }
.th-range::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 1px solid rgb(0 0 0 / 0.2); box-shadow: 0 1px 3px rgb(0 0 0 / 0.25); cursor: pointer; }
.th-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 1px solid rgb(0 0 0 / 0.2); box-shadow: 0 1px 3px rgb(0 0 0 / 0.25); cursor: pointer; }")

(defn- preset-active? [{:keys [primary-hue primary-chroma primary-seed]} [_ h c]]
  (and (not primary-seed)
       (= (int primary-hue) h) (= (.toFixed primary-chroma 3) (.toFixed c 3))))

(defn- on-color
  "Black or white text on a token's color, picked from its own lightness."
  [token]
  (str "oklch(from var(" token ") clamp(0, (0.62 - l) * 1000, 1) 0 0)"))

(defn- fmt-dial [k v]
  (str (fmt-dial-value k v) (when (hue-keys k) "°")))

(defn- range-input [k v {:keys [min max step background]}]
  [:input.th-range {:type "range" :min min :max max :step step :value v
                    :on {:input (set-by-key! k)}
                    :style (when background {:background background})}])

(defn- dial [label k v opts]
  [:div.flex.flex-col.gap-2 {:replicant/key (name k)}
   [:div.flex.justify-between.font-mono.text-xs
    [:span.ty-text label]
    [:span.ty-text++.font-semibold (fmt-dial k v)]]
   (range-input k v opts)])

(defn- kicker [text]
  [:span.text-xs.font-semibold.uppercase.tracking-widest.ty-text-- text])

;; --- Hero ---------------------------------------------------------------------

(defn- spectrum-card
  "A real button, switch and selected day scoped to one hue — click to
   load that hue into the playground."
  [[label hue chroma] active?]
  [:button.flex.flex-col.gap-3.rounded-2xl.border.p-3.text-left.cursor-pointer.transition-colors
   {:replicant/key label
    :data-ty-theme ""
    :class (if active? ["ty-border-primary"] ["ty-border-"])
    :style {"--ty-primary-hue" (str hue) "--ty-primary-chroma" (str chroma)
            ;; a playground hex seed would override the card's own hue
            "--ty-primary-seed" "initial"
            :background "var(--ty-surface-elevated)"}
    :on {:click #(preset! hue chroma)}}
   [:span.flex.items-center.justify-between.gap-2
    [:span.flex.items-center.text-xs.font-semibold.ty-text++ {:class ["gap-1.5"]}
     [:span.w-2.h-2.rounded-full {:style {:background "var(--ty-color-primary)"}}] label]
    [:span.font-mono.ty-text-- {:style {:font-size "0.625rem"}} (str "h " hue)]]
   [:ty-button {:flavor "primary" :size "sm" :style {:width "100%"}} "Save"]
   [:span.flex.items-center.justify-between
    [:ty-switch {:checked "" :size "sm"}]
    [:span.inline-flex.items-center.justify-center.rounded-md.text-xs.font-semibold
     {:style {:width "1.75rem" :height "1.75rem"
              :background "var(--ty-solid-primary)" :color "var(--ty-solid-primary-fg)"}}
     "24"]]])

(defn- theming-hero [{:keys [primary-hue primary-chroma primary-seed] :as seeds}]
  (common/hero-shell
   [:div.relative.flex.flex-col.gap-8.p-8.md:p-12
    [:div.flex.flex-col.gap-4
     [:span.text-xs.font-semibold.uppercase.ty-text-primary {:style {:letter-spacing "0.16em"}}
      "Guides · Theming"]
     [:h1.ty-text++.font-bold
      {:style {:font-size "clamp(2.5rem, 5.5vw, 4rem)" :line-height "1.02" :letter-spacing "-0.045em"}}
      "Two variables." [:br] "Every component."]]
    [:div.flex.flex-col.lg:flex-row.lg:items-end.justify-between.gap-6
     [:p.ty-text-.leading-relaxed {:style {:max-width "30rem"}}
      "Hue and chroma in, a full OKLCH palette out — five flavors, five shades each, light and dark. No build step, no JavaScript."]
     [:div.relative.rounded-xl.border.ty-border-.pl-5.pr-12.py-4.font-mono.text-sm.leading-6.shrink-0.whitespace-pre
      {:style {:background "color-mix(in oklch, var(--ty-text-strong) 5%, transparent)"}}
      [:div.absolute.top-2.right-2
       (common/copy-button (if primary-seed
                             (str ":root {\n  --ty-primary-seed: " primary-seed ";\n}")
                             (str ":root {\n  --ty-primary-hue: " (int primary-hue)
                                  ";\n  --ty-primary-chroma: " (.toFixed primary-chroma 3) ";\n}")))]
      [:div [:span.ty-text-primary ":root"] [:span.ty-text- " {"]]
      (if primary-seed
        [:div "  " [:span.ty-text-success "--ty-primary-seed"] [:span.ty-text- ": "]
         [:span.ty-text++ primary-seed] [:span.ty-text- ";"]]
        (list
         [:div "  " [:span.ty-text-success "--ty-primary-hue"] [:span.ty-text- ": "]
          [:span.ty-text++ (int primary-hue)] [:span.ty-text- ";"]]
         [:div "  " [:span.ty-text-success "--ty-primary-chroma"] [:span.ty-text- ": "]
          [:span.ty-text++ (.toFixed primary-chroma 3)] [:span.ty-text- ";"]]))
      [:div.ty-text- "}"]]]
    [:div.grid.gap-3 {:style {:display "grid" :grid-template-columns "repeat(auto-fit, minmax(8rem, 1fr))"}}
     (for [p (map presets [0 1 2 3 5])]
       (spectrum-card p (preset-active? seeds p)))]
    [:div.flex.flex-wrap.gap-x-6.gap-y-2.text-xs.ty-text-
     (for [[t icon] [["No build step" "zap"] ["Light + dark from one seed" "moon"]
                     ["OKLCH, perceptually even" "sliders-horizontal"]
                     ["Scoped anywhere the cascade reaches" "layers"]]]
       [:span.inline-flex.items-center {:class ["gap-1.5"] :replicant/key t}
        [:ty-icon {:name icon :size "xs"}] t])]]))

;; --- 01 Quick start -------------------------------------------------------------

(defn- step-card [n title desc & body]
  (into
   [:div.flex.flex-col.gap-3.rounded-2xl.border.ty-border-.p-5.min-w-0
    {:style {:background "var(--ty-surface-content)"}}
    [:div.flex.items-center {:class ["gap-2.5"]}
     [:span.inline-flex.items-center.justify-center.w-6.h-6.rounded-full.font-mono.text-xs.font-semibold
      {:style {:background "var(--ty-text-strong)" :color "var(--ty-surface-content)"}} n]
     [:h3.text-base.font-semibold.ty-text++.scroll-mt-6 title]]
    [:p.text-sm.ty-text-.leading-relaxed desc]]
   body))

(defn- mini-code [code]
  [:div.rounded-lg.border.ty-border-.site-chrome.overflow-hidden
   {:data-ty-theme "" :style {:background "var(--ty-surface-canvas)"}}
   (common/code-view code (if (str/starts-with? code "<") "html" "css") {:compact? true})])

(defn- quick-start []
  (common/page-section
   {:title "Quick start" :sub "Two files, two variables."}
   [:div.md:grid-cols-3.gap-4 {:style {:display "grid"}}
    (step-card 1 "Load the CSS" "Base tokens, then the theme engine on top."
               (mini-code "@import \"tyrell.css\";\n@import \"tyrell-theme.css\";"))
    (step-card 2 "Set two seeds" "Hue picks the color, chroma how loud it is."
               (mini-code ":root {\n  --ty-primary-hue: 200;\n  --ty-primary-chroma: 0.13;\n}"))
    (step-card 3 "Dark mode comes free" "Same seeds, flipped lightness curve — on the page or any subtree."
               [:div.flex.flex-col.gap-2.rounded-lg.p-3.dark
                {:data-ty-theme "" :style {:background "var(--ty-surface-canvas)"}}
                [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} "<html class=\"dark\">"]
                [:div.flex.gap-2
                 [:ty-button {:flavor "primary" :size "sm"} "Save"]
                 [:ty-button {:flavor "neutral" :appearance "outlined" :size "sm"} "Cancel"]]])]))

;; --- 02 Playground --------------------------------------------------------------

(defn- flavor-row [flavor seeds open]
  (let [hk (keyword (str flavor "-hue")) ck (keyword (str flavor "-chroma"))
        lk (keyword (str flavor "-l-factor"))
        tunable? (not= flavor "neutral")
        open? (= open flavor)]
    [:div.flex.flex-col.rounded-lg.border
     {:replicant/key flavor
      :class (when open? "ty-border-")
      :style (if open?
               {:background "var(--ty-surface-content)"}
               {:border-color "transparent"})}
     [:button.flex.items-center.py-2.text-left {:class ["gap-2.5" "px-2.5" (when tunable? "cursor-pointer")]
       :disabled (not tunable?)
       :on {:click #(swap! state/state assoc-in [:brand-playground :open-flavor] (when-not open? flavor))}}
      [:span.rounded-full.shrink-0 {:class ["w-2.5" "h-2.5"] :style {:background (str "var(--ty-color-" flavor ")")}}]
      [:span.text-sm.font-medium.ty-text++.flex-1 flavor]
      [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}}
       (if tunable? (str "h " (int (get seeds hk)) " · c " (.toFixed (get seeds ck) 2)) "achromatic")]
      (when tunable?
        [:ty-icon.ty-text-- {:name "chevron-right" :size "xs"
                             :style {:transform (when open? "rotate(90deg)") :transition "transform 0.15s"}}])]
     (when open?
       [:div.flex.flex-col.gap-3.pb-3 {:class ["px-2.5"]}
        (dial "hue" hk (get seeds hk) {:min 0 :max 360 :step 1 :background (hue-gradient 0.62 0.15)})
        (dial "chroma" ck (get seeds ck) {:min 0 :max 0.35 :step 0.001})
        (dial "l-factor" lk (get seeds lk) {:min 0.5 :max 1.5 :step 0.01})])]))

(defn- seed-mode-toggle
  "hue | hex — the two ways to seed a flavor."
  [mode {:keys [hue hex]}]
  [:div.flex.rounded-md.ty-bg-neutral- {:class ["p-0.5" "gap-0.5"]}
   (for [[label m on-click] [["hue" :hue hue] ["hex" :hex hex]]]
     [:button.px-2.rounded.text-xs.font-mono.cursor-pointer {:replicant/key label
       :class (into ["py-0.5"] (if (= mode m) ["ty-elevated" "ty-text++" "font-semibold"] ["ty-text-"]))
       :on {:click on-click}}
      label])])

(defn- custom-flavor-row
  "The flavor built in Custom flavors, listed with the built-ins."
  [nm]
  [:button.flex.items-center.rounded-lg.border.py-2.text-left.cursor-pointer {:class ["gap-2.5" "px-2.5"] :replicant/key (str "custom-" nm)
    :style {:border-color "transparent"}
    :on {:click #(common/scroll-to! "custom-flavors")}}
   [:span.rounded-full.shrink-0 {:class ["w-2.5" "h-2.5"] :style {:background (str "var(--ty-color-" nm ")")}}]
   [:span.text-sm.font-medium.ty-text++.flex-1 nm]
   [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} "custom ↓"]])

(defn- dock [seeds]
  (let [{:keys [primary-hue primary-chroma primary-l-factor primary-seed open-flavor]} seeds
        {named? :export-named? theme-name :export-name :or {theme-name "my-theme"}} seeds
        css (if named? (build-named-theme-css seeds theme-name) (build-theme-css seeds))]
    [:aside.flex.flex-col.gap-5.p-5.shrink-0.border-b.md:border-b-0.md:border-r.ty-border-.md:w-72 {:style {:background "var(--ty-surface-canvas)"}}
     [:div.flex.items-center.justify-between
      (kicker "Primary seed")
      (seed-mode-toggle (if primary-seed :hex :hue)
                        {:hue #(set-primary-seed! nil)
                         :hex #(set-primary-seed! (or primary-seed "#e0473e"))})]
     (if primary-seed
       [:label.flex.items-center.gap-2.rounded-lg.border.ty-border-.px-2.cursor-pointer {:class ["py-1.5"] :style {:background "var(--ty-surface-content)"}}
        [:input {:type "color" :value primary-seed
                 :on {:input #(set-primary-seed! (.. ^js % -target -value))}
                 :style {:width "1.5rem" :height "1.5rem" :border "none" :padding 0 :background "none" :cursor "pointer"}}]
        [:span.font-mono.text-xs.ty-text++ "--ty-primary-seed: " primary-seed]]
       (list
        (dial "--ty-primary-hue" :primary-hue primary-hue
              {:min 0 :max 360 :step 1 :background (hue-gradient 0.62 0.15)})
        (dial "--ty-primary-chroma" :primary-chroma primary-chroma
              {:min 0 :max 0.3 :step 0.005
               :background (str "linear-gradient(to right, oklch(0.62 0 " primary-hue "), oklch(0.62 0.3 " primary-hue "))")})))
     (dial "--ty-primary-l-factor" :primary-l-factor primary-l-factor
           {:min 0.5 :max 1.5 :step 0.01
            :background (str "linear-gradient(to right, oklch(0.3 " primary-chroma " " primary-hue "), oklch(0.85 " primary-chroma " " primary-hue "))")})
     [:div.flex.flex-wrap.gap-2
      (for [[label h c :as p] presets
            :let [active? (preset-active? seeds p)]]
        [:button.w-6.h-6.rounded-full.cursor-pointer
         {:replicant/key label :title label
          :style {:background (str "oklch(0.58 " c " " h ")")
                  :outline (if active? "2px solid var(--ty-text-strong)" "2px solid transparent")
                  :outline-offset "2px"}
          :on {:click #(preset! h c)}}])]
     [:div.border-t.ty-border-]
     (kicker "Flavors")
     [:div.flex.flex-col.gap-1 {:style {:margin-top "-0.5rem"}}
      (for [f (rest flavors)] (flavor-row f seeds open-flavor))
      (when-let [nm (not-empty (:name (flavor-pack)))] (custom-flavor-row nm))]
     [:div.flex.gap-2
      [:ty-button {:flavor "neutral+" :size "sm" :style {:flex "1"}
                   :on {:click #(js/navigator.clipboard.writeText css)}}
       [:ty-icon {:name "copy" :size "xs" :slot "start"}] "Copy CSS"]
      [:ty-button {:flavor "neutral" :appearance "outlined" :size "sm" :on {:click reset-all!}} "Reset"]]
     [:details.text-xs
      [:summary.cursor-pointer.ty-text-.font-medium "Show CSS"]
      [:div.flex.flex-col.gap-2.mt-3
       [:div.flex.gap-1
        (for [[label v] [[":root" false] ["named theme" true]]]
          [:button.px-2.rounded.font-mono.cursor-pointer {:replicant/key label
            :class (into ["py-0.5"] (if (= named? v) ["ty-bg-neutral" "ty-text++"] ["ty-text-"]))
            :on {:click #(swap! state/state assoc-in [:brand-playground :export-named?] v)}}
           label])]
       (when named?
         [:ty-input {:size "xs" :value theme-name :placeholder "theme name"
                     :on {:input #(swap! state/state assoc-in [:brand-playground :export-name]
                                         (.. ^js % -target -value))}}])
       (mini-code css)]]]))

(defn- spec-card [title & children]
  (into [:div.flex.flex-col.gap-3.rounded-xl.border.ty-border-.p-4.min-w-0 (kicker title)] children))

(defn- specimen []
  ;; The custom flavor (if named) sits next to the built-ins: same components,
  ;; same shade row — the proof it's a first-class flavor.
  (let [custom (not-empty (:name (flavor-pack)))
        flavors (cond-> flavors custom (conj custom))]
    [:div.flex-1.min-w-0.flex.flex-col.gap-3.p-5
     (spec-card "Buttons & tags"
                [:div.flex.flex-wrap.gap-2
                 (for [f flavors] [:ty-button {:replicant/key f :flavor f :size "sm"} (str/capitalize f)])]
                [:div.flex.flex-wrap.gap-2
                 (for [f flavors] [:ty-button {:replicant/key f :flavor f :size "sm" :appearance "outlined"} (str/capitalize f)])]
                [:div.flex.flex-wrap.gap-2
                 (for [f flavors] [:ty-tag {:replicant/key f :flavor f} f])])
     (spec-card "Shades — five flavors × five steps"
                [:div.flex.flex-col {:class ["gap-1.5"]}
                 [:div.flex {:class ["gap-1.5"]}
                  [:span.shrink-0 {:style {:width "4.5rem"}}]
                  (for [[label] shades]
                    [:span.flex-1.text-center.font-mono.ty-text-- {:replicant/key label :style {:font-size "0.6875rem"}} label])]
                 (for [f flavors]
                   [:div.flex.items-center {:class ["gap-1.5"] :replicant/key f}
                    [:span.shrink-0.font-mono.text-xs.ty-text {:style {:width "4.5rem"}} f]
                    (for [[label suffix] shades
                          :let [token (str "--ty-color-" f suffix)]]
                      [:span.flex-1.flex.items-center.px-2.rounded-md.text-xs.font-semibold
                       {:replicant/key label :title token
                        :style {:height "2rem" :background (str "var(" token ")") :color (on-color token)}}
                       "Aa"])])])
     [:div.md:grid-cols-2.gap-3 {:style {:display "grid"}}
      (spec-card "Form"
                 [:ty-input {:label "Project name" :value "Q3 launch site"}]
                 [:ty-select {:label "Priority" :value "medium"}
                  [:ty-option {:value "low"} "Low"]
                  [:ty-option {:value "medium"} "Medium"]
                  [:ty-option {:value "high"} "High"]])
      (spec-card "Surfaces"
                 [:div.rounded-lg {:class ["p-2.5"] :style {:background "var(--ty-surface-canvas)"}}
                  [:div.flex.flex-col.gap-2.rounded-lg.border.ty-border- {:class ["p-2.5"] :style {:background "var(--ty-surface-content)"}}
                   [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} "canvas › content"]
                   [:div.flex.flex-col.gap-2.rounded-lg.border.ty-border-.shadow-sm {:class ["p-2.5"] :style {:background "var(--ty-surface-elevated)"}}
                    [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} "elevated"]
                    [:div.rounded-lg.border.ty-border-.shadow-lg {:class ["p-2.5"] :style {:background "var(--ty-surface-floating)"}}
                     [:span.font-mono.ty-text- {:style {:font-size "0.6875rem"}} "floating"]]]]])]]))

(defn- playground [seeds]
  (common/page-section
   {:title "Playground" :sub "Drag a seed. The whole library follows."}
   [:div.flex.flex-col.md:flex-row.rounded-2xl.border.ty-border-.overflow-hidden
    {:style {:background "var(--ty-surface-content)"}}
    (dock seeds)
    (specimen)]
   [:p.text-xs.ty-text-- "Every dial is per theme — dragging one only changes the mode you're looking at. Toggle dark to tune the other side."]))

;; --- 03 The formula (live) ---------------------------------------------------------

(defonce ^:private dragging (atom nil))

(defn- drag-handlers
  "Pointer handlers that call (set-from! event) while K is being dragged."
  [k set-from!]
  {:pointerdown (fn [^js e]
                  (.setPointerCapture (.-currentTarget e) (.-pointerId e))
                  (reset! dragging k)
                  (set-from! e))
   :pointermove (fn [e] (when (= @dragging k) (set-from! e)))
   :pointerup (fn [_] (reset! dragging nil))
   :pointercancel (fn [_] (reset! dragging nil))})

(defn- bar-drag-handlers
  "Vertical drag on a bar column → dial value. The column's .th-track is the 0..1 scale."
  [k lo hi]
  (drag-handlers k (fn [^js e]
                     (let [r (.getBoundingClientRect (.querySelector (.-currentTarget e) ".th-track"))
                           frac (-> (/ (- (.-bottom r) (.-clientY e)) (.-height r)) (max 0) (min 1))]
                       (set-dial! k (js/parseFloat (.toFixed (+ lo (* frac (- hi lo))) 2)))))))

(defn- shade-color
  "The primary shade computed straight from the seeds, so the bars show the
   ACTIVE theme's colors even inside the dark band."
  [{:keys [primary-hue primary-chroma primary-l-factor] :as seeds} [_ _ lk ck]]
  (str "oklch(" (* (get seeds lk) primary-l-factor) " "
       (* primary-chroma (get seeds ck)) " " primary-hue ")"))

(defn- curve-bars
  "Five draggable bars, one per shade, each painted in that primary shade."
  [seeds key-idx lo hi]
  [:div.flex.items-end.gap-2
   (for [[label :as shade] shades
         :let [k (nth shade key-idx) v (get seeds k)
               frac (/ (- v lo) (- hi lo))]]
     [:div.flex-1.flex.flex-col.items-center.gap-1.select-none.cursor-ns-resize
      {:replicant/key label :style {:touch-action "none"} :on (bar-drag-handlers k lo hi)}
      [:span.font-mono.ty-text {:style {:font-size "0.625rem"}} (.toFixed v 2)]
      [:div.th-track.w-full.flex.items-end {:style {:height "5rem"}}
       [:div.w-full.rounded-md.flex.justify-center.pt-1
        {:style {:height (str (max 6 (* 100 frac)) "%")
                 :background (shade-color seeds shade)}}
        [:span.rounded-full {:style {:width "0.875rem" :height "3px"
                                     :background "rgb(255 255 255 / 0.6)"}}]]]
      [:span.font-mono.ty-text-- {:style {:font-size "0.625rem"}} label]])])

(defn- hue-wheel [hue]
  (let [size 96 r 39
        rad (* hue (/ js/Math.PI 180))]
    [:div.relative.shrink-0.cursor-grab.select-none
     {:style {:width (str size "px") :height (str size "px") :touch-action "none"}
      :on (drag-handlers :primary-hue
                         (fn [^js e]
                           (let [rect (.getBoundingClientRect (.-currentTarget e))
                                 dx (- (.-clientX e) (+ (.-left rect) (/ (.-width rect) 2)))
                                 dy (- (.-clientY e) (+ (.-top rect) (/ (.-height rect) 2)))
                                 deg (mod (+ 360 (* (/ 180 js/Math.PI) (js/Math.atan2 dx (- dy)))) 360)]
                             (set-dial! :primary-hue (js/Math.round deg)))))}
     [:div.absolute.inset-0.rounded-full
      {:style {:background (str "conic-gradient("
                                (str/join "," (for [h (range 0 361 30)] (str "oklch(0.68 0.15 " h ")")))
                                ")")
               :mask "radial-gradient(farthest-side, transparent calc(100% - 13px), #000 calc(100% - 12px))"
               :-webkit-mask "radial-gradient(farthest-side, transparent calc(100% - 13px), #000 calc(100% - 12px))"}}]
     [:div.absolute.rounded-full
      {:style {:width "18px" :height "18px"
               :left (str (- (+ (/ size 2) (* r (js/Math.sin rad))) 9) "px")
               :top (str (- (- (/ size 2) (* r (js/Math.cos rad))) 9) "px")
               :background "var(--ty-color-primary)"
               :border "2px solid white"
               :box-shadow "0 1px 4px rgb(0 0 0 / 0.4)"}}]]))

(defn- dials-css
  "Selected dials for the ACTIVE theme as a paste-ready block."
  [seeds ks]
  (str (if (= :dark (active-theme)) "html.dark" ":root") " {\n"
       (str/join "\n" (for [k ks] (dial-value-line k (get seeds k))))
       "\n}"))

(defn- term-card [letter color-class title expr hint desc viz copy-text]
  [:div.flex.flex-col.gap-3.rounded-2xl.border.ty-border-.p-5.min-w-0
   {:style {:background "color-mix(in oklch, var(--ty-text-strong) 4%, transparent)"}}
   [:div.flex.items-center.justify-between.gap-2
    [:div.flex.items-center {:class ["gap-2.5"]}
     [:span.font-mono.text-2xl.font-bold {:class color-class} letter]
     [:h3.text-sm.font-semibold.ty-text++.scroll-mt-6 title]]
    [:div.flex.items-center.gap-1
     [:span.inline-flex.items-center.gap-1.rounded-full.px-2.ty-text- {:class ["py-0.5"] :style {:font-size "0.6875rem" :background "color-mix(in oklch, var(--ty-text-strong) 8%, transparent)"}}
      [:ty-icon {:name (if (= letter "H") "rotate-cw" "move-vertical") :size "xs"}] hint]
     [:span {:title (str "Copy " (str/lower-case title) " CSS")} (common/copy-button copy-text)]]]
   [:span.font-mono.text-xs {:class color-class} expr]
   viz
   [:p.text-xs.ty-text-.leading-relaxed desc]])

(defn- formula [seeds]
  (let [{:keys [l-bold warning-l-factor warning-chroma c-bold-mult warning-hue]} seeds
        ;; The browser clamps oklch L to 1; show what it actually paints.
        l (min 1 (* l-bold warning-l-factor)) c (* warning-chroma c-bold-mult)]
    (common/page-section
     {:title "The formula" :sub "One computation behind every color — and it's live." :dark? true}
     [:div.flex.justify-center.font-mono.font-medium.py-2
      {:style {:font-size "clamp(1.5rem, 3vw, 2rem)"}}
      [:span.ty-text- "oklch("]
      [:span.ty-text-warning.font-bold " L"] [:span.ty-text-- " · "]
      [:span.ty-text-success.font-bold "C"] [:span.ty-text-- " · "]
      [:span.ty-text-primary.font-bold "H"] [:span.ty-text- " )"]]
     [:div.md:grid-cols-3.gap-4 {:style {:display "grid"}}
      (term-card "L" "ty-text-warning" "Lightness" "L-curve[shade] × l-factor" "drag a bar"
                 "The shade picks a step on the curve; l-factor slides a whole flavor lighter or darker."
                 (curve-bars seeds 2 0 1)
                 (dials-css seeds (map #(nth % 2) shades)))
      (term-card "C" "ty-text-success" "Chroma" "chroma × saturation[shade]" "drag a bar"
                 "How much color. The curve keeps the extremes calm so headings and tints both read."
                 (curve-bars seeds 3 0 1.5)
                 (dials-css seeds (map #(nth % 3) shades)))
      (term-card "H" "ty-text-primary" "Hue" "flavor hue, 0–360" "drag the knob"
                 "The seed. One number per flavor; dark mode reuses it untouched."
                 [:div.flex.items-center.gap-4
                  (hue-wheel (:primary-hue seeds))
                  [:div.flex.flex-col {:class ["gap-1.5"]}
                   (for [f ["primary" "success" "warning" "danger"]]
                     [:span.flex.items-center.gap-2.font-mono.ty-text- {:replicant/key f :style {:font-size "0.6875rem"}}
                      [:span.w-2.h-2.rounded-full {:style {:background (str "var(--ty-color-" f ")")}}]
                      (str f " " (int (get seeds (keyword (str f "-hue")))))])]]
                 (dials-css seeds [:primary-hue :success-hue :warning-hue :danger-hue]))]
     [:div.flex.flex-wrap.items-center.gap-x-4.gap-y-2.rounded-xl.px-4.py-3
      {:style {:background "color-mix(in oklch, var(--ty-text-strong) 5%, transparent)"}}
      [:span.w-7.h-7.rounded-md.shrink-0 {:style {:background (str "oklch(" l " " c " " warning-hue ")")}}]
      [:span.font-mono.text-sm.ty-text
       "--ty-color-warning-bold = oklch(" (.toFixed l 2) " " (.toFixed c 3) " " (int warning-hue) ")"]
      [:span.text-xs.ty-text--.md:ml-auto "html.dark flips the L-curve — seeds carry through"]])))

;; --- 04 Tweak the built-ins -------------------------------------------------------

(def ^:private tweaks
  ;; [title when-to-use swatches css]
  [["Start from a brand color" "You have a hex, not a hue. Hue and chroma are read from it; lightness still comes from the curve, so dark mode keeps working." ["#e0473e" "crimson"]
    ":root {\n  --ty-primary-seed: #e0473e;\n}"]
   ["Louder or quieter" "Every built-in flavor has its own hue and chroma dial." ["oklch(0.55 0.2 31)" "oklch(0.55 0.08 31)"]
    ":root {\n  --ty-danger-chroma: 0.2;\n}"]
   ["Follow the brand" "Point a semantic flavor at primary's hue so the palette reads as one family." ["oklch(0.58 0.13 200)" "oklch(0.58 0.1 175)"]
    ":root {\n  --ty-success-hue:\n    var(--ty-primary-hue);\n}"]
   ["Theme one section" "Any element with data-ty-theme recomputes the palette from its own dials." ["oklch(0.62 0.15 42)" "oklch(0.58 0.13 200)"]
    "[data-ty-theme].promo {\n  --ty-primary-hue: 42;\n}"]
   ["Pin a single token" "The formula is close, but one shade must match a spec exactly. The cascade still wins." ["#003344"]
    ":root {\n  --ty-color-primary-strong:\n    #003344;\n}"]])

(defn- tweak-cards []
  (common/page-section
   {:title "Tweak the built-ins" :sub "primary, success, warning, danger, neutral: one line each."}
   (apply common/bento
          (for [[i [title desc chips code]] (map-indexed vector tweaks)]
            (common/example
             {:title title :span (if (< i 2) 3 2) :lang "css" :code code
              :description desc}
             [:div.flex {:class ["gap-1.5"]}
              (for [c chips]
                [:span.w-5.h-5.rounded-md {:replicant/key c :style {:background c}}])])))))

;; --- 05 Custom flavors -----------------------------------------------------------

(def ^:private flavor-contract
  ;; The tokens components read for flavor="X" (measured from the runtime
  ;; custom-flavor sheets). Hand-rolling a flavor means defining these.
  [["Text & icons" ["--ty-color-X-strong" "--ty-color-X" "--ty-color-X-soft" "--ty-color-X-faint"]]
   ["Tinted backgrounds" ["--ty-bg-X-bold" "--ty-bg-X" "--ty-bg-X-soft"]]
   ["Borders" ["--ty-border-X"]]
   ["Solid fills" ["--ty-solid-X" "--ty-solid-X-hover" "--ty-solid-X-active" "--ty-solid-X-strong" "--ty-solid-X-soft"]]
   ["Text on solid" ["--ty-solid-X-fg" "--ty-solid-X-strong-fg" "--ty-solid-X-soft-fg"]]])

(defn- pack-code
  "The pack split in two: the lines that are yours, and the engine."
  [nm seed l-factor hex? css]
  (let [yours (str ":root {\n  --ty-" nm "-seed: " seed ";"
                   (when (not= l-factor 1) (str "\n  --ty-" nm "-l-factor: " l-factor ";"))
                   "\n}")
        engine (str "html:root,\n[data-ty-theme] {\n"
                    (str/join "\n" (flavor-pack-ramp-lines nm))
                    "\n}")]
    [:div.flex.flex-col.gap-3
     [:div.flex.items-center.justify-between.gap-2
      [:div.flex.items-baseline.gap-2
       [:span.inline-flex.items-center.justify-center.w-5.h-5.rounded-full.font-mono.text-xs.font-semibold.ty-bg-primary.ty-text-primary+ "1"]
       [:span.text-sm.font-semibold.ty-text++ "Yours"]
       [:span.text-xs.ty-text- (if hex? "the color you pick — the only line you edit" "the only line you edit")]]
      (common/copy-button css)]
     (mini-code yours)
     [:details.group
      [:summary.flex.items-baseline.gap-2.cursor-pointer.list-none
       [:span.inline-flex.items-center.justify-center.w-5.h-5.rounded-full.font-mono.text-xs.font-semibold.ty-bg-neutral.ty-text "2"]
       [:span.text-sm.font-semibold.ty-text++ "Engine"]
       [:span.text-xs.ty-text- (str "paste once, never edit · " (count (str/split-lines engine)) " lines")]
       [:ty-icon.ml-auto.ty-text-- {:name "chevron-down" :size "xs"}]]
      [:div.mt-2 (mini-code engine)]]
     [:p.text-xs.ty-text-- "The copy button takes both parts."]]))

(defn- same-pack-demo
  "One pasted pack, three contexts: the ramp reads the dials by reference.
   Every context here is a dial, so it holds on a light or a dark page; the
   site's own theme toggle is the light/dark proof."
  [nm]
  (let [dark? (not= "light" (:theme @state/state))
        all (fn [prefix v] (into {} (for [s ["strong" "bold" "base" "soft" "faint"]] [(str prefix s "-mult") v])))]
    [:div.grid.gap-3 {:style {:grid-template-columns "repeat(auto-fit, minmax(11rem, 1fr))"}}
     (for [[label style code] [["This page" nil (if dark? "html.dark" "html")]
                               ["Quieter chroma" (all "--ty-c-" "0.35") "--ty-c-*-mult: 0.35"]
                               ["Heavier tints" {"--ty-a-bg-base" "30%" "--ty-a-bg-soft" "15%" "--ty-a-bg-bold" "45%"}
                                "--ty-a-bg-base: 30%"]]]
       [:div.flex.flex-col.gap-3.rounded-xl.border.ty-border-.p-4
        {:replicant/key label :data-ty-theme ""
         :style (merge {:background "var(--ty-surface-content)"} style)}
        [:div.flex.items-baseline.justify-between.gap-2
         [:span.text-sm.font-semibold.ty-text++ label]
         [:span.font-mono.ty-text-- {:style {:font-size "0.6875rem"}} code]]
        [:div.flex.flex-wrap.items-center.gap-2
         [:ty-button {:flavor nm :size "sm"} "Save"]
         [:ty-button {:flavor nm :size "sm" :appearance "outlined"} "Edit"]
         [:ty-tag {:flavor nm} nm]]])]))

(defn- faq [icon q & a]
  [:div.flex.flex-col.gap-2.min-w-0
   [:div.flex.items-center.gap-2
    [:ty-icon.ty-text-primary {:name icon :size "sm"}]
    [:h3.text-base.font-semibold.ty-text++.scroll-mt-6 q]]
   (into [:div.flex.flex-col.gap-2.text-sm.ty-text-.leading-relaxed] a)])

(defn- flavor-packs []
  (let [{nm :name :keys [mode color hue chroma l-factor] :as fp} (flavor-pack)
        nm (if (seq nm) nm "mr-hanky")
        seed (fpb-seed fp)
        css (flavor-pack-css nm seed l-factor (= mode "hex"))]
    (common/page-section
     {:title "Custom flavors" :sub (str "flavor=\"" nm "\" works on every component. One color is all you choose.")}
     ;; LIVE: the generated pack applies to the page, so every preview below is the engine at work.
     [:style css]
     [:div.flex.flex-col.md:flex-row.rounded-2xl.border.ty-border-.overflow-hidden
      {:style {:background "var(--ty-surface-content)"}}
      [:div.flex.flex-col.gap-4.p-5.shrink-0.border-b.md:border-b-0.md:border-r.ty-border-.md:w-64 {:style {:background "var(--ty-surface-canvas)"}}
       [:ty-input {:label "Name" :size "sm" :value nm :on {:input (fpb-set! :name)}}]
       [:div.flex.rounded-lg.ty-bg-neutral- {:class ["p-0.5" "gap-0.5"]}
        (for [[label m] [["hex" "hex"] ["hue + chroma" "oklch"]]]
          [:button.flex-1.px-2.py-1.rounded-md.text-xs.font-mono.cursor-pointer
           {:replicant/key m
            :class (if (= mode m) ["ty-elevated" "ty-text++" "font-semibold" "shadow-sm"] ["ty-text-"])
            :on {:click (fpb-set-mode! m)}}
           label])]
       (if (= mode "hex")
         [:label.flex.items-center.gap-2.rounded-lg.border.ty-border-.px-2.cursor-pointer {:class ["py-1.5"] :style {:background "var(--ty-surface-content)"}}
          [:input {:type "color" :value color :on {:input (fpb-set! :color)}
                   :style {:width "1.5rem" :height "1.5rem" :border "none" :padding 0 :background "none" :cursor "pointer"}}]
          [:span.font-mono.text-sm.ty-text++ color]]
         [:div.flex.flex-col.gap-3
          [:div.flex.flex-col.gap-2
           [:div.flex.justify-between.font-mono.text-xs [:span.ty-text "hue"] [:span.ty-text++ (str (int hue) "°")]]
           [:input.th-range {:type "range" :min 0 :max 360 :step 1 :value hue
                             :on {:input (fpb-set-num! :hue)} :style {:background (hue-gradient 0.62 0.15)}}]]
          [:div.flex.flex-col.gap-2
           [:div.flex.justify-between.font-mono.text-xs [:span.ty-text "chroma"] [:span.ty-text++ (.toFixed chroma 3)]]
           [:input.th-range {:type "range" :min 0 :max 0.3 :step 0.005 :value chroma
                             :on {:input (fpb-set-num! :chroma)}}]]])
       [:div.flex.flex-col.gap-2
        [:div.flex.justify-between.font-mono.text-xs [:span.ty-text "l-factor"] [:span.ty-text++ (.toFixed l-factor 2)]]
        [:input.th-range {:type "range" :min 0.5 :max 1.5 :step 0.01 :value l-factor
                          :on {:input (fpb-set-num! :l-factor)}}]
        [:span.text-xs.ty-text-- "Optional. Nudges all five shades lighter or darker."]]]
      [:div.flex-1.min-w-0.flex.flex-col.gap-5.p-5
       [:div.flex.rounded-xl.overflow-hidden
        (for [[label suffix] shades
              :let [token (str "--ty-color-" nm suffix)]]
          [:div.flex-1.flex.items-end.p-3.font-mono.text-xs.font-semibold
           {:replicant/key label :style {:height "4rem" :background (str "var(" token ")") :color (on-color token)}}
           label])]
       [:div.flex.flex-wrap.items-center.gap-2
        (for [f [nm (str nm "+") (str nm "-")]]
          [:ty-button {:replicant/key f :flavor f :size "sm"} (str "flavor=\"" f "\"")])
        [:ty-tag {:flavor nm} nm]
        [:ty-checkbox {:flavor nm :checked ""}]
        [:ty-switch {:flavor nm :checked ""}]]
       (pack-code nm seed l-factor (= mode "hex") css)]]

     [:div.flex.flex-col.gap-3
      [:div.flex.items-baseline.justify-between.gap-3.flex-wrap
       [:h3.text-base.font-semibold.ty-text++.scroll-mt-6 "One pack, every context"]
       [:span.text-xs.ty-text- (str "Same pasted pack in all three. Flip the site to " (if (= "light" (:theme @state/state)) "dark" "light") " mode (top right) and they follow too.")]]
      (same-pack-demo nm)]

     [:div.grid.gap-x-10.gap-y-8.md:grid-cols-2
      (faq "copy" "Do I copy the whole theme CSS?"
           [:p "No. Keep loading " [:code "tyrell.css"] " and " [:code "tyrell-theme.css"]
            " as they are. Each custom flavor adds one small block: the seed line is yours, the rest is the same ramp the built-ins use, pasted once."])
      (faq "sliders-horizontal" "Do the lightness and chroma dials affect it?"
           [:p "Yes, live. The ramp points at the dials instead of copying their values, so tuning the lightness curve or the chroma scales, or switching to dark mode, recolors your flavor exactly like the built-ins. Nothing to re-copy."]
           [:p "Only your seed's hue and chroma are used. Its lightness is ignored because the curve decides it; reach for " [:code "l-factor"] " to sit lighter or darker."])
      (faq "check-square" "What does it need?"
           [:ul.flex.flex-col.gap-1.list-disc.pl-5
            [:li [:code "tyrell-theme.css"] " loaded. The static palette has no dials, so the ramp resolves to nothing without it."]
            [:li "A name that starts with a letter: letters, digits, " [:code "-"] " and " [:code "_"] ". Not one of the five built-ins."]
            [:li "The selector as given: " [:code "html:root, [data-ty-theme]"] ". The second half lets themed subtrees recompute your flavor."]])
      (faq "sparkles" "What comes free?"
           [:ul.flex.flex-col.gap-1.list-disc.pl-5
            [:li [:code (str nm "+")] " and " [:code (str nm "-")] " tones, on every component that takes a flavor."]
            [:li "Hover and pressed states, tinted backgrounds, borders."]
            [:li "Black or white text on solid fills, picked from the fill's lightness."]])]

     [:details.rounded-xl.border.ty-border-.px-5.py-4 {:style {:background "var(--ty-surface-content)"}}
      [:summary.cursor-pointer.text-sm.font-semibold.ty-text++
       "Prefer exact colors? Skip the ramp and set the tokens yourself."]
      [:div.flex.flex-col.gap-4.pt-4
       [:p.text-sm.ty-text-.leading-relaxed
        "Components read these 16 tokens for " [:code "flavor=\"X\""] ". Define them for your name and the ramp isn't needed. "
        "You then own dark mode too: set them again under " [:code "html.dark"] "."]
       [:div.grid.gap-4 {:style {:grid-template-columns "repeat(auto-fit, minmax(13rem, 1fr))"}}
        (for [[group tokens] flavor-contract]
          [:div.flex.flex-col {:replicant/key group :class ["gap-1.5"]}
           (kicker group)
           (for [t tokens]
             [:code.text-xs.ty-text {:replicant/key t} (str/replace t "X" nm)])])]]])))

;; --- 06 Type & shape -----------------------------------------------------------------

(defn- type-and-shape []
  (let [{:keys [font radius] :or {font "sans" radius "8"}} (:typography-picker @state/state)
        stack (font-stack font)
        px (str radius "px")]
    (common/page-section
     {:title "Type & shape" :sub "Font and radius are tokens too."}
     [:div.flex.flex-col.md:flex-row.rounded-2xl.border.ty-border-.overflow-hidden
      {:style {:background "var(--ty-surface-content)"}}
      [:div.flex.flex-col.gap-5.p-5.shrink-0.border-b.md:border-b-0.md:border-r.ty-border-.md:w-64 {:style {:background "var(--ty-surface-canvas)"}}
       [:div.flex.flex-col.gap-2
        (kicker "Font")
        [:div.flex.flex-wrap {:class ["gap-1.5"]}
         (for [[k label _] font-presets]
           (tp-chip (= k font) (first (str/split label #" ")) (fn [_] (tp-set! :font k))))]]
       [:div.flex.flex-col.gap-2
        (kicker "Radius")
        [:div.flex.flex-wrap {:class ["gap-1.5"]}
         (for [[v _] radius-presets]
           (tp-chip (= v radius) (if (= v "9999") "pill" v) (fn [_] (tp-set! :radius v))))]]
       (mini-code (str ":root {\n"
                       (when stack (str "  --ty-font-sans: " stack ";\n"))
                       "  --ty-radius-base: " px ";\n"
                       "  --ty-radius-md: " px ";\n}"))]
      [:div.flex-1.min-w-0.flex.flex-col.justify-center.gap-4.p-8
       {:style (cond-> {"--ty-radius-base" px "--ty-radius-md" px}
                 stack (assoc "--ty-font-sans" stack))}
       [:h3.text-2xl.font-semibold.ty-text++.scroll-mt-6
        {:style {:font-family "var(--ty-font-sans)" :letter-spacing "-0.02em"}}
        "Book the reading room"]
       [:p.ty-text-.leading-relaxed {:style {:font-family "var(--ty-font-sans)"}}
        "Same components, a different voice and corners — two tokens."]
       [:div.flex.flex-wrap.items-end.gap-3
        [:div.flex-1 {:style {:min-width "12rem"}}
         [:ty-date-picker {:label "When" :size "md" :value "2026-10-03"}]]
        [:ty-button {:flavor "primary" :size "lg"} "Reserve"]]]])))

;; --- Page ------------------------------------------------------------------------

(defn view []
  (let [seeds (get-seeds)]
    (common/doc-page
     [:style page-css]
     [:div {:replicant/on-mount close-floating-on-mount!}
      (theming-hero seeds)]
     (quick-start)
     (playground seeds)
     (formula seeds)
     (tweak-cards)
     (flavor-packs)
     (type-and-shape)
     (tokens/section))))
