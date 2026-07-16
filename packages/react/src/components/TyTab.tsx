import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty Tab component
export interface TyTabProps extends React.HTMLAttributes<HTMLElement> {
  /** Required unique identifier */
  id: string;
  
  /** Simple text label */
  label?: string;
  
  /** Whether the tab is disabled */
  disabled?: boolean;
  
  /** Tab content */
  children?: React.ReactNode;
}

// React wrapper for ty-tab web component
export const TyTab = React.forwardRef<HTMLElement, TyTabProps>(
  ({ 
    children, 
    id,
    label,
    disabled,
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
    };

    // Add required attribute
    webComponentProps.id = id;
    
    // Add boolean attributes
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    if (isDisabled) webComponentProps.disabled = '';
    
    // Add string attributes
    if (label) webComponentProps.label = label;

    return React.createElement(
      'ty-tab',
      webComponentProps,
      children
    );
  }
);

TyTab.displayName = 'TyTab';
