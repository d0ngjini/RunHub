import * as React from "react";

import { cn } from "@/lib/utils";

export type OpsStatus = "success" | "warning" | "critical" | "info";

const statusStyles: Record<OpsStatus, string> = {
  success: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  warning: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  critical: "border-destructive/35 bg-destructive/15 text-red-200",
  info: "border-primary/35 bg-primary/10 text-primary",
};

export type StatusBadgeProps = {
  status: OpsStatus;
  children: React.ReactNode;
  className?: string;
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}
