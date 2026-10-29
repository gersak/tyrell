# Tyrell TypeScript Components

**Modern, zero-dependency web components written in TypeScript**

This directory contains the TypeScript implementation of all Tyrell components. These are production-ready, framework-agnostic web components with full type safety and modern developer experience.

## 🎯 Why TypeScript?

- **Type Safety** - Full TypeScript types for better IDE support and fewer runtime errors
- **Smaller Bundles** - ~40KB core vs ~300KB with ClojureScript
- **Better DX** - Familiar syntax for most web developers
- **Easy Debugging** - Source maps work perfectly
- **Simple Contribution** - Lower barrier to entry for contributors
- **Universal Compatibility** - Works with React, Vue, HTMX, vanilla JS

---

## 📁 Project Structure

```
src/
├── components/          # Web component implementations
│   ├── button.ts
│   ├── input.ts
│   ├── calendar.ts
│   ├── dropdown.ts
│   └── ...             # 18 components total
├── base/               # Base classes
│   └── ty-component.ts # Unified property lifecycle base class
├── styles/             # Component CSS modules
│   ├── button.ts
│   ├── input.ts
│   └── ...
├── utils/              # Shared utilities
│   ├── property-manager.ts  # Property/attribute management
│   ├── icon-registry.ts     # Icon registration system
│   ├── scroll-lock.ts       # Modal scroll locking
│   ├── positioning.ts       # Popup positioning
│   └── calendar-utils.ts    # Date helpers
├── types/              # TypeScript type definitions
│   └── common.ts       # Shared types (Flavor, Size, etc.)
├── icons/              # Icon libraries (tree-shakeable)
│   ├── lucide.ts       # 1,636 Lucide icons
│   ├── heroicons/      # Heroicons variants
│   ├── material/       # Material Design variants
│   └── fontawesome/    # FontAwesome variants
└── index.ts            # Main entry point
```

---

## 🚀 Quick Start

### Development

```bash
cd packages/core

# Watch mode - rebuilds on changes
npm run dev

# One-time build
npm run build:lib      # Library build (ESM + types)
npm run build:cdn      # CDN bundle build

# Both
npm run build
```

The dev server runs on `http://localhost:3000` with HMR and source maps.

### Creating Test Files

Create HTML files in `/packages/core/dev/` for testing:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test: My Component</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Tyrell CSS (local symlink) -->
  <link rel="stylesheet" href="./ty.css">
</head>
<body class="ty-canvas p-8">
  
  <h1 class="ty-text++ text-2xl mb-4">Testing My Component</h1>
  
  <ty-button flavor="primary">Click Me</ty-button>
  
  <!-- ⚠️ CRITICAL: Import from ../src/ not ../dist/ -->
  <script type="module">
    import { TyButton } from '../src/index.ts';
    
    console.log('✅ Component loaded');
    
    // Your test code here
  </script>
  
</body>
</html>
```

**Important**: Always import from `../src/` in dev files for HMR! See [TYPESCRIPT_DEV_GUIDE.md](../../../TYPESCRIPT_DEV_GUIDE.md) for details.

---

## 🏗️ Architecture

### TyComponent Base Class

All components extend `TyComponent`, which provides:
- Unified property/attribute lifecycle
- Automatic property capture (React/Reagent compatibility)
- Form integration via ElementInternals
- Smart rendering (only on visual property changes)
- Built-in Shadow DOM and style management

See [BUILDING_WITH_TYCOMPONENT.md](../../../BUILDING_WITH_TYCOMPONENT.md) for detailed guide.

### Property Management

The `PropertyManager` class handles:
- Type coercion (string/boolean/number/object/array)
- Validation and constraints
- Change tracking and events

```typescript
protected static properties = {
  value: {
    type: 'string' as const,
    visual: true,        // Triggers render
    formValue: true,     // Syncs to form
    emitChange: true,    // Emits 'change' event
    default: ''
  },
  disabled: {
    type: 'boolean' as const,
    visual: true,
    default: false
  }
}
```

---

## 🎨 Components

### Complete List

| Component | Description | Key Features |
|-----------|-------------|--------------|
| `ty-button` | Button | 5 flavors with +/- tones, 5 sizes, appearances, icon slots |
| `ty-tag` | Tag / chip | Flavors, dismissible, pill |
| `ty-input` | Form input | Number/currency/percent formatting, debounce, icons |
| `ty-textarea` | Multi-line input | Auto-resize, change on blur |
| `ty-file-upload` | File input | Drop zone, file list, required validity |
| `ty-copy` | Copy-to-clipboard | Alias `ty-copy-field` |
| `ty-checkbox` | Checkbox | Form-associated |
| `ty-switch` | Switch | Form-associated, `role="switch"` |
| `ty-radio-group` / `ty-radio` | Radio group | Arrow keys, roving tab stop |
| `ty-select` | Select | Single/multiple, auto search row, `not-searchable`, external search, create |
| `ty-option` | Select option | Rich content |
| `ty-selected-options` | Selected values as tags | Alias `ty-selected-tags` |
| `ty-date-picker` | Date picker | Calendar popup, time fields, native input on mobile |
| `ty-calendar` | Calendar | Month/year view, keyboard, `hide-navigation`, form-associated |
| `ty-calendar-month` / `ty-calendar-navigation` | Calendar parts | Usable standalone |
| `ty-modal` | Modal | Focus trap, Escape, backdrop (alias `ty-dialog`) |
| `ty-popup` | Anchored popup | Placement + flipping |
| `ty-tooltip` | Tooltip | Hover and focus |
| `ty-tabs` / `ty-tab` | Tabs | Scrollable strip, overflow menu, arrow keys |
| `ty-wizard` / `ty-step` | Wizard | Step rail, controlled |
| `ty-scroll-container` | Scroll area | Edge shadows, scroll anchoring |
| `ty-resize-observer` | Size publisher | Element size for layout code |
| `ty-sortable` | Reorderable list | Pointer, touch, keyboard, `move()`; lists in a `group` trade items |
| `ty-icon` | Icon | Registry: Lucide, Heroicons, Material, Font Awesome |

### Example: TyButton

```typescript
// TypeScript
const button = document.createElement('ty-button') as TyButton
button.flavor = 'primary'
button.size = 'lg'
button.addEventListener('click', () => console.log('Clicked!'))

// HTML
<ty-button flavor="primary" size="lg">
  <ty-icon name="check"></ty-icon>
  Click Me
</ty-button>
```

Full API:

```typescript
interface TyButtonElement extends HTMLElement {
  flavor?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  pill?: boolean      // Fully rounded
  outlined?: boolean  // Outlined appearance
  filled?: boolean    // Filled appearance
  accent?: boolean    // Accent appearance (default)
  plain?: boolean     // Plain appearance
  type?: 'button' | 'submit' | 'reset'
}
```

---

## 🎯 Icon System

```js
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, chevronDown } from 'tyrell-components/icons/lucide'

registerIcons({ check, 'action-down': chevronDown })  // the key is the name
```

CDN build: `window.tyIcons.register({ … })`. Sets, tree-shaking, custom SVGs and troubleshooting: [ICONS_GUIDE.md](../../../guides/ICONS_GUIDE.md).

---

## 🛠️ Adding New Components

### 1. Create Component File

```typescript
// src/components/my-component.ts
import { TyComponent } from '../base/ty-component.js'
import type { PropertyChange } from '../utils/property-manager.js'
import { ensureStyles } from '../utils/styles.js'
import { myComponentStyles } from '../styles/my-component.js'

export class TyMyComponent extends TyComponent<MyComponentState> {
  // Property configuration
  protected static properties = {
    value: {
      type: 'string' as const,
      visual: true,
      default: ''
    }
  }
  
  // Internal state
  private _state: MyComponentState = {
    isOpen: false
  }
  
  constructor() {
    super()
    ensureStyles(this.shadowRoot!, { 
      css: myComponentStyles, 
      id: 'ty-my-component' 
    })
  }
  
  protected onConnect(): void {
    // Initialize
  }
  
  protected onPropertiesChanged(changes: PropertyChange[]): void {
    // Handle property changes
  }
  
  protected render(): void {
    // Update DOM
  }
}

customElements.define('ty-my-component', TyMyComponent)
```

### 2. Create Styles

```typescript
// src/styles/my-component.ts
export const myComponentStyles = `
  :host {
    display: block;
  }
  
  .my-component {
    /* Your styles */
  }
`
```

### 3. Add Types

```typescript
// src/types/common.ts (or new file)
export interface MyComponentState {
  isOpen: boolean
}
```

### 4. Export

```typescript
// src/index.ts
export { TyMyComponent } from './components/my-component.js'
export type { TyMyComponentElement } from './components/my-component.js'
```

### 5. Test

Create `dev/test-my-component.html` and test at `http://localhost:3000/test-my-component.html`

See [BUILDING_WITH_TYCOMPONENT.md](../../../BUILDING_WITH_TYCOMPONENT.md) for comprehensive guide.

---

## 📦 Build Output

```
lib/                    # Library build (ESM)
├── index.js
├── index.d.ts         # Type definitions
├── components/
│   ├── button.js
│   ├── button.d.ts
│   └── ...
├── utils/
├── icons/
└── *.map              # Source maps

dist/                  # CDN bundle
├── tyrell.js          # Minified bundle
├── tyrell.css         # Bundled with CSS
└── tyrell.js.map      # Source map
```

---

## 📊 Bundle Size Metrics

| Build | Size (Minified) | Gzipped |
|-------|----------------|---------|
| Core (18 components) | ~40KB | ~15KB |
| Icon Registry | ~5KB | ~2KB |
| Per Icon | ~0.5-1KB | ~0.3KB |
| Full Lucide Set | ~897KB | ~120KB |

**Tree-shaking saves 93% vs loading full icon library!**

---

## 🧪 Testing

```bash
# Manual testing
npm run dev
# Open http://localhost:3000/test-*.html

# Type checking
npx tsc --noEmit

# Automated tests (coming soon)
npm test
```

---

## 📝 TypeScript Configuration

Key settings in `tsconfig.json`:

- **Target**: ES2020
- **Module**: ESNext
- **Strict**: true (full type safety)
- **Declaration**: true (generates .d.ts)
- **SourceMap**: true (debugging support)

---

## 🤝 Contributing

1. Create branch from `main`
2. Make changes in `src/` directory
3. Test with `npm run dev`
4. Ensure types are correct (`npx tsc --noEmit`)
5. Update documentation if needed
6. Submit PR

**Code Style:**
- Use TypeScript strict mode
- Follow existing patterns (TyComponent base class)
- Add JSDoc comments for public APIs
- Keep components focused and composable
- Test in React, Vue, and vanilla JS

---

## 📚 Resources

- [TyComponent Guide](../../../BUILDING_WITH_TYCOMPONENT.md) - Building components
- [TypeScript Dev Guide](../../../TYPESCRIPT_DEV_GUIDE.md) - Development workflow
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements Spec](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Happy coding! 🚀**
