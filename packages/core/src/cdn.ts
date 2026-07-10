// Ty TypeScript Components - CDN Entry Point
// Components ONLY - NO icon data included
// Users can register icons via IconRegistry

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
export { TyDropdown } from './components/dropdown.js'
export { TyMultiselect } from './components/multiselect.js'
export { TySelect } from './components/select.js'
export { TySelectedTags } from './components/selected-tags.js'
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

// Utilities - Including Icon Registry
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

// Resize Observer utilities
export {
  getSize,
  onResize,
  getAllSizes
} from './utils/resize-observer.js'

// Loader registry — global override for the spinner SVG used by loading-aware components
export { setLoaderSvg, getLoaderSvg, resetLoaderSvg } from './utils/loader-registry.js'

export type {
  ElementSize as ResizeSize,
  ResizeCallback
} from './utils/resize-observer.js'

export type {
  Placement,
  PositionResult,
  CleanupFn
} from './utils/positioning.js'

// Version (auto-generated from package.json)
import { VERSION } from './version.js'

// Global API
// Expose window.tyIcons for script tag usage
import { registerIcons, getIcon, hasIcon, getIconNames, getCacheInfo, clearIcons } from './utils/icon-registry.js'
import { getSize as getResizeSize, onResize as subscribeResize, getAllSizes } from './utils/resize-observer.js'
import type { ResizeCallback } from './utils/resize-observer.js'
import { setLoaderSvg as registrySetLoaderSvg, getLoaderSvg as registryGetLoaderSvg, resetLoaderSvg as registryResetLoaderSvg } from './utils/loader-registry.js'

if (typeof window !== 'undefined') {
  window.tyVersion = VERSION
  // One-time load banner — helps consumers confirm which version of the
  // library their page is actually running.
  console.log(
    `%c[tyrell-components]%c v${VERSION}`,
    'color:#06b6d4;font-weight:600',
    'color:inherit;font-weight:400'
  )
  window.tyIcons = {
    register: (icons: Record<string, string>) => {
      registerIcons(icons)
      console.log(`✅ Registered ${Object.keys(icons).length} icons`)
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

  // Loader registry — set once at boot to override the default spinner everywhere
  window.tyLoader = {
    set: (svg: string | null) => registrySetLoaderSvg(svg),
    get: () => registryGetLoaderSvg(),
    reset: () => registryResetLoaderSvg()
  }
}