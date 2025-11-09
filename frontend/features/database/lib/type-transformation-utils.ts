/**
 * Type Transformation Utilities
 * 
 * Utilities for applying type transformations to database records
 */

import type { PropertyType } from '@/frontend/shared/foundation/types/universal-database';
import { transformPropertyValue, type TransformationContext, type TransformationResult } from './type-transformations';

/**
 * Transform all records in a database when property type changes
 */
export interface BatchTransformationOptions {
  /** Records to transform */
  records: Array<{
    id: string;
    properties: Record<string, any>;
  }>;
  /** Field ID being changed */
  fieldId: string;
  /** Source property type */
  fromType: PropertyType;
  /** Target property type */
  toType: PropertyType;
  /** Current field options (for select types) */
  currentOptions?: Array<{ id: string; label: string; color?: string }>;
}

export interface BatchTransformationResult {
  /** Successfully transformed records */
  transformed: Array<{
    recordId: string;
    oldValue: any;
    newValue: any;
  }>;
  /** Records with warnings */
  warnings: Array<{
    recordId: string;
    warning: string;
  }>;
  /** Records that failed to transform */
  failed: Array<{
    recordId: string;
    error: string;
  }>;
  /** New field options (if generated during transformation) */
  newOptions?: Array<{ id: string; label: string; color?: string }>;
}

/**
 * Apply transformation to all records
 */
export function transformRecords(
  options: BatchTransformationOptions
): BatchTransformationResult {
  const result: BatchTransformationResult = {
    transformed: [],
    warnings: [],
    failed: [],
  };

  // Collect all new options generated during transformation
  const allNewOptions = new Map<string, { id: string; label: string; color?: string }>();

  for (const record of options.records) {
    const oldValue = record.properties[options.fieldId];

    try {
      const context: TransformationContext = {
        value: oldValue,
        fromType: options.fromType,
        toType: options.toType,
        currentOptions: options.currentOptions,
      };

      const transformResult = transformPropertyValue(context);

      if (transformResult.success) {
        result.transformed.push({
          recordId: record.id,
          oldValue,
          newValue: transformResult.value,
        });

        if (transformResult.warning) {
          result.warnings.push({
            recordId: record.id,
            warning: transformResult.warning,
          });
        }

        // Collect new options
        if (transformResult.newOptions) {
          transformResult.newOptions.forEach(option => {
            allNewOptions.set(option.id, option);
          });
        }
      } else {
        result.failed.push({
          recordId: record.id,
          error: transformResult.warning || 'Transformation failed',
        });
      }
    } catch (error) {
      result.failed.push({
        recordId: record.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Merge all collected options
  if (allNewOptions.size > 0) {
    result.newOptions = Array.from(allNewOptions.values());
  }

  return result;
}

/**
 * Preview transformation results without applying
 */
export function previewTransformation(
  options: BatchTransformationOptions
): {
  summary: {
    total: number;
    willSucceed: number;
    willFail: number;
    withWarnings: number;
  };
  samples: Array<{
    recordId: string;
    before: any;
    after: any;
    warning?: string;
  }>;
} {
  const batchResult = transformRecords(options);

  return {
    summary: {
      total: options.records.length,
      willSucceed: batchResult.transformed.length,
      willFail: batchResult.failed.length,
      withWarnings: batchResult.warnings.length,
    },
    samples: batchResult.transformed.slice(0, 5).map(t => ({
      recordId: t.recordId,
      before: t.oldValue,
      after: t.newValue,
      warning: batchResult.warnings.find(w => w.recordId === t.recordId)?.warning,
    })),
  };
}

/**
 * Check if transformation is safe (no data loss)
 */
export function isTransformationSafe(
  fromType: PropertyType,
  toType: PropertyType
): boolean {
  // Same type is always safe
  if (fromType === toType) return true;

  // Text types are interchangeable
  const textTypes = ['rich_text', 'title'];
  if (textTypes.includes(fromType) && textTypes.includes(toType)) return true;

  // Safe conversions (no data loss)
  const safeConversions: Record<string, PropertyType[]> = {
    number: ['text', 'title'],
    checkbox: ['text', 'title', 'select', 'status'],
    date: ['text', 'title', 'created_time', 'last_edited_time'],
    select: ['text', 'title', 'multi_select', 'status'],
    multi_select: ['text', 'title'],
    url: ['text', 'title'],
    email: ['text', 'title', 'url'],
    phone: ['text', 'title'],
    people: ['text', 'title'],
    files: ['text', 'title'],
  };

  const safe = safeConversions[fromType];
  return safe ? safe.includes(toType) : false;
}

/**
 * Get transformation warning message
 */
export function getTransformationWarning(
  fromType: PropertyType,
  toType: PropertyType,
  recordCount: number
): string | null {
  if (isTransformationSafe(fromType, toType)) {
    return null;
  }

  // Specific warnings for risky conversions
  const warnings: Record<string, Record<string, string>> = {
    rich_text: {
      number: `Converting text to number will extract only numeric values. Non-numeric text will be lost.`,
      checkbox: `Converting text to checkbox. Only "true", "yes", "1" will be checked. Other values will be unchecked.`,
      date: `Converting text to date. Invalid dates will default to today.`,
    },
    number: {
      checkbox: `Converting numbers to checkbox. Zero = unchecked, non-zero = checked.`,
      date: `Converting numbers to dates. Values will be treated as timestamps.`,
    },
    select: {
      checkbox: `Converting select to checkbox. Only certain values will be checked.`,
      number: `Converting select to number. Only numeric labels will be preserved.`,
    },
  };

  const warning = warnings[fromType]?.[toType];
  if (warning) {
    return `⚠️ ${warning} This will affect ${recordCount} record${recordCount !== 1 ? 's' : ''}.`;
  }

  return `⚠️ Converting from ${fromType} to ${toType} may result in data loss or unexpected values. This will affect ${recordCount} record${recordCount !== 1 ? 's' : ''}.`;
}
