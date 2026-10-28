import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { hostProps } from '../utils/host-props.js';
import { useBooleanProperty, coerceBool } from '../utils/use-boolean-prop.js';
import { needsPropertyBridge } from '../utils/react-version.js';

export interface TyModalEventDetail {
  reason?: 'programmatic' | 'native' | 'backdrop' | 'escape' | 'close-button';
  returnValue?: string;
}

/**
 * Detail for the `beforeclose` event — fired *before* the modal closes,
 * cancellable. Call `event.preventDefault()` to abort the close and render
 * your own confirm UI; once the user consents, call `ref.current?.hide({ force: true })`
 * to actually close (or just toggle your controlled `open` state to `false`).
 */
export interface TyModalBeforeCloseDetail {
  reason: 'programmatic' | 'backdrop' | 'escape' | 'close-button' | 'native';
}

export interface TyModalProps extends React.HTMLAttributes<HTMLElement> {
  /** Controls modal visibility */
  open?: boolean;

  /** No backdrop behind the modal (renders `no-backdrop`) */
  noBackdrop?: boolean;

  /** The page behind no longer scales down while open (renders `no-zoom`) */
  noZoom?: boolean;

  /** Full screen on phones (below 768px), sliding up from the bottom (renders `sheet`) */
  sheet?: boolean;

  /** Backdrop clicks no longer close the modal (also hides the built-in ✕) */
  preventOutsideClick?: boolean;

  /**
   * ESC no longer closes the modal (keydown is consumed, so the browser's
   * double-ESC anti-trap never fires). A fully guarded modal must render its
   * own close control — WCAG 2.1.2.
   */
  preventEscape?: boolean;

  /**
   * Accessible name — sets aria-label on the internal <dialog>. The dialog
   * gets role="dialog" for free, but nothing names it unless you set this.
   */
  label?: string;

  /** React event handlers */
  onOpen?: (event: CustomEvent<TyModalEventDetail>) => void;
  onClose?: (event: CustomEvent<TyModalEventDetail>) => void;
  /**
   * Fires before the modal closes. Cancellable — call `event.preventDefault()`
   * to abort. Use this for "discard changes?" flows with custom UI.
   */
  onBeforeClose?: (event: CustomEvent<TyModalBeforeCloseDetail>) => void;

  /** Modal content */
  children?: React.ReactNode;
}

export interface TyModalRef {
  show: () => void;
  /**
   * Close the modal. Without `force`, fires `beforeclose` first (consumer can
   * cancel). With `force: true`, bypasses `beforeclose` — call this once your
   * custom confirm UI has captured user consent.
   */
  hide: (opts?: { force?: boolean }) => void;
  element: HTMLElement | null;
}

export const TyModal = React.forwardRef<TyModalRef, TyModalProps>(
  ({
    open,
    noBackdrop,
    noZoom,
    sheet,
    preventOutsideClick,
    preventEscape,
    label,
    onOpen,
    onClose,
    onBeforeClose,
    children,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useImperativeHandle(ref, () => ({
      show: () => {
        if (elementRef.current && typeof (elementRef.current as any).show === 'function') {
          (elementRef.current as any).show();
        }
      },
      hide: (opts?: { force?: boolean }) => {
        if (elementRef.current && typeof (elementRef.current as any).hide === 'function') {
          (elementRef.current as any).hide(opts);
        }
      },
      element: elementRef.current,
    }), []);

    // Popup lifecycle events (`open`/`close`, plus `beforeclose` on the modal)
    // no longer bubble — core dispatches them non-composed on the element
    // itself, like the native <dialog> events they mirror, so a dropdown or
    // nested modal closing inside this one can't reach these listeners. The
    // `event.target === element` guard stays as belt-and-braces for consumers
    // pinned to an older tyrell-components.
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleOpen = (event: CustomEvent<TyModalEventDetail>) => {
        if (event.target !== element) return;
        if (onOpen) onOpen(event);
      };

      const handleClose = (event: CustomEvent<TyModalEventDetail>) => {
        if (event.target !== element) return;
        if (onClose) onClose(event);
      };

      const handleBeforeClose = (event: CustomEvent<TyModalBeforeCloseDetail>) => {
        if (event.target !== element) return;
        if (onBeforeClose) onBeforeClose(event);
      };

      if (onOpen) {
        element.addEventListener('open', handleOpen as EventListener);
      }

      if (onClose) {
        element.addEventListener('close', handleClose as EventListener);
      }

      if (onBeforeClose) {
        element.addEventListener('beforeclose', handleBeforeClose as EventListener);
      }

      return () => {
        if (onOpen) {
          element.removeEventListener('open', handleOpen as EventListener);
        }
        if (onClose) {
          element.removeEventListener('close', handleClose as EventListener);
        }
        if (onBeforeClose) {
          element.removeEventListener('beforeclose', handleBeforeClose as EventListener);
        }
      };
    }, [onOpen, onClose, onBeforeClose]);

    // Imperative property sync for boolean props (see use-boolean-prop.ts).
    // Without this, flipping `open` from `true` to `false` on React 18 leaves
    // the `open` attribute on the element and the modal stays open.
    const isOpen = useBooleanProperty(elementRef, 'open', open);

    // Presence booleans: bridge them imperatively too so they propagate.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const el = elementRef.current as any;
      if (!el) return;
      const setIf = (prop: string, raw: unknown) => {
        if (raw === undefined) return;
        const next = coerceBool(raw);
        if (Boolean(el[prop]) !== next) el[prop] = next;
      };
      setIf('noBackdrop', noBackdrop);
      setIf('noZoom', noZoom);
      setIf('sheet', sheet);
      setIf('preventOutsideClick', preventOutsideClick);
      setIf('preventEscape', preventEscape);
    }, [noBackdrop, noZoom, sheet, preventOutsideClick, preventEscape]);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (isOpen) webComponentProps.open = '';

    if (noBackdrop !== undefined && coerceBool(noBackdrop)) {
      webComponentProps['no-backdrop'] = '';
    }
    if (noZoom !== undefined && coerceBool(noZoom)) {
      webComponentProps['no-zoom'] = '';
    }
    if (sheet !== undefined && coerceBool(sheet)) {
      webComponentProps.sheet = '';
    }
    // Presence booleans: render the bare attribute only when true
    if (preventOutsideClick !== undefined && coerceBool(preventOutsideClick)) {
      webComponentProps['prevent-outside-click'] = '';
    }
    if (preventEscape !== undefined && coerceBool(preventEscape)) {
      webComponentProps['prevent-escape'] = '';
    }
    if (label) webComponentProps.label = label;

    return React.createElement(
      'ty-modal',
      webComponentProps,
      children
    );
  }
);

TyModal.displayName = 'TyModal';
