import React, { useEffect, useRef } from 'react';

// Type definitions for Ty Tabs component
export interface TyTabsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Content area width (accepts px or %) */
  width?: string;
  
  /** Total container height including buttons */
  height?: string;
  
  /** ID of currently active tab */
  active?: string;
  
  /** Position of tab buttons */
  placement?: 'top' | 'bottom';
  
  /** Tab change event handler */
  onChange?: (event: CustomEvent<TabChangeDetail>) => void;
  
  /** Tabs content (TyTab components) */
  children?: React.ReactNode;
}

export interface TabChangeDetail {
  activeId: string;
  activeIndex: number;
  previousId: string | null;
  previousIndex: number | null;
}

// React wrapper for ty-tabs web component
export const TyTabs = React.forwardRef<HTMLElement, TyTabsProps>(
  ({ 
    children, 
    width,
    height,
    active,
    placement,
    onChange,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Handle change events
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleChange = (event: Event) => {
        if (onChange) {
          onChange(event as CustomEvent<TabChangeDetail>);
        }
      };

      element.addEventListener('ty-tab-change', handleChange);

      return () => {
        element.removeEventListener('ty-tab-change', handleChange);
      };
    }, [onChange]);

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
    };

    // Add string attributes
    if (width) webComponentProps.width = width;
    if (height) webComponentProps.height = height;
    if (active) webComponentProps.active = active;
    if (placement) webComponentProps.placement = placement;

    return React.createElement(
      'ty-tabs',
      webComponentProps,
      children
    );
  }
);

TyTabs.displayName = 'TyTabs';
