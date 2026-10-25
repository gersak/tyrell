import { VERSION } from '../version.js';

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

export { TyButton } from './TyButton.js';
export type { TyButtonProps, TyButtonCSSProperties } from './TyButton.js';

export { TyTag } from './TyTag.js';
export type { TyTagProps, TyTagCSSProperties } from './TyTag.js';

export { TyInput } from './TyInput.js';
export type { TyInputProps, TyInputEventDetail, TyInputCSSProperties } from './TyInput.js';

export { TyTextarea } from './TyTextarea.js';
export type { TyTextareaProps, TyTextareaEventDetail } from './TyTextarea.js';

export { TyOption } from './TyOption.js';
export type { TyOptionProps } from './TyOption.js';

export { TyIcon } from './TyIcon.js';
export type { TyIconProps } from './TyIcon.js';

export { TyModal } from './TyModal.js';
export type { TyModalProps, TyModalEventDetail, TyModalRef } from './TyModal.js';
// Platform/ARIA name alias (the element is also registered as ty-dialog)
export { TyModal as TyDialog } from './TyModal.js';
export type { TyModalProps as TyDialogProps, TyModalEventDetail as TyDialogEventDetail, TyModalRef as TyDialogRef } from './TyModal.js';

export { TyTooltip } from './TyTooltip.js';
export type { TyTooltipProps } from './TyTooltip.js';

export { TySelect, TySelectedOptions, TySelectedTags } from './TySelect.js';
export type { TySelectProps, TySelectEventDetail, TySelectItem, TySelectedTagsProps } from './TySelect.js';

export { TyCalendar } from './TyCalendar.js';
export type { TyCalendarProps, TyCalendarChangeEventDetail, TyCalendarNavigateEventDetail } from './TyCalendar.js';

export { TyDatePicker } from './TyDatePicker.js';
export type { TyDatePickerProps, TyDatePickerEventDetail } from './TyDatePicker.js';

export { TyPopup } from './TyPopup.js';
export type { TyPopupProps, TyPopupElement } from './TyPopup.js';

export { TyCheckbox } from './TyCheckbox.js';
export type { TyCheckboxProps, TyCheckboxEventDetail } from './TyCheckbox.js';

export { TySwitch } from './TySwitch.js';
export type { TySwitchProps, TySwitchEventDetail } from './TySwitch.js';

export { TyRadio } from './TyRadio.js';
export type { TyRadioProps } from './TyRadio.js';

export { TyRadioGroup } from './TyRadioGroup.js';
export type { TyRadioGroupProps, TyRadioGroupEventDetail } from './TyRadioGroup.js';

export { TyCopy } from './TyCopy.js';
export type { TyCopyProps } from './TyCopy.js';
// Descriptive name alias (the element is also registered as ty-copy-field)
export { TyCopy as TyCopyField } from './TyCopy.js';
export type { TyCopyProps as TyCopyFieldProps } from './TyCopy.js';

export { TyFileUpload } from './TyFileUpload.js';
export type { TyFileUploadProps, TyFileUploadEventDetail } from './TyFileUpload.js';

export { TyTabs } from './TyTabs.js';
export type { TyTabsProps, TabChangeDetail } from './TyTabs.js';

export { TyTab } from './TyTab.js';
export type { TyTabProps, TabLoadDetail } from './TyTab.js';

export { TyCalendarMonth } from './TyCalendarMonth.js';
export type { TyCalendarMonthProps, DayClickDetail } from './TyCalendarMonth.js';

export { TyCalendarNavigation } from './TyCalendarNavigation.js';
export type { TyCalendarNavigationProps, NavigationChangeDetail, CalendarView, ViewToggleDetail } from './TyCalendarNavigation.js';

export { TyWizard } from './TyWizard.js';
export type { TyWizardProps, WizardStepChangeDetail } from './TyWizard.js';

export { TyStep } from './TyStep.js';
export type { TyStepProps } from './TyStep.js';

export { TyResizeObserver } from './TyResizeObserver.js';
export type { TyResizeObserverProps } from './TyResizeObserver.js';

export { TyScrollContainer } from './TyScrollContainer.js';
export type { TyScrollContainerProps, TyScrollContainerRef } from './TyScrollContainer.js';

export { TyButton as Button } from './TyButton.js';
export { TyTag as Tag } from './TyTag.js';
export { TyInput as Input } from './TyInput.js';
export { TyTextarea as Textarea } from './TyTextarea.js';
export { TyOption as Option } from './TyOption.js';
export { TyIcon as Icon } from './TyIcon.js';
export { TyModal as Modal } from './TyModal.js';
export { TyTooltip as Tooltip } from './TyTooltip.js';
export { TyCalendar as Calendar } from './TyCalendar.js';
export { TyDatePicker as DatePicker } from './TyDatePicker.js';
export { TyPopup as Popup } from './TyPopup.js';
export { TyCheckbox as Checkbox } from './TyCheckbox.js';
export { TySwitch as Switch } from './TySwitch.js';
export { TyRadio as Radio } from './TyRadio.js';
export { TyRadioGroup as RadioGroup } from './TyRadioGroup.js';
export { TyCopy as Copy } from './TyCopy.js';
export { TyFileUpload as FileUpload } from './TyFileUpload.js';
export { TyTabs as Tabs } from './TyTabs.js';
export { TyTab as Tab } from './TyTab.js';
export { TyCalendarMonth as CalendarMonth } from './TyCalendarMonth.js';
export { TyCalendarNavigation as CalendarNavigation } from './TyCalendarNavigation.js';
export { TyWizard as Wizard } from './TyWizard.js';
export { TyStep as Step } from './TyStep.js';
export { TyResizeObserver as ResizeObserver } from './TyResizeObserver.js';
export { TyScrollContainer as ScrollContainer } from './TyScrollContainer.js';
export { TySelect as Select, TySelectedOptions as SelectedOptions } from './TySelect.js';

export type { TyButtonProps as ButtonProps } from './TyButton.js';

export type { TyTagProps as TagProps } from './TyTag.js';

export type { TyInputProps as InputProps, TyInputEventDetail as InputEventDetail } from './TyInput.js';

export type { TyTextareaProps as TextareaProps, TyTextareaEventDetail as TextareaEventDetail } from './TyTextarea.js';

export type { TyOptionProps as OptionProps } from './TyOption.js';

export type { TyIconProps as IconProps } from './TyIcon.js';

export type { TyModalProps as ModalProps, TyModalEventDetail as ModalEventDetail, TyModalRef as ModalRef } from './TyModal.js';

export type { TyTooltipProps as TooltipProps } from './TyTooltip.js';

export type { TyCalendarProps as CalendarProps, TyCalendarChangeEventDetail as CalendarChangeEventDetail, TyCalendarNavigateEventDetail as CalendarNavigateEventDetail } from './TyCalendar.js';

export type { TyDatePickerProps as DatePickerProps, TyDatePickerEventDetail as DatePickerEventDetail } from './TyDatePicker.js';

export type { TyPopupProps as PopupProps, TyPopupElement as PopupElement } from './TyPopup.js';

export type { TyCheckboxProps as CheckboxProps, TyCheckboxEventDetail as CheckboxEventDetail } from './TyCheckbox.js';

export type { TySwitchProps as SwitchProps, TySwitchEventDetail as SwitchEventDetail } from './TySwitch.js';

export type { TyRadioProps as RadioProps } from './TyRadio.js';

export type { TyRadioGroupProps as RadioGroupProps, TyRadioGroupEventDetail as RadioGroupEventDetail } from './TyRadioGroup.js';

export type { TyCopyProps as CopyProps } from './TyCopy.js';

export type { TyFileUploadProps as FileUploadProps, TyFileUploadEventDetail as FileUploadEventDetail } from './TyFileUpload.js';

export type { TyTabsProps as TabsProps } from './TyTabs.js';

export type { TyTabProps as TabProps } from './TyTab.js';

export type { TyCalendarMonthProps as CalendarMonthProps } from './TyCalendarMonth.js';

export type { TyCalendarNavigationProps as CalendarNavigationProps } from './TyCalendarNavigation.js';

export type { TyWizardProps as WizardProps, WizardStepChangeDetail as StepChangeDetail } from './TyWizard.js';

export type { TyStepProps as StepProps } from './TyStep.js';

export type { TyResizeObserverProps as ResizeObserverProps } from './TyResizeObserver.js';

export type { TyScrollContainerProps as ScrollContainerProps, TyScrollContainerRef as ScrollContainerRef } from './TyScrollContainer.js';
