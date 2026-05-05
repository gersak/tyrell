/**
 * Icon Registry Initialization
 * 
 * This demonstrates the recommended pattern for using Ty icons:
 * 1. Import only the icons you need from tyrell-components (tree-shaking!)
 * 2. Register them using window.tyIcons.register() global API
 * 3. Use them throughout your app with <ty-icon name="..." />
 * 
 * Benefits:
 * - Single icon registry (shared with web components)
 * - Perfect tree-shaking (only bundle icons you import)
 * - No duplicate dependencies
 * - TypeScript autocomplete for icon names
 */

// Import all icons used throughout the example app
import {
  // Basic icons
  check,
  heart,
  star,
  home,
  settings,
  user,
  users,
  mail,
  bell,
  searchIcon,
  menuIcon,
  x,
  info,
  calendar,
  moon,
  sun,

  // Navigation icons
  chevronRight,
  chevronLeft,
  chevronDown,
  chevronUp,
  arrowRight,
  externalLink,

  // Action icons
  plus,
  edit,
  save,
  sendIcon,
  download,
  upload,
  trash2,
  refreshCw,
  refreshCcw,
  play,

  // Status icons
  checkCircle,
  xCircle,
  alertCircle,
  alertTriangle,
  helpCircle,

  // Feature icons
  activity,
  book,
  clock,
  code,
  dollarSign,
  filterIcon,
  globe,
  layers,
  layout,
  mapPin,
  monitor,
  palette,
  phone,
  rocket,
  shield,
  square,
  terminal,
  trendingUp,
  zap,
  copy,
  packageIcon,
} from 'tyrell-components/icons/lucide'

/**
 * Register icons at app startup
 * Uses the global window.tyIcons.register API from tyrell-components
 * 
 * Returns a promise that resolves when registration is complete,
 * or rejects if window.tyIcons is not available after timeout.
 */
export function initializeIcons(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.tyIcons) {
      registerIconsNow()
      resolve()
      return
    }

    // Wait for script to load with timeout
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max (50 * 100ms)
    
    const checkInterval = setInterval(() => {
      attempts++
      
      if (window.tyIcons) {
        clearInterval(checkInterval)
        registerIconsNow()
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        console.error('❌ Failed to load window.tyIcons after 5 seconds')
        reject(new Error('window.tyIcons not available'))
      }
    }, 100)
  })
}

function registerIconsNow() {
  // Register all icons used in the example app
  window.tyIcons.register({
    // Basic icons
    check,
    heart,
    star,
    home,
    settings,
    user,
    users,
    mail,
    bell,
    'search': searchIcon,
    x,
    info,
    calendar,
    moon,
    sun,
    'package': packageIcon,
    'copy': copy,
    'menu': menuIcon,

    // Navigation icons
    'chevron-right': chevronRight,
    'chevron-left': chevronLeft,
    'chevron-down': chevronDown,
    'chevron-up': chevronUp,
    'arrow-right': arrowRight,
    'external-link': externalLink,

    // Action icons
    plus,
    edit,
    save,
    'send': sendIcon,
    download,
    upload,
    'trash-2': trash2,
    'refresh-cw': refreshCw,
    'refresh-ccw': refreshCcw,
    play,

    // Status icons
    'check-circle': checkCircle,
    'x-circle': xCircle,
    'alert-circle': alertCircle,
    'alert-triangle': alertTriangle,
    'help-circle': helpCircle,

    // Feature icons
    activity,
    book,
    clock,
    code,
    'dollar-sign': dollarSign,
    'filter': filterIcon,
    globe,
    layers,
    layout,
    'map-pin': mapPin,
    monitor,
    palette,
    phone,
    rocket,
    shield,
    square,
    terminal,
    'trending-up': trendingUp,
    zap,
  })
}

/**
 * TypeScript Declaration
 * Extend the Window interface for TypeScript support
 */
declare global {
  interface Window {
    tyVersion: string
    tyIcons: {
      register: (icons: Record<string, string>) => void
      get: (name: string) => string | undefined
      has: (name: string) => boolean
      list: () => string[]
    }
  }
}