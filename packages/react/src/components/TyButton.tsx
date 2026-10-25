import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props.js';
import { useBooleanProperty } from '../utils/use-boolean-prop.js';

type BuiltinFlavor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;
type ButtonAppearance = 'solid' | 'outlined' | 'ghost';

export interface TyButtonCSSProperties extends React.CSSProperties {
  '--ty-button-bg'?: string;
  '--ty-button-bg-hover'?: string;
  '--ty-button-color'?: string;
  '--ty-button-border'?: string;
}

export interface TyButtonProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style'> {
  style?: TyButtonCSSProperties;
  /**
   * Semantic styling variant. Built-in flavors get themed styles; append `+`
   * for a stronger shade or `-` for a softer one (e.g. `"primary+"`,
   * `"danger-"`). Any other string is passed through as-is — theme it via
   * `--ty-button-*` CSS variables.
   */
  flavor?: ShadedFlavor | (string & {});

  /**
   * Visual appearance:
   * - `"solid"` (default) — saturated brand fill with paired text color
   * - `"outlined"` — transparent background, text === border
   * - `"ghost"` — text only with hover background
   */
  appearance?: ButtonAppearance;

  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Button type for form submission */
  type?: 'button' | 'submit' | 'reset';

  /** Disable the button */
  disabled?: boolean;

  /** Loading state — shows a centered spinner, blocks click, preserves width */
  loading?: boolean;

  /** Pill-shaped button (rounded ends) */
  pill?: boolean;

  /** Action (icon-only square) */
  action?: boolean;

  /** Accessible label for screen readers */
  label?: string;

  /** Form field name for form submission */
  name?: string;

  /** Form field value for form submission */
  value?: string;

  /** `id` of the form to submit or reset, when the button sits outside it */
  form?: string;

  /** Full-width button */
  wide?: boolean;

  /** Neutral at rest; reveals the flavor on hover, focus and press */
  muted?: boolean;

  /** Button content */
  children?: React.ReactNode;
}

export const TyButton = React.forwardRef<HTMLElement, TyButtonProps>(
  ({
    children,
    type,
    appearance,
    disabled,
    loading,
    pill,
    action,
    wide,
    muted,
    label,
    name,
    value,
    form,
    onClick,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Imperatively attach the click listener so onClick reliably fires for the
    // CustomEvent('click') that <ty-button> re-dispatches on its host (the
    // inner <button> calls stopPropagation, so React's delegated onClick can
    // miss it). Form submit/reset is left to <ty-button> itself: it is
    // form-associated and calls form.requestSubmit(), which validates the form
    // and fires the real submit event React's onSubmit listens for.
    useEffect(() => {
      const element = elementRef.current;
      if (!element || !onClick) return;

      const handler = (event: Event) => {
        onClick(event as unknown as React.MouseEvent<HTMLElement>);
      };

      element.addEventListener('click', handler);
      return () => {
        element.removeEventListener('click', handler);
      };
    }, [onClick]);

    // `form` is read-only on <ty-button>, like on a native <button>. React 19
    // assigns a prop as a property when the element has one, so passing it
    // through throws; the attribute is what picks the form.
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      if (form) element.setAttribute('form', form);
      else element.removeAttribute('form');
    }, [form]);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isLoading = useBooleanProperty(elementRef, 'loading', loading);
    const isPill = useBooleanProperty(elementRef, 'pill', pill);
    const isAction = useBooleanProperty(elementRef, 'action', action);
    const isWide = useBooleanProperty(elementRef, 'wide', wide);
    const isMuted = useBooleanProperty(elementRef, 'muted', muted);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (isDisabled) webComponentProps.disabled = '';
    if (isLoading) webComponentProps.loading = '';
    if (isPill) webComponentProps.pill = '';
    if (isAction) webComponentProps.action = '';
    if (isWide) webComponentProps.wide = '';
    if (isMuted) webComponentProps.muted = '';

    if (appearance) webComponentProps.appearance = appearance;
    if (type) webComponentProps.type = type;
    if (label) webComponentProps.label = label;
    if (name) webComponentProps.name = name;
    if (value) webComponentProps.value = value;

    return React.createElement(
      'ty-button',
      webComponentProps,
      children
    );
  }
);

TyButton.displayName = 'TyButton';
