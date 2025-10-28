import * as React from "react";

export interface PaginationProps {
  page: number;         // 1-based
  pageSize: number;
  total: number;        // total items
  onChange?: (nextPage: number) => void;
  className?: string;
}

function pageCount(total: number, size: number) {
  return Math.max(1, Math.ceil(total / Math.max(1, size)));
}

export default function Pagination({ page, pageSize, total, onChange, className }: PaginationProps) {
  const pages = pageCount(total, pageSize);
  const canPrev = page > 1;
  const canNext = page < pages;

  const go = (p: number) => onChange?.(Math.min(Math.max(1, p), pages));

  const around = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 2
  );

  const seq: (number | "...")[] = [];
  for (let i = 0; i < around.length; i++) {
    seq.push(around[i]);
    if (i < around.length - 1 && around[i + 1] - around[i] > 1) seq.push("...");
  }

  return (
    <nav className={["flex items-center gap-1", className].filter(Boolean).join(" ")} aria-label="Pagination">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => go(page - 1)}
        className="rounded border px-2 py-1 text-sm disabled:opacity-50"
      >
        Prev
      </button>

      {seq.map((it, idx) =>
        it === "..." ? (
          <span key={`dots-${idx}`} className="px-2 py-1 text-sm opacity-60 select-none">…</span>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => go(it)}
            className={[
              "rounded border px-2 py-1 text-sm",
              it === page ? "bg-neutral-900 text-white" : "hover:bg-neutral-50",
            ].join(" ")}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </button>
        )
      )}

      <button
        type="button"
        disabled={!canNext}
        onClick={() => go(page + 1)}
        className="rounded border px-2 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}
