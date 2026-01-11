/**
 * PPT Bridge Module
 * 
 * Exports all PPT operations for use by MCP tools and UI components.
 */

// Export operations (primary API)
export * from './operations'

// Export sync module
export {
  initializeSync,
  stopSync,
  forceSync,
  getSyncState,
  isSyncRunning,
  addSyncEventListener,
  type SyncEvent,
  type SyncEventType
} from './sync'

// Export generator functions with explicit names to avoid conflicts
export { generatePPT, addContent } from './generator'

