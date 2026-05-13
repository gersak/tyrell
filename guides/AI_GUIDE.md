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
| Icon registration and tree-shaking | [js/JAVASCRIPT_GUIDE.md § Icon tree-shaking](js/JAVASCRIPT_GUIDE.md#icon-tree-shaking) |
| Routing in CLJS apps | [clj/ROUTING_GUIDE.md](clj/ROUTING_GUIDE.md) |
| Internationalization in CLJS | [clj/I18N_GUIDE.md](clj/I18N_GUIDE.md) |
| Responsive layout in CLJS | [clj/LAYOUT_GUIDE.md](clj/LAYOUT_GUIDE.md) |
| CLJS web component shim | [clj/COMPONENT_GUIDE.md](clj/COMPONENT_GUIDE.md) |
| Lazy loading with shadow-cljs | [clj/CODE_SPLITTING.md](clj/CODE_SPLITTING.md) |

## Non-negotiable rules

1. **Tyrell for colors, Tailwind for everything else.** Never `bg-blue-500` — use `ty-bg-primary`. Never `text-gray-900` — use `ty-text` / `ty-text+` / `ty-text++`.
2. **Event payload lives on `event.detail`.** Always `event.detail.value`, never `event.value`.
3. **Properties vs attributes.** Booleans, arrays, objects → JS property. Strings → attribute. In React: just props. In Vue: `:prop`. In Svelte: `prop:`.
4. **Icons require explicit registration.** `<ty-icon name="check">` is a runtime lookup; the bundler can't connect the string to the export. Use `registerIcons({ check, ... })`.
5. **`customElements.define` needs a browser.** In SSR frameworks (Next.js, Nuxt, SvelteKit, Astro), import `tyrell-components` only in client boundaries.

## For agents working in a *consumer* project

If the user is using Tyrell in their own project (not editing Tyrell itself), drop this snippet into their `CLAUDE.md`:

→ [AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md)

## For agents working *on* Tyrell itself

Read the repo's `CLAUDE.md` and `PUBLISHING.md`. Do not edit generated files (`packages/core/lib/`, `packages/core/dist/`, `packages/core/src/icons/*.ts`).
