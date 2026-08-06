// Ty TypeScript Components
// Modern, zero-dependency web components

export { TyButton } from './components/button.js'
export { TyIcon, IconRegistry } from './components/icon.js'
export { TyTag } from './components/tag.js'
export { TyOption } from './components/option.js'
export { TyInput } from './components/input.js'
export { TyCheckbox } from './components/checkbox.js'
export { TySwitch } from './components/switch.js'
export { TyRadio, TyRadioGroup } from './components/radio.js'
export { TyCopy } from './components/copy.js'
export { TyFileUpload } from './components/file-upload.js'
export { TyTextarea } from './components/textarea.js'
export { TyTooltip } from './components/tooltip.js'
export { TyPopup } from './components/popup.js'
export { TyModal } from './components/modal.js'
export { TySelect } from './components/select.js'
export { TySelectedOptions } from './components/selected-tags.js'
export { TySelectedOptions as TySelectedTags } from './components/selected-tags.js'
export { TyTabs } from './components/tabs.js'
export { TyTab } from './components/tab.js'
export { TyWizard } from './components/wizard.js'
export { TyStep } from './components/step.js'
export { TyCalendarMonth } from './components/calendar-month.js'
export { TyCalendarNavigation } from './components/calendar-navigation.js'
export { TyCalendar } from './components/calendar.js'
export { TyDatePicker } from './components/date-picker.js'
export { TyResizeObserver } from './components/resize-observer.js'
export { TyScrollContainer } from './components/scroll-container.js'
export { CustomScrollbar, isCustomScrollbarEnabled } from './utils/custom-scrollbar.js'
export type { CustomScrollbarOptions } from './utils/custom-scrollbar.js'

// Types
export type {
  Flavor,
  Size,
  InputType,
  IconSize,
  IconTempo,
  TyButtonElement,
  TyIconElement,
  TyTagElement,
  TyTagEventDetail,
  TyOptionElement,
  TyInputElement
} from './types/common.js'

export type { TyCheckboxElement } from './components/checkbox.js'
export type { TySwitchElement } from './components/switch.js'
export type { TyRadioElement, TyRadioGroupElement } from './components/radio.js'
export type { TyCopyElement } from './components/copy.js'
export type { TyFileUploadElement } from './components/file-upload.js'
export type { TyTextareaElement } from './components/textarea.js'
export type { TooltipFlavor, TooltipAttributes } from './components/tooltip.js'
export type { PopupAttributes } from './components/popup.js'
export type { ModalAttributes, ModalCloseDetail } from './components/modal.js'
export type { TabsAttributes, TabChangeDetail } from './components/tabs.js'
export type { TabAttributes } from './components/tab.js'
export type { WizardAttributes, WizardStepChangeDetail } from './components/wizard.js'
export type { StepAttributes, StepStatus } from './components/step.js'
export type { DayContentFn, DayClickDetail, CalendarSize } from './components/calendar-month.js'
export type { NavigationChangeDetail } from './components/calendar-navigation.js'
export type { CalendarChangeDetail, CalendarNavigateDetail } from './components/calendar.js'
export type { DatePickerChangeDetail } from './components/date-picker.js'
export type { DayContext } from './utils/calendar-utils.js'

// Resize Observer
export { getSize, onResize, getAllSizes } from './utils/resize-observer.js'
export type { ElementSize, ResizeCallback } from './utils/resize-observer.js'

// Loader registry — global override for the spinner SVG used by loading-aware components
export { setLoaderSvg, getLoaderSvg, resetLoaderSvg } from './utils/loader-registry.js'

// Property capture utilities for React/Reagent compatibility
export {
  capturePreSetProperties,
  getCapturedValues,
  applyPreSetProperties,
  captureAndApplyProperties
} from './utils/property-capture.js'
export type { CapturedProperty, PropertyCaptureOptions, PropertyMap } from './utils/property-capture.js'

// Utilities
export {
  lockScroll,
  unlockScroll,
  forceUnlockAll,
  isLocked,
  isLockedBy,
  getActiveLocks,
  getLockState,
  enableDebug as enableScrollLockDebug,
  disableDebug as disableScrollLockDebug
} from './utils/scroll-lock.js'

export type {
  Placement,
  PositionResult,
  CleanupFn
} from './utils/positioning.js'

// Icons
// Note: Icon libraries moved to separate tyrell-icons package
// Icon registry utility remains in core for registering custom icons

// Version (auto-generated from package.json)
import { VERSION } from './version.js'

// Global API
// Expose window.tyIcons for script tag usage
import { registerIcons, getIcon, hasIcon, getIconNames, getCacheInfo, clearIcons, getCachedIcon } from './utils/icon-registry.js'

// Export icon registry functions for advanced use
export { registerIcons, getIcon, hasIcon, getIconNames, getCacheInfo, clearIcons, getCachedIcon }

// Import resize observer utilities for window API
import { getSize as getResizeSize, onResize as subscribeResize, getAllSizes } from './utils/resize-observer.js'
import type { ElementSize as ResizeSize, ResizeCallback } from './utils/resize-observer.js'

declare global {
  interface Window {
    tyVersion: string
    tyIcons: {
      register: (icons: Record<string, string>) => void
      get: (name: string) => string | undefined
      has: (name: string) => boolean
      list: () => string[]
      cacheInfo: () => Promise<{
        version: string
        cacheName: string
        available: boolean
        iconCount?: number
      }>
      clearCache: () => Promise<void>
    }
    tyResizeObserver: {
      getSize: (id: string) => ResizeSize | undefined
      onResize: (id: string, callback: ResizeCallback) => () => void
      sizes: Record<string, ResizeSize>
    }
    tyLoader: {
      set: (svg: string | null) => void
      get: () => string
      reset: () => void
    }
  }
}

if (typeof window !== 'undefined') {
  window.tyVersion = VERSION
  // One-time load banner — helps consumers confirm which version of the
  // library their page is actually running. Filter in DevTools with
  // "tyrell-components" if it's noisy.
  console.log(
    `%c[tyrell-components]%c v${VERSION}`,
    'color:#06b6d4;font-weight:600',
    'color:inherit;font-weight:400'
  )
  window.tyIcons = {
    register: (icons: Record<string, string>) => {
      const count = Object.keys(icons).length
      registerIcons(icons)

      // Defer logging to not block registration
      setTimeout(() => {
        console.log(`✅ Registered ${count} icons (cached for instant reload)`)
      }, 0)
    },
    get: (name: string) => getIcon(name),
    has: (name: string) => hasIcon(name),
    list: () => getIconNames(),
    cacheInfo: () => getCacheInfo(),
    clearCache: () => clearIcons()
  }
  
  // Resize Observer API
  window.tyResizeObserver = {
    getSize: (id: string) => getResizeSize(id),
    onResize: (id: string, callback: ResizeCallback) => subscribeResize(id, callback),
    get sizes() { return getAllSizes() }
  }
}