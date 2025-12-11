"use client"

/**
 * Session Info Tabs Component
 * 
 * Shared tabbed panel for displaying session information across features.
 * Includes tabs for: Overview, Content, Settings, Knowledge, Export, Debug
 * 
 * The Debug tab provides real-time tracing of AI agent calls and tool executions.
 */

import { useState, useMemo } from "react"
import {
  X,
  Settings2,
  Download,
  Trash2,
  Brain,
  Clock,
  MessageSquare,
  Sparkles,
  BookOpen,
  Share2,
  FileText,
  Bug,
  Activity,
  Cpu,
  Coins,
  Layers,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Pause,
  RotateCcw,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useSessionDebugStore } from "./debug-store"
import type {
  SessionInfoPanelProps,
  GenericSession,
  SessionInfoTab,
  SessionStats,
  AgentTrace,
  ToolCallTrace,
  DebugLog,
} from "./types"

// ============================================================================
// Tab Configuration
// ============================================================================

const TAB_CONFIG: Record<SessionInfoTab, { icon: typeof MessageSquare; label: string }> = {
  overview: { icon: MessageSquare, label: "Overview" },
  content: { icon: FileText, label: "Content" },
  settings: { icon: Settings2, label: "Settings" },
  knowledge: { icon: BookOpen, label: "Knowledge" },
  export: { icon: Download, label: "Export" },
  debug: { icon: Bug, label: "Debug" },
}

const DEFAULT_TABS: SessionInfoTab[] = ["overview", "settings", "knowledge", "export", "debug"]

// ============================================================================
// Section Components
// ============================================================================

function OverviewSection({ session }: { session: GenericSession }) {
  const stats = useMemo<SessionStats>(() => {
    const messages = session.messages || []
    return messages.reduce(
      (acc, msg) => {
        const meta = msg.metadata || {}
        const isUser = msg.role === "user"
        const isAssistant = msg.role === "assistant"
        return {
          totalMessages: acc.totalMessages + 1,
          userMessages: acc.userMessages + (isUser ? 1 : 0),
          assistantMessages: acc.assistantMessages + (isAssistant ? 1 : 0),
          totalTokens: acc.totalTokens + (meta.tokenCount || 0),
          estimatedCost: acc.estimatedCost + ((meta.tokenCount || 0) / 1000) * 0.01,
          totalDuration: acc.totalDuration + (meta.duration || 0),
          toolCallCount: acc.toolCallCount + (meta.toolCalls?.length || 0),
        }
      },
      { totalMessages: 0, userMessages: 0, assistantMessages: 0, totalTokens: 0, estimatedCost: 0, totalDuration: 0, toolCallCount: 0 }
    )
  }, [session.messages])

  return (
    <div className="space-y-6 p-4">
      {/* Session Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mb-3">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold truncate">{session.title || "New Session"}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Badge variant={session.status === "active" ? "default" : "secondary"} className="text-[10px] uppercase">
            {session.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Created {session.createdAt ? formatDistanceToNow(session.createdAt, { addSuffix: true }) : "recently"}
        </p>
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xl font-semibold">{stats.totalMessages}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xl font-semibold">{stats.userMessages}</p>
          <p className="text-[10px] text-muted-foreground">You</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xl font-semibold">{stats.assistantMessages}</p>
          <p className="text-[10px] text-muted-foreground">AI</p>
        </div>
      </div>

      {/* Token/Cost Stats */}
      {stats.totalTokens > 0 && (
        <>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Cpu className="h-3 w-3" />
                <span className="text-[10px] font-medium uppercase">Tokens</span>
              </div>
              <p className="text-lg font-bold">{stats.totalTokens.toLocaleString()}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Coins className="h-3 w-3" />
                <span className="text-[10px] font-medium uppercase">Cost</span>
              </div>
              <p className="text-lg font-bold">${stats.estimatedCost.toFixed(4)}</p>
            </Card>
          </div>
        </>
      )}

      <Separator />

      {/* Model Configuration */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          Model Configuration
        </h4>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-medium capitalize">{session.metadata?.provider || "Default"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model</span>
            <span className="font-medium">{session.settings?.model || session.metadata?.model || "Auto"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Temperature</span>
            <span className="font-medium">{session.metadata?.temperature || "0.7"}</span>
          </div>
        </div>
      </div>

      {/* Active Agents */}
      {session.metadata?.agentId && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" />
              Active Agent
            </h4>
            <Badge variant="outline" className="gap-1 pl-1.5 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {session.metadata.agentId}
            </Badge>
          </div>
        </>
      )}
    </div>
  )
}

function ContentSection({ session }: { session: GenericSession }) {
  const generatedContent = useMemo(() => {
    return (session.messages || [])
      .filter((m) => m.role === "assistant" && (m.content.includes("Created") || m.content.includes("Generated")))
      .map((m) => ({
        id: m.id || String(m.timestamp),
        summary: m.content.slice(0, 80) + (m.content.length > 80 ? "..." : ""),
        timestamp: m.timestamp,
      }))
  }, [session.messages])

  if (generatedContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground p-4">
        <FileText className="h-10 w-10 mb-3 opacity-20" />
        <p className="text-sm">No content generated yet</p>
        <p className="text-xs mt-1">Artifacts will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {generatedContent.map((item) => (
        <Card key={item.id} className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
          <p className="text-sm font-medium line-clamp-2">{item.summary}</p>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
          </div>
        </Card>
      ))}
    </div>
  )
}

function SettingsSection({ onDelete }: { onDelete?: () => void }) {
  return (
    <div className="space-y-6 p-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-4">Session Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Auto-generate titles</p>
              <p className="text-xs text-muted-foreground">Automatically name conversations</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Save to history</p>
              <p className="text-xs text-muted-foreground">Include in conversation history</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Allow regeneration</p>
              <p className="text-xs text-muted-foreground">Enable response branching</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {onDelete && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <h3 className="font-medium mb-4 text-destructive">Danger Zone</h3>
          <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Session
          </Button>
        </div>
      )}
    </div>
  )
}

function KnowledgeSection({
  knowledgeEnabled,
  onKnowledgeToggle,
}: {
  knowledgeEnabled?: boolean
  onKnowledgeToggle?: (enabled: boolean) => void
}) {
  return (
    <div className="space-y-6 p-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Knowledge Context
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Enable Knowledge</p>
              <p className="text-xs text-muted-foreground">Use workspace documents as context</p>
            </div>
            <Switch checked={knowledgeEnabled} onCheckedChange={onKnowledgeToggle} />
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            When enabled, AI will reference your workspace documents to provide more accurate and contextual responses.
          </p>
        </div>
      </div>
    </div>
  )
}

function ExportSection({
  onExport,
  onShare,
}: {
  onExport?: (format: "json" | "markdown" | "pdf") => void
  onShare?: () => void
}) {
  return (
    <div className="space-y-6 p-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Session
        </h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onExport?.("markdown")}>
            <Download className="h-4 w-4 mr-2" />
            Export as Markdown
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onExport?.("json")}>
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onExport?.("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
        </div>
      </div>

      {onShare && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </h3>
          <Button variant="outline" size="sm" className="w-full" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Session
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Debug Section Components
// ============================================================================

function AgentTraceItem({ trace }: { trace: AgentTrace }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const statusIcon = {
    routing: <Activity className="h-3 w-3 text-blue-500 animate-pulse" />,
    processing: <Play className="h-3 w-3 text-yellow-500 animate-pulse" />,
    completed: <CheckCircle2 className="h-3 w-3 text-green-500" />,
    error: <XCircle className="h-3 w-3 text-red-500" />,
  }[trace.status]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer text-sm">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {statusIcon}
          <span className="font-medium flex-1 truncate">{trace.agentName}</span>
          <span className="text-[10px] text-muted-foreground">
            {trace.duration ? `${trace.duration}ms` : "..."}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-5 mt-1 p-2 text-xs space-y-2 border-l-2 border-muted">
          <div>
            <span className="text-muted-foreground">Query: </span>
            <span className="font-mono">{trace.query.slice(0, 100)}...</span>
          </div>
          <div>
            <span className="text-muted-foreground">Confidence: </span>
            <span>{(trace.confidence * 100).toFixed(0)}%</span>
          </div>
          {trace.error && (
            <div className="text-red-500">
              <span className="text-muted-foreground">Error: </span>
              {trace.error}
            </div>
          )}
          {trace.toolCalls && trace.toolCalls.length > 0 && (
            <div>
              <span className="text-muted-foreground">Tool Calls: </span>
              {trace.toolCalls.map((tc) => (
                <Badge key={tc.id} variant="outline" className="text-[10px] mr-1">
                  {tc.toolName}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ToolCallItem({ trace }: { trace: ToolCallTrace }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const statusIcon = {
    pending: <Activity className="h-3 w-3 text-yellow-500 animate-pulse" />,
    success: <CheckCircle2 className="h-3 w-3 text-green-500" />,
    error: <XCircle className="h-3 w-3 text-red-500" />,
  }[trace.status]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer text-sm">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {statusIcon}
          <span className="font-mono flex-1 truncate">{trace.toolName}</span>
          <span className="text-[10px] text-muted-foreground">
            {trace.duration ? `${trace.duration}ms` : "..."}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-5 mt-1 p-2 text-xs space-y-2 border-l-2 border-muted font-mono">
          <div>
            <span className="text-muted-foreground">Agent: </span>
            <span>{trace.agentName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Params: </span>
            <pre className="mt-1 p-1 bg-muted rounded text-[10px] overflow-x-auto">
              {JSON.stringify(trace.params, null, 2)}
            </pre>
          </div>
          {trace.result && (
            <div>
              <span className="text-muted-foreground">Result: </span>
              <pre className="mt-1 p-1 bg-muted rounded text-[10px] overflow-x-auto max-h-24">
                {JSON.stringify(trace.result, null, 2)}
              </pre>
            </div>
          )}
          {trace.error && (
            <div className="text-red-500">
              <span className="text-muted-foreground">Error: </span>
              {trace.error}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function LogEntry({ log }: { log: DebugLog }) {
  const levelColors = {
    info: "text-blue-500",
    warn: "text-yellow-500",
    error: "text-red-500",
    debug: "text-gray-400",
  }

  const levelIcons = {
    info: <Activity className="h-3 w-3" />,
    warn: <AlertCircle className="h-3 w-3" />,
    error: <XCircle className="h-3 w-3" />,
    debug: <Bug className="h-3 w-3" />,
  }

  return (
    <div className="flex items-start gap-2 text-xs py-1 font-mono">
      <span className="text-muted-foreground text-[10px] w-16 shrink-0">
        {new Date(log.timestamp).toLocaleTimeString()}
      </span>
      <span className={cn("shrink-0", levelColors[log.level])}>
        {levelIcons[log.level]}
      </span>
      <span className="text-muted-foreground shrink-0">[{log.source}]</span>
      <span className="flex-1 break-words">{log.message}</span>
    </div>
  )
}

function DebugSection() {
  const {
    isDebugging,
    setDebugging,
    agentTraces,
    toolCallTraces,
    logs,
    clearAll,
  } = useSessionDebugStore()

  const [activeDebugTab, setActiveDebugTab] = useState<"agents" | "tools" | "logs">("agents")

  return (
    <div className="flex flex-col h-full">
      {/* Debug Controls */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-500" />
            Debug Console
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearAll}
              title="Clear all"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant={isDebugging ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setDebugging(!isDebugging)}
            >
              {isDebugging ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sub-tabs for debug views */}
        <div className="flex gap-1">
          {[
            { id: "agents" as const, label: "Agents", count: agentTraces.length },
            { id: "tools" as const, label: "Tools", count: toolCallTraces.length },
            { id: "logs" as const, label: "Logs", count: logs.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDebugTab(tab.id)}
              className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors",
                activeDebugTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-[10px] opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Debug Content */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {activeDebugTab === "agents" && (
            agentTraces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No agent traces yet</p>
                <p className="text-xs mt-1">Start debugging to capture agent activity</p>
              </div>
            ) : (
              agentTraces.map((trace) => (
                <AgentTraceItem key={trace.id} trace={trace} />
              ))
            )
          )}

          {activeDebugTab === "tools" && (
            toolCallTraces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Cpu className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No tool calls yet</p>
                <p className="text-xs mt-1">Tool executions will appear here</p>
              </div>
            ) : (
              toolCallTraces.map((trace) => (
                <ToolCallItem key={trace.id} trace={trace} />
              ))
            )
          )}

          {activeDebugTab === "logs" && (
            logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No logs yet</p>
                <p className="text-xs mt-1">Debug messages will appear here</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {logs.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </div>
            )
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function SessionInfoTabs<T extends GenericSession = GenericSession>({
  session,
  tabs = DEFAULT_TABS,
  defaultTab = "overview",
  onClose,
  onDelete,
  onExport,
  onShare,
  onKnowledgeToggle,
  knowledgeEnabled,
  className,
  showCloseButton = true,
  compact = true,
}: SessionInfoPanelProps<T>) {
  const [activeTab, setActiveTab] = useState<SessionInfoTab>(defaultTab)

  // Filter to only enabled tabs
  const enabledTabs = tabs.filter((t) => TAB_CONFIG[t])

  // Empty state
  if (!session) {
    return (
      <div className={cn("flex flex-col h-full bg-background/60 border-l", className)}>
        <div className="flex-shrink-0 border-b bg-muted/30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Session Info</span>
            </div>
            {showCloseButton && onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">Select a session to view details</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection session={session} />
      case "content":
        return <ContentSection session={session} />
      case "settings":
        return <SettingsSection onDelete={onDelete} />
      case "knowledge":
        return <KnowledgeSection knowledgeEnabled={knowledgeEnabled} onKnowledgeToggle={onKnowledgeToggle} />
      case "export":
        return <ExportSection onExport={onExport} onShare={onShare} />
      case "debug":
        return <DebugSection />
      default:
        return <OverviewSection session={session} />
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-background/60 border-l", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Session Info</span>
          </div>
          {showCloseButton && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content with tab navigation */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Navigation sidebar - icon only in compact mode */}
        <div className={cn(
          "flex-shrink-0 border-r border-border bg-muted/20 py-2 flex flex-col items-center gap-1",
          compact ? "w-12" : "w-36 px-2"
        )}>
          {enabledTabs.map((tabId) => {
            const config = TAB_CONFIG[tabId]
            const Icon = config.icon
            return (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                title={config.label}
                className={cn(
                  "flex items-center justify-center rounded-lg transition-colors",
                  compact ? "w-9 h-9" : "w-full gap-2 p-2.5 text-left",
                  activeTab === tabId
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!compact && <span className="font-medium text-sm">{config.label}</span>}
              </button>
            )
          })}
        </div>

        {/* Content area */}
        <ScrollArea className="flex-1">
          {renderContent()}
        </ScrollArea>
      </div>
    </div>
  )
}

export default SessionInfoTabs
