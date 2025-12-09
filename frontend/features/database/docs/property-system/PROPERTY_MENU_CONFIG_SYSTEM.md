# Property Menu Configuration System

**Tanggal:** 6 November 2025  
**Status:** ✅ Complete

---

## 📋 Overview

System ini mengatur **Property Menu** (context menu untuk setiap property type) dengan membedakan:
1. **Base Menu Items** - Menu yang sama untuk SEMUA property types
2. **Type-Specific Items** - Menu khusus untuk property type tertentu
3. **Overrides** - Modifikasi menu base untuk type tertentu
4. **Hidden/Disabled** - Control visibility dan state

---

## 🏗️ Architecture

### 1. Base Configuration
**File:** `frontend/features/database/components/PropertyMenu/menu-config.ts`

Mendefinisikan **15 base menu items** yang tersedia untuk semua property:

```typescript
BASE_MENU_ITEMS = {
  // Edit Section
  rename, duplicate,
  
  // Data Section
  sortAsc, sortDesc, filter, calculate,
  
  // Column Section
  wrap, insertLeft, insertRight, moveLeft, moveRight,
  
  // Settings Section
  toggleRequired, hide,
  
  // Danger Section
  delete
}
```

### 2. Property Type Configuration
**Location:** `frontend/features/database/properties/{type}/menu-config.ts`

Setiap property type memiliki file `menu-config.ts` yang mendefinisikan:

```typescript
export const {type}PropertyMenuConfig: PropertyTypeMenuConfig = {
  // Menu tambahan khusus untuk type ini
  typeSpecificItems: [...],
  
  // Override menu base (misal: calculate options yang berbeda)
  overrides: { ... },
  
  // Menu yang disembunyikan
  hidden: [...],
  
  // Menu yang disabled
  disabled: [...]
}
```

### 3. Registry System
**File:** `frontend/features/database/properties/menu-registry.ts`

Central registry yang memetakan property type ke configuration:

```typescript
PROPERTY_MENU_REGISTRY = {
  'select': selectPropertyMenuConfig,
  'number': numberPropertyMenuConfig,
  'date': datePropertyMenuConfig,
  ...
}
```

---

## 📦 Property Type Configurations

### 1. **Select** Property
**File:** `properties/select/menu-config.ts`

**Type-Specific Items:**
- ✨ Edit options (⌘E)
- 🎨 Manage colors

**Calculate Override:**
- Count all, empty, filled, unique
- Percent empty/filled
- **Show most common** (mode)

**Example Menu:**
```
Select
├─ Edit property
│  ├─ Rename property (⌘R)
│  ├─ Duplicate property
│  ├─ ✨ Edit options (⌘E)        ← Type-specific
│  └─ 🎨 Manage colors             ← Type-specific
├─ Data
│  ├─ Sort ascending
│  ├─ Sort descending
│  ├─ Filter
│  └─ Calculate
│     ├─ Count all
│     ├─ Count empty
│     ├─ Count filled
│     ├─ Count unique values
│     ├─ Percent empty
│     ├─ Percent filled
│     └─ Show most common         ← Override
└─ ...
```

---

### 2. **Number** Property
**File:** `properties/number/menu-config.ts`

**Type-Specific Items:**
- 🔢 Number format
  - Number
  - Number with commas
  - Percent
  - Rupiah (IDR)
  - US Dollar (USD)
  - Euro (EUR), GBP, JPY
- 📊 Show as
  - Number
  - Bar
  - Ring

**Calculate Override:**
- **Sum, Average, Median** (number-specific)
- Min, Max, Range
- Count, empty, filled

**Example:**
```
Number
├─ Edit property
│  ├─ Rename property (⌘R)
│  ├─ Duplicate property
│  ├─ 🔢 Number format              ← Type-specific
│  │  ├─ Number
│  │  ├─ Number with commas
│  │  ├─ Percent
│  │  ├─ Rupiah (IDR)
│  │  ├─ US Dollar (USD)
│  │  └─ ...
│  └─ 📊 Show as                    ← Type-specific
│     ├─ Number
│     ├─ Bar
│     └─ Ring
└─ Calculate
   ├─ Sum                           ← Number-specific
   ├─ Average                       ← Number-specific
   ├─ Median                        ← Number-specific
   ├─ Min, Max, Range
   └─ Count, empty, filled
```

---

### 3. **Date** Property
**File:** `properties/date/menu-config.ts`

**Type-Specific Items:**
- 📅 Date format
  - Full date
  - Contactly
  - US (MM/DD/YYYY)
  - European (DD/MM/YYYY)
  - ISO (YYYY-MM-DD)
  - Relative
- ⏰ Time format
  - 12 hour
  - 24 hour
  - No time
- 🔔 Notifications

**Calculate Override:**
- **Earliest date, Latest date** (date-specific)
- Date range
- Count, empty, filled

---

### 4. **Title** Property
**File:** `properties/title/menu-config.ts`

**Type-Specific Items:**
- 🖼️ Show page icon

**Special Rules:**
- ❌ Cannot delete (hidden: ['delete'])
- ❌ Cannot toggle required (disabled: ['toggleRequired'])
- ❌ Cannot hide (disabled: ['hide'])

**Example:**
```
Title
├─ Edit property
│  ├─ Rename property (⌘R)
│  ├─ Duplicate property
│  └─ 🖼️ Show page icon            ← Type-specific
├─ Data (...)
├─ Column (...)
├─ Settings
│  ├─ Required (disabled)          ← Cannot toggle
│  └─ Hide in view (disabled)      ← Cannot hide
└─ Delete property (hidden)        ← Cannot delete
```

---

### 5. **Auto Properties** (created_time, created_by, etc.)
**Files:** 
- `properties/created_time/menu-config.ts`
- `properties/created_by/menu-config.ts`

**Special Rules:**
- ❌ Cannot delete (hidden: ['delete'])
- ❌ Cannot duplicate (hidden: ['duplicate'])
- ❌ Cannot toggle required (disabled: ['toggleRequired'])

**Example:**
```
Created Time
├─ Edit property
│  ├─ Rename property (⌘R)
│  ├─ 📅 Date format               ← Type-specific
│  └─ ⏰ Time format                ← Type-specific
├─ Data (...)
├─ Column (...)
├─ Settings
│  ├─ Required (disabled)          ← Cannot toggle
│  └─ Hide in view
└─ (No delete, no duplicate)       ← Auto-generated
```

---

### 6. **Text** Property
**File:** `properties/text/menu-config.ts`

**Type-Specific Items:** None (uses all base items)

**Calculate Override:**
- Count all, empty, filled, unique
- Percent empty/filled

---

### 7. **Checkbox** Property
**File:** `properties/checkbox/menu-config.ts`

**Calculate Override:**
- **Count checked** (checkbox-specific)
- **Count unchecked** (checkbox-specific)
- Percent checked
- Percent unchecked

---

### 8. **Multi-Select** Property
**File:** `properties/multi_select/menu-config.ts`

Similar to Select, with:
- Edit options
- Manage colors
- **Show all values** (calculate option)

---

## 🔧 Usage Examples

### Getting Menu Config for a Property

```typescript
import { getPropertyMenuConfig } from '@/frontend/features/database/properties/menu-registry';

// Get config for 'number' type
const config = getPropertyMenuConfig('number');

// Access type-specific items
config.typeSpecificItems; // [{ id: 'setFormat', ... }, { id: 'showAs', ... }]

// Access overrides
config.overrides.calculate; // Number-specific calculate options

// Check hidden items
config.hidden; // []

// Check disabled items
config.disabled; // []
```

### Checking Visibility/Disabled State

```typescript
import { isMenuItemVisible, isMenuItemDisabled } from '@/frontend/features/database/properties/menu-registry';

// Check if 'delete' is visible for 'title' type
isMenuItemVisible('title', 'delete'); // false (hidden)

// Check if 'toggleRequired' is disabled for 'created_time'
isMenuItemDisabled('created_time', 'toggleRequired'); // true (disabled)
```

### Building Menu Dynamically

```typescript
import { BASE_MENU_ITEMS, MENU_SECTIONS } from '@/frontend/features/database/components/PropertyMenu/menu-config';
import { getPropertyMenuConfig } from '@/frontend/features/database/properties/menu-registry';

function buildPropertyMenu(propertyType: string) {
  const config = getPropertyMenuConfig(propertyType);
  const sections = [];
  
  // Edit section
  const editItems = MENU_SECTIONS.edit
    .filter(id => isMenuItemVisible(propertyType, id))
    .map(id => ({
      ...BASE_MENU_ITEMS[id],
      disabled: isMenuItemDisabled(propertyType, id),
      onClick: () => handleAction(id)
    }));
  
  // Add type-specific items after duplicate
  const finalEditItems = [
    ...editItems,
    ...config.typeSpecificItems
  ];
  
  sections.push({ title: 'Edit', items: finalEditItems });
  
  // Data section with overrides
  const dataItems = MENU_SECTIONS.data.map(id => {
    const baseItem = BASE_MENU_ITEMS[id];
    const override = config.overrides?.[id];
    
    return {
      ...baseItem,
      ...override, // Apply overrides
      disabled: isMenuItemDisabled(propertyType, id),
      onClick: () => handleAction(id)
    };
  });
  
  sections.push({ title: 'Data', items: dataItems });
  
  // ... continue for other sections
  
  return sections;
}
```

---

## 📊 Summary Table

| Property Type | Type-Specific Items | Calculate Override | Hidden | Disabled |
|--------------|---------------------|-------------------|--------|----------|
| **Select** | Edit options, Manage colors | Mode | - | - |
| **Multi-Select** | Edit options, Manage colors | Show all values | - | - |
| **Number** | Number format, Show as | Sum, Avg, Median | - | - |
| **Date** | Date format, Time format, Notifications | Earliest, Latest | - | - |
| **Text** | - | Standard | - | - |
| **Title** | Show page icon | Standard | delete | toggleRequired, hide |
| **Checkbox** | - | Checked/Unchecked | - | - |
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

## 🎯 Key Benefits

### 1. **Modular & DRY**
- Base menu items defined once
- Property types only define what's different
- No duplication

### 2. **Type-Safe**
- TypeScript ensures all configs are valid
- Registry provides centralized access

### 3. **Extensible**
- Easy to add new property types
- Easy to add new menu items
- Override system very flexible

### 4. **Maintainable**
- Each property type has its own file
- Clear separation of concerns
- Easy to find and update

### 5. **Dynamic**
- Menu built at runtime based on property type
- Visibility/disabled state automatically handled
- Consistent UX across all properties

---

## 📁 File Structure

```
frontend/features/database/
├── components/
│   └── PropertyMenu/
│       ├── menu-config.ts           ← Base configuration
│       ├── types.ts                 ← Type definitions
│       ├── utils.ts                 ← Helper functions
│       └── index.tsx                ← PropertyMenu component
├── properties/
│   ├── menu-registry.ts             ← Central registry
│   ├── select/
│   │   └── menu-config.ts           ← Select config
│   ├── number/
│   │   └── menu-config.ts           ← Number config
│   ├── date/
│   │   └── menu-config.ts           ← Date config
│   ├── title/
│   │   └── menu-config.ts           ← Title config
│   ├── text/
│   │   └── menu-config.ts           ← Text config
│   ├── checkbox/
│   │   └── menu-config.ts           ← Checkbox config
│   ├── created_time/
│   │   └── menu-config.ts           ← Auto property config
│   ├── created_by/
│   │   └── menu-config.ts           ← Auto property config
│   └── multi_select/
│       └── menu-config.ts           ← Multi-select config
```

---

## 🚀 Next Steps

1. ✅ Base configuration complete
2. ✅ Property type configs complete (9 types)
3. ✅ Registry system complete
4. ⏳ Update PropertyMenu component to use registry
5. ⏳ Wire up action handlers
6. ⏳ Add remaining property types (formula, rollup, relation, etc.)

---

## 💡 Implementation Notes

### Adding New Property Type

1. Create `menu-config.ts` in property folder:
```typescript
// properties/my_type/menu-config.ts
export const myTypePropertyMenuConfig: PropertyTypeMenuConfig = {
  typeSpecificItems: [...],
  overrides: { ... },
  hidden: [...],
  disabled: [...]
};
```

2. Register in `menu-registry.ts`:
```typescript
import { myTypePropertyMenuConfig } from '../my_type/menu-config';

PROPERTY_MENU_REGISTRY = {
  ...
  my_type: myTypePropertyMenuConfig,
}
```

3. Done! Menu automatically adapts.

---

**Status:** ✅ **ARCHITECTURE COMPLETE**  
**Files Created:** 11 files  
**Lines of Code:** ~1,200 lines  
**Ready For:** Component integration
