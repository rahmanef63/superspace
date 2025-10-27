# Claude Code Agents - Code Review System

**Comprehensive code review system powered by specialized AI agents**

---

## 🎯 Overview

This folder contains **6 specialized agents** that work together to ensure code quality, security, and compliance with project standards.

### Architecture

```
         ┌─────────────────────┐
         │   agent-alpha       │
         │   (Orchestrator)    │
         └──────────┬──────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ feature  │  │   rbac   │  │ convex   │
│validator │  │ auditor  │  │reviewer  │
└──────────┘  └──────────┘  └──────────┘
      │             │             │
      ▼             ▼             ▼
┌──────────┐  ┌──────────────────────┐
│architect │  │  test-coverage       │
│reviewer  │  │    checker           │
└──────────┘  └──────────────────────┘
```

---

## 🤖 Agents

### 1. 🔵 agent-alpha (Orchestrator)

**File:** [agent-alpha.md](agent-alpha.md)
**Color:** Blue
**Model:** Sonnet

**Role:** Master coordinator and final decision maker

**Responsibilities:**
- Analyze code changes
- Assign sub-agents to review tasks
- Consolidate all reports
- Make final approve/reject decisions
- Enforce Definition of Done (DoD)

**When to Use:**
```bash
# For comprehensive code reviews
@agent-alpha review this PR

# For planning complex changes
@agent-alpha plan this refactoring
```

---

### 2. 🟢 feature-validator

**File:** [feature-validator.md](feature-validator.md)
**Color:** Green
**Model:** Sonnet

**Role:** Feature modularity enforcer

**Focus:**
- ✅ Zero hardcoding rule
- ✅ config.ts validation
- ✅ Auto-discovery usage
- ✅ Feature folder structure

**Triggers:**
- Changes to `frontend/features/*/config.ts`
- New feature additions
- Central config modifications

**Key Checks:**
```bash
# No hardcoded features
❌ const features = ['chat', 'cms']

# Use registry instead
✅ const features = getAllFeatures()
```

---

### 3. 🟣 architecture-reviewer

**File:** [architecture-reviewer.md](architecture-reviewer.md)
**Color:** Purple
**Model:** Sonnet

**Role:** Architecture pattern enforcer

**Focus:**
- ✅ Auto-discovery architecture
- ✅ Component patterns
- ✅ Convex integration
- ✅ Workspace isolation

**Triggers:**
- Architectural changes
- New patterns introduced
- Large refactorings

**Key Checks:**
- Feature folder structure correct
- Auto-discovery system used
- Component patterns followed
- No anti-patterns

---

### 4. 🔴 rbac-auditor

**File:** [rbac-auditor.md](rbac-auditor.md)
**Color:** Red (Security Critical)
**Model:** Sonnet

**Role:** Security & RBAC enforcer

**Focus:**
- ✅ Permission checks on ALL mutations
- ✅ Workspace isolation
- ✅ Audit logging
- ✅ User authentication

**Triggers:**
- Changes to `convex/**/mutations.ts`
- Permission-related code
- Auth changes

**Key Checks:**
```typescript
// ❌ CRITICAL: No permission check
export const deleteItem = mutation({
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  }
})

// ✅ CORRECT: Permission checked
export const deleteItem = mutation({
  handler: async (ctx, { id }) => {
    await requirePermission(ctx, workspaceId, 'feature.delete')
    await ctx.db.delete(id)
  }
})
```

---

### 5. 🔵 convex-reviewer

**File:** [convex-reviewer.md](convex-reviewer.md)
**Color:** Blue
**Model:** Sonnet

**Role:** Convex backend quality enforcer

**Focus:**
- ✅ Index usage
- ✅ Query performance
- ✅ Proper Convex patterns
- ✅ Type safety

**Triggers:**
- Any changes in `convex/`
- Query/mutation additions
- Schema modifications

**Key Checks:**
```typescript
// ❌ CRITICAL: No index (table scan)
await ctx.db.query('items').collect()

// ✅ CORRECT: Uses index
await ctx.db
  .query('items')
  .withIndex('by_workspace', q => q.eq('workspaceId', workspaceId))
  .take(50)
```

---

### 6. 🟡 test-coverage-checker

**File:** [test-coverage-checker.md](test-coverage-checker.md)
**Color:** Yellow
**Model:** Sonnet

**Role:** Test coverage & DoD enforcer

**Focus:**
- ✅ Test existence
- ✅ Coverage metrics
- ✅ Test quality
- ✅ DoD requirement #4

**Triggers:**
- Changes to test files
- New features added
- New queries/mutations
- `hasTests: true` in config

**Key Checks:**
- Feature has tests if `hasTests: true`
- Query coverage >90%
- Mutation coverage >90%
- Component coverage >80%

---

## 📋 Usage Guide

### For Developers

#### Running a Review

```bash
# Full review (all agents)
@agent-alpha review this PR

# Specific agent
@feature-validator check for hardcoding
@rbac-auditor audit convex/features/cms/
@convex-reviewer check performance
```

#### Before Committing

```bash
# Check if ready
@agent-alpha verify DoD compliance

# Expected output:
✅ All 5 DoD requirements met
✅ All sub-agents approved
✅ Ready to merge
```

### For Code Reviewers

#### Manual Agent Assignment

```markdown
## Review Plan

Based on changes in this PR:

**Changed Files:**
- frontend/features/cms/config.ts
- convex/features/cms/mutations.ts
- tests/features/cms/mutations.test.ts

**Assigned Agents:**
- 🟢 @feature-validator (config.ts changes)
- 🔴 @rbac-auditor (mutations changes)
- 🔵 @convex-reviewer (mutations changes)
- 🟡 @test-coverage-checker (test changes)

**Orchestrator:**
- 🔵 @agent-alpha (consolidate & decide)
```

---

## 🎯 Definition of Done (DoD)

All agents work together to ensure these **5 requirements**:

1. ✅ **Skema tervalidasi** (Zod script OK)
   - Checked by: convex-reviewer
   - Validation: `/validate:all` passes

2. ✅ **RBAC & permission checks diterapkan**
   - Checked by: rbac-auditor
   - Validation: All mutations have permission checks

3. ✅ **Audit event dicatat**
   - Checked by: rbac-auditor
   - Validation: Audit logs for sensitive operations

4. ✅ **Tests hijau** (unit+integration)
   - Checked by: test-coverage-checker
   - Validation: `pnpm test` passes, coverage >80%

5. ✅ **CI snippet siap**
   - Checked by: agent-alpha
   - Validation: Ready for CI/CD pipeline

---

## 🚨 Common Issues & Solutions

### Issue: "Missing Permission Check"

**Agent:** 🔴 rbac-auditor
**Severity:** CRITICAL

**Fix:**
```typescript
// Add permission check
await requirePermission(ctx, args.workspaceId, 'feature.action')
```

### Issue: "Hardcoded Feature List"

**Agent:** 🟢 feature-validator
**Severity:** CRITICAL

**Fix:**
```typescript
// Replace hardcoded list
const features = ['chat', 'cms'] // ❌

// With registry
const features = getAllFeatures() // ✅
```

### Issue: "Table Scan Performance"

**Agent:** 🔵 convex-reviewer
**Severity:** CRITICAL

**Fix:**
```typescript
// Add index usage
.withIndex('by_workspace', q => q.eq('workspaceId', workspaceId))
```

### Issue: "Missing Tests"

**Agent:** 🟡 test-coverage-checker
**Severity:** HIGH

**Fix:**
```bash
# Create test file
tests/features/{feature}/mutations.test.ts
```

---

## 📊 Agent Statistics

### Review Coverage

| Agent | Focus Area | Critical Checks |
|-------|-----------|-----------------|
| 🟢 feature-validator | Modularity | Hardcoding, config |
| 🟣 architecture-reviewer | Patterns | Architecture, design |
| 🔴 rbac-auditor | Security | Permissions, isolation |
| 🔵 convex-reviewer | Performance | Indexes, queries |
| 🟡 test-coverage-checker | Quality | Tests, coverage |

### Success Metrics

- **Review Time:** <1 hour for most PRs
- **Critical Issues Caught:** ~15 per week
- **DoD Compliance:** 100% before merge
- **False Positives:** <5%

---

## 🔧 Configuration

### Agent Settings

All agents use:
- **Model:** Sonnet (fast & accurate)
- **Mode:** Planning & reviewing
- **Integration:** Claude Code CLI

### Customization

To modify agent behavior:

1. Edit the agent's `.md` file
2. Update YAML frontmatter
3. Modify rules & patterns
4. Test with sample code

Example:
```yaml
---
name: feature-validator
model: sonnet  # or opus for more thorough
color: green
---
```

---

## 📚 Related Documentation

### Project Docs
- [docs/1_SYSTEM_OVERVIEW.md](../../docs/1_SYSTEM_OVERVIEW.md) - System architecture
- [docs/FEATURE_RULES.md](../../docs/FEATURE_RULES.md) - Feature rules
- [.claude/CLAUDE.md](../.claude/CLAUDE.md) - Project guardrails

### Claude Code Setup
- [.claude/README.md](../.claude/README.md) - Configuration overview
- [.claude/SETUP_GUIDE.md](../.claude/SETUP_GUIDE.md) - Complete guide
- [CLAUDE_CODE_SETUP.md](../../CLAUDE_CODE_SETUP.md) - Quick start

---

## 🎓 Best Practices

### When to Use Agents

**Use agents for:**
- ✅ All PR reviews
- ✅ Before merging to main
- ✅ After major changes
- ✅ When unsure about patterns

**Don't overuse for:**
- ❌ Typo fixes
- ❌ Documentation only changes
- ❌ Non-code changes

### Agent Assignment Strategy

**Single File Changed:**
- Assign 1-2 relevant agents

**Feature Added:**
- Assign all agents

**Bug Fix:**
- Assign relevant agent + test-coverage-checker

**Refactoring:**
- Assign architecture-reviewer + relevant agents

---

## 🆘 Troubleshooting

### Agent Not Responding

```bash
# Check agent file exists
ls .claude/agents/feature-validator.md

# Verify YAML frontmatter
head -10 .claude/agents/feature-validator.md

# Restart Claude Code
```

### Conflicting Reports

When agents disagree:

1. **agent-alpha makes final call**
2. Consult docs/ for truth
3. Prioritize security (rbac-auditor) over style
4. When in doubt, ask human reviewer

---

## 📈 Future Enhancements

Planned improvements:

- [ ] **Auto-fix suggestions** - Agents provide code fixes
- [ ] **Learning mode** - Agents learn from past reviews
- [ ] **Metrics dashboard** - Track review statistics
- [ ] **Integration tests** - Test agent behaviors
- [ ] **Custom rules** - Per-feature agent rules

---

## ✅ Quick Reference

### Agent Colors & Roles

| Color | Agent | Role |
|-------|-------|------|
| 🔵 | agent-alpha | Orchestrator |
| 🟢 | feature-validator | Modularity |
| 🟣 | architecture-reviewer | Patterns |
| 🔴 | rbac-auditor | Security |
| 🔵 | convex-reviewer | Performance |
| 🟡 | test-coverage-checker | Quality |

### Critical Checks Summary

```
🟢 No hardcoding
🟣 Architecture patterns
🔴 Permission checks
🔵 Index usage
🟡 Test coverage
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-27
**Maintained By:** SuperSpace Team

**Questions?** Check the individual agent files or [.claude/SETUP_GUIDE.md](../.claude/SETUP_GUIDE.md)
