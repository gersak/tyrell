/**
 * Lazy tabs: a `lazy` ty-tab with no content fires `ty-tab-load` when it's
 * shown, shows a spinner (or `slot="loading"`) until content arrives, and an
 * error (`slot="error"`) with Retry once the app calls `loadFailed()`.
 */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/tabs.js';
import '../lib/components/tab.js';
import '../lib/components/popup.js';
import { setLoaderSvg } from '../lib/utils/loader-registry.js';
import { morph } from './helpers/morph.js';

// What the server renders: A has content, B and C load on demand.
const SERVER = `
  <ty-tabs height="300px">
    <ty-tab id="a" label="A">Panel A</ty-tab>
    <ty-tab id="b" label="B" lazy></ty-tab>
    <ty-tab id="c" label="C" lazy>
      <div slot="loading">Loading C…</div>
      <span slot="error">C is down.</span>
    </ty-tab>
  </ty-tabs>`;

type Tab = HTMLElement & { loadFailed(): void };

async function mount(markup = SERVER): Promise<HTMLElement> {
  const host = await fixture(html`<div style="width: 600px; --ty-tabs-transition-duration: 0ms"></div>`);
  host.innerHTML = markup;
  await settle();
  return host.firstElementChild as HTMLElement;
}

async function settle(): Promise<void> {
  await nextFrame();
  await nextFrame();
}

function tab(el: HTMLElement, id: string): Tab {
  return el.querySelector(`#${id}`) as Tab;
}

/** ty-tab-load doesn't bubble: capture on ty-tabs sees every tab's. */
function recordLoads(el: HTMLElement): any[] {
  const loads: any[] = [];
  el.addEventListener('ty-tab-load', (e) => loads.push({ ...(e as CustomEvent).detail, target: (e.target as Element).id }), true);
  return loads;
}

function click(el: HTMLElement, id: string): void {
  (el.shadowRoot!.querySelector(`[data-tab-id="${id}"]`) as HTMLElement).click();
}

function panel(t: Element): HTMLElement {
  return t.shadowRoot!.querySelector('.tab-panel') as HTMLElement;
}

/** 'loading' | 'failed' | null — what the panel shows besides content. */
function status(t: Element): string | null {
  return panel(t).dataset.load ?? null;
}

function shown(t: Element, part: 'loading' | 'error'): boolean {
  return getComputedStyle(t.shadowRoot!.querySelector(`.tab-${part}`)!).display !== 'none';
}

describe('ty-tabs lazy tabs', () => {
  it('showing a lazy tab with no content fires ty-tab-load once, on the tab', async () => {
    const el = await mount();
    const loads = recordLoads(el);
    let bubbled = false;
    el.addEventListener('ty-tab-load', () => { bubbled = true; });

    click(el, 'b');

    expect(bubbled, "doesn't bubble").to.equal(false);

    expect(loads).to.deep.equal([{ id: 'b', index: 1, target: 'b' }]);
    const b = tab(el, 'b');
    expect(status(b)).to.equal('loading');
    expect(shown(b, 'loading'), 'spinner showing').to.equal(true);
    expect(b.shadowRoot!.querySelector('.tab-spinner svg'), 'built-in spinner').to.exist;
    expect(panel(b).getAttribute('aria-busy')).to.equal('true');
  });

  it('fires after ty-tab-change', async () => {
    const el = await mount();
    const order: string[] = [];
    el.addEventListener('ty-tab-change', () => order.push('change'));
    el.addEventListener('ty-tab-load', () => order.push('load'), true);

    click(el, 'b');

    expect(order).to.deep.equal(['change', 'load']);
  });

  it('no event for the first tab, even a lazy empty one: the page carries its content', async () => {
    const el = await mount(SERVER.replace('<ty-tabs height="300px">', '<ty-tabs height="300px" active="b">'));
    const loads = recordLoads(el);
    await settle();

    expect(loads).to.have.length(0);
    expect(status(tab(el, 'b')), 'blank, no spinner nobody will stop').to.equal(null);

    click(el, 'a');
    click(el, 'b');
    expect(loads.map((l) => l.id)).to.deep.equal(['b']);
  });

  it('an app or server switching `active` to a lazy tab fires too', async () => {
    const el = await mount();
    const loads = recordLoads(el);

    el.setAttribute('active', 'b');
    await settle();

    expect(loads.map((l) => l.id)).to.deep.equal(['b']);
  });

  it('switching away and back while loading does not ask twice', async () => {
    const el = await mount();
    const loads = recordLoads(el);

    click(el, 'b');
    click(el, 'a');
    click(el, 'b');

    expect(loads).to.have.length(1);
    expect(status(tab(el, 'b'))).to.equal('loading');
  });

  it('content arriving ends loading — an element or bare text', async () => {
    const el = await mount();
    const loads = recordLoads(el);
    const b = tab(el, 'b');
    const c = tab(el, 'c');

    click(el, 'b');
    b.insertAdjacentHTML('beforeend', '<p>Report</p>');
    await settle();
    expect(status(b)).to.equal(null);
    expect(panel(b).hasAttribute('aria-busy')).to.equal(false);

    click(el, 'c');
    c.append('Just text');
    await settle();
    expect(status(c)).to.equal(null);
    expect(shown(c, 'loading')).to.equal(false);

    click(el, 'b');
    click(el, 'c');
    expect(loads.map((l) => l.id), 'loaded tabs never ask again').to.deep.equal(['b', 'c']);
  });

  it('slot="loading" replaces the spinner', async () => {
    const el = await mount();
    const c = tab(el, 'c');

    click(el, 'c');

    const slot = c.shadowRoot!.querySelector('slot[name="loading"]') as HTMLSlotElement;
    expect(slot.assignedElements().map((e) => e.textContent)).to.deep.equal(['Loading C…']);
    expect(shown(c, 'loading')).to.equal(true);
  });

  it('the placeholder fades in late, so a fast load never flashes it', async () => {
    const el = await mount();
    click(el, 'b');
    const loading = tab(el, 'b').shadowRoot!.querySelector('.tab-loading')!;
    expect(getComputedStyle(loading).animationDelay).to.equal('0.15s');
  });

  it('loadFailed() shows the error and a Retry that asks again', async () => {
    const el = await mount();
    const loads = recordLoads(el);
    const b = tab(el, 'b');

    click(el, 'b');
    b.loadFailed();

    expect(status(b)).to.equal('failed');
    expect(shown(b, 'error')).to.equal(true);
    expect(shown(b, 'loading')).to.equal(false);
    expect(panel(b).hasAttribute('aria-busy')).to.equal(false);
    const message = b.shadowRoot!.querySelector('.tab-error slot') as HTMLSlotElement;
    expect(message.assignedNodes().length, 'no slot="error": default text').to.equal(0);
    expect(message.textContent).to.equal("Couldn't load.");

    const retry = b.shadowRoot!.querySelector('.tab-retry') as HTMLButtonElement;
    retry.focus();
    expect(b.shadowRoot!.activeElement, 'Retry is reachable').to.equal(retry);
    retry.click();

    expect(loads.map((l) => l.id)).to.deep.equal(['b', 'b']);
    expect(loads[1].index).to.equal(1);
    expect(status(b)).to.equal('loading');
    expect(b.shadowRoot!.activeElement, 'focus stays in the tab').to.equal(panel(b));
  });

  it('slot="error" replaces the message', async () => {
    const el = await mount();
    const c = tab(el, 'c');

    click(el, 'c');
    c.loadFailed();

    const slot = c.shadowRoot!.querySelector('slot[name="error"]') as HTMLSlotElement;
    expect(slot.assignedElements().map((e) => e.textContent)).to.deep.equal(['C is down.']);
    expect(shown(c, 'error')).to.equal(true);
  });

  it('showing a failed tab again retries', async () => {
    const el = await mount();
    const loads = recordLoads(el);

    click(el, 'b');
    tab(el, 'b').loadFailed();
    click(el, 'a');
    click(el, 'b');

    expect(loads.map((l) => l.id)).to.deep.equal(['b', 'b']);
    expect(status(tab(el, 'b'))).to.equal('loading');
  });

  it('content arriving after a failure clears the error', async () => {
    const el = await mount();
    const b = tab(el, 'b');

    click(el, 'b');
    b.loadFailed();
    b.append('Late reply');
    await settle();

    expect(status(b)).to.equal(null);
    expect(shown(b, 'error')).to.equal(false);
  });

  it('loadFailed() is ignored by a tab that has content or is not lazy', async () => {
    const el = await mount();
    tab(el, 'a').loadFailed();
    expect(status(tab(el, 'a'))).to.equal(null);

    const b = tab(el, 'b');
    click(el, 'b');
    b.append('Loaded');
    await settle();
    b.loadFailed();
    expect(status(b)).to.equal(null);
  });

  it('<template>, <script> and <style> are not content', async () => {
    const el = await mount(SERVER.replace('<ty-tab id="b" label="B" lazy>',
      '<ty-tab id="b" label="B" lazy><template><p>row</p></template><script type="application/json">{}</script><style>p{}</style>'));
    const loads = recordLoads(el);

    click(el, 'b');

    expect(loads.map((l) => l.id)).to.deep.equal(['b']);
  });

  it('a lazy tab inside a lazy tab only triggers its own listener', async () => {
    const el = await mount(`
      <ty-tabs height="300px">
        <ty-tab id="general" label="General">General</ty-tab>
        <ty-tab id="settings" label="Settings" lazy>
          <ty-tabs height="200px">
            <ty-tab id="basic" label="Basic">Basic</ty-tab>
            <ty-tab id="advanced" label="Advanced" lazy></ty-tab>
          </ty-tabs>
        </ty-tab>
      </ty-tabs>`);
    const settings = tab(el, 'settings');
    const inner = settings.querySelector('ty-tabs') as HTMLElement;
    const outerLoads: string[] = [];
    const innerLoads: string[] = [];
    settings.addEventListener('ty-tab-load', (e) => outerLoads.push((e.target as Element).id));
    inner.querySelector('#advanced')!.addEventListener('ty-tab-load', (e) => innerLoads.push((e.target as Element).id));

    click(el, 'settings');
    await settle();
    click(inner, 'advanced');

    expect(outerLoads, 'settings has content (the inner tabs): nothing to load').to.deep.equal([]);
    expect(innerLoads).to.deep.equal(['advanced']);
  });

  it('a shown loaded tab emptied and moved in one go still loads again', async () => {
    const el = await mount();
    const loads = recordLoads(el);
    const b = tab(el, 'b');
    click(el, 'b');
    b.append('Loaded');
    await settle();

    b.replaceChildren();
    el.appendChild(b); // reorder: disconnect + reconnect in the same task
    await settle();

    expect(loads.map((l) => l.id)).to.deep.equal(['b', 'b']);
    expect(status(b)).to.equal('loading');
  });

  it('a tab without `lazy` never fires, even when empty', async () => {
    const el = await mount(SERVER.replace('<ty-tab id="b" label="B" lazy>', '<ty-tab id="b" label="B">'));
    const loads = recordLoads(el);

    click(el, 'b');

    expect(loads).to.have.length(0);
    expect(status(tab(el, 'b'))).to.equal(null);
  });

  it('removing `lazy` drops the loading state', async () => {
    const el = await mount();
    const b = tab(el, 'b');

    click(el, 'b');
    b.removeAttribute('lazy');

    expect(status(b)).to.equal(null);
    expect(panel(b).hasAttribute('aria-busy')).to.equal(false);
  });

  it('uses the loader registered with setLoaderSvg()', async () => {
    setLoaderSvg('<svg data-custom-loader viewBox="0 0 1 1"></svg>');
    try {
      const el = await mount();
      click(el, 'b');
      expect(tab(el, 'b').shadowRoot!.querySelector('.tab-spinner [data-custom-loader]')).to.exist;
    } finally {
      setLoaderSvg(null);
    }
  });

  describe('under server morphs', () => {
    const withContent = (id: string, content: string) =>
      SERVER.replace(new RegExp(`(<ty-tab id="${id}"[^>]*>)`), `$1${content}`);

    it('a morph bringing the content ends loading', async () => {
      const el = await mount();
      click(el, 'b');

      morph(el, withContent('b', '<p>Report</p>'));
      await settle();

      expect(status(tab(el, 'b'))).to.equal(null);
      expect(tab(el, 'b').textContent).to.contain('Report');
    });

    it('a morph that empties the shown tab loads it again at once', async () => {
      const el = await mount();
      const loads = recordLoads(el);
      click(el, 'b');
      morph(el, withContent('b', '<p>Report</p>'));
      await settle();

      morph(el, SERVER); // full re-render: the server's B is empty
      await settle();

      expect(loads.map((l) => l.id)).to.deep.equal(['b', 'b']);
      expect(status(tab(el, 'b'))).to.equal('loading');
    });

    it('a morph that empties a hidden tab loads it the next time it is shown', async () => {
      const el = await mount();
      const loads = recordLoads(el);
      click(el, 'c');
      morph(el, withContent('c', 'Ready'));
      await settle();
      click(el, 'a');

      morph(el, SERVER);
      await settle();
      expect(loads.map((l) => l.id), 'hidden: nothing yet').to.deep.equal(['c']);

      click(el, 'c');
      expect(loads.map((l) => l.id)).to.deep.equal(['c', 'c']);
    });

    it('a morph that switches to a tab and brings its content fires no load', async () => {
      const el = await mount();
      const loads = recordLoads(el);

      morph(el, withContent('c', 'Billing').replace('<ty-tabs height="300px">', '<ty-tabs height="300px" active="c">'));
      await settle();

      expect(loads).to.have.length(0);
      expect(status(tab(el, 'c'))).to.equal(null);
    });

    it('server renders only the active panel: switching away from a loaded tab does not reload it', async () => {
      const el = await mount();
      const loads = recordLoads(el);
      click(el, 'b');
      morph(el, withContent('b', 'Report'));
      await settle();

      // Next render: c is active and has content, b is empty again.
      morph(el, withContent('c', 'Billing').replace('<ty-tabs height="300px">', '<ty-tabs height="300px" active="c">'));
      await settle();

      expect(loads.map((l) => l.id), 'only the first load of b').to.deep.equal(['b']);
      expect(status(tab(el, 'b')), 'b hidden and empty: blank until shown').to.equal(null);
      expect(el.querySelector('#c')!.textContent).to.contain('Billing');
    });

    it('re-rendering a loading tab with the same placeholder does not ask twice', async () => {
      const el = await mount();
      const loads = recordLoads(el);
      click(el, 'c');

      morph(el, SERVER);
      await settle();

      expect(loads).to.have.length(1);
      expect(status(tab(el, 'c'))).to.equal('loading');
    });
  });
});
