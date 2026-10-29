import { test, expect, Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * ty-sortable under framework list rendering: Vue 3 (v-for :key) and
 * Svelte 5 ({#each ... (key)}), both re-rendering keyed children from
 * e.detail.value.order. ty-sortable never moves light-DOM nodes itself, so
 * these check that a framework's keyed reconciliation is what lands the
 * drop, that the hold reads it as 'accepted', and that nothing is duplicated
 * or lost.
 *
 * Pages are served by page.route on the webServer origin so /dist/tyrell.js
 * loads from it; the frameworks come from CDNs (needs network).
 */

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const VUE = 'https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.esm-browser.prod.js'
const SVELTE = 'https://esm.sh/svelte@5.20.0'

type Lists = Record<string, string[]>

const SAME: Lists = { a: ['1', '2', '3', '4'] }
const PAIR: Lists = { left: ['l1', 'l2', 'l3'], right: ['r1', 'r2', 'r3'] }

const CSS = `
  body { margin: 0; padding: 24px; font-family: sans-serif; }
  .lists { display: flex; gap: 32px; align-items: flex-start; }
  ty-sortable { display: block; width: 200px; min-height: 60px; --ty-sortable-duration: 0ms; }
  .card { height: 48px; margin: 0 0 8px; background: #ddd; display: flex; align-items: center; padding: 0 12px; }
`

/** Shared page bootstrap: event log and a hook to apply orders sync or after 300ms. */
const BOOT = `
  window.log = { changes: [], settles: [], cancels: [] }
  document.addEventListener('ty-sortable-change', (e) => log.changes.push(e.detail.value), true)
  document.addEventListener('ty-sortable-settle', (e) => log.settles.push(e.detail.outcome), true)
  document.addEventListener('ty-sortable-cancel', (e) => log.cancels.push(e.detail.reason), true)
  document.addEventListener('ty-sortable-start', (e) => (log.starts = (log.starts || 0) + 1), true)
  const params = new URLSearchParams(location.search)
  window.INIT = JSON.parse(params.get('lists'))
  window.ASYNC = params.get('async') === '1'
  window.GROUP = Object.keys(INIT).length > 1 ? 'g' : null
  if (params.get('motion') === '1') document.head.insertAdjacentHTML('beforeend', '<style>ty-sortable { --ty-sortable-duration: 200ms }</style>')
`

function page(name: string, head: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="/dist/tyrell.css">
    ${head}
    <style>${CSS}</style>
    <script src="/dist/tyrell.js"></script>
    </head><body><div id="app"></div>
    <script>${BOOT}</script>
    ${body}
    </body></html>`
}

const VUE_PAGE = page('vue', '', `<script type="module">
  import { createApp, reactive } from '${VUE}'
  const app = createApp({
    setup() {
      const ids = Object.keys(INIT)
      const lists = reactive(Object.fromEntries(ids.map((id) => [id, INIT[id].map((k) => ({ id: k, label: 'Item ' + k }))])))
      const byKey = Object.fromEntries(ids.flatMap((id) => lists[id].map((it) => [it.id, it])))
      function onChange(e) {
        const order = e.detail.value.order
        const apply = () => { for (const id in order) lists[id] = order[id].map((k) => byKey[k]) }
        ASYNC ? setTimeout(apply, 300) : apply()
      }
      return { ids, lists, onChange, group: GROUP }
    },
    template: \`<div class="lists">
      <ty-sortable v-for="id in ids" :key="id" :id="id" :group="group" @ty-sortable-change="onChange">
        <div v-for="item in lists[id]" :key="item.id" :data-key="item.id" class="card">{{ item.label }}</div>
      </ty-sortable>
    </div>\`,
  })
  app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ty-')
  app.mount('#app')
  window.ready = true
</script>`)

/** Svelte 5 runes mode: event attribute `onty-sortable-change`. */
const SVELTE_RUNES = `<script>
  let { init, isAsync, group } = $props()
  const ids = Object.keys(init)
  let lists = $state(Object.fromEntries(ids.map((id) => [id, init[id].map((k) => ({ id: k, label: 'Item ' + k }))])))
  function onChange(e) {
    const order = e.detail.value.order
    const apply = () => {
      const byKey = Object.fromEntries(ids.flatMap((id) => lists[id].map((it) => [it.id, it])))
      for (const id in order) lists[id] = order[id].map((k) => byKey[k])
    }
    isAsync ? setTimeout(apply, 300) : apply()
  }
</script>
<div class="lists">
  {#each ids as id (id)}
    <ty-sortable {id} {group} onty-sortable-change={onChange}>
      {#each lists[id] as item (item.id)}
        <div class="card" data-key={item.id}>{item.label}</div>
      {/each}
    </ty-sortable>
  {/each}
</div>`

/** Svelte 5 legacy (non-runes) mode: directive `on:ty-sortable-change`. */
const SVELTE_LEGACY = `<script>
  export let init
  export let isAsync
  export let group
  const ids = Object.keys(init)
  let lists = Object.fromEntries(ids.map((id) => [id, init[id].map((k) => ({ id: k, label: 'Item ' + k }))]))
  function onChange(e) {
    const order = e.detail.value.order
    const apply = () => {
      const byKey = Object.fromEntries(ids.flatMap((id) => lists[id].map((it) => [it.id, it])))
      const next = { ...lists }
      for (const id in order) next[id] = order[id].map((k) => byKey[k])
      lists = next
    }
    isAsync ? setTimeout(apply, 300) : apply()
  }
</script>
<div class="lists">
  {#each ids as id (id)}
    <ty-sortable {id} {group} on:ty-sortable-change={onChange}>
      {#each lists[id] as item (item.id)}
        <div class="card" data-key={item.id}>{item.label}</div>
      {/each}
    </ty-sortable>
  {/each}
</div>`

const SVELTE_PAGE = page('svelte', `<script type="importmap">${JSON.stringify({
  imports: { svelte: SVELTE, 'svelte/': `${SVELTE}/` },
})}</script>`, `<script type="module">
  import { compile } from 'svelte/compiler'
  import { mount } from 'svelte'
  const runes = new URLSearchParams(location.search).get('mode') !== 'legacy'
  const source = ${JSON.stringify({ runes: SVELTE_RUNES, legacy: SVELTE_LEGACY }).replace(/<\/script/g, '<\\/script')}[runes ? 'runes' : 'legacy']
  const { js } = compile(source, { generate: 'client', runes, name: 'App', filename: 'App.svelte' })
  const url = URL.createObjectURL(new Blob([js.code], { type: 'text/javascript' }))
  const App = (await import(url)).default
  mount(App, { target: document.getElementById('app'), props: { init: INIT, isAsync: ASYNC, group: GROUP } })
  window.ready = true
</script>`)

async function open(p: Page, html: string, lists: Lists, query: Record<string, string> = {}) {
  await p.route('**/e2e/__fw.html*', (r) => r.fulfill({ contentType: 'text/html', body: html }))
  // The built bundle straight from disk: the shared http-server on 4173 may
  // belong to a concurrent Playwright run and go away mid-test.
  for (const f of ['tyrell.js', 'tyrell.css']) {
    await p.route(`**/dist/${f}`, (r) => r.fulfill({ path: path.join(DIST, f) }))
  }
  const qs = new URLSearchParams({ lists: JSON.stringify(lists), ...query })
  const errors: string[] = []
  p.on('pageerror', (e) => errors.push(String(e)))
  await p.goto(`/e2e/__fw.html?${qs}`)
  await p.waitForFunction(() => (window as any).ready === true, null, { timeout: 20000 }).catch((e) => {
    throw new Error(`framework page did not boot: ${errors.join('; ') || e}`)
  })
  expect(await p.evaluate(() => !!customElements.get('ty-sortable')), 'ty-sortable defined (dist/tyrell.js loaded)').toBe(true)
  // Rendered and upgraded.
  const total = Object.values(lists).flat().length
  await expect(p.locator('ty-sortable > [data-key]')).toHaveCount(total)
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  return errors
}

async function center(p: Page, sel: string) {
  const b = (await p.locator(sel).boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, top: b.y, bottom: b.y + b.height }
}

async function drag(p: Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  await p.mouse.move(from.x, from.y)
  await p.mouse.down()
  const steps = 12
  for (let i = 1; i <= steps; i++) {
    await p.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps)
    await p.waitForTimeout(16)
  }
  await p.waitForTimeout(50)
  await p.mouse.up()
}

/** Drag item `key` to just below the middle of `belowKey` (slot after it). */
async function dragAfter(p: Page, key: string, belowKey: string) {
  const from = await center(p, `[data-key="${key}"]`)
  const to = await center(p, `[data-key="${belowKey}"]`)
  await drag(p, from, { x: to.x, y: to.y + 12 })
}

/** Drag item `key` to the top edge of `aboveKey` (slot before it). */
async function dragBefore(p: Page, key: string, aboveKey: string) {
  const from = await center(p, `[data-key="${key}"]`)
  const to = await center(p, `[data-key="${aboveKey}"]`)
  await drag(p, from, { x: to.x, y: to.top + 6 })
}

const order = (p: Page, id: string) => p.$$eval(`#${id} > [data-key]`, (els) => els.map((e) => e.getAttribute('data-key')))

async function settles(p: Page, n: number) {
  await p.waitForFunction((n) => (window as any).log.settles.length >= n, n, { timeout: 6000 }).catch(async () => {
    const state = await p.evaluate(() => ({
      log: (window as any).log,
      defined: !!customElements.get('ty-sortable'),
      tyrell: typeof (window as any).tyrell,
      lists: [...document.querySelectorAll('ty-sortable')].map((c) => [c.id, [...c.children].map((e) => e.getAttribute('data-key') + '@' + Math.round(e.getBoundingClientRect().top))]),
    }))
    throw new Error(`waited for ${n} settle(s): ${JSON.stringify(state)}`)
  })
  return p.evaluate(() => (window as any).log.settles as string[])
}

/** Every key exactly once in the document, no leftover drag layer. */
async function assertIntact(p: Page, lists: Lists) {
  const keys = Object.values(lists).flat()
  const counts = await p.evaluate((keys) => keys.map((k) => document.querySelectorAll(`[data-key="${k}"]`).length), keys)
  expect(counts).toEqual(keys.map(() => 1))
  expect(await p.locator('ty-sortable > [data-key]').count()).toBe(keys.length)
  expect(await p.locator('[data-ty-sortable-layer]').count()).toBe(0)
}

/** Tag item nodes so a later check can tell moved nodes from re-created ones. */
const tagNodes = (p: Page) => p.evaluate(() => document.querySelectorAll('ty-sortable > [data-key]').forEach((e: any) => (e.__tag = e.getAttribute('data-key'))))
const untagged = (p: Page) => p.$$eval('ty-sortable > [data-key]', (els) => els.filter((e: any) => e.__tag !== e.getAttribute('data-key')).map((e) => e.getAttribute('data-key')))

const FRAMEWORKS: { name: string; html: string; query?: Record<string, string> }[] = [
  { name: 'Vue 3', html: VUE_PAGE },
  { name: 'Svelte 5 runes (onty-sortable-change)', html: SVELTE_PAGE, query: { mode: 'runes' } },
  { name: 'Svelte 5 legacy (on:ty-sortable-change)', html: SVELTE_PAGE, query: { mode: 'legacy' } },
]

for (const fw of FRAMEWORKS) {
  test.describe(`ty-sortable + ${fw.name}`, () => {
    test('same list: drop renders, accepted, second drag right after works', async ({ page }) => {
      const errors = await open(page, fw.html, SAME, fw.query)
      await tagNodes(page)

      await dragAfter(page, '1', '3')
      expect(await settles(page, 1)).toEqual(['accepted'])
      expect(await order(page, 'a')).toEqual(['2', '3', '1', '4'])
      const v = await page.evaluate(() => (window as any).log.changes[0])
      expect(v.key).toBe('1')
      expect(v.from.index).toBe(0)
      expect(v.to.index).toBe(2)
      expect(v.order).toEqual({ a: ['2', '3', '1', '4'] })
      await assertIntact(page, SAME)
      // Keyed reconciliation moved the nodes rather than re-creating them.
      expect(await untagged(page)).toEqual([])

      // Right after the settle, no wait.
      await dragBefore(page, '4', '2')
      expect(await settles(page, 2)).toEqual(['accepted', 'accepted'])
      expect(await order(page, 'a')).toEqual(['4', '2', '3', '1'])
      await assertIntact(page, SAME)
      expect(await page.evaluate(() => (window as any).log.cancels)).toEqual([])
      expect(errors).toEqual([])
    })

    test('two lists in a group: cross-list drop renders, accepted, second drag back works', async ({ page }) => {
      const errors = await open(page, fw.html, PAIR, fw.query)

      await dragAfter(page, 'l1', 'r1')
      expect(await settles(page, 1)).toEqual(['accepted'])
      expect(await order(page, 'left')).toEqual(['l2', 'l3'])
      expect(await order(page, 'right')).toEqual(['r1', 'l1', 'r2', 'r3'])
      const v = await page.evaluate(() => (window as any).log.changes[0])
      expect(v.group).toBe('g')
      expect(v.from.list).toBe('left')
      expect(v.to.list).toBe('right')
      expect(v.order).toEqual({ left: ['l2', 'l3'], right: ['r1', 'l1', 'r2', 'r3'] })
      await assertIntact(page, PAIR)

      // Back the other way, immediately.
      await dragBefore(page, 'r3', 'l2')
      expect(await settles(page, 2)).toEqual(['accepted', 'accepted'])
      expect(await order(page, 'left')).toEqual(['r3', 'l2', 'l3'])
      expect(await order(page, 'right')).toEqual(['r1', 'l1', 'r2'])
      await assertIntact(page, PAIR)
      expect(errors).toEqual([])
    })

    test('with 200ms motion: a second drag during the landing animation still works', async ({ page }) => {
      const errors = await open(page, fw.html, PAIR, { ...fw.query, motion: '1' })
      await dragAfter(page, 'l1', 'r2')
      expect(await settles(page, 1)).toEqual(['accepted'])
      // Straight away: the landed item may still be FLIP-animating.
      await dragBefore(page, 'r1', 'l2')
      expect(await settles(page, 2)).toEqual(['accepted', 'accepted'])
      expect(await order(page, 'left')).toEqual(['r1', 'l2', 'l3'])
      expect(await order(page, 'right')).toEqual(['r2', 'l1', 'r3'])
      await assertIntact(page, PAIR)
      expect(errors).toEqual([])
    })

    test('async apply (300ms later) still settles accepted, same list and cross-list', async ({ page }) => {
      const errors = await open(page, fw.html, PAIR, { ...fw.query, async: '1' })

      await dragAfter(page, 'l1', 'l3')
      // During the hold the DOM is unchanged: nothing has rendered yet.
      expect(await order(page, 'left')).toEqual(['l1', 'l2', 'l3'])
      expect(await settles(page, 1)).toEqual(['accepted'])
      expect(await order(page, 'left')).toEqual(['l2', 'l3', 'l1'])
      await assertIntact(page, PAIR)

      await dragAfter(page, 'r2', 'l2')
      expect(await settles(page, 2)).toEqual(['accepted', 'accepted'])
      expect(await order(page, 'left')).toEqual(['l2', 'r2', 'l3', 'l1'])
      expect(await order(page, 'right')).toEqual(['r1', 'r3'])
      await assertIntact(page, PAIR)
      expect(errors).toEqual([])
    })
  })
}
