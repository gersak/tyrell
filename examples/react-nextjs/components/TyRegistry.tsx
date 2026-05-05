'use client'

import { useEffect } from 'react'

// tyrell-components's component modules extend HTMLElement at top level, which
// doesn't exist on the server. Even 'use client' isn't enough — Next.js
// still evaluates client components on the server for initial HTML.
//
// Dynamic import inside useEffect runs only in the browser. After it
// resolves, customElements.define() has run for every <ty-*> and the
// browser upgrades any already-rendered elements.
export function TyRegistry() {
  useEffect(() => {
    import('tyrell-components')
  }, [])
  return null
}
