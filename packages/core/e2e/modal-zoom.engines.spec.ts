import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * The page zoom behind a ty-modal scales <body>, and a scaled <body> is the
 * containing block of the position: fixed boxes inside it. Every ty-modal is
 * in the top layer and escapes that. A no-backdrop modal never zooms (no dim
 * to go with it); a backdrop modal zooms wherever it is nested.
 */

const TALL = `<div style="height: 3000px;">tall page</div>`
const BOX = (text: string) => `<div style="width: 240px; height: 120px; background: #fff; color: #111;">${text}`

/** Content box of modal `id`, in the viewport, with the page scroll and zoom. */
const place = (page: Page, id: string) =>
  page.evaluate((id) => {
    const r = document.getElementById(id)!.shadowRoot!.querySelector('.modal-content')!.getBoundingClientRect()
    return {
      inView: r.top >= 0 && r.bottom <= innerHeight,
      scrollY: Math.round(scrollY),
      zoom: document.documentElement.classList.contains('ty-modal-zoom'),
    }
  }, id)

const open = async (page: Page, id: string) => {
  await page.evaluate((id) => document.getElementById(id)!.setAttribute('open', ''), id)
  // past the 200ms enter animation
  await page.waitForTimeout(300)
}

test('a no-backdrop modal on a long page opens in view, the page stays still', async ({ page }) => {
  await mount(page, `${TALL}<ty-modal id="m" no-backdrop>${BOX('no backdrop')}</div></ty-modal>`)
  await open(page, 'm')
  expect(await place(page, 'm')).toEqual({ inView: true, scrollY: 0, zoom: false })
})

test('a backdrop modal on a long page zooms the page and opens in view', async ({ page }) => {
  await mount(page, `${TALL}<ty-modal id="m">${BOX('backdrop')}</div></ty-modal>`)
  await open(page, 'm')
  expect(await place(page, 'm')).toEqual({ inView: true, scrollY: 0, zoom: true })
})

test('a no-backdrop modal inside a backdrop one: both in view, zoomed', async ({ page }) => {
  await mount(page, `${TALL}<ty-modal id="m">${BOX('outer')}<ty-modal id="n" no-backdrop>${BOX('inner')}</div></ty-modal></div></ty-modal>`)
  await open(page, 'm')
  await open(page, 'n')
  expect(await place(page, 'm')).toEqual({ inView: true, scrollY: 0, zoom: true })
  expect(await place(page, 'n')).toEqual({ inView: true, scrollY: 0, zoom: true })
})

test('a backdrop modal inside a no-backdrop one: both in view, zoomed', async ({ page }) => {
  await mount(page, `${TALL}<ty-modal id="m" no-backdrop>${BOX('outer')}<ty-modal id="n">${BOX('inner')}</div></ty-modal></div></ty-modal>`)
  await open(page, 'm')
  await open(page, 'n')
  expect(await place(page, 'm')).toEqual({ inView: true, scrollY: 0, zoom: true })
  expect(await place(page, 'n')).toEqual({ inView: true, scrollY: 0, zoom: true })
})

// A confirm handing over to a panel in one click, while the zoom animates out.
test('a no-backdrop modal opened as a backdrop one closes: in view, the page stays still', async ({ page, isMobile }) => {
  await mount(page, `${TALL}<ty-modal id="m">${BOX('confirm')}<button id="go">next</button></div></ty-modal><ty-modal id="n" no-backdrop>${BOX('panel')}</div></ty-modal>`)
  await page.evaluate(() => document.getElementById('go')!.addEventListener('click', () => {
    (document.getElementById('m') as any).hide()
    document.getElementById('n')!.setAttribute('open', '')
  }))
  await open(page, 'm')
  if (isMobile) await page.tap('#go')
  else await page.click('#go')
  await page.waitForTimeout(400)
  expect(await place(page, 'n')).toEqual({ inView: true, scrollY: 0, zoom: false })
})
