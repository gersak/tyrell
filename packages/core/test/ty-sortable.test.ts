/**
 * ty-sortable: controlled reorder. The component never moves light-DOM
 * nodes; it reports the move and holds the result until the app renders it.
 */
import { fixture, html, expect, nextFrame, aTimeout } from '@open-wc/testing';
import { sendKeys, sendMouse, resetMouse } from '@web/test-runner-commands';
import '../lib/components/sortable.js';
import type { TySortable } from '../lib/components/sortable.js';
import { morph } from './helpers/morph.js';

const CARD = 'height: 40px; margin: 0 0 8px; background: #eee;';

function list(id: string, keys: string[], attrs = ''): string {
  return `<ty-sortable id="${id}" group="board" ${attrs} style="display:block; width: 200px; min-height: 48px; padding: 4px; --ty-sortable-duration: 0ms">
    ${keys.map((k) => `<div data-key="${k}" style="${CARD}">${k}</div>`).join('')}
  </ty-sortable>`;
}

async function mount(markup: string): Promise<HTMLElement> {
  const host = await fixture<HTMLElement>(html`<div style="display:flex; gap: 40px; padding: 20px"></div>`);
  host.innerHTML = markup;
  await nextFrame();
  return host;
}

function keys(el: Element): string[] {
  return Array.from(el.children).map((c) => c.getAttribute('data-key')!);
}

function center(el: Element): [number, number] {
  const r = el.getBoundingClientRect();
  return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
}

function recordChanges(el: EventTarget): any[] {
  const events: any[] = [];
  el.addEventListener('ty-sortable-change', (e) => events.push((e as CustomEvent).detail));
  return events;
}

async function frames(n = 3): Promise<void> {
  for (let i = 0; i < n; i++) await nextFrame();
}

/** Press on `from`, move in steps to [x, y], release. */
async function drag(from: Element, to: [number, number]): Promise<void> {
  const [sx, sy] = center(from);
  await sendMouse({ type: 'move', position: [sx, sy] });
  await sendMouse({ type: 'down' });
  for (let i = 1; i <= 5; i++) {
    await sendMouse({ type: 'move', position: [Math.round(sx + ((to[0] - sx) * i) / 5), Math.round(sy + ((to[1] - sy) * i) / 5)] });
    await nextFrame();
  }
  await frames(2);
  await sendMouse({ type: 'up' });
}

/** What a renderer does with the event: apply the order it carries. */
function apply(board: Element, value: any): void {
  for (const [id, order] of Object.entries(value.order as Record<string, string[]>)) {
    const c = board.querySelector(`#${id}`)!;
    const all = new Map(Array.from(board.querySelectorAll('[data-key]')).map((n) => [n.getAttribute('data-key'), n]));
    for (const k of order) c.appendChild(all.get(k)!);
  }
}

describe('ty-sortable', () => {
  afterEach(async () => {
    await resetMouse();
    // End any hold a test left open (holds are page-wide).
    (document.createElement('ty-sortable') as TySortable).settle('rejected');
    await aTimeout(10);
  });

  it('reports a reorder and leaves the DOM alone', async () => {
    const board = await mount(list('a', ['1', '2', '3']));
    const a = board.querySelector('#a') as TySortable;
    const events = recordChanges(a);
    const [x, y] = center(a.children[2]);
    await drag(a.children[0], [x, y + 15]);
    expect(events.length).to.equal(1);
    const v = events[0].value;
    expect(v.key).to.equal('1');
    expect(v.source).to.equal('pointer');
    expect(v.from).to.deep.equal({ list: 'a', index: 0, prev: null, next: '2' });
    expect(v.to).to.deep.equal({ list: 'a', index: 2, prev: '3', next: null });
    expect(v.order).to.deep.equal({ a: ['2', '3', '1'] });
    expect(keys(a)).to.deep.equal(['1', '2', '3']);
  });

  it('moves between lists of a group', async () => {
    const board = await mount(list('a', ['1', '2']) + list('b', ['3']));
    const a = board.querySelector('#a')!;
    const b = board.querySelector('#b')!;
    const events = recordChanges(b);
    const [x, y] = center(b.children[0]);
    await drag(a.children[1], [x, y - 15]);
    expect(events.length).to.equal(1);
    const v = events[0].value;
    expect(v.from.list).to.equal('a');
    expect(v.to).to.deep.equal({ list: 'b', index: 0, prev: null, next: '3' });
    expect(v.order).to.deep.equal({ a: ['1'], b: ['2', '3'] });
    expect(events[0].fromContainer).to.equal(a);
    expect(events[0].toContainer).to.equal(b);
  });

  it('drops into an empty list', async () => {
    const board = await mount(list('a', ['1']) + list('b', []));
    const b = board.querySelector('#b')!;
    const events = recordChanges(b);
    await drag(board.querySelector('#a')!.children[0], center(b));
    expect(events.length).to.equal(1);
    expect(events[0].value.to).to.deep.equal({ list: 'b', index: 0, prev: null, next: null });
  });

  it('no event for a drop back in place, or outside every list', async () => {
    const board = await mount(list('a', ['1', '2']));
    const a = board.querySelector('#a')!;
    const events = recordChanges(a);
    const [x, y] = center(a.children[0]);
    await drag(a.children[0], [x, y + 3]);
    await aTimeout(20);
    await drag(a.children[0], [x + 600, y]);
    expect(events.length).to.equal(0);
  });

  it('accepts refuses foreign items; same-group lists without it take them', async () => {
    const board = await mount(list('a', ['1']) + list('b', ['2'], 'accepts=".bug"'));
    const b = board.querySelector('#b')!;
    const events = recordChanges(b);
    const cancels: any[] = [];
    board.querySelector('#a')!.addEventListener('ty-sortable-cancel', (e) => cancels.push((e as CustomEvent).detail));
    await drag(board.querySelector('#a')!.children[0], center(b.children[0]));
    expect(events.length).to.equal(0);
    expect(cancels[0]?.reason).to.equal('blocked');
  });

  it('lists in other groups are not targets', async () => {
    const board = await mount(list('a', ['1']) + list('b', ['2']).replace('group="board"', 'group="other"'));
    const b = board.querySelector('#b')!;
    const events = recordChanges(b);
    await drag(board.querySelector('#a')!.children[0], center(b.children[0]));
    expect(events.length).to.equal(0);
  });

  it('a handle is the only grip when an item has one', async () => {
    const board = await mount(`<ty-sortable id="a" style="display:block; width:200px; --ty-sortable-duration:0ms">
      <div data-key="1" style="${CARD} display:flex"><button type="button" data-handle style="width:30px">=</button><span>one</span></div>
      <div data-key="2" style="${CARD} display:flex"><button type="button" data-handle style="width:30px">=</button><span>two</span></div>
    </ty-sortable>`);
    const a = board.querySelector('#a')!;
    const events = recordChanges(a);
    const [x, y] = center(a.children[1]);
    await drag(a.children[0].querySelector('span')!, [x, y + 15]);
    expect(events.length).to.equal(0);
    await aTimeout(20);
    await drag(a.children[0].querySelector('button')!, [x, y + 15]);
    expect(events.length).to.equal(1);
  });

  it('locked items cannot be picked up and anchor the ends', async () => {
    const board = await mount(`<ty-sortable id="a" style="display:block; width:200px; --ty-sortable-duration:0ms">
      <div data-key="h" data-locked style="${CARD}">header</div>
      <div data-key="1" style="${CARD}">1</div>
      <div data-key="2" style="${CARD}">2</div>
    </ty-sortable>`);
    const a = board.querySelector('#a')!;
    const events = recordChanges(a);
    const [x, y] = center(a.children[0]);
    await drag(a.children[2], [x, y - 15]);
    expect(events.length).to.equal(1);
    expect(events[0].value.to.index).to.equal(1);
    expect(events[0].value.to.prev).to.equal('h');
  });

  it('canDrop blocks a slot', async () => {
    const board = await mount(list('a', ['1', '2', '3']));
    const a = board.querySelector('#a') as TySortable;
    a.canDrop = ({ index }) => index !== 0;
    const events = recordChanges(a);
    const [x, y] = center(a.children[0]);
    await drag(a.children[2], [x, y - 15]);
    expect(events.length).to.equal(0);
  });

  describe('hold until render', () => {
    it('holds, then settles accepted when the app renders the order', async () => {
      const board = await mount(list('a', ['1', '2', '3']));
      const a = board.querySelector('#a') as TySortable;
      const settles: any[] = [];
      a.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail));
      let value: any;
      a.addEventListener('ty-sortable-change', (e) => { value = (e as CustomEvent).detail.value; });
      const [x, y] = center(a.children[2]);
      await drag(a.children[0], [x, y + 15]);
      expect(a.matches(':state(pending)')).to.be.true;
      expect(document.querySelector('[data-ty-sortable-layer]')).to.exist;
      apply(board, value);
      await frames(1);
      expect(settles.map((s) => s.outcome)).to.deep.equal(['accepted']);
      expect(keys(a)).to.deep.equal(['2', '3', '1']);
      expect(a.matches(':state(pending)')).to.be.false;
      expect(document.querySelector('[data-ty-sortable-layer]')).to.not.exist;
    });

    it('a synchronous render inside the handler is accepted', async () => {
      const board = await mount(list('a', ['1', '2', '3']));
      const a = board.querySelector('#a') as TySortable;
      const settles: string[] = [];
      a.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome));
      a.addEventListener('ty-sortable-change', (e) => apply(board, (e as CustomEvent).detail.value));
      const [x, y] = center(a.children[1]);
      await drag(a.children[0], [x, y + 15]);
      await frames(1);
      expect(settles).to.deep.equal(['accepted']);
      expect(keys(a)).to.deep.equal(['2', '1', '3']);
    });

    it('preventDefault rejects at once', async () => {
      const board = await mount(list('a', ['1', '2']));
      const a = board.querySelector('#a') as TySortable;
      const settles: string[] = [];
      a.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome));
      a.addEventListener('ty-sortable-change', (e) => e.preventDefault());
      const [x, y] = center(a.children[1]);
      await drag(a.children[0], [x, y + 15]);
      await frames(2);
      expect(settles).to.deep.equal(['rejected']);
      expect(a.matches(':state(pending)')).to.be.false;
    });

    it('busy then idle with the same order is a rejection', async () => {
      const board = await mount(list('a', ['1', '2']));
      const a = board.querySelector('#a') as TySortable;
      const settles: string[] = [];
      a.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome));
      a.addEventListener('ty-sortable-change', () => a.setAttribute('aria-busy', 'true'));
      const [x, y] = center(a.children[1]);
      await drag(a.children[0], [x, y + 15]);
      await aTimeout(30);
      expect(settles).to.deep.equal([]);
      // The server re-sends the same markup and the request ends.
      morph(a, list('a', ['1', '2']));
      a.removeAttribute('aria-busy');
      await aTimeout(400);
      expect(settles).to.deep.equal(['rejected']);
    });

    it('a render that lands just after the request ends is still accepted (htmx swap delay)', async () => {
      const board = await mount(list('a', ['1', '2']));
      const a = board.querySelector('#a') as TySortable;
      const settles: string[] = [];
      a.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome));
      let value: any;
      a.addEventListener('ty-sortable-change', (e) => { value = (e as CustomEvent).detail.value; a.setAttribute('aria-busy', 'true'); });
      const [x, y] = center(a.children[1]);
      await drag(a.children[0], [x, y + 15]);
      a.removeAttribute('aria-busy');
      await aTimeout(100);
      apply(board, value);
      await frames(1);
      expect(settles).to.deep.equal(['accepted']);
    });

    it('an unrelated change in the group keeps holding', async () => {
      const board = await mount(list('a', ['1', '2', '3']) + list('b', ['4']));
      const a = board.querySelector('#a') as TySortable;
      const b = board.querySelector('#b')!;
      const settles: string[] = [];
      a.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome));
      let value: any;
      a.addEventListener('ty-sortable-change', (e) => { value = (e as CustomEvent).detail.value; });
      const [x, y] = center(a.children[2]);
      await drag(a.children[0], [x, y + 15]);
      // Another user's card arrives in the other list.
      const card = document.createElement('div');
      card.setAttribute('data-key', '5');
      b.appendChild(card);
      await frames(1);
      expect(settles).to.deep.equal([]);
      expect(a.matches(':state(pending)')).to.be.true;
      apply(board, value);
      await frames(1);
      expect(settles).to.deep.equal(['accepted']);
    });

    it('a list replaced by a new host (htmx outerHTML) is followed', async () => {
      const board = await mount(list('a', ['1', '2', '3']).replace('group="board"', ''));
      const a = board.querySelector('#a') as TySortable;
      const settles: string[] = [];
      // Settle doesn't bubble; the new host is a different node, so listen in capture.
      board.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome), true);
      a.addEventListener('ty-sortable-change', () => a.classList.add('htmx-request'));
      const [x, y] = center(a.children[2]);
      await drag(a.children[0], [x, y + 15]);
      a.classList.remove('htmx-request');
      a.outerHTML = list('a', ['2', '3', '1']).replace('group="board"', '');
      await aTimeout(400);
      expect(settles).to.deep.equal(['accepted']);
    });
    it('a morph to the new order is accepted (Datastar / idiomorph)', async () => {
      const board = await mount(list('a', ['1', '2']) + list('b', ['3']));
      const a = board.querySelector('#a')!;
      const b = board.querySelector('#b') as TySortable;
      const settles: string[] = [];
      b.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome));
      const [x, y] = center(b.children[0]);
      await drag(a.children[0], [x, y + 15]);
      expect(settles).to.deep.equal([]);
      morph(board, `<div style="display:flex; gap: 40px; padding: 20px">${list('a', ['2'])}${list('b', ['3', '1'])}</div>`);
      await frames(1);
      expect(settles).to.deep.equal(['accepted']);
    });

    it('hold-timeout releases when nothing answers', async () => {
      const board = await mount(list('a', ['1', '2'], 'hold-timeout="50"'));
      const a = board.querySelector('#a') as TySortable;
      const settles: string[] = [];
      a.addEventListener('ty-sortable-settle', (e) => settles.push((e as CustomEvent).detail.outcome));
      const [x, y] = center(a.children[1]);
      await drag(a.children[0], [x, y + 15]);
      await aTimeout(120);
      expect(settles).to.deep.equal(['unknown']);
      expect(a.matches(':state(pending)')).to.be.false;
    });

    it('a new drag waits for the hold', async () => {
      const board = await mount(list('a', ['1', '2', '3'], 'hold-timeout="300"'));
      const a = board.querySelector('#a') as TySortable;
      const events = recordChanges(a);
      const [x, y] = center(a.children[2]);
      await drag(a.children[0], [x, y + 15]);
      await drag(a.children[1], [x, y + 15]);
      expect(events.length).to.equal(1);
      await aTimeout(350);
    });
  });

  describe('keyboard', () => {
    it('Space picks up, arrows move, Space drops', async () => {
      const board = await mount(`<ty-sortable id="a" style="display:block; width:200px; --ty-sortable-duration:0ms">
        <div data-key="1" tabindex="0" style="${CARD}">one</div>
        <div data-key="2" tabindex="0" style="${CARD}">two</div>
        <div data-key="3" tabindex="0" style="${CARD}">three</div>
      </ty-sortable>`);
      const a = board.querySelector('#a') as TySortable;
      const events = recordChanges(a);
      (a.children[0] as HTMLElement).focus();
      await sendKeys({ press: 'Space' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Space' });
      expect(events.length).to.equal(1);
      expect(events[0].value.source).to.equal('keyboard');
      expect(events[0].value.to.index).to.equal(2);
      apply(board, events[0].value);
      await frames(2);
      expect(keys(a)).to.deep.equal(['2', '3', '1']);
      // Focus stays on the moved item.
      expect(document.activeElement).to.equal(a.children[2]);
      const live = a.shadowRoot!.querySelector('.live')!;
      expect(live.textContent).to.contain('one moved to position 3 of 3');
    });

    it('arrows across lists, Escape cancels', async () => {
      const board = await mount(
        list('a', ['1']).replace('<div data-key="1"', '<div data-key="1" tabindex="0"') + list('b', ['2']),
      );
      const a = board.querySelector('#a') as TySortable;
      const b = board.querySelector('#b')!;
      const events = recordChanges(b);
      const cancels: string[] = [];
      a.addEventListener('ty-sortable-cancel', (e) => cancels.push((e as CustomEvent).detail.reason));
      (a.children[0] as HTMLElement).focus();
      await sendKeys({ press: 'Enter' });
      await sendKeys({ press: 'ArrowRight' });
      await sendKeys({ press: 'Escape' });
      expect(cancels).to.deep.equal(['escape']);
      await sendKeys({ press: 'Enter' });
      await sendKeys({ press: 'ArrowRight' });
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Enter' });
      expect(events.length).to.equal(1);
      expect(events[0].value.to).to.deep.equal({ list: 'b', index: 1, prev: '2', next: null });
    });

    it('Space inside a text field in an item types', async () => {
      const board = await mount(`<ty-sortable id="a" style="display:block; width:200px">
        <div data-key="1" tabindex="0" style="${CARD}"><input></div>
      </ty-sortable>`);
      const a = board.querySelector('#a')!;
      const input = a.querySelector('input')!;
      const starts: any[] = [];
      a.addEventListener('ty-sortable-start', (e) => starts.push(e));
      input.focus();
      await sendKeys({ type: 'a b' });
      expect(input.value).to.equal('a b');
      expect(starts.length).to.equal(0);
    });
  });

  describe('move()', () => {
    it('moves by key and resolves when rendered', async () => {
      const board = await mount(list('a', ['1', '2']) + list('b', ['3']));
      const a = board.querySelector('#a') as TySortable;
      const b = board.querySelector('#b')!;
      b.addEventListener('ty-sortable-change', (e) => {
        const v = (e as CustomEvent).detail.value;
        expect(v.source).to.equal('api');
        setTimeout(() => apply(board, v), 10);
      });
      const outcome = await a.move('1', { to: 'b', after: '3' });
      expect(outcome).to.equal('accepted');
      expect(keys(b)).to.deep.equal(['3', '1']);
    });

    it('rejects while a move is pending', async () => {
      const board = await mount(list('a', ['1', '2'], 'hold-timeout="50"'));
      const a = board.querySelector('#a') as TySortable;
      const first = a.move('1', { index: 1 });
      let error: Error | null = null;
      try {
        await a.move('2', { index: 0 });
      } catch (e) {
        error = e as Error;
      }
      expect(error?.message).to.contain('pending');
      expect(await first).to.equal('unknown');
    });
  });

  describe('robustness', () => {
    it('Escape with the button still down: the release does not click', async () => {
      const board = await mount(list('a', ['1', '2']) + '<button id="under" style="width:200px;height:60px">x</button>');
      const a = board.querySelector('#a')!;
      let clicks = 0;
      board.querySelector('#under')!.addEventListener('click', () => clicks++);
      const [sx, sy] = center(a.children[0]);
      const [bx, by] = center(board.querySelector('#under')!);
      await sendMouse({ type: 'move', position: [sx, sy] });
      await sendMouse({ type: 'down' });
      for (let i = 1; i <= 5; i++) {
        await sendMouse({ type: 'move', position: [Math.round(sx + ((bx - sx) * i) / 5), Math.round(sy + ((by - sy) * i) / 5)] });
        await nextFrame();
      }
      await sendKeys({ press: 'Escape' });
      await sendMouse({ type: 'up' });
      await frames(2);
      expect(clicks).to.equal(0);
    });

    it('a keyboard drag survives its item being re-rendered', async () => {
      const markup = (k: string[]) => `<ty-sortable id="a" style="display:block; width:200px; --ty-sortable-duration:0ms">
        ${k.map((x) => `<div data-key="${x}" tabindex="0" style="${CARD}">${x}</div>`).join('')}
      </ty-sortable>`;
      const board = await mount(markup(['1', '2', '3']));
      const a = board.querySelector('#a') as TySortable;
      const events = recordChanges(a);
      (a.children[0] as HTMLElement).focus();
      await sendKeys({ press: 'Space' });
      // A poll replaces every item node.
      a.innerHTML = markup(['1', '2', '3']).replace(/^[\s\S]*?>/, '').replace(/<\/ty-sortable>\s*$/, '');
      await frames(1);
      expect(document.activeElement).to.equal(a.children[0]);
      await sendKeys({ press: 'ArrowDown' });
      await sendKeys({ press: 'Space' });
      expect(events.length).to.equal(1);
      expect(events[0].value.to.index).to.equal(1);
    });

    it('a keyboard drag whose item disappears ends', async () => {
      const board = await mount(`<ty-sortable id="a" style="display:block; width:200px">
        <div data-key="1" tabindex="0" style="${CARD}">1</div><div data-key="2" tabindex="0" style="${CARD}">2</div>
      </ty-sortable>`);
      const a = board.querySelector('#a') as TySortable;
      const cancels: string[] = [];
      a.addEventListener('ty-sortable-cancel', (e) => cancels.push((e as CustomEvent).detail.reason));
      (a.children[0] as HTMLElement).focus();
      await sendKeys({ press: 'Space' });
      a.children[0].remove();
      await frames(1);
      expect(cancels).to.deep.equal(['gone']);
      // Nothing is stuck: a new drag works.
      const outcome = a.move('2', { index: 0 });
      a.settle('accepted');
      expect(await outcome).to.equal('accepted');
    });

    it('a list whose visible part is clipped is not hit below its scroller', async () => {
      const board = await mount(`<div id="clip" style="height:100px; overflow:auto">${list('a', ['1', '2', '3', '4', '5'])}</div>
        <div id="footer" style="height:200px">footer</div>`);
      board.style.flexDirection = 'column';
      const a = board.querySelector('#a')!;
      const events = recordChanges(a);
      const [fx, fy] = center(board.querySelector('#footer')!);
      await drag(a.children[0], [fx, fy]);
      expect(events.length).to.equal(0);
    });
  });

  describe('visuals', () => {
    /** Press on `from`, move to [x, y] and stay there (button still down). */
    async function hold(from: Element, to: [number, number]): Promise<void> {
      const [sx, sy] = center(from);
      await sendMouse({ type: 'move', position: [sx, sy] });
      await sendMouse({ type: 'down' });
      for (let i = 1; i <= 5; i++) {
        await sendMouse({ type: 'move', position: [Math.round(sx + ((to[0] - sx) * i) / 5), Math.round(sy + ((to[1] - sy) * i) / 5)] });
        await nextFrame();
      }
      await frames(3);
    }
    /** The shift offset: ty-sortable moves items with the translate property. */
    const ty = (el: Element) => {
      const t = getComputedStyle(el).translate;
      return t === 'none' ? 0 : parseFloat(t.split(' ')[1] ?? '0');
    };
    const layer = () => document.querySelector('[data-ty-sortable-layer]') as HTMLElement | null;
    const indicatorShown = () => {
      const ind = layer()?.firstElementChild as HTMLElement | undefined;
      return !!ind && ind.style.display === 'block';
    };

    it('preview="shift": siblings make room, the placeholder moves, no line', async () => {
      const board = await mount(list('a', ['1', '2', '3'], 'preview="shift"'));
      const a = board.querySelector('#a') as TySortable;
      const [x, y] = center(a.children[2]);
      await hold(a.children[0], [x, y + 15]);
      expect(ty(a.children[1])).to.be.lessThan(-40);
      expect(ty(a.children[2])).to.be.lessThan(-40);
      expect(ty(a.children[0])).to.be.greaterThan(80);
      expect(indicatorShown()).to.be.false;
      await sendMouse({ type: 'up' });
    });

    it('preview="shift" across lists: the source closes the gap, the target opens one', async () => {
      const board = await mount(list('a', ['1', '2'], 'preview="shift"') + list('b', ['3', '4'], 'preview="shift"'));
      const a = board.querySelector('#a')!;
      const b = board.querySelector('#b')!;
      const [x, y] = center(b.children[0]);
      await hold(a.children[0], [x, y - 15]);
      expect(getComputedStyle(a.children[0]).opacity).to.equal('0');
      expect(ty(a.children[1])).to.be.lessThan(-40);
      expect(ty(b.children[0])).to.be.greaterThan(40);
      expect(ty(b.children[1])).to.be.greaterThan(40);
      await sendMouse({ type: 'up' });
    });

    it('a cancelled shift drag puts everything back', async () => {
      const board = await mount(list('a', ['1', '2', '3'], 'preview="shift"'));
      const a = board.querySelector('#a')!;
      const [x, y] = center(a.children[2]);
      await hold(a.children[0], [x, y + 15]);
      await sendKeys({ press: 'Escape' });
      await sendMouse({ type: 'up' });
      await frames(3);
      for (const el of Array.from(a.children)) {
        expect(ty(el)).to.equal(0);
        expect(getComputedStyle(el).opacity).to.equal('1');
      }
      expect(layer()).to.not.exist;
    });

    it('nothing is left shifted after an accepted hold (line preview)', async () => {
      const board = await mount(list('a', ['1', '2', '3']));
      const a = board.querySelector('#a') as TySortable;
      a.addEventListener('ty-sortable-change', (e) => apply(board, (e as CustomEvent).detail.value));
      const [x, y] = center(a.children[2]);
      await drag(a.children[0], [x, y + 15]);
      await frames(2);
      expect(keys(a)).to.deep.equal(['2', '3', '1']);
      for (const el of Array.from(a.children)) expect(ty(el)).to.equal(0);
    });

    it('the ghost is marked, lifted with the scale/rotate properties, and the cursor grabs', async () => {
      const board = await mount(list('a', ['1', '2'], 'style="--ty-sortable-ghost-scale: 1.1; --ty-sortable-ghost-rotate: 3deg"').replace('style="display:block;', 'data-x style="display:block;'));
      const a = board.querySelector('#a') as HTMLElement;
      a.style.setProperty('--ty-sortable-ghost-scale', '1.1');
      a.style.setProperty('--ty-sortable-ghost-rotate', '3deg');
      const [x, y] = center(a.children[1]);
      await hold(a.children[0], [x, y]);
      await aTimeout(200);
      const ghost = document.querySelector('[data-ty-sortable-ghost]') as HTMLElement;
      expect(ghost).to.exist;
      expect(ghost.hasAttribute('id')).to.be.false;
      const cs = getComputedStyle(ghost);
      expect(cs.scale).to.equal('1.1');
      expect(cs.rotate).to.equal('3deg');
      expect(cs.boxShadow).to.not.equal('none');
      expect(getComputedStyle(document.body).cursor).to.equal('grabbing');
      await sendMouse({ type: 'up' });
      await frames(2);
      expect(getComputedStyle(document.body).cursor).to.not.equal('grabbing');
    });

    it('flash outlines the item where it lands', async () => {
      const board = await mount(list('a', ['1', '2', '3'], 'flash'));
      const a = board.querySelector('#a') as TySortable;
      a.addEventListener('ty-sortable-change', (e) => apply(board, (e as CustomEvent).detail.value));
      const [x, y] = center(a.children[2]);
      await drag(a.children[0], [x, y + 15]);
      await frames(1);
      const landed = a.querySelector('[data-key="1"]')!;
      const outline = landed.getAnimations().some((an) =>
        ((an.effect as KeyframeEffect).getKeyframes() as any[]).some((k) => 'outline' in k || 'outlineColor' in k));
      expect(outline).to.be.true;
    });

    it('keyboard with preview="shift": the placeholder follows the arrows, no line', async () => {
      const board = await mount(`<ty-sortable id="a" preview="shift" style="display:block; width:200px; --ty-sortable-duration:0ms">
        <div data-key="1" tabindex="0" style="${CARD}">one</div>
        <div data-key="2" tabindex="0" style="${CARD}">two</div>
        <div data-key="3" tabindex="0" style="${CARD}">three</div>
      </ty-sortable>`);
      const a = board.querySelector('#a') as TySortable;
      (a.children[0] as HTMLElement).focus();
      await sendKeys({ press: 'Space' });
      await sendKeys({ press: 'ArrowDown' });
      await frames(2);
      expect(ty(a.children[0])).to.be.greaterThan(40);
      expect(ty(a.children[1])).to.be.lessThan(-40);
      expect(indicatorShown()).to.be.false;
      await sendKeys({ press: 'Escape' });
    });

    it('the second item moving one slot shifts its neighbour by one item plus the gap', async () => {
      const board = await mount(list('a', ['1', '2', '3', '4'], 'preview="shift"'));
      const a = board.querySelector('#a')!;
      const [x, y] = center(a.children[2]);
      await hold(a.children[1], [x, y + 15]);
      await aTimeout(250);
      expect(Math.round(ty(a.children[2]))).to.equal(-48);
      expect(Math.round(ty(a.children[1]))).to.equal(48);
      expect(ty(a.children[3])).to.equal(0);
      await sendMouse({ type: 'up' });
    });

    it("an item's own transform survives being shifted", async () => {
      const board = await mount(list('a', ['1', '2', '3'], 'preview="shift"'));
      const a = board.querySelector('#a')!;
      (a.children[1] as HTMLElement).style.transform = 'rotate(2deg)';
      const [x, y] = center(a.children[2]);
      await hold(a.children[0], [x, y + 15]);
      await aTimeout(250);
      expect(ty(a.children[1])).to.be.lessThan(-40);
      expect(getComputedStyle(a.children[1]).transform).to.not.equal('none');
      await sendMouse({ type: 'up' });
    });

    it('an ignored footer moves down with the cards when a gap opens above it', async () => {
      const board = await mount(list('a', ['1']) .replace('<ty-sortable id="a"', '<ty-sortable id="a" preview="shift"')
        + list('b', ['3']).replace('<ty-sortable id="b"', '<ty-sortable id="b" preview="shift"').replace('</ty-sortable>', '<button data-sortable-ignore style="height:30px">add</button></ty-sortable>'));
      const a = board.querySelector('#a')!;
      const b = board.querySelector('#b')!;
      const [x, y] = center(b.children[0]);
      await hold(a.children[0], [x, y + 15]);
      await aTimeout(250);
      expect(ty(b.querySelector('[data-sortable-ignore]')!)).to.be.greaterThan(40);
      await sendMouse({ type: 'up' });
    });

    it('moving on to a list without the preview closes the gaps again', async () => {
      const board = await mount(list('a', ['1', '2'], 'preview="shift"') + list('b', ['3', '4'], 'preview="shift"') + list('c', ['5']));
      const a = board.querySelector('#a')!;
      const b = board.querySelector('#b')!;
      const c = board.querySelector('#c')!;
      const [bx, by] = center(b.children[0]);
      await hold(a.children[0], [bx, by - 15]);
      expect(ty(b.children[0])).to.be.greaterThan(40);
      const [cx, cy] = center(c.children[0]);
      for (let i = 1; i <= 4; i++) {
        await sendMouse({ type: 'move', position: [Math.round(bx + ((cx - bx) * i) / 4), Math.round(by + ((cy - by) * i) / 4)] });
        await nextFrame();
      }
      await aTimeout(250);
      expect(ty(b.children[0])).to.equal(0);
      expect(ty(a.children[1])).to.equal(0);
      expect(getComputedStyle(a.children[0]).opacity).to.not.equal('0');
      await sendMouse({ type: 'up' });
    });

    it('keyboard across lists with preview="shift": the focused item stays visible, a copy fills the gap', async () => {
      const board = await mount(
        list('a', ['1', '2'], 'preview="shift"').replace('<div data-key="1"', '<div data-key="1" tabindex="0"') + list('b', ['3'], 'preview="shift"'),
      );
      const a = board.querySelector('#a')!;
      const b = board.querySelector('#b')!;
      (a.children[0] as HTMLElement).focus();
      await sendKeys({ press: 'Space' });
      await sendKeys({ press: 'ArrowRight' });
      await aTimeout(250);
      expect(getComputedStyle(a.children[0]).opacity).to.not.equal('0');
      expect(ty(a.children[1])).to.equal(0);
      expect(ty(b.children[0])).to.be.greaterThan(40);
      const ghost = document.querySelector('[data-ty-sortable-ghost]') as HTMLElement;
      expect(ghost).to.exist;
      expect(ghost.style.display).to.not.equal('none');
      expect(document.activeElement).to.equal(a.children[0]);
      await sendKeys({ press: 'Escape' });
    });

    it('a morph replacing shifted cards mid-drag re-shifts the new nodes', async () => {
      const board = await mount(list('a', ['1', '2', '3'], 'preview="shift"'));
      const a = board.querySelector('#a')!;
      const [x, y] = center(a.children[2]);
      await hold(a.children[0], [x, y + 15]);
      await aTimeout(250);
      // A poll re-renders card 2 as a new node.
      const fresh = a.children[1].cloneNode(true) as HTMLElement;
      a.replaceChild(fresh, a.children[1]);
      await frames(2);
      await aTimeout(250);
      expect(ty(fresh)).to.be.lessThan(-40);
      await sendMouse({ type: 'up' });
    });
  });
});
