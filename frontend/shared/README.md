# Shared Component System

> A modular, hierarchical framework for building UI with 6 levels of abstraction

**Version**: 1.0.0 ✅ Production Ready
**Status**: All 9 phases completed

---

## 🎯 Quick Start

```typescript
import { getComponentWrapper, exportToJSON } from "@/frontend/shared"

// Get a component
const button = getComponentWrapper("button")

// Create a node
const node = {
  id: "button-1",
  type: "component",
  component: "button",
  props: { text: "Click me" },
}

// Export to JSON
const result = exportToJSON([node])
console.log(result.data)
```

## 📖 Documentation

See [docs/shared/README.md](../../docs/shared/README.md) for complete documentation.

## 🏗️ Architecture

6-level hierarchy:
1. **Components** - Atomic UI (shadcn/ui wrappers)
2. **Elements** - Composite components
3. **Blocks** - Complex composites
4. **Sections** - Multiple blocks
5. **Templates** - Full pages
6. **Flows** - Multi-page experiences

## 📂 Structure

```
frontend/shared/
├── types/          # TypeScript types
├── lib/            # Core libraries
├── components/     # Level 1 wrappers
├── elements/       # Level 2 composites
├── blocks/         # Level 3 blocks
├── sections/       # Level 4 sections
├── templates/      # Level 5 templates
├── flows/          # Level 6 flows
└── index.ts        # Main exports
```

## ✨ Features

- ✅ Type-safe with TypeScript
- ✅ Validated with Zod
- ✅ JSON ↔ TypeScript conversion
- ✅ CMS v0.4 compatible
- ✅ Documents integration
- ✅ Group & instance system
- ✅ Dynamic registry
- ✅ Comprehensive tests
- ✅ Full documentation

## 🚀 Usage

```typescript
// Import
import {
  getComponentWrapper,
  createGroup,
  exportToJSON,
  exportToTypeScript,
  importFromJSON,
} from "@/frontend/shared"

// Use registry
const button = getComponentWrapper("button")

// Create group
const group = createGroup(["node-1", "node-2"])

// Export
const json = exportToJSON(nodes)
const tsx = exportToTypeScript(nodes, "MyComponent")

// Import
const imported = importFromJSON(json.data)
```

## 📦 What's Included

### Core (9 files)
- Type system
- Registry
- Validation
- Error handling

### Libraries (13 files)
- Registry system
- Grouping operations
- Export/Import
- Converters

### Components (9 wrappers)
- Button, Input, Card
- Text, Container, Image
- Label, Textarea, Badge

### Higher Levels
- Elements, Blocks, Sections
- Templates, Flows

## 🧪 Testing

```bash
# Run tests
pnpm test tests/shared/

# Run specific test
pnpm test tests/shared/registry.test.ts
```

## 📚 Documentation

- [Overview](../../docs/shared/01-overview.md)
- [Component System](../../docs/shared/02-component-system.md)
- [Export/Import](../../docs/shared/05-export-import.md)
- [Complete Docs](../../docs/shared/)

## 🤝 Contributing

1. Read documentation
2. Follow patterns
3. Write tests
4. Update docs
5. Submit PR

## 📝 License

Same as project license

---

**Ready to use!** 🎉

For detailed documentation, see [docs/shared/](../../docs/shared/)
