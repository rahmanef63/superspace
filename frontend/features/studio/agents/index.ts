import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

// Widget and node type lists (static, safe to import at module level)
const WIDGET_CATEGORIES = [
    "Layout", "Typography", "Media", "Form", "Data", "Navigation", "Blocks", "Charts"
]

const WORKFLOW_NODE_CATEGORIES = [
    "Triggers", "Actions", "Conditions", "Transforms", "Outputs", "Integrations",
    "Features", "Utilities"
]

export function registerStudioAgent() {
    const agent: SubAgent = {
        id: "studio-agent",
        name: "Studio Agent",
        description: "Helps create and manage UI layouts, automation workflows, widgets, and canvas operations in Studio.",
        featureId: "studio",
        tools: [
            {
                name: "getStudioHelp",
                description: "Get an overview of Studio features, modes, and how to use the visual builder.",
                parameters: {
                    topic: {
                        type: "string",
                        description: "Optional topic: 'ui', 'workflow', 'widgets', 'groups', 'inspector', 'preview', 'export', 'import'",
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const topic = (params.topic as string | undefined) ?? ""
                    const help: Record<string, string> = {
                        ui: "UI Builder mode: drag widgets from the Library panel onto the canvas. Select a node to edit its properties in the Inspector (right panel). Use Pin to preview a specific node. Use Groups to compose components.",
                        workflow: "Workflow mode: build automation flows by connecting trigger nodes to action/condition nodes. Use the Execution Panel to run and debug flows. Export to n8n JSON format for deployment.",
                        widgets: "Widgets are reusable UI components. Categories: Layout, Typography, Media, Form, Data, Navigation, Blocks, Charts. Each widget has configurable props in the Inspector's Content tab.",
                        groups: "Groups (SketchUp-style): select 2+ nodes → click Group in header. Enter a group to focus-edit it. Save a group as a Block for reuse. Ungroup dissolves the group.",
                        inspector: "Inspector (right panel) has 3 tabs: Properties (styling + widget-specific fields), Layers (children order), AI (chat). Style changes are applied live to the preview.",
                        preview: "Preview panel shows the rendered UI from the canvas JSON schema. Toggle between Design and Interactive modes. Pin a node to preview just that subtree.",
                        export: "Export: Studio JSON (UI schema v0.4), Studio Document (unified), or n8n JSON (workflow). Import: paste JSON or upload a file. Auto-detects format.",
                        import: "Import: accepts Studio UI JSON (root+nodes), Studio Document (studioVersion), n8n workflow (connections array), or legacy flow format.",
                    }
                    const content = topic && help[topic]
                        ? help[topic]
                        : `Studio is a unified visual builder combining UI design and workflow automation.\n\nModes: UI Builder, Workflow, Unified (split canvas).\n\nTopics: ${Object.keys(help).join(", ")}.\n\nAsk about a specific topic for more details.`
                    return { success: true, data: { topic: topic || "overview", content }, message: content }
                },
            },
            {
                name: "listAvailableWidgets",
                description: "List all available UI widget types that can be added to the Studio canvas.",
                parameters: {
                    category: {
                        type: "string",
                        description: `Optional category filter: ${WIDGET_CATEGORIES.join(", ")}`,
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    // Dynamically import registry to avoid circular deps at module init
                    const { cmsWidgetRegistry } = await import(
                        "@/frontend/features/studio/ui/widgets/registry"
                    )
                    const registry = cmsWidgetRegistry
                    const widgets = Object.entries(registry).map(([key, config]: [string, any]) => ({
                        key,
                        label: config.label,
                        category: config.category,
                        description: config.description ?? null,
                    }))
                    const filtered = params.category
                        ? widgets.filter(w => w.category?.toLowerCase() === (params.category as string).toLowerCase())
                        : widgets
                    const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, w) => {
                        const cat = w.category ?? "Other"
                        acc[cat] = acc[cat] ?? []
                        acc[cat].push(w)
                        return acc
                    }, {})
                    return {
                        success: true,
                        data: { byCategory, total: filtered.length },
                        message: `Found ${filtered.length} widget${filtered.length !== 1 ? "s" : ""}${params.category ? ` in category "${params.category}"` : ""}.`,
                    }
                },
            },
            {
                name: "listWorkflowNodes",
                description: "List all available workflow automation node types for building flows in Studio.",
                parameters: {
                    category: {
                        type: "string",
                        description: `Optional category filter: ${WORKFLOW_NODE_CATEGORIES.join(", ")}`,
                        required: false,
                    },
                },
                handler: async (params, _ctx) => {
                    const { allNodeManifests } = await import(
                        "@/frontend/features/studio/workflow/nodes/registry"
                    )
                    const nodes = allNodeManifests.map((m: any) => ({
                        type: m.type,
                        label: m.label,
                        category: m.category,
                        description: m.description ?? null,
                    }))
                    const filtered = params.category
                        ? nodes.filter((n: any) => n.category?.toLowerCase() === (params.category as string).toLowerCase())
                        : nodes
                    const byCategory = filtered.reduce<Record<string, typeof filtered>>((acc, n: any) => {
                        const cat = n.category ?? "Other"
                        acc[cat] = acc[cat] ?? []
                        acc[cat].push(n)
                        return acc
                    }, {})
                    return {
                        success: true,
                        data: { byCategory, total: filtered.length },
                        message: `Found ${filtered.length} workflow node type${filtered.length !== 1 ? "s" : ""}${params.category ? ` in category "${params.category}"` : ""}.`,
                    }
                },
            },
            {
                name: "getSchemaHelp",
                description: "Get the Studio JSON schema format for programmatically creating UI layouts.",
                parameters: {},
                handler: async (_params, _ctx) => {
                    const schema = {
                        version: "0.4",
                        root: "root-id",
                        nodes: {
                            "root-id": {
                                type: "Container",
                                props: { display: "flex", flexDirection: "column", gap: "16px" },
                                children: ["child-1"],
                            },
                            "child-1": {
                                type: "Heading",
                                props: { content: "Hello Studio", fontSize: "2xl", fontWeight: "700" },
                                children: [],
                            },
                        },
                    }
                    return {
                        success: true,
                        data: { schema, description: "Studio UI JSON schema v0.4. Each node has: type (widget key), props (widget props + CSS overrides), children (ordered array of child node IDs). Import this via Studio's import button." },
                        message: "Schema format retrieved. Use the 'type' field to reference widget keys from listAvailableWidgets.",
                    }
                },
            },
        ],
        canHandle: (query) => {
            const q = query.toLowerCase()
            if (
                q.includes("studio") || q.includes("builder") || q.includes("automation") ||
                q.includes("workflow") || q.includes("trigger") || q.includes("widget") ||
                q.includes("canvas") || q.includes("inspector") || q.includes("template") ||
                q.includes("group") || q.includes("block") || q.includes("json schema") ||
                q.includes("pin") || q.includes("preview") || q.includes("renderer") ||
                q.includes("node type") || q.includes("flow node") || q.includes("ui layout")
            ) return 0.7
            return 0
        },
    }

    subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
