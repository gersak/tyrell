import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * ty-sortable on desktop (Chromium, real mouse): auto-scroll of the right
 * scroller (inner container, not the page), drags inside an open ty-modal,
 * a horizontally scrolling kanban board, and accepts= blocking.
 */

const CARD = 'height:40px;margin:0 0 8px;background:#ddd;display:flex;align-items:center;padding:0 8px;box-sizing:border-box'

const cards = (keys: string[], attrs = '') => keys.map((k) => `<div data-key="${k}" ${attrs} style="${CARD}">${k}</div>`).join('')

const range = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i}`)

async function instrument(page: Page) {
  await page.evaluate(() => {
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
          toContainer: e.detail.toContainer?.id,
        })
      }, true)
    }
    // Render the move, as an app would.
    document.addEventListener('ty-sortable-change', (e: any) => {
      for (const [id, keys] of Object.entries(e.detail.value.order as Record<string, string[]>)) {
        const c = document.getElementById(id)!
        for (const k of keys) c.appendChild(document.querySelector(`[data-key="${k}"]`)!)
      }
    })
  })
}

const ofType = (page: Page, type: string) => page.evaluate((t) => ((window as any).log as any[]).filter((e) => e.type === t), type)

async function center(page: Page, selector: string) {
  const b = (await page.locator(selector).boundingBox())!
  return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }
}

/** Press and move in steps to `to`; the button stays down. */
async function pressAndMove(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await moveTo(page, from, to)
}

async function moveTo(page: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  const steps = 10
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(Math.round(from.x + ((to.x - from.x) * i) / steps), Math.round(from.y + ((to.y - from.y) * i) / steps))
    await page.waitForTimeout(16)
  }
}

/** Nudge the pointer by a pixel back and forth while holding, so the drag keeps frames moving. */
async function holdAt(page: Page, at: { x: number; y: number }, ms: number) {
  const end = Date.now() + ms
  let flip = 0
  while (Date.now() < end) {
    await page.mouse.move(at.x, at.y + (flip ^= 1))
    await page.waitForTimeout(50)
  }
  await page.mouse.move(at.x, at.y)
}

test.describe('ty-sortable desktop', () => {
  test('auto-scroll: holding near the bottom of a ty-scroll-container scrolls it, not the page', async ({ page }) => {
    await mount(page, `
      <ty-scroll-container id="sc" max-height="300px" style="display:block;width:260px">
        <ty-sortable id="a" style="display:block;padding:4px;--ty-sortable-duration:0ms">${cards(range('i', 40))}</ty-sortable>
      </ty-scroll-container>
      <div style="height:3000px"></div>`)
    await instrument(page)
    const scroller = () => page.evaluate(() => document.getElementById('sc')!.shadowRoot!.querySelector<HTMLElement>('.scroll-wrapper')!.scrollTop)
    const box = (await page.evaluate(() => {
      const r = document.getElementById('sc')!.shadowRoot!.querySelector('.scroll-wrapper')!.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, x: r.left + r.width / 2 }
    }))
    // Items visible before the drag.
    const visible = await page.evaluate((bottom) => Array.from(document.getElementById('a')!.children).filter((c) => c.getBoundingClientRect().top < bottom).length, box.bottom)
    expect(await scroller()).toBe(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    const from = await center(page, '[data-key="i0"]')
    const edge = { x: Math.round(box.x), y: Math.round(box.bottom - 8) }
    await pressAndMove(page, from, edge)
    await holdAt(page, edge, 1200)
    const scrolled = await scroller()
    expect(scrolled).toBeGreaterThan(200)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await page.mouse.up()

    const changes = await ofType(page, 'ty-sortable-change')
    expect(changes.length).toBe(1)
    expect(changes[0].value.from.index).toBe(0)
    expect(changes[0].value.to.index).toBeGreaterThan(visible)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('in an open ty-modal: edge drag does not scroll the page; release over the backdrop keeps the modal open', async ({ page }) => {
    await mount(page, `
      <div style="height:4000px">page</div>
      <ty-modal id="m">
        <div style="width:300px;padding:16px;background:#fff;color:#111">
          <ty-sortable id="a" style="display:block;--ty-sortable-duration:0ms">${cards(range('m', 5))}</ty-sortable>
        </div>
      </ty-modal>`)
    await page.evaluate(() => window.scrollTo(0, 600))
    await instrument(page)
    await page.evaluate(() => {
      const w = window as any
      w.closes = []
      document.getElementById('m')!.addEventListener('close', (e: any) => w.closes.push(e.detail?.reason))
      document.getElementById('m')!.setAttribute('open', 'true')
    })
    await page.waitForTimeout(300) // enter animation
    const pageScroll = () => page.evaluate(() => ({ y: window.scrollY, top: document.scrollingElement!.scrollTop, body: document.body.style.top }))
    const before = await pageScroll()

    // 1) Drag down to the bottom edge of the viewport (below the modal), hold.
    const from = await center(page, '[data-key="m0"]')
    const vh = await page.evaluate(() => innerHeight)
    const bottom = { x: from.x, y: vh - 4 }
    await pressAndMove(page, from, bottom)
    await holdAt(page, bottom, 800)
    expect(await pageScroll()).toEqual(before)

    // 2) Release over the backdrop, far from the panel: a spill, not a close.
    await moveTo(page, bottom, { x: 8, y: 8 })
    await page.waitForTimeout(50)
    await page.mouse.up()
    await page.waitForTimeout(200)
    expect((await ofType(page, 'ty-sortable-cancel')).map((e) => e.reason)).toEqual(['spill'])
    expect(await ofType(page, 'ty-sortable-change')).toEqual([])
    expect(await page.evaluate(() => document.getElementById('m')!.hasAttribute('open'))).toBe(true)
    expect(await page.evaluate(() => (window as any).closes)).toEqual([])
    expect(await pageScroll()).toEqual(before)

    // Control: a plain backdrop click (after the 300ms guard) still closes it.
    await page.waitForTimeout(350)
    await page.mouse.click(8, 8)
    await expect(page.locator('#m')).not.toHaveAttribute('open', 'true')
  })

  test('horizontal kanban: dragging to the right edge scrolls the board, drop lands in an offscreen column', async ({ page }) => {
    const col = (i: number) => `<ty-sortable id="c${i}" group="k" style="display:block;flex:0 0 240px;min-height:300px;padding:4px;background:#f4f4f4;--ty-sortable-duration:0ms">${cards(range(`k${i}-`, 3))}</ty-sortable>`
    await mount(page, `
      <div id="board" style="display:flex;gap:16px;width:600px;overflow-x:auto;overflow-y:hidden">
        ${[0, 1, 2, 3, 4, 5].map(col).join('')}
      </div>`)
    await instrument(page)
    const boardBox = (await page.locator('#board').boundingBox())!
    const scrollLeft = () => page.evaluate(() => document.getElementById('board')!.scrollLeft)
    expect(await scrollLeft()).toBe(0)
    // Column 5 starts offscreen.
    expect(await page.evaluate(() => document.getElementById('c5')!.getBoundingClientRect().left)).toBeGreaterThan(boardBox.x + boardBox.width)

    const from = await center(page, '[data-key="k0-0"]')
    const edge = { x: Math.round(boardBox.x + boardBox.width - 6), y: from.y + 40 } // above k5-1's middle: slot 1
    await pressAndMove(page, from, edge)
    await holdAt(page, edge, 1500)
    const max = await page.evaluate(() => { const b = document.getElementById('board')!; return b.scrollWidth - b.clientWidth })
    const left = await scrollLeft()
    expect(left).toBeGreaterThan(0)
    expect(left).toBeGreaterThanOrEqual(max - 2)
    expect(await page.evaluate(() => window.scrollX)).toBe(0)
    await page.mouse.up()

    const changes = await ofType(page, 'ty-sortable-change')
    expect(changes.length).toBe(1)
    expect(changes[0].toContainer).toBe('c5')
    expect(changes[0].value.from.list).toBe('c0')
    expect(changes[0].value.to.list).toBe('c5')
    expect(changes[0].value.to.index).toBe(1)
    expect(changes[0].value.order.c5).toEqual(['k5-0', 'k0-0', 'k5-1', 'k5-2'])
    expect(changes[0].value.order.c0).toEqual(['k0-1', 'k0-2'])
  })

  test('accepts= refusing the item: :state(blocked) while over, drop cancels with reason blocked', async ({ page }) => {
    await mount(page, `
      <div style="display:flex;gap:40px">
        <ty-sortable id="a" group="g" style="display:block;width:220px;min-height:48px;padding:4px;--ty-sortable-duration:0ms">${cards(['x1'], 'data-kind="x"')}${cards(['y1'], 'data-kind="y"')}</ty-sortable>
        <ty-sortable id="b" group="g" accepts="[data-kind=x]" style="display:block;width:220px;min-height:48px;padding:4px;--ty-sortable-duration:0ms">${cards(['b1'], 'data-kind="x"')}</ty-sortable>
      </div>`)
    await instrument(page)
    const blocked = () => page.evaluate(() => document.getElementById('b')!.matches(':state(blocked)'))
    const over = () => page.evaluate(() => document.getElementById('b')!.matches(':state(over)'))

    const from = await center(page, '[data-key="y1"]')
    const to = await center(page, '[data-key="b1"]')
    await pressAndMove(page, from, { x: to.x, y: to.y + 12 })
    await page.waitForTimeout(50)
    expect(await blocked()).toBe(true)
    expect(await over()).toBe(false)
    await page.mouse.up()

    const cancels = await ofType(page, 'ty-sortable-cancel')
    expect(cancels.map((e) => [e.target, e.reason])).toEqual([['a', 'blocked']])
    expect(await ofType(page, 'ty-sortable-change')).toEqual([])
    expect(await blocked()).toBe(false)

    // The accepted kind does go in.
    const fromX = await center(page, '[data-key="x1"]')
    await pressAndMove(page, fromX, { x: to.x, y: to.y + 12 })
    await page.waitForTimeout(50)
    expect(await blocked()).toBe(false)
    expect(await over()).toBe(true)
    await page.mouse.up()
    expect((await ofType(page, 'ty-sortable-change')).map((e) => e.toContainer)).toEqual(['b'])
  })
})
