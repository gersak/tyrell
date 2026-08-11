import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';

type BuiltinFlavor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

export interface TyCalendarMonthProps extends React.HTMLAttributes<HTMLElement> {
  /** Display year */
  displayYear?: number;
  
  /** Display month (1-12) */
  displayMonth?: number;
  
  /** Locale for date formatting */
  locale?: string;
  
  /** Calendar size */
  size?: 'sm' | 'md' | 'lg';

  /** Visual flavor for the selected/today day cells */
  flavor?: ShadedFlavor | (string & {});

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

export const TyCalendarMonth = React.forwardRef<HTMLElement, TyCalendarMonthProps>(
  ({ 
    displayYear,
    displayMonth,
    locale,
    size,
    flavor,
    width,
    minWidth,
    maxWidth,
    min,
    max,
    onDayClick,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

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

    if (displayYear !== undefined) webComponentProps['display-year'] = displayYear;
    if (displayMonth !== undefined) webComponentProps['display-month'] = displayMonth;
    if (locale) webComponentProps.locale = locale;
    if (size) webComponentProps.size = size;
    if (flavor) webComponentProps.flavor = flavor;
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
