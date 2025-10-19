# Chat Feature Settings

This directory contains the settings components for the Chat feature.

## Overview

The chat feature automatically registers its settings with the workspace settings UI using the dynamic settings registry system. When the chat feature is installed and active, its settings automatically appear in the workspace settings sidebar.

## Components

### 1. ChatGeneralSettings
General chat behavior settings like:
- Enter to send
- Show timestamps
- Compact mode
- Show avatars

### 2. ChatNotificationsSettings
Notification preferences for chat:
- Desktop notifications
- Sound alerts
- Message previews
- Mention/DM notifications

### 3. ChatAISettings
AI-powered chat features:
- AI assistant toggle
- Auto-suggestions
- Smart replies
- Language correction

## Usage

### In Your Chat Feature Component

```tsx
import { useChatSettings } from './settings';

export function ChatPage() {
  // Auto-register settings when chat feature mounts
  useChatSettings();

  return (
    <div>
      {/* Your chat UI */}
    </div>
  );
}
```

### Adding a Settings Icon

You can add a settings icon to your chat feature that opens workspace settings:

```tsx
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function ChatHeader() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        // Navigate to workspace settings and pre-select chat category
        router.push('/dashboard/settings?category=chat-general');
      }}
    >
      <Settings className="w-4 h-4" />
    </Button>
  );
}
```

## Architecture

### Auto-Registration Flow

1. **Feature Mounts**: When the chat feature component mounts, it calls `useChatSettings()`
2. **Settings Register**: The hook registers chat settings categories with the global settings registry
3. **UI Updates**: Workspace settings sidebar automatically displays the new categories
4. **Auto-Cleanup**: When feature unmounts, settings are automatically removed

```
Chat Feature Mounts
       ↓
useChatSettings() called
       ↓
Register categories:
  - chat-general
  - chat-notifications
  - chat-ai
       ↓
Settings appear in UI
       ↓
Feature Unmounts
       ↓
Auto-cleanup
```

### Benefits

✅ **Zero manual integration** - Just call the hook
✅ **Automatic cleanup** - No memory leaks
✅ **Permission-aware** - Respects RBAC
✅ **Mobile-responsive** - Works on all devices
✅ **Type-safe** - Full TypeScript support

## Testing

Test that settings appear when feature is active:

```tsx
import { render, screen } from '@testing-library/react';
import { ChatPage } from './page';

test('chat settings register on mount', () => {
  render(<ChatPage />);

  // Check that settings categories are registered
  // (implementation depends on your test setup)
});
```

## Customization

### Adding New Settings Categories

```tsx
export function useChatSettings() {
  useFeatureSettings("chat", [
    // ... existing categories ...
    {
      id: "chat-privacy",
      label: "Privacy",
      icon: Lock,
      order: 103,
      component: ChatPrivacySettings,
    },
  ]);
}
```

### Conditional Settings

You can conditionally show settings based on permissions:

```tsx
export function useChatSettings() {
  const { hasPermission } = usePermissions();

  const categories = [
    {
      id: "chat-general",
      label: "Chat",
      icon: MessageSquare,
      order: 100,
      component: ChatGeneralSettings,
    },
  ];

  // Only admins see moderation settings
  if (hasPermission('MODERATE_CHAT')) {
    categories.push({
      id: "chat-moderation",
      label: "Moderation",
      icon: Shield,
      order: 104,
      component: ChatModerationSettings,
    });
  }

  useFeatureSettings("chat", categories);
}
```

## See Also

- [Shared Settings System Documentation](../../../shared/settings/README.md)
- [Implementation Guide](../../../shared/settings/IMPLEMENTATION_GUIDE.md)
- [Feature Configuration](../../../../features.config.ts)
