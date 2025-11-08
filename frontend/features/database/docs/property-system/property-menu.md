# Property Menu Configuration System

> Modular, type-safe property menu system with base and dynamic parameters

**Last Updated:** November 6, 2025  
**Status:** ✅ Complete

---

## 📋 Overview

Property Menu adalah context menu yang muncul ketika user click pada property header di table view. Menu ini **dinamis** berdasarkan property type, dengan:

- **Base Parameters** - Menu items yang sama untuk SEMUA property types
- **Dynamic Parameters** - Menu items khusus untuk property type tertentu
- **Overrides** - Modifikasi menu base untuk type-specific behavior
- **Hidden/Disabled** - Control visibility dan state per property type

---

## 🏗️ Architecture

### File Structure

```
frontend/features/database/
├── components/
│   └── PropertyMenu/
│       ├── menu-config.ts           ← Base configuration (15 actions)
│       ├── types.ts                 ← Type definitions
│       ├── utils.ts                 ← Helper functions
│       └── index.tsx                ← PropertyMenu component
│
└── properties/
    ├── menu-registry.ts             ← Central registry (18+ types)
    │
    ├── select/
    │   └── menu-config.ts           ← Select-specific config
    ├── number/
    │   └── menu-config.ts           ← Number-specific config
    ├── date/
    │   └── menu-config.ts           ← Date-specific config
    └── ... (20+ property types)
```

---

## 🎯 Base Configuration

**File:** `components/PropertyMenu/menu-config.ts`

### Base Menu Actions (15 Total)

```typescript
export const BASE_MENU_ITEMS = {
  // Edit Section
  rename: { id: 'rename', label: 'Rename property', icon: Pencil, shortcut: '⌘R' },
  duplicate: { id: 'duplicate', label: 'Duplicate property', icon: Copy },
  
  // Data Section
  sortAsc: { id: 'sortAsc', label: 'Sort ascending', icon: ArrowUpAZ },
  sortDesc: { id: 'sortDesc', label: 'Sort descending', icon: ArrowDownAZ },
  filter: { id: 'filter', label: 'Filter', icon: Filter },
  calculate: { id: 'calculate', label: 'Calculate', icon: Sigma, submenu: [...] },
  
  // Column Section
  wrap: { id: 'wrap', label: 'Wrap in view', icon: WrapText },
  insertLeft: { id: 'insertLeft', label: 'Insert left', icon: ArrowLeft },
  insertRight: { id: 'insertRight', label: 'Insert right', icon: ArrowRight },
  moveLeft: { id: 'moveLeft', label: 'Move left', icon: ChevronLeft },
  moveRight: { id: 'moveRight', label: 'Move right', icon: ChevronRight },
  
  // Settings Section
  toggleRequired: { id: 'toggleRequired', label: 'Required', icon: Check },
  hide: { id: 'hide', label: 'Hide in view', icon: EyeOff },
  
  // Danger Section
  delete: { id: 'delete', label: 'Delete property', icon: Trash2, variant: 'danger' },
};
```

### Menu Sections

```typescript
export const MENU_SECTIONS = {
  edit: ['rename', 'duplicate'],
  data: ['sortAsc', 'sortDesc', 'filter', 'calculate'],
  column: ['wrap', 'insertLeft', 'insertRight', 'moveLeft', 'moveRight'],
  settings: ['toggleRequired', 'hide'],
  danger: ['delete'],
};
```

---

## 🔧 Property Type Configuration

**Interface:** `PropertyTypeMenuConfig`

```typescript
export interface PropertyTypeMenuConfig {
  // Additional menu items specific to this property type
  typeSpecificItems?: PropertyMenuItem[];
  
  // Override base menu items behavior
  overrides?: {
    [K in PropertyMenuAction]?: Partial<PropertyMenuItem>;
  };
  
  // Hide certain base menu items
  hidden?: PropertyMenuAction[];
  
  // Disable certain base menu items
  disabled?: PropertyMenuAction[];
}
```

---

## 📦 Property Type Examples

### 1. Select Property

**File:** `properties/select/menu-config.ts`

```typescript
export const selectPropertyMenuConfig: PropertyTypeMenuConfig = {
  typeSpecificItems: [
    {
      id: 'editOptions',
      label: 'Edit options',
      icon: Settings,
      shortcut: '⌘E',
    },
    {
      id: 'manageColors',
      label: 'Manage colors',
      icon: Palette,
    },
  ],
  
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count all' },
        { id: 'calculate-empty', label: 'Count empty' },
        { id: 'calculate-filled', label: 'Count filled' },
        { id: 'calculate-unique', label: 'Count unique values' },
        { id: 'calculate-percent-empty', label: 'Percent empty' },
        { id: 'calculate-percent-filled', label: 'Percent filled' },
        { id: 'calculate-mode', label: 'Show most common' }, // ← Select-specific!
      ],
    },
  },
  
  hidden: [],
  disabled: [],
};
```

**Resulting Menu:**
```
Select ▼
├─ Rename property (⌘R)
├─ Duplicate property
├─ ✨ Edit options (⌘E)          ← Type-specific
├─ 🎨 Manage colors               ← Type-specific
├─ ─────────────────
├─ Sort ascending
├─ Sort descending
├─ Filter
├─ Calculate ▸
│  ├─ Count all
│  ├─ Count empty
│  ├─ Count filled
│  ├─ Count unique values
│  ├─ Percent empty
│  ├─ Percent filled
│  └─ Show most common            ← Override
└─ ...
```

---

### 2. Number Property

**File:** `properties/number/menu-config.ts`

```typescript
export const numberPropertyMenuConfig: PropertyTypeMenuConfig = {
  typeSpecificItems: [
    {
      id: 'setFormat',
      label: 'Number format',
      icon: Hash,
      submenu: [
        { id: 'format-number', label: 'Number' },
        { id: 'format-number-commas', label: 'Number with commas' },
        { id: 'format-percent', label: 'Percent' },
        { id: 'format-currency-idr', label: 'Rupiah (IDR)' },
        { id: 'format-currency-usd', label: 'US Dollar (USD)' },
        { id: 'format-currency-eur', label: 'Euro (EUR)' },
        { id: 'format-currency-gbp', label: 'Pound (GBP)' },
        { id: 'format-currency-jpy', label: 'Yen (JPY)' },
      ],
    },
    {
      id: 'showAs',
      label: 'Show as',
      icon: BarChart,
      submenu: [
        { id: 'show-number', label: 'Number' },
        { id: 'show-bar', label: 'Bar' },
        { id: 'show-ring', label: 'Ring' },
      ],
    },
  ],
  
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-sum', label: 'Sum' },           // ← Number-specific!
        { id: 'calculate-average', label: 'Average' },   // ← Number-specific!
        { id: 'calculate-median', label: 'Median' },     // ← Number-specific!
        { id: 'calculate-min', label: 'Min' },
        { id: 'calculate-max', label: 'Max' },
        { id: 'calculate-range', label: 'Range' },
        { id: 'calculate-count', label: 'Count' },
        { id: 'calculate-empty', label: 'Count empty' },
        { id: 'calculate-filled', label: 'Count filled' },
      ],
    },
  },
  
  hidden: [],
  disabled: [],
};
```

---

### 3. Date Property

**File:** `properties/date/menu-config.ts`

```typescript
export const datePropertyMenuConfig: PropertyTypeMenuConfig = {
  typeSpecificItems: [
    {
      id: 'dateFormat',
      label: 'Date format',
      icon: Calendar,
      submenu: [
        { id: 'format-full', label: 'Full date' },
        { id: 'format-friendly', label: 'Friendly' },
        { id: 'format-us', label: 'US (MM/DD/YYYY)' },
        { id: 'format-european', label: 'European (DD/MM/YYYY)' },
        { id: 'format-iso', label: 'ISO (YYYY-MM-DD)' },
        { id: 'format-relative', label: 'Relative' },
      ],
    },
    {
      id: 'timeFormat',
      label: 'Time format',
      icon: Clock,
      submenu: [
        { id: 'time-12', label: '12 hour' },
        { id: 'time-24', label: '24 hour' },
        { id: 'time-none', label: 'No time' },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
    },
  ],
  
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-earliest', label: 'Earliest date' },  // ← Date-specific!
        { id: 'calculate-latest', label: 'Latest date' },      // ← Date-specific!
        { id: 'calculate-range', label: 'Date range' },
        { id: 'calculate-count', label: 'Count' },
        { id: 'calculate-empty', label: 'Count empty' },
        { id: 'calculate-filled', label: 'Count filled' },
      ],
    },
  },
};
```

---

### 4. Title Property (Special Rules)

**File:** `properties/title/menu-config.ts`

```typescript
export const titlePropertyMenuConfig: PropertyTypeMenuConfig = {
  typeSpecificItems: [
    {
      id: 'showPageIcon',
      label: 'Show page icon',
      icon: Image,
    },
  ],
  
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-count', label: 'Count all' },
        { id: 'calculate-empty', label: 'Count empty' },
        { id: 'calculate-filled', label: 'Count filled' },
        { id: 'calculate-unique', label: 'Count unique' },
      ],
    },
  },
  
  // ❌ Title cannot be deleted
  hidden: ['delete'],
  
  // ❌ Title cannot be optional or hidden
  disabled: ['toggleRequired', 'hide'],
};
```

**Resulting Menu:**
```
Title ▼
├─ Rename property (⌘R)
├─ Duplicate property
├─ 🖼️ Show page icon              ← Type-specific
├─ ─────────────────
├─ Sort ascending
├─ Sort descending
├─ Filter
├─ Calculate ▸
├─ ─────────────────
├─ Wrap in view
├─ Insert left
├─ Insert right
├─ Move left
├─ Move right
├─ ─────────────────
├─ Required (disabled)            ← Cannot toggle
├─ Hide in view (disabled)        ← Cannot hide
└─ (Delete not shown)             ← Cannot delete
```

---

### 5. Auto Properties (created_time, created_by, etc.)

**File:** `properties/created_time/menu-config.ts`

```typescript
export const createdTimePropertyMenuConfig: PropertyTypeMenuConfig = {
  typeSpecificItems: [
    {
      id: 'dateFormat',
      label: 'Date format',
      icon: Calendar,
      submenu: [
        { id: 'format-full', label: 'Full date' },
        { id: 'format-friendly', label: 'Friendly' },
        { id: 'format-relative', label: 'Relative' },
      ],
    },
    {
      id: 'timeFormat',
      label: 'Time format',
      icon: Clock,
      submenu: [
        { id: 'time-12', label: '12 hour' },
        { id: 'time-24', label: '24 hour' },
      ],
    },
  ],
  
  overrides: {
    calculate: {
      submenu: [
        { id: 'calculate-earliest', label: 'Earliest' },
        { id: 'calculate-latest', label: 'Latest' },
        { id: 'calculate-range', label: 'Date range' },
      ],
    },
  },
  
  // ❌ Auto properties cannot be deleted or duplicated
  hidden: ['delete', 'duplicate'],
  
  // ❌ Auto properties are always present (cannot toggle required)
  disabled: ['toggleRequired'],
};
```

---

## 📊 Registry System

**File:** `properties/menu-registry.ts`

### Property Type to Config Mapping

```typescript
export const PROPERTY_MENU_REGISTRY: Record<string, PropertyTypeMenuConfig> = {
  // Text types
  text: textPropertyMenuConfig,
  title: titlePropertyMenuConfig,
  rich_text: textPropertyMenuConfig,
  
  // Number types
  number: numberPropertyMenuConfig,
  
  // Select types
  select: selectPropertyMenuConfig,
  multi_select: multiSelectPropertyMenuConfig,
  status: selectPropertyMenuConfig,
  
  // Date types
  date: datePropertyMenuConfig,
  
  // Boolean types
  checkbox: checkboxPropertyMenuConfig,
  
  // Auto properties
  created_time: createdTimePropertyMenuConfig,
  created_by: createdByPropertyMenuConfig,
  last_edited_time: createdTimePropertyMenuConfig,
  last_edited_by: createdByPropertyMenuConfig,
  
  // People
  people: { ... },
  
  // Contact types
  url: { ... },
  email: { ... },
  phone: { ... },
  
  // Files
  files: { ... },
  
  // Advanced types
  formula: { ... },
  rollup: { ... },
  relation: { ... },
  unique_id: { ... },
};
```

### Helper Functions

```typescript
/**
 * Get menu configuration for a property type
 */
export function getPropertyMenuConfig(propertyType: string): PropertyTypeMenuConfig {
  return PROPERTY_MENU_REGISTRY[propertyType] || DEFAULT_PROPERTY_MENU_CONFIG;
}

/**
 * Check if a menu item should be visible for a property type
 */
export function isMenuItemVisible(propertyType: string, menuItemId: string): boolean {
  const config = getPropertyMenuConfig(propertyType);
  return !config.hidden?.includes(menuItemId as any);
}

/**
 * Check if a menu item should be disabled for a property type
 */
export function isMenuItemDisabled(propertyType: string, menuItemId: string): boolean {
  const config = getPropertyMenuConfig(propertyType);
  return config.disabled?.includes(menuItemId as any) ?? false;
}
```

---

## 🔄 Usage Examples

### 1. Get Configuration for Property Type

```typescript
import { getPropertyMenuConfig } from '@/frontend/features/database/properties/menu-registry';

// Get config for 'number' property
const config = getPropertyMenuConfig('number');

console.log(config.typeSpecificItems);
// [
//   { id: 'setFormat', label: 'Number format', ... },
//   { id: 'showAs', label: 'Show as', ... }
// ]

console.log(config.overrides.calculate);
// { submenu: [{ id: 'calculate-sum', ... }, ...] }
```

### 2. Check Menu Item Visibility

```typescript
import { isMenuItemVisible } from '@/frontend/features/database/properties/menu-registry';

// Check if 'delete' is visible for 'title' property
const canDelete = isMenuItemVisible('title', 'delete');
console.log(canDelete); // false (title cannot be deleted)

// Check if 'delete' is visible for 'text' property
const canDeleteText = isMenuItemVisible('text', 'delete');
console.log(canDeleteText); // true (text can be deleted)
```

### 3. Check Menu Item Disabled State

```typescript
import { isMenuItemDisabled } from '@/frontend/features/database/properties/menu-registry';

// Check if 'toggleRequired' is disabled for 'created_time'
const isDisabled = isMenuItemDisabled('created_time', 'toggleRequired');
console.log(isDisabled); // true (auto properties cannot be optional)
```

### 4. Build Dynamic Menu

```typescript
import { BASE_MENU_ITEMS, MENU_SECTIONS } from '@/frontend/features/database/components/PropertyMenu/menu-config';
import { getPropertyMenuConfig, isMenuItemVisible, isMenuItemDisabled } from '@/frontend/features/database/properties/menu-registry';

function buildPropertyMenu(propertyType: string) {
  const config = getPropertyMenuConfig(propertyType);
  const menuSections = [];
  
  // Build Edit section
  const editItems = MENU_SECTIONS.edit
    .filter(id => isMenuItemVisible(propertyType, id))
    .map(id => ({
      ...BASE_MENU_ITEMS[id],
      disabled: isMenuItemDisabled(propertyType, id),
      onClick: () => handleAction(id),
    }));
  
  // Add type-specific items after 'duplicate'
  const editWithTypeSpecific = [
    ...editItems,
    ...config.typeSpecificItems.map(item => ({
      ...item,
      onClick: () => handleAction(item.id),
    })),
  ];
  
  menuSections.push({
    title: 'Edit',
    items: editWithTypeSpecific,
  });
  
  // Build Data section with overrides
  const dataItems = MENU_SECTIONS.data
    .filter(id => isMenuItemVisible(propertyType, id))
    .map(id => {
      const baseItem = BASE_MENU_ITEMS[id];
      const override = config.overrides?.[id];
      
      return {
        ...baseItem,
        ...override, // Apply overrides
        disabled: isMenuItemDisabled(propertyType, id),
        onClick: () => handleAction(id),
      };
    });
  
  menuSections.push({
    title: 'Data',
    items: dataItems,
  });
  
  // ... continue for other sections
  
  return menuSections;
}
```

---

## 📋 Configuration Summary Table

| Property Type | Type-Specific Items | Calculate Override | Hidden | Disabled |
|--------------|---------------------|-------------------|--------|----------|
| **Select** | Edit options, Manage colors | Mode | - | - |
| **Multi-Select** | Edit options, Manage colors | Show all values | - | - |
| **Number** | Format (8 currencies), Show as (3 modes) | Sum, Avg, Median, Min, Max | - | - |
| **Date** | Date format (6), Time (3), Notifications | Earliest, Latest, Range | - | - |
| **Text** | - | Standard | - | - |
| **Title** | Show page icon | Standard | delete | toggleRequired, hide |
| **Checkbox** | - | Checked/Unchecked counts | - | - |
| **Created Time** | Date/Time format | Earliest, Latest | delete, duplicate | toggleRequired |
| **Created By** | - | Unique count | delete, duplicate | toggleRequired |
| **People** | - | Unique count | - | - |
| **URL/Email/Phone** | - | Standard | - | - |
| **Files** | - | File count | - | - |
| **Formula** | - | - | duplicate | toggleRequired |
| **Rollup** | - | - | duplicate | toggleRequired |
| **Relation** | - | Relation count | - | - |
| **Unique ID** | - | - | delete, duplicate | toggleRequired |

---

## ✨ Benefits

### 1. Modular & DRY
- Base menu defined once
- Property types only define differences
- Zero code duplication

### 2. Type-Safe
- Full TypeScript support
- Compile-time validation
- IDE autocomplete

### 3. Extensible
- Easy to add new property types
- Easy to add new menu items
- Flexible override system

### 4. Maintainable
- Each property type in separate file
- Clear separation of concerns
- Easy to locate and update

### 5. Consistent UX
- Same menu structure everywhere
- Predictable behavior
- Professional feel

---

## 🚀 Adding New Property Type

### Step 1: Create Config File

Create `properties/{type}/menu-config.ts`:

```typescript
import type { PropertyTypeMenuConfig } from '../../components/PropertyMenu/menu-config';

export const myTypePropertyMenuConfig: PropertyTypeMenuConfig = {
  typeSpecificItems: [
    // Add type-specific menu items here
  ],
  
  overrides: {
    // Override base menu items if needed
  },
  
  hidden: [
    // Hide base menu items if needed
  ],
  
  disabled: [
    // Disable base menu items if needed
  ],
};
```

### Step 2: Register in Registry

Update `properties/menu-registry.ts`:

```typescript
import { myTypePropertyMenuConfig } from './my_type/menu-config';

export const PROPERTY_MENU_REGISTRY = {
  ...existing,
  my_type: myTypePropertyMenuConfig,
};
```

### Step 3: Done!

Menu automatically adapts for the new property type.

---

## 📞 Related Documentation

- **[Property System Overview](./overview.md)** - Understanding property architecture
- **[Property Types Reference](./property-types.md)** - All 20+ property types
- **[Component API](../api-reference/components.md)** - PropertyMenu component API
- **[Adding Property Type Guide](../guides/adding-property-type.md)** - Step-by-step tutorial

---

**Last Updated:** November 6, 2025  
**Status:** ✅ Complete and Production Ready  
**Files:** 11 configuration files + registry
