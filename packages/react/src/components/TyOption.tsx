import React, { useEffect, useRef } from 'react';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty Option component
export interface TyOptionProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;

  /**
   * Clean display text (native <option label> semantics) — used by ty-select
   * for field summaries and by ty-selected-tags chips when the option's
   * children are rich HTML. data-* attributes feed chip templates.
   */
  label?: string;

  /** Semantic flavor — carried onto ty-selected-tags chips */
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral' | 'info';

  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
  children?: React.ReactNode;
}

// React wrapper for ty-option web component
export const TyOption = React.forwardRef<HTMLElement, TyOptionProps>(
  ({ children, label, flavor, disabled, selected, hidden, ...props }, ref) => {
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
        ...(label && { label }),
        ...(flavor && { flavor }),
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
