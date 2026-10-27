# Multi-framework: Reagent + UIx + Replicant on one page

Each framework renders inside its own custom element (`tyrell.shim/define!`), loaded as a separate shadow-cljs module on first use. The counters use `ty-button`; the shared-state views read one Reagent `r/atom` from all three frameworks; the "hosts" demos nest one framework's element inside another's tree.

## Run

```bash
npm install                 # copies tyrell.css / tyrell-theme.css into public/css
npm run dev                 # shadow-cljs -A:dev watch dev
```

Open http://localhost:3020 and spawn counters. The module load log at the bottom shows each module loading the first time it's needed.

`npm run release` builds into `../../../gersak.github.io/articles/multi-framework/js`, outside this repo, for the article this demo belongs to.

## Versions

| Package | Version |
|---|---|
| `dev.gersak/tyrell` (Clojars) | `1.0.0-RC18` |
| `tyrell-components` (npm) | `1.0.0-RC18` |
| `reagent` | `2.0.0-alpha2` |
| `com.pitch/uix.core` / `uix.dom` | `1.0.1` |
| `no.cjohansen/replicant` | `2025.06.21` |

`app.core` requires `tyrell.components`, which registers the `ty-*` elements; without it the buttons stay unknown elements.

Ports: the app on 3020, the shadow-cljs server on 9642, nREPL on 7893.
