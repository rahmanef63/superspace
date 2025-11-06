# Feature-Specific Documentation

> Documentation for individual features and their isolation/deployment guides

---

## 📁 Features

### CMS-Lite
**Folder:** [cms-lite/](cms-lite/)

Complete CMS (Content Management System) feature with:
- Blog posts management
- Product catalog
- Portfolio showcase
- Services directory
- Navigation builder
- Landing page builder
- Media library
- Multi-language support
- E-commerce features (cart, wishlist, currency)

**Status:** Development
**Complexity:** High (~330 files)

---

## 📖 Feature Documentation Structure

Each feature folder contains:
- **Isolation Guide** - How to extract feature to standalone package
- **Isolation Manifest** - Complete file listing (~330 files for cms-lite)
- **Integration Guide** - How to integrate into existing projects
- **API Documentation** - Backend endpoints and schemas
- **Component Catalog** - Frontend components

---

## 🚀 Feature Isolation

### Why Isolate Features?

- **External Development:** Develop features outside main project
- **Modular Deployment:** Deploy features independently
- **Team Distribution:** Different teams work on different features
- **Code Reuse:** Use features in multiple projects

### How to Isolate

Each feature folder contains:
1. **Isolation Guide** - Step-by-step extraction process
2. **Manifest** - Complete file list with dependencies
3. **Scripts** - Automation scripts for copying files
4. **Templates** - Configuration file templates

---

## 🔧 Integration to Projects

### Prerequisites
- Next.js 15+ with App Router
- Convex for backend
- Clerk for authentication
- shadcn/ui for components
- TypeScript

### Integration Steps
1. Copy feature files
2. Copy dependencies (shared, lib, convex)
3. Install npm packages
4. Configure environment
5. Run tests
6. Deploy

See individual feature guides for detailed steps.

---

## 📊 Available Features

| Feature | Status | Complexity | Files | Description |
|---------|--------|------------|-------|-------------|
| **cms-lite** | Development | High | ~330 | Complete CMS with e-commerce |
| *(more to come)* | - | - | - | - |

---

## 🔗 Related Documentation

- **[../00_BASE_KNOWLEDGE.md](../00_BASE_KNOWLEDGE.md)** - Core concepts for feature development
- **[../1-core/](../1-core/)** - System architecture
- **[../2-rules/FEATURE_RULES.md](../2-rules/FEATURE_RULES.md)** - Feature development rules

---

## 💡 Adding Feature Documentation

When documenting a new feature:

1. Create folder: `5-features/{feature-name}/`
2. Add isolation guide: `{FEATURE}_ISOLATION_GUIDE.md`
3. Add manifest: `{feature}-isolation-manifest.md`
4. Create automation scripts (optional)
5. Update this README with feature info

---

**Last Updated:** 2025-11-04
**Features Documented:** 1 (cms-lite)
