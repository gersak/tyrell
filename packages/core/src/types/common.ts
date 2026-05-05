/**
 * Ty Component Common Types
 */

/**
 * Built-in semantic color flavor names. Append `+` for a stronger shade or `-`
 * for a softer shade — e.g. `primary`, `primary+`, `primary-`. Matches the
 * design system's `ty-bg-primary+` / `ty-text-primary-` class convention.
 */
export type FlavorBase =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral'

/**
 * A flavor with optional shade suffix: `primary | primary+ | primary-`.
 */
export type FlavorShaded<F extends string = FlavorBase> = F | `${F}+` | `${F}-`

/**
 * Semantic color flavors used throughout Ty components.
 *
 * Built-in flavors get themed styles. Add `+` / `-` for a stronger / softer
 * shade. Any other string is also accepted — pass a custom flavor name and
 * theme it via `--ty-button-*` (or component-specific) CSS variables on the
 * host. The `(string & {})` keeps editor autocomplete on the literals while
 * leaving the type open.
 */
export type Flavor = FlavorShaded | (string & {})

/** Component size variants */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Input types supported by ty-input */
export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'url'
  | 'tel'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'number'
  | 'currency'
  | 'percent'
  | 'compact'
  | 'checkbox'

/** Base properties shared by all Ty components */
export interface TyBaseElement extends HTMLElement {
  /** Semantic color flavor */
  flavor?: Flavor
}

/** Button appearance variant */
export type ButtonAppearance = 'solid' | 'outlined' | 'ghost'

/** Button component interface */
export interface TyButtonElement extends TyBaseElement {
  /** Button size */
  size?: Size
  /** Visual appearance: solid (filled, default), outlined (border only), ghost (text only) */
  appearance?: ButtonAppearance
  /** Disabled state */
  disabled?: boolean
  /** Pill shape (fully rounded) */
  pill?: boolean
  /** Action (icon-only square) */
  action?: boolean
  /** Full-width */
  wide?: boolean
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset'
}

/** CSS style content */
/** Icon size variants */
export type IconSize =
  | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'  // Relative sizes
  | '12' | '14' | '16' | '18' | '20' | '24' | '32' | '48' | '64' | '80' | '96'  // Fixed pixel sizes

/** Icon animation tempo */
export type IconTempo = 'slow' | 'fast'

/** Icon component interface */
export interface TyIconElement extends HTMLElement {
  /** Icon name to display */
  name?: string
  /** Icon size */
  size?: IconSize
  /** Spin animation */
  spin?: boolean
  /** Pulse animation */
  pulse?: boolean
  /** Animation tempo */
  tempo?: IconTempo
}

/** Tag component custom event detail */
export interface TyTagEventDetail {
  /** Target tag element */
  target: HTMLElement
}

/** Tag component interface */
export interface TyTagElement extends TyBaseElement {
  /** Tag value */
  value?: string
  /** Tag size */
  size?: Size
  /** Selected state */
  selected?: boolean
  /** Pill shape (fully rounded) - default true */
  pill?: boolean
  /** Clickable state */
  clickable?: boolean
  /** Dismissible state */
  dismissible?: boolean
  /** Disabled state */
  disabled?: boolean
}

/** Option component interface - omit 'hidden' from HTMLElement to avoid conflict */
export interface TyOptionElement extends Omit<HTMLElement, 'hidden'> {
  /** Option value */
  value?: string
  /** Selected state */
  selected?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Highlighted state (keyboard navigation) */
  highlighted?: boolean
  /** Hidden state - overrides HTMLElement's hidden */
  hidden?: boolean
}

/** Input component interface */
export interface TyInputElement extends TyBaseElement {
  /** Input type */
  type?: InputType
  /** Input value */
  value?: string
  /** Input name (for forms) */
  name?: string
  /** Placeholder text */
  placeholder?: string
  /** Label text */
  label?: string
  /** Disabled state */
  disabled?: boolean
  /** Required field */
  required?: boolean
  /** Error message */
  error?: string
  /** Input size */
  size?: Size
  /** Associated form */
  readonly form?: HTMLFormElement | null

  // Numeric formatting properties (NEW)
  /** Currency code for currency type (e.g., 'USD', 'EUR', 'HRK') */
  currency?: string
  /** Locale for formatting (e.g., 'en-US', 'hr-HR') */
  locale?: string
  /** Number of decimal places */
  precision?: number | string

  // Debounce property (Phase D)
  /** Debounce in milliseconds before firing input/change events (0-5000ms) */
  debounce?: number | string
}

/** CSS style content */
export interface StyleContent {
  /** CSS text content */
  css: string
  /** Optional style ID for caching */
  id?: string
}
