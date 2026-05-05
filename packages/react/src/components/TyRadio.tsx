import React, { useEffect, useRef } from 'react';
import { needsPropertyBridge } from '../utils/react-version';

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

    // Imperatively sync `checked` to the underlying property. React 18 sets
    // boolean attributes as empty strings on first render but doesn't reliably
    // remove them when the prop flips back to false on a custom element.
    // React 19+ handles boolean prop-to-property bridging natively.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current as any;
      if (!element) return;
      if (Boolean(element.checked) !== Boolean(checked)) {
        element.checked = Boolean(checked);
      }
    }, [checked]);

    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    if (checked) webComponentProps.checked = '';
    if (disabled) webComponentProps.disabled = '';

    if (value !== undefined) webComponentProps.value = value;
    if (size) webComponentProps.size = size;
    if (flavor) webComponentProps.flavor = flavor;

    return React.createElement('ty-radio', webComponentProps, children);
  }
);

TyRadio.displayName = 'TyRadio';
