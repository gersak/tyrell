# Svelte + Ty Guide

Use Ty web components in Svelte 5 (and Svelte 4) natively — no wrapper package needed. Svelte has the cleanest custom-element story of any major framework: tags work as-is, events work via `on:event`, and reactivity flows through `bind:` and `$state` without ceremony.

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
<ty-multiselect prop:value={selected}>
  {#each tags as t}
    <ty-tag value={t}>{t}</ty-tag>
  {/each}
</ty-multiselect>
```

Rules of thumb:
- **Strings, simple booleans** — attributes are fine: `disabled`, `label="Email"`, `flavor="primary"`.
- **Arrays, objects, callbacks** — must use `prop:` (attributes serialize to strings).
- **Multiselect / dropdown values when array** — `prop:value={[...]}`.

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

<ty-multiselect
  prop:value={selected}
  onchange={(e) => selected = e.detail.values}
>
  <ty-tag value="apple">Apple</ty-tag>
  <ty-tag value="banana">Banana</ty-tag>
  <ty-tag value="cherry">Cherry</ty-tag>
</ty-multiselect>
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

<ty-dropdown
  label="Country"
  value={country}
  onchange={(e) => country = e.detail.value}
>
  {#each countries as c (c.code)}
    <ty-option value={c.code}>{c.name}</ty-option>
  {/each}
</ty-dropdown>
```

## Icons

Register at app startup:

```js
// src/app.js or src/main.ts
import 'tyrell-components/css/tyrell.css'
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

## TypeScript

Add JSX-style type augmentation for Svelte's HTML element map:

```ts
// src/ty-types.d.ts
declare namespace svelteHTML {
  interface IntrinsicElements {
    'ty-button': {
      flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral'
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

### Pattern C — Disable SSR for routes using Ty

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
ty-dropdown:not(:defined) {
  visibility: hidden;
}
```

The `:not(:defined)` selector matches elements whose custom element class hasn't registered yet, hiding them until ready.

## Common pitfalls

1. **Setting array values via attribute** — `value={[1,2,3]}` becomes the string `"1,2,3"`. Use `prop:value={[1,2,3]}`.
2. **Reading `e.value` instead of `e.detail.value`** — Ty events follow the standard CustomEvent pattern.
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
