import { test, expect } from '@playwright/test'
import { mount } from './helpers'

/**
 * Pins the Placement geometry contract (TY_GUIDE → Placement): alignment is
 * measured on the VISIBLE surface, not the dialog's shadow-room wrap.
 * Regression: cross-axis alignment ignored containerPadding (top/bottom) and
 * had its sign flipped (left/right), so `-end` panels sat visibly off-flush.
 */

async function visibleVsTrigger(page: any) {
  return page.evaluate(() => {
    const trigger = document.getElementById('t')!.getBoundingClientRect()
    const surface = document.getElementById('surface')!.getBoundingClientRect()
    return { trigger, surface }
  })
}

const POPUP = (placement: string) => `
  <div style="padding: 200px; display: inline-block;">
    <button id="t" style="width: 120px; height: 40px;">go
      <ty-popup placement="${placement}">
        <div id="surface" style="width: 80px; padding: 10px; background: #333; color: #fff;">pop</div>
      </ty-popup>
    </button>
  </div>
`

test('bottom-end: visible right edges flush, 8px below', async ({ page }) => {
  await mount(page, POPUP('bottom-end'))
  await page.locator('#t').click()
  await expect(page.locator('#surface')).toBeVisible()
  const { trigger, surface } = await visibleVsTrigger(page)
  expect(Math.abs(surface.right - trigger.right)).toBeLessThanOrEqual(1)
  expect(surface.top - trigger.bottom).toBeGreaterThanOrEqual(7)
  expect(surface.top - trigger.bottom).toBeLessThanOrEqual(9)
})

test('top-start: visible left edges flush, 8px above', async ({ page }) => {
  await mount(page, POPUP('top-start'))
  await page.locator('#t').click()
  await expect(page.locator('#surface')).toBeVisible()
  const { trigger, surface } = await visibleVsTrigger(page)
  expect(Math.abs(surface.left - trigger.left)).toBeLessThanOrEqual(1)
  expect(trigger.top - surface.bottom).toBeGreaterThanOrEqual(7)
  expect(trigger.top - surface.bottom).toBeLessThanOrEqual(9)
})

test('right-start: visible top edges flush, 8px to the right', async ({ page }) => {
  await mount(page, POPUP('right-start'))
  await page.locator('#t').click()
  await expect(page.locator('#surface')).toBeVisible()
  const { trigger, surface } = await visibleVsTrigger(page)
  expect(Math.abs(surface.top - trigger.top)).toBeLessThanOrEqual(1)
  expect(surface.left - trigger.right).toBeGreaterThanOrEqual(7)
  expect(surface.left - trigger.right).toBeLessThanOrEqual(9)
})

test('left-end: visible bottom edges flush, 8px to the left', async ({ page }) => {
  await mount(page, POPUP('left-end'))
  await page.locator('#t').click()
  await expect(page.locator('#surface')).toBeVisible()
  const { trigger, surface } = await visibleVsTrigger(page)
  expect(Math.abs(surface.bottom - trigger.bottom)).toBeLessThanOrEqual(1)
  expect(trigger.left - surface.right).toBeGreaterThanOrEqual(7)
  expect(trigger.left - surface.right).toBeLessThanOrEqual(9)
})
