/**
 * Audit Logging Migration Script
 * 
 * Replaces placeholder createAuditLog functions with proper logAuditEvent calls.
 * 
 * USAGE:
 * ```bash
 * tsx scripts/migration/fix-audit-logging.ts
 * ```
 * 
 * This script:
 * 1. Finds all placeholder createAuditLog functions
 * 2. Replaces them with logAuditEvent from convex/shared/audit
 * 3. Updates import statements
 * 4. Validates replacements
 */

import * as fs from "fs";
import * as path from "path";
import { globSync } from "glob";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

interface FixResult {
  file: string;
  fixed: boolean;
  issues: string[];
  changes: string[];
}

const filesToCheck = [
  "convex/features/database/tables.ts",
  "convex/features/database/mutations.ts",
  "convex/features/database/rows.ts",
  "convex/features/database/fields.ts",
  "convex/features/database/changeType.ts",
  "convex/features/cms/mutations.ts",
];

function fixAuditLogging(filePath: string): FixResult {
  const result: FixResult = {
    file: filePath,
    fixed: false,
    issues: [],
    changes: [],
  };

  if (!fs.existsSync(filePath)) {
    result.issues.push(`File not found: ${filePath}`);
    return result;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  const originalContent = content;

  // Check if file has placeholder createAuditLog
  const hasPlaceholder = /async function createAuditLog|function createAuditLog/.test(content);
  const hasConsoleLog = /console\.log\(['"]Audit log|console\.log\(['"]\[Database Audit\]/.test(content);

  if (!hasPlaceholder && !hasConsoleLog) {
    return result; // No fixes needed
  }

  // 1. Remove placeholder function
  const placeholderPattern = /\/\/ TODO: Implement audit logging system[\s\S]*?async function createAuditLog[\s\S]*?\n\}/;
  if (placeholderPattern.test(content)) {
    content = content.replace(placeholderPattern, "");
    result.changes.push("Removed placeholder createAuditLog function");
  }

  // 2. Add import if not present
  const hasImport = /from ['"]@\/convex\/shared\/audit['"]|from ['"]\.\.\/\.\.\/shared\/audit['"]/.test(content);
  if (!hasImport) {
    // Find last import statement
    const importMatch = content.match(/(import .* from .*;\n)+/);
    if (importMatch) {
      const lastImportIndex = importMatch[0].lastIndexOf("import");
      const insertIndex = content.indexOf("\n", lastImportIndex) + 1;
      content = content.slice(0, insertIndex) + 
        'import { logAuditEvent } from "../../shared/audit";\n' + 
        content.slice(insertIndex);
      result.changes.push("Added logAuditEvent import");
    }
  }

  // 3. Replace createAuditLog calls with logAuditEvent
  const callPattern = /await createAuditLog\(ctx,\s*\{([^}]+)\}\)/g;
  const matches = [...content.matchAll(callPattern)];
  
  matches.forEach((match) => {
    const params = match[1];
    // Parse params and convert to logAuditEvent format
    const workspaceIdMatch = params.match(/workspaceId:\s*([^,}]+)/);
    const userIdMatch = params.match(/userId:\s*([^,}]+)/);
    const actionMatch = params.match(/action:\s*['"]([^'"]+)['"]/);
    const resourceTypeMatch = params.match(/resourceType:\s*['"]([^'"]+)['"]/);
    const resourceIdMatch = params.match(/resourceId:\s*([^,}]+)/);
    const metadataMatch = params.match(/metadata:\s*(\{[^}]*\})/);

    if (workspaceIdMatch && userIdMatch && actionMatch && resourceTypeMatch && resourceIdMatch) {
      const workspaceId = workspaceIdMatch[1].trim();
      const userId = userIdMatch[1].trim();
      const action = actionMatch[1];
      const resourceType = resourceTypeMatch[1];
      const resourceId = resourceIdMatch[1].trim();
      const metadata = metadataMatch ? metadataMatch[1] : "{}";

      // Convert action format: "entry.update" -> "cms_entry.updated"
      const normalizedAction = action.includes(".") 
        ? action 
        : `${resourceType}.${action}`;

      const replacement = `await logAuditEvent(ctx, {
      workspaceId: ${workspaceId},
      actorUserId: ${userId},
      action: "${normalizedAction}",
      resourceType: "${resourceType}",
      resourceId: ${resourceId},
      metadata: ${metadata},
    })`;

      content = content.replace(match[0], replacement);
      result.changes.push(`Replaced createAuditLog call with logAuditEvent`);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf-8");
    result.fixed = true;
  }

  return result;
}

function main() {
  console.log(`${colors.bold}${colors.blue}Audit Logging Migration Script${colors.reset}\n`);

  const results: FixResult[] = [];

  // Fix known files
  filesToCheck.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    const result = fixAuditLogging(filePath);
    results.push(result);
  });

  // Also search for other files with placeholder
  const allMutationFiles = globSync("convex/features/**/*.ts", {
    ignore: ["**/node_modules/**", "**/_generated/**"],
  });

  allMutationFiles.forEach((file) => {
    if (!filesToCheck.some((f) => file.includes(f))) {
      const content = fs.readFileSync(file, "utf-8");
      if (/createAuditLog|console\.log.*[Aa]udit/.test(content)) {
        const result = fixAuditLogging(file);
        if (result.fixed || result.issues.length > 0) {
          results.push(result);
        }
      }
    }
  });

  // Report results
  console.log(`${colors.bold}Results:${colors.reset}\n`);

  let fixedCount = 0;
  let issueCount = 0;

  results.forEach((result) => {
    if (result.fixed) {
      console.log(`${colors.green}✅ Fixed:${colors.reset} ${result.file}`);
      result.changes.forEach((change) => {
        console.log(`   - ${change}`);
      });
      fixedCount++;
    } else if (result.issues.length > 0) {
      console.log(`${colors.red}❌ Issues:${colors.reset} ${result.file}`);
      result.issues.forEach((issue) => {
        console.log(`   - ${issue}`);
      });
      issueCount++;
    }
  });

  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  Fixed: ${fixedCount} files`);
  console.log(`  Issues: ${issueCount} files`);
  console.log(`  Total: ${results.length} files\n`);

  if (fixedCount > 0) {
    console.log(`${colors.yellow}⚠️  Please review the changes and run:${colors.reset}`);
    console.log(`   pnpm run validate:audit`);
    console.log(`   pnpm test\n`);
  }
}

main();

