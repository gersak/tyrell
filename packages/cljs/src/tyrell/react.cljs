(ns tyrell.react
  "CLJS-namespaced re-exports of the React component wrappers from
   the npm `tyrell-react` package.

   For React-based CLJS frameworks (Reagent, re-frame, UIx, Helix),
   require this namespace instead of the npm package directly:

     (ns my.app
       (:require [tyrell.components]      ; registers <ty-*> elements
                 [tyrell.react :as ty]))  ; React component vars

     [:> ty/Button {:flavor \"primary\"} \"Save\"]
     [:> ty/Input {:label \"Email\" :on-change handler}]

   Each component is re-exported under TWO names:
   - `TyButton`, `TyInput`, ... (explicit, ty-prefixed)
   - `Button`, `Input`, ... (short, React-idiomatic)

   Use whichever your team prefers.

   Note: this namespace requires `tyrell-react` to be installed via npm.
   It is NOT auto-pulled by `dev.gersak/tyrell`'s `deps.cljs` — only Track A
   (React-based CLJS) users need the wrapper package, so the npm install
   stays opt-in:

     npm install tyrell-react"
  (:require ["tyrell-react" :as t]))

(def TyButton              t/TyButton)
(def TyCalendar            t/TyCalendar)
(def TyCalendarMonth       t/TyCalendarMonth)
(def TyCalendarNavigation  t/TyCalendarNavigation)
(def TyCheckbox            t/TyCheckbox)
(def TyCopy                t/TyCopy)
(def TyDatePicker          t/TyDatePicker)
(def TyIcon                t/TyIcon)
(def TyInput               t/TyInput)
(def TyModal               t/TyModal)
(def TyOption              t/TyOption)
(def TyPopup               t/TyPopup)
(def TyRadio               t/TyRadio)
(def TyRadioGroup          t/TyRadioGroup)
(def TyResizeObserver      t/TyResizeObserver)
(def TyScrollContainer     t/TyScrollContainer)
(def TyStep                t/TyStep)
(def TySwitch              t/TySwitch)
(def TyTab                 t/TyTab)
(def TyTabs                t/TyTabs)
(def TyTag                 t/TyTag)
(def TyTextarea            t/TyTextarea)
(def TyTooltip             t/TyTooltip)
(def TyWizard              t/TyWizard)

(def Button             t/Button)
(def Calendar           t/Calendar)
(def CalendarMonth      t/CalendarMonth)
(def CalendarNavigation t/CalendarNavigation)
(def Checkbox           t/Checkbox)
(def Copy               t/Copy)
(def DatePicker         t/DatePicker)
(def Icon               t/Icon)
(def Input              t/Input)
(def Modal              t/Modal)
(def Option             t/Option)
(def Popup              t/Popup)
(def Radio              t/Radio)
(def RadioGroup         t/RadioGroup)
(def ResizeObserver     t/ResizeObserver)
(def ScrollContainer    t/ScrollContainer)
(def Step               t/Step)
(def Switch             t/Switch)
(def Tab                t/Tab)
(def Tabs               t/Tabs)
(def Tag                t/Tag)
(def Textarea           t/Textarea)
(def Tooltip            t/Tooltip)
(def Wizard             t/Wizard)
