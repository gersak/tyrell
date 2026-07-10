import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/scroll-container.js';

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
