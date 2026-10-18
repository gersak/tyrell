import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * `no-backdrop` is a modal without the dim: shown with showModal() like any
 * ty-modal, only its ::backdrop is transparent. The page behind is inert, a
 * click anywhere outside (or Escape) closes it, Tab stays inside, the page
 * doesn't zoom. And the scroll lock holds for a page that scrolls its own
 * container (an app shell with an inner overflow: auto div), with or without
 * the backdrop, while scrollers inside the modal keep working.
 */

const SHELL = (modal: string) => `
  <style>
    html, body { height: 100%; margin: 0; padding: 0; }
    body { overflow: hidden; }
    #shell { display: flex; height: 100vh; }
    #scroller { flex: 1; overflow-y: auto; }
    .box { width: 260px; padding: 16px; background: #fff; color: #111; }
  </style>
  <div id="shell"><div id="scroller">
    <button id="behind">behind</button>
    <div style="height: 4000px;">tall page</div>
    ${modal}
    <button id="after">after</button>
  </div></div>
  <pre id="log"></pre>`

const MODAL = (attrs: string, inner = '') => `
  <ty-modal id="m" ${attrs}>
    <div class="box">
      <button id="in1">one</button><button id="in2">two</button>
      <div id="content" tabindex="0" style="height: 120px; overflow: auto;"><div style="height: 1000px;">long content</div></div>
      ${inner}
    </div>
  </ty-modal>`

async function open(page: Page, id = 'm') {
  await page.evaluate((id) => {
    const m = document.getElementById(id) as any
    const log = document.getElementById('log')!
    m.addEventListener('close', (e: any) => { log.textContent += `${id}:${e.detail?.reason};` })
    m.setAttribute('open', '')
  }, id)
  await page.waitForTimeout(300) // past the enter animation
}

const isOpen = (page: Page, id = 'm') => page.evaluate((id) => document.getElementById(id)!.hasAttribute('open'), id)
const log = (page: Page) => page.evaluate(() => document.getElementById('log')!.textContent)
const scrollTop = (page: Page, sel = '#scroller') => page.evaluate((s) => Math.round(document.querySelector(s)!.scrollTop), sel)
const blurAll = (page: Page) => page.evaluate(() => {
  let a: any = document.activeElement
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
  a?.blur?.()
})

for (const attrs of ['no-backdrop', 'no-backdrop prevent-outside-click']) {
  test(`${attrs}: a click anywhere outside ${attrs.includes('prevent') ? 'is ignored' : 'closes it'}, the page behind is never clicked`, async ({ page }) => {
    await mount(page, SHELL(MODAL(attrs)))
    await page.evaluate(() => {
      (window as any).clicks = 0
      document.getElementById('behind')!.addEventListener('click', () => (window as any).clicks++)
    })
    await open(page)
    const box = (await page.locator('#behind').boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => (window as any).clicks), 'page behind not clickable').toBe(0)
    if (attrs.includes('prevent')) {
      expect(await isOpen(page)).toBe(true)
      expect(await log(page)).toBe('')
    } else {
      expect(await isOpen(page)).toBe(false)
      expect(await log(page)).toBe('m:backdrop;')
    }
  })
}

test('no-backdrop: a modal — no dim, no zoom, the page inert', async ({ page }) => {
  await mount(page, SHELL(MODAL('no-backdrop')))
  await open(page)
  expect(await page.evaluate(() => {
    const d = document.getElementById('m')!.shadowRoot!.querySelector('dialog')!
    const b = getComputedStyle(d, '::backdrop')
    return {
      modal: d.matches(':modal'),
      backdrop: b.backgroundColor,
      filter: b.backdropFilter === 'none' || !b.backdropFilter,
      zoom: document.documentElement.classList.contains('ty-modal-zoom'),
    }
  })).toEqual({ modal: true, backdrop: 'rgba(0, 0, 0, 0)', filter: true, zoom: false })
})

test('no-backdrop: Tab stays inside the modal', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit Tab skips buttons by default (macOS full keyboard access)')
  await mount(page, SHELL(MODAL('no-backdrop')))
  await open(page)
  await page.locator('#in1').focus()
  const outside: string[] = []
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab')
    const id = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName)
    if (id === 'behind' || id === 'after') outside.push(id)
  }
  expect(outside).toEqual([])
})

for (const attrs of ['no-backdrop', '']) {
  test(`Escape closes with focus on the body${attrs ? ` (${attrs})` : ''}`, async ({ page }) => {
    await mount(page, SHELL(MODAL(attrs)))
    await open(page)
    await blurAll(page)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    expect(await isOpen(page)).toBe(false)
    expect(await log(page)).toBe('m:escape;')
  })

  test(`prevent-escape holds with focus on the body${attrs ? ` (${attrs})` : ''}`, async ({ page }) => {
    await mount(page, SHELL(MODAL(`${attrs} prevent-escape`)))
    await open(page)
    await blurAll(page)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    expect(await isOpen(page)).toBe(true)
    expect(await log(page)).toBe('')
  })
}

test('nested: the inner modal closes first, by outside click and by Escape', async ({ page }) => {
  for (const [outer, inner] of [['no-backdrop', ''], ['', 'no-backdrop'], ['no-backdrop', 'no-backdrop']]) {
    await mount(page, SHELL(MODAL(outer, `<ty-modal id="n" ${inner}><div class="box"><button id="nb">inner</button></div></ty-modal>`)))
    await open(page)
    await open(page, 'n')
    await page.mouse.click(8, 8)
    await page.waitForTimeout(150)
    expect([await isOpen(page), await isOpen(page, 'n')], `click: ${outer}/${inner}`).toEqual([true, false])
    await open(page, 'n')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    expect([await isOpen(page), await isOpen(page, 'n')], `Escape: ${outer}/${inner}`).toEqual([true, false])
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    expect(await isOpen(page), `then the outer: ${outer}/${inner}`).toBe(false)
  }
})

for (const attrs of ['', 'no-backdrop']) {
  test(`an app scroll container doesn't scroll while a modal is open${attrs ? ` (${attrs})` : ''}, and does after`, async ({ page, isMobile }) => {
    await mount(page, SHELL(MODAL(attrs)))
    await page.locator('#behind').click() // the page's last-clicked scroller, as a user leaves it
    await open(page)
    // over the page (backdrop), over the panel, and keys from inside and from the body
    await page.mouse.move(8, 300)
    await page.mouse.wheel(0, 800)
    const panel = (await page.locator('#in1').boundingBox())!
    await page.mouse.move(panel.x + 4, panel.y + 4)
    await page.mouse.wheel(0, 800)
    await page.waitForTimeout(250)
    expect(await scrollTop(page), 'wheel').toBe(0)
    await page.locator('#in1').focus()
    for (const key of ['End', 'PageDown', 'Space', 'ArrowDown']) await page.keyboard.press(key)
    await blurAll(page)
    for (const key of ['End', 'PageDown', 'Space', 'ArrowDown']) await page.keyboard.press(key)
    await page.waitForTimeout(400)
    expect(await scrollTop(page), 'keys').toBe(0)
    expect(await isOpen(page)).toBe(true)

    await page.evaluate(() => (document.getElementById('m') as any).hide({ force: true }))
    await page.waitForTimeout(100)
    if (!isMobile) {
      await page.mouse.move(400, 300)
      await page.mouse.wheel(0, 600)
      await expect.poll(() => scrollTop(page), { message: 'scrolls again after close' }).toBeGreaterThan(0)
    } else {
      await page.evaluate(() => document.getElementById('scroller')!.scrollBy(0, 600))
      expect(await scrollTop(page)).toBeGreaterThan(0)
    }
  })
}

test('scrollers inside the modal keep working: wheel, keys, ty-scroll-container, textarea', async ({ page }) => {
  await mount(page, SHELL(MODAL('no-backdrop', `
    <ty-scroll-container id="tsc" max-height="100px"><div style="height: 800px;">scroll container</div></ty-scroll-container>
    <textarea id="ta" rows="3">${'line\n'.repeat(60)}</textarea>`)))
  await open(page)
  const wheelOver = async (sel: string) => {
    const b = (await page.locator(sel).boundingBox())!
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.mouse.wheel(0, 300)
  }
  await wheelOver('#content')
  await wheelOver('#tsc')
  await wheelOver('#ta')
  await page.waitForTimeout(300)
  const inner = () => page.evaluate(() => ({
    content: document.getElementById('content')!.scrollTop > 0,
    tsc: document.getElementById('tsc')!.shadowRoot!.querySelector('.scroll-wrapper')!.scrollTop > 0,
    ta: document.getElementById('ta')!.scrollTop > 0,
  }))
  expect(await inner()).toEqual({ content: true, tsc: true, ta: true })

  await page.evaluate(() => { document.getElementById('content')!.scrollTop = 0 })
  await page.locator('#content').focus()
  await page.keyboard.press('End')
  await expect.poll(() => page.evaluate(() => document.getElementById('content')!.scrollTop), { message: 'End in a focused scroller' }).toBeGreaterThan(0)
  // past the inner scroller's end nothing chains out to the page
  await wheelOver('#content')
  await page.keyboard.press('End')
  await page.waitForTimeout(300)
  expect(await scrollTop(page)).toBe(0)
})
