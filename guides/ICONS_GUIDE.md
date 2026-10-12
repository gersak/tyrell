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

Icons ship as one Clojars jar per set: `dev.gersak/tyrell-icons-lucide`, `-heroicons`, `-material` and `-fontawesome`. `dev.gersak/tyrell` brings Lucide. For the others add `dev.gersak/tyrell-icons` (every set) or just the set jar you need. There's no npm package for them. The files are `.cljc`, so the same defs work in ClojureScript and on the JVM.

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

**On the server.** Keep the name → SVG map in one namespace and let the extract tool (below) write it out as a static `icons.js`. Pages load that file once, cached, and templates use names like everywhere else:

```clojure
(ns app.icons
  (:require [tyrell.lucide :as lucide]
            [tyrell.heroicons.outline :as hero]))

(def registry
  {:mail        lucide/mail
   :action-down lucide/chevron-down
   :user        hero/user-circle})
```

```clojure
[:script {:src "https://cdn…/tyrell.js"}]
[:script {:src "/icons.js" :defer true}]   ; right after tyrell.js
…
[:ty-icon {:name "action-down"}]
```

Or inline the def into the tag and skip the registry. Nothing to load first, but every page repeats the SVG:

```clojure
[:ty-icon {:size "lg"} (h/raw lucide/mail)]
```

**Ship only what you use on the JVM.** The JVM has no `:advanced` pass, so an uberjar carries every def of every set you depend on (Material alone is 6.6 MB). `tyrell.icons.build/extract` does the trimming ahead of time: clj-kondo's analysis finds the icon vars your code uses (`lucide/mail`, referred names, `require` calls, the `:clj` side of `.cljc`; not strings or comments), and the tool writes trimmed copies of the same namespaces. Your code doesn't change; only the classpath does.

```clojure
;; deps.edn
{:paths ["src" "resources"]
 :aliases
 {:dev   {:extra-deps {dev.gersak/tyrell-icons {:mvn/version "…"}}}  ; every icon while you work
  :prod  {:extra-paths ["gen-icons"]}                                 ; only the used ones
  :icons {:extra-deps {dev.gersak/tyrell-icons {:mvn/version "…"}
                       clj-kondo/clj-kondo    {:mvn/version "2026.08.04"}}
          :exec-fn tyrell.icons.build/extract
          :exec-args {:paths    ["src"]
                      :out      "gen-icons"
                      :registry app.icons/registry               ; optional:
                      :js-out   "resources/public/icons.js"}}}}  ; write icons.js
```

```bash
clj -X:icons
# tyrell.heroicons.outline     1 icon      0.6 KB  → gen-icons/tyrell/heroicons/outline.cljc
# tyrell.lucide                2 icons     0.9 KB  → gen-icons/tyrell/lucide.cljc
# registration script          3 icons     1.2 KB  → resources/public/icons.js
```

Run it before building the uberjar (or commit `gen-icons/`). Keep `gen-icons` off the `:dev` classpath: the copies use the same namespace names, so whichever comes first wins. Names the scan can't see, such as ones built at runtime, go in `:include [tyrell.lucide/heart]`. `:svg-dir "resources/icons"` also writes each icon as `resources/icons/lucide/mail.svg` for template engines that include files. Unknown names are listed at the end, so a typo shows up there.

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

Server-rendered pages (Flask, Django, Go, Rails, HTMX, Datastar) with the components from the CDN script: build your icons into one small `icons.js` and serve it next to your other static files. The browser fetches it once and caches it, every page and every swapped-in fragment uses the names, and the bundler keeps only what you import.

```js
// icons.js
import { mail, chevronDown } from 'tyrell-components/icons/lucide'
import { userCircle } from 'tyrell-components/icons/heroicons/outline'

await customElements.whenDefined('ty-icon')
window.tyIcons.register({
  mail,
  'action-down': chevronDown,
  user: userCircle,
})
```

```bash
npm i -D tyrell-components esbuild
npx esbuild icons.js --bundle --minify --format=esm --outfile=static/icons.js
```

```html
<script src="https://cdn…/tyrell.js"></script>
<script type="module" src="/static/icons.js"></script>   <!-- right after tyrell.js -->

<ty-icon name="action-down"></ty-icon>
```

Register through `window.tyIcons`, not `registerIcons`: the components come from the CDN script, and an imported registry would be a second copy `<ty-icon>` never reads. Until `icons.js` runs, names render as a faint placeholder; loading it in `<head>` right after `tyrell.js` keeps that to the first frames. Clojure backends get the same file without Node: see `:js-out` [above](#in-clojure).

**No build at all?** Slot the SVG straight from your template. `<ty-icon>` only sizes and colors it, so nothing has to load first, at the cost of repeating the SVG on every page:

```html
<ty-icon size="lg">{% include "icons/mail.svg" %}</ty-icon>
```

Use `currentColor` for `fill` and `stroke` so `ty-text-*` classes tint the icon.

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
