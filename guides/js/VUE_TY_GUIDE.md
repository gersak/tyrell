# Vue + Tyrell Guide

Use Tyrell web components in Vue 3 natively — no wrapper package needed. Vue 3 has first-class custom element support; one config line and `v-bind` / `v-model` / `@event` work as expected.

For installation, subpath imports, and the side-effects model, see [JAVASCRIPT_GUIDE.md](./JAVASCRIPT_GUIDE.md).

## Setup

### 1. Install

```bash
npm install tyrell-components
```

### 2. Tell Vue's compiler that `ty-*` are custom elements

Without this, Vue tries to resolve `<ty-button>` as a Vue component and warns about unknown components.

#### Vite

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ty-'),
        },
      },
    }),
  ],
})
```

#### Vue CLI / webpack

```js
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => ({
        ...options,
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ty-'),
        },
      }))
  },
}
```

### 3. Register components and CSS

In your app entry (`src/main.js` or `src/main.ts`):

```js
import { createApp } from 'vue'
import App from './App.vue'

import 'tyrell-components/css/tyrell.css'
import 'tyrell-components/css/tyrell-theme.css' // auto-contrast, seed rebranding, themes — see TY_GUIDE.md#quick-start
import 'tyrell-components'   // or specific subpaths: 'tyrell-components/button', etc.

createApp(App).mount('#app')
```

## Native usage

```vue
<script setup>
import { ref } from 'vue'
const email = ref('')
const submit = () => console.log('submit:', email.value)
</script>

<template>
  <ty-input
    label="Email"
    type="email"
    :value="email"
    @change="email = $event.detail.value"
  />
  <ty-button flavor="primary" @click="submit">Submit</ty-button>
</template>
```

Three Vue idioms to remember:

1. **`:prop` binds the JS property**, `prop=""` sets an HTML attribute. Always prefer `:` for booleans, arrays, objects, and computed values.
2. **`@event="..."`** registers a `addEventListener` — works for any custom event including `change`, `input`, `popup-close`, `tag-dismiss`, etc.
3. **Event payload** lives on `$event.detail`, not `$event`.

## v-model

Vue's `v-model` does not work out of the box on web components — Vue's default `v-model` expects `value` + `@input` (for native inputs). Tyrell inputs emit `change` events with `event.detail.value`.

Use the `:value` + `@change` pattern explicitly, or build a small `v-model` wrapper:

### Pattern 1 — Explicit binding (simple, readable)

```vue
<ty-input
  :value="email"
  @change="email = $event.detail.value"
  label="Email"
/>
```

### Pattern 2 — Custom `v-model` modifier

```vue
<ty-input
  v-model:value.detail="email"
  label="Email"
/>
```

This requires a directive that reads `event.detail.value`. Or define your own once:

```js
// directives/v-ty-model.js
export const vTyModel = {
  mounted(el, binding) {
    el.value = binding.value
    el._handler = (e) => binding.instance[binding.arg] = e.detail.value
    el.addEventListener('change', el._handler)
  },
  updated(el, binding) {
    if (el.value !== binding.value) el.value = binding.value
  },
  unmounted(el) {
    el.removeEventListener('change', el._handler)
  },
}
```

```vue
<script setup>
import { vTyModel } from './directives/v-ty-model.js'
const email = ref('')
</script>

<template>
  <ty-input v-ty-model="email" label="Email" />
</template>
```

For most apps, Pattern 1 is fine and explicit.

## Composition with child elements

`ty-select` / `ty-tabs` use slotted children. Vue renders them naturally — reactive lists work as expected.

```vue
<script setup>
import { ref } from 'vue'

const country = ref('us')
const countries = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'fr', name: 'France' },
]
</script>

<template>
  <ty-select
    label="Country"
    :value="country"
    @change="country = $event.detail.value"
  >
    <ty-option
      v-for="c in countries"
      :key="c.code"
      :value="c.code"
    >
      {{ c.name }}
    </ty-option>
  </ty-select>
</template>
```

For multi-select add `multiple` — children stay `ty-option`, and
`$event.detail.values` is the selected array. Pair with `<ty-selected-tags>`
for dismissible chips anywhere in the layout:

```vue
<ty-select
  multiple
  id="tags"
  :value="selected"
  @change="selected = $event.detail.values"
>
  <ty-option v-for="t in tags" :key="t" :value="t">{{ t }}</ty-option>
</ty-select>
<ty-selected-tags for="tags"></ty-selected-tags>
```

## Icons

Register at app startup, alongside component imports:

```js
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

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

createApp(App).mount('#app')
```

Use them anywhere:

```vue
<template>
  <ty-icon name="check" size="md" />
  <ty-button flavor="primary">
    <ty-icon name="plus" slot="start" />
    Add Item
  </ty-button>
</template>
```

See [JAVASCRIPT_GUIDE.md § Icon tree-shaking](./JAVASCRIPT_GUIDE.md#icon-tree-shaking) for the full icon system.

## Refs and imperative API

Vue's `ref` gives you the underlying element:

```vue
<script setup>
import { ref, onMounted } from 'vue'

const modalRef = ref(null)
const showModal = () => modalRef.value.show()
const closeModal = () => modalRef.value.close()
</script>

<template>
  <ty-button @click="showModal">Open</ty-button>
  <ty-modal ref="modalRef">
    <h2 class="ty-text++">Confirm</h2>
    <p class="ty-text">Are you sure?</p>
    <ty-button flavor="primary" @click="closeModal">OK</ty-button>
  </ty-modal>
</template>
```

If you need to call methods immediately on mount, await registration:

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  await customElements.whenDefined('ty-modal')
  // safe to call modalRef.value.show() now
})
</script>
```

## Form controls

### ty-textarea

```vue
<script setup>
import { ref } from 'vue'
const bio = ref('')
</script>

<template>
  <ty-textarea
    label="Bio"
    placeholder="Tell us about yourself..."
    rows="4"
    max-height="200px"
    :value="bio"
    @change="bio = $event.detail.value"
  />
</template>
```

Attrs: `rows`, `min-height`, `max-height`, `resize` (`none`|`both`|`horizontal`|`vertical`).

### ty-checkbox and ty-switch

Both are "just the control" primitives — wrap in `<label>` to make the text clickable:

```vue
<script setup>
import { ref } from 'vue'
const agreed = ref(false)
const darkMode = ref(false)
</script>

<template>
  <label class="flex items-center gap-2">
    <ty-checkbox
      :checked="agreed"
      @change="agreed = $event.detail.checked"
    />
    I agree to the terms
  </label>

  <label class="flex items-center gap-2">
    <ty-switch
      :checked="darkMode"
      @change="darkMode = $event.detail.checked"
    />
    Dark mode
  </label>
</template>
```

Event detail: `{ value, checked, formValue, originalEvent }`.

### ty-radio-group / ty-radio

```vue
<script setup>
import { ref } from 'vue'
const plan = ref('starter')
const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
]
</script>

<template>
  <ty-radio-group
    label="Plan"
    :value="plan"
    @change="plan = $event.detail.value"
  >
    <label
      v-for="p in plans"
      :key="p.value"
      class="flex items-center gap-2"
    >
      <ty-radio :value="p.value" />
      {{ p.label }}
    </label>
  </ty-radio-group>
</template>
```

Add `orientation="horizontal"` to `ty-radio-group` for a side-by-side layout.

### ty-file-upload

```vue
<script setup>
import { ref } from 'vue'
const files = ref([])
</script>

<template>
  <ty-file-upload
    label="Attachments"
    accept="image/*,.pdf"
    multiple
    @change="files = $event.detail.files"
  />
  <p v-if="files.length">{{ files.length }} file(s) selected</p>
</template>
```

Event detail: `{ value: File[], files: File[], names: string[] }`. Files appear in `FormData` under the `name` attribute automatically on form submit.

---

## Date picker and calendar

### ty-date-picker

```vue
<script setup>
import { ref } from 'vue'
const date = ref(null)
</script>

<template>
  <ty-date-picker
    label="Start Date"
    placeholder="Select a date..."
    :value="date"
    @change="date = $event.detail.value"
  />
</template>
```

Value is a UTC ISO string (`2024-09-21T08:30:00.000Z`). Pass `null` or empty string to clear. Add `with-time` for datetime selection, `locale="de-DE"` for locale-aware display.

### ty-calendar (standalone)

For inline date pickers or custom date UIs:

```vue
<script setup>
import { ref } from 'vue'
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const day = ref(null)

function onDaySelect(e) {
  year.value = e.detail.year
  month.value = e.detail.month
  day.value = e.detail.day
}
</script>

<template>
  <ty-calendar
    :year="year"
    :month="month"
    :day="day"
    @change="onDaySelect"
  />
</template>
```

Event detail: `{ year, month, day, action, source }`. Form value is ISO `YYYY-MM-DD`.

---

## Tabs and wizard

### ty-tabs

```vue
<script setup>
import { ref } from 'vue'
const activeTab = ref('overview')
</script>

<template>
  <ty-tabs
    height="300px"
    :active="activeTab"
    @ty-tab-change="activeTab = $event.detail.activeId"
  >
    <ty-tab id="overview" label="Overview">
      <div class="p-4">Overview content</div>
    </ty-tab>
    <ty-tab id="details" label="Details">
      <div class="p-4">Details content</div>
    </ty-tab>
  </ty-tabs>
</template>
```

Rich tab labels via named slots on `ty-tabs`:

```vue
<template>
  <ty-tabs height="300px" active="overview">
    <span slot="label-overview" class="flex items-center gap-2">
      <ty-icon name="layout-dashboard" size="sm" />
      Overview
    </span>
    <ty-tab id="overview" label="Overview">…</ty-tab>
  </ty-tabs>
</template>
```

Event detail: `{ activeId, activeIndex, previousId, previousIndex }`.

### ty-wizard

```vue
<script setup>
import { ref } from 'vue'
const step = ref('info')
const completed = ref([])

function advance(nextId) {
  completed.value = [...completed.value, step.value]
  step.value = nextId
}
</script>

<template>
  <ty-wizard
    height="400px"
    :active="step"
    :completed="completed.join(',')"
  >
    <ty-step id="info" label="Info">
      <div class="p-6">
        <ty-input label="Name" required />
        <ty-button flavor="primary" @click="advance('review')">Next</ty-button>
      </div>
    </ty-step>
    <ty-step id="review" label="Review">
      <div class="p-6">
        <ty-button @click="step = 'info'">Back</ty-button>
        <ty-button flavor="success" @click="advance('done')">Finish</ty-button>
      </div>
    </ty-step>
    <ty-step id="done" label="Done">
      <div class="p-6">All done!</div>
    </ty-step>
  </ty-wizard>
</template>
```

Event detail: `{ activeId, activeIndex, previousId, previousIndex, direction }`.

---

## Tooltip and popup

### ty-tooltip

Nest `<ty-tooltip>` inside the trigger — it positions itself automatically:

```vue
<template>
  <ty-button>
    Save
    <ty-tooltip placement="top">Changes saved to your account</ty-tooltip>
  </ty-button>

  <ty-icon name="info">
    <ty-tooltip flavor="primary" :delay="300">Required field</ty-tooltip>
  </ty-icon>
</template>
```

Attrs: `placement` (default `top`), `delay` (ms), `flavor` (`dark`|`light`|semantic colors), `disabled`.

### ty-popup

Nest `<ty-popup>` inside the trigger — it opens on click and closes on outside click or ESC:

```vue
<template>
  <ty-button>
    Options
    <ty-popup placement="bottom-start">
      <div class="ty-elevated p-2 rounded-lg min-w-40">
        <div class="px-3 py-2 hover:ty-bg-neutral- rounded cursor-pointer">Edit</div>
        <div class="px-3 py-2 hover:ty-bg-danger- ty-text-danger rounded cursor-pointer">Delete</div>
      </div>
    </ty-popup>
  </ty-button>
</template>
```

For programmatic control, add `manual` and call `ref.value.show()` / `ref.value.hide()`.

---

## Utilities

### ty-copy

```vue
<template>
  <ty-copy
    label="Install"
    format="code"
    value="npm install tyrell-components"
  />
</template>
```

`format="code"` renders monospace styling. Copy happens internally — no event handling needed.

### ty-scroll-container

```vue
<template>
  <ty-scroll-container max-height="400px">
    <div
      v-for="item in items"
      :key="item.id"
      class="p-3 border-b ty-divide-y"
    >
      {{ item.name }}
    </div>
  </ty-scroll-container>
</template>
```

Attrs: `max-height`, `shadow` (default `true`), `hide-scrollbar`, `custom-scrollbar`, `overflow-x`.

---

## TypeScript

Augment Vue's JSX intrinsic elements once:

```ts
// src/ty-types.d.ts
import type { DefineComponent } from 'vue'

declare module 'vue' {
  interface GlobalComponents {
    'ty-button': DefineComponent<{
      flavor?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
      disabled?: boolean
      pill?: boolean
      action?: boolean
      type?: 'button' | 'submit' | 'reset'
    }>
    'ty-input': DefineComponent<{
      label?: string
      type?: string
      value?: string | number
      placeholder?: string
      error?: string
      disabled?: boolean
      required?: boolean
    }>
    // ...add other components as needed
  }
}
```

Or import the underlying class types from `tyrell-components`:

```ts
import type { TyButton } from 'tyrell-components/button'
const btn = ref<TyButton>()
```

## Nuxt 3 (SSR)

`customElements` does not exist on the server. Two options:

### Option A — Client-only plugin

```ts
// plugins/tyrell.client.ts
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components/css/tyrell-theme.css'
import 'tyrell-components'
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, x } from 'tyrell-components/icons/lucide'

export default defineNuxtPlugin(() => {
  registerIcons({ check, x })
})
```

The `.client.ts` suffix tells Nuxt to load it only in the browser.

### Option B — `<ClientOnly>` boundaries

```vue
<template>
  <ClientOnly>
    <ty-date-picker @change="handleChange" />
    <template #fallback>
      <div class="skeleton" />
    </template>
  </ClientOnly>
</template>
```

Use this when only specific components need to be client-rendered. The `<ty-*>` markup in initial HTML will render as inert tags until hydration — usually invisible to users, but use the fallback slot if the brief unstyled state is noticeable.

### Configure Vue compiler in Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('ty-'),
    },
  },
})
```

## Common pitfalls

1. **Forgetting `isCustomElement`** — Vue warns "Failed to resolve component: ty-button". Add the compiler option.
2. **Using `prop="value"` instead of `:prop="value"`** for booleans — `disabled="false"` becomes a truthy string `"false"`. Always use `:disabled="false"`.
3. **Reading `$event.value` instead of `$event.detail.value`** — Tyrell events follow the standard CustomEvent pattern.
4. **Importing `tyrell-components` outside a client boundary in Nuxt** — `customElements is not defined` errors during SSR. Use `.client.ts` suffix or move the import.
5. **Two-way binding with `v-model` on ty-input** — Vue's default `v-model` doesn't read `event.detail.value`. Use explicit `:value` + `@change`, or write a custom directive.

## See also

- [JAVASCRIPT_GUIDE.md](./JAVASCRIPT_GUIDE.md) — distribution, subpaths, icons, SSR
- [TY_GUIDE.md](../TY_GUIDE.md) — universal API reference
- [CSS_GUIDE.md](../CSS_GUIDE.md) — design system
