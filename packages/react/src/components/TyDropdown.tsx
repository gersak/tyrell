import React, { useEffect, useRef, useCallback } from 'react';
import { needsPropertyBridge } from '../utils/react-version';

// Option data structure for data-driven approach
export interface OptionData {
  value: string;
  text: string;
  disabled?: boolean;
}

// Event detail structure for dropdown events
export interface TyDropdownEventDetail {
  option: HTMLElement;
}

// Type definitions for Ty Dropdown component
export interface TyDropdownProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'style'> {
  style?: import('./TyInput').TyInputCSSProperties;
  /** Semantic styling variant */
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
  
  /** Dropdown size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Selected value */
  value?: string;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Dropdown label */
  label?: string;
  
  /** Disable the dropdown */
  disabled?: boolean;

  /**
   * Loading state — replaces the open popup options list with a centered
   * spinner. Search input stays usable. Pair with `externalSearch` while
   * fetching results from a parent-owned data source.
   */
  loading?: boolean;

  /** Make dropdown readonly */
  readonly?: boolean;
  
  /** Required field */
  required?: boolean;
  
  /** Show clear button */
  clearable?: boolean;

  /** Disable clear button (alias for clearable={false}) */
  notClearable?: boolean;

  /** Debounce in milliseconds (0-5000) */
  debounce?: number;

  /**
   * Switch to external (remote) search mode. Default is `false` — the dropdown
   * filters its options locally. When `true`, the dropdown stops filtering and
   * dispatches `search` events on each keystroke; the parent owns filtering
   * and updates the children.
   */
  externalSearch?: boolean;

  /** @deprecated Use `externalSearch` instead. */
  notSearchable?: boolean;

  /** @deprecated Use `externalSearch` instead. Pass `searchable={false}` was equivalent to `externalSearch={true}`. */
  searchable?: boolean;
  
  /** Form field name for form submission */
  name?: string;
  
  // Data-driven approach
  options?: OptionData[];
  
  // React event handlers
  onChange?: (event: CustomEvent<TyDropdownEventDetail>) => void;
  onSearch?: (event: CustomEvent<{ query: string; element: HTMLElement }>) => void;
  
  // Children for slotted approach
  children?: React.ReactNode;
}

// React wrapper for ty-dropdown web component
export const TyDropdown = React.forwardRef<HTMLElement, TyDropdownProps>(
  ({
    options,
    children,
    onChange,
    onSearch,
    disabled,
    loading,
    externalSearch,
    notSearchable,
    searchable,
    clearable,
    notClearable,
    debounce,
    name,
    value,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    const handleChange = useCallback((event: CustomEvent<TyDropdownEventDetail>) => {
      if (onChange) {
        onChange(event);
      }
    }, [onChange]);

    const handleSearch = useCallback((event: CustomEvent<{ query: string; element: HTMLElement }>) => {
      if (onSearch) {
        onSearch(event);
      }
    }, [onSearch]);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      // Listen for custom events from ty-dropdown
      if (onChange) {
        element.addEventListener('change', handleChange as EventListener);
      }

      if (onSearch) {
        element.addEventListener('search', handleSearch as EventListener);
      }

      return () => {
        if (onChange) {
          element.removeEventListener('change', handleChange as EventListener);
        }
        if (onSearch) {
          element.removeEventListener('search', handleSearch as EventListener);
        }
      };
    }, [handleChange, handleSearch, onChange, onSearch]);

    // Imperatively sync `value` to the underlying element's property whenever
    // it changes. React 18's prop-to-property bridging for custom elements is
    // unreliable for empty strings (programmatic resets), so we set the
    // property directly to guarantee the dropdown clears on `value=""`.
    // React 19+ handles this natively, so the effect short-circuits there.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current as any;
      if (!element) return;
      if (element.value !== value) {
        element.value = value ?? '';
      }
    }, [value]);

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

    // Render options from data if provided, otherwise use children
    const renderContent = () => {
      if (options && options.length > 0) {
        // Data-driven approach - create ty-option elements
        return options.map((option, index) => 
          React.createElement(
            'ty-option',
            {
              key: option.value || index,
              value: option.value,
              ...(option.disabled && { disabled: "" }),
            },
            option.text
          )
        );
      }
      
      // Slotted approach - use provided children
      return children;
    };

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    // Add conditional attributes
    if (disabled) webComponentProps.disabled = '';
    if (loading) webComponentProps.loading = '';

    // External search mode: parent owns filtering, dropdown dispatches search events.
    // `notSearchable` and `searchable={false}` are deprecated aliases for `externalSearch`.
    if (externalSearch || notSearchable || searchable === false) {
      webComponentProps['external-search'] = '';
    }
    
    // Handle clearable functionality
    if (clearable !== undefined) {
      if (clearable) {
        webComponentProps.clearable = '';
      } else {
        webComponentProps['not-clearable'] = '';
      }
    }
    
    if (notClearable) {
      webComponentProps['not-clearable'] = '';
    }
    
    // Add debounce attribute
    if (debounce !== undefined) {
      webComponentProps.debounce = debounce;
    }
    
    // Add string attributes
    if (name) webComponentProps.name = name;

    return React.createElement(
      'ty-dropdown',
      webComponentProps,
      renderContent()
    );
  }
);

TyDropdown.displayName = 'TyDropdown';