# Dynamic Export/Import System

## Overview

SuperSpace includes a powerful, dynamic export/import system that works across all features. The system supports JSON and CSV formats, provides template generation, and handles complex data validation.

## Features

- **Multi-format Support**: JSON and CSV export/import
- **Dynamic Property Discovery**: Automatically discovers and exports feature properties
- **Template Generation**: Generates empty templates for easy import
- **Data Validation**: Comprehensive validation with Zod schemas
- **Field Mapping**: Map CSV columns to database fields
- **Preview Mode**: Preview imports before execution
- **Progress Tracking**: Real-time import/export progress
- **Error Handling**: Detailed error reporting with row-level precision

## Architecture

### Core Components

1. **Data Export Engine** (`frontend/shared/foundation/utils/export/data-export-engine.ts`)
   - Handles JSON and CSV export
   - Formats data based on property types
   - Generates templates with sample data

2. **Data Import Engine** (`frontend/shared/foundation/utils/export/data-import-engine.ts`)
   - Parses JSON and CSV files
   - Validates data with Zod schemas
   - Handles field mapping and transformation

3. **Registry System** (`frontend/shared/foundation/registry/data-export-registry.ts`)
   - Auto-discovers feature export configurations
   - Manages feature registration
   - Provides default configurations

4. **UI Components** (`frontend/shared/ui/data-export/`)
   - `ExportDialog`: Export configuration dialog
   - `ImportDialog`: Import with preview and validation
   - `ExportButton`: Quick export button

5. **React Hook** (`frontend/shared/hooks/useExportImport.ts`)
   - Provides export/import functionality to components
   - Manages state and progress

## Usage

### 1. Configure Feature for Export/Import

Create an export configuration file in your feature:

```typescript
// frontend/features/my-feature/export-config.ts
import type { FeatureExportConfig } from "@/frontend/shared/foundation/utils/export/data-export-types"

export const myFeatureExportConfig: FeatureExportConfig = {
  featureId: "my-feature",
  featureName: "My Feature",

  // Define exportable properties
  exportProperties: () => [
    {
      key: "id",
      label: "ID",
      type: "string",
      required: true,
    },
    {
      key: "name",
      label: "Name",
      type: "string",
      required: true,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      options: ["active", "inactive", "pending"],
    },
    // ... more properties
  ],

  // Export data function
  exportData: async (request) => {
    // Query your data based on request
    const data = await ctx.db.query("myFeature")
      .filter(q => q.eq(q.field("projectId", request.projectId)))
      .collect()

    // Apply filters, sorting, selection
    return filterData(data, request)
  },

  // Import data function
  importData: async (request) => {
    const result = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
      warnings: [],
    }

    // Parse and validate import
    const { data } = await parseImportFile(request.file, request.format)

    for (const item of data) {
      try {
        // Validate and insert/update
        await validateAndSave(item)
        result.imported++
      } catch (error) {
        result.failed++
        result.errors.push(error)
      }
    }

    return result
  },
}
```

### 2. Register Configuration

Add to your feature's main config:

```typescript
// frontend/features/my-feature/config.ts
import { myFeatureExportConfig } from "./export-config"

export const featureConfig = {
  // ... your existing config

  // Export/Import configuration
  exportConfig: myFeatureExportConfig,
  hasExportImport: true,
}
```

### 3. Use in Components

```tsx
import { ExportButton, ImportDialog } from "@/shared/ui/data-export"
import { useExportImport } from "@/shared/hooks/useExportImport"

export function MyFeatureList() {
  const [isImportOpen, setIsImportOpen] = useState(false)
  const { exportSelectedData, importFromFile } = useExportImport("my-feature")

  return (
    <div>
      {/* Export button with dropdown */}
      <ExportButton featureId="my-feature" showOptions={true} />

      {/* Import dialog */}
      <ImportDialog
        featureId="my-feature"
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={(result) => {
          console.log("Import complete:", result)
        }}
      />
    </div>
  )
}
```

## Export Options

### Data Types

1. **Current Data**: Export all current data
2. **Selected Data**: Export only selected items
3. **Template**: Export empty template with sample data

### Formats

1. **JSON**
   - Full data with schema
   - Preserves data types
   - Supports nested objects

2. **CSV**
   - Spreadsheet compatible
   - Flattened structure
   - Custom delimiters

## Import Process

1. **File Selection**: Upload JSON or CSV file
2. **Preview**: Review data before import
3. **Field Mapping**: Map columns to properties (CSV)
4. **Validation**: Check for errors and warnings
5. **Import**: Create/update records
6. **Results**: View summary of imported/updated/failed records

## Validation Rules

- **Required Fields**: Ensures all required fields are present
- **Type Validation**: Validates data types (number, date, boolean)
- **Select Options**: Validates against allowed options
- **Date Formats**: Supports various date formats
- **Duplicate Detection**: Optionally checks for duplicates

## Advanced Features

### Custom Validation

Create custom Zod schemas for complex validation:

```typescript
export function createCustomValidationSchema(properties: ExportProperty[]): ZodSchema {
  return z.object({
    email: z.string().email("Invalid email format"),
    age: z.number().min(0).max(150),
    // ... custom validations
  })
}
```

### Field Transformation

Transform data during import:

```typescript
const transform = (data: any) => ({
  ...data,
  // Convert string to boolean
  isActive: data.status === "active",
  // Parse date
  createdAt: new Date(data.created_at).getTime(),
})
```

### Batch Processing

Handle large imports with batch processing:

```typescript
export async function batchImport(data: any[], batchSize = 100) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    await processBatch(batch)
    updateProgress(i / data.length)
  }
}
```

## Best Practices

1. **Always validate** input data before import
2. **Provide clear error messages** with row numbers
3. **Use templates** to guide users on expected format
4. **Handle large datasets** with pagination or batching
5. **Backup data** before bulk imports
6. **Log all imports** for audit trails
7. **Test with sample data** before production imports

## Troubleshooting

### Common Issues

1. **File Format Errors**
   - Ensure correct file extension (.json or .csv)
   - Check JSON syntax with a validator
   - Verify CSV delimiter

2. **Validation Failures**
   - Check required fields
   - Verify data types match schema
   - Ensure select values are valid

3. **Import Failures**
   - Check permissions
   - Verify workspace access
   - Review error messages for specifics

## Migration Guide

To add export/import to an existing feature:

1. Create export configuration file
2. Define properties
3. Implement exportData and importData functions
4. Register in feature config
5. Add UI components to feature pages
6. Test with sample data

## Future Enhancements

- Excel (.xlsx) support
- Scheduled exports
- Import from external APIs
- Advanced data transformation
- Real-time sync
- Import history tracking