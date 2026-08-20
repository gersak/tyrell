import { test, expect } from '@playwright/test'
import { mount } from './helpers'

/**
 * Real-input proof for the TC48 modal close behaviors (fndriven issue):
 * actual Escape keypresses and actual mouse clicks on the backdrop —
 * not synthetic cancel/click events.
 */

const MODAL = (attrs: string) => `
  <ty-modal id="m" ${attrs}>
    <div style="width: 300px; padding: 24px; background: #fff; color: #111;">
      <h2>Dialog</h2>
      <p>content</p>
    </div>
  </ty-modal>
  <pre id="log"></pre>
`

async function openAndTrack(page: any) {
  await page.evaluate(() => {
    const m = document.getElementById('m') as any
    const log = document.getElementById('log')!
    m.addEventListener('close', (e: any) => {
      log.textContent += `close:${e.detail?.reason ?? '?'};`
    })
    m.setAttribute('open', 'true')
  })
  await expect(page.locator('#m')).toHaveAttribute('open', 'true')
}

const isOpen = (page: any) =>
  page.evaluate(() => document.getElementById('m')!.hasAttribute('open'))
const log = (page: any) =>
  page.evaluate(() => document.getElementById('log')!.textContent)

test('real ESC closes by default, reason "escape", exactly one close event', async ({ page }) => {
  await mount(page, MODAL(''))
  await openAndTrack(page)
  await page.keyboard.press('Escape')
  await expect(page.locator('#m')).not.toHaveAttribute('open', 'true')
  expect(await log(page)).toBe('close:escape;')
})

test('close-on-escape="false": real ESC does NOT close, no close event', async ({ page }) => {
  await mount(page, MODAL('close-on-escape="false"'))
  await openAndTrack(page)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  expect(await isOpen(page)).toBe(true)
  expect(await log(page)).toBe('')
  // and a second ESC still doesn't sneak through (double-cancel guard)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  expect(await isOpen(page)).toBe(true)
})

test('real click on the backdrop closes by default, reason "backdrop"', async ({ page }) => {
  await mount(page, MODAL(''))
  await openAndTrack(page)
  await page.mouse.click(8, 8) // top-left corner — far outside the centered panel
  await expect(page.locator('#m')).not.toHaveAttribute('open', 'true')
  expect(await log(page)).toBe('close:backdrop;')
})

test('close-on-outside-click="false": real backdrop click does NOT close', async ({ page }) => {
  await mount(page, MODAL('close-on-outside-click="false"'))
  await openAndTrack(page)
  await page.mouse.click(8, 8)
  await page.waitForTimeout(200)
  expect(await isOpen(page)).toBe(true)
  expect(await log(page)).toBe('')
})

test('boolean PROPERTY binding disables both (framework path, the original complaint)', async ({ page }) => {
  await mount(page, MODAL(''))
  await page.evaluate(() => {
    const m = document.getElementById('m') as any
    m.closeOnEscape = false        // real booleans, not strings
    m.closeOnOutsideClick = false
  })
  await openAndTrack(page)
  await page.keyboard.press('Escape')
  await page.mouse.click(8, 8)
  await page.waitForTimeout(200)
  expect(await isOpen(page)).toBe(true)
  // re-enable via property → ESC works again
  await page.evaluate(() => { (document.getElementById('m') as any).closeOnEscape = true })
  await page.keyboard.press('Escape')
  await expect(page.locator('#m')).not.toHaveAttribute('open', 'true')
})

test('clicking INSIDE the panel never closes', async ({ page }) => {
  await mount(page, MODAL(''))
  await openAndTrack(page)
  await page.locator('#m h2').click()
  await page.waitForTimeout(200)
  expect(await isOpen(page)).toBe(true)
  expect(await log(page)).toBe('')
})
