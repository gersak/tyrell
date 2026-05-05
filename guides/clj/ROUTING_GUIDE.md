# Ty Router — ClojureScript Routing Guide

The `tyrell.router` namespace provides client-side routing for any ClojureScript framework (Replicant, UIx, Reagent, etc.). It uses a zipper-based tree structure with browser history integration.

## Setup

```clojure
(ns my-app.core
  (:require [tyrell.router :as router]))
```

## Defining Routes

Routes are linked to parent nodes in a tree. The root is `::router/root`.

```clojure
;; Top-level routes
(router/link ::router/root
  [{:id ::home
    :segment "home"
    :landing 10}      ; highest :landing = default route
   {:id ::about
    :segment "about"}
   {:id ::settings
    :segment "settings"}])

;; Nested routes — link to parent
(router/link ::settings
  [{:id ::settings-general
    :segment "general"}
   {:id ::settings-account
    :segment "account"}])
```

**Route map keys:**

| Key | Description |
|-----|-------------|
| `:id` | Unique keyword identifying the route |
| `:segment` | URL path segment |
| `:landing` | Priority number — highest wins as default redirect |
| `:hash` | Hash fragment appended to URL |
| `:roles` | Set of roles required to access (optional) |
| `:permissions` | Set of permissions required to access (optional) |

## Initialization

```clojure
;; Initialize with optional base path
(router/init! "")            ; root-level app
(router/init! "/my-app")     ; app served under /my-app/
```

`init!` does:
1. Sets the base path
2. Reads the current browser URL
3. Handles landing redirect if needed (404 or unauthorized → best landing route)
4. Listens for `popstate` and `hashchange` events

## Navigation

```clojure
;; Navigate by route id
(router/navigate! ::home)
(router/navigate! ::about)

;; Navigate with query parameters
(router/navigate! ::user {:id 123})
;; → /user?id=123
```

## Checking Active Route

```clojure
;; Is route anywhere in the current path?
(router/rendered? ::settings)        ; true if /settings, /settings/general, etc.

;; Exact match only
(router/rendered? ::settings true)   ; true only if exactly /settings
```

## The Key Pattern: Self-Contained Views

Each view checks its own visibility. No `cond` or `case` in the parent — just list all views and each one decides whether to render.

```clojure
;; Each view owns its visibility
(defn home-view []
  (when (router/rendered? ::home)
    [:div.ty-elevated.p-6
     [:h2 "Welcome Home"]]))

(defn about-view []
  (when (router/rendered? ::about)
    [:div.ty-elevated.p-6
     [:h2 "About Us"]]))

;; App just lists all views — no cond needed
(defn app []
  [:div.ty-canvas
   (nav)
   (home-view)
   (about-view)])
```

This works the same in Replicant, UIx, Reagent, or any hiccup-based framework.

## Navigation UI

```clojure
(defn nav-button [route-id label icon-name]
  (let [active? (router/rendered? route-id)]
    [:button.px-4.py-2.rounded.flex.items-center.gap-2.transition-colors
     {:class (if active?
               ["ty-bg-primary" "ty-text++"]
               ["ty-bg-neutral-" "ty-text" "hover:ty-bg-neutral"])
      :on {:click #(router/navigate! route-id)}}
     [:ty-icon {:name icon-name :size "sm"}]
     label]))

(defn nav []
  [:nav.ty-elevated.p-4.rounded-lg.mb-6
   [:div.flex.gap-2
    (nav-button ::home "Home" "home")
    (nav-button ::about "About" "info")
    (nav-button ::settings "Settings" "settings")]])
```

## Query Parameters

```clojure
;; Get current query params
(router/query-params)
;; => {:id 123, :tab "settings"}

;; Set query params (replaces history entry by default)
(router/set-query! {:page 2 :sort "name"})

;; Push new history entry
(router/set-query! {:page 3} :push)

;; Clear query params
(router/set-query! nil)
```

## Authorization

Routes can restrict access by requiring `:roles` or `:permissions` (both are sets of keywords):

```clojure
(router/link ::router/root
  [{:id ::home
    :segment "home"
    :landing 10}
   {:id ::admin
    :segment "admin"
    :roles #{:admin}}
   {:id ::dashboard
    :segment "dashboard"
    :permissions #{:view-dashboard}}
   {:id ::reports
    :segment "reports"
    :roles #{:admin :analyst}
    :permissions #{:view-reports}}])
```

### Setting Current User Context

The router exposes three dynamic vars for access control:

```clojure
;; *roles* and *permissions* are plain values (not atoms) — set! them directly
(set! router/*roles* #{:admin :user})
(set! router/*permissions* #{:view-dashboard :view-reports})

;; *user* is an atom — use reset! or swap!
(reset! router/*user* {:id 1 :name "Alice"})
```

Typically you set these after login and clear them on logout:

```clojure
(defn on-login [user]
  (reset! router/*user* user)
  (set! router/*roles* (:roles user))
  (set! router/*permissions* (:permissions user))
  (router/navigate! ::home))

(defn on-logout []
  (reset! router/*user* nil)
  (set! router/*roles* nil)
  (set! router/*permissions* nil)
  (router/navigate! ::home))
```

### How Authorization Works

`authorized?` checks whether the current user can access a route:

```clojure
(router/authorized? ::admin)  ; => true/false
```

The logic:
1. If the route has **no roles and no permissions** — access is allowed (public route)
2. If the route has `:roles` — allowed if **any** of the user's `*roles*` intersect with the route's roles
3. If the route has `:permissions` — allowed if **any** of the user's `*permissions*` intersect with the route's permissions
4. Roles and permissions are OR'd — matching either one grants access

```clojure
;; Route: {:roles #{:admin :analyst} :permissions #{:view-reports}}
;; User has *roles* = #{:analyst} → authorized (role match)
;; User has *permissions* = #{:view-reports} → authorized (permission match)
;; User has *roles* = #{:user} and *permissions* = #{} → NOT authorized
```

### Automatic Redirect on Unauthorized Access

When the router initializes or the URL changes, `handle-landing!` runs automatically. It checks:
1. If the current URL matches **no known routes** (404) — redirect to the best landing route
2. If **any route** in the current path is unauthorized — redirect to the best landing route

The "best landing route" is the route with the highest `:landing` value that the user is authorized to access. This means different users can land on different default pages based on their roles.

```clojure
;; Admin lands on ::admin-dashboard, regular user lands on ::home
(router/link ::router/root
  [{:id ::home
    :segment "home"
    :landing 10}
   {:id ::admin-dashboard
    :segment "admin"
    :roles #{:admin}
    :landing 20}])  ; higher priority, but only for admins
```

### Using rendered? with Authorization

Views should combine `rendered?` with `authorized?` for defense in depth:

```clojure
(defn admin-panel []
  (when (and (router/rendered? ::admin)
             (router/authorized? ::admin))
    [:div.ty-elevated.p-6
     [:h2 "Admin Panel"]
     ;; admin content
     ]))

## Watching Router Changes

The router state lives in `router/*router*` (an atom). Watch it to trigger re-renders in your framework:

```clojure
;; Replicant
(add-watch router/*router* ::render
  (fn [_ _ _ _] (render!)))

;; Reagent — use ratom or re-frame subscription instead
;; UIx — use a hook that derefs the atom
```

## Router State

`@router/*router*` contains:

| Key | Description |
|-----|-------------|
| `:tree` | Route tree (zipper root node) |
| `:current` | Current URL path (without base) |
| `:base` | Base path prefix |
| `:known` | Set of registered route ids |
| `:unknown` | Queue of routes whose parent isn't registered yet |
| `:query` | Current query parameters |

## Utility Functions

```clojure
;; Get URL path for a route
(router/component-path (:tree @router/*router*) ::settings-general)
;; => "/settings/general"

;; Get all components rendered for current URL
(router/url->components)

;; Debug: see landing candidates
(router/landing-candidates)
```

## Complete Example

```clojure
(ns my-app.core
  (:require [replicant.dom :as dom]
            [tyrell.router :as router]
            [tyrell.icons :as icons]
            [tyrell.lucide :as lucide]))

(defonce state (atom {:counter 0}))

;; Routes
(router/link ::router/root
  [{:id ::home :segment "home" :landing 10}
   {:id ::about :segment "about"}])

;; Views
(defn home-view []
  (when (router/rendered? ::home)
    [:div.ty-elevated.p-6.rounded-lg
     [:h2.ty-text++.text-2xl.mb-4 "Home"]
     [:p.ty-text "Counter: " (:counter @state)]
     [:ty-button {:flavor "primary"
                  :on {:click #(swap! state update :counter inc)}}
      "Increment"]]))

(defn about-view []
  (when (router/rendered? ::about)
    [:div.ty-elevated.p-6.rounded-lg
     [:h2.ty-text++.text-2xl.mb-4 "About"]
     [:p.ty-text "This is the about page."]]))

(defn app []
  [:div.ty-canvas.min-h-screen.p-6
   (nav)
   (home-view)
   (about-view)])

;; Init
(defn render! []
  (dom/render (.getElementById js/document "app") (app)))

(defn init []
  (icons/register! {:home lucide/home :info lucide/info})
  (router/init! "")
  (add-watch router/*router* ::render (fn [_ _ _ _] (render!)))
  (add-watch state ::render (fn [_ _ _ _] (render!)))
  (render!))
```

Replace `replicant.dom` with your framework's render call — the router API is identical.
