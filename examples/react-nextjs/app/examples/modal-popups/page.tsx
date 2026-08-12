'use client'

import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyButton,
  TyIcon,
  TyInput,
  TyTextarea,
  TyDropdown,
  TyOption,
  TyMultiselect,
  TyTag,
  TyModal,
  TyDatePicker,
  type TyModalRef,
} from 'tyrell-react'

/**
 * Regression test for the "child popup closes parent modal" bug.
 *
 * Bug: ty-dropdown, ty-multiselect, and ty-date-picker dispatch a
 * `CustomEvent('close', { bubbles: true, composed: true })` when their internal
 * popup closes. That bubbled `close` reached ty-modal's <dialog>.onclose
 * handler, which interpreted it as the modal closing and removed the `open`
 * attribute. Fixed in packages/core/src/components/modal.ts by guarding the
 * handler with `if (event.target !== dialog) return;`.
 *
 * Manual verification:
 *   1. Click "Open project modal".
 *   2. Inside the modal, click the priority Dropdown — pick an option. Modal
 *      should STAY OPEN. Event log below the page records each open/close.
 *   3. Click the assignees Multiselect — pick tags, click outside the popup,
 *      press ESC inside the search input. Modal stays open through all of it.
 *   4. Click the deadline DatePicker, navigate, pick a date. Modal stays open.
 *   5. Pressing ESC while no popup is open closes the modal (correct).
 *   6. Clicking the backdrop closes the modal (correct).
 */
export default function ModalPopupsTest() {
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<TyModalRef>(null)
  const [log, setLog] = useState<Array<{ ts: number; line: string }>>([])

  // Form state inside the modal — bound to verify React props still propagate
  // (this also indirectly exercises the boolean-prop fix from the React
  // wrappers, since `clearable` and `loading` etc. flip during testing).
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assignees, setAssignees] = useState<string[]>(['ada', 'linus'])
  const [tags, setTags] = useState<string[]>(['frontend'])
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => { setMounted(true) }, [])

  const push = (line: string) =>
    setLog(prev => [{ ts: Date.now(), line }, ...prev].slice(0, 50))

  if (!mounted) return null

  return (
    <AppLayout>
      <div className="mb-6 pb-4 border-b ty-border+">
        <h1 className="text-2xl font-bold mb-2 ty-text++">
          Modal × Dropdown × Multiselect — close-bubble regression
        </h1>
        <p className="text-sm ty-text- leading-relaxed">
          Verifies the fix in <code>packages/core/src/components/modal.ts</code>{' '}
          where bubbled <code>close</code> events from child popups
          (dropdown / multiselect / date-picker) no longer close the parent modal.
          Watch the event log — only your explicit modal interactions should
          produce <code>modal.close</code> entries.
        </p>
      </div>

      <div className="ty-elevated rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TyButton
            flavor="primary"
            onClick={() => {
              push('open modal (programmatic)')
              modalRef.current?.show()
            }}
          >
            <TyIcon name="plus" size="14" />
            Open project modal
          </TyButton>
          <TyButton
            flavor="neutral"
            onClick={() => setLog([])}
          >
            Clear log
          </TyButton>
        </div>
        <p className="text-xs ty-text-- leading-relaxed">
          Inside the modal: open dropdown → pick → modal must stay open.
          Open multiselect → pick / type / ESC → modal must stay open.
          Open date picker → navigate / pick → modal must stay open.
          The only thing that closes the modal is its own X button, backdrop,
          or ESC when no popup is open.
        </p>
      </div>

      {/* Event log */}
      <div className="ty-elevated rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold ty-text+">Event log</h2>
          <span className="text-xs ty-text--">{log.length} entries</span>
        </div>
        {log.length === 0 ? (
          <p className="text-sm ty-text-- italic">
            No events yet — click "Open project modal" and then interact with
            the popups inside.
          </p>
        ) : (
          <ul className="text-xs font-mono space-y-1 max-h-64 overflow-y-auto">
            {log.map((entry, i) => (
              <li
                key={i}
                className={[
                  'flex gap-3',
                  entry.line.startsWith('modal.close')
                    ? 'ty-text-danger+'
                    : entry.line.startsWith('modal.open') ||
                      entry.line === 'open modal (programmatic)'
                    ? 'ty-text-success+'
                    : 'ty-text-',
                ].join(' ')}
              >
                <span className="ty-text--">
                  {new Date(entry.ts).toLocaleTimeString('en-GB', {
                    hour12: false,
                  })}
                </span>
                <span className="flex-1">{entry.line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Current form state — verifies that React → web-component prop sync
          actually works while popups are interacted with. */}
      <div className="ty-content rounded-xl p-5 mb-6">
        <h2 className="font-semibold ty-text+ mb-3">Current form state</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="ty-text--">title</dt>
          <dd className="ty-text font-mono">{title || '(empty)'}</dd>
          <dt className="ty-text--">priority</dt>
          <dd className="ty-text font-mono">{priority}</dd>
          <dt className="ty-text--">assignees</dt>
          <dd className="ty-text font-mono">[{assignees.join(', ')}]</dd>
          <dt className="ty-text--">tags</dt>
          <dd className="ty-text font-mono">[{tags.join(', ')}]</dd>
          <dt className="ty-text--">deadline</dt>
          <dd className="ty-text font-mono">{deadline || '(empty)'}</dd>
          <dt className="ty-text--">notes</dt>
          <dd className="ty-text font-mono">
            {notes ? `"${notes.slice(0, 60)}${notes.length > 60 ? '…' : ''}"` : '(empty)'}
          </dd>
        </dl>
      </div>

      {/* The modal */}
      <TyModal
        ref={modalRef}
        onOpen={() => push('modal.open')}
        onClose={(e: any) => push(`modal.close (reason: ${e?.detail?.reason ?? '?'})`)}
        onBeforeClose={(e: any) => push(`modal.beforeclose (reason: ${e?.detail?.reason ?? '?'})`)}
      >
        <div
          className="ty-elevated rounded-lg flex flex-col overflow-hidden"
          style={{ width: 'min(38rem, 92vw)', maxHeight: '85vh' }}
        >
          <div className="px-6 py-5 border-b ty-border-soft">
            <h3 className="text-lg font-semibold ty-text++">Create project</h3>
            <p className="text-xs ty-text- mt-1">
              Pick an option in any field below — the modal must NOT close.
            </p>
          </div>

          <div className="px-6 py-5 overflow-y-auto flex-1">
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <TyInput
                name="title"
                label="Project name"
                placeholder="Eg. Q3 launch site"
                value={title}
                onChange={(e: any) => setTitle(e.detail.value || '')}
              />
              <TyDropdown
                name="priority"
                label="Priority"
                value={priority}
                onChange={(e: any) => {
                  const v = e.detail.option?.getAttribute('value') ?? ''
                  push(`dropdown.change: priority="${v}"`)
                  setPriority(v)
                }}
              >
                <TyOption value="low">Low</TyOption>
                <TyOption value="medium">Medium</TyOption>
                <TyOption value="high">High</TyOption>
                <TyOption value="urgent">Urgent</TyOption>
              </TyDropdown>
            </div>

            <div className="mt-4">
              <TyMultiselect
                name="assignees"
                label="Assignees"
                placeholder="Add team members…"
                value={assignees.join(',')}
                onChange={(e: any) => {
                  push(`multiselect.change: assignees=[${e.detail.values.join(',')}] action=${e.detail.action}`)
                  setAssignees(e.detail.values)
                }}
              >
                <TyTag value="ada"     size="sm" flavor="primary">Ada Lovelace</TyTag>
                <TyTag value="linus"   size="sm" flavor="primary">Linus Torvalds</TyTag>
                <TyTag value="grace"   size="sm" flavor="primary">Grace Hopper</TyTag>
                <TyTag value="rich"    size="sm" flavor="primary">Rich Hickey</TyTag>
                <TyTag value="alan"    size="sm" flavor="primary">Alan Kay</TyTag>
                <TyTag value="barbara" size="sm" flavor="primary">Barbara Liskov</TyTag>
              </TyMultiselect>
            </div>

            <div className="mt-4">
              <TyMultiselect
                name="tags"
                label="Tags"
                placeholder="Pick one or more…"
                value={tags.join(',')}
                onChange={(e: any) => {
                  push(`multiselect.change: tags=[${e.detail.values.join(',')}] action=${e.detail.action}`)
                  setTags(e.detail.values)
                }}
              >
                <TyTag value="frontend" size="sm" flavor="success" >frontend</TyTag>
                <TyTag value="backend"  size="sm" flavor="warning" >backend</TyTag>
                <TyTag value="design"   size="sm" flavor="neutral">design</TyTag>
                <TyTag value="infra"    size="sm" flavor="neutral" >infra</TyTag>
                <TyTag value="research" size="sm" flavor="primary" >research</TyTag>
              </TyMultiselect>
            </div>

            <div className="mt-4">
              <TyDatePicker
                name="deadline"
                label="Deadline"
                placeholder="Pick a date"
                value={deadline}
                clearable
                onChange={(e: any) => {
                  push(`datepicker.change: deadline="${e.detail.value ?? ''}"`)
                  setDeadline(e.detail.value ?? '')
                }}
              />
            </div>

            <div className="mt-4">
              <TyTextarea
                name="notes"
                label="Description"
                placeholder="What is this project about?"
                value={notes}
                minHeight="100px"
                maxHeight="220px"
                onChange={(e: any) => setNotes(e.detail.value || '')}
              />
            </div>
          </div>

          <div
            className="flex justify-end gap-2 px-6 py-4 border-t ty-border-soft"
            style={{ background: 'var(--ty-surface-content)' }}
          >
            <TyButton flavor="neutral" onClick={() => modalRef.current?.hide()}>
              Cancel
            </TyButton>
            <TyButton flavor="primary" onClick={() => modalRef.current?.hide()}>
              <TyIcon name="check" size="14" />
              Create project
            </TyButton>
          </div>
        </div>
      </TyModal>
    </AppLayout>
  )
}
