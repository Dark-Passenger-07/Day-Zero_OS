import React, { useState } from 'react'
import { HelpCircle, Mail, MessageSquare, Bug, Lightbulb, CheckCircle } from 'lucide-react'
import { LegalLayout } from './LegalLayout'

export default function Support() {
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'bug' | 'feature'>('feedback')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return

    // Open user's email client with prefilled mailto as lightweight feedback channel
    const mailSubject = encodeURIComponent(`[Day Zero OS ${feedbackType.toUpperCase()}] ${subject || 'User Submission'}`)
    const mailBody = encodeURIComponent(`${message}\n\n---\nSent from Day Zero OS v1.0.0`)
    window.location.href = `mailto:support@dayzeroos.com?subject=${mailSubject}&body=${mailBody}`

    setSubmitted(true)
  }

  return (
    <LegalLayout
      title="Support & Feedback"
      subtitle="We are here to help you build faster • Day Zero OS v1.0.0"
      icon={<HelpCircle size={22} className="text-amber-400" />}
    >
      {/* Frequently Asked Questions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>

        <div className="space-y-3">
          <div className="bg-card border border-border p-4 rounded-xl">
            <h3 className="font-medium text-foreground text-sm">How does Demo/Offline mode work?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              If Supabase credentials are not supplied or if you work offline, Day Zero OS seamlessly runs in local mock mode, saving data safely to your browser session.
            </p>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl">
            <h3 className="font-medium text-foreground text-sm">Can I export my workspace data?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Yes! You can export all projects, knowledge base entries, and asset metadata at any time from <strong>Settings &gt; Import / Export</strong> as a standard JSON file.
            </p>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl">
            <h3 className="font-medium text-foreground text-sm">Is AI required to use Day Zero OS?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No. AI is an optional enhancement that assists users but is never required to use the platform.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Contact & Feedback Form */}
      <section className="space-y-4 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Send Feedback or Report an Issue</h2>
            <p className="text-xs text-muted-foreground">Directly reach out to our core team</p>
          </div>
          <a
            href="mailto:support@dayzeroos.com"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <Mail size={13} /> support@dayzeroos.com
          </a>
        </div>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center space-y-2">
            <CheckCircle size={32} className="text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">Thank you for your feedback!</h3>
            <p className="text-xs text-muted-foreground">
              Your default mail application was launched. You can also directly email support@dayzeroos.com.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setMessage('')
                setSubject('')
              }}
              className="mt-2 text-xs bg-secondary border border-border hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-md cursor-pointer"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border p-5 rounded-xl space-y-4">
            {/* Feedback Category Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('feedback')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  feedbackType === 'feedback'
                    ? 'bg-secondary border-ring text-foreground'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare size={13} /> Feedback
              </button>

              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  feedbackType === 'bug'
                    ? 'bg-secondary border-ring text-foreground'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bug size={13} /> Report Bug
              </button>

              <button
                type="button"
                onClick={() => setFeedbackType('feature')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  feedbackType === 'feature'
                    ? 'bg-secondary border-ring text-foreground'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Lightbulb size={13} /> Request Feature
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your message..."
                className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your thoughts, issues, or requested features..."
                className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-ring resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Submit via Email
            </button>
          </form>
        )}
      </section>
    </LegalLayout>
  )
}
