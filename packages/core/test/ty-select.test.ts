import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../lib/components/select.js';
import '../lib/components/option.js';

const tick = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

describe('ty-select', () => {
  describe('single (default)', () => {
    it('picking an option sets scalar value, fires change, closes popup', async () => {
      const el = (await fixture(html`
        <ty-select name="robot">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();

      // Open, then pick
      (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
      await tick();

      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      const ev = (await oneEvent(el, 'change')) as CustomEvent;

      expect(ev.detail.value).to.equal('eywa'); // scalar in single mode
      expect(ev.detail.values).to.deep.equal(['eywa']);
      expect(el.value).to.equal('eywa');

      await tick();
      const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
      expect(dialog.open, 'popup closed after pick').to.be.false;
    });

    it('picking a second option replaces the first (no toggle accumulation)', async () => {
      const el = (await fixture(html`
        <ty-select name="robot" value="bobo">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();

      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      await oneEvent(el, 'change');

      expect(el.value).to.equal('eywa');
      expect(el.querySelector('ty-option[value="bobo]"]')?.hasAttribute('selected') ?? false).to.be.false;
    });

    it('submits a single FormData entry', async () => {
      const form = (await fixture(html`
        <form>
          <ty-select name="robot" value="bobo">
            <ty-option value="bobo">Bobo</ty-option>
          </ty-select>
        </form>
      `)) as HTMLFormElement;
      await tick();
      expect(new FormData(form).getAll('robot')).to.deep.equal(['bobo']);
    });

    it('projects the selected option into the stub as a clone (rich HTML intact)', async () => {
      const el = (await fixture(html`
        <ty-select value="bobo" placeholder="Pick one">
          <ty-option value="bobo"><b>Bobo</b> Robot <span class="price">$50</span></ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();

      // Clone in light DOM, slotted into the stub, marked + tick-stripped
      const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone, 'display clone exists').to.exist;
      expect(clone.getAttribute('value')).to.equal('bobo');
      expect(clone.hasAttribute('selected')).to.be.false;
      expect(clone.querySelector('.price')?.textContent, 'rich HTML survives').to.equal('$50');

      // Clone never counts as an option (would break counts/search/values)
      expect(el.value).to.equal('bobo');

      // Text placeholder is hidden while the clone displays
      const text = el.shadowRoot.querySelector('.dropdown-placeholder') as HTMLElement;
      expect(text.hidden).to.be.true;

      // Re-selection swaps the clone
      el.value = 'eywa';
      await tick();
      const clone2 = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone2.getAttribute('value')).to.equal('eywa');
      expect(el.querySelectorAll('[cloned]').length).to.equal(1);
    });
  });

  describe('multiple', () => {
    it('toggles options, array detail, repeated FormData entries', async () => {
      const form = (await fixture(html`
        <form>
          <ty-select multiple name="robots" value="bobo">
            <ty-option value="bobo">Bobo</ty-option>
            <ty-option value="eywa">EYWA</ty-option>
          </ty-select>
        </form>
      `)) as HTMLFormElement;
      const el = form.querySelector('ty-select') as any;
      await tick();

      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      const ev = (await oneEvent(el, 'change')) as CustomEvent;

      expect(ev.detail.value).to.deep.equal(['bobo', 'eywa']); // array in multiple mode
      expect(new FormData(form).getAll('robots')).to.deep.equal(['bobo', 'eywa']);

      // Popup semantics: multiple keeps the dropdown open for more picks
      // (dropdown only opens via stub here, so just assert value toggling)
      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      const ev2 = (await oneEvent(el, 'change')) as CustomEvent;
      expect(ev2.detail.values).to.deep.equal(['bobo']);
    });
  });

  it('renders start and end slot content in the stub', async () => {
    const el = (await fixture(html`
      <ty-select>
        <span slot="start" id="s">S</span>
        <span slot="end" id="e">E</span>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const startSlot = el.shadowRoot.querySelector('slot[name="start"]') as HTMLSlotElement;
    const endSlot = el.shadowRoot.querySelector('slot[name="end"]') as HTMLSlotElement;
    expect(startSlot.assignedElements().map((n: Element) => n.id)).to.deep.equal(['s']);
    expect(endSlot.assignedElements().map((n: Element) => n.id)).to.deep.equal(['e']);
  });

  describe('external search — option swaps', () => {
    it('selected display survives a naive consumer swap that wipes ALL ty-option (incl. the clone)', async () => {
      const el = (await fixture(html`
        <ty-select value="bobo" external-search>
          <ty-option value="bobo">Bobo Robot</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      expect(el.querySelector('[cloned][slot="selected"]'), 'clone shown initially').to.exist;

      // The documented consumer pattern: replace ty-option children with
      // server results — a naive sweep also removes the display clone.
      el.querySelectorAll('ty-option').forEach((o: Element) => o.remove());
      const opt = document.createElement('ty-option');
      opt.setAttribute('value', 'xyz'); // results do NOT include the selection
      opt.textContent = 'Unrelated Result';
      el.appendChild(opt);
      await tick();

      const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone, 'clone restored after swap').to.exist;
      expect(clone.getAttribute('value')).to.equal('bobo');
      expect(clone.textContent).to.equal('Bobo Robot');

      const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
      expect(stub.classList.contains('has-selection'), 'still shows as selected').to.be.true;
    });

    it('rebuilds the clone from a re-added matching option', async () => {
      const el = (await fixture(html`
        <ty-select value="bobo" external-search>
          <ty-option value="bobo">Bobo Robot</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      el.querySelectorAll('ty-option').forEach((o: Element) => o.remove());
      const opt = document.createElement('ty-option');
      opt.setAttribute('value', 'bobo');
      opt.textContent = 'Bobo Robot (fresh)';
      el.appendChild(opt);
      await tick();
      const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone).to.exist;
      expect(clone.getAttribute('value')).to.equal('bobo');
    });
  });

  describe('compact skin', () => {
    it('stub gets .compact class; multiple+compact shows count badge, not labels', async () => {
      const el = (await fixture(html`
        <ty-select multiple compact value="bobo,eywa" placeholder="Robots">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
      expect(stub.classList.contains('compact')).to.be.true;

      const badge = stub.querySelector('.select-count') as HTMLElement;
      expect(badge.hidden).to.be.false;
      expect(badge.textContent).to.equal('2');

      const text = stub.querySelector('.dropdown-placeholder') as HTMLElement;
      expect(text.textContent).to.equal('Robots'); // placeholder, not labels
    });

    it('field skin (default) hides the badge and shows joined labels', async () => {
      const el = (await fixture(html`
        <ty-select multiple value="bobo,eywa">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
      expect(stub.classList.contains('compact')).to.be.false;
      expect((stub.querySelector('.select-count') as HTMLElement).hidden).to.be.true;
      expect((stub.querySelector('.dropdown-placeholder') as HTMLElement).textContent)
        .to.equal('Bobo, EYWA');
    });
  });
});

describe('ty-select flavor', () => {
  const BRAND = 'rgb(1, 2, 3)';

  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-success');
    document.documentElement.style.removeProperty('--ty-color-brand');
  });

  const borderColor = (el: any) =>
    getComputedStyle(el.shadowRoot.querySelector('.select-stub')).borderTopColor;

  it('colors the stub border from a built-in flavor', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-select flavor="success"></ty-select>`)) as any;
    await tick();
    expect(borderColor(el)).to.equal('rgb(4, 5, 6)');
  });

  it('derives the stub border from a custom flavor token', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const el = (await fixture(html`<ty-select flavor="brand"></ty-select>`)) as any;
    await tick();
    expect(borderColor(el)).to.equal(BRAND);
  });

  it('page-level --select-accent overrides a flavor (escape hatch)', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const wrap = await fixture(html`
      <div>
        <style>ty-select[flavor="brand"] { --select-accent: rgb(9, 9, 9); }</style>
        <ty-select flavor="brand"></ty-select>
      </div>
    `);
    await tick();
    const el = wrap.querySelector('ty-select') as any;
    expect(borderColor(el)).to.equal('rgb(9, 9, 9)');
  });
});

describe('ty-select open-state ring', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-success');
  });

  it('escalates border + adds a ring while the dropdown is open, matching the flavor', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(4, 5, 6)');
    const el = (await fixture(html`
      <ty-select flavor="success">
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const closedShadow = getComputedStyle(stub).boxShadow;
    expect(closedShadow, 'no ring while closed').to.equal('none');

    stub.click();
    await tick();

    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open, 'dropdown opened').to.be.true;

    const openShadow = getComputedStyle(stub).boxShadow;
    // color-mix() results serialize in the mix's color space (oklab here),
    // not the original rgb() string, so assert shape/alpha rather than an
    // exact color match: a real 3px ring at 15% alpha, not the closed 'none'.
    expect(openShadow, 'ring appears while open').to.not.equal('none');
    expect(openShadow, 'ring is a 3px spread').to.match(/0px 0px 0px 3px/);
    expect(openShadow, 'ring is at 15% alpha').to.match(/\/ 0\.15\)/);
  });
});

describe('ty-select count badge follows flavor', () => {
  it('colors the compact-mode count badge from the flavor, not a fixed primary', async () => {
    document.documentElement.style.setProperty('--ty-color-danger', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    const el = (await fixture(html`
      <ty-select multiple compact flavor="danger" value="bobo,eywa">
        <ty-option value="bobo">Bobo</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const badge = el.shadowRoot.querySelector('.select-count') as HTMLElement;
    const cs = getComputedStyle(badge);
    expect(cs.backgroundColor, 'badge bg does not use fixed primary').to.not.include('1, 2, 3');
    // badge text = --select-accent-bold = the flavor's base color (the
    // "active" step of the rest→hover/focus emphasis ladder)
    expect(cs.color, 'badge text uses the danger flavor').to.equal('rgb(7, 8, 9)');
    document.documentElement.style.removeProperty('--ty-color-danger');
    document.documentElement.style.removeProperty('--ty-color-primary');
  });
});

describe('ty-select loading spinner follows flavor', () => {
  it('colors the loading spinner from the flavor, not a fixed primary', async () => {
    document.documentElement.style.setProperty('--ty-color-danger', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    const el = (await fixture(html`<ty-select flavor="danger" loading></ty-select>`)) as any;
    await tick();
    const spinner = el.shadowRoot.querySelector('.dropdown-loading-spinner') as HTMLElement;
    expect(spinner, 'spinner rendered').to.exist;
    expect(getComputedStyle(spinner).color).to.equal('rgb(7, 8, 9)');
    document.documentElement.style.removeProperty('--ty-color-danger');
    document.documentElement.style.removeProperty('--ty-color-primary');
  });
});
