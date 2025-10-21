"use client";

import { useMemo } from "react";
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttMarker,
  GanttToday,
  GanttCreateMarkerTrigger,
} from "@/components/kibo-ui/gantt";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EyeIcon, LinkIcon, TrashIcon } from "lucide-react";
import type { DatabaseFeature, DatabaseMarker } from "../../types";

export interface DatabaseGanttViewProps {
  features: DatabaseFeature[];
  markers: DatabaseMarker[];
  onSelectFeature?: (id: DatabaseFeature["id"]) => void;
  onCopyLink?: (id: DatabaseFeature["id"]) => void;
  onRemoveFeature?: (id: DatabaseFeature["id"]) => void;
  onMoveFeature?: (
    id: DatabaseFeature["id"],
    startAt: Date,
    endAt: Date | null,
  ) => void | Promise<void>;
  onCreateMarker?: (date: Date) => void | Promise<void>;
}

const groupKey = (feature: DatabaseFeature) =>
  feature.group ?? feature.product ?? feature.initiative ?? "General";

export function DatabaseGanttView({
  features,
  markers,
  onSelectFeature,
  onCopyLink,
  onRemoveFeature,
  onMoveFeature,
  onCreateMarker,
}: DatabaseGanttViewProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, DatabaseFeature[]>();
    features
      .filter((feature) => feature.startAt && feature.endAt)
      .forEach((feature) => {
        const key = groupKey(feature);
        const existing = map.get(key) ?? [];
        existing.push(feature);
        map.set(key, existing);
      });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [features]);

  return (
    <GanttProvider className="rounded-none" range="monthly" zoom={100}>
      <GanttSidebar>
        {grouped.map(([group, items]) => (
          <GanttSidebarGroup key={group} name={group}>
            {items.map((feature) => (
              <GanttSidebarItem
                key={feature.id}
                feature={{
                  id: feature.id,
                  name: feature.name,
                  startAt: feature.startAt!,
                  endAt: feature.endAt!,
                  status: feature.status?.name ?? "Backlog",
                }}
                onSelectItem={() => onSelectFeature?.(feature.id)}
              />
            ))}
          </GanttSidebarGroup>
        ))}
      </GanttSidebar>
      <GanttTimeline>
        <GanttHeader />
        <GanttFeatureList>
          {grouped.map(([group, items]) => (
            <GanttFeatureListGroup key={group}>
              {items.map((feature) => (
                <div className="flex" key={feature.id}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={() => onSelectFeature?.(feature.id)}
                        className="flex-1 text-left"
                      >
                        <GanttFeatureItem
                          id={feature.id}
                          name={feature.name}
                          startAt={feature.startAt!}
                          endAt={feature.endAt!}
                          status={feature.status?.name ?? "Backlog"}
                          onMove={
                            onMoveFeature
                              ? (args) => {
                                  void onMoveFeature(
                                    feature.id,
                                    args.startAt,
                                    args.endAt,
                                  );
                                }
                              : undefined
                          }
                        >
                          <p className="flex-1 truncate text-xs">
                            {feature.name}
                          </p>
                          {feature.owner ? (
                            <Avatar className="h-4 w-4">
                              {feature.owner.avatarUrl ? (
                                <AvatarImage src={feature.owner.avatarUrl} />
                              ) : null}
                              <AvatarFallback>
                                {feature.owner.label.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                        </GanttFeatureItem>
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => onSelectFeature?.(feature.id)}
                        className="flex items-center gap-2"
                      >
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        View item
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onCopyLink?.(feature.id)}
                        className="flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        Copy link
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onRemoveFeature?.(feature.id)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove from roadmap
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </div>
              ))}
            </GanttFeatureListGroup>
          ))}
        </GanttFeatureList>
        {markers.map((marker) => (
          <GanttMarker key={marker.id} {...marker} />
        ))}
        <GanttToday />
        <GanttCreateMarkerTrigger
          onCreateMarker={(date) => onCreateMarker?.(date)}
        />
      </GanttTimeline>
    </GanttProvider>
  );
}
