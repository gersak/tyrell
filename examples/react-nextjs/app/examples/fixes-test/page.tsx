'use client'

import { useState, useRef } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyTag,
  TyButton,
  TyModal,
  TyInput,
  TyDropdown,
  TyMultiselect,
  TyTextarea,
  TyOption,
  type TyModalRef,
} from 'tyrell-react'

// ─── Tag state for dismissible test ───────────────────────────────────────────
const INITIAL_TAGS = [
  { id: '1', label: 'React', color: '#3b82f6' },
  { id: '2', label: 'TypeScript', color: '#8b5cf6' },
  { id: '3', label: 'Web Components', color: '#10b981' },
]

export default function FixesTestPage() {
  // Modal test
  const modalRef = useRef<TyModalRef>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCloseLog, setModalCloseLog] = useState<string[]>([])

  // Tag tests
  const [clickLog, setClickLog] = useState<string[]>([])
  const [tags, setTags] = useState(INITIAL_TAGS)

  // Input custom style test
  const [inputVal, setInputVal] = useState('')
  const [textareaVal, setTextareaVal] = useState('')
  const [dropdownVal, setDropdownVal] = useState('')
  const [multiselectVal, setMultiselectVal] = useState<string[]>([])

  function log(setter: React.Dispatch<React.SetStateAction<string[]>>, msg: string) {
    setter(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev.slice(0, 4)])
  }

  return (
    <AppLayout>
      <div className="mb-8 pb-4 border-b ty-border+">
        <h1 className="text-3xl font-bold mb-2 ty-text++">Fixes Test Page</h1>
        <p className="ty-text-">Verifying: tag custom colors, tag events, modal onClose, button/input CSS vars</p>
      </div>

      {/* ── 1. TyTag custom colors ─────────────────────────────────────────── */}
      <section className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <h2 className="text-lg font-semibold mb-4 ty-text++">1. TyTag — custom colors via CSS vars</h2>
        <p className="text-sm ty-text- mb-4">
          No flavor set. Colors come from <code>--tag-color</code>, <code>--tag-bg</code>, <code>--tag-border-color</code>.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <TyTag style={{ '--tag-color': '#e53e3e', '--tag-border-color': '#e53e3e' }}>
            12 / 12
          </TyTag>
          <TyTag style={{ '--tag-color': '#3b82f6', '--tag-border-color': '#3b82f6' }}>
            Custom Blue
          </TyTag>
          <TyTag style={{ '--tag-bg': '#fef3c7', '--tag-color': '#92400e', '--tag-border-color': '#f59e0b' }}>
            Custom Amber
          </TyTag>
          <TyTag style={{ '--tag-bg': '#1e1b4b', '--tag-color': '#a5b4fc', '--tag-border-color': '#6366f1' }}>
            Dark Indigo
          </TyTag>
          {/* Standard flavors should still work */}
          <TyTag flavor="primary">Primary flavor</TyTag>
          <TyTag flavor="danger">Danger flavor</TyTag>
        </div>
      </section>

      {/* ── 2. TyTag events ────────────────────────────────────────────────── */}
      <section className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <h2 className="text-lg font-semibold mb-4 ty-text++">2. TyTag — onClick &amp; onTagDismiss events</h2>
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <TyTag
            clickable
            value="clickable-tag"
            flavor="primary"
            onClick={(e: any) => log(setClickLog, `onClick fired — value: ${(e as CustomEvent).detail?.target?.getAttribute('value') ?? 'n/a'}`)}
          >
            Click me
          </TyTag>

          {tags.map(tag => (
            <TyTag
              key={tag.id}
              dismissible
              style={{ '--tag-color': tag.color, '--tag-border-color': tag.color } as any}
              onTagDismiss={() => {
                log(setClickLog, `onTagDismiss fired — "${tag.label}" removed`)
                setTags(prev => prev.filter(t => t.id !== tag.id))
              }}
            >
              {tag.label}
            </TyTag>
          ))}

          {tags.length === 0 && (
            <button
              className="text-sm ty-text- underline"
              onClick={() => setTags(INITIAL_TAGS)}
            >
              Reset tags
            </button>
          )}
        </div>
        <EventLog entries={clickLog} label="Tag event log" />
      </section>

      {/* ── 3. TyModal onClose ─────────────────────────────────────────────── */}
      <section className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <h2 className="text-lg font-semibold mb-4 ty-text++">3. TyModal — onClose syncs React state</h2>
        <p className="text-sm ty-text- mb-4">
          Controlled modal: backdrop click disabled, only X and ESC fire <code>onClose</code> and update state.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <TyButton flavor="primary" onClick={() => setModalOpen(true)}>
            Open modal (controlled)
          </TyButton>
          <span className="text-sm ty-text-">
            State: <strong>{modalOpen ? 'open' : 'closed'}</strong>
          </span>
        </div>

        <TyModal
          open={modalOpen}
          closeOnOutsideClick={false}
          onClose={(e: any) => {
            setModalOpen(false)
            log(setModalCloseLog, `onClose fired — reason: ${(e as CustomEvent).detail?.reason ?? 'unknown'}`)
          }}
        >
          <div className="ty-floating p-6 rounded-xl max-w-sm">
            <h3 className="font-semibold mb-3 ty-text++">Modal is open</h3>
            <p className="ty-text- mb-4 text-sm">Close via X or ESC — backdrop click is disabled (React controlled).</p>
            <TyButton flavor="neutral" onClick={() => setModalOpen(false)}>Close from React</TyButton>
          </div>
        </TyModal>

        {/* Imperative ref test */}
        <div className="flex items-center gap-4 mt-4 mb-4">
          <TyButton flavor="secondary" onClick={() => modalRef.current?.show()}>
            Open modal (imperative ref)
          </TyButton>
        </div>

        <TyModal
          ref={modalRef}
          onClose={(e: any) => log(setModalCloseLog, `ref modal onClose — reason: ${(e as CustomEvent).detail?.reason ?? 'unknown'}`)}
        >
          <div className="ty-floating p-6 rounded-xl max-w-sm">
            <h3 className="font-semibold mb-3 ty-text++">Imperative ref modal</h3>
            <p className="ty-text- mb-4 text-sm">Opened via <code>modalRef.current?.show()</code></p>
            <TyButton flavor="neutral" onClick={() => modalRef.current?.hide()}>Close</TyButton>
          </div>
        </TyModal>

        <EventLog entries={modalCloseLog} label="Modal event log" />
      </section>

      {/* ── 4. TyButton custom CSS vars ────────────────────────────────────── */}
      <section className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <h2 className="text-lg font-semibold mb-4 ty-text++">4. TyButton — custom CSS vars</h2>
        <p className="text-sm ty-text- mb-4">
          No flavor, colors set via <code>--ty-button-bg</code>, <code>--ty-button-color</code>, <code>--ty-button-border</code>.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <TyButton style={{ '--ty-button-bg': '#ff6600', '--ty-button-color': 'white', '--ty-button-border': '#cc5200', '--ty-button-bg-hover': '#cc5200' }}>
            Orange custom
          </TyButton>
          <TyButton appearance="outlined" style={{ '--ty-button-color': '#8b5cf6', '--ty-button-border': '#8b5cf6', '--ty-button-bg-hover': '#ede9fe' }}>
            Purple outlined
          </TyButton>
          <TyButton style={{ '--ty-button-bg': '#1e293b', '--ty-button-color': '#94a3b8', '--ty-button-border': '#334155', '--ty-button-bg-hover': '#334155' }}>
            Dark custom
          </TyButton>
          {/* Standard flavor still works */}
          <TyButton flavor="primary">Primary flavor</TyButton>
        </div>
      </section>

      {/* ── 5. Input components custom CSS vars ────────────────────────────── */}
      <section className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <h2 className="text-lg font-semibold mb-4 ty-text++">5. Input components — custom CSS vars</h2>
        <p className="text-sm ty-text- mb-4">
          All four inputs styled via <code>--input-bg</code>, <code>--input-border</code>, <code>--input-color</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs ty-text- mb-2 font-medium uppercase tracking-wide">TyInput</p>
            <TyInput
              label="Custom styled input"
              placeholder="Type here..."
              value={inputVal}
              onChange={(e: any) => setInputVal(e.detail.value)}
              style={{ '--input-bg': '#fdf4ff', '--input-border': '#c084fc', '--input-color': '#7e22ce' }}
            />
          </div>

          <div>
            <p className="text-xs ty-text- mb-2 font-medium uppercase tracking-wide">TyTextarea</p>
            <TyTextarea
              label="Custom styled textarea"
              placeholder="Type here..."
              value={textareaVal}
              onChange={(e: any) => setTextareaVal(e.detail.value)}
              style={{ '--input-bg': '#fdf4ff', '--input-border': '#c084fc', '--input-color': '#7e22ce' }}
            />
          </div>

          <div>
            <p className="text-xs ty-text- mb-2 font-medium uppercase tracking-wide">TyDropdown</p>
            <TyDropdown
              label="Custom styled dropdown"
              placeholder="Select..."
              value={dropdownVal}
              onChange={(e: any) => setDropdownVal(e.detail.value)}
              style={{ '--input-bg': '#fdf4ff', '--input-border': '#c084fc', '--input-color': '#7e22ce' }}
            >
              <TyOption value="a">Option A</TyOption>
              <TyOption value="b">Option B</TyOption>
              <TyOption value="c">Option C</TyOption>
            </TyDropdown>
          </div>

          <div>
            <p className="text-xs ty-text- mb-2 font-medium uppercase tracking-wide">TyMultiselect</p>
            <TyMultiselect
              label="Custom styled multiselect"
              placeholder="Select..."
              value={multiselectVal}
              onChange={(e: any) => setMultiselectVal(e.detail.values ?? [])}
              style={{ '--input-bg': '#fdf4ff', '--input-border': '#c084fc', '--input-color': '#7e22ce' }}
            >
              <TyOption value="x">Item X</TyOption>
              <TyOption value="y">Item Y</TyOption>
              <TyOption value="z">Item Z</TyOption>
            </TyMultiselect>
          </div>
        </div>
      </section>

    </AppLayout>
  )
}

function EventLog({ entries, label }: { entries: string[]; label: string }) {
  if (entries.length === 0) return (
    <p className="text-xs ty-text- italic">{label}: no events yet</p>
  )
  return (
    <div className="ty-canvas rounded-lg p-3 font-mono text-xs space-y-1">
      {entries.map((e, i) => (
        <div key={i} className="ty-text-">{e}</div>
      ))}
    </div>
  )
}
