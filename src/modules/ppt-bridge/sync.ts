/**
 * PPT Sync Module
 * 
 * Provides real-time synchronization between the add-in and PowerPoint.
 * Monitors selection changes, slide navigation, and presentation state.
 */

import { isOfficeAvailable, getPresentationInfo, type PresentationInfo } from './operations'

// Sync state
interface SyncState {
  connected: boolean
  currentSlide: number
  totalSlides: number
  selectedObjects: number
  presentationTitle: string
  lastSyncTime: Date | null
}

// Event types
export type SyncEventType = 
  | 'connected'
  | 'disconnected'
  | 'slide_changed'
  | 'selection_changed'
  | 'presentation_changed'
  | 'sync_error'

export interface SyncEvent {
  type: SyncEventType
  timestamp: Date
  data: Partial<SyncState>
}

type SyncEventListener = (event: SyncEvent) => void

// Module state
let syncState: SyncState = {
  connected: false,
  currentSlide: 1,
  totalSlides: 0,
  selectedObjects: 0,
  presentationTitle: '',
  lastSyncTime: null
}

let syncInterval: ReturnType<typeof setInterval> | null = null
let eventListeners: SyncEventListener[] = []
let isInitialized = false

/**
 * Add event listener for sync events
 */
export function addSyncEventListener(listener: SyncEventListener): () => void {
  eventListeners.push(listener)
  return () => {
    const index = eventListeners.indexOf(listener)
    if (index >= 0) eventListeners.splice(index, 1)
  }
}

/**
 * Emit sync event to all listeners
 */
function emitSyncEvent(event: SyncEvent): void {
  for (const listener of eventListeners) {
    try {
      listener(event)
    } catch (e) {
      console.error('[PPT Sync] Event listener error:', e)
    }
  }
}

/**
 * Get current sync state
 */
export function getSyncState(): SyncState {
  return { ...syncState }
}

/**
 * Perform sync with PowerPoint
 */
async function performSync(): Promise<void> {
  if (!isOfficeAvailable()) {
    if (syncState.connected) {
      syncState.connected = false
      emitSyncEvent({
        type: 'disconnected',
        timestamp: new Date(),
        data: { connected: false }
      })
    }
    return
  }

  try {
    const result = await getPresentationInfo()
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get presentation info')
    }

    const info = result.data
    const wasConnected = syncState.connected
    const previousSlide = syncState.currentSlide
    const previousTotal = syncState.totalSlides

    // Update state
    syncState = {
      connected: true,
      currentSlide: info.currentSlideIndex + 1,
      totalSlides: info.slideCount,
      selectedObjects: 0, // Will be updated with selection API
      presentationTitle: info.title,
      lastSyncTime: new Date()
    }

    // Emit events based on changes
    if (!wasConnected) {
      emitSyncEvent({
        type: 'connected',
        timestamp: new Date(),
        data: syncState
      })
    }

    if (previousSlide !== syncState.currentSlide) {
      emitSyncEvent({
        type: 'slide_changed',
        timestamp: new Date(),
        data: { currentSlide: syncState.currentSlide }
      })
    }

    if (previousTotal !== syncState.totalSlides) {
      emitSyncEvent({
        type: 'presentation_changed',
        timestamp: new Date(),
        data: { totalSlides: syncState.totalSlides }
      })
    }

  } catch (error) {
    if (syncState.connected) {
      syncState.connected = false
      emitSyncEvent({
        type: 'sync_error',
        timestamp: new Date(),
        data: { connected: false }
      })
    }
    console.error('[PPT Sync] Sync error:', error)
  }
}

/**
 * Initialize sync module
 */
export function initializeSync(intervalMs: number = 2000): void {
  if (isInitialized) return
  isInitialized = true

  // Initial sync
  performSync()

  // Start periodic sync
  syncInterval = setInterval(performSync, intervalMs)

  console.log('[PPT Sync] Initialized with interval:', intervalMs, 'ms')
}

/**
 * Stop sync module
 */
export function stopSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
  isInitialized = false
  console.log('[PPT Sync] Stopped')
}

/**
 * Force immediate sync
 */
export async function forceSync(): Promise<SyncState> {
  await performSync()
  return getSyncState()
}

/**
 * Check if sync is running
 */
export function isSyncRunning(): boolean {
  return syncInterval !== null
}
