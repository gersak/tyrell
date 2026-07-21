import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/modal.js';

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
