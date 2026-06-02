# Proposal: Formulaic Flavor Ramps via OKLCH

**Status:** Draft / discussion
**Author:** captured from a EYWA-robotics theming session, 2026-05-28
**Affects:** `packages/core/css/tyrell.css`

## TL;DR

Today, retheming Tyrell means hand-tuning ~30 hex values per flavor across
light *and* dark mode. This proposal replaces those hardcoded ramps with an
OKLCH-derived formula seeded by **two CSS variables per flavor** — a hue
and a chroma. Consumers retheme by changing two numbers; the 5-shade text
ramp, 3-shade background ramp, border, and solid-button fills fall out
automatically and stay coherent in both modes.

Zero breaking change — apps that override individual `--ty-color-*` values
continue to work via the cascade. The formula is a strict superset.

## The problem

Look at `packages/core/css/tyrell.css` today (lines ~138-170 light, ~587+ dark):

```css
:root {
  --ty-color-primary-strong: #163793;
  --ty-color-primary-mild:   #304c9f;
  --ty-color-primary:        #466bce;
  --ty-color-primary-soft:   #60a5fa;
  --ty-color-primary-faint:  #93c5fd;

  --ty-color-secondary-strong: #7442c2;
  --ty-color-secondary-mild:   #8153cf;
  --ty-color-secondary:        #9774e7;
  /* … */
  --ty-color-success-strong:   #177858;
  /* … */
  --ty-color-danger-strong:    #b91c1c;
  /* … */
  --ty-color-warning-strong:   #e86400;
  /* … */
}

:root.dark {
  --ty-color-primary-strong:   #9cbde5;
  /* …another 25+ hardcoded hexes… */
}
```

For each flavor a consumer wants to retheme they need to:

1. Pick a new "core" color that fits their brand.
2. Hand-derive 4 sibling shades that read cleanly together (strong, mild,
   soft, faint).
3. Derive a matching `--ty-bg-{flavor}` triple (base / mild / soft).
4. Pick a border.
5. **Repeat all of the above for dark mode** — with different lightness
   targets, because what works on a near-white surface looks dead on a
   near-black one.
6. Override `--ty-solid-{flavor}` because solid TyButton has its own token
   namespace.

That's roughly **30 hex picks per flavor, per app**. Real-world experience
(quote from a Tyrell consumer): *"I've been doing it by hand and it wasn't
easy."*

The painful part isn't the count — it's that all 30 numbers are
**correlated**. They have to land on consistent lightness stops, share a
hue, and shift their chroma in the same direction. Tools like
Tailwind/Radix solve this by *generating* the ramps from a small set of
inputs. Tyrell currently doesn't.

## The insight

Look at how the OKLCH-derived primary ramp in
`frontend/robotics/src/styles/index.css` collapses to a single hue and a
single chroma:

```css
:root {
  --brand-hue:    200;
  --brand-chroma: 0.13;

  --ty-color-primary-strong: oklch(0.40 var(--brand-chroma) var(--brand-hue));
  --ty-color-primary:        oklch(0.52 var(--brand-chroma) var(--brand-hue));
  --ty-color-primary-mild:   oklch(0.66 calc(var(--brand-chroma) - 0.01) var(--brand-hue));
  --ty-color-primary-soft:   oklch(0.82 0.08 var(--brand-hue));
  --ty-color-primary-faint:  oklch(0.95 0.03 var(--brand-hue));

  --ty-bg-primary:           oklch(0.96 0.02 var(--brand-hue));
  --ty-bg-primary-mild:      oklch(0.92 0.05 var(--brand-hue));
  --ty-bg-primary-soft:      oklch(0.98 0.01 var(--brand-hue));

  --ty-border-primary:       var(--ty-color-primary-soft);
}
```

Every shade uses the **same lightness stops** (0.40 / 0.52 / 0.66 / 0.82 /
0.95 for text-color; 0.96 / 0.92 / 0.98 for bg). Chroma drops near the
extremes (because near-black and near-white can't hold saturation). Only
the hue and a base chroma are flavor-specific.

This applies cleanly across every flavor. The EYWA-robotics app extended
the pattern to `secondary`, `success`, `danger`, `warning`:

```css
:root {
  --secondary-hue:    calc(var(--brand-hue) + 60);  /* sibling accent */
  --secondary-chroma: var(--brand-chroma);
  --success-hue:      145;   /* anchored green */
  --success-chroma:   0.14;
  --danger-hue:       25;    /* anchored red */
  --danger-chroma:    0.17;
  --warning-hue:      75;    /* anchored amber */
  --warning-chroma:   0.15;

  /* …same derivation formula applied per flavor… */
}
```

Tags, buttons, borders, backgrounds — every component reading these
tokens — automatically retint in both light and dark mode. No further
overrides needed.

## Proposed change to `tyrell.css`

### 1. Add seed variables per flavor at the top of `:root`

```css
:root {
  /* Theming seeds — two numbers per flavor drive the whole ramp. */
  --ty-primary-hue:      230;   /* current Tyrell primary blue */
  --ty-primary-chroma:   0.13;

  --ty-secondary-hue:    285;   /* current Tyrell secondary violet */
  --ty-secondary-chroma: 0.14;

  --ty-success-hue:      155;   /* current Tyrell success green */
  --ty-success-chroma:   0.12;

  --ty-danger-hue:       25;    /* current Tyrell danger red */
  --ty-danger-chroma:    0.17;

  --ty-warning-hue:      55;    /* current Tyrell warning amber */
  --ty-warning-chroma:   0.15;

  --ty-neutral-hue:      230;   /* tracks primary by default; can detach */
  --ty-neutral-chroma:   0.005;
}
```

The defaults above should be calibrated to land **as close as possible to
the current hardcoded hexes** so existing apps see no visual diff.

### 2. Replace the hardcoded color ramp with the formula, per flavor

```css
:root {
  --ty-color-primary-strong: oklch(0.40 var(--ty-primary-chroma)            var(--ty-primary-hue));
  --ty-color-primary-mild:   oklch(0.52 var(--ty-primary-chroma)            var(--ty-primary-hue));
  --ty-color-primary:        oklch(0.58 var(--ty-primary-chroma)            var(--ty-primary-hue));
  --ty-color-primary-soft:   oklch(0.72 calc(var(--ty-primary-chroma) * 0.65) var(--ty-primary-hue));
  --ty-color-primary-faint:  oklch(0.84 calc(var(--ty-primary-chroma) * 0.45) var(--ty-primary-hue));

  --ty-bg-primary:           oklch(0.96 calc(var(--ty-primary-chroma) * 0.18) var(--ty-primary-hue));
  --ty-bg-primary-mild:      oklch(0.92 calc(var(--ty-primary-chroma) * 0.40) var(--ty-primary-hue));
  --ty-bg-primary-soft:      oklch(0.98 calc(var(--ty-primary-chroma) * 0.10) var(--ty-primary-hue));

  --ty-border-primary:       var(--ty-color-primary-soft);

  /* Repeat for secondary / success / danger / warning / neutral with
   * the same lightness stops; only the *-hue and *-chroma vars change. */
}
```

The exact lightness stops will need final calibration against the current
Tyrell hexes — but the *shape* is fixed. **The same five L-stops are
reused across every flavor**, which is what guarantees ramps cohere with
each other (`success-mild` and `danger-mild` will have the same perceptual
weight).

### 3. Repeat for `:root.dark` with dark L-stops

```css
:root.dark {
  --ty-color-primary-strong: oklch(0.82 calc(var(--ty-primary-chroma) * 0.75) var(--ty-primary-hue));
  --ty-color-primary-mild:   oklch(0.68 var(--ty-primary-chroma)              var(--ty-primary-hue));
  --ty-color-primary:        oklch(0.58 var(--ty-primary-chroma)              var(--ty-primary-hue));
  --ty-color-primary-soft:   oklch(0.42 calc(var(--ty-primary-chroma) * 0.80) var(--ty-primary-hue));
  --ty-color-primary-faint:  oklch(0.30 calc(var(--ty-primary-chroma) * 0.50) var(--ty-primary-hue));

  --ty-bg-primary:           oklch(0.22 calc(var(--ty-primary-chroma) * 0.40) var(--ty-primary-hue));
  --ty-bg-primary-mild:      oklch(0.26 calc(var(--ty-primary-chroma) * 0.55) var(--ty-primary-hue));
  --ty-bg-primary-soft:      oklch(0.19 calc(var(--ty-primary-chroma) * 0.25) var(--ty-primary-hue));

  --ty-border-primary:       oklch(0.42 calc(var(--ty-primary-chroma) * 0.80) var(--ty-primary-hue));
  /* …repeat per flavor… */
}
```

Critically, the **dark block reads the same seed variables** as the light
block. Consumers set the seeds once on `:root` and dark mode tracks for
free.

### 4. `--ty-solid-*` already maps to `--ty-color-*` (in some places).

Audit `--ty-solid-*` definitions and route them all through
`var(--ty-color-{flavor}-*)`. Then solid-button fills automatically follow
flavor retints — eliminating the
[solid-token gotcha](https://example.com/note) we hit in EYWA-robotics.

## Consumer experience after this lands

```css
/* All it takes to brand-shift the entire UI: */
:root {
  --ty-primary-hue: 200;   /* teal */
}

/* Want a warmer secondary? */
:root {
  --ty-secondary-hue: 30;  /* orange */
}

/* Want success/danger/warning to keep semantics — do nothing. They stay
 * at green / red / amber across both modes. */

/* Want secondary to rotate with primary, like the EYWA-robotics app: */
:root {
  --ty-secondary-hue: calc(var(--ty-primary-hue) + 60);
}
```

That's **2 lines of CSS** vs. ~30+ today.

## Why it's a strict win

1. **Zero breaking change.** Existing apps that override
   `--ty-color-success: #00ff00;` still work — the cascade still resolves
   their override against the formula's output. Apps that want easy
   theming get the new path.

2. **Theming surface area collapses from ~30 vars per flavor to 2.**

3. **Dark mode for free.** Today, theming Tyrell means duplicating every
   override into the `:root.dark` block. With the formula, the same two
   seeds drive both modes.

4. **Coherence is enforced by construction.** It is no longer possible
   for a consumer's `success-mild` to land at L=0.58 while their
   `danger-mild` lands at L=0.49 — they share the same L-stop.

5. **Solid buttons stop being a separate problem.** Route `--ty-solid-*`
   through `--ty-color-*` (where it isn't already) and solid fills track
   the seeds.

6. **Browser support is fine.** OKLCH is in every evergreen browser since
   mid-2023.

## Risks & open questions

### 1. Default calibration

The proposed defaults (e.g., `--ty-primary-hue: 230`) must be tuned so
the *output* matches the current hardcoded hexes within a small
ΔE perceptual distance. If they don't, every existing Tyrell consumer
sees an unexplained color shift on upgrade.

**Mitigation:** before publishing, sweep through every current hex in
`tyrell.css`, find its OKLCH equivalent (`oklch.com` or any color tool),
and pick seeds + L-stops that reproduce the existing ramp. Land it as a
patch release with screenshots showing no visual diff.

### 2. Lightness-stop calibration

The L-stops I wrote above (0.40 / 0.52 / 0.66 / 0.82 / 0.95 for color;
0.96 / 0.92 / 0.98 for bg) are the ones the EYWA-robotics app uses. They
work — but the current Tyrell stops may differ slightly. They need to be
read off the existing hexes per flavor and a "best fit" set chosen.

### 3. Chroma-clamping near white/black

OKLCH lets you ask for unrenderable colors at the extremes (`oklch(0.98
0.20 25)` — bright red at near-white lightness). Browsers gamut-clip
automatically, but the *visible* result is unpredictable. The proposal
already accounts for this with `calc(... * 0.10)` style multipliers
near the L=0.95+ end, but: **test every default flavor across the L
range** and clamp where needed.

### 4. Naming

`--ty-primary-hue` vs `--ty-color-primary-hue` vs `--ty-hue-primary`.
The first is shorter; the second nests under the existing namespace; the
third groups by knob-type. **Recommendation: `--ty-{flavor}-hue` /
`--ty-{flavor}-chroma`** because they're conceptually *seeds*, not
*colors*. Distinguishing them from the derived `--ty-color-{flavor}-*`
helps readers.

### 5. Granularity

This proposal exposes 2 knobs per flavor. Two refinements worth
considering:

- **Per-shade chroma:** some flavors look better when `-faint` has more
  chroma than the formula predicts. Could expose
  `--ty-{flavor}-chroma-faint` for that. Probably overkill until proven.
- **Per-mode chroma:** dark mode often benefits from higher chroma at the
  same L-stop. Could expose `--ty-{flavor}-chroma-dark`. Easy to add
  later, non-breaking.

Default: keep it at 2 knobs per flavor.

## Estimated effort

- **Implementation:** half a day — mostly the calibration grind to make
  the defaults reproduce the current hexes.
- **Testing:** visual regression sweep against `examples/` and the docs
  site (`docs/index.html`) in both light and dark mode.
- **Release:** minor version bump. Frame it as "new theming API,
  existing tokens unchanged." Highlight the two-knob retheming in the
  changelog with a side-by-side code snippet.

## Reference implementation

The pattern is already running in
`/home/rgersak/dev/EYWA/frontend/robotics/src/styles/index.css` for all
five flavors in light + dark mode, including the `--ty-solid-*`
re-routing. That file can serve as the calibration starting point — port
the formulas, then re-tune defaults against the current Tyrell hexes.

Live demo: the `/theme` playground in EYWA-robotics has a `--brand-hue`
slider that drives the whole UI through this mechanism.
