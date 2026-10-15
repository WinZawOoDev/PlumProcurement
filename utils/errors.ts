import { tMessage } from '../i18n'
import { DatabaseError } from '../services/errors'

/**
 * Returns a message that is safe to show to the user.
 *
 * - `DatabaseError` messages are already localized keys/text raised by the
 *   service layer, so they are returned as-is.
 * - Anything else (TypeErrors, native bridge failures, etc.) is replaced with
 *   the generic localized message so internal details never reach the UI.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof DatabaseError && error.message) {
    return error.message
  }
  return tMessage('ERROR_GENERIC')
}
