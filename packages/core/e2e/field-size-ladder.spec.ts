import { test, expect } from '@playwright/test'

/* One ladder (styles/field-size.ts) drives every field: the same `size` must
   be the same height, and the same label type scale, on all of them. */
/* Narrow viewports step lg/xl down a rung (see the @media blocks in
   field-size.ts), so the table is a function of the viewport, not a constant. */
const ladder = (w: number): Record<string, number> =>
  w <= 480 ? { xs: 28, sm: 32, md: 36, lg: 36, xl: 36 }
  : w <= 640 ? { xs: 28, sm: 32, md: 36, lg: 36, xl: 40 }
  : { xs: 28, sm: 32, md: 36, lg: 40, xl: 44 }

test('all fields share the ladder', async ({ page }) => {
  const EXPECTED = ladder(page.viewportSize()!.width)
  await page.goto('/e2e/fixture.html')
  await page.evaluate(() => {
    document.getElementById('app')!.innerHTML = ['xs','sm','md','lg','xl'].map(s => `
      <ty-input id="i-${s}" size="${s}" label="L" value="Sample"></ty-input>
      <ty-copy id="c-${s}" size="${s}" label="L" value="Sample"></ty-copy>
      <ty-select id="s-${s}" size="${s}" label="L"><ty-option value="a">A</ty-option></ty-select>
      <ty-date-picker id="d-${s}" size="${s}" label="L" value="2026-07-17"></ty-date-picker>`).join('')
  })
  await page.waitForTimeout(700)
  const rows = await page.evaluate(() => ['xs','sm','md','lg','xl'].map(s => {
    const h = (id: string, sel: string) => Math.round(
      (document.getElementById(id)!.shadowRoot!.querySelector(sel) as HTMLElement).getBoundingClientRect().height)
    const lf = (id: string) => getComputedStyle(document.getElementById(id)!.shadowRoot!.querySelector('.ty-field-label')!).fontSize
    return { s, input: h('i-'+s,'.input-wrapper'), copy: h('c-'+s,'.input-wrapper'),
             select: h('s-'+s,'.select-stub'), datePicker: h('d-'+s,'.date-picker-stub'),
             labels: [lf('i-'+s), lf('c-'+s), lf('s-'+s), lf('d-'+s)].join('/') }
  }))

  for (const r of rows) {
    expect(r.input, `${r.s} input`).toBe(EXPECTED[r.s])
    expect(r.copy, `${r.s} copy`).toBe(EXPECTED[r.s])
    expect(r.select, `${r.s} select`).toBe(EXPECTED[r.s])
    expect(r.datePicker, `${r.s} date-picker`).toBe(EXPECTED[r.s])
    const [a, ...rest] = r.labels.split('/')
    expect(rest.every((x) => x === a), `${r.s} labels agree (${r.labels})`).toBe(true)
  }
})
