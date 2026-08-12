import React, { useEffect, useRef } from 'react';
import { hostProps } from '../utils/host-props';
import { useBooleanProperty } from '../utils/use-boolean-prop';

type BuiltinFlavor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
type ShadedFlavor = BuiltinFlavor | `${BuiltinFlavor}+` | `${BuiltinFlavor}-`;

export interface TyRadioGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'onInput'> {
  /** Currently selected value (matches one child `<TyRadio value="...">`) */
  value?: string;

  /** Form field name */
  name?: string;

  /** Group label rendered above the radios */
  label?: string;

  /** Disable the entire group */
  disabled?: boolean;

  /** Required field — renders required-icon next to the label */
  required?: boolean;

  /** Error message rendered below the group */
  error?: string;

  /** Layout direction for radio children */
  orientation?: 'vertical' | 'horizontal';

  /** Group size — propagates to all `<TyRadio>` children */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Group flavor — propagates to all `<TyRadio>` children */
  flavor?: ShadedFlavor | (string & {});

  /**
   * Fires when selection changes (React convention)
   * Maps to native 'input' event from ty-radio-group
   */
  onChange?: (event: CustomEvent<TyRadioGroupEventDetail>) => void;

  /**
   * Fires on blur if value changed (native DOM behavior)
   * Maps to native 'change' event from ty-radio-group
   */
  onChangeCommit?: (event: CustomEvent<TyRadioGroupEventDetail>) => void;

  /** `<TyRadio>` children */
  children?: React.ReactNode;
}

export interface TyRadioGroupEventDetail {
  value: string;
  formValue: string;
  originalEvent: Event;
}

export const TyRadioGroup = React.forwardRef<HTMLElement, TyRadioGroupProps>(
  ({
    children,
    value,
    name,
    label,
    disabled,
    required,
    error,
    orientation,
    size,
    flavor,
    onChange,
    onChangeCommit,
    ...props
  }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleInput = (event: Event) => {
        if (onChange) onChange(event as CustomEvent<TyRadioGroupEventDetail>);
      };
      const handleChangeCommit = (event: Event) => {
        if (onChangeCommit) onChangeCommit(event as CustomEvent<TyRadioGroupEventDetail>);
      };

      element.addEventListener('input', handleInput);
      element.addEventListener('change', handleChangeCommit);

      return () => {
        element.removeEventListener('input', handleInput);
        element.removeEventListener('change', handleChangeCommit);
      };
    }, [onChange, onChangeCommit]);

    useEffect(() => {
      if (ref && elementRef.current) {
        if (typeof ref === 'function') {
          ref(elementRef.current);
        } else {
          ref.current = elementRef.current;
        }
      }
    }, [ref]);

    const isDisabled = useBooleanProperty(elementRef, 'disabled', disabled);
    const isRequired = useBooleanProperty(elementRef, 'required', required);

    const webComponentProps: Record<string, any> = {
      ...hostProps(props),
      ref: elementRef,
    };

    if (isDisabled) webComponentProps.disabled = '';
    if (isRequired) webComponentProps.required = '';

    if (value !== undefined) webComponentProps.value = value;
    if (name) webComponentProps.name = name;
    if (label) webComponentProps.label = label;
    if (error) webComponentProps.error = error;
    if (orientation) webComponentProps.orientation = orientation;
    if (size) webComponentProps.size = size;
    if (flavor) webComponentProps.flavor = flavor;

    return React.createElement('ty-radio-group', webComponentProps, children);
  }
);

TyRadioGroup.displayName = 'TyRadioGroup';
