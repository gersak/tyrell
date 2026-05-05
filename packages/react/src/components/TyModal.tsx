import React, { useEffect, useRef, useImperativeHandle } from 'react';

// Event detail structure for modal events
export interface TyModalEventDetail {
  reason?: 'programmatic' | 'native' | 'backdrop' | 'escape' | 'close-button';
  returnValue?: string;
}

// Type definitions for Ty Modal component
export interface TyModalProps extends React.HTMLAttributes<HTMLElement> {
  /** Controls modal visibility */
  open?: boolean;
  
  /** Show backdrop behind modal (default: true) */
  backdrop?: boolean;
  
  /** Allow closing modal by clicking backdrop (default: true) */
  closeOnOutsideClick?: boolean;
  
  /** Allow closing modal with Escape key (default: true) */
  closeOnEscape?: boolean;
  
  /** Require confirmation before closing when there are unsaved changes */
  protected?: boolean;
  
  /** React event handlers */
  onOpen?: (event: CustomEvent<TyModalEventDetail>) => void;
  onClose?: (event: CustomEvent<TyModalEventDetail>) => void;
  
  /** Modal content */
  children?: React.ReactNode;
}

// Ref interface for imperative methods
export interface TyModalRef {
  show: () => void;
  hide: () => void;
  element: HTMLElement | null;
}

// React wrapper for ty-modal web component
export const TyModal = React.forwardRef<TyModalRef, TyModalProps>(
  ({ 
    open, 
    backdrop, 
    closeOnOutsideClick, 
    closeOnEscape, 
    protected: isProtected,
    onOpen, 
    onClose, 
    children, 
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Expose imperative methods through ref
    useImperativeHandle(ref, () => ({
      show: () => {
        if (elementRef.current && typeof (elementRef.current as any).show === 'function') {
          (elementRef.current as any).show();
        }
      },
      hide: () => {
        if (elementRef.current && typeof (elementRef.current as any).hide === 'function') {
          (elementRef.current as any).hide();
        }
      },
      element: elementRef.current,
    }), []);

    // Handle modal events
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleOpen = (event: CustomEvent<TyModalEventDetail>) => {
        if (onOpen) {
          onOpen(event);
        }
      };

      const handleClose = (event: CustomEvent<TyModalEventDetail>) => {
        if (onClose) {
          onClose(event);
        }
      };

      // Listen for custom modal events
      if (onOpen) {
        element.addEventListener('open', handleOpen as EventListener);
      }

      if (onClose) {
        element.addEventListener('close', handleClose as EventListener);
      }

      return () => {
        if (onOpen) {
          element.removeEventListener('open', handleOpen as EventListener);
        }
        if (onClose) {
          element.removeEventListener('close', handleClose as EventListener);
        }
      };
    }, [onOpen, onClose]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    // Add boolean attributes using correct HTML attribute names
    if (open) {
      webComponentProps.open = '';  // Boolean attributes as empty string
    }

    if (backdrop === false) {  // Only set if explicitly false (default is true)
      webComponentProps.backdrop = 'false';
    }

    if (closeOnOutsideClick === false) {  // Only set if explicitly false (default is true)
      webComponentProps['close-on-outside-click'] = 'false';
    }

    if (closeOnEscape === false) {  // Only set if explicitly false (default is true)
      webComponentProps['close-on-escape'] = 'false';
    }

    if (isProtected) {
      webComponentProps.protected = '';  // Boolean attributes as empty string
    }

    return React.createElement(
      'ty-modal',
      webComponentProps,
      children
    );
  }
);

TyModal.displayName = 'TyModal';
