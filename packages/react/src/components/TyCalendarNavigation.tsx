import React, { useEffect, useRef } from 'react';

// Type definitions for Ty Calendar Navigation component
export interface TyCalendarNavigationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Display month (1-12) */
  displayMonth?: number;
  
  /** Display year */
  displayYear?: number;
  
  /** Locale for month name formatting */
  locale?: string;
  
  /** Navigation size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Width of navigation */
  width?: string;

  /** Earliest reachable month (ISO "YYYY-MM-DD") — navigation clamps here */
  min?: string;

  /** Latest reachable month (ISO "YYYY-MM-DD") — navigation clamps here */
  max?: string;

  /** Navigation change event handler */
  onChange?: (event: CustomEvent<NavigationChangeDetail>) => void;
}

export interface NavigationChangeDetail {
  month: number;  // 1-12
  year: number;   // e.g., 2025
}

// React wrapper for ty-calendar-navigation web component
export const TyCalendarNavigation = React.forwardRef<HTMLElement, TyCalendarNavigationProps>(
  ({ 
    displayMonth,
    displayYear,
    locale,
    size,
    width,
    min,
    max,
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
          onChange(event as CustomEvent<NavigationChangeDetail>);
        }
      };

      element.addEventListener('change', handleChange);

      return () => {
        element.removeEventListener('change', handleChange);
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

    // Add attributes
    if (displayMonth !== undefined) webComponentProps['display-month'] = displayMonth;
    if (displayYear !== undefined) webComponentProps['display-year'] = displayYear;
    if (locale) webComponentProps.locale = locale;
    if (size) webComponentProps.size = size;
    if (width) webComponentProps.width = width;
    if (min) webComponentProps.min = min;
    if (max) webComponentProps.max = max;

    return React.createElement(
      'ty-calendar-navigation',
      webComponentProps
    );
  }
);

TyCalendarNavigation.displayName = 'TyCalendarNavigation';
