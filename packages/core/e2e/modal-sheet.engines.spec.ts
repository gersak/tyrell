import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * `sheet` makes the modal full screen below 768px: the dialog covers the
 * viewport, the panel fills it whatever width it set itself, and the close
 * button sits on the panel. Wider screens keep the centered dialog.
 */

const PANEL = `<div id="p" style="width: 240px; height: 120px; border-radius: 16px; background: #fff; color: #111;">panel</div>`

const open = async (page: Page) => {
  await page.evaluate(() => document.getElementById('m')!.setAttribute('open', ''))
  // past the 200ms enter animation
  await page.waitForTimeout(300)
}

const boxes = (page: Page) =>
  page.evaluate(() => {
    const m = document.getElementById('m')!
    const round = (r: DOMRect) => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) })
    return {
      view: { w: innerWidth, h: innerHeight },
      dialog: round(m.shadowRoot!.querySelector('dialog')!.getBoundingClientRect()),
      panel: round(document.getElementById('p')!.getBoundingClientRect()),
      close: round(m.shadowRoot!.querySelector('.close-button')!.getBoundingClientRect()),
    }
  })

test('sheet on a phone: full screen, panel fills it, close button on it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, `<ty-modal id="m" sheet>${PANEL}</ty-modal>`)
  await open(page)
  const b = await boxes(page)
  expect(b.dialog).toEqual({ x: 0, y: 0, w: 390, h: 844 })
  expect(b.panel).toEqual({ x: 0, y: 0, w: 390, h: 844 })
  expect(b.close.x + b.close.w).toBeLessThanOrEqual(390)
  expect(b.close.y).toBeGreaterThanOrEqual(0)
})

test('sheet on a wide screen: the centered dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await mount(page, `<ty-modal id="m" sheet>${PANEL}</ty-modal>`)
  await open(page)
  const b = await boxes(page)
  expect(b.panel.w).toBe(240)
  // centered (WebKit's scrollbar shifts the center a little)
  expect(Math.abs(b.panel.x + 120 - 512)).toBeLessThanOrEqual(10)
})

test('sheet="false" on a phone: the centered dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mount(page, `<ty-modal id="m" sheet="false">${PANEL}</ty-modal>`)
  await open(page)
  expect((await boxes(page)).panel.w).toBe(240)
})

test('sheet up to 768px: a small tablet gets it too, without the panel border', async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 1000 })
  await mount(page, `<ty-modal id="m" sheet><div id="p" style="width: 240px; border: 1px solid red;">panel</div></ty-modal>`)
  await open(page)
  const b = await boxes(page)
  expect(b.panel.w).toBe(760)
  expect(await page.evaluate(() => getComputedStyle(document.getElementById('p')!).borderTopWidth)).toBe('0px')
})

test('::part(dialog) styles the dialog from outside', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await mount(page, `<style>ty-modal::part(dialog) { padding: 40px; }</style><ty-modal id="m">${PANEL}</ty-modal>`)
  await open(page)
  expect(await page.evaluate(() =>
    getComputedStyle(document.getElementById('m')!.shadowRoot!.querySelector('dialog')!).paddingTop)).toBe('40px')
})

test('reduced motion: no enter animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mount(page, `<ty-modal id="m" sheet>${PANEL}</ty-modal>`)
  await page.evaluate(() => document.getElementById('m')!.setAttribute('open', ''))
  expect(await page.evaluate(() =>
    getComputedStyle(document.getElementById('m')!.shadowRoot!.querySelector('dialog')!).animationName)).toBe('none')
})
