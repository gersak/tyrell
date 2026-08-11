/**
 * TyButton Web Component — three appearances (solid/outlined/ghost) × six
 * flavors × three tones. Append `+`/`-` to a flavor for stronger/softer tone.
 */

import type { Flavor, Size, TyButtonElement } from "../types/common.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import { ensureStyles, buildClassList } from "../utils/styles.js";
import { buttonStyles, buttonCustomFlavorCss } from "../styles/button.js";
import { syncCustomFlavorSheet } from "../utils/flavor-sheet.js";
import { getLoaderSvg } from "../utils/loader-registry.js";

type Appearance = "solid" | "outlined" | "ghost";

interface ButtonState {
  flavor: Flavor;
  size: Size;
  appearance: Appearance;
  disabled: boolean;
  loading: boolean;
  type: "button" | "submit" | "reset";
  pill: boolean;
  action: boolean;
  wide: boolean;
  name: string;
  value: string;
}

/**
 * Ty Button Component
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
    loading: {
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
    muted: {
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

  // Adopted sheet with generated rules for a custom (non-built-in) flavor
  private _customFlavorSheet: CSSStyleSheet | null = null;

  constructor() {
    super();
    ensureStyles(this.shadowRoot!, { css: buttonStyles, id: "ty-button" });
  }

  protected onConnect(): void {
    this._syncCustomFlavor();
  }
  protected onDisconnect(): void {}
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    if (changes.some((c) => c.name === "flavor")) {
      this._syncCustomFlavor();
    }
  }

  /**
   * Custom flavors: adopt generated per-flavor rules pointed at the user's
   * design tokens (--ty-solid-X / --ty-color-X / --ty-bg-X), falling back to
   * neutral for any token the user didn't define. Tone (+/-) is handled by
   * the tone-plus/tone-minus classes, so only the base flavor matters here.
   */
  private _syncCustomFlavor(): void {
    const { base } = this.parseFlavor();
    this._customFlavorSheet = syncCustomFlavorSheet(
      this.shadowRoot!,
      this._customFlavorSheet,
      base,
      () => buttonCustomFlavorCss(base),
    );
  }

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

  get loading(): boolean {
    return this.getProperty("loading");
  }
  set loading(value: boolean) {
    this.setProperty("loading", value);
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

  get muted(): boolean {
    return this.getProperty("muted");
  }
  set muted(value: boolean) {
    this.setProperty("muted", value);
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
      this.muted && "muted",
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

    const loader = document.createElement("span");
    loader.className = "loader-icon";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = getLoaderSvg();

    const startSlot = document.createElement("slot");
    startSlot.name = "start";
    startSlot.className = "start";

    const defaultSlot = document.createElement("slot");

    const endSlot = document.createElement("slot");
    endSlot.name = "end";
    endSlot.className = "end";

    button.appendChild(loader);
    button.appendChild(startSlot);
    button.appendChild(defaultSlot);
    button.appendChild(endSlot);

    button.addEventListener("click", (e: Event) => {
      if (this.disabled || this.loading) return;
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

    this.applyLoadingState(button);
    shadow.appendChild(button);
    this._structureInitialized = true;
  }

  private applyLoadingState(button: HTMLButtonElement): void {
    const isLoading = this.loading;
    button.classList.toggle("loading", isLoading);
    if (isLoading) {
      button.setAttribute("aria-busy", "true");
      // Pull the latest registered loader SVG so registry changes take effect
      const loader = button.querySelector(".loader-icon");
      if (loader) loader.innerHTML = getLoaderSvg();
    } else {
      button.removeAttribute("aria-busy");
    }
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
      this.applyLoadingState(button);
    }
  }
}

if (!customElements.get("ty-button")) {
  customElements.define("ty-button", TyButton);
}
