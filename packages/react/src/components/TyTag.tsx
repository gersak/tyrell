import React, { useEffect, useRef, useCallback } from 'react';

// CSS custom properties that cascade into the shadow DOM for full color control
export interface TyTagCSSProperties extends React.CSSProperties {
  '--tag-bg'?: string;
  '--tag-color'?: string;
  '--tag-border-color'?: string;
}

// Type definitions for Ty Tag component
export interface TyTagProps extends Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'onClick'> {
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  notPill?: boolean;
  clickable?: boolean;
  dismissible?: boolean;
  disabled?: boolean;
  selected?: boolean;
  value?: string;
  style?: TyTagCSSProperties;
  // click is a composed CustomEvent from the web component — React's onClick picks it up
  onClick?: (event: CustomEvent) => void;
  onTagDismiss?: (event: CustomEvent) => void;
  children?: React.ReactNode;
}

// React wrapper for ty-tag web component
export const TyTag = React.forwardRef<HTMLElement, TyTagProps>(
  ({ children, onClick, onTagDismiss, notPill, clickable, dismissible, disabled, selected, ...props }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    const handleDismiss = useCallback((event: CustomEvent) => {
      if (onTagDismiss) {
        onTagDismiss(event);
      }
    }, [onTagDismiss]);

    // dismiss is a custom event — React doesn't know about it, so we need a manual listener
    useEffect(() => {
      const element = elementRef.current;
      if (!element || !onTagDismiss) return;

      element.addEventListener('dismiss', handleDismiss as EventListener);
      return () => {
        element.removeEventListener('dismiss', handleDismiss as EventListener);
      };
    }, [handleDismiss, onTagDismiss]);

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

    return React.createElement(
      'ty-tag',
      {
        ...props,
        // click is dispatched as composed CustomEvent by the web component — React's
        // synthetic onClick already catches it, so we just pass it through as onClick
        ...(onClick && { onClick }),
        ...(notPill && { 'not-pill': "" }),
        ...(clickable && { clickable: "" }),
        ...(dismissible && { dismissible: "" }),
        ...(disabled && { disabled: "" }),
        ...(selected && { selected: "" }),
        ref: elementRef,
      },
      children
    );
  }
);

TyTag.displayName = 'TyTag';