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

  it('is also registered as ty-dialog (same behavior)', async () => {
    const el = (await fixture(html`<ty-dialog><p>Hi</p></ty-dialog>`)) as any;
    await nextFrame();
    el.setAttribute('open', 'true');
    await nextFrame();
    const dialog = el.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).to.equal(true);
  });
});
