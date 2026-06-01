import { useEffect, RefObject } from 'react';
import { needsPropertyBridge } from './react-version';

/**
 * Coerce a value to a boolean using the same rules as the core property
 * manager (packages/core/src/utils/property-manager.ts:142-152). This matters
 * because consumers sometimes pass the string "false" through untyped call
 * sites (JSON config, query params, server-rendered props) — and the JS
 * `Boolean("false")` is surprisingly `true`.
 *
 *   undefined | null | false | "false" | "0"  → false
 *   ""                                        → true  (HTML boolean-attribute convention)
 *   any other truthy                          → true
 */
export function coerceBool(value: unknown): boolean {
  if (value === undefined || value === null || value === false) return false;
  if (typeof value === 'string') {
    if (value === '') return true;
    const norm = value.toLowerCase().trim();
    if (norm === 'false' || norm === '0') return false;
    return true;
  }
  return Boolean(value);
}

/**
 * Imperatively keep a boolean property on the underlying custom element in
 * sync with its React prop.
 *
 * Why this exists: React 18 sets boolean attributes as empty strings on the
 * first render to a custom element but does not reliably *remove* them when
 * the prop flips back to `false`. Without this bridge, `<TyModal open>` →
 * `<TyModal open={false}>` leaves the `open` attribute on the element and
 * the modal stays open. Same class of bug affects `disabled`, `required`,
 * `clearable`, `loading`, `readonly`, `protected`, etc.
 *
 * React 19+ bridges this natively — the effect short-circuits via
 * `needsPropertyBridge`, so this is dead code on modern React.
 *
 * Pass the *camelCase JS property name* on the element (e.g. `externalSearch`
 * for the `external-search` attribute). The core base class handles the
 * attribute-side sync once the property changes.
 *
 * Returns the coerced boolean so the caller can also drive its conditional
 * JSX attribute emission with a value that correctly handles "false".
 */
export function useBooleanProperty(
  ref: RefObject<HTMLElement | null>,
  propName: string,
  value: unknown
): boolean {
  const coerced = coerceBool(value);
  useEffect(() => {
    if (!needsPropertyBridge) return;
    const el = ref.current as any;
    if (!el) return;
    if (Boolean(el[propName]) !== coerced) {
      el[propName] = coerced;
    }
  }, [coerced, propName, ref]);
  return coerced;
}
