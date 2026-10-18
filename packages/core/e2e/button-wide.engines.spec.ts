import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * A `wide` ty-button grows with flex-grow: across a flex row that's its
 * width, but down a flex column it's its height. The host stops at the
 * button's own height; it did with max-height: max-content, which Firefox
 * ignores in the block axis, so there the element grew down the column and
 * pushed what came after it to the bottom.
 */

const measure = (page: Page) =>
  page.locator('#b').evaluate((el) => {
    const host = el.getBoundingClientRect()
    const button = el.shadowRoot!.querySelector('button')!.getBoundingClientRect()
    const next = el.nextElementSibling!.getBoundingClientRect()
    return { width: Math.round(host.width), height: Math.round(host.height), button: Math.round(button.height), next: Math.round(next.top - host.top) }
  })

for (const [name, attrs] of [['default', ''], ['size="xl"', ' size="xl"'], ['action', ' action']]) {
  test(`a wide ${name} button in a tall flex column keeps its own height`, async ({ page }) => {
    await mount(page, `<form style="display: flex; flex-direction: column; width: 300px; height: 400px"><ty-button id="b" wide${attrs}>Go</ty-button><div>next</div></form>`)
    const r = await measure(page)
    expect(r.width).toBe(300)
    expect(r.height).toBe(r.button)
    expect(r.next).toBe(r.button)
  })
}

test('a wide button in a flex row still fills it', async ({ page }) => {
  await mount(page, `<form style="display: flex; width: 400px; gap: 8px"><span style="width: 50px">x</span><ty-button id="b" wide>Go</ty-button><div>next</div></form>`)
  const r = await measure(page)
  expect(r.width).toBeGreaterThan(250)
  expect(r.height).toBe(r.button)
})
