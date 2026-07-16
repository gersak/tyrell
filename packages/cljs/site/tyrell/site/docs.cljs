(ns tyrell.site.docs
  "Documentation system for ty components - provides data and views"
  (:require
   [tyrell.router :as router]
   [tyrell.site.docs.button :as button-docs]
   [tyrell.site.docs.calendar :as calendar-docs]
   [tyrell.site.docs.calendar-month :as calendar-month-docs]
   [tyrell.site.docs.checkbox :as checkbox-docs]
   [tyrell.site.docs.clojurescript :as clojurescript-docs]
   [tyrell.site.docs.copy-field :as copy-field-docs]
   [tyrell.site.docs.file-upload :as file-upload-docs]
   [tyrell.site.docs.date-picker :as date-picker-docs]
   [tyrell.site.docs.html :as html-docs]
   [tyrell.site.docs.icon :as icon-docs]
   [tyrell.site.docs.input :as input-docs]
   [tyrell.site.docs.js-react :as js-react-docs]
   [tyrell.site.docs.modal :as modal-docs]
   [tyrell.site.docs.popup :as popup-docs]
   [tyrell.site.docs.select :as select-docs]
   [tyrell.site.docs.radio :as radio-docs]
   [tyrell.site.docs.resize-observer :as resize-observer-docs]
   [tyrell.site.docs.scroll-container :as scroll-container-docs]
   [tyrell.site.docs.switch :as switch-docs]
   [tyrell.site.docs.tabs :as tabs-docs]
   [tyrell.site.docs.tag :as tag-docs]
   [tyrell.site.docs.textarea :as textarea-docs]
   [tyrell.site.docs.theming :as theming-docs]
   [tyrell.site.docs.tooltip :as tooltip-docs]
   [tyrell.site.docs.wizard :as wizard-docs]
    ;; Import component doc namespaces
   [tyrell.site.views.getting-started :as getting-started]
   [tyrell.site.views.ty-styles :as ty-styles]))

;; ============================================================================
;; Component picker previews
;; ============================================================================
;; Each preview is a plain hiccup vector rendered inside a bento cell in the
;; component picker. Live ty- elements are used wherever they render cleanly
;; at rest; styled mocks are used for components that have no at-rest form
;; (modal, popup, tooltip) or that need rich children (tabs, wizard).
;;
;; Cells are pointer-events: none in the picker, so live components are visual.

;; --- Action ---

(def ^:private button-preview
  [:div.flex.flex-col.gap-3
   {:style {:width "260px"}}
   ;; Labeled buttons with icons
   [:div.flex.flex-wrap.items-center.gap-2
    [:ty-button {:flavor "primary"
                 :size "sm"}
     [:ty-icon {:slot "start"
                :name "save"
                :size "sm"}]
     "Save"]
    [:ty-button {:flavor "neutral"
                 :size "sm"
                 :outlined ""} "Cancel"]
    [:ty-button {:flavor "danger"
                 :size "sm"
                 :pill ""}
     [:ty-icon {:slot "start"
                :name "trash"
                :size "sm"}]
     "Delete"]]
   ;; Action buttons (icon-only, properly sized via :action)
   [:div.flex.flex-wrap.items-center.gap-2
    [:ty-button {:action true
                 :flavor "primary"
                 :size "sm"}
     [:ty-icon {:name "plus"
                :size "sm"}]]
    [:ty-button {:action true
                 :flavor "secondary"
                 :size "sm"}
     [:ty-icon {:name "edit"
                :size "sm"}]]
    [:ty-button {:action true
                 :flavor "danger"
                 :size "sm"}
     [:ty-icon {:name "trash"
                :size "sm"}]]
    [:ty-button {:action true
                 :flavor "primary"
                 :size "sm"}
     [:ty-icon {:name "loader-2"
                :size "sm"
                :spin true}]]
    [:ty-button {:action true
                 :flavor "warning"
                 :size "sm"}
     [:ty-icon {:name "bell"
                :size "sm"
                :pulse true}]]
    [:ty-button {:action true
                 :size "sm"}
     [:ty-icon {:name "more-vertical"
                :size "sm"}]]]])

(def ^:private tag-preview
  [:div.flex.flex-wrap.items-center.gap-2
   {:style {:width "260px"}}
   [:ty-tag {:flavor "primary"
             :pill ""} "react"]
   [:ty-tag {:flavor "success"
             :pill ""} "stable"]
   [:ty-tag {:flavor "warning"
             :pill ""} "beta"]
   [:ty-tag {:flavor "neutral"
             :pill ""
             :dismissible ""} "v1.0"]])

;; --- Text input ---

(def ^:private input-preview
  [:ty-input {:label "Search"
              :placeholder "Find anything…"
              :value "components"
              :style {:width "260px"}}
   [:ty-icon {:slot "start"
              :name "search"
              :size "sm"}]
   [:ty-icon {:slot "end"
              :name "x"
              :size "sm"
              :class "ty-text--"}]])

(def ^:private textarea-preview
  [:ty-textarea {:label "Description"
                 :value "Ty primitives:\n• consistent\n• embeddable\n• unstyled"
                 :style {:width "260px"
                         :min-height "92px"}}])

;; Toggles share the same fixed-size stage so they read as a consistent set.
(def ^:private toggle-stage-style
  {:style {:width "260px"
           :min-height "140px"}})

(def ^:private checkbox-preview
  [:div.ty-floating.rounded-lg.p-5.flex.flex-col.items-start.justify-center.gap-2
   toggle-stage-style
   [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
    [:ty-checkbox {:checked ""
                   :flavor "success"}]
    [:span.whitespace-nowrap "Done"]]
   [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
    [:ty-checkbox {:flavor "primary"}]
    [:span.whitespace-nowrap "In progress"]]
   [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium.opacity-60
    [:ty-checkbox {:disabled ""}]
    [:span.whitespace-nowrap "Disabled"]]])

(def ^:private switch-preview
  [:div.ty-floating.rounded-lg.p-5.flex.flex-col.items-start.justify-center.gap-2
   toggle-stage-style
   [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium
    [:ty-switch {:checked ""
                 :flavor "primary"}]
    [:span.whitespace-nowrap "Email notifications"]]
   [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium
    [:ty-switch {:checked ""
                 :flavor "success"}]
    [:span.whitespace-nowrap "Auto-save"]]
   [:label.inline-flex.items-center.gap-3.cursor-pointer.text-sm.font-medium
    [:ty-switch {:flavor "danger"}]
    [:span.whitespace-nowrap "Delete on inactive"]]])

(def ^:private radio-preview
  [:div.ty-floating.rounded-lg.p-5.flex.flex-col.items-start.justify-center
   toggle-stage-style
   [:ty-radio-group {:label "Plan"
                     :name "plan"
                     :value "pro"
                     :flavor "primary"}
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
     [:ty-radio {:value "free"}] [:span.whitespace-nowrap "Free"]]
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
     [:ty-radio {:value "pro"}] [:span.whitespace-nowrap "Pro"]]
    [:label.inline-flex.items-center.gap-2.cursor-pointer.text-sm.font-medium
     [:ty-radio {:value "team"}] [:span.whitespace-nowrap "Team"]]]])

(def ^:private file-upload-preview
  [:div.ty-floating.rounded-lg.p-4.flex.flex-col.gap-3
   {:style {:width "260px"}}
   [:div {:style {:border "2px dashed var(--ty-border)"
                  :border-radius "var(--ty-radius-base)"
                  :padding "1.25rem 1rem"
                  :text-align "center"
                  :display "flex"
                  :flex-direction "column"
                  :align-items "center"
                  :gap "0.375rem"}}
    [:div {:style {:color "var(--ty-text--)" :width "1.75rem" :height "1.75rem"}}
     [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "none"
            :stroke "currentColor" :stroke-width "1.5"
            :stroke-linecap "round" :stroke-linejoin "round"}
      [:path {:d "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}]
      [:polyline {:points "17 8 12 3 7 8"}]
      [:line {:x1 "12" :y1 "3" :x2 "12" :y2 "15"}]]]
    [:span {:style {:font-size "0.75rem" :color "var(--ty-text-)"}}
     "Drop files or "
     [:span {:style {:color "var(--ty-color-primary)" :font-weight "500"}} "browse"]]]
   [:div {:style {:display "flex" :align-items "center" :gap "0.5rem"
                  :padding "0.375rem 0.625rem"
                  :border-radius "var(--ty-radius-base)"
                  :background "var(--ty-surface-content)"
                  :border "1px solid var(--ty-border-soft)"}}
    [:div {:style {:color "var(--ty-text--)" :width "0.875rem" :height "0.875rem"}}
     [:svg {:xmlns "http://www.w3.org/2000/svg" :viewBox "0 0 24 24" :fill "none"
            :stroke "currentColor" :stroke-width "1.5"
            :stroke-linecap "round" :stroke-linejoin "round"}
      [:path {:d "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}]
      [:polyline {:points "14 2 14 8 20 8"}]]]
    [:span {:style {:flex "1" :font-size "0.75rem" :color "var(--ty-text)"}} "resume.pdf"]
    [:span {:style {:font-size "0.6875rem" :color "var(--ty-text--)"}} "142 KB"]]])

(def ^:private copy-field-preview
  [:div.flex.flex-col.gap-2
   [:ty-copy {:label "Install"
              :value "npm i tyrell-components"
              :format "code"
              :style {:width "260px"}}]
   [:ty-copy {:label "API key"
              :value "sk_live_••••••••"
              :format "code"
              :style {:width "260px"}}]])

;; --- Selection ---

(def ^:private select-preview
  [:div.space-y-2 {:style {:width "260px"}}
   [:ty-select {:placeholder "Pick your stack…"
                :multiple true
                :label "Tech stack"
                :id "select-preview"
                :value "react,clojure"}
    [:ty-option {:value "react" :flavor "info"} "React"]
    [:ty-option {:value "clojure" :flavor "primary"} "Clojure"]
    [:ty-option {:value "node-js" :flavor "success"} "Node.js"]
    [:ty-option {:value "python" :flavor "warning"} "Python"]]
   [:div.flex.flex-wrap.gap-2
    [:ty-selected-tags {:for "select-preview"}]]])

;; --- Date & time ---

(def ^:private date-picker-preview
  [:ty-date-picker {:label "Meeting date"
                    :value "2026-05-15"
                    :style {:width "260px"}}
   [:ty-icon {:slot "start"
              :name "briefcase"
              :size "sm"}]])

(def ^:private calendar-preview
  [:ty-calendar {:size "sm"}])

(def ^:private calendar-month-preview
  [:ty-calendar-month {:size "sm"}])

;; --- Overlays ---
;; Modal/popup/tooltip have no at-rest form on a page, so we stage stylized
;; representations that read as the actual artifact.

(def ^:private modal-preview
  [:div.ty-floating.rounded-lg.flex.flex-col.gap-3.p-4
   {:style {:width "260px"
            :box-shadow "0 12px 32px rgba(0,0,0,0.18)"}}
   [:div.flex.items-center.justify-between
    [:div.text-sm.font-semibold.ty-text "Confirm delete"]
    [:ty-icon {:name "x"
               :size "xs"
               :class "ty-text--"}]]
   [:p.text-xs.ty-text-.leading-relaxed
    "This action can't be undone. Your project will be permanently removed."]
   [:div.flex.justify-end.gap-2.pt-1
    [:div.text-xs.font-medium.px-3.py-1.5.rounded.ty-text- "Cancel"]
    [:div.text-xs.font-medium.px-3.py-1.5.rounded.ty-bg-danger
     {:class "ty-text-danger++"} "Delete"]]])

(def ^:private popup-preview
  [:div.flex.items-start.gap-3
   [:div.flex.items-center.gap-1.text-xs.font-medium.px-2.5.py-1.5.rounded-md.ty-input.border.ty-border
    "Menu"
    [:ty-icon {:name "chevron-down"
               :size "xs"
               :class ["ty-text--" "ml-1"]}]]
   [:div.ty-floating.rounded-md.flex.flex-col.text-xs.py-1
    {:style {:min-width "140px"
             :box-shadow "0 8px 20px rgba(0,0,0,0.12)"}}
    [:div.flex.items-center.gap-2.px-3.py-1.5.ty-text
     [:ty-icon {:name "edit"
                :size "xs"
                :class "ty-text--"}]
     "Edit"]
    [:div.flex.items-center.gap-2.px-3.py-1.5.ty-text
     [:ty-icon {:name "copy"
                :size "xs"
                :class "ty-text--"}]
     "Duplicate"]
    [:div.h-px.ty-bg-neutral-.my-1]
    [:div.flex.items-center.gap-2.px-3.py-1.5.ty-text-danger
     [:ty-icon {:name "trash"
                :size "xs"}]
     "Delete"]]])

(def ^:private tooltip-preview
  [:div.flex.items-center.gap-3
   [:ty-icon {:name "info"
              :size "lg"
              :class "ty-text-"}]
   [:div.relative
    [:div.ty-floating.rounded.px-2.5.py-1.5.text-xs.font-medium.ty-text
     {:style {:box-shadow "0 4px 12px rgba(0,0,0,0.12)"}}
     "Helpful hint"]
    [:div.absolute
     {:style {:left "-5px"
              :top "50%"
              :width 0
              :height 0
              :transform "translateY(-50%)"
              :border-top "5px solid transparent"
              :border-bottom "5px solid transparent"
              :border-right "5px solid var(--ty-surface-floating)"}}]]])

;; --- Layout primitives ---

(def ^:private tabs-preview
  [:div.flex.flex-col
   {:style {:width "260px"}}
   [:div.flex.gap-5.text-sm.border-b.ty-border-
    [:div.pb-2.font-medium.ty-text
     {:style {:border-bottom "2px solid var(--ty-color-primary)"
              :margin-bottom "-1px"}}
     "Overview"]
    [:div.pb-2.ty-text- "Activity"]
    [:div.pb-2.ty-text- "Settings"]]
   [:div.pt-3.text-xs.ty-text--.italic "Tab content here…"]])

(def ^:private wizard-preview
  [:div.flex.items-center.gap-1
   {:style {:width "260px"}}
   ;; Step 1 done
   [:div.flex.flex-col.items-center.gap-1
    [:div.flex.items-center.justify-center.rounded-full.ty-bg-success
     {:style {:width "26px"
              :height "26px"}}
     [:ty-icon {:name "check"
                :size "xs"
                :class "ty-text-success++"}]]
    [:span.text-xs.ty-text- "Plan"]]
   [:div.flex-1.h-px.ty-bg-success {:style {:margin-bottom "16px"}}]
   ;; Step 2 active
   [:div.flex.flex-col.items-center.gap-1
    [:div.flex.items-center.justify-center.rounded-full.ty-bg-primary.text-xs.font-bold
     {:class "ty-text-primary++"
      :style {:width "26px"
              :height "26px"}}
     "2"]
    [:span.text-xs.ty-text.font-medium "Build"]]
   [:div.flex-1.h-px.ty-bg-neutral- {:style {:margin-bottom "16px"}}]
   ;; Step 3 pending
   [:div.flex.flex-col.items-center.gap-1
    [:div.flex.items-center.justify-center.rounded-full.text-xs.font-medium.ty-text--
     {:style {:width "26px"
              :height "26px"
              :border "1px solid var(--ty-border)"}}
     "3"]
    [:span.text-xs.ty-text-- "Ship"]]])

(def ^:private scroll-container-preview
  [:div.relative.rounded-md.overflow-hidden.ty-content
   {:style {:width "260px"
            :height "76px"}}
   [:div.flex.gap-2.h-full.items-center.px-3
    {:style {:padding-top "12px"
             :padding-bottom "12px"}}
    (for [[i flavor] (map-indexed vector ["primary" "success" "warning" "info" "danger" "neutral"])]
      ^{:key i}
      [:div.flex-shrink-0.rounded
       {:class (str "ty-bg-" flavor "-")
        :style {:width "60px"
                :height "100%"}}])]
   ;; Edge fade indicators
   [:div.absolute.left-0.top-0.bottom-0
    {:style {:width "20px"
             :pointer-events "none"
             :background "linear-gradient(to right, var(--ty-surface-content), transparent)"}}]
   [:div.absolute.right-0.top-0.bottom-0
    {:style {:width "32px"
             :pointer-events "none"
             :background "linear-gradient(to left, var(--ty-surface-content), transparent)"}}]])

(def ^:private resize-observer-preview
  [:div.relative.flex.items-center.justify-center.rounded-md.ty-content
   {:style {:width "200px"
            :height "92px"
            :border "1px dashed var(--ty-border)"}}
   [:div.flex.flex-col.items-center.gap-1
    [:div.text-xs.font-mono.ty-text- "200 × 92"]
    [:div.text-xs.ty-text-- "size tracked"]]
   ;; Resize corner handle
   [:div.absolute
    {:style {:right "4px"
             :bottom "4px"
             :width "10px"
             :height "10px"
             :border-right "2px solid var(--ty-color-primary)"
             :border-bottom "2px solid var(--ty-color-primary)"}}]])

;; --- Visual ---

(def ^:private icon-preview
  [:div.flex.flex-wrap.items-center.gap-4
   {:style {:width "260px"}}
   [:ty-icon {:name "star"
              :size "lg"
              :class "ty-text-primary"}]
   [:ty-icon {:name "heart"
              :size "lg"
              :class "ty-text-danger"
              :pulse true}]
   [:ty-icon {:name "loader-2"
              :size "lg"
              :class "ty-text-info"
              :spin true}]
   [:ty-icon {:name "check-circle"
              :size "lg"
              :class "ty-text-success"}]
   [:ty-icon {:name "settings"
              :size "lg"
              :class "ty-text-"
              :spin true
              :tempo "slow"}]
   [:ty-icon {:name "github"
              :size "lg"
              :class "ty-text"}]
   [:ty-icon {:name "bell"
              :size "lg"
              :class "ty-text-warning"
              :pulse true
              :tempo "slow"}]])

;; ============================================================================
;; Components
;; ============================================================================

(def docs-components
  [{:id :tyrell.site.docs/button
    :segment "button"
    :icon "square"
    :view button-docs/view
    :name "Button"
    :description "7 semantic flavors, sizes xs–xl, start/end icon slots, and modifiers (pill, outlined, filled, plain, action, wide). Action mode for FAB-style icon buttons."
    :tags ["action" "click" "submit" "form"]
    :preview button-preview}
   {:id :tyrell.site.docs/calendar
    :segment "calendar"
    :icon "calendar"
    :view calendar-docs/view
    :name "Calendar"
    :description "Selectable calendar composing internal `ty-calendar-navigation` and `ty-calendar-month`. ISO date API, form integration, can be controlled externally."
    :tags ["date" "picker" "schedule" "month"]
    :span [2 2]
    :preview calendar-preview}
   {:id :tyrell.site.docs/calendar-month
    :segment "calendar-month"
    :icon "calendar"
    :view calendar-month-docs/view
    :name "Calendar Month"
    :description "Stateless 6-week month grid. Monday-first ordering, localized day headers, custom day rendering, sizes sm/md/lg."
    :tags ["date" "month" "grid" "schedule"]
    :span [2 2]
    :preview calendar-month-preview}
   {:id :tyrell.site.docs/date-picker
    :segment "date-picker"
    :icon "clock"
    :view date-picker-docs/view
    :name "Date Picker"
    :description "Date input with integrated calendar popup. ISO date string value, form participation, locale-aware."
    :tags ["date" "input" "form" "picker" "time"]
    :span [2 1]
    :preview date-picker-preview}
   {:id :tyrell.site.docs/icon
    :segment "icon"
    :icon "star"
    :view icon-docs/view
    :name "Icon"
    :description "Registry-based SVG icons. Spin and pulse animations with tempo control (slow/normal/fast), semantic colors, sizes xs–xl."
    :tags ["svg" "image" "symbol" "graphic"]
    :preview icon-preview}
   {:id :tyrell.site.docs/inputs
    :segment "inputs"
    :icon "inputs"
    :name "Inputs"
    :description "Form input components"
    :tags ["form" "field" "text"]
    :view (fn [] (router/navigate! :tyrell.site.docs/input-field) nil)
    :children [{:id :tyrell.site.docs/input-field
                :segment "input-field"
                :icon "edit-3"
                :view input-docs/view
                :name "Input Field"
                :description "Text, currency, percent, integer, and float types — locale-aware numeric formatting. Debounce control, start/end icon slots, label and error messages."
                :tags ["text" "form" "field" "input"]
                :span [2 1]
                :preview input-preview}
               {:id :tyrell.site.docs/checkbox
                :segment "checkbox"
                :icon "check-square"
                :view checkbox-docs/view
                :name "Checkbox"
                :description "Just the box — boolean state primitive. Wrap in a `<label>` for click-on-text behavior. Semantic flavors, sizes, form-associated, ARIA."
                :tags ["toggle" "boolean" "form" "check"]
                :preview checkbox-preview}
               {:id :tyrell.site.docs/switch
                :segment "switch"
                :icon "toggle-right"
                :view switch-docs/view
                :name "Switch"
                :description "Just the toggle — track + thumb visual with `role=\"switch\"` ARIA. Same primitive model as `ty-checkbox`; wrap in a `<label>` for the text. Use for immediate-effect settings."
                :tags ["toggle" "switch" "boolean" "form" "settings"]
                :span [2 1]
                :preview switch-preview}
               {:id :tyrell.site.docs/radio
                :segment "radio"
                :icon "circle-dot"
                :view radio-docs/view
                :name "Radio Group"
                :description "Exclusive single-choice. `ty-radio-group` manages value, label, error, and form participation. Each `ty-radio` is just the circle — wrap in a `<label>` for the text. Arrow keys navigate AND change selection."
                :tags ["radio" "select" "exclusive" "single" "form" "choice"]
                :span [2 2]
                :preview radio-preview}
               {:id :tyrell.site.docs/file-upload
                :segment "file-upload"
                :icon "upload"
                :view file-upload-docs/view
                :name "File Upload"
                :description "Drop zone file picker — styleable drag-and-drop replacement for <input type=\"file\">. Click or drop, multiple files, accept filter, form-associated."
                :tags ["file" "upload" "drop" "drag" "form" "input"]
                :span [2 1]
                :preview file-upload-preview}
               {:id :tyrell.site.docs/copy-field
                :segment "copy-field"
                :icon "copy"
                :view copy-field-docs/view
                :name "Copy Field"
                :description "Read-only with copy-to-clipboard. Animated icon feedback (copy → check), code or text formatting modes."
                :tags ["clipboard" "copy" "readonly"]
                :span [2 1]
                :preview copy-field-preview}
               {:id :tyrell.site.docs/textarea
                :segment "textarea"
                :icon "file-text"
                :view textarea-docs/view
                :name "Textarea"
                :description "Auto-resizing with min/max height, custom scrollbar, resize control (none, both, horizontal, vertical), label and error messages."
                :tags ["text" "multiline" "form" "input"]
                :span [2 1]
                :preview textarea-preview}]}
   {:id :tyrell.site.docs/modal
    :segment "modal"
    :icon "layout"
    :view modal-docs/view
    :name "Modal"
    :description "Native `<dialog>` overlay with scroll locking, backdrop and ESC close, and protected mode for unsaved changes."
    :tags ["dialog" "overlay" "popup" "lightbox"]
    :span [2 2]
    :preview modal-preview}
   {:id :tyrell.site.docs/select
    :segment "select"
    :icon "filter"
    :view select-docs/view
    :name "Select"
    :description "The select control — replaces dropdown and multiselect. Single select by default with a form-field look; `multiple` for multi-select, `compact` for a content-hugging trigger skin, or slot a custom trigger. Searchable popup with `ty-option` children, form-associated."
    :tags ["select" "multiple" "tags" "form" "filter"]
    :span [2 1]
    :preview select-preview}
   {:id :tyrell.site.docs/popup
    :segment "popup"
    :icon "message-square"
    :view popup-docs/view
    :name "Popup"
    :description "Click-triggered floating content with edge-aware positioning. Scroll locking, ESC and backdrop close, manual control mode."
    :tags ["floating" "popover" "overlay" "menu"]
    :preview popup-preview}
   {:id :tyrell.site.docs/resize-observer
    :segment "resize-observer"
    :icon "maximize"
    :view resize-observer-docs/view
    :name "Resize Observer"
    :description "Tracks its own dimensions in a global registry with debounce support. Used for responsive layouts."
    :tags ["responsive" "size" "layout" "observer"]
    :preview resize-observer-preview}
   {:id :tyrell.site.docs/scroll-container
    :segment "scroll-container"
    :icon "scroll-text"
    :view scroll-container-docs/view
    :name "Scroll Container"
    :description "Scroll wrapper with edge shadow indicators, custom scrollbar styling, max-height control, and horizontal overflow."
    :tags ["scroll" "overflow" "container" "shadow"]
    :span [2 1]
    :preview scroll-container-preview}
   {:id :tyrell.site.docs/tabs
    :segment "tabs"
    :icon "layout"
    :view tabs-docs/view
    :name "Tabs"
    :description "Carousel-based tabs with smooth slide animations, animated active marker, and top or bottom placement. Uses `ty-tab` children."
    :tags ["navigation" "panels" "switch" "views"]
    :span [2 1]
    :preview tabs-preview}
   {:id :tyrell.site.docs/wizard
    :segment "wizard"
    :icon "list-ordered"
    :view wizard-docs/view
    :name "Wizard"
    :description "Multi-step stepper with progress line, completion tracking, status per step (active/completed/error/disabled), horizontal or vertical. Uses `ty-step` children."
    :tags ["steps" "stepper" "form" "workflow" "carousel"]
    :span [2 2]
    :preview wizard-preview}
   {:id :tyrell.site.docs/tag
    :segment "tag"
    :icon "tag"
    :view tag-docs/view
    :name "Tag"
    :description "Pills and chips with click and dismiss handlers. Semantic flavors, sizes, selected state, keyboard accessible (Enter/Backspace)."
    :tags ["label" "badge" "chip" "category"]
    :preview tag-preview}
   {:id :tyrell.site.docs/tooltip
    :segment "tooltip"
    :icon "message-square"
    :view tooltip-docs/view
    :name "Tooltip"
    :description "Hover and focus tooltips via the Popover API. Smart positioning, configurable delay, dark/light/semantic flavors."
    :tags ["hint" "help" "hover" "info"]
    :preview tooltip-preview}])

(def guide-components
  [{:id :tyrell.site.docs/getting-started
    :segment "getting-started"
    :name "Getting started"
    :icon "rocket"
    :description "Installation and basic setup"
    :tags ["install" "setup" "npm" "quick start"]
    :view #(getting-started/view)}
   {:id :tyrell.site.docs/javascript
    :segment "javascript"
    :name "JavaScript/TypeScript"
    :icon "code"
    :description "Web components for every JS framework — install, bundlers, React wrappers"
    :tags ["javascript" "typescript" "react" "vue" "svelte" "astro" "jsx" "npm"]
    :view js-react-docs/view}
   {:id :tyrell.site.docs/clojurescript
    :segment "clojurescript"
    :name "ClojureScript"
    :icon "clojure"
    :description "Web components and CLJS-native infrastructure for every CLJS framework"
    :tags ["clojure" "clojurescript" "reagent" "re-frame" "uix" "helix" "replicant"]
    :view clojurescript-docs/view}
   {:id :tyrell.site.docs/html
    :segment "html"
    :name "HTML / Server-side"
    :icon "server"
    :description "HTMX, Datastar, Flask, Django, Rails, Phoenix, PHP — render HTML on the server, hydrate as web components"
    :tags ["htmx" "datastar" "server" "html" "ssr" "backend" "flask" "django" "rails" "phoenix" "php" "laravel"]
    :view html-docs/view}
   {:id :tyrell.site.docs/css
    :segment "css"
    :name "CSS System"
    :icon "palette"
    :description "Colors, surfaces, and design tokens"
    :tags ["theme" "colors" "dark mode" "styling" "tailwind"]
    :view #(ty-styles/view)}
   {:id :tyrell.site.docs/theming
    :segment "theming"
    :name "Theming (OKLCH)"
    :icon "droplet"
    :description "Interactive brand-layer playground — pick two seeds, retint everything in light + dark."
    :tags ["theme" "oklch" "brand" "colors" "playground" "dark mode"]
    :view #(theming-docs/view)}])

;; Define routes with views from separate namespaces

;; Helper to check if current route is a docs route
(defn in-docs? []
  (router/rendered? :tyrell.site/docs false))

;; Render function - fallback for docs routes not handled by site.core.cljs

(defn render
  "Render the appropriate docs view based on current route"
  []
  ;; No global highlighting needed - individual code blocks handle it via :replicant/on-mount
  (let [{view :view} (some #(when (router/rendered? (:id %) true) %) (concat docs-components guide-components))]
    (if view (view) (getting-started/view))))
