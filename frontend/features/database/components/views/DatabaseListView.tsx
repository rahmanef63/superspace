"use client";

import {
  ListProvider,
  ListGroup,
  ListHeader,
  ListItems,
  ListItem,
  type DragEndEvent,
} from "@/components/kibo-ui/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DatabaseFeature, DatabaseStatus } from "../../types";

export interface DatabaseListViewProps {
  features: DatabaseFeature[];
  statuses: DatabaseStatus[];
  onMove?: (featureId: DatabaseFeature["id"], status: DatabaseStatus) => void;
}

export function DatabaseListView({
  features,
  statuses,
  onMove,
}: DatabaseListViewProps) {
  const resolvedStatuses: DatabaseStatus[] =
    statuses.length > 0
      ? statuses
      : [
          {
            id: "backlog",
            name: "Backlog",
            color: undefined,
          },
        ];

  const handleDragEnd = (event: DragEndEvent) => {
    if (!onMove) return;
    const { active, over } = event;
    if (!over) return;
    const status = resolvedStatuses.find((item) => item.id === over.id);
    if (!status) return;
    onMove(active.id as DatabaseFeature["id"], status);
  };

  return (
    <ListProvider className="overflow-auto" onDragEnd={handleDragEnd}>
      {resolvedStatuses.map((status) => (
        <ListGroup id={status.id} key={status.id}>
          <ListHeader
            name={status.name}
            color={
              status.color?.split(" ").pop() ?? status.id.slice(0, 6)
            }
          />
          <ListItems>
            {features
              .filter((feature) => {
                if (!feature.status) return status.id === resolvedStatuses[0].id;
                return feature.status.id === status.id;
              })
              .map((feature, index) => (
                <ListItem
                  key={feature.id}
                  id={feature.id}
                  index={index}
                  name={feature.name}
                  parent={status.id}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{feature.name}</span>
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
                  </div>
                </ListItem>
              ))}
          </ListItems>
        </ListGroup>
      ))}
    </ListProvider>
  );
}
