import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/modal.js';
import '../lib/components/select.js';
import '../lib/components/option.js';

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

  it('honours close-on-escape="false" against the native dialog cancel', async () => {
    const el = (await fixture(html`<ty-modal open close-on-escape="false"><p>Hi</p></ty-modal>`)) as any;
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

    el.closeOnEscape = false;      // boolean, not string
    el.closeOnOutsideClick = false;
    await nextFrame();

    expect(el.getAttribute('close-on-escape')).to.equal('false');
    expect(el.closeOnEscape).to.equal(false);
    expect(el.closeOnOutsideClick).to.equal(false);

    // ESC (native cancel) must not close it now
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await nextFrame();
    expect(dialog.open).to.be.true;

    el.remove();
  });

  it('prevent-escape / prevent-outside-click presence booleans, winning over close-on-*', async () => {
    const el = (await fixture(html`
      <ty-modal prevent-escape close-on-escape="true"><div>x</div></ty-modal>
    `)) as any;
    await nextFrame();
    // prevent-* wins over the legacy attribute
    expect(el.closeOnEscape).to.equal(false);
    expect(el.closeOnOutsideClick).to.equal(true);

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
    expect(el.closeOnEscape).to.equal(true);
    el.preventOutsideClick = true;
    expect(el.getAttribute('prevent-outside-click')).to.equal('');
    expect(el.closeOnOutsideClick).to.equal(false);
  });
});
