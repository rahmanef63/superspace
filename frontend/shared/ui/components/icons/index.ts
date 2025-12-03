/**
 * Icon Components - Re-exports from main icons module
 *
 * This file provides convenient access to icon components and utilities.
 * The main icon system is located at: frontend/shared/ui/icons/
 *
 * @example
 * import { IconPicker, ColorPicker, DynamicIcon } from "@/frontend/shared/ui/components/icons";
 */

// Re-export everything from the main icons module
export {
  // UI Components
  IconPicker,
  IconGrid,

  // Dynamic Icon Components
  DynamicIcon,
  FeatureIcon,
  CategoryIcon,

  // Icon utilities
  getIconComponent,
  normalizeIconName,
  iconExists,
  getAllIconNames,
  getFeatureIconName,
  getCategoryIconName,
  iconFromName,

  // Search utilities
  searchIcons,
  getIconsByCategory,
  getAllIcons,
  getIconCategory,
  isIconInCategory,
  getRandomIcons,
  getSuggestedIcons,
  searchIconsInCategory,

  // Color utilities
  getColorValue,
  isThemeColor,
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  lightenColor,
  darkenColor,
  getContrastColor,
  getColorsByGroup,
  isValidHexColor,
  ensureHexPrefix,

  // Constants
  ICON_CATEGORIES,
  ICONS_BY_CATEGORY,
  COLOR_PRESETS,
  BACKGROUND_PRESETS,
  COMMON_ICONS,
  FEATURE_ICONS,
  CATEGORY_ICONS,
  DEFAULT_ICON,
  DEFAULT_FEATURE_ICON,
  DEFAULT_CATEGORY_ICON,

  // Types
  type IconName,
  type IconData,
  type IconCategory,
  type ColorOption,
  type DynamicIconProps,
  type IconPickerProps,
  type IconGridProps,
  type IconLookup,
} from "@/frontend/shared/ui/icons";

// Re-export ColorPicker from its new location
export {
  ColorPicker,
  SimpleColorPicker,
  PresetColorPicker,
  InlineColorPicker,
  type ColorPickerProps,
  type SimpleColorPickerProps,
  type PresetColorPickerProps,
  type InlineColorPickerProps,
} from "@/frontend/shared/ui/color-picker";
