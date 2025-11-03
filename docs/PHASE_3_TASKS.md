# Phase 3: Core Property Types - Task Instructions

**Phase:** Phase 3 (Week 5-6)  
**Focus:** Frontend property components for Universal Database  
**Duration:** 2 weeks  
**Prerequisites:** Phase 1 & 2 Complete ✅

---

## Overview

Phase 3 refactors existing property renderers and creates new property types to support all 21 Universal Database property types. This includes building a property registry with auto-discovery architecture.

**Key Requirements:**
- ✅ Refactor 14 existing property types to use new architecture
- ✅ Create 7 new property types (Status, Phone, Button, etc.)
- ✅ Build property registry with auto-discovery
- ✅ Maintain backward compatibility with V1
- ✅ Write comprehensive tests (85%+ coverage)
- ✅ Accessibility compliant (WCAG 2.1 AA)

---

## Architecture Overview

### Current State (V1)
- Monolithic `FieldValue.tsx` component with switch statement
- Hardcoded property rendering logic
- No extensibility or plugin system
- Tightly coupled to V1 database schema

### Target State (V2)
- Modular property components in separate files
- Auto-discovery property registry
- Plugin-like architecture (zero hardcoding)
- Universal Database schema support
- Backward compatible with V1 via adapter

### Directory Structure
```
frontend/features/database/
  properties/               # NEW: Property components
    title/
      config.ts            # Property configuration & metadata
      PropertyRenderer.tsx  # Display component
      PropertyEditor.tsx    # Edit component
      index.ts             # Exports
    rich-text/
      config.ts
      PropertyRenderer.tsx
      PropertyEditor.tsx
      index.ts
    number/
      config.ts
      PropertyRenderer.tsx
      PropertyEditor.tsx
      NumberOptions.tsx     # Options panel
      index.ts
    ... (21 property types total)
  
  registry/                # NEW: Property registry
    PropertyRegistry.ts    # Core registry class
    auto-discovery.ts      # Auto-discover properties
    types.ts              # Registry types
    index.ts
  
  components/             # EXISTING: Refactor
    FieldValue.tsx        # Keep for V1 compat, use registry for V2
    ... other components
```

---

## Task 3.1: Property Registry Infrastructure

**Priority:** HIGH  
**Duration:** 2 days  
**Lines:** ~400

### Requirements

Create the property registry system with auto-discovery support.

### Deliverables

#### 1. Registry Types (`frontend/features/database/registry/types.ts`)
```typescript
/**
 * Property renderer component props
 */
export interface PropertyRendererProps<T = unknown> {
  value: T;
  property: Property; // From Phase 1 types
  readOnly?: boolean;
  className?: string;
}

/**
 * Property editor component props
 */
export interface PropertyEditorProps<T = unknown> {
  value: T;
  property: Property;
  onChange: (value: T) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Property configuration
 */
export interface PropertyConfig {
  // Identification
  type: PropertyType; // From Phase 1: "title" | "rich_text" | ...
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  
  // Capabilities
  supportsOptions: boolean;
  supportsRequired: boolean;
  supportsUnique?: boolean;
  supportsDefault?: boolean;
  
  // Components
  Renderer: React.ComponentType<PropertyRendererProps>;
  Editor: React.ComponentType<PropertyEditorProps>;
  OptionsPanel?: React.ComponentType<PropertyOptionsPanelProps>;
  
  // Validation
  validate?: (value: unknown, property: Property) => string | null;
  format?: (value: unknown) => string;
  
  // Metadata
  category: "core" | "extended" | "auto";
  version: string;
  since?: string; // When added (e.g., "v2.0")
}

/**
 * Property registry interface
 */
export interface IPropertyRegistry {
  register(config: PropertyConfig): void;
  get(type: PropertyType): PropertyConfig | undefined;
  getAll(): PropertyConfig[];
  has(type: PropertyType): boolean;
  getByCategory(category: PropertyConfig["category"]): PropertyConfig[];
}
```

#### 2. Property Registry (`frontend/features/database/registry/PropertyRegistry.ts`)
```typescript
/**
 * Property Registry - Singleton
 * 
 * Central registry for all property types with lazy loading support.
 */
class PropertyRegistry implements IPropertyRegistry {
  private properties = new Map<PropertyType, PropertyConfig>();
  private static instance: PropertyRegistry | null = null;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  static getInstance(): PropertyRegistry {
    if (!PropertyRegistry.instance) {
      PropertyRegistry.instance = new PropertyRegistry();
    }
    return PropertyRegistry.instance;
  }
  
  register(config: PropertyConfig): void {
    if (this.properties.has(config.type)) {
      console.warn(`Property type "${config.type}" already registered. Skipping.`);
      return;
    }
    
    this.properties.set(config.type, config);
  }
  
  get(type: PropertyType): PropertyConfig | undefined {
    return this.properties.get(type);
  }
  
  getAll(): PropertyConfig[] {
    return Array.from(this.properties.values());
  }
  
  has(type: PropertyType): boolean {
    return this.properties.has(type);
  }
  
  getByCategory(category: PropertyConfig["category"]): PropertyConfig[] {
    return this.getAll().filter((config) => config.category === category);
  }
  
  // For testing
  clear(): void {
    this.properties.clear();
  }
}

export const propertyRegistry = PropertyRegistry.getInstance();
```

#### 3. Auto-Discovery (`frontend/features/database/registry/auto-discovery.ts`)
```typescript
/**
 * Auto-discover and register all property types
 * 
 * Scans the properties/ directory and auto-registers all property configs.
 * Uses Vite's import.meta.glob for automatic module discovery.
 */
import { propertyRegistry } from "./PropertyRegistry";
import type { PropertyConfig } from "./types";

// Auto-discover all property configs using Vite's glob import
const propertyModules = import.meta.glob<{ default: PropertyConfig }>(
  "../properties/*/config.ts",
  { eager: true }
);

/**
 * Register all discovered properties
 */
export function registerAllProperties(): void {
  Object.entries(propertyModules).forEach(([path, module]) => {
    const config = module.default;
    
    if (!config || !config.type) {
      console.warn(`Invalid property config at ${path}`);
      return;
    }
    
    propertyRegistry.register(config);
  });
  
  console.log(`✅ Registered ${propertyRegistry.getAll().length} property types`);
}

// Auto-register on module load
registerAllProperties();
```

### Testing

**File:** `tests/features/database/property-registry.test.ts`

**Tests:** 20+ tests
1. ✅ PropertyRegistry is singleton
2. ✅ Can register property config
3. ✅ Can retrieve property by type
4. ✅ Can get all properties
5. ✅ Can check if property exists
6. ✅ Can get properties by category
7. ✅ Prevents duplicate registration
8. ✅ Auto-discovery finds all properties
9. ✅ Auto-discovery registers configs correctly
10. ✅ Registry clears for testing

---

## Task 3.2: Refactor Existing Properties (14 types)

**Priority:** HIGH  
**Duration:** 5 days  
**Lines:** ~2,800 (200 per property type)

### Strategy

Extract each property type from `FieldValue.tsx` into modular components with the new architecture.

### Property Types to Refactor

1. **Title** (Primary text field)
2. **Rich Text** (Formatted text with markdown)
3. **Number** (Plain/percent/currency)
4. **Select** (Single choice)
5. **Multi-select** (Multiple choices)
6. **Date** (Date/datetime/range)
7. **People** (User references)
8. **Files** (Attachments)
9. **Checkbox** (Boolean)
10. **URL** (Web link)
11. **Email** (Email address)
12. **Relation** (Link to database)
13. **Rollup** (Aggregate from relation)
14. **Formula** (Computed value)

### Template Structure (Per Property)

Each property type follows this structure:

```
frontend/features/database/properties/{property-name}/
  config.ts              # Configuration & metadata
  PropertyRenderer.tsx    # Read-only display
  PropertyEditor.tsx      # Editable input
  {Property}Options.tsx   # Options panel (if applicable)
  utils.ts               # Helper functions (optional)
  index.ts               # Exports
```

### Example: Title Property

#### `config.ts`
```typescript
import { Text } from "lucide-react";
import type { PropertyConfig } from "../../registry/types";
import { TitleRenderer } from "./TitleRenderer";
import { TitleEditor } from "./TitleEditor";

export const titlePropertyConfig: PropertyConfig = {
  type: "title",
  label: "Title",
  description: "Primary text field for the record",
  icon: Text,
  
  supportsOptions: false,
  supportsRequired: true,
  supportsUnique: false,
  supportsDefault: true,
  
  Renderer: TitleRenderer,
  Editor: TitleEditor,
  
  validate: (value) => {
    if (typeof value !== "string") {
      return "Title must be a string";
    }
    if (value.length > 200) {
      return "Title must be 200 characters or less";
    }
    return null;
  },
  
  format: (value) => {
    return typeof value === "string" ? value.trim() : "";
  },
  
  category: "core",
  version: "2.0",
};

export default titlePropertyConfig;
```

#### `TitleRenderer.tsx`
```typescript
import type { PropertyRendererProps } from "../../registry/types";
import { cn } from "@/lib/utils";

export function TitleRenderer({ value, readOnly, className }: PropertyRendererProps<string>) {
  const displayValue = typeof value === "string" ? value.trim() : "";
  
  if (!displayValue) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        Untitled
      </span>
    );
  }
  
  return (
    <span className={cn("text-sm font-medium text-foreground", className)}>
      {displayValue}
    </span>
  );
}
```

#### `TitleEditor.tsx`
```typescript
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { PropertyEditorProps } from "../../registry/types";
import { cn } from "@/lib/utils";

export function TitleEditor({
  value,
  onChange,
  onBlur,
  autoFocus,
  className,
}: PropertyEditorProps<string>) {
  const [localValue, setLocalValue] = useState(value || "");
  
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  return (
    <Input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      autoFocus={autoFocus}
      placeholder="Enter title..."
      maxLength={200}
      className={cn("text-sm", className)}
    />
  );
}
```

#### `index.ts`
```typescript
export { titlePropertyConfig as default } from "./config";
export { TitleRenderer } from "./TitleRenderer";
export { TitleEditor } from "./TitleEditor";
```

### Refactoring Steps (Per Property)

1. **Create directory:** `frontend/features/database/properties/{name}/`
2. **Extract rendering logic** from `FieldValue.tsx` → `PropertyRenderer.tsx`
3. **Create editor component** → `PropertyEditor.tsx`
4. **Create config file** with metadata → `config.ts`
5. **Add options panel** if property has options → `{Property}Options.tsx`
6. **Extract utilities** → `utils.ts` (optional)
7. **Create index** → `index.ts`
8. **Write tests** → `tests/features/database/properties/{name}.test.tsx`

### Testing Per Property

**Tests:** 15+ per property type
1. ✅ Renderer displays value correctly
2. ✅ Renderer shows empty state
3. ✅ Renderer handles null/undefined
4. ✅ Renderer applies className
5. ✅ Editor renders with initial value
6. ✅ Editor calls onChange on input
7. ✅ Editor calls onBlur when blurred
8. ✅ Editor supports autoFocus
9. ✅ Validate function works correctly
10. ✅ Format function works correctly
11. ✅ Config exports correctly
12. ✅ Config has correct metadata
13. ✅ Options panel renders (if applicable)
14. ✅ Accessibility: keyboard navigation
15. ✅ Accessibility: screen reader labels

---

## Task 3.3: Create New Properties (7 types)

**Priority:** MEDIUM  
**Duration:** 4 days  
**Lines:** ~1,400 (200 per property type)

### New Property Types

1. **Status** - Structured enum with groups (To do / In progress / Done)
2. **Phone** - Phone number with validation
3. **Button** - Trigger actions (URL, create record, etc.)
4. **Unique ID** - Auto-generated with prefix (TASK-1001)
5. **Place** - Address/location (Google Maps integration)
6. **Created Time** - Auto timestamp (read-only)
7. **Created By** - Auto user reference (read-only)

### Example: Status Property

#### `config.ts`
```typescript
import { CheckCircle2 } from "lucide-react";
import type { PropertyConfig } from "../../registry/types";
import { StatusRenderer } from "./StatusRenderer";
import { StatusEditor } from "./StatusEditor";
import { StatusOptions } from "./StatusOptions";

export const statusPropertyConfig: PropertyConfig = {
  type: "status",
  label: "Status",
  description: "Structured status with groups (e.g., Todo, In Progress, Done)",
  icon: CheckCircle2,
  
  supportsOptions: true,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  
  Renderer: StatusRenderer,
  Editor: StatusEditor,
  OptionsPanel: StatusOptions,
  
  validate: (value, property) => {
    if (!value) return null;
    
    const options = property.options?.statusOptions || [];
    const validIds = options.flatMap((group) => group.options.map((o) => o.id));
    
    if (!validIds.includes(value as string)) {
      return "Invalid status value";
    }
    
    return null;
  },
  
  format: (value) => {
    return typeof value === "string" ? value : "";
  },
  
  category: "extended",
  version: "2.0",
  since: "v2.0",
};

export default statusPropertyConfig;
```

#### `StatusRenderer.tsx`
```typescript
import { Badge } from "@/components/ui/badge";
import type { PropertyRendererProps } from "../../registry/types";
import type { StatusOptions } from "@/frontend/shared/foundation/types/property-options";
import { cn } from "@/lib/utils";

export function StatusRenderer({ value, property, className }: PropertyRendererProps<string>) {
  const statusOptions = property.options as StatusOptions | undefined;
  
  if (!value || !statusOptions) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        —
      </span>
    );
  }
  
  // Find status option across all groups
  let statusOption = null;
  for (const group of statusOptions.groups) {
    statusOption = group.options.find((opt) => opt.id === value);
    if (statusOption) break;
  }
  
  if (!statusOption) {
    return <span className={cn("text-sm", className)}>{value}</span>;
  }
  
  return (
    <Badge
      className={cn("capitalize", className)}
      style={{
        backgroundColor: statusOption.color,
        color: "var(--foreground)",
      }}
    >
      {statusOption.name}
    </Badge>
  );
}
```

### Testing Per New Property

**Tests:** 20+ per property type
1. ✅ All standard property tests (15 from refactored properties)
2. ✅ New feature-specific tests (5+)
3. ✅ Options panel works correctly
4. ✅ Default values applied
5. ✅ Validation works for new constraints

---

## Task 3.4: Update FieldValue Component

**Priority:** MEDIUM  
**Duration:** 1 day  
**Lines:** ~150

### Requirements

Update `FieldValue.tsx` to use the property registry for V2 databases while maintaining V1 compatibility.

### Implementation

```typescript
"use client";

import { propertyRegistry } from "../registry";
import type { Property } from "@/frontend/shared/foundation/types/universal-database";

interface FieldValueProps {
  field: any; // V1 field type
  property?: Property; // V2 property type
  value: unknown;
  readOnly?: boolean;
  className?: string;
}

export function FieldValue({ field, property, value, readOnly, className }: FieldValueProps) {
  // V2: Use property registry
  if (property) {
    const config = propertyRegistry.get(property.type);
    
    if (!config) {
      console.warn(`Property type "${property.type}" not registered`);
      return <span className="text-sm text-muted-foreground">Unsupported</span>;
    }
    
    const { Renderer } = config;
    return <Renderer value={value} property={property} readOnly={readOnly} className={className} />;
  }
  
  // V1: Legacy rendering (keep existing switch statement)
  switch (field.type) {
    case "title":
      return <TitleLegacy value={value} />;
    // ... other V1 cases
    default:
      return <span>Unknown field type</span>;
  }
}
```

### Testing

**Tests:** 10+ tests
1. ✅ Uses registry for V2 properties
2. ✅ Falls back to V1 for legacy fields
3. ✅ Handles missing property config gracefully
4. ✅ Passes props correctly to Renderer

---

## Task 3.5: Integration & Testing

**Priority:** HIGH  
**Duration:** 2 days  
**Lines:** ~600 (test code)

### Integration Tests

**File:** `tests/features/database/property-integration.test.tsx`

**Tests:** 30+ integration tests
1. ✅ All 21 property types registered
2. ✅ Auto-discovery finds all configs
3. ✅ Registry returns correct configs
4. ✅ Renderer components render correctly
5. ✅ Editor components work correctly
6. ✅ FieldValue uses registry for V2
7. ✅ FieldValue falls back to V1
8. ✅ Property validation works
9. ✅ Property formatting works
10. ✅ Options panels render

### E2E Tests

**File:** `tests/e2e/database-properties.spec.ts`

**Tests:** 20+ E2E tests
1. ✅ Can create database with all property types
2. ✅ Can edit each property type
3. ✅ Property options panels work
4. ✅ Validation prevents invalid input
5. ✅ Auto properties (created_time, created_by) work

---

## Definition of Done (DoD)

### Code Complete ✅
- [ ] Property registry implemented
- [ ] Auto-discovery working
- [ ] 14 existing properties refactored
- [ ] 7 new properties created
- [ ] FieldValue updated for V2
- [ ] All 21 property types working
- [ ] Zero TypeScript errors
- [ ] Zero linting errors

### Tests Written ✅
- [ ] Unit tests for registry (20+)
- [ ] Unit tests per property (15+ each = 315+)
- [ ] Integration tests (30+)
- [ ] E2E tests (20+)
- [ ] **Total: 385+ tests**

### Tests Passing ✅
- [ ] 100% tests passing
- [ ] 85%+ code coverage
- [ ] No console errors
- [ ] Accessibility tests passing

### Documentation ✅
- [ ] JSDoc on all exports
- [ ] README for property system
- [ ] Migration guide (V1 → V2)
- [ ] Property creation guide

### Accessibility ✅
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader labels correct
- [ ] Focus management proper

---

## Next Steps After Phase 3

Once Phase 3 is complete:
1. Update `docs/99_CURRENT_PROGRESS.md`
2. Update `docs/UNIVERSAL_DATABASE_TODO.md`
3. Create `docs/PHASE_3_SUMMARY.md`
4. Prepare for Phase 4 (View Types)

---

**Prepared by:** Agent 1 & Agent 2  
**Date:** 2025-11-03  
**Phase 1 Status:** ✅ Complete  
**Phase 2 Status:** ✅ Complete  
**Phase 3 Status:** 📋 Ready to Start
