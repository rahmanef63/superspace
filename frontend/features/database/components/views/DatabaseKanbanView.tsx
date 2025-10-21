"use client";

import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@/components/kibo-ui/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DatabaseFeature, DatabaseStatus } from "../../types";
import { formatDate } from "../../lib/format";

export interface DatabaseKanbanViewProps {
  features: DatabaseFeature[];
  statuses: DatabaseStatus[];
  onMove?: (
    featureId: DatabaseFeature["id"],
    status: DatabaseStatus,
  ) => void;
}

export function DatabaseKanbanView({
  features,
  statuses,
  onMove,
}: DatabaseKanbanViewProps) {
  const resolvedStatuses =
    statuses.length > 0
      ? statuses
      : [
          {
            id: "backlog",
            name: "Backlog",
            color: undefined,
          },
        ];

  const data = features.map((feature) => ({
    ...feature,
    column: feature.status?.id ?? resolvedStatuses[0].id,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onMove) return;
    const { active, over } = event;
    if (!over) return;
    const status = resolvedStatuses.find((item) => item.id === over.id);
    if (!status) return;
    onMove(active.id as DatabaseFeature["id"], status);
  };

  return (
    <KanbanProvider
      className="p-4"
      columns={resolvedStatuses}
      data={data}
      onDragEnd={handleDragEnd}
    >
      {(column) => (
        <KanbanBoard id={column.id} key={column.id}>
          <KanbanHeader>{column.name}</KanbanHeader>
          <KanbanCards id={column.id}>
            {(feature: DatabaseFeature) => (
              <KanbanCard
                key={feature.id}
                id={feature.id}
                column={column.id}
                name={feature.name}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-tight">
                        {feature.name}
                      </p>
                      {feature.initiative ? (
                        <p className="text-xs text-muted-foreground">
                          {feature.initiative}
                        </p>
                      ) : null}
                    </div>
                    {feature.owner ? (
                      <Avatar className="h-6 w-6">
                        {feature.owner.avatarUrl ? (
                          <AvatarImage src={feature.owner.avatarUrl} />
                        ) : null}
                        <AvatarFallback>
                          {feature.owner.label.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(feature.startAt)} &mdash;{" "}
                    {formatDate(feature.endAt)}
                  </p>
                </div>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
}
