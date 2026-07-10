/**
 * Icon Registry System
 * Simple icon storage and retrieval with Cache API persistence
 * PORTED FROM: clj/ty/icons.cljs
 */

import { VERSION } from '../version.js'

/** Icon registry - maps icon names to SVG strings */
const iconRegistry = new Map<string, string>()

/** Watchers for registry changes - now receives Set of changed icon names */
const watchers = new Map<string, (changedIcons: Set<string>) => void>()

/** Track which icons each watcher cares about (for selective notification) */
const watcherIconNames = new Map<string, string>()

/** Pending notifications - batched for performance */
let pendingNotifications: Set<string> | null = null
let notificationTimer: number | null = null

/** Cache API configuration */
const CACHE_NAME = `ty-icons-v${VERSION}`
// Use a fake URL base for Cache API (requires valid URL format)
const CACHE_URL_BASE = 'https://ty-icons.local/'

/** Track in-flight cache reads to avoid duplicate work */
const cacheReadPromises = new Map<string, Promise<string | null>>()

/** Flag to track if old caches have been cleared */
let oldCachesCleared = false

/**
 * Clear old cache versions on first use
 * This runs lazily the first time any icon is requested
 */
async function clearOldCaches(): Promise<void> {
  if (oldCachesCleared || !('caches' in window)) return

  oldCachesCleared = true

  try {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter(name =>
      name.startsWith('ty-icons-v') && name !== CACHE_NAME
    )

    await Promise.all(oldCaches.map(name => caches.delete(name)))

    if (oldCaches.length > 0) {
      console.log(`🗑️  Cleared ${oldCaches.length} old icon cache(s)`)
    }
  } catch (err) {
    console.warn('[ty-icons] Failed to clear old caches:', err)
  }
}

/**
 * Cache an icon in Cache API (non-blocking background operation)
 * @param name Icon name
 * @param svg SVG string
 */
async function cacheIcon(name: string, svg: string): Promise<void> {
  if (!('caches' in window)) return

  try {
    const cache = await caches.open(CACHE_NAME)
    const response = new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml' }
    })
    // Cache API requires valid URLs
    await cache.put(`${CACHE_URL_BASE}${name}`, response)
  } catch (err) {
    // Silent fail - caching is an optimization, not critical
    console.warn(`[ty-icons] Failed to cache icon "${name}":`, err)
  }
}

/**
 * Read icon directly from cache (for immediate rendering)
 * This is the key function that prevents icon twitching!
 * @param name Icon name
 * @returns Promise<string | null> - SVG string from cache or null
 */
export async function getCachedIcon(name: string): Promise<string | null> {
  // Check if we already have a read in progress for this icon
  const existingPromise = cacheReadPromises.get(name)
  if (existingPromise) {
    return existingPromise
  }

  // Create new read promise
  const readPromise = (async () => {
    try {
      // Clear old caches on first cache access
      await clearOldCaches()

      const cache = await caches.open(CACHE_NAME)
      const response = await cache.match(`${CACHE_URL_BASE}${name}`)

      if (response) {
        return await response.text()
      }
    } catch (err) {
      console.warn(`[ty-icons] Failed to read icon "${name}" from cache:`, err)
    }

    return null
  })()

  // Store promise to avoid duplicate work
  cacheReadPromises.set(name, readPromise)

  // Clean up promise after completion
  readPromise.finally(() => {
    cacheReadPromises.delete(name)
  })

  return readPromise
}

/**
 * Register multiple icons at once
 * Always updates memory and notifies watchers immediately
 * Cache update happens in background (only if different from cached version)
 * @param icons Object mapping icon names to SVG strings
 */
export function registerIcons(icons: Record<string, string>): void {
  const changedIcons = new Set<string>()

  Object.entries(icons).forEach(([name, svg]) => {
    // Always set in memory registry (fast, synchronous)
    iconRegistry.set(name, svg)
    changedIcons.add(name)

    // Compare with cache in background to avoid unnecessary cache writes
    /*getCachedIcon(name).then(cachedSvg => {
      // Only write to cache if content actually changed
      if (cachedSvg !== svg) {
        cacheIcon(name, svg).catch(() => {
          // Error already logged in cacheIcon
        })
      }
      // If cachedSvg === svg, skip cache write (already up to date)
    }).catch(() => {
      // No cached version or error reading cache - write new icon
      cacheIcon(name, svg).catch(() => {
        // Error already logged in cacheIcon
      })
    })
    */
  })

  // Notify watchers immediately (synchronous)
  if (changedIcons.size > 0) {
    scheduleNotification(changedIcons)
  }
}

/**
 * Lookup an icon by name from memory
 * NOTE: This does NOT check cache - use getCachedIcon() for that
 * @param name Icon name
 * @returns SVG string or undefined
 */
export function getIcon(name: string): string | undefined {
  return iconRegistry.get(name)
}

/**
 * Check if an icon exists in memory
 * NOTE: This does NOT check cache
 * @param name Icon name
 * @returns true if icon is registered in memory
 */
export function hasIcon(name: string): boolean {
  return iconRegistry.has(name)
}

/**
 * Clear all registered icons from memory and cache
 */
export async function clearIcons(): Promise<void> {
  const allIcons = new Set(iconRegistry.keys())
  iconRegistry.clear()

  // Clear cache
  if ('caches' in window) {
    try {
      await caches.delete(CACHE_NAME)
      oldCachesCleared = false // Allow re-clearing next time
    } catch (err) {
      console.warn('[ty-icons] Failed to clear icon cache:', err)
    }
  }

  scheduleNotification(allIcons)
}

/**
 * Add a watcher for registry changes
 * @param id Unique watcher ID
 * @param iconName Optional icon name to watch (for selective notification)
 * @param callback Function to call when watched icons change
 */
export function addWatcher(
  id: string,
  iconName: string | undefined,
  callback: (changedIcons: Set<string>) => void
): void {
  watchers.set(id, callback)
  if (iconName) {
    watcherIconNames.set(id, iconName)
  }
}

/**
 * Remove a watcher
 * @param id Watcher ID to remove
 */
export function removeWatcher(id: string): void {
  watchers.delete(id)
  watcherIconNames.delete(id)
}

/**
 * Schedule notification for changed icons (batched and deferred)
 */
function scheduleNotification(changedIcons: Set<string>): void {
  // Accumulate changed icons
  if (!pendingNotifications) {
    pendingNotifications = new Set()
  }

  changedIcons.forEach(name => pendingNotifications!.add(name))

  // Cancel existing timer
  if (notificationTimer !== null) {
    clearTimeout(notificationTimer)
  }

  // Schedule notification using requestIdleCallback or setTimeout
  const scheduleCallback = typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 0)

  notificationTimer = scheduleCallback(() => {
    const toNotify = pendingNotifications
    pendingNotifications = null
    notificationTimer = null

    // Only notify if we have icons to notify about
    if (toNotify && toNotify.size > 0) {
      notifyWatchers(toNotify)
    }
  }) as number
}

/**
 * Notify watchers of changed icons (selective notification)
 */
function notifyWatchers(changedIcons: Set<string>): void {
  watchers.forEach((callback, watcherId) => {
    const watchedIcon = watcherIconNames.get(watcherId)

    // If watcher is watching a specific icon, only notify if that icon changed
    if (watchedIcon) {
      if (changedIcons.has(watchedIcon)) {
        callback(new Set([watchedIcon]))
      }
    } else {
      // Watcher wants all changes
      callback(changedIcons)
    }
  })
}

/**
 * Get all registered icon names (memory only, not cache)
 * @returns Array of icon names
 */
export function getIconNames(): string[] {
  return Array.from(iconRegistry.keys())
}

/**
 * Get cache statistics
 * @returns Promise with cache info
 */
export async function getCacheInfo(): Promise<{
  version: string
  cacheName: string
  available: boolean
  iconCount?: number
}> {
  const info = {
    version: VERSION,
    cacheName: CACHE_NAME,
    available: 'caches' in window
  }

  if (!info.available) return info

  try {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    const iconKeys = keys.filter(req => req.url.startsWith(CACHE_URL_BASE))

    return {
      ...info,
      iconCount: iconKeys.length
    }
  } catch (err) {
    console.warn('[ty-icons] Failed to get cache info:', err)
    return info
  }
}
