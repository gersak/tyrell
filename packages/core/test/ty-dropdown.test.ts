import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import '../lib/components/dropdown.js';
import '../lib/components/option.js';

describe('ty-dropdown', () => {
  it('renders with options and reflects its value', async () => {
    const el = (await fixture(html`
      <ty-dropdown name="fruit" value="banana">
        <ty-option value="apple">Apple</ty-option>
        <ty-option value="banana">Banana</ty-option>
      </ty-dropdown>
    `)) as any;
    await nextFrame();
    expect(el.value).to.equal('banana');
    expect(el.querySelectorAll('ty-option').length).to.be.at.least(2);
  });

  it('participates in FormData', async () => {
    const form = (await fixture<HTMLFormElement>(html`
      <form>
        <ty-dropdown name="fruit" value="apple">
          <ty-option value="apple">Apple</ty-option>
          <ty-option value="banana">Banana</ty-option>
        </ty-dropdown>
      </form>
    `));
    await nextFrame();
    expect(new FormData(form).get('fruit')).to.equal('apple');
  });
});
