/**
 * ty-select under server morphs (Datastar patch-elements, htmx/idiomorph).
 * `value` is the only input and the select writes nothing else the server
 * owns: what the server renders is what the select shows.
 */
import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import { TySelect } from '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/tag.js';
import '../lib/components/selected-tags.js';
import { morph } from './helpers/morph.js';

const tick = async () => { await nextFrame(); await nextFrame(); };

const form = (select: string) => `
  <form id="f">
    ${select}
    <ty-selected-options for="roles"></ty-selected-options>
  </form>`;

const roles = (value?: string, options = ['admin', 'editor', 'viewer']) => `
  <ty-select id="roles" name="roles" multiple${value === undefined ? '' : ` value="${value}"`}>
    ${options.map((o) => `<ty-option value="${o}">${o[0].toUpperCase()}${o.slice(1)}</ty-option>`).join('')}
  </ty-select>`;

async function mount(markup: string): Promise<HTMLFormElement> {
  const host = await fixture(html`<div></div>`);
  host.innerHTML = markup;
  await tick();
  return host.querySelector('form')!;
}

const select = (f: Element) => f.querySelector('ty-select') as any;
const checked = (f: Element) =>
  Array.from(f.querySelectorAll('ty-option'))
    .filter((o: any) => o.checked)
    .map((o) => o.getAttribute('value'));
const chips = (f: Element) =>
  Array.from(f.querySelectorAll('ty-selected-options ty-tag')).map((t) => t.getAttribute('value'));
const submitted = (f: HTMLFormElement) => new FormData(f).getAll('roles');

async function pick(f: Element, value: string): Promise<void> {
  const el = select(f);
  setTimeout(() => (el.querySelector(`ty-option[value="${value}"]`) as HTMLElement).click());
  await oneEvent(el, 'change');
  await tick();
}

describe('ty-select — server morph', () => {
  it('the same server HTML changes nothing: value, checks, aria, chips, form data', async () => {
    const markup = form(roles('admin,editor'));
    const f = await mount(markup);
    morph(f, markup);
    await tick();

    expect(select(f).value).to.equal('admin,editor');
    expect(checked(f)).to.deep.equal(['admin', 'editor']);
    expect((f.querySelector('ty-option[value="editor"]') as any)._internals.ariaSelected).to.equal('true');
    expect(chips(f)).to.deep.equal(['admin', 'editor']);
    expect(submitted(f)).to.deep.equal(['admin', 'editor']);
  });

  it('a different server value wins over the user\'s pick', async () => {
    const markup = form(roles('admin'));
    const f = await mount(markup);
    await pick(f, 'viewer');
    expect(select(f).value).to.equal('admin,viewer');

    morph(f, markup); // the server never saw the pick
    await tick();

    expect(select(f).value).to.equal('admin');
    expect(checked(f)).to.deep.equal(['admin']);
    expect(chips(f)).to.deep.equal(['admin']);
  });

  it('the server rendering the pick keeps it', async () => {
    const f = await mount(form(roles('admin')));
    await pick(f, 'viewer');

    morph(f, form(roles('admin,viewer')));
    await tick();

    expect(select(f).value).to.equal('admin,viewer');
    expect(checked(f)).to.deep.equal(['admin', 'viewer']);
  });

  it('no value from the server means no selection', async () => {
    const f = await mount(form(roles('admin,editor')));
    morph(f, form(roles()));
    await tick();

    expect(select(f).value).to.equal('');
    expect(checked(f)).to.deep.equal([]);
    expect(chips(f)).to.deep.equal([]);
    expect(submitted(f)).to.deep.equal([]);
  });

  it('dependent select: new options and no value clear the old pick', async () => {
    const city = (value?: string, options = ['zagreb', 'split']) => `
      <form id="f">
        <ty-select id="city" name="city"${value === undefined ? '' : ` value="${value}"`}>
          ${options.map((o) => `<ty-option value="${o}">${o}</ty-option>`).join('')}
        </ty-select>
      </form>`;
    const f = await mount(city());
    const el = f.querySelector('ty-select') as any;
    setTimeout(() => (el.querySelector('ty-option[value="zagreb"]') as HTMLElement).click());
    await oneEvent(el, 'change');
    await tick();
    expect(el.value).to.equal('zagreb');

    morph(f, city(undefined, ['vienna', 'graz'])); // country changed
    await tick();

    expect(el.value).to.equal('');
    expect(new FormData(f).get('city')).to.equal('');
    expect(el.shadowRoot.querySelector('slot[name="selected"]').assignedElements()).to.deep.equal([]);
  });

  it('single select: the trigger keeps showing the option through a morph', async () => {
    const markup = `<form id="f"><ty-select name="robot" value="eywa"><ty-option value="bobo">Bobo</ty-option><ty-option value="eywa">EYWA</ty-option></ty-select></form>`;
    const f = await mount(markup);
    morph(f, markup);
    await tick();

    const el = select(f);
    expect(el.value).to.equal('eywa');
    const slotted = el.shadowRoot.querySelector('slot[name="selected"]').assignedElements();
    expect(slotted.map((o: Element) => o.textContent)).to.deep.equal(['EYWA']);
  });

  it('a slotted trigger keeps its has-trigger sizing through a morph', async () => {
    const markup = `<form id="f"><ty-select value="a"><button slot="trigger">Pick</button><ty-option value="a">A</ty-option></ty-select></form>`;
    const f = await mount(markup);
    expect(select(f).hasAttribute('has-trigger')).to.be.true;
    morph(f, markup);
    await tick();
    expect(select(f).hasAttribute('has-trigger')).to.be.true;
  });

  it('renamed options relabel the trigger and the chips', async () => {
    const f = await mount(form(roles('admin')));
    morph(f, form(roles('admin').replace('>Admin<', '>Administrator<')));
    await tick();

    const placeholder = select(f).shadowRoot.querySelector('.dropdown-placeholder') as HTMLElement;
    expect(placeholder.textContent).to.equal('Administrator');
    expect((f.querySelector('ty-selected-options ty-tag') as HTMLElement).textContent).to.equal('Administrator');
  });
});

describe('ty-select — external-selection', () => {
  const external = (marked: string[]) => `
    <ty-select multiple external-selection name="tags">
      ${['a', 'b', 'c'].map((v) => `<ty-option value="${v}"${marked.includes(v) ? ' selected' : ''}>${v.toUpperCase()}</ty-option>`).join('')}
    </ty-select>`;

  it('draws the app\'s marks and holds no selection of its own', async () => {
    const host = await fixture(html`<form></form>`) as HTMLFormElement;
    host.innerHTML = external(['b']);
    await tick();
    const el = host.querySelector('ty-select') as any;

    expect(checked(host)).to.deep.equal(['b']);
    expect(el.value).to.equal('');
    expect(new FormData(host).has('tags'), 'the app submits its own selection').to.be.false;
    const placeholder = el.shadowRoot.querySelector('.dropdown-placeholder') as HTMLElement;
    expect(placeholder.classList.contains('placeholder-shown')).to.be.true;
  });

  it('a pick reports { value, selected } and changes nothing', async () => {
    const host = await fixture(html`<div></div>`);
    host.innerHTML = external(['b']);
    await tick();
    const el = host.querySelector('ty-select') as any;

    setTimeout(() => (el.querySelector('ty-option[value="a"]') as HTMLElement).click());
    let ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail).to.include({ value: 'a', selected: true, action: 'add' });

    setTimeout(() => (el.querySelector('ty-option[value="b"]') as HTMLElement).click());
    ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail).to.include({ value: 'b', selected: false, action: 'remove' });

    await tick();
    expect(checked(host), 'only the app moves the marks').to.deep.equal(['b']);
  });

  it('follows the app\'s marks: attribute, property (React 19) or morph', async () => {
    const host = await fixture(html`<div></div>`);
    host.innerHTML = external(['b']);
    await tick();

    (host.querySelector('ty-option[value="a"]') as any).selected = true;
    await tick();
    expect(checked(host)).to.deep.equal(['a', 'b']);

    host.querySelector('ty-option[value="b"]')!.removeAttribute('selected');
    await tick();
    expect(checked(host)).to.deep.equal(['a']);

    morph(host.querySelector('ty-select')!, external(['c']));
    await tick();
    expect(checked(host)).to.deep.equal(['c']);
  });
});

describe('ty-select — fixed along the way', () => {
  it('change detail.values keep click order, like .value', async () => {
    const el = (await fixture(html`
      <ty-select multiple><ty-option value="a">A</ty-option><ty-option value="b">B</ty-option></ty-select>
    `)) as any;
    await tick();
    setTimeout(() => (el.querySelector('ty-option[value="b"]') as HTMLElement).click());
    await oneEvent(el, 'change');
    setTimeout(() => (el.querySelector('ty-option[value="a"]') as HTMLElement).click());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.values).to.deep.equal(['b', 'a']);
    expect(el.value).to.equal('b,a');
  });

  it('external-search="false" is off, like every boolean attribute here', async () => {
    const el = (await fixture(html`<ty-select external-search="false"></ty-select>`)) as any;
    expect(el.externalSearch).to.be.false;
  });

  it('form.reset() restores the declared value after picks', async () => {
    const f = await mount(form(roles('admin')));
    await pick(f, 'viewer');
    f.reset();
    await tick();
    expect(select(f).value).to.equal('admin');
    expect(checked(f)).to.deep.equal(['admin']);
  });

  it('form.reset() goes back to the latest server value, not the first load', async () => {
    const f = await mount(form(roles('admin')));
    morph(f, form(roles('editor'))); // the server saved editor
    await tick();
    await pick(f, 'viewer'); // unsaved
    f.reset();
    await tick();
    expect(select(f).value).to.equal('editor');
  });

  it('form.reset() ignores the select reflecting a pick (that is the user\'s edit)', async () => {
    const f = await mount(form(roles('admin')));
    await pick(f, 'viewer');
    expect(select(f).getAttribute('value')).to.equal('admin,viewer');
    f.reset();
    await tick();
    expect(select(f).value).to.equal('admin');
  });

  it('chips follow a value set from code', async () => {
    const f = await mount(form(roles('admin')));
    select(f).value = 'editor,viewer';
    await tick();
    expect(chips(f)).to.deep.equal(['editor', 'viewer']);
  });

  it('chips relabel when the options arrive after the value', async () => {
    const f = await mount(`<form><ty-select id="roles" multiple value="hr,de"></ty-select><ty-selected-options for="roles"></ty-selected-options></form>`);
    expect(Array.from(f.querySelectorAll('ty-tag')).map((t) => t.textContent)).to.deep.equal(['hr', 'de']);

    select(f).innerHTML = `<ty-option value="hr">Croatia</ty-option><ty-option value="de">Germany</ty-option>`;
    await tick();
    expect(Array.from(f.querySelectorAll('ty-tag')).map((t) => t.textContent)).to.deep.equal(['Croatia', 'Germany']);
  });

  it('chips appear when the select is defined after them', async () => {
    const name = `ty-select-late-${Date.now()}`;
    const f = await mount(`<form><${name} id="late" multiple value="a,b"><ty-option value="a">A</ty-option><ty-option value="b">B</ty-option></${name}><ty-selected-options for="late"></ty-selected-options></form>`);
    expect(chips(f)).to.deep.equal([]);
    customElements.define(name, class extends TySelect {});
    await tick();
    expect(chips(f)).to.deep.equal(['a', 'b']);
  });

  it('an option with value="" is the empty choice, not its text', async () => {
    const el = (await fixture(html`
      <ty-select value="a"><ty-option value="">Any</ty-option><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    setTimeout(() => (el.querySelector('ty-option[value=""]') as HTMLElement).click());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.value).to.equal('');
    expect(el.value).to.equal('');
  });
});

describe('ty-select — options change while the list is open', () => {
  const nine = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota'];
  const markup = `<div><ty-select>${nine.map((v) => `<ty-option value="${v}">${v}</ty-option>`).join('')}</ty-select></div>`;
  const shown = (el: Element) =>
    Array.from(el.querySelectorAll('ty-option')).filter((o) => !o.hasAttribute('filtered-out')).map((o) => o.getAttribute('value'));

  it('a morph keeps the search filter', async () => {
    const host = await fixture(html`<div></div>`);
    host.innerHTML = markup;
    await tick();
    const el = host.querySelector('ty-select') as any;
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
    const input = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    input.value = 'eta';
    input.dispatchEvent(new Event('input'));
    expect(shown(el)).to.deep.equal(['beta', 'zeta', 'eta', 'theta']);

    morph(host.firstElementChild!, markup);
    await tick();
    expect(shown(el)).to.deep.equal(['beta', 'zeta', 'eta', 'theta']);
  });

  it('external-search: the keyboard walks the swapped-in options', async () => {
    const el = (await fixture(html`
      <ty-select external-search><ty-option value="x1">X1</ty-option><ty-option value="x2">X2</ty-option></ty-select>
    `)) as any;
    await tick();
    el.addEventListener('search', (e: CustomEvent) => {
      if (e.detail.query) el.innerHTML = `<ty-option value="r1">R1</ty-option><ty-option value="r2">R2</ty-option>`;
    });
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
    const input = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    input.value = 'r';
    input.dispatchEvent(new Event('input'));
    await tick();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    setTimeout(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true })));
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.value).to.equal('r1');
  });
});

describe('ty-select — external-selection marks follow boolean-attribute rules', () => {
  it('selected="false" is not a mark (React 18, Reagent)', async () => {
    const host = await fixture(html`<div></div>`);
    host.innerHTML = `<ty-select multiple external-selection><ty-option value="a" selected="false">A</ty-option><ty-option value="b" selected>B</ty-option></ty-select>`;
    await tick();
    expect(checked(host)).to.deep.equal(['b']);
    expect((host.querySelector('ty-option[value="a"]') as any).selected).to.be.false;
  });
});

