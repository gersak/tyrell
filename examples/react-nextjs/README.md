# Ty React + Next.js Example

Demo application showcasing **Ty web components** with **React 18+** and **Next.js 14+**.

## 🎯 What This Example Demonstrates

This is a testing ground for `tyrell-components` web components in a modern React + Next.js environment:

- ✅ **Web Components in React** - Direct usage of custom elements
- ✅ **TypeScript Integration** - Type-safe component props
- ✅ **Next.js App Router** - Works inside the App Router via client-side registration (`'use client'` + `useEffect` import)
- ✅ **Event Handling** - React synthetic events with custom elements
- ✅ **Refs** - Accessing component imperative APIs
- ✅ **Icon System** - Icon registry initialization

---

## 🚀 Getting Started

### Prerequisites

```bash
# Install Ty components
npm install tyrell-components
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the example.

---

## 📋 Component Tests

This example tests the following components:

### Form Components
- **TyButton** - Click handlers, flavors, sizes
- **TyInput** - Value binding, change events, validation
- **TyCheckbox** - Checked state, form integration

### Selection Components
- **TyDropdown** - Options, selection events, keyboard navigation
- **TyMultiselect** - Multiple selections, tag display

### Overlay Components
- **TyModal** - Imperative API (`show()`/`hide()`), ESC key, backdrop
- **TyPopup** - Positioning, trigger elements
- **TyTooltip** - Hover/focus triggers

### Display Components
- **TyIcon** - Icon registry, size variants
- **TyCalendar** - Date selection, navigation, form integration
- **TyTag** - Removable chips, semantic colors

---

## 🏗️ Project Structure

```
react-nextjs/
├── app/
│   ├── globals.css          # Global styles + Ty CSS import
│   ├── layout.tsx           # Root layout (loads Ty components)
│   └── page.tsx             # Component testing page
├── lib/
│   └── icons.ts             # Icon registry initialization
├── components/              # React wrapper components (if any)
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## 💡 Usage Patterns

### Basic Component Usage

```tsx
'use client'

import { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    // Components are registered globally after import
    import('tyrell-components')
  }, [])

  return (
    <ty-button 
      flavor="primary"
      onClick={() => alert('Clicked!')}
    >
      Click Me
    </ty-button>
  )
}
```

### With TypeScript Types

```tsx
'use client'

import { useEffect } from 'react'

// Declare custom element types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ty-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          flavor?: 'primary' | 'secondary' | 'success' | 'danger'
          size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
          disabled?: boolean
        },
        HTMLElement
      >
    }
  }
}

export default function TypeSafeButton() {
  return (
    <ty-button 
      flavor="primary"  // ✅ Type-checked
      size="lg"         // ✅ Autocomplete works
    >
      Click Me
    </ty-button>
  )
}
```

### Event Handling

```tsx
'use client'

export default function InputExample() {
  const handleChange = (e: Event) => {
    const customEvent = e as CustomEvent<{ value: string }>
    console.log('New value:', customEvent.detail.value)
  }

  return (
    <ty-input
      placeholder="Enter text..."
      onInput={handleChange}
    />
  )
}
```

### Imperative API with Refs

```tsx
'use client'

import { useRef } from 'react'

export default function ModalExample() {
  const modalRef = useRef<HTMLElement & {
    show: () => void
    hide: () => void
  }>(null)

  return (
    <>
      <ty-button onClick={() => modalRef.current?.show()}>
        Open Modal
      </ty-button>
      
      <ty-modal ref={modalRef}>
        <div className="p-6">
          <h2 className="text-xl mb-4">Modal Content</h2>
          <ty-button onClick={() => modalRef.current?.hide()}>
            Close
          </ty-button>
        </div>
      </ty-modal>
    </>
  )
}
```

### Icon System

```typescript
// lib/icons.ts
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, heart, star, x, menu } from 'tyrell-components/icons/lucide'

// Register only icons you need (tree-shaking)
registerIcons({ check, heart, star, x, menu })
```

```tsx
// In your component
<ty-icon name="check" size="lg" />

<ty-button flavor="primary">
  <ty-icon name="heart" />
  Like
</ty-button>
```

---

## ⚠️ Known Limitations

### React Wrapper Package

**`tyrell-react` is coming soon!** It will provide:
- Better TypeScript integration
- React-friendly prop names
- Automatic event handling
- Ref forwarding

For now, use direct custom elements as shown in examples above.

### CSS Import

Make sure to import Ty CSS in your global styles:

```css
/* app/globals.css */
@import 'tyrell-components/css/tyrell.css';

/* Your custom styles */
```

Or via CDN in layout:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## ✅ Expected Results

When working correctly, you should see:

### Package Status
- ✅ `tyrell-components` - Loaded successfully
- ⏳ `tyrell-react` - Coming soon

### Component Tests
- ✅ All components render and respond to interactions
- ✅ Events fire correctly
- ✅ Refs work for imperative APIs
- ✅ Forms integrate properly

### Integration Status
- ✅ Web Components API available
- ✅ Custom Elements registered (client-side)
- ✅ Coexists with Next.js SSR — components render as inert markup on the server, activate after client-side registration
- ✅ Client-side hydration works

### Debug Information
- ✅ Client environment detected
- ✅ Custom Elements support confirmed
- ✅ Components mounted successfully

---

## 🐛 Troubleshooting

### Icons Not Showing

**Check:**
1. Icon registry is initialized: `lib/icons.ts` imported
2. Icons are registered before use
3. Icon names match registry

```typescript
// Debug icons
console.log(window.tyIcons?.list())  // See registered icons
console.log(window.tyIcons?.has('check'))  // Check specific icon
```

### Components Not Rendering

**Check:**
1. `tyrell-components` is installed
2. CSS is imported (global or CDN)
3. Components load on client-side (`'use client'`)
4. Browser console for errors

### TypeScript Errors

**Solutions:**
1. Declare custom element types (see examples above)
2. Use `any` type temporarily while `tyrell-react` is in development
3. Create local type definitions

```typescript
// types/ty.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'ty-button': any
    'ty-input': any
    'ty-calendar': any
    // ... add as needed
  }
}
```

### Hydration Warnings

Web components may cause hydration warnings in Next.js. This is normal and doesn't affect functionality. The `tyrell-react` wrapper package will handle this better.

---

## 🚧 Future Improvements

### `tyrell-react` Package (Coming Soon)

Will provide:

```tsx
import { TyButton, TyInput, TyModal } from 'tyrell-react'

function App() {
  const [value, setValue] = useState('')
  
  return (
    <>
      <TyButton 
        flavor="primary"
        onClick={() => console.log('Clicked!')}
      >
        Click Me
      </TyButton>
      
      <TyInput
        value={value}
        onValueChange={setValue}  // React-style event
      />
    </>
  )
}
```

**Benefits:**
- Full TypeScript types
- React-style props and events
- Better hydration handling
- Automatic ref forwarding

---

## 📚 Additional Resources

### Ty Components
- 📦 [NPM Package](https://www.npmjs.com/package/tyrell-components)
- 📖 [Documentation](https://gersak.github.io/ty)
- 💻 [GitHub](https://github.com/gersak/ty)
- 🎨 [Icon System](https://gersak.github.io/ty/#/icons)

### React + Web Components
- [React Docs: Web Components](https://react.dev/reference/react-dom/components#custom-html-elements)
- [Next.js: Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [MDN: Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)

---

## 📝 Notes

- This example uses **Next.js 14+** with the App Router
- Components use **Shadow DOM** for style encapsulation
- All components are tested with **basic functionality**
- Icons require **initialization** after Ty loads
- Modal uses **React refs** for imperative control
- Current implementation uses **direct custom elements** until `tyrell-react` is ready

---

**Enjoy building with Ty! 🚀**
