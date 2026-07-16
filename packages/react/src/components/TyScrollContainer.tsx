import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { hostProps } from '../utils/host-props';
import { needsPropertyBridge } from '../utils/react-version';
import { useBooleanProperty, coerceBool } from '../utils/use-boolean-prop';

/** Detail payload for nearstart / nearend events. */
export interface TyScrollNearEdgeDetail {
  distance: number;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

// Type definitions for Ty ScrollContainer component
export interface TyScrollContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** Maximum height of the scroll container */
  maxHeight?: string;

  /** Enable/disable scroll shadows (default: true) */
  shadow?: boolean;

  /** Hide native scrollbar (no custom scrollbar) */
  hideScrollbar?: boolean;

  /** Use the styled custom scrollbar */
  customScrollbar?: boolean;

  /** Enable horizontal scrolling */
  overflowX?: boolean;

  /** Preserve visual position when content is prepended above the viewport */
  scrollAnchoring?: boolean;

  /** Distance (px) from an edge at which nearstart/nearend fire (default 100) */
  nearEdgeThreshold?: number;

  /** Fired once when scrolled within the threshold of the bottom */
  onNearEnd?: (event: CustomEvent<TyScrollNearEdgeDetail>) => void;

  /** Fired once when scrolled within the threshold of the top */
  onNearStart?: (event: CustomEvent<TyScrollNearEdgeDetail>) => void;

  /** Content to scroll */
  children?: React.ReactNode;
}

// Ref interface for imperative methods
export interface TyScrollContainerRef {
  /** Force update shadows (useful after dynamic content changes) */
  updateShadows: () => void;
  /** Scroll to top */
  scrollToTop: (smooth?: boolean) => void;
  /** Scroll to bottom */
  scrollToBottom: (smooth?: boolean) => void;
  /** Scroll to far left */
  scrollToLeft: (smooth?: boolean) => void;
  /** Scroll to far right */
  scrollToRight: (smooth?: boolean) => void;
  /** Scroll a descendant (element or CSS selector) into view */
  scrollToElement: (target: Element | string, smooth?: boolean) => void;
  /** Get the underlying scroll element */
  scrollElement: HTMLElement | null;
  /** Get the native element */
  element: HTMLElement | null;
}

// React wrapper for ty-scroll-container web component
export const TyScrollContainer = React.forwardRef<TyScrollContainerRef, TyScrollContainerProps>(
  ({
    children,
    maxHeight,
    shadow,
    hideScrollbar,
    customScrollbar,
    overflowX,
    scrollAnchoring,
    nearEdgeThreshold,
    onNearEnd,
    onNearStart,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    // Expose imperative methods via ref
    useImperativeHandle(ref, () => ({
      updateShadows: () => { (elementRef.current as any)?.updateShadows?.(); },
      scrollToTop: (smooth = true) => { (elementRef.current as any)?.scrollToTop?.(smooth); },
      scrollToBottom: (smooth = true) => { (elementRef.current as any)?.scrollToBottom?.(smooth); },
      scrollToLeft: (smooth = true) => { (elementRef.current as any)?.scrollToLeft?.(smooth); },
      scrollToRight: (smooth = true) => { (elementRef.current as any)?.scrollToRight?.(smooth); },
      scrollToElement: (target, smooth = true) => { (elementRef.current as any)?.scrollToElement?.(target, smooth); },
      get scrollElement() { return (elementRef.current as any)?.scrollElement ?? null; },
      get element() { return elementRef.current; }
    }), []);

    // shadow defaults to true; bridge it imperatively so flipping back to true
    // propagates on React 18.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      if (shadow === undefined) return;
      const el = elementRef.current as any;
      if (!el) return;
      const next = coerceBool(shadow);
      if (Boolean(el.shadow) !== next) el.shadow = next;
    }, [shadow]);

    const isHideScrollbar = useBooleanProperty(elementRef, 'hideScrollbar', hideScrollbar);
    const isCustomScrollbar = useBooleanProperty(elementRef, 'customScrollbar', customScrollbar);
    const isOverflowX = useBooleanProperty(elementRef, 'overflowX', overflowX);
    const isScrollAnchoring = useBooleanProperty(elementRef, 'scrollAnchoring', scrollAnchoring);

    // Custom events → React callbacks
    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;
      const bound: Array<[string, EventListener]> = [];
      if (onNearEnd) {
        const h = (e: Event) => onNearEnd(e as CustomEvent<TyScrollNearEdgeDetail>);
        el.addEventListener('nearend', h); bound.push(['nearend', h]);
      }
      if (onNearStart) {
        const h = (e: Event) => onNearStart(e as CustomEvent<TyScrollNearEdgeDetail>);
        el.addEventListener('nearstart', h); bound.push(['nearstart', h]);
      }
      return () => bound.forEach(([n, h]) => el.removeEventListener(n, h));
    }, [onNearEnd, onNearStart]);

    // Convert React props to web component attributes
    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    // String attributes
    if (maxHeight) webComponentProps['max-height'] = maxHeight;
    if (nearEdgeThreshold != null) webComponentProps['near-edge-threshold'] = String(nearEdgeThreshold);

    // Boolean attributes
    if (shadow !== undefined && !coerceBool(shadow)) webComponentProps.shadow = 'false';
    if (isHideScrollbar) webComponentProps['hide-scrollbar'] = '';
    if (isCustomScrollbar) webComponentProps['custom-scrollbar'] = '';
    if (isOverflowX) webComponentProps['overflow-x'] = '';
    if (isScrollAnchoring) webComponentProps['scroll-anchoring'] = '';

    return React.createElement(
      'ty-scroll-container',
      webComponentProps,
      children
    );
  }
);

TyScrollContainer.displayName = 'TyScrollContainer';
