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
import '../lib/components/tooltip.js';
import '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/date-picker.js';
import '../lib/components/calendar-month.js';
import '../lib/components/copy.js';
import '../lib/components/tabs.js';
import '../lib/components/wizard.js';
import '../lib/components/file-upload.js';
import '../lib/components/popup.js';
import '../lib/components/modal.js';

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

  it('ty-tooltip — trigger has a resolvable aria-describedby', async () => {
    // Nested directly inside the trigger — the real usage pattern; also
    // exercises that the popover (created eagerly, outside this fixture's
    // own DOM subtree in document.body) is what aria-describedby resolves
    // to. axe's aria-valid-attr-value rule fails if the id doesn't exist.
    const el = await fixture(html`<ty-button>Save<ty-tooltip>Saves the document</ty-tooltip></ty-button>`);
    await nextFrame();
    try {
      expectClean(await audit(el));
    } finally {
      document.querySelectorAll('[popover]').forEach((p) => p.remove());
    }
  });

  it('ty-select (labeled, closed)', async () => {
    const el = await fixture(html`
      <ty-select label="Country">
        <ty-option value="a">Aland</ty-option>
        <ty-option value="b">Belgium</ty-option>
      </ty-select>
    `);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-select (open — dialog + listbox + options all in the tree)', async () => {
    const el = (await fixture(html`
      <ty-select label="Country">
        <ty-option value="a">Aland</ty-option>
        <ty-option value="b">Belgium</ty-option>
      </ty-select>
    `)) as any;
    await nextFrame();
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-date-picker (labeled, closed)', async () => {
    const el = await fixture(html`<ty-date-picker label="Arrival date"></ty-date-picker>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-date-picker (open — calendar dialog in the tree)', async () => {
    const el = (await fixture(html`<ty-date-picker label="Arrival date"></ty-date-picker>`)) as any;
    await nextFrame();
    (el.shadowRoot.querySelector('.date-picker-stub') as HTMLElement).click();
    // Opening is requestAnimationFrame-deferred (see openDropdown) — the
    // regular ty-date-picker.test.ts openDialog() helper needs the same two.
    await nextFrame();
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-calendar-month (grid + gridcells + roving tabindex)', async () => {
    const el = await fixture(html`
      <ty-calendar-month display-year="2026" display-month="7"></ty-calendar-month>
    `);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-copy', async () => {
    const el = await fixture(html`<ty-copy value="npm i tyrell-components"></ty-copy>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-tabs', async () => {
    const el = await fixture(html`
      <ty-tabs height="200px" active="overview">
        <ty-tab id="overview" label="Overview">Overview content</ty-tab>
        <ty-tab id="details" label="Details">Details content</ty-tab>
      </ty-tabs>
    `);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-wizard', async () => {
    const el = await fixture(html`
      <ty-wizard height="300px" active="step1">
        <ty-step id="step1" label="Step One">First step</ty-step>
        <ty-step id="step2" label="Step Two">Second step</ty-step>
      </ty-wizard>
    `);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-file-upload', async () => {
    const el = await fixture(html`<ty-file-upload label="Attachments"></ty-file-upload>`);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-popup (closed, trigger + popup content in the tree)', async () => {
    const el = await fixture(html`
      <button>Click me<ty-popup><div>Popup content</div></ty-popup></button>
    `);
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-popup (open)', async () => {
    const el = (await fixture(html`
      <button>Click me<ty-popup><div>Popup content</div></ty-popup></button>
    `)) as HTMLElement;
    await nextFrame();
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextFrame();
    await nextFrame();
    expectClean(await audit(el));
  });

  it('ty-modal (open, with label)', async () => {
    const el = (await fixture(html`
      <ty-modal label="Confirm delete"><p>Are you sure?</p></ty-modal>
    `)) as any;
    el.setAttribute('open', 'true');
    await nextFrame();
    expectClean(await audit(el));
  });
});
