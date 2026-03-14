# Header AI Agent Widget — Analysis, Plan & Tasklist

**Date:** 2026-03-14
**Status:** 📋 Planning
**Feature Branch:** `claude/review-essential-reading-mKlKi`

---

## 1. Ringkasan Tujuan

Buat **AI Agent Widget** yang **menetap di header global** (SiteHeader) bersebelahan dengan navigasi. Widget ini bertindak sebagai **pintu masuk universal** ke sistem agent:

- **Agent Alpha** — general-purpose agent (bisa handle semua query)
- **Feature Agents** — agent spesifik fitur yang aktif (contoh: Studio Agent saat di halaman Studio)

UI berupa **floating panel / slide-in popover** yang dapat membuka sesi chat singkat tanpa meninggalkan halaman yang sedang dikerjakan.

> **Prinsip utama:** AI dan Studio adalah **extension features** yang berdiri sendiri. Jika salah satunya bermasalah, seluruh aplikasi SuperSpace tetap berjalan normal.

---

## 2. Arsitektur Saat Ini (Temuan)

### 2.1 Hierarki Layout

```
app/dashboard/layout.tsx
  └─ SidebarProvider
      ├─ AppSidebar (kiri)
      │   ├─ WorkspaceSwitcherStack
      │   ├─ NavMain / NavPinned
      │   ├─ NavSystem
      │   └─ NavUser (footer)
      └─ SidebarInset (kanan)
          ├─ LoadingBar
          ├─ SiteHeader  ← 🎯 TARGET PLACEMENT
          │   ├─ SidebarTrigger + Breadcrumbs
          │   ├─ Search Button (Cmd+K)
          │   ├─ Notifications Button
          │   └─ FeatureHeaderActions (Settings + AI per-feature)
          └─ Main Content Area
```

### 2.2 File-file Kunci

| Komponen | Path |
|---|---|
| SiteHeader (global top nav) | `frontend/shared/ui/layout/sidebar/components/site-header.tsx` |
| FeatureHeaderActions | `frontend/shared/ui/layout/header/components/FeatureHeaderActions.tsx` |
| FeatureAIAssistant (existing) | `frontend/shared/ui/ai-assistant/FeatureAIAssistant.tsx` |
| GlobalOverlays | `frontend/shared/ui/layout/chrome/GlobalOverlays.tsx` |
| AI Feature root | `frontend/features/ai/` |
| AI Agent Registry | `frontend/features/ai/agents/registry.ts` |
| AI Agent Router | `frontend/features/ai/agents/router.ts` |
| AI Sub-agent types | `frontend/features/ai/agents/types.ts` |
| Studio Agent | `frontend/features/studio/agents/index.ts` |
| AI Store (Zustand) | `frontend/features/ai/stores/index.ts` |
| AI Settings | `frontend/features/ai/settings/useAISettings.ts` |

### 2.3 Sistem Agent yang Ada

```
SubAgentRegistry (singleton)
  ├─ agents: Map<string, SubAgent>
  ├─ routeQuery(query, ctx) → SubAgent
  ├─ getToolDefinitions() → LLM tool array
  └─ executeToolCall(name, params, ctx) → ToolResult

SubAgent shape:
  {
    id: string
    name: string
    description: string
    featureId: string
    icon?: string
    tools: SubAgentTool[]
    canHandle(query, ctx): number | boolean
    getContext?(ctx): Promise<string>
    systemPrompt?: string
  }
```

Agents saat ini terdaftar: `documents`, `tasks`, `calendar`
Studio agent (`studio`) sudah ada di `frontend/features/studio/agents/`

### 2.4 AI Feature: FeatureAIAssistant (Existing)

Sudah ada `FeatureAIAssistant` yang muncul di feature header saat dalam halaman fitur. Ini **sudah di SiteHeader** tapi hanya muncul ketika fitur aktif dan bersifat per-fitur. Yang akan kita buat adalah versi **global & persistent** dengan routing ke Alpha + feature agents.

---

## 3. Desain Target

### 3.1 Widget Placement di SiteHeader

```
[ ≡ ]  [ Breadcrumbs / Title ]  ............  [ 🔍 Search ]  [ 🤖 AI ]  [ 🔔 ]
                                                              ↑
                                                    GlobalAIAgentButton
                                                    (selalu tampil)
```

### 3.2 GlobalAIAgentButton

- **Ikon:** `Bot` atau `Sparkles` dari lucide-react
- **State:** idle / loading / active (dot indicator)
- **Tooltip:** "Ask AI Agent"
- **Click:** Buka `GlobalAIAgentPanel`

### 3.3 GlobalAIAgentPanel (Floating Popover/Sheet)

```
┌──────────────────────────────────────┐
│ 🤖  AI Agent                    [✕] │
│ ─────────────────────────────────── │
│  Agent: [ Alpha ▾ ]                  │
│         [ Studio Agent ]             │
│         [ Documents ]                │
│         [ Tasks ]                    │
│ ─────────────────────────────────── │
│                                      │
│  [conversation messages here]        │
│                                      │
│ ─────────────────────────────────── │
│  Ask anything...           [Send ▶] │
└──────────────────────────────────────┘
```

**Mode panel:**
- **Popover** (default desktop) — floating di bawah tombol header
- **Sheet/Drawer** (mobile) — slide dari bawah / kanan

### 3.4 Agent Selector Logic

```
Active Page URL           → Auto-select agent
/dashboard/studio/**     → Studio Agent (jika terinstall)
/dashboard/documents/**  → Documents Agent
/dashboard/tasks/**      → Tasks Agent
/dashboard/ai/**         → Alpha Agent
(lainnya)                → Alpha Agent (fallback)
```

User bisa override dengan manual pilih dari dropdown.

### 3.5 Alpha Agent

"Alpha" adalah **orchestrator agent** yang bisa handle query apapun dan mendelegasikan ke agent lain bila perlu. Jika tidak ada feature agent yang cocok, Alpha sebagai fallback universal.

---

## 4. Prinsip Isolasi (Extension Architecture)

```
SuperSpace Core (tidak tahu tentang AI)
    │
    ├─ AI Feature Extension (opsional)
    │   ├─ Jika tidak ada → GlobalAIAgentButton tidak render
    │   ├─ Jika error → error boundary, app tetap jalan
    │   └─ Lazy loaded — tidak mempengaruhi bundle core
    │
    └─ Studio Feature Extension (opsional)
        ├─ Studio Agent hanya terdaftar jika Studio feature aktif
        ├─ Agent Registry auto-discover dari init-agents.ts
        └─ Jika Studio error → agent tidak tersedia, tidak crash
```

**Implementasi isolasi:**
- `GlobalAIAgentButton` dibungkus `Suspense` + `ErrorBoundary`
- Cek `isFeatureEnabled('ai')` sebelum render
- Studio agent terdaftar secara lazy di `init-agents.ts`
- Semua agent tools pakai try/catch, error tidak bubble ke UI

---

## 5. Flow Data

```
User → GlobalAIAgentPanel
      ↓
  Input message
      ↓
  AgentSelector.selectedAgent (Alpha | Studio | ...)
      ↓
  useGlobalAgentChat hook
      ↓
  POST /api/ai/chat
    - provider/model dari AISettings
    - tools dari selectedAgent.getToolDefinitions()
    - system prompt dari selectedAgent.systemPrompt
      ↓
  Response + tool_calls
      ↓
  SubAgentRouter.executeToolCall()
      ↓
  Render di panel (lightweight, bukan full session)
```

**Chat state:** Disimpan di Zustand lokal (bukan Convex session), karena ini quick-access panel bukan full chat. User bisa klik "Open in AI" untuk lanjutkan sebagai full session.

---

## 6. File yang Akan Dibuat / Diubah

### 6.1 Baru (New Files)

```
frontend/shared/ui/layout/sidebar/components/
  GlobalAIAgentButton.tsx       ← Tombol di SiteHeader
  GlobalAIAgentPanel.tsx        ← Floating panel UI
  useGlobalAgentChat.ts         ← Hook untuk chat logic
  GlobalAgentPanelStore.ts      ← Zustand state (open/closed, messages, selected agent)
```

### 6.2 Modifikasi (Modified Files)

```
frontend/shared/ui/layout/sidebar/components/site-header.tsx
  → Tambah <GlobalAIAgentButton /> di section kanan (sebelum notifications)

frontend/features/ai/agents/registry.ts
  → Tambah Alpha agent entry
  → Export getAgentById(), getAllAgents()

frontend/features/ai/init-agents.ts
  → Register Studio agent (jika belum)

frontend/shared/ui/layout/chrome/GlobalOverlays.tsx
  → (Opsional) Tambah GlobalAIAgentPanel sebagai overlay layer
```

### 6.3 Studio Agent (Cek & Lengkapi)

```
frontend/features/studio/agents/index.ts
  → Pastikan Studio agent sudah implement SubAgent interface lengkap
  → Tools: createComponent, updateLayout, runFlow, explainCanvas, etc.
```

---

## 7. Tasklist (Progress Tracker)

### Phase 0 — Audit & Setup

- [ ] **T0.1** Baca & pahami `FeatureAIAssistant.tsx` existing — cara kerja, props, mode
- [ ] **T0.2** Baca `site-header.tsx` — slot yang tersedia untuk tambah button
- [ ] **T0.3** Baca `GlobalOverlays.tsx` — pattern untuk menambah global overlay baru
- [ ] **T0.4** Cek `frontend/features/studio/agents/` — apakah Studio agent sudah implement SubAgent interface
- [ ] **T0.5** Cek `init-agents.ts` — agent mana yang sudah registered
- [ ] **T0.6** Baca `registry.ts` agent — pastikan ada `getAll()` / `getById()` exports
- [ ] **T0.7** Tentukan: Alpha agent apakah sudah ada atau perlu dibuat

### Phase 1 — State & Store

- [ ] **T1.1** Buat `GlobalAgentPanelStore.ts` (Zustand)
  - State: `isOpen`, `selectedAgentId`, `messages`, `isLoading`
  - Actions: `open()`, `close()`, `toggle()`, `selectAgent()`, `addMessage()`, `clearMessages()`
  - Middleware: `persist` untuk `selectedAgentId` (last used agent)

- [ ] **T1.2** Buat `useGlobalAgentChat.ts` hook
  - Consume `GlobalAgentPanelStore`
  - `sendMessage(text)` → call `/api/ai/chat` dengan agent tools
  - Handle tool calls via `SubAgentRouter`
  - Auto-detect current page → suggest agent
  - "Open as full session" action

### Phase 2 — Alpha Agent

- [ ] **T2.1** Buat / daftarkan Alpha agent di `registry.ts`
  ```typescript
  {
    id: 'alpha',
    name: 'Alpha',
    description: 'General-purpose agent — handles anything',
    featureId: 'ai',
    canHandle: () => 0.5, // always available, medium confidence
    systemPrompt: '...',
    tools: [] // delegates to other agents dynamically
  }
  ```
- [ ] **T2.2** Alpha agent dapat route ke agents lain secara internal (orchestrator pattern)
- [ ] **T2.3** Buat system prompt Alpha yang tahu tentang semua available agents

### Phase 3 — Studio Agent Integration

- [ ] **T3.1** Audit `frontend/features/studio/agents/index.ts` — check conformance dengan `SubAgent` interface
- [ ] **T3.2** Tambahkan Studio agent ke `init-agents.ts` jika belum ada
- [ ] **T3.3** Definisikan Studio agent tools:
  - `explainCanvas` — jelaskan canvas yang sedang terbuka
  - `addComponent` — tambahkan widget ke canvas
  - `runFlow` — jalankan workflow
  - `getCanvasState` — ambil state canvas saat ini
- [ ] **T3.4** Test isolasi: Studio error → tidak crash GlobalAIAgentPanel

### Phase 4 — UI Components

- [ ] **T4.1** Buat `GlobalAIAgentButton.tsx`
  - Ikon `Bot` dari lucide-react
  - Variant `ghost` consistent dengan tombol header lain
  - Active state indicator (dot) saat panel terbuka atau ada pesan baru
  - Tooltip "Ask AI Agent (⌘.)"
  - ErrorBoundary wrapper — render null jika AI feature tidak ada
  - Keyboard shortcut: `Cmd+.` atau `Cmd+Shift+A`

- [ ] **T4.2** Buat `GlobalAIAgentPanel.tsx`
  - Mode: Popover (desktop, anchored ke button) / Sheet (mobile)
  - Sections:
    - Header: title "AI Agent" + close button
    - AgentSelector: dropdown pilih agent (Alpha + feature agents)
    - MessageList: scroll area, compact message bubbles
    - Input: textarea + send button
    - Footer: "Open full session ↗" link ke `/dashboard/ai`
  - Suspense boundary untuk lazy load
  - Max height: 70vh, min width: 380px

- [ ] **T4.3** Buat `AgentOptionsList` subcomponent
  - List agents dengan ikon, nama, deskripsi singkat
  - Highlight current page's relevant agent
  - Badge "Active page" pada agent yang relevan

- [ ] **T4.4** Implementasi auto-select agent berdasarkan URL
  ```typescript
  function getRecommendedAgent(pathname: string): string {
    if (pathname.includes('/studio')) return 'studio'
    if (pathname.includes('/documents')) return 'documents'
    if (pathname.includes('/tasks')) return 'tasks'
    return 'alpha' // fallback
  }
  ```

### Phase 5 — SiteHeader Integration

- [ ] **T5.1** Modifikasi `site-header.tsx`
  - Import `GlobalAIAgentButton` dengan dynamic import (lazy)
  - Tambahkan sebelum notifications button
  - Pastikan tidak merusak layout existing

- [ ] **T5.2** Test responsive behavior
  - Desktop: Popover floating panel
  - Mobile: Bottom sheet / right drawer

- [ ] **T5.3** Test bahwa tanpa AI feature, button tidak render (graceful degradation)

### Phase 6 — Keyboard & Accessibility

- [ ] **T6.1** Global keyboard shortcut `Cmd+.` untuk toggle panel
  - Register di layout.tsx atau SiteHeader
  - Tidak konflik dengan Cmd+K (search)
  - Tidak konflik dengan shortcut Studio

- [ ] **T6.2** Keyboard navigation dalam panel
  - `Esc` menutup panel
  - `Tab` navigasi antar elemen
  - `Enter` submit message
  - `Shift+Enter` newline

- [ ] **T6.3** ARIA attributes untuk accessibility
  - `role="dialog"` pada panel
  - `aria-label` pada button dan input
  - Focus management saat open/close

### Phase 7 — Extension Isolation

- [ ] **T7.1** Bungkus `GlobalAIAgentButton` dengan `ErrorBoundary`
  - Render null jika error (tidak crash header)
  - Log error ke console (dev) atau monitoring (prod)

- [ ] **T7.2** Cek feature flag `isFeatureEnabled('ai')` sebelum render button
  - Gunakan feature registry auto-discovery pattern yang sudah ada

- [ ] **T7.3** Studio agent: ErrorBoundary di tool execution
  - Jika Studio agent gagal → fallback ke Alpha agent
  - Error message yang informatif di panel

- [ ] **T7.4** Test skenario isolasi:
  - [ ] AI feature dinonaktifkan → button tidak muncul, app normal
  - [ ] Studio feature error → Studio agent tidak tersedia, Alpha masih bisa
  - [ ] Network error saat chat → error state di panel, tidak crash app
  - [ ] Convex offline → tool calls gagal gracefully

### Phase 8 — Testing

- [ ] **T8.1** Unit tests:
  - `GlobalAgentPanelStore` — state transitions
  - `useGlobalAgentChat` — message flow, tool call handling
  - `getRecommendedAgent()` — URL to agent mapping

- [ ] **T8.2** Component tests:
  - `GlobalAIAgentButton` render, click, tooltip
  - `GlobalAIAgentPanel` open/close, agent selection, message send

- [ ] **T8.3** Integration tests:
  - Alpha agent receives query → response
  - Studio agent tool execution dalam panel
  - Auto-agent switch saat navigate ke halaman lain

- [ ] **T8.4** E2E scenario:
  - Open panel → select Studio agent → ask "explain my canvas" → get response
  - Open panel → ask general question → Alpha answers

### Phase 9 — Polish & Docs

- [ ] **T9.1** Animation: panel open/close dengan smooth transition
- [ ] **T9.2** Empty state: welcome message + suggested prompts per agent
- [ ] **T9.3** Loading state: skeleton / typing indicator
- [ ] **T9.4** "Open full session" seamless handoff ke `/dashboard/ai` dengan context terbawa
- [ ] **T9.5** Update `docs/features/` dengan dokumentasi final

---

## 8. Debug Plan

### Masalah yang Mungkin Terjadi

#### D1. TypeScript Errors
- **Gejala:** Import `SubAgent` interface tidak match
- **Diagnosis:** Cek `frontend/features/ai/agents/types.ts` vs implementasi di Studio agent
- **Fix:** Gunakan adapter pattern jika interface berbeda

#### D2. Studio Agent Tidak Terdaftar
- **Gejala:** Studio agent tidak muncul di selector saat di halaman Studio
- **Diagnosis:** Cek `init-agents.ts` — apakah Studio agent di-import & diregister
- **Fix:** Tambahkan lazy import Studio agent di `init-agents.ts`

#### D3. Panel Posisi Salah di Mobile
- **Gejala:** Popover terpotong di layar kecil
- **Diagnosis:** DevTools responsive mode
- **Fix:** Switch ke `Sheet` component dari shadcn/ui untuk mobile breakpoint

#### D4. Keyboard Shortcut Konflik
- **Gejala:** `Cmd+.` tidak work atau konflik
- **Diagnosis:** Cek event listeners di layout.tsx dan command-menu
- **Fix:** Pilih shortcut lain atau periksa `e.preventDefault()` ordering

#### D5. Alpha Agent Tidak Ada
- **Gejala:** Registry hanya punya feature-specific agents
- **Diagnosis:** Cek `registry.ts` dan `init-agents.ts`
- **Fix:** Buat dan register Alpha agent sebagai built-in default

#### D6. Extension Isolation Breach
- **Gejala:** Error di Studio agent menyebabkan panel crash
- **Diagnosis:** Error boundary tidak terpasang di tool execution
- **Fix:** Wrap setiap `tool.handler()` call dengan try/catch di router

#### D7. Chat State Hilang Saat Navigasi
- **Gejala:** Messages hilang saat user pindah halaman
- **Diagnosis:** Store tidak di-persist atau component unmount
- **Fix:** `persist` middleware di Zustand store untuk messages (dengan TTL/limit)

---

## 9. Dependency Map

```
GlobalAIAgentButton
  └─ isFeatureEnabled('ai')         ← feature registry
  └─ GlobalAgentPanelStore          ← zustand store

GlobalAIAgentPanel
  └─ GlobalAgentPanelStore          ← state
  └─ useGlobalAgentChat             ← chat logic
  └─ SubAgentRegistry               ← agent list
  └─ AgentSelector component        ← dari features/ai/components/
  └─ GrokInput / custom input       ← dari shared/communications/

useGlobalAgentChat
  └─ AISettings (provider/model)    ← features/ai/settings/
  └─ SubAgentRegistry.routeQuery()  ← features/ai/agents/registry.ts
  └─ SubAgentRouter.executeToolCall ← features/ai/agents/router.ts
  └─ POST /api/ai/chat              ← existing API route

Alpha Agent
  └─ SubAgent interface             ← features/ai/agents/types.ts
  └─ All registered agents          ← registry.getAllAgents()

Studio Agent (existing)
  └─ SubAgent interface
  └─ Studio-specific tools
  └─ StudioCanvasProvider (read state)
```

---

## 10. Acceptance Criteria

✅ **GlobalAIAgentButton** selalu muncul di header (kecuali AI feature disabled)
✅ **Panel terbuka** dengan click atau `Cmd+.`
✅ **Alpha agent** tersedia di semua halaman
✅ **Studio agent** auto-selected saat di halaman Studio
✅ **Feature agents** lain tersedia di dropdown
✅ **Chat bekerja** dengan provider/model dari settings AI
✅ **Tool calls** dieksekusi oleh agent yang dipilih
✅ **"Open full session"** membuka `/dashboard/ai` dengan context
✅ **Isolasi:** AI feature error → button tidak render (tidak crash app)
✅ **Isolasi:** Studio agent error → Alpha fallback, tidak crash panel
✅ **Mobile:** Sheet drawer menggantikan popover
✅ **TypeScript:** Zero new TS errors
✅ **Tests:** Unit + integration tests pass

---

## 11. Estimasi Kompleksitas

| Phase | Kompleksitas | Catatan |
|---|---|---|
| Phase 0 — Audit | Rendah | Read-only, 1-2 jam |
| Phase 1 — Store | Sedang | Zustand boilerplate |
| Phase 2 — Alpha Agent | Sedang | Orchestrator pattern baru |
| Phase 3 — Studio Agent | Sedang | Tergantung existing impl |
| Phase 4 — UI Components | Tinggi | Popover + Sheet + responsive |
| Phase 5 — Integration | Sedang | site-header.tsx edit |
| Phase 6 — Keyboard/A11y | Sedang | Event handling |
| Phase 7 — Isolation | Sedang | ErrorBoundary pattern |
| Phase 8 — Testing | Tinggi | Coverage semua path |
| Phase 9 — Polish | Rendah | Animation + empty states |

---

*Report ini dibuat setelah analisis codebase SuperSpace pada 2026-03-14. Tidak ada kode yang dimodifikasi pada tahap ini.*
