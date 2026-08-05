import { Page } from '@playwright/test'

/** Navigate to the fixture and inject markup into #app, waiting for custom elements to upgrade. */
export async function mount(page: Page, html: string) {
  await page.goto('/e2e/fixture.html')
  await page.evaluate((h) => {
    document.getElementById('app')!.innerHTML = h
  }, html)
  // customElements.define runs synchronously as tyrell.js loads (before body
  // markup is injected here), so upgrade is immediate — but give one frame
  // for connectedCallback-triggered initial render to settle.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}
