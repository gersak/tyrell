import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/modal.js';
import { lockScroll, unlockScroll, forceUnlockAll } from '../lib/utils/scroll-lock.js';

/**
 * The lock holds for a page that scrolls its own container, not just
 * <html>: wheel, touchmove and scroll keys that would scroll anything outside
 * the open dialog are cancelled while a lock is held, and only then.
 */

const wheel = (target: Element, deltaY = 100) => {
  const e = new WheelEvent('wheel', { deltaY, bubbles: true, composed: true, cancelable: true });
  target.dispatchEvent(e);
  return e.defaultPrevented;
};
const key = (target: Element, k: string) => {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true });
  target.dispatchEvent(e);
  return e.defaultPrevented;
};
const swipeUp = (target: Element) => {
  const touch = (y: number) => new Touch({ identifier: 1, target, clientX: 10, clientY: y });
  target.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(300)], bubbles: true, composed: true, cancelable: true }));
  const move = new TouchEvent('touchmove', { touches: [touch(200)], bubbles: true, composed: true, cancelable: true });
  target.dispatchEvent(move);
  return move.defaultPrevented;
};

const PAGE = html`
  <div id="scroller" style="height: 200px; overflow-y: auto;">
    <div style="height: 2000px;"><button id="behind">behind</button></div>
  </div>`;

describe('scroll-lock guard', () => {
  afterEach(() => forceUnlockAll());

  it('cancels wheel, touchmove and scroll keys on the page only while locked', async () => {
    const page = (await fixture(PAGE)) as HTMLElement;
    const behind = page.querySelector('#behind')!;
    expect([wheel(behind), swipeUp(behind), key(behind, 'End'), key(document.body, 'PageDown')], 'unlocked').to.deep.equal([false, false, false, false]);

    lockScroll('a');
    lockScroll('b');
    expect([wheel(behind), swipeUp(behind), key(behind, 'End'), key(document.body, 'PageDown'), key(document.body, ' ')], 'locked').to.deep.equal([true, true, true, true, true]);
    expect(key(document.body, 'Tab'), 'not a scroll key').to.equal(false);

    unlockScroll('a');
    expect(wheel(behind), 'another holder left').to.equal(true);
    unlockScroll('b');
    expect([wheel(behind), swipeUp(behind), key(behind, 'End')], 'released').to.deep.equal([false, false, false]);
  });

  it('restores the page\'s own inline overflow on <html>', () => {
    const docEl = document.documentElement;
    docEl.style.overflow = 'clip';
    lockScroll('x');
    expect(docEl.style.overflow).to.equal('hidden');
    unlockScroll('x');
    expect(docEl.style.overflow).to.equal('clip');
    docEl.style.overflow = '';
  });

  it('inside an open modal: scrollers scroll to their edge, nothing chains out, controls keep their keys', async () => {
    await fixture(PAGE);
    const wrap = (await fixture(html`
      <ty-modal open no-backdrop>
        <div id="box" style="width: 200px;">
          <button id="btn">ok</button>
          <div id="content" tabindex="0" style="height: 80px; overflow: auto;"><div style="height: 800px;"></div></div>
          <textarea id="ta"></textarea>
          <input id="in" />
          <div role="listbox" id="lb" tabindex="0"></div>
        </div>
      </ty-modal>`)) as HTMLElement;
    await nextFrame();
    const $ = (id: string) => wrap.querySelector(`#${id}`)!;
    const content = $('content');

    expect(wheel(content), 'scrollable content').to.equal(false);
    expect(swipeUp(content)).to.equal(false);
    expect(key(content, 'PageDown')).to.equal(false);
    expect(wheel(content, -100), 'already at the top').to.equal(true);
    content.scrollTop = content.scrollHeight;
    expect(wheel(content), 'at the bottom').to.equal(true);
    expect(key(content, 'End')).to.equal(true);
    expect(wheel(content, -100), 'can go back up').to.equal(false);

    expect(wheel($('btn')), 'nothing to scroll under the button').to.equal(true);
    expect(key($('btn'), 'End')).to.equal(true);
    expect(key($('btn'), ' '), 'Space presses the button').to.equal(false);
    for (const k of ['End', 'ArrowDown', ' ', 'PageDown']) {
      expect(key($('ta'), k), `textarea ${k}`).to.equal(false);
      expect(key($('in'), k), `input ${k}`).to.equal(false);
    }
    expect(key($('lb'), 'ArrowDown'), 'a widget navigates with arrows').to.equal(false);
    (wrap as any).hide({ force: true });
  });
});
