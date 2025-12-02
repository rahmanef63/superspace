import { NextRequest, NextResponse } from "next/server"

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
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, provider, model, apiKey, baseUrl, temperature = 0.7, maxTokens = 2048 } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    if (!apiKey && provider !== "ollama") {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Get provider config
    const providerConfig = PROVIDER_CONFIGS[provider]
    if (!providerConfig && !baseUrl) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 })
    }

    const apiBaseUrl = baseUrl || providerConfig?.baseUrl

    // Handle Anthropic separately (different API format)
    if (provider === "anthropic") {
      return handleAnthropicRequest(messages, model, apiKey, temperature, maxTokens)
    }

    // OpenAI-compatible API call (works for Groq, OpenAI, Together, Fireworks, etc.)
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`AI API error (${provider}):`, errorText)
      return NextResponse.json(
        { error: `AI API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    return NextResponse.json({
      content: assistantMessage,
      model: data.model,
      usage: data.usage,
    })
  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
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
  // Convert messages to Anthropic format
  const systemMessage = messages.find((m) => m.role === "system")
  const otherMessages = messages.filter((m) => m.role !== "system")

  const response = await fetch("https://api.anthropic.com/v1/messages", {
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
    return NextResponse.json(
      { error: `Anthropic API error: ${response.status} - ${errorText}` },
      { status: response.status }
    )
  }

  const data = await response.json()
  const assistantMessage = data.content?.[0]?.text

  if (!assistantMessage) {
    return NextResponse.json({ error: "No response from Anthropic" }, { status: 500 })
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
}
