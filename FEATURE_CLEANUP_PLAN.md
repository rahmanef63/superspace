# Feature Cleanup Plan

> **Generated:** 2025-12-10
> **Updated:** 2025-12-10 (Migration Complete)
> **Source of Truth:** `lib/features/registry.ts`

---

## ✅ CLEANUP STATUS: COMPLETE

All external imports from `archives-features` have been migrated. The folder can now be safely deleted.

### Migration Summary

| Source | Destination | Status |
|--------|-------------|--------|
| `archives-features/chat` utilities | `frontend/shared/communications` | ✅ Migrated |
| `archives-features/members/api` | `frontend/features/user-management/api` | ✅ Migrated |
| `archives-features/invitations/api` | `frontend/features/user-management/api` | ✅ Migrated |
| `SearchBar` component | `frontend/shared/ui/components/SearchBar.tsx` | ✅ Created |
| `MobileHeader` component | `frontend/shared/ui/layout/header/MobileHeader.tsx` | ✅ Created |
| `useConvexChatDataSource` | `frontend/shared/communications/chat/adapters/useConvexChat.ts` | ✅ Created |
| `useMemberInfo` hooks | `frontend/shared/communications/chat/hooks/useMemberActions.ts` | ✅ Created |
| `getInitials` utility | `frontend/shared/communications/utils.ts` | ✅ Available |

### Files Updated

- ✅ `frontend/features/status/*` - All views updated
- ✅ `frontend/features/ai/*` - All views updated
- ✅ `frontend/features/support/*` - SupportChatContainer updated
- ✅ `frontend/features/projects/*` - ProjectDiscussionChat updated
- ✅ `frontend/features/user-management/api/index.ts` - Now self-contained
- ✅ `frontend/shared/foundation/workspaces/index.ts` - MemberManagement removed
- ✅ `frontend/shared/preview/all-previews.ts` - Deprecated previews removed
- ✅ `frontend/shared/foundation/utils/notifications/*` - Updated
- ✅ `frontend/shared/foundation/utils/comments/*` - Updated
- ✅ `frontend/shared/foundation/utils/archived/components/` - Deleted (duplicate)

---

## 📊 Feature Analysis Summary

### Registered Features (35 total)

These features are properly registered in `lib/features/registry.ts`:

| Feature | ID | Status |
|---------|-----|--------|
| Overview | `overview` | ✅ Registered |
| Communications | `communications` | ✅ Registered |
| Status | `status` | ✅ Registered |
| AI | `ai` | ✅ Registered |
| Workspace Store | `workspace-store` | ✅ Registered |
| Knowledge | `knowledge` | ✅ Registered |
| Contact | `contact` | ✅ Registered |
| Database | `database` | ✅ Registered |
| Documents | `documents` | ✅ Registered |
| Menu Store | `menu-store` | ✅ Registered |
| Calendar | `calendar` | ✅ Registered |
| User Management | `user-management` | ✅ Registered |
| Reports | `reports` | ✅ Registered |
| Tasks | `tasks` | ✅ Registered |
| Forms | `forms` | ✅ Registered |
| Approvals | `approvals` | ✅ Registered |
| Support | `support` | ✅ Registered |
| Projects | `projects` | ✅ Registered |
| Audit Log | `audit-log` | ✅ Registered |
| Import Export | `import-export` | ✅ Registered |
| Integrations | `integrations` | ✅ Registered |
| POS | `pos` | ✅ Registered |
| Builder | `builder` | ✅ Registered |
| Marketing | `marketing` | ✅ Registered |
| Analytics | `analytics` | ✅ Registered |
| BI | `bi` | ✅ Registered |
| Automation | `automation` | ✅ Registered |
| Sales | `sales` | ✅ Registered |
| HR | `hr` | ✅ Registered |
| Content | `content` | ✅ Registered |
| CMS Lite | `cms-lite` | ✅ Registered |
| Accounting | `accounting` | ✅ Registered |
| Inventory | `inventory` | ✅ Registered |
| CRM | `crm` | ✅ Registered |
| Platform Admin | `platform-admin` | ✅ Registered |

---

## 🗑️ Unregistered Folders Analysis

### 1. `archives-features/` ⚠️ ACTIVELY USED - REFACTOR NEEDED

**Location:** `frontend/features/archives-features/`

**Contains sub-features:**
- `analytics-dashboard/` - May be deprecated
- `analytics-reports/` - May be deprecated
- `automation-builder/` - May be deprecated
- `calendar/` - May be duplicate
- `calls/` - **USED** - Initialized in `initFeatureSettings.ts`
- `canvas/` - Likely deprecated
- `chat/` - **HEAVILY USED** - Core dependency for multiple features
- `cms-preview/` - May be deprecated
- `invitations/` - **USED** - Exported via `user-management` API
- `members/` - **USED** - Exported via `user-management` API
- `wiki/` - May be deprecated
- `workflow/` - May be deprecated

**Active Dependencies Found:**

| File | Uses |
|------|------|
| `status/StatusDetailView.tsx` | `getInitials` from chat/utils |
| `status/StatusView.tsx` | `useWhatsAppStore`, `TopBar` from chat |
| `status/StatusListView.tsx` | `SearchBar`, `getInitials` from chat |
| `status/page.tsx` | `useInitializeChat` from chat |
| `user-management/api/index.ts` | Members & Invitations APIs |
| `support/SupportChatContainer.tsx` | `useConvexChatDataSource` |
| `projects/ProjectDiscussionChat.tsx` | `useConvexChatDataSource` |
| `initFeatureSettings.ts` | Chat & Calls init |
| `features/index.ts` | `WorkspaceChatContainer`, chat adapters |

**Recommendation:** ⚠️ **REFACTOR REQUIRED** before deletion:
1. Extract shared utilities (getInitials, stores) to `frontend/shared/`
2. Move chat adapter to `frontend/shared/adapters/`
3. Create proper feature for communications/chat
4. Migrate members/invitations to `user-management` feature properly

---

### 2. `industryTemplates/` ⚠️ HAS BACKEND - SHOULD BE REGISTERED

**Location:** `frontend/features/industryTemplates/`

**Has Backend:** ✅ Yes - `convex/features/industryTemplates/`
- `schema.ts` - Industry templates table definitions
- `queries.ts` - Template queries
- `mutations.ts` - Template mutations

**Recommendation:** ⚠️ **Should be registered** in `lib/features/registry.ts`:
1. Create `config.ts` using `defineFeature()`
2. Add to registry imports
3. Add to `featureConfigs` array

---

### 3. `_templates/` ✅ KEEP

**Location:** `frontend/features/_templates/`

**Purpose:** Template folder for scaffolding new features

**Recommendation:** ✅ **KEEP** - Used for feature generation

---

## 🔄 Cleanup Actions

### Priority 1: Fix Status Feature Dependencies (URGENT)

The `status` feature currently imports from `archives-features/chat/`. We need to migrate these:

**Files to Fix:**
1. `frontend/features/status/StatusDetailView.tsx`
2. `frontend/features/status/StatusView.tsx`
3. `frontend/features/status/StatusListView.tsx`
4. `frontend/features/status/page.tsx`

**Actions:**
```powershell
# Option A: Move chat utilities to shared
# Create: frontend/shared/utils/initials.ts
# Create: frontend/shared/stores/whatsapp-store.ts (rename to status-store)
# Move: SearchBar to frontend/shared/ui/components/SearchBar

# Option B: Create a proper 'chat' or 'messaging' feature
# Register it in lib/features/registry.ts
```

### Priority 2: Register industryTemplates Feature

```powershell
# Create config.ts for industryTemplates
# File: frontend/features/industryTemplates/config.ts
```

### Priority 3: Clean archives-features Sub-folders

After migrating active dependencies, these can be deleted:
- `archives-features/analytics-dashboard/`
- `archives-features/analytics-reports/`
- `archives-features/automation-builder/`
- `archives-features/calendar/`
- `archives-features/canvas/`
- `archives-features/cms-preview/`
- `archives-features/wiki/`
- `archives-features/workflow/`

**Keep temporarily:**
- `archives-features/chat/` - Still has active dependencies
- `archives-features/calls/` - Used in initialization
- `archives-features/members/` - Used by user-management
- `archives-features/invitations/` - Used by user-management

---

## 📁 Standard Feature Structure

Each registered feature should follow this structure:

```
feature-name/
├── config.ts          # Feature definition (REQUIRED)
├── index.ts           # Public exports (REQUIRED)
├── page.tsx           # Main page component
├── init.ts            # Feature initialization
├── settings/          # Feature settings components
├── view/              # View components
├── hooks/             # Feature-specific hooks
└── components/        # Feature-specific components
```

---

## ✅ Verification Checklist

For each registered feature, verify:

- [ ] Has `config.ts` with proper `defineFeature()` call
- [ ] Has `index.ts` with proper exports
- [ ] Follows standard folder structure
- [ ] No circular dependencies
- [ ] Uses proper import paths (`@/frontend/features/...`)
- [ ] Has corresponding backend code in `convex/features/`

---

## 📈 Next Steps

1. **Run import analysis** to verify no code references archived features
2. **Backup** `archives-features` folder
3. **Delete** `archives-features` folder
4. **Review** `industryTemplates` for proper handling
5. **Run full validation** after cleanup

---

## 🛠️ Commands

```powershell
# Find all imports referencing archives-features
Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx | Select-String "archives-features"

# Find all imports referencing industryTemplates  
Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx | Select-String "industryTemplates"

# Validate feature registry
pnpm run sync:all
```
