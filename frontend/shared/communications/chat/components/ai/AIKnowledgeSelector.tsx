/**
 * AI Knowledge Selector Component
 * Selector for AI knowledge sources (wiki, documents, etc.)
 * @module shared/communications/chat/components/ai/AIKnowledgeSelector
 */

"use client";

import React from "react";
import { Book, FileText, Globe, Database, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { KnowledgeSourceType } from "../../types/ai";

export interface KnowledgeSource {
  id: KnowledgeSourceType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}

const DEFAULT_SOURCES: KnowledgeSource[] = [
  {
    id: "wiki",
    label: "Wiki",
    description: "Workspace wiki pages",
    icon: Book,
    available: true,
  },
  {
    id: "documents",
    label: "Documents",
    description: "Uploaded documents",
    icon: FileText,
    available: true,
  },
  {
    id: "files",
    label: "Files",
    description: "Workspace files",
    icon: Database,
    available: false,
  },
  {
    id: "web",
    label: "Web",
    description: "Search the web",
    icon: Globe,
    available: false,
  },
];

export interface AIKnowledgeSelectorProps {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  selectedSources: KnowledgeSourceType[];
  onSourcesChange: (sources: KnowledgeSourceType[]) => void;
  availableSources?: KnowledgeSource[];
  className?: string;
}

/**
 * AI Knowledge source selector component
 */
export function AIKnowledgeSelector({
  isEnabled,
  onEnabledChange,
  selectedSources,
  onSourcesChange,
  availableSources = DEFAULT_SOURCES,
  className,
}: AIKnowledgeSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const toggleSource = (sourceId: KnowledgeSourceType) => {
    if (selectedSources.includes(sourceId)) {
      onSourcesChange(selectedSources.filter((s) => s !== sourceId));
    } else {
      onSourcesChange([...selectedSources, sourceId]);
    }
  };

  const activeCount = selectedSources.length;
  const enabledSources = availableSources.filter((s) => s.available);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Enable/Disable toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="knowledge-toggle"
          checked={isEnabled}
          onCheckedChange={onEnabledChange}
        />
        <Label
          htmlFor="knowledge-toggle"
          className="text-sm cursor-pointer"
        >
          Knowledge
        </Label>
      </div>

      {/* Source selector */}
      {isEnabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
            >
              <Book className="h-3.5 w-3.5" />
              <span className="text-xs">
                {activeCount} source{activeCount !== 1 ? "s" : ""}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search sources..." />
              <CommandList>
                <CommandEmpty>No sources found.</CommandEmpty>
                <CommandGroup heading="Available Sources">
                  {enabledSources.map((source) => {
                    const Icon = source.icon;
                    const isSelected = selectedSources.includes(source.id);
                    return (
                      <CommandItem
                        key={source.id}
                        onSelect={() => toggleSource(source.id)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm">{source.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {source.description}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {availableSources.some((s) => !s.available) && (
                  <CommandGroup heading="Coming Soon">
                    {availableSources
                      .filter((s) => !s.available)
                      .map((source) => {
                        const Icon = source.icon;
                        return (
                          <CommandItem
                            key={source.id}
                            disabled
                            className="opacity-50"
                          >
                            <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-muted-foreground/30" />
                            <Icon className="h-4 w-4 text-muted-foreground ml-2" />
                            <div className="flex flex-col ml-2">
                              <span className="text-sm">{source.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {source.description}
                              </span>
                            </div>
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default AIKnowledgeSelector;
