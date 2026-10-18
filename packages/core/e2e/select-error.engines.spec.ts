import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

// A required ty-select inside a real <form>, driven by real clicks. Runs on
// every engine (Chromium projects + firefox + webkit): the message is the
// browser's own wording for a native <select>, and it shows in the select's
// error line under the field (no browser bubble), with focus on the trigger.

const FORM = `
  <form>
    <ty-select name="robot" label="Robot" required>
      <ty-option value="bobo">Bobo</ty-option>
      <ty-option value="eywa">EYWA</ty-option>
    </ty-select>
    <ty-select name="crew" label="Crew" required multiple>
      <ty-option value="bobo">Bobo</ty-option>
      <ty-option value="eywa">EYWA</ty-option>
    </ty-select>
    <button id="send">Send</button>
  </form>`

async function watchSubmits(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    w.__submits = 0
    w.__data = null
    document.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault()
      w.__submits++
      w.__data = Array.from(new FormData(e.target as HTMLFormElement).entries())
        .map(([k, v]) => `${k}=${v}`).join('&')
    })
  })
}

const submits = (page: Page) => page.evaluate(() => (window as any).__submits as number)
const lastData = (page: Page) => page.evaluate(() => (window as any).__data as string | null)
const field = (page: Page, name: string) => page.locator(`ty-select[name="${name}"]`)
const errorOf = (page: Page, name: string) => field(page, name).evaluate((el) => el.getAttribute('error'))
const lineOf = (page: Page, name: string) => field(page, name).locator('.error-message')
/** What a native <select> in this browser says for the same attributes. */
const nativeSelectMessage = (page: Page, attrs: Record<string, string>) =>
  page.evaluate((attrs) => {
    const s = document.createElement('select')
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
    return s.validationMessage
  }, attrs)
/** name of the ty-select whose trigger has focus. */
const focusedField = (page: Page) => page.evaluate(() => {
  const host = document.activeElement as HTMLElement | null
  const inner = host?.shadowRoot?.activeElement
  return inner?.classList.contains('select-stub') ? host!.getAttribute('name') : null
})

/** Open a select and pick one option with real clicks (desktop list or mobile sheet). */
async function pick(page: Page, name: string, value: string) {
  await field(page, name).locator('.select-stub').click()
  await field(page, name).locator(`ty-option[value="${value}"]`).click()
}

test.describe('ty-select error line in a form (real input)', () => {
  test('Send with nothing picked: no submit, the message sits under each select, first one focused', async ({ page }) => {
    await mount(page, FORM)
    await watchSubmits(page)
    await page.click('#send')
    expect(await submits(page)).toBe(0)

    const single = await nativeSelectMessage(page, { required: '' })
    const multiple = await nativeSelectMessage(page, { required: '', multiple: '' })
    expect(await errorOf(page, 'robot')).toBe(single)
    expect(await errorOf(page, 'crew')).toBe(multiple)
    await expect(lineOf(page, 'robot')).toHaveText(single)
    await expect(lineOf(page, 'robot')).toBeVisible()
    await expect(field(page, 'robot').locator('.select-stub')).toHaveAttribute('aria-invalid', 'true')
    expect(await focusedField(page)).toBe('robot')

    // The line sits under the trigger
    const stub = await field(page, 'robot').locator('.select-stub').boundingBox()
    const line = await lineOf(page, 'robot').boundingBox()
    expect(line!.y).toBeGreaterThanOrEqual(stub!.y + stub!.height)
  })

  test('picking clears the message; then Send submits', async ({ page }) => {
    await mount(page, FORM)
    await watchSubmits(page)
    await page.click('#send')
    expect(await errorOf(page, 'robot')).not.toBeNull()

    await pick(page, 'robot', 'eywa')
    await expect(lineOf(page, 'robot')).toHaveCount(0)
    expect(await errorOf(page, 'robot')).toBeNull()

    await pick(page, 'crew', 'bobo')
    // multiple keeps its list open: close it before moving on
    await page.keyboard.press('Escape')
    await expect(lineOf(page, 'crew')).toHaveCount(0)

    await page.click('#send')
    expect(await submits(page)).toBe(1)
    expect(await lastData(page)).toBe('robot=eywa&crew=bobo')
  })

  test('form.reportValidity() from a plain button uses the error line too', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-select name="robot" required><ty-option value="bobo">Bobo</ty-option></ty-select>
        <button type="button" id="check">Check</button>
      </form>`)
    await page.evaluate(() => {
      document.getElementById('check')!.addEventListener('click', () => document.querySelector('form')!.reportValidity())
    })
    await page.click('#check')
    await expect(lineOf(page, 'robot')).toHaveText(await nativeSelectMessage(page, { required: '' }))
  })
})
