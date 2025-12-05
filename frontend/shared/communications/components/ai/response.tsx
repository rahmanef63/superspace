"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string | React.ReactNode
  /**
   * Allowed image URL prefixes for security
   */
  allowedImagePrefixes?: string[]
  /**
   * Allowed link URL prefixes for security
   */
  allowedLinkPrefixes?: string[]
  /**
   * Default origin for relative URLs
   */
  defaultOrigin?: string
  /**
   * Enable intelligent streaming parsing (auto-complete incomplete formatting)
   */
  parseIncompleteMarkdown?: boolean
}

/**
 * Parses incomplete markdown during streaming by auto-completing formatting tokens
 */
function parseIncompleteMarkdownContent(content: string): string {
  if (typeof content !== "string") return content

  let result = content
  
  // Count unclosed formatting tokens and close them
  const formatters = [
    { pattern: /\*\*/g, token: "**" },
    { pattern: /(?<!\*)\*(?!\*)/g, token: "*" },
    { pattern: /~~/g, token: "~~" },
    { pattern: /(?<!`)`(?!`)/g, token: "`" },
  ]

  for (const { pattern, token } of formatters) {
    const matches = result.match(pattern)
    if (matches && matches.length % 2 !== 0) {
      result += token
    }
  }

  // Hide incomplete links and images
  result = result.replace(/\[([^\]]*?)(?:\([^)]*)?$/g, "")
  result = result.replace(/!\[([^\]]*?)(?:\([^)]*)?$/g, "")

  return result
}

/**
 * Simple markdown-like parser for basic formatting
 */
function parseSimpleMarkdown(content: string): React.ReactNode[] {
  if (!content) return []

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  lines.forEach((line, lineIndex) => {
    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${lineIndex}`} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>)
      return
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${lineIndex}`} className="text-xl font-semibold mt-4 mb-2">{line.slice(3)}</h2>)
      return
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={`h1-${lineIndex}`} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>)
      return
    }

    // Code blocks (simple)
    if (line.startsWith('```')) {
      return // Skip code fence markers
    }

    // Bullet lists
    if (line.match(/^[\-\*]\s/)) {
      elements.push(
        <li key={`li-${lineIndex}`} className="ml-4 list-disc">
          {parseInlineFormatting(line.slice(2))}
        </li>
      )
      return
    }

    // Numbered lists
    if (line.match(/^\d+\.\s/)) {
      const text = line.replace(/^\d+\.\s/, '')
      elements.push(
        <li key={`li-${lineIndex}`} className="ml-4 list-decimal">
          {parseInlineFormatting(text)}
        </li>
      )
      return
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<br key={`br-${lineIndex}`} />)
      return
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${lineIndex}`} className="my-1">
        {parseInlineFormatting(line)}
      </p>
    )
  })

  return elements
}

/**
 * Parse inline formatting like bold, italic, code, links
 */
function parseInlineFormatting(text: string): React.ReactNode {
  // This is a simplified version - for full markdown support, install react-markdown
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  // Process inline code first
  while (remaining.includes('`')) {
    const codeMatch = remaining.match(/`([^`]+)`/)
    if (codeMatch) {
      const beforeCode = remaining.slice(0, codeMatch.index)
      if (beforeCode) parts.push(processBasicFormatting(beforeCode, key++))
      parts.push(
        <code key={key++} className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice((codeMatch.index ?? 0) + codeMatch[0].length)
    } else {
      break
    }
  }

  if (remaining) {
    parts.push(processBasicFormatting(remaining, key++))
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

function processBasicFormatting(text: string, baseKey: number): React.ReactNode {
  // Process bold
  let result: React.ReactNode = text
  const boldMatch = text.match(/\*\*([^*]+)\*\*/)
  if (boldMatch) {
    const before = text.slice(0, boldMatch.index)
    const after = text.slice((boldMatch.index ?? 0) + boldMatch[0].length)
    return (
      <>
        {before}
        <strong key={baseKey}>{boldMatch[1]}</strong>
        {after && processBasicFormatting(after, baseKey + 1)}
      </>
    )
  }

  // Process italic
  const italicMatch = text.match(/(?<!\*)\*([^*]+)\*(?!\*)/)
  if (italicMatch) {
    const before = text.slice(0, italicMatch.index)
    const after = text.slice((italicMatch.index ?? 0) + italicMatch[0].length)
    return (
      <>
        {before}
        <em key={baseKey}>{italicMatch[1]}</em>
        {after && processBasicFormatting(after, baseKey + 1)}
      </>
    )
  }

  // Process links
  const linkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (linkMatch) {
    const before = text.slice(0, linkMatch.index)
    const after = text.slice((linkMatch.index ?? 0) + linkMatch[0].length)
    return (
      <>
        {before}
        <a
          key={baseKey}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {linkMatch[1]}
        </a>
        {after && processBasicFormatting(after, baseKey + 1)}
      </>
    )
  }

  return result
}

/**
 * Response - Streaming-optimized markdown renderer for AI-generated content
 * 
 * Features:
 * - Auto-completes incomplete formatting during streaming
 * - Hides broken links until complete
 * - Basic markdown support (bold, italic, code, links, headers, lists)
 * 
 * Note: For full markdown support with syntax highlighting, install:
 * - react-markdown
 * - remark-gfm
 * - react-syntax-highlighter
 */
function Response({
  children,
  className,
  allowedImagePrefixes = ["*"],
  allowedLinkPrefixes = ["*"],
  defaultOrigin,
  parseIncompleteMarkdown = true,
  ...props
}: ResponseProps) {
  if (typeof children !== "string") {
    return (
      <div data-slot="response" className={cn("prose dark:prose-invert prose-sm max-w-none", className)} {...props}>
        {children}
      </div>
    )
  }

  const content = parseIncompleteMarkdown 
    ? parseIncompleteMarkdownContent(children) 
    : children

  return (
    <div data-slot="response" className={cn("prose dark:prose-invert prose-sm max-w-none", className)} {...props}>
      {parseSimpleMarkdown(content)}
    </div>
  )
}

export { Response, parseIncompleteMarkdownContent }
export type { ResponseProps }
