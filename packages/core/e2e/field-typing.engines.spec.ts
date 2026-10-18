import { test, expect, Page, Locator } from '@playwright/test'
import { mount } from './helpers'

// ty-textarea and the ty-input password toggle under real typing, clicks and
// taps, on every engine (Chromium projects + firefox + webkit).

const press = (target: Locator, isMobile: boolean) => (isMobile ? target.tap() : target.click())

/** Every input / change event a host gets: ours carry detail.value. */
async function watchEvents(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    w.__events = []
    for (const el of document.querySelectorAll('ty-textarea')) {
      for (const type of ['input', 'change']) {
        el.addEventListener(type, (e) => w.__events.push(e instanceof CustomEvent
          ? `${el.getAttribute('name')} ${type} ${e.detail.value}`
          : `${el.getAttribute('name')} native ${type}`))
      }
    }
  })
}
const events = (page: Page) => page.evaluate(() => (window as any).__events as string[])

test.describe('ty-textarea', () => {
  test('typing fires one input event per keystroke, ours', async ({ page, isMobile }) => {
    await mount(page, `<ty-textarea name="t"></ty-textarea>`)
    await watchEvents(page)
    await press(page.locator('ty-textarea textarea'), isMobile)
    await page.keyboard.type('ab')
    expect(await events(page)).toEqual(['t input a', 't input ab'])
  })

  // A keyed reorder (React), a morph or appendChild / insertBefore
  test('moved in the DOM: still types, validates, submits and fires its events', async ({ page, isMobile }) => {
    await mount(page, `
      <form>
        <div id="from"><ty-textarea name="t1" required></ty-textarea><ty-textarea name="t2" required></ty-textarea></div>
        <div id="to"><span></span></div>
        <input id="other">
      </form>`)
    await page.evaluate(() => {
      const to = document.getElementById('to')!
      to.appendChild(document.querySelector('[name=t1]')!)
      to.insertBefore(document.querySelector('[name=t2]')!, to.firstChild)
    })
    await watchEvents(page)
    for (const [name, text] of [['t1', 'hi'], ['t2', 'yo']]) {
      await press(page.locator(`[name=${name}] textarea`), isMobile)
      await page.keyboard.type(text)
    }
    await press(page.locator('#other'), isMobile)
    expect(await events(page)).toEqual([
      't1 input h', 't1 input hi', 't1 change hi',
      't2 input y', 't2 input yo', 't2 change yo',
    ])
    expect(await page.evaluate(() => {
      const form = document.querySelector('form')!
      return [form.checkValidity(), [...new FormData(form)].map(([k, v]) => `${k}=${v}`).join('&')]
    })).toEqual([true, 't2=yo&t1=hi'])
  })
})

// Back in the page at max-height, only a height change set the custom
// scrollbar up again: Firefox and WebKit kept the native one for good.
test('ty-textarea at max-height, moved in the DOM: keeps its custom scrollbar', async ({ page, isMobile }) => {
  await mount(page, `<div id="a"><ty-textarea id="t" max-height="80px"></ty-textarea></div><div id="b"></div>`)
  await press(page.locator('#t textarea'), isMobile)
  await page.keyboard.type('1\n2\n3\n4\n5\n6\n7\n8')
  const scrollbar = () => page.evaluate(() => {
    const t = document.getElementById('t')!
    return [t.hasAttribute('data-custom-scroll'), t.shadowRoot!.querySelector('textarea')!.style.scrollbarWidth]
  })
  await expect.poll(scrollbar).toEqual([true, 'none'])
  await page.evaluate(() => document.getElementById('b')!.append(document.getElementById('t')!))
  await expect.poll(scrollbar).toEqual([true, 'none'])
})

test('ty-input password toggle keeps the caret and the selection', async ({ page, isMobile }) => {
  await mount(page, `<ty-input type="password"></ty-input>`)
  const input = page.locator('ty-input input')
  const toggle = page.locator('ty-input .password-toggle')
  const value = () => page.evaluate(() => (document.querySelector('ty-input') as any).value)
  const select = (start: number, end: number) =>
    input.evaluate((i: HTMLInputElement, [s, e]) => i.setSelectionRange(s, e), [start, end])

  await press(input, isMobile)
  await page.keyboard.type('hunter2')
  await press(toggle, isMobile)
  await page.keyboard.type('!')
  expect(await value(), 'revealed').toBe('hunter2!')
  await select(4, 4)
  await press(toggle, isMobile)
  await page.keyboard.type('X')
  expect(await value(), 'hidden again').toBe('huntXer2!')
  await select(1, 3)
  await press(toggle, isMobile)
  expect(await input.evaluate((i: HTMLInputElement) =>
    [i.type, i.selectionStart, i.selectionEnd, (i.getRootNode() as ShadowRoot).activeElement === i]))
    .toEqual(['text', 1, 3, true])
})
