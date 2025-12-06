/**
 * AI Detail View - Refactored with AI Elements
 * 
 * Uses shadcn.io AI Elements for ChatGPT-style interface:
 * - Message, MessageContent, AIMessageAvatar, UserMessageAvatar
 * - Response (streaming markdown)
 * - Conversation, ConversationContent, ConversationScrollButton
 * - PromptInput, PromptInputTextarea, PromptInputSubmit
 * - ActionWithFeedback (with click feedback)
 * - Branch, BranchMessages, BranchSelector (for regenerate)
 * - Loader, Suggestion
 * 
 * Integrates with Convex for data persistence and Clerk for user avatars
 */

"use client"

import { useState, useCallback, useMemo } from "react"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"



// Grok-style UI components
import {
  GrokUserMessage,
  GrokAIMessage,
  GrokTypingIndicator,
  GrokChatContainer,
  GrokInput,
} from "@/frontend/shared/communications/components/grok-chat"

// AI Elements imports - for PromptInput and Response rendering
import {
  Response,
  type ChatStatus,
} from "@/frontend/shared/communications/components/ai"

// Feature imports
import { useAIStore } from "./stores"
import { useAIActions } from "./hooks"
import { useAIKnowledgeContext } from "./hooks/useAIKnowledgeContext"
import { useAISettingsStorage } from "./settings/useAISettings"
import { useIsMobile } from "@/hooks/use-mobile"
import { DEFAULT_SUGGESTIONS, DEFAULT_PROVIDER, DEFAULT_MODEL_ID } from "./constants"
import { AIChatHeader } from "./components/AIChatHeader"
import { generateAISuggestions } from "./utils/suggestions"
interface AIDetailViewProps {
  chatId?: string
  onBack?: () => void
}




export function AIDetailView({ chatId: externalChatId, onBack }: AIDetailViewProps) {
  const [message, setMessage] = useState("")
  const [messageBranches, setMessageBranches] = useState<Record<string, Array<{ id: string; content: string; timestamp: number }>>>({})
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const isMobile = useIsMobile()
  
  // AI settings for API calls
  const { settings } = useAISettingsStorage()

  // Zustand store
  const selectedSession = useAIStore((s) => s.selectedSession)
  const storeSelectedSessionId = useAIStore((s) => s.selectedSessionId)
  const isSending = useAIStore((s) => s.isSending)
  const isLoading = useAIStore((s) => s.isLoading)
  const knowledgeEnabled = useAIStore((s) => s.knowledgeEnabled)
  const setKnowledgeEnabled = useAIStore((s) => s.setKnowledgeEnabled)
  const updateSession = useAIStore((s) => s.updateSession)
  const { sendMessage: sendAIMessage, createSession, selectSession, regenerateMessage, submitFeedback, updateSessionMetadata } = useAIActions()

  // Knowledge context
  const { knowledgeContext } = useAIKnowledgeContext()

  // Use external or store chatId
  const chatId = externalChatId ?? storeSelectedSessionId
  const messages = selectedSession?.messages ?? []

  // Chat status for PromptInputSubmit
  const status: ChatStatus = useMemo(() => {
    if (isSending) return "streaming"
    return "ready"
  }, [isSending])

  const handleAttach = useCallback((files: FileList) => {
    setAttachments(prev => [...prev, ...Array.from(files)])
    toast.success(`${files.length} file(s) attached`)
  }, [])

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleReply = useCallback((content: string) => {
    setReplyingTo(content)
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  const handleListen = useCallback((content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content)
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("Text-to-speech not supported in this browser")
    }
  }, [])

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return

    const contextToUse = knowledgeEnabled ? knowledgeContext : undefined
    
    // Handle attachments (mock for now)
    let finalMessage = message
    
    // Handle reply context
    if (replyingTo) {
      const quote = `> ${replyingTo.substring(0, 200)}${replyingTo.length > 200 ? '...' : ''}\n\n`
      finalMessage = `${quote}${finalMessage}`
    }

    if (attachments.length > 0) {
      const fileNames = attachments.map(f => f.name).join(", ")
      finalMessage = `${finalMessage}\n\n[Attached: ${fileNames}]`
      // In a real app, we would upload these files first
    }

    // If no session, create one first
    if (!chatId) {
      const session = await createSession("New Chat")
      if (session) {
        selectSession(session._id)
        await sendAIMessage(finalMessage, contextToUse, session._id, {
          attachments: attachments.map(f => ({
            id: Math.random().toString(36).substring(2, 15),
            name: f.name,
            type: f.type,
            url: "", // Placeholder
            size: f.size,
          })),
          replyTo: replyingTo || undefined,
        })
        setMessage("")
        setAttachments([])
        setReplyingTo(null)
      }
      return
    }

    await sendAIMessage(finalMessage, contextToUse, undefined, {
      attachments: attachments.map(f => ({
        id: Math.random().toString(36).substring(2, 15),
        name: f.name,
        type: f.type,
        url: "", // Placeholder
        size: f.size,
      })),
      replyTo: replyingTo || undefined,
    })
    setMessage("")
    setAttachments([])
    setReplyingTo(null)
  }, [message, attachments, replyingTo, chatId, knowledgeEnabled, knowledgeContext, createSession, selectSession, sendAIMessage])

  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }, [])

  const handleThumbsUp = useCallback((messageId?: string) => {
    if (chatId && messageId) {
      submitFeedback(chatId as any, messageId, "up")
      toast.success("Thanks for the feedback!")
    }
  }, [chatId, submitFeedback])

  const handleThumbsDown = useCallback((messageId?: string) => {
    if (chatId && messageId) {
      submitFeedback(chatId as any, messageId, "down")
      toast.info("Thanks for the feedback. We'll improve!")
    }
  }, [chatId, submitFeedback])

  // Regenerate creates a new branch - calls API directly without adding new message
  const handleRegenerate = useCallback(async (originalMessageId: string, originalContent: string) => {
    if (!selectedSession?.messages.length) return
    
    setIsRegenerating(true)
    try {
      const userMessages = selectedSession.messages.filter(m => m.role === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]
      
      if (!lastUserMessage) return

      // Get AI settings for direct API call
      const provider = settings?.defaultProvider || DEFAULT_PROVIDER
      const model = settings?.defaultModel || DEFAULT_MODEL_ID
      const apiKeyConfig = settings?.apiKeys?.find(
        (k: any) => k.providerId === provider && k.isEnabled
      )

      if (!apiKeyConfig?.apiKey && provider !== "ollama") {
        toast.error(`No API key configured for ${provider}`)
        return
      }

      // Build messages array for regeneration (without adding new user message)
      const systemMessages: { role: 'system'; content: string }[] = []
      if (knowledgeEnabled && knowledgeContext) {
        systemMessages.push({
          role: 'system',
          content: `You have access to the following knowledge:\n\n${knowledgeContext}`,
        })
      }

      // Find the index of the message being regenerated
      const msgIndex = selectedSession.messages.findIndex(m => m.id === originalMessageId)
      // Get all messages up to and including the user message before this AI response
      const messagesBeforeThis = selectedSession.messages.slice(0, msgIndex).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const messages = [
        ...systemMessages,
        ...messagesBeforeThis,
      ]

      // Call AI API directly for regeneration (no persistence)
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          provider,
          model,
          apiKey: apiKeyConfig?.apiKey || "",
          baseUrl: apiKeyConfig?.baseUrl,
          temperature: (settings?.temperature || 0.7) + 0.1, // Slightly higher temp for variation
          maxTokens: parseInt(settings?.maxTokens || "2048"),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      const responseContent = data.content || "Failed to regenerate"
      
      // Add to branches for this message (local state only, no new message added)
      setMessageBranches(prev => {
        const existing = prev[originalMessageId] || [
          { id: originalMessageId, content: originalContent, timestamp: Date.now() }
        ]
        return {
          ...prev,
          [originalMessageId]: [
            ...existing,
            { id: `branch-${Date.now()}`, content: responseContent, timestamp: Date.now() }
          ]
        }
      })

      // Persist to Convex
      if (chatId) {
        await regenerateMessage(chatId as any, originalMessageId, responseContent)
      }
      
      toast.success("Response regenerated as new branch")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to regenerate"
      toast.error(errorMessage)
    } finally {
      setIsRegenerating(false)
    }
  }, [selectedSession, knowledgeEnabled, knowledgeContext, settings])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setMessage(suggestion)
  }, [])

  const handleIconChange = useCallback(async (icon: string) => {
    if (chatId && updateSessionMetadata) {
      await updateSessionMetadata(chatId as any, { icon })
      toast.success("Icon updated")
    }
  }, [chatId, updateSessionMetadata])

  // Generate AI suggestions when last message changes
  const generateSuggestionsForMessage = useCallback(async (content: string) => {
    if (isGeneratingSuggestions) return
    
    setIsGeneratingSuggestions(true)
    try {
      const provider = settings.defaultProvider || "groq"
      const model = settings.defaultModel || "llama-3.3-70b-versatile"
      const apiKeyConfig = settings.apiKeys?.find(
        k => k.providerId === provider && k.isEnabled
      )
      
      if (!apiKeyConfig?.apiKey && provider !== "ollama") {
        // Fallback to static suggestions if no API key
        setAiSuggestions([])
        return
      }

      const suggestions = await generateAISuggestions(content, {
        provider,
        model,
        apiKey: apiKeyConfig?.apiKey || "",
        baseUrl: apiKeyConfig?.baseUrl,
        conversationContext: messages.slice(-3).map(m => m.content)
      })
      
      setAiSuggestions(suggestions)
    } catch (error) {
      console.error("Failed to generate suggestions:", error)
      setAiSuggestions([])
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }, [settings, messages, isGeneratingSuggestions])

  // Empty state - no conversation selected (Grok style)
  if (!chatId) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-background">
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="text-center max-w-lg p-4">
            <div className="text-foreground text-2xl font-medium mb-2">
              How can AI help?
            </div>
            <p className="text-muted-foreground text-sm mb-8">
              Ask anything. Get answers, ideas, and assistance.
            </p>
            
            {/* Suggestions - Grok style */}
            <div className="space-y-3">
              {DEFAULT_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground text-sm"
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input - Grok style */}
        <GrokInput
          value={message}
          onChange={setMessage}
          onSubmit={() => {
            if (message.trim() || attachments.length > 0) {
              handleSendMessage({ preventDefault: () => {} } as React.FormEvent)
            }
          }}
          placeholder="How can AI help?"
          disabled={isSending}
          thinkHarder={knowledgeEnabled}
          onThinkHarderChange={setKnowledgeEnabled}
          model="Auto"
          onAttach={handleAttach}
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    )
  }

  // Loading state
  if (isLoading && !selectedSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // No messages yet - new conversation (Grok style)
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-background">
        {/* Header */}
        <AIChatHeader
          session={selectedSession}
          knowledgeEnabled={knowledgeEnabled}
          onKnowledgeToggle={setKnowledgeEnabled}
          onIconChange={handleIconChange}
          onBack={onBack}
        />

        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="text-center max-w-lg">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium text-foreground mb-2">Start a conversation</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ask a question or start with a suggestion below.
            </p>
            
            {/* Suggestions */}
            <div className="space-y-3">
              {DEFAULT_SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground text-sm"
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input - Grok style */}
        <GrokInput
          value={message}
          onChange={setMessage}
          onSubmit={() => {
            if (message.trim() || attachments.length > 0) {
              handleSendMessage({ preventDefault: () => {} } as React.FormEvent)
            }
          }}
          placeholder="How can AI help?"
          disabled={isSending}
          thinkHarder={knowledgeEnabled}
          onThinkHarderChange={setKnowledgeEnabled}
          model="Auto"
          onAttach={handleAttach}
          attachments={attachments}
          onRemoveAttachment={handleRemoveAttachment}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    )
  }

  // Main conversation view - Grok style
  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Header */}
      <AIChatHeader
        session={selectedSession}
        knowledgeEnabled={knowledgeEnabled}
        onKnowledgeToggle={setKnowledgeEnabled}
        onIconChange={handleIconChange}
        onBack={onBack}
      />

      {/* Messages area - Grok style */}
      <GrokChatContainer>
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user'
          const isLastAIMessage = !isUser && index === messages.length - 1
          const msgId = msg.id || `msg-${index}`
          const branches = messageBranches[msgId]

          if (isUser) {
            return (
              <GrokUserMessage key={msgId}>
                {msg.content}
              </GrokUserMessage>
            )
          }

          // Use AI-generated suggestions for the last AI message, or fallback to simple context-aware ones
          const followUpSuggestions = isLastAIMessage 
            ? (aiSuggestions.length > 0 ? aiSuggestions : undefined)
            : undefined
          
          // Trigger AI suggestion generation for last message if not already generated
          if (isLastAIMessage && aiSuggestions.length === 0 && !isGeneratingSuggestions && !isSending) {
            // Use setTimeout to avoid calling during render
            setTimeout(() => generateSuggestionsForMessage(msg.content), 100)
          }

          const duration = msg.metadata?.duration ? msg.metadata.duration / 1000 : undefined

          return (
            <GrokAIMessage
              key={msgId}
              responseTime={duration}
              speedLabel={duration && duration < 2 ? "Fast" : "Normal"}
              branches={branches}
              onRegenerate={() => handleRegenerate(msgId, msg.content)}
              onReply={() => handleReply(msg.content)}
              onListen={() => handleListen(msg.content)}
              onShare={() => {
                navigator.clipboard.writeText(msg.content)
                toast.success("Copied to clipboard")
              }}
              onThumbsUp={() => handleThumbsUp(msgId)}
              onThumbsDown={() => handleThumbsDown(msgId)}
              onMore={() => toast.info("Report issue feature coming soon")}
              feedback={msg.feedback}
              suggestions={followUpSuggestions}
              onSuggestionClick={handleSuggestionClick}
              isRegenerating={isRegenerating}
              reasoning={msg.reasoning}
              isStreamingReasoning={isLastAIMessage && isSending}
            >
              <Response>{msg.content}</Response>
            </GrokAIMessage>
          )
        })}

        {/* Typing indicator */}
        {isSending && <GrokTypingIndicator />}
      </GrokChatContainer>

      {/* Input - Grok style */}
      <GrokInput
        value={message}
        onChange={setMessage}
        onSubmit={() => {
          if (message.trim() || attachments.length > 0) {
            handleSendMessage({ preventDefault: () => {} } as React.FormEvent)
          }
        }}
        placeholder="How can AI help?"
        disabled={isSending}
        thinkHarder={knowledgeEnabled}
        onThinkHarderChange={setKnowledgeEnabled}
        model="Auto"
        onAttach={handleAttach}
        attachments={attachments}
        onRemoveAttachment={handleRemoveAttachment}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    </div>
  )
}





export default AIDetailView
