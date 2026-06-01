import React, { useEffect, useRef, useCallback } from 'react';
import { needsPropertyBridge } from '../utils/react-version';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty Multiselect component
export interface TyMultiselectEventDetail {
  /** Array of currently selected values */
  values: string[];
  /** Action that triggered the change: "add" | "remove" */
  action: 'add' | 'remove';
  /** The specific item that was added or removed */
  item: string;
}

export interface TyMultiselectProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'style'> {
  style?: import('./TyInput').TyInputCSSProperties;
  /** Current selected values as comma-separated string or array */
  value?: string | string[];
  
  /** Placeholder text when no items are selected */
  placeholder?: string;
  
  /** Disable the multiselect component */
  disabled?: boolean;

  /**
   * Loading state — replaces the available-options area with a centered
   * spinner. Search input stays usable. Pair with `externalSearch` while
   * fetching results from a parent-owned data source.
   */
  loading?: boolean;

  /** Make the multiselect read-only */
  readonly?: boolean;
  
  /** Semantic styling variant */
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
  
  /** Label text for the multiselect */
  label?: string;
  
  /** Mark the field as required */
  required?: boolean;

  /**
   * Switch to external (remote) search mode. Default is `false` — the
   * multiselect filters its own children client-side. Set to `true` when you
   * want to handle filtering yourself (e.g. server-side): the component will
   * dispatch `search` events on each keystroke, and you must update the children
   * in response. The `onSearch` prop receives those events.
   */
  externalSearch?: boolean;

  /** Debounce in milliseconds (0-5000) */
  debounce?: number;
  
  /** Mobile section label for selected items */
  selectedLabel?: string;
  
  /** Form field name for form submission */
  name?: string;
  
  /** Callback when selection changes */
  onChange?: (event: CustomEvent<TyMultiselectEventDetail>) => void;

  /** Callback fired on each search input change (debounced by `debounce`). Use for external/server-side filtering. */
  onSearch?: (event: CustomEvent<{ query: string; element: HTMLElement }>) => void;

  /** Children should be TyTag components, not TyOption */
  children?: React.ReactNode;
}

// React wrapper for ty-multiselect web component
export const TyMultiselect = React.forwardRef<HTMLElement, TyMultiselectProps>(
  ({
    value,
    placeholder,
    disabled,
    loading,
    readonly,
    flavor,
    label,
    required,
    externalSearch,
    debounce,
    selectedLabel,
    name,
    onChange,
    onSearch,
    children,
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

    // Imperatively sync `value` to the underlying property so resets
    // (`value=""` or null) reliably clear the visible selection.
    // React 18 workaround; React 19+ handles this natively.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current as any;
      if (!element) return;
      const next = (props as any).value ?? '';
      if (element.value !== next) {
        element.value = next;
      }
    }, [(props as any).value]);

    // Handle change events
    const handleChange = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<TyMultiselectEventDetail>;
      if (onChange) {
        onChange(customEvent);
      }
    }, [onChange]);

    const handleSearch = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<{ query: string; element: HTMLElement }>;
      if (onSearch) {
        onSearch(customEvent);
      }
    }, [onSearch]);

    // Set up event listeners
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      if (onChange) element.addEventListener('change', handleChange);
      if (onSearch) element.addEventListener('search', handleSearch);

      return () => {
        if (onChange) element.removeEventListener('change', handleChange);
        if (onSearch) element.removeEventListener('search', handleSearch);
      };
    }, [handleChange, handleSearch, onChange, onSearch]);

    // Imperative property sync for boolean props (see use-boolean-prop.ts).
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isLoading = useBooleanProperty(elementRef, 'loading', loading);
    const isReadonly = useBooleanProperty(elementRef, 'readonly', readonly);
    const isRequired = useBooleanProperty(elementRef, 'required', required);
    const isExternalSearch = useBooleanProperty(elementRef, 'externalSearch', externalSearch);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    // Handle value conversion (array to comma-separated string)
    if (value !== undefined) {
      const valueString = Array.isArray(value) ? value.join(',') : value;
      webComponentProps.value = valueString;
    }

    // Add optional attributes only if they have values
    if (placeholder) {
      webComponentProps.placeholder = placeholder;
    }

    if (isLoading) webComponentProps.loading = '';
    if (isDisabled) webComponentProps.disabled = '';
    if (isReadonly) webComponentProps.readonly = '';
    if (isRequired) webComponentProps.required = '';
    if (isExternalSearch) webComponentProps['external-search'] = '';

    if (flavor) {
      webComponentProps.flavor = flavor;
    }

    if (label) {
      webComponentProps.label = label;
    }

    if (name) {
      webComponentProps.name = name;
    }

    // Add debounce attribute
    if (debounce !== undefined) {
      webComponentProps.debounce = debounce;
    }
    
    // Add selectedLabel attribute
    if (selectedLabel) {
      webComponentProps['selected-label'] = selectedLabel;
    }

    return React.createElement(
      'ty-multiselect',
      webComponentProps,
      children
    );
  }
);

TyMultiselect.displayName = 'TyMultiselect';