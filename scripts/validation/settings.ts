#!/usr/bin/env node
import { z } from "zod";
import { readFileSync } from "fs";

const WorkspaceSettingsSchema = z.object({
  allowInvites: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  defaultRoleId: z.string().optional(),
  allowPublicDocuments: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

const settingsPath = process.argv[2];
if (!settingsPath) {
  console.error("Usage: validate-workspace-settings.ts <settings.json>");
  console.error("\nExample settings.json:");
  console.error(JSON.stringify({
    allowInvites: true,
    requireApproval: false,
    defaultRoleId: "k1234567890abcdef",
    allowPublicDocuments: true,
    theme: "light"
  }, null, 2));
  process.exit(1);
}

try {
  const raw = readFileSync(settingsPath, "utf-8");
  const data = JSON.parse(raw);
  WorkspaceSettingsSchema.parse(data);
  console.log("✓ Workspace settings are valid");
  if (data.allowInvites !== undefined) console.log(`  Allow Invites: ${data.allowInvites}`);
  if (data.requireApproval !== undefined) console.log(`  Require Approval: ${data.requireApproval}`);
  if (data.defaultRoleId) console.log(`  Default Role ID: ${data.defaultRoleId}`);
  if (data.allowPublicDocuments !== undefined) console.log(`  Allow Public Docs: ${data.allowPublicDocuments}`);
  if (data.theme) console.log(`  Theme: ${data.theme}`);
} catch (err: unknown) {
  console.error("✗ Workspace settings are invalid:");
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
