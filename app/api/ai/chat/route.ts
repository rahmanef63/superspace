import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, history, settings } = await request.json()

    const { text } = await generateText({
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

    return NextResponse.json({
      id: Date.now().toString(),
      message: text,
      metadata: {
        model: "gpt-4",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}
