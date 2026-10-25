import React, { useEffect, useRef, useCallback } from 'react';
import { hostProps } from '../utils/host-props.js';
import { needsPropertyBridge } from '../utils/react-version.js';
import { useBooleanProperty } from '../utils/use-boolean-prop.js';

type BuiltinFlavor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;
type Placement =
  | 'top-start' | 'top' | 'top-end'
  | 'right-start' | 'right' | 'right-end'
  | 'bottom-start' | 'bottom' | 'bottom-end'
  | 'left-start' | 'left' | 'left-end';

export interface TyDatePickerEventDetail {
  /** What the form submits: a UTC ISO instant, or with `native` "YYYY-MM-DD" / "YYYY-MM-DDTHH:mm"; null when cleared */
  value: string | null;
  /** Local wall-clock: "YYYY-MM-DD", or "YYYY-MM-DDTHH:mm" with time */
  localValue: string | null;
  /** The selected date as milliseconds since epoch (date-only: when the day starts locally) */
  milliseconds: number | null;
  /** Source of the change: "selection" | "time-change" | "clear" | "external" */
  source: 'selection' | 'time-change' | 'clear' | 'external';
  /** Formatted display value */
  formatted: string | null;
}

export interface TyDatePickerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The selected date. Reads "YYYY-MM-DD" (that day), "YYYY-MM-DDTHH:mm[:ss]" (local wall-clock), an ISO instant with Z/offset (its local day/time) or epoch milliseconds (a number); it then holds what the form submits: a UTC ISO instant, or with `native` "YYYY-MM-DD" / "YYYY-MM-DDTHH:mm". */
  value?: string | number;

  /** Submit wall-clock values like the browser's own date inputs ("YYYY-MM-DD", or "YYYY-MM-DDTHH:mm" with time) instead of a UTC instant. */
  native?: boolean;

  /** Error message shown under the field — also applies danger styling */
  error?: string;
  
  /** Field size — the ladder shared by every field component
   *  (styles/field-size.ts). Defaults to 'sm'. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Visual flavor — built-in semantic, +/- shade, or a custom flavor backed by --ty-*-X tokens. Also tints the popup calendar's selected/today day. */
  flavor?: 'default' | ShadedFlavor | (string & {});
  
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
  
  /** No clear button (it shows once a date is set). */
  noClear?: boolean;
  
  /** Date format: "short" | "medium" | "long" | "full" | custom format string */
  format?: 'short' | 'medium' | 'long' | 'full' | string;
  
  /** Locale for date formatting (e.g., "en-US", "de-DE") */
  locale?: string;
  
  /** Whether to include time selection */
  withTime?: boolean;

  /** Earliest selectable date (ISO "YYYY-MM-DD") */
  min?: string;

  /** Latest selectable date (ISO "YYYY-MM-DD") */
  max?: string;

  /** Calendar popup placement, same vocabulary as ty-popup/ty-tooltip/ty-select: a side plus an optional cross-axis alignment (e.g. "bottom-start"). The calendar only lives above or below the field, so left/right degrade to auto-side with the alignment kept. Empty/unset = auto (below when it fits). */
  placement?: Placement;

  /** Callback when the date value changes */
  onChange?: (event: CustomEvent<TyDatePickerEventDetail>) => void;
  
  /** Callback when the dropdown opens */
  onOpen?: (event: CustomEvent<{}>) => void;
  
  /** Callback when the dropdown closes */
  onClose?: (event: CustomEvent<{}>) => void;
}

/** The underlying custom element, typed with its imperative clear() method. */
export interface TyDatePickerElement extends HTMLElement {
  clear(): void;
}

export const TyDatePicker = React.forwardRef<TyDatePickerElement, TyDatePickerProps>(
  ({ 
    value,
    size,
    flavor,
    label,
    placeholder,
    required,
    disabled,
    name,
    noClear,
    format,
    locale,
    withTime,
    native,
    error,
    min,
    max,
    placement,
    onChange,
    onOpen,
    onClose,
    ...props 
  }, ref) => {
    const elementRef = useRef<TyDatePickerElement>(null);
    // Epoch milliseconds go to the element as an ISO instant: React 18 writes
    // the attribute, where a digit string is no date. NaN clears.
    const elementValue = typeof value === 'number'
      ? (Number.isFinite(new Date(value).getTime()) ? new Date(value).toISOString() : '')
      : value;

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
      if (element && elementValue !== undefined) {
        (element as any).value = elementValue || '';
      }
    }, [elementValue]);

    const handleChange = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<TyDatePickerEventDetail>;
      if (onChange) {
        onChange(customEvent);
      }
    }, [onChange]);

    // Handle open/close events. See TyModal.tsx for why the
    // `event.target === element` guard is still here.
    const handleOpen = useCallback((event: Event) => {
      if (event.target !== elementRef.current) return;
      if (onOpen) onOpen(event as CustomEvent<{}>);
    }, [onOpen]);

    const handleClose = useCallback((event: Event) => {
      if (event.target !== elementRef.current) return;
      if (onClose) onClose(event as CustomEvent<{}>);
    }, [onClose]);

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

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (elementValue !== undefined) {
      webComponentProps.value = elementValue;
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

    const isRequired = useBooleanProperty(elementRef, 'required', required);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isNoClear = useBooleanProperty(elementRef, 'noClear', noClear);
    const isWithTime = useBooleanProperty(elementRef, 'withTime', withTime);
    const isNative = useBooleanProperty(elementRef, 'native', native);

    if (isRequired) webComponentProps.required = '';
    if (isDisabled) webComponentProps.disabled = '';
    if (isNoClear) webComponentProps['no-clear'] = '';
    if (isWithTime) webComponentProps['with-time'] = '';  // Convert camelCase to kebab-case
    if (isNative) webComponentProps.native = '';
    if (error) webComponentProps.error = error;

    if (name) {
      webComponentProps.name = name;
    }

    if (format) {
      webComponentProps.format = format;
    }

    if (locale) {
      webComponentProps.locale = locale;
    }

    if (min) {
      webComponentProps.min = min;
    }

    if (max) {
      webComponentProps.max = max;
    }

    if (placement) {
      webComponentProps.placement = placement;
    }

    return React.createElement('ty-date-picker', webComponentProps);
  }
);

TyDatePicker.displayName = 'TyDatePicker';