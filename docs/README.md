# SuperSpace Documentation

**Essential AI Context Files - Optimized for Token Efficiency**

This folder contains minimal, high-quality documentation to provide AI with necessary context while minimizing token usage.

---

## 📚 Core Documentation (Numbered Files)

### System & Architecture
- **[1_SYSTEM_OVERVIEW.md](./1_SYSTEM_OVERVIEW.md)** - High-level architecture, modular system, tech stack, RBAC model
- **[2_DEVELOPER_GUIDE.md](./2_DEVELOPER_GUIDE.md)** - Complete implementation guide, RBAC patterns, testing guidelines
- **[3_MODULAR_ARCHITECTURE.md](./3_MODULAR_ARCHITECTURE.md)** - 3-tier architecture, nested features, decision trees
- **[4_TROUBLESHOOTING.md](./4_TROUBLESHOOTING.md)** - Common issues and solutions
- **[5_FEATURE_REFERENCE.md](./5_FEATURE_REFERENCE.md)** - Dynamic feature discovery, API patterns
- **[6_DESIGN_SYSTEM.md](./6_DESIGN_SYSTEM.md)** - UI/UX guidelines, component library, design tokens

### Progress Tracking
- **[99_CURRENT_PROGRESS.md](./99_CURRENT_PROGRESS.md)** - Universal Database implementation tracker
  - Current: Week 0 Complete (95/100 Agent Alpha Score) → Phase 1 Starting
  - 7 phases planned, ~250 tasks total

---

## 🗄️ Universal Database Implementation

### Core Specifications
- **[UNIVERSAL_DATABASE_SPEC.md](./UNIVERSAL_DATABASE_SPEC.md)** - Complete specification
  - 21 property types (text, number, select, date, person, etc.)
  - 10 view layouts (table, board, gallery, calendar, etc.)
  - Universal JSON schema v2.0
  - Notion-like flexibility

- **[UNIVERSAL_DATABASE_TODO.md](./UNIVERSAL_DATABASE_TODO.md)** - Master task breakdown
  - ~250 tasks across 7 phases
  - Week 0: ✅ Complete (Preparation & Compliance)
  - Phase 1-7: Foundation → Properties → Views → Integration → Export → Polish → Rollout

### Implementation Guides
- **[MUTATION_TEMPLATE_GUIDE.md](./MUTATION_TEMPLATE_GUIDE.md)** - **MANDATORY READING** (800+ lines)
  - The 6-Step Pattern (permission → validation → verification → auth → logic → audit)
  - 4 mutation templates (create, update, delete, batch)
  - RBAC + audit logging enforcement
  - Best practices, anti-patterns, testing requirements
  - Real-world examples

- **[V1_V2_BOUNDARIES.md](./V1_V2_BOUNDARIES.md)** - Prevents circular dependencies
  - Clear import rules during parallel V1/V2 development
  - Adapter layer pattern
  - TypeScript project references
  - Directory structure guidelines

---

## 📜 Rules & Guidelines

### Development Rules
- **[FEATURE_RULES.md](./FEATURE_RULES.md)** - **CRITICAL - MUST FOLLOW**
  - Golden Rule: Zero hardcoding outside feature folders
  - Single Source of Truth (config.ts)
  - 100% auto-discovery
  - Dynamic everything
  - Agent enforcement

### Convex Patterns
- **[convex_rules.mdc](./convex_rules.mdc)** - Convex-specific patterns (Cursor IDE)

---

## 🎯 Quick Start

### For New Features
1. Read: [2_DEVELOPER_GUIDE.md](./2_DEVELOPER_GUIDE.md)
2. Follow: [FEATURE_RULES.md](./FEATURE_RULES.md)
3. If writing mutations: [MUTATION_TEMPLATE_GUIDE.md](./MUTATION_TEMPLATE_GUIDE.md)

### For Universal Database Work
1. Status: [99_CURRENT_PROGRESS.md](./99_CURRENT_PROGRESS.md)
2. Spec: [UNIVERSAL_DATABASE_SPEC.md](./UNIVERSAL_DATABASE_SPEC.md)
3. Tasks: [UNIVERSAL_DATABASE_TODO.md](./UNIVERSAL_DATABASE_TODO.md)
4. Patterns: [MUTATION_TEMPLATE_GUIDE.md](./MUTATION_TEMPLATE_GUIDE.md)
5. Boundaries: [V1_V2_BOUNDARIES.md](./V1_V2_BOUNDARIES.md)

### For Architecture Understanding
1. Overview: [1_SYSTEM_OVERVIEW.md](./1_SYSTEM_OVERVIEW.md)
2. Patterns: [3_MODULAR_ARCHITECTURE.md](./3_MODULAR_ARCHITECTURE.md)
3. Design: [6_DESIGN_SYSTEM.md](./6_DESIGN_SYSTEM.md)

---

## 📊 Documentation Stats

| Category | Files | Description |
|----------|-------|-------------|
| **Core Docs** | 7 files | System, guides, reference (numbered 1-6, 99) |
| **Universal DB** | 4 files | Spec, tasks, guides, boundaries |
| **Rules** | 2 files | Feature rules, Convex patterns |
| **Total** | 13 files | Essential context only |

**Optimization:** Reduced from 20+ files to 13 essential files for AI context efficiency.

---

## 🔄 Recent Updates

### 2025-11-03
- ✅ Documentation cleanup for token efficiency
- ✅ Consolidated to 13 essential files
- ✅ Updated 2_DEVELOPER_GUIDE.md with mutation guide reference
- ✅ Updated 99_CURRENT_PROGRESS.md with Week 0 completion status
- ✅ Agent Alpha conditional approval (95/100)

---

## 💡 Documentation Philosophy

**Keep:**
- High-signal, essential information
- Rules that AI must follow
- Current specifications and progress
- Comprehensive guides for complex patterns

**Remove:**
- Redundant information
- Historical/completed migration docs
- Temporary status files
- Information that can be derived from code

**Result:** Maximum context value with minimum token usage.

---

**Current Status:** Week 0 Complete → Phase 1 Starting
**Next Milestone:** Foundation & Type System (Week 1-2)
**Last Updated:** 2025-11-03
