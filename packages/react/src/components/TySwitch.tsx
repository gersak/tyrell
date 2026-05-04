import React, { useEffect, useRef } from 'react';

export interface TySwitchProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'onInput'> {
  /** Checked (on) state */
  checked?: boolean;

  /** Form field value when checked */
  value?: string;

  /** Form field name */
  name?: string;

  /** Disable the switch */
  disabled?: boolean;

  /** Required field */
  required?: boolean;

  /** Switch size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Semantic styling variant */
  flavor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';

  /**
   * Fires when switch state changes (React convention)
   * Maps to native 'input' event from ty-switch
   */
  onChange?: (event: CustomEvent<TySwitchEventDetail>) => void;

  /**
   * Fires on blur if value changed (native DOM behavior)
   * Maps to native 'change' event from ty-switch
   */
  onChangeCommit?: (event: CustomEvent<TySwitchEventDetail>) => void;
}

export interface TySwitchEventDetail {
  value: boolean;
  checked: boolean;
  formValue: string | null;
  originalEvent: Event;
}

export const TySwitch = React.forwardRef<HTMLElement, TySwitchProps>(
  ({
    checked,
    value,
    name,
    disabled,
    required,
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
        if (onChange) onChange(event as CustomEvent<TySwitchEventDetail>);
      };
      const handleChangeCommit = (event: Event) => {
        if (onChangeCommit) onChangeCommit(event as CustomEvent<TySwitchEventDetail>);
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

    const webComponentProps: Record<string, any> = {
      ...props,
      ref: elementRef,
    };

    if (checked) webComponentProps.checked = '';
    if (disabled) webComponentProps.disabled = '';
    if (required) webComponentProps.required = '';

    if (value) webComponentProps.value = value;
    if (name) webComponentProps.name = name;
    if (size) webComponentProps.size = size;
    if (flavor) webComponentProps.flavor = flavor;

    return React.createElement('ty-switch', webComponentProps);
  }
);

TySwitch.displayName = 'TySwitch';
