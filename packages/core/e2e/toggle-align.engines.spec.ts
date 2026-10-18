import { test, expect } from '@playwright/test'
import { mount } from './helpers'

/**
 * ty-checkbox / ty-switch / ty-radio sit on the middle of the first text
 * line on every engine (the host is `height: 1lh` with a 1.25em fallback, a
 * baseline strut, and a bigger control overhangs the line). Smallest and
 * largest sizes against small and large text, in a flex label (start and
 * center), inline in text, and next to a wrapping label.
 */

const CONTROLS = [
  { tag: 'ty-checkbox', visual: 'svg' },
  { tag: 'ty-switch', visual: '.switch-track' },
  { tag: 'ty-radio', visual: '.radio-circle' },
]
const FONTS = [
  { size: 12, leading: 16 },
  { size: 14, leading: 20 },
  { size: 20, leading: 28 },
]

function markup() {
  let html = ''
  for (const { tag } of CONTROLS)
    for (const f of FONTS)
      for (const size of ['xs', 'xl']) {
        const font = `font-family: sans-serif; font-size: ${f.size}px; line-height: ${f.leading}px;`
        const id = `${tag}-${f.size}-${size}`
        html +=
          `<label data-case="${id}-start" style="display: flex; align-items: flex-start; gap: 8px; ${font}"><${tag} size="${size}"></${tag}><span>Label text</span></label>` +
          `<label data-case="${id}-center" style="display: flex; align-items: center; gap: 8px; ${font}"><${tag} size="${size}"></${tag}><span>Label text</span></label>` +
          `<label data-case="${id}-wrap" style="display: flex; align-items: flex-start; gap: 8px; width: 160px; ${font}"><${tag} size="${size}"></${tag}><span>A label long enough to wrap onto several lines here</span></label>` +
          `<p data-case="${id}-inline" style="margin: 0; ${font}">Before <${tag} size="${size}"></${tag}> after</p>`
      }
  return `<div style="width: 600px">${html}</div>`
}

test('toggles center on the first text line at every size', async ({ page }) => {
  await mount(page, markup())
  const results = await page.evaluate((controls) => {
    const mid = (r: DOMRect) => r.top + r.height / 2
    const out: { id: string; off: number; pushed: number }[] = []
    for (const c of document.querySelectorAll<HTMLElement>('[data-case]')) {
      const { tag, visual } = controls.find((x) => c.dataset.case!.startsWith(x.tag))!
      const el = c.querySelector(tag)!
      const text = (c.querySelector('span') ?? c).firstChild!
      const range = document.createRange()
      range.selectNodeContents(text)
      const line = range.getClientRects()[0] as DOMRect
      const v = el.shadowRoot!.querySelector(visual)!.getBoundingClientRect()
      const textBox = (c.querySelector('span') ?? c).getBoundingClientRect()
      out.push({
        id: c.dataset.case!,
        off: Math.round((mid(v) - mid(line)) * 100) / 100,
        // How much the control grows the row / line beyond the text.
        pushed: Math.round((c.getBoundingClientRect().height - textBox.height) * 100) / 100,
      })
    }
    return out
  }, CONTROLS)

  expect(results.length).toBe(CONTROLS.length * FONTS.length * 2 * 4)
  const bad = results.filter((r) => Math.abs(r.off) > 1 || Math.abs(r.pushed) > 0.5)
  expect(bad).toEqual([])
})
