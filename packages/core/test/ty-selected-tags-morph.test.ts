/**
 * ty-selected-tags under server morphs (Datastar patch-elements, htmx/idiomorph).
 * The server's HTML has the <template> (or nothing) but never the chips, since
 * those are drawn in the browser. A morph strips them; they must come back.
 * The patch here reaches only the chips.
 */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/tag.js';
import '../lib/components/selected-tags.js';
import { morph } from './helpers/morph.js';

const picker = `
    <ty-select id="roles" multiple value="admin,editor">
      <ty-option value="admin">Admin</ty-option>
      <ty-option value="editor">Editor</ty-option>
      <ty-option value="viewer">Viewer</ty-option>
    </ty-select>`;

const DEFAULT_TAGS = `<ty-selected-tags for="roles"></ty-selected-tags>`;
const TEMPLATED_TAGS = `<ty-selected-tags for="roles"><template><span class="chip" data-value="{value}">{label}</span></template></ty-selected-tags>`;

const DEFAULT = `<div id="w">${picker}${DEFAULT_TAGS}</div>`;
const TEMPLATED = `<div id="w">${picker}${TEMPLATED_TAGS}</div>`;

async function mount(markup: string): Promise<HTMLElement> {
  const host = await fixture(html`<div></div>`);
  host.innerHTML = markup;
  await nextFrame();
  await nextFrame();
  return host.firstElementChild as HTMLElement;
}

const tags = (w: HTMLElement) => w.querySelector('ty-selected-tags')!;
const chipValues = (w: HTMLElement, sel: string, attr: string) =>
  Array.from(tags(w).querySelectorAll(sel)).map((c) => c.getAttribute(attr));

describe('ty-selected-tags — server morph', () => {
  it('default chips come back after a morph strips them', async () => {
    const w = await mount(DEFAULT);
    expect(chipValues(w, 'ty-tag', 'value')).to.deep.equal(['admin', 'editor']);

    morph(tags(w), DEFAULT_TAGS);
    await nextFrame();

    expect(chipValues(w, 'ty-tag', 'value')).to.deep.equal(['admin', 'editor']);
  });

  it('templated chips come back, and the template stays the only template', async () => {
    const w = await mount(TEMPLATED);
    const template = tags(w).querySelector('template');
    expect(chipValues(w, 'span.chip', 'data-value')).to.deep.equal(['admin', 'editor']);

    morph(tags(w), TEMPLATED_TAGS);
    await nextFrame();

    expect(chipValues(w, 'span.chip', 'data-value')).to.deep.equal(['admin', 'editor']);
    expect(tags(w).querySelectorAll(':scope > template')).to.have.length(1);
    expect(tags(w).querySelector('template')).to.equal(template);
  });

  it('settles: no further child writes once the chips are back', async () => {
    const w = await mount(DEFAULT);
    morph(tags(w), DEFAULT_TAGS);
    await nextFrame();

    let writes = 0;
    const mo = new MutationObserver((records) => { writes += records.length; });
    mo.observe(tags(w), { childList: true });
    await nextFrame();
    await nextFrame();
    mo.disconnect();

    expect(writes).to.equal(0);
  });
});
