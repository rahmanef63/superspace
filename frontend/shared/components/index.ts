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

// Color Picker - Available at frontend/shared/foundation/utils/color-picker
// import { PresetColorPicker, InlineColorPicker, SimpleColorPicker } from "@/frontend/shared/foundation/utils/color-picker";
