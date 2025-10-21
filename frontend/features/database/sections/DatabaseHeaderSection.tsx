"use client";

import type { DatabaseRecord } from "../types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../lib/format";

export interface DatabaseHeaderSectionProps {
  record: DatabaseRecord;
}

export function DatabaseHeaderSection({ record }: DatabaseHeaderSectionProps) {
  const { table, stats } = record;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl leading-none">
          {table.icon ?? "📚"}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {table.name}
          </h1>
          {table.description ? (
            <p className="text-sm text-muted-foreground">
              {table.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="bg-background">
          {stats.totalRows} rows
        </Badge>
        <Badge variant="outline" className="bg-background">
          {stats.totalFields} properties
        </Badge>
        <Badge variant="outline" className="bg-background">
          {stats.totalViews} views
        </Badge>
        <span className="text-xs sm:text-sm">
          Updated {stats.lastUpdatedAt ? formatDate(new Date(stats.lastUpdatedAt)) : "recently"}
        </span>
      </div>
    </div>
  );
}
