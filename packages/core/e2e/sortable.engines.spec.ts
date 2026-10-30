import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * ty-sortable across engines (Chromium, Firefox, WebKit): real mouse and
 * keyboard input against the built dist/. The component never moves nodes;
 * the page-level renderer below applies value.order the way an app would.
 */

const CARD = 'height:40px;margin:0 0 8px;background:#ddd;display:flex;align-items:center;gap:8px;padding:0 8px'

function items(keys: string[], withHandles: boolean): string {
  return keys
    .map((k) => `<div data-key="${k}" style="${CARD}">${withHandles ? `<button type="button" data-handle aria-label="Move ${k}" style="width:32px;height:32px">=</button>` : ''}<span>${k}</span></div>`)
    .join('')
}

function list(id: string, keys: string[], { group = '', handles = false, attrs = '' } = {}): string {
  return `<ty-sortable id="${id}" ${group ? `group="${group}"` : ''} ${attrs} style="display:block;width:220px;min-height:48px;padding:4px;--ty-sortable-duration:0ms">${items(keys, handles)}</ty-sortable>`
}

const board = (...lists: string[]) => `<div style="display:flex;gap:40px">${lists.join('')}</div>`

/**
 * Record every sortable event on document (capture: start/cancel/settle
 * don't bubble). mode 'apply' renders value.order synchronously inside the
 * handler, 'apply-deferred' renders it in a later task (a fetch/morph),
 * 'reject' calls preventDefault, 'none' does nothing.
 */
async function instrument(page: Page, mode: 'apply' | 'apply-deferred' | 'reject' | 'none' = 'apply') {
  await page.evaluate((mode) => {
    const w = window as any
    w.log = []
    for (const type of ['ty-sortable-start', 'ty-sortable-change', 'ty-sortable-cancel', 'ty-sortable-settle']) {
      document.addEventListener(type, (e: any) => {
        w.log.push({
          type,
          target: (e.target as Element).id,
          value: JSON.parse(JSON.stringify(e.detail.value)),
          reason: e.detail.reason,
          outcome: e.detail.outcome,
          bubbles: e.bubbles,
          cancelable: e.cancelable,
          fromContainer: e.detail.fromContainer?.id,
          toContainer: e.detail.toContainer?.id,
        })
      }, true)
    }
    document.addEventListener('ty-sortable-change', (e: any) => {
      if (mode === 'reject') e.preventDefault()
      if (mode !== 'apply' && mode !== 'apply-deferred') return
      const render = (order: Record<string, string[]>) => {
        for (const [id, keys] of Object.entries(order)) {
          const c = document.getElementById(id)!
          for (const k of keys) c.appendChild(document.querySelector(`[data-key="${k}"]`)!)
        }
      }
      const order = e.detail.value.order
      if (mode === 'apply') render(order)
      else setTimeout(() => render(order), 50)
    })
  }, mode)
}

const log = (page: Page) => page.evaluate(() => (window as any).log as any[])
const ofType = async (page: Page, type: string) => (await log(page)).filter((e) => e.type === type)
const keysOf = (page: Page, id: string) =>
  page.evaluate((id) => Array.from(document.getElementById(id)!.children).map((c) => c.getAttribute('data-key')), id)
const layerState = (page: Page) =>
  page.evaluate(() => {
    const layers = document.querySelectorAll('[data-ty-sortable-layer]')
    const l = layers[0] as HTMLElement | undefined
    let open = false
    try { open = !!l?.matches(':popover-open') } catch { open = false }
    return { count: layers.length, open }
  })

async function center(page: Page, selector: string) {
  const b = (await page.locator(selector).boundingBox())!
  return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }
}

/** Mouse down on `from`, move in steps to `to`, optional callback while still held, release. */
async function mouseDrag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }, during?: () => Promise<void>) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(Math.round(from.x + ((to.x - from.x) * i) / steps), Math.round(from.y + ((to.y - from.y) * i) / steps))
    await page.waitForTimeout(16)
  }
  await page.waitForTimeout(50)
  if (during) await during()
  await page.mouse.up()
}

test.describe('ty-sortable engines', () => {
  test('mouse reorder within a list: one change with from/to/order, layer shown then removed', async ({ page }) => {
    await mount(page, list('a', ['1', '2', '3']))
    await instrument(page)
    const from = await center(page, '[data-key="1"]')
    const last = await center(page, '[data-key="3"]')
    let during = { count: 0, open: false }
    await mouseDrag(page, from, { x: last.x, y: last.y + 15 }, async () => {
      during = await layerState(page)
    })
    expect(during.count).toBe(1)
    expect(during.open).toBe(true)

    const changes = await ofType(page, 'ty-sortable-change')
    expect(changes.length).toBe(1)
    const c = changes[0]
    expect(c.target).toBe('a')
    expect(c.bubbles).toBe(true)
    expect(c.cancelable).toBe(true)
    expect(c.fromContainer).toBe('a')
    expect(c.toContainer).toBe('a')
    expect(c.value.key).toBe('1')
    expect(c.value.source).toBe('pointer')
    expect(c.value.from).toEqual({ list: 'a', index: 0, prev: null, next: '2' })
    expect(c.value.to).toEqual({ list: 'a', index: 2, prev: '3', next: null })
    expect(c.value.order).toEqual({ a: ['2', '3', '1'] })

    expect(await keysOf(page, 'a')).toEqual(['2', '3', '1'])
    await expect.poll(async () => (await ofType(page, 'ty-sortable-settle')).map((e) => e.outcome)).toEqual(['accepted'])
    await expect.poll(async () => (await layerState(page)).count).toBe(0)
    expect((await ofType(page, 'ty-sortable-start')).length).toBe(1)
  })

  test('cross-list move in a group', async ({ page }) => {
    await mount(page, board(list('a', ['1', '2', '3'], { group: 'g' }), list('b', ['4', '5'], { group: 'g' })))
    await instrument(page)
    const from = await center(page, '[data-key="2"]')
    const to = await center(page, '[data-key="5"]')
    await mouseDrag(page, from, { x: to.x, y: to.y - 12 })

    const changes = await ofType(page, 'ty-sortable-change')
    expect(changes.length).toBe(1)
    const c = changes[0]
    expect(c.target).toBe('b')
    expect(c.fromContainer).toBe('a')
    expect(c.toContainer).toBe('b')
    expect(c.value.group).toBe('g')
    expect(c.value.from).toEqual({ list: 'a', index: 1, prev: '1', next: '3' })
    expect(c.value.to).toEqual({ list: 'b', index: 1, prev: '4', next: '5' })
    expect(c.value.order).toEqual({ a: ['1', '3'], b: ['4', '2', '5'] })

    expect(await keysOf(page, 'a')).toEqual(['1', '3'])
    expect(await keysOf(page, 'b')).toEqual(['4', '2', '5'])
    await expect.poll(async () => (await ofType(page, 'ty-sortable-settle')).map((e) => [e.target, e.outcome])).toEqual([['b', 'accepted']])
    await expect.poll(async () => (await layerState(page)).count).toBe(0)
  })

  for (const mode of ['apply-deferred', 'apply'] as const) {
    test(`keyboard: Space on a handle picks up, ArrowDown moves, Space drops (${mode === 'apply' ? 'sync' : 'deferred'} renderer)`, async ({ page }) => {
      await mount(page, list('a', ['1', '2', '3'], { handles: true }))
      await instrument(page, mode)
      await page.locator('[data-key="1"] [data-handle]').focus()
      await page.keyboard.press('Space')
      expect((await ofType(page, 'ty-sortable-start')).map((e) => e.value.source)).toEqual(['keyboard'])
      expect((await layerState(page)).count).toBe(1)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Space')

      const changes = await ofType(page, 'ty-sortable-change')
      expect(changes.length).toBe(1)
      expect(changes[0].value.source).toBe('keyboard')
      expect(changes[0].value.from.index).toBe(0)
      expect(changes[0].value.to).toEqual({ list: 'a', index: 1, prev: '2', next: '3' })
      expect(changes[0].value.order).toEqual({ a: ['2', '1', '3'] })
      await expect.poll(() => keysOf(page, 'a')).toEqual(['2', '1', '3'])
      await expect.poll(async () => (await ofType(page, 'ty-sortable-settle')).map((e) => e.outcome)).toEqual(['accepted'])
      await expect.poll(async () => (await layerState(page)).count).toBe(0)
      // One pick-up only: neither the drop keydown nor the Space keyup's click started another.
      await page.waitForTimeout(100)
      expect((await ofType(page, 'ty-sortable-start')).length).toBe(1)
      // Focus follows the item.
      expect(await page.evaluate(() => document.activeElement?.closest('[data-key]')?.getAttribute('data-key'))).toBe('1')
    })
  }

  test('keyboard: Escape cancels', async ({ page }) => {
    await mount(page, list('a', ['1', '2', '3'], { handles: true }))
    await instrument(page)
    await page.locator('[data-key="1"] [data-handle]').focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Escape')
    const cancels = await ofType(page, 'ty-sortable-cancel')
    expect(cancels.map((e) => [e.target, e.reason, e.bubbles])).toEqual([['a', 'escape', false]])
    expect(await ofType(page, 'ty-sortable-change')).toEqual([])
    expect(await keysOf(page, 'a')).toEqual(['1', '2', '3'])
    await expect.poll(async () => (await layerState(page)).count).toBe(0)
  })

  test('pointer: Escape mid-drag cancels, release does nothing', async ({ page }) => {
    await mount(page, list('a', ['1', '2', '3']))
    await instrument(page)
    const from = await center(page, '[data-key="1"]')
    const last = await center(page, '[data-key="3"]')
    await mouseDrag(page, from, { x: last.x, y: last.y + 15 }, async () => {
      expect((await layerState(page)).count).toBe(1)
      await page.keyboard.press('Escape')
    })
    expect((await ofType(page, 'ty-sortable-cancel')).map((e) => e.reason)).toEqual(['escape'])
    expect(await ofType(page, 'ty-sortable-change')).toEqual([])
    expect(await keysOf(page, 'a')).toEqual(['1', '2', '3'])
    await expect.poll(async () => (await layerState(page)).count).toBe(0)
  })

  test('hold: a synchronous renderer settles accepted', async ({ page }) => {
    await mount(page, list('a', ['1', '2', '3'], { attrs: 'hold-timeout="3000"' }))
    await instrument(page, 'apply')
    const from = await center(page, '[data-key="3"]')
    const first = await center(page, '[data-key="1"]')
    await mouseDrag(page, from, { x: first.x, y: first.y - 12 })
    await expect.poll(async () => (await ofType(page, 'ty-sortable-settle')).map((e) => e.outcome), { timeout: 1000 }).toEqual(['accepted'])
    const settle = (await ofType(page, 'ty-sortable-settle'))[0]
    expect(settle.target).toBe('a')
    expect(settle.bubbles).toBe(false)
    expect(settle.value.order).toEqual({ a: ['3', '1', '2'] })
    expect(await keysOf(page, 'a')).toEqual(['3', '1', '2'])
  })

  test('hold: preventDefault settles rejected and the order stays', async ({ page }) => {
    await mount(page, list('a', ['1', '2', '3'], { attrs: 'hold-timeout="3000"' }))
    await instrument(page, 'reject')
    const from = await center(page, '[data-key="1"]')
    const last = await center(page, '[data-key="3"]')
    await mouseDrag(page, from, { x: last.x, y: last.y + 15 })
    expect((await ofType(page, 'ty-sortable-change')).length).toBe(1)
    await expect.poll(async () => (await ofType(page, 'ty-sortable-settle')).map((e) => e.outcome), { timeout: 1000 }).toEqual(['rejected'])
    expect(await keysOf(page, 'a')).toEqual(['1', '2', '3'])
    await expect.poll(async () => (await layerState(page)).count).toBe(0)
  })

  test('shift and the lift: siblings move aside, the ghost scales, all cleaned up after', async ({ page }) => {
    await mount(page, list('a', ['1', '2', '3']))
    await instrument(page)
    await page.evaluate(() => {
      const a = document.getElementById('a')!
      a.style.setProperty('--ty-sortable-ghost-scale', '1.1')
      a.style.setProperty('--ty-sortable-ghost-rotate', '2deg')
    })
    const ty = (key: string) => page.evaluate((k) => {
      const t = getComputedStyle(document.querySelector(`[data-key="${k}"]`)!).translate
      return t === 'none' ? 0 : parseFloat(t.split(' ')[1] ?? '0')
    }, key)
    const from = await center(page, '[data-key="1"]')
    const to = await center(page, '[data-key="3"]')
    await mouseDrag(page, from, { x: to.x, y: to.y + 15 }, async () => {
      await page.waitForTimeout(250)
      expect(await ty('2')).toBeLessThan(-20)
      expect(await ty('3')).toBeLessThan(-20)
      expect(await ty('1')).toBeGreaterThan(40)
      const ghost = await page.evaluate(() => {
        const g = document.querySelector('[data-ty-sortable-ghost]')!
        const cs = getComputedStyle(g)
        return { scale: cs.scale, rotate: cs.rotate }
      })
      expect(ghost).toEqual({ scale: '1.1', rotate: '2deg' })
    })
    await expect.poll(async () => (await ofType(page, 'ty-sortable-settle')).map((e) => e.outcome), { timeout: 1000 }).toEqual(['accepted'])
    expect(await keysOf(page, 'a')).toEqual(['2', '3', '1'])
    for (const k of ['1', '2', '3']) expect(await ty(k)).toBe(0)
    await expect.poll(async () => (await layerState(page)).count).toBe(0)
  })
})
