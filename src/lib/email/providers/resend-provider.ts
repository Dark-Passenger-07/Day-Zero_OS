import type { EmailMessage, EmailProvider, EmailSendResult } from '../types'

export class ResendEmailProvider implements EmailProvider {
  name = 'resend'
  private apiKey: string
  private defaultFrom: string

  constructor(apiKey: string, defaultFrom = 'Day Zero OS <invites@dayzero.dev>') {
    this.apiKey = apiKey
    this.defaultFrom = defaultFrom
  }

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    const recipient = typeof message.to === 'string' ? message.to : message.to.email
    const fromAddress = message.from || this.defaultFrom

    try {
      const response = await fetch('/api/resend/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [recipient],
          subject: message.subject,
          html: message.html,
          text: message.text,
          reply_to: message.replyTo,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Resend API returned error status',
        }
      }

      return {
        success: true,
        messageId: data.id,
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to dispatch email via Resend',
      }
    }
  }
}
