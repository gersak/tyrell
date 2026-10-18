import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, nextFrame } from '@open-wc/testing';
import '../../core/lib/index.js';
import { TyDatePicker } from '../src/components/index';

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

const submitted = (host: HTMLElement) => new FormData(host.closest('form')!).get('d');
// No theme sheet here: distinct colors for the tokens the flavors read
const TOKENS: Record<string, string> = {
  '--ty-color-danger': 'rgb(200, 0, 0)',
  '--ty-color-danger-soft': 'rgb(201, 0, 0)',
  '--ty-color-primary': 'rgb(0, 0, 200)',
  '--ty-color-primary-soft': 'rgb(0, 0, 201)',
  '--ty-color-success': 'rgb(0, 200, 0)',
  '--ty-color-success-soft': 'rgb(0, 201, 0)',
};
/** The flavor variables: border, hover, focus ring and icon read them. */
const accent = (host: HTMLElement) => {
  const s = getComputedStyle(host.shadowRoot!.querySelector('.date-picker-stub')!);
  return ['--date-picker-accent', '--date-picker-accent-bold', '--date-picker-ring']
    .map((v) => s.getPropertyValue(v).trim()).join(' | ');
};
let dangerTwin: HTMLElement;
// Looks like flavor="danger"
const dangerLook = (host: HTMLElement) => accent(host) === accent(dangerTwin);
// What the host carries: only ever the author's flavor
const hostFlavor = (host: HTMLElement) => `${host.getAttribute('flavor')} ${(host as any).flavor}`;

describe(`React ${React.version} TyDatePicker native / error`, function () {
  // Each test waits a few animation frames, which a throttled headless
  // browser can stretch past mocha's 5s default.
  this.timeout(20000);

  before(() => {
    for (const [k, v] of Object.entries(TOKENS)) document.documentElement.style.setProperty(k, v);
    dangerTwin = document.createElement('ty-date-picker');
    dangerTwin.setAttribute('flavor', 'danger');
    document.body.append(dangerTwin);
  });
  after(() => {
    for (const k of Object.keys(TOKENS)) document.documentElement.style.removeProperty(k);
    dangerTwin.remove();
  });

  const picker = (props: Record<string, any>) => (
    <form><TyDatePicker name="d" value="2026-10-16" {...props} /></form>
  );

  it('native: true submits "YYYY-MM-DD"; false the UTC instant the day starts', async () => {
    const m = await mount(picker({ native: true }), 'ty-date-picker');
    const el = m.host as any;
    expect(m.host.hasAttribute('native')).to.equal(true);
    expect(el.value).to.equal('2026-10-16');
    expect(submitted(m.host)).to.equal('2026-10-16');

    await m.rerender(picker({ native: false }));
    expect(m.host.hasAttribute('native'), 'false → attribute removed').to.equal(false);
    expect(el.native).to.equal(false);
    expect(el.value).to.equal(new Date(2026, 9, 16).toISOString());
    expect(submitted(m.host)).to.equal(el.value);
  });

  it('native turned on later re-emits the same day as "YYYY-MM-DD"', async () => {
    const m = await mount(picker({}), 'ty-date-picker');
    expect(submitted(m.host)).to.equal(new Date(2026, 9, 16).toISOString());
    await m.rerender(picker({ native: true }));
    expect(submitted(m.host)).to.equal('2026-10-16');
  });

  it('native + withTime submits "YYYY-MM-DDTHH:mm"; withTime off keeps the day', async () => {
    const m = await mount(picker({ native: true, withTime: true, value: '2026-10-16T14:30' }), 'ty-date-picker');
    expect(submitted(m.host)).to.equal('2026-10-16T14:30');

    await m.rerender(picker({ native: true, withTime: false, value: '2026-10-16T14:30' }));
    expect(m.host.hasAttribute('with-time')).to.equal(false);
    expect(submitted(m.host)).to.equal('2026-10-16');
  });

  it('onChange detail.value is the submitted string', async () => {
    const seen: any[] = [];
    const m = await mount(picker({ native: true, onChange: (e: CustomEvent) => seen.push(e.detail) }), 'ty-date-picker');
    (m.host.shadowRoot!.querySelector('.stub-clear') as HTMLButtonElement).click();
    expect(seen).to.have.length(1);
    expect(seen[0].value).to.equal(null);
    expect(submitted(m.host)).to.equal('');
  });

  // React 19 sets value before with-time in one commit: a date-only picker
  // reads the time first and must still have it once with-time arrives.
  it('withTime and a value with a time arriving in the same render keep the time', async () => {
    const m = await mount(picker({ native: true }), 'ty-date-picker');
    await m.rerender(picker({ native: true, withTime: true, value: '2026-10-16T14:30' }));
    expect((m.host as any).value).to.equal('2026-10-16T14:30');
    expect(submitted(m.host)).to.equal('2026-10-16T14:30');

    await m.rerender(picker({ withTime: false, value: '2026-10-17T09:15' }));
    await m.rerender(picker({ withTime: true, value: '2026-10-17T09:15' }));
    expect(submitted(m.host)).to.equal(new Date(2026, 9, 17, 9, 15).toISOString());
  });

  it('a number value is epoch milliseconds', async () => {
    const ms = new Date(2026, 9, 16, 14, 30).getTime();
    const m = await mount(picker({ native: true, withTime: true, value: ms }), 'ty-date-picker');
    expect((m.host as any).value).to.equal('2026-10-16T14:30');
    await m.rerender(picker({ withTime: true, value: ms + 60_000 }));
    expect(submitted(m.host)).to.equal(new Date(ms + 60_000).toISOString());
  });

  it('required: a submit shows the message under the field; an error prop replaces it', async () => {
    let submits = 0;
    const form = (error?: string) => (
      <form onSubmit={(e) => { e.preventDefault(); submits++; }}>
        <TyDatePicker name="d" required error={error} />
        <button>Go</button>
      </form>
    );
    const m = await mount(form());
    const el = m.host.querySelector('ty-date-picker') as any;
    const line = () => el.shadowRoot.querySelector('.error-message');
    const stubFocused = () => el.shadowRoot.activeElement === el.shadowRoot.querySelector('.date-picker-stub');
    m.host.querySelector('button')!.click();
    await nextFrame();
    expect(submits).to.equal(0);
    expect(el.validationMessage).to.not.equal('');
    expect(line()?.textContent).to.equal(el.validationMessage);
    expect(stubFocused()).to.equal(true);

    // Like a form library: focus stays on the field while its error renders
    await m.rerender(form('Fully booked'));
    expect(line()?.textContent).to.equal('Fully booked');
    expect(dangerLook(el)).to.equal(true);
    expect(hostFlavor(el)).to.equal('null default');
    expect(stubFocused(), 'error prop set').to.equal(true);
    await m.rerender(form());
    expect(line()).to.equal(null);
    expect(dangerLook(el)).to.equal(false);
    expect(hostFlavor(el)).to.equal('null default');
    expect(stubFocused(), 'error prop removed').to.equal(true);
  });

  it('focus() then an error prop: the field keeps the focus', async () => {
    const m = await mount(picker({}), 'ty-date-picker');
    const el = m.host as any;
    el.focus();
    await m.rerender(picker({ error: 'Taken' }));
    // Booleans, not elements: a failing to.equal(<element>) stalls the runner
    expect(document.activeElement === el).to.equal(true);
    expect(el.shadowRoot.activeElement === el.shadowRoot.querySelector('.date-picker-stub')).to.equal(true);
  });

  it('error with a flavor in the same render: the danger look, the flavor kept for when it clears', async () => {
    const m = await mount(picker({ error: 'Bad', flavor: 'primary' }), 'ty-date-picker');
    expect(hostFlavor(m.host)).to.equal('primary primary');
    expect(dangerLook(m.host)).to.equal(true);
    await m.rerender(picker({ flavor: 'primary' }));
    expect(hostFlavor(m.host)).to.equal('primary primary');
    expect(dangerLook(m.host)).to.equal(false);
    expect(m.host.shadowRoot!.querySelector('.error-message')).to.equal(null);
  });

  it('error shows the line under the field and the danger look; removing it clears both', async () => {
    const m = await mount(picker({ error: 'Pick a day' }), 'ty-date-picker');
    const line = () => m.host.shadowRoot!.querySelector('.error-message');
    expect(m.host.getAttribute('error')).to.equal('Pick a day');
    expect(line()?.textContent).to.equal('Pick a day');
    expect(dangerLook(m.host)).to.equal(true);
    expect(hostFlavor(m.host)).to.equal('null default');

    await m.rerender(picker({}));
    expect((m.host as any).error || '').to.equal('');
    expect(line()).to.equal(null);
    expect(dangerLook(m.host)).to.equal(false);
    expect(hostFlavor(m.host)).to.equal('null default');
  });

  it('flavor and error props in any order of renders: the host only holds the author flavor', async () => {
    const m = await mount(picker({ error: 'Bad', flavor: 'neutral' }), 'ty-date-picker');
    expect(dangerLook(m.host), 'neutral + error').to.equal(true);
    expect(hostFlavor(m.host)).to.equal('neutral neutral');

    await m.rerender(picker({ error: 'Bad', flavor: 'success' }));
    expect(dangerLook(m.host), 'success + error').to.equal(true);
    expect(hostFlavor(m.host)).to.equal('success success');

    await m.rerender(picker({ error: 'Bad', flavor: 'danger' }));
    expect(dangerLook(m.host), 'danger + error: the flavor itself').to.equal(true);
    expect(hostFlavor(m.host)).to.equal('danger danger');

    await m.rerender(picker({ flavor: 'danger' }));
    expect(hostFlavor(m.host), 'the author danger stays').to.equal('danger danger');

    await m.rerender(picker({ flavor: 'success' }));
    expect(dangerLook(m.host), 'success, no error').to.equal(false);

    await m.rerender(picker({ error: 'Again', flavor: 'neutral' }));
    expect(dangerLook(m.host), 'neutral again').to.equal(true);
    expect(hostFlavor(m.host)).to.equal('neutral neutral');

    await m.rerender(picker({ flavor: 'neutral' }));
    expect(dangerLook(m.host), 'error removed').to.equal(false);
    expect(hostFlavor(m.host)).to.equal('neutral neutral');
  });
});
