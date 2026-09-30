/**
 * Constraint validation for form-associated ty components.
 *
 * Components report their own state (e.g. valueMissing) through set(); users
 * add a custom error through setCustomValidity(). Both are kept separately and
 * merged into ElementInternals, so a component re-validating on the next
 * keystroke doesn't wipe the user's custom error (same as native inputs).
 *
 * reportValidity() uses the component's own `error` display when it has one
 * (ty-input, ty-textarea, ty-radio-group, ty-file-upload) instead of the
 * browser's bubble, and clears that message again once the field is valid.
 */

type Own = { flags: ValidityStateFlags; message?: string; anchor?: HTMLElement };

export class ValidityController {
  private own: Own = { flags: {} };
  private custom = '';
  /** `error` was written by reportValidity(), so it's ours to clear. */
  private errorFromReport = false;

  constructor(private host: HTMLElement, private internals: ElementInternals) {}

  /** The component's own validity (replaces the previous one). */
  set(flags: ValidityStateFlags, message?: string, anchor?: HTMLElement): void {
    this.own = { flags, message, anchor };
    this.sync();
  }

  setCustom(message: string): void {
    this.custom = message || '';
    this.sync();
  }

  report(): boolean {
    const valid = this.internals.checkValidity(); // fires 'invalid' when not
    if (valid) return true;
    if ('error' in this.host) {
      this.host.setAttribute('error', this.internals.validationMessage);
      this.errorFromReport = true;
      this.host.focus();
    } else {
      this.internals.reportValidity(); // no error display: browser bubble
    }
    return false;
  }

  private sync(): void {
    const { flags, message, anchor } = this.own;
    const invalid = Object.values(flags).some(Boolean);
    if (this.custom) {
      this.internals.setValidity({ ...flags, customError: true }, this.custom, anchor);
    } else if (invalid) {
      this.internals.setValidity(flags, message || 'Invalid value', anchor);
    } else {
      this.internals.setValidity({});
    }

    if (!this.errorFromReport) return;
    if (this.internals.validity.valid) {
      this.host.removeAttribute('error');
      this.errorFromReport = false;
    } else if (this.host.getAttribute('error') !== this.internals.validationMessage) {
      this.host.setAttribute('error', this.internals.validationMessage);
    }
  }
}
