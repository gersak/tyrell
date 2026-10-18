import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { TyModal } from '../lib/components/modal.js';
import '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/popup.js';
import { getActiveLocks } from '../lib/utils/scroll-lock.js';

describe('ty-modal', () => {
  it('opens the internal <dialog> when the open attribute is set', async () => {
    const el = (await fixture(html`<ty-modal><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();

    el.setAttribute('open', 'true');
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog, 'internal dialog').to.exist;
    expect(dialog.open).to.equal(true);
  });

  it('no-backdrop turns the backdrop off; noBackdrop mirrors it', async () => {
    const el = (await fixture(html`<ty-modal no-backdrop open><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.hasAttribute('data-backdrop'), 'no-backdrop').to.equal(false);
    expect(el.noBackdrop).to.equal(true);

    el.removeAttribute('no-backdrop'); // what Replicant/Datastar do with `false`
    await nextFrame();
    expect(dialog.getAttribute('data-backdrop'), 'attribute gone: backdrop on').to.equal('true');

    el.noBackdrop = true;
    await nextFrame();
    expect(el.hasAttribute('no-backdrop')).to.equal(true);
    expect(dialog.hasAttribute('data-backdrop')).to.equal(false);
    el.noBackdrop = false;
    await nextFrame();
    expect(el.hasAttribute('no-backdrop')).to.equal(false);
    expect(dialog.getAttribute('data-backdrop')).to.equal('true');
  });

  it('zooms the page by default; no-zoom (and noZoom) keeps it still', async () => {
    const zoomed = () => document.documentElement.classList.contains('ty-modal-zoom');
    const el = (await fixture(html`<ty-modal open><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();
    expect(zoomed(), 'default').to.equal(true);

    el.noZoom = true; // flips while open
    await nextFrame();
    expect(el.getAttribute('no-zoom')).to.equal('');
    expect(zoomed(), 'no-zoom').to.equal(false);

    el.noZoom = false;
    await nextFrame();
    expect(zoomed(), 'no-zoom removed').to.equal(true);

    el.hide({ force: true });
    await nextFrame();
    expect(zoomed(), 'closed').to.equal(false);

    const still = (await fixture(html`<ty-modal no-zoom open><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();
    expect(zoomed(), 'opened with no-zoom').to.equal(false);
    still.hide({ force: true });
  });

  // no-backdrop is a modal without the dim: in the top layer like any other,
  // a transparent ::backdrop, and it never zooms the page.
  it('no-backdrop is a modal: top layer, transparent backdrop, no zoom', async () => {
    const zoomed = () => document.documentElement.classList.contains('ty-modal-zoom');
    const el = (await fixture(html`<ty-modal no-backdrop open><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.matches(':modal'), 'modal').to.equal(true);
    const backdrop = getComputedStyle(dialog, '::backdrop');
    expect(backdrop.backgroundColor).to.equal('rgba(0, 0, 0, 0)');
    expect(backdrop.backdropFilter).to.equal('none');
    expect(zoomed(), 'no zoom').to.equal(false);
    el.hide({ force: true });
  });

  it('zoom follows the backdrop modals open, nested either way', async () => {
    const zoomed = () => document.documentElement.classList.contains('ty-modal-zoom');
    const wrap = (await fixture(html`<div></div>`)) as HTMLElement;
    wrap.innerHTML = `
      <ty-modal id="nb" no-backdrop><p>nb</p><ty-modal id="bd-in"><p>in</p></ty-modal></ty-modal>
      <ty-modal id="bd"><p>bd</p><ty-modal id="nb-in" no-backdrop><p>in</p></ty-modal></ty-modal>`;
    const [nb, bdIn, bd, nbIn] = ['nb', 'bd-in', 'bd', 'nb-in'].map((id) => wrap.querySelector(`#${id}`) as any);

    nb.show();
    await nextFrame();
    expect(zoomed(), 'no-backdrop').to.equal(false);
    bdIn.show();
    await nextFrame();
    expect(zoomed(), 'a backdrop modal over a no-backdrop one').to.equal(true);
    bdIn.hide({ force: true });
    await nextFrame();
    expect(zoomed(), 'back to the no-backdrop one').to.equal(false);
    nb.hide({ force: true });
    await nextFrame();

    bd.show();
    await nextFrame();
    expect(zoomed(), 'backdrop').to.equal(true);
    nbIn.show();
    await nextFrame();
    expect(zoomed(), 'no-backdrop inside a backdrop modal').to.equal(true);
    bd.hide({ force: true });
    await nextFrame();
    expect(zoomed(), 'all closed').to.equal(false);
  });

  // Focus on <body> (after a backdrop click, a blur): the dialog's keydown
  // handler never sees Escape, and a second native close request can't be
  // cancelled — the top modal decides at the document.
  for (const attrs of ['', 'no-backdrop']) {
    it(`Escape with focus on the body goes to the top modal${attrs ? ` (${attrs})` : ''}`, async () => {
      const wrap = (await fixture(html`<div></div>`)) as HTMLElement;
      wrap.innerHTML = `<ty-modal id="o" open ${attrs}><p>o</p><ty-modal id="i" ${attrs}><p>i</p></ty-modal></ty-modal>`;
      await nextFrame();
      const outer = wrap.querySelector('#o') as any;
      const inner = wrap.querySelector('#i') as any;
      inner.show();
      await nextFrame();
      const escape = () => {
        const e = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
        document.body.dispatchEvent(e);
        return e.defaultPrevented;
      };
      let reason: string | undefined;
      inner.addEventListener('close', (e: CustomEvent) => { reason = e.detail.reason; });

      inner.preventEscape = true;
      expect(escape(), 'consumed').to.equal(true);
      expect(escape(), 'again').to.equal(true);
      expect([outer.open, inner.open], 'prevent-escape holds').to.deep.equal([true, true]);

      inner.preventEscape = false;
      expect(escape()).to.equal(true);
      expect([outer.open, inner.open], 'the top one closes').to.deep.equal([true, false]);
      expect(reason).to.equal('escape');
      escape();
      expect(outer.open, 'then the one below').to.equal(false);
      expect(escape(), 'none open: left alone').to.equal(false);
    });
  }

  it('tolerates the open attribute being set before insertion into the document', async () => {
    // React sets initial attributes BEFORE appending the element (conditional
    // mount of an already-open modal). showModal() on a disconnected <dialog>
    // throws InvalidStateError — attributeChangedCallback must defer to
    // connectedCallback.
    const el = document.createElement('ty-modal') as any;
    el.setAttribute('open', 'true'); // must not throw here
    document.body.appendChild(el);
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog, 'internal dialog').to.exist;
    expect(dialog.open).to.equal(true);
    el.remove();
  });

  it('is also registered as ty-dialog (same behavior)', async () => {
    const el = (await fixture(html`<ty-dialog><p>Hi</p></ty-dialog>`)) as any;
    await nextFrame();
    el.setAttribute('open', 'true');
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).to.equal(true);
  });
});

describe('ty-modal accessible name', () => {
  it('label attribute sets aria-label on the internal dialog', async () => {
    const el = (await fixture(html`<ty-modal label="Confirm delete"><p>Are you sure?</p></ty-modal>`)) as any;
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('aria-label')).to.equal('Confirm delete');
  });

  it('without label, aria-label is absent (no regression, just no fix without opting in)', async () => {
    const el = (await fixture(html`<ty-modal><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.hasAttribute('aria-label')).to.be.false;
  });

  it('label updates live if changed after mount', async () => {
    const el = (await fixture(html`<ty-modal label="First"><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();
    el.setAttribute('label', 'Second');
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('aria-label')).to.equal('Second');
  });
});

describe('ty-modal + nested popups (issue: select closes the modal)', () => {
  it('does not fire close when a ty-select inside it opens/closes its dropdown', async () => {
    const el = (await fixture(html`
      <ty-modal open>
        <ty-select id="s"><ty-option value="a">A</ty-option></ty-select>
      </ty-modal>
    `)) as any;
    await nextFrame();

    let closes = 0;
    el.addEventListener('close', () => closes++);

    const select = el.querySelector('ty-select') as any;
    const stub = select.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();            // open dropdown
    await nextFrame();
    (el.querySelector('ty-option[value="a"]') as HTMLElement).click(); // select -> closes dropdown
    await nextFrame();

    expect(closes, 'modal close listener must not see the select close').to.equal(0);
    expect(el.hasAttribute('open'), 'modal still open').to.be.true;
    el.remove();
  });

  it('honours prevent-escape against the native dialog cancel', async () => {
    const el = (await fixture(html`<ty-modal open prevent-escape><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();

    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    // ESC on a showModal() dialog arrives as `cancel`, not our keydown handler
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await nextFrame();

    expect(dialog.open, 'stays open').to.be.true;
    expect(el.hasAttribute('open')).to.be.true;
    el.remove();
  });
});

describe('ty-modal close reason + nesting', () => {
  it('reports the real reason on close, not just "programmatic"', async () => {
    const el = (await fixture(html`<ty-modal open><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();

    let reason: string | undefined;
    el.addEventListener('close', (e: CustomEvent) => { reason = e.detail.reason; });

    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    dialog.click(); // target === dialog -> backdrop click
    await nextFrame();

    expect(reason, 'close detail carries the same reason as beforeclose').to.equal('backdrop');
    el.remove();
  });

  it('a modal inside a modal does not close its parent', async () => {
    const el = (await fixture(html`
      <ty-modal open id="outer">
        <div>
          <ty-modal id="inner"><p>Confirm?</p></ty-modal>
        </div>
      </ty-modal>
    `)) as any;
    await nextFrame();

    let outerCloses = 0;
    el.addEventListener('close', () => outerCloses++);

    const inner = el.querySelector('#inner') as any;
    inner.show();
    await nextFrame();
    inner.hide();
    await nextFrame();

    expect(outerCloses, 'inner close must not reach the outer modal').to.equal(0);
    expect(el.hasAttribute('open'), 'outer still open').to.be.true;
    el.remove();
  });
});

describe('ty-modal boolean property binding', () => {
  it('accepts real booleans via properties (framework property binding)', async () => {
    const el = (await fixture(html`<ty-modal open><p>Hi</p></ty-modal>`)) as any;
    await nextFrame();

    el.preventEscape = true;      // boolean, not string
    el.preventOutsideClick = true;
    await nextFrame();

    expect(el.getAttribute('prevent-escape')).to.equal('');
    expect(el.getAttribute('prevent-outside-click')).to.equal('');

    // ESC (native cancel) must not close it now
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await nextFrame();
    expect(dialog.open).to.be.true;

    el.remove();
  });

  it('prevent-escape / prevent-outside-click presence booleans; close-on-* is gone', async () => {
    const el = (await fixture(html`
      <ty-modal prevent-escape close-on-outside-click="false"><div>x</div></ty-modal>
    `)) as any;
    await nextFrame();
    expect(el.preventEscape).to.equal(true);
    expect(el.preventOutsideClick, 'close-on-outside-click="false" no longer does anything').to.equal(false);

    // ESC (cancel) must be swallowed
    el.setAttribute('open', 'true');
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await nextFrame();
    expect(el.hasAttribute('open'), 'prevent-escape keeps it open').to.equal(true);

    // property mirrors behave like native disabled: true sets, false removes
    el.preventEscape = false;
    expect(el.hasAttribute('prevent-escape')).to.equal(false);
    el.preventOutsideClick = true;
    expect(el.getAttribute('prevent-outside-click')).to.equal('');
  });
});

describe('ty-modal + a popup open inside it (Escape, close order, scroll lock)', () => {
  const escape = (target: Element) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true }));
  const mount = async (attrs = '') => {
    const wrap = await fixture(html`<div></div>`);
    wrap.innerHTML = `
      <ty-modal open ${attrs}>
        <ty-select id="inside"><ty-option value="a">A</ty-option><ty-option value="b">B</ty-option></ty-select>
      </ty-modal>`;
    await nextFrame();
    const modal = wrap.querySelector('ty-modal') as any;
    const select = wrap.querySelector('ty-select') as any;
    (select.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await nextFrame();
    const list = select.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(list.open, 'list open').to.equal(true);
    return { modal, select, list };
  };
  const selectLocks = () => Array.from(getActiveLocks()).filter((id) => id.startsWith('select-inside-'));

  for (const attrs of ['', 'prevent-outside-click', 'prevent-escape']) {
    it(`Escape from the open list closes the list, not the modal${attrs ? ` (${attrs})` : ''}`, async () => {
      const { modal, select, list } = await mount(attrs);
      let closes = 0;
      modal.addEventListener('close', () => closes++);

      escape(list);
      await nextFrame();
      expect(list.open, 'list closed').to.equal(false);
      expect(modal.hasAttribute('open'), 'modal stays open').to.equal(true);
      expect(closes).to.equal(0);
      expect(selectLocks()).to.deep.equal([]);

      // next Escape comes from the trigger — the modal's own now
      escape(select.shadowRoot.querySelector('.select-stub'));
      await nextFrame();
      expect(modal.hasAttribute('open'), 'second Escape is the modal\'s').to.equal(attrs === 'prevent-escape');
      modal.hide({ force: true });
    });
  }

  it('closing the modal closes a list still open inside it and releases its lock', async () => {
    const { modal, select, list } = await mount();
    modal.hide();
    // no waiting for the list's async `close` event
    await Promise.resolve();
    expect(list.open).to.equal(false);
    expect(select.shadowRoot.querySelector('.select-stub').getAttribute('aria-expanded')).to.equal('false');
    expect(selectLocks()).to.deep.equal([]);
    expect(getActiveLocks().size, 'no lock left at all').to.equal(0);
  });

  for (const attrs of ['', 'no-backdrop']) {
    it(`closing the modal closes a nested ty-modal${attrs ? ` (${attrs})` : ''} and releases its lock`, async () => {
      const outer = (await fixture(html`<div></div>`)) as HTMLElement;
      outer.innerHTML = `
        <ty-modal open>
          <ty-modal id="nested" ${attrs}><p>inner</p></ty-modal>
        </ty-modal>`;
      await nextFrame();
      const modal = outer.querySelector('ty-modal') as any;
      const nested = outer.querySelector('#nested') as any;
      nested.show();
      await nextFrame();
      expect(getActiveLocks().size, 'both lock').to.equal(2);

      let reason: string | undefined;
      nested.addEventListener('close', (e: CustomEvent) => { e.stopPropagation(); reason = e.detail.reason; });
      modal.hide();
      await Promise.resolve();
      expect(nested.open, 'nested closed').to.equal(false);
      expect((nested.shadowRoot.querySelector('dialog') as HTMLDialogElement).open).to.equal(false);
      expect(reason, 'it fired its own close').to.equal('programmatic');
      expect(getActiveLocks().size, 'no lock left').to.equal(0);
    });
  }

  it('a ty-select in a ty-popup in the modal: keys and Escape go to the list first', async () => {
    const wrap = (await fixture(html`<div></div>`)) as HTMLElement;
    wrap.innerHTML = `
      <ty-modal open>
        <span id="anchor" tabindex="0">Open
          <ty-popup><div><ty-select id="deep"><ty-option value="a">A</ty-option><ty-option value="b">B</ty-option></ty-select></div></ty-popup>
        </span>
      </ty-modal>`;
    await nextFrame();
    const modal = wrap.querySelector('ty-modal') as any;
    const popup = wrap.querySelector('ty-popup') as any;
    const select = wrap.querySelector('ty-select') as any;
    popup.openPopup();
    await nextFrame();
    const popupDialog = popup.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    const open = async () => {
      (select.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
      await nextFrame();
      return select.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    };
    const key = (t: Element, k: string) =>
      t.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true }));

    let list = await open();
    key(list, 'ArrowDown');
    key(list, 'Enter');
    await nextFrame();
    expect(select.value).to.equal('a');

    list = await open();
    escape(list);
    await nextFrame();
    expect(list.open, 'list closed').to.equal(false);
    expect(popupDialog.open, 'popup stays open').to.equal(true);
    expect(modal.hasAttribute('open'), 'modal stays open').to.equal(true);

    modal.hide({ force: true });
    await Promise.resolve();
    expect(popupDialog.open, 'popup closed with the modal').to.equal(false);
  });

  it('removing the modal with the list open releases every lock', async () => {
    const { modal } = await mount();
    modal.remove();
    await nextFrame();
    expect(getActiveLocks().size).to.equal(0);
  });

  // A framework moving an open modal (keyed reorder, keep-alive). Removed, its
  // dialog left the top layer but stayed open, and so did the popup's: put
  // back, the modal skipped showModal() — non-modal, no backdrop, no lock.
  it('removed with a popup open and put back: modal and locked again, the popup closed', async () => {
    const wrap = (await fixture(html`<div></div>`)) as HTMLElement;
    wrap.innerHTML = `<ty-modal open><span tabindex="0">menu<ty-popup><p>x</p></ty-popup></span></ty-modal>`;
    await nextFrame();
    const modal = wrap.querySelector('ty-modal') as any;
    const popup = wrap.querySelector('ty-popup') as any;
    const dialog = modal.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    const popupDialog = popup.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    popup.openPopup();
    await new Promise((r) => setTimeout(r, 120));
    const events: string[] = [];
    for (const type of ['open', 'close']) modal.addEventListener(type, () => events.push(type));

    modal.remove();
    await nextFrame();
    expect(popupDialog.open, 'popup closed').to.equal(false);
    expect(dialog.open, 'dialog closed').to.equal(false);
    expect(getActiveLocks().size, 'no lock').to.equal(0);
    expect(modal.hasAttribute('open'), 'still open for its owner').to.equal(true);

    wrap.append(modal);
    await nextFrame();
    expect(dialog.matches(':modal'), 'modal again').to.equal(true);
    expect(getActiveLocks().size, 'locked again').to.equal(1);
    expect(document.documentElement.classList.contains('ty-modal-zoom')).to.equal(true);

    // in one task: the removal's close event comes after it is shown again
    modal.remove();
    wrap.append(modal);
    await nextFrame();
    expect(dialog.matches(':modal')).to.equal(true);
    expect(modal.hasAttribute('open')).to.equal(true);
    expect(getActiveLocks().size).to.equal(1);
    expect(events, 'a move, not a close and an open').to.deep.equal([]);

    modal.hide();
    await nextFrame();
    expect(events).to.deep.equal(['close']);
    expect(getActiveLocks().size).to.equal(0);
  });
});

// A framework setting properties before the definition loads leaves own data
// properties that shadow the accessors; connecting runs them through the setters.
describe('ty-modal — properties set before the element upgrades', () => {
  let n = 0;
  const tag = () => `ty-modal-upgrade-${++n}`;
  const hasOwn = (el: object, p: string) => Object.prototype.hasOwnProperty.call(el, p);

  it('open = true set early opens it; later assignments reach the setters', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.open = true;
    el.preventEscape = true;
    el.noZoom = true;
    el.append(Object.assign(document.createElement('p'), { textContent: 'early' }));
    document.body.append(el);
    customElements.define(name, class extends TyModal {});
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open, 'opened').to.equal(true);
    expect(el.hasAttribute('prevent-escape')).to.equal(true);
    expect(el.hasAttribute('no-zoom')).to.equal(true);
    for (const p of ['open', 'preventEscape', 'noZoom']) {
      expect(hasOwn(el, p), `no own ${p} left`).to.equal(false);
    }

    el.open = false;
    await nextFrame();
    expect(dialog.open, 'closed through the setter').to.equal(false);
    expect(getActiveLocks().size, 'lock released').to.equal(0);
    el.remove();
  });
});
