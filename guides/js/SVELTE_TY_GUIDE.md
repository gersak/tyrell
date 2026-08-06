# Svelte + Tyrell Guide

Use Tyrell web components in Svelte 5 (and Svelte 4) natively — no wrapper package needed. Svelte has the cleanest custom-element story of any major framework: tags work as-is, events work via `on:event`, and reactivity flows through `bind:` and `$state` without ceremony.

For installation, subpath imports, and the side-effects model, see [JAVASCRIPT_GUIDE.md](./JAVASCRIPT_GUIDE.md).

## Setup

### 1. Install

```bash
npm install tyrell-components
```

### 2. Register components and CSS

In your app entry (`src/app.js`, `src/main.ts`, or a layout):

```js
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components/css/tyrell-theme.css' // auto-contrast, seed rebranding, themes — see TY_GUIDE.md#quick-start
import 'tyrell-components'   // or specific subpaths
```

That's it — Svelte's compiler does not need configuration to recognize custom elements. Any tag with a hyphen is treated as a custom element automatically.

## Native usage (Svelte 5)

```svelte
<script>
  let email = $state('')
  function submit() {
    console.log('submit:', email)
  }
</script>

<ty-input
  label="Email"
  type="email"
  value={email}
  onchange={(e) => email = e.detail.value}
/>
<ty-button flavor="primary" onclick={submit}>Submit</ty-button>
```

Svelte 5 uses standard DOM event handler attributes (`onclick`, `onchange`) — these work directly with custom events. Event payload lives on `e.detail`.

## Native usage (Svelte 4)

```svelte
<script>
  let email = ''
</script>

<ty-input
  label="Email"
  type="email"
  value={email}
  on:change={(e) => email = e.detail.value}
/>
<ty-button flavor="primary" on:click={() => console.log(email)}>
  Submit
</ty-button>
```

Svelte 4's `on:event` directive registers `addEventListener`. Payload still on `e.detail`.

## Attribute vs property

Svelte sets attributes by default. For boolean and complex values, use `prop:` to set the JS property explicitly:

```svelte
<!-- attribute (string only) -->
<ty-button disabled={isLoading}>Save</ty-button>

<!-- property (any type) -->
<ty-select multiple prop:value={selected}>
  {#each tags as t}
    <ty-option value={t}>{t}</ty-option>
  {/each}
</ty-select>
```

Rules of thumb:
- **Strings, simple booleans** — attributes are fine: `disabled`, `label="Email"`, `flavor="primary"`.
- **Arrays, objects, callbacks** — must use `prop:` (attributes serialize to strings).
- **Multi-select values when array** — `prop:value={[...]}` on `ty-select multiple`.

## Two-way binding

Svelte's `bind:value` works on web components for the `value` property:

```svelte
<script>
  let email = $state('')
</script>

<ty-input bind:value={email} label="Email" />
<p>You typed: {email}</p>
```

This is reactive in both directions — typing updates `email`, programmatically changing `email` updates the input.

For multiselect or any case where you need `event.detail.values` (plural), use explicit handlers:

```svelte
<script>
  let selected = $state([])
</script>

<ty-select
  multiple
  prop:value={selected}
  onchange={(e) => selected = e.detail.values}
>
  <ty-option value="apple">Apple</ty-option>
  <ty-option value="banana">Banana</ty-option>
  <ty-option value="cherry">Cherry</ty-option>
</ty-select>
```

## Composition with child elements

Slotted children work naturally — `{#each}` blocks render reactive options:

```svelte
<script>
  let country = $state('us')
  const countries = [
    { code: 'us', name: 'United States' },
    { code: 'uk', name: 'United Kingdom' },
    { code: 'fr', name: 'France' },
  ]
</script>

<ty-select
  label="Country"
  value={country}
  onchange={(e) => country = e.detail.value}
>
  {#each countries as c (c.code)}
    <ty-option value={c.code}>{c.name}</ty-option>
  {/each}
</ty-select>

<!-- ty-select: single by default,
     add `multiple` for multi-select ({e.detail.values} = array). -->
```

## Icons

Register at app startup:

```js
// src/app.js or src/main.ts
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components/css/tyrell-theme.css'
import 'tyrell-components'

import { registerIcons } from 'tyrell-components/icons/registry'
import { check, x, plus, search } from 'tyrell-components/icons/lucide'
import { userCircle } from 'tyrell-components/icons/heroicons/outline'

registerIcons({
  check, x, plus, search,
  user: userCircle,
})
```

Use them anywhere:

```svelte
<ty-icon name="check" size="md" />

<ty-button flavor="primary">
  <ty-icon name="plus" slot="start" />
  Add Item
</ty-button>
```

See [JAVASCRIPT_GUIDE.md § Icon tree-shaking](./JAVASCRIPT_GUIDE.md#icon-tree-shaking).

## Refs and imperative API

`bind:this` gives you the underlying element:

```svelte
<script>
  let modal
  function showModal() { modal.show() }
  function closeModal() { modal.close() }
</script>

<ty-button onclick={showModal}>Open</ty-button>

<ty-modal bind:this={modal}>
  <h2 class="ty-text++">Confirm</h2>
  <p class="ty-text">Are you sure?</p>
  <ty-button flavor="primary" onclick={closeModal}>OK</ty-button>
</ty-modal>
```

If you need to call methods at mount time, wait for definition:

```svelte
<script>
  import { onMount } from 'svelte'
  let modal

  onMount(async () => {
    await customElements.whenDefined('ty-modal')
    // safe to call modal.show() now
  })
</script>
```

## Form controls

### ty-textarea

```svelte
<script>
  let bio = $state('')
</script>

<ty-textarea
  label="Bio"
  placeholder="Tell us about yourself..."
  rows="4"
  max-height="200px"
  value={bio}
  onchange={(e) => bio = e.detail.value}
/>
```

Svelte 4: `on:change={(e) => bio = e.detail.value}`.

Attrs: `rows`, `min-height`, `max-height`, `resize` (`none`|`both`|`horizontal`|`vertical`).

### ty-checkbox and ty-switch

Both are "just the control" primitives — wrap in `<label>` to make the text clickable:

```svelte
<script>
  let agreed = $state(false)
  let darkMode = $state(false)
</script>

<label class="flex items-center gap-2">
  <ty-checkbox
    checked={agreed}
    onchange={(e) => agreed = e.detail.checked}
  />
  I agree to the terms
</label>

<label class="flex items-center gap-2">
  <ty-switch
    checked={darkMode}
    onchange={(e) => darkMode = e.detail.checked}
  />
  Dark mode
</label>
```

Event detail: `{ value, checked, formValue, originalEvent }`.

### ty-radio-group / ty-radio

```svelte
<script>
  let plan = $state('starter')
  const plans = [
    { value: 'starter', label: 'Starter' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ]
</script>

<ty-radio-group
  label="Plan"
  value={plan}
  onchange={(e) => plan = e.detail.value}
>
  {#each plans as p (p.value)}
    <label class="flex items-center gap-2">
      <ty-radio value={p.value} />
      {p.label}
    </label>
  {/each}
</ty-radio-group>
```

Add `orientation="horizontal"` to `ty-radio-group` for a side-by-side layout.

### ty-file-upload

```svelte
<script>
  let files = $state([])
</script>

<ty-file-upload
  label="Attachments"
  accept="image/*,.pdf"
  multiple
  onchange={(e) => files = e.detail.files}
/>
{#if files.length}
  <p>{files.length} file(s) selected</p>
{/if}
```

Event detail: `{ value: File[], files: File[], names: string[] }`. Files appear in `FormData` automatically on form submit.

---

## Date picker and calendar

### ty-date-picker

```svelte
<script>
  let date = $state(null)
</script>

<ty-date-picker
  label="Start Date"
  placeholder="Select a date..."
  value={date}
  onchange={(e) => date = e.detail.value}
/>
```

Value is a UTC ISO string (`2024-09-21T08:30:00.000Z`). Pass `null` or empty string to clear. Add `with-time` for datetime selection, `locale="de-DE"` for locale-aware display.

### ty-calendar (standalone)

```svelte
<script>
  const now = new Date()
  let year = $state(now.getFullYear())
  let month = $state(now.getMonth() + 1)
  let day = $state(null)

  function onDaySelect(e) {
    year = e.detail.year
    month = e.detail.month
    day = e.detail.day
  }
</script>

<ty-calendar
  {year}
  {month}
  {day}
  onchange={onDaySelect}
/>
```

Event detail: `{ year, month, day, action, source }`. Form value is ISO `YYYY-MM-DD`.

---

## Tabs and wizard

Svelte 5 can't use `onty-tab-change` syntax for hyphenated event names. Use `bind:this` and add the listener in `onMount`:

### ty-tabs

```svelte
<script>
  import { onMount } from 'svelte'

  let activeTab = $state('overview')
  let tabsEl

  onMount(() => {
    tabsEl.addEventListener('ty-tab-change', (e) => {
      activeTab = e.detail.activeId
    })
  })
</script>

<ty-tabs bind:this={tabsEl} height="300px" active={activeTab}>
  <ty-tab id="overview" label="Overview">
    <div class="p-4">Overview content</div>
  </ty-tab>
  <ty-tab id="details" label="Details">
    <div class="p-4">Details content</div>
  </ty-tab>
</ty-tabs>
```

Svelte 4 can use `on:ty-tab-change` directly:

```svelte
<ty-tabs height="300px" active={activeTab} on:ty-tab-change={(e) => activeTab = e.detail.activeId}>
```

Rich tab labels via named slots:

```svelte
<ty-tabs height="300px" active="overview">
  <span slot="label-overview" class="flex items-center gap-2">
    <ty-icon name="layout-dashboard" size="sm" />
    Overview
  </span>
  <ty-tab id="overview" label="Overview">…</ty-tab>
</ty-tabs>
```

Event detail: `{ activeId, activeIndex, previousId, previousIndex }`.

### ty-wizard

```svelte
<script>
  import { onMount } from 'svelte'

  let step = $state('info')
  let completed = $state([])
  let wizardEl

  function advance(nextId) {
    completed = [...completed, step]
    step = nextId
  }
</script>

<ty-wizard
  bind:this={wizardEl}
  height="400px"
  active={step}
  completed={completed.join(',')}
>
  <ty-step id="info" label="Info">
    <div class="p-6">
      <ty-input label="Name" required />
      <ty-button flavor="primary" onclick={() => advance('review')}>Next</ty-button>
    </div>
  </ty-step>
  <ty-step id="review" label="Review">
    <div class="p-6">
      <ty-button onclick={() => step = 'info'}>Back</ty-button>
      <ty-button flavor="success" onclick={() => advance('done')}>Finish</ty-button>
    </div>
  </ty-step>
  <ty-step id="done" label="Done">
    <div class="p-6">All done!</div>
  </ty-step>
</ty-wizard>
```

Svelte 4: `on:ty-wizard-step-change={handler}`.

Event detail: `{ activeId, activeIndex, previousId, previousIndex, direction }`.

---

## Tooltip and popup

### ty-tooltip

Nest `<ty-tooltip>` inside the trigger — it positions itself automatically:

```svelte
<ty-button>
  Save
  <ty-tooltip placement="top">Changes saved to your account</ty-tooltip>
</ty-button>

<ty-icon name="info">
  <ty-tooltip flavor="primary" delay={300}>Required field</ty-tooltip>
</ty-icon>
```

Attrs: `placement` (default `top`), `delay` (ms), `flavor` (`dark`|`light`|semantic colors), `disabled`.

### ty-popup

Nest `<ty-popup>` inside the trigger — opens on click, closes on outside click or ESC:

```svelte
<ty-button>
  Options
  <ty-popup placement="bottom-start">
    <div class="ty-elevated p-2 rounded-lg min-w-40">
      <div class="px-3 py-2 hover:ty-bg-neutral- rounded cursor-pointer">Edit</div>
      <div class="px-3 py-2 hover:ty-bg-danger- ty-text-danger rounded cursor-pointer">Delete</div>
    </div>
  </ty-popup>
</ty-button>
```

For programmatic control, add `manual` and call `popupEl.show()` / `popupEl.hide()` after `bind:this`.

---

## Utilities

### ty-copy

```svelte
<ty-copy
  label="Install"
  format="code"
  value="npm install tyrell-components"
/>
```

`format="code"` renders monospace styling. Copy happens internally — no event handling needed.

### ty-scroll-container

```svelte
<ty-scroll-container max-height="400px">
  {#each items as item (item.id)}
    <div class="p-3 border-b ty-divide-y">{item.name}</div>
  {/each}
</ty-scroll-container>
```

Attrs: `max-height`, `shadow` (default `true`), `hide-scrollbar`, `custom-scrollbar`, `overflow-x`.

---

## TypeScript

Add JSX-style type augmentation for Svelte's HTML element map:

```ts
// src/ty-types.d.ts
declare namespace svelteHTML {
  interface IntrinsicElements {
    'ty-button': {
      flavor?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
      disabled?: boolean
      pill?: boolean
      action?: boolean
      type?: 'button' | 'submit' | 'reset'
      onclick?: (e: MouseEvent) => void
      children?: any
    }
    'ty-input': {
      label?: string
      type?: string
      value?: string | number
      placeholder?: string
      error?: string
      disabled?: boolean
      required?: boolean
      onchange?: (e: CustomEvent<{ value: string }>) => void
    }
    // ...add other components as needed
  }
}
```

For underlying class types:

```ts
import type { TyButton } from 'tyrell-components/button'
let btn: TyButton
```

## SvelteKit (SSR)

`customElements` is undefined on the server. Three patterns:

### Pattern A — Browser guard in root layout

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'

  onMount(async () => {
    if (browser) {
      await import('tyrell-components/css/tyrell.css')
      await import('tyrell-components/css/tyrell-theme.css')
      await import('tyrell-components')
      const { registerIcons } = await import('tyrell-components/icons/registry')
      const { check, x } = await import('tyrell-components/icons/lucide')
      registerIcons({ check, x })
    }
  })
</script>

<slot />
```

### Pattern B — Client-only module

Create `src/lib/tyrell.client.ts`:

```ts
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components/css/tyrell-theme.css'
import 'tyrell-components'
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, x } from 'tyrell-components/icons/lucide'

registerIcons({ check, x })
```

Import it from a layout's `onMount`:

```svelte
<script>
  import { onMount } from 'svelte'
  onMount(() => import('$lib/tyrell.client'))
</script>
```

### Pattern C — Disable SSR for routes using Tyrell

If a route can't tolerate the brief unstyled flash:

```js
// src/routes/+page.js
export const ssr = false
```

Most apps want Pattern A or B — graceful upgrade is fine because `<ty-*>` tags render as inert HTML during SSR, then "come alive" when registration runs in the browser.

### `<ty-*>` in SSR HTML

The server emits raw `<ty-button>Save</ty-button>` in the HTML response. Browsers ignore unknown tags but still render their text content, so users see the button label as plain text until JavaScript loads. This is usually invisible (sub-100ms on fast connections) but can flash on slow networks. If it matters, add a CSS rule:

```css
ty-button:not(:defined),
ty-input:not(:defined),
ty-select:not(:defined) {
  visibility: hidden;
}
```

The `:not(:defined)` selector matches elements whose custom element class hasn't registered yet, hiding them until ready.

## Common pitfalls

1. **Setting array values via attribute** — `value={[1,2,3]}` becomes the string `"1,2,3"`. Use `prop:value={[1,2,3]}`.
2. **Reading `e.value` instead of `e.detail.value`** — Tyrell events follow the standard CustomEvent pattern.
3. **Importing `tyrell-components` at module top-level in SvelteKit** — `customElements is not defined` during SSR. Move imports inside `onMount` or use `if (browser)`.
4. **Forgetting `bind:this` is async** — the binding fires after mount, not synchronously. Call methods inside `onMount` or in event handlers.
5. **Svelte 4 `on:click` vs Svelte 5 `onclick`** — Svelte 5 uses standard event handler attributes; Svelte 4 uses the `on:` directive. Either works on custom elements; just match your Svelte version.

## Why no wrapper package?

Other frameworks (notably React ≤18) need wrapper packages because they:
- Pass everything as attributes (broken booleans, complex values),
- Convert event names to `onCamelCase` (don't match custom event names),
- Don't support property setting cleanly.

Svelte does none of those — it sets attributes for primitives, allows `prop:` for properties, and `on:event` / `onevent` works on any DOM event. Wrappers would only add overhead. Use the components directly.

## See also

- [JAVASCRIPT_GUIDE.md](./JAVASCRIPT_GUIDE.md) — distribution, subpaths, icons, SSR
- [TY_GUIDE.md](../TY_GUIDE.md) — universal API reference
- [CSS_GUIDE.md](../CSS_GUIDE.md) — design system
