# Agent Instructions Snippet

Copy the block below into your project's AI agent instruction file. Same content, different file per agent:

| Agent | File |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` (legacy) or `.cursor/rules/*.mdc` |
| Windsurf | `.windsurfrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cline | `.clinerules` |
| Aider | `CONVENTIONS.md` (passed via `--read`) |

The content is agent-agnostic — only the file location differs. Trim the framework links your project doesn't use.

---

```markdown
## Tyrell Web Components

This project uses [Tyrell](https://github.com/gersak/tyrell) for UI components — `tyrell-components` on NPM and `dev.gersak/tyrell` on Clojars.

### Rules
- **Colors come from Tyrell, layout from Tailwind.** Use `ty-bg-primary` / `ty-text++` / `ty-elevated`, never `bg-blue-500` / `text-gray-900`.
- **Dividers inside surfaces use `ty-divide-y` / `ty-divide-x`**, not Tailwind's `divide-y` / `divide-x`. Tyrell's variant follows the surrounding surface's border tone via CSS-var inheritance and switches with dark mode; Tailwind's defaults don't.
- **Event payload lives on `event.detail`.** Read `event.detail.value` (or `.values` for multiselect, `.checked` for checkbox/switch). Never `event.value`.
- **Properties vs attributes.** Booleans, arrays, objects → set as JS property. Strings → attribute is fine.
  - React: just props. Vue: `:prop`. Svelte: `prop:`. CLJS via `tyrell.react`: camelCase props through `:>` (Reagent) / `$` (Helix); UIx auto-translates kebab-case.
- **Icons need explicit registration.** Import named icons and call `registerIcons({...})` (JS) or `(tyrell.icons/register! {...})` (CLJS). Never `import * as L from 'tyrell-components/icons/lucide'` — that ships all 1,636 icons.
- **SSR**: `customElements.define` needs a browser. Import `tyrell-components` only in client boundaries (`'use client'` in Next.js, `.client.ts` in Nuxt, `if (browser)` in SvelteKit).
- **Composition rules.** `ty-dropdown` and `ty-multiselect` take `<ty-option>` / `<ty-tag>` children (not native `<option>`). `ty-tabs`/`ty-wizard` take `<ty-tab>`/`<ty-step>`. `ty-radio-group` takes `<ty-radio>`.

### Components available
ty-button, ty-input, ty-textarea, ty-checkbox, ty-switch, ty-radio-group / ty-radio,
ty-dropdown / ty-option, ty-multiselect / ty-tag, ty-copy, ty-file-upload,
ty-date-picker, ty-calendar / ty-calendar-month, ty-modal, ty-popup, ty-tooltip,
ty-tabs / ty-tab, ty-wizard / ty-step, ty-icon, ty-resize-observer, ty-scroll-container.

### Docs (raw markdown — fetch when needed)
- **Start here**: https://raw.githubusercontent.com/gersak/tyrell/master/guides/AI_GUIDE.md
- **Full index**: https://gersak.github.io/tyrell/llms.txt
- Component API (attributes, slots, events): https://raw.githubusercontent.com/gersak/tyrell/master/guides/TY_GUIDE.md
- CSS design system: https://raw.githubusercontent.com/gersak/tyrell/master/guides/CSS_GUIDE.md
- Bundling / icons / SSR: https://raw.githubusercontent.com/gersak/tyrell/master/guides/js/JAVASCRIPT_GUIDE.md

The AI map and llms.txt link to every framework-specific guide (React, Vue, Svelte, HTMX, Datastar, UIx, Reagent, Helix, Replicant). Fetch the one that matches your stack.
```

---

That's the whole snippet. Trim the components list to what you use; trim the docs URLs if you only target one framework. The two "start here" links are the minimum every project should keep — together they let the agent navigate to anything else on demand.
