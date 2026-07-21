/**
 * Shared inline SVG icons for shadow-DOM components.
 *
 * Kept inline (not the icon registry) because shadow roots must render
 * without registry setup. Styling hooks target the wrapper element
 * (e.g. `.required-icon svg`), never the svg's own classes.
 */

/** Lucide `asterisk` — required-field indicator. */
export const REQUIRED_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M17.196 9 6.804 15"/><path d="m6.804 9 10.392 6"/></svg>`;
