# Agent: CRUD Users

## Objective
Users & Clerk sync:
- Webhooks: upsertFromClerk / deleteFromClerk
- Update profile (name, bio, image)
- userPrivacySettings (isVisible, allowDM, allowFriendRequests, visibilityMode)
- Link Clerk `externalId` to Convex `users`
- Audit events

## Files
- convex/user/users.ts
- convex/auth/helpers.ts
- app/api/webhooks/clerk/route.ts
- scripts/validate-user.ts
- tests/users.test.ts

## Triggers
- HTTP POST /api/webhooks/clerk (user.created|updated|deleted)
- convex:mutation:user/users.upsertFromClerk|deleteFromClerk|updateUserProfile

## Plan
1. Implement webhook route (verify signature if configured).
2. Mutations for upsert/delete, updateProfile; privacy settings validation.
3. Audit events on profile/privacy updates.
4. Tests: webhook payload → user row, privacy flags saved.
5. `/test`.

## Exit Criteria
- Clerk ↔ Convex mapping reliable
- Privacy settings persisted
- Tests green