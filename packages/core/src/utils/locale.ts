/**
 * Locale Resolution Utilities
 *
 * Cascade for resolving locale/language preferences, so developers can set it
 * per-component, per-section, per-page, or fall back to the browser default.
 */

/**
 * Get the effective locale for an element using the resolution cascade.
 * 
 * Resolution order:
 * 1. Explicit locale attribute on the element
 * 2. Closest ancestor element with a `lang` attribute
 * 3. Document root element's `lang` attribute
 * 4. Browser's navigator.language
 * 5. Fallback to 'en-US'
 * 
 * @param element - The element to get locale for
 * @param explicitLocale - Optional explicit locale value (from component's locale attribute)
 * @returns The resolved locale string (e.g., 'en-US', 'fr-FR')
 * 
 * @example
 * ```html
 * <html lang="en-US">
 *   <div lang="fr-FR">
 *     <ty-input></ty-input>              <!-- Uses 'fr-FR' -->
 *     <ty-input locale="de-DE"></ty-input>  <!-- Uses 'de-DE' -->
 *   </div>
 *   <ty-input></ty-input>                <!-- Uses 'en-US' -->
 * </html>
 * ```
 */
export function getEffectiveLocale(
  element: HTMLElement,
  explicitLocale?: string | null
): string {
  // 1. Explicit locale attribute takes highest priority
  if (explicitLocale) {
    return explicitLocale;
  }

  // 2. Check closest ancestor with lang attribute
  // This allows per-section locale overrides
  const langElement = element.closest('[lang]');
  if (langElement) {
    const lang = langElement.getAttribute('lang');
    if (lang) return lang;
  }

  // 3. Check document root (html element)
  if (document.documentElement.lang) {
    return document.documentElement.lang;
  }

  // 4. Use browser's language preference
  if (navigator.language) {
    return navigator.language;
  }

  // 5. Ultimate fallback
  return 'en-US';
}

/**
 * Create a MutationObserver to watch for lang attribute changes.
 * Useful for components that need to react to dynamic locale changes.
 * 
 * @param element - The element to observe
 * @param callback - Function to call when lang changes
 * @returns Cleanup function to disconnect the observer
 * 
 * @example
 * ```typescript
 * class TyInput extends HTMLElement {
 *   private _localeObserver?: () => void;
 * 
 *   connectedCallback() {
 *     this._localeObserver = observeLocaleChanges(this, () => {
 *       this.render(); // Re-render when locale changes
 *     });
 *   }
 * 
 *   disconnectedCallback() {
 *     this._localeObserver?.();
 *   }
 * }
 * ```
 */
export function observeLocaleChanges(
  element: HTMLElement,
  callback: (newLocale: string) => void
): () => void {
  let currentLocale = getEffectiveLocale(element);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
        const newLocale = getEffectiveLocale(element);
        if (newLocale !== currentLocale) {
          currentLocale = newLocale;
          callback(newLocale);
        }
      }
    }
  });

  // subtree: true so any ancestor's lang change is seen
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
    subtree: true
  });

  return () => observer.disconnect();
}
