import { VERSION } from '../version';

/** Current version of tyrell-react (auto-synced with package.json on build). */
export { VERSION };

// One-time load banner so consumers can confirm which version of
// tyrell-react their page is actually running. Mirrors the banner in
// tyrell-components. Filter DevTools with "tyrell-react" if noisy.
if (typeof window !== 'undefined') {
  (window as any).tyReactVersion = VERSION;
  console.log(
    `%c[tyrell-react]%c v${VERSION}`,
    'color:#a78bfa;font-weight:600',
    'color:inherit;font-weight:400'
  );
}

// Every component is exported twice: Ty-prefixed (TyButton) and short
// (Button). Both names point at the same wrapper — pick one per project.

export { TyButton } from './TyButton';
export type { TyButtonProps, TyButtonCSSProperties } from './TyButton';

export { TyTag } from './TyTag';
export type { TyTagProps, TyTagCSSProperties } from './TyTag';

export { TyInput } from './TyInput';
export type { TyInputProps, TyInputEventDetail, TyInputCSSProperties } from './TyInput';

export { TyTextarea } from './TyTextarea';
export type { TyTextareaProps, TyTextareaEventDetail } from './TyTextarea';

export { TyOption } from './TyOption';
export type { TyOptionProps } from './TyOption';

export { TyIcon } from './TyIcon';
export type { TyIconProps } from './TyIcon';

export { TyModal } from './TyModal';
export type { TyModalProps, TyModalEventDetail, TyModalRef } from './TyModal';
// Platform/ARIA name alias (the element is also registered as ty-dialog)
export { TyModal as TyDialog } from './TyModal';
export type { TyModalProps as TyDialogProps, TyModalEventDetail as TyDialogEventDetail, TyModalRef as TyDialogRef } from './TyModal';

export { TyTooltip } from './TyTooltip';
export type { TyTooltipProps } from './TyTooltip';

export { TySelect, TySelectedOptions, TySelectedTags } from './TySelect';
export type { TySelectProps, TySelectEventDetail, TySelectItem, TySelectedTagsProps } from './TySelect';

export { TyCalendar } from './TyCalendar';
export type { TyCalendarProps, TyCalendarChangeEventDetail, TyCalendarNavigateEventDetail } from './TyCalendar';

export { TyDatePicker } from './TyDatePicker';
export type { TyDatePickerProps, TyDatePickerEventDetail } from './TyDatePicker';

export { TyPopup } from './TyPopup';
export type { TyPopupProps, TyPopupElement } from './TyPopup';

export { TyCheckbox } from './TyCheckbox';
export type { TyCheckboxProps, TyCheckboxEventDetail } from './TyCheckbox';

export { TySwitch } from './TySwitch';
export type { TySwitchProps, TySwitchEventDetail } from './TySwitch';

export { TyRadio } from './TyRadio';
export type { TyRadioProps } from './TyRadio';

export { TyRadioGroup } from './TyRadioGroup';
export type { TyRadioGroupProps, TyRadioGroupEventDetail } from './TyRadioGroup';

export { TyCopy } from './TyCopy';
export type { TyCopyProps } from './TyCopy';
// Descriptive name alias (the element is also registered as ty-copy-field)
export { TyCopy as TyCopyField } from './TyCopy';
export type { TyCopyProps as TyCopyFieldProps } from './TyCopy';

export { TyFileUpload } from './TyFileUpload';
export type { TyFileUploadProps, TyFileUploadEventDetail } from './TyFileUpload';

export { TyTabs } from './TyTabs';
export type { TyTabsProps, TabChangeDetail } from './TyTabs';

export { TyTab } from './TyTab';
export type { TyTabProps } from './TyTab';

export { TyCalendarMonth } from './TyCalendarMonth';
export type { TyCalendarMonthProps, DayClickDetail } from './TyCalendarMonth';

export { TyCalendarNavigation } from './TyCalendarNavigation';
export type { TyCalendarNavigationProps, NavigationChangeDetail } from './TyCalendarNavigation';

export { TyWizard } from './TyWizard';
export type { TyWizardProps, WizardStepChangeDetail } from './TyWizard';

export { TyStep } from './TyStep';
export type { TyStepProps } from './TyStep';

export { TyResizeObserver } from './TyResizeObserver';
export type { TyResizeObserverProps } from './TyResizeObserver';

export { TyScrollContainer } from './TyScrollContainer';
export type { TyScrollContainerProps, TyScrollContainerRef } from './TyScrollContainer';

export { TyButton as Button } from './TyButton';
export { TyTag as Tag } from './TyTag';
export { TyInput as Input } from './TyInput';
export { TyTextarea as Textarea } from './TyTextarea';
export { TyOption as Option } from './TyOption';
export { TyIcon as Icon } from './TyIcon';
export { TyModal as Modal } from './TyModal';
export { TyTooltip as Tooltip } from './TyTooltip';
export { TyCalendar as Calendar } from './TyCalendar';
export { TyDatePicker as DatePicker } from './TyDatePicker';
export { TyPopup as Popup } from './TyPopup';
export { TyCheckbox as Checkbox } from './TyCheckbox';
export { TySwitch as Switch } from './TySwitch';
export { TyRadio as Radio } from './TyRadio';
export { TyRadioGroup as RadioGroup } from './TyRadioGroup';
export { TyCopy as Copy } from './TyCopy';
export { TyFileUpload as FileUpload } from './TyFileUpload';
export { TyTabs as Tabs } from './TyTabs';
export { TyTab as Tab } from './TyTab';
export { TyCalendarMonth as CalendarMonth } from './TyCalendarMonth';
export { TyCalendarNavigation as CalendarNavigation } from './TyCalendarNavigation';
export { TyWizard as Wizard } from './TyWizard';
export { TyStep as Step } from './TyStep';
export { TyResizeObserver as ResizeObserver } from './TyResizeObserver';
export { TyScrollContainer as ScrollContainer } from './TyScrollContainer';

export type { TyButtonProps as ButtonProps } from './TyButton';

export type { TyTagProps as TagProps } from './TyTag';

export type { TyInputProps as InputProps, TyInputEventDetail as InputEventDetail } from './TyInput';

export type { TyTextareaProps as TextareaProps, TyTextareaEventDetail as TextareaEventDetail } from './TyTextarea';

export type { TyOptionProps as OptionProps } from './TyOption';

export type { TyIconProps as IconProps } from './TyIcon';

export type { TyModalProps as ModalProps, TyModalEventDetail as ModalEventDetail, TyModalRef as ModalRef } from './TyModal';

export type { TyTooltipProps as TooltipProps } from './TyTooltip';

export type { TyCalendarProps as CalendarProps, TyCalendarChangeEventDetail as CalendarChangeEventDetail, TyCalendarNavigateEventDetail as CalendarNavigateEventDetail } from './TyCalendar';

export type { TyDatePickerProps as DatePickerProps, TyDatePickerEventDetail as DatePickerEventDetail } from './TyDatePicker';

export type { TyPopupProps as PopupProps, TyPopupElement as PopupElement } from './TyPopup';

export type { TyCheckboxProps as CheckboxProps, TyCheckboxEventDetail as CheckboxEventDetail } from './TyCheckbox';

export type { TySwitchProps as SwitchProps, TySwitchEventDetail as SwitchEventDetail } from './TySwitch';

export type { TyRadioProps as RadioProps } from './TyRadio';

export type { TyRadioGroupProps as RadioGroupProps, TyRadioGroupEventDetail as RadioGroupEventDetail } from './TyRadioGroup';

export type { TyCopyProps as CopyProps } from './TyCopy';

export type { TyFileUploadProps as FileUploadProps, TyFileUploadEventDetail as FileUploadEventDetail } from './TyFileUpload';

export type { TyTabsProps as TabsProps } from './TyTabs';

export type { TyTabProps as TabProps } from './TyTab';

export type { TyCalendarMonthProps as CalendarMonthProps } from './TyCalendarMonth';

export type { TyCalendarNavigationProps as CalendarNavigationProps } from './TyCalendarNavigation';

export type { TyWizardProps as WizardProps, WizardStepChangeDetail as StepChangeDetail } from './TyWizard';

export type { TyStepProps as StepProps } from './TyStep';

export type { TyResizeObserverProps as ResizeObserverProps } from './TyResizeObserver';

export type { TyScrollContainerProps as ScrollContainerProps, TyScrollContainerRef as ScrollContainerRef } from './TyScrollContainer';
