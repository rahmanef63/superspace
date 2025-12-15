# Universal Database

> **Notion-like database system** - Flexible, type-safe, auto-discovery architecture

---

## 📌 Overview

The Universal Database is SuperSpace's core data system, providing a flexible, Notion-like experience where any feature can be a database.

**Status (December 2025):** ✅ Phase 0-4 Complete | Active: Property Menu & UI

---

## 📂 Documentation Files

| # | File | Purpose |
|---|------|---------|
| 1 | [01-SPEC.md](01-SPEC.md) | **Specification** - Complete v2.0 spec, 20+ property types, 7 views |
| 2 | [02-TASKS.md](02-TASKS.md) | **Task Breakdown** - ~250 tasks, phase status, what's next |
| 3 | [03-PROGRESS.md](03-PROGRESS.md) | **Current Progress** - START HERE 📍 - Daily status |
| 4 | [04-TESTING.md](04-TESTING.md) | **Testing Progress** - 721/721 tests passing |
| 5 | [05-MIGRATION.md](05-MIGRATION.md) | **Migration Guide** - V1 → V2 migration steps |
| 6 | [06-V1-V2-GUIDE.md](06-V1-V2-GUIDE.md) | **V1/V2 Boundaries** - Import rules during parallel dev |
| - | `property-menu/` | Property menu implementation docs |

---

## 🎯 Quick Start

### Check Current Status
→ **[03-PROGRESS.md](03-PROGRESS.md)** - What's active, what's next

### Understand the System
→ **[01-SPEC.md](01-SPEC.md)** - Architecture & property types

### Find Tasks to Work On
→ **[02-TASKS.md](02-TASKS.md)** - Detailed task breakdown

---

## 🔧 Key Features

### Property Types (20+)
```
Basic:     title, text, number, checkbox, url, email, phone
Select:    select, multi_select, status
Relation:  people, relation, rollup
Auto:      unique_id, created_time, created_by, last_edited_time, last_edited_by
Advanced:  date, files, formula, button
```

### View Types (7)
- **Table:** TanStack Table + inline editing
- **Board:** Kanban + drag-and-drop
- **Calendar:** Month/week/day views
- **Timeline:** Gantt chart
- **Gallery:** Card grid with images
- **List:** Simplified list
- **Form:** Single-record editing

### Test Coverage
- ✅ 721/721 tests passing
- ✅ 100% property type coverage
- ✅ All 7 views tested

---

## 📖 Reading Order

### For New Developers
1. [03-PROGRESS.md](03-PROGRESS.md) - Current status
2. [01-SPEC.md](01-SPEC.md) - System specification
3. [02-TASKS.md](02-TASKS.md) - Task breakdown

### For Implementation
1. [03-PROGRESS.md](03-PROGRESS.md) - What's next
2. [02-TASKS.md](02-TASKS.md) - Task details
3. [../../../rules/MUTATION_TEMPLATE_GUIDE.md](../../../rules/MUTATION_TEMPLATE_GUIDE.md) - Backend patterns

### For Migration
1. [05-MIGRATION.md](05-MIGRATION.md) - Migration guide
2. [06-V1-V2-GUIDE.md](06-V1-V2-GUIDE.md) - Import boundaries

---

## 🔗 Related

- [FEATURES_PLAN.md](../FEATURES_PLAN.md) - All features roadmap
- [rules/](../../rules/) - Development rules
- [frontend/features/database/](../../../frontend/features/database/) - Implementation code

---

**Last Updated:** 2025-12-15
**Status:** ✅ Phase 0-4 Complete | Active: Property Menu & UI
