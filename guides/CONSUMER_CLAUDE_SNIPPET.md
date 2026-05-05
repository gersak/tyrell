# Consumer CLAUDE.md Snippet

Copy the block below into your project's `CLAUDE.md` if you use Ty.

---

```markdown
## Ty Web Components

This project uses [Ty](https://github.com/gersak/tyrell) (`tyrell-components`) for UI components.

### Rules
- **Colors come from Ty, layout from Tailwind.** Use `ty-bg-primary` / `ty-text++` / `ty-elevated`, never `bg-blue-500` / `text-gray-900`.
- **Dividers inside surfaces use `ty-divide-y` / `ty-divide-x`**, not Tailwind's `divide-y` / `divide-x`. Ty's variant follows the surrounding surface's border tone via CSS var inheritance and switches with dark mode; Tailwind's defaults don't.
- **Event payload is on `event.detail`.** Read `event.detail.value` (or `.values` for multiselect), never `event.value`.
- **Properties vs attributes.** Booleans, arrays, objects → set as JS property. Strings → attribute is fine.
  - React: just props. Vue: `:prop`. Svelte: `prop:`.
- **Icons need explicit registration.** Import named icons and call `registerIcons({...})`. Never `import * as L from 'tyrell-components/icons/lucide'` — that ships all 1,636 icons.
- **SSR**: `customElements.define` needs a browser. Import `tyrell-components` only in client boundaries (`'use client'` in Next.js, `.client.ts` in Nuxt, `if (browser)` in SvelteKit).

### Components available
ty-button, ty-input, ty-textarea, ty-checkbox, ty-switch, ty-radio-group / ty-radio,
ty-dropdown / ty-option, ty-multiselect / ty-tag, ty-copy, ty-date-picker,
ty-calendar / ty-calendar-month, ty-modal, ty-popup, ty-tooltip,
ty-tabs / ty-tab, ty-wizard / ty-step, ty-icon, ty-resize-observer, ty-scroll-container.

### Docs (online)
- Component API: https://github.com/gersak/tyrell/blob/master/guides/TY_GUIDE.md
- CSS / colors / surfaces: https://github.com/gersak/tyrell/blob/master/guides/CSS_GUIDE.md
- Bundling / icons / SSR: https://github.com/gersak/tyrell/blob/master/guides/js/JAVASCRIPT_GUIDE.md
- React: https://github.com/gersak/tyrell/blob/master/guides/js/REACT_TY_GUIDE.md
- Vue: https://github.com/gersak/tyrell/blob/master/guides/js/VUE_TY_GUIDE.md
- Svelte: https://github.com/gersak/tyrell/blob/master/guides/js/SVELTE_TY_GUIDE.md
- AI map: https://github.com/gersak/tyrell/blob/master/guides/AI_GUIDE.md
```

---

That's the whole snippet. Adjust the "Components available" list if you only use a subset, and remove framework links you don't need.
