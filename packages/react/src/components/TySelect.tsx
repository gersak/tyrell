import React, { useEffect, useRef, useCallback } from 'react';
import { hostProps } from '../utils/host-props';
import { needsPropertyBridge } from '../utils/react-version';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

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
  action: 'add' | 'remove' | 'clear' | 'set' | 'create';
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

  /**
   * Enter on unmatched search text mints a new <ty-option> (forces the
   * search row on, same as externalSearch). Listen to onCreate to mutate
   * the value before it's created, or preventDefault() to take over
   * entirely (e.g. after a server round-trip).
   */
  allowCreate?: boolean;

  /**
   * Opt-in normalizer for the value allowCreate mints — the display label
   * is always kept verbatim. 'slug': lowercase, spaces → '_', strips
   * everything else non-alphanumeric. Default: value === typed text.
   */
  createTransform?: 'slug';

  /** Loading state — shows a spinner in the options area (external search in flight) */
  loading?: boolean;

  /** Size variant */
  /** Field size — fields come in exactly three; legacy xs/xl map to sm/lg */
  size?: 'sm' | 'md' | 'lg';

  /** Horizontal popup anchor: "start" (default, trigger's left edge) or "end" (trigger's right edge) — clamped into the viewport either way. Useful with a custom slot="trigger" element. */
  align?: 'start' | 'end';

  /** Built-in x clear button in the default/compact trigger, shown once something is selected. Default true. Not shown with slot="trigger" — use the ref's clear() method there instead. */
  clearable?: boolean;

  /** Visual flavor for the field border — built-in semantic, +/- shade, or a custom flavor backed by --ty-*-X tokens */
  flavor?: ShadedFlavor | (string & {});

  /** Callback when selection changes */
  onChange?: (event: CustomEvent<TySelectEventDetail>) => void;

  /** Callback fired on each search input change (debounced). Use for external/server-side filtering. */
  onSearch?: (event: CustomEvent<{ query: string; element: HTMLElement }>) => void;
  onOpen?: (event: CustomEvent) => void;
  onClose?: (event: CustomEvent) => void;

  /**
   * Fired before allowCreate mints a new option — cancelable. Mutate
   * `event.detail.value` to change the id that gets created (e.g. slugify
   * it yourself), or call `event.preventDefault()` to create it yourself.
   */
  onCreate?: (event: CustomEvent<{ value: string; label: string }>) => void;

  /** TyOption children (plus optional slot="trigger" / slot="start" / slot="end" elements) */
  children?: React.ReactNode;
}

/** The underlying custom element, typed with its imperative clear() method — useful with a ref, e.g. for slot="trigger" custom triggers that call it directly instead of relying on the built-in clear button. */
export interface TySelectElement extends HTMLElement {
  clear(): void;
}

// React wrapper for ty-select web component
export const TySelect = React.forwardRef<TySelectElement, TySelectProps>(
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
    allowCreate,
    createTransform,
    loading,
    size,
    align,
    clearable,
    flavor,
    onChange,
    onSearch,
    onOpen,
    onClose,
    onCreate,
    children,
    ...props
  }, ref) => {
    const elementRef = useRef<TySelectElement>(null);

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
    const handleCreate = useCallback((event: Event) => {
      if (onCreate) onCreate(event as CustomEvent<{ value: string; label: string }>);
    }, [onCreate]);

    // Set up event listeners
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      if (onChange) element.addEventListener('change', handleChange);
      if (onSearch) element.addEventListener('search', handleSearch);
      if (onOpen) element.addEventListener('open', handleOpen);
      if (onClose) element.addEventListener('close', handleClose);
      if (onCreate) element.addEventListener('create', handleCreate);

      return () => {
        if (onChange) element.removeEventListener('change', handleChange);
        if (onSearch) element.removeEventListener('search', handleSearch);
        if (onOpen) element.removeEventListener('open', handleOpen);
        if (onClose) element.removeEventListener('close', handleClose);
        if (onCreate) element.removeEventListener('create', handleCreate);
      };
    }, [handleChange, handleSearch, handleOpen, handleClose, handleCreate, onChange, onSearch, onOpen, onClose, onCreate]);

    // Imperative property sync for boolean props (see use-boolean-prop.ts).
    const isMultiple = useBooleanProperty(elementRef, 'multiple', multiple);
    const isCompact = useBooleanProperty(elementRef, 'compact', compact);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isReadonly = useBooleanProperty(elementRef, 'readonly', readonly);
    const isRequired = useBooleanProperty(elementRef, 'required', required);
    const isLoading = useBooleanProperty(elementRef, 'loading', loading);
    const isExternalSearch = useBooleanProperty(elementRef, 'externalSearch', externalSearch);
    const isAllowCreate = useBooleanProperty(elementRef, 'allowCreate', allowCreate);
    const isClearable = useBooleanProperty(elementRef, 'clearable', clearable);

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
    if (isAllowCreate) webComponentProps['allow-create'] = '';

    if (placeholder) webComponentProps.placeholder = placeholder;
    if (label) webComponentProps.label = label;
    if (name) webComponentProps.name = name;
    if (size) webComponentProps.size = size;
    if (align) webComponentProps.align = align;
    if (isClearable) webComponentProps.clearable = '';
    if (flavor) webComponentProps.flavor = flavor;
    if (debounce !== undefined) webComponentProps.debounce = debounce.toString();
    if (createTransform) webComponentProps['create-transform'] = createTransform;
    if (searchable === 'always' || searchable === true) webComponentProps.searchable = 'true';
    else if (searchable === 'never' || searchable === false) webComponentProps.searchable = 'false';
    // 'auto' / undefined → omit (component default)

    return React.createElement('ty-select', webComponentProps, children);
  }
);

TySelect.displayName = 'TySelect';

// ============================================================================
// TySelectedOptions — out-of-band chip display for a TySelect
// (ty-selected-tags below is the same element under its original tag name,
// kept for backward compatibility.)
// ============================================================================

export interface TySelectedTagsProps extends React.HTMLAttributes<HTMLElement> {
  /** id of the ty-select to display. Falls back to the previous element sibling. */
  htmlFor?: string;
  /** Optional <template> child as chip blueprint ({value}/{label}/{flavor}/{data-*} placeholders) */
  children?: React.ReactNode;
}

const selectedChipsComponent = (tag: 'ty-selected-options' | 'ty-selected-tags') =>
  React.forwardRef<HTMLElement, TySelectedTagsProps>(({ htmlFor, children, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') ref(elementRef.current);
        else ref.current = elementRef.current;
      }
    }, [ref]);

    const webComponentProps: Record<string, any> = { ...hostProps(props), ref: elementRef };
    if (htmlFor) webComponentProps.for = htmlFor;

    return React.createElement(tag, webComponentProps, children);
  });

/** React wrapper for the ty-selected-options web component. */
export const TySelectedOptions = selectedChipsComponent('ty-selected-options');
TySelectedOptions.displayName = 'TySelectedOptions';

/** @deprecated Use `TySelectedOptions` — kept for backward compatibility. */
export const TySelectedTags = selectedChipsComponent('ty-selected-tags');
TySelectedTags.displayName = 'TySelectedTags';
