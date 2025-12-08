/**
 * Type definitions for accounting feature
 */

export interface accountingItem {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface accountingConfig {
  enabled: boolean
  settings?: Record<string, unknown>
}
