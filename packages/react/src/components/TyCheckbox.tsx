import React, { useEffect, useRef } from 'react';

// Type definitions for Ty Checkbox component
export interface TyCheckboxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'onInput'> {
  /** Checked state */
  checked?: boolean;
  
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
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
  
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

    // Imperatively sync `checked` to the underlying property. React 18 sets
    // boolean attributes as empty strings on first render but doesn't reliably
    // remove them when the prop flips back to false on a custom element.
    useEffect(() => {
      const element = elementRef.current as any;
      if (!element) return;
      if (Boolean(element.checked) !== Boolean(checked)) {
        element.checked = Boolean(checked);
      }
    }, [checked]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    // Add boolean attributes
    if (checked) webComponentProps.checked = '';
    if (disabled) webComponentProps.disabled = '';
    if (required) webComponentProps.required = '';
    
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