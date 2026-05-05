(ns tyrell.icons
  "ClojureScript utilities for registering icons with the ty icon system.

   Usage:
   (ns my-app.icons
     (:require [tyrell.icons :as icons]
               [tyrell.lucide :as lucide]))

   ;; Register icons by name
   (icons/register!
     {:check lucide/check
      :heart lucide/heart
      :star lucide/star})

   ;; Or use string keys if you prefer
   (icons/register!
     {\"check\" lucide/check
      \"heart\" lucide/heart})")

(defn register!
  "Register icons with the ty icon system.

   Accepts a map of icon-name -> svg-string.
   Keys can be keywords or strings.

   Example:
   (register! {:check lucide/check
               :heart lucide/heart
               \"custom-icon\" my-svg-string})

   Returns true if registration succeeded, false otherwise."
  [icons-map]
  (if-let [register-fn (some-> js/window.tyIcons .-register)]
    (do
      (register-fn
        (clj->js
          (reduce-kv
            (fn [acc k v]
              (assoc acc (name k) v))
            {}
            icons-map)))
      true)
    (do
      (.warn js/console "[tyrell.icons] window.tyIcons not available. Ensure tyrell.js is loaded.")
      false)))

(defn register-async!
  "Register icons, retrying if tyrell.js hasn't loaded yet.

   Useful when icons.cljs loads before tyrell.js.
   Will retry up to max-retries times (default 10) with delay-ms between attempts (default 50ms).

   Example:
   (register-async! {:check lucide/check})"
  ([icons-map] (register-async! icons-map {}))
  ([icons-map {:keys [max-retries delay-ms on-success on-failure]
               :or {max-retries 10 delay-ms 50}}]
   (letfn [(try-register [attempts]
             (if (register! icons-map)
               (when on-success (on-success))
               (if (< attempts max-retries)
                 (js/setTimeout #(try-register (inc attempts)) delay-ms)
                 (do
                   (.error js/console "[tyrell.icons] Failed to register icons after" max-retries "attempts")
                   (when on-failure (on-failure))))))]
     (try-register 0))))

(defn registered?
  "Check if an icon is already registered.

   Example:
   (when-not (registered? :check)
     (register! {:check lucide/check}))"
  [icon-name]
  (some-> js/window.tyIcons
          .-icons
          (aget (name icon-name))
          some?))
