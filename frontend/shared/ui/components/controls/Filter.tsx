import * as React from "react";

export type FilterChip = { key: string; label: string; value: string | number | boolean };

export interface FilterProps {
  /** daftar filter aktif yang ditampilkan sebagai chip */
  chips?: FilterChip[];
  /** render kontrol filter kustom (selects, checkboxes, dsb.) */
  children?: React.ReactNode;
  /** dipanggil ketika chip dihapus */
  onRemoveChip?: (key: string) => void;
  className?: string;
}

export default function Filter({ chips = [], children, onRemoveChip, className }: FilterProps) {
  return (
    <div className={["flex flex-col gap-2", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onRemoveChip?.(c.key)}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-neutral-50"
            aria-label={`Remove ${c.label}`}
            title={`Remove ${c.label}`}
          >
            <span className="font-medium">{c.label}:</span>
            <span className="opacity-80">{String(c.value)}</span>
            <span aria-hidden>×</span>
          </button>
        ))}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
