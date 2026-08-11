import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty, coerceBool } from '../utils/use-boolean-prop';
import { needsPropertyBridge } from '../utils/react-version';

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

  /** Show backdrop behind modal (default: true) */
  backdrop?: boolean;

  /** Allow closing modal by clicking backdrop (default: true) */
  closeOnOutsideClick?: boolean;

  /** Allow closing modal with Escape key (default: true) */
  closeOnEscape?: boolean;

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
    backdrop,
    closeOnOutsideClick,
    closeOnEscape,
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

    // ty-dropdown, ty-multiselect, ty-date-picker etc. dispatch their own
    // `open`/`close` custom events with `bubbles: true, composed: true` when
    // their internal popups toggle. Those events bubble up through the
    // modal's slotted content and land on the ty-modal host — same event
    // type, same listener. Without the `event.target === element` guard, an
    // `onClose={() => setIsOpen(false)}` callback would fire every time the
    // user closes a dropdown inside the modal, and the React state flip
    // would close the modal. Core's modal.ts already applies the same guard
    // on its internal <dialog>.onclose; this is the React-layer mirror.
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

    // For default-true booleans (backdrop, closeOn*), only the explicit-false
    // case is interesting — bridge it imperatively too so it propagates.
    useEffect(() => {
      if (!needsPropertyBridge) return;
      const el = elementRef.current as any;
      if (!el) return;
      const setIf = (prop: string, raw: unknown) => {
        if (raw === undefined) return;
        const next = coerceBool(raw);
        if (Boolean(el[prop]) !== next) el[prop] = next;
      };
      setIf('backdrop', backdrop);
      setIf('closeOnOutsideClick', closeOnOutsideClick);
      setIf('closeOnEscape', closeOnEscape);
    }, [backdrop, closeOnOutsideClick, closeOnEscape]);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (isOpen) webComponentProps.open = '';

    // Default-true booleans use "false" string on the attribute side; the
    // core's parseBoolAttr handles it correctly.
    if (backdrop !== undefined && !coerceBool(backdrop)) {
      webComponentProps.backdrop = 'false';
    }
    if (closeOnOutsideClick !== undefined && !coerceBool(closeOnOutsideClick)) {
      webComponentProps['close-on-outside-click'] = 'false';
    }
    if (closeOnEscape !== undefined && !coerceBool(closeOnEscape)) {
      webComponentProps['close-on-escape'] = 'false';
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
