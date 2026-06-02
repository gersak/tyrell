# Changelog

All notable changes to the Tyrell web components library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-RC10] - 2026-06-02

Headline: **OKLCH brand layer**. Drop `tyrell-brand.css` in next to `tyrell.css`, set 1–2 CSS variables, and the entire library rebrands coherently in light and dark mode. The 186 hexes in `tyrell.css` stay untouched — the new layer overrides them via the cascade. Companion site demo at `/docs/theming` lets you drag sliders and copy a ready-to-paste `:root` snippet.

### Added — Brand layer (`packages/core/css/tyrell-brand.css`)

A single opt-in CSS file. Load AFTER `tyrell.css`. Five-tier customisation surface:

1. **Seeds** — `--ty-brand-hue`, `--ty-brand-chroma`. The two primary knobs. Drive primary, secondary, neutral, surfaces, inputs, solid-button fills, focus rings.
2. **Per-flavor hue anchors** — `--ty-success-hue` (default 145°), `--ty-warning-hue` (75°), `--ty-danger-hue` (25°). Semantic colors stay green/orange/red across brand changes by default; override to retint.
3. **L-curve** — five variables (`--ty-l-strong / -bold / -base / -soft / -faint`) plus three bg L-stops shape the emphasis ladder. `:root` is tuned for light mode; `html.dark` redefines with inverted values.
4. **Saturation curve** — five per-shade chroma multipliers (`--ty-c-strong-mult / -bold-mult / -base-mult / -soft-mult / -faint-mult`) plus three bg multipliers reshape the per-shade saturation.
5. **Secondary rotation** — `--ty-secondary-offset` (default 60°) — secondary rotates from brand by this angle. Set to 30 for a close sibling, 120 for triadic, 180 for complement. Or detach entirely via explicit `--ty-secondary-hue`.

Every other flavor's chroma defaults to `calc(var(--ty-brand-chroma) * <ratio>)` (success ×1.08, warning ×1.15, danger ×1.31) so a single chroma slider scales every flavor's saturation proportionally while preserving the emphasis hierarchy. Pin any flavor with a literal `--ty-{flavor}-chroma: 0.14`.

### Added — Modal `beforeclose` event

- **Cancellable `beforeclose` event on `<ty-modal>`** — fires before the modal closes. Consumers can call `event.preventDefault()` to abort and render their own confirm UI for unsaved-state flows. Detail carries `reason: 'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native'`.
- **`.hide({ force: true })`** on the modal's imperative API — bypasses the cancellable event. Use after your own confirm UI captures consent.
- **`onBeforeClose` React prop** on `<TyModal>` — same target-guarded pattern as `onOpen`/`onClose`.

### Added — Version banners

- `tyrell-components` and `tyrell-react` each log their loaded version once on first import: `[tyrell-components] v1.0.0-RC10`. Programmatic access via `window.tyVersion` / `window.tyReactVersion` and the new `VERSION` named export from each package.

### Changed (breaking) — `mild` → `bold` rename

The second-strongest emphasis token's internal name changed: `--ty-color-{flavor}-mild` is now `--ty-color-{flavor}-bold`. The word "mild" fought its position in the emphasis ladder (it was *more* emphatic than base, not less). The new ladder reads cleanly: `strong > bold > base > soft > faint`. Same applies to `--ty-bg-*` and related tokens. **The public `+`/`-` class suffixes are unchanged** — only the internal token names changed, so most consumers see no breakage.

### Removed (breaking) — `protected` attribute on `<ty-modal>`

The native `confirm()` fallback was inflexible and ugly. New consumers should listen for the cancellable `beforeclose` event (above) and render their own confirm UI.

```html
<!-- before -->
<ty-modal protected>…</ty-modal>

<!-- after — for the same native-confirm behavior -->
<ty-modal onbeforeclose="if (!confirm('Discard?')) event.preventDefault();">…</ty-modal>
```

### Removed (breaking) — `accent` flavor

`--ty-color-accent-*`, `--ty-bg-accent-*`, `--ty-border-accent-*` tokens and `.ty-text-accent` / `.ty-bg-accent` / etc. utility classes are gone. Accent was visually identical to primary after the brand-layer rewrite; the duplicate namespace added noise. Migrate to `primary` (29 site files migrated as part of this change).

### Fixed — Brand-coherence

Every component now follows the brand layer for color. Hardcoded `rgba`/hex values that previously ignored brand changes are routed through `var(--ty-color-…)` or `color-mix(in oklab, var(--ty-color-…), transparent)`:

- **Focus rings** on `<ty-input>` (6 sites) and `<ty-date-picker>` (5 sites) — previously hardcoded to the original Tyrell blue/violet/green/red/amber rgbas. Now `color-mix(var(--ty-color-{flavor}) 10%, transparent)` in light mode, 15% in dark.
- **`--ty-input-shadow-focus`** — was hardcoded `rgba(59, 130, 246, 0.1)`. Now routes through `color-mix(var(--ty-color-primary), transparent)`.
- **`<ty-tooltip>`** default flavor — was `#1f2937` literal. Now `var(--ty-color-neutral-strong)` so tooltips invert cleanly with theme.
- **Custom scrollbar** thumb/track — was `rgba(0,0,0,…)`. Now `color-mix(var(--ty-color-neutral-bold), transparent)` at varying opacity per state.
- **`<ty-scroll-container>` edge shadows** — same treatment.
- **`<ty-date-picker>` surface shadow** — routes to `var(--ty-shadow-lg)`.
- **Solid neutral button** was a washy mid-grey at L_base. Now routes to `--ty-color-neutral-strong` (light) / `--ty-color-neutral-faint` (dark) — a dark-grey "default action" button in both modes.

### Fixed — Modal & popup event leaks

- **Core modal `dialog.onclose` guarded** with `event.target === dialog`. Child popups (`<ty-dropdown>`, `<ty-multiselect>`, `<ty-date-picker>`) dispatch their own bubbling `close` events; without the guard, the modal's internal `<dialog>` element treated those as its own close signal and closed the parent modal whenever a child popup inside it closed.
- **React wrapper event-bubble leak.** `TyModal` / `TyPopup` / `TyDatePicker` listeners for `open`/`close` fired on bubbled events from child popups (e.g., a `<TyDropdown>` inside a modal closing would trigger the modal's `onClose`, causing the modal to actually close). All three wrappers now guard with `event.target === element`. Companion fix to the core-layer guard above.

### Fixed — Dark mode brand layer

`tyrell-brand.css` `html.dark` block now explicitly re-declares the color/bg/border tokens it computes from the L-curve. Previously `tyrell.css`'s `html.dark` definitions out-ranked `:root` brand-layer definitions on selector specificity (0,1,1 vs 0,1,0), so the brand-hue slider did nothing in dark mode.

### Fixed — Ghost token references

- `tooltip.ts` referenced `--ty-color-info` (no `info` flavor exists in Tyrell) — the info-flavor variant was removed entirely.
- `tag.ts` referenced `--ty-border-mildstrong` (a typo for a token that never existed) — replaced with `--ty-border`.

### Internal — React wrappers

All 24 React wrappers migrated to a shared `useBooleanProperty` helper that:

1. Correctly coerces `"false"` string to boolean `false` (not truthy).
2. Imperatively syncs the JS property in `useEffect` on React 18 where custom-element boolean attribute removal is unreliable when a prop flips from `true` to `false`. Affected props: `disabled`, `required`, `clearable`, `loading`, `readonly`, `open`, `multiline`, `spin`, `pulse`, and modal close-on-* flags.

### Internal — Wizard CSS

Per-component CSS variable count dropped from 43 to 20; hardcoded literals from 11 to 4 (the four remaining are pure geometry — header padding, progress height, circle size, border width). Removed per-state `-bg` / `-color` indirection; step circles read accent variables directly. Routed radius / shadow / transitions through global scale tokens (`--ty-radius-lg`, `--ty-shadow-md`, `--ty-transition-duration`). Replaced legacy `--ty-text-*` references with brand-coherent `--ty-color-neutral-*` so wizard labels retint with brand. `color-mix` switched from `in srgb` to `in oklab`.

### Internal — Site polish

- Surface-demo borders softened: outer `ty-canvas` no longer has a border (it's the page surface, not a card); inner `ty-content` uses `ty-border-soft` instead of `ty-border`. Hierarchy reads from surface tones, not heavy lines.
- Site header and right-sidebar (TOC) borders moved from `ty-border-strong` / `ty-border` to `ty-border-soft`.
- CSS Guide architecture section refreshed to reflect 180+ tokens, 6 flavors × 5 emphasis levels (was "7 colors × 5 variants"), and the brand-layer story.
- New interactive Theming playground at `/docs/theming` — drag sliders, watch every component on the page retint live, copy a paste-ready `:root` snippet.

---

## [1.0.0-RC9] - 2026-05-13

### Wizard CSS variable system

`ty-wizard` now exposes a complete `--ty-wizard-*` token family for theming without touching Shadow DOM internals.

**Accent aliases** — one variable per state, each falling back to a semantic Tyrell color:

```css
--ty-wizard-active-accent:    var(--ty-color-primary)
--ty-wizard-completed-accent: var(--ty-color-success)
--ty-wizard-error-accent:     var(--ty-color-danger)
--ty-wizard-pending-accent:   var(--ty-color-neutral)
```

Flip all "active" chrome to your brand color with a single variable:
```css
ty-wizard { --ty-wizard-active-accent: #6366f1; }
```

**Fine-grained tokens** — per-state circle colors, border, text, glow shadows, and layout:

```css
/* Container */
--ty-wizard-bg, --ty-wizard-border, --ty-wizard-radius, --ty-wizard-shadow

/* Per state: completed / active / pending / error */
--ty-wizard-completed-bg, --ty-wizard-completed-border, --ty-wizard-completed-text
--ty-wizard-completed-glow  /* color-mix(…accent 10%, transparent) */
/* …active, pending, error follow the same pattern */

/* Progress line */
--ty-wizard-line-bg, --ty-wizard-line-completed-bg

/* Indicators bar */
--ty-wizard-indicators-bg, --ty-wizard-indicators-border

/* Step labels */
--ty-wizard-label-active, --ty-wizard-label-completed
--ty-wizard-label-pending, --ty-wizard-label-error

/* Transitions */
--ty-wizard-transition-duration, --ty-wizard-transition-easing
```

Width and height are set by the `width`/`height` attributes — they are not public theming tokens.

---

### Dropdown & Multiselect — loading state

`ty-dropdown` and `ty-multiselect` now show a loading overlay while an async search is in flight. Set `loading` (boolean attribute) to activate.

**Default slot fallback:** a spinner + "Searching…" label, matching the options popup visually (same background, border, radius, shadow).

**Custom content:** override via `slot="loading"`:
```html
<ty-dropdown loading>
  <span slot="loading">Fetching results…</span>
  …
</ty-dropdown>
```

**CSS variables** for the loading overlay:
```css
--ty-loader-bg, --ty-loader-border, --ty-loader-radius, --ty-loader-shadow
```

---

### Dropdown — external-search selection recovery

`ty-dropdown` now attaches a `MutationObserver` to its light-DOM children. When a consumer replaces `ty-option` children (the standard external-search refresh pattern), the component re-establishes the visual selection for the current value automatically — no extra code required. The observer is torn down on disconnect.

---

### Mobile fixes

- `ty-dropdown` — fixed fullscreen mobile mode layout regressions
- `ty-multiselect` — fixed tag rendering and selection management in mobile fullscreen mode

---

## [1.0.0-RC6] - 2026-05-05

### Version scheme

NPM packages (`tyrell-components`, `tyrell-react`) move from the `TC*` to the `RC*` scheme to align with the Clojars release cadence. RC6 is the first coordinated cross-registry release; older `TC7`–`TC11` versions remain on NPM but are superseded.

### React 18 prop-to-property bridging

`tyrell-react` wrappers now use a single `needsPropertyBridge` helper (`packages/react/src/utils/react-version.ts`) to gate the imperative property-sync `useEffect` that exists to work around React 18's unreliable prop-to-property bridging on custom elements. On React 19+ the gate short-circuits and React's native bridging takes over; the workaround stays active on React 18 with no behavior change.

The same gating was applied to seven affected wrappers: `TyDropdown`, `TyInput`, `TyTextarea`, `TyDatePicker`, `TyMultiselect`, `TyCheckbox`, `TyCalendar`.

**Bug fix:** `TySwitch` and `TyRadio` previously had no property bridging at all, so flipping `checked={true}` → `checked={false}` could leave the visual state stuck under React 18. They now mirror the `TyCheckbox` pattern (gated on `needsPropertyBridge`).

## [1.0.0-TC8] - 2026-05-04

### `ty-icon` slot mode

`ty-icon` now accepts an SVG (or any element) as a light-DOM child. When children are present, the registry/`name=` fallback is hidden automatically — the slotted content renders instead. The size scale, animations (`spin`/`pulse`/`tempo`), and `::slotted(ty-icon)` sizing contract used by `ty-button`/`ty-input`/`ty-dropdown`/`ty-date-picker`/`ty-tag` slots all keep working unchanged because they target the `<ty-icon>` host element.

This is the recommended pattern for server-rendered HTML stacks (HTMX, Datastar, Flask, Django, Rails, Phoenix, PHP) that already produce inline SVG via template partials. No client-side icon registration, no fetch, no FOUC, no CORS:

```html
<ty-icon size="lg">
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>
</ty-icon>

<ty-button size="lg" flavor="primary">
  <ty-icon slot="start">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>
  </ty-icon>
  Save
</ty-button>

<ty-icon spin>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>
</ty-icon>
```

Existing `name=` registry usage is unchanged. When both are provided (slotted SVG and `name=`), the slotted SVG wins per standard slot semantics.

---

## [1.0.0-TC6] - 2026-05-01

### 💥 Breaking Changes

#### `delay` attribute renamed to `debounce`

The `delay` attribute on input-style components has been renamed to `debounce` to align with industry-standard terminology (lodash, RxJS, Material UI, etc.) and to clearly distinguish it from single-shot hover delays.

Affected components:
- `ty-input` — `delay` → `debounce`
- `ty-dropdown` — `delay` → `debounce`
- `ty-multiselect` — `delay` → `debounce`

React props renamed accordingly (`TyInput`, `TyDropdown`, `TyMultiselect`).

**Not affected:**
- `ty-tooltip` — keeps its `delay` attribute (semantically a single-shot show-delay, not a debounce of rapid events)
- `ty-resize-observer` — already used `debounce`

**Migration:**

```html
<!-- Before -->
<ty-input delay="300" placeholder="Search..."></ty-input>
<ty-dropdown delay="500" not-searchable></ty-dropdown>
<ty-multiselect delay="150" external-search></ty-multiselect>

<!-- After -->
<ty-input debounce="300" placeholder="Search..."></ty-input>
<ty-dropdown debounce="500" not-searchable></ty-dropdown>
<ty-multiselect debounce="150" external-search></ty-multiselect>
```

```tsx
// React — before
<TyInput delay={300} />
<TyDropdown delay={500} notSearchable />
<TyMultiselect delay={150} externalSearch />

// React — after
<TyInput debounce={300} />
<TyDropdown debounce={500} notSearchable />
<TyMultiselect debounce={150} externalSearch />
```

---

## [1.0.0-RC4] - 2026-03-25

### New Components

4 new web components added (19 → 23 total):

- **`ty-wizard`** + **`ty-step`** — Multi-step stepper with progress line, step indicators, completion tracking, and horizontal/vertical orientation. Carousel-based navigation between steps.
- **`ty-scroll-container`** — Scroll wrapper with edge shadow indicators showing there's more content above/below. Custom scrollbar styling, configurable max-height, horizontal overflow support.
- **`ty-resize-observer`** — Self-observing utility element that tracks its own dimensions in a global registry (`window.tyResizeObserver`). Used by `tyrell.layout` for container-aware responsive layouts.

All 4 components include React wrappers in `tyrell-react`.

### Mobile Enhancements

- **Calendar** — Fullscreen mobile calendar with touch-optimized scrolling, merged from `feature/mobile-calendar` branch
- **Dropdown** — Mobile fullscreen mode with improved touch interactions
- **Multiselect** — Mobile fullscreen mode matching dropdown behavior
- **Numeric inputs** — Mobile support for currency, percent, and compact input types
- **Buttons** — `wide` attribute for full-width mobile-friendly buttons, responsive size guidelines

### Documentation Overhaul

Complete restructuring of all documentation into `guides/` folder.

#### Added
- **`guides/clj/ROUTING_GUIDE.md`** - Standalone tyrell.router guide (extracted from Replicant guide)
  - Full API: `link`, `navigate!`, `rendered?`, `init!`, query params
  - Authorization with roles/permissions, automatic landing redirects
  - Framework-agnostic — works with any ClojureScript library
- **`guides/clj/I18N_GUIDE.md`** - Internationalization guide for tyrell.i18n
  - Keyword-based and string-based translations
  - Number formatting (currency, percent, compact) via Intl.NumberFormat
  - Date/time formatting (presets, relative time) via Intl.DateTimeFormat
  - Async loading from URLs (EDN/JSON), Locale protocol
- **`guides/clj/LAYOUT_GUIDE.md`** - Responsive layout guide for tyrell.layout
  - Container-aware breakpoints (vs CSS media queries)
  - `with-window`, `with-container`, `with-resize-observer` macros
  - Breakpoint queries, responsive values, grid helpers, aspect ratio
- **`guides/DATASTAR_TY_GUIDE.md`** - Datastar + Tyrell guide (moved from root)

#### Changed
- **All guides moved to `guides/`** with subdirectories:
  - `guides/` — general (TY_GUIDE, CSS_GUIDE, DATASTAR_TY_GUIDE)
  - `guides/js/` — JavaScript/React (REACT_TY_GUIDE)
  - `guides/clj/` — ClojureScript (REPLICANT_TY, ROUTING, I18N, LAYOUT, COMPONENT, CODE_SPLITTING)
- **CSS_GUIDE.md** rewritten — pure class reference, surfaces vs backgrounds distinction, dark mode toggle examples, color customization with `:root.dark`
- **REPLICANT_TY_GUIDE.md** rewritten
  - Removed: state management, folder structure, philosophy sections, routing (moved to own guide), performance tips, testing patterns
  - Added: `^js` type hints on all event handlers, event detail table for every component, per-component event examples, slot examples (start/end)
- **REACT_TY_GUIDE.md** cleaned — removed philosophy sections, added slot examples
- **DATASTAR_TY_GUIDE.md** cleaned — removed philosophy sections, added slot examples
- **TY_GUIDE.md** cleaned — removed "Rules" philosophy framing, kept component reference
- **CLAUDE.md** updated with grouped guide references

#### Removed
- **`packages/cljs/CLJS_GUIDE.cljs`** (2223 lines) — superseded by individual guides in `guides/clj/`
- State management sections from all guides
- Folder structure sections from all guides
- "Golden Rule" / philosophy sections from all guides
- Performance tips, testing patterns, common pitfalls sections

### Fixed

- **`ensureStyles` duplicate stylesheet accumulation** — `ensureStyles()` appended a stylesheet reference on every call, even if already adopted. Components calling it from `render()` (tabs, calendar, dropdown, wizard, modal, etc.) accumulated duplicate `adoptedStyleSheets` on every property change. Added `includes()` guard to prevent duplicates.

---

## [0.3.1] - 2026-02-XX

### ✨ Added

#### Documentation

- **COMPONENT_GUIDE.md** - Guide for building Web Components with `tyrell.shim`
  - Replicant, UIx, and Reagent integration examples
  - Shadow DOM styling with `defstyles` macro
  - Form participation patterns
  - Properties vs Attributes handling
  - Hot reload support for development

- **CODE_SPLITTING.md** - Guide for shadow-cljs code splitting
  - Module configuration for lazy loading
  - Lazy component wrapper patterns
  - Preloading strategies
  - Bundle analysis tips

#### ClojureScript Package

- **`tyrell.context` namespace** - Restored for calendar component locale support
  - `*locale*` dynamic var for locale binding

### Changed

#### README Improvements

- **Landing README** completely rewritten
  - ClojureScript-focused with UIx and Replicant examples
  - Accurate `tyrell.router` API documentation (using `link`, `navigate!`, `rendered?`)
  - Accurate `tyrell.i18n` examples with `tyrell.i18n.number` and `tyrell.i18n.time` namespaces
  - Added "Build Your Own Components" section showcasing `tyrell.shim`
  - Added prominent link to live demo at https://gersak.github.io/tyrell
  - Removed "Work in Progress" messaging
  - Added links to Vanilla JS and React guides at top

- **packages/cljs/README.md** updated
  - Added component building examples with `tyrell.shim`
  - Updated event handling syntax to use `(.. % -detail -value)`

### Fixed

#### cljdoc Analysis

- **Fixed cljdoc-analyzer failure** - `tyrell.components.core` namespace not found
  - Moved `ty/core.cljs` from `src/ty/` to `components/ty/`
  - This file required component namespaces not included in library JAR

- **Fixed deps.edn paths**
  - Corrected `:ty-lib` alias path from `"src/clj"` to `"src"`
  - Added `"components"` to `:dev` alias extra-paths

- **Added missing dependency**
  - Added `dev.gersak/timing {:mvn/version "0.7.0"}` to `:dev` alias

---

## [0.2.0] - 2024-01-XX

### 🎉 Major Release - TypeScript Migration Complete

This is a **major milestone release** that represents a complete rewrite of the Tyrell component library in TypeScript while maintaining the powerful ClojureScript infrastructure for advanced features.

---

## ✨ Added

### TypeScript Components (NEW!)

- **Complete TypeScript port** of all 19 web components to `packages/core/src/components/`
  - `button.ts` - Button component with flavor and size variants
  - `calendar.ts` - Full calendar orchestration with year/month/day navigation
  - `calendar-month.ts` - Month view component with custom day rendering
  - `calendar-navigation.ts` - Calendar navigation controls
  - `checkbox.ts` - Checkbox form control
  - `copy.ts` - Copy-to-clipboard component
  - `date-picker.ts` - Date picker with calendar integration
  - `dropdown.ts` - Desktop and mobile dropdown with search
  - `icon.ts` - Icon component with registry support
  - `input.ts` - Text input with formatting and validation
  - `modal.ts` - Modal dialog with backdrop and focus trapping
  - `multiselect.ts` - Multi-selection dropdown with tags
  - `option.ts` - Option component for dropdowns
  - `popup.ts` - Popup positioning component
  - `tab.ts` - Individual tab component (NEW in this release!)
  - `tabs.ts` - Tab container component (NEW in this release!)
  - `tag.ts` - Tag/badge component for multiselect
  - `textarea.ts` - Multi-line text input
  - `tooltip.ts` - Tooltip component

### TyComponent Base Class Architecture

- **New `TyComponent` base class** (`packages/core/src/base/ty-component.ts`)
  - Unified property/attribute lifecycle management
  - Declarative property configuration
  - Automatic type coercion (string, boolean, number, object, array)
  - Property validation and custom coercion functions
  - Property aliases support (e.g., `not-searchable`, `not-clearable`)
  - Smart rendering - only triggers when visual properties change
  - Built-in ElementInternals support for form association
  - Framework compatibility (React, Vue, Reagent property capture)

- **PropertyManager** utility (`packages/core/src/utils/property-manager.ts`)
  - Centralized property storage and lifecycle
  - Type-safe property access
  - Change tracking and validation
  - Event emission for property changes

### Icon Registry System

- **Icon registry** (`packages/core/src/utils/icon-registry.ts`)
  - Centralized icon storage with Map-based architecture
  - Support for custom SVG icon registration
  - Tree-shakeable icon imports
  - Global `window.ty` API for easy integration
  - Icon watcher system for dynamic updates

- **window.ty API** for script tag usage:
  ```javascript
  window.tyrell.icons.register({ iconName: '<svg>...</svg>' })
  window.tyrell.icons.get('iconName')
  window.tyrell.icons.has('iconName')
  window.tyrell.icons.list()
  window.tyrell.version // '0.2.0'
  ```

### Build System & Tooling

- **Vite configuration** improvements
  - `vite.config.ts` - Main build configuration
  - `vite.config.dev.ts` - Development server (port 3000)
  - `vite.config.cdn.ts` - CDN build optimization
  - HMR (Hot Module Reload) for development
  - Source maps for debugging
  - Terser minification for production

### Documentation & Examples

- **Updated React example** (`examples/react-nextjs/`)
  - Icon registration pattern with new icon system
  - TypeScript integration examples
  - Dashboard example page

- **New icons example page** showing icon registration patterns

- **Updated Reagent example** (`examples/reagent/`)
  - Integration with TypeScript components
  - ClojureScript wrapper usage patterns

- **Updated HTMX-Flask example** with new icon loading

### ClojureScript Components Package

- **New `packages/cljs/` structure** with organized component wrappers
  - Separated ClojureScript wrappers from TypeScript implementation
  - Build configuration for ClojureScript package
  - Component-specific styling organization

---

## 🔄 Changed

### Architecture Changes

- **Migrated from ClojureScript to TypeScript** for all UI components
  - Maintained ClojureScript infrastructure for routing, i18n, and site
  - Components now in `packages/core/src/` instead of `lib/ty/components/`
  - TypeScript provides better type safety and broader ecosystem compatibility

- **Dropdown component** major improvements
  - Implemented on top of TyComponent base class
  - Better separation of desktop and mobile implementations
  - Improved search functionality
  - Enhanced keyboard navigation
  - Better styling and visual feedback

- **Multiselect component** refactored
  - Adjusted to TyComponent implementation
  - Improved tag rendering and management
  - Better mobile experience
  - Enhanced clear functionality

- **Calendar component** enhancements
  - Better state management
  - Improved locale support (130+ languages)
  - Enhanced navigation controls
  - Better date formatting

### Mobile Experience

- **Improved mobile implementations** across components
  - Better dropdown mobile menu UX
  - Modal improvements for mobile viewports
  - Touch-friendly interactions
  - Responsive layout adjustments

### Styling System

- **Dropdown styling** improvements
  - Better visual hierarchy
  - Improved focus states
  - Enhanced hover effects
  - Consistent with design system

- **Tabs component styling** (`TABS_STYLING.md` documentation)
  - Comprehensive styling guide for tabs
  - CSS customization patterns

### Documentation Site

- **Site package updates** for compatibility with TypeScript components
  - Fixed integration issues
  - Updated component demos
  - Improved code examples
  - Better documentation structure

### Build & Distribution

- **NPM package structure** optimized
  - Better tree-shaking support
  - Smaller bundle sizes
  - Clearer entry points
  - Improved TypeScript definitions

---

## 🐛 Fixed

- **Highlight rendering** in dropdown components
- **Replicant integration** issues with site
- **Icon loading errors** in various contexts
- **Mobile menu** display issues in dropdown
- **Only odd tabs rendering** bug (weird edge case!)
- **Form integration** improvements for all form components
- **Keyboard navigation** edge cases in dropdowns
- **Focus management** in modal and popup components
- **Clear button** functionality in searchable dropdowns

---

## 💥 Breaking Changes

### Import Paths Changed

**Before (v0.1.x - ClojureScript)**:
```clojure
(ns my-app
  (:require [tyrell.components.button :as button]))
```

**After (v0.2.0 - TypeScript)**:
```typescript
import { TyButton } from 'tyrell-components'
// or
import 'tyrell-components/css/tyrell.css'
```

### Icon System Changed

**Before**: Icons were built-in and automatically available

**After**: Icons must be registered explicitly:
```typescript
import { check, heart } from 'tyrell-components/icons/lucide'
import { registerIcons } from 'tyrell-components/icons/registry'

registerIcons({ check, heart })
```

**OR** using the global API:
```html
<script>
  window.tyrell.icons.register({
    'check': '<svg>...</svg>',
    'heart': '<svg>...</svg>'
  })
</script>
```

### Component Property Changes

Some components now use **TyComponent base class** with unified property handling:
- Properties now have declarative configuration
- Validation and coercion are automatic
- Attribute aliases (e.g., `not-searchable`) are supported
- Form association is built-in for form controls

### Package Structure

- TypeScript components moved to `packages/core/`
- ClojureScript wrappers moved to `packages/cljs/`
- Root `package.json` removed (monorepo structure)

---

## 📚 Documentation Added

- **`BUILDING_WITH_TYCOMPONENT.md`** - Comprehensive guide for building components with TyComponent base class
- **`CSS_GUIDE.md`** - Tyrell CSS system usage guide (Tyrell for colors, Tailwind for everything else)
- **`TYPESCRIPT_DEV_GUIDE.md`** - Development workflow for TypeScript components
- **`PROJECT_SUMMARY.md`** - Updated with TypeScript architecture details
- **`packages/cljs/README.md`** - ClojureScript package documentation
- **`packages/cljs/components/ty/components/TABS_STYLING.md`** - Tabs styling guide

---

## 🚀 Migration Guide

### For ClojureScript Projects

If you were using v0.1.x ClojureScript components:

1. **Install the new package**:
   ```clojure
   ;; deps.edn
   {:deps {dev.gersak/tyrell {:mvn/version "0.2.0"}}}
   ```

2. **Components still work** via ClojureScript wrappers in `packages/cljs/`
3. **Icon registration** now required (see Icon System changes above)

### For New TypeScript Projects

1. **Install via NPM**:
   ```bash
   npm install tyrell-components
   ```

2. **Import components**:
   ```typescript
   import 'tyrell-components/css/tyrell.css'
   import { TyButton, TyDropdown } from 'tyrell-components'
   ```

3. **Register icons** you need:
   ```typescript
   import { check, heart } from 'tyrell-components/icons/lucide'
   import { registerIcons } from 'tyrell-components/icons/registry'
   
   registerIcons({ check, heart })
   ```

### For React Projects

See updated example in `examples/react-nextjs/`:
- Use components directly as custom elements
- Register icons at app startup
- TypeScript definitions included for full type safety

### For Vanilla JS / HTMX

Use the global `window.ty` API:
```html
<script src="https://cdn.jsdelivr.net/npm/tyrell-components/dist/tyrell.js"></script>
<script>
  window.tyrell.icons.register({ /* your icons */ })
</script>
```

---

## 🎯 Version 0.2.0 Goals Achieved

✅ **Complete TypeScript migration** - All 19 components ported
✅ **TyComponent architecture** - Unified, maintainable base class
✅ **Icon registry system** - Flexible, tree-shakeable, easy to use
✅ **Framework compatibility** - Works with React, Vue, Reagent, vanilla JS
✅ **Production ready** - Published to NPM as `tyrell-components`
✅ **Improved mobile UX** - Better dropdown and modal experiences
✅ **Comprehensive docs** - Guides for building, styling, and using components
✅ **Zero runtime dependencies** - Pure web standards

---

## 🔮 Future Plans (v0.3.0+)

- Additional components (data table, file upload, progress indicators)
- Enhanced a11y (accessibility) features
- More icon library integrations
- Performance optimizations
- Additional framework adapters
- Component testing utilities

---

## 📦 Package Information

- **NPM Package**: `tyrell-components` v1.0.0-rc.4
- **Clojars Package**: `dev.gersak/tyrell` v1.0.0-RC4
- **License**: MIT
- **TypeScript**: ✅ Full type definitions included
- **Framework Support**: React, Vue, Reagent, HTMX, Vanilla JS

---

## 🙏 Acknowledgments

This release represents a significant architectural evolution while maintaining backward compatibility through ClojureScript wrappers. Thank you to everyone who contributed feedback and tested the alpha versions!

---

**For detailed component documentation, visit the documentation site or check the README files in each package.**
