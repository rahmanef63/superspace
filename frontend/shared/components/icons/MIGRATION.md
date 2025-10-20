# Icon System Migration Guide

## 📋 Overview

Icon system telah dipindahkan dari `frontend/shared/pages/icons.ts` ke `frontend/shared/components/icons/` dengan fitur yang lebih lengkap seperti di Notion.

## 🔄 Migration Steps

### Before (Old System)
```tsx
import { iconFromName } from "@/pages/icons";

const IconComponent = iconFromName("Heart");
```

### After (New System)

#### Option 1: Using getIconComponent (Recommended)
```tsx
import { getIconComponent } from "@/frontend/shared/components/icons";

const IconComponent = getIconComponent("Heart");
return <IconComponent className="size-4" />;
```

#### Option 2: Using IconPicker (Notion-style)
```tsx
import { IconPicker } from "@/frontend/shared/components/icons";

function MyComponent() {
  const [icon, setIcon] = useState("Heart");
  const [color, setColor] = useState("#ef4444");

  return (
    <IconPicker
      icon={icon}
      color={color}
      onIconChange={setIcon}
      onColorChange={setColor}
      showColor={true}
    />
  );
}
```

## 🎯 What Changed

### 1. **Location**
- **Old**: `frontend/shared/pages/icons.ts`
- **New**: `frontend/shared/components/icons/`

### 2. **Features Added**
- ✅ IconPicker component (Notion-style UI)
- ✅ ColorPicker with presets
- ✅ IconGrid with search and categories
- ✅ 200+ Lucide icons organized by category
- ✅ Color system with theme tokens
- ✅ Background color support
- ✅ Enhanced TypeScript types

### 3. **API Changes**

| Old Function | New Function | Status |
|-------------|--------------|--------|
| `iconFromName(name)` | `iconFromName(name)` | ✅ Still available (deprecated) |
| - | `getIconComponent(name)` | ✅ New (recommended) |
| - | `IconPicker` | ✅ New component |
| - | `ColorPicker` | ✅ New component |
| - | `IconGrid` | ✅ New component |

## 📦 Available Exports

```tsx
// Components
import {
  IconPicker,      // Main icon picker with tabs
  ColorPicker,     // Color picker with presets
  IconGrid,        // Icon grid with search
} from "@/frontend/shared/components/icons";

// Utilities
import {
  getIconComponent,    // Get icon component by name
  iconFromName,        // Legacy support (deprecated)
  getColorValue,       // Get color value (theme or hex)
  searchIcons,         // Search icons by query
} from "@/frontend/shared/components/icons";

// Constants
import {
  ICON_CATEGORIES,     // Icon category list
  ICONS_BY_CATEGORY,   // Icons organized by category
  COLOR_PRESETS,       // Color presets for icons
  BACKGROUND_PRESETS,  // Background color presets
  COMMON_ICONS,        // Common icon names
} from "@/frontend/shared/components/icons";

// Types
import type {
  IconData,
  ColorOption,
  IconCategory,
} from "@/frontend/shared/components/icons";
```

## 🔧 Updated Components

### ✅ MenuTree.tsx
```tsx
// Old
import * as LucideIcons from "lucide-react";
const Icon = (LucideIcons as any)[iconName];

// New
import { IconPicker, getIconComponent } from "@/frontend/shared/components/icons";

<IconPicker
  icon={dialog.data.icon}
  color={dialog.data.color}
  onIconChange={(icon) => setIcon(icon)}
  onColorChange={(color) => setColor(color)}
  showColor={true}
/>

const IconComponent = getIconComponent(iconName);
<IconComponent className="size-4" style={{ color }} />
```

### ✅ MenuItemForm.tsx
```tsx
// Old
<Input
  id="icon"
  value={formData.icon}
  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
  placeholder="lucide-react icon name"
/>

// New
<IconPicker
  icon={formData.icon || "Folder"}
  color={formData.color || "default"}
  onIconChange={(icon) => setFormData({ ...formData, icon })}
  onColorChange={(color) => setFormData({ ...formData, color })}
  showColor={true}
  showBackground={false}
/>
```

### ✅ MenuDisplay.tsx
```tsx
// Old
const getIcon = (type: string) => {
  switch (type) {
    case "folder": return <Folder className="w-5 h-5" />;
    // ...
  }
};

// New
import { getIconComponent, getColorValue } from "@/frontend/shared/components/icons";

const getIcon = (item: MenuItem) => {
  const color = item.metadata?.color;
  const iconName = item.icon;
  const style = color ? { color: getColorValue(color) } : undefined;

  if (iconName) {
    const IconComponent = getIconComponent(iconName);
    return <IconComponent className="w-5 h-5" style={style} />;
  }
  // fallback...
};
```

## 🎨 Icon Categories

Icons are now organized into 10 categories:

1. **common** - Home, Star, Heart, Settings, etc.
2. **files** - File, Folder, Archive, Database, etc.
3. **arrows** - All arrow and chevron icons
4. **communication** - Message, Mail, Phone, Users, etc.
5. **media** - Image, Video, Music, Camera, etc.
6. **design** - Palette, Brush, Pen, Edit, etc.
7. **development** - Code, Terminal, Git, Bug, etc.
8. **business** - Briefcase, Chart, Money, etc.
9. **social** - Emoji, Trophy, Gift, etc.
10. **emoji** - Smile, Heart, Rocket, etc.

## 🎨 Color System

### Theme Colors
- `default` - Current color
- `primary` - Primary theme color
- `secondary` - Secondary theme color
- `accent` - Accent theme color

### Named Colors
17 preset colors organized in groups:
- **Basic**: Red, Orange, Yellow, Green, Blue, Purple, Pink
- **Neutral**: Gray variations

### Custom Colors
- HEX input support
- Color wheel picker
- Real-time preview

## 📝 Examples

### Example 1: Document Header (Notion-style)
```tsx
import { IconPicker } from "@/frontend/shared/components/icons";

function DocumentHeader() {
  const [icon, setIcon] = useState("FileText");
  const [iconColor, setIconColor] = useState("default");
  const [backgroundColor, setBackgroundColor] = useState("transparent");

  return (
    <div className="flex items-center gap-4">
      <IconPicker
        icon={icon}
        color={iconColor}
        backgroundColor={backgroundColor}
        onIconChange={setIcon}
        onColorChange={setIconColor}
        onBackgroundChange={setBackgroundColor}
        showColor={true}
        showBackground={true}
      />
      <h1>My Document</h1>
    </div>
  );
}
```

### Example 2: Menu Item with Custom Icon
```tsx
import { getIconComponent } from "@/frontend/shared/components/icons";

function MenuItem({ item }) {
  const IconComponent = getIconComponent(item.icon || "Folder");
  const iconColor = item.metadata?.color || "currentColor";

  return (
    <div className="flex items-center gap-2">
      <IconComponent className="size-4" style={{ color: iconColor }} />
      <span>{item.name}</span>
    </div>
  );
}
```

### Example 3: Icon Search
```tsx
import { searchIcons } from "@/frontend/shared/components/icons";

const results = searchIcons("heart", "all");
// Returns: ["Heart", "HeartHandshake", ...]

const socialIcons = searchIcons("", "social");
// Returns all icons in social category
```

## ⚠️ Breaking Changes

### None!
The old `iconFromName()` function is still available for backward compatibility. However, it's deprecated and will be removed in a future version.

### Recommended Actions:
1. ✅ Update imports from `@/pages/icons` to `@/frontend/shared/components/icons`
2. ✅ Use `getIconComponent()` instead of `iconFromName()` for new code
3. ✅ Consider using `IconPicker` for better UX
4. ✅ Add color support to your menu items using `metadata.color`

## 🐛 Troubleshooting

### Issue: Icons not rendering
```tsx
// ❌ Wrong
const Icon = getIconComponent(iconName);
<Icon />

// ✅ Correct
const IconComponent = getIconComponent(iconName);
<IconComponent className="size-4" />
```

### Issue: Colors not applying
```tsx
// ❌ Wrong
<IconComponent color={color} />

// ✅ Correct
<IconComponent style={{ color }} />
// or
<IconComponent style={{ color: getColorValue(color) }} />
```

### Issue: Import errors
```tsx
// ❌ Wrong
import { IconPicker } from "@/pages/icons";

// ✅ Correct
import { IconPicker } from "@/frontend/shared/components/icons";
```

## 📚 Resources

- [Icon Picker README](./README.md) - Full component documentation
- [Lucide Icons](https://lucide.dev) - Icon library reference
- [Color Presets](./icon-data.ts) - Available color options

## 🚀 Future Enhancements

Planned features:
- [ ] Custom icon upload support
- [ ] Icon collections/favorites
- [ ] Recent icons history
- [ ] Emoji support
- [ ] Gradient backgrounds
- [ ] Icon size presets

## 📞 Support

If you encounter any issues during migration:
1. Check this guide for examples
2. Review the updated components in `frontend/views/static/menus/components/`
3. Consult the [README](./README.md) for detailed API documentation
