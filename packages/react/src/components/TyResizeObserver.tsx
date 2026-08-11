import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';

export interface TyResizeObserverProps extends React.HTMLAttributes<HTMLElement> {
  /** Required unique identifier for size registry */
  id: string;

  /** Debounce in milliseconds (default: 0 = no debounce) */
  debounce?: number;

  /** Content to observe */
  children?: React.ReactNode;
}

export const TyResizeObserver = React.forwardRef<HTMLElement, TyResizeObserverProps>(
  ({
    children,
    id,
    debounce,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
      id,
    };

    if (debounce !== undefined) webComponentProps.debounce = debounce;

    return React.createElement(
      'ty-resize-observer',
      webComponentProps,
      children
    );
  }
);

TyResizeObserver.displayName = 'TyResizeObserver';
