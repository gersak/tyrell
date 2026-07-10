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
