/**
 * Shared Components - SINGLE SOURCE OF TRUTH
 * 
 * Central exports for shared components.
 * Import from here instead of feature-specific components.
 * 
 * @module frontend/shared/components
 */

// Icon Picker
export { IconPicker, DynamicIcon, getIconComponent, getIconStyle, type IconPickerProps, type IconName } from "./IconPicker";

// Color Picker - Now at frontend/shared/ui/color-picker
// import { PresetColorPicker, InlineColorPicker, SimpleColorPicker } from "@/frontend/shared/ui/color-picker";
