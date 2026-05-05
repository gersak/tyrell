# Reagent + Ty Navigation Demo

Complete navigation system with routing, responsive design, and theme switching.

## Features

- **Responsive Navigation**: Desktop sidebar + mobile overlay menu
- **Hash-based Routing**: Simple client-side routing with browser history
- **Theme Toggle**: Light/dark mode with localStorage persistence  
- **Multiple Views**: Home, Forms, Buttons, Components pages
- **State Management**: Centralized Reagent atom for app state

## Architecture

```
src/hello/
├── core.cljs        # Main app, component registration, routing
├── state.cljs       # App state management, routing, theme logic
├── navigation.cljs  # Header, sidebar, mobile menu components  
└── views.cljs       # Page components for different routes
```

## Navigation System

**Routes defined in state.cljs:**
```clojure
(def routes
  {:home {:name "Home" :icon "home"}
   :forms {:name "Forms" :icon "edit"}
   :buttons {:name "Buttons" :icon "click"}
   :components {:name "Components" :icon "grid"}})
```

**Navigation components:**
- `sidebar` - Desktop navigation (hidden on mobile)
- `mobile-menu` - Overlay menu with backdrop
- `header` - Top bar with route title and theme toggle
- `nav-item` - Reusable navigation items with active states

## Styling Pattern

**Follows Ty CSS Guide - TY for colors, Tailwind for everything else:**

```clojure
[:div.ty-elevated.p-6.rounded-lg.mb-8    ; Ty surface + Tailwind spacing
 [:h1.ty-text++.text-3xl.font-bold      ; Ty color + Tailwind typography
  "Title"]]
```

## Key Features

- **Responsive breakpoints**: Desktop sidebar hidden below lg (1024px)
- **Mobile-first**: Touch-friendly mobile menu with backdrop
- **Active states**: Navigation items show current route
- **Theme persistence**: Dark/light mode saved to localStorage
- **URL routing**: Hash-based routing with browser back/forward support
- **Icon system**: Uses proper Ty icon libraries (Lucide, Material) via `ty.icons/add!`

## Icon Usage

Icons are registered using the new `window.tyIcons` API with ClojureScript icon libraries:

```clojure
;; Import icon libraries
[tyrell.lucide :as lucide]
[tyrell.material.filled :as mat-filled]

;; Register icons using window.tyIcons API
(defn register-icons! []
  (if-some [icons js/window.tyIcons]
    (.register icons
               #js {"home" mat-filled/home
                    "save" lucide/save
                    "user" lucide/user})
    (js/setTimeout #(register-icons!) 10)))
```

Available icon libraries:
- `ty.lucide` - Modern, consistent Lucide icons (1,636 icons)
- `ty.material.filled` - Material Design filled icons
- `ty.material.outlined` - Material Design outlined icons
- `ty.heroicons.outline` - Heroicons outlined
- `ty.heroicons.solid` - Heroicons solid

## Setup & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open: http://localhost:3000

### Available Scripts

- `npm run dev` - Start Shadow-cljs development server
- `npm run build` - Production build
- `npm run clean` - Clean build artifacts
- `npm run server` - Start Shadow-cljs server

### Styling

This example uses **Tailwind CSS from CDN** (no build step required) combined with Ty's semantic color system. See the CSS Guide for the pattern: **Ty for colors, Tailwind for everything else.**

Navigate between routes using the sidebar or try URLs like:
- `#home` - Home page
- `#forms` - Form demo with state management
- `#buttons` - Button examples with different flavors
- `#components` - Available components overview