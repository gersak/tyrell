# tyrell-react

**React wrappers for Tyrell Web Components** - bringing framework-agnostic web components to React with full TypeScript support.

## 🎯 Philosophy

Tyrell web components are **distributed via CDN** and loaded as standard web components. These React wrappers provide:
- ✅ **React-friendly API** - Props instead of attributes
- ✅ **TypeScript types** - Full type safety
- ✅ **Event handling** - React synthetic events
- ✅ **Ref forwarding** - Direct DOM access
- ✅ **Zero bundle overhead** - Just thin wrappers (~2KB)

## 📦 Installation

### Step 1: Load Tyrell Web Components (CDN)

Add to your `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Tyrell Web Components & Styles via CDN -->
  <script src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell-theme.css">
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### Step 2: Install React Wrappers

```bash
npm install tyrell-react
```

That's it! No build complexity, no bundler configuration.

## 🚀 Quick Start

```tsx
import React, { useState } from 'react';
import { TyButton, TyInput, TyModal } from 'tyrell-react';

function App() {
  const [value, setValue] = useState('');

  return (
    <div>
      <TyButton flavor="primary" onClick={() => alert('Hello!')}>
        Click Me
      </TyButton>
      
      <TyInput 
        placeholder="Enter text..."
        value={value}
        onChange={(e) => setValue(e.detail.value)}  // Fires on every keystroke
      />
    </div>
  );
}
```

## 📚 Available Components

Every component is wrapped:

| Component | Description |
|-----------|-------------|
| `TyButton` | Semantic button with multiple flavors |
| `TyInput` | Form input with validation |
| `TyTextarea` | Multi-line text input |
| `TyFileUpload` | File drop zone and list |
| `TyCheckbox` | Checkbox, form-associated |
| `TySwitch` | On/off switch |
| `TyRadioGroup` / `TyRadio` | Radio group with arrow-key navigation |
| `TySelect` | Single and multiple select (`multiple`), search, async options |
| `TyOption` | Select option |
| `TySelectedOptions` | Selected values as dismissible tags |
| `TyTag` | Tag/badge component |
| `TyModal` | Modal dialogs |
| `TyPopup` | Smart popup positioning |
| `TyTooltip` | Tooltip component |
| `TyIcon` | Icon component (3000+ icons) |
| `TyCalendar` | Full calendar |
| `TyCalendarMonth` | Month view |
| `TyCalendarNavigation` | Calendar navigation |
| `TyDatePicker` | Date picker with calendar |
| `TyTabs` | Tab container |
| `TyTab` | Individual tab |
| `TyWizard` | Multi-step wizard/stepper |
| `TyStep` | Individual wizard step |
| `TyResizeObserver` | Element size observer |
| `TyScrollContainer` | Scroll wrapper with edge shadows |
| `TyCopy` | Copy-to-clipboard field |

## ⚡ Event Handling (React Convention)

Tyrell React wrappers follow React conventions for event handling:

### Input Components (Input, Textarea, Checkbox)

```tsx
import { TyInput } from 'tyrell-react';

function SearchBox() {
  const [query, setQuery] = useState('');
  
  return (
    <TyInput
      value={query}
      // ✅ onChange fires on every keystroke (React convention)
      onChange={(e) => setQuery(e.detail.value)}
      
      // ✅ onChangeCommit fires on blur (optional - for validation)
      onChangeCommit={(e) => console.log('Final value:', e.detail.value)}
    />
  );
}
```

**Key Points:**
- `onChange` → Fires on **every keystroke** (matches React's `<input onChange>`)
- `onChangeCommit` → Fires on **blur** if value changed (optional)
- This differs from native DOM where `onchange` fires on blur

### Selection Components (Select, Calendar, etc.)

```tsx
import { TySelect, TyOption } from 'tyrell-react';

function CountrySelector() {
  return (
    <TySelect
      // onChange fires when selection changes
      onChange={(e) => console.log('Selected:', e.detail.value)}
    >
      <TyOption value="us">United States</TyOption>
      <TyOption value="ca">Canada</TyOption>
    </TySelect>
  );
}
```

Add `multiple` for multi-select; `e.detail.values` is then always the selected array.

For selection components, `onChange` fires when the selection changes (as expected).

## 💡 Usage Examples

### Form with Validation

```tsx
import { TyInput, TySelect, TyOption, TyButton } from 'tyrell-react';

function ContactForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    console.log(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <TyInput 
        name="email"
        type="email" 
        required 
        placeholder="your@email.com"
      />
      
      <TySelect name="role" required>
        <TyOption value="admin">Administrator</TyOption>
        <TyOption value="user">User</TyOption>
      </TySelect>
      
      <TyButton type="submit" flavor="primary">
        Submit
      </TyButton>
    </form>
  );
}
```

### Modal with Imperative API

```tsx
import { useRef } from 'react';
import { TyModal, TyButton, type TyModalRef } from 'tyrell-react';

function ModalExample() {
  const modalRef = useRef<TyModalRef>(null);

  return (
    <>
      <TyButton onClick={() => modalRef.current?.show()}>
        Open Modal
      </TyButton>
      
      <TyModal 
        ref={modalRef}
        onClose={(e) => console.log('Closed:', e.detail.reason)}
      >
        <h2>Modal Content</h2>
        <TyButton onClick={() => modalRef.current?.hide()}>
          Close
        </TyButton>
      </TyModal>
    </>
  );
}
```

### Controlled Calendar

```tsx
import { useState } from 'react';
import { TyCalendar } from 'tyrell-react';

const pad = (n: number) => String(n).padStart(2, '0');

function CalendarExample() {
  const [selected, setSelected] = useState('2026-03-10'); // ISO YYYY-MM-DD

  return (
    <TyCalendar
      value={selected}
      onChange={(e) => {
        const { year, month, day } = e.detail;
        setSelected(`${year}-${pad(month)}-${pad(day)}`);
      }}
      min="2026-01-01"
      max="2026-12-31"
    />
  );
}
```

## 🪟 Surfaces

The Tyrell design system has five surface levels (background + shadow). They ship as
CSS utility classes — apply them directly to any element. There is no wrapper component
to learn:

```tsx
function Dashboard() {
  return (
    <section className="ty-elevated p-6 rounded-lg">
      <h2>Card title</h2>
      <p>Sits above the page background.</p>
    </section>
  );
}
```

| Class          | Use for                              |
|----------------|--------------------------------------|
| `ty-floating`  | modals, dropdowns, tooltips          |
| `ty-elevated`  | cards, panels, sidebars              |
| `ty-content`   | main content areas                   |
| `ty-canvas`    | app/page background                  |
| `ty-input`     | form control surface                 |

**Golden rule:** use Tyrell surface/colour classes for colour, Tailwind (or your own utilities)
for everything else (spacing, layout, typography). Don't mix `bg-blue-500` with surfaces.

## 🎨 Icons

Register once, from a client-side entry that imports `tyrell-components`:

```js
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, chevronDown } from 'tyrell-components/icons/lucide'

registerIcons({ check, 'action-down': chevronDown })  // the key is the name
```

```tsx
import { TyIcon } from 'tyrell-react'

<TyIcon name="check" size="lg" />
```

Sets, tree-shaking, custom SVGs and troubleshooting: [ICONS_GUIDE.md](https://github.com/gersak/ty/blob/master/guides/ICONS_GUIDE.md#in-javascript).

## 📘 TypeScript Support

Full TypeScript definitions included:

```tsx
import type { 
  TyButtonProps,
  TyInputEventDetail,
  TyModalRef,
  TySelectEventDetail
} from 'tyrell-react';

// Type-safe props
const buttonProps: TyButtonProps = {
  flavor: 'primary',  // ✅ Autocomplete
  size: 'lg',         // ✅ Type-checked
  disabled: false
};

// Type-safe event handlers
const handleChange = (e: CustomEvent<TyInputEventDetail>) => {
  console.log(e.detail.value);      // ✅ Typed
  console.log(e.detail.rawValue);   // ✅ Typed
};
```

## 🌐 ClojureScript Support

Works perfectly with Reagent and UIx:

### Reagent

```clojure
(ns my-app.core
  (:require ["tyrell-react" :as ty]))

(defn my-component []
  [:div
   [:> ty/TyButton {:flavor "primary"} "Click Me"]
   [:> ty/TyInput {:placeholder "Enter text..."}]])
```

### UIx

```clojure
(ns my-app.core
  (:require [uix.core :as uix]
            ["tyrell-react" :refer [TyButton TyInput]]))

(defn my-component []
  (uix/view
    [:<>
     [TyButton {:flavor "primary"} "Click Me"]
     [TyInput {:placeholder "Enter text..."}]]))
```

## 🔧 Peer Dependencies

Only React is required:
- `react` >=18.0.0
- `react-dom` >=18.0.0

**Note:** The core `tyrell-components` web components are loaded via CDN, not as an npm dependency!

## 🌍 Browser Support

Modern browsers with Web Components support:
- Chrome 67+
- Firefox 63+
- Safari 13.1+
- Edge 79+

## 📝 Why CDN Distribution?

**Tyrell web components are framework-agnostic** and designed for CDN distribution:

✅ **Zero version conflicts** - One version serves all frameworks  
✅ **Smaller bundles** - Web components load once, shared across all React components  
✅ **No build complexity** - Just script tags  
✅ **Better caching** - CDN edge network  
✅ **Framework freedom** - Same components work in React, Vue, Svelte, vanilla JS

## 🤝 Contributing

This package is part of the [Tyrell monorepo](https://github.com/gersak/tyrell).

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 🔗 Links

- [Tyrell Core Package](https://www.npmjs.com/package/tyrell-components)
- [GitHub Repository](https://github.com/gersak/tyrell)
- [Documentation](https://tyrell.gersak.dev) (Coming Soon)