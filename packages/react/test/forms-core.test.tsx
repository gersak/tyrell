import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, nextFrame } from '@open-wc/testing';
import '../../core/lib/index.js';
import { TyInput, TyTextarea } from '../src/components/index';

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

describe(`React ${React.version} TyTextarea length rules`, () => {
  it('minLength / maxLength / messages reach the element as attributes', async () => {
    const m = await mount(
      <TyTextarea minLength={3} maxLength={10} tooShortMessage="Min {minlength}" tooLongMessage="Max {maxlength}" />,
      'ty-textarea',
    );
    const el = m.host as any;
    expect(el.getAttribute('minlength')).to.equal('3');
    expect(el.getAttribute('maxlength')).to.equal('10');
    expect(el.getAttribute('too-short-message')).to.equal('Min {minlength}');
    expect(el.getAttribute('too-long-message')).to.equal('Max {maxlength}');
    expect(el.minLength).to.equal(3);
    expect(el.maxLength).to.equal(10);
    expect(el.shadowRoot.querySelector('textarea').getAttribute('maxlength')).to.equal('10');
  });

  it('the rules validate, and follow re-renders', async () => {
    const m = await mount(<TyTextarea value="ab" minLength={3} tooShortMessage="Min {minlength}" />, 'ty-textarea');
    const el = m.host as any;
    expect(el.validity.tooShort).to.equal(true);
    expect(el.validationMessage).to.equal('Min 3');

    await m.rerender(<TyTextarea value="ab" minLength={2} tooShortMessage="Min {minlength}" />);
    expect(el.validity.valid).to.equal(true);

    await m.rerender(<TyTextarea value="abcdef" maxLength={4} tooLongMessage="Max {maxlength}" />);
    expect(el.hasAttribute('minlength'), 'dropped prop removes the rule').to.equal(false);
    expect(el.validity.tooLong).to.equal(true);
    expect(el.validationMessage).to.equal('Max 4');
  });

  it('form.reset() clears the message a submit showed', async () => {
    const m = await mount(
      <form>
        <TyTextarea name="bio" required />
        <button>Send</button>
      </form>,
    );
    const form = m.host as HTMLFormElement;
    const el = form.querySelector('ty-textarea') as any;
    form.querySelector('button')!.click();
    await nextFrame();
    expect(el.getAttribute('error')).to.not.equal(null);
    form.reset();
    await nextFrame();
    expect(el.hasAttribute('error')).to.equal(false);
  });
});

describe(`React ${React.version} TyTextarea onChange`, () => {
  /** What a keystroke in the inner textarea dispatches: a composed InputEvent. */
  const type = (el: any, value: string) => {
    const inner = el.shadowRoot.querySelector('textarea') as HTMLTextAreaElement;
    inner.value = value;
    inner.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
  };

  it('fires once per keystroke, with detail.value', async () => {
    const calls: string[] = [];
    const m = await mount(<TyTextarea onChange={(e) => calls.push(e.detail.value)} />, 'ty-textarea');
    type(m.host, 'a');
    type(m.host, 'ab');
    await nextFrame();
    expect(calls).to.deep.equal(['a', 'ab']);
  });

  // React moves a keyed element with insertBefore: disconnected, then connected again
  it('a keyed reorder keeps both fields working', async () => {
    const calls: string[] = [];
    const list = (keys: string[]) => (
      <div>{keys.map((k) => <TyTextarea key={k} name={k} onChange={(e) => calls.push(`${k} ${e.detail.value}`)} />)}</div>
    );
    const m = await mount(list(['a', 'b']));
    await m.rerender(list(['b', 'a']));
    const [b, a] = Array.from(m.host.querySelectorAll('ty-textarea')) as any[];
    expect(b.getAttribute('name')).to.equal('b');
    type(a, 'x');
    type(b, 'y');
    await nextFrame();
    expect(calls).to.deep.equal(['a x', 'b y']);
    expect([a.value, b.value]).to.deep.equal(['x', 'y']);
  });
});

describe(`React ${React.version} TyInput error prop`, () => {
  // React won't set an unchanged prop again, so validation must leave the
  // element's `error` alone: otherwise prop and element disagree.
  it('a blur after an edit and the field turning valid keep the error prop', async () => {
    const m = await mount(<TyInput name="u" minLength={5} error="Taken" />, 'ty-input');
    const el = m.host as any;
    const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
    const type = (v: string) => {
      inner.focus();
      inner.value = v;
      inner.dispatchEvent(new Event('input', { bubbles: true }));
    };
    type('ab');
    inner.blur();
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Taken');
    type('abcdef');
    await nextFrame();
    expect(el.getAttribute('error')).to.equal('Taken');
    await m.rerender(<TyInput name="u" minLength={5} error="Taken" />);
    expect(el.shadowRoot.querySelector('.error-message')?.textContent).to.equal('Taken');
  });
});

// An error looks like flavor="danger" whatever the flavor, without the field
// writing flavor: el.flavor and the attribute only ever hold the prop.
describe(`React ${React.version} TyInput error and flavor`, () => {
  const PALETTE: Record<string, string> = {
    '--ty-color-danger': 'rgb(200, 0, 0)',
    '--ty-color-danger-soft': 'rgb(250, 160, 160)',
    '--ty-color-danger-bold': 'rgb(120, 0, 0)',
    '--ty-bg-danger-soft': 'rgb(255, 240, 240)',
    '--ty-color-success': 'rgb(0, 160, 0)',
    '--ty-color-success-soft': 'rgb(160, 250, 160)',
    '--ty-input-border': 'rgb(10, 10, 10)',
    '--ty-input-bg': 'rgb(250, 250, 250)',
    '--ty-local-transition': 'none',
  };
  before(() => {
    for (const [k, v] of Object.entries(PALETTE)) document.documentElement.style.setProperty(k, v);
  });
  after(() => {
    for (const k of Object.keys(PALETTE)) document.documentElement.style.removeProperty(k);
  });

  /** Border, background and the flavor variables of the field. */
  const look = (el: any) => {
    const w = getComputedStyle(el.shadowRoot.querySelector('.input-wrapper'));
    return [w.borderTopColor, w.backgroundColor,
      ...['--input-accent', '--input-accent-bold', '--input-ring'].map((p) => w.getPropertyValue(p).trim())].join(' | ');
  };
  // The field under test, then flavor="danger" / success / plain twins to compare with
  const fields = (p: { error?: string; flavor?: string }) => (
    <div>
      <TyInput name="u" {...p} />
      <TyInput flavor="danger" error="Taken" />
      <TyInput flavor="success" />
      <TyInput />
    </div>
  );
  const mountFields = async (p: { error?: string; flavor?: string }) => {
    const m = await mount(fields(p));
    const [el, danger, success, plain] = Array.from(m.host.querySelectorAll('ty-input')) as any[];
    return { m, el, danger, success, plain };
  };

  it('the error prop shows the danger look; no flavor written, and gone with the prop', async () => {
    const { m, el, danger, plain } = await mountFields({ error: 'Taken' });
    expect(look(el)).to.equal(look(danger));
    expect(el.hasAttribute('flavor')).to.equal(false);
    expect(el.flavor).to.equal('neutral');
    await m.rerender(fields({ error: '' }));
    expect(look(el), '"" clears').to.equal(look(plain));
    await m.rerender(fields({ error: 'Again' }));
    expect(look(el)).to.equal(look(danger));
    await m.rerender(fields({}));
    expect(look(el), 'omitted clears').to.equal(look(plain));
    expect(el.hasAttribute('flavor')).to.equal(false);
  });

  it('a flavor prop next to the error: the danger look, and the flavor\'s once the error goes', async () => {
    const { m, el, danger, success } = await mountFields({ error: 'Taken', flavor: 'success' });
    expect(look(el)).to.equal(look(danger));
    expect(el.flavor).to.equal('success');
    expect(el.getAttribute('flavor')).to.equal('success');
    await m.rerender(fields({ flavor: 'success' }));
    expect(look(el)).to.equal(look(success));
    expect(el.getAttribute('flavor')).to.equal('success');
  });

  it('the flavor prop dropped while the error shows: the danger look', async () => {
    const { m, el, danger, plain } = await mountFields({ error: 'Taken', flavor: 'success' });
    await m.rerender(fields({ error: 'Taken' }));
    expect(look(el)).to.equal(look(danger));
    expect(el.flavor).to.equal('neutral');
    await m.rerender(fields({}));
    expect(look(el)).to.equal(look(plain));
  });

  it('a danger flavor prop stays once the error clears', async () => {
    const { m, el, danger } = await mountFields({ error: 'Taken' });
    await m.rerender(fields({ error: 'Taken', flavor: 'danger' }));
    await m.rerender(fields({ flavor: 'danger' }));
    expect(el.flavor).to.equal('danger');
    expect(el.getAttribute('flavor')).to.equal('danger');
    expect(look(el)).to.not.equal(look(danger)); // the danger flavor without the error
  });

  it('a submit shows the danger look; once valid the neutral one, flavor untouched', async () => {
    const m = await mount(
      <form onSubmit={(e) => e.preventDefault()}>
        <TyInput name="a" required />
        <TyInput name="b" required flavor="neutral" />
        <TyInput flavor="danger" error="Taken" />
        <TyInput />
        <button>Send</button>
      </form>,
    );
    const form = m.host as HTMLFormElement;
    const [a, b, danger, plain] = Array.from(form.querySelectorAll('ty-input')) as any[];
    form.querySelector('button')!.click();
    await nextFrame();
    (a.shadowRoot.activeElement as HTMLElement | null)?.blur(); // the submit focused it
    for (const el of [a, b]) {
      expect(el.getAttribute('error')).to.equal(el.validationMessage);
      expect(look(el)).to.equal(look(danger));
      const inner = el.shadowRoot.querySelector('input') as HTMLInputElement;
      inner.value = 'ok';
      inner.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await nextFrame();
    for (const el of [a, b]) {
      expect(el.hasAttribute('error')).to.equal(false);
      expect(look(el)).to.equal(look(plain));
      expect(el.flavor).to.equal('neutral');
    }
    expect(a.hasAttribute('flavor')).to.equal(false);
    // React 19 sets flavor as a property: unchanged from the default, so no
    // attribute appears; React 18 writes the attribute
    expect(b.getAttribute('flavor')).to.equal(React.version.startsWith('18') ? 'neutral' : null);
  });
});
