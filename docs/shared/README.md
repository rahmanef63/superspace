# Shared Component System Documentation

Welcome to the Shared Component System documentation!

## 📚 Documentation Index

1. **[Overview](./01-overview.md)** - System architecture and vision
2. **[Component System](./02-component-system.md)** - Creating and using components
3. **[Registry System](./03-registry-system.md)** - Registry and discovery
4. **[Grouping & Instances](./04-grouping-components.md)** - Group operations
5. **[Export & Import](./05-export-import.md)** - JSON/TypeScript conversion
6. **[CMS Integration](./06-cms-integration.md)** - CMS migration guide
7. **[Documents Integration](./07-documents-integration.md)** - Documents integration
8. **[Custom Components](./08-creating-custom-components.md)** - Extending the system
9. **[API Reference](./09-api-reference.md)** - Complete API documentation

## 🚀 Quick Links

- [Getting Started](./01-overview.md#quick-start)
- [Examples](../examples/)
- [Tests](../../tests/shared/)
- [Type Definitions](../../frontend/shared/types/)

## 📖 What is it?

The Shared Component System is a modular, hierarchical framework for building UI with 6 levels of abstraction:

- **Level 1**: Components (shadcn/ui wrappers)
- **Level 2**: Elements (composite components)
- **Level 3**: Blocks (complex composites)
- **Level 4**: Sections (multiple blocks)
- **Level 5**: Templates (full page layouts)
- **Level 6**: Flows (multi-page experiences)

## ✨ Key Features

- ✅ **Type-safe** - Full TypeScript support
- ✅ **Modular** - Compose at any level
- ✅ **Portable** - Export to JSON/TypeScript
- ✅ **Compatible** - Integrates with CMS & Documents
- ✅ **Extensible** - Easy to add new components
- ✅ **Validated** - Zod schema validation

## 🎯 Use Cases

### For Developers
- Build reusable component libraries
- Generate code from visual designs
- Share component definitions across teams
- Migrate legacy CMS content

### For Designers
- Create design systems
- Define component hierarchies
- Export designs as code
- Maintain design consistency

### For Content Creators
- Build pages with blocks
- Reuse templates
- Switch between visual and code editors
- Export content in multiple formats

## 📦 What's Included

### Core Libraries
- **Types** - TypeScript definitions
- **Registry** - Component discovery system
- **Validation** - Zod schemas
- **Export** - JSON/TypeScript exporters
- **Import** - JSON/TypeScript importers
- **Converters** - CMS/Documents integration
- **Grouping** - Group & instance operations

### Component Libraries
- **Components** (Level 1) - 9+ shadcn/ui wrappers
- **Elements** (Level 2) - Composite elements
- **Blocks** (Level 3) - Complex blocks
- **Sections** (Level 4) - Page sections
- **Templates** (Level 5) - Page templates
- **Flows** (Level 6) - Multi-page flows

### Tools & Utilities
- **Factories** - Component/element creators
- **Validators** - Prop validation
- **Error Handlers** - Error management
- **Cache** - Performance optimization

## 🎓 Learning Path

### Beginner
1. Read [Overview](./01-overview.md)
2. Try [Quick Start](./01-overview.md#quick-start)
3. Create a [Custom Component](./02-component-system.md)
4. Explore [Examples](../examples/)

### Intermediate
1. Learn [Registry System](./03-registry-system.md)
2. Use [Grouping](./04-grouping-components.md)
3. Master [Export/Import](./05-export-import.md)
4. Build [Elements & Blocks](./08-creating-custom-components.md)

### Advanced
1. Integrate [CMS](./06-cms-integration.md)
2. Integrate [Documents](./07-documents-integration.md)
3. Extend the system
4. Contribute back

## 🤝 Contributing

We welcome contributions! Please:
1. Read the documentation
2. Check existing components
3. Follow the patterns
4. Write tests
5. Update docs
6. Submit PR

## 📝 Status

**Version**: 1.0.0 (Production Ready) ✅

All 9 phases completed:
- ✅ Foundation & Infrastructure
- ✅ Component System
- ✅ Higher-Level Abstractions
- ✅ Grouping & Instances
- ✅ Export/Import System
- ✅ CMS Integration
- ✅ Documents Integration
- ✅ Testing & Validation
- ✅ Documentation

## 🔗 Resources

- [API Reference](./09-api-reference.md)
- [Examples](../examples/)
- [Tests](../../tests/shared/)
- [Source Code](../../frontend/shared/)

## 📞 Support

- Check documentation first
- Browse examples
- Run tests
- File issues on GitHub

---

**Happy Building!** 🚀
