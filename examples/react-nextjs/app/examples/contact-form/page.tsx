'use client'

import { useRef, useState } from 'react'
import { AppLayout } from '../../../lib/app-layout'
import {
  TyButton,
  TyCheckbox,
  TyIcon,
  TyInput,
  TyModal,
  TyOption,
  TySelect,
  TyTextarea,
  type TyModalRef,
} from 'tyrell-react'

// Pretend server: the only check the browser can't make.
async function sendMessage(data: Record<string, FormDataEntryValue>) {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  if (String(data.email).endsWith('@example.com')) {
    return { errors: { email: 'example.com addresses are not accepted. Use your real address.' } }
  }
  return { errors: {} as Record<string, string> }
}

const PRIORITIES = [
  { value: 'low', label: 'Low', detail: 'General inquiry' },
  { value: 'medium', label: 'Medium', detail: 'Business question' },
  { value: 'high', label: 'High', detail: 'Urgent matter' },
  { value: 'critical', label: 'Critical', detail: 'Needs attention today' },
]

export default function ContactFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Server-side errors only. Required fields, formats and lengths are checked
  // by the fields themselves: onSubmit doesn't run until they all pass.
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<Record<string, FormDataEntryValue> | null>(null)
  const [messageLength, setMessageLength] = useState(0)
  const modalRef = useRef<TyModalRef>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setIsSubmitting(true)
    const { errors } = await sendMessage(data)
    setIsSubmitting(false)
    setServerErrors(errors)
    if (Object.keys(errors).length === 0) {
      setSent(data)
      modalRef.current?.show()
      form.reset()
      setMessageLength(0)
    }
  }

  const clearServerError = (field: string) => {
    if (serverErrors[field]) setServerErrors(({ [field]: _, ...rest }) => rest)
  }

  return (
    <AppLayout>
      <div className="mb-8 pb-4 border-b ty-border+">
        <h1 className="text-3xl font-bold mb-2 ty-text++">Contact Form Example</h1>
        <p className="text-base leading-relaxed ty-text-">
          A plain <code>&lt;form&gt;</code> with no validation code. Each field carries its own rules
          (<code>required</code>, <code>type=&quot;email&quot;</code>, <code>pattern</code>,{' '}
          <code>minLength</code>); <code>onSubmit</code> only runs once they all pass.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <div className="ty-elevated rounded-xl p-8 border ty-border">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 ty-text++">Get in Touch</h2>
              <p className="ty-text- leading-relaxed">
                Press Send with empty fields to see the messages. Try an <code>@example.com</code>{' '}
                address to see a server-side error.
              </p>
            </div>

            <form onSubmit={handleSubmit} onReset={() => setServerErrors({})} className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-lg font-medium ty-text+ border-b ty-border- pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TyInput
                    name="name"
                    label="Full name"
                    placeholder="Ada Lovelace"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                  <TyInput
                    name="email"
                    type="email"
                    label="Email address"
                    placeholder="you@company.com"
                    required
                    error={serverErrors.email ?? ''}
                    onChange={() => clearServerError('email')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TyInput name="company" label="Company" placeholder="Analytical Engines Ltd." />
                  <TyInput
                    name="phone"
                    type="tel"
                    label="Phone"
                    placeholder="+1 555 123 4567"
                    pattern="\+?[0-9 \(\)\-]{7,20}"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-medium ty-text+ border-b ty-border- pb-2">
                  Message Details
                </h3>

                <TyInput
                  name="subject"
                  label="Subject"
                  placeholder="Brief subject line"
                  required
                  minLength={5}
                  maxLength={120}
                  tooShortMessage="A few more words, please (at least {minlength} characters)"
                />

                <div>
                  <TyTextarea
                    name="message"
                    label="Message"
                    placeholder="Tell us about your project, questions, or how we can help..."
                    required
                    rows={6}
                    onChange={(e) => setMessageLength(String(e.detail.value ?? '').length)}
                  />
                  <p className="text-xs ty-text- mt-1 text-right">{messageLength} characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TySelect name="priority" label="Priority" value="medium" noClear>
                    {PRIORITIES.map((p) => (
                      <TyOption key={p.value} value={p.value}>
                        {p.label} — {p.detail}
                      </TyOption>
                    ))}
                  </TySelect>

                  <TySelect name="contactMethod" label="Preferred contact method" value="email" noClear>
                    <TyOption value="email">Email</TyOption>
                    <TyOption value="phone">Phone call</TyOption>
                    <TyOption value="text">Text message</TyOption>
                    <TyOption value="any">Any method</TyOption>
                  </TySelect>
                </div>

                {/* ty-checkbox is just the box: the <label> around it names it and forwards clicks */}
                <label className="flex items-start gap-3 cursor-pointer ty-bg-primary- p-4 rounded-lg border ty-border-">
                  <TyCheckbox name="newsletter" value="yes" className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium ty-text+">Subscribe to our newsletter</span>
                    <span className="block text-xs ty-text- mt-1">
                      Updates about new features and tips. Unsubscribe any time.
                    </span>
                  </span>
                </label>
              </section>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t ty-border-">
                {/* No type prop: ty-button already submits its form (validation included).
                    TyButton type="submit" in tyrell-react TC57 also fires a synthetic
                    submit event that skips validation and doubles onSubmit. */}
                <TyButton flavor="primary" size="lg" loading={isSubmitting}>
                  <TyIcon slot="start" name="send" />
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </TyButton>
                <TyButton type="reset" appearance="ghost" size="lg" disabled={isSubmitting}>
                  <TyIcon slot="start" name="refresh-cw" />
                  Clear form
                </TyButton>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="ty-elevated rounded-xl p-6 border ty-border">
            <h3 className="text-lg font-semibold mb-4 ty-text++ flex items-center gap-2">
              <TyIcon name="check-circle" size="20" />
              What the form does for you
            </h3>
            <ul className="space-y-3 text-sm ty-text-">
              {[
                'Blocks the submit until every rule passes',
                'Shows each message under its field, focuses the first',
                'Shows a message when you leave a field you edited',
                'Clears it as soon as the value is fixed',
                'Enter in any field submits, like a native input',
                'Messages in the browser’s language',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-2 h-2 mt-1.5 rounded-full ty-bg-success shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="ty-elevated rounded-xl p-6 border ty-border">
            <h3 className="text-lg font-semibold mb-4 ty-text++ flex items-center gap-2">
              <TyIcon name="map-pin" size="20" />
              Contact Information
            </h3>
            <div className="space-y-4">
              {[
                ['mail', 'Email', 'hello@tycomponents.com'],
                ['phone', 'Phone', '+1 (555) 123-4567'],
                ['clock', 'Business Hours', 'Mon-Fri: 9AM - 6PM PST'],
                ['globe', 'Location', 'San Francisco, CA'],
              ].map(([icon, title, text]) => (
                <div key={title} className="flex items-start gap-3">
                  <TyIcon name={icon} size="18" className="ty-text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium ty-text+">{title}</p>
                    <p className="text-sm ty-text-">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TyModal ref={modalRef} label="Message sent">
        <div className="p-8 ty-floating rounded-xl max-w-md">
          <div className="w-14 h-14 ty-bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <TyIcon name="check" size="32" className="ty-text-success++" />
          </div>
          <h2 className="text-xl font-semibold ty-text++ mb-2 text-center">Message sent</h2>
          <p className="ty-text- mb-4 text-center">We&apos;ll get back to you within 24 hours.</p>
          {sent && (
            <pre className="text-xs ty-bg-neutral- rounded-lg p-3 mb-6 overflow-auto max-h-48">
              {JSON.stringify(sent, null, 2)}
            </pre>
          )}
          <div className="flex justify-center">
            <TyButton flavor="success" onClick={() => modalRef.current?.hide()}>
              Got it
            </TyButton>
          </div>
        </div>
      </TyModal>
    </AppLayout>
  )
}
