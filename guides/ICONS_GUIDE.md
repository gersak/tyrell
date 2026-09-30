# Icons

`<ty-icon name="mail">` looks the name up in a runtime registry. There are two ways to fill it:

- **By name.** Register SVG strings once at startup, then use `name="…"` anywhere.
- **By slot.** Put the `<svg>` inside the tag. No registry, no JavaScript.

Both work on the same page. Size, color, `spin`, `pulse` and `tempo` style the `<ty-icon>` element, so they apply either way.

## How the icon sets are built

Every set is generated from its upstream source into flat files of SVG strings: one export (JS) or one `def` (Clojure) per icon. Nothing is fetched at runtime. What you don't reference, the compiler drops.

| Set | JS import (`tyrell-components/…`) | Clojure namespace | Icons |
| --- | --- | --- | --- |
| Lucide | `icons/lucide` | `tyrell.lucide` | 1,861 |
| Heroicons outline | `icons/heroicons/outline` | `tyrell.heroicons.outline` | 324 |
| Heroicons solid | `icons/heroicons/solid` | `tyrell.heroicons.solid` | 324 |
| Heroicons mini | `icons/heroicons/mini` | `tyrell.heroicons.mini` | 324 |
| Heroicons micro | `icons/heroicons/micro` | `tyrell.heroicons.micro` | 316 |
| Material filled | `icons/material/filled` | `tyrell.material.filled` | 2,170 |
| Material outlined | `icons/material/outlined` | `tyrell.material.outlined` | 2,132 |
| Material round | `icons/material/round` | `tyrell.material.round` | 2,137 |
| Material sharp | `icons/material/sharp` | `tyrell.material.sharp` | 2,137 |
| Material two-tone | `icons/material/two-tone` | `tyrell.material.two-tone` | 2,175 |
| Font Awesome solid | `icons/fontawesome/solid` | `tyrell.fav6.solid` | 1,984 |
| Font Awesome regular | `icons/fontawesome/regular` | `tyrell.fav6.regular` | 273 |
| Font Awesome brands | `icons/fontawesome/brands` | `tyrell.fav6.brands` | 549 |

**You pick the names.** Registration maps a name to an SVG string, and `name="…"` uses that name. The set's identifier is only where the SVG comes from: JS exports are camelCase (`chevronDown`), Clojure defs are kebab-case (`chevron-down`), and neither has to match the name you register. Naming by role (`action-down`, `nav-back`) lets you swap the artwork later without touching templates.

## In Clojure

Icons ship in the `dev.gersak/tyrell-icons` jar, which `dev.gersak/tyrell` depends on. There's no npm package for them. The files are `.cljc`, so the same defs work in ClojureScript and on the JVM.

```clojure
(ns app.icons
  (:require [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]
            [tyrell.heroicons.outline :as hero]
            [tyrell.fav6.brands :as brands]))

(icons/register!
 {:mail        lucide/mail
  :action-down lucide/chevron-down   ; any name you like
  :user        hero/user-circle
  :github      brands/github})

[:ty-icon {:name "action-down"}]
```

`register!` takes keyword or string keys and writes to `window.tyIcons`, which `tyrell.components` sets up. Call it once at startup, before the first render. If `tyrell.js` comes from a `<script>` tag that may load after your code, use `icons/register-async!`: same map, retries until `window.tyIcons` exists.

Prefer the npm files? `(:require ["tyrell-components/icons/lucide" :refer [mail]])` works too and tree-shakes the same way. Pass them to `register!` like any string.

**Tree-shaking.** A release build (`:advanced`) keeps only the defs you reference. Two ways to lose that:

- Building names at runtime, such as `(symbol "lucide" name)`. The compiler can't see which defs you use.
- Registering a whole namespace, such as `(ns-publics 'tyrell.lucide)`. Every icon ships.

If the icons are dynamic, register every candidate up front.

**On the server.** Inline the def into the tag and skip the registry:

```clojure
(ns app.pages
  (:require [hiccup2.core :as h]
            [tyrell.lucide :as lucide]))

[:ty-icon {:size "lg"} (h/raw lucide/mail)]
```

## In JavaScript

Named imports from a set, then `registerIcons` once at the entry point. Works the same for React, Vue, Svelte and vanilla.

```js
import { registerIcons } from 'tyrell-components/icons/registry'
import { mail, chevronDown } from 'tyrell-components/icons/lucide'
import { userCircle } from 'tyrell-components/icons/heroicons/outline'
import { github } from 'tyrell-components/icons/fontawesome/brands'

registerIcons({
  mail,
  'action-down': chevronDown,  // the key is the name, pick any
  user: userCircle,
  github,
})
```

```html
<ty-icon name="action-down"></ty-icon>
```

The key is the name you use in `name="…"`. Shorthand `{ chevronDown }` registers the name `chevronDown`; nothing converts it to `chevron-down`.

**Tree-shaking.** Only named imports are kept. `import * as lucide from '…/icons/lucide'` followed by `registerIcons(lucide)` ships all 1,861.

**SSR.** Register in the same client-only place you import `tyrell-components` (a `'use client'` component, `onMount`, and so on).

**CDN script plus npm icons.** If the components come from the CDN `<script>` but the icons from npm, register with `window.tyIcons.register(…)`. `registerIcons` from `…/icons/registry` would be a second copy of the registry that `<ty-icon>` never reads.

## In HTML

With the CDN script there's nothing to import. Either slot the SVG:

```html
<ty-icon size="lg">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">…</svg>
</ty-icon>
```

or register by name through `window.tyIcons`:

```html
<script type="module">
  await customElements.whenDefined('ty-icon')
  tyIcons.register({ mail: '<svg viewBox="0 0 24 24">…</svg>' })
</script>

<ty-icon name="mail"></ty-icon>
```

Use `currentColor` for `fill` and `stroke` so `ty-text-*` classes tint the icon.

**From the server.** To register by name without a build, have the backend print the map as JSON in the page:

```clojure
[:script {:type "module"}
 (h/raw (str "await customElements.whenDefined('ty-icon');"
             "tyIcons.register(" (json/write-str {"mail" lucide/mail}) ")"))]
```

Registered names work in content swapped in later (HTMX, Datastar), so register once per page.

## Custom SVGs

The registry takes any SVG string:

```js
registerIcons({ 'company-logo': '<svg viewBox="0 0 24 24">…</svg>' })
```

```clojure
(icons/register! {:company-logo "<svg viewBox=\"0 0 24 24\">…</svg>"})
```

## Size and motion

```html
<ty-icon name="loader" size="sm" spin></ty-icon>
<ty-icon name="heart" size="24" pulse tempo="slow"></ty-icon>
```

- `size`: `xs` `sm` `md` `lg` `xl` `2xl`, or pixels `12` `14` `16` `18` `20` `24` `32` `48` `64` `80` `96`.
- `spin`, `pulse`: animations. `tempo`: `slow` or `fast`.

## Why is my icon a faint circle?

An unknown name renders a faint placeholder circle, and nothing is logged. Check, in order:

1. **Registered?** In the console, `tyIcons.has('mail')`. `tyIcons.list()` shows every registered name.
2. **Same name?** Names match exactly: `chevronDown`, `chevron-down` and `action-down` are three different names.
3. **Registered before use?** Registering later works (icons update), but a typo in the key never will.
