# Tyrell for AI Agents

Treasure map. Find your context, follow the link.

## I'm building in…

| Context | Read |
|---|---|
| Plain HTML / vanilla JS | [TY_GUIDE.md](TY_GUIDE.md) → [js/JAVASCRIPT_GUIDE.md](js/JAVASCRIPT_GUIDE.md) |
| React | [js/REACT_TY_GUIDE.md](js/REACT_TY_GUIDE.md) |
| Vue 3 / Nuxt | [js/VUE_TY_GUIDE.md](js/VUE_TY_GUIDE.md) |
| Svelte 5 / SvelteKit | [js/SVELTE_TY_GUIDE.md](js/SVELTE_TY_GUIDE.md) |
| ClojureScript (UIx) | [clj/UIX_TY_GUIDE.md](clj/UIX_TY_GUIDE.md) |
| ClojureScript (Reagent / re-frame) | [clj/REAGENT_TY_GUIDE.md](clj/REAGENT_TY_GUIDE.md) |
| ClojureScript (Helix) | [clj/HELIX_TY_GUIDE.md](clj/HELIX_TY_GUIDE.md) |
| ClojureScript (Replicant / vanilla) | [clj/REPLICANT_TY_GUIDE.md](clj/REPLICANT_TY_GUIDE.md) |
| ClojureScript (quickstart, two tracks) | [clj/QUICKSTART.md](clj/QUICKSTART.md) |
| ClojureScript (substrate reference) | [clj/CLOJURESCRIPT_GUIDE.md](clj/CLOJURESCRIPT_GUIDE.md) |
| HTMX | [js/HTMX_TY_GUIDE.md](js/HTMX_TY_GUIDE.md) |
| Datastar / SSE | [DATASTAR_TY_GUIDE.md](DATASTAR_TY_GUIDE.md) |
| Other framework | [TY_GUIDE.md](TY_GUIDE.md) (web components are universal) |

## I need to know…

| Question | Read |
|---|---|
| What components exist, what props they take | [TY_GUIDE.md](TY_GUIDE.md) |
| Colors, surfaces, text classes, dark mode | [CSS_GUIDE.md](CSS_GUIDE.md) |
| Bundlers, subpath imports, code splitting, SSR | [js/JAVASCRIPT_GUIDE.md](js/JAVASCRIPT_GUIDE.md) |
| Icons: sets, registration, tree-shaking | [ICONS_GUIDE.md](ICONS_GUIDE.md) |
| Routing in CLJS apps | [clj/ROUTING_GUIDE.md](clj/ROUTING_GUIDE.md) |
| Internationalization in CLJS | [clj/I18N_GUIDE.md](clj/I18N_GUIDE.md) |
| Responsive layout in CLJS | [clj/LAYOUT_GUIDE.md](clj/LAYOUT_GUIDE.md) |
| CLJS web component shim | [clj/COMPONENT_GUIDE.md](clj/COMPONENT_GUIDE.md) |
| Lazy loading with shadow-cljs | [clj/CODE_SPLITTING.md](clj/CODE_SPLITTING.md) |

## Rules

Read [AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md) before writing markup: use the Tyrell component for every control, size pairs, tags, surfaces, dropdown triggers, theming, events, icons, SSR. It ships in every npm version as `AGENTS.md`; prefer `node_modules/tyrell-components/AGENTS.md`, which matches the installed version.

## For agents working in a *consumer* project

If the user is using Tyrell in their own project (not editing Tyrell itself), add this line to their `CLAUDE.md`:

```
@node_modules/tyrell-components/AGENTS.md
```

Other agents and CDN-only projects: `packages/core/README.md` → "AI coding agents".

## For agents working *on* Tyrell itself

Read the repo's `CLAUDE.md` if present; releases go through `scripts/publish.sh`. Do not edit generated files (`packages/core/lib/`, `packages/core/dist/`, `packages/core/src/icons/*.ts`).
