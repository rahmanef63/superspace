import { existsSync, writeFileSync } from "fs"
import { join, relative } from "path"
import { getAllFeatures } from "../../lib/features/registry.server"

const rootDir = process.cwd()

function syncAgents() {
    console.log("🤖 Syncing Agent Registries...")

    const features = getAllFeatures()
    const agents = features.filter(f => f.agent)

    console.log(`   Found ${agents.length} features with agent definitions.`)

    // 1. Generate Backend Registry
    const backendRegistryDir = join(rootDir, "convex", "features", "ai")
    const backendRegistryPath = join(backendRegistryDir, "registry.ts")
    const backendImports: string[] = []
    const backendEntries: string[] = []

    // 2. Generate Frontend Registry
    const frontendRegistryDir = join(rootDir, "frontend", "features", "ai")
    const frontendRegistryPath = join(frontendRegistryDir, "registry.ts")
    const frontendImports: string[] = []
    const frontendEntries: string[] = []

    agents.forEach(feature => {
        if (feature.agent?.definitionPath) {
            // Backend Processing
            const fullDefPath = join(rootDir, feature.agent.definitionPath)

            // Ensure path exists (or warn)
            if (!existsSync(fullDefPath)) {
                console.warn(`   ⚠️  [${feature.id}] Backend definition not found at: ${feature.agent.definitionPath}`)
                // We skip invalid backend paths to avoid breaking build
            } else {
                // Relativize path for import
                let backendRel = relative(backendRegistryDir, fullDefPath).replace(/\\/g, "/").replace(/\.ts$/, "")
                if (!backendRel.startsWith(".")) backendRel = "./" + backendRel

                const importName = `${feature.id.replace(/-/g, '_')}Agent`
                backendImports.push(`import { agent as ${importName} } from "${backendRel}";`)
                backendEntries.push(`  "${feature.id}": ${importName},`)
            }

            // Frontend Processing
            // Convention: frontend/features/<slug>/agent/index.ts
            const frontendAgentDir = join(rootDir, "frontend", "features", feature.id, "agent")
            const frontendAgentIndex = join(frontendAgentDir, "index.ts")

            if (existsSync(frontendAgentIndex)) {
                let frontendRel = relative(frontendRegistryDir, frontendAgentIndex).replace(/\\/g, "/").replace(/\.ts$/, "")
                if (!frontendRel.startsWith(".")) frontendRel = "./" + frontendRel

                const importName = `${feature.id.replace(/-/g, '_')}Frontend`
                frontendImports.push(`import { agent as ${importName} } from "${frontendRel}";`)
                frontendEntries.push(`  "${feature.id}": ${importName},`)
            } else {
                // It's okay if some features don't have frontend agents yet, but good to note
                // console.log(`   ℹ️  [${feature.id}] No frontend agent found (expected at ${frontendAgentIndex})`)
            }
        }
    })

    // Write Backend Registry
    const backendContent = `// AUTO-GENERATED - DO NOT EDIT
// Run 'pnpm run syncagent:all' to update

import { FeatureAgent } from "./lib/types";
${backendImports.join("\n")}

export const featureAgentRegistry: Record<string, FeatureAgent> = {
${backendEntries.join("\n")}
};
`
    if (!existsSync(backendRegistryDir)) {
        console.error(`❌ Backend directory not found: ${backendRegistryDir}`)
        process.exit(1)
    }
    writeFileSync(backendRegistryPath, backendContent)
    console.log(`   ✓ Backend registry generated at: convex/features/ai/registry.ts`)

    // Write Frontend Registry
    const frontendContent = `// AUTO-GENERATED - DO NOT EDIT
// Run 'pnpm run syncagent:all' to update

// Defines the frontend metadata for agents
export interface AgentFallback {
    name: string;
    description: string;
    icon: string;
    prompts?: any;
}

${frontendImports.join("\n")}

export const frontendAgentRegistry: Record<string, any> = {
${frontendEntries.join("\n")}
};
`
    if (!existsSync(frontendRegistryDir)) {
        // Create if doesn't exist (it might not)
        // fs.mkdirSync(frontendRegistryDir, { recursive: true }) 
        // For now assume it exists or error
        console.warn(`⚠️  Frontend directory not found: ${frontendRegistryDir}`)
    } else {
        writeFileSync(frontendRegistryPath, frontendContent)
        console.log(`   ✓ Frontend registry generated at: frontend/features/ai/registry.ts`)
    }
}

syncAgents()
