export type AppErrorCode =
  | 'CONFIGURATION_ERROR'
  | 'AUTH_NOT_IMPLEMENTED'
  | 'SUPABASE_NOT_CONFIGURED'
  | 'UNKNOWN_ERROR'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly cause?: unknown

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.cause = cause
  }
}
