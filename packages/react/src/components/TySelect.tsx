import React, { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
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

export interface TySelectItem {
  value: string;
  label: string;
  flavor: string | null;
}

export interface TySelectEventDetail {
  /** Scalar for single select, array when `multiple`. With `externalSelection`: the picked option's value. */
  value: string | string[] | null;
  /** Always the array form of the selection, in pick order. Empty with `externalSelection`. */
  values: string[];
  /** Rich info per selected value — enough to render chips out-of-band. Empty with `externalSelection`. */
  items: TySelectItem[];
  /** Action that triggered the change */
  action: 'add' | 'remove' | 'clear' | 'set' | 'create';
  /** The specific value that changed */
  item: string | null;
  /** `externalSelection` only: the state the user asked for the picked option */
  selected?: boolean;
}

export interface TySelectProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'style'> {
  style?: import('./TyInput').TyInputCSSProperties;

  /**
   * The selection — string, comma-separated string, or array. The only
   * selection input: TyOption `selected` doesn't select. Ignored with
   * `externalSelection`.
   */
  value?: string | string[];

  /** Multi select (native <select multiple> semantics). Default: single. */
  multiple?: boolean;

  /** Compact content-hugging trigger (toolbars, filter bars) instead of the full-width field look */
  compact?: boolean;

  /** Placeholder shown while nothing is selected */
  placeholder?: string;

  /** Label text above the field */
  label?: string;

  /** Mobile dialog: heading of the pinned selection strip. Default "Selected"; the count is appended. */
  selectedLabel?: string;

  /** Mobile dialog: heading of the option list. Default "Available"; the count is appended. */
  availableLabel?: string;

  /** Shown when no option matches. Default "No options available". */
  noOptionsMessage?: string;

  /** Form field name — single submits one entry, multiple submits repeated entries */
  name?: string;

  /** Disable the select */
  disabled?: boolean;

  /** Read-only */
  readonly?: boolean;

  /** Mark the field as required */
  required?: boolean;

  /** Error message shown under the field (same line as TyInput's); '' or omitted clears it.
   *  A failed required check on submit writes the browser's message here too. */
  error?: string;

  /** Drop the popup search row. A select is searchable by default; this is
   *  the single opt-out. Cannot override externalSearch/allowCreate, where
   *  the input is the only way to get a query out. */
  notSearchable?: boolean;

  /**
   * External (remote) search mode — the component stops filtering and emits
   * debounced `search` events; replace the option children in response.
   */
  externalSearch?: boolean;

  /**
   * The app holds the selection (hundreds of selected values, remote lists):
   * mark the selected options with TyOption `selected`. A pick fires onChange
   * with `{ value, selected, action }` and changes nothing; re-render the
   * marks. `value` stays '', nothing is submitted, `required` isn't enforced.
   * Usually paired with externalSearch. TySelectedOptions doesn't apply.
   */
  externalSelection?: boolean;

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

  /** Field size — the ladder shared by every field component
   *  (styles/field-size.ts). Defaults to 'sm'. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Where the list opens: "bottom" or "top", plus an optional "-start"/"-end" alignment (e.g. "bottom-end"); same vocabulary as ty-popup/ty-tooltip. Flips rather than clips. Unset: below when it fits, else the side with more room, start-aligned. */
  placement?: Placement;

  /** No built-in x clear button (it shows once something is selected; never with slot="trigger" — use the ref's clear() there). */
  noClear?: boolean;

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

  /** TyOption children (plus optional slot="trigger" / slot="start" / slot="end" elements). TyTag is not an option. */
  children?: React.ReactNode;
}

/** The underlying custom element, typed with its imperative clear() method — useful with a ref, e.g. for slot="trigger" custom triggers that call it directly instead of relying on the built-in clear button. */
export interface TySelectElement extends HTMLElement {
  clear(): void;
}

export const TySelect = React.forwardRef<TySelectElement, TySelectProps>(
  ({
    value,
    multiple,
    compact,
    placeholder,
    label,
    selectedLabel,
    availableLabel,
    noOptionsMessage,
    name,
    disabled,
    readonly,
    required,
    notSearchable,
    externalSearch,
    externalSelection,
    debounce,
    allowCreate,
    createTransform,
    loading,
    size,
    placement,
    noClear,
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
    const isExternalSelection = useBooleanProperty(elementRef, 'externalSelection', externalSelection);
    const isAllowCreate = useBooleanProperty(elementRef, 'allowCreate', allowCreate);
    const isNoClear = useBooleanProperty(elementRef, 'noClear', noClear);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

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
    if (isExternalSelection) webComponentProps['external-selection'] = '';
    if (isAllowCreate) webComponentProps['allow-create'] = '';

    if (placeholder) webComponentProps.placeholder = placeholder;
    if (label) webComponentProps.label = label;
    if (selectedLabel) webComponentProps['selected-label'] = selectedLabel;
    if (availableLabel) webComponentProps['available-label'] = availableLabel;
    if (noOptionsMessage) webComponentProps['no-options-message'] = noOptionsMessage;
    if (name) webComponentProps.name = name;
    if (size) webComponentProps.size = size;
    if (placement) webComponentProps.placement = placement;
    if (isNoClear) webComponentProps['no-clear'] = '';
    if (flavor) webComponentProps.flavor = flavor;
    if (debounce !== undefined) webComponentProps.debounce = debounce.toString();
    if (createTransform) webComponentProps['create-transform'] = createTransform;
    if (notSearchable) webComponentProps['not-searchable'] = '';

    return React.createElement('ty-select', webComponentProps, children);
  }
);

TySelect.displayName = 'TySelect';

// TySelectedOptions — out-of-band chip display for a TySelect
// (ty-selected-tags below is the same element under its original tag name,
// kept for backward compatibility.)

export interface TySelectedTagsProps extends React.HTMLAttributes<HTMLElement> {
  /** id of the ty-select to display. Falls back to the previous element sibling. */
  htmlFor?: string;
  /** Optional <template> child as chip blueprint ({value}/{label}/{flavor}/{data-*} placeholders) */
  children?: React.ReactNode;
}

const noSubscribe = () => () => {};

const selectedChipsComponent = (tag: 'ty-selected-options' | 'ty-selected-tags') =>
  React.forwardRef<HTMLElement, TySelectedTagsProps>(({ htmlFor, children, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);
    // The element draws its chips as its own children, which hydration would
    // find unexpected: render it on the client only. false on the server and
    // while hydrating; true in every other client render, so a client-only
    // app renders it right away.
    const onClient = useSyncExternalStore(noSubscribe, () => true, () => false);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') ref(elementRef.current);
        else ref.current = elementRef.current;
      }
    }, [ref, onClient]);

    if (!onClient) return null;

    const webComponentProps: Record<string, any> = { ...hostProps(props), ref: elementRef };
    if (htmlFor) webComponentProps.for = htmlFor;

    return React.createElement(tag, webComponentProps, children);
  });

/** React wrapper for the ty-selected-options web component: chips for a TySelect's `value` (not for `externalSelection`). */
export const TySelectedOptions = selectedChipsComponent('ty-selected-options');
TySelectedOptions.displayName = 'TySelectedOptions';

/** @deprecated Use `TySelectedOptions` — kept for backward compatibility. */
export const TySelectedTags = selectedChipsComponent('ty-selected-tags');
TySelectedTags.displayName = 'TySelectedTags';
