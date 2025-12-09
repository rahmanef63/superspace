"use client"

import React, { useState } from "react"
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Calendar,
  Clock,
  List,
  CheckSquare,
  Circle,
  Upload,
  Star,
  PenTool,
  ChevronDown,
  ChevronUp,
  Settings,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Field type definitions
const FIELD_TYPES = [
  { type: "text", label: "Text", icon: Type },
  { type: "textarea", label: "Textarea", icon: AlignLeft },
  { type: "number", label: "Number", icon: Hash },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Phone", icon: Phone },
  { type: "date", label: "Date", icon: Calendar },
  { type: "datetime", label: "Date & Time", icon: Calendar },
  { type: "time", label: "Time", icon: Clock },
  { type: "select", label: "Dropdown", icon: List },
  { type: "multiselect", label: "Multi-select", icon: List },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "radio", label: "Radio", icon: Circle },
  { type: "file", label: "File Upload", icon: Upload },
  { type: "rating", label: "Rating", icon: Star },
  { type: "signature", label: "Signature", icon: PenTool },
] as const

type FieldType = typeof FIELD_TYPES[number]["type"]

interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
    customMessage?: string
  }
  options?: { label: string; value: string }[]
  defaultValue?: any
  order: number
}

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

/**
 * Form Builder Component
 * Drag and drop interface for building forms
 */
export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [expandedField, setExpandedField] = useState<string | null>(null)

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${FIELD_TYPES.find((f) => f.type === type)?.label} Field`,
      required: false,
      order: fields.length,
      options:
        type === "select" || type === "multiselect" || type === "radio"
          ? [
              { label: "Option 1", value: "option_1" },
              { label: "Option 2", value: "option_2" },
            ]
          : undefined,
    }
    onChange([...fields, newField])
    setExpandedField(newField.id)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    )
  }

  const deleteField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id))
    if (expandedField === id) setExpandedField(null)
  }

  const duplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
      order: fields.length,
    }
    onChange([...fields, newField])
    setExpandedField(newField.id)
  }

  const moveField = (id: string, direction: "up" | "down") => {
    const index = fields.findIndex((f) => f.id === id)
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return
    }

    const newFields = [...fields]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[newFields[index], newFields[swapIndex]] = [
      newFields[swapIndex],
      newFields[index],
    ]

    // Update order values
    newFields.forEach((field, i) => {
      field.order = i
    })

    onChange(newFields)
  }

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return

    const newOption = {
      label: `Option ${(field.options?.length || 0) + 1}`,
      value: `option_${Date.now()}`,
    }
    updateField(fieldId, {
      options: [...(field.options || []), newOption],
    })
  }

  const updateOption = (
    fieldId: string,
    optionIndex: number,
    updates: { label?: string; value?: string }
  ) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field?.options) return

    const newOptions = [...field.options]
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates }
    updateField(fieldId, { options: newOptions })
  }

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field?.options) return

    const newOptions = field.options.filter((_, i) => i !== optionIndex)
    updateField(fieldId, { options: newOptions })
  }

  const getFieldIcon = (type: FieldType) => {
    const fieldType = FIELD_TYPES.find((f) => f.type === type)
    return fieldType?.icon || Type
  }

  return (
    <div className="flex gap-6">
      {/* Field Palette */}
      <div className="w-64 flex-shrink-0">
        <Card>
          <CardHeader className="py-3 px-4">
            <h3 className="font-semibold text-sm">Add Field</h3>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-1">
              {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className="h-auto py-2 px-2 flex flex-col items-center justify-center gap-1 text-xs"
                  onClick={() => addField(type)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate w-full text-center">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fields List */}
      <div className="flex-1 space-y-3">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click a field type to add it to your form
            </p>
          </div>
        ) : (
          fields
            .sort((a, b) => a.order - b.order)
            .map((field, index) => {
              const FieldIcon = getFieldIcon(field.type)
              const isExpanded = expandedField === field.id

              return (
                <Card key={field.id} className="overflow-hidden">
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={(open) =>
                      setExpandedField(open ? field.id : null)
                    }
                  >
                    {/* Field Header */}
                    <div className="flex items-center gap-2 p-3 bg-muted/50">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <FieldIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 font-medium text-sm truncate">
                        {field.label}
                      </span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs h-5">
                          Required
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveField(field.id, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveField(field.id, "down")}
                          disabled={index === fields.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => duplicateField(field)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteField(field.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    {/* Field Settings */}
                    <CollapsibleContent>
                      <CardContent className="p-4 space-y-4">
                        {/* Basic Settings */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`label-${field.id}`}>Label</Label>
                            <Input
                              id={`label-${field.id}`}
                              value={field.label}
                              onChange={(e) =>
                                updateField(field.id, { label: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`placeholder-${field.id}`}>
                              Placeholder
                            </Label>
                            <Input
                              id={`placeholder-${field.id}`}
                              value={field.placeholder || ""}
                              onChange={(e) =>
                                updateField(field.id, {
                                  placeholder: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`help-${field.id}`}>Help Text</Label>
                          <Textarea
                            id={`help-${field.id}`}
                            value={field.helpText || ""}
                            onChange={(e) =>
                              updateField(field.id, { helpText: e.target.value })
                            }
                            rows={2}
                          />
                        </div>

                        {/* Options for select/radio/checkbox */}
                        {(field.type === "select" ||
                          field.type === "multiselect" ||
                          field.type === "radio") && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            <div className="space-y-2">
                              {field.options?.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    value={option.label}
                                    onChange={(e) =>
                                      updateOption(field.id, optIndex, {
                                        label: e.target.value,
                                        value: e.target.value
                                          .toLowerCase()
                                          .replace(/\s+/g, "_"),
                                      })
                                    }
                                    placeholder="Option label"
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      deleteOption(field.id, optIndex)
                                    }
                                    disabled={
                                      (field.options?.length || 0) <= 1
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(field.id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Validation */}
                        <div className="flex items-center justify-between border-t pt-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`required-${field.id}`}
                              checked={field.required}
                              onCheckedChange={(checked) =>
                                updateField(field.id, { required: checked })
                              }
                            />
                            <Label htmlFor={`required-${field.id}`}>
                              Required field
                            </Label>
                          </div>
                        </div>

                        {/* Additional validation for number/text fields */}
                        {(field.type === "number" ||
                          field.type === "text" ||
                          field.type === "textarea") && (
                          <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                            {(field.type === "text" ||
                              field.type === "textarea") && (
                              <>
                                <div className="space-y-2">
                                  <Label>Min Length</Label>
                                  <Input
                                    type="number"
                                    value={field.validation?.minLength || ""}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        validation: {
                                          ...field.validation,
                                          minLength: parseInt(e.target.value) || undefined,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Max Length</Label>
                                  <Input
                                    type="number"
                                    value={field.validation?.maxLength || ""}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        validation: {
                                          ...field.validation,
                                          maxLength: parseInt(e.target.value) || undefined,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}
                            {field.type === "number" && (
                              <>
                                <div className="space-y-2">
                                  <Label>Min Value</Label>
                                  <Input
                                    type="number"
                                    value={field.validation?.min || ""}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        validation: {
                                          ...field.validation,
                                          min: parseInt(e.target.value) || undefined,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Max Value</Label>
                                  <Input
                                    type="number"
                                    value={field.validation?.max || ""}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        validation: {
                                          ...field.validation,
                                          max: parseInt(e.target.value) || undefined,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })
        )}
      </div>
    </div>
  )
}
