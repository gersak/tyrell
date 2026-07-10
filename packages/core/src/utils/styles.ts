/**
 * CSS Utilities for Ty Components
 * Handles dynamic CSS loading into Shadow DOM
 */

import type { StyleContent } from '../types/common'

/** Cache of loaded CSSStyleSheet objects */
const styleCache = new Map<string, CSSStyleSheet>()

/**
 * Ensure CSS is loaded into a shadow root
 * Uses CSSStyleSheet API for efficient style sharing
 * 
 * @param shadowRoot - The shadow root to attach styles to
 * @param styleContent - Style content with CSS text and optional ID
 */
export function ensureStyles(
  shadowRoot: ShadowRoot, 
  styleContent: StyleContent
): void {
  const { css, id } = styleContent
  
  // Check cache first
  let sheet: CSSStyleSheet
  
  if (id && styleCache.has(id)) {
    sheet = styleCache.get(id)!
  } else {
    // Create new stylesheet
    sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    
    // Cache it if ID provided
    if (id) {
      styleCache.set(id, sheet)
    }
  }
  
  // Append only if not already adopted
  const existing = shadowRoot.adoptedStyleSheets || []
  if (!existing.includes(sheet)) {
    shadowRoot.adoptedStyleSheets = [...existing, sheet]
  }
}

/**
 * Build CSS class list from properties
 * Filters out falsy values
 * 
 * @param classes - Array of class names or falsy values
 * @returns Space-separated class string
 */
export function buildClassList(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

