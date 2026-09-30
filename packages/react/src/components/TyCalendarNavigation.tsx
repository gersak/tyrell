import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';

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

  /**
   * Which grid the parent shows. 'days': the title opens the month/year view
   * and the arrows step months. 'months': the title shows the year and
   * closes the view, the arrows step years. Default 'days'.
   */
  view?: CalendarView;

  /** Navigation change event handler */
  onChange?: (event: CustomEvent<NavigationChangeDetail>) => void;

  /** Title clicked — detail.view is the view the parent should switch to */
  onViewToggle?: (event: CustomEvent<ViewToggleDetail>) => void;
}

export type CalendarView = 'days' | 'months';

export interface ViewToggleDetail {
  view: CalendarView;
}

export interface NavigationChangeDetail {
  month: number;  // 1-12
  year: number;   // e.g., 2025
}

export const TyCalendarNavigation = React.forwardRef<HTMLElement, TyCalendarNavigationProps>(
  ({ 
    displayMonth,
    displayYear,
    locale,
    size,
    width,
    min,
    max,
    view,
    onChange,
    onViewToggle,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleChange = (event: Event) => {
        if (onChange) {
          onChange(event as CustomEvent<NavigationChangeDetail>);
        }
      };

      const handleViewToggle = (event: Event) => {
        if (onViewToggle) {
          onViewToggle(event as CustomEvent<ViewToggleDetail>);
        }
      };

      element.addEventListener('change', handleChange);
      element.addEventListener('view-toggle', handleViewToggle);

      return () => {
        element.removeEventListener('change', handleChange);
        element.removeEventListener('view-toggle', handleViewToggle);
      };
    }, [onChange, onViewToggle]);

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

    if (displayMonth !== undefined) webComponentProps['display-month'] = displayMonth;
    if (displayYear !== undefined) webComponentProps['display-year'] = displayYear;
    if (locale) webComponentProps.locale = locale;
    if (size) webComponentProps.size = size;
    if (width) webComponentProps.width = width;
    if (min) webComponentProps.min = min;
    if (max) webComponentProps.max = max;
    if (view) webComponentProps.view = view;

    return React.createElement(
      'ty-calendar-navigation',
      webComponentProps
    );
  }
);

TyCalendarNavigation.displayName = 'TyCalendarNavigation';
