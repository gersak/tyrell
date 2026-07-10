# Replicant + Tyrell Guide

Using Tyrell web components with Replicant (ClojureScript DOM library).

For the full CSS class reference, see [`CSS_GUIDE.md`](../CSS_GUIDE.md). In Replicant hiccup, Tyrell color classes go on the element keyword with dots, Tailwind handles everything else:

```clojure
;; Tyrell for colors (surfaces, text, bg, border), Tailwind for layout
[:div.ty-elevated.p-6.rounded-lg.flex.items-center
 [:h2.ty-text++.text-xl.font-bold "Title"]
 [:p.ty-text-.text-sm "Subtitle"]]

;; Dynamic classes — use vectors, not string concatenation
[:div {:class ["ty-elevated" "p-4" (when active? "ty-bg-primary-")]}]
```

---

## Loading Tyrell CSS

Component classes only work once `tyrell.css` is loaded. Easiest is a CDN `<link>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
```

For offline dev, fetch the file once and serve it from your `public/`:

```bash
# Pin a version
curl -o public/css/tyrell.css https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-RC6/css/tyrell.css

# Or copy from the version shadow-cljs already installed (after first build)
cp node_modules/tyrell-components/css/tyrell.css public/css/tyrell.css
```

Then `<link rel="stylesheet" href="/css/tyrell.css">`. See [`CLOJURESCRIPT_GUIDE.md`](CLOJURESCRIPT_GUIDE.md#css-handling) for the Tailwind/PostCSS pipeline variant.

---

## Replicant Attribute Conventions

Replicant emits console warnings (and in some cases drops change detection) when `:class` and `:style` aren't shaped the way it expects. Three rules cover virtually every case:

### 1. `:class` is always a vector of single-class tokens

Multi-class strings like `"text-xs font-light"` warn *and* perform worse — Replicant has to parse them at every render. Use a vector of single-class strings (or keywords) instead, **including inside `(when …)`, `(if …)`, `(cond …)`, `(case …)` branches**. The string-with-spaces is still wrong even when it's deep inside a dynamic form.

```clojure
;; ❌ Multi-class string (warns)
[:span {:class "text-xs font-light"} "welcome"]

;; ❌ Multi-class string inside a dynamic form (still warns)
[:div {:class (when on-click "cursor-pointer hover:shadow-lg")} ...]

[:span {:class (cond
                 (and featured? active?) "text-xs font-semibold"
                 featured?               "text-xs font-medium"
                 :else                   "text-xs font-light")}]

;; ✅ Vectors everywhere
[:span {:class ["text-xs" "font-light"]} "welcome"]

[:div {:class (when on-click ["cursor-pointer" "hover:shadow-lg"])} ...]

[:span {:class (cond
                 (and featured? active?) ["text-xs" "font-semibold"]
                 featured?               ["text-xs" "font-medium"]
                 :else                   ["text-xs" "font-light"])}]
```

Single-class strings like `(when active? "ty-text-primary")` are fine — the rule only applies to strings that contain spaces.

### 2. `:style` is always a map, never a string

Style strings (`{:style "font-size: 0.875rem;"}`) warn — Replicant has to parse them on every render and they're harder to read. Use a map of CSS-property keywords:

```clojure
;; ❌ Style string
[:p {:style "font-size: 0.875rem; line-height: 1.6;"} ...]

;; ✅ Style map
[:p {:style {:font-size "0.875rem"
             :line-height "1.6"}} ...]
```

This rule applies only to the `:style` *attribute*. The `[:style "…"]` *element* (a `<style>` tag with CSS source as text content) is unaffected — it's a tag, not an attribute.

### 3. `:style` map keys are keywords — including CSS custom properties

Replicant warns when style keys are strings or symbols and refuses to recognize subsequent changes to them reliably. Clojure keywords accept the `--` prefix, so CSS custom properties become valid keywords:

```clojure
;; ❌ String keys for CSS variables
[:ty-button {:style {"--ty-button-bg" "#ff6600"
                     "--ty-button-color" "white"}}]

;; ✅ Keyword keys (Clojure accepts the leading -- in keywords)
[:ty-button {:style {:--ty-button-bg "#ff6600"
                     :--ty-button-color "white"}}]
```

---

## Component Usage

### Basic View Structure

```clojure
(ns my-app.views.user-profile
  (:require [tyrell.router :as router]))

(defn view []
  (when (router/rendered? ::user-profile)
    [:div.ty-content.p-6
     [:div.ty-elevated.rounded-lg.p-6
      [:h2.ty-text++.text-2xl.mb-4 "User Profile"]
      ;; component content
      ]]))
```

### Tyrell Web Components in Hiccup

```clojure
;; Input with label and error
[:ty-input
 {:type "email"
  :label "Email"
  :placeholder "you@example.com"
  :required true
  :value current-email
  :error (when (touched :email) (errors :email))
  :on {:change (fn [^js e] (on-email-change (-> e .-detail .-value)))}}]

;; Select (single)
[:ty-select
 {:label "Country"
  :placeholder "Select..."
  :value selected-country
  :on {:change (fn [^js e] (on-country-change (-> e .-detail .-value)))}}
 [:ty-option {:value "us"} "United States"]
 [:ty-option {:value "de"} "Germany"]]

;; Multi-select (ty-select with :multiple — children are
;; ty-option, chips render via ty-selected-tags)
[:ty-select
 {:multiple true
  :id "skills"
  :label "Skills"
  :placeholder "Add skills"
  :value (vec selected-skills)
  :on {:change (fn [^js e] (on-skills-change (vec (-> e .-detail .-values))))}}
 [:ty-option {:value "clojure" :flavor "primary"} "Clojure"]
 [:ty-option {:value "javascript" :flavor "warning"} "JavaScript"]]
[:ty-selected-tags {:for "skills"}]

;; Checkbox
[:ty-checkbox
 {:checked agreed?
  :flavor "primary"
  :on {:change (fn [^js e] (on-agree-change (-> e .-detail .-checked)))}}
 "I agree to terms"]

;; Textarea
[:ty-textarea
 {:label "Notes"
  :placeholder "Write something..."
  :rows "4"
  :value notes-value
  :on {:change (fn [^js e] (on-notes-change (-> e .-detail .-value)))}}]

;; Button with start icon
[:ty-button {:flavor "primary" :type "submit"}
 [:ty-icon {:slot "start" :name "save" :size "sm"}]
 "Save"]

;; Button with end icon
[:ty-button {:flavor "neutral"}
 "Next"
 [:ty-icon {:slot "end" :name "chevron-right" :size "sm"}]]

;; Icon-only button
[:ty-button {:flavor "secondary" :size "sm"}
 [:ty-icon {:name "settings" :size "sm"}]]

;; Input with icon slots
[:ty-input {:type "currency" :currency "EUR" :label "Price"}
 [:ty-icon {:slot "start" :name "euro"}]]

[:ty-input {:type "email" :label "Email"}
 [:ty-icon {:slot "start" :name "mail" :size "sm"}]
 [:ty-icon {:slot "end" :name "check" :size "sm"}]]

;; Tag with icon
[:ty-tag {:flavor "primary" :dismissible true
          :on {:dismiss (fn [^js e] (on-tag-dismiss (-> e .-detail .-value)))}}
 [:ty-icon {:slot "start" :name "star" :size "sm"}]
 "Featured"]

;; Modal
[:ty-modal {:open show-modal?
            :on {:close (fn [^js e] (on-modal-close))}}
 [:div.ty-elevated.p-6.rounded-lg
  [:h3.ty-text++.text-lg "Confirm"]
  [:p.ty-text "Are you sure?"]
  [:div.flex.gap-2.mt-4
   [:ty-button {:flavor "danger"} "Delete"]
   [:ty-button {:flavor "neutral"} "Cancel"]]]]

;; Calendar
[:ty-calendar
 {:value selected-date
  :on {:change (fn [^js e] (on-date-change (-> e .-detail .-value)))}}]

;; Date picker
[:ty-date-picker
 {:label "Start Date"
  :value selected-date
  :on {:change (fn [^js e] (on-date-change (-> e .-detail .-value)))}}]

;; Wizard
[:ty-wizard {:width "100%" :height "400px"
             :active wizard-step
             :completed (clojure.string/join "," completed-steps)}
 [:ty-step {:id "info" :label "Information"} "Step 1"]
 [:ty-step {:id "review" :label "Review"} "Step 2"]]

;; Tooltip
[:ty-button {:flavor "primary"}
 "Hover me"
 [:ty-tooltip "This is helpful info"]]

;; Scroll container
[:ty-scroll-container {:max-height "400px"}
 (for [item items]
   ^{:key (:id item)}
   [:div.p-3.ty-elevated.rounded-lg (:name item)])]

;; Copy
[:ty-copy {:value "npm install tyrell-components" :format "code"}]
```

---

## Event Handling

### Replicant `:on` Syntax

Event handlers are attached via the `:on` map. Keys are event type keywords, values are handler functions:

```clojure
[:ty-input {:on {:change handler-fn}}]          ; single event
[:ty-input {:on {:input on-input                 ; multiple events
                 :change on-change
                 :focus on-focus}}]
```

### Type Hint with `^js`

Tyrell events are JavaScript `CustomEvent` objects. **Always type hint the event parameter with `^js`** so the ClojureScript compiler doesn't munge property access:

```clojure
;; CORRECT — ^js ensures .-detail and .-value are not munged
(fn [^js e]
  (let [^js detail (.-detail e)
        value (.-value detail)]
    (do-something value)))

;; WRONG — without ^js, advanced compilation may break property access
(fn [e]
  (let [value (-> e .-detail .-value)]  ; may break in :advanced
    (do-something value)))
```

### What Tyrell Components Emit

Every Tyrell component emits standard DOM `CustomEvent`s. The payload is always in `event.detail`:

| Component | Event | `event.detail` fields |
|-----------|-------|-----------------------|
| `ty-input` | `input` (every keystroke) | `value`, `formattedValue`, `rawValue`, `originalEvent` |
| `ty-input` | `change` (on blur) | `value`, `formattedValue`, `rawValue`, `originalEvent` |
| `ty-textarea` | `input` (every keystroke) | `value`, `originalEvent` |
| `ty-textarea` | `change` (on blur) | `value`, `originalEvent` |
| `ty-checkbox` | `change` | `value`, `checked`, `formValue`, `originalEvent` |
| `ty-select` | `change` | `value` (scalar, or array when `multiple`), `values` (JS array), `items`, `action` (`"add"`/`"remove"`/`"clear"`/`"set"`), `item` |
| `ty-select` | `search` | `query`, `element` |
| `ty-file-upload` | `change` | `value` (File[]), `files` (File[]), `names` (string[]) |
| `ty-calendar` | `change` | `year`, `month`, `day`, `action`, `source`, `dayContext` |
| `ty-calendar` | `navigate` | `month`, `year`, `action`, `source` |
| `ty-date-picker` | `change` | `value` (ISO string) |
| `ty-tabs` | `ty-tab-change` | `activeId`, `activeIndex`, `previousId`, `previousIndex` |
| `ty-wizard` | `ty-wizard-step-change` | `activeId`, `activeIndex`, `previousId`, `previousIndex`, `direction` |
| `ty-modal` | `close` | `reason`, `returnValue` |
| `ty-tag` | `click` | `value` |
| `ty-tag` | `dismiss` | `value` |
| `ty-button` | `click` | `originalEvent` |
| `ty-copy` | `copy` | `value` |

### Reading Event Detail Per Component

```clojure
;; ty-input — value is the parsed value, rawValue is the string
[:ty-input
 {:label "Price" :type "currency" :currency "EUR"
  :on {:change (fn [^js e]
                 (let [^js detail (.-detail e)]
                   ;; (.-value detail)          => 1234.56
                   ;; (.-formattedValue detail) => "€1.234,56"
                   ;; (.-rawValue detail)       => "1234.56"
                   (on-price-change (.-value detail))))}}]

;; ty-textarea — same pattern as ty-input but without formatted values
[:ty-textarea
 {:label "Bio" :rows "4"
  :on {:change (fn [^js e]
                 (on-bio-change (-> e .-detail .-value)))}}]

;; ty-select — detail.value is the scalar selected value (single select)
[:ty-select
 {:label "Country"
  :on {:change (fn [^js e]
                 (let [^js detail (.-detail e)]
                   ;; (.-value detail) => "us"
                   ;; (.-text detail)  => "United States"
                   (on-country-change (.-value detail))))}}
 [:ty-option {:value "us"} "United States"]
 [:ty-option {:value "de"} "Germany"]]

;; ty-select multiple — values is a JS array, convert with vec
[:ty-select
 {:multiple true
  :label "Tags"
  :on {:change (fn [^js e]
                 (let [^js detail (.-detail e)
                       values (vec (.-values detail))   ; JS array -> CLJ vector
                       action (.-action detail)]        ; "add", "remove", "clear", "set"
                   (on-tags-change values)))}}
 [:ty-tag {:value "a"} "Alpha"]
 [:ty-tag {:value "b"} "Beta"]]

;; ty-checkbox — checked is boolean
[:ty-checkbox
 {:flavor "primary"
  :on {:change (fn [^js e]
                 (let [^js detail (.-detail e)]
                   ;; (.-checked detail) => true/false
                   ;; (.-value detail)   => "on" (or custom value attr)
                   (on-agree-change (.-checked detail))))}}
 "I agree"]

;; ty-tabs — activeId is the tab id string
[:ty-tabs
 {:width "100%" :height "500px"
  ;; ty-tabs dispatches `ty-tab-change` (not `change`).
  :on {:ty-tab-change (fn [^js e]
                        (let [^js detail (.-detail e)]
                          ;; (.-activeId detail)    => "settings"
                          ;; (.-previousId detail)  => "profile"
                          (on-tab-change (.-activeId detail))))}}
 [:ty-tab {:id "profile" :label "Profile"} "..."]
 [:ty-tab {:id "settings" :label "Settings"} "..."]]

;; ty-calendar — date fields are numbers
[:ty-calendar
 {:on {:change (fn [^js e]
                 (let [^js detail (.-detail e)]
                   ;; (.-year detail)   => 2026
                   ;; (.-month detail)  => 3
                   ;; (.-day detail)    => 25
                   ;; (.-action detail) => "select" or "deselect"
                   (on-date-select (.-year detail)
                                   (.-month detail)
                                   (.-day detail))))}}]

;; ty-modal — reason tells you how it was closed
[:ty-modal
 {:open show?
  :on {:close (fn [^js e]
                (let [^js detail (.-detail e)]
                  ;; (.-reason detail) => "backdrop", "escape", "method"
                  (on-modal-close)))}}
 [:div.p-6 "Modal content"]]
```

---

## Icon Usage

### Icon Registration

```clojure
(ns my-app.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.fav6.brands :as fav6-brands]))

(icons/register!
  {:home           lucide/home
   :user           lucide/user
   :calendar       lucide/calendar
   :save           lucide/save
   :check          lucide/check
   :alert-circle   lucide/alert-circle
   :github         fav6-brands/github})

;; Or use register-async! if icons.cljs loads before tyrell.js
(icons/register-async!
  {:check lucide/check
   :home  lucide/home}
  {:on-success #(println "Icons registered!")
   :max-retries 10
   :delay-ms 50})
```

### Icon Usage in Components

```clojure
[:ty-icon {:name "user"}]
[:ty-icon {:name "home" :size "sm"}]   ; xs, sm, md, lg, xl
[:ty-icon.ty-text-primary {:name "star"}]

;; Icon in button — use slot, not gap/margin
[:ty-button {:flavor "primary"}
 [:ty-icon {:slot "start" :name "save" :size "sm"}]
 "Save"]

;; Icon-only button
[:ty-button {:flavor "secondary" :size "sm"}
 [:ty-icon {:name "settings" :size "sm"}]]
```

### Available Icon Sets

- **Lucide**: Modern, clean icons (primary choice)
- **Heroicons**: Solid and outline variants
- **Material**: Material Design icons
- **Fav6 Brands**: Brand logos (GitHub, React, etc.)

---

## Form Handling

### Form Structure

Use standard `[:form]` with `:on {:submit ...}` and Tyrell components inside. Each Tyrell form component supports `name`, `label`, `error`, `required`, and `disabled` attributes:

```clojure
[:form.space-y-6
 {:on {:submit (fn [^js e]
                 (.preventDefault e)
                 (on-submit))}}

 [:ty-input
  {:type "text"
   :name "fullName"
   :label "Full Name"
   :placeholder "John Doe"
   :required true
   :value name-value
   :error name-error
   :on {:change (fn [^js e] (on-name-change (-> e .-detail .-value)))}}]

 [:ty-input
  {:type "email"
   :name "email"
   :label "Email Address"
   :required true
   :value email-value
   :error email-error
   :on {:change (fn [^js e] (on-email-change (-> e .-detail .-value)))}}]

 [:div.flex.gap-3
  [:ty-button {:flavor "primary" :type "submit" :disabled submitting?}
   [:ty-icon {:slot "start" :name "save" :size "sm"}]
   "Submit"]

  [:ty-button {:flavor "neutral" :type "button"
               :on {:click on-cancel}}
   "Cancel"]]]
```

Key points:
- `ty-button` with `:type "submit"` triggers form submit
- `ty-button` with `:type "button"` does **not** trigger form submit
- `:error` attribute shows built-in error message styling — pass `nil` to hide
- `:required` adds a visual indicator and form validation

### Select with Rich Content

Single select clones the selected option into the field, so rich HTML displays intact.

```clojure
[:ty-select
 {:label "Select Country"
  :placeholder "Choose a country"
  :value selected-country
  :on {:change (fn [^js e] (on-country-change (-> e .-detail .-value)))}}

 [:ty-option {:value "us"}
  [:div.flex.items-center.gap-2
   [:div
    [:div.font-medium "United States"]
    [:div.text-xs.ty-text- "North America"]]]]

 [:ty-option {:value "uk"}
  [:div.flex.items-center.gap-2
   [:div
    [:div.font-medium "United Kingdom"]
    [:div.text-xs.ty-text- "Europe"]]]]]
```

### Multi-select with Chips

`ty-select multiple` + `ty-selected-tags` — options are `ty-option` children,
dismissible chips render out-of-band wherever you put them:

```clojure
[:ty-select
 {:multiple true
  :id "skills-select"
  :label "Select Skills"
  :placeholder "Add skills"
  :value (vec selected-skills)
  :on {:change (fn [^js e] (on-skills-change (vec (-> e .-detail .-values))))}}

 [:ty-option {:value "clojure" :flavor "primary"} "Clojure"]
 [:ty-option {:value "javascript" :flavor "warning"} "JavaScript"]
 [:ty-option {:value "react" :flavor "secondary"} "React"]]

[:div.flex.flex-wrap.gap-2
 [:ty-selected-tags {:for "skills-select"}]]
```

---

## Tabs Component

### Basic Structure

```clojure
[:ty-tabs
 {:width "100%"
  :height "600px"
  :active "general"}

 [:ty-tab {:id "general" :label "General"}
  [:div.p-6 "General content"]]

 [:ty-tab {:id "advanced" :label "Advanced"}
  [:div.p-6 "Advanced content"]]]
```

### Rich Labels with Icons

```clojure
[:ty-tabs {:width "800px" :height "500px"}

 [:span {:slot "label-profile" :class "flex items-center gap-2"}
  [:ty-icon {:name "user" :size "sm"}]
  "Profile"]

 [:span {:slot "label-notifications" :class "flex items-center gap-2"}
  [:ty-icon {:name "bell" :size "sm"}]
  "Notifications"
  [:span.ty-bg-danger.ty-text-danger++.px-2.py-0.5.rounded-full.text-xs.font-bold "5"]]

 [:ty-tab {:id "profile"}
  [:div.p-6 "Profile content"]]

 [:ty-tab {:id "notifications"}
  [:div.p-6 "Notifications content"]]]
```

### Custom Marker

```clojure
;; Pill-style marker
[:ty-tabs {:width "100%" :height "400px"}
 [:div.ty-bg-primary.rounded-full.shadow-sm {:slot "marker"}]
 [:ty-tab {:id "tab1" :label "Home"}
  [:div.p-6 "Content"]]]
```

### CSS Variables

```clojure
[:ty-tabs
 {:width "100%"
  :height "500px"
  :style {:--ty-tabs-bg "var(--ty-surface-elevated)"
          :--ty-tabs-border-width "0"
          :--ty-tabs-button-padding "8px 16px"
          :--ty-tabs-button-gap "12px"
          :--ty-tabs-button-hover-bg "var(--ty-surface-elevated)"
          :--transition-duration "200ms"}}
 ...]
```

### Attributes Reference

**ty-tabs:**
- `width` (required) - Content area width (px or %)
- `height` (required) - Total container height (px)
- `active` - ID of initially active tab (defaults to first)
- `placement` - Tab button position: "top" or "bottom" (default: "top")

**ty-tab:**
- `id` (required) - Unique tab identifier
- `label` - Simple text label
- `disabled` - Disable tab interaction (boolean)

**Events:**
- `change` - Fires when active tab changes
  - Detail: `{activeId, activeIndex, previousId, previousIndex}`
