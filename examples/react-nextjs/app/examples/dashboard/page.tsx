'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyButton,
  TyDropdown,
  TyOption,
  TyMultiselect,
  TyCalendar,
  TyIcon,
  TyTag,
  TyTooltip,
  TyModal,
  type TyModalRef
} from 'tyrell-react'

// Mock data types
interface DashboardData {
  totalUsers: number
  activeUsers: number
  revenue: number
  conversions: number
  activities: Activity[]
  metrics: DailyMetric[]
}

interface Activity {
  id: string
  type: 'signup' | 'purchase' | 'login' | 'feature_use' | 'support'
  date: string
  user: string
  amount?: number
  description: string
}

interface DailyMetric {
  date: string
  users: number
  revenue: number
  events: number
  conversions: number
}

// Generate mock data
const generateMockData = (): DashboardData => {
  const activities: Activity[] = []
  const metrics: DailyMetric[] = []

  // Generate data for the last 90 days
  const today = new Date()
  for (let i = 0; i < 90; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Generate activities for this date
    const numActivities = Math.floor(Math.random() * 8) + 1
    for (let j = 0; j < numActivities; j++) {
      const types = ['signup', 'purchase', 'login', 'feature_use', 'support'] as const
      const type = types[Math.floor(Math.random() * types.length)]

      activities.push({
        id: `${dateStr}-${j}`,
        type,
        date: dateStr,
        user: `user${Math.floor(Math.random() * 1000)}`,
        amount: type === 'purchase' ? Math.floor(Math.random() * 500) + 50 : undefined,
        description: generateActivityDescription(type)
      })
    }

    // Generate daily metrics
    metrics.push({
      date: dateStr,
      users: Math.floor(Math.random() * 150) + 50,
      revenue: Math.floor(Math.random() * 3000) + 500,
      events: numActivities,
      conversions: Math.floor(Math.random() * 20) + 5
    })
  }

  return {
    totalUsers: 12847,
    activeUsers: 8932,
    revenue: 284530,
    conversions: 1847,
    activities: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    metrics: metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

const generateActivityDescription = (type: Activity['type']): string => {
  const descriptions = {
    signup: ['Created new account', 'Completed registration', 'Verified email address'],
    purchase: ['Completed purchase', 'Upgraded subscription', 'Bought premium features'],
    login: ['Logged into account', 'Accessed dashboard', 'Started new session'],
    feature_use: ['Used advanced feature', 'Created new project', 'Exported data'],
    support: ['Contacted support', 'Submitted ticket', 'Used help center']
  }

  return descriptions[type][Math.floor(Math.random() * descriptions[type].length)]
}

export default function DataDashboardExample() {
  const [mounted, setMounted] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30')
  const [selectedMetric, setSelectedMetric] = useState<string>('users')
  const [activityFilters, setActivityFilters] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'calendar' | 'activity'>('overview')

  const dayDetailsModalRef = useRef<TyModalRef>(null)
  const [dayDetailsData, setDayDetailsData] = useState<DailyMetric | null>(null)

  const dashboardData = useMemo(() => generateMockData(), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter data based on selected date range
  const filteredMetrics = useMemo(() => {
    const days = parseInt(selectedDateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return dashboardData.metrics.filter(metric =>
      new Date(metric.date) >= cutoffDate
    )
  }, [dashboardData.metrics, selectedDateRange])

  // Filter activities based on filters and date range
  const filteredActivities = useMemo(() => {
    const days = parseInt(selectedDateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return dashboardData.activities.filter(activity => {
      const activityDate = new Date(activity.date)
      const inDateRange = activityDate >= cutoffDate
      const matchesFilter = activityFilters.length === 0 || activityFilters.includes(activity.type)

      return inDateRange && matchesFilter
    })
  }, [dashboardData.activities, selectedDateRange, activityFilters])

  // Create custom day content function for calendar
  const createDayContentFn = () => {
    return (dayContext: any) => {
      // Use correct TypeScript camelCase property names
      const dayInMonth = dayContext.dayInMonth
      const isToday = dayContext.today
      const otherMonth = dayContext.otherMonth
      const year = dayContext.year
      const month = dayContext.month

      // Create date string using UTC value (proper way)
      // The value is UTC timestamp, extract date in UTC
      const utcDate = new Date(dayContext.value)
      const dateStr = `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`

      // Find metrics for this day
      const dayMetric = dashboardData.metrics.find(m => m.date === dateStr)
      const dayActivities = dashboardData.activities.filter(a => a.date === dateStr)

      // Create day element with inline styles (no Tailwind in shadow DOM)
      const dayElement = document.createElement('div')
      dayElement.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        cursor: pointer;
        opacity: ${otherMonth ? '0.4' : '1'};
        border-radius: 4px;
        transition: background-color 0.2s ease;
      `

      // Add hover effect
      dayElement.addEventListener('mouseenter', () => {
        if (!otherMonth && dayMetric) {
          dayElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
        }
      })

      dayElement.addEventListener('mouseleave', () => {
        dayElement.style.backgroundColor = 'transparent'
      })

      // Day number
      const dayNumber = document.createElement('div')
      dayNumber.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: ${isToday ? 'rgb(59, 130, 246)' : 'inherit'};
        margin-bottom: 2px;
      `
      dayNumber.textContent = dayInMonth.toString()
      dayElement.appendChild(dayNumber)

      // Today indicator (red dot like original ty-calendar)
      if (isToday) {
        const todayIndicator = document.createElement('div')
        todayIndicator.style.cssText = `
          position: absolute;
          top: 2px;
          right: 2px;
          width: 6px;
          height: 6px;
          background-color: rgb(239, 68, 68);
          border-radius: 50%;
        `
        dayElement.appendChild(todayIndicator)
      }

      // Add metric indicators if data exists
      if (dayMetric && !otherMonth) {
        // Activity count indicator (bottom center)
        if (dayActivities.length > 0) {
          const activityDot = document.createElement('div')
          const color = dayActivities.length > 5 ? 'rgb(34, 197, 94)' : // green for high activity
            dayActivities.length > 2 ? 'rgb(251, 191, 36)' : // yellow for medium activity
              'rgb(59, 130, 246)' // blue for low activity

          activityDot.style.cssText = `
            position: absolute;
            bottom: 3px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background-color: ${color};
            border-radius: 50%;
          `
          dayElement.appendChild(activityDot)
        }

        // Revenue indicator (top right, size based on amount)
        if (dayMetric.revenue > 1000) {
          const revenueBadge = document.createElement('div')
          const size = dayMetric.revenue > 2000 ? '8px' : '6px'

          revenueBadge.style.cssText = `
            position: absolute;
            top: 2px;
            right: ${isToday ? '10px' : '2px'};
            width: ${size};
            height: ${size};
            background-color: rgb(168, 85, 247);
            border-radius: 50%;
            opacity: 0.8;
          `
          dayElement.appendChild(revenueBadge)
        }

        // High user activity indicator (top left)
        if (dayMetric.users > 100) {
          const usersBadge = document.createElement('div')
          usersBadge.style.cssText = `
            position: absolute;
            top: 1px;
            left: 2px;
            font-size: 8px;
            font-weight: bold;
            color: rgb(59, 130, 246);
            line-height: 1;
          `
          usersBadge.textContent = '●'
          dayElement.appendChild(usersBadge)
        }

        // Additional visual indicator for very high activity days
        if (dayActivities.length > 10) {
          const hyperActivityRing = document.createElement('div')
          hyperActivityRing.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 28px;
            height: 28px;
            border: 1px solid rgb(34, 197, 94);
            border-radius: 50%;
            opacity: 0.3;
            pointer-events: none;
          `
          dayElement.appendChild(hyperActivityRing)
        }
      }

      // Add click handler to show day details
      dayElement.addEventListener('click', () => {
        if (dayMetric) {
          setDayDetailsData(dayMetric)
          setSelectedDate(dayDate)
          dayDetailsModalRef.current?.show()
        }
      })

      return dayElement
    }
  }

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredMetrics.reduce((sum, m) => sum + m.revenue, 0)
    const totalUsers = filteredMetrics.reduce((sum, m) => sum + m.users, 0)
    const totalEvents = filteredMetrics.reduce((sum, m) => sum + m.events, 0)
    const totalConversions = filteredMetrics.reduce((sum, m) => sum + m.conversions, 0)

    const avgRevenue = Math.round(totalRevenue / filteredMetrics.length) || 0
    const avgUsers = Math.round(totalUsers / filteredMetrics.length) || 0

    return {
      totalRevenue,
      avgRevenue,
      totalUsers,
      avgUsers,
      totalEvents,
      totalConversions
    }
  }, [filteredMetrics])

  if (!mounted) {
    return (
      <div className="ty-canvas flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin ty-text-primary mb-4"></div>
          <p className="ty-text-">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 pb-4 border-b ty-border+">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 ty-text++">
              Data Dashboard Example
            </h1>
            <p className="text-base leading-relaxed ty-text-">
              Interactive analytics dashboard showcasing TyCalendar with custom day content rendering,
              data filtering, and comprehensive dashboard patterns.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'bar-chart' },
              { id: 'calendar', label: 'Calendar', icon: 'calendar' },
              { id: 'activity', label: 'Activity', icon: 'activity' }
            ].map(mode => (
              <TyButton
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                flavor={viewMode === mode.id ? 'primary' : 'neutral'}
                size="sm"
                className="flex items-center gap-2"
              >
                <TyIcon name={mode.icon} size="16" />
                {mode.label}
              </TyButton>
            ))}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium ty-text+">Date Range:</label>
            <TyDropdown
              value={selectedDateRange}
              onChange={(e) => {
                const value = e.detail.option?.getAttribute('value') || '30'
                setSelectedDateRange(value)
              }}
              className="w-36"
            >
              <TyOption value="7">Last 7 days</TyOption>
              <TyOption value="30">Last 30 days</TyOption>
              <TyOption value="90">Last 90 days</TyOption>
            </TyDropdown>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium ty-text+">Activity Types:</label>
            <TyMultiselect
              value={activityFilters}
              onChange={(e) => setActivityFilters(e.detail.values)}
              placeholder="All types"
              className="w-64"
            >
              <TyTag value="signup" flavor="success" size="sm">Signups</TyTag>
              <TyTag value="purchase" flavor="primary" size="sm">Purchases</TyTag>
              <TyTag value="login" flavor="neutral" size="sm">Logins</TyTag>
              <TyTag value="feature_use" flavor="secondary" size="sm">Features</TyTag>
              <TyTag value="support" flavor="warning" size="sm">Support</TyTag>
            </TyMultiselect>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium ty-text+">Primary Metric:</label>
            <TyDropdown
              value={selectedMetric}
              onChange={(e) => {
                const value = e.detail.option?.getAttribute('value') || 'users'
                setSelectedMetric(value)
              }}
              className="w-32"
            >
              <TyOption value="users">Users</TyOption>
              <TyOption value="revenue">Revenue</TyOption>
              <TyOption value="events">Events</TyOption>
              <TyOption value="conversions">Conversions</TyOption>
            </TyDropdown>
          </div>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ty-elevated p-6 rounded-xl border ty-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium ty-text+">Total Revenue</h3>
                <TyIcon name="dollar-sign" size="20" className="ty-text-success" />
              </div>
              <div className="text-2xl font-bold ty-text++ mb-1">
                ${summaryStats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs ty-text-">
                Avg: ${summaryStats.avgRevenue}/day
              </div>
            </div>

            <div className="ty-elevated p-6 rounded-xl border ty-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium ty-text+">Active Users</h3>
                <TyIcon name="users" size="20" className="ty-text-primary" />
              </div>
              <div className="text-2xl font-bold ty-text++ mb-1">
                {summaryStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs ty-text-">
                Avg: {summaryStats.avgUsers}/day
              </div>
            </div>

            <div className="ty-elevated p-6 rounded-xl border ty-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium ty-text+">Total Events</h3>
                <TyIcon name="activity" size="20" className="ty-text-info" />
              </div>
              <div className="text-2xl font-bold ty-text++ mb-1">
                {summaryStats.totalEvents.toLocaleString()}
              </div>
              <div className="text-xs ty-text-">
                Last {selectedDateRange} days
              </div>
            </div>

            <div className="ty-elevated p-6 rounded-xl border ty-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium ty-text+">Conversions</h3>
                <TyIcon name="trending-up" size="20" className="ty-text-secondary" />
              </div>
              <div className="text-2xl font-bold ty-text++ mb-1">
                {summaryStats.totalConversions.toLocaleString()}
              </div>
              <div className="text-xs ty-text-">
                {((summaryStats.totalConversions / summaryStats.totalUsers) * 100).toFixed(1)}% rate
              </div>
            </div>
          </div>

          {/* Quick Calendar Preview */}
          <div className="ty-elevated p-6 rounded-xl border ty-border">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 ty-text++">
                Activity Calendar Preview
              </h2>
              <p className="ty-text- text-sm leading-relaxed mb-4">
                Calendar with custom day content showing activity levels, revenue indicators, and user engagement.
                Click on any day to see detailed metrics.
              </p>

              {/* Calendar Legend */}
              <div className="flex flex-wrap gap-6 mb-6 p-4 ty-bg-primary- rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 ty-bg-primary rounded-full"></div>
                  <span className="text-xs ty-text-primary">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 ty-bg-success rounded-full"></div>
                  <span className="text-xs ty-text">High Activity (5+ events)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 ty-bg-warning rounded-full"></div>
                  <span className="text-xs ty-text">Medium Activity (3-5 events)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 ty-bg-info rounded-full"></div>
                  <span className="text-xs ty-text">Low Activity (1-2 events)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 ty-bg-secondary rounded-full"></div>
                  <span className="text-xs ty-text">High Revenue ($2000+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs ty-text-primary">●</span>
                  <span className="text-xs ty-text">High User Activity (100+ users)</span>
                </div>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <TyCalendar
                dayContentFn={createDayContentFn()}
                showNavigation={true}
                className="w-full"
              />
            </div>

            <div className="mt-6 text-center">
              <TyButton
                onClick={() => setViewMode('calendar')}
                flavor="primary"
                className="flex items-center gap-2 mx-auto"
              >
                <TyIcon name="calendar" size="16" />
                View Full Calendar
              </TyButton>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Mode */}
      {viewMode === 'calendar' && (
        <div className="space-y-8">
          <div className="ty-elevated p-8 rounded-xl border ty-border">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 ty-text++">
                Interactive Data Calendar
              </h2>
              <p className="ty-text- leading-relaxed mb-4">
                Full calendar view with custom day content rendering. Each day shows:
                activity levels (colored dots), revenue indicators (top-right badges),
                and high user engagement (top-left dots). Click any day for detailed metrics.
              </p>

              {/* Enhanced Calendar Legend */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-6 ty-bg-neutral- rounded-xl">
                <div>
                  <h3 className="font-medium ty-text+ mb-3">Activity Levels</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 ty-bg-success rounded-full"></div>
                      <span className="text-sm ty-text">High Activity (5+ events)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 ty-bg-warning rounded-full"></div>
                      <span className="text-sm ty-text">Medium Activity (3-5 events)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 ty-bg-info rounded-full"></div>
                      <span className="text-sm ty-text">Low Activity (1-2 events)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium ty-text+ mb-3">Revenue Indicators</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 ty-bg-secondary rounded-full"></div>
                      <span className="text-sm ty-text">High Revenue ($2000+)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 ty-bg-secondary rounded-full opacity-60"></div>
                      <span className="text-sm ty-text">Medium Revenue ($1000+)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium ty-text+ mb-3">Special Indicators</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 ty-bg-primary rounded-full"></div>
                      <span className="text-sm ty-text">Today</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm ty-text-primary font-bold">●</span>
                      <span className="text-sm ty-text">High User Count (100+)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <TyCalendar
                dayContentFn={createDayContentFn()}
                showNavigation={true}
                className="w-full text-center"
              />
            </div>

            {selectedDate && (
              <div className="mt-8 p-4 ty-bg-primary- rounded-lg text-center">
                <p className="text-sm ty-text-primary flex items-center">
                  <TyIcon name="info" size="16" className="mr-2" />
                  Selected: {selectedDate.toLocaleDateString()} - Click any day with data to view detailed metrics
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Mode */}
      {viewMode === 'activity' && (
        <div className="space-y-8">
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { type: 'signup', label: 'Signups', icon: 'user-plus', flavor: 'success' },
              { type: 'purchase', label: 'Purchases', icon: 'shopping-cart', flavor: 'primary' },
              { type: 'login', label: 'Logins', icon: 'log-in', flavor: 'info' },
              { type: 'feature_use', label: 'Features', icon: 'zap', flavor: 'secondary' },
              { type: 'support', label: 'Support', icon: 'help-circle', flavor: 'warning' }
            ].map(actType => {
              const count = filteredActivities.filter(a => a.type === actType.type).length
              return (
                <div key={actType.type} className="ty-elevated p-4 rounded-lg border ty-border text-center">
                  <TyIcon name={actType.icon} size="24" className={`ty-text-${actType.flavor} mb-2 mx-auto`} />
                  <div className="text-xl font-bold ty-text++">{count}</div>
                  <div className="text-xs ty-text-">{actType.label}</div>
                </div>
              )
            })}
          </div>

          {/* Activity Feed */}
          <div className="ty-elevated rounded-xl border ty-border">
            <div className="p-6 border-b ty-border-">
              <h2 className="text-xl font-semibold ty-text++">
                Recent Activity Feed
              </h2>
              <p className="ty-text- text-sm mt-1">
                Showing {filteredActivities.length} activities from the last {selectedDateRange} days
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredActivities.slice(0, 50).map(activity => (
                <div key={activity.id} className="p-4 border-b ty-border- last:border-b-0 hover:ty-bg-primary- transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <TyTag
                        flavor={
                          activity.type === 'signup' ? 'success' :
                            activity.type === 'purchase' ? 'primary' :
                              activity.type === 'login' ? 'neutral' :
                                activity.type === 'feature_use' ? 'secondary' : 'warning'
                        }
                        size="sm"
                      >
                        {activity.type}
                      </TyTag>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium ty-text+ text-sm">
                          {activity.user}
                        </span>
                        <span className="ty-text- text-sm">
                          {activity.description}
                        </span>
                        {activity.amount && (
                          <span className="font-medium ty-text-success text-sm">
                            ${activity.amount}
                          </span>
                        )}
                      </div>
                      <div className="ty-text-- text-xs mt-1">
                        {new Date(activity.date).toLocaleDateString()} - {activity.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredActivities.length > 50 && (
              <div className="p-4 border-t ty-border- text-center">
                <p className="text-sm ty-text-">
                  Showing 50 of {filteredActivities.length} activities
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      <TyModal ref={dayDetailsModalRef} className="max-w-lg">
        {dayDetailsData && selectedDate && (
          <div className="p-6 rounded-lg ty-floating">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold ty-text++ mb-2">
                Daily Metrics
              </h2>
              <p className="ty-text- text-sm">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 ty-bg-primary- rounded-lg">
                <TyIcon name="users" size="24" className="ty-text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold ty-text-primary+">
                  {dayDetailsData.users}
                </div>
                <div className="text-xs ty-text-primary">Active Users</div>
              </div>

              <div className="text-center p-4 ty-bg-success- rounded-lg">
                <TyIcon name="dollar-sign" size="24" className="ty-text-success mx-auto mb-2" />
                <div className="text-2xl font-bold ty-text-success+">
                  ${dayDetailsData.revenue}
                </div>
                <div className="text-xs ty-text-success">Revenue</div>
              </div>

              <div className="text-center p-4 ty-bg-info- rounded-lg">
                <TyIcon name="activity" size="24" className="ty-text-info mx-auto mb-2" />
                <div className="text-2xl font-bold ty-text-info+">
                  {dayDetailsData.events}
                </div>
                <div className="text-xs ty-text-info">Events</div>
              </div>

              <div className="text-center p-4 ty-bg-secondary- rounded-lg">
                <TyIcon name="trending-up" size="24" className="ty-text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold ty-text-secondary+">
                  {dayDetailsData.conversions}
                </div>
                <div className="text-xs ty-text-secondary">Conversions</div>
              </div>
            </div>

            <div className="text-center">
              <TyButton
                onClick={() => dayDetailsModalRef.current?.hide()}
                flavor="primary"
                className="flex items-center gap-2 mx-auto"
              >
                <TyIcon name="check" size="16" />
                Close
              </TyButton>
            </div>
          </div>
        )}
      </TyModal>

    </AppLayout>
  )
}
