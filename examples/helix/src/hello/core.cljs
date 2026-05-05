(ns hello.core
  "Helix + tyrell-react demo — JSX-style ($ Component ...) over Tyrell web components.

   This file exercises a wide slice of the component library: input, checkbox,
   dropdown + option, multiselect + tag, date-picker, textarea, button, modal,
   tooltip, icon. Type into the form and watch the live state pane update."
  (:require ["tyrell-components"]   ; side-effect import: registers all <ty-*> custom elements
            ["tyrell-react" :as ty]
            ["react-dom/client" :as rdom]
            [cljs.pprint :as pprint]
            [clojure.string :as str]
            [helix.core :refer [defnc $ <>]]
            [helix.dom :as d]
            [helix.hooks :as hooks]
            [hello.icons :as icons]))

;; =============================================================================
;; Small reusable bits
;; =============================================================================

(defnc badge
  "Pill-style badge with an icon + label, themed via Tyrell semantic colors."
  [{:keys [icon label flavor]}]
  (d/span {:class (str "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full "
                       "text-xs font-medium ty-bg-" flavor "- ty-text-" flavor "++")}
    ($ ty/Icon {:name icon :size "xs"})
    label))

(defnc section-header
  [{:keys [eyebrow title icon right]}]
  (d/div {:class "flex items-end justify-between gap-3 mb-4 pb-3"
          :style #js {:border-bottom "1px solid var(--ty-border-)"}}
    (d/div {:class "flex items-start gap-3 min-w-0"}
      (when icon
        (d/div {:class "flex items-center justify-center rounded-lg ty-bg-accent- flex-shrink-0"
                :style #js {:width "36px" :height "36px"}}
          ($ ty/Icon {:name icon :size "md" :class "ty-text-accent++"})))
      (d/div {:class "min-w-0"}
        (d/div {:class "text-xs font-bold ty-text-accent tracking-widest uppercase"} eyebrow)
        (d/h2 {:class "text-lg font-bold ty-text++ tracking-tight"} title)))
    (when right right)))

(defnc feature-row
  [{:keys [n icon title body]}]
  (d/div {:class "flex items-start gap-3"}
    (d/div {:class "flex items-center justify-center rounded-md ty-bg-accent- flex-shrink-0"
            :style #js {:width "32px" :height "32px"}}
      ($ ty/Icon {:name icon :size "sm" :class "ty-text-accent++"}))
    (d/div {:class "flex-1 min-w-0"}
      (d/div {:class "flex items-center gap-2 mb-0.5"}
        (d/span {:class "text-xs font-bold ty-text-accent tracking-widest"} (str "0" n))
        (d/h3 {:class "text-sm font-bold ty-text++ tracking-tight"} title))
      (d/p {:class "text-sm ty-text- leading-snug"} body))))

;; =============================================================================
;; The whole demo lives in one component — state is local, no prop drilling.
;; =============================================================================

(def empty-profile
  {:name      ""
   :email     ""
   :phone     ""
   :birthdate ""
   :role      ""
   :skills    []
   :bio       ""
   :news?     false})

(defn validate
  [profile]
  (cond-> {}
    (str/blank? (:name profile))
    (assoc :name "Name is required")

    (str/blank? (:email profile))
    (assoc :email "Email is required")

    (and (not (str/blank? (:email profile)))
         (not (re-matches #".+@.+\..+" (:email profile))))
    (assoc :email "Doesn't look like an email")

    (> (count (:bio profile)) 280)
    (assoc :bio "Bio must be under 280 characters")))

(defnc demo []
  (let [;; Form state
        [profile setProfile] (hooks/use-state empty-profile)
        [errors setErrors]   (hooks/use-state {})
        [submitted setSubmitted] (hooks/use-state false)
        ;; Modal — imperative ref (React idiom for dialogs)
        modal-ref (hooks/use-ref nil)
        open-modal  (hooks/use-callback :auto-deps
                      (fn [_] (when-let [^js m (.-current modal-ref)] (.show m))))
        close-modal (hooks/use-callback :auto-deps
                      (fn [_] (when-let [^js m (.-current modal-ref)] (.hide m))))

        ;; Helpers
        update-field (hooks/use-callback :auto-deps
                       (fn [k v]
                         (setProfile #(assoc % k v))
                         (setErrors #(dissoc % k))
                         (setSubmitted false)))
        on-submit (hooks/use-callback [profile]
                    (fn [^js e]
                      (.preventDefault e)
                      (let [errs (validate profile)]
                        (setErrors errs)
                        (when (empty? errs)
                          (setSubmitted true)
                          (js/setTimeout #(setSubmitted false) 3000)))))
        on-reset (hooks/use-callback :auto-deps
                   (fn []
                     (setProfile empty-profile)
                     (setErrors {})
                     (setSubmitted false)))

        ;; Live-state derived values
        filled (count (filter (fn [[_ v]]
                                (cond
                                  (nil? v) false
                                  (boolean? v) v
                                  (sequential? v) (seq v)
                                  :else (not (str/blank? (str v)))))
                              profile))
        total (count profile)
        progress (double (* (/ filled total) 100))]

    (d/div {:class "min-h-screen ty-canvas"}
      (d/div {:class "max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6"}

        ;; -------------------------------------------------------------- Hero
        (d/div {:class "ty-elevated rounded-2xl relative overflow-hidden"
                :style #js {:border "1px solid var(--ty-border-)"}}
          (d/div {:class "absolute top-0 left-0 right-0 h-2 ty-bg-accent+"})
          (d/div {:class "p-6 md:p-8 pt-8 md:pt-10"}
            (d/div {:class "flex items-center gap-2 mb-4"}
              (d/span {:class "text-xs font-bold ty-text-accent tracking-widest uppercase"}
                "tyrell-react · CLJS")
              (d/span {:class "h-1 w-1 rounded-full ty-bg-neutral"})
              (d/span {:class "text-xs font-medium ty-text-- tracking-widest uppercase"}
                "Helix demo · component sandbox"))

            (d/div {:class "flex items-start gap-4 mb-3"}
              (d/div {:class "flex items-center justify-center rounded-xl ty-bg-accent- flex-shrink-0"
                      :style #js {:width "56px" :height "56px"}}
                ($ ty/Icon {:name "rocket" :size "lg" :class "ty-text-accent++"}))
              (d/div {:class "flex-1 min-w-0"}
                (d/h1 {:class "text-3xl font-bold ty-text++ tracking-tight leading-tight mb-1"}
                  "Helix + Tyrell")
                (d/p {:class "text-base ty-text font-normal leading-relaxed"}
                  "Type into the form, watch the live state pane update on every keystroke. "
                  "Open the modal. Hover the buttons. Reset and resubmit. "
                  "All seven form components, two overlays — wired through one "
                  (d/code {:class "font-mono text-xs ty-bg-neutral- px-1 rounded"} "tyrell-react")
                  " package.")))

            (d/div {:class "flex flex-wrap gap-2"}
              ($ badge {:icon "sparkles" :label "tyrell-react"        :flavor "accent"})
              ($ badge {:icon "user"     :label "Helix 0.2.0"         :flavor "neutral"})
              ($ badge {:icon "check"    :label "event.detail bridged" :flavor "success"})
              ($ badge {:icon "rocket"   :label "Controlled :open"    :flavor "neutral"}))))

        ;; ------------------------------------------- Form + live-state grid
        (d/div {:class "grid grid-cols-1 lg:grid-cols-2 gap-6"}

          ;; ---- Form
          (d/section {:class "ty-elevated rounded-xl p-5"
                      :style #js {:border "1px solid var(--ty-border-)"}}
            ($ section-header
               {:eyebrow "Form" :title "Profile" :icon "user"})

            (d/form {:onSubmit on-submit
                     :class "flex flex-col gap-4"}

              ;; Name
              ($ ty/Input
                 {:label "Full name"
                  :placeholder "Jane Doe"
                  :required true
                  :value (:name profile)
                  :error (:name errors)
                  :onChange #(update-field :name (.. % -detail -value))}
                 ($ ty/Icon {:slot "start" :name "user" :size "sm"}))

              (d/div {:class "grid grid-cols-1 md:grid-cols-2 gap-4"}
                ($ ty/Input
                   {:label "Email"
                    :type "email"
                    :placeholder "you@example.com"
                    :required true
                    :value (:email profile)
                    :error (:email errors)
                    :onChange #(update-field :email (.. % -detail -value))}
                   ($ ty/Icon {:slot "start" :name "mail" :size "sm"}))
                ($ ty/Input
                   {:label "Phone"
                    :type "tel"
                    :placeholder "+1 555 123 4567"
                    :value (:phone profile)
                    :onChange #(update-field :phone (.. % -detail -value))}
                   ($ ty/Icon {:slot "start" :name "phone" :size "sm"})))

              (d/div {:class "grid grid-cols-1 md:grid-cols-2 gap-4"}
                ($ ty/DatePicker
                   {:label "Birth date"
                    :placeholder "Select…"
                    :value (:birthdate profile)
                    :onChange #(update-field :birthdate (.. % -detail -value))})
                ($ ty/Dropdown
                   {:label "Role"
                    :placeholder "Pick one"
                    :value (:role profile)
                    :onChange #(update-field :role (.. % -detail -option -value))}
                   ($ ty/Option {:value "developer"} "Software Developer")
                   ($ ty/Option {:value "designer"}  "UI/UX Designer")
                   ($ ty/Option {:value "manager"}   "Product Manager")
                   ($ ty/Option {:value "analyst"}   "Data Analyst")
                   ($ ty/Option {:value "other"}     "Other")))

              ($ ty/Multiselect
                 {:label "Skills"
                  :placeholder "Pick a few"
                  :value (when (seq (:skills profile))
                           (str/join "," (:skills profile)))
                  :onChange (fn [^js e]
                              (let [vs (.. e -detail -values)
                                    vec-vs (if (array? vs) (vec vs) [])]
                                (update-field :skills vec-vs)))}
                 ($ ty/Tag {:value "clojure"     :flavor "primary"}   "Clojure")
                 ($ ty/Tag {:value "react"       :flavor "primary"}   "React")
                 ($ ty/Tag {:value "typescript"  :flavor "neutral"}   "TypeScript")
                 ($ ty/Tag {:value "postgres"    :flavor "neutral"}   "PostgreSQL")
                 ($ ty/Tag {:value "design"      :flavor "success"}   "Design"))

              ($ ty/Textarea
                 {:label "Bio"
                  :placeholder "Tell us about yourself…"
                  :rows 3
                  :value (:bio profile)
                  :error (:bio errors)
                  :onChange #(update-field :bio (.. % -detail -value))})

              (d/label {:class "flex items-center gap-2 text-sm ty-text cursor-pointer select-none"}
                ($ ty/Checkbox
                   {:checked (:news? profile)
                    :onChange #(update-field :news? (.. % -detail -checked))})
                "Send me product updates")

              (d/div {:class "flex gap-2 mt-2"}
                ($ ty/Button {:flavor "primary" :pill true :type "submit" :class "flex-1"}
                   ($ ty/Icon {:slot "start" :name "send" :size "sm"})
                   "Submit")
                ($ ty/Button {:flavor "neutral" :pill true :onClick on-reset}
                   ($ ty/Icon {:slot "start" :name "refresh" :size "sm"})
                   "Reset"))

              (when submitted
                (d/div {:class "flex items-center gap-2 ty-bg-success- ty-text-success++ rounded-lg px-3 py-2 text-sm"}
                  ($ ty/Icon {:name "check" :size "sm"})
                  "Submitted! Open the live state pane to see what we'd send."))))

          ;; ---- Live state
          (d/div {:class "ty-floating rounded-xl p-5 flex flex-col gap-4"
                  :style #js {:border "1px solid var(--ty-border-)"}}
            ($ section-header
               {:eyebrow "Live state"
                :title "Bridged via tyrell-react"
                :icon "sparkles"
                :right ($ badge {:icon "check" :label "event.detail" :flavor "success"})})

            (d/div
              (d/div {:class "flex justify-between text-xs ty-text- mb-1"}
                (d/span (str filled "/" total " fields"))
                (d/span (str (.toFixed progress 0) "%")))
              (d/div {:class "w-full ty-bg-neutral- rounded-full"
                      :style #js {:height "6px"}}
                (d/div {:class "ty-bg-accent rounded-full transition-all duration-300"
                        :style #js {:width (str progress "%")
                                    :height "6px"}})))

            (d/div
              (d/div {:class "text-xs font-bold ty-text-- tracking-widest uppercase mb-2"}
                "Form data")
              (d/pre {:class "ty-elevated rounded-lg p-3 text-xs ty-text font-mono leading-relaxed overflow-x-auto"
                      :style #js {:max-height "260px"}}
                (d/code (with-out-str (pprint/pprint profile)))))

            ;; Component coverage — chips light up green when their field
            ;; has a value. Same data the form is binding to, just visualised.
            (d/div {:class "flex flex-wrap gap-1.5"}
              (let [filled? (fn [v]
                              (cond
                                (boolean? v) v
                                (sequential? v) (boolean (seq v))
                                :else (not (str/blank? (str v)))))
                    chip (fn [{:keys [icon label k]}]
                           (let [on? (filled? (get profile k))]
                             ($ badge {:icon  icon
                                       :label label
                                       :flavor (if on? "success" "neutral")})))]
                (<>
                  (chip {:icon "user"      :label "Input"       :k :name})
                  (chip {:icon "check"     :label "Checkbox"    :k :news?})
                  (chip {:icon "calendar"  :label "DatePicker"  :k :birthdate})
                  (chip {:icon "briefcase" :label "Dropdown"    :k :role})
                  (chip {:icon "code"      :label "Multiselect" :k :skills})
                  (chip {:icon "info"      :label "Textarea"    :k :bio}))))))

        ;; ------------------------------------------------------ Overlays
        (d/section {:class "ty-elevated rounded-xl p-5"
                    :style #js {:border "1px solid var(--ty-border-)"}}
          ($ section-header
             {:eyebrow "Overlays" :title "Modal · Tooltip" :icon "rocket"})

          (d/div {:class "flex flex-wrap gap-3 items-center"}
            ($ ty/Button {:flavor "primary" :onClick open-modal}
               ($ ty/Icon {:slot "start" :name "rocket" :size "sm"})
               "Open modal")

            ($ ty/Button {:flavor "neutral"}
               ($ ty/Icon {:slot "start" :name "bell" :size "sm"})
               "Hover me"
               ($ ty/Tooltip {:placement "top"}
                  "Tooltip content lives in the Popover API"))

            ($ ty/Button {:flavor "success"}
               ($ ty/Icon {:slot "start" :name "star" :size "sm"})
               "Success tooltip"
               ($ ty/Tooltip {:placement "bottom" :flavor "success"}
                  "This one is success-flavored")))

          ;; Imperative-ref modal — React idiom for dialogs.
          ($ ty/Modal {:ref modal-ref}
             (d/div {:class "p-6 ty-elevated rounded-2xl flex flex-col gap-4"
                     :style #js {:border "1px solid var(--ty-border-)"
                                 :min-width "320px"}}
               (d/div {:class "flex items-start gap-3"}
                 (d/div {:class "flex items-center justify-center rounded-xl ty-bg-success- flex-shrink-0"
                         :style #js {:width "44px" :height "44px"}}
                   ($ ty/Icon {:name "check" :size "lg" :class "ty-text-success++"}))
                 (d/div {:class "flex-1 min-w-0"}
                   (d/h3 {:class "text-lg font-bold ty-text++"} "Imperative refs work")
                   (d/p {:class "text-sm ty-text-"}
                     "Helix's "
                     (d/code {:class "font-mono text-xs ty-bg-neutral- px-1 rounded"} "use-ref")
                     " plus the wrapper's "
                     (d/code {:class "font-mono text-xs ty-bg-neutral- px-1 rounded"} "useImperativeHandle")
                     " expose .show() / .hide() on the underlying <ty-modal>.")))
               (d/div {:class "flex justify-end"}
                 ($ ty/Button {:flavor "primary" :onClick close-modal}
                    "Close")))))

        ;; ----------------------------------------- "Why Helix" + footer
        (d/section {:class "ty-elevated rounded-xl p-5"
                    :style #js {:border "1px solid var(--ty-border-)"}}
          ($ section-header
             {:eyebrow "Reference" :title "Why Helix?" :icon "sparkles"})
          (d/div {:class "grid grid-cols-1 md:grid-cols-3 gap-4"}
            ($ feature-row {:n 1 :icon "sparkles" :title "JSX-style macros"
                            :body "($ Component {…}) reads like JSX. Same shape as React, just CLJS."})
            ($ feature-row {:n 2 :icon "user"     :title "First-class hooks"
                            :body "use-state, use-effect, use-ref, use-callback via helix.hooks."})
            ($ feature-row {:n 3 :icon "check"    :title "tyrell-react out of the box"
                            :body "The same npm package Reagent and UIx use. Drop-in wrapper components."})))

        (d/div {:class "ty-floating rounded-xl p-5"
                :style #js {:border "1px solid var(--ty-border-)"}}
          (d/div {:class "flex items-center justify-between mb-3"}
            (d/span {:class "text-xs font-bold ty-text-- tracking-widest uppercase"}
              "One wrapper, three shapes")
            ($ badge {:icon "sparkles" :label "tyrell-react" :flavor "accent"}))
          (d/div {:class "grid grid-cols-1 md:grid-cols-3 gap-3"}
            (d/div {:class "ty-elevated rounded-lg p-3"}
              (d/div {:class "text-xs font-bold ty-text-accent tracking-widest uppercase mb-2"}
                "Helix · this app")
              (d/pre {:class "text-xs ty-text font-mono leading-relaxed overflow-x-auto"}
                (d/code "($ ty/Button\n   {:flavor \"primary\"}\n   \"Save\")")))
            (d/div {:class "ty-elevated rounded-lg p-3"}
              (d/div {:class "text-xs font-bold ty-text-- tracking-widest uppercase mb-2"}
                "UIx")
              (d/pre {:class "text-xs ty-text font-mono leading-relaxed overflow-x-auto"}
                (d/code "($ ty/Button\n   {:flavor \"primary\"}\n   \"Save\")")))
            (d/div {:class "ty-elevated rounded-lg p-3"}
              (d/div {:class "text-xs font-bold ty-text-- tracking-widest uppercase mb-2"}
                "Reagent · re-frame")
              (d/pre {:class "text-xs ty-text font-mono leading-relaxed overflow-x-auto"}
                (d/code "[:> ty/Button\n  {:flavor \"primary\"}\n  \"Save\"]")))))

        (d/p {:class "text-xs ty-text-- text-center mt-2"}
          "Source: "
          (d/code {:class "font-mono ty-bg-neutral- px-1 rounded"} "examples/helix/src/hello/core.cljs"))))))

;; =============================================================================
;; Mount
;; =============================================================================

(defonce root
  (rdom/createRoot (.getElementById js/document "app")))

(defn render! []
  (.render root ($ demo)))

(defn ^:export init []
  (icons/register!)
  (render!))
