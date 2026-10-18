import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { sendMouse, resetMouse } from '@web/test-runner-commands';
import '../lib/components/button.js';
import * as buttonCss from '../lib/styles/button.js';
import * as calendarCss from '../lib/styles/calendar.js';
import * as calendarMonthCss from '../lib/styles/calendar-month.js';
import * as calendarNavigationCss from '../lib/styles/calendar-navigation.js';
import * as checkboxCss from '../lib/styles/checkbox.js';
import * as copyCss from '../lib/styles/copy.js';
import * as customScrollbarCss from '../lib/styles/custom-scrollbar.js';
import * as datePickerCss from '../lib/styles/date-picker.js';
import * as fieldSizeCss from '../lib/styles/field-size.js';
import * as fileUploadCss from '../lib/styles/file-upload.js';
import * as iconCss from '../lib/styles/icon.js';
import * as inputCss from '../lib/styles/input.js';
import * as modalCss from '../lib/styles/modal.js';
import * as optionCss from '../lib/styles/option.js';
import * as popupCss from '../lib/styles/popup.js';
import * as radioCss from '../lib/styles/radio.js';
import * as scrollContainerCss from '../lib/styles/scroll-container.js';
import * as selectBaseCss from '../lib/styles/select-base.js';
import * as selectCss from '../lib/styles/select.js';
import * as stepCss from '../lib/styles/step.js';
import * as switchCss from '../lib/styles/switch.js';
import * as tabCss from '../lib/styles/tab.js';
import * as tabsCss from '../lib/styles/tabs.js';
import * as tagCss from '../lib/styles/tag.js';
import * as textareaCss from '../lib/styles/textarea.js';
import * as tooltipCss from '../lib/styles/tooltip.js';
import * as wizardCss from '../lib/styles/wizard.js';

// tyrell.css reads its colors from ONE of two layers — tyrell-colors-static.css
// (hex) or tyrell-theme.css (oklch engine). A token only one layer defines is
// invalid in the other: .ty-border-neutral fell back to currentColor on the
// theme layer, and on the static layer every tone+/tone- solid button lost its
// fill on hover/active (--ty-solid-hover-l / -active-l) while keeping its
// white label. These lock both layers to the full token set, in both modes.

const COMPONENT_CSS = [
  buttonCss, calendarCss, calendarMonthCss, calendarNavigationCss, checkboxCss,
  copyCss, customScrollbarCss, datePickerCss, fieldSizeCss, fileUploadCss,
  iconCss, inputCss, modalCss, optionCss, popupCss, radioCss, scrollContainerCss,
  selectBaseCss, selectCss, stepCss, switchCss, tabCss, tabsCss, tagCss,
  textareaCss, tooltipCss, wizardCss,
].flatMap((m) => Object.values(m).filter((v): v is string => typeof v === 'string'));

const LAYERS = ['tyrell-colors-static.css', 'tyrell-theme.css'] as const;
const TRANSPARENT = 'rgba(0, 0, 0, 0)';
const RED = 'rgb(255, 0, 0)';

/** Parse `var(` at `at`: its name, fallback text (or null) and end index. */
function parseVar(css: string, at: number) {
  let depth = 1;
  let comma = -1;
  let i = at + 4;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === '(') depth++;
    else if (css[i] === ')') depth--;
    else if (css[i] === ',' && depth === 1 && comma < 0) comma = i;
  }
  const inner = css.slice(at + 4, i - 1);
  const name = (comma < 0 ? inner : css.slice(at + 4, comma)).trim();
  return { name, fallback: comma < 0 ? null : css.slice(comma + 1, i - 1), end: i };
}

/** var() refs a page would actually fall through to and find undefined —
    a fallback is only followed when its own var is undefined. */
function unresolved(css: string, isDefined: (name: string) => boolean, out: Set<string>) {
  for (let at = css.indexOf('var('); at >= 0; at = css.indexOf('var(', at)) {
    const { name, fallback, end } = parseVar(css, at);
    if (!isDefined(name)) {
      if (fallback !== null) unresolved(fallback, isDefined, out);
      else out.add(name);
    }
    at = end;
  }
}

async function loadSheet(href: string): Promise<HTMLLinkElement> {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  const loaded = new Promise((res, rej) => {
    link.onload = res;
    link.onerror = () => rej(new Error(`failed to load ${href}`));
  });
  document.head.appendChild(link);
  await loaded;
  return link;
}

const center = (node: Element): [number, number] => {
  const r = node.getBoundingClientRect();
  return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
};

for (const layer of LAYERS) {
  describe(`color layer: tyrell.css + ${layer}`, () => {
    let sheets: HTMLLinkElement[] = [];
    let baseCss = '';

    before(async () => {
      sheets = [await loadSheet('/css/tyrell.css'), await loadSheet(`/css/${layer}`)];
      baseCss = await (await fetch('/css/tyrell.css')).text();
      // Registered theme dials crossfade on a mode switch; read end values.
      document.documentElement.style.setProperty('--ty-theme-transition', '0s');
    });

    after(() => {
      sheets.forEach((s) => s.remove());
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--ty-theme-transition');
    });

    afterEach(() => resetMouse());

    for (const mode of ['light', 'dark'] as const) {
      describe(mode, () => {
        before(() => document.documentElement.classList.toggle('dark', mode === 'dark'));

        it('defines every --ty-* token tyrell.css and the component styles fall through to', () => {
          const sources = [baseCss, ...COMPONENT_CSS].map((c) => c.replace(/\/\*[\s\S]*?\*\//g, ''));
          // Tokens a stylesheet declares itself (component-local, :host, scoped).
          const declared = new Set(sources.flatMap((c) => [...c.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])));
          const root = getComputedStyle(document.documentElement);
          const isDefined = (n: string) => declared.has(n) || root.getPropertyValue(n).trim() !== '';
          const missing = new Set<string>();
          for (const css of sources) unresolved(css, isDefined, missing);
          expect([...missing].filter((n) => n.startsWith('--ty-'))).to.deep.equal([]);
        });

        for (const tone of ['+', '-'] as const) {
          for (const flavor of ['primary', 'success', 'danger', 'warning', 'neutral']) {
            it(`solid ${flavor}${tone} keeps a fill on hover and active`, async () => {
              const el = (await fixture(html`
                <ty-button flavor="${flavor}${tone}" style="--ty-local-transition: none">Save</ty-button>
              `)) as HTMLElement;
              await nextFrame();
              const btn = el.shadowRoot!.querySelector('button')!;
              const fill = () => getComputedStyle(btn).backgroundColor;
              const rest = fill();
              expect(rest, 'rest').to.not.equal(TRANSPARENT);

              await sendMouse({ type: 'move', position: center(btn) });
              const hover = fill();
              await sendMouse({ type: 'down' });
              const active = fill();
              await sendMouse({ type: 'up' });

              expect(hover, 'hover').to.not.equal(TRANSPARENT);
              expect(active, 'active').to.not.equal(TRANSPARENT);
              expect(hover, 'hover differs from rest').to.not.equal(rest);
            });
          }
        }

        it('.ty-border-neutral (and hover:/focus:) paint a neutral border, not currentColor', async () => {
          const el = await fixture(html`
            <div style="color: ${RED}">
              <div class="ty-border-neutral" style="border-width: 3px; border-style: solid; width: 40px; height: 20px"></div>
              <div class="hover:ty-border-neutral" style="border-width: 3px; border-style: solid; width: 40px; height: 20px"></div>
              <div class="focus:ty-border-neutral" tabindex="0" style="border-width: 3px; border-style: solid; width: 40px; height: 20px"></div>
            </div>
          `);
          const [plain, hovered, focused] = Array.from(el.children) as HTMLElement[];
          expect(getComputedStyle(plain).borderTopColor).to.not.equal(RED);

          await sendMouse({ type: 'move', position: center(hovered) });
          expect(getComputedStyle(hovered).borderTopColor).to.not.equal(RED);

          focused.focus();
          expect(getComputedStyle(focused).borderTopColor).to.not.equal(RED);
        });

        it('hover:ty-bg-neutral-- and hover:ty-bg-neutral++ paint a background', async () => {
          const el = await fixture(html`
            <div>
              <div class="hover:ty-bg-neutral--" style="width: 40px; height: 20px"></div>
              <div class="hover:ty-bg-neutral++" style="width: 40px; height: 20px"></div>
            </div>
          `);
          for (const box of Array.from(el.children) as HTMLElement[]) {
            await sendMouse({ type: 'move', position: center(box) });
            expect(getComputedStyle(box).backgroundColor, box.className).to.not.equal(TRANSPARENT);
          }
        });
      });
    }
  });
}
