import { fixture, html, expect, nextFrame, oneEvent } from '@open-wc/testing';
import '../lib/components/file-upload.js';

describe('ty-file-upload', () => {
  it('reflects accept and name', async () => {
    const el = (await fixture(html`<ty-file-upload name="docs" accept=".txt"></ty-file-upload>`)) as any;
    await nextFrame();
    expect(el.name).to.equal('docs');
    expect(el.accept).to.equal('.txt');
  });

  it('emits change with files and adds them to FormData', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form><ty-file-upload name="docs"></ty-file-upload></form>
    `));
    const el = form.querySelector('ty-file-upload') as any;
    await nextFrame();

    const input = el.shadowRoot.querySelector('.file-input') as HTMLInputElement;
    const file = new File(['hi'], 'note.txt', { type: 'text/plain' });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;

    const ev = oneEvent(el, 'change');
    input.dispatchEvent(new Event('change', { bubbles: true }));
    const e = (await ev) as CustomEvent;

    expect(e.detail.files.length).to.equal(1);
    expect(new FormData(form).getAll('docs').length).to.be.at.least(1);
  });
});
