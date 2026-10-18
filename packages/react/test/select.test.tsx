import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, nextFrame } from '@open-wc/testing';
import '../../core/lib/index.js';
import { TyModal, TyOption, TySelect } from '../src/components/index';

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

const line = (host: HTMLElement) =>
  host.shadowRoot!.querySelector('.select-container > .error-message') as HTMLElement | null;

// The token sheet isn't loaded here: distinct colors per token, so two looks
// only match when they resolve the same tokens.
const TOKENS: Record<string, string> = {
  '--ty-color-danger': 'rgb(200, 0, 0)',
  '--ty-color-danger-soft': 'rgb(201, 0, 0)',
  '--ty-bg-danger-soft': 'rgb(255, 230, 230)',
  '--ty-color-primary': 'rgb(0, 0, 200)',
  '--ty-color-primary-soft': 'rgb(0, 0, 201)',
  '--ty-color-primary-strong': 'rgb(0, 0, 202)',
  '--ty-input-border': 'rgb(100, 100, 100)',
  '--ty-input-bg': 'rgb(250, 250, 250)',
};

/** What the flavor colors (accent variables, count badge) plus the field itself. */
const look = (host: HTMLElement) => {
  const root = host.shadowRoot!;
  const stub = getComputedStyle(root.querySelector('.select-stub')!);
  const badge = getComputedStyle(root.querySelector('.select-count')!);
  return [
    stub.getPropertyValue('--select-accent'),
    stub.getPropertyValue('--select-accent-bold'),
    stub.getPropertyValue('--select-ring'),
    badge.color,
    stub.borderTopColor,
    stub.backgroundColor,
  ].join(' | ');
};

describe(`React ${React.version} TySelect`, () => {
  before(() => {
    for (const [k, v] of Object.entries(TOKENS)) document.documentElement.style.setProperty(k, v);
  });
  after(() => {
    for (const k of Object.keys(TOKENS)) document.documentElement.style.removeProperty(k);
  });
  const twins: HTMLElement[] = [];
  afterEach(() => twins.splice(0).forEach((t) => t.remove()));

  const select = (error?: string, flavor?: string) => (
    <TySelect label="Robot" error={error} flavor={flavor}>
      <TyOption value="a">A</TyOption>
    </TySelect>
  );
  /** Plain elements to compare looks against. */
  const twin = async (attrs: string) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<ty-select label="Robot" ${attrs}><ty-option value="a">A</ty-option></ty-select>`;
    document.body.append(wrap);
    twins.push(wrap);
    await nextFrame();
    return wrap.firstElementChild as HTMLElement;
  };

  it('error prop shows the error line and flavor="danger"\'s look, writing no flavor; changing it updates it', async () => {
    const dangerErr = await twin('flavor="danger" error="x"');
    const m = await mount(select('Pick one'), 'ty-select');
    expect(line(m.host)?.textContent).to.equal('Pick one');
    expect((m.host as any).error).to.equal('Pick one');
    expect(look(m.host)).to.equal(look(dangerErr));
    expect((m.host as any).flavor).to.equal('neutral');
    expect(m.host.hasAttribute('flavor'), 'no flavor written').to.equal(false);

    await m.rerender(select('Still nothing'));
    expect(line(m.host)?.textContent).to.equal('Still nothing');
    expect(look(m.host)).to.equal(look(dangerErr));
  });

  it('error "" or omitted clears the line and the danger look', async () => {
    const plain = await twin('');
    const m = await mount(select('Pick one'), 'ty-select');
    await m.rerender(select(''));
    expect(line(m.host), '"" clears').to.equal(null);
    expect(look(m.host)).to.equal(look(plain));
    expect((m.host as any).flavor).to.equal('neutral');

    await m.rerender(select('Again'));
    await m.rerender(select(undefined));
    expect(line(m.host), 'omitted clears').to.equal(null);
    expect(look(m.host)).to.equal(look(plain));
    expect(m.host.hasAttribute('flavor')).to.equal(false);
  });

  it('error next to a flavor prop: flavor="danger"\'s look, and that flavor\'s once it clears', async () => {
    const dangerErr = await twin('flavor="danger" error="x"');
    const primary = await twin('flavor="primary"');
    const m = await mount(select('Pick one', 'primary'), 'ty-select');
    expect(line(m.host)?.textContent).to.equal('Pick one');
    expect(look(m.host)).to.equal(look(dangerErr));
    expect((m.host as any).flavor).to.equal('primary');
    expect(m.host.getAttribute('flavor')).to.equal('primary');
    await m.rerender(select('', 'primary'));
    expect(look(m.host)).to.equal(look(primary));
    expect((m.host as any).flavor).to.equal('primary');
    expect(m.host.getAttribute('flavor')).to.equal('primary');
  });

  it('flavor prop changing while the error shows: still danger, and flavor stays the prop', async () => {
    const dangerErr = await twin('flavor="danger" error="x"');
    const danger = await twin('flavor="danger"');
    const m = await mount(select('Pick one', 'primary'), 'ty-select');
    expect(look(m.host)).to.equal(look(dangerErr));

    await m.rerender(select('Pick one', undefined));
    expect(look(m.host), 'no flavor: danger').to.equal(look(dangerErr));
    await m.rerender(select('Pick one', 'neutral'));
    expect(look(m.host), 'neutral: danger').to.equal(look(dangerErr));
    expect((m.host as any).flavor).to.equal('neutral');

    // The author's own danger stays once the error clears
    await m.rerender(select('Pick one', 'danger'));
    await m.rerender(select('', 'danger'));
    expect(look(m.host)).to.equal(look(danger));
    expect((m.host as any).flavor).to.equal('danger');
  });

  it('required: a submit attempt puts the message in the error line and focuses the trigger', async () => {
    const dangerErr = await twin('flavor="danger" error="x"');
    let submits = 0;
    const m = await mount(
      <form onSubmit={(e) => { e.preventDefault(); submits++; }}>
        <TySelect name="robot" required>
          <TyOption value="a">A</TyOption>
        </TySelect>
        <button>Send</button>
      </form>,
      'form',
    );
    const select = m.host.querySelector('ty-select') as any;
    (m.host.querySelector('button') as HTMLButtonElement).click();
    await nextFrame();
    expect(submits).to.equal(0);
    expect(line(select)?.textContent).to.equal(select.validationMessage);
    // The accents only: the focused trigger's border is the focus rule's
    const accents = (host: HTMLElement) => look(host).split(' | ').slice(0, 4).join(' | ');
    expect(accents(select), 'danger look').to.equal(accents(dangerErr));
    expect(select.hasAttribute('flavor'), 'no flavor written').to.equal(false);
    // Booleans, not elements: a failing to.equal(<element>) stalls the runner
    expect(select.shadowRoot.activeElement === select.shadowRoot.querySelector('.select-stub')).to.equal(true);
  });

  it('inside a TyModal, Escape from the open list closes the list and leaves the modal open', async () => {
    const m = await mount(
      <TyModal open noZoom>
        <TySelect>
          <TyOption value="a">A</TyOption>
        </TySelect>
      </TyModal>,
      'ty-modal',
    );
    const select = m.host.querySelector('ty-select') as any;
    (select.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await nextFrame();
    const list = select.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(list.open).to.equal(true);

    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true }));
    await nextFrame();
    expect(list.open, 'list closed').to.equal(false);
    expect(m.host.hasAttribute('open'), 'modal still open').to.equal(true);
  });
});
