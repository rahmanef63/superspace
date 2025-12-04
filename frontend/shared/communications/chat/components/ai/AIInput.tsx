/**
 * AI Input Component
 * Chat input for AI conversations with command support
 * @module shared/communications/chat/components/ai/AIInput
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, Loader2, Paperclip, Sparkles, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AIConfig, KnowledgeSourceType } from "../../types/ai";

export interface AIInputProps {
  onSend: (message: string) => void;
  onCommand?: (command: string, args: string[]) => void;
  onKnowledgeToggle?: (enabled: boolean) => void;
  config?: AIConfig;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  knowledgeEnabled?: boolean;
  hasKnowledge?: boolean;
  className?: string;
}

/**
 * AI-specific input component with command support
 */
export function AIInput({
  onSend,
  onCommand,
  onKnowledgeToggle,
  config,
  isSending = false,
  disabled = false,
  placeholder = "Ask AI anything...",
  knowledgeEnabled = false,
  hasKnowledge = false,
  className,
}: AIInputProps) {
  const [message, setMessage] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || isSending || disabled) return;

    // Check for commands
    if (trimmed.startsWith("/") && onCommand) {
      const parts = trimmed.slice(1).split(" ");
      const cmd = parts[0];
      const args = parts.slice(1);
      onCommand(cmd, args);
      setMessage("");
      return;
    }

    onSend(trimmed);
    setMessage("");
    setShowCommands(false);
  }, [message, isSending, disabled, onSend, onCommand]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Show commands on /
    if (e.key === "/" && message === "") {
      setShowCommands(true);
    }

    // Hide commands on Escape
    if (e.key === "Escape") {
      setShowCommands(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Show/hide command menu
    if (value.startsWith("/") && value.length <= 1) {
      setShowCommands(true);
    } else if (!value.startsWith("/")) {
      setShowCommands(false);
    }
  };

  const selectCommand = (cmd: string) => {
    setMessage(`/${cmd} `);
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  const commands = config?.aiCommands || [
    "help",
    "clear",
    "summarize",
    "explain",
    "code",
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Knowledge indicator */}
      {knowledgeEnabled && hasKnowledge && (
        <div className="absolute -top-6 left-0 right-0">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            AI has access to your knowledge base
          </div>
        </div>
      )}

      {/* Command menu */}
      {showCommands && commands.length > 0 && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg p-2 z-10">
          <div className="text-xs text-muted-foreground mb-2 px-2">
            Commands
          </div>
          <div className="space-y-1">
            {commands.map((cmd) => (
              <button
                key={cmd}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-center gap-2"
                onClick={() => selectCommand(cmd)}
              >
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span>/{cmd}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 bg-card rounded-lg border border-border p-2">
        {/* Accessories */}
        <div className="flex items-center gap-1">
          {config?.allowAttachments && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    disabled={disabled || isSending}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {config?.knowledgeEnabled !== false && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={knowledgeEnabled ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      knowledgeEnabled
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onKnowledgeToggle?.(!knowledgeEnabled)}
                    disabled={disabled || isSending}
                  >
                    <Book className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {knowledgeEnabled
                    ? "Disable knowledge base"
                    : "Enable knowledge base"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="flex-1 min-h-[40px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          rows={1}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled}
          size="icon"
          className="h-8 w-8 flex-shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Helper text */}
      <div className="mt-1 text-xs text-muted-foreground text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}

export default AIInput;
