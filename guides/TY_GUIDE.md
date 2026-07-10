# Tyrell Component Library — Guide

**Tyrell** is a framework-agnostic web component library. TypeScript core (`tyrell-components`), React wrappers (`tyrell-react`), ClojureScript infra (`dev.gersak/tyrell`).

---

## Use Tyrell Components

When a Tyrell component exists, use it. Do not improvise HTML.

| Need | Use | Not |
|------|-----|-----|
| Button | `<ty-button>` | `<button>`, `<div onclick>` |
| Text input | `<ty-input>` | `<input>` |
| Money/currency | `<ty-input type="currency">` | `<input type="number">` + manual formatting |
| Percentage | `<ty-input type="percent">` | `<input type="number">` + `%` suffix |
| Large numbers | `<ty-input type="compact">` | `<input type="number">` + abbreviation |
| Checkbox | `<ty-checkbox>` | `<input type="checkbox">` |
| Textarea | `<ty-textarea>` | `<textarea>` |
| File upload | `<ty-file-upload>` | `<input type="file">` + custom drop zones |
| Select (single or multi) | `<ty-select>` | `<select>`, custom menus, multiple checkboxes |
| Dropdown (legacy) | `<ty-dropdown>` — deprecated, use `<ty-select>` | `<select>` |
| Multi-select (legacy) | `<ty-multiselect>` — deprecated, use `<ty-select multiple>` | Multiple checkboxes |
| Modal | `<ty-modal>` | `<dialog>`, custom overlays |
| Tooltip | `<ty-tooltip>` | `title` attr, custom divs |
| Popup | `<ty-popup>` | Custom positioned divs |
| Tabs | `<ty-tabs>` + `<ty-tab>` | Custom tab implementations |
| Wizard | `<ty-wizard>` + `<ty-step>` | Custom step indicators |
| Date picker | `<ty-date-picker>` | `<input type="date">` |
| Calendar | `<ty-calendar>` | Custom calendar grids |
| Tags/Chips | `<ty-tag>` | `<span>` with classes |
| Icons | `<ty-icon>` | `<svg>`, `<img>`, icon fonts |
| Copy button | `<ty-copy>` | Custom copy buttons |
| Scrollable area | `<ty-scroll-container>` | `overflow-auto` + manual indicators |
| Field label | `label` attribute on component | `<label>` element |
| Error message | `error` attribute on component | `<span class="text-red-500">` |
| Debounced input | `debounce` attribute | Manual `setTimeout`/debounce |

Plain HTML is OK for: layout (`<div>`, `<section>`), text (`<h1>`-`<h6>`, `<p>`, `<span>` with Tyrell classes), lists, links, images.

---

## Built-in Attributes

Form components have built-in `label`, `error`, `placeholder`, `required`, `disabled`, `flavor`, and `size`.

```html
<!-- Use built-in label and error -->
<ty-input type="email" label="Email" placeholder="you@example.com" error="Invalid email"></ty-input>
```

```clojure
[:ty-input {:type "email" :label "Email" :placeholder "you@example.com" :error "Invalid email"}]
```

---

## Slots for Icons

Components with `start`/`end` slots handle spacing automatically.

```html
<ty-button flavor="primary">
  <ty-icon slot="start" name="save" size="sm"></ty-icon>
  Save
</ty-button>

<ty-input type="currency" currency="EUR" label="Price">
  <ty-icon slot="start" name="euro"></ty-icon>
</ty-input>
```

```clojure
[:ty-button {:flavor "primary"}
 [:ty-icon {:slot "start" :name "save" :size "sm"}]
 "Save"]
```

### All Slots

```
ty-button       slot="start" | (default text) | slot="end"
ty-input        slot="start" | (input field)  | slot="end"
ty-tag          slot="start" | (tag text)     | slot="end"
ty-dropdown     slot="selected"  (custom selected display)
ty-multiselect  slot="selected"  (custom selected display)
ty-tabs         slot="label-{id}" (rich tab label)  |  slot="marker" (active indicator)
ty-wizard       slot="indicator-{id}" (custom step indicator)
```

---

## Input Types

| Type | When | Display (on blur) | Value |
|------|------|-------------------|-------|
| `"currency"` | Money (prices, budgets, transactions) | `$1,234.56` / `€1.234,56` | `1234.56` |
| `"percent"` | Rates, discounts | `15.00%` | `15` |
| `"compact"` | Large numbers, stats | `1.2M` / `1.2K` | `1234567` |
| `"number"` | Plain numeric, no formatting | `1234.56` | `1234.56` |

Raw number while editing, formatted on blur. Uses `Intl.NumberFormat`.

Attributes: `currency` (ISO 4217 code, default `"USD"`), `locale` (default `"en-US"`), `precision` (decimal places).

Events: `detail: { value, formattedValue, rawValue, originalEvent }`.

FormData: submits raw number, not formatted string.

```html
<ty-input type="currency" currency="EUR" locale="de-DE" label="Price" placeholder="0.00">
  <ty-icon slot="start" name="euro"></ty-icon>
</ty-input>

<ty-input type="percent" label="Discount" precision="1"></ty-input>
<ty-input type="compact" label="Revenue"></ty-input>
```

---

## Flavors

| Flavor | Intent | Examples |
|--------|--------|---------|
| `primary` | Main action | Submit, Save, Confirm |
| `secondary` | Alternative action | Export, Import |
| `success` | Positive | Income, completed, "Added!" |
| `danger` | Destructive/negative | Delete, expenses, errors |
| `warning` | Caution | Unsaved changes, limits |
| `neutral` | Default, no weight | Cancel, Close |

---

## Child Elements

| Parent | Children | Example |
|--------|----------|---------|
| `ty-select` | `<ty-option>` (rich HTML; `label` attr = clean display text) | `<ty-option value="us">US</ty-option>` |
| `ty-dropdown` *(deprecated)* | `<option>` or `<ty-option>` | `<option value="us">US</option>` |
| `ty-multiselect` *(deprecated)* | `<ty-tag>` only | `<ty-tag value="js">JavaScript</ty-tag>` |

---

## Components Reference

### ty-button

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `flavor` | string | `'neutral'` | Built-in: `primary` \| `secondary` \| `success` \| `danger` \| `warning` \| `neutral`. Append `+` for stronger or `-` for softer shade (e.g. `"primary+"`, `"danger-"`). Any other string is accepted — theme custom flavors via `--ty-button-*` variables. |
| `appearance` | string | `'solid'` | `solid` (saturated brand fill) \| `outlined` (transparent bg, text === border) \| `ghost` (text only with hover bg) |
| `size` | string | `'md'` | `xs` \| `sm` \| `md` \| `lg` \| `xl` |
| `type` | string | `'submit'` | `button` \| `submit` \| `reset` |
| `disabled` | boolean | `false` | |
| `pill` | boolean | `false` | Rounded shape |
| `action` | boolean | `false` | Square icon-only button |
| `wide` | boolean | `false` | Full width |

**Slots:** `start`, (default), `end` | **Events:** `click` -> `{ originalEvent }`

**Custom colors:** override per button with `--ty-button-bg`, `--ty-button-bg-hover`, `--ty-button-color`, `--ty-button-border`. See [CSS_GUIDE.md → Per-Component Color Overrides](./CSS_GUIDE.md#per-component-color-overrides).

---

### ty-input

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `'text'` | `text` \| `email` \| `password` \| `number` \| `tel` \| `url` \| `currency` \| `percent` \| `compact` |
| `value` | string | `''` | |
| `name` | string | - | Form name |
| `placeholder` | string | - | |
| `label` | string | - | Built-in label |
| `error` | string | - | Built-in error message |
| `disabled` | boolean | `false` | |
| `required` | boolean | `false` | |
| `size` | string | `'md'` | `xs` \| `sm` \| `md` \| `lg` \| `xl` |
| `flavor` | string | `'neutral'` | |
| `currency` | string | `'USD'` | ISO 4217 code (for `type="currency"`) |
| `locale` | string | `'en-US'` | Locale for numeric formatting |
| `precision` | number | - | Decimal places |
| `debounce` | number | `0` | Debounce ms (0-5000) |

**Slots:** `start`, `end` | **Events:** `input`, `change` -> `{ value, formattedValue, rawValue, originalEvent }` | `focus`, `blur`

**Password reveal:** `type="password"` renders a built-in eye toggle after the end slot — toggles visibility of the typed value (native input type only; component `type` and form value unchanged).

**Custom colors:** override per input with `--ty-input-bg`, `--ty-input-color`, `--ty-input-border`, `--ty-input-border-hover`, `--ty-input-border-focus`, `--ty-input-shadow-focus`. See [CSS_GUIDE.md → Per-Component Color Overrides](./CSS_GUIDE.md#per-component-color-overrides).

---

### ty-checkbox

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `checked` | boolean | `false` | |
| `indeterminate` | boolean | `false` | Mixed state (dash); clicking resolves to checked |
| `value` | string | `'on'` | Form value when checked |
| `name` | string | - | |
| `disabled` | boolean | `false` | |
| `required` | boolean | `false` | |
| `error` | string | - | |
| `size` | string | `'md'` | |
| `flavor` | string | `'neutral'` | |

**Slots:** (default) = label | **Events:** `input`, `change` -> `{ value, checked, formValue, originalEvent }`

---

### ty-textarea

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | `''` | |
| `name` | string | - | |
| `placeholder` | string | - | |
| `label` | string | - | |
| `error` | string | - | |
| `disabled` | boolean | `false` | |
| `required` | boolean | `false` | |
| `size` | string | `'md'` | |
| `rows` | string | `'3'` | |
| `resize` | string | `'none'` | `none` \| `both` \| `horizontal` \| `vertical` |
| `min-height` | string | - | |
| `max-height` | string | - | |

**Events:** `input`, `change` -> `{ value, originalEvent }`

---

### ty-copy

Also registered as **`ty-copy-field`** — same element, descriptive name.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | - | Text to copy |
| `label` | string | - | |
| `format` | string | `'text'` | `text` \| `code` |
| `disabled` | boolean | `false` | |

---

### ty-file-upload

Drop zone + file picker. Click to browse or drag-and-drop. Form-associated — selected files appear in `FormData` on submit.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | - | FormData key |
| `multiple` | boolean | `false` | Allow more than one file |
| `accept` | string | - | File-type filter (`image/*`, `.pdf,.docx`, etc.) |
| `label` | string | - | |
| `placeholder` | string | `'Drop files here or click to browse'` | Hint inside the drop zone |
| `disabled` | boolean | `false` | |
| `required` | boolean | `false` | |
| `error` | string | - | Validation message + danger border |

**Properties:** `files` (read-only `File[]`)

**Events:** `change` -> `{ value: File[], files: File[], names: string[] }` — fires on browse, drop, and remove (including when last file is removed → empty array)

**Form integration:** files appear under the `name` attribute as multiple `FormData` entries; `form.reset()` clears the selection.

---

### ty-select

The select control — **replaces ty-dropdown and ty-multiselect** (both are now deprecated). Single select by default with a form-field look matching `ty-input`.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `multiple` | boolean | `false` | Multi select (native `<select multiple>` semantics). Absent = single: picking replaces the selection and closes the popup |
| `compact` | boolean | `false` | Content-hugging trigger for toolbars/filter bars instead of the full-width field. Single shows the selected label; multiple shows placeholder + count badge |
| `value` | string | `''` | Selected value; comma-separated when multiple (arrays accepted from frameworks) |
| `name` | string | - | Single submits one FormData entry; multiple submits repeated `name=` entries |
| `label` | string | - | |
| `placeholder` | string | `'Select...'` | Shown while empty; selection shows the option itself (single) or joined labels (multiple) |
| `searchable` | string | `'auto'` | Popup search row: `auto` = only for 8+ options; `searchable`/`"true"` always; `"false"` never. `external-search` always shows it |
| `external-search` | boolean | `false` | Delegate filtering: emits debounced `search` events; replace the option children in response |
| `debounce` | number | `0` | Search event debounce (0-5000ms) |
| `loading` | boolean | `false` | Spinner in the options area (external search in flight) |
| `disabled` / `readonly` / `required` | boolean | `false` | |
| `size` | string | `'md'` | `sm` \| `md` \| `lg` |

**Children:** `<ty-option>` — supports rich HTML content; a `label` attribute (native `<option label>` semantics) provides clean display text for summaries/chips; `data-*` attributes feed `ty-selected-tags` templates.

**Single-select display:** the selected option is **cloned into the trigger** (rich HTML intact — icons, prices, flags).

**Slots:** `start` / `end` (adornments), `trigger` (replaces field/compact chrome entirely; behavior/form/ARIA stay), `loading` | **Events:** `change` -> `{ value, values, items: [{value,label,flavor}], action, item }` (`value` scalar for single, array for multiple) | `search` -> `{ query, element }` | `open` / `close`

**Companion:** `<ty-selected-tags for="id">` renders the selection as dismissible chips anywhere in the layout; optional `<template>` child with `{value}` `{label}` `{flavor}` `{data-*}` placeholders for custom chip markup.

---

### ty-dropdown

> **Superseded by ty-select.** Kept for compatibility.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | `''` | |
| `name` | string | - | |
| `placeholder` | string | `'Select an option...'` | |
| `label` | string | - | |
| `disabled` | boolean | `false` | |
| `readonly` | boolean | `false` | |
| `required` | boolean | `false` | |
| `external-search` | boolean | `false` | Switch to external (remote) search — dispatches `search` events instead of filtering locally |
| `clearable` | boolean | `true` | |
| `not-clearable` | boolean | - | Disable clear |
| `size` | string | `'md'` | |
| `flavor` | string | `'neutral'` | |
| `debounce` | number | `0` | Search debounce |

**Children:** `<option>` or `<ty-option>` (for rich HTML) | **Slots:** `selected`

**Events:** `change` -> `{ value, text, option, originalEvent }` | `search` -> `{ query, originalEvent }`

**Custom colors:** uses the shared `--ty-input-*` variable family — override per dropdown with `--ty-input-bg`, `--ty-input-border`, `--ty-input-border-focus`, `--ty-input-shadow-focus`, etc. See [CSS_GUIDE.md → Per-Component Color Overrides](./CSS_GUIDE.md#per-component-color-overrides).

---

### ty-multiselect

> **Deprecated — use [`ty-select multiple`](#ty-select).** Kept for compatibility; no new features.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | `''` | Comma-separated values |
| `name` | string | - | |
| `placeholder` | string | `'Select options...'` | |
| `label` | string | - | |
| `disabled` | boolean | `false` | |
| `readonly` | boolean | `false` | |
| `required` | boolean | `false` | |
| `external-search` | boolean | `false` | Switch to external (remote) search — dispatches `search` events instead of filtering locally |
| `size` | string | `'md'` | |
| `flavor` | string | `'neutral'` | |
| `debounce` | number | `0` | Search debounce |
| `selected-label` | string | `'Selected'` | |
| `available-label` | string | `'Available'` | |

**Children:** `<ty-tag>` only | **Slots:** `selected`

**Events:** `change` -> `{ values: string[], action: 'add'|'remove'|'clear'|'set', item }` | `search` -> `{ query, element }`

**Custom colors:** uses the shared `--ty-input-*` variable family — override per multiselect with `--ty-input-bg`, `--ty-input-border`, `--ty-input-border-focus`, `--ty-input-shadow-focus`, etc. See [CSS_GUIDE.md → Per-Component Color Overrides](./CSS_GUIDE.md#per-component-color-overrides).

---

### ty-option

Rich HTML option for `<ty-select>` (and the deprecated `<ty-dropdown>`). Attrs: `value`, `label` (clean display text — native `<option label>` semantics), `selected`, `disabled`, `highlighted`, `hidden`. Default slot for content; `data-*` attributes feed `ty-selected-tags` chip templates.

---

### ty-tag

The pill/**chip** component (Material's "chip" == Tyrell's tag).

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `flavor` | string | `'neutral'` | |
| `size` | string | `'md'` | |
| `value` | string | - | |
| `selected` | boolean | `false` | |
| `pill` | boolean | `true` | |
| `clickable` | boolean | `false` | |
| `dismissible` | boolean | `false` | |
| `disabled` | boolean | `false` | |

**Slots:** `start`, (default), `end` | **Events:** `click`, `dismiss`

---

### ty-tabs / ty-tab

**ty-tabs:** `width` (default `'100%'`), `height` (required), `active` (tab id), `placement` (`top` | `bottom`)

**ty-tab:** `id` (required), `label` (required)

**Slots:** `label-{id}` (rich label), `marker` (active indicator)

**Events:** `ty-tab-change` -> `{ activeId, activeIndex, previousId, previousIndex }`

```html
<ty-tabs height="400px" active="overview">
  <span slot="label-overview" class="flex items-center gap-2">
    <ty-icon name="layout-dashboard" size="sm"></ty-icon>
    Overview
  </span>
  <ty-tab id="overview" label="Overview">Content here</ty-tab>
  <ty-tab id="details" label="Details">Details here</ty-tab>
</ty-tabs>
```

**CSS Variables:**

```css
--ty-tabs-bg
--ty-tabs-border-width
--ty-tabs-button-padding
--ty-tabs-button-gap
--ty-tabs-button-hover-bg
--transition-duration
```

---

### ty-wizard / ty-step

**ty-wizard:** `width`, `height` (required), `active` (step id), `completed` (comma-separated ids), `orientation` (`horizontal` | default)

**ty-step:** `id` (required), `label` (required)

**Slots:** `indicator-{id}` (custom step indicator)

**Events:** `ty-wizard-step-change` -> `{ activeId, activeIndex, previousId, previousIndex, direction }`

---

### ty-calendar

Attrs: `year`, `month`, `day`, `name`, `required`, `min`, `max` (ISO dates — out-of-bounds days disabled, navigation clamped). Property: `dayContentFn`.

**Events:** `change` -> `{ year, month, day, action, source, dayContext }` | `navigate` -> `{ month, year, action, source }`

**Form value:** ISO date `YYYY-MM-DD`

---

### ty-date-picker

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | - | UTC ISO datetime |
| `name` | string | - | |
| `label` | string | - | |
| `placeholder` | string | - | |
| `with-time` | boolean | `false` | Include time picker |
| `min` | string | - | Earliest selectable date (ISO `YYYY-MM-DD`) |
| `max` | string | - | Latest selectable date (ISO `YYYY-MM-DD`) |
| `disabled` | boolean | `false` | |
| `required` | boolean | `false` | |
| `locale` | string | `'en-US'` | |
| `size` | string | `'md'` | |

**Events:** `change` | **Form value:** UTC ISO `2024-09-21T08:30:00.000Z`

---

### ty-modal

Also registered as **`ty-dialog`** — same element, platform/ARIA name (wraps native `<dialog>`).

Attrs: `open`, `backdrop` (default true), `close-on-outside-click` (true), `close-on-escape` (true).

Events: `open`, `close`, **`beforeclose`** (cancellable). Listen to `beforeclose` and call `event.preventDefault()` to guard against unsaved-state dismissal. The detail contains `reason: 'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'`. Once your custom confirm UI captures consent, call `.hide({ force: true })` to bypass the event.

**Methods:** `show()`, `hide()` | **Events:** `close` -> `{ reason, returnValue? }`

Always render modals in DOM. Control with `open` attribute or `show()`/`hide()`.

---

### ty-tooltip

Attrs: `placement` (default `'top'`), `offset` (8), `delay` (200ms), `disabled`, `flavor` (default `'dark'`).

Nest as child of target: `<ty-button>Hover<ty-tooltip>Help text</ty-tooltip></ty-button>`

---

### ty-popup

Attrs: `manual`, `disable-close`, `placement` (default `'bottom'`), `offset` (8).

**Methods:** `show()`, `hide()`

---

### ty-icon

Attrs: `name`, `size` (`xs` | `sm` | `md` | `lg` | `xl`), `spin`, `pulse`, `tempo`.

**Two rendering paths:**

1. **Registry lookup** (`name="check"`) — bundler-friendly, tree-shakeable. See the JavaScript guide for `registerIcons` / `window.tyIcons`.
2. **Inline SVG via slot** — pass raw `<svg>` as a child and the registry is bypassed. No JS registration required. Ideal for server-rendered apps (HTMX, Datastar, Phoenix, Rails, JSF…) where the backend already has the SVG.

```html
<!-- Path 1: registry -->
<ty-icon name="check" size="md"></ty-icon>

<!-- Path 2: slotted SVG (no registry needed) -->
<ty-icon size="md" class="ty-text-primary">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
</ty-icon>
```

`size`, `spin`, `pulse`, `tempo`, and `ty-text-*` color classes apply to the host element — they work identically on both paths. Use `currentColor` for `fill`/`stroke` so text-color classes still tint the SVG.

---

### ty-scroll-container

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `shadow` | boolean | `true` | Show top/bottom shadow indicators |
| `max-height` | string | - | Constrain height (e.g. `"400px"`, `"50vh"`) |
| `hide-scrollbar` | boolean | `false` | Hide native scrollbar |
| `custom-scrollbar` | boolean | `false` | Render custom styled scrollbar |
| `overflow-x` | boolean | `false` | Enable horizontal scrolling |

```html
<ty-scroll-container max-height="400px">
  <div>Item 1</div>
  <div>Item 2</div>
</ty-scroll-container>
```

---

### ty-resize-observer

Attrs: `id` (required), `debounce`. Query: `window.tyResizeObserver.getSize(id)`

---

## Icon System

Register icons before components render:

```javascript
// JavaScript
window.tyIcons.register({ 'heart': '<svg>...</svg>', 'star': '<svg>...</svg>' });

// ES Modules
import { registerIcons } from 'tyrell-components';
registerIcons({ 'heart': '<svg>...</svg>' });
```

```clojure
;; ClojureScript (recommended — auto-retries until tyrell.js loads)
(require '[tyrell.icons :as icons] '[tyrell.lucide :as lucide])
(icons/register-async! {:check lucide/check :heart lucide/heart})
```

**Icon sets (ClojureScript, tree-shakeable):** `tyrell.lucide`, `tyrell.heroicons.outline`, `tyrell.heroicons.solid`, `tyrell.material.*`, `tyrell.fav6.brands`, `tyrell.fav6.regular`, `tyrell.fav6.solid`

**JS libraries:** `lucide-static`, `@fortawesome/free-solid-svg-icons`, `heroicons`, `@mdi/svg`

**API:** `window.tyIcons.has(name)`, `.get(name)`, `.list()`, `.cacheInfo()`, `.clearCache()`

---

## Installation

```bash
# NPM
npm install tyrell-components

# React
npm install tyrell-react
```

```html
<!-- CDN -->
<script src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
```

```clojure
;; ClojureScript (Clojars)
[dev.gersak/tyrell "0.4.0"]
```

---

## Positioning

Smart positioning for floating elements.

```javascript
import { findBestPosition, autoUpdate, placementPreferences } from 'tyrell-components';

const result = findBestPosition({
  targetEl: button,
  floatingEl: tooltip,
  preferences: placementPreferences.tooltip,
  offset: 8,
  padding: 8
});

tooltip.style.left = result.x + 'px';
tooltip.style.top = result.y + 'px';

// Continuous positioning (updates on scroll/resize)
const cleanup = autoUpdate(targetEl, floatingEl,
  (position) => {
    floatingEl.style.left = position.x + 'px';
    floatingEl.style.top = position.y + 'px';
  },
  { preferences: placementPreferences.dropdown }
);
cleanup(); // Stop auto-updating
```

---

## Framework Integration

### React

```typescript
import { TyButton, TyInput, TyModal } from 'tyrell-react';
// or short names:
import { Button, Input, Modal } from 'tyrell-react';
```

| React Prop | Web Component Event | When |
|------------|---------------------|------|
| `onChange` | `input` | Every keystroke |
| `onChangeCommit` | `change` | On blur |
| `onFocus` | `focus` | Focus |
| `onBlur` | `blur` | Blur |

Imperative methods via refs: `useRef<TyModalRef>()` -> `.current?.show()` / `.hide()`

### ClojureScript

```clojure
;; Event handling
[:ty-input {:on {:input (fn [e] (-> e .-detail .-value))
                 :change (fn [e] (-> e .-detail .-value))}}]

;; Dynamic classes — use vectors, not string concatenation
[:div {:class ["ty-elevated" "p-4" (when active? "ty-bg-primary-")]}]
```

---

## Utility Functions

```javascript
// Resize observer
window.tyResizeObserver.getSize('element-id')  // { width, height }
window.tyResizeObserver.onResize('id', ({ width, height }) => { ... })

// Scroll lock (used by modals)
import { lockScroll, unlockScroll, isLocked, forceUnlockAll } from 'tyrell-components';

// Positioning for floating elements
import { findBestPosition, autoUpdate, placementPreferences } from 'tyrell-components';
```

---

## All Events Reference

| Component | Event | Detail |
|-----------|-------|--------|
| `ty-input` | `input`, `change` | `{ value, formattedValue, rawValue, originalEvent }` |
| `ty-checkbox` | `input`, `change` | `{ value, checked, formValue, originalEvent }` |
| `ty-select` | `change` | `{ value (scalar / array when multiple), values, items, action, item }` |
| `ty-select` | `search` | `{ query, element }` |
| `ty-dropdown` *(deprecated)* | `change` | `{ value, text, option, originalEvent }` |
| `ty-dropdown` | `search` | `{ query, originalEvent }` |
| `ty-multiselect` | `change` | `{ values, action, item }` |
| `ty-file-upload` | `change` | `{ value: File[], files: File[], names: string[] }` |
| `ty-calendar` | `change` | `{ year, month, day, action, source, dayContext }` |
| `ty-tabs` | `ty-tab-change` | `{ activeId, activeIndex, previousId, previousIndex }` |
| `ty-wizard` | `ty-wizard-step-change` | `{ activeId, activeIndex, previousId, previousIndex, direction }` |
| `ty-modal` | `close` | `{ reason, returnValue? }` |
| `ty-tag` | `dismiss` | -- |
| `ty-button` | `click` | `{ originalEvent }` |

Always access via `event.detail.value`, never `event.target.value`.
