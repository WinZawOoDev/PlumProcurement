/**
 * Single import point for error types used by the UI layer. UI code must not
 * import from `database/*` directly; go through `services/*` instead.
 */
export { DatabaseError } from '../database/connection'
