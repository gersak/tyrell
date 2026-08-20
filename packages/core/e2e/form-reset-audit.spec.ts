import { test, expect } from '@playwright/test'
import { mount } from './helpers'

/**
 * Real-browser coverage for the 2026-08-19 audit fixes: native reset-button
 * clicks, real drag-and-drop with DataTransfer, dynamic children arriving
 * from framework-style DOM mutation. Complements test/edge-cases*.test.ts,
 * which pin the same contracts at unit level.
 */

test.describe('form reset — real reset button', () => {
  test('reset button restores checkbox, input and radio-group to attribute defaults', async ({ page }) => {
    await mount(page, `
      <form id="f">
        <label><ty-checkbox id="cb" name="ok"></ty-checkbox> OK</label>
        <ty-input id="in" name="title" value="from-server"></ty-input>
        <ty-radio-group id="rg" name="pick">
          <label><ty-radio value="x"></ty-radio> X</label>
          <label><ty-radio value="y"></ty-radio> Y</label>
        </ty-radio-group>
        <button id="reset" type="reset">Reset</button>
      </form>
    `)

    // Real user interaction: check the box, edit the input, pick a radio
    await page.locator('#cb').click()
    await page.locator('#in input').fill('user-edit')
    await page.locator('#in input').blur()
    await page.locator('#rg ty-radio[value="y"]').click()

    await expect(page.locator('#cb')).toHaveJSProperty('checked', true)
    await expect(page.locator('#rg')).toHaveJSProperty('value', 'y')

    await page.locator('#reset').click()

    await expect(page.locator('#cb')).toHaveJSProperty('checked', false)
    await expect(page.locator('#in')).toHaveJSProperty('value', 'from-server')
    await expect(page.locator('#rg')).toHaveJSProperty('value', '')
    // The option model must survive — radio values intact, nothing checked
    const radios = await page.locator('#rg ty-radio').evaluateAll((els: any[]) =>
      els.map((r) => [r.value, r.checked]))
    expect(radios).toEqual([['x', false], ['y', false]])
  })

  test('submitted FormData reflects the restored defaults', async ({ page }) => {
    await mount(page, `
      <form id="f">
        <ty-input id="in" name="title" value="from-server"></ty-input>
        <button id="reset" type="reset">Reset</button>
      </form>
    `)
    await page.locator('#in input').fill('user-edit')
    await page.locator('#in input').blur()
    await page.locator('#reset').click()
    const entries = await page.evaluate(() =>
      Array.from(new FormData(document.getElementById('f') as HTMLFormElement).entries()))
    expect(entries).toEqual([['title', 'from-server']])
  })
})

test.describe('ty-radio-group — disable round-trip', () => {
  test('re-enabling the group restores clickability, individually-disabled radio stays off', async ({ page }) => {
    await mount(page, `
      <ty-radio-group id="rg" name="pick">
        <label><ty-radio value="x"></ty-radio> X</label>
        <label><ty-radio value="y" disabled></ty-radio> Y (own disable)</label>
      </ty-radio-group>
    `)
    const setDisabled = (v: boolean) =>
      page.evaluate((d) => { (document.getElementById('rg') as any).disabled = d }, v)

    await setDisabled(true)
    await setDisabled(false)

    // Group-imposed disable released: X is clickable again
    await page.locator('#rg ty-radio[value="x"]').click()
    await expect(page.locator('#rg')).toHaveJSProperty('value', 'x')
    // Y's own disable survived the round-trip
    await expect(page.locator('#rg ty-radio[value="y"]')).toHaveJSProperty('disabled', true)
  })
})

test.describe('ty-file-upload — real drag-and-drop', () => {
  test('drop respects the accept filter; unnamed upload stays out of FormData', async ({ page }) => {
    await mount(page, `
      <form id="f">
        <ty-file-upload id="up" name="docs" accept=".txt,image/*"></ty-file-upload>
        <ty-file-upload id="anon"></ty-file-upload>
      </form>
    `)

    const drop = async (sel: string, name: string, type: string) => {
      const dt = await page.evaluateHandle(([n, t]) => {
        const dt = new DataTransfer()
        dt.items.add(new File(['payload'], n, { type: t }))
        return dt
      }, [name, type])
      await page.locator(`${sel} .drop-zone`).dispatchEvent('drop', { dataTransfer: dt })
    }

    await drop('#up', 'evil.exe', 'application/x-msdownload')
    await expect(page.locator('#up')).toHaveJSProperty('files', [])

    await drop('#up', 'notes.txt', 'text/plain')
    await drop('#anon', 'ghost.txt', 'text/plain')
    const names = await page.evaluate(() =>
      Array.from(new FormData(document.getElementById('f') as HTMLFormElement).entries())
        .map(([k, v]) => [k, (v as File).name]))
    // Named control submits under its name; unnamed one is excluded entirely
    expect(names).toEqual([['docs', 'notes.txt']])
  })
})

test.describe('dynamic children — tabs and wizard', () => {
  test('a ty-tab appended later gets a button and is clickable', async ({ page }) => {
    await mount(page, `
      <ty-tabs id="t" active="a" height="160px">
        <ty-tab id="a" label="A">aaa</ty-tab>
      </ty-tabs>
    `)
    await page.evaluate(() => {
      const tab = document.createElement('ty-tab')
      tab.id = 'late'
      tab.setAttribute('label', 'Late')
      tab.textContent = 'late content'
      document.getElementById('t')!.appendChild(tab)
    })
    const lateBtn = page.locator('#t [data-tab-id="late"]')
    await expect(lateBtn).toBeVisible()
    await lateBtn.click()
    await expect(page.locator('#t')).toHaveAttribute('active', 'late')
  })

  test('a ty-step appended later appears in the indicator strip', async ({ page }) => {
    await mount(page, `
      <ty-wizard id="w" active="one" height="240px">
        <ty-step id="one" label="One">1</ty-step>
      </ty-wizard>
    `)
    await page.evaluate(() => {
      const step = document.createElement('ty-step')
      step.id = 'late'
      step.setAttribute('label', 'Late')
      document.getElementById('w')!.appendChild(step)
    })
    await expect(page.locator('#w [data-step-id="late"]')).toBeVisible()
  })
})
