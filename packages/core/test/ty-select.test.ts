import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../lib/components/select.js';
import '../lib/components/input.js';
import '../lib/components/option.js';

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

    const openShadow = getComputedStyle(stub).boxShadow;
    // color-mix() results serialize in the mix's color space (oklab here),
    // not the original rgb() string, so assert shape/alpha rather than an
    // exact color match: a real 3px ring at 15% alpha, not the closed 'none'.
    expect(openShadow, 'ring appears while open').to.not.equal('none');
    expect(openShadow, 'ring is a 3px spread').to.match(/0px 0px 0px 3px/);
    expect(openShadow, 'ring is at 15% alpha').to.match(/\/ 0\.15\)/);
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
  // Fields come in exactly three sizes; legacy xs/xl coerce to sm/lg.
  const SIZES = { sm: '2.25rem', md: '2.5rem', lg: '2.75rem' };
  const EXPECTED: Record<string, number> = { sm: 36, md: 40, lg: 44 };

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

  (['sm', 'md', 'lg'] as const).forEach((size) => {
    it(`stub height matches input at size=${size} (${EXPECTED[size]}px)`, async () => {
      const inp = (await fixture(html`<ty-input size=${size} placeholder="x"></ty-input>`)) as any;
      const sel = (await fixture(html`
        <ty-select size=${size}><ty-option value="a">A</ty-option></ty-select>
      `)) as any;
      await tick();

      const inputH = inp.shadowRoot.querySelector('.input-wrapper').getBoundingClientRect().height;
      const stub = sel.shadowRoot.querySelector('.select-stub');
      const stubH = stub.getBoundingClientRect().height;

      // The size class must actually reach the stub (the bug was: applied but unstyled)
      expect(stub.classList.contains(size), `stub carries .${size}`).to.be.true;
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

  it('forces the search row on even under the auto threshold', async () => {
    const el = (await fixture(html`
      <ty-select allow-create><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const header = el.shadowRoot.querySelector('.dropdown-header') as HTMLElement;
    expect(header.hidden, 'search row shown').to.be.false;
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
      <ty-select searchable="always"><ty-option value="a">A</ty-option></ty-select>
    `)) as any;
    const stub = el.shadowRoot.querySelector('.select-stub') as HTMLElement;
    stub.click();
    await tick();
    const search = el.shadowRoot.querySelector('.dropdown-search-input') as HTMLInputElement;
    search.value = 'Nothing Matches This';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await pressEnter();

    expect(el.querySelectorAll('ty-option').length).to.equal(1);
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
