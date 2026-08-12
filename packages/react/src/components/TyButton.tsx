import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

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

  /** Full-width button */
  wide?: boolean;

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
    label,
    name,
    value,
    onClick,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Imperatively attach the click listener so onClick reliably fires for the
    // CustomEvent('click') that <ty-button> re-dispatches on its host (the
    // inner <button> calls stopPropagation, so React's delegated onClick can
    // miss it). Also handles type=submit by dispatching a synthetic submit.
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handler = (event: Event) => {
        if (type === 'submit') {
          const form = element.closest('form');
          if (form) {
            event.preventDefault();
            event.stopPropagation();
            form.dispatchEvent(new Event('submit', {
              bubbles: true,
              cancelable: true,
            }));
          }
        }
        if (onClick) {
          onClick(event as unknown as React.MouseEvent<HTMLElement>);
        }
      };

      element.addEventListener('click', handler);
      return () => {
        element.removeEventListener('click', handler);
      };
    }, [type, onClick]);

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

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (isDisabled) webComponentProps.disabled = '';
    if (isLoading) webComponentProps.loading = '';
    if (isPill) webComponentProps.pill = '';
    if (isAction) webComponentProps.action = '';
    if (isWide) webComponentProps.wide = '';

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
