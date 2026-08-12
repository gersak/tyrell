import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;
type Placement =
  | 'top-start' | 'top' | 'top-end'
  | 'right-start' | 'right' | 'right-end'
  | 'bottom-start' | 'bottom' | 'bottom-end'
  | 'left-start' | 'left' | 'left-end';

export interface TyTooltipProps extends React.HTMLAttributes<HTMLElement> {
  /** Tooltip positioning relative to the parent element: a side plus an optional cross-axis alignment (e.g. "bottom-start") */
  placement?: Placement;
  
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

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

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
