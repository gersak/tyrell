import React, { useEffect, useRef } from 'react';
import { useBooleanProperty } from '../utils/use-boolean-prop';

export interface TyRadioProps extends React.HTMLAttributes<HTMLElement> {
  /** Form field value (selected by parent ty-radio-group when matches its `value`) */
  value?: string;

  /**
   * Selected state. Usually managed by the parent `<TyRadioGroup>` based on its
   * own `value`; set explicitly only when using `ty-radio` outside a group.
   */
  checked?: boolean;

  /** Disable this individual radio */
  disabled?: boolean;

  /** Radio size — typically inherited from the parent group */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Semantic styling variant — typically inherited from the parent group */
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';

  /** Label content (wrap in a `<label>` for click delegation, see ty-radio docs) */
  children?: React.ReactNode;
}

export const TyRadio = React.forwardRef<HTMLElement, TyRadioProps>(
  ({ children, value, checked, disabled, size, flavor, ...props }, ref) => {
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

    // Imperative property sync for boolean props (see use-boolean-prop.ts).
    const isChecked = useBooleanProperty(elementRef, 'checked', checked);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);

    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    if (isChecked) webComponentProps.checked = '';
    if (isDisabled) webComponentProps.disabled = '';

    if (value !== undefined) webComponentProps.value = value;
    if (size) webComponentProps.size = size;
    if (flavor) webComponentProps.flavor = flavor;

    return React.createElement('ty-radio', webComponentProps, children);
  }
);

TyRadio.displayName = 'TyRadio';
