/**
 * Custom (non-built-in) flavor support.
 *
 * Built-in flavors get static per-flavor CSS in each component's stylesheet.
 * Any other flavor string is a custom flavor: the component generates the
 * same wiring at runtime, pointed at the user's design tokens
 * (--ty-color-X / --ty-bg-X / --ty-solid-X / ...), and adopts it as a
 * constructed stylesheet.
 *
 * Why an adopted sheet: render() implementations replace shadowRoot.innerHTML
 * (which would destroy an injected <style> element), and inline style on the
 * host would defeat page-level overrides. Adopted sheets survive renders, and
 * outer-document rules on the host still take precedence over :host rules —
 * so `ty-tag[flavor="X"] { --tag-bg: ... }` escape hatches keep working.
 */

import { FLAVORS } from '../types/common.js'

export interface CustomFlavorParts {
  /** Full flavor string as given, e.g. "brand+" */
  flavor: string
  /** Flavor with any +/- shade suffix stripped, e.g. "brand" */
  base: string
  /** "" | "+" | "-" */
  shade: string
}

/**
 * Keep a shadow root's custom-flavor sheet in sync with the current flavor.
 *
 * Built-in flavors (and anything that isn't a plain identifier, so attribute
 * values can't inject CSS) remove the sheet. Custom flavors get `css(parts)`
 * adopted into the shadow root. Returns the sheet to store for the next call.
 */
export function syncCustomFlavorSheet(
  shadow: ShadowRoot,
  sheet: CSSStyleSheet | null,
  flavor: unknown,
  css: (parts: CustomFlavorParts) => string,
): CSSStyleSheet | null {
  const full = String(flavor || '')
  const base = full.replace(/[+-]$/, '')
  if ((FLAVORS as readonly string[]).includes(base) || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(base)) {
    if (sheet) {
      shadow.adoptedStyleSheets = shadow.adoptedStyleSheets.filter((s) => s !== sheet)
    }
    return null
  }
  if (!sheet) {
    sheet = new CSSStyleSheet()
    shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet]
  }
  sheet.replaceSync(css({ flavor: full, base, shade: full.slice(base.length) }))
  return sheet
}
