import { fixture, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/checkbox.js';
import '../lib/components/switch.js';
import '../lib/components/radio.js';

/**
 * ty-checkbox / ty-switch / ty-radio center themselves on the first line of
 * the surrounding text at every size: the host is one line box tall and a
 * control bigger than the line overhangs it instead of growing it (so the
 * label row stays the text's height and the tick doesn't sink below the
 * first line's middle).
 */

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
// Tailwind text-xs / text-sm / text-xl (font-size / line-height, px)
const FONTS = [
  { name: 'text-xs', size: 12, leading: 16 },
  { name: 'text-sm', size: 14, leading: 20 },
  { name: 'text-xl', size: 20, leading: 28 },
];
const CONTROLS = [
  { tag: 'ty-checkbox', visual: 'svg' },
  { tag: 'ty-switch', visual: '.switch-track' },
  { tag: 'ty-radio', visual: '.radio-circle' },
];

const mid = (r: DOMRect) => r.top + r.height / 2;

/** Center of the control's visual (tick / track / circle). */
const visualMid = (el: Element, sel: string) =>
  mid(el.shadowRoot!.querySelector(sel)!.getBoundingClientRect());

/** Center of the first rendered line of a text node. */
const firstLineMid = (node: Node) => {
  const range = document.createRange();
  range.selectNodeContents(node);
  return mid(range.getClientRects()[0] as DOMRect);
};

const font = (f: (typeof FONTS)[number]) =>
  `font-family: sans-serif; font-size: ${f.size}px; line-height: ${f.leading}px;`;

async function mount(markup: string) {
  const wrap = (await fixture(`<div style="width: 600px">${markup}</div>`)) as HTMLElement;
  await nextFrame();
  await nextFrame();
  return wrap;
}

for (const { tag, visual } of CONTROLS) {
  describe(`${tag} centers on the first text line`, () => {
    for (const f of FONTS) {
      for (const size of SIZES) {
        for (const items of ['start', 'center']) {
          it(`${size} next to ${f.name}, flex items-${items}`, async () => {
            const wrap = await mount(
              `<label style="display: flex; align-items: ${items}; gap: 8px; ${font(f)}">` +
                `<${tag} size="${size}"></${tag}><span>Label text</span></label>`,
            );
            const label = wrap.querySelector('label')!;
            const span = wrap.querySelector('span')!;
            const el = wrap.querySelector(tag)!;
            const d = visualMid(el, visual) - firstLineMid(span.firstChild!);
            expect(Math.abs(d), `off by ${d.toFixed(2)}px`).to.be.at.most(1);
            // The control doesn't push the row: it stays the text's height.
            expect(label.getBoundingClientRect().height).to.be.closeTo(
              span.getBoundingClientRect().height,
              0.5,
            );
          });
        }

        it(`${size} inline in ${f.name} text`, async () => {
          const wrap = await mount(
            `<p style="margin: 0; ${font(f)}">Before <${tag} size="${size}"></${tag}> after</p>`,
          );
          const p = wrap.querySelector('p')!;
          const el = wrap.querySelector(tag)!;
          const d = visualMid(el, visual) - firstLineMid(p.firstChild!);
          expect(Math.abs(d), `off by ${d.toFixed(2)}px`).to.be.at.most(1);
          // The line box keeps the text's line-height.
          expect(p.getBoundingClientRect().height).to.be.closeTo(f.leading, 0.5);
        });
      }

      it(`multi-line ${f.name} label (items-start): xl aligns to the first line`, async () => {
        const wrap = await mount(
          `<label style="display: flex; align-items: flex-start; gap: 8px; width: 160px; ${font(f)}">` +
            `<${tag} size="xl"></${tag}><span>A label long enough to wrap onto several lines here</span></label>`,
        );
        const span = wrap.querySelector('span')!;
        const el = wrap.querySelector(tag)!;
        expect(span.getBoundingClientRect().height, 'wraps').to.be.at.least(f.leading * 2);
        const d = visualMid(el, visual) - firstLineMid(span.firstChild!);
        expect(Math.abs(d), `off by ${d.toFixed(2)}px`).to.be.at.most(1);
      });
    }
  });
}
