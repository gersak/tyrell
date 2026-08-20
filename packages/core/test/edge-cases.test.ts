/**
 * Edge-case regression suite (from the 2026-08-19 coverage audit).
 *
 * Originally written as failing findings against native-fidelity gaps in
 * form reset, accept filtering, and template stamping — the fixes landed the
 * same day; these now pin that behavior.
 */
import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/checkbox.js';
import '../lib/components/switch.js';
import '../lib/components/input.js';
import '../lib/components/radio.js';
import '../lib/components/file-upload.js';
import '../lib/components/select.js';
import '../lib/components/option.js';
import '../lib/components/selected-tags.js';
import '../lib/components/tag.js';
import '../lib/components/modal.js';
import { parseNumericValue, formatNumber } from '../lib/utils/number-format.js';
import { lockScroll, unlockScroll, isLocked, getActiveLocks, forceUnlockAll } from '../lib/utils/scroll-lock.js';

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// number-format: parseNumericValue
// ---------------------------------------------------------------------------
describe('number-format edge cases', () => {
  it('treats a repeated separator as grouping, a lone one as decimal', () => {
    // Decided 2026-08-19: a repeated separator can't be a decimal point →
    // grouping; a lone separator is ALWAYS decimal because this path parses
    // typed input (mobile comma-decimal keyboards). "$1,234" pasted from
    // formatted text is the known, accepted ambiguity.
    expect(parseNumericValue('1.234.567')).to.equal(1234567);
    expect(parseNumericValue('1,234,567')).to.equal(1234567);
    expect(parseNumericValue('$1,234')).to.equal(1.234);
    expect(parseNumericValue('12,50')).to.equal(12.5);
  });

  it('parses negative European format', () => {
    expect(parseNumericValue('-1.234,56')).to.equal(-1234.56);
  });

  it('round-trips its own currency output', () => {
    const s = formatNumber(1234.56, { type: 'currency', currency: 'USD', locale: 'en-US' });
    expect(parseNumericValue(s)).to.equal(1234.56);
  });

  it('round-trips its own de-DE currency output', () => {
    const s = formatNumber(1234.56, { type: 'currency', currency: 'EUR', locale: 'de-DE' });
    expect(parseNumericValue(s)).to.equal(1234.56);
  });
});

// ---------------------------------------------------------------------------
// Form reset fidelity (native: reset restores the ATTRIBUTE-declared default)
// ---------------------------------------------------------------------------
describe('form reset fidelity', () => {
  it('form.reset() unchecks a user-checked ty-checkbox', async () => {
    // Reset restores formValue-bearing props (here: checked) to their
    // attribute-declared defaults — not the submission `value`.
    const form = (await fixture(html`
      <form><ty-checkbox name="a"></ty-checkbox></form>
    `)) as HTMLFormElement;
    const cb = form.querySelector('ty-checkbox') as any;
    await nextFrame();

    cb.checked = true;
    expect(new FormData(form).get('a')).to.equal('on');

    form.reset();
    await nextFrame();
    expect(cb.checked, 'reset should restore unchecked default').to.equal(false);
    expect(new FormData(form).get('a')).to.equal(null);
  });

  it('form.reset() restores ty-switch to off', async () => {
    const form = (await fixture(html`
      <form><ty-switch name="s"></ty-switch></form>
    `)) as HTMLFormElement;
    const sw = form.querySelector('ty-switch') as any;
    await nextFrame();

    sw.checked = true;
    form.reset();
    await nextFrame();
    expect(sw.checked, 'reset should restore unchecked default').to.equal(false);
  });

  it('form.reset() restores ty-input to its value ATTRIBUTE, like native defaultValue', async () => {
    // Native defaultValue semantics: the attribute captured at first connect
    // is the reset target, even though later edits reflect onto the attribute.
    const form = (await fixture(html`
      <form><ty-input name="t" value="init"></ty-input></form>
    `)) as HTMLFormElement;
    const inp = form.querySelector('ty-input') as any;
    await nextFrame();

    inp.value = 'changed';
    form.reset();
    await nextFrame();
    expect(inp.value, 'reset should restore attribute-declared default').to.equal('init');
  });

  it('form.reset() clears ty-radio-group selection without corrupting radio values', async () => {
    // ty-radio has no formValue props, so reset must be a no-op on the
    // children — their `value` is the option model, not form state.
    const form = (await fixture(html`
      <form>
        <ty-radio-group name="r">
          <ty-radio value="x"></ty-radio>
          <ty-radio value="y"></ty-radio>
        </ty-radio-group>
      </form>
    `)) as HTMLFormElement;
    const group = form.querySelector('ty-radio-group') as any;
    await nextFrame();

    group.value = 'y';
    await nextFrame();
    expect(new FormData(form).get('r')).to.equal('y');

    form.reset();
    await nextFrame();
    expect(group.value).to.equal('');
    expect(new FormData(form).get('r')).to.equal(null);

    const radios = Array.from(form.querySelectorAll('ty-radio')) as any[];
    expect(radios.map((r) => r.value), 'radio values must survive reset').to.deep.equal(['x', 'y']);
    expect(radios.every((r) => !r.checked), 'no radio stays visually checked').to.equal(true);
  });
});

// ---------------------------------------------------------------------------
// ty-radio-group: disabled propagation
// ---------------------------------------------------------------------------
describe('ty-radio-group disabled propagation', () => {
  it('re-enabling the group re-enables its radios', async () => {
    // Group-imposed disable is tracked (data-ty-group-disabled) so re-enable
    // releases exactly the radios the group disabled.
    const group = (await fixture(html`
      <ty-radio-group name="g">
        <ty-radio value="a"></ty-radio>
        <ty-radio value="b"></ty-radio>
      </ty-radio-group>
    `)) as any;
    await nextFrame();

    group.disabled = true;
    await nextFrame();
    const radios = Array.from(group.querySelectorAll('ty-radio')) as any[];
    expect(radios.every((r) => r.disabled), 'disable propagates down').to.equal(true);

    group.disabled = false;
    await nextFrame();
    expect(radios.every((r) => !r.disabled), 're-enable should propagate down too').to.equal(true);
  });
});

// ---------------------------------------------------------------------------
// ty-file-upload
// ---------------------------------------------------------------------------
describe('ty-file-upload edge cases', () => {
  function drop(el: HTMLElement, files: File[]): void {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    const zone = el.shadowRoot!.querySelector('.drop-zone') as HTMLElement;
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
  }

  it('single mode keeps only the first of multiple dropped files', async () => {
    const el = (await fixture(html`<ty-file-upload name="f"></ty-file-upload>`)) as any;
    await nextFrame();
    drop(el, [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')]);
    await tick();
    expect(el.files.length).to.equal(1);
    expect(el.files[0].name).to.equal('a.txt');
  });

  it('rejects dropped files that violate accept, like a native input', async () => {
    // Drag-and-drop bypasses the native picker dialog, so the drop handler
    // applies the same accept filter (.ext, type/subtype, type/*).
    const el = (await fixture(html`<ty-file-upload name="f" accept="image/png"></ty-file-upload>`)) as any;
    await nextFrame();
    drop(el, [new File(['x'], 'x.exe', { type: 'application/x-msdownload' })]);
    await tick();
    expect(el.files.length, 'non-matching file should be filtered out').to.equal(0);
  });

  it('an unnamed upload is not submitted, like a native unnamed input', async () => {
    // Native inputs without a name are excluded from submission.
    const form = (await fixture(html`<form><ty-file-upload></ty-file-upload></form>`)) as HTMLFormElement;
    const el = form.querySelector('ty-file-upload') as any;
    await nextFrame();
    drop(el, [new File(['a'], 'a.txt')]);
    await tick();
    expect(new FormData(form).get('files'), 'unnamed control leaks under "files"').to.equal(null);
  });

  it('form.reset() clears the file list', async () => {
    const form = (await fixture(html`<form><ty-file-upload name="f"></ty-file-upload></form>`)) as HTMLFormElement;
    const el = form.querySelector('ty-file-upload') as any;
    await nextFrame();
    drop(el, [new File(['a'], 'a.txt')]);
    await tick();
    expect(el.files.length).to.equal(1);
    form.reset();
    await nextFrame();
    expect(el.files.length).to.equal(0);
    expect(new FormData(form).get('f')).to.equal(null);
  });
});

// ---------------------------------------------------------------------------
// scroll-lock: reference counting across components
// ---------------------------------------------------------------------------
describe('scroll-lock refcounting', () => {
  afterEach(() => forceUnlockAll());

  it('stays locked until every holder releases, in any order', () => {
    lockScroll('modal-1');
    lockScroll('select-1');
    expect(isLocked()).to.equal(true);

    unlockScroll('select-1');
    expect(isLocked(), 'closing inner component must not free the outer lock').to.equal(true);

    unlockScroll('modal-1');
    expect(isLocked()).to.equal(false);
    expect(document.documentElement.style.overflow).to.equal('');
  });

  it('is idempotent per holder and ignores unknown holders', () => {
    lockScroll('m');
    lockScroll('m'); // double-lock same id
    unlockScroll('nobody'); // never locked
    unlockScroll('m');
    expect(isLocked()).to.equal(false);
    expect(getActiveLocks().size).to.equal(0);
  });

  it('modal open/close drives the page lock end-to-end', async () => {
    const el = (await fixture(html`<ty-modal><div>hi</div></ty-modal>`)) as any;
    await nextFrame();
    el.setAttribute('open', 'true');
    await nextFrame();
    expect(isLocked()).to.equal(true);
    el.removeAttribute('open');
    await nextFrame();
    expect(isLocked()).to.equal(false);
  });
});

// ---------------------------------------------------------------------------
// ty-selected-tags (zero prior coverage)
// ---------------------------------------------------------------------------
describe('ty-selected-tags basics and edges', () => {
  it('renders default chips from a multi ty-select and dismiss deselects', async () => {
    const wrap = (await fixture(html`
      <div>
        <ty-select id="pick" multiple value="a,b">
          <ty-option value="a">Alpha</ty-option>
          <ty-option value="b">Beta</ty-option>
        </ty-select>
        <ty-selected-tags for="pick"></ty-selected-tags>
      </div>
    `)) as HTMLElement;
    await nextFrame();
    await tick(50); // select initializes selection on rAF

    const tags = wrap.querySelector('ty-selected-tags')!;
    const chips = tags.querySelectorAll('ty-tag');
    expect(chips.length).to.equal(2);
    expect(chips[0].textContent).to.equal('Alpha');

    chips[0].dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
    await tick(50);
    expect(tags.querySelectorAll('ty-tag').length).to.equal(1);
    expect((wrap.querySelector('#pick') as any).value).to.equal('b');
  });

  it('falls back to the previous sibling when `for` is absent', async () => {
    const wrap = (await fixture(html`
      <div>
        <ty-select multiple value="a">
          <ty-option value="a">Alpha</ty-option>
        </ty-select>
        <ty-selected-tags></ty-selected-tags>
      </div>
    `)) as HTMLElement;
    await nextFrame();
    await tick(50);
    expect(wrap.querySelector('ty-selected-tags')!.querySelectorAll('ty-tag').length).to.equal(1);
  });

  it('a text-only <template> still stamps chips', async () => {
    // Parser-created templates keep text in .content; any content node
    // (including bare text) counts as a valid chip template.
    const wrap = (await fixture(html`
      <div>
        <ty-select id="p2" multiple value="a">
          <ty-option value="a">Alpha</ty-option>
        </ty-select>
        <ty-selected-tags for="p2"><template>{label}</template></ty-selected-tags>
      </div>
    `)) as HTMLElement;
    await nextFrame();
    await tick(50);
    const tags = wrap.querySelector('ty-selected-tags')!;
    expect(tags.textContent).to.contain('Alpha');
  });
});

// ---------------------------------------------------------------------------
// PropertyManager boolean coercion contract (regression guard, current behavior)
// ---------------------------------------------------------------------------
describe('boolean attribute coercion contract', () => {
  it('documents the coercion table: ""/other→true, "false"/"0"→false, removal→false', async () => {
    const el = (await fixture(html`<ty-checkbox></ty-checkbox>`)) as any;
    await nextFrame();

    el.setAttribute('checked', '');
    expect(el.checked, 'empty string (HTML boolean attr)').to.equal(true);

    el.setAttribute('checked', 'false');
    expect(el.checked, '"false"').to.equal(false);

    el.setAttribute('checked', '0');
    expect(el.checked, '"0"').to.equal(false);

    // Anything else — including "no" — is truthy. Surprising but documented.
    el.setAttribute('checked', 'no');
    expect(el.checked, '"no" is truthy per current contract').to.equal(true);

    el.removeAttribute('checked');
    expect(Boolean(el.checked), 'removal clears').to.equal(false);
  });
});
