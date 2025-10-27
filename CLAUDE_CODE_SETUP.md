# 🤖 Claude Code Setup - SuperSpace Project

> **Complete Guide**: How to setup Claude Code with institutional knowledge of this project

## 📋 Table of Contents

- [What Was Created](#what-was-created)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Available Commands](#available-commands)
- [Usage Examples](#usage-examples)
- [Next Steps](#next-steps)

---

## What Was Created

### 1. ✅ Base Knowledge System

**File:** [.claude/CLAUDE.md](.claude/CLAUDE.md)

Berisi project guardrails, rules, dan documentation yang **auto-loaded saat Claude Code startup**.

**Content:**
- Project stack & architecture
- Development principles (RBAC, audit logging, validation)
- Definition of Done (DoD)
- Feature analysis scripts documentation
- Feature registry system overview
- When to use specific tools

### 2. ✅ Custom Commands (Slash Commands)

**Location:** [.claude/commands/](.claude/commands/)

| Command | File | Purpose |
|---------|------|---------|
| `/analyze-feature` | [analyze-feature.md](.claude/commands/analyze-feature.md) | Analyze & document a feature |
| `/feature-docs` | [feature-docs.md](.claude/commands/feature-docs.md) | Show feature documentation |
| `/list-features` | [list-features.md](.claude/commands/list-features.md) | List all registered features |
| `/analyze-all-features` | [analyze-all-features.md](.claude/commands/analyze-all-features.md) | Document all features |
| `/validate-project` | [validate-project.md](.claude/commands/validate-project.md) | Run validations & tests |

### 3. ✅ Feature Analyzer Script

**File:** [scripts/features/analyze-feature.ts](scripts/features/analyze-feature.ts)

Powerful script untuk analyze & document features:
- Detect file structure (frontend + convex)
- Extract components, hooks, stores, types
- Find Convex queries, mutations, actions
- List permissions & RBAC
- Show dependencies

**Usage:**
```bash
# Direct
pnpm run analyze:feature <feature-name> --save

# Interactive (keyboard selection)
pnpm run analyze:feature --list
```

**Output:** `docs/features/{YYYY-MM-DD}-{feature-id}.md`

### 4. ✅ Generated Documentation

**Location:** [docs/features/](docs/features/)

Auto-generated documentation untuk each feature:
- [2025-10-27-cms.md](docs/features/2025-10-27-cms.md)
- [2025-10-27-chat.md](docs/features/2025-10-27-chat.md)

### 5. ✅ Comprehensive Guides

- [.claude/README.md](.claude/README.md) - Overview of .claude folder
- [.claude/SETUP_GUIDE.md](.claude/SETUP_GUIDE.md) - Deep dive guide
- [.claude/commands/README.md](.claude/commands/README.md) - Command reference
- [scripts/features/README.md](scripts/features/README.md) - Script documentation

---

## Quick Start

### 1. Verify Setup

```bash
# Check .claude folder
ls -la .claude/

# Should see:
# - CLAUDE.md (base knowledge)
# - commands/ (custom commands)
# - SETUP_GUIDE.md (detailed guide)
```

### 2. Try a Command

Di Claude Code CLI:

```bash
# List all features
/list-features

# Analyze a feature (interactive)
/analyze-feature

# Analyze specific feature
/analyze-feature cms
```

### 3. Generate Documentation

```bash
# Single feature
/analyze-feature chat

# All features
/analyze-all-features
```

---

## How It Works

### Architecture

```
┌────────────────────────────────────────────────┐
│  CLAUDE CODE STARTS                            │
├────────────────────────────────────────────────┤
│  1. Auto-loads: .claude/CLAUDE.md              │
│     ✓ Project rules & stack                    │
│     ✓ Feature system docs                      │
│     ✓ Available tools & scripts                │
├────────────────────────────────────────────────┤
│  2. User types: /analyze-feature cms           │
├────────────────────────────────────────────────┤
│  3. Claude reads: .claude/commands/            │
│     analyze-feature.md                         │
├────────────────────────────────────────────────┤
│  4. Executes workflow:                         │
│     pnpm run analyze:feature cms --save        │
├────────────────────────────────────────────────┤
│  5. Script generates:                          │
│     docs/features/2025-10-27-cms.md            │
├────────────────────────────────────────────────┤
│  6. Claude reads generated doc                 │
│     ✓ Now has deep knowledge of CMS feature   │
└────────────────────────────────────────────────┘
```

### Knowledge Hierarchy

```
Level 1: CLAUDE.md (Startup)
├── Project guardrails
├── Development rules
└── Tool documentation

Level 2: Custom Commands (On-demand)
├── /analyze-feature
├── /list-features
└── /validate-project

Level 3: Generated Docs (Reference)
├── docs/features/2025-10-27-cms.md
├── docs/features/2025-10-27-chat.md
└── ... (one per feature)
```

---

## Available Commands

### 📊 Feature Analysis

#### `/analyze-feature [name]`

**Purpose:** Analyze & document a feature

**Examples:**
```bash
/analyze-feature chat
/analyze-feature cms --save
/analyze-feature          # Interactive mode
```

**Output:**
- Console: Detailed analysis
- File: `docs/features/{date}-{feature-id}.md`

**What You Get:**
- 📋 Basic info (ID, name, category, status, version)
- ⚡ Capabilities (UI, Convex, Tests, Settings, Permissions)
- 🎨 Frontend (components, hooks, stores, types)
- 🔧 Convex (queries, mutations, actions)
- 📦 Dependencies
- 📤 Exports

---

#### `/feature-docs [name]`

**Purpose:** View feature documentation

**Examples:**
```bash
/feature-docs           # List all
/feature-docs cms       # Show CMS doc
```

---

#### `/list-features [options]`

**Purpose:** List all registered features

**Examples:**
```bash
/list-features
/list-features --type optional
/list-features --category communication
/list-features --status stable
```

---

#### `/analyze-all-features`

**Purpose:** Generate docs for ALL features

**Warning:** May take several minutes

**Output:** Complete documentation set in `docs/features/`

---

### ✅ Validation

#### `/validate-project [scope]`

**Purpose:** Run validations & tests

**Examples:**
```bash
/validate-project              # Full validation
/validate-project features     # Features only
/validate-project test         # Tests only
```

**Checks:**
- ✅ Skema tervalidasi (Zod)
- ✅ RBAC & permissions
- ✅ Audit events
- ✅ Tests passing
- ✅ CI ready

---

## Usage Examples

### Example 1: Before Modifying a Feature

**Scenario:** Need to add a new mutation to CMS feature

```bash
# Step 1: Understand current structure
> /analyze-feature cms

Claude shows:
✓ 8 components
✓ 5 hooks
✓ 8 queries, 11 mutations (current state)
✓ File locations
✓ Permissions required

# Step 2: Ask Claude to add mutation
> "Add a new mutation to duplicate an entry"

# Claude can now:
✓ Know where to add the code
✓ Follow existing patterns
✓ Apply correct permissions
✓ Match coding style
```

---

### Example 2: Onboarding New Developer

**Scenario:** New team member needs project overview

```bash
# Step 1: Project overview
> "Explain this project's architecture"
Claude uses CLAUDE.md to explain stack, rules, principles

# Step 2: See all features
> /list-features
Shows 29 features by category

# Step 3: Deep dive
> /analyze-feature chat
Detailed analysis of Chat feature

# Step 4: Read documentation
> /feature-docs chat
Shows generated markdown documentation

# Result: Comprehensive understanding in minutes!
```

---

### Example 3: Architecture Review

**Scenario:** Review all features for consistency

```bash
# Generate all docs
> /analyze-all-features

# Wait for completion (several minutes)

# Then analyze patterns:
> "Compare all features in docs/features/ and find:
   - Inconsistent patterns
   - Missing tests
   - Features without permissions
   - Over-complex features"

# Claude analyzes all generated docs and provides insights
```

---

### Example 4: Pre-commit Validation

**Scenario:** Before committing changes

```bash
# Validate everything
> /validate-project

Claude runs:
✓ pnpm run validate:features
✓ pnpm run validate:all
✓ pnpm test

Reports:
✓ All validations passed
✓ Tests: 45/45 passing
✓ Ready to commit

# Or if issues found:
✗ 3 tests failing
✗ Validation errors in workspace schema
→ Suggests fixes
```

---

## Next Steps

### 1. ✅ Explore the Setup

```bash
# Read the comprehensive guide
cat .claude/SETUP_GUIDE.md

# Check available commands
cat .claude/commands/README.md

# See feature scripts
cat scripts/features/README.md
```

### 2. ✅ Generate Documentation

```bash
# Start with one feature
/analyze-feature cms

# Then analyze all
/analyze-all-features
```

### 3. ✅ Try the Workflow

```bash
# List features
/list-features

# Pick one to analyze
/analyze-feature chat

# Read the generated doc
/feature-docs chat

# Make changes with context!
```

### 4. ✅ Customize for Your Needs

```bash
# Add custom command
code .claude/commands/my-workflow.md

# Update CLAUDE.md with new rules
code .claude/CLAUDE.md

# Create feature-specific commands
code .claude/commands/cms-workflow.md
```

---

## Benefits

### Before This Setup ❌

```
Developer: "What's in the CMS feature?"
Claude: "Let me search the codebase..."
   (Reads multiple files)
   (May miss important context)
   (Needs to re-search next time)
```

### After This Setup ✅

```
Developer: "/analyze-feature cms"
Claude: "CMS feature analysis:
   ✓ 8 components, 5 hooks, 2 stores
   ✓ 8 queries, 11 mutations
   ✓ 9 permissions defined
   ✓ Full file structure mapped
   ✓ Documentation saved"
```

### Impact 🎯

| Before | After |
|--------|-------|
| ❌ Search codebase every time | ✅ Instant knowledge from CLAUDE.md |
| ❌ No persistence between sessions | ✅ Permanent project knowledge |
| ❌ Repeat explanations | ✅ One-time documentation |
| ❌ Risk of inconsistent patterns | ✅ Enforced via guardrails |
| ❌ Manual validation | ✅ `/validate-project` command |

---

## Troubleshooting

### Commands Not Appearing

```bash
# 1. Check files exist
ls .claude/commands/

# 2. Verify format (must have YAML frontmatter)
head .claude/commands/analyze-feature.md

# 3. Restart Claude Code
```

### CLAUDE.md Not Loading

```bash
# 1. Verify location
cat .claude/CLAUDE.md

# 2. Check syntax (valid markdown)

# 3. Restart with reset
claude-code --reset
```

### Script Not Working

```bash
# 1. Verify installation
pnpm run analyze:feature --help

# 2. Check dependencies
pnpm install

# 3. Run manually
pnpm run analyze:feature cms --save
```

---

## File Structure Summary

```
project-root/
├── .claude/                          # Claude Code configuration
│   ├── README.md                     # Overview
│   ├── CLAUDE.md                     # ⭐ Main knowledge base
│   ├── SETUP_GUIDE.md                # Detailed guide
│   ├── settings.json                 # Project settings
│   ├── settings.local.json           # Local (gitignored)
│   └── commands/                     # Custom commands
│       ├── README.md
│       ├── analyze-feature.md
│       ├── feature-docs.md
│       ├── list-features.md
│       ├── analyze-all-features.md
│       └── validate-project.md
│
├── docs/
│   └── features/                     # Generated documentation
│       ├── 2025-10-27-cms.md
│       ├── 2025-10-27-chat.md
│       └── ...
│
├── scripts/
│   └── features/
│       ├── analyze-feature.ts        # ⭐ Main analyzer script
│       ├── list.ts
│       └── README.md
│
├── frontend/
│   └── features/                     # Feature source code
│       ├── cms/
│       ├── chat/
│       └── .../
│
└── convex/
    └── features/                     # Convex backend
        ├── cms/
        ├── chat/
        └── .../
```

---

## Summary

### What You Have Now:

✅ **CLAUDE.md** - Project knowledge loaded at startup
✅ **Custom Commands** - Quick workflows via `/` commands
✅ **Analyzer Script** - Comprehensive feature analysis tool
✅ **Generated Docs** - Reference documentation per feature
✅ **Complete Guides** - How to use everything

### What This Means:

🎯 Claude Code has **institutional knowledge** of SuperSpace
🎯 **Persistent context** across all coding sessions
🎯 **Enforced best practices** via guardrails
🎯 **Quick access** to project information
🎯 **Team alignment** through shared knowledge base

### Ready to Code?

```bash
# In Claude Code:
/analyze-feature cms
/list-features
/validate-project
```

---

## 📚 Further Reading

- [.claude/SETUP_GUIDE.md](.claude/SETUP_GUIDE.md) - Deep dive into how it works
- [.claude/README.md](.claude/README.md) - .claude folder overview
- [.claude/commands/README.md](.claude/commands/README.md) - Command reference
- [scripts/features/README.md](scripts/features/README.md) - Script documentation
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code) - Official documentation

---

**Version:** 1.0.0
**Created:** 2025-10-27
**Maintained By:** SuperSpace Team

**Questions?** Check [.claude/SETUP_GUIDE.md](.claude/SETUP_GUIDE.md) for detailed answers.
