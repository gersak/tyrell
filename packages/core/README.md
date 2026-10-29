# tyrell-components

TypeScript web components for universal UI development.

**Framework-agnostic evolution of [Toddler](https://github.com/gersak/toddler)** — same components (calendar, dropdown, routing, icons), rebuilt with Web Components to work everywhere, not just React.

## Installation

```bash
npm install tyrell-components        # latest -> the RC line
npm install tyrell-components@tc     # tc     -> the TC line (current work)
```

**Two dist-tags, and `latest` is not the newest version.** `latest`/`rc` point
at the RC line — the promoted, stable releases. `tc` points at the TC line,
where features land first and which can run several versions and weeks ahead of
`latest`. A plain `npm install` therefore gets you the RC, deliberately. Reach
for `@tc` when you want the newest components; check
[CHANGELOG.md](../../CHANGELOG.md) for what is only on the TC line so far.

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

**Actions**
- **ty-button** - Button in five flavors with `+`/`-` tones, sizes, icon slots
- **ty-tag** - Label, status or filter chip; optionally dismissible

**Text input**
- **ty-input** - Text, number, currency and percent input with locale-aware formatting
- **ty-textarea** - Auto-resizing textarea
- **ty-file-upload** - Drop zone and file list, form-associated
- **ty-copy** - Read-only field with copy-to-clipboard (alias `ty-copy-field`)

**Toggles**
- **ty-checkbox** - Checkbox, form-associated
- **ty-switch** - On/off switch
- **ty-radio-group** / **ty-radio** - Radio group with arrow-key navigation

**Selection**
- **ty-select** - Single and multiple select with search, async options, app-held selection and create-on-the-fly
- **ty-option** - Option for `ty-select`
- **ty-selected-options** - Selected values as dismissible tags, placed anywhere (alias `ty-selected-tags`)

**Date & time**
- **ty-date-picker** - Date (and time) picker with calendar popup
- **ty-calendar** - Inline calendar with month/year view and keyboard navigation
- **ty-calendar-month** / **ty-calendar-navigation** - The calendar's building blocks

**Overlays**
- **ty-modal** - Modal dialog with backdrop, Escape and focus trap (alias `ty-dialog`)
- **ty-popup** - Anchored popup with placement and flipping
- **ty-tooltip** - Tooltip on hover and focus

**Layout**
- **ty-tabs** / **ty-tab** - Tabs with a scrollable strip and overflow menu
- **ty-wizard** / **ty-step** - Multi-step flow
- **ty-scroll-container** - Scroll area with edge shadows and scroll anchoring
- **ty-resize-observer** - Publishes an element's size for layout code
- **ty-sortable** - Drag-and-drop and keyboard reordering, within a list or across a group

**Visual**
- **ty-icon** - Icon from the registry (Lucide, Heroicons, Material, Font Awesome)

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