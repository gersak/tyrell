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
ty-select       slot="start" | slot="end" | slot="trigger" (custom chrome) | slot="loading"
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
| `success` | Positive | Income, completed, "Added!" |
| `danger` | Destructive/negative | Delete, expenses, errors |
| `warning` | Caution | Unsaved changes, limits |
| `neutral` | Default, no weight | Cancel, Close |

Any other string is a **custom flavor**: define `--ty-color-X` / `--ty-bg-X` / `--ty-solid-X` design tokens and the component themes itself, `+`/`-` shades included. Every flavored component supports this (`ty-button`, `ty-tag`, `ty-switch`, `ty-radio-group`, `ty-checkbox`, `ty-input`, `ty-select`, `ty-date-picker`, `ty-copy`, `ty-tooltip`, `ty-calendar`); missing tokens degrade to neutral. See [CSS_GUIDE.md → Custom Flavors](./CSS_GUIDE.md#custom-flavors-add-your-own).

---

## Child Elements

| Parent | Children | Example |
|--------|----------|---------|
| `ty-select` | `<ty-option>` (rich HTML; `label` attr = clean display text) | `<ty-option value="us">US</ty-option>` |
| `ty-selected-options` | optional `<template>` with `{value}`/`{label}`/`{flavor}`/`{data-*}` placeholders | `<template><ty-tag flavor="{flavor}">{label}</ty-tag></template>` |

---

## Components Reference

### ty-button

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `flavor` | string | `'neutral'` | Built-in: `primary` \| `success` \| `danger` \| `warning` \| `neutral`. Append `+` for stronger or `-` for softer shade (e.g. `"primary+"`, `"danger-"`). Any other string is a custom flavor: define `--ty-solid-X`(`-fg/-hover/...`), `--ty-color-X-*`, `--ty-bg-X-soft` tokens and it themes like a built-in (missing tokens fall back to neutral); `--ty-button-*` variables still override per instance. `ty-tag` works the same way via `--ty-bg-X` / `--ty-color-X` / `--ty-border-X`. |
| `appearance` | string | `'solid'` | `solid` (saturated brand fill) \| `outlined` (transparent bg, text === border) \| `ghost` (text only with hover bg) |
| `size` | string | `'md'` | `xs` \| `sm` \| `md` \| `lg` \| `xl` |
| `type` | string | `'submit'` | `button` \| `submit` \| `reset` |
| `disabled` | boolean | `false` | |
| `pill` | boolean | `false` | Rounded shape |
| `action` | boolean | `false` | Square icon-only button |
| `wide` | boolean | `false` | Full width |
| `muted` | boolean | `false` | Desaturates the flavor to neutral at rest; reveals real color on hover (pointer only, gated via `(hover: hover)`) and on `:active`/`:focus-visible` so touch still gets it on tap. Works across all three appearances and respects `+`/`-` tone. |

**Slots:** `start`, (default), `end` | **Events:** `click` -> `{ originalEvent }`

**Sizing:** buttons run a 24-40px 4px ladder, sharing its top three steps with the fields' 32/36/40px ladder. Pairing with a field: **alongside** in a row, field `sm`/`md`/`lg` match button `md`/`lg`/`xl` exactly (32/36/40); **embedded** in a field's `end` slot, use the **same** size name — it nests with a consistent ~4px margin. See [CSS_GUIDE.md → Component Sizing](./CSS_GUIDE.md#component-sizing).

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
| `size` | string | `'md'` | `sm` \| `md` \| `lg` (legacy `xs`/`xl` coerce to `sm`/`lg`) — see [CSS_GUIDE.md → Component Sizing](./CSS_GUIDE.md#component-sizing) |
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor from `--ty-color-X` tokens. Colors the border + focus ring; per-instance override via `--input-accent` / `--input-accent-bold` / `--input-ring`. |
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
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor from `--ty-color-X` tokens. Per-instance override via `--checkbox-color` / `--checkbox-color-off`. |

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
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor. Colors the copy button + hover tint; per-instance override via `--copy-color` / `--copy-color-hover` / `--copy-bg-hover`. |
| `disabled` | boolean | `false` | |

The copy button is icon-only and carries `aria-label`, updated live through its states: "Copy to clipboard" → "Copied!" / "Copy failed" → back.

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

THE select control. Single select by default with a form-field look matching `ty-input`; `multiple` for multi-select.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `multiple` | boolean | `false` | Multi select (native `<select multiple>` semantics). Absent = single: picking replaces the selection and closes the popup |
| `compact` | boolean | `false` | Content-hugging trigger for toolbars/filter bars instead of the full-width field. Single shows the selected label; multiple shows placeholder + count badge |
| `value` | string | `''` | Selected value; comma-separated when multiple (arrays accepted from frameworks) |
| `name` | string | - | Single submits one FormData entry; multiple submits repeated `name=` entries |
| `label` | string | - | |
| `placeholder` | string | `'Select...'` | Shown while empty; selection shows the option itself (single) or joined labels (multiple) |
| `searchable` | string | `'auto'` | Popup search row: `auto` = only for 8+ options; `searchable`/`"true"` always; `"false"` never. `external-search` and `allow-create` always show it |
| `external-search` | boolean | `false` | Delegate filtering: emits debounced `search` events; replace the option children in response |
| `allow-create` | boolean | `false` | Enter on unmatched search text mints a new `<ty-option>` and selects it. Exact match (value or label, case-insensitive) selects the existing option instead of duplicating. Single: replaces selection, closes. Multiple: appends, clears search, stays open (tags-input pattern). Fires the cancelable `create` event first — see below |
| `create-transform` | string | `'none'` | `'slug'`: normalizes the **value** allow-create mints (lowercase, spaces → `_`, strips non-alphanumeric). The display label is always kept verbatim regardless |
| `debounce` | number | `0` | Search event debounce (0-5000ms) |
| `loading` | boolean | `false` | Spinner in the options area (external search in flight) |
| `disabled` / `readonly` / `required` | boolean | `false` | |
| `size` | string | `'md'` | `sm` \| `md` \| `lg` — shares the field height ladder with `ty-input`/`ty-date-picker` (legacy `xs`/`xl` coerce to `sm`/`lg`); see [CSS_GUIDE.md → Component Sizing](./CSS_GUIDE.md#component-sizing) |
| `placement` | string | - | Popup side + cross-axis alignment — `bottom-start`, `top-end`, … See [Placement](#placement). Vertical-only: `left-*`/`right-*` keep their alignment but leave the side automatic. Takes precedence over `align` |
| `align` | string | `'start'` | Horizontal popup anchor only: `'start'` (trigger's left edge), `'center'`, or `'end'` (trigger's right edge) — clamped into the viewport either way. Useful with `slot="trigger"` when the custom trigger sits near the right edge of its container. Prefer `placement` for new markup |
| `clearable` | boolean | `true` | Built-in × clear button in the default/compact trigger, shown once something is selected. Not shown with `slot="trigger"` (lives in the slot's fallback content, same mechanism that already hides the chevron there) — call the `clear()` method instead. Suppressed while `disabled`/`readonly`. `not-clearable` (or `clearable="false"`) opts out |
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor from `--ty-color-X` tokens. Colors the field border + hover, and adds a focus ring while the dropdown is open; per-instance override via `--select-accent` / `--select-accent-bold` / `--select-ring`. |

**Children:** `<ty-option>` — supports rich HTML content; a `label` attribute (native `<option label>` semantics) provides clean display text for summaries/chips; `data-*` attributes feed `ty-selected-options` templates.

**Single-select display:** the selected option is **cloned into the trigger** (rich HTML intact — icons, prices, flags).

**Methods:** `clear()` — empties the entire selection and fires `change` (`action: 'clear'`); no-op if nothing is selected. Works regardless of `clearable`/skin, so `slot="trigger"` consumers can wire their own clear icon's click handler to it directly. `deselectValue(value)` — removes one value and fires `change` (`action: 'remove'`); used internally by `ty-selected-options` chip dismissal.

**Slots:** `start` / `end` (adornments), `trigger` (replaces field/compact chrome entirely; behavior/form/ARIA stay), `loading` | **Events:** `change` -> `{ value, values, items: [{value,label,flavor}], action, item }` (`value` scalar for single, array for multiple; `action` is `'set' | 'add' | 'remove' | 'clear' | 'create'` — `'clear'` from the clear button or `clear()`, `'create'` when allow-create minted the option) | `search` -> `{ query, element }` | `open` / `close` | `create` -> `{ value, label }` — **cancelable**: mutate `detail.value` to change the id that gets created (e.g. slugify it yourself), or `preventDefault()` to create the option yourself (e.g. after a server round-trip)

**Companion:** `<ty-selected-options for="id">` renders the selection as dismissible chips anywhere in the layout; optional `<template>` child with `{value}` `{label}` `{flavor}` `{data-*}` placeholders for custom chip markup. Also registered as **`ty-selected-tags`** — original tag name, kept working indefinitely.

**Full keyboard + ARIA combobox pattern:** the field is in the tab order (`tabindex="0"`; `-1` when `disabled`) and carries `role="combobox"` / `aria-haspopup="listbox"` / `aria-expanded` / `aria-controls` (the popup's `role="listbox"`, `aria-multiselectable` when `multiple`) / `aria-labelledby` (when `label` is set — the visible label text, programmatically associated, not just nearby). Each `<ty-option>` gets `role="option"` + a live `aria-selected`. `Enter`/`Space`/`ArrowDown` open the closed, focused field — not just a mouse click.

**Custom colors:** uses the shared `--ty-input-*` variable family — override per select with `--ty-input-bg`, `--ty-input-border`, `--ty-input-border-focus`, `--ty-input-shadow-focus`, etc. See [CSS_GUIDE.md → Per-Component Color Overrides](./CSS_GUIDE.md#per-component-color-overrides).

---

### ty-option

Rich HTML option for `<ty-select>`. Attrs: `value`, `label` (clean display text — native `<option label>` semantics), `selected`, `disabled`, `highlighted`, `hidden`. Default slot for content; `data-*` attributes feed `ty-selected-options` chip templates.

---

### ty-tag

The pill/**chip** component (Material's "chip" == Tyrell's tag).

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `flavor` | string | `'neutral'` | Built-ins plus `+`/`-` shades, same as ty-button. Custom flavor `X` themes from `--ty-bg-X` / `--ty-color-X` / `--ty-border-X` tokens; `ty-tag[flavor="X"] { --tag-bg: ...; --tag-color: ...; --tag-border-color: ...; }` still overrides. |
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

**ARIA:** full tab pattern — `role="tablist"` / `role="tab"` (+ `aria-selected`) on the buttons, `role="tabpanel"` (+ `aria-labelledby`, `tabindex="0"`) on each `<ty-tab>` itself (it *is* the panel — there's no separate wrapper). No `aria-controls`: the button lives in shadow DOM and the panel in light DOM, and ARIA id-references don't resolve across that boundary — `aria-labelledby` (light DOM → shadow DOM id) is the direction that actually works.

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

**ARIA:** same tab pattern as `ty-tabs` — step indicators are `role="tab"` inside a dedicated `role="tablist"` (kept separate from the progress line, which is its own `role="progressbar"` with an `aria-label` — a `tablist` may only contain tabs), each `<ty-step>` is `role="tabpanel"` + `aria-labelledby` + `tabindex="0"`.

---

### ty-calendar

Attrs: `year`, `month`, `day`, `name`, `required`, `min`, `max` (ISO dates — out-of-bounds days disabled, navigation clamped), `flavor` (default `'primary'` — built-ins, `+`/`-` shades, or a custom flavor; colors the selected/today day in the nested `ty-calendar-month`, navigation stays neutral chrome). Property: `dayContentFn`.

**Events:** `change` -> `{ year, month, day, action, source, dayContext }` | `navigate` -> `{ month, year, action, source }`

**Form value:** ISO date `YYYY-MM-DD`

**Keyboard + ARIA:** the day grid (in the nested `ty-calendar-month`) is a real WAI-ARIA grid — `role="grid"`/`row`/`columnheader`/`gridcell`, with roving `tabindex` (exactly one day is in the tab order at a time; arrow keys move it — `←`/`→` by a day, `↑`/`↓` by a week — and `Enter`/`Space` select). Disabled (out-of-`min`/`max`) days are excluded from the roving set. Each day's `aria-label` is a full readable date (e.g. "Wednesday, July 15, 2026"), not just the visible number.

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
| `placement` | string | - | Calendar popup side + cross-axis alignment — `bottom-start`, `top-end`, … See [Placement](#placement). Vertical-only: `left-*`/`right-*` keep their alignment but leave the side automatic |
| `clearable` | boolean | `true` | Built-in × clear button in the stub, shown once a date is selected. Suppressed while `disabled`. Use `not-clearable` (or `clearable="false"`) to opt out. |
| `flavor` | string | `'default'` | Built-ins, `+`/`-` shades, or a custom flavor. Colors the stub border + focus ring (override via `--date-picker-accent` / `--date-picker-accent-bold` / `--date-picker-ring`) and the popup calendar's selected/today day (forwarded to the nested `ty-calendar`). |

**Methods:** `clear()` — clears the value programmatically and fires `change` (`detail.source: 'clear'`); works regardless of `clearable`, for any external trigger that wants to clear the field without the built-in button.

**Events:** `change` -> `{ value, localValue, milliseconds, formatted, source }` (`source` is `'selection' | 'time-change' | 'clear' | 'external'`) | **Form value:** UTC ISO `2024-09-21T08:30:00.000Z`

**Keyboard + ARIA:** the field is in the tab order (`tabindex="0"`; `-1` when `disabled`) and carries `role="button"` (it's a trigger, not editable text) / `aria-haspopup="dialog"` / `aria-expanded` / `aria-labelledby` (when `label` is set). `Enter`/`Space` open the closed, focused field, not just a mouse click. The popup itself is a native `<dialog>` opened via `showModal()`, so it already gets `role="dialog"` + focus-trap semantics from the browser for free.

---

### ty-modal

Also registered as **`ty-dialog`** — same element, platform/ARIA name (wraps native `<dialog>`).

Attrs: `open`, `backdrop` (default true), `close-on-outside-click` (true), `close-on-escape` (true), `label` — sets `aria-label` on the internal `<dialog>`. `<dialog>` gets `role="dialog"` for free, but nothing names it unless you set this (or wire your own `aria-labelledby` to a slotted heading yourself); unset is not a regression, just unlabeled, same as before.

Events: `open`, `close`, **`beforeclose`** (cancellable). Listen to `beforeclose` and call `event.preventDefault()` to guard against unsaved-state dismissal. The detail contains `reason: 'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'`. Once your custom confirm UI captures consent, call `.hide({ force: true })` to bypass the event.

**Methods:** `show()`, `hide()` | **Events:** `close` -> `{ reason, returnValue? }`

Always render modals in DOM. Control with `open` attribute or `show()`/`hide()`.

---

### ty-tooltip

Attrs: `placement` (default `'top'` — see [Placement](#placement)), `offset` (8), `delay` (600ms), `disabled`, `flavor` (default `'dark'`; also `light` / `info`, built-in semantics with `+`/`-` shades, or a custom flavor from `--ty-bg-X` / `--ty-color-X` tokens).

Nest as child of target: `<ty-button>Hover<ty-tooltip>Help text</ty-tooltip></ty-button>`

**Content is real HTML**, not plain text — `<ty-tooltip><kbd>Ctrl+S</kbd> to save</ty-tooltip>` renders the `<kbd>` tag, not the literal text.

**Accessible by default:** the popover gets `role="tooltip"` and the trigger (`ty-tooltip`'s parent element — must be the actual interactive/focusable element, not a wrapping `<div>`) gets a matching `aria-describedby`, wired eagerly on connect — a keyboard user tabbing to the trigger doesn't have to wait out the hover `delay` to get an accessible description. An existing `aria-describedby` on the trigger is appended to, not overwritten.

**Default (`dark`) flavor is theme-independent by design** — a fixed dark chip in both light and dark pages (matches Material/Bootstrap/Ant/Shoelace), so it always pops regardless of what it's sitting on. Colors come from `--ty-tooltip-bg` / `--ty-tooltip-color` / `--ty-tooltip-border`, defined once on `:root` (not redeclared per theme) — override them globally, or per instance with `<ty-tooltip style="--ty-tooltip-bg: #000">`. `light`/`info`/custom flavors are unaffected and still theme-adaptive.

---

### ty-popup

Attrs: `manual`, `disable-close`, `placement` (default `'bottom'` — see [Placement](#placement)), `offset` (8).

**Methods:** `show()`, `hide()`

Nest as child of the trigger: `<button>Click me<ty-popup>...</ty-popup></button>`. Unless `manual`, the trigger automatically gets `aria-haspopup="dialog"` and a live `aria-expanded` (the popup itself is a real `<dialog>` via `showModal()`, so it already has `role="dialog"` + focus-trap for free).

---

### Placement

Shared by `ty-popup`, `ty-tooltip`, `ty-select` and `ty-date-picker`. A placement is a **side** plus an optional **cross-axis alignment**:

```
<side>            centered on the anchor
<side>-start      leading edges flush
<side>-end        trailing edges flush
```

Twelve values in total — `top` `top-start` `top-end`, `right` `right-start` `right-end`, `bottom` `bottom-start` `bottom-end`, `left` `left-start` `left-end`.

For **top/bottom** the alignment runs horizontally (`-start` = left edges flush, `-end` = right edges flush). For **left/right** it runs vertically (`-start` = top edges flush, `-end` = bottom edges flush).

```html
<ty-button>Menu
  <ty-popup placement="bottom-start">…</ty-popup>   <!-- below, left edges flush -->
</ty-button>

<ty-button>Help
  <ty-tooltip placement="right-start">…</ty-tooltip> <!-- right, top edges flush -->
</ty-button>
```

**Auto-flip keeps your alignment.** When the requested side has no room, the fallback order exhausts that side, then flips to the *opposite* side with the alignment intact, and only then tries the perpendicular axis. So `left-start` becomes `right-start` — still top-aligned — long before it becomes `bottom`.

**Dropdowns are vertical-only.** `ty-select` and `ty-date-picker` open above or below their trigger, so they accept `bottom*` / `top*` directly; a `left-*` / `right-*` value keeps its alignment but leaves the side automatic. Both still flip rather than clip.

```html
<ty-select placement="bottom-end">…</ty-select>
<ty-date-picker placement="top-start"></ty-date-picker>
```

`ty-select` also keeps its older `align` attribute (`start` | `center` | `end`) for horizontal anchoring alone; `placement` wins when both are set.

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
<!-- tyrell.css alone has no color tokens. tyrell-theme.css supplies them via
     auto-contrast text, seed-based rebranding, named/scoped themes, animated
     theme transitions. See CSS_GUIDE.md → Color Customization. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell-theme.css">
```

Don't want the theme engine? Swap `tyrell-theme.css` for `tyrell-colors-static.css` — a plain hardcoded hex fallback palette, maximum-compatibility (no relative-color-syntax requirement, works on older browsers), no theming API. Use it only if you've made that trade-off deliberately.

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
| `ty-file-upload` | `change` | `{ value: File[], files: File[], names: string[] }` |
| `ty-calendar` | `change` | `{ year, month, day, action, source, dayContext }` |
| `ty-tabs` | `ty-tab-change` | `{ activeId, activeIndex, previousId, previousIndex }` |
| `ty-wizard` | `ty-wizard-step-change` | `{ activeId, activeIndex, previousId, previousIndex, direction }` |
| `ty-modal` | `close` | `{ reason, returnValue? }` |
| `ty-tag` | `dismiss` | -- |
| `ty-button` | `click` | `{ originalEvent }` |

Always access via `event.detail.value`, never `event.target.value`.
