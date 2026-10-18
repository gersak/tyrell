import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, nextFrame } from '@open-wc/testing';
import '../../core/lib/index.js';
import {
  TyButton, TyCalendar, TyCalendarMonth, TyCalendarNavigation, TyCheckbox, TyCopy,
  TyDatePicker, TyFileUpload, TyIcon, TyInput, TyModal, TyOption, TyPopup, TyRadio,
  TyRadioGroup, TyResizeObserver, TyScrollContainer, TySelect, TyStep, TySwitch, TyTab,
  TyTabs, TyTag, TyTextarea, TyTooltip, TyWizard,
} from '../src/components/index';

// ---------------------------------------------------------------------------
// Harness: render into a fresh root, flush synchronously, give effects and
// the custom elements a frame to settle.

type Mounted = { host: HTMLElement; rerender: (node: React.ReactElement) => Promise<void>; root: Root };
const mounted: Array<{ root: Root; container: HTMLElement }> = [];

async function mount(node: React.ReactElement, selector?: string): Promise<Mounted> {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  flushSync(() => root.render(node));
  await nextFrame();
  const host = (selector ? container.querySelector(selector) : container.firstElementChild) as HTMLElement;
  return {
    host,
    root,
    rerender: async (next) => {
      flushSync(() => root.render(next));
      await nextFrame();
    },
  };
}

afterEach(() => {
  for (const { root, container } of mounted.splice(0)) {
    root.unmount();
    container.remove();
  }
});

function fire(el: Element, type: string, detail: unknown = { value: 'x' }) {
  el.dispatchEvent(new CustomEvent(type, { detail, bubbles: false }));
}

describe(`React ${React.version} wrappers`, () => {
  // -------------------------------------------------------------------------
  // Presence booleans: prop true → bare attribute; prop false → attribute gone
  // (and the element's property agrees). On React 18 removal goes through the
  // imperative bridge, so this is the regression net for it.

  type Case = [name: string, Comp: any, prop: string, attr: string, tag: string, extra?: Record<string, any>];
  const cases: Case[] = [
    ['TyModal', TyModal, 'noBackdrop', 'no-backdrop', 'ty-modal'],
    ['TyModal', TyModal, 'noZoom', 'no-zoom', 'ty-modal'],
    ['TyModal', TyModal, 'preventEscape', 'prevent-escape', 'ty-modal'],
    ['TyModal', TyModal, 'preventOutsideClick', 'prevent-outside-click', 'ty-modal'],
    ['TySelect', TySelect, 'noClear', 'no-clear', 'ty-select'],
    ['TySelect', TySelect, 'multiple', 'multiple', 'ty-select'],
    ['TySelect', TySelect, 'disabled', 'disabled', 'ty-select'],
    ['TySelect', TySelect, 'required', 'required', 'ty-select'],
    ['TySelect', TySelect, 'readonly', 'readonly', 'ty-select'],
    ['TySelect', TySelect, 'externalSearch', 'external-search', 'ty-select'],
    ['TySelect', TySelect, 'allowCreate', 'allow-create', 'ty-select'],
    ['TyDatePicker', TyDatePicker, 'noClear', 'no-clear', 'ty-date-picker'],
    ['TyDatePicker', TyDatePicker, 'disabled', 'disabled', 'ty-date-picker'],
    ['TyTag', TyTag, 'noPill', 'no-pill', 'ty-tag'],
    ['TyTag', TyTag, 'dismissible', 'dismissible', 'ty-tag'],
    ['TyTag', TyTag, 'selected', 'selected', 'ty-tag'],
    ['TyScrollContainer', TyScrollContainer, 'noShadow', 'no-shadow', 'ty-scroll-container'],
    ['TyScrollContainer', TyScrollContainer, 'hideScrollbar', 'hide-scrollbar', 'ty-scroll-container'],
    ['TyTab', TyTab, 'lazy', 'lazy', 'ty-tab', { id: 't1', label: 'One' }],
    ['TyTab', TyTab, 'disabled', 'disabled', 'ty-tab', { id: 't1', label: 'One' }],
    ['TyTabs', TyTabs, 'fixed', 'fixed', 'ty-tabs'],
    ['TyStep', TyStep, 'disabled', 'disabled', 'ty-step', { label: 'One' }],
    ['TyOption', TyOption, 'selected', 'selected', 'ty-option', { value: 'a' }],
    ['TyModal', TyModal, 'open', 'open', 'ty-modal', { noZoom: true }],
    ['TyButton', TyButton, 'disabled', 'disabled', 'ty-button'],
    ['TyButton', TyButton, 'loading', 'loading', 'ty-button'],
    ['TyButton', TyButton, 'pill', 'pill', 'ty-button'],
    ['TyButton', TyButton, 'wide', 'wide', 'ty-button'],
    ['TyButton', TyButton, 'muted', 'muted', 'ty-button'],
    ['TyCheckbox', TyCheckbox, 'checked', 'checked', 'ty-checkbox'],
    ['TyCheckbox', TyCheckbox, 'disabled', 'disabled', 'ty-checkbox'],
    ['TySwitch', TySwitch, 'checked', 'checked', 'ty-switch'],
    ['TyInput', TyInput, 'disabled', 'disabled', 'ty-input'],
    ['TyInput', TyInput, 'required', 'required', 'ty-input'],
    ['TyTextarea', TyTextarea, 'disabled', 'disabled', 'ty-textarea'],
    ['TyRadio', TyRadio, 'checked', 'checked', 'ty-radio', { value: 'a' }],
    ['TyRadioGroup', TyRadioGroup, 'disabled', 'disabled', 'ty-radio-group'],
    ['TyCopy', TyCopy, 'multiline', 'multiline', 'ty-copy', { value: 'abc' }],
    ['TyFileUpload', TyFileUpload, 'multiple', 'multiple', 'ty-file-upload'],
    ['TyIcon', TyIcon, 'spin', 'spin', 'ty-icon', { name: 'check' }],
    ['TyOption', TyOption, 'disabled', 'disabled', 'ty-option', { value: 'a' }],
    ['TyPopup', TyPopup, 'manual', 'manual', 'ty-popup'],
    ['TyTooltip', TyTooltip, 'disabled', 'disabled', 'ty-tooltip'],
    ['TyCalendar', TyCalendar, 'hideNavigation', 'hide-navigation', 'ty-calendar'],
    ['TyCalendar', TyCalendar, 'required', 'required', 'ty-calendar'],
  ];

  for (const [name, Comp, prop, attr, tag, extra] of cases) {
    it(`${name} ${prop}: true sets [${attr}], false removes it`, async () => {
      const m = await mount(<Comp {...extra} {...{ [prop]: true }} />, tag);
      expect(m.host, `<${tag}> rendered`).to.exist;
      expect(m.host.hasAttribute(attr), 'true → attribute').to.equal(true);

      await m.rerender(<Comp {...extra} {...{ [prop]: false }} />);
      expect(m.host.hasAttribute(attr), 'false → attribute removed').to.equal(false);
      if (prop in m.host) expect(Boolean((m.host as any)[prop]), 'property agrees').to.equal(false);

      await m.rerender(<Comp {...extra} {...{ [prop]: true }} />);
      expect(m.host.hasAttribute(attr), 'true again').to.equal(true);
    });

    it(`${name} ${prop}="false" (string) counts as false`, async () => {
      const m = await mount(<Comp {...extra} {...{ [prop]: 'false' }} />, tag);
      expect(m.host.hasAttribute(attr)).to.equal(false);
    });
  }

  // -------------------------------------------------------------------------
  // TyModal: real open/close through the prop, with the lifecycle callbacks.

  it('TyModal open true → false closes the dialog and fires onOpen / onClose', async () => {
    const calls: string[] = [];
    const props = { onOpen: () => calls.push('open'), onClose: () => calls.push('close') };
    // Mounted closed: an element that's open on its very first render opens
    // before React attaches effect listeners, so onOpen can't see that one.
    const m = await mount(<TyModal {...props} noZoom open={false}><p>Hi</p></TyModal>, 'ty-modal');
    const dialog = m.host.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    await m.rerender(<TyModal {...props} noZoom open><p>Hi</p></TyModal>);
    expect(dialog.open, 'opened').to.equal(true);

    await m.rerender(<TyModal {...props} noZoom open={false}><p>Hi</p></TyModal>);
    expect(m.host.hasAttribute('open')).to.equal(false);
    expect(dialog.open, 'closed').to.equal(false);
    expect(calls).to.deep.equal(['open', 'close']);
  });

  it('TyModal noBackdrop opens a non-modal dialog; noZoom keeps the page still', async () => {
    const zoomed = () => document.documentElement.classList.contains('ty-modal-zoom');
    const m = await mount(<TyModal open><p>Hi</p></TyModal>, 'ty-modal');
    expect(zoomed(), 'zoom is the default').to.equal(true);
    await m.rerender(<TyModal open noZoom><p>Hi</p></TyModal>);
    expect(zoomed(), 'noZoom').to.equal(false);
    await m.rerender(<TyModal open={false} noZoom><p>Hi</p></TyModal>);

    const b = await mount(<TyModal open noBackdrop noZoom><p>Hi</p></TyModal>, 'ty-modal');
    const dialog = b.host.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.hasAttribute('data-backdrop')).to.equal(false);
  });

  it('TyModal ref exposes show() / hide()', async () => {
    const ref = React.createRef<any>();
    const m = await mount(<TyModal ref={ref} noZoom><p>Hi</p></TyModal>, 'ty-modal');
    const dialog = m.host.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    ref.current.show();
    await nextFrame();
    expect(dialog.open).to.equal(true);
    ref.current.hide({ force: true });
    await nextFrame();
    expect(dialog.open).to.equal(false);
  });

  // -------------------------------------------------------------------------
  // TyTab lazy: showing an empty lazy tab fires onTabLoad on that tab.

  it('TyTab lazy fires onTabLoad when shown empty', async () => {
    const loads: any[] = [];
    const tabs = (active: string) => (
      <TyTabs active={active}>
        <TyTab id="a" label="A"><p>A</p></TyTab>
        <TyTab id="b" label="B" lazy onTabLoad={(e) => loads.push(e.detail)} />
      </TyTabs>
    );
    const m = await mount(tabs('a'), 'ty-tabs');
    expect(loads, 'not for the tab shown first').to.have.length(0);
    await m.rerender(tabs('b'));
    await nextFrame();
    expect(loads).to.have.length(1);
    expect(loads[0].id).to.equal('b');
  });

  // -------------------------------------------------------------------------
  // Event wiring: the wrapper's callback receives the element's CustomEvent.

  type EventCase = [name: string, node: React.ReactElement, tag: string, event: string, prop: string];
  const handler = () => {
    const seen: any[] = [];
    return { seen, fn: (e: CustomEvent) => seen.push(e.detail) };
  };
  const eventCases: Array<[string, (fn: any) => React.ReactElement, string, string]> = [
    ['TyInput onChange', (fn) => <TyInput onChange={fn} />, 'ty-input', 'input'],
    ['TyInput onChangeCommit', (fn) => <TyInput onChangeCommit={fn} />, 'ty-input', 'change'],
    ['TyTextarea onChange', (fn) => <TyTextarea onChange={fn} />, 'ty-textarea', 'input'],
    ['TyTextarea onChangeCommit', (fn) => <TyTextarea onChangeCommit={fn} />, 'ty-textarea', 'change'],
    ['TyCheckbox onChange', (fn) => <TyCheckbox onChange={fn} />, 'ty-checkbox', 'input'],
    ['TyCheckbox onChangeCommit', (fn) => <TyCheckbox onChangeCommit={fn} />, 'ty-checkbox', 'change'],
    ['TySwitch onChange', (fn) => <TySwitch onChange={fn} />, 'ty-switch', 'input'],
    ['TySwitch onChangeCommit', (fn) => <TySwitch onChangeCommit={fn} />, 'ty-switch', 'change'],
    ['TyRadioGroup onChange', (fn) => <TyRadioGroup onChange={fn} />, 'ty-radio-group', 'input'],
    ['TyRadioGroup onChangeCommit', (fn) => <TyRadioGroup onChangeCommit={fn} />, 'ty-radio-group', 'change'],
    ['TySelect onChange', (fn) => <TySelect onChange={fn} />, 'ty-select', 'change'],
    ['TySelect onSearch', (fn) => <TySelect onSearch={fn} />, 'ty-select', 'search'],
    ['TySelect onCreate', (fn) => <TySelect onCreate={fn} />, 'ty-select', 'create'],
    ['TyDatePicker onChange', (fn) => <TyDatePicker onChange={fn} />, 'ty-date-picker', 'change'],
    ['TyCalendar onChange', (fn) => <TyCalendar onChange={fn} />, 'ty-calendar', 'change'],
    ['TyCalendar onNavigate', (fn) => <TyCalendar onNavigate={fn} />, 'ty-calendar', 'navigate'],
    ['TyCalendarMonth onDayClick', (fn) => <TyCalendarMonth onDayClick={fn} />, 'ty-calendar-month', 'day-click'],
    ['TyCalendarNavigation onChange', (fn) => <TyCalendarNavigation onChange={fn} />, 'ty-calendar-navigation', 'change'],
    ['TyCalendarNavigation onViewToggle', (fn) => <TyCalendarNavigation onViewToggle={fn} />, 'ty-calendar-navigation', 'view-toggle'],
    ['TyFileUpload onChange', (fn) => <TyFileUpload onChange={fn} />, 'ty-file-upload', 'change'],
    ['TyCopy onCopySuccess', (fn) => <TyCopy value="x" onCopySuccess={fn} />, 'ty-copy', 'copy-success'],
    ['TyTag onTagDismiss', (fn) => <TyTag onTagDismiss={fn}>x</TyTag>, 'ty-tag', 'dismiss'],
    ['TyTabs onChange', (fn) => <TyTabs onChange={fn} />, 'ty-tabs', 'ty-tab-change'],
    ['TyWizard onStepChange', (fn) => <TyWizard onStepChange={fn} />, 'ty-wizard', 'ty-wizard-step-change'],
    ['TyScrollContainer onNearEnd', (fn) => <TyScrollContainer onNearEnd={fn} />, 'ty-scroll-container', 'nearend'],
    ['TyPopup onOpen', (fn) => <TyPopup onOpen={fn} />, 'ty-popup', 'open'],
    ['TyModal onBeforeClose', (fn) => <TyModal onBeforeClose={fn} />, 'ty-modal', 'beforeclose'],
  ];

  for (const [name, make, tag, event] of eventCases) {
    it(`${name} receives "${event}"`, async () => {
      const h = handler();
      const m = await mount(make(h.fn), tag);
      fire(m.host, event, { value: 'x' });
      expect(h.seen, `callback called once`).to.have.length(1);
      expect(h.seen[0]).to.deep.equal({ value: 'x' });
    });
  }

  // -------------------------------------------------------------------------
  // Plain renders: every wrapper produces its element, passes className as
  // `class`, and string props as attributes.

  const renders: Array<[string, React.ReactElement, string, Record<string, string>]> = [
    ['TyButton', <TyButton className="w" flavor="primary" appearance="outlined">Go</TyButton>, 'ty-button', { flavor: 'primary', appearance: 'outlined' }],
    ['TyInput', <TyInput className="w" label="Email" type="email" />, 'ty-input', { label: 'Email', type: 'email' }],
    ['TyInput rules', <TyInput className="w" pattern="[a-z]+" minLength={2} maxLength={8} />, 'ty-input', { pattern: '[a-z]+', minlength: '2', maxlength: '8' }],
    ['TyInput range', <TyInput className="w" type="currency" min={1} max={99} />, 'ty-input', { min: '1', max: '99' }],
    ['TyInput messages', <TyInput className="w" tooShortMessage="Short" tooLongMessage="Long" />, 'ty-input', { 'too-short-message': 'Short', 'too-long-message': 'Long' }],
    ['TyIcon', <TyIcon className="w" name="check" size="lg" />, 'ty-icon', { name: 'check', size: 'lg' }],
    ['TyStep', <TyStep className="w" id="one" label="One" status="completed" />, 'ty-step', { label: 'One', status: 'completed' }],
    ['TyResizeObserver', <TyResizeObserver className="w" id="r" />, 'ty-resize-observer', { id: 'r' }],
    ['TyTooltip', <TyTooltip className="w" placement="top">tip</TyTooltip>, 'ty-tooltip', { placement: 'top' }],
    ['TyWizard', <TyWizard className="w" active="s1" />, 'ty-wizard', { active: 's1' }],
    ['TySelect value[]', <TySelect className="w" multiple value={['a', 'b']} />, 'ty-select', { value: 'a,b' }],
    ['TyDatePicker', <TyDatePicker className="w" label="When" withTime />, 'ty-date-picker', { label: 'When', 'with-time': '' }],
  ];

  for (const [name, node, tag, attrs] of renders) {
    it(`${name} renders <${tag}> with its attributes`, async () => {
      const m = await mount(node, tag);
      expect(m.host.tagName.toLowerCase()).to.equal(tag);
      expect(m.host.classList.contains('w'), 'className → class').to.equal(true);
      for (const [k, v] of Object.entries(attrs)) expect(m.host.getAttribute(k), k).to.equal(v);
    });
  }
});

describe(`React ${React.version} TyCalendar value`, () => {
  it('reads an ISO instant, epoch ms and a Date as their local day', async () => {
    const m = await mount(<TyCalendar value={new Date(2026, 2, 14).toISOString()} />, 'ty-calendar');
    const el = m.host as any;
    expect(el.value).to.equal('2026-03-14');
    await m.rerender(<TyCalendar value={new Date(2026, 4, 9, 22, 15).getTime()} />);
    expect(el.value).to.equal('2026-05-09');
    await m.rerender(<TyCalendar value={new Date(2026, 5, 1, 0, 5)} />);
    expect(el.value).to.equal('2026-06-01');
  });
});

describe(`React ${React.version} TyCalendarMonth properties`, () => {
  it('value, dayContentFn and customCSS reach the element', async () => {
    const fn = () => 'x';
    const sheet = new CSSStyleSheet();
    const ts = Date.UTC(2026, 9, 15);
    const m = await mount(<TyCalendarMonth value={ts} dayContentFn={fn} customCSS={sheet} />, 'ty-calendar-month');
    const el = m.host as any;
    expect(el.value).to.equal(ts);
    expect(el.dayContentFn).to.equal(fn);
    expect(el.customCSS).to.equal(sheet);
    await m.rerender(<TyCalendarMonth value={null} dayContentFn={fn} customCSS={sheet} />);
    expect(el.value).to.equal(undefined);
  });
});

// ---------------------------------------------------------------------------
// TyButton inside a <form> acts like a native button: one submit per click and
// only when the form is valid (requestSubmit validates), submitter name/value
// in the FormData, reset resets once, type="button" / disabled / loading never
// submit. Clicks go to the inner shadow <button>, which is what a user hits.

describe(`React ${React.version} TyButton in a form`, () => {
  type Log = { submits: FormData[]; resets: number; clicks: number };

  async function mountForm(button: React.ReactElement, field: React.ReactElement) {
    const log: Log = { submits: [], resets: 0, clicks: 0 };
    const m = await mount(
      <form
        onSubmit={(e) => { e.preventDefault(); log.submits.push(new FormData(e.currentTarget)); }}
        onReset={() => { log.resets++; }}
      >
        {field}
        {React.cloneElement(button, { onClick: () => { log.clicks++; } })}
      </form>,
      'ty-button',
    );
    const press = () => (m.host.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    return { log, press, form: m.host.closest('form')! };
  }

  const valid = <input name="q" defaultValue="hi" required />;
  const invalid = <input name="q" required />;
  const invalidTy = <TyInput name="q" required />;

  for (const [label, button] of [
    ['type="submit"', <TyButton type="submit">Go</TyButton>],
    ['no type', <TyButton>Go</TyButton>],
  ] as const) {
    it(`${label}: valid form submits exactly once, onClick fires once`, async () => {
      const { log, press } = await mountForm(button, valid);
      press();
      await nextFrame();
      expect(log.submits, 'onSubmit').to.have.length(1);
      expect(log.clicks, 'onClick').to.equal(1);
    });

    it(`${label}: empty required <input> blocks submit`, async () => {
      const { log, press } = await mountForm(button, invalid);
      press();
      await nextFrame();
      expect(log.submits).to.have.length(0);
      expect(log.clicks, 'onClick still fires').to.equal(1);
    });

    it(`${label}: empty required <ty-input> blocks submit`, async () => {
      const { log, press } = await mountForm(button, invalidTy);
      press();
      await nextFrame();
      expect(log.submits).to.have.length(0);
    });
  }

  it('type="button" never submits', async () => {
    const { log, press } = await mountForm(<TyButton type="button">Go</TyButton>, valid);
    press();
    await nextFrame();
    expect(log.submits).to.have.length(0);
    expect(log.clicks).to.equal(1);
  });

  it('type="reset" resets the form once and does not submit', async () => {
    const { log, press, form } = await mountForm(<TyButton type="reset">Clear</TyButton>, valid);
    const input = form.querySelector('input')!;
    input.value = 'changed';
    press();
    await nextFrame();
    expect(log.resets, 'onReset').to.equal(1);
    expect(input.value, 'field back to its default').to.equal('hi');
    expect(log.submits).to.have.length(0);
  });

  for (const prop of ['disabled', 'loading'] as const) {
    it(`${prop} TyButton never submits`, async () => {
      const { log, press } = await mountForm(<TyButton type="submit" {...{ [prop]: true }}>Go</TyButton>, valid);
      press();
      await nextFrame();
      expect(log.submits).to.have.length(0);
    });
  }

  it('submitter name/value lands in the FormData', async () => {
    const { log, press } = await mountForm(<TyButton type="submit" name="intent" value="save">Save</TyButton>, valid);
    press();
    await nextFrame();
    expect(log.submits).to.have.length(1);
    expect(log.submits[0].get('intent')).to.equal('save');
    expect(log.submits[0].get('q')).to.equal('hi');
  });

  // React 19 used to throw here: `form` is a read-only property on the element.
  it('form="id" submits that form, not the enclosing one; dropping it goes back', async () => {
    const submitted: string[] = [];
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); submitted.push(e.currentTarget.id); };
    const page = (form?: string) => (
      <div>
        <form id="tb-f1" onSubmit={onSubmit}><input name="q" defaultValue="hi" /></form>
        <form id="tb-f2" onSubmit={onSubmit}><TyButton type="submit" form={form}>Go</TyButton></form>
      </div>
    );
    const m = await mount(page('tb-f1'), 'ty-button');
    const press = () => (m.host.shadowRoot!.querySelector('button') as HTMLButtonElement).click();
    press();
    await nextFrame();
    expect(submitted).to.deep.equal(['tb-f1']);
    await m.rerender(page());
    press();
    await nextFrame();
    expect(submitted).to.deep.equal(['tb-f1', 'tb-f2']);
  });
});
