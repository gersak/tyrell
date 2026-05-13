# dev.gersak/tyrell

**Framework-agnostic web components for ClojureScript applications.**

Tyrell provides a complete set of UI components that work seamlessly with Reagent, UIx, Replicant, or any ClojureScript framework. Load via CDN and use as custom HTML elements.

## Installation

```clojure
;; deps.edn - for router, i18n, layout infrastructure
{:deps {dev.gersak/tyrell {:mvn/version "LATEST"}}}
```

```html
<!-- Load components via CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>
```

## Components

### ty-button

Semantic buttons with multiple flavors and styles.

```html
<ty-button flavor="primary">Primary Action</ty-button>
<ty-button flavor="danger" appearance="outlined">Delete</ty-button>
<ty-button flavor="success" pill>
  <ty-icon name="check" slot="start"></ty-icon>
  Confirm
</ty-button>
```

**Attributes:** `flavor` (primary|secondary|success|danger|warning|neutral, with optional `+`/`-` suffix), `appearance` (solid|outlined|ghost), `size` (xs|sm|md|lg|xl), `disabled`, `pill`, `action`, `wide`

---

### ty-input

Enhanced input with labels, icons, validation, and numeric formatting.

```html
<ty-input label="Email" type="email" placeholder="you@example.com" required></ty-input>

<ty-input label="Search" placeholder="Search...">
  <ty-icon name="search" slot="start"></ty-icon>
</ty-input>

<ty-input label="Price" type="number" format="currency" currency="EUR" value="1234.50"></ty-input>

<ty-input label="Live Search" delay="500" placeholder="Debounced input..."></ty-input>
```

**Attributes:** `label`, `type`, `placeholder`, `value`, `required`, `disabled`, `error`, `format` (currency|percent|compact), `currency`, `delay` (debounce ms), `locale`

---

### ty-textarea

Multi-line text input with auto-resize and character limits.

```html
<ty-textarea label="Description" placeholder="Enter description..." rows="4"></ty-textarea>

<ty-textarea label="Bio" maxlength="500" show-count></ty-textarea>
```

**Attributes:** `label`, `placeholder`, `value`, `rows`, `maxlength`, `show-count`, `required`, `disabled`, `error`

---

### ty-checkbox

Styled checkbox with label and indeterminate state.

```html
<ty-checkbox label="I agree to the terms" name="terms" required></ty-checkbox>

<ty-checkbox label="Select all" indeterminate></ty-checkbox>
```

**Attributes:** `label`, `checked`, `indeterminate`, `disabled`, `required`, `name`, `value`

---

### ty-dropdown

Smart select with search, keyboard navigation, and mobile-optimized modal.

```html
<ty-dropdown label="Country" placeholder="Select country" required>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="de">Germany</option>
</ty-dropdown>

<ty-dropdown label="User" searchable placeholder="Search users...">
  <ty-option value="1">
    <div class="flex items-center gap-2">
      <img src="avatar.jpg" class="w-6 h-6 rounded-full">
      <span>John Doe</span>
    </div>
  </ty-option>
</ty-dropdown>
```

**Attributes:** `label`, `placeholder`, `value`, `external-search`, `required`, `disabled`, `name`

---

### ty-multiselect

Multiple selection with tags and search.

```html
<ty-multiselect label="Skills" placeholder="Add skills...">
  <ty-tag value="clojure">Clojure</ty-tag>
  <ty-tag value="javascript">JavaScript</ty-tag>
  <ty-tag value="rust">Rust</ty-tag>
</ty-multiselect>
```

**Attributes:** `label`, `placeholder`, `value` (comma-separated), `external-search`, `required`, `disabled`, `name`

---

### ty-calendar

Full calendar with date selection and form integration.

```html
<ty-calendar year="2025" month="6" day="15"></ty-calendar>

<form>
  <ty-calendar name="booking-date" locale="de-DE"></ty-calendar>
  <ty-button type="submit">Book</ty-button>
</form>
```

**Attributes:** `year`, `month`, `day`, `value` (timestamp), `locale`, `name`, `min-date`, `max-date`

---

### ty-date-picker

Dropdown calendar picker for date selection.

```html
<ty-date-picker label="Start Date" placeholder="Select date..." name="start"></ty-date-picker>

<ty-date-picker label="Birthday" value="1990-05-15" locale="hr-HR"></ty-date-picker>
```

**Attributes:** `label`, `placeholder`, `value`, `locale`, `name`, `required`, `disabled`, `min-date`, `max-date`

---

### ty-tabs

Carousel-based tabs with smooth animations.

```html
<ty-tabs width="100%" height="400px" active="general">
  <ty-tab id="general" label="General">
    <div class="p-4">General settings content...</div>
  </ty-tab>
  <ty-tab id="advanced" label="Advanced">
    <div class="p-4">Advanced settings content...</div>
  </ty-tab>
</ty-tabs>

<!-- With icons in labels -->
<ty-tabs active="profile">
  <span slot="label-profile" class="flex items-center gap-2">
    <ty-icon name="user" size="sm"></ty-icon>
    Profile
  </span>
  <ty-tab id="profile">...</ty-tab>
</ty-tabs>
```

**Attributes:** `active`, `width`, `height`, `placement` (top|bottom)

---

### ty-wizard

Step-by-step wizard with progress tracking.

```html
<ty-wizard width="100%" height="500px" active="welcome" completed="welcome">
  <ty-step id="welcome" label="Welcome">
    <div class="p-6">
      <h2>Welcome!</h2>
      <ty-button onclick="this.closest('ty-wizard').active = 'details'">
        Next
      </ty-button>
    </div>
  </ty-step>
  <ty-step id="details" label="Details">
    <div class="p-6">Form fields here...</div>
  </ty-step>
  <ty-step id="confirm" label="Confirm">
    <div class="p-6">Review and submit...</div>
  </ty-step>
</ty-wizard>
```

**Attributes:** `active`, `completed` (comma-separated step ids), `width`, `height`

---

### ty-modal

Native dialog wrapper with backdrop and focus management.

```html
<ty-modal id="confirm-modal">
  <div class="ty-elevated p-6 rounded-lg max-w-md">
    <h3 class="text-lg font-bold mb-4">Confirm Action</h3>
    <p class="ty-text- mb-4">Are you sure you want to proceed?</p>
    <div class="flex gap-2 justify-end">
      <ty-button onclick="this.closest('ty-modal').hide()">Cancel</ty-button>
      <ty-button flavor="primary" onclick="confirmAction()">Confirm</ty-button>
    </div>
  </div>
</ty-modal>

<ty-button onclick="document.getElementById('confirm-modal').show()">
  Open Modal
</ty-button>
```

**Attributes:** `open`, `backdrop`, `close-on-outside-click`, `close-on-escape`, `protected`

---

### ty-popup

Interactive popup anchored to parent element.

```html
<ty-button>
  Options
  <ty-popup placement="bottom-start" offset="4">
    <div class="ty-elevated p-2 rounded-lg min-w-48">
      <div class="px-3 py-2 hover:ty-bg-neutral- rounded cursor-pointer">Edit</div>
      <div class="px-3 py-2 hover:ty-bg-neutral- rounded cursor-pointer">Duplicate</div>
      <div class="px-3 py-2 hover:ty-bg-danger- ty-text-danger rounded cursor-pointer">Delete</div>
    </div>
  </ty-popup>
</ty-button>
```

**Attributes:** `placement`, `offset`, `manual`, `disable-close`

---

### ty-tooltip

Hover tooltips with smart positioning.

```html
<ty-button>
  Hover me
  <ty-tooltip placement="top">Helpful information</ty-tooltip>
</ty-button>

<ty-icon name="info">
  <ty-tooltip flavor="primary" delay="300">
    This field is required for processing.
  </ty-tooltip>
</ty-icon>
```

**Attributes:** `placement`, `offset`, `delay`, `disabled`, `flavor`

---

### ty-icon

SVG icon rendering with Lucide icons.

```html
<ty-icon name="check" size="sm"></ty-icon>
<ty-icon name="alert-triangle" size="md" class="ty-text-warning"></ty-icon>
<ty-icon name="heart" size="lg" class="ty-text-danger"></ty-icon>
```

**Attributes:** `name`, `size` (xs|sm|md|lg|xl)

---

### ty-tag

Removable tags for selections and labels.

```html
<ty-tag>Default</ty-tag>
<ty-tag flavor="primary" removable>Clojure</ty-tag>
<ty-tag flavor="success">Active</ty-tag>
```

**Attributes:** `flavor`, `removable`, `disabled`

---

### ty-copy

Click-to-copy with visual feedback.

```html
<ty-copy value="npm install tyrell-components">
  <code>npm install tyrell-components</code>
</ty-copy>
```

**Attributes:** `value`

---

### ty-scroll-container

Scrollable container with fade indicators.

```html
<ty-scroll-container height="300px">
  <div class="p-4">
    <!-- Long scrollable content -->
  </div>
</ty-scroll-container>
```

**Attributes:** `height`, `fade-size`

---

### ty-resize-observer

Observe element size changes.

```html
<ty-resize-observer onresize="handleResize(event.detail)">
  <div class="resizable-content">...</div>
</ty-resize-observer>
```

---

## ClojureScript Infrastructure

### Router

Tree-based routing with authorization and path parameters.

```clojure
(ns app.core
  (:require [tyrell.router :as router]))

(def routes
  [:root
   [:home]
   [:users
    [:user {:path-params [:id]}]]
   [:admin {:auth :admin}
    [:dashboard]]])

(router/init! routes)

;; Navigate
(router/navigate! [:user {:id "123"}])

;; Current route
@router/*route*  ;; => {:path [:user] :params {:id "123"}}
```

### i18n

Protocol-based translations with Intl API.

```clojure
(ns app.i18n
  (:require [tyrell.i18n :as i18n]))

(i18n/t :welcome)
(i18n/format-number 1234.56 {:style "currency" :currency "EUR"})
(i18n/format-date (js/Date.) {:dateStyle "long"})
```

### Layout

Container-query responsive layouts.

```clojure
(ns app.layout
  (:require [tyrell.layout :as layout]))

(layout/container {:breakpoints {:sm 640 :md 768 :lg 1024}}
  (fn [{:keys [width breakpoint]}]
    [:div {:class (if (= breakpoint :sm) "flex-col" "flex-row")}
     ...]))
```

---

## Usage with ClojureScript Frameworks

### Reagent

```clojure
(defn date-picker []
  (let [selected (r/atom nil)]
    (fn []
      [:div
       [:ty-date-picker
        {:label "Select Date"
         :value @selected
         :on-change #(reset! selected (.. % -detail -value))}]
       [:p "Selected: " @selected]])))
```

### UIx

```clojure
(defui date-picker []
  (let [[selected set-selected] (uix/use-state nil)]
    [:div
     [:ty-date-picker
      {:label "Select Date"
       :value selected
       :on-change #(set-selected (.. % -detail -value))}]
     [:p "Selected: " selected]]))
```

### Replicant

```clojure
(defn date-picker [store]
  [:div
   [:ty-date-picker
    {:label "Select Date"
     :value (:selected-date @store)
     :on {:change #(swap! store assoc :selected-date (.. % -detail -value))}}]
   [:p "Selected: " (:selected-date @store)]])
```

---

## Build Your Own Components

Use `tyrell.shim` to create custom Web Components from ClojureScript with any rendering library.

```clojure
(ns app.components
  (:require [replicant.dom :as d]
            [tyrell.shim :as shim]))

(defn render! [^js el]
  (d/render (shim/ensure-shadow el)
    [:div.ty-elevated.p-4
     [:h2.ty-text+ "Hello, " (or (shim/attr el "name") "World") "!"]]))

(shim/define! "my-greeting"
  {:observed [:name]
   :connected render!
   :attr (fn [el _] (render! el))})
```

**[Component Building Guide →](COMPONENT_GUIDE.md)** | **[Code Splitting Guide →](CODE_SPLITTING.md)**

---

## Resources

- [Documentation](https://gersak.github.io/tyrell)
- [GitHub](https://github.com/gersak/tyrell)
- [NPM Package](https://www.npmjs.com/package/tyrell-components)

## License

MIT
