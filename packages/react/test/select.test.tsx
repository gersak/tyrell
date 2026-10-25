import React, { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, nextFrame } from '@open-wc/testing';
import '../../core/lib/index.js';
import { TyModal, TyOption, TySelect, type TySelectEventDetail } from '../src/components/index';

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

// ---------------------------------------------------------------------------
// Selection contract: `value` is the only selection input; the select draws
// checks through option.checked and writes no attributes onto options.
// externalSelection hands the selection to the app (TyOption `selected`).

const checked = (el: Element) =>
  Array.from(el.querySelectorAll('ty-option:not([cloned])'))
    .filter((o: any) => o.checked)
    .map((o) => o.getAttribute('value'));
const click = (el: Element, value: string) =>
  (el.querySelector(`ty-option[value="${value}"]`) as HTMLElement).click();

describe(`React ${React.version} TySelect selection`, () => {
  it('value is the selection; TyOption selected selects nothing; no attributes written onto options', async () => {
    const m = await mount(
      <TySelect multiple value={['b']}>
        <TyOption value="a" selected>A</TyOption>
        <TyOption value="b">B</TyOption>
      </TySelect>,
      'ty-select',
    );
    const el = m.host as any;
    expect(el.value).to.equal('b');
    expect(checked(el)).to.deep.equal(['b']);
    expect(el.querySelector('ty-option[value="b"]').hasAttribute('selected'), 'no selected written').to.equal(false);
  });

  it('controlled value: picks keep click order, are reflected to the value attribute, and [] clears', async () => {
    const seen: TySelectEventDetail[] = [];
    let set: (v: string[]) => void = () => {};
    function Roles({ initial }: { initial: string[] }) {
      const [value, setValue] = useState(initial);
      set = setValue;
      return (
        <TySelect multiple value={value} onChange={(e) => { seen.push(e.detail); setValue(e.detail.values); }}>
          <TyOption value="a">A</TyOption>
          <TyOption value="b">B</TyOption>
        </TySelect>
      );
    }
    const m = await mount(<Roles initial={['b']} />, 'ty-select');
    const el = m.host as any;
    click(el, 'a');
    await nextFrame();
    expect(seen[0].values).to.deep.equal(['b', 'a']);
    expect(el.value).to.equal('b,a');
    expect(el.getAttribute('value')).to.equal('b,a');
    expect(checked(el)).to.deep.equal(['a', 'b']);

    flushSync(() => set([]));
    await nextFrame();
    expect(el.isConnected).to.equal(true);
    expect(el.value).to.equal('');
    expect(checked(el)).to.deep.equal([]);
  });

  it('externalSelection: picks report { value, selected, action }, the app re-renders the marks, nothing is submitted', async () => {
    const seen: TySelectEventDetail[] = [];
    function Tags() {
      const [marked, setMarked] = useState(() => new Set(['b']));
      const onChange = (e: CustomEvent<TySelectEventDetail>) => {
        const { value, selected } = e.detail;
        seen.push(e.detail);
        setMarked((prev) => {
          const next = new Set(prev);
          if (selected) next.add(value as string); else next.delete(value as string);
          return next;
        });
      };
      return (
        <form>
          <TySelect name="tags" multiple externalSelection onChange={onChange}>
            {['a', 'b', 'c'].map((v) => <TyOption key={v} value={v} selected={marked.has(v)}>{v}</TyOption>)}
          </TySelect>
        </form>
      );
    }
    const m = await mount(<Tags />, 'form');
    const form = m.host as HTMLFormElement;
    const el = form.querySelector('ty-select') as any;
    expect(el.externalSelection).to.equal(true);
    expect(checked(el)).to.deep.equal(['b']);
    expect(el.value).to.equal('');
    expect(new FormData(form).has('tags'), 'the app submits its own selection').to.equal(false);

    click(el, 'a');
    await nextFrame();
    expect(seen[0]).to.include({ value: 'a', selected: true, action: 'add' });
    expect(seen[0].values).to.deep.equal([]);
    expect(checked(el)).to.deep.equal(['a', 'b']);

    click(el, 'b');
    await nextFrame();
    expect(seen[1]).to.include({ value: 'b', selected: false, action: 'remove' });
    expect(checked(el)).to.deep.equal(['a']);
    expect(el.value).to.equal('');
  });

  it('createTransform="slug" reaches the element (no attribute alias in the way)', async () => {
    const m = await mount(<TySelect allowCreate createTransform="slug" />, 'ty-select');
    expect((m.host as any).createTransform).to.equal('slug');
    expect((m.host as any).allowCreate).to.equal(true);
  });
});

describe('TySelect — server rendering', () => {
  it('hydrates a single select with a value: the trigger adds no child React has to match', async () => {
    const { renderToString } = await import('react-dom/server.browser');
    const { hydrateRoot } = await import('react-dom/client');
    const tree = (
      <form>
        <TySelect name="robot" value="b">
          <TyOption value="a">A</TyOption>
          <TyOption value="b"><b>B</b></TyOption>
        </TySelect>
      </form>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree); // elements upgrade here, before hydration
    document.body.append(container);
    const select = container.querySelector('ty-select')!;

    const errors: unknown[] = [];
    const root = hydrateRoot(container, tree, { onRecoverableError: (e) => errors.push(e) });
    await nextFrame();
    await nextFrame();

    expect(errors, 'no hydration mismatch').to.deep.equal([]);
    expect(container.querySelector('ty-select'), 'React kept the server element').to.equal(select);
    expect((select as any).value).to.equal('b');
    root.unmount();
    container.remove();
  });
});

describe('TySelectedOptions — server rendering', () => {
  it('hydrates with chips: the server renders nothing there, the client draws them', async () => {
    const { renderToString } = await import('react-dom/server.browser');
    const { hydrateRoot } = await import('react-dom/client');
    const { TySelectedOptions } = await import('../src/components/index');
    const tree = (
      <form>
        <TySelect id="ssr-multi" multiple value={['a', 'b']}>
          <TyOption value="a">A</TyOption>
          <TyOption value="b">B</TyOption>
        </TySelect>
        <TySelectedOptions htmlFor="ssr-multi" />
      </form>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    expect(container.querySelector('ty-selected-options'), 'not server-rendered').to.equal(null);
    document.body.append(container);
    const select = container.querySelector('ty-select')!;

    const errors: unknown[] = [];
    const root = hydrateRoot(container, tree, { onRecoverableError: (e) => errors.push(e) });
    await nextFrame();
    await nextFrame();

    expect(errors, 'no hydration mismatch').to.deep.equal([]);
    expect(container.querySelector('ty-select')).to.equal(select);
    const chips = Array.from(container.querySelectorAll('ty-selected-options ty-tag')).map((t) => t.getAttribute('value'));
    expect(chips).to.deep.equal(['a', 'b']);
    root.unmount();
    container.remove();
  });

  it('a client-only render shows the element in the first commit', async () => {
    const { TySelectedOptions } = await import('../src/components/index');
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    flushSync(() => root.render(<TySelectedOptions htmlFor="nothing" />));
    expect(container.querySelector('ty-selected-options')).to.not.equal(null);
    root.unmount();
    container.remove();
  });
});
