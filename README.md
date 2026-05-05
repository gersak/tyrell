<blockquote style="color: #414863">
<p><em>"After playing around with Replicant, I realized I could build Web Components without React — actually, even without Replicant.</em></p>

<p><em>I'm wondering if it's called 'Replicant' because of <strong>Blade Runner</strong> (I love Blade Runner).</em></p>

<p><em>Maybe I could name my own library something similar... Tyrell? No, that feels pretentious.</em></p>

<p><em>Anyway, I don't really want to type something long like <code>tyrell-button</code>. It should be shorter — maybe <code>ty-button</code>.</em></p>

<p><strong><em>Yes! Let's call it ty."</em></strong></p>
</blockquote>

<blockquote style="color: #414863">
<p><em>Nine months later…</em></p>

<p><em>"Nine months in, <strong>ty</strong> still reads as <strong>'thank you'</strong> — Just had to cut that and call it properly."</em></p>

<p><em>"The library is <strong>Tyrell</strong>. CLJS namespaces are <code>tyrell.*</code> now (<code>tyrell.router</code>, <code>tyrell.components</code>, <code>tyrell.lucide</code>). Component tags stay <code>ty-*</code> — web custom elements need the dash anyway, and two letters earn their keep. CSS classes stay <code>ty-*</code> for the same reason. The prefix earned the shortcut; the brand didn't."</em></p>

<p><strong><em>"No thanks involved. Just replicants."</em></strong></p>
</blockquote>

# Tyrell

[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/tyrell-components/badge)](https://www.jsdelivr.com/package/npm/tyrell-components)
[![NPM Version](https://img.shields.io/npm/v/tyrell-components.svg)](https://www.npmjs.com/package/tyrell-components)
[![Clojars Project](https://img.shields.io/clojars/v/dev.gersak/tyrell.svg)](https://clojars.org/dev.gersak/tyrell)

**More framework than framework.** Tyrell ships Web Components that work everywhere — React, Vue, HTMX, vanilla JS, ClojureScript.

**[Live Demo & Docs →](https://gersak.github.io/tyrell)**

| [Vanilla JS Guide](packages/core/src/README.md) | [React Guide](packages/react/README.md) |
|---|---|

## Why Tyrell?

Tyrell is a **framework-agnostic evolution of [Toddler](https://github.com/gersak/toddler)**, a ClojureScript UI library built on Helix (React).

Toddler provided great components (calendar, dropdown, routing, icons) but was locked to React/Helix. Tyrell takes that component library and rebuilds it with **Web Components**, making the same functionality available everywhere — React, Vue, HTMX, vanilla JS, and all ClojureScript frameworks (Replicant, UIx, Reagent).

Same components. Zero framework lock-in.

---

## Load from CDN

Always loads the latest version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components/css/tyrell.css">
<script src="https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js"></script>
```

Pin to a specific version (recommended for production):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-RC6/css/tyrell.css">
<script src="https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-RC6/dist/tyrell.js"></script>
```

Browse all available versions on [NPM](https://www.npmjs.com/package/tyrell-components?activeTab=versions) or [jsdelivr](https://www.jsdelivr.com/package/npm/tyrell-components).

Then use components anywhere:

```html
<ty-button flavor="primary">Click me</ty-button>
<ty-dropdown label="Country" placeholder="Select...">
  <option value="us">United States</option>
  <option value="de">Germany</option>
</ty-dropdown>
```

---

## ClojureScript

Add to `deps.edn`:

```clojure
{:deps {dev.gersak/tyrell {:mvn/version "1.0.0-RC6"}        ;; Router, i18n, layout
        dev.gersak/tyrell-icons {:mvn/version "1.0.0-RC6"}}} ;; Tree-shakeable icons
```

### UIx

```clojure
(ns app.core
  (:require [uix.core :refer [defui $]]
            [tyrell.lucide :as lucide]))

;; Register only icons you use - Closure Compiler removes the rest
(defonce _ (js/window.tyIcons.register
             #js {:check lucide/check
                  :calendar lucide/calendar
                  :globe lucide/globe}))

(defui app []
  (let [[selected set-selected] (uix.core/use-state nil)]
    ($ :div.ty-canvas.min-h-screen.p-8
      ($ :div.ty-elevated.p-6.rounded-lg.max-w-md.space-y-4

        ($ :h1.ty-text++.text-2xl.font-bold "Book a Demo")

        ($ :ty-date-picker
          {:label "Select Date"
           :placeholder "Pick a date..."
           :value selected
           :on-change #(set-selected (.. % -detail -value))})

        ($ :ty-dropdown
          {:label "Timezone"
           :placeholder "Select timezone..."}
          ($ :option {:value "utc"} "UTC")
          ($ :option {:value "cet"} "Central European")
          ($ :option {:value "pst"} "Pacific Standard"))

        ($ :ty-button
          {:flavor "primary"
           :disabled (nil? selected)}
          ($ :ty-icon {:name "check" :slot "start"})
          "Confirm Booking")))))
```

### Replicant

```clojure
(ns app.core
  (:require [replicant.dom :as d]
            [tyrell.lucide :as lucide]))

(defonce _ (js/window.tyIcons.register
             #js {:user lucide/user
                  :mail lucide/mail
                  :send lucide/send}))

(defn contact-form [state]
  [:div.ty-canvas.min-h-screen.p-8
   [:div.ty-elevated.p-6.rounded-lg.max-w-md.space-y-4

    [:h1.ty-text++.text-2xl.font-bold "Contact Us"]

    [:ty-input
     {:label "Name"
      :placeholder "Your name"
      :value (:name @state)
      :on {:input #(swap! state assoc :name (.. % -target -value))}}
     [:ty-icon {:name "user" :slot "start"}]]

    [:ty-input
     {:label "Email"
      :type "email"
      :placeholder "you@example.com"
      :value (:email @state)
      :on {:input #(swap! state assoc :email (.. % -target -value))}}
     [:ty-icon {:name "mail" :slot "start"}]]

    [:ty-textarea
     {:label "Message"
      :placeholder "How can we help?"
      :rows 4
      :value (:message @state)
      :on {:input #(swap! state assoc :message (.. % -target -value))}}]

    [:ty-button
     {:flavor "primary"
      :on {:click #(js/alert "Sent!")}}
     [:ty-icon {:name "send" :slot "start"}]
     "Send Message"]]])

(defonce state (atom {:name "" :email "" :message ""}))

(d/render (js/document.getElementById "app")
  (contact-form state))
```

### Router

Component-based routing with segments and authorization:

```clojure
(ns app.routes
  (:require [tyrell.router :as router]))

;; Initialize router with base path
(router/init! "")  ;; or "my-app" for /my-app/... URLs

;; Define routes by linking to parent
(router/link ::router/root
  [{:id :app/home
    :segment "home"
    :landing 100}  ;; Landing priority (highest wins)
   {:id :app/users
    :segment "users"}
   {:id :app/admin
    :segment "admin"
    :roles #{:admin}}])  ;; Authorization

;; Nested routes
(router/link :app/users
  [{:id :app/user-detail
    :segment "detail"}])  ;; /users/detail

;; Navigate
(router/navigate! :app/home)
(router/navigate! :app/user-detail {:tab "profile"})  ;; with query params

;; Check if route is active
(router/rendered? :app/users)        ;; true if on /users or /users/detail
(router/rendered? :app/users true)   ;; true only if exactly on /users

;; Query params
(router/query-params)     ;; => {:tab "profile"}
(router/set-query! {:page 2})
```

### i18n

Protocol-based formatting with Intl API:

```clojure
(ns app.i18n
  (:require [tyrell.i18n :as i18n]
            [tyrell.i18n.number :as num]
            [tyrell.i18n.time :as time]))

;; Current locale (auto-detected from browser)
i18n/*locale*  ;; => :en_US

;; Number formatting
(num/format-number 1234567.89)                    ;; "1,234,567.89"
(num/format-currency 99.99 "EUR")                 ;; "€99.99"
(num/format-percent 0.156)                        ;; "16%"
(num/format-compact 1500000)                      ;; "1.5M"

;; Date formatting
(time/format-date (js/Date.))                     ;; "2/19/2026"
(time/format-date-full (js/Date.))                ;; "Wednesday, February 19, 2026"
(time/format-relative -3 "day")                   ;; "3 days ago"

;; With explicit locale
(num/format-currency 1234.50 "EUR" :de_DE)        ;; "1.234,50 €"
(time/format-date-full (js/Date.) :hr)            ;; "srijeda, 19. veljače 2026."

;; Protocol-based translation (i18n/t)
;; Numbers are extended to support direct translation
(i18n/t 1234.56)                                  ;; "1,234.56" (current locale)
(i18n/t 1234.56 "EUR")                            ;; "€1,234.56" (as currency)
(i18n/t 1234.56 :de_DE)                           ;; "1.234,56" (German locale)
(i18n/t 1234.56 :de_DE {:style "currency" :currency "EUR"})  ;; "1.234,56 €"
```

### Build Your Own Components

Use `tyrell.shim` to turn any ClojureScript render function into a Web Component:

```clojure
(ns app.components
  (:require [replicant.dom :as d]
            [tyrell.shim :as shim]))

(defn greeting [name]
  [:div.ty-elevated.p-4.rounded-lg
   [:h2.ty-text+ "Hello, " name "!"]
   [:ty-button {:flavor "primary"} "Wave"]])

(defn render! [^js el]
  (d/render (shim/ensure-shadow el)
    (greeting (or (shim/attr el "name") "World"))))

(shim/define! "my-greeting"
  {:observed [:name]
   :connected render!
   :attr (fn [el _] (render! el))})
```

```html
<my-greeting name="Clojure"></my-greeting>
```

**[Component Building Guide →](packages/cljs/COMPONENT_GUIDE.md)** | **[Code Splitting →](packages/cljs/CODE_SPLITTING.md)**

---

## Components

| Component | Description |
|-----------|-------------|
| `ty-button` | Semantic buttons with flavors, sizes, and icon slots |
| `ty-input` | Text input with labels, validation, numeric formatting, debounce |
| `ty-textarea` | Multi-line text with auto-resize and character count |
| `ty-checkbox` | Styled checkbox with indeterminate state |
| `ty-dropdown` | Searchable select with keyboard nav and mobile modal |
| `ty-multiselect` | Multi-select with tags and search |
| `ty-calendar` | Full calendar with date selection and form integration |
| `ty-date-picker` | Calendar dropdown for date input |
| `ty-tabs` / `ty-tab` | Carousel tabs with smooth animations |
| `ty-wizard` / `ty-step` | Step-by-step wizard with progress tracking |
| `ty-modal` | Native dialog with backdrop and focus management |
| `ty-popup` | Anchored popover with smart positioning |
| `ty-tooltip` | Hover tooltips with placement options |
| `ty-icon` | SVG icons from Lucide, Heroicons, Material, FontAwesome |
| `ty-tag` | Removable tags for selections |
| `ty-copy` | Click-to-copy with visual feedback |
| `ty-scroll-container` | Scrollable area with fade indicators |

**[See all components in action →](https://gersak.github.io/tyrell)**

---

## Design System

Semantic CSS classes that flip correctly for dark mode:

```html
<!-- Surfaces -->
<div class="ty-canvas">...</div>      <!-- App background -->
<div class="ty-content">...</div>     <!-- Main content -->
<div class="ty-elevated">...</div>    <!-- Cards, panels -->
<div class="ty-floating">...</div>    <!-- Modals, dropdowns -->

<!-- Text emphasis -->
<h1 class="ty-text++">Maximum</h1>    <!-- Strongest -->
<h2 class="ty-text+">High</h2>
<p class="ty-text">Normal</p>
<span class="ty-text-">Muted</span>
<small class="ty-text--">Faint</small> <!-- Weakest -->

<!-- Semantic colors -->
<span class="ty-text-primary">Primary</span>
<span class="ty-text-success">Success</span>
<span class="ty-text-danger">Danger</span>
<div class="ty-bg-warning- p-2">Warning background</div>
```

---

## Links

- [Documentation & Examples](https://gersak.github.io/tyrell)
- [GitHub](https://github.com/gersak/tyrell)
- [NPM tyrell-components](https://www.npmjs.com/package/tyrell-components)
- [NPM tyrell-react](https://www.npmjs.com/package/tyrell-react)
- [Clojars dev.gersak/tyrell](https://clojars.org/dev.gersak/tyrell)
- [Clojars dev.gersak/tyrell-icons](https://clojars.org/dev.gersak/tyrell-icons)

---

MIT License
