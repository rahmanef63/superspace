"use client";

import type { DatabaseRecord } from "../types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../lib/format";

export interface DatabaseHeaderSectionProps {
  record: DatabaseRecord;
}

export function DatabaseHeaderSection({ record }: DatabaseHeaderSectionProps) {
  const { table, stats } = record;

  // Safety: Parse table.name if it's accidentally stored as JSON object
  const tableName = (() => {
    if (typeof table.name === 'string') {
      try {
        // Check if it's a JSON string
        const parsed = JSON.parse(table.name);
        // If it's an object with a name property, extract it
        if (parsed && typeof parsed === 'object' && 'name' in parsed) {
          console.log('🏷️ [Database Name] Parsed from JSON:', {
            raw: table.name,
            extracted: parsed.name,
            tableId: table._id
          });
          return parsed.name;
        }
      } catch {
        // Not JSON, use as-is
        return table.name;
      }
    }
    
    console.log('🏷️ [Database Name] Display:', {
      name: table.name,
      tableId: table._id
    });
    
    return table.name;
  })();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl leading-none">
          {table.icon ?? "📚"}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {tableName}
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
