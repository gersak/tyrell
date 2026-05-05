'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './theme-provider'
import {
  TyButton,
  TyIcon,
} from 'tyrell-react'

interface NavigationItem {
  name: string
  href: string
  icon: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigation: NavigationSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Getting Started', href: '/', icon: 'home' },
      { name: 'Installation', href: '/installation', icon: 'download' },
      { name: 'Theme System', href: '/theme', icon: 'palette' },
    ]
  },
  {
    title: 'Examples',
    items: [
      { name: 'Contact Form', href: '/examples/contact-form', icon: 'mail' },
      { name: 'Data Dashboard', href: '/examples/dashboard', icon: 'monitor' },
      { name: 'Settings Panel', href: '/examples/settings', icon: 'settings' },
      { name: 'Tabs', href: '/examples/tabs', icon: 'layout' },
      { name: 'Multiselect', href: '/examples/multiselect', icon: 'layers' },
    ]
  }
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeMobileSidebar = () => {
    setSidebarOpen(false)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen surface-canvas">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin text-primary-500 mb-4"></div>
          <p className="text-neutral-ty-base">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`
      min-h-screen grid transition-all duration-300
      ${sidebarCollapsed ? 'grid-cols-[var(--app-sidebar-collapsed-width)_1fr]' : 'grid-cols-[var(--app-sidebar-width)_1fr]'}
      grid-rows-[var(--app-header-height)_1fr]
      ${sidebarOpen ? 'sidebar-open' : ''}
    `}
      style={{
        gridTemplateAreas: sidebarOpen
          ? '"sidebar header" "sidebar main"'
          : '"sidebar header" "sidebar main"'
      }}>

      {/* Mobile overlay */}
      <div
        className={`
          md:hidden fixed inset-0 bg-black z-[15] transition-opacity duration-300
          ${sidebarOpen ? 'bg-opacity-50 opacity-100 pointer-events-auto' : 'bg-opacity-0 opacity-0 pointer-events-none'}
        `}
        onClick={closeMobileSidebar}
      />

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 z-10 surface-elevated border-b border-ty-base"
        style={{ gridArea: 'header', minHeight: 'var(--app-header-height)' }}
      >
        <div className="flex items-center gap-4">
          <TyButton
            flavor="ghost"
            size="sm"
            onClick={toggleMobileSidebar}
            className="md:hidden"
          >
            <TyIcon name="menu" size="20" />
          </TyButton>

          <TyButton
            flavor="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <TyIcon name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'} size="20" />
          </TyButton>

          <Link
            href="/"
            className="text-2xl font-semibold no-underline transition-colors duration-150 text-primary-ty-base hover:text-primary-ty-mild"
          >
            Ty + Tailwind Showcase
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <TyButton
            flavor="ghost"
            size="sm"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="relative flex items-center gap-2"
          >
            <TyIcon
              name={theme === 'light' ? 'sun' : 'moon'}
              size="20"
              className={`transition-transform duration-150 ${theme === 'light' ? 'text-warning-ty-base' : 'text-info-ty-base'
                }`}
            />
          </TyButton>

          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium bg-semantic-success">
            <TyIcon name="check-circle" size="12" />
            Components Loaded
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          overflow-y-auto transition-all duration-300 surface-content border-r border-ty-base
          md:relative md:translate-x-0 md:z-auto md:!top-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed z-20 bottom-0 left-0
        `}
        style={{
          gridArea: 'sidebar',
          width: sidebarCollapsed ? 'var(--app-sidebar-collapsed-width)' : 'var(--app-sidebar-width)',
          top: 'var(--app-header-height)'
        }}
      >
        <nav className="py-4">
          {navigation.map((section) => (
            <div key={section.title} className={`${sidebarCollapsed ? 'mb-2' : 'mb-6'}`}>
              <div className={`
                px-4 py-2 text-xs font-semibold uppercase tracking-wider mb-2 text-neutral-ty-soft transition-opacity duration-150
                ${sidebarCollapsed ? 'hidden' : 'opacity-100'}
              `}>
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center py-3 no-underline transition-all duration-150
                      ${sidebarCollapsed
                        ? 'justify-center w-full rounded-md mx-1 py-4'
                        : 'gap-3 px-4 border-l-4'}
                      ${isActive
                        ? sidebarCollapsed
                          ? 'ty-bg-primary text-primary++'
                          : 'ty-bg-primary border-l-primary-500 text-primary++'
                        : sidebarCollapsed
                          ? 'ty-text-neutral hover:ty-bg-neutral hover:ty-text++'
                          : 'border-l-transparent ty-text-neutral hover:ty-bg-neutral hover:ty-text++'
                      }
                    `}
                    onClick={closeMobileSidebar}
                  >
                    <TyIcon name={item.icon} className={`flex-shrink-0 ${sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    <span className={`
                      transition-opacity duration-150
                      ${sidebarCollapsed ? 'hidden' : 'opacity-100'}
                    `}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="overflow-auto surface-canvas p-6"
        style={{ gridArea: 'main' }}
      >
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
