import { fixture, html, expect, nextFrame, oneEvent, aTimeout } from '@open-wc/testing';
import { sendMouse, resetMouse, sendKeys } from '@web/test-runner-commands';
import '../lib/components/copy.js';

// navigator.clipboard is an own accessor on Navigator.prototype in Chrome;
// redefining it per-test (and restoring afterwards) is the simplest reliable
// stub since this repo has no sinon dependency.
function stubClipboardWriteText(impl: (text: string) => Promise<void>): () => void {
  const original = (navigator as any).clipboard;
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: impl },
    configurable: true,
  });
  return () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: original,
      configurable: true,
    });
  };
}

function stubExecCommand(impl: (command: string) => boolean): () => void {
  const original = document.execCommand;
  document.execCommand = impl as typeof document.execCommand;
  return () => {
    document.execCommand = original;
  };
}

describe('ty-copy', () => {
  it('reflects value and format', async () => {
    const el = (await fixture(html`<ty-copy value="hello" format="code"></ty-copy>`)) as any;
    await nextFrame();
    expect(el.value).to.equal('hello');
    expect(el.format).to.equal('code');
  });

  it('is also registered as ty-copy-field (same behavior)', async () => {
    const el = (await fixture(html`<ty-copy-field value="hello"></ty-copy-field>`)) as any;
    await nextFrame();
    expect(el.value).to.equal('hello');
  });
});

describe('ty-copy flavor', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--ty-color-success');
  });

  it('colors the copy button from the flavor', async () => {
    document.documentElement.style.setProperty('--ty-color-success', 'rgb(1, 2, 3)');
    const el = (await fixture(html`<ty-copy value="x" flavor="success"></ty-copy>`)) as any;
    await nextFrame();
    const cs = getComputedStyle(el.shadowRoot.querySelector('.copy-button'));
    expect(cs.color).to.equal('rgb(1, 2, 3)');
  });
});

describe('ty-copy accessibility — copy button has a real accessible name', () => {
  it('the icon-only button carries aria-label (was: none at all)', async () => {
    const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button');
    expect(btn.getAttribute('aria-label'), 'has an accessible name').to.be.a('string').and.not.empty;
  });
});

describe('ty-copy clipboard interactions', () => {
  let restoreClipboard: (() => void) | null = null;

  afterEach(() => {
    if (restoreClipboard) {
      restoreClipboard();
      restoreClipboard = null;
    }
  });

  it('dispatches copy-success with the copied value when the Clipboard API succeeds', async () => {
    let written = '';
    restoreClipboard = stubClipboardWriteText(async (text) => {
      written = text;
    });
    const el = (await fixture(html`<ty-copy value="secret-token"></ty-copy>`)) as any;
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button');
    const evPromise = oneEvent(el, 'copy-success');
    btn.click();
    const ev = await evPromise;
    expect(written).to.equal('secret-token');
    expect(ev.detail.value).to.equal('secret-token');
  });

  it('falls back to document.execCommand and still succeeds when the Clipboard API rejects', async () => {
    restoreClipboard = stubClipboardWriteText(async () => {
      throw new Error('denied');
    });
    let execUsedValue = '';
    const restoreExec = stubExecCommand(() => {
      const active = document.activeElement as HTMLTextAreaElement | null;
      execUsedValue = active ? active.value : '';
      return true;
    });
    try {
      const el = (await fixture(html`<ty-copy value="fallback-value"></ty-copy>`)) as any;
      await nextFrame();
      const btn = el.shadowRoot.querySelector('.copy-button');
      const evPromise = oneEvent(el, 'copy-success');
      btn.click();
      const ev = await evPromise;
      expect(execUsedValue).to.equal('fallback-value');
      expect(ev.detail.value).to.equal('fallback-value');
    } finally {
      restoreExec();
    }
  });

  it('dispatches copy-error with the failure reason and shows the error icon when both the Clipboard API and execCommand fail', async () => {
    restoreClipboard = stubClipboardWriteText(async () => {
      throw new Error('denied');
    });
    const execError = new Error('exec failed');
    const restoreExec = stubExecCommand(() => {
      throw execError;
    });
    try {
      const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
      await nextFrame();
      const btn = el.shadowRoot.querySelector('.copy-button');
      const evPromise = oneEvent(el, 'copy-error');
      btn.click();
      const ev = await evPromise;
      expect(ev.detail.error).to.equal(execError);
      const btnAfter = el.shadowRoot.querySelector('.copy-button');
      expect(btnAfter.classList.contains('error')).to.be.true;
      expect(btnAfter.getAttribute('aria-label')).to.equal('Copy failed');
    } finally {
      restoreExec();
    }
  });

  it('reverts the error icon back to the copy icon after the 2s timeout', async function () {
    this.timeout(6000);
    restoreClipboard = stubClipboardWriteText(async () => {
      throw new Error('denied');
    });
    const restoreExec = stubExecCommand(() => {
      throw new Error('exec failed');
    });
    try {
      const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
      await nextFrame();
      const btn = el.shadowRoot.querySelector('.copy-button');
      const evPromise = oneEvent(el, 'copy-error');
      btn.click();
      await evPromise;
      await aTimeout(2200);
      const btnAfter = el.shadowRoot.querySelector('.copy-button');
      expect(btnAfter.classList.contains('error')).to.be.false;
      expect(btnAfter.getAttribute('aria-label')).to.equal('Copy to clipboard');
    } finally {
      restoreExec();
    }
  });

  it('copy-success detail.value reflects the value actually copied, even if value mutates while the write is pending', async () => {
    let written: string | null = null;
    let resolveWrite: (() => void) | null = null;
    restoreClipboard = stubClipboardWriteText((text) => {
      written = text;
      return new Promise<void>((resolve) => {
        resolveWrite = resolve;
      });
    });
    const el = (await fixture(html`<ty-copy value="original"></ty-copy>`)) as any;
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button');
    const evPromise = oneEvent(el, 'copy-success');
    btn.click();
    await aTimeout(10);
    el.value = 'mutated-during-flight';
    resolveWrite!();
    const ev = await evPromise;
    expect(written).to.equal('original');
    expect(ev.detail.value).to.equal('original');
  });
});

describe('ty-copy rapid repeated clicks', () => {
  let restoreClipboard: (() => void) | null = null;

  afterEach(() => {
    if (restoreClipboard) {
      restoreClipboard();
      restoreClipboard = null;
    }
  });

  it('does not debounce: each rapid click issues its own clipboard write and its own copy-success event', async () => {
    let callCount = 0;
    restoreClipboard = stubClipboardWriteText(async () => {
      callCount += 1;
    });
    const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
    await nextFrame();
    const events: CustomEvent[] = [];
    el.addEventListener('copy-success', (e: Event) => events.push(e as CustomEvent));
    const btn = el.shadowRoot.querySelector('.copy-button');
    btn.click();
    btn.click();
    btn.click();
    await aTimeout(50);
    expect(callCount).to.equal(3);
    expect(events.length).to.equal(3);
  });

  it('restarts the revert timer on each click rather than getting stuck: the icon stays "success" across clicks faster than the 2s window', async () => {
    restoreClipboard = stubClipboardWriteText(async () => {});
    const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
    await nextFrame();
    const getBtn = () => el.shadowRoot.querySelector('.copy-button');
    getBtn().click();
    await aTimeout(10);
    getBtn().click();
    await aTimeout(10);
    expect(getBtn().classList.contains('success')).to.be.true;
    expect(getBtn().getAttribute('aria-label')).to.equal('Copied!');
  });

  // A keyed reorder within the 2s: the disconnect cleared the revert timer,
  // and 'Copied!' stayed on until the next copy.
  it('moved in the DOM while it shows "Copied!", it goes back to the copy icon', async () => {
    restoreClipboard = stubClipboardWriteText(async () => {});
    const wrap = (await fixture(html`<div><div id="a"><ty-copy value="x"></ty-copy></div><div id="b"></div></div>`)) as HTMLElement;
    const el = wrap.querySelector('ty-copy') as any;
    await nextFrame();
    const btn = () => el.shadowRoot.querySelector('.copy-button') as HTMLElement;
    btn().click();
    await aTimeout(10);
    expect(btn().getAttribute('aria-label')).to.equal('Copied!');
    wrap.querySelector('#b')!.append(el);
    expect(btn().classList.contains('success')).to.equal(false);
    expect(btn().getAttribute('aria-label')).to.equal('Copy to clipboard');
  });
});

describe('ty-copy value edge cases', () => {
  let restoreClipboard: (() => void) | null = null;

  afterEach(() => {
    if (restoreClipboard) {
      restoreClipboard();
      restoreClipboard = null;
    }
  });

  it('does nothing for an empty value: no clipboard call and no copy-success/copy-error events', async () => {
    let called = false;
    restoreClipboard = stubClipboardWriteText(async () => {
      called = true;
    });
    const el = (await fixture(html`<ty-copy value=""></ty-copy>`)) as any;
    await nextFrame();
    let sawEvent = false;
    el.addEventListener('copy-success', () => { sawEvent = true; });
    el.addEventListener('copy-error', () => { sawEvent = true; });
    const btn = el.shadowRoot.querySelector('.copy-button');
    btn.click();
    await aTimeout(50);
    expect(called).to.be.false;
    expect(sawEvent).to.be.false;
  });

  it('copies whitespace-only content verbatim, without trimming', async () => {
    let written: string | null = null;
    restoreClipboard = stubClipboardWriteText(async (text) => {
      written = text;
    });
    const el = (await fixture(html`<ty-copy></ty-copy>`)) as any;
    el.value = '   ';
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button');
    const evPromise = oneEvent(el, 'copy-success');
    btn.click();
    await evPromise;
    expect(written).to.equal('   ');
  });

  it('copies the current value after it is mutated post-mount, not the value present at mount time', async () => {
    let written: string | null = null;
    restoreClipboard = stubClipboardWriteText(async (text) => {
      written = text;
    });
    const el = (await fixture(html`<ty-copy value="original"></ty-copy>`)) as any;
    await nextFrame();
    el.value = 'updated';
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button');
    const evPromise = oneEvent(el, 'copy-success');
    btn.click();
    await evPromise;
    expect(written).to.equal('updated');
  });
});

describe('ty-copy disabled state', () => {
  let restoreClipboard: (() => void) | null = null;

  afterEach(() => {
    if (restoreClipboard) {
      restoreClipboard();
      restoreClipboard = null;
    }
  });

  it('renders the copy button with a native disabled attribute', async () => {
    const el = (await fixture(html`<ty-copy value="x" disabled></ty-copy>`)) as any;
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button') as HTMLButtonElement;
    expect(btn.disabled).to.be.true;
  });

  it('ignores clicks on a disabled copy button: no clipboard call, no events', async () => {
    let called = false;
    restoreClipboard = stubClipboardWriteText(async () => {
      called = true;
    });
    const el = (await fixture(html`<ty-copy value="x" disabled></ty-copy>`)) as any;
    await nextFrame();
    let sawEvent = false;
    el.addEventListener('copy-success', () => { sawEvent = true; });
    const btn = el.shadowRoot.querySelector('.copy-button') as HTMLButtonElement;
    btn.click();
    await aTimeout(50);
    expect(called).to.be.false;
    expect(sawEvent).to.be.false;
  });

  it('ignores clicks on the whole-field click-to-copy wrapper when disabled', async () => {
    let called = false;
    restoreClipboard = stubClipboardWriteText(async () => {
      called = true;
    });
    const el = (await fixture(html`<ty-copy value="x" disabled></ty-copy>`)) as any;
    await nextFrame();
    const valueEl = el.shadowRoot.querySelector('.copy-field-value') as HTMLElement;
    valueEl.click();
    await aTimeout(50);
    expect(called).to.be.false;
  });
});

describe('ty-copy format rendering', () => {
  it('renders the value inside a <code> element for format="code"', async () => {
    const el = (await fixture(html`<ty-copy value="const x = 1" format="code"></ty-copy>`)) as any;
    await nextFrame();
    const valueEl = el.shadowRoot.querySelector('.copy-field-value');
    expect(valueEl.tagName).to.equal('CODE');
    expect(valueEl.textContent).to.equal('const x = 1');
  });

  it('renders the value inside a <div> element for the default format="text"', async () => {
    const el = (await fixture(html`<ty-copy value="plain text"></ty-copy>`)) as any;
    await nextFrame();
    const valueEl = el.shadowRoot.querySelector('.copy-field-value');
    expect(valueEl.tagName).to.equal('DIV');
  });

  it('coerces an invalid format attribute to "text" rather than throwing', async () => {
    const el = (await fixture(html`<ty-copy value="x" format="bogus"></ty-copy>`)) as any;
    await nextFrame();
    expect(el.format).to.equal('text');
    const valueEl = el.shadowRoot.querySelector('.copy-field-value');
    expect(valueEl.tagName).to.equal('DIV');
  });

  it('swaps the value wrapper element (div <-> code) when format changes after mount', async () => {
    const el = (await fixture(html`<ty-copy value="x" format="text"></ty-copy>`)) as any;
    await nextFrame();
    expect(el.shadowRoot.querySelector('.copy-field-value').tagName).to.equal('DIV');
    el.format = 'code';
    await nextFrame();
    expect(el.shadowRoot.querySelector('.copy-field-value').tagName).to.equal('CODE');
  });
});

describe('ty-copy keyboard activation', () => {
  let restoreClipboard: (() => void) | null = null;

  afterEach(() => {
    if (restoreClipboard) {
      restoreClipboard();
      restoreClipboard = null;
    }
  });

  // The component adds no keydown handling of its own — Enter/Space
  // activation is delegated entirely to the native <button>, which the
  // browser turns into the same 'click' event a mouse click produces. This
  // asserts the button is a real, enabled, type="button" element (so that
  // native delegation applies) and that the click path it shares with
  // keyboard activation completes successfully.
  it('the copy button is a focusable, enabled, native <button type="button"> so keyboard (Enter/Space) activation reaches the same click handler', async () => {
    restoreClipboard = stubClipboardWriteText(async () => {});
    const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
    await nextFrame();
    const btn = el.shadowRoot.querySelector('.copy-button') as HTMLButtonElement;
    expect(btn.tagName).to.equal('BUTTON');
    expect(btn.type).to.equal('button');
    expect(btn.disabled).to.be.false;
    btn.focus();
    expect(el.shadowRoot.activeElement).to.equal(btn);
    const evPromise = oneEvent(el, 'copy-success');
    btn.click();
    await evPromise;
  });
});

// btn.click() can't catch this: a script-dispatched click runs every listener
// before any microtask. A REAL click, tap or Enter/Space runs microtasks between
// listeners, so a writeText that settles at once (WebKit) had already swapped
// the button's icon — detaching the clicked <svg> — by the time the same click
// reached the field's click-to-copy listener, which then copied a second time.
describe('ty-copy — one copy per real activation', () => {
  let restoreClipboard: (() => void) | null = null;
  let writes = 0;
  let events = 0;

  beforeEach(() => {
    writes = 0;
    events = 0;
    restoreClipboard = stubClipboardWriteText(async () => { writes += 1; });
  });

  afterEach(async () => {
    restoreClipboard?.();
    restoreClipboard = null;
    await resetMouse();
  });

  async function mount(tag: 'ty-copy' | 'ty-copy-field') {
    const el = (await fixture(tag === 'ty-copy'
      ? html`<ty-copy value="secret-42"></ty-copy>`
      : html`<ty-copy-field value="secret-42"></ty-copy-field>`)) as any;
    await nextFrame();
    el.addEventListener('copy-success', () => { events += 1; });
    return el;
  }

  const center = (node: Element): [number, number] => {
    const r = node.getBoundingClientRect();
    return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
  };

  for (const tag of ['ty-copy', 'ty-copy-field'] as const) {
    it(`${tag}: a mouse click on the copy icon copies once`, async () => {
      const el = await mount(tag);
      const svg = el.shadowRoot.querySelector('.copy-button svg');
      await sendMouse({ type: 'click', position: center(svg) });
      await aTimeout(50);
      expect(writes, 'clipboard writes').to.equal(1);
      expect(events, 'copy-success events').to.equal(1);
    });
  }

  it('a mouse click on the value copies once', async () => {
    const el = await mount('ty-copy');
    await sendMouse({ type: 'click', position: center(el.shadowRoot.querySelector('.copy-field-value')) });
    await aTimeout(50);
    expect(writes).to.equal(1);
    expect(events).to.equal(1);
  });

  for (const key of ['Enter', 'Space']) {
    it(`${key} on the focused copy button copies once`, async () => {
      const el = await mount('ty-copy');
      el.shadowRoot.querySelector('.copy-button').focus();
      await sendKeys({ press: key });
      await aTimeout(50);
      expect(writes).to.equal(1);
      expect(events).to.equal(1);
    });
  }
});

describe('ty-copy — execCommand fallback keeps keyboard focus', () => {
  it('focus returns to the copy button, so the next Enter/Space copies again', async () => {
    const restoreClipboard = stubClipboardWriteText(async () => { throw new Error('denied'); });
    const restoreExec = stubExecCommand(() => true);
    try {
      const el = (await fixture(html`<ty-copy value="x"></ty-copy>`)) as any;
      await nextFrame();
      let events = 0;
      el.addEventListener('copy-success', () => { events += 1; });
      const btn = el.shadowRoot.querySelector('.copy-button') as HTMLButtonElement;
      btn.focus();
      await sendKeys({ press: 'Enter' });
      await aTimeout(50);
      expect(el.shadowRoot.activeElement === btn, 'button still focused').to.be.true;
      expect(document.querySelector('body > textarea'), 'helper textarea removed').to.be.null;
      await sendKeys({ press: 'Space' });
      await aTimeout(50);
      expect(events).to.equal(2);
    } finally {
      restoreExec();
      restoreClipboard();
    }
  });
});
