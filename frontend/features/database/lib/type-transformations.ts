/**
 * Property Type Transformation Rules
 * 
 * Defines how data should be transformed when a property type changes.
 * This ensures data integrity and provides smart conversions instead of data loss.
 * 
 * Transformation Matrix: 23x23 (all property type combinations)
 * 
 * @example
 * text → number: Extract numbers, remove letters
 * text → select: Split by comma, create options
 * select → checkbox: "true"/"yes"/"1" → checked, others → unchecked
 * number → text: Convert to string
 */

import type { PropertyType } from '@/frontend/shared/foundation/types/universal-database';

/**
 * Transformation result
 */
export interface TransformationResult {
  /** Transformed value ready for new property type */
  value: any;
  /** Whether transformation was successful */
  success: boolean;
  /** Warning message if data may be lost */
  warning?: string;
  /** New field options (for select/multi_select) */
  newOptions?: Array<{ id: string; label: string; color?: string }>;
}

/**
 * Transformation context
 */
export interface TransformationContext {
  /** Current value */
  value: any;
  /** Source property type */
  fromType: PropertyType;
  /** Target property type */
  toType: PropertyType;
  /** Current field options (for select types) */
  currentOptions?: Array<{ id: string; label: string; color?: string }>;
}

/**
 * Base transformation rules for common conversions
 */
export const TRANSFORMATION_RULES = {
  /**
   * TO TEXT/RICH_TEXT
   * Almost everything can be converted to text
   */
  toText: {
    from: {
      number: (value: number) => ({
        value: String(value),
        success: true,
      }),
      checkbox: (value: boolean) => ({
        value: value ? 'Yes' : 'No',
        success: true,
      }),
      date: (value: string | Date) => ({
        value: new Date(value).toLocaleDateString(),
        success: true,
      }),
      select: (value: string, options?: any[]) => {
        const option = options?.find(o => o.id === value);
        return {
          value: option?.label || value,
          success: true,
        };
      },
      multi_select: (value: string[], options?: any[]) => {
        const labels = value.map(id => {
          const option = options?.find(o => o.id === id);
          return option?.label || id;
        });
        return {
          value: labels.join(', '),
          success: true,
        };
      },
      url: (value: string) => ({
        value: value,
        success: true,
      }),
      email: (value: string) => ({
        value: value,
        success: true,
      }),
      phone: (value: string) => ({
        value: value,
        success: true,
      }),
      people: (value: string[]) => ({
        value: value.join(', '),
        success: true,
        warning: 'User references converted to text',
      }),
      files: (value: any[]) => ({
        value: value.map(f => f.name || f.url).join(', '),
        success: true,
        warning: 'File attachments converted to text',
      }),
      relation: (value: string[]) => ({
        value: `${value.length} linked records`,
        success: true,
        warning: 'Relations converted to count',
      }),
    },
  },

  /**
   * TO NUMBER
   * Extract numeric values, discard non-numeric
   */
  toNumber: {
    from: {
      text: (value: string) => {
        // Extract first number found
        const match = value.match(/-?\d+\.?\d*/);
        const num = match ? parseFloat(match[0]) : 0;
        return {
          value: num,
          success: !!match,
          warning: !match ? 'No numbers found, defaulting to 0' : undefined,
        };
      },
      checkbox: (value: boolean) => ({
        value: value ? 1 : 0,
        success: true,
      }),
      select: (value: string, options?: any[]) => {
        const option = options?.find(o => o.id === value);
        const label = option?.label || value;
        const match = label.match(/-?\d+\.?\d*/);
        const num = match ? parseFloat(match[0]) : 0;
        return {
          value: num,
          success: !!match,
          warning: !match ? 'No numbers in option, defaulting to 0' : undefined,
        };
      },
      date: (value: string | Date) => ({
        value: new Date(value).getTime(),
        success: true,
        warning: 'Date converted to timestamp',
      }),
    },
  },

  /**
   * TO SELECT
   * Create options from text values
   */
  toSelect: {
    from: {
      text: (value: string) => {
        // Split by comma, semicolon, or pipe
        const options = value
          .split(/[,;|]/)
          .map(v => v.trim())
          .filter(v => v.length > 0);
        
        if (options.length === 0) {
          return {
            value: null,
            success: true,
            warning: 'Empty value',
          };
        }
        
        // Create option for each unique value
        const uniqueOptions = [...new Set(options)];
        const newOptions = uniqueOptions.map((label, idx) => ({
          id: `option-${idx}`,
          label,
          color: undefined,
        }));
        
        return {
          value: newOptions[0]?.id || null,
          success: true,
          newOptions,
          warning: options.length > 1 ? `Found ${options.length} values, using first as selection` : undefined,
        };
      },
      multi_select: (value: string[]) => ({
        value: value[0] || null,
        success: true,
        warning: value.length > 1 ? 'Multiple values found, using first' : undefined,
      }),
      number: (value: number) => {
        const newOptions = [
          { id: 'option-0', label: String(value), color: undefined },
        ];
        return {
          value: 'option-0',
          success: true,
          newOptions,
        };
      },
      checkbox: (value: boolean) => {
        const newOptions = [
          { id: 'yes', label: 'Yes', color: 'green' },
          { id: 'no', label: 'No', color: 'gray' },
        ];
        return {
          value: value ? 'yes' : 'no',
          success: true,
          newOptions,
        };
      },
    },
  },

  /**
   * TO MULTI_SELECT
   * Create multiple options from text values
   */
  toMultiSelect: {
    from: {
      text: (value: string) => {
        // Split by comma, semicolon, or pipe
        const options = value
          .split(/[,;|]/)
          .map(v => v.trim())
          .filter(v => v.length > 0);
        
        if (options.length === 0) {
          return {
            value: [],
            success: true,
            warning: 'Empty value',
          };
        }
        
        // Create option for each unique value
        const uniqueOptions = [...new Set(options)];
        const newOptions = uniqueOptions.map((label, idx) => ({
          id: `option-${idx}`,
          label,
          color: undefined,
        }));
        
        return {
          value: newOptions.map(o => o.id),
          success: true,
          newOptions,
        };
      },
      select: (value: string) => ({
        value: value ? [value] : [],
        success: true,
      }),
    },
  },

  /**
   * TO CHECKBOX
   * Convert truthy/falsy values
   */
  toCheckbox: {
    from: {
      text: (value: string) => {
        const lower = value.toLowerCase().trim();
        const isTrue = ['true', 'yes', '1', 'checked', 'on', 'enabled'].includes(lower);
        const isFalse = ['false', 'no', '0', 'unchecked', 'off', 'disabled'].includes(lower);
        
        return {
          value: isTrue,
          success: isTrue || isFalse,
          warning: !isTrue && !isFalse ? `"${value}" not recognized, defaulting to false` : undefined,
        };
      },
      number: (value: number) => ({
        value: value !== 0,
        success: true,
        warning: 'Non-zero numbers converted to true',
      }),
      select: (value: string, options?: any[]) => {
        const option = options?.find(o => o.id === value);
        const label = (option?.label || value).toLowerCase();
        const isTrue = ['true', 'yes', '1', 'checked', 'on', 'enabled'].includes(label);
        
        return {
          value: isTrue,
          success: true,
        };
      },
    },
  },

  /**
   * TO DATE
   * Parse date strings
   */
  toDate: {
    from: {
      text: (value: string) => {
        const date = new Date(value);
        const isValid = !isNaN(date.getTime());
        
        return {
          value: isValid ? date.toISOString() : new Date().toISOString(),
          success: isValid,
          warning: !isValid ? 'Invalid date format, using today' : undefined,
        };
      },
      number: (value: number) => {
        // Assume timestamp
        const date = new Date(value);
        const isValid = !isNaN(date.getTime());
        
        return {
          value: isValid ? date.toISOString() : new Date().toISOString(),
          success: isValid,
          warning: 'Timestamp converted to date',
        };
      },
      created_time: (value: string) => ({
        value: value,
        success: true,
      }),
      last_edited_time: (value: string) => ({
        value: value,
        success: true,
      }),
    },
  },

  /**
   * TO URL
   * Validate and format URLs
   */
  toUrl: {
    from: {
      text: (value: string) => {
        const trimmed = value.trim();
        // Add https:// if no protocol
        const url = trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`;
        
        try {
          new URL(url);
          return {
            value: url,
            success: true,
          };
        } catch {
          return {
            value: trimmed,
            success: false,
            warning: 'Invalid URL format',
          };
        }
      },
      email: (value: string) => ({
        value: `mailto:${value}`,
        success: true,
      }),
    },
  },

  /**
   * TO EMAIL
   * Validate email format
   */
  toEmail: {
    from: {
      text: (value: string) => {
        const trimmed = value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(trimmed);
        
        return {
          value: trimmed,
          success: isValid,
          warning: !isValid ? 'Invalid email format' : undefined,
        };
      },
      url: (value: string) => {
        // Extract email from mailto: links
        const email = value.replace(/^mailto:/, '');
        return {
          value: email,
          success: true,
        };
      },
    },
  },

  /**
   * TO PHONE
   * Format phone numbers
   */
  toPhone: {
    from: {
      text: (value: string) => {
        // Extract digits
        const digits = value.replace(/\D/g, '');
        
        return {
          value: digits,
          success: digits.length >= 10,
          warning: digits.length < 10 ? 'Phone number may be incomplete' : undefined,
        };
      },
      number: (value: number) => ({
        value: String(value),
        success: true,
      }),
    },
  },

  /**
   * TO STATUS
   * Similar to select but with status semantics
   */
  toStatus: {
    from: {
      text: (value: string) => {
        const lower = value.toLowerCase();
        
        // Common status mappings
        const statusMap: Record<string, { label: string; color: string }> = {
          'todo': { label: 'To Do', color: 'gray' },
          'in progress': { label: 'In Progress', color: 'blue' },
          'done': { label: 'Done', color: 'green' },
          'blocked': { label: 'Blocked', color: 'red' },
          'pending': { label: 'Pending', color: 'yellow' },
        };
        
        const status = Object.entries(statusMap).find(([key]) => 
          lower.includes(key)
        );
        
        if (status) {
          const [key, data] = status;
          return {
            value: key,
            success: true,
            newOptions: Object.entries(statusMap).map(([id, data]) => ({
              id,
              label: data.label,
              color: data.color,
            })),
          };
        }
        
        // Create custom status
        return {
          value: 'status-0',
          success: true,
          newOptions: [
            { id: 'status-0', label: value, color: 'gray' },
          ],
        };
      },
      checkbox: (value: boolean) => ({
        value: value ? 'done' : 'todo',
        success: true,
        newOptions: [
          { id: 'todo', label: 'To Do', color: 'gray' },
          { id: 'done', label: 'Done', color: 'green' },
        ],
      }),
    },
  },
};

/**
 * Get transformation rule for type conversion
 */
export function getTransformationRule(
  fromType: PropertyType,
  toType: PropertyType
): ((value: any, options?: any[]) => TransformationResult) | null {
  // Same type = no transformation
  if (fromType === toType) {
    return (value: any) => ({ value, success: true });
  }
  
  // Text types (rich_text, title) are interchangeable
  const textTypes = ['rich_text', 'title'];
  if (textTypes.includes(fromType) && textTypes.includes(toType)) {
    return (value: any) => ({ value, success: true });
  }
  
  // Auto properties (read-only) - preserve value
  const autoTypes = ['created_time', 'created_by', 'last_edited_time', 'last_edited_by', 'unique_id'];
  if (autoTypes.includes(fromType)) {
    return (value: any) => ({
      value,
      success: false,
      warning: `Cannot convert from ${fromType} (auto-generated property)`,
    });
  }
  if (autoTypes.includes(toType)) {
    return (value: any) => ({
      value: null,
      success: false,
      warning: `Cannot convert to ${toType} (auto-generated property)`,
    });
  }
  
  // Complex types with no clear conversion
  const complexTypes = ['formula', 'rollup', 'relation', 'button'];
  if (complexTypes.includes(fromType) || complexTypes.includes(toType)) {
    return (value: any) => ({
      value: null,
      success: false,
      warning: 'Complex property types require manual reconfiguration',
    });
  }
  
  // Find transformation rule
  const ruleKey = `to${toType.charAt(0).toUpperCase()}${toType.slice(1).replace(/_/g, '')}`;
  const rules = (TRANSFORMATION_RULES as any)[ruleKey];
  
  if (rules && 'from' in rules) {
    const fromKey = fromType.replace(/_/g, '');
    const transformer = rules.from[fromKey];
    
    if (transformer) {
      return transformer;
    }
  }
  
  // Fallback: convert to text first, then to target type
  const toTextFrom = (TRANSFORMATION_RULES.toText.from as any)[fromType];
  if (toTextFrom && ruleKey !== 'toText') {
    const targetRules = (TRANSFORMATION_RULES as any)[ruleKey];
    const targetRule = targetRules?.from?.text;
    if (targetRule) {
      return (value: any, options?: any[]) => {
        const textResult = toTextFrom(value, options);
        if (!textResult.success) return textResult;
        return targetRule(textResult.value);
      };
    }
  }
  
  // No transformation available
  return (value: any) => ({
    value: null,
    success: false,
    warning: `No transformation rule from ${fromType} to ${toType}`,
  });
}

/**
 * Transform value when property type changes
 */
export function transformPropertyValue(context: TransformationContext): TransformationResult {
  const transformer = getTransformationRule(context.fromType, context.toType);
  
  if (!transformer) {
    return {
      value: null,
      success: false,
      warning: `No transformation available from ${context.fromType} to ${context.toType}`,
    };
  }
  
  try {
    return transformer(context.value, context.currentOptions);
  } catch (error) {
    return {
      value: null,
      success: false,
      warning: error instanceof Error ? error.message : 'Transformation failed',
    };
  }
}
