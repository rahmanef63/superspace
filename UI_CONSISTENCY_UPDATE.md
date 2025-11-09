# UI Consistency Update - Property Menu Options

## Overview
Updated property menu submenu UI to match cell dropdown editor styling for consistent user experience across Select and Multi-Select properties.

## Changes Made

### 1. PropertyMenu.tsx
**Added Badge Component**:
- Imported `Badge` from `@/components/ui/badge`
- Replaced plain `<span>` with `<Badge>` component for option display
- Applied same styling as cell dropdown editor

**Updated Submenu Trigger**:
```tsx
// Before
<DropdownMenuSubTrigger className="flex items-center gap-2">
  {item.icon && <item.icon className="h-4 w-4" />}
  <span>{item.label}</span>
</DropdownMenuSubTrigger>

// After
<DropdownMenuSubTrigger className="flex items-center gap-2 flex-1 min-w-0">
  {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
  {item.badge ? (
    <Badge 
      variant="secondary"
      className="truncate"
      style={item.badge.color ? { 
        backgroundColor: item.badge.color + '20',
        borderColor: item.badge.color,
        color: item.badge.color 
      } : undefined}
    >
      {item.badge.text}
    </Badge>
  ) : (
    <span>{item.label}</span>
  )}
</DropdownMenuSubTrigger>
```

**Updated Regular Menu Item**:
```tsx
// Added flex-1 min-w-0 for proper truncation
<div className="flex items-center gap-2 flex-1 min-w-0">
  {item.color && (
    <div 
      className="h-4 w-4 rounded border flex-shrink-0"
      style={{ backgroundColor: item.color }}
    />
  )}
  {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
  {item.badge ? (
    <Badge 
      variant="secondary"
      className="truncate"
      style={item.badge.color ? { 
        backgroundColor: item.badge.color + '20',
        borderColor: item.badge.color,
        color: item.badge.color 
      } : undefined}
    >
      {item.badge.text}
    </Badge>
  ) : (
    <span>{item.label}</span>
  )}
</div>
```

### 2. menu-builder.ts
**Added Plus Icon**:
```typescript
import { Plus } from 'lucide-react';

// Updated "+ Add option" to use icon
submenu.push({
  id: 'add-option',
  label: 'Add option',  // Changed from '+ Add option'
  icon: Plus,           // Added icon
  onClick: () => {
    if (callbacks.onAddOption) {
      callbacks.onAddOption();
    }
  },
});
```

## UI Comparison

### Before
```
Edit options →
  ├─ Option 1          (plain text)
  ├─ Option 2          (plain text)
  └─ + Add option      (plain text with +)
```

### After
```
Edit options →
  ├─ [Option 1]        (colored badge with nested submenu)
  │  └─ Rename / Delete / Change Color
  ├─ [Option 2]        (colored badge with nested submenu)
  │  └─ Rename / Delete / Change Color
  └─ [+] Add option    (with Plus icon)
```

## Styling Details

### Badge Styling
Matches SelectEditor.tsx exactly:
- `variant="secondary"` - Base variant
- `className="truncate"` - Text truncation
- Dynamic inline styles:
  - `backgroundColor: color + '20'` - 20% opacity background
  - `borderColor: color` - Border matches color
  - `color: color` - Text matches color

### Color Support
All 8 colors supported:
- Gray: `#6b7280`
- Orange: `#f59e0b`
- Yellow: `#eab308`
- Green: `#22c55e`
- Blue: `#3b82f6`
- Purple: `#8b5cf6`
- Pink: `#ec4899`
- Red: `#ef4444`

### Flex Layout
- `flex-1 min-w-0` - Allows proper text truncation
- `flex-shrink-0` - Prevents icons from shrinking
- `truncate` - Ellipsis for long text

## Multi-Select Support

✅ **Automatically Applied**
Both Select and Multi-Select properties use the same configuration:
- `submenu: 'dynamic'` in menu-config.ts
- Same menu-builder logic
- Same Badge styling
- Same nested submenu structure

No additional code needed for multi-select!

## User Experience

### Consistent Across Interfaces
1. **Cell Dropdown** - Edit options inline while editing cell
   - Hover option → ••• button appears
   - Click ••• → Rename/Delete/Change Color menu
   
2. **Property Menu** - Edit options from property header
   - Right-click header → Edit options → Submenu opens
   - Hover option → See nested submenu
   - Click option → Access Rename/Delete/Change Color

### Visual Consistency
- ✅ Same Badge component and styling
- ✅ Same color palette and rendering
- ✅ Same icon usage (Plus for add)
- ✅ Same truncation behavior
- ✅ Same nested submenu structure

## Testing Checklist

### Visual Tests
- [ ] Property menu: Edit options shows colored badges
- [ ] Badge colors match exactly with cell dropdown
- [ ] Badge truncation works for long option names
- [ ] Plus icon appears on "Add option" item
- [ ] Nested submenu shows on hover/click
- [ ] Color picker submenu displays all 8 colors
- [ ] Multi-select uses same UI as select

### Functional Tests
- [ ] Click option badge → opens nested submenu
- [ ] Rename works from property menu
- [ ] Delete works from property menu
- [ ] Change color works from property menu
- [ ] Add option works from property menu
- [ ] Changes persist and sync with cell dropdown
- [ ] Toast notifications appear

### Cross-Interface Tests
- [ ] Edit option color in cell dropdown → updates in property menu
- [ ] Edit option name in property menu → updates in cell dropdown
- [ ] Delete option in either place → removes from both
- [ ] Add option in either place → appears in both

## Files Modified

```
frontend/features/database/components/
├── PropertyMenu/
│   ├── PropertyMenu.tsx (MODIFIED)
│   │   - Added Badge import
│   │   - Updated submenu trigger rendering
│   │   - Updated regular item rendering
│   │   - Added flex layout classes
│   └── menu-builder.ts (MODIFIED)
│       - Added Plus icon import
│       - Updated "Add option" to use icon
```

## Commit Message
```
style: Match property menu options UI with cell dropdown

- Add Badge component to property menu submenu
- Apply same colored badge styling as SelectEditor
- Add Plus icon to "Add option" menu item
- Improve flex layout for proper text truncation
- Ensure consistent UX across Select and Multi-Select
- No functional changes, pure UI consistency update

Visual changes only, no breaking changes
```
