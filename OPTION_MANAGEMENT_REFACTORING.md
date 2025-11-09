# Option Management Refactoring - DRY & Reusable Components

## Overview
Refactored option management system to be DRY (Don't Repeat Yourself) and dynamically reusable across cell dropdown editors and property menu submenu.

## New Reusable Components

### 1. `OptionActionsMenu.tsx`
Reusable component for displaying option action menu (Rename, Delete, Change Color).

**Location**: `frontend/features/database/components/shared/OptionActionsMenu.tsx`

**Features**:
- Dropdown menu with three main actions: Rename, Delete, Change Color
- Color picker with 8 predefined colors
- Configurable trigger, alignment, and side
- Consistent styling and behavior

**Exports**:
```typescript
// Main component
<OptionActionsMenu 
  option={option}
  onRename={handleRename}
  onDelete={handleDelete}
  onChangeColor={handleChangeColor}
  trigger={<CustomTrigger />} // optional
  align="end"
  side="bottom"
/>

// Helper function for building menu items
buildOptionMenuItems(option, callbacks)

// Color palette constant
COLOR_PALETTE: Array<{ id, label, hex }>

// Utility function
getColorBadgeClasses(color): string
```

### 2. `useOptionActions.ts`
Reusable hook for managing option CRUD operations.

**Location**: `frontend/features/database/components/shared/useOptionActions.ts`

**Features**:
- Consistent handlers for: Rename, Delete, Add, Change Color
- Built-in toast notifications
- Confirmation dialogs for destructive actions
- Type-safe option handling

**Usage**:
```typescript
const optionActions = useOptionActions({
  options: currentOptions,
  onUpdateOptions: async (updatedOptions) => {
    await updateField({ id, options: { selectOptions: updatedOptions }});
  },
});

// Access handlers
optionActions.handleRename(optionId);
optionActions.handleDelete(optionId);
optionActions.handleChangeColor(optionId, color);
optionActions.handleAdd();
```

## Updated Components

### 1. `menu-builder.ts`
**Changes**:
- Imported `buildOptionMenuItems` helper
- Replaced hardcoded nested submenu with reusable helper function
- Reduced code duplication from ~50 lines to ~10 lines per option

**Before**:
```typescript
submenu = choices.map((choice) => ({
  // ... 50+ lines of hardcoded menu items
  submenu: [
    { id: 'rename-...', label: 'Rename', onClick: ... },
    { id: 'delete-...', label: 'Delete', onClick: ... },
    { id: 'colors-...', label: 'Change Color', submenu: [
      { id: 'color-gray', label: 'Gray', color: '#6b7280', ... },
      // ... repeated 8 times
    ]},
  ],
}));
```

**After**:
```typescript
submenu = choices.map((choice) => ({
  id: `option-${choice.id || choice.name}`,
  label: choice.name,
  badge: { color: choice.color, text: choice.name },
  submenu: buildOptionMenuItems(choice, {
    onRename: (id) => callbacks.onEditOption?.(id),
    onDelete: (id) => callbacks.onDeleteOption?.(id),
    onChangeColor: (id, color) => callbacks.onChangeOptionColor?.(id, color),
  }),
}));
```

### 2. `PropertyMenu.tsx`
**Changes**:
- Imported `useOptionActions` hook
- Replaced inline option handlers with hook-based handlers
- Reduced code from ~60 lines to ~15 lines
- Added proper type validation for option updates

**Before**:
```typescript
onEditOption: onEditOptions ? (optionId: string) => {
  const currentOptions = (field.options as any)?.choices || [];
  const option = currentOptions.find(...);
  if (option) {
    const newName = prompt('Rename option:', option.name);
    if (newName && newName.trim() && newName !== option.name) {
      const updatedOptions = currentOptions.map(...);
      onEditOptions(fieldId, updatedOptions);
      toast({ title: "Option renamed", ... });
    }
  }
} : undefined,
// ... repeated for delete, add, change color
```

**After**:
```typescript
const optionActions = useOptionActions({
  options: currentOptions,
  onUpdateOptions: (updatedOptions) => {
    if (onEditOptions) {
      const validOptions = updatedOptions.map((opt) => ({
        id: opt.id || `option-${Date.now()}`,
        name: opt.name,
        color: opt.color || '#6b7280',
      }));
      onEditOptions(fieldId, validOptions);
    }
  },
});

// Use hook handlers directly
onEditOption: onEditOptions ? optionActions.handleRename : undefined,
onAddOption: onEditOptions ? optionActions.handleAdd : undefined,
onDeleteOption: onEditOptions ? optionActions.handleDelete : undefined,
onChangeOptionColor: onEditOptions ? optionActions.handleChangeColor : undefined,
```

## Benefits

### 1. DRY (Don't Repeat Yourself)
- ✅ Single source of truth for option actions
- ✅ Consistent behavior across cell editors and property menu
- ✅ Reduced code duplication by ~70%

### 2. Maintainability
- ✅ Changes to option management logic only need to be made once
- ✅ Easy to add new option actions (just update hook and component)
- ✅ Consistent toast messages and error handling

### 3. Type Safety
- ✅ Properly typed interfaces for options and callbacks
- ✅ Compile-time checks for required fields
- ✅ Automatic type inference

### 4. Reusability
- ✅ Can be used in cell dropdown editors
- ✅ Can be used in property menu submenu
- ✅ Can be easily integrated into future components

### 5. Consistency
- ✅ Same UX across all option management interfaces
- ✅ Uniform color palette (8 colors)
- ✅ Consistent confirmation dialogs and toast notifications

## Usage Examples

### Cell Dropdown Editor
```typescript
import { OptionActionsMenu } from '@/components/shared/OptionActionsMenu';
import { useOptionActions } from '@/components/shared/useOptionActions';

function SelectEditor({ field, value, onCommit, onPropertyUpdate }) {
  const options = field.options.selectOptions || [];
  
  const optionActions = useOptionActions({
    options,
    onUpdateOptions: (updated) => onPropertyUpdate({ selectOptions: updated }),
  });

  return (
    <Select>
      {options.map((option) => (
        <SelectItem key={option.id} value={option.id}>
          {option.name}
          <OptionActionsMenu
            option={option}
            {...optionActions}
            trigger={<MoreHorizontal className="h-4 w-4" />}
          />
        </SelectItem>
      ))}
    </Select>
  );
}
```

### Property Menu Submenu
```typescript
// Automatically handled by menu-builder.ts using buildOptionMenuItems()
// No additional code needed!
```

## Color Palette
Standardized 8-color palette used across all option management interfaces:
- Gray: `#6b7280`
- Orange: `#f59e0b`
- Yellow: `#eab308`
- Green: `#22c55e`
- Blue: `#3b82f6`
- Purple: `#8b5cf6`
- Pink: `#ec4899`
- Red: `#ef4444`

## Testing Checklist
- [ ] Property menu submenu: Edit options → Rename option
- [ ] Property menu submenu: Edit options → Delete option
- [ ] Property menu submenu: Edit options → Change color
- [ ] Property menu submenu: Edit options → Add option
- [ ] Cell dropdown: Hover option → ••• → Rename
- [ ] Cell dropdown: Hover option → ••• → Delete
- [ ] Cell dropdown: Hover option → ••• → Change color
- [ ] Verify same behavior in both contexts
- [ ] Verify toast notifications appear
- [ ] Verify confirmation dialogs for delete
- [ ] Verify color changes persist

## Future Enhancements
- Replace `prompt()` with proper dialog component for rename
- Add drag-and-drop reordering
- Add bulk operations (select multiple, delete all)
- Add option usage tracking
- Add option templates/presets

## Files Changed
```
frontend/features/database/components/
├── shared/
│   ├── OptionActionsMenu.tsx (NEW - 190 lines)
│   └── useOptionActions.ts (NEW - 110 lines)
├── PropertyMenu/
│   ├── menu-builder.ts (MODIFIED - reduced 40 lines)
│   └── PropertyMenu.tsx (MODIFIED - reduced 45 lines)
```

## Commit Message
```
refactor: Create reusable option management components

- Add OptionActionsMenu component for consistent option actions UI
- Add useOptionActions hook for DRY option CRUD operations  
- Refactor menu-builder to use buildOptionMenuItems helper
- Refactor PropertyMenu to use useOptionActions hook
- Reduce code duplication by ~70%
- Ensure consistent behavior across cell editors and property menu
- Standardize color palette and toast notifications

Breaking changes: None
Migrations: None required
```
