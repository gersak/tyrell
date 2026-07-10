/**
 * TySelect Web Component
 *
 * The select control — replaces ty-dropdown and ty-multiselect.
 *
 * Cardinality (native <select> semantics):
 * - default: SINGLE select — scalar value, picking an option closes the popup
 * - `multiple`: multi select — comma value / repeated FormData entries,
 *   options toggle and the popup stays open
 *
 * Skins:
 * - default: form FIELD — full width, --ty-input-* tokens, matches ty-input;
 *   shows the selected label(s) inline
 * - `compact`: content-hugging trigger for toolbars/filter bars; single shows
 *   the selected label, multiple shows placeholder + count badge (pair with
 *   <ty-selected-tags>)
 * - slot="trigger": consumer skin — replaces field/compact chrome entirely,
 *   behavior/ARIA/form participation unchanged
 *
 * - ty-option children (ty-tag also accepted)
 * - Desktop popup with smart positioning, mobile full-screen modal
 * - Search / external-search / debounce, keyboard navigation
 * - Form association: single submits one entry, multiple submits repeated
 *   `name=` entries (HTMX-ready)
 * - change event detail: { value, values, items: [{value, label, flavor}], action, item }
 *   (`value` is a scalar for single, array for multiple)
 *
 * @example
 * ```html
 * <!-- Single select, field skin -->
 * <ty-select label="Robot" name="robot">
 *   <ty-option value="bobo">Bobo Robot</ty-option>
 *   <ty-option value="eywa">EYWA Dataset Example</ty-option>
 * </ty-select>
 *
 * <!-- Multi select, compact skin + out-of-band chips -->
 * <ty-select multiple compact label="Robots" name="robots" id="robots">...</ty-select>
 * <ty-selected-tags for="robots"></ty-selected-tags>
 * ```
 */

import type { Size } from "../types/common.js";
import { ensureStyles } from "../utils/styles.js";
import { multiselectStyles } from "../styles/multiselect.js";
import { selectStyles } from "../styles/select.js";
import { getLoaderSvg } from "../utils/loader-registry.js";
import { lockScroll, unlockScroll } from "../utils/scroll-lock.js";
import { isMobileTouch } from "../utils/mobile.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import {
  CustomScrollbar,
  isCustomScrollbarEnabled,
} from "../utils/custom-scrollbar.js";

// ============================================================================
// Element Hash Utility (for consistent scroll lock IDs)
// ============================================================================

/**
 * Counter for generating unique element IDs
 */
let elementIdCounter = 0;

/**
 * WeakMap to store consistent element hashes
 * Automatically garbage collects when element is destroyed
 */
const elementIds = new WeakMap<object, number>();

/**
 * Get a consistent unique ID for an element
 * Returns the same ID for the same element across multiple calls
 *
 * @param element - The element to hash
 * @returns A consistent numeric hash for the element
 */
function getElementHash(element: object): number {
  let id = elementIds.get(element);
  if (id === undefined) {
    id = ++elementIdCounter;
    elementIds.set(element, id);
  }
  return id;
}

// ============================================================================
// SVG Icons
// ============================================================================

/**
 * Required indicator SVG icon (from Lucide)
 */
const REQUIRED_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-asterisk"><path d="M12 6v12"/><path d="M17.196 9 6.804 15"/><path d="m6.804 9 10.392 6"/></svg>`;

/**
 * Chevron down icon SVG
 */
const CHEVRON_DOWN_SVG = `<svg viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
</svg>`;

/**
 * 'auto' searchable mode: option count above which the search row appears.
 * Short lists scan faster than they search — native <select> has no search.
 */
const SEARCH_AUTO_THRESHOLD = 7;

/**
 * Search (magnifier) icon SVG — popup search input adornment (from Lucide)
 */
const SEARCH_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
</svg>`;

/**
 * Tag data structure
 */
interface TagData {
  value: string;
  text: string;
  element: HTMLElement;
}

/**
 * Component state structure
 */
interface MultiselectState {
  open: boolean;
  search: string;
  highlightedIndex: number;
  filteredTags: TagData[];
  selectedValues: string[];
  mode: "desktop" | "mobile";
}

/**
 * Change event action types
 */
type ChangeAction = "add" | "remove" | "clear" | "set";

/**
 * Selected item info — enough for out-of-band chip rendering
 */
interface SelectedItem {
  value: string;
  label: string;
  flavor: string | null;
}

/**
 * Change event detail. `value` follows cardinality: scalar (or null) for
 * single select, array for multiple — `values` is always the array form.
 */
interface ChangeEventDetail {
  value: string | string[] | null;
  values: string[];
  items: SelectedItem[];
  action: ChangeAction;
  item: string | null;
}

/**
 * Ty Multiselect Component
 */
export class TySelect extends TyComponent<MultiselectState> {
  // ============================================================================
  // PROPERTY CONFIGURATION - Declarative property lifecycle
  // ============================================================================
  protected static properties = {
    value: {
      type: "string" as const,
      visual: true,
      formValue: true,
      emitChange: false,
      default: "",
      coerce: (v: any) => {
        // Handle array input (from React, Reagent, etc.)
        if (Array.isArray(v)) {
          return v.join(",");
        }
        // Handle null/undefined
        if (v === null || v === undefined) {
          return "";
        }
        // String already
        return String(v);
      },
    },
    name: {
      type: "string" as const,
      default: "",
    },
    // Cardinality — native <select> semantics: absent = single select
    multiple: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    // Skin — absent = form field (matches ty-input); present = compact
    // content-hugging trigger (toolbars, filter bars)
    compact: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    placeholder: {
      type: "string" as const,
      visual: true,
      default: "Select...",
    },
    label: {
      type: "string" as const,
      visual: true,
      default: "",
    },
    disabled: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    readonly: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    required: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    externalSearch: {
      type: "boolean" as const,
      visual: true,
      default: false,
      aliases: { "external-search": true },
    },
    // Search row visibility: 'auto' (default) shows it only for long option
    // lists; searchable / searchable="true" forces it on, searchable="false"
    // off. external-search always shows it (the input IS the mechanism).
    searchable: {
      type: "string" as const,
      visual: true,
      default: "auto",
      coerce: (v: any) => {
        if (v === true || v === "" || v === "true") return "always";
        if (v === false || v === "false") return "never";
        return "auto";
      },
    },
    size: {
      type: "string" as const,
      visual: true,
      default: "md",
      validate: (v: any) => ["sm", "md", "lg"].includes(v),
      coerce: (v: any) => {
        if (!["sm", "md", "lg"].includes(v)) {
          console.warn(`[ty-select] Invalid size. Using md.`);
          return "md";
        }
        return v;
      },
    },
    debounce: {
      type: "number" as const,
      default: 0,
      validate: (v: any) => v >= 0 && v <= 5000,
      coerce: (v: any) => {
        const num = Number(v);
        if (isNaN(num)) return 0;
        return Math.max(0, Math.min(5000, num));
      },
    },
    "available-label": {
      type: "string" as const,
      visual: true,
      default: "Available",
    },
    "no-options-message": {
      type: "string" as const,
      visual: true,
      default: "No options available",
    },
    loading: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
  };

  // ============================================================================
  // INTERNAL STATE
  // ============================================================================
  private _name: string = "";
  private _multiple = false;
  private _compact = false;
  private _placeholder: string = "Select...";
  private _label: string = "";
  private _disabled = false;
  private _readonly = false;
  private _required = false;
  private _externalSearch = false;
  private _searchable: "auto" | "always" | "never" = "auto";
  private _loading = false;
  private _scrollLockId: string | null = null;
  private _size: Size = "md";
  private _availableLabel: string = "Available";
  private _noOptionsMessage: string = "No options available";

  // Component state
  private _state: MultiselectState = {
    open: false,
    search: "",
    highlightedIndex: -1,
    filteredTags: [],
    selectedValues: [],
    mode: "desktop", // Updated dynamically on render via syncMode()
  };

  // Event handler references for cleanup
  private _stubClickHandler: ((e: Event) => void) | null = null;
  private _tagClickHandler: ((e: Event) => void) | null = null;
  private _searchInputHandler: ((e: Event) => void) | null = null;
  private _blockSearchClick: ((e: Event) => void) | null = null;
  private _keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  // Debounce properties for search event
  private _debounce: number = 0;
  private _searchDebounceTimer: number | null = null;

  // Custom scrollbar for options list
  private _optionsScrollbar: CustomScrollbar | null = null;

  // MutationObserver for light-DOM children — re-syncs selected tags' visual
  // state when consumers swap tag children (external-search refresh pattern).
  private _childObserver: MutationObserver | null = null;

  // Last single-select display clone — survives external-search option swaps
  // that remove the matching option (and often the clone itself) from the DOM.
  private _selectedClone: HTMLElement | null = null;

  constructor() {
    super(); // TyComponent handles attachInternals() and attachShadow()

    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: multiselectStyles, id: "ty-select-base" });
    ensureStyles(shadow, { css: selectStyles, id: "ty-select" });

    // DON'T render here - wait for onConnect() to initialize values first
    // This matches dropdown.ts pattern and prevents showing empty state
  }

  /**
   * Called when component is connected to DOM
   * TyComponent handles property capture automatically
   */
  protected onConnect(): void {
    // SAFETY: Close any open dialogs to prevent scroll locking
    const shadow = this.shadowRoot!;
    const dialogs = shadow.querySelectorAll("dialog");
    dialogs.forEach((dialog) => {
      if (dialog.open) {
        console.warn("⚠️ Found open dialog on connect, closing it");
        dialog.close();
      }
    });

    // Render FIRST to create DOM structure
    this.render();

    // THEN initialize and sync tags (after DOM exists)
    requestAnimationFrame(() => {
      this.initializeState();
      // Visual updates happen automatically via onPropertiesChanged
    });

    // Observe light-DOM children — re-sync selected state when consumers swap
    // tag children (external-search refresh). syncSelectedTags is idempotent
    // (only acts on tags whose desired-vs-actual selected state differs), so
    // spurious firings caused by our own re-slot work are no-ops.
    this._childObserver = new MutationObserver(() => {
      if (this._state.selectedValues.length > 0) {
        this.syncSelectedTags(this._state.selectedValues);
      }
      // Option count may have crossed the 'auto' searchable threshold
      this.updateSearchVisibility();
      // External-search consumers replace ALL ty-option children — often
      // including our display clone. Rebuild the selection display (idempotent:
      // a clone that already matches is left alone, so no observer loop).
      this.updateSelectionDisplay();
    });
    this._childObserver.observe(this, { childList: true });
  }

  /**
   * Called when component is disconnected from DOM
   * Clean up event listeners and timers
   */
  protected onDisconnect(): void {
    // CRITICAL: Close all dialogs to prevent scroll locking
    const shadow = this.shadowRoot!;
    const dialogs = shadow.querySelectorAll("dialog");
    dialogs.forEach((dialog) => {
      if (dialog.open) {
        dialog.close();
      }
    });

    // Clean up document-level listeners
    if (this._keyboardHandler) {
      document.removeEventListener("keydown", this._keyboardHandler);
      this._keyboardHandler = null;
    }

    // Clear any pending debounce timer
    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = null;
    }

    // Cleanup custom scrollbar
    this._destroyOptionsScrollbar();

    // Disconnect children observer
    if (this._childObserver) {
      this._childObserver.disconnect();
      this._childObserver = null;
    }
  }

  /**
   * Called when properties change
   * Handle state synchronization BEFORE render
   */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case "value":
          const selectedValues = this.parseValue(newValue);
          this._state.selectedValues = selectedValues;

          // CRITICAL: Only sync tags if we're connected and tags exist
          // During initial property setup (before onConnect), tags don't exist yet
          if (this.isConnected && this.shadowRoot) {
            this.syncSelectedTags(selectedValues);
            this.updateSelectionDisplay();
            this.updateMobileSelectedState();
          }
          // (not-yet-connected: sync deferred to initializeState)
          break;
        case "name":
          this._name = newValue || "";
          break;
        case "multiple":
          this._multiple = newValue;
          // Dropping to single with a multi selection: keep only the first
          if (!newValue && this._state.selectedValues.length > 1) {
            this.updateComponentValue(
              [this._state.selectedValues[0]],
              false,
              "set",
              null,
            );
          }
          break;
        case "compact":
          this._compact = newValue;
          break;
        case "placeholder":
          this._placeholder = newValue || "Select...";
          if (this.isConnected && this.shadowRoot)
            this.updateSelectionDisplay();
          break;
        case "label":
          this._label = newValue || "";
          break;
        case "disabled":
          this._disabled = newValue;
          break;
        case "readonly":
          this._readonly = newValue;
          break;
        case "required":
          this._required = newValue;
          break;
        case "externalSearch":
          this._externalSearch = newValue;
          break;
        case "searchable":
          this._searchable = newValue;
          if (this.isConnected && this.shadowRoot)
            this.updateSearchVisibility();
          break;
        case "size":
          this._size = newValue;
          break;
        case "debounce":
          this._debounce = newValue;
          break;
        case "available-label":
          this._availableLabel = newValue || "Available";
          break;
        case "no-options-message":
          this._noOptionsMessage = newValue || "No options available";
          break;
        case "loading":
          this._loading = newValue;
          this.applyLoadingState();
          break;
      }
    }
  }

  /**
   * Toggle the loading visual state on the open popup.
   * Replaces the available-options area with a centered spinner; search input stays usable.
   * Pulls the latest registered loader SVG on each call so registry changes
   * take effect on the next loading toggle.
   */
  private applyLoadingState(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    const svg = this._loading ? getLoaderSvg() : null;
    shadow.querySelectorAll(".dropdown-options-wrapper").forEach((wrapper) => {
      wrapper.classList.toggle("loading", this._loading);
      if (this._loading) {
        wrapper.setAttribute("aria-busy", "true");
        const spinner = wrapper.querySelector(".dropdown-loading-spinner");
        if (spinner && svg) spinner.innerHTML = svg;
      } else {
        wrapper.removeAttribute("aria-busy");
      }
    });
  }

  /**
   * Get the form value for this component
   * Returns FormData with multiple entries (HTMX standard)
   */
  protected getFormValue(): FormDataEntryValue | FormData | null {
    const selectedValues = this._state.selectedValues;

    if (this._name && selectedValues.length > 0) {
      // Single select submits one plain entry
      if (!this._multiple) return selectedValues[0];

      // Multiple submits repeated `name=` entries (HTMX standard)
      const formData = new FormData();
      selectedValues.forEach((value) => {
        formData.append(this._name, value);
      });
      return formData;
    }

    return null;
  }

  /**
   * Parse multiselect value (comma-separated string to array)
   */
  private parseValue(value: string | null): string[] {
    // Defensive check: ensure value is actually a string before calling .trim()
    if (!value || typeof value !== "string" || value.trim() === "") return [];
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
  }

  /**
   * Initialize component state from attributes
   * Reads from both property and attribute (like ClojureScript version)
   */
  private initializeState(): void {
    const initialValue = this.getProperty("value") || "";

    if (initialValue) {
      // Explicit value provided - sync tags directly
      // DON'T use updateComponentValue() because the property is already set!
      const selectedValues = this.parseValue(initialValue);

      // Update internal state
      this._state.selectedValues = selectedValues;

      // Sync the tags to match the property value
      this.syncSelectedTags(selectedValues);

      // Update the visual display
      this.updateSelectionDisplay();
      this.updateMobileSelectedState();
    } else {
      // No explicit value - check for pre-selected tags
      const allTags = this.getTagElements();

      const preSelectedTags = allTags
        .filter((tag) => tag.hasAttribute("selected"))
        .map((tag) => this.getTagData(tag).value);

      if (preSelectedTags.length > 0) {
        // Set the property value and sync (updateComponentValue handles everything)
        this.updateComponentValue(preSelectedTags, false);
      }
    }
  }

  // ============================================================================
  // TAG MANAGEMENT METHODS (Phase 2)
  // ============================================================================

  /**
   * Get all option elements from the component (ty-option preferred, ty-tag accepted)
   */
  private getTagElements(): HTMLElement[] {
    // :not([cloned]) — the single-select display clone (slot="selected")
    // lives in our light DOM too and must never count as an option
    return Array.from(
      this.querySelectorAll("ty-option:not([cloned]), ty-tag:not([cloned])"),
    ) as HTMLElement[];
  }

  /**
   * Extract value and text from a ty-tag element
   */
  private getTagData(element: HTMLElement): TagData {
    // Get value from either property or attribute
    const value =
      (element as any).value ||
      element.getAttribute("value") ||
      element.textContent ||
      "";
    // Display label: explicit label attribute wins over textContent —
    // native <option label> semantics; lets rich options declare clean text
    const text =
      element.getAttribute("label") || element.textContent || "";

    return { value, text, element };
  }

  /**
   * Select an option - attribute only. The option stays in the list with
   * selected styling; chips are rendered out-of-band (ty-selected-tags).
   */
  private selectTag(tag: HTMLElement): void {
    tag.setAttribute("selected", "");
  }

  /**
   * Deselect an option - attribute only.
   */
  private deselectTag(tag: HTMLElement): void {
    tag.removeAttribute("selected");
  }

  /**
   * Get array of currently selected values from tags (ALWAYS reads from DOM)
   */
  private getSelectedValues(): string[] {
    return this.getTagElements()
      .filter((tag) => tag.hasAttribute("selected"))
      .map((tag) => this.getTagData(tag).value)
      .filter((value) => value !== "");
  }

  /**
   * Sync tag selection states with desired values
   */
  private syncSelectedTags(selectedValues: string[]): void {
    const selectedSet = new Set(selectedValues);
    const tags = this.getTagElements();

    tags.forEach((tag) => {
      const tagValue = this.getTagData(tag).value;
      const shouldBeSelected = selectedSet.has(tagValue);
      const isSelected = tag.hasAttribute("selected");

      if (shouldBeSelected && !isSelected) {
        this.selectTag(tag);
      } else if (!shouldBeSelected && isSelected) {
        this.deselectTag(tag);
      }
    });
  }

  /**
   * Central update function - synchronizes everything
   * Uses TyComponent's property system for proper lifecycle
   */
  private updateComponentValue(
    newValues: string[],
    dispatchChange: boolean = false,
    action: ChangeAction = "set",
    item: string | null = null,
  ): void {
    const oldValues = this.getSelectedValues();

    const valueStr = newValues.join(",");

    // Only update if changed
    if (JSON.stringify(newValues.sort()) !== JSON.stringify(oldValues.sort())) {
      // Use TyComponent's property system - this will trigger:
      // 1. onPropertiesChanged() → syncs tags via syncSelectedTags()
      // 2. onPropertiesChanged() → updates placeholder via updateSelectionDisplay()
      // 3. updateFormValue() → automatic (formValue: true in config)
      // 4. render() → automatic if visual properties changed
      this.setProperty("value", valueStr);

      // Dispatch change event (with rich items for out-of-band chip rendering)
      if (dispatchChange) {
        this.dispatchChangeEvent({
          // Scalar for single select, array for multiple
          value: this._multiple ? [...newValues] : (newValues[0] ?? null),
          values: newValues,
          items: this.getSelectedItems(newValues),
          action,
          item,
        });
      }
    }
  }

  /**
   * Build rich item info for values, read off the matching option elements
   */
  private getSelectedItems(values: string[]): SelectedItem[] {
    const byValue = new Map(
      this.getTagElements().map((el) => [this.getTagData(el).value, el]),
    );
    return values.map((value) => {
      const el = byValue.get(value);
      return {
        value,
        // label attribute wins (native <option label> semantics)
        label: el?.getAttribute("label") || el?.textContent?.trim() || value,
        flavor: el?.getAttribute("flavor") ?? null,
      };
    });
  }

  // ============================================================================
  // DROPDOWN METHODS (Phase 3 & 4)
  // ============================================================================

  /**
   * Calculate and set dropdown position with smart direction detection
   */
  private calculatePosition(): void {
    const shadow = this.shadowRoot!;
    const stub = shadow.querySelector(".multiselect-stub") as HTMLElement;
    const dialog = shadow.querySelector(
      ".dropdown-dialog",
    ) as HTMLDialogElement;

    if (!stub || !dialog) return;

    const stubRect = stub.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Get dialog dimensions (it's already shown with showModal).
    // Cap the estimate: with hundreds of options the raw measurement can be
    // the uncapped content height, which made "fits below?" always false.
    // 440px ≈ options max-height (24rem) + search header.
    const MAX_POPUP_ESTIMATE = 440;
    const dialogRect = dialog.getBoundingClientRect();
    const estimatedHeight = Math.min(
      dialogRect.height || 200,
      MAX_POPUP_ESTIMATE,
    );

    const padding = 8;
    const wrapPadding = 20;

    // Popup width is independent of the trigger — a small button trigger still
    // gets a usable list. Overridable via --ty-select-popup-width.
    const cssWidth = parseFloat(
      getComputedStyle(this).getPropertyValue("--ty-select-popup-width"),
    );
    const popupWidth = !isNaN(cssWidth)
      ? cssWidth
      : Math.max(stubRect.width, 320);

    // Available space calculations
    const spaceBelow = viewportHeight - stubRect.bottom;
    const spaceAbove = stubRect.top;

    // Smart direction logic: below when it fits — and when neither side
    // fits, take the side with MORE room instead of blindly flipping up
    // (a field near the viewport top used to clip the popup off-screen).
    const positionBelow =
      spaceBelow >= estimatedHeight + padding || spaceBelow >= spaceAbove;

    // Anchor to the trigger's left edge, clamped into the viewport
    const x = Math.max(
      padding - wrapPadding,
      Math.min(
        stubRect.left - wrapPadding,
        viewportWidth - popupWidth - wrapPadding - padding,
      ),
    );

    // Open below (or above) the trigger — never covering it
    const gap = 4;
    const y = positionBelow
      ? stubRect.bottom + gap - wrapPadding
      : viewportHeight - stubRect.top + gap - wrapPadding;

    const width = popupWidth + wrapPadding + wrapPadding;

    // Set CSS variables for positioning
    this.style.setProperty("--dropdown-x", `${x}px`);
    this.style.setProperty("--dropdown-y", `${y}px`);
    this.style.setProperty("--dropdown-width", `${width}px`);
    this.style.setProperty("--dropdown-offset-x", "0px");
    this.style.setProperty("--dropdown-offset-y", "0px");
    this.style.setProperty("--dropdown-padding", `${wrapPadding}px`);

    // Set direction classes for CSS styling
    if (positionBelow) {
      dialog.classList.add("position-below");
      dialog.classList.remove("position-above");
    } else {
      dialog.classList.add("position-above");
      dialog.classList.remove("position-below");
    }

    // Optional: Store direction for debugging
    this.style.setProperty(
      "--dropdown-direction",
      positionBelow ? "below" : "above",
    );
  }

  // ============================================================================
  // CUSTOM SCROLLBAR FOR OPTIONS
  // ============================================================================

  private _setupOptionsScrollbar(): void {
    if (!isCustomScrollbarEnabled()) return;

    const shadow = this.shadowRoot!;
    const optionsDiv = shadow.querySelector(".dropdown-options") as HTMLElement;
    const optionsWrapper = shadow.querySelector(
      ".dropdown-options-wrapper",
    ) as HTMLElement;
    if (!optionsDiv || !optionsWrapper) return;

    this._destroyOptionsScrollbar();

    optionsDiv.classList.add("ty-custom-scroll");
    this._optionsScrollbar = new CustomScrollbar(optionsDiv, {
      vertical: true,
    });

    if (this._optionsScrollbar.trackY) {
      optionsWrapper.appendChild(this._optionsScrollbar.trackY);
    }
  }

  private _destroyOptionsScrollbar(): void {
    if (this._optionsScrollbar) {
      this._optionsScrollbar.trackY?.remove();
      this._optionsScrollbar.destroy();
      this._optionsScrollbar = null;
    }
  }

  /**
   * Open dropdown dialog (desktop mode)
   *
   * `<dialog>.showModal()` puts the dialog in the top layer with a backdrop, but
   * does NOT prevent the page behind it from scrolling. We use the shared scroll
   * lock utility (overflow:hidden on <html>) to keep wheel/touch scrolling from
   * leaking through to the body — same behavior <ty-dropdown> and <ty-modal>
   * implement.
   */
  private openDropdown(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(
      ".dropdown-dialog",
    ) as HTMLDialogElement;
    if (!dialog) return;

    // Lock body scroll while dropdown is open
    const lockId = `multiselect-${this.id || "anon"}-${getElementHash(this)}`;
    this._scrollLockId = lockId;
    lockScroll(lockId);

    // Show modal
    dialog.showModal();
    dialog.classList.add("open");

    // Position dropdown AFTER showing modal
    this.calculatePosition();

    // Update component state
    this._state.open = true;

    // Update visual states
    const chevron = shadow.querySelector(".dropdown-chevron");
    if (chevron) chevron.classList.add("open");

    const searchChevron = shadow.querySelector(".dropdown-search-chevron");
    if (searchChevron) searchChevron.classList.add("open");

    // Initialize options state
    const tags = this.getTagElements().map((el) => this.getTagData(el));
    this._state.filteredTags = tags;
    this._state.highlightedIndex = -1;

    // Ensure options area is visible (may have been hidden from previous search)
    this.updateOptionsVisibility(true);

    // Setup custom scrollbar on options
    this._setupOptionsScrollbar();

    // Focus search input (when the search row is shown)
    const searchInput = shadow.querySelector(
      ".dropdown-search-input",
    ) as HTMLInputElement;
    if (searchInput && this.shouldShowSearch()) {
      setTimeout(() => searchInput.focus(), 100);
    }

    // Lifecycle event (also fires empty search if external-search)
    this.fireOpenEvent();
  }

  /**
   * Close dropdown dialog (desktop mode)
   */
  private closeDropdown(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(
      ".dropdown-dialog",
    ) as HTMLDialogElement;

    if (!dialog) return;

    // Destroy custom scrollbar
    this._destroyOptionsScrollbar();

    // Close dialog
    dialog.classList.remove("open");
    dialog.classList.remove("position-above");
    dialog.classList.remove("position-below");
    dialog.close();

    // Unlock body scroll (paired with the lock in openDropdown)
    if (this._scrollLockId) {
      unlockScroll(this._scrollLockId);
      this._scrollLockId = null;
    }

    // Update state
    this._state.open = false;
    this._state.highlightedIndex = -1;

    // Update visual states
    const chevron = shadow.querySelector(".dropdown-chevron");
    if (chevron) chevron.classList.remove("open");

    const searchChevron = shadow.querySelector(".dropdown-search-chevron");
    if (searchChevron) searchChevron.classList.remove("open");

    // Reset search and restore all tags
    const hadQuery = this._state.search !== "";
    this._state.search = "";
    const searchInput = shadow.querySelector(
      ".dropdown-search-input",
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = "";
    }

    if (this._externalSearch) {
      // External mode — notify consumer so it can reset its own filtered state.
      // Bypass the debounce timer (which would delay the clear by `debounce` ms);
      // close-time should be immediate so the consumer's filtered state syncs
      // before the dropdown reopens. Only fire if there was actually a query.
      if (hadQuery) {
        if (this._searchDebounceTimer !== null) {
          clearTimeout(this._searchDebounceTimer);
          this._searchDebounceTimer = null;
        }
        this.fireSearchEvent("");
      }
    } else {
      // Internal mode — restore visibility of all tags ourselves
      const allTags = this.getTagElements().map((el) => this.getTagData(el));
      this._state.filteredTags = allTags;
      this.updateTagVisibility(allTags, allTags);
      this.clearHighlights(allTags);
    }

    // Lifecycle event
    this.fireCloseEvent();
  }

  /**
   * Open mobile modal (mobile mode)
   * Now using <dialog> element for native z-index management
   */
  private openMobileModal(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(".mobile-dialog") as HTMLDialogElement;
    if (!dialog) return;

    // Lock body scroll while mobile modal is open
    const lockId = `multiselect-${this.id || "anon"}-${getElementHash(this)}`;
    this._scrollLockId = lockId;
    lockScroll(lockId);

    // Show dialog using native API (handles z-index automatically)
    dialog.showModal();
    dialog.classList.add("open");

    // Update component state
    this._state.open = true;

    // Initialize options state
    const tags = this.getTagElements().map((el) => this.getTagData(el));
    this._state.filteredTags = tags;

    // Focus search input (when the search row is shown)
    const searchInput = shadow.querySelector(
      ".mobile-search-input",
    ) as HTMLInputElement;
    if (searchInput && this.shouldShowSearch()) {
      // Small delay to ensure dialog is ready
      setTimeout(() => searchInput.focus(), 100);
    }

    // Update state after slots are ready
    requestAnimationFrame(() => {
      this.updateMobileSelectedState();
    });

    // Lifecycle event (also fires empty search if external-search)
    this.fireOpenEvent();
  }

  /**
   * Close mobile modal (mobile mode)
   * Now using <dialog> element for native management
   */
  private closeMobileModal(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(".mobile-dialog") as HTMLDialogElement;
    if (!dialog) return;

    // Close immediately — ::backdrop doesn't support transitions
    dialog.classList.remove("open");
    dialog.close();

    // Unlock body scroll (paired with the lock in openMobileModal)
    if (this._scrollLockId) {
      unlockScroll(this._scrollLockId);
      this._scrollLockId = null;
    }

    // Update state
    this._state.open = false;
    this._state.highlightedIndex = -1;

    // Reset search
    const hadQuery = this._state.search !== "";
    this._state.search = "";
    const searchInput = shadow.querySelector(
      ".mobile-search-input",
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = "";
    }

    if (this._externalSearch) {
      // External mode — notify consumer that the search was cleared on close
      // (bypass debounce, see desktop close path for rationale).
      if (hadQuery) {
        if (this._searchDebounceTimer !== null) {
          clearTimeout(this._searchDebounceTimer);
          this._searchDebounceTimer = null;
        }
        this.fireSearchEvent("");
      }
    } else {
      // Internal mode — unhide all tags ourselves
      const allTags = this.getTagElements();
      allTags.forEach((el) => el.removeAttribute("hidden"));
    }

    // Lifecycle event
    this.fireCloseEvent();
  }

  // ============================================================================
  // EVENT HANDLERS (Phase 5 & 6)
  // ============================================================================

  private handleStubClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    if (this._disabled || this._readonly) {
      return;
    }

    this.openDropdown();
  }

  private handleTagClick(e: Event): void {
    const target = e.target as HTMLElement;

    // Find the option element (ty-option or ty-tag)
    const tag = target.closest("ty-option, ty-tag") as HTMLElement | null;

    if (!tag || tag.hasAttribute("disabled")) return;

    e.preventDefault();
    e.stopPropagation();

    const tagValue = this.getTagData(tag).value;
    const currentValues = this.getSelectedValues();

    // Single select: picking replaces the selection and closes the popup
    // (native <select> semantics — re-picking the same option just closes)
    if (!this._multiple) {
      this.updateComponentValue([tagValue], true, "set", tagValue);
      if (this._state.mode === "mobile") {
        this.closeMobileModal();
      } else {
        this.closeDropdown();
      }
      return;
    }

    // Multiple: toggle — clicking a selected option deselects it
    if (tag.hasAttribute("selected")) {
      const newValues = currentValues.filter((v) => v !== tagValue);
      this.updateComponentValue(newValues, true, "remove", tagValue);
    } else {
      this.updateComponentValue(
        [...currentValues, tagValue],
        true,
        "add",
        tagValue,
      );
    }
  }

  private blockSearchClick(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
  }

  private handleSearchInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    const query = target.value;

    // Update search state
    this._state.search = query;

    if (this._externalSearch) {
      // External (remote) search: parent owns filtering — delegate via event.
      // Tag visibility is left untouched; consumer is expected to update children.
      this.dispatchSearchEvent(query);
      return;
    }

    // Internal search: filter ALL options locally — selected ones stay visible
    // (with selected styling) so they can be toggled off while searching
    const allTags = this.getTagElements().map((el) => this.getTagData(el));
    const filtered = this.filterTags(allTags, query);

    // Update state
    this._state.filteredTags = filtered;
    this._state.highlightedIndex = -1;

    // Update visibility
    this.updateTagVisibility(filtered, allTags);

    // Hide options area if no results (desktop)
    this.updateOptionsVisibility(filtered.length > 0);

    // Refresh mobile count + empty-state to reflect filtered visibility
    this.updateMobileSelectedState();

    // Clear highlights
    this.clearHighlights(allTags);
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (!this._state.open) return;

    const shadow = this.shadowRoot!;
    const searchInput = shadow.querySelector(
      ".dropdown-search-input",
    ) as HTMLInputElement;
    const target = e.target as HTMLElement;

    // Only handle navigation keys when dropdown is open and either:
    // 1. Event comes from search input, OR
    // 2. Event comes from document but search input is not focused
    const shouldHandle =
      target === searchInput || document.activeElement !== searchInput;

    if (!shouldHandle) return;

    // Get current state values
    const filteredTags = this._state.filteredTags;
    const tagsCount = filteredTags.length;
    const currentHighlightedIndex = this._state.highlightedIndex;

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        this.closeDropdown();
        break;

      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        // Select highlighted tag if any
        if (
          currentHighlightedIndex >= 0 &&
          currentHighlightedIndex < tagsCount
        ) {
          const tag = filteredTags[currentHighlightedIndex];
          this.handleTagClick({ target: tag.element } as any);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        let newIndexUp: number;

        if (tagsCount === 0) {
          newIndexUp = -1;
        } else if (currentHighlightedIndex === -1) {
          // Nothing highlighted, go to last tag
          newIndexUp = tagsCount - 1;
        } else if (currentHighlightedIndex === 0) {
          // At first tag, wrap to last
          newIndexUp = tagsCount - 1;
        } else {
          // Move up one
          newIndexUp = currentHighlightedIndex - 1;
        }

        this._state.highlightedIndex = newIndexUp;
        this.highlightTag(filteredTags, newIndexUp);
        break;

      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        let newIndexDown: number;

        if (tagsCount === 0) {
          newIndexDown = -1;
        } else if (currentHighlightedIndex === -1) {
          // Nothing highlighted, go to first tag
          newIndexDown = 0;
        } else if (currentHighlightedIndex === tagsCount - 1) {
          // At last tag, wrap to first
          newIndexDown = 0;
        } else {
          // Move down one
          newIndexDown = currentHighlightedIndex + 1;
        }

        this._state.highlightedIndex = newIndexDown;
        this.highlightTag(filteredTags, newIndexDown);
        break;
    }
  }

  // ============================================================================
  // SEARCH & FILTERING HELPERS (Phase 6)
  // ============================================================================

  /**
   * Filter tags based on search query
   */
  private filterTags(tags: TagData[], query: string): TagData[] {
    if (!query || query.trim() === "") {
      return tags;
    }

    const searchLower = query.toLowerCase();
    return tags.filter(({ text }) => text.toLowerCase().includes(searchLower));
  }

  /**
   * Update visibility of tags based on filtered list
   */
  private updateTagVisibility(
    filteredTags: TagData[],
    allTags: TagData[],
  ): void {
    const visibleValues = new Set(filteredTags.map((tag) => tag.value));

    allTags.forEach(({ value, element }) => {
      if (visibleValues.has(value)) {
        element.removeAttribute("hidden");
      } else {
        element.setAttribute("hidden", "");
      }
    });
  }

  /**
   * Show/hide the dropdown options area
   */
  private updateOptionsVisibility(hasOptions: boolean): void {
    const shadow = this.shadowRoot!;
    const options = shadow.querySelector(".dropdown-options") as HTMLElement;
    if (options) {
      options.style.display = hasOptions ? "" : "none";
    }
  }

  /**
   * Clear all tag highlights
   */
  private clearHighlights(tags: TagData[]): void {
    tags.forEach(({ element }) => {
      element.removeAttribute("highlighted");
    });
  }

  /**
   * Highlight tag at specific index
   */
  private highlightTag(tags: TagData[], index: number): void {
    this.clearHighlights(tags);

    if (index >= 0 && index < tags.length) {
      const { element } = tags[index];
      element.setAttribute("highlighted", "");

      // Scroll into view
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }

  /**
   * Dispatch search event for external search handling
   * With optional debounce support
   */
  private dispatchSearchEvent(query: string): void {
    // Clear existing timer
    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = null;
    }

    // If debounce is set, debounce the event
    if (this._debounce > 0) {
      this._searchDebounceTimer = window.setTimeout(() => {
        this.fireSearchEvent(query);
        this._searchDebounceTimer = null;
      }, this._debounce);
    } else {
      // Fire immediately if no debounce
      this.fireSearchEvent(query);
    }
  }

  /**
   * Fire the actual search event
   */
  private fireSearchEvent(query: string): void {
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: {
          query,
          element: this,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Dispatch lifecycle events for popup open/close.
   * On open with external-search, also fire a `search` event with an empty
   * query so consumers have a clean hook to reset/refetch the option list.
   */
  private fireOpenEvent(): void {
    this.dispatchEvent(
      new CustomEvent("open", {
        detail: { mode: this._state.mode, element: this },
        bubbles: true,
        composed: true,
      }),
    );
    if (this._externalSearch) {
      this.fireSearchEvent("");
    }
  }

  private fireCloseEvent(): void {
    this.dispatchEvent(
      new CustomEvent("close", {
        detail: { mode: this._state.mode, element: this },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ============================================================================
  // CHANGE EVENT DISPATCHING (Phase 5)
  // ============================================================================

  /**
   * Dispatch custom change event
   */
  private dispatchChangeEvent(detail: ChangeEventDetail): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  // ============================================================================
  // RENDERING
  // ============================================================================

  /**
   * Main render method (required by TyComponent)
   * Delegates to mode-specific renderer
   */
  protected render(): void {
    // Sync mode on every render so rotation/resize is picked up
    this._state.mode = isMobileTouch() ? "mobile" : "desktop";

    if (this._state.mode === "mobile") {
      this.renderMobile();
    } else {
      this.renderDesktop();
    }

    this.updateSearchVisibility();

    // Loading wrapper is rendered dynamically — re-apply each render
    this.applyLoadingState();
  }

  /**
   * When a consumer slots their own trigger (slot="trigger"), strip the
   * default field chrome so the trigger is styled entirely by the consumer.
   */
  private setupTriggerSlot(): void {
    const shadow = this.shadowRoot!;
    const stub = shadow.querySelector(".multiselect-stub");
    const slot = shadow.querySelector(
      'slot[name="trigger"]',
    ) as HTMLSlotElement | null;
    if (!stub || !slot) return;
    const sync = () =>
      stub.classList.toggle(
        "custom-trigger",
        slot.assignedElements().length > 0,
      );
    slot.addEventListener("slotchange", sync);
    sync();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const shadow = this.shadowRoot!;
    const stub = shadow.querySelector(".multiselect-stub");
    const optionsSlot = shadow.querySelector("#options-slot");
    const searchInput = shadow.querySelector(".dropdown-search-input");

    if (stub) {
      this._stubClickHandler = this.handleStubClick.bind(this);
      stub.addEventListener("click", this._stubClickHandler);
    }

    this.setupTriggerSlot();

    // Add tag click handler to slot
    if (optionsSlot) {
      this._tagClickHandler = this.handleTagClick.bind(this);
      optionsSlot.addEventListener("click", this._tagClickHandler);
    }

    // Add search input handlers
    if (searchInput) {
      this._searchInputHandler = this.handleSearchInput.bind(this);
      this._blockSearchClick = this.blockSearchClick.bind(this);

      searchInput.addEventListener("input", this._searchInputHandler);
      searchInput.addEventListener("click", this._blockSearchClick);
      // searchInput.addEventListener('blur', this._searchBlurHandler)
    }

    // Setup dialog backdrop click handler
    const dialog = shadow.querySelector(
      ".dropdown-dialog",
    ) as HTMLDialogElement;
    if (dialog) {
      dialog.addEventListener("click", (e) => {
        // Only close if clicking directly on the dialog (backdrop), not its children
        if (e.target === dialog) {
          this.closeDropdown();
        }
      });
    }

    // Setup keyboard handler
    this._keyboardHandler = this.handleKeyboard.bind(this);
    document.addEventListener("keydown", this._keyboardHandler);
  }

  /**
   * Build CSS class list for stub
   */
  private buildStubClasses(): string {
    const classes: string[] = [this._size];
    if (this._disabled) classes.push("disabled");
    if (this._compact) classes.push("compact");
    return classes.join(" ");
  }

  /**
   * Render desktop mode with dialog
   */
  private renderDesktop(): void {
    const shadow = this.shadowRoot!;

    // Only set innerHTML and setup listeners if container doesn't exist
    if (!shadow.querySelector(".multiselect-container")) {
      const stubClasses = this.buildStubClasses();

      const labelHtml = this._label
        ? `
        <label class="ty-field-label">
          ${this._label}
          ${this._required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ""}
        </label>
      `
        : "";

      const searchPlaceholder = "Search...";

      shadow.innerHTML = `
        <div class="multiselect-container dropdown-mode-desktop">
          ${labelHtml}
          <div class="dropdown-wrapper">
            <div class="dropdown-stub multiselect-stub ${stubClasses}"
                 ${this._disabled ? "disabled" : ""}>
              <slot name="trigger">
                <slot name="start"></slot>
                <slot name="selected"></slot>
                <span class="dropdown-placeholder">${this._placeholder}</span>
                <span class="select-count" hidden></span>
                <slot name="end"></slot>
                <div class="dropdown-chevron">
                  ${CHEVRON_DOWN_SVG}
                </div>
              </slot>
            </div>
            <dialog class="dropdown-dialog">
              <div class="dropdown-header">
                <div class="dropdown-search-icon" aria-hidden="true">
                  ${SEARCH_ICON_SVG}
                </div>
                <input
                  class="dropdown-search-input ${this._size}"
                  type="text"
                  placeholder="${searchPlaceholder}"
                  ${this._disabled ? "disabled" : ""}
                />
                <div class="dropdown-search-chevron">
                  ${CHEVRON_DOWN_SVG}
                </div>
              </div>
              <div class="dropdown-options-wrapper">
                <div class="dropdown-options">
                  <slot id="options-slot"></slot>
                </div>
                <div class="dropdown-loading" aria-hidden="true">
                  <slot name="loading">
                    <span class="dropdown-loading-spinner"></span>
                    <span class="dropdown-loading-text">Searching…</span>
                  </slot>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      `;

      // Setup event listeners ONCE
      this.setupEventListeners();

      // Don't initialize here - will be done in connectedCallback
      // after properties are set and children are available
    }

    // Always update placeholder visibility on re-render
    this.updateSelectionDisplay();
  }

  /**
   * Render mobile mode with full-screen modal
   * Following dropdown.ts mobile structure
   */
  private renderMobile(): void {
    const shadow = this.shadowRoot!;

    // Only set innerHTML and setup listeners if container doesn't exist
    if (!shadow.querySelector(".multiselect-container")) {
      const stubClasses = this.buildStubClasses();

      const labelHtml = this._label
        ? `
        <label class="ty-field-label">
          ${this._label}
          ${this._required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ""}
        </label>
      `
        : "";

      // Close button SVG (X icon)
      const closeButtonSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>`;

      // Search placeholder: "Search <label>..." or just "Search..."
      const searchPlaceholder = this._label
        ? `Search ${this._label}...`
        : "Search...";

      // Search is always available — only the mode (internal vs external) varies.
      const searchHeaderHtml = `
        <div class="mobile-search-header">
          ${this._label ? `<span class="mobile-header-label">${this._label}</span>` : ""}
          <div class="mobile-header-content">
            <div class="dropdown-search-icon" aria-hidden="true">
              ${SEARCH_ICON_SVG}
            </div>
            <input
              class="mobile-search-input ${this._size}"
              type="text"
              placeholder="${searchPlaceholder}"
              ${this._disabled ? "disabled" : ""}
            />
            <button class="mobile-close-button" type="button" aria-label="Close">
              ${closeButtonSvg}
            </button>
          </div>
        </div>
      `;

      shadow.innerHTML = `
        <div class="multiselect-container dropdown-mode-mobile">
          ${labelHtml}
          <div class="dropdown-wrapper">
            <div class="dropdown-stub multiselect-stub ${stubClasses}"
                 ${this._disabled ? "disabled" : ""}>
              <slot name="trigger">
                <slot name="start"></slot>
                <slot name="selected"></slot>
                <span class="dropdown-placeholder">${this._placeholder}</span>
                <span class="select-count" hidden></span>
                <slot name="end"></slot>
                <div class="dropdown-chevron">
                  ${CHEVRON_DOWN_SVG}
                </div>
              </slot>
            </div>

            <dialog class="mobile-dialog">
              <div class="mobile-dialog-content">

                <!-- HEADER (matches dropdown.ts) -->
                ${searchHeaderHtml}

                <!-- BODY: options list with toggleable selected state -->
                <div class="mobile-body">

                  <!-- AVAILABLE LIST (always visible, takes remaining space) -->
                  <div class="mobile-available-section" data-empty="false">
                    <div class="section-header">
                      <span class="section-title">${this._availableLabel}</span>
                    </div>
                    <div class="section-content dropdown-options-wrapper">
                      <slot id="options-slot"></slot>
                      <div class="empty-state">${this._noOptionsMessage}</div>
                      <div class="dropdown-loading" aria-hidden="true">
                        <slot name="loading">
                          <span class="dropdown-loading-spinner"></span>
                          <span class="dropdown-loading-text">Searching…</span>
                        </slot>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </dialog>
          </div>
        </div>
      `;

      // Setup event listeners ONCE
      this.setupMobileEventListeners();
    }

    // Always update placeholder visibility
    this.updateSelectionDisplay();
  }

  /**
   * Setup event listeners for mobile mode
   * Using <dialog> element - backdrop clicks handled natively
   */
  private setupMobileEventListeners(): void {
    const shadow = this.shadowRoot!;
    const stub = shadow.querySelector(".multiselect-stub");
    const optionsSlot = shadow.querySelector("#options-slot");
    const searchInput = shadow.querySelector(".mobile-search-input");
    const closeButton = shadow.querySelector(".mobile-close-button");
    const dialog = shadow.querySelector(".mobile-dialog") as HTMLDialogElement;

    if (stub) {
      stub.addEventListener("click", (e) => this.handleMobileStubClick(e));
    }

    this.setupTriggerSlot();

    // Add tag click handler to slot
    if (optionsSlot) {
      optionsSlot.addEventListener("click", (e) =>
        this.handleMobileTagClick(e),
      );
    }

    // Add search input handlers (if searchable)
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.handleSearchInput(e));
    }

    // Close button click
    if (closeButton) {
      closeButton.addEventListener("click", () => this.closeMobileModal());
    }

    // Backdrop click to close (native dialog behavior)
    if (dialog) {
      dialog.addEventListener("click", (e) => {
        // Only close if clicking directly on the dialog element (backdrop)
        // Not if clicking on its children (dialog-content)
        if (e.target === dialog) {
          this.closeMobileModal();
        }
      });

      // Also handle Escape key via cancel event
      dialog.addEventListener("cancel", (e) => {
        e.preventDefault(); // Prevent default to handle it our way
        this.closeMobileModal();
      });
    }
  }

  /**
   * Handle mobile stub click - open modal
   */
  private handleMobileStubClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    if (this._disabled || this._readonly) {
      return;
    }

    this.openMobileModal();
  }

  /**
   * Handle mobile tag click - select and potentially close
   */
  private handleMobileTagClick(e: Event): void {
    // Use the same tag click handler as desktop
    // It already handles mobile mode for auto-close
    this.handleTagClick(e);
  }

  /**
   * Update mobile options section state (count, empty state)
   */
  private updateMobileSelectedState(): void {
    if (this._state.mode !== "mobile") return;

    const shadow = this.shadowRoot!;
    const availableSection = shadow.querySelector(".mobile-available-section");

    if (availableSection) {
      // Count *visible* options — options hidden by search filtering count as 0
      const visibleAvailable = this.getTagElements().filter(
        (tag) => !tag.hasAttribute("hidden"),
      ).length;

      availableSection.setAttribute(
        "data-empty",
        String(visibleAvailable === 0),
      );

      // Update available header count
      const availableTitleSpan = shadow.querySelector(
        ".mobile-available-section .section-title",
      );
      if (availableTitleSpan) {
        availableTitleSpan.textContent = `${this._availableLabel} (${visibleAvailable})`;
      }
    }
  }

  /**
   * Update selection display: count badge next to the placeholder
   */
  /**
   * Should the popup show a search row? external-search always (the input is
   * the mechanism); searchable always/never wins otherwise; 'auto' shows it
   * only when the option list is long enough to need filtering.
   */
  private shouldShowSearch(): boolean {
    if (this._externalSearch) return true;
    if (this._searchable === "always") return true;
    if (this._searchable === "never") return false;
    return this.getTagElements().length > SEARCH_AUTO_THRESHOLD;
  }

  /**
   * Toggle the search row (desktop header / mobile input) per shouldShowSearch.
   */
  private updateSearchVisibility(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    const show = this.shouldShowSearch();
    const header = shadow.querySelector(
      ".dropdown-header",
    ) as HTMLElement | null;
    if (header) header.hidden = !show;
    // Mobile keeps its header (label + close button); only the input+icon hide
    const mobileInput = shadow.querySelector(
      ".mobile-search-input",
    ) as HTMLElement | null;
    if (mobileInput) mobileInput.hidden = !show;
    const mobileIcon = shadow.querySelector(
      ".mobile-header-content .dropdown-search-icon",
    ) as HTMLElement | null;
    if (mobileIcon) mobileIcon.hidden = !show;
  }

  /**
   * Selection summary appropriate to cardinality × skin:
   * - single (field or compact): the selected OPTION itself — cloned into
   *   slot="selected" so rich HTML options display intact (dropdown parity);
   *   placeholder when empty
   * - multiple + field: joined labels (ellipsis via CSS), or placeholder
   * - multiple + compact: placeholder + count badge
   */
  private updateSelectionDisplay(): void {
    const shadow = this.shadowRoot!;
    const stub = shadow.querySelector(".multiselect-stub");
    if (!stub) return;

    // Selection comes from STATE, not from scanning option elements —
    // external search replaces the option children, and the selection must
    // survive even when the current results don't include the selected value.
    const values = this._state.selectedValues;
    const count = values.length;
    stub.classList.toggle("has-selection", count > 0);
    stub.classList.toggle("compact", this._compact);

    const badge = stub.querySelector(".select-count") as HTMLElement | null;
    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0 || !this._multiple || !this._compact;
    }

    // Single select: project the selected option into the stub as a clone
    // (rich HTML content survives — same mechanism as ty-dropdown).
    const wantClone = !this._multiple && count > 0 ? values[0] : null;
    this.syncSelectedClone(wantClone);
    stub.classList.toggle("has-clone", wantClone !== null);

    const textEl = stub.querySelector(
      ".dropdown-placeholder",
    ) as HTMLElement | null;
    if (textEl) {
      // The clone replaces the text display entirely in single mode
      textEl.hidden = wantClone !== null;
      const showLabels = count > 0 && this._multiple && !this._compact;
      if (showLabels) {
        textEl.textContent = this.getSelectedItems(values)
          .map((i) => i.label)
          .join(", ");
        textEl.classList.remove("placeholder-shown");
      } else {
        textEl.textContent = this._placeholder;
        textEl.classList.add("placeholder-shown");
      }
    }
  }

  /**
   * Keep exactly one display clone (slot="selected", marked `cloned`) in our
   * light DOM matching the given value — or none. The clone never counts as
   * an option (getTagElements filters [cloned]) and ty-option's own
   * :host([cloned]) styling strips its list-row chrome.
   */
  private syncSelectedClone(value: string | null): void {
    const existing = this.querySelector(
      ':scope > [cloned][slot="selected"]',
    ) as HTMLElement | null;
    if (existing?.getAttribute("value") === value) {
      this._selectedClone = existing;
      return; // already right
    }

    existing?.remove();
    if (value === null) {
      this._selectedClone = null;
      return;
    }

    const option = this.getTagElements().find(
      (el) => this.getTagData(el).value === value,
    );
    if (option) {
      const clone = option.cloneNode(true) as HTMLElement;
      clone.removeAttribute("selected"); // no tick/selected styling in the stub
      clone.setAttribute("slot", "selected");
      clone.setAttribute("cloned", "true");
      this.appendChild(clone);
      this._selectedClone = clone;
    } else if (this._selectedClone?.getAttribute("value") === value) {
      // The option list no longer contains the selection (external search
      // swapped the children — possibly wiping our clone with them). Restore
      // the saved display clone so the selection stays visible.
      const restored = this._selectedClone.cloneNode(true) as HTMLElement;
      this.appendChild(restored);
      this._selectedClone = restored;
    }
  }

  // ============================================================================
  // PUBLIC API - Getters/Setters
  // ============================================================================

  /**
   * Deselect a value programmatically WITH a change event.
   * Used by out-of-band chip displays (ty-selected-tags) so dismissing a chip
   * fires change like any in-popup interaction (HTMX hx-trigger="change" etc.).
   */
  deselectValue(value: string): void {
    const current = this.getSelectedValues();
    if (!current.includes(value)) return;
    this.updateComponentValue(
      current.filter((v) => v !== value),
      true,
      "remove",
      value,
    );
  }

  get value(): string {
    // Always read from DOM - tags with 'selected' attribute are source of truth
    return this.getSelectedValues().join(",");
  }

  set value(val: string) {
    this.setProperty("value", val);
  }

  get name(): string {
    return this.getProperty("name");
  }

  set name(val: string) {
    this.setProperty("name", val);
  }

  get multiple(): boolean {
    return this.getProperty("multiple");
  }

  set multiple(value: boolean) {
    this.setProperty("multiple", value);
  }

  get compact(): boolean {
    return this.getProperty("compact");
  }

  set compact(value: boolean) {
    this.setProperty("compact", value);
  }

  get placeholder(): string {
    return this.getProperty("placeholder");
  }

  set placeholder(val: string) {
    this.setProperty("placeholder", val);
  }

  get label(): string {
    return this.getProperty("label");
  }

  set label(val: string) {
    this.setProperty("label", val);
  }

  get disabled(): boolean {
    return this.getProperty("disabled");
  }

  set disabled(value: boolean) {
    this.setProperty("disabled", value);
  }

  get loading(): boolean {
    return this.getProperty("loading");
  }

  set loading(value: boolean) {
    this.setProperty("loading", value);
  }

  get readonly(): boolean {
    return this.getProperty("readonly");
  }

  set readonly(value: boolean) {
    this.setProperty("readonly", value);
  }

  get required(): boolean {
    return this.getProperty("required");
  }

  set required(value: boolean) {
    this.setProperty("required", value);
  }

  get searchable(): "auto" | "always" | "never" {
    return this.getProperty("searchable");
  }

  set searchable(value: "auto" | "always" | "never" | boolean) {
    this.setProperty("searchable", value);
  }

  get externalSearch(): boolean {
    return this.getProperty("externalSearch");
  }

  set externalSearch(value: boolean) {
    this.setProperty("externalSearch", value);
  }

  get debounce(): number {
    return this.getProperty("debounce");
  }

  set debounce(value: number | string) {
    const numValue = typeof value === "string" ? parseInt(value, 10) : value;
    this.setProperty("debounce", numValue);
  }

  get size(): Size {
    return this.getProperty("size") as Size;
  }

  set size(value: Size) {
    this.setProperty("size", value);
  }

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }
}

// Register the custom element
if (!customElements.get("ty-select")) {
  customElements.define("ty-select", TySelect);
}
