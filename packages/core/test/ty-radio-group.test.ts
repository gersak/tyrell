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
