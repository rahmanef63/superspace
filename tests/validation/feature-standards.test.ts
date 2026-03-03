import { join } from "node:path"
import { describe, expect, it } from "vitest"

import {
  collectFeatureStandardsIssues,
  shouldFailValidation,
  summarizeIssues,
} from "@/scripts/validation/rules/feature-standards"

const FIXTURES_ROOT = join(process.cwd(), "tests", "fixtures", "feature-standards")

function fixturePath(name: string): string {
  return join(FIXTURES_ROOT, name)
}

function findCodes(issues: ReturnType<typeof collectFeatureStandardsIssues>, code: string): string[] {
  return issues.filter((issue) => issue.code === code).map((issue) => issue.code)
}

describe("feature standards rule engine", () => {
  it("returns no errors for valid fixture", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("valid"))
    const summary = summarizeIssues(issues)

    expect(summary.errors).toBe(0)
    expect(summary.warnings).toBe(0)
  })

  it("reports FS001 for invalid feature.id", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("invalid-id"))
    const summary = summarizeIssues(issues)

    expect(summary.errors).toBeGreaterThanOrEqual(1)
    expect(findCodes(issues, "FS001")).toHaveLength(1)
  })

  it("reports FS003 when hasConvex=true but folder is missing", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("missing-convex"))

    expect(findCodes(issues, "FS003")).toHaveLength(1)
  })

  it("reports FS002 for legacy frontend folder mismatch", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("legacy-folder-mismatch"))
    const summary = summarizeIssues(issues)

    expect(summary.errors).toBe(0)
    expect(findCodes(issues, "FS002")).toHaveLength(1)
  })

  it("reports FS004 for legacy snake_case convex folder", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("legacy-convex-snake"))
    const summary = summarizeIssues(issues)

    expect(summary.errors).toBe(0)
    expect(findCodes(issues, "FS004")).toHaveLength(1)
  })

  it("reports FS005 for duplicate feature ids", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("duplicate-id"))
    const duplicateIssues = issues.filter((issue) => issue.code === "FS005")

    expect(duplicateIssues).toHaveLength(2)
  })
})

describe("strict mode policy", () => {
  it("passes in default mode for warning-only fixture", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("legacy-folder-mismatch"))
    const summary = summarizeIssues(issues)

    expect(summary.errors).toBe(0)
    expect(summary.warnings).toBeGreaterThanOrEqual(1)
    expect(shouldFailValidation(summary, false)).toBe(false)
  })

  it("fails in strict mode for warning-only fixture", () => {
    const issues = collectFeatureStandardsIssues(fixturePath("legacy-folder-mismatch"))
    const summary = summarizeIssues(issues)

    expect(summary.errors).toBe(0)
    expect(summary.warnings).toBeGreaterThanOrEqual(1)
    expect(shouldFailValidation(summary, true)).toBe(true)
  })
})
