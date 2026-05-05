(ns tyrell.components
  "Side-effect import of the tyrell-components npm package.

   Requiring this namespace registers all Tyrell web custom elements
   (ty-button, ty-input, ty-icon, ty-dropdown, ...) with the browser's
   CustomElementRegistry, so they can be used as HTML tags in any
   ClojureScript framework (Replicant, Reagent, Helix, UIx, ...).

   Use once in your app's entry namespace:

     (ns my.app
       (:require [tyrell.components]
                 [tyrell.router :as router]
                 [tyrell.lucide :as lucide]))

   The npm package itself is declared as a dependency in this artifact's
   deps.cljs, so shadow-cljs auto-installs it. No manual `npm install`
   of tyrell-components is required for CLJS consumers."
  (:require ["tyrell-components"]))
