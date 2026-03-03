# SuperSpace

> **Modular SaaS Platform with Notion-like Universal Database**

A production-ready, enterprise-grade SaaS platform built with Next.js 15, Convex, and Clerk. Features 19 dynamic modules, 721+ passing tests, and a powerful Universal Database system.

---

## 👋 New to SuperSpace?

| Quick Links | Description |
|-------------|-------------|
| [**QUICKSTART.md**](docs/QUICKSTART.md) | ⚡ Get running in 5 minutes |
| [**Base Knowledge**](docs/00_BASE_KNOWLEDGE.md) | 📚 Essential developer concepts |
| [**Project Status**](PROJECT_STATUS.md) | 📊 Current features & roadmap |
| [**Contributing**](CONTRIBUTING.md) | 🤝 How to contribute |
| [**Glossary**](docs/GLOSSARY.md) | 📖 Key terms & definitions |

---

## ✨ Key Features

### 🏗️ Architecture
- **Zero Hardcoding** - Features auto-discovered from `config.ts` files
- **Modular Design** - Each feature is self-contained with own UI, backend, tests
- **Three-Tier Sharing** - Global → Feature → Local sharing model
- **RBAC Built-in** - Permission hierarchy (Owner → Admin → Member → Guest)
- **Audit Compliance** - Every mutation logged for enterprise needs

### 📦 19 Complete Modules
| Core Systems | Business Tools | Platform |
|--------------|----------------|----------|
| CRM | Accounting | Automations |
| Projects | Sales & Invoicing | Forms Builder |
| Support/Helpdesk | Marketing | Import/Export |
| HR Management | POS | Integrations (12 services) |
| Inventory | Calendar | Audit Log |
| Tasks | Reports/Analytics | Settings |

### 🗄️ Universal Database System
Notion-like flexible database with:
- **20+ Property Types** - text, select, date, people, files, relations, rollups, formulas...
- **7 View Layouts** - Table, Board, Calendar, Timeline, Gallery, List, Form
- **721 Tests** - Comprehensive test coverage
- **Type-Safe** - End-to-end TypeScript + Zod validation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | TailwindCSS v4, shadcn/ui, Radix UI |
| **Backend** | Convex (real-time serverless database) |
| **Auth** | Clerk (authentication + billing) |
| **State** | Zustand + Jotai |
| **Validation** | Zod |
| **Testing** | Vitest + convex-test |
| **Package Manager** | pnpm |

---

## 🚀 Quick Start

```bash
# 1. Clone & Install
git clone <repo-url>
cd superspace
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your Clerk & Convex keys

# 3. Start Convex backend
npx convex dev

# 4. Start Next.js (new terminal)
pnpm dev

# 5. Open http://localhost:3000
```

> 📖 **For detailed setup** including Clerk webhooks, JWT templates, and environment variables, see [QUICKSTART.md](docs/QUICKSTART.md)

---

## 📁 Project Structure

```
superspace/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Protected dashboard routes
│   │   └── [...slug]/          # Dynamic feature routing
│   └── (landing)/                # Public marketing pages
│
├── frontend/
│   ├── features/                 # 🎯 All feature modules
│   │   ├── crm/                  # CRM feature
│   │   │   ├── config.ts         # Feature config (SSOT)
│   │   │   ├── components/       # UI components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   ├── agents/           # AI agent integration
│   │   │   └── settings/         # Feature settings
│   │   ├── projects/
│   │   ├── helpdesk/
│   │   └── ... (19 features)
│   │
│   └── shared/                   # Shared frontend code
│       ├── components/           # Shared UI components
│       └── foundation/           # Core types & utilities
│
├── convex/                       # Backend (Convex)
│   ├── features/                 # Feature backends
│   │   └── {feature}/
│   │       ├── queries.ts        # Read operations
│   │       ├── mutations.ts      # Write operations (+ RBAC + Audit)
│   │       └── schema.ts         # Database schema
│   ├── shared/                   # Shared backend utilities
│   └── schema.ts                 # Composed database schema
│
├── docs/                         # 📚 Documentation
│   ├── QUICKSTART.md             # Getting started guide
│   ├── 00_BASE_KNOWLEDGE.md      # Essential concepts
│   ├── GLOSSARY.md               # Term definitions
│   ├── core/                     # Core system docs
│   ├── rules/                    # Development rules
│   └── features/                 # Feature-specific docs
│
└── scripts/                      # CLI tools
    └── features/                 # Feature management
        ├── create.ts             # pnpm run create:feature
        ├── edit.ts               # pnpm run edit:feature
        └── delete.ts             # pnpm run delete:feature
```

---

## 🧩 Feature Development

### Create a New Feature

```bash
# Interactive CLI
pnpm run create:feature my-feature

# With options
pnpm run create:feature my-feature --type core --category productivity --icon Layers
```

### Feature Structure (Required)

Every feature MUST have these folders:

```
frontend/features/{slug}/
├── config.ts           # SSOT - Single Source of Truth
├── agents/             # Required - AI agent registration
│   └── index.ts
├── settings/           # Required - Feature settings
│   └── index.ts
├── page.tsx            # Main page component
├── components/         # UI components
└── hooks/              # Custom hooks

convex/features/{convexSlug}/
├── queries.ts          # Read operations with RBAC
├── mutations.ts        # Write operations with RBAC + Audit
├── agents/             # Server-side AI handlers
└── schema.ts           # Database tables
```

Naming convention:
- `feature.id`: `kebab-case` (canonical id)
- Frontend folder: `frontend/features/{slug}` (`kebab-case`, usually same as `feature.id`)
- Convex folder: `convex/features/{convexSlug}` (`camelCase` from `feature.id`)

### Feature Config Example

```typescript
// frontend/features/my-feature/config.ts
import { defineFeature } from "@/frontend/shared/lib/features/defineFeature";

export default defineFeature({
  id: "my-feature",
  name: "My Feature",
  description: "What this feature does",
  ui: {
    path: "/dashboard/my-feature",
    icon: "Layers",
    component: "MyFeaturePage",
    category: "productivity",
    order: 100,
  },
});
```

---

## 🔐 Security Patterns

### RBAC (Role-Based Access Control)

```typescript
// Every query/mutation must check permissions
export const getItems = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    // Always check permission first
    await requirePermission(ctx, args.workspaceId, 'items.read');
    
    return ctx.db
      .query('items')
      .withIndex('by_workspace', q => q.eq('workspaceId', args.workspaceId))
      .collect();
  }
});
```

### Audit Logging

```typescript
// Every mutation must log an audit event
export const createItem = mutation({
  args: { workspaceId: v.id('workspaces'), name: v.string() },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, 'items.create');
    
    const id = await ctx.db.insert('items', { ... });
    
    // Required audit log
    await logAuditEvent(ctx, {
      action: 'items.create',
      resourceType: 'item',
      resourceId: id,
      workspaceId: args.workspaceId,
    });
    
    return id;
  }
});
```

---

## 📜 Scripts

```bash
# Development
pnpm dev                    # Start Next.js
npx convex dev              # Start Convex backend

# Feature Management
pnpm run create:feature     # Create new feature
pnpm run edit:feature       # Edit feature config
pnpm run delete:feature     # Delete feature
pnpm run analyze:feature    # Analyze feature structure

# Validation
pnpm run sync:all           # Sync features + generate registry
pnpm run validate:all       # Zod schema validation
pnpm run precommit          # Lint + validate + tests

# Testing
pnpm test                   # Run all tests
pnpm test:coverage          # With coverage report
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](docs/QUICKSTART.md) | Get running in 5 minutes |
| [00_BASE_KNOWLEDGE.md](docs/00_BASE_KNOWLEDGE.md) | Essential developer concepts |
| [GLOSSARY.md](docs/GLOSSARY.md) | Key terms & definitions |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Current status & roadmap |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Code style & conventions
- PR process & review
- Testing requirements
- Commit message format

---

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Next.js 15, Convex, Clerk, and modern web technologies.**
