# Pareto Priority: Foundation Hardening (80/20)

**Date:** December 12, 2025  
**Status:** Complete

## Why This First (Pareto)

The fastest way to raise overall project quality is to harden the shared foundation:

- Shared UI primitives and global initialization touch almost every feature.
- Small bugs here create large, cross‑app reliability and UX problems.
- Fixing them is low effort but improves multiple scores at once (code quality, UX, performance stability, dev trust).

This is the 20% of work that removes 80% of near‑term risk.

## Issues (Resolved)

1. **ImageCrop correctness bug**
   - `getCroppedPngImage` used to recurse using `scaleFactor`, but the factor was never applied.
   - Result: output size never shrinks and recursion can loop indefinitely on large images.
   - Location: `components/ui/shadcn-io/image-crop/index.tsx`

2. **Feature settings init runs multiple times**
   - `frontend/features/initFeatureSettings.ts` used to be imported in multiple layouts.
   - In App Router, each layout boundary can re‑execute, causing duplicate registrations or dev‑only side effects.
   - Locations: `app/layout.tsx`, `app/dashboard/layout.tsx`, `app/(landing)/layout.tsx`

3. **Minor foundation lint/type debt**
   - `as any` casts in shared primitives.
   - Unused matcher in `middleware.ts` (`isPublicAuthRoute`).

## Goal

Make the shared foundation safe and predictable so feature work can proceed without hidden bugs.

## Completed Work (What Shipped)

### A) ImageCrop correctness + safety

- Fixed `getCroppedPngImage` to actually reduce output size by scaling canvas output with a bounded iteration loop.
- Added termination conditions (invalid crop checks + max iterations + last-resort final attempt).
- Added unit tests to prevent regressions: `tests/components/image-crop.test.ts`.

### B) Feature settings init runs once

- Ensured init executes once via a single client boundary mounted in `app/layout.tsx`:
  - `frontend/features/InitFeatureSettingsClient.tsx`
  - `frontend/features/initFeatureSettings.ts`

### C) Cleanup small foundation debt

- Simplified `middleware.ts` and removed the unused route matcher noted in this plan.

## Verification

- `pnpm build` (see `build-baseline.log`, `build-after-import-splitting.log`)
- `pnpm vitest run`
- `pnpm lint` (warnings only)

## Original Plan (For Reference)

### A) Fix and harden ImageCrop

- Implement real size reduction:
  - Apply `scaleFactor` to canvas dimensions and/or
  - Switch to `toBlob("image/jpeg" | "image/webp", quality)` with bounded quality loop.
- Add a hard recursion/iteration cap.
- Remove `as any` where possible; tighten prop types.
- Add a unit test for:
  - Returning an image under `maxImageSize`
  - Not hanging on large input

### B) Ensure feature init runs once

- Import `initFeatureSettings` only in `app/layout.tsx`.
- Remove duplicate imports from nested layouts.
- Verify no feature‑registry side effects depend on per‑layout execution.

### C) Cleanup small foundation debt

- Remove unused `isPublicAuthRoute` or use it explicitly.
- Run `pnpm lint` and `pnpm test` after changes.

## Acceptance Criteria

- Cropping always finishes and returns `<= maxImageSize`.
- No duplicate init logs or duplicated registry entries in dev.
- All tests pass; no new `any` casts added.

## Estimated Effort

- ImageCrop fix + tests: 2–3 hours.
- Init dedupe + verify: 30–60 minutes.
- Cleanup + verification: 30 minutes.

## Follow‑ups (Next Pareto Layer)

After foundation hardening lands, the next 80/20 targets are:

1. Golden‑path UX polish for 2–3 core workflows (tasks + database + docs).
2. Bundle splitting/lazy loading for heavy feature libraries.
3. CI enforcement of RBAC/audit rules.
