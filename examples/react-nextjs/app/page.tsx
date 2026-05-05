'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '../lib/app-layout'

// Import Tyrell React components
import {
  TyButton,
  TyInput,
  TyModal,
  TyIcon,
  TyDropdown,
  TyOption,
  type TyModalRef
} from 'tyrell-react'
import { useRef } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [dropdownValue, setDropdownValue] = useState('')
  const modalRef = useRef<TyModalRef>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (event: any) => {
    console.log('Input changed:', event.detail)
    setInputValue(event.detail.value || '')
  }

  const handleDropdownChange = (event: any) => {
    console.log('Dropdown changed:', event.detail)
    setDropdownValue(event.detail.option?.textContent || '')
  }

  const handleButtonClick = () => {
    console.log('Button clicked!')
    modalRef.current?.show()
  }

  const closeModal = () => {
    modalRef.current?.hide()
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen surface-elevated">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin ty-text-primary mb-4"></div>
          <p className="text-neutral-ty-base">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      {/* Page Header - Using Tailwind + Ty */}
      <div className="mb-8 pb-4 border-b ty-border+">
        <h1 className="text-3xl font-bold mb-2 ty-text++">
          Tyrell Components + React + Next.js Examples
        </h1>
        <p className="text-base leading-relaxed ty-text-">
          Explore comprehensive examples demonstrating Tyrell Components working seamlessly with React,
          Next.js, and Tailwind CSS. Each example showcases real-world patterns, proper integration
          techniques, and the power of modern web component architecture.
        </p>
      </div>

      {/* Integration Status Section */}
      <div className="surface-content rounded-xl p-6 mb-6 border ty-border ty-shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            🎉 Integration Status
          </h2>
          <p className="text-sm text-neutral-ty-base">
            Verify that all packages and systems are working correctly with Tailwind CSS
          </p>
        </div>

        <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="flex items-center text-success-ty-strong font-medium">
                <TyIcon name="check-circle" size="20" className="mr-2" />
                tyrell-components Package
              </h3>
              <p className="text-sm text-neutral-ty-base">
                Core web components library loaded from CDN
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center text-success-ty-strong font-medium">
                <TyIcon name="check-circle" size="20" className="mr-2" />
                tyrell-react Package
              </h3>
              <p className="text-sm text-neutral-ty-base">
                React wrapper components with TypeScript support
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center text-success-ty-strong font-medium">
                <TyIcon name="check-circle" size="20" className="mr-2" />
                Tailwind CSS Integration
              </h3>
              <p className="text-sm text-neutral-ty-base">
                Utility-first styling with Ty semantic variables
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="flex items-center text-success-ty-strong font-medium">
                <TyIcon name="check-circle" size="20" className="mr-2" />
                Theme System
              </h3>
              <p className="text-sm text-neutral-ty-base">
                Dark/light mode with CSS variables + Tailwind
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Component Tests Section */}
      <div className="surface-content rounded-xl p-6 mb-6 border ty-border shadow-ty-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 text-neutral-ty-strong">
            🧪 Quick Component Tests
          </h2>
          <p className="text-sm text-neutral-ty-base">
            Interactive examples to verify core functionality with Tailwind styling
          </p>
        </div>

        <div className="space-y-6">
          {/* Button Test */}
          <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
            <h3 className="mb-3 text-neutral-ty-strong font-medium">
              TyButton - Interactive Actions
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <TyButton onClick={handleButtonClick} flavor="primary" className="flex items-center gap-2">
                <TyIcon name="square" size="16" />
                Open Modal
              </TyButton>
              <TyButton onClick={() => alert('Secondary action!')} flavor="secondary" size="sm">
                Secondary
              </TyButton>
              <TyButton onClick={() => alert('Success action!')} flavor="success" size="sm" className="flex items-center gap-1.5">
                <TyIcon name="check" size="16" />
                Success
              </TyButton>
              <TyButton onClick={() => alert('Danger action!')} flavor="danger" size="sm" className="flex items-center gap-1.5">
                <TyIcon name="x" size="16" />
                Danger
              </TyButton>
            </div>
          </div>

          {/* Input Test */}
          <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
            <h3 className="mb-3 text-neutral-ty-strong font-medium">
              TyInput - Value Binding & Events
            </h3>
            <div className="max-w-md">
              <TyInput
                placeholder="Type something to test..."
                value={inputValue}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="mt-2 text-sm text-neutral-ty-base">
                Current value: <span className="font-medium text-primary-ty-base">{inputValue || '(empty)'}</span>
              </p>
            </div>
          </div>

          {/* Dropdown Test */}
          <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
            <h3 className="mb-3 text-neutral-ty-strong font-medium">
              TyDropdown - Selection Events
            </h3>
            <div className="max-w-xs">
              <TyDropdown onChange={handleDropdownChange} placeholder="Choose an option...">
                <TyOption value="react">React Integration</TyOption>
                <TyOption value="nextjs">Next.js Compatibility</TyOption>
                <TyOption value="typescript">TypeScript Support</TyOption>
                <TyOption value="tailwind">Tailwind CSS Integration</TyOption>
                <TyOption value="theming">Theme System</TyOption>
              </TyDropdown>
              <p className="mt-2 text-sm text-neutral-ty-base">
                Selected: <span className="font-medium text-primary-ty-base">{dropdownValue || '(none)'}</span>
              </p>
            </div>
          </div>

          {/* Icons Test */}
          <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
            <h3 className="mb-3 text-neutral-ty-strong font-medium">
              TyIcon - Size Variants & Colors
            </h3>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <TyIcon name="home" size="16" />
                <TyIcon name="home" size="20" />
                <TyIcon name="home" size="24" />
                <TyIcon name="home" size="32" />
                <span className="text-xs text-neutral-ty-soft ml-2">Sizes</span>
              </div>
              <div className="flex items-center gap-2">
                <TyIcon name="star" size="24" className="text-primary-ty-base" />
                <TyIcon name="heart" size="24" className="text-danger-ty-base" />
                <TyIcon name="check-circle" size="24" className="text-success-ty-base" />
                <TyIcon name="info" size="24" className="text-info-ty-base" />
                <span className="text-xs text-neutral-ty-soft ml-2">Colors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme System Demonstration */}
      <div className="surface-content rounded-xl p-6 mb-6 border ty-border shadow-ty-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 text-neutral-ty-strong">
            🎨 Theme System + Tailwind Demonstration
          </h2>
          <p className="text-sm text-neutral-ty-base">
            The theme toggle in the header demonstrates Ty's semantic CSS variable system working seamlessly with Tailwind utilities
          </p>
        </div>

        <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg surface-content border ty-border">
              <h4 className="ty-text++ mb-2 font-medium">Primary Strong</h4>
              <p className="text-primary-ty-base text-sm mb-1">Primary Base</p>
              <p className="ty-text- text-xs">Primary Soft</p>
            </div>

            <div className="p-4 rounded-lg bg-semantic-success border border-success-ty-base">
              <h4 className="text-success-ty-strong mb-2 font-medium">Success State</h4>
              <p className="text-success-ty-base text-sm">Success message content</p>
            </div>

            <div className="p-4 rounded-lg bg-semantic-warning border border-warning-ty-base">
              <h4 className="text-warning-ty-strong mb-2 font-medium">Warning State</h4>
              <p className="text-warning-ty-base text-sm">Warning message content</p>
            </div>

            <div className="p-4 rounded-lg bg-semantic-danger border border-danger-ty-base">
              <h4 className="text-danger-ty-strong mb-2 font-medium">Danger State</h4>
              <p className="text-danger-ty-base text-sm">Error message content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind + Ty Integration Showcase */}
      <div className="surface-content rounded-xl p-6 mb-6 border ty-border shadow-ty-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 text-neutral-ty-strong">
            ⚡ Tailwind + Ty Integration Showcase
          </h2>
          <p className="text-sm text-neutral-ty-base">
            Examples showing the power of combining Tailwind's utility classes with Ty's semantic design system
          </p>
        </div>

        <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Responsive Card Example */}
            <div className="ty-bg-primary+ p-6 rounded-xl border ty-border-primary transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 ty-bg-primary rounded-lg flex items-center justify-center mr-4">
                  <TyIcon name="layers" size="24" className="ty-warning+" />
                </div>
                <div>
                  <h3 className="font-semibold ty-text-primary">Responsive Design</h3>
                  <p className="text-xs ty-text-primary+">Grid + Flexbox</p>
                </div>
              </div>
              <p className="text-sm ty-text leading-relaxed">
                Tailwind's responsive utilities combined with Ty's semantic colors create beautiful, adaptive interfaces.
              </p>
            </div>

            {/* Animation Example */}
            <div className="bg-gradient-to-br p-6 rounded-xl border ty-border+ group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 ty-bg-success rounded-lg flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                  <TyIcon name="zap" size="24" />
                </div>
                <div>
                  <h3 className="font-semibold text-success-ty-strong">Smooth Animations</h3>
                  <p className="text-xs text-success-ty-base">CSS Transitions</p>
                </div>
              </div>
              <p className="text-sm ty-text-success+ leading-relaxed">
                Tailwind's animation utilities work seamlessly with Ty components for smooth interactions.
              </p>
            </div>

            {/* Utility Classes Example */}
            <div className="bg-gradient-to-br p-6 rounded-xl border ty-border+ relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 ty-bg-neutral- rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              <div className="flex items-center mb-4 relative z-10">
                <div className="w-12 h-12 ty-bg-neutral rounded-lg flex items-center justify-center mr-4">
                  <TyIcon name="code" size="24" />
                </div>
                <div>
                  <h3 className="font-semibold text-info-ty-strong">Utility First</h3>
                  <p className="text-xs text-info-ty-base">Fast Development</p>
                </div>
              </div>
              <p className="text-sm ty-text+ leading-relaxed relative z-10">
                Build complex layouts quickly using Tailwind utilities while maintaining semantic meaning through Ty.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Example Previews Section */}
      <div className="surface-content rounded-xl p-6 mb-6 border ty-border shadow-ty-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 text-neutral-ty-strong">
            🎯 Interactive Examples
          </h2>
          <p className="text-sm text-neutral-ty-base">
            Complete, real-world examples demonstrating Tyrell Components in production-ready applications
          </p>
        </div>

        <div className="p-5 rounded-lg my-4 surface-elevated border ty-border-">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Contact Form Example */}
            <div className="p-6 rounded-lg ty-bg-primary- border ty-border-primary hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <TyIcon name="mail" size="24" className="ty-text-primary mr-3" />
                <div>
                  <h3 className="font-semibold ty-text-primary++">Contact Form</h3>
                  <span className="text-xs ty-bg-success ty-text-success+ px-2 py-1 rounded">Available</span>
                </div>
              </div>
              <p className="text-sm ty-text-primary mb-4 leading-relaxed">
                Complete contact form with real-time validation, multiple input types,
                dropdown selections, form state management, and success/error handling.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyInput</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyDropdown</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyButton</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyModal</span>
              </div>
              <TyButton
                onClick={() => window.location.href = '/examples/contact-form'}
                flavor="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                <TyIcon name="arrow-right" size="14" />
                View Example
              </TyButton>
            </div>

            {/* Data Dashboard Example */}
            <div className="p-6 rounded-lg ty-bg-info- border ty-border-info hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <TyIcon name="monitor" size="24" className="ty-text-info mr-3" />
                <div>
                  <h3 className="font-semibold ty-text-info++">Data Dashboard</h3>
                  <span className="text-xs ty-bg-success ty-text-success+ px-2 py-1 rounded">Available</span>
                </div>
              </div>
              <p className="text-sm ty-text-info mb-4 leading-relaxed">
                Interactive dashboard with TyCalendar custom day content rendering, data visualization,
                filtering controls, and responsive analytics with real-time updates.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyCalendar</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyDropdown</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyMultiselect</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyButton</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyModal</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyTag</span>
              </div>
              <TyButton
                onClick={() => window.location.href = '/examples/dashboard'}
                flavor="info"
                size="sm"
                className="flex items-center gap-2"
              >
                <TyIcon name="arrow-right" size="14" />
                View Example
              </TyButton>
            </div>

            {/* User Profile Example */}
            <div className="p-6 rounded-lg ty-bg-success- border ty-border-success hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <TyIcon name="user" size="24" className="ty-text-success mr-3" />
                <div>
                  <h3 className="font-semibold ty-text-success++">User Profile</h3>
                  <span className="text-xs ty-bg-warning ty-text-warning+ px-2 py-1 rounded">Coming Soon</span>
                </div>
              </div>
              <p className="text-sm ty-text-success mb-4 leading-relaxed">
                Complete user profile interface with avatar upload, form tabs,
                settings management, and account preferences with live preview.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyInput</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyTag</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyTooltip</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyModal</span>
              </div>
              <TyButton
                disabled
                flavor="neutral"
                size="sm"
                className="flex items-center gap-2"
              >
                <TyIcon name="clock" size="14" />
                In Development
              </TyButton>
            </div>

            {/* Settings Panel Example */}
            <div className="p-6 rounded-lg ty-bg-secondary- border ty-border-secondary hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <TyIcon name="settings" size="24" className="ty-text-secondary mr-3" />
                <div>
                  <h3 className="font-semibold ty-text-secondary++">Settings Panel</h3>
                  <span className="text-xs ty-bg-success ty-text-success+ px-2 py-1 rounded">Available</span>
                </div>
              </div>
              <p className="text-sm ty-text-secondary mb-4 leading-relaxed">
                Comprehensive settings interface with theme controls, notifications,
                privacy options, and advanced configuration with instant feedback.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyDropdown</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyInput</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyTooltip</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyPopup</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyModal</span>
                <span className="text-xs ty-bg-neutral- ty-text-neutral+ px-2 py-1 rounded">TyTag</span>
              </div>
              <TyButton
                onClick={() => window.location.href = '/examples/settings'}
                flavor="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <TyIcon name="arrow-right" size="14" />
                View Example
              </TyButton>
            </div>

          </div>
        </div>
      </div>

      {/* Modal Component */}
      <TyModal ref={modalRef}>
        <div className="p-6 text-center">
          <TyIcon name="check-circle" size="48" className="ty-success mb-4 mx-auto" />
          <h2 className="mb-3 text-neutral-ty-strong text-xl font-semibold">
            🎉 Modal Test Successful!
          </h2>
          <p className="mb-5 text-neutral-ty-base leading-relaxed max-w-md mx-auto">
            This modal demonstrates React ref integration with Ty components, enhanced with
            Tailwind utility classes for responsive and beautiful styling. The modal component
            exposes imperative methods for programmatic control.
          </p>
          <div className="flex gap-3 justify-center">
            <TyButton onClick={closeModal} flavor="primary" className="flex items-center gap-2">
              <TyIcon name="check" size="16" />
              Got it!
            </TyButton>
            <TyButton onClick={closeModal} flavor="neutral">
              Close
            </TyButton>
          </div>
        </div>
      </TyModal>
    </AppLayout>
  )
}
