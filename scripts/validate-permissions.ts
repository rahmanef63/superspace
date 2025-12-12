/**
 * Permission Check Validator
 *
 * Validates that all Convex mutations have proper permission checks.
 * This script enforces project guardrails (DoD #2) by scanning all mutation
 * files and ensuring they call requirePermission() or checkPermission().
 *
 * USAGE:
 * ```bash
 * npm run validate:permissions
 * # or
 * tsx scripts/validate-permissions.ts
 * ```
 *
 * EXIT CODES:
 * - 0: All mutations have permission checks ✅
 * - 1: Some mutations are missing permission checks ❌
 *
 * @see docs/2-rules/MUTATION_TEMPLATE_GUIDE.md
 * @see .claude/CLAUDE.md (DoD #2)
 */

import * as fs from "fs";
import * as path from "path";
import { globSync } from "glob";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

interface ValidationResult {
  file: string;
  mutationName: string;
  hasPermissionCheck: boolean;
  lineNumber?: number;
  issue?: string;
  skipped?: boolean;
  skipReason?: string;
  skipLineNumber?: number;
}

interface SummaryStats {
  totalFiles: number;
  totalMutations: number;
  mutationsWithPermissions: number;
  mutationsWithoutPermissions: number;
  mutationsSkipped: number;
  filesChecked: number;
  violations: ValidationResult[];
  skipped: ValidationResult[];
}

const BASELINE_PATH = path.join(process.cwd(), "scripts", "baselines", "permissions-violations.txt");
const SKIP_DIRECTIVE = "@dod:skip-permissions";

function normalizeViolationPath(filePath: string): string {
  const relative = path.relative(process.cwd(), filePath);
  return relative.split(path.sep).join("/");
}

function isGitHubActions(): boolean {
  return process.env.GITHUB_ACTIONS === "true";
}

function appendGitHubStepSummary(markdown: string): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  try {
    fs.appendFileSync(summaryPath, markdown, "utf-8");
  } catch (error: any) {
    console.error(`${colors.yellow}Warning: failed to write CI summary: ${error.message}${colors.reset}`);
  }
}

function safeGitHubAnnotationMessage(message: string): string {
  return message.replace(/\r?\n/g, " ").trim();
}

function emitGitHubErrorAnnotations(violations: ValidationResult[]): void {
  if (!isGitHubActions()) return;

  for (const violation of violations) {
    const file = normalizeViolationPath(violation.file);
    const line = violation.lineNumber ?? 1;
    const message = safeGitHubAnnotationMessage(
      `${violation.mutationName}: ${violation.issue ?? "Missing permission check"}`
    );
    console.log(`::error title=Missing permission check,file=${file},line=${line}::${message}`);
  }
}

function emitGitHubSkipNotices(skipped: ValidationResult[]): void {
  if (!isGitHubActions()) return;

  for (const item of skipped) {
    const file = normalizeViolationPath(item.file);
    const line = item.skipLineNumber ?? item.lineNumber ?? 1;
    const reason = item.skipReason ?? "no reason provided";
    const message = safeGitHubAnnotationMessage(`${item.mutationName}: ${SKIP_DIRECTIVE} reason=${reason}`);
    console.log(`::notice title=DoD check skipped,file=${file},line=${line}::${message}`);
  }
}

function normalizeSkipReason(reason: string): string {
  const trimmed = reason.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseSkipDirectiveFromLine(line: string): { reason: string | null } | null {
  const haystack = line.trimEnd();
  const index = haystack.indexOf(SKIP_DIRECTIVE);
  if (index === -1) return null;

  const rest = haystack.slice(index + SKIP_DIRECTIVE.length);
  const match = rest.match(/reason\s*=\s*(.+)\s*$/i);
  if (!match) return { reason: null };

  const reason = normalizeSkipReason(match[1]);
  if (reason.length === 0) return { reason: null };

  return { reason };
}

function findSkipDirectiveForMutation(
  fileContent: string,
  mutation: { content: string; startLine: number }
): { lineNumber: number; reason: string | null } | null {
  const fileLines = fileContent.split("\n");

  const preStart = Math.max(1, mutation.startLine - 3);
  for (let lineNumber = preStart; lineNumber <= mutation.startLine; lineNumber++) {
    const parsed = parseSkipDirectiveFromLine(fileLines[lineNumber - 1] ?? "");
    if (parsed) return { lineNumber, reason: parsed.reason };
  }

  const mutationLines = mutation.content.split("\n");
  for (let index = 0; index < mutationLines.length; index++) {
    const parsed = parseSkipDirectiveFromLine(mutationLines[index]);
    if (parsed) return { lineNumber: mutation.startLine + index, reason: parsed.reason };
  }

  return null;
}

function toViolationKey(violation: ValidationResult): string {
  return `${normalizeViolationPath(violation.file)}::${violation.mutationName}`;
}

function loadBaselineKeys(baselinePath: string): Set<string> {
  if (!fs.existsSync(baselinePath)) return new Set();

  const raw = fs.readFileSync(baselinePath, "utf-8");
  const keys = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  return new Set(keys);
}

function writeBaselineKeys(baselinePath: string, keys: string[]): void {
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
  const contents = `${keys.sort().join("\n")}\n`;
  fs.writeFileSync(baselinePath, contents, "utf-8");
}

/**
 * Find all Convex mutation files
 */
function findMutationFiles(): string[] {
  const patterns = [
    "convex/**/*mutations.ts",
    "convex/**/mutations.ts",
    "convex/**/mutation.ts",
  ];

  const files = new Set<string>();

  for (const pattern of patterns) {
    const matches = globSync(pattern, {
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/_generated/**",
        "**/templates/**", // Ignore template files
      ],
    });
    matches.forEach((file) => files.add(file));
  }

  return Array.from(files);
}

/**
 * Extract mutation declarations from a file
 */
function extractMutations(
  fileContent: string,
  filePath: string
): Array<{ name: string; content: string; startLine: number }> {
  const mutations: Array<{ name: string; content: string; startLine: number }> = [];

  // Match: export const mutationName = mutation({
  const mutationRegex = /export\s+const\s+(\w+)\s*=\s*mutation\s*\(\s*\{/g;

  let match;
  while ((match = mutationRegex.exec(fileContent)) !== null) {
    const mutationName = match[1];
    const startIndex = match.index;

    // Find the corresponding closing brace
    let braceCount = 1;
    let currentIndex = startIndex + match[0].length;
    let endIndex = currentIndex;

    while (braceCount > 0 && currentIndex < fileContent.length) {
      const char = fileContent[currentIndex];
      if (char === "{") braceCount++;
      if (char === "}") braceCount--;
      if (braceCount === 0) {
        endIndex = currentIndex;
        break;
      }
      currentIndex++;
    }

    const mutationContent = fileContent.substring(startIndex, endIndex + 1);

    // Calculate line number
    const linesBeforeMatch = fileContent.substring(0, startIndex).split("\n").length;

    mutations.push({
      name: mutationName,
      content: mutationContent,
      startLine: linesBeforeMatch,
    });
  }

  return mutations;
}

/**
 * Check if a mutation has permission check
 */
function hasPermissionCheck(mutationContent: string): {
  hasCheck: boolean;
  details?: string;
} {
  // Check for requirePermission() call
  const requirePermissionRegex = /requirePermission\s*\(/;
  const hasRequirePermission = requirePermissionRegex.test(mutationContent);

  // Check for checkPermission() call
  const checkPermissionRegex = /checkPermission\s*\(/;
  const hasCheckPermission = checkPermissionRegex.test(mutationContent);

  // Check for isWorkspaceAdmin() or isWorkspaceOwner() (also valid)
  const adminCheckRegex = /(isWorkspaceAdmin|isWorkspaceOwner)\s*\(/;
  const hasAdminCheck = adminCheckRegex.test(mutationContent);

  // Check for requireActiveMembership() (from auth/helpers)
  const requireActiveMembershipRegex = /requireActiveMembership\s*\(/;
  const hasRequireActiveMembership = requireActiveMembershipRegex.test(mutationContent);

  // Check for canPermission() (from auth/helpers)
  const canPermissionRegex = /canPermission\s*\(/;
  const hasCanPermission = canPermissionRegex.test(mutationContent);

  // Check for requireAdmin/requireEditor/requireOwner (from features/lib/rbac.ts)
  const rbacRoleCheckRegex = /(requireAdmin|requireEditor|requireOwner|requirePlatformAdmin)\s*\(/;
  const hasRbacRoleCheck = rbacRoleCheckRegex.test(mutationContent);

  // Check for isPlatformAdmin (for bundles)
  const isPlatformAdminRegex = /isPlatformAdmin\s*\(/;
  const hasPlatformAdminCheck = isPlatformAdminRegex.test(mutationContent);

  if (hasRequirePermission) {
    return { hasCheck: true, details: "requirePermission()" };
  }

  if (hasCheckPermission) {
    return { hasCheck: true, details: "checkPermission()" };
  }

  if (hasAdminCheck) {
    return { hasCheck: true, details: "isWorkspaceAdmin/Owner()" };
  }

  if (hasRequireActiveMembership) {
    return { hasCheck: true, details: "requireActiveMembership()" };
  }

  if (hasCanPermission) {
    return { hasCheck: true, details: "canPermission()" };
  }

  if (hasRbacRoleCheck) {
    return { hasCheck: true, details: "requireAdmin/Editor/Owner()" };
  }

  if (hasPlatformAdminCheck) {
    return { hasCheck: true, details: "isPlatformAdmin()" };
  }

  // Check for ctx.auth.getUserIdentity() as auth pattern (for self-service mutations)
  const userIdentityCheckRegex = /ctx\.auth\.getUserIdentity\s*\(\s*\)/;
  const hasUserIdentityCheck = userIdentityCheckRegex.test(mutationContent);
  if (hasUserIdentityCheck) {
    return { hasCheck: true, details: "ctx.auth.getUserIdentity()" };
  }

  return { hasCheck: false };
}




/**
 * Check if a mutation is imported from rbac/permissions or auth/helpers
 */
function hasPermissionImport(fileContent: string): boolean {
  // Check for rbac/permissions import
  const rbacRegex = /import\s+\{[^}]*(?:requirePermission|checkPermission|isWorkspaceAdmin|isWorkspaceOwner)[^}]*\}\s+from\s+["'].*rbac\/permissions["']/;
  if (rbacRegex.test(fileContent)) return true;

  // Check for auth/helpers import (also has requirePermission, requireActiveMembership, etc.)
  const authHelpersRegex = /import\s+\{[^}]*(?:requirePermission|requireActiveMembership|canPermission|hasPermission)[^}]*\}\s+from\s+["'].*auth\/helpers["']/;
  if (authHelpersRegex.test(fileContent)) return true;

  // Check for features/lib/rbac import (requireAdmin, requireEditor, requireOwner)
  const featuresRbacRegex = /import\s+\{[^}]*(?:requireAdmin|requireEditor|requireOwner|requirePlatformAdmin)[^}]*\}\s+from\s+["'].*lib\/rbac["']/;
  if (featuresRbacRegex.test(fileContent)) return true;

  // Check for lib/platformAdmin import (isPlatformAdmin)
  const platformAdminRegex = /import\s+\{[^}]*isPlatformAdmin[^}]*\}\s+from\s+["'].*platformAdmin["']/;
  if (platformAdminRegex.test(fileContent)) return true;

  return false;
}



/**
 * Validate a single mutation file
 */
function validateFile(filePath: string): ValidationResult[] {
  const results: ValidationResult[] = [];

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Check if file imports permission functions
    const hasImport = hasPermissionImport(fileContent);

    // Extract all mutations from file
    const mutations = extractMutations(fileContent, filePath);

    if (mutations.length === 0) {
      // No mutations found - might be a false positive from glob
      return results;
    }

    // Validate each mutation
    for (const mutation of mutations) {
      const skip = findSkipDirectiveForMutation(fileContent, mutation);
      if (skip) {
        if (!skip.reason) {
          results.push({
            file: filePath,
            mutationName: mutation.name,
            hasPermissionCheck: false,
            lineNumber: skip.lineNumber,
            issue: `${SKIP_DIRECTIVE} requires reason=...`,
          });
          continue;
        }

        results.push({
          file: filePath,
          mutationName: mutation.name,
          hasPermissionCheck: true,
          lineNumber: mutation.startLine,
          skipped: true,
          skipReason: skip.reason,
          skipLineNumber: skip.lineNumber,
        });
        continue;
      }

      const { hasCheck } = hasPermissionCheck(mutation.content);

      results.push({
        file: filePath,
        mutationName: mutation.name,
        hasPermissionCheck: hasCheck,
        lineNumber: mutation.startLine,
        issue: !hasCheck
          ? !hasImport
            ? "Missing import from rbac/permissions"
            : "Missing requirePermission() or checkPermission() call"
          : undefined,
      });
    }
  } catch (error: any) {
    console.error(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
  }

  return results;
}

/**
 * Validate all mutation files
 */
function validateAllMutations(): SummaryStats {
  console.log(`${colors.bold}${colors.cyan}🔍 Validating Permission Checks in Convex Mutations${colors.reset}\n`);

  const files = findMutationFiles();

  console.log(`Found ${colors.bold}${files.length}${colors.reset} mutation file(s)\n`);

  const allResults: ValidationResult[] = [];

  for (const file of files) {
    const results = validateFile(file);
    allResults.push(...results);
  }

  // Calculate stats
  const skipped = allResults.filter((r) => r.skipped);
  const stats: SummaryStats = {
    totalFiles: files.length,
    totalMutations: allResults.length,
    mutationsWithPermissions: allResults.filter((r) => r.hasPermissionCheck && !r.skipped).length,
    mutationsWithoutPermissions: allResults.filter((r) => !r.hasPermissionCheck).length,
    mutationsSkipped: skipped.length,
    filesChecked: files.length,
    violations: allResults.filter((r) => !r.hasPermissionCheck),
    skipped,
  };

  return stats;
}

/**
 * Print validation results
 */
function printResults(
  stats: SummaryStats,
  displayViolations: ValidationResult[] = stats.violations,
  baselineInfo?: { baselinePath: string; ignoredCount: number }
): void {
  console.log(`${colors.bold}📊 Validation Results:${colors.reset}\n`);

  // Print summary
  console.log(`Total mutation files checked: ${colors.bold}${stats.totalFiles}${colors.reset}`);
  console.log(`Total mutations found: ${colors.bold}${stats.totalMutations}${colors.reset}`);
  console.log(
    `Mutations with permission checks: ${colors.green}${colors.bold}${stats.mutationsWithPermissions}${colors.reset}`
  );
  console.log(
    `Mutations without permission checks: ${colors.red}${colors.bold}${stats.mutationsWithoutPermissions}${colors.reset}`
  );
  if (stats.mutationsSkipped > 0) {
    console.log(`Mutations skipped: ${colors.yellow}${colors.bold}${stats.mutationsSkipped}${colors.reset}`);
  }

  console.log();

  // Print violations
  if (baselineInfo) {
    const totalViolations = stats.violations.length;
    const newViolations = displayViolations.length;

    console.log(`${colors.dim}Baseline: ${baselineInfo.baselinePath}${colors.reset}`);
    console.log(
      `${colors.dim}Known (baseline) violations: ${baselineInfo.ignoredCount}/${totalViolations}${colors.reset}`
    );
    console.log(`${colors.dim}New violations: ${newViolations}${colors.reset}`);
    console.log();
  }

  if (displayViolations.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ Violations Found:${colors.reset}\n`);
    emitGitHubErrorAnnotations(displayViolations);

    // Group violations by file
    const violationsByFile = new Map<string, ValidationResult[]>();
    for (const violation of displayViolations) {
      if (!violationsByFile.has(violation.file)) {
        violationsByFile.set(violation.file, []);
      }
      violationsByFile.get(violation.file)!.push(violation);
    }

    // Print violations grouped by file
    for (const [file, violations] of violationsByFile) {
      console.log(`${colors.yellow}📁 ${file}${colors.reset}`);

      for (const violation of violations) {
        console.log(
          `   ${colors.red}✗${colors.reset} ${colors.bold}${violation.mutationName}${colors.reset} (line ${violation.lineNumber})`
        );
        console.log(`     ${colors.red}→${colors.reset} ${violation.issue}`);
      }

      console.log();
    }

    // Print remediation steps
    console.log(`${colors.bold}🔧 How to Fix:${colors.reset}\n`);
    console.log(`1. Import permission functions:`);
    console.log(`   ${colors.cyan}import { requirePermission } from "../../lib/rbac/permissions";${colors.reset}\n`);
    console.log(`2. Add permission check as FIRST LINE in handler:`);
    console.log(`   ${colors.cyan}await requirePermission(ctx, args.workspaceId, "feature.action");${colors.reset}\n`);
    console.log(`3. Update to use requirePermission() helper`);
    console.log(`4. See template: ${colors.cyan}convex/templates/mutation_template.ts${colors.reset}`);
    console.log();
    console.log(`5. See guide: ${colors.cyan}docs/2-rules/MUTATION_TEMPLATE_GUIDE.md${colors.reset}\n`);
    console.log(
      `${colors.dim}If this is a false positive, you can temporarily add: // ${SKIP_DIRECTIVE} reason=...${colors.reset}\n`
    );
  } else {
    if (baselineInfo && stats.violations.length > 0) {
      console.log(
        `${colors.yellow}${colors.bold}PASS: no NEW permission violations (baseline still has ${stats.violations.length}).${colors.reset}\n`
      );
    } else {
      console.log(`${colors.green}${colors.bold}PASS: all mutations have proper permission checks.${colors.reset}\n`);
    }
  }

  if (stats.skipped.length > 0) {
    emitGitHubSkipNotices(stats.skipped);

    console.log(`${colors.yellow}${colors.bold}Skipped mutations (${stats.skipped.length}):${colors.reset}`);
    for (const item of stats.skipped) {
      const reason = item.skipReason ?? "no reason provided";
      const line = item.skipLineNumber ?? item.lineNumber ?? 1;
      console.log(
        `  ${colors.yellow}SKIP${colors.reset} ${normalizeViolationPath(item.file)}:${line} ${colors.bold}${item.mutationName}${colors.reset} (${reason})`
      );
    }
    console.log();
  }

  if (isGitHubActions()) {
    const summaryLines: string[] = [];
    summaryLines.push(`### Permission validator`);
    summaryLines.push(`- Total mutations checked: ${stats.totalMutations}`);
    summaryLines.push(`- New violations: ${displayViolations.length}`);
    if (baselineInfo) {
      summaryLines.push(`- Baseline ignored: ${baselineInfo.ignoredCount}`);
    }
    if (stats.skipped.length > 0) {
      summaryLines.push(`- Skipped: ${stats.skipped.length} (${SKIP_DIRECTIVE})`);
    }
    summaryLines.push("");
    appendGitHubStepSummary(`${summaryLines.join("\n")}\n`);
  }
}

/**
 * Main execution
 */
function main(): void {
  try {
    const args = new Set(process.argv.slice(2));
    const shouldWriteBaseline = args.has("--write-baseline");

    const stats = validateAllMutations();
    const baselineKeys = loadBaselineKeys(BASELINE_PATH);
    const allViolationKeys = stats.violations.map(toViolationKey);

    if (shouldWriteBaseline) {
      writeBaselineKeys(BASELINE_PATH, allViolationKeys);
      console.log(`${colors.green}${colors.bold}PASS: wrote baseline${colors.reset} ${BASELINE_PATH}`);
      process.exit(0);
    }

    const baselineUsed = baselineKeys.size > 0;
    const newViolations = baselineUsed
      ? stats.violations.filter((v) => !baselineKeys.has(toViolationKey(v)))
      : stats.violations;
    const ignoredCount = baselineUsed ? stats.violations.length - newViolations.length : 0;

    printResults(stats, newViolations, baselineUsed ? { baselinePath: BASELINE_PATH, ignoredCount } : undefined);

    // Exit with appropriate code
    if (newViolations.length > 0) {
      console.log(`${colors.red}${colors.bold}❌ Validation FAILED${colors.reset}\n`);
      console.log(`Fix the violations above before committing.\n`);
      process.exit(1);
    } else {
      console.log(`${colors.green}${colors.bold}✅ Validation PASSED${colors.reset}\n`);
      process.exit(0);
    }
  } catch (error: any) {
    console.error(`${colors.red}${colors.bold}Fatal error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { validateAllMutations, validateFile, findMutationFiles };
