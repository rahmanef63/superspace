/**
 * Audit Log Validator
 *
 * Validates that all Convex mutations have proper audit logging.
 * This script enforces project guardrails (DoD #3) by scanning all mutation
 * files and ensuring they call logAudit() or logAuditBatch().
 *
 * USAGE:
 * ```bash
 * npm run validate:audit
 * # or
 * tsx scripts/validate-audit-logs.ts
 * ```
 *
 * EXIT CODES:
 * - 0: All mutations have audit logging ✅
 * - 1: Some mutations are missing audit logging ❌
 *
 * @see docs/2-rules/MUTATION_TEMPLATE_GUIDE.md
 * @see .claude/CLAUDE.md (DoD #3)
 */

import * as fs from "fs";
import * as path from "path";
import { globSync } from "glob";

// ANSI color codes
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
  hasAuditLog: boolean;
  lineNumber?: number;
  issue?: string;
  mutationType?: "create" | "update" | "delete" | "other";
  skipped?: boolean;
  skipReason?: string;
  skipLineNumber?: number;
}

interface SummaryStats {
  totalFiles: number;
  totalMutations: number;
  mutationsWithAuditLogs: number;
  mutationsWithoutAuditLogs: number;
  mutationsSkipped: number;
  violations: ValidationResult[];
  skipped: ValidationResult[];
}

const BASELINE_PATH = path.join(process.cwd(), "scripts", "baselines", "audit-violations.txt");
const SKIP_DIRECTIVE = "@dod:skip-audit";

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
      `${violation.mutationName}: ${violation.issue ?? "Missing audit log"}`
    );
    console.log(`::error title=Missing audit log,file=${file},line=${line}::${message}`);
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
  fileContent: string
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
 * Detect mutation type from name
 */
function detectMutationType(
  mutationName: string,
  content: string
): "create" | "update" | "delete" | "other" {
  const lowerName = mutationName.toLowerCase();

  if (lowerName.includes("create") || lowerName.includes("insert") || lowerName.includes("add")) {
    return "create";
  }

  if (
    lowerName.includes("update") ||
    lowerName.includes("edit") ||
    lowerName.includes("modify") ||
    lowerName.includes("patch")
  ) {
    return "update";
  }

  if (lowerName.includes("delete") || lowerName.includes("remove")) {
    return "delete";
  }

  // Check content for db operations
  if (content.includes("ctx.db.insert")) return "create";
  if (content.includes("ctx.db.patch") || content.includes("ctx.db.replace")) return "update";
  if (content.includes("ctx.db.delete")) return "delete";

  return "other";
}

/**
 * Check if mutation is read-only (query-like)
 */
function isReadOnlyMutation(mutationName: string, content: string): boolean {
  const lowerName = mutationName.toLowerCase();

  // Check name patterns
  if (
    lowerName.includes("get") ||
    lowerName.includes("list") ||
    lowerName.includes("find") ||
    lowerName.includes("search") ||
    lowerName.includes("query")
  ) {
    // Check if it actually modifies data
    const hasWriteOperation =
      content.includes("ctx.db.insert") ||
      content.includes("ctx.db.patch") ||
      content.includes("ctx.db.replace") ||
      content.includes("ctx.db.delete");

    return !hasWriteOperation;
  }

  return false;
}

/**
 * Check if a mutation has audit logging
 */
function hasAuditLog(mutationContent: string): {
  hasLog: boolean;
  details?: string;
} {
  // Check for logAudit() call
  const logAuditRegex = /logAudit\s*\(/;
  const hasLogAudit = logAuditRegex.test(mutationContent);

  // Check for logAuditBatch() call
  const logAuditBatchRegex = /logAuditBatch\s*\(/;
  const hasLogAuditBatch = logAuditBatchRegex.test(mutationContent);

  // Check for logAuditEvent() call (from convex/shared/audit)
  const logAuditEventRegex = /logAuditEvent\s*\(/;
  const hasLogAuditEvent = logAuditEventRegex.test(mutationContent);

  if (hasLogAudit) {
    return { hasLog: true, details: "logAudit()" };
  }

  if (hasLogAuditBatch) {
    return { hasLog: true, details: "logAuditBatch()" };
  }

  if (hasLogAuditEvent) {
    return { hasLog: true, details: "logAuditEvent()" };
  }

  return { hasLog: false };
}

/**
 * Check if file imports audit logger
 */
function hasAuditImport(fileContent: string): boolean {
  // Check for logAudit/logAuditBatch from audit/logger
  const loggerImportRegex = /import\s+\{[^}]*(?:logAudit|logAuditBatch)[^}]*\}\s+from\s+["'].*audit\/logger["']/;
  // Check for logAuditEvent from shared/audit
  const sharedAuditImportRegex = /import\s+\{[^}]*(?:logAuditEvent)[^}]*\}\s+from\s+["'].*shared\/audit["']/;
  return loggerImportRegex.test(fileContent) || sharedAuditImportRegex.test(fileContent);
}

/**
 * Validate a single mutation file
 */
function validateFile(filePath: string): ValidationResult[] {
  const results: ValidationResult[] = [];

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Check if file imports audit functions
    const hasImport = hasAuditImport(fileContent);

    // Extract all mutations from file
    const mutations = extractMutations(fileContent);

    if (mutations.length === 0) {
      return results;
    }

    // Validate each mutation
    for (const mutation of mutations) {
      const mutationType = detectMutationType(mutation.name, mutation.content);
      const skip = findSkipDirectiveForMutation(fileContent, mutation);
      if (skip) {
        if (!skip.reason) {
          results.push({
            file: filePath,
            mutationName: mutation.name,
            hasAuditLog: false,
            lineNumber: skip.lineNumber,
            mutationType,
            issue: `${SKIP_DIRECTIVE} requires reason=...`,
          });
          continue;
        }

        results.push({
          file: filePath,
          mutationName: mutation.name,
          hasAuditLog: true,
          lineNumber: mutation.startLine,
          mutationType,
          skipped: true,
          skipReason: skip.reason,
          skipLineNumber: skip.lineNumber,
        });
        continue;
      }

      const isReadOnly = isReadOnlyMutation(mutation.name, mutation.content);

      // Skip read-only mutations (they don't need audit logs)
      if (isReadOnly) {
        continue;
      }

      const { hasLog } = hasAuditLog(mutation.content);

      results.push({
        file: filePath,
        mutationName: mutation.name,
        hasAuditLog: hasLog,
        lineNumber: mutation.startLine,
        mutationType,
        issue: !hasLog
          ? !hasImport
            ? "Missing import from audit/logger"
            : "Missing logAudit() or logAuditBatch() call"
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
  console.log(`${colors.bold}${colors.cyan}📝 Validating Audit Logs in Convex Mutations${colors.reset}\n`);

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
    mutationsWithAuditLogs: allResults.filter((r) => r.hasAuditLog && !r.skipped).length,
    mutationsWithoutAuditLogs: allResults.filter((r) => !r.hasAuditLog).length,
    mutationsSkipped: skipped.length,
    violations: allResults.filter((r) => !r.hasAuditLog),
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
    `Mutations with audit logs: ${colors.green}${colors.bold}${stats.mutationsWithAuditLogs}${colors.reset}`
  );
  console.log(
    `Mutations without audit logs: ${colors.red}${colors.bold}${stats.mutationsWithoutAuditLogs}${colors.reset}`
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
        const typeEmoji =
          violation.mutationType === "create"
            ? "➕"
            : violation.mutationType === "update"
              ? "✏️"
              : violation.mutationType === "delete"
                ? "🗑️"
                : "❓";

        console.log(
          `   ${colors.red}✗${colors.reset} ${typeEmoji} ${colors.bold}${violation.mutationName}${colors.reset} (line ${violation.lineNumber})`
        );
        console.log(`     ${colors.red}→${colors.reset} ${violation.issue}`);
      }

      console.log();
    }

    // Print remediation steps
    console.log(`${colors.bold}🔧 How to Fix:${colors.reset}\n`);
    console.log(`1. Import audit logger:`);
    console.log(`   ${colors.cyan}import { logAudit } from "../../lib/audit/logger";${colors.reset}\n`);
    console.log(`2. Add audit log AFTER successful operation:`);
    console.log(`   ${colors.cyan}await logAudit(ctx, {`);
    console.log(`     action: "entity.created",`);
    console.log(`     entityType: "entities",`);
    console.log(`     entityId: id,`);
    console.log(`     workspaceId: args.workspaceId,`);
    console.log(`     userId: user._id,`);
    console.log(`     metadata: { ... },`);
    console.log(`   });${colors.reset}\n`);
    console.log(`3. Add audit logging using logAudit() helper`);
    console.log(`4. See template: ${colors.cyan}convex/templates/mutation_template.ts${colors.reset}`);
    console.log();
    console.log(`5. See guide: ${colors.cyan}docs/2-rules/MUTATION_TEMPLATE_GUIDE.md${colors.reset}\n`);
    console.log(
      `${colors.dim}If this is a false positive, you can temporarily add: // ${SKIP_DIRECTIVE} reason=...${colors.reset}\n`
    );
  } else {
    if (baselineInfo && stats.violations.length > 0) {
      console.log(
        `${colors.yellow}${colors.bold}PASS: no NEW audit violations (baseline still has ${stats.violations.length}).${colors.reset}\n`
      );
    } else {
      console.log(`${colors.green}${colors.bold}PASS: all mutations have proper audit logging.${colors.reset}\n`);
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
    summaryLines.push(`### Audit validator`);
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
