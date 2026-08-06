# Changelog

All notable changes to the Tyrell web components library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-TC40] - 2026-08-06

### Added

- **`.ty-theme-switching` opt-in escape hatch for smooth theme toggles.** Interactive components (`ty-button`, `ty-input`, `ty-switch`, `ty-tabs`, …) each carry their own short hover/focus transition (~0.15–0.2s on `background-color`/`border-color`/`color`), which CSS also fires on any non-interactive value change — so a theme switch retriggered all of them at once, racing the coordinated 0.45s dial crossfade at a different speed on every element. Measured on our own docs site: a single theme toggle fired ~1,548 separate `transitionrun` events with finish times scattered across a 449ms window, which read as jitter rather than one smooth wash. Add `ty-theme-switching` to whatever you toggle (`<html>` or a scoped `[data-ty-theme]` root) for the duration of the switch to silence local transitions on its descendants only — the dial crossfade itself is untouched. Purely additive; needs a few lines of JS around the toggle (documented in CSS_GUIDE.md → Animated theme transitions). Applied to our own docs site's theme toggle: same swap now fires 193 events (mostly the legitimate dial properties themselves) with finish times inside a 184ms window.

## [1.0.0-TC39] - 2026-08-06

Headline: **`ty-select` gets a real `display`** (fixes a `ty-selected-tags` layout bug), and the chip display is renamed to **`ty-selected-options`** (old tag kept forever).

### Fixed

- **`ty-select` never declared `:host { display }`**, so it defaulted to the browser's `display: inline` for every skin (default field, `compact`, `slot="trigger"`). Inline boxes ignore vertical margin entirely, which is why pairing a select with `ty-selected-options`/`ty-selected-tags` below it (the documented pattern) rendered the chips flush against the select instead of the intended gap — not a symptom of the earlier label-gap fix, a separate pre-existing bug that just became visible. Now `:host { display: block; width: 100% }`, matching `ty-input`'s existing convention; `:host([compact]) { display: inline-block; width: auto }` keeps the documented "content-hugging toolbar trigger" skin actually content-hugging. Verified: margin-driven gaps now render (was 0px, now the declared value), compact still sizes to its own label, and an input+label sits flush in the same row as a select+label.
- **The picker's popup could visually collide with its own out-of-band chip row.** `ty-select`'s popup is intentionally independently sized/positioned from the trigger (documented), so when it's wider or narrower than the chip row beneath it, part of that row stayed visible, peeking out beside or through the open popup. `ty-selected-options`/`ty-selected-tags` now listens for the picker's `open`/`close` events (already emitted by `ty-select`) and hides itself for the duration — cheaper and more correct than trying to out-z-index or reflow around an overlay whose footprint it doesn't control.

### Changed

- **`ty-selected-tags` renamed to `ty-selected-options`.** The old name described the chip primitive it happens to render with (`ty-tag`); the new one describes what drives it — a picker's selected `ty-option`s — matching how the rest of the library names things. `ty-selected-tags` is re-registered as a subclass and kept working indefinitely (same convention as `ty-modal`/`ty-dialog`); the JS class `TySelectedTags` (core and React packages) is likewise kept as an alias export of `TySelectedOptions`. No migration required — this is additive, not a removal.

## [1.0.0-TC38] - 2026-08-06

Headline: **`tyrell-brand.css` renamed to `tyrell-theme.css`** (BREAKING path change), and the static `tyrell.css` fallback path is now correct-by-default instead of quietly shipping pre-TC35 contrast bugs.

### Changed (BREAKING)

- **`packages/core/css/tyrell-brand.css` renamed to `tyrell-theme.css`.** "Brand" undersold what the file does since TC35–37 — it's the auto-contrast engine, the seed-ingestion engine, the named/scoped-theme engine, and the animated-transition engine, not a cosmetic color skin. "Theme" is also the term every comparable library (Radix, Material, Web Awesome) already uses for this concept. `--ty-brand-hue`/`--ty-brand-chroma` and the rest of the Tier 1 seed *variable names* are unchanged — only the file path moved. Consumers on a pinned CDN URL for a prior TC version are unaffected (those releases keep serving the old filename); anyone updating to this version needs to update their `<link>`/`import` path. Updated everywhere in this repo: build scripts, e2e fixture, all framework guides, README, and the docs-site symlink.

### Fixed

- **`tyrell.css` alone (no theme engine loaded) no longer ships broken contrast.** This was worse than a missing enhancement: the single `--ty-solid-{flavor}-fg` per flavor was already wrong for success/danger/warning at *base* tone in both modes (as low as 1.58:1, no customization required to trigger it — the exact bug class TC35 fixed, still live in the fallback path), and `tone-plus`/`tone-minus` buttons had **no fg token at all**, which resolves to CSS's `initial` value rather than failing safe — measured as black text on a dark navy `primary+` fill. Added the missing per-tone `-soft-fg`/`-strong-fg` tokens and corrected the existing base tokens; every one of the 29 static solid fills hand-verified against both black and white, worst case now 4.66:1. `tyrell-theme.css`'s computed auto-contrast is unaffected and still wins by source order when loaded.

### Docs

- **Every "load Tyrell" snippet across the guides, README, and framework docs now shows `tyrell-theme.css` alongside `tyrell.css` by default** — 17 files. `README.md`'s prior framing ("Opt-in — load only if you want to retint") was actively wrong given what's gated behind that file; rewritten to state the trade-off honestly. `tyrell.css`-only remains fully supported and correct (per the fix above) for consumers who deliberately want the static-color, older-browser-compatible path.
- **Docs site's own GitHub Pages CDN template** (`packages/cljs/resources/index.html.template`) still linked `tyrell-brand.css` and set a dead `--ty-secondary-offset` seed override — both leftover from before this rename/removal. Fixed so the published docs site (gersak.github.io/tyrell) loads correctly on this and future releases.

## [1.0.0-TC37] - 2026-08-06

Headline: **flavors and themes become user-declarable axes** — `secondary` removed (BREAKING), color seed ingestion (`--ty-primary-seed: #hex`), named/scoped themes via `[data-ty-theme]`, animated theme transitions, and a flavor-pack template giving custom flavors full engine parity.

### Removed (BREAKING)

- **The `secondary` flavor** — from the brand engine, the base stylesheet (tokens + `ty-text-secondary*`/`ty-bg-secondary*`/`ty-border-secondary`/selection utilities), and the components' built-in `FLAVORS` list. The built-in set is now semantic-only: `primary` / `success` / `danger` / `warning` / `neutral`. Rationale: secondary was the only non-semantic built-in — an aesthetic slot defined as `brand + 60°` that most projects had to re-tune anyway. Markup using `flavor="secondary"` degrades gracefully to neutral; a real second accent is one flavor pack away (see below). Verified surgical: 21 tokens removed, zero other computed-token changes vs TC36.

### Added

- **Named + scoped themes** — a theme is a dial pack: any class/attribute that overrides SECTION 1 dials (`html.love { --ty-brand-hue: 340 }`). New `[data-ty-theme]` scope selector makes the engine recompute all derived tokens on that element, so a subtree can carry its own full theme — including dark-inside-light via `<div data-ty-theme class="dark">`. `dark` is now just the built-in reference theme pack.
- **Color seed ingestion — the engine now accepts colors, not just numbers.** Every flavor resolves one seed color (`--ty-{flavor}-seed: <any color>`); ramp formulas read the seed's chroma + hue channels via relative color syntax, while every shade's lightness still comes from the mode-flipped L-curve. The number dials remain the default (the seed falls back to a color constructed from them — verified 0 pixel differences at defaults, both modes). The ingestion rule is explicit: a seed's lightness is discarded by design — shade placement is the curve's job, which is what makes dark mode, `+`/`-` tones, the input state ladder and auto-contrast correct for ANY seed, light or dark (verified with a dark seed `#76467c`: dark-mode emphasis direction correct, solid fg 8.7:1). This replaces the `color-mix()` approximation as the custom-flavor path: the flavor pack template, the Theming page's pack builder (now name + one color) and the CSS System brand showcase all run the same seed-ingestion engine — the showcase's hand-tuned `color-mix()` ramp (which inverted emphasis in dark mode) is gone. Browser floor for the brand layer rises to relative-color support (Chrome 119 / Safari 16.4 / Firefox 128).
- **Animated theme transitions** — all 63 brand-layer dials are now registered via `@property` as typed numbers, which makes them interpolable: switching mode (`html.dark`) or applying any theme pack no longer snaps — every derived color (buttons, borders, surfaces, text, focus rings) crossfades through OKLCH space, frame by frame, with zero JS. Tune or disable with `--ty-theme-transition` (default `0.45s`; set `0s` to opt out); reduced-motion users never get the animation; browsers without `@property` simply snap as before. Enabled by converting the last per-mode absolutes (surface ladder, `--ty-solid-neutral`, bg-neutral extremes, focus-ring alpha) into numeric dials — which also deleted the dark data block entirely: dark mode is now *purely* dial overrides. Verified: 0 pixel differences vs TC36 at rest in both modes; mid-transition frames measured strictly between endpoints for both mode toggles and brand-hue changes.
- **Theming playground is now a theme builder** — the export panel emits either `:root` overrides (as before) or a **named theme pack** (`.my-theme { … }`, usable on `<html>` or any `[data-ty-theme]` subtree), and a new **Flavor pack builder** section generates the full flavor-pack template live from a name + two seeds, applying it to the page as you drag so the preview row (solid/outlined/ghost buttons, tones, tag, input — auto-contrast included) is the real engine at work.
- **Flavor pack template** (CSS_GUIDE → Custom Flavors) — the per-flavor formula block published as a copy-paste template. A custom flavor declared this way gets full engine parity: shared L-curve (equal perceived weight with built-ins per shade), saturation curve, dark mode via the same dial flips with **no dark block of its own**, solid interaction states, auto-contrast foregrounds, and theme-scope support. Verified end-to-end from the documented text: light AA 5.5–7.2:1, dark 7.0–13.4:1, scoped recompute working.

### Fixed

- **Solid buttons: tone-aware hover/active fills** — the `-hover`/`-active` states always derived from the *base* fill, so hovering a `flavor-` (tone-minus) button abandoned its soft fill and jumped ~0.14 L darker while keeping the soft tone's (black) text — black-on-dark, unreadable. Tone-plus/-minus states now nudge their **own** fill by the same `±0.04/0.08` interaction dials via relative color (no new tokens; packs and custom flavors get it automatically). Text color deliberately stays pinned to the tone's rest fill through interaction — re-deriving per state was measured to flicker black↔white when a nudge crossed the fg threshold (worst measured state ≥ 4.5:1 either way; stable text wins).
- **`ty-input`: hover no longer overrides focus** — `.input-wrapper:hover` out-ranked `.focused` by specificity, so hovering a focused unflavored input swapped its primary focus border for the dimmer neutral hover border (ring stayed, border dimmed — read as a glitch). Gated with `:not(.focused)`, matching `ty-date-picker`'s existing `:hover:not(.open)` pattern.
- **`ty-select`: label→field gap now matches `ty-input`** — `.select-container` carried a `gap: 0.25rem` that stacked on the shared label's `margin-bottom: 6px` (flex gaps don't collapse with margins), making select fields 4px taller with a visibly looser label. Removed; select/input/date-picker now measure pixel-identical (6px gap, 63px total).

### Docs

- **Button page "Custom Flavors" demo taught the wrong tool** — it defined flavors via the `--ty-button-*` per-instance overrides (chosen for solid), which leak into every appearance: the outlined example rendered invisible white-on-transparent text at rest and turned fully solid on hover (`--ty-button-bg-hover` is top of outlined's hover chain too). The demo now defines flavors through the appearance-aware token layer (`--ty-solid-X*` for solid, `--ty-color-X` + `--ty-bg-X-soft` for outlined/ghost) and the prose explains the instance-override vs token distinction, plus the one-line `--ty-X-seed` path when the brand layer is loaded.

## [1.0.0-TC36] - 2026-08-05

Headline: **brand-layer restructure** — formulas declared once (dark mode keeps only hand-tuned data), text/borders finally engine-wired, and greys decoupled from the brand.

### Changed

- **Neutral is achromatic by default** — `--ty-neutral-hue`/`--ty-neutral-chroma` are now `0`/`0` instead of tracking the brand seeds (`brand-hue` / `brand-chroma × 0.04`). Greys — text hierarchy, borders, neutral buttons, muted buttons, dividers — no longer drift when the brand is re-hued. Opt back in to brand-warmed greys with `--ty-neutral-hue: var(--ty-brand-hue); --ty-neutral-chroma: calc(var(--ty-brand-chroma) * 0.04)`.
- **`--ty-text-*` and surface borders now go through the brand engine** — the 5-stop text ladder (`--ty-text-strong/bold/base/soft/faint`) and `--ty-content/elevated/floating-border` were hardcoded Tailwind hexes in tyrell.css that a rebrand never touched. New Tier 3 dials (`--ty-l-text-*`, `--ty-l-border-*`) hold their measured lightness; the brand layer overrides the hexes like every other token. Visible shift: text loses Tailwind's cool blue cast (max ~17/255 per channel) and follows the neutral seeds — pure grey at the new defaults.

- **Generic borders are their own family** — `--ty-border`/`-strong`/`-bold`/`-soft`/`-faint` no longer alias the neutral text ramp; they compute from a dedicated L ladder (`--ty-l-border-*`, per-mode values preserving the exact colors the aliases produced — verified 0 pixel diffs). Consequence: tuning the text emphasis curve or `--ty-neutral-l-factor` no longer moves app borders, and borders are tunable without touching text. Per-flavor accent borders (`--ty-border-{flavor}`) intentionally remain ink aliases.

### Internal

- **`tyrell-brand.css` dark-mode formula mirror deleted (~250 lines)** — SECTION 2 formulas are now declared once at `html:root` (out-ranking tyrell.css's light tokens by specificity and its `html.dark` hexes by source order), and the `html.dark` block holds only genuine per-mode data: the surface ladder, focus-ring alpha, the `--ty-bg-neutral-strong/-faint` pins, and the `--ty-solid-neutral` ink pin. Verified byte-equivalent before the neutral change: 323 computed tokens × 2 modes, zero differences.

## [1.0.0-TC35] - 2026-08-05

Headline: **auto-contrast solid foregrounds** — solid button text is now derived from its own fill's lightness instead of being hardcoded `white`, closing a contrast hole that affected every `flavor-` button out of the box. Also new: `muted` on `ty-button`.

### Added

- **`muted` attribute on `ty-button`** — suppresses the flavor color at rest (the button renders in neutral tokens) and reveals it on interaction. Hover reveal is gated behind `@media (hover: hover) and (pointer: fine)` so touch devices, which have no hover, aren't left with a permanently grey button; `:active` and `:focus-visible` reveal unconditionally, so a tap still shows the real color on press. Works across all three appearances (`solid`/`outlined`/`ghost`) and honors `+`/`-` tones via `--ty-*-neutral-strong`/`-soft`. Orthogonal to `flavor` and `appearance` — it's a separate axis, not a fourth appearance.
- **Auto-contrast foreground tokens** — `--ty-solid-{flavor}-fg` is now computed rather than literal, and gains per-tone siblings `--ty-solid-{flavor}-soft-fg` / `-strong-fg`. Each derives black or white from the lightness of the fill it actually sits on, using the same `oklch(from …)` relative-color syntax the solid fills already use:

  ```css
  --ty-solid-primary-soft-fg: oklch(from var(--ty-solid-primary-soft)
                                    clamp(0, (var(--ty-solid-fg-threshold) - l) * 1000, 1) 0 0);
  ```

  One token per *fill*, not per flavor: `base` / `-soft` / `-strong` sit at three different lightnesses, so each needs its own decision.
- **`--ty-solid-fg-threshold`** (default `0.6`) — the lightness crossover at which foregrounds flip from white to black. Raise it to prefer white, lower it to prefer black, or set it to `1` to restore the old fixed-white behavior globally.

### Fixed

- **Every `flavor-` (tone-minus) solid button failed WCAG AA** — `--ty-solid-soft-l: 0.1` lightens the fill for the `-` tone, but the foreground was pinned to `white`, so contrast collapsed. Measured across 6 flavors × 3 tones × 8 brand hues, 48 of 144 combinations fell below 4.5:1 (worst: `warning-` at **2.53:1**) — on the shipped defaults, with no rebranding involved. Now 0 of 144 fail, in both light and dark; worst case 4.61:1. The `.tone-plus`/`.tone-minus` button rules also set `color` now, not just `background`.
- **`ty-wizard` step circles failed WCAG AA in dark mode** (completed 3.48:1, active 3.79:1, error 3.93:1) — the circles paint `--ty-wizard-{state}-accent` (which defaults to `--ty-color-{flavor}`) but took their text color from `--ty-solid-{flavor}-fg`. Those two coincide in light mode but diverge by 0.25 L in dark, where `--ty-solid-l` dims solid fills against the dark canvas — so white text sat on a fill 0.25 lighter than the one the color was chosen for. Each circle now derives its foreground from the accent it actually paints (6.04 / 5.54 / 5.34:1 in dark; light unchanged).

### Changed

- **Solid button text is no longer always white.** On pale fills — the `-` tone, high `--ty-l-*` curves, light brand hues — labels now render black. This is the intended fix, but it is a visible change for anyone who was relying on white. Opt out per flavor with `--ty-solid-primary-fg: white`, or globally with `--ty-solid-fg-threshold: 1`.

### Docs

- **Docs site moved to Tailwind v4** (`@tailwindcss/browser@4`, replacing the v3 Play CDN). v3 declared its internal `--tw-*` state vars on `*, ::before, ::after`, so DevTools repeated that block once per ancestor when inspecting any element; v4 registers them via `@property` instead (its universal-selector fallback is gated behind an `@supports` that only matches engines without `@property` support). Visible `--tw-*` on a given element dropped from 51 to 11. Site-only — the Tyrell library itself has no Tailwind dependency.
- `TY_GUIDE.md` documents `muted`; `CSS_GUIDE.md` gains an "Auto-contrast foregrounds" section covering the threshold dial and the opt-out paths.

## [1.0.0-TC34] - 2026-07-22

Headline: **`ty-select` mobile-mode fixes** — stale hidden options, focus/keyboard, and external-search results not appearing.

### Fixed

- **Mobile options stayed hidden after a previous search, on open** — `openDropdown()` (desktop) has always defensively re-shown the options area on every open ("may have been hidden from previous search"); `openMobileModal()` had no equivalent. Added the mobile-appropriate reset (`updateTagVisibility` unhides every option on open, matching desktop's intent via the mechanism mobile actually uses — per-option `hidden` attribute rather than desktop's container-level `display:none`).
- **Mobile search input's focus was racing `showModal()`'s own native focus algorithm** — a manual `searchInput.focus()` call right after `showModal()` lost the race; `document.activeElement` ended up back on the host element, so keystrokes weren't reaching the input at all despite it looking focused. Replaced with the `autofocus` HTML attribute, which `showModal()` itself honors as part of its spec'd focusing steps — no race, and it correctly falls through to the close button when search is hidden.
- **`external-search` results never appeared on mobile after typing** — `.mobile-available-section[data-empty="true"] slot { display: none }` hides the *entire* options slot, not just the empty-state message, and only `updateMobileSelectedState()` (which sets `data-empty`) recomputes it. Internal filtering already called that; `external-search` bypasses internal filtering entirely and only the `MutationObserver` watching for consumer-driven `ty-option` swaps was left to catch a change — and it never called `updateMobileSelectedState()`. Result: the consumer's new options were genuinely in the DOM, correctly slotted, just invisible. Fixed by having the observer refresh mobile state too.

## [1.0.0-TC33] - 2026-07-21

Headline: **New brand default** — `--ty-brand-hue`/`--ty-brand-chroma` now `45`/`0.125` (amber/orange) instead of `230`/`0.12` (indigo).

### Changed

- **`tyrell-brand.css` default brand seed changed** from hue `230` / chroma `0.12` to hue `45` / chroma `0.125`. Anyone not overriding `--ty-brand-hue`/`--ty-brand-chroma` themselves will see their primary/neutral/surface colors shift on upgrade. Docs site's own OKLCH playground default (`theming.cljs` `default-seeds`, `packages/cljs/public/index.html`) synced to match.

## [1.0.0-TC32] - 2026-07-21

Headline: **`ty-select` chrome fixes** — font-family, height, and custom-trigger outline.

### Fixed

- **`ty-select` / `ty-date-picker` labels (and other unstyled shadow-DOM text) ignored `--ty-font-sans`** — neither component's `:host` pinned `font-family`, so text silently inherited whatever font the host page happened to be using instead of the library's own token, unlike `ty-input` which already pinned it. Both now set `font-family: var(--ty-font-sans)` on `:host`, matching `ty-input`.
- **`ty-select` with a custom trigger (`slot="trigger"`) still showed the default field outline** — `setupTriggerSlot()` toggled a `custom-trigger` class on `.select-stub` when a consumer slotted their own trigger content, but no CSS ever consumed that class, so the default border/background/padding and the open/focus ring (`box-shadow: 0 0 0 3px ...`) kept wrapping the custom content regardless. `.select-stub.custom-trigger` now goes fully bare (no border, background, padding, or ring) in every state, as originally intended.

## [1.0.0-TC31] - 2026-07-20

Headline: **flavors everywhere** — custom flavors and `+`/`-` tones, previously a `ty-button`/`ty-tag` exclusive, now work on every flavored component. Also: field and button sizing reworked onto one shared height scale.

### Added

- **Custom flavors + `+`/`-` tones for all flavored components** — `ty-switch`, `ty-radio`/`ty-radio-group`, `ty-checkbox`, `ty-input`, `ty-select`, `ty-date-picker`, `ty-copy`, `ty-tooltip`, and `ty-calendar`/`ty-calendar-month` now use the same mechanism as `ty-button`/`ty-tag`: any identifier is a valid `flavor`, themed from your `--ty-color-X` (and where relevant `--ty-bg-X` / `--ty-border-X`) tokens, with missing tokens degrading to neutral. `+`/`-` shade suffixes map to `-strong`/`-soft` tokens.
- **Per-instance color override vars on each component** — flavor colors funnel through local vars (`--switch-track`, `--radio-color`, `--checkbox-color[-off]`, `--input-accent[-bold]`/`--input-ring`, `--select-accent[-bold]`/`--select-ring`, `--date-picker-accent[-bold]`/`--date-picker-ring`, `--copy-color[-hover]`/`--copy-bg-hover`, `--calendar-month-accent`/`-selected-bg`/`-selected-color`/`-selected-hover-bg`), so e.g. `ty-switch[flavor="brand"] { --switch-track: … }` page rules recolor a single instance. See CSS_GUIDE.md → Per-Component Color Overrides.
- **`ty-select` gets an open-state focus ring** — matching `ty-input`'s `.focused` treatment (bolder border + a 3px 15%-alpha ring in the flavor color), the field previously had zero visual escalation when the dropdown opened.
- **`ty-copy` flavor actually renders** — the documented `flavor` attribute previously had no CSS behind it; it now colors the copy button, its hover, and the wrapper hover tint.
- **`ty-select` gained a `flavor` attribute** — previously had none (no error/danger coloring existed for it at all); now colors the field border + hover like `ty-input`, same built-ins/tones/custom-flavor support.
- **`ty-calendar` / `ty-calendar-month` gained a `flavor` attribute** — colors the selected day and today's number; `ty-calendar` forwards its flavor to the nested `ty-calendar-month` only (navigation arrows stay neutral chrome). `ty-date-picker` forwards its own flavor to the popup calendar it opens, so the two match automatically with no new API.

### Fixed

- **`ty-tooltip` no longer gets stuck on a stale flavor** — the popover element is created once and cached; a flavor change made while the tooltip was closed was silently dropped (`attributeChangedCallback` only restyled `if (name === 'flavor' && this._open)`). It now restyles on every flavor change regardless of visibility.
- **`ty-date-picker`'s popup calendar no longer gets stuck on a stale flavor** — `render()` only rebuilds (and re-forwards `flavor`) while the dialog is closed; changing the flavor while the popup is already open previously left it showing whatever flavor was active when it was opened. `updateDisplay()` (the open-dialog partial-update path) now also syncs `flavor` onto the existing `ty-calendar`.
- **Several icons/badges were hardcoded to primary regardless of the component's own flavor** — `ty-select`'s loading spinner and compact-mode count badge, `ty-date-picker`'s calendar trigger icon, and `ty-input`'s password-reveal focus outline all ignored `flavor` and always rendered primary-colored (or, for the calendar icon, a neutral tone that tracks the brand hue and so visually reads as a washed-out primary on the default theme). All four now follow the component's own accent, matching `ty-copy`'s icon (which already did).
- **`ty-checkbox`'s focus ring was hardcoded to `--ty-color-primary`** regardless of flavor — now matches the checked-state color via a new `--checkbox-ring` var.
- **`ty-date-picker`'s clear-button hover was silently unstyled** — it referenced `--ty-color-negative` / `--ty-bg-negative-faint`, neither of which exists as a token; fixed to `--ty-color-danger` / `--ty-bg-danger-soft` (clear stays neutral at rest and always warns danger-red on hover — a destructive utility action, not the field's own flavor).
- **`ty-select`'s compact-mode count badge referenced `--ty-text-primary`**, a nonexistent token, for its text color (silently fell back to unstyled inherited black) — fixed alongside making it follow flavor.
- **`ty-select` rendered 3-4px taller than `ty-input`/`ty-date-picker` at the same `size`** — the `.select-stub` size rules carried vertical padding (`0.375rem`/`0.5rem`) that stacked on top of `min-height` instead of being absorbed by the stub's `align-items: center`; zeroed, matching `ty-input`'s existing zero-vertical-padding approach. Fields now measure pixel-identical at every size.

### Changed

- **Unknown flavors no longer coerce** — components previously rewrote unknown flavors to a default (`primary`/`neutral`/`dark`) with a console warning. Any plain identifier now passes through as a custom flavor; syntactically invalid values fall back to the default look silently. Matches the existing `ty-button`/`ty-tag` behavior.
- **`ty-tooltip` flavor colors are token-derived** — the per-flavor switch statement collapsed to one formula (`--ty-bg-X` / `--ty-color-X-strong` / `--ty-border-X`); `dark`/`light`/`info` stay hand-tuned, and the default `dark` look routes through the documented `--ty-tooltip-bg`/`--ty-tooltip-color` escape hatch again (it previously clobbered it). Minor normalization: `success` tooltips now use `--ty-bg-success` like every other flavor (was `-bold`).
- **`ty-input` secondary/warning flavors gained hover states**; flavor CSS is generated from one formula, so all built-ins behave identically.
- **Flavored field borders follow the neutral emphasis ladder** — a flavored `ty-input`/`ty-select`/`ty-date-picker` previously rested on the full-strength flavor color, leaving no visible difference between rest, hover, and focus. Fields now rest on the flavor's `-soft` shade and escalate to the full color on hover/focus (+ ring), mirroring neutral's faint→soft→focus progression; `+`/`-` tones shift the whole ladder. The `--ty-input-{success,danger,warning}-border` tokens now alias the `-soft` shades accordingly.
- React wrappers: `flavor` prop types widened to accept `+`/`-` shades and custom flavor strings (`TySwitch`, `TyRadio`, `TyRadioGroup`, `TyCheckbox`, `TyInput`, `TySelect`, `TyCopy`, `TyDatePicker`, `TyTooltip`, `TyTag`, `TyCalendar`, `TyCalendarMonth`).
- **Field size ladder collapsed from five sizes to three** — `ty-input`/`ty-select`/`ty-date-picker` now come in exactly `sm`/`md`/`lg` (32/36/40px) via `--ty-size-{sm,md,lg}`, always the same height across all three field components at a given size. Legacy `xs`/`xl` attribute values still work but coerce to `sm`/`lg`.
- **`ty-button`'s size ladder now shares a scale with fields instead of running independently underneath them** — `xs`–`xl` is 24/28/32/36/40px, and the top three steps land exactly on the field ladder (button `md` = field `sm`, `lg` = field `md`, `xl` = field `lg`), so a button and a field of the paired size sit flush, same height, in a row. `xs`/`sm` remain button-only steps (compact toolbars, icon actions).

## [1.0.0-TC30] - 2026-07-10

Headline: **React 18 `className` fix** — utility classes on every `tyrell-react` wrapper now actually apply.

### Fixed

- **`className` on React wrappers did nothing under React 18** — React lowercases `className` on custom elements into a literal `classname=""` attribute no CSS matches, so host-level utility classes (layout, sizing — most visible on `TyScrollContainer`) were silently dropped. All 25 wrappers now normalize props through `hostProps()`, re-passing `className` as `class` (verbatim pass-through; harmless on React 19).

## [1.0.0-RC12] - 2026-07-10

`latest`-channel promotion of the TC27–TC29 line (npm `tyrell-components` + `tyrell-react`), and the first matching **Clojars release**: `dev.gersak/tyrell` and `dev.gersak/tyrell-icons` `1.0.0-RC12` — `tyrell.react` no longer references the removed `TyDropdown`/`TyMultiselect` exports (RC11 fails to compile against tyrell-react ≥ TC27).

## [1.0.0-TC29] - 2026-07-10

Headline: **date-picker & calendar restyle** — ghost day cells, one strong element (the selected day), proper time inputs — plus custom flavors for `ty-tag`/`ty-button` and the docs/guides purge of the removed components.

### Added

- **Custom flavors for `ty-tag` and `ty-button`** — any identifier works as a `flavor`: the component generates the same token wiring built-in flavors get, pointed at your design tokens (`--ty-bg-X`, `--ty-color-X`, `--ty-solid-X`, …). Buttons degrade to `neutral` when tokens are missing instead of rendering invisible. Injected as a shadow stylesheet, so page-level `ty-tag[flavor="X"] { --tag-bg: … }` overrides still win. Flavor CSS is generated per flavor/appearance from one formula (completes the generator that partially shipped in TC28).

### Changed

- **Calendar day grid restyle** (`ty-calendar-month`, and therefore `ty-calendar` / `ty-date-picker`): day cells are ghost cells — no border boxes; hover is a soft neutral rounded pill; the selected day is the single filled element; **today** is an accent-colored semibold number (no background slab — never collides with hover, selected pill wins when today is picked); weekends are undifferentiated by default (theme back via `--ty-calendar-weekend-color`); weekday headers muted; day numbers use tabular numerals. All `--ty-calendar-*` theming hooks kept — only defaults changed.
- **Date-picker time section**: gray slab replaced by a transparent row with a hairline separator; hour/minute inputs are now proper mini-fields (border, input background, focus ring, tabular digits).
- **Docs & guides**: every reference to the removed `ty-dropdown`/`ty-multiselect` purged from README, all guides, and agent instructions (TYCOMPONENT_GUIDE's case study rewritten around the real `TySelect` API).

### Fixed

- **`ty-calendar-navigation` at `md` (the default size) had zero padding** — only `sm`/`lg` defined the size CSS variables, so `padding: var(--nav-padding)` collapsed to nothing and the month/year header sat flush against the popup's top edge. `md` now has its own block (`0.5rem 0.75rem` padding, `2rem` buttons, `280px` default width), aligned with the month grid.

## [1.0.0-TC28] - 2026-07-10

Headline: **card-style `ty-select` popup search** — a detached bordered field with the `ty-input` focus ring instead of the fused search header. (Published mid-stream; the calendar restyle and nav-padding fix that were staged alongside landed in TC29.)

### Changed

- **`ty-select` popup search**: the fused search header is now a detached bordered field inside the panel — its own rounded border and `ty-input`-style focus ring, whitespace instead of a divider line, magnifier inside the field.
- Groundwork for generated per-flavor button CSS (completed in TC29).

## [1.0.0-TC27] - 2026-07-10

Headline: **`ty-dropdown` and `ty-multiselect` removed** (deprecated in TC26) — the bundle drops ~18%, and `ty-select` gets the visual polish pass: a real check icon on selected options and card-style list rows.

### Removed

- **`ty-dropdown` and `ty-multiselect`**: components, `tyrell-components/dropdown` + `/multiselect` subpath exports, React wrappers (`TyDropdown`, `TyMultiselect` and aliases), ClojureScript `tyrell.react` defs, docs pages, and tests. Migration guide lives on the select docs page (`ty-select` = single by default, `multiple` for multi, chips out-of-band via `ty-selected-tags`). Minified CDN bundle: 74 kB gzip.

### Changed — ty-select popup

- **Selection tick is now the lucide `check` icon** rendered inside `ty-option` (right-aligned, primary color) — replaces the text-glyph "✓" overlay ty-select stamped on selected options. Hidden on the clone displayed in the trigger field. Works everywhere `ty-option` renders.
- **Card-style option list**: rows are inset from the panel edges with rounded corners; hover and keyboard highlight use the neutral surface (`--ty-bg-neutral-soft`) instead of primary — selection stays expressed by the check + bolder text, not a background slab.

### Fixed

- **`ty-tabs` marker no longer glides in from the top-left corner** on first display. The active-tab marker's position transition also ran on its very first positioning — and on the first re-measure after rendering hidden (modals, drawers, toggled panels), where it had been "positioned" at 0,0 with zero-size rects. The marker now snaps (no animation) when it was never positioned or currently has zero rendered size; tab-to-tab switching still animates.

## [1.0.0-TC26] - 2026-07-09

Headline: **`ty-select` — the select control that replaces `ty-dropdown` and `ty-multiselect`.** Single select by default with a form-field look matching `ty-input`; one attribute each for multi-select and the compact toolbar skin; rich options display intact in the field. Both legacy components are deprecated (kept for compatibility, no new features) — all site demos and framework guides migrated.

### Added — ty-select

- **`multiple`** — native `<select multiple>` semantics. Absent = single select: scalar `value`, picking replaces the selection and closes the popup, one FormData entry. Present = toggle selection, popup stays open, repeated `name=` entries (HTMX-ready).
- **`compact`** — content-hugging trigger for toolbars/filter bars instead of the default full-width field. Single shows the selected label; multiple shows placeholder + count badge.
- **`searchable`** — popup search row on demand: `auto` (default) shows it only for 8+ options — short lists open as pure option menus; `searchable`/`"true"` always, `"false"` never; `external-search` always (the input is its mechanism). Magnifier icon in the search row.
- **Rich selected display (single)** — the selected option is cloned into the trigger (`slot="selected"` + `cloned`, same mechanism as ty-dropdown), so rich HTML options (icons, prices, flags) display intact.
- **`label` attribute on `ty-option`** — native `<option label>` semantics: clean display text for multi-select field summaries and `ty-selected-tags` chips when option content is rich HTML. Honored by ty-select display, `change` `items`, and chip templates.
- **`start` / `end` slots** — field adornments (icons, badges), same convention as ty-input; `end` sits before the chevron. Works in the compact skin.
- **`change` detail `value`** — scalar for single select, array for multiple; `values` always the array form.
- **Subpath exports** — `tyrell-components/select` and `tyrell-components/selected-tags`.
- **React wrappers** — `TySelect` + `TySelectedTags` (typed props, array value coercion, React-18 property bridge); `TyOption` gains typed `label` and `flavor` props.

### Added — ty-input password reveal

- `type="password"` renders a built-in eye / eye-off toggle after the end slot. Toggles the native input's type only — component `type`, form value, and API unchanged. `aria-pressed`/`aria-label` swap; focus stays in the field.

### Added — ty-checkbox

- **Redesigned as a single tick** — full flavor color when checked, faint when unchecked, dash + mid-opacity when `indeterminate` (new attribute, native semantics: visual/ARIA only, clicking resolves to checked), grayscale when disabled.

### Added — calendar bounds

- **`min` / `max`** (ISO dates) on `ty-calendar`, `ty-calendar-month`, `ty-calendar-navigation`, and `ty-date-picker` (incl. the native mobile input). Out-of-bounds days are disabled and don't emit; navigation clamps — year jumps land ON the bound month. Out-of-bounds programmatic selections set `rangeUnderflow`/`rangeOverflow` constraint validity. Set cross-wise on two calendars for period pickers.

### Fixed

- **Label-click delegation** for `ty-checkbox`, `ty-switch`, and `ty-radio`: the click handler now lives on the host, so the documented `<label><ty-checkbox></ty-checkbox> text</label>` pattern actually toggles/selects. Previously label-text clicks did nothing (the synthetic click never reached the shadow-internal listener).
- **Reconnect death**: checkbox/switch/radio moved in the DOM lost their listeners permanently; they re-arm on reconnect.
- **Parse-order init bugs** (plain-HTML/SSR pages): `ty-radio-group` initial `value` now marks the matching radio (children announce on connect); `ty-selected-tags` `<template>` chips now stamp when the template is parsed after the element connects, and initial picker values render as chips (observes the picker's `selected` attributes).
- **ty-select popup positioning** with hundreds of options: the height estimate used the uncapped content height and blindly flipped the popup above the field (clipping off-screen); now capped, and when neither side fits it takes the side with more room.
- **ty-select loading panel** styling: continues the fused one-panel silhouette instead of floating as a detached card with a see-through gap.
- **`ty-calendar` standalone import**: side-effect imports register its child elements (type-only imports left `ty-calendar-navigation`/`ty-calendar-month` undefined for `tyrell-components/calendar` consumers).

### Changed

- **Monochrome surfaces by default** — `tyrell-brand.css` surfaces no longer tint toward brand; new `--ty-surface-chroma` knob (default `0`) restores the warmth if wanted. Default `--ty-brand-chroma` lowered `0.2` → `0.12`.
- **Softer input borders** — `--ty-input-border`/`-hover` one step fainter in both the base and brand layers.
- Aliases: `ty-modal` also registered as **`ty-dialog`**, `ty-copy` as **`ty-copy-field`** (same class; React exports `TyDialog`/`TyCopyField`).

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

### Fixed — React boolean props (controlled-state workflow)

All 24 React wrappers migrated to a shared `useBooleanProperty` helper that fixes two long-standing bugs in how boolean props are bridged to the underlying custom element:

1. **`"false"` was treated as truthy.** Passing `disabled="false"` / `open="false"` (or any non-empty string) was coerced to `true`. The helper now correctly maps `"false"` and `"0"` to `false`.
2. **`true → false` flips didn't propagate on React 18.** React 18 removes the attribute when a boolean prop flips to `false`, but custom-element JS-property state can lag behind. The helper imperatively syncs the JS property in `useEffect` so the element actually reflects the new value.

Net effect: **controlled state via props now works correctly across the board.** The biggest practical consequence is the modal/popup workflow:

```tsx
// This pattern was unreliable before — modal could refuse to close.
const [open, setOpen] = useState(false);
<TyModal open={open} onClose={() => setOpen(false)}>…</TyModal>
<button onClick={() => setOpen(true)}>Open</button>
<button onClick={() => setOpen(false)}>Close</button>
```

Parent state owns `open`. Flip it `false` and the modal closes. Same applies to `<TyPopup open>`, `<TyDatePicker open>`, and every other wrapper with boolean props (`disabled`, `required`, `clearable`, `loading`, `readonly`, `multiline`, `spin`, `pulse`, and modal close-on-* flags).

For modals that need a confirm-before-close gate, combine this with the new `onBeforeClose` prop and `.hide({force: true})` imperative escape hatch (see "Added — Modal beforeclose event" above).

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
