import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';

export interface TyWizardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Content area width (accepts px or %) */
  width?: string;

  /** Total container height including step indicators */
  height?: string;

  /** ID of currently active step */
  active?: string;

  /** Comma-separated IDs of completed steps */
  completed?: string;

  /** Step indicator layout */
  orientation?: 'horizontal' | 'vertical';

  /** Step change event handler */
  onStepChange?: (event: CustomEvent<WizardStepChangeDetail>) => void;

  /** Wizard content (TyStep components) */
  children?: React.ReactNode;
}

export interface WizardStepChangeDetail {
  activeId: string;
  activeIndex: number;
  previousId: string | null;
  previousIndex: number | null;
  direction: 'forward' | 'backward' | 'none';
}

export const TyWizard = React.forwardRef<HTMLElement, TyWizardProps>(
  ({
    children,
    width,
    height,
    active,
    completed,
    orientation,
    onStepChange,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleStepChange = (event: Event) => {
        if (onStepChange) {
          onStepChange(event as CustomEvent<WizardStepChangeDetail>);
        }
      };

      element.addEventListener('ty-wizard-step-change', handleStepChange);

      return () => {
        element.removeEventListener('ty-wizard-step-change', handleStepChange);
      };
    }, [onStepChange]);

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
    };

    if (width) webComponentProps.width = width;
    if (height) webComponentProps.height = height;
    if (active) webComponentProps.active = active;
    if (completed) webComponentProps.completed = completed;
    if (orientation) webComponentProps.orientation = orientation;

    return React.createElement(
      'ty-wizard',
      webComponentProps,
      children
    );
  }
);

TyWizard.displayName = 'TyWizard';
