# Member Management (Workspace)

Feature-scoped CRUD for workspace members built on Convex.

Subfolders
- `api/`: React hooks wrapping Convex queries/mutations
- `components/`: UI list/panel and role selector
- `config/`: Labels and constants
- `hooks/`: Domain hooks (permissions and CRUD composition)
- `lib/`: Small helpers (guards)
- `types/`: Local types
- `utils/`: Sorting and misc helpers

Usage example
\`\`\`tsx
import { MemberManagementPanel } from "@/frontend/shared/pages/workspaces/member-management";

<MemberManagementPanel workspaceId={workspaceId} onInviteClick={() => setInviteOpen(true)} />
\`\`\`

Notes
- If `onInviteClick` is not provided, the panel will open the built-in workspace Invitation modal for creating new members via email invite.
