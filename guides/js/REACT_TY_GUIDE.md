# React + Ty Guide

Use Ty web components in React with `tyrell-react` — typed wrappers with React-idiomatic event handling, ref forwarding, and controlled component patterns.

## Setup

### 1. Install packages

```bash
npm install tyrell-components tyrell-react
```

Two packages, two roles:
- **`tyrell-components`** — the web components, CSS, and 1,600+ tree-shakeable icons.
- **`tyrell-react`** — typed React wrappers that render `<ty-*>` elements with React-idiomatic props and event handlers.

### 2. Load Ty's web components

You have two options. Pick one — they're mutually exclusive.

#### Option A — Bundler imports (recommended)

Import `tyrell-components` once at your app's entry point. Each component file runs `customElements.define(...)` as a side effect when imported, registering all `<ty-*>` elements:

```tsx
// app/layout.tsx (Next.js) or src/main.tsx (Vite)
import 'tyrell-components/css/tyrell.css'   // CSS via your bundler
import 'tyrell-components'               // registers all <ty-*> components
```

For smaller bundles, register only the components you use:

```tsx
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components/button'
import 'tyrell-components/input'
import 'tyrell-components/dropdown'
import 'tyrell-components/modal'
```

Available subpaths match the component names — `button`, `input`, `dropdown`, `multiselect`, `modal`, `popup`, `tooltip`, `tag`, `option`, `icon`, `checkbox`, `textarea`, `copy`, `tabs`, `tab`, `calendar`, `calendar-month`, `calendar-navigation`, `date-picker`.

#### Option B — CDN script tag

Skip the bundler — load Ty from a `<script>` tag in your HTML head:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js"></script>
```

Or self-host by copying `node_modules/tyrell-components/dist/tyrell.js` and `node_modules/tyrell-components/css/tyrell.css` into your `public/` directory and pointing the tags there.

#### Which should I pick?

| | Bundler imports | CDN script tag |
|--|--|--|
| Component tree-shaking | ✅ Selective subpath imports | ❌ Whole bundle (~all components) |
| Icon registration | ✅ `registerIcons` directly imported | ⚠️ Must use `window.tyIcons.register` (timing-sensitive) |
| Build complexity | Standard import | One-time `<script>` tag in HTML |
| First paint | Same bundle as your app | Separate request, can FOUC |

Bundler imports are the better default for SPAs and SSR apps (Next.js, Remix, Vite). CDN is fine for prototyping or when you don't control the bundler.

### 3. Import and use

```tsx
import { TyButton, TyInput, TyDropdown } from 'tyrell-react'

function App() {
  const [name, setName] = useState('')

  return (
    <div className="ty-canvas p-8">
      <TyInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.detail.value)}
      />
      <TyButton flavor="primary" onClick={() => alert(name)}>
        Submit
      </TyButton>
    </div>
  )
}
```

## Import Styles

Two naming conventions:

```tsx
// Ty-prefixed (explicit)
import { TyButton, TyInput, TyDropdown } from 'tyrell-react'

// Short names (clean)
import { Button, Input, Dropdown } from 'tyrell-react'
```

## Event Handling

Always access values through `event.detail.value`:

```tsx
// Correct
<TyInput onChange={(e) => setValue(e.detail.value)} />

// Wrong — event.value does not exist
<TyInput onChange={(e) => setValue(e.value)} />
```

### Input Components

- `onChange` fires on every keystroke (mapped from `input` event)
- `onChangeCommit` fires on blur (mapped from `change` event)

```tsx
<TyInput
  value={query}
  onChange={(e) => setQuery(e.detail.value)}
  onChangeCommit={(e) => search(e.detail.value)}
/>
```

Event detail structure:
```ts
interface TyInputEventDetail {
  value: any
  formattedValue: string
  rawValue: string
  originalEvent: Event
}
```

### Selection Components

```tsx
<TyDropdown onChange={(e) => setCountry(e.detail.value)}>
  <TyOption value="us">United States</TyOption>
  <TyOption value="de">Germany</TyOption>
</TyDropdown>
```

### Checkbox

```tsx
<TyCheckbox
  checked={agreed}
  onChange={(e) => setAgreed(e.detail.value)}
/>
```

### Modal Events

```tsx
<TyModal
  open={isOpen}
  onOpen={() => console.log('opened')}
  onClose={(e) => {
    setIsOpen(false)
    console.log('reason:', e.detail.reason)
  }}
>
  <div className="p-6 ty-elevated rounded-lg">
    Modal content
  </div>
</TyModal>
```

When React controls the `open` state, the modal can still close itself via backdrop click or ESC — firing `onClose` — but if you haven't updated your state in the handler, the next render reopens it. For full React control, disable those close paths explicitly:

```tsx
<TyModal
  open={isOpen}
  closeOnOutsideClick={false}
  closeOnEscape={false}
  onClose={() => setIsOpen(false)}
>
  ...
</TyModal>
```

Now only programmatic state changes (`setIsOpen(false)`) or the built-in X button close the modal.

### Tag Events

```tsx
<TyTag
  value="react"
  dismissible
  onTagClick={(e) => console.log('clicked', e.detail.value)}
  onTagDismiss={(e) => removeTag(e.detail.value)}
>
  React
</TyTag>
```

## Controlled Components

```tsx
function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    message: ''
  })

  const update = (field: string) => (e: any) =>
    setForm(prev => ({ ...prev, [field]: e.detail.value }))

  return (
    <form onSubmit={handleSubmit}>
      <TyInput label="Name" value={form.name} onChange={update('name')} required />
      <TyInput label="Email" type="email" value={form.email} onChange={update('email')} required />
      <TyDropdown label="Country" value={form.country} onChange={update('country')}>
        <TyOption value="us">United States</TyOption>
        <TyOption value="de">Germany</TyOption>
      </TyDropdown>
      <TyTextarea label="Message" value={form.message} onChange={update('message')} rows={4} />
      <TyButton type="submit" flavor="primary">Send</TyButton>
    </form>
  )
}
```

## Multiselect

Value is an array, passed as comma-separated string:

```tsx
const [selected, setSelected] = useState<string[]>([])

<TyMultiselect
  value={selected}
  onChange={(e) => setSelected(e.detail.value)}
  label="Tags"
  placeholder="Select tags..."
>
  <TyOption value="react">React</TyOption>
  <TyOption value="vue">Vue</TyOption>
  <TyOption value="angular">Angular</TyOption>
</TyMultiselect>
```

## Dropdown with Data

```tsx
<TyDropdown
  options={[
    { value: 'us', text: 'United States' },
    { value: 'de', text: 'Germany' },
    { value: 'jp', text: 'Japan' }
  ]}
  onChange={(e) => setCountry(e.detail.value)}
/>
```

## Refs and Imperative API

### Modal

```tsx
const modalRef = useRef<TyModalRef>(null)

<TyButton onClick={() => modalRef.current?.show()}>Open Modal</TyButton>

<TyModal ref={modalRef} onClose={() => console.log('closed')}>
  <div className="p-6 ty-elevated rounded-lg">
    <p>Modal content</p>
    <TyButton onClick={() => modalRef.current?.hide()}>Close</TyButton>
  </div>
</TyModal>
```

### Popup

```tsx
const popupRef = useRef<TyPopupRef>(null)

<TyPopup ref={popupRef}>
  <TyButton onClick={() => popupRef.current?.togglePopup()}>Toggle</TyButton>
  <div className="p-4 ty-floating rounded-lg">Popup content</div>
</TyPopup>
```

### Scroll Container

```tsx
const scrollRef = useRef<TyScrollContainerRef>(null)

<TyScrollContainer ref={scrollRef} maxHeight="300px" shadow>
  {/* Long content */}
</TyScrollContainer>

<TyButton onClick={() => scrollRef.current?.scrollToTop()}>Back to top</TyButton>
```

## Calendar with Custom Rendering

```tsx
<TyCalendar
  value="2026-03-24"
  onChange={(e) => setDate(e.detail.value)}
  dayContentFn={(ctx) => {
    const el = document.createElement('div')
    el.textContent = ctx.day
    if (ctx.day === 25) {
      el.style.fontWeight = 'bold'
      el.style.color = 'var(--ty-color-primary)'
    }
    return el
  }}
  customCSS=".day-cell { border-radius: 8px; }"
/>
```

## Custom Styling via CSS Variables

All components accept a typed `style` prop that supports CSS custom properties for per-instance color overrides. These cascade into the shadow DOM so they work despite encapsulation.

### Input components

`TyInput`, `TyTextarea`, `TyDropdown`, and `TyMultiselect` all share the same tokens:

| Token | Purpose |
|-------|---------|
| `--input-bg` | Background |
| `--input-color` | Text color |
| `--input-border` | Border (default) |
| `--input-border-hover` | Border on hover |
| `--input-border-focus` | Border when focused |
| `--input-shadow-focus` | Focus ring (3px outer glow) |
| `--input-placeholder` | Placeholder text color |
| `--input-disabled-bg` | Disabled background |
| `--input-disabled-border` | Disabled border |
| `--input-disabled-color` | Disabled text |

```tsx
<TyInput
  label="Custom input"
  style={{
    '--input-bg': '#fdf4ff',
    '--input-border': '#c084fc',
    '--input-color': '#7e22ce',
    '--input-border-focus': '#a855f7',
    '--input-shadow-focus': 'rgba(168, 85, 247, 0.2)',
  }}
/>

<TyDropdown style={{ '--input-bg': '#fdf4ff', '--input-border': '#c084fc' }}>
  <TyOption value="a">Option A</TyOption>
</TyDropdown>
```

You can also scope overrides to a container — all input components inside inherit:

```tsx
<div style={{ '--input-border': '#16a34a', '--input-border-focus': '#15803d' } as any}>
  <TyInput label="Name" value={name} onChange={...} />
  <TyDropdown label="Role" value={role} onChange={...}>...</TyDropdown>
</div>
```

### Button

```tsx
<TyButton
  appearance="outlined"
  style={{
    '--ty-button-color': '#8b5cf6',
    '--ty-button-border': '#8b5cf6',
    '--ty-button-bg-hover': '#ede9fe',
  }}
>
  Custom button
</TyButton>
```

Available button tokens: `--ty-button-bg`, `--ty-button-bg-hover`, `--ty-button-color`, `--ty-button-border`.

### Tag

```tsx
<TyTag style={{ '--tag-color': '#e53e3e', '--tag-border-color': '#e53e3e' }}>
  12 / 12
</TyTag>
```

Available tag tokens: `--tag-bg`, `--tag-color`, `--tag-border-color`. For stylesheet-level overrides use `::part(container)`:

```css
ty-tag.my-tag::part(container) {
  color: #e53e3e;
  border-color: #e53e3e;
}
```

## Surface Levels

Surfaces are CSS classes — apply them via `className` on any HTML element. No React component required.

Five levels, from lowest to highest elevation:

| Class | Typical use |
|-------|------------|
| `ty-canvas` | App background, outermost wrapper |
| `ty-content` | Main content areas, page bodies |
| `ty-elevated` | Cards, panels, sidebars |
| `ty-floating` | Modals, drawers, sticky headers |
| `ty-input` | Form controls (handled automatically by form components) |

```tsx
// App shell
<div className="ty-canvas min-h-screen p-8">

  {/* Card */}
  <div className="ty-elevated rounded-xl p-6 border ty-border">
    <h2 className="ty-text++ text-xl font-bold">Card title</h2>
    <p className="ty-text-">Card body</p>
  </div>

  {/* Modal content panel */}
  <TyModal open={isOpen} onClose={() => setIsOpen(false)}>
    <div className="ty-floating p-6 rounded-xl max-w-md">
      Modal content
    </div>
  </TyModal>

</div>
```

Surfaces handle background color and text color automatically via the Ty design system. Pair with Tailwind for spacing, layout, and typography — but use only Ty classes for colors:

```tsx
// Correct: Ty for color, Tailwind for everything else
<div className="ty-elevated p-6 rounded-lg flex items-center gap-4">

// Wrong: mixing color systems
<div className="bg-white p-6 rounded-lg">
```

## Text Classes

Five emphasis levels — no color, just weight:

```tsx
<h1 className="ty-text++ text-3xl">Page title</h1>
<h2 className="ty-text+ text-xl">Section heading</h2>
<p className="ty-text">Body text</p>
<span className="ty-text-">Secondary info</span>
<small className="ty-text--">Fine print</small>
```

Semantic text colors follow the same five-variant pattern:

```tsx
<p className="ty-text-primary">Primary</p>
<p className="ty-text-primary+">Stronger primary</p>
<p className="ty-text-primary-">Softer primary</p>
```

Available colors: `primary`, `secondary`, `success`, `danger`, `warning`, `neutral`, `accent`.

## Border Classes

Five emphasis levels:

```tsx
<div className="border ty-border++">Strong border</div>
<div className="border ty-border+">Heavy border</div>
<div className="border ty-border">Normal border</div>
<div className="border ty-border-">Soft border</div>
<div className="border ty-border--">Minimal border</div>
```

Semantic borders:

```tsx
<div className="border ty-border-primary">Primary border</div>
<div className="border ty-border-danger">Danger border</div>
<div className="border ty-border-success">Success border</div>
```

Available colors: `primary`, `secondary`, `success`, `danger`, `warning`, `neutral`. `accent` also has `+` and `-` variants.

## Background Colors

Use `ty-bg-*` for small UI elements — badges, alerts, status indicators. Not for cards or layout areas (use surfaces for those).

```tsx
{/* Status badge */}
<span className="ty-bg-success- ty-text-success rounded-full px-2 py-0.5 text-xs">Active</span>

{/* Alert banner */}
<div className="ty-bg-danger- ty-text-danger rounded-lg p-4">
  Something went wrong
</div>
```

Three variants per color — stronger (`+`), base, softer (`-`):

```tsx
<div className="ty-bg-primary+">Stronger</div>
<div className="ty-bg-primary">Base</div>
<div className="ty-bg-primary-">Softer</div>
```

Available colors: `primary`, `secondary`, `success`, `danger`, `warning`, `neutral`, `accent`.

## Dark Mode

Ty responds to a `dark` class on `<html>`. All color variables switch automatically.

```tsx
// Simple toggle hook
function useTheme() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
      || window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggleTheme: () => setDark(d => !d) }
}
```

Restore preference before first render to avoid flash (add to your HTML `<head>`):

```html
<script>
  const theme = localStorage.getItem('theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  if (theme === 'dark') document.documentElement.classList.add('dark')
</script>
```

### Next.js

In Next.js, add the script to your root layout and mark it `suppressHydrationWarning` on `<html>`:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          const t = localStorage.getItem('theme')
            || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          if (t === 'dark') document.documentElement.classList.add('dark')
        `}} />
      </head>
      <body className="ty-canvas">{children}</body>
    </html>
  )
}
```

## Global Color Customization

Override the whole palette at `:root` level to rebrand Ty:

```css
:root {
  --ty-color-primary-strong: #0034c7;
  --ty-color-primary-mild:   #1c40a8;
  --ty-color-primary:        #4367cd;
  --ty-color-primary-soft:   #60a5fa;
  --ty-color-primary-faint:  #93c5fd;
  --ty-bg-primary-mild:      #bfdbfe;
  --ty-bg-primary:           #dbeafe;
  --ty-bg-primary-soft:      #eff6ff;
}

:root.dark {
  --ty-color-primary-strong: #93c5fd;
  --ty-color-primary:        #3b82f6;
  --ty-bg-primary:           #172554;
}
```

Token pattern: `--ty-color-{name}-{strong|mild|soft|faint}`, `--ty-bg-{name}-{mild|soft}`, `--ty-border-{name}`.

This retunes every component that uses that color. To override a single instance only, use the per-component CSS variables in the section above.

## Numeric Input Types

```tsx
// Currency
<TyInput type="currency" currency="EUR" locale="de-DE" value={price}
  onChange={(e) => setPrice(e.detail.value)} />

// Percentage
<TyInput type="percent" precision={1} value={rate}
  onChange={(e) => setRate(e.detail.value)} />

// Compact numbers (1K, 1M)
<TyInput type="compact" value={count}
  onChange={(e) => setCount(e.detail.value)} />
```

## Tabs and Wizard

`TyTabs` dispatches its change event with detail `{ activeId, activeIndex, previousId, previousIndex }` — read `event.detail.activeId` (not `value`):

```tsx
import { TyTabs, TyTab, type TabChangeDetail } from 'tyrell-react'

const [activeTab, setActiveTab] = useState('overview')

<TyTabs
  active={activeTab}
  onChange={(e: CustomEvent<TabChangeDetail>) => setActiveTab(e.detail.activeId)}
>
  <TyTab id="overview" label="Overview">
    <p>Overview content</p>
  </TyTab>
  <TyTab id="settings" label="Settings">
    <p>Settings content</p>
  </TyTab>
</TyTabs>
```

```tsx
<TyWizard active={step} completed={completedSteps.join(',')}>
  <TyStep id="info" label="Information">Step 1 content</TyStep>
  <TyStep id="review" label="Review">Step 2 content</TyStep>
  <TyStep id="confirm" label="Confirm">Step 3 content</TyStep>
</TyWizard>
```

## Icons

`tyrell-components` ships icon libraries as tree-shakeable individual exports — only the icons you import end up in your bundle:

| Library | Import path | Variants |
|---------|------------|----------|
| Lucide (1,600+) | `tyrell-components/icons/lucide` | single file |
| Heroicons | `tyrell-components/icons/heroicons/{outline,solid,mini,micro}` | 4 styles |
| Material | `tyrell-components/icons/material/{filled,outlined,round,sharp,two-tone}` | 5 styles |
| FontAwesome | `tyrell-components/icons/fontawesome/{brands,regular,solid}` | 3 styles |

### Register at app startup

How you register depends on which setup option you picked above.

#### With bundler imports (recommended)

`registerIcons` and the components share the same module graph, so registration is synchronous — no timing dance:

```tsx
// lib/icons.ts
import { registerIcons } from 'tyrell-components/icons/registry'
import { check, heart, star, chevronRight, chevronLeft, alertCircle } from 'tyrell-components/icons/lucide'

registerIcons({
  check,
  heart,
  star,
  'chevron-right': chevronRight,
  'chevron-left': chevronLeft,
  'alert-circle': alertCircle,
})
```

Import this file once from your app entry to execute the registration:

```tsx
// app/layout.tsx (Next.js)
import 'tyrell-components/css/tyrell.css'
import 'tyrell-components'
import '@/lib/icons'   // runs registerIcons at module-eval time
```

Import names follow camelCase from Lucide; rename to kebab-case in the registration map if that's how you want to reference them in markup (`<TyIcon name="chevron-right" />`).

#### With CDN script tag

The CDN bundle owns the registry the components read from. Use `window.tyIcons.register` so writes land in that registry — *not* `registerIcons` imported from `tyrell-components/icons/registry`, which would create a separate module instance with its own registry that `<ty-icon>` can't see.

```tsx
// lib/icons.ts
import { check, heart, star, chevronRight } from 'tyrell-components/icons/lucide'

export function registerAppIcons() {
  window.tyIcons.register({
    check,
    heart,
    star,
    'chevron-right': chevronRight,
  })
}
```

Mount this from a client component in your root layout — `useEffect` waits until the CDN script has loaded `window.tyIcons`:

```tsx
// components/IconRegistry.tsx
'use client'
import { useEffect } from 'react'
import { registerAppIcons } from '@/lib/icons'

export function IconRegistry() {
  useEffect(() => {
    if (window.tyIcons) return registerAppIcons()
    const id = setInterval(() => {
      if (window.tyIcons) {
        clearInterval(id)
        registerAppIcons()
      }
    }, 50)
    return () => clearInterval(id)
  }, [])
  return null
}
```

Add this once in a `.d.ts` so `window.tyIcons` is typed:

```ts
declare global {
  interface Window {
    tyIcons: {
      register: (icons: Record<string, string>) => void
      get: (name: string) => string | undefined
      has: (name: string) => boolean
      list: () => string[]
    }
  }
}
```

### Use icons

```tsx
<TyIcon name="check" size="sm" />
<TyIcon name="heart" size="lg" pulse />
<TyIcon name="chevron-right" />
```

## Slots

Use `slot="start"` and `slot="end"` for icons inside buttons, inputs, and tags. The component handles spacing automatically.

```tsx
{/* Button with start icon */}
<TyButton flavor="primary">
  <TyIcon slot="start" name="save" size="sm" />
  Save
</TyButton>

{/* Button with end icon */}
<TyButton flavor="neutral">
  Next
  <TyIcon slot="end" name="chevron-right" size="sm" />
</TyButton>

{/* Input with icon slots */}
<TyInput type="currency" currency="EUR" label="Price">
  <TyIcon slot="start" name="euro" />
</TyInput>

<TyInput type="email" label="Email">
  <TyIcon slot="start" name="mail" size="sm" />
  <TyIcon slot="end" name="check" size="sm" />
</TyInput>

{/* Tag with icon */}
<TyTag flavor="primary" dismissible>
  <TyIcon slot="start" name="star" size="sm" />
  Featured
</TyTag>

{/* Rich tab labels via slot="label-{id}" */}
<TyTabs height="400px">
  <span slot="label-settings" className="flex items-center gap-2">
    <TyIcon name="settings" size="sm" />
    Settings
  </span>
  <TyTab id="settings" label="Settings">Content</TyTab>
</TyTabs>
```

## Form Integration

Ty components participate in HTML forms via `ElementInternals`:

```tsx
<form onSubmit={(e) => {
  e.preventDefault()
  const data = new FormData(e.currentTarget)
  console.log(Object.fromEntries(data.entries()))
}}>
  <TyInput name="email" type="email" required label="Email" />
  <TyDropdown name="role" label="Role">
    <TyOption value="admin">Admin</TyOption>
    <TyOption value="user">User</TyOption>
  </TyDropdown>
  <TyCheckbox name="agree" required>I agree to terms</TyCheckbox>
  <TyButton type="submit" flavor="primary">Submit</TyButton>
</form>
```

## Next.js Integration

### App Router Setup

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tyrell-components@latest/css/tyrell.css" />
        <script type="module" src="https://cdn.jsdelivr.net/npm/tyrell-components@latest/dist/tyrell.js" />
      </head>
      <body className="ty-canvas">{children}</body>
    </html>
  )
}
```

### Client Components

Ty components require the browser — use `'use client'` directive:

```tsx
'use client'

import { useState } from 'react'
import { TyInput, TyButton } from 'tyrell-react'

export default function SearchForm() {
  const [query, setQuery] = useState('')
  return (
    <div className="flex gap-2">
      <TyInput value={query} onChange={(e) => setQuery(e.detail.value)} placeholder="Search..." />
      <TyButton flavor="primary" onClick={() => search(query)}>Search</TyButton>
    </div>
  )
}
```

### Wait for Components

If you see FOUC (flash of unstyled content), gate rendering until Ty is loaded:

```tsx
'use client'
import { useState, useEffect } from 'react'

export function TyLoader({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const check = () => {
      if (window.customElements?.get('ty-button')) {
        setLoaded(true)
      } else {
        setTimeout(check, 50)
      }
    }
    check()
  }, [])

  if (!loaded) return null
  return <>{children}</>
}
```

## Component Reference

| Component | Value Prop | Event | Ref Methods |
|-----------|-----------|-------|-------------|
| `TyButton` | -- | `onClick` | -- |
| `TyInput` | `value` | `onChange` / `onChangeCommit` | -- |
| `TyTextarea` | `value` | `onChange` / `onChangeCommit` | -- |
| `TyCheckbox` | `checked` | `onChange` | -- |
| `TyDropdown` | `value` | `onChange` | -- |
| `TyMultiselect` | `value` (array) | `onChange` | -- |
| `TyDatePicker` | `value` (ISO) | `onChange` / `onOpen` / `onClose` | -- |
| `TyCalendar` | `value` (ISO) | `onChange` / `onNavigate` | -- |
| `TyTabs` | `active` | `onChange` | -- |
| `TyModal` | `open` | `onOpen` / `onClose` | `show()` / `hide()` |
| `TyPopup` | `manual` | -- | `openPopup()` / `closePopup()` / `togglePopup()` |
| `TyTag` | `value` | `onTagClick` / `onTagDismiss` | -- |
| `TyIcon` | `name` | -- | -- |
| `TyCopy` | `value` | -- | -- |
| `TyTooltip` | -- | -- | -- |
| `TyScrollContainer` | -- | -- | `scrollToTop()` / `scrollToBottom()` / `updateShadows()` |
| `TyWizard` | `active` | -- | -- |
