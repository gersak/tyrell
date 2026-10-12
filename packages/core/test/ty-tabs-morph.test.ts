/**
 * ty-tabs under server morphs (Datastar patch-elements, htmx/idiomorph).
 * A morph rewrites the element from server HTML: attributes become exactly the
 * server's, children are matched and morphed in place. Anything the component
 * kept in its own host or child attributes is lost — so it mustn't keep any.
 */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/tabs.js';
import '../lib/components/tab.js';
import '../lib/components/popup.js';
import { morph } from './helpers/morph.js';

// What the server renders. It doesn't know which tab the user is on.
const SERVER = `
  <ty-tabs height="300px">
    <ty-tab id="a" label="A">Panel A</ty-tab>
    <ty-tab id="b" label="B">Panel B</ty-tab>
    <ty-tab id="c" label="C">Panel C</ty-tab>
  </ty-tabs>`;

// No transitions, so "visible" means the settled state, not mid-fade.
async function mount(markup = SERVER): Promise<HTMLElement & { activeTab: string | null }> {
  const host = await fixture(html`<div style="width: 600px; --ty-tabs-transition-duration: 0ms"></div>`);
  host.innerHTML = markup;
  await nextFrame();
  await nextFrame();
  return host.firstElementChild as any;
}

function recordChanges(el: HTMLElement): any[] {
  const events: any[] = [];
  el.addEventListener('ty-tab-change', (e) => events.push((e as CustomEvent).detail));
  return events;
}

function click(el: HTMLElement, id: string): void {
  (el.shadowRoot!.querySelector(`[data-tab-id="${id}"]`) as HTMLElement).click();
}

function visiblePanels(el: HTMLElement): string[] {
  return Array.from(el.querySelectorAll(':scope > ty-tab'))
    .filter((t) => getComputedStyle(t).visibility === 'visible')
    .map((t) => t.id);
}

function carousel(el: HTMLElement): string {
  return (el.shadowRoot!.querySelector('.panels-wrapper') as HTMLElement).style.transform;
}

/** The tabpanel inside a ty-tab's shadow root. */
function panel(tab: Element): HTMLElement {
  return tab.shadowRoot!.querySelector('[role="tabpanel"]') as HTMLElement;
}

function panelName(tab: Element): string | null {
  return panel(tab).getAttribute('aria-label');
}

function selectedButton(el: HTMLElement): string | null {
  return el.shadowRoot!.querySelector('[aria-selected="true"]')?.getAttribute('data-tab-id') ?? null;
}

async function settle(): Promise<void> {
  await nextFrame();
  await nextFrame();
}

describe('ty-tabs survives server morphs', () => {
  it('a re-render without `active` keeps the tab the user picked', async () => {
    const el = await mount();
    click(el, 'b');
    const events = recordChanges(el);

    morph(el, SERVER);
    await settle();

    expect(el.activeTab).to.equal('b');
    expect(selectedButton(el)).to.equal('b');
    expect(visiblePanels(el)).to.deep.equal(['b']);
    expect(events, 'nothing changed, nothing fired').to.have.length(0);
  });

  it('a re-render keeps size and panel state: nothing lives in attributes the morph rewrites', async () => {
    const el = await mount();
    click(el, 'c');
    morph(el, SERVER);
    await settle();

    expect(el.getAttribute('style'), 'host style attribute').to.equal(null);
    expect(el.getBoundingClientRect().height).to.be.closeTo(300, 1);
    const wrapper = el.shadowRoot!.querySelector('.panels-wrapper') as HTMLElement;
    expect(wrapper.style.transform).to.equal('translateX(-200%)');
    expect(visiblePanels(el)).to.deep.equal(['c']);
    // Children keep exactly the server's attributes (+ the best-effort data-active hint).
    const attrs = Array.from(el.querySelector('#c')!.attributes).map((a) => a.name).sort();
    expect(attrs).to.deep.equal(['data-active', 'id', 'label'].filter((n) => attrs.includes(n)).sort());
    expect(attrs).to.not.include.members(['role', 'tabindex', 'style', 'aria-labelledby']);
  });

  it('a re-render with a different `active` switches and fires once', async () => {
    const el = await mount();
    click(el, 'b');
    const events = recordChanges(el);

    morph(el, SERVER.replace('<ty-tabs height="300px">', '<ty-tabs height="300px" active="c">'));
    await settle();

    expect(el.activeTab).to.equal('c');
    expect(visiblePanels(el)).to.deep.equal(['c']);
    expect(events.map((d) => `${d.previousId}->${d.activeId}`)).to.deep.equal(['b->c']);
  });

  it('adding a tab and activating it in one morph fires exactly one event', async () => {
    const el = await mount();
    const events = recordChanges(el);

    morph(el, `
      <ty-tabs height="300px" active="d">
        <ty-tab id="a" label="A">Panel A</ty-tab>
        <ty-tab id="b" label="B">Panel B</ty-tab>
        <ty-tab id="c" label="C">Panel C</ty-tab>
        <ty-tab id="d" label="D">Panel D</ty-tab>
      </ty-tabs>`);
    await settle();

    expect(events.map((d) => `${d.previousId}->${d.activeId}`)).to.deep.equal(['a->d']);
    expect(selectedButton(el)).to.equal('d');
    expect(visiblePanels(el)).to.deep.equal(['d']);
    expect((el.shadowRoot!.querySelector('.panels-wrapper') as HTMLElement).style.transform)
      .to.equal('translateX(-300%)');
  });

  it('removing the shown tab falls back to the first one, with no stale panel', async () => {
    const el = await mount();
    click(el, 'c');
    const events = recordChanges(el);

    morph(el, `
      <ty-tabs height="300px">
        <ty-tab id="a" label="A">Panel A</ty-tab>
        <ty-tab id="b" label="B">Panel B</ty-tab>
      </ty-tabs>`);
    await settle();

    expect(el.activeTab).to.equal('a');
    expect(visiblePanels(el)).to.deep.equal(['a']);
    expect(events).to.have.length(1);
    expect(events[0]).to.include({ activeId: 'a', previousId: null });
  });

  it('a tab inserted before the shown one keeps the carousel on it, without sliding', async () => {
    const el = await mount();
    click(el, 'b');
    const events = recordChanges(el);

    morph(el, SERVER.replace('<ty-tab id="a"', '<ty-tab id="z" label="Z">Panel Z</ty-tab><ty-tab id="a"'));
    await settle();

    expect(el.activeTab).to.equal('b');
    expect(carousel(el)).to.equal('translateX(-200%)');
    expect(visiblePanels(el)).to.deep.equal(['b']);
    expect(events).to.have.length(0);
  });

  it('removing a tab before the shown one, or reordering, keeps the carousel on it', async () => {
    const el = await mount();
    click(el, 'c');

    morph(el, SERVER.replace(/<ty-tab id="a"[^]*?<\/ty-tab>/, ''));
    await settle();
    expect(carousel(el), 'a removed').to.equal('translateX(-100%)');

    morph(el, `
      <ty-tabs height="300px">
        <ty-tab id="c" label="C">Panel C</ty-tab>
        <ty-tab id="b" label="B">Panel B</ty-tab>
      </ty-tabs>`);
    await settle();
    expect(carousel(el), 'reordered').to.equal('translateX(0%)');
    expect(visiblePanels(el)).to.deep.equal(['c']);
  });

  it('a label or disabled change in place updates the button and the panel name', async () => {
    const el = await mount();

    morph(el, SERVER.replace('label="B"', 'label="B (3)" disabled'));
    await settle();

    const button = el.shadowRoot!.querySelector('[data-tab-id="b"]') as HTMLButtonElement;
    expect(button.textContent!.trim()).to.equal('B (3)');
    expect(button.disabled).to.equal(true);
    expect(panelName(el.querySelector('#b')!)).to.equal('B (3)');
  });

  it('morphing a single panel keeps exactly one panel visible', async () => {
    const el = await mount();
    click(el, 'b');

    morph(el.querySelector('#b')!, '<ty-tab id="b" label="B">Fresh content for B</ty-tab>');
    morph(el.querySelector('#a')!, '<ty-tab id="a" label="A">Fresh content for A</ty-tab>');
    await settle();

    expect(visiblePanels(el)).to.deep.equal(['b']);
    expect(el.querySelector('#b')!.textContent).to.equal('Fresh content for B');
  });
});

describe('ty-tabs sizing', () => {
  it('the height attribute beats page CSS; without it page CSS wins', async () => {
    const style = document.createElement('style');
    style.textContent = 'ty-tabs.sized { height: 500px; }';
    document.head.append(style);
    try {
      const el = await mount(SERVER.replace('<ty-tabs ', '<ty-tabs class="sized" '));
      expect(el.getBoundingClientRect().height, 'attribute wins').to.be.closeTo(300, 1);

      el.removeAttribute('height');
      await settle();
      expect(el.getBoundingClientRect().height, 'page CSS wins').to.be.closeTo(500, 1);

      style.remove();
      await settle();
      expect(el.getBoundingClientRect().height, 'default').to.be.closeTo(400, 1);
    } finally {
      style.remove();
    }
  });

  it('width="50%" is half the container', async () => {
    const el = await mount(SERVER.replace('height="300px"', 'height="300px" width="50%"'));
    expect(el.getBoundingClientRect().width).to.be.closeTo(300, 1);
    const panel = el.querySelector('#a') as HTMLElement;
    expect(panel.getBoundingClientRect().width, 'one panel = one page').to.be.closeTo(300, 1);
  });
});

describe('ty-tabs change events', () => {
  it('no event for the initial tab', async () => {
    const events: any[] = [];
    const listener = (e: Event) => events.push((e as CustomEvent).detail);
    document.addEventListener('ty-tab-change', listener);
    try {
      await mount(SERVER.replace('<ty-tabs ', '<ty-tabs active="b" '));
      expect(events).to.have.length(0);
    } finally {
      document.removeEventListener('ty-tab-change', listener);
    }
  });

  it('a correction right after mount reports the tab that was showing and snaps', async () => {
    const host = await fixture(html`<div style="width: 600px"></div>`);
    host.innerHTML = SERVER;
    const el = host.firstElementChild as HTMLElement;
    el.setAttribute('active', 'c'); // same task as the mount — e.g. a framework applying state
    const events = recordChanges(el); // attached after: the external path is a microtask later
    await settle();

    expect(events.map((d) => `${d.previousId}->${d.activeId}`)).to.deep.equal(['a->c']);
    expect((el.shadowRoot!.querySelector('.panels-wrapper') as HTMLElement).style.transform)
      .to.equal('translateX(-200%)');
    expect(getComputedStyle(el.querySelector('#c')!).opacity, 'snapped, not fading in').to.equal('1');
  });

  it('a click bound to a signal is not reverted (Datastar data-attr + data-on)', async () => {
    const el = await mount();
    // data-on:ty-tab-change="$tab = evt.detail.activeId"
    let signal = 'a';
    el.addEventListener('ty-tab-change', (e) => { signal = (e as CustomEvent).detail.activeId; });
    // data-attr:active="$tab" — writes the signal back whenever the attribute drifts
    new MutationObserver(() => {
      if (el.getAttribute('active') !== signal) el.setAttribute('active', signal);
    }).observe(el, { attributes: true, attributeFilter: ['active'] });

    click(el, 'b');
    await settle();

    expect(signal).to.equal('b');
    expect(el.getAttribute('active')).to.equal('b');
    expect(el.activeTab).to.equal('b');
  });
});

describe('ty-tabs page load and accessibility', () => {
  it('`active` naming a tab the parser has not reached yet fires no event when it arrives', async () => {
    // A classic <script> in <head> upgrades ty-tabs before its children exist;
    // they then arrive one by one.
    const host = await fixture(html`<div style="width: 600px"></div>`);
    const el = document.createElement('ty-tabs');
    el.setAttribute('active', 'c');
    host.append(el);
    const events = recordChanges(el);
    for (const id of ['a', 'b', 'c']) {
      const tab = document.createElement('ty-tab');
      tab.id = id;
      tab.setAttribute('label', id.toUpperCase());
      el.append(tab);
      await Promise.resolve();
      await Promise.resolve();
    }
    await settle();

    expect((el as any).activeTab).to.equal('c');
    expect(events, 'still the initial tab').to.have.length(0);
  });

  it('panels are named after rich slot labels even when ty-tabs upgrades first', async () => {
    const el = await mount(`
      <ty-tabs height="300px">
        <span slot="label-a"><strong>Rich</strong> Alpha</span>
        <ty-tab id="a">Panel A</ty-tab>
        <ty-tab id="b" label="Plain B">Panel B</ty-tab>
      </ty-tabs>`);

    expect(panelName(el.querySelector('#a')!)).to.equal('Rich Alpha');
    expect(panelName(el.querySelector('#b')!)).to.equal('Plain B');
  });

  it('a leaving panel is inert right away, before its fade ends', async () => {
    const host = await fixture(html`<div style="width: 600px"></div>`);
    host.innerHTML = SERVER;
    const el = host.firstElementChild as HTMLElement;
    await settle();

    click(el, 'b');
    const a = el.querySelector('#a')!;
    expect(getComputedStyle(a).visibility, 'still fading out').to.equal('visible');
    expect((panel(a).parentElement as HTMLElement).inert, 'but inert').to.equal(true);
    expect((panel(el.querySelector('#b')!).parentElement as HTMLElement).inert).to.equal(false);
  });

  it('the "…" trigger sits outside the tablist', async () => {
    const tabs = Array.from({ length: 10 }, (_, i) => `<ty-tab id="t${i}" label="Section number ${i}">${i}</ty-tab>`).join('');
    const el = await mount(`<ty-tabs height="300px">${tabs}</ty-tabs>`);
    const tablist = el.shadowRoot!.querySelector('[role="tablist"]')!;
    expect(el.shadowRoot!.querySelector('.tab-overflow-trigger'), 'trigger shown').to.exist;
    expect(tablist.querySelector('.tab-overflow-trigger'), 'not inside the tablist').to.equal(null);
  });
});
