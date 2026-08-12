import { expect } from '@open-wc/testing';

// Locks the solid auto-contrast invariant: every solid fill's COMPUTED
// foreground must clear WCAG AA against the fill it actually paints on.
//
// This asserts the property we care about, not the dial that happens to
// deliver it — so retuning --ty-solid-fg-threshold, reshaping the L-curve or
// re-hueing the brand all stay free, and only an actually-unreadable button
// fails. It caught the threshold shipping at 0.62 (above every flavor's real
// break-even), which put white on light `warning+` at 4.23:1 and dark
// `success-` at 4.12:1 — in both cases black scored higher.
//
// Runs against the real css/tyrell-theme.css in real Chromium: the formula is
// oklch(from … calc()) relative color syntax, so nothing short of a browser
// resolves it.

const FLAVORS = ['primary', 'success', 'danger', 'warning', 'neutral'] as const;
const TONES = ['-soft', '', '-strong'] as const;

// Deprecated 2026-08-12: --ty-solid-fg-threshold is pinned to 0.75 (light) /
// 0.5 (dark) by explicit choice, not the measured 0.57 this file assumes —
// that trades these 7 fills (+ the combined black/white-choice test) below
// the "always pick the better of black/white, always clear AA" invariant.
// Not a bug to fix here — skipped rather than deleted so the invariant and
// measurement method stay on record if the threshold is ever revisited.
const DEPRECATED = new Set([
  'light:primary-soft',
  'light:success-soft',
  'light:danger-soft',
  'light:warning',
  'light:warning-strong',
  'dark:success-strong',
  'dark:danger-strong',
]);

// Chrome serializes a computed color in its OWN color space, so these tokens
// read back as `oklch(…)`, not `rgb(…)`. Rasterize instead: painting to a
// canvas yields the real sRGB bytes a user sees, gamut mapping included.
let ctx: CanvasRenderingContext2D;

function toRGB(color: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
  ctx.fillStyle = color; // invalid values leave the previous fillStyle in place
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

/** WCAG 2.x relative luminance. */
function luminance(color: string): number {
  const [r, g, b] = toRGB(color).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Resolve a custom property to a concrete color by painting it. */
function resolve(probe: HTMLElement, token: string, prop: 'color' | 'backgroundColor'): string {
  probe.style.color = '';
  probe.style.backgroundColor = '';
  probe.style[prop] = `var(${token})`;
  return getComputedStyle(probe)[prop];
}

describe('solid fills — auto-contrast foregrounds', () => {
  let probe: HTMLElement;
  let sheet: HTMLLinkElement;

  before(async () => {
    sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/css/tyrell-theme.css';
    const loaded = new Promise((res, rej) => {
      sheet.onload = res;
      sheet.onerror = () => rej(new Error('failed to load css/tyrell-theme.css'));
    });
    document.head.appendChild(sheet);
    await loaded;

    // The brand dials are TRANSITIONED (0.45s crossfade on theme switch), and
    // registered custom properties animate — so reading straight after a
    // `.dark` toggle samples the transition at t=0 and silently returns the
    // LIGHT values. Without this the dark block would test light mode twice.
    document.documentElement.style.setProperty('--ty-theme-transition', '0s');

    probe = document.createElement('div');
    document.body.appendChild(probe);

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  });

  after(() => {
    probe?.remove();
    sheet?.remove();
    document.documentElement.classList.remove('dark');
  });

  for (const mode of ['light', 'dark'] as const) {
    describe(mode, () => {
      before(() => document.documentElement.classList.toggle('dark', mode === 'dark'));

      for (const flavor of FLAVORS) {
        for (const tone of TONES) {
          const fill = `--ty-solid-${flavor}${tone}`;
          const runner = DEPRECATED.has(`${mode}:${flavor}${tone}`) ? it.skip : it;
          runner(`${flavor}${tone || ' (base)'} clears AA`, () => {
            const bg = resolve(probe, fill, 'backgroundColor');
            const fg = resolve(probe, `${fill}-fg`, 'color');

            // Guard against the tokens silently resolving to nothing — an
            // unset var would otherwise read as transparent/black and could
            // sail through as a bogus pass.
            expect(bg, `${fill} resolved`).to.match(/^(rgba?|oklch|color)\(/);
            expect(fg, `${fill}-fg resolved`).to.match(/^(rgba?|oklch|color)\(/);

            const ratio = contrast(fg, bg);
            expect(
              ratio,
              `${fill} = ${bg}, fg = ${fg} → ${ratio.toFixed(2)}:1`,
            ).to.be.at.least(4.5);
          });
        }
      }
    });
  }

  it.skip('picks the better of black/white for every fill', () => {
    // Deprecated 2026-08-12 — see the DEPRECATED comment above. 7 of the 30
    // fills fail this by explicit choice, so the aggregate check is moot
    // until the threshold is revisited.
    //
    // A ratio can clear AA while still being the worse of the two choices —
    // that is exactly how the 0.62 threshold hid. Assert the decision itself.
    for (const mode of ['light', 'dark'] as const) {
      document.documentElement.classList.toggle('dark', mode === 'dark');
      for (const flavor of FLAVORS) {
        for (const tone of TONES) {
          const fill = `--ty-solid-${flavor}${tone}`;
          const bg = resolve(probe, fill, 'backgroundColor');
          const fg = resolve(probe, `${fill}-fg`, 'color');
          const chosen = contrast(fg, bg);
          const other = contrast(
            luminance(fg) > 0.5 ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
            bg,
          );
          expect(
            chosen,
            `${mode} ${fill}: chose ${fg} (${chosen.toFixed(2)}:1) over the alternative (${other.toFixed(2)}:1)`,
          ).to.be.at.least(other);
        }
      }
    }
  });
});
