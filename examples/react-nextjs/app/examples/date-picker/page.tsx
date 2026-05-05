'use client'

import { useState, useEffect, useRef } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import { TyButton, TyDatePicker, type TyDatePickerEventDetail } from 'tyrell-react'

export default function DatePickerExample() {
  const [mounted, setMounted] = useState(false)

  // Test 1: Controlled component with state
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [localDisplay, setLocalDisplay] = useState<string>('')

  // Test 2: With time
  const [appointmentTime, setAppointmentTime] = useState<string>('2024-09-21T08:30:00.000Z')

  // Test 3: Form integration
  const [formData, setFormData] = useState({
    eventDate: '',
    startTime: '2024-09-21T10:30:00.000Z',
    endTime: ''
  })

  // Test 4: Rapid updates test
  const [rapidDate, setRapidDate] = useState<string>('')
  const rapidIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Test 5: Edge cases
  const [edgeCaseDate, setEdgeCaseDate] = useState<string>('')
  const [parseTestValue, setParseTestValue] = useState<string>('')

  // Performance monitoring
  const [changeCount, setChangeCount] = useState(0)
  const [lastChangeSource, setLastChangeSource] = useState<string>('')
  const [eventLog, setEventLog] = useState<Array<{ time: string, type: string, value: string }>>([])

  // Count renders without causing re-renders
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  useEffect(() => {
    setMounted(true)
    return () => {
      if (rapidIntervalRef.current) {
        clearInterval(rapidIntervalRef.current)
      }
    }
  }, [])

  // Log events helper
  const logEvent = (type: string, value: string) => {
    const time = new Date().toLocaleTimeString()
    setEventLog(prev => [...prev.slice(-9), { time, type, value }])
  }

  // Handler for controlled date picker
  const handleDateChange = (e: CustomEvent<TyDatePickerEventDetail>) => {
    const { value, formatted, source } = e.detail

    console.log('Date changed:', {
      utcValue: value,
      localFormatted: formatted,
      source
    })

    logEvent('change', `${source}: ${value}`)

    // Update state with UTC value
    if (value !== selectedDate) {  // Prevent unnecessary updates
      setSelectedDate(value || '')
      setLocalDisplay(formatted || '')

      // Track changes to detect infinite loops
      setChangeCount(prev => prev + 1)
      setLastChangeSource(source)
    }
  }

  // Handler for appointment time
  const handleAppointmentChange = (e: CustomEvent<TyDatePickerEventDetail>) => {
    const { value, source } = e.detail

    // Only update if actually changed to prevent infinite loops
    if (value !== appointmentTime) {
      setAppointmentTime(value || '')
      logEvent('appointment', `${source}: ${value}`)
    }
  }

  // Form field handlers
  const handleFormFieldChange = (field: string) => (e: CustomEvent<TyDatePickerEventDetail>) => {
    const { value } = e.detail

    setFormData(prev => {
      if (prev[field as keyof typeof prev] !== value) {
        logEvent('form', `${field}: ${value}`)
        return {
          ...prev,
          [field]: value || ''
        }
      }
      return prev
    })
  }

  // Programmatic value setting tests
  const setTodayUTC = () => {
    const now = new Date()
    const utcString = now.toISOString()
    setSelectedDate(utcString)
    logEvent('programmatic', `Set today: ${utcString}`)
  }

  const setSpecificLocalTime = () => {
    // Set a specific local time (10:30 AM on Sept 22, 2024)
    const date = new Date(2024, 8, 22, 10, 30) // Month is 0-indexed
    setAppointmentTime(date.toISOString())
    logEvent('programmatic', `Set specific: ${date.toISOString()}`)
  }

  const clearDates = () => {
    setSelectedDate('')
    setAppointmentTime('')
    setFormData({
      eventDate: '',
      startTime: '',
      endTime: ''
    })
    setRapidDate('')
    setEdgeCaseDate('')
    logEvent('clear', 'All dates cleared')
  }

  // Rapid update test
  const startRapidUpdates = () => {
    let counter = 0
    rapidIntervalRef.current = setInterval(() => {
      const date = new Date()
      date.setDate(date.getDate() + counter)
      setRapidDate(date.toISOString())
      counter++
      if (counter > 10) {
        if (rapidIntervalRef.current) {
          clearInterval(rapidIntervalRef.current)
          rapidIntervalRef.current = null
        }
      }
    }, 500)
    logEvent('rapid', 'Started rapid updates')
  }

  const stopRapidUpdates = () => {
    if (rapidIntervalRef.current) {
      clearInterval(rapidIntervalRef.current)
      rapidIntervalRef.current = null
      logEvent('rapid', 'Stopped rapid updates')
    }
  }

  // Edge case tests
  const edgeCaseTests = [
    { label: 'Midnight UTC', value: '2024-01-01T00:00:00.000Z' },
    { label: 'End of year', value: '2023-12-31T23:59:59.999Z' },
    { label: 'Leap day', value: '2024-02-29T12:00:00.000Z' },
    { label: 'DST transition (Spring)', value: '2024-03-10T07:00:00.000Z' },
    { label: 'DST transition (Fall)', value: '2024-11-03T06:00:00.000Z' },
    { label: 'Unix epoch', value: '1970-01-01T00:00:00.000Z' },
    { label: 'Y2K', value: '2000-01-01T00:00:00.000Z' },
    { label: 'Far future', value: '2099-12-31T23:59:59.999Z' },
  ]

  // Parse test inputs
  const parseTestInputs = [
    { label: 'ISO with Z', value: '2024-09-21T08:30:00Z' },
    { label: 'ISO with ms', value: '2024-09-21T08:30:00.123Z' },
    { label: 'Datetime-local', value: '2024-09-21T10:30' },
    { label: 'Date only', value: '2024-09-21' },
    { label: 'With timezone', value: '2024-09-21T10:30:00+02:00' },
    { label: 'Invalid format', value: 'not-a-date' },
    { label: 'Empty string', value: '' },
    { label: 'Null string', value: 'null' },
  ]

  // Calculate timezone info
  const getTimezoneInfo = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const offsetHours = -offset / 60
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return {
      timezone,
      offset: offsetHours,
      offsetString: offsetHours >= 0 ? `UTC+${offsetHours}` : `UTC${offsetHours}`
    }
  }

  const tzInfo = getTimezoneInfo()

  if (!mounted) {
    return (
      <AppLayout>
        <div className="p-8">Loading...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold ty-text++ mb-2">
            Date Picker React Integration - Extended Test Suite
          </h1>
          <div className="ty-bg-info- ty-border-info border rounded-lg p-4 mb-6">
            <p className="ty-text-info font-semibold mb-1">System Information:</p>
            <p className="ty-text-info text-sm">
              Timezone: {tzInfo.timezone} ({tzInfo.offsetString})
            </p>
            <p className="ty-text-info text-sm">
              Current UTC: {new Date().toISOString()}
            </p>
            <p className="ty-text-info text-sm">
              Current Local: {new Date().toLocaleString()}
            </p>
            <p className="ty-text-info text-sm mt-2">
              Render count: {renderCountRef.current} | Change events: {changeCount} | Last source: {lastChangeSource}
            </p>
          </div>
        </div>

        {/* Event Log */}
        <section className="ty-elevated rounded-lg p-4">
          <h3 className="text-lg font-semibold ty-text+ mb-2">Event Log (Last 10)</h3>
          <div className="ty-bg-neutral- rounded p-3 h-32 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="ty-text- text-sm">No events yet...</p>
            ) : (
              <div className="space-y-1">
                {eventLog.map((log, i) => (
                  <div key={i} className="text-xs font-mono ty-text-">
                    <span className="ty-text--">{log.time}</span>{' '}
                    <span className="ty-text-primary">[{log.type}]</span>{' '}
                    <span>{log.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <TyButton size="sm" flavor="secondary" onClick={() => setEventLog([])}>
            Clear Log
          </TyButton>
        </section>

        {/* Test 1: Controlled Component */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 1: Controlled Component (Date Only)
          </h2>

          <div className="space-y-4">
            <TyDatePicker
              label="Event Date"
              value={selectedDate}
              clearable
              onChange={handleDateChange}
            />

            <div className="ty-bg-neutral- rounded-lg p-4 space-y-2">
              <p className="text-sm ty-text-">
                <span className="font-semibold">UTC Value:</span>
              </p>
              <pre className="text-xs overflow-x-auto">{selectedDate || 'Not selected'}</pre>
              <p className="text-sm ty-text-">
                <span className="font-semibold">Local Display:</span> {localDisplay || 'Not selected'}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <TyButton onClick={setTodayUTC}>Set Today (UTC)</TyButton>
              <TyButton onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                setSelectedDate(tomorrow.toISOString())
              }}>Set Tomorrow</TyButton>
              <TyButton onClick={() => {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                setSelectedDate(nextWeek.toISOString())
              }}>Set Next Week</TyButton>
              <TyButton flavor="danger" onClick={() => setSelectedDate('')}>
                Clear
              </TyButton>
            </div>
          </div>
        </section>

        {/* Test 2: With Time */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 2: Date + Time Picker
          </h2>

          <div className="space-y-4">
            <TyDatePicker
              label="Appointment Time"
              with-time
              value={appointmentTime}
              clearable
              onChange={handleAppointmentChange}
            />

            <div className="ty-bg-neutral- rounded-lg p-4 space-y-2">
              <p className="text-sm ty-text-">
                <span className="font-semibold">UTC Value:</span>
              </p>
              <pre className="text-xs overflow-x-auto">{appointmentTime || 'Not selected'}</pre>
              {appointmentTime && (
                <>
                  <p className="text-sm ty-text-">
                    <span className="font-semibold">Local:</span>{' '}
                    {new Date(appointmentTime).toLocaleString()}
                  </p>
                  <p className="text-sm ty-text-">
                    <span className="font-semibold">Milliseconds:</span>{' '}
                    {new Date(appointmentTime).getTime()}
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <TyButton onClick={setSpecificLocalTime}>
                Set Sept 22, 10:30 AM (Local)
              </TyButton>
              <TyButton onClick={() => setAppointmentTime(new Date().toISOString())}>
                Set Now
              </TyButton>
              <TyButton onClick={() => {
                const inOneHour = new Date()
                inOneHour.setHours(inOneHour.getHours() + 1)
                setAppointmentTime(inOneHour.toISOString())
              }}>
                Set +1 Hour
              </TyButton>
              <TyButton flavor="danger" onClick={() => setAppointmentTime('')}>
                Clear
              </TyButton>
            </div>
          </div>
        </section>

        {/* Test 3: Rapid Updates */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 3: Rapid Updates (Stress Test)
          </h2>

          <div className="space-y-4">
            <TyDatePicker
              label="Rapid Update Test"
              withTime
              value={rapidDate}
              onChange={(e) => {
                setRapidDate(e.detail.value || '')
                logEvent('rapid-change', e.detail.value || 'cleared')
              }}
            />

            <div className="ty-bg-warning- ty-border-warning border rounded-lg p-4">
              <p className="ty-text-warning text-sm">
                This test rapidly updates the date value to check for performance issues and race conditions.
              </p>
            </div>

            <div className="flex gap-2">
              <TyButton onClick={startRapidUpdates} flavor="warning">
                Start Rapid Updates (10 changes)
              </TyButton>
              <TyButton onClick={stopRapidUpdates} flavor="danger">
                Stop Updates
              </TyButton>
            </div>
          </div>
        </section>

        {/* Test 4: Edge Cases */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 4: Edge Cases & Boundary Conditions
          </h2>

          <div className="space-y-4">
            <TyDatePicker
              label="Edge Case Testing"
              withTime
              value={edgeCaseDate}
              clearable
              onChange={(e) => {
                setEdgeCaseDate(e.detail.value || '')
                logEvent('edge-case', e.detail.value || 'cleared')
              }}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {edgeCaseTests.map(test => (
                <TyButton
                  key={test.label}
                  size="sm"
                  flavor="secondary"
                  onClick={() => {
                    setEdgeCaseDate(test.value)
                    logEvent('edge-case-set', test.label)
                  }}
                >
                  {test.label}
                </TyButton>
              ))}
            </div>

            {edgeCaseDate && (
              <div className="ty-bg-neutral- rounded-lg p-4 space-y-2">
                <p className="text-sm ty-text-">
                  <span className="font-semibold">UTC:</span> {edgeCaseDate}
                </p>
                <p className="text-sm ty-text-">
                  <span className="font-semibold">Local:</span> {new Date(edgeCaseDate).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Test 5: Parse Testing */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 5: Input Format Parsing
          </h2>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium ty-text+ mb-2">
                  Test Input (set programmatically)
                </label>
                <input
                  type="text"
                  className="ty-input w-full"
                  placeholder="Enter a date string to test..."
                  value={parseTestValue}
                  onChange={(e) => setParseTestValue(e.target.value)}
                />
              </div>

              <TyDatePicker
                label="Parse Test Result"
                withTime
                value={parseTestValue}
                clearable
                onChange={(e) => {
                  logEvent('parse-test', `${parseTestValue} → ${e.detail.value}`)
                }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {parseTestInputs.map(test => (
                <TyButton
                  key={test.label}
                  size="sm"
                  flavor="secondary"
                  onClick={() => {
                    setParseTestValue(test.value)
                    logEvent('parse-input', `${test.label}: ${test.value}`)
                  }}
                >
                  {test.label}
                </TyButton>
              ))}
            </div>
          </div>
        </section>

        {/* Test 6: Form Integration */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 6: Form Integration & Validation
          </h2>

          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const data = Object.fromEntries(formData.entries())
            console.log('Form submission:', data)
            logEvent('form-submit', JSON.stringify(data))
            alert('Check console and event log for form data')
          }}>
            <div className="grid md:grid-cols-2 gap-4">
              <TyDatePicker
                label="Event Date *"
                name="eventDate"
                value={formData.eventDate}
                required
                onChange={handleFormFieldChange('eventDate')}
              />

              <TyDatePicker
                label="Registration Opens"
                name="regOpen"
                withTime
                placeholder="Optional..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <TyDatePicker
                label="Start Time *"
                name="startTime"
                withTime
                value={formData.startTime}
                required
                onChange={handleFormFieldChange('startTime')}
              />

              <TyDatePicker
                label="End Time"
                name="endTime"
                withTime
                value={formData.endTime}
                onChange={handleFormFieldChange('endTime')}
              />
            </div>

            <div className="ty-bg-neutral- rounded-lg p-4">
              <p className="text-sm ty-text- font-semibold mb-2">Form State (Controlled Fields):</p>
              <pre className="text-xs overflow-x-auto">{JSON.stringify(formData, null, 2)}</pre>
            </div>

            <div className="flex gap-2">
              <TyButton type="submit">Submit Form</TyButton>
              <TyButton type="reset" flavor="secondary">
                Reset Form
              </TyButton>
              <TyButton type="button" flavor="danger" onClick={clearDates}>
                Clear All Dates
              </TyButton>
            </div>
          </form>
        </section>

        {/* Test 7: Different Sizes and Flavors */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 7: Visual Variants
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium ty-text+ mb-3">Sizes</h3>
              <div className="space-y-3">
                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
                  <TyDatePicker
                    key={size}
                    label={`Size: ${size}`}
                    size={size as any}
                    value="2024-09-21T08:30:00.000Z"
                    withTime
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium ty-text+ mb-3">Flavors</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'neutral'] as const).map(flavor => (
                  <TyDatePicker
                    key={flavor}
                    label={`Flavor: ${flavor}`}
                    flavor={flavor as any}
                    value="2024-09-21T08:30:00.000Z"
                    clearable
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Test 8: Accessibility and States */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 8: Time Input & Manipulation
          </h2>

          <div className="space-y-6">
            {/* Basic time input test */}
            <div>
              <h3 className="text-lg font-medium ty-text+ mb-3">Time Input Testing</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <TyDatePicker
                  label="Morning Appointment (with time)"
                  withTime
                  value="2024-09-21T09:00:00.000Z"
                  clearable
                  onChange={(e) => {
                    console.log('Time change:', e.detail)
                    logEvent('time-test', `${e.detail.source}: ${e.detail.value}`)
                  }}
                />

                <TyDatePicker
                  label="Afternoon Meeting (with time)"
                  withTime
                  value="2024-09-21T14:30:00.000Z"
                  clearable
                  onChange={(e) => {
                    logEvent('time-test', `${e.detail.source}: ${e.detail.value}`)
                  }}
                />
              </div>
            </div>

            {/* Specific time scenarios */}
            <div>
              <h3 className="text-lg font-medium ty-text+ mb-3">Time Edge Cases</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TyDatePicker
                  label="Midnight (00:00)"
                  withTime
                  value="2024-09-21T00:00:00.000Z"
                />

                <TyDatePicker
                  label="Noon (12:00)"
                  withTime
                  value="2024-09-21T12:00:00.000Z"
                />

                <TyDatePicker
                  label="End of Day (23:59)"
                  withTime
                  value="2024-09-21T23:59:00.000Z"
                />

                <TyDatePicker
                  label="Early Morning (03:45)"
                  withTime
                  value="2024-09-21T03:45:00.000Z"
                />

                <TyDatePicker
                  label="Business Hours (09:30)"
                  withTime
                  value="2024-09-21T09:30:00.000Z"
                />

                <TyDatePicker
                  label="Late Evening (21:15)"
                  withTime
                  value="2024-09-21T21:15:00.000Z"
                />
              </div>
            </div>

            {/* Interactive time setter */}
            <div>
              <h3 className="text-lg font-medium ty-text+ mb-3">Interactive Time Setting</h3>
              <div className="space-y-4">
                <TyDatePicker
                  label="Set Custom Time"
                  withTime
                  value={appointmentTime}
                  clearable
                  onChange={handleAppointmentChange}
                />

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  <TyButton
                    size="sm"
                    flavor="secondary"
                    onClick={() => {
                      const date = new Date()
                      date.setHours(0, 0, 0, 0)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-set', 'Midnight')
                    }}
                  >
                    00:00
                  </TyButton>

                  <TyButton
                    size="sm"
                    flavor="secondary"
                    onClick={() => {
                      const date = new Date()
                      date.setHours(6, 0, 0, 0)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-set', '6 AM')
                    }}
                  >
                    06:00
                  </TyButton>

                  <TyButton
                    size="sm"
                    flavor="secondary"
                    onClick={() => {
                      const date = new Date()
                      date.setHours(9, 0, 0, 0)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-set', '9 AM')
                    }}
                  >
                    09:00
                  </TyButton>

                  <TyButton
                    size="sm"
                    flavor="secondary"
                    onClick={() => {
                      const date = new Date()
                      date.setHours(12, 0, 0, 0)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-set', 'Noon')
                    }}
                  >
                    12:00
                  </TyButton>

                  <TyButton
                    size="sm"
                    flavor="secondary"
                    onClick={() => {
                      const date = new Date()
                      date.setHours(17, 0, 0, 0)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-set', '5 PM')
                    }}
                  >
                    17:00
                  </TyButton>

                  <TyButton
                    size="sm"
                    flavor="secondary"
                    onClick={() => {
                      const date = new Date()
                      date.setHours(23, 59, 0, 0)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-set', '23:59')
                    }}
                  >
                    23:59
                  </TyButton>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <TyButton
                    size="sm"
                    onClick={() => {
                      const date = new Date(appointmentTime || new Date())
                      date.setHours(date.getHours() + 1)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-adjust', '+1 hour')
                    }}
                  >
                    +1 Hour
                  </TyButton>

                  <TyButton
                    size="sm"
                    onClick={() => {
                      const date = new Date(appointmentTime || new Date())
                      date.setHours(date.getHours() - 1)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-adjust', '-1 hour')
                    }}
                  >
                    -1 Hour
                  </TyButton>

                  <TyButton
                    size="sm"
                    onClick={() => {
                      const date = new Date(appointmentTime || new Date())
                      date.setMinutes(date.getMinutes() + 15)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-adjust', '+15 min')
                    }}
                  >
                    +15 Min
                  </TyButton>

                  <TyButton
                    size="sm"
                    onClick={() => {
                      const date = new Date(appointmentTime || new Date())
                      date.setMinutes(date.getMinutes() - 15)
                      setAppointmentTime(date.toISOString())
                      logEvent('time-adjust', '-15 min')
                    }}
                  >
                    -15 Min
                  </TyButton>
                </div>

                {appointmentTime && (
                  <div className="ty-bg-neutral- rounded-lg p-4 space-y-2">
                    <p className="text-sm ty-text- font-semibold">Time Analysis:</p>
                    <div className="grid md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="ty-text--">UTC Time:</span>{' '}
                        <span className="font-mono">
                          {new Date(appointmentTime).toISOString().split('T')[1].split('.')[0]}
                        </span>
                      </div>
                      <div>
                        <span className="ty-text--">Local Time:</span>{' '}
                        <span className="font-mono">
                          {new Date(appointmentTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>
                        <span className="ty-text--">Hours (24h):</span>{' '}
                        <span className="font-mono">
                          {new Date(appointmentTime).getHours().toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <span className="ty-text--">Minutes:</span>{' '}
                        <span className="font-mono">
                          {new Date(appointmentTime).getMinutes().toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time zones comparison */}
            <div>
              <h3 className="text-lg font-medium ty-text+ mb-3">Timezone Comparison</h3>
              <p className="ty-text- text-sm mb-3">
                Same UTC time displayed in different contexts:
              </p>
              <div className="space-y-3">
                <TyDatePicker
                  label="UTC Reference (2024-09-21 15:30 UTC)"
                  withTime
                  value="2024-09-21T15:30:00.000Z"
                  disabled
                />

                <div className="ty-bg-neutral- rounded-lg p-4">
                  <p className="text-sm ty-text-">
                    This UTC time appears as:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm ty-text--">
                    <li>• New York (UTC-4): {new Date("2024-09-21T15:30:00.000Z").toLocaleString('en-US', { timeZone: 'America/New_York' })}</li>
                    <li>• London (UTC+1): {new Date("2024-09-21T15:30:00.000Z").toLocaleString('en-GB', { timeZone: 'Europe/London' })}</li>
                    <li>• Tokyo (UTC+9): {new Date("2024-09-21T15:30:00.000Z").toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</li>
                    <li>• Your local: {new Date("2024-09-21T15:30:00.000Z").toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Test 9: States & Accessibility */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Test 9: States & Accessibility
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <TyDatePicker
              label="Disabled State"
              value="2024-09-21T08:30:00.000Z"
              disabled
            />

            <TyDatePicker
              label="Required Field"
              required
              placeholder="This field is required..."
            />

            <TyDatePicker
              label="With Clear Button"
              value="2024-09-21T08:30:00.000Z"
              clearable
            />

            <TyDatePicker
              label="Custom Placeholder"
              placeholder="Select your birthday..."
            />

            <TyDatePicker
              label="Read-only Value"
              value="2024-09-21T08:30:00.000Z"
              disabled
              withTime
            />

            <TyDatePicker
              label="With Helper Text"
              placeholder="Choose a date"
            />
          </div>
        </section>

        {/* Performance Monitoring */}
        <section className="ty-elevated rounded-lg p-6">
          <h2 className="text-xl font-semibold ty-text+ mb-4">
            Performance Metrics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="ty-bg-neutral- rounded p-3">
              <p className="ty-text- text-xs">Total Renders</p>
              <p className="ty-text++ text-2xl font-bold">{renderCountRef.current}</p>
            </div>

            <div className="ty-bg-neutral- rounded p-3">
              <p className="ty-text- text-xs">Change Events</p>
              <p className="ty-text++ text-2xl font-bold">{changeCount}</p>
            </div>

            <div className="ty-bg-neutral- rounded p-3">
              <p className="ty-text- text-xs">Event Log Size</p>
              <p className="ty-text++ text-2xl font-bold">{eventLog.length}</p>
            </div>

            <div className="ty-bg-neutral- rounded p-3">
              <p className="ty-text- text-xs">Last Source</p>
              <p className="ty-text++ text-lg font-bold">{lastChangeSource || 'None'}</p>
            </div>
          </div>

          {(changeCount > 50 || renderCountRef.current > 100) && (
            <div className="ty-bg-danger- ty-border-danger border rounded-lg p-4 mt-4">
              <p className="ty-text-danger font-semibold">
                ⚠️ High activity detected
              </p>
              <p className="ty-text-danger text-sm mt-1">
                Consider refreshing if performance degrades.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
