#!/usr/bin/env node
import { z } from "zod";
import { readFileSync } from "fs";

const ComponentSchema = z.object({
  workspaceId: z.string().optional(),
  key: z.string().min(1, "Component key is required").regex(/^[a-zA-Z0-9_-]+$/, "Key must be alphanumeric with hyphens/underscores"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver format (e.g., 1.0.0)"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["ui", "layout", "data", "action"]),
  propsSchema: z.record(z.string(), z.any()).optional(),
  defaultProps: z.record(z.string(), z.any()).optional(),
  slots: z.record(z.string(), z.any()).optional(),
  status: z.enum(["draft", "active", "deprecated"]),
  description: z.string().optional(),
});

const componentPath = process.argv[2];
if (!componentPath) {
  console.error("Usage: validate-component.ts <component.json>");
  console.error("\nExample component.json:");
  console.error(JSON.stringify({
    key: "custom-button",
    version: "1.0.0",
    category: "buttons",
    type: "ui",
    status: "active",
    propsSchema: {
      label: { type: "string", required: true },
      variant: { type: "string", enum: ["primary", "secondary"] }
    },
    defaultProps: {
      variant: "primary"
    },
    description: "A custom button component"
  }, null, 2));
  process.exit(1);
}

try {
  const raw = readFileSync(componentPath, "utf-8");
  const data = JSON.parse(raw);
  ComponentSchema.parse(data);
  console.log("✓ Component payload is valid");
  console.log(`  Key: ${data.key}`);
  console.log(`  Version: ${data.version}`);
  console.log(`  Type: ${data.type}`);
  console.log(`  Category: ${data.category}`);
  console.log(`  Status: ${data.status}`);
} catch (err: unknown) {
  console.error("✗ Component payload is invalid:");
  if (err instanceof z.ZodError) {
    err.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
  } else if (err instanceof Error) {
    console.error(`  ${err.message}`);
  } else {
    console.error(err);
  }
  process.exit(1);
}
