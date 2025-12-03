/**
 * IDE Layout System
 * 
 * VS Code-style layout components with resizable panels and drag-and-drop.
 * 
 * Features:
 * - Activity bar (left icon bar)
 * - Primary sidebar (left resizable panel)
 * - Secondary sidebar (right resizable panel)
 * - Bottom panel (resizable)
 * - Editor tabs with drag-and-drop reordering
 * - Keyboard shortcuts (Cmd+B, Cmd+J, etc.)
 * - Layout state persistence
 * 
 * Usage:
 * ```tsx
 * import { IDELayout, IDEActivityBar, IDEEditorTabs } from "@/frontend/shared/ui/layout/ide"
 * 
 * function App() {
 *   return (
 *     <IDELayout
 *       persistKey="my-app"
 *       activityBar={<IDEActivityBar items={items} />}
 *       primarySidebar={<MySidebar />}
 *       panel={<MyTerminal />}
 *     >
 *       <IDEEditorTabs tabs={tabs} />
 *       <EditorContent />
 *     </IDELayout>
 *   )
 * }
 * ```
 */

// Main layout
export { IDELayout, IDEEditorArea } from "./IDELayout"

// Components
export { IDEActivityBar } from "./IDEActivityBar"
export { IDEEditorTabs } from "./IDEEditorTabs"
export { IDEPanel, IDEPanelHeader, IDEPanelSection, IDEPanelTabs } from "./IDEPanel"

// Context and hooks
export { IDELayoutProvider, useIDEContext, useIDEContextSafe } from "./context"
export {
  usePersistedLayoutState,
  usePanelVisibility,
  useEditorTabs,
  useIDEKeyboardShortcuts,
} from "./hooks"

// Types
export type {
  PanelPosition,
  PanelState,
  ActivityBarItem,
  EditorTab,
  PanelConfig,
  IDELayoutConfig,
  IDELayoutState,
  IDELayoutProps,
  IDEPanelProps,
  IDEActivityBarProps,
  IDEEditorTabsProps,
  IDEPanelHeaderProps,
} from "./types"
