import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import '../lib/components/textarea.js';
import '../lib/components/input.js';

// Covers the composer restructure: bordered wrapper, borderless textarea inside
// a scoped scroll region, header/footer slot regions that collapse when empty.

describe('ty-textarea — composer structure', () => {
  it('renders wrapper > scroll(textarea) with header/footer slot regions', async () => {
    const el = (await fixture(html`<ty-textarea></ty-textarea>`)) as any;
    await nextFrame();
    const sr = el.shadowRoot;
    const wrap = sr.querySelector('.textarea-wrapper');
    const scroll = sr.querySelector('.textarea-scroll');
    const ta = sr.querySelector('textarea');
    expect(wrap, 'wrapper').to.exist;
    expect(scroll, 'scroll region').to.exist;
    expect(ta, 'textarea').to.exist;
    // textarea lives inside the scroll region (so the scrollbar can't overlap slots)
    expect(scroll.contains(ta)).to.equal(true);
    expect(sr.querySelector('.textarea-header slot[name="header"]')).to.exist;
    expect(sr.querySelector('.textarea-footer slot[name="footer"]')).to.exist;
  });

  it('footer with content gets .has-content; empty header does not', async () => {
    const el = (await fixture(html`
      <ty-textarea><button slot="footer">Send</button></ty-textarea>
    `)) as any;
    await nextFrame();
    await nextFrame(); // slotchange settles
    const footer = el.shadowRoot.querySelector('.textarea-footer');
    const header = el.shadowRoot.querySelector('.textarea-header');
    expect(footer.classList.contains('has-content'), 'footer has-content').to.equal(true);
    expect(header.classList.contains('has-content'), 'empty header collapsed').to.equal(false);
  });
});

describe('ty-textarea — events', () => {
  it('re-dispatches input with detail.value', async () => {
    const el = (await fixture(html`<ty-textarea></ty-textarea>`)) as any;
    await nextFrame();
    const ta = el.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    const ev = oneEvent(el, 'input');
    ta.value = 'hello';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const e = (await ev) as CustomEvent;
    expect(e.detail.value).to.equal('hello');
  });

  it('typing: one input event per keystroke, ours with detail.value (like ty-input)', async () => {
    const el = (await fixture(html`<ty-textarea></ty-textarea>`)) as any;
    const seen: string[] = [];
    const log = (e: Event) =>
      seen.push(e instanceof CustomEvent ? `${e.type} ${e.detail.value}` : `native ${e.type}`);
    el.addEventListener('input', log);
    el.addEventListener('change', log);
    el.focus();
    await sendKeys({ type: 'ab' });
    await nextFrame();
    expect(seen).to.deep.equal(['input a', 'input ab']);

    // Fired as the value changes, not a task later
    const inner = el.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    inner.value = 'abc';
    inner.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    expect(seen[seen.length - 1]).to.equal('input abc');
    inner.blur();
    expect(seen[seen.length - 1]).to.equal('change abc');
  });
});

// A keyed reorder (React), a morph (idiomorph) or appendChild / insertBefore
// disconnects the element and connects it again.
describe('ty-textarea — moved in the DOM', () => {
  it('still types, validates, submits and fires its events', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <div id="from"><ty-textarea name="t1" required></ty-textarea><ty-textarea name="t2" required></ty-textarea></div>
        <div id="to"><span></span></div>
        <input id="other">
      </form>`);
    const [t1, t2] = Array.from(form.querySelectorAll('ty-textarea')) as any[];
    const to = form.querySelector('#to')!;
    to.appendChild(t1);
    to.insertBefore(t2, to.firstChild);
    const seen: string[] = [];
    for (const el of [t1, t2]) {
      for (const type of ['input', 'change']) {
        el.addEventListener(type, (e: CustomEvent) => seen.push(`${el.name} ${type} ${e.detail?.value}`));
      }
    }
    t1.focus();
    await sendKeys({ type: 'hi' });
    t2.focus();
    await sendKeys({ type: 'yo' });
    (form.querySelector('#other') as HTMLInputElement).focus();
    await nextFrame();
    expect(seen).to.deep.equal([
      't1 input h', 't1 input hi', 't1 change hi',
      't2 input y', 't2 input yo', 't2 change yo',
    ]);
    expect([t1.value, t2.value]).to.deep.equal(['hi', 'yo']);
    expect(form.checkValidity()).to.equal(true);
    expect([...new FormData(form)].map(([k, v]) => `${k}=${v}`).join('&')).to.equal('t2=yo&t1=hi');
    expect(t1.shadowRoot.querySelector('textarea').value, 'typed text stays').to.equal('hi');
  });

  it('changes made while detached show once put back', async () => {
    const wrap = await fixture(html`<div><ty-textarea></ty-textarea></div>`);
    const el = wrap.querySelector('ty-textarea') as any;
    el.remove();
    el.value = 'set while out';
    el.error = 'Bad';
    wrap.append(el);
    await nextFrame();
    expect(el.shadowRoot.querySelector('textarea').value).to.equal('set while out');
    expect(el.shadowRoot.querySelector('.error-message')?.textContent).to.equal('Bad');
  });

  // The disconnect takes the custom scrollbar down; back in, the textarea is
  // already at max-height, and only a height change used to set it up again.
  it('at max-height, its custom scrollbar comes back', async () => {
    const wrap = await fixture(html`<div><div id="a"><ty-textarea max-height="80px"></ty-textarea></div><div id="b"></div></div>`);
    const el = wrap.querySelector('ty-textarea') as any;
    const inner = el.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    const scrollbar = () => [el.hasAttribute('data-custom-scroll'), inner.style.scrollbarWidth];
    el.focus();
    await sendKeys({ type: '1\n2\n3\n4\n5\n6\n7\n8' });
    await new Promise((r) => setTimeout(r, 50));
    expect(scrollbar(), 'typed past max-height').to.deep.equal([true, 'none']);

    wrap.querySelector('#b')!.append(el);
    await new Promise((r) => setTimeout(r, 50));
    expect(scrollbar(), 'moved').to.deep.equal([true, 'none']);
  });
});

describe('ty-textarea — form value', () => {
  it('an empty field still submits name=, like a native textarea', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-textarea name="t"></ty-textarea><textarea name="nat"></textarea><ty-textarea name="off" disabled></ty-textarea></form>`);
    await nextFrame();
    const data = () => [...new FormData(form)].map(([k, v]) => `${k}=${v}`).join('&');
    expect(data(), 'untouched').to.equal('t=&nat=');
    const el = form.querySelector('ty-textarea') as any;
    el.value = 'abc';
    expect(data()).to.equal('t=abc&nat=');
    el.value = '';
    expect(data(), 'emptied in code').to.equal('t=&nat=');
  });
});

describe('ty-textarea — validation', () => {
  it('required + empty blocks the form; filled unblocks', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-textarea name="m" required></ty-textarea></form>
    `));
    const ta = form.querySelector('ty-textarea') as any;
    await nextFrame();
    expect(form.checkValidity()).to.equal(false);

    ta.value = 'hi';
    await nextFrame();
    expect(form.checkValidity()).to.equal(true);
  });
});

describe('ty-textarea — message on blur after an edit', () => {
  it('required, typed then emptied: blur shows the message', async () => {
    const el = (await fixture(html`<ty-textarea required></ty-textarea>`)) as any;
    const inner = el.shadowRoot.querySelector('textarea');
    inner.focus();
    inner.blur();
    await nextFrame();
    expect(el.hasAttribute('error'), 'tabbing through shows nothing').to.equal(false);
    inner.focus();
    inner.value = 'x';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.value = '';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.not.equal(null);
  });
});

describe('ty-textarea — minlength / maxlength (like ty-input)', () => {
  const check = async (el: any, value: string) => {
    el.value = value;
    await nextFrame();
    return el.validity as ValidityState;
  };

  it('flags, properties and the inner textarea\'s attributes', async () => {
    const el = (await fixture(html`<ty-textarea minlength="3" maxlength="5"></ty-textarea>`)) as any;
    expect(el.minLength).to.equal(3);
    expect(el.maxLength).to.equal(5);
    expect((await check(el, 'ab')).tooShort).to.equal(true);
    expect(el.validationMessage).to.contain('3');
    expect((await check(el, 'abcd')).valid).to.equal(true);
    expect((await check(el, 'abcdefg')).tooLong).to.equal(true);
    const inner = el.shadowRoot.querySelector('textarea');
    expect(inner.getAttribute('maxlength'), 'typing stops at the limit').to.equal('5');
    expect(inner.getAttribute('minlength')).to.equal('3');

    el.minLength = 2;
    el.maxLength = -1;
    await nextFrame();
    expect(el.getAttribute('minlength')).to.equal('2');
    expect(inner.hasAttribute('maxlength'), 'negative removes the rule').to.equal(false);
    expect(el.maxLength).to.equal(-1);
    expect(el.validity.valid).to.equal(true);
  });

  it('empty value only fails required', async () => {
    const el = (await fixture(html`<ty-textarea minlength="3"></ty-textarea>`)) as any;
    await nextFrame();
    expect(el.validity.valid).to.equal(true);
    el.required = true;
    await nextFrame();
    expect(el.validity.valueMissing).to.equal(true);
  });

  it('too-short-message / too-long-message set the wording', async () => {
    const el = (await fixture(html`
      <ty-textarea minlength="3" maxlength="5"
        too-short-message="Min {minlength}, got {length}"
        too-long-message="Max {maxlength}"></ty-textarea>`)) as any;
    await check(el, 'ab');
    expect(el.validationMessage).to.equal('Min 3, got 2');
    await check(el, 'abcdefg');
    expect(el.validationMessage).to.equal('Max 5');
    el.tooShortMessage = '';
    el.tooLongMessage = 'Too long: {length}';
    expect(el.getAttribute('too-long-message')).to.equal('Too long: {length}');
    await check(el, 'abcdefgh');
    expect(el.validationMessage).to.equal('Too long: 8');
    await check(el, 'ab');
    expect(el.validationMessage, 'default wording').to.contain('3');
  });

  it('once the user typed, the too-short message is the browser\'s own', async () => {
    const wrap = await fixture(html`
      <div><ty-textarea minlength="3"></ty-textarea><textarea minlength="3"></textarea></div>`);
    const el = wrap.querySelector('ty-textarea') as any;
    const native = wrap.querySelector('textarea')!;
    el.focus();
    await sendKeys({ type: 'ab' });
    // Moving on blurs the field: its error line shows and it re-renders,
    // which must not turn the typed value into a "set in code" one.
    native.focus();
    await sendKeys({ type: 'ab' });
    await nextFrame();
    expect(native.validity.tooShort).to.equal(true);
    expect(el.validity.tooShort).to.equal(true);
    expect(el.validationMessage).to.equal(native.validationMessage);
    expect(el.getAttribute('error')).to.equal(native.validationMessage);
  });

  it('typing stops at maxlength', async () => {
    const el = (await fixture(html`<ty-textarea maxlength="3"></ty-textarea>`)) as any;
    el.focus();
    await sendKeys({ type: 'abcdef' });
    await nextFrame();
    expect(el.value).to.equal('abc');
    expect(el.validity.valid).to.equal(true);
  });

  it('blocks the form until long enough', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-textarea name="m" minlength="4"></ty-textarea></form>`);
    const el = form.querySelector('ty-textarea') as any;
    await check(el, 'abc');
    expect(form.checkValidity()).to.equal(false);
    await check(el, 'abcd');
    expect(form.checkValidity()).to.equal(true);
  });
});

describe('ty-textarea — required marker', () => {
  it('is ty-input\'s asterisk, same size, color and spacing', async () => {
    const wrap = await fixture(html`
      <div>
        <ty-input label="Name" required></ty-input>
        <ty-textarea label="Bio" required></ty-textarea>
      </div>`);
    await nextFrame();
    const input = wrap.querySelector('ty-input') as any;
    const ta = wrap.querySelector('ty-textarea') as any;
    const iIcon = input.shadowRoot.querySelector('.ty-field-label .required-icon') as HTMLElement;
    const tIcon = ta.shadowRoot.querySelector('.ty-field-label .required-icon') as HTMLElement;
    expect(tIcon, 'marker').to.exist;
    expect(tIcon.innerHTML).to.equal(iIcon.innerHTML);
    const props = ['width', 'height', 'color', 'margin-left', 'display', 'align-items'];
    for (const p of props) {
      expect(getComputedStyle(tIcon).getPropertyValue(p), p).to.equal(getComputedStyle(iIcon).getPropertyValue(p));
    }
    const iSvg = iIcon.querySelector('svg')!.getBoundingClientRect();
    const tSvg = tIcon.querySelector('svg')!.getBoundingClientRect();
    expect([tSvg.width, tSvg.height]).to.deep.equal([iSvg.width, iSvg.height]);
    const iLabel = input.shadowRoot.querySelector('.ty-field-label') as HTMLElement;
    const tLabel = ta.shadowRoot.querySelector('.ty-field-label') as HTMLElement;
    expect(getComputedStyle(tLabel).display).to.equal(getComputedStyle(iLabel).display);
    // Marker sits right after the text, vertically centred like ty-input's
    const gap = (label: HTMLElement, icon: HTMLElement) => {
      const range = document.createRange();
      range.selectNodeContents(label.firstChild!);
      return Math.round(icon.getBoundingClientRect().left - range.getBoundingClientRect().right);
    };
    expect(gap(tLabel, tIcon)).to.equal(gap(iLabel, iIcon));
  });

  it('follows required', async () => {
    const el = (await fixture(html`<ty-textarea label="Bio"></ty-textarea>`)) as any;
    expect(el.shadowRoot.querySelector('.required-icon')).to.equal(null);
    el.required = true;
    await nextFrame();
    expect(el.shadowRoot.querySelector('.required-icon')).to.exist;
  });
});

describe('ty-textarea — form.reset()', () => {
  it('clears the shown message and the edited state', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-textarea name="m" minlength="5"></ty-textarea><button>Send</button></form>`);
    await nextFrame();
    const el = form.querySelector('ty-textarea') as any;
    const inner = el.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    inner.focus();
    inner.value = 'ab';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.contain('5');

    form.reset();
    await nextFrame();
    expect(el.hasAttribute('error')).to.equal(false);
    expect(el.value).to.equal('');
    expect(inner.value).to.equal('');
    inner.focus();
    inner.blur();
    await nextFrame();
    expect(el.hasAttribute('error'), 'untouched blur shows nothing').to.equal(false);
  });
});
