'use client'

import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyButton,
  TyCheckbox,
  TyRadio,
  TyRadioGroup,
  TySwitch,
} from 'tyrell-react'

// React 18 + custom-element checked bridging reproducer.
//
// The bug: when a controlled `checked` prop flips true → false, React 18 may
// fail to remove the underlying boolean attribute on a custom element. The
// React state says "false" but the visual sticks on "checked".
//
// This page lets you:
//   1. Click "Flip" to toggle React state.
//   2. Click "Probe DOM" to read the actual `.checked` property from the
//      live elements and compare against the React state.
//
// With the fix in place (TyCheckbox/TySwitch/TyRadio gated property-bridge),
// React state and DOM property should always agree.

export default function CheckedBridgeTestPage() {
  const [checked, setChecked] = useState(true)
  const [radioValue, setRadioValue] = useState<string>('a')
  const [autoToggle, setAutoToggle] = useState(false)
  const [probe, setProbe] = useState<{ label: string; reactSays: string; domSays: string }[]>([])

  const checkboxRef = useRef<HTMLElement>(null)
  const switchRef = useRef<HTMLElement>(null)
  const radioARef = useRef<HTMLElement>(null)
  const radioBRef = useRef<HTMLElement>(null)

  // Auto-flip every 600ms when enabled — makes desync visible at a glance.
  useEffect(() => {
    if (!autoToggle) return
    const id = setInterval(() => {
      setChecked(prev => !prev)
      setRadioValue(prev => (prev === 'a' ? 'b' : 'a'))
    }, 600)
    return () => clearInterval(id)
  }, [autoToggle])

  function probeDOM() {
    const next: typeof probe = []
    const cb = checkboxRef.current as any
    if (cb) next.push({
      label: 'TyCheckbox',
      reactSays: String(checked),
      domSays: `.checked=${cb.checked} hasAttr=${cb.hasAttribute('checked')}`,
    })
    const sw = switchRef.current as any
    if (sw) next.push({
      label: 'TySwitch',
      reactSays: String(checked),
      domSays: `.checked=${sw.checked} hasAttr=${sw.hasAttribute('checked')}`,
    })
    const ra = radioARef.current as any
    const rb = radioBRef.current as any
    if (ra && rb) {
      next.push({
        label: 'TyRadio (a)',
        reactSays: radioValue === 'a' ? 'true' : 'false',
        domSays: `.checked=${ra.checked} hasAttr=${ra.hasAttribute('checked')}`,
      })
      next.push({
        label: 'TyRadio (b)',
        reactSays: radioValue === 'b' ? 'true' : 'false',
        domSays: `.checked=${rb.checked} hasAttr=${rb.hasAttribute('checked')}`,
      })
    }
    setProbe(next)
  }

  return (
    <AppLayout>
      <div className="mb-8 pb-4 border-b ty-border+">
        <h1 className="text-3xl font-bold mb-2 ty-text++">React 18 Checked-Bridge Test</h1>
        <p className="ty-text-">
          Verifies that <code>checked</code> reliably flips both directions on TyCheckbox,
          TySwitch, and TyRadio under React 18.
        </p>
      </div>

      <section className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <TyButton flavor="primary" onClick={() => setChecked(prev => !prev)}>
            Flip checked (React state: {String(checked)})
          </TyButton>
          <TyButton flavor="secondary" onClick={() => setRadioValue(prev => (prev === 'a' ? 'b' : 'a'))}>
            Flip radio (selected: {radioValue})
          </TyButton>
          <TyButton
            flavor={autoToggle ? 'danger' : 'neutral'}
            onClick={() => setAutoToggle(prev => !prev)}
          >
            {autoToggle ? 'Stop auto-toggle' : 'Start auto-toggle (600ms)'}
          </TyButton>
          <TyButton flavor="success" onClick={probeDOM}>
            Probe DOM
          </TyButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs ty-text- mb-2 font-medium uppercase tracking-wide">TyCheckbox</p>
            <label className="flex items-center gap-2">
              <TyCheckbox ref={checkboxRef} checked={checked} />
              <span className="ty-text">Controlled checkbox</span>
            </label>
          </div>

          <div>
            <p className="text-xs ty-text- mb-2 font-medium uppercase tracking-wide">TySwitch</p>
            <label className="flex items-center gap-2">
              <TySwitch ref={switchRef} checked={checked} />
              <span className="ty-text">Controlled switch</span>
            </label>
          </div>

          <div>
            <p className="text-xs ty-text- mb-2 font-medium uppercase tracking-wide">TyRadio (standalone)</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <TyRadio ref={radioARef} value="a" checked={radioValue === 'a'} />
                <span className="ty-text">Option A</span>
              </label>
              <label className="flex items-center gap-2">
                <TyRadio ref={radioBRef} value="b" checked={radioValue === 'b'} />
                <span className="ty-text">Option B</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="ty-elevated rounded-xl p-6 mb-6 border ty-border">
        <h2 className="text-lg font-semibold mb-4 ty-text++">DOM probe</h2>
        <p className="text-sm ty-text- mb-4">
          Click <strong>Probe DOM</strong> after toggling. If the fix is working,
          <code> reactSays</code> and <code>domSays</code> should always agree.
        </p>
        {probe.length === 0 ? (
          <p className="text-xs ty-text- italic">No probe data yet — click "Probe DOM".</p>
        ) : (
          <div className="ty-canvas rounded-lg p-3 font-mono text-xs space-y-1">
            {probe.map((row, i) => {
              const reactBool = row.reactSays === 'true'
              const domBool = row.domSays.includes('.checked=true')
              const agree = reactBool === domBool
              return (
                <div key={i} className={agree ? 'ty-text-success' : 'ty-text-danger'}>
                  <strong>{row.label}</strong> — react: {row.reactSays} | dom: {row.domSays} {agree ? '✓' : '✗ DESYNC'}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </AppLayout>
  )
}
