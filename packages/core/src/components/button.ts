/**
 * TyButton Web Component — three appearances (solid/outlined/ghost) × six
 * flavors × three tones. Append `+`/`-` to a flavor for stronger/softer tone.
 */

import type { Flavor, Size, TyButtonElement } from "../types/common.js";
import { DEFAULT_SIZE } from "../types/common.js";
import { TyComponent } from "../base/ty-component.js";
import type { PropertyChange } from "../utils/property-manager.js";
import { ensureStyles, buildClassList } from "../utils/styles.js";
import { buttonStyles, buttonCustomFlavorCss } from "../styles/button.js";
import { syncCustomFlavorSheet } from "../utils/flavor-sheet.js";
import { getLoaderSvg } from "../utils/loader-registry.js";
import { asSubmitAttempt } from "../utils/validity.js";

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
      default: DEFAULT_SIZE,
      validate: (v: any) => ["xs", "sm", "md", "lg", "xl"].includes(v),
      coerce: (v: any) => {
        if (!["xs", "sm", "md", "lg", "xl"].includes(v)) {
          console.warn(`[ty-button] Invalid size '${v}'. Using '${DEFAULT_SIZE}'.`);
          return DEFAULT_SIZE;
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

  // Disabled by an ancestor <fieldset disabled> (or its own attribute), as
  // reported by formDisabledCallback. Kept apart from the `disabled`
  // property, like native: re-enabling the fieldset restores the button.
  private _formDisabled = false;

  // Adopted sheet with generated rules for a custom (non-built-in) flavor
  private _customFlavorSheet: CSSStyleSheet | null = null;

  // The click event this button dispatched last (see initializeButtonStructure)
  private _ownClick: Event | null = null;

  constructor() {
    super();
    ensureStyles(this.shadowRoot!, { css: buttonStyles, id: "ty-button" });

    // Some clicks land on the host and never pass the inner <button>:
    // host.click(), a wrapping <label>, a press on host padding or border,
    // fireEvent/userEvent on the host. Swallow them and press the inner
    // button instead, so they get the same guard, the same single click
    // event and the same submit/reset as a press on the button itself.
    // Capture, so this runs before any bubbling listener on the host.
    this.addEventListener(
      "click",
      (e: Event) => {
        const button = this.shadowRoot!.querySelector("button");
        if (!button || e === this._ownClick) return;
        // On its way to the inner button, which handles it
        if (e.composedPath().includes(button)) return;
        e.stopImmediatePropagation();
        if (!this._pressOffButton(e)) button.click();
      },
      true,
    );
  }

  /**
   * A real press inside the host's content box that missed the button: the
   * empty host below a wide button that a min-height made taller, or around
   * one a page's display: flex stretched. Nothing there looks like the
   * button, so it's no press. Host padding and border are outside the
   * content box.
   */
  private _pressOffButton(e: Event): boolean {
    if (!e.isTrusted || !(e instanceof MouseEvent)) return false;
    const r = this.getBoundingClientRect();
    const s = getComputedStyle(this);
    const px = (p: string) => parseFloat(s.getPropertyValue(p)) || 0;
    const left = r.left + px("border-left-width") + px("padding-left");
    const right = r.right - px("border-right-width") - px("padding-right");
    const top = r.top + px("border-top-width") + px("padding-top");
    const bottom = r.bottom - px("border-bottom-width") - px("padding-bottom");
    return e.clientX >= left && e.clientX < right && e.clientY >= top && e.clientY < bottom;
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

  formDisabledCallback(disabled: boolean): void {
    this._formDisabled = disabled;
    if (this._structureInitialized) this.render();
  }

  private get _isDisabled(): boolean {
    return this.disabled || this._formDisabled;
  }

  /** Focus the inner <button>. The host itself isn't focusable. */
  focus(options?: FocusOptions): void {
    const button = this.shadowRoot?.querySelector("button");
    if (button) button.focus(options);
    else super.focus(options);
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
        // Contribute name=value only to THIS submission, like a native
        // submitter. requestSubmit() builds the form data set synchronously,
        // so clearing right after is safe — and required: a value left
        // behind would ride along when a sibling button submits next.
        if (this.name && this.value) {
          this._internals.setFormValue(this.value);
        }
        // A submit attempt: the first failing field takes focus.
        try {
          asSubmitAttempt(() => form.requestSubmit());
        } finally {
          if (this.name && this.value) this._internals.setFormValue(null);
        }
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
    button.disabled = this._isDisabled;
    button.className = classes;
    // The only thing the outside can reach. The control fills whatever box
    // the host gets (see :host in styles/button.ts), but host styling like
    // padding or border-radius never lands on the control — this does.
    // Same convention as ty-tag::part(container) / ty-tabs::part(strip).
    button.setAttribute("part", "button");

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

    // The native click never leaves the shadow root, so bubbling listeners
    // see exactly one click per press: the CustomEvent below, or none at all
    // while disabled or loading (a disabled native button fires no click).
    // Capture listeners above the button can't be shielded: the native
    // click passes them on its way in, before this runs.
    // Like native, listeners run BEFORE the default action, and
    // preventDefault() in any of them cancels the submit/reset.
    button.addEventListener("click", (e: Event) => {
      // A click in a ty-popup slotted in here (<ty-button>Share<ty-popup>…)
      // is not a press of this button: let it through as it is, so it
      // doesn't submit the form and listeners see its real target.
      const path = e.composedPath();
      if (path.slice(0, path.indexOf(button)).some((n) => n instanceof Element && n.localName === "ty-popup")) return;
      e.stopPropagation();
      if (this._isDisabled || this.loading) return;
      const click = new CustomEvent("click", {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { originalEvent: e },
      });
      this._ownClick = click;
      if (this.dispatchEvent(click)) this.handleFormAction();
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
      // Clicks are swallowed while loading; say so, but stay focusable.
      button.setAttribute("aria-disabled", "true");
      // Pull the latest registered loader SVG so registry changes take effect
      const loader = button.querySelector(".loader-icon");
      if (loader) loader.innerHTML = getLoaderSvg();
    } else {
      button.removeAttribute("aria-busy");
      button.removeAttribute("aria-disabled");
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
      button.disabled = this._isDisabled;
      button.className = classes;
      this.applyLoadingState(button);
    }
  }
}

if (!customElements.get("ty-button")) {
  customElements.define("ty-button", TyButton);
}
