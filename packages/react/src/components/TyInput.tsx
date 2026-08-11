import React, { useEffect, useRef, useCallback } from 'react';
import { hostProps } from '../utils/host-props';
import { needsPropertyBridge } from '../utils/react-version';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

export interface TyInputEventDetail {
  value: any; // shadow value (processed/parsed)
  formattedValue: string; // user-visible formatted value
  rawValue: string; // raw input value
  originalEvent: Event; // original DOM event
}

export interface TyInputCSSProperties extends React.CSSProperties {
  '--input-bg'?: string;
  '--input-color'?: string;
  '--input-border'?: string;
  '--input-border-hover'?: string;
  '--input-border-focus'?: string;
  '--input-shadow-focus'?: string;
  '--input-placeholder'?: string;
  '--input-disabled-bg'?: string;
  '--input-disabled-border'?: string;
  '--input-disabled-color'?: string;
}

export interface TyInputProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'onFocus' | 'onBlur' | 'style'> {
  style?: TyInputCSSProperties;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  | 'currency' | 'percent' | 'compact';

  /** Semantic styling variant */
  flavor?: ShadedFlavor | (string & {});

  /** Input size */
  /** Field size — fields come in exactly three; legacy xs/xl map to sm/lg */
  size?: 'sm' | 'md' | 'lg';

  /** Input value */
  value?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Input label */
  label?: string;

  /** Error message */
  error?: string;

  /** Disable the input */
  disabled?: boolean;

  /** Required field */
  required?: boolean;

  /** Form field name for form submission */
  name?: string;

  /** Checked state for checkbox inputs */
  checked?: boolean;

  // Numeric formatting props
  currency?: string;
  locale?: string;
  precision?: string | number;

  /** Debounce in milliseconds (0-5000) */
  debounce?: number;

  // React event handlers - override with our custom types
  /**
   * Fires on every keystroke (React convention)
   * Maps to native 'input' event from ty-input
   */
  onChange?: (event: CustomEvent<TyInputEventDetail>) => void;

  /**
   * Fires on blur if value changed (native DOM behavior)
   * Maps to native 'change' event from ty-input
   */
  onChangeCommit?: (event: CustomEvent<TyInputEventDetail>) => void;

  /** Standard focus event */
  onFocus?: (event: FocusEvent) => void;

  /** Standard blur event */
  onBlur?: (event: FocusEvent) => void;
}

// One-time global warning flags so we don't spam the console.
let _warnedOnInputProp = false;

export const TyInput = React.forwardRef<HTMLElement, TyInputProps>(
  ({ onChange, onChangeCommit, onFocus, onBlur, disabled, required, name, checked, debounce, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Catch the most common mistake: passing `onInput` (React's prop) instead
    // of `onChange` (our wrapper's prop). React's synthetic-event system
    // strips event.detail, so the user's handler crashes on `e.detail.value`.
    // Forward to onChange and log a one-shot warning.
    const onInputProp = (props as any).onInput as ((e: any) => void) | undefined;
    if (onInputProp && !onChange) {
      if (!_warnedOnInputProp) {
        _warnedOnInputProp = true;
        console.warn(
          '[tyrell-react] <TyInput> received `onInput`. ' +
          'React strips event.detail; use `onChange` instead — it receives the raw CustomEvent. ' +
          'Forwarding for now, but please rename the prop.'
        );
      }
      onChange = onInputProp;
    }
    // Either way, drop onInput from spread so React doesn't double-wire it.
    delete (props as any).onInput;

    // Map onChange to input event (React convention)
    const handleInput = useCallback((event: CustomEvent<TyInputEventDetail>) => {
      if (onChange) {
        onChange(event);
      }
    }, [onChange]);

    // Map onChangeCommit to change event (blur behavior)
    const handleChangeCommit = useCallback((event: CustomEvent<TyInputEventDetail>) => {
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

      if (onChange) {
        element.addEventListener('input', handleInput as EventListener);
      }

      if (onChangeCommit) {
        element.addEventListener('change', handleChangeCommit as EventListener);
      }

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

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    // Imperatively sync `value` to the underlying element's property whenever
    // the React prop changes. React 18's prop-to-property bridging for custom
    // elements is unreliable for empty strings, so we set the property directly
    // to guarantee resets (`value=""`) clear the visible content. React 19+
    // handles this natively, so the effect short-circuits there.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current as any;
      if (!element) return;
      const next = (props as any).value ?? '';
      if (element.value !== next) {
        element.value = next;
      }
    }, [(props as any).value]);

    // Imperative property sync for boolean props (see use-boolean-prop.ts).
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isRequired = useBooleanProperty(elementRef, 'required', required);
    const isChecked = useBooleanProperty(elementRef, 'checked', checked);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (isDisabled) webComponentProps.disabled = '';
    if (isRequired) webComponentProps.required = '';
    if (isChecked) webComponentProps.checked = '';

    if (name) webComponentProps.name = name;

    if (debounce !== undefined) webComponentProps.debounce = debounce;

    return React.createElement(
      'ty-input',
      webComponentProps
    );
  }
);

TyInput.displayName = 'TyInput';
