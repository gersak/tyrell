import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

// Type definitions for Ty Copy component
export interface TyCopyProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Text to copy */
  value?: string;
  
  /** Field label */
  label?: string;
  
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Semantic styling variant */
  flavor?: ShadedFlavor | (string & {});
  
  /** Display format */
  format?: 'text' | 'code';
  
  /** Multi-line display */
  multiline?: boolean;
  
  /** Disable the field */
  disabled?: boolean;
  
  /** Required field */
  required?: boolean;

  /** Fired after the value is copied to the clipboard */
  onCopySuccess?: (event: CustomEvent) => void;

  /** Fired when copying to the clipboard fails */
  onCopyError?: (event: CustomEvent) => void;
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
    onCopySuccess,
    onCopyError,
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

    // Custom events → React callbacks
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      const bound: Array<[string, EventListener]> = [];
      if (onCopySuccess) {
        const h = (e: Event) => onCopySuccess(e as CustomEvent);
        el.addEventListener('copy-success', h); bound.push(['copy-success', h]);
      }
      if (onCopyError) {
        const h = (e: Event) => onCopyError(e as CustomEvent);
        el.addEventListener('copy-error', h); bound.push(['copy-error', h]);
      }
      return () => bound.forEach(([n, h]) => el.removeEventListener(n, h));
    }, [onCopySuccess, onCopyError]);

    const isMultiline = useBooleanProperty(elementRef, 'multiline', multiline);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isRequired = useBooleanProperty(elementRef, 'required', required);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
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
