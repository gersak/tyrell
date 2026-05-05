import React, { useEffect, useRef } from 'react';

// Type definitions for Ty ResizeObserver component
export interface TyResizeObserverProps extends React.HTMLAttributes<HTMLElement> {
  /** Required unique identifier for size registry */
  id: string;

  /** Debounce in milliseconds (default: 0 = no debounce) */
  debounce?: number;

  /** Content to observe */
  children?: React.ReactNode;
}

// React wrapper for ty-resize-observer web component
export const TyResizeObserver = React.forwardRef<HTMLElement, TyResizeObserverProps>(
  ({
    children,
    id,
    debounce,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Combine refs if needed
    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
      id,
    };

    // Add number attributes
    if (debounce !== undefined) webComponentProps.debounce = debounce;

    return React.createElement(
      'ty-resize-observer',
      webComponentProps,
      children
    );
  }
);

TyResizeObserver.displayName = 'TyResizeObserver';
