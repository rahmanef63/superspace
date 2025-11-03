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

export interface EditableCellProps {
  field: DatabaseField | Property;
  value: unknown;
  disabled?: boolean;
  onCommit?: (value: unknown) => Promise<void> | void;
}

/**
 * Detect if field is V2 Universal Database Property
 */
const isV2Property = (field: DatabaseField | Property): field is Property => {
  return 'key' in field && 'required' in field;
};

/**
 * Render V2 editable cell using Property Registry
 */
const renderV2Editor = (
  property: Property,
  value: unknown,
  onCommit?: (value: unknown) => Promise<void> | void,
) => {
  const config = propertyRegistry.get(property.type);
  
  if (!config) {
    // Fallback to generic input
    return (
      <Input
        value={value ? String(value) : ''}
        onChange={(e) => onCommit?.(e.target.value || null)}
        className="h-8"
      />
    );
  }

  const { Editor } = config;
  
  return (
    <div className="w-full">
      <Editor
        value={value}
        property={property}
        onChange={(newValue) => {
          void onCommit?.(newValue);
        }}
      />
    </div>
  );
};

export function EditableCell({ field, value, disabled, onCommit }: EditableCellProps) {
  // V2 Universal Database: Use Property Registry Editors
  if (isV2Property(field)) {
    if (disabled) {
      return (
        <div className="w-full cursor-not-allowed rounded-md px-2 py-1 text-sm text-muted-foreground">
          <FieldValue field={field} value={value} />
        </div>
      );
    }
    return renderV2Editor(field, value, onCommit);
  }

  // V1 Legacy Database: Use old editing logic
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
      onBlur={() => void commitValue(draft.trim() === "" ? null : draft)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void commitValue(draft.trim() === "" ? null : draft);
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
