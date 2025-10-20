import * as React from "react";

export interface DateRange {
  start: string | null; // "YYYY-MM-DD"
  end: string | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (next: DateRange) => void;
  className?: string;
  labels?: { start?: string; end?: string };
}

export default function DateRangePicker({
  value = { start: null, end: null },
  onChange,
  className,
  labels = {},
}: DateRangePickerProps) {
  const [start, setStart] = React.useState<string | null>(value.start);
  const [end, setEnd] = React.useState<string | null>(value.end);

  React.useEffect(() => {
    onChange?.({ start, end });
  }, [start, end, onChange]);

  return (
    <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <label className="flex items-center gap-2">
        <span className="text-sm opacity-70">{labels.start ?? "Start"}</span>
        <input
          type="date"
          value={start ?? ""}
          onChange={(e) => setStart(e.target.value || null)}
          className="rounded-md border px-2 py-1"
        />
      </label>
      <span className="opacity-60">—</span>
      <label className="flex items-center gap-2">
        <span className="text-sm opacity-70">{labels.end ?? "End"}</span>
        <input
          type="date"
          value={end ?? ""}
          onChange={(e) => setEnd(e.target.value || null)}
          className="rounded-md border px-2 py-1"
        />
      </label>
    </div>
  );
}
