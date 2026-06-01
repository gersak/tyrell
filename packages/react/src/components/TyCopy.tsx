import React, { useEffect, useRef } from 'react';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty Copy component
export interface TyCopyProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Text to copy */
  value?: string;
  
  /** Field label */
  label?: string;
  
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Semantic styling variant */
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
  
  /** Display format */
  format?: 'text' | 'code';
  
  /** Multi-line display */
  multiline?: boolean;
  
  /** Disable the field */
  disabled?: boolean;
  
  /** Required field */
  required?: boolean;
}

// React wrapper for ty-copy web component
export const TyCopy = React.forwardRef<HTMLElement, TyCopyProps>(
  ({ 
    value,
    label,
    size,
    flavor,
    format,
    multiline,
    disabled,
    required,
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

    const isMultiline = useBooleanProperty(elementRef, 'multiline', multiline);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isRequired = useBooleanProperty(elementRef, 'required', required);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    // Add string attributes
    if (value) webComponentProps.value = value;
    if (label) webComponentProps.label = label;
    if (size) webComponentProps.size = size;
    if (flavor) webComponentProps.flavor = flavor;
    if (format) webComponentProps.format = format;

    // Add boolean attributes
    if (isMultiline) webComponentProps.multiline = '';
    if (isDisabled) webComponentProps.disabled = '';
    if (isRequired) webComponentProps.required = '';

    return React.createElement('ty-copy', webComponentProps);
  }
);

TyCopy.displayName = 'TyCopy';
