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

  /** Content is loaded on demand: fires onTabLoad when shown with no content */
  lazy?: boolean;

  /** A lazy tab with no content was shown. Call ref.current.loadFailed() if loading fails. */
  onTabLoad?: (event: CustomEvent<TabLoadDetail>) => void;
  
  /** Tab content */
  children?: React.ReactNode;
}

export interface TabLoadDetail {
  id: string;
  index: number;
}

export const TyTab = React.forwardRef<HTMLElement, TyTabProps>(
  ({ 
    children, 
    id,
    label,
    disabled,
    lazy,
    onTabLoad,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element || !onTabLoad) return;

      const handleLoad = (event: Event) => onTabLoad(event as CustomEvent<TabLoadDetail>);
      element.addEventListener('ty-tab-load', handleLoad);
      return () => element.removeEventListener('ty-tab-load', handleLoad);
    }, [onTabLoad]);

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
    if (lazy) webComponentProps.lazy = '';

    return React.createElement(
      'ty-tab',
      webComponentProps,
      children
    );
  }
);

TyTab.displayName = 'TyTab';
