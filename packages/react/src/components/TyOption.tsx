import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

export interface TyOptionProps extends React.HTMLAttributes<HTMLElement> {
  value?: string;

  /**
   * Clean display text (native <option label> semantics) — used by ty-select
   * for field summaries and by ty-selected-options chips when the option's
   * children are rich HTML. data-* attributes feed chip templates.
   */
  label?: string;

  /** Semantic flavor — carried onto ty-selected-options chips */
  flavor?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'info';

  disabled?: boolean;
  selected?: boolean;
  hidden?: boolean;
  children?: React.ReactNode;
}

export const TyOption = React.forwardRef<HTMLElement, TyOptionProps>(
  ({ children, label, flavor, disabled, selected, hidden, ...props }, ref) => {
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

    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isSelected = useBooleanProperty(elementRef, 'selected', selected);
    const isHidden = useBooleanProperty(elementRef, 'hidden', hidden);

    return React.createElement(
      'ty-option',
      {
        ...hostProps(props),
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
