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

Available colors: `primary`, `success`, `danger`, `warning`, `neutral`.

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

Available colors: `primary`, `success`, `danger`, `warning`, `neutral`.

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

`tyrell.css` on its own has **no color tokens** — spacing, radius, typography, shadows, z-index and component structure only. Pair it with exactly one color layer:

- **`tyrell-theme.css`** — OKLCH theme engine, dynamic, retintable, recommended (Option 1 below).
- **`tyrell-colors-static.css`** — the plain hardcoded hex fallback (light + dark), for consumers who don't want the theme engine at all.

Loading both is harmless (`tyrell-theme.css` always wins the cascade) but redundant — pick one.

### Option 1 — OKLCH theme engine (recommended)

Load `tyrell-theme.css` after `tyrell.css`, then rebrand with one variable:

```html
<link rel="stylesheet" href=".../tyrell.css">
<link rel="stylesheet" href=".../tyrell-theme.css">
```

```css
:root {
  --ty-primary-hue: 200;        /* teal. Try 260 indigo, 30 orange, 145 emerald. */
}
```

That's it. Primary, surfaces, inputs, solid buttons, focus rings — everything retints coherently in both light and dark mode. Greys stay pure by design (see the neutral row below) — set `--ty-neutral-hue`/`--ty-neutral-chroma` to warm them toward primary.

#### How it builds colors

Every color in the library is one formula on five axes:

```
oklch(
  L = L-curve[shade] × flavor-l-factor            ← Tier 2 × Tier 4
  C = flavor-chroma  × saturation-curve[shade]    ← Tier 1 × Tier 3
  H = flavor-hue                                  ← Tier 1
)
```

Pick a flavor (primary / success / warning / danger / neutral) and a shade (strong / bold / base / soft / faint). The formula gives you that cell's color. Five axes:

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

#### Tier 1 — flavor seeds

Every flavor — including primary — is one hue + one chroma. No flavor derives from another; each is a standalone dial:

```css
:root {
  --ty-primary-hue: 200;          /* the color (0–360°) */
  --ty-primary-chroma: 0.15;      /* saturation (0–0.30) */
}
```

Rebrand by overriding `--ty-primary-hue`/`-chroma` alone; touch the others only when a specific flavor needs its own tuning:

> **These dials are per-mode.** Dark mode re-declares every Tier-1 flavor seed
> at `html.dark` (`--ty-primary-hue: 226`, `--ty-primary-chroma: 0.065`, and the
> same for success/warning/danger), and `html.dark` (0,1,1) outranks `:root`
> (0,1,0). So the block below rebrands **light mode only** — dark silently keeps
> the stock palette. Either repeat the declarations inside `html.dark`
> (see [Per-mode overrides](#per-mode-overrides)), or set
> `--ty-{flavor}-seed` instead, which nothing re-declares and which therefore
> covers both modes in one line:
>
> ```css
> :root { --ty-primary-seed: oklch(0.5 0.13 200); }   /* light + dark */
> ```

```css
:root {
  --ty-primary-hue: 200;

  /* Every flavor is independent. Override hue and/or chroma. */
  --ty-success-hue: 165;
  --ty-danger-chroma: 0.20;             /* louder errors */

  /* Neutral is ACHROMATIC by default — greys do NOT follow primary.
     Opt in to primary-warmed greys: */
  --ty-neutral-hue: var(--ty-primary-hue);
  --ty-neutral-chroma: 0.003;
}
```

| Flavor   | Hue var                 | Chroma var                | Default (light) |
|----------|-------------------------|---------------------------|------------------|
| primary  | `--ty-primary-hue`      | `--ty-primary-chroma`     | `252°` / `0.08` |
| success  | `--ty-success-hue`      | `--ty-success-chroma`     | `145°` / `0.086` |
| danger   | `--ty-danger-hue`       | `--ty-danger-chroma`      | `31°` / `0.134` |
| warning  | `--ty-warning-hue`      | `--ty-warning-chroma`     | `76°` / `0.178` |
| neutral  | `--ty-neutral-hue`      | `--ty-neutral-chroma`     | `0` / `0` — pure grey, primary-independent |

**Or skip the numbers entirely — seed any flavor with a color.** Every flavor also accepts `--ty-{flavor}-seed: <any color>`; its hue + chroma are read via relative color syntax and the number dials are bypassed. The seed's *lightness is discarded by design* — shade placement per mode is the L-curve's job, which is what keeps dark mode, tones and contrast correct for any seed:

```css
:root {
  --ty-primary-seed: #76467c;   /* your color from one hex — done */
  --ty-danger-seed: crimson;
}
```


---

#### Tier 2 — L-curve (emphasis ladder)

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

  /* Text ladder (--ty-text-*) and generic borders (--ty-border-*) are
     separate families with their own L dials — tuning the emphasis
     curve above does NOT move them. */
  --ty-l-text-base: 0.21;       /* body text */
  --ty-l-border: 0.72;          /* default border */
  --ty-l-border-elevated: 0.93; /* card/panel border */
}
```

Use cases: compress the ladder for an "all-soft" muted palette; expand it for higher-contrast accessibility-first themes. Full dial list: `--ty-l-text-{strong,bold,base,soft,faint}`, `--ty-l-border{,-strong,-bold,-soft,-faint}`, `--ty-l-border-{content,elevated,floating}` — each with independent dark-mode values (override inside `html.dark`).

---

#### Tier 3 — saturation curve (per-shade chroma multipliers)

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

#### Tier 4 — per-flavor L-factor

A single multiplier per flavor that scales every L-curve value *only for that flavor*. Default `1` = no change. Useful when one flavor's hue sits too close to primary's on the wheel and the buttons blend.

```css
:root {
  --ty-primary-hue: 47;            /* gold primary */
  --ty-warning-l-factor: 0.85;     /* nudge warning darker so it stands apart */
}
```

The full set:

```css
--ty-primary-l-factor:   1;
--ty-success-l-factor:   1;
--ty-warning-l-factor:   1;
--ty-danger-l-factor:    1;
--ty-neutral-l-factor:   1;
```

Effect on the formula: `L = L-curve[shade] × flavor-l-factor`. Set warning's factor to `0.85` and every warning shade (strong/bold/base/soft/faint) shifts by ×0.85; primary/success/danger untouched.

> **Note about dark mode.** The L-curve flips between modes (light: low L = emphatic; dark: high L = emphatic). A factor `< 1` darkens warning in light mode but **dims** it in dark mode. If you want symmetric "more emphatic" in both modes, set the factor in `:root` for light AND set its inverse (roughly `1 / factor`) in `html.dark`. See "Per-mode overrides" below.

**Per-flavor solid anchor lift** (`--ty-{flavor}-solid-l`, default `0`) — a companion set for the *solid button* ladder specifically: an additive L shift applied to the flavor's base fill before tones and hover/active derive from it. Exists because "darker = stronger" is false for the yellow family — darkened hue-75 is brown — so warning ships with `+0.1` in light mode (`0` in dark), lifting its whole solid ladder into the orange zone with black text throughout. Use it for any flavor whose solid fills land in a bad lightness zone:

```css
:root { --ty-warning-solid-l: 0.1; }   /* shipped default */
html.dark { --ty-warning-solid-l: 0; } /* dim fills don't brown out */
```

---

#### Auto-contrast foregrounds (solid buttons)

Solid button text is **not** a fixed color — each fill derives its own foreground from its lightness, so rebranding can't strand white text on a pale fill:

```css
--ty-solid-primary-soft-fg: oklch(from var(--ty-solid-primary-soft)
                                  clamp(0, (var(--ty-solid-fg-threshold) - l) * 1000, 1) 0 0);
```

Fills darker than the threshold get white, lighter get black. One token per *fill* — `-fg`, `-soft-fg` (tone `-`), `-strong-fg` (tone `+`) — because each tone sits at a different lightness.

```css
:root {
  --ty-solid-fg-threshold: 0.57;  /* crossover. Higher = prefers white, lower = prefers black. */
}
```

Opt out per flavor by pinning the token (`--ty-solid-primary-fg: white`), or globally with `--ty-solid-fg-threshold: 1` to force white everywhere.

---

#### Typography weight dials (mode-flipped)

Button and tag text weight is a themable dial, not a hardcode — and it flips with the mode, because light text on dark surfaces optically blooms (halation) and reads heavier than the same weight on white:

```css
:root {
  --ty-weight-action: 510;   /* buttons, interactive chrome (light mode) */
  --ty-weight-label: 440;    /* tags, chips, badges (light mode) */
}
html.dark {
  --ty-weight-action: 400;   /* bloom compensation */
  --ty-weight-label: 400;
}
```

Override at any scope — `:root`, a theme pack, one element. Old semibold look back in one line: `--ty-weight-action: var(--ty-font-semibold)`. Both dials are `@property`-registered numbers, so with a variable font, weight **crossfades during theme transitions** along with the colors.

---

#### Solid-button depth (`--ty-button-depth`)

Solid buttons derive a 1px border and a soft drop shadow from their **own current fill** via relative color, scaled by one dial:

```css
:root { --ty-button-depth: 0.35; }  /* default: subtle */
html.love { --ty-button-depth: 1; } /* stronger border + shadow for one theme */
ty-button.flat { --ty-button-depth: 0; }  /* pixel-flat — border color matches the fill exactly */
```

Border color is `oklch(from <resting fill> calc(l + border-l × depth) c h)` — the fill with only its lightness shifted, chroma/hue kept. **Resting** fill, not current: on hover/active only the fill steps up (via `--ty-solid-hover-l`/`-active-l`) while the border stays put, so the fill visibly rises *toward* the border instead of dragging it along.

`--ty-button-border-l` sets the offset direction/magnitude and is mode-flipped — colored solids get no border at all in dark mode (`0`; the fill's own hue/saturation already separates it from the page) and a subtle darkening in light (`-0.08`). Neutral is different — no hue to lean on, so it needs a real lit edge to read as a shape against a near-black canvas — and gets its own stronger dial, `--ty-button-border-l-neutral` (`-0.25` light / `0.5` dark).

Direct escape hatches outrank the derivation entirely:

```css
ty-button.custom {
  --ty-solid-border-color: oklch(0.7 0.1 300);  /* pin ANY color — dials stop mattering */
  --ty-solid-border-width: 2px;                 /* thickness (≠1px shifts geometry) */
}
```

---

#### Neutral+ — full-contrast ink, in every appearance

`flavor="neutral+"` is the monochrome max-emphasis CTA: near-black ink in light mode, **inverted white ink with black text in dark mode** — the Geist/shadcn primary-button pattern. Unlike other tones it's an absolute, not "anchor + offset", and unlike every other flavor's `-strong` it's the same dial across all three appearances (solid/outlined/ghost) rather than each reading its own token:

```css
--ty-l-solid-neutral-strong: 0.15;   /* light */
html.dark { --ty-l-solid-neutral-strong: 0.88; }  /* inverted ink */
```

Base and soft neutral (all appearances) stay on the regular per-flavor text ladder — bare text needs page contrast, which is what that ladder is for; the ink ramp doesn't invert for readability the way it does, so pointing weaker tones at it would make them illegible. `+` alone reads the ink dial, giving outlined/ghost `neutral+` the same loud identity as the solid button next to it. `button.muted` follows the same split. Hover/active on `neutral+` move *toward mid-lightness* (fill-relative, not mode-directional) — at an L extreme the normal interaction dials would clip and vanish.

---

#### Outlined/ghost hover — always escalates to peak

Whatever tone you set (`-`/base/`+`), outlined and ghost buttons resolve their text (and outlined's border) to the `-strong` tier on `:hover`/`:active`/`:focus-visible` — soft and base both rise to the same peak color on interaction; `+` is already there at rest. `muted` composes with this correctly: hover keeps muted's own contract (reveal the plain button's resting color), while press/focus lands muted on the same escalated color as a pressed plain button.

---

#### Named + scoped themes

A theme is nothing more than a class that overrides Section 1 dials — `html.dark` is just the built-in reference theme, not a special case. Any name works the same way:

```css
html.love {
  --ty-primary-hue: 340;
  --ty-primary-chroma: 0.18;
  --ty-l-base: 0.5;
  /* any Section 1 dial */
}
```

```html
<html class="love">
```

That's a complete named theme — every derived token recomputes because the formulas read these dials, not literal colors.

**Scope one to a subtree** with `[data-ty-theme]`, which the theme engine's formulas already match alongside `html:root`:

```html
<section data-ty-theme class="love">
  <!-- everything in here re-themes, independent of the page around it -->
</section>

<!-- dark card inside a light page, or vice versa -->
<aside data-ty-theme class="dark">…</aside>
```

Combine with a flavor pack (below) for a theme that also carries its own custom flavors — the Theming page's playground has a "named theme" export mode that generates this shape from the live sliders.

---

#### Animated theme transitions

Every dial in the theme engine is a typed, `@property`-registered number — and every color is a pure function of the dials. So theme and mode switches don't snap: the dials interpolate, and the whole page crossfades through OKLCH space. This applies to `html.dark`, named theme packs, `[data-ty-theme]` subtree switches, and even live seed changes.

```css
:root { --ty-theme-transition: 0s; }    /* opt out */
:root { --ty-theme-transition: 1.2s; }  /* slower crossfade */
```

Reduced-motion users never get the animation. Browsers without `@property` fall back to instant switching.

**Jittery instead of smooth?** Interactive components (`ty-button`, `ty-input`, `ty-switch`, …) each carry their own short hover/focus transition (~0.15–0.2s on `background-color`/`border-color`/`color`). CSS transitions fire on any computed-value change, not just interaction, so a theme switch also retriggers every one of those at once — hundreds of elements racing the coordinated dial crossfade at a different speed, which reads as jitter rather than one smooth wash. Add the `ty-theme-switching` class to whatever you toggle (`<html>`, or a scoped `[data-ty-theme]` root) for the duration of the switch to silence those local transitions:

```js
root.classList.add('ty-theme-switching')
root.classList.toggle('dark')   // or swap in a theme pack
setTimeout(() => root.classList.remove('ty-theme-switching'),
  parseFloat(getComputedStyle(root).getPropertyValue('--ty-theme-transition')) * 1000 || 450)
```

Purely additive — nothing changes unless you add the class yourself. Works through Shadow DOM too: every `ty-*` component's own local transition is wired to an inheriting custom property that `.ty-theme-switching` sets, not to a selector that Shadow DOM encapsulation would block.

---

#### Per-mode overrides

Any tier can be overridden separately for dark mode by repeating the declaration inside `html.dark`.

For most tiers this is optional. For the **Tier 1 flavor dials**
(`--ty-{primary,success,warning,danger}-{hue,chroma}`) it is **required** —
dark ships its own values for those at `html.dark`, so a `:root`-only override
never reaches dark mode. Repeat them here, or use `--ty-{flavor}-seed` on
`:root` instead and skip the duplication entirely.

```css
:root {
  --ty-primary-hue: 200;           /* light mode teal */
  --ty-warning-l-factor: 0.85;     /* darker warning in light mode */
}
html.dark, html[data-theme="dark"] {
  --ty-primary-hue: 210;           /* slightly cooler teal in dark mode */
  --ty-warning-l-factor: 1.15;     /* brighter warning in dark mode */
  --ty-c-faint-mult: 0.60;         /* dark mode needs more chroma at faint */
}
```

The theme engine's `html.dark` block already redefines the L-curve with inverted defaults (`0.86 / 0.74 / 0.62 / 0.46 / 0.30`) and bumps `--ty-c-faint-mult` so dim shades don't collapse to grey. Override either to fine-tune.

---

### Option 2 — direct token override (legacy / fine-grained)

If you don't load the theme engine, load `tyrell-colors-static.css` alongside `tyrell.css` for the base tokens, then override individual shades on top — or, if you're already on the theme engine and just want to override individual derived tokens, write hex values directly; the theme engine doesn't block this, the cascade resolves consumer overrides past the formula's output.

```html
<link rel="stylesheet" href=".../tyrell.css">
<link rel="stylesheet" href=".../tyrell-colors-static.css">
```

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

**Pattern:** `--ty-color-{flavor}-{strong | bold | soft | faint}`, `--ty-bg-{flavor}-{bold | soft}`, `--ty-border-{flavor}`. Flavors are `primary`, `success`, `danger`, `warning`, `neutral`.

Use this when:
- You have a fixed color palette and don't need the OKLCH math
- You want to override one specific shade without abandoning the formula (set the seed AND the one token)
- You're integrating with an existing design-token system

The theme engine (Option 1) is strictly more powerful — anything you can do with Option 2 you can also do on top of Option 1. Most apps shouldn't need Option 2 at all.

---

## Custom Flavors (add your own)

The built-in flavors (`primary` / `success` / `danger` / `warning` / `neutral` — semantic-only; `secondary` was removed in TC37) are not a closed set. Pass any identifier as `flavor` and define its design tokens — the component generates the same wiring a built-in gets (shade ramp, hover, focus ring, `+`/`-` tones). Supported by **every flavored component**: `ty-button`, `ty-tag`, `ty-switch`, `ty-radio-group` (and its `ty-radio` children), `ty-checkbox`, `ty-input`, `ty-select`, `ty-date-picker`, `ty-copy`, `ty-tooltip`, `ty-calendar` (and its `ty-calendar-month`).

### The flavor pack: full engine parity

The built-ins are nothing more than pre-installed instances of this template. Substitute your name for `love`, pick ONE seed color, and the flavor gets everything a built-in gets — the shared L-curve (equal perceived weight with every other flavor at each shade), the saturation curve, dark mode via the same dial flips, solid interaction states, and **auto-contrast foregrounds** (text derives from each fill's own lightness — no white-on-pale accidents):

The full template (ink ramp, background tints, border, solid fills + interaction states, auto-contrast foregrounds) is generated live by the **Flavor pack builder** on the Theming page — give it a name and one seed color and copy the CSS it produces. Kept there instead of pasted here so the template can't drift out of sync with the engine as `tyrell-theme.css` evolves.

```html
<ty-button flavor="love">Love</ty-button>
<ty-button flavor="love-" appearance="outlined">Softer</ty-button>
<ty-tag flavor="love+">stronger chip</ty-tag>
```

Because every value routes through the shared dials, the pack inherits everything automatically: dark mode (the `html.dark` dial flips reach it), theme scopes (`[data-ty-theme]` recomputes it), L-curve reshaping, `--ty-solid-fg-threshold`. **No `html.dark` block of your own is needed.** That is the difference between this and the `color-mix()` quick path below — the quick path approximates the shape; the pack *is* the engine.

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

Hand-picking 14 values gives you full control over every shade, but it's not the only option. Every one of those tokens can instead be *derived* from a single base color with [`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) — the same "one seed → full ramp" idea the OKLCH theme engine uses for the built-in flavors, just with a simpler formula:

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
  /* auto-contrast, not hardcoded white — a pale seed gets black text */
  --ty-solid-brand-fg: oklch(from var(--brand-base)
    clamp(0, (var(--ty-solid-fg-threshold, 0.57) - l) * 1000, 1) 0 0);
}
```

Change `--brand-base` and every shade updates with it — including live, from a `<input type="color">`, since it's an ordinary CSS variable. The docs site's "CSS System" page demonstrates this working live: the "Try the Flavor Axis" section's `custom` chip is driven by exactly this formula.

Trade-off: this mixes toward flat `black`/`white`, so it won't invert correctly for dark mode the way the hand-picked values (or the real OKLCH theme engine) do — pick per-theme base colors, or a `light-dark()`/`html.dark` override for `--brand-base`, if you need that. For a flavor that's fully theme-aware out of the box, use the theme engine's own hue/chroma seeds instead (see the docs site's "Theming" page) rather than a hand-rolled custom flavor.

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
| `--ty-calendar-today-accent` | Today's border (default: `--ty-color-primary`) |
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
