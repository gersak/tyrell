# Helix + Tyrell Example

Compact demo: ClojureScript + [Helix](https://github.com/lilactown/helix) + the `tyrell-react` wrappers over Tyrell web components.

**Versions:** `tyrell-components` / `tyrell-react` 1.0.0-RC20 (npm), `dev.gersak/tyrell` 1.0.0-RC20 (Clojars), Helix 0.2.0, React 18.

Helix gives you JSX-style macros (`($ Component …)`) over the same `tyrell-react` package that Reagent, re-frame and UIx use.

## What it shows

- Icon registration with `tyrell.icons` + `tyrell.lucide` (tree-shaken at advanced compile).
- Wrappers via `(:require ["tyrell-react" :as ty])`, used as `($ ty/Input ...)`, `($ ty/Select ...)`.
- **A form with no validation code.**
  - The fields carry their rules: `:required`, `:type "email"`, `:minLength`, `:pattern`.
  - The browser checks them before `:onSubmit` runs; failing fields show their message and the first takes focus.
  - The one hand-set `:error` is a server-side one: an email ending in `@taken.com`.
- `ty/Select`, single with icon options and `:multiple` with flavored options, plus `ty/SelectedOptions` chips.
- An imperative-ref `ty/Modal` (`.show` / `.hide`) and `ty/Tooltip`s.
- `event.detail` read from a CLJS handler, shown live in the state pane.

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
| `deps.edn` | `lilactown/helix 0.2.0` + `dev.gersak/tyrell` from Clojars |

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

## Dependencies

- `tyrell-components` (web components + CSS) is npm-installed and imported once with `(:require ["tyrell-components"])`. `postinstall` copies its CSS into `public/css`.
- `tyrell-react` is the React wrapper layer, npm-installed alongside it.
- `dev.gersak/tyrell` (Clojars) brings the CLJS side: icon registry, router, i18n, layout. Lucide icons come from `dev.gersak/tyrell-icons-lucide`.

## Where this fits

- Site guide: https://gersak.github.io/tyrell/guides/clojurescript (production once docs deploy)
- Markdown quickstart: `guides/clj/QUICKSTART.md`
- Sister examples: `examples/reagent`, `examples/uix`, `examples/replicant`
