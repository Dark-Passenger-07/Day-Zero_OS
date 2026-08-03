import type { EmailMessage, EmailQueuePayload, EmailSendResult } from './types'
import { getEmailProvider } from './providers/email-factory'

class EmailQueueService {
  private queue: EmailQueuePayload[] = []
  private isProcessing = false

  async enqueue(message: EmailMessage, maxAttempts = 4): Promise<EmailQueuePayload> {
    const job: EmailQueuePayload = {
      id: `job-${crypto.randomUUID()}`,
      message,
      attemptCount: 0,
      maxAttempts,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.queue.push(job)
    this.processNextJob()
    return job
  }

  private async processNextJob() {
    if (this.isProcessing) return
    const pendingJob = this.queue.find((j) => j.status === 'queued')
    if (!pendingJob) return

    this.isProcessing = true
    pendingJob.status = 'processing'
    pendingJob.attemptCount += 1
    pendingJob.updatedAt = new Date().toISOString()

    const provider = getEmailProvider()
    try {
      const result: EmailSendResult = await provider.sendEmail(pendingJob.message)
      if (result.success) {
        pendingJob.status = 'dispatched'
        pendingJob.updatedAt = new Date().toISOString()
      } else {
        this.handleFailure(pendingJob, result.error || 'Provider returned error')
      }
    } catch (err: any) {
      this.handleFailure(pendingJob, err.message || 'Unhandled exception in provider execution')
    } finally {
      this.isProcessing = false
      if (typeof setImmediate !== 'undefined') {
        setImmediate(() => this.processNextJob())
      } else {
        setTimeout(() => this.processNextJob(), 50)
      }
    }
  }

  private handleFailure(job: EmailQueuePayload, errorMsg: string) {
    job.lastError = errorMsg
    job.updatedAt = new Date().toISOString()

    if (job.attemptCount >= job.maxAttempts) {
      job.status = 'dlq'
      console.error(`[EMAIL QUEUE] Job ${job.id} moved to Dead Letter Queue (DLQ) after ${job.attemptCount} failed attempts. Error: ${errorMsg}`)
    } else {
      job.status = 'queued'
      const backoffMs = Math.min(1000 * Math.pow(2, job.attemptCount), 30000)
      console.warn(`[EMAIL QUEUE] Job ${job.id} failed attempt ${job.attemptCount}/${job.maxAttempts}. Retrying in ${backoffMs}ms... Error: ${errorMsg}`)
      setTimeout(() => this.processNextJob(), backoffMs)
    }
  }

  getJobs(): EmailQueuePayload[] {
    return [...this.queue]
  }
}

export const emailQueueService = new EmailQueueService()
