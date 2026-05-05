'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyButton,
  TyIcon,
} from 'tyrell-react'

export default function ButtonsPage() {
  const [mounted, setMounted] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = (id: string, action?: string) => {
    setClickCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))

    if (action === 'loading') {
      setLoadingStates(prev => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
    } else if (action === 'alert') {
      alert(`Button clicked! Count: ${(clickCounts[id] || 0) + 1}`)
    }
  }

  if (!mounted) {
    return (
      <div className="ty-canvas flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin ty-text-primary mb-4"></div>
          <p className="ty-text-">Loading...</p>
        </div>
      </div>
    )
  }

  const flavors = [
    { name: 'Primary', key: 'primary', description: 'Main call-to-action buttons' },
    { name: 'Secondary', key: 'secondary', description: 'Secondary actions and alternatives' },
    { name: 'Success', key: 'success', description: 'Positive actions like save, confirm' },
    { name: 'Danger', key: 'danger', description: 'Destructive actions like delete' },
    { name: 'Warning', key: 'warning', description: 'Caution actions that need attention' },
    { name: 'Info', key: 'info', description: 'Informational actions' },
    { name: 'neutral', key: 'neutral', description: 'Subtle actions with minimal styling' },
  ]

  const sizes = [
    { name: 'Extra Small', key: 'xs', description: 'Compact buttons for tight spaces' },
    { name: 'Small', key: 'sm', description: 'Secondary actions' },
    { name: 'Medium', key: 'md', description: 'Default size (can omit size prop)' },
    { name: 'Large', key: 'lg', description: 'Primary actions and CTAs' },
    { name: 'Extra Large', key: 'xl', description: 'Hero sections and landing pages' },
  ]

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 pb-4 border-b ty-border+">
        <h1 className="text-3xl font-bold mb-2 ty-text++">
          Button Components
        </h1>
        <p className="text-base leading-relaxed ty-text-">
          Interactive buttons with multiple flavors, sizes, and states. Perfect for actions, navigation,
          and user interactions enhanced with Tailwind CSS utility classes.
        </p>
      </div>

      {/* Button Flavors Section */}
      <div className="ty-content rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            🎨 Button Flavors
          </h2>
          <p className="text-sm ty-text-">
            Semantic button variants for different types of actions
          </p>
        </div>

        <div className="ty-elevated p-5 rounded-lg border ty-border-">
          <div className="space-y-6">
            {flavors.map((flavor) => (
              <div key={flavor.key} className="ty-floating p-5 rounded-lg border-l-4 ty-border-primary hover:shadow-lg transition-shadow duration-200">
                <h3 className="ty-text-primary+ font-medium mb-2 capitalize">
                  {flavor.name} Buttons
                </h3>
                <p className="text-sm ty-text- mb-4">
                  {flavor.description}
                </p>

                <div className="flex flex-wrap gap-3 items-center">
                  <TyButton
                    flavor={flavor.key as any}
                    onClick={() => handleClick(`${flavor.key}-basic`)}
                    className="transition-transform duration-200 hover:scale-105"
                  >
                    {flavor.name}
                  </TyButton>

                  <TyButton
                    flavor={flavor.key as any}
                    onClick={() => handleClick(`${flavor.key}-icon`)}
                    className="flex items-center gap-2"
                  >
                    <TyIcon name="star" size="16" />
                    With Icon
                  </TyButton>

                  <TyButton
                    flavor={flavor.key as any}
                    onClick={() => handleClick(`${flavor.key}-count`, 'alert')}
                    className="font-mono text-sm"
                  >
                    Clicked: {clickCounts[`${flavor.key}-count`] || 0}
                  </TyButton>

                  <TyButton
                    flavor={flavor.key as any}
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Disabled
                  </TyButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button Sizes Section */}
      <div className="ty-content rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            📏 Button Sizes
          </h2>
          <p className="text-sm ty-text-">
            Different sizes for various use cases and visual hierarchy
          </p>
        </div>

        <div className="ty-elevated p-5 rounded-lg border ty-border-">
          <div className="space-y-5">
            {sizes.map((size) => (
              <div key={size.key} className="ty-floating p-5 rounded-lg border-l-4 ty-border-primary hover:shadow-lg transition-shadow duration-200">
                <h3 className="ty-text-primary+ font-medium mb-2">
                  {size.name} ({size.key})
                </h3>
                <p className="text-sm ty-text- mb-4">
                  {size.description}
                </p>

                <div className="flex flex-wrap gap-3 items-center">
                  <TyButton
                    size={size.key as any}
                    flavor="primary"
                    onClick={() => handleClick(`size-${size.key}`)}
                    className="transition-all duration-200 hover:shadow-lg"
                  >
                    Primary {size.name}
                  </TyButton>

                  <TyButton
                    size={size.key as any}
                    flavor="secondary"
                    onClick={() => handleClick(`size-secondary-${size.key}`)}
                    className="flex items-center gap-2"
                  >
                    <TyIcon name="settings" size={size.key === 'xs' ? '12' : size.key === 'sm' ? '14' : size.key === 'lg' ? '18' : size.key === 'xl' ? '20' : '16'} />
                    With Icon
                  </TyButton>

                  <TyButton
                    size={size.key as any}
                    flavor="neutral"
                    onClick={() => handleClick(`size-neutral-${size.key}`)}
                    className="border-2 border-dashed ty-border hover:ty-border-primary hover:ty-text-primary transition-all duration-200"
                  >
                    Neutral Style
                  </TyButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive States Section */}
      <div className="ty-content rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            ⚡ Interactive States
          </h2>
          <p className="text-sm ty-text-">
            Buttons with dynamic states and interactions enhanced with Tailwind animations
          </p>
        </div>

        <div className="ty-elevated p-5 rounded-lg border ty-border-">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Loading States */}
            <div className="ty-floating p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4">Loading States</h3>
              <div className="space-y-3">
                <TyButton
                  flavor="primary"
                  onClick={() => handleClick('loading-primary', 'loading')}
                  disabled={loadingStates['loading-primary']}
                  className={`w-full flex items-center justify-center gap-2 ${loadingStates['loading-primary'] ? 'cursor-not-allowed' : 'hover:shadow-lg'
                    } transition-all duration-200`}
                >
                  {loadingStates['loading-primary'] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    'Click to Load'
                  )}
                </TyButton>

                <TyButton
                  flavor="success"
                  onClick={() => handleClick('loading-success', 'loading')}
                  disabled={loadingStates['loading-success']}
                  className={`w-full flex items-center justify-center gap-2 ${loadingStates['loading-success'] ? 'cursor-not-allowed' : 'hover:shadow-lg'
                    } transition-all duration-200`}
                >
                  {loadingStates['loading-success'] ? (
                    <>
                      <TyIcon name="upload" size="16" className="animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <TyIcon name="save" size="16" />
                      Save Data
                    </>
                  )}
                </TyButton>
              </div>
            </div>

            {/* Icon Combinations */}
            <div className="ty-floating p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4">Icon Combinations</h3>
              <div className="space-y-3">
                <TyButton
                  flavor="primary"
                  onClick={() => handleClick('icon-left')}
                  className="w-full flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-200"
                >
                  <TyIcon name="download" size="16" />
                  Download
                </TyButton>

                <TyButton
                  flavor="secondary"
                  onClick={() => handleClick('icon-right')}
                  className="w-full flex items-center justify-center gap-2 group hover:shadow-lg transition-all duration-200"
                >
                  Upload
                  <TyIcon name="upload" size="16" className="group-hover:translate-y-0.5 transition-transform duration-200" />
                </TyButton>

                <TyButton
                  flavor="neutral"
                  onClick={() => handleClick('icon-only')}
                  title="Settings"
                  className="w-full p-3 hover:ty-bg-primary- transition-colors duration-200"
                >
                  <TyIcon name="settings" size="16" className="mx-auto" />
                </TyButton>
              </div>
            </div>

            {/* Action Groups */}
            <div className="ty-floating p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4">Action Groups</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <TyButton
                    flavor="success"
                    size="sm"
                    onClick={() => handleClick('approve')}
                    className="flex-1 flex items-center justify-center gap-1.5 hover:shadow-md transition-shadow duration-200"
                  >
                    <TyIcon name="check" size="14" />
                    Approve
                  </TyButton>

                  <TyButton
                    flavor="danger"
                    size="sm"
                    onClick={() => handleClick('reject')}
                    className="flex-1 flex items-center justify-center gap-1.5 hover:shadow-md transition-shadow duration-200"
                  >
                    <TyIcon name="x" size="14" />
                    Reject
                  </TyButton>
                </div>

                <TyButton
                  flavor="neutral"
                  size="sm"
                  onClick={() => handleClick('edit')}
                  className="w-full flex items-center justify-center gap-2 border ty-border hover:ty-border-primary hover:ty-text-primary transition-all duration-200"
                >
                  <TyIcon name="edit" size="14" />
                  Edit
                </TyButton>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Real-World Examples Section */}
      <div className="ty-content rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            🎯 Real-World Examples
          </h2>
          <p className="text-sm ty-text-">
            Common button patterns and use cases with Tailwind styling
          </p>
        </div>

        <div className="ty-elevated p-5 rounded-lg border ty-border-">
          <div className="space-y-6">

            {/* Form Actions */}
            <div className="ty-floating p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4">Form Actions</h3>
              <div className="flex flex-wrap gap-3 justify-end items-center">
                <TyButton
                  flavor="neutral"
                  onClick={() => handleClick('cancel')}
                  className="hover:ty-bg-primary- transition-colors duration-200"
                >
                  Cancel
                </TyButton>
                <TyButton
                  flavor="secondary"
                  onClick={() => handleClick('draft')}
                  className="flex items-center gap-2 hover:shadow-md transition-shadow duration-200"
                >
                  <TyIcon name="save" size="16" />
                  Save Draft
                </TyButton>
                <TyButton
                  flavor="primary"
                  onClick={() => handleClick('submit')}
                  className="flex items-center gap-2 hover:shadow-lg transition-shadow duration-200"
                >
                  <TyIcon name="check" size="16" />
                  Submit
                </TyButton>
              </div>
            </div>

            {/* Toolbar Actions */}
            <div className="ty-floating p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4">Toolbar Actions</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <TyButton
                  flavor="neutral"
                  size="sm"
                  onClick={() => handleClick('new')}
                  className="flex items-center gap-1.5 hover:ty-bg-primary- hover:ty-text-primary transition-colors duration-200"
                >
                  <TyIcon name="plus" size="14" />
                  New
                </TyButton>
                <TyButton
                  flavor="neutral"
                  size="sm"
                  onClick={() => handleClick('edit-toolbar')}
                  className="p-2 hover:ty-bg-primary- transition-colors duration-200"
                >
                  <TyIcon name="edit" size="14" />
                </TyButton>
                <TyButton
                  flavor="neutral"
                  size="sm"
                  onClick={() => handleClick('delete-toolbar')}
                  className="p-2 hover:ty-bg-danger- hover:ty-text-danger transition-colors duration-200"
                >
                  <TyIcon name="trash-2" size="14" />
                </TyButton>
                <div className="w-px h-5 ty-bg-primary mx-1" />
                <TyButton
                  flavor="neutral"
                  size="sm"
                  onClick={() => handleClick('filter')}
                  className="flex items-center gap-1.5 hover:ty-bg-primary- transition-colors duration-200"
                >
                  <TyIcon name="filter" size="14" />
                  Filter
                </TyButton>
                <TyButton
                  flavor="neutral"
                  size="sm"
                  onClick={() => handleClick('search')}
                  className="flex items-center gap-1.5 hover:ty-bg-primary- transition-colors duration-200"
                >
                  <TyIcon name="search" size="14" />
                  Search
                </TyButton>
              </div>
            </div>

            {/* CTA Section */}
            <div className="ty-floating p-8 rounded-lg text-center ty-bg-primary-">
              <h3 className="text-xl font-semibold ty-text++ mb-2">Call-to-Action Section</h3>
              <p className="ty-text- mb-6 max-w-md mx-auto">
                Large buttons for primary actions and hero sections with gradient backgrounds
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <TyButton
                  flavor="primary"
                  size="xl"
                  onClick={() => handleClick('cta-primary')}
                  className="flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <TyIcon name="rocket" size="20" />
                  Get Started Free
                </TyButton>
                <TyButton
                  flavor="secondary"
                  size="lg"
                  onClick={() => handleClick('cta-secondary')}
                  className="flex items-center gap-2 hover:shadow-lg transition-shadow duration-200"
                >
                  <TyIcon name="play" size="18" />
                  Watch Demo
                </TyButton>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Usage Code Section */}
      <div className="ty-content rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            💻 Usage Code with Tailwind
          </h2>
          <p className="text-sm ty-text-">
            Copy and paste examples for your React components with Tailwind enhancements
          </p>
        </div>

        <div className="ty-elevated p-5 rounded-lg border ty-border-">
          <div className="space-y-4">
            <div className="ty-floating p-4 rounded-lg">
              <h4 className="ty-text+ font-medium mb-3">Basic Button with Tailwind</h4>
              <div className="ty-bg-primary++ ty-text-- p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <pre>{`import { TyButton, TyIcon } from 'tyrell-react'

<TyButton 
  flavor="primary" 
  size="md"
  onClick={() => console.log('Clicked!')}
  className="hover:shadow-lg transition-shadow duration-200"
>
  Click Me
</TyButton>`}</pre>
              </div>
            </div>

            <div className="ty-floating p-4 rounded-lg">
              <h4 className="ty-text+ font-medium mb-3">Button with Icon & Animation</h4>
              <div className="ty-bg-primary++ ty-text-- p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <pre>{`<TyButton 
  flavor="success" 
  onClick={handleSave}
  className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
>
  <TyIcon name="save" size="16" />
  Save Changes
</TyButton>`}</pre>
              </div>
            </div>

            <div className="ty-floating p-4 rounded-lg">
              <h4 className="ty-text+ font-medium mb-3">Loading State with Spinner</h4>
              <div className="ty-bg-primary++ ty-text-- p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <pre>{`const [loading, setLoading] = useState(false)

<TyButton 
  flavor="primary"
  disabled={loading}
  onClick={async () => {
    setLoading(true)
    await saveData()
    setLoading(false)
  }}
  className={\`flex items-center gap-2 \${
    loading ? 'cursor-not-allowed' : 'hover:shadow-lg'
  } transition-all duration-200\`}
>
  {loading ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</TyButton>`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
