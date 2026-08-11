import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';

export interface TyStepProps extends React.HTMLAttributes<HTMLElement> {
  /** Required unique identifier for the step */
  id: string;

  /** Main step title displayed in indicator */
  label?: string;

  /** Optional subtitle/description */
  description?: string;

  /** Whether the step is disabled */
  disabled?: boolean;

  /** User-controlled status override */
  status?: 'completed' | 'active' | 'pending' | 'error';

  /** Step content */
  children?: React.ReactNode;
}

export const TyStep = React.forwardRef<HTMLElement, TyStepProps>(
  ({
    children,
    id,
    label,
    description,
    disabled,
    status,
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

    if (label) webComponentProps.label = label;
    if (description) webComponentProps.description = description;
    if (status) webComponentProps.status = status;

    if (disabled) webComponentProps.disabled = true;

    return React.createElement(
      'ty-step',
      webComponentProps,
      children
    );
  }
);

TyStep.displayName = 'TyStep';
