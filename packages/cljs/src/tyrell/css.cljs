(ns tyrell.css
  (:require [clojure.string :as str]))

;; =============================================================================
;; Style Application Utilities
;; =============================================================================

(defn ensure-styles!
  "Applies styles to a shadow root. Handles duplicates and hot reload.

   Arguments:
   - shadow-root: The shadow DOM root element
   - styles: CSSStyleSheet object (from defstyles) or CSS string
   - style-id: Unique identifier (optional, auto-generated if not provided)

   For CSSStyleSheet:
   - Uses adoptedStyleSheets (efficient, shared across shadow roots)
   - Adds if not already present

   For string styles:
   - Creates/updates <style> element
   - Updates content if changed (hot reload support)"
  ([shadow-root styles]
   (ensure-styles! shadow-root styles (str "ty-styles-" (hash styles))))
  ([shadow-root styles style-id]
   (cond
     ;; CSSStyleSheet: use adoptedStyleSheets (efficient)
     (instance? js/CSSStyleSheet styles)
     (let [adopted (.-adoptedStyleSheets shadow-root)]
       (when-not (some #(identical? % styles) adopted)
         (set! (.-adoptedStyleSheets shadow-root)
               (.concat adopted #js [styles]))))

     ;; String: create/update <style> element
     (string? styles)
     (let [existing (.querySelector shadow-root (str "style#" style-id))]
       (if existing
         ;; Update if content changed (hot reload)
         (when (not= (.-textContent existing) styles)
           (set! (.-textContent existing) styles))
         ;; Create new
         (let [style-el (js/document.createElement "style")]
           (set! (.-id style-el) style-id)
           (set! (.-textContent style-el) styles)
           (.appendChild shadow-root style-el))))

     :else
     (js/console.error "ensure-styles!: styles must be CSSStyleSheet or string" styles))))

(defn ensure-document-styles!
  "Injects styles into document head. Handles duplicates and hot reload.

   Arguments:
   - styles: CSSStyleSheet object (from defstyles) or CSS string
   - style-id: Unique identifier for the style element

   Behavior:
   - If style-id doesn't exist: creates new <style> element
   - If style-id exists with same content: does nothing
   - If style-id exists with different content: updates (hot reload)

   Example:
     (ensure-document-styles! my-styles \"my-app-globals\")
     (ensure-document-styles! \".foo { color: red; }\" \"inline-styles\")"
  [styles style-id]
  (let [head (.-head js/document)
        css-content (cond
                      ;; CSSStyleSheet - extract CSS text from rules
                      (instance? js/CSSStyleSheet styles)
                      (->> (.-cssRules styles)
                           (array-seq)
                           (map #(.-cssText %))
                           (str/join "\n"))

                      ;; String - use directly
                      (string? styles)
                      styles

                      :else
                      (do (js/console.error "ensure-document-styles!: styles must be CSSStyleSheet or string" styles)
                          nil))
        existing (.querySelector head (str "style#" style-id))]
    (when css-content
      (if existing
        ;; Update if content changed (hot reload support)
        (when (not= (.-textContent existing) css-content)
          (set! (.-textContent existing) css-content))
        ;; Create new style element
        (let [style-el (js/document.createElement "style")]
          (set! (.-id style-el) style-id)
          (set! (.-textContent style-el) css-content)
          (.appendChild head style-el))))))

