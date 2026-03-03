# Contributing to SuperSpace

Thank you for your interest in contributing to SuperSpace! This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Feature Development](#feature-development)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/superspace.git
   cd superspace
   ```
3. **Set up the project** following [QUICKSTART.md](docs/QUICKSTART.md)
4. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

### Branch Naming

Use these prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/calendar-drag-drop` |
| `fix/` | Bug fixes | `fix/login-redirect` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code refactoring | `refactor/auth-hooks` |
| `test/` | Test additions | `test/crm-mutations` |
| `chore/` | Maintenance tasks | `chore/update-deps` |

### Daily Workflow

```bash
# 1. Sync with main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes and test
pnpm dev              # Start frontend
npx convex dev        # Start backend (in separate terminal)
pnpm test             # Run tests

# 4. Validate before committing
pnpm run precommit

# 5. Commit and push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

---

## Code Style

### TypeScript

- **Strict mode** is enabled - no `any` types
- Use **explicit return types** for exported functions
- Prefer **interfaces** over types for object shapes
- Use **Zod** for runtime validation

```typescript
// ✅ Good
export function getUser(id: string): User | null {
  // ...
}

// ❌ Bad
export function getUser(id: any) {
  // ...
}
```

### React Components

- Use **functional components** with hooks
- Keep components **small and focused**
- Co-locate related files (component + hook + types)

```typescript
// ✅ Good - Small, focused component
export function UserAvatar({ user }: { user: User }) {
  return <Avatar src={user.avatarUrl} alt={user.name} />;
}

// ❌ Bad - Too many responsibilities
export function UserSection({ userId }: { userId: string }) {
  // Fetching, formatting, displaying, editing all in one...
}
```

### File Organization

```
frontend/features/{feature}/
├── components/         # UI components
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/              # Custom hooks
│   └── useFeature.ts
├── types/              # TypeScript types
│   └── index.ts
└── utils/              # Helper functions
    └── formatters.ts
```

### Imports

Order imports in this sequence:
1. React/Next.js
2. External libraries
3. Internal shared (`@/frontend/shared/`, `@/convex/shared/`)
4. Feature-local
5. Types (with `type` keyword)

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery } from 'convex/react';
import { z } from 'zod';

// 3. Internal shared
import { Button } from '@/components/ui/button';
import { requirePermission } from '@/convex/shared/permissions';

// 4. Feature-local
import { FeatureCard } from './components/FeatureCard';
import { useFeature } from './hooks/useFeature';

// 5. Types
import type { Feature } from './types';
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or fixing tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
feat(crm): add contact import from CSV

# Bug fix
fix(auth): resolve redirect loop on sign-out

# Documentation
docs(readme): update quick start instructions

# Refactor
refactor(calendar): extract event utils to shared

# With body
feat(tasks): add recurring task support

Implements weekly, monthly, and yearly recurrence patterns.
Uses cron expressions internally for flexibility.

Closes #123
```

---

## Pull Request Process

### Before Opening a PR

1. ✅ Run `pnpm run precommit` (must pass)
2. ✅ Write/update tests for your changes
3. ✅ Update documentation if needed
4. ✅ Rebase on latest main

### PR Title Format

Same as commit messages:
```
feat(crm): add bulk contact import
```

### PR Description Template

```markdown
## What does this PR do?
Brief description of the changes.

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to test
1. Step one
2. Step two
3. Expected result

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console.log or debug code
```

### Review Process

1. At least **1 approval** required
2. All **CI checks must pass**
3. **Resolve all comments** before merging
4. Squash and merge preferred

---

## Testing Requirements

### What to Test

| Type | Location | Required For |
|------|----------|--------------|
| Unit tests | `tests/` | All utilities, helpers |
| Integration tests | `tests/` | Convex queries/mutations |
| Component tests | `tests/components/` | Complex UI components |

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Specific file
pnpm test path/to/file.test.ts
```

### Test Pattern

```typescript
import { describe, it, expect } from 'vitest';

describe('FeatureName', () => {
  describe('functionName', () => {
    it('should do expected behavior', () => {
      const result = functionName(input);
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      expect(() => functionName(badInput)).toThrow();
    });
  });
});
```

### Coverage Requirements

- **New features:** ≥ 80% coverage
- **Bug fixes:** Test must cover the fixed case
- **Critical paths:** 100% coverage (auth, permissions, payments)

---

## Feature Development

### Creating a New Feature

```bash
# Use the CLI tool
pnpm run create:feature my-feature
```

### Required Structure

Every feature MUST have:

```
frontend/features/{slug}/
├── config.ts           # SSOT - Single Source of Truth
├── agents/             # Required - AI agent registration
│   └── index.ts
├── settings/           # Required - Feature settings
│   └── index.ts
├── page.tsx            # Main page component
└── ...

convex/features/{slug}/
├── queries.ts          # With RBAC checks
├── mutations.ts        # With RBAC + Audit logging
└── schema.ts           # Database tables
```

### Critical Rules

1. **Zero Hardcoding** - No feature lists outside feature folders
2. **RBAC Required** - Every query/mutation must check permissions
3. **Audit Required** - Every mutation must log an audit event
4. **Auto-Discovery** - Use registry APIs, not manual registration

See [01-FEATURE-RULES.md](docs/rules/01-FEATURE-RULES.md) for complete rules.

---

## Questions?

- Check the [documentation](docs/)
- Look at existing features for examples
- Open a discussion on GitHub

---

**Thank you for contributing to SuperSpace! 🚀**
