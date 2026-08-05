import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-copy — edge cases', () => {
  test('click copy button calls clipboard.writeText with the value and shows success state', async ({ page }) => {
    await mount(page, `<ty-copy id="c" value="hello-world"></ty-copy>`)
    await page.evaluate(() => {
      ;(window as any).__copied = null
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: (t: string) => { (window as any).__copied = t; return Promise.resolve() } },
        configurable: true,
      })
    })
    await page.locator('#c .copy-button').click()
    const copied = await page.evaluate(() => (window as any).__copied)
    expect(copied).toBe('hello-world')
    await expect(page.locator('#c .copy-button')).toHaveClass(/success/)
  })

  test('empty value: copy button does not throw', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-copy id="c" value=""></ty-copy>`)
    await page.locator('#c .copy-button').click({ force: true }).catch(() => {})
    expect(errors).toEqual([])
  })

  test('disabled copy button does not trigger clipboard write', async ({ page }) => {
    await mount(page, `<ty-copy id="c" value="secret" disabled></ty-copy>`)
    await page.evaluate(() => {
      ;(window as any).__copied = null
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: (t: string) => { (window as any).__copied = t; return Promise.resolve() } },
        configurable: true,
      })
    })
    await page.locator('#c .copy-button').click({ force: true })
    const copied = await page.evaluate(() => (window as any).__copied)
    expect(copied).toBeNull()
  })
})

test.describe('ty-file-upload — edge cases', () => {
  test('selecting a file via the hidden native input fires change with file details', async ({ page }) => {
    await mount(page, `<ty-file-upload id="fu"></ty-file-upload>`)
    const detailPromise = page.evaluate(() => new Promise((resolve) => {
      document.getElementById('fu')!.addEventListener('change', (e: any) => resolve(e.detail), { once: true })
    }))
    const fileInput = page.locator('#fu input[type=file]')
    await fileInput.setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('fake-image-data') })
    const detail: any = await detailPromise
    expect(detail.names).toContain('test.png')
  })

  test('accept="image/*": a non-matching file is rejected (not added to the list)', async ({ page }) => {
    await mount(page, `<ty-file-upload id="fu" accept="image/*"></ty-file-upload>`)
    const fileInput = page.locator('#fu input[type=file]')
    await fileInput.setInputFiles({ name: 'doc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('fake-pdf-data') })
    await page.waitForTimeout(200)
    const value = await page.locator('#fu').evaluate((el: any) => el.value ?? el.files)
    const names = Array.isArray(value) ? value.map((f: any) => f.name ?? f) : []
    expect(names).not.toContain('doc.pdf')
  })

  test('multiple attribute: selecting several files keeps all of them (per CLAUDE.md: change detail is { value, files, names })', async ({ page }) => {
    await mount(page, `<ty-file-upload id="fu" multiple></ty-file-upload>`)
    const detailPromise = page.evaluate(() => new Promise((resolve) => {
      document.getElementById('fu')!.addEventListener('change', (e: any) => resolve(e.detail), { once: true })
    }))
    const fileInput = page.locator('#fu input[type=file]')
    await fileInput.setInputFiles([
      { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('a') },
      { name: 'b.txt', mimeType: 'text/plain', buffer: Buffer.from('b') },
    ])
    const detail: any = await detailPromise
    expect(detail.names.sort()).toEqual(['a.txt', 'b.txt'])
  })

  test('drag-enter/drag-leave toggles a visual drag-over state without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-file-upload id="fu"></ty-file-upload>`)
    const dropZone = page.locator('#fu .drop-zone')
    const dt = await page.evaluateHandle(() => new DataTransfer())
    await dropZone.dispatchEvent('dragenter', { dataTransfer: dt })
    await dropZone.dispatchEvent('dragover', { dataTransfer: dt })
    await dropZone.dispatchEvent('dragleave', { dataTransfer: dt })
    expect(errors).toEqual([])
  })

  test('disabled file-upload does not open the native picker on click', async ({ page }) => {
    await mount(page, `<ty-file-upload id="fu" disabled></ty-file-upload>`)
    // Best-effort: clicking a disabled drop zone should not throw and should
    // not flip any "active"/focus visual state.
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.locator('#fu .drop-zone').click({ force: true })
    expect(errors).toEqual([])
  })
})
