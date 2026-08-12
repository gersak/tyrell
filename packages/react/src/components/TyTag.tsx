import React, { useEffect, useRef, useCallback } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

// CSS custom properties that cascade into the shadow DOM for full color control
export interface TyTagCSSProperties extends React.CSSProperties {
  '--tag-bg'?: string;
  '--tag-color'?: string;
  '--tag-border-color'?: string;
}

export interface TyTagProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'onClick'> {
  flavor?: ShadedFlavor | (string & {});
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  notPill?: boolean;
  clickable?: boolean;
  dismissible?: boolean;
  disabled?: boolean;
  selected?: boolean;
  value?: string;
  style?: TyTagCSSProperties;
  // click is a composed CustomEvent from the web component — React's onClick picks it up
  onClick?: (event: CustomEvent) => void;
  onTagDismiss?: (event: CustomEvent) => void;
  children?: React.ReactNode;
}

export const TyTag = React.forwardRef<HTMLElement, TyTagProps>(
  ({ children, onClick, onTagDismiss, notPill, clickable, dismissible, disabled, selected, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    const handleDismiss = useCallback((event: CustomEvent) => {
      if (onTagDismiss) {
        onTagDismiss(event);
      }
    }, [onTagDismiss]);

    // dismiss is a custom event — React doesn't know about it, so we need a manual listener
    useEffect(() => {
      const element = elementRef.current;
      if (!element || !onTagDismiss) return;

      element.addEventListener('dismiss', handleDismiss as EventListener);
      return () => {
        element.removeEventListener('dismiss', handleDismiss as EventListener);
      };
    }, [handleDismiss, onTagDismiss]);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    const isNotPill = useBooleanProperty(elementRef, 'notPill', notPill);
    const isClickable = useBooleanProperty(elementRef, 'clickable', clickable);
    const isDismissible = useBooleanProperty(elementRef, 'dismissible', dismissible);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isSelected = useBooleanProperty(elementRef, 'selected', selected);

    return React.createElement(
      'ty-tag',
      {
        ...hostProps(props),
        // click is dispatched as composed CustomEvent by the web component — React's
        // synthetic onClick already catches it, so we just pass it through as onClick
        ...(onClick && { onClick }),
        ...(isNotPill && { 'not-pill': "" }),
        ...(isClickable && { clickable: "" }),
        ...(isDismissible && { dismissible: "" }),
        ...(isDisabled && { disabled: "" }),
        ...(isSelected && { selected: "" }),
        ref: elementRef,
      },
      children
    );
  }
);

TyTag.displayName = 'TyTag';