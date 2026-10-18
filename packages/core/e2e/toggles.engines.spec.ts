import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * ty-checkbox / ty-switch with real input on every engine. Inside a <label>,
 * Firefox forwards one more click to the host after a click on the box
 * itself (its label doesn't see the shadow content as part of the control):
 * one click must still toggle once and fire one change. A required one left
 * unchecked must block the submit quietly — Firefox logged "The invalid form
 * control … is not focusable." while the host wasn't focusable.
 */

const TOGGLES = `
  <input id="before">
  <label id="cb-label"><ty-checkbox id="cb"></ty-checkbox> <span id="cb-text">Accept terms</span></label>
  <label id="sw-label"><ty-switch id="sw"></ty-switch> <span id="sw-text">Notifications</span></label>
  <ty-checkbox id="cb-bare"></ty-checkbox>
  <ty-switch id="sw-bare"></ty-switch>`

/** Count the clicks page code sees and the change events on each control. */
async function watch(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    w.__clicks = {}
    w.__changes = {}
    for (const el of document.querySelectorAll('ty-checkbox, ty-switch')) {
      w.__clicks[el.id] = 0
      w.__changes[el.id] = []
      el.addEventListener('click', () => { w.__clicks[el.id]++ })
      el.addEventListener('change', (e: any) => { w.__changes[el.id].push(e.detail.value) })
    }
  })
}

const state = (page: Page, id: string) =>
  page.evaluate((id) => {
    const w = window as any
    return {
      checked: (document.getElementById(id) as any).checked,
      clicks: w.__clicks[id],
      changes: w.__changes[id].join(','),
    }
  }, id)

/** The control's focus ring (box-shadow), transitions off. */
const ring = (page: Page, id: string) =>
  page.evaluate((id) => {
    const root = document.getElementById(id)!.shadowRoot!
    const el = root.querySelector('.checkbox-container, .switch-track') as HTMLElement
    el.style.setProperty('transition', 'none', 'important')
    return getComputedStyle(el).boxShadow
  }, id)

const press = async (page: Page, selector: string, touch: boolean) =>
  touch ? page.locator(selector).tap() : page.locator(selector).click()

for (const id of ['cb', 'sw']) {
  test.describe(`${id === 'cb' ? 'ty-checkbox' : 'ty-switch'}: one click, one toggle`, () => {
    test('inside a <label>: a click on the control itself', async ({ page }, info) => {
      await mount(page, TOGGLES)
      await watch(page)
      const touch = !!info.project.use.hasTouch
      await press(page, `#${id}`, touch)
      await expect.poll(() => state(page, id)).toEqual({ checked: true, clicks: 1, changes: 'true' })
      await press(page, `#${id}`, touch)
      await expect.poll(() => state(page, id)).toEqual({ checked: false, clicks: 2, changes: 'true,false' })
    })

    test('inside a <label>: a click on the label text', async ({ page }, info) => {
      await mount(page, TOGGLES)
      await watch(page)
      await press(page, `#${id}-text`, !!info.project.use.hasTouch)
      await expect.poll(() => state(page, id)).toEqual({ checked: true, clicks: 1, changes: 'true' })
    })

    test('inside a <label>: Space on the focused control', async ({ page }) => {
      await mount(page, TOGGLES)
      await watch(page)
      await page.evaluate((id) => (document.getElementById(id) as HTMLElement).focus(), id)
      await page.keyboard.press('Space')
      await expect.poll(() => state(page, id)).toEqual({ checked: true, clicks: 0, changes: 'true' })
    })

    // A <label> click focuses the control (its host delegates focus, which
    // keeps Firefox's submit check quiet); Chromium makes that focus
    // :focus-visible, but only keys may bring the ring.
    test('inside a <label>: a click leaves no focus ring, Tab shows one', async ({ page }, info) => {
      await mount(page, TOGGLES)
      await watch(page)
      const touch = !!info.project.use.hasTouch
      await press(page, `#${id}-text`, touch)
      await expect.poll(() => state(page, id)).toEqual({ checked: true, clicks: 1, changes: 'true' })
      expect(await ring(page, id)).toBe('none')
      await press(page, `#${id}`, touch)
      await expect.poll(() => state(page, id)).toEqual({ checked: false, clicks: 2, changes: 'true,false' })
      expect(await ring(page, id)).toBe('none')

      await page.locator('#before').focus()
      await page.keyboard.press('Tab')
      if (id === 'sw') await page.keyboard.press('Tab')
      expect(await ring(page, id)).not.toBe('none')
      await page.keyboard.press('Space')
      await expect.poll(() => state(page, id)).toEqual({ checked: true, clicks: 2, changes: 'true,false,true' })
      expect(await ring(page, id)).not.toBe('none')
    })

    test('without a <label>', async ({ page }, info) => {
      await mount(page, TOGGLES)
      await watch(page)
      await press(page, `#${id}-bare`, !!info.project.use.hasTouch)
      await expect.poll(() => state(page, `${id}-bare`)).toEqual({ checked: true, clicks: 1, changes: 'true' })
    })

    // Listeners that run before the component's own: one added before the
    // element was inserted (Vue @click, Svelte, Lit) and a capture one on the
    // document (React's onClickCapture). Firefox's forward reached them.
    test('inside a <label>: early and capture listeners see one click', async ({ page }, info) => {
      await mount(page, '')
      await page.evaluate((tag) => {
        const w = window as any
        w.__early = 0
        w.__captured = 0
        const el = document.createElement(tag)
        el.id = 'x'
        el.addEventListener('click', () => { w.__early++ })
        document.addEventListener('click', (e) => { if (e.target === el) w.__captured++ }, true)
        const label = document.createElement('label')
        label.append(el, ' text')
        document.getElementById('app')!.append(label)
      }, id === 'cb' ? 'ty-checkbox' : 'ty-switch')
      await page.waitForTimeout(100)
      await press(page, '#x', !!info.project.use.hasTouch)
      await page.waitForTimeout(200)
      expect(await page.evaluate(() => [(window as any).__early, (window as any).__captured, (document.getElementById('x') as any).checked]))
        .toEqual([1, 1, true])
    })

    // Like a native disabled checkbox: at tabindex=-1 the control was still
    // focusable, the host handed it a <label> click's focus, and Chromium
    // drew the keyboard ring there for good.
    test('disabled, inside a <label>: a click focuses nothing, draws no ring', async ({ page }, info) => {
      await mount(page, `<label><${id === 'cb' ? 'ty-checkbox' : 'ty-switch'} id="d" disabled></${id === 'cb' ? 'ty-checkbox' : 'ty-switch'}> <span id="d-text">Off</span></label>`)
      await press(page, '#d-text', !!info.project.use.hasTouch)
      await page.waitForTimeout(100)
      expect(await page.evaluate(() => document.activeElement?.id ?? null)).not.toBe('d')
      expect(await ring(page, 'd')).toBe('none')
      expect(await page.evaluate(() => (document.getElementById('d') as any).checked)).toBe(false)
    })

    // A keyed reorder moves the element. Firefox and WebKit then take focus
    // away without a blur: the ring stayed, through later re-renders too.
    test('the keyboard ring goes when a move takes the focus', async ({ page }, info) => {
      test.skip(!!info.project.use.hasTouch)
      await mount(page, TOGGLES + '<div id="elsewhere"></div>')
      await page.locator('#before').focus()
      await page.keyboard.press('Tab')
      if (id === 'sw') await page.keyboard.press('Tab')
      expect(await ring(page, id)).not.toBe('none')
      await page.evaluate((id) => document.getElementById('elsewhere')!.append(document.getElementById(id)!), id)
      const focused = await page.evaluate((id) => document.activeElement?.id === id, id)
      expect(await ring(page, id) !== 'none').toBe(focused)
      await page.evaluate((id) => { (document.getElementById(id) as any).checked = true }, id)
      expect(await ring(page, id) !== 'none').toBe(focused)
    })
  })
}

test('ty-radio inside a <label>: one click selects it, page listeners see one click', async ({ page }, info) => {
  await mount(page, `
    <ty-radio-group id="g" name="plan">
      <label><ty-radio id="r1" value="a"></ty-radio> Alpha</label>
      <label><ty-radio id="r2" value="b"></ty-radio> Beta</label>
    </ty-radio-group>`)
  await page.evaluate(() => {
    const w = window as any
    w.__clicks = 0
    w.__changes = []
    document.getElementById('r2')!.addEventListener('click', () => { w.__clicks++ })
    document.getElementById('g')!.addEventListener('change', (e: any) => { w.__changes.push(e.detail.value) })
  })
  await press(page, '#r2', !!info.project.use.hasTouch)
  await expect.poll(() => page.evaluate(() => {
    const w = window as any
    return `${(document.getElementById('g') as any).value} clicks=${w.__clicks} changes=${w.__changes.join(',')}`
  })).toBe('b clicks=1 changes=b')
})

test('required and unchecked: submit blocked, browser bubble on the control, no console error', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(e.message))
  await mount(page, `
    <form id="f">
      <ty-checkbox name="terms" required></ty-checkbox>
      <ty-switch name="consent" required></ty-switch>
      <button id="go">Go</button>
    </form>`)
  await page.evaluate(() => {
    const w = window as any
    w.__submits = 0
    w.__prevented = []
    const f = document.getElementById('f')!
    f.addEventListener('submit', (e) => { e.preventDefault(); w.__submits++ })
    // Listeners run before the browser decides: read defaultPrevented a task later.
    for (const el of f.querySelectorAll('[required]')) {
      el.addEventListener('invalid', (e) => setTimeout(() => w.__prevented.push(e.defaultPrevented)))
    }
  })
  await page.locator('#go').click()
  await expect.poll(() => page.evaluate(() => (window as any).__prevented.length)).toBe(2)
  expect(await page.evaluate(() => (window as any).__submits)).toBe(0)
  // Not prevented: the browser shows its own bubble.
  expect(await page.evaluate(() => (window as any).__prevented)).toEqual([false, false])
  // Focus lands on the checkbox's role element.
  expect(await page.evaluate(() => {
    const host = document.activeElement as HTMLElement
    return `${host.getAttribute('name')}:${host.shadowRoot?.activeElement?.getAttribute('role')}`
  })).toBe('terms:checkbox')
  await page.waitForTimeout(200)
  expect(errors.filter((t) => /not focusable/i.test(t))).toEqual([])
})
