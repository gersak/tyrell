import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

// Type definitions for Ty Checkbox component
export interface TyCheckboxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'onInput'> {
  /** Checked state */
  checked?: boolean;

  /** Mixed state (dash) — visual/ARIA only; clicking resolves to checked */
  indeterminate?: boolean;

  /** Form field value when checked */
  value?: string;
  
  /** Form field name */
  name?: string;
  
  /** Disable the checkbox */
  disabled?: boolean;
  
  /** Required field */
  required?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Checkbox size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Semantic styling variant */
  flavor?: ShadedFlavor | (string & {});
  
  /**
   * Fires when checkbox state changes (React convention)
   * Maps to native 'input' event from ty-checkbox
   */
  onChange?: (event: CustomEvent<TyCheckboxEventDetail>) => void;
  
  /**
   * Fires on blur if value changed (native DOM behavior)
   * Maps to native 'change' event from ty-checkbox
   */
  onChangeCommit?: (event: CustomEvent<TyCheckboxEventDetail>) => void;
  
  /** Checkbox label content */
  children?: React.ReactNode;
}

export interface TyCheckboxEventDetail {
  value: boolean;
  checked: boolean;
  formValue: string | null;
  originalEvent: Event;
}

// React wrapper for ty-checkbox web component
export const TyCheckbox = React.forwardRef<HTMLElement, TyCheckboxProps>(
  ({ 
    children,
    checked,
    indeterminate,
    value,
    name,
    disabled,
    required,
    error,
    size,
    flavor,
    onChange,
    onChangeCommit,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Handle change events
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      // Map onChange to input event (React convention)
      const handleInput = (event: Event) => {
        if (onChange) {
          onChange(event as CustomEvent<TyCheckboxEventDetail>);
        }
      };

      // Map onChangeCommit to change event (blur behavior)
      const handleChangeCommit = (event: Event) => {
        if (onChangeCommit) {
          onChangeCommit(event as CustomEvent<TyCheckboxEventDetail>);
        }
      };

      // Map onChange → input event (React convention)
      element.addEventListener('input', handleInput);
      
      // Map onChangeCommit → change event (blur behavior)
      element.addEventListener('change', handleChangeCommit);

      return () => {
        element.removeEventListener('input', handleInput);
        element.removeEventListener('change', handleChangeCommit);
      };
    }, [onChange, onChangeCommit]);

    // Combine refs if needed
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
    // React 18 sets boolean attributes as empty strings on first render but
    // doesn't reliably remove them when the prop flips back to false on a
    // custom element. React 19+ handles this natively.
    const isChecked = useBooleanProperty(elementRef, 'checked', checked);
    const isIndeterminate = useBooleanProperty(elementRef, 'indeterminate', indeterminate);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isRequired = useBooleanProperty(elementRef, 'required', required);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    // Add boolean attributes
    if (isChecked) webComponentProps.checked = '';
    if (isIndeterminate) webComponentProps.indeterminate = '';
    if (isDisabled) webComponentProps.disabled = '';
    if (isRequired) webComponentProps.required = '';
    
    // Add string attributes
    if (value) webComponentProps.value = value;
    if (name) webComponentProps.name = name;
    if (error) webComponentProps.error = error;
    if (size) webComponentProps.size = size;
    if (flavor) webComponentProps.flavor = flavor;

    return React.createElement(
      'ty-checkbox',
      webComponentProps,
      children
    );
  }
);

TyCheckbox.displayName = 'TyCheckbox';