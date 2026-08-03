export type EmailRecipient = {
  email: string
  name?: string
}

export type EmailMessage = {
  to: string | EmailRecipient
  from?: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export type EmailSendResult = {
  success: boolean
  messageId?: string
  error?: string
}

export interface EmailProvider {
  name: string
  sendEmail(message: EmailMessage): Promise<EmailSendResult>
}

export type EmailQueuePayload = {
  id: string
  message: EmailMessage
  attemptCount: number
  maxAttempts: number
  status: 'queued' | 'processing' | 'dispatched' | 'failed' | 'dlq'
  lastError?: string
  createdAt: string
  updatedAt: string
}
