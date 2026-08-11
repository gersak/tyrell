import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

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

export const TyTab = React.forwardRef<HTMLElement, TyTabProps>(
  ({ 
    children, 
    id,
    label,
    disabled,
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
    };

    webComponentProps.id = id;
    
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    if (isDisabled) webComponentProps.disabled = '';
    
    if (label) webComponentProps.label = label;

    return React.createElement(
      'ty-tab',
      webComponentProps,
      children
    );
  }
);

TyTab.displayName = 'TyTab';
