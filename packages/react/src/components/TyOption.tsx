import React, { useEffect, useRef } from 'react';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty Option component
export interface TyOptionProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;
  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
  children?: React.ReactNode;
}

// React wrapper for ty-option web component
export const TyOption = React.forwardRef<HTMLElement, TyOptionProps>(
  ({ children, disabled, selected, hidden, ...props }, ref) => {
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

    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isSelected = useBooleanProperty(elementRef, 'selected', selected);
    const isHidden = useBooleanProperty(elementRef, 'hidden', hidden);

    return React.createElement(
      'ty-option',
      {
        ...props,
        ...(isDisabled && { disabled: "" }),
        ...(isSelected && { selected: "" }),
        ...(isHidden && { hidden: "" }),
        ref: elementRef,
      },
      children
    );
  }
);

TyOption.displayName = 'TyOption';
