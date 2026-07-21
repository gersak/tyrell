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

Tyrell ships **two layered theming systems**. Pick the one you need.

### Option 1 — OKLCH brand layer (recommended)

Load `tyrell-brand.css` after `tyrell.css`, then rebrand with one variable:

```html
<link rel="stylesheet" href=".../tyrell.css">
<link rel="stylesheet" href=".../tyrell-brand.css">
```

```css
:root {
  --ty-brand-hue: 200;        /* teal. Try 260 indigo, 30 orange, 145 emerald. */
}
```

That's it. Primary, secondary, neutral, surfaces, inputs, solid buttons, focus rings — everything retints coherently in both light and dark mode. Defaults to Tyrell blue (`230°`).

#### How it builds colors

Every color in the library is one formula on five axes:

```
oklch(
  L = L-curve[shade] × flavor-l-factor            ← Tier 3 × Tier 5
  C = flavor-chroma  × saturation-curve[shade]    ← Tier 2 × Tier 4
  H = flavor-hue                                  ← Tier 2
)
```

Pick a flavor (primary / secondary / success / warning / danger / neutral) and a shade (strong / bold / base / soft / faint). The formula gives you that cell's color. Five axes:

- **FLAVOR** — which semantic role. Each flavor carries its own hue, chroma, and l-factor seeds.
- **SHADE** — 5 emphasis stops shared across flavors. Same shade across flavors = same perceptual weight.
- **HUE** — what color family (0°–360°).
- **CHROMA** — how saturated (0 grey → ~0.4 max vivid).
- **L** — how dark or light. Light mode: low L = more emphasis. Dark mode flips the curve so high L = more emphasis.

Worked example — `--ty-color-warning-bold` in light mode:

```
L = 0.46 × 1     = 0.46     ← l-bold × warning-l-factor (default)
C = 0.26 × 1.00  = 0.26     ← warning-chroma × c-bold-mult
H = 75°                     ← warning-hue
→ oklch(0.46 0.26 75)       a punchy amber
```

Set `--ty-warning-l-factor: 0.85` and the new L becomes `0.46 × 0.85 = 0.39` — every warning shade shifts in step; primary / success / danger untouched.

The customisation surface has **five tiers**, each independent. Set just the seeds for the 90% case; reach further when needed.

---

#### Tier 1 — seeds (1 variable)

```css
:root {
  --ty-brand-hue: 200;          /* the color (0–360°) */
  --ty-brand-chroma: 0.15;      /* saturation (0–0.30) — every flavor scales proportionally */
}
```

Setting `--ty-brand-chroma: 0` collapses every flavor to grayscale. `0.30` punches up the whole palette. Success / danger / warning still pop because their chromas default to `calc(var(--ty-brand-chroma) * <ratio>)` — danger is `× 1.31`, success `× 1.08`, etc.

---

#### Tier 2 — per-flavor anchor tuning

Each semantic flavor has a hue and a chroma you can pin independently:

```css
:root {
  --ty-brand-hue: 200;

  /* Secondary rotates from brand by an offset. Override the offset or the hue directly. */
  --ty-secondary-offset: 30;            /* close sibling (default 60°) */
  /* OR: --ty-secondary-hue: 320;       /* fully detached */

  /* Semantic anchors. Override hue and/or chroma. */
  --ty-success-hue: 165;                /* brand-coherent green */
  --ty-danger-chroma: 0.20;             /* louder errors */

  /* Neutral tracks brand-hue at very low chroma by default; pin to detach. */
  --ty-neutral-hue: 230;
  --ty-neutral-chroma: 0.01;
}
```

| Flavor   | Hue var                 | Chroma var                | Default        |
|----------|-------------------------|---------------------------|----------------|
| primary  | `--ty-brand-hue`        | `--ty-brand-chroma`       | `230°` / `0.13` |
| secondary| `--ty-secondary-hue`    | `--ty-secondary-chroma`   | brand + 60° / brand chroma |
| success  | `--ty-success-hue`      | `--ty-success-chroma`     | `145°` / brand × 1.08 |
| danger   | `--ty-danger-hue`       | `--ty-danger-chroma`      | `25°` / brand × 1.31 |
| warning  | `--ty-warning-hue`      | `--ty-warning-chroma`     | `75°` / brand × 2 |
| neutral  | `--ty-neutral-hue`      | `--ty-neutral-chroma`     | brand-hue / brand × 0.04 |

---

#### Tier 3 — L-curve (emphasis ladder)

The 5-shade text ramp (`strong / bold / base / soft / faint`) is computed from shared lightness stops. Reshape the ladder by overriding any:

```css
:root {
  /* Light mode — lower L = more emphasis. */
  --ty-l-strong: 0.34;  /* darker ++ shade */
  --ty-l-bold:   0.46;
  --ty-l-base:   0.54;
  --ty-l-soft:   0.72;
  --ty-l-faint:  0.82;  /* less faded -- shade */

  /* 3-shade bg ramp uses its own L-stops. */
  --ty-l-bg-base: 0.96;
  --ty-l-bg-bold: 0.92;
  --ty-l-bg-soft: 0.98;
}
```

Use cases: compress the ladder for an "all-soft" muted palette; expand it for higher-contrast accessibility-first themes.

---

#### Tier 4 — saturation curve (per-shade chroma multipliers)

Each shade's chroma = `flavor-chroma × multiplier`. Override to make any shade more or less saturated than the curve's default:

```css
:root {
  --ty-c-strong-mult: 0.77;  /* slightly desaturated strong */
  --ty-c-bold-mult:   1.20;  /* punchier bold */
  --ty-c-base-mult:   0.92;
  --ty-c-soft-mult:   0.77;
  --ty-c-faint-mult:  0.20;  /* whisper-quiet placeholders */
}
```

Same idea for bg multipliers: `--ty-c-bg-base-mult`, `--ty-c-bg-bold-mult`, `--ty-c-bg-soft-mult`.

---

#### Tier 5 — per-flavor L-factor

A single multiplier per flavor that scales every L-curve value *only for that flavor*. Default `1` = no change. Useful when one flavor's brand-default sits too close to brand-hue on the wheel and the buttons blend.

```css
:root {
  --ty-brand-hue: 47;              /* gold brand */
  --ty-warning-l-factor: 0.85;     /* nudge warning darker so it stands apart */
}
```

The full set:

```css
--ty-primary-l-factor:   1;
--ty-secondary-l-factor: 1;
--ty-success-l-factor:   1;
--ty-warning-l-factor:   1;
--ty-danger-l-factor:    1;
--ty-neutral-l-factor:   1;
```

Effect on the formula: `L = L-curve[shade] × flavor-l-factor`. Set warning's factor to `0.85` and every warning shade (strong/bold/base/soft/faint) shifts by ×0.85; primary/success/danger untouched.

> **Note about dark mode.** The L-curve flips between modes (light: low L = emphatic; dark: high L = emphatic). A factor `< 1` darkens warning in light mode but **dims** it in dark mode. If you want symmetric "more emphatic" in both modes, set the factor in `:root` for light AND set its inverse (roughly `1 / factor`) in `html.dark`. See "Per-mode overrides" below.

---

#### Per-mode overrides

Any tier can be overridden separately for dark mode by repeating the declaration inside `html.dark`:

```css
:root {
  --ty-brand-hue: 200;             /* light mode teal */
  --ty-warning-l-factor: 0.85;     /* darker warning in light mode */
}
html.dark, html[data-theme="dark"] {
  --ty-brand-hue: 210;             /* slightly cooler teal in dark mode */
  --ty-warning-l-factor: 1.15;     /* brighter warning in dark mode */
  --ty-c-faint-mult: 0.60;         /* dark mode needs more chroma at faint */
}
```

The brand layer's `html.dark` block already redefines the L-curve with inverted defaults (`0.86 / 0.74 / 0.62 / 0.46 / 0.30`) and bumps `--ty-c-faint-mult` so dim shades don't collapse to grey. Override either to fine-tune.

---

### Option 2 — direct token override (legacy / fine-grained)

If you don't load the brand layer, or you want to override individual derived tokens, you can still write hex values directly. The brand layer doesn't block this — the cascade resolves consumer overrides past the formula's output.

```css
:root {
  --ty-color-primary-strong: #0034c7;
  --ty-color-primary-bold:   #1c40a8;
  --ty-color-primary:        #4367cd;
  --ty-color-primary-soft:   #60a5fa;
  --ty-color-primary-faint:  #93c5fd;
  --ty-bg-primary-bold:      #bfdbfe;
  --ty-bg-primary:           #dbeafe;
  --ty-bg-primary-soft:      #eff6ff;
}

html.dark {
  --ty-color-primary-strong: #93c5fd;
  /* …etc */
}
```

**Pattern:** `--ty-color-{flavor}-{strong | bold | soft | faint}`, `--ty-bg-{flavor}-{bold | soft}`, `--ty-border-{flavor}`. Flavors are `primary`, `secondary`, `success`, `danger`, `warning`, `neutral`.

Use this when:
- You have a fixed brand palette and don't need the OKLCH math
- You want to override one specific shade without abandoning the formula (set the seed AND the one token)
- You're integrating with an existing design-token system

The brand layer (Option 1) is strictly more powerful — anything you can do with Option 2 you can also do on top of Option 1. Most apps shouldn't need Option 2 at all.

---

## Custom Flavors (add your own)

The six flavors are not a closed set. Pass any identifier as `flavor` and define its design tokens — the component generates the same wiring a built-in gets (shade ramp, hover, focus ring, `+`/`-` tones). Supported by **every flavored component**: `ty-button`, `ty-tag`, `ty-switch`, `ty-radio-group` (and its `ty-radio` children), `ty-checkbox`, `ty-input`, `ty-select`, `ty-date-picker`, `ty-copy`, `ty-tooltip`, `ty-calendar` (and its `ty-calendar-month`).

Most components need only the `--ty-color-X` ramp (`ty-tag` and `ty-tooltip` also read `--ty-bg-X` / `--ty-border-X`; solid buttons read `--ty-solid-X`):

```css
/* One rule = a new flavor, usable anywhere in scope */
:root {
  /* text / border ramp — used by ty-tag, outlined + ghost buttons */
  --ty-color-brand-strong: #115e59;
  --ty-color-brand: #0d9488;
  --ty-color-brand-soft: #2dd4bf;
  --ty-color-brand-faint: #99f6e4;   /* focus ring */
  --ty-border-brand: #0d9488;

  /* backgrounds — ty-tag fills, button hover tints */
  --ty-bg-brand-bold: #99f6e4;
  --ty-bg-brand: #ccfbf1;
  --ty-bg-brand-soft: #f0fdfa;

  /* solid button fills */
  --ty-solid-brand: #0d9488;
  --ty-solid-brand-strong: #0f766e;  /* tone+ */
  --ty-solid-brand-soft: #5eead4;    /* tone- */
  --ty-solid-brand-hover: #0f766e;
  --ty-solid-brand-active: #134e4a;
  --ty-solid-brand-fg: white;
}
```

```html
<ty-button flavor="brand">Brand</ty-button>
<ty-button flavor="brand+" appearance="outlined">Stronger</ty-button>
<ty-tag flavor="brand-">softer chip</ty-tag>
```

Notes:

- **Missing tokens degrade gracefully.** A button token you didn't define falls back to the `neutral` equivalent; an undefined flavor renders as neutral. You can start with just `--ty-solid-X` + `--ty-solid-X-fg` and add the ramp later.
- **Field emphasis ladders need the shade tokens.** Flavored fields (`ty-input`, `ty-select`, `ty-date-picker`) rest on `--ty-color-X-soft` and escalate to `--ty-color-X` on hover/focus. Define only the base token and the ladder flattens — rest and focus both show the full color (visible, but no state distinction). Both the hand-picked ramp above and the quick path below provide the shades.
- **Scoping works like any CSS variable** — define on `:root` for app-wide, or on a container to scope the flavor to a section. Add a `html.dark` block for dark-mode values.
- **Per-instance overrides still win.** `--ty-button-*` variables and each component's local flavor vars (next section) take precedence over the generated token wiring — e.g. `ty-tag[flavor="X"] { --tag-bg: … }` or `ty-switch[flavor="X"] { --switch-track: … }`.
- Flavor names must be plain identifiers (letters, digits, `-`, `_`).

### The quick path: one color in, a full ramp out

Hand-picking 14 values gives you full control over every shade, but it's not the only option. Every one of those tokens can instead be *derived* from a single base color with [`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) — the same "one seed → full ramp" idea the OKLCH brand layer uses for the built-in flavors, just with a simpler formula:

```css
:root {
  --brand-base: #7c3aed; /* the only color you actually pick */

  --ty-color-brand: var(--brand-base);
  --ty-color-brand-strong: color-mix(in oklab, var(--brand-base) 80%, black);
  --ty-color-brand-soft: color-mix(in oklab, var(--brand-base) 55%, white);
  --ty-color-brand-faint: color-mix(in oklab, var(--brand-base) 30%, white);

  --ty-bg-brand: color-mix(in oklab, var(--brand-base) 12%, white);
  --ty-bg-brand-bold: color-mix(in oklab, var(--brand-base) 24%, white);
  --ty-bg-brand-soft: color-mix(in oklab, var(--brand-base) 6%, white);

  --ty-solid-brand: var(--brand-base);
  --ty-solid-brand-hover: color-mix(in oklab, var(--brand-base) 85%, black);
  --ty-solid-brand-active: color-mix(in oklab, var(--brand-base) 70%, black);
  --ty-solid-brand-strong: color-mix(in oklab, var(--brand-base) 80%, black);
  --ty-solid-brand-soft: color-mix(in oklab, var(--brand-base) 55%, white);
  --ty-solid-brand-fg: white;
}
```

Change `--brand-base` and every shade updates with it — including live, from a `<input type="color">`, since it's an ordinary CSS variable. The docs site's "CSS System" page demonstrates this working live: the "Try the Flavor Axis" section's `custom` chip is driven by exactly this formula.

Trade-off: this mixes toward flat `black`/`white`, so it won't invert correctly for dark mode the way the hand-picked values (or the real OKLCH brand layer) do — pick per-theme base colors, or a `light-dark()`/`html.dark` override for `--brand-base`, if you need that. For a flavor that's fully theme-aware out of the box, use the brand layer's own hue/chroma seeds instead (see the docs site's "Theming" page) rather than a hand-rolled custom flavor.

Each flavored component funnels its colors through a few local vars, which double as the per-instance override API (set them on the host from any page-level rule):

| Component | Local vars |
|---|---|
| `ty-tag` | `--tag-bg`, `--tag-color`, `--tag-border-color` |
| `ty-switch` | `--switch-track` (checked track) |
| `ty-radio` | `--radio-color` (checked border + dot) |
| `ty-checkbox` | `--checkbox-color` (checked), `--checkbox-color-off`, `--checkbox-ring` (focus ring) |
| `ty-input` | `--input-accent` (border), `--input-accent-bold` (hover/focus), `--input-ring` |
| `ty-select` | `--select-accent` (border), `--select-accent-bold` (hover/open border), `--select-ring` (open focus ring) |
| `ty-date-picker` | `--date-picker-accent`, `--date-picker-accent-bold`, `--date-picker-ring` |
| `ty-copy` | `--copy-color`, `--copy-color-hover`, `--copy-bg-hover` |
| `ty-tooltip` (default `dark` flavor only) | `--ty-tooltip-bg`, `--ty-tooltip-color`, `--ty-tooltip-border` — defined once on `:root`, deliberately NOT redeclared per theme (a tooltip should always pop, light page or dark) |
| `ty-calendar-month` | `--calendar-month-accent` (today + selected border), `--calendar-month-selected-bg`, `--calendar-month-selected-color`, `--calendar-month-selected-hover-bg` — also reachable via the pre-existing `--ty-calendar-*` overrides, which still win. `--ty-calendar-other-month-color` (prev/next-month day text — its `:root` / `html.dark` defaults are pre-calibrated to pass WCAG AA contrast; if you override it, check contrast against your own surface color) |

---

## Component Sizing

**Fields** (`ty-input`, `ty-select`, `ty-date-picker`) come in exactly **three sizes** — `sm` / `md` / `lg` — sharing one height ladder via `--ty-size-{sm,md,lg}` (32/36/40px). The same `size` value is the same height on all three, so fields always line up in a form row. Legacy `xs`/`xl` are accepted and coerce to `sm`/`lg`.

**Buttons** run a 4px ladder — `xs` 24 / `sm` 28 / `md` 32 / `lg` 36 / `xl` 40 — sharing its top three steps with the field ladder, not a smaller ladder underneath it:

| Placement | Rule | Example |
|---|---|---|
| **Alongside** a field (separate elements in a row) | field `sm` = button `md` (32); field `md` = button `lg` (36); field `lg` = button `xl` (40) — exact height match, flush in the row | input `size="md"` + button `size="lg"` → both 36px |
| **Embedded** in a field's `end` slot | Same size name — nests with a consistent ~4px margin | input `size="md"` + slotted button `size="md"` (36 vs 32) |
| Button `xs`/`sm` | No matching field — these two steps are button-only (compact toolbars, icon actions) | — |

```html
<!-- Alongside: button lg matches field md exactly -->
<div style="display:flex; gap:0.5rem;">
  <ty-input size="md" placeholder="Search…"></ty-input>
  <ty-button size="lg">Search</ty-button>
</div>

<!-- Embedded: same size name nests with a ~4px margin -->
<ty-input size="md" placeholder="Search…">
  <ty-button slot="end" size="md" appearance="ghost">Go</ty-button>
</ty-input>
```

Override `--ty-size-*` on `:root` (or scope it to a container) to shift the field ladder — fields and the three matching button tiers (`md`/`lg`/`xl`) follow automatically.

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
  <ty-select>…</ty-select>
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

<!-- Quick reusable flavor via override variables. For a full flavor with
     shade ramp, tones and tag support, prefer the token-based approach in
     "Custom Flavors" above — these per-instance variables override it. -->
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

### `<ty-input>`, `<ty-select>`

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
<ty-select style="--ty-input-bg: #f0fdf4;
                    --ty-input-border: #16a34a;
                    --ty-input-border-focus: #15803d;">
  <ty-option value="a">Apple</ty-option>
  <ty-option value="b">Banana</ty-option>
</ty-select>

<!-- Multiselect with a brand tone -->
<ty-select multiple style="--ty-input-border-focus: #7c3aed;
                       --ty-input-shadow-focus: rgba(124, 58, 237, 0.2);">
  <ty-option value="x">X</ty-option>
  <ty-option value="y">Y</ty-option>
</ty-select>
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

A thin shim over `--ty-input-*`. By default the stub looks identical to other inputs; override these to make it look distinct without affecting `<ty-input>`, `<ty-select>`, etc.

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
