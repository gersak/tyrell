# Datastar + Tyrell Guide

Use Tyrell web components with Datastar for reactive server-driven UIs. No JavaScript framework needed — just HTML attributes, SSE, and your backend of choice.

## Why they fit together

Datastar and Tyrell are built around the same philosophy: **standard HTML attributes, standard DOM events, standard form association**. There is no adapter layer because none is needed.

| What Datastar does | How Tyrell meets it |
|---|---|
| `data-bind="x"` — two-way bind to a form element | Tyrell form components implement `ElementInternals` — they behave as native inputs for `data-bind` |
| `data-on:change="..."` — listen to any DOM event | Tyrell emits standard `CustomEvent` on `change`; `evt.detail.value` is the payload |
| `data-attr:flavor="$x"` — bind any HTML attribute to a signal | Tyrell attributes are plain HTML attributes — reactive binding just works |
| `@post('/api/...')` — send signals to server | Server reads signals as JSON, returns SSE with fresh Tyrell HTML |
| `patch-elements` — morph DOM to new HTML | Server renders Tyrell hiccup; Datastar morphs it in place |

The result: **a full interactive UI driven entirely by server-rendered HTML**. The client runs Datastar (one script tag) and Tyrell (one script tag). Your server emits HTML strings. No build step, no component tree, no hydration.

### PocketLedger — a real app

[`examples/pocketledger/`](../examples/pocketledger/) is a production-quality expense tracker built with this exact stack: **Clojure + Datastar + Tyrell + Tauri** (desktop/Android). It shows tabs, wizard-style setup, forms with currency input, date picker, multi-select categories, scroll container for transaction history, dark mode toggle, and full SSE-driven CRUD — all in ~600 lines of Clojure with no client-side framework.

### Go examples — every component in one place

Two minimal single-file Go servers (standard library only, no external Go deps) that exercise the full primitive surface against the latest TC build:

- [`examples/datastar-go/`](../examples/datastar-go/) — support-ticket form. Covers `ty-input`, `ty-textarea`, `ty-select` + `ty-option`, `ty-radio-group`, `ty-date-picker`, `ty-switch`, `ty-checkbox`, `ty-button`, `ty-modal`, `ty-scroll-container`, `ty-icon`, plus debounced server-side validation and a keep-alive SSE feed.
- [`examples/datastar-go-workspace/`](../examples/datastar-go-workspace/) — workspace dashboard covering everything the first example doesn't: `ty-tabs`, `ty-select` (`multiple`) + `ty-selected-options` + `ty-tag`, `ty-copy`, `ty-file-upload`, `ty-calendar`, `ty-wizard` + `ty-step`, `ty-popup`, `ty-tooltip`, `ty-resize-observer`, with server-driven wizard transitions and SSE upload progress.

Both pin the CDN to `tyrell-components@tc` (the dist tag that follows the latest TC build) so they track the version under active development. They also demonstrate **server-rendered icons** — inline `<svg>` slotted into `<ty-icon>` so icons paint with zero client-side JS.

## Setup

### HTML Head

```html
<!-- Tyrell CSS and Components -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
<!-- tyrell-theme.css: auto-contrast, seed-based rebranding, themes. See TY_GUIDE.md#quick-start -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell-theme.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>

<!-- Datastar -->
<script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-RC.8/bundles/datastar.js"></script>
```

## Two-Way Binding

Use `data-bind` for form inputs — it handles wiring automatically:

```html
<div data-signals="{name: '', email: '', country: '', tags: []}">

  <ty-input data-bind="name" label="Name" placeholder="Your name"></ty-input>

  <ty-input data-bind="email" label="Email" type="email"></ty-input>

  <ty-select data-bind="country" label="Country" placeholder="Select...">
    <ty-option value="us">United States</ty-option>
    <ty-option value="de">Germany</ty-option>
  </ty-select>

  <!-- Multi-select: add `multiple` — children stay <ty-option>. The change
       detail is { value, values, items, action, item }; `values` is always
       the selected array. `data-bind` works against the comma-separated
       `value` attribute, but it's usually clearer to bind manually: -->
  <ty-select
    multiple
    label="Tags"
    placeholder="Select tags..."
    data-on:change="$tags = evt.detail.values">
    <ty-option value="frontend">Frontend</ty-option>
    <ty-option value="backend">Backend</ty-option>
    <ty-option value="ops">Ops</ty-option>
  </ty-select>

  <ty-button flavor="primary" data-on:click="@post('/api/submit')">
    Submit
  </ty-button>

</div>
```

## Slots

Use `slot="start"` and `slot="end"` for icons inside buttons, inputs, and tags:

```html
<!-- Button with start icon -->
<ty-button flavor="primary">
  <ty-icon slot="start" name="save" size="sm"></ty-icon>
  Save
</ty-button>

<!-- Button with end icon -->
<ty-button flavor="neutral">
  Next
  <ty-icon slot="end" name="chevron-right" size="sm"></ty-icon>
</ty-button>

<!-- Input with icon -->
<ty-input type="currency" currency="EUR" label="Price" data-bind="amount">
  <ty-icon slot="start" name="euro"></ty-icon>
</ty-input>

<!-- Tag with icon -->
<ty-tag flavor="primary">
  <ty-icon slot="start" name="star" size="sm"></ty-icon>
  Featured
</ty-tag>
```

## Event Binding

### Standard Events

```html
<!-- Button click -->
<ty-button data-on:click="@post('/api/action')">Do it</ty-button>

<!-- Update signal on change -->
<ty-select data-on:change="$currency = evt.detail.value">
  <ty-option value="USD">$ USD</ty-option>
  <ty-option value="EUR">EUR</ty-option>
</ty-select>
```

### Manual Event Binding

When you need custom logic beyond simple binding:

```html
<ty-input data-on:change="$username = evt.detail.value; $dirty = true"></ty-input>
```

Always access Tyrell values through `evt.detail.value`.

## Dynamic Attributes

Bind Tyrell component attributes to signal values:

```html
<!-- Toggle tag flavor based on state -->
<ty-tag
  data-attr:flavor="$txType === 'expense' ? 'danger' : 'success'"
  data-on:click="$txType = 'expense'">
  Expense
</ty-tag>

<!-- Set active tab from signal.
     ty-tabs dispatches `ty-tab-change` (not `change`); detail.activeId is the new id. -->
<ty-tabs data-attr:active="$activeTab"
         data-on:ty-tab-change="$activeTab = evt.detail.activeId">
  <ty-tab id="overview" label="Overview">...</ty-tab>
  <ty-tab id="settings" label="Settings">...</ty-tab>
</ty-tabs>

<!-- Conditional wizard step -->
<ty-wizard data-attr:active="$wizardStep"
           data-attr:completed="$wizardCompleted">
  <ty-step id="welcome" label="Welcome">...</ty-step>
  <ty-step id="budget" label="Budget">...</ty-step>
</ty-wizard>
```

## Conditional Visibility

```html
<div data-show="!$setupComplete">
  <ty-input data-bind="userName" label="Your name"></ty-input>
  <ty-button data-on:click="$setupComplete = true">Continue</ty-button>
</div>

<div data-show="$setupComplete">
  <p data-text="'Welcome, ' + $userName"></p>
</div>
```

## Server-Side: SSE Responses

Datastar communicates with your backend through Server-Sent Events.

### Patch Elements (Update DOM)

```
event: datastar-patch-elements
data: selector #dashboard
data: mode innerHTML
data: elements <div id="dashboard"><h2>Updated!</h2></div>
```

### Patch Signals (Update State)

```
event: datastar-patch-signals
data: signals {"txDesc":"","txAmount":"","txDate":""}
```

### Combined Response

```
event: datastar-patch-elements
data: selector #transaction-list
data: mode innerHTML
data: elements <div id="transaction-list">...</div>

event: datastar-patch-signals
data: signals {"txDesc":"","txAmount":"","txCategory":"","txDate":""}
```

## Clojure Backend Example

### Parse Incoming Signals

```clojure
(defn parse-signals
  "Extract Datastar signals from request.
   GET -> query param, POST -> body."
  [request]
  (let [raw (or (get-in request [:params :datastar])
                (when-let [body (:body request)]
                  (if (string? body) body (slurp body))))]
    (when (and raw (not (str/blank? raw)))
      (json/read-str raw :key-fn keyword))))
```

### Send SSE Responses

```clojure
(defn patch-elements [& fragments]
  (str "event: datastar-patch-elements\n"
       "data: mode innerHTML\n"
       "data: elements " (render-html fragments) "\n\n"))

(defn patch-signals [signals]
  (str "event: datastar-patch-signals\n"
       "data: signals " (json/write-str signals) "\n\n"))

(defn sse-response [& events]
  {:status 200
   :headers {"Content-Type" "text/event-stream"
             "Cache-Control" "no-cache"}
   :body (apply str events)})
```

### Form Handler

```clojure
(defn add-transaction [request]
  (let [{:keys [txDesc txAmount txType]} (parse-signals request)]
    (if (or (empty? txDesc) (nil? txAmount))
      (sse-response
        (patch-elements
          [:div#result.ty-bg-danger-.p-3.rounded-lg.border.ty-border-danger
           [:p.ty-text-danger "Please fill in all fields."]]))
      (do
        (save-transaction! {:desc txDesc :amount txAmount :type txType})
        (sse-response
          (patch-elements (transaction-list-fragment))
          (patch-elements (summary-fragment))
          (patch-signals {:txDesc "" :txAmount "" :txDate ""}))))))
```

### Middleware

Pre-read the body before Ring's `wrap-params` consumes it:

```clojure
(defn wrap-slurp-body
  "Capture POST body as string for Datastar signal parsing."
  [handler]
  (fn [request]
    (let [body (:body request)
          body-str (when body
                     (if (string? body) body
                       (let [s (slurp body)]
                         (when-not (empty? s) s))))]
      (handler (assoc request :body body-str)))))

(def app
  (-> handler
      wrap-slurp-body
      wrap-params
      wrap-keyword-params))
```

## More form controls

### ty-textarea

```html
<div data-signals="{notes: ''}">
  <ty-textarea
    data-bind="notes"
    label="Notes"
    placeholder="Any additional notes..."
    rows="4"
    max-height="200px"
  ></ty-textarea>
</div>
```

`data-bind` wires the `change` event automatically. Attrs: `rows`, `min-height`, `max-height`, `resize`.

### ty-checkbox and ty-switch

Wrap in `<label>` to make the text clickable. Read `evt.detail.checked` for boolean state:

```html
<div data-signals="{agreed: false, darkMode: false}">

  <label class="flex items-center gap-2">
    <ty-checkbox
      data-on:change="$agreed = evt.detail.checked"
    ></ty-checkbox>
    I agree to the terms
  </label>

  <label class="flex items-center gap-2">
    <ty-switch
      data-on:change="$darkMode = evt.detail.checked;
                      document.documentElement.classList.toggle('dark', $darkMode)"
    ></ty-switch>
    Dark mode
  </label>

  <ty-button
    flavor="primary"
    data-attr:disabled="!$agreed"
    data-on:click="@post('/api/submit')"
  >
    Continue
  </ty-button>

</div>
```

### ty-radio-group / ty-radio

```html
<div data-signals="{plan: 'starter'}">

  <ty-radio-group
    label="Plan"
    data-on:change="$plan = evt.detail.value"
  >
    <label class="flex items-center gap-2">
      <ty-radio value="starter"></ty-radio> Starter
    </label>
    <label class="flex items-center gap-2">
      <ty-radio value="pro"></ty-radio> Pro
    </label>
    <label class="flex items-center gap-2">
      <ty-radio value="enterprise"></ty-radio> Enterprise
    </label>
  </ty-radio-group>

  <p data-text="'Selected: ' + $plan"></p>

</div>
```

Add `orientation="horizontal"` for a side-by-side layout.

---

## Calendar

### ty-date-picker (in a form)

`data-bind` works on `ty-date-picker` — value is a UTC ISO string:

```html
<ty-date-picker
  data-bind="txDate"
  label="Date"
  placeholder="Pick a date"
></ty-date-picker>
```

### ty-calendar (standalone / inline)

For an always-visible calendar, bind year/month/day separately:

```html
<div data-signals="{calYear: 2025, calMonth: 1, calDay: null}">

  <ty-calendar
    data-attr:year="$calYear"
    data-attr:month="$calMonth"
    data-attr:day="$calDay"
    data-on:change="$calYear = evt.detail.year;
                    $calMonth = evt.detail.month;
                    $calDay = evt.detail.day"
    data-on:navigate="$calYear = evt.detail.year;
                       $calMonth = evt.detail.month"
  ></ty-calendar>

  <div data-show="$calDay !== null">
    <ty-button
      flavor="primary"
      data-on:click="@post('/api/book')"
    >
      Book selected date
    </ty-button>
  </div>

</div>
```

Event detail for `change`: `{ year, month, day, action, source }`. Event detail for `navigate`: `{ year, month }`.

---

## Tooltip and popup

### ty-tooltip

Nest inside the trigger element — positioning is automatic:

```html
<ty-button flavor="primary">
  Save
  <ty-tooltip placement="top">Saves to your account</ty-tooltip>
</ty-button>

<ty-icon name="info">
  <ty-tooltip flavor="primary" delay="300">Required field</ty-tooltip>
</ty-icon>
```

No Datastar wiring needed — tooltip shows on hover/focus automatically.

### ty-popup (for context menus, dropdowns, popovers)

```html
<ty-button>
  Actions
  <ty-popup placement="bottom-start">
    <div class="ty-elevated p-2 rounded-lg min-w-40">
      <div class="px-3 py-2 rounded cursor-pointer hover:ty-bg-neutral-">Edit</div>
      <div
        class="px-3 py-2 rounded cursor-pointer hover:ty-bg-danger- ty-text-danger"
        data-on:click="@post('/api/delete')"
      >Delete</div>
    </div>
  </ty-popup>
</ty-button>
```

The popup closes automatically on outside click or ESC — no Datastar wiring needed for open/close.

---

## Utilities

### ty-copy

```html
<ty-copy
  label="API Key"
  format="code"
  value="sk-1234abcd"
></ty-copy>
```

Copy happens internally — no event handling or signals needed.

### ty-scroll-container

Use when the transaction list (or any list) needs a fixed-height scrollable area:

```html
<ty-scroll-container max-height="400px">
  <div id="transaction-list">
    <!-- Server renders this via patch-elements -->
  </div>
</ty-scroll-container>
```

When `patch-elements` targets `#transaction-list`, the scroll container maintains its position and the shadow edge indicators update automatically.

---

## Icons

You have two independent paths. Pick per icon; they coexist freely on the same page.

### Option A — inline SVG (zero client JS)

`<ty-icon>` exposes a `<slot>`. Drop a raw `<svg>` as a child and the registry is bypassed entirely — **no boot script, no `window.tyIcons.register`, no `name=` attribute**:

```html
<ty-icon size="md" class="ty-text-primary">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
</ty-icon>
```

`size`, `spin`, `pulse`, `tempo`, and `ty-text-*` color classes still apply because they style the host element, not its slotted contents. Use `currentColor` on `fill`/`stroke` so color classes tint the SVG. This is the recommended default for Datastar — the server already has the SVG strings (Lucide / Heroicons / Material / your custom set), so just emit them inline. Works under SSE patch-elements like any other markup.

The two reference examples (`examples/datastar-go/` and `examples/datastar-go-workspace/`) use this exact pattern — see those for a Go-template setup.

### Option B — registry (`name="…"`)

Use this when you'd rather reference icons by short string name across many fragments and register them once at boot.

#### Server-Side (Clojure)

```clojure
(ns myapp.icons
  (:require [clojure.data.json :as json]
            [tyrell.lucide :as lucide]))

(def app-icons
  {"wallet"    lucide/wallet
   "plus"      lucide/plus
   "settings"  lucide/settings
   "check"     lucide/check
   "calendar"  lucide/calendar})

(defn registration-script []
  [:script
   (hiccup.util/raw-string
     (str "(function() {
       var icons = " (json/write-str app-icons) ";
       function register() {
         if (!window.tyIcons || !window.tyIcons.register) return false;
         window.tyIcons.register(icons);
         return true;
       }
       if (!register()) {
         var i = setInterval(function() { if (register()) clearInterval(i); }, 100);
         setTimeout(function() { clearInterval(i); }, 10000);
       }
     })()"))])
```

#### JavaScript (Build-Time Bundling)

```javascript
// icons.js — bundle with esbuild
import { wallet, plus, settings, check, calendar } from 'tyrell-components/icons/lucide'
window.tyIcons.register({ wallet, plus, settings, check, calendar })
```

```bash
esbuild icons.js --bundle --minify --format=iife --outfile=static/icons.js
```

```html
<script defer src="/static/icons.js"></script>
```

## Complete Form Example

```html
<div class="ty-elevated p-6 rounded-lg max-w-lg mx-auto"
     data-signals="{txDesc: '', txAmount: '', txType: 'expense', txCategory: '', txDate: ''}">

  <h2 class="ty-text++ text-xl mb-4">Add Transaction</h2>

  <!-- Type toggle -->
  <div class="flex gap-2 mb-4">
    <ty-tag size="md"
      data-attr:flavor="$txType === 'expense' ? 'danger' : 'neutral'"
      data-on:click="$txType = 'expense'">
      Expense
    </ty-tag>
    <ty-tag size="md"
      data-attr:flavor="$txType === 'income' ? 'success' : 'neutral'"
      data-on:click="$txType = 'income'">
      Income
    </ty-tag>
  </div>

  <!-- Form fields -->
  <ty-input data-bind="txDesc" label="Description" placeholder="What was it for?"></ty-input>
  <ty-input data-bind="txAmount" label="Amount" type="currency" currency="EUR"></ty-input>
  <ty-date-picker data-bind="txDate" label="Date" placeholder="Pick a date"></ty-date-picker>

  <ty-select data-bind="txCategory" label="Category" placeholder="Select category">
    <ty-option value="food">Food</ty-option>
    <ty-option value="transport">Transport</ty-option>
    <ty-option value="utilities">Utilities</ty-option>
  </ty-select>

  <!-- Submit -->
  <ty-button flavor="primary" class="w-full mt-4"
    data-on:click="@post('/api/transactions/add')">
    Add Transaction
  </ty-button>

  <!-- Server updates this -->
  <div id="result" class="mt-2"></div>
</div>
```

## Wizard Pattern

```html
<div data-signals="{wizardStep: 'welcome', wizardCompleted: ''}">

  <ty-wizard data-attr:active="$wizardStep"
             data-attr:completed="$wizardCompleted">

    <ty-step id="welcome" label="Welcome">
      <ty-input data-bind="userName" label="Your name"></ty-input>
      <ty-button flavor="primary"
        data-on:click="$wizardStep = 'preferences'; $wizardCompleted = 'welcome'">
        Next
      </ty-button>
    </ty-step>

    <ty-step id="preferences" label="Preferences">
      <ty-select data-bind="currency" label="Currency">
        <ty-option value="EUR">EUR</ty-option>
        <ty-option value="USD">$ USD</ty-option>
      </ty-select>
      <ty-button flavor="primary"
        data-on:click="$wizardStep = 'done'; $wizardCompleted = 'welcome,preferences'">
        Finish
      </ty-button>
    </ty-step>

    <ty-step id="done" label="Done">
      <p class="ty-text">All set, <span data-text="$userName"></span>!</p>
    </ty-step>

  </ty-wizard>
</div>
```
