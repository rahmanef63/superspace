# Global CI Guardrails for RBAC & Audit (Pareto Layer 2)

**Date:** December 12, 2025  
**Status:** ✅ Complete

## Why This Matters

SuperSpace relies on strict backend guardrails:

- Every Convex mutation must enforce permissions (DoD #2).
- Every mutation must log audit events (DoD #3).

These are easy to forget during rapid feature work. CI should be the safety net.

## What Exists Today

- Local validators:
  - `scripts/validate-permissions.ts` (`pnpm run validate:permissions`)
  - `scripts/validate-audit-logs.ts` (`pnpm run validate:audit`)
- CI coverage:
  - `.github/workflows/database-dod-check.yml` runs both validators on PRs touching `convex/**` (plus related paths).
  - `.github/workflows/feature-validation.yml` also runs both validators on feature-scoped changes.

## Remaining Gaps

1. **Legacy violations exist (baseline is a guardrail, not a fix)**
   - Current violations are tracked in `scripts/baselines/*`; CI fails only on new violations.
2. **Validator accuracy (regex scanning)**
   - Allowlist comment system exists for edge cases and is surfaced in CI output/summary.

## Goal

Make RBAC + audit validation **unavoidable** for any Convex mutation change.

## Progress (Dec 12, 2025)

- Expanded `.github/workflows/database-dod-check.yml` to trigger on `convex/**` changes (so non-database Convex mutations are gated).
- Added `pnpm run validate:permissions` and `pnpm run validate:audit` to `.github/workflows/feature-validation.yml` for feature-scoped PR coverage.
- Added baseline support so CI fails only on *new* violations:
  - `scripts/baselines/permissions-violations.txt`
  - `scripts/baselines/audit-violations.txt`
  - Regenerate baselines with `pnpm run validate:permissions -- --write-baseline` and `pnpm run validate:audit -- --write-baseline`.
- Added allowlist comment system (requires reason) to reduce false positives / special cases:
  - `// @dod:skip-permissions reason=...`
  - `// @dod:skip-audit reason=...`
  - Skips are emitted as CI notices and included in the CI step summary.
- Improved actionable CI output by emitting GitHub Actions annotations (file + line) for new violations.

## Plan of Work

### Step 1: Expand CI Trigger Scope

Option A (recommended): update existing workflow to include all Convex mutations.

- Update `.github/workflows/database-dod-check.yml` paths to include:
  - `convex/**`
  - `scripts/validate-*.ts`

Option B: add a new workflow `convex-dod-check.yml` triggered on any Convex change.

### Step 2: Add Validators to Feature CI

In `.github/workflows/feature-validation.yml`, add:

- `pnpm run validate:permissions`
- `pnpm run validate:audit`

This ensures even feature‑only PRs are covered.

### Step 3: Improve Validator Accuracy (if needed)

The scripts currently regex‑scan mutations. To reduce false positives:

- Add allowlist comment for special cases:
  - `// @dod:skip-permissions reason=...`
  - `// @dod:skip-audit reason=...`
- Log skips in CI summary.

### Step 4: Make Failures Actionable

- Ensure CI prints:
  - file path
  - mutation name
  - expected fix (link to `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md`)

### Step 5: Add “Security DoD” Badge

- Optional README badge showing latest DoD status.

## Acceptance Criteria

- Any PR touching `convex/**` must pass:
  - `validate:permissions`
  - `validate:audit`
  - relevant tests
- CI failure messages are clear enough to fix in one pass.

## Estimated Effort

- Workflow updates: 30–60 minutes.
- Optional validator skip system: 1–2 hours.
