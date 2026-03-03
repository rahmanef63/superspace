/**
 * API Route to Test AI Provider API Keys
 * Validates API keys against provider APIs
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { validateApiKeyFormat, testApiKey } from "../../../../frontend/features/ai/utils/api-key-validation"

export async function POST(req: NextRequest) {
  // 1. Authentication
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { providerId, apiKey, baseUrl } = body

    // SSRF Protection
    const ALLOWED_DOMAINS = [
      "api.groq.com", "api.openai.com", "api.anthropic.com", "api.together.xyz",
      "api.fireworks.ai", "api.perplexity.ai", "api.deepseek.com", "api.mistral.ai",
      "api.x.ai", "localhost", "127.0.0.1", "generativelanguage.googleapis.com",
      "api.cohere.ai", "api.z.ai", "openrouter.ai"
    ];
    if (baseUrl) {
      try {
        const url = new URL(baseUrl);
        if (!ALLOWED_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
          return NextResponse.json({ error: "Invalid baseUrl" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid baseUrl format" }, { status: 400 });
      }
    }

    // Validate required fields
    if (!providerId || !apiKey) {
      return NextResponse.json(
        { error: "Provider ID and API key are required" },
        { status: 400 }
      )
    }

    // For Ollama, allow empty API key
    if (providerId !== "ollama" && apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: "API key cannot be empty" },
        { status: 400 }
      )
    }

    // First check format validation (quick client-side validation)
    const formatValidation = validateApiKeyFormat(providerId, apiKey)
    if (!formatValidation.isValid) {
      return NextResponse.json(
        { error: formatValidation.error },
        { status: 400 }
      )
    }

    // Test the API key against the provider
    const result = await testApiKey(providerId, apiKey, baseUrl)

    if (result.isValid) {
      return NextResponse.json({
        success: true,
        provider: result.provider,
        model: result.model,
        message: "API key is valid"
      })
    } else {
      return NextResponse.json(
        { error: result.error || "API key validation failed" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("API key validation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Optionally add GET method to check if endpoint is available
export async function GET() {
  return NextResponse.json({
    status: "API key validation endpoint is available",
    supportedProviders: [
      "openai",
      "anthropic",
      "google",
      "groq",
      "mistral",
      "cohere",
      "xai",
      "together",
      "perplexity",
      "deepseek",
      "glm",
      "z-ai",
      "ollama"
    ]
  })
}