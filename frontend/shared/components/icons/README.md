# Icon Picker Components

Komponen reusable untuk memilih icon dan warna seperti di Notion. Dapat digunakan di seluruh aplikasi (menus, documents, dll).

## 📦 Komponen

### 1. **IconPicker** (Main Component)
Komponen utama yang menggabungkan icon selection dan color picker.

```tsx
import { IconPicker } from "@/frontend/shared/components/icons";

<IconPicker
  icon="Heart"
  color="#ef4444"
  backgroundColor="transparent"
  onIconChange={(icon) => setIcon(icon)}
  onColorChange={(color) => setColor(color)}
  onBackgroundChange={(bg) => setBackground(bg)}
  showColor={true}
  showBackground={false}
/>
```

**Props:**
- `icon` - Icon name (default: "Smile")
- `color` - Icon color (default: "default")
- `backgroundColor` - Background color (default: "transparent")
- `onIconChange` - Callback saat icon berubah
- `onColorChange` - Callback saat color berubah
- `onBackgroundChange` - Callback saat background berubah
- `showColor` - Show color picker tab (default: true)
- `showBackground` - Show background picker tab (default: false)
- `trigger` - Custom trigger button
- `className` - Additional CSS classes

### 2. **ColorPicker**
Komponen untuk memilih warna dengan presets dan custom color.

```tsx
import { ColorPicker } from "@/frontend/shared/components/icons";

<ColorPicker
  value="#3b82f6"
  onChange={(color) => setColor(color)}
  type="icon" // atau "background"
  showCustom={true}
/>
```

**Props:**
- `value` - Current color value
- `onChange` - Callback saat color berubah
- `type` - "icon" atau "background" (mempengaruhi preset colors)
- `showCustom` - Show custom color tab (default: true)
- `className` - Additional CSS classes
- `trigger` - Custom trigger button

### 3. **IconGrid**
Grid untuk memilih icon dengan search dan kategori.

```tsx
import { IconGrid } from "@/frontend/shared/components/icons";

<IconGrid
  selectedIcon="Heart"
  onSelectIcon={(icon) => setIcon(icon)}
  iconColor="#ef4444"
/>
```

**Props:**
- `selectedIcon` - Currently selected icon
- `onSelectIcon` - Callback saat icon dipilih
- `iconColor` - Color untuk preview icons
- `className` - Additional CSS classes

## 🎨 Features

### Icon Categories
- **All** - Semua icons
- **Common** - Icons umum (Home, Star, Heart, dll)
- **Files** - File-related icons
- **Arrows** - Arrow icons
- **Communication** - Chat, Mail, Phone, dll
- **Media** - Image, Video, Music, dll
- **Design** - Palette, Brush, Edit, dll
- **Development** - Code, Terminal, Git, dll
- **Business** - Briefcase, Chart, Money, dll
- **Social** - Emoji dan social icons

### Color Presets

#### Icon Colors
- Theme colors (default, primary, secondary, accent)
- Basic colors (Red, Orange, Yellow, Green, Blue, Purple, Pink)
- Neutral colors (Gray variations)
- Custom color picker (HEX input)

#### Background Colors
- Transparent
- Light pastels untuk backgrounds
- Custom color picker

### Search Functionality
- Real-time icon search
- Search by icon name
- Filter by category

## 📝 Usage Examples

### Example 1: Simple Icon Picker
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

### Example 2: Document Icon (Notion-style)
```tsx
import { IconPicker } from "@/frontend/shared/components/icons";

function DocumentHeader() {
  const [icon, setIcon] = useState("FileText");
  const [color, setColor] = useState("default");
  const [bgColor, setBgColor] = useState("transparent");

  return (
    <IconPicker
      icon={icon}
      color={color}
      backgroundColor={bgColor}
      onIconChange={setIcon}
      onColorChange={setColor}
      onBackgroundChange={setBgColor}
      showColor={true}
      showBackground={true}
    />
  );
}
```

### Example 3: Menu Item Icon
```tsx
import { IconPicker } from "@/frontend/shared/components/icons";

function MenuItemForm() {
  const [menuData, setMenuData] = useState({
    icon: "Folder",
    color: "#3b82f6",
  });

  return (
    <IconPicker
      icon={menuData.icon}
      color={menuData.color}
      onIconChange={(icon) => setMenuData(prev => ({ ...prev, icon }))}
      onColorChange={(color) => setMenuData(prev => ({ ...prev, color }))}
      showColor={true}
      showBackground={false}
    />
  );
}
```

### Example 4: Custom Trigger Button
```tsx
import { IconPicker, getIconComponent } from "@/frontend/shared/components/icons";

function CustomIconButton() {
  const [icon, setIcon] = useState("Star");
  const [color, setColor] = useState("#f59e0b");

  const IconComponent = getIconComponent(icon);

  return (
    <IconPicker
      icon={icon}
      color={color}
      onIconChange={setIcon}
      onColorChange={setColor}
      trigger={
        <button className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
          <IconComponent className="size-5" style={{ color }} />
          <span>Pick Icon</span>
        </button>
      }
    />
  );
}
```

## 🛠 Utilities

### getIconComponent
Get Lucide icon component by name:

```tsx
import { getIconComponent } from "@/frontend/shared/components/icons";

const IconComponent = getIconComponent("Heart");
return <IconComponent className="size-6" />;
```

### getColorValue
Convert color value (supports theme tokens):

```tsx
import { getColorValue } from "@/frontend/shared/components/icons";

const color = getColorValue("primary"); // Returns "hsl(var(--primary))"
const hexColor = getColorValue("#ef4444"); // Returns "#ef4444"
```

### searchIcons
Search icons by query:

```tsx
import { searchIcons } from "@/frontend/shared/components/icons";

const results = searchIcons("heart", "all"); // Returns ["Heart", "HeartHandshake", ...]
```

## 📁 File Structure

```
frontend/shared/components/icons/
├── icon-data.ts          # Icon & color constants
├── IconPicker.tsx        # Main icon picker component
├── ColorPicker.tsx       # Color picker component
├── IconGrid.tsx          # Icon grid with search
├── index.ts              # Exports
└── README.md             # Documentation
```

##  Integration Examples

### MenuTree Integration
Sudah terintegrasi di `MenuTree.tsx`:

```tsx
import { IconPicker, getIconComponent } from "@/frontend/shared/components/icons";

// Di dialog form
<IconPicker
  icon={dialog.data.icon}
  color={dialog.data.color}
  onIconChange={(icon) => setDialog(prev => ({
    ...prev,
    data: { ...prev.data, icon }
  }))}
  onColorChange={(color) => setDialog(prev => ({
    ...prev,
    data: { ...prev.data, color }
  }))}
  showColor={true}
  showBackground={false}
/>

// Render icon di tree
const IconComponent = getIconComponent(iconName);
<IconComponent className="size-4" style={{ color }} />
```

### Future: Document Editor Integration
```tsx
// Untuk document headers (Notion-style)
<IconPicker
  icon={document.icon}
  color={document.iconColor}
  backgroundColor={document.iconBackground}
  onIconChange={updateDocumentIcon}
  onColorChange={updateIconColor}
  onBackgroundChange={updateIconBackground}
  showColor={true}
  showBackground={true}
/>
```

##  Performance

- **Lazy loading** - Icons dimuat on-demand
- **Memoization** - Search results di-memoize
- **Virtual scrolling** - ScrollArea untuk performa smooth
- **Optimized rendering** - Hanya re-render saat diperlukan

## 🎨 Customization

### Menambah Icon Categories
Edit `icon-data.ts`:

```tsx
export const ICONS_BY_CATEGORY = {
  // ... existing categories
  custom: [
    "CustomIcon1",
    "CustomIcon2",
  ],
};
```

### Menambah Color Presets
Edit `icon-data.ts`:

```tsx
export const COLOR_PRESETS: ColorOption[] = [
  // ... existing colors
  { value: "#custom", label: "Custom Color", group: "Custom" },
];
```

## 📚 Dependencies

- `lucide-react` - Icon library
- `@radix-ui/react-*` - UI primitives (Popover, Tabs, ScrollArea)
- Tailwind CSS - Styling
