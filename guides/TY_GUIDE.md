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
ty-tab          (default: panel) | slot="loading" | slot="error" (lazy tabs)
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

Any other string is a **custom flavor**. Easiest: one seed color (`--ty-X-seed: #784011`) plus a once-pasted engine block from the Theming page's flavor builder, and the flavor follows the dials and dark mode like a built-in. Or hand-pick the 16 `--ty-color-X` / `--ty-bg-X` / `--ty-solid-X` tokens. Either way the component themes itself, `+`/`-` shades included. Every flavored component supports this (`ty-button`, `ty-tag`, `ty-switch`, `ty-radio-group`, `ty-checkbox`, `ty-input`, `ty-select`, `ty-date-picker`, `ty-copy`, `ty-tooltip`, `ty-calendar`); missing tokens degrade to neutral. See [CSS_GUIDE.md → Custom Flavors](./CSS_GUIDE.md#custom-flavors-add-your-own).

---

## Child Elements

| Parent | Children | Example |
|--------|----------|---------|
| `ty-select` | `<ty-option>` (rich HTML; `label` attr = clean display text) | `<ty-option value="us">US</ty-option>` |
| `ty-selected-options` | optional `<template>` with `{value}`/`{label}`/`{flavor}`/`{data-*}` placeholders | `<template><ty-tag flavor="{flavor}">{label}</ty-tag></template>` |

---

## Forms and validation

Put fields in a real `<form>` and validation needs no code, in any framework. The browser validates before `submit` fires, so React `onSubmit`, Vue `@submit.prevent`, Svelte `on:submit`, htmx `hx-post` and Datastar `data-on:submit__prevent` only run when every field passes.

```html
<form>
  <ty-input name="email" label="Email" type="email" required></ty-input>
  <ty-select name="robot" label="Robot" required>…</ty-select>
  <ty-date-picker name="day" label="Day" native required></ty-date-picker>
  <ty-button flavor="primary">Send</ty-button>
</form>
```

- **Where messages show.** Fields with their own error line: `ty-input`, `ty-textarea`, `ty-select`, `ty-date-picker`, `ty-radio-group`, `ty-file-upload`. The message goes under the field, no browser bubble. `ty-checkbox`, `ty-switch` and `ty-calendar` have none, so the browser shows its bubble.
- **When.** On a submit, on `reportValidity()` and on `checkValidity()` (the field's or its form's). A field the user edited also shows its message when it loses focus. That message waits until the click or tap that moved focus has finished, so the button below the field doesn't move under the pointer; on touch it shows at most about 1 s after a press that never becomes a click (a long press or a drag). `ty-select` shows it as soon as a user change leaves it empty. `ty-date-picker` shows it after a user change (pick, clear, time edit); an untouched picker shows nothing on blur, by design. A shown message clears as soon as the value is valid. For a check that shows nothing, read `field.validity.valid` or `form.matches(':invalid')`.
- **Focus.** A submit button click, Enter in a single-line field, `form.requestSubmit()` and `form.reportValidity()` focus the first invalid field in form order, like a native form, also when error-line fields and bubble fields (`ty-checkbox`, `ty-switch`, native inputs) are mixed. Disabled fields and fields that are not shown (`display: none`, `visibility: hidden`, an inactive `ty-wizard` step) are skipped. Only `checkValidity()` never moves focus. Enter in a textarea or contenteditable, or Enter that confirms IME input, is not a submit. Forms inside a shadow root (Lit, Stencil) work the same. Every field's `focus()` reaches its interactive element.
- **Your own `error`.** Server-side errors go in `error` (Datastar: `data-attr:error="$errors.email"`). Once you set `error`, validation never overwrites or removes it: not on blur, submit or `reportValidity()`, not when the field becomes valid, not on `form.reset()`. The field still blocks the form while a rule fails. Set `error` to `''` to let validation messages show again. Messages that validation wrote itself are cleared when the field becomes valid or the form is reset.
- **Reset.** `form.reset()` restores values from their attributes and clears every message validation wrote (after a submit, a blur after editing, or `reportValidity()`). Fields count as untouched again. Your `error` stays, and `setCustomValidity()` is not cleared, same as native.
- **Validate without submitting** (a wizard's Next): `form.reportValidity()` or `field.reportValidity()` (needs a ref).
- **Empty values** submit what native controls do: input, textarea, single select and date picker `name=`, file upload an empty file, unchecked checkbox/switch and unpicked radio group nothing.

---

## Components Reference

### ty-button

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `flavor` | string | `'neutral'` | Built-in: `primary` \| `success` \| `danger` \| `warning` \| `neutral`. Append `+` for stronger or `-` for softer shade (e.g. `"primary+"`, `"danger-"`). Any other string is a custom flavor: define `--ty-solid-X`(`-fg/-hover/...`), `--ty-color-X-*`, `--ty-bg-X-soft` tokens and it themes like a built-in (missing tokens fall back to neutral); `--ty-button-*` variables still override per instance. `ty-tag` works the same way via `--ty-bg-X` / `--ty-color-X` / `--ty-border-X`. |
| `appearance` | string | `'solid'` | `solid` (saturated brand fill) \| `outlined` (transparent bg, text === border) \| `ghost` (text only with hover bg) |
| `size` | string | `'sm'` | `xs` \| `sm` \| `md` \| `lg` \| `xl` — 24/28/32/36/40px |
| `type` | string | `'submit'` | `button` \| `submit` \| `reset` |
| `name` / `value` | string | - | Sent with the form only when this button submits it |
| `form` | string | - | `id` of the form to submit or reset when the button sits outside it |
| `disabled` | boolean | `false` | Also set by an ancestor `<fieldset disabled>`; the host then matches `:disabled` (its own `disabled` property doesn't change) |
| `loading` | boolean | `false` | Spinner, width kept, clicks blocked, `aria-busy` + `aria-disabled`; stays focusable |
| `pill` | boolean | `false` | Rounded ends. A round icon-only button is `action pill`; a plain `pill` with only an icon is not made round |
| `action` | boolean | `false` | Square icon-only button |
| `wide` | boolean | `false` | Fills a flex row; keeps its rung height |
| `muted` | boolean | `false` | Desaturates the flavor to neutral at rest; reveals real color on hover (pointer only, gated via `(hover: hover)`) and on `:active`/`:focus-visible` so touch still gets it on tap. Works across all three appearances and respects `+`/`-` tone. |

**Slots:** `start`, (default), `end` | **Events:** `click` -> `{ originalEvent }`, cancelable

**Clicks and forms:** `click` fires once per press, before the default action, for bubbling listeners (React `onClick`). `preventDefault()` cancels the submit/reset, as with a native button. A submit goes through `form.requestSubmit()`, so validation runs and the form's `submit` event is the browser's own. No `click` while disabled, loading or inside a disabled fieldset. Capture-phase listeners above the button also see the browser's native click on the way in, so put button logic in bubbling listeners. `tyButton.click()`, a wrapping `<label>` and Testing Library `fireEvent.click(tyButton)` act like a real press: `click`, then submit/reset. Enter in a `ty-input` doesn't submit through a loading or disabled button; a native `<input>` in the same form follows the browser's own implicit submission, which doesn't see `ty-button`.

To show a spinner while saving, set `loading` in the click handler: that press still submits, and later presses are blocked until you clear `loading`.

**Sizing:** buttons run a 24-40px 4px ladder, sharing its top three steps with the fields' 32/36/40px ladder. Pairing with a field: **alongside** in a row, field `sm`/`md`/`lg` match button `md`/`lg`/`xl` exactly (32/36/40); **embedded** in a field's `end` slot, use the **same** size name — it nests with a consistent ~4px margin. See [CSS_GUIDE.md → Component Sizing](./CSS_GUIDE.md#component-sizing).

**Custom colors:** override per button with `--ty-button-bg`, `--ty-button-bg-hover`, `--ty-button-color`, `--ty-button-border`. See [CSS_GUIDE.md → Per-Component Color Overrides](./CSS_GUIDE.md#per-component-color-overrides).

**Custom sizing.** The control (the `<button>` inside the shadow root) fills
whatever box the host gets: `width`, `height` or `min-height` on `ty-button`, a
flex column or a grid cell stretching it. So a button that is a direct child of
a flex column spans its full width; add `align-self: start` (Tailwind
`self-start`) to keep it at its label width. Exceptions:

- A flex or grid **row** doesn't stretch it to a taller neighbor. To opt in,
  set `height: auto` on the host (Tailwind `h-auto`).
- A `wide` button keeps its rung height, element included, also in a flex
  column with room to spare. A height on it or on its `::part(button)` is
  ignored; make it taller with `size` or the dials below.
- An `action` button stays square: a height or a width alone gives a bigger
  square.

To change the rung itself, use the size dials:

```css
ty-button.tap {
  --ty-button-height: 44px;      /* control height (24/28/32/36/40 by rung) */
  --ty-button-min-width: 0;      /* default 4rem; ignored by [action] */
  --ty-button-pad-x: 12px;
  --ty-button-pad-y: 0;
  --ty-button-font: 0.875rem;
  --ty-button-leading: 20px;
  --ty-button-tracking: 0;
  --ty-button-gap: 8px;
  --ty-button-action-size: 44px;  /* [action] square box */
  --ty-button-action-icon: 20px;  /* icon inside it */
}
```

`::part(button)` reaches the control for anything the dials don't cover. Leave
its `min-height` alone: that is how the control fills a taller host, so
`::part(button) { min-height: 44px }` leaves a dead strip under the control in
a host taller than 44px. A `::part(button)` height below the rung is raised to
the rung; use `--ty-button-height` to go smaller.

> **Touch targets:** the ladder tops out at 40px, below iOS's 44pt and
> Material's 48dp. Phone-facing UIs should raise `xs`/`sm` themselves —
> `--ty-button-height` under a `(pointer: coarse)` media query is the
> straightforward way — and give the fields beside them the same floor via
> `--ty-field-height`, or rows stop sitting flush.

---

### ty-input

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `'text'` | `text` \| `email` \| `password` \| `number` \| `tel` \| `url` \| `currency` \| `percent` \| `compact` |
| `value` | string | `''` | |
| `name` | string | - | Form name |
| `placeholder` | string | - | |
| `label` | string | - | Built-in label |
| `error` | string | - | Message under the field; `''` clears it. While it is set, the field looks like `flavor="danger"` on a red tint, whatever its flavor. When it clears, your flavor's look comes back. `flavor` keeps what you set, so `[flavor="danger"]` doesn't match a field that only has an error |
| `disabled` | boolean | `false` | |
| `required` | boolean | `false` | |
| `pattern` | string | | Regex the whole value must match (text types) → `patternMismatch` |
| `minlength` / `maxlength` | number | | Character limits (text types) → `tooShort` / `tooLong`; typing stops at `maxlength` |
| `min` / `max` | number | | Numeric bounds for `number`, `currency`, `percent`, `compact` → `rangeUnderflow` / `rangeOverflow` |
| `too-short-message` / `too-long-message` | string | | Wording for the length messages; `{minlength}` `{maxlength}` `{length}` are filled in. Without it, too-short is the browser's own (localized) for typed text, like every other message |
| `size` | string | `'md'` | `sm` \| `md` \| `lg` (legacy `xs`/`xl` coerce to `sm`/`lg`) — see [CSS_GUIDE.md → Component Sizing](./CSS_GUIDE.md#component-sizing) |
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor from `--ty-color-X` tokens. Colors the border + focus ring; per-instance override via `--input-accent` / `--input-accent-bold` / `--input-ring`. |
| `currency` | string | `'USD'` | ISO 4217 code (for `type="currency"`) |
| `locale` | string | `'en-US'` | Locale for numeric formatting |
| `precision` | number | - | Decimal places |
| `debounce` | number | `0` | Debounce ms (0-5000) |

**Slots:** `start`, `end` | **Events:** `input`, `change` -> `{ value, formattedValue, rawValue, originalEvent }` | `focus`, `blur`

**Forms and validation:** the rules above block the form and show their message under the field, with no code. See [Forms and validation](#forms-and-validation).

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
| `required` | boolean | `false` | Unchecked blocks submit; the browser shows its own bubble |
| `size` | string | `'sm'` | `xs` \| `sm` \| `md` \| `lg` \| `xl` |
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor from `--ty-color-X` tokens. Per-instance override via `--checkbox-color` / `--checkbox-color-off`. |

**Slots:** none | **Events:** `input`, `change` -> `{ value, checked, formValue, originalEvent }`

Just the box: no label text, no error line. Wrap it in a `<label>`, so the whole line toggles it and names it for screen readers.

```html
<label><ty-checkbox name="terms" required></ty-checkbox> Accept the terms</label>
```

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
| `minlength` / `maxlength` | number | - | Character limits → `tooShort` / `tooLong`; typing stops at `maxlength`. An empty value only fails `required` |
| `too-short-message` / `too-long-message` | string | - | Wording for the length messages; `{minlength}` `{maxlength}` `{length}` are filled in. Defaults: "Use at least {minlength} characters (now {length})" / "Use at most {maxlength} characters (now {length})". After the user types, too-short is the browser's own unless `too-short-message` is set |
| `size` | string | `'md'` | |
| `rows` | string | `'3'` | |
| `resize` | string | `'none'` | `none` \| `both` \| `horizontal` \| `vertical` |
| `min-height` | string | - | |
| `max-height` | string | - | |

**Properties:** `minLength` / `maxLength` (number, `-1` when unset; a negative value removes the rule), `tooShortMessage`, `tooLongMessage`.

**Events:** `input`, `change` -> `{ value, originalEvent }`. `input` fires once per edit; `change` on blur, if the value changed, like native.

```html
<ty-textarea name="bio" label="Bio" minlength="20" maxlength="500"
  too-short-message="At least {minlength} characters ({length} so far)"></ty-textarea>
```

---

### ty-copy

Also registered as **`ty-copy-field`** — same element, descriptive name.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | - | Text to copy |
| `label` | string | - | |
| `format` | string | `'text'` | `text` \| `code` |
| `multiline` | boolean | `false` | Wrap and show the full value instead of one ellipsized line. Scrolls vertically past 200px; the copy button pins to the top-right. |
| `horizontal-scroll` | boolean | `false` | Scroll long content sideways instead of clipping with an ellipsis. Combine with `multiline` for code blocks that keep their line breaks and scroll on both axes. |
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor. Colors the copy button + hover tint; per-instance override via `--copy-color` / `--copy-color-hover` / `--copy-bg-hover`. |
| `disabled` | boolean | `false` | |

**The default is one ellipsized line** — ty-copy is a compact field, so a long
value is clipped rather than allowed to grow the layout. Opt into `multiline`
or `horizontal-scroll` when the whole value has to be readable.

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
| `placeholder` | string | `'Drop files here or click to browse'` | Hint inside the drop zone, shown as plain text |
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
| `selected-label` | string | `'Selected'` | Mobile dialog only: heading of the pinned selection strip; the count is appended (`Selected (3)`) |
| `available-label` | string | `'Available'` | Mobile dialog only: heading of the option list; counts what's still on offer (excludes selected, `hidden` and searched-out options) |
| `not-searchable` | boolean | `false` | Drop the popup search row. A select is searchable by default; this is the single opt-out — bare presence attribute, like `disabled`. Can't override `external-search`/`allow-create`, where the input is the only way to type a query |
| `external-search` | boolean | `false` | Delegate filtering: emits debounced `search` events; replace the option children in response |
| `allow-create` | boolean | `false` | Enter on unmatched search text mints a new `<ty-option>` and selects it. Exact match (value or label, case-insensitive) selects the existing option instead of duplicating. Single: replaces selection, closes. Multiple: appends, clears search, stays open (tags-input pattern). Fires the cancelable `create` event first — see below |
| `create-transform` | string | `'none'` | `'slug'`: normalizes the **value** allow-create mints (lowercase, spaces → `_`, strips non-alphanumeric). The display label is always kept verbatim regardless |
| `debounce` | number | `0` | Search event debounce (0-5000ms) |
| `loading` | boolean | `false` | Spinner in the options area (external search in flight) |
| `disabled` / `readonly` / `required` | boolean | `false` | |
| `error` | string | `''` | Message under the field; `''` clears it. While it is set, the select looks the same as `ty-input` with an `error`. Validation also writes it (submit, `reportValidity()`, `checkValidity()`) and clears it once the select is valid |
| `size` | string | `'md'` | `sm` \| `md` \| `lg` — shares the field height ladder with `ty-input`/`ty-date-picker` (legacy `xs`/`xl` coerce to `sm`/`lg`); see [CSS_GUIDE.md → Component Sizing](./CSS_GUIDE.md#component-sizing) |
| `placement` | string | - | Popup side + cross-axis alignment — `bottom-start`, `top-end`, … See [Placement](#placement). Vertical-only: `left-*`/`right-*` keep their alignment but leave the side automatic. Takes precedence over `align` |
| `align` | string | `'start'` | Horizontal popup anchor only: `'start'` (trigger's left edge), `'center'`, or `'end'` (trigger's right edge) — clamped into the viewport either way. Useful with `slot="trigger"` when the custom trigger sits near the right edge of its container. Prefer `placement` for new markup |
| `no-clear` | boolean | `false` | No built-in × clear button. Normally it sits in the default/compact trigger, shown once something is selected. Not shown with `slot="trigger"` (lives in the slot's fallback content, same mechanism that already hides the chevron there) — call the `clear()` method instead. Suppressed while `disabled`/`readonly`. |
| `flavor` | string | `'neutral'` | Built-ins, `+`/`-` shades, or a custom flavor from `--ty-color-X` tokens. Colors the field border + hover, and adds a focus ring while the dropdown is open; per-instance override via `--select-accent` / `--select-accent-bold` / `--select-ring`. |

**Children:** `<ty-option>` — supports rich HTML content; a `label` attribute (native `<option label>` semantics) provides clean display text for summaries/chips; `data-*` attributes feed `ty-selected-options` templates.

**Single-select display:** the selected option is **cloned into the trigger** (rich HTML intact — icons, prices, flags).

**Methods:** `clear()` — empties the entire selection and fires `change` (`action: 'clear'`); no-op if nothing is selected. It shows no validation message, so it's safe for resetting a form in code (the built-in × does show it). Works regardless of `no-clear`/skin, so `slot="trigger"` consumers can wire their own clear icon's click handler to it directly. `deselectValue(value)` — removes one value and fires `change` (`action: 'remove'`); used internally by `ty-selected-options` chip dismissal.

**Slots:** `start` / `end` (adornments), `trigger` (replaces field/compact chrome entirely; behavior/form/ARIA stay), `loading` | **Events:** `change` -> `{ value, values, items: [{value,label,flavor}], action, item }` (`value` scalar for single, array for multiple; `action` is `'set' | 'add' | 'remove' | 'clear' | 'create'` — `'clear'` from the clear button or `clear()`, `'create'` when allow-create minted the option) | `search` -> `{ query, element }` | `open` / `close` | `create` -> `{ value, label }` — **cancelable**: mutate `detail.value` to change the id that gets created (e.g. slugify it yourself), or `preventDefault()` to create the option yourself (e.g. after a server round-trip)

**Companion:** `<ty-selected-options for="id">` renders the selection as dismissible chips anywhere in the layout. Each chip is the option's own content (a rich option makes a rich chip); `label` on the option makes it plain text. Optional `<template>` child with `{value}` `{label}` `{flavor}` `{data-*}` placeholders for custom chip markup. Also registered as **`ty-selected-tags`** — original tag name, kept working indefinitely.

**Full keyboard + ARIA combobox pattern:** the field is in the tab order (`tabindex="0"`; `-1` when `disabled`) and carries `role="combobox"` / `aria-haspopup="listbox"` / `aria-expanded` / `aria-controls` (the popup's `role="listbox"`, `aria-multiselectable` when `multiple`) / `aria-labelledby` (when `label` is set — the visible label text, programmatically associated, not just nearby). Each `<ty-option>` gets `role="option"` + a live `aria-selected`. `Enter`/`Space`/`ArrowDown` open the closed, focused field — not just a mouse click. With an `error` set, the combobox has `aria-invalid="true"` and `aria-describedby` pointing at the error line. `focus()` on a disabled select does nothing. The list's keys work inside `ty-popup` and `ty-modal`; Escape closes the list and returns focus to the select.

**In a form, no JS needed:**

```html
<form>
  <ty-select name="robot" label="Robot" required>…</ty-select>
  <button>Send</button>
</form>
```

On Send, the browser's message for a native `<select>` appears under the field and the trigger takes focus. A user change that leaves it empty shows the message at once; setting the value in code does not.

**Error line under a custom trigger:** compact and `slot="trigger"` selects show the error line under the trigger. It wraps at a readable width (about 20em), can extend past a narrow trigger, and doesn't widen the host; under a slotted trigger it starts at the trigger's left edge. A slotted trigger keeps its own look (no danger border) and gets `aria-invalid="true"` plus `aria-description` holding the message, both removed when the error clears. Focus from validation lands on the slotted trigger; when the trigger can't take focus (a `<span>`), on the select's own field.

**Custom colors:** uses the shared `--ty-input-*` variable family — override per select with `--ty-input-bg`, `--ty-input-border`, `--ty-input-border-focus`, `--ty-input-shadow-focus`, etc. See [CSS_GUIDE.md → Per-Component Color Overrides](./CSS_GUIDE.md#per-component-color-overrides).

---

### ty-option

Rich HTML option for `<ty-select>`. Attrs: `value`, `label` (clean display text — native `<option label>` semantics), `selected`, `disabled`, `hidden` (not offered: left out of the list, the arrow keys and the search, but it can still be the value, like `<option hidden>`). The select sets `highlighted` and `filtered-out` (left out by the search) itself. Default slot for content; `data-*` attributes feed `ty-selected-options` chip templates.

---

### ty-tag

The pill/**chip** component (Material's "chip" == Tyrell's tag).

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `flavor` | string | `'neutral'` | Built-ins plus `+`/`-` shades, same as ty-button. Custom flavor `X` themes from `--ty-bg-X` / `--ty-color-X` / `--ty-border-X` tokens; `ty-tag[flavor="X"] { --tag-bg: ...; --tag-color: ...; --tag-border-color: ...; }` still overrides. |
| `size` | string | `'md'` | |
| `value` | string | - | |
| `selected` | boolean | `false` | |
| `no-pill` | boolean | `false` | Square corners instead of fully rounded |
| `clickable` | boolean | `false` | |
| `dismissible` | boolean | `false` | |
| `disabled` | boolean | `false` | |

**Slots:** `start`, (default), `end` | **Events:** `click`, `dismiss`

---

### ty-tabs / ty-tab

**ty-tabs:** `width` (default `'100%'`), `height` (required), `active` (tab id), `placement` (`top` | `bottom`), `fixed` (presence boolean)

By default tabs are **scrollable**: each button keeps its natural width (floored at `min-width: 72px` via `--ty-tab-min-width`) and never squeezes — the bar scrolls instead, with a `…` jump menu, once they no longer fit. `fixed` divides the bar equally between the tabs instead: no floor, no overflow, no jump menu, labels ellipsize if squeezed.

**Use `fixed` for 2–5 tabs.** Equal shares only read as tabs while each share fits its label — split a bar between 17 and every one becomes an ellipsis. Rough check: if *widest label × tab count* exceeds the narrowest width you support, stay on the scrollable default and let the `…` menu carry the rest. Keep it off for open-ended or user-generated tab sets.

**ty-tab:** `id` (required), `label` (required), `lazy` (presence boolean)

**Slots:** `label-{id}` (rich label), `marker` (active indicator); on a lazy `ty-tab`: `loading`, `error`

**Events:** `ty-tab-change` -> `{ activeId, activeIndex, previousId, previousIndex }`; `ty-tab-load` -> `{ id, index }` (fired on the ty-tab, doesn't bubble)

**ARIA:** full tab pattern — `role="tablist"` / `role="tab"` (+ `aria-selected`) on the buttons; each `<ty-tab>`'s panel is a `tabpanel` named after its label. Role and name sit inside the ty-tab's shadow root, not on the element, so a server morph can't strip them; hidden panels are `inert`. No `aria-controls` / `aria-labelledby`: buttons live in shadow DOM, panels in light DOM, and ARIA id-references don't cross that boundary.

**Server morphs (Datastar, htmx/idiomorph):** re-rendering `ty-tabs` keeps the shown tab, size and panel visibility — no `data-preserve-attr` needed. `active` is a request: a morph that sends a different `active` switches to it (and fires `ty-tab-change`); one that omits it keeps the current tab. Read the shown tab from the `activeTab` property.

**Lazy tabs:** a `lazy` ty-tab with no content fires `ty-tab-load` when it's shown, after `ty-tab-change`. The event doesn't bubble, so a lazy tab nested in another one never triggers the outer tab's listener; listen on the tab, or on `ty-tabs` with `{ capture: true }`. The tab shown first never fires: render its content with the page. Until content arrives the tab shows a spinner (`setLoaderSvg()` changes it) or your `slot="loading"`, fading in after 150ms so fast loads don't flash it; the panel is `aria-busy`. Switching away and back while it loads doesn't fire again. If loading fails, call `tab.loadFailed()`: the tab shows `slot="error"` (default "Couldn't load.") and a Retry button (`::part(retry)`). Retry, or showing the tab again, fires `ty-tab-load` once more. ty-tab doesn't watch htmx or Datastar requests: report failures yourself. Content that goes away again (a morph with the server's empty tab) loads again: at once if the tab is shown, otherwise when it's next shown.

```html
<ty-tab id="reports" label="Reports" lazy>
  <div slot="loading">Loading reports…</div>      <!-- optional -->
  <span slot="error">Couldn't load reports.</span> <!-- optional -->
</ty-tab>
<script>
  tabs.addEventListener('ty-tab-load', async (e) => {
    const res = await fetch(`/tabs/${e.detail.id}`).catch(() => null);
    if (res?.ok) e.target.innerHTML = await res.text();
    else e.target.loadFailed();
  }, { capture: true });
</script>
```

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
--ty-tab-min-width             /* 72px — scrollable tab button floor; ignored by `fixed` */
--ty-tabs-separator            /* line between bar and panel; transparent removes it */
--ty-tabs-transition-duration  /* marker glide + carousel slide 300ms, panel fade 400ms; setting it applies to all three */
--ty-tabs-transition-easing    /* ease-in-out */
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

Attrs: `value` (sets selection *and* the displayed month; reflects to `year`/`month`/`day`. Reads what `ty-date-picker` reads: `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm[:ss]`, an ISO instant with `Z`/offset, and as a property epoch ms or a `Date`; an instant is its local day. The value, `change` and form value are always `YYYY-MM-DD`, so `calendar.value = picker.value` needs no conversion), `year`, `month`, `day`, `name`, `required` (empty blocks the form), `min`, `max` (`YYYY-MM-DD` or an instant's local day — out-of-bounds days disabled, navigation clamped), `flavor` (default `'primary'` — built-ins, `+`/`-` shades, or a custom flavor; colors the selected/today day in the nested `ty-calendar-month`, navigation stays neutral chrome), `locale` (day and month names; unset, the nearest `lang`, then the browser's language). Property: `dayContentFn`.

**Events:** `change` -> `{ year, month, day, action, source, dayContext }` | `navigate` -> `{ month, year, action, source }`

**Form value:** ISO date `YYYY-MM-DD`. On a submit that `required`, `min` or `max` fails, the day grid takes the focus and the browser shows its bubble there.

**Keyboard + ARIA:** the day grid (in the nested `ty-calendar-month`) is a real WAI-ARIA grid — `role="grid"`/`row`/`columnheader`/`gridcell`, with roving `tabindex` (exactly one day is in the tab order at a time; arrow keys move it — `←`/`→` by a day, `↑`/`↓` by a week — and `Enter`/`Space` select; focus stays on the picked day). Disabled (out-of-`min`/`max`) days are excluded from the roving set. Each day's `aria-label` is a full readable date (e.g. "Wednesday, July 15, 2026"), not just the visible number.

---

### ty-date-picker

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | - | Reads `YYYY-MM-DD` (that day), `YYYY-MM-DDTHH:mm[:ss]` (local wall-clock, kept as written) or an ISO instant with `Z`/offset (its local day and time). The property also takes a `Date` or epoch milliseconds. Holds what the form submits (see Form value); `null` when empty |
| `name` | string | - | |
| `label` | string | - | |
| `placeholder` | string | - | |
| `error` | string | - | Message under the field. While it is set, the picker looks the same as `ty-input` with an `error`, and its calendar opens in danger. Validation messages (`required`) show here |
| `with-time` | boolean | `false` | Hours and minutes under the calendar; the value includes the time. Turning it on or off keeps the picked day and time and rewrites the value in the new shape |
| `native` | boolean | `false` | Submit wall-clock values like `<input type="date">` / `<input type="datetime-local">`: `2026-10-16`, or `2026-10-16T14:30` with `with-time` (seconds only when they're not zero), instead of a UTC instant |
| `min` | string | - | Earliest selectable date (ISO `YYYY-MM-DD`) |
| `max` | string | - | Latest selectable date (ISO `YYYY-MM-DD`) |
| `disabled` | boolean | `false` | |
| `required` | boolean | `false` | |
| `locale` | string | `'en-US'` | |
| `size` | string | `'md'` | |
| `placement` | string | - | Calendar popup side + cross-axis alignment — `bottom-start`, `top-end`, … See [Placement](#placement). Vertical-only: `left-*`/`right-*` keep their alignment but leave the side automatic |
| `no-clear` | boolean | `false` | No built-in × clear button. Normally it shows in the stub once a date is selected, except while `disabled`. |
| `flavor` | string | `'default'` | Built-ins, `+`/`-` shades, or a custom flavor. Colors the stub border + focus ring (override via `--date-picker-accent` / `--date-picker-accent-bold` / `--date-picker-ring`) and the popup calendar's selected/today day (forwarded to the nested `ty-calendar`). |

**Methods:** `clear()` — clears the value programmatically and fires `change` (`detail.source: 'clear'`); works regardless of `no-clear`, for any external trigger that wants to clear the field without the built-in button.

**Events:** `change` -> `{ value, localValue, milliseconds, formatted, source }` (`source` is `'selection' | 'time-change' | 'clear' | 'external'`). `value` is what the form submits. `localValue` is local wall-clock (`YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with time). `milliseconds` is epoch ms (date-only: when the day starts locally).

**Form value**, by default a UTC ISO instant. With `with-time`, the picked moment (`2026-10-16T12:30:00.000Z` for 14:30 in Zagreb). Date-only, the moment the picked day starts in the browser's timezone (Oct 16 in Zagreb → `2026-10-15T22:00:00.000Z`; Oct 26, after the clocks change, → `2026-10-25T23:00:00.000Z`). With `native`: `2026-10-16` / `2026-10-16T14:30`. Empty: `.value` and `detail.value` are `null`; the form submits `name=` like a native date input (before this release, an empty picker was left out of the form data). `.value`, the form data and `change` `detail.value` are always the same string.

```html
<ty-date-picker name="day" value="2026-10-16"></ty-date-picker>
<!-- day=2026-10-15T22:00:00.000Z in Zagreb -->
<ty-date-picker name="day" native value="2026-10-16"></ty-date-picker>
<!-- day=2026-10-16 -->
<ty-date-picker name="at" native with-time value="2026-10-16T14:30"></ty-date-picker>
<!-- at=2026-10-16T14:30 -->
```

**Validation:** `required` shows its message in the error line after a user change (pick, clear, time edit), on submit, on `reportValidity()` and on `checkValidity()` (the field's or its form's). An untouched picker shows nothing on blur, by design. See [Forms and validation](#forms-and-validation).

**Keyboard + ARIA:** the field is in the tab order (`tabindex="0"`; `-1` when `disabled`) and carries `role="button"` (it's a trigger, not editable text) / `aria-haspopup="dialog"` / `aria-expanded` / `aria-labelledby` (when `label` is set). `Enter`/`Space` open the closed, focused field, not just a mouse click. The popup itself is a native `<dialog>` opened via `showModal()`, so it already gets `role="dialog"` + focus-trap semantics from the browser for free. With `error`, the field is `aria-describedby` the error line. Enter or Space on the focused × clears the value. Focus stays on the field when it redraws (an `error` set or cleared, a new value, a clear), and returns to it after a pick or Escape, also inside `ty-modal`. `focus()` does nothing while disabled.

---

### ty-modal

Also registered as **`ty-dialog`** — same element, platform/ARIA name (wraps native `<dialog>`).

Attrs: `open`, **`no-backdrop`**, **`no-zoom`**, **`prevent-escape`**, **`prevent-outside-click`** (presence booleans — see below). By default the page body scales down slightly while a modal is open, Vaul-style; the modal itself renders in the top layer and is unaffected. Set `no-zoom` if your app has `position: fixed` chrome, since a scaled body becomes its containing block. `no-backdrop` is still a modal, just without the dim: the page behind isn't usable, a click anywhere outside or Escape closes it, and it never zooms the page. `label` sets `aria-label` on the internal `<dialog>`. `<dialog>` gets `role="dialog"` for free, but nothing names it unless you set this (or wire your own `aria-labelledby` to a slotted heading yourself); unset is not a regression, just unlabeled, same as before.

**Guarding the close paths.** Closing on ESC and on backdrop click is the default, so the switches follow the HTML convention of naming the *deviation*, like `disabled`:

```html
<ty-modal prevent-outside-click>…</ty-modal>              <!-- backdrop click does nothing -->
<ty-modal prevent-escape prevent-outside-click>…</ty-modal> <!-- fully guarded -->
<ty-modal no-backdrop>…</ty-modal>                          <!-- no dim, still modal -->
```

Property mirrors `preventEscape` / `preventOutsideClick` take real booleans (true sets the attribute, false removes it). `prevent-escape` consumes the Escape *keydown*, so the browser's CloseWatcher anti-trap (which force-closes on a second consecutive ESC after one canceled close request) never engages; the Android back gesture deliberately remains force-closable as the last-resort escape hatch.

**Accessibility contract:** a fully guarded modal has no built-in ✕ (the ✕ follows the outside-click setting), so **you must render your own keyboard-reachable close control inside it** — otherwise it's a WCAG 2.1.2 keyboard trap in your app. ESC-closing is also the ARIA APG convention; reserve `prevent-escape` for real guards (unsaved changes, payment in flight), and prefer the gentler `beforeclose` + `hide({ force: true })` confirm pattern where a response to ESC is acceptable.

Events: `open`, `close`, **`beforeclose`** (cancellable). Listen to `beforeclose` and call `event.preventDefault()` to guard against unsaved-state dismissal. The detail contains `reason: 'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'` — `close` reports the same reason. Once your custom confirm UI captures consent, call `.hide({ force: true })` to bypass the event.

None of the three bubble, so a modal opened from inside another modal never trips the outer modal's listeners — and neither does a `ty-select` / `ty-date-picker` / `ty-popup` closing its own popup inside the modal. Attach listeners to the element itself.

**Popups inside a modal.** A popup opened inside a modal (a `ty-select` list, the `ty-date-picker` calendar, a `ty-popup`, a nested modal) closes first on Escape, and the next Escape closes the modal. With a `ty-select` in a `ty-popup` in a `ty-modal`, Escape closes the list, then the popup, then the modal; escaping a select list returns focus to the select. Closing the modal (`hide()`, removing `open`, removing it from the page) closes any popup still open inside it, also in content a wrapper component slots into the modal; their `aria-expanded` and scroll lock update at once. A nested `ty-modal`, with or without a backdrop, also closes when the outer one closes natively; it fires its own `close` with reason `'programmatic'` and releases its scroll lock. A modal removed with `open` still set and put back (a framework moving it) opens again as it was, without `close` or `open` events.

**Methods:** `show()`, `hide()` | **Events:** `close` -> `{ reason, returnValue? }`

Always render modals in DOM. Control with `open` attribute or `show()`/`hide()`.

---

### ty-tooltip

Attrs: `placement` (default `'top'` — see [Placement](#placement)), `offset` (8), `delay` (600ms), `disabled`, `flavor` (default `'neutral'`, alias `dark`). `primary`, `success`, `danger`, `warning` and custom flavors are solid fills from `--ty-solid-X` / `--ty-solid-X-fg`, with `+`/`-` shades.

Nest as child of target: `<ty-button>Hover<ty-tooltip>Help text</ty-tooltip></ty-button>`

**Content is real HTML**, not plain text — `<ty-tooltip><kbd>Ctrl+S</kbd> to save</ty-tooltip>` renders the `<kbd>` tag, not the literal text.

**Accessible by default:** the popover gets `role="tooltip"` and the trigger (`ty-tooltip`'s parent element — must be the actual interactive/focusable element, not a wrapping `<div>`) gets a matching `aria-describedby`, wired eagerly on connect — a keyboard user tabbing to the trigger doesn't have to wait out the hover `delay` to get an accessible description. An existing `aria-describedby` on the trigger is appended to, not overwritten.

**The default `neutral` chip is theme-independent by design** — a fixed dark chip in both light and dark pages (matches Material/Bootstrap/Ant/Shoelace), so it always pops regardless of what it's sitting on. Colors come from `--ty-tooltip-bg` / `--ty-tooltip-color` / `--ty-tooltip-border`, defined once on `:root` (not redeclared per theme) — override them globally, or per instance with `<ty-tooltip style="--ty-tooltip-bg: #000">`. The other flavors follow the theme. The popover lives in `<body>`, so define custom-flavor tokens on `:root`.

---

### ty-popup

Attrs: `manual`, `disable-close`, `placement` (default `'bottom'` — see [Placement](#placement)), `offset` (8).

**Methods:** `openPopup()`, `closePopup()`, `togglePopup()` | **Events:** `open`, `close` (don't bubble)

Nest as child of the trigger: `<button>Click me<ty-popup>...</ty-popup></button>`. Unless `manual`, the trigger automatically gets `aria-haspopup="dialog"` and a live `aria-expanded` (the popup itself is a real `<dialog>` via `showModal()`, so it already has `role="dialog"` + focus-trap for free).

**Opening.** Unless `manual`, a press on the trigger toggles the popup, and so do Enter or Space on the focused trigger and `trigger.click()`, for a native `<button>` and a `ty-button` alike. A `<label>` around a `ty-button` trigger opens it too; around a native `<button>` it doesn't in Chromium and Firefox. Clicks and keys inside the popup content don't toggle it. In a `ty-button` trigger they aren't presses of the button either: they don't submit its form, and listeners see the real target. The trigger's own press still submits, so give a `ty-button` trigger inside a form `type="button"`.

**Keys.** Opening moves focus into the popup: to an `[autofocus]` control in it, else the popup itself. Escape closes the popup unless `disable-close`. A `ty-select` list or `ty-date-picker` calendar open inside it takes its keys first: Escape closes that, the next Escape closes the popup.

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

**The geometry contract** (what you can rely on, identical for popup and tooltip): measurements are of the **visible surface**, never any internal shadow-room wrapper — on the chosen side there is an **8px gap** (the `offset` attribute) between trigger edge and surface edge, `-start`/`-end` put the aligned edges **exactly flush**, and no suffix **centers** the surface on the trigger. `ty-select` / `ty-date-picker` use the same 8px visual gap below/above their field.

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
| `no-shadow` | boolean | `false` | No top/bottom shadow indicators |
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

```clojure
(ns my-app.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

(icons/register! {:check lucide/check
                  :user  lucide/user})   ; the key is the name
```

```js
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, chevronDown } from 'tyrell-components/icons/lucide'

registerIcons({ check, 'action-down': chevronDown })  // the key is the name
```

```html
<ty-icon name="check" size="sm"></ty-icon>
```

Registry API on `window.tyIcons`: `register`, `has`, `get`, `list`, `cacheInfo`, `clearCache`.

Sets, tree-shaking, custom SVGs and troubleshooting: [ICONS_GUIDE.md](ICONS_GUIDE.md).

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

**Properties set before the definition loads.** A framework that binds properties (React 19, Vue) or lazy loading can set `value`, `error`, `open` and the like on a Ty element before its script has run. Every Ty element applies those when it connects, and later assignments work normally. The early value wins over the matching attribute; `form.reset()` still goes back to the attribute, as on a native field.

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
| `ty-date-picker` | `change` | `{ value, localValue, milliseconds, formatted, source }` |
| `ty-calendar` | `change` | `{ year, month, day, action, source, dayContext }` |
| `ty-tabs` | `ty-tab-change` | `{ activeId, activeIndex, previousId, previousIndex }` |
| `ty-tab` | `ty-tab-load` | `{ id, index }` (lazy tab shown with no content; doesn't bubble) |
| `ty-wizard` | `ty-wizard-step-change` | `{ activeId, activeIndex, previousId, previousIndex, direction }` |
| `ty-modal` | `close` | `{ reason, returnValue? }` |
| `ty-tag` | `dismiss` | -- |
| `ty-button` | `click` | `{ originalEvent }` (cancelable: `preventDefault()` cancels submit/reset) |

Always access via `event.detail.value`, never `event.target.value`.

**Bubbling:** `change` / `input` bubble like their native counterparts — delegation works. Popup lifecycle events (`open`, `close`, `beforeclose` on `ty-modal`, `ty-select`, `ty-date-picker`, `ty-popup`) **do not**, matching native `<dialog>`. Listen on the element itself; a container listener hears nothing, which is what keeps a dropdown closing inside a modal from closing the modal.
