/**
 * TyRadio + TyRadioGroup Web Components
 *
 * Exclusive selection within a group. ty-radio-group manages the selection
 * value and form integration; ty-radio is the individual choice element.
 *
 * Composition (ty-multiselect-style):
 *   <ty-radio-group name="plan" value="pro" label="Plan">
 *     <ty-radio value="free">Free</ty-radio>
 *     <ty-radio value="pro">Pro</ty-radio>
 *     <ty-radio value="team">Team</ty-radio>
 *   </ty-radio-group>
 *
 * Keyboard:
 * - Tab focuses the group's currently-selected (or first) radio
 * - Arrow keys move focus AND selection within the group (per W3C ARIA)
 * - Space/Enter selects the focused radio
 */

import type { Flavor, Size } from "../types/common.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import { ensureStyles } from "../utils/styles.js";
import { radioStyles } from "../styles/radio.js";

const REQUIRED_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M17.196 9 6.804 15"/><path d="m6.804 9 10.392 6"/></svg>`;

// ============================================================================
// TyRadio — individual radio button
// ============================================================================

interface RadioState {
  listenersSetup: boolean;
}

export interface TyRadioElement extends HTMLElement {
  value: string;
  checked: boolean;
  disabled: boolean;
  size: Size;
  flavor: Flavor;
}

export class TyRadio
  extends TyComponent<RadioState>
  implements TyRadioElement {

  protected static properties = {
    value: { type: "string" as const, default: "" },
    checked: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    disabled: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    size: {
      type: "string" as const,
      visual: true,
      default: "md",
    },
    flavor: {
      type: "string" as const,
      visual: true,
      default: "primary",
    },
  };

  private _listenersSetup: boolean = false;
  private _clickHandler: ((e: Event) => void) | null = null;
  private _focusHandler: (() => void) | null = null;
  private _blurHandler: (() => void) | null = null;

  constructor() {
    super();
    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: radioStyles, id: "ty-radio" });
  }

  protected onConnect(): void { }
  protected onDisconnect(): void {
    this.removeEventListeners();
  }
  protected onPropertiesChanged(_changes: PropertyChange[]): void { }

  private buildClassList(): string {
    const classes: string[] = [this.size, this.flavor];
    if (this.disabled) classes.push("disabled");
    return classes.join(" ");
  }

  private handleClick(e: Event): void {
    if (this.disabled) return;
    e.stopPropagation();
    // Notify the group — group will set checked attribute on this and clear others
    this.dispatchEvent(
      new CustomEvent("ty-radio-select", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private removeEventListeners(): void {
    if (!this._listenersSetup) return;
    const el = this.shadowRoot?.querySelector(".radio-container");
    if (!el) return;
    if (this._clickHandler) {
      el.removeEventListener("click", this._clickHandler);
      this._clickHandler = null;
    }
    if (this._focusHandler) {
      el.removeEventListener("focus", this._focusHandler);
      this._focusHandler = null;
    }
    if (this._blurHandler) {
      el.removeEventListener("blur", this._blurHandler);
      this._blurHandler = null;
    }
    this._listenersSetup = false;
  }

  private setupEventListeners(): void {
    if (this._listenersSetup) return;
    const el = this.shadowRoot!.querySelector(".radio-container");
    if (!el) return;

    this._clickHandler = (e: Event) => this.handleClick(e);
    this._focusHandler = () => el.classList.add("focused");
    this._blurHandler = () => el.classList.remove("focused");

    el.addEventListener("click", this._clickHandler);
    el.addEventListener("focus", this._focusHandler);
    el.addEventListener("blur", this._blurHandler);
    this._listenersSetup = true;
  }

  protected render(): void {
    const shadow = this.shadowRoot!;
    let radioEl = shadow.querySelector(".radio-container") as HTMLElement;
    const classes = this.buildClassList();

    if (!radioEl) {
      radioEl = document.createElement("div");
      radioEl.className = "radio-container " + classes;
      radioEl.tabIndex = this.disabled ? -1 : 0;
      radioEl.setAttribute("role", "radio");
      radioEl.setAttribute("aria-checked", String(this.checked));
      radioEl.setAttribute("aria-disabled", String(this.disabled));

      const circle = document.createElement("div");
      circle.className = "radio-circle";
      radioEl.appendChild(circle);

      shadow.appendChild(radioEl);
      this.setupEventListeners();
    } else {
      radioEl.className = "radio-container " + classes;
      radioEl.tabIndex = this.disabled ? -1 : 0;
      radioEl.setAttribute("aria-checked", String(this.checked));
      radioEl.setAttribute("aria-disabled", String(this.disabled));
    }
  }

  // Property accessors
  get value(): string { return this.getProperty("value"); }
  set value(v: string) { this.setProperty("value", v); }

  get checked(): boolean { return this.getProperty("checked"); }
  set checked(v: boolean) { this.setProperty("checked", v); }

  get disabled(): boolean { return this.getProperty("disabled"); }
  set disabled(v: boolean) { this.setProperty("disabled", v); }

  get size(): Size { return this.getProperty("size") as Size; }
  set size(v: Size) { this.setProperty("size", v); }

  get flavor(): Flavor { return this.getProperty("flavor") as Flavor; }
  set flavor(v: Flavor) { this.setProperty("flavor", v); }
}

if (!customElements.get("ty-radio")) {
  customElements.define("ty-radio", TyRadio);
}

// ============================================================================
// TyRadioGroup — manages exclusive selection
// ============================================================================

interface RadioGroupState {
  listenersSetup: boolean;
}

export interface TyRadioGroupElement extends HTMLElement {
  value: string;
  name: string;
  label: string;
  disabled: boolean;
  required: boolean;
  error: string;
  orientation: "vertical" | "horizontal";
  size: Size;
  flavor: Flavor;
  form: HTMLFormElement | null;
}

export class TyRadioGroup
  extends TyComponent<RadioGroupState>
  implements TyRadioGroupElement {

  static formAssociated = true;

  protected static properties = {
    value: {
      type: "string" as const,
      visual: true,
      formValue: true,
      emitChange: true,
      default: "",
    },
    name: { type: "string" as const, default: "" },
    label: { type: "string" as const, visual: true, default: "" },
    disabled: { type: "boolean" as const, visual: true, default: false },
    required: { type: "boolean" as const, visual: true, default: false },
    error: { type: "string" as const, visual: true, default: "" },
    orientation: {
      type: "string" as const,
      visual: true,
      default: "vertical",
    },
    size: {
      type: "string" as const,
      visual: true,
      default: "md",
    },
    flavor: {
      type: "string" as const,
      visual: true,
      default: "primary",
    },
  };

  private _listenersSetup: boolean = false;
  private _selectHandler: ((e: Event) => void) | null = null;
  private _keydownHandler: ((e: Event) => void) | null = null;

  constructor() {
    super();
    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: radioStyles, id: "ty-radio-group" });
  }

  protected onConnect(): void {
    // Sync radio children with current value once light DOM is ready
    queueMicrotask(() => this.syncChildren());
  }

  protected onDisconnect(): void {
    this.removeEventListeners();
  }

  protected onPropertiesChanged(changes: PropertyChange[]): void {
    if (changes.some((c) => c.name === "value" || c.name === "size" || c.name === "flavor" || c.name === "disabled")) {
      this.syncChildren();
    }
  }

  protected getFormValue(): FormDataEntryValue | null {
    return this.value || null;
  }

  /**
   * Find ty-radio descendants in this group's light DOM. Searches deeply
   * because consumers may wrap each radio in a `<label>` for click delegation.
   */
  private getRadios(): TyRadio[] {
    return Array.from(this.querySelectorAll("ty-radio")) as TyRadio[];
  }

  /**
   * Push group state down to each radio child.
   */
  private syncChildren(): void {
    const radios = this.getRadios();
    for (const radio of radios) {
      radio.checked = radio.value === this.value;
      // Inherit size/flavor/disabled from group unless radio set its own
      if (this.disabled) radio.disabled = true;
      radio.size = this.size;
      radio.flavor = this.flavor;
    }
  }

  /**
   * Handle a child's select request — update value, sync, emit change.
   */
  private handleRadioSelect(e: Event): void {
    if (this.disabled) return;
    const detail = (e as CustomEvent).detail;
    const newValue = detail?.value;
    if (typeof newValue !== "string" || newValue === this.value) return;

    this.value = newValue;
    this.syncChildren();

    setTimeout(() => {
      const eventDetail = {
        value: newValue,
        formValue: newValue,
        originalEvent: e,
      };
      this.dispatchEvent(
        new CustomEvent("input", { detail: eventDetail, bubbles: true, composed: true }),
      );
      this.dispatchEvent(
        new CustomEvent("change", { detail: eventDetail, bubbles: true, composed: true }),
      );
    }, 0);
  }

  /**
   * Arrow-key navigation within group (W3C radio practice: arrow keys move
   * focus and selection together).
   */
  private handleKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;
    const radios = this.getRadios().filter((r) => !r.disabled);
    if (radios.length === 0) return;

    const active = document.activeElement;
    const current = radios.find((r) => r === active || r.contains(active));
    let nextIndex = -1;

    if (["ArrowDown", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      nextIndex = current ? (radios.indexOf(current) + 1) % radios.length : 0;
    } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      nextIndex = current
        ? (radios.indexOf(current) - 1 + radios.length) % radios.length
        : radios.length - 1;
    } else if (["Space", " ", "Enter"].includes(e.key)) {
      if (current) {
        e.preventDefault();
        this.value = current.value;
        this.syncChildren();
        const eventDetail = {
          value: current.value,
          formValue: current.value,
          originalEvent: e,
        };
        setTimeout(() => {
          this.dispatchEvent(new CustomEvent("change", { detail: eventDetail, bubbles: true, composed: true }));
        }, 0);
      }
      return;
    } else {
      return;
    }

    const next = radios[nextIndex];
    if (next) {
      next.focus();
      // Per W3C: arrow keys also change selection
      this.value = next.value;
      this.syncChildren();
      const eventDetail = {
        value: next.value,
        formValue: next.value,
        originalEvent: e,
      };
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent("change", { detail: eventDetail, bubbles: true, composed: true }));
      }, 0);
    }
  }

  private removeEventListeners(): void {
    if (!this._listenersSetup) return;
    if (this._selectHandler) {
      this.removeEventListener("ty-radio-select", this._selectHandler);
      this._selectHandler = null;
    }
    if (this._keydownHandler) {
      this.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = null;
    }
    this._listenersSetup = false;
  }

  private setupEventListeners(): void {
    if (this._listenersSetup) return;
    this._selectHandler = (e: Event) => this.handleRadioSelect(e);
    this._keydownHandler = (e: Event) => this.handleKeydown(e as KeyboardEvent);
    this.addEventListener("ty-radio-select", this._selectHandler);
    this.addEventListener("keydown", this._keydownHandler);
    this._listenersSetup = true;
  }

  protected render(): void {
    const shadow = this.shadowRoot!;
    let container = shadow.querySelector(".radio-group-container") as HTMLElement;

    if (!container) {
      container = document.createElement("div");
      container.className = "radio-group-container";
      container.setAttribute("role", "radiogroup");
      container.setAttribute("aria-disabled", String(this.disabled));

      // Label
      if (this.label) {
        const labelEl = document.createElement("div");
        labelEl.className = "radio-group-label";
        labelEl.textContent = this.label;
        if (this.required) {
          const req = document.createElement("span");
          req.className = "required-icon";
          req.innerHTML = REQUIRED_ICON_SVG;
          labelEl.appendChild(req);
        }
        container.appendChild(labelEl);
      }

      // List wrapper that hosts the slot
      const list = document.createElement("div");
      list.className = "radio-group-list " + this.orientation;
      const slot = document.createElement("slot");
      list.appendChild(slot);
      container.appendChild(list);

      if (this.error) {
        const errorEl = document.createElement("div");
        errorEl.className = "radio-group-error";
        errorEl.textContent = this.error;
        container.appendChild(errorEl);
      }

      shadow.appendChild(container);
      this.setupEventListeners();
    } else {
      // Update label
      let labelEl = container.querySelector(".radio-group-label") as HTMLElement;
      if (this.label) {
        if (!labelEl) {
          labelEl = document.createElement("div");
          labelEl.className = "radio-group-label";
          container.insertBefore(labelEl, container.firstChild);
        }
        labelEl.textContent = this.label;
        if (this.required && !labelEl.querySelector(".required-icon")) {
          const req = document.createElement("span");
          req.className = "required-icon";
          req.innerHTML = REQUIRED_ICON_SVG;
          labelEl.appendChild(req);
        } else if (!this.required) {
          labelEl.querySelector(".required-icon")?.remove();
        }
      } else if (labelEl) {
        labelEl.remove();
      }

      // Update orientation
      const list = container.querySelector(".radio-group-list") as HTMLElement;
      if (list) list.className = "radio-group-list " + this.orientation;

      // Update error
      let errorEl = container.querySelector(".radio-group-error") as HTMLElement;
      if (this.error) {
        if (!errorEl) {
          errorEl = document.createElement("div");
          errorEl.className = "radio-group-error";
          container.appendChild(errorEl);
        }
        errorEl.textContent = this.error;
      } else if (errorEl) {
        errorEl.remove();
      }

      container.setAttribute("aria-disabled", String(this.disabled));
    }

    // Always sync child radios after render
    this.syncChildren();
  }

  // Property accessors
  get value(): string { return this.getProperty("value"); }
  set value(v: string) { this.setProperty("value", v); }

  get name(): string { return this.getProperty("name"); }
  set name(v: string) { this.setProperty("name", v); }

  get label(): string { return this.getProperty("label"); }
  set label(v: string) { this.setProperty("label", v); }

  get disabled(): boolean { return this.getProperty("disabled"); }
  set disabled(v: boolean) { this.setProperty("disabled", v); }

  get required(): boolean { return this.getProperty("required"); }
  set required(v: boolean) { this.setProperty("required", v); }

  get error(): string { return this.getProperty("error"); }
  set error(v: string) { this.setProperty("error", v); }

  get orientation(): "vertical" | "horizontal" {
    return this.getProperty("orientation") as "vertical" | "horizontal";
  }
  set orientation(v: "vertical" | "horizontal") {
    this.setProperty("orientation", v);
  }

  get size(): Size { return this.getProperty("size") as Size; }
  set size(v: Size) { this.setProperty("size", v); }

  get flavor(): Flavor { return this.getProperty("flavor") as Flavor; }
  set flavor(v: Flavor) { this.setProperty("flavor", v); }

  get form(): HTMLFormElement | null { return this._internals.form; }
}

if (!customElements.get("ty-radio-group")) {
  customElements.define("ty-radio-group", TyRadioGroup);
}
