import React, { useEffect, useRef } from 'react';
import { useBooleanProperty } from '../utils/use-boolean-prop';

// Type definitions for Ty File Upload component
export interface TyFileUploadProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Form field name — used as the FormData key */
  name?: string;

  /** Allow selecting multiple files */
  multiple?: boolean;

  /** File type filter passed to the underlying input (e.g. "image/*", ".pdf,.docx") */
  accept?: string;

  /** Field label rendered above the drop zone */
  label?: string;

  /** Hint text shown inside the drop zone when no files are selected */
  placeholder?: string;

  /** Disable interaction */
  disabled?: boolean;

  /** Mark the field as required (shows asterisk) */
  required?: boolean;

  /** Validation error message — also applies danger border styling */
  error?: string;

  /**
   * Fires when the selection changes — browse, drag-drop, or remove.
   * Maps to the native 'change' event from ty-file-upload.
   */
  onChange?: (event: CustomEvent<TyFileUploadEventDetail>) => void;
}

export interface TyFileUploadEventDetail {
  value: File[];
  files: File[];
  names: string[];
}

// React wrapper for ty-file-upload web component
export const TyFileUpload = React.forwardRef<HTMLElement, TyFileUploadProps>(
  ({
    name,
    multiple,
    accept,
    label,
    placeholder,
    disabled,
    required,
    error,
    onChange,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleChange = (event: Event) => {
        if (onChange) {
          onChange(event as CustomEvent<TyFileUploadEventDetail>);
        }
      };

      element.addEventListener('change', handleChange);
      return () => {
        element.removeEventListener('change', handleChange);
      };
    }, [onChange]);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    const isMultiple = useBooleanProperty(elementRef, 'multiple', multiple);
    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isRequired = useBooleanProperty(elementRef, 'required', required);

    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    if (isMultiple) webComponentProps.multiple = '';
    if (isDisabled) webComponentProps.disabled = '';
    if (isRequired) webComponentProps.required = '';

    if (name) webComponentProps.name = name;
    if (accept) webComponentProps.accept = accept;
    if (label) webComponentProps.label = label;
    if (placeholder) webComponentProps.placeholder = placeholder;
    if (error) webComponentProps.error = error;

    return React.createElement('ty-file-upload', webComponentProps);
  }
);

TyFileUpload.displayName = 'TyFileUpload';
