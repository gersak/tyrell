import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, nextFrame } from '@open-wc/testing';
import '../../core/lib/index.js';
import { TyButton } from '../src/components/index';

// ---------------------------------------------------------------------------
// Harness (same as wrappers.test.tsx): render into a fresh root, flush
// synchronously, give effects and the custom elements a frame to settle.

type Mounted = { host: HTMLElement; rerender: (node: React.ReactElement) => Promise<void>; root: Root };
const mounted: Array<{ root: Root; container: HTMLElement }> = [];

async function mount(node: React.ReactElement, selector?: string): Promise<Mounted> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  flushSync(() => root.render(node));
  await nextFrame();
  const host = (selector ? container.querySelector(selector) : container.firstElementChild) as HTMLElement;
  return {
    host,
    root,
    rerender: async (next) => {
      flushSync(() => root.render(next));
      await nextFrame();
    },
  };
}

afterEach(() => {
  for (const { root, container } of mounted.splice(0)) {
    root.unmount();
    container.remove();
  }
});

// ---------------------------------------------------------------------------
// TyButton activation acts like a native <button>: onClick runs before the
// submit and its preventDefault() cancels it; one onClick per press (also for
// a React onClick on an ancestor); disabled, loading or inside a disabled
// <fieldset>, no onClick and no submit. Presses go to the inner shadow
// <button>, which is what a user hits.

describe(`React ${React.version} TyButton activation`, () => {
  type Log = { submits: number; clicks: number; ancestorClicks: number };

  type Opts = { onClick?: (e: React.MouseEvent<HTMLElement>) => void; fieldsetDisabled?: boolean };

  const page = (button: React.ReactElement, log: Log, { onClick, fieldsetDisabled }: Opts = {}) => (
    <div onClick={() => { log.ancestorClicks++; }}>
      <form onSubmit={(e) => { e.preventDefault(); log.submits++; }}>
        <input name="q" defaultValue="hi" />
        <fieldset disabled={fieldsetDisabled}>
          {React.cloneElement(button, {
            onClick: (e: React.MouseEvent<HTMLElement>) => { log.clicks++; onClick?.(e); },
          })}
        </fieldset>
      </form>
    </div>
  );

  async function mountPage(button: React.ReactElement, opts?: Opts) {
    const log: Log = { submits: 0, clicks: 0, ancestorClicks: 0 };
    const m = await mount(page(button, log, opts), 'ty-button');
    const press = () => (m.host.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    const rerender = (next: React.ReactElement, nextOpts?: Opts) => m.rerender(page(next, log, nextOpts));
    return { log, press, rerender, host: m.host };
  }

  it('one press: one onClick, one ancestor onClick, one submit', async () => {
    const { log, press } = await mountPage(<TyButton type="submit">Go</TyButton>);
    press();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 1, clicks: 1, ancestorClicks: 1 });
  });

  it('onClick e.preventDefault() cancels the submit', async () => {
    const { log, press } = await mountPage(<TyButton type="submit">Go</TyButton>, {
      onClick: (e) => e.preventDefault(),
    });
    press();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 0, clicks: 1, ancestorClicks: 1 });
  });

  it('e.preventDefault() in an ancestor onClick cancels the submit too', async () => {
    const log: Log = { submits: 0, clicks: 0, ancestorClicks: 0 };
    const m = await mount(
      <div onClick={(e) => { log.ancestorClicks++; e.preventDefault(); }}>
        <form onSubmit={(e) => { e.preventDefault(); log.submits++; }}>
          <TyButton type="submit" onClick={() => { log.clicks++; }}>Go</TyButton>
        </form>
      </div>,
      'ty-button',
    );
    (m.host.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 0, clicks: 1, ancestorClicks: 1 });
  });

  it('onClick e.preventDefault() cancels a reset', async () => {
    const resets: number[] = [];
    const m = await mount(
      <form onReset={() => { resets.push(1); }}>
        <input name="q" defaultValue="hi" />
        <TyButton type="reset" onClick={(e) => e.preventDefault()}>Clear</TyButton>
      </form>,
      'ty-button',
    );
    const input = m.host.closest('form')!.querySelector('input')!;
    input.value = 'changed';
    (m.host.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    await nextFrame();
    expect(resets).to.have.length(0);
    expect(input.value).to.equal('changed');
  });

  for (const prop of ['disabled', 'loading'] as const) {
    it(`${prop}: no onClick, no ancestor onClick, no submit`, async () => {
      const { log, press } = await mountPage(<TyButton type="submit" {...{ [prop]: true }}>Go</TyButton>);
      press();
      await nextFrame();
      expect(log).to.deep.equal({ submits: 0, clicks: 0, ancestorClicks: 0 });
    });
  }

  // Clicks that target the host itself (host.click(), Testing Library's
  // fireEvent.click on the element, a wrapping <label>) never pass the inner
  // <button>; they must act like a press on it all the same.
  const hostClicks = (host: HTMLElement) => [
    () => host.click(),
    () => host.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true })),
  ];

  it('host.click() / fireEvent-style click on the host: one onClick, one ancestor onClick, one submit each', async () => {
    const { log, host } = await mountPage(<TyButton type="submit">Go</TyButton>);
    for (const click of hostClicks(host)) click();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 2, clicks: 2, ancestorClicks: 2 });
  });

  it('onClick e.preventDefault() cancels the submit of a click on the host', async () => {
    const { log, host } = await mountPage(<TyButton type="submit">Go</TyButton>, {
      onClick: (e) => e.preventDefault(),
    });
    host.click();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 0, clicks: 1, ancestorClicks: 1 });
  });

  it('a click on a wrapping <label> presses the button', async () => {
    const log: Log = { submits: 0, clicks: 0, ancestorClicks: 0 };
    const m = await mount(
      <form onSubmit={(e) => { e.preventDefault(); log.submits++; }}>
        <label><span>Send it</span> <TyButton type="submit" onClick={() => { log.clicks++; }}>Go</TyButton></label>
      </form>,
      'ty-button',
    );
    (m.host.closest('label')!.querySelector('span') as HTMLElement).click();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 1, clicks: 1, ancestorClicks: 0 });
  });

  for (const prop of ['disabled', 'loading'] as const) {
    it(`${prop}: a click on the host fires no onClick and does not submit`, async () => {
      const { log, host } = await mountPage(<TyButton type="submit" {...{ [prop]: true }}>Go</TyButton>);
      for (const click of hostClicks(host)) click();
      await nextFrame();
      expect(log).to.deep.equal({ submits: 0, clicks: 0, ancestorClicks: 0 });
    });
  }

  it('loading → false: clicks and submits again', async () => {
    const { log, press, rerender } = await mountPage(<TyButton type="submit" loading>Go</TyButton>);
    press();
    await rerender(<TyButton type="submit" loading={false}>Go</TyButton>);
    press();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 1, clicks: 1, ancestorClicks: 1 });
  });

  it('inside <fieldset disabled>: disabled, no onClick, no submit; re-enabled works', async () => {
    const button = <TyButton type="submit">Go</TyButton>;
    const { log, press, rerender, host } = await mountPage(button, { fieldsetDisabled: true });
    expect(host.matches(':disabled'), 'host matches :disabled').to.equal(true);
    expect((host.shadowRoot!.querySelector('button') as HTMLButtonElement).disabled).to.equal(true);
    press();
    host.click();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 0, clicks: 0, ancestorClicks: 0 });

    await rerender(button, { fieldsetDisabled: false });
    expect(host.matches(':disabled')).to.equal(false);
    press();
    await nextFrame();
    expect(log).to.deep.equal({ submits: 1, clicks: 1, ancestorClicks: 1 });
  });
});
