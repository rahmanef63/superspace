# Claude Code Setup Guide - SuperSpace Project

Panduan lengkap untuk setup Claude Code agar memiliki base knowledge tentang project SuperSpace.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Base Knowledge System](#base-knowledge-system)
4. [Custom Commands](#custom-commands)
5. [How It Works](#how-it-works)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

---

## Overview

Claude Code menggunakan **hierarchical knowledge system** melalui:

1. **CLAUDE.md** - Project guardrails, rules, dan documentation
2. **Custom Commands** (`.claude/commands/`) - Reusable workflows
3. **Settings** (`.claude/settings.json`) - Project configuration
4. **Generated Docs** (`docs/features/`) - Feature documentation

### How Claude Learns About Your Project

```
┌─────────────────────────────────────────┐
│  Startup: Load CLAUDE.md                │
│  ↓                                       │
│  Read project guardrails & rules        │
│  ↓                                       │
│  User runs command (e.g., /analyze)     │
│  ↓                                       │
│  Execute workflow in command template   │
│  ↓                                       │
│  Generate/Update documentation          │
│  ↓                                       │
│  Claude reads & learns from docs        │
└─────────────────────────────────────────┘
```

---

## Folder Structure

```
.claude/
├── CLAUDE.md              # Main project knowledge base (LOADED AT STARTUP)
├── SETUP_GUIDE.md         # This file
├── settings.json          # Project settings (shared via git)
├── settings.local.json    # Local overrides (gitignored)
└── commands/              # Custom slash commands
    ├── README.md
    ├── analyze-feature.md
    ├── feature-docs.md
    ├── list-features.md
    ├── analyze-all-features.md
    └── validate-project.md

docs/
└── features/              # Generated feature documentation
    ├── 2025-10-27-cms.md
    ├── 2025-10-27-chat.md
    └── {date}-{feature-id}.md

scripts/
└── features/
    ├── analyze-feature.ts # Main analyzer script
    ├── list.ts
    ├── create.ts
    └── README.md
```

---

## Base Knowledge System

### 1. CLAUDE.md (Primary Knowledge Source)

Located at: `.claude/CLAUDE.md`

**Contains:**
- ✅ Project guardrails (stack, principles, rules)
- ✅ Definition of Done (DoD)
- ✅ Feature analysis scripts documentation
- ✅ Feature registry system overview
- ✅ When to use specific tools

**Loaded:** Automatically at Claude Code startup

**How to Update:**
```bash
# Edit manually
code .claude/CLAUDE.md

# Or press # key in Claude Code to auto-update
# (Type instruction, Claude adds it to CLAUDE.md)
```

### 2. Custom Commands (Reusable Workflows)

Located at: `.claude/commands/*.md`

**Purpose:** Define repeatable workflows that Claude can execute

**Format:**
```markdown
---
description: Command description shown in autocomplete
---

Workflow instructions here.
Use $ARGUMENTS for command parameters.
```

**How Claude Uses Them:**
1. User types `/analyze-feature cms`
2. Claude reads `commands/analyze-feature.md`
3. Replaces `$ARGUMENTS` with "cms"
4. Executes the workflow steps

### 3. Generated Documentation

Located at: `docs/features/{date}-{feature-id}.md`

**Created by:** `pnpm run analyze:feature {name} --save`

**Contains:**
- Feature structure (components, hooks, stores)
- Convex operations (queries, mutations, actions)
- Permissions & RBAC
- Dependencies

**How Claude Uses Them:**
- Reference when modifying features
- Understand feature architecture
- Check CRUD operations before changes

---

## Custom Commands

### Quick Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `/analyze-feature` | Analyze & document a feature | `/analyze-feature cms` |
| `/feature-docs` | Show feature documentation | `/feature-docs chat` |
| `/list-features` | List all features | `/list-features --status stable` |
| `/analyze-all-features` | Document all features | `/analyze-all-features` |
| `/validate-project` | Run validations & tests | `/validate-project` |

### Detailed Usage

#### 1. Analyze Feature
```bash
# Interactive mode (select from list)
/analyze-feature

# Direct analysis
/analyze-feature cms

# What it does:
# 1. Runs: pnpm run analyze:feature cms --save
# 2. Reads generated: docs/features/2025-10-27-cms.md
# 3. Summarizes findings
# 4. Suggests improvements if needed
```

#### 2. Feature Docs
```bash
# List all docs
/feature-docs

# Read specific doc
/feature-docs cms

# What it does:
# 1. Lists: ls docs/features/
# 2. Shows available documentation
# 3. Reads requested doc if specified
```

#### 3. List Features
```bash
# All features
/list-features

# Filter by criteria
/list-features --type optional
/list-features --category communication

# What it does:
# 1. Runs: pnpm run list:features [options]
# 2. Summarizes by category/status
# 3. Shows production-ready vs development
```

#### 4. Validate Project
```bash
# Full validation
/validate-project

# Specific scope
/validate-project features
/validate-project test

# What it does:
# 1. Runs validation scripts
# 2. Checks against DoD checklist
# 3. Reports failures
# 4. Suggests fixes
```

---

## How It Works

### Scenario 1: First Time Setup

```bash
# 1. Clone project
git clone <repo>

# 2. Install dependencies
pnpm install

# 3. Start Claude Code
claude-code

# 4. Claude automatically loads .claude/CLAUDE.md
# Now Claude knows:
# - Project stack & rules
# - Available scripts
# - Feature system
# - Documentation locations
```

### Scenario 2: Analyzing a Feature

```bash
# In Claude Code:
> /analyze-feature cms

# Claude executes:
1. pnpm run analyze:feature cms --save
2. Reads: docs/features/2025-10-27-cms.md
3. Summarizes:
   - 8 components
   - 5 hooks
   - 8 queries, 11 mutations
   - 9 permissions
4. Provides insights

# Result:
# - Console output with analysis
# - Saved documentation in docs/features/
# - Claude now has deep knowledge of CMS feature
```

### Scenario 3: Before Modifying Feature

```bash
# Developer wants to add new query to chat feature

# 1. First, analyze the feature:
> /analyze-feature chat

# 2. Claude shows:
#    - Existing structure
#    - Current queries/mutations
#    - Related files
#    - Permissions needed

# 3. Developer makes changes with context
# 4. Claude can suggest where to add code
# 5. Validates against RBAC rules from CLAUDE.md
```

---

## Usage Examples

### Example 1: Onboarding New Developer

```bash
# New developer joins team

# Step 1: Read project overview
> Can you explain this project?
# Claude uses CLAUDE.md to explain stack, rules, DoD

# Step 2: List features
> /list-features
# Shows all features by category

# Step 3: Deep dive into specific feature
> /analyze-feature cms
# Detailed analysis of CMS feature

# Step 4: Read documentation
> /feature-docs cms
# Shows generated documentation

# Result: Developer has comprehensive understanding
```

### Example 2: Adding New Feature

```bash
# Creating "notifications" feature

# Step 1: Analyze similar feature for reference
> /analyze-feature chat
# Learn from existing feature structure

# Step 2: Create new feature
> pnpm run create:feature

# Step 3: Develop feature following patterns

# Step 4: Document it
> /analyze-feature notifications
# Generate documentation

# Step 5: Validate
> /validate-project features
# Ensure follows project rules
```

### Example 3: Refactoring

```bash
# Refactoring CMS feature

# Step 1: Get current state
> /analyze-feature cms
# Baseline: 8 queries, 11 mutations, etc.

# Step 2: Make changes

# Step 3: Re-analyze
> /analyze-feature cms
# New state: verify improvements

# Step 4: Update docs
# New documentation auto-generated with date

# Result: Before/after comparison in docs/features/
```

---

## Best Practices

### 1. Keep CLAUDE.md Updated

**DO:**
```bash
# Press # key in Claude Code to add instructions
# Or edit manually for major updates
code .claude/CLAUDE.md
```

**DON'T:**
- ❌ Let it become outdated
- ❌ Add too much detail (keep it concise)
- ❌ Duplicate information from docs

### 2. Use Commands for Common Tasks

**DO:**
```bash
# Create command for repeated workflows
.claude/commands/my-workflow.md
```

**DON'T:**
- ❌ Repeat same instructions manually
- ❌ Create commands for one-time tasks

### 3. Generate Documentation Regularly

**DO:**
```bash
# After significant changes
/analyze-feature {feature-name}

# Before major releases
/analyze-all-features
```

**DON'T:**
- ❌ Skip documentation
- ❌ Rely on outdated docs

### 4. Validate Before Commits

**DO:**
```bash
# Always validate before commit
/validate-project
```

**DON'T:**
- ❌ Skip validation
- ❌ Commit failing tests

### 5. Version Control

**DO:**
```bash
# Commit these to git:
.claude/CLAUDE.md
.claude/commands/
docs/features/

# Gitignore these:
.claude/settings.local.json
```

**DON'T:**
- ❌ Commit local settings
- ❌ Ignore generated docs

---

## Advanced Tips

### Tip 1: Quick Feature Context

Before making changes, run:
```bash
/analyze-feature {name}
```

Claude will have full context of:
- File structure
- Existing operations
- Dependencies
- Permissions

### Tip 2: Architecture Review

Periodically run:
```bash
/analyze-all-features
```

Then compare docs/features/ to find:
- Inconsistent patterns
- Missing tests
- Permission gaps
- Over-complex features

### Tip 3: Custom Workflows

Create command for your specific workflow:
```markdown
---
description: My custom deployment workflow
---

1. Run tests: pnpm test
2. Validate: pnpm run validate:all
3. Build: pnpm run build
4. Check bundle size
5. Generate changelog

Report any issues found.
```

### Tip 4: Team Knowledge Base

The `.claude/` folder becomes your team's:
- **Guardrails** (CLAUDE.md)
- **Workflows** (commands/)
- **Reference** (via docs/features/)

Everyone using Claude Code gets the same context!

---

## Troubleshooting

### Commands Not Showing

```bash
# 1. Check file exists
ls .claude/commands/

# 2. Check format (must have YAML frontmatter)
# 3. Restart Claude Code
```

### CLAUDE.md Not Loading

```bash
# 1. Check file location: .claude/CLAUDE.md
# 2. Check syntax (must be valid Markdown)
# 3. Restart Claude Code with: claude-code --reset
```

### Documentation Not Generated

```bash
# 1. Check script exists
ls scripts/features/analyze-feature.ts

# 2. Check permissions
# 3. Run manually: pnpm run analyze:feature cms --save
# 4. Check output: ls docs/features/
```

---

## Summary

✅ **CLAUDE.md** = Base knowledge (loaded at startup)
✅ **Commands** = Reusable workflows (executed on demand)
✅ **Generated Docs** = Feature reference (created by scripts)
✅ **Together** = Complete AI knowledge system

**Result:** Claude Code has deep, persistent knowledge of your SuperSpace project!

---

## Next Steps

1. ✅ Review [.claude/CLAUDE.md](.claude/CLAUDE.md)
2. ✅ Try commands: `/analyze-feature`, `/list-features`
3. ✅ Generate docs: `/analyze-all-features`
4. ✅ Read [commands/README.md](.claude/commands/README.md)
5. ✅ Customize for your workflow

---

**Last Updated:** 2025-10-27
**Maintained By:** SuperSpace Team
