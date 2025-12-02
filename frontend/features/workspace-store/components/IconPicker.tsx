/**
 * Icon Picker Component - Re-export from shared
 * 
 * DEPRECATED: Import from @/frontend/shared/components instead
 * This file is kept for backward compatibility.
 * 
 * @module frontend/features/workspace-store/components/IconPicker
 */

"use client"

// Re-export from SSOT
export { 
  IconPicker as default,
  IconPicker,
  DynamicIcon,
  getIconComponent,
  getIconStyle,
  type IconPickerProps,
  type IconName,
} from "@/frontend/shared/components/IconPicker";

// Legacy exports for backward compatibility
export { 
  DynamicIcon as WorkspaceIcon,
  getIconComponent as getIconByName,
} from "@/frontend/shared/components/IconPicker";
