"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, Minus, Maximize2, Minimize2, GripHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============================================================================
// Types
// ============================================================================

export interface FloatingPanelPosition {
  x: number
  y: number
}

export interface FloatingPanelSize {
  width: number
  height: number
}

export interface FloatingPanelConfig {
  id: string
  title: string
  icon?: React.ReactNode
  content: React.ReactNode
  /** Initial position */
  defaultPosition?: FloatingPanelPosition
  /** Initial size */
  defaultSize?: FloatingPanelSize
  /** Minimum size constraints */
  minSize?: FloatingPanelSize
  /** Maximum size constraints */
  maxSize?: FloatingPanelSize
  /** Whether the panel can be resized */
  resizable?: boolean
  /** Whether the panel can be minimized */
  minimizable?: boolean
  /** Whether the panel can be maximized */
  maximizable?: boolean
  /** Whether the panel can be closed */
  closable?: boolean
  /** Z-index for stacking */
  zIndex?: number
}

export interface FloatingPanelProps extends FloatingPanelConfig {
  /** Whether the panel is currently open */
  isOpen: boolean
  /** Called when the panel should close */
  onClose?: () => void
  /** Called when position changes */
  onPositionChange?: (position: FloatingPanelPosition) => void
  /** Called when size changes */
  onSizeChange?: (size: FloatingPanelSize) => void
  /** Called when the panel is focused */
  onFocus?: () => void
  /** Additional className */
  className?: string
}

// ============================================================================
// Floating Panel Component
// ============================================================================

/**
 * FloatingPanel Component
 * 
 * A draggable, resizable floating panel that can be positioned anywhere
 * in the viewport. Supports minimize, maximize, and close operations.
 * 
 * @example
 * ```tsx
 * <FloatingPanel
 *   id="inspector"
 *   title="Inspector"
 *   isOpen={true}
 *   content={<InspectorContent />}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function FloatingPanel({
  id,
  title,
  icon,
  content,
  isOpen,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 300 },
  minSize = { width: 200, height: 150 },
  maxSize,
  resizable = true,
  minimizable = true,
  maximizable = true,
  closable = true,
  zIndex = 50,
  onClose,
  onPositionChange,
  onSizeChange,
  onFocus,
  className,
}: FloatingPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<FloatingPanelPosition>(defaultPosition)
  const [size, setSize] = React.useState<FloatingPanelSize>(defaultSize)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isResizing, setIsResizing] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [preMaximizeState, setPreMaximizeState] = React.useState<{
    position: FloatingPanelPosition
    size: FloatingPanelSize
  } | null>(null)

  const dragOffset = React.useRef({ x: 0, y: 0 })
  const resizeStart = React.useRef({ x: 0, y: 0, width: 0, height: 0 })

  // Handle drag start
  const handleDragStart = React.useCallback((e: React.MouseEvent) => {
    if (isMaximized) return
    
    e.preventDefault()
    setIsDragging(true)
    onFocus?.()
    
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }, [isMaximized, position, onFocus])

  // Handle drag
  React.useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      }
      setPosition(newPosition)
      onPositionChange?.(newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onPositionChange])

  // Handle resize start
  const handleResizeStart = React.useCallback((e: React.MouseEvent) => {
    if (!resizable || isMaximized) return
    
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    onFocus?.()
    
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    }
  }, [resizable, isMaximized, size, onFocus])

  // Handle resize
  React.useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.current.x
      const deltaY = e.clientY - resizeStart.current.y
      
      let newWidth = resizeStart.current.width + deltaX
      let newHeight = resizeStart.current.height + deltaY
      
      // Apply constraints
      newWidth = Math.max(minSize.width, newWidth)
      newHeight = Math.max(minSize.height, newHeight)
      
      if (maxSize) {
        newWidth = Math.min(maxSize.width, newWidth)
        newHeight = Math.min(maxSize.height, newHeight)
      }
      
      const newSize = { width: newWidth, height: newHeight }
      setSize(newSize)
      onSizeChange?.(newSize)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, minSize, maxSize, onSizeChange])

  // Handle minimize
  const handleMinimize = React.useCallback(() => {
    setIsMinimized((prev) => !prev)
    if (isMaximized) {
      setIsMaximized(false)
      if (preMaximizeState) {
        setPosition(preMaximizeState.position)
        setSize(preMaximizeState.size)
        setPreMaximizeState(null)
      }
    }
  }, [isMaximized, preMaximizeState])

  // Handle maximize
  const handleMaximize = React.useCallback(() => {
    if (isMaximized) {
      // Restore
      if (preMaximizeState) {
        setPosition(preMaximizeState.position)
        setSize(preMaximizeState.size)
        setPreMaximizeState(null)
      }
      setIsMaximized(false)
    } else {
      // Maximize
      setPreMaximizeState({ position, size })
      setPosition({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight })
      setIsMaximized(true)
    }
    setIsMinimized(false)
  }, [isMaximized, position, size, preMaximizeState])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bg-background border rounded-lg shadow-xl overflow-hidden",
        "flex flex-col",
        isDragging && "cursor-grabbing select-none",
        isMaximized && "rounded-none",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isMaximized ? "100vw" : size.width,
        height: isMinimized ? "auto" : isMaximized ? "100vh" : size.height,
        zIndex,
      }}
      onClick={onFocus}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 h-10",
          "bg-muted/50 border-b",
          !isMaximized && "cursor-grab",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="text-sm font-medium truncate">{title}</span>
        </div>
        
        <div className="flex items-center gap-0.5">
          {minimizable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleMinimize}
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
          {maximizable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleMaximize}
            >
              {isMaximized ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          )}
          {closable && onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-destructive/20"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto">
          {content}
        </div>
      )}

      {/* Resize Handle */}
      {resizable && !isMinimized && !isMaximized && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-4 h-4",
            "cursor-se-resize",
            "hover:bg-primary/20 rounded-tl"
          )}
          onMouseDown={handleResizeStart}
        >
          <svg
            className="w-full h-full text-muted-foreground/50"
            viewBox="0 0 16 16"
          >
            <path
              d="M14 14H10M14 14V10M14 14L8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Floating Panel Manager Hook
// ============================================================================

export interface FloatingPanelState extends FloatingPanelConfig {
  isOpen: boolean
  position: FloatingPanelPosition
  size: FloatingPanelSize
}

export interface UseFloatingPanelsReturn {
  panels: FloatingPanelState[]
  openPanel: (config: FloatingPanelConfig) => void
  closePanel: (panelId: string) => void
  togglePanel: (panelId: string) => void
  bringToFront: (panelId: string) => void
  updatePanel: (panelId: string, updates: Partial<FloatingPanelState>) => void
  closeAllPanels: () => void
}

/**
 * Hook for managing multiple floating panels
 */
export function useFloatingPanels(): UseFloatingPanelsReturn {
  const [panels, setPanels] = React.useState<FloatingPanelState[]>([])
  const [maxZIndex, setMaxZIndex] = React.useState(50)

  const openPanel = React.useCallback((config: FloatingPanelConfig) => {
    setPanels((prev) => {
      const existing = prev.find((p) => p.id === config.id)
      if (existing) {
        // Just bring to front if already exists
        return prev.map((p) =>
          p.id === config.id
            ? { ...p, isOpen: true, zIndex: maxZIndex + 1 }
            : p
        )
      }
      
      return [
        ...prev,
        {
          ...config,
          isOpen: true,
          position: config.defaultPosition || { x: 100 + prev.length * 30, y: 100 + prev.length * 30 },
          size: config.defaultSize || { width: 400, height: 300 },
          zIndex: maxZIndex + 1,
        },
      ]
    })
    setMaxZIndex((z) => z + 1)
  }, [maxZIndex])

  const closePanel = React.useCallback((panelId: string) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === panelId ? { ...p, isOpen: false } : p))
    )
  }, [])

  const togglePanel = React.useCallback((panelId: string) => {
    setPanels((prev) =>
      prev.map((p) =>
        p.id === panelId ? { ...p, isOpen: !p.isOpen } : p
      )
    )
  }, [])

  const bringToFront = React.useCallback((panelId: string) => {
    setPanels((prev) =>
      prev.map((p) =>
        p.id === panelId ? { ...p, zIndex: maxZIndex + 1 } : p
      )
    )
    setMaxZIndex((z) => z + 1)
  }, [maxZIndex])

  const updatePanel = React.useCallback(
    (panelId: string, updates: Partial<FloatingPanelState>) => {
      setPanels((prev) =>
        prev.map((p) => (p.id === panelId ? { ...p, ...updates } : p))
      )
    },
    []
  )

  const closeAllPanels = React.useCallback(() => {
    setPanels((prev) => prev.map((p) => ({ ...p, isOpen: false })))
  }, [])

  return {
    panels,
    openPanel,
    closePanel,
    togglePanel,
    bringToFront,
    updatePanel,
    closeAllPanels,
  }
}
