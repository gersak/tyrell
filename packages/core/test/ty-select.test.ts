import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../lib/components/select.js';
import '../lib/components/input.js';
import '../lib/components/option.js';
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

describe('ty-select clearable', () => {
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
    expect(clearBtn.hidden, 'visible: selected + clearable default true').to.be.false;

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

  it('not-clearable keeps the button hidden despite a selection', async () => {
    const el = (await fixture(html`
      <ty-select value="bobo" not-clearable>
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

  it('no FormData entry is submitted when nothing is selected', async () => {
    const form = (await fixture(html`
      <form>
        <ty-select name="robot">
          <ty-option value="bobo">Bobo</ty-option>
        </ty-select>
      </form>
    `)) as HTMLFormElement;
    await tick();
    expect(new FormData(form).has('robot')).to.be.false;
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
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('hidden')).to.be.true;
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('hidden')).to.be.true;

    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(options.style.display, 'clearing the query restores the list').to.equal('');
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('hidden')).to.be.false;
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
    expect(el.querySelector('ty-option[value="x"]')!.hasAttribute('hidden'), 'matched via label attribute').to.be.false;
    expect(el.querySelector('ty-option[value="y"]')!.hasAttribute('hidden'), 'not a match').to.be.true;

    search.value = 'rich';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ty-option[value="x"]')!.hasAttribute('hidden'), 'its own rich textContent no longer participates once label is set').to.be.true;
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
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('hidden'), 'apple matches').to.be.false;
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('hidden'), 'banana filtered out').to.be.true;

    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('ty-option[value="a"]')!.hasAttribute('hidden')).to.be.false;
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('hidden'), 'restored after clearing').to.be.false;
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
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('hidden')).to.be.true;

    const closeBtn = el.shadowRoot.querySelector('.mobile-close-button') as HTMLElement;
    closeBtn.click();
    await tick();

    expect(search.value, 'search input cleared on close').to.equal('');
    expect(el.querySelector('ty-option[value="b"]')!.hasAttribute('hidden'), 'all options unhidden on close').to.be.false;
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
