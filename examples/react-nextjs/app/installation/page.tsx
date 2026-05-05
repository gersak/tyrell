'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '../../lib/app-layout'
import {
  TyButton,
  TyIcon,
} from 'tyrell-react'

export default function InstallationPage() {
  const [mounted, setMounted] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
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

  const installationSteps = [
    {
      icon: 'package',
      title: 'Install Packages',
      description: 'Add Tyrell Components to your project via npm/yarn/pnpm',
      status: 'success',
      action: 'Required'
    },
    {
      icon: 'download',
      title: 'Import CSS Styles',
      description: 'Include the CSS bundle in your project',
      status: 'info',
      action: 'Required'
    },
    {
      icon: 'star',
      title: 'Register Icons',
      description: 'Set up icon library for enhanced components',
      status: 'warning',
      action: 'Optional'
    },
    {
      icon: 'code',
      title: 'Use Components',
      description: 'Import and start using React components',
      status: 'primary',
      action: 'Start Building'
    }
  ]

  const codeExamples = [
    {
      id: 'npm-core',
      title: 'Core Package',
      description: 'Web components library',
      code: 'npm install tyrell-components'
    },
    {
      id: 'npm-react',
      title: 'React Wrapper',
      description: 'React integration package',
      code: 'npm install tyrell-react'
    },
    {
      id: 'npm-both',
      title: 'Both Packages',
      description: 'Install everything at once',
      code: 'npm install tyrell-components tyrell-react'
    },
    {
      id: 'yarn',
      title: 'Using Yarn',
      description: 'Alternative package manager',
      code: 'yarn add tyrell-components tyrell-react'
    },
    {
      id: 'pnpm',
      title: 'Using pnpm',
      description: 'Fast, disk efficient package manager',
      code: 'pnpm add tyrell-components tyrell-react'
    }
  ]

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 pb-4 border-b ty-border+">
        <h1 className="text-3xl font-bold mb-2 ty-text++">
          Installation & Setup
        </h1>
        <p className="text-base leading-relaxed ty-text-">
          Get started with Tyrell Components in your React or Next.js project in minutes.
          Follow this step-by-step guide to integrate powerful web components into your application.
        </p>
      </div>

      {/* Quick Overview */}
      <div className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            🚀 Quick Overview
          </h2>
          <p className="text-sm ty-text-">
            What you'll get with Tyrell Components integration
          </p>
        </div>

        <div className="ty-content p-5 rounded-lg border ty-border-">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg ty-bg-primary-">
              <TyIcon name="zap" size="32" className="ty-text-primary mx-auto mb-3" />
              <h3 className="ty-text+ font-medium mb-2">Fast Setup</h3>
              <p className="text-sm ty-text- leading-relaxed">
                Get running in under 5 minutes with simple npm install
              </p>
            </div>

            <div className="text-center p-4 rounded-lg ty-bg-success-">
              <TyIcon name="check-circle" size="32" className="ty-text-success mx-auto mb-3" />
              <h3 className="ty-text+ font-medium mb-2">TypeScript Ready</h3>
              <p className="text-sm ty-text- leading-relaxed">
                Full TypeScript support with comprehensive type definitions
              </p>
            </div>

            <div className="text-center p-4 rounded-lg ty-bg-warning-">
              <TyIcon name="palette" size="32" className="ty-text-warning mx-auto mb-3" />
              <h3 className="ty-text+ font-medium mb-2">Theme System</h3>
              <p className="text-sm ty-text- leading-relaxed">
                Built-in dark/light themes with CSS variables
              </p>
            </div>

            <div className="text-center p-4 rounded-lg ty-bg-info-">
              <TyIcon name="layers" size="32" className="ty-text-info mx-auto mb-3" />
              <h3 className="ty-text+ font-medium mb-2">Zero Dependencies</h3>
              <p className="text-sm ty-text- leading-relaxed">
                Pure web components with no runtime dependencies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Package Installation */}
      <div className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            📦 Package Installation
          </h2>
          <p className="text-sm ty-text-">
            Install the core packages to get started with Tyrell Components
          </p>
        </div>

        <div className="ty-content p-5 rounded-lg border ty-border-">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {codeExamples.map((example) => (
              <div key={example.id} className="ty-elevated p-4 rounded-lg border-l-4 ty-border-primary">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="ty-text+ font-medium">{example.title}</h3>
                  <TyButton
                    size="sm"
                    flavor="neutral"
                    onClick={() => copyToClipboard(example.code, example.id)}
                    className="flex items-center gap-2 hover:ty-bg-primary- transition-colors duration-200"
                  >
                    <TyIcon
                      name={copiedCode === example.id ? "check" : "copy"}
                      size="14"
                    />
                    {copiedCode === example.id ? 'Copied!' : 'Copy'}
                  </TyButton>
                </div>
                <p className="text-xs ty-text- mb-3">{example.description}</p>
                <div className="ty-bg-primary++ ty-text-- p-3 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono whitespace-nowrap">
                    {example.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            🎯 Setup Checklist
          </h2>
          <p className="text-sm ty-text-">
            Follow these steps to complete your Tyrell Components integration
          </p>
        </div>

        <div className="ty-content p-5 rounded-lg border ty-border-">
          <div className="space-y-4">
            {installationSteps.map((step, index) => {
              const bgClass = `ty-bg-${step.status}-`;
              const textClass = `ty-text-${step.status}`;

              return (
                <div key={index} className={`${bgClass} p-4 rounded-lg border ty-border-${step.status} hover:shadow-md transition-shadow duration-200`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 ${bgClass.replace('-', '+')} rounded-lg flex items-center justify-center`}>
                      <TyIcon name={step.icon as any} size="20" className={textClass} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`${textClass}+ font-medium`}>
                          Step {index + 1}: {step.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${textClass} ty-bg-${step.status}+ font-medium`}>
                          {step.action}
                        </span>
                      </div>
                      <p className="text-sm ty-text- leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CSS Integration */}
      <div className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            🎨 CSS Integration
          </h2>
          <p className="text-sm ty-text-">
            Import styles and configure your project
          </p>
        </div>

        <div className="ty-content p-5 rounded-lg border ty-border-">
          <div className="space-y-6">

            {/* Next.js Integration */}
            <div className="ty-elevated p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4 flex items-center gap-2">
                <TyIcon name="layers" size="20" />
                Next.js Integration
              </h3>
              <div className="space-y-3">
                <p className="text-sm ty-text- mb-3">
                  Add the CSS import to your main layout or _app.tsx file:
                </p>
                <div className="ty-bg-primary++ ty-text-- p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono">
                    {`// app/layout.tsx or pages/_app.tsx
import 'tyrell-components/dist/tyrell.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* React Integration */}
            <div className="ty-elevated p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4 flex items-center gap-2">
                <TyIcon name="code" size="20" />
                React Integration
              </h3>
              <div className="space-y-3">
                <p className="text-sm ty-text- mb-3">
                  Import CSS in your main entry point (index.tsx or App.tsx):
                </p>
                <div className="ty-bg-primary++ ty-text-- p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono">
                    {`// src/index.tsx or src/App.tsx
import 'tyrell-components/dist/tyrell.css'
import React from 'react'
import ReactDOM from 'react-dom/client'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)`}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Component Usage */}
      <div className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            💻 Component Usage
          </h2>
          <p className="text-sm ty-text-">
            Start using Tyrell Components in your React application
          </p>
        </div>

        <div className="ty-content p-5 rounded-lg border ty-border-">
          <div className="space-y-6">

            {/* Basic Usage */}
            <div className="ty-elevated p-5 rounded-lg">
              <h3 className="ty-text+ font-medium mb-4">Basic Component Usage</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Code Example */}
                <div>
                  <h4 className="ty-text+ font-medium mb-3">Import and Use</h4>
                  <div className="ty-bg-primary++ ty-text-- p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    <pre>
                      {`import { 
  TyButton, 
  TyInput, 
  TyIcon,
  TyModal 
} from 'tyrell-react'

export function MyComponent() {
  return (
    <div>
      <TyButton flavor="primary">
        <TyIcon name="star" size="16" />
        Click Me
      </TyButton>
      
      <TyInput 
        placeholder="Enter text..."
        onChange={(e) => console.log(e.detail.value)}
      />
    </div>
  )
}`}
                    </pre>
                  </div>
                </div>

                {/* Live Demo */}
                <div>
                  <h4 className="ty-text+ font-medium mb-3">Live Demo</h4>
                  <div className="ty-bg-primary- p-4 rounded-lg border ty-border">
                    <div className="space-y-3">
                      <TyButton flavor="primary" className="flex items-center gap-2">
                        <TyIcon name="star" size="16" />
                        Click Me
                      </TyButton>

                      <div className="ty-elevated p-3 rounded">
                        <p className="text-sm ty-text- mb-2">Interactive example:</p>
                        <TyButton
                          flavor="success"
                          size="sm"
                          onClick={() => alert('Tyrell Components working!')}
                          className="flex items-center gap-2"
                        >
                          <TyIcon name="check" size="14" />
                          Test Installation
                        </TyButton>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <div className="mb-5">
          <h2 className="text-xl font-semibold mb-1 ty-text++">
            🔧 Troubleshooting
          </h2>
          <p className="text-sm ty-text-">
            Common issues and their solutions
          </p>
        </div>

        <div className="ty-content p-5 rounded-lg border ty-border-">
          <div className="space-y-4">

            <div className="ty-elevated p-4 rounded-lg border-l-4 ty-border-warning">
              <h3 className="ty-text-warning+ font-medium mb-2 flex items-center gap-2">
                <TyIcon name="alert-triangle" size="18" />
                CSS Styles Not Loading
              </h3>
              <p className="text-sm ty-text- mb-2">
                If components appear unstyled, ensure you've imported the CSS file correctly:
              </p>
              <div className="ty-bg-warning- p-3 rounded text-sm font-mono">
                <code>import 'tyrell-components/dist/tyrell.css'</code>
              </div>
            </div>

            <div className="ty-elevated p-4 rounded-lg border-l-4 ty-border-info">
              <h3 className="ty-text-info+ font-medium mb-2 flex items-center gap-2">
                <TyIcon name="info" size="18" />
                TypeScript Errors
              </h3>
              <p className="text-sm ty-text- mb-2">
                Ensure you have the latest versions of both packages and restart your TypeScript server.
              </p>
            </div>

            <div className="ty-elevated p-4 rounded-lg border-l-4 ty-border-success">
              <h3 className="ty-text-success+ font-medium mb-2 flex items-center gap-2">
                <TyIcon name="help-circle" size="18" />
                Need More Help?
              </h3>
              <p className="text-sm ty-text-">
                Check the documentation or create an issue on our GitHub repository for additional support.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="ty-elevated rounded-xl p-6 mb-6 border ty-border ty-bg-primary-">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2 ty-text++">
            🎉 You're All Set!
          </h2>
          <p className="ty-text- max-w-2xl mx-auto">
            Tyrell Components are now installed and ready to use. Explore the component library
            to see what's available and start building amazing user interfaces.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <TyButton
            flavor="primary"
            size="lg"
            className="flex items-center gap-2 hover:shadow-lg transition-shadow duration-200"
          >
            <TyIcon name="book" size="18" />
            Browse Components
          </TyButton>

          <TyButton
            flavor="secondary"
            size="lg"
            className="flex items-center gap-2 hover:shadow-lg transition-shadow duration-200"
          >
            <TyIcon name="play" size="18" />
            View Examples
          </TyButton>

          <TyButton
            flavor="ghost"
            size="lg"
            className="flex items-center gap-2 hover:ty-bg-primary- transition-colors duration-200"
          >
            <TyIcon name="external-link" size="18" />
            GitHub Repo
          </TyButton>
        </div>
      </div>

    </AppLayout>
  )
}
