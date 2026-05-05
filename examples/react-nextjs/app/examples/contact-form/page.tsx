'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyButton,
  TyInput,
  TyIcon,
  TyModal,
  TyDropdown,
  TyOption,
  type TyModalRef
} from 'tyrell-react'
import { useRef } from 'react'

interface FormData {
  name: string
  email: string
  company: string
  phone: string
  subject: string
  message: string
  priority: string
  contactMethod: string
  newsletter: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function ContactFormExample() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'medium',
    contactMethod: 'email',
    newsletter: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useRef<TyModalRef>(null)

  console.log('Submitting: ', isSubmitting)
  console.log('ERROR: ', errors);
  useEffect(() => {
    setMounted(true)
  }, [])

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        return ''

      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return ''

      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number'
        }
        return ''

      case 'subject':
        if (!value.trim()) return 'Subject is required'
        if (value.trim().length < 5) return 'Subject must be at least 5 characters'
        return ''

      case 'message':
        if (!value.trim()) return 'Message is required'
        if (value.trim().length < 10) return 'Message must be at least 10 characters'
        if (value.trim().length > 1000) return 'Message must be less than 1000 characters'
        return ''

      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Real-time validation for better UX
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: FormErrors = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'company' && key !== 'phone' && key !== 'newsletter' && key !== 'priority' && key !== 'contactMethod') {
        const error = validateField(key, formData[key as keyof FormData] as string)
        if (error) newErrors[key] = error
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      modalRef.current?.show()

      // Reset form
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: '',
          message: '',
          priority: 'medium',
          contactMethod: 'email',
          newsletter: false
        })
      }, 3000)

    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="ty-canvas flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin ty-text-primary mb-4"></div>
          <p className="ty-text-">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 pb-4 border-b ty-border+">
        <h1 className="text-3xl font-bold mb-2 ty-text++">
          Contact Form Example
        </h1>
        <p className="text-base leading-relaxed ty-text-">
          A comprehensive contact form showcasing Tyrell Components with validation, different input types,
          and professional styling using the TY + Tailwind design system.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Contact Form - Main Content */}
        <div className="xl:col-span-2">
          <div className="ty-elevated rounded-xl p-8 border ty-border">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 ty-text++">
                Get in Touch
              </h2>
              <p className="ty-text- leading-relaxed">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium ty-text+ border-b ty-border- pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Full Name *
                    </label>
                    <TyInput
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.detail.value)}
                      className={`w-full ${errors.name ? 'ty-border-danger' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-xs ty-text-danger mt-1 flex items-center gap-1">
                        <TyIcon name="alert-circle" size="12" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Email Address *
                    </label>
                    <TyInput
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.detail.value)}
                      className={`w-full ${errors.email ? 'ty-border-danger' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-xs ty-text-danger mt-1 flex items-center gap-1">
                        <TyIcon name="alert-circle" size="12" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Company
                    </label>
                    <TyInput
                      type="text"
                      placeholder="Your company name"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.detail.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Phone Number
                    </label>
                    <TyInput
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.detail.value)}
                      className={`w-full ${errors.phone ? 'ty-border-danger' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-xs ty-text-danger mt-1 flex items-center gap-1">
                        <TyIcon name="alert-circle" size="12" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium ty-text+ border-b ty-border- pb-2">
                  Message Details
                </h3>

                <div>
                  <label className="block text-sm font-medium ty-text+ mb-2">
                    Subject *
                  </label>
                  <TyInput
                    type="text"
                    placeholder="Brief subject line"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.detail.value)}
                    className={`w-full ${errors.subject ? 'ty-border-danger' : ''}`}
                  />
                  {errors.subject && (
                    <p className="text-xs ty-text-danger mt-1 flex items-center gap-1">
                      <TyIcon name="alert-circle" size="12" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ty-text+ mb-2">
                    Message *
                  </label>
                  <textarea
                    placeholder="Tell us about your project, questions, or how we can help..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    className={`
                      w-full p-3 border rounded-lg ty-input resize-y min-h-[120px] max-h-[300px]
                      focus:outline-none focus:ring-2 focus:ring-opacity-50
                      ${errors.message ? 'ty-border-danger focus:ty-border-danger' : 'ty-border focus:ty-border-primary'}
                    `}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.message ? (
                      <p className="text-xs ty-text-danger flex items-center gap-1">
                        <TyIcon name="alert-circle" size="12" />
                        {errors.message}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs ty-text- ml-auto">
                      {formData.message.length}/1000
                    </span>
                  </div>
                </div>

                {/* Priority and Contact Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Priority Level
                    </label>
                    <TyDropdown
                      value={formData.priority}
                      onChange={(e) => {
                        const selectedOption = e.detail.option
                        const value = selectedOption?.getAttribute('value') || 'medium'
                        handleInputChange('priority', value)
                      }}
                      className="w-full"
                      placeholder="Select priority level"
                    >
                      <TyOption value="low">Low - General inquiry</TyOption>
                      <TyOption value="medium">Medium - Business question</TyOption>
                      <TyOption value="high">High - Urgent matter</TyOption>
                      <TyOption value="critical">Critical - Immediate attention needed</TyOption>
                    </TyDropdown>
                  </div>

                  <div>
                    <label className="block text-sm font-medium ty-text+ mb-2">
                      Preferred Contact Method
                    </label>
                    <TyDropdown
                      value={formData.contactMethod}
                      onChange={(e) => {
                        const selectedOption = e.detail.option
                        const value = selectedOption?.getAttribute('value') || 'email'
                        handleInputChange('contactMethod', value)
                      }}
                      className="w-full"
                      placeholder="Select contact method"
                    >
                      <TyOption value="email">Email</TyOption>
                      <TyOption value="phone">Phone Call</TyOption>
                      <TyOption value="text">Text Message</TyOption>
                      <TyOption value="any">Any Method</TyOption>
                    </TyDropdown>
                  </div>
                </div>

                {/* Newsletter Subscription */}
                <div className="ty-bg-primary- p-4 rounded-lg border ty-border-">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newsletter}
                      onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                      className="mt-1 w-4 h-4 ty-text-primary border-2 ty-border rounded focus:ring-2 focus:ring-opacity-50 focus:ty-border-primary"
                    />
                    <div>
                      <span className="text-sm font-medium ty-text+">
                        Subscribe to our newsletter
                      </span>
                      <p className="text-xs ty-text- mt-1">
                        Get updates about new features, tips, and industry insights.
                        You can unsubscribe at any time.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t ty-border-">
                <TyButton
                  type="submit"
                  flavor="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 ${isSubmitting ? 'cursor-not-allowed opacity-75' : 'hover:shadow-lg'
                    } transition-all duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <TyIcon name="send" size="18" />
                      Send Message
                    </>
                  )}
                </TyButton>

                <TyButton
                  type="button"
                  flavor="secondary"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={() => {
                    setFormData({
                      name: '',
                      email: '',
                      company: '',
                      phone: '',
                      subject: '',
                      message: '',
                      priority: 'medium',
                      contactMethod: 'email',
                      newsletter: false
                    })
                    setErrors({})
                  }}
                  className="flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200"
                >
                  <TyIcon name="refresh-cw" size="18" />
                  Clear Form
                </TyButton>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Contact Information & Features */}
        <div className="space-y-6">

          {/* Contact Information */}
          <div className="ty-elevated rounded-xl p-6 border ty-border">
            <h3 className="text-lg font-semibold mb-4 ty-text++ flex items-center gap-2">
              <TyIcon name="map-pin" size="20" />
              Contact Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TyIcon name="mail" size="18" className="ty-text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium ty-text+">Email</p>
                  <p className="text-sm ty-text-">hello@tycomponents.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TyIcon name="phone" size="18" className="ty-text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium ty-text+">Phone</p>
                  <p className="text-sm ty-text-">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TyIcon name="clock" size="18" className="ty-text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium ty-text+">Business Hours</p>
                  <p className="text-sm ty-text-">Mon-Fri: 9AM - 6PM PST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TyIcon name="globe" size="18" className="ty-text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium ty-text+">Location</p>
                  <p className="text-sm ty-text-">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Features */}
          <div className="ty-elevated rounded-xl p-6 border ty-border">
            <h3 className="text-lg font-semibold mb-4 ty-text++ flex items-center gap-2">
              <TyIcon name="check-circle" size="20" />
              Form Features
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full ty-bg-success"></div>
                <span className="text-sm ty-text-">Real-time validation</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full ty-bg-success"></div>
                <span className="text-sm ty-text-">Form state management</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full ty-bg-success"></div>
                <span className="text-sm ty-text-">Loading states</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full ty-bg-success"></div>
                <span className="text-sm ty-text-">Error handling</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full ty-bg-success"></div>
                <span className="text-sm ty-text-">Success feedback</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full ty-bg-success"></div>
                <span className="text-sm ty-text-">Responsive design</span>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="ty-elevated rounded-xl p-4 border ty-border ty-bg-primary-">
            <h4 className="text-sm font-semibold mb-2 ty-text++">Debug Info</h4>
            <div className="space-y-1 text-xs ty-text-">
              <div>Submitting: {isSubmitting ? 'Yes' : 'No'}</div>
              <div>Name: {formData.name || 'Empty'}</div>
              <div>Email: {formData.email || 'Empty'}</div>
              <div>Errors: {Object.keys(errors).length}</div>
            </div>
          </div>

          {/* Response Time */}
          <div className="ty-elevated rounded-xl p-6 border ty-border ty-bg-info-">
            <h3 className="text-lg font-semibold mb-2 ty-text-info++">
              Quick Response
            </h3>
            <p className="text-sm ty-text-info leading-relaxed">
              We typically respond to all inquiries within 24 hours during business days.
              For urgent matters, please mark your message as "Critical" priority.
            </p>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      <TyModal ref={modalRef} className="max-w-md">
        <div className="p-8 text-center ty-floating rounded-lg">
          <div className="w-16 h-16 ty-bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <TyIcon name="check" size="32" className="ty-text-success++" />
          </div>

          <h2 className="text-xl font-semibold ty-text++ mb-2">
            Message Sent Successfully!
          </h2>

          <p className="ty-text- mb-6 leading-relaxed">
            Thank you for contacting us. We've received your message and will get back to you
            within 24 hours during business days.
          </p>

          <TyButton
            flavor="success"
            onClick={() => modalRef.current?.hide()}
            className="flex items-center gap-2 mx-auto"
          >
            <TyIcon name="check" size="16" />
            Got it!
          </TyButton>
        </div>
      </TyModal>

    </AppLayout>
  )
}
