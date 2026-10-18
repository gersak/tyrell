'use client'

import { useState, useEffect, useRef } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import { useTheme } from '../../../lib/theme-provider'
import {
  TyButton,
  TyInput,
  TySelect,
  TyOption,
  TyIcon,
  TyModal,
  TyTooltip,
  TyTag,
  TySwitch,
  TyTextarea,
  type TyModalRef
} from 'tyrell-react'

interface SettingsState {
  // Appearance
  theme: 'light' | 'dark' | 'auto'
  language: string
  fontSize: string
  compactMode: boolean

  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  desktopNotifications: boolean
  notificationSound: boolean
  notificationTypes: {
    updates: boolean
    mentions: boolean
    messages: boolean
    security: boolean
  }

  // Privacy & Security
  profileVisibility: 'public' | 'friends' | 'private'
  showEmail: boolean
  showLastSeen: boolean
  twoFactorAuth: boolean
  sessionTimeout: string

  // Account
  username: string
  email: string
  displayName: string
  bio: string
  timezone: string

  // Advanced
  betaFeatures: boolean
  analytics: boolean
  crashReports: boolean
  debugMode: boolean
}

export default function SettingsPanelExample() {
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState('appearance')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { theme: currentTheme, toggleTheme } = useTheme()

  const confirmModalRef = useRef<TyModalRef>(null)
  const deleteModalRef = useRef<TyModalRef>(null)
  // Only mounted while the Account section is shown
  const accountFormRef = useRef<HTMLFormElement>(null)
  const successModalRef = useRef<TyModalRef>(null)

  const [settings, setSettings] = useState<SettingsState>({
    // Appearance
    theme: 'auto',
    language: 'en',
    fontSize: 'medium',
    compactMode: false,

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    notificationSound: true,
    notificationTypes: {
      updates: true,
      mentions: true,
      messages: true,
      security: true
    },

    // Privacy & Security
    profileVisibility: 'friends',
    showEmail: false,
    showLastSeen: true,
    twoFactorAuth: false,
    sessionTimeout: '30m',

    // Account
    username: 'johndoe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    bio: 'Software developer passionate about web technologies and modern UI design.',
    timezone: 'America/New_York',

    // Advanced
    betaFeatures: false,
    analytics: true,
    crashReports: true,
    debugMode: false
  })

  useEffect(() => {
    setMounted(true)
    // Simulate loading saved settings
    const savedTime = new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    setLastSaved(savedTime)
  }, [])

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const updateNestedSetting = <T extends keyof SettingsState>(
    category: T,
    key: keyof SettingsState[T],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleSaveSettings = async () => {
    // Validate without submitting: shows each failing field's message and
    // focuses the first one. Nothing to check when the form isn't mounted.
    if (accountFormRef.current && !accountFormRef.current.reportValidity()) return

    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 1000))

    setHasUnsavedChanges(false)
    setLastSaved(new Date())
    successModalRef.current?.show()
  }

  const handleResetSection = () => {
    confirmModalRef.current?.show()
  }

  const confirmReset = () => {
    // Reset logic for the active section is left out of this demo
    confirmModalRef.current?.hide()
    setHasUnsavedChanges(true)
  }

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'privacy', label: 'Privacy & Security', icon: 'shield' },
    { id: 'account', label: 'Account', icon: 'user' },
    { id: 'advanced', label: 'Advanced', icon: 'settings' }
  ]

  if (!mounted) {
    return (
      <div className="ty-canvas flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin ty-text-primary mb-4"></div>
          <p className="ty-text-">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 pb-4 border-b ty-border+">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 ty-text++">
              Settings Panel Example
            </h1>
            <p className="text-base leading-relaxed ty-text-">
              Comprehensive settings interface demonstrating form controls, state management,
              live preview, and advanced Ty component integration patterns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="text-right">
                <p className="text-xs ty-text-- mb-1">Last saved</p>
                <p className="text-sm ty-text-">{lastSaved.toLocaleTimeString()}</p>
              </div>
            )}

            {hasUnsavedChanges && (
              <TyTag flavor="warning" size="sm">
                <TyIcon name="clock" size="12" className="mr-1" />
                Unsaved Changes
              </TyTag>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Settings Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="ty-elevated rounded-xl p-6 border ty-border sticky top-6">
            <h3 className="text-lg font-semibold mb-4 ty-text++">
              Settings Categories
            </h3>

            <nav className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200
                    ${activeSection === section.id
                      ? 'ty-bg-primary ty-text-primary+'
                      : 'hover:ty-bg-primary- ty-text hover:ty-text+'
                    }
                  `}
                >
                  <TyIcon name={section.icon} size="20" />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t ty-border-">
              <div className="space-y-3">
                <TyButton
                  onClick={handleSaveSettings}
                  flavor="primary"
                  size="sm"
                  disabled={!hasUnsavedChanges}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <TyIcon name="check" size="16" />
                  Save Changes
                </TyButton>

                <TyButton
                  onClick={handleResetSection}
                  flavor="neutral"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <TyIcon name="refresh-cw" size="16" />
                  Reset Section
                </TyButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-3">
          <div className="ty-elevated rounded-xl border ty-border">

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2 ty-text++">
                    Appearance Settings
                  </h2>
                  <p className="ty-text- leading-relaxed">
                    Customize the visual appearance and theme of your interface.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-3">
                      Theme Preference
                      <span className="inline-flex ml-2 ty-text-- align-middle" tabIndex={0}>
                        <TyIcon name="help-circle" size="14" />
                        <TyTooltip>Choose how the interface should appear. Auto follows your system preference.</TyTooltip>
                      </span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: 'sun', desc: 'Clean bright interface' },
                        { value: 'dark', label: 'Dark', icon: 'moon', desc: 'Easy on the eyes' },
                        { value: 'auto', label: 'Auto', icon: 'monitor', desc: 'Matches system' }
                      ].map(theme => (
                        <div
                          key={theme.value}
                          onClick={() => {
                            updateSetting('theme', theme.value as any)
                            if (theme.value !== 'auto') {
                              toggleTheme() // Actually toggle the theme
                            }
                          }}
                          className={`
                            p-4 rounded-lg border cursor-pointer transition-all duration-200
                            ${settings.theme === theme.value
                              ? 'ty-border-primary+ ty-bg-primary-'
                              : 'ty-border hover:ty-border+ hover:ty-bg-primary--'
                            }
                          `}
                        >
                          <div className="flex items-center mb-2">
                            <TyIcon
                              name={theme.icon}
                              size="20"
                              className={settings.theme === theme.value ? 'ty-text-primary+' : 'ty-text'}
                            />
                            <span className={`ml-3 font-medium ${settings.theme === theme.value ? 'ty-text-primary+' : 'ty-text+'}`}>
                              {theme.label}
                            </span>
                          </div>
                          <p className="text-sm ty-text- leading-relaxed">
                            {theme.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Language
                    </label>
                    <TySelect
                      value={settings.language}
                      onChange={(e) => {
                        const value = (e.detail.value as string) || 'en'
                        updateSetting('language', value)
                      }}
                      className="w-full md:w-80"
                    >
                      <TyOption value="en">English</TyOption>
                      <TyOption value="es">Español</TyOption>
                      <TyOption value="fr">Français</TyOption>
                      <TyOption value="de">Deutsch</TyOption>
                      <TyOption value="ja">日本語</TyOption>
                    </TySelect>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Font Size
                    </label>
                    <TySelect
                      value={settings.fontSize}
                      onChange={(e) => {
                        const value = (e.detail.value as string) || 'medium'
                        updateSetting('fontSize', value)
                      }}
                      className="w-full md:w-60"
                    >
                      <TyOption value="small">Small</TyOption>
                      <TyOption value="medium">Medium</TyOption>
                      <TyOption value="large">Large</TyOption>
                      <TyOption value="x-large">Extra Large</TyOption>
                    </TySelect>
                  </div>

                  {/* Compact Mode Toggle */}
                  <div className="ty-bg-primary- p-4 rounded-lg border ty-border-">
                    <div className="flex items-start justify-between">
                      <div>
                        <label className="flex items-center gap-3 text-sm font-medium ty-text-primary+ cursor-pointer">
                          <TySwitch
                              checked={settings.compactMode}
                              onChange={(e) => updateSetting('compactMode', e.detail.checked)}
                            />
                          Compact Mode
                        </label>
                        <p className="text-xs ty-text-primary mt-1 ml-12">
                          Reduce spacing and padding for a more dense interface layout.
                        </p>
                      </div>
                      <TyIcon name="layout" size="20" className="ty-text-primary mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2 ty-text++">
                    Notification Settings
                  </h2>
                  <p className="ty-text- leading-relaxed">
                    Control how and when you receive notifications about updates and activities.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Notification Channels */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 ty-text+">
                      Notification Channels
                    </h3>

                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', icon: 'mail', desc: 'Receive notifications via email' },
                        { key: 'pushNotifications', label: 'Push Notifications', icon: 'smartphone', desc: 'Browser push notifications' },
                        { key: 'desktopNotifications', label: 'Desktop Notifications', icon: 'monitor', desc: 'System desktop notifications' },
                        { key: 'notificationSound', label: 'Notification Sounds', icon: 'volume-2', desc: 'Play sounds for notifications' }
                      ].map(item => (
                        <div key={item.key} className="ty-elevated p-4 rounded-lg border ty-border-">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TyIcon name={item.icon} size="20" className="ty-text-primary mr-3" />
                              <div>
                                <label className="text-sm font-medium ty-text+ cursor-pointer">
                                  {item.label}
                                </label>
                                <p className="text-xs ty-text- mt-1">{item.desc}</p>
                              </div>
                            </div>
                            <TySwitch
                              checked={settings[item.key as keyof SettingsState] as boolean}
                              onChange={(e) => updateSetting(item.key as keyof SettingsState, e.detail.checked as any)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 ty-text+">
                      Notification Types
                    </h3>

                    <div className="space-y-4">
                      {[
                        { key: 'updates', label: 'Product Updates', icon: 'bell', desc: 'New features and improvements' },
                        { key: 'mentions', label: 'Mentions & Replies', icon: 'at-sign', desc: 'When someone mentions you' },
                        { key: 'messages', label: 'Direct Messages', icon: 'message-circle', desc: 'Private messages from other users' },
                        { key: 'security', label: 'Security Alerts', icon: 'shield', desc: 'Account security notifications' }
                      ].map(item => (
                        <div key={item.key} className="ty-elevated p-4 rounded-lg border ty-border-">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TyIcon name={item.icon} size="20" className="ty-text-primary mr-3" />
                              <div>
                                <label className="text-sm font-medium ty-text+ cursor-pointer">
                                  {item.label}
                                </label>
                                <p className="text-xs ty-text- mt-1">{item.desc}</p>
                              </div>
                            </div>
                            <TySwitch
                              checked={settings.notificationTypes[item.key as keyof typeof settings.notificationTypes]}
                              onChange={(e) => updateNestedSetting('notificationTypes', item.key as keyof typeof settings.notificationTypes, e.detail.checked)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Settings */}
            {activeSection === 'privacy' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2 ty-text++">
                    Privacy & Security
                  </h2>
                  <p className="ty-text- leading-relaxed">
                    Manage your privacy preferences and security settings to protect your account.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-3">
                      Profile Visibility
                      <span className="inline-flex ml-2 ty-text-- align-middle" tabIndex={0}>
                        <TyIcon name="help-circle" size="14" />
                        <TyTooltip>Control who can see your profile information and activity.</TyTooltip>
                      </span>
                    </label>

                    <TySelect
                      value={settings.profileVisibility}
                      onChange={(e) => {
                        const value = (e.detail.value as string) as 'public' | 'friends' | 'private'
                        updateSetting('profileVisibility', value)
                      }}
                      className="w-full md:w-80"
                    >
                      <TyOption value="public">Public - Anyone can see</TyOption>
                      <TyOption value="friends">Friends Only - Connected users</TyOption>
                      <TyOption value="private">Private - Only you</TyOption>
                    </TySelect>
                  </div>

                  {/* Privacy Options */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 ty-text+">
                      Privacy Options
                    </h3>

                    <div className="space-y-4">
                      {[
                        { key: 'showEmail', label: 'Show Email Address', icon: 'mail', desc: 'Display email in your public profile' },
                        { key: 'showLastSeen', label: 'Show Last Seen', icon: 'clock', desc: 'Show when you were last active' }
                      ].map(item => (
                        <div key={item.key} className="ty-elevated p-4 rounded-lg border ty-border-">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TyIcon name={item.icon} size="20" className="ty-text-neutral mr-3" />
                              <div>
                                <label className="text-sm font-medium ty-text+ cursor-pointer">
                                  {item.label}
                                </label>
                                <p className="text-xs ty-text- mt-1">{item.desc}</p>
                              </div>
                            </div>
                            <TySwitch
                              checked={settings[item.key as keyof SettingsState] as boolean}
                              onChange={(e) => updateSetting(item.key as keyof SettingsState, e.detail.checked as any)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 ty-text+">
                      Security Settings
                    </h3>

                    <div className="space-y-4">
                      {/* Two-Factor Authentication */}
                      <div className="ty-bg-success- p-4 rounded-lg border ty-border-success">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TyIcon name="shield" size="20" className="ty-text-success+ mr-3" />
                            <div>
                              <label className="text-sm font-medium ty-text-success+ cursor-pointer">
                                Two-Factor Authentication
                              </label>
                              <p className="text-xs ty-text-success mt-1">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {settings.twoFactorAuth && (
                              <TyTag flavor="success" size="sm">
                                <TyIcon name="check" size="12" className="mr-1" />
                                Enabled
                              </TyTag>
                            )}
                            <TyButton
                              onClick={() => updateSetting('twoFactorAuth', !settings.twoFactorAuth)}
                              flavor={settings.twoFactorAuth ? 'danger' : 'success'}
                              size="sm"
                            >
                              {settings.twoFactorAuth ? 'Disable' : 'Enable'}
                            </TyButton>
                          </div>
                        </div>
                      </div>

                      {/* Session Timeout */}
                      <div className="ty-elevated p-4 rounded-lg border ty-border-">
                        <label className="block text-sm font-medium ty-text+ mb-3">
                          Session Timeout
                        </label>
                        <TySelect
                          value={settings.sessionTimeout}
                          onChange={(e) => {
                            const value = (e.detail.value as string) || '30m'
                            updateSetting('sessionTimeout', value)
                          }}
                          className="w-full md:w-60"
                        >
                          <TyOption value="15m">15 minutes</TyOption>
                          <TyOption value="30m">30 minutes</TyOption>
                          <TyOption value="1h">1 hour</TyOption>
                          <TyOption value="4h">4 hours</TyOption>
                          <TyOption value="24h">24 hours</TyOption>
                          <TyOption value="never">Never</TyOption>
                        </TySelect>
                        <p className="text-xs ty-text- mt-2">
                          Automatically log out after period of inactivity
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2 ty-text++">
                    Account Settings
                  </h2>
                  <p className="ty-text- leading-relaxed">
                    Manage your account information and personal preferences.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Basic Information: the rules live on the fields. Save calls
                      reportValidity() on this form (see handleSaveSettings). */}
                  <form
                    ref={accountFormRef}
                    onSubmit={(e) => { e.preventDefault(); handleSaveSettings() }}
                  >
                    <h3 className="text-lg font-medium mb-4 ty-text+">
                      Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TyInput
                          name="username"
                          label="Username"
                          value={settings.username}
                          onChange={(e) => updateSetting('username', e.detail.value)}
                          placeholder="ada_lovelace"
                          required
                          pattern="[a-z0-9_]{3,20}"
                        />
                        <TyInput
                          name="displayName"
                          label="Display name"
                          value={settings.displayName}
                          onChange={(e) => updateSetting('displayName', e.detail.value)}
                          placeholder="Ada Lovelace"
                          maxLength={50}
                        />
                      </div>
                      <p className="text-xs ty-text- -mt-2">
                        Username: 3–20 lowercase letters, digits or underscores.
                      </p>

                      <TyInput
                        name="email"
                        type="email"
                        label="Email address"
                        value={settings.email}
                        onChange={(e) => updateSetting('email', e.detail.value)}
                        placeholder="you@company.com"
                        required
                      />

                      <div>
                        <TyTextarea
                          name="bio"
                          label="Bio"
                          value={settings.bio}
                          onChange={(e) => updateSetting('bio', String(e.detail.value ?? ''))}
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                        <p className="text-xs ty-text- mt-1">
                          {settings.bio.length}/500 characters
                        </p>
                      </div>

                      <TySelect
                        name="timezone"
                        label="Timezone"
                        value={settings.timezone}
                        onChange={(e) => updateSetting('timezone', (e.detail.value as string) || 'America/New_York')}
                        className="w-full md:w-80"
                        noClear
                      >
                        <TyOption value="America/New_York">Eastern Time (ET)</TyOption>
                        <TyOption value="America/Chicago">Central Time (CT)</TyOption>
                        <TyOption value="America/Denver">Mountain Time (MT)</TyOption>
                        <TyOption value="America/Los_Angeles">Pacific Time (PT)</TyOption>
                        <TyOption value="Europe/London">London (GMT)</TyOption>
                        <TyOption value="Europe/Paris">Paris (CET)</TyOption>
                        <TyOption value="Asia/Tokyo">Tokyo (JST)</TyOption>
                      </TySelect>
                    </div>
                  </form>

                  {/* Danger Zone */}
                  <div className="ty-bg-danger- p-6 rounded-lg border ty-border-danger">
                    <h3 className="text-lg font-medium mb-4 ty-text-danger++ flex items-center">
                      <TyIcon name="alert-triangle" size="20" className="mr-2" />
                      Danger Zone
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium ty-text-danger+">Delete Account</h4>
                          <p className="text-sm ty-text-danger mt-1">
                            Permanently delete your account and all associated data.
                            This action cannot be undone.
                          </p>
                        </div>
                        <TyButton
                          flavor="danger"
                          size="sm"
                          onClick={() => deleteModalRef.current?.show()}
                          className="flex items-center gap-2"
                        >
                          <TyIcon name="trash-2" size="16" />
                          Delete
                        </TyButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {activeSection === 'advanced' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-2 ty-text++">
                    Advanced Settings
                  </h2>
                  <p className="ty-text- leading-relaxed">
                    Configure advanced features and developer options. Use these settings carefully.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Feature Flags */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 ty-text+">
                      Feature Flags
                    </h3>

                    <div className="space-y-4">
                      {[
                        { key: 'betaFeatures', label: 'Beta Features', icon: 'zap', desc: 'Enable experimental features and early access' },
                        { key: 'debugMode', label: 'Debug Mode', icon: 'bug', desc: 'Show debug information and developer tools' }
                      ].map(item => (
                        <div key={item.key} className="ty-bg-warning- p-4 rounded-lg border ty-border-warning">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TyIcon name={item.icon} size="20" className="ty-text-warning+ mr-3" />
                              <div>
                                <label className="text-sm font-medium ty-text-warning+ cursor-pointer">
                                  {item.label}
                                </label>
                                <p className="text-xs ty-text-warning mt-1">{item.desc}</p>
                              </div>
                            </div>
                            <TySwitch
                              checked={settings[item.key as keyof SettingsState] as boolean}
                              onChange={(e) => updateSetting(item.key as keyof SettingsState, e.detail.checked as any)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data & Analytics */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 ty-text+">
                      Data & Analytics
                    </h3>

                    <div className="space-y-4">
                      {[
                        { key: 'analytics', label: 'Usage Analytics', icon: 'bar-chart', desc: 'Help improve the product by sharing usage data' },
                        { key: 'crashReports', label: 'Crash Reports', icon: 'alert-circle', desc: 'Automatically send crash reports to help fix bugs' }
                      ].map(item => (
                        <div key={item.key} className="ty-elevated p-4 rounded-lg border ty-border-">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TyIcon name={item.icon} size="20" className="ty-text-primary mr-3" />
                              <div>
                                <label className="text-sm font-medium ty-text+ cursor-pointer">
                                  {item.label}
                                </label>
                                <p className="text-xs ty-text- mt-1">{item.desc}</p>
                              </div>
                            </div>
                            <TySwitch
                              checked={settings[item.key as keyof SettingsState] as boolean}
                              onChange={(e) => updateSetting(item.key as keyof SettingsState, e.detail.checked as any)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Developer Options */}
                  <div className="ty-bg-neutral- p-6 rounded-lg border ty-border-">
                    <h3 className="text-lg font-medium mb-4 ty-text++ flex items-center">
                      <TyIcon name="code" size="20" className="mr-2" />
                      Developer Options
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TyButton
                        flavor="neutral"
                        size="sm"
                        onClick={() => alert('Export settings as JSON would be implemented here')}
                        className="flex items-center gap-2"
                      >
                        <TyIcon name="download" size="16" />
                        Export Settings
                      </TyButton>

                      <TyButton
                        flavor="neutral"
                        size="sm"
                        onClick={() => alert('Import settings from JSON would be implemented here')}
                        className="flex items-center gap-2"
                      >
                        <TyIcon name="upload" size="16" />
                        Import Settings
                      </TyButton>

                      <TyButton
                        flavor="neutral"
                        size="sm"
                        onClick={() => console.log('Settings State:', settings)}
                        className="flex items-center gap-2"
                      >
                        <TyIcon name="terminal" size="16" />
                        Log to Console
                      </TyButton>

                      <TyButton
                        flavor="neutral"
                        size="sm"
                        onClick={() => alert('Clear cache and reload would be implemented here')}
                        className="flex items-center gap-2"
                      >
                        <TyIcon name="refresh-ccw" size="16" />
                        Clear Cache
                      </TyButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <TyModal ref={confirmModalRef}>
        <div className="p-6 text-center ty-elevated rounded-xl">
          <TyIcon name="alert-triangle" size="48" className="ty-text-warning mb-4 mx-auto" />
          <h2 className="mb-3 ty-text++ text-xl font-semibold">
            Reset Settings Section?
          </h2>
          <p className="mb-6 ty-text- leading-relaxed max-w-md mx-auto">
            This will reset all settings in the current section to their default values.
            You will lose any unsaved changes.
          </p>
          <div className="flex gap-3 justify-center">
            <TyButton
              onClick={confirmReset}
              flavor="warning"
              className="flex items-center gap-2"
            >
              <TyIcon name="refresh-cw" size="16" />
              Reset Section
            </TyButton>
            <TyButton
              onClick={() => confirmModalRef.current?.hide()}
              flavor="neutral"
            >
              Cancel
            </TyButton>
          </div>
        </div>
      </TyModal>

      {/* Delete confirmation: guarded, so only the buttons close it */}
      <TyModal ref={deleteModalRef} label="Delete account" preventOutsideClick preventEscape>
        <div className="p-6 ty-floating rounded-xl max-w-md">
          <h2 className="mb-2 ty-text++ text-xl font-semibold">Delete your account?</h2>
          <p className="mb-6 ty-text- leading-relaxed">
            All of your data goes with it. This can&apos;t be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <TyButton appearance="ghost" onClick={() => deleteModalRef.current?.hide()}>
              Cancel
            </TyButton>
            <TyButton flavor="danger" onClick={() => deleteModalRef.current?.hide()}>
              <TyIcon slot="start" name="trash-2" />
              Delete account
            </TyButton>
          </div>
        </div>
      </TyModal>

      {/* Success Modal */}
      <TyModal ref={successModalRef}>
        <div className="p-6 text-center ty-elevated rounded-xl">
          <TyIcon name="check-circle" size="48" className="ty-text-success mb-4 mx-auto" />
          <h2 className="mb-3 ty-text++ text-xl font-semibold">
            Settings Saved Successfully!
          </h2>
          <p className="mb-6 ty-text- leading-relaxed max-w-md mx-auto">
            Your settings have been saved and will take effect immediately.
            Some changes may require a page refresh.
          </p>
          <TyButton
            onClick={() => successModalRef.current?.hide()}
            flavor="success"
            className="flex items-center gap-2 mx-auto"
          >
            <TyIcon name="check" size="16" />
            Great!
          </TyButton>
        </div>
      </TyModal>

    </AppLayout>
  )
}
