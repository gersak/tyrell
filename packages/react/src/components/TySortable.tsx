import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props.js';
import { useBooleanProperty } from '../utils/use-boolean-prop.js';

/** Where an item is (from) or will be (to). prev/next exclude the item itself. */
export interface TySortablePos {
  /** Container id */
  list: string | null;
  /** from: index before the move; to: final index */
  index: number;
  /** Key of the item before the slot */
  prev: string | null;
  /** Key of the item after the slot */
  next: string | null;
}

export interface TySortableValue {
  key: string | null;
  group: string | null;
  source: 'pointer' | 'keyboard' | 'api';
  from: TySortablePos;
  to: TySortablePos;
  /** Resulting key order of every list the move touches, by container id. */
  order: Record<string, (string | null)[]>;
}

export interface TySortableChangeDetail {
  value: TySortableValue;
  item: HTMLElement;
  fromContainer: TySortableElement;
  toContainer: TySortableElement;
}

/** What a drag knows before it has a destination. */
export interface TySortableDragValue {
  key: string | null;
  group: string | null;
  source: 'pointer' | 'keyboard' | 'api';
  from: TySortablePos;
}

export interface TySortableStartDetail {
  value: TySortableDragValue;
  item: HTMLElement;
}

export type TySortableCancelReason = 'escape' | 'spill' | 'blocked' | 'pointercancel' | 'gone' | 'disabled' | 'blur';

export interface TySortableCancelDetail {
  value: TySortableDragValue;
  item: HTMLElement;
  reason: TySortableCancelReason;
}

export type TySortableOutcome = 'accepted' | 'rejected' | 'reconciled' | 'unknown';

export interface TySortableSettleDetail {
  value: TySortableValue;
  outcome: TySortableOutcome;
}

export interface TySortableDropContext {
  item: HTMLElement;
  key: string | null;
  from: TySortableElement;
  to: TySortableElement;
  index: number;
}

/** Announcement templates: {item}, {position}, {total}, {list}. */
export interface TySortableStrings {
  pickedUp: string;
  moved: string;
  blocked: string;
  dropped: string;
  rejected: string;
  reconciled: string;
  removed: string;
  unknown: string;
  cancelled: string;
  pending: string;
}

export interface TySortableMoveOptions {
  /** Destination list (element or id); defaults to this list */
  to?: TySortableElement | string;
  index?: number;
  before?: string;
  after?: string;
}

/** The underlying custom element, typed with its imperative API — reach it with a ref. */
export interface TySortableElement extends HTMLElement {
  group: string | null;
  axis: 'vertical' | 'horizontal';
  disabled: boolean;
  canDrop: ((ctx: TySortableDropContext) => boolean) | null;
  labels: Partial<TySortableStrings>;
  readonly items: HTMLElement[];
  keyOf(item: Element): string | null;
  /** Move an item without a pointer; fires the same change event as a drag. */
  move(itemOrKey: HTMLElement | string, opts?: TySortableMoveOptions): Promise<TySortableOutcome>;
  /** End the hold now, e.g. settle('rejected') after a failed save. */
  settle(outcome?: 'accepted' | 'rejected'): void;
}

export interface TySortableProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'onCancel'> {
  /** Lists sharing a group accept each other's items */
  group?: string;

  /** Drag axis (default vertical) */
  axis?: 'vertical' | 'horizontal';

  /** Drag-handle selector (default [data-handle]) */
  handle?: string;

  /** Selector an incoming item must match to be dropped here */
  accepts?: string;

  /** No dragging from or into this list */
  disabled?: boolean;

  /** Attribute holding an item's key (default data-key, then id) */
  keyAttr?: string;

  /** Milliseconds to hold the dropped result while waiting for a re-render */
  holdTimeout?: number;

  /** List name used in screen-reader announcements */
  label?: string;

  /** Mark the slot with a drop line instead of moving siblings aside */
  dropLine?: boolean;

  /** Briefly outline an item where it lands */
  flash?: boolean;

  /** Veto a drop; called while dragging over a candidate slot */
  canDrop?: ((ctx: TySortableDropContext) => boolean) | null;

  /** Announcement overrides */
  labels?: Partial<TySortableStrings>;

  /** An item was dropped here (ty-sortable-change). Apply detail.value to your state. */
  onChange?: (event: CustomEvent<TySortableChangeDetail>) => void;

  /** A drag started from this list (ty-sortable-start) */
  onStart?: (event: CustomEvent<TySortableStartDetail>) => void;

  /** A drag ended without a move (ty-sortable-cancel) */
  onCancel?: (event: CustomEvent<TySortableCancelDetail>) => void;

  /** The held result was released (ty-sortable-settle) */
  onSettle?: (event: CustomEvent<TySortableSettleDetail>) => void;

  /** The items; give each a stable data-key or id */
  children?: React.ReactNode;
}

export const TySortable = React.forwardRef<TySortableElement, TySortableProps>(
  ({
    children,
    group,
    axis,
    handle,
    accepts,
    disabled,
    keyAttr,
    holdTimeout,
    label,
    dropLine,
    flash,
    canDrop,
    labels,
    onChange,
    onStart,
    onCancel,
    onSettle,
    ...props
  }, ref) => {
    const elementRef = useRef<TySortableElement>(null);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    // Events bubble; a nested list's events must not reach this one's handlers.
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      const bound: Array<[string, EventListener]> = [];
      const on = <D,>(type: string, fn?: (e: CustomEvent<D>) => void) => {
        if (!fn) return;
        const h = (e: Event) => { if (e.target === e.currentTarget) fn(e as CustomEvent<D>); };
        el.addEventListener(type, h);
        bound.push([type, h]);
      };
      on('ty-sortable-change', onChange);
      on('ty-sortable-start', onStart);
      on('ty-sortable-cancel', onCancel);
      on('ty-sortable-settle', onSettle);
      return () => bound.forEach(([n, h]) => el.removeEventListener(n, h));
    }, [onChange, onStart, onCancel, onSettle]);

    // Function / object properties have no attribute form.
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      el.canDrop = canDrop ?? null;
    }, [canDrop]);

    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      el.labels = labels ?? {};
    }, [labels]);

    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (group) webComponentProps.group = group;
    if (axis) webComponentProps.axis = axis;
    if (handle) webComponentProps.handle = handle;
    if (accepts) webComponentProps.accepts = accepts;
    if (keyAttr) webComponentProps['key-attr'] = keyAttr;
    if (holdTimeout != null) webComponentProps['hold-timeout'] = String(holdTimeout);
    if (label) webComponentProps.label = label;
    if (dropLine) webComponentProps['drop-line'] = true;
    if (flash) webComponentProps.flash = true;
    // `true`, not '': React 19 assigns the property, and the element's setter
    // reads '' as false (as a native element's does).
    if (isDisabled) webComponentProps.disabled = true;

    return React.createElement('ty-sortable', webComponentProps, children);
  }
);

TySortable.displayName = 'TySortable';
