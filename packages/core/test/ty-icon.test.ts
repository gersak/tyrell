import { fixture, html, expect, nextFrame, aTimeout } from '@open-wc/testing';
import * as IconRegistry from '../lib/utils/icon-registry.js';
import '../lib/components/icon.js';

describe('ty-icon', () => {
  it('renders a registered icon and reflects its name', async () => {
    IconRegistry.registerIcons({ 'test-beaker': '<svg data-test="beaker"><circle r="1"></circle></svg>' });
    const el = (await fixture(html`<ty-icon name="test-beaker"></ty-icon>`)) as any;
    await nextFrame();
    await nextFrame();
    expect(el.name).to.equal('test-beaker');
    expect(el.shadowRoot.innerHTML).to.contain('data-test="beaker"');
  });

  it('renders a fallback svg for an unknown icon', async () => {
    const el = (await fixture(html`<ty-icon name="totally-not-registered-xyz"></ty-icon>`)) as any;
    await nextFrame();
    await nextFrame();
    expect(el.shadowRoot.querySelector('svg')).to.exist;
  });

  describe('missing/empty name', () => {
    it('renders the fallback icon when name attribute is entirely absent', async () => {
      const el = (await fixture(html`<ty-icon></ty-icon>`)) as any;
      await nextFrame();
      expect(el.name).to.equal('');
      expect(el.shadowRoot.querySelector('svg')).to.exist;
      expect(el.shadowRoot.querySelector('[data-test]')).to.not.exist;
    });

    it('falls back again when name is cleared back to empty after being set', async () => {
      IconRegistry.registerIcons({ 'clearable-icon': '<svg data-test="clearable"><rect></rect></svg>' });
      const el = (await fixture(html`<ty-icon name="clearable-icon"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.shadowRoot.querySelector('[data-test="clearable"]')).to.exist;

      el.name = '';
      await nextFrame();
      expect(el.shadowRoot.querySelector('[data-test="clearable"]')).to.not.exist;
      expect(el.shadowRoot.querySelector('svg')).to.exist;
    });
  });

  describe('name changes after mount', () => {
    it('replaces the previous SVG cleanly with no leftover/duplicate nodes', async () => {
      IconRegistry.registerIcons({
        'swap-a': '<svg data-test="swap-a"><circle r="1"></circle></svg>',
        'swap-b': '<svg data-test="swap-b"><rect></rect></svg>',
      });
      const el = (await fixture(html`<ty-icon name="swap-a"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.shadowRoot.querySelectorAll('svg')).to.have.lengthOf(1);
      expect(el.shadowRoot.querySelector('[data-test="swap-a"]')).to.exist;

      el.name = 'swap-b';
      await nextFrame();
      expect(el.shadowRoot.querySelectorAll('svg')).to.have.lengthOf(1);
      expect(el.shadowRoot.querySelector('[data-test="swap-a"]')).to.not.exist;
      expect(el.shadowRoot.querySelector('[data-test="swap-b"]')).to.exist;
    });

    it('falls back cleanly when changing from a known icon to an unknown one', async () => {
      IconRegistry.registerIcons({ 'known-then-gone': '<svg data-test="known"><circle r="1"></circle></svg>' });
      const el = (await fixture(html`<ty-icon name="known-then-gone"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.shadowRoot.querySelector('[data-test="known"]')).to.exist;

      el.name = 'never-registered-anywhere';
      await nextFrame();
      expect(el.shadowRoot.querySelectorAll('svg')).to.have.lengthOf(1);
      expect(el.shadowRoot.querySelector('[data-test="known"]')).to.not.exist;
    });
  });

  describe('registry watcher / late registration', () => {
    it('re-renders once the requested icon is registered after mount', async () => {
      const el = (await fixture(html`<ty-icon name="registered-later"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.shadowRoot.querySelector('[data-test="later"]')).to.not.exist;

      IconRegistry.registerIcons({ 'registered-later': '<svg data-test="later"><circle r="2"></circle></svg>' });
      await aTimeout(50);
      await nextFrame();

      expect(el.shadowRoot.querySelector('[data-test="later"]')).to.exist;
    });

    it('stops reacting to registry changes once disconnected (watcher cleanup)', async () => {
      const el = (await fixture(html`<ty-icon name="disconnect-watch"></ty-icon>`)) as any;
      await nextFrame();
      const contentBeforeRemoval = el.shadowRoot.innerHTML;

      el.remove();
      await aTimeout(0);

      IconRegistry.registerIcons({ 'disconnect-watch': '<svg data-test="post-disconnect"><circle r="3"></circle></svg>' });
      await aTimeout(50);

      expect(el.shadowRoot.innerHTML).to.equal(contentBeforeRemoval);
      expect(el.shadowRoot.querySelector('[data-test="post-disconnect"]')).to.not.exist;
    });

    it('does not resurrect a stale name after a rapid name change (stale-watcher race)', async () => {
      const el = (await fixture(html`<ty-icon name="race-a"></ty-icon>`)) as any;
      await nextFrame();

      // Change away from 'race-a' before its (not-yet-registered) icon ever loads.
      el.name = 'race-b';
      await nextFrame();

      // Registering the OLD name should be a no-op for this element: its watcher
      // was removed when name changed, so this must not repaint the element.
      IconRegistry.registerIcons({ 'race-a': '<svg data-test="race-a-svg"><circle></circle></svg>' });
      await aTimeout(50);

      expect(el.shadowRoot.querySelector('[data-test="race-a-svg"]')).to.not.exist;

      // Registering the CURRENT name must still work.
      IconRegistry.registerIcons({ 'race-b': '<svg data-test="race-b-svg"><rect></rect></svg>' });
      await aTimeout(50);

      expect(el.shadowRoot.querySelector('[data-test="race-b-svg"]')).to.exist;
    });

    it('only reflects the last of several rapid name changes, ignoring intermediate registrations', async () => {
      const el = (await fixture(html`<ty-icon name="hop-1"></ty-icon>`)) as any;
      await nextFrame();

      el.name = 'hop-2';
      el.name = 'hop-3';
      await nextFrame();

      IconRegistry.registerIcons({
        'hop-1': '<svg data-test="hop-1-svg"><circle></circle></svg>',
        'hop-2': '<svg data-test="hop-2-svg"><circle></circle></svg>',
      });
      await aTimeout(50);

      expect(el.shadowRoot.querySelector('[data-test="hop-1-svg"]')).to.not.exist;
      expect(el.shadowRoot.querySelector('[data-test="hop-2-svg"]')).to.not.exist;

      IconRegistry.registerIcons({ 'hop-3': '<svg data-test="hop-3-svg"><circle></circle></svg>' });
      await aTimeout(50);

      expect(el.shadowRoot.querySelector('[data-test="hop-3-svg"]')).to.exist;
    });
  });

  describe('size variants', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

    for (const size of sizes) {
      it(`applies a distinct icon-${size} class and no other size class`, async () => {
        const el = (await fixture(html`<ty-icon size="${size}"></ty-icon>`)) as any;
        await nextFrame();
        expect(el.classList.contains(`icon-${size}`)).to.be.true;
        for (const other of sizes) {
          if (other !== size) {
            expect(el.classList.contains(`icon-${other}`)).to.be.false;
          }
        }
      });
    }

    it('swaps size classes cleanly when size changes after mount', async () => {
      const el = (await fixture(html`<ty-icon size="xs"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-xs')).to.be.true;

      el.size = 'xl';
      await nextFrame();
      expect(el.classList.contains('icon-xs')).to.be.false;
      expect(el.classList.contains('icon-xl')).to.be.true;
    });

    it('removes the size class entirely when size is cleared', async () => {
      const el = (await fixture(html`<ty-icon size="lg"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-lg')).to.be.true;

      el.size = undefined;
      await nextFrame();
      expect(el.classList.contains('icon-lg')).to.be.false;
      expect(el.size).to.be.undefined;
    });
  });

  describe('animation: spin / pulse / tempo', () => {
    it('applies icon-spin when spin is set and removes it when unset', async () => {
      const el = (await fixture(html`<ty-icon spin></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-spin')).to.be.true;

      el.spin = false;
      await nextFrame();
      expect(el.classList.contains('icon-spin')).to.be.false;
    });

    it('applies icon-pulse when pulse is set and removes it when unset', async () => {
      const el = (await fixture(html`<ty-icon pulse></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-pulse')).to.be.true;

      el.pulse = false;
      await nextFrame();
      expect(el.classList.contains('icon-pulse')).to.be.false;
    });

    it('supports spin and pulse simultaneously', async () => {
      const el = (await fixture(html`<ty-icon spin pulse></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-spin')).to.be.true;
      expect(el.classList.contains('icon-pulse')).to.be.true;
    });

    it('does NOT apply a tempo class when tempo is set but neither spin nor pulse is active', async () => {
      const el = (await fixture(html`<ty-icon tempo="fast"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-tempo-fast')).to.be.false;
    });

    it('applies icon-tempo-slow alongside icon-spin', async () => {
      const el = (await fixture(html`<ty-icon spin tempo="slow"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-spin')).to.be.true;
      expect(el.classList.contains('icon-tempo-slow')).to.be.true;
    });

    it('applies icon-tempo-fast alongside icon-pulse', async () => {
      const el = (await fixture(html`<ty-icon pulse tempo="fast"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-pulse')).to.be.true;
      expect(el.classList.contains('icon-tempo-fast')).to.be.true;
    });

    it('drops the tempo class once spin is turned back off, even though tempo is still set', async () => {
      const el = (await fixture(html`<ty-icon spin tempo="slow"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-tempo-slow')).to.be.true;

      el.spin = false;
      await nextFrame();
      expect(el.classList.contains('icon-tempo-slow')).to.be.false;
      expect(el.tempo).to.equal('slow');
    });

    it('switches tempo class from slow to fast without leaving the old one behind', async () => {
      const el = (await fixture(html`<ty-icon spin tempo="slow"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('icon-tempo-slow')).to.be.true;

      el.tempo = 'fast';
      await nextFrame();
      expect(el.classList.contains('icon-tempo-slow')).to.be.false;
      expect(el.classList.contains('icon-tempo-fast')).to.be.true;
    });
  });

  describe('user-added classes are preserved', () => {
    it('keeps a consumer-added class across a visual property change', async () => {
      const el = (await fixture(html`<ty-icon class="my-custom-class" size="sm"></ty-icon>`)) as any;
      await nextFrame();
      expect(el.classList.contains('my-custom-class')).to.be.true;
      expect(el.classList.contains('icon-sm')).to.be.true;

      el.spin = true;
      await nextFrame();
      expect(el.classList.contains('my-custom-class')).to.be.true;
      expect(el.classList.contains('icon-spin')).to.be.true;
    });

    it('drops a stale icon-* class the consumer is not supposed to own directly', async () => {
      const el = (await fixture(html`<ty-icon class="icon-bogus-leftover"></ty-icon>`)) as any;
      await nextFrame();
      // buildClasses() strips ANY class starting with "icon-" from the preserved
      // set, since that prefix is reserved for classes it manages itself.
      expect(el.classList.contains('icon-bogus-leftover')).to.be.false;
    });
  });
});
