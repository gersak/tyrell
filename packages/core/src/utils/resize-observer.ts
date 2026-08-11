/**
 * Resize Observer Registry & Callbacks
 * 
 * Provides global registry for element sizes and optional callback subscriptions.
 */

export interface ElementSize {
  width: number
  height: number
}

export type ResizeCallback = (size: ElementSize) => void

const sizes = new Map<string, ElementSize>()
const callbacks = new Map<string, Set<ResizeCallback>>()

/**
 * Get current size for element by ID (sync query)
 * 
 * @example
 * const size = getSize('parent-container')
 * if (size) console.log(`Width: ${size.width}px`)
 */
export function getSize(id: string): ElementSize | undefined {
  return sizes.get(id)
}

/**
 * Subscribe to size changes for element by ID
 * Returns unsubscribe function
 * 
 * @example
 * const unsubscribe = onResize('parent', ({ width, height }) => {
 *   console.log(`Resized to ${width}x${height}`)
 * })
 * // Later: unsubscribe()
 */
export function onResize(id: string, callback: ResizeCallback): () => void {
  if (!callbacks.has(id)) {
    callbacks.set(id, new Set())
  }
  callbacks.get(id)!.add(callback)

  // Call immediately with current size if available
  const current = sizes.get(id)
  if (current) callback(current)

  return () => {
    callbacks.get(id)?.delete(callback)
    if (callbacks.get(id)?.size === 0) {
      callbacks.delete(id)
    }
  }
}

/**
 * Get all registered sizes (for debugging/window API)
 */
export function getAllSizes(): Record<string, ElementSize> {
  return Object.fromEntries(sizes)
}

/**
 * Internal: Update size in registry and notify callbacks
 */
export function updateSize(id: string, width: number, height: number): void {
  sizes.set(id, { width, height })

  const cbs = callbacks.get(id)
  if (cbs) {
    const size = { width, height }
    cbs.forEach(cb => cb(size))
  }
}

/**
 * Internal: Remove size from registry and cleanup callbacks
 */
export function removeSize(id: string): void {
  sizes.delete(id)
  callbacks.delete(id)
}