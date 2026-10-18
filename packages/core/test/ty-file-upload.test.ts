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

describe('ty-file-upload placeholder', () => {
  const hint = (el: any) => el.shadowRoot.querySelector('.upload-hint') as HTMLElement;

  it('shows the placeholder as the drop-zone hint', async () => {
    const el = (await fixture(html`<ty-file-upload placeholder="Upload your CV (PDF)"></ty-file-upload>`)) as any;
    await nextFrame();
    expect(hint(el).textContent).to.equal('Upload your CV (PDF)');
  });

  it('keeps the default hint, with its browse link, when no placeholder is set', async () => {
    const el = (await fixture(html`<ty-file-upload></ty-file-upload>`)) as any;
    await nextFrame();
    expect(hint(el).textContent).to.equal('Drop files here or click to browse');
    expect(hint(el).querySelector('.browse-link')?.textContent).to.equal('click to browse');
  });

  it('renders the placeholder as text, not markup', async () => {
    const el = (await fixture(html`<ty-file-upload placeholder="<img src=x onerror=alert(1)> <b>PDF</b>"></ty-file-upload>`)) as any;
    await nextFrame();
    expect(hint(el).textContent).to.equal('<img src=x onerror=alert(1)> <b>PDF</b>');
    expect(hint(el).children.length).to.equal(0);
  });

  it('follows placeholder changes, and gives way to the selected-file count', async () => {
    const el = (await fixture(html`<ty-file-upload placeholder="First"></ty-file-upload>`)) as any;
    await nextFrame();
    el.placeholder = 'Second';
    await nextFrame();
    expect(hint(el).textContent).to.equal('Second');

    const input = el.shadowRoot.querySelector('.file-input') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.items.add(new File(['hi'], 'note.txt', { type: 'text/plain' }));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await nextFrame();
    expect(hint(el).textContent).to.equal('1 file selected');
  });
});
