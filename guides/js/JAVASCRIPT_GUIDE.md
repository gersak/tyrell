# JavaScript + Ty Guide

Use Ty web components from vanilla JavaScript and any bundler. This guide covers distribution, the side-effects model, subpath imports, icon tree-shaking, code splitting, and the SSR boundary — the substrate every framework integration sits on.

For framework-specific patterns, see [REACT_TY_GUIDE.md](./REACT_TY_GUIDE.md), [VUE_TY_GUIDE.md](./VUE_TY_GUIDE.md), and [SVELTE_TY_GUIDE.md](./SVELTE_TY_GUIDE.md).

## Two distribution channels

Ty ships through two channels — pick one based on your build setup, not both at once.

### CDN — zero build

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>
```

The CDN bundle (`dist/tyrell.js`) registers all 23 components and exposes the icon registry on `window.tyIcons`. Use this for HTMX, server-rendered apps, prototypes, multi-app domains where browser cache wins, or strict no-bundler workflows.

### NPM — tree-shakeable

```bash
npm install tyrell-components
```

```js
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components'   // registers everything
```

Use this when you have a bundler (Vite, Webpack, Rollup, esbuild, Parcel, Bun). Subpath imports let you ship only the components you use.

## How registration works

Each component file ends with the same pattern:

```ts
// src/components/button.ts
export class TyButton extends TyComponent { ... }

if (!customElements.get("ty-button")) {
  customElements.define("ty-button", TyButton);
}
```

`customElements.define(...)` is a **side effect** — calling it makes `<ty-button>` work in the DOM. Importing the file triggers that side effect; once registered, the component class is rarely referenced from your code (you write `<ty-button>` in HTML or JSX, not `new TyButton()`).

This matters because modern bundlers eliminate "unused" code aggressively. Ty's `package.json` declares the side-effectful files explicitly:

```json
"sideEffects": [
  "./lib/index.js",
  "./lib/components/**/*.js",
  "./dist/*.js"
]
```

Translation: "These files do real work just by being imported — keep them in the bundle even if no exported symbols are referenced." Everything else (utils, types, icon data) is pure and freely tree-shaken.

## Subpath imports

Import only the components you use:

```js
import 'tyrell-components/button'
import 'tyrell-components/input'
import 'tyrell-components/dropdown'
import 'tyrell-components/option'      // dropdown children
import 'tyrell-components/modal'
```

Available subpaths (each registers exactly one custom element):

```
button         input          textarea       checkbox
dropdown       option         multiselect    tag
modal          popup          tooltip
calendar       calendar-month calendar-navigation  date-picker
tabs           tab            wizard
icon           copy
```

Subpath imports compose with `import('...')` for code splitting:

```js
// Calendar/date-picker is the heaviest component — defer until needed
async function openDatePicker() {
  await import('tyrell-components/date-picker')
  document.getElementById('picker').showModal()
}
```

Webpack, Rollup, Vite, esbuild, and Parcel all honor subpath exports. Bun and Deno also work via the standard `exports` field.

## CSS distribution

A single file: `css/tyrell.css`. Two consumption modes — pick whichever fits your build:

```js
// Bundler picks it up (Vite, Webpack, Next.js, etc.)
import 'tyrell-components/css/tyrell.css'
```

```html
<!-- Or load directly -->
<link rel="stylesheet" href="/node_modules/tyrell-components/css/tyrell.css">
```

The CSS is intentionally **not** split per-component. The file is small enough that splitting would cost more in HTTP overhead than it saves, and the design tokens (colors, surfaces, text classes) need to be globally available regardless of which components are loaded.

## Icon tree-shaking

Icons are the largest size variable in the project — get them right and bundle size stays bounded; get them wrong and you ship hundreds of KB of unused SVGs.

### Why icons need explicit registration

`<ty-icon name="check">` looks up `"check"` in a runtime registry. Bundlers cannot statically connect a string `"check"` to the `check` export — that link is dynamic. Tree-shaking icons therefore requires you to **explicitly register** the ones you use:

```js
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, heart, star } from 'tyrell-components/icons/lucide'

registerIcons({ check, heart, star })
```

The bundler sees three named imports from a pure module and ships only those three SVG strings (~1.5 KB total). The other 1,633 lucide icons never enter your bundle.

### Available icon families

```
tyrell-components/icons/lucide                   1,636 icons
tyrell-components/icons/heroicons/outline         324 icons
tyrell-components/icons/heroicons/solid           324 icons
tyrell-components/icons/heroicons/mini            230 icons
tyrell-components/icons/heroicons/micro           230 icons
tyrell-components/icons/material/filled         2,400+ icons
tyrell-components/icons/material/outlined       2,400+ icons
tyrell-components/icons/material/round          2,400+ icons
tyrell-components/icons/material/sharp          2,400+ icons
tyrell-components/icons/material/two-tone       2,400+ icons
tyrell-components/icons/fontawesome/solid       1,400+ icons
tyrell-components/icons/fontawesome/regular       163 icons
tyrell-components/icons/fontawesome/brands         500+ icons
```

Each file is a flat list of `export const name = '<svg>...</svg>'`. Mix freely across families:

```js
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, x, plus } from 'tyrell-components/icons/lucide'
import { userCircle } from 'tyrell-components/icons/heroicons/outline'
import { github, slack } from 'tyrell-components/icons/fontawesome/brands'

registerIcons({
  check, x, plus,
  user: userCircle,    // alias to a friendlier name
  github, slack,
})
```

### The `import * as` trap

```js
// ❌ DO NOT DO THIS — ships all 1,636 icons
import * as L from 'tyrell-components/icons/lucide'
registerIcons(L)
```

Namespace imports defeat tree-shaking. Always use named imports for icons.

### Custom SVGs

The registry takes any string of SVG markup:

```js
import { registerIcons } from 'tyrell-components/icons/registry'

registerIcons({
  'company-logo': '<svg viewBox="0 0 24 24">...</svg>',
  'special-badge': await fetch('/icons/badge.svg').then(r => r.text()),
})
```

### CDN icon registration

When loading from CDN, the registry is exposed on `window.tyIcons`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>
<script type="module">
  await customElements.whenDefined('ty-icon')
  window.tyIcons.register({
    check: '<svg>...</svg>',
    heart: '<svg>...</svg>',
  })
</script>
```

The CDN bundle does **not** preload any icon family — it would inflate the bundle. Either fetch icons on demand or copy the SVG strings you need.

## Vanilla JS usage

Once components are registered, write plain HTML and listen for events:

```html
<ty-input id="email" type="email" label="Email"></ty-input>
<ty-button id="submit" flavor="primary">Submit</ty-button>

<script>
  const email = document.getElementById('email')
  const submit = document.getElementById('submit')

  email.addEventListener('change', (e) => {
    console.log('email:', e.detail.value)
  })

  submit.addEventListener('click', () => {
    if (email.value) {
      // submit form
    }
  })
</script>
```

Three things to remember:

1. **Event payload lives on `event.detail`**, not `event` directly. Access values via `event.detail.value`.
2. **Properties vs attributes** — set primitives via attributes, set complex values (arrays, objects, functions) via JS properties:
   ```js
   el.setAttribute('label', 'Email')         // string attribute
   el.disabled = true                         // boolean property
   el.value = ['a', 'b', 'c']                 // array property (multiselect)
   ```
3. **Wait for definition before scripting** if you call methods immediately:
   ```js
   await customElements.whenDefined('ty-modal')
   document.querySelector('ty-modal').show()
   ```

## Bundler notes

### Vite

Works out of the box. Subpath imports, CSS imports, and `import()` splits all behave correctly:

```js
// vite.config.js — no special config required
export default {
  // ...
}
```

For Vue 3 inside Vite, see [VUE_TY_GUIDE.md](./VUE_TY_GUIDE.md).

### Webpack 5

Honors `sideEffects` and subpath exports. If you've manually overridden `sideEffects: false` for the project, you need to allow Ty's modules:

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      // do NOT mark tyrell-components as side-effect-free
      sideEffects: (resourcePath) => !resourcePath.includes('tyrell-components'),
    }]
  }
}
```

### Rollup

Use `@rollup/plugin-node-resolve` with `exportConditions: ['import']`. `sideEffects` is honored automatically.

### esbuild / Bun

Both honor `exports` and `sideEffects`. No configuration needed.

### Parcel

Works automatically. Parcel respects `sideEffects` and resolves subpath exports.

## SSR and the registration boundary

`customElements.define` requires a browser. On Node.js, `customElements` is undefined. Server-side rendering tools must either:

- **Skip the registration import on the server**, importing it only in the client boundary, or
- **Render `<ty-*>` tags as opaque strings on the server** and let registration hydrate them on the client.

Most frameworks already handle this correctly when you import inside a client-only context. Specifics:

- **Next.js (App Router)** — Add `'use client'` to any file that imports `tyrell-components/...`, or perform the import inside a `useEffect` for purely client-side registration. See REACT_TY_GUIDE.md § Next.js Integration.
- **Nuxt 3** — Wrap registration in `if (process.client)` or place imports inside `<ClientOnly>` boundaries / `onMounted` hooks.
- **SvelteKit** — Use `import { browser } from '$app/environment'` and guard with `if (browser)`, or place imports inside `onMount`.
- **Astro** — Use `client:load` / `client:idle` directives on islands that contain `<ty-*>` elements; do not import `tyrell-components` from `.astro` files.
- **Remix** — Import inside `useEffect` or wrap with `ClientOnly` from `remix-utils`.

What you should **not** do is render `<ty-*>` tags on the server expecting them to "work" — they'll render as inert HTML until registration runs on the client. That's usually fine (graceful upgrade), but means initial paint shows unstyled content. Either:

- Accept the brief flash (acceptable for most apps), or
- Wrap critical UI with a skeleton until `customElements.whenDefined()` resolves, or
- Use Declarative Shadow DOM for SSR-friendly initial markup (advanced; not currently supported by Ty out of the box).

## Bundle size — what to expect

Approximate sizes for the most common configurations:

| Configuration | Minified |
|---|---:|
| Single primitive (`button`, `input`, `tag`) | 3–8 KB |
| Dropdown + option | ~15 KB |
| Modal + popup + tooltip | ~20 KB |
| Calendar + date-picker | ~25 KB |
| All 23 components (full bundle) | ~150–200 KB |
| Per-icon SVG | 300–600 bytes |
| All lucide icons (mistake) | ~600 KB |

Components are bounded — even importing all 23 caps at ~200 KB. Icons are unbounded if you namespace-import a family. **The icon import pattern matters more than the component import pattern.**

## Code-splitting patterns

### Per-route splits

```js
// Defer calendar to the page that uses it
const DatePickerPage = () => import('./pages/date-picker.js')
const router = {
  '/booking': DatePickerPage,
}
```

The dynamic `import()` triggers the route's components to register on demand.

### Component-level splits

```js
async function showModal() {
  // Modal not registered yet
  if (!customElements.get('ty-modal')) {
    await import('tyrell-components/modal')
  }
  document.querySelector('ty-modal').show()
}
```

### Icon-bundle splits

For very icon-heavy apps, split icon registration by feature:

```js
// chart-icons.js
import { registerIcons } from 'tyrell-components/icons/registry'
import { trendingUp, trendingDown, barChart } from 'tyrell-components/icons/lucide'
export function registerChartIcons() {
  registerIcons({ trendingUp, trendingDown, barChart })
}

// chart.js
import { registerChartIcons } from './chart-icons.js'
registerChartIcons()
```

Combined with route-level splits, only the route that renders the chart pays the cost.

## Performance — startup ordering

If you load Ty via NPM and have hundreds of `<ty-*>` elements in initial HTML:

```js
// main.js — register first, paint second
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components'

import { registerIcons } from 'tyrell-components/icons/registry'
import { check, x } from 'tyrell-components/icons/lucide'
registerIcons({ check, x })

// Then mount your app
mountApp()
```

Registering before mounting avoids a flash of unregistered elements. With code splitting, accept the flash for offscreen content but prefetch eagerly for above-the-fold UI.

## TypeScript

The package ships `.d.ts` files for the component classes:

```ts
import type { TyButton } from 'tyrell-components/button'

const btn = document.querySelector('ty-button') as TyButton
btn.disabled = true
```

For framework-specific JSX types, see the framework guides. Plain TypeScript with `lib.dom.d.ts` does not know about `<ty-button>` — you'll need either the React wrapper types, the Vue/Svelte template type registration, or a manual `HTMLElementTagNameMap` augmentation.

## Quick reference — what to import where

| Goal | Import |
|---|---|
| Register everything | `import 'tyrell-components'` |
| Register one component | `import 'tyrell-components/button'` |
| Multiple components | One import line per component |
| Stylesheet (bundler) | `import 'tyrell-components/css/tyrell.css'` |
| Icon registry function | `import { registerIcons } from 'tyrell-components/icons/registry'` |
| Specific icons | `import { check, heart } from 'tyrell-components/icons/lucide'` |
| Component class (typing) | `import type { TyButton } from 'tyrell-components/button'` |

## See also

- [TY_GUIDE.md](../TY_GUIDE.md) — universal HTML/JS API reference
- [CSS_GUIDE.md](../CSS_GUIDE.md) — design system (colors, surfaces, text)
- [REACT_TY_GUIDE.md](./REACT_TY_GUIDE.md) — React + `tyrell-react`
- [VUE_TY_GUIDE.md](./VUE_TY_GUIDE.md) — Vue 3 / Nuxt
- [SVELTE_TY_GUIDE.md](./SVELTE_TY_GUIDE.md) — Svelte 5 / SvelteKit
- [TYCOMPONENT_GUIDE.md](./TYCOMPONENT_GUIDE.md) — building custom components on `TyComponent`
