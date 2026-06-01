# Tyrell CSS System

Tyrell classes handle colors. Use Tailwind for everything else (spacing, layout, typography, sizing).

## Surfaces vs Backgrounds

**Surfaces** are for layout areas — cards, panels, sidebars, modals, page background, form fields:

```html
<div class="ty-canvas">         <!-- App background -->
<div class="ty-content">        <!-- Main content area -->
<div class="ty-elevated">       <!-- Cards, panels (with shadow) -->
<div class="ty-floating">       <!-- Modals, dropdowns (with shadow) -->
<div class="ty-input">          <!-- Form controls background -->
```

**Backgrounds** are for small UI elements — buttons, tags, badges, toasts, alerts, status indicators:

```html
<div class="ty-bg-primary">     <!-- Button, badge -->
<div class="ty-bg-success-">    <!-- Success toast -->
<div class="ty-bg-danger">      <!-- Error indicator -->
```

Do not use `ty-bg-*` for cards or panels. Do not use `ty-elevated` for a badge.

### Surface Borders & Dividers

Each surface exposes three border knobs (color, width, style) via CSS vars. Defaults are `transparent` color, `var(--ty-border-width)` (1px) width, `solid` style — so surfaces ship with no visible border until you opt in.

```css
:root {
  --ty-elevated-border: var(--ty-border);   /* show a 1px ty-border on cards */
  --ty-floating-border: var(--ty-border-bold);
  /* Width and style use --ty-border-width and `solid` unless overridden */
}
```

Pattern: `--ty-{surface}-border` (color), `--ty-{surface}-border-width`, `--ty-{surface}-border-style`. Surfaces: `elevated`, `floating`, `canvas`, `content`, `input`.

For dividers between siblings inside a surface, use `ty-divide-y` / `ty-divide-x`:

```html
<div class="ty-elevated">
  <ul class="ty-divide-y">
    <li>row 1</li>
    <li>row 2</li>
    <li>row 3</li>
  </ul>
</div>
```

The divider color is **contextual** — each surface points `--ty-divide-color` at its own `--ty-{surface}-border` token. So tuning a surface's border once also changes any dividers placed inside it.

```html
<!-- Per-instance override -->
<ul class="ty-divide-y" style="--ty-divide-color: var(--ty-border-strong);">
```

**Prefer `ty-divide-y`/`ty-divide-x` over Tailwind's `divide-y`/`divide-x` when working with Tyrell surfaces** — Tailwind's defaults are baked at build time and don't follow your theme in dark mode. The Tyrell utilities use CSS vars that auto-switch.

## Background Colors (Semantic)

3 variants per color: stronger (+), base, softer (-).

```html
<div class="ty-bg-primary+">    <!-- Stronger -->
<div class="ty-bg-primary">     <!-- Base -->
<div class="ty-bg-primary-">    <!-- Softer -->
```

Available colors: `primary`, `secondary`, `success`, `danger`, `warning`, `neutral`.

## Text Colors (5-Variant System)

Base text hierarchy (no color, just emphasis):

```html
<p class="ty-text++">           <!-- Maximum emphasis -->
<p class="ty-text+">            <!-- High emphasis -->
<p class="ty-text">             <!-- Normal text -->
<p class="ty-text-">            <!-- Reduced emphasis -->
<p class="ty-text--">           <!-- Minimal emphasis -->
```

Semantic text colors — same 5 variants per color:

```html
<p class="ty-text-primary++">   <!-- Maximum emphasis primary -->
<p class="ty-text-primary+">    <!-- High emphasis primary -->
<p class="ty-text-primary">     <!-- Normal primary -->
<p class="ty-text-primary-">    <!-- Reduced primary -->
<p class="ty-text-primary--">   <!-- Minimal primary -->
```

Available colors: `primary`, `secondary`, `success`, `danger`, `warning`, `neutral`.

## Border Colors

Base borders (no color, just emphasis) — 5 variants:

```html
<div class="ty-border++">       <!-- Maximum -->
<div class="ty-border+">        <!-- Strong -->
<div class="ty-border">         <!-- Normal -->
<div class="ty-border-">        <!-- Soft -->
<div class="ty-border--">       <!-- Minimal -->
```

Semantic borders — base only:

```html
<div class="ty-border-primary">
<div class="ty-border-secondary">
<div class="ty-border-success">
<div class="ty-border-danger">
<div class="ty-border-warning">
<div class="ty-border-neutral">
```

## Hover / Focus States

```html
<div class="hover:ty-bg-primary">
<input class="focus:ty-border-primary">
```

## Dark Mode

Tyrell uses the `dark` class on `<html>` to switch themes. All Tyrell color variables respond automatically.

### Requirements

Add a `dark` class to `<html>` for dark mode:

```html
<!-- Light mode (default) -->
<html>

<!-- Dark mode -->
<html class="dark">
```

### Toggling Theme (JavaScript)

```javascript
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
```

### Toggling Theme (ClojureScript)

```clojure
(defn toggle-theme! []
  (let [cl (.-classList js/document.documentElement)
        dark? (.toggle cl "dark")]
    (.setItem js/localStorage "theme" (if dark? "dark" "light"))))
```

### Initializing from Stored Preference

```javascript
// Run before page renders (e.g. in <head>) to prevent flash
const theme = localStorage.getItem('theme')
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
if (theme === 'dark') document.documentElement.classList.add('dark');
```

## Color Customization

Override via CSS custom properties:

```css
:root {
  --ty-color-primary-strong: #0034c7;
  --ty-color-primary-bold: #1c40a8;
  --ty-color-primary: #4367cd;
  --ty-color-primary-soft: #60a5fa;
  --ty-color-primary-faint: #93c5fd;
  --ty-bg-primary-bold: #bfdbfe;
  --ty-bg-primary: #dbeafe;
  --ty-bg-primary-soft: #eff6ff;
}

/* Dark mode overrides */
:root.dark {
  --ty-color-primary-strong: #93c5fd;
  --ty-color-primary-bold: #60a5fa;
  --ty-color-primary: #3b82f6;
  --ty-color-primary-soft: #1d4ed8;
  --ty-color-primary-faint: #1e3a5f;
  --ty-bg-primary-bold: #1e3a8a;
  --ty-bg-primary: #172554;
  --ty-bg-primary-soft: #0f172a;
}
```

Pattern: `--ty-color-{name}-{strong|bold|soft|faint}`, `--ty-bg-{name}-{bold|soft}`, `--ty-border-{name}`.

---

## Per-Component Color Overrides

The customization above retunes the *whole palette*. To recolor a single instance instead — a one-off brand button, a highlighted input, a green dropdown — set the component's CSS variables on the host element. Custom properties inherit through the shadow DOM, so a value on the host wins over the global default inside that component only.

Three places you can set them:

```html
<!-- inline on one element -->
<ty-button style="--ty-button-bg: #ff6600;">…</ty-button>

<!-- in a stylesheet, scoped by attribute -->
<style>
  ty-button[flavor="brand"] {
    --ty-button-bg: #7c3aed;
    --ty-button-color: white;
  }
</style>

<!-- on a wrapping container — inherits down to all descendants -->
<div style="--ty-input-border: #16a34a;">
  <ty-input></ty-input>
  <ty-dropdown>…</ty-dropdown>
</div>
```

### `<ty-button>`

Four hooks. The button reads `var(--ty-button-X, …flavor default…)`, so unset values fall back to the chosen flavor.

| Variable | Purpose |
|---|---|
| `--ty-button-bg` | Background color (used by `solid`) |
| `--ty-button-bg-hover` | Hover background (optional — flavor's hover shade is used otherwise) |
| `--ty-button-color` | Text color |
| `--ty-button-border` | Border color (used by `outlined`) |

```html
<!-- One-off brand button (solid is default, no border) -->
<ty-button style="--ty-button-bg: #ff6600;
                  --ty-button-color: white;
                  --ty-button-bg-hover: #e65c00;">
  Brand orange
</ty-button>

<!-- Gradients work too — solid has no border to interfere -->
<ty-button style="--ty-button-bg: linear-gradient(135deg, #667eea, #764ba2);">
  Gradient
</ty-button>

<!-- Define a reusable custom flavor in CSS -->
<style>
  ty-button[flavor="brand"] {
    --ty-button-bg: #7c3aed;
    --ty-button-color: white;
    --ty-button-bg-hover: #6d28d9;
    --ty-button-border: #5b21b6;
  }
</style>
<ty-button flavor="brand">Brand</ty-button>
<ty-button flavor="brand" appearance="outlined">Brand outlined</ty-button>
```

### `<ty-input>`, `<ty-dropdown>`, `<ty-multiselect>`

All form controls read the same `--ty-input-*` tokens. They're defined globally in `:root` but inherit into each component's shadow DOM, so setting one on a host overrides only that element.

| Variable | Purpose |
|---|---|
| `--ty-input-bg` | Background |
| `--ty-input-color` | Text color |
| `--ty-input-border` | Border (default state) |
| `--ty-input-border-hover` | Border on hover |
| `--ty-input-border-focus` | Border when focused |
| `--ty-input-shadow-focus` | Focus ring color (3px outer glow) |
| `--ty-input-placeholder` | Placeholder text color |
| `--ty-input-disabled-bg` | Disabled background |
| `--ty-input-disabled-border` | Disabled border |
| `--ty-input-disabled-color` | Disabled text |

Per-flavor border overrides (apply when the `flavor` attribute is set):

| Variable | Used by |
|---|---|
| `--ty-input-primary-border` | `flavor="primary"` |
| `--ty-input-secondary-border` | `flavor="secondary"` |
| `--ty-input-success-border` | `flavor="success"` |
| `--ty-input-danger-border` | `flavor="danger"` |
| `--ty-input-warning-border` | `flavor="warning"` |

```html
<!-- Highlighted input -->
<ty-input style="--ty-input-bg: #fffbeb;
                 --ty-input-border: #f59e0b;
                 --ty-input-border-focus: #d97706;
                 --ty-input-shadow-focus: rgba(245, 158, 11, 0.15);"
          placeholder="Highlighted field"></ty-input>

<!-- Green-tinted dropdown -->
<ty-dropdown style="--ty-input-bg: #f0fdf4;
                    --ty-input-border: #16a34a;
                    --ty-input-border-focus: #15803d;">
  <ty-option value="a">Apple</ty-option>
  <ty-option value="b">Banana</ty-option>
</ty-dropdown>

<!-- Multiselect with a brand tone -->
<ty-multiselect style="--ty-input-border-focus: #7c3aed;
                       --ty-input-shadow-focus: rgba(124, 58, 237, 0.2);">
  <ty-option value="x">X</ty-option>
  <ty-option value="y">Y</ty-option>
</ty-multiselect>
```

### `<ty-calendar>`, `<ty-calendar-month>`, `<ty-date-picker>`

These three share a `--ty-calendar-*` token family for the day grid, the popup surface, navigation, and the optional time section. The date-picker stub (the input-like trigger) has its own thin `--ty-date-picker-*` shim that sits on top of `--ty-input-*` — override it to style only the date-picker trigger without affecting other form fields.

#### Quick retheming via accent aliases

Three aliases drive the most-visible colors. Override any of these and selected/today/focus shift together:

| Variable | Drives |
|---|---|
| `--ty-calendar-accent` | Selected day border + nav focus outline (default: `--ty-color-primary`) |
| `--ty-calendar-today-accent` | Today's border (default: `--ty-color-secondary`) |
| `--ty-calendar-muted` | Default day text (default: `--ty-color-neutral`) |

```html
<ty-calendar style="--ty-calendar-accent: hotpink;
                    --ty-calendar-today-accent: gold;"></ty-calendar>
```

#### Day cell — fine-grained control

| Variable | Purpose |
|---|---|
| `--ty-calendar-day-color` | Default day text |
| `--ty-calendar-day-bg` | Default day background |
| `--ty-calendar-day-border` | Default day border |
| `--ty-calendar-day-radius` | Day cell border-radius |
| `--ty-calendar-day-hover-color` | Hover text |
| `--ty-calendar-day-hover-bg` | Hover background |
| `--ty-calendar-day-hover-border` | Hover border |
| `--ty-calendar-today-color` | Today text |
| `--ty-calendar-today-bg` | Today background |
| `--ty-calendar-today-border` | Today border |
| `--ty-calendar-selected-color` | Selected text |
| `--ty-calendar-selected-bg` | Selected background |
| `--ty-calendar-selected-border` | Selected border |
| `--ty-calendar-selected-hover-bg` | Selected + hover background |
| `--ty-calendar-selected-hover-border` | Selected + hover border |
| `--ty-calendar-weekend-color` | Saturday/Sunday text |
| `--ty-calendar-other-month-color` | Days from prev/next month |
| `--ty-calendar-other-month-opacity` | Other-month dimming (default `0.5`) |
| `--ty-calendar-header-color` | Weekday name row |

#### Navigation bar

| Variable | Purpose |
|---|---|
| `--ty-calendar-nav-color` | Prev/next chevron color |
| `--ty-calendar-nav-hover-color` | Chevron on hover |
| `--ty-calendar-nav-hover-bg` | Chevron button hover background |
| `--ty-calendar-nav-active-bg` | Chevron button pressed background |
| `--ty-calendar-nav-focus-outline` | Focus-visible outline (defaults to `--ty-calendar-accent`) |
| `--ty-calendar-nav-title-color` | Month/year display |

#### Popup surface (date-picker dialog)

| Variable | Purpose |
|---|---|
| `--ty-calendar-surface-bg` | Popup background |
| `--ty-calendar-surface-border` | Popup border |
| `--ty-calendar-surface-shadow` | Popup drop-shadow |
| `--ty-calendar-surface-radius` | Popup border-radius |

#### Time section (date-picker only)

| Variable | Purpose |
|---|---|
| `--ty-calendar-time-bg` | Time row background |
| `--ty-calendar-time-border` | Divider above time row |
| `--ty-calendar-time-label-color` | "Time" label color |
| `--ty-calendar-time-input-color` | HH/MM input text |
| `--ty-calendar-time-placeholder-color` | HH/MM placeholder |
| `--ty-calendar-time-icon-color` | Clock icon |

#### Date-picker stub (input-like trigger)

A thin shim over `--ty-input-*`. By default the stub looks identical to other inputs; override these to make it look distinct without affecting `<ty-input>`, `<ty-dropdown>`, etc.

| Variable | Defaults to |
|---|---|
| `--ty-date-picker-bg` | `--ty-input-bg` |
| `--ty-date-picker-color` | `--ty-input-color` |
| `--ty-date-picker-placeholder` | `--ty-input-placeholder` |
| `--ty-date-picker-border` | `--ty-input-border` |
| `--ty-date-picker-border-hover` | `--ty-input-border-hover` |
| `--ty-date-picker-border-focus` | `--ty-input-border-focus` |
| `--ty-date-picker-shadow-focus` | `--ty-input-shadow-focus` |
| `--ty-date-picker-disabled-bg` | `--ty-input-disabled-bg` |
| `--ty-date-picker-disabled-color` | `--ty-input-disabled-color` |
| `--ty-date-picker-radius` | `--ty-radius-md` |

```html
<!-- Make the date-picker trigger look like a "button" without affecting inputs -->
<ty-date-picker style="--ty-date-picker-bg: #f0fdf4;
                       --ty-date-picker-border: #16a34a;
                       --ty-date-picker-border-hover: #15803d;
                       --ty-date-picker-border-focus: #15803d;
                       --ty-date-picker-shadow-focus: rgba(22, 163, 74, 0.15);"></ty-date-picker>

<!-- Theme the popup body separately from the trigger -->
<ty-date-picker style="--ty-calendar-surface-bg: #1a1a2e;
                       --ty-calendar-surface-border: #2d2d44;
                       --ty-calendar-selected-bg: #f72585;
                       --ty-calendar-selected-color: white;"></ty-date-picker>
```

### How it works

CSS custom properties inherit through shadow DOM boundaries. When you set `--ty-button-bg` on a `<ty-button>` host, the inner `<button>` inside the shadow root resolves `var(--ty-button-bg, …flavor default…)` — finds the host's value, uses it. Unset → falls back to the flavor's design token. The same mechanism applies to inputs/dropdowns/multiselects, just via the shared `--ty-input-*` token family.

**Tip — scoping by container**: setting an override on a wrapping `<div>` cascades to every descendant component, so you can theme a whole section (e.g. a settings panel) without touching individual elements.
