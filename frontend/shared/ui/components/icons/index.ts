// Main exports
export { IconPicker } from "./IconPicker";
export { ColorPicker } from "./ColorPicker";
export { IconGrid } from "./IconGrid";

// Data exports
export {
  ICON_CATEGORIES,
  ICONS_BY_CATEGORY,
  COLOR_PRESETS,
  BACKGROUND_PRESETS,
  COMMON_ICONS,
  getIconComponent,
  getColorValue,
  searchIcons,
  iconFromName, // Legacy support for backward compatibility
} from "./icon-data";

export type { IconData, ColorOption, IconCategory } from "./icon-data";
