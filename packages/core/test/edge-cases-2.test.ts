/**
 * Edge-case audit suite, part 2 (2026-08-19) — wizard, tabs, option,
 * resize-observer. Companion to edge-cases.test.ts — audit findings whose
 * fixes landed 2026-08-19; these pin the behavior.
 */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/wizard.js';
import '../lib/components/step.js';
import '../lib/components/tabs.js';
import '../lib/components/tab.js';
import '../lib/components/option.js';
import '../lib/components/resize-observer.js';
import { getSize } from '../lib/utils/resize-observer.js';

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// ty-wizard
// ---------------------------------------------------------------------------
describe('ty-wizard edge cases', () => {
  it('active pointing at an unknown step falls back to the first step', async () => {
    const el = (await fixture(html`
      <ty-wizard active="ghost">
        <ty-step id="one" label="One">1</ty-step>
        <ty-step id="two" label="Two">2</ty-step>
      </ty-wizard>
    `)) as HTMLElement;
    await nextFrame();
    const activeBtn = el.shadowRoot!.querySelector('[data-step-id="one"]');
    expect(activeBtn, 'first step indicator exists').to.not.equal(null);
    // No crash, and the unknown id did not produce an active ghost step
    expect(el.shadowRoot!.querySelector('[data-step-id="ghost"]')).to.equal(null);
  });

  it('indicator click dispatches ty-wizard-step-change but never navigates (dumb contract)', async () => {
    const el = (await fixture(html`
      <ty-wizard active="one">
        <ty-step id="one" label="One">1</ty-step>
        <ty-step id="two" label="Two">2</ty-step>
      </ty-wizard>
    `)) as HTMLElement;
    await nextFrame();

    let detail: any = null;
    el.addEventListener('ty-wizard-step-change', (e) => { detail = (e as CustomEvent).detail; });

    const btn = el.shadowRoot!.querySelector('[data-step-id="two"]') as HTMLElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await tick();

    expect(detail, 'event fired').to.not.equal(null);
    expect(detail.activeId).to.equal('two');
    expect(detail.direction).to.equal('forward');
    // The component must NOT have navigated by itself
    expect(el.getAttribute('active'), 'navigation is the consumer’s job').to.equal('one');
  });

  it('a ty-step appended after connect appears in the indicator strip', async () => {
    // A childList MutationObserver re-renders the strip when framework-driven
    // dynamic steps/tabs arrive after connect.
    const el = (await fixture(html`
      <ty-wizard active="one">
        <ty-step id="one" label="One">1</ty-step>
      </ty-wizard>
    `)) as HTMLElement;
    await nextFrame();

    const step = document.createElement('ty-step');
    step.id = 'late';
    step.setAttribute('label', 'Late');
    el.appendChild(step);
    await nextFrame();
    await tick(50);

    expect(
      el.shadowRoot!.querySelector('[data-step-id="late"]'),
      'late step should get an indicator',
    ).to.not.equal(null);
  });
});

// ---------------------------------------------------------------------------
// ty-tabs
// ---------------------------------------------------------------------------
describe('ty-tabs edge cases', () => {
  it('tab button click navigates and fires ty-tab-change', async () => {
    const el = (await fixture(html`
      <ty-tabs active="a" height="120px">
        <ty-tab id="a" label="A">aaa</ty-tab>
        <ty-tab id="b" label="B">bbb</ty-tab>
      </ty-tabs>
    `)) as HTMLElement;
    await nextFrame();

    let detail: any = null;
    el.addEventListener('ty-tab-change', (e) => { detail = (e as CustomEvent).detail; });

    const btn = el.shadowRoot!.querySelector('[data-tab-id="b"]') as HTMLElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await tick();

    expect(el.getAttribute('active'), 'tabs DO navigate (unlike wizard)').to.equal('b');
    expect(detail?.activeId).to.equal('b');
    expect(detail?.previousId).to.equal('a');
  });

  it('setting active to an unknown tab id does not crash and keeps a sane state', async () => {
    const el = (await fixture(html`
      <ty-tabs active="a" height="120px">
        <ty-tab id="a" label="A">aaa</ty-tab>
        <ty-tab id="b" label="B">bbb</ty-tab>
      </ty-tabs>
    `)) as HTMLElement;
    await nextFrame();

    el.setAttribute('active', 'ghost');
    await nextFrame();
    // Component survives; buttons still present and clickable
    expect(el.shadowRoot!.querySelectorAll('[data-tab-id]').length).to.equal(2);
    const btn = el.shadowRoot!.querySelector('[data-tab-id="a"]') as HTMLElement;
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await tick();
    expect(el.getAttribute('active')).to.equal('a');
  });

  it('a ty-tab appended after connect appears in the button strip', async () => {
    const el = (await fixture(html`
      <ty-tabs active="a" height="120px">
        <ty-tab id="a" label="A">aaa</ty-tab>
      </ty-tabs>
    `)) as HTMLElement;
    await nextFrame();

    const tab = document.createElement('ty-tab');
    tab.id = 'late';
    tab.setAttribute('label', 'Late');
    tab.textContent = 'late content';
    el.appendChild(tab);
    await nextFrame();
    await tick(50);

    expect(
      el.shadowRoot!.querySelector('[data-tab-id="late"]'),
      'late tab should get a button',
    ).to.not.equal(null);
  });
});

// ---------------------------------------------------------------------------
// ty-option value resolution
// ---------------------------------------------------------------------------
describe('ty-option value resolution contract', () => {
  it('resolves value as property > attribute > trimmed textContent', async () => {
    const attrOpt = (await fixture(html`<ty-option value="attr">  Text  </ty-option>`)) as any;
    expect(attrOpt.value).to.equal('attr');

    const textOpt = (await fixture(html`<ty-option>  Just Text  </ty-option>`)) as any;
    expect(textOpt.value).to.equal('Just Text');

    attrOpt.value = 'prop';
    expect(attrOpt.value, 'property wins over attribute').to.equal('prop');
  });
});

// ---------------------------------------------------------------------------
// ty-resize-observer registry
// ---------------------------------------------------------------------------
describe('ty-resize-observer registry', () => {
  it('registers its size under its id and unregisters on disconnect', async () => {
    const el = (await fixture(html`
      <ty-resize-observer id="probe" style="display:block;width:120px;height:40px"></ty-resize-observer>
    `)) as HTMLElement;
    await tick(50); // ResizeObserver delivers async

    const size = getSize('probe');
    expect(size, 'size registered').to.not.equal(undefined);
    expect(Math.round(size!.width)).to.equal(120);

    el.remove();
    await tick(20);
    expect(getSize('probe'), 'entry removed on disconnect').to.equal(undefined);
  });

  it('renaming id migrates the registry entry instead of leaking the old one', async () => {
    // attributeChangedCallback migrates the registry entry on id rename —
    // old key removed, current size registered under the new key.
    const el = (await fixture(html`
      <ty-resize-observer id="old-name" style="display:block;width:80px;height:20px"></ty-resize-observer>
    `)) as HTMLElement;
    await tick(50);
    expect(getSize('old-name')).to.not.equal(undefined);

    el.id = 'new-name';
    // force a resize so the observer fires under the new id
    el.style.width = '90px';
    await tick(50);

    expect(getSize('old-name'), 'old key must not leak').to.equal(undefined);
    expect(getSize('new-name'), 'new key registered').to.not.equal(undefined);

    el.remove();
  });
});
