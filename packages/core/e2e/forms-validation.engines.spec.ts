import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

// Form behavior of ty-input / ty-textarea inside a real <form>, driven by real
// user input. Runs on every engine (Chromium projects + firefox + webkit):
// validationMessage text, focus and implicit submission differ per engine.

/** Count submits (prevented) and keep the last FormData as name=value pairs. */
async function watchSubmits(page: Page, selector = 'form') {
  await page.evaluate((sel) => {
    const w = window as any
    w.__submits = 0
    w.__data = null
    document.querySelector(sel)!.addEventListener('submit', (e) => {
      e.preventDefault()
      w.__submits++
      w.__data = Array.from(new FormData(e.target as HTMLFormElement).entries())
        .map(([k, v]) => `${k}=${v}`).join('&')
    })
  }, selector)
}

const submits = (page: Page) => page.evaluate(() => (window as any).__submits as number)
const lastData = (page: Page) => page.evaluate(() => (window as any).__data as string | null)
const errorOf = (page: Page, name: string) =>
  page.locator(`[name="${name}"]`).first().evaluate((el) => el.getAttribute('error'))
/** name attribute of the Ty field whose inner control has focus. */
const focusedField = (page: Page) => page.evaluate(() => {
  const host = document.activeElement as HTMLElement | null
  if (!host?.shadowRoot?.activeElement) return null
  return host.getAttribute('name')
})
/** What a native <input> in this browser reports for the same rule. */
const nativeMessage = (page: Page, type: string, attrs: Record<string, string>, value: string) =>
  page.evaluate(({ type, attrs, value }) => {
    const i = document.createElement('input')
    i.type = type
    for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, v)
    i.value = value
    return i.validationMessage
  }, { type, attrs, value })

/** What a native <textarea> / <select> / <input> reports for the same attributes. */
const nativeControlMessage = (page: Page, tag: string, attrs: Record<string, string>) =>
  page.evaluate(({ tag, attrs }) => {
    const el = document.createElement(tag) as HTMLInputElement
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    return el.validationMessage
  }, { tag, attrs })
const messageOf = (page: Page, name: string) =>
  page.locator(`[name="${name}"]`).first().evaluate((el) => (el as HTMLInputElement).validationMessage)

const inner = (page: Page, name: string, tag = 'input') => page.locator(`[name="${name}"] ${tag}`)

const FORM = `
  <form>
    <ty-input name="email" label="Email" type="email" required></ty-input>
    <ty-input name="handle" label="Handle" required minlength="3"></ty-input>
    <ty-input name="seats" label="Seats" type="number" min="1" max="50"></ty-input>
    <ty-textarea name="note" label="Note" required></ty-textarea>
    <ty-button id="send">Send</ty-button>
  </form>`

test.describe('forms — submit, blur, Enter (real input)', () => {
  test('Send with bad values: no submit, every failing field shows its error, first one focused', async ({ page }) => {
    await mount(page, FORM)
    await watchSubmits(page)
    await inner(page, 'email').fill('ada@')
    await inner(page, 'handle').fill('ad')
    await inner(page, 'seats').fill('80')
    await page.click('#send')
    expect(await submits(page)).toBe(0)
    for (const name of ['email', 'handle', 'seats', 'note']) {
      expect(await errorOf(page, name), name).not.toBeNull()
    }
    expect(await focusedField(page)).toBe('email')
  })

  // The blur on mousedown reveals the field's message, which pushes Send down
  // ~21px before mouseup: the click must still land (first click submits).
  test('first click on Send right after typing in a field is not lost', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="f" minlength="3"></ty-input>
        <ty-input name="r" required></ty-input>
        <ty-button id="send">Send</ty-button>
      </form>`)
    await page.evaluate(() => {
      const w = window as any
      w.__clicks = 0
      document.getElementById('send')!.addEventListener('click', () => w.__clicks++)
    })
    await inner(page, 'f').fill('ab')
    await page.click('#send')
    expect(await page.evaluate(() => (window as any).__clicks)).toBe(1)
    expect(await errorOf(page, 'r')).not.toBeNull()
  })

  test('typing a fix clears that field\'s error immediately', async ({ page }) => {
    await mount(page, FORM)
    await watchSubmits(page)
    await page.click('#send')
    expect(await errorOf(page, 'handle')).not.toBeNull()
    await inner(page, 'handle').click()
    await page.keyboard.type('ada')
    expect(await errorOf(page, 'handle')).toBeNull()
  })

  test('all valid: Send submits once with the FormData', async ({ page }) => {
    await mount(page, FORM)
    await watchSubmits(page)
    await inner(page, 'email').fill('ada@example.com')
    await inner(page, 'handle').fill('ada')
    await inner(page, 'seats').fill('12')
    await inner(page, 'note', 'textarea').fill('hi')
    await page.click('#send')
    expect(await submits(page)).toBe(1)
    expect(await lastData(page)).toBe('email=ada@example.com&handle=ada&seats=12&note=hi')
  })

  test('blur after an edit shows the message; tabbing through untouched fields shows nothing', async ({ page }) => {
    await mount(page, FORM)
    await inner(page, 'email').click()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    for (const name of ['email', 'handle', 'seats']) {
      expect(await errorOf(page, name), `${name} untouched`).toBeNull()
    }
    await inner(page, 'handle').click()
    await page.keyboard.type('ad')
    expect(await errorOf(page, 'handle'), 'not while typing').toBeNull()
    await page.keyboard.press('Tab')
    expect(await errorOf(page, 'handle')).toContain('3')
  })

  test('textarea: blur after an edit shows the message', async ({ page }) => {
    await mount(page, FORM)
    await inner(page, 'note', 'textarea').click()
    await page.keyboard.type('x')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Tab')
    expect(await errorOf(page, 'note')).not.toBeNull()
  })

  test('Enter submits through the default button', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="a" value="x"></ty-input>
        <ty-input name="b"></ty-input>
        <ty-button>Go</ty-button>
      </form>`)
    await watchSubmits(page)
    await inner(page, 'a').click()
    await page.keyboard.press('Enter')
    expect(await submits(page)).toBe(1)
  })

  test('Enter does nothing when the default button is disabled', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="a" value="x"></ty-input>
        <button disabled>Go</button>
      </form>`)
    await watchSubmits(page)
    await inner(page, 'a').click()
    await page.keyboard.press('Enter')
    expect(await submits(page)).toBe(0)
  })

  test('no submit button: Enter submits a single-field form only', async ({ page }) => {
    await mount(page, `
      <form id="one"><ty-input name="a" value="x"></ty-input></form>
      <form id="two"><ty-input name="b"></ty-input><ty-input name="c"></ty-input></form>`)
    await watchSubmits(page, '#one')
    await page.evaluate(() => {
      const w = window as any
      w.__submits2 = 0
      document.querySelector('#two')!.addEventListener('submit', (e) => { e.preventDefault(); w.__submits2++ })
    })
    await inner(page, 'a').click()
    await page.keyboard.press('Enter')
    await inner(page, 'b').click()
    await page.keyboard.press('Enter')
    expect(await submits(page)).toBe(1)
    expect(await page.evaluate(() => (window as any).__submits2)).toBe(0)
  })

  test('Enter on an invalid form shows the errors instead of submitting', async ({ page }) => {
    await mount(page, FORM)
    await watchSubmits(page)
    await inner(page, 'handle').click()
    await page.keyboard.press('Enter')
    expect(await submits(page)).toBe(0)
    expect(await errorOf(page, 'email')).not.toBeNull()
    expect(await focusedField(page)).toBe('email')
  })

  test('empty field submits name=; number submits its numeric value', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="empty"></ty-input>
        <ty-input name="n" type="number"></ty-input>
        <ty-button>Go</ty-button>
      </form>`)
    await watchSubmits(page)
    await inner(page, 'n').fill('1234.5')
    await page.click('ty-button')
    expect(await lastData(page)).toBe('empty=&n=1234.5')
  })
})

test.describe('forms — messages and APIs', () => {
  test('required and min/max messages are the browser\'s own', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="r" required></ty-input>
        <ty-input name="lo" type="number" min="1" max="50"></ty-input>
        <ty-input name="hi" type="number" min="1" max="50"></ty-input>
        <ty-button id="send">Send</ty-button>
      </form>`)
    await inner(page, 'lo').fill('0')
    await inner(page, 'hi').fill('80')
    await page.click('#send')
    expect(await errorOf(page, 'r')).toBe(await nativeMessage(page, 'text', { required: '' }, ''))
    expect(await errorOf(page, 'lo')).toBe(await nativeMessage(page, 'number', { step: 'any', min: '1', max: '50' }, '0'))
    expect(await errorOf(page, 'hi')).toBe(await nativeMessage(page, 'number', { step: 'any', min: '1', max: '50' }, '80'))
    expect(await errorOf(page, 'r')).not.toBe('')
  })

  test('too-short message is the browser\'s own once the user typed', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="h" minlength="3"></ty-input>
        <input id="n" minlength="3">
      </form>`)
    await inner(page, 'h').click()
    await page.keyboard.type('ab')
    await page.click('#n')
    await page.keyboard.type('ab')
    const native = await page.locator('#n').evaluate((el) => (el as HTMLInputElement).validationMessage)
    expect(native).not.toBe('')
    expect(await messageOf(page, 'h')).toBe(native)
    expect(await errorOf(page, 'h'), 'error line after blur').toBe(native)
  })

  test('min the browser ignores is no rule: flag and message agree with native', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="a" type="number" min=" 5 "></ty-input>
        <ty-input name="b" type="number" min="0x10"></ty-input>
        <ty-input name="c" type="number" min="5"></ty-input>
      </form>`)
    for (const [name, min] of [['a', ' 5 '], ['b', '0x10'], ['c', '5']]) {
      await inner(page, name).fill('3')
      const native = await page.evaluate((min) => {
        const i = document.createElement('input')
        i.type = 'number'
        i.setAttribute('min', min)
        i.value = '3'
        return [i.validity.rangeUnderflow, i.validationMessage]
      }, min)
      const ty = await page.locator(`ty-input[name="${name}"]`).evaluate((el: any) => [el.validity.rangeUnderflow, el.validationMessage])
      expect(ty, `min="${min}"`).toEqual(native)
    }
  })

  test('textarea, select and checkbox required messages are the browser\'s own', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-textarea name="t" required></ty-textarea>
        <ty-select name="s" required><ty-option value="x">X</ty-option></ty-select>
        <ty-checkbox name="c" required>C</ty-checkbox>
      </form>`)
    const textarea = await nativeControlMessage(page, 'textarea', { required: '' })
    expect(textarea).not.toBe('')
    expect(await messageOf(page, 't')).toBe(textarea)
    expect(await messageOf(page, 's')).toBe(await nativeControlMessage(page, 'select', { required: '' }))
    expect(await messageOf(page, 'c')).toBe(await nativeControlMessage(page, 'input', { type: 'checkbox', required: '' }))
    await page.evaluate(() => document.querySelector('form')!.checkValidity())
    expect(await errorOf(page, 't'), 'error line').toBe(textarea)
  })

  test('pattern and email messages are the browser\'s own', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="code" pattern="[0-9]{4}"></ty-input>
        <ty-input name="mail" type="email"></ty-input>
        <ty-button id="send">Send</ty-button>
      </form>`)
    await inner(page, 'code').fill('12')
    await inner(page, 'mail').fill('nope')
    await page.click('#send')
    expect(await errorOf(page, 'code')).toBe(await nativeMessage(page, 'text', { pattern: '[0-9]{4}' }, '12'))
    expect(await errorOf(page, 'mail')).toBe(await nativeMessage(page, 'email', {}, 'nope'))
  })

  test('form.reportValidity() from a type="button" click shows Ty error lines', async ({ page }) => {
    await mount(page, `
      <form>
        <ty-input name="a" required></ty-input>
        <button type="button" id="next">Next</button>
      </form>`)
    await page.evaluate(() => {
      const form = document.querySelector('form')!
      document.getElementById('next')!.addEventListener('click', () => form.reportValidity())
    })
    await page.click('#next')
    expect(await errorOf(page, 'a')).not.toBeNull()
  })

  test('checkValidity() shows the message; validity.valid is the silent check', async ({ page }) => {
    await mount(page, `<form><ty-input name="a" required></ty-input></form>`)
    const silent = await page.evaluate(() => (document.querySelector('ty-input') as any).validity.valid)
    expect(silent).toBe(false)
    expect(await errorOf(page, 'a')).toBeNull()
    const valid = await page.evaluate(() => document.querySelector('form')!.checkValidity())
    expect(valid).toBe(false)
    expect(await errorOf(page, 'a')).not.toBeNull()
  })
})
