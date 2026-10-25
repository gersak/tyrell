/**
 * TySelect Web Component — THE select control (replaces ty-dropdown/ty-multiselect).
 * Cardinality follows native <select>: default single (scalar value, picking closes
 * the popup), `multiple` toggles options and submits repeated `name=` FormData entries.
 * Skins: default form field, `compact` content-hugging trigger, slot="trigger" custom.
 *
 * The selection is the `value` attribute/property, nothing else. Options are a
 * plain list: the select draws their check through `option.checked`, a
 * property, and never writes selection state onto them. A closed single select
 * shows the picked option itself in its trigger (manual slot assignment), so
 * nothing is added to the children a framework renders. `external-selection` hands
 * the selection to the app: it marks the options it holds `selected`, the
 * select reads those marks and reports picks as `change` events.
 */
import type { Flavor, Size } from "../types/common.js";
import { DEFAULT_SIZE } from "../types/common.js";
import { ensureStyles } from "../utils/styles.js";
import { syncCustomFlavorSheet } from "../utils/flavor-sheet.js";
import { selectBaseStyles, selectCustomFlavorCss } from "../styles/select-base.js";
import { selectStyles } from "../styles/select.js";
import { getLoaderSvg } from "../utils/loader-registry.js";
import { lockScroll, unlockScroll } from "../utils/scroll-lock.js";
import { computeAnchoredPosition, placementToAnchored, type Placement } from "../utils/positioning.js";
import { isMobileTouch } from "../utils/mobile.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import {
  CustomScrollbar,
  isCustomScrollbarEnabled,
} from "../utils/custom-scrollbar.js";
import { REQUIRED_ICON_SVG } from "../utils/icons.js";
import { nativeMessage } from "../utils/validity.js";

/** Ids for labels, listboxes and the scroll lock. */
let selectCount = 0;

/**
 * Option count above which the popup grows a search row: .dropdown-options-wrapper
 * caps at 16rem, about seven rows, so this is where the list starts scrolling.
 */
const SEARCH_AUTO_THRESHOLD = 7;

const CHEVRON_DOWN_SVG = `<svg viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
</svg>`;

/**
 * create-transform="slug": lowercase, spaces → '_', strip anything else
 * non-alphanumeric, collapse/trim stray underscores.
 */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Search (magnifier) icon — popup search input adornment (from Lucide) */
const SEARCH_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
</svg>`;

/** Clear (X) icon — the trigger's × button, mobile chips and close button */
const CLEAR_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;

interface TagData {
  value: string;
  text: string;
  element: HTMLElement;
}

interface SelectState {
  open: boolean;
  search: string;
  highlightedIndex: number;
  filteredTags: TagData[];
  // Fixed when the shadow DOM is built (see build())
  mode: "desktop" | "mobile";
}

type ChangeAction = "add" | "remove" | "clear" | "set" | "create";

/**
 * Detail for the cancelable `create` event — fired before a new option is
 * minted from typed search text (see tryCreateFromSearch). Listeners may
 * mutate `value` (e.g. slugify it) or call preventDefault() to take over
 * entirely (create their own <ty-option>, e.g. after a server round-trip).
 */
interface CreateEventDetail {
  value: string;
  label: string;
}

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
 * With external-selection, `value` is the picked option and `selected` its
 * requested state; the select holds no selection, so `values`/`items` are empty.
 */
interface ChangeEventDetail {
  value: string | string[] | null;
  values: string[];
  items: SelectedItem[];
  action: ChangeAction;
  item: string | null;
  selected?: boolean;
}

/** An option as the select drives it (option.ts): `checked` draws the check, `inTrigger` the trigger look. */
type OptionElement = HTMLElement & { checked?: boolean; inTrigger?: boolean };

/** Assign only on a real change: every assign() is a layout change (WebKit re-checks hover late). */
function assign(slot: HTMLSlotElement | null, nodes: (Element | Text)[]): void {
  if (!slot) return;
  const current = slot.assignedNodes();
  if (current.length === nodes.length && nodes.every((n, i) => current[i] === n)) return;
  slot.assign(...nodes);
}

/** Named slots a child can ask for with its `slot` attribute. */
const NAMED_SLOTS = ["trigger", "start", "end", "loading"];

/** external-selection: the app's `selected` mark, boolean-attribute rules ("false" is off). */
function isMarked(el: HTMLElement): boolean {
  const attr = el.getAttribute("selected");
  return attr !== null && !/^(false|0)$/i.test(attr.trim());
}

/**
 * Ty Select Component
 */
export class TySelect extends TyComponent<SelectState> {
  // assignSlots() places every child
  protected static slotAssignment: SlotAssignmentMode = "manual";

  // PROPERTY CONFIGURATION - Declarative property lifecycle
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
        if (v === null || v === undefined) {
          return "";
        }
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
    // Error line under the field, same as ty-input's; '' clears it.
    // Validation writes it too (submit, reportValidity — utils/validity.ts).
    error: {
      type: "string" as const,
      visual: true,
      default: "",
    },
    // Built-in × clear button in the default/compact trigger, shown once
    // something is selected. Absent under slot="trigger" (it lives in the
    // slot's fallback content). no-clear turns it off, like ty-date-picker.
    noClear: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    // The app filters: typing fires `search`, the app swaps the options
    externalSearch: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    // The app holds the selection: it marks options `selected`, picks fire
    // `change` with { value, selected } and change nothing here
    externalSelection: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    // Enter on unmatched search text mints a new <ty-option> — forces the
    // search row on (same as external-search: the input IS the mechanism).
    allowCreate: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    // Normalizer for the value minted by allow-create (the label keeps the
    // typed text). 'none' (default): value === typed text. 'slug': see slugify.
    createTransform: {
      type: "string" as const,
      visual: false,
      default: "none",
      coerce: (v: any) => (v === "slug" ? "slug" : "none"),
    },
    // The search row appears once the list is long enough to scroll
    // (SEARCH_AUTO_THRESHOLD); not-searchable turns it off. external-search
    // and allow-create keep it on: the input is their mechanism.
    notSearchable: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    // Full placement, same vocabulary as ty-popup/ty-tooltip: a side plus an
    // optional cross-axis alignment ("bottom-end", "top-start", …). A dropdown
    // only lives above or below its trigger, so left/right degrade to auto-side
    // with the alignment kept. None: below when it fits, else the side with
    // more room, start-aligned.
    placement: {
      type: "string" as const,
      visual: true,
      default: "",
    },
    size: {
      type: "string" as const,
      visual: true,
      default: DEFAULT_SIZE,
      validate: (v: any) => ["xs", "sm", "md", "lg", "xl"].includes(v),
      coerce: (v: any) => {
        if (!["xs", "sm", "md", "lg", "xl"].includes(v)) {
          console.warn(`[ty-select] Invalid size. Using ${DEFAULT_SIZE}.`);
          return DEFAULT_SIZE;
        }
        return v;
      },
    },
    // external-search: wait this long after typing before firing `search`
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
    "selected-label": {
      type: "string" as const,
      visual: true,
      default: "Selected",
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
    // Any string is accepted: built-ins get static CSS, other identifiers
    // become custom flavors (see _syncCustomFlavor), garbage degrades to
    // the default look.
    flavor: {
      type: "string" as const,
      visual: true,
      default: "neutral",
    },
  };

  private readonly _uid = ++selectCount;

  private _state: SelectState = {
    open: false,
    search: "",
    highlightedIndex: -1,
    filteredTags: [],
    mode: "desktop",
  };

  private _scrollLockId: string | null = null;
  private _keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private _searchDebounceTimer: number | null = null;
  private _optionsScrollbar: CustomScrollbar | null = null;

  // Options added, removed, renamed or (external-selection) re-marked: render again
  private _childObserver: MutationObserver | null = null;

  private _customFlavorSheet: CSSStyleSheet | null = null;

  // The slotted trigger carrying the error's aria, and the watch that keeps
  // it there (see syncTriggerAria).
  private _ariaTrigger: HTMLElement | null = null;
  private _ariaObserver: MutationObserver | null = null;

  constructor() {
    super(); // TyComponent handles attachInternals() and attachShadow()

    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: selectBaseStyles, id: "ty-select-base" });
    ensureStyles(shadow, { css: selectStyles, id: "ty-select" });
  }

  /** TyComponent renders right after this on the first connect. */
  protected onConnect(): void {
    // Options parsed after the select connected, renamed, re-marked, or our
    // has-trigger stripped by a morph. Our own writes (option.checked,
    // filtered-out) settle after one more pass.
    this._childObserver = new MutationObserver((records) => {
      if (records.some((r) => r.target !== this || r.type !== "attributes" || r.attributeName === "has-trigger")) {
        this.render();
      }
    });
    this._childObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["value", "label", "selected", "hidden", "filtered-out", "has-trigger"],
    });

    this._syncCustomFlavor();

    // Keys while the list is open (handleKeyboard). Capture: the open list is
    // the topmost dialog, so its keys are ours before a ty-popup or ty-modal
    // around it stops them.
    if (!this._keyboardHandler) {
      this._keyboardHandler = this.handleKeyboard.bind(this);
      document.addEventListener("keydown", this._keyboardHandler, true);
    }

    // Moved in the DOM: the options may have changed meanwhile
    if (this._rendered) this.render();
  }

  /** Custom (non-built-in) flavors — see utils/flavor-sheet.ts. */
  private _syncCustomFlavor(): void {
    this._customFlavorSheet = syncCustomFlavorSheet(
      this.shadowRoot!,
      this._customFlavorSheet,
      this.getProperty("flavor"),
      ({ base }) => selectCustomFlavorCss(base),
    );
  }

  protected onDisconnect(): void {
    // Removed while open (e.g. along with the ty-modal around it): close
    // properly, or the scroll lock outlives the element.
    if (this._state.open) this.close();

    if (this._keyboardHandler) {
      document.removeEventListener("keydown", this._keyboardHandler, true);
      this._keyboardHandler = null;
    }

    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = null;
    }

    this._destroyOptionsScrollbar();

    this._childObserver?.disconnect();
    this._childObserver = null;
  }

  /** Handle state synchronization BEFORE render. */
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    for (const { name, newValue } of changes) {
      switch (name) {
        case "flavor":
          this._syncCustomFlavor();
          break;
        case "multiple": {
          // Dropping to single with a multi selection: keep only the first
          const values = this.getSelectedValues();
          if (!newValue && values.length > 1) {
            this.updateComponentValue([values[0]]);
          }
          break;
        }
      }
    }
  }

  /**
   * Toggle the loading visual state on the open popup: a centered spinner in
   * place of the options; the search input stays usable. Reads the loader
   * registry each time, so a newly registered loader shows next time.
   */
  private applyLoadingState(): void {
    const loading: boolean = this.getProperty("loading");
    const svg = loading ? getLoaderSvg() : null;
    this.shadowRoot!.querySelectorAll(".dropdown-options-wrapper").forEach((wrapper) => {
      wrapper.classList.toggle("loading", loading);
      if (loading) {
        wrapper.setAttribute("aria-busy", "true");
        const spinner = wrapper.querySelector(".dropdown-loading-spinner");
        if (spinner && svg) spinner.innerHTML = svg;
      } else {
        wrapper.removeAttribute("aria-busy");
      }
    });
  }

  /** Form value: a plain entry for single, FormData with repeated entries for multiple (HTMX standard). */
  protected getFormValue(): FormDataEntryValue | FormData | null {
    const name = this.name;
    // external-selection: the app holds the selection and submits it itself
    if (!name || this.externalSelection) return null;

    const selectedValues = this.getSelectedValues();
    if (!this.multiple) {
      // Native fidelity: nothing chosen still submits name= (like a <select>
      // on its empty placeholder option)
      return selectedValues[0] ?? "";
    }
    if (selectedValues.length === 0) return null;

    const formData = new FormData();
    selectedValues.forEach((value) => formData.append(name, value));
    return formData;
  }

  /**
   * Focus the trigger: a slotted one, else the field. The host itself isn't
   * focusable. A slotted trigger that can't take focus (a <span>, a disabled
   * button) leaves it to the field.
   */
  focus(options?: FocusOptions): void {
    if (this.disabled) return; // like a disabled <select>
    const trigger = this.querySelector(':scope > [slot="trigger"]') as HTMLElement | null;
    if (trigger) {
      trigger.focus(options);
      const active = (trigger.getRootNode() as Document | ShadowRoot).activeElement;
      if (active && trigger.contains(active)) return;
    }
    const stub = this.shadowRoot?.querySelector(".select-stub") as HTMLElement | null;
    if (stub) stub.focus(options);
    else super.focus(options);
  }

  // SELECTION

  private parseValue(value: string | null): string[] {
    if (!value) return [];
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
  }

  /** The selection: the `value` property. external-selection holds none. */
  private getSelectedValues(): string[] {
    if (this.externalSelection) return [];
    return this.parseValue(this.getProperty("value"));
  }

  private getTagElements(): OptionElement[] {
    return Array.from(this.querySelectorAll<OptionElement>("ty-option"));
  }

  /**
   * The options on offer: all but the ones the author hid (`hidden`, like a
   * native <option hidden>). The search filters these and the keyboard walks
   * them; a hidden option can still be the value.
   */
  private getOfferedTags(): TagData[] {
    return this.getTagElements()
      .filter((el) => !el.hasAttribute("hidden"))
      .map((el) => this.getTagData(el));
  }

  private getTagData(element: HTMLElement): TagData {
    // An upgraded ty-option knows its value ('' included); else the markup
    const own = (element as any).value;
    const value =
      typeof own === "string"
        ? own
        : element.getAttribute("value") ?? (element.textContent || "").trim();
    // label attribute wins over textContent (native <option label>)
    const text =
      element.getAttribute("label") || element.textContent || "";

    return { value, text, element };
  }

  private findOption(value: string): OptionElement | undefined {
    return this.getTagElements().find((el) => this.getTagData(el).value === value);
  }

  /** Draw each option's check from the selection (or, external, the app's marks). */
  private paintOptions(shown: OptionElement | null): void {
    const external = this.externalSelection;
    const selected = new Set(this.getSelectedValues());
    for (const el of this.getTagElements()) {
      el.checked = external
        ? isMarked(el)
        : selected.has(this.getTagData(el).value);
      el.inTrigger = el === shown;
    }
  }

  /**
   * The option the trigger shows: single select, list closed, the picked
   * option — if it is a direct child (only those can be slotted).
   */
  private shownOption(): OptionElement | null {
    if (this.multiple || this._state.open) return null;
    const value = this.getSelectedValues()[0];
    const option = value === undefined ? undefined : this.findOption(value);
    return option && option.parentElement === this ? option : null;
  }

  /**
   * Every child goes to the slot it asks for, the rest to the list — except
   * the option the trigger shows. The real node: page CSS styles it, and the
   * children a framework rendered stay exactly its own.
   */
  private assignSlots(shown: OptionElement | null): void {
    const shadow = this.shadowRoot!;
    const named = new Map<string, (Element | Text)[]>(NAMED_SLOTS.map((n) => [n, []]));
    const list: (Element | Text)[] = [];
    for (const node of Array.from(this.childNodes)) {
      if (node === shown) continue;
      if (node instanceof Element && named.has(node.slot)) named.get(node.slot)!.push(node);
      else if (node instanceof Element || node instanceof Text) list.push(node);
    }
    for (const [name, nodes] of named) {
      assign(shadow.querySelector<HTMLSlotElement>(`slot[name="${name}"]`), nodes);
    }
    assign(shadow.querySelector<HTMLSlotElement>('slot[name="selected"]'), shown ? [shown] : []);
    assign(shadow.querySelector<HTMLSlotElement>("#options-slot"), list);
  }

  /** What the trigger shows, and where every child is slotted. */
  private syncTrigger(): void {
    const shown = this.shownOption();
    this.assignSlots(shown);
    this.paintOptions(shown);
    this.updateSelectionDisplay(shown);
  }

  /** Set the selection; with `dispatchChange`, also fire `change` (a user action). */
  private updateComponentValue(
    newValues: string[],
    dispatchChange: boolean = false,
    action: ChangeAction = "set",
    item: string | null = null,
    reveal: boolean = dispatchChange,
  ): void {
    const oldValues = this.getSelectedValues();
    const sameSet =
      [...newValues].sort().join("\u0000") === [...oldValues].sort().join("\u0000");
    if (sameSet) return;

    // Renders (value is visual) and updates the form value
    this.setProperty("value", newValues.join(","));

    if (dispatchChange) {
      this.dispatchChangeEvent({
        // Scalar for single select, array for multiple
        value: this.multiple ? [...newValues] : (newValues[0] ?? null),
        values: newValues,
        items: this.getSelectedItems(newValues),
        action,
        item,
      });
      // A user change, like a native select's :user-invalid: show the
      // message now if it left the field invalid (including a
      // setCustomValidity() the change handler just made).
      if (reveal) this.revealValidity();
    }
  }

  /** Rich item info for values, read off the matching options. */
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

  // DROPDOWN METHODS

  private calculatePosition(): void {
    const shadow = this.shadowRoot!;
    const stub = shadow.querySelector(".select-stub") as HTMLElement;
    const dialog = shadow.querySelector(
      ".dropdown-dialog",
    ) as HTMLDialogElement;

    if (!stub || !dialog) return;

    const stubRect = stub.getBoundingClientRect();

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

    const wrapPadding = 20;

    // Popup width is independent of the trigger — a small button trigger still
    // gets a usable list. Overridable via --ty-select-popup-width.
    const cssWidth = parseFloat(
      getComputedStyle(this).getPropertyValue("--ty-select-popup-width"),
    );
    const popupWidth = !isNaN(cssWidth)
      ? cssWidth
      : Math.max(stubRect.width, 320);

    const anchored = placementToAnchored(this.getProperty("placement") as Placement | "");

    const pos = computeAnchoredPosition({
      anchorRect: stubRect,
      popupWidth,
      popupHeight: estimatedHeight,
      align: anchored.align,
      side: anchored.side,
      gap: 8, // unified trigger→popup offset (select/date-picker/popup)
    });
    const positionBelow = pos.below;

    // Shift by the dialog's transparent wrap (room for shadows). On the
    // dialog, not the host: a morph would strip the host's inline style.
    const x = pos.x - wrapPadding;
    const y = (positionBelow ? pos.topY : pos.bottomY) - wrapPadding;
    const width = popupWidth + wrapPadding + wrapPadding;

    dialog.style.setProperty("--dropdown-x", `${x}px`);
    dialog.style.setProperty("--dropdown-y", `${y}px`);
    dialog.style.setProperty("--dropdown-width", `${width}px`);
    dialog.style.setProperty("--dropdown-padding", `${wrapPadding}px`);

    dialog.classList.toggle("position-below", positionBelow);
    dialog.classList.toggle("position-above", !positionBelow);
  }

  // CUSTOM SCROLLBAR FOR OPTIONS

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

  /** Open the popup (desktop dropdown or mobile full-screen dialog). */
  private open(): void {
    if (this.disabled || this.readonly || this._state.open) return;
    if (this._state.mode === "mobile") this.openMobileModal();
    else this.openDropdown();
  }

  private close(): void {
    if (this._state.mode === "mobile") this.closeMobileModal();
    else this.closeDropdown();
  }

  /**
   * `<dialog>.showModal()` puts the popup in the top layer but does NOT stop
   * the page behind it from scrolling: the shared scroll lock does.
   */
  private lockPageScroll(): void {
    this._scrollLockId = `select-${this.id || "anon"}-${this._uid}`;
    lockScroll(this._scrollLockId);
  }

  private unlockPageScroll(): void {
    if (this._scrollLockId) {
      unlockScroll(this._scrollLockId);
      this._scrollLockId = null;
    }
  }

  private setExpanded(expanded: boolean): void {
    this.shadowRoot!.querySelector(".select-stub")?.setAttribute("aria-expanded", String(expanded));
  }

  private openDropdown(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(
      ".dropdown-dialog",
    ) as HTMLDialogElement;
    if (!dialog) return;

    this.setExpanded(true);
    this.lockPageScroll();

    // The picked option goes back to the list, the trigger shows the placeholder
    this._state.open = true;
    this.syncTrigger();

    dialog.showModal();

    // Position BEFORE adding .open: calculatePosition reads layout, which
    // commits the pre-open styles so the enter transition runs.
    this.calculatePosition();
    dialog.classList.add("open");

    shadow.querySelector(".dropdown-chevron")?.classList.add("open");
    shadow.querySelector(".dropdown-search-chevron")?.classList.add("open");

    this._state.filteredTags = this.getOfferedTags();
    this._state.highlightedIndex = -1;

    // Ensure options area is visible (may have been hidden from previous search)
    this.updateOptionsVisibility(true);

    this._setupOptionsScrollbar();

    const searchInput = shadow.querySelector(
      ".dropdown-search-input",
    ) as HTMLInputElement;
    if (searchInput && this.shouldShowSearch()) {
      setTimeout(() => searchInput.focus(), 100);
    }

    this.fireOpenEvent();
  }

  private closeDropdown(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(
      ".dropdown-dialog",
    ) as HTMLDialogElement;

    if (!dialog) return;

    this.setExpanded(false);
    this._destroyOptionsScrollbar();

    dialog.classList.remove("open", "position-above", "position-below");
    dialog.close();

    this.unlockPageScroll();

    this._state.open = false;
    this._state.highlightedIndex = -1;
    this.syncTrigger();

    shadow.querySelector(".dropdown-chevron")?.classList.remove("open");
    shadow.querySelector(".dropdown-search-chevron")?.classList.remove("open");

    this.resetSearch(".dropdown-search-input");

    this.fireCloseEvent();
  }

  private openMobileModal(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(".mobile-dialog") as HTMLDialogElement;
    if (!dialog) return;

    this.setExpanded(true);
    this.lockPageScroll();

    this._state.open = true;
    this.syncTrigger();

    // getBoundingClientRect flush between showModal and .open lets the enter
    // transition run (see openDropdown). showModal() also focuses the search
    // input (its `autofocus`), skipping it when hidden.
    dialog.showModal();
    dialog.getBoundingClientRect();
    dialog.classList.add("open");

    // Nothing stays filtered out from a previous search
    const tags = this.getTagElements().map((el) => this.getTagData(el));
    this._state.filteredTags = this.getOfferedTags();
    this.updateTagVisibility(tags, tags);

    requestAnimationFrame(() => this.updateMobileSelectedState());

    this.fireOpenEvent();
  }

  private closeMobileModal(): void {
    const shadow = this.shadowRoot!;
    const dialog = shadow.querySelector(".mobile-dialog") as HTMLDialogElement;
    if (!dialog) return;

    this.setExpanded(false);

    // Close immediately — ::backdrop doesn't support transitions
    dialog.classList.remove("open");
    dialog.close();

    this.unlockPageScroll();

    this._state.open = false;
    this._state.highlightedIndex = -1;
    this.syncTrigger();

    this.resetSearch(".mobile-search-input");

    this.fireCloseEvent();
  }

  /**
   * On close: empty the search box and show every option again. With
   * external-search the app filters, so it gets an empty `search` instead
   * (right away, not debounced: its list should be reset before a reopen).
   */
  private resetSearch(inputSelector: string): void {
    const hadQuery = this._state.search !== "";
    this._state.search = "";
    const searchInput = this.shadowRoot!.querySelector(inputSelector) as HTMLInputElement | null;
    if (searchInput) searchInput.value = "";

    if (this.externalSearch) {
      if (hadQuery) {
        if (this._searchDebounceTimer !== null) {
          clearTimeout(this._searchDebounceTimer);
          this._searchDebounceTimer = null;
        }
        this.fireSearchEvent("");
      }
      return;
    }

    const allTags = this.getTagElements().map((el) => this.getTagData(el));
    this._state.filteredTags = this.getOfferedTags();
    this.updateTagVisibility(allTags, allTags);
    this.clearHighlights(allTags);
  }

  // EVENT HANDLERS

  private handleStubClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.open();
  }

  /**
   * .select-clear click — must stop propagation before it bubbles to the
   * stub's own click handler (which would otherwise also open the dropdown).
   */
  private handleClearClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.disabled || this.readonly) {
      return;
    }

    this.clear();
    // The user emptied it: show the message now if that left it invalid
    this.revealValidity();
  }

  /**
   * Keyboard-open the closed stub: it is a div with tabindex="0", so
   * Enter/Space don't click it. handleKeyboard takes over once open.
   */
  private handleStubKeydown(e: KeyboardEvent): void {
    if (this.disabled || this.readonly || this._state.open) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      this.open();
    }
  }

  private handleTagClick(e: Event): void {
    const target = e.target as HTMLElement;

    const tag = target.closest("ty-option") as HTMLElement | null;

    if (!tag || tag.hasAttribute("disabled")) return;

    e.preventDefault();
    e.stopPropagation();

    this.selectByTag(tag);
  }

  /** Pick an option: click, Enter on a highlighted one, allow-create's exact match. */
  private selectByTag(tag: HTMLElement): void {
    const tagValue = this.getTagData(tag).value;

    // The app holds the selection: report the pick, change nothing
    if (this.externalSelection) {
      const selected = !this.multiple || !isMarked(tag);
      this.dispatchChangeEvent({
        value: tagValue,
        values: [],
        items: [],
        action: !this.multiple ? "set" : selected ? "add" : "remove",
        item: tagValue,
        selected,
      });
      if (!this.multiple) this.close();
      return;
    }

    // Single select: picking replaces the selection and closes the popup
    // (native <select> semantics — re-picking the same option just closes)
    if (!this.multiple) {
      this.updateComponentValue([tagValue], true, "set", tagValue);
      this.close();
      return;
    }

    // Multiple: toggle — clicking a selected option deselects it
    const currentValues = this.getSelectedValues();
    if (currentValues.includes(tagValue)) {
      this.updateComponentValue(
        currentValues.filter((v) => v !== tagValue),
        true,
        "remove",
        tagValue,
      );
    } else {
      this.updateComponentValue([...currentValues, tagValue], true, "add", tagValue);
    }
  }

  /**
   * allow-create: Enter with unmatched search text mints a new option.
   * Returns true if it handled the key (created, or selected an existing
   * exact match instead of duplicating) — false if there's nothing to do
   * (blank query, or allow-create is off), so the caller's normal Enter
   * handling (select highlighted, or no-op) proceeds.
   */
  private tryCreateFromSearch(): boolean {
    if (!this.allowCreate) return false;

    const query = (this._state.search || "").trim();
    if (!query) return false;

    const queryLower = query.toLowerCase();
    const allTags = this.getTagElements().map((el) => this.getTagData(el));

    // Dedup: typed text exactly matches an existing option (by value or
    // display text) — select it instead of minting a duplicate.
    const existing = allTags.find(
      (t) =>
        t.value.toLowerCase() === queryLower ||
        t.text.toLowerCase() === queryLower,
    );
    if (existing) {
      this.selectByTag(existing.element);
      return true;
    }

    const rawLabel = query;
    const defaultValue =
      this.createTransform === "slug" ? slugify(rawLabel) : rawLabel;
    if (!defaultValue) return true; // slugified to nothing — handled no-op

    const detail: CreateEventDetail = { value: defaultValue, label: rawLabel };
    const event = new CustomEvent("create", {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    if (event.defaultPrevented) return true; // consumer takes over entirely

    const finalValue = detail.value;
    const option = document.createElement("ty-option");
    option.setAttribute("value", finalValue);
    option.textContent = rawLabel;
    this.appendChild(option);

    if (this.externalSelection) {
      this.selectByTag(option);
      if (this.multiple) this.clearSearchAfterCreate();
      return true;
    }

    if (!this.multiple) {
      this.updateComponentValue([finalValue], true, "create", finalValue);
      this.close();
      return true;
    }

    this.updateComponentValue(
      [...this.getSelectedValues(), finalValue],
      true,
      "create",
      finalValue,
    );
    this.clearSearchAfterCreate();
    return true;
  }

  /**
   * Multiple + allow-create: clear the search box and show the full (now
   * longer) list, so the next tag can be typed right away.
   */
  private clearSearchAfterCreate(): void {
    this._state.search = "";
    this._state.highlightedIndex = -1;
    const input = this.searchInput();
    if (input) input.value = "";

    const allTags = this.getTagElements().map((el) => this.getTagData(el));
    this._state.filteredTags = this.getOfferedTags();
    this.updateTagVisibility(allTags, allTags);
    this.updateOptionsVisibility(true);
    this.clearHighlights(allTags);
    this.updateMobileSelectedState();
    input?.focus();
  }

  private searchInput(): HTMLInputElement | null {
    return this.shadowRoot!.querySelector(".dropdown-search-input, .mobile-search-input");
  }

  private handleSearchInput(e: Event): void {
    // Typing is a request to see results, so the list takes the space back
    // even if the selected strip was the one open.
    if (this._state.mode === "mobile") this.expandMobileSection("available");
    const query = (e.target as HTMLInputElement).value;

    this._state.search = query;

    if (this.externalSearch) {
      // The app filters: it gets the query and swaps the options
      this.dispatchSearchEvent(query);
      return;
    }

    // Filter locally — selected options stay listed so they can be toggled off
    const allTags = this.getOfferedTags();
    const filtered = this.filterTags(allTags, query);

    this._state.filteredTags = filtered;
    this._state.highlightedIndex = -1;

    this.updateTagVisibility(filtered, allTags);

    // Hide options area if no results (desktop)
    this.updateOptionsVisibility(filtered.length > 0);

    // Refresh mobile count + empty-state to reflect filtered visibility
    this.updateMobileSelectedState();

    this.clearHighlights(allTags);
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (!this._state.open) return;

    const filteredTags = this._state.filteredTags;
    const highlighted = this._state.highlightedIndex;

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        this.close();
        // Back on the trigger, like a native select
        this.focus();
        break;

      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        // A highlighted (arrowed-to) option always wins — the user picked
        // it explicitly, so allow-create must not shadow it with a new one.
        if (highlighted >= 0 && highlighted < filteredTags.length) {
          this.selectByTag(filteredTags[highlighted].element);
        } else {
          this.tryCreateFromSearch();
        }
        break;

      case "ArrowUp":
      case "ArrowDown": {
        e.preventDefault();
        e.stopPropagation();
        const next = this.nextEnabledTagIndex(
          filteredTags,
          highlighted,
          e.key === "ArrowDown" ? 1 : -1,
        );
        this._state.highlightedIndex = next;
        this.highlightTag(filteredTags, next);
        break;
      }
    }
  }

  /**
   * Next tag index in `direction` (-1/1) that a click would accept, wrapping
   * around: not disabled, and not out of sight (`tags` is the list as it was
   * offered; an option can get `hidden` while open, by a server patch).
   * -1 if there is none.
   */
  private nextEnabledTagIndex(
    tags: TagData[],
    fromIndex: number,
    direction: 1 | -1,
  ): number {
    const count = tags.length;
    if (count === 0) return -1;

    let index = fromIndex === -1
      ? (direction === 1 ? 0 : count - 1)
      : (fromIndex + direction + count) % count;

    for (let i = 0; i < count; i++) {
      const el = tags[index].element;
      if (!el.hasAttribute("disabled") && !el.hasAttribute("hidden") && !el.hasAttribute("filtered-out")) return index;
      index = (index + direction + count) % count;
    }

    return -1;
  }

  // SEARCH & FILTERING HELPERS

  private filterTags(tags: TagData[], query: string): TagData[] {
    if (!query || query.trim() === "") {
      return tags;
    }

    const searchLower = query.toLowerCase();
    return tags.filter(({ text }) => text.toLowerCase().includes(searchLower));
  }

  /**
   * Search filtering marks the options it leaves out `filtered-out`, never
   * `hidden`: that one is the author's (see getOfferedTags).
   */
  private updateTagVisibility(
    filteredTags: TagData[],
    allTags: TagData[],
  ): void {
    const visibleValues = new Set(filteredTags.map((tag) => tag.value));

    allTags.forEach(({ value, element }) => {
      element.toggleAttribute("filtered-out", !visibleValues.has(value));
    });
  }

  private updateOptionsVisibility(hasOptions: boolean): void {
    const options = this.shadowRoot!.querySelector(".dropdown-options") as HTMLElement | null;
    if (options) {
      options.style.display = hasOptions ? "" : "none";
    }
  }

  private clearHighlights(tags: TagData[]): void {
    tags.forEach(({ element }) => {
      element.removeAttribute("highlighted");
    });
  }

  private highlightTag(tags: TagData[], index: number): void {
    this.clearHighlights(tags);

    if (index >= 0 && index < tags.length) {
      const { element } = tags[index];
      element.setAttribute("highlighted", "");

      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }

  /** external-search: fire `search`, after `debounce` ms when set. */
  private dispatchSearchEvent(query: string): void {
    if (this._searchDebounceTimer !== null) {
      clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = null;
    }

    const debounce: number = this.getProperty("debounce");
    if (debounce > 0) {
      this._searchDebounceTimer = window.setTimeout(() => {
        this.fireSearchEvent(query);
        this._searchDebounceTimer = null;
      }, debounce);
    } else {
      this.fireSearchEvent(query);
    }
  }

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
   * Popup lifecycle events. They do NOT bubble, like native <dialog>
   * open/close: a bubbling `close` from a select in a ty-modal would close
   * the modal. On open, external-search also gets an empty `search`, a hook
   * to reset or refetch the list.
   */
  private fireOpenEvent(): void {
    this.dispatchEvent(
      new CustomEvent("open", {
        detail: { mode: this._state.mode, element: this },
      }),
    );
    if (this.externalSearch) {
      this.fireSearchEvent("");
    }
  }

  private fireCloseEvent(): void {
    this.dispatchEvent(
      new CustomEvent("close", {
        detail: { mode: this._state.mode, element: this },
      }),
    );
  }

  private dispatchChangeEvent(detail: ChangeEventDetail): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  // RENDERING

  /** One sync of everything the state shows; idempotent. */
  protected render(): void {
    if (!this.shadowRoot!.querySelector(".select-container")) this.build();

    this.syncTrigger();
    if (this._state.open) this.refreshOpenList();
    this.updateSearchVisibility();
    this.applyLoadingState();
    this.syncFieldChrome();
    this.syncTriggerSlot();
    this.updateMobileSelectedState();
    this.updateFormValue();
    this.updateValidity();
  }

  /**
   * The options changed while the list is open (a morph, an external-search
   * swap): filter the new ones by the query (a morph also strips the marks
   * of the old filter), and let the keyboard walk them, not the old ones.
   */
  private refreshOpenList(): void {
    const offered = this.getOfferedTags();
    const filtered = this.externalSearch ? offered : this.filterTags(offered, this._state.search);
    if (!this.externalSearch) {
      this.updateTagVisibility(filtered, this.getTagElements().map((el) => this.getTagData(el)));
    }
    const highlighted = this._state.filteredTags[this._state.highlightedIndex]?.element;
    this._state.filteredTags = filtered;
    this._state.highlightedIndex = filtered.findIndex((t) => t.element === highlighted);
  }

  /**
   * Patch label, required marker and disabled/compact state onto the
   * already-built shadow DOM (build() writes the markup once).
   */
  private syncFieldChrome(): void {
    const shadow = this.shadowRoot!;
    const container = shadow.querySelector(".select-container")!;
    const labelText = this.label;
    const required = this.required;
    const disabled = this.disabled;

    const labelId = `select-label-${this._uid}`;
    let label = container.querySelector(":scope > .ty-field-label") as HTMLLabelElement | null;
    if (labelText) {
      if (!label) {
        label = document.createElement("label");
        label.className = "ty-field-label";
        label.id = labelId;
        container.prepend(label);
      }
      label.innerHTML = `${labelText}${required ? `<span class="required-icon">${REQUIRED_ICON_SVG}</span>` : ""}`;
    } else {
      label?.remove();
    }

    // Error line under the trigger (every skin, custom trigger included) —
    // same markup as ty-input's
    const error: string = this.error || "";
    const errorId = `select-error-${this._uid}`;
    let errorLine = container.querySelector(":scope > .error-message");
    if (error) {
      if (!errorLine) {
        errorLine = document.createElement("div");
        errorLine.className = "error-message";
        errorLine.id = errorId;
        container.append(errorLine);
      }
      errorLine.textContent = error;
    } else {
      errorLine?.remove();
    }

    const stub = shadow.querySelector(".select-stub") as HTMLElement;
    stub.classList.toggle("disabled", disabled);
    stub.classList.toggle("compact", this.compact);
    stub.classList.toggle("error", !!error);
    stub.tabIndex = disabled ? -1 : 0;
    stub.toggleAttribute("disabled", disabled);
    if (disabled) stub.setAttribute("aria-disabled", "true");
    else stub.removeAttribute("aria-disabled");
    if (labelText) stub.setAttribute("aria-labelledby", labelId);
    else stub.removeAttribute("aria-labelledby");
    // The combobox carries the invalid state and reads the line out
    if (error) {
      stub.setAttribute("aria-invalid", "true");
      stub.setAttribute("aria-describedby", errorId);
    } else {
      stub.removeAttribute("aria-invalid");
      stub.removeAttribute("aria-describedby");
    }
    this.syncTriggerAria();
    shadow
      .querySelectorAll<HTMLInputElement>(".dropdown-search-input, .mobile-search-input")
      .forEach((input) => (input.disabled = disabled));
  }

  /**
   * A slotted trigger is what takes focus (focus()), so it carries the error
   * state too. aria-describedby can't reach into our shadow root from the
   * light DOM: the message goes in aria-description instead. The trigger is
   * the author's markup, so a morph can strip these while the error stays:
   * a watch on them puts them back. Writes only on a real change, or the
   * watch would feed itself.
   */
  private syncTriggerAria(): void {
    const error: string = this.error || "";
    const trigger = error
      ? (this.querySelector(':scope > [slot="trigger"]') as HTMLElement | null)
      : null;
    if (this._ariaTrigger && this._ariaTrigger !== trigger) {
      this._ariaTrigger.removeAttribute("aria-invalid");
      this._ariaTrigger.removeAttribute("aria-description");
    }
    if (trigger) {
      if (trigger.getAttribute("aria-invalid") !== "true") trigger.setAttribute("aria-invalid", "true");
      if (trigger.getAttribute("aria-description") !== error) trigger.setAttribute("aria-description", error);
    }
    this._ariaTrigger = trigger;

    this._ariaObserver ??= new MutationObserver(() => this.syncTriggerAria());
    this._ariaObserver.disconnect();
    if (trigger) {
      this._ariaObserver.observe(trigger, {
        attributes: true,
        attributeFilter: ["aria-invalid", "aria-description"],
      });
    }
  }

  /**
   * Reflect constraint validation to the owning <form> via ElementInternals:
   * empty + required => valueMissing, with a native <select>'s message.
   * Disabled fields, and external-selection (the app holds the selection),
   * are barred from it.
   */
  private updateValidity(): void {
    if (this.disabled || this.externalSelection) {
      this.applyValidity({});
      return;
    }
    if (this.required && this.getSelectedValues().length === 0) {
      const stub = this.shadowRoot?.querySelector(".select-stub") as HTMLElement | null;
      this.applyValidity(
        { valueMissing: true },
        nativeMessage("select", { required: true, multiple: this.multiple }),
        stub ?? undefined,
      );
    } else {
      this.applyValidity({});
    }
  }

  /**
   * A slotted trigger (slot="trigger") replaces the field chrome. has-trigger
   * on the host sizes it to the trigger (Blink can't parse :has() inside
   * :host()); render() puts it back if a morph strips it.
   */
  private syncTriggerSlot(): void {
    const shadow = this.shadowRoot!;
    const slot = shadow.querySelector('slot[name="trigger"]') as HTMLSlotElement;
    const hasTrigger = slot.assignedElements().length > 0;
    shadow.querySelector(".select-stub")!.classList.toggle("custom-trigger", hasTrigger);
    if (this.hasAttribute("has-trigger") !== hasTrigger) {
      this.toggleAttribute("has-trigger", hasTrigger);
    }
  }

  /**
   * Build the shadow DOM once. Mobile (touch, narrow) gets a full-screen
   * dialog with a selected strip; desktop an anchored dropdown. The mode is
   * fixed here: everything wired below belongs to one of them.
   */
  private build(): void {
    const shadow = this.shadowRoot!;
    const mobile = isMobileTouch();
    this._state.mode = mobile ? "mobile" : "desktop";

    const listboxId = `select-listbox-${this._uid}`;
    const multiselectable = this.multiple ? 'aria-multiselectable="true"' : "";
    const loadingHtml = `
      <div class="dropdown-loading" aria-hidden="true">
        <slot name="loading">
          <span class="dropdown-loading-spinner"></span>
          <span class="dropdown-loading-text">Searching…</span>
        </slot>
      </div>`;

    const desktopPopup = `
      <dialog class="dropdown-dialog">
        <div class="dropdown-header">
          <div class="dropdown-search-icon" aria-hidden="true">${SEARCH_ICON_SVG}</div>
          <input class="dropdown-search-input" type="text" placeholder="Search..." />
          <div class="dropdown-search-chevron">${CHEVRON_DOWN_SVG}</div>
        </div>
        <div class="dropdown-options-wrapper">
          <div class="dropdown-options" id="${listboxId}" role="listbox" ${multiselectable}>
            <slot id="options-slot"></slot>
          </div>
          ${loadingHtml}
        </div>
      </dialog>`;

    const label = this.label;
    const mobilePopup = `
      <dialog class="mobile-dialog">
        <div class="mobile-dialog-content">
          <div class="mobile-search-header">
            ${label ? `<span class="mobile-header-label">${label}</span>` : ""}
            <div class="mobile-header-content">
              <div class="dropdown-search-icon" aria-hidden="true">${SEARCH_ICON_SVG}</div>
              <input class="mobile-search-input" type="text"
                     placeholder="${label ? `Search ${label}...` : "Search..."}" autofocus />
              <button class="mobile-close-button" type="button" aria-label="Close">${CLEAR_ICON_SVG}</button>
            </div>
          </div>
          <div class="mobile-body" data-expanded="available">
            <!-- Selected strip, pinned above the list; collapses when empty -->
            <div class="mobile-selected-section" data-empty="true">
              <button class="section-header" type="button" data-section="selected" aria-expanded="false">
                <span class="section-title"></span>
                ${CHEVRON_DOWN_SVG}
              </button>
              <div class="section-content mobile-selected-chips"></div>
            </div>
            <div class="mobile-available-section" data-empty="false">
              <button class="section-header" type="button" data-section="available" aria-expanded="true">
                <span class="section-title"></span>
                ${CHEVRON_DOWN_SVG}
              </button>
              <div class="section-content dropdown-options-wrapper" id="${listboxId}" role="listbox" ${multiselectable}>
                <slot id="options-slot"></slot>
                <div class="empty-state">${this.getProperty("no-options-message")}</div>
                ${loadingHtml}
              </div>
            </div>
          </div>
        </div>
      </dialog>`;

    shadow.innerHTML = `
      <div class="select-container dropdown-mode-${this._state.mode}">
        <div class="dropdown-wrapper">
          <div class="dropdown-stub select-stub"
               role="combobox"
               aria-haspopup="listbox"
               aria-expanded="false"
               aria-controls="${listboxId}"
               tabindex="0">
            <slot name="trigger">
              <slot name="start"></slot>
              <slot name="selected"></slot>
              <span class="dropdown-placeholder"></span>
              <span class="select-count" hidden></span>
              <slot name="end"></slot>
              <button class="select-clear" type="button" aria-label="Clear selection" hidden>
                ${CLEAR_ICON_SVG}
              </button>
              <div class="dropdown-chevron">${CHEVRON_DOWN_SVG}</div>
            </slot>
          </div>
          ${mobile ? mobilePopup : desktopPopup}
        </div>
      </div>
    `;

    const stub = shadow.querySelector(".select-stub")!;
    stub.addEventListener("click", (e) => this.handleStubClick(e));
    stub.addEventListener("keydown", (e) => this.handleStubKeydown(e as KeyboardEvent));
    shadow.querySelector(".select-clear")!.addEventListener("click", (e) => this.handleClearClick(e));

    shadow.querySelector('slot[name="trigger"]')!.addEventListener("slotchange", () => {
      this.syncTriggerSlot();
      this.syncFieldChrome(); // error aria onto a newly slotted trigger
    });

    shadow.querySelector("#options-slot")!.addEventListener("click", (e) => this.handleTagClick(e));

    const searchInput = this.searchInput()!;
    searchInput.addEventListener("input", (e) => this.handleSearchInput(e));

    const dialog = shadow.querySelector("dialog")!;
    // A click on the backdrop (the dialog itself, not its content) closes
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) this.close();
    });
    // A close request handleKeyboard didn't get (Escape whose keydown
    // someone else stopped, a back gesture): close our way, not natively.
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      this.close();
      this.focus();
    });
    this.syncOnOutsideClose(dialog);

    if (mobile) {
      shadow.querySelectorAll(".mobile-body .section-header").forEach((header) => {
        header.addEventListener("click", () =>
          this.expandMobileSection(
            (header as HTMLElement).dataset.section === "selected" ? "selected" : "available",
          ),
        );
      });
      shadow.querySelector(".mobile-close-button")!.addEventListener("click", () => this.close());
    } else {
      searchInput.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
      });
    }
  }

  /**
   * The dialog was closed by someone else — a ty-modal around this select
   * closes the dialogs still open inside it. Run our own close too, so the
   * open state, aria-expanded and the scroll lock follow. Watches the `open`
   * attribute rather than the `close` event: that one comes a task later,
   * so right after modal.hide() the stub would still say expanded. Our own
   * close() calls land here with the state already closed, and a dialog
   * reopened since then is open again: both are no-ops.
   */
  private syncOnOutsideClose(dialog: HTMLDialogElement): void {
    new MutationObserver(() => {
      if (this._state.open && !dialog.open) this.close();
    }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  }

  private updateMobileSelectedState(): void {
    if (this._state.mode !== "mobile") return;

    const shadow = this.shadowRoot!;
    this.renderMobileSelectedChips();
    const availableSection = shadow.querySelector(".mobile-available-section");

    if (availableSection) {
      // The list shows every option on offer (selected ones too, to untick
      // them); the count leaves out the ones already in the strip above.
      const selected = new Set(this.getSelectedValues());
      const shown = this.getOfferedTags().filter(
        ({ element }) => !element.hasAttribute("filtered-out"),
      );
      const visibleAvailable = shown.filter(({ value }) => !selected.has(value)).length;

      availableSection.setAttribute("data-empty", String(shown.length === 0));

      this.setMobileSectionTitle(availableSection, this.getProperty("available-label"), visibleAvailable);
    }
  }

  /** "Label (n)" with the count in its own muted span. */
  private setMobileSectionTitle(section: Element, label: string, n: number): void {
    const title = section.querySelector(".section-title");
    if (!title) return;
    const count = document.createElement("span");
    count.className = "section-count";
    count.textContent = `(${n})`;
    title.replaceChildren(`${label} `, count);
  }

  /**
   * Hand the dialog's spare height to one section: a phone has no room for
   * two usefully tall lists. Selecting from the list hands it back to
   * "available".
   */
  private expandMobileSection(section: "selected" | "available"): void {
    const shadow = this.shadowRoot;
    const body = shadow?.querySelector(".mobile-body") as HTMLElement | null;
    if (!body) return;

    // Nothing selected: the strip is just its header, nothing to expand into
    if (section === "selected" && this.getSelectedValues().length === 0) return;

    body.dataset.expanded = section;
    shadow!.querySelectorAll(".mobile-body .section-header").forEach((header) => {
      const owns = (header as HTMLElement).dataset.section === section;
      header.setAttribute("aria-expanded", String(owns));
    });
  }

  /**
   * The selected values as dismissible chips, pinned above the available
   * list so a long list can never scroll the current selection out of sight.
   * Rebuilt wholesale: the strip is small.
   */
  private renderMobileSelectedChips(): void {
    const shadow = this.shadowRoot!;
    const section = shadow.querySelector(".mobile-selected-section");
    const host = shadow.querySelector(".mobile-selected-chips");
    if (!section || !host) return;

    const selected = this.getSelectedValues();
    section.setAttribute("data-empty", String(selected.length === 0));

    this.setMobileSectionTitle(section, this.getProperty("selected-label"), selected.length);

    // Last chip dismissed while the strip had the space — give it back.
    if (selected.length === 0) this.expandMobileSection("available");

    host.textContent = "";
    for (const { value, label } of this.getSelectedItems(selected)) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "mobile-selected-chip";
      chip.dataset.value = value;
      chip.setAttribute("aria-label", `Remove ${label}`);
      chip.innerHTML = `<span class="chip-label"></span>${CLEAR_ICON_SVG}`;
      (chip.querySelector(".chip-label") as HTMLElement).textContent = label;
      chip.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deselectValue(value);
      });
      host.appendChild(chip);
    }
  }

  /**
   * Should the popup show a search row? external-search/allow-create pin it
   * on (the input is the only way to get a query out at all), not-searchable
   * forces it off, and otherwise it follows the list: shown once there are
   * more options than fit without scrolling.
   */
  private shouldShowSearch(): boolean {
    if (this.externalSearch || this.allowCreate) return true;
    if (this.notSearchable) return false;
    return this.getTagElements().length > SEARCH_AUTO_THRESHOLD;
  }

  /** Toggle the search row (desktop header / mobile input) per shouldShowSearch. */
  private updateSearchVisibility(): void {
    const shadow = this.shadowRoot!;
    const show = this.shouldShowSearch();
    const header = shadow.querySelector(".dropdown-header") as HTMLElement | null;
    if (header) header.hidden = !show;
    // Mobile keeps its header (label + close button); only the input+icon hide
    shadow
      .querySelectorAll<HTMLElement>(".mobile-search-input, .mobile-header-content .dropdown-search-icon")
      .forEach((el) => (el.hidden = !show));
  }

  /**
   * The trigger, list closed:
   * - single: the picked option itself (`shown`), else its label, else the placeholder
   * - multiple + field: the labels, comma-joined (ellipsis via CSS)
   * - multiple + compact: placeholder + count badge
   * Open, the list shows what is picked: the trigger shows the placeholder.
   */
  private updateSelectionDisplay(shown: OptionElement | null): void {
    const stub = this.shadowRoot!.querySelector(".select-stub")!;

    const values = this.getSelectedValues();
    const count = values.length;
    stub.classList.toggle("has-selection", count > 0);
    stub.classList.toggle("has-option", shown !== null);

    const badge = stub.querySelector(".select-count") as HTMLElement;
    badge.textContent = String(count);
    badge.hidden = count === 0 || !this.multiple || !this.compact;

    const clearBtn = stub.querySelector(".select-clear") as HTMLElement;
    clearBtn.hidden = !(count > 0 && !this.noClear && !this.disabled && !this.readonly);

    const textEl = stub.querySelector(".dropdown-placeholder") as HTMLElement;
    textEl.hidden = shown !== null;
    const text =
      this._state.open || count === 0 || (this.multiple && this.compact)
        ? null
        : this.getSelectedItems(values).map((i) => i.label).join(", ");
    textEl.textContent = text ?? this.placeholder;
    textEl.classList.toggle("placeholder-shown", text === null);
  }

  // PUBLIC API

  /**
   * Deselect a value WITH a change event, like a pick in the popup (HTMX
   * hx-trigger="change" etc.). Used by ty-selected-options chips.
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

  /**
   * Clear the selection WITH a change event (action: 'clear'), for a custom
   * trigger's own clear control. Shows no validation message (a code reset
   * after a save shouldn't flag the field); the built-in × does.
   */
  clear(): void {
    this.updateComponentValue([], true, "clear", null, false);
  }

  get value(): string {
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

  get noClear(): boolean {
    return this.getProperty("noClear");
  }

  set noClear(value: boolean) {
    this.setProperty("noClear", value);
  }

  get required(): boolean {
    return this.getProperty("required");
  }

  set required(value: boolean) {
    this.setProperty("required", value);
  }

  get error(): string {
    return this.getProperty("error");
  }

  set error(value: string) {
    this.setProperty("error", value);
  }

  get notSearchable(): boolean {
    return this.getProperty("notSearchable");
  }

  set notSearchable(value: boolean) {
    this.setProperty("notSearchable", value);
  }

  get externalSearch(): boolean {
    return this.getProperty("externalSearch");
  }

  set externalSearch(value: boolean) {
    this.setProperty("externalSearch", value);
  }

  get externalSelection(): boolean {
    return this.getProperty("externalSelection");
  }

  set externalSelection(value: boolean) {
    this.setProperty("externalSelection", value);
  }

  get allowCreate(): boolean {
    return this.getProperty("allowCreate");
  }

  set allowCreate(value: boolean) {
    this.setProperty("allowCreate", value);
  }

  get createTransform(): "none" | "slug" {
    return this.getProperty("createTransform");
  }

  set createTransform(value: "none" | "slug") {
    this.setProperty("createTransform", value);
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

  get placement(): Placement | "" {
    return this.getProperty("placement") as Placement | "";
  }

  set placement(value: Placement | "") {
    this.setProperty("placement", value);
  }

  get flavor(): Flavor {
    return this.getProperty("flavor") as Flavor;
  }

  set flavor(value: Flavor) {
    this.setProperty("flavor", value);
  }

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }
}

if (!customElements.get("ty-select")) {
  customElements.define("ty-select", TySelect);
}
