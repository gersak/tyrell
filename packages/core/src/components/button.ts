/**
 * TyButton Web Component
 *
 * Three appearance variants × six flavors × three tones (+/base/-).
 *   appearance="solid"     saturated brand fill (default)
 *   appearance="outlined"  transparent bg, text === border
 *   appearance="ghost"     text only, hover bg
 *
 * Append `+` or `-` to a flavor for stronger/softer tone (e.g. "primary+").
 */

import type { Flavor, Size, TyButtonElement } from "../types/common.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import { ensureStyles, buildClassList } from "../utils/styles.js";
import { buttonStyles } from "../styles/button.js";

type Appearance = "solid" | "outlined" | "ghost";

interface ButtonState {
  flavor: Flavor;
  size: Size;
  appearance: Appearance;
  disabled: boolean;
  type: "button" | "submit" | "reset";
  pill: boolean;
  action: boolean;
  wide: boolean;
  name: string;
  value: string;
}

/**
 * Ty Button Component
 *
 * @example
 * ```html
 * <ty-button flavor="primary">Default solid</ty-button>
 * <ty-button appearance="outlined" flavor="danger">Outlined</ty-button>
 * <ty-button appearance="ghost" flavor="success+">Ghost stronger</ty-button>
 * ```
 */
export class TyButton
  extends TyComponent<ButtonState>
  implements TyButtonElement
{
  static formAssociated = true;

  protected static properties = {
    flavor: {
      type: "string" as const,
      visual: true,
      default: "neutral",
    },
    size: {
      type: "string" as const,
      visual: true,
      default: "md",
      validate: (v: any) => ["xs", "sm", "md", "lg", "xl"].includes(v),
      coerce: (v: any) => {
        if (!["xs", "sm", "md", "lg", "xl"].includes(v)) {
          console.warn(`[ty-button] Invalid size '${v}'. Using 'md'.`);
          return "md";
        }
        return v;
      },
    },
    appearance: {
      type: "string" as const,
      visual: true,
      default: "solid",
      validate: (v: any) => ["solid", "outlined", "ghost"].includes(v),
      coerce: (v: any) => {
        if (!["solid", "outlined", "ghost"].includes(v)) {
          console.warn(`[ty-button] Invalid appearance '${v}'. Using 'solid'.`);
          return "solid";
        }
        return v;
      },
    },
    disabled: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    type: {
      type: "string" as const,
      visual: false,
      default: "submit",
    },
    pill: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    action: {
      type: "boolean" as const,
      visual: true,
      default: false,
    },
    wide: {
      type: "boolean" as const,
      visual: false,
      default: false,
    },
    name: {
      type: "string" as const,
      default: "",
    },
    value: {
      type: "string" as const,
      default: "",
    },
  };

  private _structureInitialized = false;

  constructor() {
    super();
    ensureStyles(this.shadowRoot!, { css: buttonStyles, id: "ty-button" });
  }

  protected onConnect(): void {}
  protected onDisconnect(): void {}
  protected onPropertiesChanged(_changes: PropertyChange[]): void {}

  // ============================================================================
  // PROPERTY ACCESSORS
  // ============================================================================

  get flavor(): Flavor {
    return this.getProperty("flavor") as Flavor;
  }
  set flavor(value: Flavor) {
    this.setProperty("flavor", value);
  }

  get size(): Size {
    return this.getProperty("size") as Size;
  }
  set size(value: Size) {
    this.setProperty("size", value);
  }

  get appearance(): Appearance {
    return this.getProperty("appearance") as Appearance;
  }
  set appearance(value: Appearance) {
    this.setProperty("appearance", value);
  }

  get disabled(): boolean {
    return this.getProperty("disabled");
  }
  set disabled(value: boolean) {
    this.setProperty("disabled", value);
  }

  get type(): "button" | "submit" | "reset" {
    return this.getProperty("type");
  }
  set type(value: "button" | "submit" | "reset") {
    this.setProperty("type", value);
  }

  get pill(): boolean {
    return this.getProperty("pill");
  }
  set pill(value: boolean) {
    this.setProperty("pill", value);
  }

  get action(): boolean {
    return this.getProperty("action");
  }
  set action(value: boolean) {
    this.setProperty("action", value);
  }

  get wide(): boolean {
    return this.getProperty("wide");
  }
  set wide(value: boolean) {
    this.setProperty("wide", value);
  }

  get name(): string {
    return this.getProperty("name");
  }
  set name(value: string) {
    this.setProperty("name", value);
  }

  get value(): string {
    return this.getProperty("value");
  }
  set value(value: string) {
    this.setProperty("value", value);
  }

  // ============================================================================
  // INTERNAL
  // ============================================================================

  /** Parse the optional `+`/`-` shade suffix from a flavor string. */
  private parseFlavor(): { base: string; tone: "" | "+" | "-" } {
    const f = this.flavor || "";
    if (f.length > 1 && f.endsWith("+"))
      return { base: f.slice(0, -1), tone: "+" };
    if (f.length > 1 && f.endsWith("-"))
      return { base: f.slice(0, -1), tone: "-" };
    return { base: f, tone: "" };
  }

  private buildClasses(): string {
    const { base, tone } = this.parseFlavor();
    return buildClassList(
      base,
      this.size,
      this.appearance,
      this.pill && "pill",
      this.action && "action",
      tone === "+" && "tone-plus",
      tone === "-" && "tone-minus",
    );
  }

  private handleFormAction(): void {
    const form = this._internals.form;
    if (!form) return;

    switch (this.type) {
      case "submit":
        if (this.name && this.value) {
          this._internals.setFormValue(this.value);
        }
        form.requestSubmit();
        break;
      case "reset":
        form.reset();
        break;
      case "button":
        break;
    }
  }

  private initializeButtonStructure(): void {
    const shadow = this.shadowRoot!;
    const classes = this.buildClasses();

    const button = document.createElement("button");
    button.disabled = this.disabled;
    button.className = classes;

    const startSlot = document.createElement("slot");
    startSlot.name = "start";
    startSlot.className = "start";

    const defaultSlot = document.createElement("slot");

    const endSlot = document.createElement("slot");
    endSlot.name = "end";
    endSlot.className = "end";

    button.appendChild(startSlot);
    button.appendChild(defaultSlot);
    button.appendChild(endSlot);

    button.addEventListener("click", (e: Event) => {
      if (this.disabled) return;
      e.stopPropagation();
      this.handleFormAction();
      this.dispatchEvent(
        new CustomEvent("click", {
          bubbles: true,
          composed: true,
          detail: { originalEvent: e },
        }),
      );
    });

    shadow.appendChild(button);
    this._structureInitialized = true;
  }

  protected render(): void {
    const shadow = this.shadowRoot!;

    if (!this._structureInitialized) {
      this.initializeButtonStructure();
      return;
    }

    const classes = this.buildClasses();
    const button = shadow.querySelector("button");
    if (button) {
      button.disabled = this.disabled;
      button.className = classes;
    }
  }
}

if (!customElements.get("ty-button")) {
  customElements.define("ty-button", TyButton);
}
