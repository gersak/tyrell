/**
 * TySwitch Web Component
 *
 * "Just the toggle" primitive — renders only the track + thumb visual.
 * Label, required asterisk, and error display are the consumer's
 * responsibility — wrap in a `<label>` for click delegation.
 *
 * - Boolean checked state, role="switch" ARIA
 * - Form-associated, keyboard accessibility
 * - Sizes (xs, sm, md, lg, xl) and semantic flavors
 *
 * @example
 * <label>
 *   <ty-switch name="notifications" checked></ty-switch>
 *   Email notifications
 * </label>
 */

import type { Flavor, Size } from "../types/common.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import { ensureStyles } from "../utils/styles.js";
import { switchStyles } from "../styles/switch.js";

interface SwitchState {
  checked: boolean;
  listenersSetup: boolean;
}

export interface TySwitchElement extends HTMLElement {
  checked: boolean;
  value: string;
  name: string;
  disabled: boolean;
  required: boolean;
  size: Size;
  flavor: Flavor;
  form: HTMLFormElement | null;
}

export class TySwitch
  extends TyComponent<SwitchState>
  implements TySwitchElement {
  static formAssociated = true;

  protected static properties = {
    checked: {
      type: "boolean" as const,
      visual: true,
      formValue: true,
      emitChange: true,
      default: false,
    },
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
          console.warn(`[ty-switch] Invalid size '${v}'. Using 'md'.`);
          return "md";
        }
        return v;
      },
    },
    flavor: {
      type: "string" as const,
      visual: true,
      default: "primary",
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
          console.warn(`[ty-switch] Invalid flavor '${v}'. Using 'primary'.`);
          return "primary";
        }
        return v;
      },
    },
  };

  private _listenersSetup: boolean = false;
  private _clickHandler: ((e: Event) => void) | null = null;
  private _keydownHandler: ((e: Event) => void) | null = null;
  private _focusHandler: (() => void) | null = null;
  private _blurHandler: (() => void) | null = null;

  constructor() {
    super();
    const shadow = this.shadowRoot!;
    ensureStyles(shadow, { css: switchStyles, id: "ty-switch" });
  }

  protected onConnect(): void { }
  protected onDisconnect(): void {
    this.removeEventListeners();
  }
  protected onPropertiesChanged(_changes: PropertyChange[]): void { }

  protected getFormValue(): FormDataEntryValue | null {
    return this.checked ? this.value : null;
  }

  private buildClassList(): string {
    const classes: string[] = [this.size, this.flavor];
    if (this.disabled) classes.push("disabled");
    if (this.required) classes.push("required");
    return classes.join(" ");
  }

  private handleSwitchClick(e: Event): void {
    if (this.disabled) return;
    const newValue = !this.checked;
    this.checked = newValue;

    setTimeout(() => {
      const eventDetail = {
        value: newValue,
        checked: newValue,
        formValue: newValue ? this.value : null,
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

  private handleSwitchKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (["Space", " ", "Enter"].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      this.handleSwitchClick(e);
    }
  }

  private removeEventListeners(): void {
    if (!this._listenersSetup) return;
    const shadow = this.shadowRoot;
    if (!shadow) return;
    const el = shadow.querySelector(".switch-container");
    if (!el) return;

    if (this._clickHandler) {
      el.removeEventListener("click", this._clickHandler);
      this._clickHandler = null;
    }
    if (this._keydownHandler) {
      el.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = null;
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
    const shadow = this.shadowRoot!;
    const el = shadow.querySelector(".switch-container");
    if (!el) return;

    this._clickHandler = (e: Event) => this.handleSwitchClick(e);
    this._keydownHandler = (e: Event) => this.handleSwitchKeydown(e as KeyboardEvent);
    this._focusHandler = () => el.classList.add("focused");
    this._blurHandler = () => el.classList.remove("focused");

    el.addEventListener("click", this._clickHandler);
    el.addEventListener("keydown", this._keydownHandler);
    el.addEventListener("focus", this._focusHandler);
    el.addEventListener("blur", this._blurHandler);

    this._listenersSetup = true;
  }

  protected render(): void {
    const shadow = this.shadowRoot!;
    let switchEl = shadow.querySelector(".switch-container") as HTMLElement;
    const classes = this.buildClassList();

    if (!switchEl) {
      switchEl = document.createElement("div");
      switchEl.className = "switch-container " + classes;
      switchEl.tabIndex = this.disabled ? -1 : 0;
      switchEl.setAttribute("role", "switch");
      switchEl.setAttribute("aria-checked", String(this.checked));
      switchEl.setAttribute("aria-disabled", String(this.disabled));
      switchEl.setAttribute("aria-required", String(this.required));

      const track = document.createElement("div");
      track.className = "switch-track";
      const thumb = document.createElement("div");
      thumb.className = "switch-thumb";
      track.appendChild(thumb);
      switchEl.appendChild(track);

      shadow.appendChild(switchEl);
      this.setupEventListeners();
    } else {
      switchEl.className = "switch-container " + classes;
      switchEl.tabIndex = this.disabled ? -1 : 0;
      switchEl.setAttribute("aria-checked", String(this.checked));
      switchEl.setAttribute("aria-disabled", String(this.disabled));
      switchEl.setAttribute("aria-required", String(this.required));
    }
  }

  // ============================================================================
  // PROPERTY ACCESSORS
  // ============================================================================

  get checked(): boolean { return this.getProperty("checked"); }
  set checked(value: boolean) { this.setProperty("checked", value); }

  get value(): string { return this.getProperty("value"); }
  set value(val: string) { this.setProperty("value", val); }

  get name(): string { return this.getProperty("name"); }
  set name(val: string) { this.setProperty("name", val); }

  get disabled(): boolean { return this.getProperty("disabled"); }
  set disabled(value: boolean) { this.setProperty("disabled", value); }

  get required(): boolean { return this.getProperty("required"); }
  set required(value: boolean) { this.setProperty("required", value); }

  get size(): Size { return this.getProperty("size") as Size; }
  set size(value: Size) { this.setProperty("size", value); }

  get flavor(): Flavor { return this.getProperty("flavor") as Flavor; }
  set flavor(value: Flavor) { this.setProperty("flavor", value); }

  get form(): HTMLFormElement | null { return this._internals.form; }
}

if (!customElements.get("ty-switch")) {
  customElements.define("ty-switch", TySwitch);
}
