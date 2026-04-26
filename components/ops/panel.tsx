import * as React from "react";

import { cn } from "@/lib/utils";

export type PanelProps = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Panel({ title, actions, children, className }: PanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[3px] border border-border/80 bg-card/55 shadow-[0_12px_40px_rgba(0,0,0,0.24)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 bg-background/35 px-3 py-2 sm:px-3 sm:py-2">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/85">{title}</h3>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 text-[13px] text-muted-foreground">{children}</div>
    </div>
  );
}
