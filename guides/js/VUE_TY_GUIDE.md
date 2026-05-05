# Vue + Ty Guide

Use Ty web components in Vue 3 natively — no wrapper package needed. Vue 3 has first-class custom element support; one config line and `v-bind` / `v-model` / `@event` work as expected.

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

Vue's `v-model` does not work out of the box on web components — Vue's default `v-model` expects `value` + `@input` (for native inputs). Ty inputs emit `change` events with `event.detail.value`.

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

`ty-dropdown` / `ty-multiselect` / `ty-tabs` use slotted children. Vue renders them naturally — reactive lists work as expected:

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
  <ty-dropdown
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
  </ty-dropdown>
</template>
```

For multiselect, children are `ty-tag` elements with `value`:

```vue
<ty-multiselect
  :value="selected"
  @change="selected = $event.detail.values"
>
  <ty-tag v-for="t in tags" :key="t" :value="t">{{ t }}</ty-tag>
</ty-multiselect>
```

## Icons

Register at app startup, alongside component imports:

```js
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

import 'tyrell-components/css/tyrell.css'
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

## TypeScript

Augment Vue's JSX intrinsic elements once:

```ts
// src/ty-types.d.ts
import type { DefineComponent } from 'vue'

declare module 'vue' {
  interface GlobalComponents {
    'ty-button': DefineComponent<{
      flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral'
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
3. **Reading `$event.value` instead of `$event.detail.value`** — Ty events follow the standard CustomEvent pattern.
4. **Importing `tyrell-components` outside a client boundary in Nuxt** — `customElements is not defined` errors during SSR. Use `.client.ts` suffix or move the import.
5. **Two-way binding with `v-model` on ty-input** — Vue's default `v-model` doesn't read `event.detail.value`. Use explicit `:value` + `@change`, or write a custom directive.

## See also

- [JAVASCRIPT_GUIDE.md](./JAVASCRIPT_GUIDE.md) — distribution, subpaths, icons, SSR
- [TY_GUIDE.md](../TY_GUIDE.md) — universal API reference
- [CSS_GUIDE.md](../CSS_GUIDE.md) — design system
