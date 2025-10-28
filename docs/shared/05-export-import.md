# Export & Import

## Overview

The shared system supports bidirectional conversion between:
- **JSON** format (portable, editable)
- **TypeScript/JSX** format (code generation)
- **CMS v0.4** format (legacy compatibility)
- **Documents blocks** format (content integration)

## JSON Export/Import

### Export to JSON

```typescript
import { exportToJSON, exportToJSONString } from "@/frontend/shared/lib/export"

// Export nodes
const nodes = [
  {
    id: "button-1",
    type: "component",
    name: "Button",
    component: "button",
    props: { text: "Click me" },
  },
]

// Export to JSON object
const result = exportToJSON(nodes)
if (result.success) {
  console.log(result.data)
  // {
  //   version: "1.0.0",
  //   format: "superspace-v1",
  //   type: "component",
  //   metadata: { ... },
  //   nodes: { ... },
  //   root: ["button-1"],
  // }
}

// Export to JSON string
const jsonResult = exportToJSONString(nodes, {
  pretty: true,
  indent: 2,
})
console.log(jsonResult.data) // Pretty-printed JSON string
```

### Export Options

```typescript
const options = {
  // Formatting
  pretty: true,        // Pretty-print JSON
  indent: 2,           // Indentation spaces

  // Validation
  validate: true,      // Validate before export
  strict: false,       // Strict validation

  // Error handling
  throwOnError: false, // Throw or return errors
  skipInvalid: false,  // Skip invalid nodes

  // Optimization
  minify: false,           // Minify output
  removeDefaults: true,    // Remove default values
  compactProps: true,      // Remove empty props

  // Metadata
  includeMetadata: true,   // Include metadata
}

const result = exportToJSON(nodes, options)
```

### Import from JSON

```typescript
import { importFromJSON, importFromJSONString } from "@/frontend/shared/lib/import"

// Import from JSON object
const schema = {
  version: "1.0.0",
  format: "superspace-v1",
  type: "component",
  metadata: { ... },
  nodes: { ... },
  root: ["button-1"],
}

const result = importFromJSON(schema)
if (result.success) {
  console.log(result.data) // Array of nodes
}

// Import from JSON string
const jsonString = '{"version":"1.0.0",...}'
const jsonResult = importFromJSONString(jsonString)
```

### Import Options

```typescript
const options = {
  validate: true,      // Validate schema
  strict: false,       // Strict validation
  skipInvalid: true,   // Skip invalid nodes
  throwOnError: false, // Error handling
}

const result = importFromJSON(schema, options)

// Check for errors/warnings
if (!result.success) {
  console.error("Errors:", result.errors)
}
if (result.warnings.length > 0) {
  console.warn("Warnings:", result.warnings)
}
```

## TypeScript Export

### Export to TypeScript/JSX

```typescript
import { exportToTypeScript } from "@/frontend/shared/lib/export"

const nodes = [
  {
    id: "button-1",
    type: "component",
    component: "button",
    props: { text: "Click me", variant: "primary" },
  },
]

const result = exportToTypeScript(nodes, "MyComponent", {
  pretty: true,
  typescript: {
    importPath: "@/shared/components",
    functional: true,
    jsx: true,
  },
})

console.log(result.data)
// import { Button } from "@/shared/components"
//
// export function MyComponent() {
//   return (
//     <div>
//       <Button text="Click me" variant="primary" />
//     </div>
//   )
// }
```

### TypeScript Export Options

```typescript
const options = {
  typescript: {
    importPath: "@/shared/components",  // Import path for components
    importStyle: "named",                // "named" | "default" | "namespace"
    includeTypes: false,                 // Include TypeScript types
    functional: true,                    // Functional vs class components
    jsx: true,                           // JSX vs React.createElement
    semicolons: false,                   // Add semicolons
    trailingComma: true,                 // Trailing commas
    arrowParens: "avoid",                // Arrow function parens
    framework: "react",                  // "react" | "vue" | "svelte"
  },
}
```

## CMS Integration

### Convert CMS v0.4 → Shared v1.0

```typescript
import { convertCMSSchemaToV1 } from "@/frontend/shared/lib/converters"

const cmsSchema = {
  version: "0.4",
  root: ["node-1"],
  nodes: {
    "node-1": {
      type: "button",
      props: { text: "Click me" },
      children: [],
    },
  },
}

const result = convertCMSSchemaToV1(cmsSchema)
if (result.success) {
  console.log(result.data) // Shared v1.0 schema
}
```

### Convert Shared v1.0 → CMS v0.4

```typescript
import { convertV1ToCMSSchema } from "@/frontend/shared/lib/converters"

const sharedSchema = {
  version: "1.0.0",
  format: "superspace-v1",
  // ...
}

const result = convertV1ToCMSSchema(sharedSchema)
if (result.success) {
  console.log(result.data) // CMS v0.4 schema
}
```

## Documents Integration

### Convert Documents → Shared

```typescript
import { convertDocumentsToShared } from "@/frontend/shared/lib/converters"

const documentsBlocks = [
  {
    type: "paragraph",
    content: "Hello world",
    attrs: {},
  },
  {
    type: "image",
    attrs: { src: "image.jpg", alt: "Image" },
  },
]

const result = convertDocumentsToShared(documentsBlocks)
if (result.success) {
  console.log(result.data) // Shared v1.0 schema
}
```

### Convert Shared → Documents

```typescript
import { convertSharedToDocuments } from "@/frontend/shared/lib/converters"

const sharedSchema = {
  version: "1.0.0",
  // ...
}

const result = convertSharedToDocuments(sharedSchema)
if (result.success) {
  console.log(result.data) // Documents blocks array
}
```

## Error Handling

### Handle Conversion Errors

```typescript
const result = importFromJSON(schema)

if (!result.success) {
  // Handle errors
  result.errors.forEach((error) => {
    console.error(`[${error.type}] ${error.message}`)
    if (error.nodeId) {
      console.error(`  Node: ${error.nodeId}`)
    }
    if (error.details) {
      console.error(`  Details:`, error.details)
    }
  })
}

// Handle warnings
result.warnings.forEach((warning) => {
  console.warn(`[${warning.type}] ${warning.message}`)
  if (warning.suggestion) {
    console.warn(`  Suggestion: ${warning.suggestion}`)
  }
})
```

### Partial Import

```typescript
// Continue importing even if some nodes are invalid
const result = importFromJSON(schema, {
  skipInvalid: true,
})

console.log(`Imported ${result.data.length} nodes`)
console.log(`Skipped ${result.errors.length} invalid nodes`)
```

## Schema Migration

### Migrate Old Schemas

```typescript
import { migrateSchema } from "@/frontend/shared/types"

// Automatically migrates from any version to current
const oldSchema = { version: "0.4", /* ... */ }
const newSchema = migrateSchema(oldSchema)

console.log(newSchema.version) // "1.0.0"
```

## Best Practices

1. **Always validate** - Enable validation by default
2. **Handle errors gracefully** - Check `result.success`
3. **Log warnings** - Don't ignore warnings
4. **Use skipInvalid** - For partial imports
5. **Pretty-print** - For human-readable exports
6. **Minify for storage** - For compact storage
7. **Version your exports** - Include version metadata

## Examples

See [examples/](../examples/) for complete examples:
- `export-import.md` - Full export/import workflow
- `cms-migration.md` - CMS schema migration
- `documents-integration.md` - Documents integration

## Next Steps

- [CMS Integration](./06-cms-integration.md)
- [Documents Integration](./07-documents-integration.md)
- [API Reference](./09-api-reference.md)
