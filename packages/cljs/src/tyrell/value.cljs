(ns tyrell.value
  "Simplified value handling using multimethods.
   Each component registers its parse/normalize functions once.
   
   The Pattern:
   1. Parse any input format to internal value
   2. Compare parsed values to detect changes  
   3. Sync to property, attribute, and state
   4. Normalize for consistent attribute display"
  (:refer-clojure :exclude [parse-boolean]))

;; =====================================================
;; Multimethod Registry
;; =====================================================

(defmulti parse-value
  "Parse raw input to internal format based on element tag name.
   Components register their parsers via defmethod."
  (fn [el value] (.-tagName el)))

(defmulti normalize-value
  "Normalize internal value to string for attribute display.
   Components register their normalizers via defmethod."
  (fn [el value] (.-tagName el)))

;; Default implementations
(defmethod parse-value :default [el value]
  ;; Default: just return string value or nil
  (when (and value (not= value ""))
    (str value)))

(defmethod normalize-value :default [el value]
  ;; Default: convert to string
  (when value (str value)))

;; =====================================================
;; Core Functions
;; =====================================================

(defn get-value
  "Get current value from element, checking property first, then attribute.
   Returns the raw value (property takes precedence for programmatic access)."
  [^js el]
  (or (.-value el)
      (when (.hasAttribute el "value")
        (.getAttribute el "value"))))

(defn get-attribute
  "Get current attribute value (the string in HTML)."
  [^js el attr-name]
  (or
   (aget el attr-name)
   (when (.hasAttribute el attr-name)
     (.getAttribute el attr-name))))

(defn external-value-changed?
  "Check if value changed externally by comparing PARSED values.
   This avoids issues with different string formats that represent
   the same internal value."
  [^js el new-raw-value]
  (let [current-value (.-value el) ; Get the current parsed value from property
        new-parsed (parse-value el new-raw-value)]
    (not= current-value new-parsed)))

(defn sync-value!
  "Parse input once and sync to all three places:
   - Property (parsed value for programmatic access)
   - Attribute (normalized string for HTML visibility)
   - State (internal component state if applicable)
   
   Returns the parsed value."
  [^js el raw-value]
  (let [parsed (parse-value el raw-value)
        normalized (when parsed (normalize-value el parsed))]

    ;; 1. Property stores parsed internal value
    (set! (.-value el) parsed)

    ;; 2. Attribute shows normalized string
    (if normalized
      (.setAttribute el "value" normalized)
      (.removeAttribute el "value"))

    ;; 3. Update component state if it has state management
    (when-let [update-fn (.-tyUpdateState el)]
      (update-fn {:value parsed}))

    parsed))

;; =====================================================
;; Component Integration Helpers
;; =====================================================

(defn setup-component!
  "Initialize a component with its state update function.
   Always syncs initial value to ensure attribute visibility.
   Call this in component's connected callback."
  [^js el update-state-fn]
  (set! (.-tyUpdateState el) update-state-fn)
  ;; Always sync initial value (from property or attribute) to ensure attribute is visible
  (let [initial (get-value el)]
    (when initial
      (sync-value! el initial))))

(defn handle-attr-change
  "Standard handler for value attribute changes.
   Use this in component's :attr callback."
  [^js el attr-name _old-value new-value render-fn]
  (when (= attr-name "value")
    (when (external-value-changed? el new-value)
      (sync-value! el new-value)
      (when render-fn
        (render-fn el)))))

;; =====================================================
;; Common Parsers (for reuse via delegate)
;; =====================================================
;; 
;; Boolean Parsing Standard (matches TypeScript PropertyManager):
;; | Input          | Result  | Reason                              |
;; |----------------|---------|-------------------------------------|
;; | nil            | false   | Attribute absent                    |
;; | ""             | true    | HTML boolean (<input checked>)      |
;; | "true"/"TRUE"  | true    | Explicit true                       |
;; | "false"/"FALSE"| false   | Explicit false                      |
;; | "0"            | false   | Numeric false                       |
;; | "1"            | true    | Numeric true                        |
;; | "anything"     | true    | Truthy by default                   |
;; | true           | true    | Already boolean                     |
;; | false          | false   | Already boolean                     |
;; | 0              | false   | Numeric zero                        |
;; | 42             | true    | Non-zero number                     |
;;
;; This ensures consistency between TypeScript and ClojureScript implementations.
;;

(defn parse-string
  "Parse string values, nil for empty."
  [value]
  (when (and value (not= value ""))
    (str value)))

(defn parse-number
  "Parse numeric values."
  [value]
  (cond
    (nil? value) nil
    (number? value) value
    (string? value) (when (not= value "")
                      (let [parsed (js/parseFloat value)]
                        (when-not (js/isNaN parsed) parsed)))
    :else nil))

(defn parse-boolean
  "Parse boolean values following HTML standard.
   
   HTML Standard Behavior:
   - null/absent attribute → false
   - empty string \"\" → true (attribute present but empty: <input checked>)
   - \"false\" or \"0\" → false (explicit false values)
   - everything else → true
   
   Examples:
   (parse-boolean nil)       => false  (attribute absent)
   (parse-boolean \"\")        => true   (HTML boolean: <input checked>)
   (parse-boolean \"true\")    => true
   (parse-boolean \"false\")   => false
   (parse-boolean \"TRUE\")    => true
   (parse-boolean \"0\")       => false
   (parse-boolean \"1\")       => true
   (parse-boolean \"anything\") => true
   (parse-boolean true)      => true
   (parse-boolean false)     => false"
  [value]
  (cond
    ;; Absent attribute
    (nil? value) false

    ;; Already a boolean
    (boolean? value) value

    ;; String handling
    (string? value)
    (cond
      ;; Empty string = true (HTML boolean attribute standard)
      (= value "") true

      ;; Explicit false values
      (contains? #{"false" "FALSE" "0" "no" "NO"} value) false

      ;; Everything else is truthy
      :else true)

    ;; Numbers: 0 = false, everything else = true
    (number? value) (not (zero? value))

    ;; Default: truthy
    :else (boolean value)))

(defn parse-integer
  "Safely parse integer from string or number, returns nil for invalid input.
   
   Examples:
   (parse-integer \"42\")     => 42
   (parse-integer \"abc\")    => nil
   (parse-integer nil)       => nil
   (parse-integer 42)        => 42"
  [value]
  (cond
    (nil? value) nil
    (number? value) (if (js/isNaN value) nil (js/Math.round value))
    (string? value)
    (let [trimmed (.trim value)]
      (if (= trimmed "")
        nil
        (let [parsed (js/parseInt trimmed 10)]
          (if (js/isNaN parsed) nil parsed))))
    :else nil))

(defn parse-float-safe
  "Safely parse float from string or number, returns nil for invalid input.
   
   Examples:
   (parse-float-safe \"42.5\")   => 42.5
   (parse-float-safe \"abc\")    => nil
   (parse-float-safe nil)       => nil
   (parse-float-safe 42.5)      => 42.5"
  [value]
  (cond
    (nil? value) nil
    (number? value) (if (js/isNaN value) nil value)
    (string? value)
    (let [trimmed (.trim value)]
      (if (= trimmed "")
        nil
        (let [parsed (js/parseFloat trimmed)]
          (if (js/isNaN parsed) nil parsed))))
    :else nil))

(defn parse-array
  "Parse comma-separated or array values."
  [value]
  (cond
    (nil? value) []
    (sequential? value) (vec value)
    (string? value) (if (= value "")
                      []
                      (vec (.split value ",")))
    :else []))

(defn normalize-array
  "Format array as comma-separated string."
  [parsed-array]
  (when (seq parsed-array)
    (.join parsed-array ",")))

(defn parse-attr-int
  "Safely parse integer attribute with default fallback.
   
   Examples:
   (parse-attr-int el \"width\" 100)     => 100 if width=\"abc\" or missing
   (parse-attr-int el \"width\" 100)     => 42 if width=\"42\"
   
   This is perfect for component attributes that need safe defaults."
  [^js el attr-name default-value]
  (if-let [attr-value (.getAttribute el (name attr-name))]
    (or (parse-integer attr-value) default-value)
    default-value))

(defn parse-attr-float
  "Safely parse float attribute with default fallback.
   
   Examples:
   (parse-attr-float el \"opacity\" 1.0)  => 1.0 if opacity=\"abc\" or missing
   (parse-attr-float el \"opacity\" 1.0)  => 0.5 if opacity=\"0.5\""
  [^js el attr-name default-value]
  (if-let [attr-value (.getAttribute el (name attr-name))]
    (or (parse-float-safe attr-value) default-value)
    default-value))

;; =====================================================
;; Property Setter Helper
;; =====================================================

(defn define-value-property!
  "Define a custom value property setter that triggers sync.
   This ensures programmatic updates also maintain transparency.
   
   Call this in component initialization."
  [^js el]
  (let [descriptor #js {:get (fn [] (.-__tyValue el))
                        :set (fn [v]
                               (when (not= v (.-__tyValue el))
                                 (sync-value! el v)
                                ;; Trigger render if component has render fn
                                 (when-let [render-fn (.-tyRender el)]
                                   (render-fn el))))
                        :enumerable true
                        :configurable true}]
    (js/Object.defineProperty el "value" descriptor)))
