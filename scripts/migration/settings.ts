#!/usr/bin/env node
/**
 * Migration script for workspace settings schema
 * Supports --dry-run for safe preview of changes
 *
 * Usage:
 *   node scripts/migrate-workspace-settings.ts --dry-run
 *   node scripts/migrate-workspace-settings.ts
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const isDryRun = process.argv.includes("-dry-run");

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required");
  console.error("   Set it in your .env.local file or pass it as an environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

interface Workspace {
  _id: string;
  name: string;
  settings?: {
    allowInvites?: boolean;
    requireApproval?: boolean;
    defaultRoleId?: string;
    allowPublicDocuments?: boolean;
    theme?: string;
  };
}

async function migrateWorkspaceSettings() {


  try {
    // Fetch all workspaces (you'll need to create this query in convex)

    // const workspaces: Workspace[] = await client.query("workspace/workspaces:listAll");

    // For demonstration, using mock data
    const workspaces: Workspace[] = [];


    let migratedCount = 0;
    let skippedCount = 0;
    const changes: Array<{ workspaceId: string; name: string; changes: any }> = [];

    for (const workspace of workspaces) {
      const currentSettings = workspace.settings || {};
      const needsMigration =
        currentSettings.theme === undefined ||
        currentSettings.allowInvites === undefined ||
        currentSettings.requireApproval === undefined ||
        currentSettings.allowPublicDocuments === undefined;

      if (!needsMigration) {
        skippedCount++;
        continue;
      }

      const newSettings = {
        allowInvites: currentSettings.allowInvites ?? true,
        requireApproval: currentSettings.requireApproval ?? false,
        defaultRoleId: currentSettings.defaultRoleId,
        allowPublicDocuments: currentSettings.allowPublicDocuments ?? false,
        theme: currentSettings.theme ?? "system",
      };

      const diff = {
        old: currentSettings,
        new: newSettings,
      };

      changes.push({
        workspaceId: workspace._id,
        name: workspace.name,
        changes: diff,
      });

      if (!isDryRun) {
        // Apply migration (you'll need to create this mutation in convex)
        // await client.mutation("workspace/settings:updateSettings", {
        //   workspaceId: workspace._id,
        //   settings: newSettings,
        // });
      }

      migratedCount++;
    }

    // Print summary


    if (changes.length > 0) {

      changes.forEach((change, idx) => {

      });

    }

    if (isDryRun && changes.length > 0) {

    } else if (!isDryRun && changes.length > 0) {

    } else {

    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

migrateWorkspaceSettings();
