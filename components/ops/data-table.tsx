import * as React from "react";

import { cn } from "@/lib/utils";

export type OpsColumn<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type DataTableProps<T extends Record<string, unknown>> = {
  columns: OpsColumn<T>[];
  data: T[];
  className?: string;
};

function isNumericCell(value: unknown): boolean {
  if (typeof value === "number" && Number.isFinite(value)) return true;
  if (typeof value !== "string") return false;
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, className }: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-[3px] border border-border/80 bg-background/45", className)}>
      <table className="w-full border-collapse text-left font-mono text-[12px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className="sticky top-0 whitespace-nowrap border-b border-border/80 bg-card/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="group cursor-default border-b border-border/50 transition-colors last:border-0 hover:bg-primary/5"
            >
              {columns.map((col) => {
                const cellValue = row[col.accessor];
                const numeric = isNumericCell(cellValue as unknown);

                return (
                  <td
                    key={String(col.accessor)}
                    className={cn(
                      "px-3 py-2 text-muted-foreground group-hover:text-foreground",
                      numeric && "text-right font-mono tabular-nums text-foreground/90"
                    )}
                  >
                    {col.render ? col.render(cellValue, row) : String(cellValue ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
