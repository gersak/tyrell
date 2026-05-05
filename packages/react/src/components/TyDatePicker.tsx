import React, { useEffect, useRef, useCallback } from 'react';
import { needsPropertyBridge } from '../utils/react-version';

// Type definitions for Ty DatePicker component
export interface TyDatePickerEventDetail {
  /** The selected date value (ISO string or formatted string based on format) */
  value: string | null;
  /** The selected date as milliseconds since epoch */
  milliseconds: number | null;
  /** Source of the change: "selection" | "time-change" | "clear" | "external" */
  source: 'selection' | 'time-change' | 'clear' | 'external';
  /** Formatted display value */
  formatted: string | null;
}

export interface TyDatePickerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The selected date value (ISO string or formatted string) */
  value?: string;
  
  /** Input size: "sm" | "md" | "lg" */
  size?: 'sm' | 'md' | 'lg';
  
  /** Visual flavor: "default" | "success" | "danger" | "warning" */
  flavor?: 'default' | 'success' | 'danger' | 'warning';
  
  /** Label text displayed above the input */
  label?: string;
  
  /** Placeholder text when no date is selected */
  placeholder?: string;
  
  /** Whether the field is required */
  required?: boolean;
  
  /** Whether the field is disabled */
  disabled?: boolean;
  
  /** Form field name for form submission */
  name?: string;
  
  /** Whether to show a clear button */
  clearable?: boolean;
  
  /** Date format: "short" | "medium" | "long" | "full" | custom format string */
  format?: 'short' | 'medium' | 'long' | 'full' | string;
  
  /** Locale for date formatting (e.g., "en-US", "de-DE") */
  locale?: string;
  
  /** Whether to include time selection */
  withTime?: boolean;
  
  /** Callback when the date value changes */
  onChange?: (event: CustomEvent<TyDatePickerEventDetail>) => void;
  
  /** Callback when the dropdown opens */
  onOpen?: (event: CustomEvent<{}>) => void;
  
  /** Callback when the dropdown closes */
  onClose?: (event: CustomEvent<{}>) => void;
}

// React wrapper for ty-date-picker web component
export const TyDatePicker = React.forwardRef<HTMLElement, TyDatePickerProps>(
  ({ 
    value,
    size,
    flavor,
    label,
    placeholder,
    required,
    disabled,
    name,
    clearable,
    format,
    locale,
    withTime,
    onChange,
    onOpen,
    onClose,
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

    // Sync value property with the web component.
    // React 18 workaround: prop-to-property bridging is unreliable for empty
    // strings on custom elements. React 19+ handles this natively.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current;
      if (element && value !== undefined) {
        // Set the value property directly on the element
        (element as any).value = value || '';
      }
    }, [value]);

    // Handle change events
    const handleChange = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<TyDatePickerEventDetail>;
      if (onChange) {
        onChange(customEvent);
      }
    }, [onChange]);

    // Handle open events
    const handleOpen = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<{}>;
      if (onOpen) {
        onOpen(customEvent);
      }
    }, [onOpen]);

    // Handle close events
    const handleClose = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<{}>;
      if (onClose) {
        onClose(customEvent);
      }
    }, [onClose]);

    // Set up event listeners
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const listeners: Array<[string, EventListener]> = [];

      if (onChange) {
        element.addEventListener('change', handleChange);
        listeners.push(['change', handleChange]);
      }
      
      if (onOpen) {
        element.addEventListener('open', handleOpen);
        listeners.push(['open', handleOpen]);
      }
      
      if (onClose) {
        element.addEventListener('close', handleClose);
        listeners.push(['close', handleClose]);
      }

      return () => {
        listeners.forEach(([eventName, handler]) => {
          element.removeEventListener(eventName, handler);
        });
      };
    }, [handleChange, handleOpen, handleClose, onChange, onOpen, onClose]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    // Add optional attributes only if they have values
    if (value !== undefined) {
      webComponentProps.value = value;
    }

    if (size) {
      webComponentProps.size = size;
    }

    if (flavor) {
      webComponentProps.flavor = flavor;
    }

    if (label) {
      webComponentProps.label = label;
    }

    if (placeholder) {
      webComponentProps.placeholder = placeholder;
    }

    if (required) {
      webComponentProps.required = '';  // Boolean attributes as empty string
    }

    if (disabled) {
      webComponentProps.disabled = '';  // Boolean attributes as empty string
    }

    if (name) {
      webComponentProps.name = name;
    }

    if (clearable) {
      webComponentProps.clearable = '';  // Boolean attributes as empty string
    }

    if (format) {
      webComponentProps.format = format;
    }

    if (locale) {
      webComponentProps.locale = locale;
    }

    if (withTime) {
      webComponentProps['with-time'] = '';  // Convert camelCase to kebab-case
    }

    return React.createElement('ty-date-picker', webComponentProps);
  }
);

TyDatePicker.displayName = 'TyDatePicker';