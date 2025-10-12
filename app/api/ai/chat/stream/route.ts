import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, history, settings } = await request.json()

    const result = streamText({
      model: openai("gpt-4"),
      messages: [
        ...history.map((msg: any) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: message },
      ],
      temperature: settings?.temperature || 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("AI Stream API error:", error)
    return new Response("Failed to generate AI response", { status: 500 })
  }
}
