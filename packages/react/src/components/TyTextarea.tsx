import React, { useEffect, useRef, useCallback } from 'react';
import { hostProps } from '../utils/host-props';
import { needsPropertyBridge } from '../utils/react-version';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Event detail structure for ty-textarea events
export interface TyTextareaEventDetail {
  value: string; // textarea value
  originalEvent: Event; // original DOM event
}

// Type definitions for Ty Textarea component
export interface TyTextareaProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'onInput' | 'onFocus' | 'onBlur' | 'style'> {
  style?: import('./TyInput').TyInputCSSProperties;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string; // Important for HTMX/form compatibility
  
  // Textarea-specific props
  rows?: string | number;
  cols?: string | number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  minHeight?: string; // e.g., '100px' - converts to min-height
  maxHeight?: string; // e.g., '500px' - converts to max-height
  
  // React event handlers - override with our custom types
  /**
   * Fires on every keystroke (React convention)
   * Maps to native 'input' event from ty-textarea
   */
  onChange?: (event: CustomEvent<TyTextareaEventDetail>) => void;
  
  /**
   * Fires on blur if value changed (native DOM behavior)
   * Maps to native 'change' event from ty-textarea
   */
  onChangeCommit?: (event: CustomEvent<TyTextareaEventDetail>) => void;
  
  /** Standard focus event */
  onFocus?: (event: FocusEvent) => void;
  
  /** Standard blur event */
  onBlur?: (event: FocusEvent) => void;
}

// One-time warning flag.
let _warnedOnInputProp = false;

// React wrapper for ty-textarea web component
export const TyTextarea = React.forwardRef<HTMLElement, TyTextareaProps>(
  ({ onChange, onChangeCommit, onFocus, onBlur, disabled, required, minHeight, maxHeight, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Same `onInput` → `onChange` redirect as TyInput. React's synthetic-event
    // system strips event.detail; users hitting e.detail.value will crash.
    const onInputProp = (props as any).onInput as ((e: any) => void) | undefined;
    if (onInputProp && !onChange) {
      if (!_warnedOnInputProp) {
        _warnedOnInputProp = true;
        console.warn(
          '[tyrell-react] <TyTextarea> received `onInput`. ' +
          'React strips event.detail; use `onChange` instead — it receives the raw CustomEvent. ' +
          'Forwarding for now, but please rename the prop.'
        );
      }
      onChange = onInputProp;
    }
    delete (props as any).onInput;

    // Map onChange to input event (React convention)
    const handleInput = useCallback((event: CustomEvent<TyTextareaEventDetail>) => {
      if (onChange) {
        onChange(event);
      }
    }, [onChange]);

    // Map onChangeCommit to change event (blur behavior)
    const handleChangeCommit = useCallback((event: CustomEvent<TyTextareaEventDetail>) => {
      if (onChangeCommit) {
        onChangeCommit(event);
      }
    }, [onChangeCommit]);

    const handleFocus = useCallback((event: FocusEvent) => {
      if (onFocus) {
        onFocus(event);
      }
    }, [onFocus]);

    const handleBlur = useCallback((event: FocusEvent) => {
      if (onBlur) {
        onBlur(event);
      }
    }, [onBlur]);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      // Listen for custom input/change events from ty-textarea
      // Map onChange → input event (React convention)
      if (onChange) {
        element.addEventListener('input', handleInput as EventListener);
      }
      
      // Map onChangeCommit → change event (blur behavior)
      if (onChangeCommit) {
        element.addEventListener('change', handleChangeCommit as EventListener);
      }

      // Listen for standard focus/blur events
      if (onFocus) {
        element.addEventListener('focus', handleFocus as EventListener);
      }

      if (onBlur) {
        element.addEventListener('blur', handleBlur as EventListener);
      }

      return () => {
        if (onChange) {
          element.removeEventListener('input', handleInput as EventListener);
        }
        if (onChangeCommit) {
          element.removeEventListener('change', handleChangeCommit as EventListener);
        }
        if (onFocus) {
          element.removeEventListener('focus', handleFocus as EventListener);
        }
        if (onBlur) {
          element.removeEventListener('blur', handleBlur as EventListener);
        }
      };
    }, [handleInput, handleChangeCommit, handleFocus, handleBlur, onChange, onChangeCommit, onFocus, onBlur]);

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

    // Imperatively sync `value` to the underlying element's property.
    // React 18 workaround: prop-to-property bridging is unreliable for empty
    // strings on custom elements. React 19+ handles this natively.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current as any;
      if (!element) return;
      const next = (props as any).value ?? '';
      if (element.value !== next) {
        element.value = next;
      }
    }, [(props as any).value]);

    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isRequired = useBooleanProperty(elementRef, 'required', required);

    return React.createElement(
      'ty-textarea',
      {
        ...hostProps(props),
        ...(isDisabled && { disabled: "" }),
        ...(isRequired && { required: "" }),
        ...(minHeight && { 'min-height': minHeight }),  // Convert camelCase to kebab-case
        ...(maxHeight && { 'max-height': maxHeight }),  // Convert camelCase to kebab-case
        ref: elementRef,
      }
    );
  }
);

TyTextarea.displayName = 'TyTextarea';