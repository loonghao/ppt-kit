/**
 * PPT Bridge Operations - Notification
 * 
 * Operations for showing notifications using Office.js built-in message banner.
 * Uses Office.context.ui.displayDialogAsync for modal dialogs
 * and custom message banner for non-blocking notifications.
 * 
 * @see https://learn.microsoft.com/en-us/office/dev/add-ins/develop/dialog-api-in-office-add-ins
 */

import type { OperationResult } from './types'
import { isOfficeEnvironment } from './utils'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationOptions {
  type?: NotificationType
  duration?: number  // milliseconds, 0 for persistent
  title?: string
}

/**
 * Show a notification message using Office.js message banner
 * Falls back to console.log if Office is not available
 */
export function showNotification(
  message: string,
  options: NotificationOptions = {}
): void {
  const { type = 'info', duration = 3000, title } = options
  
  if (!isOfficeEnvironment()) {
    // Fallback for development
    console.log(`[${type.toUpperCase()}] ${title ? title + ': ' : ''}${message}`)
    return
  }

  try {
    // Use Office.context.ui.displayDialogAsync for important messages
    // For quick notifications, use the Office notification API
    const notificationMessage = title ? `${title}: ${message}` : message
    
    // Office.js notification using addin commands
    if (typeof Office !== 'undefined' && Office.addin && Office.addin.showAsTaskpane) {
      // For taskpane add-ins, we can use the built-in notification
      Office.addin.setStartupBehavior?.(Office.StartupBehavior.load)
    }
    
    // Use document.setSelectedDataAsync with callback for status feedback
    // This is a workaround since PowerPoint doesn't have a native notification API
    // We'll dispatch a custom event that the UI can listen to
    const event = new CustomEvent('ppt-notification', {
      detail: {
        message: notificationMessage,
        type,
        duration,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(event)
    
    // Also log to console for debugging
    const logMethod = type === 'error' ? console.error : 
                      type === 'warning' ? console.warn : 
                      console.log
    logMethod(`[PPT Kit] ${notificationMessage}`)
    
  } catch (error) {
    console.error('[PPT Kit] Failed to show notification:', error)
  }
}

/**
 * Show success notification
 */
export function showSuccess(message: string, title?: string): void {
  showNotification(message, { type: 'success', title })
}

/**
 * Show error notification
 */
export function showError(message: string, title?: string): void {
  showNotification(message, { type: 'error', title, duration: 5000 })
}

/**
 * Show info notification
 */
export function showInfo(message: string, title?: string): void {
  showNotification(message, { type: 'info', title })
}

/**
 * Show warning notification
 */
export function showWarning(message: string, title?: string): void {
  showNotification(message, { type: 'warning', title, duration: 4000 })
}

/**
 * Show a dialog with custom content
 * Uses Office.context.ui.displayDialogAsync
 */
export async function showDialog(
  url: string,
  options?: {
    width?: number
    height?: number
    displayInIframe?: boolean
  }
): Promise<OperationResult<{ dialog: any }>> {
  if (!isOfficeEnvironment()) {
    return { success: false, error: 'Office environment not available' }
  }

  return new Promise((resolve) => {
    try {
      const dialogOptions = {
        width: options?.width ?? 30,
        height: options?.height ?? 40,
        displayInIframe: options?.displayInIframe ?? false
      }

      Office.context.ui.displayDialogAsync(
        url,
        dialogOptions,
        (asyncResult: any) => {
          if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            resolve({
              success: false,
              error: `${asyncResult.error.code}: ${asyncResult.error.message}`
            })
          } else {
            resolve({
              success: true,
              data: { dialog: asyncResult.value }
            })
          }
        }
      )
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}

/**
 * Close the current dialog
 */
export function closeDialog(dialog: any): void {
  try {
    dialog?.close()
  } catch (error) {
    console.error('[PPT Kit] Failed to close dialog:', error)
  }
}

// Declare Office global for TypeScript
declare const Office: any
