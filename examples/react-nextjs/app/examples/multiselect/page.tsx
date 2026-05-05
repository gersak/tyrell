'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyMultiselect,
  TyTag,
  TyButton,
  TyIcon,
  type TyMultiselectEventDetail,
} from 'tyrell-react'

interface ChangeEntry {
  ts: number
  mode: 'internal' | 'external'
  values: string[]
  action: 'add' | 'remove'
  item: string
}

interface SearchEntry {
  ts: number
  query: string
}

const ALL_OPTIONS = [
  { value: 'react',     label: 'React' },
  { value: 'vue',       label: 'Vue' },
  { value: 'svelte',    label: 'Svelte' },
  { value: 'angular',   label: 'Angular' },
  { value: 'solid',     label: 'Solid' },
  { value: 'qwik',      label: 'Qwik' },
  { value: 'preact',    label: 'Preact' },
  { value: 'lit',       label: 'Lit' },
  { value: 'htmx',      label: 'HTMX' },
  { value: 'alpine',    label: 'Alpine.js' },
  { value: 'reagent',   label: 'Reagent (CLJS)' },
  { value: 'replicant', label: 'Replicant (CLJS)' },
  { value: 'uix',       label: 'UIx (CLJS)' },
]

export default function MultiselectExample() {
  const [mounted, setMounted] = useState(false)

  // Internal-search demo state
  const [internalSelected, setInternalSelected] = useState<string[]>([])

  // External-search demo state
  const [externalSelected, setExternalSelected] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Logs (shared across both)
  const [changeLog, setChangeLog] = useState<ChangeEntry[]>([])
  const [searchLog, setSearchLog] = useState<SearchEntry[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // External-search filter: parent owns filtering, derived from searchQuery state
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return ALL_OPTIONS
    return ALL_OPTIONS.filter(o =>
      o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    )
  }, [searchQuery])

  if (!mounted) {
    return (
      <div className="ty-canvas flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin ty-text-primary mb-4" />
          <p className="ty-text-">Loading…</p>
        </div>
      </div>
    )
  }

  const handleInternalChange = (event: CustomEvent<TyMultiselectEventDetail>) => {
    const { values, action, item } = event.detail
    setInternalSelected(values)
    setChangeLog(prev => [
      { ts: Date.now(), mode: 'internal' as const, values, action, item },
      ...prev,
    ].slice(0, 30))
  }

  const handleExternalChange = (event: CustomEvent<TyMultiselectEventDetail>) => {
    const { values, action, item } = event.detail
    setExternalSelected(values)
    setChangeLog(prev => [
      { ts: Date.now(), mode: 'external' as const, values, action, item },
      ...prev,
    ].slice(0, 30))
  }

  const handleSearch = (event: CustomEvent<{ query: string; element: HTMLElement }>) => {
    const { query } = event.detail
    setSearchQuery(query)
    setSearchLog(prev => [{ ts: Date.now(), query }, ...prev].slice(0, 30))
    console.log('TyMultiselect onSearch:', event.detail)
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="ty-text++ text-3xl font-bold flex items-center gap-3">
            <TyIcon name="layers" size="lg" />
            Multiselect
          </h1>
          <p className="ty-text-">
            Two search modes. Default: the multiselect filters its own children client-side and never emits a
            <code className="ty-bg-neutral- px-1 rounded mx-1">search</code> event. Set
            <code className="ty-bg-neutral- px-1 rounded mx-1">externalSearch</code> to delegate filtering to the parent —
            then each keystroke fires <code className="ty-bg-neutral- px-1 rounded">onSearch</code>.
          </p>
        </header>

        {/* Mode 1: Internal (default) */}
        <section className="ty-elevated rounded-xl p-6 space-y-4 border ty-border">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="ty-text+ text-xl font-semibold flex items-center gap-2">
                Internal search
                <span className="ty-bg-info- ty-text-info++ px-2 py-0.5 rounded text-xs font-normal">default</span>
              </h2>
              <p className="ty-text- text-sm mt-1">
                Default mode — all options are provided as children, the component filters them itself.
                Typing only fires <code className="ty-bg-neutral- px-1 rounded">onChange</code> when an option is added/removed,
                never <code className="ty-bg-neutral- px-1 rounded">onSearch</code>.
              </p>
            </div>
            <span className="ty-bg-primary- ty-text-primary px-3 py-1 rounded text-sm font-mono whitespace-nowrap">
              [{internalSelected.join(', ')}]
            </span>
          </div>

          <TyMultiselect
            value={internalSelected}
            placeholder="Pick frameworks (filter built-in)…"
            label="Frameworks (internal search)"
            debounce={150}
            onChange={handleInternalChange}
            onSearch={handleSearch}
            style={{ minWidth: '320px' }}
          >
            {ALL_OPTIONS.map(opt => (
              <TyTag key={opt.value} value={opt.value} size="sm">
                {opt.label}
              </TyTag>
            ))}
          </TyMultiselect>
        </section>

        {/* Mode 2: External (server-side / parent-controlled) */}
        <section className="ty-elevated rounded-xl p-6 space-y-4 border ty-border">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="ty-text+ text-xl font-semibold flex items-center gap-2">
                External search
                <span className="ty-bg-warning- ty-text-warning++ px-2 py-0.5 rounded text-xs font-normal">
                  NEW prop: onSearch (TC6)
                </span>
              </h2>
              <p className="ty-text- text-sm mt-1">
                <code className="ty-bg-neutral- px-1 rounded">externalSearch</code> turns off built-in filtering. The component
                fires <code className="ty-bg-neutral- px-1 rounded">onSearch</code> on each keystroke (debounced by <code>debounce</code>),
                React filters <code>ALL_OPTIONS</code> itself, and the children re-render. This is what
                you'd use to talk to a server.
              </p>
            </div>
            <span className="ty-bg-primary- ty-text-primary px-3 py-1 rounded text-sm font-mono whitespace-nowrap">
              [{externalSelected.join(', ')}]
            </span>
          </div>

          <TyMultiselect
            value={externalSelected}
            placeholder="Pick frameworks (parent filters)…"
            label="Frameworks (external search)"
            externalSearch
            debounce={150}
            onChange={handleExternalChange}
            onSearch={handleSearch}
            style={{ minWidth: '320px' }}
          >
            {filteredOptions.map(opt => (
              <TyTag key={opt.value} value={opt.value} size="sm">
                {opt.label}
              </TyTag>
            ))}
          </TyMultiselect>

          <div className="ty-content rounded p-3 text-sm flex items-center gap-2 border ty-border-">
            <span className="ty-text-">React-side state:</span>
            <span className="font-mono ty-text">searchQuery = </span>
            <code className="ty-bg-neutral- ty-text-info+ px-2 py-0.5 rounded">
              {searchQuery ? `"${searchQuery}"` : '""'}
            </code>
            <span className="ty-text-- ml-auto">
              {filteredOptions.length} of {ALL_OPTIONS.length} options shown
            </span>
          </div>
        </section>

        {/* Change log */}
        <section className="ty-elevated rounded-xl p-6 space-y-3 border ty-border">
          <div className="flex items-center justify-between">
            <h2 className="ty-text+ text-xl font-semibold flex items-center gap-2">
              <TyIcon name="check-circle" size="sm" />
              onChange log
            </h2>
            <TyButton appearance="outlined" onClick={() => setChangeLog([])}>
              <TyIcon slot="start" name="trash-2" size="sm" />
              Clear
            </TyButton>
          </div>
          {changeLog.length === 0 ? (
            <p className="ty-text- italic">
              (No events — pick or remove tags in either multiselect.)
            </p>
          ) : (
            <ul className="space-y-2">
              {changeLog.map((e, i) => (
                <li
                  key={`${e.ts}-${i}`}
                  className="ty-content rounded p-3 font-mono text-sm flex justify-between gap-4 border ty-border-"
                >
                  <span className={e.action === 'add' ? 'ty-text-success' : 'ty-text-danger'}>
                    [{e.mode}] {e.action === 'add' ? '+ ' : '− '}{e.item}
                    <span className="ty-text-- ml-2">→ [{e.values.join(', ')}]</span>
                  </span>
                  <span className="ty-text-- text-xs">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Search log */}
        <section className="ty-elevated rounded-xl p-6 space-y-3 border ty-border">
          <div className="flex items-center justify-between">
            <h2 className="ty-text+ text-xl font-semibold flex items-center gap-2">
              <TyIcon name="search" size="sm" />
              onSearch log
              <span className="ty-bg-warning- ty-text-warning++ px-2 py-0.5 rounded text-xs font-normal">
                external mode only
              </span>
            </h2>
            <TyButton appearance="outlined" onClick={() => setSearchLog([])}>
              <TyIcon slot="start" name="trash-2" size="sm" />
              Clear
            </TyButton>
          </div>
          {searchLog.length === 0 ? (
            <p className="ty-text- italic">
              (Type into the <strong>External search</strong> multiselect above. The internal-search one
              never fires <code className="ty-bg-neutral- px-1 rounded mx-1">onSearch</code> — that's by design.)
            </p>
          ) : (
            <ul className="space-y-2">
              {searchLog.map((e, i) => (
                <li
                  key={`${e.ts}-${i}`}
                  className="ty-content rounded p-3 font-mono text-sm flex justify-between gap-4 border ty-border-"
                >
                  <span className="ty-text-info">
                    query: {e.query.length === 0 ? <em className="ty-text--">(empty)</em> : <strong>"{e.query}"</strong>}
                  </span>
                  <span className="ty-text-- text-xs">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
