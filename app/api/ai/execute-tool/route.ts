import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

/**
 * API endpoint to execute AI tool calls
 * This is called when the AI generates a JSON tool call in its response
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { workspaceId, feature, tool, args } = body

        if (!workspaceId || !feature || !tool) {
            return NextResponse.json(
                { error: "Missing required fields: workspaceId, feature, tool" },
                { status: 400 }
            )
        }

        // Initialize Convex client
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
        if (!convexUrl) {
            return NextResponse.json(
                { error: "Convex URL not configured" },
                { status: 500 }
            )
        }

        const convex = new ConvexHttpClient(convexUrl)

        // Call the feature agent gateway
        const result = await convex.action(api.features.ai.actions.callFeatureAgent, {
            workspaceId: workspaceId as Id<"workspaces">,
            feature,
            tool,
            args,
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, details: result.details },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            message: `Successfully executed ${feature}.${tool}`,
        })

    } catch (error) {
        console.error("[execute-tool] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Tool execution failed" },
            { status: 500 }
        )
    }
}
