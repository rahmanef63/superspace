/**
 * Type definitions for hr feature
 */

export interface hrItem {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface hrConfig {
  enabled: boolean
  settings?: Record<string, unknown>
}
