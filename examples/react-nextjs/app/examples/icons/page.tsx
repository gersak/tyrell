'use client'

import { TyIcon } from 'tyrell-react'

/**
 * Example: Using Ty Icons
 * 
 * Icons are registered once at app startup in lib/icons.ts
 * Then used throughout the app with <TyIcon name="..." />
 * 
 * Benefits:
 * - Tree-shaking: Only icons imported in lib/icons.ts are bundled
 * - No duplicate dependencies: tyrell-components provides everything
 * - Type-safe: Full TypeScript support
 */
export default function IconsExample() {
  return (
    <div className="ty-content max-w-4xl mx-auto p-8">
      <h1 className="ty-text++ text-3xl font-bold mb-6">Ty Icons Example</h1>

      <div className="ty-elevated rounded-lg p-6 mb-6">
        <h2 className="ty-text++ text-xl font-semibold mb-4">Basic Icons</h2>
        <div className="flex gap-4 flex-wrap">
          <TyIcon name="check" />
          <TyIcon name="heart" />
          <TyIcon name="star" />
          <TyIcon name="home" />
          <TyIcon name="settings" />
          <TyIcon name="user" />
          <TyIcon name="mail" />
          <TyIcon name="bell" />
        </div>
      </div>

      <div className="ty-elevated rounded-lg p-6 mb-6">
        <h2 className="ty-text++ text-xl font-semibold mb-4">Icon Sizes</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <TyIcon name="star" size="xs" />
          <TyIcon name="star" size="sm" />
          <TyIcon name="star" size="md" />
          <TyIcon name="star" size="lg" />
          <TyIcon name="star" size="xl" />
        </div>
      </div>

      <div className="ty-elevated rounded-lg p-6 mb-6">
        <h2 className="ty-text++ text-xl font-semibold mb-4">Animated Icons</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <TyIcon name="settings" spin />
          <TyIcon name="heart" pulse />
        </div>
      </div>

      <div className="ty-elevated rounded-lg p-6 mb-6">
        <h2 className="ty-text++ text-xl font-semibold mb-4">Icons in Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="ty-bg-primary ty-text++ px-4 py-2 rounded flex items-center gap-2">
            <TyIcon name="check" />
            Save
          </button>
          <button className="ty-bg-secondary ty-text++ px-4 py-2 rounded flex items-center gap-2">
            <TyIcon name="search" />
            Search
          </button>
          <button className="ty-bg-danger ty-text++ px-4 py-2 rounded flex items-center gap-2">
            <TyIcon name="x" />
            Cancel
          </button>
        </div>
      </div>

      <div className="ty-elevated rounded-lg p-6">
        <h2 className="ty-text++ text-xl font-semibold mb-4">Navigation Icons</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="ty-border border ty-text++ p-2 rounded">
            <TyIcon name="chevron-left" />
          </button>
          <button className="ty-border border ty-text++ p-2 rounded">
            <TyIcon name="chevron-right" />
          </button>
          <button className="ty-border border ty-text++ p-2 rounded">
            <TyIcon name="chevron-up" />
          </button>
          <button className="ty-border border ty-text++ p-2 rounded">
            <TyIcon name="chevron-down" />
          </button>
          <button className="ty-border border ty-text++ p-2 rounded">
            <TyIcon name="menu" />
          </button>
        </div>
      </div>

      <div className="ty-elevated rounded-lg p-6 mt-6">
        <h2 className="ty-text++ text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4 ty-text">
          <p>
            Icons are registered once at app startup in <code className="ty-bg-neutral- px-2 py-1 rounded">lib/icons.ts</code>:
          </p>

          <pre className="ty-bg-neutral- ty-text- p-4 rounded text-sm overflow-x-auto">
            {`// lib/icons.ts
import { check, heart, star } from 'tyrell-components/icons/lucide'

export function initializeIcons() {
  window.tyIcons.register({
    check,
    heart,
    star,
    // Only icons you import are bundled!
  })
}`}
          </pre>

          <p>
            Then use them anywhere in your app:
          </p>

          <pre className="ty-bg-neutral- ty-text- p-4 rounded text-sm overflow-x-auto">
            {`import { TyIcon } from 'tyrell-react'

<TyIcon name="check" />
<TyIcon name="heart" pulse />
<TyIcon name="star" size="xl" />`}
          </pre>

          <div className="ty-bg-success- ty-border-success border rounded-lg p-4 mt-4">
            <h3 className="ty-text-success++ font-semibold mb-2">✨ Benefits</h3>
            <ul className="ty-text-success space-y-1 text-sm list-disc list-inside">
              <li>Perfect tree-shaking - only bundle icons you use</li>
              <li>No duplicate dependencies - tyrell-components includes 1600+ icons</li>
              <li>Type-safe with full TypeScript support</li>
              <li>Works across React, Vue, vanilla JS, any framework</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
