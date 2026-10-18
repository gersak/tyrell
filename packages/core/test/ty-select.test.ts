import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { sendMouse, resetMouse } from '@web/test-runner-commands';
import '../lib/components/select.js';
import '../lib/components/input.js';
import '../lib/components/option.js';
import '../lib/components/popup.js';
import '../lib/components/button.js';
import { getActiveLocks } from '../lib/utils/scroll-lock.js';

const tick = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

describe('ty-select', () => {
  describe('single (default)', () => {
    it('picking an option sets scalar value, fires change, closes popup', async () => {
      const el = (await fixture(html`
        <ty-select name="robot">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();

      // Open, then pick
      (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
      await tick();

      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      const ev = (await oneEvent(el, 'change')) as CustomEvent;

      expect(ev.detail.value).to.equal('eywa'); // scalar in single mode
      expect(ev.detail.values).to.deep.equal(['eywa']);
      expect(el.value).to.equal('eywa');

      await tick();
      const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
      expect(dialog.open, 'popup closed after pick').to.be.false;
    });

    it('picking a second option replaces the first (no toggle accumulation)', async () => {
      const el = (await fixture(html`
        <ty-select name="robot" value="bobo">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();

      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      await oneEvent(el, 'change');

      expect(el.value).to.equal('eywa');
      expect(el.querySelector('ty-option[value="bobo]"]')?.hasAttribute('selected') ?? false).to.be.false;
    });

    it('submits a single FormData entry', async () => {
      const form = (await fixture(html`
        <form>
          <ty-select name="robot" value="bobo">
            <ty-option value="bobo">Bobo</ty-option>
          </ty-select>
        </form>
      `)) as HTMLFormElement;
      await tick();
      expect(new FormData(form).getAll('robot')).to.deep.equal(['bobo']);
    });

    it('projects the selected option into the stub as a clone (rich HTML intact)', async () => {
      const el = (await fixture(html`
        <ty-select value="bobo" placeholder="Pick one">
          <ty-option value="bobo"><b>Bobo</b> Robot <span class="price">$50</span></ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();

      // Clone in light DOM, slotted into the stub, marked + tick-stripped
      const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone, 'display clone exists').to.exist;
      expect(clone.getAttribute('value')).to.equal('bobo');
      expect(clone.hasAttribute('selected')).to.be.false;
      expect(clone.querySelector('.price')?.textContent, 'rich HTML survives').to.equal('$50');

      // Clone never counts as an option (would break counts/search/values)
      expect(el.value).to.equal('bobo');

      // Text placeholder is hidden while the clone displays
      const text = el.shadowRoot.querySelector('.dropdown-placeholder') as HTMLElement;
      expect(text.hidden).to.be.true;

      // Re-selection swaps the clone
      el.value = 'eywa';
      await tick();
      const clone2 = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone2.getAttribute('value')).to.equal('eywa');
      expect(el.querySelectorAll('[cloned]').length).to.equal(1);
    });
  });

  describe('multiple', () => {
    it('toggles options, array detail, repeated FormData entries', async () => {
      const form = (await fixture(html`
        <form>
          <ty-select multiple name="robots" value="bobo">
            <ty-option value="bobo">Bobo</ty-option>
            <ty-option value="eywa">EYWA</ty-option>
          </ty-select>
        </form>
      `)) as HTMLFormElement;
      const el = form.querySelector('ty-select') as any;
      await tick();

      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      const ev = (await oneEvent(el, 'change')) as CustomEvent;

      expect(ev.detail.value).to.deep.equal(['bobo', 'eywa']); // array in multiple mode
      expect(new FormData(form).getAll('robots')).to.deep.equal(['bobo', 'eywa']);

      // Popup semantics: multiple keeps the dropdown open for more picks
      // (dropdown only opens via stub here, so just assert value toggling)
      setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
      const ev2 = (await oneEvent(el, 'change')) as CustomEvent;
      expect(ev2.detail.values).to.deep.equal(['bobo']);
    });
  });

  it('renders start and end slot content in the stub', async () => {
    const el = (await fixture(html`
      <ty-select>
        <span slot="start" id="s">S</span>
        <span slot="end" id="e">E</span>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const startSlot = el.shadowRoot.querySelector('slot[name="start"]') as HTMLSlotElement;
    const endSlot = el.shadowRoot.querySelector('slot[name="end"]') as HTMLSlotElement;
    expect(startSlot.assignedElements().map((n: Element) => n.id)).to.deep.equal(['s']);
    expect(endSlot.assignedElements().map((n: Element) => n.id)).to.deep.equal(['e']);
  });

  describe('external search — option swaps', () => {
    it('selected display survives a naive consumer swap that wipes ALL ty-option (incl. the clone)', async () => {
      const el = (await fixture(html`
        <ty-select value="bobo" external-search>
          <ty-option value="bobo">Bobo Robot</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      expect(el.querySelector('[cloned][slot="selected"]'), 'clone shown initially').to.exist;

      // The documented consumer pattern: replace ty-option children with
      // server results — a naive sweep also removes the display clone.
      el.querySelectorAll('ty-option').forEach((o: Element) => o.remove());
      const opt = document.createElement('ty-option');
      opt.setAttribute('value', 'xyz'); // results do NOT include the selection
      opt.textContent = 'Unrelated Result';
      el.appendChild(opt);
      await tick();

      const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone, 'clone restored after swap').to.exist;
      expect(clone.getAttribute('value')).to.equal('bobo');
      expect(clone.textContent).to.equal('Bobo Robot');

      const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
      expect(stub.classList.contains('has-selection'), 'still shows as selected').to.be.true;
    });

    it('rebuilds the clone from a re-added matching option', async () => {
      const el = (await fixture(html`
        <ty-select value="bobo" external-search>
          <ty-option value="bobo">Bobo Robot</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      el.querySelectorAll('ty-option').forEach((o: Element) => o.remove());
      const opt = document.createElement('ty-option');
      opt.setAttribute('value', 'bobo');
      opt.textContent = 'Bobo Robot (fresh)';
      el.appendChild(opt);
      await tick();
      const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone).to.exist;
      expect(clone.getAttribute('value')).to.equal('bobo');
    });
  });

  describe('compact skin', () => {
    it('stub gets .compact class; multiple+compact shows count badge, not labels', async () => {
      const el = (await fixture(html`
        <ty-select multiple compact value="bobo,eywa" placeholder="Robots">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
      expect(stub.classList.contains('compact')).to.be.true;

      const badge = stub.querySelector('.select-count') as HTMLElement;
      expect(badge.hidden).to.be.false;
      expect(badge.textContent).to.equal('2');

      const text = stub.querySelector('.dropdown-placeholder') as HTMLElement;
      expect(text.textContent).to.equal('Robots'); // placeholder, not labels
      // Regression: compact relies on flex-basis:auto (content-hugging) —
      // textContent alone doesn't catch a collapsed-to-0-width element.
      expect(text.getBoundingClientRect().width, 'placeholder text is actually visible, not 0-width').to.be.greaterThan(0);
    });

    it('field skin (default) hides the badge and shows joined labels', async () => {
      const el = (await fixture(html`
        <ty-select multiple value="bobo,eywa">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      `)) as any;
      await tick();
      const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
      expect(stub.classList.contains('compact')).to.be.false;
      expect((stub.querySelector('.select-count') as HTMLElement).hidden).to.be.true;
      expect((stub.querySelector('.dropdown-placeholder') as HTMLElement).textContent)
        .to.equal('Bobo, EYWA');
    });
  });
});

describe('ty-select clear button', () => {
  it('clear() empties a single selection and fires change with action "clear"', async () => {
    const el = (await fixture(html`
      <ty-select name="robot" value="bobo">
        <ty-option value="bobo">Bobo</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    setTimeout(() => el.clear());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.action).to.equal('clear');
    expect(ev.detail.value).to.equal(null);
    expect(ev.detail.values).to.deep.equal([]);
    expect(el.value).to.equal('');
  });

  it('clear() empties a multiple selection: value is [] not null', async () => {
    const el = (await fixture(html`
      <ty-select multiple value="bobo,eywa">
        <ty-option value="bobo">Bobo</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    setTimeout(() => el.clear());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.action).to.equal('clear');
    expect(ev.detail.value).to.deep.equal([]);
    expect(el.value).to.equal('');
  });

  it('clear() on an already-empty select is a no-op (no change event)', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="bobo">Bobo</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    el.clear();
    await new Promise((r) => setTimeout(r, 100));

    expect(fired).to.be.false;
  });

  it('clicking .select-clear clears the selection and fires change', async () => {
    const el = (await fixture(html`
      <ty-select value="bobo">
        <ty-option value="bobo">Bobo</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    const clearBtn = el.shadowRoot.querySelector('.select-clear') as HTMLButtonElement;
    expect(clearBtn.hidden, 'visible: selected, clear button on by default').to.be.false;

    setTimeout(() => clearBtn.click());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.action).to.equal('clear');
    expect(el.value).to.equal('');
    // clicking clear must not also open the dropdown (stopPropagation)
    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.false;
  });

  it('.select-clear is hidden when nothing is selected', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="bobo">Bobo</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const clearBtn = el.shadowRoot.querySelector('.select-clear') as HTMLButtonElement;
    expect(clearBtn.hidden).to.be.true;
  });

  it('no-clear keeps the button hidden despite a selection', async () => {
    const el = (await fixture(html`
      <ty-select value="bobo" no-clear>
        <ty-option value="bobo">Bobo</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const clearBtn = el.shadowRoot.querySelector('.select-clear') as HTMLButtonElement;
    expect(clearBtn.hidden).to.be.true;
  });

  it('disabled and readonly keep the button hidden despite a selection', async () => {
    const disabledEl = (await fixture(html`
      <ty-select value="bobo" disabled>
        <ty-option value="bobo">Bobo</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    expect((disabledEl.shadowRoot.querySelector('.select-clear') as HTMLButtonElement).hidden).to.be.true;

    const readonlyEl = (await fixture(html`
      <ty-select value="bobo" readonly>
        <ty-option value="bobo">Bobo</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    expect((readonlyEl.shadowRoot.querySelector('.select-clear') as HTMLButtonElement).hidden).to.be.true;
  });

  it('clear() still works imperatively under slot="trigger", where the built-in button is not rendered', async () => {
    const el = (await fixture(html`
      <ty-select value="bobo">
        <span slot="trigger">Custom trigger</span>
        <ty-option value="bobo">Bobo</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    setTimeout(() => el.clear());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.action).to.equal('clear');
    expect(el.value).to.equal('');
  });

  it('regression: a long joined-label selection stays single-line — clear button does not wrap to a second row', async () => {
    // .dropdown-placeholder previously used flex: 1 1 auto. .select-stub is
    // flex-wrap: wrap, and flex-wrap's line-assignment uses each item's
    // HYPOTHETICAL (pre-shrink) size — for flex-basis:auto that's the full
    // untruncated text width, not its visually-truncated width. With only
    // the chevron (absolutely positioned, exempt from flex flow) as a
    // sibling this never mattered; adding .select-clear as a real flex
    // sibling exposed it — long text pushed the clear button onto a second
    // line, growing the stub's height, even though the text was already
    // truncating with ellipsis and there was visibly room on one line.
    const el = (await fixture(html`
      <ty-select multiple value="typescript,clojure,python,javascript" style="width:220px;">
        <ty-option value="typescript">TypeScript</ty-option>
        <ty-option value="clojure">Clojure</ty-option>
        <ty-option value="python">Python</ty-option>
        <ty-option value="javascript">JavaScript</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const clearBtn = stub.querySelector('.select-clear') as HTMLElement;
    const chevron = stub.querySelector('.dropdown-chevron') as HTMLElement;
    const placeholder = stub.querySelector('.dropdown-placeholder') as HTMLElement;

    // The regression: clear button's top wraps below the text's top (a
    // whole line lower). Same row = same top, regardless of the test
    // harness's actual font-size/line-height (no design tokens loaded here).
    expect(
      clearBtn.getBoundingClientRect().top,
      'clear button sits on the same row as the chevron, not wrapped below it',
    ).to.be.closeTo(chevron.getBoundingClientRect().top, 2);
    expect(
      clearBtn.getBoundingClientRect().top,
      'clear button sits on the same row as the truncated text, not wrapped below it',
    ).to.be.closeTo(placeholder.getBoundingClientRect().top, 2);
  });
});

describe('ty-select flavor', () => {
  const BRAND = 'rgb(1, 2, 3)';

  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-success');
    document.documentElement.style.removeProperty('--ty-color-brand');
  });

  const borderColor = (el: any) =>
    getComputedStyle(el.shadowRoot.querySelector('.select-stub')).borderTopColor;

  it('colors the stub border from a built-in flavor', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(4, 5, 6)');
    const el = (await fixture(html`<ty-select flavor="success"></ty-select>`)) as any;
    await tick();
    expect(borderColor(el)).to.equal('rgb(4, 5, 6)');
  });

  it('derives the stub border from a custom flavor token', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const el = (await fixture(html`<ty-select flavor="brand"></ty-select>`)) as any;
    await tick();
    expect(borderColor(el)).to.equal(BRAND);
  });

  it('page-level --select-accent overrides a flavor (escape hatch)', async () => {
    document.documentElement.style.setProperty('--ty-color-brand', BRAND);
    const wrap = await fixture(html`
      <div>
        <style>ty-select[flavor="brand"] { --select-accent: rgb(9, 9, 9); }</style>
        <ty-select flavor="brand"></ty-select>
      </div>
    `);
    await tick();
    const el = wrap.querySelector('ty-select') as any;
    expect(borderColor(el)).to.equal('rgb(9, 9, 9)');
  });
});

describe('ty-select open-state ring', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-success');
  });

  it('escalates border + adds a ring while the dropdown is open, matching the flavor', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(4, 5, 6)');
    const el = (await fixture(html`
      <ty-select flavor="success">
        <ty-option value="a">A</ty-option>
        <ty-option value="f0">Filler 0</ty-option>
        <ty-option value="f1">Filler 1</ty-option>
        <ty-option value="f2">Filler 2</ty-option>
        <ty-option value="f3">Filler 3</ty-option>
        <ty-option value="f4">Filler 4</ty-option>
        <ty-option value="f5">Filler 5</ty-option>
        <ty-option value="f6">Filler 6</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const closedShadow = getComputedStyle(stub).boxShadow;
    expect(closedShadow, 'no ring while closed').to.equal('none');

    stub.click();
    await tick();

    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open, 'dropdown opened').to.be.true;

    // The stub's ring is gated on :not(:has(.dropdown-search-input:focus)) —
    // two rings at once read as two focused controls. Now that every select
    // is searchable and the input auto-focuses on open, that suppression is
    // the normal case: the focus indicator the user sees is the search
    // field's own ring. Asserted via focus ownership rather than computed
    // box-shadow, which is unreliable here — the token stylesheet isn't
    // loaded in tests, so color-mix() on an unset --ty-color-* invalidates
    // the whole declaration.
    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLElement;
    expect(el.shadowRoot.activeElement, 'search input takes focus on open').to.equal(search);
    expect(getComputedStyle(stub).boxShadow, 'stub defers its ring to the focused search input')
      .to.equal('none');
  });

  it('keeps its own open-state ring when the select is not searchable', async () => {
    const el = (await fixture(html`
      <ty-select flavor="success" not-searchable>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;

    stub.click();
    await tick();

    // No search row means nothing steals focus from the stub, so the gate on
    // the stub's own open-state ring (:not(:has(.dropdown-search-input:focus)))
    // stays satisfied — the condition the CSS actually keys on.
    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLElement;
    expect((el.shadowRoot.querySelector('.dropdown-header') as HTMLElement).hidden,
      'search row is off').to.be.true;
    expect(el.shadowRoot.activeElement, 'search input never takes focus').to.not.equal(search);
  });
});

describe('ty-select count badge follows flavor', () => {
  it('colors the compact-mode count badge from the flavor, not a fixed primary', async () => {
    document.documentElement.style.setProperty('--ty-color-danger', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    const el = (await fixture(html`
      <ty-select multiple compact flavor="danger" value="bobo,eywa">
        <ty-option value="bobo">Bobo</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const badge = el.shadowRoot.querySelector('.select-count') as HTMLElement;
    const cs = getComputedStyle(badge);
    expect(cs.backgroundColor, 'badge bg does not use fixed primary').to.not.include('1, 2, 3');
    // badge text = --select-accent-bold = the flavor's base color (the
    // "active" step of the rest→hover/focus emphasis ladder)
    expect(cs.color, 'badge text uses the danger flavor').to.equal('rgb(7, 8, 9)');
    document.documentElement.style.removeProperty('--ty-color-danger');
    document.documentElement.style.removeProperty('--ty-color-primary');
  });
});

describe('ty-select loading spinner follows flavor', () => {
  it('colors the loading spinner from the flavor, not a fixed primary', async () => {
    document.documentElement.style.setProperty('--ty-color-danger', 'rgb(7, 8, 9)');
    document.documentElement.style.setProperty('--ty-color-primary', 'rgb(1, 2, 3)');
    const el = (await fixture(html`<ty-select flavor="danger" loading></ty-select>`)) as any;
    await tick();
    const spinner = el.shadowRoot.querySelector('.dropdown-loading-spinner') as HTMLElement;
    expect(spinner, 'spinner rendered').to.exist;
    expect(getComputedStyle(spinner).color).to.equal('rgb(7, 8, 9)');
    document.documentElement.style.removeProperty('--ty-color-danger');
    document.documentElement.style.removeProperty('--ty-color-primary');
  });
});

describe('ty-select size follows ty-input', () => {
  // Both consume var(--ty-size-*) — tyrell.css isn't loaded in this harness,
  // so seed the tokens directly (same pattern as the color-token tests above).
  // Five sizes, geometry from the shared ladder (styles/field-size.ts).
  const SIZES = { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '2.75rem', xl: '3rem' };
  const EXPECTED: Record<string, number> = { xs: 32, sm: 36, md: 40, lg: 44, xl: 48 };

  before(() => {
    for (const [k, v] of Object.entries(SIZES)) {
      document.documentElement.style.setProperty(`--ty-size-${k}`, v);
    }
  });
  after(() => {
    for (const k of Object.keys(SIZES)) {
      document.documentElement.style.removeProperty(`--ty-size-${k}`);
    }
  });

  (['xs', 'sm', 'md', 'lg', 'xl'] as const).forEach((size) => {
    it(`stub height matches input at size=${size} (${EXPECTED[size]}px)`, async () => {
      const inp = (await fixture(html`<ty-input size=${size} placeholder="x"></ty-input>`)) as any;
      const sel = (await fixture(html`
        <ty-select size=${size}><ty-option value="a">A</ty-option></ty-select>
      `)) as any;
      await tick();

      const inputH = inp.shadowRoot.querySelector('.input-wrapper').getBoundingClientRect().height;
      const stub = sel.shadowRoot.querySelector('.select-stub');
      const stubH = stub.getBoundingClientRect().height;

      expect(Math.round(inputH), 'input matches ladder').to.equal(EXPECTED[size]);
      expect(Math.round(stubH), 'select stub matches input').to.equal(EXPECTED[size]);
    });
  });
});

describe('ty-select allow-create', () => {
  const openAndType = async (el: any, text: string) => {
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    search.value = text;
    search.dispatchEvent(new Event('input', { bubbles: true }));
    return search;
  };

  const pressEnter = async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await tick();
  };

  it('keeps the search row on even with not-searchable set', async () => {
    const el = (await fixture(html`
      <ty-select allow-create not-searchable><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const header = el.shadowRoot.querySelector('.dropdown-header') as HTMLElement;
    expect(header.hidden, 'allow-create pins the row on').to.be.false;
  });

  it('mints a new option verbatim (no transform) on Enter and selects it', async () => {
    const el = (await fixture(html`
      <ty-select allow-create><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await openAndType(el, 'New York');
    await pressEnter();

    expect(el.getAttribute('value')).to.equal('New York');
    const created = el.querySelector('ty-option[value="New York"]');
    expect(created, 'new ty-option exists in light DOM').to.exist;
    expect(created!.textContent).to.equal('New York');
  });

  it('create-transform="slug" normalizes the value but keeps the label verbatim', async () => {
    const el = (await fixture(html`
      <ty-select allow-create create-transform="slug"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await openAndType(el, '  Robert Gersak!! ');
    await pressEnter();

    expect(el.getAttribute('value')).to.equal('robert_gersak');
    const created = el.querySelector('ty-option[value="robert_gersak"]');
    expect(created!.textContent).to.equal('Robert Gersak!!');
  });

  it('dedups against an existing option instead of creating a duplicate', async () => {
    const el = (await fixture(html`
      <ty-select allow-create>
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)) as any;
    await openAndType(el, 'apple'); // case-insensitive match on label text
    await pressEnter();

    expect(el.getAttribute('value')).to.equal('a');
    // Single-select creates a [cloned] display-clone ty-option on selection —
    // exclude it, same as the component's own getTagElements() does.
    expect(el.querySelectorAll('ty-option:not([cloned])').length, 'no duplicate minted').to.equal(1);
  });

  it('the create event is cancelable — preventDefault stops select from creating anything', async () => {
    const el = (await fixture(html`
      <ty-select allow-create><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    el.addEventListener('create', (e: CustomEvent) => e.preventDefault());
    await openAndType(el, 'Ignored');
    await pressEnter();

    expect(el.getAttribute('value')).to.be.oneOf([null, '']);
    expect(el.querySelectorAll('ty-option').length).to.equal(1);
  });

  it('a listener can mutate detail.value without calling preventDefault', async () => {
    const el = (await fixture(html`
      <ty-select allow-create><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    el.addEventListener('create', (e: CustomEvent) => {
      e.detail.value = 'custom-id';
    });
    await openAndType(el, 'Whatever Label');
    await pressEnter();

    expect(el.getAttribute('value')).to.equal('custom-id');
    const created = el.querySelector('ty-option[value="custom-id"]');
    expect(created!.textContent).to.equal('Whatever Label');
  });

  it('multiple: creating appends to selection, clears search, keeps the dropdown open', async () => {
    const el = (await fixture(html`
      <ty-select multiple allow-create><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    el.setAttribute('value', 'a');
    await tick();
    const search = await openAndType(el, 'Second');
    await pressEnter();

    const values = (el.getAttribute('value') || '').split(',');
    expect(values).to.include.members(['a', 'Second']);
    expect(search.value, 'search box clears after create').to.equal('');

    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open, 'dropdown stays open for the next tag').to.be.true;
  });

  it('highlighting a real option with arrow keys wins over create on Enter', async () => {
    const el = (await fixture(html`
      <ty-select allow-create>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)) as any;
    await openAndType(el, 'an'); // matches both "Banana" (contains 'an') via substring filter
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await tick();
    await pressEnter();

    // Whichever got highlighted, it must be an EXISTING option, not a new "an" one.
    expect(el.querySelectorAll('ty-option:not([cloned])').length).to.equal(2);
    expect(['a', 'b']).to.include(el.getAttribute('value'));
  });

  it('without allow-create, Enter on unmatched text does nothing', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="f0">Filler 0</ty-option>
        <ty-option value="f1">Filler 1</ty-option>
        <ty-option value="f2">Filler 2</ty-option>
        <ty-option value="f3">Filler 3</ty-option>
        <ty-option value="f4">Filler 4</ty-option>
        <ty-option value="f5">Filler 5</ty-option>
        <ty-option value="f6">Filler 6</ty-option>
      </ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    search.value = 'Nothing Matches This';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await pressEnter();

    // No new option minted — the list is exactly what the markup declared.
    expect(el.querySelectorAll('ty-option').length).to.equal(8);
    expect(el.getAttribute('value')).to.be.oneOf([null, '']);
  });
});

describe('ty-select accessibility — keyboard focus + ARIA combobox pattern', () => {
  it('the stub is keyboard-focusable (tabindex="0") and carries role="combobox"', async () => {
    const el = (await fixture(html`
      <ty-select><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;

    expect(stub.getAttribute('tabindex'), 'in the tab order').to.equal('0');
    expect(stub.getAttribute('role')).to.equal('combobox');
    expect(stub.getAttribute('aria-haspopup')).to.equal('listbox');
  });

  it('disabled select is removed from the tab order and marked aria-disabled', async () => {
    const el = (await fixture(html`
      <ty-select disabled><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;

    expect(stub.getAttribute('tabindex')).to.equal('-1');
    expect(stub.getAttribute('aria-disabled')).to.equal('true');
  });

  it('aria-controls points at a real element with role="listbox"', async () => {
    const el = (await fixture(html`
      <ty-select><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const listboxId = stub.getAttribute('aria-controls');
    expect(listboxId, 'aria-controls is set').to.be.a('string').and.not.empty;

    const listbox = el.shadowRoot.getElementById(listboxId!);
    expect(listbox, 'the referenced element exists').to.exist;
    expect(listbox!.getAttribute('role')).to.equal('listbox');
  });

  it('multiple select marks the listbox aria-multiselectable', async () => {
    const el = (await fixture(html`
      <ty-select multiple><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const listbox = el.shadowRoot.getElementById(stub.getAttribute('aria-controls')!);
    expect(listbox!.getAttribute('aria-multiselectable')).to.equal('true');
  });

  it('label is programmatically associated via aria-labelledby, not just visible text', async () => {
    const el = (await fixture(html`
      <ty-select label="Country"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const labelledBy = stub.getAttribute('aria-labelledby');
    expect(labelledBy, 'aria-labelledby is set').to.be.a('string').and.not.empty;

    const label = el.shadowRoot.getElementById(labelledBy!);
    expect(label, 'the referenced label exists').to.exist;
    expect(label!.textContent).to.include('Country');
  });

  it('Enter on the closed, focused stub opens the dropdown (keyboard-only path)', async () => {
    const el = (await fixture(html`
      <ty-select><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;

    // No click, no mouse — the ONLY way a keyboard-only user can open this.
    stub.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await tick();

    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open, 'opened via keyboard alone').to.be.true;
  });

  it('ArrowDown on the closed, focused stub also opens it (native <select> convention)', async () => {
    const el = (await fixture(html`
      <ty-select><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await tick();

    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;
  });

  it('aria-expanded toggles true/false with the dropdown open/close state', async () => {
    const el = (await fixture(html`
      <ty-select><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    expect(stub.getAttribute('aria-expanded'), 'closed initially').to.equal('false');

    stub.click();
    await tick();
    expect(stub.getAttribute('aria-expanded'), 'true once open').to.equal('true');

    (el as any).querySelector('ty-option').click();
    await tick();
    expect(stub.getAttribute('aria-expanded'), 'false again after picking (closes)').to.equal('false');
  });

  it('every option gets role="option" even before any selection is made', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const options = Array.from(el.querySelectorAll('ty-option')) as HTMLElement[];
    options.forEach((o) => {
      expect(o.getAttribute('role')).to.equal('option');
      expect(o.getAttribute('aria-selected'), `${o.getAttribute('value')} starts unselected`).to.equal('false');
    });
  });

  it('aria-selected tracks live selection state on the actual option elements', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    el.setAttribute('value', 'b');
    await tick();

    const a = el.querySelector('ty-option[value="a"]') as HTMLElement;
    const b = el.querySelector('ty-option[value="b"]') as HTMLElement;
    expect(a.getAttribute('aria-selected')).to.equal('false');
    expect(b.getAttribute('aria-selected')).to.equal('true');
  });
});

describe('ty-select — declarative init resolves selection SYNCHRONOUSLY at connect', () => {
  it('a sibling reading .value right after connect (its own synchronous connectedCallback) sees the real selection', async () => {
    // This is what ty-selected-tags does: renderChips() in its OWN
    // connectedCallback reads picker.value synchronously. If the select
    // deferred state resolution to a frame, this would see "" instead of
    // the real selection, with nothing to ever correct it afterward (no
    // DOM mutation fires when the `selected` attribute was already present
    // in the source markup).
    const host = document.createElement('div');
    host.innerHTML = `<ty-select multiple>
      <ty-option value="a" selected>Apple</ty-option>
      <ty-option value="b" selected>Banana</ty-option>
      <ty-option value="c">Cherry</ty-option>
    </ty-select>`;
    document.body.appendChild(host);
    const el = host.querySelector('ty-select') as any;
    // Deliberately NOT awaiting a frame — read immediately, like a sibling
    // custom element's own synchronous connectedCallback would.
    expect(el.value, 'value resolved before any frame/tick has passed').to.equal('a,b');
    host.remove();
  });
});

describe('ty-select — value is the selection, options are a view of it', () => {
  it('.value, required-validity and FormData all agree even with ZERO options ever present', async () => {
    // External search: value is set up front, the matching option may never
    // arrive (still loading, or simply not in the current result page). The
    // selection must not depend on an option existing to confirm it.
    const form = document.createElement('form');
    form.innerHTML = `<ty-select name="auth" value="token" required external-search></ty-select>`;
    document.body.appendChild(form);
    await tick();
    const el = form.querySelector('ty-select') as any;

    expect(el.value, '.value reports the selection with no options in the DOM').to.equal('token');
    expect(form.checkValidity(), 'required is satisfied — a value IS selected').to.equal(true);
    expect(new FormData(form).get('auth'), 'FormData carries it too').to.equal('token');
    form.remove();
  });

  it('single-select falls back to the raw value when no option ever exists to clone a label from', async () => {
    // Placeholder was previously hidden purely because a value was
    // selected, with nothing put in its place when no matching option had
    // ever existed to build a display clone from — a blank field with a
    // clear button implying a selection nothing on screen confirmed.
    const el = (await fixture(html`
      <ty-select name="robot" value="bobo" external-search></ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const textEl = stub.querySelector('.dropdown-placeholder') as HTMLElement;
    expect(el.querySelector(':scope > [cloned][slot="selected"]'), 'no clone could be built').to.not.exist;
    expect(textEl.hidden, 'placeholder text is shown, not left blank').to.equal(false);
    expect(textEl.textContent, 'falls back to the raw value').to.equal('bobo');
    expect(textEl.classList.contains('placeholder-shown'), 'not styled as an empty placeholder').to.equal(false);
  });

  it('deselecting when no option is present still clears state (not a DOM no-op)', async () => {
    const el = (await fixture(html`
      <ty-select name="auth" value="token" external-search></ty-select>
    `)) as any;
    await tick();
    expect(el.value).to.equal('token');
    el.clear();
    await tick();
    expect(el.value, 'cleared even though no option ever existed to deselect').to.equal('');
  });
});

describe('ty-select pre-selected option (selected attribute, no value attribute)', () => {
  it('builds the trigger clone from an option that carries `selected`', async () => {
    // Selection originating from the OPTION rather than the select's value:
    // the list ticked it, .value reported it, but the trigger stayed blank.
    const el = (await fixture(html`
      <ty-select name="auth">
        <ty-option value="k8s">Kubernetes</ty-option>
        <ty-option value="token" selected>Static token</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    expect(el.value).to.equal('token');
    const clone = el.querySelector(':scope > [cloned][slot="selected"]') as HTMLElement;
    expect(clone, 'display clone exists').to.exist;
    expect(clone.textContent).to.equal('Static token');
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    expect(stub.classList.contains('has-clone')).to.equal(true);
  });

  it('same, when the markup lands via innerHTML after load', async () => {
    const host = document.createElement('div');
    host.innerHTML = `<ty-select name="auth">
      <ty-option value="k8s">Kubernetes</ty-option>
      <ty-option value="token" selected>Static token</ty-option>
    </ty-select>`;
    document.body.appendChild(host);
    await tick();
    const el = host.querySelector('ty-select') as any;
    const clone = el.querySelector(':scope > [cloned][slot="selected"]') as HTMLElement;
    expect(clone?.textContent).to.equal('Static token');
    host.remove();
  });
});

describe('ty-select streaming-parse (SSR)', () => {
  it('re-clones a blank display clone once the option finishes parsing', async () => {
    // Parser order on a streamed page: the select's value attribute syncs
    // while the selected option is still an empty shell, so the display
    // clone is captured blank. When the parser appends the next sibling
    // option, the child observer must notice the stale clone and re-clone
    // from the now-complete option.
    const el = document.createElement('ty-select') as any;
    el.setAttribute('name', 'auth');
    el.setAttribute('value', 'token');
    const opt = document.createElement('ty-option');
    opt.setAttribute('value', 'token');
    opt.setAttribute('selected', '');
    el.appendChild(opt); // no text yet — mid-parse shape
    document.body.appendChild(el);
    await tick();

    // parser catches up: text lands, a sibling option follows
    opt.textContent = 'Static token';
    const opt2 = document.createElement('ty-option');
    opt2.setAttribute('value', 'k8s');
    opt2.textContent = 'Kubernetes';
    el.appendChild(opt2);
    await tick();

    const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
    expect(clone, 'display clone exists').to.exist;
    expect(clone.textContent, 'clone carries the option text').to.equal('Static token');
    expect(el.querySelectorAll('[cloned]').length, 'exactly one clone').to.equal(1);
    el.remove();
  });

  it('re-clones a blank clone at parse end when the selected option is the LAST child', async () => {
    // Same mid-parse shape, but NO sibling option follows — so the childList
    // observer never fires and the staleness guard above never gets a chance.
    // The component must re-sync on its own once parsing ends.
    const rs = Object.getOwnPropertyDescriptor(document, 'readyState');
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
    try {
      const el = document.createElement('ty-select') as any;
      el.setAttribute('value', 'token');
      const opt = document.createElement('ty-option');
      opt.setAttribute('value', 'token');
      el.appendChild(opt); // empty shell, last child
      document.body.appendChild(el);
      await tick();
      expect((el.querySelector('[cloned][slot="selected"]') as HTMLElement).textContent).to.equal('');

      opt.textContent = 'Static token'; // parser finishes the option's text
      await tick();
      document.dispatchEvent(new Event('DOMContentLoaded')); // ...and the document
      await tick();

      const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
      expect(clone.textContent, 'clone re-synced at parse end').to.equal('Static token');
      expect(el.querySelectorAll('[cloned]').length, 'exactly one clone').to.equal(1);
      el.remove();
    } finally {
      if (rs) Object.defineProperty(document, 'readyState', rs);
      else delete (document as any).readyState;
    }
  });

  it('a server-prerendered display clone is adopted, not duplicated', async () => {
    // The SSR workaround: page ships its own clone as FIRST child.
    const el = (await fixture(html`
      <ty-select name="auth" value="token">
        <ty-option slot="selected" cloned="true" value="token">Static token</ty-option>
        <ty-option value="token" selected>Static token</ty-option>
        <ty-option value="k8s">Kubernetes</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    expect(el.querySelectorAll('[cloned]').length).to.equal(1);
    const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
    expect(clone.textContent).to.equal('Static token');
  });
});

describe('ty-select multiple — many toggles, ordering, and imperative deselectValue', () => {
  it('selecting five options one at a time accumulates them in click order', async () => {
    const el = (await fixture(html`
      <ty-select multiple name="robots">
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
        <ty-option value="c">C</ty-option>
        <ty-option value="d">D</ty-option>
        <ty-option value="e">E</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    for (const v of ['c', 'a', 'e']) {
      setTimeout(() => (el.querySelector(`ty-option[value="${v}"]`) as HTMLElement).click());
      await oneEvent(el, 'change');
    }
    expect(el.value).to.equal('c,a,e');
  });

  it('re-selecting a value after deselecting it re-appends at the end, not its original position', async () => {
    const el = (await fixture(html`
      <ty-select multiple value="a,b,c">
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
        <ty-option value="c">C</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    setTimeout(() => (el.querySelector('ty-option[value="a"]') as HTMLElement).click()); // deselect
    await oneEvent(el, 'change');
    expect(el.value).to.equal('b,c');

    setTimeout(() => (el.querySelector('ty-option[value="a"]') as HTMLElement).click()); // reselect
    await oneEvent(el, 'change');
    expect(el.value, 'toggling back on appends, it does not restore original order').to.equal('b,c,a');
  });

  it('deselectValue() removes one value with a change event (the ty-selected-tags chip-dismiss path)', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select multiple name="robots" value="bobo,eywa">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    const el = form.querySelector('ty-select') as any;
    await tick();

    setTimeout(() => el.deselectValue('bobo'));
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.action).to.equal('remove');
    expect(ev.detail.item).to.equal('bobo');
    expect(el.value).to.equal('eywa');
    expect(new FormData(form).getAll('robots')).to.deep.equal(['eywa']);
  });

  it('deselectValue() on a value that is not selected is a no-op', async () => {
    const el = (await fixture(html`
      <ty-select multiple value="bobo">
        <ty-option value="bobo">Bobo</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    el.deselectValue('eywa');
    await new Promise((r) => setTimeout(r, 60));
    expect(fired).to.be.false;
    expect(el.value).to.equal('bobo');
  });
});

describe('ty-select form participation — reset & required', () => {
  it('form.reset() restores the attribute-declared default value (single)', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot" value="bobo">
          <ty-option value="bobo">Bobo</ty-option>
          <ty-option value="eywa">EYWA</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    const el = form.querySelector('ty-select') as any;
    await tick();

    setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
    await oneEvent(el, 'change');
    expect(el.value).to.equal('eywa');

    form.reset();
    await tick();
    expect(el.value, 'reset restores the original value= attribute, not empty').to.equal('bobo');
  });

  it('form.reset() on a select with no initial value attribute clears it back to empty', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot">
          <ty-option value="bobo">Bobo</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    const el = form.querySelector('ty-select') as any;
    await tick();
    setTimeout(() => (el.querySelector('ty-option[value="bobo"]') as HTMLElement).click());
    await oneEvent(el, 'change');
    expect(el.value).to.equal('bobo');

    form.reset();
    await tick();
    expect(el.value).to.equal('');
  });

  it('required blocks form submission until a value is picked', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot" required>
          <ty-option value="bobo">Bobo</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    const el = form.querySelector('ty-select') as any;
    await tick();
    expect(form.checkValidity(), 'empty + required blocks the form').to.be.false;

    setTimeout(() => (el.querySelector('ty-option[value="bobo"]') as HTMLElement).click());
    await oneEvent(el, 'change');
    expect(form.checkValidity(), 'satisfied once a value is picked').to.be.true;
  });

  it('required + disabled is excluded from constraint validation (native <select> semantics)', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot" required disabled>
          <ty-option value="bobo">Bobo</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    await tick();
    expect(form.checkValidity(), 'disabled fields never block validity').to.be.true;
  });

  it('nothing selected: single submits name= (like a native select), multiple submits nothing', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot">
          <ty-option value="bobo">Bobo</ty-option>
        </ty-select>
        <ty-select name="crew" multiple>
          <ty-option value="bobo">Bobo</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    await tick();
    const data = new FormData(form);
    expect(data.get('robot')).to.equal('');
    expect(data.has('crew')).to.be.false;
  });

  it('dropping `multiple` off a multi-value selection keeps only the first value', async () => {
    const el = (await fixture(html`
      <ty-select multiple value="a,b,c">
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
        <ty-option value="c">C</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    expect(el.value).to.equal('a,b,c');

    el.multiple = false;
    await tick();
    expect(el.value, 'single cardinality keeps only the first previously-selected value').to.equal('a');
  });
});

describe('ty-select popup search — on by default & no-results', () => {
  const makeOptions = (n: number): DocumentFragment => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const o = document.createElement('ty-option');
      o.setAttribute('value', `o${i}`);
      o.textContent = `Option ${i}`;
      frag.appendChild(o);
    }
    return frag;
  };

  it('exactly at the threshold (7 options) keeps the search row hidden', async () => {
    const el = document.createElement('ty-select') as any;
    el.appendChild(makeOptions(7));
    document.body.appendChild(el);
    await tick();
    const header = el.shadowRoot.querySelector('.dropdown-header') as HTMLElement;
    expect(header.hidden, 'the whole list fits without scrolling').to.be.true;
    el.remove();
  });

  it('one past the threshold (8 options) shows the search row automatically', async () => {
    const el = document.createElement('ty-select') as any;
    el.appendChild(makeOptions(8));
    document.body.appendChild(el);
    await tick();
    const header = el.shadowRoot.querySelector('.dropdown-header') as HTMLElement;
    expect(header.hidden, 'list would scroll — search earns its place').to.be.false;
    el.remove();
  });

  it('not-searchable is the single opt-out, even past the threshold', async () => {
    const el = document.createElement('ty-select') as any;
    el.setAttribute('not-searchable', '');
    el.appendChild(makeOptions(10));
    document.body.appendChild(el);
    await tick();
    const header = el.shadowRoot.querySelector('.dropdown-header') as HTMLElement;
    expect(header.hidden).to.be.true;
    el.remove();
  });

  it('not-searchable cannot override external-search or allow-create', async () => {
    const elExternal = document.createElement('ty-select') as any;
    elExternal.setAttribute('not-searchable', '');
    elExternal.setAttribute('external-search', '');
    elExternal.appendChild(makeOptions(2));
    document.body.appendChild(elExternal);
    await tick();
    expect(
      (elExternal.shadowRoot.querySelector('.dropdown-header') as HTMLElement).hidden,
      'external-search always shows the row'
    ).to.be.false;
    elExternal.remove();

    const elCreate = document.createElement('ty-select') as any;
    elCreate.setAttribute('not-searchable', '');
    elCreate.setAttribute('allow-create', '');
    elCreate.appendChild(makeOptions(2));
    document.body.appendChild(elCreate);
    await tick();
    expect(
      (elCreate.shadowRoot.querySelector('.dropdown-header') as HTMLElement).hidden,
      'allow-create always shows the row'
    ).to.be.false;
    elCreate.remove();
  });

  it('the notSearchable property round-trips and toggles the row live', async () => {
    const el = document.createElement('ty-select') as any;
    el.appendChild(makeOptions(12));
    document.body.appendChild(el);
    await tick();

    expect(el.notSearchable).to.be.false;
    expect(el.shadowRoot.querySelector('.dropdown-header').hidden, 'past the threshold').to.be.false;

    el.notSearchable = true;
    await tick();
    expect(el.hasAttribute('not-searchable')).to.be.true;
    expect(el.shadowRoot.querySelector('.dropdown-header').hidden).to.be.true;

    el.notSearchable = false;
    await tick();
    expect(el.hasAttribute('not-searchable')).to.be.false;
    expect(el.shadowRoot.querySelector('.dropdown-header').hidden).to.be.false;
    el.remove();
  });

  it('crossing the threshold at runtime (appending options while connected) reveals the search row', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
        <ty-option value="c">C</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    expect((el.shadowRoot.querySelector('.dropdown-header') as HTMLElement).hidden,
      'starts under threshold').to.be.true;

    el.appendChild(makeOptions(6)); // 3 + 6 = 9 > 7
    await tick();
    expect((el.shadowRoot.querySelector('.dropdown-header') as HTMLElement).hidden,
      'appears once the list grows past the threshold').to.be.false;
  });

  it('typing a query that matches nothing hides the options area; clearing restores it', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
        <ty-option value="f0">Filler 0</ty-option>
        <ty-option value="f1">Filler 1</ty-option>
        <ty-option value="f2">Filler 2</ty-option>
        <ty-option value="f3">Filler 3</ty-option>
        <ty-option value="f4">Filler 4</ty-option>
        <ty-option value="f5">Filler 5</ty-option>
        <ty-option value="f6">Filler 6</ty-option>
      </ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    const options = el.shadowRoot.querySelector('.dropdown-options') as HTMLElement;

    search.value = 'zzz-nope';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(options.style.display, 'no matches hides the options container').to.equal('none');
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('filtered-out')).to.be.true;
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('filtered-out')).to.be.true;

    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(options.style.display, 'clearing the query restores the list').to.equal('');
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('filtered-out')).to.be.false;
  });

  it('a label attribute participates in filtering even when it does not appear in the rendered rich HTML', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="x" label="XYZZY"><b>Rich</b> <i>Content</i></ty-option>
        <ty-option value="y">Plain</ty-option>
      </ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;

    search.value = 'xyzzy';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ty-option[value="x"]')!.hasAttribute('filtered-out'), 'matched via label attribute').to.be.false;
    expect(el.querySelector('ty-option[value="y"]')!.hasAttribute('filtered-out'), 'not a match').to.be.true;

    search.value = 'rich';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ty-option[value="x"]')!.hasAttribute('filtered-out'), 'its own rich textContent no longer participates once label is set').to.be.true;
  });
});

describe('ty-select popup search — debounced external search & loading', () => {
  it('coalesces rapid typing into one dispatch after the debounce window', async () => {
    const el = (await fixture(html`
      <ty-select external-search debounce="40">
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const queries: string[] = [];
    el.addEventListener('search', (e: CustomEvent) => queries.push(e.detail.query));

    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    expect(queries, 'opening fires an immediate empty-query search, not debounced').to.deep.equal(['']);

    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    search.value = 'a';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.value = 'ab';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.value = 'abc';
    search.dispatchEvent(new Event('input', { bubbles: true }));

    expect(queries, 'nothing dispatched yet — still inside the debounce window').to.deep.equal(['']);

    await new Promise((r) => setTimeout(r, 90));
    expect(queries, 'only the final query made it through, prior keystrokes were coalesced').to.deep.equal(['', 'abc']);
  });

  it('loading toggles aria-busy/class on the options wrapper independent of typing', async () => {
    const el = (await fixture(html`
      <ty-select external-search>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const wrapper = el.shadowRoot.querySelector('.dropdown-options-wrapper') as HTMLElement;
    expect(wrapper.hasAttribute('aria-busy')).to.be.false;

    el.loading = true;
    await tick();
    expect(wrapper.classList.contains('loading')).to.be.true;
    expect(wrapper.getAttribute('aria-busy')).to.equal('true');

    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    search.value = 'query';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(wrapper.classList.contains('loading'), 'typing while loading does not clear it — consumer owns loading').to.be.true;

    el.loading = false;
    await tick();
    expect(wrapper.hasAttribute('aria-busy')).to.be.false;
  });
});

describe('ty-select keyboard navigation in the open popup', () => {
  const openPopup = async (el: any) => {
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
  };
  const arrow = async (key: string) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await tick();
  };

  it('ArrowDown/ArrowUp move the highlight and wrap at both ends', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
        <ty-option value="c">C</ty-option>
      </ty-select>
    `)) as any;
    await openPopup(el);
    const highlighted = () => el.querySelector('ty-option[highlighted]')?.getAttribute('value') ?? null;

    await arrow('ArrowDown');
    expect(highlighted()).to.equal('a');
    await arrow('ArrowDown');
    expect(highlighted()).to.equal('b');
    await arrow('ArrowDown');
    expect(highlighted()).to.equal('c');
    await arrow('ArrowDown'); // wraps back to first
    expect(highlighted()).to.equal('a');

    await arrow('ArrowUp'); // wraps the other way
    expect(highlighted()).to.equal('c');
  });

  it('Enter selects the highlighted option and closes the popup', async () => {
    const el = (await fixture(html`
      <ty-select name="robot">
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    await openPopup(el);
    await arrow('ArrowDown');
    await arrow('ArrowDown');

    setTimeout(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.value).to.equal('b');

    await tick();
    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.false;
  });

  it('Escape closes the popup without changing the selection', async () => {
    const el = (await fixture(html`
      <ty-select value="a">
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    await openPopup(el);
    await arrow('ArrowDown');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await tick();

    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.false;
    expect(el.value).to.equal('a');
  });

  it('with zero options, arrow keys are a no-op (no throw, nothing highlighted)', async () => {
    const el = (await fixture(html`<ty-select></ty-select>`)) as any;
    await openPopup(el);
    await arrow('ArrowDown');
    await arrow('ArrowUp');
    expect(el.querySelector('[highlighted]')).to.not.exist;
  });
});

describe('ty-select keyboard navigation — disabled options', () => {
  const openPopup = async (el: any) => {
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
  };
  const arrow = async (key: string) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await tick();
  };

  it('arrow-key navigation skips disabled options, matching mouse-click behavior', async () => {
    const el = (await fixture(html`
      <ty-select name="robot">
        <ty-option value="a">A</ty-option>
        <ty-option value="b" disabled>B</ty-option>
        <ty-option value="c">C</ty-option>
      </ty-select>
    `)) as any;
    await openPopup(el);

    await arrow('ArrowDown'); // -> a
    await arrow('ArrowDown'); // should skip disabled b, land on c
    const highlighted = el.querySelector('ty-option[highlighted]')?.getAttribute('value');
    expect(highlighted, 'disabled option b must not be highlightable via keyboard').to.equal('c');
  });
});

// `hidden` on an option is the author's, like a native <option hidden>: not
// on offer, but still a value. The search marks its own `filtered-out`.
describe('ty-select — options the author hid (hidden)', () => {
  const openPopup = async (el: any) => {
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
  };
  const press = async (key: string) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await tick();
  };
  const search = (el: any, query: string) => {
    const input = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const opt = (el: any, v: string) => el.querySelector(`ty-option[value="${v}"]:not([cloned])`) as HTMLElement;

  it('the keyboard skips a hidden option and Enter cannot pick it', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b" hidden>B</ty-option>
        <ty-option value="c">C</ty-option>
      </ty-select>
    `)) as any;
    await openPopup(el);
    await press('ArrowDown');
    await press('ArrowDown');
    expect(el.querySelector('ty-option[highlighted]')?.getAttribute('value')).to.equal('c');
    await press('Enter');
    expect(el.value).to.equal('c');
  });

  it('searching and closing never unhide it, and the search writes its own attribute', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b" hidden>Apricot</ty-option>
        <ty-option value="c">Cherry</ty-option>
      </ty-select>
    `)) as any;
    await openPopup(el);
    search(el, 'ap');
    expect(opt(el, 'b').hasAttribute('hidden'), 'still hidden while it matches').to.equal(true);
    expect(opt(el, 'c').hasAttribute('hidden'), 'a non-match is not marked hidden').to.equal(false);
    expect(opt(el, 'c').hasAttribute('filtered-out')).to.equal(true);
    await press('ArrowDown');
    await press('ArrowDown');
    expect(el.querySelector('ty-option[highlighted]')?.getAttribute('value'), 'only Apple is on offer').to.equal('a');

    await press('Escape');
    expect(opt(el, 'b').hasAttribute('hidden'), 'still hidden after close').to.equal(true);
    expect(el.querySelectorAll('[filtered-out]').length, 'search marks cleared').to.equal(0);
    await openPopup(el);
    expect(getComputedStyle(opt(el, 'b')).display).to.equal('none');
    expect(getComputedStyle(opt(el, 'c')).display).to.not.equal('none');
  });

  // `filtered` was a snapshot of the list at open: a server patch hiding an
  // option while it's open (Datastar, HTMX) left it on the keyboard's path.
  it('an option hidden while the list is open is skipped too', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
        <ty-option value="c">C</ty-option>
      </ty-select>
    `)) as any;
    await openPopup(el);
    opt(el, 'b').setAttribute('hidden', '');
    await press('ArrowDown');
    await press('ArrowDown');
    expect(el.querySelector('ty-option[highlighted]')?.getAttribute('value')).to.equal('c');
    await press('Enter');
    expect(el.value).to.equal('c');
  });

  // A framework component per option (Angular, Lit, Stencil) puts its own
  // element around each ty-option: the select's ::slotted() rule only
  // reaches its direct children.
  it('the search hides options nested in a wrapper element', async () => {
    const el = (await fixture(html`
      <ty-select>
        <div class="group">
          <ty-option value="a">Apple</ty-option>
          <ty-option value="b">Banana</ty-option>
          <ty-option value="c">Cherry</ty-option>
        </div>
      </ty-select>
    `)) as any;
    await openPopup(el);
    search(el, 'ban');
    expect(getComputedStyle(opt(el, 'a')).display, 'left out').to.equal('none');
    expect(getComputedStyle(opt(el, 'b')).display, 'a match').to.not.equal('none');
    expect(opt(el, 'c').getBoundingClientRect().height).to.equal(0);
  });

  it('a hidden option can still be the value, and shows in the trigger', async () => {
    const el = (await fixture(html`
      <ty-select value="b">
        <ty-option value="a">A</ty-option>
        <ty-option value="b" hidden>Legacy plan</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const clone = el.querySelector('ty-option[cloned]') as HTMLElement;
    expect(clone.textContent).to.equal('Legacy plan');
    expect(clone.hasAttribute('hidden')).to.equal(false);
    expect(clone.getBoundingClientRect().width).to.be.above(0);
  });
});

describe('ty-select compact — single-select still renders a clone, not a badge', () => {
  it('single + compact shows the display clone; badge/counter never appears', async () => {
    const el = (await fixture(html`
      <ty-select compact value="bobo">
        <ty-option value="bobo"><b>Bobo</b></ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    expect(stub.classList.contains('compact')).to.be.true;
    expect(stub.classList.contains('has-clone')).to.be.true;
    const badge = stub.querySelector('.select-count') as HTMLElement;
    expect(badge.hidden, 'single-select never shows the count badge, compact or not').to.be.true;
    const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
    expect(clone.querySelector('b')?.textContent).to.equal('Bobo');
  });
});

describe('ty-select custom trigger slot (slot="trigger")', () => {
  it('reflects has-trigger / .custom-trigger only while trigger content is actually slotted', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    expect(el.hasAttribute('has-trigger')).to.be.false;
    expect(stub.classList.contains('custom-trigger')).to.be.false;

    const trigger = document.createElement('span');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Custom';
    el.appendChild(trigger);
    await tick();
    expect(el.hasAttribute('has-trigger'), 'attribute set once trigger content is slotted').to.be.true;
    expect(stub.classList.contains('custom-trigger')).to.be.true;

    trigger.remove();
    await tick();
    expect(el.hasAttribute('has-trigger'), 'cleared once the slot empties again').to.be.false;
    expect(stub.classList.contains('custom-trigger')).to.be.false;
  });

  it('clicking anywhere on the slotted custom trigger still opens the dropdown', async () => {
    const el = (await fixture(html`
      <ty-select>
        <span slot="trigger"><button id="btn">Open</button></span>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    (el.querySelector('#btn') as HTMLElement).click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;
  });
});

describe('ty-select — mutating children while the popup interacts correctly', () => {
  it('removing the selected option node outright (no external-search) still leaves the display clone in place', async () => {
    const el = (await fixture(html`
      <ty-select value="bobo">
        <ty-option value="bobo">Bobo Robot</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    expect(el.querySelector('[cloned][slot="selected"]')).to.exist;

    el.querySelector('ty-option[value="bobo"]')!.remove();
    await tick();

    const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
    expect(clone, 'clone survives even though the source option is gone and external-search was never set').to.exist;
    expect(clone.getAttribute('value')).to.equal('bobo');
    expect(el.value, '.value is unaffected by option removal').to.equal('bobo');
  });

  it('an option appended while the popup is open is immediately clickable/selectable', async () => {
    const el = (await fixture(html`
      <ty-select name="robot">
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();

    const fresh = document.createElement('ty-option');
    fresh.setAttribute('value', 'z');
    fresh.textContent = 'Z';
    el.appendChild(fresh);
    await tick();
    expect(fresh.getAttribute('role'), 'new option gets role=option via the child observer').to.equal('option');

    setTimeout(() => fresh.click());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;
    expect(ev.detail.value).to.equal('z');
  });
});

describe('ty-select — empty state (zero options)', () => {
  it('opens cleanly with no options; arrow/Enter are inert; required blocks the form', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot" required></ty-select>
      </form>
    `)) as HTMLFormElement;
    const el = form.querySelector('ty-select') as any;
    await tick();

    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open, 'opens with zero options, no crash').to.be.true;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await tick();
    expect(el.value).to.equal('');
    expect(form.checkValidity(), 'required + zero options + nothing selected').to.be.false;
  });
});

describe('ty-select property accessors', () => {
  it('compact getter/setter reflect the same underlying state as the attribute', async () => {
    const el = (await fixture(html`<ty-select><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    expect(el.compact).to.be.false;

    el.compact = true;
    await tick();
    expect(el.compact).to.be.true;
    expect(el.hasAttribute('compact')).to.be.true;
    expect(el.shadowRoot.querySelector('.select-stub').classList.contains('compact')).to.be.true;
  });

  it('placeholder getter/setter round-trips and updates the rendered text', async () => {
    const el = (await fixture(html`<ty-select><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();

    el.placeholder = 'Choose one';
    await tick();
    expect(el.placeholder).to.equal('Choose one');
    expect(el.getAttribute('placeholder')).to.equal('Choose one');
    const textEl = el.shadowRoot.querySelector('.dropdown-placeholder') as HTMLElement;
    expect(textEl.textContent).to.equal('Choose one');
  });

  it('label getter reads back the attribute-declared value, and the setter round-trips the same way', async () => {
    // Label chrome is baked into the shadow template on FIRST render only
    // (renderDesktop/renderMobile only rebuild innerHTML when
    // .select-container is absent) — so a label set after connect updates
    // the property/attribute but intentionally does not retroactively grow
    // a label element. Assert the getter/setter symmetry the task asks for,
    // not DOM re-render behavior that isn't part of this contract.
    const el = (await fixture(html`<ty-select label="Country"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    expect(el.label).to.equal('Country');
    expect(el.shadowRoot.querySelector('.ty-field-label')?.textContent).to.include('Country');

    el.label = 'Robot';
    await tick();
    expect(el.label, 'getter reflects the property setter').to.equal('Robot');
    expect(el.getAttribute('label'), 'setter uses the same setProperty path as the attribute').to.equal('Robot');
  });

  it('loading property setter matches attribute form', async () => {
    const el = (await fixture(html`<ty-select><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    expect(el.loading).to.be.false;

    el.loading = true;
    await tick();
    expect(el.loading).to.be.true;
    expect(el.hasAttribute('loading')).to.be.true;

    el.loading = false;
    await tick();
    expect(el.loading).to.be.false;
    expect(el.hasAttribute('loading')).to.be.false;
  });

  it('multiple property setter matches attribute form and toggles cardinality', async () => {
    const el = (await fixture(html`
      <ty-select value="a">
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    expect(el.multiple).to.be.false;

    el.multiple = true;
    await tick();
    expect(el.multiple).to.be.true;
    expect(el.hasAttribute('multiple')).to.be.true;
  });

  it('name property setter matches attribute form (both paths go through setProperty)', async () => {
    const el = (await fixture(html`<ty-select><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    expect(el.name).to.equal('');

    el.name = 'robot';
    await tick();
    expect(el.name, 'getter reflects the property setter').to.equal('robot');
    expect(el.getAttribute('name'), 'setter syncs to the attribute').to.equal('robot');

    el.setAttribute('name', 'droid');
    await tick();
    expect(el.name, 'attribute changes flow back through the same property').to.equal('droid');
  });
});

describe('ty-select mobile mode', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    // Force isMobileTouch() -> true (utils/mobile.ts checks pointer:coarse
    // + max-width via matchMedia) without needing real touch/viewport —
    // same technique as ty-date-picker's "native mobile input" suite.
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renders the mobile dialog instead of the desktop dropdown popup', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();

    expect(el.shadowRoot.querySelector('.mobile-dialog'), 'mobile dialog rendered').to.exist;
    expect(el.shadowRoot.querySelector('.dropdown-dialog'), 'desktop popup not rendered').to.not.exist;
    expect(el.shadowRoot.querySelector('.select-container').classList.contains('dropdown-mode-mobile')).to.be.true;
  });

  it('clicking the stub opens the mobile modal: showModal, scroll lock, aria-expanded, open event', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
        <ty-option value="b">B</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;
    expect(stub.getAttribute('aria-expanded')).to.equal('false');
    // Scroll lock is a reference-counted global singleton (see scroll-lock.ts)
    // shared with every other test in this file, some of which leave a
    // dropdown open — so assert THIS component's contribution via the lock
    // count delta, not the global documentElement.style.overflow value.
    const locksBefore = getActiveLocks().size;

    setTimeout(() => stub.click());
    const ev = (await oneEvent(el, 'open')) as CustomEvent;

    expect(ev.detail.mode).to.equal('mobile');
    expect(dialog.open, 'native dialog opened via showModal').to.be.true;
    expect(stub.getAttribute('aria-expanded')).to.equal('true');
    expect(getActiveLocks().size, 'opening the modal adds one scroll lock').to.equal(locksBefore + 1);
    expect(document.documentElement.style.overflow, 'lock manifests as overflow:hidden on <html>').to.equal('hidden');
  });

  it('selecting an option in single-select mode updates the value and closes the modal', async () => {
    const el = (await fixture(html`
      <ty-select name="robot">
        <ty-option value="bobo">Bobo</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;

    setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
    const ev = (await oneEvent(el, 'change')) as CustomEvent;

    expect(ev.detail.value).to.equal('eywa');
    expect(el.value).to.equal('eywa');
    await tick();
    expect(dialog.open, 'modal closes after a single-select pick').to.be.false;
  });

  it('multiple-select keeps the modal open across picks and accumulates values', async () => {
    const el = (await fixture(html`
      <ty-select multiple name="robots">
        <ty-option value="bobo">Bobo</ty-option>
        <ty-option value="eywa">EYWA</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;

    setTimeout(() => (el.querySelector('ty-option[value="bobo"]') as HTMLElement).click());
    await oneEvent(el, 'change');
    expect(dialog.open, 'stays open after first pick').to.be.true;

    setTimeout(() => (el.querySelector('ty-option[value="eywa"]') as HTMLElement).click());
    await oneEvent(el, 'change');
    expect(el.value).to.equal('bobo,eywa');
    expect(dialog.open, 'stays open after second pick').to.be.true;
  });

  it('mobile search filters options the same way desktop search does; clearing restores all', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const search = el.shadowRoot.querySelector('.mobile-search-input') as HTMLInputElement;
    expect(search, 'mobile search input rendered').to.exist;

    search.value = 'app';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('filtered-out'), 'apple matches').to.be.false;
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('filtered-out'), 'banana filtered out').to.be.true;

    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('filtered-out')).to.be.false;
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('filtered-out'), 'restored after clearing').to.be.false;
  });

  it('mobile search updates the "available" section count label live', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const title = () => el.shadowRoot.querySelector('.mobile-available-section .section-title') as HTMLElement;
    expect(title().textContent).to.include('(2)');

    const search = el.shadowRoot.querySelector('.mobile-search-input') as HTMLInputElement;
    search.value = 'app';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(title().textContent, 'count reflects only visible/matching options').to.include('(1)');
  });

  it('search takes the filtered rows off screen (the mobile row display does not beat it)', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
    const search = el.shadowRoot.querySelector('.mobile-search-input') as HTMLInputElement;
    search.value = 'app';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const shown = (v: string) => getComputedStyle(el.querySelector(`ty-option[value="${v}"]`)!).display !== 'none';
    expect(shown('a')).to.equal(true);
    expect(shown('b'), 'banana filtered out').to.equal(false);
  });

  it('an option the author hid stays out of the list and its count', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b" hidden>Banana</ty-option>
        <ty-option value="c">Cherry</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
    const banana = el.querySelector('ty-option[value="b"]') as HTMLElement;
    expect(banana.hasAttribute('hidden'), 'not unhidden on open').to.equal(true);
    expect(getComputedStyle(banana).display).to.equal('none');
    const title = el.shadowRoot.querySelector('.mobile-available-section .section-title') as HTMLElement;
    expect(title.textContent).to.include('(2)');
    (el.shadowRoot.querySelector('.mobile-close-button') as HTMLElement).click();
    await tick();
    expect(banana.hasAttribute('hidden'), 'not unhidden on close').to.equal(true);
  });

  it('closing via the close button runs closeMobileModal: dialog closes, scroll unlocks, aria-expanded resets, close event fires', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;
    const locksWhileOpen = getActiveLocks().size;

    const closeBtn = el.shadowRoot.querySelector('.mobile-close-button') as HTMLElement;
    setTimeout(() => closeBtn.click());
    const ev = (await oneEvent(el, 'close')) as CustomEvent;

    expect(ev.detail.mode).to.equal('mobile');
    expect(dialog.open).to.be.false;
    expect(stub.getAttribute('aria-expanded')).to.equal('false');
    // Same reference-counted global as the open test above — assert this
    // component's lock was released, not the global overflow value.
    expect(getActiveLocks().size, 'closing releases this component\'s scroll lock').to.equal(locksWhileOpen - 1);
  });

  it('closing resets mobile search state: the input is cleared and filtered options are restored', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const search = el.shadowRoot.querySelector('.mobile-search-input') as HTMLInputElement;
    search.value = 'app';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('filtered-out')).to.be.true;

    const closeBtn = el.shadowRoot.querySelector('.mobile-close-button') as HTMLElement;
    closeBtn.click();
    await tick();

    expect(search.value, 'search input cleared on close').to.equal('');
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('filtered-out'), 'all options unhidden on close').to.be.false;
  });

  it('closing via a backdrop click on the dialog itself (not its content) closes the modal', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;

    setTimeout(() => dialog.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await oneEvent(el, 'close');
    expect(dialog.open, 'backdrop click (target === dialog) closes it').to.be.false;
  });

  it('clicking mobile-dialog-content (not the backdrop itself) does not close the modal', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;
    const content = el.shadowRoot.querySelector('.mobile-dialog-content') as HTMLElement;

    content.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await tick();
    expect(dialog.open, 'click on content is not a backdrop click').to.be.true;
  });

  it('Escape (keydown on document) closes the mobile modal', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await tick();

    expect(dialog.open, 'Escape should close the mobile modal').to.be.false;
  });

  it('disabled options are unselectable in mobile mode too', async () => {
    const el = (await fixture(html`
      <ty-select name="robot">
        <ty-option value="a">A</ty-option>
        <ty-option value="b" disabled>B</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();

    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    (el.querySelector('ty-option[value="b"]') as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 60));

    expect(fired, 'clicking a disabled option must not fire change').to.be.false;
    expect(el.value).to.equal('');
  });

  it('form participation works when mounted in mobile mode: picking a value lands in FormData', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot">
          <ty-option value="bobo">Bobo</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    const el = form.querySelector('ty-select') as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();

    setTimeout(() => (el.querySelector('ty-option[value="bobo"]') as HTMLElement).click());
    await oneEvent(el, 'change');

    expect(new FormData(form).getAll('robot')).to.deep.equal(['bobo']);
  });

  it('Enter/Space/ArrowDown on the closed, focused stub opens the mobile modal (keyboard-only path)', async () => {
    const el = (await fixture(html`
      <ty-select>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await tick();

    const dialog = el.shadowRoot.querySelector('.mobile-dialog') as HTMLDialogElement;
    expect(dialog.open, 'opened via keyboard alone').to.be.true;
  });

  it('a pre-selected value is reflected in the stub even though rendering uses the mobile template', async () => {
    const el = (await fixture(html`
      <ty-select value="bobo">
        <ty-option value="bobo">Bobo Robot</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    expect(stub.classList.contains('has-selection')).to.be.true;
    const clone = el.querySelector('[cloned][slot="selected"]') as HTMLElement;
    expect(clone?.textContent).to.equal('Bobo Robot');
  });
});


describe('ty-select mobile selected strip', () => {
  let restoreMatchMedia: (() => void) | null = null;

  beforeEach(() => {
    const original = window.matchMedia;
    (window as any).matchMedia = (q: string) => ({
      matches: true, media: q, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {},
      removeEventListener() {}, dispatchEvent: () => false,
    });
    restoreMatchMedia = () => { (window as any).matchMedia = original; };
  });

  afterEach(() => { restoreMatchMedia?.(); restoreMatchMedia = null; });

  const openMobile = async (el: any) => {
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
  };

  // The accordion animates flex-grow over 220ms, so heights are only final
  // once it settles — a two-frame tick lands mid-flight.
  const settle = () => new Promise((r) => setTimeout(r, 300));

  const mount = async () => (await fixture(html`
    <ty-select multiple>
      <ty-option value="a">Alpha</ty-option>
      <ty-option value="b">Beta</ty-option>
      <ty-option value="c">Gamma</ty-option>
    </ty-select>
  `)) as any;

  it('starts collapsed with a zero count and the list owning the space', async () => {
    const el = await mount();
    await openMobile(el);
    const section = el.shadowRoot.querySelector('.mobile-selected-section') as HTMLElement;
    const body = el.shadowRoot.querySelector('.mobile-body') as HTMLElement;
    expect(section.getAttribute('data-empty'), 'collapsed while empty').to.equal('true');
    expect(section.querySelector('.section-count')!.textContent).to.equal('(0)');
    expect(body.dataset.expanded).to.equal('available');
  });

  it('renders a chip per selection and keeps the header count in step', async () => {
    const el = await mount();
    await openMobile(el);
    el.value = 'a,b';
    await tick();

    const section = el.shadowRoot.querySelector('.mobile-selected-section') as HTMLElement;
    const chips = el.shadowRoot.querySelectorAll('.mobile-selected-chip');
    expect(chips.length).to.equal(2);
    expect(Array.from(chips).map((c) => (c as HTMLElement).dataset.value)).to.eql(['a', 'b']);
    expect(section.getAttribute('data-empty')).to.equal('false');
    expect(section.querySelector('.section-count')!.textContent).to.equal('(2)');
  });

  it('a chip deselects its own value', async () => {
    const el = await mount();
    await openMobile(el);
    el.value = 'a,b';
    await tick();

    const chip = el.shadowRoot.querySelector('.mobile-selected-chip[data-value="a"]') as HTMLElement;
    chip.click();
    await tick();

    expect(el.value).to.equal('b');
    expect(el.shadowRoot.querySelectorAll('.mobile-selected-chip').length).to.equal(1);
  });

  it('tapping a header opens that section and collapses the other to its header', async () => {
    const el = await mount();
    await openMobile(el);
    el.value = 'a';
    await tick();

    const body = el.shadowRoot.querySelector('.mobile-body') as HTMLElement;
    const selectedSection = el.shadowRoot.querySelector('.mobile-selected-section') as HTMLElement;
    const availableSection = el.shadowRoot.querySelector('.mobile-available-section') as HTMLElement;
    const selectedHeader = el.shadowRoot.querySelector('[data-section="selected"]') as HTMLElement;
    const availableHeader = el.shadowRoot.querySelector('[data-section="available"]') as HTMLElement;

    const collapsedHeight = selectedSection.clientHeight;

    selectedHeader.click();
    await tick();
    expect(body.dataset.expanded, 'selected opens').to.equal('selected');
    expect(selectedHeader.getAttribute('aria-expanded')).to.equal('true');
    expect(availableHeader.getAttribute('aria-expanded')).to.equal('false');

    await settle();
    // Collapsed means header-only, not merely shorter.
    expect(availableSection.clientHeight, 'available collapses to its header')
      .to.equal(collapsedHeight);
    expect(selectedSection.clientHeight, 'selected now owns the space')
      .to.be.greaterThan(collapsedHeight);

    availableHeader.click();
    await tick();
    expect(body.dataset.expanded, 'and back again').to.equal('available');

    await settle();
    expect(selectedSection.clientHeight, 'selected collapses to its header')
      .to.equal(collapsedHeight);
    expect(availableSection.clientHeight).to.be.greaterThan(collapsedHeight);
  });

  it('the Available count excludes what is already selected', async () => {
    const el = await mount();
    await openMobile(el);
    const title = () => el.shadowRoot
      .querySelector('.mobile-available-section .section-title').textContent.trim();

    expect(title(), 'nothing picked yet').to.equal('Available (3)');

    el.value = 'a,b';
    await tick();
    expect(title(), 'two of three are in the strip above').to.equal('Available (1)');
  });

  it('typing hands the space back to the list', async () => {
    const el = await mount();
    await openMobile(el);
    el.value = 'a';
    await tick();

    (el.shadowRoot.querySelector('[data-section="selected"]') as HTMLElement).click();
    await tick();
    const body = el.shadowRoot.querySelector('.mobile-body') as HTMLElement;
    expect(body.dataset.expanded).to.equal('selected');

    const search = el.shadowRoot.querySelector('.mobile-search-input') as HTMLInputElement;
    search.value = 'ga';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await tick();
    expect(body.dataset.expanded, 'results need the room').to.equal('available');
  });

  it('an empty strip refuses the space, and giving up the last chip returns it', async () => {
    const el = await mount();
    await openMobile(el);
    const body = el.shadowRoot.querySelector('.mobile-body') as HTMLElement;

    (el.shadowRoot.querySelector('[data-section="selected"]') as HTMLElement).click();
    await tick();
    expect(body.dataset.expanded, 'nothing to expand into').to.equal('available');

    el.value = 'a';
    await tick();
    (el.shadowRoot.querySelector('[data-section="selected"]') as HTMLElement).click();
    await tick();
    expect(body.dataset.expanded).to.equal('selected');

    (el.shadowRoot.querySelector('.mobile-selected-chip') as HTMLElement).click();
    await tick();
    expect(body.dataset.expanded, 'last chip gone — space goes back to the list').to.equal('available');
  });
});

describe('ty-select error line (same as ty-input)', () => {
  const line = (el: any) =>
    el.shadowRoot.querySelector('.select-container > .error-message') as HTMLElement | null;
  const stubOf = (el: any) => el.shadowRoot.querySelector('.select-stub') as HTMLElement;

  it('renders under the field with aria-invalid + aria-describedby; "" clears it', async () => {
    const el = (await fixture(html`
      <ty-select label="Robot" error="Pick one"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    const msg = line(el)!;
    const stub = stubOf(el);
    expect(msg.textContent).to.equal('Pick one');
    expect(msg.previousElementSibling!.classList.contains('dropdown-wrapper'), 'under the field').to.be.true;
    expect(stub.classList.contains('error')).to.be.true;
    expect(stub.getAttribute('aria-invalid')).to.equal('true');
    expect(stub.getAttribute('aria-describedby')).to.equal(msg.id);
    expect(el.shadowRoot.getElementById(msg.id)).to.equal(msg);

    el.error = 'Still nothing';
    await tick();
    expect(line(el)!.textContent, 'updates in place').to.equal('Still nothing');

    el.error = '';
    await tick();
    expect(line(el)).to.equal(null);
    expect(stub.classList.contains('error')).to.be.false;
    expect(stub.hasAttribute('aria-invalid')).to.be.false;
    expect(stub.hasAttribute('aria-describedby')).to.be.false;
  });

  it('looks like ty-input\'s error line (font, color, spacing) and the field turns danger', async () => {
    const wrap = await fixture(html`
      <div>
        <ty-select error="Pick one"><ty-option value="a">A</ty-option></ty-select>
        <ty-input error="Pick one"></ty-input>
      </div>
    `);
    await tick();
    const select = wrap.querySelector('ty-select') as any;
    const input = wrap.querySelector('ty-input') as any;
    const a = getComputedStyle(line(select)!);
    const b = getComputedStyle(input.shadowRoot.querySelector('.error-message'));
    for (const prop of ['color', 'fontSize', 'lineHeight', 'letterSpacing', 'marginTop', 'paddingLeft'] as const) {
      expect(a[prop], prop).to.equal(b[prop]);
    }
    const stub = getComputedStyle(stubOf(select));
    const wrapper = getComputedStyle(input.shadowRoot.querySelector('.input-wrapper'));
    expect(stub.borderTopColor).to.equal(wrapper.borderTopColor);
    expect(stub.backgroundColor).to.equal(wrapper.backgroundColor);
  });

  it('compact and slot="trigger": the line sits under the trigger without widening the host', async () => {
    const long = 'A message much longer than the trigger it belongs to, so it has to wrap';
    const wrap = await fixture(html`
      <div>
        <ty-select compact multiple placeholder="Status" error=${long}>
          <ty-option value="a">A</ty-option>
        </ty-select>
        <ty-select error=${long}>
          <button slot="trigger" type="button">Pick</button>
          <ty-option value="a">A</ty-option>
        </ty-select>
      </div>
    `);
    await tick();
    const [compact, custom] = Array.from(wrap.querySelectorAll('ty-select')) as any[];
    for (const el of [compact, custom]) {
      const msg = line(el)!;
      expect(msg, 'line rendered').to.exist;
      const trigger = el.getAttribute('has-trigger') !== null
        ? el.querySelector('[slot="trigger"]')
        : stubOf(el);
      const host = el.getBoundingClientRect();
      expect(host.width, 'host still hugs the trigger').to.be.closeTo(trigger.getBoundingClientRect().width, 1);
      expect(msg.getBoundingClientRect().top).to.be.at.least(trigger.getBoundingClientRect().bottom);
    }
    // a custom trigger keeps its own look — no danger chrome around it
    expect(getComputedStyle(stubOf(custom)).borderTopStyle).to.equal('none');
  });

  it('slot="trigger": a short message under a narrow trigger stays readable, starting at its edge', async () => {
    const el = (await fixture(html`
      <ty-select error="Please select an item in the list.">
        <button slot="trigger" type="button">Pick</button>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const msg = line(el)!;
    const trigger = el.querySelector('button') as HTMLElement;
    const fontSize = parseFloat(getComputedStyle(msg).fontSize);
    expect(msg.getBoundingClientRect().height, 'one line, not a word per line').to.be.below(fontSize * 2);
    expect(msg.getBoundingClientRect().left, 'starts at the trigger').to.be.closeTo(trigger.getBoundingClientRect().left, 1);
    expect(el.getBoundingClientRect().width, 'host still hugs the trigger').to.be.closeTo(trigger.getBoundingClientRect().width, 1);
  });

  it('slot="trigger": the focused trigger carries aria-invalid and the message; cleared with the error', async () => {
    const el = (await fixture(html`
      <ty-select error="Pick one">
        <button slot="trigger" type="button">Pick</button>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const trigger = el.querySelector('button') as HTMLElement;
    expect(trigger.getAttribute('aria-invalid')).to.equal('true');
    expect(trigger.getAttribute('aria-description')).to.equal('Pick one');

    el.error = 'Still nothing';
    await tick();
    expect(trigger.getAttribute('aria-description')).to.equal('Still nothing');

    el.error = '';
    await tick();
    expect(trigger.hasAttribute('aria-invalid')).to.equal(false);
    expect(trigger.hasAttribute('aria-description')).to.equal(false);

    // a trigger slotted while the error shows gets it too
    el.error = 'Again';
    await tick();
    const next = document.createElement('button');
    next.slot = 'trigger';
    trigger.replaceWith(next);
    await tick();
    expect(next.getAttribute('aria-invalid')).to.equal('true');
    expect(trigger.hasAttribute('aria-invalid'), 'old one let go').to.equal(false);
  });

  it('slot="trigger": a morph stripping its aria while the error stays gets it back', async () => {
    const el = (await fixture(html`
      <ty-select error="Pick one">
        <button slot="trigger" type="button">Pick</button>
        <ty-option value="a">A</ty-option>
      </ty-select>
    `)) as any;
    await tick();
    const trigger = el.querySelector('button') as HTMLElement;
    // idiomorph syncing the button to server markup that has no aria; the
    // host's error is the same, so nothing re-renders
    trigger.removeAttribute('aria-invalid');
    trigger.removeAttribute('aria-description');
    el.setAttribute('error', 'Pick one');
    await tick();
    expect(trigger.getAttribute('aria-invalid')).to.equal('true');
    expect(trigger.getAttribute('aria-description')).to.equal('Pick one');

    el.removeAttribute('error');
    await tick();
    expect(trigger.hasAttribute('aria-invalid'), 'cleared with the error').to.equal(false);
    expect(trigger.hasAttribute('aria-description')).to.equal(false);
  });

  it('required: a submit attempt puts the message under the field, focuses the trigger, blocks submit', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <ty-select name="robot" required><ty-option value="a">A</ty-option></ty-select>
        <ty-select name="crew" required multiple><ty-option value="a">A</ty-option></ty-select>
        <button>Send</button>
      </form>
    `);
    let submitted = false;
    form.addEventListener('submit', (e) => { submitted = true; e.preventDefault(); });
    await tick();
    const [one, many] = Array.from(form.querySelectorAll('ty-select')) as any[];

    (form.querySelector('button') as HTMLElement).click();
    await tick();
    expect(submitted).to.equal(false);
    expect(one.getAttribute('error')).to.equal(one.validationMessage);
    expect(many.getAttribute('error')).to.equal(many.validationMessage);
    expect(line(one)!.textContent).to.equal(one.validationMessage);
    expect(one.shadowRoot.activeElement, 'first bad field focused').to.equal(stubOf(one));

    one.value = 'a';
    many.value = 'a';
    await tick();
    expect(one.hasAttribute('error'), 'cleared once valid').to.equal(false);
    expect(line(one)).to.equal(null);
    (form.querySelector('button') as HTMLElement).click();
    await tick();
    expect(submitted).to.equal(true);
  });

  it('reportValidity() writes the message and focuses the trigger (slotted one too)', async () => {
    const wrap = await fixture(html`
      <div>
        <ty-select required><ty-option value="a">A</ty-option></ty-select>
        <ty-select required><button slot="trigger" type="button">Pick</button><ty-option value="a">A</ty-option></ty-select>
      </div>
    `);
    await tick();
    const [plain, custom] = Array.from(wrap.querySelectorAll('ty-select')) as any[];
    expect(plain.reportValidity()).to.equal(false);
    expect(line(plain)!.textContent).to.equal(plain.validationMessage);
    expect(plain.shadowRoot.activeElement).to.equal(stubOf(plain));

    expect(custom.reportValidity()).to.equal(false);
    expect(line(custom)!.textContent).to.equal(custom.validationMessage);
    expect(document.activeElement).to.equal(custom.querySelector('button'));
  });

  it('a ty-button trigger takes focus from focus() and a submit; a <span> trigger leaves it to the field', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <input id="before">
        <ty-select id="tb" name="a" required><ty-button slot="trigger" type="button">Pick</ty-button><ty-option value="a">A</ty-option></ty-select>
        <ty-select id="sp" name="b"><span slot="trigger">Pick</span><ty-option value="a">A</ty-option></ty-select>
        <button id="send">Send</button>
      </form>
    `);
    await tick();
    form.addEventListener('submit', (e) => e.preventDefault());
    const tb = form.querySelector('#tb') as any;
    const sp = form.querySelector('#sp') as any;
    const before = form.querySelector('#before') as HTMLInputElement;
    const tyButton = tb.querySelector('ty-button') as HTMLElement;
    const onTrigger = () => tyButton.shadowRoot!.activeElement === tyButton.shadowRoot!.querySelector('button');

    before.focus();
    tb.focus();
    expect(onTrigger(), 'focus() reaches the button inside the ty-button').to.equal(true);

    before.focus();
    (form.querySelector('#send') as HTMLElement).click();
    await tick();
    expect(tb.getAttribute('error')).to.equal(tb.validationMessage);
    expect(onTrigger(), 'a submit focuses the trigger').to.equal(true);

    before.focus();
    sp.focus();
    expect(sp.shadowRoot.activeElement === sp.shadowRoot.querySelector('.select-stub'), 'the field takes it').to.equal(true);
  });

  it('checkValidity() shows the message but moves no focus', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-select name="robot" required><ty-option value="a">A</ty-option></ty-select></form>
    `);
    await tick();
    const el = form.querySelector('ty-select') as any;
    expect(el.hasAttribute('error'), 'nothing before a check').to.equal(false);
    expect(form.checkValidity()).to.equal(false);
    expect(el.getAttribute('error')).to.equal(el.validationMessage);
    expect(el.shadowRoot.activeElement).to.equal(null);
  });

  it('a user emptying a required select shows the message right away', async () => {
    const el = (await fixture(html`
      <ty-select required multiple value="a"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    expect(el.hasAttribute('error')).to.equal(false);
    el.deselectValue('a'); // what a chip's × or a list toggle does
    await tick();
    expect(el.getAttribute('error')).to.equal(el.validationMessage);
    el.value = 'a';
    await tick();
    expect(el.hasAttribute('error')).to.equal(false);
  });

  it('a value set in code shows nothing (only user changes do)', async () => {
    const el = (await fixture(html`
      <ty-select required value="a"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    el.value = '';
    await tick();
    expect(el.validity.valueMissing).to.equal(true);
    expect(el.hasAttribute('error')).to.equal(false);
  });

  it('clear() from code shows nothing; the built-in × (a user) does', async () => {
    const el = (await fixture(html`
      <ty-select required value="a"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    let changes = 0;
    el.addEventListener('change', () => changes++);
    el.clear();
    await tick();
    expect(changes, 'still a change event').to.equal(1);
    expect(el.validity.valueMissing).to.equal(true);
    expect(el.hasAttribute('error')).to.equal(false);

    el.value = 'a';
    await tick();
    (el.shadowRoot.querySelector('.select-clear') as HTMLElement).click();
    await tick();
    expect(el.value).to.equal('');
    expect(el.getAttribute('error')).to.equal(el.validationMessage);
  });
});

describe('ty-select error look (flavor="danger" whatever the flavor, flavor untouched)', () => {
  // The token sheet isn't loaded in tests: distinct colors per token, so two
  // looks only match when they resolve the same tokens.
  const TOKENS: Record<string, string> = {
    '--ty-color-danger': 'rgb(200, 0, 0)',
    '--ty-color-danger-soft': 'rgb(201, 0, 0)',
    '--ty-color-danger-strong': 'rgb(202, 0, 0)',
    '--ty-color-danger-faint': 'rgb(203, 0, 0)',
    '--ty-color-danger-bold': 'rgb(204, 0, 0)',
    '--ty-bg-danger-soft': 'rgb(255, 230, 230)',
    '--ty-color-success': 'rgb(0, 200, 0)',
    '--ty-color-success-soft': 'rgb(0, 201, 0)',
    '--ty-color-success-strong': 'rgb(0, 202, 0)',
    '--ty-color-brand': 'rgb(0, 0, 200)',
    '--ty-color-primary': 'rgb(1, 2, 3)',
    '--ty-color-primary-strong': 'rgb(4, 5, 6)',
    '--ty-input-border': 'rgb(100, 100, 100)',
    '--ty-input-border-focus': 'rgb(101, 101, 101)',
    '--ty-input-shadow-focus': 'rgb(102, 102, 102)',
    '--ty-input-border-hover': 'rgb(103, 103, 103)',
    '--ty-input-bg': 'rgb(250, 250, 250)',
  };
  before(() => {
    for (const [k, v] of Object.entries(TOKENS)) document.documentElement.style.setProperty(k, v);
  });
  after(() => {
    for (const k of Object.keys(TOKENS)) document.documentElement.style.removeProperty(k);
  });

  /** Everything the flavor colors: accent variables, count badge, spinner. */
  const accent = (el: any) => {
    const root = el.shadowRoot;
    const stub = getComputedStyle(root.querySelector('.select-stub'));
    const badge = getComputedStyle(root.querySelector('.select-count'));
    const spinner = getComputedStyle(root.querySelector('.dropdown-loading-spinner'));
    return [
      stub.getPropertyValue('--select-accent'),
      stub.getPropertyValue('--select-accent-bold'),
      stub.getPropertyValue('--select-ring'),
      badge.color,
      badge.backgroundColor,
      spinner.color,
    ].join(' | ');
  };
  /** accent() plus the field itself. */
  const look = (el: any) => {
    const stub = getComputedStyle(el.shadowRoot.querySelector('.select-stub'));
    return `${accent(el)} | ${stub.borderTopColor} | ${stub.backgroundColor}`;
  };
  /** Counts flavor writes under `target` until called back. */
  const watchFlavor = (target: Node) => {
    const records: MutationRecord[] = [];
    const mo = new MutationObserver((r) => records.push(...r));
    mo.observe(target, { attributes: true, subtree: true, attributeFilter: ['flavor'] });
    return () => {
      records.push(...mo.takeRecords());
      mo.disconnect();
      return records.length;
    };
  };
  const stubOf = (el: any) => el.shadowRoot.querySelector('.select-stub') as HTMLElement;
  /** The field at rest, its border under a real mouse, and focused. */
  const states = async (el: any) => {
    const stub = stubOf(el);
    const rest = look(el);
    stub.scrollIntoView({ block: 'center' });
    const r = stub.getBoundingClientRect();
    await sendMouse({ type: 'move', position: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] });
    const hover = getComputedStyle(stub).borderTopColor;
    await resetMouse();
    stub.focus();
    const s = getComputedStyle(stub);
    const focused = `${s.borderTopColor} | ${s.boxShadow}`;
    stub.blur();
    return `rest ${rest} || hover ${hover} || focused ${focused}`;
  };
  // Error beats every flavor: built-in, +/- shades, the neutral ones, and a
  // custom one (its sheet is adopted after the built-in one)
  const ANY_FLAVOR = [null, 'neutral', 'success', 'primary+', 'neutral-', 'danger-', 'brand'];
  const tag = (flavor: string | null, attrs = '') =>
    `<ty-select${flavor === null ? '' : ` flavor="${flavor}"`}${attrs}><ty-option value="a">A</ty-option></ty-select>`;
  const selects = async (markup: string) => {
    const wrap = await fixture(html`<div></div>`);
    wrap.innerHTML = markup;
    await tick();
    return Array.from(wrap.querySelectorAll('ty-select')) as any[];
  };
  const twins = async () => {
    const wrap = await fixture(html`
      <div>
        <ty-select id="plain"><ty-option value="a">A</ty-option></ty-select>
        <ty-select id="danger" flavor="danger"><ty-option value="a">A</ty-option></ty-select>
        <ty-select id="danger-err" flavor="danger" error="x"><ty-option value="a">A</ty-option></ty-select>
      </div>
    `);
    await tick();
    const [plain, danger, dangerErr] = Array.from(wrap.querySelectorAll('ty-select')) as any[];
    return { plain, danger, dangerErr };
  };

  it('a neutral select with an error looks exactly like flavor="danger"; clearing it looks neutral again', async () => {
    const t = await twins();
    const wrap = await fixture(html`
      <div>
        <ty-select><ty-option value="a">A</ty-option></ty-select>
        <ty-select flavor="neutral"><ty-option value="a">A</ty-option></ty-select>
      </div>
    `);
    await tick();
    const writes = watchFlavor(wrap);
    const [none, neutral] = Array.from(wrap.querySelectorAll('ty-select')) as any[];
    expect(accent(t.danger) !== accent(t.plain), 'the probe tells danger from neutral').to.equal(true);

    for (const el of [none, neutral]) el.error = 'Taken';
    await tick();
    for (const el of [none, neutral]) {
      expect(look(el)).to.equal(look(t.dangerErr));
      expect(accent(el)).to.equal(accent(t.danger));
      expect(el.flavor).to.equal('neutral');
    }
    expect(none.hasAttribute('flavor')).to.equal(false);
    expect(neutral.getAttribute('flavor')).to.equal('neutral');

    for (const el of [none, neutral]) el.error = '';
    await tick();
    for (const el of [none, neutral]) {
      expect(look(el)).to.equal(look(t.plain));
      expect(el.flavor).to.equal('neutral');
    }
    expect(none.hasAttribute('flavor')).to.equal(false);
    expect(writes(), 'no flavor attribute written').to.equal(0);
  });

  it('open: the border and ring are danger\'s too, whatever the flavor', async () => {
    const ring = (el: any) => {
      const stub = getComputedStyle(el.shadowRoot.querySelector('.select-stub'));
      return `${stub.borderTopColor} | ${stub.boxShadow}`;
    };
    const openRing = async (el: any) => {
      (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
      await tick();
      expect(el.shadowRoot.querySelector('.dropdown-dialog').open).to.equal(true);
      // read while open, then close for the next one
      const seen = ring(el);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await tick();
      return seen;
    };
    const [danger, plain] = await selects(tag('danger', ' not-searchable error="x"') + tag(null, ' not-searchable'));
    const dangerRing = await openRing(danger);
    expect(dangerRing !== await openRing(plain), 'not the neutral ring').to.equal(true);
    for (const flavor of ANY_FLAVOR) {
      const [el] = await selects(tag(flavor, ' not-searchable error="x"'));
      expect(await openRing(el), String(flavor)).to.equal(dangerRing);
    }
  });

  it('any flavor: an error looks exactly like flavor="danger" at rest, hovered and focused; cleared, the flavor look is back', async () => {
    const [plain] = await selects(tag(null));
    expect((await states(plain)).split(' || ')[1], 'the probe sees the hover').to.equal('hover rgb(103, 103, 103)');
    const writes = watchFlavor(document.body);
    for (const flavor of ANY_FLAVOR) {
      const [el, own, danger] = await selects(tag(flavor) + tag(flavor) + tag('danger', ' error="x"'));
      const names = el.getAttributeNames().join();
      const ownLook = await states(own);
      el.error = 'Taken';
      await tick();
      expect(await states(el), `${flavor} + error`).to.equal(await states(danger));
      expect(el.getAttribute('flavor'), `${flavor}: the attribute`).to.equal(flavor);
      expect(el.flavor).to.equal(flavor ?? 'neutral');
      el.error = '';
      await tick();
      expect(await states(el), `${flavor}: cleared`).to.equal(ownLook);
      expect(el.getAttributeNames().filter((a: string) => a !== 'error').join(), 'only error came and went').to.equal(names);
    }
    expect(writes(), 'no flavor attribute written').to.equal(0);
  });

  it('any flavor: compact, and a slotted trigger left bare, look like flavor="danger" with the error', async () => {
    const trigger = '<button slot="trigger" type="button">Pick</button>';
    for (const flavor of ANY_FLAVOR) {
      const [compact, dangerCompact] = await selects(tag(flavor, ' compact multiple error="x"') + tag('danger', ' compact multiple error="x"'));
      expect(await states(compact), `${flavor} compact`).to.equal(await states(dangerCompact));
      const [slotted, dangerSlotted] = await selects(
        tag(flavor, ' error="x"').replace('<ty-option', trigger + '<ty-option') +
        tag('danger', ' error="x"').replace('<ty-option', trigger + '<ty-option'));
      expect(look(slotted), `${flavor} slot="trigger"`).to.equal(look(dangerSlotted));
      expect(getComputedStyle(stubOf(slotted)).borderTopStyle, 'no chrome around it').to.equal('none');
    }
  });

  it('any flavor: a page-level --select-accent* override shows on the error as on flavor="danger"', async () => {
    const style = document.createElement('style');
    style.textContent = 'ty-select.ov { --select-accent: rgb(7, 7, 7); --select-accent-bold: rgb(8, 8, 8); --select-ring: rgb(9, 9, 9); }';
    document.head.append(style);
    try {
      for (const flavor of ANY_FLAVOR) {
        const [el, danger] = await selects(tag(flavor, ' class="ov" error="x"') + tag('danger', ' class="ov" error="x"'));
        expect(getComputedStyle(stubOf(danger)).borderTopColor, 'the override is the resting border').to.equal('rgb(7, 7, 7)');
        expect(await states(el), String(flavor)).to.equal(await states(danger));
      }
    } finally {
      style.remove();
    }
  });

  it('any flavor: disabled with an error looks like flavor="danger" disabled, no red tint', async () => {
    const [danger, dangerErr, enabled] = await selects(tag('danger', ' disabled') + tag('danger', ' disabled error="x"') + tag('danger', ' error="x"'));
    expect(look(danger) !== look(enabled), 'the probe sees disabled').to.equal(true);
    expect(look(dangerErr), 'flavor="danger" with the error').to.equal(look(danger));
    for (const flavor of ANY_FLAVOR) {
      const [el] = await selects(tag(flavor, ' disabled error="x"'));
      expect(look(el), String(flavor)).to.equal(look(danger));
    }
  });

  it('attribute order does not matter, and nothing is rewritten', async () => {
    const t = await twins();
    const wrap = await fixture(html`<div></div>`);
    const writes = watchFlavor(wrap);
    wrap.innerHTML = `
      <ty-select error="x" flavor="success"><ty-option value="a">A</ty-option></ty-select>
      <ty-select flavor="success" error="x"><ty-option value="a">A</ty-option></ty-select>
      <ty-select error="x" flavor="neutral"><ty-option value="a">A</ty-option></ty-select>
      <ty-select flavor="neutral" error="x"><ty-option value="a">A</ty-option></ty-select>
      <ty-select error="x"><ty-option value="a">A</ty-option></ty-select>
      <ty-select flavor="success"><ty-option value="a">A</ty-option></ty-select>`;
    await tick();
    const [s1, s2, n1, n2, none, success] = Array.from(wrap.querySelectorAll('ty-select')) as any[];
    for (const el of [s1, s2, n1, n2, none]) expect(look(el)).to.equal(look(t.dangerErr));

    for (const el of [s1, s2, n1, n2, none]) el.error = '';
    await tick();
    for (const el of [s1, s2]) expect(look(el)).to.equal(look(success));
    for (const el of [n1, n2, none]) expect(look(el)).to.equal(look(t.plain));
    expect(s1.getAttribute('flavor')).to.equal('success');
    expect(n1.getAttribute('flavor')).to.equal('neutral');
    expect(none.hasAttribute('flavor')).to.equal(false);
    expect(writes()).to.equal(0);
  });

  it('error set while detached shows once connected', async () => {
    const t = await twins();
    const wrap = await fixture(html`<div></div>`);
    const byProp = document.createElement('ty-select') as any;
    byProp.error = 'x';
    const byAttr = document.createElement('ty-select') as any;
    byAttr.setAttribute('error', 'x');
    wrap.append(byProp, byAttr);
    await tick();
    for (const el of [byProp, byAttr]) {
      expect(look(el)).to.equal(look(t.dangerErr));
      expect(el.hasAttribute('flavor')).to.equal(false);
    }
  });

  it('the author changing flavor while the error shows: still danger, and theirs once it clears', async () => {
    const t = await twins();
    const success = (await fixture(html`<ty-select flavor="success"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    const el = (await fixture(html`<ty-select error="x"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    expect(look(el)).to.equal(look(t.dangerErr));

    el.flavor = 'success';
    await tick();
    expect(look(el), 'success: danger').to.equal(look(t.dangerErr));
    el.error = '';
    await tick();
    expect(look(el), 'cleared: success').to.equal(look(success));
    el.error = 'x';
    el.removeAttribute('flavor');
    await tick();
    expect(look(el), 'none again: danger').to.equal(look(t.dangerErr));
    el.setAttribute('flavor', 'neutral');
    await tick();
    expect(look(el), 'neutral: danger').to.equal(look(t.dangerErr));

    // The author's own danger stays once the error clears
    el.flavor = 'danger';
    el.error = '';
    await tick();
    expect(el.flavor).to.equal('danger');
    expect(look(el)).to.equal(look(t.danger));
  });

  it('a copy (cloneNode, innerHTML) looks the same and clears the same', async () => {
    const t = await twins();
    const el = (await fixture(html`<ty-select error="x"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    const clone = el.cloneNode(true) as any;
    el.after(clone);
    const holder = document.createElement('div');
    holder.innerHTML = el.outerHTML;
    el.after(holder);
    const html2 = holder.querySelector('ty-select') as any;
    await tick();
    for (const copy of [clone, html2]) {
      expect(copy.hasAttribute('flavor')).to.equal(false);
      expect(look(copy)).to.equal(look(t.dangerErr));
      copy.error = '';
    }
    await tick();
    for (const copy of [clone, html2]) {
      expect(look(copy)).to.equal(look(t.plain));
      expect(copy.flavor).to.equal('neutral');
    }
  });

  it('a morph rewriting the attributes: the look always follows them', async () => {
    const t = await twins();
    const success = (await fixture(html`<ty-select flavor="success"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    const el = (await fixture(html`<ty-select error="x"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    // What idiomorph does: set the new attributes, drop the ones not there
    const morph = async (attrs: Record<string, string>) => {
      for (const name of ['flavor', 'error']) {
        if (name in attrs) el.setAttribute(name, attrs[name]);
        else el.removeAttribute(name);
      }
      await tick();
    };
    await morph({ flavor: 'success', error: 'x' });
    expect(look(el)).to.equal(look(t.dangerErr));
    await morph({ flavor: 'success' });
    expect(look(el)).to.equal(look(success));
    await morph({ error: 'x' });
    expect(look(el)).to.equal(look(t.dangerErr));
    await morph({});
    expect(look(el), 'no error: neutral, not stuck danger').to.equal(look(t.plain));
    await morph({ flavor: 'danger' });
    expect(look(el)).to.equal(look(t.danger));
    await morph({});
    expect(look(el)).to.equal(look(t.plain));
  });

  it('validation (submit, a fix, reportValidity, reset): danger while its message shows; flavor never touched', async () => {
    const t = await twins();
    const form = await fixture<HTMLFormElement>(html`
      <form><ty-select name="robot" required><ty-option value="a">A</ty-option></ty-select><button>Send</button></form>
    `);
    form.addEventListener('submit', (e) => e.preventDefault());
    await tick();
    const el = form.querySelector('ty-select') as any;
    const writes = watchFlavor(form);

    (form.querySelector('button') as HTMLElement).click();
    await tick();
    expect(el.getAttribute('error')).to.equal(el.validationMessage);
    expect(accent(el)).to.equal(accent(t.danger));

    el.value = 'a';
    await tick();
    expect(el.hasAttribute('error')).to.equal(false);
    expect(accent(el)).to.equal(accent(t.plain));

    el.value = '';
    expect(el.reportValidity()).to.equal(false);
    await tick();
    expect(accent(el)).to.equal(accent(t.danger));

    form.reset();
    await tick();
    expect(el.hasAttribute('error')).to.equal(false);
    expect(accent(el)).to.equal(accent(t.plain));
    expect(el.flavor).to.equal('neutral');
    expect(writes()).to.equal(0);
  });
});

describe('ty-select error line — mobile skin', () => {
  let originalMatchMedia: typeof window.matchMedia;
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: true, media: query, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => { window.matchMedia = originalMatchMedia; });

  it('renders the line under the mobile trigger, with the same aria', async () => {
    const el = (await fixture(html`
      <ty-select error="Pick one"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    await tick();
    expect(el.shadowRoot.querySelector('.dropdown-mode-mobile')).to.exist;
    const msg = el.shadowRoot.querySelector('.select-container > .error-message') as HTMLElement;
    expect(msg.textContent).to.equal('Pick one');
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    expect(stub.getAttribute('aria-describedby')).to.equal(msg.id);
  });
});

describe('ty-select closing paths release the scroll lock', () => {
  const open = async (el: any) => {
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
  };
  const lockedBy = (el: any) => Array.from(getActiveLocks()).some((id) => id.startsWith(`select-${el.id}-`));

  it('Escape closes the list and puts focus back on the trigger', async () => {
    const el = (await fixture(html`<ty-select id="esc-focus"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await open(el);
    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(dialog.open).to.be.true;
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await tick();
    expect(dialog.open).to.be.false;
    expect(el.shadowRoot.activeElement).to.equal(el.shadowRoot.querySelector('.select-stub'));
    expect(lockedBy(el)).to.be.false;
  });

  it('closed from outside (native close): state, aria-expanded and lock follow', async () => {
    const el = (await fixture(html`<ty-select id="outside-close"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await open(el);
    expect(lockedBy(el)).to.be.true;
    let closes = 0;
    el.addEventListener('close', () => closes++);
    (el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement).close();
    await tick();
    expect(lockedBy(el)).to.be.false;
    expect(el.shadowRoot.querySelector('.select-stub').getAttribute('aria-expanded')).to.equal('false');
    expect(closes).to.equal(1);

    await open(el); // and it opens again
    expect((el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement).open).to.be.true;
  });

  it('a native cancel (close request) closes it our way', async () => {
    const el = (await fixture(html`<ty-select id="cancel-close"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await open(el);
    const dialog = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await tick();
    expect(dialog.open).to.be.false;
    expect(lockedBy(el)).to.be.false;
  });

  it('closed from outside: aria-expanded follows before the next task (no wait for the close event)', async () => {
    const el = (await fixture(html`<ty-select id="outside-sync"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await open(el);
    (el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement).close();
    await Promise.resolve();
    expect(el.shadowRoot.querySelector('.select-stub').getAttribute('aria-expanded')).to.equal('false');
    expect(lockedBy(el)).to.be.false;
  });

  it('removed while open: the lock goes with it', async () => {
    const el = (await fixture(html`<ty-select id="removed-open"><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await open(el);
    expect(lockedBy(el)).to.be.true;
    el.remove();
    expect(lockedBy(el)).to.be.false;
  });
});

describe('ty-select keys reach the open list wherever it lives', () => {
  const key = (target: EventTarget, k: string) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true }));
  const openList = async (el: any) => {
    (el.shadowRoot.querySelector('.select-stub') as HTMLElement).click();
    await tick();
    const list = el.shadowRoot.querySelector('.dropdown-dialog') as HTMLDialogElement;
    expect(list.open, 'list open').to.equal(true);
    return list;
  };

  it('after a DOM move: ArrowDown + Enter still pick', async () => {
    const wrap = await fixture(html`
      <div>
        <div id="a"><ty-select id="moved"><ty-option value="o1">One</ty-option><ty-option value="o2">Two</ty-option></ty-select></div>
        <div id="b"></div>
      </div>
    `);
    const el = wrap.querySelector('ty-select') as any;
    await tick();
    wrap.querySelector('#b')!.append(el);
    await tick();
    const list = await openList(el);
    key(list, 'ArrowDown');
    key(list, 'Enter');
    await tick();
    expect(el.value).to.equal('o1');
    expect(list.open).to.equal(false);
  });

  it('inside a ty-popup: arrows and Enter pick, Escape closes the list and leaves the popup open', async () => {
    const wrap = await fixture(html`
      <span id="anchor" tabindex="0">Open
        <ty-popup><div><ty-select id="in-popup"><ty-option value="o1">One</ty-option><ty-option value="o2">Two</ty-option></ty-select></div></ty-popup>
      </span>
    `);
    const popup = wrap.querySelector('ty-popup') as any;
    const el = wrap.querySelector('ty-select') as any;
    popup.openPopup();
    await tick();
    const popupDialog = popup.shadowRoot.querySelector('dialog') as HTMLDialogElement;
    expect(popupDialog.open, 'popup open').to.equal(true);

    let list = await openList(el);
    key(list, 'ArrowDown');
    key(list, 'ArrowDown');
    key(list, 'Enter');
    await tick();
    expect(el.value).to.equal('o2');
    expect(popupDialog.open, 'popup stays open after a pick').to.equal(true);

    list = await openList(el);
    key(list, 'Escape');
    await tick();
    expect(list.open, 'list closed').to.equal(false);
    expect(popupDialog.open, 'popup stays open').to.equal(true);
    expect(el.shadowRoot.activeElement, 'focus back on the trigger').to.equal(el.shadowRoot.querySelector('.select-stub'));
    popupDialog.close();
  });

  it('focus() on a disabled select does nothing, like a disabled <select>', async () => {
    const el = (await fixture(html`<ty-select disabled><ty-option value="a">A</ty-option></ty-select>`)) as any;
    await tick();
    el.focus();
    expect(el.shadowRoot.activeElement).to.equal(null);
    expect(document.activeElement).to.not.equal(el);
  });
});
