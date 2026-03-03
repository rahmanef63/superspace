# 📖 Glossary

> **Key terms and definitions for SuperSpace development**

---

## A

### Agent
An AI-powered assistant that can understand user queries and perform actions within a feature. Each feature registers its own agent with tools that the AI can use.

### Audit Log / Audit Trail
Immutable record of all changes made in the system. Every mutation must log an audit event for compliance, debugging, and security purposes.

```typescript
await logAuditEvent(ctx, {
  action: "resource.created",
  resourceType: "document",
  resourceId: id,
  workspaceId,
})
```

### Auto-Discovery
The pattern where features are automatically detected and registered based on their `config.ts` files. No manual registration required.

---

## B

### Bundle
A collection of features that are typically enabled together for a specific workspace type. Examples: `startup`, `business-pro`, `sales-crm`.

---

## C

### Convex
The real-time serverless database and backend platform used by SuperSpace. Provides reactive queries, mutations, and type-safe APIs.

### config.ts
The Single Source of Truth (SSOT) file for every feature. Contains all metadata: name, icon, permissions, status, etc.

### Clerk
Authentication and user management provider. Handles sign-in, sign-up, user profiles, and billing.

---

## D

### Dynamic Menu
A navigation menu that changes based on the current workspace type and enabled features.

---

## F

### Feature
A self-contained module with its own UI, backend logic, database tables, and tests. Features are the building blocks of SuperSpace.

### Feature Slice
Alternative term for a feature module. Emphasizes the vertical slice architecture where each feature owns all its layers.

### Feature Type
Classification of features:
- **core**: Always enabled, essential functionality
- **optional**: Can be enabled/disabled per workspace
- **addon**: Requires additional setup or license

---

## G

### Global Shared
Code that's shared across ALL features. Located in `frontend/shared/` and `convex/shared/`.

---

## H

### Handler
The main function in a Convex query or mutation that executes the business logic.

---

## I

### Index (Database)
A database optimization that speeds up queries on specific fields. Required for multi-tenant data isolation.

```typescript
.index("by_workspace", ["workspaceId"])
```

---

## K

### kebab-case
Naming convention using lowercase with hyphens: `my-feature-name`. Used for frontend feature folders.

---

## M

### Multi-Tenancy
Architecture where multiple organizations (workspaces) share the same application but have isolated data.

### Mutation
A Convex function that modifies data (create, update, delete). Must include RBAC check and audit log.

---

## O

### Owner
The highest permission level (0). Has full control over a workspace, including billing and deletion.

---

## P

### Permission
A string that defines what actions a user can perform. Format: `{feature}.{action}` or `{feature}.{resource}.{action}`.

Examples:
- `crm.view`
- `crm.contacts.create`
- `settings.billing.manage`

---

## Q

### Query
A Convex function that reads data. Queries are reactive - they automatically re-run when data changes.

---

## R

### RBAC (Role-Based Access Control)
Security model where permissions are assigned based on user roles.

Permission Hierarchy:
| Level | Role | Description |
|-------|------|-------------|
| 0 | Owner | Full control |
| 10 | Admin | Manage workspace |
| 30 | Manager | Manage content |
| 50 | Staff | Create content |
| 70 | Client | Limited access |
| 90 | Guest | Read-only |

### Registry
The central list of all discovered features. Generated automatically from `config.ts` files.

### Real-time
Convex's reactive data model where UI automatically updates when underlying data changes.

---

## S

### Schema
The database table definitions in Convex. Located in `convex/schema.ts` and feature-specific `schema.ts` files.

### shadcn/ui
The component library used for UI. Provides accessible, customizable components built on Radix UI.

### SSOT (Single Source of Truth)
The principle that each piece of information should have one authoritative source. In SuperSpace, `config.ts` is the SSOT for features.

### Sub-Feature
A feature nested within another feature. Located in `features/{parent}/features/{child}/`.

---

## T

### Three-Tier Sharing Model
Code sharing hierarchy:
1. **Global**: `frontend/shared/`, `convex/shared/` - Used everywhere
2. **Feature-Shared**: `features/{slug}/shared/` - Used within one feature
3. **Local**: Direct in component - Used in one place

### Tool (AI)
An action that an AI agent can perform. Has a name, description, parameters, and handler.

---

## U

### Universal Database
SuperSpace's Notion-like flexible database system. Supports 20+ property types and 7 view layouts.

---

## V

### Validator
Convex's type validation system using `v.` functions. Ensures type safety at runtime.

```typescript
args: {
  workspaceId: v.id("workspaces"),
  name: v.string(),
  count: v.optional(v.number()),
}
```

### View
A way to display data in the Universal Database. Types: Table, Board, Calendar, Timeline, Gallery, List, Form.

---

## W

### Workspace
An isolated organization/team environment. All data belongs to a workspace for multi-tenancy.

### workspaceId
The unique identifier for a workspace. Required on most data operations for proper isolation.

---

## Z

### Zero Hardcoding
The principle that feature lists should never be manually maintained. Features are auto-discovered.

### Zod
TypeScript-first schema validation library. Used for runtime validation and type inference.

```typescript
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

type User = z.infer<typeof UserSchema>
```

### Zustand
Lightweight state management library used for client-side state.

---

## Common Abbreviations

| Abbr | Meaning |
|------|---------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DX | Developer Experience |
| RBAC | Role-Based Access Control |
| RSC | React Server Components |
| SSOT | Single Source of Truth |
| UI | User Interface |
| UX | User Experience |

---

**Can't find a term?** Open an issue or check the [base knowledge](00_BASE_KNOWLEDGE.md).
