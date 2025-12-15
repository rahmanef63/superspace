/**
 * UniversalTimelineView Component
 *
 * Refactored to use the shared Gantt component.
 */

import React, { useMemo, useState, useCallback } from "react";
import {
  GanttProvider,
  GanttSidebar,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureRow,
  GanttToday,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttFeature,
  Range,
} from "@/frontend/shared/components/views/gantt";
import type { PropertyRowData, PropertyColumnConfig } from "./table-columns";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface UniversalTimelineViewProps {
  /** Array of records to display */
  records: PropertyRowData[];

  /** Array of properties for the records */
  properties: PropertyColumnConfig[];

  /** Property key for start date */
  startDateProperty?: string;

  /** Property key for end date */
  endDateProperty?: string;

  /** Property key for progress (0-100) */
  progressProperty?: string;

  /** Callback when a record's dates are changed */
  onDateRangeChange?: (
    recordId: string,
    startDate: Date,
    endDate: Date
  ) => void;

  /** Callback when a record is clicked */
  onRecordClick?: (record: PropertyRowData) => void;

  /** Initial zoom level */
  initialZoom?: string;

  /** Optional CSS class name */
  className?: string;
}

export const UniversalTimelineView: React.FC<UniversalTimelineViewProps> = ({
  records,
  properties,
  startDateProperty = "start_date",
  endDateProperty = "end_date",
  onDateRangeChange,
  onRecordClick,
  className,
}) => {
  const [range, setRange] = useState<Range>("monthly");
  const [zoom, setZoom] = useState(100);

  // Find status property for color coding
  const statusProperty = useMemo(() => {
    return properties.find(
      (prop) => prop.type === "status" || prop.type === "select"
    );
  }, [properties]);

  // Find title property
  const titleProperty = useMemo(() => {
    return (
      properties.find(
        (prop) => prop.type === "title" || (prop.type as string) === "rich_text"
      ) || properties[0]
    );
  }, [properties]);

  // Convert records to Gantt features
  const features = useMemo<GanttFeature[]>(() => {
    const validFeatures: GanttFeature[] = [];

    for (const record of records) {
      // Extract start date
      const startValue = record.properties?.[startDateProperty];
      let startDate: Date | undefined;
      if (startValue) {
        if (typeof startValue === "number" || typeof startValue === "string") {
          startDate = new Date(startValue);
        } else if (startValue instanceof Date) {
          startDate = startValue;
        }
      }

      // Extract end date
      const endValue = record.properties?.[endDateProperty];
      let endDate: Date | undefined;
      if (endValue) {
        if (typeof endValue === "number" || typeof endValue === "string") {
          endDate = new Date(endValue);
        } else if (endValue instanceof Date) {
          endDate = endValue;
        }
      }

      // Skip invalid dates
      if (
        !startDate ||
        !endDate ||
        isNaN(startDate.getTime()) ||
        isNaN(endDate.getTime())
      ) {
        continue;
      }

      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      // Get color
      let color = "#6366f1";
      let statusName = "No Status";
      if (statusProperty) {
        const statusValue = record.properties?.[statusProperty.key];
        if (
          typeof statusValue === "object" &&
          statusValue !== null &&
          "color" in statusValue
        ) {
          color = (statusValue as { color?: string }).color || color;
          statusName = (statusValue as { name?: string }).name || statusName;
        } else if (typeof statusValue === "string") {
          statusName = statusValue;
        }
      }

      // Get title
      let title = record.id;
      if (titleProperty) {
        const titleValue = record.properties?.[titleProperty.key];
        if (typeof titleValue === "string") {
          title = titleValue;
        } else if (
          titleValue &&
          typeof titleValue === "object" &&
          "text" in titleValue
        ) {
          title = (titleValue as { text: string }).text;
        }
      }

      validFeatures.push({
        id: record.id,
        name: title,
        startAt: startDate,
        endAt: endDate,
        status: {
          id: statusName,
          name: statusName,
          color,
        },
      });
    }

    return validFeatures;
  }, [records, startDateProperty, endDateProperty, statusProperty, titleProperty]);

  const handleMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (onDateRangeChange && endAt) {
        onDateRangeChange(id, startAt, endAt);
      }
    },
    [onDateRangeChange]
  );

  if (features.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="space-y-2 text-center">
            <Maximize2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No records with valid date ranges found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={range}
            onValueChange={(v) => setRange(v as Range)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(10, zoom - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="h-[600px] rounded-md border">
        <GanttProvider range={range} zoom={zoom}>
          <GanttSidebar>
            <GanttSidebarGroup name="All Items">
              {features.map((feature) => (
                <GanttSidebarItem
                  key={feature.id}
                  feature={feature}
                  onSelectItem={() =>
                    onRecordClick?.(
                      records.find((r) => r.id === feature.id)!
                    )
                  }
                />
              ))}
            </GanttSidebarGroup>
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              <GanttFeatureRow features={features} onMove={handleMove} />
            </GanttFeatureList>
            <GanttToday />
          </GanttTimeline>
        </GanttProvider>
      </div>
    </div>
  );
};

export default UniversalTimelineView;
