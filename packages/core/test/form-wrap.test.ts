import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/input.js';
import '../lib/components/checkbox.js';
import '../lib/components/button.js';

// Ty wraps requestSubmit / reportValidity only on a form holding a Ty field
// with an error line (own properties on that form), and takes the wrappers
// off once the last such field leaves. The prototype is never patched.

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const own = (form: HTMLFormElement, name: string) => Object.prototype.hasOwnProperty.call(form, name);
const wrapped = (form: HTMLFormElement) => own(form, 'requestSubmit') && own(form, 'reportValidity');
const unwrapped = (form: HTMLFormElement) => !own(form, 'requestSubmit') && !own(form, 'reportValidity');
const isNative = (fn: unknown) => typeof fn === 'function' && Function.prototype.toString.call(fn).includes('[native code]');
/** Focus is inside `host` (through its shadow root). Booleans only: a failing
 *  expect(el).to.equal(<element>) hangs the runner. */
const focusIn = (host: Element) => document.activeElement === host || host.contains(document.activeElement);

const settle = async () => { await nextFrame(); await tick(20); };

describe('form wrapping — only forms with Ty fields', () => {
  it('the HTMLFormElement prototype keeps its native methods', async () => {
    // Ty sets up its document listeners with the first field.
    await fixture(html`<form><ty-input name="a" required></ty-input></form>`);
    await settle();
    expect(isNative(HTMLFormElement.prototype.requestSubmit), 'requestSubmit').to.equal(true);
    expect(isNative(HTMLFormElement.prototype.reportValidity), 'reportValidity').to.equal(true);
  });

  it('a form without Ty fields gets no own requestSubmit / reportValidity', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <input name="n" required>
      <ty-checkbox name="c" required>C</ty-checkbox>
      <ty-button type="submit">Go</ty-button>
    </form>`);
    await settle();
    expect(unwrapped(form)).to.equal(true);
  });

  it('a form with a Ty field gets them; removing the last one restores', async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-input name="a" required></ty-input>
      <ty-input name="b" required></ty-input>
    </form>`);
    await settle();
    expect(wrapped(form), 'wrapped').to.equal(true);
    const [a, b] = Array.from(form.querySelectorAll('ty-input'));
    a.remove();
    expect(wrapped(form), 'one Ty field left').to.equal(true);
    b.remove();
    expect(unwrapped(form), 'restored').to.equal(true);
    form.append(b);
    expect(wrapped(form), 'wrapped again').to.equal(true);
  });

  it('moving the Ty field to another form moves the wrappers; two forms are independent', async () => {
    const root = await fixture<HTMLDivElement>(html`<div>
      <form id="fa"><ty-input name="a" required></ty-input></form>
      <form id="fb"><input name="n"></form>
    </div>`);
    await settle();
    const fa = root.querySelector<HTMLFormElement>('#fa')!;
    const fb = root.querySelector<HTMLFormElement>('#fb')!;
    expect(wrapped(fa), 'a wrapped').to.equal(true);
    expect(unwrapped(fb), 'b untouched').to.equal(true);
    fb.append(fa.querySelector('ty-input')!);
    expect(unwrapped(fa), 'a restored').to.equal(true);
    expect(wrapped(fb), 'b wrapped').to.equal(true);
  });

  it('the form attribute counts: associating elsewhere moves the wrappers', async () => {
    const root = await fixture<HTMLDivElement>(html`<div>
      <form id="fa"><ty-input name="a" required></ty-input></form>
      <form id="fb2"></form>
    </div>`);
    await settle();
    const fa = root.querySelector<HTMLFormElement>('#fa')!;
    const fb = root.querySelector<HTMLFormElement>('#fb2')!;
    root.querySelector('ty-input')!.setAttribute('form', 'fb2');
    await tick();
    expect(unwrapped(fa), 'a restored').to.equal(true);
    expect(wrapped(fb), 'b wrapped').to.equal(true);
  });
});

describe('form wrapping — focus behavior', () => {
  const form2 = async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <ty-input name="a" value="ok" required></ty-input>
      <ty-input name="b" required></ty-input>
      <ty-input name="c" required></ty-input>
      <ty-button type="submit">Go</ty-button>
    </form>`);
    await settle();
    return form;
  };

  for (const method of ['requestSubmit', 'reportValidity'] as const) {
    it(`form.${method}() from code focuses the first failing Ty field`, async () => {
      const form = await form2();
      form[method]();
      expect(focusIn(form.querySelectorAll('ty-input')[1])).to.equal(true);
    });
  }

  it('checkValidity() moves no focus', async () => {
    const form = await form2();
    form.checkValidity();
    expect(focusIn(form.querySelectorAll('ty-input')[1])).to.equal(false);
  });

  it('ty-button submit focuses the first failing Ty field', async () => {
    const form = await form2();
    (form.querySelector('ty-button')!.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    expect(focusIn(form.querySelectorAll('ty-input')[1])).to.equal(true);
  });

  it('ty-button submit focuses it even when a replaced requestSubmit skips ours', async () => {
    const form = await form2();
    (form as any).requestSubmit = function (this: HTMLFormElement, s?: HTMLElement) {
      return HTMLFormElement.prototype.requestSubmit.call(this, s);
    };
    (form.querySelector('ty-button')!.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    expect(focusIn(form.querySelectorAll('ty-input')[1])).to.equal(true);
  });
});

describe('form wrapping — third-party wrappers', () => {
  it('an own wrapper set before is called through and put back on restore', async () => {
    const form = document.createElement('form');
    let calls = 0;
    const theirs = function (this: HTMLFormElement) { calls++; return HTMLFormElement.prototype.reportValidity.call(this); };
    (form as any).reportValidity = theirs;
    const field = document.createElement('ty-input');
    field.setAttribute('required', '');
    field.setAttribute('name', 'a');
    form.append(field);
    const host = await fixture<HTMLDivElement>(html`<div></div>`);
    host.append(form);
    await settle();
    expect(form.reportValidity === theirs, 'ours on top').to.equal(false);
    form.reportValidity();
    expect(calls, 'theirs ran').to.equal(1);
    expect(focusIn(field), 'and focus moved').to.equal(true);
    field.remove();
    expect(form.reportValidity === theirs, 'theirs back').to.equal(true);
    expect(own(form, 'requestSubmit'), 'requestSubmit restored').to.equal(false);
  });

  it('an own wrapper set after ours stays on restore and keeps working', async () => {
    const form = await fixture<HTMLFormElement>(html`<form><ty-input name="a" required></ty-input></form>`);
    await settle();
    const ours = form.reportValidity;
    let calls = 0;
    const theirs = function (this: HTMLFormElement) { calls++; return ours.call(this); };
    (form as any).reportValidity = theirs;
    form.querySelector('ty-input')!.remove();
    expect(form.reportValidity === theirs, 'theirs kept').to.equal(true);
    expect(own(form, 'requestSubmit'), 'requestSubmit restored').to.equal(false);
    expect(form.reportValidity(), 'still works').to.equal(true);
    expect(calls).to.equal(1);
  });

  it('a prototype patch made after the form was wrapped still runs', async () => {
    const form = await fixture<HTMLFormElement>(html`<form><ty-input name="a" required></ty-input></form>`);
    await settle();
    const proto = HTMLFormElement.prototype;
    const original = proto.reportValidity;
    let calls = 0;
    proto.reportValidity = function (this: HTMLFormElement) { calls++; return original.call(this); };
    try {
      form.reportValidity();
    } finally {
      proto.reportValidity = original;
    }
    expect(calls).to.equal(1);
    expect(focusIn(form.querySelector('ty-input')!)).to.equal(true);
  });
});
