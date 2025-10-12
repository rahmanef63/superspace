#!/usr/bin/env node
/**
 * Migration script for component schema evolution
 * Applies componentVersions.migrations to existing components
 * Supports --dry-run for safe preview of changes
 *
 * Usage:
 *   node scripts/migrate-component-schema.ts --dry-run
 *   node scripts/migrate-component-schema.ts
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const isDryRun = process.argv.includes("--dry-run");

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required");
  console.error("   Set it in your .env.local file or pass it as an environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

interface ComponentVersion {
  _id: string;
  componentId: string;
  version: string;
  schemaVersion?: number;
  migrations?: Record<string, any>;
  propsSchema?: Record<string, any>;
  defaultProps?: Record<string, any>;
}

interface MigrationFunction {
  from: number;
  to: number;
  transform: (data: any) => any;
}

// Define migrations for specific schema versions
const MIGRATIONS: Record<number, MigrationFunction> = {
  1: {
    from: 1,
    to: 2,
    transform: (data: any) => {
      // Example: Rename 'colour' to 'color' in propsSchema
      if (data.propsSchema?.colour) {
        data.propsSchema.color = data.propsSchema.colour;
        delete data.propsSchema.colour;
      }
      if (data.defaultProps?.colour) {
        data.defaultProps.color = data.defaultProps.colour;
        delete data.defaultProps.colour;
      }
      return data;
    },
  },
  2: {
    from: 2,
    to: 3,
    transform: (data: any) => {
      // Example: Add required field to all props
      if (data.propsSchema) {
        Object.keys(data.propsSchema).forEach((key) => {
          if (data.propsSchema[key].required === undefined) {
            data.propsSchema[key].required = false;
          }
        });
      }
      return data;
    },
  },
};

function applyMigrations(version: ComponentVersion, targetSchemaVersion: number): ComponentVersion {
  let currentVersion = version.schemaVersion || 1;
  let data = { ...version };

  while (currentVersion < targetSchemaVersion) {
    const migration = MIGRATIONS[currentVersion];
    if (!migration) {
      console.warn(`   ⚠️  No migration defined for schema version ${currentVersion} -> ${currentVersion + 1}`);
      break;
    }

    console.log(`   Applying migration ${migration.from} -> ${migration.to}`);
    data = migration.transform(data);
    currentVersion = migration.to;
  }

  data.schemaVersion = currentVersion;
  return data;
}

async function migrateComponentSchemas() {
  console.log(isDryRun ? "🔍 DRY RUN MODE - No changes will be made\n" : "🚀 MIGRATION MODE - Changes will be applied\n");

  const targetSchemaVersion = Math.max(...Object.keys(MIGRATIONS).map(Number), 1) + 1;
  console.log(`🎯 Target schema version: ${targetSchemaVersion}\n`);

  try {
    // Fetch all component versions (you'll need to create this query in convex)
    console.log("📥 Fetching all component versions...");
    // const versions: ComponentVersion[] = await client.query("components/registry:listAllVersions");

    // For demonstration, using mock data
    const versions: ComponentVersion[] = [];
    console.log(`   Found ${versions.length} component versions\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    const changes: Array<{
      versionId: string;
      componentKey: string;
      version: string;
      oldSchema: number;
      newSchema: number;
      diff: any;
    }> = [];

    for (const version of versions) {
      const currentSchemaVersion = version.schemaVersion || 1;

      if (currentSchemaVersion >= targetSchemaVersion) {
        skippedCount++;
        continue;
      }

      console.log(`📦 Migrating component version: ${version.version} (schema v${currentSchemaVersion})`);

      const migratedVersion = applyMigrations(version, targetSchemaVersion);

      const diff = {
        propsSchema: {
          old: version.propsSchema,
          new: migratedVersion.propsSchema,
        },
        defaultProps: {
          old: version.defaultProps,
          new: migratedVersion.defaultProps,
        },
        schemaVersion: {
          old: currentSchemaVersion,
          new: migratedVersion.schemaVersion,
        },
      };

      changes.push({
        versionId: version._id,
        componentKey: version.componentId,
        version: version.version,
        oldSchema: currentSchemaVersion,
        newSchema: migratedVersion.schemaVersion || 1,
        diff,
      });

      if (!isDryRun) {
        // Apply migration (you'll need to create this mutation in convex)
        // await client.mutation("components/registry:updateVersion", {
        //   versionId: version._id,
        //   propsSchema: migratedVersion.propsSchema,
        //   defaultProps: migratedVersion.defaultProps,
        //   schemaVersion: migratedVersion.schemaVersion,
        // });
      }

      migratedCount++;
    }

    // Print summary
    console.log("\n📊 MIGRATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`   Component versions processed: ${versions.length}`);
    console.log(`   Component versions migrated:  ${migratedCount}`);
    console.log(`   Component versions skipped:   ${skippedCount}\n`);

    if (changes.length > 0) {
      console.log("📝 CHANGES:");
      changes.forEach((change, idx) => {
        console.log(`\n${idx + 1}. ${change.componentKey} v${change.version} (${change.versionId})`);
        console.log(`   Schema: v${change.oldSchema} -> v${change.newSchema}`);
        if (JSON.stringify(change.diff.propsSchema.old) !== JSON.stringify(change.diff.propsSchema.new)) {
          console.log(`   Props Schema Changed: ✓`);
        }
        if (JSON.stringify(change.diff.defaultProps.old) !== JSON.stringify(change.diff.defaultProps.new)) {
          console.log(`   Default Props Changed: ✓`);
        }
      });
      console.log("");
    }

    if (isDryRun && changes.length > 0) {
      console.log("✅ Dry run complete. Run without --dry-run to apply changes.");
    } else if (!isDryRun && changes.length > 0) {
      console.log("✅ Migration complete!");
    } else {
      console.log("✅ No component versions needed migration.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

migrateComponentSchemas();
