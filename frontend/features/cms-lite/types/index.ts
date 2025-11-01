/**
 * Type definitions for cms-lite feature
 */

export interface CmsLiteItem {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface CmsLiteConfig {
  enabled: boolean
  settings?: Record<string, unknown>
}
