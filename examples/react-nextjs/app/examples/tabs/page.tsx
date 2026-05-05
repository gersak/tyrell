'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyTabs,
  TyTab,
  TyButton,
  TyIcon,
  TyInput,
  type TabChangeDetail,
} from 'tyrell-react'

interface ChangeLogEntry {
  ts: number
  activeId: string
  previousId: string | null
}

export default function TabsExample() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Bottom-placement tabs (uncontrolled)
  const [bottomActive, setBottomActive] = useState('details')

  if (!mounted) {
    return (
      <div className="ty-canvas flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin ty-text-primary mb-4"></div>
          <p className="ty-text-">Loading…</p>
        </div>
      </div>
    )
  }

  const handleTabChange = (event: CustomEvent<TabChangeDetail>) => {
    const { activeId, previousId } = event.detail
    setActiveTab(activeId)
    setChangeLog(prev => [
      { ts: Date.now(), activeId, previousId },
      ...prev,
    ].slice(0, 20))
    console.log('TyTabs onChange fired:', event.detail)
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="ty-text++ text-3xl font-bold flex items-center gap-3">
            <TyIcon name="layout" size="lg" />
            Tabs
          </h1>
          <p className="ty-text-">
            Verifies that <code className="ty-bg-neutral- px-1 rounded">TyTabs.onChange</code> fires
            (TC6 wiring fix — was previously listening for <code className="ty-bg-neutral- px-1 rounded">change</code>
            instead of <code className="ty-bg-neutral- px-1 rounded">ty-tab-change</code>).
          </p>
        </header>

        {/* Section 1: Controlled tabs with onChange */}
        <section className="ty-elevated rounded-xl p-6 space-y-4 border ty-border">
          <div className="flex items-center justify-between">
            <h2 className="ty-text+ text-xl font-semibold">Controlled tabs</h2>
            <span className="ty-bg-primary- ty-text-primary px-3 py-1 rounded text-sm font-mono">
              active: {activeTab}
            </span>
          </div>
          <p className="ty-text- text-sm">
            Switch tabs — the badge updates from React state and each change is logged below.
            If the log stays empty, the wrapper isn't dispatching properly.
          </p>

          <TyTabs active={activeTab} onChange={handleTabChange}>
            <TyTab id="overview" label="Overview">
              <div className="p-6 space-y-2">
                <h3 className="ty-text++ text-lg font-semibold">Overview tab</h3>
                <p className="ty-text">
                  This panel renders inside the first <code>TyTab</code>. The active state is fully
                  controlled via the <code>active</code> prop.
                </p>
              </div>
            </TyTab>

            <TyTab id="settings" label="Settings">
              <div className="p-6 space-y-3">
                <h3 className="ty-text++ text-lg font-semibold">Settings tab</h3>
                <TyInput label="Display name" placeholder="Your name" />
                <TyInput label="Email" type="email" placeholder="you@example.com" />
              </div>
            </TyTab>

            <TyTab id="activity" label="Activity">
              <div className="p-6 space-y-2">
                <h3 className="ty-text++ text-lg font-semibold">Activity tab</h3>
                <p className="ty-text-">No recent activity. Click around to generate some.</p>
                <TyButton flavor="primary" onClick={() => setActiveTab('overview')}>
                  <TyIcon slot="start" name="home" size="sm" />
                  Jump back to Overview
                </TyButton>
              </div>
            </TyTab>

            <TyTab id="advanced" label="Advanced" disabled>
              <div className="p-6">
                <p className="ty-text-">Disabled — should be unreachable.</p>
              </div>
            </TyTab>
          </TyTabs>
        </section>

        {/* Section 2: change log */}
        <section className="ty-elevated rounded-xl p-6 space-y-3 border ty-border">
          <div className="flex items-center justify-between">
            <h2 className="ty-text+ text-xl font-semibold">onChange log</h2>
            <TyButton appearance="outlined" onClick={() => setChangeLog([])}>
              <TyIcon slot="start" name="trash-2" size="sm" />
              Clear
            </TyButton>
          </div>
          {changeLog.length === 0 ? (
            <p className="ty-text- italic">
              (No events yet — click the tabs above. If this stays empty after switching tabs, the
              <code className="ty-bg-neutral- px-1 rounded mx-1">onChange</code> wiring is broken.)
            </p>
          ) : (
            <ul className="space-y-2">
              {changeLog.map((entry, i) => (
                <li
                  key={`${entry.ts}-${i}`}
                  className="ty-content rounded p-3 font-mono text-sm flex justify-between gap-4 border ty-border-"
                >
                  <span className="ty-text-success">
                    {entry.previousId ?? '∅'} → {entry.activeId}
                  </span>
                  <span className="ty-text-- text-xs">
                    {new Date(entry.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Section 3: Bottom-placement variant */}
        <section className="ty-elevated rounded-xl p-6 space-y-4 border ty-border">
          <h2 className="ty-text+ text-xl font-semibold">Bottom placement</h2>
          <p className="ty-text- text-sm">
            <code>placement="bottom"</code> moves the tab strip below the panels.
          </p>

          <TyTabs
            active={bottomActive}
            placement="bottom"
            onChange={(e: CustomEvent<TabChangeDetail>) => setBottomActive(e.detail.activeId)}
          >
            <TyTab id="details" label="Details">
              <div className="p-6">
                <p className="ty-text">Details panel — selected: <strong>{bottomActive}</strong></p>
              </div>
            </TyTab>
            <TyTab id="files" label="Files">
              <div className="p-6">
                <p className="ty-text">Files panel — selected: <strong>{bottomActive}</strong></p>
              </div>
            </TyTab>
            <TyTab id="comments" label="Comments">
              <div className="p-6">
                <p className="ty-text">Comments panel — selected: <strong>{bottomActive}</strong></p>
              </div>
            </TyTab>
          </TyTabs>
        </section>
      </div>
    </AppLayout>
  )
}
