import type { EmailMessage, EmailProvider, EmailSendResult } from '../types'

export class ConsoleEmailProvider implements EmailProvider {
  name = 'console'

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    const recipient = typeof message.to === 'string' ? message.to : message.to.email
    console.log(`[EMAIL SIMULATOR (${this.name})] Message dispatched:`)
    console.log(`  To: ${recipient}`)
    console.log(`  Subject: ${message.subject}`)
    console.log(`  Text Payload:\n${message.text}`)

    return {
      success: true,
      messageId: `mock-msg-${crypto.randomUUID()}`,
    }
  }
}
