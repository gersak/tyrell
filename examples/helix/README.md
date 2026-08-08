# Helix + Tyrell Example

Compact demo: ClojureScript + [Helix](https://github.com/lilactown/helix) + `tyrell-react` typed wrappers
+ Tyrell web components loaded via CDN.

This example exists to **verify the patterns documented on the ClojureScript guide page**. If you're choosing
between React-based CLJS libs, Helix gives you JSX-style macros (`($ Component …)`) over the same `tyrell-react`
package that Reagent / re-frame / UIx use.

## What it shows

- Icon registration with `tyrell.icons` + `tyrell.lucide` (tree-shaken at advanced compile)
- Typed React wrappers via `(:require ["tyrell-react" :as ty])`, used as `($ ty/Input ...)`, `($ ty/Button ...)`
- `event.detail.value` access from a CLJS event handler — bridged through the wrapper
- Composition of `<ty-icon>` inside `<ty-button>` / `<ty-input>` via the `:slot` attribute

The whole demo is a one-screen signup form with success state — small on purpose so the integration shape is clear.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3003.

The shadow-cljs nREPL is on port 7890.

## Files

| Path | Purpose |
|------|---------|
| `src/hello/core.cljs` | The demo: app, signup-form, badge — all `defnc` Helix components |
| `src/hello/icons.cljs` | Icon registration — only the icons used in the demo |
| `public/index.html` | Loads `tyrell.css` + `tyrell-theme.css` (copied by `postinstall`), then mounts the compiled CLJS |
| `shadow-cljs.edn` | dev-http on 3003, nREPL on 7890 |
| `deps.edn` | `lilactown/helix 0.2.0` + paths to the local `dev.gersak/tyrell` source |

## Helix idiom vs Reagent / UIx

The same Tyrell wrapper, three render shapes:

```clojure
;; Helix (this example)
(defnc form []
  ($ ty/Input {:value @email :on-change on-email})
  ($ ty/Button {:flavor "primary"} "Save"))

;; UIx (examples/uix)
(defui form []
  ($ ty/Input {:value @email :on-change on-email})
  ($ ty/Button {:flavor "primary"} "Save"))

;; Reagent / re-frame (examples/reagent)
(defn form []
  [:> ty/Input {:value @email :on-change on-email}]
  [:> ty/Button {:flavor "primary"} "Save"])
```

`tyrell-react` is the same npm package across all three.

## Substrate notes

- `tyrell-components` (web components + CSS) is loaded via CDN in `index.html` — no npm install for the base.
- `tyrell-react` is npm-installed because it's the React wrapper layer (separate package).
- `dev.gersak/tyrell` (CLJS-side icon registry, router, i18n, layout) is referenced from the local source via
  `deps.edn` paths — replace those with a Maven coord (`{:mvn/version "1.0.0-RC6"}`) once the artifact ships
  to Clojars.

## Where this fits

- Site guide: https://gersak.github.io/tyrell/guides/clojurescript (production once docs deploy)
- Markdown quickstart: `guides/clj/QUICKSTART.md`
- Sister examples: `examples/reagent`, `examples/uix`, `examples/replicant`
