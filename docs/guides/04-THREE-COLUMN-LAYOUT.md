# Three Column Layout Usage Guide

## Overview
Gunakan komponen `ThreeColumnLayoutAdvanced` (SSOT) di `frontend/shared/ui/layout/container/three-column` untuk membuat tampilan three‑column yang konsisten. Sekarang tersedia juga prop `preset` untuk mengurangi duplikasi konfigurasi width/responsive.

## Import
```typescript
import { 
  ThreeColumnLayoutAdvanced, 
  LeftPanel, 
  CenterPanel, 
  RightPanel 
} from "@/frontend/shared/ui/layout/container/three-column";
```

## Contoh Penggunaan untuk Chat View

```typescript
import { ThreeColumnLayoutAdvanced, LeftPanel, CenterPanel, RightPanel } from "@/frontend/shared/ui/layout/container/three-column";
import { ChatListSidebar } from "../components/chat/ChatListSidebar";
import { ChatDetailView } from "../components/chat/ChatDetailView";
import { MemberInfoDrawer } from "@/frontend/shared/communications";
import { useWhatsAppStore } from "../shared/hooks";

export function ChatView() {
  const { selectedChatId, chats } = useWhatsAppStore();
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const selectedChat = chats.find(c => c.id === selectedChatId);
  
  return (
    <>
      <ThreeColumnLayoutAdvanced
        left={<ChatListSidebar />}
        center={<ChatDetailView />}
        right={
          selectedChat ? (
            <MemberInfoDrawer 
              contact={selectedChat.contact}
              isOpen={isMemberInfoOpen}
              onClose={() => setIsMemberInfoOpen(false)}
            />
          ) : null
        }
        preset="feature"
        leftWidth={320}       // override preset jika perlu
        rightWidth={400}
        centerMinWidth={400}
        persistState
        storageKey="chat-three-column"
        leftLabel="Chats"
        centerLabel="Messages"
        rightLabel="Contact Info"
      />
    </>
  );
}
```

## Contoh Penggunaan untuk AI View

```typescript
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container/three-column";
import { AISessionList } from "../components/AISessionList";
import { AIChatInterface } from "../components/AIChatInterface";
import { AISessionInfoDrawer } from "../components/AISessionInfoDrawer";
import { useAIStore } from "../stores";

export function AIView() {
  const { selectedSession, sessions } = useAIStore();
  const [isSessionInfoOpen, setIsSessionInfoOpen] = useState(false);
  
  return (
    <>
      <ThreeColumnLayoutAdvanced
        left={<AISessionList sessions={sessions} />}
        center={<AIChatInterface />}
        right={
          selectedSession ? (
            <AISessionInfoDrawer 
              session={selectedSession}
              isOpen={isSessionInfoOpen}
              onClose={() => setIsSessionInfoOpen(false)}
            />
          ) : null
        }
        preset="ide"
        rightWidth={380}      // override preset jika perlu
        persistState
        storageKey="ai-three-column"
        leftLabel="Sessions"
        centerLabel="Chat"
        rightLabel="Session Info"
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `left` | `ReactNode` | optional | Left panel content (sidebar). Jika `null/undefined`, panel kiri otomatis hidden. |
| `center` | `ReactNode` | - | Center panel content (main area) |
| `right` | `ReactNode` | optional | Right panel content (detail/inspector). Jika `null/undefined`, panel kanan otomatis hidden. |
| `preset` | `"feature" \| "store" \| "admin" \| "ide"` atau config | - | Preset untuk width + responsive default (boleh di‑override). |
| `leftWidth` | `number` | `280` | Default width for left panel (px) |
| `rightWidth` | `number` | `400` | Default width for right panel (px) |
| `centerMinWidth` | `number` | `280` | Minimum width for center panel (px) |
| `minSideWidth` | `number` | `200` | Minimum width for side panels (px) |
| `maxSideWidth` | `number` | `600` | Maximum width for side panels (px) |
| `collapsedWidth` | `number` | `40` | Width when collapsed (px) |
| `leftHidden` / `rightHidden` | `boolean` | `false` | Force hide panel kiri/kanan walau konten ada. |
| `leftHeader` / `centerHeader` / `rightHeader` | `ReactNode` | - | Custom header untuk masing‑masing panel (render saat expanded). |
| `showLeftCollapseButton` / `showRightCollapseButton` | `boolean` | - | Override global collapse button per panel. |
| `resizable` | `boolean` | `true` | Enable panel resizing |
| `showCollapseButtons` | `boolean` | `true` | Show collapse/expand buttons |
| `persistState` | `boolean` | `false` | Persist collapse state to localStorage |
| `storageKey` | `string` | `"three-column-layout"` | localStorage key for persistence |
| `leftLabel` | `string` | `"Left Panel"` | Aria label for left panel |
| `centerLabel` | `string` | `"Main Content"` | Aria label for center panel |
| `rightLabel` | `string` | `"Right Panel"` | Aria label for right panel |

## Features

✅ **Collapsible panels** - Klik tombol collapse di kiri/kanan
✅ **Resizable** - Drag handle antara panel untuk resize
✅ **Responsive** - Auto-collapse pada breakpoint tertentu
✅ **Keyboard shortcuts** - Cmd+B (left), Cmd+Shift+B (right)
✅ **Persist state** - Simpan collapse state di localStorage
✅ **Smooth animations** - Transisi smooth saat collapse/expand
✅ **Accessibility** - Keyboard navigable, screen reader Contactly

## Best Practices

1. **Jangan buat komponen ThreeColumn baru** - Gunakan yang sudah ada di `frontend/shared/ui/layout/container/three-column`
2. **Set storageKey unik** - Untuk setiap feature yang berbeda (mis: `"chat-three-column"`, `"ai-three-column"`)
3. **Enable persistState** - Untuk better UX, simpan preference user
4. **Set proper labels** - Untuk accessibility
5. **Responsive widths** - Sesuaikan width dengan content yang ditampilkan

## Keuntungan Menggunakan Komponen yang Sudah Ada

- ✅ DRY (Don't Repeat Yourself) - Tidak duplikasi code
- ✅ Consistent behavior - Semua features pakai pattern yang sama
- ✅ Centralized maintenance - Fix bug sekali, apply ke semua
- ✅ Better tested - Komponen sudah teruji
- ✅ Feature rich - Sudah ada banyak features built-in
