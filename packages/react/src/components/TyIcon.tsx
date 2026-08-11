import React, { useEffect, useRef } from 'react';
import { useBooleanProperty } from '../utils/use-boolean-prop';

export interface TyIconProps extends React.HTMLAttributes<HTMLElement> {
  /** Icon name from the icon registry (e.g., 'home', 'star', 'settings') */
  name: string;

  /** Icon size - relative (em-based) or absolute (pixel-based) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '12' | '14' | '16' | '18' | '20' | '24' | '32' | '48';

  /** Enable spinning animation */
  spin?: boolean;

  /** Enable pulse animation */
  pulse?: boolean;

  /** Animation tempo/speed */
  tempo?: 'slow' | 'fast';

  /** Additional CSS classes */
  className?: string;
}

export const TyIcon = React.forwardRef<HTMLElement, TyIconProps>(
  ({ name, size, spin, pulse, tempo, className, ...props }, ref) => {
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

    const isSpin = useBooleanProperty(elementRef, 'spin', spin);
    const isPulse = useBooleanProperty(elementRef, 'pulse', pulse);

    const webComponentProps: Record<string, any> = {
      ...props,
      name,
      ref: elementRef,
    };

    if (size) {
      webComponentProps.size = size;
    }

    if (isSpin) webComponentProps.spin = '';
    if (isPulse) webComponentProps.pulse = '';

    if (tempo) {
      webComponentProps.tempo = tempo;
    }

    if (className) {
      webComponentProps.class = className;  // HTML attribute is 'class', not 'className'
    }

    return React.createElement('ty-icon', webComponentProps);
  }
);

TyIcon.displayName = 'TyIcon';
