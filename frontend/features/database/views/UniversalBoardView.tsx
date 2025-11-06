/**
 * Universal Board View
 * 
 * Kanban-style board view with drag-and-drop.
 * Groups records by select, status, or multi_select properties.
 * 
 * Features:
 * - Drag-and-drop cards between columns
 * - Group by any select/status/multi_select property
 * - Customizable card display
 * - Add cards to specific columns
 * - Column-based filtering
 * - Responsive horizontal scrolling
 */

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardColumn } from "./board-column";
import { BoardCard } from "./board-card";
import type { PropertyRowData, PropertyColumnConfig } from "./table-columns";
import { getPropertyConfig } from "./table-columns";

/**
 * Group definition for board columns
 */
export interface BoardGroup {
  id: string;
  title: string;
  color?: string;
}

/**
 * Universal Board View Props
 */
export interface UniversalBoardViewProps {
  /** Board data rows */
  data: PropertyRowData[];

  /** Property column configurations */
  properties: PropertyColumnConfig[];

  /** Property key to group by */
  groupBy: string;

  /** Custom groups (for select/status properties) */
  groups?: BoardGroup[];

  /** Callback when card is moved to different group */
  onCardMove?: (cardId: string, newGroupId: string) => Promise<void>;

  /** Callback when card is clicked */
  onCardClick?: (cardId: string) => void;

  /** Callback when card is deleted */
  onCardDelete?: (cardId: string) => Promise<void>;

  /** Callback when add card is clicked */
  onCardAdd?: (groupId: string) => Promise<void>;

  /** Whether to show empty groups */
  showEmptyGroups?: boolean;

  /** Whether drag is disabled */
  disableDrag?: boolean;

  /** Custom CSS class */
  className?: string;

  /** Callback when groupBy property changes */
  onGroupByChange?: (propertyKey: string) => void;
}

/**
 * Universal Board View Component
 */
export function UniversalBoardView({
  data,
  properties,
  groupBy,
  groups: customGroups,
  onCardMove,
  onCardClick,
  onCardDelete,
  onCardAdd,
  showEmptyGroups = true,
  disableDrag = false,
  className,
  onGroupByChange,
}: UniversalBoardViewProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Get the groupBy property config
  const groupByProperty = useMemo(
    () => properties.find((p) => p.key === groupBy),
    [properties, groupBy]
  );

  const groupByConfig = groupByProperty ? getPropertyConfig(groupByProperty.type) : null;

  // Determine groups based on property type
  const groups = useMemo<BoardGroup[]>(() => {
    if (customGroups) {
      return customGroups;
    }

    // Auto-generate groups from data if not provided
    const uniqueValues = new Set<string>();
    data.forEach((row) => {
      const value = row.properties[groupBy];
      if (value !== null && value !== undefined) {
        if (typeof value === "object" && "name" in value) {
          // Status property
          uniqueValues.add(value.name);
        } else if (typeof value === "string") {
          uniqueValues.add(value);
        }
      }
    });

    return Array.from(uniqueValues).map((value) => ({
      id: value,
      title: value,
    }));
  }, [customGroups, data, groupBy]);

  // Group cards by column
  const cardsByGroup = useMemo(() => {
    const grouped = new Map<string, PropertyRowData[]>();

    // Initialize all groups with empty arrays
    groups.forEach((group) => {
      grouped.set(group.id, []);
    });

    // Add "ungrouped" for items without a group value
    if (showEmptyGroups) {
      grouped.set("__ungrouped__", []);
    }

    // Distribute cards into groups
    data.forEach((row) => {
      const value = row.properties[groupBy];
      let groupId: string;

      if (value === null || value === undefined) {
        groupId = "__ungrouped__";
      } else if (typeof value === "object" && "name" in value) {
        groupId = value.name;
      } else if (typeof value === "string") {
        groupId = value;
      } else {
        groupId = "__ungrouped__";
      }

      const cards = grouped.get(groupId);
      if (cards) {
        cards.push(row);
      } else if (showEmptyGroups) {
        // Add to ungrouped if group doesn't exist
        grouped.get("__ungrouped__")?.push(row);
      }
    });

    return grouped;
  }, [data, groups, groupBy, showEmptyGroups]);

  // Get groupable properties (select, status, multi_select)
  const groupableProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.type === "select" || p.type === "status" || p.type === "multi_select"
      ),
    [properties]
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveCardId(null);

    if (!over || active.id === over.id) {
      return;
    }

    // Get the card being dragged
    const cardId = active.id as string;

    // Get the new group (over.id is the column/group id)
    const newGroupId = over.id as string;

    // Call the move callback
    if (onCardMove) {
      try {
        await onCardMove(cardId, newGroupId);
      } catch (error) {
        console.error("Failed to move card:", error);
      }
    }
  };

  // Get the active card for drag overlay
  const activeCard = useMemo(() => {
    if (!activeCardId) return null;
    return data.find((row) => row.id === activeCardId);
  }, [activeCardId, data]);

  // Visible columns (exclude empty groups if showEmptyGroups is false)
  const visibleGroups = useMemo(() => {
    if (showEmptyGroups) {
      return groups;
    }
    return groups.filter((group) => {
      const cards = cardsByGroup.get(group.id);
      return cards && cards.length > 0;
    });
  }, [groups, cardsByGroup, showEmptyGroups]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Group by:</span>
          <Select
            value={groupBy}
            onValueChange={onGroupByChange}
            disabled={!onGroupByChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groupableProperties.map((prop) => (
                <SelectItem key={prop.key} value={prop.key}>
                  {prop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground ml-4">
            {data.length} items across {visibleGroups.length} columns
          </span>
        </div>

        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          View settings
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="h-full">
            <div className="flex gap-4 p-4 h-full">
              {visibleGroups.map((group) => {
                const cards = cardsByGroup.get(group.id) || [];

                return (
                  <BoardColumn
                    key={group.id}
                    id={group.id}
                    title={group.title}
                    color={group.color}
                    cards={cards}
                    properties={properties}
                    groupBy={groupBy}
                    onCardClick={onCardClick}
                    onCardDelete={onCardDelete}
                    onAddCard={onCardAdd}
                    disableDrag={disableDrag}
                  />
                );
              })}

              {/* Ungrouped column */}
              {showEmptyGroups && cardsByGroup.has("__ungrouped__") && (
                <BoardColumn
                  id="__ungrouped__"
                  title="No Status"
                  cards={cardsByGroup.get("__ungrouped__") || []}
                  properties={properties}
                  groupBy={groupBy}
                  onCardClick={onCardClick}
                  onCardDelete={onCardDelete}
                  onAddCard={onCardAdd}
                  disableDrag={disableDrag}
                />
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Drag overlay */}
          <DragOverlay>
            {activeCard && (
              <div className="rotate-3 scale-105">
                <BoardCard
                  data={activeCard}
                  properties={properties}
                  groupBy={groupBy}
                  disableDrag={true}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export default UniversalBoardView;
