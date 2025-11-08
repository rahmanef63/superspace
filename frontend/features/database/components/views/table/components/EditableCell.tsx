"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import type { DatabaseField, DatabaseSelectOption } from "../../../../types";
import { FieldValue } from "../../../FieldValue";
import { propertyRegistry } from "../../../../registry";
import type { Property } from "@/frontend/shared/foundation/types/universal-database";
import type { PropertyOptions } from "@/frontend/shared/foundation/types/property-options";
import { convertFieldToProperty } from "../../../../lib/field-converter";

const isArrayEqual = (a: unknown[], b: unknown[]) => {
  if (a.length !== b.length) return false;
  return a.every((value) => b.includes(value));
};

const normalizeToStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry) return null;
        if (typeof entry === "string") return entry;
        if (typeof entry === "object" && "id" in (entry as Record<string, unknown>)) {
          return String((entry as Record<string, unknown>).id);
        }
        if (typeof entry === "object" && "name" in (entry as Record<string, unknown>)) {
          return String((entry as Record<string, unknown>).name);
        }
        return String(entry);
      })
      .filter((entry): entry is string => Boolean(entry));
  }
  return [String(value)];
};

const toDateInputValue = (value: unknown): string => {
  if (!value) return "";
  const date =
    typeof value === "number"
      ? new Date(value)
      : typeof value === "string"
      ? new Date(value)
      : value instanceof Date
      ? value
      : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatMultiSelectPreview = (options: DatabaseSelectOption[], selected: string[]) => {
  if (!selected.length) {
    return <span className="text-xs text-muted-foreground">Empty</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {selected.map((id) => {
        const option = options.find((item) => item.id === id || item.name === id);
        if (!option) {
          return (
            <Badge key={id} variant="outline">
              {id}
            </Badge>
          );
        }
        return (
          <Badge
            key={id}
            className={cn(
              "capitalize",
              !option.color && "bg-muted text-muted-foreground",
            )}
            style={
              option.color
                ? {
                    backgroundColor: option.color,
                    color: "var(--foreground)",
                  }
                : undefined
            }
          >
            {option.name}
          </Badge>
        );
      })}
    </div>
  );
};

interface EditableCellProps {
  field: DatabaseField | Property;
  value: unknown;
  disabled?: boolean;
  onCommit?: (value: unknown) => Promise<void> | void;
  onPropertyUpdate?: (fieldId: string, options: Partial<PropertyOptions>) => Promise<void> | void;
}

/**
 * Detect if field is V2 Universal Database Property
 */
const isV2Property = (field: DatabaseField | Property): field is Property => {
  return 'key' in field && 'required' in field;
};

/**
 * V2 Editor Wrapper Component with debounced commit
 */
function V2EditorWrapper({
  property,
  value,
  onCommit,
  onPropertyUpdate,
}: {
  property: Property;
  value: unknown;
  onCommit?: (value: unknown) => Promise<void> | void;
  onPropertyUpdate?: (options: Partial<PropertyOptions>) => Promise<void> | void;
}) {
  const config = propertyRegistry.get(property.type);
  const [localValue, setLocalValue] = useState(value);
  const commitTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (commitTimeoutRef.current) {
        clearTimeout(commitTimeoutRef.current);
      }
    };
  }, []);
  
  if (!config) {
    // Fallback to generic input with local state
    const [draft, setDraft] = useState(value ? String(value) : '');
    
    useEffect(() => {
      setDraft(value ? String(value) : '');
    }, [value]);
    
    return (
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const trimmed = draft.trim();
          if (trimmed !== String(value || '')) {
            onCommit?.(trimmed || null);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = draft.trim();
            if (trimmed !== String(value || '')) {
              onCommit?.(trimmed || null);
            }
            e.currentTarget.blur();
          } else if (e.key === 'Escape') {
            setDraft(value ? String(value) : '');
            e.currentTarget.blur();
          }
        }}
        className="h-8"
      />
    );
  }

  const { Editor } = config;
  
  const handleChange = useCallback((newValue: unknown) => {
    setLocalValue(newValue);
    
    // Debounce commit - only save after user stops typing
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current);
    }
    
    // For immediate commit types (checkbox, select, etc), commit right away
    if (property.type === 'checkbox' || property.type === 'select' || property.type === 'multi_select') {
      if (JSON.stringify(newValue) !== JSON.stringify(value)) {
        onCommit?.(newValue);
      }
    } else {
      // For text inputs, debounce for 1000ms (1 second)
      commitTimeoutRef.current = setTimeout(() => {
        if (JSON.stringify(newValue) !== JSON.stringify(value)) {
          onCommit?.(newValue);
        }
      }, 1000);
    }
  }, [property.type, value, onCommit]);
  
  return (
    <div className="w-full">
      <Editor
        value={localValue}
        property={property}
        onChange={handleChange}
        onPropertyUpdate={onPropertyUpdate}
      />
    </div>
  );
}

/**
 * Render V2 editable cell using Property Registry
 */
const renderV2Editor = (
  property: Property,
  value: unknown,
  onCommit?: (value: unknown) => Promise<void> | void,
  onPropertyUpdate?: (options: Partial<PropertyOptions>) => Promise<void> | void,
) => {
  return (
    <V2EditorWrapper
      property={property}
      value={value}
      onCommit={onCommit}
      onPropertyUpdate={onPropertyUpdate}
    />
  );
};

export function EditableCell({ field, value, disabled, onCommit, onPropertyUpdate }: EditableCellProps) {
  // Auto-convert V1 DatabaseField to V2 Property for new editors
  const v2Field: Property = 'key' in field ? field : convertFieldToProperty(field as DatabaseField);
  const isV2Converted = !('key' in field);
  const fieldId = 'key' in field ? field.key : String((field as DatabaseField)._id);

  // Wrap onPropertyUpdate to include field ID
  const handlePropertyUpdate = onPropertyUpdate 
    ? (options: Partial<PropertyOptions>) => onPropertyUpdate(fieldId, options)
    : undefined;

  // Try V2 Property Registry Editor first
  if (isV2Property(field) || isV2Converted) {
    if (disabled) {
      return (
        <div className="w-full cursor-not-allowed rounded-md px-2 py-1 text-sm text-muted-foreground">
          <FieldValue field={v2Field} value={value} />
        </div>
      );
    }
    return renderV2Editor(v2Field, value, onCommit, handlePropertyUpdate);
  }

  // Fallback to V1 Legacy Editor
  console.log('⚠️ [EditableCell] Using V1 Legacy Editor');
  
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(() => (value == null ? "" : String(value)));
  const [multiDraft, setMultiDraft] = useState<string[]>(() => normalizeToStringArray(value));
  const [selectOpen, setSelectOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const options = useMemo(
    () => field.options?.selectOptions ?? [],
    [field.options?.selectOptions],
  );

  useEffect(() => {
    setDraft(value == null ? "" : String(value));
    setMultiDraft(normalizeToStringArray(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setDraft(value == null ? "" : String(value));
    setMultiDraft(normalizeToStringArray(value));
  }, [value]);

  const commitValue = useCallback(
    async (next: unknown) => {
      if (!onCommit) return;
      const prev =
        field.type === "multiSelect" ? normalizeToStringArray(value) : value ?? "";
      const nextComparable = field.type === "multiSelect" ? normalizeToStringArray(next) : next;

      const changed =
        field.type === "multiSelect"
          ? !isArrayEqual(prev as string[], nextComparable as string[])
          : JSON.stringify(prev) !== JSON.stringify(nextComparable);

      if (!changed) {
        stopEditing();
        return;
      }

      await onCommit(next);
      stopEditing();
    },
    [field.type, onCommit, stopEditing, value],
  );

  const beginEditing = useCallback(() => {
    if (disabled) return;
    if (field.type === "select" || field.type === "multiSelect") {
      setSelectOpen(true);
      return;
    }
    setIsEditing(true);
  }, [disabled, field.type]);

  if (disabled) {
    return (
      <div className="w-full cursor-not-allowed rounded-md px-2 py-1 text-sm text-muted-foreground">
        <FieldValue field={field} value={value} />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="flex h-9 w-full items-center">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => {
            void commitValue(Boolean(checked));
          }}
          className="h-4 w-4"
        />
      </div>
    );
  }

  if (field.type === "select") {
    const selectedId = normalizeToStringArray(value)[0] ?? "";
    const selectedOption = options.find(
      (option) => option.id === selectedId || option.name === selectedId,
    );

    return (
      <DropdownMenu open={selectOpen} onOpenChange={setSelectOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full justify-between rounded-md px-2 text-sm font-normal"
          >
            <span className="truncate">
              {selectedOption?.name ?? selectedId ?? "Select option"}
            </span>
            <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-52"
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => {
            event.preventDefault();
            setSelectOpen(false);
          }}
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => {
                void commitValue(option.id);
                setSelectOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedId === option.id ? "opacity-100" : "opacity-0",
                )}
              />
              {option.name}
            </DropdownMenuItem>
          ))}
          {options.length === 0 ? (
            <DropdownMenuItem disabled>No options defined</DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => {
              void commitValue(null);
              setSelectOpen(false);
            }}
            className="text-destructive focus:text-destructive"
          >
            <X className="mr-2 h-4 w-4" />
            Clear value
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (field.type === "multiSelect") {
    return (
      <DropdownMenu
        open={selectOpen}
        onOpenChange={(open) => {
          setSelectOpen(open);
          if (!open) {
            void commitValue(multiDraft);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full justify-between rounded-md px-2 text-sm font-normal"
            onClick={() => setSelectOpen(true)}
          >
            <span className="flex-1 truncate text-left">
              {formatMultiSelectPreview(options, multiDraft)}
            </span>
            <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {options.length === 0 ? (
            <DropdownMenuItem disabled>No options defined</DropdownMenuItem>
          ) : null}
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={multiDraft.includes(option.id)}
              onCheckedChange={(checked) => {
                setMultiDraft((prev) => {
                  if (checked) {
                    if (prev.includes(option.id)) return prev;
                    return [...prev, option.id];
                  }
                  return prev.filter((id) => id !== option.id);
                });
              }}
            >
              {option.name}
            </DropdownMenuCheckboxItem>
          ))}
          {multiDraft.length > 0 ? (
            <DropdownMenuItem
              onClick={() => {
                setMultiDraft([]);
                setSelectOpen(false);
                void commitValue([]);
              }}
              className="text-destructive focus:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Clear selection
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (field.type === "date") {
    const dateValue = toDateInputValue(value);
    return (
      <Input
        ref={inputRef}
        type="date"
        value={isEditing ? dateValue : dateValue}
        onFocus={beginEditing}
        onChange={(event) => {
          setIsEditing(true);
          const next = event.target.value;
          const timestamp = next ? new Date(next).getTime() : null;
          void commitValue(timestamp);
        }}
        className="h-8 w-full rounded-md"
      />
    );
  }

  if (field.type === "number") {
    if (!isEditing) {
      return (
        <button
          type="button"
          onDoubleClick={beginEditing}
          className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-muted/60 focus-visible:outline-none"
        >
          <FieldValue field={field} value={value} />
        </button>
      );
    }

    return (
      <Input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          const parsed = draft.trim() === "" ? null : Number(draft);
          void commitValue(parsed);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            const parsed = draft.trim() === "" ? null : Number(draft);
            void commitValue(parsed);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            stopEditing();
          }
        }}
        className="h-8"
      />
    );
  }

  // Default text field
  if (!isEditing) {
    return (
      <button
        type="button"
        onDoubleClick={beginEditing}
        className="flex h-8 w-full items-center rounded-md px-2 text-sm hover:bg-muted/60 focus-visible:outline-none"
      >
        <FieldValue field={field} value={value} />
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const trimmed = draft.trim();
        void commitValue(trimmed === "" ? null : trimmed);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          const trimmed = draft.trim();
          void commitValue(trimmed === "" ? null : trimmed);
        }
        if (event.key === "Escape") {
          event.preventDefault();
          stopEditing();
        }
      }}
      className="h-8"
    />
  );
}
