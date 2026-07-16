import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';

// Type definitions for Ty Step component
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

// React wrapper for ty-step web component
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
      ...hostProps(props),
      ref: elementRef,
      id,
    };

    // Add string attributes
    if (label) webComponentProps.label = label;
    if (description) webComponentProps.description = description;
    if (status) webComponentProps.status = status;

    // Add boolean attributes
    if (disabled) webComponentProps.disabled = true;

    return React.createElement(
      'ty-step',
      webComponentProps,
      children
    );
  }
);

TyStep.displayName = 'TyStep';
