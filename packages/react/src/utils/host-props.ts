/**
 * Normalize pass-through props for a custom-element host.
 *
 * React 18 does not special-case `className` on custom elements — it
 * lowercases the prop into a literal `classname=""` attribute, which no CSS
 * ever matches. Renaming it to `class` makes React pass it through verbatim,
 * so host-level utility classes (layout, positioning) actually apply.
 * React 19 handles `className` natively; this stays harmless there.
 */
export function hostProps<T extends Record<string, any>>(props: T): Record<string, any> {
  const { className, ...rest } = props;
  if (className != null) (rest as Record<string, any>).class = className;
  return rest;
}
