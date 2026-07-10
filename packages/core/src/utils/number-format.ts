/**
 * Number Formatting Utilities
 * PORTED FROM: clj/ty/i18n/number.cljs
 * 
 * Uses native Intl.NumberFormat for locale-aware number formatting
 * Supports currency, percent, compact notation, and custom precision
 */

export type NumberFormatType = 'number' | 'currency' | 'percent' | 'compact'

export interface FormatConfig {
  type: NumberFormatType
  locale?: string
  currency?: string
  precision?: number
}

/**
 * Format a number based on configuration
 * 
 * @example
 * ```typescript
 * formatNumber(1234.56, { type: 'currency', currency: 'USD', locale: 'en-US' })
 * // Returns: "$1,234.56"
 * 
 * formatNumber(0.15, { type: 'percent', precision: 2 })
 * // Returns: "15.00%"
 * 
 * formatNumber(1234567, { type: 'compact' })
 * // Returns: "1.2M"
 * ```
 */
export function formatNumber(
  value: number,
  config: FormatConfig
): string {
  const { type, locale = 'en-US', currency = 'USD', precision } = config
  
  const options: Intl.NumberFormatOptions = {}
  
  // Add precision if specified
  if (precision !== undefined) {
    options.minimumFractionDigits = precision
    options.maximumFractionDigits = precision
  }
  
  // Configure based on type
  switch (type) {
    case 'currency':
      options.style = 'currency'
      options.currency = currency
      break
      
    case 'percent':
      options.style = 'percent'
      // Note: Intl.NumberFormat expects decimal (0.15 for 15%)
      // We'll handle the division in the input component
      break
      
    case 'compact':
      options.notation = 'compact'
      options.compactDisplay = 'short'
      break
      
    case 'number':
    default:
      options.style = 'decimal'
      break
  }
  
  const formatter = new Intl.NumberFormat(locale, options)
  const formatted = formatter.format(value)
  
  // Normalize Unicode spaces for better HTML input compatibility
  // Replace narrow no-break space (U+202F) and thin space (U+2009) with regular non-breaking space (U+00A0)
  // This ensures proper rendering in HTML input elements
  return formatted
    .replace(/\u202F/g, '\u00A0')  // Narrow no-break space → non-breaking space
    .replace(/\u2009/g, '\u00A0')  // Thin space → non-breaking space
}

/**
 * Parse a numeric string to a number
 *
 * Simple rule: the last occurring . or , is the decimal separator.
 * Everything else is stripped. This works for both US (1,234.56) and
 * European (1.234,56) input, and for mobile keyboards that use , as decimal.
 *
 * @example
 * ```typescript
 * parseNumericValue("1,234.56") // 1234.56 (last separator is .)
 * parseNumericValue("1.234,56") // 1234.56 (last separator is ,)
 * parseNumericValue("12,50")    // 12.5    (last separator is ,)
 * parseNumericValue("12.50")    // 12.5    (last separator is .)
 * parseNumericValue("1234")     // 1234
 * parseNumericValue("$1,234")   // 1234
 * parseNumericValue("15%")      // 15
 * parseNumericValue("")         // null
 * ```
 */
export function parseNumericValue(value: string): number | null {
  if (!value || value.trim() === '') return null

  // Strip everything except digits, dots, commas, and minus
  let stripped = value
    .replace(/[^\d.,-]/g, '')
    .trim()

  if (stripped === '' || stripped === '-') return null

  // Find the last occurring . or , — that's the decimal separator
  const lastComma = stripped.lastIndexOf(',')
  const lastDot = stripped.lastIndexOf('.')
  const lastSep = Math.max(lastComma, lastDot)

  if (lastSep === -1) {
    // No separators — pure integer
    const parsed = parseFloat(stripped)
    return isNaN(parsed) ? null : parsed
  }

  // Split at the last separator
  const intPart = stripped.slice(0, lastSep).replace(/[.,]/g, '')
  const decPart = stripped.slice(lastSep + 1)

  const parsed = parseFloat(intPart + '.' + decPart)
  return isNaN(parsed) ? null : parsed
}

/**
 * Check if input type requires numeric formatting
 * 
 * @example
 * ```typescript
 * shouldFormat('currency') // true
 * shouldFormat('percent')  // true
 * shouldFormat('text')     // false
 * ```
 */
export function shouldFormat(type: string): boolean {
  return ['number', 'currency', 'percent', 'compact'].includes(type)
}

