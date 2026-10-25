import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { TyOption } from '../lib/components/option.js';

describe('ty-option', () => {
  describe('construction', () => {
    it('builds the shadow content wrapper synchronously in the constructor, before connection', () => {
      const el = document.createElement('ty-option') as any;
      expect(el.shadowRoot.querySelector('.option-content'), 'wrapper built pre-connect').to.exist;
    });

    it('reuses the same wrapper node across re-renders instead of recreating it', async () => {
      const el = (await fixture(html`<ty-option value="a">A</ty-option>`)) as any;
      const wrapper = el.shadowRoot.querySelector('.option-content');

      el.setAttribute('selected', '');
      el.setAttribute('highlighted', '');
      el.removeAttribute('selected');

      expect(el.shadowRoot.querySelector('.option-content')).to.equal(wrapper);
    });
  });

  describe('value resolution priority: property > attribute > textContent', () => {
    it('falls back to trimmed textContent when neither property nor attribute is set', async () => {
      const el = (await fixture(html`<ty-option>  Bobo Robot  </ty-option>`)) as any;
      expect(el.value).to.equal('Bobo Robot');
    });

    it('rich HTML content is reduced to plain trimmed text for the value fallback', async () => {
      const el = (await fixture(html`<ty-option><b>Bobo</b> <span class="price">$50</span></ty-option>`)) as any;
      expect(el.value).to.equal('Bobo $50');
    });

    it('the value attribute wins over textContent', async () => {
      const el = (await fixture(html`<ty-option value="bobo">Display Text</ty-option>`)) as any;
      expect(el.value).to.equal('bobo');
    });

    it('the value property (once set) wins over the attribute', async () => {
      const el = (await fixture(html`<ty-option value="bobo">Display Text</ty-option>`)) as any;
      el.value = 'eywa';
      expect(el.value).to.equal('eywa');
      expect(el.getAttribute('value')).to.equal('eywa');
    });

    it('an empty value="" attribute resolves to "" via the attribute-fallback branch, not undefined', async () => {
      // '' || undefined === undefined, so attributeChangedCallback leaves
      // _value undefined; getOptionValue then falls through to the raw
      // attribute lookup (attrValue !== null), which returns ''.
      const el = (await fixture(html`<ty-option value="">Display Text</ty-option>`)) as any;
      expect(el.value).to.equal('');
    });

    it('setting the value property to "" round-trips to "" after the attribute-change re-derives it', async () => {
      const el = (await fixture(html`<ty-option>Display Text</ty-option>`)) as any;
      el.value = '';
      expect(el.getAttribute('value')).to.equal('');
      expect(el.value).to.equal('');
    });

    it('removing the value attribute also clears a property-derived value, falling back to textContent', async () => {
      const el = (await fixture(html`<ty-option>Fallback Text</ty-option>`)) as any;
      el.value = 'explicit';
      expect(el.value).to.equal('explicit');

      // attributeChangedCallback fires on removal with newValue === null,
      // resetting the internal _value regardless of how it was set.
      el.removeAttribute('value');
      expect(el.value).to.equal('Fallback Text');
    });

    it('setting value to the same string twice does not throw and leaves the attribute intact', async () => {
      const el = (await fixture(html`<ty-option value="bobo">B</ty-option>`)) as any;
      el.value = 'bobo';
      el.value = 'bobo';
      expect(el.value).to.equal('bobo');
      expect(el.getAttribute('value')).to.equal('bobo');
    });
  });

  describe('framework property binding set before upgrade', () => {
    it('consumes an instance-shadowing value property on connect and restores normal getter/setter behavior', async () => {
      const el = document.createElement('ty-option') as any;
      // Simulates a framework (e.g. React/Reagent) assigning the property
      // while the element is still detached — this creates an own data
      // property that shadows the class accessor for reads.
      Object.defineProperty(el, 'value', { value: 'preset', writable: true, configurable: true });
      expect(Object.getOwnPropertyDescriptor(el, 'value')?.value).to.equal('preset');

      document.body.appendChild(el);
      await nextFrame();

      expect(el.value).to.equal('preset');
      expect(Object.getOwnPropertyDescriptor(el, 'value'), 'shadowing own property cleaned up').to.equal(undefined);

      // Getter/setter must work normally again after cleanup.
      el.value = 'after';
      expect(el.getAttribute('value')).to.equal('after');

      el.remove();
    });

    it('preserves an explicitly empty-string preset value (falsy but defined)', async () => {
      const el = document.createElement('ty-option') as any;
      Object.defineProperty(el, 'value', { value: '', writable: true, configurable: true });

      document.body.appendChild(el);
      await nextFrame();

      expect(el.value).to.equal('');
      el.remove();
    });

    it('cleans up an instance property that was explicitly preset to undefined', async () => {
      const el = document.createElement('ty-option') as any;
      Object.defineProperty(el, 'value', { value: undefined, writable: true, configurable: true });

      document.body.appendChild(el);
      await nextFrame();

      expect(Object.getOwnPropertyDescriptor(el, 'value'), 'shadowing own property cleaned up').to.equal(undefined);

      el.value = 'after';
      expect(el.getAttribute('value')).to.equal('after');
      expect(el.value).to.equal('after');

      el.remove();
    });
  });

  describe('disabled', () => {
    it('reflects disabled onto the shadow content wrapper, independent of the host attribute name', async () => {
      const el = (await fixture(html`<ty-option value="a">A</ty-option>`)) as any;
      const content = el.shadowRoot.querySelector('.option-content') as HTMLElement;
      expect(content.hasAttribute('disabled')).to.be.false;

      el.disabled = true;
      expect(el.hasAttribute('disabled')).to.be.true;
      expect(content.hasAttribute('disabled')).to.be.true;

      el.disabled = false;
      expect(el.hasAttribute('disabled')).to.be.false;
      expect(content.hasAttribute('disabled')).to.be.false;
    });

    it('reports disabled through its internals, not attributes', async () => {
      const el = (await fixture(html`<ty-option value="a" disabled>A</ty-option>`)) as any;
      const content = el.shadowRoot.querySelector('.option-content') as HTMLElement;
      expect(el._internals.ariaDisabled).to.equal('true');
      expect(el.hasAttribute('aria-disabled')).to.be.false;
      expect(content.hasAttribute('aria-disabled')).to.be.false;
      expect(content.getAttribute('role')).to.equal(null);
      el.disabled = false;
      expect(el._internals.ariaDisabled).to.equal(null);
    });

    it('setting disabled to its current value is a no-op that does not clear the attribute', async () => {
      const el = (await fixture(html`<ty-option value="a" disabled>A</ty-option>`)) as any;
      el.disabled = true;
      expect(el.hasAttribute('disabled')).to.be.true;
    });
  });

  describe("checked (set by the select) vs selected (the app's mark)", () => {
    it('checked draws the check and aria-selected, never an attribute', async () => {
      const el = (await fixture(html`<ty-option value="a">A</ty-option>`)) as any;
      const content = el.shadowRoot.querySelector('.option-content') as HTMLElement;
      expect(el.getAttribute('role')).to.equal('option');
      el.removeAttribute('role'); // a morph
      expect(el.getAttribute('role'), 'comes back').to.equal('option');

      el.checked = true;
      expect(content.hasAttribute('selected')).to.be.true;
      expect(el._internals.ariaSelected).to.equal('true');
      expect(el.hasAttribute('selected')).to.be.false;
      expect(el.hasAttribute('checked')).to.be.false;

      el.checked = false;
      expect(content.hasAttribute('selected')).to.be.false;
      expect(el._internals.ariaSelected).to.equal('false');
    });

    it("selected is only the app's mark: reflected, but draws nothing", async () => {
      const el = (await fixture(html`<ty-option value="a" selected>A</ty-option>`)) as any;
      const content = el.shadowRoot.querySelector('.option-content') as HTMLElement;
      expect(el.selected).to.be.true;
      expect(content.hasAttribute('selected')).to.be.false;
      el.selected = false;
      expect(el.hasAttribute('selected')).to.be.false;
    });

    it('checked does not disturb highlighted (and vice versa); all flags compose', async () => {
      const el = (await fixture(html`<ty-option value="a" disabled highlighted>A</ty-option>`)) as any;
      const content = el.shadowRoot.querySelector('.option-content') as HTMLElement;
      el.checked = true;
      expect(content.hasAttribute('disabled')).to.be.true;
      expect(content.hasAttribute('selected')).to.be.true;
      expect(content.hasAttribute('highlighted')).to.be.true;

      el.checked = false;
      expect(content.hasAttribute('highlighted'), 'highlighted survives').to.be.true;
    });
  });

  describe('hidden overrides HTMLElement.hidden', () => {
    it('defaults to not hidden and is visible', async () => {
      const el = (await fixture(html`<ty-option value="a">A</ty-option>`)) as any;
      expect(el.hidden).to.equal(false);
      expect(getComputedStyle(el).display).to.not.equal('none');
    });

    it('setting hidden=true reflects the attribute and actually hides the element (UA [hidden] style)', async () => {
      const el = (await fixture(html`<ty-option value="a">A</ty-option>`)) as any;
      el.hidden = true;
      expect(el.hasAttribute('hidden')).to.be.true;
      expect(getComputedStyle(el).display).to.equal('none');
      // No inline style is used to hide it — purely the reflected attribute.
      expect(el.style.display).to.equal('');

      el.hidden = false;
      expect(el.hasAttribute('hidden')).to.be.false;
      expect(getComputedStyle(el).display).to.not.equal('none');
    });
  });

  describe('data-* attributes for chip templates', () => {
    it('are plain attributes the component does not interfere with', async () => {
      const el = (await fixture(html`<ty-option value="a" data-icon="star" data-color="red">A</ty-option>`)) as any;
      expect(el.dataset.icon).to.equal('star');
      expect(el.dataset.color).to.equal('red');
      expect(el.getAttribute('data-icon')).to.equal('star');
    });

    it('can be mutated after mount without triggering unrelated state changes', async () => {
      const el = (await fixture(html`<ty-option value="a" data-icon="star">A</ty-option>`)) as any;
      const content = el.shadowRoot.querySelector('.option-content') as HTMLElement;
      el.checked = true;

      el.setAttribute('data-icon', 'heart');
      el.dataset.newField = 'added';

      expect(el.dataset.icon).to.equal('heart');
      expect(el.dataset.newField).to.equal('added');
      // data-* is not in observedAttributes — checked state must be untouched.
      expect(el.checked).to.be.true;
      expect(content.hasAttribute('selected')).to.be.true;
    });
  });

  describe('label attribute is not a component property', () => {
    it('has no .label accessor of its own — consumers must use getAttribute', async () => {
      const el = (await fixture(html`<ty-option value="bobo" label="Bobo Robot">Rich <b>content</b></ty-option>`)) as any;
      expect(el.getAttribute('label')).to.equal('Bobo Robot');
      expect(el.label).to.equal(undefined);
    });

    it('mutating the label attribute after mount is a plain attribute write (no re-render side effect)', async () => {
      const el = (await fixture(html`<ty-option value="bobo" label="Original">Text</ty-option>`)) as any;
      const wrapper = el.shadowRoot.querySelector('.option-content');
      el.setAttribute('label', 'Changed');
      expect(el.getAttribute('label')).to.equal('Changed');
      expect(el.shadowRoot.querySelector('.option-content')).to.equal(wrapper);
    });
  });

  describe('own event dispatch', () => {
    it('dispatches no custom events on its own when its shadow content is clicked', async () => {
      const el = (await fixture(html`<ty-option value="a">A</ty-option>`)) as any;
      const seen: string[] = [];
      ['change', 'select', 'ty-select', 'input'].forEach((type) =>
        el.addEventListener(type, (e: Event) => seen.push(e.type))
      );

      (el.shadowRoot.querySelector('.option-content') as HTMLElement).click();
      await nextFrame();

      expect(seen, 'interaction is owned by the parent ty-select, not ty-option itself').to.deep.equal([]);
    });
  });

  describe('mutation after initial render', () => {
    it('textContent changes after mount are picked up live by the value fallback (not cached)', async () => {
      const el = (await fixture(html`<ty-option>Initial</ty-option>`)) as any;
      expect(el.value).to.equal('Initial');

      el.textContent = 'Updated';
      expect(el.value).to.equal('Updated');
    });

    it('replacing rich HTML content after mount is reflected in the value fallback', async () => {
      const el = (await fixture(html`<ty-option><b>Old</b></ty-option>`)) as any;
      expect(el.value).to.equal('Old');

      el.innerHTML = '<i>New</i> Value';
      expect(el.value).to.equal('New Value');
    });
  });
});

describe('ty-option — properties set before the element upgrades', () => {
  let n = 0;
  const tag = () => `ty-option-upgrade-${++n}`;
  const hasOwn = (el: object, p: string) => Object.prototype.hasOwnProperty.call(el, p);

  it('selected and disabled set early apply, not only value', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.value = 'a';
    el.selected = true;
    el.disabled = true;
    document.body.append(el);
    customElements.define(name, class extends TyOption {});
    await nextFrame();
    expect(el.value).to.equal('a');
    expect(el.hasAttribute('selected')).to.equal(true);
    expect(el.hasAttribute('disabled')).to.equal(true);
    for (const p of ['value', 'selected', 'disabled']) {
      expect(hasOwn(el, p), `no own ${p} left`).to.equal(false);
    }

    el.selected = false;
    expect(el.hasAttribute('selected'), 'later assignments reach the setter').to.equal(false);
    el.remove();
  });

  it('checked set before the upgrade applies (a select may paint before ty-option is defined)', async () => {
    const name = tag();
    const el = document.createElement(name) as any;
    el.checked = true;
    document.body.append(el);
    customElements.define(name, class extends TyOption {});
    await nextFrame();
    expect(hasOwn(el, 'checked')).to.equal(false);
    expect(el.shadowRoot.querySelector('.option-content').hasAttribute('selected')).to.equal(true);
    expect(el._internals.ariaSelected).to.equal('true');
    el.remove();
  });
});
