import React, { useEffect, useRef, useCallback } from 'react';
import { hostProps } from '../utils/host-props';
import { needsPropertyBridge } from '../utils/react-version';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty Calendar component
export interface TyCalendarChangeEventDetail {
  /** Selected month (1-12) */
  month: number;
  /** Selected year (4-digit) */
  year: number;
  /** Selected day (1-31) */
  day: number;
  /** Action that triggered the change: "select" */
  action: 'select';
  /** Source of the change: "day-click" */
  source: 'day-click';
  /** Complete day context from the calendar month */
  dayContext: any;
}

export interface TyCalendarNavigateEventDetail {
  /** Navigation target month (1-12) */
  month: number;
  /** Navigation target year (4-digit) */
  year: number;
  /** Action that triggered the navigation: "navigate" */
  action: 'navigate';
  /** Source of the change: "navigation" */
  source: 'navigation';
}

export interface TyCalendarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Selected year (4-digit) */
  year?: number | string;
  
  /** Selected month (1-12) */
  month?: number | string;
  
  /** Selected day (1-31) */
  day?: number | string;
  
  /** Show navigation controls */
  showNavigation?: boolean;
  
  /** Stateless mode - no internal state management */
  stateless?: boolean;
  
  /** Calendar size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Locale for date formatting */
  locale?: string;
  
  /** Calendar width */
  width?: string | number;
  
  /** Earliest selectable date (ISO "YYYY-MM-DD") — earlier days disabled, navigation clamped */
  min?: string;

  /** Latest selectable date (ISO "YYYY-MM-DD") — later days disabled, navigation clamped */
  max?: string;

  /** Minimum calendar width */
  minWidth?: string | number;
  
  /** Maximum calendar width */
  maxWidth?: string | number;
  
  /** Form field name for form submission */
  name?: string;
  
  /** Form value (ISO date string) */
  value?: string;
  
  /** Function to render custom day content */
  dayContentFn?: (dayContext: any) => HTMLElement | string;
  
  /** Function to determine day CSS classes */
  dayClassesFn?: (dayContext: any) => string[];
  
  /** Custom CSS injection for render functions */
  customCSS?: string;
  
  /** Callback when a date is selected */
  onChange?: (event: CustomEvent<TyCalendarChangeEventDetail>) => void;
  
  /** Callback when navigation changes month/year */
  onNavigate?: (event: CustomEvent<TyCalendarNavigateEventDetail>) => void;

  /** Callback when a day cell is clicked (fires alongside change) */
  onDayClick?: (event: CustomEvent) => void;
}

// React wrapper for ty-calendar web component
export const TyCalendar = React.forwardRef<HTMLElement, TyCalendarProps>(
  ({ 
    year,
    month,
    day,
    showNavigation,
    stateless,
    size,
    locale,
    width,
    min,
    max,
    minWidth,
    maxWidth,
    name,
    value,
    dayContentFn,
    dayClassesFn,
    customCSS,
    onChange,
    onNavigate,
    onDayClick,
    ...props 
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Handle ref forwarding
    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    // Handle change events (date selection)
    const handleChange = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<TyCalendarChangeEventDetail>;
      if (onChange) {
        onChange(customEvent);
      }
    }, [onChange]);

    // Handle navigate events (month/year navigation)
    const handleNavigate = useCallback((event: Event) => {
      const customEvent = event as CustomEvent<TyCalendarNavigateEventDetail>;
      if (onNavigate) {
        onNavigate(customEvent);
      }
    }, [onNavigate]);

    const handleDayClick = useCallback((event: Event) => {
      if (onDayClick) onDayClick(event as CustomEvent);
    }, [onDayClick]);

    // Set up event listeners
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const listeners: Array<[string, EventListener]> = [];

      if (onChange) {
        element.addEventListener('change', handleChange);
        listeners.push(['change', handleChange]);
      }
      
      if (onNavigate) {
        element.addEventListener('navigate', handleNavigate);
        listeners.push(['navigate', handleNavigate]);
      }

      if (onDayClick) {
        element.addEventListener('day-click', handleDayClick);
        listeners.push(['day-click', handleDayClick]);
      }

      return () => {
        listeners.forEach(([eventName, handler]) => {
          element.removeEventListener(eventName, handler);
        });
      };
    }, [handleChange, handleNavigate, handleDayClick, onChange, onNavigate, onDayClick]);

    // Set function/object properties directly on the element. Required on
    // React 18, which can't bridge non-string props onto custom elements.
    // React 19+ handles function/object prop-to-property bridging natively.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const element = elementRef.current;
      if (!element) return;

      // Day content function property (preferred over attribute)
      if (dayContentFn) {
        (element as any).dayContentFn = dayContentFn;
      } else {
        (element as any).dayContentFn = null;
      }

      // Day classes function property (preferred over attribute)
      if (dayClassesFn) {
        (element as any).dayClassesFn = dayClassesFn;
      } else {
        (element as any).dayClassesFn = null;
      }

      // Custom CSS property
      if (customCSS) {
        (element as any).customCSS = customCSS;
      } else {
        (element as any).customCSS = null;
      }
    }, [dayContentFn, dayClassesFn, customCSS]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    // Add optional attributes only if they have values
    if (year !== undefined) {
      webComponentProps.year = year.toString();
    }

    if (month !== undefined) {
      webComponentProps.month = month.toString();
    }

    if (day !== undefined) {
      webComponentProps.day = day.toString();
    }

    const isShowNavigation = useBooleanProperty(elementRef, 'showNavigation', showNavigation);
    const isStateless = useBooleanProperty(elementRef, 'stateless', stateless);

    if (isShowNavigation) webComponentProps['show-navigation'] = '';
    if (isStateless) webComponentProps.stateless = '';

    if (size) {
      webComponentProps.size = size;
    }

    if (locale) {
      webComponentProps.locale = locale;
    }

    if (width !== undefined) {
      webComponentProps.width = width.toString();
    }

    if (min) {
      webComponentProps.min = min;
    }

    if (max) {
      webComponentProps.max = max;
    }

    if (minWidth !== undefined) {
      webComponentProps['min-width'] = minWidth.toString();
    }

    if (maxWidth !== undefined) {
      webComponentProps['max-width'] = maxWidth.toString();
    }

    if (name) {
      webComponentProps.name = name;
    }

    if (value) {
      webComponentProps.value = value;
    }

    return React.createElement('ty-calendar', webComponentProps);
  }
);

TyCalendar.displayName = 'TyCalendar';