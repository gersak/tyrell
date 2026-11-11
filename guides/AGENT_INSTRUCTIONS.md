# Tyrell — rules for coding agents

<!-- Source of truth. Ships in tyrell-components and tyrell-react as AGENTS.md, stamped with the package version (packages/core/scripts/pack-agent-docs.mjs); its facts are checked against source before every pack (check-agent-docs.mjs). Keep it under 9,000 characters: the Claude Code plugin injects it whole. -->

For apps that **use** Tyrell (`tyrell-components`, `tyrell-react`, `dev.gersak/tyrell`). Version: <!--tyrell-version-->master (unreleased)<!--/tyrell-version-->. Not for editing Tyrell's own source.

Your training data barely knows Tyrell; Tailwind/shadcn/Bootstrap habits are wrong here, and these rules win. The full docs for this version (`guides/`, `CHANGELOG.md`) ship next to this file: grep them before guessing.

## 1. If Tyrell has a component, use it

Never hand-roll a control: no `.btn`, `.pill`, `.badge`, `.chip`, `.seg`, `.toggle`, `.drawer`, `.dropdown` or `.tabs` CSS, and no native `<button>`, `<select>`, `<input>`, `<textarea>` or `<dialog>` in app markup.

| Need | Use |
|---|---|
| Any action (submit, open, delete, icon) | `ty-button` |
| Status, category, count, filter chip | `ty-tag` (§4) |
| Pick one or many from a list | `ty-select` + `ty-option`; `multiple` + `ty-selected-options` for chips |
| A few choices (up to 7) instead of a segmented control | `ty-select` with `slot="trigger"` (§6) |
| Switch views or sections | `ty-tabs` + `ty-tab` (scrolls by default; `fixed` for 2–5 short labels) |
| Steps | `ty-wizard` + `ty-step` |
| On/off | `ty-switch`; in a form list `ty-checkbox` |
| One of several, all visible | `ty-radio-group` + `ty-radio` |
| Text, number, money, percent, big numbers | `ty-input` (`type="currency"`, `"percent"`, `"compact"`) |
| Multi-line text | `ty-textarea` |
| Date or date-time | `ty-date-picker`; month grid `ty-calendar` |
| Dialog, drawer, bottom sheet | `ty-modal` (`sheet`: full screen, slides up below 768px) |
| Anchored panel or menu | `ty-popup` |
| Hint on hover/focus | `ty-tooltip`, not `title=` |
| Copyable value | `ty-copy` |
| File drop/pick | `ty-file-upload` |
| Reorder, kanban | `ty-sortable` |
| Scroll area with edge shadows | `ty-scroll-container` |
| Icon | `ty-icon` |
| Field label, error text | the `label` / `error` attribute on the component |

Plain HTML with Tyrell color classes and Tailwind is right for layout, cards and panels, tables, sidebars and nav, headings and text, KPI/stat blocks, empty states and links.

## 2. A prototype sets the look, Tyrell sets the widgets

Given an HTML or Figma prototype, keep its layout, spacing, typography and palette, and build every control from §1: `.btn` → `ty-button`, `.pill`/`.badge` → `ty-tag`, `.seg` → `ty-select` trigger or `ty-tabs`, `.drawer` → `ty-modal`. Bring its palette in through the theme (§7). "Match the prototype" never means copying its component CSS or its hex colors.

## 3. Sizes (px)

| | xs | sm (default) | md | lg | xl |
|---|---|---|---|---|---|
| Field: `ty-input`, `ty-select`, `ty-date-picker`, `ty-copy` | 28 | 32 | 36 | 40 | 44 |
| `ty-button` | 24 | 28 | 32 | 36 | 40 |
| `ty-tag` | 20 | 24 | 28 | 32 | 36 |

Below 640px fields drop `lg` to 36 and `xl` to 40 (below 480px `xl` to 36). Buttons and tags don't change.

- **Field and button in one row: field `md` + button `lg`** (both 36). It lines up at every width. Smaller row: field `sm` + button `md` (32). Avoid field `lg` + button `xl`: it breaks below 640px.
- Button inside a field's `end` slot: the field's size name.
- The defaults never line up (field 32, button 28): in a row, set `size` on both.
- Tag beside a button or field: match heights (tag `lg` = button `md` = field `sm`; tag `xl` = button `lg` = field `md`). In tables and dense lists: `sm`.
- Fields are `width: 100%`: in a flex row the field takes the free space, the button keeps its label width.
- A `ty-button` that is a direct child of a flex column stretches; add `self-start`.

## 4. Tags

- For status (semantic flavor), category or type (neutral), counts, filter chips (`clickable`, `dismissible`) and picked values (`ty-selected-options` renders them for `ty-select multiple`).
- Not for decoration, headings, navigation, actions (`ty-button`) or sentences.
- The label says what it is: "Overdue", "Retail", "3 units". If a reader can't tell what a tag means, remove it. No unexplained tags in top bars.
- `neutral` by default. A semantic flavor only for state, with one meaning per flavor across the app: `success` ok/active, `warning` needs attention, `danger` problem, `primary` selected/emphasis.
- Tags hug their content. Don't stretch them to full width.

## 5. Surfaces

- From the back: `ty-canvas` (app background) → `ty-content` (main area) → `ty-elevated` (cards, panels, sidebars) → `ty-floating` (modals, popovers, menus). `ty-input` is the background of form controls.
- `ty-modal` and `ty-popup` are transparent: put a `ty-floating` panel inside, with your own padding and radius.
- Dividers between rows inside a surface: `ty-divide-y` / `ty-divide-x`, not Tailwind's `divide-*`.
- `ty-bg-*` is for small accents (a callout box, a highlighted row, a status dot). Never for cards, and never to fake a button or badge.

## 6. Dropdowns (`ty-select`)

- Options are `ty-option` (not `<option>` or `ty-tag`). The selection is the select's `value`; `<ty-option selected>` selects nothing, so server-rendered HTML carries `value="…"`.
- **Up to 7 options: give it a trigger** (`slot="trigger"`). The search row only appears above 7 options, so a short list doesn't need a form field. In toolbars and filter bars, `compact` is the plain alternative.
- More options, or typed search: the default field. `external-search` for remote lists, `allow-create` for a tags input.
- A slotted trigger keeps the value, form submit, ARIA, keyboard and the error line. The select takes the click and the keys, so don't add `clickable` to a trigger tag. You render the trigger: show the current value in it and update it on `change`. No × button; call `clear()`.
- The list is at least 320px wide, or as wide as the trigger; `--ty-select-popup-width` sets it.
- **Status picker:** the trigger is a `ty-tag` in the current option's flavor, with a chevron.

```html
<ty-select name="status" value="active">
  <ty-tag slot="trigger" flavor="success">Active <ty-icon slot="end" name="chevron-down"></ty-icon></ty-tag>
  <ty-option value="active">Active</ty-option>
  <ty-option value="paused">Paused</ty-option>
</ty-select>
```

- **Sort, view or filter switch:** the trigger is a `ty-button` sized for its row: icon, current label, chevron.

```html
<ty-select name="sort" value="newest">
  <ty-button slot="trigger" size="lg"><ty-icon slot="start" name="arrow-down-up"></ty-icon> Newest <ty-icon slot="end" name="chevron-down"></ty-icon></ty-button>
  <ty-option value="newest">Newest</ty-option>
  <ty-option value="oldest">Oldest</ty-option>
</ty-select>
```

## 7. Colors and theme

- Colors come only from Tyrell classes; layout, spacing and type from Tailwind. Never `bg-blue-500`, `text-gray-900` or hex colors in markup.
- Text: `ty-text++`, `ty-text+`, `ty-text`, `ty-text-`, `ty-text--`. Semantic: `ty-text-{flavor}`, `ty-bg-{flavor}` (`+` stronger, `-` softer), `ty-border-{flavor}`.
- Flavors: `primary`, `success`, `danger`, `warning`, `neutral`. There is no `info`, `secondary` or `accent`. For a project flavor `X`, define `--ty-color-X`, `--ty-bg-X`, `--ty-border-X` (and `--ty-solid-X` for solid buttons), then use `flavor="X"`.
- Brand: load `tyrell-theme.css` after `tyrell.css` and set `--ty-primary-seed: oklch(0.5 <chroma> <hue>)` on `:root`. Not just `--ty-primary-hue`/`--ty-primary-chroma` on `:root`: dark mode re-declares them and the brand vanishes there.

## 8. Events, properties, icons, SSR

- The payload is on `event.detail`: `.value` (`.values` for `multiple`), `.checked` for checkbox and switch. Never `event.value`. `ty-tabs` fires `ty-tab-change` with `detail.activeId`.
- Booleans, arrays and objects are properties; strings can be attributes. React: props via `tyrell-react`. Vue: `:prop`. Svelte: `prop:`. Reagent `:>` and Helix `$` need camelCase props; UIx translates kebab-case.
- `<ty-icon name="chevron-down">` needs registering first, and the key is the name: `registerIcons({ 'chevron-down': chevronDown })`, named imports from `tyrell-components/icons/lucide` (never `import *`). CLJS: `(tyrell.icons/register! {...})`. Server-rendered apps can slot an inline `<svg>` (`currentColor`) into `<ty-icon>` instead.
- `customElements.define` needs a browser: import Tyrell only in client code (`'use client'`, `.client.ts`, `if (browser)`).

## 9. Your stack

- React: `tyrell-react` (`TyButton`, `TySelect`, …). ClojureScript: `dev.gersak/tyrell`, which installs this npm package; UIx, Reagent, Helix via `tyrell.react`, Replicant and vanilla as raw `<ty-*>` hiccup. Server-rendered (HTMX, Datastar, templates): plain `<ty-*>` markup; fields post like native ones.
- Guides: `TY_GUIDE.md` (every attribute, slot, event), `CSS_GUIDE.md` (colors, surfaces, sizing), `js/` (React, Vue, Svelte, HTMX), `clj/`, `DATASTAR_TY_GUIDE.md`.

## 10. Before you say done

- Search your markup and CSS for `.btn`, `.pill`, `.chip`, `.badge`, `.seg`, `.drawer`, `<button`, `<select`, `<dialog`, hex colors and Tailwind color classes. Each hit needs a reason or a Tyrell replacement.
- Check every row where a field and a button sit together (§3).
- Look at the result in a real browser, with the real data flow running.
