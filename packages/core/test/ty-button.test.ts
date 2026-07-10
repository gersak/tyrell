import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/button.js';
import '../lib/components/input.js';

// type=submit goes through form.requestSubmit(), which respects constraint
// validation — so this is also an end-to-end check of ty-input's setValidity.

const clickInner = (host: Element) =>
  (host.shadowRoot!.querySelector('button') as HTMLButtonElement).click();

describe('ty-button — form submission', () => {
  it('submits a valid form', async () => {
    const form = (await fixture(html`
      <form>
        <ty-input name="x" value="ok"></ty-input>
        <ty-button type="submit">Go</ty-button>
      </form>
    `)) as HTMLFormElement;
    await nextFrame();
    let submitted = false;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });

    clickInner(form.querySelector('ty-button')!);
    await nextFrame();
    expect(submitted).to.equal(true);
  });

  it('is blocked when a required field is empty', async () => {
    const form = (await fixture(html`
      <form>
        <ty-input name="x" required></ty-input>
        <ty-button type="submit">Go</ty-button>
      </form>
    `)) as HTMLFormElement;
    await nextFrame();
    let submitted = false;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });

    clickInner(form.querySelector('ty-button')!);
    await nextFrame();
    expect(submitted).to.equal(false); // requestSubmit respects validity
  });

  it('emits a click event', async () => {
    const el = await fixture(html`<ty-button>Hi</ty-button>`);
    let clicked = false;
    el.addEventListener('click', () => { clicked = true; });
    clickInner(el);
    await nextFrame();
    expect(clicked).to.equal(true);
  });
});
