import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/radio.js'; // defines ty-radio + ty-radio-group

describe('ty-radio-group', () => {
  it('reflects its selected value', async () => {
    const group = (await fixture(html`
      <ty-radio-group value="pro">
        <ty-radio value="free"></ty-radio>
        <ty-radio value="pro"></ty-radio>
      </ty-radio-group>
    `)) as any;
    await nextFrame();
    expect(group.value).to.equal('pro');
  });

  it('syncs radios that upgrade after the group (innerHTML / template clone)', async () => {
    // Elements upgrade in tree order, so the group's initial value sync runs
    // before its radios are ty-radio instances. It must not write onto them
    // (own props would shadow the accessors) — the connect event re-syncs.
    const host = (await fixture(html`<div></div>`)) as HTMLElement;
    host.innerHTML = `
      <ty-radio-group value="pro">
        <ty-radio value="free"></ty-radio>
        <ty-radio value="pro"></ty-radio>
      </ty-radio-group>`;
    await nextFrame();
    const [free, pro] = Array.from(host.querySelectorAll('ty-radio')) as any[];
    for (const r of [free, pro]) {
      expect(Object.prototype.hasOwnProperty.call(r, 'checked'), 'no shadowed own prop').to.be.false;
    }
    expect(pro.checked).to.be.true;
    expect(free.checked).to.be.false;
    const role = (r: any) => r.shadowRoot.querySelector('[aria-checked]');
    expect(role(pro).getAttribute('aria-checked')).to.equal('true');
    expect(role(pro).tabIndex, 'checked radio is the tab stop').to.equal(0);
    expect(role(free).tabIndex).to.equal(-1);
  });

  it('ignores the click a <label> forwards after a click on the radio itself (Firefox)', async () => {
    const group = (await fixture(html`
      <ty-radio-group>
        <label><ty-radio value="a"></ty-radio> A</label>
        <label><ty-radio value="b"></ty-radio> B</label>
      </ty-radio-group>
    `)) as any;
    await nextFrame();
    const b = group.querySelectorAll('ty-radio')[1] as any;
    let changes = 0;
    let clicks = 0;
    group.addEventListener('change', () => { changes++; });
    b.addEventListener('click', () => { clicks++; });

    // Same Firefox forward as ty-checkbox's: harmless for the value, but
    // page listeners must see one click, not two.
    const at = { bubbles: true, composed: true, clientX: 5, clientY: 7 };
    b.shadowRoot.querySelector('.radio-container').dispatchEvent(new MouseEvent('click', at));
    await Promise.resolve();
    b.dispatchEvent(new MouseEvent('click', at));
    await new Promise((r) => setTimeout(r));
    expect(group.value).to.equal('b');
    expect(changes).to.equal(1);
    expect(clicks).to.equal(1);
  });

  it('arrow keys and Space fire input and change like a click; nothing for the selected one', async () => {
    const group = (await fixture(html`
      <ty-radio-group value="a">
        <ty-radio value="a"></ty-radio>
        <ty-radio value="b"></ty-radio>
      </ty-radio-group>
    `)) as any;
    await nextFrame();
    const seen: string[] = [];
    group.addEventListener('input', (e: any) => seen.push(`input:${e.detail.value}`));
    group.addEventListener('change', (e: any) => seen.push(`change:${e.detail.value}`));
    const key = async (k: string) => {
      group.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 10));
    };
    group.querySelector('ty-radio[value="a"]').focus();
    await key('ArrowDown');
    expect(seen).to.deep.equal(['input:b', 'change:b']);
    await key(' ');
    expect(seen.length, 'Space on the selected radio fires nothing').to.equal(2);
  });

  it('setting value selects the matching radio', async () => {
    const group = (await fixture(html`
      <ty-radio-group>
        <ty-radio value="free"></ty-radio>
        <ty-radio value="pro"></ty-radio>
      </ty-radio-group>
    `)) as any;
    await nextFrame();
    group.value = 'pro';
    await nextFrame();
    expect(group.value).to.equal('pro');
  });

  it('participates in FormData', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form>
        <ty-radio-group name="plan" value="pro">
          <ty-radio value="free"></ty-radio>
          <ty-radio value="pro"></ty-radio>
        </ty-radio-group>
      </form>
    `));
    await nextFrame();
    expect(new FormData(form).get('plan')).to.equal('pro');
  });
});
