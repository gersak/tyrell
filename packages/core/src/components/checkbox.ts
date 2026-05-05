/**
 * TyCheckbox Web Component
 *
 * "Just the box" primitive — renders only the checkbox visual + state.
 * Label, required asterisk, and error display are the consumer's
 * responsibility — wrap in a `<label>` for click delegation.
 *
 * - Boolean checked state, form-associated
 * - Keyboard accessibility (Space/Enter)
 * - Sizes (xs, sm, md, lg, xl) and semantic flavors
 *
 * @example
 * <label>
 *   <ty-checkbox name="terms" required></ty-checkbox>
 *   I agree to the <a href="/terms">terms</a>
 * </label>
 */

import type { Flavor, Size } from "../types/common.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import { ensureStyles } from "../utils/styles.js";
import { checkboxStyles } from "../styles/checkbox.js";
import { parseBoolean, isBooleanString } from "../utils/parse-boolean.js";

/**
 * Component internal state (for typing TyComponent)
 */
interface CheckboxState {
  checked: boolean;
  listenersSetup: boolean;
}

/**
 * Checkbox unchecked icon (Font Awesome)
 */
const CHECKBOX_UNCHECKED_ICON = `<svg fill='currentColor' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96z"/></svg>`;

/**
 * Checkbox checked icon (Font Awesome)
 */
const CHECKBOX_CHECKED_ICON = `<svg fill='currentColor' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 283 440.5 289.9 440C296.8 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/></svg>`;

/**
 * TyCheckbox Element Interface
 */
export interface TyCheckboxElement extends HTMLElement {
  checked: boolean;
  value: string;
  name: string;
  disabled: boolean;
  required: boolean;
  size: Size;
  flavor: Flavor;
  form: HTMLFormElement | null;
}

/**
 * Ty Checkbox Component
 *
 * @example
 * ```html
 * <!-- Basic checkbox -->
 * <ty-checkbox>Subscribe to newsletter</ty-checkbox>
 *
 * <!-- Pre-checked with custom value -->
 * <ty-checkbox
 *   checked
 *   value="accepted"
 *   required>
 *   Accept terms
 * </ty-checkbox>
 *
 * <!-- With error state -->
 * <ty-checkbox
 *   required
 *   error="You must agree to continue"
 *   flavor="danger">
 *   Agree to terms
 * </ty-checkbox>
 *
 * <!-- Different sizes -->
 * <ty-checkbox size="sm">Small</ty-checkbox>
 * <ty-checkbox size="lg">Large</ty-checkbox>
 *
 * <!-- Semantic flavors -->
 * <ty-checkbox flavor="primary" checked>Primary</ty-checkbox>
 * <ty-checkbox flavor="success" checked>Success</ty-checkbox>
 *
 * <!-- Rich content (with icon) -->
 * <ty-checkbox checked>
 *   <ty-icon name="star"></ty-icon>
 *   Premium feature
 * </ty-checkbox>
 * ```
 */
export class TyCheckbox
  extends TyComponent<CheckboxState>
  implements TyCheckboxElement
{
  static formAssociated = true;

  // ============================================================================
  // PROPERTY CONFIGURATION - Declarative property lifecycle
  // ============================================================================
  protected static properties = {
    // Core boolean state
    checked: {
      type: "boolean" as const,
      visual: true,
      formValue: true, // Triggers form value update
      emitChange: true, // Emits 'prop:change' event
      default: false,
    },
    // Form submission value (when checked)
    value: {
      type: "string" as const,
      default: "on",
    },
    name: {
      type: "string" as const,
      default: "",
    },
    disabled: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    required: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    size: {
      type: "string" as const,
      visual: true,
      default: "md",
      validate: (v: any) => ["xs", "sm", "md", "lg", "xl"].includes(v),
      coerce: (v: any) => {
        if (!["xs", "sm", "md", "lg", "xl"].includes(v)) {
          console.warn(`[ty-checkbox] Invalid size '${v}'. Using 'md'.`);
          return "md";
        }
        return v;
      },
    },
    flavor: {
      type: "string" as const,
      visual: true,
      default: "neutral",
      validate: (v: any) => {
        const valid: Flavor[] = [
          "primary",
          "secondary",
          "success",
          "danger",
          "warning",
          "neutral",
        ];
        return valid.includes(v);
      },
      coerce: (v: any) => {
        const valid: Flavor[] = [
          "primary",
          "secondary",
          "success",
          "danger",
          "warning",
          "neutral",
        ];
        if (!valid.includes(v)) {
          console.warn(`[ty-checkbox] Invalid flavor '${v}'. Using 'neutral'.`);
          return "neutral";
        }
        return v;
      },
    },
  };

  // ============================================================================
  // INTERNAL STATE - Not managed by PropertyManager
  // NOTE: _internals provided by TyComponent base class
  // ============================================================================

  private _listenersSetup: boolean = false;

  // Store references to handlers for cleanup
  private _clickHandler: ((e: Event) => void) | null = null;
  private _keydownHandler: ((e: Event) => void) | null = null;
  private _focusHandler: (() => void) | null = null;
  private _blurHandler: (() => void) | null = null;

  constructor() {
    super(); // TyComponent handles attachInternals() and attachShadow()

    // Apply styles to shadow root
    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: checkboxStyles, id: "ty-checkbox" });
  }

  // observedAttributes auto-generated by TyComponent from properties config

  // ============================================================================
  // TYCOMPONENT LIFECYCLE HOOKS
  // ============================================================================

  /**
   * Called when component connects to DOM
   * TyComponent already handled pre-connection property capture
   */
  protected onConnect(): void {
    // TyComponent will call render() automatically after this hook
    // No need to call render() manually or use requestAnimationFrame
  }

  /**
   * Called when component disconnects from DOM
   */
  protected onDisconnect(): void {
    // Clean up event listeners when component is removed from DOM
    this.removeEventListeners();
  }

  /**
   * Handle property changes - called BEFORE render
   */
  protected onPropertiesChanged(_changes: PropertyChange[]): void {
    // No special handling needed - TyComponent handles rendering automatically
  }

  /**
   * Override form value to return value when checked, null when unchecked
   */
  protected getFormValue(): FormDataEntryValue | null {
    return this.checked ? this.value : null;
  }

  // Removed old attributeChangedCallback, initializeCheckboxState, validateFlavor - handled by TyComponent

  /**
   * Build CSS class list for checkbox container
   */
  private buildClassList(): string {
    const classes: string[] = [this.size, this.flavor];

    if (this.disabled) classes.push("disabled");
    if (this.required) classes.push("required");

    return classes.join(" ");
  }

  /**
   * Handle checkbox click event - standards compliant approach
   */
  private handleCheckboxClick(e: Event): void {
    if (this.disabled) return;

    // Toggle checked state - this will trigger automatic form value update
    const newValue = !this.checked;
    this.checked = newValue; // Uses setProperty which handles everything

    // Emit custom events after property update
    setTimeout(() => {
      const eventDetail = {
        value: newValue,
        checked: newValue,
        formValue: newValue ? this.value : null,
        originalEvent: e,
      };

      this.dispatchEvent(
        new CustomEvent("input", {
          detail: eventDetail,
          bubbles: true,
          composed: true,
        }),
      );

      this.dispatchEvent(
        new CustomEvent("change", {
          detail: eventDetail,
          bubbles: true,
          composed: true,
        }),
      );
    }, 0);
  }

  /**
   * Handle checkbox keyboard events - space/enter to toggle
   */
  private handleCheckboxKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;

    if (["Space", " ", "Enter"].includes(e.key)) {
      e.preventDefault(); // Prevent default for keyboard to avoid page scroll
      e.stopPropagation();
      this.handleCheckboxClick(e);
    }
  }

  /**
   * Remove event listeners for cleanup
   */
  private removeEventListeners(): void {
    if (!this._listenersSetup) return;

    const shadow = this.shadowRoot;
    if (!shadow) return;

    const checkboxEl = shadow.querySelector(".checkbox-container");
    if (!checkboxEl) return;

    // Remove all event listeners using stored handler references
    if (this._clickHandler) {
      checkboxEl.removeEventListener("click", this._clickHandler);
      this._clickHandler = null;
    }

    if (this._keydownHandler) {
      checkboxEl.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = null;
    }

    if (this._focusHandler) {
      checkboxEl.removeEventListener("focus", this._focusHandler);
      this._focusHandler = null;
    }

    if (this._blurHandler) {
      checkboxEl.removeEventListener("blur", this._blurHandler);
      this._blurHandler = null;
    }

    this._listenersSetup = false;
  }

  /**
   * Setup event listeners for checkbox functionality
   * IMPORTANT: Only called ONCE, not on every render
   */
  private setupEventListeners(): void {
    if (this._listenersSetup) return;

    const shadow = this.shadowRoot!;
    const checkboxEl = shadow.querySelector(".checkbox-container");

    if (!checkboxEl) return;

    // Create and store handler references for cleanup
    this._clickHandler = (e: Event) => {
      this.handleCheckboxClick(e);
    };

    this._keydownHandler = (e: Event) => {
      this.handleCheckboxKeydown(e as KeyboardEvent);
    };

    this._focusHandler = () => {
      checkboxEl.classList.add("focused");
    };

    this._blurHandler = () => {
      checkboxEl.classList.remove("focused");
    };

    // Add event listeners
    checkboxEl.addEventListener("click", this._clickHandler);
    checkboxEl.addEventListener("keydown", this._keydownHandler);
    checkboxEl.addEventListener("focus", this._focusHandler);
    checkboxEl.addEventListener("blur", this._blurHandler);

    this._listenersSetup = true;
  }

  /**
   * Render the checkbox — just the box visual.
   * Label, required asterisk, and error UI are the consumer's responsibility.
   */
  protected render(): void {
    const shadow = this.shadowRoot!;
    let checkboxEl = shadow.querySelector(".checkbox-container") as HTMLElement;
    const classes = this.buildClassList();

    if (!checkboxEl) {
      checkboxEl = document.createElement("div");
      checkboxEl.className = "checkbox-container " + classes;
      checkboxEl.tabIndex = this.disabled ? -1 : 0;
      checkboxEl.setAttribute("role", "checkbox");
      checkboxEl.setAttribute("aria-checked", String(this.checked));
      checkboxEl.setAttribute("aria-disabled", String(this.disabled));
      checkboxEl.setAttribute("aria-required", String(this.required));

      const checkboxIcon = document.createElement("div");
      checkboxIcon.className = "checkbox-icon";
      checkboxIcon.innerHTML = this.checked
        ? CHECKBOX_CHECKED_ICON
        : CHECKBOX_UNCHECKED_ICON;
      checkboxEl.appendChild(checkboxIcon);

      shadow.appendChild(checkboxEl);
      this.setupEventListeners();
    } else {
      checkboxEl.className = "checkbox-container " + classes;
      checkboxEl.tabIndex = this.disabled ? -1 : 0;
      checkboxEl.setAttribute("aria-checked", String(this.checked));
      checkboxEl.setAttribute("aria-disabled", String(this.disabled));
      checkboxEl.setAttribute("aria-required", String(this.required));

      const checkboxIcon = checkboxEl.querySelector(".checkbox-icon");
      if (checkboxIcon) {
        checkboxIcon.innerHTML = this.checked
          ? CHECKBOX_CHECKED_ICON
          : CHECKBOX_UNCHECKED_ICON;
      }
    }
  }

  // ============================================================================
  // PROPERTY ACCESSORS - Simple wrappers (no logic!)
  // ============================================================================

  get checked(): boolean {
    return this.getProperty("checked");
  }

  set checked(value: boolean) {
    this.setProperty("checked", value);
  }

  get value(): string {
    return this.getProperty("value");
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

  get disabled(): boolean {
    return this.getProperty("disabled");
  }

  set disabled(value: boolean) {
    this.setProperty("disabled", value);
  }

  get required(): boolean {
    return this.getProperty("required");
  }

  set required(value: boolean) {
    this.setProperty("required", value);
  }

  get size(): Size {
    return this.getProperty("size") as Size;
  }

  set size(value: Size) {
    this.setProperty("size", value);
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

// Register the custom element
if (!customElements.get("ty-checkbox")) {
  customElements.define("ty-checkbox", TyCheckbox);
}

