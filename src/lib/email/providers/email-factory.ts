import type { EmailProvider } from '../types'
import { ConsoleEmailProvider } from './console-provider'
import { ResendEmailProvider } from './resend-provider'
import { SmtpEmailProvider } from './smtp-provider'

export function getEmailProvider(): EmailProvider {
  const providerType = (import.meta.env.VITE_EMAIL_PROVIDER || 'console').toLowerCase()
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || ''
  const fromEmail = import.meta.env.VITE_INVITATION_FROM_EMAIL || 'Day Zero OS <invites@dayzero.dev>'

  if (providerType === 'resend' && resendApiKey) {
    return new ResendEmailProvider(resendApiKey, fromEmail)
  }

  if (providerType === 'smtp') {
    return new SmtpEmailProvider(import.meta.env.VITE_SMTP_ENDPOINT)
  }

  return new ConsoleEmailProvider()
}
