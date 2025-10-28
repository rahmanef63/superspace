# Shared Component System - Overview

## 🎯 Vision

A modular, hierarchical system for building UI with 6 levels of abstraction:

1. **Components** (Level 1) - Atomic UI elements (shadcn/ui wrappers)
2. **Elements** (Level 2) - Composite components (e.g., FormField)
3. **Blocks** (Level 3) - Complex composites (e.g., LoginForm)
4. **Sections** (Level 4) - Multiple blocks (e.g., Hero + Features)
5. **Templates** (Level 5) - Full page layouts
6. **Flows** (Level 6) - Multi-page experiences

## 🌟 Key Features

### ✅ Bidirectional Conversion
- **JSON** ↔ **TypeScript/JSX**
- **CMS v0.4** ↔ **Shared System v1.0**
- **Documents Blocks** ↔ **Shared System v1.0**

### ✅ Group & Component Instances
- **Group/Ungroup** - Organize multiple nodes
- **Component Definitions** - Reusable components
- **Component Instances** - Multiple instances with overrides
- **Explode/Collapse** - Navigate hierarchy

### ✅ Type Safety
- Full TypeScript support
- Zod validation for JSON schemas
- Compile-time prop checking
- Runtime validation

### ✅ Dynamic Registry
- Auto-discovery from folder structure
- Hot reload in development
- Caching for performance
- Validation on registration

### ✅ Error Handling
- Detailed error messages
- Partial import support
- Warning system
- Error recovery

## 📂 Project Structure

```
frontend/shared/
├── types/              # TypeScript type definitions
│   ├── core.ts         # Base node types
│   ├── json-schema.ts  # Zod schemas
│   ├── registry.ts     # Registry types
│   ├── conversion.ts   # Conversion types
│   └── errors.ts       # Error types
│
├── lib/                # Core functionality
│   ├── registry/       # Registry system
│   ├── errors/         # Error handling
│   ├── validation/     # Validators
│   ├── grouping/       # Group/instance operations
│   ├── export/         # Export to JSON/TS
│   ├── import/         # Import from JSON/TS
│   └── converters/     # CMS/Documents converters
│
├── components/         # Level 1 - Components
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   └── ...
│
├── elements/           # Level 2 - Elements
│   ├── FormField/
│   └── ...
│
├── blocks/             # Level 3 - Blocks
├── sections/           # Level 4 - Sections
├── templates/          # Level 5 - Templates
├── flows/              # Level 6 - Flows
│
└── index.ts            # Main exports
```

## 🚀 Quick Start

### Installation

```bash
# Already included in the project
# No additional installation required
```

### Basic Usage

```typescript
import {
  getGlobalRegistry,
  getComponentWrapper,
  exportToJSON,
  importFromJSON,
} from "@/frontend/shared"

// Get component
const button = getComponentWrapper("button")

// Create node
const node = {
  id: "button-1",
  type: "component",
  name: "Button",
  component: "button",
  props: { text: "Click me" },
}

// Export to JSON
const result = exportToJSON([node])
console.log(result.data)

// Import from JSON
const imported = importFromJSON(result.data)
console.log(imported.data)
```

## 📖 Documentation Structure

1. [Overview](./01-overview.md) - This file
2. [Component System](./02-component-system.md) - Creating components
3. [Registry System](./03-registry-system.md) - Using the registry
4. [Grouping & Instances](./04-grouping-components.md) - Group operations
5. [Export & Import](./05-export-import.md) - JSON/TS conversion
6. [CMS Integration](./06-cms-integration.md) - CMS migration
7. [Documents Integration](./07-documents-integration.md) - Documents integration
8. [Custom Components](./08-creating-custom-components.md) - Extending the system
9. [API Reference](./09-api-reference.md) - Complete API

## 🎓 Learn by Example

Check out the [examples/](../examples/) directory for:
- Custom component creation
- Block composition
- Template building
- CMS migration
- Documents integration

## 🤝 Contributing

When adding new components:
1. Create wrapper in `frontend/shared/components/{Name}/`
2. Add to `registry.ts`
3. Write tests in `tests/shared/`
4. Update documentation

## 📊 Status

- ✅ Phase 1: Foundation (100%)
- ✅ Phase 2: Components (100%)
- ✅ Phase 3: Higher Levels (100%)
- ✅ Phase 4: Grouping (100%)
- ✅ Phase 5: Export/Import (100%)
- ✅ Phase 6: CMS Integration (100%)
- ✅ Phase 7: Documents Integration (100%)
- ✅ Phase 8: Tests (100%)
- ✅ Phase 9: Documentation (100%)

**Status**: ✅ Production Ready

## 📝 Version

**Current Version**: 1.0.0
**Schema Version**: 1.0.0
**Format**: superspace-v1

## 🔗 Links

- [GitHub Issues](https://github.com/your-repo/issues)
- [Changelog](./CHANGELOG.md)
- [Migration Guide](./MIGRATION.md)
