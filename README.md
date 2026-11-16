<blockquote style="color: #414863">
<p><em>"After playing around with Replicant, I realized I could build Web Components without React — actually, even without Replicant.</em></p>

<p><em>I'm wondering if it's called 'Replicant' because of <strong>Blade Runner</strong> (I love Blade Runner).</em></p>

<p><em>Maybe I could name my own library something similar... Tyrell? No, that feels pretentious.</em></p>

<p><em>Anyway, I don't really want to type something long like <code>tyrell-button</code>. It should be shorter — maybe <code>ty-button</code>.</em></p>

<p><strong><em>Yes! Let's call it ty."</em></strong></p>
</blockquote>

<blockquote style="color: #414863">
<p><em>Nine months later…</em></p>

<p><em>"Nine months in, <strong>ty</strong> still reads as <strong>'thank you'</strong> — Just had to cut that and call it properly."</em></p>

<p><em>"The library is <strong>Tyrell</strong>. CLJS namespaces are <code>tyrell.*</code> now (<code>tyrell.router</code>, <code>tyrell.components</code>, <code>tyrell.lucide</code>). Component tags stay <code>ty-*</code> — web custom elements need the dash anyway, and two letters earn their keep. CSS classes stay <code>ty-*</code> for the same reason. The prefix earned the shortcut; the brand didn't."</em></p>

<p><strong><em>"No thanks involved. Just replicants."</em></strong></p>
</blockquote>

# Tyrell

[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/tyrell-components/badge)](https://www.jsdelivr.com/package/npm/tyrell-components)
[![NPM Version](https://img.shields.io/npm/v/tyrell-components.svg)](https://www.npmjs.com/package/tyrell-components)
[![Clojars Project](https://img.shields.io/clojars/v/dev.gersak/tyrell.svg)](https://clojars.org/dev.gersak/tyrell)

Web Components that work everywhere: React, Vue, Svelte, HTMX, Datastar, vanilla JS, ClojureScript. The framework-agnostic successor to [Toddler](https://github.com/gersak/toddler).

**[Docs, live demos, all components →](https://gersak.github.io/tyrell)**

## Install

**CDN** (any stack, including server-rendered Go, Python, Clojure):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-rc.22/css/tyrell.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-rc.22/css/tyrell-theme.css">
<script src="https://cdn.jsdelivr.net/npm/tyrell-components@1.0.0-rc.22/dist/tyrell.js"></script>
```

**npm:** `npm install tyrell-components` (React wrappers: `tyrell-react`)

**ClojureScript** (`deps.edn`; shadow-cljs installs the npm package itself):

```clojure
{:deps {dev.gersak/tyrell              {:mvn/version "1.0.0-rc.22"}
        dev.gersak/tyrell-icons-lucide {:mvn/version "1.0.0-rc.22"}}}
```

## Use

```html
<ty-button flavor="primary">Save</ty-button>
<ty-select label="Country" value="de">
  <ty-option value="us">United States</ty-option>
  <ty-option value="de">Germany</ty-option>
</ty-select>
```

Rebrand in light and dark mode with one variable: `:root { --ty-primary-seed: oklch(0.5 0.13 200) }`. Preview at [/docs/theming](https://gersak.github.io/tyrell/docs/theming).

## AI coding agents

Every release ships a rules card, `AGENTS.md`, for that exact version. An agent follows it only if the card is in its context before it writes UI; a docs URL is not enough.

| Project | Do this once |
|---|---|
| Claude Code, all projects | `/plugin marketplace add gersak/tyrell`, then `/plugin install tyrell@tyrell`. It finds the Tyrell version (npm, deps.edn, or a CDN pin in Go/Python/HTML), loads its card, and lints UI changes. [Details](plugins/tyrell/README.md) |
| npm or shadow-cljs (any agent) | `npx tyrell-components agents`: writes the card into `AGENTS.md` and imports it from `CLAUDE.md`. Re-run after upgrading. |
| CDN only: Go, Python, server-rendered (any agent) | `npx tyrell-components@<version> agents`, with the version your `<script>` tag pins. Without `@<version>`, npx takes the latest release. No Node: `curl -o AGENTS.md https://cdn.jsdelivr.net/npm/tyrell-components@<version>/AGENTS.md` and add `@AGENTS.md` to `CLAUDE.md`. |

## Guides

- **JS:** [Vanilla](guides/js/JAVASCRIPT_GUIDE.md) · [React](guides/js/REACT_TY_GUIDE.md) · [Vue](guides/js/VUE_TY_GUIDE.md) · [Svelte](guides/js/SVELTE_TY_GUIDE.md)
- **ClojureScript:** [Quickstart](guides/clj/QUICKSTART.md) · [UIx](guides/clj/UIX_TY_GUIDE.md) · [Reagent](guides/clj/REAGENT_TY_GUIDE.md) · [Helix](guides/clj/HELIX_TY_GUIDE.md) · [Replicant](guides/clj/REPLICANT_TY_GUIDE.md) · [Router](guides/clj/ROUTING_GUIDE.md) · [i18n](guides/clj/I18N_GUIDE.md) · [Layout](guides/clj/LAYOUT_GUIDE.md) · [Own components](guides/clj/COMPONENT_GUIDE.md)
- **Server-driven:** [HTMX](guides/js/HTMX_TY_GUIDE.md) · [Datastar](guides/DATASTAR_TY_GUIDE.md)
- **Reference:** [CSS](guides/CSS_GUIDE.md) · [Icons](guides/ICONS_GUIDE.md) · [Full guide](guides/TY_GUIDE.md) · [CHANGELOG](CHANGELOG.md)

MIT License
