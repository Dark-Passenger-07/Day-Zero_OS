/**
 * Sanitizes input strings to prevent basic cross-site scripting (XSS) or markup injections.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return ''
  // Strip HTML tag structures
  return input.replace(/<\/?[^>]+(>|$)/g, '').trim()
}
