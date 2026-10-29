import { test, expect, Page } from '@playwright/test'
import { spawn, ChildProcess } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * ty-sortable against REAL Datastar (SSE patch-elements morph) and REAL htmx 2
 * + idiomorph, loaded from jsdelivr, talking to e2e/sortable-hypermedia.mjs.
 * The server owns the board and refuses moves into "locked" by re-sending the
 * unchanged board. ty-sortable never touches the light DOM, so every order
 * seen here was rendered by the library from the server's HTML.
 */

const PORT = 4175
const BASE = `http://127.0.0.1:${PORT}`
let server: ChildProcess | null = null

// One board on the server: run in order in one worker, but don't skip after a failure.
test.describe.configure({ mode: 'default' })

test.beforeAll(async () => {
  server = spawn(process.execPath, [resolve(dirname(fileURLToPath(import.meta.url)), 'sortable-hypermedia.mjs')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  await new Promise<void>((ok, fail) => {
    const t = setTimeout(() => fail(new Error('server did not start')), 10000)
    server!.stdout!.on('data', (d) => {
      if (String(d).includes(String(PORT))) {
        clearTimeout(t)
        ok()
      }
    })
    server!.on('exit', (code) => fail(new Error(`server exited ${code}`)))
  })
})

test.afterAll(() => {
  server?.kill()
  server = null
})

async function open(page: Page, path: string) {
  await fetch(`${BASE}/reset`, { method: 'POST' })
  // networkidle: the CDN scripts (Datastar is an ES module) have loaded.
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  if (path.startsWith('/hx')) await page.waitForFunction(() => (window as any).htmx && (window as any).Idiomorph)
  await page.evaluate(() => {
    ;(window as any).settles = []
    ;(window as any).changes = []
    document.addEventListener('ty-sortable-settle', (e: any) => (window as any).settles.push(e.detail.outcome), true)
    document.addEventListener('ty-sortable-change', (e: any) => (window as any).changes.push(e.detail.value), true)
  })
}

const order = (page: Page, list: string) =>
  page.evaluate((l) => [...document.querySelectorAll(`#${l} > [data-key]`)].map((e) => (e as HTMLElement).dataset.key), list)

async function center(page: Page, sel: string) {
  const b = (await page.locator(sel).boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

/** Mouse drag from a card's centre to a point, in steps. */
async function drag(page: Page, from: string, to: { x: number; y: number }) {
  const a = await center(page, from)
  await page.mouse.move(a.x, a.y)
  await page.mouse.down()
  const steps = 12
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(a.x + ((to.x - a.x) * i) / steps, a.y + ((to.y - a.y) * i) / steps)
    await page.waitForTimeout(16)
  }
  await page.waitForTimeout(50)
  await page.mouse.up()
}

async function settled(page: Page): Promise<string> {
  await page.waitForFunction(() => (window as any).settles.length > 0, null, { timeout: 8000 })
  return page.evaluate(() => (window as any).settles[0])
}

const below = async (page: Page, sel: string) => {
  const b = (await page.locator(sel).boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height - 4 }
}

const VARIANTS = [
  { name: 'Datastar', path: '/ds' },
  { name: 'htmx + idiomorph', path: '/hx' },
  { name: 'htmx + idiomorph, swap:150ms', path: '/hx?delay=150' },
  // The snippets on the docs page (site/docs/sortable.cljs), attribute for attribute.
  { name: 'Datastar, docs snippet', path: '/ds?v=docs' },
  { name: 'htmx, docs snippet', path: '/hx?v=docs' },
]

for (const v of VARIANTS) {
  test.describe(v.name, () => {
    test('accepted reorder: server renders the new order', async ({ page }) => {
      await open(page, v.path)
      expect(await order(page, 'todo')).toEqual(['a', 'b', 'c'])
      await drag(page, '#card-a', await below(page, '#card-c'))
      expect(await settled(page)).toBe('accepted')
      expect(await order(page, 'todo')).toEqual(['b', 'c', 'a'])
      expect((await (await fetch(`${BASE}/state`)).json()).todo).toEqual(['b', 'c', 'a'])
      const changes = await page.evaluate(() => (window as any).changes)
      expect(changes.length).toBe(1)
      expect(changes[0]).toMatchObject({ key: 'a', from: { list: 'todo', index: 0 }, to: { list: 'todo', index: 2 } })
    })

    test('cross-list move: both lists re-rendered', async ({ page }) => {
      await open(page, v.path)
      const d = (await page.locator('#card-d').boundingBox())!
      await drag(page, '#card-a', { x: d.x + d.width / 2, y: d.y + d.height - 4 })
      expect(await settled(page)).toBe('accepted')
      expect(await order(page, 'todo')).toEqual(['b', 'c'])
      expect(await order(page, 'done')).toEqual(['d', 'a', 'e'])
    })

    test('rejected move: server re-sends the same board, item snaps back', async ({ page }) => {
      await open(page, v.path)
      await drag(page, '#card-a', await below(page, '#card-z'))
      expect(await settled(page)).toBe('rejected')
      expect(await order(page, 'todo')).toEqual(['a', 'b', 'c'])
      expect(await order(page, 'locked')).toEqual(['z'])
      expect(await page.evaluate(() => (window as any).changes.length)).toBe(1)
      // The board stays usable after a rejection.
      await page.evaluate(() => ((window as any).settles = []))
      await drag(page, '#card-a', await below(page, '#card-b'))
      expect(await settled(page)).toBe('accepted')
      expect(await order(page, 'todo')).toEqual(['b', 'a', 'c'])
    })
  })
}

// A swap delay longer than ty-sortable's idle grace (2 frames + 250ms, IDLE_GRACE
// in src/components/sortable.ts) is misread: htmx drops htmx-request when the
// response arrives, BEFORE the delayed swap, so the hold sees "request over,
// order unchanged" and settles 'rejected' (the item snaps back), then the swap
// lands with the new order. Observed: outcome 'rejected', DOM [b, c, a].
test('htmx swap:400ms (longer than the idle grace) still settles accepted', async ({ page }) => {
  await open(page, '/hx?delay=400')
  await drag(page, '#card-a', await below(page, '#card-c'))
  expect(await settled(page)).toBe('accepted')
  expect(await order(page, 'todo')).toEqual(['b', 'c', 'a'])
})
