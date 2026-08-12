import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type Placement =
  | 'top-start' | 'top' | 'top-end'
  | 'right-start' | 'right' | 'right-end'
  | 'bottom-start' | 'bottom' | 'bottom-end'
  | 'left-start' | 'left' | 'left-end';

export interface TyPopupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClose'> {
  /** Preferred placement of the popup relative to anchor parent: a side plus an optional cross-axis alignment (e.g. "bottom-start") */
  placement?: Placement;

  /** Distance offset from the anchor in pixels (default: 8) */
  offset?: number;

  /** Disable automatic click trigger - requires manual open/close via ref methods */
  manual?: boolean;

  /** Disable automatic close on outside click and ESC key */
  disableClose?: boolean;

  /** Fired when the popup opens (after the open animation starts) */
  onOpen?: (event: CustomEvent) => void;

  /** Fired when the popup closes */
  onClose?: (event: CustomEvent) => void;

  /** Popup content - popup should be a child of the anchor element */
  children?: React.ReactNode;
}

export interface TyPopupElement extends HTMLElement {
  openPopup(): void;
  closePopup(): void;
  togglePopup(): void;
}

export const TyPopup = React.forwardRef<TyPopupElement, TyPopupProps>(
  ({
    placement,
    offset,
    manual,
    disableClose,
    onOpen,
    onClose,
    children,
    ...props
  }, ref) => {
    const elementRef = useRef<TyPopupElement>(null);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    // Listen for popup open/close events.
    // Guard with `event.target === element` so bubbled open/close events
    // from popup-like descendants (ty-dropdown, ty-multiselect, ty-date-picker
    // when slotted inside this popup) don't fire the consumer's onOpen/onClose.
    // See TyModal.tsx for the same pattern + rationale.
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleOpen = (event: Event) => {
        if (event.target !== element) return;
        if (onOpen) onOpen(event as CustomEvent);
      };
      const handleClose = (event: Event) => {
        if (event.target !== element) return;
        if (onClose) onClose(event as CustomEvent);
      };

      if (onOpen) element.addEventListener('open', handleOpen);
      if (onClose) element.addEventListener('close', handleClose);

      return () => {
        if (onOpen) element.removeEventListener('open', handleOpen);
        if (onClose) element.removeEventListener('close', handleClose);
      };
    }, [onOpen, onClose]);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (placement) {
      webComponentProps.placement = placement;
    }

    if (offset !== undefined) {
      webComponentProps.offset = offset.toString();
    }

    const isManual = useBooleanProperty(elementRef, 'manual', manual);
    const isDisableClose = useBooleanProperty(elementRef, 'disableClose', disableClose);

    if (isManual) webComponentProps.manual = '';
    if (isDisableClose) webComponentProps['disable-close'] = '';

    return React.createElement(
      'ty-popup',
      webComponentProps,
      children
    );
  }
);

TyPopup.displayName = 'TyPopup';
