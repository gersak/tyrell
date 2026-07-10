import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/textarea.js';

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
