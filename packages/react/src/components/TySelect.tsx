import React, { useEffect, useRef, useCallback } from 'react';
import { hostProps } from '../utils/host-props';
import { needsPropertyBridge } from '../utils/react-version';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty Select component
export interface TySelectItem {
  value: string;
  label: string;
  flavor: string | null;
}

export interface TySelectEventDetail {
  /** Scalar for single select, array when `multiple` */
  value: string | string[] | null;
  /** Always the array form of the selection */
  values: string[];
  /** Rich info per selected value — enough to render chips out-of-band */
  items: TySelectItem[];
  /** Action that triggered the change */
  action: 'add' | 'remove' | 'clear' | 'set';
  /** The specific value that changed */
  item: string | null;
}

export interface TySelectProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'style'> {
  style?: import('./TyInput').TyInputCSSProperties;

  /** Selected value(s) — string, comma-separated string, or array */
  value?: string | string[];

  /** Multi select (native <select multiple> semantics). Default: single. */
  multiple?: boolean;

  /** Compact content-hugging trigger (toolbars, filter bars) instead of the full-width field look */
  compact?: boolean;

  /** Placeholder shown while nothing is selected */
  placeholder?: string;

  /** Label text above the field */
  label?: string;

  /** Form field name — single submits one entry, multiple submits repeated entries */
  name?: string;

  /** Disable the select */
  disabled?: boolean;

  /** Read-only */
  readonly?: boolean;

  /** Mark the field as required */
  required?: boolean;

  /**
   * Search row visibility: 'auto' (default) shows it only for 8+ options,
   * 'always' / 'never' force it. external-search always shows it.
   */
  searchable?: 'auto' | 'always' | 'never' | boolean;

  /**
   * External (remote) search mode — the component stops filtering and emits
   * debounced `search` events; replace the option children in response.
   */
  externalSearch?: boolean;

  /** Debounce for the search event in ms (0-5000) */
  debounce?: number;

  /** Loading state — shows a spinner in the options area (external search in flight) */
  loading?: boolean;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Callback when selection changes */
  onChange?: (event: CustomEvent<TySelectEventDetail>) => void;

  /** Callback fired on each search input change (debounced). Use for external/server-side filtering. */
  onSearch?: (event: CustomEvent<{ query: string; element: HTMLElement }>) => void;
  onOpen?: (event: CustomEvent) => void;
  onClose?: (event: CustomEvent) => void;

  /** TyOption children (plus optional slot="trigger" / slot="start" / slot="end" elements) */
  children?: React.ReactNode;
}

// React wrapper for ty-select web component
export const TySelect = React.forwardRef<HTMLElement, TySelectProps>(
  ({
    value,
    multiple,
    compact,
    placeholder,
    label,
    name,
    disabled,
    readonly,
    required,
    searchable,
    externalSearch,
    debounce,
    loading,
    size,
    onChange,
    onSearch,
    onOpen,
    onClose,
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

    // Imperatively sync `value` so resets ('' or null) reliably clear the
    // visible selection. React 18 workaround; React 19+ handles this natively.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current as any;
      if (!element) return;
      const next = Array.isArray(value) ? value.join(',') : (value ?? '');
      if (element.value !== next) {
        element.value = next;
      }
    }, [value]);

    // Handle events
    const handleChange = useCallback((event: Event) => {
      if (onChange) onChange(event as CustomEvent<TySelectEventDetail>);
    }, [onChange]);

    const handleSearch = useCallback((event: Event) => {
      if (onSearch) onSearch(event as CustomEvent<{ query: string; element: HTMLElement }>);
    }, [onSearch]);

    const handleOpen = useCallback((event: Event) => { if (onOpen) onOpen(event as CustomEvent); }, [onOpen]);
    const handleClose = useCallback((event: Event) => { if (onClose) onClose(event as CustomEvent); }, [onClose]);

    // Set up event listeners
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      if (onChange) element.addEventListener('change', handleChange);
      if (onSearch) element.addEventListener('search', handleSearch);
      if (onOpen) element.addEventListener('open', handleOpen);
      if (onClose) element.addEventListener('close', handleClose);

      return () => {
        if (onChange) element.removeEventListener('change', handleChange);
        if (onSearch) element.removeEventListener('search', handleSearch);
        if (onOpen) element.removeEventListener('open', handleOpen);
        if (onClose) element.removeEventListener('close', handleClose);
      };
    }, [handleChange, handleSearch, handleOpen, handleClose, onChange, onSearch, onOpen, onClose]);

    // Imperative property sync for boolean props (see use-boolean-prop.ts).
    const isMultiple = useBooleanProperty(elementRef, 'multiple', multiple);
    const isCompact = useBooleanProperty(elementRef, 'compact', compact);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isReadonly = useBooleanProperty(elementRef, 'readonly', readonly);
    const isRequired = useBooleanProperty(elementRef, 'required', required);
    const isLoading = useBooleanProperty(elementRef, 'loading', loading);
    const isExternalSearch = useBooleanProperty(elementRef, 'externalSearch', externalSearch);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    // Handle value conversion (array to comma-separated string)
    if (value !== undefined) {
      webComponentProps.value = Array.isArray(value) ? value.join(',') : value;
    }

    if (isMultiple) webComponentProps.multiple = '';
    if (isCompact) webComponentProps.compact = '';
    if (isDisabled) webComponentProps.disabled = '';
    if (isReadonly) webComponentProps.readonly = '';
    if (isRequired) webComponentProps.required = '';
    if (isLoading) webComponentProps.loading = '';
    if (isExternalSearch) webComponentProps['external-search'] = '';

    if (placeholder) webComponentProps.placeholder = placeholder;
    if (label) webComponentProps.label = label;
    if (name) webComponentProps.name = name;
    if (size) webComponentProps.size = size;
    if (debounce !== undefined) webComponentProps.debounce = debounce.toString();
    if (searchable === 'always' || searchable === true) webComponentProps.searchable = 'true';
    else if (searchable === 'never' || searchable === false) webComponentProps.searchable = 'false';
    // 'auto' / undefined → omit (component default)

    return React.createElement('ty-select', webComponentProps, children);
  }
);

TySelect.displayName = 'TySelect';

// ============================================================================
// TySelectedTags — out-of-band chip display for a TySelect
// ============================================================================

export interface TySelectedTagsProps extends React.HTMLAttributes<HTMLElement> {
  /** id of the ty-select to display. Falls back to the previous element sibling. */
  htmlFor?: string;
  /** Optional <template> child as chip blueprint ({value}/{label}/{flavor}/{data-*} placeholders) */
  children?: React.ReactNode;
}

// React wrapper for ty-selected-tags web component
export const TySelectedTags = React.forwardRef<HTMLElement, TySelectedTagsProps>(
  ({ htmlFor, children, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') ref(elementRef.current);
        else ref.current = elementRef.current;
      }
    }, [ref]);

    const webComponentProps: Record<string, any> = { ...hostProps(props), ref: elementRef };
    if (htmlFor) webComponentProps.for = htmlFor;

    return React.createElement('ty-selected-tags', webComponentProps, children);
  }
);

TySelectedTags.displayName = 'TySelectedTags';
