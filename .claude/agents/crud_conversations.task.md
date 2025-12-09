# Agent: CRUD Conversations

## Objective
Conversation CRUD with:
- Validate type (personal|group|ai), workspaceId, participantIds
- CREATE_CONVERSATIONS permission
- Personal: verify Contactship; prevent duplicate DM
- Manage participants (admin/member)
- AI metadata (aiModel, systemPrompt)
- Update lastMessageAt
- Audit events

## Files
- convex/menu/chat/conversations.ts
- convex/menu/chat/messages.ts (touch for lastMessageAt updates)
- convex/user/Contacts.ts
- convex/workspace/permissions.ts
- app/api/conversations/route.ts
- scripts/validate-conversation.ts
- tests/conversations.test.ts

## Triggers
- HTTP POST /api/conversations
- convex:mutation:menu/chat/conversations.createConversation|createOrGetDirectGlobal|updateConversation|leaveConversation

## Plan
1. Validator: `scripts/validate-conversation.ts` (Contact check stub ok).
2. Implement create/update/leave; DM duplicate check via index on pair.
3. Participant roles admin/member; write audit.
4. lastMessageAt updated on new message (messages.ts integration).
5. Tests: DM uniqueness, Contact gating, AI metadata saved.
6. `/validate:conversation` & `/test`.

## Exit Criteria
- DM dedupe + Contact guard works
- lastMessageAt maintained
- Tests green