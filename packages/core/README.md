# tyrell-components

TypeScript web components for universal UI development.

**Framework-agnostic evolution of [Toddler](https://github.com/gersak/toddler)** — same components (calendar, dropdown, routing, icons), rebuilt with Web Components to work everywhere, not just React.

## Installation

```bash
npm install tyrell-components
```

## Usage

### Import All Components

```javascript
import 'tyrell-components'

// Or with React
import { TyButton, TyModal, TyInput } from 'tyrell-components'
```

### Import Individual Components (Tree-Shaking)

```javascript
import 'tyrell-components/button'
import 'tyrell-components/modal'
import 'tyrell-components/input'
```

### Use in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/tyrell.css">
  <link rel="stylesheet" href="path/to/tyrell-theme.css">
</head>
<body class="ty-canvas">
  
  <ty-button flavor="primary">Click Me</ty-button>
  
  <ty-input placeholder="Enter text..."></ty-input>
  
  <ty-modal id="my-modal">
    <div class="ty-elevated p-6 rounded-lg">
      <h2>Modal Content</h2>
    </div>
  </ty-modal>

  <script type="module">
    import 'tyrell-components'
    
    const modal = document.getElementById('my-modal')
    modal.show()
  </script>
</body>
</html>
```

## Available Components

- **ty-button** - Button with multiple flavors (primary, success, danger, warning, neutral)
- **ty-modal** - Modal dialog with backdrop, ESC key, focus trap
- **ty-input** - Input field with validation, number formatting
- **ty-dropdown** - Dropdown with positioning, keyboard navigation
- **ty-checkbox** - Checkbox with form integration
- **ty-textarea** - Textarea with auto-resize
- **ty-popup** - Popup positioning system
- **ty-tooltip** - Tooltip with hover/focus triggers
- **ty-tag** - Tag with removable state
- **ty-option** - Option for dropdown/multiselect
- **ty-icon** - Icon with registry system
- **ty-copy** - Copy-to-clipboard field for API keys, tokens, URLs
- **ty-calendar** - Full calendar with navigation and date selection
- **ty-calendar-month** - Month view component
- **ty-calendar-navigation** - Calendar navigation controls
- **ty-date-picker** - Date picker with calendar popup
- **ty-multiselect** - Multi-select dropdown with tags

## Development

### Setup

```bash
cd packages/core
npm install
```

### Development Server

```bash
npm run dev
```

Opens development server at `http://localhost:3000` with hot module reloading.

### Build

```bash
npm run build
```

Builds optimized production bundles with type declarations.

### Type Checking

```bash
npm run type-check
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
packages/core/
├── src/
│   ├── components/       # Web component implementations
│   ├── styles/          # Component styles
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main entry point
├── dev/
│   ├── index.html       # Development test page
│   └── tyrell.css          # Symlink to resources/tyrell.css
├── dist/                # Build output
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## TypeScript Support

Full TypeScript support with type declarations:

```typescript
import { TyButton, TyModal, type TyButtonElement } from 'tyrell-components'
import { registerIcons } from 'tyrell-components/icons/registry'

// Icons are in separate tyrell-components/icons package (optional)
// npm install tyrell-components/icons
// import { check, heart } from 'tyrell-components/icons/lucide'
// registerIcons({ check, heart })

// Or register your own SVG icons:
registerIcons({
  'my-icon': '<svg>...</svg>'
})

const button: TyButtonElement = document.querySelector('ty-button')!
button.flavor = 'primary'
button.addEventListener('ty-click', (e) => {
  console.log('Clicked:', e.detail)
})
```

### Icon System

Every icon set ships in this package as named exports. Import the ones you use and register them; the rest is tree-shaken.

```js
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, chevronDown } from 'tyrell-components/icons/lucide'

registerIcons({ check, 'action-down': chevronDown })  // the key is the name
```

```html
<ty-icon name="check"></ty-icon>
```

CDN build: `window.tyIcons.register({ … })`. Sets, tree-shaking, custom SVGs and troubleshooting: [ICONS_GUIDE.md](https://github.com/gersak/ty/blob/master/guides/ICONS_GUIDE.md).

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Web Components (Custom Elements, Shadow DOM)
- ES2020+

## Zero Dependencies

This package has zero runtime dependencies. Everything is built on native web standards.

## License

MIT