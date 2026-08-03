import type { EmailMessage, EmailProvider, EmailSendResult } from '../types'

export class SmtpEmailProvider implements EmailProvider {
  name = 'smtp'
  private endpointUrl: string

  constructor(endpointUrl?: string) {
    this.endpointUrl = endpointUrl || '/api/v1/send-email'
  }

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        return { success: false, error: `SMTP Endpoint returned status ${response.status}` }
      }

      const data = await response.json().catch(() => ({}))
      return { success: true, messageId: data.messageId || `smtp-${Date.now()}` }
    } catch (err: any) {
      return { success: false, error: err.message || 'SMTP dispatch failed' }
    }
  }
}
