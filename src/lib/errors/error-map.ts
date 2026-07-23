import { AppError } from '@/lib/errors/AppError'

export function getErrorMessage(error: unknown) {
  if (error instanceof AppError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}
