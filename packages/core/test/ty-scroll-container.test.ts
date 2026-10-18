import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import { TyScrollContainer } from '../lib/components/scroll-container.js';

// Template spec — regression coverage for:
//   1. double scrollbar (setup ran twice → two tracks)
//   2. nearend/nearstart edge events

const tall = (h = '600px') => html`<div style="height:${h}"></div>`;

describe('ty-scroll-container — custom scrollbar', () => {
  it('creates exactly one vertical track (no double thumb)', async () => {
    const el = (await fixture(html`
      <ty-scroll-container custom-scrollbar max-height="120px">${tall()}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const tracks = el.shadowRoot.querySelectorAll('.ty-scrollbar-track-y');
    expect(tracks.length).to.equal(1);
  });

  it('toggling custom-scrollbar off then on still leaves one track', async () => {
    const el = (await fixture(html`
      <ty-scroll-container custom-scrollbar max-height="120px">${tall()}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    el.removeAttribute('custom-scrollbar');
    await nextFrame();
    el.setAttribute('custom-scrollbar', '');
    await nextFrame();
    expect(el.shadowRoot.querySelectorAll('.ty-scrollbar-track-y').length).to.equal(1);
  });
});

describe('ty-scroll-container — near-edge events', () => {
  it('fires nearend when scrolled to the bottom', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px" near-edge-threshold="60">${tall()}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;

    setTimeout(() => { wrap.scrollTop = wrap.scrollHeight; });
    const e = (await oneEvent(el, 'nearend')) as CustomEvent;
    expect(e.detail.distance).to.be.at.most(60);
  });

  it('exposes scroll methods', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall()}</ty-scroll-container>
    `)) as any;
    expect(el.scrollToTop).to.be.a('function');
    expect(el.scrollToBottom).to.be.a('function');
    expect(el.scrollToElement).to.be.a('function');
  });
});

function shadowVisible(el: any, side: 'top' | 'bottom' | 'left' | 'right'): boolean {
  return el.shadowRoot.querySelector(`.shadow-${side}`).classList.contains('visible');
}

describe('ty-scroll-container — edge shadow fit cases', () => {
  it('content exactly filling max-height shows no shadows', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="200px">${tall('200px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    expect(shadowVisible(el, 'top')).to.be.false;
    expect(shadowVisible(el, 'bottom')).to.be.false;
  });

  it('content shorter than max-height shows no shadows', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="400px">${tall('120px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    expect(shadowVisible(el, 'top')).to.be.false;
    expect(shadowVisible(el, 'bottom')).to.be.false;
  });

  it('content much taller than max-height starts with only the bottom shadow', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    expect(shadowVisible(el, 'top')).to.be.false;
    expect(shadowVisible(el, 'bottom')).to.be.true;
  });

  it('scrolling to the exact bottom edge clears the bottom shadow (not just shrinks it)', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = wrap.scrollHeight - wrap.clientHeight;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.false;
    expect(shadowVisible(el, 'top')).to.be.true;
  });

  it('scrolling back to the exact top edge clears the top shadow', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = wrap.scrollHeight;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'top')).to.be.true;

    wrap.scrollTop = 0;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'top')).to.be.false;
    expect(shadowVisible(el, 'bottom')).to.be.true;
  });

  it('mid-scroll shows both top and bottom shadows', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = (wrap.scrollHeight - wrap.clientHeight) / 2;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'top')).to.be.true;
    expect(shadowVisible(el, 'bottom')).to.be.true;
  });

  it('a scroll position just outside the 2px threshold still shows the shadow', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = wrap.scrollHeight - wrap.clientHeight - 3;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.true;
  });
});

describe('ty-scroll-container — horizontal overflow control', () => {
  const wide = html`<div style="width:900px;height:10px"></div>`;

  it('without overflow-x, horizontal shadows never appear even if content is wider', async () => {
    const el = (await fixture(html`
      <ty-scroll-container style="width:200px" max-height="60px">${wide}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollLeft = 50;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'left')).to.be.false;
    expect(shadowVisible(el, 'right')).to.be.false;
  });

  it('with overflow-x, horizontal shadows track scrollLeft like the vertical pair', async () => {
    const el = (await fixture(html`
      <ty-scroll-container overflow-x style="width:200px" max-height="60px">${wide}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;

    expect(shadowVisible(el, 'left')).to.be.false;
    expect(shadowVisible(el, 'right')).to.be.true;

    wrap.scrollLeft = wrap.scrollWidth - wrap.clientWidth;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'right')).to.be.false;
    expect(shadowVisible(el, 'left')).to.be.true;

    wrap.scrollLeft = 0;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'left')).to.be.false;
    expect(shadowVisible(el, 'right')).to.be.true;
  });
});

describe('ty-scroll-container — dynamic content changes', () => {
  it('content appended after mount that starts overflowing triggers the bottom shadow via slotchange', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px"><div style="height:60px"></div></ty-scroll-container>
    `)) as any;
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.false;

    const more = document.createElement('div');
    more.style.height = '600px';
    el.appendChild(more);
    await nextFrame();
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.true;
  });

  it('removing overflowing content stops the shadow reactively', async () => {
    const filler = document.createElement('div');
    filler.style.height = '600px';
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px"></ty-scroll-container>
    `)) as any;
    el.appendChild(filler);
    await nextFrame();
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.true;

    el.removeChild(filler);
    await nextFrame();
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.false;
  });

  it('resizing the host (via ResizeObserver, not slotchange) updates shadows once content fits again', async () => {
    const el = (await fixture(html`
      <ty-scroll-container style="height:80px; display:block">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.true;

    el.style.height = '700px';
    await nextFrame();
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.false;
  });
});

describe('ty-scroll-container — property accessors', () => {
  it('noShadow property reflects to the no-shadow attribute and back', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall()}</ty-scroll-container>
    `)) as any;
    expect(el.noShadow).to.be.false;
    el.noShadow = true;
    expect(el.getAttribute('no-shadow')).to.equal('');
    el.noShadow = false;
    expect(el.hasAttribute('no-shadow')).to.be.false;
  });

  it('maxHeight property setter/getter updates the attribute and inline style', async () => {
    const el = (await fixture(html`<ty-scroll-container>${tall('60px')}</ty-scroll-container>`)) as any;
    el.maxHeight = '150px';
    expect(el.getAttribute('max-height')).to.equal('150px');
    expect(el.maxHeight).to.equal('150px');
    expect((el.scrollElement as HTMLElement).style.maxHeight).to.equal('150px');

    el.maxHeight = null;
    expect(el.hasAttribute('max-height')).to.be.false;
    expect((el.scrollElement as HTMLElement).style.maxHeight).to.equal('');
  });

  it('hideScrollbar and customScrollbar and overflowX properties reflect boolean attributes', async () => {
    const el = (await fixture(html`<ty-scroll-container>${tall('60px')}</ty-scroll-container>`)) as any;
    expect(el.hideScrollbar).to.be.false;
    el.hideScrollbar = true;
    expect(el.hasAttribute('hide-scrollbar')).to.be.true;
    el.hideScrollbar = false;
    expect(el.hasAttribute('hide-scrollbar')).to.be.false;

    el.customScrollbar = true;
    expect(el.hasAttribute('custom-scrollbar')).to.be.true;
    el.overflowX = true;
    expect(el.hasAttribute('overflow-x')).to.be.true;
  });

  it('nearEdgeThreshold defaults to 100 and round-trips through the property', async () => {
    const el = (await fixture(html`<ty-scroll-container>${tall('60px')}</ty-scroll-container>`)) as any;
    expect(el.nearEdgeThreshold).to.equal(100);
    el.nearEdgeThreshold = 30;
    expect(el.getAttribute('near-edge-threshold')).to.equal('30');
    expect(el.nearEdgeThreshold).to.equal(30);
    el.nearEdgeThreshold = null;
    expect(el.hasAttribute('near-edge-threshold')).to.be.false;
    expect(el.nearEdgeThreshold).to.equal(100);
  });

  it('scrollAnchoring property reflects the scroll-anchoring attribute', async () => {
    const el = (await fixture(html`<ty-scroll-container>${tall('60px')}</ty-scroll-container>`)) as any;
    expect(el.scrollAnchoring).to.be.false;
    el.scrollAnchoring = true;
    expect(el.hasAttribute('scroll-anchoring')).to.be.true;
    el.scrollAnchoring = false;
    expect(el.hasAttribute('scroll-anchoring')).to.be.false;
  });
});

describe('ty-scroll-container — scroll anchoring', () => {
  it('without the scroll-anchoring attribute, the browser\'s own native anchoring still preserves position', async () => {
    // We only set overflow-anchor:none (opting OUT of native anchoring) when
    // scroll-anchoring is present. Without it, native anchoring is left on, so
    // this checks the *absence* of our override, not our compensation code.
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = 50;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const older = document.createElement('div');
    older.style.height = '80px';
    el.insertBefore(older, el.firstElementChild);
    await nextFrame();
    await nextFrame();

    expect(wrap.scrollTop).to.equal(130);
  });

  it('with scroll-anchoring, prepending content shifts scrollTop by the added height (added <= current scrollTop)', async () => {
    const el = (await fixture(html`
      <ty-scroll-container scroll-anchoring max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = 200;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const older = document.createElement('div');
    older.style.height = '80px';
    el.insertBefore(older, el.firstElementChild);
    await nextFrame();
    await nextFrame();

    expect(wrap.scrollTop).to.equal(280);
  });

  it('with scroll-anchoring, prepending content taller than the current scrollTop shifts by the full added height', async () => {
    const el = (await fixture(html`
      <ty-scroll-container scroll-anchoring max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = 50;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const older = document.createElement('div');
    older.style.height = '80px';
    el.insertBefore(older, el.firstElementChild);
    await nextFrame();
    await nextFrame();

    expect(wrap.scrollTop).to.equal(130);
  });

  it('toggling scroll-anchoring off then on still only attaches a single observer (no double compensation)', async () => {
    const el = (await fixture(html`
      <ty-scroll-container scroll-anchoring max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    el.removeAttribute('scroll-anchoring');
    await nextFrame();
    el.setAttribute('scroll-anchoring', '');
    await nextFrame();

    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = 200;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();

    const older = document.createElement('div');
    older.style.height = '40px';
    el.insertBefore(older, el.firstElementChild);
    await nextFrame();
    await nextFrame();

    expect(wrap.scrollTop).to.equal(240);
  });
});

describe('ty-scroll-container — custom scrollbar edge cases', () => {
  it('creates a horizontal track only when overflow-x is also set', async () => {
    const el = (await fixture(html`
      <ty-scroll-container custom-scrollbar max-height="60px" style="width:200px">
        <div style="width:900px;height:600px"></div>
      </ty-scroll-container>
    `)) as any;
    await nextFrame();
    expect(el.shadowRoot.querySelectorAll('.ty-scrollbar-track-x').length).to.equal(0);

    el.setAttribute('overflow-x', '');
    await nextFrame();
    expect(el.shadowRoot.querySelectorAll('.ty-scrollbar-track-x').length).to.equal(1);
  });

  it('destroys and rebuilds the scrollbar when max-height changes so it never leaks a stale track', async () => {
    const el = (await fixture(html`
      <ty-scroll-container custom-scrollbar max-height="60px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    el.setAttribute('max-height', '30px');
    await nextFrame();
    expect(el.shadowRoot.querySelectorAll('.ty-scrollbar-track-y').length).to.equal(1);
  });
});

describe('ty-scroll-container — rapid scroll throttling', () => {
  it('coalesces a burst of scroll events into a single rAF-scheduled recalculation', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;

    let rafCalls = 0;
    const nativeRaf = window.requestAnimationFrame.bind(window);
    (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
      rafCalls++;
      return nativeRaf(cb);
    };
    try {
      for (let top = 10; top <= 50; top += 10) {
        wrap.scrollTop = top;
        wrap.dispatchEvent(new Event('scroll'));
      }
    } finally {
      window.requestAnimationFrame = nativeRaf;
    }
    expect(rafCalls).to.equal(1);

    await nextFrame();
    expect(shadowVisible(el, 'top')).to.be.true;
  });
});

describe('ty-scroll-container — programmatic scroll methods', () => {
  it('scrollToLeft and scrollToRight call scrollTo with left-axis targets', async () => {
    const el = (await fixture(html`
      <ty-scroll-container overflow-x style="width:200px" max-height="60px">
        <div style="width:900px;height:10px"></div>
      </ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    const calls: any[] = [];
    wrap.scrollTo = (opts: any) => calls.push(opts);

    el.scrollToLeft(false);
    el.scrollToRight(false);

    expect(calls[0]).to.deep.include({ left: 0, behavior: 'auto' });
    expect(calls[1]).to.deep.include({ left: wrap.scrollWidth, behavior: 'auto' });
  });

  it('scrollToElement scrolls a matching descendant (by selector and by element) into view', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">
        <div style="height:600px"></div>
        <div id="target" style="height:20px"></div>
      </ty-scroll-container>
    `)) as any;
    await nextFrame();
    const target = el.querySelector('#target') as HTMLElement;
    let calls = 0;
    target.scrollIntoView = () => { calls++; };

    el.scrollToElement('#target', false);
    expect(calls).to.equal(1);

    el.scrollToElement(target, false);
    expect(calls).to.equal(2);
  });

  it('scrollToElement is a no-op for a selector that matches nothing', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    expect(() => el.scrollToElement('#does-not-exist', false)).to.not.throw();
  });

  it('updateShadows() recalculates synchronously without waiting on the scroll event', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = wrap.scrollHeight;
    el.updateShadows();
    expect(shadowVisible(el, 'bottom')).to.be.false;
    expect(shadowVisible(el, 'top')).to.be.true;
  });
});

describe('ty-scroll-container — disconnect lifecycle', () => {
  it('removing the element mid-flight (pending rAF) does not throw', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = 50;
    wrap.dispatchEvent(new Event('scroll'));
    expect(() => el.remove()).to.not.throw();
    await nextFrame();
  });

  it('reconnecting after removal still responds to scroll (listeners re-attached)', async () => {
    const el = (await fixture(html`
      <ty-scroll-container max-height="120px">${tall('600px')}</ty-scroll-container>
    `)) as any;
    await nextFrame();
    const parent = el.parentNode as Node;
    el.remove();
    parent.appendChild(el);
    await nextFrame();

    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = wrap.scrollHeight;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(shadowVisible(el, 'bottom')).to.be.false;
    expect(shadowVisible(el, 'top')).to.be.true;
  });
});

describe('ty-scroll-container batch prepend anchoring', () => {
  const tallRows = (n: number, from = 0) =>
    Array.from({ length: n }, (_, i) => {
      const row = document.createElement('div');
      row.style.height = '40px';
      row.textContent = `Item ${from + i}`;
      return row;
    });

  it('a 12-row prepend taller than the current scrollTop shifts by the FULL added height', async () => {
    const el = (await fixture(html`
      <ty-scroll-container scroll-anchoring max-height="200px"></ty-scroll-container>
    `)) as any;
    el.append(...tallRows(20, 100));
    await nextFrame();

    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = 150;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();

    // 12 rows x 40px = 480px of prepended content, well past the 150px offset —
    // the case that used to compensate only ~150px and dump the user at the top.
    const older = tallRows(12, 0);
    older.reverse().forEach((row) => el.insertBefore(row, el.firstElementChild));
    await nextFrame();
    await nextFrame();

    expect(wrap.scrollTop, 'compensated by all 12 rows, not just the visible sliver')
      .to.equal(150 + 480);
  });

  it('appending at the bottom never shifts the viewport', async () => {
    const el = (await fixture(html`
      <ty-scroll-container scroll-anchoring max-height="200px"></ty-scroll-container>
    `)) as any;
    el.append(...tallRows(20));
    await nextFrame();

    const wrap = el.scrollElement as HTMLElement;
    wrap.scrollTop = 150;
    wrap.dispatchEvent(new Event('scroll'));
    await nextFrame();

    el.append(...tallRows(12, 20));
    await nextFrame();
    await nextFrame();

    expect(wrap.scrollTop, 'appended content is below the anchor').to.equal(150);
  });
});

describe('ty-scroll-container — properties set before the element upgrades', () => {
  let n = 0;
  const tag = () => `ty-scroll-container-upgrade-${++n}`;
  const hasOwn = (el: object, p: string) => Object.prototype.hasOwnProperty.call(el, p);

  it('maxHeight and customScrollbar set early apply; later assignments reach the setters', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.maxHeight = '120px';
    el.customScrollbar = true;
    document.body.append(el);
    customElements.define(name, class extends TyScrollContainer {});
    await nextFrame();
    const wrapper = el.shadowRoot.querySelector('.scroll-wrapper') as HTMLElement;
    expect(el.getAttribute('max-height')).to.equal('120px');
    expect(wrapper.style.maxHeight).to.equal('120px');
    expect(el.hasAttribute('custom-scrollbar')).to.equal(true);
    expect(hasOwn(el, 'maxHeight') || hasOwn(el, 'customScrollbar'), 'no own properties left').to.equal(false);

    el.maxHeight = '80px';
    expect(wrapper.style.maxHeight).to.equal('80px');
    el.remove();
  });
});
