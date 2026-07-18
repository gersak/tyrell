import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/input.js';

// Template spec — regression coverage for the two input bugs fixed this cycle:
//   1. `required` was cosmetic (no ElementInternals.setValidity)
//   2. error → flavor:danger was one-way (didn't clear when error cleared)

describe('ty-input — constraint validation', () => {
  it('required + empty blocks the owning form, valid once filled', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="x" required></ty-input></form>
    `);
    const input = form.querySelector('ty-input') as any;
    await nextFrame();

    // empty + required → form invalid
    expect(form.checkValidity()).to.equal(false);
    expect(input.matches(':invalid')).to.equal(true);

    // fill it → valid
    input.value = 'hello';
    await nextFrame();
    expect(form.checkValidity()).to.equal(true);
    expect(input.matches(':invalid')).to.equal(false);
  });

  it('non-required input is always valid', async () => {
    const input = (await fixture(html`<ty-input></ty-input>`)) as any;
    await nextFrame();
    expect(input.matches(':invalid')).to.equal(false);
  });

  it('disabled required input does not block validation', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-input name="x" required disabled></ty-input></form>
    `);
    await nextFrame();
    expect(form.checkValidity()).to.equal(true);
  });
});

describe('ty-input — error ↔ flavor', () => {
  it('setting error flips flavor to danger; clearing restores neutral', async () => {
    const input = (await fixture(html`<ty-input></ty-input>`)) as any;
    await nextFrame();
    expect(input.flavor).to.equal('neutral');

    input.error = 'Taken';
    await nextFrame();
    expect(input.flavor).to.equal('danger');

    input.error = '';
    await nextFrame();
    expect(input.flavor).to.equal('neutral');
  });

  it('does not clobber a consumer-set flavor', async () => {
    const input = (await fixture(html`<ty-input flavor="primary"></ty-input>`)) as any;
    await nextFrame();
    input.error = 'Oops';
    await nextFrame();
    // we never auto-set danger over an explicit flavor, so clearing leaves it
    input.error = '';
    await nextFrame();
    expect(input.flavor).to.equal('primary');
  });
});

describe('ty-input — numeric shadow value', () => {
  it('input detail carries the parsed numeric value + raw input', async () => {
    const el = (await fixture(html`<ty-input type="number"></ty-input>`)) as any;
    await nextFrame();
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    const ev = oneEvent(el, 'input');
    inner.value = '1234.56';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    const e = (await ev) as CustomEvent;
    expect(e.detail.value).to.equal(1234.56);   // unformatted shadow number
    expect(e.detail.rawValue).to.equal('1234.56');
  });
});

describe('ty-input — password reveal toggle', () => {
  it('renders for type=password and toggles the native input type', async () => {
    const el = (await fixture(html`<ty-input type="password" value="s3cret"></ty-input>`)) as any;
    await nextFrame();
    const toggle = el.shadowRoot.querySelector('.password-toggle') as HTMLButtonElement;
    const input = el.shadowRoot.querySelector('input') as HTMLInputElement;
    expect(toggle, 'toggle exists for password').to.exist;
    expect(input.type).to.equal('password');

    toggle.click();
    expect(input.type, 'revealed').to.equal('text');
    expect(toggle.getAttribute('aria-pressed')).to.equal('true');

    toggle.click();
    expect(input.type, 'hidden again').to.equal('password');
    expect(el.type, 'component type property unchanged').to.equal('password');
  });

  it('does not render for other types', async () => {
    const el = (await fixture(html`<ty-input type="text"></ty-input>`)) as any;
    await nextFrame();
    expect(el.shadowRoot.querySelector('.password-toggle')).to.be.null;
  });
});

describe('ty-input custom flavors', () => {
  const BRAND = 'rgb(1, 2, 3)';

  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-brand');
  });

  const borderColor = (el: any) =>
    getComputedStyle(el.shadowRoot.querySelector('.input-wrapper')).borderTopColor;

  it('derives the wrapper border from a custom flavor token', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const el = (await fixture(html`<ty-input flavor="brand"></ty-input>`)) as any;
    await nextFrame();
    expect(borderColor(el)).to.equal(BRAND);
  });

  it('page-level --input-accent rules override a custom flavor (escape hatch)', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const wrap = await fixture(html`
      <div>
        <style>ty-input[flavor="brand"] { --input-accent: rgb(9, 9, 9); }</style>
        <ty-input flavor="brand"></ty-input>
      </div>
    `);
    await nextFrame();
    const el = wrap.querySelector('ty-input') as any;
    expect(borderColor(el)).to.equal('rgb(9, 9, 9)');
  });
});

describe('ty-input password toggle focus outline follows flavor', () => {
  it('outlines in the flavor color, not a fixed primary', async () => {
    document.documentElement.style.setProperty('--ty-color-danger', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    const el = (await fixture(html`<ty-input type="password" flavor="danger"></ty-input>`)) as any;
    await nextFrame();
    const toggle = el.shadowRoot.querySelector('.password-toggle') as HTMLButtonElement;
    toggle.focus();
    const outline = getComputedStyle(toggle).outlineColor;
    expect(outline, 'outline uses the danger flavor, not primary').to.equal('rgb(7, 8, 9)');
    document.documentElement.style.removeProperty('--ty-color-danger');
    document.documentElement.style.removeProperty('--ty-color-primary');
  });
});

describe('ty-input flavored emphasis ladder', () => {
  it('rests on the -soft shade and escalates to the base color on focus', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-success-soft', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-input flavor="success"></ty-input>`)) as any;
    await nextFrame();
    const wrap = el.shadowRoot.querySelector('.input-wrapper') as HTMLElement;
    wrap.style.setProperty('transition', 'none', 'important');

    expect(getComputedStyle(wrap).borderTopColor, 'resting border is soft').to.equal('rgb(4, 5, 6)');

    el.shadowRoot.querySelector('input').focus();
    await nextFrame();
    expect(getComputedStyle(wrap).borderTopColor, 'focused border is the full color').to.equal('rgb(7, 8, 9)');

    document.documentElement.style.removeProperty('--ty-color-success');
    document.documentElement.style.removeProperty('--ty-color-success-soft');
  });
});

describe('ty-input custom flavor emphasis ladder', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-brand');
    document.documentElement.style.removeProperty('--ty-color-brand-soft');
  });

  it('with a -soft token defined, custom flavors get the same rest→focus ladder', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-brand-soft', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-input flavor="brand"></ty-input>`)) as any;
    await nextFrame();
    const wrap = el.shadowRoot.querySelector('.input-wrapper') as HTMLElement;
    wrap.style.setProperty('transition', 'none', 'important');
    expect(getComputedStyle(wrap).borderTopColor, 'rest is soft').to.equal('rgb(4, 5, 6)');
    el.shadowRoot.querySelector('input').focus();
    await nextFrame();
    expect(getComputedStyle(wrap).borderTopColor, 'focus is full color').to.equal('rgb(7, 8, 9)');
  });

  it('with only the base token, rest degrades to the full color (flat, but visible)', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', 'rgb(7, 8, 9)');
    const el = (await fixture(html`<ty-input flavor="brand"></ty-input>`)) as any;
    await nextFrame();
    const wrap = el.shadowRoot.querySelector('.input-wrapper') as HTMLElement;
    expect(getComputedStyle(wrap).borderTopColor).to.equal('rgb(7, 8, 9)');
  });
});
