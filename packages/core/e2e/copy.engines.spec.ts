import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

// One copy and one copy-success per activation, on every engine. WebKit's
// writeText resolves between the click's listeners, and the success icon swap
// detached the clicked <svg> — so the field's click-to-copy listener copied a
// second time on every click or tap on the icon. Real clipboard, real input.

async function watchCopies(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    w.__copies = 0
    document.addEventListener('copy-success', () => w.__copies++)
  })
}
const copies = (page: Page) => page.evaluate(() => (window as any).__copies as number)

for (const tag of ['ty-copy', 'ty-copy-field']) {
  test(`${tag}: a click or tap on the copy icon copies once`, async ({ page, isMobile }) => {
    await mount(page, `<${tag} id="c" value="secret-42"></${tag}>`)
    await watchCopies(page)
    const box = (await page.locator('#c .copy-button svg').boundingBox())!
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2]
    if (isMobile) await page.touchscreen.tap(x, y)
    else await page.mouse.click(x, y)
    await page.waitForTimeout(300)
    expect(await copies(page)).toBe(1)
  })
}

test('ty-copy: Enter and Space on the copy button copy once each', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard')
  await mount(page, `<ty-copy id="c" value="secret-42"></ty-copy>`)
  await watchCopies(page)
  await page.locator('#c .copy-button').focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  expect(await copies(page)).toBe(1)
  await page.keyboard.press(' ')
  await page.waitForTimeout(300)
  expect(await copies(page)).toBe(2)
})
