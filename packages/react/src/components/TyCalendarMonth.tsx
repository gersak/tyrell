import React, { useEffect, useRef } from 'react';

// Type definitions for Ty Calendar Month component
export interface TyCalendarMonthProps extends React.HTMLAttributes<HTMLElement> {
  /** Display year */
  displayYear?: number;
  
  /** Display month (1-12) */
  displayMonth?: number;
  
  /** Locale for date formatting */
  locale?: string;
  
  /** Calendar size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Width of calendar */
  width?: string;
  
  /** Minimum width */
  minWidth?: string;
  
  /** Maximum width */
  maxWidth?: string;

  /** Earliest enabled date (ISO "YYYY-MM-DD") — earlier days disabled */
  min?: string;

  /** Latest enabled date (ISO "YYYY-MM-DD") — later days disabled */
  max?: string;

  /** Day click event handler */
  onDayClick?: (event: CustomEvent<DayClickDetail>) => void;
}

export interface DayClickDetail {
  dayContext: any; // DayContext type from calendar-utils
  value: number;
  year: number;
  month: number;
  day: number;
  isHoliday?: boolean;
  isToday?: boolean;
  isWeekend: boolean;
  isOtherMonth: boolean;
}

// React wrapper for ty-calendar-month web component
export const TyCalendarMonth = React.forwardRef<HTMLElement, TyCalendarMonthProps>(
  ({ 
    displayYear,
    displayMonth,
    locale,
    size,
    width,
    minWidth,
    maxWidth,
    min,
    max,
    onDayClick,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Handle day click events
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleDayClick = (event: Event) => {
        if (onDayClick) {
          onDayClick(event as CustomEvent<DayClickDetail>);
        }
      };

      element.addEventListener('day-click', handleDayClick);

      return () => {
        element.removeEventListener('day-click', handleDayClick);
      };
    }, [onDayClick]);

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
    if (displayYear !== undefined) webComponentProps['display-year'] = displayYear;
    if (displayMonth !== undefined) webComponentProps['display-month'] = displayMonth;
    if (locale) webComponentProps.locale = locale;
    if (size) webComponentProps.size = size;
    if (width) webComponentProps.width = width;
    if (min) webComponentProps.min = min;
    if (max) webComponentProps.max = max;
    if (minWidth) webComponentProps['min-width'] = minWidth;
    if (maxWidth) webComponentProps['max-width'] = maxWidth;

    return React.createElement(
      'ty-calendar-month',
      webComponentProps
    );
  }
);

TyCalendarMonth.displayName = 'TyCalendarMonth';
