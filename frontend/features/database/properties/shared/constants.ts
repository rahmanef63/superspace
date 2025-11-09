/**
 * Shared constants for property editors
 * 
 * Centralized constants to maintain consistency across all property types.
 */

/**
 * Standard color palette for Select/Multi-Select options
 * Used consistently across SelectEditor, MultiSelectEditor, and OptionsManager
 */
export const COLOR_PALETTE = [
  '#6b7280', // Gray
  '#f59e0b', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
] as const;

/**
 * Color palette with names for display purposes
 */
export const COLOR_PALETTE_WITH_NAMES = [
  { name: 'Gray', value: '#6b7280' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
] as const;

/**
 * Get a random color from the palette
 */
export function getRandomColor(): string {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
}
