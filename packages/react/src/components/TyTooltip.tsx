import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

// Type definitions for Ty Tooltip component
export interface TyTooltipProps extends React.HTMLAttributes<HTMLElement> {
  /** Tooltip positioning relative to the parent element */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  
  /** Distance in pixels from the anchor element (default: 8) */
  offset?: number;
  
  /** Delay in milliseconds before showing tooltip (default: 600) */
  delay?: number;
  
  /** Disable the tooltip */
  disabled?: boolean;
  
  /** Semantic styling variant */
  flavor?: 'dark' | 'light' | 'info' | ShadedFlavor | (string & {});
  
  /** Tooltip content */
  children?: React.ReactNode;
}

// React wrapper for ty-tooltip web component
export const TyTooltip = React.forwardRef<HTMLElement, TyTooltipProps>(
  ({ 
    placement, 
    offset, 
    delay, 
    disabled, 
    flavor, 
    children, 
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Handle ref forwarding
    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    // Add optional attributes only if they have values
    if (placement) {
      webComponentProps.placement = placement;
    }

    if (offset !== undefined) {
      webComponentProps.offset = offset.toString();
    }

    if (delay !== undefined) {
      webComponentProps.delay = delay.toString();
    }

    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    if (isDisabled) webComponentProps.disabled = '';

    if (flavor) {
      webComponentProps.flavor = flavor;
    }

    return React.createElement(
      'ty-tooltip',
      webComponentProps,
      children
    );
  }
);

TyTooltip.displayName = 'TyTooltip';
