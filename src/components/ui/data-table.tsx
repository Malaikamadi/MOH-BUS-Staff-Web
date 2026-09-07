import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  empty = "No records to display.",
}: {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-muted text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-foreground-muted">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors hover:bg-brand-50/50",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3.5 text-ink-700", column.className)}>
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3 text-sm">
      <p className="text-foreground-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-border-strong px-3 py-1.5 text-ink-700 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded-lg border border-border-strong px-3 py-1.5 text-ink-700 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
