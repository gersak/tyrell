import { fixture, html, expect, nextFrame } from '@open-wc/testing';
// axe-core is loaded as a classic script (window.axe) via web-test-runner.config.mjs.
const axe: any = (window as any).axe;
import '../lib/components/button.js';
import '../lib/components/input.js';
import '../lib/components/textarea.js';
import '../lib/components/checkbox.js';
import '../lib/components/switch.js';
import '../lib/components/radio.js';
import '../lib/components/tag.js';

// Page-structure rules that don't apply to an isolated component fixture.
const IGNORE = new Set([
  'region', 'landmark-one-main', 'page-has-heading-one',
  'html-has-lang', 'document-title', 'bypass',
]);

async function audit(el: Element): Promise<string[]> {
  const res = await (axe as any).run(el, { resultTypes: ['violations'] });
  return res.violations
    .filter((v: any) => ['serious', 'critical'].includes(v.impact) && !IGNORE.has(v.id))
    .map((v: any) => `${v.id} (${v.impact})`);
}

function expectClean(v: string[]) {
  expect(v, `axe violations: ${v.join(' | ') || 'none'}`).to.have.lengthOf(0);
}

describe('a11y (axe) — no serious/critical violations', () => {
  it('ty-button', async () => {
    const el = await fixture(html`<ty-button>Save</ty-button>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-input (labeled)', async () => {
    const el = await fixture(html`<ty-input label="Email" type="email"></ty-input>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-textarea (labeled)', async () => {
    const el = await fixture(html`<ty-textarea label="Message"></ty-textarea>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-checkbox (in label)', async () => {
    const el = await fixture(html`<label><ty-checkbox></ty-checkbox> Accept terms</label>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-switch (in label)', async () => {
    const el = await fixture(html`<label><ty-switch></ty-switch> Notifications</label>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-radio-group', async () => {
    const el = await fixture(html`
      <ty-radio-group label="Plan">
        <label><ty-radio value="a"></ty-radio> Basic</label>
        <label><ty-radio value="b"></ty-radio> Pro</label>
      </ty-radio-group>
    `);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-tag', async () => {
    const el = await fixture(html`<ty-tag>Label</ty-tag>`);
    await nextFrame();
    expectClean(await audit(el));
  });
});
