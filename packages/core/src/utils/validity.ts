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
 * Whenever the browser fires `invalid` on such a field — a submit attempt,
 * form.reportValidity(), or checkValidity() on the field or its form — the
 * message goes into that error line (no bubble), so a plain <form> needs no
 * JS. For a check that shows nothing, read `field.validity.valid` or
 * `form.matches(':invalid')`. A submit (a submitter click, Enter in a
 * single-line field, form.requestSubmit()) and form.reportValidity() also
 * move focus to the first failing field — the first in form order, like a
 * native form, also when a later field shows a bubble. checkValidity() never
 * does. For the script-run calls, a form holding a Ty field with an error
 * line gets own requestSubmit / reportValidity wrappers (the prototype and
 * other forms are left alone); they come off when the last such field leaves.
 * An `error` the author set is never overwritten or removed;
 * form.reset() clears every message the controller wrote.
 */

type Own = { flags: ValidityStateFlags; message?: string; anchor?: HTMLElement };

/**
 * True while a form reports its validation: for the rest of the task in
 * which the user clicked a submitter or pressed Enter in a field that submits
 * implicitly, during form.requestSubmit() / form.reportValidity() on a form
 * holding a Ty field (see wrapForm()), and a ty-button submit. Used
 * only to decide whether `invalid` moves focus (ours, or the browser's for a
 * bubble): checkValidity() fires the same event.
 */
let submitAttempt = false;
/** A pointer interaction is under way: a blur now is part of a click elsewhere. */
let pointerPressed = false;
let touchRelease: ReturnType<typeof setTimeout> | undefined;
/** Controllers whose blur reveal waits for the click to finish. */
const pendingReveals = new Set<ValidityController>();
let documentWatched = false;

/** The click is over: show the reveals that waited for it. */
function release(): void {
  clearTimeout(touchRelease);
  pointerPressed = false;
  if (pendingReveals.size === 0) return;
  // The set is read only in the next task, so a form.reset() run by the
  // click (a reset button) can still take its fields out.
  setTimeout(() => {
    const waiting = [...pendingReveals];
    pendingReveals.clear();
    waiting.forEach((c) => c.reveal());
  });
}

function watchDocument(): void {
  if (documentWatched) return;
  documentWatched = true;
  const mark = () => {
    submitAttempt = true;
    setTimeout(() => { submitAttempt = false; });
  };
  document.addEventListener('click', (e) => {
    // composedPath(): by the time it reaches the document, a click in a
    // shadow root (Lit, Stencil) is retargeted to that root's host.
    const control = e.composedPath().find(
      (n): n is HTMLButtonElement | HTMLInputElement => n instanceof HTMLButtonElement || n instanceof HTMLInputElement,
    );
    if (control?.form && (control.type === 'submit' || control.type === 'image')) mark();
    if (pointerPressed) release();
  }, true);
  document.addEventListener('keydown', (e) => {
    // Only a single-line input submits implicitly: not a textarea or
    // contenteditable, nor Enter confirming an IME composition. (ty-input's
    // Enter submits through requestSubmit() or a submitter click.)
    const target = e.composedPath()[0];
    if (e.key === 'Enter' && !e.isComposing && target instanceof HTMLInputElement && target.form) mark();
  }, true);
  // Revealing an error line on blur pushes the layout down. If the blur came
  // from pressing a button below the field, the button would move before
  // the click and the click would be lost — so wait until the click (and any
  // submit or reset) has run.
  document.addEventListener('pointerdown', () => {
    clearTimeout(touchRelease);
    pointerPressed = true;
  }, true);
  document.addEventListener('pointerup', (e) => {
    // A mouse clicks in the same task. A touch moves focus (the blur) only at
    // its compatibility mousedown, after pointerup, then clicks: wait for
    // that click (above). A long press or a drag never clicks.
    if (e.pointerType === 'mouse') release();
    else touchRelease = setTimeout(release, 1000);
  }, true);
  document.addEventListener('pointercancel', release, true);

  watchRoot(document);
}

/**
 * Run `fn` as a submit attempt: `invalid` events during it move focus to the
 * first failing field. ty-button runs its form.requestSubmit() in this.
 */
export function asSubmitAttempt<T>(fn: () => T): T {
  const was = submitAttempt;
  submitAttempt = true;
  try {
    return fn();
  } finally {
    submitAttempt = was;
  }
}

const formMethods = ['requestSubmit', 'reportValidity'] as const;
type FormMethod = typeof formMethods[number];
type Wrapped = {
  /** The Ty fields with an error line whose form this is. */
  fields: Set<ValidityController>;
  /** Our wrapper per method, and the own property it replaced (if any). */
  ours: Partial<Record<FormMethod, { fn: Function; replaced?: PropertyDescriptor }>>;
};
/** Forms holding a Ty field with an error line, see track(). */
const wrappedForms = new WeakMap<HTMLFormElement, Wrapped>();

/**
 * A script-run form.requestSubmit() / form.reportValidity() focuses the first
 * failing field too, so a form holding a Ty field with an error line gets own
 * requestSubmit / reportValidity wrappers that run the call as a submit
 * attempt. Whatever was there is called through: an own property someone
 * else set, or else the prototype's method looked up at call time (so a
 * prototype patch made later still runs).
 */
function wrapForm(form: HTMLFormElement): Wrapped {
  let entry = wrappedForms.get(form);
  if (entry) return entry;
  entry = { fields: new Set(), ours: {} };
  wrappedForms.set(form, entry);
  for (const name of formMethods) {
    if (typeof (form as any)[name] !== 'function') continue;
    const replaced = Object.getOwnPropertyDescriptor(form, name);
    const previous = replaced ? (form as any)[name] : undefined;
    const fn = function (this: HTMLFormElement, ...args: unknown[]) {
      const next = previous ?? (Object.getPrototypeOf(form) as any)[name];
      return asSubmitAttempt(() => next.apply(this, args));
    };
    Object.defineProperty(form, name, { value: fn, writable: true, configurable: true, enumerable: false });
    entry.ours[name] = { fn, replaced };
  }
  return entry;
}

/**
 * The last Ty field left: take our wrappers off again. One someone else
 * replaced since stays (theirs may call ours); it just passes through.
 */
function unwrapForm(form: HTMLFormElement, entry: Wrapped): void {
  wrappedForms.delete(form);
  for (const name of formMethods) {
    const own = entry.ours[name];
    if (!own || Object.getOwnPropertyDescriptor(form, name)?.value !== own.fn) continue;
    if (own.replaced) Object.defineProperty(form, name, own.replaced);
    else delete (form as any)[name];
  }
}

/** Roots (the document, shadow roots) whose `invalid` events are watched. */
const watchedRoots = new WeakSet<Node>();

/**
 * A submit attempt fires `invalid` on every failing control, then the
 * browser shows its bubble on the first one that didn't cancel the event and
 * focuses it. A field with an error line cancels its own, so with one first
 * in the form a later checkbox or native input would get the bubble and the
 * focus. Cancel the rest then: the first field focuses itself. `invalid`
 * doesn't leave a shadow root, so a form in one is watched at that root.
 */
function watchRoot(root: Node): void {
  if (watchedRoots.has(root)) return;
  watchedRoots.add(root);
  root.addEventListener('invalid', (e) => {
    if (!submitAttempt) return;
    const target = e.target as HTMLInputElement;
    const first = target.form ? firstInvalid(target.form) : undefined;
    if (first && first !== target && hasErrorLine(first)) e.preventDefault();
  }, true);
}

/** `node` is a shadow-including descendant of `host` (or `host` itself). */
function within(host: Node, node: Node): boolean {
  for (let n: Node | undefined = node; n; n = (n.getRootNode() as ShadowRoot).host) {
    if (host.contains(n)) return true;
  }
  return false;
}

/**
 * First control of the form that is currently invalid (tree order). Like the
 * browser picking where to report, it skips one that isn't rendered or is
 * visibility:hidden (e.g. in another ty-wizard step): it couldn't take focus.
 */
function firstInvalid(form: HTMLFormElement): Element | undefined {
  return Array.from(form.elements).find((el) => {
    const c = el as HTMLInputElement & { checkVisibility?: (o?: object) => boolean };
    return c.willValidate && c.validity && !c.validity.valid &&
      c.checkVisibility?.({ visibilityProperty: true, checkVisibilityCSS: true }) !== false;
  });
}

/** Hosts of a ValidityController. */
const hosts = new WeakSet<Element>();

/** A Ty field that shows its message in its own error line (no bubble). */
function hasErrorLine(el: Element): boolean {
  return hosts.has(el) && 'error' in el;
}

export class ValidityController {
  private own: Own = { flags: {} };
  private custom = '';
  /** The message this controller last wrote into `error`. */
  private written: string | null = null;
  /** The anchor last handed to setValidity(). */
  private anchor?: HTMLElement;
  /**
   * Anchors a validation bubble was shown on, the last two. WebKit keeps a
   * pointer to that anchor without keeping it alive: once a re-render drops
   * it (ty-calendar rebuilds its grid) and it is garbage-collected, the next
   * submit crashes the page. Held until two later bubbles replaced it.
   */
  private shown: HTMLElement[] = [];

  /** The form whose requestSubmit / reportValidity this field keeps wrapped. */
  private form: HTMLFormElement | null = null;

  constructor(private host: HTMLElement, private internals: ElementInternals) {
    watchDocument();
    hosts.add(host);
    host.addEventListener('invalid', () => {
      if (this.anchor && !this.shown.includes(this.anchor)) this.shown = [...this.shown.slice(-1), this.anchor];
    });
    // Any validation of this field (submit, reportValidity, checkValidity):
    // the message goes into its own error line instead of the browser bubble.
    // On a submit or form.reportValidity() the first failing field also takes
    // focus (the browser only focuses fields whose bubble it shows).
    host.addEventListener('invalid', (e) => {
      if (!hasErrorLine(host)) return;
      watchRoot(host.getRootNode());
      e.preventDefault();
      this.showError();
      if (!submitAttempt) return;
      const form = this.internals.form;
      if (!form || firstInvalid(form) === host) host.focus();
    });
  }

  /**
   * The host connected, disconnected or changed form: keep its form's
   * requestSubmit / reportValidity wrapped while it (or another Ty field with
   * an error line) is in it. Only such a field needs it: a native control or
   * a bubble field is focused by the browser itself.
   */
  track(): void {
    const form = hasErrorLine(this.host) ? this.internals.form : null;
    if (form === this.form) return;
    const old = this.form && wrappedForms.get(this.form);
    if (old) {
      old.fields.delete(this);
      // A field that left without telling (none of ours should) counts no more.
      for (const c of old.fields) if (c.internals.form !== this.form) old.fields.delete(c);
      if (old.fields.size === 0) unwrapForm(this.form!, old);
    }
    this.form = form;
    if (form) wrapForm(form).fields.add(this);
  }

  /**
   * Show the current message, if any, in the error display (on blur after an
   * edit). During a pointer interaction it waits until after the click.
   */
  reveal(): void {
    if (pointerPressed) {
      pendingReveals.add(this);
      return;
    }
    if ('error' in this.host && !this.internals.validity.valid) this.showError();
  }

  /**
   * `error` still holds what this controller wrote (a reportValidity(), a
   * submit, a blur reveal), so it's ours to update and clear. Once the author
   * sets their own message, it's theirs.
   */
  private get errorFromReport(): boolean {
    return this.written !== null && this.host.getAttribute('error') === this.written;
  }

  private writeError(message: string | null): void {
    // Recorded first: the write re-renders the field, which re-validates.
    this.written = message;
    if (message === null) this.host.removeAttribute('error');
    else this.host.setAttribute('error', message);
  }

  /** Into `error`, unless the author's own message is there. */
  private showError(): void {
    if (this.host.getAttribute('error') && !this.errorFromReport) return;
    this.writeError(this.internals.validationMessage);
  }

  /**
   * form.reset(): drop the message this controller showed and any blur
   * reveal still waiting, so the field looks untouched again. An `error` the
   * author set stays.
   */
  reset(): void {
    pendingReveals.delete(this);
    if (this.errorFromReport) this.writeError(null);
    this.written = null;
  }

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
      this.showError();
      this.host.focus();
    } else {
      this.internals.reportValidity(); // no error display: browser bubble
    }
    return false;
  }

  private sync(): void {
    const { flags, message } = this.own;
    // A re-render may have replaced the anchor since set(); setValidity()
    // throws for one that's no longer inside the host.
    const anchor = this.own.anchor && within(this.host, this.own.anchor) ? this.own.anchor : undefined;
    this.anchor = anchor;
    const invalid = Object.values(flags).some(Boolean);
    if (this.custom) {
      this.internals.setValidity({ ...flags, customError: true }, this.custom, anchor);
    } else if (invalid) {
      this.internals.setValidity(flags, message || 'Invalid value', anchor);
    } else {
      this.internals.setValidity({});
    }

    if (!this.errorFromReport) {
      this.written = null;
      return;
    }
    if (this.internals.validity.valid) {
      this.writeError(null);
    } else if (this.host.getAttribute('error') !== this.internals.validationMessage) {
      this.showError();
    }
  }
}

type ProbeTag = 'input' | 'textarea' | 'select';
const probes: Partial<Record<ProbeTag, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>> = {};

/**
 * The browser's own (localized) message for a rule: a detached native control
 * gets the same attributes and value and reports what it would say. `true`
 * sets a boolean attribute; '', false and null leave the attribute off. One
 * probe per tag, never in the document, stripped of every attribute before
 * each use. Works for required and min/max; length rules only report after a
 * user edit, so a probe can't word them (see lengthValidity()).
 */
export function nativeMessage(
  tag: ProbeTag,
  attrs: Record<string, string | boolean | null | undefined>,
  value = '',
): string {
  const probe = (probes[tag] ??= document.createElement(tag));
  for (const name of probe.getAttributeNames()) probe.removeAttribute(name);
  for (const [name, v] of Object.entries(attrs)) {
    if (v === true) probe.setAttribute(name, '');
    else if (v) probe.setAttribute(name, v);
  }
  probe.value = value;
  return probe.validationMessage;
}

/**
 * nativeMessage() plus the probe's own flags, for rules whose attribute the
 * browser parses (min/max: ' 5 ' or '0x10' is no rule at all), so the flag
 * and its message can't disagree. Read `validity` right away: the probe is
 * reused by the next call.
 */
export function nativeValidity(
  tag: ProbeTag,
  attrs: Record<string, string | boolean | null | undefined>,
  value = '',
): { validity: ValidityState; message: string } {
  const message = nativeMessage(tag, attrs, value);
  return { validity: probes[tag]!.validity, message };
}

/** Non-negative integer limit from an attribute string, or null when unset/invalid. */
export function toLimit(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** Replace {name} placeholders; unknown or null ones are left as-is. */
function fillMessage(template: string, vars: Record<string, number | null>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] != null ? String(vars[key]) : match);
}

/**
 * minlength / maxlength for a text field (ty-input, ty-textarea): the failing
 * flags with their messages. `control` is the inner native control carrying
 * `minlength`; it only flags (and words, localized) a value the user typed,
 * so its message is used then. Otherwise Ty's wording, and the author's
 * too-short / too-long message always wins. Placeholders: {minlength}
 * {maxlength} {length}.
 */
export function lengthValidity(
  value: string,
  rules: { minlength: unknown; maxlength: unknown; tooShortMessage: string; tooLongMessage: string },
  control?: HTMLInputElement | HTMLTextAreaElement | null,
): { tooShort?: string; tooLong?: string } {
  const length = value.length;
  const minLength = toLimit(rules.minlength);
  const maxLength = toLimit(rules.maxlength);
  const vars = { minlength: minLength, maxlength: maxLength, length };
  const result: { tooShort?: string; tooLong?: string } = {};
  if (minLength !== null && length < minLength) {
    result.tooShort = !rules.tooShortMessage && control?.validity.tooShort
      ? control.validationMessage
      : fillMessage(rules.tooShortMessage || 'Use at least {minlength} characters (now {length})', vars);
  }
  if (maxLength !== null && length > maxLength) {
    result.tooLong = fillMessage(rules.tooLongMessage || 'Use at most {maxlength} characters (now {length})', vars);
  }
  return result;
}
