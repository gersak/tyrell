/**
 * Global loader-icon registry.
 *
 * Set once at app bootstrap to override the default spinner SVG used by
 * every loading-aware component (`ty-button`, `ty-dropdown`, `ty-multiselect`,
 * etc.). Components call `getLoaderSvg()` on every render, so changing the
 * registered SVG affects future renders.
 *
 * The wrapper element rotates the SVG with `transform: rotate()`, so prefer
 * a *static* SVG. If you must use a self-animating SVG, disable the wrapper
 * spin with the `--ty-loader-animation: none` CSS custom property.
 *
 * @example
 *   import { setLoaderSvg } from 'tyrell-components'
 *   setLoaderSvg('<svg viewBox="0 0 24 24">...</svg>')
 *
 *   // CDN / vanilla
 *   window.tyLoader.set('<svg ...>...</svg>')
 *
 *   // Reset to default
 *   setLoaderSvg(null)
 */

const DEFAULT_LOADER_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`

let customLoaderSvg: string | null = null

/**
 * Register a custom spinner SVG (markup string). Pass `null` to reset to
 * the built-in default.
 */
export function setLoaderSvg(svg: string | null): void {
  customLoaderSvg = svg && svg.trim() ? svg : null
}

/**
 * Get the currently registered spinner SVG, or the built-in default if
 * none has been set. Components call this on every render.
 */
export function getLoaderSvg(): string {
  return customLoaderSvg ?? DEFAULT_LOADER_SVG
}

/** Reset the registered loader back to the built-in default. */
export function resetLoaderSvg(): void {
  customLoaderSvg = null
}
