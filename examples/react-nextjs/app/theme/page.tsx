'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '../../lib/app-layout'
import { useTheme } from '../../lib/theme-provider'
import {
  TyButton,
  TyIcon,
} from 'tyrell-react'

export default function ThemePage() {
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div>Loading...</div>

  const semanticColors = [
    { name: 'Primary', key: 'primary', description: 'Main brand color and primary actions' },
    { name: 'Secondary', key: 'secondary', description: 'Supporting brand color' },
    { name: 'Success', key: 'success', description: 'Positive states, confirmations' },
    { name: 'Danger', key: 'danger', description: 'Errors, critical states, destructive actions' },
    { name: 'Warning', key: 'warning', description: 'Caution, important notices' },
    { name: 'Info', key: 'info', description: 'Informational content' },
    { name: 'Neutral', key: 'neutral', description: 'Default, standard content' },
  ]

  const emphasisLevels = [
    { name: 'Strong', key: 'strong', description: 'Maximum emphasis - headers, critical text' },
    { name: 'Mild', key: 'mild', description: 'High emphasis - subheadings, important text' },
    { name: 'Base', key: '', description: 'Base emphasis - standard links, primary text' },
    { name: 'Soft', key: 'soft', description: 'Reduced emphasis - secondary text, descriptions' },
    { name: 'Faint', key: 'faint', description: 'Minimal emphasis - disabled text, fine print' },
  ]

  const surfaceTypes = [
    { name: 'Canvas', key: 'canvas', description: 'App background canvas', class: 'ty-canvas' },
    { name: 'Content', key: 'content', description: 'Main content areas', class: 'ty-content' },
    { name: 'Elevated', key: 'elevated', description: 'Cards, panels with elevation', class: 'ty-elevated' },
    { name: 'Floating', key: 'floating', description: 'Modals, dropdowns, tooltips', class: 'ty-floating' },
    { name: 'Input', key: 'input', description: 'Form controls', class: 'ty-input' },
  ]

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Theme System</h1>
        <p className="page-description">
          Explore Ty's semantic CSS variable system with automatic light/dark theme adaptation.
        </p>
      </div>

      <div className="component-section">
        <div className="section-header">
          <h2 className="section-title">🎨 Semantic Design Philosophy</h2>
          <p className="section-description">
            Ty uses semantic naming that expresses intent and meaning, not visual appearance
          </p>
        </div>

        <div className="component-demo">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="ty-elevated" style={{ padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--ty-color-success)' }}>
              <TyIcon name="check-circle" size="24" style={{ color: 'var(--ty-color-success)', marginBottom: '12px' }} />
              <h3 style={{ color: 'var(--ty-color-success-strong)', marginBottom: '8px' }}>✅ Semantic Names</h3>
              <p style={{ color: 'var(--ty-color-success)', fontSize: '14px', marginBottom: '8px' }}>
                <code>--ty-color-primary</code><br/>
                <code>--ty-color-danger</code><br/>
                <code>--ty-bg-success</code>
              </p>
              <p style={{ color: 'var(--ty-color-success-mild)', fontSize: '12px' }}>
                Express intent and meaning
              </p>
            </div>

            <div className="ty-elevated" style={{ padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--ty-color-danger)' }}>
              <TyIcon name="x-circle" size="24" style={{ color: 'var(--ty-color-danger)', marginBottom: '12px' }} />
              <h3 style={{ color: 'var(--ty-color-danger-strong)', marginBottom: '8px' }}>❌ Visual Names</h3>
              <p style={{ color: 'var(--ty-color-danger)', fontSize: '14px', marginBottom: '8px' }}>
                <code>--blue-500</code><br/>
                <code>--red-light</code><br/>
                <code>--gray-400</code>
              </p>
              <p style={{ color: 'var(--ty-color-danger-mild)', fontSize: '12px' }}>
                Meaningless without context
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="component-section">
        <div className="section-header">
          <h2 className="section-title">🌈 5-Variant Color System</h2>
          <p className="section-description">
            Each semantic color has 5 emphasis levels for precise control
          </p>
        </div>

        <div className="component-demo">
          <div style={{ display: 'grid', gap: '24px' }}>
            {semanticColors.map((color) => (
              <div key={color.key} className="ty-elevated" style={{ 
                padding: '20px', 
                borderRadius: '8px',
                borderLeft: `4px solid var(--ty-color-${color.key})`
              }}>
                <h3 style={{ 
                  color: `var(--ty-color-${color.key}-strong)`, 
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }}>
                  {color.name} Colors
                </h3>
                <p style={{ 
                  color: `var(--ty-color-${color.key})`, 
                  fontSize: '14px',
                  marginBottom: '16px' 
                }}>
                  {color.description}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {emphasisLevels.map((level) => {
                    const suffix = level.key ? `-${level.key}` : ''
                    const varName = `--ty-color-${color.key}${suffix}`
                    return (
                      <div key={level.key} className="ty-content" style={{ 
                        padding: '12px', 
                        borderRadius: '6px',
                        textAlign: 'center',
                        border: '1px solid var(--ty-border-soft)'
                      }}>
                        <div style={{ 
                          color: `var(${varName})`, 
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {level.name}
                        </div>
                        <div style={{ 
                          fontSize: '10px', 
                          color: 'var(--ty-color-neutral-soft)',
                          fontFamily: 'monospace'
                        }}>
                          {varName}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="component-section">
        <div className="section-header">
          <h2 className="section-title">🏗️ Surface System</h2>
          <p className="section-description">
            Semantic surfaces for consistent elevation and depth
          </p>
        </div>

        <div className="component-demo">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {surfaceTypes.map((surface) => (
              <div key={surface.key} className={surface.class} style={{ 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid var(--ty-border)',
                textAlign: 'center'
              }}>
                <h4 style={{ 
                  color: 'var(--ty-color-neutral-strong)', 
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }}>
                  {surface.name}
                </h4>
                <p style={{ 
                  fontSize: '12px', 
                  color: 'var(--ty-color-neutral)',
                  marginBottom: '8px'
                }}>
                  {surface.description}
                </p>
                <code style={{ 
                  fontSize: '10px', 
                  color: 'var(--ty-color-neutral-soft)',
                  backgroundColor: 'var(--ty-bg-neutral-soft)',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  .{surface.class}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="component-section">
        <div className="section-header">
          <h2 className="section-title">🌓 Theme Toggle Demo</h2>
          <p className="section-description">
            Test the automatic theme adaptation in real-time
          </p>
        </div>

        <div className="component-demo">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <TyButton onClick={toggleTheme} flavor="primary" size="lg">
              <TyIcon name={theme === 'light' ? 'moon' : 'sun'} size="20" style={{ marginRight: '8px' }} />
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
            </TyButton>
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--ty-color-neutral)' }}>
              Current theme: <strong style={{ color: 'var(--ty-color-primary)' }}>{theme}</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="ty-elevated" style={{ 
              padding: '16px', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--ty-color-primary)'
            }}>
              <h4 style={{ color: 'var(--ty-color-primary-strong)', marginBottom: '12px' }}>Emphasis Levels</h4>
              <div style={{ display: 'grid', gap: '4px' }}>
                <div style={{ color: 'var(--ty-color-primary-strong)', fontSize: '14px' }}>Strong emphasis</div>
                <div style={{ color: 'var(--ty-color-primary-mild)', fontSize: '14px' }}>Mild emphasis</div>
                <div style={{ color: 'var(--ty-color-primary)', fontSize: '14px' }}>Base emphasis</div>
                <div style={{ color: 'var(--ty-color-primary-soft)', fontSize: '14px' }}>Soft emphasis</div>
                <div style={{ color: 'var(--ty-color-primary-faint)', fontSize: '14px' }}>Faint emphasis</div>
              </div>
            </div>

            <div className="ty-elevated" style={{ 
              padding: '16px', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--ty-color-info)'
            }}>
              <h4 style={{ color: 'var(--ty-color-info-strong)', marginBottom: '12px' }}>Automatic Adaptation</h4>
              <p style={{ color: 'var(--ty-color-info)', fontSize: '14px', lineHeight: '1.4' }}>
                Colors automatically invert emphasis logic in dark mode for optimal contrast and readability.
              </p>
            </div>

            <div className="ty-elevated" style={{ 
              padding: '16px', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--ty-color-success)'
            }}>
              <h4 style={{ color: 'var(--ty-color-success-strong)', marginBottom: '12px' }}>Benefits</h4>
              <ul style={{ color: 'var(--ty-color-success)', fontSize: '14px', lineHeight: '1.4', paddingLeft: '16px' }}>
                <li>Maintainable design system</li>
                <li>Accessible contrast ratios</li>
                <li>Consistent theming</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="component-section">
        <div className="section-header">
          <h2 className="section-title">💡 Usage Guidelines</h2>
          <p className="section-description">
            Best practices for using Ty's theme system
          </p>
        </div>

        <div className="component-demo">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="ty-elevated" style={{ padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--ty-color-success)' }}>
              <h4 style={{ color: 'var(--ty-color-success-strong)', marginBottom: '12px' }}>✅ Recommended</h4>
              <ul style={{ color: 'var(--ty-color-neutral)', fontSize: '14px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Use semantic colors consistently</li>
                <li>Leverage the 5-variant emphasis system</li>
                <li>Test in both light and dark themes</li>
                <li>Prefer CSS variables over hardcoded colors</li>
              </ul>
            </div>

            <div className="ty-elevated" style={{ padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--ty-color-warning)' }}>
              <h4 style={{ color: 'var(--ty-color-warning-strong)', marginBottom: '12px' }}>⚠️ Avoid</h4>
              <ul style={{ color: 'var(--ty-color-neutral)', fontSize: '14px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Mixing competing semantic colors</li>
                <li>Using faint text on saturated backgrounds</li>
                <li>Ignoring theme adaptation</li>
                <li>Hardcoding color values</li>
              </ul>
            </div>

            <div className="ty-elevated" style={{ padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--ty-color-info)' }}>
              <h4 style={{ color: 'var(--ty-color-info-strong)', marginBottom: '12px' }}>💡 Pro Tips</h4>
              <ul style={{ color: 'var(--ty-color-neutral)', fontSize: '14px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Use .ty-elevated for content cards</li>
                <li>Apply .ty-floating for overlays</li>
                <li>Strong variants for headers</li>
                <li>Soft variants for helper text</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="component-section">
        <div className="section-header">
          <h2 className="section-title">🛠️ Code Examples</h2>
          <p className="section-description">
            Practical examples of using Ty's theme system
          </p>
        </div>

        <div className="component-demo">
          <div style={{ display: 'grid', gap: '20px' }}>
            <div className="ty-elevated" style={{ padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--ty-color-neutral-strong)', marginBottom: '12px' }}>CSS Variables</h4>
              <div className="code-block">
                <pre><code>{`.alert {
  background-color: var(--ty-bg-success-soft);
  border: 1px solid var(--ty-border-success);
  color: var(--ty-color-success-strong);
}

.button-primary {
  background-color: var(--ty-color-primary);
  color: var(--ty-surface-elevated);
}`}</code></pre>
              </div>
            </div>

            <div className="ty-elevated" style={{ padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--ty-color-neutral-strong)', marginBottom: '12px' }}>Surface Classes</h4>
              <div className="code-block">
                <pre><code>{`<!-- Card with elevation -->
<div className="ty-elevated">
  Card content
</div>

<!-- Modal overlay -->
<div className="ty-floating">
  Modal content
</div>

<!-- Form input -->
<input className="ty-input" />`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
