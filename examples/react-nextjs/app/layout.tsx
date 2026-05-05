import './globals.css'
// Bundler-only setup (TC6 sideEffects fix) — no script tag, no public/ty/ copy.
// tyrell-components CSS imported here in the Server Component (safe on the server).
import 'tyrell-components/css/tyrell.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '../lib/theme-provider'
import { TyRegistry } from '../components/TyRegistry'


export const metadata: Metadata = {
  title: 'Tyrell Components + React + Next.js Showcase',
  description: 'Comprehensive showcase of tyrell-components and tyrell-react packages with theme toggling, routing, and component examples',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TyRegistry />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
