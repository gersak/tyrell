import React, { useEffect, useRef } from 'react';

// Type definitions for Ty Popup component
export interface TyPopupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClose'> {
  /** Preferred placement of the popup relative to anchor parent: "top" | "bottom" | "left" | "right" */
  placement?: 'top' | 'bottom' | 'left' | 'right';

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

// Programmatic API for popup control
export interface TyPopupElement extends HTMLElement {
  openPopup(): void;
  closePopup(): void;
  togglePopup(): void;
}

// React wrapper for ty-popup web component
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

    // Listen for popup open/close events
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleOpen = (event: Event) => {
        if (onOpen) onOpen(event as CustomEvent);
      };
      const handleClose = (event: Event) => {
        if (onClose) onClose(event as CustomEvent);
      };

      if (onOpen) element.addEventListener('open', handleOpen);
      if (onClose) element.addEventListener('close', handleClose);

      return () => {
        if (onOpen) element.removeEventListener('open', handleOpen);
        if (onClose) element.removeEventListener('close', handleClose);
      };
    }, [onOpen, onClose]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    // Add optional attributes only if they have values
    if (placement) {
      webComponentProps.placement = placement;
    }

    if (offset !== undefined) {
      webComponentProps.offset = offset.toString();
    }

    if (manual) {
      webComponentProps.manual = '';  // Boolean attributes as empty string
    }

    if (disableClose) {
      webComponentProps['disable-close'] = '';  // Boolean attributes as empty string
    }

    return React.createElement(
      'ty-popup',
      webComponentProps,
      children
    );
  }
);

TyPopup.displayName = 'TyPopup';
