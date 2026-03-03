import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
  tools?: any[]
  tool_choice?: any
  // Z.AI (GLM) supports OpenAI-compatible fields plus vendor extensions like `thinking`.
  // Only forwarded for providers that support it.
  thinking?: any
}

// Request timeout in milliseconds (30 seconds)
const REQUEST_TIMEOUT = 30000

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "")
}

function findInvalidHeaderValueChar(value: string): { index: number; code: number } | null {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code > 0xff || code < 0x20 || code === 0x7f) {
      return { index: i, code }
    }
  }
  return null
}

const ALLOWED_DOMAINS = [
  "api.groq.com", "api.openai.com", "api.anthropic.com", "api.together.xyz",
  "api.fireworks.ai", "api.perplexity.ai", "api.deepseek.com", "api.mistral.ai",
  "api.x.ai", "localhost", "127.0.0.1", "generativelanguage.googleapis.com",
  "api.cohere.ai", "api.z.ai", "openrouter.ai"
];

function isUrlAllowed(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return ALLOWED_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Create a fetch request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Parse error response from AI provider
 */
function parseProviderError(provider: string, status: number, errorText: string): string {
  try {
    const errorJson = JSON.parse(errorText)
    // Extract meaningful error message from various provider formats
    const message =
      errorJson.error?.message ||
      errorJson.message ||
      errorJson.error?.error?.message ||
      errorJson.detail ||
      errorText
    return `${provider} API error: ${message}`
  } catch {
    return `${provider} API error: ${status} - ${errorText.slice(0, 200)}`
  }
}

// Provider-specific configurations
const PROVIDER_CONFIGS: Record<string, { baseUrl: string; headers?: Record<string, string> }> = {
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
  },
  together: {
    baseUrl: "https://api.together.xyz/v1",
  },
  fireworks: {
    baseUrl: "https://api.fireworks.ai/inference/v1",
  },
  perplexity: {
    baseUrl: "https://api.perplexity.ai",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
  },
  mistral: {
    baseUrl: "https://api.mistral.ai/v1",
  },
  xai: {
    baseUrl: "https://api.x.ai/v1",
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  },
  cohere: {
    baseUrl: "https://api.cohere.ai/v1",
  },
  "z-ai": {
    // Z.AI (GLM) HTTP API: https://docs.z.ai/guides/develop/http/introduction
    // Base path is /api/paas/v4 and the chat endpoint is /chat/completions
    baseUrl: "https://api.z.ai/api/paas/v4",
  },
  glm: {
    // Alias for Z.AI (GLM)
    baseUrl: "https://api.z.ai/api/paas/v4",
  },
  openrouter: {
    // OpenRouter - Access 100+ AI models from one API
    // https://openrouter.ai/docs
    baseUrl: "https://openrouter.ai/api/v1",
  },
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  let provider = "unknown"

  try {
    const body: ChatRequest = await request.json()
    const { messages, model, apiKey, baseUrl, temperature = 0.7, maxTokens = 2048, tools, tool_choice, thinking } = body
    provider = body.provider

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    if (!apiKey && provider !== "ollama") {
      return NextResponse.json({ error: `No API key configured for ${provider}` }, { status: 400 })
    }

    if (apiKey) {
      const invalidChar = findInvalidHeaderValueChar(apiKey)
      if (invalidChar) {
        const codeHex = invalidChar.code.toString(16).toUpperCase().padStart(4, "0")
        return NextResponse.json(
          {
            error:
              `API key contains an unsupported character at position ${invalidChar.index + 1} (U+${codeHex}). ` +
              `This often happens when '-' becomes an em dash '—'. Please re-copy the key from the provider dashboard.`,
          },
          { status: 400 }
        )
      }
    }

    // Get provider config
    const providerConfig = PROVIDER_CONFIGS[provider]
    if (!providerConfig && !baseUrl) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 })
    }

    const apiBaseUrlRaw = baseUrl || providerConfig?.baseUrl
    if (apiBaseUrlRaw && !isUrlAllowed(apiBaseUrlRaw)) {
      return NextResponse.json({ error: "Invalid or unauthorized baseUrl provided for AI provider." }, { status: 400 })
    }
    const apiBaseUrl = apiBaseUrlRaw ? normalizeBaseUrl(apiBaseUrlRaw) : apiBaseUrlRaw

    // Handle specific providers
    if (provider === "anthropic") {
      return handleAnthropicRequest(messages, model, apiKey, temperature, maxTokens)
    }

    if (provider === "google") {
      return handleGoogleRequest(messages, model, apiKey, temperature, maxTokens)
    }

    if (provider === "cohere") {
      return handleCohereRequest(messages, model, apiKey, temperature, maxTokens)
    }

    // OpenAI-compatible API call (works for Groq, OpenAI, Together, Fireworks, etc.)
    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }

    // Z.AI docs: https://docs.z.ai/guides/llm/glm-4.6#ai-coding
    // Supports vendor extension: { thinking: { type: "enabled" } }
    if ((provider === "glm" || provider === "z-ai") && thinking) {
      requestBody.thinking = thinking
    }

    // Add tools if present
    if (tools && tools.length > 0) {
      requestBody.tools = tools
      requestBody.tool_choice = tool_choice || "auto"
    }

    // Log request details for debugging GLM/Z.AI issues
    if (provider === "glm" || provider === "z-ai") {
      console.log(`GLM Request: URL=${apiBaseUrl}/chat/completions, Model=${model}, Body=`, JSON.stringify(requestBody, null, 2))
    }

    const response = await fetchWithTimeout(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`AI API error (${provider}): Status ${response.status}, Headers:`, JSON.stringify(Object.fromEntries(response.headers.entries())), "Body:", errorText)
      const errorMessage = parseProviderError(provider, response.status, errorText)
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    const choice = data.choices?.[0]
    const assistantMessage = choice?.message

    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from AI provider. The model may be unavailable." }, { status: 500 })
    }

    console.log(`[AI Chat] ${provider}/${model} responded in ${Date.now() - startTime}ms`)

    // Return content and/or tool calls
    return NextResponse.json({
      content: assistantMessage.content,
      tool_calls: assistantMessage.tool_calls,
      model: data.model,
      usage: data.usage,
    })
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`AI chat error (${provider}, ${elapsed}ms):`, error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: `Request to ${provider} timed out after 30 seconds. The AI provider may be slow or unavailable.` },
          { status: 504 }
        )
      }

      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: `Unable to connect to ${provider}. Please check your internet connection or try a different provider.` },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}

async function handleAnthropicRequest(
  messages: ChatMessage[],
  model: string,
  apiKey: string,
  temperature: number,
  maxTokens: number
) {
  try {
    // Convert messages to Anthropic format
    const systemMessage = messages.find((m) => m.role === "system")
    const otherMessages = messages.filter((m) => m.role !== "system")

    const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Anthropic API error:", errorText)
      const errorMessage = parseProviderError("Anthropic", response.status, errorText)
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.content?.[0]?.text

    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from Anthropic. The model may be unavailable." }, { status: 500 })
    }

    return NextResponse.json({
      content: assistantMessage,
      model: data.model,
      usage: {
        prompt_tokens: data.usage?.input_tokens,
        completion_tokens: data.usage?.output_tokens,
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    })
  } catch (error) {
    console.error("Anthropic request error:", error)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request to Anthropic timed out. Please try again." },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Anthropic request failed" },
      { status: 500 }
    )
  }
}

async function handleGoogleRequest(
  messages: ChatMessage[],
  model: string,
  apiKey: string,
  temperature: number,
  maxTokens: number
) {
  try {
    const contents = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))

    const systemMessage = messages.find(m => m.role === "system")

    const body: any = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    }

    if (systemMessage && model.includes("1.5")) {
      body.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      }
    } else if (systemMessage) {
      if (contents.length > 0 && contents[0].role === "user") {
        contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`
      } else {
        contents.unshift({
          role: "user",
          parts: [{ text: systemMessage.content }]
        })
      }
    }

    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google API error:", errorText)
      const errorMessage = parseProviderError("Google", response.status, errorText)
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from Google. The model may be unavailable." }, { status: 500 })
    }

    return NextResponse.json({
      content: assistantMessage,
      model: model,
      usage: {
        total_tokens: data.usageMetadata?.totalTokenCount || 0
      },
    })
  } catch (error) {
    console.error("Google request error:", error)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request to Google timed out. Please try again." },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Google request failed" },
      { status: 500 }
    )
  }
}

async function handleCohereRequest(
  messages: ChatMessage[],
  model: string,
  apiKey: string,
  temperature: number,
  maxTokens: number
) {
  try {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from user for Cohere" }, { status: 400 })
    }

    const chatHistory = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "CHATBOT" : "USER",
      message: m.content
    }))

    const response = await fetchWithTimeout("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        message: lastMessage.content,
        chat_history: chatHistory,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Cohere API error:", errorText)
      const errorMessage = parseProviderError("Cohere", response.status, errorText)
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      content: data.text,
      model: model,
      usage: {
        total_tokens: (data.meta?.tokens?.input_tokens || 0) + (data.meta?.tokens?.output_tokens || 0)
      },
    })
  } catch (error) {
    console.error("Cohere request error:", error)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request to Cohere timed out. Please try again." },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cohere request failed" },
      { status: 500 }
    )
  }
}